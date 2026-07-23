import type { DailyQuest, HouseholdMember } from "@family-game/domain";
import {
  BookOpen,
  Check,
  CircleEllipsis,
  Flower2,
  Heart,
  Home,
  PartyPopper,
  Play,
  Shirt,
  Sparkles,
  Trees,
  Utensils,
} from "lucide-react";
import type { CSSProperties } from "react";

const QUEST_ICONS = { dishes: Utensils, laundry: Shirt, book: BookOpen, plant: Flower2, home: Home, wood: Trees, sparkle: Sparkles };
const KIND_LABELS: Record<DailyQuest["kind"], string> = {
  personal: "Personal", open: "Anyone", duo: "Together", family: "Whole home", care: "Care", surprise_help: "Kindness", big: "Big quest", rescue: "Needs help",
};

function stateLabel(state: DailyQuest["state"]) {
  if (state === "active") return "In progress";
  if (state === "pending_endorsement") return "Waiting for thanks";
  if (state === "completed") return "Appreciated";
  return "Needs doing";
}

export function QuestList({ quests, members, onSelect, onQuickAdd }: { quests: DailyQuest[]; members: HouseholdMember[]; onSelect: (questId: string) => void; onQuickAdd?: () => void }) {
  const groups = [
    {
      id: "needed",
      title: "Needs us",
      hint: "Pick one",
      Icon: Sparkles,
      quests: quests.filter((quest) => ["needed", "carried", "rescheduled"].includes(quest.state)),
    },
    {
      id: "active",
      title: "Doing",
      hint: "We joined",
      Icon: Play,
      quests: quests.filter((quest) => quest.state === "active"),
    },
    {
      id: "waiting",
      title: "Waiting for thanks",
      hint: "Someone must notice",
      Icon: Heart,
      quests: quests.filter((quest) => quest.state === "pending_endorsement"),
    },
    {
      id: "completed",
      title: "Celebrated",
      hint: "Home Energy earned",
      Icon: PartyPopper,
      quests: quests.filter((quest) => quest.state === "completed"),
    },
  ] as const;

  return (
    <section className="quest-section" aria-labelledby="quests-title">
      <div className="section-heading">
        <div><p className="eyebrow">TODAY’S QUESTS</p><h2 id="quests-title">Help the home</h2></div>
        {onQuickAdd ? <button className="round-button" type="button" aria-label="Add a household quest" title="Add quest" onClick={onQuickAdd}>+</button> : null}
      </div>

      <div className="quest-board">
        {groups.map((group) => (
          <section className={`quest-stage quest-stage--${group.id}`} aria-labelledby={`quest-stage-${group.id}`} key={group.id}>
            <header className="quest-stage__heading">
              <span className="quest-stage__icon"><group.Icon size={19} /></span>
              <span>
                <strong id={`quest-stage-${group.id}`}>{group.title}</strong>
                <small>{group.hint}</small>
              </span>
              <b>{group.quests.length}</b>
            </header>
            {group.quests.length ? (
              <div className="quest-list">
                {group.quests.map((quest) => (
                  <QuestCard quest={quest} members={members} onSelect={onSelect} key={quest.id} />
                ))}
              </div>
            ) : (
              <p className="quest-stage__empty">{group.id === "completed" ? "Complete a quest and send thanks to light this up." : "Nothing here right now."}</p>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}

function QuestCard({ quest, members, onSelect }: { quest: DailyQuest; members: HouseholdMember[]; onSelect: (questId: string) => void }) {
  const Icon = QUEST_ICONS[quest.icon];
  const participants = members.filter((member) => quest.participantIds.includes(member.id));
  const waiting = quest.state === "pending_endorsement";

  return (
    <button className={`quest quest--${quest.state} quest--urgency-${quest.urgency}`} type="button" onClick={() => onSelect(quest.id)}>
      <span className="quest__icon" aria-hidden="true"><Icon size={24} strokeWidth={1.8} /></span>
      <span className="quest__content">
        <span className="quest__title-row"><strong>{quest.title}</strong><span className="points">+{quest.appreciationValue}</span></span>
        <span className="quest__meta">
          <span>{KIND_LABELS[quest.kind]}</span><span aria-hidden="true">·</span>
          <span className={waiting ? "quest__state quest__state--waiting" : "quest__state"}>{waiting ? <Check size={14} /> : <CircleEllipsis size={14} />}{stateLabel(quest.state)}</span>
        </span>
        {participants.length ? (
          <span className="participants" aria-label={`Participants: ${participants.map((member) => member.displayName).join(", ")}`}>
            {participants.map((member) => <span className="mini-avatar" style={{ "--member-colour": member.colour } as CSSProperties} key={member.id}>{member.initials}</span>)}
            <span>{participants.map((member) => member.displayName).join(" + ")}</span>
          </span>
        ) : null}
      </span>
    </button>
  );
}
