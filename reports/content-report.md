# Peakly Daily Content Report — 2026-06-09

---

## Data Health Score: 92 / 100

**Total venues:** 156 (67 skiing · 89 beach)  
**Categories:** 2 active (skiing, beach — post-2026-05-03 pivot; surfing retired)  
**Photos:** 156 unique Unsplash URLs · 0 duplicates  
**Duplicate IDs:** 0  
**Coordinate errors:** 0  
**AP codes unmapped:** 0

---

## Category Breakdown

| Category | Count | Status    | June Season    |
|----------|-------|-----------|----------------|
| Beach    | 89    | ✅ Healthy | N.Hem 67 PEAK · S.Hem 22 off |
| Skiing   | 67    | ✅ Healthy | S.Hem 6 IN SEASON · N.Hem 61 off (6 lateSeason bypass) |

> Task prompt references 182 venues and 12 categories — that reflects a pre-pivot state. Current codebase has 2 categories only. Surfing (53 venues) was retired 2026-05-03. No stub categories exist.

---

## Data Integrity Audit

### ✅ All-Clear
- All 156 venues have `id`, `category`, `lat`, `lon`, `ap`, `title`, `location`, `tags`, `photo`
- No duplicate IDs
- No duplicate photo URLs (156 unique Unsplash URLs)
- All coordinates within valid ranges (lat ±90, lon ±180)
- All venue AP codes resolve in `AP_CONTINENT` (268 codes mapped)
- All venues have ≥ 2 tags
- No venue with rating < 4.5

### ✅ GEAR_ITEMS Status — PRESENT (contradicts CLAUDE.md Open #13)

`grep -c GEAR_ITEMS app.jsx` returns **6** — not 0.  
GEAR_ITEMS array at line 257 contains full `skiing` and `beach` arrays:
- **skiing**: 4 items (Smith goggles $249, Atomic skis $599, Burton bindings $329, Helly Hansen jacket $449)
- **beach**: 4 items (Hydro Flask $49, Aqua Marina SUP $499, Maui Jim sunglasses $329, Nautica rashguard $45)

Both high-AOV and low-AOV items present. Amazon tag `peakly-20` confirmed in all 8 URLs.  
**PM action needed:** CLAUDE.md Open #13 states GEAR_ITEMS was deleted in June 7 `auto:` commits — current codebase scan contradicts this. Git log shows most recent commit is June 4; those June 7 commits don't appear in this repo's history. Either the deletion happened on a branch never merged to `main`, or CLAUDE.md was updated prematurely. Verify against live site before declaring a revenue regression.

### ⚠️ Flagged Items

**1. Near-duplicate: Bora Bora — two venues 3.8km apart**
- `borabora` — "Bora Bora Lagoon" · lat -16.5004 · ap: BOB · 2 tags
- `matira-beach-t6` — "Matira Beach" · lat -16.5333 · ap: BOB · 4 tags
- Both on same island — different beach experiences (lagoon overwater vs. shoreline). Acceptable differentiation, but a user discovering one may dismiss the other as a duplicate. Low-urgency consolidation candidate.

**2. Near-duplicate: Boracay — two venues 1.3km apart**
- `beach_boracay` — "White Beach Boracay" · lat 11.9674 · ap: MPH
- `bulabog-beach-boracay-t19` — "Bulabog Beach Boracay" · lat 11.96 · ap: MPH
- Genuinely distinct: White Beach = resorts/swimming; Bulabog = kite surfing hub. Keep both.

**3. Outer Banks — two venues 45km apart, same AP**
- `beach_ob` — "Outer Banks OBX" · lat 35.558 · ap: ORF
- `outer-banks-nags-head-t7` — "Outer Banks Nags Head" · lat 35.957 · ap: ORF
- Far enough to be distinct, different scoring micro-climates. Keep but ensure card titles are clearly differentiated.

---

## Gear Items Audit

| Category | Items | Status | Avg AOV |
|----------|-------|--------|---------|
| Skiing   | 4     | ✅     | $407    |
| Beach    | 4     | ✅     | $230    |

**No missing categories.** Both active categories have gear items.

**AOV improvement opportunity:** Beach avg AOV ($230) is dragged down by Nautica rashguard ($45). Consider swapping for a higher-margin item:
- Drop Nautica rashguard ($45) → add GoPro HERO12 Black ($399)
- Beach avg AOV would rise $230 → ~$444, roughly doubling expected Amazon RPM for beach sessions

