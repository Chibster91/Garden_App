import { useState } from "react";
import { useSeeds } from "../hooks/useSeeds";
import { SeedDetailForm } from "./SeedDetailForm";
import { SeedDetailView } from "./SeedDetailView";
import { PhotoThumbnail } from "./PhotoThumbnail";
import { SEED_STATUS_LABELS } from "../seeds";
import type { Seed, SeedInput } from "../types";

interface SeedCatalogViewProps {
	onPlantSeed?: (seedId: string) => void;
}

export function SeedCatalogView({ onPlantSeed }: SeedCatalogViewProps) {
	const { seeds, isLoading, error, add, save, remove } = useSeeds();
	const [viewing, setViewing] = useState<Seed | null>(null);
	const [editing, setEditing] = useState<Seed | null>(null);
	const [isCreating, setIsCreating] = useState(false);

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
			<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
				{editing && onPlantSeed && (
					<button type="button" onClick={() => onPlantSeed(editing.id)}>
						🌱 Plant this seed
					</button>
				)}
				<SeedDetailForm
					seed={editing}
					onSave={handleSave}
					onCancel={() => {
						setEditing(null);
						setIsCreating(false);
						if (editing) setViewing(editing);
					}}
					onDelete={handleDelete}
				/>
			</div>
		);
	}

	if (viewing) {
		return <SeedDetailView seed={viewing} onBack={() => setViewing(null)} onEdit={() => setEditing(viewing)} />;
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<h2>My Seeds</h2>
				<button type="button" onClick={() => setIsCreating(true)}>
					+ Add seed
				</button>
			</div>

			{isLoading && <p>Loading…</p>}
			{error && <p style={{ color: "crimson" }}>{error}</p>}
			{!isLoading && seeds.length === 0 && <p>No seeds yet. Add your first one.</p>}

			<ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
				{seeds.map((seed) => (
					<li key={seed.id}>
						<button
							type="button"
							onClick={() => setViewing(seed)}
							className="card"
							style={{
								display: "flex",
								alignItems: "center",
								gap: 12,
								width: "100%",
								textAlign: "left",
								cursor: "pointer",
							}}
						>
							<PhotoThumbnail photoKey={seed.photoFrontKey} alt={seed.plantName} />
							<div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
								<strong style={{ fontFamily: "var(--font-serif)", fontSize: 17 }}>{seed.plantName}</strong>
								<span style={{ color: "var(--text-muted)", fontSize: 14 }}>
									{[seed.variety, seed.brand].filter(Boolean).join(" · ") || "—"}
								</span>
								<span className="pill" style={{ alignSelf: "flex-start", marginTop: 2 }}>
									{SEED_STATUS_LABELS[seed.status]}
								</span>
							</div>
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
