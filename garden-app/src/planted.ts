import { api } from "./api";
import type { Planted, PlantedInput, PlantedStage, Seed } from "./types";

export function listPlanted(filters?: { stage?: PlantedStage; seedId?: string }): Promise<Planted[]> {
	const params = new URLSearchParams();
	if (filters?.stage) params.set("stage", filters.stage);
	if (filters?.seedId) params.set("seedId", filters.seedId);
	const query = params.toString() ? `?${params.toString()}` : "";
	return api.get<{ planted: Planted[] }>(`/api/planted${query}`).then((r) => r.planted);
}

export function getPlanted(id: string): Promise<{ planted: Planted; seed: Seed | null }> {
	return api.get<{ planted: Planted; seed: Seed | null }>(`/api/planted/${id}`);
}

export function createPlanted(input: PlantedInput): Promise<Planted> {
	return api.post<{ planted: Planted }>("/api/planted", input).then((r) => r.planted);
}

export function updatePlanted(id: string, input: PlantedInput): Promise<Planted> {
	return api.put<{ planted: Planted }>(`/api/planted/${id}`, input).then((r) => r.planted);
}

export function deletePlanted(id: string): Promise<void> {
	return api.delete<void>(`/api/planted/${id}`);
}

export const PLANTED_STAGE_LABELS: Record<PlantedStage, string> = {
	seedling: "Seedling",
	vegetative: "Vegetative",
	flowering: "Flowering",
	fruiting: "Fruiting",
	harvested: "Harvested",
	removed: "Removed",
};

export function emptyPlantedInput(seedId: string): PlantedInput {
	return {
		seedId,
		location: null,
		datePlanted: new Date().toISOString().slice(0, 10),
		stage: "seedling",
		photoKeys: [],
	};
}
