import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Button, StyleSheet,
  useWindowDimensions, Switch, Platform, ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
{/*import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';*/}
import { useFocusEffect } from 'expo-router';
import {
  collection, getDocs, updateDoc, doc, getDoc,
  arrayUnion, onSnapshot, addDoc, Timestamp
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import Layout from '../components/Layout';
import FloatingNavButton from '../components/NavButton';
import { getColors } from '../constants/colors';
import { useTheme } from '../components/context/ThemeContext';
import { getWellnessPhase } from '../components/utils/cycleUtils';

type Workout = {
  id: string;
  name: string;
  calories: number;
  category: string;
  loggedAt: string;
};

export default function Workouts() {
  const formatDateUK = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/London',
  }).split('/').reverse().join('-');
    const [showByDate, setShowByDate] = useState(false);
const [selectedDate, setSelectedDate] = useState<string>(() => formatDateUK(new Date()));

const { width: screenWidth } = useWindowDimensions();
  const { theme } = useTheme();
  const Colors = getColors(theme);

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [templateList, setTemplateList] = useState<any[]>([]);
  const [newWorkout, setNewWorkout] = useState('');
  const [newCalories, setNewCalories] = useState('');
  const [newCategory, setNewCategory] = useState('aerobic');
  const [duration, setDuration] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [description, setDescription] = useState('');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [phaseBasedFilter, setPhaseBasedFilter] = useState(false);
  const [phase, setPhase] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
const [userGender, setUserGender] = useState<string | null>(null);
const [enableGenderFeatures, setEnableGenderFeatures] = useState<boolean>(false);
const [showMyTemplatesOnly, setShowMyTemplatesOnly] = useState(false);
const [showFriendsTemplatesOnly, setShowFriendsTemplatesOnly] = useState(false);
const [friendIds, setFriendIds] = useState<string[]>([]);
const canGoPrev = () => {
  const currentDate = new Date(selectedDate);
  return workouts.some(w => {
    const loggedDate = new Date(w.loggedAt);
    return loggedDate < currentDate;
  });
};


const canGoNext = () => {
  const current = new Date(selectedDate);
  const next = new Date(current);
  next.setDate(current.getDate() + 1);

  const today = new Date();
  const todayStr = formatDateUK(today);
  const nextStr = formatDateUK(next);

  // debug
  console.log("🧭 todayStr:", todayStr);
  console.log("➡️ nextStr:", nextStr);

  return nextStr <= todayStr;
};
const adjustDate = (days: number) => {
  console.log("📅 Try to adjust:", days);

  const current = new Date(selectedDate);
  const newDate = new Date(current);
  newDate.setDate(current.getDate() + days);

  const newDateStr = formatDateUK(newDate);
  const todayStr = formatDateUK(new Date());

  console.log("🎯 newDateStr:", newDateStr);
  console.log("📆 todayStr:", todayStr);

  if (days > 0 && newDateStr > todayStr) {
    console.log("🚫 Cannot go to the future");
    return;
  }

 if (days < 0) {
  const allDates = workouts.map(w => formatDateUK(new Date(w.loggedAt)));
  const minDate = allDates.sort()[0]; 

  if (minDate && formatDateUK(newDate) < minDate) {
    console.log("🚫 Cannot go before min workout date");
    return;
  }
}


  setSelectedDate(newDateStr);
};