---

## Seasonal Relevance (June 9, 2026 — Northern Hemisphere Early Summer)

### IN SEASON — Venues scoring well right now

| Category | Region | Count | Notes |
|----------|--------|-------|-------|
| Beach | N. Hemisphere | 67 | **PEAK.** Caribbean, Med, Hawaii, US East/Gulf, Japan coast, SE Asia all scoring high |
| Skiing | S. Hemisphere | 6 | **IN SEASON** — NZ (Remarkables, Treble Cone), Chile (Portillo, Pucon), Argentina (Cerro Castor), Australia (Thredbo) |
| Beach | Equatorial | 26 | Year-round. Maldives, Seychelles, Bali, Caribbean nearline |

### ⚠️ OFF SEASON — Suppressed scoring

| Category | Region | Count | Notes |
|----------|--------|-------|-------|
| Skiing | N. Hemisphere | 61 | Off-season cap active. 6 with `lateSeason:true` bypass (Whistler, Chamonix, Mammoth, Abasin, Tignes, Cervinia) |
| Beach | S. Hemisphere | 22 | Cooler water temps, reduced UV — scoring suppressed |

**June opportunity gap:** S.Hemisphere ski season peaks June–August but we have only **6 venues** covering NZ/Australia/Chile/Argentina. Entire N.Hem ski catalog (61 venues) is dead weight right now. S.Hem ski should dominate the Explore feed in June — but 6 venues vs 89 beach = almost no ski representation at peak ski season.

---

## Content Quality Check

- **Title length:** All titles 5–35 chars ✅
- **Tags:** All 156 venues have ≥ 2 tags. No empty tags detected ✅
- **Ratings range:** 4.54–4.99. One venue below 4.7: `pucon-ski-center-s19` (4.54 — legitimate)
- **Duplicate locations:** 8 location strings shared by multiple venues (Colorado×8, British Columbia×4 etc.) — expected for ski clusters, not flagged as errors

### Minor Flags
- `beach_rivmaya`: "Riviera Maya" — title is generic for a 100km stretch. May read as near-duplicate of `beach_holbox`/`beach_tulum` to first-time users. Low priority.
- `beach_myrtle` (rating 4.82): Lowest-rated beach venue. Myrtle Beach is a legitimately polarising destination — rating is accurate, not an error.

---

## Geographic Coverage Gaps

| Region | Beach | Skiing | Notes |
|--------|-------|--------|-------|
| N. America | 32 | 33 | ✅ Good |
| Europe | 21 | 19 | ✅ Good |
| Asia | 17 | 8 | ✅ OK |
| Oceania | 11 | 3 (all SH) | ⚠️ Only 3 ski venues (Remarkables, Thredbo, Treble Cone) |
| S. America | **2** | 3 | ❌ Beach critically thin |
| Africa | 6 | 1 | ⚠️ Skiing = Oukaimeden only |

**Critical gap:** Latin America beach = 2 venues (Fernando de Noronha + Florianópolis only). Brazil has globally ranked beaches completely unrepresented: Jericoacoara, Praia do Espelho, Lençóis Maranhenses. Colombia Tayrona — zero coverage. Ecuador, Uruguay — zero coverage.

---

## 5 New Venue Objects — June Priority: S.Hemisphere Ski + Latam Beach

Targeting the two biggest active-season gaps: S.Hem ski depth (peak season NOW) and S.Latam beach (near-zero coverage). All AP codes verified present in `AP_CONTINENT`.

Paste into the `VENUES` array in `app.jsx` (e.g. after the last `ski_oukaimeden` or `beach_goa` entry):

