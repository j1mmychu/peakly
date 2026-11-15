# Peakly Content & Data Report — 2026-11-15

## Data Health Score: 89/100

**Deductions (Day 16):**
- −7: **225 venues have ≤2 tags** (Day 16 of finding — unchanged) — tag enrichment remains the highest-leverage content improvement within the venue freeze.
- −5: **Venue addition queue FROZEN** per PM v193+ directive, deferred post-Reddit gate. Scored for the backlog, not a data error.
- ~~−1: FOR/NAT missing from AP_CONTINENT~~ **FALSE ALARM CORRECTED** — see Section 1 below. Score restored to 89 from yesterday's 87.

> **⚠️ STALE TASK PROMPT NOTE:** This routine's stored prompt references "182 venues, 12 categories, hiking gear items." Actual state (verified continuously): **404 venues, 2 categories (skiing + beach), GEAR_ITEMS cut for v1.** All numbers below are from live app.jsx via Node.js (dual-format: unquoted + quoted keys).

> **⚠️ LATESEASON COUNT (Day 9 of correction):** DevOps gets 10 via single-pattern regex (`lateSeason:\s*true` only). Actual count is **15** — 10 unquoted-key venues + 5 JSON-quoted-key venues (`"lateSeason": true`). Authoritative count: **15**.

> **⚠️ CACHE STAMP:** `PEAKLY_BUILD = 20261031a` / `sw.js CACHE_NAME = peakly-20261031a` — **15 days stale** (today is 2026-11-15). DevOps concern, not content.

---

## 1. DATA INTEGRITY AUDIT

| Check | Result |
|-------|--------|
| Total venues | **404** ✅ |
| Skiing | **134** (111 N-hemi + 23 S-hemi) |
| Beach | **270** (201 N-hemi + 69 S-hemi) |
| Duplicate IDs | **0** ✅ (boot-time guard confirmed) |
| Duplicate photos | **0** ✅ (404 unique photo URLs) |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags array | **0** ✅ |
| APs missing from BASE_PRICES | **0** ✅ (165 unique venue APs, all covered — Open #22 CLOSED) |
| APs missing from AIRPORT_COORDS | **0** ✅ |
| APs missing from AP_CONTINENT | **0** ✅ |
| lateSeason:true venues | **15** ✅ (10 unquoted + 5 quoted-key) |
| GEAR_ITEMS occurrences | **0** ✅ (cut for v1 — deliberate) |

**FOR/NAT FALSE ALARM CORRECTION (from 2026-11-14 report):**

Yesterday's report flagged `FOR` and `NAT` as missing from AP_CONTINENT. This was incorrect. Both are present in quoted-key format:
- Line 442: `"FOR":"latam"` ✅
- Line 462: `"NAT":"latam"` ✅

The audit used an unquoted-key lookup pattern and missed the quoted-key block. The AP_CONTINENT object uses mixed key formats (same as the VENUES array) — `FOR:` unquoted is absent, but `"FOR":` quoted is present and functionally identical at runtime. No fix needed. The 2 Brazilian beach venues (`beach_jericoacoara`, `beach_pipa_brazil`) are correctly covered and scoring normally.

> **Revised DevOps bracket-walk count discrepancy note (Day 4):** DevOps reports 406 via bracket-walking; eval of the full VENUES array returns 404. Authoritative count is **404**.

---

## 2. GEAR ITEMS AUDIT

**GEAR_ITEMS: CUT for v1 (Jack's decision, 2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0.**

Deliberate revenue decision. Amazon Associates deferred post-launch. No action required. The task prompt's "hiking has ZERO gear items" is obsolete (hiking was never a Peakly category and was never re-enabled post-2026-05-03 pivot).

**Active revenue streams:** Booking.com (aid=2311236), SafetyWing (referenceID=peakly), Travelpayouts (TP_MARKER=710303). Live RPM: ~$7.58/1K MAU.

---

## 3. SEASONAL RELEVANCE — November 15, 2026

**Current season: Northern Hemisphere ski season OPEN (Day 6). Whistler opens in 6 days (Nov 21).**

| Segment | Count | Status |
|---------|-------|--------|
| N-hemi skiing (lat ≥ 0) | 111 | ✅ IN SEASON — peak Nov–Apr window open |
| S-hemi skiing (lat < 0) | 23 | ⚠️ OUT OF SEASON — returns May 2027 |
| Tropical beach (abs lat < 23.5°) | 164 | ✅ YEAR-ROUND — Caribbean, SE Asia, Maldives |
| N-hemi temperate beach (lat 23.5–45°) | ~37 | ⚠️ OFF-PEAK — Mediterranean, California shoulder season |
| S-hemi beach (lat < 0) | 69 | ✅ IN SEASON — Southern summer peak |

**lateSeason:true venues (15)** — all in peak relevance. VPS redeploy is the single highest-impact unlock — without it, two-weekend scoring is off, iOS native fails, and alert deletion silently fails. All three hurt exactly on the Whistler opening weekend traffic spike (Nov 21):
> whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch

---

## 4. CONTENT QUALITY

| Check | Result |
|-------|--------|
| Venues with ≤2 tags | **225** ⚠️ Day 16 of finding |
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

**High-value thin-tag venues (fully in peak season now — Whistler opening week):**
- `abasin` — suggested: "Opening Day Leader", "High Alpine", "Denver Day-Trip"
- `hintertux-glacier` — suggested: "Year-Round Glacier", "Advanced Terrain", "Austria"
- `snowbird` — suggested: "Alta Access", "Deep Powder", "Expert Steeps"
- `whistler` — currently 4 tags ✅ (already well-tagged for the opening week spotlight)

---

## 5. DAILY VENUE ADDITIONS

**FROZEN — per PM v193+ directive, venue additions deferred until post-Reddit launch gate. 404 venues is the locked catalog.**

If the freeze lifts, the highest-value additions per category balance would be:
- More S-hemi ski venues (23 is thin for summer ski season coverage)
- More Indian Ocean beach venues (Réunion, Mauritius — currently underrepresented)
- More Mediterranean ski venues (Montenegro, Slovenia)

---

## One Observation for PM

**Whistler opens in 6 days (Nov 21) — the single highest-traffic event in Peakly's ski category.** The catalog is fully clean (0 defects, 0 dup IDs, 0 dup photos, all 165 APs covered in both AIRPORT_COORDS and AP_CONTINENT — including FOR/NAT which yesterday's false alarm suggested were broken). The only pre-Whistler content gap is the VPS redeploy (Open #19): two-weekend scoring is off until that happens, meaning the app will serve single-weekend scores on Whistler's opening weekend instead of the Friday–Monday confidence range that is Peakly's core differentiator. If VPS redeploy lands before Nov 21, the product delivers its full value proposition on exactly the right weekend.

Yesterday's -1 score deduction for FOR/NAT was a false alarm — reverted, score corrected to 89/100.
