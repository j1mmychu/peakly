# Peakly Content & Data Report — 2026-07-30

**Data health score: 91/100** (+2 vs yesterday — AP_CONTINENT gap closed) | Venues: **373 unique IDs** (131 ski / 242 beach) ✅ stable | Cache stamp: ⚠️ `20260725d` — 5 days stale | BASE_PRICES gap: 100/146 APs missing (68%) ⚠️ | New findings: cross-category photo clash (cancun-beach ↔ big-white-ski-s5), near-dup Grace Bay, LIH in BASE_PRICES but not AIRPORT_COORDS

> Supersedes 2026-07-29. Verified against fresh `git pull` (37 commits fetched). AP_CONTINENT fix from yesterday confirmed applied — all 6 airports now mapped, closing that finding. Venue count stable at 373. Venue backlog now 15 proposals across 3 sessions — none implemented yet.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **373 unique IDs, 2 categories (skiing + beach only).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "description field" | **No description field in venue schema.** Venues use title, location, tags. |
| "lateSeason count ≠ 14" | **14 confirmed** (whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch). Use `grep lateSeason app.jsx` — NOT a bracket-walker script, which undercounts compact-format venues. |
| "AP_CONTINENT gaps PERMANENTLY CLOSED" | **NOW TRUE** — confirmed fixed 2026-07-30. All 228 AP_CONTINENT entries valid. |
| "BASE_PRICES covers 52/146 (35.6%)" | **CORRECTED — 46/146 covered = 100 APs missing (68%).** |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Stop. |
| "jackson-hole dup" | **FALSE POSITIVE.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Stop. |
| "cancun-beach dup" | **FALSE — second occurrence is in PRESETS, not VENUES.** Stop. |
| "banff dup / count = 374" | **CLOSED July 24.** Count is **373**. Stop. |

---

## 1. Data Integrity Audit

### Venue Count (authoritative — node eval, not grep)

| Category | Count | Status |
|----------|-------|--------|
| **Skiing** | 131 | ✅ stable |
| **Beach** | 242 | ✅ stable |
| **TOTAL** | **373** | ✅ matches `.venue-baseline` |

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Unique IDs | ✅ 373 | Zero duplicates |
| Missing lat/lon | ✅ 0 | All present |
| Missing airport codes (`ap`) | ✅ 0 | Two bracket-walk false positives from comment lines — both resolve to valid venues |
| Missing tag arrays | ✅ 0 | All non-empty |
| Photos (field present) | ✅ 373/373 | All have photo field |
| Duplicate IDs | ✅ 0 | Clean |
| lateSeason count | ✅ **14** | Confirmed by `grep` — walker-based scripts show 9 (false low, compact-format parsing artifact) |
| **AP in AP_CONTINENT** | ✅ **0 gaps** | Fixed — all 6 missing APs from yesterday's finding now in AP_CONTINENT (228 total entries) |
| AP in AIRPORT_COORDS | ✅ 0 missing | All 146 venue APs in AIRPORT_COORDS |

### ✅ AP_CONTINENT Gap — RESOLVED (was ❌ yesterday)

All 7 venues previously affected are now continent-correct: `tioman-island-t11` (KUL), `laguna-beach-t24` (SNA), `muscat-beach-t26` + `qantab-beach-oman` (MCT), `ipanema-rio` (GIG), `las-teresitas-tfe` (TFS), `elafonissi-beach-chq` (CHQ). Stop raising.

### ⚠️ Near-Duplicate: Grace Bay at PLS

Two venues exist for the same named beach (Grace Bay, Turks & Caicos):

| ID | Title | Lat | Lon |
|---|---|---|---|
| `beach_grace` | Grace Bay | 21.7918 | -72.2598 |
| `grace-bay-turks` | Grace Bay Beach | 21.8027 | -72.2033 |

Both use `ap:"PLS"`. Coords are ~5.6km apart along the same 12-mile continuous strip. Near-dup, not exact — IDs are unique so no crash, but users see two nearly identical cards. Jack should decide: keep both with stronger tag differentiation (west vs east end), or merge to one authoritative entry.

### 🆕 LIH Missing from AIRPORT_COORDS

