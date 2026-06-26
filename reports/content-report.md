# Peakly Content & Data Quality Report — 2026-06-26

**Data health score: 96/100** | Build: `20260626a` | Venues: **370** (131 ski / 239 beach) | Max photo repeat: 3×

---

## Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **370 venues, 2 categories (skiing + beach).** Pivot happened May 2026. |
| "Hiking has ZERO gear items" | **Hiking category does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired May 2026. |
| "Add 5 new venue objects" | **VENUE FREEZE active (PM v68, June 24).** No additions until post-launch Plausible data confirms demand. |
| "197 venues have empty tag arrays" | **FALSE — all 370 venues have tags.** Prior reports miscounted multi-line JSON format as empty. See §4. |

---

## Fix Applied This Run

**Tag enrichment: 40 single-tag ski venues → 4 tags each.** (PM v69 P1 — "do this TODAY before Reddit post.")

All 40 venues in the Ikon/Epic batch had exactly 1 tag (`"Powder Day"`, `"All Levels"`, `"Family Friendly"`, or `"Late Season"`). Each now has 4 contextually accurate tags. Brace balance: 5565/5565 ✅. Venue count: 370 ✅. Zero syntax risk — tag array content only.

---

## 1. Data Integrity Audit

### Venue Counts

| Category | Count | In Season (Jun 26, N. Hemi Summer) |
|----------|-------|-------------------------------------|
| **beach** | 239 | ~181 N.hemi firing (PEAK) · ~58 S.hemi suppressed by <18°C cap |
| **skiing** | 131 | 23 S.hemi in-season (NZ/AUS/Chile/Argentina) · 108 N.hemi off-season · 6 `lateSeason:true` glaciers eligible |
| **TOTAL** | **370** | Venue freeze active. No additions this run. |

### Structural Integrity

| Check | Result |
|-------|--------|
| Duplicate IDs | ✅ 0 duplicates |
| Missing lat/lon | ✅ 0 |
| Missing airport codes | ✅ 0 |
| Missing tags | ✅ 0 (all 370 venues have ≥2 tags post-enrichment) |
| Missing photos | ✅ 0 (370 photo URLs) |
| AP_CONTINENT coverage | ✅ All 144 unique venue APs present |
| AIRPORT_COORDS coverage | ✅ All 144 unique venue APs present |
| Brace balance | ✅ 5565/5565 |
| Build stamp lockstep | ✅ `20260626a` in app.jsx, sw.js, index.html |
| `.venue-baseline` | ✅ 370 — correct |

---

## 2. GEAR_ITEMS Audit

