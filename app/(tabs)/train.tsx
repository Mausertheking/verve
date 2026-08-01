import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card, Screen, Tag } from '@/components/ui';
import { drills } from '@/content';
import { pick } from '@/i18n';
import { colors, space, type } from '@/theme';
import type { Locale } from '@/types/content';

const SPACE_KEY = { bedroom: 'spaceBedroom', yard: 'spaceYard', 'half-pitch': 'spaceHalfPitch' } as const;

export default function TrainScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;

  return (
    <Screen>
      <Text style={styles.count}>{`${drills.length} ${t('results_n')}`}</Text>
      {drills.map((drill) => {
        const title = pick(drill.title, locale);
        return (
          <Card key={drill.id} accessibilityLabel={`${title}, ${drill.minutes} ${t('min')}`}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.tags}>
              <Tag>{t(SPACE_KEY[drill.space])}</Tag>
              <Tag>{`${drill.minutes} ${t('min')}`}</Tag>
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  count: { ...type.caption, color: colors.textSecondary, marginBottom: space.md },
  title: { ...type.h2, color: colors.textPrimary },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm - 2, marginTop: space.sm + 1 },
});
