"use client";

import type {
  CapacityContext,
  DailyCapacity,
  DailyPlan,
  DailyQuest,
  HouseholdMember,
} from "@family-game/domain";
import { Check, LockKeyhole, Moon, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { moonPhaseForDate } from "@/features/rhythms/moon-phase";

const CAPACITY_OPTIONS: Array<{ id: DailyCapacity; title: string; hint: string }> = [
  { id: "rest", title: "Rest", hint: "Only essentials" },
  { id: "gentle", title: "Gentle", hint: "One small thing" },
  { id: "steady", title: "Steady", hint: "A normal day" },
  { id: "plenty", title: "Plenty", hint: "I can carry more" },
];

type CyclePhase = "menstrual" | "follicular" | "ovulatory" | "luteal";

function estimatedCyclePhase(periodStart: string, cycleLength: number, periodLength: number, today: string): CyclePhase | null {
  if (!periodStart) return null;
  const start = new Date(`${periodStart}T12:00:00`);
  const current = new Date(`${today}T12:00:00`);
  if (Number.isNaN(start.getTime()) || current < start) return null;
  const elapsed = Math.floor((current.getTime() - start.getTime()) / 86_400_000);
  const cycleDay = elapsed % cycleLength;
  if (cycleDay < periodLength) return "menstrual";
  const ovulationDay = Math.max(periodLength + 1, cycleLength - 14);
  if (Math.abs(cycleDay - ovulationDay) <= 1) return "ovulatory";
  if (cycleDay < ovulationDay) return "follicular";
  return "luteal";
}

function contextFor(shareCycleSupport: boolean, phase: CyclePhase | null): CapacityContext {
  if (!shareCycleSupport) return "private";
  if (phase === "menstrual") return "menstrual_support";
  if (phase === "luteal") return "luteal_support";
  return "cycle_support";
}

export function DailyPlanSheet({
  member,
  quests,
  plan,
  today,
  onSave,
  onClose,
}: {
  member: HouseholdMember;
  quests: DailyQuest[];
  plan: DailyPlan | null;
  today: string;
  onSave: (input: Pick<DailyPlan, "capacity" | "capacityContext" | "intentionQuestIds">) => void;
  onClose: () => void;
}) {
  const [capacity, setCapacity] = useState<DailyCapacity>(plan?.capacity ?? "steady");
  const [intentions, setIntentions] = useState<string[]>(plan?.intentionQuestIds ?? []);
  const [periodStart, setPeriodStart] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [shareCycleSupport, setShareCycleSupport] = useState(plan ? plan.capacityContext !== "private" : false);
  const phase = useMemo(
    () => estimatedCyclePhase(periodStart, cycleLength, periodLength, today),
    [periodStart, cycleLength, periodLength, today],
  );
  const moon = moonPhaseForDate(new Date(`${today}T12:00:00`));
  const available = quests.filter((quest) => (
    !["completed", "cancelled", "pending_endorsement"].includes(quest.state)
    && (quest.kind !== "repair" || quest.suggestedMemberIds.includes(member.id))
  ));

  function toggleIntention(questId: string) {
    setIntentions((current) => current.includes(questId)
      ? current.filter((id) => id !== questId)
      : current.length < 3 ? [...current, questId] : current);
  }

  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <section className="daily-plan-sheet" role="dialog" aria-modal="true" aria-labelledby="daily-plan-title" onClick={(event) => event.stopPropagation()}>
        <button className="profile-sheet__close" type="button" onClick={onClose} aria-label="Close today’s plan"><X size={20} /></button>
        <header>
          <p className="eyebrow">TODAY · {member.displayName.toUpperCase()}</p>
          <h2 id="daily-plan-title">Capacity and intentions</h2>
          <p>Choose what feels honest today. This is context, not a score.</p>
        </header>

        <div className="daily-plan-sheet__moon" aria-label={`${moon.name}, approximately ${moon.illumination} percent illuminated`}>
          <span aria-hidden="true">{moon.symbol}</span>
          <div><small>MOON PHASE</small><strong>{moon.name}</strong></div>
        </div>

        <fieldset className="daily-plan-sheet__fieldset">
          <legend>How much can I carry?</legend>
          <div className="capacity-options">
            {CAPACITY_OPTIONS.map((option) => (
              <button className={capacity === option.id ? "capacity-option capacity-option--selected" : "capacity-option"} type="button" key={option.id} onClick={() => setCapacity(option.id)}>
                <strong>{option.title}</strong><small>{option.hint}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="daily-plan-sheet__fieldset">
          <legend>What do I intend to help with? <small>{intentions.length}/3</small></legend>
          <div className="intention-options">
            {available.map((quest) => {
              const selected = intentions.includes(quest.id);
              return (
                <button className={selected ? "intention-option intention-option--selected" : "intention-option"} type="button" key={quest.id} onClick={() => toggleIntention(quest.id)} aria-pressed={selected}>
                  <span>{selected ? <Check size={16} /> : null}</span><strong>{quest.title}</strong><small>+{quest.appreciationValue}</small>
                </button>
              );
            })}
          </div>
        </fieldset>

        {member.role === "adult" ? (
          <details className="cycle-privacy">
            <summary><Moon size={17} /> Optional private cycle support</summary>
            <p><LockKeyhole size={14} /> Your period date is used only inside this open form. It is not added to the shared household state.</p>
            <label>Most recent period started<input type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} /></label>
            <div className="cycle-privacy__numbers">
              <label>Typical cycle<input type="number" min="21" max="40" value={cycleLength} onChange={(event) => setCycleLength(Math.min(40, Math.max(21, Number(event.target.value))))} /></label>
              <label>Period length<input type="number" min="2" max="10" value={periodLength} onChange={(event) => setPeriodLength(Math.min(10, Math.max(2, Number(event.target.value))))} /></label>
            </div>
            {phase ? <p className="cycle-privacy__estimate">Estimated phase: <strong>{phase}</strong>. Bodies vary; you choose today’s capacity.</p> : null}
            <label className="cycle-privacy__share">
              <input type="checkbox" checked={shareCycleSupport} onChange={(event) => setShareCycleSupport(event.target.checked)} />
              Share a simple cycle-support cue with my household
            </label>
          </details>
        ) : null}

        <button className="daily-plan-sheet__save" type="button" onClick={() => onSave({
          capacity,
          capacityContext: contextFor(shareCycleSupport, phase),
          intentionQuestIds: intentions,
        })}><Sparkles size={18} /> Set today’s plan</button>
      </section>
    </div>
  );
}
