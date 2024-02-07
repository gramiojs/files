import fs from "node:fs/promises";
import { basename } from "node:path";
import { Readable } from "node:stream";
import { convertStreamToBuffer } from "./utils";

export class MediaUpload {
	/**
	 * Method for uploading Media File by local path
	 */
	static async path(path: string, filename?: string) {
		const buffer = await fs.readFile(path);

		return new File([buffer], filename ?? basename(path));
	}

	/**
	 * Method for uploading Media File by Readable stream
	 */
	static async stream(stream: Readable, filename: string) {
		const buffer = await convertStreamToBuffer(stream);

		return new File([buffer], filename);
	}

	/**
	 * Method for uploading Media File by Buffer or ArrayBuffer
	 */
	static buffer(buffer: Buffer | ArrayBuffer, filename: string) {
		return new File([buffer], filename);
	}

	/**
	 * Method for uploading Media File by URL (also with fetch options)
	 */
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

	/**
	 * Method for uploading Media File by text content
	 */
	static text(text: string, filename: string) {
		return new File([text], filename);
	}
}
