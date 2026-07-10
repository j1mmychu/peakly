# Peakly Content & Data Report — 2026-07-10

**Data health score: 82/100** | Build: `20260708a` (2 days stale) | Venues: **375** (133 ski / 242 beach) | Photo max repeat: 3× ✅

> Supersedes 2026-07-09. This run: lateSeason:true regression identified (4 venues lost flag — mammoth, abasin, tignes, chamonix), DevOps "lateSeason=9" count corrected to actual=5, 2 missing glacier ski venues re-staged (alpe-d-huez, cortina-d-ampezzo), 3 generic-tag venues remaining.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **375 venues, 2 categories only.** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "bigsky + beach_miami duplicates open" | **FIXED** (removed Jul 8). Stop re-raising. |
| "Photo 4× regression" | **FIXED** (max now 3×). Stop. |
| "Jul 8 beach venues not added" | **Essaouira, Cable Beach, Diani all added.** 2 more Jul 9 (Las Teresitas, Elafonissi). Stop. |

---

## 1. Data Integrity Audit

### Venue Counts

| Category | Count | In Season (Jul 10, N. Hemi Summer) |
|----------|-------|-------------------------------------|
| **Skiing** | 133 | 23 S. hemi at peak winter (NZ/Chile/AU/AR) · 5 `lateSeason:true` (see regression §2) · 105 N. hemi capped at score=8 |
| **Beach** | 242 | ~184 N. hemi at summer peak · ~58 S. hemi suppressed by <18°C water-temp cap |
| **TOTAL** | **375** | Bracket-walk eval (node). Never grep. |

### Structural Checks

| Check | Result |
|-------|--------|
| Duplicate IDs | ✅ 0 |
| Missing lat/lon | ✅ 0 |
| Missing airport codes | ✅ 0 |
| Missing tags | ✅ 0 |
| Missing photos | ✅ 0 |
| AIRPORT_COORDS coverage | ✅ All 144 unique venue APs registered |
| AP_CONTINENT coverage | ✅ All 144 venue APs registered |
| GEAR_ITEMS refs | ✅ 0 (cut for v1) |
| Photo max repeat | ✅ 3× (fixed Jul 8) |
| Duplicate venue pairs | ✅ 0 (fixed Jul 8) |
| **lateSeason:true count** | ⚠️ **5 actual** (DevOps report says 9 — overcounting, see §2) |
| **Generic placeholder tags** | ⚠️ 3 venues (whistler, beaver-creek, park-city-mountain) |
| **Missing glacier ski venues** | ⚠️ alpe-d-huez + cortina-d-ampezzo (2d pending) |

---

## 2. lateSeason Flag — Regression + DevOps Count Error

### Actual lateSeason:true Venues (5, confirmed via grep)

| ID | Venue | Why |
|----|-------|-----|
| `whistler` | Whistler Blackcomb | Horstman Glacier, summer ski |
| `cervinia` | Cervinia | Plateau Rosa glacier, year-round |
| `les-deux-alpes-fr` | Les Deux Alpes | 3600m glacier, July ski open |
| `saas-fee-ch` | Saas-Fee | Fee Glacier, car-free, year-round |
| `st-moritz-ch` | St. Moritz | Corvatsch summer glacier |

### DevOps "lateSeason=9" — OVERCOUNTED

DevOps report (Jul 10) claims lateSeason=9. `grep -c "lateSeason:true" app.jsx` → **5**. The overcounting likely uses the same broken block-parse that caused prior venue miscounts.

### Regression: 4 Venues Lost Their lateSeason Flag (P1)

All 4 were documented in CLAUDE.md as canonical `lateSeason:true` venues. In July they now score=8 "Off-season — resort closed":

| Venue | ID | Evidence of open-in-summer | Current flag |
|-------|----|---------------------------|-------------|
| Chamonix-Mont-Blanc | `chamonix` | Vallée Blanche, Aug glacier skiing | ❌ MISSING |
| Mammoth Mountain | `mammoth` | Tag "Late Season", July ops at 11k ft | ❌ MISSING |
| Arapahoe Basin | `abasin` | Tag "Longest Season CO", summer weekends | ❌ MISSING |
| Tignes / Val d'Isère | `tignes` | Tag "Summer Glacier", Grande Motte Jul–Aug | ❌ MISSING |

