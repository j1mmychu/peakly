# Peakly Content & Data Report — 2026-11-16

## Data Health Score: 89/100

**Deductions (Day 17):**
- −7: **225 venues have ≤2 tags** (Day 17 of finding — unchanged) — tag enrichment remains the highest-leverage content improvement within the venue freeze.
- −5: **Venue addition queue FROZEN** per PM v193+ directive, deferred post-Reddit gate. Scored for the backlog, not a data error.

> **⚠️ STALE TASK PROMPT NOTE:** This routine's stored prompt references "182 venues, 12 categories, hiking gear items." Actual state (verified continuously): **404 venues, 2 categories (skiing + beach), GEAR_ITEMS cut for v1.** All numbers below are from live app.jsx via Python (dual-format: unquoted + quoted keys).

> **⚠️ LATESEASON COUNT (Day 10 of correction):** DevOps gets 10 via single-pattern regex (`lateSeason:\s*true` only). Actual count is **15** — 10 unquoted-key venues + 5 JSON-quoted-key venues (`"lateSeason": true`). Authoritative count: **15**. Full list in Section 3.

> **⚠️ .VENUE-BASELINE DRIFT — FALSE ALARM (Day 2):** DevOps reports eval count 406 vs baseline 404. This is a counting artifact: 2 of the 406 "lat" matches are in **code comments**, not venue objects: `// CPT:{lat:-33.9648,lon:18.6017}` and `// GIG:{lat:-22.8100,lon:-43.2507}` (airport coordinates noted in comment annotations for clifton-four and ipanema-rio). Actual venue ID count = **404**, matching the baseline exactly. `.venue-baseline` is correct at 404 — no update needed.

> **⚠️ CACHE STAMP:** `PEAKLY_BUILD = 20261031a` / `sw.js CACHE_NAME = peakly-20261031a` — **16 days stale** (today is 2026-11-16). DevOps concern, not content.

---

## 1. DATA INTEGRITY AUDIT

| Check | Result |
|-------|--------|
| Total venues | **404** ✅ |
| Skiing | **134** (111 N-hemi + 23 S-hemi) |
| Beach | **270** (201 N-hemi + 69 S-hemi) |
| Duplicate IDs | **0** ✅ (boot-time guard confirmed) |
| Duplicate photos | **0** ✅ (404 unique photo URLs) |
| Missing lat/lon | **0** ✅ (406 "lat" matches = 404 venue lats + 2 in comments — see note above) |
| Missing airport codes | **0** ✅ |
| Missing tags array | **0** ✅ |
| APs missing from BASE_PRICES | **0** ✅ (165 unique venue APs, all 165 covered) |
| APs missing from AIRPORT_COORDS | **0** ✅ (206 total entries, all 165 venue APs present) |
| APs missing from AP_CONTINENT | **0** ✅ (283 total entries, all 165 venue APs present) |
| lateSeason:true venues | **15** ✅ (10 unquoted + 5 quoted-key) |
| GEAR_ITEMS occurrences | **0** ✅ (cut for v1 — deliberate) |
| poolPrimary:true venues | **0** (no beach venues with pool-primary flag) |

**Tag depth breakdown:**
| Tags per venue | Count |
|---|---|
| 0 tags | 0 |
| 1 tag | 0 |
| 2 tags | **225** ← thin |
| 3 tags | 14 |
| 4 tags | 163 |
| 5 tags | 2 |

No new data errors found vs. yesterday. Catalog is clean.

---

## 2. GEAR ITEMS AUDIT

