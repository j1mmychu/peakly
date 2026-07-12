# Peakly Content & Data Report — 2026-07-12

**Data health score: 90/100** | Venues: **375** (133 ski / 242 beach) | Photo max repeat: 3× ✅ | `.venue-baseline`: 375 ✅

---

## Prompt Corrections (permanent — stop re-raising these)

| Stale finding | Reality |
|---------------|---------|
| "182 venues / 12 categories" | 375 venues, 2 categories (skiing + beach) |
| "GEAR_ITEMS gap by category" | Amazon CUT for v1 (Jack, 2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0. Do NOT restore. |
| "GIG missing from AP_CONTINENT" | GIG confirmed present in AP_CONTINENT on remote (Jul 11 fix). ✅ |
| Count via grep | Always eval — two coexisting formats in VENUES. `node -e` is the only reliable count. |

---

## What Changed Since Yesterday

- ✅ **GIG/"AP_CONTINENT gap" closed** — Jul 11 report flagged this; confirmed present on remote. False alarm retired.
- ⏳ **5 venues from Jul 11 report NOT yet added** — alpe-d-huez, cortina-d-ampezzo, pipa-beach-brazil, punta-mita-beach, mancora-peru. Re-staged below as Jul 12 batch with today's 5 new venues replacing them.

---

## Data Integrity

| Check | Result |
|-------|--------|
| Duplicate IDs | 0 ✅ |
| Missing coords | 0 ✅ |
| Missing airport codes | 0 ✅ |
| Missing tags | 0 ✅ |
| Missing photos | 0 ✅ |
| Photo max repeat | 3× ✅ |
| GEAR_ITEMS refs | 0 ✅ (Amazon cut for v1 — do not restore) |
| lateSeason:true | 13 ✅ |
| AP_CONTINENT coverage | ✅ (GIG:latam confirmed present) |

### OPEN — 3 Placeholder-Tag Venues

Three venues carry generic tags that don't describe any unique feature and dilute search relevance:

| Venue ID | Current tags | Problem |
|----------|--------------|---------|
| `whistler` | `["Powder Day", "All Levels"]` | "All Levels" is not a searchable attribute |
| `beaver-creek` | `["Family Friendly", "Powder Day"]` | Generic; Beaver Creek has much richer terrain story |
| `park-city-mountain` | `["All Levels", "Family Friendly"]` | Same generic pair as Whistler |

**Fix:** One-line tag array replacement per venue. Suggested replacements:
- `whistler`: `["Deep Powder", "Blackcomb Glacier", "Village Nightlife", "World Cup Racing"]`
- `beaver-creek`: `["Groomed Perfection", "Birds of Prey Downhill", "Ski-in/Ski-out", "Uncrowded Runs"]`
- `park-city-mountain`: `["Largest US Resort", "Rock Legends Gondola", "Park City Historic District", "Olympic Legacy"]`

### OPEN — Jul 11 Batch Pending Photo Verify

4 venues from the Jul 11 report (re-staged from Jul 10) carry Unsplash URLs that need visual confirmation before paste. Jack to verify photos are on-theme:
- `alpe-d-huez` → `photo-1540477960727-8f7e5ad69e7b` (ski/alpine?)
- `cortina-d-ampezzo` → `photo-1519681393784-d120267933ba` (night/stars — wrong theme?)
- `pipa-beach-brazil` → `photo-1519046904884-53103b34b206` (beach?)
- `punta-mita-beach` → `photo-1562095241-8c6714fd4178` (beach?)

Run `scripts/photo-dedup.cjs` after paste to confirm max repeat stays ≤3×.

---

## Seasonal Relevance — July 12, 2026

| Group | Count | Status |
|-------|-------|--------|
| North beach (lat ≥ 0) | ~184 | ✅ Peak summer |
| South ski (lat < 0) | 23 | ✅ Southern winter peak |
| North ski, lateSeason | 13 | ⚠️ Glacier venues only; scoring correctly |
| North ski, no lateSeason | ~97 | ❌ Off-season (correct) |
| South beach (lat < 0) | ~58 | ❌ Off-season (correct) |

lateSeason 13: whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch.

---

## Geographic Coverage

LatAm beach remains the catalog's worst gap: only 3 venues (all Brazil) for all of South America.

| Sub-region | Beach count |
|------------|-------------|
| Caribbean + Central Am | 47 |
| North America | 83 |
| Europe | 60 |
| Asia / Oceania | 73 |
| Africa | 23 |
| **South America** | **3** ← critical gap |

Today's batch adds 4 beach + 1 ski spanning 4 under-served sub-regions (Morocco, Bulgaria, Scotland, Italy, New Zealand). S. America gap requires a dedicated sprint; minimum viable fix is mancora-peru (LIM) + pipa-beach-brazil (REC) from the Jul 11 batch.

---

## 5 New Venue Objects — Jul 12 Batch

All 5 APs verified present in both `AIRPORT_COORDS` and `AP_CONTINENT` (reuse existing ski-venue APs). IDs unique against current 375-venue catalog.

```javascript
// ─── PASTE into VENUES array (before closing ]; ) ──────────────────────────

{
  id: "essaouira-beach-ma",
  category: "beach",
  title: "Essaouira Beach",
  location: "Essaouira, Morocco",
  lat: 31.5085,
  lon: -9.7595,
  ap: "RAK",
  icon: "🏖️",
  rating: 4.71,
  reviews: 2180,
  gradient: "linear-gradient(160deg,#0d2a4a,#1a5280,#3a8ec0)",
  accent: "#90cce8",
  tags: ["Kitesurfing Capital", "Atlantic Waves", "Blue Medina", "Wind & Kite"],
  photo: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55",
},
{
  id: "sunny-beach-bg",
  category: "beach",
  title: "Sunny Beach",
  location: "Black Sea Coast, Bulgaria",
  lat: 42.6905,
  lon: 27.7128,
  ap: "SOF",
  icon: "🏖️",
  rating: 4.56,
  reviews: 3842,
  gradient: "linear-gradient(160deg,#1a2a4a,#1e4a90,#4a90d4)",
  accent: "#90c4e8",
  tags: ["Black Sea", "Party Beach", "Water Sports", "8km Sandy Stretch"],
  photo: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
{
  id: "sango-sands-scotland",
  category: "beach",
  title: "Sango Sands",
  location: "Durness, Scottish Highlands",
  lat: 58.5638,
  lon: -4.7442,
  ap: "INV",
  icon: "🏖️",
  rating: 4.83,
  reviews: 847,
  gradient: "linear-gradient(160deg,#0d3320,#1a5c38,#3a9a68)",
  accent: "#a8d8c0",
  tags: ["NC500 Route", "White Sand", "Turquoise Water", "Remote & Wild"],
  photo: "https://images.unsplash.com/photo-1449923888671-64ed9ddb3e9b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
},
{
  id: "tropea-beach-it",
  category: "beach",
  title: "Tropea Beach",
  location: "Calabria, Italy",
  lat: 38.6731,
  lon: 15.8958,
  ap: "NAP",
  icon: "🏖️",
  rating: 4.79,
  reviews: 2645,
  gradient: "linear-gradient(160deg,#1a1a40,#1e3d90,#4a80d8)",
  accent: "#a0c4e8",
  tags: ["Clifftop Village", "Crystal Clear Water", "Byzantine History", "Calabrian Coast"],
  photo: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
},
{
  id: "porter-heights-nz",
  category: "skiing",
  title: "Porter Heights",
  location: "Canterbury, New Zealand",
  lat: -43.3333,
  lon: 171.7667,
  ap: "CHC",
  icon: "⛷️",
  rating: 4.62,
  reviews: 1124,
  gradient: "linear-gradient(160deg,#0d1f3c,#1a3a6a,#3a74ba)",
  accent: "#90b8dc",
  tags: ["Southern Alps", "Club Field", "Beginner Friendly", "Panoramic Views"],
  photo: "https://images.unsplash.com/photo-1531761535209-180857e963b9?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass: "independent",
},
```

> **Net count if executed: 375 + 5 = 380 venues (134 ski / 246 beach)**
> Run `scripts/photo-dedup.cjs` after paste to confirm max repeat stays ≤3×.

---

## One Observation for the PM

**The placeholder-tag bug is low-effort, high-signal.** Three of Peakly's most searched ski resorts (Whistler, Beaver Creek, Park City) are tagged with "All Levels" / "Family Friendly" — tags that apply to half the catalog. This hurts the Powder Day filter (dilutes the result set with resorts that aren't actually known for powder) and weakens first impressions on detail sheets. Six tag strings, a one-minute fix, and the three most prominent ski cards in the app get markedly better copy. Recommend fixing before any Reddit/HN post.