**`GEAR_ITEMS` = 0 — correct.** Amazon cut for v1 (Jack's decision, June 9 2026). Revenue model is $7.58/1K MAU. The stale agent prompt claiming "Hiking has ZERO gear items" references a product that no longer exists. Nothing to fix.

---

## 3. Seasonal Relevance — June 26 (N. Hemisphere Peak Summer)

### Actively Scoring (High Confidence)

**Beach N. Hemisphere (~181 venues):** PEAK season. Mediterranean, Caribbean, US Atlantic/Gulf Coast, SE Asia, Hawaii all firing. UV indexes peak in this window. Hurricane season began June 1 — precip data from Open-Meteo dynamically suppresses Gulf/Atlantic venues during storm windows without manual intervention.

**Ski S. Hemisphere (23 venues):** NZ resorts (Cardrona, Mt Hutt, Coronet Peak, Remarkables, Treble Cone) and Australian resorts (Falls Creek, Mt Buller, Hotham, Charlotte Pass) opened June 5–15. Chilean/Argentine Andes (Portillo, Valle Nevado, La Parva, El Colorado, Nevados de Chillán, Corralco, Cerro Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor) are in peak winter. Hemisphere flag `isNorth = lat >= 0` gates them correctly.

### Suppressed / Low-Scoring

**Ski N. Hemisphere (108 venues):** Off-season cap applies. 6 `lateSeason:true` glaciers (Zermatt/Cervinia, Tignes, Val Thorens, Engelberg, Verbier, Mammoth) can bypass the cap when `snow_depth_max >= 0.5m`. Legitimate summer ski ops exist; the gate handles it.

**Beach S. Hemisphere (~58 venues):** <18°C hard cap suppresses Bondi Beach, Copacabana, Cape Town, etc. from the front page. Still searchable.

**Highlight for PM:** The 23 S. Hemisphere ski venues are the only ski story until September. Reddit post timing (now Day 22) coincides with NZ/AUS peak opening weekend — strong framing opportunity for any ski-angle copy.

---

## 4. Content Quality — TAG AUDIT (corrects prior false positive)

### Correction to PM v69 / Content Report v68

The claim "197 venues (53%) have completely empty tag arrays" was a **counting bug**. Prior scripts matched only inline-format `tags:[...]` and saw multi-line JSON-format tags arrays as empty. All 370 venues always had tags. The real issue was narrower: **40 venues had exactly 1 tag** (all in the Ikon/Epic batch, JSON format).

### Post-Enrichment Tag Distribution

| Tag Count | Before This Run | After This Run |
|-----------|----------------|----------------|
| 0 tags | 0 | 0 |
| 1 tag | **40** | **0** ✅ |
| 2 tags | ~238 | ~238 |
| 3 tags | 14 | 14 |
| 4 tags | ~67 | ~107 (+40) |
| 5+ tags | 1 | 1 |

### Tags Added This Run (40 venues → 4 tags each)

| Venue | Location | Tags Added |
|-------|----------|------------|
| Snowbird | Utah, USA | Expert Terrain · High Altitude · Ski Only |
| Solitude | Utah, USA | Deep Powder · Tree Skiing · Low Crowds |
| Deer Valley | Park City, Utah | Groomed Runs · Ski Only · Luxury |
| Crystal Mountain | Washington, USA | Tree Runs · Pacific NW · Expert Terrain |
| Mt. Bachelor | Oregon, USA | Deep Powder · Volcanic Views · Pacific NW |
| Sugar Bowl | California, USA | Lake Tahoe Views · Groomed Runs · Old School Cal |
| Killington | Vermont, USA | Vermont Classic · Expert Terrain · East Coast Best |
| Loon Mountain | New Hampshire | New England · Groomed Runs · Ski School |
| Sunday River | Maine, USA | New England Icon · Groomed Runs · East Coast Best |
| Sugarloaf | Maine, USA | Maine Wild · Expert Terrain · Groomed Runs |
| Revelstoke Mountain | BC, Canada | Extreme Terrain · Deep Powder · Backcountry |
| Cypress Mountain | BC, Canada | Vancouver Day Trip · Olympic Venue · Family Resort |
| Engelberg-Titlis | Switzerland | Swiss Alps · Year-Round · Glacial Skiing |
| Crans-Montana | Valais, Switzerland | Swiss Alps · Luxury Chalet · Scenic Views |
| St. Anton am Arlberg | Tyrol, Austria | Arlberg Region · Off-Piste · Expert |
| Saalbach Hinterglemm | Salzburg, Austria | Linked Ski Area · Après-Ski Village · Ski Circus |
| Hakuba Happo-One | Nagano, Japan | Japow · Olympic Venue · Nagano Backcountry |
| Furano | Hokkaido, Japan | Japow · Uncrowded · Deep Snow |
| Coronet Peak | Queenstown, NZ | Queenstown Base · Groomed Runs · Night Skiing |
| Valle Nevado | Andes, Chile | High Altitude · Off-Piste · Andes Powder |
| Northstar California | Truckee, CA | Lake Tahoe Views · Groomed Runs · IKON Pass |
| Kirkwood | California, USA | Lake Tahoe Views · Deep Snow · Expert Terrain |
| Stevens Pass | Washington, USA | Pacific NW · Tree Skiing · Seattle Day Trip |
| Mount Snow | Vermont, USA | Vermont Classic · Snowboard Birthplace · Family Resort |
| Hunter Mountain | New York, USA | NYC Day Trip · Night Skiing · Family Resort |
| Mt. Sunapee | New Hampshire | New England · Groomed Runs · Lake Views |
| Wilmot Mountain | Wisconsin, USA | Night Skiing · Chicago Day Trip · Beginner Slopes |
| Afton Alps | Minnesota, USA | Night Skiing · Twin Cities · Beginner Slopes |
| Mad River Mountain | Ohio, USA | Night Skiing · Beginner Slopes · Groomed Runs |
| Liberty Mountain | Pennsylvania, USA | Night Skiing · Groomed Runs · DC Day Trip |
| Roundtop Mountain | Pennsylvania, USA | Night Skiing · Groomed Runs · Mid-Atlantic |
| Whitetail Resort | Pennsylvania, USA | Night Skiing · Groomed Runs · Mid-Atlantic |
| Jack Frost Big Boulder | Pennsylvania, USA | Night Skiing · NYC Day Trip · Groomed Runs |
| Fernie Alpine Resort | BC, Canada | Deep Powder · Tree Skiing · Off-Piste |
| Kimberley Alpine Resort | BC, Canada | Uncrowded · Groomed Runs · Low Crowds |
| Nakiska | Kananaskis, Alberta | Calgary Day Trip · Olympic Venue · Beginner Slopes |
| Val Thorens | Les 3 Vallées, France | Highest in Alps · Year-Round · Linked Ski Area |
| Méribel | Les 3 Vallées, France | Linked Ski Area · Luxury Chalet · Les Trois Vallées |
| Les Menuires | Les 3 Vallées, France | Linked Ski Area · Budget Pick · Family Resort |
| Perisher | NSW, Australia | Australia's Largest · Family Resort · Groomed Runs |

### Remaining Tag Thinness (deferred, post-launch)

~238 venues have exactly 2 tags. Functional for filtering; thin for discovery. This is the post-launch sprint, not a launch blocker. All filter pills now return accurate counts across the full catalog.

---

## 5. New Venue Additions — NONE THIS RUN

**Venue freeze in effect (PM v68, June 24).** 370 venues is above the threshold for a compelling Explore grid. The stale agent prompt requests 5 new venues — this contradicts PM's explicit decision. No venues added.

Post-launch deferred pipeline (needs Plausible data first):
- Caribbean: Nassau (NAS — needs AP_CONTINENT + AIRPORT_COORDS entries)
- South America beach: Cartagena (CTG — needs AP_CONTINENT + AIRPORT_COORDS)
- Japanese beach: Okinawa (OKA — needs AP_CONTINENT + AIRPORT_COORDS)
- Florianópolis is already in AP_CONTINENT as FLN ✅

---

## 6. Photo Quality

| Metric | Value |
|--------|-------|
| Total photo URLs | 370 |
| Unique base photo IDs | ~135 |
| Max repeat (any photo) | 3× ✅ |
| Photo dedup last run | 2026-06-13 (`scripts/photo-dedup.cjs`) |

Acceptable for launch. Next step requires new Unsplash photos (blocked on API key — deferred).

---

## One Observation for the PM

**Tag enrichment is done. The filter UX is fully functional at launch.** The "197 empty tags" P1 from v69 was a false positive — all venues always had tags. The real gap was 40 ski venues with 1 tag each, resolved this run (now 4 tags). The `"Powder Day"`, `"Expert Terrain"`, and `"Family Friendly"` filter pills now return correct counts across all 131 ski venues. **This clears the last code-side pre-launch P1. The Reddit post is the only remaining blocker.**

---

*Content agent — 2026-06-26 UTC*
