# Peakly Content & Data Report — 2026-11-14

## Data Health Score: 87/100

**Deductions (Day 15 — unchanged + 1 new finding):**
- −7: **225 venues have ≤2 tags** (Day 15 of finding) — tag enrichment remains the highest-leverage content improvement within the venue freeze.
- −5: **Venue addition queue FROZEN** per PM v193+ directive, deferred post-Reddit gate. Scored for the backlog, not a data error.
- −1: **NEW: FOR and NAT airports missing from AP_CONTINENT** — 2 Brazilian beach venues (`beach_jericoacoara` / `beach_pipa_brazil`) have valid AIRPORT_COORDS entries but no AP_CONTINENT mapping. Scoring engine uses AP_CONTINENT for continent-aware logic; these venues may mis-route. Fix: add `FOR: "latam"` and `NAT: "latam"` to AP_CONTINENT. (Score deducted today; previously undetected.)

> **⚠️ STALE TASK PROMPT NOTE:** This routine's stored prompt references "182 venues, 12 categories, hiking gear items." Actual state (verified continuously): **404 venues, 2 categories (skiing + beach), GEAR_ITEMS cut for v1.** All numbers below are from live app.jsx via Node.js eval (dual-format: unquoted + quoted keys).

> **⚠️ LATESEASON COUNT (Day 8 of correction):** DevOps gets 10 via single-pattern regex (`lateSeason:\s*true` only). Actual count is **15** — 10 unquoted-key venues + 5 JSON-quoted-key venues (`"lateSeason": true`). Both formats are valid in the mixed catalog. Authoritative count: **15**.

> **⚠️ CACHE STAMP:** `PEAKLY_BUILD = 20261031a` / `sw.js CACHE_NAME = peakly-20261031a` — **14 days stale** (today is 2026-11-14). DevOps concern, not content.

---

## 1. DATA INTEGRITY AUDIT

