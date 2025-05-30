import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../components/context/ThemeContext';
import { getColors } from '../constants/colors';
import * as Linking from 'expo-linking';

export default function Help() {
  const router = useRouter();
  const { theme } = useTheme();
  const Colors = getColors(theme);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: Colors.background }]}>
      <Text style={[styles.title, { color: Colors.primary }]}>Help & Support</Text>

      {/* FAQs Section */}
      <View style={[styles.section, {backgroundColor: theme === 'dark' ? Colors.background : '#fff'
}]}>
        <Text style={[styles.sectionTitle, { color: Colors.primary }]}>Frequently Asked Questions</Text>
        <Text style={[styles.question, { color: Colors.textDark }]}>• How do I set my fitness goals?</Text>
        <Text style={[styles.question, { color: Colors.textDark }]}>• How can I track my progress?</Text>
        <Text style={[styles.question, { color: Colors.textDark }]}>• How do I reset my password?</Text>
        <Text style={[styles.question, { color: Colors.textDark }]}>• How do I personalize my workout plan?</Text>
        <Text style={[styles.question, { color: Colors.textDark }]}>• How can I join challenges and interact with friends?</Text>
      </View>

      {/* Tutorials Section */}
      <View style={[styles.section, { backgroundColor: theme === 'dark' ? Colors.background : '#fff'
}]}>
        <Text style={[styles.sectionTitle, { color: Colors.primary }]}>Tutorials</Text>
<TouchableOpacity
  style={[styles.button, { backgroundColor: Colors.primary }]}
  onPress={() => Linking.openURL('https://www.canva.com/design/DAGo2Oxtf0M/Cus16WUGe5XEh756lopKBQ/watch?utm_content=DAGo2Oxtf0M&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=he2fb659f92')}
>
  <Text style={styles.buttonText}>📹 Watch Video Tutorials</Text>
</TouchableOpacity>
<TouchableOpacity
  style={[styles.button, { backgroundColor: Colors.primary }]}
  onPress={() => router.push('/stepByStepGuide')}
>
  <Text style={styles.buttonText}>📄 Read Step-by-Step Guides</Text>
</TouchableOpacity>
      </View>

      {/* Contact Support Section */}
      <View style={[styles.section, { backgroundColor: theme === 'dark' ? Colors.background : '#fff'
 }]}>
        <Text style={[styles.sectionTitle, { color: Colors.primary }]}>Contact Support</Text>
        <Text style={[styles.info, { color: Colors.textDark }]}>📧 support@fitlifeapp.com</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: Colors.secondary }]}>
          <Text style={styles.buttonText}>✉️ Send Us a Message</Text>
        </TouchableOpacity>
      </View>

      {/* Tips Section */}
      <View style={[styles.section, { backgroundColor: theme === 'dark' ? Colors.background : '#fff'
 }]}>
        <Text style={[styles.sectionTitle, { color: Colors.primary }]}>App Usage Tips</Text>
        <Text style={[styles.tip, { color: Colors.textDark }]}>✅ Stay consistent with your goals!</Text>
        <Text style={[styles.tip, { color: Colors.textDark }]}>✅ Use social features to stay motivated.</Text>
        <Text style={[styles.tip, { color: Colors.textDark }]}>✅ Log your meals and workouts regularly.</Text>
      </View>

      {/* Go Back to Settings Button */}
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: Colors.accent }]}
        onPress={() => router.push('/settings')}
      >
        <Text style={styles.backButtonText}>⬅️ Go Back to Settings</Text>
      </TouchableOpacity>
    </ScrollView>
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
    marginBottom: 25,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  question: {
    fontSize: 16,
    marginBottom: 5,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
  tip: {
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
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
