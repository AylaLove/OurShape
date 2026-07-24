export interface HomeGoal {
  id: string;
  title: string;
  targetEnergy: number;
  icon: "movie";
}

export const DEMO_HOME_GOAL: HomeGoal = {
  id: "demo-family-movie-night",
  title: "Family movie night",
  targetEnergy: 5,
  icon: "movie",
};

export function homeGoalProgress(goal: HomeGoal, energy: number) {
  const safeTarget = Math.max(1, goal.targetEnergy);
  const current = Math.max(0, energy);

  return {
    current,
    target: safeTarget,
    percentage: Math.min(100, (current / safeTarget) * 100),
    unlocked: current >= safeTarget,
  };
}
