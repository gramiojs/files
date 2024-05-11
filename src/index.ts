/**
 * @module
 *
 * Set of utils for work with files and Telegram Bot API
 *
 * [Documentation](https://gramio.netlify.app/files/overview.html)
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

export * from "./utils";
export { isFile, MEDIA_METHODS } from "./media-methods-helper";
export * from "./media-input";
export * from "./media-upload";
