import { Hono } from "hono";
import type { AppEnv } from "../lib/types";
import { requireAuth } from "../lib/session";

export const photosRoutes = new Hono<AppEnv>();
photosRoutes.use("*", requireAuth);

const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_CONTENT_TYPES: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};

photosRoutes.post("/", async (c) => {
	const user = c.get("user");
	const contentType = c.req.header("Content-Type") ?? "";
	const extension = ALLOWED_CONTENT_TYPES[contentType];
	if (!extension) return c.json({ error: "Unsupported Content-Type" }, 400);

	const body = await c.req.arrayBuffer();
	if (body.byteLength === 0) return c.json({ error: "Empty body" }, 400);
	if (body.byteLength > MAX_PHOTO_BYTES) return c.json({ error: "Photo too large" }, 413);

	const key = `${user.id}/${crypto.randomUUID()}.${extension}`;
	await c.env.PHOTOS_BUCKET.put(key, body, { httpMetadata: { contentType } });

	return c.json({ key }, 201);
});

photosRoutes.get("/:key{.+}", async (c) => {
	const user = c.get("user");
	const key = c.req.param("key");
	if (!key.startsWith(`${user.id}/`)) return c.json({ error: "Not found" }, 404);

	const object = await c.env.PHOTOS_BUCKET.get(key);
	if (!object) return c.json({ error: "Not found" }, 404);

	return new Response(object.body, {
		headers: {
			"Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
			"Cache-Control": "private, max-age=31536000, immutable",
		},
	});
});
