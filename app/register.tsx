import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useRouter } from 'expo-router';
import { useTheme } from '../components/context/ThemeContext';
import { getColors } from '../constants/colors';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showError, setShowError] = useState('');
  const [showExists, setShowExists] = useState(false);

  const router = useRouter();
  const { theme } = useTheme();
  const Colors = getColors(theme);

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('register success:', user.uid);
      setShowTutorial(true);
    } catch (error: any) {
      console.log('🔥 Firebase registration error:', JSON.stringify(error, null, 2));

      if (error.code === 'auth/email-already-in-use') {
        setShowExists(true);
      } else {
        setShowError(error.message || 'An unexpected error occurred.');
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <Text style={[styles.title, { color: Colors.primary }]}>Create Account</Text>

      <TextInput
        style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]}
        placeholder="Email"
        placeholderTextColor="#999"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={[styles.input, { borderColor: Colors.primary, color: Colors.textDark }]}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: Colors.primary }]} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={[styles.link, { color: Colors.primary }]}>Already have an account? Login</Text>
      </TouchableOpacity>

      {/* ✅ Modal: Tutorial */}
{showTutorial && (
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>
      <Text style={styles.modalTitle}>🎉 Welcome to FitLife!</Text>
      <Text style={styles.modalText}>
        Here’s how it works:
        {'\n\n'}• Track workouts
        {'\n'}• Set goals
        {'\n'}• Earn XP & badges
        {'\n'}• Compete with friends
      </Text>
      <TouchableOpacity
        style={[styles.modalButton, { backgroundColor: Colors.primary }]}
        onPress={() => {
          setShowTutorial(false);
          router.push('/editProfile');
        }}
      >
        <Text style={styles.modalButtonText}>Let’s get started!</Text>
      </TouchableOpacity>
    </View>
  </View>
)}


      {/* ❌ Modal: Already registered */}
      {showExists && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>⚠️ Email already in use</Text>
            <Text style={styles.modalText}>
              That email is already registered. Would you like to login instead?
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: Colors.primary }]}
              onPress={() => {
                setShowExists(false);
                router.push('/login');
              }}
            >
              <Text style={styles.modalButtonText}>Go to Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 10 }}
              onPress={() => setShowExists(false)}
            >
              <Text style={[styles.link, { color: Colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ❗ Modal: Other error */}
      {showError !== '' && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>❌ Registration Error</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  link: { marginTop: 15 },

  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
modalBox: {
  backgroundColor: '#fff',
  padding: 25,
  borderRadius: 12,
  width: '85%',
  maxWidth: 350,
  alignItems: 'center',

},

modalTitle: {
  fontSize: 22,
  fontWeight: 'bold',
  marginBottom: 10,
  textAlign: 'center',
},

modalText: {
  fontSize: 16,
  textAlign: 'center',
  marginBottom: 20, 
  lineHeight: 24
},

modalButton: {
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
},

  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
modalScrollContent: {
  flexGrow: 1,
  justifyContent: 'center', 
  alignItems: 'center',
  paddingBottom: 20,
},
});
