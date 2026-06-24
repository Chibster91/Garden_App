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
		<div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
			<span style={{ color: "var(--text-muted)" }}>{label}:</span>
			<span style={{ textAlign: "right" }}>{value}</span>
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
		<div className="card" style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
			<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
				<span className="icon-badge">{icon}</span>
				<strong style={{ fontFamily: "var(--font-serif)" }}>{title}</strong>
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>{children}</div>
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
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
				<button
					type="button"
					onClick={onBack}
					aria-label="Back"
					style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: 0 }}
				>
					←
				</button>
				<h2 style={{ flex: 1 }}>Seed Details</h2>
			</div>

			<div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
				<div style={{ display: "flex", gap: 12 }}>
					<div
						style={{
							width: 96,
							height: 120,
							borderRadius: 10,
							background: photoUrl ? undefined : "var(--border)",
							flexShrink: 0,
							overflow: "hidden",
						}}
					>
						{photoUrl && (
							<img
								src={photoUrl}
								alt={seed.plantName}
								style={{ width: "100%", height: "100%", objectFit: "cover" }}
							/>
						)}
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
						<h2 style={{ fontSize: 26 }}>{seed.plantName}</h2>
						{seed.variety && (
							<span style={{ fontStyle: "italic", color: "var(--accent)", fontFamily: "var(--font-serif)" }}>
								{seed.variety}
							</span>
						)}
						<div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
							{seed.brand && <Row label="Brand" value={seed.brand} />}
							<div style={{ display: "flex", justifyContent: "space-between" }}>
								<span style={{ color: "var(--text-muted)" }}>Status:</span>
								<span className="pill">{SEED_STATUS_LABELS[seed.status]}</span>
							</div>
							{seed.year != null && <Row label="Year packed" value={String(seed.year)} />}
							{seed.quantity != null && <Row label="Quantity left" value={String(seed.quantity)} />}
						</div>
					</div>
				</div>

				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						borderTop: "1px solid var(--border)",
						paddingTop: 12,
						color: "var(--text-muted)",
						fontSize: 14,
					}}
				>
					<span>📷</span>
					<span>{seed.photoFrontKey || seed.photoBackKey ? "Packet photos saved" : "No packet photos yet"}</span>
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
				<div className="card" style={{ display: "flex", gap: 10 }}>
					<span className="icon-badge">📋</span>
					<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
						<strong style={{ fontFamily: "var(--font-serif)" }}>Notes</strong>
						<p style={{ margin: 0, fontSize: 14, whiteSpace: "pre-wrap" }}>{seed.notes}</p>
					</div>
				</div>
			)}

			<button
				type="button"
				onClick={onEdit}
				style={{
					padding: "12px 0",
					borderRadius: 999,
					border: "1px solid var(--header-dark)",
					background: "var(--header)",
					color: "#fff",
					fontSize: 16,
					cursor: "pointer",
				}}
			>
				✏️ Edit Details
			</button>
		</div>
	);
}
