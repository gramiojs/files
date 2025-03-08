import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { File } from "node:buffer";
import { Readable } from "node:stream";
import { MediaUpload } from "../src/media-upload";
import { mockInputs, resetMocks, restoreOriginals } from "./test-utils";

describe("MediaUpload", () => {
	beforeEach(() => {
		resetMocks();
	});

	afterAll(() => {
		restoreOriginals();
	});

	describe("path", () => {
		test("should create a File from a local path", async () => {
			const mockPath = "/path/to/image.jpg";
			const mockBuffer = Buffer.from("mock file content");

			mockInputs({
				fs: {
					[mockPath]: mockBuffer,
				},
			});

			const result = await MediaUpload.path(mockPath);

			expect(result).toBeInstanceOf(File);
			expect(result.name).toBe("image.jpg");

			const arrayBuffer = await result.arrayBuffer();
			expect(Buffer.from(arrayBuffer)).toEqual(mockBuffer);
		});

		test("should use custom filename if provided", async () => {
			const mockPath = "/path/to/image.jpg";
			const customFilename = "custom.jpg";
			const mockBuffer = Buffer.from("mock file content");

			mockInputs({
				fs: {
					[mockPath]: mockBuffer,
				},
			});

			const result = await MediaUpload.path(mockPath, customFilename);

			expect(result.name).toBe(customFilename);
		});
	});

	describe("stream", () => {
		describe("Node.js Readable stream", () => {
			test("should convert a Readable stream to a File", async () => {
				const mockContent = Buffer.from("mock stream content");
				const mockStream = Readable.from([mockContent]);

				const result = await MediaUpload.stream(mockStream);

				expect(result).toBeInstanceOf(File);
				expect(result.name).toBe("file.stream");

				const text = await result.text();
				expect(text).toBe(mockContent.toString());
			});

			test("should use custom filename if provided", async () => {
				const mockContent = Buffer.from("mock stream content");
				const mockStream = Readable.from([mockContent]);
				const customFilename = "custom.stream";

				const result = await MediaUpload.stream(mockStream, customFilename);

				expect(result.name).toBe(customFilename);
			});
		});

		describe("Web API ReadableStream", () => {
			test("should convert a ReadableStream to a File", async () => {
				const mockContent = Buffer.from("web stream content");
				const webStream = new ReadableStream({
					start(controller) {
						controller.enqueue(new Uint8Array(mockContent));
						controller.close();
					},
				});

				const result = await MediaUpload.stream(webStream);

				expect(result).toBeInstanceOf(File);
				expect(result.name).toBe("file.stream");

				const text = await result.text();
				expect(text).toBe(mockContent.toString());
			});

			test("should handle custom filename with ReadableStream", async () => {
				const mockContent = Buffer.from("web stream content");
				const webStream = new ReadableStream({
					start(controller) {
						controller.enqueue(new Uint8Array(mockContent));
						controller.close();
					},
				});
				const customFilename = "web.stream";

				const result = await MediaUpload.stream(webStream, customFilename);

				expect(result.name).toBe(customFilename);
				expect(result.size).toBe(mockContent.length);
			});

			test("should handle chunked ReadableStream", async () => {
				const chunks = [
					Buffer.from("chunk1 "),
					Buffer.from("chunk2 "),
					Buffer.from("chunk3"),
				];

				const webStream = new ReadableStream({
					start(controller) {
						for (const chunk of chunks) {
							controller.enqueue(new Uint8Array(chunk));
						}
						controller.close();
					},
				});

				const result = await MediaUpload.stream(webStream);
				const expectedText = Buffer.concat(chunks).toString();

				expect(await result.text()).toBe(expectedText);
			});
		});
	});

	describe("buffer", () => {
		test("should create a File from a Buffer", () => {
			const mockBuffer = Buffer.from("mock buffer content");

			const result = MediaUpload.buffer(mockBuffer);

			expect(result).toBeInstanceOf(File);
			expect(result.name).toBe("file.buffer");
		});

		test("should use custom filename if provided", () => {
			const mockBuffer = Buffer.from("mock buffer content");
			const customFilename = "custom.buffer";

			const result = MediaUpload.buffer(mockBuffer, customFilename);

			expect(result.name).toBe(customFilename);
		});
	});

	describe("url", () => {
		test("should create a File from a URL string", async () => {
			const mockUrl = "https://example.com/image.jpg";
			const mockBlob = new Blob(["mock image content"], { type: "image/jpeg" });

			mockInputs({
				fetch: {
					[mockUrl]: { body: mockBlob },
				},
			});

			const result = await MediaUpload.url(mockUrl);

			expect(result).toBeInstanceOf(File);
			expect(result.name).toBe("image.jpg");
		});

		test("should create a File from a URL object", async () => {
			const mockUrl = new URL("https://example.com/image.jpg");
			const mockUrlString = mockUrl.toString();
			const mockBlob = new Blob(["mock image content"], { type: "image/jpeg" });

			mockInputs({
				fetch: {
					[mockUrlString]: { body: mockBlob },
				},
			});

			const result = await MediaUpload.url(mockUrl);

			expect(result).toBeInstanceOf(File);
			expect(result.name).toBe("image.jpg");
		});

		test("should use custom filename if provided", async () => {
			const mockUrl = "https://example.com/image.jpg";
			const customFilename = "custom.jpg";
			const mockBlob = new Blob(["mock image content"], { type: "image/jpeg" });

			mockInputs({
				fetch: {
					[mockUrl]: { body: mockBlob },
				},
			});

			const result = await MediaUpload.url(mockUrl, customFilename);

			expect(result.name).toBe(customFilename);
		});

		test("should pass fetch options if provided", async () => {
			const mockUrl = "https://example.com/image.jpg";
			const mockOptions = { headers: { Authorization: "Bearer token" } };
			const mockBlob = new Blob(["mock image content"], { type: "image/jpeg" });

			mockInputs({
				fetch: {
					[mockUrl]: { body: mockBlob },
				},
			});

			const result = await MediaUpload.url(mockUrl, undefined, mockOptions);

			expect(result).toBeInstanceOf(File);
		});
	});

	describe("text", () => {
		test("should create a File from text content", async () => {
			const mockText = "Hello, world!";

			const result = MediaUpload.text(mockText);

			expect(result).toBeInstanceOf(File);
			expect(result.name).toBe("text.txt");

			const text = await result.text();
			expect(text).toBe(mockText);
		});

		test("should use custom filename if provided", async () => {
			const mockText = "Hello, world!";
			const customFilename = "custom.txt";

			const result = MediaUpload.text(mockText, customFilename);

			expect(result.name).toBe(customFilename);
		});
	});
});
