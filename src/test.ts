import { ApiMethods, TelegramInputFile } from "@gramio/types";

type MethodsWithMediaUpload = {
	[Method in keyof ApiMethods]?: (
		params: NonNullable<Parameters<ApiMethods[Method]>[0]>,
	) => boolean;
};

function isFile(file?: TelegramInputFile | string) {
	if (!file || typeof file === "string") return false;

	return file instanceof File;
}

export const MEDIA_METHODS: MethodsWithMediaUpload = {
	setWebhook: (params) => isFile(params.certificate),
	sendPhoto: (params) => isFile(params.photo),
	sendAudio: (params) => isFile(params.audio) || isFile(params.thumbnail),
	sendDocument: (params) => isFile(params.document) || isFile(params.thumbnail),
	sendVideo: (params) => isFile(params.video) || isFile(params.thumbnail),
	sendAnimation: (params) =>
		isFile(params.animation) || isFile(params.thumbnail),
	sendVoice: (params) => isFile(params.voice),
	sendVideoNote: (params) =>
		isFile(params.video_note) || isFile(params.thumbnail),
	sendMediaGroup: (params) =>
		params.media.some((x) => "thumbnail" in x && isFile(x.thumbnail)),
	setChatPhoto: (params) => isFile(params.photo),
	editMessageMedia: (params) =>
		"thumbnail" in params.media && isFile(params.media.thumbnail),
	sendSticker: (params) => isFile(params.sticker),
	uploadStickerFile: (params) => isFile(params.sticker),
	createNewStickerSet: (params) =>
		params.stickers.some((x) => "sticker" in x && isFile(x.sticker)),
	addStickerToSet: (params) => isFile(params.sticker),
	setStickerSetThumbnail: (params) => isFile(params.thumbnail),
};
