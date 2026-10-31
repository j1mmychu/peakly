# Peakly Content & Data Report — 2026-10-31

## Data Health Score: 80/100

**Deductions (verified against live app.jsx, not CLAUDE.md memory):**
- −10: **scripts/.venue-baseline = 405** — actual venue count is **209**. This mismatch will cause the auto-push guard to REJECT any future app.jsx commit with venues. Action required: `echo 209 > scripts/.venue-baseline`
- −5: **AIRPORT_COORDS: 82 of 152 venue APs missing** — distance filter (`flightHours`) silently fails for these venues; all fall through to "no distance data"
- −5: **AP_CONTINENT: 117 of 152 venue APs missing** — continent filtering broken for most venues (Europe/Asia/Oceania/Latam pills may return incorrect or empty results)

> **⚠️ VENUE COUNT DISCREPANCY — Prior Reports Were Wrong:**
> Every content report from Oct 15–30 reported **404 venues (134 skiing / 270 beach)** — sourced from CLAUDE.md memory, not from app.jsx. Actual count verified today by bracket-walking the VENUES array: **209 venues (138 beach / 71 skiing)**. The Oct 14 initial commit pushed an older version of app.jsx. The .venue-baseline at `scripts/.venue-baseline` says **405**, which is wrong for both the claimed 404 and the actual 209. Any future `auto-push.sh` run that touches app.jsx will fail the venue integrity guard until this is corrected.

> **⚠️ Stale Scheduled-Task Prompt (Day 25 unchanged):** This routine's stored prompt references "182 venues, 12 categories, hiking gear items." Actual: **209 venues, 2 categories (skiing + beach), GEAR_ITEMS cut for v1**. The PM has also explicitly frozen the venue addition queue (PM v196, v193, v195) — **do NOT add 5 new venue objects** until the queue of 20+ proposals is reviewed and the code freeze lifts.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,237** — no code changes since initial Oct 14 commit |
| Total venues | **209** (138 beach / 71 skiing) — verified by code analysis ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** — 209 unique URLs ✅ |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing photos | **0** ✅ |
| Missing tags array | **0** ✅ |
| BASE_PRICES coverage | **100%** — 181 origin keys, all 152 unique venue APs covered ✅ |
| `lateSeason:true` venues | **15** ✅ |
| `poolPrimary:true` venues | **0** (field exists in schema, no venues use it) |
| GEAR_ITEMS | **0** — cut for v1, correct per CLAUDE.md ✅ |
| Venues with ≤2 tags | **89 (43%)** ⚠️ |
| Thin-tag beach venues | **58 / 138 (42%)** ⚠️ |
| Thin-tag ski venues | **31 / 71 (44%)** ⚠️ |
| scripts/.venue-baseline | **405** — WRONG, actual 209 ❌ BLOCKS auto-push |
| AIRPORT_COORDS gaps | **82 / 152 venue APs missing** ❌ |
| AP_CONTINENT gaps | **117 / 152 venue APs missing** ❌ |
| PRECACHE | `["https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"]` ⚠️ (DevOps flagged mismatch) |

---

## 1. Data Integrity Audit

All 209 venues pass every hard check:

- ✅ **0 venues missing `lat`/`lon`** — all coordinates present
- ✅ **0 venues missing `ap` code** — all 209 have a valid 3-char IATA airport
- ✅ **0 venues missing `tags` array** — all 209 have tags
- ✅ **0 venues missing `photo`** — all 209 URLs present
- ✅ **0 duplicate IDs** — confirmed by Set comparison
- ✅ **0 duplicate photo URLs** — all 209 unique
- ✅ **BASE_PRICES: 100% coverage** — all 152 unique venue airports covered by 181 origin keys

**Critical infrastructure flags:**

- ❌ **scripts/.venue-baseline = 405, actual = 209** — the auto-push integrity guard compares the live venue count against this file. The guard will refuse any app.jsx commit with a venue count of 209 (too far below baseline). Fix: `echo 209 > scripts/.venue-baseline`

- ❌ **AIRPORT_COORDS missing 82 of 152 venue APs** — missing entries include high-volume airports like LAX, MIA, JFK, HNL, DPS (Bali), PPT (Bora Bora). The `flightHours` distance filter returns no distance data for venues served by these airports, so they are treated as having unlimited flight time.
  
- ❌ **AP_CONTINENT missing 117 of 152 venue APs** — the continent filter pills (Europe / Asia / Oceania / LatAm) only return venues with matching AP entries. Missing airports like LAX, MIA, JFK, DPS, HNL, PPT, etc. mean US destinations like Miami Beach, Key West, and Destin, plus nearly all Pacific and Caribbean venues, may be invisible in continent-filtered views.

**Soft flags:**

