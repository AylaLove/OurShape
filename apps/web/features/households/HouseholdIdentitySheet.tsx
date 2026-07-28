"use client";

import type { Household, MemberSymbol } from "@family-game/domain";
import { Check, X } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { MEMBER_SYMBOL_OPTIONS, MemberMark } from "@/features/profiles/MemberMark";

export interface HouseholdIdentityInput {
  name: string;
  motto: string;
  symbols: Record<string, MemberSymbol>;
}

export function HouseholdIdentitySheet({
  household,
  onSave,
  onClose,
}: {
  household: Household;
  onSave: (input: HouseholdIdentityInput) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(household.name);
  const [motto, setMotto] = useState(household.motto ?? "");
  const [symbols, setSymbols] = useState<Record<string, MemberSymbol>>(
    Object.fromEntries(household.members.map((member) => [member.id, member.symbol ?? "star"])),
  );

  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <section className="identity-sheet" role="dialog" aria-modal="true" aria-labelledby="identity-sheet-title" onClick={(event) => event.stopPropagation()}>
        <header>
          <div><p className="eyebrow">HOUSEHOLD IDENTITY</p><h2 id="identity-sheet-title">Make this home yours</h2></div>
          <button type="button" onClick={onClose} aria-label="Close household editor"><X size={20} /></button>
        </header>

        <label>
          <span>Household name</span>
          <input value={name} maxLength={40} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          <span>Family phrase</span>
          <input value={motto} maxLength={90} onChange={(event) => setMotto(event.target.value)} />
          <small>Short, warm, and true enough to see every day.</small>
        </label>

        <div className="identity-sheet__members">
          <h3>Choose each person’s symbol</h3>
          {household.members.map((member) => (
            <fieldset key={member.id}>
              <legend>{member.displayName}</legend>
              <div>
                {MEMBER_SYMBOL_OPTIONS.map((symbol) => {
                  const selected = symbols[member.id] === symbol;
                  return (
                    <button
                      type="button"
                      className={selected ? "identity-symbol identity-symbol--selected" : "identity-symbol"}
                      key={symbol}
                      onClick={() => setSymbols((current) => ({ ...current, [member.id]: symbol }))}
                      aria-label={`${symbol} for ${member.displayName}`}
                      aria-pressed={selected}
                      style={{ "--member-colour": member.colour } as CSSProperties}
                    >
                      <MemberMark symbol={symbol} initials={member.initials} size={21} />
                      {selected ? <Check size={12} /> : null}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <p className="identity-sheet__demo-note">Demo preview: these choices reset when the page refreshes.</p>
        <button
          className="identity-sheet__save"
          type="button"
          disabled={!name.trim() || !motto.trim()}
          onClick={() => onSave({ name: name.trim(), motto: motto.trim(), symbols })}
        >
          Save our shape
        </button>
      </section>
    </div>
  );
}