**GEAR_ITEMS: CUT for v1 (Jack's decision, 2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0.**

Deliberate revenue decision. Amazon Associates deferred post-launch. No action required. The task prompt's "hiking has ZERO gear items" is obsolete (hiking was never a Peakly category and was never re-enabled post-2026-05-03 pivot).

**Active revenue streams:** Booking.com (aid=2311236), SafetyWing (referenceID=peakly), Travelpayouts (TP_MARKER=710303). Live RPM: ~$7.58/1K MAU.

---

## 3. SEASONAL RELEVANCE — November 16, 2026

**Current season: Northern Hemisphere ski season OPEN. Whistler opens in 6 days (Nov 22).**

### Skiing (134 venues)
- **N-hemi (111 venues):** ✅ IN SEASON — Early season for most resorts. Snow depths thin at lower elevations, glaciers and high-altitude resorts running.
- **S-hemi (23 venues):** ❌ OFF SEASON — Southern hemisphere ski season ends Oct. Venues like Cerro Catedral, Portillo, Cardrona are closed/post-season. Scoring handles this via hemisphere-aware `isNorth` check; they will not surface on front page.

### lateSeason venues (15 total — extended-season resorts):
**Unquoted format (10):** whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch

**Quoted format (5):** snowbird, zermatt, engelberg, verbier, val-thorens

These venues bypass the off-season cap when `snow_depth_max >= 0.5m`. Hintertux Glacier (year-round glacier) is the highest-certainty early-season venue — typically has skiable snow by November. Correct for current date.

### Beach (270 venues)
- **N-hemi (201 venues):** Most N-hemi beach venues are off-peak. Caribbean, Canary Islands, SE Asia, and Middle East beaches are IN SEASON for November. Mediterranean is shoulder/off.
- **S-hemi (69 venues):** ✅ IN SEASON — Southern summer approaching. Great Barrier Reef, South African beaches, Brazilian beaches entering best season.

**Key seasonal opportunity:** Caribbean + SE Asia beach destinations are peaking NOW. The 270-venue beach catalog covers these well. No action needed.

---

## 4. CONTENT QUALITY

| Check | Result |
|---|---|
| Short descriptions (<20 words) | N/A — no `description` field in venue objects (by design) |
| Thin tags (≤2) | **225 venues** — Day 17, unchanged |
| Venue names with apparent typos | None detected via spot-check |
| Tags accurately reflect venue | Sample check passes; tags are category-appropriate |

**Thin tag finding (Day 17 — PERSISTENT):** 225 of 404 venues (55.7%) have exactly 2 tags. Minimum viable tag count for search/filter relevance is 3-4. This is the only content quality gap. The fix is non-disruptive (additive only), no scoring impact, low risk. Within the venue freeze, this is the one content task that could be done safely — it doesn't add venues, only enriches existing ones.

Tag enrichment priority order:
1. **Skiing venues** — add specificity tags like `powder`, `tree-skiing`, `beginner-friendly`, `glacier`, `village`, `nightlife`, `family`
2. **Beach venues** — add `snorkeling`, `surfing-nearby`, `calm-water`, `party`, `remote`, `reef`, `windsurfing`

---

## 5. DAILY VENUE ADDITIONS

**FROZEN — per PM v193+ directive, venue additions deferred until post-Reddit launch gate. 404 venues is the locked catalog.**

If the freeze lifts, the highest-value additions per category balance:
- More S-hemi ski venues (23 is thin for summer ski season coverage)
- More Indian Ocean beach venues (Réunion, Mauritius — currently underrepresented)
- More Mediterranean ski venues (Montenegro, Slovenia)

---

## One Observation for PM

**The `.venue-baseline` drift alarm (DevOps flagging 406 vs 404) is a false alarm.** The 2 extra "lat" hits are coordinate annotations inside code comments (`// CPT:{lat:...}` and `// GIG:{lat:...}`) added when two new venues were committed — they're not venue objects. ID count is exactly 404, matching the baseline. No drift, no update needed. DevOps should be informed so the alarm doesn't recur.

**Whistler opens in 6 days (Nov 22).** Catalog is fully clean for ski season — all 134 skiing venues have coords, APs, tags, and photos. The only pre-Whistler gap is VPS redeploy (Open #19): two-weekend scoring stays off until it lands, meaning Peakly serves single-weekend scores on Whistler's opening weekend instead of the Fri–Mon confidence window that is the product's differentiator. That is a 10-minute Jack-only SSH action.
