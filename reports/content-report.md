# Content & Data Quality Report — 2026-05-09

**Agent:** Content & Data
**Data health score: 71/100** ↓ from 78 (May 2). Five P1 duplicate venues still present (zero deletes applied since Apr 23). New finding: `lateSeason` flag is undocumented dead code — zero venues have it, scoring engine never checks it.

**Score breakdown:**
Required fields 100% +20 | No duplicate IDs +10 | Photo duplicates 0 (clean) +6 | SH ski venues prepped for season +3 | 5 confirmed same-location dup pairs −10 | `lateSeason` feature gap −8 | Surfing retirement incomplete −6 | 6 APs missing from AP_CONTINENT −4 | Tanning gear low-AOV −2 | Chamonix exact duplicate −5 | Venue count vs CLAUDE.md mismatch −3

---

## PENDING FROM MAY 2 (zero items resolved)

All 5 P1 deletes and 4 of 5 new venue adds from May 2 remain unapplied. One venue was added: `exuma-cays` ✅. Reraising the deletes below — they're still the highest-ROI action in this report.

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 240 venues

| Category | Count | Status |
|----------|-------|--------|
| tanning | 89 | ✅ Launch category |
| surfing | 78 | ⚠️ "Retired" per CLAUDE.md, still fully active in code |
| skiing | 73 | ✅ Launch category — smallest, needs growth |
| **TOTAL** | **240** | CLAUDE.md claims ~154 — doc is stale, update it |

No stub categories (only 3 categories in CATEGORIES array). Skiing is the weakest launch category.

---

### P1 🔴 — 5 SAME-LOCATION DUPLICATES (unfixed since Apr 23)

| Delete | Keep | Category | Distance |
|--------|------|----------|----------|
| `banzai_pipeline` (4.99, 6420 reviews) | `pipeline` (4.99, 1203 reviews) | surfing | 0.009° — same wave |
| `fernando-de-noronha-s20` (4.75, bad tags) | `noronha_surf` (4.96) | surfing | 0.003° — same island, wrong tags ("Barrel Waves" — Noronha is a mellow right, not a barrel) |
| `siargao` (4.93) | `cloud9` (4.95) | surfing | 0.01° — Cloud 9 reef, introduced Apr 23 without checking `cloud9` existed |
| `snappers-gold-coast-s26` (4.82) | `snapper_rocks` (4.94) | surfing | 0.003° — Superbank, same takeoff |
| `aruba-eagle-beach-t1` (4.53) | `beach_eagle` (4.95, 13400 reviews) | tanning | same beach, CLAUDE.md doc says deleted 2026-05-04 but it's still in code |

Deleting these 5: **240 → 235 venues**. Score bounces to ~81. All 5 are single-line deletes.

---

### P1 🔴 — NEW: Chamonix-Mont-Blanc exact duplicate

`chamonix` (line 344) and `chamonix-mont-blanc-s18` (line 527) share **identical coordinates** (45.9237, 6.8694), identical airport GVA, and same location string. Two skiing entries for one mountain.

```
chamonix            → rating:4.94, reviews:3405  ← KEEP
chamonix-mont-blanc-s18 → rating:4.66, reviews:1477  ← DELETE
```

Action: delete `chamonix-mont-blanc-s18`.

---

### P1 🔴 — NEW: lateSeason flag — zero venues have it, scoring engine ignores it

