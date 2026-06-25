# Peakly Content & Data Quality Report — 2026-06-25

**Data health score: 88/100** | Build: `20260625a` | Venues: **370** (131 ski / 239 beach) | Max photo repeat: 3×

---

## Prompt Corrections (permanent — stop raising these)

The scheduled agent prompt is stale from the pre-May 2026 state. Current authoritative facts:

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **370 venues, 2 categories (skiing + beach).** Pivot happened May 2026. |
| "Hiking has ZERO gear items" | **Hiking category does not exist.** Amazon cut for v1. |
| "7 categories are single-venue stubs" | **Only skiing and beach exist.** All other categories were retired. |
| "Add 5 new venue objects" | **VENUE FREEZE active per PM v68 (June 24).** No additions until post-launch Plausible data. |

---

## 1. Data Integrity Audit

### Venue Counts

| Category | Count | In Season (Jun 25, N.Hemi Summer) |
|----------|-------|-----------------------------------|
| **beach** | 239 | ~181 N.hemi (PEAK ✅) · ~58 S.hemi suppressed (<18°C hard cap) |
| **skiing** | 131 | 23 S.hemi (PEAK ✅) · 108 N.hemi off-season · 6 `lateSeason:true` glaciers can surface |
| **TOTAL** | **370** | Venue freeze active. No additions this run. |

> Note: bracket-walker finds 372 objects — 2 are coordinate-only comment stubs (`{lat:-33.9648,lon:18.6017}`, `{lat:-22.8100,lon:-43.2507}`), not real venues. Real ID count: 370. The `.venue-baseline` value of 370 is correct.

### Structural Integrity

| Check | Result |
|-------|--------|
| Duplicate IDs | ✅ 0 duplicates |
| Missing lat/lon | ✅ 0 |
| Missing airport codes | ✅ 0 |
| Missing tags field | ✅ 0 (tag field present on all 370; content varies — see §4) |
| Missing photos | ✅ 0 (370 photo URLs; 173 compact format + 197 JSON format) |
| AP_CONTINENT coverage | ✅ All 144 unique venue APs present in AP_CONTINENT |
| AIRPORT_COORDS coverage | ✅ All 144 unique venue APs present in AIRPORT_COORDS |
| Brace balance | ✅ 5565/5565 |
| Build stamp lockstep | ✅ `20260625a` in app.jsx, sw.js, index.html |
| `.venue-baseline` | ✅ 370 — correct |

---

## 2. GEAR_ITEMS Audit

**`GEAR_ITEMS` = 0 — correct.** Amazon cut for v1 (Jack's decision, June 2026). Revenue model is $7.58/1K MAU. The stale agent prompt claiming "Hiking has ZERO gear items" is reading a project that no longer exists. Nothing to fix here.

---

## 3. Seasonal Relevance — June 25 (N. Hemisphere Summer Peak)

**Actively scoring:**
- **Beach N.hemi (~181 venues):** PEAK season. Atlantic US, Caribbean, Mediterranean, SE Asia all firing. Hurricane season started June 1 — precip data from Open-Meteo suppresses Gulf/Caribbean venues dynamically during storm windows; no manual action needed.
- **Ski S.hemi (23 venues):** New Zealand (Cardrona, Mt Hutt, Coronet Peak, Remarkables, Treble Cone), Australia (Falls Creek, Mt Buller, Hotham, Charlotte Pass, Thredbo, Perisher), Chile/Argentina (Portillo, Valle Nevado, La Parva, El Colorado, Nevados de Chillán, Corralco, Cerro Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor). **This is the only ski story until September.**

**Suppressed / low-scoring:**
- **Ski N.hemi (108 venues):** Off-season. 6 `lateSeason:true` glaciers (Zermatt, Tignes, Val Thorens, Engelberg, Verbier, Mammoth) can breach the off-season cap when `snow_depth_max >= 0.5m`. lateSeason quality audit deferred to July sprint per PM v68.
- **Beach S.hemi (~58 venues):** <18°C hard cap suppresses them from the front page; they still appear in search.

---

## 4. Content Quality — TAG THINNESS IS WORSE THAN REPORTED

**This is the primary quality debt.** PM v68 referenced "40 ski venues with single tags." The actual picture:

| Segment | 0 tags | 2 tags | 4+ tags |
|---------|--------|--------|---------|
| Skiing (131 total) | **63** (48%) | 36 (27%) | 32 (24%) |
| Beach (239 total) | **134** (56%) | 59 (25%) | 46 (19%) |
| **All venues** | **197 (53%)** | **95** | **78** |

**197 venues have empty tag arrays.** This is not cosmetic — tapping "Powder Day" or "Snorkeling" on Explore returns nothing for those 197 venues. Users see a filtered grid missing more than half the catalog. That's a broken filter UX at launch.

**Highest-traffic ski venues with 0 tags:**
Winter Park (3,980 reviews), Copper Mountain (3,720), Palisades Tahoe (3,540), Snowbird (3,380), Brighton (3,060), Solitude (2,820), Deer Valley (2,780), Crystal Mountain WA (2,640), Mt Bachelor (2,600), Sugar Bowl (2,420).

**Highest-traffic beach venues with 0 tags:**
Kaanapali Beach Maui, Waikiki Beach Oahu, Cancún Beach, Bali Seminyak, Patong Phuket, Playa del Carmen, Varadero Cuba, Langkawi Cenang, Ko Phi Phi Beach — all have 0 tags.

**Recommended fix:** Single targeted Edit pass enriching the top 30 ski + top 30 beach zero-tag venues. 3–4 tags each from a controlled vocabulary:
- Ski: `Powder Day`, `Off-Piste`, `Groomed Runs`, `Expert Terrain`, `Beginner Friendly`, `Tree Skiing`, `Après Ski`, `Night Skiing`, `Park & Pipe`, `Ski-In/Ski-Out`
- Beach: `Snorkeling`, `Surf Breaks`, `Family Friendly`, `Nightlife`, `Remote & Quiet`, `Crystal Clear Water`, `Coral Reef`, `Budget Friendly`, `Water Sports`

Estimated effort: 45 minutes. Zero structural risk — only adds array contents to existing empty `tags:[]` fields.

---

## 5. New Venue Additions — NONE THIS RUN

**Venue freeze is in effect per PM v68 (June 24).** 370 is sufficient for launch. The stale agent prompt requests 5 new venues — this contradicts the PM's explicit decision. No venues added.

Post-launch deferred pipeline (Plausible data first):
- Caribbean: Punta Cana (PUJ), Nassau (NAS) — need AP_CONTINENT + AIRPORT_COORDS entries before venues
- South America beach: Florianópolis, Cartagena
- Seoul ski: Seoul-area resorts (GMP/ICN)

---

## PM Note

**Tag thinness upgrades from P3 to P2.** PM v68 estimated "40 ski venues with single tags" — real number is 197 venues with empty tag arrays (63 ski + 134 beach). A user who taps any filter pill on Explore gets a grid where 53% of venues are invisible. This is launch-day user confusion, not July cosmetic debt.

**Recommended:** Move the tag enrichment pass to pre-launch or Day 1 post-launch, before the Reddit post drives traffic. It's a 45-minute surgical Edit pass, zero structural risk, and fixes the Explore filter experience before real users hit it.

Reddit post remains P0. This is the P2 to queue immediately after.
