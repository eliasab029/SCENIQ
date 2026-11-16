import { Text, type TextProps } from 'react-native';

import { colors, typography, type TypographyVariant } from '@/theme';

type Tone = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'danger' | 'onAccent';

const toneColor: Record<Tone, string> = {
  primary: colors.text,
  secondary: colors.textSecondary,
  tertiary: colors.textTertiary,
  accent: colors.accent,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  onAccent: colors.textOnAccent,
};

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  tone?: Tone;
  align?: 'left' | 'center' | 'right';
  uppercase?: boolean;
};

/** The only text component used in the app – guarantees consistent typography. */
export function AppText({
  variant = 'body',
  tone = 'primary',
  align,
  uppercase,
  style,
  ...rest
}: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[
        typography[variant],
        { color: toneColor[tone] },
        align && { textAlign: align },
        uppercase && { textTransform: 'uppercase' },
        style,
      ]}
    />
  );
}
