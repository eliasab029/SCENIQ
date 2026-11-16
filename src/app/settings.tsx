import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  Chip,
  ListRow,
  Screen,
  ScreenHeader,
  SectionHeader,
  StatusPill,
  TextField,
  type Status,
} from '@/components/ui';
import { getDatabaseStatus, type DatabaseStatus } from '@/data/database';
import { useSettings } from '@/data/settings';
import { checkOllamaConnection, type ConnectionCheck } from '@/features/analysis/providers/ollamaClient';
import { haptics } from '@/lib/haptics';
import { colors, spacing } from '@/theme';

export default function SettingsScreen() {
  const { settings, update } = useSettings();
  const [check, setCheck] = useState<ConnectionCheck | null>(null);
  const [checking, setChecking] = useState(false);
  const [db, setDb] = useState<DatabaseStatus | null>(null);

  useEffect(() => {
    getDatabaseStatus().then(setDb);
  }, []);

  const runCheck = async () => {
    setChecking(true);
    const result = await checkOllamaConnection(settings.ollamaUrl, settings.ollamaModel);
    setCheck(result);
    setChecking(false);
    if (result.ok) {
      haptics.success();
      // Store the normalized URL so the user sees what is actually used
      if (result.baseUrl !== settings.ollamaUrl) update({ ollamaUrl: result.baseUrl });
    } else {
      haptics.error();
    }
  };

  const ai = describeConnection(settings.ollamaUrl, checking, check);

  return (
    <Screen>
      <ScreenHeader title="Einstellungen" />

      {/* ---------- Bild-KI ---------- */}
      <View style={styles.section}>
        <SectionHeader title="Bild-KI · Ollama" />
        <Card style={styles.cardGap}>
          <View style={styles.rowBetween}>
            <AppText variant="heading">Verbindung</AppText>
            <StatusPill status={ai.status} label={ai.label} />
          </View>
          <AppText variant="callout" tone="secondary">
            Die Bildanalyse läuft lokal über Ollama auf deinem PC. Handy und PC müssen im selben WLAN sein.
          </AppText>

          <TextField
            label="Server-Adresse"
            placeholder="z. B. 192.168.178.20"
            value={settings.ollamaUrl}
            onChangeText={(t) => {
              update({ ollamaUrl: t });
              setCheck(null);
            }}
            keyboardType="url"
            hint="IP-Adresse deines PCs. Port 11434 wird automatisch ergänzt."
          />
          <TextField
            label="Bildmodell"
            placeholder="qwen3-vl:4b"
            value={settings.ollamaModel}
            onChangeText={(t) => {
              update({ ollamaModel: t });
              setCheck(null);
            }}
          />

          <Button
            label="Verbindung testen"
            icon="activity"
            variant="secondary"
            loading={checking}
            disabled={!settings.ollamaUrl.trim()}
            onPress={runCheck}
          />

          {check ? <ConnectionResult check={check} onPickModel={(m) => update({ ollamaModel: m })} /> : null}
        </Card>

      </View>

      {/* ---------- Lokale Daten ---------- */}
      <View style={styles.section}>
        <SectionHeader title="Lokale Daten" />
        <Card padded={false}>
          <ListRow icon="database" title="Lokale Datenbank" trailing={<DbPill db={db} />} />
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
          <ListRow icon="info" title="STORYTUNE" trailing={<AppText variant="callout" tone="tertiary">Version {Constants.expoConfig?.version ?? '–'}</AppText>} />
          <View style={styles.divider} />
          <ListRow icon="shield" title="Datenschutz" subtitle="Alle Daten bleiben auf deinem Gerät." />
        </Card>
      </View>
    </Screen>
  );
}

function describeConnection(
  url: string,
  checking: boolean,
  check: ConnectionCheck | null,
): { status: Status; label: string } {
  if (checking) return { status: 'checking', label: 'Prüfe …' };
  if (!url.trim()) return { status: 'idle', label: 'Nicht eingerichtet' };
  if (!check) return { status: 'idle', label: 'Nicht getestet' };
  if (!check.ok) return { status: 'offline', label: 'Nicht erreichbar' };
  if (!check.selectedModel.installed) return { status: 'checking', label: 'Modell fehlt' };
  if (check.selectedModel.supportsVision === false) return { status: 'checking', label: 'Kein Bildmodell' };
  return { status: 'online', label: 'Verbunden' };
}

function ConnectionResult({ check, onPickModel }: { check: ConnectionCheck; onPickModel: (m: string) => void }) {
  if (!check.ok) {
    return (
      <View style={styles.result}>
        <AppText variant="callout" tone="danger">
          {check.message}
        </AppText>
        <AppText variant="caption" tone="tertiary">
          Geprüft: {check.baseUrl}
        </AppText>
      </View>
    );
  }

  const { selectedModel: m } = check;
  return (
    <View style={styles.result}>
      <AppText variant="callout" tone="success">
        Ollama erreichbar{check.version ? ` · Version ${check.version}` : ''}
      </AppText>
      {m.installed ? (
        <AppText variant="callout" tone={m.supportsVision === false ? 'warning' : 'secondary'}>
          {m.supportsVision === true && `„${m.name}“ ist installiert und kann Bilder verarbeiten.`}
          {m.supportsVision === false && `„${m.name}“ ist installiert, kann aber keine Bilder verarbeiten.`}
          {m.supportsVision === null && `„${m.name}“ ist installiert (Bildfähigkeit nicht prüfbar).`}
        </AppText>
      ) : (
        <AppText variant="callout" tone="warning">
          „{m.name}“ ist nicht installiert. Auf dem PC ausführen: ollama pull {m.name}
        </AppText>
      )}
      {check.models.length > 0 ? (
        <>
          <AppText variant="caption" tone="tertiary">
            Installierte Modelle – tippen zum Auswählen:
          </AppText>
          <View style={styles.chips}>
            {check.models.map((model) => (
              <Chip
                key={model.name}
                label={model.name}
                selected={model.name === m.name}
                onPress={() => onPickModel(model.name)}
              />
            ))}
          </View>
        </>
      ) : (
        <AppText variant="caption" tone="tertiary">
          Noch keine Modelle installiert.
        </AppText>
      )}
    </View>
  );
}

function DbPill({ db }: { db: DatabaseStatus | null }) {
  if (!db) return <StatusPill status="checking" label="Prüfe …" />;
  if (db.state === 'ready') return <StatusPill status="online" label={`Bereit · v${db.schemaVersion}`} />;
  if (db.state === 'unsupported') return <StatusPill status="idle" label="Web-Vorschau" />;
  return <StatusPill status="offline" label="Fehler" />;
}

const styles = StyleSheet.create({
  section: { gap: spacing.lg },
  cardGap: { gap: spacing.lg },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  result: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 62 },
});
