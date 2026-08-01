import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, space, type, MIN_TAP } from '@/theme';

/**
 * Filled primary action. Text is `onAccent` (near-black) rather than white —
 * white on the accent is 3.78:1 and fails AA, black is 5.56:1.
 */
export function Button({
  label, onPress, variant = 'primary', disabled,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        variant === 'ghost' && styles.buttonGhost,
        disabled && styles.buttonDisabled,
        pressed && !disabled && (variant === 'ghost' ? styles.ghostPressed : styles.primaryPressed),
      ]}
    >
      <Text
        style={[
          styles.buttonLabel,
          variant === 'ghost' && styles.buttonLabelGhost,
          disabled && styles.buttonLabelDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Filter chip. Selected state is a solid accent fill, never an outline glow. */
export function Chip({
  label, selected, onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipOn,
        pressed && !selected && styles.chipPressed,
      ]}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelOn]}>{label}</Text>
    </Pressable>
  );
}

export function SearchInput({
  value, onChangeText, placeholder,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      accessibilityLabel={placeholder}
      style={styles.input}
      autoCorrect={false}
      // No autocapitalise: Azerbaijani terms are lowercase in the glossary.
      autoCapitalize="none"
    />
  );
}

/** Numbered list used for takeaways and drill steps. */
export function NumberedItem({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <View style={styles.numbered}>
      <View style={styles.numberBadge}>
        <Text style={styles.numberText}>{n}</Text>
      </View>
      <View style={styles.numberedBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 15,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_TAP,
    marginTop: space.sm + 2,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDisabled: { backgroundColor: colors.surfaceRaised },
  primaryPressed: { backgroundColor: colors.accentPressed },
  ghostPressed: { backgroundColor: colors.surfaceRaised },
  buttonLabel: { ...type.h2, color: colors.onAccent, fontWeight: '700' },
  buttonLabelGhost: { color: colors.textPrimary },
  buttonLabelDisabled: { color: colors.textSecondary },

  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.sm + 2,
    paddingVertical: 9,
    paddingHorizontal: 13,
    minHeight: 38,
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipPressed: { backgroundColor: colors.surfaceRaised },
  chipLabel: { ...type.small, color: colors.textSecondary },
  chipLabelOn: { color: colors.onAccent, fontWeight: '700' },

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 13,
    paddingVertical: 11,
    color: colors.textPrimary,
    ...type.label,
    minHeight: MIN_TAP,
  },

  numbered: { flexDirection: 'row', gap: space.sm + 2, marginBottom: space.md - 1 },
  numberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  numberText: { fontSize: 11, fontWeight: '700', color: colors.onAccent },
  numberedBody: { flex: 1 },
});
