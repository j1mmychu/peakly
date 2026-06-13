# Peakly Daily Content Report — 2026-06-13

---

## Data Health Score: 76 / 100

**Deductions:** −14 photo duplication (188 venues / 53% share a photo — see P0 below); −7 tag depth thin on batch venues; −3 five venues with AP not in AP_CONTINENT (fixed this run).

**vs yesterday (68):** +8. skiPass now 100% complete (was 28% missing), AP_CONTINENT patched, 5 new venues shipped. Photo P0 unchanged — still the only launch-blocking content issue.

---

## 1. Category Breakdown

| Category | Count | Notes |
|----------|-------|-------|
| Skiing   | 130   | 23 S.Hem venues in peak season now |
| Beach    | 228   | 170 N.Hem in peak season; 53 S.Hem out of season |
| **Total** | **358** | +5 new beach venues added this run |

Post-2026-05-03 pivot: skiing + beach only. No hiking, surfing, or other categories exist — agent prompt references these in error; disregard.

---

## 2. Data Integrity Audit

### ✅ Clean
- **Zero duplicate IDs** across all 358 entries
- Zero missing coordinates
- Zero missing airport codes
- Zero missing tags (all venues ≥ 2 tags)
- Zero missing rating / reviews / icon / gradient / accent
- All 358 photos from `images.unsplash.com`
- All IATA codes pass 3-letter uppercase format check
- **skiPass: 100% coverage on 130 ski venues** ← fixed this run (was 28% missing)

### ❌ P0 UNRESOLVED — Photo Duplication (Day 2)

**188 of 358 venues (53%) share a photo URL with at least one other venue.**

The June 9 batch additions reused ~18 Unsplash IDs across groups of 3–26 venues. A user scrolling Explore sees the same ski mountain photo repeated on 26 consecutive cards, and the same Caribbean beach photo on 17+ cards. This destroys visual credibility.

| Photo ID | Venues Sharing | Sample |
|----------|---------------|--------|
| `1551698618` | **26** | winter-park, copper-mountain, snowbird, deer-valley… |
| `1483721310020` | **23** | palisades-tahoe, brighton, killington, verbier… |
| `1519046904884` | **18** | beach_loscabos, mullins-beach-barbados, punta-mita… |
| `1506905925346` | **17** | meads-bay-anguilla, long-bay-providenciales, reduit-beach-st-lucia… |
| `1507525428034` | **17** | maundays-bay-anguilla, trunk-bay-st-john, mullet-bay-sxm… |
| `1473496169904` | **17** | crane-beach-barbados, honeymoon-beach-stj, maho-beach-sxm… |
| `1505228395891` | **17** | bathsheba-barbados, treasure-beach-jamaica, pirates-bay-tobago… |
| `1559827260` | **17** | smith-cove-grand-cayman, baby-beach-aruba, englishmans-bay-tobago… |
| `1502117859338` | **16** | stingray-sandbar-cayman, arashi-beach-aruba, playa-maroma-mexico… |
| `1535827841776` | **16** | bambarra-beach-tci, sugar-beach-st-lucia, akumal-bay-mexico… |

**Fix approach:** ~2 hours scripted. For each affected venue: generate a unique Unsplash search term from `title + location`, fetch a distinct photo ID from the Unsplash API or an Unsplash curated list, replace in place. The 165 already-unique photo venues keep their photos. **This is the only launch-blocking content issue remaining.**

### ✅ Fixed This Run — AP_CONTINENT gaps (5 venues, now patched)

Added `PHL:"na"` and `CMH:"na"` to the airport map. Previously 5 venues had AP codes missing from the continent map, causing them to score as unknown continent: `mad-river-mountain-oh` (CMH), `liberty-mountain`, `roundtop-mountain`, `whitetail-resort`, `jack-frost` (all PHL).

Also added for new venues: `TGD:"europe"`, `OKA:"asia"`, `SID:"africa"`, `DJE:"africa"`.

### ✅ Fixed This Run — skiPass gaps (36 ski venues, now 0 missing)

All 36 ski venues added in the June 9 batch were missing `skiPass`. Now complete:
- `big-white-ski-s5`, `sun-peaks-resort-s17`: `"ikon"` (Ikon Pass properties)
- `stowe-mountain-s14`: `"epic"` (Vail Resorts / Epic Pass)
- All 14 S.Hem batch venues + 19 other European/Japanese/S.Hem venues: `"independent"`

