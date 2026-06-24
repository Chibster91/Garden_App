import { describe, expect, it } from "vitest";
import { getMoonPhase, getSeason } from "./weather";

describe("getMoonPhase", () => {
	it("identifies a known full moon", () => {
		// 2024-08-19 18:26 UTC was a documented full moon.
		const { name } = getMoonPhase(new Date("2024-08-19T18:26:00Z"));
		expect(name).toBe("Full Moon");
	});

	it("identifies a known new moon", () => {
		// 2024-08-04 11:13 UTC was a documented new moon.
		const { name } = getMoonPhase(new Date("2024-08-04T11:13:00Z"));
		expect(name).toBe("New Moon");
	});
});

describe("getSeason", () => {
	it("returns northern-hemisphere seasons by month", () => {
		expect(getSeason(new Date("2026-01-15"), 40)).toBe("Winter");
		expect(getSeason(new Date("2026-04-15"), 40)).toBe("Spring");
		expect(getSeason(new Date("2026-07-15"), 40)).toBe("Summer");
		expect(getSeason(new Date("2026-10-15"), 40)).toBe("Autumn");
	});

	it("flips seasons for southern-hemisphere latitudes", () => {
		expect(getSeason(new Date("2026-01-15"), -33)).toBe("Summer");
		expect(getSeason(new Date("2026-07-15"), -33)).toBe("Winter");
	});

	it("handles the december/january boundary", () => {
		expect(getSeason(new Date("2025-12-31"), 40)).toBe("Winter");
		expect(getSeason(new Date("2026-01-01"), 40)).toBe("Winter");
	});
});
