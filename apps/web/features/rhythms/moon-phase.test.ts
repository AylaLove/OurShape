import { describe, expect, it } from "vitest";
import { moonPhaseForDate } from "./moon-phase";

describe("moon phase widget", () => {
  it("labels the known reference new moon", () => {
    expect(moonPhaseForDate(new Date("2000-01-06T18:14:00.000Z")).name).toBe("New moon");
  });

  it("returns a bounded illumination percentage", () => {
    const phase = moonPhaseForDate(new Date("2026-07-28T12:00:00.000Z"));
    expect(phase.illumination).toBeGreaterThanOrEqual(0);
    expect(phase.illumination).toBeLessThanOrEqual(100);
  });
});
