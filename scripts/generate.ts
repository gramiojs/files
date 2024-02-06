import fs from "node:fs/promises";
import { ApiMethods } from "@gramio/types";
import prettier from "prettier";
import { IBotApi } from "./types";
const SCHEMA_FILE_PATH = "./tg-bot-api/public/dev/custom.min.json";

const schemaFile = await fs.readFile(SCHEMA_FILE_PATH);
const schema = JSON.parse(String(schemaFile)) as IBotApi.ISchema;

const methods: Partial<
	Record<
		keyof ApiMethods,
		{ name: string; type?: "array" | "union"; property?: string }[]
	>
> = {};

function resolveReference(name: string) {
	const telegramObject = schema.objects.find((x) => x.name === name);

	if (!telegramObject) return [false, false] as const;
	return [
		(telegramObject?.properties ||
			telegramObject.any_of) as IBotApi.IArgument[],
		"properties" in telegramObject ? "properties" : "any_of",
	] as const;
}

function findInputFileInArguments(
	methodArguments: IBotApi.IArgument[],
	argumentName?: string,
) {
	const fileArguments: (typeof methods)["addStickerToSet"] = [];
	if (!methodArguments?.length) return [];

	for (const argument of methodArguments) {
		if (argument.reference === "InputFile")
			fileArguments.push({
				name: argumentName ?? argument.name,
			});

		if (argument.any_of)
			fileArguments.push(
				...findInputFileInArguments(argument.any_of, argument.name),
			);

		if (argument.reference && argument.reference !== "InputFile") {
			const [referenceArguments, type] = resolveReference(argument.reference);

			if (referenceArguments || type)
				fileArguments.push(
					...findInputFileInArguments(referenceArguments).map((x) => ({
						name: x.name,
						property: type === "any_of" ? argument.name : undefined,
						type: type === "any_of" ? ("union" as const) : undefined,
					})),
				);
		}

		if (argument.array)
			fileArguments.push(
				...findInputFileInArguments([argument.array], argument.name).map(
					(x) =>
						({
							name: x.name,
							type: "array",
							property: argument.name,
						}) as const,
				),
			);
	}

	return fileArguments;
}

for (const method of schema.methods) {
	if (method.multipart_only && method.arguments?.length) {
		if (method.name === "editMessageMedia")
			console.log(
				findInputFileInArguments(method.arguments),
				resolveReference("InputMedia"),
			);
		// [INFO] Find only unique values (inspired by https://yagisanatode.com/get-a-unique-list-of-objects-in-an-array-of-object-in-javascript/)
		methods[method.name] = [
			...new Map(
				findInputFileInArguments(method.arguments).map((item) => [
					item.name,
					item,
				]),
			).values(),
		];
	}
}

fs.writeFile(
	"./src/test.ts",
	await prettier.format(
		`import { ApiMethods, TelegramInputFile } from "@gramio/types";

    type MethodsWithMediaUpload = {
        [Method in keyof ApiMethods]?: (params: (NonNullable<
            Parameters<ApiMethods[Method]>[0]
        >)) => boolean;
    };

	function isFile(file?: TelegramInputFile | string) {
		if(!file || typeof file === "string") return false;

		return file instanceof File;
	}

    export const MEDIA_METHODS: MethodsWithMediaUpload = {${Object.entries(
			methods,
		)
			.map(([key, value]) => {
				return `${key}: (params) => ${value
					.map((x) =>
						x.type === "array"
							? `params.${x.property}.some(x => "${x.name}" in x && isFile(x.${x.name}))`
							: `${
									x.type === "union"
										? `"${x.name}" in params${
												x.property ? `.${x.property}` : ""
										  } && `
										: ""
							  }isFile(params.${
									x.property ? `${x.property}.${x.name}` : `${x.name}`
							  })`,
					)
					.join(" || ")},`;
			})
			.join("\n")}}`,
		{ tabWidth: 4, parser: "typescript", endOfLine: "auto", semi: false },
	),
);
