import { Hono } from "hono";
import type { AppEnv } from "../lib/types";
import { verifyGoogleIdToken } from "../lib/googleAuth";
import { newSessionToken, sessionExpiresAt, requireAuth } from "../lib/session";

export const authRoutes = new Hono<AppEnv>();

authRoutes.post("/google", async (c) => {
	const body = await c.req.json<{ idToken?: string }>().catch(() => null);
	if (!body?.idToken) return c.json({ error: "idToken required" }, 400);

	let payload;
	try {
		payload = await verifyGoogleIdToken(body.idToken, c.env.GOOGLE_CLIENT_ID);
	} catch {
		return c.json({ error: "Invalid Google ID token" }, 401);
	}

	const existing = await c.env.DB.prepare("SELECT id FROM users WHERE google_sub = ?")
		.bind(payload.sub)
		.first<{ id: string }>();

	let userId: string;
	if (existing) {
		userId = existing.id;
		await c.env.DB.prepare(
			"UPDATE users SET email = ?, name = ?, picture_url = ?, updated_at = datetime('now') WHERE id = ?",
		)
			.bind(payload.email, payload.name, payload.picture, userId)
			.run();
	} else {
		userId = crypto.randomUUID();
		await c.env.DB.prepare(
			"INSERT INTO users (id, google_sub, email, name, picture_url) VALUES (?, ?, ?, ?, ?)",
		)
			.bind(userId, payload.sub, payload.email, payload.name, payload.picture)
			.run();
	}

	const sessionToken = newSessionToken();
	await c.env.DB.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)")
		.bind(sessionToken, userId, sessionExpiresAt())
		.run();

	return c.json({
		sessionToken,
		user: { id: userId, email: payload.email, name: payload.name, pictureUrl: payload.picture },
	});
});

authRoutes.post("/logout", requireAuth, async (c) => {
	const token = c.req.header("Authorization")!.slice(7);
	await c.env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
	return c.json({ ok: true });
});

authRoutes.get("/me", requireAuth, async (c) => {
	return c.json({ user: c.get("user") });
});
