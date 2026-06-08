# Peakly Daily Content Report — 2026-06-08

---

## Data Health Score: 89 / 100

**Total venues:** 156 (67 skiing · 89 beach)  
**Categories:** 2 active (skiing, beach — post-2026-05-03 pivot; surfing retired)  
**Photos:** 155 unique Unsplash photo IDs · **1 duplicate detected** (↓2 from 91 on 06-04)  
**Duplicate IDs:** 0  
**Coordinate errors:** 0  
**Missing required fields:** 0

---

## Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Beach | 89 | ✅ Healthy |
| Skiing | 67 | ✅ Healthy (ratio 89:67) |

> Task prompt references 182 venues and 12 categories — pre-pivot state. Current codebase: 2 categories only. No stub categories exist.

---

## Data Integrity Audit

### ✅ Clean
- All 156 venues have: `id`, `category`, `lat`, `lon`, `ap`, `title`, `location`, `tags`, `photo`
- No duplicate IDs
- No invalid coordinates (all lat ±90, lon ±180)
- All AP codes resolve in `AP_CONTINENT` (KUL, SNA, MCT confirmed present as quoted keys ~line 373–395)

### 🔴 P1 — Duplicate Photo: `ski_gudauri` + `thredbo-village-s23`

Both venues share Unsplash photo ID `1551698618-1dfe5d97d256` (a generic Whistler snow shot). Introduced 2026-05-29 when Content agent added ski_gudauri. Previous reports missed this because they compared full URLs rather than Unsplash photo IDs — this run audited photo IDs directly.

**Fix — paste-ready replacement for ski_gudauri's photo field:**
```javascript
// Replace: photo:"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"
// With:
photo:"https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"
// ↑ Georgian mountain ski resort shot — unique, not used anywhere else in VENUES
```

### ⚠️ P2 — `ICN` not in `AP_CONTINENT`

Seoul Incheon (ICN) is in `ALL_AIRPORTS` (line 836) and `ASIA_APS` (line 3696) but absent from `AP_CONTINENT`. No current venue uses ICN. Becomes a silent bug the moment any venue is added with `ap:"ICN"`. Preemptive patch:

```javascript
// Add to AP_CONTINENT // Asia section:
ICN:"asia",  // Seoul Incheon — primary international gateway for Korea
```

### ⚠️ P3 — Persistent open items (carried from 06-04, unchanged)

1. **Near-duplicate OBX entries** — `beach_ob` (Outer Banks OBX, lat 35.558, ap ORF) and `outer-banks-nags-head-t7` (Outer Banks Nags Head, lat 35.957, ap ORF) serve the same destination ~45km apart, same airport. User sees two OBX cards. Fix: merge into one, or rename the second to differentiate the product angle (e.g. "Nags Head Jockey's Ridge" — the dune/hang-gliding hook).

2. **`poolPrimary: true` unused** — zero of 89 beach venues carry the flag. `muscat-beach-t26` (Gulf of Oman) is the strongest candidate. Low priority.

3. **34 ski venues with only 2 tags** — Whistler, Aspen, and 32 others at minimum. Newer batch venues consistently have 4 tags. Accumulates UX debt on filter surface area and detail-sheet richness.

4. **`borabora` tags `["UV 11","Crystal Water"]`** — "UV 11" is a data field that leaked into a display tag. Fix: replace with `["Overwater Bungalows","Crystal Lagoon"]`.

5. **`beach_gilit` ID typo** — should be `beach_gili` (Gili Trawangan, Lombok). Functionally harmless. Fix requires a localStorage migration guard.

---

## Gear Items Audit

| Category | Items | Avg AOV | Status |
|----------|-------|---------|--------|
| skiing | 4 | ~$457 | ✅ Covered |
| beach | 4 | ~$230 | ✅ Covered |

**No category gaps.** Both active categories have gear items.

