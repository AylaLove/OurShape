import { describe, expect, it } from "vitest";
import { buildQuickQuest } from "./quick-quest";

describe("quick quest builder", () => {
  it("creates shared work that powers the home", () => {
    expect(buildQuickQuest({
      title: "Clear the table",
      instruction: "Put the dishes by the sink and wipe the table.",
      scope: "home",
      categoryId: "home-kitchen",
      effort: "light",
      suggestedMemberId: null,
    })).toMatchObject({
      kind: "open",
      scope: "home",
      categoryId: "home-kitchen",
      appreciationValue: 1,
      contributionValue: 1,
      homeEnergyValue: 1,
      suggestedMemberIds: [],
    });
  });

  it("creates a personal responsibility without adding Home Energy", () => {
    expect(buildQuickQuest({
      title: "School reading",
      instruction: "Read for fifteen minutes.",
      scope: "personal",
      categoryId: "personal-learning",
      effort: "medium",
      suggestedMemberId: "sage",
    })).toMatchObject({
      kind: "personal",
      scope: "personal",
      categoryId: "personal-learning",
      appreciationValue: 2,
      contributionValue: 0,
      homeEnergyValue: 0,
      suggestedMemberIds: ["sage"],
    });
  });

  it("requires an owner for personal responsibilities", () => {
    expect(buildQuickQuest({
      title: "Book dentist",
      instruction: "Call and book the appointment.",
      scope: "personal",
      categoryId: "personal-appointments",
      effort: "light",
      suggestedMemberId: null,
    })).toBeNull();
  });
});
