import { describe, expect, it } from "vitest";
import { generateDailyQuests, templateOccursOn, type QuestTemplate } from "..";

const template: QuestTemplate = {
  id: "daily-dishes", householdId: "home", title: "Dishes", instruction: "Wash up", spokenInstruction: "The dishes need us", kind: "open", effort: "light", appreciationValue: 1, contributionValue: 1, icon: "dishes", recurrence: { type: "daily" }, suggestedMemberIds: [], active: true,
};

describe("recurring quest generation", () => {
  it("generates one daily instance without duplicating it", () => {
    const first = generateDailyQuests([template], "2026-07-22", []);
    const second = generateDailyQuests([template], "2026-07-22", first);
    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
  });

  it("keeps yesterday's history while creating tomorrow", () => {
    const yesterday = generateDailyQuests([template], "2026-07-22", []);
    const tomorrow = generateDailyQuests([template], "2026-07-23", yesterday);
    expect(tomorrow.map((quest) => quest.dueDate)).toEqual(["2026-07-22", "2026-07-23"]);
  });

  it("supports weekly and every-N-day rules", () => {
    expect(templateOccursOn({ ...template, recurrence: { type: "selected_days", weekdays: [3] } }, "2026-07-22")).toBe(true);
    expect(templateOccursOn({ ...template, recurrence: { type: "every_n_days", interval: 4, anchorDate: "2026-07-18" } }, "2026-07-22")).toBe(true);
  });
});
