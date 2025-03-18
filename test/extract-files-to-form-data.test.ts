import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { extractFilesToFormData } from "../src/utils";
import { resetMocks, restoreOriginals } from "./test-utils";

describe("extractFilesToFormData", () => {
	beforeEach(() => {
		resetMocks();
	});

	afterAll(() => {
		restoreOriginals();
	});

	test("should handle simple file in root params", async () => {
		const mockFile = new File(["content"], "photo.jpg");
		const params = { chat_id: 123, photo: mockFile, caption: "Test" };

		const [formData, modifiedParams] = await extractFilesToFormData(
			"sendPhoto",
			params,
		);

		expect(formData.get("photo")).toBeInstanceOf(File);
		expect(formData.get("photo")).toEqual(mockFile);
		expect(modifiedParams.caption).toBe("Test");
		expect(modifiedParams.photo).toBeUndefined();
	});

	test("should handle nested file in union type", async () => {
		const mockFile = new File(["content"], "media.mp4");
		const params = {
			chat_id: 123,
			media: {
				type: "video" as const,
				media: mockFile,
				thumbnail: "https://example.com/thumb.jpg",
			},
		};

		const [formData, modifiedParams] = await extractFilesToFormData(
			"editMessageMedia",
			params,
		);

		expect(formData.get("file-0")).toEqual(mockFile);
		expect(modifiedParams.media.media).toBe("attach://file-0");
		// @ts-expect-error
		expect(modifiedParams.media.thumbnail).toBe(
			"https://example.com/thumb.jpg",
		);
	});

	test("should handle array of files", async () => {
		const files = [new File(["1"], "doc1.pdf"), new File(["2"], "doc2.pdf")];
		const params = {
			chat_id: 123,
			media: files.map((file) => ({
				type: "document" as const,
				media: file,
				caption: "Document",
			})),
		};

		const [formData, modifiedParams] = await extractFilesToFormData(
			"sendMediaGroup",
			params,
		);

		expect(formData.get("file-0")).toEqual(files[0]);
		expect(formData.get("file-1")).toEqual(files[1]);
		expect(modifiedParams.media[0].media).toBe("attach://file-0");
		expect(modifiedParams.media[1].media).toBe("attach://file-1");
	});

	// TODO: We deprecate this
	test("should handle promise files", async () => {
		const mockFile = Promise.resolve(new File(["content"], "sticker.webp"));
		const params = { chat_id: 123, sticker: mockFile };

		const [formData, modifiedParams] = await extractFilesToFormData(
			"sendSticker",
			params,
		);

		expect(formData.get("sticker")).toBeInstanceOf(File);
		expect(formData.get("sticker")).toEqual(await mockFile);
		expect(modifiedParams.sticker).toBeUndefined();
	});

	test("should return empty form data when no files found", async () => {
		const params = { text: "Hello", chat_id: 123 };
		const [formData, modifiedParams] = await extractFilesToFormData(
			"sendMessage",
			params,
		);

		expect([...formData.entries()]).toEqual([]);
		expect(modifiedParams).toEqual(params);
	});
});
