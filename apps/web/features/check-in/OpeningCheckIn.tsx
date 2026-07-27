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
    <section className="opening-check-in" aria-label={`Welcome back, ${activeMember.displayName}`}>
      <div className="opening-check-in__heading">
        <div><p className="eyebrow">WELCOME BACK</p><h2>Here is what matters now</h2></div>
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
    </section>
  );
}
