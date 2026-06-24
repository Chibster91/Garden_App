import { useState } from "react";
import { emptySeedInput } from "../seeds";
import { PhotoUploadField } from "./PhotoUploadField";
import type { LightNeeds, Seed, SeedInput, SeedStatus, SowMethod } from "../types";

interface SeedDetailFormProps {
	seed: Seed | null;
	onSave: (input: SeedInput) => Promise<void>;
	onCancel: () => void;
	onDelete?: () => void;
}

const STATUS_OPTIONS: SeedStatus[] = ["unopened", "opened", "low", "empty"];
const LIGHT_OPTIONS: LightNeeds[] = ["full_sun", "partial_sun", "shade"];
const SOW_METHOD_OPTIONS: SowMethod[] = ["start_indoors", "direct_sow", "either"];

function toNumber(value: string): number | null {
	if (value.trim() === "") return null;
	const n = Number(value);
	return Number.isFinite(n) ? n : null;
}

function toText(value: string): string | null {
	return value.trim() === "" ? null : value;
}

const fieldStyle = { display: "flex", flexDirection: "column" as const, gap: 4 };
const labelStyle = { fontSize: 14, color: "var(--text-muted)" };
const rowStyle = { display: "flex", gap: 12 };

export function SeedDetailForm({ seed, onSave, onCancel, onDelete }: SeedDetailFormProps) {
	const [input, setInput] = useState<SeedInput>(() =>
		seed
			? {
					plantName: seed.plantName,
					variety: seed.variety,
					brand: seed.brand,
					year: seed.year,
					quantity: seed.quantity,
					status: seed.status,
					photoFrontKey: seed.photoFrontKey,
					photoBackKey: seed.photoBackKey,
					notes: seed.notes,
					sowIndoorStart: seed.sowIndoorStart,
					sowIndoorEnd: seed.sowIndoorEnd,
					sowDirectStart: seed.sowDirectStart,
					sowDirectEnd: seed.sowDirectEnd,
					depthIn: seed.depthIn,
					spacingIn: seed.spacingIn,
					germDaysMin: seed.germDaysMin,
					germDaysMax: seed.germDaysMax,
					germTempFMin: seed.germTempFMin,
					germTempFMax: seed.germTempFMax,
					lightNeeds: seed.lightNeeds,
					daysToHarvestMin: seed.daysToHarvestMin,
					daysToHarvestMax: seed.daysToHarvestMax,
					sowMethod: seed.sowMethod,
					bestSeason: seed.bestSeason,
					transplantTiming: seed.transplantTiming,
					readyToTransplant: seed.readyToTransplant,
					hardenOffDays: seed.hardenOffDays,
					waterNeeds: seed.waterNeeds,
					soilNeeds: seed.soilNeeds,
					commonPests: seed.commonPests,
				}
			: emptySeedInput(),
	);
	const [pestsText, setPestsText] = useState(() => (seed ? seed.commonPests.join(", ") : ""));
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const update = <K extends keyof SeedInput>(key: K, value: SeedInput[K]) => {
		setInput((prev) => ({ ...prev, [key]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.plantName.trim()) {
			setError("Plant name is required.");
			return;
		}
		setIsSaving(true);
		setError(null);
		try {
			const commonPests = pestsText
				.split(",")
				.map((p) => p.trim())
				.filter(Boolean);
			await onSave({ ...input, commonPests });
		} catch {
			setError("Couldn't save seed.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<div style={fieldStyle}>
				<label style={labelStyle}>Plant name *</label>
				<input value={input.plantName} onChange={(e) => update("plantName", e.target.value)} required />
			</div>

			<div style={rowStyle}>
				<div style={{ ...fieldStyle, flex: 1 }}>
					<label style={labelStyle}>Variety</label>
					<input value={input.variety ?? ""} onChange={(e) => update("variety", toText(e.target.value))} />
				</div>
				<div style={{ ...fieldStyle, flex: 1 }}>
					<label style={labelStyle}>Brand</label>
					<input value={input.brand ?? ""} onChange={(e) => update("brand", toText(e.target.value))} />
				</div>
			</div>

			<div style={rowStyle}>
				<div style={{ ...fieldStyle, flex: 1 }}>
					<label style={labelStyle}>Year</label>
					<input
						type="number"
						value={input.year ?? ""}
						onChange={(e) => update("year", toNumber(e.target.value))}
					/>
				</div>
				<div style={{ ...fieldStyle, flex: 1 }}>
					<label style={labelStyle}>Quantity</label>
					<input
						type="number"
						value={input.quantity ?? ""}
						onChange={(e) => update("quantity", toNumber(e.target.value))}
					/>
				</div>
				<div style={{ ...fieldStyle, flex: 1 }}>
					<label style={labelStyle}>Status</label>
					<select value={input.status} onChange={(e) => update("status", e.target.value as SeedStatus)}>
						{STATUS_OPTIONS.map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
				</div>
			</div>

			<PhotoUploadField
				label="Front photo"
				photoKey={input.photoFrontKey}
				onChange={(key) => update("photoFrontKey", key)}
			/>
			<PhotoUploadField
				label="Back photo"
				photoKey={input.photoBackKey}
				onChange={(key) => update("photoBackKey", key)}
			/>

			<div style={fieldStyle}>
				<label style={labelStyle}>Notes</label>
				<textarea value={input.notes ?? ""} onChange={(e) => update("notes", toText(e.target.value))} rows={3} />
			</div>

			<fieldset style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
				<legend style={labelStyle}>Growing data</legend>

				<div style={rowStyle}>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Sow indoors (start)</label>
						<input
							placeholder="e.g. 6 weeks before last frost"
							value={input.sowIndoorStart ?? ""}
							onChange={(e) => update("sowIndoorStart", toText(e.target.value))}
						/>
					</div>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Sow indoors (end)</label>
						<input
							value={input.sowIndoorEnd ?? ""}
							onChange={(e) => update("sowIndoorEnd", toText(e.target.value))}
						/>
					</div>
				</div>

				<div style={rowStyle}>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Sow direct (start)</label>
						<input
							placeholder="e.g. after last frost"
							value={input.sowDirectStart ?? ""}
							onChange={(e) => update("sowDirectStart", toText(e.target.value))}
						/>
					</div>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Sow direct (end)</label>
						<input
							value={input.sowDirectEnd ?? ""}
							onChange={(e) => update("sowDirectEnd", toText(e.target.value))}
						/>
					</div>
				</div>

				<div style={rowStyle}>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Transplant timing</label>
						<input
							placeholder="e.g. After frost danger has passed"
							value={input.transplantTiming ?? ""}
							onChange={(e) => update("transplantTiming", toText(e.target.value))}
						/>
					</div>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Best season</label>
						<input
							placeholder="e.g. Warm season"
							value={input.bestSeason ?? ""}
							onChange={(e) => update("bestSeason", toText(e.target.value))}
						/>
					</div>
				</div>

				<div style={fieldStyle}>
					<label style={labelStyle}>Sow method</label>
					<select
						value={input.sowMethod ?? ""}
						onChange={(e) => update("sowMethod", (e.target.value || null) as SowMethod | null)}
					>
						<option value="">—</option>
						{SOW_METHOD_OPTIONS.map((m) => (
							<option key={m} value={m}>
								{m.replace("_", " ")}
							</option>
						))}
					</select>
				</div>

				<div style={rowStyle}>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Depth (in)</label>
						<input
							type="number"
							step="0.125"
							value={input.depthIn ?? ""}
							onChange={(e) => update("depthIn", toNumber(e.target.value))}
						/>
					</div>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Spacing (in)</label>
						<input
							type="number"
							step="0.5"
							value={input.spacingIn ?? ""}
							onChange={(e) => update("spacingIn", toNumber(e.target.value))}
						/>
					</div>
				</div>

				<div style={rowStyle}>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Germ days (min)</label>
						<input
							type="number"
							value={input.germDaysMin ?? ""}
							onChange={(e) => update("germDaysMin", toNumber(e.target.value))}
						/>
					</div>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Germ days (max)</label>
						<input
							type="number"
							value={input.germDaysMax ?? ""}
							onChange={(e) => update("germDaysMax", toNumber(e.target.value))}
						/>
					</div>
				</div>

				<div style={rowStyle}>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Germ temp °F (min)</label>
						<input
							type="number"
							value={input.germTempFMin ?? ""}
							onChange={(e) => update("germTempFMin", toNumber(e.target.value))}
						/>
					</div>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Germ temp °F (max)</label>
						<input
							type="number"
							value={input.germTempFMax ?? ""}
							onChange={(e) => update("germTempFMax", toNumber(e.target.value))}
						/>
					</div>
				</div>

				<div style={fieldStyle}>
					<label style={labelStyle}>Light needs</label>
					<select
						value={input.lightNeeds ?? ""}
						onChange={(e) => update("lightNeeds", (e.target.value || null) as LightNeeds | null)}
					>
						<option value="">—</option>
						{LIGHT_OPTIONS.map((l) => (
							<option key={l} value={l}>
								{l.replace("_", " ")}
							</option>
						))}
					</select>
				</div>

				<div style={rowStyle}>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Water needs</label>
						<input
							placeholder="e.g. Moderate / consistent"
							value={input.waterNeeds ?? ""}
							onChange={(e) => update("waterNeeds", toText(e.target.value))}
						/>
					</div>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Soil needs</label>
						<input
							placeholder="e.g. Rich, well-drained"
							value={input.soilNeeds ?? ""}
							onChange={(e) => update("soilNeeds", toText(e.target.value))}
						/>
					</div>
				</div>

				<div style={rowStyle}>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Ready to transplant</label>
						<input
							placeholder="e.g. 4-6 weeks"
							value={input.readyToTransplant ?? ""}
							onChange={(e) => update("readyToTransplant", toText(e.target.value))}
						/>
					</div>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Harden off</label>
						<input
							placeholder="e.g. 7-10 days"
							value={input.hardenOffDays ?? ""}
							onChange={(e) => update("hardenOffDays", toText(e.target.value))}
						/>
					</div>
				</div>

				<div style={rowStyle}>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Days to harvest (min)</label>
						<input
							type="number"
							value={input.daysToHarvestMin ?? ""}
							onChange={(e) => update("daysToHarvestMin", toNumber(e.target.value))}
						/>
					</div>
					<div style={{ ...fieldStyle, flex: 1 }}>
						<label style={labelStyle}>Days to harvest (max)</label>
						<input
							type="number"
							value={input.daysToHarvestMax ?? ""}
							onChange={(e) => update("daysToHarvestMax", toNumber(e.target.value))}
						/>
					</div>
				</div>

				<div style={fieldStyle}>
					<label style={labelStyle}>Common pests (comma separated)</label>
					<input
						placeholder="e.g. Aphids, Hornworms"
						value={pestsText}
						onChange={(e) => setPestsText(e.target.value)}
					/>
				</div>
			</fieldset>

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
