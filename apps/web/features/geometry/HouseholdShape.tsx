import { balancePolygonPoints, regularPolygonPoints, type DailyQuest, type Household, type HouseholdMember, type MemberBalance } from "@family-game/domain";
import { BookOpen, Flower2, Home, Shirt, Sparkles, Utensils } from "lucide-react";
import type { CSSProperties } from "react";
import { HomeDinosaur } from "@/features/companion/HomeDinosaur";
import type { HomeDinosaurState } from "@/features/companion/companion-state";

const ICONS = { dishes: Utensils, laundry: Shirt, book: BookOpen, plant: Flower2, home: Home, wood: Home, sparkle: Sparkles };

export function HouseholdShape({
  household,
  quests,
  balances,
  activeMember,
  dinosaurState,
  homeEnergy,
  onSelectQuest,
}: {
  household: Household;
  quests: DailyQuest[];
  balances: MemberBalance[];
  activeMember: HouseholdMember;
  dinosaurState: HomeDinosaurState;
  homeEnergy: number;
  onSelectQuest: (questId: string) => void;
}) {
  const basePoints = regularPolygonPoints(household.members.length);
  const livePoints = balancePolygonPoints(balances);
  const openQuests = quests.filter((quest) => !["completed", "cancelled"].includes(quest.state));
  const familyQuest = openQuests.find((quest) => quest.kind === "family");
  const waitingQuest = openQuests.find((quest) => quest.state === "pending_endorsement");
  const urgentQuest = openQuests.find((quest) => quest.urgency === 2 && quest.id !== waitingQuest?.id);
  const nodes = [familyQuest, waitingQuest, urgentQuest].filter((quest): quest is DailyQuest => Boolean(quest));
  const path = livePoints.map((point) => `${point.x},${point.y}`).join(" ");
  const basePath = basePoints.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <section className="shape" aria-labelledby="shape-title">
      <div className="shape__heading">
        <div>
          <p className="eyebrow">OUR SHAPE</p>
          <h2 id="shape-title">Our home today</h2>
        </div>
        <span className="shape__status"><Sparkles size={13} /> {homeEnergy} Home Energy</span>
      </div>

      <div className="shape__stage">
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
            return (
              <button
                className={`shape-quest shape-quest--${index + 1} shape-quest--${quest.state}`}
                type="button"
                key={quest.id}
                onClick={() => onSelectQuest(quest.id)}
                aria-label={`Open ${quest.title}`}
              >
                <Icon size={21} strokeWidth={1.8} />
                <span>{quest.title}</span>
              </button>
            );
          })}
        </div>
        <div className="shape__companion">
          <HomeDinosaur state={dinosaurState} priority />
        </div>
      </div>
      <p className="shape__caption">{activeMember.role === "child" ? "Work together, collect Home Energy, and help our shape glow." : "Only verified help creates Home Energy. The shape compares contribution with each person’s agreed capacity."}</p>
    </section>
  );
}
