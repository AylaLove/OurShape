import type { Household } from "@family-game/domain";

export const DEMO_HOUSEHOLD: Household = {
  id: "demo-household",
  name: "Our Home",
  timezone: "Africa/Johannesburg",
  quietHoursStart: "20:00",
  quietHoursEnd: "07:00",
  members: [
    {
      id: "demo-ayla",
      householdId: "demo-household",
      displayName: "Ayla",
      initials: "A",
      role: "adult",
      colour: "#ee6c58",
      pointLabel: "Chill Points",
      contributionTarget: 10,
    },
    {
      id: "demo-partner",
      householdId: "demo-household",
      displayName: "Raen",
      initials: "R",
      role: "adult",
      colour: "#2b78a0",
      pointLabel: "Chill Points",
      contributionTarget: 10,
    },
    {
      id: "demo-child",
      householdId: "demo-household",
      displayName: "Sage",
      initials: "S",
      role: "child",
      colour: "#e4a72e",
      pointLabel: "Watch Points",
      contributionTarget: 4,
    },
  ],
};
