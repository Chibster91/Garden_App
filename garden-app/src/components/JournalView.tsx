import { useEffect, useState } from "react";
import { useJournal } from "../hooks/useJournal";
import { usePlanted } from "../hooks/usePlanted";
import { JournalDetailForm } from "./JournalDetailForm";
import { JOURNAL_ENTRY_TYPE_LABELS } from "../journal";
import type { JournalEntry, JournalEntryInput } from "../types";

interface JournalViewProps {
	initialPlantedId?: string | null;
	onConsumeInitialPlantedId?: () => void;
}

export function JournalView({ initialPlantedId, onConsumeInitialPlantedId }: JournalViewProps) {
	const { entries, isLoading, error, add, save, remove } = useJournal();
	const { planted } = usePlanted();
	const [editing, setEditing] = useState<JournalEntry | null>(null);
	const [isCreating, setIsCreating] = useState(() => Boolean(initialPlantedId));

	useEffect(() => {
		if (initialPlantedId) onConsumeInitialPlantedId?.();
	}, [initialPlantedId, onConsumeInitialPlantedId]);

	const plantedById = new Map(planted.map((p) => [p.id, p]));

	if (isCreating || editing) {
		const handleSave = async (input: JournalEntryInput) => {
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
					if (!confirm("Delete this journal entry?")) return;
					await remove(editing.id);
					setEditing(null);
				}
			: undefined;

		return (
			<JournalDetailForm
				entry={editing}
				planted={planted}
				defaultPlantedId={!editing ? initialPlantedId : undefined}
				onSave={handleSave}
				onCancel={() => {
					setEditing(null);
					setIsCreating(false);
				}}
				onDelete={handleDelete}
			/>
		);
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<h2 style={{ margin: 0, fontFamily: "var(--font-serif)" }}>Journal</h2>
				<button type="button" onClick={() => setIsCreating(true)}>
					+ Add entry
				</button>
			</div>

			{isLoading && <p>Loading…</p>}
			{error && <p style={{ color: "crimson" }}>{error}</p>}
			{!isLoading && entries.length === 0 && <p>No journal entries yet.</p>}

			<ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
				{entries.map((entry) => {
					const linked = entry.plantedId ? plantedById.get(entry.plantedId) : null;
					return (
						<li key={entry.id}>
							<button
								type="button"
								onClick={() => setEditing(entry)}
								className="card"
								style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%", textAlign: "left", cursor: "pointer" }}
							>
								<div style={{ display: "flex", justifyContent: "space-between" }}>
									<strong style={{ fontFamily: "var(--font-serif)" }}>{JOURNAL_ENTRY_TYPE_LABELS[entry.entryType]}</strong>
									<span style={{ color: "var(--text-muted)", fontSize: 14 }}>{entry.entryDate}</span>
								</div>
								{linked && <span style={{ fontSize: 13, color: "var(--accent)" }}>{linked.location ?? linked.id}</span>}
								{entry.text && <span style={{ fontSize: 14 }}>{entry.text}</span>}
								{entry.tags.length > 0 && (
									<div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
										{entry.tags.map((tag) => (
											<span key={tag} className="pill">
												{tag}
											</span>
										))}
									</div>
								)}
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
