import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { LogoMark } from '@/components/brand/Logo';
import { AppText, Card, ListRow, Screen, SectionHeader } from '@/components/ui';
import { useSettings } from '@/data/settings';
import { colors, spacing } from '@/theme';

export default function ProfileScreen() {
  const { settings } = useSettings();

  return (
    <Screen withTabBar>
      <AppText variant="display">Profil</AppText>

      <Card style={styles.hero}>
        <LogoMark size={48} />
        <View style={styles.heroText}>
          <AppText variant="heading">Dein Musikgeschmack</AppText>
          <AppText variant="callout" tone="secondary">
            Je mehr du STORYTUNE nutzt, desto genauer werden die Empfehlungen.
          </AppText>
        </View>
      </Card>

      <View style={styles.section}>
        <SectionHeader title="Musik" />
        <Card padded={false}>
          <ListRow
            icon="sliders"
            title="Musikprofil"
            subtitle="Genres, Künstler, Stimmungen"
            onPress={() => router.push('/taste-profile')}
          />
          <Divider />
          <ListRow icon="heart" title="Favoriten" onPress={() => router.push('/favorites')} />
          <Divider />
          <ListRow icon="clock" title="Analyseverlauf" onPress={() => router.push('/history')} />
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="App" />
        <Card padded={false}>
          <ListRow
            icon="cpu"
            title="Bild-KI"
            subtitle={settings.ollamaUrl ? `Ollama · ${settings.ollamaModel}` : 'Noch nicht eingerichtet'}
            onPress={() => router.push('/settings')}
          />
          <Divider />
          <ListRow icon="settings" title="Einstellungen" onPress={() => router.push('/settings')} />
        </Card>
      </View>
    </Screen>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  heroText: { flex: 1, gap: spacing.xs },
  section: { gap: spacing.lg },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 62 },
});
