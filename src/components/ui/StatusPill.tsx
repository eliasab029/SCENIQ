import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { AppText } from './AppText';

export type Status = 'online' | 'offline' | 'checking' | 'idle' | 'planned';

const statusColors: Record<Status, { dot: string; bg: string }> = {
  online: { dot: colors.success, bg: colors.successSoft },
  offline: { dot: colors.danger, bg: colors.dangerSoft },
  checking: { dot: colors.warning, bg: colors.warningSoft },
  idle: { dot: colors.textTertiary, bg: colors.surfaceRaised },
  planned: { dot: colors.accent, bg: colors.accentSoft },
};

/** Compact status indicator (dot + label). */
export function StatusPill({ status, label, style }: { status: Status; label: string; style?: StyleProp<ViewStyle> }) {
  const c = statusColors[status];
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }, style]} accessibilityLabel={label}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: radii.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
