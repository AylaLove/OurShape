import type { Household, DailyQuest } from "@family-game/domain";
import type { CSSProperties } from "react";

interface HouseholdShapeProps {
  household: Household;
  quests: DailyQuest[];
}

export function HouseholdShape({ household, quests }: HouseholdShapeProps) {
  const [first, second, third] = household.members;
  const familyQuest = quests.find((quest) => quest.kind === "family");
  const duoQuest = quests.find((quest) => quest.kind === "duo");

  return (
    <section className="shape" aria-labelledby="shape-title">
      <div className="shape__heading">
        <div>
          <p className="eyebrow">OUR SHAPE</p>
          <h2 id="shape-title">The home today</h2>
        </div>
        <span className="shape__status">3 need us</span>
      </div>

      <div className="shape__stage">
        <svg className="shape__lines" viewBox="0 0 360 300" role="img" aria-label="Three-person household triangle">
          <path d="M180 34 L48 250 L312 250 Z" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M180 34 L180 174" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 8" />
          <path d="M48 250 L180 174 L312 250" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 8" />
        </svg>

        <div className="member member--top" style={{ "--member-colour": first.colour } as CSSProperties}>
          <span className="member__avatar">{first.initials}</span>
          <span>{first.displayName}</span>
        </div>
        <div className="member member--left" style={{ "--member-colour": second.colour } as CSSProperties}>
          <span className="member__avatar">{second.initials}</span>
          <span>{second.displayName}</span>
        </div>
        <div className="member member--right" style={{ "--member-colour": third.colour } as CSSProperties}>
          <span className="member__avatar">{third.initials}</span>
          <span>{third.displayName}</span>
        </div>

        {duoQuest ? <div className="shape-quest shape-quest--edge">{duoQuest.title}</div> : null}
        {familyQuest ? <div className="shape-quest shape-quest--centre">{familyQuest.title}</div> : null}
      </div>
    </section>
  );
}
