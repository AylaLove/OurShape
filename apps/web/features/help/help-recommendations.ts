import type { DailyQuest, HouseholdMember } from "@family-game/domain";

export type HelpMode = "alone" | "together" | "open";

export interface HelpRecommendation {
  quest: DailyQuest;
  reason: string;
  mode: HelpMode;
}

function modeFor(quest: DailyQuest): HelpMode {
  if (quest.kind === "personal" || quest.kind === "repair") return "alone";
  if (quest.kind === "duo" || quest.kind === "family") return "together";
  return "open";
}

function rankQuest(quest: DailyQuest, member: HouseholdMember): { score: number; reason: string } | null {
  if (["completed", "cancelled", "pending_endorsement"].includes(quest.state)) return null;

  const isRepair = quest.kind === "repair";
  const targeted = quest.suggestedMemberIds.includes(member.id);
  const joined = quest.participantIds.includes(member.id);

  if (isRepair && !targeted && !joined) return null;
  if (isRepair) return { score: 500, reason: "Make this right first" };
  if (joined) return { score: 400, reason: "You already joined" };
  if (targeted) return { score: 300, reason: "A good match for you" };
  if (quest.kind === "duo" || quest.kind === "family") return { score: 200, reason: "Help together" };
  return { score: 100 - quest.urgency, reason: "The home needs this" };
}

export function recommendHelp(quests: DailyQuest[], member: HouseholdMember, limit = 3): HelpRecommendation[] {
  return quests
    .map((quest, index) => {
      const ranked = rankQuest(quest, member);
      return ranked ? { quest, index, ...ranked } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map(({ quest, reason }) => ({ quest, reason, mode: modeFor(quest) }));
}
