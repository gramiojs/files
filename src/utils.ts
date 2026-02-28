import type { Readable } from "node:stream";
import type { APIMethodParams, APIMethods } from "@gramio/types";
import { type Extractor, MEDIA_METHODS } from "./media-methods-helper.js";

/** Guard to check is method used for File Uploading */
export function isMediaUpload<T extends keyof APIMethods>(
	method: T,
	params: NonNullable<APIMethodParams<T>>,
) {
	const mediaMethod = MEDIA_METHODS[method];
	if (!mediaMethod) return false;

	// [INFO] Check is params has File???
	return mediaMethod[0](params);
}

interface ExtractorTypings<T = Record<string, Promise<File> | File | string>> {
	union: Record<string, T>;
	array: Record<string, T[]>;
}

function isExtractor<T extends keyof ExtractorTypings>(
	value: Extractor,
	type: T,
	params: unknown,
): params is ExtractorTypings[T] {
	return value.type === type;
}

/**
 * Helper to convert JSON to FormData that can accept Telegram Bot API.
 * if File is not top-level property it will be `“attach://<file_attach_name>”`
 *
 * [Documentation](https://core.telegram.org/bots/api#inputfile)
 */
export async function convertJsonToFormData<T extends keyof APIMethods>(
	method: T,
	params: NonNullable<APIMethodParams<T>>,
) {
	const formData = new FormData();
	const mediaMethod = MEDIA_METHODS[method];
	const extractor = mediaMethod?.[1] ?? [];

	let attachId = 0;
	for (const extractorValue of extractor) {
		if (isExtractor(extractorValue, "union", params)) {
			let file = params[extractorValue.property][extractorValue.name];
			if (file instanceof Promise) file = await file;

			if (!(file instanceof Blob)) continue;

			const currentAttachId = attachId++;
			formData.set(`file-${currentAttachId}`, file);

			params[extractorValue.property][extractorValue.name] =
				`attach://file-${currentAttachId}`;
		}
		if (isExtractor(extractorValue, "array", params)) {
			const array = params[extractorValue.property];

			for (const [index, element] of array.entries()) {
				let file = element[extractorValue.name];
				if (file instanceof Promise) file = await file;

				if (!(file instanceof Blob)) continue;

				const currentAttachId = attachId++;
				formData.set(`file-${currentAttachId}`, file);

				params[extractorValue.property][index][extractorValue.name] =
					`attach://file-${currentAttachId}`;
			}
		}
	}

	for (let [key, value] of Object.entries(params)) {
		if (value instanceof Promise) value = await value;

		if (value === undefined) continue;

		if (value instanceof Blob) formData.append(key, value);
		else if (typeof value === "object")
			formData.append(key, JSON.stringify(value));
		else formData.append(key, String(value));
	}

	return formData;
}

/**
 * Helper to extract files from params and convert them to FormData. (Similar to {@link convertJsonToFormData})
 * if File is not top-level property it will be `“attach://<file_attach_name>”`
 *
 * [Documentation](https://core.telegram.org/bots/api#inputfile)
 */
export async function extractFilesToFormData<T extends keyof APIMethods>(
	method: T,
	params: NonNullable<APIMethodParams<T>>,
): Promise<[FormData | undefined, NonNullable<APIMethodParams<T>>]> {
	const formData = new FormData();
	let isEmpty = true;
	const mediaMethod = MEDIA_METHODS[method];
	const extractor = mediaMethod?.[1] ?? [];

	let attachId = 0;
	for (const extractorValue of extractor) {
		if (isExtractor(extractorValue, "union", params)) {
			let file = params[extractorValue.property][extractorValue.name];
			if (file instanceof Promise) file = await file;

			if (!(file instanceof Blob)) continue;

			const currentAttachId = attachId++;
			formData.set(`file-${currentAttachId}`, file);
			isEmpty = false;

			params[extractorValue.property][extractorValue.name] =
				`attach://file-${currentAttachId}`;
		}
		if (isExtractor(extractorValue, "array", params)) {
			const array = params[extractorValue.property];

			for (const [index, element] of array.entries()) {
				let file = element[extractorValue.name];
				if (file instanceof Promise) file = await file;

				if (!(file instanceof Blob)) continue;

				const currentAttachId = attachId++;
				formData.set(`file-${currentAttachId}`, file);
				isEmpty = false;

				params[extractorValue.property][index][extractorValue.name] =
					`attach://file-${currentAttachId}`;
			}
		}
	}

	for (let [key, value] of Object.entries(params)) {
		if (value instanceof Promise) value = await value;

		if (value === undefined) continue;

		if (value instanceof Blob) {
			formData.append(key, value);
			isEmpty = false;

			// @ts-expect-error
			delete params[key];
		}
	}

	return [isEmpty ? undefined : formData, params];
}

// TODO: Avoid this and imagine how to use ReadableStream directly
// But there no ways...
/** Helper for convert Readable stream to buffer */
export function convertStreamToBuffer(stream: Readable): Promise<Buffer> {
	return new Promise((resolve) => {
		const chunks: Buffer[] = [];

		stream.on("data", (chunk) => {
			const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
			chunks.push(bufferChunk);
		});

		stream.on("end", () => resolve(Buffer.concat(chunks)));
	});
}
