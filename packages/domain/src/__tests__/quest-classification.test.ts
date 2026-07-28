import { describe, expect, it } from "vitest";
import { questHomeEnergyValue, questScope, type DailyQuest } from "..";

function quest(overrides: Partial<DailyQuest> = {}): DailyQuest {
  return {
    id: "quest",
    householdId: "home",
    templateId: null,
    title: "A task",
    instruction: "Do the task.",
    spokenInstruction: "Do the task.",
    kind: "open",
    state: "needed",
    effort: "light",
    appreciationValue: 1,
    contributionValue: 1,
    icon: "home",
    participantIds: [],
    suggestedMemberIds: [],
    dueDate: "2026-07-28",
    urgency: 0,
    completedAt: null,
    ...overrides,
  };
}

describe("quest classification", () => {
  it("treats existing shared quests as home contributions", () => {
    const existingQuest = quest();
    expect(questScope(existingQuest)).toBe("home");
    expect(questHomeEnergyValue(existingQuest)).toBe(1);
  });

  it("treats existing personal quests as personal responsibilities", () => {
    const personalQuest = quest({ kind: "personal" });
    expect(questScope(personalQuest)).toBe("personal");
    expect(questHomeEnergyValue(personalQuest)).toBe(0);
  });

  it("keeps personal High Fives separate while allowing an explicit energy override", () => {
    const unusualPersonalQuest = quest({
      kind: "personal",
      scope: "personal",
      appreciationValue: 2,
      homeEnergyValue: 1,
    });
    expect(unusualPersonalQuest.appreciationValue).toBe(2);
    expect(questHomeEnergyValue(unusualPersonalQuest)).toBe(1);
  });

  it("never awards Home Energy for a Repair Mission", () => {
    expect(questHomeEnergyValue(quest({ kind: "repair", homeEnergyValue: 4 }))).toBe(0);
  });
});
