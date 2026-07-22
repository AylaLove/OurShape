import { Gift, Hand, Home, Users } from "lucide-react";

const items = [
  { label: "Today", icon: Home, active: true },
  { label: "Thanks", icon: Hand, active: false },
  { label: "Rewards", icon: Gift, active: false },
  { label: "Family", icon: Users, active: false },
];

export function AppNav() {
  return (
    <nav className="app-nav" aria-label="Main navigation">
      {items.map(({ label, icon: Icon, active }) => (
        <span className={active ? "app-nav__item app-nav__item--active" : "app-nav__item"} key={label} aria-current={active ? "page" : undefined}>
          <Icon size={21} strokeWidth={active ? 2.2 : 1.7} />
          <span>{label}</span>
        </span>
      ))}
    </nav>
  );
}

