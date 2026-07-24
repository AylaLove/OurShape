"use client";

import { balancePolygonPoints, regularPolygonPoints, type DailyQuest, type Household, type HouseholdMember, type MemberBalance } from "@family-game/domain";
import { BookOpen, Film, Flower2, Home, Shirt, Sparkles, Utensils } from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { HomeDinosaur } from "@/features/companion/HomeDinosaur";
import { dinosaurMessage, type HomeDinosaurState } from "@/features/companion/companion-state";
import { homeGoalProgress, type HomeGoal } from "@/features/energy/home-goal";
import { featuredQuests } from "@/features/quests/quest-presentation";

const ICONS = { dishes: Utensils, laundry: Shirt, book: BookOpen, plant: Flower2, home: Home, wood: Home, sparkle: Sparkles };

type NodePosition = { x: number; y: number; placement: string };

const CHILD_NODE_POSITIONS: NodePosition[] = [
  { x: 76, y: 108, placement: "shared" },
  { x: 180, y: 102, placement: "shared" },
  { x: 284, y: 108, placement: "shared" },
];

function memberPoint(
  memberId: string,
  household: Household,
  points: ReturnType<typeof regularPolygonPoints>,
) {
  const index = household.members.findIndex((member) => member.id === memberId);
  return index >= 0 ? points[index] : null;
}

function questNodePosition(
  quest: DailyQuest,
  household: Household,
  points: ReturnType<typeof regularPolygonPoints>,
  neutralIndex: number,
): NodePosition {
  const relatedIds = quest.participantIds.length
    ? quest.participantIds
    : quest.suggestedMemberIds;

  if (quest.kind === "personal" && relatedIds[0]) {
    const point = memberPoint(relatedIds[0], household, points);
    if (point) {
      return {
        x: point.x * 0.52 + 180 * 0.48,
        y: point.y * 0.52 + 180 * 0.48,
        placement: "personal",
      };
    }
  }

  if (quest.kind === "duo" && relatedIds.length >= 2) {
    const first = memberPoint(relatedIds[0], household, points);
    const second = memberPoint(relatedIds[1], household, points);
    if (first && second) {
      return {
        x: (first.x + second.x) / 2,
        y: (first.y + second.y) / 2,
        placement: "duo",
      };
    }
  }

  if (quest.kind === "family") {
    return { x: 180, y: 142, placement: "family" };
  }

  const neutralPositions = [
    { x: 180, y: 118 },
    { x: 105, y: 200 },
    { x: 255, y: 200 },
  ];
  return {
    ...neutralPositions[neutralIndex % neutralPositions.length],
    placement: "shared",
  };
}

export function HouseholdShape({
  household,
  quests,
  balances,
  activeMember,
  dinosaurState,
  homeEnergy,
  homeGoal,
  childView = false,
  onSelectQuest,
}: {
  household: Household;
  quests: DailyQuest[];
  balances: MemberBalance[];
  activeMember: HouseholdMember;
  dinosaurState: HomeDinosaurState;
  homeEnergy: number;
  homeGoal: HomeGoal;
  childView?: boolean;
  onSelectQuest: (questId: string) => void;
}) {
  const [dinosaurSpeaking, setDinosaurSpeaking] = useState(false);
  const basePoints = regularPolygonPoints(household.members.length);
  const livePoints = balancePolygonPoints(balances);
  const nodes = featuredQuests(quests, activeMember.id);
  const pendingEnergy = quests.filter((quest) => quest.state === "pending_endorsement").length;
  const goalProgress = homeGoalProgress(homeGoal, homeEnergy);
  const path = livePoints.map((point) => `${point.x},${point.y}`).join(" ");
  const basePath = basePoints.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <section className={childView ? "shape shape--child" : "shape"} aria-labelledby="shape-title">
      <div className="shape__heading">
        <div>
          <p className="eyebrow">{childView ? "OUR HOME" : "OUR SHAPE"}</p>
          <h2 id="shape-title">{childView ? "What needs us?" : "Our home today"}</h2>
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

        <div className="shape__quest-nodes">
          {nodes.map((quest, index) => {
            const Icon = ICONS[quest.icon];
            const position = childView
              ? CHILD_NODE_POSITIONS[index % CHILD_NODE_POSITIONS.length]
              : questNodePosition(quest, household, basePoints, index);
            return (
              <button
                className={`shape-quest ${index === 0 ? "shape-quest--primary" : "shape-quest--secondary"} shape-quest--${position.placement} shape-quest--${quest.state}`}
                type="button"
                key={quest.id}
                onClick={() => onSelectQuest(quest.id)}
                aria-label={`Open ${quest.title}`}
                style={{ "--quest-x": `${(position.x / 360) * 100}%`, "--quest-y": `${(position.y / 360) * 100}%` } as CSSProperties}
              >
                <Icon size={21} strokeWidth={1.8} />
                <span>{quest.title}</span>
              </button>
            );
          })}
        </div>
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
            : "Choose a quest, or tap Dino for a hint."
          : "Only verified help creates Home Energy. The shape compares contribution with each person’s agreed capacity."}
      </p>
    </section>
  );
}
