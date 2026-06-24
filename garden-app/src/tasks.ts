import { api } from "./api";
import type { Task, TaskInput } from "./types";

export interface TaskFilters {
	dueBefore?: string;
	isDone?: boolean;
	plantedId?: string;
}

export function listTasks(filters?: TaskFilters): Promise<Task[]> {
	const params = new URLSearchParams();
	if (filters?.dueBefore) params.set("dueBefore", filters.dueBefore);
	if (filters?.isDone !== undefined) params.set("isDone", filters.isDone ? "1" : "0");
	if (filters?.plantedId) params.set("plantedId", filters.plantedId);
	const query = params.toString() ? `?${params.toString()}` : "";
	return api.get<{ tasks: Task[] }>(`/api/tasks${query}`).then((r) => r.tasks);
}

export function createTask(input: TaskInput): Promise<Task> {
	return api.post<{ task: Task }>("/api/tasks", input).then((r) => r.task);
}

export function updateTask(id: string, input: TaskInput): Promise<Task> {
	return api.put<{ task: Task }>(`/api/tasks/${id}`, input).then((r) => r.task);
}

export function completeTask(id: string): Promise<Task> {
	return api.post<{ task: Task }>(`/api/tasks/${id}/complete`).then((r) => r.task);
}

export function deleteTask(id: string): Promise<void> {
	return api.delete<void>(`/api/tasks/${id}`);
}

export function generateTasks(): Promise<Task[]> {
	return api.post<{ created: Task[] }>("/api/tasks/generate").then((r) => r.created);
}

export const TASK_TYPE_LABELS: Record<Task["taskType"], string> = {
	water: "Water",
	transplant: "Transplant",
	fertilize: "Fertilize",
	check_pests: "Check pests",
	other: "Other",
};

export function emptyTaskInput(plantedId?: string | null): TaskInput {
	return {
		plantedId: plantedId ?? null,
		taskType: "water",
		title: "",
		dueDate: new Date().toISOString().slice(0, 10),
	};
}
