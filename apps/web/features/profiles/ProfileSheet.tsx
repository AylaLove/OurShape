"use client";

import { Gauge, Hand, ListChecks, Moon, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { pointBalance, todayPlan, type DailyCapacity, type GameState, type HouseholdMember } from "@family-game/domain";
import type { CSSProperties } from "react";
import { homeEnergy } from "@/features/companion/companion-state";
import { moonPhaseForDate } from "@/features/rhythms/moon-phase";
import { MemberMark } from "./MemberMark";

export function ProfileSheet({
  state,
  member,
  activeMember,
  today,
  soundOn,
  onToggleSound,
  onEditDailyPlan,
  onClose,
}: {
  state: GameState;
  member: HouseholdMember;
  activeMember: HouseholdMember;
  today: string;
  soundOn: boolean;
  onToggleSound: () => void;
  onEditDailyPlan: () => void;
  onClose: () => void;
}) {
  const earned = state.pointLedger
    .filter((entry) => entry.memberId === member.id && entry.reason === "quest_endorsed" && entry.amount > 0)
    .slice(-3)
    .reverse();
  const balance = pointBalance(state, member.id);
  const plan = todayPlan(state, member.id, today);
  const energy = homeEnergy(state);
  const moon = moonPhaseForDate(new Date());
  const intentions = state.quests.filter((quest) => plan?.intentionQuestIds.includes(quest.id));
  const capacityLabels: Record<DailyCapacity, string> = { rest: "Rest", gentle: "Gentle", steady: "Steady", plenty: "Plenty" };
  const supportLabel = plan?.capacityContext === "menstrual_support"
    ? "Menstrual support welcome"
    : plan?.capacityContext === "luteal_support"
      ? "Luteal support welcome"
      : plan?.capacityContext === "cycle_support"
        ? "Cycle support welcome"
        : null;

  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <section className="profile-sheet" role="dialog" aria-modal="true" aria-labelledby="profile-sheet-title" onClick={(event) => event.stopPropagation()}>
        <button className="profile-sheet__close" type="button" onClick={onClose} aria-label="Close profile"><X size={20} /></button>
        <span className="profile-sheet__avatar" style={{ "--member-colour": member.colour } as CSSProperties}>
          <MemberMark symbol={member.symbol} initials={member.initials} size={30} />
        </span>
        <p className="eyebrow">{member.role === "child" ? "HOUSE HELPER" : "FAMILY MEMBER"}</p>
        <h2 id="profile-sheet-title">{member.displayName}</h2>
        <div className="profile-sheet__balance"><Sparkles size={21} /><strong>{balance}</strong><span>{member.pointLabel}</span></div>
        <div className="profile-sheet__section profile-sheet__today">
          <h3><Gauge size={18} /> Today</h3>
          {plan ? (
            <>
              <p><strong>{capacityLabels[plan.capacity]} capacity</strong>{supportLabel ? ` · ${supportLabel}` : ""}</p>
              <p className="profile-sheet__intentions"><ListChecks size={15} /> {intentions.length ? intentions.map((quest) => quest.title).join(" · ") : "No specific intentions yet"}</p>
            </>
          ) : <p>No capacity or intentions set yet.</p>}
          {activeMember.id === member.id ? <button className="profile-sheet__plan-button" type="button" onClick={onEditDailyPlan}>{plan ? "Adjust today’s plan" : "Set today’s plan"}</button> : null}
        </div>
        <div className="profile-sheet__pulse" aria-label="Shared home rhythm">
          <span><Sparkles size={17} /><strong>{energy}</strong><small>Home Energy</small></span>
          <span><Moon size={17} /><strong>{moon.symbol}</strong><small>{moon.name}</small></span>
        </div>
        <div className="profile-sheet__section">
          <h3><Hand size={18} /> High Fives earned</h3>
          {earned.length ? earned.map((entry) => {
            const quest = state.quests.find((candidate) => candidate.id === entry.questId);
            return <p key={entry.id}><strong>+{entry.amount}</strong> · {quest?.title ?? "Help that was noticed"}</p>;
          }) : <p>No High Fives earned yet. Kindness still matters.</p>}
        </div>
        <button className="profile-sheet__sound" type="button" onClick={onToggleSound}>
          {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          Celebration sound {soundOn ? "on" : "off"}
        </button>
      </section>
    </div>
  );
}
