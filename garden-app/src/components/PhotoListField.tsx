import { useRef, useState } from "react";
import { uploadPhoto } from "../photos";
import { PhotoThumbnail } from "./PhotoThumbnail";

interface PhotoListFieldProps {
	label: string;
	photoKeys: string[];
	onChange: (keys: string[]) => void;
}

export function PhotoListField({ label, photoKeys, onChange }: PhotoListFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;

		setIsUploading(true);
		setError(null);
		try {
			const key = await uploadPhoto(file);
			onChange([...photoKeys, key]);
		} catch {
			setError("Photo upload failed.");
		} finally {
			setIsUploading(false);
		}
	};

	const removeAt = (index: number) => {
		onChange(photoKeys.filter((_, i) => i !== index));
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
			<label style={{ fontSize: 14, color: "var(--text-muted)" }}>{label}</label>
			<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
				{photoKeys.map((key, index) => (
					<div key={key} style={{ position: "relative" }}>
						<PhotoThumbnail photoKey={key} alt={`${label} ${index + 1}`} />
						<button
							type="button"
							onClick={() => removeAt(index)}
							style={{
								position: "absolute",
								top: -6,
								right: -6,
								width: 20,
								height: 20,
								borderRadius: "50%",
								padding: 0,
								lineHeight: 1,
							}}
						>
							×
						</button>
					</div>
				))}
				<button type="button" onClick={() => inputRef.current?.click()} disabled={isUploading}>
					{isUploading ? "Uploading…" : "+ Add"}
				</button>
			</div>
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				capture="environment"
				onChange={handleFileChange}
				style={{ display: "none" }}
			/>
			{error && <p style={{ color: "crimson", fontSize: 13, margin: 0 }}>{error}</p>}
		</div>
	);
}
