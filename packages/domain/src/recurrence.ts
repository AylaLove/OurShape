import type { DailyQuest, QuestTemplate } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

function dateOnly(value: string): Date {
  return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
}

export function templateOccursOn(template: QuestTemplate, date: string): boolean {
  if (!template.active) return false;
  const target = dateOnly(date);
  const rule = template.recurrence;
  if (rule.type === "daily") return true;
  if (rule.type === "selected_days") return rule.weekdays.includes(target.getUTCDay());
  if (rule.type === "monthly") return target.getUTCDate() === rule.dayOfMonth;
  if (rule.type === "every_n_days") {
    const elapsed = Math.floor((target.getTime() - dateOnly(rule.anchorDate).getTime()) / DAY_MS);
    return elapsed >= 0 && elapsed % rule.interval === 0;
  }
  return false;
}

export function generateDailyQuests(templates: QuestTemplate[], date: string, existing: DailyQuest[]): DailyQuest[] {
  const day = date.slice(0, 10);
  const existingKeys = new Set(existing.filter((quest) => quest.dueDate === day).map((quest) => quest.templateId));
  const created = templates
    .filter((template) => templateOccursOn(template, day) && !existingKeys.has(template.id))
    .map((template): DailyQuest => ({
      id: `${template.id}:${day}`,
      householdId: template.householdId,
      templateId: template.id,
      title: template.title,
      instruction: template.instruction,
      spokenInstruction: template.spokenInstruction,
      kind: template.kind,
      state: "needed",
      effort: template.effort,
      appreciationValue: template.appreciationValue,
      contributionValue: template.contributionValue,
      icon: template.icon,
      participantIds: [],
      suggestedMemberIds: [...template.suggestedMemberIds],
      dueDate: day,
      urgency: 0,
      completedAt: null,
    }));
  return [...existing, ...created];
}
