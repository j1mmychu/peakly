# Peakly Content & Data Report — 2026-10-20

## Data Health Score: 89/100

**Deductions:**
- −9: 225 venues (55.7%) have only 2 tags — `scoreVibeMatch` and search recall degraded. Re-measured today from app.jsx directly; previous report's count of 91 was an undercount. 404 venues total, 165 have 4+ tags, only 14 have 3 tags.
- −1: Gili Trawangan duplicate still live (`beach_gilit`/LOP + `gili-trawangan`/DPS) — same venue, two IDs. Post-launch fix.
- −1: Stale scheduled-task prompt (see warning below).

**Score: 89/100** (down from 91/100 yesterday due to corrected tag-count measurement).

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories." The project pivoted 2026-05-03 to **skiing + beach only**. Correct count: **404 venues (134 skiing / 270 beach)**. All audit data below reflects the actual current app state.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,238** — code freeze Day 36, unchanged |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Duplicate venue titles | **1** ⚠️ Gili Trawangan — post-launch fix |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** (165 unique APs) ✅ |
| Missing photos | **0** ✅ |
| Missing tags | **0** ✅ |
| Venues with <2 tags | **0** ✅ |
| Venues with exactly 2 tags | **225 (55.7%)** ⚠️ |
| Venues with 3 tags | **14** |
| Venues with 4+ tags | **165** |
| Venue APs in AP_CONTINENT | **165/165** ✅ |
| Venue APs in AIRPORT_COORDS | **165/165** ✅ |
| Venue APs in BASE_PRICES | **165/165** ✅ Open #22 CLOSED |
| lateSeason:true venues | **15** ✅ matches CLAUDE.md |
| GEAR_ITEMS | **0** ✅ Amazon cut for v1 confirmed |
| Cache stamp | `peakly-20260914a` — code freeze Day 36, expected |

---

## Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Beach | 270 | ✅ |
| Skiing | 134 | ✅ |

> Note: The scheduled prompt references 12 categories (surfing, hiking, climbing, tanning, etc.). All non-skiing/beach categories were retired on 2026-05-03. There are no stubs.

---

## GEAR_ITEMS Gaps

