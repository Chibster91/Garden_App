import { Hono } from "hono";
import type { AppEnv } from "../lib/types";
import { requireAuth } from "../lib/session";
import { mapJournalEntryRow, type JournalEntryRow } from "../lib/dbRows";

export const journalRoutes = new Hono<AppEnv>();
journalRoutes.use("*", requireAuth);

const ENTRY_TYPES = new Set(["observation", "pest", "harvest", "action", "note"]);

interface JournalBody {
	plantedId?: string | null;
	entryType?: string;
	entryDate?: string;
	tags?: string[];
	text?: string | null;
	photoKeys?: string[];
}

function validateJournalBody(body: JournalBody): string | null {
	if (!body.entryType || !ENTRY_TYPES.has(body.entryType)) return "invalid entryType";
	if (!body.entryDate) return "entryDate is required";
	if (body.tags && !Array.isArray(body.tags)) return "tags must be an array";
	if (body.photoKeys && !Array.isArray(body.photoKeys)) return "photoKeys must be an array";
	return null;
}

journalRoutes.get("/", async (c) => {
	const user = c.get("user");
	const plantedId = c.req.query("plantedId");
	const entryType = c.req.query("type");
	const tag = c.req.query("tag");
	const from = c.req.query("from");
	const to = c.req.query("to");

	const conditions = ["user_id = ?"];
	const params: string[] = [user.id];
	if (plantedId) {
		conditions.push("planted_id = ?");
		params.push(plantedId);
	}
	if (entryType) {
		conditions.push("entry_type = ?");
		params.push(entryType);
	}
	if (tag) {
		conditions.push("tags LIKE ?");
		params.push(`%"${tag}"%`);
	}
	if (from) {
		conditions.push("entry_date >= ?");
		params.push(from);
	}
	if (to) {
		conditions.push("entry_date <= ?");
		params.push(to);
	}

	const { results } = await c.env.DB.prepare(
		`SELECT * FROM journal_entries WHERE ${conditions.join(" AND ")} ORDER BY entry_date DESC`,
	)
		.bind(...params)
		.all<JournalEntryRow>();

	return c.json({ entries: results.map(mapJournalEntryRow) });
});

journalRoutes.get("/:id", async (c) => {
	const user = c.get("user");
	const row = await c.env.DB.prepare("SELECT * FROM journal_entries WHERE id = ? AND user_id = ?")
		.bind(c.req.param("id"), user.id)
		.first<JournalEntryRow>();
	if (!row) return c.json({ error: "Not found" }, 404);
	return c.json({ entry: mapJournalEntryRow(row) });
});

journalRoutes.post("/", async (c) => {
	const user = c.get("user");
	const body = await c.req.json<JournalBody>().catch(() => null);
	if (!body) return c.json({ error: "Invalid body" }, 400);
	const validationError = validateJournalBody(body);
	if (validationError) return c.json({ error: validationError }, 400);

	if (body.plantedId) {
		const planted = await c.env.DB.prepare("SELECT id FROM planted WHERE id = ? AND user_id = ?")
			.bind(body.plantedId, user.id)
			.first();
		if (!planted) return c.json({ error: "Planted item not found" }, 400);
	}

	const id = crypto.randomUUID();
	await c.env.DB.prepare(
		`INSERT INTO journal_entries (id, user_id, planted_id, entry_type, entry_date, tags, text, photo_keys)
		 VALUES (?,?,?,?,?,?,?,?)`,
	)
		.bind(
			id,
			user.id,
			body.plantedId ?? null,
			body.entryType,
			body.entryDate,
			JSON.stringify(body.tags ?? []),
			body.text ?? null,
			JSON.stringify(body.photoKeys ?? []),
		)
		.run();

	const row = await c.env.DB.prepare("SELECT * FROM journal_entries WHERE id = ?").bind(id).first<JournalEntryRow>();
	return c.json({ entry: mapJournalEntryRow(row!) }, 201);
});

journalRoutes.put("/:id", async (c) => {
	const user = c.get("user");
	const id = c.req.param("id");
	const existing = await c.env.DB.prepare("SELECT id FROM journal_entries WHERE id = ? AND user_id = ?")
		.bind(id, user.id)
		.first();
	if (!existing) return c.json({ error: "Not found" }, 404);

	const body = await c.req.json<JournalBody>().catch(() => null);
	if (!body) return c.json({ error: "Invalid body" }, 400);
	const validationError = validateJournalBody(body);
	if (validationError) return c.json({ error: validationError }, 400);

	if (body.plantedId) {
		const planted = await c.env.DB.prepare("SELECT id FROM planted WHERE id = ? AND user_id = ?")
			.bind(body.plantedId, user.id)
			.first();
		if (!planted) return c.json({ error: "Planted item not found" }, 400);
	}

	await c.env.DB.prepare(
		`UPDATE journal_entries SET
			planted_id = ?, entry_type = ?, entry_date = ?, tags = ?, text = ?, photo_keys = ?, updated_at = datetime('now')
		 WHERE id = ? AND user_id = ?`,
	)
		.bind(
			body.plantedId ?? null,
			body.entryType,
			body.entryDate,
			JSON.stringify(body.tags ?? []),
			body.text ?? null,
			JSON.stringify(body.photoKeys ?? []),
			id,
			user.id,
		)
		.run();

	const row = await c.env.DB.prepare("SELECT * FROM journal_entries WHERE id = ?").bind(id).first<JournalEntryRow>();
	return c.json({ entry: mapJournalEntryRow(row!) });
});

journalRoutes.delete("/:id", async (c) => {
	const user = c.get("user");
	const id = c.req.param("id");
	const existing = await c.env.DB.prepare("SELECT id FROM journal_entries WHERE id = ? AND user_id = ?")
		.bind(id, user.id)
		.first();
	if (!existing) return c.json({ error: "Not found" }, 404);

	await c.env.DB.prepare("DELETE FROM journal_entries WHERE id = ? AND user_id = ?").bind(id, user.id).run();
	return c.json({ ok: true });
});
