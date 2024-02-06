import { ApiMethods } from "@gramio/types";
import { MEDIA_METHODS } from "./test";

export * from "./utils";
export * from "./test";

export function isMediaUpload<T extends keyof ApiMethods>(
	method: T,
	params: ApiMethods[T],
) {
	const mediaMethod = MEDIA_METHODS[method];
	if (!mediaMethod) return false;

	// Check is params has File???
	return mediaMethod[0](params);
}
