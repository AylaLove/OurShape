import type { GameState, QuestEndorsement } from "@family-game/domain";

export interface GameRepository {
  loadHouseholdSnapshot(householdId: string): Promise<GameState>;
  joinQuest(questId: string, memberId: string, idempotencyKey: string): Promise<void>;
  completeQuest(questId: string, memberId: string, idempotencyKey: string): Promise<void>;
  endorseCompletion(completionId: string, endorserId: string, response: QuestEndorsement["response"]): Promise<void>;
}

export const DEMO_DATA_NOTICE = "This session uses resettable demonstration data. It is not shared across phones.";
