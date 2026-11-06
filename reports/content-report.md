# Peakly Content & Data Report — 2026-11-06

## Data Health Score: 88/100

**Deductions (unchanged — Day 7):**
- −7: **~225 venues have ≤2 tags** (Day 7 of finding) — tag enrichment remains the highest-leverage content improvement within the venue freeze.
- −5: **Venue addition queue FROZEN** per PM v193+ directive, deferred post-Reddit gate. Scored for the backlog, not a data error.

> **⚠️ STALE TASK PROMPT NOTE:** This routine's stored prompt references "182 venues, 12 categories, hiking gear items." Actual state (verified continuously since 2026-11-01): **404 venues, 2 categories (skiing + beach), GEAR_ITEMS cut for v1.** All numbers below are from live app.jsx.

---

## 1. DATA INTEGRITY AUDIT

| Check | Result |
|-------|--------|
| Total venues | **404** (`.venue-baseline` confirmed) |
| Skiing | 134 |
| Beach | 270 |
| Categories | 2 (skiing, beach) — correct post-pivot |
| Duplicate IDs | **0** ✅ |
| Missing coordinates | **0** ✅ |
| Missing airport codes (ap) | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| Missing photos | **0** ✅ |
| Missing titles | **0** ✅ |
| `lateSeason: true` venues | **15** ✅ |
| `poolPrimary: true` venues | 0 (scoring logic present; no venues set — intentional) |
| `scripts/.venue-baseline` | **404** ✅ — matches actual count |
| BASE_PRICES coverage | **181 airport codes, 100% venue AP coverage** ✅ — all 165 unique venue APs present |
| AP_CONTINENT / AIRPORT_COORDS | Verified CLEAN — no app.jsx changes in 19 days |

**Integrity: CLEAN.** No changes to app.jsx since `6f0e744` 2026-10-18 (19 days). Last 7 days of commits are reports only.

**Cache stamp: `20261031a`** — 6 days stale (unchanged from last week). Will auto-bump on the next app.jsx change. Not a content error.

**⛔ ROLLBACK ALERT (not a content issue — flagging for visibility):** DevOps confirms `fix-appjsx-final` branch is a 6-month rollback to May 2026 (9,095 vs 14,256 lines on main). DO NOT MERGE. This would delete the entire 404-venue catalog and all post-May work.

---

## 2. GEAR ITEMS AUDIT

Per CLAUDE.md: **GEAR_ITEMS cut for v1 (Jack's decision 2026-06-09, affirmed 2026-06-10).** `grep -c GEAR_ITEMS app.jsx` → 0. Intentional.

**No action required on gear items until Amazon is re-enabled post-launch.**

---

## 3. SEASONAL RELEVANCE (Nov 6, 2026)

| Segment | Count | Status |
|---------|-------|--------|
| N-hem ski (lateSeason: true) | 15 | ✅ **In-season now** — glacier/high-altitude venues bypassing off-season cap at ≥0.5m snow depth |
| N-hem ski (regular) | ~119 | Early season — most NH resorts open late Nov/Dec; scoring handles via off-season cap |
| S-hem ski | ~23 | End of season — scoring correctly deprioritizes |
| N-hem beach | ~201 | Off-season — UV/temp scoring handles naturally |
| S-hem beach | ~69 | ✅ **Peak season** — Bora Bora, Zanzibar, Maldives, Mauritius, Brazil, Mozambique, Seychelles surfacing correctly |

**Seasonal alignment is correct.** The 15 `lateSeason: true` glacier venues (Whistler, Hintertux, Tignes, Val Thorens, Zermatt, Saas-Fee, Les Deux Alpes, Engelberg, St. Moritz, Chamonix, Mammoth, Verbier, Cervinia, A-Basin, Snowbird) are the right early-November inventory.

**Critical timing (Day 7 of same flag):** Whistler opens ~Nov 21 — **15 days**. Two-weekend scoring is broken on the live VPS until the Nov 7 P0-A redeploy lands (**TOMORROW**). Whistler's first weekend (Nov 22–23) will score correctly only if the redeploy clears by Friday. Not a content issue — DevOps owns the Nov 7 deadline.

---

## 4. CONTENT QUALITY — TAG DISTRIBUTION

| Tag Count | Venues | % of total |
|-----------|--------|------------|
| ≤2 tags | ~225 | ~55.7% |
| 3 tags | ~16 | ~4.0% |
| 4 tags | ~162 | ~40.1% |
| 5 tags | 1 | 0.2% |
| **Average** | — | **~2.9 tags/venue** |

**Target: ≥4 tags per venue.** ~225 venues remain below threshold. No change from Nov 1–5 (venue freeze halts enrichment for new venues; enriching existing venues is in-scope and low-risk but deprioritized until Reddit gate clears).

### Top ski venues with thin tags (unchanged from prior days):
- `chamonix` — 2 tags → add: Vallée Blanche, Steep & Deep
- `aspen` — 2 tags → add: Maroon Bells, Blue Sky Basin
- `verbier` — 2 tags → add: Mont-Fort, 4 Valleys Circuit
- `courchevel` — 2 tags → add: Les Trois Vallées, Luxury Chalets
- `st-moritz-ch` — 2 tags → add: Corvatsch, Luxury Shopping
- `val-disere` — 2 tags → add: Espace Killy, Off-Piste
- `breckenridge` — 2 tags → add: Imperial Bowl, Family-Friendly

### Top beach venues with thin tags (unchanged from prior days):
- `borabora` — 2 tags (UV 11, Crystal Water) → add: Overwater Bungalows, Shark Snorkeling
- `zanzibar` — 2 tags → add: Spice Island, Stone Town, Dhow Sailing
- `maldives_male` — 2 tags → add: House Reef Snorkeling, Sandbank Excursions
- `seychelles` — 2 tags → add: Vallée de Mai, Giant Tortoises
- `boracay` — 2 tags → add: Station 2 White Beach, Kitesurfing

---

## 5. VENUE ADDITIONS

**FROZEN per PM directive (v193+).** Queue 20+ deep, held until after Reddit gate. No new venues today.

Tag enrichment for existing 225 thin-tag venues is prepped and ready to ship the moment the freeze lifts — this is the highest-ROI content action within scope.

---

## One Observation for PM

**Tomorrow (Nov 7) is both the VPS redeploy deadline AND the day before the content catalog needs to be ready for the Reddit launch window.** The 15 lateSeason glacier venues are correctly configured and will surface immediately once two-weekend scoring is live on the VPS. Whistler (Nov 21), Mammoth (opens mid-Nov), and Tignes/Hintertux (year-round) are the most compelling ski content for a November Reddit post. If the VPS redeploy clears tomorrow, users arriving from Reddit traffic Nov 7–10 will see South Hemisphere peak beach content (Bora Bora, Zanzibar, Maldives) plus the glacier ski tier — a genuinely compelling front page. The content is ready. The only blocker is the VPS.
