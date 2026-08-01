import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Chip } from '@/components/controls';
import { Card, EmptyState, Screen, SectionLabel, Tag } from '@/components/ui';
import { activeFilterCount, emptyFilters, filterDrills, type DrillFilters } from '@/content';
import { pick } from '@/i18n';
import { useProgress } from '@/storage/progress';
import { colors, space, type } from '@/theme';
import type { Equipment, GroupSize, Locale, Position, SpaceNeed } from '@/types/content';

const POSITIONS: [Position, string][] = [
  ['goalkeeper', 'posGoalkeeper'], ['defender', 'posDefender'],
  ['midfielder', 'posMidfielder'], ['forward', 'posForward'],
];
const EQUIPMENT: [Equipment, string][] = [
  ['none', 'eqNone'], ['ball', 'eqBall'], ['cones', 'eqCones'],
  ['wall', 'eqWall'], ['partner', 'eqPartner'],
];
const SPACES: [SpaceNeed, string][] = [
  ['bedroom', 'spaceBedroom'], ['yard', 'spaceYard'], ['half-pitch', 'spaceHalfPitch'],
];
const GROUPS: [GroupSize, string][] = [['solo', 'grpSolo'], ['group', 'grpGroup']];
const TIMES: ['s' | 'm' | 'l', string][] = [['s', 'timeS'], ['m', 'timeM'], ['l', 'timeL']];

const SPACE_KEY: Record<SpaceNeed, string> = {
  bedroom: 'spaceBedroom', yard: 'spaceYard', 'half-pitch': 'spaceHalfPitch',
};
const EQUIP_KEY: Record<Equipment, string> = {
  none: 'eqNone', ball: 'eqBall', cones: 'eqCones', wall: 'eqWall', partner: 'eqPartner',
};

export default function TrainScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { progress } = useProgress();
  const [filters, setFilters] = useState<DrillFilters>(emptyFilters);

  const toggle = <K extends keyof DrillFilters>(key: K, value: DrillFilters[K][number]) => {
    setFilters((prev) => {
      const list = prev[key] as DrillFilters[K][number][];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...prev, [key]: next };
    });
  };

  const results = filterDrills(filters);
  const active = activeFilterCount(filters);

  return (
    <Screen>
      <Text style={styles.label}>{t('position')}</Text>
      <View style={styles.chips}>
        {POSITIONS.map(([value, key]) => (
          <Chip
            key={value} label={t(key)}
            selected={filters.positions.includes(value)}
            onPress={() => toggle('positions', value)}
          />
        ))}
      </View>

      <Text style={styles.label}>{t('equipment')}</Text>
      <View style={styles.chips}>
        {EQUIPMENT.map(([value, key]) => (
          <Chip
            key={value} label={t(key)}
            selected={filters.equipment.includes(value)}
            onPress={() => toggle('equipment', value)}
          />
        ))}
      </View>
      {/* The filter means "what I have", not "what the drill uses" — say so,
          or selecting cones and seeing a no-equipment drill looks like a bug. */}
      <Text style={styles.hint}>{t('equipmentHint')}</Text>

      <Text style={styles.label}>{t('space')}</Text>
      <View style={styles.chips}>
        {SPACES.map(([value, key]) => (
          <Chip
            key={value} label={t(key)}
            selected={filters.space.includes(value)}
            onPress={() => toggle('space', value)}
          />
        ))}
      </View>

      <Text style={styles.label}>{t('who')}</Text>
      <View style={styles.chips}>
        {GROUPS.map(([value, key]) => (
          <Chip
            key={value} label={t(key)}
            selected={filters.group.includes(value)}
            onPress={() => toggle('group', value)}
          />
        ))}
      </View>

      <Text style={styles.label}>{t('time')}</Text>
      <View style={styles.chips}>
        {TIMES.map(([value, key]) => (
          <Chip
            key={value} label={t(key)}
            selected={filters.time.includes(value)}
            onPress={() => toggle('time', value)}
          />
        ))}
      </View>

      {active > 0 ? (
        <Button label={t('clear')} variant="ghost" onPress={() => setFilters(emptyFilters())} />
      ) : null}

      <SectionLabel>{`${results.length} ${t('results_n')}`}</SectionLabel>

      {results.length === 0 ? (
        <EmptyState title={t('noResults')} body={t('noResultsBody')} />
      ) : (
        results.map((drill) => {
          const title = pick(drill.title, locale);
          return (
            <Card
              key={drill.id}
              accessibilityLabel={`${title}, ${drill.minutes} ${t('min')}`}
              onPress={() => router.push(`/drill/${drill.id}`)}
            >
              <View style={styles.row}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.chevron}>{progress.drillsDone[drill.id] ? '✓' : '›'}</Text>
              </View>
              <View style={styles.tags}>
                <Tag>{t(SPACE_KEY[drill.space])}</Tag>
                <Tag>{drill.equipment.map((e) => t(EQUIP_KEY[e])).join(' + ')}</Tag>
                <Tag>{t(drill.group === 'solo' ? 'grpSolo' : 'grpGroup')}</Tag>
                <Tag>{`${drill.minutes} ${t('min')}`}</Tag>
              </View>
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    ...type.overline,
    color: colors.textSecondary,
    marginTop: space.md + 3,
    marginBottom: space.sm - 1,
  },
  hint: { ...type.caption, color: colors.textSecondary, marginTop: space.sm - 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm - 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.md },
  title: { ...type.h2, color: colors.textPrimary, flexShrink: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm - 2, marginTop: space.sm + 1 },
  chevron: { color: colors.accent, fontSize: 20, lineHeight: 24 },
});
