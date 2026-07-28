import { describe, expect, it } from "vitest";
import type { DailyQuest, HouseholdMember } from "@family-game/domain";
import { recognitionNoticesForQuest } from "./recognition-notices";

const members: HouseholdMember[] = [
  {
    id: "ayla",
    householdId: "home",
    displayName: "Ayla",
    initials: "A",
    role: "adult",
    colour: "#f26b5b",
    pointLabel: "High Fives",
    contributionTarget: 10,
  },
  {
    id: "sage",
    householdId: "home",
    displayName: "Sage",
    initials: "S",
    role: "child",
    colour: "#f2ad27",
    pointLabel: "High Fives",
    contributionTarget: 5,
  },
];

function quest(kind: DailyQuest["kind"] = "open"): DailyQuest {
  return {
    id: "dishes",
    householdId: "home",
    templateId: null,
    title: "Dishes",
    instruction: "Clear and wash the dishes.",
    spokenInstruction: "Clear and wash the dishes.",
    kind,
    state: "pending_endorsement",
    effort: "light",
    appreciationValue: kind === "repair" ? 0 : 2,
    contributionValue: kind === "repair" ? 0 : 2,
    icon: kind === "repair" ? "repair" : "dishes",
    participantIds: ["sage"],
    suggestedMemberIds: [],
    dueDate: "2026-07-28",
    urgency: 0,
    completedAt: null,
  };
}

describe("recognition notices", () => {
  it("tells each helper who noticed them and what was awarded", () => {
    expect(recognitionNoticesForQuest(quest(), members, members[0])).toEqual([
      {
        memberId: "sage",
        moment: {
          title: "Ayla noticed your help",
          message: "Dishes helped the home.",
          pointsLabel: "+2 High Fives",
          homeEnergyLabel: "+1 Home Energy",
        },
      },
    ]);
  });

  it("treats repair as restored trust rather than paid work", () => {
    const notices = recognitionNoticesForQuest(quest("repair"), members, members[0]);
    expect(notices[0].moment.pointsLabel).toBe("Trust restored");
    expect(notices[0].moment.homeEnergyLabel).toBe("Treasure reopened");
  });
});
