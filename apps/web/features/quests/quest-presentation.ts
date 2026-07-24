import type { DailyQuest } from "@family-game/domain";

const STATE_PRIORITY: Record<DailyQuest["state"], number> = {
  active: 0,
  needed: 1,
  carried: 2,
  rescheduled: 3,
  pending_endorsement: 4,
  completed: 5,
  cancelled: 6,
};

function scoreQuest(quest: DailyQuest, activeMemberId: string) {
  const joinedByActiveMember = quest.participantIds.includes(activeMemberId);
  const waitingForActiveMember =
    quest.state === "pending_endorsement" && !joinedByActiveMember;

  return (
    (joinedByActiveMember && quest.state === "active" ? -100 : 0) +
    (waitingForActiveMember ? -80 : 0) +
    STATE_PRIORITY[quest.state] * 10 -
    quest.urgency * 6
  );
}

export function featuredQuests(
  quests: DailyQuest[],
  activeMemberId: string,
  limit = 3,
) {
  return quests
    .filter((quest) => !["completed", "cancelled"].includes(quest.state))
    .sort((left, right) => {
      const scoreDifference =
        scoreQuest(left, activeMemberId) - scoreQuest(right, activeMemberId);
      return scoreDifference || left.title.localeCompare(right.title);
    })
    .slice(0, limit);
}

export function questPrompt(quest: DailyQuest | undefined) {
  if (!quest) return "The home is settled.";
  if (quest.state === "active") return `${quest.title} is happening now.`;
  if (quest.state === "pending_endorsement") {
    return `${quest.title} is waiting for thanks.`;
  }
  return `${quest.title} needs us.`;
}
