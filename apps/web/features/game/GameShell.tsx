"use client";

import {
  endorseQuest,
  addQuickQuest,
  joinQuest,
  markQuestDone,
  redeemReward,
  sendHighFive,
  type DailyQuest,
  type DomainResult,
} from "@family-game/domain";
import { AppNav, type AppSection } from "@/components/AppNav";
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

function now() {
  return new Date().toISOString();
}

export function GameShell() {
  const [state, setState] = useState(createDemoState);
  const [activeMemberId, setActiveMemberId] = useState("demo-ayla");
  const [section, setSection] = useState<AppSection>("today");
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const activeMember = state.household.members.find((member) => member.id === activeMemberId) ?? state.household.members[0];
  const selectedQuest = useMemo(() => state.quests.find((quest) => quest.id === selectedQuestId) ?? null, [selectedQuestId, state.quests]);
  const waitingCount = state.quests.filter((quest) => quest.state === "pending_endorsement" && !quest.participantIds.includes(activeMember.id)).length;
  const databaseReady = isSupabaseConfigured();

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function apply(result: DomainResult, close = false) {
    if (result.ok) setState(result.state);
    setToast(result.message);
    if (close && result.ok) setSelectedQuestId(null);
  }

  function selectQuest(quest: DailyQuest) {
    setSelectedQuestId(quest.id);
  }

  return (
    <main className={activeMember.role === "child" ? "app-shell app-shell--child" : "app-shell"}>
      <header className="topbar">
        <div>
          <p className="eyebrow">WEDNESDAY · 22 JULY</p>
          <h1>{state.household.name}</h1>
        </div>
        <div className="topbar__actions">
          <ProfileSwitcher members={state.household.members} activeMember={activeMember} onChange={(memberId) => {
            setActiveMemberId(memberId);
            setSelectedQuestId(null);
          }} />
          <button className="round-button round-button--plain notification-button" type="button" aria-label={`${waitingCount} items waiting for thanks`} onClick={() => setSection("thanks")}>
            <Bell size={20} />{waitingCount ? <span>{waitingCount}</span> : null}
          </button>
        </div>
      </header>

      <div className="demo-banner" role="status"><ShieldCheck size={15} /><span>Private playable demo</span><Cloud size={15} /><span>{databaseReady ? "Development database connected" : "Resettable demo data: not yet shared across phones"}</span></div>

      {section === "today" ? <TodayView state={state} activeMember={activeMember} onSelectQuest={selectQuest} onQuickAdd={() => setQuickAddOpen(true)} /> : null}
      {section === "thanks" ? <GratitudeView state={state} activeMember={activeMember} onSelectQuest={selectQuest} onHighFive={(memberId) => apply(sendHighFive(state, activeMember.id, memberId, now()))} /> : null}
      {section === "rewards" ? <RewardsView state={state} activeMember={activeMember} onRedeem={(rewardId) => apply(redeemReward(state, rewardId, activeMember.id, now()))} /> : null}
      {section === "family" ? <FamilyView state={state} activeMember={activeMember} /> : null}

      <AppNav active={section} onChange={setSection} />

      {selectedQuest ? (
        <QuestDetailSheet
          quest={selectedQuest}
          members={state.household.members}
          activeMember={activeMember}
          onClose={() => setSelectedQuestId(null)}
          onJoin={() => apply(joinQuest(state, selectedQuest.id, activeMember.id, now()))}
          onFinish={() => apply(markQuestDone(state, selectedQuest.id, activeMember.id, now()), true)}
          onThank={() => apply(endorseQuest(state, selectedQuest.id, activeMember.id, "thanked", now()), true)}
          onNeedsMore={() => apply(endorseQuest(state, selectedQuest.id, activeMember.id, "needs_a_little_more", now()), true)}
        />
      ) : null}
      {quickAddOpen ? <QuickAddSheet onClose={() => setQuickAddOpen(false)} onAdd={(quest: QuickQuest) => {
        apply(addQuickQuest(state, quest, activeMember.id, now()));
        setQuickAddOpen(false);
      }} /> : null}
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </main>
  );
}
