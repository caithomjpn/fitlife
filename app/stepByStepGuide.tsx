// app/stepByStepGuide.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import Layout from '../components/Layout';
import { useTheme } from '../components/context/ThemeContext';
import { getColors } from '../constants/colors';
import { useRouter } from 'expo-router';

export default function StepByStepGuide() {
  const { theme } = useTheme();
  const Colors = getColors(theme);
 const router = useRouter();
  return (
    <Layout>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: Colors.background }]}>
        <Text style={[styles.title, { color: Colors.primary }]}>📄 Step-by-Step Guide</Text>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.primary }]}>1. Create Your Profile</Text>
          <Text style={[styles.text, { color: Colors.textDark }]}>• Enter your name, gender, height and weight</Text>
          <Text style={[styles.text, { color: Colors.textDark }]}>• Choose your fitness goal</Text>
          <Text style={[styles.text, { color: Colors.textDark }]}>• Enable wellness tracking if needed</Text>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.primary }]}>2. Add Workouts</Text>
          <Text style={[styles.text, { color: Colors.textDark }]}>• Go to the Workout tab</Text>
          <Text style={[styles.text, { color: Colors.textDark }]}>• Input name, calories, and category</Text>
          <Text style={[styles.text, { color: Colors.textDark }]}>• Optionally save as template</Text>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.primary }]}>3. Set and Track Goals</Text>
          <Text style={[styles.text, { color: Colors.textDark }]}>• Add calorie, weight, or frequency goals</Text>
          <Text style={[styles.text, { color: Colors.textDark }]}>• Track progress with visual bars</Text>
          <Text style={[styles.text, { color: Colors.textDark }]}>• Get XP when completed</Text>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.primary }]}>4. Use the Calendar</Text>
          <Text style={[styles.text, { color: Colors.textDark }]}>• Predict or log your menstrual cycle</Text>
          <Text style={[styles.text, { color: Colors.textDark }]}>• View your wellness phase and adapt workouts</Text>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.primary }]}>5. Explore Social Features</Text>
          <Text style={[styles.text, { color: Colors.textDark }]}>• Post updates with text and images</Text>
          <Text style={[styles.text, { color: Colors.textDark }]}>• Like, comment, and follow your friends</Text>
          <Text style={[styles.text, { color: Colors.textDark }]}>• Filter feed by goal or friend</Text>
        </View>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: Colors.accent }]}
          onPress={() => router.push('/help')}
        ></TouchableOpacity>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
  }
  ,
    backButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
