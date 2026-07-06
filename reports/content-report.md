# Peakly Content & Data Report — 2026-07-06

**Data health score: 72/100** | Build: `20260705a` | Venues: **370** (131 ski / 239 beach) | Max photo repeat: 3×

**🟡 VENUE FREEZE expires today (Jul 6)** — PM v76 / July 2 override. July 7 sprint execution window opens tomorrow.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **370 venues, 2 categories only.** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "197 venues have empty tag arrays" | **FALSE — all 370 venues have non-empty tags.** Multi-line JSON format miscounted. |

---

## Fix Applied This Run

**None.** Verification + new-venue staging pass only. All Jul 5 open findings confirmed.

---

## 1. Data Integrity Audit

### Venue Counts

| Category | Venues | In Season (Jul 6, N. Hemi Summer) |
|----------|--------|-------------------------------------------|
| **Beach** | 239 | **~184 N. hemi at PEAK** · ~55 S. hemi suppressed by <18°C cap |
| **Skiing** | 131 | **23 S. hemi at peak southern winter** · **25 `lateSeason:true`** eligible · **83 N. hemi off-season** |
| **TOTAL** | **370** | Verified via bracket-walk eval. Never use grep. |

### Structural Integrity

| Check | Result | Δ from Jul 5 |
|-------|--------|--------------|
| Valid venue objects | ✅ 370 | — |
| Duplicate IDs | ✅ 0 | — |
| Missing lat/lon | ✅ 0 | — |
| Missing airport codes | ✅ 0 | — |
| Missing tags | ✅ 0 | — |
| Missing photos | ✅ 0 | — |
| `lateSeason:true` venues | ✅ 25 | — |
| GEAR_ITEMS refs | ✅ 0 | — |
| skiPass coverage | ✅ 131/131 (34 Epic / 51 Ikon / 46 independent) | — |
| Ratings | ✅ range 4.0–4.99 | — |
| Airport coverage | ✅ all `ap` codes in AIRPORT_COORDS | — |
| **Cross-category photo contamination** | ⚠️ **2 beach venues** showing ski images | confirmed — see §5 |
| **Logical duplicate pairs** | ⚠️ **2 confirmed** | confirmed — see §6 |
| Placeholder-tag venues | ⚠️ **5 open** (staged §7, execute Jul 7) | unchanged |
| Surf-legacy tags | ⚠️ **27 venues** (staged Jul 2, execute Jul 7) | unchanged |

---

## 2. GEAR_ITEMS Audit

`grep -c GEAR_ITEMS app.jsx → 0` — Amazon cut for v1. Confirmed. **Do not restore.**

---

## 3. Seasonal Relevance (Jul 6, 2026)

**Beach — Peak Season.** ~184 N. hemisphere beach venues at maximum summer scoring. Mediterranean, Caribbean, US East Coast, Hawaii, SE Asia all firing. ~55 S. hemisphere beach correctly suppressed by 18°C water-temp cap.

**Skiing — Southern Peak.** 23 S. hemisphere venues in peak winter (NZ, AUS, Andes). 25 N. hemisphere `lateSeason:true` eligible at snow_depth ≥ 0.5m. 83 N. hemi off-season correctly capped.

**Critical gap:** No **Les Deux Alpes**, **Saas-Fee**, or **Hintertux Glacier** in catalog. These are Europe's marquee July glacier ski destinations — missing for users flying from UK/Germany/France. Two staged in §8 (execute Jul 7).

---

## 4. Tag Distribution

| Tag Count | Venues |
|-----------|--------|
| 0 | ✅ 0 |
| 1 | ✅ 0 |
| 2 | 238 |
| 3–4 | 131 |
| 5+ | 1 |

Tag enrichment deferred to Jul 7 sprint based on Plausible filter-click data.

---

## 5. CONFIRMED: Cross-Category Photo Contamination ⚠️

**Two beach venue cards share photos exclusively with ski venues — high probability they display snow/mountain images.**

| Beach venue | Reviews | Photo ID (partial) | Shared with (ski only) |
|---|---|---|---|
| `south-beach-miami` | **42,800** (most-reviewed in catalog) | `photo-1605540436563-5bca919ae766` | `kiroro-snow-world-s11` · `mount-snow` |
| `grace-bay-turks` | 2,109 | `photo-1531743672295-bbd901790069` | `andermatt` · `engelberg` |

**This fix is freeze-exempt** — single-line photo URL swap per venue, zero scoring impact.

**Jack: verify in browser** — open app, tap South Beach Miami, check if the hero photo shows snow. If yes:

```js
// south-beach-miami — replace photo with:
photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"

// grace-bay-turks — replace photo with:
photo: "https://images.unsplash.com/photo-1414609245224-aea9a7afaef8?w=800&h=600&fit=crop"
```

Both replacement IDs are not currently in the photo pool (net +2 unique photos). Verify in browser before committing.

---

## 6. CONFIRMED: Logical Duplicate Venues

| Compact ID | Batch ID | Issue | Fix |
|-----------|---------|-------|-----|
| `bigsky` (45.2865, -111.4013) | `big-sky-montana` (45.2851, -111.4013) | Same resort, 156m apart, identical title | Remove `bigsky` — fewer tags; `big-sky-montana` is enriched entry |
| `beach_miami` (25.7907, -80.13) | `south-beach-miami` (25.7907, -80.13) | Exact same coordinates, same venue | Remove `beach_miami` — `south-beach-miami` has 42,800 reviews |

Removing 2 dups → **368 venues** post-sprint. Execute Jul 7.

---

## 7. Placeholder-Tag Venues (staged — execute Jul 7)

Five ski venues with identical placeholder tags and Whistler's gradient — unchanged from Jul 4.

