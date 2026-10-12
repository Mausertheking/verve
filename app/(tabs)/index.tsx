import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LanguageSwitch } from '@/components/LanguageSwitch';
import { Card, Hero, Meter, Screen, SectionLabel } from '@/components/ui';
import { VerveMark } from '@/components/VerveMark';
import { drills, lessons, lessonsInTrack, quizzes, tracks } from '@/content';
import { pick } from '@/i18n';
import { CountUp, Reveal } from '@/motion';
import { useProgress } from '@/storage/progress';
import { colors, serif, space, type } from '@/theme';
import type { Locale } from '@/types/content';

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

export default function LearnScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { progress } = useProgress();

  const startedAny = Object.keys(progress.lessonsCompleted).length > 0;
  const resume = startedAny ? lessons.find((l) => !progress.lessonsCompleted[l.id]) : undefined;

  const stats = [
    { label: t('statLessons'), done: Object.keys(progress.lessonsCompleted).length, of: lessons.length },
    { label: t('statDrills'), done: Object.keys(progress.drillsDone).length, of: drills.length },
    {
      label: t('statQuizzes'),
      done: Object.keys(progress.quizResults).length,
      of: quizzes.filter((q) => q.questions.length > 0).length,
    },
  ];

  return (
    <Screen topInset>
      <Hero
        kicker={t('heroKicker')}
        title={t('heroTitle')}
        lead={t('heroLead', { lessons: lessons.length, drills: drills.length })}
        aside={
          <View style={styles.brandRow}>
            <VerveMark size={32} />
            <LanguageSwitch />
          </View>
        }
      />

      <SectionLabel n={1}>{t('yourProgress')}</SectionLabel>
      <Reveal index={2}>
        <View style={styles.stats}>
          {stats.map((s, i) => (
            <View key={s.label} style={[styles.stat, i > 0 && styles.statDivider]}>
              <View style={styles.statNum}>
                <CountUp to={s.done} style={styles.statValue} />
                <Text style={styles.statOf}>{`/${s.of}`}</Text>
              </View>
              <Text style={styles.statLabel} numberOfLines={2}>{s.label}</Text>
            </View>
          ))}
        </View>
      </Reveal>

      {resume ? (
        <>
          <SectionLabel n={2}>{t('continue')}</SectionLabel>
          <Card
            index={3}
            accessibilityLabel={pick(resume.title, locale)}
            onPress={() => router.push(`/lesson/${resume.id}`)}
          >
            <View style={styles.row}>
              <Text style={styles.resumeTitle}>{pick(resume.title, locale)}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Card>
        </>
      ) : null}

      <SectionLabel n={resume ? 3 : 2}>{t('tracksLabel')}</SectionLabel>
      {tracks.map((track, i) => {
        const trackLessons = lessonsInTrack(track.id);
        const done = trackLessons.filter((l) => progress.lessonsCompleted[l.id]).length;
        const percent = trackLessons.length ? (done / trackLessons.length) * 100 : 0;
        const title = pick(track.title, locale);

        return (
          <Card
            key={track.id}
            index={i + 4}
            accessibilityLabel={`${title}, ${done} / ${trackLessons.length} ${t('ofDone')}`}
            onPress={() => router.push(`/track/${track.id}`)}
          >
            <View style={styles.trackHead}>
              <Text style={styles.roman}>{ROMAN[i]}</Text>
              <Text style={styles.trackMeta}>{`${trackLessons.length} ${t('lessons')}`}</Text>
            </View>
            <Text style={styles.trackTitle}>{title}</Text>
            <Text style={styles.summary}>{pick(track.summary, locale)}</Text>
            <Meter percent={percent} />
            <Text style={styles.meterLabel}>
              {done > 0 ? `${done} / ${trackLessons.length} ${t('ofDone')}` : t('notStarted')}
            </Text>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  stats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: space.lg,
  },
  stat: { flex: 1, paddingHorizontal: space.md },
  statDivider: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.border },
  statNum: { flexDirection: 'row', alignItems: 'baseline' },
  statValue: { fontFamily: serif, fontSize: 30, lineHeight: 36, color: colors.textPrimary },
  statOf: { fontFamily: serif, fontSize: 15, color: colors.textSecondary, marginLeft: 2 },
  statLabel: { ...type.caption, color: colors.textSecondary, marginTop: 2 },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  resumeTitle: { ...type.headline, fontSize: 18, lineHeight: 24, color: colors.textPrimary, flexShrink: 1 },

  trackHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  roman: { fontFamily: serif, fontStyle: 'italic', fontSize: 15, color: colors.accent },
  trackMeta: { ...type.overline, color: colors.textSecondary },
  // flexShrink lets long Azerbaijani and Russian titles wrap rather than clip.
  trackTitle: { ...type.headline, color: colors.textPrimary, marginTop: space.sm, flexShrink: 1 },
  summary: { ...type.small, color: colors.textSecondary, marginTop: space.xs },
  meterLabel: { ...type.caption, color: colors.textSecondary, marginTop: space.sm - 2 },
  chevron: { color: colors.accent, fontSize: 22, lineHeight: 26 },
});
