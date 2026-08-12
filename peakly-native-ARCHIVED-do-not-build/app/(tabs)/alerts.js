import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../src/constants/theme';
import { VENUES } from '../../src/constants/data';
import { useAsyncStorage } from '../../src/hooks/useAsyncStorage';

export default function AlertsTab() {
  const [alerts, setAlerts] = useAsyncStorage('peakly_alerts', []);
  const [wishlists] = useAsyncStorage('peakly_wishlists', []);

  const toggleAlert = useCallback((venueId) => {
    setAlerts(prev => {
      const existing = prev.find(a => a.venueId === venueId);
      if (existing) {
        return prev.map(a => a.venueId === venueId ? { ...a, active: !a.active } : a);
      }
      return [...prev, { venueId, active: true, threshold: 80, createdAt: new Date().toISOString() }];
    });
  }, [setAlerts]);

  const removeAlert = useCallback((venueId) => {
    setAlerts(prev => prev.filter(a => a.venueId !== venueId));
  }, [setAlerts]);

  // Suggest alerts for wishlisted venues that don't have one
  const suggestedVenues = VENUES.filter(v =>
    wishlists.includes(v.id) && !alerts.find(a => a.venueId === v.id)
  ).slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>🔔 Alerts</Text>
        <Text style={styles.subtitle}>Get notified when conditions are perfect</Text>
      </View>

      <FlatList
        data={alerts}
        keyExtractor={item => item.venueId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const venue = VENUES.find(v => v.id === item.venueId);
          if (!venue) return null;
          return (
            <View style={styles.alertCard}>
              <View style={styles.alertInfo}>
                <Text style={{ fontSize: 24 }}>{venue.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertTitle}>{venue.title}</Text>
                  <Text style={styles.alertLocation}>{venue.location}</Text>
                  <Text style={styles.alertThreshold}>Alert when score ≥ {item.threshold}</Text>
                </View>
              </View>
              <View style={styles.alertActions}>
                <Switch
                  value={item.active}
                  onValueChange={() => toggleAlert(item.venueId)}
                  trackColor={{ true: COLORS.primary }}
                />
                <TouchableOpacity onPress={() => removeAlert(item.venueId)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListHeaderComponent={
          alerts.length > 0 ? (
            <Text style={styles.sectionTitle}>{alerts.length} Active Alerts</Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>🔔</Text>
            <Text style={styles.emptyTitle}>No alerts yet</Text>
            <Text style={styles.emptyText}>
              Set alerts for your favorite spots to get notified when conditions are perfect
            </Text>
          </View>
        }
        ListFooterComponent={
          suggestedVenues.length > 0 ? (
            <View style={{ marginTop: 24 }}>
              <Text style={styles.sectionTitle}>Suggested Alerts</Text>
              {suggestedVenues.map(v => (
                <TouchableOpacity
                  key={v.id}
                  style={styles.suggestCard}
                  onPress={() => toggleAlert(v.id)}
                >
                  <Text style={{ fontSize: 20 }}>{v.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertTitle}>{v.title}</Text>
                    <Text style={styles.alertLocation}>{v.location}</Text>
                  </View>
                  <View style={styles.addBtn}>
                    <Text style={styles.addText}>+ Add</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : null
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
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.text, marginBottom: 12 },
  alertCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  alertInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  alertTitle: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.text },
  alertLocation: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textSecondary },
  alertThreshold: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.primary, marginTop: 2 },
  alertActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  removeText: { fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.scoreBad },
  suggestCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addBtn: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.primary },
  empty: { padding: 60, alignItems: 'center', gap: 8 },
  emptyTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.text },
  emptyText: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});
