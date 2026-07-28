"use client";

import { Gauge, Hand, ListChecks, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { pointBalance, todayPlan, type DailyCapacity, type GameState, type HouseholdMember } from "@family-game/domain";
import type { CSSProperties } from "react";

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
  const received = state.highFives.filter((highFive) => highFive.toMemberId === member.id).slice(-3).reverse();
  const balance = pointBalance(state, member.id);
  const plan = todayPlan(state, member.id, today);
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
        <span className="profile-sheet__avatar" style={{ "--member-colour": member.colour } as CSSProperties}>{member.initials}</span>
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
        <div className="profile-sheet__section">
          <h3><Hand size={18} /> Recent high fives</h3>
          {received.length ? received.map((highFive) => {
            const sender = state.household.members.find((candidate) => candidate.id === highFive.fromMemberId);
            return <p key={highFive.id}>{sender?.displayName ?? "Someone"} noticed {member.displayName}.</p>;
          }) : <p>No high fives yet. Kindness does not need points to count.</p>}
        </div>
        <button className="profile-sheet__sound" type="button" onClick={onToggleSound}>
          {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          Celebration sound {soundOn ? "on" : "off"}
        </button>
      </section>
    </div>
  );
}
