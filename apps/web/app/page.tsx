import { Sparkles } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { HouseholdShape } from "@/features/geometry/HouseholdShape";
import { DEMO_HOUSEHOLD } from "@/features/households/demo-household";
import { DEMO_QUESTS } from "@/features/quests/demo-quests";
import { QuestList } from "@/features/quests/QuestList";

export default function TodayPage() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">WEDNESDAY</p>
          <h1>{DEMO_HOUSEHOLD.name}</h1>
        </div>
        <div className="profile-avatar" aria-label="Current profile: Ayla">A</div>
      </header>

      <section className="welcome-strip" aria-label="Household encouragement">
        <Sparkles size={18} aria-hidden="true" />
        <p>Five small things can help the home feel good today.</p>
      </section>

      <HouseholdShape household={DEMO_HOUSEHOLD} quests={DEMO_QUESTS} />
      <QuestList quests={DEMO_QUESTS} members={DEMO_HOUSEHOLD.members} />
      <AppNav />
    </main>
  );
}
