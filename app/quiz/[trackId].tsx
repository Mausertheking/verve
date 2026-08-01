import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/controls';
import { Card, Meter, Screen, SectionLabel } from '@/components/ui';
import { lessonById, quizForTrack, trackById } from '@/content';
import { pick } from '@/i18n';
import { useProgress } from '@/storage/progress';
import { colors, radius, space, type } from '@/theme';
import type { Locale, TrackId } from '@/types/content';

const KEYS = ['A', 'B', 'C', 'D'];

export default function QuizScreen() {
  const { trackId } = useLocalSearchParams<{ trackId: string }>();
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { recordQuiz } = useProgress();

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quiz = quizForTrack(trackId as TrackId);
  const track = trackById(trackId);
  if (!quiz || quiz.questions.length === 0) return null;

  const question = quiz.questions[index];
  if (!question) return null;

  const answered = picked !== null;
  const total = quiz.questions.length;

  const advance = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      setPicked(null);
    } else {
      setFinished(true);
      recordQuiz(quiz.id, score, total);
    }
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <>
        <Stack.Screen options={{ title: t('results') }} />
        <Screen>
          <Card accessibilityLabel={`${t('score')} ${score} / ${total}`}>
            <View style={styles.resultBox}>
              <Text style={styles.resultScore}>{`${score}/${total}`}</Text>
              <Text style={styles.resultPct}>{`${Math.round((score / total) * 100)}%`}</Text>
            </View>
          </Card>
          <Button label={t('retry')} onPress={restart} />
          <Button
            label={track ? pick(track.title, locale) : t('learn')}
            variant="ghost"
            onPress={() => router.back()}
          />
        </Screen>
      </>
    );
  }

  const revise = question.reviseLessonId ? lessonById(question.reviseLessonId) : undefined;

  return (
    <>
      <Stack.Screen
        options={{ title: `${track ? pick(track.title, locale) : ''} · ${index + 1}/${total}` }}
      />
      <Screen>
        <Meter percent={(index / total) * 100} />
        <Text style={styles.prompt}>{pick(question.prompt, locale)}</Text>

        {question.options.map((option, i) => {
          const isCorrect = option.id === question.correctOptionId;
          const isPicked = option.id === picked;
          return (
            <Pressable
              key={option.id}
              disabled={answered}
              accessibilityRole="button"
              accessibilityLabel={pick(option.text, locale)}
              onPress={() => {
                setPicked(option.id);
                if (isCorrect) setScore(score + 1);
              }}
              style={[
                styles.option,
                answered && isPicked && !isCorrect && styles.optionWrong,
                answered && isCorrect && styles.optionRight,
              ]}
            >
              <View
                style={[
                  styles.key,
                  answered && isPicked && !isCorrect && styles.keyWrong,
                  answered && isCorrect && styles.keyRight,
                ]}
              >
                <Text
                  style={[
                    styles.keyText,
                    answered && (isCorrect || isPicked) && styles.keyTextOn,
                  ]}
                >
                  {KEYS[i]}
                </Text>
              </View>
              <Text style={styles.optionText}>{pick(option.text, locale)}</Text>
            </Pressable>
          );
        })}

        {/* The explanation always shows once answered — a question is never
            passed over without saying why the answer is what it is. */}
        {answered ? (
          <>
            <View style={styles.explanation}>
              <Text style={styles.explanationText}>{pick(question.explanation, locale)}</Text>
            </View>

            {revise ? (
              <>
                <SectionLabel>{t('relatedLesson')}</SectionLabel>
                <Card
                  accessibilityLabel={pick(revise.title, locale)}
                  onPress={() => router.push(`/lesson/${revise.id}`)}
                >
                  <Text style={styles.reviseTitle}>{pick(revise.title, locale)}</Text>
                </Card>
              </>
            ) : null}

            <Button label={index + 1 < total ? t('next') : t('results')} onPress={advance} />
          </>
        ) : null}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  prompt: {
    ...type.body,
    fontSize: 17,
    color: colors.textPrimary,
    marginTop: space.lg,
    marginBottom: space.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md - 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 13,
    marginBottom: space.sm + 1,
  },
  optionWrong: { borderColor: colors.accent },
  optionRight: { borderColor: colors.textPrimary },
  key: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyWrong: { backgroundColor: colors.accent, borderColor: colors.accent },
  keyRight: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  keyText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  keyTextOn: { color: colors.bg },
  optionText: { ...type.label, color: colors.textPrimary, flex: 1 },

  explanation: {
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    paddingLeft: space.md,
    paddingVertical: space.sm + 2,
    marginBottom: space.md,
  },
  explanationText: { ...type.small, color: colors.textSecondary },
  reviseTitle: { ...type.h2, fontSize: 14, color: colors.textPrimary },

  resultBox: { alignItems: 'center', paddingVertical: space.xl },
  resultScore: { fontSize: 44, fontWeight: '700', color: colors.accent },
  resultPct: { ...type.label, color: colors.textSecondary, marginTop: space.sm },
});
