import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Chip, NumberedItem } from '@/components/controls';
import { PitchDiagram } from '@/components/PitchDiagram';
import { RichText } from '@/components/RichText';
import { SectionLabel, StatusNote } from '@/components/ui';
import { DiagramExplainer } from '@/components/explainer/DiagramExplainer';
import { hasVideo, VideoSlot } from '@/components/VideoSlot';
import { lessonById, lessonsInTrack, termById, trackById } from '@/content';
import { pick, pickList } from '@/i18n';
import { Reveal } from '@/motion';
import { useProgress } from '@/storage/progress';
import { colors, space, type } from '@/theme';
import type { Locale } from '@/types/content';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { progress, toggleLesson } = useProgress();

  const lesson = lessonById(id);
  if (!lesson) return null;

  const track = trackById(lesson.trackId);
  const siblings = lessonsInTrack(lesson.trackId);
  const index = siblings.findIndex((l) => l.id === lesson.id);
  const next = siblings[index + 1];
  const done = !!progress.lessonsCompleted[lesson.id];

  const openTerm = (termId: string) => router.push(`/term/${termId}`);

  // Section numbers follow whatever is actually on the page.
  let n = 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: track ? pick(track.title, locale) : '',
          headerBackTitle: track ? pick(track.title, locale) : undefined,
        }}
      />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {/* Identical 16:9 box whatever fills it — footage, explainer or placeholder. */}
        <VideoSlot
          key={lesson.id}
          videoKey={`lesson:${lesson.id}`}
          video={lesson.video}
          diagram={lesson.diagram}
          locale={locale}
        />

        <View style={styles.pad}>
          <Reveal>
            <Text style={styles.kicker}>
              {`${t('lessonOf', { n: index + 1, total: siblings.length })} · ${lesson.estMinutes} ${t('min')}`.toUpperCase()}
            </Text>
            <Text style={styles.title} accessibilityRole="header">{pick(lesson.title, locale)}</Text>
          </Reveal>

          {lesson.status === 'todo' ? (
            <>
              <SectionLabel n={++n}>{t('ruleText')}</SectionLabel>
              <StatusNote kind="todo">{pickList(lesson.body, locale)[0]}</StatusNote>
            </>
          ) : (
            <Reveal index={1} style={styles.body}>
              {pickList(lesson.body, locale).map((paragraph, i) =>
                paragraph.startsWith('## ') ? (
                  <Text key={i} style={styles.subhead} accessibilityRole="header">
                    {paragraph.slice(3)}
                  </Text>
                ) : (
                  <RichText
                    key={i}
                    onPressTerm={openTerm}
                    style={[styles.paragraph, i === 0 && styles.lead]}
                  >
                    {paragraph}
                  </RichText>
                ),
              )}
            </Reveal>
          )}

          {lesson.diagram ? (
            <>
              <SectionLabel n={++n}>{t('howItLooks')}</SectionLabel>
              {/* The video plays above; here the same diagram can be stepped
                  through by hand. Without a video the slot already shows the
                  explainer, so this shows the still figure instead. */}
              {hasVideo(`lesson:${lesson.id}`, locale) ? (
                <View style={styles.explainerCard}>
                  <DiagramExplainer key={lesson.id} data={lesson.diagram} locale={locale} />
                </View>
              ) : (
                <PitchDiagram data={lesson.diagram} locale={locale} />
              )}
            </>
          ) : null}

          <SectionLabel n={++n}>{t('takeaways')}</SectionLabel>
          {pickList(lesson.takeaways, locale).map((item, i) => (
            <Reveal key={i} index={i}>
              <NumberedItem n={i + 1}>
                <RichText onPressTerm={openTerm} style={styles.takeaway}>
                  {item}
                </RichText>
              </NumberedItem>
            </Reveal>
          ))}

          {lesson.glossaryTermIds.length > 0 ? (
            <>
              <SectionLabel n={++n}>{t('seeAlso')}</SectionLabel>
              <View style={styles.chips}>
                {lesson.glossaryTermIds.map((termId) => {
                  const term = termById(termId);
                  if (!term) return null;
                  return (
                    <Chip
                      key={termId}
                      label={pick(term.term, locale)}
                      selected={false}
                      onPress={() => openTerm(termId)}
                    />
                  );
                })}
              </View>
            </>
          ) : null}

          {lesson.source ? (
            <Text style={styles.source}>{`${t('source')}: ${lesson.source}`}</Text>
          ) : null}

          {lesson.status === 'draft' ? (
            <View style={styles.draft}>
              <StatusNote kind="draft">{`reviewed: false — ${t('draftNote')}`}</StatusNote>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Button
              label={done ? `✓ ${t('done')}` : t('markDone')}
              variant={done ? 'ghost' : 'primary'}
              onPress={() => toggleLesson(lesson.id)}
            />
            {next ? (
              <Button
                label={`${t('nextLesson')} ›`}
                variant="ghost"
                onPress={() => router.replace(`/lesson/${next.id}`)}
              />
            ) : null}
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
  body: { marginTop: space.xl },
  paragraph: { marginBottom: space.md + 2 },
  subhead: {
    ...type.headline,
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: space.lg,
    marginBottom: space.sm,
  },
  source: { ...type.caption, color: colors.textSecondary, marginTop: space.xl, fontStyle: 'italic' },
  lead: { fontSize: 17, lineHeight: 28 },
  takeaway: { ...type.label, color: colors.textPrimary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm - 1 },
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
