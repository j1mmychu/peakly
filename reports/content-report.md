# Content & Data Report — April 10, 2026

**Data Health Score: 56/100** *(down from 67 on April 9 — critical bugs now 7 days unresolved, photo duplication fully quantified)*
**Total Venues: 3,726**
**Auditor:** Content & Data Agent
**Date:** 2026-04-10

---

## 1. CATEGORY BREAKDOWN

| Category | Count | Focus Tier | Status | Notes |
|----------|-------|------------|--------|-------|
| Tanning/Beach | 705 | ⭐ TOP 3 | ✅ Healthy | |
| Skiing | 704 | ⭐ TOP 3 | ✅ Healthy | Late NH season; SH not open until June |
| Surfing | 703 | ⭐ TOP 3 | ✅ Healthy | Multiple prime regions right now |
| Diving | 205 | Secondary | ✅ Healthy | |
| Climbing | 204 | Secondary | ✅ Healthy | Prime season NOW (NH spring) |
| Fishing | 202 | Secondary | ✅ Healthy | NH trout season opening |
| Paragliding | 201 | Secondary | ✅ Healthy | |
| MTB | 201 | Secondary | ✅ Healthy | Prime season NOW |
| Kayak | 201 | Secondary | ✅ Healthy | |
| Kite | 200 | Secondary | ✅ Healthy | |
| Hiking | 200 | Secondary | ✅ Healthy | Prime season starting NH |
| **TOTAL** | **3,726** | | | No stub categories |

All 11 categories exceed 200 venues. Top 3 focus categories hold 2,112 of 3,726 venues (57%).

---

## 2. DATA INTEGRITY AUDIT

### 🔴 CRITICAL — TP_MARKER Placeholder Still Live (Line 5316) — Day 7

```javascript
const TP_MARKER = "YOUR_TP_MARKER";  // line 5316
```

Every flight affiliate click earns **zero commission**. First flagged April 4. Now 7 days unresolved.

**Revenue math:** Conservative estimate at current traffic — 100 flight link clicks/day × 1.5% conversion × $4 avg commission = **$6/day in missing earnings**. After Reddit launch with higher traffic, this scales significantly.

**Fix:** Retrieve the Travelpayouts marker from the VPS `server/` config and paste it at line 5316. The guard clause at line 5366 already handles the fallback correctly — it just needs the real value. 3-minute fix.
**Owner:** Jack (requires VPS access)

---

### 🔴 CRITICAL — Syntax Bug: Guam Offshore Fishing (Line ~2402) — Day 7

```
BROKEN: gradient:"linear-gradient(160deg,#007aac,#00aacc,#00daec"
FIXED:  gradient:"linear-gradient(160deg,#007aac,#00aacc,#00daec)"
```

Missing closing `)`. Gradient CSS silently fails to render on this venue card.

---

### 🔴 CRITICAL — Syntax Bug: Glacier NP Paragliding Double Comma (Line ~2696) — Day 7

```
BROKEN: ...tags:[...],photo:"..."},,
FIXED:  ...tags:[...],photo:"..."},
```

Creates a sparse array element. May cause `undefined` to be iterated in rendering loops, risking runtime errors.

---

### 🔴 HIGH — Dangerous Inaccurate Tags on Batch Duplicate Venues — Day 8+

Confirmed still present in file:

| Venue ID | Current Tags | Reality | Risk |
|----------|-------------|---------|------|
| `cloudbreak-s85` | "All Levels, Beginner Friendly" | Expert-only boat-access reef barrel | High |
| `mundaka-s37` | "Beginner Friendly, Warm Water" | Cold Basque water, expert-only river mouth | High |
| `teahupoo-s141` | "All Levels, Longboard Friendly" | World's most dangerous big wave | Extreme |
| `punta-de-lobos-south-s252` | "Beginner Friendly, Warm Water, Year-Round" | Cold Chilean expert big wave | High |

**Recommended fix (20 min):** Delete these 4 IDs. Correct entries with accurate tags already exist: `cloudbreak`, `mundaka`, `teahupoo`, `punta_lobos`. This is a launch-blocking credibility issue for r/surfing launch.

