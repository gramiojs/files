/**
 * @module
 *
 * Set of utils for work with files and Telegram Bot API
 *
 * [Documentation](https://gramio.dev/files/overview.html)
 *
 * @example
 * ```typescript
 * import { MediaInput, MediaUpload } from "@gramio/files";
 *
 * // method for sendMediaGroup
 * context.sendMediaGroup([
 *      MediaInput.document(
 *          MediaUpload.url(
 *              "https://raw.githubusercontent.com/gramiojs/types/main/README.md"
 *          )
 *      ),
 *      MediaInput.document(MediaUpload.path("./package.json")),
 * ]);
 * ```
 */

export * from "./utils.js";
export { isBlob, MEDIA_METHODS } from "./media-methods-helper.js";
export * from "./media-input.js";
export * from "./media-upload.js";
