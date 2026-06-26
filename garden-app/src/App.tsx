import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { SignInButton } from "./components/SignInButton";
import { SeedCatalogView } from "./components/SeedCatalogView";
import { PlantedTrackerView } from "./components/PlantedTrackerView";
import { JournalView } from "./components/JournalView";
import { TasksView } from "./components/TasksView";
import { TodayView } from "./components/TodayView";
import { ProfileView } from "./components/ProfileView";
import { BottomNav } from "./components/BottomNav";
import type { AppView } from "./types";


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

	return (
		<div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
			<main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
				{view === "today" && (
					<TodayView
						onManageTasks={() => setView("tasks")}
						onAddJournal={() => setView("journal")}
						onAddPlanted={() => setView("planted")}
						onAddSeed={() => setView("seeds")}
					/>
				)}
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
				{view === "tasks" && <TasksView onBack={() => setView("today")} />}
				{view === "profile" && <ProfileView user={user} onSignOut={signOut} />}
			</main>
			{view !== "tasks" && <BottomNav active={view} onChange={setView} />}
		</div>
	);
}