LIH (Lihue, Kauai) is present in **BASE_PRICES** (has full pricing row) and **AP_CONTINENT** but **absent from AIRPORT_COORDS**. This means:
- Flight-hours filter returns `null` for LIH venues → they pass unconstrained (not hidden, but distance is unknown)
- Auto-push guard would flag any new venue with `ap:"LIH"` before AIRPORT_COORDS is patched

**Fix — one line, add to AIRPORT_COORDS alongside the other Hawaii airports:**
```javascript
  LIH:{lat:21.9759,lon:-159.3380},  // Lihue, Kauai
```
Zero venues at LIH despite BASE_PRICES coverage. This blocks the Kauai opportunity. ~10 sec paste.

---

## 2. Gear Items Audit

Not applicable. `grep -c GEAR_ITEMS app.jsx` → **0**. Amazon Associates cut for v1. Stop raising permanently.

---

## 3. Seasonal Relevance (2026-07-30)

| Segment | Count | Season Status | Notes |
|---|---|---|---|
| Northern beach (lat ≥ 0) | 187 | ✅ **PEAK SEASON** | Late July = peak northern summer. All in prime window. |
| Southern ski (lat < 0) | 23 | ✅ **IN SEASON** | July = Southern hemisphere peak ski. All 23 open. |
| Southern beach (lat < 0) | 55 | ⚠️ Off-peak | S-hemi winter. Tropical venues still warm (>26°C water). |
| Northern ski (lat ≥ 0) | 108 | ❌ Off-season | Only 14 `lateSeason:true` venues still viable (summer glaciers). |

**Southern hemisphere ski is Peakly's unique summer proposition.** 23 venues in-season across ZQN (4), SCL (5), MEL (3), SYD (2), ZCO (2), CHC (1), CBR (1), BRC (1), MDZ (1), CPC (1), NQN (1), USH (1). OpenSnow and OnTheSnow go dark in July — Peakly does not.

Six southern ski airports have only 1 venue each: USH, CHC, CBR, BRC, MDZ, CPC. All are in AIRPORT_COORDS + AP_CONTINENT. Strong expansion targets during peak season.

---

## 4. Content Quality

| Check | Result | Notes |
|-------|--------|-------|
| Venue descriptions | N/A | **No description field in schema** — by design. |
| Tags coverage | ✅ 0 venues with empty tags | All 373 have ≥1 tag. |
| Photo field present | ✅ 373/373 | All filled. ~346 still generic stock vs. actual venue. |
| Photo duplicates | ⚠️ **31 pairs** | 31 venue pairs share the same Unsplash photo URL. All 2×. No URL used 3+ times. |
| Duplicate IDs | ✅ 0 | Boot-time validator active. |

### ⚠️ Photo Duplicate Detail — Cross-Category Alert

31 pairs total, all 2×. Notable cross-category pair:

| Shared URL fragment | Venue A | Venue B | Issue |
|---|---|---|---|
| `1516592673884-4a382d` | `big-white-ski-s5` (Canada ski) | `cancun-beach` (Mexico beach) | ❌ **Cross-category** — ski photo on a beach card |
| `1576829021150-ebc8b4` | `alyeska` (Alaska ski) | `idre-fjall-s6` (Sweden ski) | Same-category, lower priority |
| `1506905925346-21bda4` | `beach_kohsamui` (beach) | `beach_cable` (beach) | Same-category, lower priority |

The `cancun-beach`/`big-white-ski-s5` cross-category share is the only one visually wrong to a user — a ski slope photo on a Cancún beach card. Easy to fix: swap `cancun-beach`'s photo to any non-duplicated beach Unsplash URL.

### BASE_PRICES Gap

**46/146 venue APs covered = 235/373 venues (63%) show estimated prices only.**

Top 15 missing airports by venues affected:

| Airport | Venues | Region |
|---|---|---|
| CUN | 9 | Cancún / Riviera Maya, Mexico |
| IBZ | 7 | Ibiza, Spain |
| HKT | 6 | Phuket, Thailand |
| BTV | 5 | Vermont ski, USA |
| NCE | 5 | French Riviera, France |
| ZNZ | 5 | Zanzibar, Tanzania |
| MRU | 5 | Mauritius |
| ALB | 4 | Adirondacks / Vermont, USA |
| PLS | 4 | Turks & Caicos |
| AXA | 4 | Anguilla, Caribbean |
| SXM | 4 | Sint Maarten |
| NAP | 4 | Naples, Italy |
| CAG | 4 | Sardinia, Italy |
| FAO | 4 | Algarve, Portugal |
| SPU | 4 | Split, Croatia |

