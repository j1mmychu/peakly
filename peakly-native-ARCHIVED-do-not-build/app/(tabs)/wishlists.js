import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { VENUES } from '../../src/constants/data';
import { useAsyncStorage } from '../../src/hooks/useAsyncStorage';
import { getFlightDeal } from '../../src/utils/api';
import ListingCard from '../../src/components/ListingCard';
import { useCallback } from 'react';

export default function WishlistsTab() {
  const [wishlists, setWishlists] = useAsyncStorage('peakly_wishlists', []);
  const [profile] = useAsyncStorage('peakly_profile', { homeAirport: 'JFK' });
  const homeAirport = profile?.airports?.[0] ?? profile?.homeAirport ?? 'JFK';

  const savedVenues = VENUES
    .filter(v => wishlists.includes(v.id))
    .map(v => ({
      ...v,
      flight: getFlightDeal(v.ap, homeAirport),
      conditionScore: 50,
      conditionLabel: 'Tap to check',
      period: '',
    }));

  const toggleWishlist = useCallback((id) => {
    setWishlists(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, [setWishlists]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>❤️ Wishlists</Text>
        <Text style={styles.subtitle}>{savedVenues.length} saved spots</Text>
      </View>
      <FlatList
        data={savedVenues}
        renderItem={({ item, index }) => (
          <ListingCard
            listing={item}
            wishlists={wishlists}
            onToggle={toggleWishlist}
            index={index}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>❤️</Text>
            <Text style={styles.emptyTitle}>No saved spots yet</Text>
            <Text style={styles.emptyText}>Tap the heart on any venue to save it here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.xs },
  title: { fontSize: 24, fontFamily: FONTS.extraBold, color: COLORS.text },
  subtitle: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginTop: 2 },
  list: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: 100 },
  empty: { padding: 60, alignItems: 'center', gap: 8 },
  emptyTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.text },
  emptyText: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});