**Paste-ready fix — add `lateSeason:true,` to each venue block:**

```js
// Find id:"chamonix" block → add before closing }:
lateSeason:true,

// Find id:"mammoth" block → add before closing }:
lateSeason:true,

// Find id:"abasin" block → add before closing }:
lateSeason:true,

// Find id:"tignes" block → add before closing }:
lateSeason:true,
```

After fix: **9 lateSeason:true total** — matches what DevOps was projecting (they were right on the target, wrong on current state).

---

## 3. Photo Audit

| Metric | Value |
|--------|-------|
| Total venues | 375 |
| Unique photos | 143 |
| Average reuse | 2.62× |
| Photos used 1× | 11 |
| Photos used 2× | 32 |
| Photos used 3× | 100 |
| Photos used 4+ | 0 |
| **Max repeat** | **3×** ✅ |

No regression from Jul 8 fix. Further improvement (≤2×) requires ~100 new Unsplash IDs — deferred per CLAUDE.md.

---

## 4. Affiliate IDs

| Stream | ID | Status |
|--------|----|--------|
| Booking.com | `aid=2311236` | ✅ |
| SafetyWing | `referenceID=peakly` | ✅ |
| Travelpayouts | `marker=710303` | ✅ |
| Amazon Associates | cut for v1 | ✅ 0 refs |

---

## 5. Seasonal Relevance (Jul 10, 2026)

**Beach — peak.** ~184 N. hemisphere beach venues at summer max. Mediterranean (60), Caribbean, SE Asia, Hawaii, Gulf Coast all scoring high. ~58 S. hemisphere beach suppressed by <18°C water-temp cap (correct for AUS/NZ/Chile winter).

**Skiing — Southern peak, Northern gap.** 23 S. hemisphere venues in-season (NZ 4, Chile 7, AU 6, AR 6). The lateSeason regression means Mammoth, A-Basin, Tignes, Chamonix score=8 "Off-season" even though all 4 have documented July operations — a product credibility gap for users from Reno, Denver, Geneva, or London.

---

## 6. Tag Quality

### 3 Venues with Generic-Only Tags (down from 8 on Jul 7)

```js
// whistler — top-ranked ski result, current: ["Powder Day","All Levels"]
tags: ["Powder Day", "Deep Snowpack", "Après-Ski", "Epic Pass"],

// beaver-creek — current: ["Family Friendly","Powder Day"]
tags: ["Beaver Creek Village", "Expert Terrain", "Groomed Runs", "Epic Pass"],

// park-city-mountain — current: ["All Levels","Family Friendly"]
tags: ["Historic Main Street", "Largest US Resort", "Beginner Terrain", "Epic Pass"],
```

---

## 7. Five New Venues — Execute Today

Two re-staged glacier ski venues pending since Jul 7 (alpe-d-huez + cortina-d-ampezzo). Three fill the beach/LatAm gap (only 3 venues for all of Latin America — the worst geographic hole in the catalog).

> ⚠️ Verify photo URLs in browser before committing. `cortina-d-ampezzo` uses `ap:"TRN"` (Turin) — confirmed present in AIRPORT_COORDS. Run `node scripts/validate-venues.mjs` after staging.

