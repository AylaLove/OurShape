import type { DailyQuest, HouseholdMember } from "@family-game/domain";
import { BookOpen, Check, CircleEllipsis, Flower2, Home, Shirt, Sparkles, Trees, Utensils } from "lucide-react";
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
  return (
    <section className="quest-section" aria-labelledby="quests-title">
      <div className="section-heading">
        <div><p className="eyebrow">TODAY</p><h2 id="quests-title">Choose a quest</h2></div>
        {onQuickAdd ? <button className="round-button" type="button" aria-label="Add a household quest" title="Add quest" onClick={onQuickAdd}>+</button> : null}
      </div>

      <div className="quest-list">
        {quests.map((quest) => {
          const Icon = QUEST_ICONS[quest.icon];
          const participants = members.filter((member) => quest.participantIds.includes(member.id));
          const waiting = quest.state === "pending_endorsement";
          return (
            <button className={`quest quest--${quest.state} quest--urgency-${quest.urgency}`} type="button" key={quest.id} onClick={() => onSelect(quest.id)}>
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
        })}
      </div>
    </section>
  );
}
