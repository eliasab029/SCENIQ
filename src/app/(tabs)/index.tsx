import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Logo } from '@/components/brand/Logo';
import {
  AppText,
  Card,
  EmptyState,
  IconButton,
  PressableScale,
  Screen,
  SectionHeader,
} from '@/components/ui';
import { colors, fonts, gradients, motion, radii, shadows, spacing } from '@/theme';

function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return 'Gute Nacht';
  if (h < 11) return 'Guten Morgen';
  if (h < 17) return 'Hallo';
  if (h < 22) return 'Guten Abend';
  return 'Gute Nacht';
}

const enter = (i: number) => FadeInDown.duration(motion.slow).delay(i * motion.stagger);

export default function HomeScreen() {
  return (
    <Screen withTabBar>
      <Animated.View entering={enter(0)} style={styles.header}>
        <Logo size={30} />
        <IconButton icon="settings" accessibilityLabel="Einstellungen" onPress={() => router.push('/settings')} />
      </Animated.View>

      <Animated.View entering={enter(1)} style={styles.greeting}>
        <AppText variant="overline" tone="tertiary" uppercase>
          {greeting()}
        </AppText>
        <AppText variant="hero">
          Welcher <AppText variant="hero" style={styles.italic}>Sound</AppText> passt zu deinem Moment?
        </AppText>
      </Animated.View>

      <Animated.View entering={enter(2)}>
        <PressableScale
          onPress={() => router.push('/upload')}
          accessibilityLabel="Foto auswählen und analysieren"
          scaleTo={0.98}
          style={[styles.heroCard, shadows.card]}>
          <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroGradient}>
            <View style={styles.heroGlow} />
            <View style={styles.heroIcon}>
              <Feather name="image" size={26} color={colors.text} />
            </View>
            <View style={styles.heroText}>
              <AppText variant="title">Foto auswählen</AppText>
              <AppText variant="body" tone="secondary">
                Lade das Bild deiner Story hoch – SCENIQ findet die Musik, die es trägt.
              </AppText>
            </View>
            <View style={styles.heroCta}>
              <AppText variant="callout" tone="onAccent">
                Los geht&apos;s
              </AppText>
              <Feather name="arrow-right" size={16} color={colors.textOnAccent} />
            </View>
          </LinearGradient>
        </PressableScale>
      </Animated.View>

      <Animated.View entering={enter(3)} style={styles.quickRow}>
        <Card style={styles.quickCard} onPress={() => router.push('/taste-profile')} accessibilityLabel="Musikprofil">
          <Feather name="sliders" size={18} color={colors.accent} />
          <AppText variant="bodyMedium">Musikprofil</AppText>
          <AppText variant="caption" tone="tertiary">
            Noch nicht eingerichtet
          </AppText>
        </Card>
        <Card style={styles.quickCard} onPress={() => router.push('/favorites')} accessibilityLabel="Favoriten">
          <Feather name="heart" size={18} color={colors.accent} />
          <AppText variant="bodyMedium">Favoriten</AppText>
          <AppText variant="caption" tone="tertiary">
            0 Songs
          </AppText>
        </Card>
      </Animated.View>

      <Animated.View entering={enter(4)} style={styles.section}>
        <SectionHeader title="Letzte Analysen" />
        <EmptyState
          icon="clock"
          title="Noch keine Analysen"
          message="Deine analysierten Fotos und Empfehlungen erscheinen hier."
        />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { gap: spacing.sm, marginTop: spacing.sm },
  italic: { fontFamily: fonts.displayItalic, color: colors.accent },
  heroCard: { borderRadius: radii.xl, overflow: 'hidden' },
  heroGradient: {
    minHeight: 280,
    padding: spacing.xxl,
    justifyContent: 'space-between',
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    right: -80,
    top: -90,
    backgroundColor: colors.accentGlow,
    opacity: 0.22,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { gap: spacing.sm, marginTop: spacing.xxxl },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
  quickRow: { flexDirection: 'row', gap: spacing.md },
  quickCard: { flex: 1, gap: spacing.xs + 2 },
  section: { gap: spacing.lg },
});
