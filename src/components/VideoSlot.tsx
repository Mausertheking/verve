import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTranslation } from 'react-i18next';

import { DiagramExplainer } from '@/components/explainer/DiagramExplainer';
import { videoSource } from '@/content/videos';
import { colors, type } from '@/theme';
import type { Locale, PitchDiagramData, VideoRef } from '@/types/content';

/**
 * The 16:9 slot at the top of every lesson and drill.
 *
 * The whole point is that the box is the same size whatever fills it, so
 * dropping footage into /assets/videos later shifts nothing on screen. Every
 * branch renders into the identical container — do not give any state its own
 * padding, margin or aspect ratio.
 *
 * What fills it, in order:
 *   1. a bundled file → native player, muted, never autoplays;
 *   2. a diagram → the step-by-step explainer;
 *   3. nothing → a flat placeholder.
 */

interface Props {
  /** Registry key: `lesson:<id>` or `drill:<id>`. */
  videoKey: string;
  video?: VideoRef;
  diagram?: PitchDiagramData;
  locale: Locale;
}

/** True when a bundled video exists for this item — screens use it to decide what goes below. */
export const hasVideo = (videoKey: string, locale: Locale) => videoSource(videoKey, locale) !== undefined;

function Player({ source, label }: { source: number; label: string }) {
  const player = useVideoPlayer(source, (p) => {
    p.muted = true;
    p.loop = false;
  });
  return (
    <VideoView
      player={player}
      style={styles.video}
      contentFit="contain"
      nativeControls
      accessibilityLabel={label}
    />
  );
}

function VideoSlotBase({ videoKey, video, diagram, locale }: Props) {
  const { t } = useTranslation();
  const source = videoSource(videoKey, locale);
  const caption = video ? video.caption[locale] || video.caption.az : '';

  if (source !== undefined) {
    return (
      <View style={styles.slot}>
        {/* Keyed by source so switching language swaps the player cleanly. */}
        <Player key={source} source={source} label={caption || t('videoLabel')} />
      </View>
    );
  }

  if (diagram) {
    return (
      <View style={styles.slot}>
        <DiagramExplainer data={diagram} locale={locale} />
      </View>
    );
  }

  return (
    <View style={[styles.slot, styles.center]} accessible accessibilityLabel={t('videoSoon')}>
      <View style={styles.playButton}>
        <Svg width={17} height={19} viewBox="0 0 17 19">
          <Path
            d="M1 1.6v15.8L16 9.5z"
            fill="none"
            stroke={colors.textSecondary}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      <Text style={styles.caption}>{t('videoSoon')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    overflow: 'hidden',
  },
  center: { alignItems: 'center', justifyContent: 'center', gap: 10 },
  // Explicit size, not just insets: on web a <video> with only insets falls
  // back to its intrinsic 1280×720 and overflows the slot.
  video: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    ...type.caption,
    color: colors.textSecondary,
  },
});

export const VideoSlot = memo(VideoSlotBase);
