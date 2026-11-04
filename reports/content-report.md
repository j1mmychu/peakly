# Peakly Content & Data Report — 2026-11-04

## Data Health Score: 88/100

**Deductions (unchanged from Nov 3):**
- −7: **~225 venues have ≤2 tags** (Day 5 of finding) — tag enrichment remains the highest-leverage content improvement within the venue freeze.
- −5: **Venue addition queue FROZEN** per PM v193–v197 directive, deferred post-Reddit gate. Scored for the backlog, not a data error.

> **⚠️ STALE TASK PROMPT NOTE:** This routine's stored prompt references "182 venues, 12 categories, hiking gear items." Actual state (verified 2026-11-04 by multi-method counting): **404 venues, 2 categories (skiing + beach), GEAR_ITEMS cut for v1.** All numbers below are from live app.jsx.

---

## 1. DATA INTEGRITY AUDIT

| Check | Result |
|-------|--------|
| Total venues | **404** |
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
| `poolPrimary: true` venues | 0 (field in scoring logic; no venues set) |
| `scripts/.venue-baseline` | **404** ✅ — matches actual count |
| AP_CONTINENT / AIRPORT_COORDS | Verified CLEAN (Nov 3 — no app.jsx changes since) |

**Integrity: CLEAN.** No changes to app.jsx since `6f0e744` (2026-10-18). Last 5 days of commits are reports only.

**Note on DevOps "406" count:** DevOps report (Nov 4) claims eval returns 406 venues. Multi-method recount today (line-based ID count, category sum across both compact + quoted-key formats) consistently returns **404**. DevOps counting methodology appears to overcount by 2 — likely picking up non-venue `id:` fields (e.g. CATEGORIES constants). `.venue-baseline` = 404 is correct. No action needed.

---

## 2. GEAR ITEMS AUDIT

Per CLAUDE.md: **GEAR_ITEMS cut for v1 (Jack's decision 2026-06-09, affirmed 2026-06-10).** `grep -c GEAR_ITEMS app.jsx` → 0. Intentional.

**No action required on gear items until Amazon is re-enabled post-launch.**

---

## 3. SEASONAL RELEVANCE (Nov 4, 2026)

| Segment | Count | Status |
|---------|-------|--------|
| N-hem ski (lateSeason: true) | 15 | ✅ **In-season now** — glacier/high-altitude venues bypassing off-season cap at ≥0.5m snow depth |
| N-hem ski (regular) | ~119 | Early season — most NH resorts open late Nov/Dec; scoring handles via off-season cap |
| S-hem ski | ~23 | End of season — scoring correctly deprioritizes |
| N-hem beach | ~201 | Off-season — UV/temp scoring handles naturally |
| S-hem beach | ~69 | ✅ **Peak season** — Bora Bora, Zanzibar, Maldives, Mauritius, Brazil, Mozambique, Seychelles surfacing correctly |

**Seasonal alignment is correct.** The 15 `lateSeason: true` glacier venues (Whistler, Hintertux, Tignes, Val Thorens, Zermatt, Saas-Fee, Les Deux Alpes, Engelberg, St. Moritz, Chamonix, Mammoth, Verbier, Cervinia, A-Basin, Snowbird) are the right early-November inventory.

**Critical timing (Day 5 of same flag):** Whistler opens ~Nov 21 — **17 days**. Two-weekend scoring is broken on the live VPS until the Nov 7 P0-A redeploy lands. Whistler's first weekend (Nov 22–23) will score wrong without the VPS fix. Not a content issue.

---

## 4. CONTENT QUALITY — TAG DISTRIBUTION

| Tag Count | Venues | % of total |
|-----------|--------|------------|
| ≤2 tags | ~225 | ~55.7% |
| 3 tags | ~16 | ~4.0% |
| 4 tags | ~162 | ~40.1% |
| 5 tags | 1 | 0.2% |
| **Average** | — | **~2.9 tags/venue** |

**Target: ≥4 tags per venue.** ~225 venues are below threshold. No change from Nov 1–3 (venue freeze halts new additions; tag enrichment for existing venues is in-scope but deprioritized until Reddit gate clears).

### Top ski venues with thin tags (sample):
- `chamonix` — 2 tags → add: Vallée Blanche, Steep & Deep
- `aspen` — 2 tags → add: Maroon Bells, Blue Sky Basin
- `verbier` — 2 tags → add: Mont-Fort, 4 Valleys Circuit
- `courchevel` — 2 tags → add: Les Trois Vallées, Luxury Chalets
- `st-moritz-ch` — 2 tags → add: Corvatsch, Luxury Shopping

### Top beach venues with thin tags (sample):
- `borabora` — 2 tags (UV 11, Crystal Water) → add: Overwater Bungalows, Shark Snorkeling
- `zanzibar` — 2 tags → add: Spice Island, Stone Town, Dhow Sailing
- `maldives_male` — 2 tags → add: House Reef Snorkeling, Sandbank Excursions
- `seychelles` — 2 tags → add: Vallée de Mai, Giant Tortoises

---

## 5. VENUE ADDITIONS

**FROZEN per PM directive (v193+).** Queue is 20+ deep but held until after Reddit gate. No new venues added today.

---

## One Observation for PM

**The Nov 7 VPS deadline is now 3 days out and directly threatens the product.** Tag enrichment (the only content action available within the freeze) can be prepped as a ready-to-ship diff that fires *the moment* the VPS redeploy clears and the venue freeze lifts. High-impact target: enriching the top 50 thin-tag ski venues with 2 additional tags each would take cache/quality score from 88 → ~95 and would surface more specific filter results (e.g. "Deep Powder," "Luxury Village," "Beginner-Friendly" tags that currently only 40% of venues carry). This prep can be done now without touching the frozen VENUES array — just need the go signal.
