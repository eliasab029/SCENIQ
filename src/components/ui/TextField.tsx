import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fonts, radii, spacing } from '@/theme';

import { AppText } from './AppText';

export type TextFieldProps = TextInputProps & {
  label: string;
  hint?: string;
};

export function TextField({ label, hint, style, ...rest }: TextFieldProps) {
  return (
    <View style={styles.wrap}>
      <AppText variant="callout" tone="secondary">
        {label}
      </AppText>
      <TextInput
        placeholderTextColor={colors.textTertiary}
        selectionColor={colors.accent}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={label}
        {...rest}
        style={[styles.input, style]}
      />
      {hint ? (
        <AppText variant="caption" tone="tertiary">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs + 2 },
  input: {
    height: 48,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
});
