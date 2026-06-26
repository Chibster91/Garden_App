import { Scroll } from "./ViewHeaders";
import type { User } from "../types";

interface ProfileViewProps {
	user: User;
	onSignOut: () => void;
}

function initials(name: string | null, email: string): string {
	if (name) {
		const parts = name.split(" ").filter(Boolean);
		if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
		return parts[0]?.[0]?.toUpperCase() ?? "G";
	}
	return email[0]?.toUpperCase() ?? "G";
}

export function ProfileView({ user, onSignOut }: ProfileViewProps) {
	const init = initials(user.name, user.email);

	return (
		<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
			{/* Green header with user avatar */}
			<div style={{ background: "#5E7A5E", padding: "20px 18px 38px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
				<div style={{ position: "absolute", top: -10, right: -10, pointerEvents: "none" }}>
					<svg width={102} height={143} viewBox="0 0 80 110" fill="none" stroke="#fff" strokeWidth="1" opacity={0.18} style={{ display: "block" }}>
						<path d="M40 110 C40 85,38 60,40 35" />
						<path d="M40 75 C28 62,18 55,15 48" />
						<path d="M40 60 C52 48,62 44,65 37" />
						<circle cx="40" cy="28" r="5" />
					</svg>
				</div>
				<div style={{ position: "absolute", top: 2, left: 8, pointerEvents: "none" }}>
					<svg width={76} height={68} viewBox="0 0 80 72" fill="none" stroke="#fff" strokeWidth="1" opacity={0.22} style={{ display: "block" }}>
						<path d="M40 36 C30 18,4 8,6 24 C8 40,30 36,40 36Z" />
						<path d="M40 36 C26 38,8 44,10 56 C12 66,32 58,40 36Z" />
						<path d="M40 36 C50 18,76 8,74 24 C72 40,50 36,40 36Z" />
						<path d="M40 36 C54 38,72 44,70 56 C68 66,48 58,40 36Z" />
					</svg>
				</div>
				<div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 14 }}>
					{user.pictureUrl ? (
						<img src={user.pictureUrl} alt={user.name ?? user.email} style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,.4)" }} />
					) : (
						<div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,.2)", border: "2px solid rgba(255,255,255,.4)", display: "grid", placeItems: "center", flexShrink: 0 }}>
							<span style={{ fontFamily: "Lora, Georgia, serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>{init}</span>
						</div>
					)}
					<div>
						<div style={{ fontFamily: "Lora, Georgia, serif", fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
							{user.name ?? "Gardener"}
						</div>
						<div style={{ color: "rgba(255,255,255,.6)", fontSize: 13, marginTop: 3 }}>{user.email}</div>
					</div>
				</div>
			</div>

			<Scroll>
				{[
					{ e: "📧", l: "Email", v: user.email },
					{ e: "🌿", l: "App version", v: "v1.0.0" },
				].map((row) => (
					<div key={row.l} style={{ background: "#F8F4EC", border: "1px solid #D9E2D0", borderRadius: 22, padding: 14, boxShadow: "0 3px 10px rgba(36,53,40,.09)" }}>
						<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
							<div style={{ width: 38, height: 38, borderRadius: 11, background: "#DDE8D6", display: "grid", placeItems: "center", fontSize: 17, flexShrink: 0 }}>
								{row.e}
							</div>
							<div>
								<div style={{ fontSize: 12, color: "#687766" }}>{row.l}</div>
								<div style={{ fontSize: 15, fontWeight: 700, color: "#243528" }}>{row.v}</div>
							</div>
						</div>
					</div>
				))}

				<button
					type="button"
					onClick={onSignOut}
					style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 20px", borderRadius: 22, background: "transparent", color: "#c2185b", fontSize: 15, fontWeight: 700, border: "1.5px solid #f48fb1", minHeight: 50, width: "100%", cursor: "pointer", marginTop: 6 }}
				>
					→ Sign out
				</button>

				<div style={{ textAlign: "center", color: "#9BA893", fontSize: 11, paddingBottom: 16 }}>
					Garden Companion · v1.0.0
				</div>
			</Scroll>
		</div>
	);
}
