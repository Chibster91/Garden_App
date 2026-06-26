import { useEffect, useState } from "react";
import { usePlanted } from "../hooks/usePlanted";
import { useSeeds } from "../hooks/useSeeds";
import { PlantedDetailForm } from "./PlantedDetailForm";
import { PageHdr, GreenHdr, Scroll, EmptyState } from "./ViewHeaders";
import type { Planted, PlantedInput, PlantedStage } from "../types";

const STAGES: PlantedStage[] = ["seedling", "vegetative", "flowering", "fruiting", "harvested", "removed"];
const STAGE_L: Record<PlantedStage, string> = { seedling: "Seedling", vegetative: "Vegetative", flowering: "Flowering", fruiting: "Fruiting", harvested: "Harvested", removed: "Removed" };
const STAGE_S: Record<PlantedStage, { bg: string; c: string }> = {
	seedling:   { bg: "#DDE8D6", c: "#35513B" },
	vegetative: { bg: "#35513B", c: "#fff" },
	flowering:  { bg: "#F48FB1", c: "#fff" },
	fruiting:   { bg: "#D7A86E", c: "#243528" },
	harvested:  { bg: "#B36F4A", c: "#fff" },
	removed:    { bg: "#c4c4c4", c: "#555" },
};

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
	const [stageFilter, setStageFilter] = useState<PlantedStage | "all">("all");

	useEffect(() => {
		if (initialSeedId) {
			setIsCreating(true);
			onConsumeInitialSeedId?.();
		}
	}, [initialSeedId, onConsumeInitialSeedId]);

	const seedById = new Map(seeds.map((s) => [s.id, s]));

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
			<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
				<GreenHdr
					title={editing ? "Edit Plant" : "Add to Garden"}
					onBack={() => { setEditing(null); setIsCreating(false); }}
				/>
				<Scroll>
					{editing && onAddJournalEntry && (
						<button type="button" onClick={() => onAddJournalEntry(editing.id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 20px", borderRadius: 22, background: "transparent", color: "#35513B", fontSize: 15, fontWeight: 700, border: "1.5px solid #35513B", minHeight: 50, width: "100%", cursor: "pointer" }}>
							📓 Add Journal Entry
						</button>
					)}
					<PlantedDetailForm
						planted={editing}
						seeds={seeds}
						defaultSeedId={!editing ? (initialSeedId ?? undefined) : undefined}
						onSave={handleSave}
						onCancel={() => { setEditing(null); setIsCreating(false); }}
						onDelete={handleDelete}
					/>
				</Scroll>
			</div>
		);
	}

	const filtered = stageFilter === "all" ? planted : planted.filter((p) => p.stage === stageFilter);

	return (
		<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
			<PageHdr title="Garden" onAdd={() => setIsCreating(true)} addLabel="Add plant">
				{/* Stage filter pills */}
				<div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
					{(["all", ...STAGES] as (PlantedStage | "all")[]).map((s) => (
						<button
							key={s}
							type="button"
							onClick={() => setStageFilter(s)}
							style={{ padding: "5px 12px", borderRadius: 999, border: `1.5px solid ${stageFilter === s ? "#fff" : "rgba(255,255,255,.3)"}`, background: stageFilter === s ? "#fff" : "rgba(255,255,255,.12)", color: stageFilter === s ? "#35513B" : "rgba(255,255,255,.8)", fontSize: 12, fontWeight: 700, flexShrink: 0, cursor: "pointer", transition: "all .15s" }}
						>
							{s === "all" ? "All" : STAGE_L[s]}
						</button>
					))}
				</div>
			</PageHdr>

			<Scroll>
				{isLoading && <p style={{ color: "#687766" }}>Loading…</p>}
				{error && <p style={{ color: "#c62828" }}>{error}</p>}
				{!isLoading && planted.length === 0 && (
					<EmptyState emoji="🪴" title="Nothing planted yet" sub="Plant a seed from your catalog." action="Add plant" onAction={() => setIsCreating(true)} />
				)}
				{!isLoading && planted.length > 0 && filtered.length === 0 && (
					<EmptyState emoji="🔍" title="No plants at this stage" />
				)}

				{filtered.map((item) => {
					const seed = seedById.get(item.seedId);
					const st = STAGE_S[item.stage];
					return (
						<button key={item.id} type="button" onClick={() => setEditing(item)} style={{ display: "flex", alignItems: "center", gap: 12, background: "#F8F4EC", border: "1px solid #D9E2D0", borderRadius: 22, padding: "12px 13px", boxShadow: "0 3px 10px rgba(36,53,40,.09)", textAlign: "left", width: "100%", cursor: "pointer" }}>
							<div style={{ width: 54, height: 54, flexShrink: 0, borderRadius: 16, background: "linear-gradient(145deg,#D9EBCB,#96B982)", display: "grid", placeItems: "center", fontSize: 24 }}>
								🌿
							</div>
							<div style={{ flex: 1, minWidth: 0 }}>
								<div style={{ fontFamily: "Lora, Georgia, serif", fontWeight: 700, fontSize: 15.5, color: "#243528", lineHeight: 1.2 }}>
									{seed?.plantName ?? "Unknown seed"}
								</div>
								<div style={{ fontSize: 12, color: "#687766", marginTop: 2 }}>
									{[item.location, item.datePlanted].filter(Boolean).join(" · ")}
								</div>
								<div style={{ marginTop: 5 }}>
									<span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: st.bg, color: st.c }}>
										{STAGE_L[item.stage]}
									</span>
								</div>
							</div>
							<span style={{ color: "#687766", fontSize: 16 }}>›</span>
						</button>
					);
				})}
			</Scroll>
		</div>
	);
}
