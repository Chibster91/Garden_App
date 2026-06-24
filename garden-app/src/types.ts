export interface User {
	id: string;
	email: string;
	name: string | null;
	pictureUrl: string | null;
}

export type SeedStatus = "unopened" | "opened" | "low" | "empty";
export type LightNeeds = "full_sun" | "partial_sun" | "shade";

export interface Seed {
	id: string;
	plantName: string;
	variety: string | null;
	brand: string | null;
	year: number | null;
	quantity: number | null;
	status: SeedStatus;
	photoFrontKey: string | null;
	photoBackKey: string | null;
	notes: string | null;
	sowIndoorStart: string | null;
	sowIndoorEnd: string | null;
	sowDirectStart: string | null;
	sowDirectEnd: string | null;
	depthIn: number | null;
	spacingIn: number | null;
	germDaysMin: number | null;
	germDaysMax: number | null;
	germTempFMin: number | null;
	germTempFMax: number | null;
	lightNeeds: LightNeeds | null;
	daysToHarvestMin: number | null;
	daysToHarvestMax: number | null;
	sowMethod: SowMethod | null;
	bestSeason: string | null;
	transplantTiming: string | null;
	readyToTransplant: string | null;
	hardenOffDays: string | null;
	waterNeeds: string | null;
	soilNeeds: string | null;
	commonPests: string[];
	createdAt: string;
	updatedAt: string;
}

export type SowMethod = "start_indoors" | "direct_sow" | "either";

export type SeedInput = Omit<Seed, "id" | "createdAt" | "updatedAt">;

export type PlantedStage = "seedling" | "vegetative" | "flowering" | "fruiting" | "harvested" | "removed";

export interface Planted {
	id: string;
	seedId: string;
	location: string | null;
	datePlanted: string;
	stage: PlantedStage;
	photoKeys: string[];
	createdAt: string;
	updatedAt: string;
}

export type PlantedInput = Omit<Planted, "id" | "createdAt" | "updatedAt">;

export type JournalEntryType = "observation" | "pest" | "harvest" | "action" | "note";

export interface JournalEntry {
	id: string;
	plantedId: string | null;
	entryType: JournalEntryType;
	entryDate: string;
	tags: string[];
	text: string | null;
	photoKeys: string[];
	createdAt: string;
	updatedAt: string;
}

export type JournalEntryInput = Omit<JournalEntry, "id" | "createdAt" | "updatedAt">;

export type TaskType = "water" | "transplant" | "fertilize" | "check_pests" | "other";
export type TaskSource = "manual" | "rule";

export interface Task {
	id: string;
	plantedId: string | null;
	taskType: TaskType;
	title: string;
	dueDate: string;
	isDone: boolean;
	doneAt: string | null;
	source: TaskSource;
	ruleKey: string | null;
	createdAt: string;
	updatedAt: string;
}

export type TaskInput = Pick<Task, "plantedId" | "taskType" | "title" | "dueDate">;

export type AppView = "today" | "seeds" | "planted" | "journal" | "tasks" | "profile";

export interface GoogleCredentialResponse {
	credential: string;
	select_by?: string;
}

export interface GoogleIdConfig {
	client_id: string;
	callback: (response: GoogleCredentialResponse) => void;
	auto_select?: boolean;
}

export interface GoogleIdAccounts {
	id?: {
		initialize: (config: GoogleIdConfig) => void;
		renderButton: (parent: HTMLElement, options?: Record<string, unknown>) => void;
		disableAutoSelect?: () => void;
	};
}

declare global {
	interface Window {
		google?: { accounts?: GoogleIdAccounts };
	}
}
