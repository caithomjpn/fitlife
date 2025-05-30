import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import FloatingNavButton from '../components/NavButton';
import { useTheme } from '../components/context/ThemeContext';
import { getColors } from '../constants/colors';
import { getWellnessPhase, getMarkedDatesFromEndDate } from '../components/utils/cycleUtils';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, onSnapshot, DocumentSnapshot } from 'firebase/firestore';
import { Calendar } from 'react-native-calendars';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [markedDates, setMarkedDates] = useState({});
  const [manualMarkedPeriod, setManualMarkedPeriod] = useState({});
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [phase, setPhase] = useState<string | null>(null);
  const { theme } = useTheme();
  const Colors = getColors(theme);
  const [actualStartDate, setActualStartDate] = useState<string | null>(null);
  const [actualEndDate, setActualEndDate] = useState<string | null>(null);

useEffect(() => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const userRef = doc(db, 'users', currentUser.uid);

  const unsubscribe = onSnapshot(userRef, async (docSnap: DocumentSnapshot ) => {
    if (!docSnap.exists()) return;
    const userData = docSnap.data();
        console.log('📅 cycleEndDate from Firestore:', userData.cycleEndDate);
    console.log('📅 cycleLength from Firestore:', userData.cycleLength);

    setUser(userData);

    if (userData.cycleEndDate && userData.cycleLength) {
      const newPhase = getWellnessPhase(userData.cycleEndDate, userData.cycleLength);
      setPhase(newPhase);

      const predictedMarks = getMarkedDatesFromEndDate(
        userData.cycleEndDate,
        userData.cycleLength
      );
console.log("🔖 predictedMarks:", predictedMarks);

      predictedMarks[userData.cycleEndDate] = {
        customStyles: {
          container: { backgroundColor: '#fff59d', borderRadius: 6 },
          text: { color: '#000' },
        },
      };

      setMarkedDates(predictedMarks);
    }
  });

  return () => unsubscribe();
}, []);





const onDayPress = async (day: { dateString: string }) => {
  if (!selectedStartDate) {
    setSelectedStartDate(day.dateString);
    setSelectedEndDate(null);
    setManualMarkedPeriod({});
  } else if (!selectedEndDate) {
    const start = new Date(selectedStartDate);
    const end = new Date(day.dateString);
    if (end < start) {
      setSelectedStartDate(day.dateString);
      return;
    }
    setSelectedEndDate(day.dateString);

    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const newMarks: Record<string, any> = {};

    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      newMarks[dateStr] = {
        customStyles: {
          container: { backgroundColor: i === 0 ? '#e91e63' : '#f8bbd0', borderRadius: 6 },
          text: { color: '#fff' },
        },
      };
    }

    setManualMarkedPeriod(newMarks);

    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const cycleLength = userData.cycleLength || 28;

        // 🚺 フェーズを自動計算
        const newPhase = getWellnessPhase(day.dateString, cycleLength);

        // 📤 Firestoreに保存
        await updateDoc(userRef, {
          cycleStartDate: selectedStartDate,
          cycleEndDate: day.dateString,
          currentWellnessPhase: newPhase,
        });

        // 🔁 カレンダー再描画
        const updatedMarked = getMarkedDatesFromEndDate(day.dateString, cycleLength);

        updatedMarked[day.dateString] = {
          customStyles: {
            container: { backgroundColor: '#fff59d', borderRadius: 6 },
            text: { color: '#f57f17' },
          },
        };

        setMarkedDates(updatedMarked);
        setPhase(newPhase); 
      }
    }
  } else {
    setSelectedStartDate(day.dateString);
    setSelectedEndDate(null);
    setManualMarkedPeriod({});
  }
};



  const phaseMessage: Record<string, string> = {
    recovery: 'Take it easy and recover 🧘‍♀️',
    activation: 'Great time for strength and challenge 💪',
    peak: 'You are in peak form 🔥 Push your limits!',
    taper: 'Focus on balance and flexibility 🌿',
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: Colors.background }]}>
      <Text style={[styles.title, { color: Colors.primary }]}>🏋️ Welcome to FitLife!</Text>
      <Text style={[styles.subtitle, { color: Colors.textDark }]}>
        Your journey to a healthier life starts here.
      </Text>

{user?.enableGenderFeatures && phase && (
  <View style={styles.phaseBox}>
    <Text style={[styles.phaseTitle, { color: Colors.primary }]}>🩺 Current Wellness Phase</Text>
    <Text style={{ color: Colors.textDark, marginTop: 6, fontSize: 16 }}>
      {phase.charAt(0).toUpperCase() + phase.slice(1)} – {phaseMessage[phase]}
    </Text>
  </View>
)}


      {user?.enableGenderFeatures && user?.gender === 'Female' && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: Colors.primary, marginBottom: 8 }}>
            🗓 Your Cycle Calendar
          </Text>
          <Calendar
            markingType="custom"
            markedDates={{ ...markedDates, ...manualMarkedPeriod }}
            onDayPress={onDayPress}
            theme={{
              backgroundColor: Colors.background,
              calendarBackground: Colors.background,
              todayTextColor: Colors.accent,
              arrowColor: Colors.primary,
            }}
          />
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <Text style={{ marginRight: 10, color: '#c2185b' }}>🩸 Period</Text>
            <Text style={{ color: '#0277bd' }}>🔵 Ovulation</Text>
          </View>
        </View>
      )}

      <FloatingNavButton />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  phaseBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#eef6ff',
    borderRadius: 10,
    width: '90%',
  },
  phaseTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});