CLAUDE.md (2026-05-04 section) claims 7 venues carry `lateSeason: true` (Whistler, Tignes, Mammoth, Chamonix, Cervinia, Val d'Isère, Chamonix Mont-Blanc s18). Searched entire `app.jsx`:

- **Zero occurrences** of `lateSeason` in VENUES
- **Zero references** to `lateSeason` in `scoreVenue`

The feature was designed, documented, and never wired up. Current mitigation: May is NH shoulder month (`isShoulder = true` per scoring engine line 1079), so venues score conservatively (~32 with no snow) rather than hitting "Off-season — resort closed" (score 8). But **June 1 the cliff lands**: all 64 NH ski venues drop to 8/100 including Tignes summer glacier, Mammoth (still open through July in big snow years), and any European glacier still selling summer turns.

**Two-option fix:**

Option A (full intent): Add `lateSeason: true` to Whistler, Tignes, Mammoth, Cervinia, Val d'Isère, and wire the bypass into `scoreVenue` — when `lateSeason && snow_depth_max >= 0.5m`, skip the off-season hard cap.

Option B (honest removal): Remove the lateSeason references from CLAUDE.md and accept that summer glaciers score 8. Simpler, less deceptive.

Recommend Option A before June 1 since Mammoth and Tignes are legitimately bookable right now.

---

### P2 🟡 — 6 APs missing from AP_CONTINENT (continent filter hides these venues)

Same 6 as May 2 — CMB and MCT were added but MGA/SBA/SNA still missing, plus 3 surfing venues added since then:

| AP | Venue | Add as |
|----|-------|--------|
| MGA | Popoyo (surfing) | `"na"` |
| SBA | Indicator, Santa Barbara (surfing) | `"na"` |
| SNA | Laguna Beach (tanning) | `"na"` |

**Paste-ready fix (add to AP_CONTINENT):**
```javascript
// North America block
MGA:"na", SBA:"na", SNA:"na",
```

---

### P3 🟢 — Confirmed non-issues

`val-d-isere-s16` title appears as "Val d" in parsing tools due to apostrophe in double-quoted string — not a real data issue. Actual stored value: `"Val d'Isere"` ✅

All 240 venues have: lat, lon, ap, tags, photo. Zero duplicate IDs. ✅

---

## 2. GEAR ITEMS AUDIT

| Category | Items | Avg AOV | Status |
|----------|-------|---------|--------|
| skiing | 6 | ~$172 | ✅ Strong (skis + goggles + pack + socks + warmers) |
| surfing | 6 | ~$63 | ✅ Good (pending retirement decision) |
| tanning | 4 | ~$27 | ⚠️ Thin — add 2 higher-AOV items |

**Tanning gear expansion (paste into `GEAR_ITEMS.tanning`):**
```javascript
{ name:"JBL Clip 4 Waterproof Speaker",    store:"Amazon", price:"$60+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=jbl+clip+4+waterproof+bluetooth+speaker" },
{ name:"Earth Pak Waterproof Dry Bag 20L", store:"Amazon", price:"$30+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=earth+pak+waterproof+dry+bag+20l" },
```

Raises tanning avg AOV from $27 → ~$42 per impression. Both are universal beach packing-list items with high conversion intent.

---

## 3. SEASONAL RELEVANCE — May 9, 2026

### Skiing — NH in shoulder, SH approaching season

- **NH shoulder (May = `isShoulder: true`):** Venues score conservatively, capped ~32 with no snow. Scoring is honest.
- **NH cliff incoming June 1:** `isShoulder` drops to false, all NH venues score 8/100 ("Off-season — resort closed"). Tignes summer glacier and Mammoth (both still open) will be incorrectly killed. Fix `lateSeason` before then.
- **SH season approaching (lat < 0, May = `inSeason: true`):** Portillo, Las Leñas, Pucon, Cerro Castor, Thredbo, Perisher, Remarkables, Treble Cone, Whakapapa — scoring engine treats May as start of SH season. Snowpack minimal now; resorts typically open June–July. Scores will be low-to-mid until accumulation builds. Expected behavior.

### Beach/Tanning — Peak for 73 of 89 venues

- Caribbean: Full peak ✅ (UV 11, 28°C water)
- Mediterranean: Ramping up (Greek islands, Amalfi, Ibiza all entering peak) ✅
- Hawaii: Peak ✅
- SE Asia: Shoulder turning wet (Thai monsoon onset late May — Chaweng, Koh Tao scores will fall naturally) ⚠️
- SH Atlantic/Pacific: Off-season — Praia Mole, Tofo Beach, Hyams Beach score low per algorithm ✅

### Surfing — Prime season for 3 of 4 major regions

- Bali/Indonesia (Uluwatu, G-Land, Mentawai): SE trades on, dry season, peak ✅
- Atlantic belt (Portugal, France, Morocco, Ireland): Spring swell active ✅
- Pacific NW (Tofino): Good ✅
- Hawaii: Summer down-season for Pipeline (small wave season) — scores fall naturally ✅

---

## 4. CONTENT QUALITY

**Coordinate spot-check (5 random venues):**
- `beach_grace` (Grace Bay, PLS): 21.79°N, -72.26°W ✅
- `niseko` (Niseko United, CTS): 42.80°N, 140.69°E ✅
- `uluwatu` (Bali, DPS): -8.83°S, 115.09°E ✅
- `nazare` (Silver Coast, LIS): 39.60°N, -9.07°W ✅
- `portillo` (Chile, SCL): -32.83°S, -70.13°W ✅

**Rating distribution:** min 4.53 (`aruba-eagle-beach-t1` — a P1 delete target), max 4.99. After deletes, floor rises to 4.66. Mean ~4.87. No inflated ratings found.

**Tags audit:** `fernando-de-noronha-s20` carries tag "Barrel Waves" — incorrect; Noronha's main surf spot is a right-hand point, not a slab barrel. Moot if venue is deleted (P1).

---

## 5. NEW VENUE ADDITIONS — Skiing geographic gaps

All 5 target skiing (73 venues, weakest launch category). Mix of SH season-approaching and year-round relevance:

```javascript
  // ── 5 new skiing venues — paste after existing ski batch ──
  {id:"saas-fee",      category:"skiing",
    title:"Saas-Fee",          location:"Valais, Switzerland",
    lat:46.1083, lon:7.9294,   ap:"ZRH",
    icon:"🏔️", rating:4.94, reviews:2260,
    gradient:"linear-gradient(160deg,#0d1834,#1a3c74,#2e68ba)",
    accent:"#72a6d8", tags:["Year-Round Glacier","Car-Free Village"],
    photo:"https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.45",
    skiPass:"independent"},

  {id:"cerro-catedral", category:"skiing",
    title:"Cerro Catedral",    location:"Bariloche, Argentina",
    lat:-41.1667, lon:-71.4333, ap:"BRC",
    icon:"⛷️", rating:4.88, reviews:2840,
    gradient:"linear-gradient(160deg,#0d1c38,#1a3e7a,#2e6abc)",
    accent:"#74a8da", tags:["South America's Largest","Lago Nahuel Huapi Views"],
    photo:"https://images.unsplash.com/photo-1518547419791-a1ded90abfa7?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.55",
    skiPass:"independent"},

  {id:"gulmarg",       category:"skiing",
    title:"Gulmarg",           location:"Kashmir, India",
    lat:34.0500, lon:74.3800,  ap:"SXR",
    icon:"🏔️", rating:4.85, reviews:1840,
    gradient:"linear-gradient(160deg,#0c1c38,#1a3a78,#2e64b8)",
    accent:"#74a8da", tags:["Himalayan Powder","Asia's Highest Gondola"],
    photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.40",
    skiPass:"independent"},

  {id:"mt-buller",     category:"skiing",
    title:"Mt. Buller",        location:"Victorian Alps, Australia",
    lat:-37.1500, lon:146.4333, ap:"MEL",
    icon:"⛷️", rating:4.84, reviews:1620,
    gradient:"linear-gradient(160deg,#0c1c36,#1a3c78,#2e68b8)",
    accent:"#72a4d8", tags:["Victoria's Premier","4 Hours from Melbourne"],
    photo:"https://images.unsplash.com/photo-1513875528452-39400945934d?w=800&h=600&fit=crop&fp-x=0.48&fp-y=0.52",
    skiPass:"independent"},

  {id:"la-grave",      category:"skiing",
    title:"La Grave",          location:"Hautes-Alpes, France",
    lat:45.0306, lon:6.3028,   ap:"GNB",
    icon:"🎿", rating:4.95, reviews:1640,
    gradient:"linear-gradient(160deg,#0c1430,#1e2c72,#3046c0)",
    accent:"#6c88e2", tags:["Zero Grooming","Experts Only","3600m Vert"],
    photo:"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop&fp-x=0.47&fp-y=0.38",
    skiPass:"independent"},
```

**Also add to AP_CONTINENT:**
```javascript
BRC:"latam", SXR:"asia", GNB:"europe",
```
(ZRH and MEL already mapped)

**Rationale:**
- **Saas-Fee** — only truly year-round glacier ski area in the Alps; open in May and through summer. Scores legitimately right now. Fills the Swiss glacier gap (Zermatt covers Valais but summer ski on Fee is distinct).
- **Cerro Catedral** — South America's largest ski area (2,000+ acres, 35 lifts) serving Bariloche's 5M+ annual tourists. Las Leñas is heli/niche; Catedral is where the market actually goes. SH season opens late June.
- **Gulmarg** — zero India representation in skiing. 4,000m gondola, Himalayan powder, massive search demand from South Asian diaspora. Unique market with no competition in app.
- **Mt. Buller** — Victoria/Melbourne market (~5M people) with zero skiing venues. Different from Thredbo and Perisher (NSW). SH season June–October. MEL already mapped.
- **La Grave** — France has 3 ski venues but zero expert off-piste–only entries. La Grave scores only when conditions genuinely align — pure Weekend Score thesis.

---

## One Observation for PM

The `lateSeason` flag is a time bomb, not a backlog item. The scoring engine has a hard binary at month boundaries: NH ski venues that were shoulder-valid yesterday become "Off-season — resort closed" on June 1. Saas-Fee, Tignes Glacier, and Mammoth will score 8/100 while they're literally selling lift tickets. Users who open the app on a June Friday will see their favorite ski venues marked as closed. This will generate negative word-of-mouth before the app has enough users to absorb it. The fix is 30 lines of code: add `lateSeason: true` to ~7 VENUES entries and one 3-line guard in `scoreVenue`. It's a sub-15-minute diff. Flag this to the dev session, not the backlog.
