import { usePhotoUrl } from "../hooks/usePhotoUrl";
import { SEED_STATUS_LABELS, SOW_METHOD_LABELS, LIGHT_NEEDS_LABELS } from "../seeds";
import type { Seed } from "../types";

interface SeedDetailViewProps {
	seed: Seed;
	onBack: () => void;
	onEdit: () => void;
}

function Row({ label, value }: { label: string; value: string | null }) {
	if (!value) return null;
	return (
		<div style={{ display: "flex", justifyContent: "space-between", gap: 4, marginBottom: 1 }}>
			<span style={{ color: "#687766", fontSize: 11.5 }}>{label}</span>
			<span style={{ color: "#243528", fontWeight: 600, textAlign: "right", maxWidth: "58%", fontSize: 11.5 }}>{value}</span>
		</div>
	);
}

function Section({
	icon,
	title,
	children,
}: {
	icon: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div style={{ background: "#F8F4EC", border: "1px solid #D9E2D0", borderRadius: 22, padding: 13, boxShadow: "0 3px 10px rgba(36,53,40,.09)", display: "flex", flexDirection: "column", gap: 7, flex: 1, minWidth: 0, position: "relative", overflow: "hidden" }}>
			<div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
				<div style={{ width: 28, height: 28, borderRadius: 8, background: "#35513B", display: "grid", placeItems: "center", fontSize: 11, color: "#fff", fontWeight: 800, flexShrink: 0 }}>{icon}</div>
				<span style={{ fontFamily: "Lora, Georgia, serif", fontSize: 13, fontWeight: 700, color: "#243528" }}>{title}</span>
			</div>
			<div style={{ borderTop: "1px dashed #D9E2D0", marginBottom: 3 }} />
			<div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>{children}</div>
		</div>
	);
}

function rangeText(min: number | null, max: number | null, unit: string): string | null {
	if (min == null && max == null) return null;
	if (min != null && max != null) return `${min}–${max} ${unit}`;
	return `${min ?? max} ${unit}`;
}

