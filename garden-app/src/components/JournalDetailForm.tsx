import { useState } from "react";
import { emptyJournalEntryInput } from "../journal";
import { PhotoListField } from "./PhotoListField";
import type { JournalEntry, JournalEntryInput, JournalEntryType, Planted } from "../types";

interface JournalDetailFormProps {
	entry: JournalEntry | null;
	planted: Planted[];
	defaultPlantedId?: string | null;
	onSave: (input: JournalEntryInput) => Promise<void>;
	onCancel: () => void;
	onDelete?: () => void;
}

const ENTRY_TYPE_OPTIONS: JournalEntryType[] = ["observation", "pest", "harvest", "action", "note"];

const fieldStyle = { display: "flex", flexDirection: "column" as const, gap: 4 };
const labelStyle = { fontSize: 14, color: "var(--text-muted)" };
const rowStyle = { display: "flex", gap: 12 };

export function JournalDetailForm({ entry, planted, defaultPlantedId, onSave, onCancel, onDelete }: JournalDetailFormProps) {
	const [input, setInput] = useState<JournalEntryInput>(() =>
		entry
			? {
					plantedId: entry.plantedId,
					entryType: entry.entryType,
					entryDate: entry.entryDate,
					tags: entry.tags,
					text: entry.text,
					photoKeys: entry.photoKeys,
				}
			: emptyJournalEntryInput(defaultPlantedId),
	);
	const [tagsText, setTagsText] = useState(() => (entry ? entry.tags.join(", ") : ""));
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const update = <K extends keyof JournalEntryInput>(key: K, value: JournalEntryInput[K]) => {
		setInput((prev) => ({ ...prev, [key]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaving(true);
		setError(null);
		try {
			const tags = tagsText
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean);
			await onSave({ ...input, tags });
		} catch {
			setError("Couldn't save journal entry.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<div style={rowStyle}>
				<div style={{ ...fieldStyle, flex: 1 }}>
					<label style={labelStyle}>Type</label>
					<select value={input.entryType} onChange={(e) => update("entryType", e.target.value as JournalEntryType)}>
						{ENTRY_TYPE_OPTIONS.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>
				</div>
				<div style={{ ...fieldStyle, flex: 1 }}>
					<label style={labelStyle}>Date</label>
					<input type="date" value={input.entryDate} onChange={(e) => update("entryDate", e.target.value)} required />
				</div>
			</div>

			<div style={fieldStyle}>
				<label style={labelStyle}>Linked planted item</label>
				<select
					value={input.plantedId ?? ""}
					onChange={(e) => update("plantedId", e.target.value || null)}
					disabled={!!defaultPlantedId}
				>
					<option value="">None</option>
					{planted.map((p) => (
						<option key={p.id} value={p.id}>
							{p.location ? `${p.location} (${p.datePlanted})` : p.datePlanted}
						</option>
					))}
				</select>
			</div>

			<div style={fieldStyle}>
				<label style={labelStyle}>Tags (comma separated)</label>
				<input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="e.g. aphids, drought" />
			</div>

			<div style={fieldStyle}>
				<label style={labelStyle}>Notes</label>
				<textarea
					value={input.text ?? ""}
					onChange={(e) => update("text", e.target.value.trim() === "" ? null : e.target.value)}
					rows={4}
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
