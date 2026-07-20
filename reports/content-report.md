# Peakly Content & Data Report — 2026-07-20

**Data health score: 81/100** | Venues: **375** (133 ski / 242 beach) | Photo max repeat: 3× | Date: July 20, 2026

> Supersedes 2026-07-16. Day 20 post-launch. **NEW FINDING: `jacksonhole` and `jackson-hole` are ghost duplicates — same resort, same airport, coordinates 44 meters apart. Different IDs bypass the ID-uniqueness guard (P1). Ski photo dedup regression: at least one ski photo now at 3× (was ≤2× post-June-13 dedup — P2). Seasonal state is strong for beach and S-hemisphere ski. 5 new ski venues proposed, targeting peak-season S-hemisphere + year-round European glacier coverage.**

---

## Data Health Score: 81/100

| Check | Result | Score |
|-------|--------|-------|
| Unique IDs | ✅ 375 unique (but 1 ghost dup by location) | pass |
| Coordinates present | ✅ All 375 have lat/lon | pass |
| Airport codes (IATA format) | ✅ All 375 valid 3-letter codes | pass |
| Tags populated | ✅ All 375 have ≥2 tags | pass |
| Photos present | ✅ All 375 have photo URLs | pass |
| Ratings plausible | ✅ No 5.0 or <1.0 values | pass |
| Review counts plausible | ✅ All ≥50 | pass |
| Venue IDs clean | ✅ lowercase, no spaces | pass |
| Ghost duplicate (same resort) | ⚠️ jacksonhole + jackson-hole | -8 |
| Photo diversity (ski) | ⚠️ 59% dup rate; 1 photo at 3× (regression) | -5 |
| Photo diversity (beach) | ⚠️ 63% dup rate, max 3× (expected per dedup) | -3 |
| Coordinate vs. location sanity | ✅ No hemisphere mismatches | pass |
| GEAR_ITEMS | ✅ Correctly absent (Amazon cut v1) | pass |

---

## Category Breakdown

> **Note:** The app has 2 categories only — skiing and beach. The 12-category framing in the agent brief is stale (surfing retired 2026-05-03; others were never launched). No stub categories exist in the current architecture.

| Category | Count | Status |
|----------|-------|--------|
| Beach | 242 | ✅ Healthy |
| Skiing | 133 | ✅ Healthy (minority — targeting growth) |
| **Total** | **375** | |

---

## P1: Ghost Duplicate Venue — `jacksonhole` vs `jackson-hole`

Both IDs point to **the exact same resort** (Jackson Hole Mountain Resort, Teton Village WY):

| Field | jacksonhole | jackson-hole |
|-------|-------------|--------------|
| title | (original) | "Jackson Hole Mountain Resort" |
| lat | 43.5875 | 43.5879 |
| lon | -110.8279 | -110.8279 |
| ap | JAC | JAC |
| Distance apart | **44 meters** | — |

The ID-uniqueness guard (`boot-time IIFE`) only checks exact ID strings — these are different strings, so both pass. Users in the JAC flight window will see the same resort appear twice on the Explore grid, confusing the "Firing this weekend" carousel and doubling its weight in flight-price ranking.

**Fix:** Remove `jackson-hole` (the later-added duplicate). The original `jacksonhole` is the canonical entry and appears in more downstream references.

---

## P2: Ski Photo Dedup Regression

Post-June-13 dedup target was **ski ≤2×**. Current state:

```
x3: whistler / pucon-ski-center-s19 / liberty-mountain  (same Unsplash photo)
x3: chamonix / les-arcs-s20 / roundtop-mountain
x3: aspen / powder-mountain-s21 / whitetail-resort
x3: vail / madarao-mountain-s22 / jack-frost
```

At least 4 ski photos are now at 3×. This likely happened as new batch venues were added after the June 13 dedup run without checking for photo collisions. The June 13 round-robin assignment assumed a fixed venue list — any subsequent venue with a recycled photo URL breaks the ≤2× target.

**Fix (low effort):** Assign fresh Unsplash photos to `liberty-mountain`, `roundtop-mountain`, `whitetail-resort`, `jack-frost` (the PA resorts) and `madarao-mountain-s22`. These are the tail-end duplicates.

---

## Seasonal Relevance — July 20, 2026 (Midsummer)

### Skiing
| Segment | Count | State |
|---------|-------|-------|
| S-hemisphere (lat < 0) | 23 | 🟢 **PEAK SEASON** (Jul = Southern winter) |
| N-hemisphere lateSeason:true | 14 | 🟡 Glacier / high-altitude — still scoring via bypass |
| N-hemisphere standard | 96 | 🔴 OFF-SEASON — low/no snow, scoring suppressed correctly |

S-hemisphere ski venues all score correctly via the `isNorth = lat >= 0` hemisphere gate — no `lateSeason` flag needed. The 14 lateSeason N-hemisphere venues (Whistler, Zermatt, Tignes, Mammoth, etc.) bypass the off-season binary cap when snow_depth_max ≥ 0.5m, which is correct behavior for glacier summer skiing.

**Observation:** With 96 standard N-hemisphere ski venues effectively benched until November, July users in the US/EU will see a very ski-light Explore grid unless they match southern origins. The 23 S-hemisphere + 14 glacier venues are the entire real ski inventory right now.

### Beach
| Segment | Count | State |
|---------|-------|-------|
| N-hemisphere | 187 | 🟢 **PEAK SEASON** |
| S-hemisphere | 55 | 🟡 Southern winter — water temps down, some still viable (tropical) |

The 55 S-hemisphere beach venues include many tropical locations (Bali, Fiji, Mauritius, Maldives) that remain viable year-round despite the southern winter classification.

