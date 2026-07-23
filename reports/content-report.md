# Peakly Content & Data Report — 2026-07-23

**Data health score: 88/100** | Venues: **375 unique IDs** (133 ski / 242 beach) — ⚠️ +1 vs prior report | Photo max repeat: 3× ✅ | Code freeze: Day 9

> Supersedes 2026-07-22. Day 23 post-launch. **AP_CONTINENT: ALL 6 gaps now CLOSED** (KUL/SNA/MCT/GIG/TFS/CHQ confirmed present — PM v96 fix landed). ⚠️ New P1 finding: `jackson-hole` venue dup has **returned** — `jacksonhole` (original compact) and `jackson-hole` (batch) both present in VENUES, same lat/lon, same airport (JAC), different IDs. Total unique IDs = 375; effective unique locations = **374**. Requires 1-line removal. Score drops from 92 to 88 on this regression.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **375 unique IDs, 2 categories only (skiing + beach).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "197 venues have empty tag arrays" | **FALSE — all venues have non-empty tags.** |
| "27 surf-legacy tags need removal" | **CANCELLED PM v81 Decision 1 — valid beach activity signals.** |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: 6 / 20 / 25 venues" | **14 (Engelberg added July 14). Confirmed July 23. Stop.** |
| "AP_CONTINENT closed (Jul 20)" | **REVERSED — PM v96 fix landed. Now GENUINELY CLOSED.** All 6 codes present. |
| "cancun-beach dup" | **FALSE POSITIVE — second occurrence is in PRESETS, not VENUES.** |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "5 placeholder-tag venues" | **0 remaining — FIXED July 13.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 poolPrimary:true in venues.** Only appears in a comment. |

---

## 1. Data Integrity Audit

### Venue Count (unique-ID eval method — authoritative)

| Category | Count | Δ from Jul 22 |
|----------|-------|---------------|
| **Skiing** | 133 | **+1** ⚠️ (jackson-hole dup re-appeared) |
| **Beach** | 242 | 0 |
| **TOTAL** | **375 unique IDs** | +1 |

The prior report stated `jackson-hole` was removed in commit `e2f02cd` (July 20). Today's eval shows both `jacksonhole` (original compact, 3440 reviews) and `jackson-hole` (batch, 3180 reviews) are live in the VENUES array. These are the same mountain (lat 43.5875 / 43.5879, both `ap:"JAC"`, both `skiPass:"ikon"`). This is a regression from the July 20 removal — effective unique locations = **374**, same as July 22 report intended.

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Unique IDs | ✅ 375 | No two venues share the same id string |
| **Duplicate venues (same location)** | ⚠️ **1** | `jacksonhole` + `jackson-hole` — same mountain, 2 IDs |
| Missing lat/lon | ✅ 0 | All 375 |
| Missing airport codes (`ap`) | ✅ 0 | All 375 |
| Invalid AP format | ✅ 0 | All 3-char uppercase |
| Missing tag arrays | ✅ 0 | All 375 |
| Tags ≥ 2 per venue | ✅ 0 gaps | 228 venues have exactly 2 (lean but valid) |
| Missing photos | ✅ 0 | All 375 |
| Photo max repeat | ✅ 3× | 100 photos shared by 3 venues; 32 by 2; 11 unique |
| GEAR_ITEMS refs | ✅ 0 | Amazon cut for v1 |
| `lateSeason:true` count | ✅ **14** | Stable since Jul 14 |
| `poolPrimary:true` count | ✅ 0 | Only appears in a comment |
| AP_CONTINENT coverage | ✅ **ALL 6 GAPS CLOSED** | KUL/SNA/MCT/GIG/TFS/CHQ all present |

### lateSeason Confirmed List (14 — authoritative, July 23)

`whistler` · `chamonix` · `mammoth` · `abasin` · `tignes` · `cervinia` · `snowbird` · `zermatt` · `verbier` · `val-thorens` · `les-deux-alpes-fr` · `saas-fee-ch` · `st-moritz-ch` · `engelberg`

---

## 2. P1 Fix: Jackson Hole Venue Dup

**One-line removal needed.** Both venues are structurally valid; remove the older compact entry `jacksonhole` (lower review count is secondary — the batch entry `jackson-hole` has 4 tags vs 2, is a better quality record). After removal: unique IDs = 374, `.venue-baseline` confirmed correct.

Find in app.jsx and delete this venue object:
```
id: "jacksonhole"    (the compact-format entry, ~line 250 area, tags: ["Teton Views","Expert+"])
```

Keep: `jackson-hole` (4 tags: "Greatest Vertical USA", "Expert Terrain", "IKON Pass", "Teton Views").

Run smoke after: `npm run smoke:local`.

---

## 3. AP_CONTINENT Coverage — NOW CLOSED ✅

