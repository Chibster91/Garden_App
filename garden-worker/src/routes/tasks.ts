import { Hono } from "hono";
import type { AppEnv } from "../lib/types";
import { requireAuth } from "../lib/session";
import { mapTaskRow, type PlantedRow, type TaskRow } from "../lib/dbRows";

export const tasksRoutes = new Hono<AppEnv>();
tasksRoutes.use("*", requireAuth);

const TASK_TYPES = new Set(["water", "transplant", "fertilize", "check_pests", "other"]);
const WATER_INTERVAL_DAYS = 3;
const ACTIVE_STAGES = new Set(["seedling", "vegetative", "flowering", "fruiting"]);

interface TaskBody {
	plantedId?: string | null;
	taskType?: string;
	title?: string;
	dueDate?: string;
}

function validateTaskBody(body: TaskBody): string | null {
	if (!body.taskType || !TASK_TYPES.has(body.taskType)) return "invalid taskType";
	if (!body.title || !body.title.trim()) return "title is required";
	if (!body.dueDate) return "dueDate is required";
	return null;
}

function addDays(date: Date, days: number): string {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result.toISOString().slice(0, 10);
}

tasksRoutes.get("/", async (c) => {
	const user = c.get("user");
	const dueBefore = c.req.query("dueBefore");
	const isDone = c.req.query("isDone");
	const plantedId = c.req.query("plantedId");

	const conditions = ["user_id = ?"];
	const params: (string | number)[] = [user.id];
	if (dueBefore) {
		conditions.push("due_date <= ?");
		params.push(dueBefore);
	}
	if (isDone !== undefined) {
		conditions.push("is_done = ?");
		params.push(isDone === "1" ? 1 : 0);
	}
	if (plantedId) {
		conditions.push("planted_id = ?");
		params.push(plantedId);
	}

	const { results } = await c.env.DB.prepare(
		`SELECT * FROM tasks WHERE ${conditions.join(" AND ")} ORDER BY due_date ASC`,
	)
		.bind(...params)
		.all<TaskRow>();

	return c.json({ tasks: results.map(mapTaskRow) });
});

tasksRoutes.post("/", async (c) => {
	const user = c.get("user");
	const body = await c.req.json<TaskBody>().catch(() => null);
	if (!body) return c.json({ error: "Invalid body" }, 400);
	const validationError = validateTaskBody(body);
	if (validationError) return c.json({ error: validationError }, 400);

	if (body.plantedId) {
		const planted = await c.env.DB.prepare("SELECT id FROM planted WHERE id = ? AND user_id = ?")
			.bind(body.plantedId, user.id)
			.first();
		if (!planted) return c.json({ error: "Planted item not found" }, 400);
	}

	const id = crypto.randomUUID();
	await c.env.DB.prepare(
		`INSERT INTO tasks (id, user_id, planted_id, task_type, title, due_date, source)
		 VALUES (?,?,?,?,?,?,'manual')`,
	)
		.bind(id, user.id, body.plantedId ?? null, body.taskType, body.title, body.dueDate)
		.run();

	const row = await c.env.DB.prepare("SELECT * FROM tasks WHERE id = ?").bind(id).first<TaskRow>();
	return c.json({ task: mapTaskRow(row!) }, 201);
});

tasksRoutes.put("/:id", async (c) => {
	const user = c.get("user");
	const id = c.req.param("id");
	const existing = await c.env.DB.prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?")
		.bind(id, user.id)
		.first();
	if (!existing) return c.json({ error: "Not found" }, 404);

	const body = await c.req.json<TaskBody>().catch(() => null);
	if (!body) return c.json({ error: "Invalid body" }, 400);
	const validationError = validateTaskBody(body);
	if (validationError) return c.json({ error: validationError }, 400);

	if (body.plantedId) {
		const planted = await c.env.DB.prepare("SELECT id FROM planted WHERE id = ? AND user_id = ?")
			.bind(body.plantedId, user.id)
			.first();
		if (!planted) return c.json({ error: "Planted item not found" }, 400);
	}

	await c.env.DB.prepare(
		`UPDATE tasks SET planted_id = ?, task_type = ?, title = ?, due_date = ?, updated_at = datetime('now')
		 WHERE id = ? AND user_id = ?`,
	)
		.bind(body.plantedId ?? null, body.taskType, body.title, body.dueDate, id, user.id)
		.run();

	const row = await c.env.DB.prepare("SELECT * FROM tasks WHERE id = ?").bind(id).first<TaskRow>();
	return c.json({ task: mapTaskRow(row!) });
});

tasksRoutes.post("/:id/complete", async (c) => {
	const user = c.get("user");
	const id = c.req.param("id");
	const existing = await c.env.DB.prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?")
		.bind(id, user.id)
		.first();
	if (!existing) return c.json({ error: "Not found" }, 404);

	await c.env.DB.prepare(
		"UPDATE tasks SET is_done = 1, done_at = datetime('now'), updated_at = datetime('now') WHERE id = ? AND user_id = ?",
	)
		.bind(id, user.id)
		.run();

	const row = await c.env.DB.prepare("SELECT * FROM tasks WHERE id = ?").bind(id).first<TaskRow>();
	return c.json({ task: mapTaskRow(row!) });
});

tasksRoutes.delete("/:id", async (c) => {
	const user = c.get("user");
	const id = c.req.param("id");
	const existing = await c.env.DB.prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?")
		.bind(id, user.id)
		.first();
	if (!existing) return c.json({ error: "Not found" }, 404);

	await c.env.DB.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?").bind(id, user.id).run();
	return c.json({ ok: true });
});

tasksRoutes.post("/generate", async (c) => {
	const user = c.get("user");

	const { results: plantedRows } = await c.env.DB.prepare("SELECT * FROM planted WHERE user_id = ?")
		.bind(user.id)
		.all<PlantedRow>();

	const activePlanted = plantedRows.filter((p) => ACTIVE_STAGES.has(p.stage));

	const created: TaskRow[] = [];
	for (const planted of activePlanted) {
		const ruleKey = `water-${planted.id}`;
		const openExisting = await c.env.DB.prepare(
			"SELECT id FROM tasks WHERE planted_id = ? AND rule_key = ? AND is_done = 0",
		)
			.bind(planted.id, ruleKey)
			.first();
		if (openExisting) continue;

		const seed = await c.env.DB.prepare("SELECT plant_name FROM seeds WHERE id = ?")
			.bind(planted.seed_id)
			.first<{ plant_name: string }>();

		const id = crypto.randomUUID();
		const dueDate = addDays(new Date(), WATER_INTERVAL_DAYS);
		await c.env.DB.prepare(
			`INSERT INTO tasks (id, user_id, planted_id, task_type, title, due_date, source, rule_key)
			 VALUES (?,?,?,?,?,?,'rule',?)`,
		)
			.bind(id, user.id, planted.id, "water", `Water ${seed?.plant_name ?? "plant"}`, dueDate, ruleKey)
			.run();

		const row = await c.env.DB.prepare("SELECT * FROM tasks WHERE id = ?").bind(id).first<TaskRow>();
		if (row) created.push(row);
	}

	return c.json({ created: created.map(mapTaskRow) });
});