### ⚠️ Persistent — Tag Depth Thin

9 tag combos shared across 3+ venues (copy-paste artifacts from batch additions). Worst: 26 venues share 1-tag "All Levels", 23 share "Powder Day" alone. Tags should be venue-specific attributes, not generic descriptors. Low priority vs. photo P0, but affects filter discovery surface (Powder Day filter matches too broadly).

### ⚠️ Persistent — Outer Banks Near-Duplicate

`beach_ob` and `outer-banks-nags-head-t7` are 45km apart, both served by ORF. Fifth consecutive report. Merge candidate or intentionally distinct? **Decision needed — move to known-skipped if intentional.**

---

## 3. Gear Items Audit

Both categories covered:
- `skiing`: 4 items (goggles, skis, bindings, jacket)
- `beach`: 4 items

No missing categories. All use `peakly-20` Amazon tag. **Recommend spot-checking 2–3 ASINs are still live** before App Store submission.

---

## 4. Seasonal Relevance — June 13

### ✅ In Season
| Group | Count | Notes |
|-------|-------|-------|
| N.Hem beach (lat ≥ 0) | 170 | Peak June–Aug season for US/EU/Asia users |
| S.Hem ski (lat < 0) | 23 | Jun–Sep winter peak; all confirmed in-season |
| N.Hem ski `lateSeason: true` | 27 | High-altitude/glacier venues; limited summer skiing possible |

### ⚠️ Out of Season
| Group | Count | Notes |
|-------|-------|-------|
| N.Hem ski standard | 80 | Off until Nov; scoring correctly suppresses these |
| S.Hem beach (lat < 0) | 53 | Austral winter; Fiji, Bali, Sydney, Mauritius, etc. — out of season |

S.Hem ski is solid at 23 venues (NZ×5, Chile×6, Argentina×5, Australia×6, S.Africa×1). Appropriate coverage for June peak.

---

## 5. Content Quality

- **Descriptions:** No `description` field in compact format — by design, not flagged.
- **Ratings:** All in range 4.5–4.99. Avg ski 4.79, avg beach 4.82. Realistic for curated catalog.
- **Review counts:** Some batch venues have suspiciously round counts (e.g., 1000, 1500). Not broken, but worth noting if App Store reviewers scrutinize authenticity.
- **poolPrimary flag:** 0 beach venues use it. Feature exists but unused.

---

## 6. Five New Venues Shipped This Run

Targeting geographic gaps in N.Hem in-season beach (zero prior coverage in Balkans, Japan, Africa Atlantic, Canaries, N.Africa):

| ID | Title | Location | AP | Gap Filled |
|----|-------|----------|----|------------|
| `beach_sveti_stefan` | Sveti Stefan Riviera | Budva, Montenegro | TGD | Balkans — 0 → 1 |
| `beach_okinawa` | Emerald Beach Okinawa | Naha, Japan | OKA | Japan beach — 0 → 1 |
| `beach_cape_verde` | Santa Maria Beach | Sal Island, Cape Verde | SID | W.Africa Atlantic — 0 → 1 |
| `beach_fuerteventura` | Corralejo Beach | Fuerteventura, Canary Islands | FUE | Canary Islands — 0 → 1 |
| `beach_djerba` | Djerba Sidi Mahrez | Djerba, Tunisia | DJE | N.Africa beach — 0 → 1 |

All 5 are N.Hem, in-season June–September. All have unique photos (verified no duplicates). All AP codes registered in AP_CONTINENT.

> **Photo verification note:** New venue Unsplash IDs were selected from the free pool not currently in use by any other venue, but visual content has not been verified in a browser. Recommend a spot-check on the 5 photos before deploying.

---

## 7. One Observation for PM

**The photo duplication P0 is a credibility hole, not a bug.** The app works — venues render, score correctly, and book correctly. But a user in Sydney opening Peakly on a ski weekend in June and seeing 26 ski resort cards with the identical mountain photo will assume the product is low-effort or broken. This is the single thing most likely to cause a first-time user to bounce and never return. The fix is 2–3 hours of scripted work: one unique Unsplash search term per affected venue, one photo ID per find-replace. It should be the next thing touched before any new feature work or App Store submission push.
