import { randomBytes } from "node:crypto";
import { ApiMethods } from "@gramio/types";
import { MEDIA_METHODS } from "./test";

function generateAttachId() {
	return randomBytes(12).toString("hex");
}

export function convertJsonToFormData<T extends keyof ApiMethods>(
	method: T,
	params: NonNullable<Parameters<ApiMethods[T]>[0]>,
) {
	const formData = new FormData();
	const mediaMethod = MEDIA_METHODS[method];
	if (!mediaMethod) throw new Error("no media method");

	const extractor = mediaMethod[1] || [];
	for (const extractorValue of extractor) {
		if (extractorValue.type === "union" && extractorValue.property) {
			// Элемент неявно имеет тип "any", так как выражение типа "string" не может использоваться для индексации типа
			//@ts-expect-error
			const file = params[extractorValue.property][extractorValue.name];
			if (!(file instanceof Blob)) continue;

			const attachId = generateAttachId();
			formData.set(attachId, file);

			//@ts-expect-error
			params[extractorValue.property][extractorValue.name] =
				`attach://${attachId}`;
		}
		if (extractorValue.type === "array" && extractorValue.property) {
			//@ts-expect-error
			const array = params[extractorValue.property] as any[];

			for (const [index, element] of array.entries()) {
				const file = element[extractorValue.name];

				if (!(file instanceof Blob)) continue;

				const attachId = generateAttachId();
				formData.set(attachId, file);

				//@ts-expect-error
				params[extractorValue.property][index][extractorValue.name] =
					`attach://${attachId}`;
			}
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
