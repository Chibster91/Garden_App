import { useState } from "react";
import { useWeather } from "../hooks/useWeather";
import { useTasks } from "../hooks/useTasks";
import { useSeeds } from "../hooks/useSeeds";
import type { Seed, SeedStatus, Task, TaskType } from "../types";

interface TodayViewProps {
	onManageTasks?: () => void;
	onAddJournal?: () => void;
	onAddPlanted?: () => void;
	onAddSeed?: () => void;
}

const TASK_ICONS: Record<TaskType, string> = {
	water: "💧",
	transplant: "🌱",
	fertilize: "🧪",
	check_pests: "🔎",
	other: "✓",
};

const TASK_ICON_BG: Record<TaskType, string> = {
	water:       "#e1f0fb",
	transplant:  "#DDE8D6",
	fertilize:   "#fff8e1",
	check_pests: "#fce4ec",
	other:       "#F5EDE1",
};

const STATUS_GRAD: Record<SeedStatus, [string, string]> = {
	unopened: ["#D9EBCB", "#96B982"],
	opened:   ["#FAEBCB", "#E2B56E"],
	low:      ["#F6D8B4", "#D48561"],
	empty:    ["#e0e0e0", "#c4c4c4"],
};

const STATUS_LABEL: Record<SeedStatus, string> = {
	unopened: "Unopened",
	opened:   "Use soon",
	low:      "Low",
	empty:    "Empty",
};

function seedEmoji(name: string): string {
	const n = name.toLowerCase();
	if (n.includes("tomato")) return "🍅";
	if (n.includes("basil")) return "🌿";
	if (n.includes("lettuce") || n.includes("arugula") || n.includes("spinach")) return "🥬";
	if (n.includes("cucumber")) return "🥒";
	if (n.includes("onion") || n.includes("leek") || n.includes("scallion") || n.includes("chive")) return "🧅";
	if (n.includes("pepper") || n.includes("chili") || n.includes("chile")) return "🌶️";
	if (n.includes("carrot")) return "🥕";
	if (n.includes("pea")) return "🫛";
	if (n.includes("bean") || n.includes("chickpea")) return "🫘";
	if (n.includes("squash") || n.includes("zucchini") || n.includes("pumpkin")) return "🎃";
	if (n.includes("corn")) return "🌽";
	if (n.includes("broccoli") || n.includes("cabbage") || n.includes("kale") || n.includes("chard")) return "🥦";
	if (n.includes("eggplant") || n.includes("aubergine")) return "🍆";
	if (n.includes("flower") || n.includes("zinnia") || n.includes("marigold")) return "🌸";
	if (n.includes("sunflower")) return "🌻";
	if (n.includes("mint") || n.includes("herb")) return "🌿";
	return "🌱";
}

