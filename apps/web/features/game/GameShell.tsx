"use client";

import {
  endorseQuest,
  addQuickQuest,
  addRepairMission,
  joinQuest,
  markQuestDone,
  pointBalance,
  redeemReward,
  setDailyPlan,
  todayPlan,
  type DailyQuest,
  type DailyPlan,
  type DomainResult,
  type GameState,
} from "@family-game/domain";
import { AppNav, type AppScreen } from "@/components/AppNav";
import { GratitudeView } from "@/features/gratitude/GratitudeView";
import { FamilyView } from "@/features/history/FamilyView";
import { RewardsView } from "@/features/rewards/RewardsView";
import { Bell, Cloud, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createDemoState } from "./demo-state";
import { ProfileSwitcher } from "./ProfileSwitcher";
import { QuestDetailSheet } from "./QuestDetailSheet";
import { TodayView } from "./TodayView";
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
import {
  recognitionNoticesForQuest,
  type RecognitionNotice,
} from "@/features/gratitude/recognition-notices";
import { HelpView } from "@/features/help/HelpView";
import { OpeningCheckIn } from "@/features/check-in/OpeningCheckIn";
import { ProfileSheet } from "@/features/profiles/ProfileSheet";
import { DailyPlanSheet } from "@/features/profiles/DailyPlanSheet";
import {
  HouseholdIdentitySheet,
  type HouseholdIdentityInput,
} from "@/features/households/HouseholdIdentitySheet";
import {
  useLiveGameActions,
  type LiveGameConnection,
} from "./use-live-game-actions";
import { playCelebrationTone } from "./play-celebration-tone";
import {
  gratitudeMomentForQuest,
  withHouseholdIdentity,
} from "./game-shell-state";
const now = () => new Date().toISOString();
const HYDRATION_SAFE_DAYTIME = new Date(2026, 0, 1, 12, 0, 0);
export function GameShell({
  initialState,
  liveConnection,
  headerControls,
}: {
  initialState?: GameState;
  liveConnection?: LiveGameConnection;
  headerControls?: ReactNode;
}) {
  const [state, setState] = useState<GameState>(() => initialState ?? createDemoState());
  const [activeMemberId, setActiveMemberId] = useState(
    liveConnection?.initialMemberId ?? "demo-ayla",
  );
  const [clientTime, setClientTime] = useState<Date | null>(null);
  const [section, setSection] = useState<AppScreen>("today");
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [repairAddOpen, setRepairAddOpen] = useState(false);
  const [companionMoment, setCompanionMoment] = useState<HomeDinosaurState | null>(null);
  const [gratitudeMoment, setGratitudeMoment] = useState<GratitudeMomentData | null>(null);
  const [recognitionNotices, setRecognitionNotices] = useState<RecognitionNotice[]>([]);
  const [checkInOpen, setCheckInOpen] = useState(true);
  const [profileMemberId, setProfileMemberId] = useState<string | null>(null);
  const [dailyPlanMemberId, setDailyPlanMemberId] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [identityOpen, setIdentityOpen] = useState(false);
  const activeMember = state.household.members.find((member) => member.id === activeMemberId) ?? state.household.members[0];
  const selectedQuest = useMemo(() => state.quests.find((quest) => quest.id === selectedQuestId) ?? null, [selectedQuestId, state.quests]);
  const waitingCount = state.quests.filter((quest) => quest.state === "pending_endorsement" && !quest.participantIds.includes(activeMember.id)).length;
  const databaseReady = Boolean(liveConnection);
  const dinosaurState = companionMoment ?? deriveHomeDinosaurState(
    state,
    activeMember.id,
    clientTime ?? HYDRATION_SAFE_DAYTIME,
  );
  const energy = homeEnergy(state);
  const personalPoints = pointBalance(state, activeMember.id);
  const profileMember = state.household.members.find((member) => member.id === profileMemberId) ?? null;
  const dailyPlanMember = state.household.members.find((member) => member.id === dailyPlanMemberId) ?? null;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: state.household.timezone }).format(clientTime ?? HYDRATION_SAFE_DAYTIME);

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
    setCheckInOpen(true);
  }, [activeMemberId]);

  useEffect(() => {
    const notice = recognitionNotices.find((entry) => entry.memberId === activeMemberId);
    if (!notice) return;
    setGratitudeMoment(notice.moment);
    setRecognitionNotices((entries) => entries.filter((entry) => entry !== notice));
  }, [activeMemberId, recognitionNotices]);
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

  const { runLiveAction, changeActiveMember } = useLiveGameActions({
    connection: liveConnection,
    activeMemberId,
    state,
    section,
    setState,
    setSection,
    setActiveMemberId,
    setSelectedQuestId,
    setToast,
    setCompanionMoment,
  });
  const selectQuest = (quest: DailyQuest) => setSelectedQuestId(quest.id);

  function updateHouseholdIdentity(input: HouseholdIdentityInput) {
    if (liveConnection) {
      setIdentityOpen(false);
      setToast("Household editing will be connected in the next shared-data batch.");
      return;
    }
    setState((current) => withHouseholdIdentity(current, input));
    setIdentityOpen(false);
    setToast("Your household identity is ready.");
  }

  async function thankSelectedQuest(note: string | null) {
    if (!selectedQuest) return;
    const moment = gratitudeMomentForQuest(state, selectedQuest);

    if (liveConnection) {
      const completion = state.completions.find((item) => item.questId === selectedQuest.id);
      if (!completion) {
        setToast("This finished quest is missing its completion record.");
        return;
      }
      await runLiveAction(
        () => liveConnection.repository.endorseCompletion(
          completion.id,
          activeMember.id,
          "thanked",
          note,
        ),
        "Thanks sent. The effort now counts.",
        { close: true, moment: "sharing-energy" },
      );
      setGratitudeMoment(moment);
    } else {
      const result = endorseQuest(state, selectedQuest.id, activeMember.id, "thanked", now(), note);
      if (result.ok) {
        setRecognitionNotices((notices) => [
          ...notices,
          ...recognitionNoticesForQuest(selectedQuest, state.household.members, activeMember),
        ]);
        setGratitudeMoment(moment);
      }
      apply(result, true, "sharing-energy");
    }
    if (navigator.vibrate) navigator.vibrate(35);
    if (soundOn) playCelebrationTone();
  }

  return (
    <main className={activeMember.role === "child" ? `app-shell app-shell--child${section === "today" ? " app-shell--home-screen" : ""}` : "app-shell"}>
      <header className={activeMember.role === "child" ? "topbar topbar--child" : "topbar"}>
        <div>
          {activeMember.role === "adult" ? <p className="eyebrow">{new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long" }).format(new Date()).toUpperCase()}</p> : null}
          <h1>{activeMember.role === "child" ? "How Can I Help?" : state.household.name}</h1>
        </div>
        <div className="topbar__actions">
          {headerControls}
          {activeMember.role === "child" && !databaseReady ? (
            <span className="topbar__demo-chip" title="Show-only demo. Progress resets.">
              Demo
            </span>
          ) : null}
          <ProfileSwitcher
            members={liveConnection
              ? state.household.members.filter((member) => liveConnection.controllableMemberIds.includes(member.id))
              : state.household.members}
            activeMember={activeMember}
            compact={activeMember.role === "child"}
            points={activeMember.role === "child" ? personalPoints : undefined}
            onChange={(memberId) => void changeActiveMember(memberId)}
          />
          <button className="round-button round-button--plain notification-button" type="button" aria-label={`${waitingCount} ${waitingCount === 1 ? "item" : "items"} waiting for thanks`} onClick={() => setSection("thanks")}>
            <Bell size={20} />{waitingCount ? <span>{waitingCount}</span> : null}
          </button>
        </div>
      </header>

      {activeMember.role === "adult" ? <div className="demo-banner" role="status"><ShieldCheck size={15} /><span>Private playable demo</span><Cloud size={15} /><span>{databaseReady ? "Development database connected" : "Resettable demo data: not yet shared across phones"}</span></div> : null}

      {section === "today" && checkInOpen ? <OpeningCheckIn state={state} activeMember={activeMember} onClose={() => setCheckInOpen(false)} onOpen={(screen) => {
        setCheckInOpen(false);
        setSection(screen);
      }} /> : null}
      {section === "today" ? <TodayView state={state} activeMember={activeMember} dinosaurState={dinosaurState} homeEnergy={energy} homeGoal={DEMO_HOME_GOAL} onSelectQuest={selectQuest} onQuickAdd={() => setQuickAddOpen(true)} onHelp={() => setSection("help")} onSelectMember={(member) => setProfileMemberId(member.id)} /> : null}
      {section === "help" ? <HelpView state={state} activeMember={activeMember} onSelectQuest={selectQuest} onShowAll={() => setSection("quests")} /> : null}
      {section === "quests" ? <AllQuestsView state={state} activeMember={activeMember} onSelectQuest={selectQuest} onQuickAdd={() => setQuickAddOpen(true)} onAddRepair={() => setRepairAddOpen(true)} /> : null}
      {section === "thanks" ? <GratitudeView state={state} activeMember={activeMember} homeEnergy={energy} onSelectQuest={selectQuest} /> : null}
      {section === "rewards" ? <RewardsView state={state} activeMember={activeMember} onRedeem={(rewardId) => {
        if (liveConnection) {
          void runLiveAction(
            () => liveConnection.repository.redeemReward(
              rewardId,
              activeMember.id,
              crypto.randomUUID(),
            ),
            "Reward requested.",
          );
        } else {
          apply(redeemReward(state, rewardId, activeMember.id, now()));
        }
      }} /> : null}
      {section === "family" ? <FamilyView state={state} activeMember={activeMember} onEditIdentity={() => setIdentityOpen(true)} /> : null}

      <AppNav active={section} onChange={setSection} childView={activeMember.role === "child"} />

      {selectedQuest ? (
        <QuestDetailSheet
          quest={selectedQuest}
          members={state.household.members}
          activeMember={activeMember}
          onClose={() => setSelectedQuestId(null)}
          onJoin={() => {
            if (liveConnection) {
              void runLiveAction(
                () => liveConnection.repository.joinQuest(
                  selectedQuest.id,
                  activeMember.id,
                  crypto.randomUUID(),
                ),
                `${activeMember.displayName} joined in.`,
              );
            } else {
              apply(joinQuest(state, selectedQuest.id, activeMember.id, now()));
            }
          }}
          onFinish={() => {
            if (liveConnection) {
              void runLiveAction(
                () => liveConnection.repository.completeQuest(
                  selectedQuest.id,
                  activeMember.id,
                  crypto.randomUUID(),
                ),
                "Finished. Now someone else can notice the effort.",
                { close: true },
              );
            } else {
              apply(markQuestDone(state, selectedQuest.id, activeMember.id, now()), true);
            }
          }}
          onThank={thankSelectedQuest}
          onNeedsMore={() => {
            if (liveConnection) {
              const completion = state.completions.find((item) => item.questId === selectedQuest.id);
              if (!completion) {
                setToast("This finished quest is missing its completion record.");
                return;
              }
              void runLiveAction(
                () => liveConnection.repository.endorseCompletion(
                  completion.id,
                  activeMember.id,
                  "needs_a_little_more",
                  null,
                ),
                "One small finishing touch was requested.",
                { close: true },
              );
            } else {
              apply(endorseQuest(state, selectedQuest.id, activeMember.id, "needs_a_little_more", now()), true);
            }
          }}
        />
      ) : null}
      {quickAddOpen ? <QuickAddSheet members={state.household.members} onClose={() => setQuickAddOpen(false)} onAdd={(quest: QuickQuest) => {
        if (liveConnection) {
          void runLiveAction(
            () => liveConnection.repository.createDailyQuest({
              householdId: liveConnection.householdId,
              title: quest.title,
              instruction: quest.instruction,
              scope: quest.scope ?? "home",
              categoryId: quest.categoryId ?? null,
              effort: quest.effort,
              appreciationValue: quest.appreciationValue,
              icon: quest.icon,
              suggestedMemberId: quest.suggestedMemberIds[0] ?? null,
              idempotencyKey: crypto.randomUUID(),
            }),
            `${quest.title} was added.`,
          );
          setQuickAddOpen(false);
        } else {
          apply(addQuickQuest(state, quest, activeMember.id, now()));
          setQuickAddOpen(false);
        }
      }} /> : null}
      {repairAddOpen ? <RepairMissionSheet members={state.household.members} onClose={() => setRepairAddOpen(false)} onAdd={(mission: RepairMissionInput) => {
        if (liveConnection) {
          void runLiveAction(
            () => liveConnection.repository.createRepairMission(
              liveConnection.householdId,
              mission.targetMemberId,
              mission.title,
              mission.instruction,
            ),
            "The Repair Mission is ready.",
          );
          setRepairAddOpen(false);
        } else {
          apply(addRepairMission(state, mission, activeMember.id, now()));
          setRepairAddOpen(false);
        }
      }} /> : null}
      {gratitudeMoment ? <GratitudeMoment moment={gratitudeMoment} onClose={() => setGratitudeMoment(null)} /> : null}
      {profileMember ? <ProfileSheet state={state} member={profileMember} activeMember={activeMember} today={today} soundOn={soundOn} onToggleSound={() => setSoundOn((value) => !value)} onEditDailyPlan={() => {
        setProfileMemberId(null);
        setDailyPlanMemberId(profileMember.id);
      }} onClose={() => setProfileMemberId(null)} /> : null}
      {dailyPlanMember ? <DailyPlanSheet
        member={dailyPlanMember}
        quests={state.quests}
        plan={todayPlan(state, dailyPlanMember.id, today)}
        today={today}
        onClose={() => setDailyPlanMemberId(null)}
        onSave={(input: Pick<DailyPlan, "capacity" | "capacityContext" | "intentionQuestIds">) => {
          if (liveConnection) {
            setToast("Shared daily intentions will be connected in the next data batch.");
          } else {
            apply(setDailyPlan(state, input, dailyPlanMember.id, now()));
          }
          setDailyPlanMemberId(null);
          setProfileMemberId(dailyPlanMember.id);
        }}
      /> : null}
      {identityOpen ? <HouseholdIdentitySheet household={state.household} onSave={updateHouseholdIdentity} onClose={() => setIdentityOpen(false)} /> : null}
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </main>
  );
}
