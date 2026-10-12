import { Easing } from 'react-native-reanimated';

/**
 * Motion tokens. Motion in Verve exists to teach and to confirm — a player
 * running a line, a tap landing, an answer being right — never to decorate.
 *
 * Rules of thumb:
 * - Entrances are short and travel a few pixels. Nothing flies in.
 * - Teaching animations (the diagram explainers) are slow enough to follow
 *   with the eye and can always be paused, replayed and slowed down.
 * - Everything honours the system Reduce Motion setting. Reanimated's
 *   `ReduceMotion.System` is the default for every animation built here.
 */
export const motion = {
  duration: {
    tap: 120,
    quick: 180,
    enter: 340,
    meter: 650,
  },
  /** Delay between siblings in a staggered list. Capped so long lists don't drag. */
  stagger: 45,
  staggerMax: 8,
  /** Distance an entering element travels, in px. */
  rise: 10,
  ease: {
    /** Standard deceleration — things arriving. */
    out: Easing.bezier(0.2, 0, 0, 1),
    /** Symmetric — things moving across the pitch. */
    inOut: Easing.bezier(0.45, 0, 0.25, 1),
  },
  spring: {
    press: { damping: 18, stiffness: 320, mass: 0.6 },
    settle: { damping: 16, stiffness: 180, mass: 0.8 },
  },
  /** Explainer timing, ms per step at 1× speed. */
  explainer: {
    intro: 900,
    step: 1500,
    hold: 700,
  },
} as const;
