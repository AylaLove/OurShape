import type {
  DailyQuest,
  DomainResult,
  GameState,
  HistoryEvent,
  PointLedgerEntry,
  QuestCompletion,
  QuestEndorsement,
  RewardRedemption,
} from "./types";

function id(prefix: string, parts: string[]) {
  return `${prefix}-${parts.join("-")}`;
}

function appendHistory(state: GameState, event: HistoryEvent): GameState {
  return { ...state, history: [event, ...state.history] };
}

function replaceQuest(state: GameState, replacement: DailyQuest): GameState {
  return { ...state, quests: state.quests.map((quest) => (quest.id === replacement.id ? replacement : quest)) };
}

function failure(state: GameState, message: string): DomainResult {
  return { state, ok: false, message };
}

export function addQuickQuest(state: GameState, quest: Omit<DailyQuest, "id" | "householdId" | "templateId" | "state" | "participantIds" | "dueDate" | "urgency" | "completedAt">, actorId: string, now: string): DomainResult {
  const actor = state.household.members.find((member) => member.id === actorId);
  if (!actor || actor.role !== "adult") return failure(state, "An adult can add today’s household needs.");
  const date = now.slice(0, 10);
  const created: DailyQuest = {
    ...quest,
    id: id("quick", [date, String(state.quests.length + 1)]),
    householdId: state.household.id,
    templateId: null,
    state: "needed",
    participantIds: [],
    dueDate: date,
    urgency: 0,
    completedAt: null,
  };
  const next = appendHistory({ ...state, quests: [...state.quests, created] }, {
    id: id("history-added", [created.id]),
    householdId: state.household.id,
    type: "added",
    actorId,
    questId: created.id,
    message: `${actor.displayName} added ${created.title} for today.`,
    createdAt: now,
  });
  return { state: next, ok: true, message: `${created.title} joined today’s shape.` };
}

export function joinQuest(state: GameState, questId: string, memberId: string, now: string): DomainResult {
  const quest = state.quests.find((candidate) => candidate.id === questId);
  const member = state.household.members.find((candidate) => candidate.id === memberId);
  if (!quest || !member || quest.householdId !== member.householdId) return failure(state, "That quest is not available here.");
  if (!["needed", "active"].includes(quest.state)) return failure(state, "This quest is no longer open to join.");
  if (quest.participantIds.includes(memberId)) return failure(state, `${member.displayName} already joined.`);

  const nextQuest = { ...quest, state: "active" as const, participantIds: [...quest.participantIds, memberId] };
  const next = appendHistory(replaceQuest(state, nextQuest), {
    id: id("history-join", [questId, memberId]),
    householdId: quest.householdId,
    type: "joined",
    actorId: memberId,
    questId,
    message: `${member.displayName} joined ${quest.title}.`,
    createdAt: now,
  });
  return { state: next, ok: true, message: `${member.displayName} joined in.` };
}

export function markQuestDone(state: GameState, questId: string, memberId: string, now: string): DomainResult {
  const quest = state.quests.find((candidate) => candidate.id === questId);
  if (!quest) return failure(state, "That quest could not be found.");
  if (!["needed", "active"].includes(quest.state)) return failure(state, "This quest cannot be marked done now.");

  const participantIds = quest.participantIds.length ? quest.participantIds : [memberId];
  if (!participantIds.includes(memberId)) return failure(state, "Join this quest before marking it done.");

  const completion: QuestCompletion = {
    id: id("completion", [questId, now]),
    householdId: quest.householdId,
    questId,
    markedById: memberId,
    participantIds,
    createdAt: now,
  };
  const nextQuest = { ...quest, state: "pending_endorsement" as const, participantIds };
  let next: GameState = {
    ...replaceQuest(state, nextQuest),
    completions: [...state.completions, completion],
  };
  next = appendHistory(next, {
    id: id("history-done", [completion.id]),
    householdId: quest.householdId,
    type: "marked_done",
    actorId: memberId,
    questId,
    message: `${quest.title} is waiting for thanks.`,
    createdAt: now,
  });
  return { state: next, ok: true, message: "Done. Now someone else can send thanks." };
}

