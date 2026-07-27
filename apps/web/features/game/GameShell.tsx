"use client";

import {
  endorseQuest,
  addQuickQuest,
  addRepairMission,
  joinQuest,
  markQuestDone,
  pointBalance,
  redeemReward,
  sendHighFive,
  type DailyQuest,
  type DomainResult,
} from "@family-game/domain";
import { AppNav, type AppScreen } from "@/components/AppNav";
import { GratitudeView } from "@/features/gratitude/GratitudeView";
import { FamilyView } from "@/features/history/FamilyView";
import { RewardsView } from "@/features/rewards/RewardsView";
import { Bell, Cloud, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createDemoState } from "./demo-state";
import { ProfileSwitcher } from "./ProfileSwitcher";
import { QuestDetailSheet } from "./QuestDetailSheet";
import { TodayView } from "./TodayView";
import { isSupabaseConfigured } from "@/lib/supabase-browser";
import { QuickAddSheet, type QuickQuest } from "./QuickAddSheet";
import { AllQuestsView } from "./AllQuestsView";
import { RepairMissionSheet, type RepairMissionInput } from "./RepairMissionSheet";
import {
  deriveHomeDinosaurState,
  homeEnergy,
  type HomeDinosaurState,
} from "@/features/companion/companion-state";
import { DEMO_HOME_GOAL } from "@/features/energy/home-goal";
import { GratitudeMoment, type GratitudeMomentData } from "@/features/gratitude/GratitudeMoment";

function now() {
  return new Date().toISOString();
}

const HYDRATION_SAFE_DAYTIME = new Date(2026, 0, 1, 12, 0, 0);