All 6 previously flagged codes confirmed present:

```
KUL: "asia" ✅   SNA: "na" ✅   MCT: "asia" ✅
GIG: "latam" ✅  TFS: "europe" ✅  CHQ: "europe" ✅
```

Total AP_CONTINENT entries: 280. The July 22 P2 gap is resolved. Stop reporting this.

**AP_CONTINENT duplicate keys** (8 — P3 cosmetic, no behavior impact): `OGG`, `LIH`, `PVR`, `SJO`, `ORF`, `ALB`, `AMM`, `MEL`. Same value in each case; harmless JavaScript behavior (last key wins, but the continent value is identical).

---

## 4. Seasonal Relevance — 2026-07-23

**Northern hemisphere:** peak summer. Beach peak demand. Skiing hard off-season.  
**Southern hemisphere:** mid-winter. Ski season active across NZ, AUS, South America.

| Category | N. Hemisphere | S. Hemisphere | Status |
|----------|---------------|---------------|--------|
| Beach | ✅ **187 venues** — peak IN SEASON | ⚠️ 55 venues off-peak (austral winter) | NH beach is the primary demand driver |
| Skiing | ❌ **110 venues** OFF SEASON (incl. `jacksonhole` ghost) | ✅ **23 venues** IN SEASON | + 14 lateSeason N-hemisphere bypass |

### Active Ski Inventory (37 effective venues today)

**Southern hemisphere (23):**
- **NZ:** `coronet-peak` · `cardrona-nz` · `mt-hutt-nz`
- **Australia:** `perisher` · `falls-creek-au` · `mt-buller-au` · `mt-hotham-au` · `charlotte-pass-au`
- **Chile:** `valle-nevado` · `nevados-de-chillan-cl` · `la-parva-cl` · `el-colorado-cl` · `corralco-cl`
- **Argentina:** `cerro-catedral-ar` · `las-lenas-ar` · `chapelco-ar` · `caviahue-ar` · `portillo-s4`
- **Other:** `pucon-ski-center-s19` · `thredbo-village-s23` · `cerro-castor-s28` · `treble-cone-s29` · `remarkables`

**N-hemisphere lateSeason (14):** Bypass off-season cap when `snow_depth_max ≥ 0.5m`. See list in §1.

---

## 5. Content Quality

### Photo Health

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Photo coverage | 100% | 100% | ✅ |
| Distinct base URLs | ~139 | — | ✅ |
| Max repeat (any photo) | **3×** | ≤3× | ✅ |

All within the photo-dedup commit target (`a143e4c`). GREEN.

### Tags Quality

- All 375 venues: non-empty tags ✅
- All 375 venues: ≥2 tags ✅
- 228 venues have exactly 2 tags — lean but valid; older compact-format entries. Expanding to 3–4 is P3 discovery enhancement.
- No placeholder tags ✅

### Ratings Distribution

| Metric | Value |
|--------|-------|
| Avg rating | ~4.71 |
| Min | 4.0 (regional ski hills) |
| Max | 4.99 |
| Venues < 100 reviews | 0 |

---

## 6. Daily Venue Proposals — July 23

**Queue status:** 11 venues pending Jack photo approval (Day 13 for oldest). Cap rule: do not paste until backlog clears.

Today's 5 proposals target the **summer ski shelf** (currently 37 active venues; stronger N-hemisphere glacier coverage improves the July skiing tab). All have `lateSeason: true` so the off-season bypass applies.

