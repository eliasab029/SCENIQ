import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/lib/haptics';
import { colors, gradients, layout, radii, shadows, spacing } from '@/theme';

const TAB_META: Record<string, { label: string; icon: keyof typeof Feather.glyphMap }> = {
  index: { label: 'Start', icon: 'home' },
  history: { label: 'Verlauf', icon: 'clock' },
  favorites: { label: 'Favoriten', icon: 'heart' },
  profile: { label: 'Profil', icon: 'user' },
};

/**
 * Floating tab bar with a central "new analysis" action.
 * The centre button is not a tab – it opens the upload flow as a modal.
 */
export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const middle = Math.ceil(state.routes.length / 2);

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <View style={[styles.bar, shadows.card]}>
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;
          const focused = state.index === index;

          const onPress = () => {
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              haptics.select();
              navigateToTab(route.key);
            }
          };

          return (
            <Fragment key={route.key}>
              {index === middle ? <CenterAction /> : null}
              <PressableScale
                onPress={onPress}
                haptic={false}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={meta.label}
                style={styles.tab}>
                <Feather name={meta.icon} size={20} color={focused ? colors.text : colors.textTertiary} />
                <AppText variant="caption" style={{ color: focused ? colors.text : colors.textTertiary, fontSize: 10 }}>
                  {meta.label}
                </AppText>
                <View style={[styles.indicator, focused && styles.indicatorActive]} />
              </PressableScale>
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}

function CenterAction() {
  return (
    <PressableScale
      onPress={() => router.push('/upload')}
      accessibilityLabel="Neues Foto analysieren"
      scaleTo={0.92}
      style={styles.centerWrap}>
      <LinearGradient colors={gradients.accent} style={[styles.center, shadows.glow]}>
        <Feather name="plus" size={24} color={colors.textOnAccent} />
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: layout.tabBarHeight,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.xs,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, height: '100%' },
  indicator: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'transparent', marginTop: 1 },
  indicatorActive: { backgroundColor: colors.accent },
  centerWrap: { marginHorizontal: spacing.xs },
  center: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
