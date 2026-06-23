# Peakly Content & Data Quality Report — 2026-06-23

**Data health score: 89/100** | Build: 20260623b | Venues: 366 (130 ski / 236 beach) | Photos: 134 unique, 3× max

---

## 1. Data Integrity Audit

### Venue Counts

| Category | Count | In Season (June 23) | Notes |
|----------|-------|---------------------|-------|
| beach | 236 | 178 N.hemi (PEAK ✅) | 58 S.hemi out of season — scoring suppresses naturally |
| skiing | 130 | 23 S.hemi (IN ✅) | 107 N.hemi off-season; 26 have `lateSeason: true` |
| **TOTAL** | **366** | — | +5 added this run |

**Only 2 active categories.** Prompts referencing "12 categories" or stubs (hiking, surfing, climbing, MTB, etc.) are stale — those categories were retired in the May 2026 pivot and never re-enabled. No stub categories exist.

### Structural Integrity

| Check | Result |
|-------|--------|
| Duplicate IDs | ✅ 0 |
| Missing coordinates | ✅ 0 |
| Missing airport codes | ✅ 0 |
| Missing tags | ✅ 0 |
| Missing photos | ✅ 0 |
| Brace balance | ✅ 5561/5561 |
| AP_CONTINENT coverage | ✅ All 143 unique venue APs covered (279 total entries) |
| AIRPORT_COORDS coverage | ✅ All venue APs resolvable (GIG + CPT added this run) |

### Photo Duplicates

Max repeat: **3×** (within the invariant set by the June 13 dedup sprint). 128 photos appear on 2 or more venues; 5 of the 7 previously at 2× are now at 3× (used for the 5 new venues added this run). Pool still has 2 unused 2× slots if another batch lands before the next dedup pass.

---

## 2. Bugs Fixed This Run

### P1 — Killington `lateSeason: true` trust bomb (FIXED ✅)

**PM v66 flagged this explicitly.** Killington (VT) closes in late April. It carried `lateSeason: true` from a batch-paste inflation and could surface as a "skiing option" to a Boston user in July if Open-Meteo returns stale snow-depth data for the closed resort. Removed the flag. The `snow_depth_max >= 0.5m` gate is no longer relevant — Killington simply won't score as skiing in summer now. Zero user-facing impact for the current season.

### P0-class data issue flagged (NOT fixed this run — needs PM decision)

**`tahoe` and `palisades-tahoe` are the same mountain.** Both IDs point to "Palisades Tahoe", CA (RNO), at virtually identical coordinates (39.1959, -120.2357 vs 39.1969, -120.2356). They have different photos, different ratings, and different tags — so this isn't a rendering crash, just a data quality issue that inflates the ski catalog by 1 and confuses users who might see two identical-name cards on the Explore grid.

Recommended fix: delete the `tahoe` entry (the less descriptive ID). Risk: any user with `tahoe` in their wishlist loses it. At <10 pre-launch users, acceptable. Needs PM sign-off before execution.

---

## 3. GEAR_ITEMS Audit

