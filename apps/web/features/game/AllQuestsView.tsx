import type { DailyQuest, GameState, HouseholdMember } from "@family-game/domain";
import { ArrowLeft } from "lucide-react";
import { QuestList } from "@/features/quests/QuestList";

export function AllQuestsView({
  state,
  activeMember,
  onBack,
  onSelectQuest,
}: {
  state: GameState;
  activeMember: HouseholdMember;
  onBack: () => void;
  onSelectQuest: (quest: DailyQuest) => void;
}) {
  const visibleQuests = state.quests.filter((quest) => quest.state !== "cancelled");
  const openCount = visibleQuests.filter((quest) => quest.state !== "completed").length;

  return (
    <section className={activeMember.role === "child" ? "screen-view screen-view--child-quests" : "screen-view"} aria-labelledby="all-quests-title">
      <header className="screen-view__header">
        <button className="screen-back-button" type="button" onClick={onBack}>
          <ArrowLeft size={20} aria-hidden="true" />
          <span>Home</span>
        </button>
        <div>
          <p className="eyebrow">OUR QUESTS</p>
          <h2 id="all-quests-title">Choose where to help</h2>
        </div>
        <span className="screen-view__count" aria-label={`${openCount} open quests`}>{openCount}</span>
      </header>

      <QuestList
        quests={visibleQuests}
        members={state.household.members}
        onSelect={(id) => {
          const quest = state.quests.find((candidate) => candidate.id === id);
          if (quest) onSelectQuest(quest);
        }}
      />
    </section>
  );
}
