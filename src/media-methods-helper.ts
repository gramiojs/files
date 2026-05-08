import { APIMethods, APIMethodParams, TelegramInputFile } from "@gramio/types"

export type Extractor = {
    name: string
    type: "array" | "union"
    property: string
}
type MethodsWithMediaUpload = {
    [Method in keyof APIMethods]?: [
        (params: NonNullable<APIMethodParams<Method>>) => boolean,
        Extractor[] | null,
    ]
}

let isWarned = false

/** Guard to check is it {@link Blob} or {@link Promise} */
export function isBlob(blob?: TelegramInputFile | object | string) {
    if (!blob || typeof blob !== "object") return false

    if (blob instanceof Promise) {
        if (!isWarned) {
            const error = new Error(
                "Promise<File> is deprecated. Please put await before.",
            )
            console.warn(error)
            isWarned = true
        }
        return true
    }

    return blob instanceof Blob
}

/**
 * A set of methods with the function of checking whether a {@link File} has been passed in the parameters
 *
 * @codegenerated
 * */
export const MEDIA_METHODS: MethodsWithMediaUpload = {
    setWebhook: [(params) => isBlob(params.certificate), null],
    sendPhoto: [(params) => isBlob(params.photo), null],
    sendLivePhoto: [
        (params) => isBlob(params.live_photo) || isBlob(params.photo),
        null,
    ],
    sendAudio: [
        (params) => isBlob(params.audio) || isBlob(params.thumbnail),
        null,
    ],
    sendDocument: [
        (params) => isBlob(params.document) || isBlob(params.thumbnail),
        null,
    ],
    sendVideo: [
        (params) =>
            isBlob(params.video) ||
            isBlob(params.thumbnail) ||
            isBlob(params.cover),
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
            params.media.some((x) => "photo" in x && isBlob(x.photo)) ||
            params.media.some((x) => "thumbnail" in x && isBlob(x.thumbnail)) ||
            params.media.some((x) => "cover" in x && isBlob(x.cover)),
        [
            {
                name: "media",
                property: "media",
                type: "array",
            },
            {
                name: "photo",
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
    sendMediaGroup: [
        (params) =>
            params.media.some((x) => "media" in x && isBlob(x.media)) ||
            params.media.some((x) => "thumbnail" in x && isBlob(x.thumbnail)) ||
            params.media.some((x) => "photo" in x && isBlob(x.photo)) ||
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
                name: "photo",
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
    sendPoll: [
        (params) =>
            (!!params.explanation_media &&
                "media" in params.explanation_media &&
                isBlob(params.explanation_media.media)) ||
            (!!params.explanation_media &&
                "thumbnail" in params.explanation_media &&
                isBlob(params.explanation_media.thumbnail)) ||
            (params.explanation_media?.type === "live_photo" &&
                isBlob(params.explanation_media.photo)) ||
            (params.explanation_media?.type === "video" &&
                isBlob(params.explanation_media.cover)) ||
            (!!params.media &&
                "media" in params.media &&
                isBlob(params.media.media)) ||
            (!!params.media &&
                "thumbnail" in params.media &&
                isBlob(params.media.thumbnail)) ||
            (params.media?.type === "live_photo" &&
                isBlob(params.media.photo)) ||
            (params.media?.type === "video" && isBlob(params.media.cover)),
        [
            {
                name: "media",
                property: "explanation_media",
                type: "union",
            },
            {
                name: "thumbnail",
                property: "explanation_media",
                type: "union",
            },
            {
                name: "photo",
                property: "explanation_media",
                type: "union",
            },
            {
                name: "cover",
                property: "explanation_media",
                type: "union",
            },
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
                name: "photo",
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
    setChatPhoto: [(params) => isBlob(params.photo), null],
    setMyProfilePhoto: [
        (params) =>
            (params.photo?.type === "static" && isBlob(params.photo.photo)) ||
            (params.photo?.type === "animated" &&
                isBlob(params.photo.animation)),
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
    setBusinessAccountProfilePhoto: [
        (params) =>
            (params.photo?.type === "static" && isBlob(params.photo.photo)) ||
            (params.photo?.type === "animated" &&
                isBlob(params.photo.animation)),
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
            (params.content?.type === "photo" &&
                isBlob(params.content.photo)) ||
            (params.content?.type === "video" && isBlob(params.content.video)),
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
            (params.content?.type === "photo" &&
                isBlob(params.content.photo)) ||
            (params.content?.type === "video" && isBlob(params.content.video)),
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
    editMessageMedia: [
        (params) =>
            (!!params.media &&
                "media" in params.media &&
                isBlob(params.media.media)) ||
            (!!params.media &&
                "thumbnail" in params.media &&
                isBlob(params.media.thumbnail)) ||
            (params.media?.type === "live_photo" &&
                isBlob(params.media.photo)) ||
            (params.media?.type === "video" && isBlob(params.media.cover)),
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
                name: "photo",
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
}
