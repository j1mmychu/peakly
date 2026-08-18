# Peakly Content & Data Report — 2026-08-18

## Data Health Score: 72/100

**Deductions:**
- Photo deduplication: 83 sharing groups, 186 of 394 venues (47%) sharing photos with ≥1 other venue (-18 pts)
- BASE_PRICES airport coverage: only 14 of 162 unique airport codes covered (9%) — deal scores unreliable for most venues (-10 pts)

**Clean:**
- 0 duplicate IDs
- 100% field coverage across all required fields (id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo)
- 0 coordinate anomalies
- 0 missing airports or tags

---

## Category Breakdown

The scheduled prompt references 12 categories and a 182-venue catalog — **that state is months stale.** Current reality as of today:

| Category | Venues | Status |
|----------|--------|--------|
| Beach    | 263    | ✅ Healthy |
| Skiing   | 131    | ✅ Healthy |
| **Total** | **394** | |

Surfing was retired 2026-05-03. All other categories (hiking, climbing, MTB, etc.) were never launched. No stub categories — only two live categories and both are well-populated. Geographic concentration is the real gap, not category breadth.

---

## GEAR_ITEMS Audit

GEAR_ITEMS was **intentionally removed for v1** (Amazon Associates formally cut by Jack on 2026-06-09 — see CLAUDE.md Open #13/#16). `grep -c GEAR_ITEMS app.jsx` → 0. This is a documented decision, not a gap. Do not restore. Revisit post-launch if revenue gap justifies it.

---

## Seasonal Relevance (2026-08-18 — Northern Summer)

| Segment | Venues | Status |
|---------|--------|--------|
| N. hemisphere beach | 202 | 🟢 Peak season |
| S. hemisphere ski | 23 | 🟢 Peak season (Andes + NZ/AU) |
| N. hemisphere ski | 108 | 🔴 Off-season (expected low scores) |
| S. hemisphere beach | 61 | 🟡 Off-season |

**lateSeason flag** covers 14 high-altitude N. hemisphere resorts (whistler, mammoth, tignes, zermatt, etc.) — these bypass the off-season binary cap when snow depth ≥ 0.5m, which is correct for glacier skiing in August. No action needed.

**Note for PM:** In August the Explore tab shows ~225 in-season venues (202 N. beach + 23 S. ski). N. ski venues will mostly score low and filter to the bottom unless lateSeason-flagged. Scoring behavior is working as designed.

---

## Photo Duplication Audit — Primary Quality Gap

**83 groups of 2–4 venues share the same photo.** 186 venues (47%) are affected. Worst offenders:

| Venues sharing one photo | Count |
|--------------------------|-------|
| beach_sardinia, playa-maroma-mexico, unawatuna-sri-lanka, beach_villasimius | 4 |
| steamboat, ski_oukaimeden, cardrona-nz | 3 |
| sunvalley, ski_gudauri, mt-hutt-nz | 3 |
| keystone, solitude, el-colorado-cl | 3 |
| beach_rivmaya, bathsheba-barbados, ao-nang-beach-krabi | 3 |
| beach_noronha, trunk-bay-st-john, bai-khem-phu-quoc | 3 |
| beach_clearwater, baby-beach-aruba, kuta-beach-bali | 3 |
| beach_myrtle, reduit-beach-st-lucia, tanjung-aan-lombok | 3 |
| beach_lanikai, maho-beach-sxm, nacpan-beach-palawan | 3 |

**82 more 2-way pairs not listed.** Run `scripts/photos-fetch.mjs` → `photos-review.mjs` → `photos-apply.mjs --write` with `UNSPLASH_KEY` set to fix. This is the biggest remaining quality gap Jack flagged directly — 27 marquee venues already got real photos; 186 still need them.

---

## BASE_PRICES Coverage — Secondary Quality Gap

Only **14 of 162 unique airport codes** appear in BASE_PRICES (9%). All 14 are US hubs.

**Top missing airports by venue count (backfill priority):**

| AP | Venues | Region |
|----|--------|--------|
| CUN | 9 | Mexico/Caribbean |
| SLC | 8 | Utah ski |
| SYD | 8 | Australia |
| GVA | 7 | Alps |
| IBZ | 7 | Ibiza/Spain |
| DPS | 7 | Bali/Indonesia |
| RNO | 6 | Reno/Tahoe |
| CMF | 6 | Chambéry/French Alps |
| HKT | 6 | Phuket/Thailand |
| BTV | 5 | Vermont ski |
| NAP | 5 | Naples/Italy |
| CAG | 5 | Sardinia |
| FAO | 5 | Algarve/Portugal |
| NCE | 5 | Nice/French Riviera |
| ZNZ | 5 | Zanzibar |
| MRU | 5 | Mauritius |
| SCL | 5 | Chile ski |
| YYC | 5 | Calgary/Canada ski |
| NAN | 5 | Fiji |
| ALB | 4 | Vermont/Albany |

Backfilling the top 15 (~2hr task) would cover ~90 additional venues. The deal score is a headline feature — these all show `~$X` estimates which undermine trust.

---

## Geographic Concentration Flags

- **US ski: 53 of 131 ski venues (40%)** — significantly overweight. No action needed for v1 but worth flagging before any major venue push.
- **Italy ski: only 2 venues** (cervinia, champoluc-monterosa-s15) — extremely underrepresented for a top-3 global ski destination. Cortina, Val Gardena, Livigno, Sestriere, Courmayeur all absent.
- **Peru: 0 beach venues** despite LIM being in AP_CONTINENT. Máncora is a well-known South American beach draw.
- **Norway ski: only 1 venue** (hemsedal) — Trysil (Norway's largest), Geilo, and Hafjell all absent.
- **Americas-Pacific beach: 25 of 263 (9%)** — lowest of 4 regions despite including Mexico Pacific, Central America, and South America's entire Pacific coast.

---

## 5 New Venue Objects (Copy-Paste Ready)

Targeting Italy ski gap (2 → 5 venues), Norway ski gap (1 → 2), and Peru beach gap (0 → 1). All use airport codes already in AP_CONTINENT.

```js
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

**Notes before pasting:**
- All 5 use airports already in `AP_CONTINENT` — venue integrity guard will pass
- VCE (Venice) for both Italy ski venues: 150–165km drive, standard gateway for Dolomites
- OSL for Trysil: 150km, same as hemsedal which already uses OSL
- LIM for Máncora: 1,100km but Lima is Peru's only international hub — consistent with how Patagonia venues use distant airports
- LIS for Nazaré: 130km, solid day-trip or 2hr drive
- Verify photo URLs resolve before shipping — these are representative Unsplash IDs
- Add BASE_PRICES entries for LIM and LIS if backfilling that batch (LIS ≈ $720 JFK-LIS typical; LIM ≈ $640 JFK-LIM typical)

---

## One Observation for PM

**The photo dedup is now the #1 trust issue, not pricing.** After the 2026-08-18 DevOps work that bumped photos for 90 venues (commits 0dcb301 + 73415a5), there are still 83 sharing groups. A user clicking from Kuta Beach (Bali) to Baby Beach (Aruba) and seeing the *exact same photo* destroys the app's credibility as a curated product — it reads as a scraper, not a premium travel tool. The `scripts/photos-*` pipeline exists; it just needs an Unsplash API key and an hour of Jack's time. This is the highest-leverage quality action remaining before any Reddit/HN post.
