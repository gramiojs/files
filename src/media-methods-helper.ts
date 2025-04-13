import type {
	APIMethodParams,
	APIMethods,
	TelegramInputFile,
} from "@gramio/types";

export type Extractor = {
	name: string;
	type: "array" | "union";
	property: string;
};
type MethodsWithMediaUpload = {
	[Method in keyof APIMethods]?: [
		(params: NonNullable<APIMethodParams<Method>>) => boolean,
		Extractor[] | null,
	];
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
export const MEDIA_METHODS: MethodsWithMediaUpload = {
	setWebhook: [(params) => isBlob(params.certificate), null],
	sendPhoto: [(params) => isBlob(params.photo), null],
	sendAudio: [
		(params) => isBlob(params.audio) || isBlob(params.thumbnail),
		null,
	],
	sendDocument: [
		(params) => isBlob(params.document) || isBlob(params.thumbnail),
		null,
	],
	sendVideo: [
		(params) => isBlob(params.video) || isBlob(params.thumbnail),
		null,
	],
	sendAnimation: [
		(params) => isBlob(params.animation) || isBlob(params.thumbnail),
		null,
	],
	sendVoice: [(params) => isBlob(params.voice), null],
	sendVideoNote: [
		(params) => isBlob(params.video_note) || isBlob(params.thumbnail),
		null,
	],
	sendPaidMedia: [
		(params) =>
			params.media.some((x) => "media" in x && isBlob(x.media)) ||
			params.media.some((x) => "cover" in x && isBlob(x.cover)) ||
			params.media.some((x) => "thumbnail" in x && isBlob(x.thumbnail)),
		[
			{
				name: "media",
				property: "media",
				type: "array",
			},
			{
				name: "cover",
				property: "media",
				type: "array",
			},
			{
				name: "thumbnail",
				property: "media",
				type: "array",
			},
		],
	],
	sendMediaGroup: [
		(params) =>
			params.media.some((x) => "media" in x && isBlob(x.media)) ||
			params.media.some((x) => "thumbnail" in x && isBlob(x.thumbnail)) ||
			params.media.some((x) => "cover" in x && isBlob(x.cover)),
		[
			{
				name: "media",
				property: "media",
				type: "array",
			},
			{
				name: "thumbnail",
				property: "media",
				type: "array",
			},
			{
				name: "cover",
				property: "media",
				type: "array",
			},
		],
	],
	setChatPhoto: [(params) => isBlob(params.photo), null],
	editMessageMedia: [
		(params) =>
			("media" in params.media && isBlob(params.media.media)) ||
			("thumbnail" in params.media && isBlob(params.media.thumbnail)) ||
			("cover" in params.media && isBlob(params.media.cover)),
		[
			{
				name: "media",
				property: "media",
				type: "union",
			},
			{
				name: "thumbnail",
				property: "media",
				type: "union",
			},
			{
				name: "cover",
				property: "media",
				type: "union",
			},
		],
	],
	sendSticker: [(params) => isBlob(params.sticker), null],
	uploadStickerFile: [(params) => isBlob(params.sticker), null],
	createNewStickerSet: [
		(params) =>
			params.stickers.some((x) => "sticker" in x && isBlob(x.sticker)),
		[
			{
				name: "sticker",
				property: "stickers",
				type: "array",
			},
		],
	],
	addStickerToSet: [(params) => isBlob(params.sticker.sticker), null],
	replaceStickerInSet: [(params) => isBlob(params.sticker.sticker), null],
	setStickerSetThumbnail: [(params) => isBlob(params.thumbnail), null],

	setBusinessAccountProfilePhoto: [
		(params) =>
			(params.photo.type === "static" && isBlob(params.photo.photo)) ||
			(params.photo.type === "animated" && isBlob(params.photo.animation)),
		[
			{
				name: "photo",
				property: "photo",
				type: "union",
			},
			{
				name: "animation",
				property: "photo",
				type: "union",
			},
		],
	],
	postStory: [
		(params) =>
			(params.content.type === "photo" && isBlob(params.content.photo)) ||
			(params.content.type === "video" && isBlob(params.content.video)),
		[
			{
				name: "photo",
				property: "content",
				type: "union",
			},
			{
				name: "video",
				property: "content",
				type: "union",
			},
		],
	],
	editStory: [
		(params) =>
			(params.content.type === "photo" && isBlob(params.content.photo)) ||
			(params.content.type === "video" && isBlob(params.content.video)),
		[
			{
				name: "photo",
				property: "content",
				type: "union",
			},
			{
				name: "video",
				property: "content",
				type: "union",
			},
		],
	],
};