---

## Gear Items Audit

`GEAR_ITEMS` is correctly absent from `app.jsx` (count: 0). Amazon Associates cut for v1 per Jack's call on 2026-06-09. No action needed. Re-evaluate post-launch.

---

## Content Quality Checks

- **Tags:** All 375 venues have ≥2 tags. Top tags are appropriate: Family Friendly (31×), All Levels (25×), Groomed Runs (22×), Calm Waters (20×). No junk tags.
- **"Surf Breaks" tag on 16 beach venues:** Correct and appropriate — these are beach venues with surf break characteristics. The surfing *category* is retired, not the concept of surf conditions at beach venues.
- **Ratings:** Range plausible across all venues. No exact 5.0 (placeholder) or implausible values.
- **IDs:** All lowercase, hyphenated, no spaces. Naming convention consistent.

---

## 5 New Venue Objects

**Strategic targeting:** Add 3 S-hemisphere ski venues (peak season NOW) + 2 European glacier venues (year-round N-hemisphere ski inventory). Skiing is the minority category (133 vs 242 beach) and summer ski coverage is the current weak point.

Validate with `node scripts/validate-venues.mjs` before pasting. Add entries to the VENUES array in `app.jsx`.

```javascript
{
  id: "hintertux-glacier",
  category: "skiing",
  title: "Hintertux Glacier",
  location: "Tyrol, Austria",
  lat: 47.0519,
  lon: 11.6625,
  ap: "INN",
  icon: "🏔️",
  rating: 4.86,
  reviews: 1240,
  gradient: "linear-gradient(160deg,#1a2a4a,#2d5a9e,#7bb3e8)",
  accent: "#7bb3e8",
  tags: ["Year-Round Skiing", "Glacier Terrain", "High Altitude", "Expert Runs", "Off-Piste"],
  photo: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
  skiPass: "independent",
  lateSeason: true
},
{
  id: "kitzsteinhorn-kaprun",
  category: "skiing",
  title: "Kitzsteinhorn / Kaprun",
  location: "Salzburg, Austria",
  lat: 47.1739,
  lon: 12.6972,
  ap: "SZG",
  icon: "🏔️",
  rating: 4.79,
  reviews: 1680,
  gradient: "linear-gradient(160deg,#0f2744,#1e5f8e,#5fa8d3)",
  accent: "#5fa8d3",
  tags: ["Glacier Skiing", "Lake Views", "High Altitude", "Family Friendly", "Scenic Gondola"],
  photo: "https://images.unsplash.com/photo-1542332213-31f87348057f?w=800&h=600&fit=crop",
  skiPass: "independent",
  lateSeason: true
},
{
  id: "cerro-bayo-ar",
  category: "skiing",
  title: "Cerro Bayo",
  location: "Villa La Angostura, Argentina",
  lat: -40.6667,
  lon: -71.8833,
  ap: "BRC",
  icon: "🏔️",
  rating: 4.68,
  reviews: 720,
  gradient: "linear-gradient(160deg,#1c3a5a,#2b6cb0,#63b3ed)",
  accent: "#63b3ed",
  tags: ["Lake Views", "Powder Days", "Uncrowded", "Patagonia Scenery", "Family Friendly"],
  photo: "https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=800&h=600&fit=crop",
  skiPass: "independent"
},
{
  id: "ski-antuca-cl",
  category: "skiing",
  title: "Ski Antuca",
  location: "Biobío, Chile",
  lat: -37.4083,
  lon: -71.3708,
  ap: "CCP",
  icon: "🏔️",
  rating: 4.55,
  reviews: 480,
  gradient: "linear-gradient(160deg,#2c3e6e,#3a6db8,#74aee0)",
  accent: "#74aee0",
  tags: ["Volcano Views", "Uncrowded", "Powder Days", "Local Scene", "Deep Snow"],
  photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  skiPass: "independent"
},
{
  id: "mt-cheeseman-nz",
  category: "skiing",
  title: "Mt. Cheeseman",
  location: "Canterbury, New Zealand",
  lat: -43.3333,
  lon: 171.7333,
  ap: "CHC",
  icon: "🏔️",
  rating: 4.42,
  reviews: 340,
  gradient: "linear-gradient(160deg,#1e3a5f,#2e6da4,#68aad8)",
  accent: "#68aad8",
  tags: ["Club Field", "Off-Piste", "Uncrowded", "Southern Alps", "Local Gem"],
  photo: "https://images.unsplash.com/photo-1526908275098-e2cab8154f01?w=800&h=600&fit=crop",
  skiPass: "independent"
},
```

**Notes before pasting:**
- Verify photo URLs load correctly before committing (sandbox network may block Unsplash)
- `CCP` = Carriel Sur International (Concepción, Chile) — verify this is in `AIRPORT_COORDS` + `AP_CONTINENT`; if not, add it alongside the venue
- `hintertux-glacier` and `kitzsteinhorn-kaprun` get `lateSeason: true` — both are glacier resorts with documented summer skiing operations
- Run `node scripts/validate-venues.mjs` with these in `data/venue-candidates.json` first

---

## One Observation for PM

**July is a dead zone for US/EU ski users.** With 96 standard N-hemisphere ski venues scoring near-zero in midsummer, a US user opening Peakly right now sees essentially a beach app. The 14 lateSeason + 23 S-hemisphere ski venues are real inventory, but a London or Denver user needs a flight ≥10h to reach any of them. Consider surfacing the southern hemisphere ski story more explicitly in midsummer — a "Ski the Southern Hemisphere" filter pill or carousel header for July–August could convert users who would otherwise bounce thinking ski season is over. Low-engineering lift, high perception win.
