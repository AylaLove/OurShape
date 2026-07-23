import { contributionBalance, type GameState, type HouseholdMember } from "@family-game/domain";
import { CalendarCheck, CircleCheck, Moon, Scale, ShieldCheck } from "lucide-react";
import type { CSSProperties } from "react";

export function FamilyView({ state, activeMember }: { state: GameState; activeMember: HouseholdMember }) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const balances = contributionBalance(state, since);
  const completed = state.quests.filter((quest) => quest.state === "completed").length;
  const unfinished = state.quests.filter((quest) => ["needed", "active", "pending_endorsement"].includes(quest.state)).length;
  const childView = activeMember.role === "child";

  return (
    <section className="view-section" aria-labelledby="family-title">
      <header className="view-heading">
        <span className="view-heading__icon view-heading__icon--blue"><CalendarCheck size={25} /></span>
        <div><p className="eyebrow">EVENING REVIEW</p><h1 id="family-title">How the home moved</h1></div>
      </header>
      <div className="review-summary">
        <span><CircleCheck size={21} /><strong>{completed}</strong> appreciated</span>
        <span><Moon size={21} /><strong>{unfinished}</strong> to carry gently</span>
      </div>

      {childView ? (
        <div className="child-balance"><ShieldCheck size={27} /><div><h2>Our team is taking care of home</h2><p>Every helpful action makes the shape stronger. No one has to do the same amount.</p></div></div>
      ) : (
        <>
          <div className="subsection-heading"><h2>Seven-day capacity view</h2><Scale size={19} /></div>
          <div className="capacity-list">
            {balances.map((balance) => {
              const member = state.household.members.find((candidate) => candidate.id === balance.memberId)!;
              return (
                <div className="capacity-row" key={member.id}>
                  <span className="capacity-row__avatar" style={{ "--member-colour": member.colour } as CSSProperties}>{member.initials}</span>
                  <div><strong>{member.displayName}</strong><span>{balance.units.toFixed(1)} of {balance.target} agreed units</span></div>
                  <meter min="0" max="1.2" value={Math.min(balance.ratio, 1.2)} aria-label={`${member.displayName} contribution against agreed capacity`} />
                </div>
              );
            })}
          </div>
          <p className="privacy-note">This view compares each person with their own agreed capacity, not with one another. Targets can change for health, school, work, travel, or custody.</p>
        </>
      )}

      <div className="subsection-heading"><h2>Today&apos;s history</h2></div>
      <ol className="event-log">
        {state.history.slice(0, 8).map((event) => <li key={event.id}><span>{new Date(event.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>{event.message}</li>)}
      </ol>
    </section>
  );
}
