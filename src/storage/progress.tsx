import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type PropsWithChildren,
} from 'react';

import type { Locale } from '@/types/content';

/**
 * Local progress. Anonymous by design — lesson ids, drill ids, quiz scores and
 * the chosen language, nothing else. No account, no device id, no timestamps
 * that could identify a person beyond when they used the app on their own
 * phone. Users are minors; this never leaves the device and there is nowhere
 * for it to go, because the app has no network layer.
 */
const KEY = 'verve.progress.v1';

export interface ProgressState {
  version: 1;
  locale: Locale;
  lessonsCompleted: Record<string, number>;
  drillsDone: Record<string, number>;
  quizResults: Record<string, { bestScore: number; total: number; passedAt?: number }>;
}

const initial: ProgressState = {
  version: 1,
  locale: 'az',
  lessonsCompleted: {},
  drillsDone: {},
  quizResults: {},
};

interface ProgressApi {
  progress: ProgressState;
  ready: boolean;
  toggleLesson: (id: string) => void;
  toggleDrill: (id: string) => void;
  recordQuiz: (quizId: string, score: number, total: number) => void;
  setLocale: (locale: Locale) => void;
  reset: () => void;
}

const Ctx = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: PropsWithChildren) {
  const [progress, setProgress] = useState<ProgressState>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (alive && raw) setProgress({ ...initial, ...(JSON.parse(raw) as ProgressState) });
      } catch {
        // A corrupt or unreadable store is not worth crashing over — start
        // fresh. Progress is a convenience, not something we can't rebuild.
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((next: ProgressState) => {
    setProgress(next);
    void AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {
      // Writing failed (storage full, permissions). The in-memory state is
      // still correct for this session; nothing user-facing should break.
    });
  }, []);

  const api = useMemo<ProgressApi>(() => {
    const toggle = (bucket: 'lessonsCompleted' | 'drillsDone') => (id: string) => {
      const current = { ...progress[bucket] };
      if (current[id]) delete current[id];
      else current[id] = Date.now();
      persist({ ...progress, [bucket]: current });
    };

    return {
      progress,
      ready,
      toggleLesson: toggle('lessonsCompleted'),
      toggleDrill: toggle('drillsDone'),
      recordQuiz: (quizId, score, total) => {
        const previous = progress.quizResults[quizId];
        persist({
          ...progress,
          quizResults: {
            ...progress.quizResults,
            [quizId]: {
              bestScore: Math.max(score, previous?.bestScore ?? 0),
              total,
              passedAt: Date.now(),
            },
          },
        });
      },
      setLocale: (locale) => persist({ ...progress, locale }),
      reset: () => persist({ ...initial, locale: progress.locale }),
    };
  }, [progress, ready, persist]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
