import type { DailyQuest, GameState } from "@family-game/domain";

export type HomeDinosaurState =
  | "resting"
  | "curious"
  | "inviting"
  | "ready"
  | "teamwork"
  | "encouraging"
  | "celebrating"
  | "carrying-energy"
  | "sharing-energy"
  | "sleeping"
  | "gratitude"
  | "repairing";

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
  date = new Date(),
): HomeDinosaurState {
  if (isQuietHours(state, date)) return "sleeping";

  const openRepair = state.quests.some(
    (quest) =>
      quest.kind === "repair"
      && !["completed", "cancelled"].includes(quest.state)
      && (quest.suggestedMemberIds.includes(activeMemberId) || quest.participantIds.includes(activeMemberId)),
  );
  if (openRepair) return "repairing";

  const canThank = state.quests.some(
    (quest) =>
      quest.state === "pending_endorsement"
      && !quest.participantIds.includes(activeMemberId),
  );
  if (canThank) return "carrying-energy";

  const active = state.quests.filter((quest) => quest.state === "active");
  const joinedActive = active.find((quest) => quest.participantIds.includes(activeMemberId));
  if (joinedActive?.participantIds.length && joinedActive.participantIds.length > 1) return "teamwork";
  if (joinedActive) return "ready";
  if (active.length) return "encouraging";

  const urgent = state.quests.some(
    (quest) =>
      !["completed", "cancelled"].includes(quest.state)
      && quest.urgency === 2,
  );
  const openNeed = state.quests.some(
    (quest) => ["needed", "carried", "rescheduled"].includes(quest.state),
  );
  if (urgent) return "curious";
  return openNeed ? "inviting" : "resting";
}

export function dinosaurStateForQuest(quest: DailyQuest): HomeDinosaurState {
  if (quest.state === "pending_endorsement") return "carrying-energy";
  if (quest.state === "completed") return "gratitude";
  if (quest.state === "active") return quest.participantIds.length > 1 ? "teamwork" : "ready";
  return "inviting";
}

export function dinosaurMessage(
  state: HomeDinosaurState,
  pendingEnergy = 0,
): string {
  switch (state) {
    case "sleeping":
      return "Quiet time now. Our quests will still be here tomorrow.";
    case "carrying-energy":
      return pendingEnergy === 1
        ? "One finished quest is waiting for thanks. Then its energy comes home."
        : `${pendingEnergy} finished quests are waiting for thanks. Then their energy comes home.`;
    case "sharing-energy":
      return "Thanks turned that help into Home Energy.";
    case "gratitude":
      return "Your help was seen. Thank you.";
    case "celebrating":
      return "Our home is glowing because people helped.";
    case "teamwork":
      return "Working together makes our home glow.";
    case "ready":
      return "You joined in. Mark the quest done when the job is truly finished.";
    case "encouraging":
      return "Someone is already helping. You can join them or choose another quest.";
    case "curious":
      return "Something needs help soon. Choose one small quest.";
    case "inviting":
      return "Choose one quest. Even a small help gives our home energy.";
    case "resting":
      return "Everything is settled. We can enjoy our home.";
    case "repairing":
      return "Something needs repairing. Open Quests, make it right, and ask someone to check.";
  }
}
