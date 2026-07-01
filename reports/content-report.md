# Peakly Content & Data Quality Report — 2026-07-01

**Data health score: 96/100** (↓1 from Jun 30) | Build: `20260629a` ⚠️ 3 days stale | Venues: **370** (131 ski / 239 beach) | Max photo repeat: 3×

**Score drop reason:** 5 skiing venues confirmed with placeholder tags + identical gradients (newly isolated this run). Deferred per freeze; documented below with fix-ready code.

---

## Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **370 venues, 2 categories (skiing + beach).** Pivot happened May 2026. |
| "Hiking has ZERO gear items" | **Hiking category does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired May 2026. |
| "Add 5 new venue objects" | **VENUE FREEZE active (PM v68, June 24 → July 3).** No additions until post-launch Plausible data confirms demand. |
| "197 venues have empty tag arrays" | **FALSE — all 370 venues have tags.** Multi-line JSON format was miscounted by prior scripts. |

---

## Fix Applied This Run

**None.** Venue freeze active. Two findings documented for post-freeze sprint (placeholder tags new + logical duplicates from Jun 30 still open).

---

## 1. Data Integrity Audit

### Venue Counts

| Category | Count | In Season (Jul 1, N. Hemi Summer) |
|----------|-------|-------------------------------------|
| **beach** | 239 | ~184 N.hemi firing (PEAK — July 4 weekend 3 days out) · ~55 S.hemi suppressed by <18°C cap |
| **skiing** | 131 | **23 S.hemi in-season** (peak southern winter) · 25 `lateSeason:true` glaciers eligible · 83 N.hemi off-season |
| **TOTAL** | **370** | Venue freeze active. No additions this run. |

### Structural Integrity

| Check | Result | Δ from Jun 30 |
|-------|--------|--------------|
| Duplicate IDs | ✅ 0 | — |
| Missing lat/lon | ✅ 0 | — |
| Missing airport codes (`ap`) | ✅ 0 | — |
| Missing tags | ✅ 0 | — |
| Missing photos | ✅ 0 | — |
| Max photo repeat | ✅ 3× (104×3, 24×2, 10×1 = 138 unique) | — |
| `lateSeason:true` venues | ✅ 25 (6 compact + 19 JSON) | — |
| GEAR_ITEMS refs | ✅ 0 | — |
| Build stamp | ⚠️ `20260629a` — **3 days stale** | DevOps to bump → `20260701a` |
| skiPass coverage | ✅ 131/131 (34 Epic / 51 Ikon / 46 independent) | — |
| Brace balance | ✅ 5565/5565 | — |
| Airport coverage (AP_CONTINENT) | ✅ 131 unique airports, all mapped | — |
| Airport coverage (AIRPORT_COORDS) | ✅ 131 unique airports, all have coords | — |
| Placeholder tag venues | ⚠️ **5 found** (NEW — see §2) | new |
| Logical duplicate venue pairs | ⚠️ 3 open (from Jun 30) | deferred |

### Logical Duplicate Venues (from Jun 30 — still open, still deferred)

Boot-time validator catches duplicate IDs, not duplicate locations. **Do not remove during freeze.**

| Compact ID | Batch ID | Location | Post-Freeze Fix |
|-----------|---------|----------|-----------------|
| `bigsky` | `big-sky-montana` | Big Sky, Montana | Remove `bigsky` (compact); batch has richer tags |
| `beach_grace` | `grace-bay-turks` | Grace Bay, Turks & Caicos | Remove `beach_grace` |
| `beach_miami` | `south-beach-miami` | South Beach Miami | Remove `beach_miami` |

---

## 2. NEW FINDING — 5 Skiing Venues with Placeholder Tags + Identical Gradients

Five JSON-format skiing venues were batch-added with default placeholder data. All five share the exact same gradient (`linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)`) and icon (`🏔️`). Three carry `lateSeason: true`, meaning they can surface in the Skiing grid in summer if `snow_depth_max ≥ 0.5m`.

| Venue ID | Title | Tags | lateSeason |
|----------|-------|------|-----------|
| `winter-park` | Winter Park, CO | `["Powder Day", "All Levels"]` | ✅ true |
| `copper-mountain` | Copper Mountain, CO | `["Powder Day", "All Levels"]` | ✅ true |
| `palisades-tahoe` | Palisades Tahoe, CA | `["Powder Day", "All Levels"]` | — |
| `brighton` | Brighton, UT | `["Powder Day", "All Levels"]` | — |
| `lake-louise` | Lake Louise, AB | `["Powder Day", "All Levels"]` | ✅ true |

**Severity: MEDIUM.** No crash. But a user who opens any of these cards sees identical generic tags with zero discovery signal. 8,270 combined reviews across these 5 venues — real destinations users will search.

**Fix-ready code (paste post-freeze — update `"tags"` and `"gradient"` for each):**

