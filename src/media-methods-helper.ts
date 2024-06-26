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

/** Guard for check is it {@link File} or {@link Promise} */
export function isFile(file?: TelegramInputFile | object | string) {
	if (!file || typeof file !== "object") return false;

	return file instanceof File || file instanceof Promise;
}

/**
 * A set of methods with the function of checking whether a {@link File} has been passed in the parameters
 *
 * @codegenerated
 * */
export const MEDIA_METHODS: MethodsWithMediaUpload = {
	setWebhook: [(params) => isFile(params.certificate), null],
	sendPhoto: [(params) => isFile(params.photo), null],
	sendAudio: [
		(params) => isFile(params.audio) || isFile(params.thumbnail),
		null,
	],
	sendDocument: [
		(params) => isFile(params.document) || isFile(params.thumbnail),
		null,
	],
	sendVideo: [
		(params) => isFile(params.video) || isFile(params.thumbnail),
		null,
	],
	sendAnimation: [
		(params) => isFile(params.animation) || isFile(params.thumbnail),
		null,
	],
	sendVoice: [(params) => isFile(params.voice), null],
	sendVideoNote: [
		(params) => isFile(params.video_note) || isFile(params.thumbnail),
		null,
	],
	sendPaidMedia: [
		(params) => params.media.some((x) => "media" in x && isFile(x.media)),
		[
			{
				name: "media",
				property: "media",
				type: "array",
			},
		],
	],
	sendMediaGroup: [
		(params) =>
			params.media.some((x) => "media" in x && isFile(x.media)) ||
			params.media.some((x) => "thumbnail" in x && isFile(x.thumbnail)),
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
		],
	],
	setChatPhoto: [(params) => isFile(params.photo), null],
	editMessageMedia: [
		(params) =>
			("media" in params.media && isFile(params.media.media)) ||
			("thumbnail" in params.media && isFile(params.media.thumbnail)),
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
		],
	],
	sendSticker: [(params) => isFile(params.sticker), null],
	uploadStickerFile: [(params) => isFile(params.sticker), null],
	createNewStickerSet: [
		(params) =>
			params.stickers.some((x) => "sticker" in x && isFile(x.sticker)),
		[
			{
				name: "sticker",
				property: "stickers",
				type: "array",
			},
		],
	],
	addStickerToSet: [(params) => isFile(params.sticker.sticker), null],
	replaceStickerInSet: [(params) => isFile(params.sticker.sticker), null],
	setStickerSetThumbnail: [(params) => isFile(params.thumbnail), null],
};
