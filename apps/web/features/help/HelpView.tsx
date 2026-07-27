import type { DailyQuest, GameState, HouseholdMember } from "@family-game/domain";
import { BookOpen, Flower2, HeartHandshake, Home, ListTodo, Shirt, Sparkles, Trees, UserRound, UsersRound, Utensils } from "lucide-react";
import type { CSSProperties } from "react";
import { recommendHelp, type HelpMode } from "./help-recommendations";

const ICONS = { dishes: Utensils, laundry: Shirt, book: BookOpen, plant: Flower2, home: Home, wood: Trees, sparkle: Sparkles, repair: HeartHandshake };
const MODE_LABELS: Record<HelpMode, { label: string; Icon: typeof UserRound }> = {
  alone: { label: "I can do this", Icon: UserRound },
  together: { label: "Do it together", Icon: UsersRound },
  open: { label: "Anyone can help", Icon: Sparkles },
};

export function HelpView({
  state,
  activeMember,
  onSelectQuest,
  onShowAll,
}: {
  state: GameState;
  activeMember: HouseholdMember;
  onSelectQuest: (quest: DailyQuest) => void;
  onShowAll: () => void;
}) {
  const recommendations = recommendHelp(state.quests, activeMember);

  return (
    <section className="help-view" aria-labelledby="help-title">
      <header className="help-view__heading">
        <p className="eyebrow">FOR {activeMember.displayName.toUpperCase()}</p>
        <h1 id="help-title">How can I help?</h1>
        <p>Choose one small way to help our home.</p>
      </header>

      <div className="help-choices">
        {recommendations.map(({ quest, reason, mode }) => {
          const Icon = ICONS[quest.icon];
          const modeInfo = MODE_LABELS[mode];
          const helpers = state.household.members.filter((member) => quest.participantIds.includes(member.id));
          return (
            <button className="help-choice" type="button" key={quest.id} onClick={() => onSelectQuest(quest)}>
              <span className="help-choice__icon"><Icon size={38} strokeWidth={1.65} /></span>
              <span className="help-choice__body">
                <small>{reason}</small>
                <strong>{quest.title}</strong>
                <span className="help-choice__mode"><modeInfo.Icon size={16} /> {modeInfo.label}</span>
                {helpers.length ? (
                  <span className="help-choice__helpers">
                    {helpers.map((helper) => <i key={helper.id} style={{ "--member-colour": helper.colour } as CSSProperties}>{helper.initials}</i>)}
                    {helpers.map((helper) => helper.displayName).join(" + ")} already helping
                  </span>
                ) : null}
              </span>
              <span className="help-choice__points">+{quest.appreciationValue}<small>{activeMember.pointLabel}</small></span>
            </button>
          );
        })}
      </div>

      {recommendations.length ? (
        <button className="help-view__all" type="button" onClick={onShowAll}><ListTodo size={19} /> See all quests</button>
      ) : (
        <div className="help-view__empty"><Sparkles size={30} /><h2>Everything is settled</h2><p>There is nothing waiting for help right now.</p></div>
      )}
    </section>
  );
}
