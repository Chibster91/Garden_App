import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppEnv } from "./lib/types";
import { authRoutes } from "./routes/auth";
import { seedsRoutes } from "./routes/seeds";
import { plantedRoutes } from "./routes/planted";
import { journalRoutes } from "./routes/journal";
import { tasksRoutes } from "./routes/tasks";
import { photosRoutes } from "./routes/photos";

const ALLOWED_ORIGINS = new Set([
	"http://localhost:5173",
	"http://localhost:5174",
	"http://localhost:4173",
]);

const app = new Hono<AppEnv>();

app.use(
	"*",
	cors({
		origin: (origin) => (origin && ALLOWED_ORIGINS.has(origin) ? origin : ""),
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
	}),
);

app.get("/", (c) => c.json({ ok: true, service: "garden-worker" }));

app.route("/api/auth", authRoutes);
app.route("/api/seeds", seedsRoutes);
app.route("/api/planted", plantedRoutes);
app.route("/api/journal", journalRoutes);
app.route("/api/tasks", tasksRoutes);
app.route("/api/photos", photosRoutes);

export default app;
