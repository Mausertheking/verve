import type { DiagramMarker, MarkerKind, PathKind, PitchDiagramData, Point } from '@/types/content';

/**
 * Turns diagram data into something that can be played: who moves, from where
 * to where, in which step. Pure — no React, no Reanimated — so the same
 * reading of a diagram drives the in-app explainer and can be checked in a
 * plain Node script.
 *
 * Time is measured in steps. Step g plays while t runs from g to g+1. The
 * intro (pitch and markers appearing) runs from t = -1 to 0.
 */

export interface Keyframe {
  g: number;
  fx: number;
  fy: number;
  tx: number;
  ty: number;
}

/** A marker that can move: players, opponents, keepers, the ball. */
export interface Actor {
  id: string;
  kind: MarkerKind;
  label?: string;
  x0: number;
  y0: number;
  keys: Keyframe[];
}

/** A drawn movement line, revealed during its step. */
export interface Stroke {
  g: number;
  kind: PathKind;
  ax: number;
  ay: number;
  bx: number;
  by: number;
}

export interface Timeline {
  actors: Actor[];
  /** Markers that never move and are drawn into the pitch: cones, targets. */
  fixtures: DiagramMarker[];
  strokes: Stroke[];
  /** Number of steps. 0 means there is nothing to play — a still diagram. */
  steps: number;
  /** Movement kinds in each step, for default captions. */
  stepKinds: PathKind[][];
}

const MOVABLE: MarkerKind[] = ['player', 'opponent', 'keeper', 'ball'];

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

function nearest(pos: Map<string, Point>, ids: string[], to: Point): string | undefined {
  let best: string | undefined;
  let bestD = Infinity;
  for (const id of ids) {
    const p = pos.get(id);
    if (!p) continue;
    const d = dist(p, to);
    if (d < bestD) {
      bestD = d;
      best = id;
    }
  }
  return best;
}

export function buildTimeline(data: PitchDiagramData): Timeline {
  const markers = data.markers ?? [];
  const paths = data.paths ?? [];

  const movable = markers.filter((m) => MOVABLE.includes(m.kind));
  const fixtures = markers.filter((m) => !MOVABLE.includes(m.kind));
  const balls = movable.filter((m) => m.kind === 'ball').map((m) => m.id);
  const people = movable.filter((m) => m.kind !== 'ball').map((m) => m.id);

  const pos = new Map<string, Point>(movable.map((m) => [m.id, { x: m.x, y: m.y }]));
  const keys = new Map<string, Keyframe[]>(movable.map((m) => [m.id, []]));

  // Group paths into steps. Explicit `at` wins; otherwise array order. The
  // step numbers are then compacted so gaps in authored `at` values don't
  // produce empty steps.
  const raw = paths.map((p, i) => ({ p, g: p.at ?? i }));
  const order = [...new Set(raw.map((r) => r.g))].sort((a, b) => a - b);
  const groups = order.map((g) => raw.filter((r) => r.g === g).map((r) => r.p));

  const strokes: Stroke[] = [];
  const stepKinds: PathKind[][] = [];

  groups.forEach((group, g) => {
    // Every endpoint is resolved against positions at the START of the step,
    // so two things moving together don't chase each other.
    const updates: [string, Point][] = [];
    // One movement per actor per step — a ball can't go two places at once.
    const claimed = new Set<string>();
    const resolve = (v: Point | string): Point =>
      typeof v === 'string' ? pos.get(v) ?? markers.find((m) => m.id === v) ?? { x: 50, y: 32 } : v;

    stepKinds.push(group.map((p) => p.kind));

    for (const path of group) {
      const a = resolve(path.from);
      const b = resolve(path.to);
      strokes.push({ g, kind: path.kind, ax: a.x, ay: a.y, bx: b.x, by: b.y });

      const move = (id: string | null | undefined, target: Point) => {
        if (!id || claimed.has(id)) return;
        claimed.add(id);
        const from = pos.get(id);
        if (!from) return;
        keys.get(id)?.push({ g, fx: from.x, fy: from.y, tx: target.x, ty: target.y });
        updates.push([id, target]);
      };

      if (path.actor === null) {
        // Drawn only.
      } else if (path.kind === 'pass' || path.kind === 'shot') {
        move(path.actor ?? nearest(pos, balls, a), b);
      } else {
        const runner =
          path.actor ?? (typeof path.from === 'string' ? path.from : nearest(pos, people, a));
        move(runner, b);
        if (path.kind === 'dribble') {
          // The ball stays a touch ahead of the dribbler, along the direction of travel.
          const len = dist(a, b) || 1;
          const lead = { x: b.x + ((b.x - a.x) / len) * 3, y: b.y + ((b.y - a.y) / len) * 3 };
          move(nearest(pos, balls, a), lead);
        }
      }
    }

    for (const [id, p] of updates) pos.set(id, p);
  });

  const actors: Actor[] = movable.map((m) => ({
    id: m.id,
    kind: m.kind,
    label: m.label,
    x0: m.x,
    y0: m.y,
    keys: keys.get(m.id) ?? [],
  }));
  // Ball last, so it draws on top of whoever has it.
  actors.sort((a, b) => Number(a.kind === 'ball') - Number(b.kind === 'ball'));

  return { actors, fixtures, strokes, steps: groups.length, stepKinds };
}

/**
 * Fraction of each step spent moving; the rest is a hold so the eye can
 * register where everyone ended up before the next thing happens.
 */
export const MOVE_FRACTION = 0.68;

/** Smooth in-out, written out so it runs as a worklet without imports. */
export function easeInOut(p: number): number {
  'worklet';
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

/** 0→1 progress of step g at time t, including the hold. */
export function stepProgress(t: number, g: number): number {
  'worklet';
  const local = (t - g) / MOVE_FRACTION;
  return local <= 0 ? 0 : local >= 1 ? 1 : local;
}

/** Where an actor is at time t. */
export function positionAt(keys: Keyframe[], x0: number, y0: number, t: number): Point {
  'worklet';
  let x = x0;
  let y = y0;
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]!;
    if (t >= k.g + 1) {
      x = k.tx;
      y = k.ty;
    } else if (t > k.g) {
      const p = easeInOut(stepProgress(t, k.g));
      x = k.fx + (k.tx - k.fx) * p;
      y = k.fy + (k.ty - k.fy) * p;
      break;
    } else {
      break;
    }
  }
  return { x, y };
}
