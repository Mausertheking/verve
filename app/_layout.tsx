import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/i18n';
import { LocaleSync } from '@/components/LanguageSwitch';
import { ProgressProvider } from '@/storage/progress';
import { colors, serif } from '@/theme';

/**
 * Root layout. Header styling is set once here so every screen inherits it.
 *
 * Screen transitions are the platform's own push animation — familiar, fast,
 * and dropped entirely when the system asks for reduced motion.
 */
export default function RootLayout() {
  const reduced = useReducedMotion();
  return (
    <SafeAreaProvider>
      <ProgressProvider>
        <LocaleSync />
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            animation: reduced ? 'none' : 'default',
            contentStyle: { backgroundColor: colors.bg },
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.accent,
            headerTitleStyle: { color: colors.textPrimary, fontSize: 17, fontFamily: serif },
            headerShadowVisible: false,
            // Back buttons show only the chevron. Otherwise iOS labels them
            // with the previous route's name, which for the tab group is
            // the literal "(tabs)".
            headerBackButtonDisplayMode: 'minimal',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="about"
            options={{ presentation: 'modal', animation: reduced ? 'none' : 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="term/[id]"
            options={{ presentation: 'modal', animation: reduced ? 'none' : 'slide_from_bottom' }}
          />
        </Stack>
      </ProgressProvider>
    </SafeAreaProvider>
  );
}
