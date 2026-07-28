export interface MoonPhase {
  name: string;
  symbol: string;
  illumination: number;
}

const SYNODIC_MONTH = 29.53058867;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

export function moonPhaseForDate(date: Date): MoonPhase {
  const days = (date.getTime() - KNOWN_NEW_MOON) / 86_400_000;
  const age = ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const fraction = age / SYNODIC_MONTH;
  const illumination = Math.round(((1 - Math.cos(2 * Math.PI * fraction)) / 2) * 100);

  if (fraction < 0.0625 || fraction >= 0.9375) return { name: "New moon", symbol: "●", illumination };
  if (fraction < 0.1875) return { name: "Waxing crescent", symbol: "◔", illumination };
  if (fraction < 0.3125) return { name: "First quarter", symbol: "◐", illumination };
  if (fraction < 0.4375) return { name: "Waxing gibbous", symbol: "◕", illumination };
  if (fraction < 0.5625) return { name: "Full moon", symbol: "○", illumination };
  if (fraction < 0.6875) return { name: "Waning gibbous", symbol: "◕", illumination };
  if (fraction < 0.8125) return { name: "Last quarter", symbol: "◑", illumination };
  return { name: "Waning crescent", symbol: "◔", illumination };
}
