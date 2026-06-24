import { createRemoteJWKSet, jwtVerify } from "jose";

// createRemoteJWKSet caches the fetched JWKS internally, so this module-level
// set is reused (and refreshed as needed) across requests within an isolate.
const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export interface GoogleIdTokenPayload {
	sub: string;
	email: string;
	name: string | null;
	picture: string | null;
}

export async function verifyGoogleIdToken(idToken: string, clientId: string): Promise<GoogleIdTokenPayload> {
	const { payload } = await jwtVerify(idToken, googleJwks, {
		issuer: ["https://accounts.google.com", "accounts.google.com"],
		audience: clientId,
	});

	if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
		throw new Error("Google ID token missing required claims");
	}

	return {
		sub: payload.sub,
		email: payload.email,
		name: typeof payload.name === "string" ? payload.name : null,
		picture: typeof payload.picture === "string" ? payload.picture : null,
	};
}