export function GameShell() {
  const [state, setState] = useState(createDemoState);
  const [activeMemberId, setActiveMemberId] = useState("demo-ayla");
  const [clientTime, setClientTime] = useState<Date | null>(null);
  const [section, setSection] = useState<AppScreen>("today");
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [repairAddOpen, setRepairAddOpen] = useState(false);
  const [companionMoment, setCompanionMoment] = useState<HomeDinosaurState | null>(null);
  const [gratitudeMoment, setGratitudeMoment] = useState<GratitudeMomentData | null>(null);
  const activeMember = state.household.members.find((member) => member.id === activeMemberId) ?? state.household.members[0];
  const selectedQuest = useMemo(() => state.quests.find((quest) => quest.id === selectedQuestId) ?? null, [selectedQuestId, state.quests]);
  const waitingCount = state.quests.filter((quest) => quest.state === "pending_endorsement" && !quest.participantIds.includes(activeMember.id)).length;
  const databaseReady = isSupabaseConfigured();
  const dinosaurState = companionMoment ?? deriveHomeDinosaurState(
    state,
    activeMember.id,
    clientTime ?? HYDRATION_SAFE_DAYTIME,
  );
  const energy = homeEnergy(state);
  const personalPoints = pointBalance(state, activeMember.id);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
      return;
    }
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    setClientTime(new Date());
  }, []);

  useEffect(() => {
    const requestedProfile = new URL(window.location.href).searchParams.get("profile");
    if (requestedProfile && state.household.members.some((member) => member.id === requestedProfile)) {
      setActiveMemberId(requestedProfile);
    }
  }, [state.household.members]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [section, activeMemberId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!companionMoment) return;
    const timer = window.setTimeout(() => setCompanionMoment(null), 2400);
    return () => window.clearTimeout(timer);
  }, [companionMoment]);

  function apply(result: DomainResult, close = false, moment: HomeDinosaurState | null = null) {
    if (result.ok) setState(result.state);
    if (result.ok && moment) setCompanionMoment(moment);
    setToast(result.message);
    if (close && result.ok) setSelectedQuestId(null);
  }

  function selectQuest(quest: DailyQuest) {
    setSelectedQuestId(quest.id);
  }

  function thankSelectedQuest(note: string | null) {
    if (!selectedQuest) return;
    const result = endorseQuest(state, selectedQuest.id, activeMember.id, "thanked", now(), note);
    if (result.ok) {
      const helpers = state.household.members.filter((member) => selectedQuest.participantIds.includes(member.id));
      setGratitudeMoment({
        title: "Effort noticed",
        message: `${helpers.map((member) => member.displayName).join(" + ")} helped with ${selectedQuest.title}.`,
        pointsLabel: selectedQuest.kind === "repair"
          ? "Repair accepted"
          : `+${selectedQuest.appreciationValue} ${helpers[0]?.pointLabel ?? "points"} each`,
        homeEnergyLabel: selectedQuest.kind === "repair" ? "Treasure reopened" : "+1 Home Energy",
      });
    }
    apply(result, true, "sharing-energy");
  }

  return (
    <main className={activeMember.role === "child" ? `app-shell app-shell--child${section === "today" ? " app-shell--home-screen" : ""}` : "app-shell"}>
      <header className={activeMember.role === "child" ? "topbar topbar--child" : "topbar"}>
        <div>
          {activeMember.role === "adult" ? <p className="eyebrow">{new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long" }).format(new Date()).toUpperCase()}</p> : null}
          <h1>{state.household.name}</h1>
        </div>
        <div className="topbar__actions">
          {activeMember.role === "child" && !databaseReady ? (
            <span className="topbar__demo-chip" title="Show-only demo. Progress resets.">
              Demo
            </span>
          ) : null}
          <ProfileSwitcher members={state.household.members} activeMember={activeMember} compact={activeMember.role === "child"} points={activeMember.role === "child" ? personalPoints : undefined} onChange={(memberId) => {
            setActiveMemberId(memberId);
            setSelectedQuestId(null);
            if (section === "quests" || (state.household.members.find((member) => member.id === memberId)?.role === "child" && section === "family")) setSection("today");
          }} />
          <button className="round-button round-button--plain notification-button" type="button" aria-label={`${waitingCount} items waiting for thanks`} onClick={() => setSection("thanks")}>
            <Bell size={20} />{waitingCount ? <span>{waitingCount}</span> : null}
          </button>
        </div>
      </header>

      {activeMember.role === "adult" ? <div className="demo-banner" role="status"><ShieldCheck size={15} /><span>Private playable demo</span><Cloud size={15} /><span>{databaseReady ? "Development database connected" : "Resettable demo data: not yet shared across phones"}</span></div> : null}

      {section === "today" ? <TodayView state={state} activeMember={activeMember} dinosaurState={dinosaurState} homeEnergy={energy} homeGoal={DEMO_HOME_GOAL} onSelectQuest={selectQuest} onQuickAdd={() => setQuickAddOpen(true)} /> : null}
      {section === "quests" ? <AllQuestsView state={state} activeMember={activeMember} onSelectQuest={selectQuest} onQuickAdd={() => setQuickAddOpen(true)} onAddRepair={() => setRepairAddOpen(true)} /> : null}
      {section === "thanks" ? <GratitudeView state={state} activeMember={activeMember} homeEnergy={energy} onSelectQuest={selectQuest} onHighFive={(memberId) => apply(sendHighFive(state, activeMember.id, memberId, now()), false, "celebrating")} /> : null}
      {section === "rewards" ? <RewardsView state={state} activeMember={activeMember} onRedeem={(rewardId) => apply(redeemReward(state, rewardId, activeMember.id, now()))} /> : null}
      {section === "family" ? <FamilyView state={state} activeMember={activeMember} /> : null}

      <AppNav active={section} onChange={setSection} childView={activeMember.role === "child"} />

      {selectedQuest ? (
        <QuestDetailSheet
          quest={selectedQuest}
          members={state.household.members}
          activeMember={activeMember}
          onClose={() => setSelectedQuestId(null)}
          onJoin={() => apply(joinQuest(state, selectedQuest.id, activeMember.id, now()))}
          onFinish={() => apply(markQuestDone(state, selectedQuest.id, activeMember.id, now()), true)}
          onThank={thankSelectedQuest}
          onNeedsMore={() => apply(endorseQuest(state, selectedQuest.id, activeMember.id, "needs_a_little_more", now()), true)}
        />
      ) : null}
      {quickAddOpen ? <QuickAddSheet onClose={() => setQuickAddOpen(false)} onAdd={(quest: QuickQuest) => {
        apply(addQuickQuest(state, quest, activeMember.id, now()));
        setQuickAddOpen(false);
      }} /> : null}
      {repairAddOpen ? <RepairMissionSheet members={state.household.members} onClose={() => setRepairAddOpen(false)} onAdd={(mission: RepairMissionInput) => {
        apply(addRepairMission(state, mission, activeMember.id, now()));
        setRepairAddOpen(false);
      }} /> : null}
      {gratitudeMoment ? <GratitudeMoment moment={gratitudeMoment} onClose={() => setGratitudeMoment(null)} /> : null}
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </main>
  );
}
