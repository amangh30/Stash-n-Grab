// Define your achievement criteria here
export const ACHIEVEMENT_LIST = [
  {
    id: "First Step",
    description: "Earned 50 XP",
    check: (user: any, stats: any) => user.xp >= 50,
  },
  {
    id: "Consistent Learner",
    description: "Completed 5 resources",
    check: (user: any, stats: any) => stats.completedCount >= 5,
  },
  {
    id: "On Fire",
    description: "3 Day Streak",
    check: (user: any, stats: any) => user.streak >= 3,
  },
  {
    id: "Level Up Pro",
    description: "Reached Level 5",
    check: (user: any, stats: any) => user.level >= 5,
  },
];

export async function checkAchievements(user: any, completedCount: number) {
  const currentAchievements = new Set(user.achievements || []);
  const newlyUnlocked: string[] = [];

  for (const ach of ACHIEVEMENT_LIST) {
    // If they don't have it yet, check if they earned it
    if (!currentAchievements.has(ach.id)) {
      if (ach.check(user, { completedCount })) {
        newlyUnlocked.push(ach.id);
        user.achievements.push(ach.id);
      }
    }
  }

  return newlyUnlocked; // Return only what was JUST earned for the UI
}