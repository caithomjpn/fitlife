import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import FloatingNavButton from '../components/NavButton';
import AchievementList from '../components/AchievementList';

import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { getRequiredXpForLevel } from '../components/utils/xpUtils';

import Layout from '../components/Layout';
import { getColors } from '../constants/colors';
import { useTheme } from '../components/context/ThemeContext';

export default function Profile() {
  const router = useRouter();
  const { theme } = useTheme();                   // ✅ useTheme を関数内で使用
  const Colors = getColors(theme);                // ✅ テーマに応じたカラー取得

  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    gender: 'Not Set',
    height: 'Not Set',
    weight: 'Not Set',
    goal: 'Not Set',
  });

  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [calories, setCalories] = useState(0);
  const [workouts, setWorkouts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserProfile({
            name: data.name || 'No Name',
            gender: data.gender || 'Not Set',
            height: data.height || 'Not Set',
            weight: data.weight || 'Not Set',
            goal: data.goal || 'Not Set',
          });
          setXp(data.xp || 0);
          setStreak(data.streak || 0);
          setWorkouts(data.workouts || []);
          setCalories((data.workouts || []).reduce((sum: number, w: any) => sum + (w.calories || 0), 0));
        }
      }
    };

    fetchProfile();
  }, []);

  const getXpForPreviousLevels = (level: number): number => {
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += getRequiredXpForLevel(i);
    }
    return total;
  };

  const calculateLevelFromXp = (xp: number) => {
    let level = 1;
    let xpRemaining = xp;

    while (xpRemaining >= getRequiredXpForLevel(level)) {
      xpRemaining -= getRequiredXpForLevel(level);
      level++;
    }

    return level;
  };

  const level = calculateLevelFromXp(xp);
  const previousXp = getXpForPreviousLevels(level);
  const requiredXp = getRequiredXpForLevel(level);
  const currentLevelXp = Math.max(0, xp - previousXp);
  const xpProgress = Math.min((currentLevelXp / requiredXp) * 100, 100);

  return (
    <Layout>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: Colors.background }]}>
        <Text style={[styles.title, { color: Colors.primary }]}>Profile</Text>
        <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.avatar} />

        <Text style={[styles.info, { color: Colors.textDark }]}>👤 Name: {userProfile.name}</Text>
        <Text style={[styles.info, { color: Colors.textDark }]}>⚧️ Gender: {userProfile.gender}</Text>
        <Text style={[styles.info, { color: Colors.textDark }]}>📏 Height: {userProfile.height}</Text>
        <Text style={[styles.info, { color: Colors.textDark }]}>⚖️ Weight: {userProfile.weight}</Text>
        <Text style={[styles.info, { color: Colors.textDark }]}>🎯 Goal: {userProfile.goal}</Text>

        <TouchableOpacity style={[styles.editButton, { backgroundColor: Colors.primary }]} onPress={() => router.push('/editProfile')}>
          <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
        </TouchableOpacity>

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${xpProgress}%`, backgroundColor: Colors.secondary }]} />
        </View>

        <Text style={[styles.progressText, { color: Colors.textDark }]}>Level {level}</Text>
        <Text style={[styles.progressText, { color: Colors.textDark }]}>{currentLevelXp} / {requiredXp} XP</Text>

        <Text style={[styles.subtitle, { color: Colors.textDark }]}>Achievements</Text>
        <AchievementList xp={xp} streak={streak} calories={calories} workouts={workouts} />

        <View style={{ height: 120 }} />
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 0,
  },
  info: {
    fontSize: 18,
    marginVertical: 5,
  },
  editButton: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '80%',
    height: 15,
    backgroundColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
  },
  progressText: {
    fontSize: 16,
    marginTop: 5,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginBottom: 0,
  },
});
