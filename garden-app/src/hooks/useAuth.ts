import { useCallback, useEffect, useState } from "react";
import { api, UNAUTHORIZED_EVENT } from "../api";
import { getStoredSessionToken, setStoredSessionToken, clearStoredSessionToken } from "../auth";
import type { GoogleCredentialResponse, User } from "../types";

const googleIdentityScriptUrl = "https://accounts.google.com/gsi/client";

function loadGoogleIdentityScript(): Promise<void> {
	if (window.google?.accounts?.id) return Promise.resolve();

	return new Promise<void>((resolve, reject) => {
		const existing = document.querySelector<HTMLScriptElement>(`script[src="${googleIdentityScriptUrl}"]`);
		if (existing) {
			existing.addEventListener("load", () => resolve(), { once: true });
			existing.addEventListener("error", () => reject(new Error("Google Identity script failed to load.")), {
				once: true,
			});
			return;
		}

		const script = document.createElement("script");
		script.src = googleIdentityScriptUrl;
		script.async = true;
		script.defer = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error("Google Identity script failed to load."));
		document.head.appendChild(script);
	});
}

export function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(() => Boolean(getStoredSessionToken()));
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const token = getStoredSessionToken();
		if (!token) return;
		api
			.get<{ user: User }>("/api/auth/me")
			.then((res) => setUser(res.user))
			.catch(() => clearStoredSessionToken())
			.finally(() => setIsLoading(false));
	}, []);

	useEffect(() => {
		const handleUnauthorized = () => setUser(null);
		window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
		return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
	}, []);

	const handleCredential = useCallback(async (response: GoogleCredentialResponse) => {
		setError(null);
		try {
			const res = await api.post<{ sessionToken: string; user: User }>("/api/auth/google", {
				idToken: response.credential,
			});
			setStoredSessionToken(res.sessionToken);
			setUser(res.user);
		} catch {
			setError("Sign-in failed. Please try again.");
		}
	}, []);

	const renderSignInButton = useCallback(
		async (container: HTMLElement) => {
			try {
				await loadGoogleIdentityScript();
			} catch {
				setError("Couldn't load Google Sign-In. Check your connection.");
				return;
			}

			const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
			if (!clientId) {
				setError("Google Sign-In is not configured (missing VITE_GOOGLE_CLIENT_ID).");
				return;
			}

			window.google?.accounts?.id?.initialize({
				client_id: clientId,
				callback: handleCredential,
			});
			window.google?.accounts?.id?.renderButton(container, { theme: "outline", size: "large", width: 280 });
		},
		[handleCredential],
	);

	const signOut = useCallback(() => {
		api.post("/api/auth/logout").catch(() => {});
		clearStoredSessionToken();
		window.google?.accounts?.id?.disableAutoSelect?.();
		setUser(null);
	}, []);

	return { user, isLoading, error, renderSignInButton, signOut };
}