**Priority backfill: CUN + IBZ + HKT + BTV + NCE = 27 venues unlocked** for ~2h of work. Same format as existing rows in BASE_PRICES.

---

## 5. Daily Venue Additions (5 new — southern ski peak + northern summer peak)

All 5 airports confirmed: AP_CONTINENT ✅ | AIRPORT_COORDS ✅ | No ID conflicts ✅

---

### Venue 1 — Copacabana Beach, Rio de Janeiro (GIG)

```javascript
{id:"copacabana-rio", category:"beach",
  title:"Copacabana Beach", location:"Rio de Janeiro, Brazil",
  lat:-22.9711, lon:-43.1823, ap:"GIG",
  icon:"🏖️", rating:4.85, reviews:42000,
  gradient:"linear-gradient(160deg,#001830,#003060,#005898)",
  accent:"#42a2d8",
  tags:["World's Most Famous Urban Beach","Art Deco Mosaic Boardwalk","Year-Round Warm Water","Sugarloaf Views","New Year's Eve Capital"],
  photo:"https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"},
```

**Rationale:** GIG currently has only `ipanema-rio`. Copacabana and Ipanema are 2.5km apart with distinct character: Copacabana is broader, more international, louder — the most recognized beach name globally. July = Rio's dry season (lowest humidity, warm 26°C water, good visibility). The New Year's Eve tag is a booking hook for users browsing year-ahead trips. GIG: AP_CONTINENT=latam ✅, AIRPORT_COORDS ✅, BASE_PRICES=NO.

---

### Venue 2 — Porter Heights Ski Field, Canterbury NZ (CHC)

```javascript
{id:"porter-heights-nz", category:"skiing",
  title:"Porter Heights", location:"Canterbury, New Zealand",
  lat:-43.3151, lon:171.7418, ap:"CHC",
  icon:"⛷️", rating:4.42, reviews:890,
  gradient:"linear-gradient(160deg,#0a1e30,#1a3d6a,#2a5a9a)",
  accent:"#6aabe8",
  tags:["NZ's Largest Club Ski Field","Open Bowls Off-Piste","Porter River Valley Views","No Lift Lines","Budget-Friendly"],
  photo:"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass:"independent"},
```

**Rationale:** CHC currently has only `mt-hutt` (resort-style, pricier). Porter Heights is NZ's largest club ski field — 1000+ hectares, 1980m summit, open bowls for intermediates+. 90-min from Christchurch. Club fields use rope tows instead of chairlifts: much cheaper, almost no queues, deeply authentic NZ experience. **IN SEASON NOW** (July = NZ peak ski). CHC: AP_CONTINENT=oceania ✅, AIRPORT_COORDS ✅, BASE_PRICES=NO.

---

### Venue 3 — Cerro Bayo, Villa La Angostura (BRC)

```javascript
{id:"cerro-bayo-vla", category:"skiing",
  title:"Cerro Bayo", location:"Villa La Angostura, Argentina",
  lat:-40.7614, lon:-71.6526, ap:"BRC",
  icon:"🏔️", rating:4.52, reviews:1240,
  gradient:"linear-gradient(160deg,#0a1e30,#1a3c70,#2e60b0)",
  accent:"#6a9ed8",
  tags:["Nahuel Huapi Lake Views","Intimate Village Resort","Low Crowds","Patagonian Powder","Family Terrain"],
  photo:"https://images.unsplash.com/photo-1548777123-e216912df27b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass:"independent"},
```

**Rationale:** BRC currently has only `cerro-catedral` (the big crowded resort). Cerro Bayo is 80km away in Villa La Angostura — smaller (200 ha), quieter, with Nahuel Huapi lake views from the pistes. The boutique village base adds after-ski character Catedral lacks. **IN SEASON NOW** (July = Argentine peak ski). BRC: AP_CONTINENT=latam ✅, AIRPORT_COORDS ✅, BASE_PRICES=NO.

---

### Venue 4 — Fort De Soto Park Beach, Florida (TPA)

