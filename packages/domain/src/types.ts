export type HouseholdRole = "adult" | "child";
export type MemberSymbol = "sun" | "moon" | "star" | "leaf" | "flame" | "mountain";

export type QuestKind =
  | "personal"
  | "open"
  | "duo"
  | "family"
  | "care"
  | "surprise_help"
  | "big"
  | "rescue"
  | "repair";

export type QuestState =
  | "needed"
  | "active"
  | "pending_endorsement"
  | "completed"
  | "carried"
  | "rescheduled"
  | "cancelled";

export type EffortSize = "light" | "medium" | "substantial" | "major";
export type QuestIcon = "dishes" | "laundry" | "book" | "plant" | "home" | "wood" | "sparkle" | "repair";
export type QuestScope = "home" | "personal";
export type RecurrenceRule =
  | { type: "daily" }
  | { type: "selected_days"; weekdays: number[] }
  | { type: "every_n_days"; interval: number; anchorDate: string }
  | { type: "monthly"; dayOfMonth: number }
  | { type: "when_needed" };

export interface HouseholdMember {
  id: string;
  householdId: string;
  displayName: string;
  initials: string;
  role: HouseholdRole;
  colour: string;
  pointLabel: string;
  contributionTarget: number;
  symbol?: MemberSymbol;
}

export interface Household {
  id: string;
  name: string;
  timezone: string;
  quietHoursStart: string;
  quietHoursEnd: string;
  motto?: string;
  members: HouseholdMember[];
}

export interface QuestCategory {
  id: string;
  householdId: string;
  name: string;
  scope: QuestScope;
  icon: QuestIcon;
  sortOrder: number;
  active: boolean;
}

export interface DailyQuest {
  id: string;
  householdId: string;
  templateId: string | null;
  title: string;
  instruction: string;
  spokenInstruction: string;
  kind: QuestKind;
  state: QuestState;
  effort: EffortSize;
  appreciationValue: number;
  contributionValue: number;
  icon: QuestIcon;
  participantIds: string[];
  suggestedMemberIds: string[];
  dueDate: string;
  urgency: 0 | 1 | 2;
  completedAt: string | null;
  scope?: QuestScope;
  categoryId?: string | null;
  homeEnergyValue?: number;
}

export interface QuestTemplate {
  id: string;
  householdId: string;
  title: string;
  instruction: string;
  spokenInstruction: string;
  kind: QuestKind;
  effort: EffortSize;
  appreciationValue: number;
  contributionValue: number;
  icon: QuestIcon;
  recurrence: RecurrenceRule;
  suggestedMemberIds: string[];
  active: boolean;
  scope?: QuestScope;
  categoryId?: string | null;
  homeEnergyValue?: number;
}

export interface QuestCompletion {
  id: string;
  householdId: string;
  questId: string;
  markedById: string;
  participantIds: string[];
  createdAt: string;
}

export interface QuestEndorsement {
  id: string;
  householdId: string;
  questId: string;
  completionId: string;
  endorserId: string;
  response: "thanked" | "needs_a_little_more";
  note: string | null;
  createdAt: string;
}

export interface PointLedgerEntry {
  id: string;
  householdId: string;
  memberId: string;
  questId: string | null;
  amount: number;
  reason: "quest_endorsed" | "kindness" | "reward_redeemed" | "correction";
  idempotencyKey: string;
  createdAt: string;
}

export interface ContributionRecord {
  id: string;
  householdId: string;
  memberId: string;
  questId: string;
  units: number;
  idempotencyKey: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  householdId: string;
  title: string;
  icon: "screen" | "treat" | "choice" | "quiet" | "outing";
  cost: number;
  audience: "child" | "adult" | "all";
  requiresConsent: boolean;
}

export interface RewardRedemption {
  id: string;
  householdId: string;
  rewardId: string;
  memberId: string;
  status: "requested" | "accepted" | "declined" | "fulfilled";
  createdAt: string;
}

export interface HighFive {
  id: string;
  householdId: string;
  fromMemberId: string;
  toMemberId: string;
  questId: string | null;
  createdAt: string;
}

export type DailyCapacity = "rest" | "gentle" | "steady" | "plenty";
export type CapacityContext = "private" | "cycle_support" | "menstrual_support" | "luteal_support";

export interface DailyPlan {
  id: string;
  householdId: string;
  memberId: string;
  date: string;
  capacity: DailyCapacity;
  capacityContext: CapacityContext;
  intentionQuestIds: string[];
  updatedAt: string;
}

export interface HistoryEvent {
  id: string;
  householdId: string;
  type:
    | "added"
    | "joined"
    | "marked_done"
    | "thanked"
    | "needs_more"
    | "reward_requested"
    | "high_five"
    | "repair_created"
    | "repair_completed";
  actorId: string;
  questId: string | null;
  message: string;
  createdAt: string;
}

export interface GameState {
  household: Household;
  questCategories?: QuestCategory[];
  quests: DailyQuest[];
  completions: QuestCompletion[];
  endorsements: QuestEndorsement[];
  pointLedger: PointLedgerEntry[];
  contributionLedger: ContributionRecord[];
  rewards: Reward[];
  redemptions: RewardRedemption[];
  highFives: HighFive[];
  dailyPlans?: DailyPlan[];
  history: HistoryEvent[];
}

export interface DomainResult {
  state: GameState;
  ok: boolean;
  message: string;
}

export const APPRECIATION_BY_EFFORT: Record<EffortSize, number> = {
  light: 1,
  medium: 2,
  substantial: 4,
  major: 6,
};
