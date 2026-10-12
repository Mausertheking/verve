import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PressableScale } from '@/motion';
import { useProgress } from '@/storage/progress';
import { colors, radius } from '@/theme';
import { LOCALES, type Locale } from '@/types/content';

/**
 * AZ · RU · EN. The choice is saved with progress, on the device only —
 * nothing inspects the phone's own language setting.
 */
export function LanguageSwitch() {
  const { t, i18n } = useTranslation();
  const { setLocale } = useProgress();
  const current = i18n.language as Locale;

  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={t('language')}>
      {LOCALES.map((L) => {
        const on = L === current;
        return (
          <PressableScale
            key={L}
            onPress={() => {
              void i18n.changeLanguage(L);
              setLocale(L);
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={L.toUpperCase()}
            hitSlop={{ top: 8, bottom: 8 }}
            style={[styles.item, on && styles.itemOn]}
          >
            <Text style={[styles.text, on && styles.textOn]}>{L.toUpperCase()}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

/** Applies the saved language once progress has loaded from storage. */
export function LocaleSync() {
  const { i18n } = useTranslation();
  const { progress, ready } = useProgress();
  useEffect(() => {
    if (ready && progress.locale !== i18n.language) void i18n.changeLanguage(progress.locale);
  }, [ready, progress.locale, i18n]);
  return null;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    padding: 2,
  },
  item: {
    minWidth: 38,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  itemOn: { backgroundColor: colors.accent },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: colors.textSecondary },
  textOn: { color: colors.onAccent },
});
