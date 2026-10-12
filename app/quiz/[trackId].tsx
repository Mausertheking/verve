import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/controls';
import { Card, Meter, Screen, SectionLabel } from '@/components/ui';
import { lessonById, quizForTrack, trackById } from '@/content';
import { pick } from '@/i18n';
import { CountUp, Reveal, usePop, useShake } from '@/motion';
import { useProgress } from '@/storage/progress';
import { colors, radius, serif, space, type } from '@/theme';
import type { Locale, TrackId } from '@/types/content';

const KEYS = ['A', 'B', 'C', 'D'];

/**
 * One answer. Feedback is motion as well as colour: the wrong pick gives a
 * short shake, the right answer settles with a small pop — so the result reads
 * even for someone who can't tell the two border colours apart.
 */
function Option({
  letter, label, answered, isCorrect, isPicked, onPress,
}: {
  letter: string;
  label: string;
  answered: boolean;
  isCorrect: boolean;
  isPicked: boolean;
  onPress: () => void;
}) {
  const { style: shakeStyle, shake } = useShake();
  const { style: popStyle, pop } = usePop();

  useEffect(() => {
    if (!answered) return;
    if (isPicked && !isCorrect) shake();
    if (isCorrect) pop();
    // Only on the moment of answering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered]);

  const wrong = answered && isPicked && !isCorrect;
  const right = answered && isCorrect;

  return (
    <Animated.View style={[shakeStyle, popStyle]}>
      <Pressable
        disabled={answered}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [
          styles.option,
          pressed && styles.optionPressed,
          wrong && styles.optionWrong,
          right && styles.optionRight,
          answered && !wrong && !right && styles.optionDim,
        ]}
      >
        <View style={[styles.key, wrong && styles.keyWrong, right && styles.keyRight]}>
          <Text style={[styles.keyText, (wrong || right) && styles.keyTextOn]}>
            {right ? '✓' : wrong ? '✕' : letter}
          </Text>
        </View>
        <Text style={styles.optionText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

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
          <Reveal>
            <View style={styles.resultBox} accessible accessibilityLabel={`${t('score')} ${score} / ${total}`}>
              <Text style={styles.resultKicker}>{t('resultTitle').toUpperCase()}</Text>
              <View style={styles.resultRow}>
                <CountUp to={score} style={styles.resultScore} duration={700} />
                <Text style={styles.resultTotal}>{`/${total}`}</Text>
              </View>
              <Meter percent={(score / total) * 100} />
              <CountUp
                to={Math.round((score / total) * 100)}
                style={styles.resultPct}
                format={(n) => `${n}%`}
              />
            </View>
          </Reveal>
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
        <Reveal key={question.id}>
          <Text style={styles.qNo}>{`${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`}</Text>
          <Text style={styles.prompt}>{pick(question.prompt, locale)}</Text>
        </Reveal>

        {question.options.map((option, i) => (
          <Reveal key={`${question.id}-${option.id}`} index={i + 1}>
            <Option
              letter={KEYS[i] ?? ''}
              label={pick(option.text, locale)}
              answered={answered}
              isCorrect={option.id === question.correctOptionId}
              isPicked={option.id === picked}
              onPress={() => {
                setPicked(option.id);
                if (option.id === question.correctOptionId) setScore(score + 1);
              }}
            />
          </Reveal>
        ))}

        {/* The explanation always shows once answered — a question is never
            passed over without saying why the answer is what it is. */}
        {answered ? (
          <Reveal>
            <View style={styles.explanation}>
              <Text style={styles.verdict}>
                {picked === question.correctOptionId ? t('correct') : t('notQuite')}
              </Text>
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
          </Reveal>
        ) : null}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  qNo: { fontFamily: serif, fontStyle: 'italic', fontSize: 14, color: colors.accent, marginTop: space.xl },
  prompt: {
    ...type.headline,
    color: colors.textPrimary,
    marginTop: space.sm,
    marginBottom: space.xl,
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
  optionPressed: { backgroundColor: colors.surfaceRaised },
  optionWrong: { borderColor: colors.accent },
  optionRight: { borderColor: colors.textPrimary, backgroundColor: colors.surfaceRaised },
  optionDim: { opacity: 0.55 },
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
  verdict: { fontFamily: serif, fontSize: 18, color: colors.textPrimary, marginBottom: space.xs },
  explanationText: { ...type.small, color: colors.textSecondary },
  reviseTitle: { ...type.h2, fontSize: 14, color: colors.textPrimary },

  resultBox: { paddingVertical: space.xl },
  resultKicker: { ...type.overline, color: colors.accent },
  resultRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: space.md },
  resultScore: { fontFamily: serif, fontSize: 88, lineHeight: 96, color: colors.textPrimary },
  resultTotal: { fontFamily: serif, fontSize: 32, color: colors.textSecondary, marginLeft: 4 },
  resultPct: { fontFamily: serif, fontStyle: 'italic', fontSize: 18, color: colors.accent, marginTop: space.md },
});
