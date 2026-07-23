import type { DailyQuest, GameState, HouseholdMember } from "@family-game/domain";
import { Hand, Heart, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { HomeDinosaur } from "@/features/companion/HomeDinosaur";

export function GratitudeView({
  state,
  activeMember,
  homeEnergy,
  onSelectQuest,
  onHighFive,
}: {
  state: GameState;
  activeMember: HouseholdMember;
  homeEnergy: number;
  onSelectQuest: (quest: DailyQuest) => void;
  onHighFive: (memberId: string) => void;
}) {
  const waiting = state.quests.filter((quest) => quest.state === "pending_endorsement");
  const recentThanks = state.history.filter((event) => event.type === "thanked").slice(0, 4);

  return (
    <section className="view-section" aria-labelledby="thanks-title">
      <header className="view-heading">
        <span className="view-heading__icon"><Heart size={25} /></span>
        <div><p className="eyebrow">GRATITUDE</p><h1 id="thanks-title">See what was done</h1></div>
      </header>

      <div className="gratitude-hero">
        <HomeDinosaur state={waiting.length ? "carrying-energy" : "gratitude"} size="medium" />
        <div>
          <p className="eyebrow">HOME ENERGY · {homeEnergy}</p>
          <h2>{waiting.length ? "Some effort is waiting to be seen" : "The gratitude loop is clear"}</h2>
          <p>Thanks closes the loop. It says, “Your effort mattered here.”</p>
        </div>
      </div>

      <div className="subsection-heading"><h2>Waiting for thanks</h2><span>{waiting.length}</span></div>
      {waiting.length ? (
        <div className="gratitude-list">
          {waiting.map((quest) => {
            const helpers = state.household.members.filter((member) => quest.participantIds.includes(member.id));
            const canThank = !quest.participantIds.includes(activeMember.id);
            return (
              <button className="gratitude-row" type="button" key={quest.id} onClick={() => onSelectQuest(quest)}>
                <span className="gratitude-row__people">
                  {helpers.map((member) => <span className="mini-avatar" style={{ "--member-colour": member.colour } as CSSProperties} key={member.id}>{member.initials}</span>)}
                </span>
                <span><strong>{quest.title}</strong><small>{canThank ? "Tap to send thanks" : "Another person will thank this"}</small></span>
                <Heart size={20} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      ) : <p className="empty-message">Nothing is waiting. The gratitude loop is clear.</p>}

      <div className="subsection-heading"><h2>High five someone</h2></div>
      <div className="high-five-row">
        {state.household.members.filter((member) => member.id !== activeMember.id).map((member) => (
          <button className="high-five-button" type="button" key={member.id} onClick={() => onHighFive(member.id)} style={{ "--member-colour": member.colour } as CSSProperties}>
            <span>{member.initials}</span><Hand size={19} />{member.displayName}
          </button>
        ))}
      </div>

      <div className="subsection-heading"><h2>Recently appreciated</h2></div>
      <div className="history-lines">
        {recentThanks.length ? recentThanks.map((event) => <p key={event.id}><Heart size={16} />{event.message}</p>) : <p>No thanks recorded yet today.</p>}
      </div>
    </section>
  );
}
