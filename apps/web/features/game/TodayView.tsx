import { contributionBalance, type DailyQuest, type GameState, type HouseholdMember } from "@family-game/domain";
import { HouseholdShape } from "@/features/geometry/HouseholdShape";
import { QuestList } from "@/features/quests/QuestList";
import { Sparkles } from "lucide-react";

export function TodayView({ state, activeMember, onSelectQuest, onQuickAdd }: { state: GameState; activeMember: HouseholdMember; onSelectQuest: (quest: DailyQuest) => void; onQuickAdd: () => void }) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const balances = contributionBalance(state, since);
  const outstanding = state.quests.filter((quest) => !["completed", "cancelled"].includes(quest.state));
  const message = activeMember.role === "child"
    ? `${outstanding.length} things are waiting for our team.`
    : `${outstanding.length} household needs are open. Join one or do one together.`;

  return (
    <>
      <section className="welcome-strip" aria-label="Household encouragement"><Sparkles size={18} aria-hidden="true" /><p>{message}</p></section>
      <HouseholdShape household={state.household} quests={state.quests} balances={balances} activeMember={activeMember} onSelectQuest={(id) => {
        const quest = state.quests.find((candidate) => candidate.id === id);
        if (quest) onSelectQuest(quest);
      }} />
      <QuestList quests={state.quests.filter((quest) => quest.state !== "cancelled")} members={state.household.members} onQuickAdd={activeMember.role === "adult" ? onQuickAdd : undefined} onSelect={(id) => {
        const quest = state.quests.find((candidate) => candidate.id === id);
        if (quest) onSelectQuest(quest);
      }} />
    </>
  );
}
