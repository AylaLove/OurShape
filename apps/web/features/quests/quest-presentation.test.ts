import { describe, expect, it } from "vitest";
import type { DailyQuest } from "@family-game/domain";
import { featuredQuests, questPrompt } from "./quest-presentation";

function quest(overrides: Partial<DailyQuest>): DailyQuest {
  return {
    id: "quest",
    householdId: "home",
    templateId: null,
    title: "Quest",
    instruction: "Help",
    spokenInstruction: "Help",
    kind: "open",
    state: "needed",
    effort: "light",
    appreciationValue: 1,
    contributionValue: 1,
    icon: "sparkle",
    participantIds: [],
    suggestedMemberIds: [],
    dueDate: "2026-07-23",
    urgency: 0,
    completedAt: null,
    ...overrides,
  };
}

describe("child quest presentation", () => {
  it("keeps an active joined quest ahead of new urgent work", () => {
    const result = featuredQuests([
      quest({ id: "urgent", title: "Dishes", urgency: 2 }),
      quest({
        id: "joined",
        title: "Laundry",
        state: "active",
        participantIds: ["sage"],
      }),
    ], "sage");

    expect(result.map((item) => item.id)).toEqual(["joined", "urgent"]);
  });

  it("prioritizes effort that the active person can thank", () => {
    const result = featuredQuests([
      quest({ id: "ordinary", title: "Plants" }),
      quest({
        id: "waiting",
        title: "Reading",
        state: "pending_endorsement",
        participantIds: ["ayla"],
      }),
    ], "sage");

    expect(result[0].id).toBe("waiting");
    expect(questPrompt(result[0])).toBe("Reading is waiting for thanks.");
  });

  it("never features completed or cancelled work", () => {
    const result = featuredQuests([
      quest({ id: "done", state: "completed" }),
      quest({ id: "cancelled", state: "cancelled" }),
      quest({ id: "open" }),
    ], "sage");

    expect(result.map((item) => item.id)).toEqual(["open"]);
  });
});
