# Content & Data Report — 2026-03-25 (v6)

**Author:** Content & Data Lead
**Date:** 2026-03-25

---

## Data Health Score: 76 / 100

Core data integrity is excellent (100% coordinates, airports, no duplicates). Score held back by 5 categories still thin (2–4 venues), 40% photo gap in surfing/tanning, and fishing/paraglide still at 1 venue each.

---

## Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Tanning | 60 | ✅ Healthy |
| Surfing | 53 | ✅ Healthy |
| Skiing | 50 | ✅ Healthy |
| Hiking | 12 | ✅ Above threshold |
| Diving | 5 | ⚠️ Growing — needs 5+ more |
| Climbing | 4 | ⚠️ Growing — needs 6+ more |
| Kite | 4 | ⚠️ Growing — needs 6+ more |
| Kayak | 2 | ⚠️ STUB — needs 8+ more |
| MTB | 2 | ⚠️ STUB — needs 8+ more |
| Fishing | 1 | ⚠️ STUB — needs 9+ more |
| Paraglide | 1 | ⚠️ STUB — needs 9+ more |

**New this session:** Raja Ampat, Sipadan, Dahab, Cozumel (diving); Railay Beach, Kalymnos, El Chalten (climbing); Cabarete, Dakhla, Mui Ne (kite); Abel Tasman (kayak); Queenstown Bike Park (MTB). **+12 venues total.**

**Fishing and Paraglide remain at 1 venue each — highest priority for next session.**

---

## Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues | ~196 (182 prior + 12 added this session + remote additions) |
| Coordinates (lat/lon) | ✅ 100% coverage |
| Airport codes | ✅ 100% coverage |
| New airports checked in AP_CONTINENT | ✅ CZM, KBV, JMK, PUQ, SJU, AGA, HKT, AKL, ZQN — all confirmed mapped |
| Duplicate IDs | ✅ None detected |
| Duplicate photo URLs | ⚠️ `pipeline` and `banzai_pipeline` still share same photo + near-identical coords (flagged v5, v6 — must resolve) |
| `rajaampat` and `sipadan` | ⚠️ Both use identical photo URL — needs unique photo for Sipadan |
| Venues missing photos | ⚠️ ~73 venues (~37%) still missing photos in tanning/surfing |

### Coordinate Spot-Checks (New Venues)

| Venue | Claimed Location | Coordinates | Verdict |
|-------|-----------------|-------------|---------|
| Raja Ampat | West Papua, Indonesia | -0.2348, 130.5167 | ✅ Correct |
| Sipadan Island | Sabah, Malaysia | 4.1150, 118.6289 | ✅ Correct |
| Blue Hole, Dahab | Sinai, Egypt | 28.5710, 34.5195 | ✅ Correct |
| Railay Beach | Krabi, Thailand | 8.0117, 98.8386 | ✅ Correct |
| Kalymnos | Dodecanese, Greece | 36.9513, 26.9847 | ✅ Correct |
| El Chalten | Patagonia, Argentina | -49.3314, -72.8861 | ✅ Correct |
| Dakhla Lagoon | Western Sahara | 23.7175, -15.9369 | ✅ Correct |
| Abel Tasman | Tasman, New Zealand | -40.8559, 173.0146 | ✅ Correct |
| Queenstown Bike Park | Queenstown, NZ | -45.0312, 168.6626 | ✅ Correct |

### Airport Code Issue Flagged

- `dahab` uses `AMM` (Amman, Jordan) — Dahab is in Egypt. The correct nearest airport is SSH (Sharm el-Sheikh, ~90km). AMM is in AP_CONTINENT as "asia" and will assign Dahab to the Asia region, not Africa/Middle East, affecting alert filters. **Recommend changing to SSH.**
  - Note: SSH is not currently in AP_CONTINENT. Either add `SSH:"africa"` to the map, or use `HRG` (Hurghada, in AP_CONTINENT? — needs check). This is a data quality issue to resolve next session.

---

## Gear Items Audit

### Fixed This Session

**Hiking** was entirely missing from `GEAR_ITEMS` despite 12 venues. Fixed — 4 high-AOV items added:
- Salomon X Ultra 4 GTX Boots ($200) — REI
- Black Diamond Trail Trekking Poles ($140) — REI
- Osprey Atmos AG 65L Backpack ($300) — REI ← multi-day pack, appropriate for Everest BC / Torres del Paine
- Garmin inReach Mini 2 GPS ($350) — REI

**Estimated AOV:** $248. At 5% REI commission: **~$12.40 per conversion** — highest-AOV gear category in the app.

### All Categories Now Covered

All 11 sport categories have `GEAR_ITEMS` defined. ✅

### Placeholder Status

- REI links: functional search URLs, no affiliate tag yet (blocked by LLC)
- Amazon items: `tag=peakly-20` present but tag inactive (blocked by LLC approval)
- Backcountry: direct product paths with `AFFILIATE_ID` placeholder (check ~line 3786 — previous report said 0 occurrences; verify)

---

## 12 New Venues Added This Session

