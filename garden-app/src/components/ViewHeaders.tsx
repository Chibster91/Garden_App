import type { ReactNode } from "react";

/* ── Botanical SVG decorations ─────────────────────────────────────────────── */

function FloralStem({ size = 90, opacity = 0.18 }: { size?: number; opacity?: number }) {
	const cl = "#fff";
	const petals7 = [0, 51, 102, 153, 204, 255, 306];
	const petals6 = [0, 60, 120, 180, 240, 300];
	return (
		<svg width={size} height={size * 1.4} viewBox="0 0 80 110" fill="none" stroke={cl} strokeWidth="1" opacity={opacity} style={{ pointerEvents: "none", display: "block" }}>
			<path d="M40 110 C40 85,38 60,40 35" />
			<path d="M40 75 C28 62,18 55,15 48" />
			<path d="M40 60 C52 48,62 44,65 37" />
			<circle cx="40" cy="28" r="5" />
			{petals7.map((a, i) => {
				const r = (Math.PI * a) / 180;
				const x = 40 + Math.cos(r) * 12;
				const y = 28 + Math.sin(r) * 12;
				return <ellipse key={i} cx={x} cy={y} rx="5" ry="3.5" transform={`rotate(${a},${x},${y})`} />;
			})}
			<circle cx="15" cy="42" r="3.5" />
			{petals6.map((a, i) => {
				const r = (Math.PI * a) / 180;
				const x = 15 + Math.cos(r) * 8;
				const y = 42 + Math.sin(r) * 8;
				return <ellipse key={i} cx={x} cy={y} rx="3.5" ry="2.5" transform={`rotate(${a},${x},${y})`} />;
			})}
		</svg>
	);
}

function WildBranch({ size = 80, opacity = 0.16 }: { size?: number; opacity?: number }) {
	const cl = "#fff";
	return (
		<svg width={size} height={size} viewBox="0 0 80 80" fill="none" stroke={cl} strokeWidth="1" opacity={opacity} style={{ pointerEvents: "none", display: "block" }}>
			<path d="M10 80 C20 60,30 40,40 25" />
			<path d="M30 50 C22 40,14 38,10 32" />
			<path d="M38 32 C46 22,54 20,58 14" />
			<circle cx="40" cy="20" r="3" fill={cl} />
			<circle cx="43" cy="14" r="2" fill={cl} />
			<circle cx="37" cy="12" r="2" fill={cl} />
			<circle cx="58" cy="9" r="3" fill={cl} />
			<circle cx="61" cy="14" r="2" fill={cl} />
			<circle cx="10" cy="27" r="2.5" fill={cl} />
		</svg>
	);
}

function Butterfly({ size = 70, opacity = 0.22 }: { size?: number; opacity?: number }) {
	const cl = "#fff";
	return (
		<svg width={size} height={size * 0.9} viewBox="0 0 80 72" fill="none" stroke={cl} strokeWidth="1" opacity={opacity} style={{ pointerEvents: "none", display: "block" }}>
			<path d="M40 36 C30 18,4 8,6 24 C8 40,30 36,40 36Z" />
			<path d="M40 36 C26 38,8 44,10 56 C12 66,32 58,40 36Z" />
			<path d="M40 36 C50 18,76 8,74 24 C72 40,50 36,40 36Z" />
			<path d="M40 36 C54 38,72 44,70 56 C68 66,48 58,40 36Z" />
			<line x1="40" y1="22" x2="40" y2="52" strokeWidth="1.5" />
			<path d="M40 22 C37 16,32 10,29 7" />
			<path d="M40 22 C43 16,48 10,51 7" />
			<circle cx="29" cy="7" r="2" fill={cl} stroke="none" />
			<circle cx="51" cy="7" r="2" fill={cl} stroke="none" />
		</svg>
	);
}

/* ── PageHdr — green header for list views ──────────────────────────────────── */

interface PageHdrProps {
	title: string;
	onAdd?: () => void;
	addLabel?: string;
	children?: ReactNode;
}

