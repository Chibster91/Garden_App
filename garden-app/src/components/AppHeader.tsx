import type { ReactNode } from "react";

interface AppHeaderProps {
	title: string;
	onBack?: () => void;
	rightSlot?: ReactNode;
}

export function AppHeader({ title, onBack, rightSlot }: AppHeaderProps) {
	return (
		<header
			style={{
				display: "flex",
				alignItems: "center",
				gap: 12,
				padding: "16px 16px",
				background: "var(--header)",
				color: "#fff",
			}}
		>
			<div style={{ width: 28 }}>
				{onBack && (
					<button
						type="button"
						onClick={onBack}
						aria-label="Back"
						style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", padding: 0 }}
					>
						←
					</button>
				)}
			</div>
			<h1 style={{ flex: 1, textAlign: "center", fontSize: 22, color: "#fff" }}>{title}</h1>
			<div style={{ width: 28, textAlign: "right" }}>{rightSlot}</div>
		</header>
	);
}
