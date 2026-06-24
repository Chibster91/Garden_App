import { Hono } from "hono";
import type { AppEnv } from "../lib/types";
import { requireAuth } from "../lib/session";
import { mapSeedRow, type SeedRow } from "../lib/dbRows";

export const seedsRoutes = new Hono<AppEnv>();
seedsRoutes.use("*", requireAuth);

const SEED_STATUSES = new Set(["unopened", "opened", "low", "empty"]);
const LIGHT_NEEDS = new Set(["full_sun", "partial_sun", "shade"]);

interface SeedBody {
	plantName?: string;
	variety?: string | null;
	brand?: string | null;
	year?: number | null;
	quantity?: number | null;
	status?: string;
	photoFrontKey?: string | null;
	photoBackKey?: string | null;
	notes?: string | null;
	sowIndoorStart?: string | null;
	sowIndoorEnd?: string | null;
	sowDirectStart?: string | null;
	sowDirectEnd?: string | null;
	depthIn?: number | null;
	spacingIn?: number | null;
	germDaysMin?: number | null;
	germDaysMax?: number | null;
	germTempFMin?: number | null;
	germTempFMax?: number | null;
	lightNeeds?: string | null;
	daysToHarvestMin?: number | null;
	daysToHarvestMax?: number | null;
	sowMethod?: string | null;
	bestSeason?: string | null;
	transplantTiming?: string | null;
	readyToTransplant?: string | null;
	hardenOffDays?: string | null;
	waterNeeds?: string | null;
	soilNeeds?: string | null;
	commonPests?: string[];
}

function validateSeedBody(body: SeedBody): string | null {
	if (!body.plantName || !body.plantName.trim()) return "plantName is required";
	if (body.status && !SEED_STATUSES.has(body.status)) return "invalid status";
	if (body.lightNeeds && !LIGHT_NEEDS.has(body.lightNeeds)) return "invalid lightNeeds";
	return null;
}

seedsRoutes.get("/", async (c) => {
	const user = c.get("user");
	const status = c.req.query("status");
	const query = status
		? c.env.DB.prepare("SELECT * FROM seeds WHERE user_id = ? AND status = ? ORDER BY created_at DESC").bind(
				user.id,
				status,
			)
		: c.env.DB.prepare("SELECT * FROM seeds WHERE user_id = ? ORDER BY created_at DESC").bind(user.id);

	const { results } = await query.all<SeedRow>();
	return c.json({ seeds: results.map(mapSeedRow) });
});

seedsRoutes.get("/:id", async (c) => {
	const user = c.get("user");
	const row = await c.env.DB.prepare("SELECT * FROM seeds WHERE id = ? AND user_id = ?")
		.bind(c.req.param("id"), user.id)
		.first<SeedRow>();
	if (!row) return c.json({ error: "Not found" }, 404);
	return c.json({ seed: mapSeedRow(row) });
});

