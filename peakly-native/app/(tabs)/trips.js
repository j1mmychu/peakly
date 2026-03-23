import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../../src/constants/theme';

export default function TripsTab() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Trips</Text>
        <Text style={styles.subtitle}>Plan your next adventure</Text>
      </View>
      <View style={styles.empty}>
        <Text style={{ fontSize: 48 }}>🗺️</Text>
        <Text style={styles.emptyTitle}>Trip Planner</Text>
        <Text style={styles.emptyText}>
          AI-powered trip planning coming soon. Describe your ideal trip and we'll build the perfect itinerary.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.xs },
  title: { fontSize: 24, fontFamily: FONTS.extraBold, color: COLORS.text },
  subtitle: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, padding: 40 },
  emptyTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.text },
  emptyText: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});
