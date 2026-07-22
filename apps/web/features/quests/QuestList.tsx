import type { DailyQuest, HouseholdMember } from "@family-game/domain";
import { BookOpen, Check, CircleEllipsis, Flower2, Home, Shirt, Utensils } from "lucide-react";
import type { CSSProperties } from "react";

interface QuestListProps {
  quests: DailyQuest[];
  members: HouseholdMember[];
}

const QUEST_ICONS = {
  dishes: Utensils,
  laundry: Shirt,
  book: BookOpen,
  plant: Flower2,
  home: Home,
};

const KIND_LABELS: Record<DailyQuest["kind"], string> = {
  personal: "Personal",
  open: "Anyone",
  duo: "Together",
  family: "Whole home",
  care: "Care",
  surprise_help: "Kindness",
  big: "Big quest",
  rescue: "Needs help",
};

function stateLabel(state: DailyQuest["state"]) {
  if (state === "active") return "In progress";
  if (state === "pending_endorsement") return "Waiting for thanks";
  if (state === "completed") return "Complete";
  return "Needs doing";
}

export function QuestList({ quests, members }: QuestListProps) {
  return (
    <section className="quest-section" aria-labelledby="quests-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">TODAY</p>
          <h2 id="quests-title">What needs us</h2>
        </div>
        <span className="quest-count">{quests.length} quests</span>
      </div>

      <div className="quest-list">
        {quests.map((quest) => {
          const Icon = QUEST_ICONS[quest.icon];
          const participants = members.filter((member) => quest.participantIds.includes(member.id));
          const waiting = quest.state === "pending_endorsement";

          return (
            <article className={`quest quest--${quest.state}`} key={quest.id}>
              <div className="quest__icon" aria-hidden="true"><Icon size={24} strokeWidth={1.8} /></div>
              <div className="quest__content">
                <div className="quest__title-row">
                  <h3>{quest.title}</h3>
                  <span className="points">+{quest.appreciationValue}</span>
                </div>
                <div className="quest__meta">
                  <span>{KIND_LABELS[quest.kind]}</span>
                  <span aria-hidden="true">·</span>
                  <span className={waiting ? "quest__state quest__state--waiting" : "quest__state"}>
                    {waiting ? <Check size={14} /> : <CircleEllipsis size={14} />}
                    {stateLabel(quest.state)}
                  </span>
                </div>
                {participants.length ? (
                  <div className="participants" aria-label={`Participants: ${participants.map((member) => member.displayName).join(", ")}`}>
                    {participants.map((member) => (
                      <span className="mini-avatar" style={{ "--member-colour": member.colour } as CSSProperties} key={member.id}>
                        {member.initials}
                      </span>
                    ))}
                    <span>{participants.map((member) => member.displayName).join(" + ")}</span>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
