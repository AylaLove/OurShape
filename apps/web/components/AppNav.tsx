import { Gift, Hand, Home, ListTodo, Users } from "lucide-react";

export type AppScreen = "today" | "help" | "quests" | "thanks" | "rewards" | "family";

const items: Array<{ id: AppScreen; label: string; icon: typeof Home }> = [
  { id: "today", label: "Today", icon: Home },
  { id: "quests", label: "Quests", icon: ListTodo },
  { id: "thanks", label: "Thanks", icon: Hand },
  { id: "rewards", label: "Rewards", icon: Gift },
  { id: "family", label: "Family", icon: Users },
];

const childItems: typeof items = [
  { id: "today", label: "Home", icon: Home },
  { id: "quests", label: "Quests", icon: ListTodo },
  { id: "thanks", label: "Thanks", icon: Hand },
  { id: "rewards", label: "Treasure", icon: Gift },
];

export function AppNav({ active, onChange, childView = false }: { active: AppScreen; onChange: (section: AppScreen) => void; childView?: boolean }) {
  const visibleItems = childView ? childItems : items;
  return (
    <nav className={childView ? "app-nav app-nav--child" : "app-nav"} aria-label="Main navigation">
      {visibleItems.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button className={isActive ? "app-nav__item app-nav__item--active" : "app-nav__item"} key={id} type="button" onClick={() => onChange(id)} aria-current={isActive ? "page" : undefined}>
            <Icon size={21} strokeWidth={isActive ? 2.2 : 1.7} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
