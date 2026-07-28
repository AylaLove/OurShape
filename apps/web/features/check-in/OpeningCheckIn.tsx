import { CircleCheck, Gift, HeartHandshake, Sparkles, X } from "lucide-react";
import type { GameState, HouseholdMember } from "@family-game/domain";
import type { AppScreen } from "@/components/AppNav";
import { openingCheckInItems } from "./opening-check-in";

const ICONS = {
  points: Sparkles,
  thanks: CircleCheck,
  repair: HeartHandshake,
  treasure: Gift,
};

export function OpeningCheckIn({
  state,
  activeMember,
  onClose,
  onOpen,
}: {
  state: GameState;
  activeMember: HouseholdMember;
  onClose: () => void;
  onOpen: (screen: AppScreen) => void;
}) {
  const items = openingCheckInItems(state, activeMember);
  return (
    <div className="opening-check-in-backdrop" role="presentation" onClick={onClose}>
      <section
        className="opening-check-in"
        role="dialog"
        aria-modal="true"
        aria-label={`Welcome back, ${activeMember.displayName}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="opening-check-in__heading">
          <div><p className="eyebrow">WELCOME BACK, {activeMember.displayName.toUpperCase()}</p><h2>A quick update from home</h2></div>
          <button type="button" onClick={onClose} aria-label="Dismiss welcome check-in"><X size={18} /></button>
        </div>
        <div className="opening-check-in__items">
          {items.map((item) => {
            const Icon = ICONS[item.id];
            return (
              <button
                key={item.id}
                type="button"
                disabled={!item.destination}
                onClick={() => item.destination && onOpen(item.destination)}
              >
                <Icon size={20} aria-hidden="true" />
                <span><strong>{item.value}</strong><small>{item.label}</small></span>
              </button>
            );
          })}
        </div>
        <button className="opening-check-in__continue" type="button" onClick={onClose}>See our home</button>
      </section>
    </div>
  );
}