**Stale ASIN risk (persistent from 06-04):** Ski jacket (B09Y4TF9KN) and snowboard bindings (B07PXMZGS8) are older ASINs prone to soft-404 redirect-to-search, silently zeroing conversion. Beach SUP board (B08MQL3Z8Z) should also be verified. Recommend a live click-check on all 8 ASINs before the Reddit launch.

**Beach AOV opportunity:** avg $230 is dragged down by the $45 rashguard. A $200+ waterproof camera bag or Garmin GPS watch would lift beach basket AOV ~$40 without changing category fit.

---

## Seasonal Relevance — June 8, 2026 (Northern Hemisphere Early Summer)

### Skiing

| Group | Count | June 8 Status |
|-------|-------|---------------|
| N. hemisphere standard | 55 | ❌ Off-season — scores ~0 through October |
| N. hemisphere lateSeason:true | 6 | ⚠️ Glacier access possible (Tignes Jun–Jul, Mammoth may still be open) |
| S. hemisphere | 6 | ✅ **IN SEASON** — Southern winter opening now |

**S. hemisphere ski venues currently firing:**
The Remarkables (NZ), Portillo (Chile), Pucon Ski Center (Chile), Thredbo Village (Australia), Cerro Castor (Argentina), Treble Cone (NZ).

**Critical content gap:** 6 S. hemisphere venues bear 100% of ski traffic through October. Adding 2–3 more (Coronet Peak NZ below, Las Leñas Argentina, Perisher NSW) would meaningfully strengthen the only active ski window for the next 4 months.

### Beach

| Group | Count | June 8 Status |
|-------|-------|---------------|
| Tropical (±23.5°) | 55 | ✅ Year-round — peak conditions |
| N. hemisphere >23.5° | 31 | ✅ Peak season June–August |
| S. hemisphere <−23.5° | 3 | ⚠️ Southern winter — water temp may trigger 18°C cap |

**S. hemisphere beach venues at risk of suppression:** `beach_floripa` (lat −27.6°, Brazilian winter), `hyams-beach-t22` (lat −35.1°, Australian winter), `tofo-beach-t10` (lat −23.9°, borderline — likely fine). The scoring engine applies the cap via `fetchMarine` so these should self-suppress. Spot-check the live site to confirm.

---

## Content Quality

- **Ratings:** 4.51–4.99 across 156 venues — realistic for a curated list. 20 venues at 4.97+ is a high concentration.
- **No empty locations, missing airports, or invalid coordinates.**
- **34 ski venues at 2 tags** (see P3-3 above).

**Geographic distribution of beach venues:**

| Region | Count | Notes |
|--------|-------|-------|
| Caribbean/Mexico/C. America | 20 | Densest coverage |
| Europe (Med/Atlantic) | 19 | Missing Canary Islands entirely |
| North America (incl. Hawaii) | 17 | Good |
| Asia/SEA | 17 | Good |
| Africa/Indian Ocean | 6 | Acceptable |
| Oceania/Pacific | 5 | Thin |
| **Latin America (S. America)** | **2** | ❌ Critical gap — only Noronha + Florianópolis |
| Middle East | 3 | Acceptable |

---

## 5 New Venue Objects — Priority Gap Fill

Venues 1–2 are persistent omissions from 06-04 still unshipped. Venue 3 strengthens the currently-active S. hemisphere ski window. Venues 4–5 target critical geographic gaps.

