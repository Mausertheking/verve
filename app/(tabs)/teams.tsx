import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, NumberedItem } from '@/components/controls';
import { Hero, Screen, SectionLabel, StatusNote } from '@/components/ui';
import guide from '@content/team-guide.json';
import { pick } from '@/i18n';
import { Reveal } from '@/motion';
import { colors, space, type } from '@/theme';
import type { Locale, LocalizedText } from '@/types/content';

interface Guide {
  intro: LocalizedText;
  sections: { id: string; title: LocalizedText; items: LocalizedText[] }[];
  practise: LocalizedText;
}

/**
 * How a girl finds a team: where to look, what to ask, what to bring, how to
 * stay safe. Deliberately a guide rather than a directory — no club, contact
 * or phone number is shown until it has been verified by a person (content
 * rules in CLAUDE.md). A verified list can be added above the guide later.
 */
export default function TeamsScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const g = guide as Guide;

  return (
    <Screen topInset>
      <Hero kicker={t('teamsKicker')} title={t('teamsTitle')} lead={pick(g.intro, locale)} />

      {g.sections.map((section, s) => (
        <View key={section.id}>
          <SectionLabel n={s + 1}>{pick(section.title, locale)}</SectionLabel>
          {section.items.map((item, i) => (
            <Reveal key={i} index={i}>
              <NumberedItem n={i + 1}>
                <Text style={styles.item}>{pick(item, locale)}</Text>
              </NumberedItem>
            </Reveal>
          ))}
        </View>
      ))}

      <View style={styles.practise}>
        <Text style={styles.practiseText}>{pick(g.practise, locale)}</Text>
        <Button label={`${t('practiseCta')} ›`} onPress={() => router.push('/train')} />
      </View>

      <View style={styles.note}>
        <StatusNote kind="draft">{`reviewed: false — ${t('draftNote')}`}</StatusNote>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { ...type.label, color: colors.textPrimary },
  practise: {
    marginTop: space.xxl,
    paddingTop: space.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  practiseText: { ...type.headline, fontSize: 20, lineHeight: 27, color: colors.textPrimary },
  note: { marginTop: space.lg },
});
