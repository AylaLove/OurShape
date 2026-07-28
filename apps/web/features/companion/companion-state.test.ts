import { describe, expect, it } from "vitest";
import type { GameState } from "@family-game/domain";
import { DEMO_HOUSEHOLD } from "../households/demo-household";
import { DEMO_QUESTS } from "../quests/demo-quests";
import { deriveHomeDinosaurState, dinosaurMessage, homeEnergy } from "./companion-state";

function awakeState(): GameState {
  return {
    household: {
      ...DEMO_HOUSEHOLD,
      members: DEMO_HOUSEHOLD.members.map((member) => ({ ...member })),
      quietHoursStart: "00:00",
      quietHoursEnd: "00:00",
    },
    quests: DEMO_QUESTS.filter((quest) => quest.kind !== "repair").map((quest) => ({
      ...quest,
      participantIds: [...quest.participantIds],
      suggestedMemberIds: [...quest.suggestedMemberIds],
    })),
    completions: [],
    endorsements: [],
    pointLedger: [],
    contributionLedger: [],
    rewards: [],
    redemptions: [],
    highFives: [],
    history: [],
  };
}

describe("Home Dinosaur state", () => {
  it("shows teamwork while the active member is in a shared active quest", () => {
    expect(deriveHomeDinosaurState(awakeState(), "demo-child")).toBe("teamwork");
  });

  it("gently points the affected person toward an open Repair Mission", () => {
    const state = awakeState();
    state.quests.push({
      ...DEMO_QUESTS.find((quest) => quest.kind === "repair")!,
      participantIds: [],
      suggestedMemberIds: ["demo-child"],
    });

    expect(deriveHomeDinosaurState(state, "demo-child")).toBe("repairing");
    expect(dinosaurMessage("repairing")).toContain("Something needs repairing");
  });

  it("carries energy for a person who can thank completed work", () => {
    expect(deriveHomeDinosaurState(awakeState(), "demo-ayla")).toBe("carrying-energy");
  });

  it("invites participation when an ordinary need is waiting", () => {
    const state = awakeState();
    state.quests = state.quests.filter((quest) => quest.id === "demo-plants");

    expect(deriveHomeDinosaurState(state, "demo-child")).toBe("inviting");
  });

  it("sleeps during household quiet hours", () => {
    const state = awakeState();
    state.household = {
      ...state.household,
      quietHoursStart: "20:00",
      quietHoursEnd: "07:00",
    };

    expect(deriveHomeDinosaurState(state, "demo-child", new Date(2026, 6, 23, 22, 0))).toBe("sleeping");
  });

  it("counts each endorsed quest once as Home Energy", () => {
    const state = awakeState();
    state.pointLedger.push(
      {
        id: "energy-1",
        householdId: state.household.id,
        memberId: "demo-ayla",
        questId: "demo-laundry",
        amount: 1,
        reason: "quest_endorsed",
        idempotencyKey: "one",
        createdAt: "2026-07-23T09:00:00.000Z",
      },
      {
        id: "energy-2",
        householdId: state.household.id,
        memberId: "demo-child",
        questId: "demo-laundry",
        amount: 1,
        reason: "quest_endorsed",
        idempotencyKey: "two",
        createdAt: "2026-07-23T09:00:00.000Z",
      },
    );

    expect(homeEnergy(state)).toBe(1);
  });

  it("keeps endorsed personal responsibilities out of Home Energy", () => {
    const state = awakeState();
    state.pointLedger.push({
      id: "personal-points",
      householdId: state.household.id,
      memberId: "demo-child",
      questId: "demo-reading",
      amount: 1,
      reason: "quest_endorsed",
      idempotencyKey: "personal-reading",
      createdAt: "2026-07-23T09:00:00.000Z",
    });

    expect(homeEnergy(state)).toBe(0);
  });

  it("explains pending energy without blaming anyone", () => {
    expect(dinosaurMessage("carrying-energy", 1)).toBe(
      "One finished quest is waiting for thanks. Then its energy comes home.",
    );
  });
});