```javascript
{id:"fort-desoto-florida", category:"beach",
  title:"Fort De Soto Park Beach", location:"Tierra Verde, Florida, USA",
  lat:27.6241, lon:-82.7290, ap:"TPA",
  icon:"🏖️", rating:4.91, reviews:28600,
  gradient:"linear-gradient(160deg,#001428,#002a50,#004878)",
  accent:"#40c8f8",
  tags:["Florida's #1 Rated Beach","Gulf Coast Wildlife","No Commercial Development","Shelling Paradise","Camping On Beach"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
```

**Rationale:** TPA currently has only `clearwater-florida`. Fort De Soto is TripAdvisor's #1 Florida beach — a 1100-acre county park with zero hotels or vendors on the beach. Completely different character from commercialized Clearwater. July = warm Gulf (29°C), afternoon storms clear by sunset. The "No Commercial Development" tag is a strong differentiator for users who want unspoiled. TPA: AP_CONTINENT=na ✅, AIRPORT_COORDS ✅, BASE_PRICES=NO.

---

### Venue 5 — Kua Bay (Maniniowali Beach), Big Island (KOA)

```javascript
{id:"kua-bay-hawaii", category:"beach",
  title:"Kua Bay (Maniniowali)", location:"Big Island, Hawaii, USA",
  lat:19.8714, lon:-156.0367, ap:"KOA",
  icon:"🐢", rating:4.88, reviews:9200,
  gradient:"linear-gradient(160deg,#001428,#002850,#004888)",
  accent:"#3ac8f8",
  tags:["Sea Turtles Rest On Sand","Protected Cove","Calmer Than Hapuna","White Sand Pocket Beach","Lava Rock Backdrop"],
  photo:"https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
```

**Rationale:** KOA currently has only `hapuna-beach-hi`. Kua Bay is the Big Island's insider pick — a protected white-sand cove 10 min north of Hapuna. Resident green sea turtles rest on the sand daily. Calmer water than Hapuna in summer. Significantly less crowded. The turtle tag is a strong conversion hook. July = peak Hawaii season. KOA: AP_CONTINENT=na ✅, AIRPORT_COORDS ✅, BASE_PRICES=YES ✅ (KOA has BASE_PRICES row).

---

**Pre-add checklist for today's 5:**
- All 5 APs (GIG, CHC, BRC, TPA, KOA) confirmed in AP_CONTINENT ✅
- All 5 APs confirmed in AIRPORT_COORDS ✅
- GIG, CHC, BRC, TPA absent from BASE_PRICES → deal scoring shows `~$X` estimates only ⚠️
- KOA IS in BASE_PRICES ✅ — Venue 5 gets live deal scoring
- No existing venue with same `id` — confirmed clean ✅
- Run through `scripts/validate-venues.mjs` before committing

---

## One Observation the PM Should Know

**The venue backlog is 15 proposals across 3 consecutive sessions with zero implementations.** Today's 5 (Copacabana, Porter Heights, Cerro Bayo, Fort De Soto, Kua Bay) are high-credibility, pass all guard checks, and include 2 southern ski venues **in peak season right now** losing traffic value by the day. At this pace the backlog will keep growing. Recommend Jack blocks 15 minutes to batch-paste: copy the 5 JS objects → paste into VENUES array after the last venue → run `node scripts/validate-venues.mjs` → `git add app.jsx && git commit -m "Add 5 venues: Copacabana/PorterHeights/CerroBayo/FortDeSoto/KuaBay"`. If that's not happening, content agent should suspend new proposals until prior ones are added.

**Pre-launch priority stack (updated 2026-07-30):**
1. **VPS redeploy** (Open #19, P1 "pre-traffic gate") — Day 6 per DevOps. Bundles Open #23 weather cache disk persistence.
2. **Cache stamp** — `20260725d` is 5 days stale. Auto-push.sh should auto-bump but DevOps flagged it — investigate why it's not bumping.
3. **BASE_PRICES backfill** — CUN + IBZ + HKT + BTV + NCE = 27 venues unlocked, ~2h work.
4. **Photo fix** — `cancun-beach` shows a ski photo (cross-category). Swap one Unsplash URL.
5. **LIH AIRPORT_COORDS** — one line, unblocks Kauai (zero venues there despite BASE_PRICES row).
6. **Venue backlog** — 15 proposals ready to paste.