useEffect(() => {

const fetchTemplates = async () => {
    const ref = collection(db, 'workoutTemplates', 'templates', 'workoutTemplates');
    const snapshot = await getDocs(ref);

    console.log("🧪 top-level:", snapshot.docs.map(d => d.id));

    const templates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("📦 fetchedTemplates:", templates);
    setTemplateList(templates);
  };
const fetchPhase = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const userRef = doc(db, 'users', currentUser.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const userData = userSnap.data();

  // 💡 Gender とフラグをここで保存
  setUserGender((userData.gender || '').toLowerCase()); // e.g. 'female'
  setEnableGenderFeatures(!!userData.enableGenderFeatures); // boolean に変換

  // 💡 Wellness phase だけ条件を満たすときに取得
  if (
    userData.enableGenderFeatures &&
    userData.cycleStartDate &&
    userData.cycleLength
  ) {
    const currentPhase = getWellnessPhase(
      userData.cycleStartDate,
      userData.cycleLength
    );
    setPhase(currentPhase);
  }


};
  const fetchFriends = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    const userData = docSnap.data();
    const friends: string[] = userData.friends || [];
    setFriendIds(friends);
  }
};

  

  fetchTemplates();
  fetchPhase();
  fetchFriends();
}, []);

  useEffect(() => {
    const resetStreakIfMissed = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) return;
      const data = docSnap.data();
      const lastLoggedDate = data.lastLoggedDate;
      const streak = data.streak || 0;

      if (!lastLoggedDate) return;
      const today = new Date();
      const lastDate = new Date(lastLoggedDate);
      const diffInDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffInDays >= 1 && streak > 0) {
        await updateDoc(userRef, { streak: 0 });
      }
    };
    resetStreakIfMissed();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.workouts) setWorkouts(data.workouts);
        }
      });
      return () => unsubscribe();
    }, [])
  );
  const handleDeleteWorkout = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) return;

    const workouts = docSnap.data().workouts || [];
    const updated = workouts.filter((item: Workout) => item.id !== id);
    await updateDoc(userRef, { workouts: updated });
    setWorkouts(updated);
  };

  const addXp = async (amount: number) => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) return;

    let currentXp = docSnap.data().xp || 0;
    await updateDoc(userRef, { xp: currentXp + amount });
  };
  const saveWorkoutTemplate = async (templateData: {
  name: string;
  calories: number;
  category: string;
  duration: number;
  difficulty: string;
  description?: string;
}) => {
  const user = auth.currentUser;
  if (!user) return;

  const ref = collection(db, 'workoutTemplates', 'templates', 'workoutTemplates');
  await addDoc(ref, {
    ...templateData,
    createdBy: user.uid,
    createdAt: Timestamp.now(),
  });
};
const handleAddWorkout = async () => {
  console.time("🕒 Add Workout Total Time");

  if (!newWorkout.trim() || !newCalories.trim()) return;
  const user = auth.currentUser;
  if (!user) return;

const today = formatDateUK(new Date()); 
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) return;

  const data = docSnap.data();
  const currentXp = data.xp || 0;

  const lastLoggedDate = data.lastLoggedDate || null;

  let currentStreak = data.streak || 0;
  let bestStreak = data.bestStreak || 0;

  if (lastLoggedDate !== today) {
    currentStreak += 1;
    if (currentStreak > bestStreak) bestStreak = currentStreak;
  }

  const newEntry: Workout = {
    id: Math.random().toString(),
    name: newWorkout,
    calories: parseInt(newCalories),
    category: newCategory,
    loggedAt: today,
  };

  const updateCalorieGoals = async () => {
    console.time("📥 Firestore: update goals + workout");

    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) return;

    const userData = docSnap.data();
    const goals = userData.goals || [];

    const updatedGoals = goals.map((goal: any) => {
      if (
        goal.goalType === 'calories' &&
        !goal.completed &&
        goal.category === newCategory
      ) {
        const newValue = goal.targetValue - parseInt(newCalories);
        return {
          ...goal,
          targetValue: Math.max(newValue, 0),
          completed: newValue <= 0,
        };
      }
      return goal;
    });

    const existingWorkouts = data.workouts || [];

    await updateDoc(userRef, {
      workouts: [...existingWorkouts, newEntry],
      goals: updatedGoals,
      xp: currentXp + 100,
      ...(lastLoggedDate !== today && {
        streak: currentStreak,
        bestStreak: bestStreak,
        lastLoggedDate: today,
      }),
    });

    console.timeEnd("📥 Firestore: update goals + workout");

    setWorkouts([...workouts, newEntry]);
    setNewWorkout('');
    setNewCalories('');
    setNewCategory('aerobic');
    setDuration('');
    setDifficulty('Intermediate');
    setDescription('');
    setSaveAsTemplate(false);

    await addXp(100);

if (saveAsTemplate) {
  await saveWorkoutTemplate({
    name: newWorkout,
    calories: parseInt(newCalories),
    category: newCategory,
    duration: parseInt(duration) || 20,
    difficulty: difficulty,
    description: description || 'User-created template',
  });
}



    await updateDoc(userRef, { goals: updatedGoals });
  };

  await updateCalorieGoals();

  console.timeEnd("🕒 Add Workout Total Time");
};

  const phaseTags: Record<string, string[]> = {
  recovery: ['stretch', 'yoga', 'light'],
  activation: ['strength', 'endurance', 'aerobic'],
  peak: ['HIIT', 'power', 'challenge'],
  taper: ['moderate', 'mobility', 'core'],
};
const safeDate = (dateStr: string) =>
  new Date(dateStr).toISOString().split('T')[0];
