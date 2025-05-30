import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import FloatingNavButton from '../components/NavButton';
import uuid from 'react-native-uuid';
import { Picker } from '@react-native-picker/picker';
import Layout from '../components/Layout';
import { getColors } from '../constants/colors';
import { useTheme } from '../components/context/ThemeContext';

export default function Goals() {
  const router = useRouter();
  const { theme } = useTheme();
  const Colors = getColors(theme);

  const [goals, setGoals] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [goalType, setGoalType] = useState('calories');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('kcal');
  const [category, setCategory] = useState('aerobic');
  const [durationDays, setDurationDays] = useState('');

  const user = auth.currentUser;
  const userRef = user ? doc(db, 'users', user.uid) : null;

  useEffect(() => {
    if (!userRef) return;
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGoals(data.goals || []);
      }
    });
    return () => unsubscribe();
  }, [userRef]);

  const addGoal = async () => {
    if (!title.trim() || !targetValue || !durationDays || !userRef) return;

    const duration = parseInt(durationDays);
    if (isNaN(duration) || duration <= 0) return;

    const today = new Date();
    const deadline = new Date(today);
    deadline.setDate(today.getDate() + duration);

    const goalEntry = {
      id: uuid.v4(),
      title,
      goalType,
      targetValue: Number(targetValue),
      initialTargetValue: Number(targetValue),
      unit,
      category,
      deadline: deadline.toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    await updateDoc(userRef, {
      goals: arrayUnion(goalEntry),
    });

    setTitle('');
    setGoalType('calories');
    setTargetValue('');
    setUnit('kcal');
    setCategory('aerobic');
    setDurationDays('');
  };

  const toggleComplete = async (goal: any) => {
    if (!userRef) return;
    const updatedGoal = { ...goal, completed: !goal.completed };
    await updateDoc(userRef, { goals: arrayRemove(goal) });
    await updateDoc(userRef, { goals: arrayUnion(updatedGoal) });
    if (updatedGoal.completed) {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const currentXp = docSnap.data().xp || 0;
        await updateDoc(userRef, { xp: currentXp + 1000 });
      }
    }
  };

  const deleteGoal = async (goal: any) => {
    if (!userRef) return;
    await updateDoc(userRef, { goals: arrayRemove(goal) });
  };

  const calorieGoals = goals.filter((g) => g.goalType === 'calories');
  const frequencyGoals = goals.filter((g) => g.goalType === 'frequency');
  const weightGoals = goals.filter((g) => g.goalType === 'weight');

  const renderGoalItem = (item: any) => (
    <View key={item.id} style={[styles.goalItem, { backgroundColor: item.completed ? '#c8e6c9' : '#fff' }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.goalText, { color: Colors.textDark }]}>{item.title}</Text>
        <Text style={styles.goalMeta}>{item.targetValue} {item.unit} - {item.category}</Text>
        <Text style={styles.goalMeta}>Deadline: {new Date(item.deadline).toDateString()}</Text>
        {item.initialTargetValue && item.initialTargetValue > 0 && (
          <View style={styles.progressBarContainer}>
            <View style={{
              height: '100%',
              backgroundColor: Colors.secondary,
              width: `${Math.min(100 * (1 - item.targetValue / item.initialTargetValue), 100)}%`,
            }} />
          </View>
        )}
      </View>
      <View style={styles.goalActions}>
        <TouchableOpacity onPress={() => toggleComplete(item)}>
          <Text style={styles.completeText}>{item.completed ? '☑️' : '⬜'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteGoal(item)}>
          <Text style={styles.deleteText}>❌</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Layout>
      <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: Colors.background, paddingBottom: 120 }}>
        <Text style={[styles.title, { color: Colors.primary }]}>🎯 Your Fitness Goals</Text>

        <TextInput style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]} placeholder="Goal Title" placeholderTextColor="#999" value={title} onChangeText={setTitle} />

        <Text style={[styles.label, { color: Colors.textDark }]}>Goal Type:</Text>
        <View style={[styles.pickerContainer, { borderColor: Colors.primary }]}>
          <Picker
            style={styles.picker}
            selectedValue={goalType}
            onValueChange={(value) => {
              setGoalType(value);
              if (value === 'calories') setUnit('kcal');
              else if (value === 'weight') setUnit('kg');
              else if (value === 'frequency') setUnit('sessions');
              else setUnit('');
            }}>
            <Picker.Item label="Burn Calories" value="calories" />
            <Picker.Item label="Lose Weight" value="weight" />
            <Picker.Item label="Workout Frequency" value="frequency" />
          </Picker>
        </View>

        <Text style={[styles.label, { color: Colors.textDark }]}>Workout Category:</Text>
        <View style={styles.categoryRow}>
          <TouchableOpacity style={[styles.categoryButton, category === 'aerobic' && { backgroundColor: Colors.secondary }]} onPress={() => setCategory('aerobic')}>
            <Text style={styles.categoryButtonText}>Aerobic</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.categoryButton, category === 'anaerobic' && { backgroundColor: Colors.secondary }]} onPress={() => setCategory('anaerobic')}>
            <Text style={styles.categoryButtonText}>Anaerobic</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]} placeholder="Target Value" placeholderTextColor="#999" keyboardType="numeric" value={targetValue} onChangeText={setTargetValue} />

        <Text style={[styles.label, { color: Colors.textDark }]}>Achieve this goal in (days):</Text>
        <TextInput style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]} placeholder="e.g. 30" placeholderTextColor="#999" keyboardType="numeric" value={durationDays} onChangeText={setDurationDays} />

        <TouchableOpacity style={[styles.addButton, { backgroundColor: Colors.primary }]} onPress={addGoal}>
          <Text style={styles.addButtonText}>➕ Add Goal</Text>
        </TouchableOpacity>

        {calorieGoals.length > 0 && (<><Text style={[styles.sectionHeader, { color: Colors.primary }]}>🔥 Calorie Burn Goals</Text>{calorieGoals.map((item) => renderGoalItem(item))}</>)}
        {frequencyGoals.length > 0 && (<><Text style={[styles.sectionHeader, { color: Colors.primary }]}>🏋️ Exercise Goals</Text>{frequencyGoals.map((item) => renderGoalItem(item))}</>)}
        {weightGoals.length > 0 && (<><Text style={[styles.sectionHeader, { color: Colors.primary }]}>⚖️ Weight Loss Goals</Text>{weightGoals.map((item) => renderGoalItem(item))}</>)}
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { height: 40, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#fff', marginBottom: 10 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  pickerContainer: { borderWidth: 1, borderRadius: 8, marginBottom: 10, backgroundColor: '#fff', height: 30, justifyContent: 'center', paddingHorizontal: 10, overflow: 'hidden' },
  picker: { height: Platform.OS === 'android' ? 60 : undefined, fontSize: 18, marginTop: Platform.OS === 'android' ? -8 : 0, textAlignVertical: 'center' },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  categoryButton: { flex: 1, padding: 10, backgroundColor: '#ccc', borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  categoryButtonText: { color: '#fff', fontWeight: 'bold' },
  addButton: { padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  goalItem: { padding: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  goalText: { fontSize: 16, fontWeight: 'bold' },
  goalMeta: { fontSize: 12, color: '#666' },
  goalActions: { flexDirection: 'row', gap: 10, marginLeft: 10 },
  completeText: { fontSize: 20, marginHorizontal: 5 },
  deleteText: { fontSize: 20, color: '#D32F2F', marginHorizontal: 5 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  progressBarContainer: { height: 10, width: '100%', backgroundColor: '#ddd', borderRadius: 5, overflow: 'hidden', marginTop: 5 },
});