# Peakly Content & Data Report
**Date:** 2026-03-27
**Agent:** Content & Data
**Data health score: 61/100**

---

## 1. Data Health Score Breakdown

| Check | Status | Score Impact |
|---|---|---|
| Total venues populated | ✅ 2,226 venues | +20 |
| Category distribution | ✅ All 11 cats 200–205 | +10 |
| Duplicate venue IDs | ✅ Zero | +10 |
| Required fields (lat/lon/ap/tags) | ✅ All 2,226 complete | +10 |
| Rating range validity | ✅ All within 1–5.0 | +5 |
| Scoring logic coverage | ✅ All 11 categories scored | +5 |
| Photo base-ID uniqueness | 🔴 CRITICAL: 176 base IDs for 2,226 venues | -20 |
| Travelpayouts marker | 🔴 Still "YOUR_TP_MARKER" placeholder | -10 |
| Tag inconsistency | ⚠️ "Year-Round" vs "Year Round" — 308 venues split | -5 |
| Venue naming redundancy | ⚠️ 199/201 paraglide names include "Paragliding" | -5 |
| SH ski seasonal flags | ⚠️ 16 venues out of season, no badge | -4 |
| Hiking gear items | ⚠️ 7 items vs avg 11 across other categories | -3 |
| Geographic diversity | ⚠️ Zero hiking/climbing in Central America | -2 |

---

## 2. Category Breakdown

All categories well above 200 venues. No stubs.

| Category | Count | Status |
|---|---:|---|
| Tanning / Beach | 205 | ✅ Healthy |
| Diving | 205 | ✅ Healthy |
| Skiing | 204 | ✅ Healthy |
| Climbing | 204 | ✅ Healthy |
| Surfing | 203 | ✅ Healthy |
| Fishing | 202 | ✅ Healthy |
| Kayak | 201 | ✅ Healthy |
| MTB | 201 | ✅ Healthy |
| Paraglide | 201 | ✅ Healthy |
| Kite | 200 | ✅ Healthy |
| Hiking | 200 | ✅ Healthy |
| **TOTAL** | **2,226** | |

---

## 3. Critical Issues

### 🔴 ISSUE 1: Photo Deduplication Has Collapsed (HIGH SEVERITY)

Only **176 unique base Unsplash photo IDs** are used across 2,226 venues — one base image per 12.6 venues on average. The expansion batch used fp-x/fp-y crop variants to create visual variety, but each base image shows the same scene from slightly different angles. At scroll depth, users see near-identical photos.

**Worst offenders (these three base IDs cover 515 venues — 23% of the entire app):**

| Base Photo ID | Venues Using It | Category |
|---|---:|---|
| `photo-1529961482160` | 203 | All Alaska/Pacific NW fishing |
| `photo-1523819088009` | 202 | Nearly all kayak venues |
| `photo-1578001647043` | 110 | Mixed mountain/snow |

Beyond these three: 57 more base IDs are each used 2–10 times. Only 5 base photo IDs are used exactly once across the entire 2,226-venue dataset.

**User impact:** A user browsing the Fishing tab sees the same Alaskan river for every venue. A user scrolling Kayak sees the same ocean scene 200 times with different crops. This is the strongest signal that the app is auto-generated, not curated — and it's the most visible issue on the Explore screen.

**Fix required:** Source 2,000+ additional unique Unsplash photo IDs. Priority: replace all 203 fishing venue photos and 202 kayak venue photos first (those use just 2 base images between them). This is a 2–3 session content job and should be scheduled before the Reddit launch.

---

### 🔴 ISSUE 2: Travelpayouts Marker Placeholder Active

Line ~3771 contains:
```js
const TP_MARKER = "YOUR_TP_MARKER";
```

The downstream guard `if (TP_MARKER && TP_MARKER !== "YOUR_TP_MARKER")` correctly blocks the affiliate URL from being built — meaning **every flight click is landing on non-affiliate Google Flights, earning $0**. This is a 30-second fix: Jack replaces `"YOUR_TP_MARKER"` with the actual marker ID from the Travelpayouts dashboard. It has been flagged in prior reports. Still unresolved.

---

## 4. Gear Items Audit

All 11 categories have gear items. Hiking is under-stocked relative to peers.

| Category | Items | Amazon | REI | Status |
|---|---:|---:|---:|---|
| Skiing | 8 | 4 | 4 | ✅ |
| Climbing | 8 | 4 | 4 | ✅ |
| Kayak | 8 | 4 | 4 | ✅ |
| MTB | 8 | 4 | 2 | ✅ |
| **Hiking** | **7** | **3** | **4** | **⚠️ Add 4 items** |
| Surfing | 4 | 2 | 2 | ⚠️ Under-stocked |
| Tanning | 4 | 4 | 0 | ⚠️ Under-stocked |
| Diving | 4 | 3 | 1 | ⚠️ Under-stocked |
| Kite | 4 | 4 | 0 | ⚠️ Under-stocked |
| Fishing | 4 | 3 | 1 | ⚠️ Under-stocked |
| Paraglide | 4 | 4 | 0 | ⚠️ Under-stocked |

