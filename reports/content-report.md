# Peakly Content & Data Report — 2026-08-16

**Data health score: 90/100** (+2 vs yesterday) | Venues: **394** (131 skiing / 263 beach) | Cache: `20260816b` | BASE_PRICES: **133/162 unique venue APs (82%)** | Photo uniqueness: **181 unique / 394 total (~213 duplicates)**

> Today's run added **5 Latin America beach venues** (latam was the most underrepresented continent at 4 venues — now 9). Full infrastructure stack added for 5 new APs: AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES. All 5 venues have deal badges active immediately. Verified: 394 total, 0 dup IDs, no missing fields.

---

## Permanent Corrections (stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **394 venues, 2 categories (skiing + beach only).** |
| "Hiking has ZERO gear items" | **Hiking does not exist. Amazon cut for v1. GEAR_ITEMS = 0 refs.** |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1. Stop permanently.** |
| "description field" | **No description field in venue schema.** Venues use title, location, tags. |
| "lateSeason count via regex" | **14 confirmed** — grep both formats: `lateSeason:true` (compact, 9) + `"lateSeason": true` (JSON, 5) = 14. |
| "AP_CONTINENT gaps" | **CLOSED — 280+ entries.** All venue APs covered (verified today). Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** VPS deployed 2026-08-11 (Jack SSH). Stop. |
| "cancun-beach dup in VENUES" | **FALSE — second occurrence is in ALERT_TEMPLATES, not VENUES.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Stop. |
| "Grace Bay near-dup" | **Two distinct entries at same AP (PLS), ~5.9 km apart.** Jack's call — do not auto-resolve. |
| "venue count = 182 / 373 / 353 / 374 / 384 / 389" | **394 is today's authoritative count.** Stop referencing old figures. |
| "Open #23 disk cache" | **CLOSED.** VPS 2026-08-11 Jack SSH confirmed. Stop. |

---

## 1 · Data Integrity Audit

### Venue Counts (authoritative — both formats, eval-verified)

| Category | Count |
|----------|-------|
| Skiing | 131 |
| Beach | 263 |
| **Total** | **394** |

**No duplicate IDs** ✅ — 394 unique venue IDs confirmed via boot-time dedup check.

**No stub categories** — skiing (131) and beach (263) both well above the 10-venue floor.

### Field Coverage

| Field | Coverage |
|-------|----------|
| `id` | 394/394 ✅ |
| `category` | 394/394 ✅ |
| `photo` | 394/394 ✅ |
| `ap` | 394/394 ✅ |
| `lat` / `lon` | 394/394 ✅ |
| `tags` | 394/394 ✅ |
| `title` | 394/394 ✅ |
| AP in `AP_CONTINENT` | All 162 unique venue APs covered ✅ |
| AP in `AIRPORT_COORDS` | 162 unique venue APs — all 5 new latam APs now covered ✅ |
| AP in `BASE_PRICES` (dest) | **133/162 unique venue APs (82%)** |

### lateSeason Verification

**14 venues** confirmed with `lateSeason:true`. Count correctly with both formats:
```bash
grep -c "lateSeason:true" app.jsx    # compact no-space (9 found)
grep -c '"lateSeason": true' app.jsx  # JSON format (5 found)
```
Total: 14. Listed in CLAUDE.md. No change this run.

### Photo Duplication (ongoing gap — Open #20)

- **181 unique photos / 394 venues → ~213 total duplicates** (some photos reused 3-4×)
- Fix requires `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait` → `photos-review.mjs` → `photos-apply.mjs --write`
- **Reddit gate**: Jack must provide UNSPLASH_KEY to unblock. Estimated 2-hr task.

---

## 2 · GEAR ITEMS AUDIT

**Not applicable.** Amazon affiliate cut for v1 per Jack's decision (2026-06-09). Zero refs in app.jsx. Revisit post-launch.

---

## 3 · Seasonal Relevance (2026-08-16, N hemisphere peak summer)

| Segment | Status | Venues |
|---------|--------|--------|
| N hemisphere beach | **IN SEASON** (peak) | ~225 venues |
| S hemisphere beach | Off-season | ~38 venues |
| N hemisphere ski | **OFF SEASON** | ~125 venues |
| S hemisphere ski | **IN SEASON** (peak austral winter) | ~20 venues |
| Glacier ski (lateSeason) | Active IF snow_depth ≥ 0.5m | 14 venues |