export function endorseQuest(
  state: GameState,
  questId: string,
  endorserId: string,
  response: QuestEndorsement["response"],
  now: string,
  note: string | null = null,
): DomainResult {
  const quest = state.quests.find((candidate) => candidate.id === questId);
  const endorser = state.household.members.find((candidate) => candidate.id === endorserId);
  const completion = [...state.completions].reverse().find((candidate) => candidate.questId === questId);
  if (!quest || !endorser || !completion) return failure(state, "This completion is not ready for thanks.");
  if (quest.state !== "pending_endorsement") return failure(state, "Thanks have already been recorded.");
  if (completion.participantIds.includes(endorserId)) return failure(state, "A participant cannot thank their own completion.");

  const key = `endorsement:${completion.id}`;
  if (state.endorsements.some((entry) => entry.completionId === completion.id)) {
    return failure(state, "This completion has already been acknowledged.");
  }

  const endorsement: QuestEndorsement = {
    id: id("endorsement", [completion.id, endorserId]),
    householdId: quest.householdId,
    questId,
    completionId: completion.id,
    endorserId,
    response,
    note: note?.trim().slice(0, 120) || null,
    createdAt: now,
  };

  if (response === "needs_a_little_more") {
    let next = replaceQuest(state, { ...quest, state: "active" });
    next = { ...next, endorsements: [...next.endorsements, endorsement] };
    next = appendHistory(next, {
      id: id("history-more", [completion.id]),
      householdId: quest.householdId,
      type: "needs_more",
      actorId: endorserId,
      questId,
      message: `${quest.title} needs one small finishing touch.`,
      createdAt: now,
    });
    return { state: next, ok: true, message: "Kindly sent back for one finishing touch." };
  }

  const splitUnits = quest.contributionValue / completion.participantIds.length;
  const pointEntries: PointLedgerEntry[] = completion.participantIds.map((memberId) => ({
    id: id("points", [completion.id, memberId]),
    householdId: quest.householdId,
    memberId,
    questId,
    amount: quest.appreciationValue,
    reason: "quest_endorsed",
    idempotencyKey: `${key}:points:${memberId}`,
    createdAt: now,
  }));
  const contributionEntries = completion.participantIds.map((memberId) => ({
    id: id("contribution", [completion.id, memberId]),
    householdId: quest.householdId,
    memberId,
    questId,
    units: splitUnits,
    idempotencyKey: `${key}:contribution:${memberId}`,
    createdAt: now,
  }));

  let next: GameState = {
    ...replaceQuest(state, { ...quest, state: "completed", completedAt: now }),
    endorsements: [...state.endorsements, endorsement],
    pointLedger: [...state.pointLedger, ...pointEntries],
    contributionLedger: [...state.contributionLedger, ...contributionEntries],
  };
  next = appendHistory(next, {
    id: id("history-thanks", [completion.id]),
    householdId: quest.householdId,
    type: "thanked",
    actorId: endorserId,
    questId,
    message: note?.trim()
      ? `${endorser.displayName} thanked ${quest.title}: “${note.trim().slice(0, 120)}”`
      : `${endorser.displayName} sent thanks for ${quest.title}.`,
    createdAt: now,
  });
  return { state: next, ok: true, message: "Thanks sent. Everyone who helped earned the full reward." };
}

export function pointBalance(state: GameState, memberId: string): number {
  return state.pointLedger.filter((entry) => entry.memberId === memberId).reduce((sum, entry) => sum + entry.amount, 0);
}

export function redeemReward(state: GameState, rewardId: string, memberId: string, now: string): DomainResult {
  const reward = state.rewards.find((candidate) => candidate.id === rewardId);
  const member = state.household.members.find((candidate) => candidate.id === memberId);
  if (!reward || !member) return failure(state, "That reward is not available.");
  if (reward.audience !== "all" && reward.audience !== member.role) return failure(state, "That reward belongs to another profile.");
  if (pointBalance(state, memberId) < reward.cost) return failure(state, `You need ${reward.cost - pointBalance(state, memberId)} more points.`);

  const redemption: RewardRedemption = {
    id: id("redemption", [rewardId, memberId, now]),
    householdId: state.household.id,
    rewardId,
    memberId,
    status: reward.requiresConsent ? "requested" : "accepted",
    createdAt: now,
  };
  const pointEntry: PointLedgerEntry = {
    id: id("points-reward", [redemption.id]),
    householdId: state.household.id,
    memberId,
    questId: null,
    amount: -reward.cost,
    reason: "reward_redeemed",
    idempotencyKey: `reward:${redemption.id}`,
    createdAt: now,
  };
  let next = { ...state, redemptions: [...state.redemptions, redemption], pointLedger: [...state.pointLedger, pointEntry] };
  next = appendHistory(next, {
    id: id("history-reward", [redemption.id]),
    householdId: state.household.id,
    type: "reward_requested",
    actorId: memberId,
    questId: null,
    message: `${member.displayName} chose ${reward.title}.`,
    createdAt: now,
  });
  return { state: next, ok: true, message: reward.requiresConsent ? "Request sent for a family yes." : "Reward ready." };
}

export function sendHighFive(state: GameState, fromMemberId: string, toMemberId: string, now: string): DomainResult {
  const from = state.household.members.find((member) => member.id === fromMemberId);
  const to = state.household.members.find((member) => member.id === toMemberId);
  if (!from || !to || from.householdId !== to.householdId) return failure(state, "That high five could not be sent.");
  if (fromMemberId === toMemberId) return failure(state, "Choose someone else to high five.");
  const highFive = {
    id: id("high-five", [fromMemberId, toMemberId, now]),
    householdId: state.household.id,
    fromMemberId,
    toMemberId,
    questId: null,
    createdAt: now,
  };
  let next: GameState = { ...state, highFives: [...state.highFives, highFive] };
  next = appendHistory(next, {
    id: id("history-five", [highFive.id]),
    householdId: state.household.id,
    type: "high_five",
    actorId: fromMemberId,
    questId: null,
    message: `${from.displayName} high-fived ${to.displayName}.`,
    createdAt: now,
  });
  return { state: next, ok: true, message: `High five sent to ${to.displayName}!` };
}