```js
// ─── PASTE into VENUES array (before closing ]; ) ─────────────────────────────

{
  id: "alpe-d-huez",
  category: "skiing",
  title: "Alpe d'Huez",
  location: "Isère, France",
  lat: 45.0900,
  lon: 6.0700,
  ap: "CMF",
  icon: "🏔️",
  rating: 4.89,
  reviews: 3210,
  gradient: "linear-gradient(160deg,#0d1f3c,#1a4a8a,#4a90d9)",
  accent: "#90caf9",
  tags: ["Glacier Summer Ski", "Sarenne Descent", "Family Terrain", "Grandes Rousses"],
  photo: "https://images.unsplash.com/photo-1540477960727-8f7e5ad69e7b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass: "independent",
  lateSeason: true,
},
{
  id: "cortina-d-ampezzo",
  category: "skiing",
  title: "Cortina d'Ampezzo",
  location: "Dolomites, Italy",
  lat: 46.5404,
  lon: 12.1357,
  ap: "TRN",
  icon: "🏔️",
  rating: 4.87,
  reviews: 2445,
  gradient: "linear-gradient(160deg,#1a0d00,#5c2a00,#c05a00)",
  accent: "#ffcc80",
  tags: ["Dolomites Scenery", "Expert Terrain", "Olympic Host", "Luxury Village"],
  photo: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass: "independent",
},
{
  id: "cancun-beach",
  category: "beach",
  title: "Cancún Hotel Zone",
  location: "Quintana Roo, Mexico",
  lat: 21.1236,
  lon: -86.8468,
  ap: "CUN",
  icon: "🏖️",
  rating: 4.78,
  reviews: 34200,
  gradient: "linear-gradient(160deg,#001a33,#003366,#0055a5)",
  accent: "#40c4ff",
  tags: ["Caribbean Turquoise", "Hotel Zone", "Water Sports", "Year-Round Sun"],
  photo: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
},
{
  id: "florianopolis-beach",
  category: "beach",
  title: "Florianópolis — Joaquina",
  location: "Santa Catarina, Brazil",
  lat: -27.6819,
  lon: -48.4761,
  ap: "FLN",
  icon: "🏄",
  rating: 4.71,
  reviews: 12800,
  gradient: "linear-gradient(160deg,#002a00,#005200,#008a00)",
  accent: "#69f0ae",
  tags: ["Santa Catarina Surf", "Dunes Beach", "Lagoa da Conceição", "Brazil Summer"],
  photo: "https://images.unsplash.com/photo-1583321500900-82807e458f3c?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
{
  id: "punta-mita-beach",
  category: "beach",
  title: "Punta Mita",
  location: "Nayarit, Mexico",
  lat: 20.7803,
  lon: -105.5314,
  ap: "PVR",
  icon: "🏝️",
  rating: 4.82,
  reviews: 6200,
  gradient: "linear-gradient(160deg,#001a33,#002a60,#004a99)",
  accent: "#80d8ff",
  tags: ["Pacific Luxury", "Snorkeling", "Whale Watching", "Surf Breaks"],
  photo: "https://images.unsplash.com/photo-1562095241-8c6714fd4178?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
```

**Net count if executed: 375 + 5 = 380 venues**

---

## 8. Geographic Coverage

### Skiing by Continent

| Continent | Count | Notes |
|-----------|-------|-------|
| North America | 68 | Saturated |
| Europe | 31 | Growing (Jul sprint +5) |
| Asia | 10 | Japan/Korea adequate |
| Oceania | 11 | NZ/AU in-season |
| LatAm | 12 | Chile/Argentina covered |
| Africa | 1 | Only Oukaimeden — Lesotho Afriski staged for next run |

### Beach by Continent

| Continent | Count | Notes |
|-----------|-------|-------|
| North America | 83 | Saturated |
| Europe | 60 | Good |
| Asia | 48 | Good |
| Africa | 23 | Good |
| Oceania | 25 | Good |
| **LatAm** | **3** | ⚠️ Critical gap — Mexico/Caribbean/Brazil underserved (fixing 2 today) |

---

## One Observation for the PM

**The lateSeason regression kills the July product experience for the European market.** Tignes / Val d'Isère has the tag "Summer Glacier" in its own venue data — but the scoring engine ignores that tag and only checks `lateSeason:true`, which is missing. The result: a user in London searching Peakly for a July ski trip sees Tignes at score=8 "Off-season — resort closed." The 4-line fix in §2 is the highest-leverage change available today. Apply it before any venue additions.

---

*Content agent — 2026-07-10 UTC | Venues: 375 (133 ski / 242 beach) | Prior: 2026-07-09*
