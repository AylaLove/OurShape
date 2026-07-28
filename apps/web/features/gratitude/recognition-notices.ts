import type { DailyQuest, HouseholdMember } from "@family-game/domain";
import type { GratitudeMomentData } from "./GratitudeMoment";

export interface RecognitionNotice {
  memberId: string;
  moment: GratitudeMomentData;
}

export function recognitionNoticesForQuest(
  quest: DailyQuest,
  members: HouseholdMember[],
  endorser: HouseholdMember,
): RecognitionNotice[] {
  return members
    .filter((member) => quest.participantIds.includes(member.id))
    .map((member) => ({
      memberId: member.id,
      moment: quest.kind === "repair"
        ? {
            title: `${endorser.displayName} accepted your repair`,
            message: `${quest.title} is complete. You made things right.`,
            pointsLabel: "Trust restored",
            homeEnergyLabel: "Treasure reopened",
          }
        : {
            title: `${endorser.displayName} noticed your help`,
            message: `${quest.title} helped the home.`,
            pointsLabel: `+${quest.appreciationValue} ${member.pointLabel}`,
            homeEnergyLabel: "+1 Home Energy",
          },
    }));
}
