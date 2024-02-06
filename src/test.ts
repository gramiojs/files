import { ApiMethods } from "@gramio/types";
    type MethodsWithMediaUpload = {
        [Method in keyof ApiMethods]?: (params: (NonNullable<
            Parameters<ApiMethods[Method]>[0]
        >)) => any;
    };
    export const MEDIA_METHODS: MethodsWithMediaUpload = {setWebhook: (params) => params.certificate,
sendPhoto: (params) => params.photo,
sendAudio: (params) => params.audio || params.thumbnail,
sendDocument: (params) => params.document || params.thumbnail,
sendVideo: (params) => params.video || params.thumbnail,
sendAnimation: (params) => params.animation || params.thumbnail,
sendVoice: (params) => params.voice,
sendVideoNote: (params) => params.video_note || params.thumbnail,
sendMediaGroup: (params) => params.media.some(x => x.thumbnail) || params.media.some(x => x.thumbnail) || params.media.some(x => x.thumbnail),
setChatPhoto: (params) => params.photo,

sendSticker: (params) => params.sticker,
uploadStickerFile: (params) => params.sticker,
createNewStickerSet: (params) => params.stickers.some(x => x.sticker),
addStickerToSet: (params) => params.sticker,
setStickerSetThumbnail: (params) => params.thumbnail,}