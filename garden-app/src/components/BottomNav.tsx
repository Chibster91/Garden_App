import type { AppView } from "../types";

interface NavItem {
	key: AppView;
	label: string;
	icon: string;
}

const NAV_ITEMS: NavItem[] = [
	{ key: "today", label: "Home", icon: "🏡" },
	{ key: "planted", label: "Garden", icon: "🗓️" },
	{ key: "seeds", label: "My Seeds", icon: "🌱" },
	{ key: "journal", label: "Journal", icon: "📓" },
	{ key: "profile", label: "Profile", icon: "👤" },
];

interface BottomNavProps {
	active: AppView;
	onChange: (view: AppView) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
	return (
		<nav
			style={{
				display: "flex",
				justifyContent: "space-around",
				padding: "10px 8px",
				background: "var(--header)",
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
							gap: 2,
							padding: "8px 10px",
							borderRadius: 14,
							border: "none",
							background: isActive ? "var(--surface)" : "transparent",
							color: isActive ? "var(--text)" : "#fff",
							cursor: "pointer",
						}}
					>
						<span style={{ fontSize: 18 }}>{item.icon}</span>
						<span style={{ fontSize: 11 }}>{item.label}</span>
					</button>
				);
			})}
		</nav>
	);
}
