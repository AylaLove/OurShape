import { Gift, Hand, Home, Users } from "lucide-react";

export type AppSection = "today" | "thanks" | "rewards" | "family";

const items: Array<{ id: AppSection; label: string; icon: typeof Home }> = [
  { id: "today", label: "Today", icon: Home },
  { id: "thanks", label: "Thanks", icon: Hand },
  { id: "rewards", label: "Rewards", icon: Gift },
  { id: "family", label: "Family", icon: Users },
];

export function AppNav({ active, onChange }: { active: AppSection; onChange: (section: AppSection) => void }) {
  return (
    <nav className="app-nav" aria-label="Main navigation">
      {items.map(({ id, label, icon: Icon }) => (
        <button className={active === id ? "app-nav__item app-nav__item--active" : "app-nav__item"} key={id} type="button" onClick={() => onChange(id)} aria-current={active === id ? "page" : undefined}>
          <Icon size={21} strokeWidth={active === id ? 2.2 : 1.7} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