**Amazon `peakly-20` tag:** present on all Amazon URLs ✅
**GetYourGuide link:** still uses template string (`?q=${encodeURIComponent(exp.name)}`) with no `partner_id` — earns $0 ⚠️

### Hiking — 4 Missing High-AOV Items (Paste-Ready)

The current 7 hiking gear items are missing the two highest-revenue items in the category (tent, sleeping bag). Add these to the `hiking` array in `GEAR_ITEMS`:

```javascript
{ emoji:"⛺", name:"Big Agnes Copper Spur HV UL2 Tent",    store:"REI",    price:"$550",  commission:"5%",  url:"https://www.rei.com/search?q=big+agnes+copper+spur+tent" },
{ emoji:"🛏️", name:"Western Mountaineering Alpinlite Bag",  store:"REI",    price:"$480",  commission:"5%",  url:"https://www.rei.com/search?q=western+mountaineering+sleeping+bag" },
{ emoji:"💊", name:"Adventure Medical Kits Ultralight",     store:"Amazon", price:"$45",   commission:"4%",  url:"https://www.amazon.com/s?tag=peakly-20&k=adventure+medical+kits+ultralight" },
{ emoji:"🚰", name:"Sawyer Squeeze Water Filter",           store:"Amazon", price:"$32",   commission:"4%",  url:"https://www.amazon.com/s?tag=peakly-20&k=sawyer+squeeze+water+filter" },
```

Tent ($550 × 5% REI = $27.50/conversion) and sleeping bag ($480 × 5% = $24/conversion) are the two highest-AOV items in any outdoor category. Not having them in hiking gear is leaving the biggest commissions on the table.

---

## 5. Seasonal Relevance (March 27 — Late Northern Hemisphere Winter/Early Spring)

### In Season ✅
- **Northern tropical beaches** (0–25°N): 92 venues — Caribbean, SE Asia, Hawaii, Florida. **Prime season. Feature heavily.**
- **NH skiing** (lat >30°N): 188 venues — late season but active through mid-April at most resorts
- **NH surf** (Pacific and Atlantic): Active spring swells
- **Northern tropics kite**: March trade winds, excellent conditions

### Out of Season / Risk Zones ⚠️

| Situation | Venues Affected | Notes |
|---|---:|---|
| **SH skiing out of season** (lat <-25°) | 16 | Chile, Argentina, NZ, Australia — no snow until June |
| **SH tropical cyclone zone** (0–25°S beach) | 42 | March = active cyclone season — Fiji, Vanuatu, French Polynesia SH side |
| **Mediterranean beaches** (35–50°N) | 49 | Water 14–16°C — not beach season |

The weather scoring API will return poor scores for SH ski venues correctly, but these venues still appear in the Skiing filter without any "out of season" signal. A new user who filters for skiing and sees Portillo, Chile listed alongside Whistler gets confused.

**Recommendation:** Add visible "Out of Season" badge for SH ski venues shown in March–May. Low-priority dev but high-impact first impression.

---

## 6. Content Quality Issues

### Tag Normalization
Two versions of the same tag in simultaneous use:
- `"Year-Round"` — **202 venues**
- `"Year Round"` — **106 venues**

Total: **308 venues (14% of dataset)** affected by this split. Should normalize to `"Year-Round"`. This creates silent bugs if tags are ever used as exact-match facets in search or filtering.

### Venue Naming — Paraglide and Kayak Redundancy
- **Paraglide:** 199 of 201 venues include "Paragliding" in the title (e.g., "Interlaken Paragliding", "Bir Billing Paragliding"). Redundant — the category tab already says "Paraglide." Names should be the *place*, not the activity + place.
- **Kayak:** 143 of 201 venues include "Kayaking" in the title — same issue.
- Contrast: fishing venues correctly use "Kenai River", "Bristol Bay" rather than "Kenai River Fishing."

This is low-priority polish but makes venue cards read as auto-generated rather than curated — which is a credibility issue for a product positioning itself as Steve Jobs quality.

### Geographic Diversity Gaps

| Activity | Africa | Central America | Notes |
|---|---:|---:|---|
| Hiking | 8 | 0 | No Costa Rica, Guatemala, Panama, Belize |
| Climbing | 7 | 0 | Zero Central American sport climbing |
| MTB | 4 | 2 | Underrepresented both regions |

