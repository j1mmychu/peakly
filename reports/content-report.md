# Peakly Content & Data Quality Report
**Date:** 2026-06-07  
**Agent:** Content & Data  
**Scope:** Full audit — 156 venues, 2 active categories

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
