import { describe, expect, it } from "vitest";
import {
  endorseQuest,
  joinQuest,
  markQuestDone,
  pointBalance,
  regularPolygonPoints,
  type GameState,
} from "..";

function fixture(): GameState {
  const householdId = "home-one";
  return {
    household: {
      id: householdId,
      name: "Test Home",
      timezone: "Africa/Johannesburg",
      quietHoursStart: "20:00",
      quietHoursEnd: "07:00",
      members: [
        { id: "adult-a", householdId, displayName: "Adult A", initials: "A", role: "adult", colour: "#ef6d5b", pointLabel: "Chill Points", contributionTarget: 10 },
        { id: "adult-b", householdId, displayName: "Adult B", initials: "B", role: "adult", colour: "#3c7f9d", pointLabel: "Chill Points", contributionTarget: 10 },
        { id: "child", householdId, displayName: "Child", initials: "C", role: "child", colour: "#e2aa37", pointLabel: "Watch Points", contributionTarget: 4 },
      ],
    },
    quests: [{
      id: "quest-one",
      householdId,
      templateId: "template-one",
      title: "Tidy together",
      instruction: "Tidy.",
      spokenInstruction: "Tidy together.",
      kind: "duo",
      state: "needed",
      effort: "medium",
      appreciationValue: 2,
      contributionValue: 2,
      icon: "home",
      participantIds: [],
      suggestedMemberIds: [],
      dueDate: "2026-07-22",
      urgency: 0,
      completedAt: null,
    }],
    completions: [], endorsements: [], pointLedger: [], contributionLedger: [], rewards: [], redemptions: [], highFives: [], history: [],
  };
}

describe("quest participation and gratitude", () => {
  it("requires another household member to acknowledge the work", () => {
    let state = fixture();
    state = joinQuest(state, "quest-one", "adult-a", "2026-07-22T08:00:00Z").state;
    state = markQuestDone(state, "quest-one", "adult-a", "2026-07-22T08:10:00Z").state;
    const result = endorseQuest(state, "quest-one", "adult-a", "thanked", "2026-07-22T08:11:00Z");
    expect(result.ok).toBe(false);
    expect(result.state.pointLedger).toHaveLength(0);
  });

  it("gives collaborators full appreciation while dividing contribution", () => {
    let state = fixture();
    state = joinQuest(state, "quest-one", "adult-a", "2026-07-22T08:00:00Z").state;
    state = joinQuest(state, "quest-one", "child", "2026-07-22T08:01:00Z").state;
    state = markQuestDone(state, "quest-one", "adult-a", "2026-07-22T08:10:00Z").state;
    const result = endorseQuest(state, "quest-one", "adult-b", "thanked", "2026-07-22T08:11:00Z");
    expect(result.ok).toBe(true);
    expect(pointBalance(result.state, "adult-a")).toBe(2);
    expect(pointBalance(result.state, "child")).toBe(2);
    expect(result.state.contributionLedger.map((entry) => entry.units)).toEqual([1, 1]);
  });

  it("cannot award the same completion twice", () => {
    let state = fixture();
    state = joinQuest(state, "quest-one", "adult-a", "2026-07-22T08:00:00Z").state;
    state = markQuestDone(state, "quest-one", "adult-a", "2026-07-22T08:10:00Z").state;
    state = endorseQuest(state, "quest-one", "adult-b", "thanked", "2026-07-22T08:11:00Z").state;
    const duplicate = endorseQuest(state, "quest-one", "child", "thanked", "2026-07-22T08:12:00Z");
    expect(duplicate.ok).toBe(false);
    expect(duplicate.state.pointLedger).toHaveLength(1);
  });
});

describe("household geometry", () => {
  it("supports every planned household size", () => {
    for (let count = 2; count <= 6; count += 1) expect(regularPolygonPoints(count)).toHaveLength(count);
  });
});
