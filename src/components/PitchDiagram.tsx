import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { colors, radius, space, type } from '@/theme';
import { pick } from '@/i18n';
import type {
  DiagramMarker, DiagramPath, PitchDiagramData, PitchView, Point, Locale,
} from '@/types/content';

/**
 * Renders a pitch diagram from data. Every lesson and drill diagram goes
 * through here — there are no one-off SVGs and no raster images.
 *
 * Coordinate space is x 0–100, y 0–65, matching a real pitch's proportions.
 */

const VB_W = 100;
const VB_H = 65;
const LINE = '#2A3242';
const GRASS = '#0F141C';

function PitchLines({ view }: { view: PitchView }) {
  const common = { fill: 'none', stroke: LINE, strokeWidth: 1 } as const;
  switch (view) {
    case 'full':
      return (
        <G>
          <Rect x={3} y={3} width={94} height={59} {...common} />
          <Line x1={50} y1={3} x2={50} y2={62} stroke={LINE} strokeWidth={1} />
          <Circle cx={50} cy={32.5} r={9} {...common} />
          <Rect x={3} y={17} width={14} height={31} {...common} />
          <Rect x={83} y={17} width={14} height={31} {...common} />
          <Rect x={3} y={25} width={5} height={15} {...common} />
          <Rect x={92} y={25} width={5} height={15} {...common} />
        </G>
      );
    case 'half':
      return (
        <G>
          <Rect x={3} y={3} width={94} height={59} {...common} />
          <Rect x={3} y={15} width={18} height={35} {...common} />
          <Rect x={3} y={24} width={7} height={17} {...common} />
        </G>
      );
    case 'penalty-area':
      return (
        <G>
          <Rect x={3} y={3} width={94} height={59} {...common} />
          <Rect x={18} y={3} width={64} height={34} {...common} />
          <Rect x={35} y={3} width={30} height={15} {...common} />
          <Circle cx={50} cy={28} r={1.2} fill={LINE} />
        </G>
      );
    case 'goal-area':
      return (
        <G>
          <Rect x={30} y={3} width={40} height={4} fill="none" stroke={LINE} strokeWidth={1.6} />
          <Line x1={3} y1={7} x2={97} y2={7} stroke={LINE} strokeWidth={1} />
          <Rect x={22} y={7} width={56} height={33} {...common} />
          <Rect x={36} y={7} width={28} height={14} {...common} />
        </G>
      );
    default:
      return null;
  }
}

function Marker({ marker }: { marker: DiagramMarker }) {
  const { x, y, kind, label } = marker;

  if (kind === 'ball') return <Circle cx={x} cy={y} r={1.9} fill={colors.textPrimary} />;
  if (kind === 'cone') {
    return (
      <Polygon
        points={`${x},${y - 3} ${x - 2.4},${y + 2} ${x + 2.4},${y + 2}`}
        fill={colors.textSecondary}
      />
    );
  }

  const fill =
    kind === 'keeper' ? colors.textPrimary : kind === 'opponent' ? 'none' : colors.accent;
  const stroke =
    kind === 'opponent' ? colors.textSecondary
    : kind === 'keeper' ? colors.textPrimary
    : colors.accent;

  return (
    <G>
      <Circle cx={x} cy={y} r={3.6} fill={fill} stroke={stroke} strokeWidth={1} />
      {label ? (
        <SvgText
          x={x} y={y + 1.4} fontSize={3.2} textAnchor="middle"
          fill={colors.onAccent} fontWeight="700"
        >
          {label}
        </SvgText>
      ) : null}
    </G>
  );
}

function PathArrow({ path, markers }: { path: DiagramPath; markers: DiagramMarker[] }) {
  const resolve = (v: Point | string): Point =>
    typeof v === 'string' ? markers.find((m) => m.id === v) ?? { x: 50, y: 32 } : v;

  const a = resolve(path.from);
  const b = resolve(path.to);

  const dash =
    path.kind === 'pass' ? '2.6 2' : path.kind === 'dribble' ? '1.4 1.4' : undefined;
  const stroke =
    path.kind === 'pass' || path.kind === 'dribble' ? colors.textPrimary : colors.accent;

  const angle = Math.atan2(b.y - a.y, b.x - a.x);
  const head = 2.6;
  const p1 = `${b.x - head * Math.cos(angle - 0.4)},${b.y - head * Math.sin(angle - 0.4)}`;
  const p2 = `${b.x - head * Math.cos(angle + 0.4)},${b.y - head * Math.sin(angle + 0.4)}`;

  return (
    <G>
      <Line
        x1={a.x} y1={a.y} x2={b.x} y2={b.y}
        stroke={stroke} strokeWidth={0.9} strokeDasharray={dash}
      />
      <Polygon points={`${b.x},${b.y} ${p1} ${p2}`} fill={stroke} />
    </G>
  );
}

interface Props {
  data: PitchDiagramData;
  locale: Locale;
}

function PitchDiagramBase({ data, locale }: Props) {
  const markers = data.markers ?? [];
  const caption = data.caption ? pick(data.caption, locale) : '';

  return (
    <View>
      <View style={styles.frame}>
        <Svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" style={styles.svg}>
          <Rect x={0} y={0} width={VB_W} height={VB_H} rx={2} fill={GRASS} />
          <PitchLines view={data.view} />

          {data.zones?.map((z, i) => (
            <G key={`zone-${i}`}>
              <Rect
                x={z.x} y={z.y} width={z.w} height={z.h}
                fill={colors.accent} fillOpacity={0.14}
                stroke={colors.accent} strokeWidth={0.7}
              />
            </G>
          ))}

          {data.lines?.map((l, i) => (
            <G key={`line-${i}`}>
              <Line
                x1={l.x} y1={3} x2={l.x} y2={62}
                stroke={colors.accent} strokeWidth={0.9} strokeDasharray="3 2.4"
              />
              {l.label ? (
                <SvgText x={l.x + 2.5} y={8} fontSize={3.2} fill={colors.accent}>
                  {pick(l.label, locale)}
                </SvgText>
              ) : null}
            </G>
          ))}

          {data.paths?.map((p, i) => (
            <PathArrow key={`path-${i}`} path={p} markers={markers} />
          ))}
          {markers.map((m) => (
            <Marker key={m.id} marker={m} />
          ))}
        </Svg>
      </View>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: space.sm + 2,
  },
  svg: { alignSelf: 'stretch' },
  caption: {
    ...type.caption,
    color: colors.textSecondary,
    marginTop: space.sm,
  },
});

export const PitchDiagram = memo(PitchDiagramBase);
