"use client";

import type { DailyQuest, HouseholdMember } from "@family-game/domain";
import { BookOpen, Flower2, Home, Shirt, Sparkles, Trees, Utensils, Volume2, X } from "lucide-react";
import type { CSSProperties } from "react";
import { HoldToFinishButton } from "./HoldToFinishButton";

const ICONS = { dishes: Utensils, laundry: Shirt, book: BookOpen, plant: Flower2, home: Home, wood: Trees, sparkle: Sparkles };

export function QuestDetailSheet({
  quest,
  members,
  activeMember,
  onClose,
  onJoin,
  onFinish,
  onThank,
  onNeedsMore,
}: {
  quest: DailyQuest;
  members: HouseholdMember[];
  activeMember: HouseholdMember;
  onClose: () => void;
  onJoin: () => void;
  onFinish: () => void;
  onThank: () => void;
  onNeedsMore: () => void;
}) {
  const Icon = ICONS[quest.icon];
  const participants = members.filter((member) => quest.participantIds.includes(member.id));
  const activeJoined = quest.participantIds.includes(activeMember.id);
  const canThank = quest.state === "pending_endorsement" && !activeJoined;

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(quest.spokenInstruction));
  }

  return (
    <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="quest-sheet" role="dialog" aria-modal="true" aria-labelledby="quest-sheet-title">
        <header className="quest-sheet__header">
          <div className="quest-sheet__icon"><Icon size={30} strokeWidth={1.7} /></div>
          <button className="round-button round-button--plain" type="button" onClick={onClose} aria-label="Close quest"><X size={20} /></button>
        </header>
        <p className="eyebrow">{quest.kind.replace("_", " ")} quest</p>
        <h2 id="quest-sheet-title">{quest.title}</h2>
        <div className="quest-sheet__instruction">
          <p>{quest.instruction}</p>
          <button className="round-button round-button--plain" type="button" onClick={speak} aria-label="Read quest aloud" title="Read aloud"><Volume2 size={20} /></button>
        </div>

        <div className="quest-sheet__people" aria-label="Quest participants">
          {members.map((member) => {
            const joined = quest.participantIds.includes(member.id);
            return (
              <span className={joined ? "person-chip person-chip--joined" : "person-chip"} key={member.id} style={{ "--member-colour": member.colour } as CSSProperties}>
                <span>{member.initials}</span>{member.displayName}{joined ? " joined" : ""}
              </span>
            );
          })}
        </div>

        <div className="quest-sheet__actions">
          {(["needed", "active"].includes(quest.state) && !activeJoined) ? (
            <button className="primary-button" type="button" onClick={onJoin}>Join this quest</button>
          ) : null}
          {(["needed", "active"].includes(quest.state) && activeJoined) ? <HoldToFinishButton onFinish={onFinish} /> : null}
          {quest.state === "pending_endorsement" && activeJoined ? (
            <p className="waiting-message"><Sparkles size={20} /> Waiting for another family member to send thanks.</p>
          ) : null}
          {canThank ? (
            <>
              <button className="primary-button primary-button--thanks" type="button" onClick={onThank}>I saw it. Thank you!</button>
              <button className="text-button" type="button" onClick={onNeedsMore}>Needs one small finishing touch</button>
            </>
          ) : null}
          {quest.state === "completed" ? <p className="complete-message"><CheckMark /> Complete and appreciated.</p> : null}
        </div>
        <footer className="quest-sheet__reward">Everyone who helps earns <strong>+{quest.appreciationValue}</strong> appreciation.</footer>
      </section>
    </div>
  );
}

function CheckMark() {
  return <span className="check-mark" aria-hidden="true">✓</span>;
}
