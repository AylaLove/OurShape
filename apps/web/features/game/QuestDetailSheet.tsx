"use client";

import type { DailyQuest, HouseholdMember } from "@family-game/domain";
import { BookOpen, Flower2, Home, Shirt, Sparkles, Trees, Utensils, Volume2, X } from "lucide-react";
import type { CSSProperties } from "react";
import { HoldToFinishButton } from "./HoldToFinishButton";
import { HomeDinosaur } from "@/features/companion/HomeDinosaur";
import { dinosaurStateForQuest } from "@/features/companion/companion-state";
import { useState } from "react";

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
  onThank: (note: string | null) => void;
  onNeedsMore: () => void;
}) {
  const Icon = ICONS[quest.icon];
  const participants = members.filter((member) => quest.participantIds.includes(member.id));
  const activeJoined = quest.participantIds.includes(activeMember.id);
  const canThank = quest.state === "pending_endorsement" && !activeJoined;
  const childView = activeMember.role === "child";
  const [thanksNote, setThanksNote] = useState<string | null>(null);
  const phase = questPhase(quest, activeJoined, canThank);

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(quest.spokenInstruction));
  }

  function tap(pattern: number | number[]) {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  }

  return (
    <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={childView ? "quest-sheet quest-sheet--child" : "quest-sheet"} role="dialog" aria-modal="true" aria-labelledby="quest-sheet-title">
        <header className="quest-sheet__header">
          <p className="quest-sheet__phase">{phase}</p>
          <button className="round-button round-button--plain" type="button" onClick={onClose} aria-label="Close quest"><X size={20} /></button>
        </header>
        <div className="quest-sheet__scene" data-quest-state={quest.state}>
          <div className="quest-sheet__icon"><Icon size={childView ? 48 : 34} strokeWidth={1.6} /></div>
          {quest.state === "pending_endorsement" ? <span className="quest-sheet__energy" aria-label="Effort waiting for thanks" /> : null}
          <HomeDinosaur state={dinosaurStateForQuest(quest)} size={childView ? "large" : "medium"} />
        </div>
        {!childView ? <p className="eyebrow">{quest.kind.replace("_", " ")} quest</p> : null}
        <h2 id="quest-sheet-title">{quest.title}</h2>
        <div className="quest-sheet__instruction">
          <p>{quest.instruction}</p>
          <button className={childView ? "listen-button" : "round-button round-button--plain"} type="button" onClick={speak} aria-label="Read quest aloud" title="Read aloud">
            <Volume2 size={20} /><span>{childView ? "Hear it" : ""}</span>
          </button>
        </div>

        <div className={childView ? "quest-sheet__people quest-sheet__people--child" : "quest-sheet__people"} aria-label="Quest participants">
          {childView ? (
            <>
              <div className="quest-sheet__team">
                {participants.map((member) => (
                  <span className="quest-sheet__team-avatar" key={member.id} style={{ "--member-colour": member.colour } as CSSProperties}>{member.initials}</span>
                ))}
              </div>
              <p>{participants.length ? `${participants.map((member) => member.displayName).join(" + ")} ${participants.length > 1 ? "are" : "is"} helping` : "Who will help?"}</p>
            </>
          ) : members.map((member) => {
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
            <button className="primary-button" type="button" onClick={() => {
              tap(22);
              onJoin();
            }}>{childView ? "I'll help!" : "Join this quest"}</button>
          ) : null}
          {(["needed", "active"].includes(quest.state) && activeJoined) ? <HoldToFinishButton onFinish={() => {
            tap([30, 35, 50]);
            onFinish();
          }} /> : null}
          {quest.state === "pending_endorsement" && activeJoined ? (
            <p className="waiting-message"><Sparkles size={20} /> {childView ? "Your effort is safe. Someone else will send thanks." : "Waiting for another family member to send thanks."}</p>
          ) : null}
          {canThank ? (
            <>
              <div className="thanks-phrases" aria-label="Choose a thank-you message">
                {["That helped us!", "I noticed your effort", "Great teamwork"].map((phrase) => (
                  <button className={thanksNote === phrase ? "thanks-phrase thanks-phrase--selected" : "thanks-phrase"} type="button" key={phrase} onClick={() => setThanksNote(phrase)}>
                    {phrase}
                  </button>
                ))}
              </div>
              <button className="primary-button primary-button--thanks" type="button" onClick={() => {
                tap([20, 30, 60]);
                onThank(thanksNote);
              }}>Send thanks</button>
              <button className="text-button" type="button" onClick={onNeedsMore}>Needs one small finishing touch</button>
            </>
          ) : null}
          {quest.state === "completed" ? <p className="complete-message"><CheckMark /> Complete and appreciated.</p> : null}
        </div>
        <footer className="quest-sheet__reward">
          {childView ? <><strong>+{quest.appreciationValue}</strong> {activeMember.pointLabel} after someone sends thanks</> : <>Everyone who helps earns <strong>+{quest.appreciationValue}</strong> appreciation.</>}
        </footer>
      </section>
    </div>
  );
}

function questPhase(quest: DailyQuest, activeJoined: boolean, canThank: boolean) {
  if (quest.state === "completed") return "The home remembers";
  if (canThank) return "They helped the home";
  if (quest.state === "pending_endorsement") return "Waiting for thanks";
  if (quest.state === "active" && activeJoined) return "Let's do it";
  if (quest.state === "active") return "Join the team";
  return "The home needs help";
}

function CheckMark() {
  return <span className="check-mark" aria-hidden="true">✓</span>;
}
