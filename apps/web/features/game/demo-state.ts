import type { GameState } from "@family-game/domain";
import { DEMO_HOUSEHOLD } from "@/features/households/demo-household";
import { DEMO_QUESTS } from "@/features/quests/demo-quests";

const TODAY = "2026-07-22T08:00:00.000Z";

export function createDemoState(): GameState {
  return {
    household: DEMO_HOUSEHOLD,
    quests: DEMO_QUESTS.map((quest) => ({ ...quest, participantIds: [...quest.participantIds] })),
    completions: [
      {
        id: "completion-demo-reading",
        householdId: DEMO_HOUSEHOLD.id,
        questId: "demo-reading",
        markedById: "demo-child",
        participantIds: ["demo-child"],
        createdAt: TODAY,
      },
    ],
    endorsements: [],
    pointLedger: [
      {
        id: "points-sage-start",
        householdId: DEMO_HOUSEHOLD.id,
        memberId: "demo-child",
        questId: null,
        amount: 3,
        reason: "kindness",
        idempotencyKey: "seed:sage",
        createdAt: TODAY,
      },
      {
        id: "points-ayla-start",
        householdId: DEMO_HOUSEHOLD.id,
        memberId: "demo-ayla",
        questId: null,
        amount: 4,
        reason: "kindness",
        idempotencyKey: "seed:ayla",
        createdAt: TODAY,
      },
    ],
    contributionLedger: [
      {
        id: "contribution-ayla-start",
        householdId: DEMO_HOUSEHOLD.id,
        memberId: "demo-ayla",
        questId: "seed-week",
        units: 6.5,
        idempotencyKey: "seed:contribution:ayla",
        createdAt: TODAY,
      },
      {
        id: "contribution-raen-start",
        householdId: DEMO_HOUSEHOLD.id,
        memberId: "demo-partner",
        questId: "seed-week",
        units: 5.5,
        idempotencyKey: "seed:contribution:raen",
        createdAt: TODAY,
      },
      {
        id: "contribution-sage-start",
        householdId: DEMO_HOUSEHOLD.id,
        memberId: "demo-child",
        questId: "seed-week",
        units: 2.5,
        idempotencyKey: "seed:contribution:sage",
        createdAt: TODAY,
      },
    ],
    rewards: [
      { id: "reward-watch", householdId: DEMO_HOUSEHOLD.id, title: "20 minutes watch time", icon: "screen", cost: 3, audience: "child", requiresConsent: true },
      { id: "reward-icecream", householdId: DEMO_HOUSEHOLD.id, title: "Ice cream choice", icon: "treat", cost: 5, audience: "child", requiresConsent: true },
      { id: "reward-dinner", householdId: DEMO_HOUSEHOLD.id, title: "Choose family dinner", icon: "choice", cost: 4, audience: "all", requiresConsent: true },
      { id: "reward-quiet", householdId: DEMO_HOUSEHOLD.id, title: "Protected quiet hour", icon: "quiet", cost: 5, audience: "adult", requiresConsent: true },
      { id: "reward-outing", householdId: DEMO_HOUSEHOLD.id, title: "Choose an outing", icon: "outing", cost: 8, audience: "all", requiresConsent: true },
    ],
    redemptions: [],
    highFives: [],
    dailyPlans: [],
    history: [
      { id: "history-reading", householdId: DEMO_HOUSEHOLD.id, type: "marked_done", actorId: "demo-child", questId: "demo-reading", message: "Reading is waiting for thanks.", createdAt: TODAY },
      { id: "history-laundry", householdId: DEMO_HOUSEHOLD.id, type: "joined", actorId: "demo-child", questId: "demo-laundry", message: "Ayla and Sage teamed up for the laundry.", createdAt: TODAY },
    ],
  };
}