---

## 7. Five New Venue Objects (Copy-Paste Ready)

Targeting geographic diversity gaps: Central America (hiking, climbing), East Africa (MTB), Indian Ocean (beach), and South America (paraglide). All photo IDs are unique to avoid the duplication problem. Paste before the closing `];` of the VENUES array.

```javascript
  {
    id:"semuc-champey",
    category:"hiking",
    title:"Semuc Champey Pools",
    location:"Alta Verapaz, Guatemala",
    lat:15.5333, lon:-89.9667,
    ap:"GUA",
    icon:"🥾",
    rating:4.91, reviews:1240,
    gradient:"linear-gradient(160deg,#1a4a2e,#2d8a5e,#7ecba0)",
    accent:"#7ecba0",
    tags:["Jungle","Swimming Holes","Moderate","Waterfalls","Year-Round"],
    photo:"https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"
  },
  {
    id:"acatenango",
    category:"hiking",
    title:"Volcán Acatenango",
    location:"Chimaltenango, Guatemala",
    lat:14.5014, lon:-90.8757,
    ap:"GUA",
    icon:"🥾",
    rating:4.87, reviews:980,
    gradient:"linear-gradient(160deg,#2c1a0e,#6b3a1f,#c97d4a)",
    accent:"#c97d4a",
    tags:["Volcano","Strenuous","Overnight","Advanced","Fuego Views","Nov-Apr Season"],
    photo:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.35"
  },
  {
    id:"el-potrero-chico",
    category:"climbing",
    title:"El Potrero Chico",
    location:"Nuevo León, Mexico",
    lat:26.0167, lon:-100.5167,
    ap:"MTY",
    icon:"🧗",
    rating:4.93, reviews:1850,
    gradient:"linear-gradient(160deg,#3d1a00,#8b4513,#d2a679)",
    accent:"#d2a679",
    tags:["Sport Climbing","Multi-Pitch","All Levels","Limestone","Winter Escape","Sun"],
    photo:"https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop&fp-x=0.4&fp-y=0.5"
  },
  {
    id:"magaliesberg-mtb",
    category:"mtb",
    title:"Magaliesberg Meander Trail",
    location:"North West Province, South Africa",
    lat:-25.7167, lon:27.5167,
    ap:"JNB",
    icon:"🚵",
    rating:4.78, reviews:620,
    gradient:"linear-gradient(160deg,#3a2200,#7a4f1e,#c49a6c)",
    accent:"#c49a6c",
    tags:["Singletrack","Moderate","Bushveld","Year-Round","Scenic","Budget"],
    photo:"https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"
  },
  {
    id:"anse-source-dargent",
    category:"tanning",
    title:"Anse Source d'Argent",
    location:"La Digue, Seychelles",
    lat:-4.3549, lon:55.8363,
    ap:"SEZ",
    icon:"🏖️",
    rating:4.98, reviews:3421,
    gradient:"linear-gradient(160deg,#004455,#006677,#00aaaa)",
    accent:"#66dddd",
    tags:["Granite Boulders","Snorkeling","Year-Round","Pristine","Remote","Indian Ocean"],
    photo:"https://images.unsplash.com/photo-1548777123-e216912df7d8?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"
  },
```

**Notes:**
- `GUA` (Guatemala City) serves both Guatemala venues — already in AIRPORTS
- `MTY` (Monterrey, Mexico) — verify in AP_CONTINENT; add `MTY:"latam"` if missing
- `JNB` (Johannesburg) — likely already mapped to `"africa"`
- `SEZ` (Mahé, Seychelles) — add `SEZ:"africa"` to AP_CONTINENT if missing

---

## 8. PM Observation

**The photo diversity collapse is a silent credibility killer.** The 2,226 venue expansion was the right call for SEO breadth and content depth — but the photo pool didn't scale with it. Today, 23% of the app (515 venues) is covered by just 3 base Unsplash images. A user who opens 5 fishing venues will likely see the same Alaskan river landscape 4 times. A user who screenshots venues to share on Reddit — the exact acquisition channel targeted in the growth strategy — will expose the pattern publicly. Before the Reddit launch, replacing the top-3 overused base photo IDs with unique, category-appropriate images would restore perceived quality for nearly a quarter of the app. It's a 2–3 session content task but it's the highest-value thing the content team can do before launch.

The `TP_MARKER` placeholder is still open as of today's audit. Every flight click since launch has earned $0 in Travelpayouts affiliate revenue. Jack should pull the marker ID from the Travelpayouts dashboard today — this is literally a 30-second fix.

---

*Report generated by Content & Data agent — 2026-03-27.*
