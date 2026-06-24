import type { User } from "../types";

interface ProfileViewProps {
	user: User;
	onSignOut: () => void;
}

export function ProfileView({ user, onSignOut }: ProfileViewProps) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<h2>Profile</h2>

			<div className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
				{user.pictureUrl ? (
					<img
						src={user.pictureUrl}
						alt={user.name ?? user.email}
						style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }}
					/>
				) : (
					<div
						className="icon-badge"
						style={{ width: 56, height: 56, minWidth: 56, fontSize: 24 }}
					>
						👤
					</div>
				)}
				<div style={{ display: "flex", flexDirection: "column" }}>
					<strong style={{ fontFamily: "var(--font-serif)", fontSize: 18 }}>{user.name ?? "Gardener"}</strong>
					<span style={{ color: "var(--text-muted)", fontSize: 14 }}>{user.email}</span>
				</div>
			</div>

			<button
				type="button"
				onClick={onSignOut}
				style={{
					padding: "12px 0",
					borderRadius: 999,
					border: "1px solid var(--border)",
					background: "var(--surface)",
					color: "var(--text)",
					fontSize: 16,
					cursor: "pointer",
				}}
			>
				Sign out
			</button>
		</div>
	);
}
