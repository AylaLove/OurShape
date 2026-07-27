import { describe, expect, it } from "vitest";
import type { GameState } from "@family-game/domain";
import { DEMO_HOUSEHOLD } from "../households/demo-household";
import { DEMO_QUESTS } from "../quests/demo-quests";
import { openingCheckInItems } from "./opening-check-in";

function stateWithRepair(): GameState {
  return {
    household: DEMO_HOUSEHOLD,
    quests: DEMO_QUESTS.map((quest) => ({ ...quest })),
    completions: [],
    endorsements: [],
    pointLedger: [{
      id: "seed",
      householdId: DEMO_HOUSEHOLD.id,
      memberId: "demo-child",
      questId: null,
      amount: 3,
      reason: "kindness",
      idempotencyKey: "seed",
      createdAt: "2026-07-27T09:00:00Z",
    }],
    contributionLedger: [],
    rewards: [{
      id: "watch",
      householdId: DEMO_HOUSEHOLD.id,
      title: "Watch time",
      icon: "screen",
      cost: 3,
      audience: "child",
      requiresConsent: true,
    }],
    redemptions: [],
    highFives: [],
    history: [],
  };
}

describe("openingCheckInItems", () => {
  it("shows points, actionable thanks, and the active member's repair", () => {
    const state = stateWithRepair();
    const sage = state.household.members.find((member) => member.id === "demo-child")!;
    const items = openingCheckInItems(state, sage);

    expect(items.map((item) => item.id)).toEqual(["points", "repair"]);
    expect(items[0].value).toBe("3");
  });

  it("shows affordable treasure when repair is clear", () => {
    const state = stateWithRepair();
    state.quests = state.quests.filter((quest) => quest.kind !== "repair");
    const sage = state.household.members.find((member) => member.id === "demo-child")!;

    expect(openingCheckInItems(state, sage).map((item) => item.id)).toEqual(["points", "treasure"]);
  });
});
