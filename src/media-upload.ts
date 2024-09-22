import type { BinaryLike } from "node:crypto";
import fs from "node:fs/promises";
import { basename } from "node:path";
import { Readable } from "node:stream";
import { convertStreamToBuffer } from "./utils.js";

/**
 * Class-helper with static methods for file uploading.
 *
 * [Documentation](https://gramio.dev/files/media-upload.html)
 */
export class MediaUpload {
	/**
	 * Method for uploading Media File by local path.
	 */
	static async path(path: string, filename?: string) {
		const buffer = await fs.readFile(path);

		return new File([buffer], filename ?? basename(path));
	}

	/**
	 * Method for uploading Media File by Readable stream.
	 */
	static async stream(
		stream: Readable | ReadableStream,
		filename = "file.stream",
	) {
		const buffer = await convertStreamToBuffer(Readable.from(stream));

		return new File([buffer], filename);
	}

	/**
	 * Method for uploading Media File by BinaryLike (Buffer or ArrayBuffer and etc).
	 */
	static buffer(
		buffer: Exclude<BinaryLike, string>,
		filename = "file.buffer",
	): File {
		return new File([buffer], filename);
	}

	/**
	 * Method for uploading Media File by URL (also with fetch options).
	 */
	static async url(
		url: URL | string,
		filename?: string,
		options?: RequestInit,
	) {
		const res = await fetch(url, options);

		return new File(
			[await res.blob()],
			filename ??
				(typeof url === "string" ? basename(url) : basename(url.pathname)),
		);
	}

	/**
	 * Method for uploading Media File by text content.
	 */
	static text(text: string, filename = "text.txt") {
		return new File([text], filename);
	}
}
