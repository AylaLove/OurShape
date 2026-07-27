"use client";

import { Hand, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { pointBalance, type GameState, type HouseholdMember } from "@family-game/domain";
import type { CSSProperties } from "react";

export function ProfileSheet({
  state,
  member,
  soundOn,
  onToggleSound,
  onClose,
}: {
  state: GameState;
  member: HouseholdMember;
  soundOn: boolean;
  onToggleSound: () => void;
  onClose: () => void;
}) {
  const received = state.highFives.filter((highFive) => highFive.toMemberId === member.id).slice(-3).reverse();
  const balance = pointBalance(state, member.id);

  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <section className="profile-sheet" role="dialog" aria-modal="true" aria-labelledby="profile-sheet-title" onClick={(event) => event.stopPropagation()}>
        <button className="profile-sheet__close" type="button" onClick={onClose} aria-label="Close profile"><X size={20} /></button>
        <span className="profile-sheet__avatar" style={{ "--member-colour": member.colour } as CSSProperties}>{member.initials}</span>
        <p className="eyebrow">{member.role === "child" ? "HOUSE HELPER" : "FAMILY MEMBER"}</p>
        <h2 id="profile-sheet-title">{member.displayName}</h2>
        <div className="profile-sheet__balance"><Sparkles size={21} /><strong>{balance}</strong><span>{member.pointLabel}</span></div>
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
