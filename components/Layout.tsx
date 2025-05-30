import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { getColors } from '../constants/colors';
import FloatingNavButton from './NavButton';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const Colors = getColors(theme);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.background }]}>
      <View style={styles.container}>
        {children}
        <FloatingNavButton />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
});
