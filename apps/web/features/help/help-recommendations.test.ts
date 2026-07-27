import type { DailyQuest, HouseholdMember } from "@family-game/domain";
import { describe, expect, it } from "vitest";
import { recommendHelp } from "./help-recommendations";

const member: HouseholdMember = {
  id: "sage",
  householdId: "home",
  displayName: "Sage",
  initials: "S",
  role: "child",
  colour: "#f5b72e",
  pointLabel: "Watch Points",
  contributionTarget: 4,
};

function quest(id: string, overrides: Partial<DailyQuest> = {}): DailyQuest {
  return {
    id,
    householdId: "home",
    templateId: null,
    title: id,
    instruction: id,
    spokenInstruction: id,
    kind: "open",
    state: "needed",
    effort: "light",
    appreciationValue: 1,
    contributionValue: 1,
    icon: "sparkle",
    participantIds: [],
    suggestedMemberIds: [],
    dueDate: "2026-07-27",
    urgency: 0,
    completedAt: null,
    ...overrides,
  };
}

describe("help recommendations", () => {
  it("prioritises the active member's repair, joined work, and suggested work", () => {
    const result = recommendHelp([
      quest("open"),
      quest("suggested", { suggestedMemberIds: ["sage"] }),
      quest("joined", { state: "active", participantIds: ["sage"] }),
      quest("repair", { kind: "repair", suggestedMemberIds: ["sage"] }),
    ], member);

    expect(result.map((item) => item.quest.id)).toEqual(["repair", "joined", "suggested"]);
    expect(result.map((item) => item.reason)).toEqual([
      "Make this right first",
      "You already joined",
      "A good match for you",
    ]);
  });

  it("excludes completed, cancelled, waiting, and another person's repair", () => {
    const result = recommendHelp([
      quest("complete", { state: "completed" }),
      quest("cancelled", { state: "cancelled" }),
      quest("waiting", { state: "pending_endorsement" }),
      quest("other-repair", { kind: "repair", suggestedMemberIds: ["ayla"] }),
      quest("available"),
    ], member);

    expect(result.map((item) => item.quest.id)).toEqual(["available"]);
  });

  it("labels personal, team, and open participation modes", () => {
    const result = recommendHelp([
      quest("personal", { kind: "personal", suggestedMemberIds: ["sage"] }),
      quest("team", { kind: "duo" }),
      quest("open"),
    ], member);

    expect(Object.fromEntries(result.map((item) => [item.quest.id, item.mode]))).toEqual({
      personal: "alone",
      team: "together",
      open: "open",
    });
  });
});
