import { randomBytes } from "node:crypto";
import { Readable } from "node:stream";
import { ApiMethods } from "@gramio/types";
import { Extractor, MEDIA_METHODS } from "./media-methods-helper";

export function isMediaUpload<T extends keyof ApiMethods>(
	method: T,
	params: NonNullable<Parameters<ApiMethods[T]>[0]>,
) {
	const mediaMethod = MEDIA_METHODS[method];
	if (!mediaMethod) return false;

	// [INFO] Check is params has File???
	return mediaMethod[0](params);
}

function generateAttachId() {
	return randomBytes(12).toString("hex");
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

export async function convertJsonToFormData<T extends keyof ApiMethods>(
	method: T,
	params: NonNullable<Parameters<ApiMethods[T]>[0]>,
) {
	const formData = new FormData();
	const mediaMethod = MEDIA_METHODS[method];
	if (!mediaMethod) throw new Error("no media method");

	const extractor = mediaMethod[1] || [];
	for (const extractorValue of extractor) {
		if (isExtractor(extractorValue, "union", params)) {
			let file = params[extractorValue.property][extractorValue.name];
			if (file instanceof Promise) file = await file;

			if (!(file instanceof Blob)) continue;

			const attachId = generateAttachId();
			formData.set(attachId, file);

			params[extractorValue.property][extractorValue.name] =
				`attach://${attachId}`;
		}
		if (isExtractor(extractorValue, "array", params)) {
			const array = params[extractorValue.property];

			for (const [index, element] of array.entries()) {
				let file = element[extractorValue.name];
				if (file instanceof Promise) file = await file;

				if (!(file instanceof Blob)) continue;

				const attachId = generateAttachId();
				formData.set(attachId, file);

				params[extractorValue.property][index][extractorValue.name] =
					`attach://${attachId}`;
			}
		}
	}

	for (let [key, value] of Object.entries(params)) {
		if (value instanceof Promise) value = await value;

		if (value instanceof Blob) formData.set(key, value);
		else if (typeof value === "object")
			formData.set(key, JSON.stringify(value));
		else formData.set(key, String(value));
	}

	return formData;
}

export function convertStreamToBuffer(stream: Readable): Promise<Buffer> {
	return new Promise((resolve) => {
		const chunks: Buffer[] = [];

		stream.on("data", (chunk) => chunks.push(chunk));

		stream.on("end", () => resolve(Buffer.concat(chunks)));
	});
}
