import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING, getScoreColor } from '../constants/theme';
import { buildFlightUrl } from '../utils/api';

// Parse CSS gradient to get the middle color for RN background
function gradientToColor(gradient) {
  if (!gradient) return '#333';
  const match = gradient.match(/#[0-9a-fA-F]{6}/g);
  return match?.[1] ?? match?.[0] ?? '#333';
}

export default function ListingCard({ listing, wishlists = [], onToggle, onOpen, index = 0 }) {
  const saved = wishlists.includes(listing.id);
  const borderColor = getScoreColor(listing.conditionScore ?? 50);
  const bgColor = gradientToColor(listing.gradient);

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onOpen?.(listing)}
        style={[styles.card, { borderColor }]}
      >
        {/* Image Area */}
        <View style={[styles.imageArea, { backgroundColor: bgColor }]}>
          <Text style={styles.iconEmoji}>{listing.icon}</Text>

          {/* Overlay gradient */}
          <View style={styles.gradientOverlay} />

          {/* Heart */}
          <TouchableOpacity
            onPress={() => onToggle?.(listing.id)}
            style={styles.heartBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ fontSize: 20 }}>{saved ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>

          {/* Flight deal badge */}
          {listing.flight && (
            <View style={styles.flightBadge}>
              <Text style={{ fontSize: 11 }}>✈️</Text>
              <Text style={styles.flightBadgeText}>{listing.flight.pct}% off</Text>
              {listing.flight.live && (
                <View style={styles.liveBadge}>
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
            </View>
          )}

          {/* Condition label */}
          {listing.conditionLabel && (
            <View style={styles.conditionContainer}>
              <View style={styles.conditionBadge}>
                <Text style={styles.conditionText}>{listing.conditionLabel}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
            <View style={styles.ratingRow}>
              <Text style={{ fontSize: 12 }}>⭐</Text>
              <Text style={styles.rating}>{listing.rating}</Text>
            </View>
          </View>
          <Text style={styles.location}>{listing.location}</Text>
          {listing.period && <Text style={styles.period}>{listing.period}</Text>}

          {/* Tags */}
          <View style={styles.tagsRow}>
            {listing.tags?.map(t => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>

          {/* Price + Book */}
          {listing.flight && (
            <View style={styles.priceRow}>
              <View style={styles.priceGroup}>
                <Text style={styles.price}>${listing.flight.price}</Text>
                <Text style={styles.priceStrike}>${listing.flight.normal}</Text>
              </View>
              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() => {
                  const url = buildFlightUrl(listing.flight.from, listing.ap);
                  Linking.openURL(url);
                }}
              >
                <Text style={{ fontSize: 10 }}>✈️</Text>
                <Text style={styles.bookText}>Book</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  imageArea: {
    height: 220,
    overflow: 'hidden',
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 72,
    opacity: 0.22,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '52%',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  flightBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...SHADOWS.card,
  },
  flightBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.extraBold,
    color: COLORS.primary,
  },
  liveBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 1,
  },
  liveText: {
    fontSize: 9,
    fontFamily: FONTS.extraBold,
    color: '#16a34a',
  },
  conditionContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  conditionBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'flex-start',
  },
  conditionText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  body: {
    padding: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#222',
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 8,
  },
  rating: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: '#222',
  },
  location: {
    color: '#717171',
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  period: {
    color: '#717171',
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#444',
    fontFamily: FONTS.semiBold,
  },
  priceRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  price: {
    fontSize: 14,
    fontFamily: FONTS.extraBold,
    color: '#222',
  },
  priceStrike: {
    fontSize: 12,
    color: '#b0b0b0',
    fontFamily: FONTS.regular,
    textDecorationLine: 'line-through',
  },
  bookBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookText: {
    fontSize: 10,
    fontFamily: FONTS.extraBold,
    color: COLORS.white,
  },
});
