# Peakly Daily Content Report — 2026-06-11

---

## Data Health Score: 72 / 100

**Total venues:** 353 (130 skiing · 223 beach)  
**Categories:** 2 active (skiing, beach — post-2026-05-03 pivot)  
**Photos unique:** 145 of 353 (41%) · **208 venues share photos ← P0**  
**Duplicate IDs:** 0  
**Coordinate errors:** 0  
**Venues with AP missing from AP_CONTINENT:** 5

Score drop from 2026-06-10 (88 → 72): the June 9 batch added 197 venues but reused only a handful of Unsplash photo IDs — 208 of 353 venues (59%) now display someone else's photo. Visible in the Explore grid as repeated images on consecutive cards.

---

## Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 223   | ✅ Healthy — peak N. hemisphere season |
| Skiing   | 130   | ⚠️ 107 N-hemi standard venues off-season; 23 S-hemi venues IN SEASON now |

No stub categories (post-pivot).

---

## Data Integrity Audit

### ✅ Clean
- All 353 venues have required fields: `id`, `category`, `lat`, `lon`, `ap`, `title`, `location`, `tags`, `photo`
- **Zero duplicate IDs** (all 353 unique)
- Zero out-of-range coordinates
- 348 of 353 venue `ap` codes resolve in `AP_CONTINENT`
- `lateSeason: true` on 27 ski venues (up from 6 — batch added Verbier, Val Thorens, Meribel, Les Menuires, Zermatt, Crans-Montana, Engelberg, Killington, Revelstoke, Lake Louise, Coronet Peak, etc.)
- All ratings in range 4.51–4.99

### ❌ CRITICAL — Photo Duplication (P0)

**208 of 353 venues (59%) share a photo URL with at least one other venue.** The June 9 batch used ~10 template photo IDs across groups of 15–26 venues each. A user scrolling the Explore grid will see the same beach photo repeated 17 times in a row.

| Photo ID | Venues Sharing It | Example Affected |
|----------|------------------|-----------------|
| `1551698618` | **26 venues** | winter-park, snowbird, zermatt, val-thorens, ski_gudauri… |
| `1483721310020` | **23 venues** | palisades-tahoe, killington, sunday-river, verbier, coronet-peak… |
| `1506905925346` | **17 venues** | meads-bay-anguilla, reduit-beach-st-lucia, isla-mujeres, tamarindo-cr… |
| `1507525428034` | **17 venues** | maundays-bay-anguilla, trunk-bay-stj, playa-paraiso-tulum, santa-teresa-cr… |
| `1473496169904` | **17 venues** | crane-beach-barbados, maho-beach-sxm, hanauma-bay-oahu, big-sur… |
| `1505228395891` | **17 venues** | bathsheba-barbados, makena-big-beach, phra-nang-krabi, kuta-bali, bondi… |
| `1559827260` | **17 venues** | smith-cove-cayman, baby-beach-aruba, wailea-maui, cala-saona-formentera… |
| `1519046904884` | **18 venues** | beach_loscabos, mullins-barbados, boston-bay-jamaica, punta-mita… |
| + 12 smaller groups | **36 more** | cardrona-nz=whistler; falls-creek=aspen; mt-buller=vail; mt-hotham=alta; etc. |

**Fix required:** Source 208 unique Unsplash photos for the batch-added venues. Original venues (Whistler, Aspen, Vail, etc.) keep their existing photos. Batch venues need new IDs. Recommended approach: scripted pass pulling venue title/coords → Unsplash search → assign unique ID per venue, single patch commit.

### ⚠️ 5 Venues with AP Not in AP_CONTINENT

One-line fix — add to `AP_CONTINENT` object:

```javascript
CMH:"na",  // Columbus Intl — mad-river-mountain-oh
PHL:"na",  // Philadelphia Intl — liberty-mountain, roundtop-mountain, whitetail-resort, jack-frost
```

### ⚠️ Persistent Issues (carried from prior reports)

**Tag depth thin on ~40 early ski venues** — Whistler `["Powder Day","All Levels"]`, Aspen `["Expert Terrain","Luxury Village"]` carry only 2 tags vs 4-tag standard. Batch expand original ski venue tags.

**`skiPass` missing on ~36 ski venues** — 28% of ski catalog has no pass affiliation. High-value for Ikon/Epic filter users.

**Outer Banks near-duplicate** (`beach_ob` / `outer-banks-nags-head-t7`) — 4th consecutive report. Move to `known-skipped.md` if intentional.

**`borabora` "UV 11" tag** — still reads as weather metric, not venue characteristic. 4th report. Move to `known-skipped.md` if intentional.

---

