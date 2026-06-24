import { useRef, useState } from "react";
import { uploadPhoto } from "../photos";
import { PhotoThumbnail } from "./PhotoThumbnail";

interface PhotoUploadFieldProps {
	label: string;
	photoKey: string | null;
	onChange: (key: string | null) => void;
}

export function PhotoUploadField({ label, photoKey, onChange }: PhotoUploadFieldProps) {
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
			onChange(key);
		} catch {
			setError("Photo upload failed.");
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
			<label style={{ fontSize: 14, color: "var(--text-muted)" }}>{label}</label>
			<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
				<PhotoThumbnail photoKey={photoKey} alt={label} />
				<button type="button" onClick={() => inputRef.current?.click()} disabled={isUploading}>
					{isUploading ? "Uploading…" : photoKey ? "Replace" : "Add photo"}
				</button>
				{photoKey && (
					<button type="button" onClick={() => onChange(null)} disabled={isUploading}>
						Remove
					</button>
				)}
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
