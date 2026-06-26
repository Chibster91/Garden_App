import { useState } from "react";
import { useSeeds } from "../hooks/useSeeds";
import { SeedDetailForm } from "./SeedDetailForm";
import { SeedDetailView } from "./SeedDetailView";
import { PageHdr, GreenHdr, Scroll, EmptyState } from "./ViewHeaders";
import { SEED_STATUS_LABELS } from "../seeds";
import type { Seed, SeedInput, SeedStatus } from "../types";

const STATUS_BG: Record<SeedStatus, { bg: string; c: string }> = {
	unopened: { bg: "#DDE8D6", c: "#35513B" },
	opened:   { bg: "#fff8e1", c: "#B36F4A" },
	low:      { bg: "#fce4ec", c: "#c2185b" },
	empty:    { bg: "#e0e0e0", c: "#555" },
};

interface SeedCatalogViewProps {
	onPlantSeed?: (seedId: string) => void;
}

export function SeedCatalogView({ onPlantSeed }: SeedCatalogViewProps) {
	const { seeds, isLoading, error, add, save, remove } = useSeeds();
	const [viewing, setViewing] = useState<Seed | null>(null);
	const [editing, setEditing] = useState<Seed | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [query, setQuery] = useState("");

	if (isCreating || editing) {
		const handleSave = async (input: SeedInput) => {
			let saved: Seed;
			if (editing) {
				saved = await save(editing.id, input);
			} else {
				saved = await add(input);
			}
			setEditing(null);
			setIsCreating(false);
			setViewing(saved);
		};

		const handleDelete = editing
			? async () => {
					if (!confirm(`Delete ${editing.plantName}?`)) return;
					await remove(editing.id);
					setEditing(null);
					setViewing(null);
				}
			: undefined;

		return (
			<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
				<GreenHdr
					title={editing ? "Edit Seed" : "Add Seed"}
					onBack={() => { setEditing(null); setIsCreating(false); if (editing) setViewing(editing); }}
				/>
				<Scroll>
					{editing && onPlantSeed && (
						<button type="button" onClick={() => onPlantSeed(editing.id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 20px", borderRadius: 22, background: "#35513B", color: "#fff", fontSize: 15, fontWeight: 700, minHeight: 50, width: "100%", border: "none", cursor: "pointer" }}>
							🌱 Plant This Seed
						</button>
					)}
					<SeedDetailForm seed={editing} onSave={handleSave} onCancel={() => { setEditing(null); setIsCreating(false); if (editing) setViewing(editing); }} onDelete={handleDelete} />
				</Scroll>
			</div>
		);
	}

	if (viewing) {
		return (
			<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
				<GreenHdr
					title="Seed Details"
					onBack={() => setViewing(null)}
					right={
						<button type="button" onClick={() => setEditing(viewing)} style={{ width: 36, height: 36, borderRadius: 999, background: "rgba(255,255,255,.16)", color: "#fff", display: "grid", placeItems: "center", border: "none", cursor: "pointer", fontSize: 16 }}>
							✏️
						</button>
					}
				/>
				<Scroll>
					<SeedDetailView seed={viewing} onBack={() => setViewing(null)} onEdit={() => setEditing(viewing)} />
					{onPlantSeed && (
						<button type="button" onClick={() => onPlantSeed(viewing.id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 20px", borderRadius: 22, background: "#35513B", color: "#fff", fontSize: 15, fontWeight: 700, minHeight: 50, width: "100%", border: "none", cursor: "pointer", marginTop: 4 }}>
							🌱 Plant This Seed
						</button>
					)}
				</Scroll>
			</div>
		);
	}

	const filtered = seeds.filter((s) => {
		const q = query.toLowerCase();
		return !q || s.plantName.toLowerCase().includes(q) || (s.variety ?? "").toLowerCase().includes(q);
	});

	return (
		<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
			<PageHdr title="My Seeds" onAdd={() => setIsCreating(true)} addLabel="Add seed">
				<div style={{ position: "relative" }}>
					<span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 15, opacity: 0.5 }}>🔍</span>
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search seeds…"
						style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 999, border: "none", background: "rgba(255,255,255,.16)", color: "#fff", fontSize: 13 }}
					/>
				</div>
			</PageHdr>

			<Scroll>
				{isLoading && <p style={{ color: "#687766" }}>Loading…</p>}
				{error && <p style={{ color: "#c62828" }}>{error}</p>}

				{!isLoading && seeds.length === 0 && (
					<EmptyState emoji="🌱" title="No seeds yet" sub="Add your first seed packet to get started." action="Add seed" onAction={() => setIsCreating(true)} />
				)}
				{!isLoading && seeds.length > 0 && filtered.length === 0 && (
					<EmptyState emoji="🔍" title="No results" sub="Try a different search term." />
				)}

				{filtered.length > 0 && (
					<div style={{ fontSize: 12, color: "#687766", fontWeight: 700 }}>{filtered.length} seed{filtered.length !== 1 ? "s" : ""}</div>
				)}

				{filtered.map((seed) => {
					const st = STATUS_BG[seed.status];
					return (
						<button key={seed.id} type="button" onClick={() => setViewing(seed)} style={{ display: "flex", alignItems: "center", gap: 13, background: "#F8F4EC", border: "1px solid #D9E2D0", borderRadius: 22, padding: "12px 14px", boxShadow: "0 3px 10px rgba(36,53,40,.09)", textAlign: "left", width: "100%", cursor: "pointer" }}>
							{/* Seed art */}
							<div style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 16, background: "linear-gradient(145deg,#D9EBCB,#96B982)", display: "grid", placeItems: "center", fontSize: 26 }}>
								🌱
							</div>
							<div style={{ flex: 1, minWidth: 0 }}>
								<div style={{ fontFamily: "Lora, Georgia, serif", fontWeight: 700, fontSize: 16, color: "#243528", lineHeight: 1.2 }}>{seed.plantName}</div>
								<div style={{ fontSize: 12, color: "#687766", marginTop: 2 }}>{[seed.variety, seed.brand].filter(Boolean).join(" · ") || "—"}</div>
								<div style={{ marginTop: 5 }}>
									<span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: st.bg, color: st.c }}>
										{SEED_STATUS_LABELS[seed.status]}
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
