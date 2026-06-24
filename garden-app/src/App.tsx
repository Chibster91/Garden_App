import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { SignInButton } from "./components/SignInButton";
import { SeedCatalogView } from "./components/SeedCatalogView";
import { PlantedTrackerView } from "./components/PlantedTrackerView";
import { JournalView } from "./components/JournalView";
import { TasksView } from "./components/TasksView";
import { TodayView } from "./components/TodayView";
import { ProfileView } from "./components/ProfileView";
import { AppHeader } from "./components/AppHeader";
import { BottomNav } from "./components/BottomNav";
import type { AppView } from "./types";

const VIEW_TITLES: Record<AppView, string> = {
	today: "Garden Companion",
	planted: "Garden",
	seeds: "My Seeds",
	journal: "Journal",
	tasks: "Tasks",
	profile: "Profile",
};

export default function App() {
	const { user, isLoading, error, renderSignInButton, signOut } = useAuth();
	const [view, setView] = useState<AppView>("today");
	const [plantSeedId, setPlantSeedId] = useState<string | null>(null);
	const [journalPlantedId, setJournalPlantedId] = useState<string | null>(null);

	if (isLoading) return null;

	if (!user) {
		return (
			<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 48 }}>
				<h1>Garden Companion</h1>
				<p>Sign in to sync your seeds, plants, and garden tasks.</p>
				<SignInButton renderSignInButton={renderSignInButton} />
				{error && <p style={{ color: "crimson" }}>{error}</p>}
			</div>
		);
	}

	const showBottomNav = view !== "tasks";
	const showBackHeader = view === "tasks";

	return (
		<div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
			{showBackHeader && <AppHeader title={VIEW_TITLES[view]} onBack={() => setView("today")} />}
			<main style={{ flex: 1, padding: 16, overflowY: "auto" }}>
				{view === "today" && <TodayView onManageTasks={() => setView("tasks")} />}
				{view === "seeds" && (
					<SeedCatalogView
						onPlantSeed={(seedId) => {
							setPlantSeedId(seedId);
							setView("planted");
						}}
					/>
				)}
				{view === "planted" && (
					<PlantedTrackerView
						initialSeedId={plantSeedId}
						onConsumeInitialSeedId={() => setPlantSeedId(null)}
						onAddJournalEntry={(plantedId) => {
							setJournalPlantedId(plantedId);
							setView("journal");
						}}
					/>
				)}
				{view === "journal" && (
					<JournalView
						initialPlantedId={journalPlantedId}
						onConsumeInitialPlantedId={() => setJournalPlantedId(null)}
					/>
				)}
				{view === "tasks" && <TasksView />}
				{view === "profile" && <ProfileView user={user} onSignOut={signOut} />}
			</main>
			{showBottomNav && <BottomNav active={view} onChange={setView} />}
		</div>
	);
}