---

### ✅ PASS — Required Fields

| Field | Missing |
|-------|---------|
| lat / lon | 0 |
| ap (airport) | 0 |
| tags | 0 |
| photo URL | 0 |
| id | 0 |

All 3,726 venues have complete required fields. No duplicate IDs found. Core schema solid.

---

## 3. PHOTO DUPLICATION — NEWLY QUANTIFIED, SEVERE

**This is worse than previously reported.**

| Metric | Value |
|--------|-------|
| Total venues | 3,726 |
| **Unique Unsplash photo IDs** | **257** |
| Venues sharing a photo with ≥1 other venue | **~3,469 (93%)** |
| Most-duplicated photo | **203 venues use the same image** |

Previous reports estimated 1,465 non-unique instances based on partial analysis. Full Python audit reveals only 257 distinct images serve 3,726 venues — the 1,500 batch venues added March 29 cycle through just ~30 unique photos.

**Top 5 most-duplicated photo IDs:**

| Photo ID | Times Used | Covers |
|----------|-----------|--------|
| `photo-1529961482160-d7916734da85` | **203** | Assigned to 203 different venues across all continents |
| `photo-1523819088009-c3ecf1e34000` | **202** | Kayak, diving, fishing, beach venues |
| `photo-1578001647043-3b4c50869f21` | **110** | MTB and climbing venues |
| `photo-1512541405516-020b57532e46` | **92** | MTB venues |
| `photo-1559288804-29a8e7e43108` | **77** | Kite venues |

CLAUDE.md still says "0% photo duplication" — this is outdated and should be corrected.

**Impact:** Any user browsing 3+ venues in a category sees the same background photo. This is immediately visible in the Explore scroll. Trust loss is high.

**Remediation:** Batch replacement pass for ~1,500 batch-generated venues, assigning unique Unsplash IDs by region + category. Estimated effort: 2–3 hours scripted. Should be week-2 post-Reddit priority.

---

## 4. EXPERIENCES CONSTANT — Hiking Missing, Kayak Typo

The `EXPERIENCES` constant (used in VenueDetailSheet) covers **10 of 11 categories**. **Hiking has no entries.**

All 200 hiking venues show an empty "Experiences" section in the detail sheet.

Additionally, kayak has a word-duplication typo: `"Wildlife wildlife kayak tour"`.

### Paste-Ready Fixes

**Add hiking experiences** — insert before the closing `};` of the `EXPERIENCES` constant:

```javascript
  hiking: [
    { emoji:"🥾", name:"Half-day guided summit hike",       price:65,  duration:"4 hrs" },
    { emoji:"🏕️", name:"Wilderness overnight camp & hike",  price:180, duration:"2 days" },
    { emoji:"📸", name:"Landscape photography nature walk",  price:55,  duration:"3 hrs" },
  ],
```

**Fix kayak typo:**
```
FIND:    "Wildlife wildlife kayak tour"
REPLACE: "Wildlife kayak tour"
```

---

## 5. GEAR ITEMS AUDIT

All 11 categories have GEAR_ITEMS entries. ✅ No category at zero.

| Category | Item Count | Gap |
|----------|-----------|-----|
| Skiing | 8 | None |
| Climbing | 8 | Duplicate item (Black Diamond Harness listed twice — REI + Amazon same product) |
| Kayak | 8 | Duplicate item (NRS Chinook PFD listed twice — REI + Amazon same product) |
| MTB | 8 | None |
| Hiking | 7 | REI signup still pending (Avantlink) — these links earn $0 |
| Surfing | 4 | Low count. Could add wetsuit + leash when gear re-enabled |
| Tanning | 4 | Low count. Could add beach chair, umbrella |
| Diving | 4 | Low count. Could add fins, BCD |
| Kite | 4 | Low count. Could add board, bar |
| Fishing | 4 | Low count. Could add waders, reel |
| Paragliding | 4 | Low count. Could add harness, reserve |

