import type { DailyQuest, GameState, HouseholdMember } from "@family-game/domain";
import { Hand, Heart, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { HomeDinosaur } from "@/features/companion/HomeDinosaur";
import { groupWaitingQuests } from "./gratitude-presentation";

export function GratitudeView({
  state,
  activeMember,
  homeEnergy,
  onSelectQuest,
}: {
  state: GameState;
  activeMember: HouseholdMember;
  homeEnergy: number;
  onSelectQuest: (quest: DailyQuest) => void;
}) {
  const { needsYourThanks, waitingForSomeoneElse } = groupWaitingQuests(state.quests, activeMember.id);
  const waitingCount = needsYourThanks.length + waitingForSomeoneElse.length;
  const recentThanks = state.history.filter((event) => event.type === "thanked").slice(0, 4);

  return (
    <section className="view-section" aria-labelledby="thanks-title">
      <header className="view-heading">
        <span className="view-heading__icon"><Heart size={25} /></span>
        <div><p className="eyebrow">GRATITUDE</p><h1 id="thanks-title">See what was done</h1></div>
      </header>

      <div className="gratitude-hero">
        <HomeDinosaur state={waitingCount ? "carrying-energy" : "gratitude"} size="medium" />
        <div>
          <p className="eyebrow">HOME ENERGY · {homeEnergy}</p>
          <h2>{needsYourThanks.length ? "Someone needs your thanks" : waitingForSomeoneElse.length ? "Your help is waiting to be noticed" : "Everyone has been noticed"}</h2>
          <p className="gratitude-hero__rule"><Hand size={16} /> Thanks confirms the help and awards High Fives.</p>
        </div>
      </div>

      <div className="subsection-heading"><h2>Needs your thanks</h2><span>{needsYourThanks.length}</span></div>
      {needsYourThanks.length ? (
        <div className="gratitude-list">
          {needsYourThanks.map((quest) => {
            const helpers = state.household.members.filter((member) => quest.participantIds.includes(member.id));
            return (
              <button className="gratitude-row" type="button" key={quest.id} onClick={() => onSelectQuest(quest)}>
                <span className="gratitude-row__people">
                  {helpers.map((member) => <span className="mini-avatar" style={{ "--member-colour": member.colour } as CSSProperties} key={member.id}>{member.initials}</span>)}
                </span>
                <span><strong>{quest.title}</strong><small>I saw it – send thanks</small></span>
                <Heart size={20} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      ) : <p className="empty-message">You have nothing to confirm right now.</p>}

      {waitingForSomeoneElse.length ? (
        <>
          <div className="subsection-heading"><h2>Waiting for someone else</h2><span>{waitingForSomeoneElse.length}</span></div>
          <div className="gratitude-list gratitude-list--waiting">
            {waitingForSomeoneElse.map((quest) => (
              <div className="gratitude-row gratitude-row--waiting" key={quest.id}>
                <span className="gratitude-row__people"><Sparkles size={18} /></span>
                <span><strong>{quest.title}</strong><small>Your effort is safe. Another person will send thanks.</small></span>
                <Heart size={20} aria-hidden="true" />
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div className="subsection-heading"><h2>Recently appreciated</h2></div>
      <div className="history-lines">
        {recentThanks.length ? recentThanks.map((event) => <p key={event.id}><Heart size={16} />{event.message}</p>) : <p>No thanks recorded yet today.</p>}
      </div>
    </section>
  );
}
