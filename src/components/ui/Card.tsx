import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { colors, radii, shadows, spacing } from '@/theme';

import { PressableScale } from './PressableScale';

export type CardProps = ViewProps & {
  onPress?: () => void;
  padded?: boolean;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** Rounded surface. Becomes pressable (with scale feedback) when `onPress` is set. */
export function Card({ onPress, padded = true, elevated, style, children, accessibilityLabel, ...rest }: CardProps) {
  const cardStyle = [styles.base, padded && styles.padded, elevated && shadows.card, style];

  if (onPress) {
    return (
      <PressableScale onPress={onPress} accessibilityLabel={accessibilityLabel} style={cardStyle}>
        {children}
      </PressableScale>
    );
  }
  return (
    <View {...rest} style={cardStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  padded: { padding: spacing.lg },
});