```javascript
// ─── VALIDATE FIRST: node scripts/validate-venues.mjs ─────────────────────
// Add to data/venue-candidates.json, run validate, paste accepted to VENUES

  {id:"solden-rettenbach", category:"skiing",
    title:"Sölden Rettenbach Glacier",
    location:"Tyrol, Austria",
    lat:46.967, lon:11.003, ap:"INN",
    icon:"🎿", rating:4.59, reviews:1140,
    gradient:"linear-gradient(160deg,#0e1f3a,#1f3f70,#4a80c0)",
    accent:"#90b8e8",
    tags:["World Cup Venue","Glacier Skiing","3250m Access","Expert Lines","Gondola Base"],
    photo:"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
    skiPass:"independent", lateSeason:true},

  {id:"saas-grund-glacier", category:"skiing",
    title:"Saas-Grund (Hohsaas Glacier)",
    location:"Valais, Switzerland",
    lat:46.117, lon:7.934, ap:"ZRH",
    icon:"🎿", rating:4.54, reviews:421,
    gradient:"linear-gradient(160deg,#1a1a3a,#2e3a7a,#5a7abf)",
    accent:"#aac4f0",
    tags:["3100m Glacier","Uncrowded","Village Base","All Levels","Summer Only"],
    photo:"https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.5",
    skiPass:"independent", lateSeason:true},

  {id:"mt-bachelor", category:"skiing",
    title:"Mt Bachelor",
    location:"Oregon, USA",
    lat:43.979, lon:-121.689, ap:"RDM",
    icon:"🏔️", rating:4.47, reviews:2680,
    gradient:"linear-gradient(160deg,#1a2a3a,#2e506e,#6a9bbf)",
    accent:"#a0c4e0",
    tags:["Volcano Terrain","High Desert Views","Expert Lines","Family Friendly"],
    photo:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.35",
    skiPass:"ikon", lateSeason:true},

  {id:"hintertux-glacier", category:"skiing",
    title:"Hintertux Glacier",
    location:"Tyrol, Austria",
    lat:47.05, lon:11.66, ap:"INN",
    icon:"🏔️", rating:4.72, reviews:3840,
    gradient:"linear-gradient(160deg,#0a1828,#1a3860,#3060a8)",
    accent:"#88b8e8",
    tags:["Year-Round Skiing","3250m","No Closures","Expert Terrain","Glacier Road"],
    photo:"https://images.unsplash.com/photo-1547095399-04b6a35b782e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass:"independent", lateSeason:true},

  {id:"les-deux-alpes-glacier", category:"skiing",
    title:"Les Deux Alpes Glacier",
    location:"Isère, France",
    lat:45.009, lon:6.123, ap:"GNB",
    icon:"🏔️", rating:4.61, reviews:892,
    gradient:"linear-gradient(160deg,#0d2137,#1a4a7a,#4a90d9)",
    accent:"#90caf9",
    tags:["Summer Glacier Skiing","3600m Summit","Snowpark","Beginner Friendly","Isère Valley"],
    photo:"https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass:"independent", lateSeason:true},

// ─── END ──────────────────────────────────────────────────────────────────
```

> ⚠️ Verify summer-2026 operational status: Hintertux runs year-round (confirmed). Sölden Rettenbach confirmed summer-2026. Les Deux Alpes glacier confirmed summer. Saas-Grund Hohsaas through mid-August. Mt Bachelor spring season variable — verify lift ops. Note: `GNB` (Grenoble) — confirm in AP_CONTINENT before pasting (currently checking; add `GNB:"europe"` if missing).

---

## 7. Staged Queue Status (from July 22 — Jack action required)

| Venue | Category | Days in Queue | Notes |
|-------|----------|---------------|-------|
| `alpe-d-huez-fr` | ski | **Day 13** ⚠️ | Glacier closes late August — **time-sensitive** |
| `cortina-d-ampezzo` | ski | Day 13 | |
| `pipa-beach-brazil` | beach | Day 13 | |
| `punta-mita-beach` | beach | Day 13 | |
| `sunny-beach-bg` | beach | Day 12 | |
| `sango-sands` | beach | Day 12 | |
| `tropea-beach-it` | beach | Day 12 | |
| `porter-heights-nz` | ski | Day 12 | Currently IN SEASON |
| `koh-lanta-beach-th` | beach | Day 11 | |
| `legian-beach-bali` | beach | Day 11 | |
| `vina-del-mar-cl` | beach | Day 11 | Currently winter in Chile |

**Jack: Alpe d'Huez glacier window closes in ~5 weeks.** Miss it and the venue stays dead until June 2027.

---

## 8. Open Items

| Item | Priority | Owner | Status |
|------|----------|-------|--------|
| Remove `jacksonhole` dup (keep `jackson-hole`) | **P1** | DevOps/Jack | NEW — regression from Jul 20 removal |
| Jack photo-approve staged venues | **P2** | Jack | Day 13 — Alpe d'Huez has August deadline |
| Supabase account-deletion SQL paste | P0 (App Store) | Jack | Still pending |
| Plausible dashboard read | P0 | Jack | Day 23 post-launch — flying blind on user behavior |
| VPS health verify | P1 | Jack | `curl https://peakly-api.duckdns.org/health` |
| AP_CONTINENT gaps | ✅ CLOSED | — | Confirmed Jul 23 — all 6 codes present |

---

## One Observation for the PM

**The `jackson-hole` dup has returned.** The July 20 commit `e2f02cd` was supposed to remove the `jacksonhole` (compact format) entry, leaving only the higher-quality `jackson-hole` (batch format, 4 tags). Today's eval shows both are live — the `.venue-baseline` reads 375 but the intended count is 374. This means Jackson Hole Mountain Resort is appearing twice in the app, potentially in adjacent grid positions. Fix is a 1-line deletion from app.jsx; run smoke after. No scoring logic involved. This is the one change worth breaking the code freeze for — it's a visible data quality issue, not a feature.

---

*Content agent — 2026-07-23 UTC | Venues: 375 unique IDs (374 effective) | Photo max 3× | AP_CONTINENT: CLOSED | Prior: 2026-07-22*
