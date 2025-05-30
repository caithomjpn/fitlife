import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth , db} from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

import { useRouter } from 'expo-router';
import { useTheme } from '../components/context/ThemeContext';
import { getColors } from '../constants/colors';

export default function Login() {
  const [email, setEmail] = useState('');
  const { theme } = useTheme();
const Colors = getColors(theme);
  const [password, setPassword] = useState('');
  const router = useRouter();

const handleLogin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      Alert.alert('✅ Welcome Back!');
      router.push('/profile'); // プロフィールあり → profile.tsx へ
    } else {
      Alert.alert('👋 Welcome! Please complete your profile.');
      router.push('/profileSetup' as any); // プロフィールなし → profileSetup.tsx へ
    }
  } catch (error: any) {
    Alert.alert('❌ Error', error.message);
  }
};


 return (
  <View style={[styles.container, { backgroundColor: Colors.background }]}>
    <Text style={[styles.title, { color: Colors.primary }]}>Login</Text>
    <TextInput
      style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]}
      placeholder="Email"
      placeholderTextColor={Colors.textDark}
      onChangeText={setEmail}
      value={email}
    />
    <TextInput
      style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]}
      placeholder="Password"
      placeholderTextColor={Colors.textDark}
      secureTextEntry
      onChangeText={setPassword}
      value={password}
    />
    <TouchableOpacity style={[styles.button, { backgroundColor: Colors.primary }]} onPress={handleLogin}>
      <Text style={styles.buttonText}>Login</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => router.push('/register')}>
      <Text style={[styles.link, { color: Colors.primary }]}>Don't have an account? Register</Text>
    </TouchableOpacity>
  </View>
);

}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#e0f7fa' },
  title: { fontSize: 24, marginBottom: 20, color: '#00796b', fontWeight: 'bold' },
  input: { width: '100%', height: 40, borderColor: '#00796b', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginBottom: 10, backgroundColor: '#fff' },
  button: { backgroundColor: '#00796b', padding: 12, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  link: { marginTop: 15, color: '#00796b' },
});
