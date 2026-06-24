import { getStoredSessionToken, clearStoredSessionToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
export const UNAUTHORIZED_EVENT = "garden:unauthorized";

export class ApiError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

async function authedFetch(path: string, init?: RequestInit): Promise<Response> {
	const token = getStoredSessionToken();
	const headers = new Headers(init?.headers);
	if (token) headers.set("Authorization", `Bearer ${token}`);

	const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

	if (response.status === 401) {
		clearStoredSessionToken();
		window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
		throw new ApiError(401, "Unauthorized");
	}

	return response;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const headers = new Headers(init?.headers);
	if (init?.body && !headers.has("Content-Type") && typeof init.body === "string") {
		headers.set("Content-Type", "application/json");
	}

	const response = await authedFetch(path, { ...init, headers });

	if (!response.ok) {
		const body = await response.json().catch(() => null);
		throw new ApiError(response.status, body?.error ?? `Request failed: ${response.status}`);
	}

	if (response.status === 204) return undefined as T;
	return response.json() as Promise<T>;
}

export const api = {
	get: <T>(path: string) => request<T>(path),
	post: <T>(path: string, body?: unknown) =>
		request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
	put: <T>(path: string, body?: unknown) =>
		request<T>(path, { method: "PUT", body: body !== undefined ? JSON.stringify(body) : undefined }),
	delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
	getBlob: async (path: string): Promise<Blob> => {
		const response = await authedFetch(path);
		if (!response.ok) throw new ApiError(response.status, `Request failed: ${response.status}`);
		return response.blob();
	},
	uploadPhoto: async (blob: Blob, contentType: string): Promise<{ key: string }> => {
		const response = await authedFetch("/api/photos", {
			method: "POST",
			body: blob,
			headers: { "Content-Type": contentType },
		});
		if (!response.ok) {
			const body = await response.json().catch(() => null);
			throw new ApiError(response.status, body?.error ?? `Upload failed: ${response.status}`);
		}
		return response.json();
	},
};
