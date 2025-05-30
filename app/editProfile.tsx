import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getColors } from '../constants/colors';
import { useTheme } from '../components/context/ThemeContext';
import { db, auth } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';
import { getWellnessPhase } from '../components/utils/cycleUtils';


export default function EditProfile() {
  const router = useRouter();
  const { theme } = useTheme();
  const Colors = getColors(theme);

  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [goal, setGoal] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [enableGenderFeatures, setEnableGenderFeatures] = useState<boolean | null>(null);
  const [showError, setShowError] = useState('');
  const [cycleEndDate, setCycleEndDate] = useState<Date | null>(new Date());

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
  const goalOptions = ['Lose weight', 'Gain muscle', 'Improve endurance', 'Stay healthy'];

  const heightMeters = parseFloat(height) / 100;
  const weightKg = parseFloat(weight);
  const bmi = weightKg && heightMeters ? weightKg / (heightMeters * heightMeters) : 0;
  const whr = waist && hip ? parseFloat(waist) / parseFloat(hip) : 0;
  const [cycleStartDate, setCycleStartDate] = useState<Date | null>(null);
  const [cycleLength, setCycleLength] = useState<number>(28); // default
  const getLocalDateString = (date: Date): string => {
  const tzOffset = date.getTimezoneOffset() * 60000; // ミリ秒に変換
  const localISO = new Date(date.getTime() - tzOffset).toISOString();
  return localISO.split('T')[0]; // 形式: "2025-05-30"
};
  let suggestedGoal = '';
  if (bmi && bmi < 18.5) {
    suggestedGoal = 'Gain muscle and reach a healthy weight';
  } else if (bmi >= 18.5 && bmi < 25) {
    suggestedGoal = 'Maintain your current weight and improve endurance';
  } else if (bmi >= 25 && bmi < 30) {
    suggestedGoal = 'Lose weight through consistent workouts';
  } else if (bmi >= 30) {
    suggestedGoal = 'Burn fat and improve cardiovascular health';
  }

  let whrNote = '';
  if (gender && whr) {
    if (gender === 'Male') {
      whrNote = whr >= 1.0 ? 'High health risk based on waist-to-hip ratio' :
                whr >= 0.9 ? 'Moderate risk' : 'Low risk';
    } else if (gender === 'Female') {
      whrNote = whr >= 0.9 ? 'High health risk based on waist-to-hip ratio' :
                whr >= 0.8 ? 'Moderate risk' : 'Low risk';
    }
  }

  const handleSave = async () => {
    
    const selectedGoal = goal === 'custom' ? customGoal : goal;
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    

    if (!name || !gender || !height || !weight || !goal || (goal === 'custom' && !customGoal)) {
      setShowError('Please fill in all required fields.');
      return;
    }

    if (isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
      setShowError('Please enter a valid height between 50 and 300 cm.');
      return;
    }

    if (isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
      setShowError('Please enter a valid weight between 20 and 300 kg.');
      return;
    }
    let currentWellnessPhase = null;

if (cycleEndDate && cycleLength) {
  currentWellnessPhase = getWellnessPhase(cycleEndDate.toISOString(), cycleLength);
}
const userProfile = {
  name,
  gender,
  height: heightNum,
  weight: weightNum,
  waist: parseFloat(waist),
  hip: parseFloat(hip),
  bmi,
  whr,
  suggestedGoal,
  goal: selectedGoal,
  enableGenderFeatures,
cycleEndDate: cycleEndDate ? getLocalDateString(cycleEndDate) : null,
  cycleLength,
  currentWellnessPhase, 

  xp: 0,
  level: 0,
  streak: 0,
};

console.log("💾 Saving cycleEndDate:", cycleEndDate);


    try {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, userProfile);
      router.push('/profile');
    } catch (error) {
      setShowError('Failed to save profile. Please try again.');
      console.log('Error saving profile:', error);
    }
  };

  return (
<ScrollView contentContainerStyle={[styles.container, { backgroundColor: Colors.background }]}>     
   <Text style={[styles.title, { color: Colors.primary }]}>
  ✏️ Edit Profile</Text>

      <TextInput
        style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]}
        placeholder="Name"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />

      <Text style={[styles.label, { color: Colors.textDark }]}>Gender</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={gender}
          onValueChange={(itemValue) => setGender(itemValue)}
          style={{ color: Colors.textDark, fontSize: 18, height: 50 }}
        >
          <Picker.Item label="Select gender" value="" />
          {genderOptions.map((option) => (
            <Picker.Item key={option} label={option} value={option} />
          ))}
        </Picker>
      </View>

      {gender && (
        <View style={{ marginVertical: 10, width: '80%' }}>
          <Text style={[styles.label, { color: Colors.textDark }]}>Enable gender-based features?</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <TouchableOpacity
              style={[styles.choiceButton, enableGenderFeatures === true && { backgroundColor: Colors.primary }]}
              onPress={() => setEnableGenderFeatures(true)}
            >
              <Text style={{ color: enableGenderFeatures === true ? '#fff' : Colors.textDark }}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.choiceButton, enableGenderFeatures === false && { backgroundColor: Colors.primary }]}
              onPress={() => setEnableGenderFeatures(false)}
            >
              <Text style={{ color: enableGenderFeatures === false ? '#fff' : Colors.textDark }}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
{gender === 'Female' && enableGenderFeatures && (
  <>
    
<Text style={styles.label}>🔁 Cycle Length (Days)</Text>
<View style={styles.pickerWrapper}>
  <Picker
    selectedValue={cycleLength}
    onValueChange={(itemValue) => setCycleLength(itemValue)}
    style={{ height: 50 }} // ← 明示的に高さを指定！
    dropdownIconColor={Colors.textDark}
  >
{Array.from({ length: 41 }, (_, i) => (
  <Picker.Item key={i} label={`${i + 10} days`} value={i + 10} />
))}
  </Picker>
</View>
<Text style={styles.label}>🛑 Last Period End Date</Text>
{Platform.OS === 'web' ? (
  <input
    type="date"
    value={cycleEndDate ? cycleEndDate.toISOString().split('T')[0] : ''}
    onChange={(e) => {
      const parsed = new Date(e.target.value);
      if (!isNaN(parsed.getTime())) {
        setCycleEndDate(parsed);
      }
    }}
    style={{
      height: 40,
      borderColor: Colors.primary,
      borderWidth: 1,
      borderRadius: 8,
      paddingLeft: 10,
      paddingRight: 10,
      marginBottom: 10,
      fontSize: 16,
    }}
  />
) : (
<DatePicker
  date={cycleEndDate || new Date()}
  onDateChange={setCycleEndDate}
  mode="date"
  locale="en"
  style={{ alignSelf: 'center', marginBottom: 10 }}
/>

)}


  </>
)}

      <TextInput
        style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]}
        placeholder="Height (cm)"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
      />

      <TextInput
        style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]}
        placeholder="Weight (kg)"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />

      <TextInput
        style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]}
        placeholder="Waist circumference (cm)"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={waist}
        onChangeText={setWaist}
      />

      <TextInput
        style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]}
        placeholder="Hip circumference (cm)"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={hip}
        onChangeText={setHip}
      />

      {height && weight && suggestedGoal !== '' && (
        <View style={{ width: '80%', backgroundColor: '#f0f4f8', padding: 12, borderRadius: 8, marginBottom: 8 }}>
          <Text style={{ fontWeight: 'bold', color: Colors.primary }}>🎯 Suggested Goal:</Text>
          <Text style={{ color: Colors.textDark }}>{suggestedGoal}</Text>
        </View>
      )}

      {whrNote && (
        <View style={{ width: '80%', marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: Colors.textDark, fontStyle: 'italic' }}>⚠️ {whrNote}</Text>
        </View>
      )}

      <Text style={[styles.label, { color: Colors.textDark }]}>Fitness Goal</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={goal}
          onValueChange={(itemValue) => setGoal(itemValue)}
          style={{ color: Colors.textDark, fontSize: 18, height: 50 }}
        >
          <Picker.Item label="Select a goal" value="" />
          {goalOptions.map((option) => (
            <Picker.Item key={option} label={option} value={option} />
          ))}
          <Picker.Item label="Other (custom goal)" value="custom" />
        </Picker>
      </View>

      {goal === 'custom' && (
        <TextInput
          style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]}
          placeholder="Enter your own goal"
          placeholderTextColor="#999"
          value={customGoal}
          onChangeText={setCustomGoal}
        />
      )}

      <TouchableOpacity style={[styles.saveButton, { backgroundColor: Colors.primary }]} onPress={handleSave}>
        <Text style={styles.saveButtonText}>✅ Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.push('/profile')}>
        <Text style={[styles.cancelButtonText, { color: Colors.accent }]}>❌ Cancel</Text>
      </TouchableOpacity>

      {showError !== '' && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>❌ Error</Text>
            <Text style={styles.modalText}>{showError}</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: Colors.primary }]}
              onPress={() => setShowError('')}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  label: { alignSelf: 'flex-start', marginLeft: 30, marginBottom: 5, fontSize: 16 },
  input: {
    width: '80%', height: 48, borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 14, marginBottom: 16, backgroundColor: '#fff', fontSize: 16,
  },
  pickerContainer: {
    width: '80%', height: 52, justifyContent: 'center', marginBottom: 16,
    borderWidth: Platform.OS === 'ios' ? 0 : 1, borderRadius: 10, overflow: 'hidden',
    backgroundColor: '#fff', paddingHorizontal: 10,
  },
  choiceButton: {
    flex: 1, paddingVertical: 10, marginHorizontal: 6, borderRadius: 8,
    borderWidth: 1, alignItems: 'center',
  },
  saveButton: {
    padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 20, width: '80%',
  },
  saveButtonText: {
    color: '#fff', fontSize: 18, fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 12, alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16, fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 999,
  },
  modalBox: {
    backgroundColor: '#fff', padding: 25, borderRadius: 12,
    width: '85%', maxWidth: 350, alignItems: 'center',
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  pickerWrapper: {
  width: '80%',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  marginBottom: 16,
  backgroundColor: '#fff',
  justifyContent: 'center',
},
});
