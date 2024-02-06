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
		{ name: string; type?: "array"; property?: string }[]
	>
> = {};

function resolveReference(name: string) {
	const telegramObject = schema.objects.find((x) => x.name === name);

	if (!telegramObject) return [];
	return telegramObject?.properties as IBotApi.IArgument[];
}

function findInputFileInArguments(
	methodArguments: IBotApi.IArgument[],
	argumentName?: string,
) {
	const fileArguments: (typeof methods)["addStickerToSet"] = [];
	if (!methodArguments?.length) return [];

	for (const argument of methodArguments) {
		if (!argument.name) console.log(argument);
		if (argument.reference === "InputFile")
			fileArguments.push({
				name: argumentName ?? argument.name,
			});

		if (argument.any_of)
			fileArguments.push(
				...findInputFileInArguments(argument.any_of, argument.name),
			);

		if (argument.reference && argument.reference !== "InputFile")
			fileArguments.push(
				...findInputFileInArguments(resolveReference(argument.reference)),
			);

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
		methods[method.name] = [
			...new Set(findInputFileInArguments(method.arguments)),
		];
	}
}
console.log(methods);

fs.writeFile(
	"./src/test.ts",
	// await prettier.format(
	`import { ApiMethods } from "@gramio/types";
    type MethodsWithMediaUpload = {
        [Method in keyof ApiMethods]?: (params: (NonNullable<
            Parameters<ApiMethods[Method]>[0]
        >)) => any;
    };
    export const MEDIA_METHODS: MethodsWithMediaUpload = {${Object.entries(
			methods,
		)
			.map(([key, value]) => {
				// TODO:
				if (!value.length) return "";

				return `${key}: (params) => ${value
					.map((x) =>
						x.type === "array"
							? `params.${x.property}.some(x => x.${x.name})`
							: `params.${x.name}`,
					)
					.join(" || ")},`;
			})
			.join("\n")}}`,
	// { tabWidth: 4, parser: "typescript", endOfLine: "auto", semi: false },
	// ),
);
