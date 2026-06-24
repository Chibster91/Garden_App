import { useState } from "react";
import { useWeather } from "../hooks/useWeather";
import { useTasks } from "../hooks/useTasks";
import { TASK_TYPE_LABELS } from "../tasks";

interface TodayViewProps {
	onManageTasks?: () => void;
}

function formatDate(date: Date): string {
	return date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export function TodayView({ onManageTasks }: TodayViewProps) {
	const { weather, isLoading: isWeatherLoading, error: weatherError, needsLocation, setManualLocation, moonPhase, season } =
		useWeather();
	const { tasks, isLoading: isTasksLoading, complete } = useTasks();
	const [lat, setLat] = useState("");
	const [lon, setLon] = useState("");

	const today = new Date().toISOString().slice(0, 10);
	const dueTasks = tasks
		.filter((t) => !t.isDone && t.dueDate <= today)
		.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<div>
				<h2 style={{ margin: 0, fontFamily: "var(--font-serif)" }}>{formatDate(new Date())}</h2>
				<p style={{ margin: "4px 0", color: "var(--text-muted)" }}>
					{[season, moonPhase.name].filter(Boolean).join(" · ")}
				</p>
			</div>

			<div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
				<span className="icon-badge">☀️</span>
				<div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
					{needsLocation && (
						<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
							<p style={{ margin: 0 }}>Location access was denied. Enter your coordinates for weather:</p>
							<div style={{ display: "flex", gap: 8 }}>
								<input placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
								<input placeholder="Longitude" value={lon} onChange={(e) => setLon(e.target.value)} />
								<button
									type="button"
									onClick={() => {
										const latitude = Number(lat);
										const longitude = Number(lon);
										if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
											setManualLocation(latitude, longitude);
										}
									}}
								>
									Save
								</button>
							</div>
						</div>
					)}
					{!needsLocation && isWeatherLoading && <p style={{ margin: 0 }}>Loading weather…</p>}
					{!needsLocation && weatherError && <p style={{ margin: 0, color: "crimson" }}>{weatherError}</p>}
					{!needsLocation && weather && (
						<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
							<span>
								{weather.temperatureC !== null ? `${Math.round(weather.temperatureC)}°C` : "—"}
								{weather.precipitationProbability !== null && ` · ${weather.precipitationProbability}% rain`}
							</span>
							{weather.daylightHours !== null && <span>{weather.daylightHours.toFixed(1)} hours of daylight</span>}
						</div>
					)}
				</div>
			</div>

			<div>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
					<h3 style={{ margin: 0, fontFamily: "var(--font-serif)" }}>Today's tasks</h3>
					{onManageTasks && (
						<button
							type="button"
							onClick={onManageTasks}
							style={{
								background: "none",
								border: "none",
								color: "var(--accent)",
								fontSize: 14,
								cursor: "pointer",
								padding: 0,
							}}
						>
							Manage tasks →
						</button>
					)}
				</div>
				{isTasksLoading && <p>Loading…</p>}
				{!isTasksLoading && dueTasks.length === 0 && <p>Nothing due today.</p>}
				<ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
					{dueTasks.map((task) => (
						<li key={task.id} className="card" style={{ display: "flex", alignItems: "center", gap: 10 }}>
							<input type="checkbox" checked={false} onChange={() => complete(task.id)} />
							<div style={{ display: "flex", flexDirection: "column" }}>
								<strong>{task.title}</strong>
								<span style={{ color: "var(--text-muted)", fontSize: 13 }}>
									{TASK_TYPE_LABELS[task.taskType]}
									{task.dueDate < today && " · overdue"}
								</span>
							</div>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
