import type { DailyQuest, GameState } from "@family-game/domain";

export type HomeDinosaurState =
  | "resting"
  | "curious"
  | "encouraging"
  | "celebrating"
  | "carrying-energy"
  | "sharing-energy"
  | "sleeping"
  | "gratitude";

export function homeEnergy(state: GameState): number {
  return new Set(
    state.pointLedger
      .filter((entry) => entry.reason === "quest_endorsed" && entry.questId)
      .map((entry) => entry.questId),
  ).size;
}

function minutes(time: string): number {
  const [hours, mins] = time.split(":").map(Number);
  return (hours * 60) + mins;
}

export function isQuietHours(state: GameState, date = new Date()): boolean {
  const start = minutes(state.household.quietHoursStart);
  const end = minutes(state.household.quietHoursEnd);
  const current = (date.getHours() * 60) + date.getMinutes();

  if (start === end) return false;
  if (start < end) return current >= start && current < end;
  return current >= start || current < end;
}

export function deriveHomeDinosaurState(
  state: GameState,
  activeMemberId: string,
): HomeDinosaurState {
  if (isQuietHours(state)) return "sleeping";

  const canThank = state.quests.some(
    (quest) =>
      quest.state === "pending_endorsement"
      && !quest.participantIds.includes(activeMemberId),
  );
  if (canThank) return "carrying-energy";

  const active = state.quests.filter((quest) => quest.state === "active");
  if (active.some((quest) => quest.participantIds.length > 1)) return "celebrating";
  if (active.length) return "encouraging";

  const urgent = state.quests.some(
    (quest) =>
      !["completed", "cancelled"].includes(quest.state)
      && quest.urgency === 2,
  );
  return urgent ? "curious" : "resting";
}

export function dinosaurStateForQuest(quest: DailyQuest): HomeDinosaurState {
  if (quest.state === "pending_endorsement") return "carrying-energy";
  if (quest.state === "completed") return "gratitude";
  if (quest.state === "active") return quest.participantIds.length > 1 ? "celebrating" : "encouraging";
  return "curious";
}

