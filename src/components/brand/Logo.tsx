import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, fonts, gradients, radii } from '@/theme';

/** Equalizer bar heights (relative) that form the SCENIQ mark. */
const BARS = [0.45, 0.85, 0.6, 1, 0.5];

export function LogoMark({ size = 32 }: { size?: number }) {
  const barWidth = Math.max(2, Math.round(size * 0.08));
  const inner = size * 0.5;
  return (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.mark, { width: size, height: size, borderRadius: size * 0.3 }]}>
      <View style={[styles.bars, { height: inner, gap: barWidth * 0.8 }]}>
        {BARS.map((h, i) => (
          <View
            key={i}
            style={{
              width: barWidth,
              height: inner * h,
              borderRadius: barWidth,
              backgroundColor: i === 3 ? colors.accent : colors.text,
              opacity: i === 3 ? 1 : 0.85,
            }}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="SCENIQ">
      <LogoMark size={size} />
      <AppText style={[styles.wordmark, { fontSize: size * 0.44 }]}>SCENIQ</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  bars: { flexDirection: 'row', alignItems: 'flex-end' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wordmark: { fontFamily: fonts.semibold, letterSpacing: 3, color: colors.text, borderRadius: radii.sm },
});
