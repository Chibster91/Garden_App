import { useEffect, useState } from "react";
import { api } from "../api";
import { photoApiPath } from "../photos";

export function usePhotoUrl(key: string | null | undefined): string | null {
	const [url, setUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!key) return;

		let objectUrl: string | null = null;
		let cancelled = false;

		api.getBlob(photoApiPath(key)).then((blob) => {
			if (cancelled) return;
			objectUrl = URL.createObjectURL(blob);
			setUrl(objectUrl);
		});

		return () => {
			cancelled = true;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [key]);

	return key ? url : null;
}
