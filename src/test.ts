import { ApiMethods, TelegramInputFile } from "@gramio/types"

type MethodsWithMediaUpload = {
    [Method in keyof ApiMethods]?: [
        (params: NonNullable<Parameters<ApiMethods[Method]>[0]>) => boolean,
        { name: string; type?: "array" | "union"; property?: string }[] | null,
    ]
}

function isFile(file?: TelegramInputFile | string) {
    if (!file || typeof file !== "object") return false

    return file instanceof File
}

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
    addStickerToSet: [(params) => isFile(params.sticker), null],
    setStickerSetThumbnail: [(params) => isFile(params.thumbnail), null],
}
