import type { DailyCapacity, DailyPlan, DomainResult, GameState } from "./types";

const CAPACITY_LEVELS: DailyCapacity[] = ["rest", "gentle", "steady", "plenty"];

export function todayPlan(state: GameState, memberId: string, date: string): DailyPlan | null {
  return state.dailyPlans?.find((plan) => plan.memberId === memberId && plan.date === date) ?? null;
}

export function setDailyPlan(
  state: GameState,
  input: Pick<DailyPlan, "capacity" | "capacityContext" | "intentionQuestIds">,
  memberId: string,
  now: string,
): DomainResult {
  const member = state.household.members.find((candidate) => candidate.id === memberId);
  if (!member) return { state, ok: false, message: "That family member could not be found." };
  if (!CAPACITY_LEVELS.includes(input.capacity)) return { state, ok: false, message: "Choose how today feels." };
  if (input.capacityContext === "cycle_support" && member.role !== "adult") {
    return { state, ok: false, message: "Cycle support is an adult-private setting." };
  }

  const intentionQuestIds = [...new Set(input.intentionQuestIds)];
  if (intentionQuestIds.length > 3) return { state, ok: false, message: "Choose no more than three intentions for today." };
  const availableQuestIds = new Set(
    state.quests
      .filter((quest) => !["completed", "cancelled", "pending_endorsement"].includes(quest.state))
      .map((quest) => quest.id),
  );
  if (intentionQuestIds.some((questId) => !availableQuestIds.has(questId))) {
    return { state, ok: false, message: "One of those intentions is no longer available." };
  }

  const date = now.slice(0, 10);
  const plan: DailyPlan = {
    id: `daily-plan-${memberId}-${date}`,
    householdId: state.household.id,
    memberId,
    date,
    capacity: input.capacity,
    capacityContext: input.capacityContext,
    intentionQuestIds,
    updatedAt: now,
  };
  const dailyPlans = [
    ...(state.dailyPlans ?? []).filter((candidate) => !(candidate.memberId === memberId && candidate.date === date)),
    plan,
  ];
  return {
    state: { ...state, dailyPlans },
    ok: true,
    message: intentionQuestIds.length
      ? `${member.displayName}'s capacity and intentions are set for today.`
      : `${member.displayName}'s capacity is set for today.`,
  };
}