export function PageHdr({ title, onAdd, addLabel = "Add", children }: PageHdrProps) {
	return (
		<div style={{ background: "#5E7A5E", padding: `20px 18px ${children ? 16 : 28}px`, flexShrink: 0, position: "relative", overflow: "hidden" }}>
			<div style={{ position: "absolute", top: -6, right: -10, pointerEvents: "none" }}>
				<FloralStem size={82} />
			</div>
			<div style={{ position: "absolute", top: 6, left: 14, pointerEvents: "none" }}>
				<WildBranch size={56} />
			</div>
			<div style={{ position: "relative", zIndex: 1 }}>
				<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: children ? 14 : 0 }}>
					<h1 style={{ margin: 0, fontFamily: "Lora, Georgia, serif", fontSize: 36, fontWeight: 700, color: "#fff", letterSpacing: "-1px", lineHeight: 1 }}>
						{title}
					</h1>
					{onAdd && (
						<button type="button" onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 999, background: "rgba(255,255,255,.18)", color: "#fff", fontSize: 12, fontWeight: 700, border: "1.5px solid rgba(255,255,255,.3)", cursor: "pointer" }}>
							+ {addLabel}
						</button>
					)}
				</div>
				{children}
			</div>
		</div>
	);
}

/* ── GreenHdr — green header for detail / form / sub-screens ───────────────── */

interface GreenHdrProps {
	title: string;
	onBack?: () => void;
	right?: ReactNode;
}

export function GreenHdr({ title, onBack, right }: GreenHdrProps) {
	return (
		<div style={{ background: "#5E7A5E", padding: "14px 18px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
			<div style={{ position: "absolute", top: -14, left: -2, pointerEvents: "none" }}>
				<Butterfly size={74} />
			</div>
			<div style={{ position: "absolute", top: -8, right: -8, pointerEvents: "none" }}>
				<FloralStem size={70} />
			</div>
			<div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative", zIndex: 1 }}>
				<button
					type="button"
					onClick={onBack}
					style={{ width: 36, height: 36, borderRadius: 999, background: "rgba(255,255,255,.16)", color: "#fff", display: "grid", placeItems: "center", flexShrink: 0, opacity: onBack ? 1 : 0, pointerEvents: onBack ? "auto" : "none", border: "none", cursor: "pointer", fontSize: 20 }}
				>
					←
				</button>
				<div style={{ flex: 1, textAlign: "center" }}>
					<span style={{ fontFamily: "Lora, Georgia, serif", fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.2px" }}>{title}</span>
				</div>
				<div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
					{right ?? null}
				</div>
			</div>
		</div>
	);
}

/* ── Scroll — scrollable content area ──────────────────────────────────────── */

export function Scroll({ children, gap = 11, paddingBottom = 24 }: { children: ReactNode; gap?: number; paddingBottom?: number }) {
	return (
		<div style={{ flex: 1, overflowY: "auto", padding: `16px 15px ${paddingBottom}px`, display: "flex", flexDirection: "column", gap }}>
			{children}
		</div>
	);
}

/* ── ViewCard — card matching T.card from design ────────────────────────────── */

export function ViewCard({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
	return (
		<div style={{ background: "#F8F4EC", border: "1px solid #D9E2D0", borderRadius: 22, padding: 14, boxShadow: "0 3px 10px rgba(36,53,40,.09)", ...style }}>
			{children}
		</div>
	);
}

/* ── BtnPrimary / BtnOutline ────────────────────────────────────────────────── */

export function BtnPrimary({ children, onClick, disabled, style }: { children: ReactNode; onClick?: () => void; disabled?: boolean; style?: React.CSSProperties }) {
	return (
		<button type="button" onClick={onClick} disabled={disabled} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 20px", borderRadius: 22, background: "#35513B", color: "#fff", fontSize: 15, fontWeight: 700, minHeight: 50, width: "100%", opacity: disabled ? 0.5 : 1, border: "none", cursor: "pointer", ...style }}>
			{children}
		</button>
	);
}

export function BtnOutline({ children, onClick, style }: { children: ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
	return (
		<button type="button" onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 20px", borderRadius: 22, background: "transparent", color: "#35513B", fontSize: 15, fontWeight: 700, border: "1.5px solid #35513B", minHeight: 50, width: "100%", cursor: "pointer", ...style }}>
			{children}
		</button>
	);
}

/* ── EmptyState ─────────────────────────────────────────────────────────────── */

export function EmptyState({ emoji, title, sub, action, onAction }: { emoji: string; title: string; sub?: string; action?: string; onAction?: () => void }) {
	return (
		<div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", gap: 10, textAlign: "center" }}>
			<span style={{ fontSize: 46, opacity: 0.4 }}>{emoji}</span>
			<strong style={{ fontFamily: "Lora, Georgia, serif", fontSize: 19, color: "#243528" }}>{title}</strong>
			{sub && <p style={{ margin: 0, color: "#687766", fontSize: 13, maxWidth: 220 }}>{sub}</p>}
			{action && onAction && <BtnPrimary onClick={onAction} style={{ maxWidth: 180, marginTop: 6 }}>{action}</BtnPrimary>}
		</div>
	);
}
