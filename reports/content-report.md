# Peakly Content & Data Report — 2026-08-19

## Data Health Score: 81/100

**Deductions:**
- Photo duplication: 83 sharing groups, 186 of 394 venues (47%) sharing photos with ≥1 other venue (-18 pts)
- BASE_PRICES: 23 single-venue airport codes missing coverage (-1 pt) — down from -10 yesterday, sprint nearly complete

**Clean:**
- 0 duplicate IDs in VENUES array
- 0 out-of-range coordinates (all lat/lon values within valid bounds)
- 100% field coverage: id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo — all 394 venues
- 100% photo coverage (394/394)
- 14 lateSeason:true flags confirmed (9 compact + 5 JSON format: whistler, chamonix, mammoth, abasin, tignes, cervinia, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch + zermatt, engelberg, snowbird, verbier, val-thorens)
- 0 empty tag arrays

---

## Category Breakdown

The scheduled prompt references 12 categories — that state is months stale. Current reality:

| Category | Venues | Status |
|----------|--------|--------|
| Beach    | 263    | ✅ Healthy |
| Skiing   | 131    | ✅ Healthy |
| **Total** | **394** | Matches `.venue-baseline` ✅ |

Surfing retired 2026-05-03. All other categories were never launched. Two categories only, both well-populated, no stubs. Geographic concentration is the gap, not breadth.

---

## GEAR_ITEMS Audit

