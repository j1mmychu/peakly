# Peakly Content & Data Report — 2026-10-08

## Data Health Score: 91/100

**Deductions (corrected from 2026-10-07):**
- −7: 225 venues (55.7%) have exactly 2 tags — `scoreVibeMatch` and search recall gap. Not fixable under code freeze. *(corrected count: was wrongly reported as 91 / 22.5% yesterday)*
- −1: Gili Trawangan duplicate still live (`beach_gilit`/LOP + `gili-trawangan`/DPS) — code frozen.
- −1: Stale scheduled-task prompt (see note below).

**Score changes from yesterday:** 87 → **91** (+4). The −4 BASE_PRICES deduction is removed: BASE_PRICES now covers all 165/165 venue APs (100%). Yesterday's report of "10/165 (6%)" was incorrect — BASE_PRICES has been substantially expanded and covers the full catalog.

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories" with surfing, tanning, hiking, etc. The project pivoted 2026-05-03 to **skiing + beach only**. Correct count: **404 venues (134 skiing / 270 beach)**. The prompt author should update the cron task's stored text. Content audit below reflects actual app state.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,238** (unchanged, code freeze Day 24) |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate venue IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| APs in AIRPORT_COORDS | **165/165** ✅ |
| APs in AP_CONTINENT | **165/165** ✅ |
| BASE_PRICES destinations | **181 total / 165/165 venue APs covered** ✅ |
| Venues with exactly 2 tags | **225 (55.7%)** ⚠️ |
| lateSeason:true venues | **15** ✅ |
| GEAR_ITEMS | **0** ✅ (Amazon cut for v1 — intentional) |
| Active categories | **skiing, beach** ✅ |
| Code freeze | **Day 24** — Oct 18 launch in 10 days ✅ |

---

## 1. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues (eval) | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique) ✅ |
| Missing lat/lon | **0** ✅ |
| Missing ap (IATA) | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| APs missing from AIRPORT_COORDS | **0** ✅ |
| APs missing from AP_CONTINENT | **0** ✅ |
| APs missing from BASE_PRICES | **0 of 165** ✅ (all covered — see note) |
| lateSeason venues | **15** ✅ |
| GEAR_ITEMS | **0** ✅ |

**BASE_PRICES coverage (corrected):** BASE_PRICES has **181 destination APs** total. All 165 unique venue APs are covered (100%). This corrects yesterday's wrong figure of "10/165 (6%)." The object has been expanded significantly since the July 2026 CLAUDE.md entry that flagged 68% missing — that gap was closed in a prior session and BASE_PRICES is no longer an open issue.

**Tag depth (corrected):** Tag count distribution across 404 venues:
- 2 tags: **225 venues (55.7%)** ← the real scale of the quality gap
- 4 tags: 164 venues (40.6%)
- 3 tags: 14 venues (3.5%)
- 5 tags: 1 venue (0.2%)

This corrects yesterday's wrong figure of 91 (22.5%). The gap is 2.5× larger than previously reported. Still not fixable under code freeze but should be the first post-launch content sprint target.

**Photo coverage:** 404 unique photo URLs across 404 venues — no duplicates. Yesterday's "209 unique URLs" was incorrect. All venues have distinct photo URLs.

**Counting note (permanent):** Always count venues with `node -e` evaluating both compact (`category:"skiing"`) and JSON-key (`"category":"skiing"`) formats. `grep category:"..."` undercounts to ~209. Eval = 404.

**Gili duplicate (open, blocked):** `beach_gilit` (LOP) and `gili-trawangan` (DPS) both represent Gili Trawangan. Fix: rename `beach_gilit` to Gili Air (a different island, correct for LOP). Blocked by code freeze. Post-launch task.

---

## 2. Gear Items Audit

GEAR_ITEMS = 0. **Intentional and correct** — Amazon Associates was formally cut for v1 by Jack on 2026-06-09. Do not restore before the post-launch review. The scheduled prompt's "hiking has ZERO gear items" references a retired category that doesn't exist in this project.

---

## 3. Seasonal Relevance — 2026-10-08 (Northern Hemisphere Fall)

**Today: October 8. N. Hemisphere autumn shoulder season. 10 days to launch.**

