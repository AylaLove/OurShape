import { pointBalance, type GameState, type HouseholdMember } from "@family-game/domain";
import { Armchair, Gift, IceCreamBowl, MonitorPlay, PartyPopper, Utensils } from "lucide-react";

const REWARD_ICONS = { screen: MonitorPlay, treat: IceCreamBowl, choice: Utensils, quiet: Armchair, outing: PartyPopper };

export function RewardsView({ state, activeMember, onRedeem }: { state: GameState; activeMember: HouseholdMember; onRedeem: (rewardId: string) => void }) {
  const balance = pointBalance(state, activeMember.id);
  const visible = state.rewards.filter((reward) => reward.audience === "all" || reward.audience === activeMember.role);
  return (
    <section className="view-section" aria-labelledby="rewards-title">
      <header className="view-heading">
        <span className="view-heading__icon view-heading__icon--gold"><Gift size={25} /></span>
        <div><p className="eyebrow">REWARDS</p><h1 id="rewards-title">Choose something good</h1></div>
      </header>
      <div className="points-balance"><strong>{balance}</strong><span>{activeMember.pointLabel}</span></div>
      <p className="view-intro">Points celebrate participation. Person-provided rewards become requests, so everyone can freely say yes.</p>
      <div className="reward-grid">
        {visible.map((reward) => {
          const Icon = REWARD_ICONS[reward.icon];
          const affordable = balance >= reward.cost;
          return (
            <button className="reward" type="button" key={reward.id} onClick={() => onRedeem(reward.id)} disabled={!affordable}>
              <Icon size={28} strokeWidth={1.7} />
              <strong>{reward.title}</strong>
              <span>Spend {reward.cost} points</span>
            </button>
          );
        })}
      </div>
      {activeMember.role === "adult" ? <p className="privacy-note">Adult-only choices remain private. Intimacy is not a reward or debt in this game.</p> : null}
    </section>
  );
}
