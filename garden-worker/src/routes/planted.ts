import { Hono } from "hono";
import type { AppEnv } from "../lib/types";
import { requireAuth } from "../lib/session";
import { mapPlantedRow, mapSeedRow, type PlantedRow, type SeedRow } from "../lib/dbRows";

export const plantedRoutes = new Hono<AppEnv>();
plantedRoutes.use("*", requireAuth);

const STAGES = new Set(["seedling", "vegetative", "flowering", "fruiting", "harvested", "removed"]);

interface PlantedBody {
	seedId?: string;
	location?: string | null;
	datePlanted?: string;
	stage?: string;
	photoKeys?: string[];
}

function validatePlantedBody(body: PlantedBody): string | null {
	if (!body.seedId) return "seedId is required";
	if (!body.datePlanted) return "datePlanted is required";
	if (body.stage && !STAGES.has(body.stage)) return "invalid stage";
	if (body.photoKeys && !Array.isArray(body.photoKeys)) return "photoKeys must be an array";
	return null;
}

plantedRoutes.get("/", async (c) => {
	const user = c.get("user");
	const stage = c.req.query("stage");
	const seedId = c.req.query("seedId");

	const conditions = ["user_id = ?"];
	const params: (string | null)[] = [user.id];
	if (stage) {
		conditions.push("stage = ?");
		params.push(stage);
	}
	if (seedId) {
		conditions.push("seed_id = ?");
		params.push(seedId);
	}

	const { results } = await c.env.DB.prepare(
		`SELECT * FROM planted WHERE ${conditions.join(" AND ")} ORDER BY date_planted DESC`,
	)
		.bind(...params)
		.all<PlantedRow>();

	return c.json({ planted: results.map(mapPlantedRow) });
});

plantedRoutes.get("/:id", async (c) => {
	const user = c.get("user");
	const row = await c.env.DB.prepare("SELECT * FROM planted WHERE id = ? AND user_id = ?")
		.bind(c.req.param("id"), user.id)
		.first<PlantedRow>();
	if (!row) return c.json({ error: "Not found" }, 404);

	const seedRow = await c.env.DB.prepare("SELECT * FROM seeds WHERE id = ?").bind(row.seed_id).first<SeedRow>();

	return c.json({ planted: mapPlantedRow(row), seed: seedRow ? mapSeedRow(seedRow) : null });
});

plantedRoutes.post("/", async (c) => {
	const user = c.get("user");
	const body = await c.req.json<PlantedBody>().catch(() => null);
	if (!body) return c.json({ error: "Invalid body" }, 400);
	const validationError = validatePlantedBody(body);
	if (validationError) return c.json({ error: validationError }, 400);

	const seed = await c.env.DB.prepare("SELECT id FROM seeds WHERE id = ? AND user_id = ?")
		.bind(body.seedId, user.id)
		.first();
	if (!seed) return c.json({ error: "Seed not found" }, 400);

	const id = crypto.randomUUID();
	await c.env.DB.prepare(
		`INSERT INTO planted (id, user_id, seed_id, location, date_planted, stage, photo_keys)
		 VALUES (?,?,?,?,?,?,?)`,
	)
		.bind(
			id,
			user.id,
			body.seedId,
			body.location ?? null,
			body.datePlanted,
			body.stage ?? "seedling",
			JSON.stringify(body.photoKeys ?? []),
		)
		.run();

	const row = await c.env.DB.prepare("SELECT * FROM planted WHERE id = ?").bind(id).first<PlantedRow>();
	return c.json({ planted: mapPlantedRow(row!) }, 201);
});

plantedRoutes.put("/:id", async (c) => {
	const user = c.get("user");
	const id = c.req.param("id");
	const existing = await c.env.DB.prepare("SELECT id FROM planted WHERE id = ? AND user_id = ?")
		.bind(id, user.id)
		.first();
	if (!existing) return c.json({ error: "Not found" }, 404);

	const body = await c.req.json<PlantedBody>().catch(() => null);
	if (!body) return c.json({ error: "Invalid body" }, 400);
	const validationError = validatePlantedBody(body);
	if (validationError) return c.json({ error: validationError }, 400);

	const seed = await c.env.DB.prepare("SELECT id FROM seeds WHERE id = ? AND user_id = ?")
		.bind(body.seedId, user.id)
		.first();
	if (!seed) return c.json({ error: "Seed not found" }, 400);

	await c.env.DB.prepare(
		`UPDATE planted SET
			seed_id = ?, location = ?, date_planted = ?, stage = ?, photo_keys = ?, updated_at = datetime('now')
		 WHERE id = ? AND user_id = ?`,
	)
		.bind(
			body.seedId,
			body.location ?? null,
			body.datePlanted,
			body.stage ?? "seedling",
			JSON.stringify(body.photoKeys ?? []),
			id,
			user.id,
		)
		.run();

	const row = await c.env.DB.prepare("SELECT * FROM planted WHERE id = ?").bind(id).first<PlantedRow>();
	return c.json({ planted: mapPlantedRow(row!) });
});

plantedRoutes.delete("/:id", async (c) => {
	const user = c.get("user");
	const id = c.req.param("id");
	const existing = await c.env.DB.prepare("SELECT id FROM planted WHERE id = ? AND user_id = ?")
		.bind(id, user.id)
		.first();
	if (!existing) return c.json({ error: "Not found" }, 404);

	await c.env.DB.prepare("DELETE FROM planted WHERE id = ? AND user_id = ?").bind(id, user.id).run();
	return c.json({ ok: true });
});
