
export type Achievement = {
    id: number;
    name: string;
    icon: string;
    description: string;
    condition: (userData: {
      xp: number;
      streak: number;
      calories: number;
      workouts: any[];
    }) => boolean;
  };
  
  export const achievementList: Achievement[] = [
    {
      id: 1,
      name: 'Streak Master',
      icon: '🔥',
      description: '7-Day Workout Streak',
      condition: ({ streak }) => streak >= 7,
    },
    {
      id: 2,
      name: 'Strength Pro',
      icon: '🏋️',
      description: 'Completed 10 Strength Workouts',
      condition: ({ workouts }) =>
        workouts.filter((w) => w.category === 'anaerobic').length >= 10,
    },
    {
      id: 3,
      name: 'Calorie Burner',
      icon: '💯',
      description: 'Burned 1000+ Calories',
      condition: ({ calories }) => calories >= 1000,
    },
    {
      id: 4,
      name: 'XP Climber',
      icon: '⭐',
      description: 'Earned over 2500 XP',
      condition: ({ xp }) => xp >= 2500,
    },
  ];
  