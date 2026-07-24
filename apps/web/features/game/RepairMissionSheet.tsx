"use client";

import type { HouseholdMember } from "@family-game/domain";
import { HeartHandshake, X } from "lucide-react";
import { useMemo, useState } from "react";

export interface RepairMissionInput {
  targetMemberId: string;
  title: string;
  instruction: string;
}

const PRESETS = [
  {
    title: "Finish what we agreed",
    instruction: "Complete the responsibility we agreed on, then ask someone to check.",
  },
  {
    title: "Restore the space",
    instruction: "Put the space back in order, then ask someone to check it with you.",
  },
  {
    title: "Repair a hurt",
    instruction: "Listen, apologise honestly, and ask what small action would help repair the hurt.",
  },
];

export function RepairMissionSheet({
  members,
  onClose,
  onAdd,
}: {
  members: HouseholdMember[];
  onClose: () => void;
  onAdd: (mission: RepairMissionInput) => void;
}) {
  const defaultTarget = useMemo(
    () => members.find((member) => member.role === "child")?.id ?? members[0]?.id ?? "",
    [members],
  );
  const [targetMemberId, setTargetMemberId] = useState(defaultTarget);
  const [title, setTitle] = useState(PRESETS[0].title);
  const [instruction, setInstruction] = useState(PRESETS[0].instruction);
  const valid = Boolean(targetMemberId && title.trim() && instruction.trim());

  return (
    <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="quick-sheet repair-sheet" role="dialog" aria-modal="true" aria-labelledby="repair-mission-title">
        <header>
          <div>
            <p className="eyebrow">REPAIR MISSION</p>
            <h2 id="repair-mission-title">What would make this right?</h2>
          </div>
          <button className="round-button round-button--plain" type="button" onClick={onClose} aria-label="Close Repair Mission"><X size={20} /></button>
        </header>

        <p className="repair-sheet__intro">Earned points stay safe. Treasure waits until the repair is completed and acknowledged by someone else.</p>

        <div className="repair-sheet__presets" aria-label="Repair Mission ideas">
          {PRESETS.map((preset) => (
            <button
              className={title === preset.title ? "repair-preset repair-preset--selected" : "repair-preset"}
              type="button"
              key={preset.title}
              onClick={() => {
                setTitle(preset.title);
                setInstruction(preset.instruction);
              }}
            >
              {preset.title}
            </button>
          ))}
        </div>

        <label className="form-field">
          <span>Who needs to make it right?</span>
          <select value={targetMemberId} onChange={(event) => setTargetMemberId(event.target.value)}>
            {members.map((member) => <option value={member.id} key={member.id}>{member.displayName}</option>)}
          </select>
        </label>

        <label className="form-field">
          <span>Mission name</span>
          <input maxLength={80} value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>

        <label className="form-field">
          <span>What needs to happen?</span>
          <textarea maxLength={240} rows={3} value={instruction} onChange={(event) => setInstruction(event.target.value)} />
        </label>

        <button
          className="primary-button primary-button--repair"
          type="button"
          disabled={!valid}
          onClick={() => onAdd({ targetMemberId, title, instruction })}
        >
          <HeartHandshake size={21} aria-hidden="true" />
          Set Repair Mission
        </button>
      </section>
    </div>
  );
}
