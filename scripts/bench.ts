import { randomBytes } from "node:crypto";
import { bench, group, run } from "mitata";

group("randomId", () => {
	bench("randomBytes", () => randomBytes(5).toString("hex"));
	bench("getRandomValues - Uint32Array", () =>
		String(crypto.getRandomValues(new Uint32Array(1))[0]),
	);
	bench("getRandomValues - Uint8Array", () =>
		String(crypto.getRandomValues(new Uint8Array(1))[0]),
	);
	bench("getRandomValues - Uint8ClampedArray", () =>
		String(crypto.getRandomValues(new Uint8ClampedArray(1))[0]),
	);
	bench("getRandomValues - int8Array", () =>
		String(crypto.getRandomValues(new Int8Array(1))[0]),
	);
});

group("isFile", () => {
	bench("instanceof", () => new File(["ok"], "some.txt") instanceof File);
});

await run();
