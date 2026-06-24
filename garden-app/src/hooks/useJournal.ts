import { useCallback, useEffect, useState } from "react";
import {
	listJournalEntries,
	createJournalEntry,
	updateJournalEntry,
	deleteJournalEntry,
	type JournalFilters,
} from "../journal";
import type { JournalEntry, JournalEntryInput } from "../types";

export function useJournal(filters?: JournalFilters) {
	const [entries, setEntries] = useState<JournalEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const plantedId = filters?.plantedId;
	const type = filters?.type;
	const tag = filters?.tag;
	const from = filters?.from;
	const to = filters?.to;

	useEffect(() => {
		listJournalEntries({ plantedId, type, tag, from, to })
			.then((result) => {
				setEntries(result);
				setError(null);
			})
			.catch(() => setError("Couldn't load journal entries."))
			.finally(() => setIsLoading(false));
	}, [plantedId, type, tag, from, to]);

	const refresh = useCallback(() => {
		setIsLoading(true);
		setError(null);
		return listJournalEntries({ plantedId, type, tag, from, to })
			.then((result) => setEntries(result))
			.catch(() => setError("Couldn't load journal entries."))
			.finally(() => setIsLoading(false));
	}, [plantedId, type, tag, from, to]);

	const add = useCallback(async (input: JournalEntryInput) => {
		const entry = await createJournalEntry(input);
		setEntries((prev) => [entry, ...prev]);
		return entry;
	}, []);

	const save = useCallback(async (id: string, input: JournalEntryInput) => {
		const entry = await updateJournalEntry(id, input);
		setEntries((prev) => prev.map((e) => (e.id === id ? entry : e)));
		return entry;
	}, []);

	const remove = useCallback(async (id: string) => {
		await deleteJournalEntry(id);
		setEntries((prev) => prev.filter((e) => e.id !== id));
	}, []);

	return { entries, isLoading, error, refresh, add, save, remove };
}