console.log("🕵️ selectedDate:", selectedDate);
console.log("🕵️ 全workoutsのloggedAt:", workouts.map(w => w.loggedAt));
console.log("🧪 showByDate:", showByDate);
console.log("🔍 selectedDate === w.loggedAt:", selectedDate === workouts[0]?.loggedAt);
console.log("🎯 safeDate(selectedDate):", safeDate(selectedDate || ''));
console.log("🧪 safeDate(match):", workouts.map(w => safeDate(w.loggedAt)));

const filteredWorkouts = workouts.filter(
  (w) => formatDateUK(new Date(w.loggedAt)) === selectedDate
);

  return (
    <Layout>
{showTemplatePicker && (
  <View
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    }}
  >
    <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '80%', maxHeight: '80%' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Select a Template</Text>
<ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
      {templateList.length === 0 ? (
        <Text style={{ color: '#888' }}>No templates available.</Text>
      ) : (
templateList
  .filter((template) => {
    if (phaseBasedFilter && phase) {
      const phaseDifficultyMap: Record<string, string[]> = {
        recovery: ['Beginner'],
        activation: ['Beginner', 'Intermediate'],
        peak: ['Intermediate', 'Advanced'],
        taper: ['Beginner', 'Intermediate'],
      };
      if (!phaseDifficultyMap[phase]?.includes(template.difficulty)) return false;
    }

    if (filterDifficulty && template.difficulty !== filterDifficulty) {
      return false;
    }

    if (showMyTemplatesOnly && template.createdBy !== auth.currentUser?.uid) {
      return false;
    }

    if (showFriendsTemplatesOnly && !friendIds.includes(template.createdBy)) {
      return false;
    }

    return true;
  })

          .map((template) => (
            <TouchableOpacity
              key={template.id}
              style={{
                marginBottom: 10,
                padding: 10,
                backgroundColor: Colors.primary,
                borderRadius: 8,
              }}
              onPress={() => {
                setNewWorkout(template.name);
                setNewCalories(template.calories.toString());
                setNewCategory(template.category);
                setDuration(template.duration?.toString() || '');
                setDifficulty(template.difficulty || 'Intermediate');
                setDescription(template.description || '');
                setShowTemplatePicker(false);
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{template.name}</Text>
              <Text style={{ color: '#eee', fontSize: 12 }}>{template.description}</Text>
            </TouchableOpacity>
          ))
      )}
</ScrollView>
      <TouchableOpacity onPress={() => setShowTemplatePicker(false)}>
        <Text style={{ textAlign: 'center', color: '#999', marginTop: 10 }}>❌ Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <Text style={[styles.title, { color: Colors.primary }]}>Workout Tracker</Text>

<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
  <Button
    title="⬅︎ Prev"
    onPress={() => adjustDate(-1)}
    color={canGoPrev() ? Colors.primary : '#ccc'}
    disabled={!canGoPrev()}
  />
  <Text style={{ alignSelf: 'center', color: Colors.textDark }}>
    {selectedDate}
  </Text>
  <Button
    title="Next ➡︎"
    onPress={() => adjustDate(1)}
    color={canGoNext() ? Colors.primary : '#ccc'}
    disabled={!canGoNext()}
  />
</View>

        <TextInput style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]} placeholder="Workout Name" value={newWorkout} onChangeText={setNewWorkout} />
        <TextInput style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]} placeholder="Calories Burned" keyboardType="numeric" value={newCalories} onChangeText={setNewCalories} />
        <TextInput style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]} placeholder="Duration (minutes)" keyboardType="numeric" value={duration} onChangeText={setDuration} />

        <Text style={[styles.label, { color: Colors.textDark }]}>Difficulty</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={difficulty} onValueChange={setDifficulty} style={{ color: Colors.textDark, fontSize: 18 }}>
            <Picker.Item label="Beginner" value="Beginner" />
            <Picker.Item label="Intermediate" value="Intermediate" />
            <Picker.Item label="Advanced" value="Advanced" />
          </Picker>
        </View>

        <TextInput style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]} placeholder="Description (optional)" value={description} onChangeText={setDescription} />

        <View style={styles.categoryRow}>
          <Button title="Aerobic" color={newCategory === 'aerobic' ? Colors.secondary : '#ccc'} onPress={() => setNewCategory('aerobic')} />
          <Button title="Anaerobic" color={newCategory === 'anaerobic' ? Colors.accent : '#ccc'} onPress={() => setNewCategory('anaerobic')} />
        </View>



        <Text style={{ color: '#666', fontStyle: 'italic', fontSize: 12, marginBottom: 8 }}>
          You selected a template. Tap "➕ Add Workout" to save it.
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Switch value={saveAsTemplate} onValueChange={setSaveAsTemplate} />
          <Text style={{ marginLeft: 10, color: Colors.textDark }}>Save as public template</Text>
        </View>
{userGender === 'female' && enableGenderFeatures && (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
    <Switch value={phaseBasedFilter} onValueChange={setPhaseBasedFilter} />
    <Text style={{ marginLeft: 10, color: Colors.textDark }}>
      Filter templates by Wellness Phase?
    </Text>
  </View>
)}

        <View style={{ marginBottom: 10 }}>
  <Text style={{ color: Colors.textDark, marginBottom: 4 }}>Filter by Difficulty</Text>
  <Picker
    selectedValue={filterDifficulty}
    onValueChange={(value) => setFilterDifficulty(value)}
    style={{ color: Colors.textDark }}
  >
    <Picker.Item label="All" value={null} />
    <Picker.Item label="Beginner" value="Beginner" />
    <Picker.Item label="Intermediate" value="Intermediate" />
    <Picker.Item label="Advanced" value="Advanced" />
  </Picker>
