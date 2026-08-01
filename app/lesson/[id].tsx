import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, NumberedItem } from '@/components/controls';
import { PitchDiagram } from '@/components/PitchDiagram';
import { RichText } from '@/components/RichText';
import { Chip } from '@/components/controls';
import { SectionLabel, StatusNote } from '@/components/ui';
import { VideoSlot } from '@/components/VideoSlot';
import { lessonById, lessonsInTrack, termById, trackById } from '@/content';
import { pick, pickList } from '@/i18n';
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

  return (
    <>
      <Stack.Screen
        options={{
          title: pick(lesson.title, locale),
          headerBackTitle: track ? pick(track.title, locale) : undefined,
        }}
      />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {/* Identical 16:9 box whether or not a video file exists. */}
        <VideoSlot video={lesson.video} />

        <View style={styles.pad}>
          <Text style={styles.crumb}>
            {track ? pick(track.title, locale) : ''} · {index + 1} / {siblings.length}
          </Text>

          {lesson.status === 'todo' ? (
            <>
              <SectionLabel>{t('ruleText')}</SectionLabel>
              <StatusNote kind="todo">{pickList(lesson.body, locale)[0]}</StatusNote>
            </>
          ) : (
            <View style={styles.body}>
              {pickList(lesson.body, locale).map((paragraph, i) => (
                <RichText key={i} onPressTerm={openTerm} style={styles.paragraph}>
                  {paragraph}
                </RichText>
              ))}
            </View>
          )}

          {lesson.diagram ? (
            <>
              <SectionLabel>{t('howItLooks')}</SectionLabel>
              <PitchDiagram data={lesson.diagram} locale={locale} />
            </>
          ) : null}

          <SectionLabel>{t('takeaways')}</SectionLabel>
          {pickList(lesson.takeaways, locale).map((item, i) => (
            <NumberedItem key={i} n={i + 1}>
              <RichText onPressTerm={openTerm} style={styles.takeaway}>
                {item}
              </RichText>
            </NumberedItem>
          ))}

          {lesson.glossaryTermIds.length > 0 ? (
            <>
              <SectionLabel>{t('seeAlso')}</SectionLabel>
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

          {lesson.status === 'draft' ? (
            <View style={styles.draft}>
              <StatusNote kind="draft">{`reviewed: false — ${t('draftNote')}`}</StatusNote>
            </View>
          ) : null}

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
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: space.xxl },
  pad: { padding: space.lg },
  crumb: { ...type.caption, color: colors.textSecondary, marginBottom: space.md },
  body: { marginTop: space.xs },
  paragraph: { marginBottom: space.md + 2 },
  takeaway: { ...type.label, color: colors.textPrimary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm - 1 },
  draft: { marginTop: space.lg },
});
