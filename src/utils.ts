import { randomBytes } from "node:crypto";
import { ApiMethods } from "@gramio/types";
import { MEDIA_METHODS } from "./test";

function generateAttachId() {
	return randomBytes(12).toString("hex");
}

export function convertJsonToFormData(
	method: keyof ApiMethods,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	params: Record<string, any>,
) {
	const formData = new FormData();
	const mediaMethod = MEDIA_METHODS[method];
	if (!mediaMethod) throw new Error("no media method");

	const extractor = mediaMethod[1];
	if (extractor?.type === "union" && extractor.property) {
		let file = params[extractor.property][extractor.name];
		const attachId = generateAttachId();
		formData.set(attachId, file);
		file = `attach://${attachId}`;
	}
	if (extractor?.type === "array" && extractor.property) {
		const array = params[extractor.property][extractor.name];
		for (let file of array) {
			const attachId = generateAttachId();
			formData.set(attachId, file);
			file = `attach://${attachId}`;
		}
	}

	for (const [key, value] of Object.entries(params)) {
		if (value instanceof Blob) formData.set(key, value);
		else if (typeof value === "object")
			formData.set(key, JSON.stringify(value));
		else formData.set(key, String(value));
	}

	return formData;
}
