import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

export type ListRowProps = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  /** Right-side element (e.g. a StatusPill). Replaces the chevron. */
  trailing?: ReactNode;
  /** Marks the row as not yet implemented: rendered dimmed and not tappable. */
  plannedPhase?: number;
  destructive?: boolean;
};

export function ListRow({ icon, title, subtitle, onPress, trailing, plannedPhase, destructive }: ListRowProps) {
  const isPlanned = plannedPhase !== undefined;
  const tint = destructive ? colors.danger : colors.text;

  const content = (
    <>
      <View style={[styles.iconWrap, destructive && { backgroundColor: colors.dangerSoft }]}>
        <Feather name={icon} size={17} color={tint} />
      </View>
      <View style={styles.text}>
        <AppText variant="bodyMedium" style={{ color: tint }}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="tertiary">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {isPlanned ? (
        <View style={styles.badge}>
          <AppText variant="caption" tone="accent">
            Phase {plannedPhase}
          </AppText>
        </View>
      ) : (
        (trailing ?? (onPress ? <Feather name="chevron-right" size={18} color={colors.textTertiary} /> : null))
      )}
    </>
  );

  if (!onPress || isPlanned) {
    return (
      <View
        style={[styles.row, isPlanned && styles.planned]}
        accessibilityLabel={isPlanned ? `${title}, folgt in Phase ${plannedPhase}` : title}>
        {content}
      </View>
    );
  }
  return (
    <PressableScale onPress={onPress} scaleTo={0.985} accessibilityLabel={title} style={styles.row}>
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  planned: { opacity: 0.55 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 1 },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
  },
});
