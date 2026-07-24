import { describe, expect, it } from "vitest";
import {
  addRepairMission,
  endorseQuest,
  hasOpenRepairMission,
  joinQuest,
  markQuestDone,
  pointBalance,
  redeemReward,
  regularPolygonPoints,
  type GameState,
} from "..";

function fixture(): GameState {
  const householdId = "home-one";
  return {
    household: {
      id: householdId,
      name: "Test Home",
      timezone: "Africa/Johannesburg",
      quietHoursStart: "20:00",
      quietHoursEnd: "07:00",
      members: [
        { id: "adult-a", householdId, displayName: "Adult A", initials: "A", role: "adult", colour: "#ef6d5b", pointLabel: "Chill Points", contributionTarget: 10 },
        { id: "adult-b", householdId, displayName: "Adult B", initials: "B", role: "adult", colour: "#3c7f9d", pointLabel: "Chill Points", contributionTarget: 10 },
        { id: "child", householdId, displayName: "Child", initials: "C", role: "child", colour: "#e2aa37", pointLabel: "Watch Points", contributionTarget: 4 },
      ],
    },
    quests: [{
      id: "quest-one",
      householdId,
      templateId: "template-one",
      title: "Tidy together",
      instruction: "Tidy.",
      spokenInstruction: "Tidy together.",
      kind: "duo",
      state: "needed",
      effort: "medium",
      appreciationValue: 2,
      contributionValue: 2,
      icon: "home",
      participantIds: [],
      suggestedMemberIds: [],
      dueDate: "2026-07-22",
      urgency: 0,
      completedAt: null,
    }],
    completions: [], endorsements: [], pointLedger: [], contributionLedger: [], rewards: [], redemptions: [], highFives: [], history: [],
  };
}

describe("quest participation and gratitude", () => {
  it("requires another household member to acknowledge the work", () => {
    let state = fixture();
    state = joinQuest(state, "quest-one", "adult-a", "2026-07-22T08:00:00Z").state;
    state = markQuestDone(state, "quest-one", "adult-a", "2026-07-22T08:10:00Z").state;
    const result = endorseQuest(state, "quest-one", "adult-a", "thanked", "2026-07-22T08:11:00Z");
    expect(result.ok).toBe(false);
    expect(result.state.pointLedger).toHaveLength(0);
  });

  it("gives collaborators full appreciation while dividing contribution", () => {
    let state = fixture();
    state = joinQuest(state, "quest-one", "adult-a", "2026-07-22T08:00:00Z").state;
    state = joinQuest(state, "quest-one", "child", "2026-07-22T08:01:00Z").state;
    state = markQuestDone(state, "quest-one", "adult-a", "2026-07-22T08:10:00Z").state;
    const result = endorseQuest(state, "quest-one", "adult-b", "thanked", "2026-07-22T08:11:00Z");
    expect(result.ok).toBe(true);
    expect(pointBalance(result.state, "adult-a")).toBe(2);
    expect(pointBalance(result.state, "child")).toBe(2);
    expect(result.state.contributionLedger.map((entry) => entry.units)).toEqual([1, 1]);
  });

  it("cannot award the same completion twice", () => {
    let state = fixture();
    state = joinQuest(state, "quest-one", "adult-a", "2026-07-22T08:00:00Z").state;
    state = markQuestDone(state, "quest-one", "adult-a", "2026-07-22T08:10:00Z").state;
    state = endorseQuest(state, "quest-one", "adult-b", "thanked", "2026-07-22T08:11:00Z").state;
    const duplicate = endorseQuest(state, "quest-one", "child", "thanked", "2026-07-22T08:12:00Z");
    expect(duplicate.ok).toBe(false);
    expect(duplicate.state.pointLedger).toHaveLength(1);
  });

  it("keeps a short gratitude message with the verified endorsement", () => {
    let state = fixture();
    state = joinQuest(state, "quest-one", "adult-a", "2026-07-22T08:00:00Z").state;
    state = markQuestDone(state, "quest-one", "adult-a", "2026-07-22T08:10:00Z").state;
    const result = endorseQuest(
      state,
      "quest-one",
      "adult-b",
      "thanked",
      "2026-07-22T08:11:00Z",
      "That helped us!",
    );

    expect(result.state.endorsements[0].note).toBe("That helped us!");
    expect(result.state.history[0].message).toContain("That helped us!");
  });
});

describe("household geometry", () => {
  it("supports every planned household size", () => {
    for (let count = 2; count <= 6; count += 1) expect(regularPolygonPoints(count)).toHaveLength(count);
  });
});