### Skiing
| Status | Venues | Count |
|--------|--------|-------|
| **OPEN NOW** | Hintertux Glacier (year-round), Tignes summit (year-round) | ~2 |
| **Opening Oct 18 (LAUNCH DAY)** | **Val Thorens** — Europe's highest resort, opens annually ~Oct 18 | 1 |
| **Opening Nov/Dec** | Most N. hemisphere (Whistler Nov 25, Aspen Nov 22, Breckenridge Nov 14, etc.) | ~120 |
| **CLOSED — S. hemisphere** | Cardrona NZ, Falls Creek AUS, etc. — seasonal close ~early Oct | ~14 |

**✅ Val Thorens opens Oct 18 — Peakly's exact launch date.** The `lateSeason:true` flag + `snow_depth_max >= 0.5m` condition surfaces it above closed resorts. No code change needed.

### Beach
| Status | Regions |
|--------|---------|
| **PRIME** | Tropical: Maldives, Bali, Thailand, Caribbean (hurricane season ending Oct 31), Mexico (Cancun/Tulum/Los Cabos), Central America, Brazil |
| **SHOULDER** | Mediterranean — Spain, Greece, Turkey still warm through Oct; Morocco coast solid |
| **INCOMING PRIME** | Caribbean post-hurricane: Barbados, St. Lucia, Turks & Caicos, Anguilla — optimal from Nov 1 onward |

**Caribbean hurricane season ends Oct 31** — users who see Peakly at launch on Oct 18 are booking the first safe Caribbean weekends of the season. Strong editorial hook for the first post-launch newsletter.

---

## 4. Content Quality

### Tag Depth
225 of 404 venues (55.7%) have exactly 2 tags — the true scale of the `scoreVibeMatch` and search recall gap. This is the top content sprint item for post-launch.

**Post-launch tag sprint plan (~30 min with a spreadsheet):**
- Tropical beach venues missing `"Snorkeling"` / `"Diving"` (est. 40–50 venues)
- European beach venues missing `"Windsurfing"` / `"Sailing"` (est. 20–25 venues)
- Caribbean venues missing `"Family Friendly"` / `"Snorkeling"` (est. 15–20 venues)
- Skiing venues missing `"Family Friendly"` / `"Groomed"` tags (est. 10–15 venues)

Target: bring all venues to 4+ tags post-launch.

### Photos
404 unique photo URLs, 0 duplicates. The photo dedup script ran June 2026 and distributed the category palettes evenly. The ~346 venues showing generic stock photos (vs. the 27 marquee venues with real location photos) remains a quality gap but is not a launch blocker.

### Descriptions
Not individually audited (code frozen, no changes possible). Prior audits confirmed non-empty descriptions across all 404 venues. No regression possible under code freeze.

---

## 5. Venue Additions — BLOCKED BY CODE FREEZE

**Code freeze in effect (Day 24, since 2026-09-14).** No venue additions until post-Oct-18.

The scheduled prompt asks for 5 venues targeting "stub categories" — Peakly has 2 categories (skiing + beach) and neither is a stub. Post-launch pipeline:

1. **Niseko, Japan** (skiing) — top Asian resort, NRT in BASE_PRICES ✅, not yet in VENUES
2. **Puerto Escondido, Mexico** (beach) — OAX in BASE_PRICES ✅, missing from Mexico beach coverage
3. **Milos, Greece** (beach) — volcanic beaches, unique Mediterranean geology
4. **Koh Lanta, Thailand** (beach) — quieter Krabi-coast alternative, strong Oct–Apr demand
5. **Punta del Este, Uruguay** (beach) — premier S. hemisphere summer beach (Nov–Mar), BUE or MVD

Run through `validate-venues.mjs` before pasting.

---

## Corrections to Prior Reports

Yesterday's report (2026-10-07) contained three incorrect figures. All stem from inaccurate extraction methods (grep vs. eval, partial block parsing):

| Metric | Yesterday (wrong) | Today (correct) |
|--------|------------------|-----------------|
| Venues with 2 tags | 91 (22.5%) | **225 (55.7%)** |
| Unique photo URLs | 209 | **404** (all unique) |
| BASE_PRICES AP coverage | 10/165 (6%) | **165/165 (100%)** |

---

## One Observation for the PM

**The 2-tag quality gap is 2.5× worse than we've been reporting.** 225 venues (55.7%) have exactly 2 tags — not 91 (22.5%). `scoreVibeMatch` runs on tags, so the vibe-matching feature is underperforming for over half the catalog. This doesn't affect the launch (scoring still works), but the first post-launch content sprint should prioritize tag expansion before venue additions. A 30-minute tag audit would immediately improve search recall and vibe matching for the majority of the catalog.

---

*Report generated by Content & Data agent — 2026-10-08. Code freeze Day 24. 10 days to launch.*
