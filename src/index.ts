/**
 * @module
 *
 * Set of utils for work with files and Telegram Bot API
 *
 * @example
 * ```
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
export * from "./media-methods-helper";
export * from "./media-input";
export * from "./media-upload";