export function SeedDetailView({ seed, onBack, onEdit }: SeedDetailViewProps) {
	const photoUrl = usePhotoUrl(seed.photoFrontKey);

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
			<div style={{ background: "#F8F4EC", border: "1px solid #D9E2D0", borderRadius: 22, padding: 14, boxShadow: "0 3px 10px rgba(36,53,40,.09)", display: "flex", flexDirection: "column", gap: 12 }}>
				<div style={{ display: "flex", gap: 12 }}>
					<div style={{ width: 106, height: 136, flexShrink: 0, borderRadius: 13, border: "1.5px dashed #D9E2D0", background: photoUrl ? undefined : "linear-gradient(145deg,#F0EBE0,#E8E2D4)", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
						{photoUrl ? (
							<img src={photoUrl} alt={seed.plantName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
						) : (
							<>
								<span style={{ fontSize: 34 }}>🌱</span>
								<span style={{ fontSize: 10, color: "#687766", textAlign: "center", padding: "0 5px", lineHeight: 1.3 }}>Packet photo</span>
							</>
						)}
					</div>
					<div style={{ flex: 1, minWidth: 0 }}>
						<div style={{ fontFamily: "Lora, Georgia, serif", fontSize: 22, fontWeight: 700, color: "#243528", lineHeight: 1, marginBottom: 2 }}>{seed.plantName}</div>
						{seed.variety && (
							<div style={{ fontFamily: "Lora, Georgia, serif", fontSize: 13.5, fontStyle: "italic", color: "#687766", marginBottom: 10 }}>{seed.variety}</div>
						)}
						<div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
							{seed.brand && <Row label="Brand" value={seed.brand} />}
							<div style={{ display: "flex", justifyContent: "space-between", gap: 4, marginBottom: 1 }}>
								<span style={{ color: "#687766", fontSize: 11.5 }}>Status</span>
								<span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: "#DDE8D6", color: "#35513B" }}>{SEED_STATUS_LABELS[seed.status]}</span>
							</div>
							{seed.year != null && <Row label="Year packed" value={String(seed.year)} />}
							{seed.quantity != null && <Row label="Quantity left" value={String(seed.quantity)} />}
						</div>
					</div>
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid #D9E2D0", paddingTop: 12 }}>
					<div style={{ width: 36, height: 36, borderRadius: 10, background: "#DDE8D6", display: "grid", placeItems: "center", flexShrink: 0 }}>📷</div>
					<div style={{ flex: 1 }}>
						<div style={{ fontSize: 12, fontWeight: 700, color: "#243528" }}>{seed.photoFrontKey || seed.photoBackKey ? "Packet photos saved" : "No packet photos yet"}</div>
						<div style={{ fontSize: 11, color: "#687766" }}>{seed.photoFrontKey && seed.photoBackKey ? "Front & back" : seed.photoFrontKey ? "Front only" : "—"}</div>
					</div>
				</div>
			</div>

			<div style={{ display: "flex", gap: 12 }}>
				<Section icon="🌿" title="When to Plant">
					<Row label="Start indoors" value={seed.sowIndoorStart} />
					<Row label="Direct sow" value={seed.sowDirectStart} />
					<Row label="Transplant" value={seed.transplantTiming} />
					<Row label="Best season" value={seed.bestSeason} />
				</Section>
				<Section icon="🤲" title="How to Plant">
					<Row label="Sow method" value={seed.sowMethod ? SOW_METHOD_LABELS[seed.sowMethod] : null} />
					<Row label="Depth" value={seed.depthIn != null ? `${seed.depthIn} in` : null} />
					<Row label="Spacing" value={seed.spacingIn != null ? `${seed.spacingIn} in` : null} />
					<Row label="Germination" value={rangeText(seed.germDaysMin, seed.germDaysMax, "days")} />
					<Row label="Germ. temp" value={rangeText(seed.germTempFMin, seed.germTempFMax, "°F")} />
				</Section>
			</div>

			<div style={{ display: "flex", gap: 12 }}>
				<Section icon="🌱" title="Seedling Timeline">
					<Row label="Ready to transplant" value={seed.readyToTransplant} />
					<Row label="Harden off" value={seed.hardenOffDays} />
				</Section>
				<Section icon="☀️" title="Growing Needs">
					<Row label="Sun" value={seed.lightNeeds ? LIGHT_NEEDS_LABELS[seed.lightNeeds] : null} />
					<Row label="Water" value={seed.waterNeeds} />
					<Row label="Soil" value={seed.soilNeeds} />
				</Section>
			</div>

			<div style={{ display: "flex", gap: 12 }}>
				<Section icon="🍅" title="Harvest">
					<Row label="Days to harvest" value={rangeText(seed.daysToHarvestMin, seed.daysToHarvestMax, "days")} />
				</Section>
				<Section icon="🐛" title="Common Pests">
					{seed.commonPests.length === 0 ? (
						<span style={{ color: "var(--text-muted)" }}>None noted</span>
					) : (
						<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
							{seed.commonPests.map((pest) => (
								<span key={pest} className="pill">
									{pest}
								</span>
							))}
						</div>
					)}
				</Section>
			</div>

			{seed.notes && (
				<div style={{ background: "#F8F4EC", border: "1px solid #D9E2D0", borderRadius: 22, padding: 13, boxShadow: "0 3px 10px rgba(36,53,40,.09)", display: "flex", gap: 10 }}>
					<div style={{ width: 30, height: 30, borderRadius: 8, background: "#DDE8D6", display: "grid", placeItems: "center", flexShrink: 0 }}>📋</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
						<strong style={{ fontFamily: "Lora, Georgia, serif", fontSize: 12.5, color: "#243528" }}>Notes</strong>
						<p style={{ margin: 0, fontSize: 12, color: "#687766", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{seed.notes}</p>
					</div>
				</div>
			)}

			<button
				type="button"
				onClick={onEdit}
				style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 20px", borderRadius: 22, background: "transparent", color: "#35513B", fontSize: 15, fontWeight: 700, border: "1.5px solid #35513B", minHeight: 50, width: "100%", cursor: "pointer" }}
			>
				✏️ Edit Details
			</button>
		</div>
	);
}
