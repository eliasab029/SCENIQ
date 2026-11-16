import { router } from 'expo-router';

import { AppText, EmptyState, Screen } from '@/components/ui';

export default function HistoryScreen() {
  return (
    <Screen withTabBar>
      <AppText variant="display">Verlauf</AppText>
      <EmptyState
        icon="clock"
        title="Noch keine Analysen"
        message="Jede Analyse wird hier gespeichert – mit Foto, Stimmung und Empfehlungen."
        actionLabel="Erstes Foto analysieren"
        onAction={() => router.push('/upload')}
      />
    </Screen>
  );
}