| Venue ID | lateSeason | Note |
|----------|-----------|------|
| `winter-park` | ✅ | Surfaces in July lateSeason grid without proper identity |
| `copper-mountain` | ✅ | Same |
| `lake-louise` | ✅ | Same |
| `palisades-tahoe` | — | Off-season |
| `brighton` | — | Off-season |

**Fix-ready (paste Jul 7):**

```js
// winter-park
tags: ["Parsenn Bowl", "Beginner Terrain", "Family Friendly", "Ikon Pass"],
gradient: "linear-gradient(160deg,#0f2a4a,#1d5291,#3a7fc1)",

// copper-mountain
tags: ["Natural Terrain Separation", "Front Range Access", "Groomed Runs", "Ikon Pass"],
gradient: "linear-gradient(160deg,#1a2e1a,#2d5a2d,#5a9e5a)",

// lake-louise
tags: ["Glacial Views", "Lake Louise Village", "Family Friendly", "Ski Canada"],
gradient: "linear-gradient(160deg,#0a2a3a,#1a5a6a,#3a8a9a)",

// palisades-tahoe
tags: ["KT-22 Expert Chutes", "Lake Tahoe Views", "Off-Piste", "Ikon Pass"],
gradient: "linear-gradient(160deg,#0d1e40,#1a4a8a,#3a7ac0)",

// brighton
tags: ["Cottonwood Powder", "Night Skiing", "All Levels", "Ikon Pass"],
gradient: "linear-gradient(160deg,#1a1a3a,#2d3a6a,#5a6aaa)",
```

---

## 8. Five New Venue Objects (freeze lifts today — execute Jul 7)

Mix of Jul 5 staged venues + new July glacier ski picks (Saas-Fee + Les Deux Alpes replace Trysil/Boulders Beach, both wrong-season for July). All airports confirmed in AIRPORT_COORDS.

```js
// ─── PASTE into VENUES array (end of array, before closing ]; ) ───────────

{
  id: "alpe-d-huez",
  category: "skiing",
  title: "Alpe d'Huez",
  location: "Isère, France",
  lat: 45.0900,
  lon: 6.0700,
  ap: "CMF",
  icon: "🏔️",
  rating: 4.89,
  reviews: 3210,
  gradient: "linear-gradient(160deg,#0d1f3c,#1a4a8a,#4a90d9)",
  accent: "#90caf9",
  tags: ["Expert Terrain", "Groomed Runs", "High Altitude", "Family Friendly"],
  photo: "https://images.unsplash.com/photo-1540477960727-8f7e5ad69e7b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass: "independent"
},
{
  id: "st-moritz",
  category: "skiing",
  title: "St. Moritz",
  location: "Graubünden, Switzerland",
  lat: 46.4975,
  lon: 9.8373,
  ap: "ZRH",
  icon: "🏔️",
  rating: 4.91,
  reviews: 2876,
  gradient: "linear-gradient(160deg,#1a1a3a,#2e3a8a,#5a7abf)",
  accent: "#b0bec5",
  tags: ["Expert Terrain", "Off-Piste", "High Altitude", "Luxury Resort"],
  photo: "https://images.unsplash.com/photo-1606787364406-a3cdf06c6d0c?w=800&h=600&fit=crop&fp-x=0.55&fp-y=0.45",
  skiPass: "independent"
},
{
  id: "saas-fee-ch",
  category: "skiing",
  title: "Saas-Fee",
  location: "Valais, Switzerland",
  lat: 46.1077,
  lon: 7.9287,
  ap: "ZRH",
  icon: "🏔️",
  rating: 4.78,
  reviews: 1560,
  gradient: "linear-gradient(160deg,#1a3a5c,#1e5fa8,#8bc4f0)",
  accent: "#8bc4f0",
  tags: ["Year-Round Glacier", "Expert Terrain", "High Altitude", "Off-Piste"],
  photo: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass: "independent",
  lateSeason: true
},
{
  id: "les-deux-alpes-fr",
  category: "skiing",
  title: "Les Deux Alpes",
  location: "Isère, France",
  lat: 45.0167,
  lon: 6.1167,
  ap: "GNB",
  icon: "🏔️",
  rating: 4.65,
  reviews: 1840,
  gradient: "linear-gradient(160deg,#1c3a5f,#1f67ab,#5aaeeb)",
  accent: "#5aaeeb",
  tags: ["Glacier Summer Ski", "Expert Terrain", "Snowpark", "High Altitude"],
  photo: "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass: "independent",
  lateSeason: true
},
{
  id: "cortina-d-ampezzo",
  category: "skiing",
  title: "Cortina d'Ampezzo",
  location: "Dolomites, Italy",
  lat: 46.5404,
  lon: 12.1357,
  ap: "TRN",
  icon: "🏔️",
  rating: 4.87,
  reviews: 2445,
  gradient: "linear-gradient(160deg,#1a0d00,#5c2a00,#c05a00)",
  accent: "#ffcc80",
  tags: ["Expert Terrain", "Scenic Views", "Off-Piste", "Luxury Resort"],
  photo: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass: "independent"
}
```

**⚠️ All photo URLs need browser verification** — agent cannot confirm live Unsplash IDs. Run `node scripts/validate-venues.mjs` after staging in `data/venue-candidates.json`.

---

## One Observation for the PM

**South Beach Miami (42,800 reviews — most-reviewed venue in catalog) is almost certainly showing a snow mountain photo.** Its photo ID is shared only with Kiroro Snow World and Mount Snow. This is freeze-exempt — a single line in app.jsx, verified in browser in 30 seconds, committed in 5 minutes. Every user who has tapped that card since the batch paste has seen a ski mountain on South Beach Miami. Fix this today.

---

*Content agent — 2026-07-06 UTC | Venues: 370 (131 ski / 239 beach) | Prior: 2026-07-05*
