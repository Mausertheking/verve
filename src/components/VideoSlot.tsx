import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { colors, type } from '@/theme';
import type { VideoRef } from '@/types/content';

/**
 * The 16:9 slot at the top of every lesson and drill.
 *
 * The whole point is that the box is the same size whether a video exists or
 * not, so dropping footage into /assets/videos later shifts nothing on screen.
 * Both branches render into the identical container — do not give either state
 * its own padding, margin or aspect ratio.
 *
 * The placeholder is flat by design: a static play glyph and a line of text.
 * No shimmer, no skeleton, no gradient, no animation.
 */

interface Props {
  video?: VideoRef;
}

function VideoSlotBase({ video }: Props) {
  const { t } = useTranslation();

  // Videos are filmed and added later. Until a file is bundled, every slot is
  // a placeholder — resolving a local asset by name happens when the first
  // real file lands, and it is the only line that needs to change.
  const hasFile = false;

  return (
    <View style={styles.slot} accessible accessibilityLabel={t('videoSoon')}>
      {hasFile && video ? null : (
        <>
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
        </>
      )}
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
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
