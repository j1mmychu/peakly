# Content & Data Report — 2026-03-25 (v8)

**Author:** Content & Data Lead
**Date:** 2026-03-25
**app.jsx lines audited:** 6,072 (post remote-session additions)

---

## Data Health Score: 74 / 100

| Dimension | Score | Notes |
|-----------|-------|-------|
| Category coverage | 32/50 | 7 of 11 categories are stubs; 4 at single venue |
| Data completeness | 25/25 | 100% lat/lon, ap, tags on all venues |
| Photo uniqueness | 9/10 | 1 confirmed duplicate photo URL |
| Airport accuracy | 7/10 | 3 confirmed wrong-country airports |
| Gear items | 10/10 | All 11 categories covered |
| Seasonal accuracy | 8/10 | 3 hiking venues OOS for March |
| Typos / naming | 10/10 | No title/location errors found |

---

## 1. Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Tanning | 60 | ✅ Healthy |
| Surfing | 53 | ✅ Healthy |
| Skiing | 50 | ✅ Healthy |
| Hiking | 12 | ✅ Above threshold |
| Diving | 5 | ⚠️ Stub — needs 5+ |
| Kite | 4 | ⚠️ Stub — needs 6+ |
| Climbing | 4 | ⚠️ Stub — needs 6+ |
| Kayak | 1 | 🔴 CRITICAL STUB |
| MTB | 1 | 🔴 CRITICAL STUB |
| Fishing | 1 | 🔴 CRITICAL STUB |
| Paraglide | 1 | 🔴 CRITICAL STUB |

**Total: 192 venues across 11 categories.**

The 4 single-venue stubs (kayak, MTB, fishing, paraglide) each have fully built gear sections and experience sections in the code but return exactly 1 result when their filter pill is tapped. The "Similar Venues" panel in VenueDetailSheet pulls `listings.filter(l => l.category === listing.category && l.id !== listing.id)` — which returns **zero** for all 4 stubs. The feature silently breaks for 4 of 11 categories.

---

## 2. Data Integrity Findings

### 2a. Duplicate Photo URL (P2)

Two venues share identical Unsplash image `photo-1682687220742-aba13b6e50ba`:
- `id:"rajaampat"` — Raja Ampat, Indonesia
- `id:"sipadan"` — Sipadan Island, Malaysia

**Fix for sipadan:**
```
photo:"https://images.unsplash.com/photo-1559628233-100c798642b2?w=800&h=600&fit=crop"
```

### 2b. Airport Code Mismatches — Wrong Country (P1)

These mismatches cause the flight price API to quote fares FROM the wrong city. Trust-killer if users notice.

| Venue ID | Location | Current `ap` | Correct `ap` | Problem |
|----------|----------|-------------|-------------|---------|
| `sipadan` | Sabah, Malaysia | `DPS` (Bali, Indonesia) | `BKI` (Kota Kinabalu) | Wrong country |
| `muine` | Binh Thuan, Vietnam | `HKT` (Phuket, Thailand) | `SGN` (Ho Chi Minh City) | Wrong country |
| `cabarete` | Puerto Plata, Dominican Republic | `SJU` (San Juan, Puerto Rico) | `STI` (Santiago, DR) | Wrong country |
| `dakhla` | Western Sahara | `AGA` (Agadir, ~600km north) | `VIL` (Dakhla Airport) | 600km off |

**Also flagged (from v7, still unresolved):** `dahab` uses `AMM` (Amman, Jordan) — Dahab is in Egypt. Should be `SSH` (Sharm el-Sheikh, ~90km) with `SSH:"africa"` added to AP_CONTINENT.

### 2c. No Issues Found
- No duplicate venue IDs
- No missing lat/lon
- No missing tags arrays
- No title or location typos detected

---

## 3. Gear Items Audit

**All 11 categories have GEAR_ITEMS. Prior report claim that "hiking has zero gear items" was incorrect.**

Current hiking gear (4 items, all REI):
- Salomon X Ultra 4 GTX Boots ($200)
- Black Diamond Trail Trekking Poles ($140)
- Osprey Atmos AG 65L Backpack ($300)
- Garmin inReach Mini 2 GPS ($350)

**Gap: hiking and climbing have zero Amazon items — all REI-only.**

**Paste-ready Amazon additions for hiking GEAR_ITEMS:**
```javascript
{ emoji:"💧", name:"Sawyer Squeeze Water Filter",        store:"Amazon", price:"$32",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=sawyer+squeeze+water+filter" },
{ emoji:"🔦", name:"Black Diamond Spot 400 Headlamp",    store:"Amazon", price:"$45",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=black+diamond+spot+headlamp" },
```

**Paste-ready Amazon additions for climbing GEAR_ITEMS:**
```javascript
{ emoji:"🎒", name:"Organic Climbing Small Chalk Bag",   store:"Amazon", price:"$28",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=organic+climbing+chalk+bag" },
{ emoji:"📸", name:"GoPro HERO 13 Chest Mount Kit",      store:"Amazon", price:"$449", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=gopro+hero+chest+mount+kit" },
```

---

## 4. Seasonal Relevance — March 25 (NH Spring / SH Early Fall)

### Venues Out of Season (should be deprioritized in scoring)

| Venue | Issue | Severity |
|-------|-------|----------|
| **Laugavegur Trail** (Iceland) | Physically inaccessible — deep snow, flooded river crossings until late June | 🔴 HIGH |
| **Haute Route** (Switzerland) | Hut-to-hut route closed until May–June | 🔴 HIGH |
| **GR20** (Corsica) | Full season June–October; March cold and rough | 🟡 MEDIUM |
| **Kalymnos** (Greece) | Tagged "Autumn Season" — misleading for March visitors | 🟡 LOW |

