import { createMiddleware } from "hono/factory";
import type { AppEnv } from "./types";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function newSessionToken(): string {
	return crypto.randomUUID() + crypto.randomUUID();
}

export function sessionExpiresAt(): string {
	return new Date(Date.now() + SESSION_TTL_MS).toISOString();
}

interface SessionRow {
	id: string;
	email: string;
	name: string | null;
	pictureUrl: string | null;
	expiresAt: string;
}

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
	const header = c.req.header("Authorization");
	const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
	if (!token) return c.json({ error: "Unauthorized" }, 401);

	const row = await c.env.DB.prepare(
		`SELECT u.id as id, u.email as email, u.name as name, u.picture_url as pictureUrl, s.expires_at as expiresAt
		 FROM sessions s JOIN users u ON u.id = s.user_id
		 WHERE s.token = ?`,
	)
		.bind(token)
		.first<SessionRow>();

	if (!row || new Date(row.expiresAt).getTime() < Date.now()) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	c.set("user", { id: row.id, email: row.email, name: row.name, pictureUrl: row.pictureUrl });
	await next();
});