```js
// winter-park
"tags": ["Parsenn Bowl", "Beginner Terrain"],
"gradient": "linear-gradient(160deg,#0f2a4a,#1d5291,#3a7fc1)",

// copper-mountain
"tags": ["Natural Terrain Separation", "Front Range Access"],
"gradient": "linear-gradient(160deg,#1a2e1a,#2d5a2d,#5a9e5a)",

// palisades-tahoe
"tags": ["KT-22 Expert Chutes", "Lake Tahoe Views"],
"gradient": "linear-gradient(160deg,#0d1e40,#1a4a8a,#3a7ac0)",

// brighton
"tags": ["Best Utah Night Skiing", "Cottonwood Powder"],
"gradient": "linear-gradient(160deg,#1a1a3a,#2d3a6a,#5a6aaa)",

// lake-louise
"tags": ["Glacial Views", "Lake Louise Village"],
"gradient": "linear-gradient(160deg,#0a2a3a,#1a5a6a,#3a8a9a)",
```

---

## 3. Photo Audit

- 370 photo entries, **138 unique photo IDs**
- Distribution: 104 photos at 3× · 24 photos at 2× · 10 photos at 1×
- Max repeat: **3×** — stable since June 13 photo-dedup (commit `a143e4c`)
- 0 photos exceeding 3× threshold
- `"Surf Breaks"` tag on ~15 beach venues — **legitimate** (describes wave character, not a surfing-category leak)

---

## 4. GEAR_ITEMS Audit

`GEAR_ITEMS = 0 occurrences` — confirmed. Amazon cut for v1.

---

## 5. Seasonal Relevance — July 1

### Beach — July 4 Peak

~184 N. hemisphere beach venues at peak summer scoring. Mediterranean (Italy, France, Croatia, Greece), Caribbean, US East + West coast, SE Asia — all prime. July 4 is the single highest US beach search weekend of the year.

~55 S. hemisphere beach venues (NZ, AUS east coast, Zanzibar, Mauritius) correctly suppressed by 18°C water-temp hard cap — southern winter, intended.

### Skiing — Southern Winter Peak

**23 S. hemisphere venues in-season** at peak mid-winter:
- NZ (5): Cardrona, Mt Hutt, Coronet Peak, Remarkables, Treble Cone
- AUS (5): Falls Creek, Mt Buller, Hotham, Perisher, Charlotte Pass
- Chile (6): Portillo, Valle Nevado, La Parva, El Colorado, Nevados de Chillán, Corralco
- Argentina (6): Cerro Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor, Pucon
- Morocco (1): Oukaimeden

**25 N. hemisphere lateSeason glaciers** eligible via snow-depth bypass: Tignes, Val Thorens, Verbier, Zermatt/Cervinia, Mammoth, Whistler, and 19 JSON-format additions. Real July glacier sessions exist at most. Note: 3 of the 5 placeholder-tag venues (`winter-park`, `copper-mountain`, `lake-louise`) carry `lateSeason:true` — if any surface, users see generic tags.

**83 N. hemisphere standard ski** correctly off-season capped.

---

## 6. Content Quality

| Check | Result |
|-------|--------|
| Descriptions | No `description` field — venues use title + location + tags. N/A |
| Tags under 2 | ✅ 0 venues |
| Ratings in range 4.0–5.0 | ✅ All in range |
| Cross-category tag contamination | ✅ 0 |
| `Powder Day` on beach venues | ✅ 0 |
| Generic placeholder tags | ⚠️ 5 venues (§2 above) |
| skiPass on all ski | ✅ 131/131 |

---

## 7. Build Stamp — Stale (DevOps action needed)

`20260629a` is 3 days old. `app.jsx`, `sw.js`, and `index.html` all need `20260701a`. The DevOps July 1 report (commit `d428ad2`) didn't include a stamp bump. Users who visited June 29 are not receiving a fresh service worker eviction.

---

## 8. New Venue Additions — NONE THIS RUN

Venue freeze in effect. Post-freeze priority queue (after July 3, from Plausible data):
1. Fix 5 placeholder-tag ski venues (§2) — under 5 minutes
2. Remove 3 logical duplicate pairs (§1) — under 2 minutes each
3. Middle East beach (Dubai, Abu Dhabi — missing)
4. Caribbean long-tail (St. Kitts, Dominica, Grenada)

---

## One Observation for the PM

**July 4 weekend is NOW — and three lateSeason ski venues with placeholder tags could surface this weekend.** `winter-park`, `copper-mountain`, and `lake-louise` carry `lateSeason:true` and may appear in the Skiing grid over the July 4 weekend if snow-depth data comes back ≥ 0.5m. Any US redditor who taps "Winter Park" expecting to read what makes it worth a July trip will see `"Powder Day" / "All Levels"` — indistinguishable from every other batch venue. These three venues have 5,180 combined reviews; people know them. The tag fix is a 5-minute paste. If the Reddit post is live and the skiing filter is being clicked, apply this fix before Sunday July 5 rather than waiting for the post-freeze sprint.

---

*Content agent — 2026-07-01 UTC | Repo: d428ad2 | Venues: 370 (131 ski / 239 beach) | Build: 20260629a (stale — DevOps action needed)*