function formatDateFull(date: Date): string {
	return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

const W = { color: "rgba(255,255,255,.65)", fontSize: 13 as const };
const WH = { color: "#fff" as const };

export function TodayView({ onManageTasks, onAddJournal, onAddPlanted, onAddSeed }: TodayViewProps) {
	const { weather, isLoading: isWeatherLoading, error: weatherError, needsLocation, setManualLocation, moonPhase, season } = useWeather();
	const { tasks, isLoading: isTasksLoading, complete } = useTasks();
	const { seeds } = useSeeds();
	const [lat, setLat] = useState("");
	const [lon, setLon] = useState("");

	const today = new Date().toISOString().slice(0, 10);
	const dueTasks = tasks
		.filter((t) => !t.isDone && t.dueDate <= today)
		.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
	const attnSeeds = seeds.filter((s) => s.status === "opened" || s.status === "low");

	return (
		<div style={{ flex: 1, overflowY: "auto", background: "#5E7A5E" }}>

			{/* ── Page header ───────────────────────────────────────────────── */}
			<div style={{ padding: "calc(18px + env(safe-area-inset-top)) 18px 20px", position: "relative", overflow: "hidden" }}>
				{/* Decorative branch */}
				<div style={{ position: "absolute", top: 4, left: 12, pointerEvents: "none", opacity: 0.28 }}>
					<svg width={66} height={66} viewBox="0 0 80 80" fill="none" stroke="#fff" strokeWidth="1" style={{ display: "block" }}>
						<path d="M10 80 C20 60,30 40,40 25" /><path d="M30 50 C22 40,14 38,10 32" />
						<path d="M38 32 C46 22,54 20,58 14" />
						<circle cx="40" cy="20" r="3" fill="#fff" /><circle cx="43" cy="14" r="2" fill="#fff" />
						<circle cx="37" cy="12" r="2" fill="#fff" /><circle cx="58" cy="9" r="3" fill="#fff" />
					</svg>
				</div>
				<div style={{ position: "relative", zIndex: 1 }}>
					<div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.5)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 2 }}>
						{formatDateFull(new Date())}
					</div>
					<h1 style={{ margin: "0 0 5px", fontFamily: "Lora, Georgia, serif", fontSize: 46, fontWeight: 700, color: "#fff", lineHeight: 0.92, letterSpacing: "-1.5px" }}>
						Today
					</h1>
					<div style={W}>
						{season && `${season} · `}
						{moonPhase.emoji} {moonPhase.name}
					</div>
				</div>
			</div>

			{/* ── Content ───────────────────────────────────────────────────── */}
			<div style={{ padding: "0 15px 28px", display: "flex", flexDirection: "column", gap: 13 }}>

				{/* Weather card */}
				<div style={{ background: "#F8F4EC", border: "1px solid #D9E2D0", borderRadius: 28, padding: 18, boxShadow: "0 8px 28px rgba(36,53,40,.14)", overflow: "hidden", position: "relative" }}>
					<div style={{ position: "absolute", width: 120, height: 120, right: -50, top: -60, borderRadius: "50%", background: "rgba(142,167,131,.18)", pointerEvents: "none" }} />

					{needsLocation && (
						<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
							<p style={{ margin: 0, fontSize: 13, color: "#687766" }}>Location access denied. Enter coordinates for weather:</p>
							<div style={{ display: "flex", gap: 8 }}>
								<input placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} style={{ flex: 1 }} />
								<input placeholder="Longitude" value={lon} onChange={(e) => setLon(e.target.value)} style={{ flex: 1 }} />
								<button type="button" onClick={() => { const a = Number(lat), o = Number(lon); if (Number.isFinite(a) && Number.isFinite(o)) setManualLocation(a, o); }}>
									Save
								</button>
							</div>
						</div>
					)}
					{!needsLocation && isWeatherLoading && <p style={{ margin: 0, color: "#687766", fontSize: 13 }}>Loading weather…</p>}
					{!needsLocation && weatherError && <p style={{ margin: 0, color: "#c62828", fontSize: 13 }}>{weatherError}</p>}

					{!needsLocation && weather && (
						<div style={{ position: "relative", zIndex: 1 }}>
							<div style={{ display: "flex", gap: 14 }}>
								<div style={{ flex: 1 }}>
									<div style={{ fontSize: 52, lineHeight: 0.88, fontWeight: 800, color: "#35513B", letterSpacing: "-2px" }}>
										{weather.temperatureC !== null ? `${Math.round(weather.temperatureC)}°` : "—"}
									</div>
									{weather.precipitationProbability !== null && (
										<div style={{ color: "#687766", fontSize: 13, marginTop: 7 }}>
											{weather.precipitationProbability}% chance of rain
										</div>
									)}
								</div>
								<div style={{ textAlign: "right" }}>
									<div style={{ fontSize: 30, marginBottom: 3 }}>{moonPhase.emoji}</div>
									<div style={{ fontSize: 12, color: "#35513B", fontWeight: 700 }}>{moonPhase.name}</div>
									{weather.daylightHours !== null && (
										<div style={{ fontSize: 11, color: "#687766", marginTop: 2 }}>{weather.daylightHours.toFixed(1)}h daylight</div>
									)}
								</div>
							</div>
							<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14 }}>
								{([
									[weather.precipitationProbability !== null ? `${weather.precipitationProbability}%` : "—", "Rain"],
									[weather.temperatureC !== null ? `${Math.round(weather.temperatureC * 9 / 5 + 32)}°F` : "—", "Temp °F"],
									[weather.daylightHours !== null ? `${weather.daylightHours.toFixed(0)}h` : "—", "Daylight"],
								] as [string, string][]).map(([v, l]) => (
									<div key={l} style={{ background: "#DDE8D6", borderRadius: 15, padding: "9px 8px", textAlign: "center" }}>
										<strong style={{ display: "block", color: "#35513B", fontSize: 15 }}>{v}</strong>
										<span style={{ display: "block", color: "#687766", fontSize: 11, marginTop: 3, fontWeight: 700 }}>{l}</span>
									</div>
								))}
							</div>
						</div>
					)}

					{!needsLocation && !weather && !isWeatherLoading && !weatherError && (
						<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
							<span style={{ fontSize: 28 }}>{moonPhase.emoji}</span>
							<div>
								<div style={{ fontWeight: 700, color: "#35513B" }}>{moonPhase.name}</div>
								{season && <div style={{ fontSize: 13, color: "#687766" }}>{season}</div>}
							</div>
						</div>
					)}
				</div>

				{/* Today's reminders */}
				<div>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
						<h2 style={{ margin: 0, fontFamily: "Lora, Georgia, serif", fontSize: 18, ...WH }}>Today's reminders</h2>
						{onManageTasks && (
							<button type="button" onClick={onManageTasks} style={{ background: "none", border: "none", ...W, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
								View all
							</button>
						)}
					</div>

					{isTasksLoading && <p style={W}>Loading…</p>}
					{!isTasksLoading && dueTasks.length === 0 && (
						<div style={{ background: "#F8F4EC", border: "1px solid #D9E2D0", borderRadius: 22, padding: 14, textAlign: "center", color: "#687766", fontSize: 13 }}>
							Nothing due today 🎉
						</div>
					)}

					<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
						{dueTasks.slice(0, 3).map((task: Task) => {
							const isOv = task.dueDate < today;
							return (
								<div key={task.id} style={{ display: "flex", alignItems: "center", gap: 11, background: "#F8F4EC", border: `1px solid ${isOv ? "#f48fb1" : "#D9E2D0"}`, borderRadius: 22, padding: "11px 12px", boxShadow: "0 3px 10px rgba(36,53,40,.09)" }}>
									<div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 13, background: TASK_ICON_BG[task.taskType], display: "grid", placeItems: "center", fontSize: 18 }}>
										{TASK_ICONS[task.taskType]}
									</div>
									<div style={{ flex: 1, minWidth: 0 }}>
										<div style={{ fontWeight: 700, color: "#243528", fontSize: 14, lineHeight: 1.2 }}>{task.title}</div>
										<div style={{ marginTop: 2, fontSize: 11, color: isOv ? "#c2185b" : "#687766", fontWeight: isOv ? 700 : 400 }}>
											{isOv ? `Overdue · ${task.dueDate}` : "Due today"}
										</div>
									</div>
									<button type="button" onClick={() => complete(task.id)} aria-label="Mark done" style={{ width: 26, height: 26, borderRadius: 999, border: "2px solid #D9E2D0", background: "#fff", flexShrink: 0, cursor: "pointer" }} />
								</div>
							);
						})}
					</div>
				</div>

				{/* Quick actions */}
				<div>
					<h2 style={{ margin: "0 0 9px", fontFamily: "Lora, Georgia, serif", fontSize: 18, ...WH }}>Quick actions</h2>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
						{[
							{ e: "📸", t: "Add seed", n: "Log a new packet", fn: onAddSeed },
							{ e: "📓", t: "Journal note", n: "Log pests or harvests", fn: onAddJournal },
							{ e: "🪴", t: "Add planted", n: "Track what's growing", fn: onAddPlanted },
							{ e: "📋", t: "Add task", n: "Schedule a garden task", fn: onManageTasks },
						].map((a) => (
							<button key={a.t} type="button" onClick={a.fn} style={{ border: "1px solid #D9E2D0", background: "linear-gradient(145deg,#F8F4EC,#EFF5EA)", borderRadius: 22, padding: 13, textAlign: "left", boxShadow: "0 4px 14px rgba(40,63,44,.07)", minHeight: 96, cursor: "pointer" }}>
								<div style={{ fontSize: 22, marginBottom: 6 }}>{a.e}</div>
								<strong style={{ display: "block", color: "#243528", fontSize: 13.5 }}>{a.t}</strong>
								<span style={{ display: "block", marginTop: 3, color: "#687766", fontSize: 12, lineHeight: 1.3 }}>{a.n}</span>
							</button>
						))}
					</div>
				</div>

				{/* Seeds to use soon */}
				{attnSeeds.length > 0 && (
					<div>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
							<h2 style={{ margin: 0, fontFamily: "Lora, Georgia, serif", fontSize: 18, ...WH }}>Seeds to use soon</h2>
							<button type="button" onClick={onAddSeed} style={{ background: "none", border: "none", ...W, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
								All seeds
							</button>
						</div>
						<div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
							{attnSeeds.map((seed: Seed) => (
								<div key={seed.id} style={{ minWidth: 136, border: "1px solid #D9E2D0", background: "#F8F4EC", borderRadius: 20, padding: 10, boxShadow: "0 3px 10px rgba(36,53,40,.09)", flexShrink: 0 }}>
									<div style={{ height: 64, borderRadius: 12, background: `linear-gradient(145deg,${STATUS_GRAD[seed.status][0]},${STATUS_GRAD[seed.status][1]})`, display: "grid", placeItems: "center", fontSize: 28, marginBottom: 8 }}>
										{seedEmoji(seed.plantName)}
									</div>
									<strong style={{ display: "block", color: "#243528", fontSize: 13, lineHeight: 1.2 }}>{seed.plantName}</strong>
									<div style={{ marginTop: 5 }}>
										<span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 999, background: "#DDE8D6", color: "#35513B", fontSize: 11, fontWeight: 800 }}>
											{STATUS_LABEL[seed.status]}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

			</div>
		</div>
	);
}
