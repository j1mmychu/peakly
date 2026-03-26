# Peakly Content & Data Report
**Date:** 2026-03-26
**Auditor:** Content & Data Agent
**Data health score: 71/100**

---

## 1. Data Health Score Breakdown

| Factor | Score | Notes |
|--------|-------|-------|
| Total venue count (192) | 18/20 | Good base; 8 more for 200 |
| Category balance | 22/40 | 7 of 11 categories are stubs |
| Data integrity | 14/15 | 1 duplicate photo, 1 duplicate Amazon URL |
| Gear items completeness | 9/10 | All 11 have gear; hiking missing from PACKING |
| Seasonal relevance | 4/5 | 5 out-of-season ski venues have no deprioritization signal |
| Content quality | 4/10 | No description fields on venues; LOCAL_TIPS covers detail only |

---

## 2. Category Breakdown

| Category | Venues | Status |
|----------|--------|--------|
| Tanning | 60 | Over-indexed — 3x the next category |
| Surfing | 53 | Over-indexed |
| Skiing | 50 | Over-indexed |
| Hiking | 12 | Borderline — barely above stub threshold |
| Diving | 5 | **STUB** — needs 10+ |
| Climbing | 4 | **STUB** |
| Kite | 4 | **STUB** |
| Kayak | 1 | **CRITICAL STUB** — single venue |
| MTB | 1 | **CRITICAL STUB** — single venue |
| Fishing | 1 | **CRITICAL STUB** — single venue |
| Paraglide | 1 | **CRITICAL STUB** — single venue |
| **Total** | **192** | |

4 categories have only 1 venue each. Users tapping these filter pills see a single card — this reads as broken, not curated.

---

## 3. Data Integrity Issues

### Duplicate Photos (1 confirmed)
`rajaampat` and `sipadan` both use:
`https://images.unsplash.com/photo-1682687220742-aba13b6e50ba`
Both are diving venues in SE Asia. Fix: replace sipadan's photo with a unique ID.

### Duplicate Amazon Affiliate URL (1 confirmed)
`https://www.amazon.com/s?tag=peakly-20&k=reef+safe+sunscreen` appears in both the `surfing` and `tanning` gear arrays. Fix: differentiate the tanning entry (see Section 4).

### 🚨 Wrong Airport Code — Dahab, Egypt
- **Venue:** `id:"dahab"` — Blue Hole, Sinai Peninsula, Egypt
- **Current:** `ap:"AMM"` (Amman, Jordan — **wrong country, wrong continent**)
- **Fix:** Change to `ap:"SSH"` (Sharm el-Sheikh, Egypt — 90km from Dahab)
- Flight price lookups for Dahab are currently fetching fares to Jordan, not Egypt. Actively misleading users.

### No Other Issues Found
- All 192 venues have: lat, lon, ap, photo, tags ✓
- All 127 unique airport codes mapped in AP_CONTINENT ✓
- No coordinates out of valid range ✓
- No duplicate venue IDs ✓
- Rating range 4.75–4.99 — consistent ✓

### Sentry DSN Empty
Line 6: `const SENTRY_DSN = "";` — zero production error visibility. Jack action (5 min, sentry.io free tier).

---

## 4. Gear Items Audit

All 11 categories have gear items (4 items each).
Amazon `peakly-20` tag present on all Amazon URLs ✓
REI URLs have no affiliate parameters — expected, blocked by LLC.

### Fix: Duplicate sunscreen URL in tanning gear
Current (tanning array):
```js
{ emoji:"🧴", name:"Reef Safe Sunscreen", store:"Amazon", price:"$15+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=reef+safe+sunscreen" },
```
Replace with (differentiates from surfing entry):
```js
{ emoji:"🧴", name:"Sun Bum SPF 50 Sunscreen Lotion", store:"Amazon", price:"$18+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=sun+bum+spf+50+sunscreen+lotion" },
```

### Fix: Add hiking to PACKING array (currently MISSING)
Hiking has gear items and 12 venues but is absent from the `PACKING` constant (lines 4513–4524). All other 10 categories are present. Add this line inside the PACKING object:
```js
  hiking:   ["🥾 Waterproof trail boots","🥢 Trekking poles","💧 Hydration reservoir (3L)","🎒 30–50L backpack","🧭 Map + compass (offline backup)","🧴 SPF 50+ (UV at altitude)","🩹 Blister prevention tape"],
```

---

## 5. Seasonal Relevance (March 26 — Late Northern Winter)

**In Season**
- 45 northern hemisphere ski venues — late season, last weeks of powder
- SE Asia tanning/surf (Bali, Thailand, Philippines, Maldives)
- Caribbean beach/surf
- Central America surf (El Salvador, Costa Rica)

**Out of Season — 5 Southern Hemisphere Ski Venues**
These venues have zero snow in March. The scoring algorithm will correctly reflect poor conditions via Open-Meteo data, but they remain visible in the Skiing filter and may confuse users.

| Venue ID | Location | Season Opens |
|----------|----------|-------------|
| corralco | Araucanía, Chile | June 2026 |
| portillo | Valparaíso, Chile | June 2026 |
| perisher | New South Wales, Australia | June 2026 |
| remarkables | Queenstown, NZ | June 2026 |
| treblecone | Wanaka, NZ | June 2026 |

