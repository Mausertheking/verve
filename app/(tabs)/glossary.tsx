import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui';
import { glossary } from '@/content';
import { pick } from '@/i18n';
import { colors, space, type } from '@/theme';
import type { Locale } from '@/types/content';

export default function GlossaryScreen() {
  const { i18n } = useTranslation();
  const locale = i18n.language as Locale;

  return (
    <Screen>
      {glossary.map((term) => (
        <View key={term.id} style={styles.item}>
          {/* Azerbaijani leads, with the Russian and English forms beneath —
              the point of the glossary is the mapping between them. */}
          <Text style={styles.az}>{term.term.az}</Text>
          <Text style={styles.other}>{`${term.term.ru} · ${term.term.en}`}</Text>
          <Text style={styles.definition}>{pick(term.definition, locale)}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: space.md + 1,
  },
  az: { ...type.h2, color: colors.textPrimary },
  other: { ...type.small, color: colors.textSecondary, marginTop: 3 },
  definition: { ...type.small, color: colors.textSecondary, marginTop: space.sm - 2 },
});
