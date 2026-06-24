import { useEffect, useState } from "react";
import { usePlanted } from "../hooks/usePlanted";
import { useSeeds } from "../hooks/useSeeds";
import { PlantedDetailForm } from "./PlantedDetailForm";
import { PhotoThumbnail } from "./PhotoThumbnail";
import { PLANTED_STAGE_LABELS } from "../planted";
import type { Planted, PlantedInput } from "../types";

interface PlantedTrackerViewProps {
	initialSeedId?: string | null;
	onConsumeInitialSeedId?: () => void;
	onAddJournalEntry?: (plantedId: string) => void;
}

export function PlantedTrackerView({ initialSeedId, onConsumeInitialSeedId, onAddJournalEntry }: PlantedTrackerViewProps) {
	const { planted, isLoading, error, add, save, remove } = usePlanted();
	const { seeds } = useSeeds();
	const [editing, setEditing] = useState<Planted | null>(null);
	const [isCreating, setIsCreating] = useState(() => Boolean(initialSeedId));

	useEffect(() => {
		if (initialSeedId) onConsumeInitialSeedId?.();
	}, [initialSeedId, onConsumeInitialSeedId]);

	const seedById = new Map(seeds.map((seed) => [seed.id, seed]));

	if (isCreating || editing) {
		const handleSave = async (input: PlantedInput) => {
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
					if (!confirm("Remove this planted item?")) return;
					await remove(editing.id);
					setEditing(null);
				}
			: undefined;

		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
				{editing && onAddJournalEntry && (
					<button type="button" onClick={() => onAddJournalEntry(editing.id)}>
						📓 Add journal entry
					</button>
				)}
				<PlantedDetailForm
					planted={editing}
					seeds={seeds}
					defaultSeedId={!editing ? (initialSeedId ?? undefined) : undefined}
					onSave={handleSave}
					onCancel={() => {
						setEditing(null);
						setIsCreating(false);
					}}
					onDelete={handleDelete}
				/>
			</div>
		);
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<h2 style={{ margin: 0, fontFamily: "var(--font-serif)" }}>Garden</h2>
				<button type="button" onClick={() => setIsCreating(true)} disabled={seeds.length === 0}>
					+ Add planted
				</button>
			</div>

			{isLoading && <p>Loading…</p>}
			{error && <p style={{ color: "crimson" }}>{error}</p>}
			{!isLoading && planted.length === 0 && <p>Nothing planted yet. Plant a seed from your catalog.</p>}

			<ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
				{planted.map((item) => {
					const seed = seedById.get(item.seedId);
					return (
						<li key={item.id}>
							<button
								type="button"
								onClick={() => setEditing(item)}
								className="card"
								style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", cursor: "pointer" }}
							>
								<PhotoThumbnail photoKey={item.photoKeys[0]} alt={seed?.plantName ?? "Planted"} />
								<div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
									<strong style={{ fontFamily: "var(--font-serif)", fontSize: 17 }}>{seed?.plantName ?? "Unknown seed"}</strong>
									<span style={{ color: "var(--text-muted)", fontSize: 14 }}>
										{[item.location, item.datePlanted].filter(Boolean).join(" · ")}
									</span>
									<span className="pill" style={{ alignSelf: "flex-start", marginTop: 2 }}>
										{PLANTED_STAGE_LABELS[item.stage]}
									</span>
								</div>
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
