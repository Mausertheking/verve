import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Line, Path, Polygon, Rect } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { Fixture, GRASS, PitchLines, RefLine, VB_H, VB_W, Zone } from '@/components/PitchDiagram';
import { pick } from '@/i18n';
import { colors, motion, radius, serif, type } from '@/theme';
import type { Locale, PathKind, PitchDiagramData } from '@/types/content';

import {
  buildTimeline, MOVE_FRACTION, positionAt, stepProgress,
  type Actor, type Stroke,
} from './timeline';

/**
 * A pitch diagram that plays. Players run their lines, the ball travels, each
 * step is captioned — the explainer that fills the 16:9 slot until real
 * footage is filmed.
 *
 * Rules it keeps:
 * - Never autoplays. On mount the pitch and players settle in (the intro),
 *   then it waits on a still first frame for a tap.
 * - Every step can be replayed on its own by tapping its segment, and the
 *   whole thing can run at half speed.
 * - Reduce Motion → no tweening. Play advances one step at a time, instantly.
 *
 * Markers are absolutely-positioned views over the SVG rather than animated
 * SVG nodes: transforms on views are the most reliable thing Reanimated
 * animates, on Android and in the web preview alike.
 */

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

const BAR_H = 44;
const SEG_H = 18;
const PAD = 8;

const STROKE: Record<PathKind, { color: string; dash?: string; width: number }> = {
  pass: { color: colors.textPrimary, dash: '2.6 2', width: 0.8 },
  dribble: { color: colors.textPrimary, dash: '1.2 1.3', width: 0.8 },
  run: { color: colors.accent, width: 0.9 },
  shot: { color: colors.accent, width: 1.3 },
};

const KIND_KEY: Record<PathKind, string> = {
  pass: 'movePass', run: 'moveRun', shot: 'moveShot', dribble: 'moveDribble',
};

/* -------------------------------------------------------------------------- */

function StrokeView({ s, t }: { s: Stroke; t: SharedValue<number> }) {
  const style = STROKE[s.kind];

  const lineProps = useAnimatedProps(() => {
    const p = stepProgress(t.value, s.g);
    const active = t.value > s.g;
    const done = t.value >= s.g + 1;
    return {
      x2: s.ax + (s.bx - s.ax) * p,
      y2: s.ay + (s.by - s.ay) * p,
      strokeOpacity: !active ? 0 : done ? 0.45 : 1,
    };
  });

  // Arrowhead: appears once the line reaches its end.
  const angle = Math.atan2(s.by - s.ay, s.bx - s.ax);
  const head = s.kind === 'shot' ? 3.2 : 2.6;
  const p1 = `${s.bx - head * Math.cos(angle - 0.42)},${s.by - head * Math.sin(angle - 0.42)}`;
  const p2 = `${s.bx - head * Math.cos(angle + 0.42)},${s.by - head * Math.sin(angle + 0.42)}`;

  const headProps = useAnimatedProps(() => {
    const p = stepProgress(t.value, s.g);
    const done = t.value >= s.g + 1;
    return { fillOpacity: p < 0.96 ? 0 : done ? 0.45 : 1 };
  });

  return (
    <>
      <AnimatedLine
        x1={s.ax} y1={s.ay} x2={s.ax} y2={s.ay}
        stroke={style.color} strokeWidth={style.width} strokeDasharray={style.dash}
        strokeLinecap="round"
        animatedProps={lineProps}
      />
      <AnimatedPolygon points={`${s.bx},${s.by} ${p1} ${p2}`} fill={style.color} animatedProps={headProps} />
    </>
  );
}

function ActorView({
  a, t, scale, index,
}: {
  a: Actor;
  t: SharedValue<number>;
  scale: number;
  index: number;
}) {
  const isBall = a.kind === 'ball';
  const r = isBall ? Math.max(1.9 * scale, 4.5) : Math.max(3.6 * scale, 9);

  const animated = useAnimatedStyle(() => {
    const p = positionAt(a.keys, a.x0, a.y0, t.value);
    // Intro: markers pop in one after another while t runs from -1 to 0.
    const appear = t.value >= 0 ? 1 : Math.max(0, Math.min(1, (t.value + 1) * 1.8 - index * 0.12));
    const moving = a.keys.some((k) => t.value > k.g && t.value < k.g + MOVE_FRACTION);
    return {
      opacity: appear,
      transform: [
        { translateX: p.x * scale - r },
        { translateY: p.y * scale - r },
        { scale: (0.6 + 0.4 * appear) * (moving && !isBall ? 1.12 : 1) },
      ],
    };
  });

  const look =
    a.kind === 'ball' ? styles.ball
    : a.kind === 'keeper' ? styles.keeper
    : a.kind === 'opponent' ? styles.opponent
    : styles.player;

  return (
    <Animated.View
      style={[styles.actor, look, { width: r * 2, height: r * 2, borderRadius: r }, animated]}
    >
      {a.label && !isBall ? (
        <Text
          style={[
            styles.actorLabel,
            { fontSize: Math.max(8, r * 0.82) },
            a.kind === 'keeper' && { color: colors.bg },
          ]}
          numberOfLines={1}
        >
          {a.label}
        </Text>
      ) : null}
    </Animated.View>
  );
}

