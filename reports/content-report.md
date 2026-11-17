# Peakly Content & Data Report — 2026-11-17

## Data Health Score: 89/100

**Deductions (Day 18):**
- −7: **223 venues have ≤2 tags** (Day 18 — minor improvement: 2 venues enriched to 3 tags since yesterday) — still the highest-leverage remaining content gap.
- −5: **Venue addition queue FROZEN** per PM v193+ directive, deferred post-Reddit gate. Scored for the backlog, not a data error.

> **⚠️ STALE TASK PROMPT NOTE:** This routine's stored prompt references "182 venues, 12 categories, hiking gear items." Actual state (verified continuously): **404 venues, 2 categories (skiing + beach), GEAR_ITEMS cut for v1.** All numbers below are from live app.jsx via Python (dual-format: unquoted + quoted keys).

> **⚠️ LATESEASON COUNT (Day 11 of correction):** DevOps gets 10 via single-pattern regex. Actual count is **15** — 10 unquoted-key venues + 5 JSON-quoted-key venues (`"lateSeason": true`). Authoritative count: **15**.

> **⚠️ .VENUE-BASELINE DRIFT — FALSE ALARM (resolved):** `.venue-baseline` correctly reads 404. The 2 extra "lat" matches are coordinate annotations inside code comments (`// CPT:{lat:...}` and `// GIG:{lat:...}`). ID count = exactly **404**. No drift.

> **⚠️ CACHE STAMP:** `PEAKLY_BUILD = 20261031a` / `sw.js CACHE_NAME = peakly-20261031a` — **17 days stale** (today is 2026-11-17). DevOps concern, not content.

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
| APs missing from BASE_PRICES | **0** ✅ (all venue APs covered) |
| APs missing from AIRPORT_COORDS | **0** ✅ (206 total entries, all venue APs present) |
| APs missing from AP_CONTINENT | **0** ✅ (all venue APs present; `FOR`/`NAT` regex hits are false positives from non-venue object keys) |
| lateSeason:true venues | **15** ✅ (10 unquoted + 5 quoted-key) |
| GEAR_ITEMS occurrences | **0** ✅ (cut for v1 — deliberate) |
| poolPrimary:true venues | **0** (no beach venues with pool-primary flag) |

**Tag depth breakdown:**
| Tags per venue | Count | Δ vs yesterday |
|---|---|---|
| 0 tags | 0 | — |
| 1 tag | 0 | — |
| 2 tags | **223** | ↓2 ✅ |
| 3 tags | 16 | ↑2 ✅ |
| 4 tags | 164 | — |
| 5 tags | 1 | — |

Minor improvement: 2 venues enriched from 2 → 3 tags since yesterday. Catalog otherwise clean.

---

## 2. GEAR ITEMS AUDIT

**GEAR_ITEMS: CUT for v1 (Jack's decision, 2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0.**

Deliberate revenue decision. Amazon Associates deferred post-launch. No action required. The task prompt's "hiking has ZERO gear items" is obsolete (hiking was never a Peakly category and was never re-enabled post-2026-05-03 pivot).

**Active revenue streams:** Booking.com (aid=2311236), SafetyWing (referenceID=peakly), Travelpayouts (TP_MARKER=710303). Live RPM: ~$7.58/1K MAU.

---

## 3. SEASONAL RELEVANCE — November 17, 2026

**Current season: Northern Hemisphere ski season OPEN. Whistler opens in 5 days (Nov 22).**

### Skiing (134 venues)
- **N-hemi (111 venues):** ✅ IN SEASON — Early season in full swing. Glaciers and high-altitude resorts running. Hintertux Glacier (year-round) is the surest early pick.
- **S-hemi (23 venues):** ❌ OFF SEASON — Southern hemisphere ski season ended Oct. Cerro Catedral, Portillo, Cardrona post-season. Hemisphere-aware `isNorth` check suppresses them from the front page.

### lateSeason venues (15 total — extended-season resorts):
**Unquoted format (10):** whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch

**Quoted format (5):** snowbird, zermatt, engelberg, verbier, val-thorens

These venues bypass the off-season cap when `snow_depth_max >= 0.5m`. Correct for current date — high-altitude resorts in this list should be surfacing on the front page right now.

### Beach (270 venues)
- **N-hemi (201 venues):** Caribbean, Canary Islands, SE Asia, and Middle East beaches are IN SEASON. Mediterranean is shoulder/off.
- **S-hemi (69 venues):** ✅ IN SEASON — Southern summer arriving. Great Barrier Reef, South African and Brazilian beaches entering best months.

**Key seasonal opportunity (day 2 of noting):** Caribbean + SE Asia beach destinations are peaking now. 270-venue beach catalog covers these well. No catalog action needed.

---

## 4. CONTENT QUALITY

| Check | Result |
|---|---|
| Short descriptions (<20 words) | N/A — no `description` field in venue objects (by design) |
| Thin tags (≤2) | **223 venues** — Day 18, 2 improved yesterday |
| Venue names with apparent typos | None detected via spot-check |
| Tags accurately reflect venue | Sample check passes; tags are category-appropriate |

**Thin tag finding (Day 18 — SLOWLY IMPROVING):** 223 of 404 venues (55.2%) have exactly 2 tags. Down from 225 two days ago. The fix is non-disruptive (additive only, no scoring impact, no venue freeze issue). Still the only substantive content quality gap.

Tag enrichment backlog by priority (if freeze lifts):
1. **Skiing venues** — `powder`, `tree-skiing`, `beginner-friendly`, `glacier`, `village`, `nightlife`, `family`
2. **Beach venues** — `snorkeling`, `surfing-nearby`, `calm-water`, `party`, `remote`, `reef`, `windsurfing`

---

## 5. DAILY VENUE ADDITIONS

**FROZEN — per PM v193+ directive, venue additions deferred until post-Reddit launch gate. 404 venues is the locked catalog.**

If the freeze lifts, highest-value additions per category balance:
- More S-hemi ski venues (23 is thin for summer ski season coverage)
- More Indian Ocean beach venues (Réunion, Mauritius — currently underrepresented)
- More Mediterranean ski venues (Montenegro, Slovenia)

---

## One Observation for PM

**Whistler opens in 5 days (Nov 22) and VPS redeploy is still unshipped.** Until Open #19 lands (copy `server/proxy.js` to `/opt/peakly-proxy` + `pm2 restart`), Peakly serves single-weekend scores instead of the Fri–Mon confidence window that is the product's headline differentiator. Whistler opening weekend is high-intent traffic — users searching "Whistler opening weekend" will expect the app to tell them whether the conditions are genuinely worth the trip. Without the two-weekend scoring and the 14-day weather horizon, the confidence badge will be absent or degraded. This is a 10-minute SSH action that keeps getting deferred. Recommend treating it as a hard deadline: **VPS redeployed before Nov 22 or the opening-weekend showcase is on legacy scoring.**
