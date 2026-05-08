import fs from "node:fs/promises";
import {
	type CustomSchema,
	type Field,
	getCustomSchema,
} from "@gramio/schema-parser";
import type { APIMethods } from "@gramio/types";
import prettier from "prettier";

const schema: CustomSchema = await getCustomSchema();

type Discriminator = { key: string; value: string };
type Found = {
	name: string;
	type?: "array" | "union";
	property?: string;
	discriminator?: Discriminator;
};

const methods: Partial<Record<keyof APIMethods, Found[]>> = {};

function resolveReference(name: string) {
	const obj = schema.objects.find((x) => x.name === name);
	if (!obj) return [false, false] as const;
	if (obj.type === "fields") return [obj.fields, "fields"] as const;
	if (obj.type === "oneOf") return [obj.oneOf, "oneOf"] as const;
	return [false, false] as const;
}

function findDiscriminator(fields: Field[]): Discriminator | undefined {
	for (const f of fields) {
		if (f.type === "string" && f.const) return { key: f.key, value: f.const };
	}
	return undefined;
}

// Files declared directly on the given fields, without descending into references.
// Detects: `key: InputFile`, `key: string named "media"`, and `key: InputFile or String`.
function findImmediate(fields: Field[]): { name: string }[] {
	const out: { name: string }[] = [];
	for (const f of fields) {
		if (f.type === "reference" && f.reference.name === "InputFile") {
			out.push({ name: f.key });
		} else if (f.type === "string" && f.key === "media") {
			out.push({ name: f.key });
		} else if (
			f.type === "one_of" &&
			f.variants.some(
				(v) => v.type === "reference" && v.reference.name === "InputFile",
			)
		) {
			out.push({ name: f.key });
		}
	}
	return out;
}

function isInputFileRef(field: Field) {
	return field.type === "reference" && field.reference.name === "InputFile";
}

function processArrayOf(arrayOf: Field, arrayKey: string): Found[] {
	const wrap = (name: string): Found => ({
		name,
		type: "array",
		property: arrayKey,
	});

	if (arrayOf.type === "reference") {
		if (arrayOf.reference.name === "InputFile") return [wrap(arrayKey)];
		const [refFields, kind] = resolveReference(arrayOf.reference.name);
		if (refFields && kind === "fields") {
			return findImmediate(refFields).map((x) => wrap(x.name));
		}
		if (refFields && kind === "oneOf") {
			return refFields.flatMap((v) => {
				if (v.type !== "reference") return [];
				if (v.reference.name === "InputFile") return [wrap(arrayKey)];
				const [vf, vk] = resolveReference(v.reference.name);
				if (vf && vk === "fields")
					return findImmediate(vf).map((x) => wrap(x.name));
				return [];
			});
		}
	}
	if (arrayOf.type === "one_of") {
		return arrayOf.variants.flatMap((v) => {
			if (v.type !== "reference") return [];
			if (v.reference.name === "InputFile") return [wrap(arrayKey)];
			const [vf, vk] = resolveReference(v.reference.name);
			if (vf && vk === "fields")
				return findImmediate(vf).map((x) => wrap(x.name));
			return [];
		});
	}
	return [];
}

function findFiles(parameters: Field[]): Found[] {
	const out: Found[] = [];

	for (const param of parameters) {
		// Direct top-level file
		if (isInputFileRef(param) || (param.type === "string" && param.key === "media")) {
			out.push({ name: param.key });
			continue;
		}

		// Inline one_of at param level (e.g. `photo: InputFile or String`)
		if (param.type === "one_of") {
			for (const variant of param.variants) {
				if (isInputFileRef(variant)) {
					out.push({ name: param.key });
					break;
				}
			}
			continue;
		}

		// Reference to another object — resolve and find files at the next level
		if (param.type === "reference") {
			const [refFields, kind] = resolveReference(param.reference.name);
			if (refFields && kind === "fields") {
				// params.X.<inner> access — type undefined (top-level extractor pattern)
				out.push(
					...findImmediate(refFields).map((x) => ({
						name: x.name,
						property: param.key,
					})),
				);
			} else if (refFields && kind === "oneOf") {
				for (const variant of refFields) {
					if (variant.type !== "reference") continue;
					if (variant.reference.name === "InputFile") {
						out.push({
							name: param.key,
							property: param.key,
							type: "union",
						});
						continue;
					}
					const [vFields, vKind] = resolveReference(variant.reference.name);
					if (vFields && vKind === "fields") {
						const disc = findDiscriminator(vFields);
						out.push(
							...findImmediate(vFields).map((x) => ({
								name: x.name,
								property: param.key,
								type: "union" as const,
								discriminator: disc,
							})),
						);
					}
				}
			}
			continue;
		}

		if (param.type === "array") {
			out.push(...processArrayOf(param.arrayOf, param.key));
		}
	}

	return out;
}

