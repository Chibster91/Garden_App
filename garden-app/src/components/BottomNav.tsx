import type { AppView } from "../types";

interface NavItem {
	key: AppView;
	label: string;
	icon: string;
}

const NAV_ITEMS: NavItem[] = [
	{ key: "today",   label: "Home",     icon: "🏡" },
	{ key: "planted", label: "Garden",   icon: "🪴" },
	{ key: "seeds",   label: "My Seeds", icon: "🌱" },
	{ key: "journal", label: "Journal",  icon: "📓" },
	{ key: "profile", label: "Profile",  icon: "👤" },
];

interface BottomNavProps {
	active: AppView;
	onChange: (view: AppView) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
	return (
		<nav
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(5, 1fr)",
				gap: 2,
				padding: "5px 6px calc(5px + env(safe-area-inset-bottom))",
				height: "calc(68px + env(safe-area-inset-bottom))",
				background: "rgba(248, 244, 236, 0.97)",
				borderTop: "1px solid var(--border)",
				backdropFilter: "blur(16px)",
				WebkitBackdropFilter: "blur(16px)",
				flexShrink: 0,
			}}
		>
			{NAV_ITEMS.map((item) => {
				const isActive = item.key === active;
				return (
					<button
						key={item.key}
						type="button"
						onClick={() => onChange(item.key)}
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							gap: 3,
							padding: "3px 2px",
							borderRadius: 15,
							border: "none",
							background: isActive ? "var(--accent-subtle)" : "transparent",
							color: isActive ? "var(--accent)" : "var(--text-muted)",
							cursor: "pointer",
							fontSize: 10,
							fontWeight: 700,
							fontFamily: "var(--font-body)",
							transition: "background 0.15s",
						}}
					>
						<span style={{ fontSize: 21, lineHeight: 1 }}>{item.icon}</span>
						{item.label}
					</button>
				);
			})}
		</nav>
	);
}
