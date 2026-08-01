/**
 * Content access. Everything is a static import, so it is bundled into the app
 * and available offline on first launch — nothing here touches the network.
 */
import tracksJson from '@content/tracks.json';
import rulesJson from '@content/lessons/rules.json';
import positionsJson from '@content/lessons/positions.json';
import goalkeeperJson from '@content/lessons/goalkeeper.json';
import drillsJson from '@content/drills.json';
import quizzesJson from '@content/quizzes.json';
import clubsJson from '@content/clubs.json';
import glossaryJson from '@content/glossary.json';

import type {
  Club, Drill, Equipment, GlossaryTerm, GroupSize, Lesson, Position, Quiz,
  SpaceNeed, Track, TrackId,
} from '@/types/content';

export const tracks = tracksJson as Track[];
export const lessons = [...rulesJson, ...positionsJson, ...goalkeeperJson] as Lesson[];
export const drills = drillsJson as Drill[];
export const quizzes = quizzesJson as Quiz[];
export const clubs = clubsJson as Club[];
export const glossary = glossaryJson as GlossaryTerm[];

export const lessonById = (id: string) => lessons.find((l) => l.id === id);
export const drillById = (id: string) => drills.find((d) => d.id === id);
export const trackById = (id: string) => tracks.find((t) => t.id === id);
export const quizById = (id: string) => quizzes.find((q) => q.id === id);
export const termById = (id: string) => glossary.find((g) => g.id === id);

export const lessonsInTrack = (trackId: TrackId) =>
  lessons.filter((l) => l.trackId === trackId).sort((a, b) => a.order - b.order);

export const quizForTrack = (trackId: TrackId) => quizzes.find((q) => q.trackId === trackId);

// ---------------------------------------------------------------------------
// Drill filtering
// ---------------------------------------------------------------------------

export interface DrillFilters {
  positions: Position[];
  equipment: Equipment[];
  space: SpaceNeed[];
  group: GroupSize[];
  /** 's' ≤ 8 min · 'm' 9–12 · 'l' 13+ */
  time: ('s' | 'm' | 'l')[];
}

export const emptyFilters = (): DrillFilters => ({
  positions: [], equipment: [], space: [], group: [], time: [],
});

const timeBucket = (minutes: number) => (minutes <= 8 ? 's' : minutes <= 12 ? 'm' : 'l');

/**
 * Equipment is a *capability* filter, not a requirement filter: selecting
 * "cones" means "I have cones", so drills needing nothing still match. This is
 * what the target user is actually asking — "what can I do with what I've got"
 * — and the label in the UI says so ("Nəyim var" / "What I have") rather than
 * "Equipment", which would read as a requirement.
 */
export function matchesFilters(drill: Drill, f: DrillFilters): boolean {
  if (f.positions.length > 0) {
    const hit = f.positions.some(
      (p) => drill.positions.includes(p) || drill.positions.includes('any'),
    );
    if (!hit) return false;
  }
  if (f.equipment.length > 0) {
    const needed = drill.equipment.filter((e) => e !== 'none');
    if (!needed.every((e) => f.equipment.includes(e))) return false;
  }
  if (f.space.length > 0 && !f.space.includes(drill.space)) return false;
  if (f.group.length > 0 && !f.group.includes(drill.group)) return false;
  if (f.time.length > 0 && !f.time.includes(timeBucket(drill.minutes))) return false;
  return true;
}

export const filterDrills = (f: DrillFilters) => drills.filter((d) => matchesFilters(d, f));

export const activeFilterCount = (f: DrillFilters) =>
  Object.values(f).reduce((n, arr) => n + arr.length, 0);