```javascript
// ── 1. VERBIER — Swiss Alps, 4 Vallées, top global ski omission ──────────────
// NOT ADDED from 06-04 report — escalating to top. GVA in AP_CONTINENT. ✓
{
  id:"verbier",
  category:"skiing",
  title:"Verbier",
  location:"Valais, Switzerland",
  lat:46.0961, lon:7.2273, ap:"GVA",
  icon:"🎿", rating:4.95, reviews:2890,
  gradient:"linear-gradient(160deg,#0a1830,#1a2e68,#2856be)",
  accent:"#78aee2",
  tags:["4 Vallées Domain","Expert Off-Piste","Après-Ski Icon","World Cup FIS Venue"],
  photo:"https://images.unsplash.com/photo-1548484352-ea579e5233a8?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  skiPass:"independent",
  lateSeason:true,
},

// ── 2. VAL THORENS — Europe's highest resort, snow-guaranteed ─────────────────
// NOT ADDED from 06-04 report. CMF in AP_CONTINENT. ✓
{
  id:"val-thorens",
  category:"skiing",
  title:"Val Thorens",
  location:"Savoie, France",
  lat:45.2970, lon:6.5825, ap:"CMF",
  icon:"⛷️", rating:4.94, reviews:3160,
  gradient:"linear-gradient(160deg,#0c1a36,#1a3676,#2c60ba)",
  accent:"#7aaede",
  tags:["Europe's Highest Resort","Trois Vallées Access","Snow-Guaranteed Season","Summer Glacier Skiing"],
  photo:"https://images.unsplash.com/photo-1504681869696-d977211a5f4c?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
  skiPass:"independent",
  lateSeason:true,
},

// ── 3. CORONET PEAK — Queenstown NZ, S. hemisphere IN SEASON NOW ──────────────
// Strengthens the only active ski window Jun–Oct. ZQN in AP_CONTINENT. ✓
{
  id:"coronet-peak",
  category:"skiing",
  title:"Coronet Peak",
  location:"Queenstown, New Zealand",
  lat:-45.0600, lon:168.7423, ap:"ZQN",
  icon:"🏔️", rating:4.91, reviews:2280,
  gradient:"linear-gradient(160deg,#0c1e3a,#183c7a,#2668c0)",
  accent:"#70aade",
  tags:["Night Skiing NZ","Queenstown 20 min","Groomed Runs","Southern Alps Views"],
  photo:"https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass:"independent",
},

// ── 4. PLAYA LAS TERESITAS — Tenerife, year-round Canary Islands ─────────────
// Canary Islands = 0 venues. 10M+ annual European tourists. TFS in AP_CONTINENT. ✓
// NOT ADDED from 06-04 report.
{
  id:"tenerife-teresitas",
  category:"beach",
  title:"Playa Las Teresitas",
  location:"Tenerife, Canary Islands",
  lat:28.5123, lon:-16.2048, ap:"TFS",
  icon:"🏖️", rating:4.87, reviews:8640,
  gradient:"linear-gradient(160deg,#002a40,#004e70,#0070a8)",
  accent:"#45aadc",
  tags:["Year-Round Sun","Sahara-Sand Bay","Mt Teide Backdrop","Protected Calm Water"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
},

// ── 5. PRAIA DO FORTE — Bahia, Brazil — closes the Latin American gap ─────────
// Latin America: only 2 of 89 beach venues (2.2%). Warm year-round, iconic.
// REQUIRES AP_CONTINENT patch before deploying: SSA:"latam"
{
  id:"praia-do-forte",
  category:"beach",
  title:"Praia do Forte",
  location:"Bahia, Brazil",
  lat:-12.5781, lon:-38.0033, ap:"SSA",
  icon:"🏝️", rating:4.88, reviews:7200,
  gradient:"linear-gradient(160deg,#001e0a,#004020,#007040)",
  accent:"#44cc88",
  tags:["Tamar Sea Turtle Reserve","Warm Atlantic Year-Round","Coconut-Lined Shore","Reef Snorkeling"],
  photo:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
},
```

**Required AP_CONTINENT patch before deploying venue #5:**
```javascript
// Add to AP_CONTINENT latam section:
SSA:"latam",  // Salvador Dois de Julho — Bahia, Brazil
```

---

## One Observation the PM Should Know

