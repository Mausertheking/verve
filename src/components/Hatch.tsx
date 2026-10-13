import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';

import { colors } from '@/theme';

/**
 * A flat field of diagonal lines — the same texture as the Verve mark, reused
 * as a graphic device.
 *
 * This is the app's one piece of ornament, and it is deliberately static and
 * solid: no gradient, no glow, no opacity ramp, nothing that animates. It reads
 * as printed texture rather than as a screen effect, which is what keeps the
 * app looking like a training tool instead of a consumer app.
 *
 * Line colour sits a couple of steps off the background so it registers as
 * texture up close and disappears into flat dark at a glance — it must never
 * compete with text sitting on top of it.
 */
interface Props {
  /** Line spacing in px. Wider reads calmer. */
  spacing?: number;
  /** Line colour. Defaults to a hair above the surface. */
  color?: string;
  /** Rotation of the hatch. -45 matches the mark. */
  angle?: number;
}

function HatchBase({ spacing = 9, color = '#161E2A', angle = -45 }: Props) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="hatch-field"
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${angle})`}
          >
            <Line x1={0} y1={0} x2={0} y2={spacing} stroke={color} strokeWidth={1.6} />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#hatch-field)" />
      </Svg>
    </View>
  );
}

/** A single hairline rule. Used instead of shadows to separate blocks. */
export function Rule({ inset = 0 }: { inset?: number }) {
  return <View style={[styles.rule, { marginHorizontal: inset }]} />;
}

const styles = StyleSheet.create({
  rule: { height: 1, backgroundColor: colors.border },
});

export const Hatch = memo(HatchBase);
