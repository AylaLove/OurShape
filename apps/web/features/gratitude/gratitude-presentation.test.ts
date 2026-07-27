import type { DailyQuest } from "@family-game/domain";
import { describe, expect, it } from "vitest";
import { groupWaitingQuests } from "./gratitude-presentation";

function quest(id: string, participantIds: string[], state: DailyQuest["state"] = "pending_endorsement"): DailyQuest {
  return {
    id,
    householdId: "home",
    templateId: null,
    title: id,
    instruction: id,
    spokenInstruction: id,
    kind: "open",
    state,
    effort: "light",
    appreciationValue: 1,
    contributionValue: 1,
    icon: "sparkle",
    participantIds,
    suggestedMemberIds: [],
    dueDate: "2026-07-27",
    urgency: 0,
    completedAt: null,
  };
}

describe("gratitude presentation", () => {
  it("separates work the active member can thank from their own work", () => {
    const groups = groupWaitingQuests([
      quest("sage-helped", ["sage"]),
      quest("ayla-helped", ["ayla"]),
      quest("already-complete", ["sage"], "completed"),
    ], "ayla");

    expect(groups.needsYourThanks.map((item) => item.id)).toEqual(["sage-helped"]);
    expect(groups.waitingForSomeoneElse.map((item) => item.id)).toEqual(["ayla-helped"]);
  });
});
