import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { cancelGoalReminder } from '@/components/utils/notifications';
import { useTheme } from '../components/context/ThemeContext';
import { getColors } from '../constants/colors';
import Layout from '../components/Layout'; 
export default function Settings() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const Colors = getColors(theme);
  const [goalReminderEnabled, setGoalReminderEnabled] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGoalReminderEnabled(data.settings?.goalReminder ?? true);
      }
    };

    loadSettings();
  }, []);

  const toggleGoalReminder = async (val: boolean) => {
    setGoalReminderEnabled(val);
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      'settings.goalReminder': val,
    });

    if (!val) {
      await cancelGoalReminder();
    }
  };

  return (
    <Layout>
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <Text style={[styles.title, { color: Colors.primary }]}>⚙️ Settings</Text>

      <View style={styles.settingCard}>
        <Text style={styles.settingLabel}>🔔 Goal Reminder</Text>
        <Switch value={goalReminderEnabled} onValueChange={toggleGoalReminder} />
      </View>

      <View style={styles.settingCard}>
        <Text style={styles.settingLabel}>🌗 Dark Mode</Text>
        <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/help')}>
          <Text style={styles.primaryButtonText}>GO TO HELP</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerButton} onPress={() => router.push('/')}>
          <Text style={styles.dangerButtonText}>LOG OUT</Text>
        </TouchableOpacity>
      </View>
    </View>
    
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  buttonGroup: {
    marginTop: 30,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#0288D1',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dangerButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
