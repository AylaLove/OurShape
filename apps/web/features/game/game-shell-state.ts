import {
  questHomeEnergyValue,
  type DailyQuest,
  type GameState,
} from "@family-game/domain";
import type { GratitudeMomentData } from "@/features/gratitude/GratitudeMoment";
import type { HouseholdIdentityInput } from "@/features/households/HouseholdIdentitySheet";

export function withHouseholdIdentity(
  state: GameState,
  input: HouseholdIdentityInput,
): GameState {
  return {
    ...state,
    household: {
      ...state.household,
      name: input.name,
      motto: input.motto,
      members: state.household.members.map((member) => ({
        ...member,
        symbol: input.symbols[member.id] ?? member.symbol,
      })),
    },
  };
}

export function gratitudeMomentForQuest(
  state: GameState,
  quest: DailyQuest,
): GratitudeMomentData {
  const helpers = state.household.members.filter((member) => quest.participantIds.includes(member.id));
  const gainedHomeEnergy = questHomeEnergyValue(quest);
  return {
    title: "Effort noticed",
    message: `${helpers.map((member) => member.displayName).join(" + ")} helped with ${quest.title}.`,
    pointsLabel: quest.kind === "repair"
      ? "Repair accepted"
      : `+${quest.appreciationValue} ${helpers[0]?.pointLabel ?? "points"} each`,
    homeEnergyLabel: quest.kind === "repair"
      ? "Treasure reopened"
      : gainedHomeEnergy > 0
        ? `+${gainedHomeEnergy} Home Energy`
        : undefined,
  };
}
