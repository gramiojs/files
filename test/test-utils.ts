import { mock } from "bun:test";
import fs from "node:fs/promises";
/**
 * Interface for mock file system entries
 */
interface MockFileSystem {
	[path: string]: Buffer | string;
}

/**
 * Interface for mock fetch responses
 */
interface MockFetchResponses {
	[url: string]:
		| Response
		| {
				status?: number;
				headers?: Record<string, string>;
				body?: string | Buffer | Blob;
		  };
}

/**
 * Interface for mock inputs configuration
 */
interface MockInputsConfig {
	fs?: MockFileSystem;
	fetch?: MockFetchResponses;
}

interface MockedFetch {
	(input: URL | RequestInfo, init?: RequestInit): Promise<Response>;
	__originalFetch?: typeof fetch;
}

const mockStore = {
	fs: {} as MockFileSystem,
	fetch: {} as MockFetchResponses,
	originalFetch: global.fetch,
	readFileMock: null as ReturnType<typeof mock> | null,
	originalReadFile: fs.readFile,
};

let mocksApplied = false;

/**
 * Helper function to mock file system and network for testing
 *
 * @example
 * mockInputs({
 *   fs: {
 *     "/path/to/image.jpg": Buffer.from("mock file content"),
 *     "/path/to/text.txt": "Hello, world!"
 *   },
 *   fetch: {
 *     "https://example.com/image.jpg": {
 *       body: new Blob(["mock image content"], { type: "image/jpeg" })
 *     },
 *     "https://example.com/api": new Response(JSON.stringify({ status: "ok" }), {
 *       headers: { "Content-Type": "application/json" }
 *     })
 *   }
 * });
 */
export function mockInputs(config: MockInputsConfig) {
	if (config.fs) {
		mockStore.fs = { ...mockStore.fs, ...config.fs };
	}

	if (config.fetch) {
		mockStore.fetch = { ...mockStore.fetch, ...config.fetch };
	}

	mockStore.originalReadFile = fs.readFile;

	if (!mocksApplied) {
		const readFileMock = mock((path: string) => {
			console.log("Mock readFile called with path:", path);

			const content = mockStore.fs[path];
			if (!content) {
				console.log(`No mock content found for path: ${path}`);
				const error = new Error(
					`ENOENT: no such file or directory, open '${path}'`,
				) as NodeJS.ErrnoException;
				error.code = "ENOENT";
				error.syscall = "open";
				error.path = path;
				error.errno = -2;
				throw error;
			}

			console.log(`Returning mock content for path: ${path}`);
			if (typeof content === "string") {
				return Promise.resolve(Buffer.from(content));
			}

			return Promise.resolve(content);
		});

		mockStore.readFileMock = readFileMock;

		// @ts-expect-error
		fs.readFile = readFileMock;

		const fetchMock = mock(
			(url: string | URL | Request, init?: RequestInit) => {
				console.log("Mock fetch called with URL:", url.toString());

				const urlString =
					url instanceof URL
						? url.toString()
						: url instanceof Request
							? url.url
							: url;

				const mockResponse = mockStore.fetch[urlString];

				if (!mockResponse) {
					console.log(`No mock response found for URL: ${urlString}`);
					return Promise.reject(
						new Error(`Network error: No mock response for ${urlString}`),
					);
				}

				console.log(`Returning mock response for URL: ${urlString}`);
				if (mockResponse instanceof Response) {
					return Promise.resolve(mockResponse);
				}

				const { status = 200, headers = {}, body = "" } = mockResponse;

				return Promise.resolve(
					new Response(
						body instanceof Buffer
							? body
							: body instanceof Blob
								? body
								: typeof body === "string"
									? body
									: "",
						{ status, headers },
					),
				);
			},
		) as MockedFetch;

		fetchMock.__originalFetch = global.fetch;
		global.fetch = fetchMock;

		mocksApplied = true;
	}
}

/**
 * Reset all mocks and restore original behavior
 */
export function resetMocks() {
	mockStore.fs = {};
	mockStore.fetch = {};
}

/**
 * Completely restore original functionality (call at end of all tests)
 */
export function restoreOriginals() {
	mock.restore();

	if (global.fetch !== mockStore.originalFetch) {
		global.fetch = mockStore.originalFetch;
	}

	if (fs.readFile !== mockStore.originalReadFile) {
		fs.readFile = mockStore.originalReadFile;
	}

	mocksApplied = false;
}
