import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';

import { colors } from '@/theme';

/**
 * Simple geometric tab icons — no icon font, nothing downloaded.
 * Shapes rather than glyphs so they stay legible at small sizes outdoors.
 */
function TabIcon({ shape, color }: { shape: 'learn' | 'train' | 'teams' | 'glossary'; color: ColorValue }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      {shape === 'learn' && <Polygon points="10,2 18,10 10,18 2,10" fill={color} />}
      {shape === 'train' && <Polygon points="10,3 18,17 2,17" fill={color} />}
      {shape === 'teams' && <Circle cx={10} cy={10} r={7.5} fill={color} />}
      {shape === 'glossary' && <Rect x={3} y={3} width={14} height={14} rx={2} fill={color} />}
    </Svg>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        animation: 'none',
        sceneStyle: { backgroundColor: colors.bg },
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { color: colors.textPrimary, fontSize: 17, fontWeight: '600' },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('learn'),
          tabBarAccessibilityLabel: t('learn'),
          tabBarIcon: ({ color }) => <TabIcon shape="learn" color={color} />,
        }}
      />
      <Tabs.Screen
        name="train"
        options={{
          title: t('train'),
          tabBarAccessibilityLabel: t('train'),
          tabBarIcon: ({ color }) => <TabIcon shape="train" color={color} />,
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: t('teams'),
          tabBarAccessibilityLabel: t('teams'),
          tabBarIcon: ({ color }) => <TabIcon shape="teams" color={color} />,
        }}
      />
      <Tabs.Screen
        name="glossary"
        options={{
          title: t('glossary'),
          tabBarAccessibilityLabel: t('glossary'),
          tabBarIcon: ({ color }) => <TabIcon shape="glossary" color={color} />,
        }}
      />
    </Tabs>
  );
}
