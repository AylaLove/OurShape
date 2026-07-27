import { hasOpenRepairMission, pointBalance, type GameState, type HouseholdMember } from "@family-game/domain";

export interface OpeningCheckInItem {
  id: "points" | "thanks" | "repair" | "treasure";
  label: string;
  value: string;
  destination: "thanks" | "quests" | "rewards" | null;
}

export function openingCheckInItems(state: GameState, member: HouseholdMember): OpeningCheckInItem[] {
  const balance = pointBalance(state, member.id);
  const thanksCount = state.quests.filter(
    (quest) => quest.state === "pending_endorsement" && !quest.participantIds.includes(member.id),
  ).length;
  const repairOpen = hasOpenRepairMission(state, member.id);
  const affordableCount = state.rewards.filter(
    (reward) => (reward.audience === "all" || reward.audience === member.role) && reward.cost <= balance,
  ).length;

  const items: OpeningCheckInItem[] = [{
    id: "points",
    label: member.pointLabel,
    value: String(balance),
    destination: "rewards",
  }];

  if (thanksCount) items.push({
    id: "thanks",
    label: "Needs your thanks",
    value: String(thanksCount),
    destination: "thanks",
  });
  if (repairOpen) items.push({
    id: "repair",
    label: "Repair Mission",
    value: "Ready",
    destination: "quests",
  });
  if (!repairOpen && affordableCount) items.push({
    id: "treasure",
    label: "Treasure ready",
    value: String(affordableCount),
    destination: "rewards",
  });

  return items;
}
