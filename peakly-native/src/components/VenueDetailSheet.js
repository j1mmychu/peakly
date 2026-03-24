import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet, Share } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, getScoreColor } from '../constants/theme';
import { buildFlightUrl, fetchWeather, fetchMarine } from '../utils/api';
import { scoreVenue } from '../utils/scoring';

// Format date for forecast display
function fmtDate(dateStr, i) {
  if (i === 0) return "Today";
  if (i === 1) return "Tmrw";
  try {
    return new Date(dateStr + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
  } catch { return dateStr?.slice(5) || ""; }
}

// Weather code to emoji
function weatherEmoji(code) {
  if (code <= 1) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 57) return "🌧️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  if (code <= 82) return "🌧️";
  if (code <= 86) return "🌨️";
  return "⛈️";
}

export default function VenueDetailSheet({ venue, onClose, wishlists = [], onToggle }) {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['94%'], []);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  const saved = wishlists.includes(venue?.id);
  const borderColor = getScoreColor(venue?.conditionScore ?? 50);

  // Fetch weather on mount
  useEffect(() => {
    if (!venue) return;
    (async () => {
      try {
        const [wx, marine] = await Promise.all([
          fetchWeather(venue.lat, venue.lon),
          venue.category === 'surfing' ? fetchMarine(venue.lat, venue.lon) : null,
        ]);
        const d = wx?.daily;
        const md = marine?.daily;
        if (d) {
          const fc = (d.time || []).slice(0, 7).map((date, i) => ({
            date,
            hi: d.temperature_2m_max?.[i] ?? "--",
            lo: d.temperature_2m_min?.[i] ?? "--",
            precip: d.precipitation_sum?.[i] ?? 0,
            wind: d.wind_speed_10m_max?.[i] ?? 0,
            code: d.weather_code?.[i] ?? 0,
            wave: md?.wave_height_max?.[i] ?? null,
          }));
          setForecast(fc);
        }
      } catch {}
      setLoading(false);
    })();
  }, [venue]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out ${venue.title} on Peakly!\nConditions: ${venue.conditionScore} · Flight from $${venue.flight?.price}\n\nFind your next adventure at peakly.app`,
      });
    } catch {}
  }, [venue]);

  if (!venue) return null;

  const bgColor = (() => {
    if (!venue.gradient) return '#333';
    const match = venue.gradient.match(/#[0-9a-fA-F]{6}/g);
    return match?.[1] ?? match?.[0] ?? '#333';
  })();

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ borderRadius: 28 }}
      handleIndicatorStyle={{ backgroundColor: '#ddd', width: 36 }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: bgColor }]}>
          <Text style={styles.heroIcon}>{venue.icon}</Text>
          <View style={styles.heroOverlay} />
          <View style={styles.heroTop}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={{ color: '#fff', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 7 }}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                <Text style={{ fontSize: 14 }}>📤</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => onToggle?.(venue.id)}>
                <Text style={{ fontSize: 14 }}>{saved ? "❤️" : "🤍"}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.heroBottom}>
            <Text style={styles.heroTitle}>{venue.title}</Text>
            <Text style={styles.heroLocation}>{venue.location}</Text>
          </View>
        </View>

        {/* Score Card */}
        <View style={[styles.scoreCard, { borderColor }]}>
          <View style={styles.scoreRow}>
            <View style={[styles.scoreDot, { backgroundColor: borderColor }]} />
            <Text style={styles.scoreNumber}>{venue.conditionScore ?? 50}</Text>
            <Text style={styles.scoreLabel}>{venue.conditionLabel}</Text>
          </View>
          {venue.period ? <Text style={styles.periodText}>{venue.period}</Text> : null}
        </View>

        {/* Flight Deal */}
        {venue.flight && (
          <TouchableOpacity
            style={styles.flightCard}
            onPress={() => Linking.openURL(buildFlightUrl(venue.flight.from, venue.ap))}
          >
            <View style={styles.flightInfo}>
              <Text style={{ fontSize: 20 }}>✈️</Text>
              <View>
                <Text style={styles.flightPrice}>${venue.flight.price}</Text>
                <Text style={styles.flightNormal}>
                  was ${venue.flight.normal} · {venue.flight.pct}% off
                </Text>
              </View>
            </View>
            <View style={styles.flightBtn}>
              <Text style={styles.flightBtnText}>Search Flights</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Affiliate Disclosure */}
        <Text style={styles.disclosure}>
          Peakly may earn a commission from bookings made through our links. This helps keep the app free.
        </Text>

        {/* 7-Day Forecast */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7-Day Forecast</Text>
          {loading ? (
            <Text style={styles.loadingText}>Loading forecast...</Text>
          ) : forecast.length === 0 ? (
            <Text style={styles.loadingText}>Forecast unavailable</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.forecastRow}>
                {forecast.map((day, i) => (
                  <View key={day.date} style={styles.forecastDay}>
                    <Text style={styles.forecastDayLabel}>{fmtDate(day.date, i)}</Text>
                    <Text style={{ fontSize: 22 }}>{weatherEmoji(day.code)}</Text>
                    <Text style={styles.forecastHi}>{Math.round(day.hi)}°</Text>
                    <Text style={styles.forecastLo}>{Math.round(day.lo)}°</Text>
                    {day.wind > 0 && (
                      <Text style={styles.forecastWind}>{Math.round(day.wind)}mph</Text>
                    )}
                    {day.wave !== null && (
                      <Text style={styles.forecastWave}>{day.wave.toFixed(1)}m</Text>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <View style={styles.tagsRow}>
            {venue.tags?.map(t => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  hero: {
    height: 190,
    marginHorizontal: SPACING.lg,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIcon: { fontSize: 88, opacity: 0.22 },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  heroTop: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeBtn: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBottom: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  heroTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.white,
  },
  heroLocation: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  scoreCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scoreNumber: {
    fontFamily: FONTS.extraBold,
    fontSize: 24,
    color: COLORS.text,
  },
  scoreLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  periodText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  flightCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.card,
  },
  flightInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flightPrice: { fontFamily: FONTS.extraBold, fontSize: 20, color: COLORS.text },
  flightNormal: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textSecondary },
  flightBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  flightBtnText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.white },
  disclosure: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.textTertiary,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  loadingText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  forecastRow: { flexDirection: 'row', gap: 4 },
  forecastDay: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    minWidth: 72,
    gap: 4,
  },
  forecastDayLabel: { fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.text },
  forecastHi: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.text },
  forecastLo: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textSecondary },
  forecastWind: { fontFamily: FONTS.regular, fontSize: 10, color: COLORS.textTertiary },
  forecastWave: { fontFamily: FONTS.semiBold, fontSize: 10, color: COLORS.primary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  tagText: { fontSize: 12, color: '#444', fontFamily: FONTS.semiBold },
});
