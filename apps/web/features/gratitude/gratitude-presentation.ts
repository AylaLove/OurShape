import type { DailyQuest } from "@family-game/domain";

export interface GratitudeGroups {
  needsYourThanks: DailyQuest[];
  waitingForSomeoneElse: DailyQuest[];
}

export function groupWaitingQuests(quests: DailyQuest[], activeMemberId: string): GratitudeGroups {
  const waiting = quests.filter((quest) => quest.state === "pending_endorsement");

  return {
    needsYourThanks: waiting.filter((quest) => !quest.participantIds.includes(activeMemberId)),
    waitingForSomeoneElse: waiting.filter((quest) => quest.participantIds.includes(activeMemberId)),
  };
}
