import { useCallback, useEffect, useState } from "react";
import { fetchWeather, getMoonPhase, getSeason, type Season, type WeatherSnapshot } from "../weather";

const COORDS_KEY = "gardenCoords";

interface Coords {
	latitude: number;
	longitude: number;
}

function getStoredCoords(): Coords | null {
	const raw = localStorage.getItem(COORDS_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as Coords;
	} catch {
		return null;
	}
}

function setStoredCoords(coords: Coords): void {
	localStorage.setItem(COORDS_KEY, JSON.stringify(coords));
}

function hasGeolocationSupport(): boolean {
	return typeof navigator !== "undefined" && Boolean(navigator.geolocation);
}

export function useWeather() {
	const [coords, setCoords] = useState<Coords | null>(() => getStoredCoords());
	const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
	const [isLoading, setIsLoading] = useState(() => Boolean(getStoredCoords()) || hasGeolocationSupport());
	const [error, setError] = useState<string | null>(null);
	const [needsLocation, setNeedsLocation] = useState(() => !getStoredCoords() && !hasGeolocationSupport());

	useEffect(() => {
		if (coords || !hasGeolocationSupport()) return;

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const next = { latitude: position.coords.latitude, longitude: position.coords.longitude };
				setStoredCoords(next);
				setCoords(next);
			},
			() => {
				setNeedsLocation(true);
				setIsLoading(false);
			},
			{ timeout: 10000 },
		);
	}, [coords]);

	useEffect(() => {
		if (!coords) return;
		fetchWeather(coords.latitude, coords.longitude)
			.then((snapshot) => {
				setWeather(snapshot);
				setError(null);
			})
			.catch(() => setError("Couldn't load weather."))
			.finally(() => setIsLoading(false));
	}, [coords]);

	const setManualLocation = useCallback((latitude: number, longitude: number) => {
		const next = { latitude, longitude };
		setStoredCoords(next);
		setNeedsLocation(false);
		setIsLoading(true);
		setCoords(next);
	}, []);

	const now = new Date();
	const moonPhase = getMoonPhase(now);
	const season: Season | null = coords ? getSeason(now, coords.latitude) : null;

	return { weather, isLoading, error, needsLocation, setManualLocation, moonPhase, season };
}