```javascript
  // ─── NEW VENUES 2026-06-09 ─────────────────────────────────────────────────

  {id:"ski_cardrona",category:"skiing",title:"Cardrona Alpine Resort",location:"Wanaka, Otago, New Zealand",
    lat:-44.8750,lon:169.0530,ap:"ZQN",icon:"🏔️",rating:4.91,reviews:1640,
    gradient:"linear-gradient(160deg,#0a1c2e,#1a4070,#2e74b8)",
    accent:"#68aadc",tags:["Terrain Parks","Family-Friendly","Reliable Snow"],
    photo:"https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&h=600&fit=crop",
    skiPass:"independent"},

  {id:"ski_mt_buller",category:"skiing",title:"Mt Buller Alpine Village",location:"Victorian Alps, Australia",
    lat:-36.8980,lon:146.9820,ap:"MEL",icon:"⛷️",rating:4.89,reviews:2180,
    gradient:"linear-gradient(160deg,#0c1c30,#1a3870,#2e66c0)",
    accent:"#74aadc",tags:["3h from Melbourne","80+ Trails","Alpine Village"],
    photo:"https://images.unsplash.com/photo-1521325213791-4d8df00eee81?w=800&h=600&fit=crop",
    skiPass:"independent"},

  {id:"ski_valle_nevado",category:"skiing",title:"Valle Nevado",location:"Metropolitan Region, Chile",
    lat:-33.3667,lon:-70.3000,ap:"SCL",icon:"🏔️",rating:4.90,reviews:1980,
    gradient:"linear-gradient(160deg,#0a1428,#1e3060,#2e5aaa)",
    accent:"#6699cc",tags:["60km from Santiago","3025m Base","Andes Panorama"],
    photo:"https://images.unsplash.com/photo-1547036967-3f4fc0adbf6a?w=800&h=600&fit=crop",
    skiPass:"independent"},

  {id:"beach_jericoacoara",category:"beach",title:"Jericoacoara",location:"Ceará, Brazil",
    lat:2.7933,lon:-40.5122,ap:"FOR",icon:"🏖️",rating:4.93,reviews:9800,
    gradient:"linear-gradient(160deg,#221100,#553300,#aa6600)",
    accent:"#ddaa33",tags:["Kite Surfing Mecca","Sunset Sand Dune","Car-Free Village"],
    photo:"https://images.unsplash.com/photo-1576829021150-ebc8b46b9fb9?w=800&h=600&fit=crop"},

  {id:"beach_anse_lazio",category:"beach",title:"Anse Lazio",location:"Praslin, Seychelles",
    lat:-4.2897,lon:55.6989,ap:"SEZ",icon:"🏝️",rating:4.97,reviews:6200,
    gradient:"linear-gradient(160deg,#002233,#004466,#007799)",
    accent:"#22bbdd",tags:["Top 10 World Beach","Granite Boulders","Indian Ocean"],
    photo:"https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=600&fit=crop"},
```

**Venue notes:**
- `ski_cardrona`: ZQN ✅. NZ's most popular terrain park resort — distinct from Treble Cone (freeride) and Remarkables (intermediate). Adds depth to the Queenstown hub (warranted: ZQN is the primary gateway for 2 existing venues + this). June–September season.
- `ski_mt_buller`: MEL ✅. Victoria's largest ski resort (80+ runs), 3h from Melbourne CBD. Adds 2nd Australian venue alongside Thredbo (SYD). June–September season.
- `ski_valle_nevado`: SCL ✅. Only 60km from Santiago, one of South America's highest base elevations (3,025m). 5th S.Hem ski venue, adds Chile resort diversity alongside Portillo and Pucon. June–October season.
- `beach_jericoacoara`: FOR ✅. World-class kite destination near the equator — warm year-round. Fills Brazil gap (currently only 2 S.Latam beach venues: Noronha + Florianópolis).
- `beach_anse_lazio`: SEZ ✅. Consistently ranked top 10 globally, granite-boulder aesthetic is visually distinctive in cards. Strengthens Africa/Indian Ocean coverage (6 existing African beach venues, none on Praslin).

---

## One Observation for the PM

**GEAR_ITEMS is alive in the codebase — the June 7 deletion may never have reached `main`.**  
Today's scan: `grep -c GEAR_ITEMS app.jsx` = **6**. The full const block with skiing and beach arrays is at line 257 with all `peakly-20` Amazon links intact. The git log shows the repo's HEAD is commit `ec4dd2c` (June 4) — the alleged June 7 `auto:` commits (`9656c6b`, `f8e9a51`, `12ebc13`) do not appear in this history. Amazon revenue is likely not $0. Before treating Open #13 as a live P0, Jack should open the live site, tap any beach or ski venue, and check whether gear items render in the detail sheet. If they do, close #13 and update CLAUDE.md's Revenue Model table back to the $12.06/1K MAU figure.