for (const method of schema.methods) {
	if (!method.hasMultipart || !method.parameters?.length) continue;
	const raw = findFiles(method.parameters);

	// Same field name appearing under multiple variants of the same parent
	// (different discriminators) can't be checked with `params.X.type === "..."`;
	// fall back to `"name" in params.X`. Dedup by parent+name so methods with
	// two distinct parents holding the same file name (e.g. sendPoll has both
	// `media` and `explanation_media: InputPollMedia`) keep both entries.
	const conflicts = new Set<string>();
	const byKey = new Map<string, Found>();
	const keyOf = (f: Found) => `${f.property ?? ""}::${f.name}`;
	for (const f of raw) {
		const k = keyOf(f);
		const existing = byKey.get(k);
		if (!existing) {
			byKey.set(k, f);
			continue;
		}
		const a = existing.discriminator;
		const b = f.discriminator;
		if (!a || !b || a.key !== b.key || a.value !== b.value) {
			conflicts.add(k);
		}
	}

	const found = [...byKey.values()].map((f) =>
		conflicts.has(keyOf(f)) ? { ...f, discriminator: undefined } : f,
	);

	if (found.length) methods[method.name as keyof APIMethods] = found;
}

function getPathToInputFile(values: Found[]) {
	if (values.some((x) => x.type !== "array" && x.type !== "union"))
		return "null";

	return JSON.stringify(
		values.map((value) => ({
			name: value.name,
			property: value.property,
			type: value.type,
		})),
		null,
		2,
	);
}

function predicate(x: Found): string {
	if (x.type === "array") {
		return `params.${x.property}.some(x => "${x.name}" in x && isBlob(x.${x.name}))`;
	}
	if (x.type === "union") {
		const access = x.property
			? `params.${x.property}.${x.name}`
			: `params.${x.name}`;
		if (x.discriminator && x.property) {
			return `params.${x.property}?.${x.discriminator.key} === "${x.discriminator.value}" && isBlob(${access})`;
		}
		const guard = x.property
			? `!!params.${x.property} && "${x.name}" in params.${x.property} && `
			: `"${x.name}" in params && `;
		return `${guard}isBlob(${access})`;
	}
	return `isBlob(params.${x.property ? `${x.property}.${x.name}` : x.name})`;
}

fs.writeFile(
	"./src/media-methods-helper.ts",
	await prettier.format(
		/* ts */ `
	import { APIMethods, APIMethodParams, TelegramInputFile } from "@gramio/types";


	export type Extractor = { name: string; type: "array" | "union"; property: string };
    type MethodsWithMediaUpload = {
        [Method in keyof APIMethods]?: [(params: (NonNullable<APIMethodParams<Method>>)) => boolean, Extractor[] | null];
    };

	let isWarned = false;

	/** Guard to check is it {@link Blob} or {@link Promise} */
	export function isBlob(blob?: TelegramInputFile | object | string) {
		if (!blob || typeof blob !== "object") return false;

		if (blob instanceof Promise) {
			if (!isWarned) {
				const error = new Error(
					"Promise<File> is deprecated. Please put await before.",
				);
				console.warn(error);
				isWarned = true;
			}
			return true;
		}

		return blob instanceof Blob;
	}

	/**
	 * A set of methods with the function of checking whether a {@link File} has been passed in the parameters
	 *
	 * @codegenerated
	 * */
    export const MEDIA_METHODS: MethodsWithMediaUpload = {${Object.entries(methods)
		.map(([key, value]) => {
			return `${key}: [(params) => ${value
				.map(predicate)
				.join(" || ")}, ${getPathToInputFile(value)}],`;
		})
		.join("\n")}}`,
		{ tabWidth: 4, parser: "typescript", endOfLine: "auto", semi: false },
	),
);
