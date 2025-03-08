import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { resetMocks, restoreOriginals } from "./test-utils";

import { Readable } from "node:stream";
import { convertStreamToBuffer } from "../src/utils";

describe("utils", () => {
	beforeEach(() => {
		resetMocks();
	});

	afterAll(() => {
		restoreOriginals();
	});

	describe("convertStreamToBuffer", () => {
		test("should convert a Readable stream to a Buffer", async () => {
			const testContent = Buffer.from("Hello, world!");
			const stream = Readable.from([testContent]);

			const result = await convertStreamToBuffer(stream);

			expect(result).toBeInstanceOf(Buffer);
			expect(result.toString()).toBe(testContent.toString());
		});

		test("should handle empty streams", async () => {
			const stream = Readable.from([]);

			const result = await convertStreamToBuffer(stream);

			expect(result).toBeInstanceOf(Buffer);
			expect(result.toString()).toBe("");
			expect(result.length).toBe(0);
		});

		test("should concatenate multiple chunks", async () => {
			const chunks = [
				Buffer.from("chunk1"),
				Buffer.from("chunk2"),
				Buffer.from("chunk3"),
			];
			const stream = Readable.from(chunks);

			const result = await convertStreamToBuffer(stream);

			expect(result).toBeInstanceOf(Buffer);
			expect(result.toString()).toBe(Buffer.concat(chunks).toString());
		});

		test("should handle binary data", async () => {
			const binaryData = Buffer.from([0x01, 0x02, 0x03, 0x04]);
			const stream = Readable.from([binaryData]);

			const result = await convertStreamToBuffer(stream);

			expect(result).toBeInstanceOf(Buffer);
			expect(Buffer.compare(result, binaryData)).toBe(0);
		});

		test("should convert string chunks to buffers", async () => {
			const textChunk = "Hello, world!";
			const stream = Readable.from([textChunk]);

			const result = await convertStreamToBuffer(stream);

			expect(result).toBeInstanceOf(Buffer);
			expect(result.toString()).toBe(textChunk);
		});
	});
});
