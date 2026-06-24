import { useState } from "react";
import { emptyPlantedInput } from "../planted";
import { PhotoListField } from "./PhotoListField";
import type { Planted, PlantedInput, PlantedStage, Seed } from "../types";

interface PlantedDetailFormProps {
	planted: Planted | null;
	seeds: Seed[];
	defaultSeedId?: string;
	onSave: (input: PlantedInput) => Promise<void>;
	onCancel: () => void;
	onDelete?: () => void;
}

const STAGE_OPTIONS: PlantedStage[] = ["seedling", "vegetative", "flowering", "fruiting", "harvested", "removed"];

const fieldStyle = { display: "flex", flexDirection: "column" as const, gap: 4 };
const labelStyle = { fontSize: 14, color: "var(--text-muted)" };
const rowStyle = { display: "flex", gap: 12 };

export function PlantedDetailForm({ planted, seeds, defaultSeedId, onSave, onCancel, onDelete }: PlantedDetailFormProps) {
	const [input, setInput] = useState<PlantedInput>(() =>
		planted
			? {
					seedId: planted.seedId,
					location: planted.location,
					datePlanted: planted.datePlanted,
					stage: planted.stage,
					photoKeys: planted.photoKeys,
				}
			: emptyPlantedInput(defaultSeedId ?? seeds[0]?.id ?? ""),
	);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const update = <K extends keyof PlantedInput>(key: K, value: PlantedInput[K]) => {
		setInput((prev) => ({ ...prev, [key]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.seedId) {
			setError("Choose a seed.");
			return;
		}
		setIsSaving(true);
		setError(null);
		try {
			await onSave(input);
		} catch {
			setError("Couldn't save planted item.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<div style={fieldStyle}>
				<label style={labelStyle}>Seed *</label>
				<select value={input.seedId} onChange={(e) => update("seedId", e.target.value)} disabled={!!defaultSeedId}>
					{seeds.map((seed) => (
						<option key={seed.id} value={seed.id}>
							{seed.plantName}
							{seed.variety ? ` — ${seed.variety}` : ""}
						</option>
					))}
				</select>
			</div>

			<div style={rowStyle}>
				<div style={{ ...fieldStyle, flex: 1 }}>
					<label style={labelStyle}>Date planted</label>
					<input
						type="date"
						value={input.datePlanted}
						onChange={(e) => update("datePlanted", e.target.value)}
						required
					/>
				</div>
				<div style={{ ...fieldStyle, flex: 1 }}>
					<label style={labelStyle}>Stage</label>
					<select value={input.stage} onChange={(e) => update("stage", e.target.value as PlantedStage)}>
						{STAGE_OPTIONS.map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
				</div>
			</div>

			<div style={fieldStyle}>
				<label style={labelStyle}>Location</label>
				<input
					placeholder="e.g. raised bed 2"
					value={input.location ?? ""}
					onChange={(e) => update("location", e.target.value.trim() === "" ? null : e.target.value)}
				/>
			</div>

			<PhotoListField label="Photos" photoKeys={input.photoKeys} onChange={(keys) => update("photoKeys", keys)} />

			{error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}

			<div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
				<div style={{ display: "flex", gap: 8 }}>
					<button type="submit" disabled={isSaving}>
						{isSaving ? "Saving…" : "Save"}
					</button>
					<button type="button" onClick={onCancel} disabled={isSaving}>
						Cancel
					</button>
				</div>
				{onDelete && (
					<button type="button" onClick={onDelete} disabled={isSaving} style={{ color: "crimson" }}>
						Delete
					</button>
				)}
			</div>
		</form>
	);
}
