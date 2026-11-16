import { AppText, EmptyState, Screen } from '@/components/ui';

export default function FavoritesScreen() {
  return (
    <Screen withTabBar>
      <AppText variant="display">Favoriten</AppText>
      <EmptyState
        icon="heart"
        title="Noch keine Favoriten"
        message="Markiere Songs in deinen Empfehlungen mit dem Herz, um sie hier zu sammeln."
      />
    </Screen>
  );
}
