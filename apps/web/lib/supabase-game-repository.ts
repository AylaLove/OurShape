import type { GameState, QuestEndorsement } from "@family-game/domain";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateDailyQuestInput, GameRepository } from "./game-repository";

function requireSnapshot(value: unknown): GameState {
  if (!value || typeof value !== "object") throw new Error("The household snapshot was empty.");
  const snapshot = value as Partial<GameState>;
  if (!snapshot.household || !Array.isArray(snapshot.quests)) {
    throw new Error("The household snapshot did not match the game contract.");
  }

  const arrayKeys: Array<keyof GameState> = [
    "completions",
    "endorsements",
    "pointLedger",
    "contributionLedger",
    "rewards",
    "redemptions",
    "highFives",
    "history",
  ];
  for (const key of arrayKeys) {
    if (!Array.isArray(snapshot[key])) throw new Error(`The household snapshot is missing ${key}.`);
  }

  return snapshot as GameState;
}

function requestError(context: string, error: { message: string } | null): void {
  if (error) throw new Error(`${context}: ${error.message}`);
}

export class SupabaseGameRepository implements GameRepository {
  constructor(private readonly client: SupabaseClient) {}

  async loadHouseholdSnapshot(householdId: string, activeMemberId: string): Promise<GameState> {
    const { data, error } = await this.client.rpc("household_snapshot", {
      target_household: householdId,
      target_member: activeMemberId,
    });
    requestError("Could not load the household", error);
    return requireSnapshot(data);
  }

  async createDailyQuest(input: CreateDailyQuestInput): Promise<void> {
    const { error } = await this.client.rpc("create_daily_quest", {
      target_household: input.householdId,
      target_title: input.title,
      target_instruction: input.instruction,
      target_scope: input.scope,
      target_category_id: input.categoryId,
      target_effort: input.effort,
      target_appreciation_value: input.appreciationValue,
      target_icon: input.icon,
      target_suggested_member: input.suggestedMemberId,
      request_key: input.idempotencyKey,
    });
    requestError("Could not add the task", error);
  }

  async createRepairMission(householdId: string, targetMemberId: string, title: string, instruction: string): Promise<void> {
    const { error } = await this.client.rpc("create_repair_mission", {
      target_household: householdId,
      target_member: targetMemberId,
      mission_title: title,
      mission_instruction: instruction,
    });
    requestError("Could not create the Repair Mission", error);
  }

  async joinQuest(questId: string, memberId: string, _idempotencyKey: string): Promise<void> {
    const { error } = await this.client.rpc("join_quest", {
      target_quest: questId,
      target_member: memberId,
    });
    requestError("Could not join the quest", error);
  }

  async completeQuest(questId: string, memberId: string, idempotencyKey: string): Promise<void> {
    const { error } = await this.client.rpc("complete_quest", {
      target_quest: questId,
      target_member: memberId,
      request_key: idempotencyKey,
    });
    requestError("Could not mark the quest done", error);
  }

  async endorseCompletion(
    completionId: string,
    endorserId: string,
    response: QuestEndorsement["response"],
    note: string | null,
  ): Promise<void> {
    const { error } = await this.client.rpc("endorse_completion_with_note", {
      target_completion: completionId,
      target_endorser: endorserId,
      target_response: response,
      target_note: note,
    });
    requestError("Could not send thanks", error);
  }

  async redeemReward(rewardId: string, memberId: string, idempotencyKey: string): Promise<void> {
    const { error } = await this.client.rpc("redeem_reward", {
      target_reward: rewardId,
      target_member: memberId,
      request_key: idempotencyKey,
    });
    requestError("Could not request the reward", error);
  }

  async sendHighFive(fromMemberId: string, toMemberId: string, questId?: string): Promise<void> {
    const { error } = await this.client.rpc("send_high_five", {
      target_from: fromMemberId,
      target_to: toMemberId,
      target_quest: questId ?? null,
    });
    requestError("Could not send the high five", error);
  }
}
