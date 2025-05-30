import React, { useState } from 'react';
import {
  View, TouchableOpacity, Text, StyleSheet, Modal, FlatList, Pressable,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../components/context/ThemeContext';
import { getColors } from '../constants/colors';

const pages = [
  { name: 'Home', route: '/home', emoji: '🏠' },
  { name: 'Profile', route: '/profile', emoji: '👤' },
  { name: 'Workouts', route: '/workouts', emoji: '🏋️' },
  { name: 'Goals', route: '/goals', emoji: '🎯' },
  { name: 'Progress', route: '/progress', emoji: '📈' },
  { name: 'Social', route: '/social', emoji: '👥' },
  { name: 'Settings', route: '/settings', emoji: '⚙️' },
] as const;

type PageRoute = (typeof pages)[number]['route'];

const NavButton = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();
  const Colors = getColors(theme);

  const navigateTo = (route: PageRoute) => {
    setModalVisible(false);
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.navButton, { backgroundColor: Colors.primary }]} onPress={() => setModalVisible(true)}>
        <Text style={styles.navButtonText}>📌 三</Text>
      </TouchableOpacity>


      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors.background }]}>
            <FlatList
              data={pages}
              keyExtractor={(item) => item.route}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.menuItem,
                    currentPath === item.route && { backgroundColor: Colors.accent, borderRadius: 5 },
                    pressed && { backgroundColor: '#e0e0e0' },
                  ]}
                  onPress={() => navigateTo(item.route)}
                >
                  <Text style={currentPath === item.route ? [styles.activeText, { color: '#fff' }] : [styles.menuText, { color: Colors.textDark }]}>  
                    {item.emoji} {item.name}
                  </Text>
                </Pressable>
              )}
            />
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: pressed ? '#cc2b20' : '#ff3b30' },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: -250,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  currentPageText: {
    marginTop: 8,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  menuItem: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuText: {
    fontSize: 18,
  },
  activeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default NavButton;
