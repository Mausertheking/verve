import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SearchInput } from '@/components/controls';
import { EmptyState, Hero, Screen } from '@/components/ui';
import { glossary } from '@/content';
import { pick } from '@/i18n';
import { PressableScale, Reveal } from '@/motion';
import { colors, serif, space, type } from '@/theme';
import { LOCALES, type Locale } from '@/types/content';

export default function GlossaryScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  /* Searches all three languages regardless of the active locale: someone who
     only knows the Russian word still needs to find the Azerbaijani one. */
  const results = glossary.filter((term) => {
    if (!q) return true;
    if (LOCALES.some((L) => term.term[L].toLowerCase().includes(q))) return true;
    return (term.alsoKnownAs ?? []).some((alias) => alias.toLowerCase().includes(q));
  });

  return (
    <Screen topInset>
      <Hero kicker={t('glossaryKicker')} title={t('glossaryTitle')} />
      <SearchInput value={query} onChangeText={setQuery} placeholder={t('searchTerm')} />

      {results.length === 0 ? (
        <EmptyState title={t('noResults')} body="" />
      ) : (
        <View style={styles.list}>
          {results.map((term, i) => (
            <Reveal key={term.id} index={i}>
              <PressableScale
                scaleTo={0.99}
                accessibilityRole="button"
                accessibilityLabel={term.term.az}
                onPress={() => router.push(`/term/${term.id}`)}
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              >
                <Text style={styles.az}>{term.term.az}</Text>
                <Text style={styles.other}>{`${term.term.ru} · ${term.term.en}`}</Text>
                <Text style={styles.definition} numberOfLines={2}>
                  {pick(term.definition, locale)}
                </Text>
              </PressableScale>
            </Reveal>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: space.sm },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: space.md + 1,
  },
  itemPressed: { backgroundColor: colors.surface },
  az: { fontFamily: serif, fontSize: 20, lineHeight: 26, color: colors.textPrimary },
  other: { ...type.small, color: colors.accent, marginTop: 3 },
  definition: { ...type.small, color: colors.textSecondary, marginTop: space.sm - 2 },
});