**Today's 5 new latam venues — seasonal alignment:**
- Jericoacoara (FOR): August = **dry season in NE Brazil** — strongest kite winds, zero rain. Peak. ✅
- Pipa (NAT): August = **peak dry season** in Rio Grande do Norte. Perfect beach conditions. ✅
- Cartagena (CTG): August = Caribbean coast (some rain, still warm, ~30°C). Flights cheapest this time of year (low season for Colombian coast). ✅
- Tayrona (SMR): August = transitional (dry season ends Sep). Manageable access, park open. ✅
- Galápagos (GPS): August = **garúa season** (cool dry mist, excellent wildlife visibility). Ideal for wildlife, acceptable for beach. ✅

**Continent gap now closed**: latam was at 4 venues before today. With 5 additions, it reaches 9 — still behind na (86) and europe (68) but no longer critically thin.

---

## 4 · Content Quality

### Tag Accuracy

All 394 venues have non-empty `tags` arrays ✅

Spot check on today's additions:
- `beach_jericoacoara`: `["Kite & Wind Capital","Sunsetter Dune","Lagoa do Paraíso","Brazil's Most Bohemian Beach"]` — accurate ✅
- `beach_cartagena`: `["UNESCO Walled City","Caribbean Gateway","Bocagrande Strip","Colombia's Crown Jewel"]` — accurate ✅
- `beach_galapagos`: `["Sea Lions on the Beach","Marine Iguanas","Charles Darwin Legacy","UNESCO World Heritage"]` — accurate ✅

### Venue Quality Flags

**beach_galapagos (GPS)**: Rating 4.97 / 8,900 reviews makes it the highest-rated venue in the entire catalog — appropriate for a UNESCO/Darwin destination. The relatively low review count reflects it being niche (expensive, limited capacity by Ecuador gov), not low-quality.

**beach_cartagena (CTG)**: Highest-review-count venue today (22,400). Will surface prominently in trending/popular sorts once scoring activates. Expect this to be a top-3 Caribbean card for summer US-East corridor.

---

## 5 · BASE_PRICES Gap (Open #22 — improving)

**Current: 133/162 unique venue destination APs covered (82%)**

Today's content agent added 5 new latam APs (CTG, SMR, GPS, FOR, NAT) — all wired. Net: +5 covered APs, +5 total (the new venues).

**Still uncovered (29 APs, by venue count):**

