import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card, Meter, Screen, SectionLabel, Tag } from '@/components/ui';
import { lessons, lessonsInTrack, tracks } from '@/content';
import { pick } from '@/i18n';
import { useProgress } from '@/storage/progress';
import { colors, space, type } from '@/theme';
import type { Locale } from '@/types/content';

export default function LearnScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { progress } = useProgress();

  const startedAny = Object.keys(progress.lessonsCompleted).length > 0;
  const resume = startedAny ? lessons.find((l) => !progress.lessonsCompleted[l.id]) : undefined;

  return (
    <Screen>
      {tracks.map((track) => {
        const trackLessons = lessonsInTrack(track.id);
        const done = trackLessons.filter((l) => progress.lessonsCompleted[l.id]).length;
        const percent = trackLessons.length ? (done / trackLessons.length) * 100 : 0;
        const title = pick(track.title, locale);

        return (
          <Card
            key={track.id}
            accessibilityLabel={`${title}, ${done} / ${trackLessons.length} ${t('ofDone')}`}
            onPress={() => router.push(`/track/${track.id}`)}
          >
            <View style={styles.row}>
              <Text style={styles.title}>{title}</Text>
              <Tag>{`${trackLessons.length} ${t('lessons')}`}</Tag>
            </View>
            <Text style={styles.summary}>{pick(track.summary, locale)}</Text>
            <Meter percent={percent} />
            <Text style={styles.meterLabel}>
              {done > 0 ? `${done} / ${trackLessons.length} ${t('ofDone')}` : t('notStarted')}
            </Text>
          </Card>
        );
      })}

      {resume ? (
        <>
          <SectionLabel>{t('continue')}</SectionLabel>
          <Card
            accessibilityLabel={pick(resume.title, locale)}
            onPress={() => router.push(`/lesson/${resume.id}`)}
          >
            <View style={styles.row}>
              <Text style={styles.title}>{pick(resume.title, locale)}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.md,
  },
  // flexShrink lets long Azerbaijani and Russian titles wrap rather than
  // pushing the tag off the edge.
  title: { ...type.h2, color: colors.textPrimary, flexShrink: 1 },
  summary: { ...type.small, color: colors.textSecondary, marginTop: space.xs },
  meterLabel: { ...type.caption, color: colors.textSecondary, marginTop: space.sm - 2 },
  chevron: { color: colors.accent, fontSize: 20, lineHeight: 24 },
});
