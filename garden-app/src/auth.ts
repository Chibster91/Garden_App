const sessionTokenKey = "gardenSessionToken";

export function getStoredSessionToken(): string | null {
	return localStorage.getItem(sessionTokenKey);
}

export function setStoredSessionToken(token: string): void {
	localStorage.setItem(sessionTokenKey, token);
}

export function clearStoredSessionToken(): void {
	localStorage.removeItem(sessionTokenKey);
}