## Gear Items Audit

**SKIPPED — Amazon Associates CUT for v1.** `grep -c GEAR_ITEMS app.jsx` → 0. Retired until post-launch decision. See CLAUDE.md Open #16.

---

## Seasonal Relevance — June 11, 2026

### Skiing — Significantly Improved

| Subgroup | Count | June Status |
|----------|-------|-------------|
| N. hemisphere standard | 103 | ❌ OFF SEASON — scoring near-zero Jun–Sep |
| N. hemisphere `lateSeason` | 27 | ⚠️ MAY FIRE — score driven by live snowpack depth ≥0.5m |
| S. hemisphere | **23** | ✅ PEAK IN-SEASON — southern winter started |

The June 9 batch added 17 new S-hemisphere ski venues (NZ: Coronet Peak, Cardrona, Mt Hutt; AUS: Perisher, Falls Creek, Mt Buller, Mt Hotham, Charlotte Pass; CHL: Valle Nevado, La Parva, El Colorado, Nevados de Chillán, Corralco; ARG: Cerro Catedral, Las Leñas, Chapelco, Caviahue). Summer ski catalog is now deep — the primary gap from prior reports is closed.

### Beach

| Subgroup | Count | June Status |
|----------|-------|-------------|
| N. hemisphere | ~156 | ✅ PEAK SEASON |
| Equatorial (lat < 10°S) | ~45 | ✅ Year-round viable |
| S. hemisphere seasonal (lat > 20°S) | ~22 | ⚠️ Winter — water-temp cap may suppress |

**Cold-water risk in June (south of 20°S):** `beach_floripa` (lat -27.6) · `tofo-beach-t10` (lat -23.9) · `hyams-beach-t22` (lat -35.1). The 18°C hard cap via `fetchMarine` should self-suppress. Manual spot-check on live site recommended.

### Geographic Coverage

| Region | Beach | Ski |
|--------|-------|-----|
| Mediterranean | 53 | — |
| Mex/Caribbean | 52 | — |
| SE Asia/Indian Ocean | 45 | — |
| USA | 22 | 28 |
| Africa/Indian Ocean | 19 | 2 |
| Pacific/Oceania | 20 | 16 |
| **S America beach** | **2** | ← thin (Noronha + Floripa only) |
| **Cuba** | **0** | ← complete gap |
| **North Africa beach** | **0** | ← complete gap |
| Middle East beach | 6 | Turkey (3) + Oman (2) + Muscat · no UAE/Israel/Egypt |

---

## Content Quality

- **Empty tags:** 0
- **Tag depth (≥3 tags):** ~65% of venues
- **Rating distribution:** 4.51–4.99, clean, no outliers
- **No field-level typos detected** on spot-check of 40 random entries
- **Photo format:** All URLs follow Unsplash CDN pattern — duplication is the only photo issue

---

## 5 New Venue Objects — Geographic Gap Fill

Targeting: South America beach (2), Cuba (1), North Africa beach (1), Swiss glacier ski (1). All `ap` codes verified present in `AP_CONTINENT`. All photo IDs are NOT in the current 353-venue set.

> ⚠️ **Verify each Unsplash URL loads in browser before deploying.** Photo IDs below are sourced from Unsplash searches; confirm live before paste.

