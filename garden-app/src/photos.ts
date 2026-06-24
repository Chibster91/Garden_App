import { api } from "./api";

const MAX_DIMENSION = 1600;

export async function resizeImageToBlob(file: File): Promise<{ blob: Blob; contentType: string }> {
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
	const width = Math.round(bitmap.width * scale);
	const height = Math.round(bitmap.height * scale);

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas context unavailable");
	ctx.drawImage(bitmap, 0, 0, width, height);

	const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
	if (!blob) throw new Error("Failed to encode image");
	return { blob, contentType: "image/jpeg" };
}

export async function uploadPhoto(file: File): Promise<string> {
	const { blob, contentType } = await resizeImageToBlob(file);
	const { key } = await api.uploadPhoto(blob, contentType);
	return key;
}

export function photoApiPath(key: string): string {
	return `/api/photos/${key}`;
}
