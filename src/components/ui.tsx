import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SHOW_REVIEW_STATUS } from '@/config';
import { PressableScale, Reveal, useMeterFill } from '@/motion';
import { colors, radius, space, type, MIN_TAP } from '@/theme';

/**
 * Screen scaffold. Bottom padding clears the tab bar on tall content.
 * `topInset` is for tab screens, which draw their own hero instead of a header.
 */
export function Screen({ children, topInset }: { children?: ReactNode; topInset?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.screenContent, topInset && { paddingTop: insets.top + space.lg }]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

/**
 * Section opener: an optional italic serif folio ("01"), the label in spaced
 * capitals, and a hairline running to the edge — the editorial rhythm every
 * long screen is built on.
 */
export function SectionLabel({ children, n }: { children: ReactNode; n?: number }) {
  return (
    <View style={styles.sectionRow} accessibilityRole="header">
      {n !== undefined ? <Text style={styles.folio}>{String(n).padStart(2, '0')}</Text> : null}
      <Text style={styles.sectionLabel}>{String(children).toUpperCase()}</Text>
      <View style={styles.rule} />
    </View>
  );
}

/**
 * Screen hero: kicker in spaced capitals, a serif display line, an optional
 * lead paragraph, and a short accent rule underneath.
 */
export function Hero({
  kicker, title, lead, aside,
}: {
  kicker?: string;
  title: string;
  lead?: string;
  aside?: ReactNode;
}) {
  return (
    <View style={styles.hero}>
      {aside ? <View style={styles.heroTop}>{aside}</View> : null}
      {kicker ? <Text style={styles.kicker}>{kicker.toUpperCase()}</Text> : null}
      <Reveal index={0}>
        <Text style={styles.heroTitle} accessibilityRole="header">{title}</Text>
      </Reveal>
      {lead ? (
        <Reveal index={1}>
          <Text style={styles.heroLead}>{lead}</Text>
        </Reveal>
      ) : null}
      <View style={styles.heroRule} />
    </View>
  );
}

/**
 * Tappable card. `accessibilityLabel` is required, not optional — every
 * interactive element must be reachable by a screen reader in the active
 * locale, and making it optional is how that quietly stops happening.
 */
export function Card({
  children, onPress, accessibilityLabel, index,
}: {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  /** Position in a list. When set, the card staggers in on mount. */
  index?: number;
}) {
  const card = !onPress ? (
    <View style={styles.card}>{children}</View>
  ) : (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {children}
    </PressableScale>
  );
  return index === undefined ? card : <Reveal index={index}>{card}</Reveal>;
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{children}</Text>
    </View>
  );
}

/** Flat progress bar. Grows to its value on mount and on change. */
export function Meter({ percent }: { percent: number }) {
  const fill = useMeterFill(percent);
  return (
    <View style={styles.meter}>
      <Animated.View style={[styles.meterFill, fill]} />
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
 * visible while using the app rather than only in the JSON. Shown only in
 * review builds (see src/config.ts) — never in the store build.
 */
export function StatusNote({ kind, children }: { kind: 'todo' | 'draft'; children: ReactNode }) {
  if (!SHOW_REVIEW_STATUS) return null;
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
  screenContent: { padding: space.lg + 4, paddingBottom: space.xxl * 2 },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.xxl,
    marginBottom: space.md + 2,
  },
  folio: { ...type.folio, color: colors.accent },
  sectionLabel: { ...type.overline, color: colors.textSecondary, flexShrink: 1 },
  rule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },

  hero: { paddingTop: space.sm, paddingBottom: space.xs },
  heroTop: { flexDirection: 'row', alignItems: 'center', marginBottom: space.xl, minHeight: 32 },
  kicker: { ...type.overline, color: colors.accent, marginBottom: space.md },
  heroTitle: { ...type.display, color: colors.textPrimary },
  heroLead: { ...type.body, color: colors.textSecondary, marginTop: space.md },
  heroRule: { width: 36, height: 2, backgroundColor: colors.accent, marginTop: space.xl },

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