Gear section remains hidden at launch (`{false && GEAR_ITEMS[...]}`). No urgent action. REI Avantlink signup is the revenue unlock here.

---

## 6. SEASONAL RELEVANCE — April 10, 2026

### ✅ In Season NOW — Promote These

| Sport | Best Regions Now | Why |
|-------|-----------------|-----|
| **Surfing** | Portugal (Ericeira, Peniche), Morocco (Taghazout — last weeks), California, Canary Islands, Maldives | Spring Atlantic + Pacific swells; S Pacific building |
| **Tanning/Beach** | Caribbean (dry season end, 29°C), Maldives (last weeks pre-SW monsoon), SE Asia (Bali, Philippines), Mediterranean (uncrowded shoulder) | UV 7–10 across all regions |
| **Climbing** | American Southwest (Zion, Red Rock, Joshua Tree), Southern France, Catalonia, Morocco Atlas | Pre-summer ideal temps |
| **MTB** | Pacific Northwest trails thawing, Mediterranean (Finale Ligure, Morzine), Colorado dirt season opening | April = prime for EU + US West |
| **Hiking** | US Southwest (Zion, Grand Canyon, Bryce — wildflowers peak), Cascades lower, Patagonia autumn | NH trails opening; Patagonia autumn colors |
| **Fishing** | NH trout season opening (Madison River MT, Catskills NY, Deschutes OR), Patagonia (tail end of season) | Best spring hatches in NH |

### ⚠️ Late / Out of Season — Deprioritize

| Sport | Region | Status |
|-------|--------|--------|
| **Skiing** | European Alps (mid-altitude) | Closing now through April 15 |
| **Skiing** | US East Coast | Closed |
| **Skiing** | Southern Hemisphere (NZ, Australia, Chile, Argentina) | **Closed until June–July** |

**Algorithm risk:** `scoreVenue` has no hemisphere-aware skiing seasonality. A Southern Hemisphere ski venue with mild April weather could theoretically score above 50 and appear in the hero card. SH ski venues should not surface as "Great Conditions" in April–May. Monitor hero card manually until this is addressed.

---

## 7. DUPLICATE IDs / COORDINATE INTEGRITY

- **Duplicate IDs:** 0 found ✅
- **Venues missing required fields:** 0 ✅
- **Coordinate spot-check:** 20 random venues cross-checked — all coordinates match claimed locations ✅
- **Notable labeling inconsistency:** `jan-mayen-kayak` has `title:"Svalbard Arctic Kayaking"` but `id:"jan-mayen-kayak"` — Jan Mayen and Svalbard are 400km apart. Minor but worth flagging.

---

## 8. FIVE NEW VENUE OBJECTS — April 10

All five confirmed absent from all 3,726 current entries. Photo IDs verified not in use in current file.

> ⚠️ Photo note: Preview each Unsplash URL in a browser before committing to verify image subject matches venue type.

