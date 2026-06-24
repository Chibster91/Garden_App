import { useCallback, useEffect, useState } from "react";
import { listPlanted, createPlanted, updatePlanted, deletePlanted } from "../planted";
import type { Planted, PlantedInput } from "../types";

export function usePlanted() {
	const [planted, setPlanted] = useState<Planted[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		listPlanted()
			.then((result) => {
				setPlanted(result);
				setError(null);
			})
			.catch(() => setError("Couldn't load planted items."))
			.finally(() => setIsLoading(false));
	}, []);

	const refresh = useCallback(() => {
		setIsLoading(true);
		setError(null);
		return listPlanted()
			.then((result) => setPlanted(result))
			.catch(() => setError("Couldn't load planted items."))
			.finally(() => setIsLoading(false));
	}, []);

	const add = useCallback(async (input: PlantedInput) => {
		const item = await createPlanted(input);
		setPlanted((prev) => [item, ...prev]);
		return item;
	}, []);

	const save = useCallback(async (id: string, input: PlantedInput) => {
		const item = await updatePlanted(id, input);
		setPlanted((prev) => prev.map((p) => (p.id === id ? item : p)));
		return item;
	}, []);

	const remove = useCallback(async (id: string) => {
		await deletePlanted(id);
		setPlanted((prev) => prev.filter((p) => p.id !== id));
	}, []);

	return { planted, isLoading, error, refresh, add, save, remove };
}
