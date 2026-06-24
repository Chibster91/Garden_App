import { useCallback, useEffect, useState } from "react";
import { listSeeds, createSeed, updateSeed, deleteSeed } from "../seeds";
import type { Seed, SeedInput } from "../types";

export function useSeeds() {
	const [seeds, setSeeds] = useState<Seed[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		listSeeds()
			.then((result) => {
				setSeeds(result);
				setError(null);
			})
			.catch(() => setError("Couldn't load seeds."))
			.finally(() => setIsLoading(false));
	}, []);

	const refresh = useCallback(() => {
		setIsLoading(true);
		setError(null);
		return listSeeds()
			.then((result) => setSeeds(result))
			.catch(() => setError("Couldn't load seeds."))
			.finally(() => setIsLoading(false));
	}, []);

	const add = useCallback(async (input: SeedInput) => {
		const seed = await createSeed(input);
		setSeeds((prev) => [seed, ...prev]);
		return seed;
	}, []);

	const save = useCallback(async (id: string, input: SeedInput) => {
		const seed = await updateSeed(id, input);
		setSeeds((prev) => prev.map((s) => (s.id === id ? seed : s)));
		return seed;
	}, []);

	const remove = useCallback(async (id: string) => {
		await deleteSeed(id);
		setSeeds((prev) => prev.filter((s) => s.id !== id));
	}, []);

	return { seeds, isLoading, error, refresh, add, save, remove };
}
