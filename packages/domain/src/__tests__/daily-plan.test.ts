import { describe, expect, it } from "vitest";
import { setDailyPlan, todayPlan } from "../daily-plan";
import type { GameState } from "../types";

function fixture(): GameState {
  return {
    household: {
      id: "home",
      name: "Home",
      timezone: "Africa/Johannesburg",
      quietHoursStart: "20:00",
      quietHoursEnd: "07:00",
      members: [{
        id: "adult",
        householdId: "home",
        displayName: "Adult",
        initials: "A",
        role: "adult",
        colour: "#ef6b57",
        pointLabel: "Points",
        contributionTarget: 8,
      }],
    },
    quests: [{
      id: "dishes",
      householdId: "home",
      templateId: null,
      title: "Dishes",
      instruction: "Do dishes",
      spokenInstruction: "Do dishes",
      kind: "open",
      state: "needed",
      effort: "light",
      appreciationValue: 1,
      contributionValue: 1,
      icon: "dishes",
      participantIds: [],
      suggestedMemberIds: [],
      dueDate: "2026-07-28",
      urgency: 0,
      completedAt: null,
    }],
    completions: [],
    endorsements: [],
    pointLedger: [],
    contributionLedger: [],
    rewards: [],
    redemptions: [],
    highFives: [],
    dailyPlans: [],
    history: [],
  };
}

describe("daily capacity and intentions", () => {
  it("stores one replaceable plan per member and day", () => {
    const first = setDailyPlan(fixture(), {
      capacity: "gentle",
      capacityContext: "cycle_support",
      intentionQuestIds: ["dishes"],
    }, "adult", "2026-07-28T08:00:00.000Z");
    const second = setDailyPlan(first.state, {
      capacity: "steady",
      capacityContext: "private",
      intentionQuestIds: [],
    }, "adult", "2026-07-28T09:00:00.000Z");

    expect(second.ok).toBe(true);
    expect(second.state.dailyPlans).toHaveLength(1);
    expect(todayPlan(second.state, "adult", "2026-07-28")?.capacity).toBe("steady");
  });

  it("rejects unavailable or excessive intentions", () => {
    const result = setDailyPlan(fixture(), {
      capacity: "steady",
      capacityContext: "private",
      intentionQuestIds: ["dishes", "two", "three", "four"],
    }, "adult", "2026-07-28T08:00:00.000Z");
    expect(result.ok).toBe(false);
  });
});
