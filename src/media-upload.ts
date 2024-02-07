import fs from "node:fs/promises";
import { basename } from "node:path";
import { Readable } from "node:stream";
import { convertStreamToBuffer } from "./utils";

export class MediaUpload {
	static async path(path: string, filename?: string) {
		const buffer = await fs.readFile(path);

		return new File([buffer], filename ?? basename(path));
	}

	static async stream(stream: Readable, filename: string) {
		const buffer = await convertStreamToBuffer(stream);

		return new File([buffer], filename);
	}

	static async buffer(buffer: Buffer | ArrayBuffer, filename: string) {
		return new File([buffer], filename);
	}

	static async url(
		url: URL | string,
		filename?: string,
		options?: RequestInit,
	) {
		const res = await fetch(url, options);

		const buffer = await res.arrayBuffer();

		return new File(
			[buffer],
			filename ??
				(typeof url === "string" ? basename(url) : basename(url.pathname)),
		);
	}

	static async text(text: string, filename: string) {
		return new File([text], filename);
	}
}
