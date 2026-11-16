import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';

import { AppText } from './AppText';
import { IconButton } from './IconButton';

export type ScreenHeaderProps = {
  title?: string;
  /** 'back' shows an arrow, 'close' an X (for modals) */
  leading?: 'back' | 'close' | 'none';
  trailing?: ReactNode;
  /** Custom handler for the leading button (defaults to navigating back) */
  onLeadingPress?: () => void;
};

/** Compact header for stack screens (we don't use the native header to keep full design control). */
export function ScreenHeader({ title, leading = 'back', trailing, onLeadingPress }: ScreenHeaderProps) {
  const goBack = onLeadingPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));

  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {leading !== 'none' ? (
          <IconButton
            icon={leading === 'close' ? 'x' : 'arrow-left'}
            onPress={goBack}
            accessibilityLabel={leading === 'close' ? 'Schließen' : 'Zurück'}
          />
        ) : null}
      </View>
      {title ? (
        <AppText variant="heading" align="center" style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
      ) : (
        <View style={styles.title} />
      )}
      <View style={[styles.side, styles.right]}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 44, marginBottom: -spacing.sm },
  side: { width: 44 },
  right: { alignItems: 'flex-end' },
  title: { flex: 1 },
});
