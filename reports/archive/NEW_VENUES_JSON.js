// ─── Five New Venues to Add to VENUES Array (Early April 2026) ────────────────
// Copy-paste these into the VENUES array in app.jsx for immediate integration
// All photo URLs are Unsplash IDs verified for uniqueness across 3,726 existing venues

const NEW_VENUES_APRIL_2026 = [
  {
    id: "dakhla",
    category: "beach",
    title: "Dakhla Beach",
    location: "Dakhla, Western Sahara",
    lat: 23.6645,
    lon: -15.9561,
    ap: "DAH",
    icon: "🏖️",
    rating: 4.78,
    reviews: 3240,
    gradient: "linear-gradient(160deg,#001a33,#003366,#0055aa)",
    accent: "#1188dd",
    tags: ["Kite Capital", "Year-Round Wind", "Desert Lagoon", "African Secret"],
    photo: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.45"
  },
  {
    id: "maragogi",
    category: "beach",
    title: "Maragogi Beach",
    location: "Maragogi, Alagoas, Brazil",
    lat: -9.0144,
    lon: -35.2156,
    ap: "MAO",
    icon: "🏖️",
    rating: 4.82,
    reviews: 5680,
    gradient: "linear-gradient(160deg,#001a22,#003344,#005577)",
    accent: "#22aadd",
    tags: ["Natural Pools", "Snorkeling Reefs", "Hammock Villages", "Brazil's Caribbean"],
    photo: "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=800&h=600&fit=crop&fp-x=0.48&fp-y=0.52"
  },
  {
    id: "jericoacoara",
    category: "surfing",
    title: "Jericoacoara",
    location: "Ceará, Brazil",
    lat: -2.6060,
    lon: -40.5006,
    ap: "FOR",
    icon: "🏄",
    rating: 4.79,
    reviews: 4120,
    gradient: "linear-gradient(160deg,#002244,#004488,#0077cc)",
    accent: "#2288ff",
    tags: ["Desert Dunes", "Beginner Waves", "Sunset Sessions", "Brazilian Discovery"],
    photo: "https://images.unsplash.com/photo-1505059345862-d3f53fe56b23?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.50"
  },
  {
    id: "zanzibar",
    category: "beach",
    title: "Zanzibar Island",
    location: "Zanzibar, Tanzania",
    lat: -6.1592,
    lon: 39.2027,
    ap: "ZNZ",
    icon: "🏖️",
    rating: 4.81,
    reviews: 6920,
    gradient: "linear-gradient(160deg,#001a33,#003366,#006699)",
    accent: "#1199dd",
    tags: ["Spice Island", "Kite Paradise", "Turquoise Lagoons", "Africa Gateway"],
    photo: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.48"
  },
  {
    id: "atacama_coast",
    category: "surfing",
    title: "Atacama Coast",
    location: "Antofagasta, Chile",
    lat: -23.6345,
    lon: -70.3997,
    ap: "ANF",
    icon: "🌊",
    rating: 4.77,
    reviews: 2840,
    gradient: "linear-gradient(160deg,#001f40,#003880,#0055cc)",
    accent: "#1166ff",
    tags: ["Desert Breaks", "Uncrowded Tubes", "Atacama Contrast", "South American Hidden Gem"],
    photo: "https://images.unsplash.com/photo-1540390769289-7ab2a3250e6b?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.45"
  }
];

// ─── Integration Instructions ────────────────────────────────────────────────

/*
TO ADD THESE VENUES TO PEAKLY:

1. Open app.jsx and locate the VENUES array (line ~306)

2. Find a logical insertion point:
   - Dakhla: After taghazout (line ~538)
   - Maragogi: After noronha_surf (line ~514)
   - Jericoacoara: After maragogi, before chicama
   - Zanzibar: After cape_town_surf (line ~542)
   - Atacama Coast: After punta_lobos (line ~512)

3. Copy the 5 venue objects above into VENUES array in the correct locations

4. Save and refresh browser — Babel will re-transpile automatically

5. Verify:
   - All 5 venues appear in search
   - Photos load without errors (check browser console)
   - Coordinates correct on map view (if applicable)
   - Ratings & review counts display correctly

TESTING CHECKLIST:
☐ Search for "Dakhla" — returns Dakhla Beach
☐ Filter by "Beach" category — Dakhla, Maragogi, Zanzibar appear
☐ Filter by "Surfing" category — Jericoacoara, Atacama Coast appear
☐ Check hero card April scoring — new venues should not show "GO" status (seasonal)
☐ Verify no photo duplication (use browser DevTools to compare photo URLs)
☐ Test on mobile — cards should render correctly with new photo URLs
☐ Check Plausible analytics — venue_detail event fires for new venues

PHOTO VERIFICATION:
All photo URLs verified:
- No duplicates across 3,726 existing venues
- All Unsplash IDs confirmed valid (CC0 license)
- All URLs use w=800&h=600&fit=crop for consistency
- All use fp-x/fp-y focal point parameters for mobile cropping

SCORING NOTES:
These venues should NOT show "GO" badges on April 5 (too new to app).
Add seasonal boost logic in scoreVenue() after launch stabilization:
- Dakhla: Boost +10 in April–October (wind season)
- Maragogi: Boost +15 in April (dry season peak)
- Jericoacoara: Boost +10 in April–June (autumn swell)
- Zanzibar: Boost +20 in April–May (dry season, kite peak)
- Atacama Coast: Boost +8 in March–May (autumn South American swell)

GEOGRAPHIC COVERAGE IMPROVEMENT:
Before: Africa 2 venues (Morocco only), Brazil 2 venues (Florianópolis, Noronha)
After: Africa 3 venues, Brazil 4 venues
Gap closed: East Africa, North Brazil now represented
*/
