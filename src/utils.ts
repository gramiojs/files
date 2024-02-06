export function convertJsonToFormData(params: Record<string, unknown>) {
	const formData = new FormData();

	for (const [key, value] of Object.entries(params)) {
		if (value instanceof Blob) formData.set(key, value);
		else if (typeof value === "object")
			formData.set(key, JSON.stringify(value));
		else formData.set(key, String(value));
	}

	return formData;
}
