import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';

export type EmptyStateProps = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Render without card background (e.g. full-screen empty states) */
  bare?: boolean;
};

export function EmptyState({ icon, title, message, actionLabel, onAction, bare }: EmptyStateProps) {
  const body = (
    <View style={styles.inner}>
      <View style={styles.iconWrap}>
        <Feather name={icon} size={20} color={colors.textSecondary} />
      </View>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      {message ? (
        <AppText variant="callout" tone="secondary" align="center" style={styles.message}>
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="secondary" onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );

  if (bare) return body;
  return <Card style={styles.card}>{body}</Card>;
}

const styles = StyleSheet.create({
  card: { paddingVertical: spacing.xxl },
  inner: { alignItems: 'center', gap: spacing.sm },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  message: { maxWidth: 280 },
  action: { marginTop: spacing.md },
});
