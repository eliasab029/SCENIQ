import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, spacing } from '@/theme';

export type ScreenProps = {
  children: ReactNode;
  /** Scrollable content (default) or a fixed view */
  scroll?: boolean;
  /** Adds bottom space so content clears the floating tab bar */
  withTabBar?: boolean;
  /** Respect the top safe area (disable when a native header is shown) */
  safeTop?: boolean;
  /** Optional element pinned to the bottom (e.g. primary CTA) */
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Standard screen container: background, safe areas, gutter, max width. */
export function Screen({
  children,
  scroll = true,
  withTabBar = false,
  safeTop = true,
  footer,
  contentStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bottomSpace = withTabBar
    ? layout.tabBarHeight + insets.bottom + spacing.xxxl
    : footer
      ? spacing.lg
      : insets.bottom + spacing.xxl;

  const content = [
    styles.content,
    { paddingTop: safeTop ? insets.top + spacing.md : spacing.md, paddingBottom: bottomSpace },
    contentStyle,
  ];

  return (
    <View style={styles.root}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[content, styles.fill]}>{children}</View>
      )}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>{footer}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  fill: { flex: 1 },
  content: {
    paddingHorizontal: spacing.gutter,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    gap: spacing.xxl,
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    backgroundColor: colors.background,
  },
});
