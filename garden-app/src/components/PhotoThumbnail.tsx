import { usePhotoUrl } from "../hooks/usePhotoUrl";

interface PhotoThumbnailProps {
	photoKey: string | null | undefined;
	size?: number;
	alt: string;
}

export function PhotoThumbnail({ photoKey, size = 64, alt }: PhotoThumbnailProps) {
	const url = usePhotoUrl(photoKey);

	const style = {
		width: size,
		height: size,
		borderRadius: 8,
		objectFit: "cover" as const,
		background: "var(--border)",
		display: "block",
	};

	if (!url) return <div style={style} />;

	return <img src={url} alt={alt} style={style} />;
}
