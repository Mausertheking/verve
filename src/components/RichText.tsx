import { Text, StyleSheet, type StyleProp, type TextStyle } from 'react-native';

import { colors, type } from '@/theme';
import { termById } from '@/content';

/**
 * Renders body text containing inline glossary markup: `[[term-id|shown text]]`.
 *
 * Terminology in Azerbaijani football is genuinely inconsistent — people mix
 * Azerbaijani, Russian and English — so a reader hitting an unfamiliar word
 * needs it defined in place, without losing where she was.
 *
 * A term id that no longer exists renders as plain text rather than throwing.
 * check-content.mjs fails the build on dangling ids, so this is belt-and-braces
 * for content edited by hand between checks.
 */
const MARKUP = /\[\[([a-z0-9-]+)\|([^\]]+)\]\]/gi;

interface Props {
  children: string;
  onPressTerm: (termId: string) => void;
  style?: StyleProp<TextStyle>;
}

export function RichText({ children, onPressTerm, style }: Props) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  MARKUP.lastIndex = 0;
  while ((match = MARKUP.exec(children)) !== null) {
    const [full, id, label] = match;
    if (!id || !label) continue;

    if (match.index > cursor) parts.push(children.slice(cursor, match.index));

    if (termById(id)) {
      parts.push(
        <Text
          key={`${id}-${match.index}`}
          style={styles.term}
          onPress={() => onPressTerm(id)}
          accessibilityRole="link"
          accessibilityLabel={label}
        >
          {label}
        </Text>,
      );
    } else {
      parts.push(label);
    }
    cursor = match.index + full.length;
  }
  if (cursor < children.length) parts.push(children.slice(cursor));

  return <Text style={[styles.body, style]}>{parts}</Text>;
}

const styles = StyleSheet.create({
  body: { ...type.body, color: colors.textPrimary },
  term: {
    color: colors.accent,
    textDecorationLine: 'underline',
    textDecorationColor: colors.accentPressed,
  },
});
