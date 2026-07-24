"use client";

import { balancePolygonPoints, regularPolygonPoints, type DailyQuest, type Household, type HouseholdMember, type MemberBalance } from "@family-game/domain";
import { Film, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { HomeDinosaur } from "@/features/companion/HomeDinosaur";
import { dinosaurMessage, type HomeDinosaurState } from "@/features/companion/companion-state";
import { homeGoalProgress, type HomeGoal } from "@/features/energy/home-goal";

export function HouseholdShape({
  household,
  quests,
  balances,
  activeMember,
  dinosaurState,
  homeEnergy,
  homeGoal,
  childView = false,
}: {
  household: Household;
  quests: DailyQuest[];
  balances: MemberBalance[];
  activeMember: HouseholdMember;
  dinosaurState: HomeDinosaurState;
  homeEnergy: number;
  homeGoal: HomeGoal;
  childView?: boolean;
}) {
  const [dinosaurSpeaking, setDinosaurSpeaking] = useState(false);
  const basePoints = regularPolygonPoints(household.members.length);
  const livePoints = balancePolygonPoints(balances);
  const pendingEnergy = quests.filter((quest) => quest.state === "pending_endorsement").length;
  const goalProgress = homeGoalProgress(homeGoal, homeEnergy);
  const path = livePoints.map((point) => `${point.x},${point.y}`).join(" ");
  const basePath = basePoints.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <section className={childView ? "shape shape--child" : "shape"} aria-labelledby="shape-title">
      <div className="shape__heading">
        <div>
          <p className="eyebrow">{childView ? "OUR HOME" : "OUR SHAPE"}</p>
          <h2 id="shape-title">{childView ? "Growing together" : "Our home today"}</h2>
        </div>
        {childView ? (
          <div className={goalProgress.unlocked ? "shape__energy-goal shape__energy-goal--unlocked" : "shape__energy-goal"} aria-label={`${goalProgress.current} of ${goalProgress.target} Home Energy toward ${homeGoal.title}`}>
            <div className="shape__energy-goal-top">
              <span><Sparkles size={13} aria-hidden="true" /> Home Energy</span>
              <strong>{goalProgress.current}/{goalProgress.target}</strong>
            </div>
            <span className="shape__energy-track" aria-hidden="true"><i style={{ width: `${goalProgress.percentage}%` }} /></span>
            <span className="shape__energy-reward"><Film size={13} aria-hidden="true" /> {goalProgress.unlocked ? "Movie night unlocked" : homeGoal.title}</span>
          </div>
        ) : <span className="shape__status"><Sparkles size={13} /> {homeEnergy} Home Energy</span>}
      </div>

      <div className="shape__stage">
        <div
          className="shape__home-glow"
          style={{ opacity: Math.min(0.08 + (homeEnergy * 0.1), 0.58) }}
          aria-hidden="true"
        />
        <svg className="shape__lines" viewBox="0 0 360 360" role="img" aria-label={`${household.members.length}-person household shape`}>
          <polygon points={basePath} className="shape__guide" />
          <polygon points={path} className="shape__live" />
          {livePoints.map((point, index) => <line className="shape__spoke" x1="180" y1="180" x2={point.x} y2={point.y} key={household.members[index].id} />)}
        </svg>

        {household.members.map((member, index) => {
          const point = basePoints[index];
          const selected = member.id === activeMember.id;
          return (
            <div
              className={selected ? "shape-member shape-member--active" : "shape-member"}
              style={{ "--member-colour": member.colour, left: `${(point.x / 360) * 100}%`, top: `${(point.y / 360) * 100}%` } as CSSProperties}
              key={member.id}
            >
              <span className="shape-member__avatar">{member.initials}</span>
              <span>{member.displayName}</span>
            </div>
          );
        })}

        <div className="shape__companion">
          {childView ? (
            <button
              className="shape__companion-button"
              type="button"
              aria-label="Ask the Home Dinosaur"
              aria-expanded={dinosaurSpeaking}
              onClick={() => setDinosaurSpeaking((speaking) => !speaking)}
            >
              <HomeDinosaur state={dinosaurState} size="large" priority />
            </button>
          ) : <HomeDinosaur state={dinosaurState} size="medium" priority />}
          {pendingEnergy ? (
            <span className="shape__pending-energy" role="status" aria-label={`${pendingEnergy} completed quest${pendingEnergy === 1 ? "" : "s"} waiting for thanks`}>
              <Sparkles size={21} aria-hidden="true" />
              {pendingEnergy > 1 ? <b>{pendingEnergy}</b> : null}
            </span>
          ) : null}
        </div>
      </div>
      <p className={dinosaurSpeaking ? "shape__caption shape__caption--speaking" : "shape__caption"} aria-live="polite">
        {childView
          ? dinosaurSpeaking
            ? dinosaurMessage(dinosaurState, pendingEnergy)
            : "Tap Dino to hear how our home is feeling."
          : "Only verified help creates Home Energy. The shape compares contribution with each person’s agreed capacity."}
      </p>
    </section>
  );
}