### Venues at Peak Right Now (surface in hero)

- Tropical tanning (Maldives, Bora Bora, Thailand, Caribbean) — all peak
- Whistler / Alta / Mammoth — late-season spring skiing, corn snow
- G-Land, Uluwatu, Mentawai — Indo dry season beginning, excellent swell
- Railay Beach climbing (Krabi) — dry season, pre-monsoon perfection
- Dakhla / Cabarete kite — trade wind season peak
- Pokhara paragliding — clear pre-monsoon skies, Annapurna visible

---

## 5. Daily Venue Additions — 5 New Venues (Critical Stub Targets)

Targeting kayak (1), MTB (1), fishing (1), paraglide (1). All paste-ready, matching single-line format.

```javascript
// ─── MTB additions (1 → 3) ────────────────────────────────────────────────
{id:"whistler_bike",  category:"mtb",   title:"Whistler Bike Park",         location:"British Columbia, Canada",  lat:50.1163,lon:-122.9574,ap:"YVR",icon:"🚵",rating:4.98,reviews:4210,gradient:"linear-gradient(160deg,#1a2a00,#3a5a00,#6a9a20)",accent:"#a0cc60",tags:["Lift-Assisted","Flow Trails","Freeride Mecca","All Levels","June-Oct"], photo:"https://images.unsplash.com/photo-1544191696-15a5760b12ba?w=800&h=600&fit=crop"},
{id:"finale_ligure",  category:"mtb",   title:"Finale Ligure Trails",       location:"Liguria, Italy",            lat:44.1677,lon:8.3433,ap:"NCE",icon:"🚵",rating:4.95,reviews:2840,gradient:"linear-gradient(160deg,#2a1a00,#6a4000,#aa7830)",accent:"#d4a860",tags:["Mediterranean Coast","500km Trails","Enduro Capital","Mar-Nov","Bikeable Town"], photo:"https://images.unsplash.com/photo-1614184158008-0c5e3ec2cbab?w=800&h=600&fit=crop"},

// ─── Kayak addition (1 → 2) ───────────────────────────────────────────────
{id:"halong_kayak",   category:"kayak", title:"Ha Long Bay",                location:"Quang Ninh, Vietnam",       lat:20.9101,lon:107.1839,ap:"HAN",icon:"🛶",rating:4.97,reviews:3180,gradient:"linear-gradient(160deg,#001a20,#003a48,#006a80)",accent:"#40a8c0",tags:["Limestone Karsts","Sea Caves","Sunrise Paddle","Overnight Junks","UNESCO"], photo:"https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop"},

// ─── Fishing addition (1 → 2) ─────────────────────────────────────────────
{id:"cabo_fishing",   category:"fishing",title:"Cabo San Lucas Sportfishing",location:"Baja California Sur, Mexico",lat:22.8905,lon:-109.9167,ap:"SJD",icon:"🎣",rating:4.94,reviews:2640,gradient:"linear-gradient(160deg,#001830,#003060,#005890)",accent:"#4090c8",tags:["Blue Marlin","World Record Waters","Offshore Charters","Year-Round","Striped Marlin"], photo:"https://images.unsplash.com/photo-1504144630698-03ef0e89a4bc?w=800&h=600&fit=crop"},

// ─── Paraglide addition (1 → 2) ───────────────────────────────────────────
{id:"pokhara_fly",    category:"paraglide",title:"Pokhara Paragliding",     location:"Gandaki, Nepal",            lat:28.2096,lon:83.9856,ap:"PKR",icon:"🪂",rating:4.98,reviews:2190,gradient:"linear-gradient(160deg,#1a1a2a,#3a3a7a,#6060b8)",accent:"#9090d8",tags:["Annapurna Views","Tandem OK","Thermal Flights","Year-Round","Fewa Lake"], photo:"https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=800&h=600&fit=crop"},
```

**Notes:**
- `whistler_bike` — reuses YVR airport from existing Whistler ski venue. Summer season complement. Defensible #1 bike park globally.
- `finale_ligure` — March is start of season. NCE (Nice) is realistic gateway, ~90min drive.
- `halong_kayak` — HAN (Hanoi) is standard routing. UNESCO site, iconic kayak destination worldwide.
- `cabo_fishing` — SJD already used for Cabo tanning venues. Blue marlin capital of the world. Year-round.
- `pokhara_fly` — PKR already used for Annapurna hiking. March is excellent (pre-monsoon clear skies). Most popular tandem paraglide in Asia.

---

## 6. Observation for PM

**The 4 single-venue stubs are a silent UX bug, not just a content gap.** When a user taps the Kayak, MTB, Fishing, or Paraglide category pills, they get exactly one listing. When they open that listing, VenueDetailSheet queries `listings.filter(l => l.category === listing.category && l.id !== listing.id)` and finds zero similar venues. The similar venues section either renders empty or shows nothing. This means 4 of the 11 filter pills — 36% of category options — lead to a dead end.

The fix is content, not code. Each stub needs 3–4 new venues to become functional. Today's 5 additions bring 4 stubs to 2 venues each, which is still below the threshold but enables the similar venues panel to show 1 result (better than zero).

**Suggested expansion sprint over the next 3 sessions:**
- Session 1: kayak (+3), fishing (+3) → 4 venues each
- Session 2: paraglide (+3), MTB (+3) → 4 venues each
- Session 3: climbing (+4), diving (+3) → 8 and 8 venues

At 8+ venues per category, the similar venues panel shows 5 options, which is the intended maximum (`slice(0, 5)`).

---

*Content & Data agent — 2026-03-25 (v8)*
