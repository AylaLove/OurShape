import type {
  DailyQuest,
  EffortSize,
  QuestIcon,
  QuestScope,
} from "@family-game/domain";

export type QuickQuest = Omit<
  DailyQuest,
  "id" | "householdId" | "templateId" | "state" | "participantIds" | "dueDate" | "urgency" | "completedAt"
>;

export interface QuestCategoryOption {
  id: string;
  label: string;
  icon: QuestIcon;
  scope: QuestScope;
}

export const QUEST_CATEGORY_OPTIONS: QuestCategoryOption[] = [
  { id: "home-kitchen", label: "Kitchen", icon: "dishes", scope: "home" },
  { id: "home-laundry", label: "Laundry", icon: "laundry", scope: "home" },
  { id: "home-cleaning", label: "Cleaning", icon: "home", scope: "home" },
  { id: "home-garden", label: "Garden", icon: "plant", scope: "home" },
  { id: "home-care", label: "Care", icon: "sparkle", scope: "home" },
  { id: "home-errands", label: "Errands", icon: "home", scope: "home" },
  { id: "home-other", label: "Other home need", icon: "home", scope: "home" },
  { id: "personal-learning", label: "School or learning", icon: "book", scope: "personal" },
  { id: "personal-admin", label: "Admin", icon: "book", scope: "personal" },
  { id: "personal-maintenance", label: "Car or maintenance", icon: "wood", scope: "personal" },
  { id: "personal-health", label: "Health", icon: "sparkle", scope: "personal" },
  { id: "personal-appointments", label: "Appointments", icon: "book", scope: "personal" },
  { id: "personal-other", label: "Other personal responsibility", icon: "sparkle", scope: "personal" },
];

export interface QuickQuestDraft {
  title: string;
  instruction: string;
  scope: QuestScope;
  categoryId: string;
  effort: EffortSize;
  suggestedMemberId: string | null;
}

const APPRECIATION_BY_EFFORT: Record<EffortSize, number> = {
  light: 1,
  medium: 2,
  substantial: 4,
  major: 4,
};

export function buildQuickQuest(draft: QuickQuestDraft): QuickQuest | null {
  const title = draft.title.trim();
  const instruction = draft.instruction.trim();
  const category = QUEST_CATEGORY_OPTIONS.find(
    (option) => option.id === draft.categoryId && option.scope === draft.scope,
  );
  if (!title || !instruction || !category) return null;
  if (draft.scope === "personal" && !draft.suggestedMemberId) return null;

  const appreciationValue = APPRECIATION_BY_EFFORT[draft.effort];
  return {
    title: title.slice(0, 80),
    instruction: instruction.slice(0, 240),
    spokenInstruction: instruction.slice(0, 240),
    kind: draft.scope === "personal" ? "personal" : "open",
    effort: draft.effort,
    appreciationValue,
    contributionValue: draft.scope === "home" ? appreciationValue : 0,
    icon: category.icon,
    suggestedMemberIds: draft.suggestedMemberId ? [draft.suggestedMemberId] : [],
    scope: draft.scope,
    categoryId: category.id,
    homeEnergyValue: draft.scope === "home" ? 1 : 0,
  };
}
