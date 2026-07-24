import type { DailyQuest, GameState, HouseholdMember } from "@family-game/domain";
import { HeartHandshake, Plus } from "lucide-react";
import { QuestList } from "@/features/quests/QuestList";

export function AllQuestsView({
  state,
  activeMember,
  onSelectQuest,
  onQuickAdd,
  onAddRepair,
}: {
  state: GameState;
  activeMember: HouseholdMember;
  onSelectQuest: (quest: DailyQuest) => void;
  onQuickAdd: () => void;
  onAddRepair: () => void;
}) {
  const visibleQuests = state.quests.filter((quest) => quest.state !== "cancelled");
  const openCount = visibleQuests.filter((quest) => quest.state !== "completed").length;

  return (
    <section className={activeMember.role === "child" ? "screen-view screen-view--child-quests" : "screen-view"} aria-labelledby="all-quests-title">
      <header className="screen-view__header">
        <div>
          <p className="eyebrow">OUR QUESTS</p>
          <h2 id="all-quests-title">Choose where to help</h2>
        </div>
        <div className="screen-view__actions">
          {activeMember.role === "adult" ? (
            <>
              <button className="round-button round-button--plain" type="button" onClick={onAddRepair} aria-label="Add a Repair Mission" title="Repair Mission"><HeartHandshake size={19} /></button>
              <button className="round-button" type="button" onClick={onQuickAdd} aria-label="Add a household quest" title="Add quest"><Plus size={20} /></button>
            </>
          ) : null}
          <span className="screen-view__count" aria-label={`${openCount} open quests`}>{openCount}</span>
        </div>
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
