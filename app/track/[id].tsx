import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/controls';
import { Card, Screen, SectionLabel, StatusNote } from '@/components/ui';
import { lessonsInTrack, quizForTrack, trackById } from '@/content';
import { pick } from '@/i18n';
import { useProgress } from '@/storage/progress';
import { colors, space, type } from '@/theme';
import type { Locale, TrackId } from '@/types/content';

export default function TrackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { progress } = useProgress();

  const track = trackById(id);
  if (!track) return null;

  const lessons = lessonsInTrack(track.id as TrackId);
  const quiz = quizForTrack(track.id as TrackId);
  const doneCount = lessons.filter((l) => progress.lessonsCompleted[l.id]).length;
  // A quiz with no questions written yet is shown as locked, not hidden — the
  // absence is a content state the user should be able to see.
  const quizReady = !!quiz && quiz.questions.length > 0;

  return (
    <>
      <Stack.Screen options={{ title: pick(track.title, locale) }} />
      <Screen>
        <Text style={styles.progress}>
          {`${doneCount} / ${lessons.length} ${t('ofDone')}`}
        </Text>

        {lessons.map((lesson, i) => {
          const title = pick(lesson.title, locale);
          const isDone = !!progress.lessonsCompleted[lesson.id];
          return (
            <Card
              key={lesson.id}
              accessibilityLabel={`${i + 1}. ${title}${isDone ? `, ${t('done')}` : ''}`}
              onPress={() => router.push(`/lesson/${lesson.id}`)}
            >
              <View style={styles.row}>
                <View style={styles.grow}>
                  <Text style={styles.title}>{`${i + 1}. ${title}`}</Text>
                  <Text style={styles.meta}>
                    {`${lesson.estMinutes} ${t('min')}${lesson.status === 'todo' ? ' · TODO' : ''}`}
                  </Text>
                </View>
                <Text style={styles.chevron}>{isDone ? '✓' : '›'}</Text>
              </View>
            </Card>
          );
        })}

        <SectionLabel>{t('score')}</SectionLabel>
        {quizReady ? (
          <Button label={t('startQuiz')} onPress={() => router.push(`/quiz/${track.id}`)} />
        ) : (
          <>
            <Button label={t('quizLocked')} disabled />
            <View style={styles.note}>
              <StatusNote kind="todo">{t('quizTodo')}</StatusNote>
            </View>
          </>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  progress: { ...type.caption, color: colors.textSecondary, marginBottom: space.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  grow: { flex: 1 },
  title: { ...type.h2, color: colors.textPrimary },
  meta: { ...type.small, color: colors.textSecondary, marginTop: 2 },
  chevron: { color: colors.accent, fontSize: 20, lineHeight: 24 },
  note: { marginTop: space.md },
});
