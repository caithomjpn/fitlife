import React, { useState, useCallback } from 'react';
import { LineChart } from 'react-native-chart-kit';

import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '../components/Layout';
import { useTheme } from '../components/context/ThemeContext';
import { getColors } from '../constants/colors';

export default function Progress() {
  const { theme } = useTheme();
  const Colors = getColors(theme);

  const [totalCalories, setTotalCalories] = useState(0);
  const [xp, setXp] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [goalStats, setGoalStats] = useState({ completed: 0, total: 0 });
  const [workoutChartData, setWorkoutChartData] = useState<{ x: string, y: number }[]>([]);

 useFocusEffect(
  useCallback(() => {
    const fetchData = async () => {
      console.time("🔥 Total fetchData");

      const user = auth.currentUser;
      if (!user) return;

      console.time("📥 Firestore: get user doc");
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      console.timeEnd("📥 Firestore: get user doc");

      if (!docSnap.exists()) return;
      const data = docSnap.data();

      console.time("💾 setState: XP/Streak");
      setXp(data.xp || 0);
      setCurrentStreak(data.streak || 0);
      setBestStreak(data.bestStreak || 0);
      console.timeEnd("💾 setState: XP/Streak");

      console.time("🔥 Calculate Total Calories");
      const workouts = data.workouts || [];
      const total = workouts.reduce((sum: number, w: any) => sum + (w.calories || 0), 0);
      setTotalCalories(total);
      console.timeEnd("🔥 Calculate Total Calories");

      console.time("🎯 Goal stats");
      const goals = data.goals || [];
      const completed = goals.filter((g: any) => g.completed).length;
      setGoalStats({ completed, total: goals.length });
      console.timeEnd("🎯 Goal stats");

      console.time("📊 Chart Data Prep");
      const caloriesByDate: { [date: string]: number } = {};
      workouts.forEach((w: any) => {
        if (!w.loggedAt) return;
        const raw = Number(w.calories);
        const calories = (Number.isFinite(raw) && !isNaN(raw)) ? Math.min(raw, 1000) : 0;
        if (!caloriesByDate[w.loggedAt]) {
          caloriesByDate[w.loggedAt] = 0;
        }
        caloriesByDate[w.loggedAt] += calories;
      });

      const sortedDates = Object.keys(caloriesByDate).sort();
      const chartData = sortedDates.map((date) => {
        const y = Math.round(caloriesByDate[date]);
        return { x: date, y: Number.isFinite(y) ? y : 0 };
      }).filter(point => Number.isFinite(point.y));
      const paddedChartData = [{ x: '', y: 0 }, ...chartData];
      setWorkoutChartData(paddedChartData);
      console.timeEnd("📊 Chart Data Prep");

      console.timeEnd("🔥 Total fetchData");
    };

    fetchData();
  }, [])
);
const visibleLabels = workoutChartData.map((d, i, arr) => {
  if (!d.x || isNaN(new Date(d.x).getTime())) return ''; 
  const date = new Date(d.x);
  const formatted = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

  if (arr.length <= 5) {
    return formatted; 
  } else {
    return i === arr.length - 1 ? formatted : ''; 
  }
});

  return (
    <Layout>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: Colors.background }]}>
        <Text style={[styles.title, { color: Colors.primary }]}>📈 Your Fitness Progress</Text>

        <Text style={[styles.stat, { color: Colors.textDark }]}>🔥 Total Calories Burned: {totalCalories} kcal</Text>
        <Text style={[styles.stat, { color: Colors.textDark }]}>⭐ XP Earned: {xp}</Text>
        <Text style={[styles.stat, { color: Colors.textDark }]}>🔥 Current Streak: {currentStreak} days</Text>
        <Text style={[styles.stat, { color: Colors.textDark }]}>🏆 Best Streak: {bestStreak} days</Text>
        <Text style={[styles.stat, { color: Colors.textDark }]}>🎯 Goals Completed: {goalStats.completed} / {goalStats.total}</Text>
<Text style={[styles.chartLabel, { color: Colors.primary }]}>
  📊 Total Calories Burned Per Day
</Text>
{workoutChartData.length > 0 && (
<LineChart
  data={{
    labels: visibleLabels,
    datasets: [
      {
        data: workoutChartData.map(d => Number.isFinite(d.y) ? d.y : 0),
      },
    ],
  }}
  width={Dimensions.get('window').width * 0.95}
  height={220}
  yAxisSuffix=" kcal"
  chartConfig={{
    backgroundColor: Colors.background,
    backgroundGradientFrom: Colors.background,
    backgroundGradientTo: Colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => Colors.primary + Math.floor(opacity * 255).toString(16),
    labelColor: (opacity = 1) => Colors.textDark,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: Colors.accent,
    },
  }}
  fromZero={true}  
  
  style={{
    marginVertical: 8,
    borderRadius: 12,
    alignSelf: 'center',
 
    paddingLeft: 18,
  }}
/>

)}
{workoutChartData.length === 0 && (
  <Text style={{ textAlign: 'center', color: Colors.textDark, marginTop: 20 }}>
    No recent workouts to display chart.
  </Text>
)}


      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  stat: {
    fontSize: 16,
    marginBottom: 10,
  },
  chartLabel: {
    fontSize: 18,
    marginTop: 30,
    marginBottom: 10,
    fontWeight: 'bold',
  },
});
