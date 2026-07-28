import type { DailyQuest, QuestScope, QuestTemplate } from "./types";

type ClassifiableQuest = Pick<DailyQuest | QuestTemplate, "kind" | "scope" | "homeEnergyValue">;

export function questScope(quest: ClassifiableQuest): QuestScope {
  if (quest.scope) return quest.scope;
  return quest.kind === "personal" ? "personal" : "home";
}

export function questHomeEnergyValue(quest: ClassifiableQuest): number {
  if (quest.kind === "repair") return 0;
  if (quest.homeEnergyValue !== undefined) {
    return Math.max(0, Math.floor(quest.homeEnergyValue));
  }
  return questScope(quest) === "home" ? 1 : 0;
}
