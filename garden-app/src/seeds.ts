import { api } from "./api";
import type { Seed, SeedInput, SeedStatus, SowMethod } from "./types";

export function listSeeds(status?: SeedStatus): Promise<Seed[]> {
	const query = status ? `?status=${encodeURIComponent(status)}` : "";
	return api.get<{ seeds: Seed[] }>(`/api/seeds${query}`).then((r) => r.seeds);
}

export function getSeed(id: string): Promise<Seed> {
	return api.get<{ seed: Seed }>(`/api/seeds/${id}`).then((r) => r.seed);
}

export function createSeed(input: SeedInput): Promise<Seed> {
	return api.post<{ seed: Seed }>("/api/seeds", input).then((r) => r.seed);
}

export function updateSeed(id: string, input: SeedInput): Promise<Seed> {
	return api.put<{ seed: Seed }>(`/api/seeds/${id}`, input).then((r) => r.seed);
}

export function deleteSeed(id: string): Promise<void> {
	return api.delete<void>(`/api/seeds/${id}`);
}

export const SEED_STATUS_LABELS: Record<SeedStatus, string> = {
	unopened: "Unopened",
	opened: "Opened",
	low: "Low",
	empty: "Empty",
};

export const SOW_METHOD_LABELS: Record<SowMethod, string> = {
	start_indoors: "Start indoors",
	direct_sow: "Direct sow",
	either: "Indoors or direct",
};

export const LIGHT_NEEDS_LABELS: Record<string, string> = {
	full_sun: "Full sun",
	partial_sun: "Partial sun",
	shade: "Shade",
};

export function emptySeedInput(): SeedInput {
	return {
		plantName: "",
		variety: null,
		brand: null,
		year: null,
		quantity: null,
		status: "unopened",
		photoFrontKey: null,
		photoBackKey: null,
		notes: null,
		sowIndoorStart: null,
		sowIndoorEnd: null,
		sowDirectStart: null,
		sowDirectEnd: null,
		depthIn: null,
		spacingIn: null,
		germDaysMin: null,
		germDaysMax: null,
		germTempFMin: null,
		germTempFMax: null,
		lightNeeds: null,
		daysToHarvestMin: null,
		daysToHarvestMax: null,
		sowMethod: null,
		bestSeason: null,
		transplantTiming: null,
		readyToTransplant: null,
		hardenOffDays: null,
		waterNeeds: null,
		soilNeeds: null,
		commonPests: [],
	};
}
