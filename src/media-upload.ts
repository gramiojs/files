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
	static async path(path: string, filename?: string): Promise<File> {
		const buffer = await fs.readFile(path);

		return new File([new Uint8Array(buffer)], filename ?? basename(path));
	}

	/**
	 * Method for uploading Media File by Readable stream.
	 */
	static async stream(
		stream: Readable | ReadableStream,
		filename = "file.stream",
	): Promise<File> {
		// TODO: avoid Readable.from
		const buffer = await convertStreamToBuffer(Readable.from(stream));

		return new File([new Uint8Array(buffer)], filename);
	}

	/**
	 * Method for uploading Media File by BinaryLike (Buffer or ArrayBuffer and etc).
	 */
	static buffer(
		buffer: Exclude<BufferSource | ArrayBuffer, string>,
		filename = "file.buffer",
	): File {
		const blobPart = ArrayBuffer.isView(buffer)
			? new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
			: buffer;

		return new File([blobPart], filename);
	}

	/**
	 * Method for uploading Media File by URL (also with fetch options).
	 */
	static async url(
		url: URL | string,
		filename?: string,
		options?: RequestInit,
	): Promise<File> {
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
	static text(text: string, filename = "text.txt"): File {
		return new File([text], filename);
	}
}
