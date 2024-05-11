import type {
	TelegramInputMediaAnimation,
	TelegramInputMediaAudio,
	TelegramInputMediaDocument,
	TelegramInputMediaPhoto,
	TelegramInputMediaVideo,
} from "@gramio/types";

/**
 *  Class-helper with static methods that represents the content of a media message to be sent.
 *
 * [Documentation](https://gramio.netlify.app/files/media-input.html)
 */
export class MediaInput {
	/**
	 * Represents an animation file (GIF or H.264/MPEG-4 AVC video without sound) to be sent.
	 *
	 * [Documentation](https://core.telegram.org/bots/api/#inputmediaanimation)
	 */
	static animation(
		media: TelegramInputMediaAnimation["media"],
		options: Omit<TelegramInputMediaAnimation, "media" | "type"> = {},
	): TelegramInputMediaAnimation {
		return {
			type: "animation",
			media,
			...options,
		};
	}

	/**
	 * Represents a general file to be sent.
	 *
	 * [Documentation](https://core.telegram.org/bots/api/#inputmediadocument)
	 */
	static document(
		media: TelegramInputMediaDocument["media"],
		options: Omit<TelegramInputMediaDocument, "media" | "type"> = {},
	): TelegramInputMediaDocument {
		return {
			type: "document",
			media,
			...options,
		};
	}

	/**
	 * Represents an audio file to be treated as music to be sent.
	 *
	 * [Documentation](https://core.telegram.org/bots/api/#inputmediaaudio)
	 */
	static audio(
		media: TelegramInputMediaAudio["media"],
		options: Omit<TelegramInputMediaAudio, "media" | "type"> = {},
	): TelegramInputMediaAudio {
		return {
			type: "audio",
			media,
			...options,
		};
	}

	/**
	 * Represents a photo to be sent.
	 *
	 * [Documentation](https://core.telegram.org/bots/api/#inputmediaphoto)
	 */
	static photo(
		media: TelegramInputMediaPhoto["media"],
		options: Omit<TelegramInputMediaPhoto, "media" | "type"> = {},
	): TelegramInputMediaPhoto {
		return {
			type: "photo",
			media,
			...options,
		};
	}

	/**
	 * Represents a video to be sent.
	 *
	 * [Documentation](https://core.telegram.org/bots/api/#inputmediavideo)
	 */
	static video(
		media: TelegramInputMediaVideo["media"],
		options: Omit<TelegramInputMediaVideo, "media" | "type"> = {},
	): TelegramInputMediaVideo {
		return {
			type: "video",
			media,
			...options,
		};
	}
}
