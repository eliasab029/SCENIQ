import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText, Button, Chip, PressableScale, Screen, ScreenHeader, StatusPill } from '@/components/ui';
import { draftStore, useAnalysisDraft } from '@/features/analysis/draft';
import { STORY_EFFECTS, SURPRISE_EFFECT, getEffect, type EffectId } from '@/features/effects/effects';
import { haptics } from '@/lib/haptics';
import { colors, motion, radii, spacing } from '@/theme';

export default function EffectScreen() {
  const { image, effect } = useAnalysisDraft();

  // Deep link / reload without a photo → back to upload
  if (!image) return <Redirect href="/upload" />;

  const toggle = (id: EffectId) => {
    haptics.select();
    draftStore.setEffect(effect === id ? null : id);
  };

  const selected = getEffect(effect);
  const surpriseActive = effect === SURPRISE_EFFECT.id;

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <Button label="Analyse starten" size="lg" icon="zap" fullWidth disabled />
          <StatusPill status="planned" label="Bildanalyse folgt in Phase 4" style={styles.footerNote} />
        </View>
      }>
      <ScreenHeader title="Wirkung" />

      <Animated.View entering={FadeInDown.duration(motion.slow)} style={styles.intro}>
        <Image source={{ uri: image.uri }} style={styles.thumb} contentFit="cover" />
        <View style={styles.introText}>
          <AppText variant="display">Wie soll deine Story wirken?</AppText>
          <AppText variant="callout" tone="secondary">
            Optional. Ohne Auswahl entscheidet SCENIQ selbst.
          </AppText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(motion.slow).delay(motion.stagger)}>
        <PressableScale
          onPress={() => toggle(SURPRISE_EFFECT.id)}
          accessibilityLabel={SURPRISE_EFFECT.label}
          accessibilityState={{ selected: surpriseActive }}
          scaleTo={0.985}
          style={[styles.surprise, surpriseActive && styles.surpriseActive]}>
          <View style={styles.surpriseIcon}>
            <Feather name="shuffle" size={18} color={colors.accent} />
          </View>
          <View style={styles.flex}>
            <AppText variant="bodyMedium">{SURPRISE_EFFECT.label}</AppText>
            <AppText variant="caption" tone="tertiary">
              {SURPRISE_EFFECT.hint}
            </AppText>
          </View>
          <Feather
            name={surpriseActive ? 'check-circle' : 'circle'}
            size={20}
            color={surpriseActive ? colors.accent : colors.textTertiary}
          />
        </PressableScale>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(motion.slow).delay(motion.stagger * 2)} style={styles.chips}>
        {STORY_EFFECTS.map((e) => (
          <Chip key={e.id} label={e.label} selected={effect === e.id} onPress={() => toggle(e.id)} />
        ))}
      </Animated.View>

      {selected && !surpriseActive ? (
        <Animated.View key={selected.id} entering={FadeInDown.duration(motion.base)}>
          <AppText variant="callout" tone="secondary" align="center">
            {selected.hint}
          </AppText>
        </Animated.View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  thumb: { width: 76, height: 96, borderRadius: radii.md, backgroundColor: colors.surface },
  introText: { flex: 1, gap: spacing.xs },
  surprise: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  surpriseActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  surpriseIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  flex: { flex: 1 },
  footer: { gap: spacing.md },
  footerNote: { alignSelf: 'center' },
});
