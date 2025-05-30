import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Layout from '../components/Layout';
import FriendSearch from '../components/FriendSearch';
import FriendRequests from '../components/FriendRequests';
import FriendList from '../components/FriendList';
import { getColors } from '../constants/colors';
import { useTheme } from '../components/context/ThemeContext';

export default function FriendsPage() {
  const router = useRouter();
  const { theme } = useTheme();            
  const Colors = getColors(theme);         

  return (
    <Layout>
      <Text style={[styles.title, { color: Colors.primary }]}>👥 Friends</Text>

      <FriendRequests />
      <FriendList />
      <FriendSearch />

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: Colors.primary }]}
        onPress={() => router.push('/social')}
      >
        <Text style={styles.backButtonText}>⬅ Back to Social</Text>
      </TouchableOpacity>
    </Layout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
