import type {
  EffortSize,
  GameState,
  QuestEndorsement,
  QuestIcon,
  QuestScope,
} from "@family-game/domain";

export interface CreateDailyQuestInput {
  householdId: string;
  title: string;
  instruction: string;
  scope: QuestScope;
  categoryId: string | null;
  effort: EffortSize;
  appreciationValue: number;
  icon: QuestIcon;
  suggestedMemberId: string | null;
  idempotencyKey: string;
}

export interface GameRepository {
  loadHouseholdSnapshot(householdId: string, activeMemberId: string): Promise<GameState>;
  createDailyQuest(input: CreateDailyQuestInput): Promise<void>;
  createRepairMission(householdId: string, targetMemberId: string, title: string, instruction: string): Promise<void>;
  joinQuest(questId: string, memberId: string, idempotencyKey: string): Promise<void>;
  completeQuest(questId: string, memberId: string, idempotencyKey: string): Promise<void>;
  endorseCompletion(
    completionId: string,
    endorserId: string,
    response: QuestEndorsement["response"],
    note: string | null,
  ): Promise<void>;
  redeemReward(rewardId: string, memberId: string, idempotencyKey: string): Promise<void>;
  sendHighFive(fromMemberId: string, toMemberId: string, questId?: string): Promise<void>;
}

export const DEMO_DATA_NOTICE = "This session uses resettable demonstration data. It is not shared across phones.";
