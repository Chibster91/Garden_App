const SYNODIC_MONTH_DAYS = 29.530588853;
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14);

export const MOON_PHASE_NAMES = [
	"New Moon",
	"Waxing Crescent",
	"First Quarter",
	"Waxing Gibbous",
	"Full Moon",
	"Waning Gibbous",
	"Last Quarter",
	"Waning Crescent",
] as const;

export function getMoonPhase(date: Date): { age: number; name: string } {
	const diffDays = (date.getTime() - KNOWN_NEW_MOON_UTC) / 86400000;
	const age = ((diffDays % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS;
	const index = Math.round((age / SYNODIC_MONTH_DAYS) * 8) % 8;
	return { age, name: MOON_PHASE_NAMES[index] };
}

export type Season = "Winter" | "Spring" | "Summer" | "Autumn";

const NORTHERN_SEASON_BY_MONTH: Season[] = [
	"Winter",
	"Winter",
	"Spring",
	"Spring",
	"Spring",
	"Summer",
	"Summer",
	"Summer",
	"Autumn",
	"Autumn",
	"Autumn",
	"Winter",
];

const OPPOSITE_SEASON: Record<Season, Season> = {
	Winter: "Summer",
	Summer: "Winter",
	Spring: "Autumn",
	Autumn: "Spring",
};

export function getSeason(date: Date, latitude: number): Season {
	const season = NORTHERN_SEASON_BY_MONTH[date.getMonth()];
	return latitude < 0 ? OPPOSITE_SEASON[season] : season;
}

export interface WeatherSnapshot {
	temperatureC: number | null;
	precipitationProbability: number | null;
	sunrise: string | null;
	sunset: string | null;
	daylightHours: number | null;
}

export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherSnapshot> {
	const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation_probability&daily=sunrise,sunset&timezone=auto`;
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);
	const data = await response.json();

	const sunrise = data?.daily?.sunrise?.[0] ?? null;
	const sunset = data?.daily?.sunset?.[0] ?? null;
	const daylightHours =
		sunrise && sunset ? (new Date(sunset).getTime() - new Date(sunrise).getTime()) / 3600000 : null;

	return {
		temperatureC: data?.current?.temperature_2m ?? null,
		precipitationProbability: data?.current?.precipitation_probability ?? null,
		sunrise,
		sunset,
		daylightHours,
	};
}
