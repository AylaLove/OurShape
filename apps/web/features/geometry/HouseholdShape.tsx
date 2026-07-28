"use client";

import { balancePolygonPoints, regularPolygonPoints, type DailyPlan, type DailyQuest, type Household, type HouseholdMember, type MemberBalance } from "@family-game/domain";
import { Gauge, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { HomeDinosaur } from "@/features/companion/HomeDinosaur";
import { dinosaurMessage, type HomeDinosaurState } from "@/features/companion/companion-state";
import type { HomeGoal } from "@/features/energy/home-goal";
import { moonPhaseForDate } from "@/features/rhythms/moon-phase";

function hexToHsl(hex: string) {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16) / 255;
  const g = Number.parseInt(value.slice(2, 4), 16) / 255;
  const b = Number.parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (!delta) return { hue: 0, saturation: 0, lightness: lightness * 100 };

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = max === r
    ? ((g - b) / delta) % 6
    : max === g
      ? (b - r) / delta + 2
      : (r - g) / delta + 4;

  hue = (hue * 60 + 360) % 360;
  return { hue, saturation: saturation * 100, lightness: lightness * 100 };
}

function relationshipColour(first: string, second: string) {
  const a = hexToHsl(first);
  const b = hexToHsl(second);
  const distance = ((b.hue - a.hue + 540) % 360) - 180;
  const hue = (a.hue + distance / 2 + 360) % 360;
  const saturation = Math.min(82, Math.max(58, (a.saturation + b.saturation) / 2));
  const lightness = Math.min(58, Math.max(43, (a.lightness + b.lightness) / 2));
  return `hsl(${hue.toFixed(1)} ${saturation.toFixed(1)}% ${lightness.toFixed(1)}%)`;
}

export function HouseholdShape({
  household,
  quests,
  balances,
  activeMember,
  dinosaurState,
  homeEnergy,
  homeGoal,
  dailyPlans = [],
  childView = false,
  onSelectMember,
}: {
  household: Household;
  quests: DailyQuest[];
  balances: MemberBalance[];
  activeMember: HouseholdMember;
  dinosaurState: HomeDinosaurState;
  homeEnergy: number;
  homeGoal: HomeGoal;
  dailyPlans?: DailyPlan[];
  childView?: boolean;
  onSelectMember?: (member: HouseholdMember) => void;
}) {
  const [dinosaurSpeaking, setDinosaurSpeaking] = useState(false);
  const basePoints = regularPolygonPoints(household.members.length);
  const livePoints = balancePolygonPoints(balances);
  const pendingEnergy = quests.filter((quest) => quest.state === "pending_endorsement").length;
  const activePlan = dailyPlans.find((plan) => plan.memberId === activeMember.id);
  const moonPhase = moonPhaseForDate(new Date());
  const capacityLabel = activePlan
    ? activePlan.capacity.charAt(0).toUpperCase() + activePlan.capacity.slice(1)
    : "Set";
  const path = livePoints.map((point) => `${point.x},${point.y}`).join(" ");
  const basePath = basePoints.map((point) => `${point.x},${point.y}`).join(" ");
  const relationshipColours = household.members.map((member, index) => (
    relationshipColour(member.colour, household.members[(index + 1) % household.members.length].colour)
  ));
  const spectrum = household.members.flatMap((member, index) => [member.colour, relationshipColours[index]]);
  const spectrumBackground = `radial-gradient(circle, rgba(255,255,255,0.24), transparent 30%), conic-gradient(from -90deg, ${spectrum.join(", ")}, ${spectrum[0]})`;
  const energyStrength = Math.min(1, homeEnergy / Math.max(1, homeGoal.targetEnergy));

  return (
    <section className={childView ? "shape shape--child" : "shape"} aria-labelledby="shape-title">
      <div className="shape__heading">
        <div>
          {childView ? null : <p className="eyebrow">OUR SHAPE</p>}
          <h2 id="shape-title">{childView ? "Our Shape" : "Our home today"}</h2>
          {childView ? <p className="shape__promise">Every side matters. We find our balance together.</p> : null}
        </div>
        {childView ? null : <span className="shape__status"><Sparkles size={13} /> {homeEnergy} Home Energy</span>}
      </div>

      {childView ? (
        <div className="shape__status-corner" aria-label="Today's home status">
          <button
            className="shape-status-widget"
            type="button"
            onClick={() => onSelectMember?.(activeMember)}
            aria-label={`${activeMember.displayName}'s capacity is ${capacityLabel}. Open profile.`}
          >
            <Gauge size={15} aria-hidden="true" />
            <span><small>Capacity</small><strong>{capacityLabel}</strong></span>
          </button>
          <div className="shape-status-widget" aria-label={`${moonPhase.name}, ${moonPhase.illumination}% illuminated`}>
            <span className="shape-status-widget__moon" aria-hidden="true">{moonPhase.symbol}</span>
            <span><small>Moon</small><strong>{moonPhase.name.replace(" moon", "")}</strong></span>
          </div>
          <div className="shape-status-widget shape-status-widget--energy" aria-label={`${homeEnergy} Home Energy`}>
            <Sparkles size={15} aria-hidden="true" />
            <span><small>Energy</small><strong>{homeEnergy}</strong></span>
          </div>
        </div>
      ) : null}

      <div className="shape__stage">
        <div
          className="shape__home-glow"
          style={{
            opacity: 0.04 + (energyStrength * 0.62),
            background: spectrumBackground,
            filter: `blur(9px) saturate(${0.5 + energyStrength})`,
          }}
          aria-hidden="true"
        />
        <svg className="shape__lines" viewBox="0 0 360 360" role="img" aria-label={`${household.members.length}-person household shape`}>
          <polygon points={basePath} className="shape__guide" />
          <polygon points={path} className="shape__live" />
          {livePoints.map((point, index) => {
            const nextPoint = livePoints[(index + 1) % livePoints.length];
            return (
              <line
                className="shape__relationship"
                x1={point.x}
                y1={point.y}
                x2={nextPoint.x}
                y2={nextPoint.y}
                style={{
                  "--relationship-colour": relationshipColours[index],
                  "--relationship-strength": 0.42 + (energyStrength * 0.58),
                } as CSSProperties}
                key={`${household.members[index].id}-${household.members[(index + 1) % household.members.length].id}`}
              />
            );
          })}
          {livePoints.map((point, index) => <line className="shape__spoke" x1="180" y1="180" x2={point.x} y2={point.y} key={household.members[index].id} />)}
        </svg>

        {household.members.map((member, index) => {
          const point = basePoints[index];
          const selected = member.id === activeMember.id;
          const plan = dailyPlans.find((candidate) => candidate.memberId === member.id);
          return (
            <button
              type="button"
              className={selected ? "shape-member shape-member--active" : "shape-member"}
              style={{ "--member-colour": member.colour, left: `${(point.x / 360) * 100}%`, top: `${(point.y / 360) * 100}%` } as CSSProperties}
              key={member.id}
              onClick={() => onSelectMember?.(member)}
              aria-label={`Open ${member.displayName}'s profile`}
            >
              <span className="shape-member__avatar">{member.initials}</span>
              <span className="shape-member__name">{member.displayName}</span>
              {plan ? <small>{plan.capacity}</small> : null}
            </button>
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
