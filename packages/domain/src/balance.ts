import type { GameState } from "./types";

export interface MemberBalance {
  memberId: string;
  units: number;
  target: number;
  ratio: number;
  visualRatio: number;
}

export function contributionBalance(state: GameState, since: string): MemberBalance[] {
  return state.household.members.map((member) => {
    const units = state.contributionLedger
      .filter((entry) => entry.memberId === member.id && entry.createdAt >= since)
      .reduce((sum, entry) => sum + entry.units, 0);
    const ratio = member.contributionTarget > 0 ? units / member.contributionTarget : 1;
    return {
      memberId: member.id,
      units,
      target: member.contributionTarget,
      ratio,
      visualRatio: Math.min(1.18, Math.max(0.72, ratio || 0.72)),
    };
  });
}

export function regularPolygonPoints(count: number, radius = 150, centre = 180): Array<{ x: number; y: number }> {
  if (count < 2 || count > 6) throw new Error("Household geometry supports two to six members.");
  if (count === 2) return [{ x: 80, y: centre }, { x: 280, y: centre }];
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
    return { x: centre + Math.cos(angle) * radius, y: centre + Math.sin(angle) * radius };
  });
}

export function balancePolygonPoints(balances: MemberBalance[], radius = 150, centre = 180) {
  const base = regularPolygonPoints(balances.length, radius, centre);
  return base.map((point, index) => ({
    x: centre + (point.x - centre) * balances[index].visualRatio,
    y: centre + (point.y - centre) * balances[index].visualRatio,
  }));
}
