/**
 * The content schema. These types describe the JSON in /content, which is
 * bundled into the app — there is no server and nothing is fetched.
 */

export const LOCALES = ['az', 'ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Every user-facing string carries all three languages. `ru` and `en` may be
 * empty: the renderer falls back to `az`, which is the agreed policy so content
 * can ship in Azerbaijani first rather than waiting on translation.
 */
export type LocalizedText = Record<Locale, string>;
export type LocalizedList = Record<Locale, string[]>;

/** A local file in /assets/videos, named after the content id. Never a URL. */
export interface VideoRef {
  file: string;
  durationSec: number;
  caption: LocalizedText;
}

// ---------------------------------------------------------------------------
// Diagrams — data only, rendered by <PitchDiagram>. No raster images anywhere.
// ---------------------------------------------------------------------------

/**
 * Diagram space is x 0–100, y 0–65. The 100:65 ratio approximates a real pitch,
 * so a circle drawn in these units stays a circle on screen.
 */
export interface Point {
  x: number;
  y: number;
}

export type PitchView = 'full' | 'half' | 'penalty-area' | 'goal-area' | 'blank';
export type MarkerKind = 'player' | 'opponent' | 'keeper' | 'ball' | 'cone' | 'target';
export type PathKind = 'run' | 'pass' | 'shot' | 'dribble';
/** `wall` is a solid rebound surface for solo drills — drawn as a hatched bar. */
export type ZoneKind = 'highlight' | 'space' | 'danger' | 'wall';

export interface DiagramMarker extends Point {
  id: string;
  kind: MarkerKind;
  label?: string;
}

export interface DiagramPath {
  /** A literal point, or the id of a marker to anchor to. */
  from: Point | string;
  to: Point | string;
  kind: PathKind;
  curve?: number;
  /**
   * Explainer step this movement plays in. Paths sharing a step move together
   * (a pass while a teammate runs). Omitted → each path gets its own step, in
   * array order.
   */
  at?: number;
  /**
   * Marker id that travels along this path. Omitted → inferred: the ball for
   * passes and shots, the nearest player to `from` for runs, both for dribbles.
   * `null` → nothing travels; the line is drawn only (e.g. two possible shots).
   */
  actor?: string | null;
}

export interface DiagramZone extends Point {
  w: number;
  h: number;
  kind: ZoneKind;
  label?: string;
}

/** A vertical reference line, e.g. the offside line. */
export interface DiagramLine {
  x: number;
  label?: LocalizedText;
}

export interface PitchDiagramData {
  view: PitchView;
  markers?: DiagramMarker[];
  paths?: DiagramPath[];
  zones?: DiagramZone[];
  lines?: DiagramLine[];
  caption?: LocalizedText;
  /**
   * One caption per explainer step, shown while that step plays. Optional —
   * without it each step is labelled by its movement ("Pass", "Run").
   */
  beats?: LocalizedText[];
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export type TrackId = 'rules' | 'positions' | 'goalkeeper';

/**
 * 'todo'     — structure only; nothing written yet.
 * 'draft'    — written, not yet signed off.
 * 'reviewed' — a human has approved it. Nothing ships as this by default.
 */
export type ContentStatus = 'todo' | 'draft' | 'reviewed';

export interface Track {
  id: TrackId;
  title: LocalizedText;
  summary: LocalizedText;
  quizId: string;
}

export interface Lesson {
  /** Also the video filename stem, e.g. `gk-catching-01` → `gk-catching-01.mp4`. */
  id: string;
  trackId: TrackId;
  order: number;
  title: LocalizedText;
  video?: VideoRef;
  /**
   * Paragraphs. Glossary terms are marked inline as `[[term-id|shown text]]`.
   * A paragraph starting with `## ` is a sub-heading.
   */
  body: LocalizedList;
  diagram?: PitchDiagramData;
  takeaways: LocalizedList;
  glossaryTermIds: string[];
  estMinutes: number;
  /**
   * Where the facts come from — required for the rules track, e.g.
   * "IFAB Laws of the Game 2026/27 — Law 11". Shown under the lesson.
   */
  source?: string;
  status: ContentStatus;
  reviewed: boolean;
}

export type Position = 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | 'any';
export type Equipment = 'none' | 'ball' | 'cones' | 'wall' | 'partner';
export type SpaceNeed = 'bedroom' | 'yard' | 'half-pitch';
export type GroupSize = 'solo' | 'group';

export interface Drill {
  id: string;
  title: LocalizedText;
  video?: VideoRef;
  positions: Position[];
  equipment: Equipment[];
  space: SpaceNeed;
  group: GroupSize;
  minutes: number;
  difficulty: 1 | 2 | 3;
  /** One paragraph: what this drill trains and why it matters. */
  why?: LocalizedText;
  steps: LocalizedList;
  diagram?: PitchDiagramData;
  whatGoodLooksLike: LocalizedList;
  glossaryTermIds: string[];
  status: ContentStatus;
  reviewed: boolean;
}

export interface QuizOption {
  id: string;
  text: LocalizedText;
}

export interface QuizQuestion {
  id: string;
  prompt: LocalizedText;
  options: QuizOption[];
  correctOptionId: string;
  /** Always shown after a wrong answer. A question is never skipped silently. */
  explanation: LocalizedText;
  reviseLessonId?: string;
}

export interface Quiz {
  id: string;
  trackId: TrackId;
  questions: QuizQuestion[];
  status: ContentStatus;
  reviewed: boolean;
}

/**
 * Organisational contacts only — never a private individual's details, and
 * never an unverified entry. An empty list with a clear empty state is correct;
 * inventing a club is not.
 */
export interface Club {
  id: string;
  name: string;
  city: string;
  ageRange: { min: number; max: number };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    instagram?: string;
    address?: string;
  };
  notes: LocalizedText;
  /** ISO date. No entry ships without one. */
  verifiedOn: string;
}

export interface GlossaryTerm {
  id: string;
  term: LocalizedText;
  /** Variants people actually say, including mixed-language forms. */
  alsoKnownAs?: string[];
  definition: LocalizedText;
  relatedTermIds?: string[];
  seeLessonId?: string;
  reviewed: boolean;
}
