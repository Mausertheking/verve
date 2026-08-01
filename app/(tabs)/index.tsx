import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card, Meter, Screen, Tag } from '@/components/ui';
import { lessonsInTrack, tracks } from '@/content';
import { pick } from '@/i18n';
import { colors, space, type } from '@/theme';
import type { Locale } from '@/types/content';

export default function LearnScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;

  return (
    <Screen>
      {tracks.map((track) => {
        const count = lessonsInTrack(track.id).length;
        const title = pick(track.title, locale);
        return (
          <Card key={track.id} accessibilityLabel={`${title}, ${count} ${t('lessons')}`}>
            <View style={styles.row}>
              <Text style={styles.title}>{title}</Text>
              <Tag>{`${count} ${t('lessons')}`}</Tag>
            </View>
            <Text style={styles.summary}>{pick(track.summary, locale)}</Text>
            <Meter percent={0} />
            <Text style={styles.meterLabel}>{t('notStarted')}</Text>
          </Card>
        );
      })}
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
  // flexShrink lets long Azerbaijani and Russian titles wrap instead of
  // pushing the tag off the edge.
  title: { ...type.h2, color: colors.textPrimary, flexShrink: 1 },
  summary: { ...type.small, color: colors.textSecondary, marginTop: space.xs },
  meterLabel: { ...type.caption, color: colors.textSecondary, marginTop: space.sm - 2 },
});