| AP | Airport | Venues | Category | Notes |
|----|---------|--------|----------|-------|
| BOS | Boston Logan | 3 | ski+beach | Origin AP — domestic venues (Sunday River, Sugarloaf, Cape Cod) |
| SEA | Seattle-Tacoma | 2 | skiing | Origin AP — domestic (Crystal Mtn, Stevens Pass) |
| LAX | Los Angeles | 2 | beach | Origin AP — domestic (Manhattan Beach, Zuma) |
| JFK | New York JFK | 1 | beach | Origin AP — domestic (Cooper's Beach) |
| MIA | Miami | 1 | beach | Origin AP — domestic (South Beach) |
| ORD | Chicago O'Hare | 1 | skiing | Origin AP — domestic (Wilmot Mountain) |
| CMH | Columbus | 1 | skiing | Origin AP — domestic (Mad River Mountain) |
| KRK | Kraków | 1 | skiing | Zakopane |
| GEG | Spokane | 1 | skiing | Schweitzer Mountain |
| USH | Ushuaia | 1 | skiing | Cerro Castor |
| KUL | Kuala Lumpur | 1 | beach | Tioman Island |
| BEY | Beirut | 1 | skiing | Mzaar |
| Others | 17 more | 1 each | mix | |

**Priority note:** BOS/SEA/LAX/JFK/MIA/ORD/CMH are US hub airports used as VENUE DESTINATIONS for domestic local venues (people fly TO those cities for nearby spots). Adding BASE_PRICES for these means pricing what it costs to fly *to* BOS or *to* LAX from other US cities — e.g., Sunday River needs `BASE_PRICES[BOS]` for a DFW → BOS traveler to see a fare estimate. These could be added as a DevOps batch.

**Paste-ready for next DevOps run (domestic hub venues — 7 APs):**
```javascript
  // ── US domestic hub venues — 2026-08-16 Content agent recommendation ──
  // These are destination prices TO these hub airports for domestic ski/beach venues.
  BOS:{ JFK:80,  LAX:280, SFO:300, ORD:160, MIA:200, SEA:320, BOS:0,   ATL:180, DEN:260, DFW:240, LAS:300, PHX:280, MSP:220, DTW:200 },
  SEA:{ JFK:280, LAX:140, SFO:120, ORD:240, MIA:360, SEA:0,   BOS:320, ATL:340, DEN:200, DFW:280, LAS:180, PHX:200, MSP:260, DTW:270 },
  LAX:{ JFK:240, LAX:0,   SFO:80,  ORD:200, MIA:300, SEA:140, BOS:280, ATL:280, DEN:160, DFW:180, LAS:80,  PHX:100, MSP:220, DTW:230 },
  JFK:{ JFK:0,   LAX:240, SFO:280, ORD:160, MIA:180, SEA:300, BOS:80,  ATL:160, DEN:260, DFW:220, LAS:280, PHX:260, MSP:200, DTW:180 },
  MIA:{ JFK:180, LAX:300, SFO:340, ORD:200, MIA:0,   SEA:380, BOS:200, ATL:120, DEN:280, DFW:240, LAS:300, PHX:280, MSP:260, DTW:240 },
  ORD:{ JFK:160, LAX:200, SFO:220, ORD:0,   MIA:200, SEA:240, BOS:160, ATL:160, DEN:160, DFW:160, LAS:200, PHX:200, MSP:80,  DTW:100 },
  CMH:{ JFK:180, LAX:280, SFO:300, ORD:100, MIA:220, SEA:320, BOS:200, ATL:160, DEN:240, DFW:220, LAS:280, PHX:260, MSP:200, DTW:100 },
```
> Adding these 7 APs would lift coverage to **140/162 (~86%)** — past the 85% DevOps target.

---

## 6 · Daily Venue Additions — 5 venues added this run ✅

**Focus: Latin America beach — critically underrepresented at 4 venues before today**

All 5 venues added to app.jsx. All 5 APs added to AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES.

| ID | Title | AP | BP? | Coords? | Season |
|----|-------|-----|-----|---------|--------|
| beach_jericoacoara | Jericoacoara Beach | FOR | ✅ JFK=$680 | ✅ | Aug peak ✅ |
| beach_pipa_brazil | Pipa Beach | NAT | ✅ JFK=$700 | ✅ | Aug peak ✅ |
| beach_cartagena | Cartagena de Indias | CTG | ✅ JFK=$460 | ✅ | Aug (low season = cheap fares) ✅ |
| beach_tayrona | Tayrona National Park | SMR | ✅ JFK=$520 | ✅ | Aug (transitional, open) ✅ |
| beach_galapagos | Galápagos Islands | GPS | ✅ JFK=$760 | ✅ | Aug (garúa, best wildlife) ✅ |

**Cache stamp bumped:** `20260816a` → `20260816b` in app.jsx + sw.js + index.html ✅

**Venue baseline updated:** 389 → 394 ✅

---

## PM Note

**Latin America went from 4 → 9 beach venues today.** This is the right strategic move before Reddit launch: Cartagena and Galápagos are the kind of aspirational venues that make a feed feel like a discovery product, not a database dump. Cartagena at JFK=$460 round-trip during Caribbean low season will generate strong deal scores — it's the kind of "I never thought to go there" card that drives organic sharing.

**Two gates still open:**
1. **Photos (Open #20)** — ~213 duplicate photo URLs across 394 venues. Jack needs to unblock with UNSPLASH_KEY. This is the single biggest quality gap a first-time Reddit visitor would notice. `scripts/photos-fetch.mjs` is ready to run.
2. **Domestic hub BASE_PRICES (7 APs)** — paste-ready above for DevOps. Would bring coverage to 86% and unlock deal badges for Sunday River, Sugarloaf, Cape Cod, Crystal Mountain, Stevens Pass, Manhattan Beach, Zuma, and South Beach.

**New observation:** The Galápagos venue (beach_galapagos) has the highest rating in the entire 394-venue catalog (4.97) and will appear at the top of "Best conditions" sort when Ecuador has good weather. This is exactly the kind of marquee venue that makes Peakly look world-class to a first-time user. At $760 from JFK (double-hop, expensive by design), the deal score won't be screaming "GO" — but the aspirational value of seeing Galápagos on the front page is worth the catalog slot.
