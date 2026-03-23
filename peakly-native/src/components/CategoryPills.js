import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { CATEGORIES } from '../constants/data';

export default function CategoryPills({ selected, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map(cat => {
        const active = selected === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.8}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={{ fontSize: 14 }}>{cat.emoji}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{cat.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
    paddingVertical: SPACING.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: 13,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  labelActive: {
    color: COLORS.white,
  },
});
