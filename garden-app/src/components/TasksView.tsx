import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { usePlanted } from "../hooks/usePlanted";
import { TaskDetailForm } from "./TaskDetailForm";
import { TASK_TYPE_LABELS } from "../tasks";
import type { Task, TaskInput } from "../types";

export function TasksView() {
	const { tasks, isLoading, error, add, save, complete, remove, generate } = useTasks();
	const { planted } = usePlanted();
	const [editing, setEditing] = useState<Task | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

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
			<TaskDetailForm
				task={editing}
				planted={planted}
				onSave={handleSave}
				onCancel={() => {
					setEditing(null);
					setIsCreating(false);
				}}
				onDelete={handleDelete}
			/>
		);
	}

	const open = tasks.filter((t) => !t.isDone).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
	const done = tasks.filter((t) => t.isDone);

	const handleGenerate = async () => {
		setIsGenerating(true);
		try {
			await generate();
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<h2 style={{ margin: 0, fontFamily: "var(--font-serif)" }}>Tasks</h2>
				<div style={{ display: "flex", gap: 8 }}>
					<button type="button" onClick={handleGenerate} disabled={isGenerating}>
						{isGenerating ? "Generating…" : "Generate"}
					</button>
					<button type="button" onClick={() => setIsCreating(true)}>
						+ Add task
					</button>
				</div>
			</div>

			{isLoading && <p>Loading…</p>}
			{error && <p style={{ color: "crimson" }}>{error}</p>}
			{!isLoading && open.length === 0 && <p>No open tasks. Nice work.</p>}

			<ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
				{open.map((task) => {
					const linked = task.plantedId ? plantedById.get(task.plantedId) : null;
					return (
						<li key={task.id} className="card" style={{ display: "flex", alignItems: "center", gap: 10 }}>
							<input type="checkbox" checked={false} onChange={() => complete(task.id)} />
							<button
								type="button"
								onClick={() => setEditing(task)}
								style={{ flex: 1, textAlign: "left", display: "flex", flexDirection: "column" }}
							>
								<strong>{task.title}</strong>
								<span style={{ color: "var(--text-muted)", fontSize: 13 }}>
									{TASK_TYPE_LABELS[task.taskType]} · due {task.dueDate}
									{linked && ` · ${linked.location ?? linked.id}`}
								</span>
							</button>
						</li>
					);
				})}
			</ul>

			{done.length > 0 && (
				<details>
					<summary style={{ color: "var(--text-muted)" }}>{done.length} completed</summary>
					<ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
						{done.map((task) => (
							<li key={task.id} style={{ padding: 8, color: "var(--text-muted)" }}>
								<span style={{ textDecoration: "line-through" }}>{task.title}</span>
							</li>
						))}
					</ul>
				</details>
			)}
		</div>
	);
}
