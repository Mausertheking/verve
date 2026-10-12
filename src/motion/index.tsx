import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, Text, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/theme/motion';

/**
 * Motion primitives. Every animated thing in the app goes through one of
 * these, so timing, easing and the Reduce Motion fallback live in one place.
 *
 * Built on shared values rather than Reanimated layout animations so they
 * behave the same on Android, iOS and the web preview.
 */

/**
 * Entrance: a short fade and a few pixels of rise. `index` staggers siblings;
 * the delay is capped so the tenth card doesn't wait for the first nine.
 */
export function Reveal({
  children, index = 0, style,
}: {
  children: ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      p.value = 1;
      return;
    }
    const delay = Math.min(index, motion.staggerMax) * motion.stagger;
    p.value = withDelay(
      delay,
      withTiming(1, { duration: motion.duration.enter, easing: motion.ease.out }),
    );
  }, [index, p, reduced]);

  const animated = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * motion.rise }],
  }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/**
 * Pressable that gives under the thumb. The scale is small (0.975) — enough to
 * feel, not enough to look like a toy.
 *
 * The scale lives on a wrapping Animated.View and the caller's style stays on
 * a plain Pressable: an animated Pressable drops function and array styles on
 * the web build.
 */
export function PressableScale({
  style, children, scaleTo = 0.975, onPressIn, onPressOut, wrapperStyle, ...rest
}: PressableProps & {
  scaleTo?: number;
  /** Style for the animated wrapper — use for flex sizing in rows. */
  wrapperStyle?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const s = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <Animated.View style={[wrapperStyle, animated]}>
      <Pressable
        {...rest}
        onPressIn={(e) => {
          if (!reduced) s.value = withSpring(scaleTo, motion.spring.press);
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          if (!reduced) s.value = withSpring(1, motion.spring.press);
          onPressOut?.(e);
        }}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/** Horizontal fill that grows to `percent`. Used by every progress meter. */
export function useMeterFill(percent: number) {
  const reduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, percent));
  const w = useSharedValue(reduced ? clamped : 0);

  useEffect(() => {
    w.value = reduced
      ? clamped
      : withTiming(clamped, { duration: motion.duration.meter, easing: motion.ease.out });
  }, [clamped, reduced, w]);

  return useAnimatedStyle(() => ({ width: `${w.value}%` }));
}

/**
 * A short horizontal shake — the "not quite" for a wrong quiz answer.
 * Returns the style and a trigger.
 */
export function useShake() {
  const reduced = useReducedMotion();
  const x = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const shake = () => {
    if (reduced) return;
    const d = 55;
    x.value = withSequence(
      withTiming(-6, { duration: d }),
      withTiming(6, { duration: d }),
      withTiming(-4, { duration: d }),
      withTiming(3, { duration: d }),
      withTiming(0, { duration: d }),
    );
  };
  return { style, shake };
}

/** A single settle-in pop — the "yes" for a right answer. */
export function usePop() {
  const reduced = useReducedMotion();
  const s = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const pop = () => {
    if (reduced) return;
    s.value = withSequence(
      withTiming(1.025, { duration: motion.duration.tap, easing: motion.ease.out }),
      withSpring(1, motion.spring.settle),
    );
  };
  return { style, pop };
}

/**
 * Counts a number up from zero. Plain JS frames rather than a worklet: the
 * value is text, and text has to be re-rendered by React anyway.
 */
export function CountUp({
  to, duration = 900, style, format = (n) => String(n),
}: {
  to: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
  format?: (n: number) => string;
}) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? to : 0);

  useEffect(() => {
    if (reduced) {
      setN(to);
      return;
    }
    let raf = 0;
    const start = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, reduced]);

  return <Text style={style}>{format(n)}</Text>;
}