function Segment({ g, t, onPress, label }: {
  g: number;
  t: SharedValue<number>;
  onPress: () => void;
  label: string;
}) {
  const fill = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, t.value - g)) * 100}%`,
  }));
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.segHit}
      hitSlop={{ top: 6, bottom: 6 }}
    >
      <View style={styles.segTrack}>
        <Animated.View style={[styles.segFill, fill]} />
      </View>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */

interface Props {
  data: PitchDiagramData;
  locale: Locale;
}

function DiagramExplainerBase({ data, locale }: Props) {
  const { t: tr } = useTranslation();
  const reduced = useReducedMotion();
  const tl = useMemo(() => buildTimeline(data), [data]);
  const N = tl.steps;

  const t = useSharedValue(reduced ? 0 : -1);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [slow, setSlow] = useState(false);
  /** False until the first tap — the still first frame shows the overview caption. */
  const [touched, setTouched] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 });

  // Intro: the pitch and players settle in once. This is an entrance, not
  // playback — no movement happens until someone taps play.
  useEffect(() => {
    if (reduced) {
      t.value = 0;
      return;
    }
    t.value = withTiming(0, { duration: motion.explainer.intro, easing: Easing.out(Easing.cubic) });
  }, [reduced, t]);

  // Mirror the current step into React state for the caption.
  useAnimatedReaction(
    () => (t.value < 0 ? -1 : Math.min(N, Math.floor(t.value + 1e-4))),
    (cur, prev) => {
      if (cur !== prev) scheduleOnRN(setStep, cur);
    },
    [N],
  );

  const unit = (motion.explainer.step + motion.explainer.hold) * (slow ? 2 : 1);

  const stop = useCallback(() => setPlaying(false), []);

  const runTo = useCallback(
    (target: number, from?: number) => {
      cancelAnimation(t);
      if (from !== undefined) t.value = from;
      if (reduced) {
        t.value = target;
        setPlaying(false);
        return;
      }
      const start = from ?? t.value;
      setPlaying(true);
      t.value = withTiming(
        target,
        { duration: Math.max(0, target - start) * unit, easing: Easing.linear },
        (finished) => {
          if (finished) scheduleOnRN(stop);
        },
      );
    },
    [reduced, stop, t, unit],
  );

  const toggle = () => {
    setTouched(true);
    if (playing) {
      cancelAnimation(t);
      setPlaying(false);
      return;
    }
    if (reduced) {
      // One step per tap, no tweening.
      const next = t.value >= N ? 1 : Math.floor(t.value) + 1;
      t.value = Math.min(N, next);
      return;
    }
    runTo(N, t.value >= N - 1e-3 || t.value < 0 ? 0 : undefined);
  };

  const playStep = (g: number) => {
    setTouched(true);
    if (reduced) {
      t.value = g + 1;
      return;
    }
    runTo(g + 1, g);
  };

  // Stage: the largest 100:65 box that fits above the control rows.
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    const availH = height - BAR_H - (N > 1 ? SEG_H : 0) - PAD * 2;
    const h = Math.max(0, Math.min(availH, ((width - PAD * 2) * VB_H) / VB_W));
    setBox({ w: (h * VB_W) / VB_H, h });
  };
  const scale = box.w / VB_W;

  const stageIn = useAnimatedStyle(() => ({
    opacity: t.value >= 0 ? 1 : Math.max(0, Math.min(1, (t.value + 1) * 2)),
  }));

  const cur = Math.max(0, step);
  const finished = touched && step >= N && N > 0;
  const showStep = touched && N > 0 && cur < N;
  const caption = finished || N === 0
    ? pick(data.caption, locale) || tr('explainerDone')
    : !touched
      ? pick(data.caption, locale) || tr('explainerHint')
      : data.beats?.[cur]
        ? pick(data.beats[cur], locale)
        : (tl.stepKinds[cur] ?? []).map((k) => tr(KIND_KEY[k])).join(' + ');

  const atStart = !touched && N > 0;

  return (
    <View style={styles.root} onLayout={onLayout}>
      <View style={styles.stageWrap}>
        <Animated.View
          style={[{ width: box.w, height: box.h }, stageIn]}
          accessible
          accessibilityRole="image"
          accessibilityLabel={pick(data.caption, locale) || tr('explainer')}
        >
          {box.w > 0 ? (
            <>
              <Svg width={box.w} height={box.h} viewBox={`0 0 ${VB_W} ${VB_H}`}>
                <Rect x={0} y={0} width={VB_W} height={VB_H} rx={2} fill={GRASS} />
                <PitchLines view={data.view} />
                {data.zones?.map((z, i) => <Zone key={i} zone={z} id={`explainer-wall-${i}`} />)}
                {data.lines?.map((l, i) => <RefLine key={i} line={l} locale={locale} />)}
                {tl.fixtures.map((m) => <Fixture key={m.id} marker={m} />)}
                {tl.strokes.map((s, i) => <StrokeView key={i} s={s} t={t} />)}
              </Svg>
              {tl.actors.map((a, i) => (
                <ActorView key={a.id} a={a} t={t} scale={scale} index={i} />
              ))}
            </>
          ) : null}
        </Animated.View>

        {/* Big play on the still first frame and the end card. It sits in the
            gutter beside the pitch — the slot is always wider than the pitch —
            so it never covers a player. */}
        {(atStart || finished) && box.w > 0 ? (
          <Pressable
            onPress={toggle}
            accessibilityRole="button"
            accessibilityLabel={finished ? tr('replay') : tr('play')}
            style={({ pressed }) => [styles.bigPlay, pressed && styles.bigPlayPressed]}
          >
            <Svg width={18} height={20} viewBox="0 0 18 20">
              {finished ? (
                <>
                  <Path
                    d="M4 6.5A7 7 0 1 1 3 12" fill="none" stroke={colors.onAccent}
                    strokeWidth={2} strokeLinecap="round"
                  />
                  <Path
                    d="M1.5 2.5v5h5" fill="none" stroke={colors.onAccent}
                    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  />
                </>
              ) : (
                <Path d="M3 1.8v16.4L17 10z" fill={colors.onAccent} />
              )}
            </Svg>
          </Pressable>
        ) : null}
      </View>

      {N > 1 ? (
        <View style={styles.segments}>
          {Array.from({ length: N }, (_, g) => (
            <Segment
              key={g}
              g={g}
              t={t}
              onPress={() => playStep(g)}
              label={tr('stepOf', { n: g + 1, total: N })}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.bar}>
        <Pressable
          onPress={toggle}
          disabled={N === 0}
          accessibilityRole="button"
          accessibilityLabel={playing ? tr('pause') : finished ? tr('replay') : tr('play')}
          style={({ pressed }) => [styles.ctrl, pressed && styles.ctrlPressed]}
        >
          <Svg width={14} height={14} viewBox="0 0 14 14">
            {playing ? (
              <>
                <Rect x={2} y={1.5} width={3.4} height={11} rx={0.8} fill={colors.textPrimary} />
                <Rect x={8.6} y={1.5} width={3.4} height={11} rx={0.8} fill={colors.textPrimary} />
              </>
            ) : (
              <Path d="M2.5 1.5v11L12.5 7z" fill={N === 0 ? colors.textSecondary : colors.textPrimary} />
            )}
          </Svg>
        </Pressable>

        <View style={styles.captionBox} accessibilityLiveRegion="polite">
          {showStep ? (
            <Text style={styles.stepNo}>{`${cur + 1}/${N}`}</Text>
          ) : (
            <Text style={styles.stepNo}>{tr('explainerShort')}</Text>
          )}
          <Text style={styles.caption} numberOfLines={2}>{caption}</Text>
        </View>

        {N > 0 ? (
          <Pressable
            onPress={() => setSlow((v) => !v)}
            accessibilityRole="switch"
            accessibilityState={{ checked: slow }}
            accessibilityLabel={tr('slowMotion')}
            style={({ pressed }) => [styles.speed, slow && styles.speedOn, pressed && styles.ctrlPressed]}
          >
            <Text style={[styles.speedText, slow && styles.speedTextOn]}>½×</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignSelf: 'stretch' },
  stageWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: PAD,
  },

  actor: {
    position: 'absolute',
    pointerEvents: 'none',
    left: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  player: { backgroundColor: colors.accent },
  keeper: { backgroundColor: colors.textPrimary },
  opponent: { borderWidth: 1.5, borderColor: colors.textSecondary, backgroundColor: GRASS },
  ball: { backgroundColor: colors.textPrimary, borderWidth: 1, borderColor: GRASS },
  actorLabel: { fontWeight: '700', color: colors.onAccent, includeFontPadding: false },

  bigPlay: {
    position: 'absolute',
    right: 14,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  bigPlayPressed: { backgroundColor: colors.accentPressed },

  segments: {
    flexDirection: 'row',
    gap: 4,
    height: SEG_H,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  segHit: { flex: 1, height: SEG_H, justifyContent: 'center' },
  segTrack: { height: 3, borderRadius: 2, backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  segFill: { height: '100%', backgroundColor: colors.accent },

  bar: {
    height: BAR_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  ctrl: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlPressed: { backgroundColor: colors.surfaceRaised },
  captionBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepNo: { fontFamily: serif, fontStyle: 'italic', fontSize: 13, color: colors.accent },
  caption: { ...type.caption, color: colors.textPrimary, flex: 1 },
  speed: {
    minWidth: 40,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  speedOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  speedText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  speedTextOn: { color: colors.onAccent },
});

export const DiagramExplainer = memo(DiagramExplainerBase);