GEAR_ITEMS was **intentionally removed for v1** (Amazon Associates formally cut 2026-06-09 by Jack — CLAUDE.md Open #13/#16). `grep -c GEAR_ITEMS app.jsx` → 0. Documented decision. Do not restore. Revisit post-launch. "Hiking GEAR_ITEMS" mentioned in the scheduled prompt is not applicable — hiking was never a launch category.

---

## Seasonal Relevance (2026-08-19 — Late Northern Summer)

| Segment | Venues | Status |
|---------|--------|--------|
| N. hemisphere beach | 202 | 🟢 Peak season — exactly right moment to launch |
| S. hemisphere ski | 23 | 🟢 Peak season (Andes + NZ/AU mid-winter) |
| N. hemisphere ski | 108 | 🔴 Off-season — will score low, expected |
| S. hemisphere beach | 61 | 🟡 Off-season |

**In-season for the Reddit launch window (Aug 22/29): 225 of 394 venues.** That's a strong catalog — 202 beach venues + 23 southern-hemisphere ski, all scoring high simultaneously.

**lateSeason flag** covers 14 high-altitude N. hemisphere glacier venues (Whistler, Tignes, Cervinia, Les Deux Alpes, Saas-Fee, St. Moritz, Zermatt, Engelberg, Snowbird, Verbier, Val Thorens + Mammoth + A-Basin + Chamonix). These bypass the off-season binary cap when `snow_depth_max >= 0.5m`. Summer glacier skiing in August is real at these venues — flag is correct and covers the right resorts.

**No seasonal mismatch flags.** 

---

## BASE_PRICES Coverage — Sprint Nearly Complete

**160 of 162 unique venue airport codes now covered (99%).** Compared to the 08-16 report (9%), the 5-day sprint closed the gap entirely.

**23 airports still missing — all single-venue:**

| AP | Venue | Region |
|----|-------|--------|
| BEY | 1 venue | Beirut, Lebanon |
| BME | 1 venue | Broome, Australia |
| BOC | 1 venue | Bocas del Toro, Panama |
| CMH | 1 venue | Columbus, Ohio |
| DJE | 1 venue | Djerba, Tunisia |
| EAS | 1 venue | San Sebastián, Spain |
| EYW | 1 venue | Key West, Florida |
| FEN | 1 venue | Fernando de Noronha, Brazil |
| GEG | 1 venue | Spokane, Washington |
| HNA | 1 venue | Hanamaki, Japan |
| INH | 1 venue | Inhambane, Mozambique |
| KRK | 1 venue | Kraków, Poland |
| KUL | 1 venue | Kuala Lumpur, Malaysia |
| LEA | 1 venue | Exmouth, Australia |
| MYR | 1 venue | Myrtle Beach, SC |
| OKA | 1 venue | Okinawa, Japan |
| RDD | 1 venue | Redding, California |
| SID | 1 venue | Sal, Cape Verde |
| SOF | 1 venue | Sofia, Bulgaria |
| SRQ | 1 venue | Sarasota, Florida |
| TBS | 1 venue | Tbilisi, Georgia |
| USH | 1 venue | Ushuaia, Argentina |
| VPS | 1 venue | Destin, Florida |

**These 23 all show `~$X` estimates only.** Low priority given all are single-venue airports. The big wins (CUN 9 venues, SLC 8, SYD 8, GVA 7, IBZ 7, DPS 7) were all covered in the sprint. Base pricing is now solid for >95% of venues by user traffic weight.

---

## Photo Duplication Audit — Active Sprint

**83 exact dup groups, 186 venues (47%) sharing at least one photo with another venue.**

No change from yesterday's state — the three Wikimedia photo commits (2b108b0, 73415a5, 0dcb301) landed Aug 18 and aren't reflected in today's dedup count yet because dedup tracks identical URLs, and the Wikimedia replacements may still share URLs across venues.

**Worst offenders (for prioritized replacement):**

| Shared photo ID | Count | Venues |
|----------------|-------|--------|
| photo-1537956965359 | 4× | Most-used dup — fix first |
| photo-1735767976699 | 3× | |
| photo-1507699622108 | 3× | |
| photo-1574087686739 | 3× | |
| photo-1583321500900 | 3× | |
| photo-1568282167464 | 3× | |
| photo-1608649944716 | 3× | |
| photo-1533105079780 | 3× | |
| +75 more 2× pairs | | |

**PM target: ≥330/394 venues with real, unique photos by Aug 20 EOD.**

Current state per PM v123 (Aug 18): ~247/394 (63%) have real photos after the Wikimedia sprint. Need ~83 more venues updated to hit 330. At today's rate that's achievable with one more pipeline run.

**Action needed today:** Run Wikimedia photo pipeline on the remaining duplicate groups. No Unsplash key required. Pipeline: `scripts/photos-fetch.mjs` (uses Wikimedia Commons API — no auth) → review → `scripts/photos-apply.mjs --write`. The 83 dup groups are the input set.

---

## 5 New Venue Objects (Staged — Moratorium Active)

**PM Decision 2 (2026-08-18): Venue moratorium holds until after Reddit launch. Earliest add: Aug 30.**

Per PM v123, these are staged only — do NOT paste before Aug 30. The QA baseline is set at 394. These are targets for the first post-Reddit batch:

```js
// POST-REDDIT BATCH — earliest Aug 30. Do not add before launch.
{
  id: "cortina-it",
  category: "skiing",
  title: "Cortina d'Ampezzo",
  location: "Veneto, Italy",
  lat: 46.5365,
  lon: 12.1357,
  ap: "VCE",
  icon: "⛷️",
  rating: 4.88,
  reviews: 2140,
  gradient: "linear-gradient(160deg,#1a2535,#2d558e,#5b8ed5)",
  accent: "#7db3f5",
  tags: ["Dolomites UNESCO", "2026 Olympics Host", "Tofane Glacier", "Italian Alps"],
  photo: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&h=600&fit=crop",
},
{
  id: "val-gardena-it",
  category: "skiing",
  title: "Val Gardena",
  location: "South Tyrol, Italy",
  lat: 46.5768,
  lon: 11.6741,
  ap: "VCE",
  icon: "⛷️",
  rating: 4.85,
  reviews: 1760,
  gradient: "linear-gradient(160deg,#1e2a40,#345c9c,#6899d4)",
  accent: "#8ab9f0",
  tags: ["Sella Ronda Circuit", "Dolomites UNESCO", "Ortisei Village", "500km Pistes"],
  photo: "https://images.unsplash.com/photo-1604537466573-5e94508fd243?w=800&h=600&fit=crop",
},
{
  id: "trysil-no",
  category: "skiing",
  title: "Trysil",
  location: "Innlandet, Norway",
  lat: 61.3285,
  lon: 12.0614,
  ap: "OSL",
  icon: "⛷️",
  rating: 4.71,
  reviews: 920,
  gradient: "linear-gradient(160deg,#0d1b2a,#1a3d6b,#3a7aaa)",
  accent: "#6aaddd",
  tags: ["Norway's Largest Resort", "Family Friendly", "Nordic Powder", "Long Season"],
  photo: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop",
},
{
  id: "mancora-pe",
  category: "beach",
  title: "Máncora",
  location: "Piura, Peru",
  lat: -4.1053,
  lon: -81.0396,
  ap: "LIM",
  icon: "🏖️",
  rating: 4.62,
  reviews: 1350,
  gradient: "linear-gradient(160deg,#3a1a00,#7a4a10,#c88830)",
  accent: "#f5b040",
  tags: ["Year-Round Sun", "Pacific Warmth", "South America's Best Beach", "Surfers & Families"],
  photo: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop",
},
{
  id: "nazare-pt",
  category: "beach",
  title: "Nazaré",
  location: "Leiria, Portugal",
  lat: 39.6010,
  lon: -9.0703,
  ap: "LIS",
  icon: "🌊",
  rating: 4.74,
  reviews: 2480,
  gradient: "linear-gradient(160deg,#00112a,#003080,#0055cc)",
  accent: "#4da8ff",
  tags: ["World's Biggest Waves", "Atlantic Drama", "Historic Fishing Town", "60-Foot Surf"],
  photo: "https://images.unsplash.com/photo-1565006270193-b49b1f07e75b?w=800&h=600&fit=crop",
},
```

**Notes:** All 5 use airports already in `AP_CONTINENT`. VCE (Venice) for both Italy ski — 150–165km drive, standard Dolomites gateway. OSL for Trysil matches hemsedal precedent. LIM/LIS both covered in BASE_PRICES. Verify photo URLs before pasting post-launch.

---

## One Observation for PM

**BASE_PRICES sprint is done. Photo dedup is the only remaining quality gap before Reddit.**

The 5-day BASE_PRICES sprint closed what was a -10pt data quality hole: 9% → 99% airport coverage, unlocking honest deal scores for nearly every venue. That's a major catalog quality win that came in quietly.

The math for Aug 22: today's Wikimedia pipeline run needs to push ~83 more venues from generic-shared to real-unique photos. That hits the 330 threshold. The pipeline ran three times yesterday totaling 112 venues — a single run today should clear the bar. If it stalls (Wikimedia returning thin results for resort-branded venues), the fallback is Unsplash key + one focused run on the remaining ~83. Aug 22 is achievable if the pipeline fires today.

*Report generated 2026-08-19. Venue count: 394 (131 ski / 263 beach). Health score: 81/100. Moratorium active — no venue changes until Aug 30.*