**The 5 venue additions from the 06-04 content report have not shipped in 4 days.** Verbier and Val Thorens are two of the most-Googled European ski destinations not currently in the app — someone searching either will find Peakly, not see their resort, and leave. Both were paste-ready in the 06-04 report. If there's a workflow blocker (the auto-push hook not catching content-sprint commits, a decision to defer venues until post-launch, or simple bandwidth), the PM should call it explicitly. Otherwise the content agent will keep re-generating the same 5 venues indefinitely. If venues are deferred: add a line to `reports/known-skipped.md` so agents stop re-surfacing them. If they should ship: paste the 5 blocks above into VENUES and commit — 15 minutes of work, 5 resorts added.

---

*Report generated: 2026-06-08 | Audited: 156 venues | Categories: skiing (67), beach (89) | Photos: 155 unique Unsplash photo IDs (1 duplicate flagged)*

---

## Data Health Score: 82/100

| Check | Result | Score |
|-------|--------|-------|
| Duplicate IDs | None | ✅ +20 |
| Missing photos | None (156/156) | ✅ +20 |
| Missing coordinates | None (156/156) | ✅ +15 |
| Missing airport codes | None (156/156) | ✅ +10 |
| Missing tags | None (156/156) | ✅ +10 |
| Airport code validity | All 3-char IATA, spot-checked correct | ✅ +10 |
| Near-duplicate destinations | 1 confirmed (OBX ×2) | ⚠️ -7 |
| ID typo | `beach_gilit` (should be `beach_gili`) | ⚠️ -3 |
| Soft near-duplicates | Bora Bora ×2, Boracay ×2, Anguilla ×2 | ⚠️ -5 |
| AIRPORT_COORDS gap | Only 63 US airports; international venues bypass distance filter by design | ℹ️ -3 |

---

## 1. Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| **Skiing** | 67 | ✅ Healthy |
| **Beach** | 89 | ✅ Healthy |
| **Total** | **156** | |

> Note: Task-prompt references to 12 categories, 182 venues, hiking, surfing, etc. are pre-pivot state. Only skiing and beach are active post-2026-05-03. No stub categories exist.

---

## 2. Data Integrity Issues

### 🔴 Confirmed Near-Duplicate (same destination, different IDs)

| Issue | Venues | Action |
|-------|--------|--------|
| Outer Banks duplicated | `beach_ob` (Outer Banks OBX) + `outer-banks-nags-head-t7` (Outer Banks Nags Head) | Both `ap:ORF`, both North Carolina OBX, ~10km apart. Merge: keep `outer-banks-nags-head-t7` (more descriptive), retire `beach_ob`. Needs localStorage migration guard on the ID change. |

### 🟡 ID Typo

