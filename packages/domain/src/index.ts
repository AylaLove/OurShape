export type HouseholdRole = "adult" | "child";

export type QuestKind =
  | "personal"
  | "open"
  | "duo"
  | "family"
  | "care"
  | "surprise_help"
  | "big"
  | "rescue";

export type QuestState =
  | "needed"
  | "active"
  | "pending_endorsement"
  | "completed"
  | "carried"
  | "rescheduled"
  | "cancelled";

export type EffortSize = "light" | "medium" | "substantial" | "major";

export interface HouseholdMember {
  id: string;
  householdId: string;
  displayName: string;
  initials: string;
  role: HouseholdRole;
  colour: string;
}

export interface Household {
  id: string;
  name: string;
  timezone: string;
  members: HouseholdMember[];
}

export interface DailyQuest {
  id: string;
  householdId: string;
  title: string;
  kind: QuestKind;
  state: QuestState;
  effort: EffortSize;
  appreciationValue: number;
  icon: "dishes" | "laundry" | "book" | "plant" | "home";
  participantIds: string[];
}

export interface QuestEndorsement {
  id: string;
  householdId: string;
  questId: string;
  endorserId: string;
  response: "thanked" | "needs_a_little_more";
  createdAt: string;
}

export interface PointLedgerEntry {
  id: string;
  householdId: string;
  memberId: string;
  questId: string | null;
  amount: number;
  reason: "quest_endorsed" | "kindness" | "reward_redeemed" | "correction";
  createdAt: string;
}

export const APPRECIATION_BY_EFFORT: Record<EffortSize, number> = {
  light: 1,
  medium: 2,
  substantial: 4,
  major: 6,
};

