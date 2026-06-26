import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { usePlanted } from "../hooks/usePlanted";
import { useSeeds } from "../hooks/useSeeds";
import { TaskDetailForm } from "./TaskDetailForm";
import { PageHdr, GreenHdr, Scroll, EmptyState } from "./ViewHeaders";
import type { Task, TaskInput, TaskType } from "../types";

const TASK_ICONS: Record<TaskType, string> = { water: "💧", transplant: "🌱", fertilize: "🧪", check_pests: "🔎", other: "✓" };
const TASK_TYPE_LABELS: Record<TaskType, string> = { water: "Water", transplant: "Transplant", fertilize: "Fertilize", check_pests: "Check pests", other: "Other" };
const TASK_ICON_BG: Record<TaskType, string> = { water: "#e1f0fb", transplant: "#DDE8D6", fertilize: "#fff8e1", check_pests: "#fce4ec", other: "#F5EDE1" };

interface TasksViewProps {
	onBack?: () => void;
}

export function TasksView({ onBack }: TasksViewProps) {
	const { tasks, isLoading, error, add, save, complete, remove, generate } = useTasks();
	const { planted } = usePlanted();
	const { seeds } = useSeeds();
	const [editing, setEditing] = useState<Task | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [showDone, setShowDone] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

	const seedById = new Map(seeds.map((s) => [s.id, s]));
	const plantedById = new Map(planted.map((p) => [p.id, p]));

	if (isCreating || editing) {
		const handleSave = async (input: TaskInput) => {
			if (editing) {
				await save(editing.id, input);
			} else {
				await add(input);
			}
			setEditing(null);
			setIsCreating(false);
		};

		const handleDelete = editing
			? async () => {
					if (!confirm("Delete this task?")) return;
					await remove(editing.id);
					setEditing(null);
				}
			: undefined;

		return (
			<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
				<GreenHdr title={editing ? "Edit Task" : "New Task"} onBack={() => { setEditing(null); setIsCreating(false); }} />
				<Scroll>
					<TaskDetailForm
						task={editing}
						planted={planted}
						onSave={handleSave}
						onCancel={() => { setEditing(null); setIsCreating(false); }}
						onDelete={handleDelete}
					/>
				</Scroll>
			</div>
		);
	}

	const today = new Date().toISOString().slice(0, 10);
	const overdue = tasks.filter((t) => !t.isDone && t.dueDate < today).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
	const dueToday = tasks.filter((t) => !t.isDone && t.dueDate === today);
	const upcoming = tasks.filter((t) => !t.isDone && t.dueDate > today).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
	const done = tasks.filter((t) => t.isDone);

	const handleGenerate = async () => {
		setIsGenerating(true);
		try { await generate(); } finally { setIsGenerating(false); }
	};

	function TaskRow({ task }: { task: Task }) {
		const pl = task.plantedId ? plantedById.get(task.plantedId) : null;
		const seed = pl ? seedById.get(pl.seedId) : null;
		const isOv = task.dueDate < today;
		return (
			<div style={{ display: "flex", alignItems: "center", gap: 11, background: "#F8F4EC", border: `1px solid ${isOv && !task.isDone ? "#f48fb1" : "#D9E2D0"}`, borderRadius: 22, padding: "11px 12px", boxShadow: "0 3px 10px rgba(36,53,40,.09)" }}>
				<div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 13, background: TASK_ICON_BG[task.taskType], display: "grid", placeItems: "center", fontSize: 18 }}>
					{TASK_ICONS[task.taskType]}
				</div>
				<button type="button" onClick={() => setEditing(task)} style={{ flex: 1, textAlign: "left", padding: 0, minWidth: 0, background: "none", border: "none", cursor: "pointer" }}>
					<div style={{ fontWeight: 700, color: "#243528", fontSize: 14.5, lineHeight: 1.2, textDecoration: task.isDone ? "line-through" : "none", opacity: task.isDone ? 0.5 : 1 }}>
						{task.title}
					</div>
					<div style={{ marginTop: 2, display: "flex", gap: 6, fontSize: 11, color: "#687766", flexWrap: "wrap" }}>
						<span style={{ fontWeight: 600 }}>{TASK_TYPE_LABELS[task.taskType]}</span>
						{seed && <span style={{ color: "#35513B" }}>· 🌱 {seed.plantName}</span>}
						<span style={{ color: isOv && !task.isDone ? "#c2185b" : "#687766", fontWeight: isOv && !task.isDone ? 700 : 400 }}>
							· {task.dueDate === today ? "Due today" : isOv ? `Overdue · ${task.dueDate}` : task.dueDate}
						</span>
					</div>
				</button>
				<button
					type="button"
					onClick={() => complete(task.id)}
					disabled={task.isDone}
					style={{ width: 26, height: 26, borderRadius: 999, border: `2px solid ${task.isDone ? "#35513B" : "#D9E2D0"}`, background: task.isDone ? "#35513B" : "#fff", flexShrink: 0, cursor: task.isDone ? "default" : "pointer", display: "grid", placeItems: "center", transition: "all .15s" }}
				>
					{task.isDone && <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>✓</span>}
				</button>
			</div>
		);
	}

	function Section({ label, items, labelColor }: { label: string; items: Task[]; labelColor?: string }) {
		if (items.length === 0) return null;
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
				<div style={{ fontSize: 11, fontWeight: 800, color: labelColor ?? "#687766", letterSpacing: ".07em", textTransform: "uppercase" }}>{label}</div>
				{items.map((t) => <TaskRow key={t.id} task={t} />)}
			</div>
		);
	}

	return (
		<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
			<PageHdr title="Tasks" onAdd={undefined}>
				<div style={{ color: "rgba(255,255,255,.65)", fontSize: 12 }}>
					{overdue.length + dueToday.length} due today · {upcoming.length} upcoming
				</div>
			</PageHdr>

			<Scroll>
				{isLoading && <p style={{ color: "#687766" }}>Loading…</p>}
				{error && <p style={{ color: "#c62828" }}>{error}</p>}

				<div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
					<button type="button" onClick={handleGenerate} disabled={isGenerating} style={{ padding: "8px 13px", borderRadius: 999, background: "#DDE8D6", color: "#35513B", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>
						{isGenerating ? "Generating…" : "⚡ Generate"}
					</button>
					<button type="button" onClick={() => setIsCreating(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 13px", borderRadius: 999, background: "#35513B", color: "#fff", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>
						+ Add task
					</button>
				</div>

				{!isLoading && tasks.length === 0 && (
					<EmptyState emoji="✅" title="All done!" sub="No open tasks. Nice work, gardener." />
				)}

				<Section label="Overdue" items={overdue} labelColor="#c2185b" />
				<Section label="Due Today" items={dueToday} labelColor="#35513B" />
				<Section label="Upcoming" items={upcoming} />

				{done.length > 0 && (
					<div>
						<button type="button" onClick={() => setShowDone(!showDone)} style={{ fontSize: 12, fontWeight: 700, color: "#687766", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}>
							{showDone ? "▾" : "▸"} {done.length} completed
						</button>
						{showDone && (
							<div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 7 }}>
								{done.map((t) => <TaskRow key={t.id} task={t} />)}
							</div>
						)}
					</div>
				)}

				{onBack && (
					<button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 20px", borderRadius: 22, background: "transparent", color: "#35513B", fontSize: 15, fontWeight: 700, border: "1.5px solid #35513B", minHeight: 50, width: "100%", cursor: "pointer", marginTop: 4 }}>
						← Back to Today
					</button>
				)}
			</Scroll>
		</div>
	);
}