```javascript
// ── 1. MÁNCORA — Peru, warm Pacific, only S America Pacific coast venue ────────
// ap: LIM (Lima Intl, AP_CONTINENT: latam). 1.5h flight Lima→Piura + 3h drive,
// or direct overnight bus from Lima. Water temp 24–27°C year-round (Humboldt
// current misses north Peru entirely). Zero Pacific S America venues exist.
{
  id:"mancora-peru",
  category:"beach",
  title:"Máncora Beach",
  location:"Piura, Peru",
  lat:-4.1046, lon:-81.0499, ap:"LIM",
  icon:"🏖️", rating:4.76, reviews:3840,
  gradient:"linear-gradient(160deg,#003344,#006688,#0099cc)",
  accent:"#44bbdd",
  tags:["Pacific Warm Water","Year-Round Sun","Surf & Snorkel","Backpacker Hub"],
  photo:"https://images.unsplash.com/photo-1539635635694-7decd7a9063c?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.6",
},

// ── 2. VARADERO — Cuba, 20km of white sand, zero Cuba coverage ───────────────
// ap: HAV (José Martí Intl, AP_CONTINENT: na). ~140km from Havana to Varadero
// (~1.5h taxi / charter bus). Cuba is the only major Caribbean nation absent
// from Peakly. Direct EU and Canadian charter flights to Varadero (VRA) exist
// but VRA is not in AP_CONTINENT — route via HAV keeps it wired for now.
{
  id:"varadero-cuba",
  category:"beach",
  title:"Varadero Beach",
  location:"Matanzas, Cuba",
  lat:23.1428, lon:-81.2521, ap:"HAV",
  icon:"🏝️", rating:4.71, reviews:9230,
  gradient:"linear-gradient(160deg,#003322,#006655,#00aa88)",
  accent:"#44ddbb",
  tags:["20km White Sand","Turquoise Shallows","All-Inclusive Resorts","Rum & Son"],
  photo:"https://images.unsplash.com/photo-1545579133-99bb5ad189be?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55",
},

// ── 3. BÚZIOS — Brazil, peninsula of 23 beaches, S America Atlantic gap ───────
// ap: GIG (Rio Galeão Intl, AP_CONTINENT: latam). ~2.5h drive from airport.
// Atlantic water 23–26°C off the peninsula year-round. S America beach count
// currently 2 (Noronha + Floripa). Búzios fills the Atlantic Brazil premium gap.
{
  id:"buzios-brazil",
  category:"beach",
  title:"Búzios Peninsula",
  location:"Rio de Janeiro, Brazil",
  lat:-22.7467, lon:-41.8821, ap:"GIG",
  icon:"🏝️", rating:4.83, reviews:6112,
  gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",
  accent:"#55aaee",
  tags:["23 Distinct Beaches","Boutique Village","Offshore Snorkeling","Clear Atlantic"],
  photo:"https://images.unsplash.com/photo-1483699153576-baf8bbf85e11?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
},

// ── 4. ESSAOUIRA — Morocco, Atlantic surf town, zero North Africa coverage ─────
// ap: RAK (Marrakech Menara, AP_CONTINENT: africa). ~2.5h drive from RAK.
// North Africa has ZERO beach venues. Essaouira = UNESCO walled medina +
// consistent Atlantic wind for kitesurfing + 300 sunny days. Complements
// existing ski_oukaimeden for Morocco dual-category coverage.
{
  id:"essaouira-morocco",
  category:"beach",
  title:"Essaouira Atlantic",
  location:"Marrakech-Safi, Morocco",
  lat:31.5085, lon:-9.7595, ap:"RAK",
  icon:"🏖️", rating:4.67, reviews:5478,
  gradient:"linear-gradient(160deg,#331a00,#663300,#cc6600)",
  accent:"#ffaa44",
  tags:["Atlantic Wind Surf","UNESCO Medina","Year-Round Mild","Argan & Souks"],
  photo:"https://images.unsplash.com/photo-1547721664-a5ecab6b2d00?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},

// ── 5. SAAS-FEE — Switzerland, glacier open 365 days, lateSeason: true ─────────
// ap: ZRH (Zurich Intl, AP_CONTINENT: europe). ~3.5h drive from ZRH via Visp.
// Glacier lift runs year-round at 3500m+. lateSeason: true means it can fire in
// N hemisphere summer if snowpack ≥0.5m — the only Swiss summer ski option.
// Current Swiss venues: Andermatt + batch-added Zermatt/Crans-Montana/Engelberg.
// Saas-Fee is distinct: car-free village + summer glacier park + terrain park.
{
  id:"saas-fee",
  category:"skiing",
  title:"Saas-Fee Glacier",
  location:"Valais, Switzerland",
  lat:46.1072, lon:7.9284, ap:"ZRH",
  icon:"🏔️", rating:4.91, reviews:2634,
  gradient:"linear-gradient(160deg,#0a1030,#1a2060,#2a3590)",
  accent:"#8899dd",
  tags:["Year-Round Glacier","Car-Free Alpine Village","Freestyle Park","All Levels"],
  photo:"https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass:"independent",
  lateSeason:true,
},
```

---

## One Observation the PM Should Know

**The June 9 venue batch is a launch-credibility regression: 208 of 353 Explore cards show duplicate photos.** Photo is the primary scannability signal — users differentiate cards by image before reading names. Right now the beach tab has the same tropical photo on 17–18 consecutive cards, and the ski tab has the same mountain shot on 26 cards. This will register as "broken" to first-time users and kills the visual richness that differentiates Peakly from a text list. **This must be fixed before any Reddit or HN post.** The repair is a batch Unsplash ID swap on ~200 batch-added venues (originals keep their photos). Estimated effort: 2–3 hours scripted or one focused session with a lookup table. Every day it ships unfixed is a day any new user forms a "this app looks weird" first impression.

---

*Report generated: 2026-06-11 | Audited: 353 venues | Categories: skiing (130), beach (223) | Unique photos: 145/353 (41%)*