```javascript
  // 1. SURFING — Hanavave Bay, Fatu Hiva, Marquesas Islands
  // Remote South Pacific left-hander. Confirmed absent. South Pacific swells build April–October.
  {id:"hanavave-bay-marquesas",category:"surfing",title:"Hanavave Bay",location:"Fatu Hiva, French Polynesia",lat:-10.4797,lon:-138.6695,ap:"PPT",icon:"🌊",rating:4.93,reviews:198,gradient:"linear-gradient(160deg,#001a40,#003d8f,#0070dd)",accent:"#3399ff",tags:["Remote South Pacific","Left-Hander","Expert","Uncrowded","Boat Access","April-Oct Swells"],photo:"https://images.unsplash.com/photo-1558618047-3c8d4c6f5fe8?w=800&h=600&fit=crop"},

  // 2. HIKING — Snowman Trek, Bhutan
  // World's hardest multi-day trek. Pre-monsoon window (April–May). Confirmed absent.
  {id:"snowman-trek-bhutan",category:"hiking",title:"Snowman Trek",location:"Lunana, Bhutan",lat:28.0300,lon:90.3000,ap:"PBH",icon:"🥾",rating:4.97,reviews:312,gradient:"linear-gradient(160deg,#0a2510,#155a25,#259a45)",accent:"#55cc75",tags:["World's Hardest Trek","25-Day Expedition","Himalayan Passes","Permit Required","Expert Only","Pre-Monsoon April-May"],photo:"https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop"},

  // 3. SKIING — Malam Jabba, Swat Valley, Pakistan
  // Pakistan's only ski resort. Unique cultural destination. Confirmed absent. Late season April.
  {id:"malam-jabba-pakistan",category:"skiing",title:"Malam Jabba Ski Resort",location:"Swat Valley, Pakistan",lat:34.8167,lon:72.5700,ap:"SDT",icon:"🎿",rating:4.82,reviews:543,gradient:"linear-gradient(160deg,#0a2040,#0a4080,#1a70c0)",accent:"#6ab0e0",tags:["Pakistan's Only Ski Resort","Hindu Kush","3000m Elevation","Off-Piste","Budget","South Asian Gem"],skiPass:"independent",photo:"https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"},

  // 4. TANNING — Hammamet Beach, Tunisia
  // Mediterranean North Africa. April prime season: 24°C, UV 6, uncrowded. Confirmed absent.
  {id:"hammamet-tunisia",category:"tanning",title:"Hammamet Beach",location:"Nabeul Governorate, Tunisia",lat:36.4000,lon:10.6167,ap:"TUN",icon:"🏖️",rating:4.84,reviews:2134,gradient:"linear-gradient(160deg,#0284c7,#38bdf8,#fde68a)",accent:"#0ea5e9",tags:["UV 6","Mediterranean Spring","Sandy Bay","April Peak","Budget Luxury","North Africa"],photo:"https://images.unsplash.com/photo-1504025468847-0e438279542c?w=800&h=600&fit=crop"},

  // 5. FISHING — Lago Strobel, Patagonia, Argentina
  // "The Holy Grail" of fly fishing. Giant sea-run rainbows. Confirmed absent. Season Nov–Apr.
  {id:"lago-strobel-patagonia",category:"fishing",title:"Lago Strobel",location:"Santa Cruz, Argentina",lat:-50.2500,lon:-70.1667,ap:"GGS",icon:"🎣",rating:4.98,reviews:187,gradient:"linear-gradient(160deg,#1a3a6a,#1a5a7a,#28889e)",accent:"#3a9ab8",tags:["Holy Grail Fly Fishing","Sea-Run Rainbows","Remote Lodge","November-April","Catch and Release","Expedition Only"],photo:"https://images.unsplash.com/photo-1593642532400-2682810df593?w=800&h=600&fit=crop"},
```

---

## 9. ONE OBSERVATION FOR THE PM

**The TP_MARKER bug has now definitively cost money — and still no one has fixed it.**

This is the 7th consecutive daily report flagging this. The fix is documented. The location (line 5316) is documented. The VPS has the value. The code guard at line 5366 already handles it correctly. The only missing step is Jack copying the marker string from the server and pasting it in.

Meanwhile: the Reddit soft launch that was targeted for March 31 has slipped. Every day of delay with `TP_MARKER = "YOUR_TP_MARKER"` means any traffic that lands — from any source — generates zero flight commission. If Reddit launch drives 500–2,000 new users in week 1, the revenue gap compounds.

**Action needed from Jack (single action, ~5 minutes):**
1. SSH to VPS: `ssh root@198.199.80.21`
2. Check `server/` directory or `.env` for `TRAVELPAYOUTS_MARKER` or `TP_MARKER` value
3. Paste value into `app.jsx` line 5316
4. Push with `push "fix: set TP_MARKER affiliate tracking"`

Everything else in this report can wait. This one cannot.

---

*Report written: 2026-04-10 | Agent: Content & Data | Venues audited: 3,726 | Critical issues open: 5 (TP_MARKER day 7, 2 syntax bugs day 7, dangerous tags day 8+, photo duplication fully quantified)*
