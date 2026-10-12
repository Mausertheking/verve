import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/controls';
import { Card, Hero, Meter, Screen, SectionLabel, StatusNote } from '@/components/ui';
import { hasVideo } from '@/components/VideoSlot';
import { lessonsInTrack, quizForTrack, trackById } from '@/content';
import { pick } from '@/i18n';
import { useProgress } from '@/storage/progress';
import { colors, serif, space, type } from '@/theme';
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
  const best = quiz ? progress.quizResults[quiz.id] : undefined;

  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <Screen>
        <Hero
          kicker={`${lessons.length} ${t('lessons')}`}
          title={pick(track.title, locale)}
          lead={pick(track.summary, locale)}
        />
        <Meter percent={lessons.length ? (doneCount / lessons.length) * 100 : 0} />
        <Text style={styles.progress}>{`${doneCount} / ${lessons.length} ${t('ofDone')}`}</Text>

        <SectionLabel n={1}>{t('statLessons')}</SectionLabel>
        {lessons.map((lesson, i) => {
          const title = pick(lesson.title, locale);
          const isDone = !!progress.lessonsCompleted[lesson.id];
          return (
            <Card
              key={lesson.id}
              index={i}
              accessibilityLabel={`${i + 1}. ${title}${isDone ? `, ${t('done')}` : ''}`}
              onPress={() => router.push(`/lesson/${lesson.id}`)}
            >
              <View style={styles.row}>
                <Text style={[styles.num, isDone && styles.numDone]}>
                  {String(i + 1).padStart(2, '0')}
                </Text>
                <View style={styles.grow}>
                  <Text style={styles.title}>{title}</Text>
                  <Text style={styles.meta}>
                    {`${lesson.estMinutes} ${t('min')}${hasVideo(`lesson:${lesson.id}`, locale) ? ` · ▶ ${t('videoLabel')}` : lesson.diagram ? ` · ${t('explainerShort')}` : ''}${lesson.status === 'todo' ? ' · TODO' : ''}`}
                  </Text>
                </View>
                <Text style={styles.chevron}>{isDone ? '✓' : '›'}</Text>
              </View>
            </Card>
          );
        })}

        <SectionLabel n={2}>{t('quizKicker')}</SectionLabel>
        {quizReady ? (
          <>
            {best ? (
              <Text style={styles.best}>{`${best.bestScore}/${best.total}`}</Text>
            ) : null}
            <Button label={t('startQuiz')} onPress={() => router.push(`/quiz/${track.id}`)} />
          </>
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
  progress: { ...type.caption, color: colors.textSecondary, marginTop: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md + 2 },
  num: { fontFamily: serif, fontStyle: 'italic', fontSize: 18, color: colors.textSecondary, width: 26 },
  numDone: { color: colors.accent },
  grow: { flex: 1 },
  title: { ...type.h2, fontSize: 16, color: colors.textPrimary },
  meta: { ...type.small, color: colors.textSecondary, marginTop: 2 },
  chevron: { color: colors.accent, fontSize: 22, lineHeight: 26 },
  best: { fontFamily: serif, fontSize: 28, color: colors.textPrimary, marginBottom: space.xs },
  note: { marginTop: space.md },
});
