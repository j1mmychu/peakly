import { useState, useEffect, useCallback, useRef } from 'react';
import { View, FlatList, Text, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { VENUES, CATEGORIES } from '../../src/constants/data';
import { fetchWeather, fetchMarine, getFlightDeal } from '../../src/utils/api';
import { scoreVenue } from '../../src/utils/scoring';
import { useAsyncStorage } from '../../src/hooks/useAsyncStorage';
import ListingCard from '../../src/components/ListingCard';
import CategoryPills from '../../src/components/CategoryPills';
import VenueDetailSheet from '../../src/components/VenueDetailSheet';

export default function ExploreTab() {
  const [category, setCategory] = useState('all');
  const [wishlists, setWishlists] = useAsyncStorage('peakly_wishlists', []);
  const [profile] = useAsyncStorage('peakly_profile', { homeAirport: 'JFK' });
  const [venues, setVenues] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const weatherCache = useRef({});

  const homeAirport = profile?.airports?.[0] ?? profile?.homeAirport ?? 'JFK';

  // Enrich venues with weather scores and flight data
  const loadVenues = useCallback(async () => {
    const filtered = category === 'all'
      ? VENUES
      : VENUES.filter(v => v.category === category);

    // Add flight deals immediately
    const withFlights = filtered.map(v => ({
      ...v,
      flight: getFlightDeal(v.ap, homeAirport),
      conditionScore: 50,
      conditionLabel: 'Loading...',
      period: 'Checking conditions...',
    }));
    setVenues(withFlights);

    // Fetch weather in batches of 10
    const batchSize = 10;
    for (let i = 0; i < withFlights.length; i += batchSize) {
      const batch = withFlights.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(async (v) => {
          const cacheKey = `${v.lat},${v.lon}`;
          if (weatherCache.current[cacheKey]) return weatherCache.current[cacheKey];

          const [wx, marine] = await Promise.all([
            fetchWeather(v.lat, v.lon).catch(() => null),
            v.category === 'surfing' ? fetchMarine(v.lat, v.lon).catch(() => null) : null,
          ]);
          weatherCache.current[cacheKey] = { wx, marine };
          return { wx, marine };
        })
      );

      setVenues(prev => {
        const updated = [...prev];
        batch.forEach((v, idx) => {
          const globalIdx = updated.findIndex(u => u.id === v.id);
          if (globalIdx === -1) return;
          const result = results[idx];
          if (result.status === 'fulfilled' && result.value?.wx) {
            const { wx, marine } = result.value;
            const scored = scoreVenue(v, wx, marine);
            updated[globalIdx] = {
              ...updated[globalIdx],
              conditionScore: scored.score,
              conditionLabel: scored.label,
              period: scored.period,
            };
          }
        });
        // Sort by score descending
        return updated.sort((a, b) => (b.conditionScore ?? 0) - (a.conditionScore ?? 0));
      });
    }
  }, [category, homeAirport]);

  useEffect(() => { loadVenues(); }, [loadVenues]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    weatherCache.current = {};
    await loadVenues();
    setRefreshing(false);
  }, [loadVenues]);

  const toggleWishlist = useCallback((id) => {
    setWishlists(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, [setWishlists]);

  const renderItem = useCallback(({ item, index }) => (
    <ListingCard
      listing={item}
      wishlists={wishlists}
      onToggle={toggleWishlist}
      onOpen={(venue) => setSelectedVenue(venue)}
      index={index}
    />
  ), [wishlists, toggleWishlist]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>⛰️ Peakly</Text>
        <Text style={styles.subtitle}>Find your next adventure</Text>
      </View>

      {/* Category Pills */}
      <CategoryPills selected={category} onSelect={setCategory} />

      {/* Venue List */}
      <FlatList
        data={venues}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Loading venues...</Text>
          </View>
        }
      />

      {/* Venue Detail Bottom Sheet */}
      {selectedVenue && (
        <VenueDetailSheet
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
          wishlists={wishlists}
          onToggle={toggleWishlist}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  logo: {
    fontSize: 24,
    fontFamily: FONTS.extraBold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: 100,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
