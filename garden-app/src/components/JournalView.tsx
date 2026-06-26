import { useEffect, useState } from "react";
import { useJournal } from "../hooks/useJournal";
import { usePlanted } from "../hooks/usePlanted";
import { useSeeds } from "../hooks/useSeeds";
import { JournalDetailForm } from "./JournalDetailForm";
import { PageHdr, GreenHdr, Scroll, EmptyState } from "./ViewHeaders";
import type { JournalEntry, JournalEntryInput, JournalEntryType } from "../types";

const ENTRY_TYPES: JournalEntryType[] = ["observation", "pest", "harvest", "action", "note"];
const ENTRY_L: Record<JournalEntryType, string> = { observation: "Observation", pest: "Pest", harvest: "Harvest", action: "Action", note: "Note" };
const ENTRY_I: Record<JournalEntryType, string> = { observation: "👁", pest: "🐛", harvest: "🌾", action: "⚡", note: "📝" };
const ENTRY_BG: Record<JournalEntryType, string> = { observation: "#e1f0fb", pest: "#fce4ec", harvest: "#fff8e1", action: "#DDE8D6", note: "#F5EDE1" };

interface JournalViewProps {
	initialPlantedId?: string | null;
	onConsumeInitialPlantedId?: () => void;
}

export function JournalView({ initialPlantedId, onConsumeInitialPlantedId }: JournalViewProps) {
	const { entries, isLoading, error, add, save, remove } = useJournal();
	const { planted } = usePlanted();
	const { seeds } = useSeeds();
	const [editing, setEditing] = useState<JournalEntry | null>(null);
	const [isCreating, setIsCreating] = useState(() => Boolean(initialPlantedId));
	const [typeFilter, setTypeFilter] = useState<JournalEntryType | "all">("all");

	useEffect(() => {
		if (initialPlantedId) onConsumeInitialPlantedId?.();
	}, [initialPlantedId, onConsumeInitialPlantedId]);

	const plantedById = new Map(planted.map((p) => [p.id, p]));
	const seedById = new Map(seeds.map((s) => [s.id, s]));

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
			<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
				<GreenHdr title={editing ? "Edit Entry" : "New Entry"} onBack={() => { setEditing(null); setIsCreating(false); }} />
				<Scroll>
					<JournalDetailForm
						entry={editing}
						planted={planted}
						defaultPlantedId={!editing ? initialPlantedId : undefined}
						onSave={handleSave}
						onCancel={() => { setEditing(null); setIsCreating(false); }}
						onDelete={handleDelete}
					/>
				</Scroll>
			</div>
		);
	}

	const filtered = typeFilter === "all" ? entries : entries.filter((e) => e.entryType === typeFilter);

	return (
		<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
			<PageHdr title="Journal" onAdd={() => setIsCreating(true)} addLabel="Add entry">
				{/* Type filter pills */}
				<div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
					{(["all", ...ENTRY_TYPES] as (JournalEntryType | "all")[]).map((t) => (
						<button
							key={t}
							type="button"
							onClick={() => setTypeFilter(t)}
							style={{ padding: "5px 12px", borderRadius: 999, border: `1.5px solid ${typeFilter === t ? "#fff" : "rgba(255,255,255,.3)"}`, background: typeFilter === t ? "#fff" : "rgba(255,255,255,.12)", color: typeFilter === t ? "#35513B" : "rgba(255,255,255,.8)", fontSize: 12, fontWeight: 700, flexShrink: 0, cursor: "pointer", transition: "all .15s" }}
						>
							{t === "all" ? "All" : ENTRY_L[t]}
						</button>
					))}
				</div>
			</PageHdr>

			<Scroll>
				{isLoading && <p style={{ color: "#687766" }}>Loading…</p>}
				{error && <p style={{ color: "#c62828" }}>{error}</p>}
				{!isLoading && entries.length === 0 && (
					<EmptyState emoji="📓" title="No journal entries" sub="Start recording your garden observations and harvests." action="Add entry" onAction={() => setIsCreating(true)} />
				)}
				{!isLoading && entries.length > 0 && filtered.length === 0 && (
					<EmptyState emoji="📓" title="No entries of this type" />
				)}

				{filtered.map((entry) => {
					const pl = entry.plantedId ? plantedById.get(entry.plantedId) : null;
					const seed = pl ? seedById.get(pl.seedId) : null;
					return (
						<button
							key={entry.id}
							type="button"
							onClick={() => setEditing(entry)}
							style={{ display: "flex", flexDirection: "column", gap: 6, background: "#F8F4EC", border: "1px solid #D9E2D0", borderRadius: 22, padding: 14, boxShadow: "0 3px 10px rgba(36,53,40,.09)", textAlign: "left", width: "100%", cursor: "pointer" }}
						>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: ENTRY_BG[entry.entryType], color: "#243528" }}>
									{ENTRY_I[entry.entryType]} {ENTRY_L[entry.entryType]}
								</span>
								<span style={{ fontSize: 12, color: "#687766" }}>{entry.entryDate}</span>
							</div>
							{seed && (
								<div style={{ fontSize: 12, fontWeight: 700, color: "#35513B" }}>
									🌱 {seed.plantName}
								</div>
							)}
							{entry.text && (
								<p style={{ margin: 0, fontSize: 13, color: "#243528", lineHeight: 1.4 }}>
									{entry.text.length > 100 ? `${entry.text.slice(0, 100)}…` : entry.text}
								</p>
							)}
							{entry.tags.length > 0 && (
								<div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
									{entry.tags.map((t) => (
										<span key={t} style={{ fontSize: 11, padding: "2px 7px", background: "#DDE8D6", borderRadius: 6, color: "#687766", fontWeight: 600 }}>{t}</span>
									))}
								</div>
							)}
						</button>
					);
				})}
			</Scroll>
		</div>
	);
}
