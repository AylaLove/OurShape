import { CircleCheck, Gift, HeartHandshake, X } from "lucide-react";
import type { GameState, HouseholdMember } from "@family-game/domain";
import type { AppScreen } from "@/components/AppNav";
import { openingCheckInItems } from "./opening-check-in";

const ICONS = {
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
  if (!items.length) return null;
  const title = items.some((item) => item.id === "thanks")
    ? "Someone needs your thanks"
    : items.some((item) => item.id === "repair")
      ? "A repair is waiting"
      : "Treasure is waiting";

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
          <div><p className="eyebrow">{activeMember.displayName.toUpperCase()}</p><h2>{title}</h2></div>
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
        <button className="opening-check-in__continue" type="button" onClick={onClose}>SEE OUR HOME</button>
      </section>
    </div>
  );
}