- ⚠️ **89 venues (43%) have ≤2 tags** — reduces vibe-match quality (beach 42%, ski 44%). Additive fix: expand tags arrays.
- ⚠️ **Gili Trawangan near-duplicate** (persists): `beach_gilit` (LOP) + `gili-trawangan` (DPS) both reference the same Lombok island cluster. Different IDs, low crash risk, but confusing in results.

---

## 2. Gear Items Audit

**GEAR_ITEMS was cut for v1 (Jack, 2026-06-09).** `grep -c GEAR_ITEMS app.jsx → 0`. Confirmed correct per CLAUDE.md. Amazon Associates stream deferred post-launch. No action needed.

---

## 3. Seasonal Relevance — October 31, 2026

| Category | Region | Condition | Notes |
|----------|--------|-----------|-------|
| Skiing | N hemisphere (65 venues) | **Pre-season / Glacier** | Hintertux, Tignes, Mammoth, A-Basin, Whistler (lateSeason:true) can score now. Main resorts open Nov 15–Dec 15. |
| Skiing | S hemisphere (6 venues) | **Post-season** | Chile/Argentina/NZ season ended ~Oct. Score confidence now low. |
| Beach | S hemisphere (38 venues) | **🔥 Prime season starts** | Australia, S Africa, Brazil, NZ entering spring/summer. Best beach opportunity right now. |
| Beach | Tropical (\|lat\|<23°) | **Year-round strong** | SE Asia (Bali, Thailand, Philippines), Caribbean, Maldives, Indian Ocean consistently strong. |
| Beach | N hemisphere mid-lat (29 venues) | **Shoulder / off-peak** | Mediterranean winding down. Canaries, Cyprus, Morocco still viable (>20°C). |

**Seasonal priorities for Nov 1 (Whistler opens Nov 21):**
- Front page should surface S hemisphere beach (Australia, NZ, Brazil) — they're entering prime season.
- Glacier ski (Hintertux, Tignes, Cervinia, Mammoth, A-Basin) should be scoring well in two-weekend view — all have `lateSeason:true`.
- VPS redeploy with `forecast_days:14` is required for Whistler's opening weekend (Nov 21) to appear in the two-weekend scoring window. Nov 7 is the deadline per DevOps.

---

## 4. Content Quality

**Tag depth is the primary content gap:**
- 89 venues at ≤2 tags (43%): `beach_gcm` (1 tag), `beach_grace` (2 tags), `beach_shoal` (2 tags) etc.
- Beach is slightly worse (42%) than ski (44%) — but the magnitude is similar
- 4+-tag venues have substantially better vibe-match precision and search recall
- No automated fix possible — requires editorial review

**Tag distribution:**
| Tags | Count |
|------|-------|
| 1 | 0 |
| 2 | 89 (43%) |
| 3 | 2 (1%) |
| 4+ | 118 (56%) |

**No description field in schema** — title + location + tags are the functional content. No gaps to fix.

---

## 5. New Venue Proposals

**OMITTED per PM v196 FREEZE directive.**

The PM has explicitly suspended new venue proposals (v193, v195, v196) — the queue is already at 20+ uncommitted proposals across recent reports. Adding more proposals when the code is frozen and the queue is unreviewed is counterproductive. This section will remain omitted until the PM confirms the freeze is lifted.

---

## 6. Actions Required

| Priority | Action | Owner |
|----------|--------|-------|
| P0 | `echo 209 > scripts/.venue-baseline` — fixes auto-push guard block | Content / Claude |
| P1 | Add ~82 missing airports to AIRPORT_COORDS (LAX, MIA, JFK, HNL, DPS, PPT first) | Code commit |
| P1 | Add ~117 missing airports to AP_CONTINENT (same priority list) | Code commit |
| P1 | VPS redeploy with `forecast_days:14` before Nov 7 (Whistler Nov 21 gate) | Jack SSH |
| P2 | Tag enrichment for 89 thin-tag venues | Future sprint |
| — | Resolve Gili Trawangan near-duplicate (`beach_gilit` vs `gili-trawangan`) | Code decision |

---

## One Observation for PM

**The venue count has been wrong in every report since Oct 15.** All agents were reading 404 from CLAUDE.md memory instead of counting app.jsx directly. Actual count is 209. The `.venue-baseline` file says 405. These mismatches mean the auto-push guard would block any future venue commit — a silent pre-deploy mine. The `.venue-baseline` fix is a 1-second shell command (`echo 209 > scripts/.venue-baseline`) that unblocks all future content pushes. The AIRPORT_COORDS and AP_CONTINENT gaps are real functional bugs: continent filtering and distance-based sorting are broken for the majority of venues. These should be bundled into the first post-freeze code commit.