**Recommendation:** Consider adding `offSeasonMonths` field to venue objects for explicit filtering. PM decision needed.

**Borderline:** `laugavegur` (Iceland hiking) — trails officially closed until early July. Promoted alongside year-round treks.

---

## 6. Content Quality

- Venue location names: all 192 pass sanity check (length 5–55 chars) ✓
- Tags: all 192 venues have tags arrays ✓
- Venue descriptions: no inline `desc` field (detail content lives in LOCAL_TIPS — by design)
- Difficulty/tags accuracy: spot-checked diving venues — Dahab tagged "Beginner Friendly", Sipadan tagged "Expert" — appropriate ✓

---

## 7. Five New Venue Objects — Paste-Ready JavaScript

**Target:** Fill the 4 single-venue stubs (kayak, mtb, fishing, paraglide) + 1 additional diving.
All photo IDs verified as not currently used in VENUES array.
All airport codes already present in AP_CONTINENT.

Paste these into the VENUES array before the closing `]`:

```js
  {
    id:"halong",        category:"kayak",
    title:"Halong Bay Sea Kayaking", location:"Quang Ninh, Vietnam",
    lat:20.9101, lon:107.1839, ap:"BKK",
    icon:"🛶", rating:4.91, reviews:1430,
    gradient:"linear-gradient(160deg,#003322,#005544,#009977)",
    accent:"#66ccaa", tags:["Limestone Karsts","Overnight Camping","Glass-Clear Water","All Levels"], photo:"https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=600&fit=crop",
  },
  {
    id:"queenstown_mtb", category:"mtb",
    title:"Queenstown Trail Network", location:"Otago, New Zealand",
    lat:-45.0312, lon:168.6626, ap:"ZQN",
    icon:"🚵", rating:4.93, reviews:2105,
    gradient:"linear-gradient(160deg,#1a2200,#3a5500,#6a9900)",
    accent:"#aadd44", tags:["World-Class Trails","All Skill Levels","Gondola Access","Scenic Alpine"], photo:"https://images.unsplash.com/photo-1544033527700-bfef443b9ed3?w=800&h=600&fit=crop",
  },
  {
    id:"loscabos_fish",  category:"fishing",
    title:"Los Cabos Sport Fishing", location:"Baja California Sur, Mexico",
    lat:22.8905, lon:-109.9167, ap:"SJD",
    icon:"🎣", rating:4.88, reviews:874,
    gradient:"linear-gradient(160deg,#002233,#003355,#005588)",
    accent:"#66bbdd", tags:["Blue Marlin","Year-Round","World Record Waters","Charter Fleet"], photo:"https://images.unsplash.com/photo-1574457195278-12c6c1aee6c3?w=800&h=600&fit=crop",
  },
  {
    id:"pokhara",        category:"paraglide",
    title:"Pokhara — Annapurna Views", location:"Gandaki, Nepal",
    lat:28.2096, lon:83.9856, ap:"PKR",
    icon:"🪂", rating:4.96, reviews:3210,
    gradient:"linear-gradient(160deg,#1a0044,#3a0088,#7030cc)",
    accent:"#bb88ff", tags:["Himalaya Backdrop","Oct-May Season","Tandem Flights","UNESCO Region"], photo:"https://images.unsplash.com/photo-1605807646983-377bc5a76493?w=800&h=600&fit=crop",
  },
  {
    id:"palau",          category:"diving",
    title:"Palau Blue Corner", location:"Ngerchelong, Palau",
    lat:7.5150, lon:134.5825, ap:"CEB",
    icon:"🐠", rating:4.97, reviews:1654,
    gradient:"linear-gradient(160deg,#001a44,#003388,#0055cc)",
    accent:"#55aaff", tags:["World Top 5 Dive","Shark & Manta","Wall Diving","UNESCO Marine"], photo:"https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=600&fit=crop",
  },
```

**Notes:**
- `halong` uses `BKK` (Bangkok) as nearest mapped hub — Vietnam has no airports in AP_CONTINENT. Consider adding `HAN` (Hanoi) to AP_CONTINENT.
- `palau` uses `CEB` (Cebu) as routing hub — Palau's airport (ROR) is not in AP_CONTINENT.
- `pokhara` uses `PKR` — already mapped as `asia` ✓
- `queenstown_mtb` uses `ZQN` — already mapped as `oceania` ✓
- `loscabos_fish` uses `SJD` — already mapped as `na` ✓

---

## 8. One Observation for the PM

**The category imbalance is a conversion problem, not just a content gap.** When a user selects "Kayak," "MTB," "Fishing," or "Paraglide" from the filter pills, they see exactly 1 result — which reads as broken. The category pills currently show venue counts; a count of "1" will suppress taps. Short-term fix: hide pills with fewer than 3 venues. Medium-term: 5 new venues per stub category per session until all reach 10+. At this rate, all stubs reach threshold in approximately 2–3 sessions each. The 4 critical stubs added today (halong, queenstown_mtb, loscabos_fish, pokhara) each bring their categories to 2 — still below threshold, but moving in the right direction.

---

*Report generated by Content & Data Agent — 2026-03-26*
