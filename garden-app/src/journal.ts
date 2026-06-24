import { api } from "./api";
import type { JournalEntry, JournalEntryInput, JournalEntryType } from "./types";

export interface JournalFilters {
	plantedId?: string;
	type?: JournalEntryType;
	tag?: string;
	from?: string;
	to?: string;
}

export function listJournalEntries(filters?: JournalFilters): Promise<JournalEntry[]> {
	const params = new URLSearchParams();
	if (filters?.plantedId) params.set("plantedId", filters.plantedId);
	if (filters?.type) params.set("type", filters.type);
	if (filters?.tag) params.set("tag", filters.tag);
	if (filters?.from) params.set("from", filters.from);
	if (filters?.to) params.set("to", filters.to);
	const query = params.toString() ? `?${params.toString()}` : "";
	return api.get<{ entries: JournalEntry[] }>(`/api/journal${query}`).then((r) => r.entries);
}

export function getJournalEntry(id: string): Promise<JournalEntry> {
	return api.get<{ entry: JournalEntry }>(`/api/journal/${id}`).then((r) => r.entry);
}

export function createJournalEntry(input: JournalEntryInput): Promise<JournalEntry> {
	return api.post<{ entry: JournalEntry }>("/api/journal", input).then((r) => r.entry);
}

export function updateJournalEntry(id: string, input: JournalEntryInput): Promise<JournalEntry> {
	return api.put<{ entry: JournalEntry }>(`/api/journal/${id}`, input).then((r) => r.entry);
}

export function deleteJournalEntry(id: string): Promise<void> {
	return api.delete<void>(`/api/journal/${id}`);
}

export const JOURNAL_ENTRY_TYPE_LABELS: Record<JournalEntryType, string> = {
	observation: "Observation",
	pest: "Pest",
	harvest: "Harvest",
	action: "Action",
	note: "Note",
};

export function emptyJournalEntryInput(plantedId?: string | null): JournalEntryInput {
	return {
		plantedId: plantedId ?? null,
		entryType: "observation",
		entryDate: new Date().toISOString().slice(0, 10),
		tags: [],
		text: null,
		photoKeys: [],
	};
}
