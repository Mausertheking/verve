import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, NumberedItem } from '@/components/controls';
import { PitchDiagram } from '@/components/PitchDiagram';
import { RichText } from '@/components/RichText';
import { Card, SectionLabel, StatusNote, Tag } from '@/components/ui';
import { VideoSlot } from '@/components/VideoSlot';
import { drillById } from '@/content';
import { pick, pickList } from '@/i18n';
import { useProgress } from '@/storage/progress';
import { colors, space, type } from '@/theme';
import type { Equipment, Locale, SpaceNeed } from '@/types/content';

const SPACE_KEY: Record<SpaceNeed, string> = {
  bedroom: 'spaceBedroom', yard: 'spaceYard', 'half-pitch': 'spaceHalfPitch',
};
const EQUIP_KEY: Record<Equipment, string> = {
  none: 'eqNone', ball: 'eqBall', cones: 'eqCones', wall: 'eqWall', partner: 'eqPartner',
};

export default function DrillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { progress, toggleDrill } = useProgress();

  const drill = drillById(id);
  if (!drill) return null;

  const done = !!progress.drillsDone[drill.id];
  const openTerm = (termId: string) => router.push(`/term/${termId}`);

  return (
    <>
      <Stack.Screen options={{ title: pick(drill.title, locale) }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <VideoSlot video={drill.video} />

        <View style={styles.pad}>
          <View style={styles.tags}>
            <Tag>{t(SPACE_KEY[drill.space])}</Tag>
            <Tag>{drill.equipment.map((e) => t(EQUIP_KEY[e])).join(' + ')}</Tag>
            <Tag>{t(drill.group === 'solo' ? 'grpSolo' : 'grpGroup')}</Tag>
            <Tag>{`${drill.minutes} ${t('min')}`}</Tag>
            <Tag>{'●'.repeat(drill.difficulty) + '○'.repeat(3 - drill.difficulty)}</Tag>
          </View>

          <SectionLabel>{t('steps')}</SectionLabel>
          {pickList(drill.steps, locale).map((step, i) => (
            <NumberedItem key={i} n={i + 1}>
              <RichText onPressTerm={openTerm} style={styles.step}>
                {step}
              </RichText>
            </NumberedItem>
          ))}

          {drill.diagram ? (
            <>
              <SectionLabel>{t('howItLooks')}</SectionLabel>
              <PitchDiagram data={drill.diagram} locale={locale} />
            </>
          ) : null}

          <SectionLabel>{t('whatGood')}</SectionLabel>
          <Card accessibilityLabel={t('whatGood')}>
            {pickList(drill.whatGoodLooksLike, locale).map((line, i) => (
              <Text key={i} style={styles.good}>
                {line}
              </Text>
            ))}
          </Card>

          <View style={styles.draft}>
            <StatusNote kind="draft">{`reviewed: false — ${t('draftNote')}`}</StatusNote>
          </View>

          <Button
            label={done ? `✓ ${t('done')}` : t('markDone')}
            variant={done ? 'ghost' : 'primary'}
            onPress={() => toggleDrill(drill.id)}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: space.xxl },
  pad: { padding: space.lg },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm - 2 },
  step: { ...type.label, color: colors.textPrimary },
  good: { ...type.label, color: colors.textPrimary, marginBottom: space.sm - 2 },
  draft: { marginTop: space.md },
});
