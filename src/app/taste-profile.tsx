import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText, Card, Screen, ScreenHeader, StatusPill } from '@/components/ui';
import { colors, radii, spacing } from '@/theme';

const PROFILE_AREAS: { icon: keyof typeof Feather.glyphMap; title: string; text: string }[] = [
  { icon: 'disc', title: 'Genres', text: 'Was du gern hörst – und was gar nicht.' },
  { icon: 'mic', title: 'Künstler', text: 'Deine Lieblingsartists als Orientierung.' },
  { icon: 'cloud', title: 'Stimmungen', text: 'Melancholisch, euphorisch, ruhig …' },
  { icon: 'bar-chart-2', title: 'Intensität', text: 'Von ganz ruhig bis voller Energie.' },
  { icon: 'compass', title: 'Entdeckerlust', text: 'Bekannte Hits oder echte Geheimtipps.' },
  { icon: 'calendar', title: 'Jahrzehnte', text: 'Von 70s-Soul bis aktuelle Releases.' },
];

/**
 * Music profile – the onboarding and editor are built in Phase 3.
 * This screen honestly shows what the profile will contain.
 */
export default function TasteProfileScreen() {
  return (
    <Screen>
      <ScreenHeader title="Musikprofil" />

      <View style={styles.intro}>
        <StatusPill status="planned" label="Wird in Phase 3 eingerichtet" />
        <AppText variant="display">Musik, die nach dir klingt.</AppText>
        <AppText variant="body" tone="secondary">
          Dein Profil sorgt dafür, dass zwei Menschen mit demselben Foto unterschiedliche Empfehlungen bekommen. Es
          entsteht in einer kurzen Einführung und lernt mit jedem Feedback dazu.
        </AppText>
      </View>

      <View style={styles.grid}>
        {PROFILE_AREAS.map((a) => (
          <Card key={a.title} style={styles.tile}>
            <View style={styles.tileIcon}>
              <Feather name={a.icon} size={16} color={colors.accent} />
            </View>
            <AppText variant="bodyMedium">{a.title}</AppText>
            <AppText variant="caption" tone="tertiary">
              {a.text}
            </AppText>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: { flexBasis: '47%', flexGrow: 1, gap: spacing.xs + 2 },
  tileIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
});
