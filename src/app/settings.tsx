import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { AppText, Card, ListRow, Screen, ScreenHeader, SectionHeader, StatusPill } from '@/components/ui';
import { getStoreStatus, store, type StoreStatus } from '@/data/store';
import { detectMobileOS, isInstalledWebApp } from '@/lib/pwa';
import { colors, spacing } from '@/theme';

export default function SettingsScreen() {
  const [storage, setStorage] = useState<StoreStatus | null>(null);
  const showInstallHint = Platform.OS === 'web' && !isInstalledWebApp();

  useEffect(() => {
    getStoreStatus(store).then(setStorage);
  }, []);

  return (
    <Screen>
      <ScreenHeader title="Einstellungen" />

      {showInstallHint ? <InstallHint /> : null}

      {/* ---------- Bild-KI ---------- */}
      <View style={styles.section}>
        <SectionHeader title="Bild-KI" />
        <Card style={styles.cardGap}>
          <View style={styles.rowBetween}>
            <AppText variant="heading">Analyse auf dem Gerät</AppText>
            <StatusPill status="planned" label="Phase 4" />
          </View>
          <AppText variant="callout" tone="secondary">
            Die Bildanalyse läuft direkt auf deinem Handy. Dein Foto verlässt das Gerät nicht, es gibt kein Konto und
            keine Kosten. Beim ersten Mal wird das KI-Modell einmalig geladen.
          </AppText>
        </Card>
      </View>

      {/* ---------- Lokale Daten ---------- */}
      <View style={styles.section}>
        <SectionHeader title="Lokale Daten" />
        <Card padded={false}>
          <ListRow
            icon="database"
            title="Lokaler Speicher"
            subtitle={describeStorage(storage)}
            trailing={<StoragePill storage={storage} />}
          />
          <View style={styles.divider} />
          <ListRow icon="rotate-ccw" title="Musikprofil zurücksetzen" plannedPhase={3} />
          <View style={styles.divider} />
          <ListRow icon="trash-2" title="Alle Analysen löschen" plannedPhase={3} />
        </Card>
      </View>

      {/* ---------- Über ---------- */}
      <View style={styles.section}>
        <SectionHeader title="Über" />
        <Card padded={false}>
          <ListRow
            icon="info"
            title="STORYTUNE"
            trailing={
              <AppText variant="callout" tone="tertiary">
                Version {Constants.expoConfig?.version ?? '–'}
              </AppText>
            }
          />
          <View style={styles.divider} />
          <ListRow icon="shield" title="Datenschutz" subtitle="Fotos und Profil bleiben auf deinem Gerät." />
        </Card>
      </View>
    </Screen>
  );
}

function InstallHint() {
  const os = detectMobileOS();
  const steps =
    os === 'ios'
      ? 'In Safari unten auf „Teilen“ tippen und dann „Zum Home-Bildschirm“ wählen.'
      : os === 'android'
        ? 'In Chrome oben rechts auf ⋮ tippen und dann „App installieren“ oder „Zum Startbildschirm hinzufügen“ wählen.'
        : 'Öffne diese Seite auf deinem Handy und füge sie über das Browser-Menü zum Home-Bildschirm hinzu.';

  return (
    <Card style={[styles.cardGap, styles.installCard]}>
      <AppText variant="heading">Als App auf den Home-Bildschirm</AppText>
      <AppText variant="callout" tone="secondary">
        {steps} Dann startet STORYTUNE im Vollbild wie eine normale App, und deine Daten bleiben zuverlässiger
        gespeichert.
      </AppText>
    </Card>
  );
}

function describeStorage(s: StoreStatus | null): string {
  if (!s) return 'Wird geprüft …';
  if (s.state === 'error') return s.message;
  const { engine, persistent } = s.info;
  if (persistent === true) return `${engine} · dauerhaft gesichert`;
  if (persistent === false) return `${engine} · Browser darf bei Platzmangel löschen`;
  return engine;
}

function StoragePill({ storage }: { storage: StoreStatus | null }) {
  if (!storage) return <StatusPill status="checking" label="Prüfe …" />;
  if (storage.state === 'ready') return <StatusPill status="online" label="Bereit" />;
  return <StatusPill status="offline" label="Fehler" />;
}

const styles = StyleSheet.create({
  section: { gap: spacing.lg },
  cardGap: { gap: spacing.md },
  installCard: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 62 },
});
