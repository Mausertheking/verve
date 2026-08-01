import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, type, MIN_TAP } from '@/theme';

/** Screen scaffold. Bottom padding clears the tab bar on tall content. */
export function Screen({ children }: { children?: ReactNode }) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionLabel}>{String(children).toUpperCase()}</Text>;
}

/**
 * Tappable card. `accessibilityLabel` is required, not optional — every
 * interactive element must be reachable by a screen reader in the active
 * locale, and making it optional is how that quietly stops happening.
 */
export function Card({
  children, onPress, accessibilityLabel,
}: {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
}) {
  if (!onPress) {
    return <View style={styles.card}>{children}</View>;
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {children}
    </Pressable>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{children}</Text>
    </View>
  );
}

/** Flat progress bar. Fills instantly — there is no animated variant. */
export function Meter({ percent }: { percent: number }) {
  return (
    <View style={styles.meter}>
      <View style={[styles.meterFill, { width: `${Math.max(0, Math.min(100, percent))}%` }]} />
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

/**
 * Marks unfinished or unreviewed content in the UI itself, so the state is
 * visible while using the app rather than only in the JSON.
 */
export function StatusNote({ kind, children }: { kind: 'todo' | 'draft'; children: ReactNode }) {
  return (
    <View style={styles.statusNote}>
      <View style={[styles.badge, kind === 'draft' && styles.badgeDraft]}>
        <Text style={[styles.badgeText, kind === 'draft' && styles.badgeTextDraft]}>
          {kind === 'todo' ? 'TODO' : 'DRAFT'}
        </Text>
      </View>
      <Text style={styles.statusBody}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  screenContent: { padding: space.lg, paddingBottom: space.xxl },

  sectionLabel: {
    ...type.overline,
    color: colors.textSecondary,
    marginTop: space.xl,
    marginBottom: space.sm + 2,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: space.md + 2,
    marginBottom: space.sm + 2,
    minHeight: MIN_TAP,
  },
  cardPressed: { backgroundColor: colors.surfaceRaised },

  tag: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
  },
  tagText: { ...type.caption, color: colors.textSecondary },

  meter: {
    height: 4,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: space.md,
  },
  meterFill: { height: '100%', backgroundColor: colors.accent },

  empty: { paddingVertical: 54, paddingHorizontal: space.xl, alignItems: 'center' },
  emptyTitle: { ...type.h2, color: colors.textPrimary, marginBottom: space.sm },
  emptyBody: { ...type.small, color: colors.textSecondary, textAlign: 'center', maxWidth: 320 },

  statusNote: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: space.md + 2,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: space.sm + 1,
  },
  badgeDraft: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: colors.onAccent },
  badgeTextDraft: { color: colors.textSecondary },
  statusBody: { ...type.small, color: colors.textSecondary },
});