describe("reward payments", () => {
  it("deducts the reward cost from the chooser's points", () => {
    const state = fixture();
    state.pointLedger.push({
      id: "points-earned",
      householdId: state.household.id,
      memberId: "child",
      questId: "quest-one",
      amount: 5,
      reason: "quest_endorsed",
      idempotencyKey: "earned:child",
      createdAt: "2026-07-22T08:00:00Z",
    });
    state.rewards.push({
      id: "reward-watch",
      householdId: state.household.id,
      title: "Watch time",
      icon: "screen",
      cost: 3,
      audience: "child",
      requiresConsent: true,
    });

    const result = redeemReward(state, "reward-watch", "child", "2026-07-22T09:00:00Z");

    expect(result.ok).toBe(true);
    expect(pointBalance(result.state, "child")).toBe(2);
    expect(result.state.pointLedger.at(-1)?.amount).toBe(-3);
    expect(result.state.pointLedger.at(-1)?.reason).toBe("reward_redeemed");
    expect(result.state.history[0].message).toContain("Watch time");
  });

  it("does not create a payment when the chooser cannot afford the reward", () => {
    const state = fixture();
    state.rewards.push({
      id: "reward-outing",
      householdId: state.household.id,
      title: "Choose an outing",
      icon: "outing",
      cost: 8,
      audience: "all",
      requiresConsent: true,
    });

    const result = redeemReward(state, "reward-outing", "child", "2026-07-22T09:00:00Z");

    expect(result.ok).toBe(false);
    expect(pointBalance(result.state, "child")).toBe(0);
    expect(result.state.redemptions).toHaveLength(0);
  });

  it("protects earned points while a Repair Mission temporarily locks rewards", () => {
    let state = fixture();
    state.pointLedger.push({
      id: "points-earned",
      householdId: state.household.id,
      memberId: "child",
      questId: "quest-one",
      amount: 5,
      reason: "quest_endorsed",
      idempotencyKey: "earned:child",
      createdAt: "2026-07-22T08:00:00Z",
    });
    state.rewards.push({
      id: "reward-watch",
      householdId: state.household.id,
      title: "Watch time",
      icon: "screen",
      cost: 3,
      audience: "child",
      requiresConsent: true,
    });
    state = addRepairMission(
      state,
      {
        targetMemberId: "child",
        title: "Put the game pieces back",
        instruction: "Return every piece, then ask someone to check.",
      },
      "adult-a",
      "2026-07-22T09:00:00Z",
    ).state;

    const result = redeemReward(state, "reward-watch", "child", "2026-07-22T09:01:00Z");

    expect(result.ok).toBe(false);
    expect(hasOpenRepairMission(result.state, "child")).toBe(true);
    expect(pointBalance(result.state, "child")).toBe(5);
    expect(result.state.redemptions).toHaveLength(0);
  });

  it("does not let another household member take over somebody's Repair Mission", () => {
    let state = fixture();
    state = addRepairMission(
      state,
      {
        targetMemberId: "child",
        title: "Put the game pieces back",
        instruction: "Return every piece, then ask someone to check.",
      },
      "adult-a",
      "2026-07-22T09:00:00Z",
    ).state;
    const repairId = state.quests.at(-1)!.id;

    expect(joinQuest(state, repairId, "adult-b", "2026-07-22T09:01:00Z").ok).toBe(false);
    expect(joinQuest(state, repairId, "child", "2026-07-22T09:01:00Z").ok).toBe(true);
  });

  it("unlocks rewards after another family member accepts the repair without awarding points", () => {
    let state = fixture();
    state.pointLedger.push({
      id: "points-earned",
      householdId: state.household.id,
      memberId: "child",
      questId: "quest-one",
      amount: 5,
      reason: "quest_endorsed",
      idempotencyKey: "earned:child",
      createdAt: "2026-07-22T08:00:00Z",
    });
    state.rewards.push({
      id: "reward-watch",
      householdId: state.household.id,
      title: "Watch time",
      icon: "screen",
      cost: 3,
      audience: "child",
      requiresConsent: true,
    });
    state = addRepairMission(
      state,
      {
        targetMemberId: "child",
        title: "Put the game pieces back",
        instruction: "Return every piece, then ask someone to check.",
      },
      "adult-a",
      "2026-07-22T09:00:00Z",
    ).state;
    const repairId = state.quests.at(-1)!.id;
    state = joinQuest(state, repairId, "child", "2026-07-22T09:01:00Z").state;
    state = markQuestDone(state, repairId, "child", "2026-07-22T09:02:00Z").state;
    state = endorseQuest(state, repairId, "adult-b", "thanked", "2026-07-22T09:03:00Z").state;

    expect(hasOpenRepairMission(state, "child")).toBe(false);
    expect(pointBalance(state, "child")).toBe(5);
    expect(state.contributionLedger).toHaveLength(0);
    expect(state.history[0].type).toBe("repair_completed");

    const redemption = redeemReward(state, "reward-watch", "child", "2026-07-22T09:04:00Z");
    expect(redemption.ok).toBe(true);
    expect(pointBalance(redemption.state, "child")).toBe(2);
  });
});
