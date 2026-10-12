import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/controls';
import { Screen, StatusNote } from '@/components/ui';
import { lessonById, termById } from '@/content';
import { pick } from '@/i18n';
import { colors, serif, space, type } from '@/theme';
import type { Locale } from '@/types/content';

/**
 * A glossary entry, opened from a tapped term inside a lesson or drill.
 * Presented as a modal so the reader keeps her place in the text behind it.
 */
export default function TermScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;

  const term = termById(id);
  if (!term) return null;

  const lesson = term.seeLessonId ? lessonById(term.seeLessonId) : undefined;

  return (
    <>
      <Stack.Screen options={{ title: term.term.az, presentation: 'modal' }} />
      <Screen>
        <Text style={styles.term}>{term.term.az}</Text>
        {/* All three languages always, regardless of the active locale — the
            mapping between them is the whole point of the glossary. */}
        <Text style={styles.other}>{`${term.term.ru} · ${term.term.en}`}</Text>
        {term.alsoKnownAs?.length ? (
          <Text style={styles.aka}>{`${t('alsoKnown')}: ${term.alsoKnownAs.join(', ')}`}</Text>
        ) : null}

        <Text style={styles.definition}>{pick(term.definition, locale)}</Text>

        {lesson ? (
          <Button
            label={`${pick(lesson.title, locale)} ›`}
            variant="ghost"
            onPress={() => router.replace(`/lesson/${lesson.id}`)}
          />
        ) : null}

        <View style={styles.note}>
          <StatusNote kind="draft">{t('reviewPending')}</StatusNote>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  term: { fontFamily: serif, fontSize: 32, lineHeight: 40, color: colors.textPrimary },
  other: { ...type.label, color: colors.accent, marginTop: space.xs },
  aka: { ...type.caption, color: colors.textSecondary, marginTop: space.xs },
  definition: {
    ...type.body,
    fontSize: 17,
    lineHeight: 28,
    color: colors.textPrimary,
    marginTop: space.xl,
    paddingTop: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  note: { marginTop: space.lg },
});
