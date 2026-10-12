import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, NumberedItem } from '@/components/controls';
import { PitchDiagram } from '@/components/PitchDiagram';
import { RichText } from '@/components/RichText';
import { SectionLabel, StatusNote, Tag } from '@/components/ui';
import { DiagramExplainer } from '@/components/explainer/DiagramExplainer';
import { hasVideo, VideoSlot } from '@/components/VideoSlot';
import { drillById } from '@/content';
import { pick, pickList } from '@/i18n';
import { Reveal } from '@/motion';
import { useProgress } from '@/storage/progress';
import { colors, serif, space, type } from '@/theme';
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
  let n = 0;

  return (
    <>
      <Stack.Screen options={{ title: t('train') }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <VideoSlot
          key={drill.id}
          videoKey={`drill:${drill.id}`}
          video={drill.video}
          diagram={drill.diagram}
          locale={locale}
        />

        <View style={styles.pad}>
          <Reveal>
            <Text style={styles.kicker}>
              {`${t(SPACE_KEY[drill.space])} · ${t(drill.group === 'solo' ? 'grpSolo' : 'grpGroup')}`.toUpperCase()}
            </Text>
            <Text style={styles.title} accessibilityRole="header">{pick(drill.title, locale)}</Text>
          </Reveal>

          {/* Fact strip: minutes, difficulty, kit — read at a glance. */}
          <Reveal index={1}>
            <View style={styles.facts}>
              <View style={styles.fact}>
                <Text style={styles.factValue}>{drill.minutes}</Text>
                <Text style={styles.factLabel}>{t('min')}</Text>
              </View>
              <View style={[styles.fact, styles.factDivider]}>
                <Text
                  style={styles.factValue}
                  accessibilityLabel={`${t('difficulty')} ${drill.difficulty}/3`}
                >
                  {'●'.repeat(drill.difficulty)}
                  <Text style={styles.factDim}>{'●'.repeat(3 - drill.difficulty)}</Text>
                </Text>
                <Text style={styles.factLabel}>{t('difficulty')}</Text>
              </View>
              <View style={[styles.fact, styles.factDivider, styles.factWide]}>
                <View style={styles.tags}>
                  {drill.equipment.map((e) => <Tag key={e}>{t(EQUIP_KEY[e])}</Tag>)}
                </View>
                <Text style={styles.factLabel}>{t('equipment')}</Text>
              </View>
            </View>
          </Reveal>

          {drill.why ? (
            <>
              <SectionLabel n={++n}>{t('whyDrill')}</SectionLabel>
              <Reveal index={2}>
                <Text style={styles.why}>{pick(drill.why, locale)}</Text>
              </Reveal>
            </>
          ) : null}

          <SectionLabel n={++n}>{t('steps')}</SectionLabel>
          {pickList(drill.steps, locale).map((step, i) => (
            <Reveal key={i} index={i}>
              <NumberedItem n={i + 1}>
                <RichText onPressTerm={openTerm} style={styles.step}>
                  {step}
                </RichText>
              </NumberedItem>
            </Reveal>
          ))}

          {drill.diagram ? (
            <>
              <SectionLabel n={++n}>{t('howItLooks')}</SectionLabel>
              {hasVideo(`drill:${drill.id}`, locale) ? (
                <View style={styles.explainerCard}>
                  <DiagramExplainer key={drill.id} data={drill.diagram} locale={locale} />
                </View>
              ) : (
                <PitchDiagram data={drill.diagram} locale={locale} />
              )}
            </>
          ) : null}

          <SectionLabel n={++n}>{t('whatGood')}</SectionLabel>
          <View style={styles.goodBox}>
            {pickList(drill.whatGoodLooksLike, locale).map((line, i) => (
              <View key={i} style={styles.goodRow}>
                <Text style={styles.goodMark}>✓</Text>
                <Text style={styles.good}>{line}</Text>
              </View>
            ))}
          </View>

          <View style={styles.draft}>
            <StatusNote kind="draft">{`reviewed: false — ${t('draftNote')}`}</StatusNote>
          </View>

          <View style={styles.actions}>
            <Button
              label={done ? `✓ ${t('done')}` : t('markDone')}
              variant={done ? 'ghost' : 'primary'}
              onPress={() => toggleDrill(drill.id)}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: space.xxl * 2 },
  pad: { padding: space.lg + 4 },
  kicker: { ...type.overline, color: colors.accent, marginTop: space.sm },
  title: { ...type.display, color: colors.textPrimary, marginTop: space.sm },

  facts: {
    flexDirection: 'row',
    marginTop: space.xl,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: space.md,
  },
  fact: { paddingHorizontal: space.md, justifyContent: 'space-between', gap: space.xs },
  factWide: { flex: 1 },
  factDivider: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.border },
  factValue: { fontFamily: serif, fontSize: 22, lineHeight: 28, color: colors.textPrimary },
  factDim: { color: colors.surfaceRaised },
  factLabel: { ...type.caption, color: colors.textSecondary },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs + 2 },

  why: { ...type.body, fontSize: 17, lineHeight: 28, color: colors.textPrimary },
  step: { ...type.label, color: colors.textPrimary },
  goodBox: {
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    paddingLeft: space.lg,
    paddingVertical: space.xs,
  },
  goodRow: { flexDirection: 'row', gap: space.sm + 2, marginBottom: space.sm },
  goodMark: { color: colors.accent, fontSize: 14, lineHeight: 21, fontWeight: '700' },
  good: { ...type.label, color: colors.textPrimary, flex: 1 },
  draft: { marginTop: space.xl },
  actions: { marginTop: space.lg },
  explainerCard: {
    aspectRatio: 16 / 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
});