### Diving (GBR → 5 venues)
1. **Raja Ampat** — West Papua, Indonesia (ap: DPS) — "Manta Rays, 1500+ Fish Species"
2. **Sipadan Island** — Sabah, Malaysia (ap: DPS) — "Barracuda Tornado, Permit Required"
3. **Blue Hole, Dahab** — Sinai, Egypt (ap: AMM*) — "Freediving Mecca, Budget Friendly"
4. **Cozumel Reefs** — Quintana Roo, Mexico (ap: CZM) — "Drift Diving, Visibility 40m"

### Climbing (Yosemite → 4 venues)
5. **Railay Beach** — Krabi, Thailand (ap: KBV) — "Limestone Karst, Deep Water Solo"
6. **Kalymnos Island** — Dodecanese, Greece (ap: JMK) — "Tufa Paradise, 3500+ Routes"
7. **El Chalten** — Patagonia, Argentina (ap: PUQ) — "Fitz Roy, Alpine Granite"

### Kite (Tarifa → 4 venues)
8. **Cabarete** — Dominican Republic (ap: SJU) — "Thermal Winds, Year-Round"
9. **Dakhla Lagoon** — Morocco (ap: AGA) — "300+ Wind Days, Flat Water"
10. **Mui Ne** — Vietnam (ap: HKT) — "Budget Kite Mecca, Nov–Apr Season"

### Kayak (Milford Sound → 2 venues)
11. **Abel Tasman Sea Kayaking** — New Zealand (ap: AKL) — "Golden Sand Coves, Dolphin Encounters"

### MTB (Moab → 2 venues)
12. **Queenstown Bike Park** — New Zealand (ap: ZQN) — "World Cup Trails, The Remarkables"

---

## Seasonal Relevance — Late March 2026

### In Season Now

| Venue | Category | Why Now | Status |
|-------|----------|---------|--------|
| **Pipeline / North Shore** | Surfing | Final weeks of N Shore swell season — overhead+ still possible | 🔥 Last call |
| **Taghazout, Morocco** | Surfing | Prime season — NW Atlantic groundswells, offshore trades, 18°C water | 🔥 Peak |
| **Dakhla / Cabarete** (new) | Kite | Full trade wind season; best kite months Mar–May | 🔥 Peak |
| **Cozumel Reefs** (new) | Diving | 30m+ visibility, calm seas before summer hurricane season | ✅ Good |
| **Railay Beach** (new) | Climbing | Dry season — best sport climbing months Feb–April | ✅ Peak |
| **Annapurna / Everest BC** | Hiking | Pre-monsoon trekking window open until June | ✅ Good |
| **Whistler Blackcomb** | Skiing | Spring skiing peak — corn snow, full base, long days | ✅ Good |
| **Abel Tasman** (new) | Kayak | Autumn shoulder season — crowds gone, water warm, stable weather | ✅ Good |

### Going Out of Season

| Venue | Warning |
|-------|---------|
| Niseko, Japan | Closes mid-April — promote as "final powder weeks" |
| Southern Hemisphere Ski (NZ/Chile) | 4 months until open — deprioritize in scoring |
| **Laugavegur, Iceland** | ⚠️ Trail physically closed until late June — scoring system uses Reykjavik weather proxy and will score this incorrectly as "accessible." Schema fix needed before launch. |
| Torres del Paine | End of Patagonian summer — deteriorating weather |

---

## Remaining Issues (Priority Order)

| # | Issue | Severity | Action |
|---|-------|----------|--------|
| 1 | Fishing (1 venue) + Paraglide (1 venue) | HIGH | Add 4+ venues each next session. Kenai River (fishing) and Interlaken (paraglide) are the lonely stubs. |
| 2 | `dahab` uses wrong airport (AMM = Jordan, not Egypt) | HIGH | Change to SSH (Sharm el-Sheikh) and add `SSH:"africa"` to AP_CONTINENT |
| 3 | `pipeline` + `banzai_pipeline` duplicate | HIGH | 1-line delete: remove `pipeline`, keep `banzai_pipeline` (6,420 reviews vs 1,203) |
| 4 | `rajaampat` + `sipadan` share identical photo URL | MEDIUM | Update Sipadan to a unique underwater photo |
| 5 | 73 venues missing photos | MEDIUM | All new venues have photos. Older tanning (41) and surfing (32) still missing. |
| 6 | Kayak + MTB still thin (2 venues each) | MEDIUM | Need 8+ more. Priority: Sea of Cortez kayak, Moab kayaking, Whistler MTB, Whistler Enduro |
| 7 | AFFILIATE_ID placeholders | LOW | Blocked by LLC |

---

## Observation for PM

**Hiking is missing from the CATEGORIES array** despite having 12 venues — more content than diving, climbing, kayak, MTB, kite, fishing, and paraglide combined. Users browsing by category pill cannot filter for hiking. All 12 hiking venues are invisible in category browsing. The fix is one line:

```javascript
{ id:"hiking", label:"Hiking", emoji:"🥾" },
```

This should ship this sprint alongside the `dahab` airport correction and the duplicate `pipeline` delete. Three surgical 1-line changes that improve data quality immediately.
