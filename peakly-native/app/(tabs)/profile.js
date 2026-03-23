import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../src/constants/theme';
import { US_AIRPORTS } from '../../src/constants/data';
import { useAsyncStorage } from '../../src/hooks/useAsyncStorage';

export default function ProfileTab() {
  const [profile, setProfile] = useAsyncStorage('peakly_profile', {
    homeAirport: 'JFK',
    airports: ['JFK'],
    name: '',
  });

  const selectAirport = useCallback((code) => {
    setProfile(prev => ({
      ...prev,
      homeAirport: code,
      airports: [code],
    }));
  }, [setProfile]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>👤 Profile</Text>
        </View>

        {/* Home Airport */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Home Airport</Text>
          <Text style={styles.sectionSubtitle}>We'll find you the best flight deals from here</Text>
          <View style={styles.airportGrid}>
            {US_AIRPORTS.map(ap => {
              const selected = profile.homeAirport === ap.code || profile.airports?.[0] === ap.code;
              return (
                <TouchableOpacity
                  key={ap.code}
                  style={[styles.airportPill, selected && styles.airportSelected]}
                  onPress={() => selectAirport(ap.code)}
                >
                  <Text style={{ fontSize: 16 }}>{ap.flag}</Text>
                  <View>
                    <Text style={[styles.airportCode, selected && styles.airportCodeSelected]}>{ap.code}</Text>
                    <Text style={[styles.airportLabel, selected && styles.airportLabelSelected]}>{ap.label}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Do Not Sell My Info</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <Text style={[styles.menuText, { color: COLORS.scoreBad }]}>Delete My Account & Data</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.versionText}>Peakly v1.0.0</Text>
          <Text style={styles.versionText}>Made with ❤️ for adventurers</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 120 },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.lg },
  title: { fontSize: 24, fontFamily: FONTS.extraBold, color: COLORS.text },
  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.text, marginBottom: 4 },
  sectionSubtitle: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 },
  airportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  airportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  airportSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  airportCode: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.text },
  airportCodeSelected: { color: COLORS.primary },
  airportLabel: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textSecondary },
  airportLabelSelected: { color: COLORS.primary },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.text },
  menuArrow: { fontSize: 20, color: COLORS.textTertiary },
  versionText: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
});
