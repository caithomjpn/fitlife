import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { achievementList } from '../constants/achievements';
import { useTheme } from './context/ThemeContext';
import { getColors } from '../constants/colors';

type Props = {
  xp: number;
  streak: number;
  calories: number;
  workouts: any[];
};

export default function AchievementList({ xp, streak, calories, workouts }: Props) {
  const { theme } = useTheme();
  const Colors = getColors(theme);

  const unlocked = achievementList.filter((a) =>
    a.condition({ xp, streak, calories, workouts })
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <Text style={[styles.title, { color: Colors.primary }]}>🏆 Achievements</Text>

      {unlocked.length === 0 ? (
        <Text style={[styles.placeholder, { color: Colors.textDark }]}>
          No achievements yet. Keep going!
        </Text>
      ) : (
        unlocked.map((a) => (
          <View key={a.id} style={styles.item}>
            <Text style={[styles.name, { color: Colors.accent }]}>
              {a.icon} {a.name}
            </Text>
            <Text style={[styles.desc, { color: Colors.textDark }]}>{a.description}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  placeholder: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  item: {
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 14,
  },
});
