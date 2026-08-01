import { memo } from 'react';
import Svg, { ClipPath, Defs, G, Line, Pattern, Polygon, Rect } from 'react-native-svg';

import { colors } from '@/theme';

/**
 * The Verve mark: a tapered V filled with a fine diagonal hatch.
 *
 * Geometry matches scripts/build-brand.mjs exactly — if one changes, change
 * both, or the icon and the in-app mark drift apart.
 *
 * Below 32px the hatch stops resolving; pass `solid` for small sizes.
 */
const V_POINTS = '18,18 37,18 50,56 63,18 82,18 50,82';

/** #0B0E14 at 55% over #C2687A, precomputed so nothing relies on alpha compositing. */
const HATCH = '#5D3742';
const HATCH_SPACING = 8;
const HATCH_WIDTH = 1.4;

interface Props {
  size?: number;
  /** Drop the hatch. Use under 32px, where the lines turn to mush. */
  solid?: boolean;
}

function VerveMarkBase({ size = 32, solid }: Props) {
  const flat = solid ?? size < 32;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityRole="image">
      {flat ? (
        <Polygon points={V_POINTS} fill={colors.accent} />
      ) : (
        <>
          <Defs>
            <Pattern
              id="verve-hatch"
              width={HATCH_SPACING}
              height={HATCH_SPACING}
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-45)"
            >
              <Line
                x1="0" y1="0" x2="0" y2={HATCH_SPACING}
                stroke={HATCH} strokeWidth={HATCH_WIDTH}
              />
            </Pattern>
            <ClipPath id="verve-clip">
              <Polygon points={V_POINTS} />
            </ClipPath>
          </Defs>
          <G clipPath="url(#verve-clip)">
            <Polygon points={V_POINTS} fill={colors.accent} />
            <Rect x={0} y={0} width={100} height={100} fill="url(#verve-hatch)" />
          </G>
        </>
      )}
    </Svg>
  );
}

export const VerveMark = memo(VerveMarkBase);
