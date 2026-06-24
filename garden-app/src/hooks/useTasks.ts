import { useCallback, useEffect, useState } from "react";
import { listTasks, createTask, updateTask, completeTask, deleteTask, generateTasks } from "../tasks";
import type { Task, TaskInput } from "../types";

export function useTasks() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		listTasks()
			.then((result) => {
				setTasks(result);
				setError(null);
			})
			.catch(() => setError("Couldn't load tasks."))
			.finally(() => setIsLoading(false));
	}, []);

	const refresh = useCallback(() => {
		setIsLoading(true);
		setError(null);
		return listTasks()
			.then((result) => setTasks(result))
			.catch(() => setError("Couldn't load tasks."))
			.finally(() => setIsLoading(false));
	}, []);

	const add = useCallback(async (input: TaskInput) => {
		const task = await createTask(input);
		setTasks((prev) => [...prev, task]);
		return task;
	}, []);

	const save = useCallback(async (id: string, input: TaskInput) => {
		const task = await updateTask(id, input);
		setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
		return task;
	}, []);

	const complete = useCallback(async (id: string) => {
		const task = await completeTask(id);
		setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
		return task;
	}, []);

	const remove = useCallback(async (id: string) => {
		await deleteTask(id);
		setTasks((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const generate = useCallback(async () => {
		const created = await generateTasks();
		if (created.length > 0) setTasks((prev) => [...prev, ...created]);
		return created;
	}, []);

	return { tasks, isLoading, error, refresh, add, save, complete, remove, generate };
}