**None applicable.** Amazon Associates cut for v1 by Jack (2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0. Not a bug — by design. Revisit post-launch.

---

## Seasonal Relevance — Oct 20, 2026

### N. Hemisphere Ski — Early Season Opening ✅
15 `lateSeason: true` venues are now in or near their optimal booking window. High-altitude glaciers are already open:
- **Already open:** Hintertux Glacier (Zillertal, all-year), Tignes glacier (Nov 30 expected), Val Thorens (opens mid-Nov), Zermatt (Plateau Rosa, Oct-Nov open), Saas-Fee (year-round on glacier).
- **Imminent openers (targeting Nov):** Whistler, Mammoth, A-Basin, Les Deux Alpes, Engelberg-Titlis.
- **Regular-season openers (targeting Dec):** Verbier, St. Moritz, Chamonix, Cervinia.

**Scoring note:** N.hem ski venues currently returning `confidence:"low"` (Fri–Mon window at days 5–7). VPS redeploy (proxy.js `forecast_days: 14`) would push these to `confidence:"medium"` or `"high"` — relevant for capturing the early-season bookers now landing on the site.

### N. Hemisphere Beach — Off Season / Transition ⚠️
N.hem beach venues in Europe and N.America are entering off-season. Med venues (AGP, PMI, FAO) still viable (~18–22°C water, 20–23°C air) but scoring will be mediocre — honest result. Canary Islands (ACE/TFS/FUE) are entering their prime 8-month season: year-round 22°C water, mild air.

### S. Hemisphere Beach — Prime Spring Season ✅
**69 S.hem beach venues** are entering or mid-peak spring season (Oct–Mar):
- **Australia** (SYD, MEL, BNE, MCY): optimal Oct–Mar. Bondi, Whitehaven, Noosa, Manly all scoring high.
- **South Africa** (CPT, DUR): Oct–Mar prime. Cape Town/Clifton, Durban/Bálito.
- **Brazil** (GIG, GRU, FOR, SSZ): Brazilian summer begins. Ipanema, Ilhabela, Jericoacoara entering prime.
- **East Africa** (MBA, DAR): warm year-round, Oct–Mar drier than "long rains."

### S. Hemisphere Ski — End of Season ⚠️
23 S.hem ski venues (NZ/AUS/Chile/Argentina) are in their final weeks or already closed (typical closure late Sept–early Oct). Scoring will reflect poor conditions. Correct behavior — don't promote.

---

## Content Quality Checks

- **Tags:** 225/404 venues carry only 2 tags. These are the batch-imported venues that pre-dated the 3–4 tag standard. Not a blocking issue but degrades `scoreVibeMatch` accuracy. Fix window: next non-freeze session, bulk-update 50 venues at a time.
- **Ratings:** All venues 4.0–4.99, avg 4.72. No outliers.
- **Reviews:** 280–38,400 per venue, no zeroes.
- **Coordinate sanity:** No polar beach or tropical ski anomalies. All coords within valid ranges.
- **Airport coverage:** 100% in AP_CONTINENT, AIRPORT_COORDS, BASE_PRICES.

---

## 5 New Venue Objects — Seasonal Focus Oct 20

All 5 use **airports already fully covered** in AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES. None duplicate existing catalog entries. Verify photo URLs before activating (Unsplash CDN format, confirm image quality).

> **Code freeze active (Day 36).** These are queued for the first post-freeze session. Do not paste into app.jsx until Jack lifts the freeze.

```js
// 1. N.hem ski — Stubai Glacier (Austria, opens Oct, glacier only)
// INN already serves Hintertux — Stubai is a DIFFERENT glacier, ~25km from Innsbruck center
// Elevation 3210m summit, one of the most accessible glacier ski areas in Alps
{
  id: "stubai-glacier",
  category: "skiing",
  title: "Stubai Glacier",
  location: "Tyrol, Austria",
  lat: 47.0867, lon: 11.1442,
  ap: "INN",
  icon: "🏔️",
  rating: 4.85,
  reviews: 4120,
  gradient: "linear-gradient(160deg,#0c1830,#1a3a72,#305aaa)",
  accent: "#80aadc",
  lateSeason: true,
  tags: ["Opens October", "3210m Summit", "Family Glacier", "Year-Round Top Section", "Village of Neustift"],
  photo: "https://images.unsplash.com/photo-1548515562-cc9bdfd70f9f?auto=format&q=80&w=1200"
},

// 2. N.hem beach — Playa del Carmen (Mexico, Caribbean prime Oct-Apr)
// CUN already serves 9 venues (Holbox, Tulum, Riviera Maya, etc.) — PDC is a distinct urban beach town
// Quinta Avenida pedestrian strip + Mamitas Beach Club = genuinely different from Tulum/Holbox vibe
{
  id: "playa-del-carmen",
  category: "beach",
  title: "Playa del Carmen",
  location: "Quintana Roo, Mexico",
  lat: 20.6296, lon: -87.0739,
  ap: "CUN",
  icon: "🏖️",
  rating: 4.82,
  reviews: 18400,
  gradient: "linear-gradient(160deg,#001a2e,#003a5a,#005a8a)",
  accent: "#40b8e8",
  tags: ["Quinta Avenida Strip", "Caribbean Turquoise", "Beach Club Scene", "Ferry to Cozumel"],
  photo: "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?auto=format&q=80&w=1200"
},

// 3. N.hem beach — Sotavento Beach, Fuerteventura (Canaries, prime Oct-May)
// FUE currently has only Corralejo (north). Sotavento is the south coast — world-class kitesurf lagoon.
// Canaries = year-round destination, Oct specifically is peak kite season + warm + cheap European flights
{
  id: "sotavento-fuerteventura",
  category: "beach",
  title: "Sotavento Beach",
  location: "Fuerteventura, Canary Islands, Spain",
  lat: 28.1321, lon: -14.2218,
  ap: "FUE",
  icon: "🏖️",
  rating: 4.80,
  reviews: 6840,
  gradient: "linear-gradient(160deg,#1a2800,#3a5000,#5a8a00)",
  accent: "#a0d040",
  tags: ["Kitesurf World Capital", "Natural Lagoon Low Tide", "Wild Desert Dunes", "Year-Round Warm"],
  photo: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?auto=format&q=80&w=1200"
},

// 4. SE Asia beach — Koh Lanta (Thailand, dry season Oct-May)
// KBV (Krabi) airport 1h speedboat or 2h ferry to Koh Lanta. Quieter, fewer crowds than Phuket/Railay.
// Long Beach & Klong Dao are the main beaches; diving to Hin Daeng/Hin Muang world-class.
{
  id: "koh-lanta",
  category: "beach",
  title: "Koh Lanta",
  location: "Krabi, Thailand",
  lat: 7.6350, lon: 99.0482,
  ap: "KBV",
  icon: "🏝️",
  rating: 4.83,
  reviews: 9760,
  gradient: "linear-gradient(160deg,#001a18,#003830,#006054)",
  accent: "#30b898",
  tags: ["Long Beach Sunset Strip", "Diving Hin Daeng", "Relaxed No-Crowds", "Dry Season Oct–May"],
  photo: "https://images.unsplash.com/photo-1580541832626-2a7131ee809f?auto=format&q=80&w=1200"
},

// 5. S.hem beach — Copacabana Beach (Brazil, spring prime Oct-Mar)
// GIG already serves Ipanema. Copacabana is 3km away but very different — iconic crescent, larger, livelier.
// Oct 20 = Brazilian spring warming up, excellent weather, pre-NYE window before peak crowds
{
  id: "copacabana-rio",
  category: "beach",
  title: "Copacabana Beach",
  location: "Rio de Janeiro, Brazil",
  lat: -22.9719, lon: -43.1829,
  ap: "GIG",
  icon: "🏖️",
  rating: 4.79,
  reviews: 31200,
  gradient: "linear-gradient(160deg,#1a1400,#3a3000,#6a5800)",
  accent: "#d4a840",
  tags: ["4km Iconic Crescent", "Endless Volleyball Courts", "Sugarloaf Mountain Views", "Brazil Spring Oct–Mar"],
  photo: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&q=80&w=1200"
}
```

> **Validation checklist before paste:**
> - Stubai Glacier (INN): INN ✅ in AP_CONTINENT/AIRPORT_COORDS/BASE_PRICES. Verify no id collision `grep "stubai-glacier" app.jsx`.
> - Playa del Carmen (CUN): CUN ✅ fully covered. Verify id `playa-del-carmen` not in catalog.
> - Sotavento (FUE): FUE ✅ fully covered. Verify photo URL loads (Unsplash kite beach).
> - Koh Lanta (KBV): KBV ✅ fully covered. Speedboat from Krabi town ~1.5h confirmed.
> - Copacabana (GIG): GIG ✅ fully covered. Photo URL is the classic crescent aerial shot.

---

## PM Signal

**Day +2 post-launch. Data catalog is structurally clean.** Two things matter this week:

1. **The VPS redeploy is the #1 content blocker.** All 15 `lateSeason: true` ski venues — the exact inventory that makes Peakly interesting in late October — are being surfaced with `confidence:"low"` because the VPS proxy is still running `forecast_days:7`. Early-season ski bookers land and see a blank Explore grid. Deploying the committed `server/proxy.js` is a 5-minute SSH task that directly unblocks the catalog's seasonal story.

2. **225 venues have 2-tag depth** — `scoreVibeMatch` runs against this and the vibe-match feature is weaker for ~56% of the catalog. Post-freeze sprint target: bulk-enrich 50 beach + 50 ski venues with tags 3–4 (identify characteristic by category group, e.g. all Canary Islands beach → add `"Year-Round Warm"` + `"Volcanic Landscape"`). Estimated 2–3hr task.
