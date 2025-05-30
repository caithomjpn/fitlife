import { Stack } from 'expo-router';
import { ThemeProvider } from '../components/context/ThemeContext';

export default function Layout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
