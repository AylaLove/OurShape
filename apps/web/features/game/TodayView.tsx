import { contributionBalance, type DailyQuest, type GameState, type HouseholdMember } from "@family-game/domain";
import { HouseholdShape } from "@/features/geometry/HouseholdShape";
import { QuestList } from "@/features/quests/QuestList";
import { HandHeart, Sparkles } from "lucide-react";
import type { HomeDinosaurState } from "@/features/companion/companion-state";
import type { HomeGoal } from "@/features/energy/home-goal";

export function TodayView({
  state,
  activeMember,
  dinosaurState,
  homeEnergy,
  homeGoal,
  onSelectQuest,
  onQuickAdd,
  onHelp,
  onSelectMember,
}: {
  state: GameState;
  activeMember: HouseholdMember;
  dinosaurState: HomeDinosaurState;
  homeEnergy: number;
  homeGoal: HomeGoal;
  onSelectQuest: (quest: DailyQuest) => void;
  onQuickAdd: () => void;
  onHelp: () => void;
  onSelectMember: (member: HouseholdMember) => void;
}) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const balances = contributionBalance(state, since);
  const outstanding = state.quests.filter((quest) => !["completed", "cancelled"].includes(quest.state));
  const message = activeMember.role === "child"
    ? "We help, we notice, and our home grows stronger."
    : `${outstanding.length} household needs are open. Join one alone or do one together.`;
  const shape = (
    <HouseholdShape household={state.household} quests={state.quests} balances={balances} activeMember={activeMember} dinosaurState={dinosaurState} homeEnergy={homeEnergy} homeGoal={homeGoal} childView={activeMember.role === "child"} onSelectMember={onSelectMember} />
  );

  if (activeMember.role === "child") {
    return (
      <section className="child-home-screen" aria-label="Home">
        <section className="welcome-strip welcome-strip--child" aria-label="Household encouragement"><Sparkles size={18} aria-hidden="true" /><p>{message}</p></section>
        <button className="help-primary-action" type="button" onClick={onHelp}>
          <span><HandHeart size={28} /></span>
          <strong>How can I help?</strong>
          <small>Find one thing our home needs</small>
        </button>
        {shape}
      </section>
    );
  }

  const questList = (
    <QuestList quests={state.quests.filter((quest) => quest.state !== "cancelled")} members={state.household.members} onQuickAdd={activeMember.role === "adult" ? onQuickAdd : undefined} onSelect={(id) => {
      const quest = state.quests.find((candidate) => candidate.id === id);
      if (quest) onSelectQuest(quest);
    }} />
  );

  return (
    <>
      <section className="welcome-strip" aria-label="Household encouragement"><Sparkles size={18} aria-hidden="true" /><p>{message}</p></section>
      {shape}
      {questList}
    </>
  );
}