seedsRoutes.post("/", async (c) => {
	const user = c.get("user");
	const body = await c.req.json<SeedBody>().catch(() => null);
	if (!body) return c.json({ error: "Invalid body" }, 400);
	const validationError = validateSeedBody(body);
	if (validationError) return c.json({ error: validationError }, 400);

	const id = crypto.randomUUID();
	await c.env.DB.prepare(
		`INSERT INTO seeds (
			id, user_id, plant_name, variety, brand, year, quantity, status,
			photo_front_key, photo_back_key, notes,
			sow_indoor_start, sow_indoor_end, sow_direct_start, sow_direct_end,
			depth_in, spacing_in, germ_days_min, germ_days_max, germ_temp_f_min, germ_temp_f_max,
			light_needs, days_to_harvest_min, days_to_harvest_max,
			sow_method, best_season, transplant_timing, ready_to_transplant, harden_off_days,
			water_needs, soil_needs, common_pests
		) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
	)
		.bind(
			id,
			user.id,
			body.plantName,
			body.variety ?? null,
			body.brand ?? null,
			body.year ?? null,
			body.quantity ?? null,
			body.status ?? "unopened",
			body.photoFrontKey ?? null,
			body.photoBackKey ?? null,
			body.notes ?? null,
			body.sowIndoorStart ?? null,
			body.sowIndoorEnd ?? null,
			body.sowDirectStart ?? null,
			body.sowDirectEnd ?? null,
			body.depthIn ?? null,
			body.spacingIn ?? null,
			body.germDaysMin ?? null,
			body.germDaysMax ?? null,
			body.germTempFMin ?? null,
			body.germTempFMax ?? null,
			body.lightNeeds ?? null,
			body.daysToHarvestMin ?? null,
			body.daysToHarvestMax ?? null,
			body.sowMethod ?? null,
			body.bestSeason ?? null,
			body.transplantTiming ?? null,
			body.readyToTransplant ?? null,
			body.hardenOffDays ?? null,
			body.waterNeeds ?? null,
			body.soilNeeds ?? null,
			JSON.stringify(body.commonPests ?? []),
		)
		.run();

	const row = await c.env.DB.prepare("SELECT * FROM seeds WHERE id = ?").bind(id).first<SeedRow>();
	return c.json({ seed: mapSeedRow(row!) }, 201);
});

seedsRoutes.put("/:id", async (c) => {
	const user = c.get("user");
	const id = c.req.param("id");
	const existing = await c.env.DB.prepare("SELECT id FROM seeds WHERE id = ? AND user_id = ?")
		.bind(id, user.id)
		.first();
	if (!existing) return c.json({ error: "Not found" }, 404);

	const body = await c.req.json<SeedBody>().catch(() => null);
	if (!body) return c.json({ error: "Invalid body" }, 400);
	const validationError = validateSeedBody(body);
	if (validationError) return c.json({ error: validationError }, 400);

	await c.env.DB.prepare(
		`UPDATE seeds SET
			plant_name = ?, variety = ?, brand = ?, year = ?, quantity = ?, status = ?,
			photo_front_key = ?, photo_back_key = ?, notes = ?,
			sow_indoor_start = ?, sow_indoor_end = ?, sow_direct_start = ?, sow_direct_end = ?,
			depth_in = ?, spacing_in = ?, germ_days_min = ?, germ_days_max = ?,
			germ_temp_f_min = ?, germ_temp_f_max = ?, light_needs = ?,
			days_to_harvest_min = ?, days_to_harvest_max = ?,
			sow_method = ?, best_season = ?, transplant_timing = ?, ready_to_transplant = ?,
			harden_off_days = ?, water_needs = ?, soil_needs = ?, common_pests = ?,
			updated_at = datetime('now')
		WHERE id = ? AND user_id = ?`,
	)
		.bind(
			body.plantName,
			body.variety ?? null,
			body.brand ?? null,
			body.year ?? null,
			body.quantity ?? null,
			body.status ?? "unopened",
			body.photoFrontKey ?? null,
			body.photoBackKey ?? null,
			body.notes ?? null,
			body.sowIndoorStart ?? null,
			body.sowIndoorEnd ?? null,
			body.sowDirectStart ?? null,
			body.sowDirectEnd ?? null,
			body.depthIn ?? null,
			body.spacingIn ?? null,
			body.germDaysMin ?? null,
			body.germDaysMax ?? null,
			body.germTempFMin ?? null,
			body.germTempFMax ?? null,
			body.lightNeeds ?? null,
			body.daysToHarvestMin ?? null,
			body.daysToHarvestMax ?? null,
			body.sowMethod ?? null,
			body.bestSeason ?? null,
			body.transplantTiming ?? null,
			body.readyToTransplant ?? null,
			body.hardenOffDays ?? null,
			body.waterNeeds ?? null,
			body.soilNeeds ?? null,
			JSON.stringify(body.commonPests ?? []),
			id,
			user.id,
		)
		.run();

	const row = await c.env.DB.prepare("SELECT * FROM seeds WHERE id = ?").bind(id).first<SeedRow>();
	return c.json({ seed: mapSeedRow(row!) });
});

seedsRoutes.delete("/:id", async (c) => {
	const user = c.get("user");
	const id = c.req.param("id");
	const existing = await c.env.DB.prepare("SELECT id FROM seeds WHERE id = ? AND user_id = ?")
		.bind(id, user.id)
		.first();
	if (!existing) return c.json({ error: "Not found" }, 404);

	const plantedCount = await c.env.DB.prepare("SELECT COUNT(*) as count FROM planted WHERE seed_id = ?")
		.bind(id)
		.first<{ count: number }>();
	if (plantedCount && plantedCount.count > 0) {
		return c.json({ error: "Seed is referenced by planted rows", plantedCount: plantedCount.count }, 409);
	}

	await c.env.DB.prepare("DELETE FROM seeds WHERE id = ? AND user_id = ?").bind(id, user.id).run();
	return c.json({ ok: true });
});
