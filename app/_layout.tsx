import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/i18n';
import { ProgressProvider } from '@/storage/progress';
import { colors } from '@/theme';

/**
 * Root layout. Header styling is set once here so every screen inherits it.
 *
 * `animation: 'none'` is deliberate: v1 ships with no motion at all, including
 * screen transitions. Screens appear in their final state.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ProgressProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            animation: 'none',
            contentStyle: { backgroundColor: colors.bg },
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.accent,
            headerTitleStyle: { color: colors.textPrimary, fontSize: 17, fontWeight: '600' },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="term/[id]" options={{ presentation: 'modal' }} />
        </Stack>
      </ProgressProvider>
    </SafeAreaProvider>
  );
}