| Check | Result |
|-------|--------|
| Total venues | **404** ✅ |
| Skiing | **134** (111 N-hemi + 23 S-hemi) |
| Beach | **270** (201 N-hemi + 69 S-hemi) |
| Duplicate IDs | **0** ✅ |
| Duplicate photos | **0** ✅ (404 unique photo URLs) |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags array | **0** ✅ |
| APs missing from BASE_PRICES | **0** ✅ (165 unique venue APs, all covered — Open #22 CLOSED) |
| APs missing from AIRPORT_COORDS | **0** ✅ |
| APs missing from AP_CONTINENT | **2** ⚠️ NEW — `FOR` (beach_jericoacoara), `NAT` (beach_pipa_brazil) |
| lateSeason:true venues | **15** ✅ (10 unquoted + 5 quoted-key) |
| GEAR_ITEMS occurrences | **0** ✅ (cut for v1 — deliberate) |

**NEW FINDING — AP_CONTINENT gap (2 venues):**
- `beach_jericoacoara` — AP: `FOR` (Pinto Martins International, Fortaleza, Brazil). Both `lat: -2.7972` and AIRPORT_COORDS entry confirmed valid. Missing: `AP_CONTINENT["FOR"]`.
- `beach_pipa_brazil` — AP: `NAT` (Governador Aluízio Alves International, Natal, Brazil). Both coords and AIRPORT_COORDS confirmed valid. Missing: `AP_CONTINENT["NAT"]`.

**Fix (paste into AP_CONTINENT in app.jsx — both are latam):**
```
  FOR: "latam",
  NAT: "latam",
```
Both airports are in northeast Brazil; "latam" is the correct continent value matching all other Brazilian APs in the catalog (GRU, FLN, REC, etc.).

> **DevOps bracket-walk count discrepancy (Day 3):** DevOps reports 406 via bracket-walking; eval of the full VENUES array returns 404. Bracket-walking can double-count closing brackets in nested objects. Authoritative count is **404 via eval**.

---

## 2. GEAR ITEMS AUDIT

**GEAR_ITEMS: CUT for v1 (Jack's decision, 2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0.**

Deliberate revenue decision. Amazon Associates deferred post-launch. No action required. The task prompt's "hiking has ZERO gear items" is obsolete (hiking was never a Peakly category).

**Active revenue streams:** Booking.com (aid=2311236), SafetyWing (referenceID=peakly), Travelpayouts (TP_MARKER=710303). Live RPM: ~$7.58/1K MAU.

---

## 3. SEASONAL RELEVANCE — November 14, 2026

**Current season: Northern Hemisphere ski season OPEN (Day 5). Thanksgiving window opens in 7 days. App Review hard stop MISSED per PM/DevOps (Nov 14 deadline passed).**

| Segment | Count | Status |
|---------|-------|--------|
| N-hemi skiing (lat ≥ 0) | 111 | ✅ IN SEASON — peak Nov–Apr window open |
| S-hemi skiing (lat < 0) | 23 | ⚠️ OUT OF SEASON — returns May 2027 |
| Tropical beach (abs lat < 23.5°) | 164 | ✅ YEAR-ROUND — Caribbean, SE Asia, Maldives |
| N-hemi temperate beach (lat 23.5–45°) | ~37 | ⚠️ OFF-PEAK — Mediterranean, California shoulder season |
| S-hemi beach (lat < 0) | 69 | ✅ IN SEASON — Southern summer peak |

**lateSeason:true venues (15)** — all in peak relevance. At risk if VPS redeploy doesn't happen before Thanksgiving (confidence:low suppresses these venues from the front page exactly when N-hemisphere ski traffic peaks):
> whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch

**Whistler opens in 7 days (Nov 21).** VPS redeploy is the single highest-impact unlock — without it, two-weekend scoring is off, iOS native fails, and alert deletion silently fails. All three hurt exactly on the opening weekend traffic spike.

---

## 4. CONTENT QUALITY

| Check | Result |
|-------|--------|
| Venues with ≤2 tags | **225** ⚠️ Day 15 of finding |
| Venues with ≥3 tags | **179** ✅ |
| Venue descriptions | Not in schema — N/A |
| Avg tags per venue | **2.9** |

**Tag quality:** Unchanged. 225 venues with 1–2 tags remain the single largest content gap. Frozen per PM v193+ directive; flag for first post-launch content sprint.

**Most overused tags (potential for diversification):**
| Tag | Count |
|-----|-------|
| Family Friendly | 32 |
| All Levels | 25 |
| Groomed Runs | 22 |
| Calm Waters | 19 |
| Expert Terrain | 18 |

**High-value thin-tag venues (fully in peak season now):**
- `abasin` — suggested: "Opening Day Leader", "High Alpine", "Denver Day-Trip"
- `hintertux-glacier` — suggested: "Year-Round Glacier", "Advanced Terrain", "Austria"
- `snowbird` — suggested: "Alta Access", "Deep Powder", "Expert Steeps"

---

## 5. DAILY VENUE ADDITIONS

**FROZEN — per PM v193+ directive, venue additions deferred until post-Reddit launch gate. 404 venues is the locked catalog.**

If the freeze lifts, the highest-value additions per category balance would be:
- More S-hemi ski venues (23 is thin for summer ski season coverage)
- More Indian Ocean beach venues (Réunion, Mauritius — currently underrepresented)
- More Mediterranean ski venues (Montenegro, Slovenia)

---

## One Observation for PM

**The AP_CONTINENT gap (FOR/NAT) is the only new real data defect this run.** It's a 2-line fix in app.jsx and would clean up scoring for 2 Brazilian beach venues that are currently IN their summer peak season and highly relevant (Jericoacoara and Pipa are both world-class kite/wind spots in NE Brazil — exactly the kind of "hidden gem" beach content that differentiates Peakly from generic flight aggregators). Worth fixing in the next code commit alongside any other app.jsx touch.

The larger story this week: **the catalog is otherwise fully clean (0 dup IDs, 0 dup photos, 0 missing coords/APs, 100% BASE_PRICES coverage), but 27 days with no code commits means the AP_CONTINENT gap has sat unaddressed since at least the last venue-integrity audit.** Tag enrichment (225 thin-tag venues) and VPS redeploy remain the top two levers.
