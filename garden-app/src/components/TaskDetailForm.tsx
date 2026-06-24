import { useState } from "react";
import { emptyTaskInput } from "../tasks";
import type { Planted, Task, TaskInput, TaskType } from "../types";

interface TaskDetailFormProps {
	task: Task | null;
	planted: Planted[];
	defaultPlantedId?: string | null;
	onSave: (input: TaskInput) => Promise<void>;
	onCancel: () => void;
	onDelete?: () => void;
}

const TASK_TYPE_OPTIONS: TaskType[] = ["water", "transplant", "fertilize", "check_pests", "other"];

const fieldStyle = { display: "flex", flexDirection: "column" as const, gap: 4 };
const labelStyle = { fontSize: 14, color: "var(--text-muted)" };
const rowStyle = { display: "flex", gap: 12 };

export function TaskDetailForm({ task, planted, defaultPlantedId, onSave, onCancel, onDelete }: TaskDetailFormProps) {
	const [input, setInput] = useState<TaskInput>(() =>
		task
			? { plantedId: task.plantedId, taskType: task.taskType, title: task.title, dueDate: task.dueDate }
			: emptyTaskInput(defaultPlantedId),
	);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const update = <K extends keyof TaskInput>(key: K, value: TaskInput[K]) => {
		setInput((prev) => ({ ...prev, [key]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.title.trim()) {
			setError("Title is required.");
			return;
		}
		setIsSaving(true);
		setError(null);
		try {
			await onSave(input);
		} catch {
			setError("Couldn't save task.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<div style={fieldStyle}>
				<label style={labelStyle}>Title *</label>
				<input value={input.title} onChange={(e) => update("title", e.target.value)} required />
			</div>

			<div style={rowStyle}>
				<div style={{ ...fieldStyle, flex: 1 }}>
					<label style={labelStyle}>Type</label>
					<select value={input.taskType} onChange={(e) => update("taskType", e.target.value as TaskType)}>
						{TASK_TYPE_OPTIONS.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>
				</div>
				<div style={{ ...fieldStyle, flex: 1 }}>
					<label style={labelStyle}>Due date</label>
					<input type="date" value={input.dueDate} onChange={(e) => update("dueDate", e.target.value)} required />
				</div>
			</div>

			<div style={fieldStyle}>
				<label style={labelStyle}>Linked planted item</label>
				<select value={input.plantedId ?? ""} onChange={(e) => update("plantedId", e.target.value || null)}>
					<option value="">None</option>
					{planted.map((p) => (
						<option key={p.id} value={p.id}>
							{p.location ? `${p.location} (${p.datePlanted})` : p.datePlanted}
						</option>
					))}
				</select>
			</div>

			{error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}

			<div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
				<div style={{ display: "flex", gap: 8 }}>
					<button type="submit" disabled={isSaving}>
						{isSaving ? "Saving…" : "Save"}
					</button>
					<button type="button" onClick={onCancel} disabled={isSaving}>
						Cancel
					</button>
				</div>
				{onDelete && (
					<button type="button" onClick={onDelete} disabled={isSaving} style={{ color: "crimson" }}>
						Delete
					</button>
				)}
			</div>
		</form>
	);
}