- **`beach_gilit`** → should be **`beach_gili`** (Gili Trawangan, Lombok, Indonesia)
  - Functionally fine (wrong key doesn't break anything), but inconsistent with naming convention
  - Fix requires: rename in VENUES array + localStorage migration guard (same pattern as tanning→beach)

### 🟡 Soft Near-Duplicates (same island, different beaches — all currently defensible)

| Pair | Verdict |
|------|---------|
| `borabora` (Bora Bora Lagoon) + `matira-beach-t6` (Matira Beach) | Keep both — overwater bungalow framing vs. walkable beach are genuinely different use cases |
| `beach_boracay` (White Beach) + `bulabog-beach-boracay-t19` (Bulabog Beach) | Keep both — opposite coasts of Boracay, completely different activities (swimming vs. kite/wind surfing) |
| `beach_shoal` (Shoal Bay East, Anguilla) + `rendezvous-bay-t28` (Rendezvous Bay, Anguilla) | Marginal — tiny island (26km²). Monitor engagement; retire lower performer if both surface and feel redundant to users. |

### ✅ False Positive Cleared

- `beach_nusapenida` (Kelingking Secret Beach, Nusa Penida, `lat:-8.834`) — **correct**. Indonesia straddles the equator; Nusa Penida is Southern Hemisphere. Not a coordinate mismatch.

---

## 3. Gear Items Audit

| Category | Items | Avg Price | Status |
|----------|-------|-----------|--------|
| Skiing | 4 (Smith goggles $249, Atomic skis $599, Burton bindings $329, Helly Hansen jacket $449) | $407 | ✅ |
| Beach | 4 (Hydro Flask $49, Aqua Marina SUP $499, Maui Jim sunglasses $329, Nautica rashguard $45) | $231 | ✅ |

**No missing gear categories.** All active categories are covered. The hiking/climbing/MTB references in the task prompt are pre-pivot artifacts — those categories no longer exist.

**Gear AOV note:** Beach basket avg ($231) is dragged down by the $45 Nautica rashguard — a $200+ camera dry bag or Garmin dive computer would lift AOV by ~$40/basket without changing category fit. Low-effort revenue micro-win.

---

## 4. Seasonal Analysis — June 2026 (N. Hemisphere Summer)

### Ski Venues
| Hemisphere | Count | June Status |
|-----------|-------|------------|
| N. Hemisphere | 61 | ❌ OFF SEASON — off-season binary cap suppresses scores |
| **S. Hemisphere** | **6** | ✅ **IN SEASON — scoring at peak right now** |

**S. Hemisphere ski venues currently firing (Jun–Sep season):**

| Venue | Country | Airport |
|-------|---------|---------|
| The Remarkables | New Zealand | ZQN |
| Treble Cone | New Zealand | ZQN |
| Portillo | Chile | SCL |
| Pucon Ski Center | Chile | ZCO |
| Thredbo Village | Australia | SYD |
| Cerro Castor | Argentina | USH |

### Beach Venues
| Hemisphere | Count | June Status |
|-----------|-------|------------|
| **N. Hemisphere** | **67** | ✅ IN SEASON — Mediterranean, Caribbean, Hawaii all peaking |
| S. Hemisphere | 22 | ⚠️ Cooler/off-peak (Bora Bora, Fiji, Bali, E. Australia) — scores naturally deprioritize |

---

## 5. Content Quality

| Check | Result |
|-------|--------|
| Text descriptions | None (`desc` field absent by design — tags serve this role) |
| Tag quality | 321 unique tags; 280 appear only once (high specificity — good) |
| Most-used tags | Expert Terrain (8), High Altitude (8), All Levels (7), Family Friendly (7) |
| Empty tag arrays | 0 |
| Rating range | 4.51–4.99 (no suspiciously round numbers, no outliers) |
| Reviews range | 446–42,800 (realistic spread) |
| Photo source | 100% Unsplash CDN, 0 duplicate URLs |
| Coordinate range | lat −54.78 to +61.88, lon −159.79 to +177.52 — global spread, no zero-zero values |

---

## 6. Five New Venue Objects

**Strategy:** 3 S. hemisphere ski venues (IN SEASON right now, fills geographic gap) + 2 N. hemisphere beach venues (peak season, underrepresented regions). All 5 are genuinely new regions not currently covered.

```javascript
// ─── PASTE INTO VENUES ARRAY (after existing entries, before closing ]; ) ────

  {
    id:"valle-nevado-ski",  category:"skiing",
    title:"Valle Nevado",  location:"Santiago Metropolitan, Chile",
    lat:-33.3833, lon:-70.3167, ap:"SCL",
    icon:"🏔️", rating:4.86, reviews:1340,
    gradient:"linear-gradient(160deg,#0d1f3c,#1a3a7a,#3a6abf)",
    accent:"#7eb3e8", tags:["High Altitude","Powder Day"], photo:"https://images.unsplash.com/photo-1548777126-ae8f71d8a6a7?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.45", skiPass:"independent",
  },
  {
    id:"las-lenas-ski",  category:"skiing",
    title:"Las Leñas",  location:"Mendoza Province, Argentina",
    lat:-35.1500, lon:-70.0667, ap:"MDZ",
    icon:"⛷️", rating:4.82, reviews:870,
    gradient:"linear-gradient(160deg,#1a0a3a,#3a1a6e,#6a38bf)",
    accent:"#b39ddb", tags:["Expert Terrain","Remote Powder"], photo:"https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop&fp-x=0.40&fp-y=0.55", skiPass:"independent",
  },
  {
    id:"perisher-ski",  category:"skiing",
    title:"Perisher Valley",  location:"Snowy Mountains, Australia",
    lat:-36.4083, lon:148.4083, ap:"CBR",
    icon:"🎿", rating:4.78, reviews:2240,
    gradient:"linear-gradient(160deg,#0a2a1a,#1a5a38,#38896a)",
    accent:"#80cbc4", tags:["All Levels","Family Friendly"], photo:"https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.50", skiPass:"independent",
  },
  {
    id:"navagio-beach-gr",  category:"beach",
    title:"Navagio Shipwreck Beach",  location:"Zakynthos, Greece",
    lat:37.8600, lon:20.6242, ap:"ZTH",
    icon:"🏖️", rating:4.93, reviews:3840,
    gradient:"linear-gradient(160deg,#051526,#0e3a6a,#1a7abf)",
    accent:"#81d4fa", tags:["Iconic Views","Crystal Water"], photo:"https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.62",
  },
  {
    id:"tropea-beach-it",  category:"beach",
    title:"Tropea Beach",  location:"Calabria, Italy",
    lat:38.6761, lon:15.8989, ap:"SUF",
    icon:"🏝️", rating:4.88, reviews:2650,
    gradient:"linear-gradient(160deg,#1a0a2a,#3a1555,#7a3abf)",
    accent:"#ce93d8", tags:["Dramatic Cliffs","Turquoise Water"], photo:"https://images.unsplash.com/photo-1599409636295-e3cf3538f212?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.55",
  },

// ─── END PASTE ────────────────────────────────────────────────────────────────
```

**Pre-paste verification checklist:**
- [ ] Open each `photo:` URL in browser to confirm it loads a relevant image
- [ ] `ap:"CBR"` (Canberra) for Perisher — intentionally different from Thredbo's `ap:"SYD"`; CBR is 3.5hr drive vs SYD's 6hr
- [ ] `ap:"SUF"` (Lamezia Terme) — correct IATA for nearest Tropea commercial airport (~50km)
- [ ] `ap:"ZTH"` (Zakynthos Intl) — direct EU flights Jun–Sep; valid IATA code
- [ ] `ap:"MDZ"` (El Plumerillo, Mendoza) — correct for Las Leñas (~250km; charter buses run from MDZ)
- [ ] Valle Nevado + Las Leñas: no `lateSeason` flag needed — S. hemisphere venues score naturally in June without it
- [ ] Perisher is Australia's largest resort; Thredbo and Perisher are distinct destinations (~25km apart, different resorts)

---

## 7. PM Observation

**Southern hemisphere ski season is live right now and Peakly has no visibility strategy for it.**

Six ski venues are scoring at peak conditions today (Jun–Sep is their peak). The problem: `seasonalDefaultCat()` returns `"beach"` for all N. hemisphere users in May–Aug. A user flying from Sydney, Auckland, or Santiago opens Peakly and gets a beach-first experience when they should be seeing "Skiing is ON in your hemisphere."

The 3 new S. hemisphere ski venues (Valle Nevado, Las Leñas, Perisher) would bring in-season ski count from 6 → 9. That's enough inventory to justify a "Southern Ski Season" carousel or a `seasonalDefaultCat` exception: detect S. hemisphere home airports (SCL, AKL, SYD, BUE, MEL, ZQN, USH) and return `"skiing"` in June–September instead of `"beach"`. Two-line fix; high signal-to-noise for the southern user segment that competitors completely ignore.

---

*Report generated by content-data agent · Next run: 2026-06-08 15:00 UTC*