</View>
<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
  <Switch value={showMyTemplatesOnly} onValueChange={(val) => {
    setShowMyTemplatesOnly(val);
    if (val) setShowFriendsTemplatesOnly(false); // 排他的に
  }} />
  <Text style={{ marginLeft: 10, color: Colors.textDark }}>Show My Templates Only</Text>
</View>

<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
  <Switch value={showFriendsTemplatesOnly} onValueChange={(val) => {
    setShowFriendsTemplatesOnly(val);
    if (val) setShowMyTemplatesOnly(false); // 排他的に
  }} />
  <Text style={{ marginLeft: 10, color: Colors.textDark }}>Show Friends’ Templates Only</Text>
</View>
        <TouchableOpacity style={{ backgroundColor: Colors.secondary, padding: 10, borderRadius: 8, marginBottom: 8, alignItems: 'center' }} onPress={() => setShowTemplatePicker(true)}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>🧩 Use Template</Text>
        </TouchableOpacity>

        <Button title="➕ Add Workout" onPress={handleAddWorkout} color={Colors.primary} />

     
        <Text style={[styles.label, { color: Colors.textDark }]}>Workout History</Text>

{filteredWorkouts.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#888', marginBottom: 16 }}>
            No workouts yet. Start logging to see progress!
          </Text>
        ) : (
  filteredWorkouts.map((item: Workout) => (
            <View key={item.id} style={styles.workoutCard}>
              <Text style={{ color: Colors.textDark, fontWeight: 'bold' }}>{item.name}</Text>
              <Text style={{ color: Colors.textDark }}>{item.calories} kcal · {item.category}</Text>
              <Text style={{ color: '#999', fontSize: 12 }}>🕒 {item.loggedAt}</Text>
              <TouchableOpacity onPress={() => handleDeleteWorkout(item.id)}>
                <Text style={{ color: 'red', marginTop: 5 }}>🗑 Delete</Text>
 </TouchableOpacity>
            </View>
          ))
        )}
      </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: {
    height: 40, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10,
    marginBottom: 10, backgroundColor: '#fff',
  },
  label: {
    fontSize: 16, fontWeight: 'bold', marginBottom: 5,
  },
  pickerContainer: {
    width: '100%',
    height: 52,
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: Platform.OS === 'ios' ? 0 : 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  workoutCard: {
  backgroundColor: '#fff',
  padding: 10,
  borderRadius: 8,
  marginBottom: 10,
},
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  
});

