export interface SeedRow {
	id: string;
	plant_name: string;
	variety: string | null;
	brand: string | null;
	year: number | null;
	quantity: number | null;
	status: string;
	photo_front_key: string | null;
	photo_back_key: string | null;
	notes: string | null;
	sow_indoor_start: string | null;
	sow_indoor_end: string | null;
	sow_direct_start: string | null;
	sow_direct_end: string | null;
	depth_in: number | null;
	spacing_in: number | null;
	germ_days_min: number | null;
	germ_days_max: number | null;
	germ_temp_f_min: number | null;
	germ_temp_f_max: number | null;
	light_needs: string | null;
	days_to_harvest_min: number | null;
	days_to_harvest_max: number | null;
	sow_method: string | null;
	best_season: string | null;
	transplant_timing: string | null;
	ready_to_transplant: string | null;
	harden_off_days: string | null;
	water_needs: string | null;
	soil_needs: string | null;
	common_pests: string;
	created_at: string;
	updated_at: string;
}

export function mapSeedRow(row: SeedRow) {
	return {
		id: row.id,
		plantName: row.plant_name,
		variety: row.variety,
		brand: row.brand,
		year: row.year,
		quantity: row.quantity,
		status: row.status,
		photoFrontKey: row.photo_front_key,
		photoBackKey: row.photo_back_key,
		notes: row.notes,
		sowIndoorStart: row.sow_indoor_start,
		sowIndoorEnd: row.sow_indoor_end,
		sowDirectStart: row.sow_direct_start,
		sowDirectEnd: row.sow_direct_end,
		depthIn: row.depth_in,
		spacingIn: row.spacing_in,
		germDaysMin: row.germ_days_min,
		germDaysMax: row.germ_days_max,
		germTempFMin: row.germ_temp_f_min,
		germTempFMax: row.germ_temp_f_max,
		lightNeeds: row.light_needs,
		daysToHarvestMin: row.days_to_harvest_min,
		daysToHarvestMax: row.days_to_harvest_max,
		sowMethod: row.sow_method,
		bestSeason: row.best_season,
		transplantTiming: row.transplant_timing,
		readyToTransplant: row.ready_to_transplant,
		hardenOffDays: row.harden_off_days,
		waterNeeds: row.water_needs,
		soilNeeds: row.soil_needs,
		commonPests: JSON.parse(row.common_pests) as string[],
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

export interface PlantedRow {
	id: string;
	seed_id: string;
	location: string | null;
	date_planted: string;
	stage: string;
	photo_keys: string;
	created_at: string;
	updated_at: string;
}

export function mapPlantedRow(row: PlantedRow) {
	return {
		id: row.id,
		seedId: row.seed_id,
		location: row.location,
		datePlanted: row.date_planted,
		stage: row.stage,
		photoKeys: JSON.parse(row.photo_keys) as string[],
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

export interface JournalEntryRow {
	id: string;
	planted_id: string | null;
	entry_type: string;
	entry_date: string;
	tags: string;
	text: string | null;
	photo_keys: string;
	created_at: string;
	updated_at: string;
}

export function mapJournalEntryRow(row: JournalEntryRow) {
	return {
		id: row.id,
		plantedId: row.planted_id,
		entryType: row.entry_type,
		entryDate: row.entry_date,
		tags: JSON.parse(row.tags) as string[],
		text: row.text,
		photoKeys: JSON.parse(row.photo_keys) as string[],
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

export interface TaskRow {
	id: string;
	planted_id: string | null;
	task_type: string;
	title: string;
	due_date: string;
	is_done: number;
	done_at: string | null;
	source: string;
	rule_key: string | null;
	created_at: string;
	updated_at: string;
}

export function mapTaskRow(row: TaskRow) {
	return {
		id: row.id,
		plantedId: row.planted_id,
		taskType: row.task_type,
		title: row.title,
		dueDate: row.due_date,
		isDone: row.is_done === 1,
		doneAt: row.done_at,
		source: row.source,
		ruleKey: row.rule_key,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}
