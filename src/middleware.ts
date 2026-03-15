import type { APIMethodParams, APIMethods } from "@gramio/types";
import { extractFilesToFormData, isMediaUpload } from "./utils.js";

type MiddlewareContext = {
	[M in keyof APIMethods]: {
		method: M;
		params: APIMethodParams<M>;
		formData?: FormData;
	};
}[keyof APIMethods];

/**
 * Middleware that automatically detects file uploads in API params
 * and converts them to `FormData`, enabling `Blob`/`File` support for all media methods.
 *
 * @example
 * ```ts
 * import { Telegram } from "wrappergram";
 * import { filesMiddleware } from "@gramio/files/middleware";
 * import { MediaUpload } from "@gramio/files";
 *
 * const telegram = new Telegram("BOT_TOKEN", {
 *     middlewares: [filesMiddleware],
 * });
 *
 * await telegram.api.sendPhoto({
 *     chat_id: 123,
 *     photo: await MediaUpload.url("https://example.com/image.jpg"),
 * });
 * ```
 */
export const filesMiddleware = async (
	context: MiddlewareContext,
	next: () => Promise<unknown>,
): Promise<unknown> => {
	if (context.params && isMediaUpload(context.method, context.params)) {
		const [formData, rest] = await extractFilesToFormData(
			context.method,
			context.params,
		);
		if (formData) context.formData = formData;
		context.params = rest as typeof context.params;
	}

	return next();
};