`grep -c GEAR_ITEMS app.jsx` → **0**. Correctly absent. Amazon cut for v1 (Jack's call, June 2026). Revenue model is $7.58/1K MAU via Booking.com + SafetyWing + Travelpayouts. Table matches code.

---

## 4. Seasonal Relevance — June 23 (N. Hemisphere Summer Peak)

**What's in season:**
- Beach, N.hemi: **178 venues** — prime time. US beaches, Mediterranean, Caribbean scoring high.
- Ski, S.hemi: **23 venues** — NZ (Coronet Peak fixed ✅ — `lateSeason` removed by DevOps June 23; Cardrona, Remarkables, Treble Cone, Mt Hutt), Australia (Falls Creek, Buller, Hotham, Charlotte Pass, Thredbo, Perisher), Chile (Portillo, Valle Nevado, La Parva, El Colorado, Nevados de Chillán, Corralco), Argentina (Cerro Catedral, Las Leñas, Chapelco, Caviahue), Cerro Castor (USH). **This is the app's ski story through August.**

**Out of season / deprioritized:**
- Ski, N.hemi: 107 venues. 26 carry `lateSeason: true` for high-altitude glaciers (Zermatt, Tignes, Val Thorens, Engelberg, Verbier, Mammoth, Arapahoe Basin, etc.). Killington no longer in that 26 (fixed this run).
- Beach, S.hemi: 58 venues (Australia, Brazil, southern Africa). Water temps will hit the <18°C hard cap, suppressing them from the front page.

**Latent risk still open:** Sugarloaf (ME, 1,230m) still has `lateSeason: true` and is also closed in summer. Deferred to July sprint with the other 20 candidates per PM v65.

---

## 5. Content Quality

All 366 venues have: tags, photo, icon, rating, reviews, gradient, accent, lat, lon, ap. No description field in the schema — by design (cards use title + location + tags).

**Tag thinness in ski catalog:** 40+ ski venues have only 1–2 tags, limiting "Powder Day" and "Off-Piste" filter discoverability. PM deferred tag enrichment to the July sprint — low priority before Reddit post.

---

## 6. New Venues Added This Run — 366 total (was 361)

All 5 applied directly to app.jsx. Photos from vetted pool (data/photo-pool.json), using 2× → 3× slots. AIRPORT_COORDS entries for GIG and CPT added to the coords block above VENUES.

```js
// 1. Asbury Park Beach — EWR (New Jersey) · PM v66 priority · US East Coast gap
{id:"asbury-park-beach-nj", category:"beach",
  title:"Asbury Park Beach", location:"New Jersey, USA",
  lat:40.2204, lon:-73.9957, ap:"EWR",
  icon:"🏖️", rating:4.72, reviews:6800,
  gradient:"linear-gradient(160deg,#001828,#003050,#005080)",
  accent:"#4090c0",
  tags:["NYC Day Trip","Boardwalk Revival","Atlantic Waves","Music Scene"],
  photo:"https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&h=600&fit=crop"},

// 2. Flamenco Beach — SJU (Culebra, Puerto Rico) · PM v66 priority · ranked #1 US beach
{id:"flamenco-beach-culebra", category:"beach",
  title:"Flamenco Beach", location:"Culebra, Puerto Rico",
  lat:18.3121, lon:-65.3041, ap:"SJU",
  icon:"🏖️", rating:4.96, reviews:11200,
  gradient:"linear-gradient(160deg,#002040,#004080,#0070c0)",
  accent:"#40a8e0",
  tags:["Caribbean Turquoise","Ranked US Best Beach","Car-Free Island","Snorkeling Reefs"],
  photo:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop"},

// 3. Zuma Beach Malibu — LAX · PM v66 priority · LA coast gap
{id:"zuma-beach-malibu", category:"beach",
  title:"Zuma Beach Malibu", location:"Malibu, California",
  lat:34.0195, lon:-118.8222, ap:"LAX",
  icon:"🌊", rating:4.84, reviews:14600,
  gradient:"linear-gradient(160deg,#001830,#003060,#005090)",
  accent:"#3c9ed0",
  tags:["Pacific Coast Highway","Pacific Sunsets","Surf Break","Canyon Hiking Access"],
  photo:"https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=800&h=600&fit=crop"},

// 4. Clifton Fourth Beach — CPT (Cape Town) · PM v66 Decision 3 · June 23 sprint
// CPT:{lat:-33.9648,lon:18.6017} added to AIRPORT_COORDS. CPT:"africa" in AP_CONTINENT ✅
{id:"clifton-fourth-beach-cpt", category:"beach",
  title:"Clifton Fourth Beach", location:"Cape Town, South Africa",
  lat:-33.9414, lon:18.3794, ap:"CPT",
  icon:"🏖️", rating:4.91, reviews:18400,
  gradient:"linear-gradient(160deg,#001828,#003850,#006888)",
  accent:"#30a0c8",
  tags:["Table Mountain Backdrop","White Sand","Year-Round","Boulders Penguins Nearby"],
  photo:"https://images.unsplash.com/photo-1437846972679-9e6e537be46e?w=800&h=600&fit=crop"},

// 5. Ipanema Beach — GIG (Rio de Janeiro) · PM v66 Decision 3 · June 23 sprint
// GIG:{lat:-22.8100,lon:-43.2507} added to AIRPORT_COORDS. GIG:"latam" in AP_CONTINENT ✅
{id:"ipanema-rio", category:"beach",
  title:"Ipanema Beach", location:"Rio de Janeiro, Brazil",
  lat:-22.9863, lon:-43.2044, ap:"GIG",
  icon:"🏝️", rating:4.88, reviews:28400,
  gradient:"linear-gradient(160deg,#001830,#003060,#005898)",
  accent:"#42a2d8",
  tags:["Iconic Urban Beach","Year-Round Sun","Sunset Caipirinha Scene","Sugarloaf Views"],
  photo:"https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&h=600&fit=crop"},
```

Cache bumped to `20260623b`. `.venue-baseline` updated 361 → 366. All changes in this commit.

---

## 7. One Observation the PM Should Know

**`tahoe` and `palisades-tahoe` are a silent duplicate — same mountain showing twice on the Explore grid before Reddit launch.**

A user scrolling ski venues will see two cards titled "Palisades Tahoe" from the same airport (RNO) at what appears to be the same location. This is the kind of thing an early adopter screenshots and posts as "it shows duplicate resorts lol." Fix is a one-line delete of the `tahoe` entry. At <10 pre-launch users, migration risk is negligible. Content agent can execute immediately if PM approves — it's a 2-minute fix.

---

*Report generated: 2026-06-23 | Audited: 366 venues | Categories: skiing (130), beach (236) | Photos: 134 unique, max 3× | Brace balance: 5561/5561 | Build: 20260623b*
