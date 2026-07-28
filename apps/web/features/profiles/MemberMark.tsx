import type { MemberSymbol } from "@family-game/domain";
import { Flame, Leaf, Moon, Mountain, Star, Sun } from "lucide-react";

const SYMBOLS = {
  sun: Sun,
  moon: Moon,
  star: Star,
  leaf: Leaf,
  flame: Flame,
  mountain: Mountain,
} satisfies Record<MemberSymbol, typeof Sun>;

export const MEMBER_SYMBOL_OPTIONS = Object.keys(SYMBOLS) as MemberSymbol[];

export function MemberMark({
  symbol,
  initials,
  size = 20,
}: {
  symbol?: MemberSymbol;
  initials: string;
  size?: number;
}) {
  if (!symbol) return <>{initials}</>;
  const Icon = SYMBOLS[symbol];
  return <Icon size={size} strokeWidth={2.1} aria-hidden="true" />;
}
