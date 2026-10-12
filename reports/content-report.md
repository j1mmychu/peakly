# Peakly Content & Data Report — 2026-10-12

## Data Health Score: 91/100

**Deductions (unchanged since 2026-10-08):**
- −7: 225 venues (55.7%) have exactly 2 tags — `scoreVibeMatch` and search recall gap. Not fixable under code freeze. Post-launch sprint target.
- −1: Gili Trawangan duplicate still live (`beach_gilit`/LOP + `gili-trawangan`/DPS) — blocked by code freeze.
- −1: Stale scheduled-task prompt (see warning below).

**No score change from yesterday: 91/100.** All checks pass; code freeze Day 28 holds clean.

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories" with surfing, tanning, hiking, etc. The project pivoted 2026-05-03 to **skiing + beach only**. Correct count: **404 venues (134 skiing / 270 beach)**. The prompt author should update the cron task's stored text. All audit data below reflects the actual current app state.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,238** (unchanged, code freeze Day 28) |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate venue IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| Venue APs in AP_CONTINENT | **165/165** ✅ |
| Venue APs in AIRPORT_COORDS | **165/165** ✅ |
| Venue APs in BASE_PRICES | **165/165** ✅ (181 destination keys) |
| Venues with exactly 2 tags | **225 (55.7%)** ⚠️ post-launch sprint |
| lateSeason:true venues | **15** ✅ (eval-authoritative) |
| GEAR_ITEMS | **0** ✅ (Amazon cut for v1 — intentional) |
| Active categories | **skiing, beach** ✅ |
| Code freeze | **Day 28** — Oct 18 launch in **6 days** |
| Build stamp | **20260914a** (sw.js / app.jsx / index.html lockstep ✅) |

---

## 1. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues (eval-based: bracket-walker over VENUES array) | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique) ✅ |
| Missing lat/lon | **0** ✅ |
| Missing ap (IATA) | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| APs missing from AP_CONTINENT | **0** ✅ |
| APs missing from AIRPORT_COORDS | **0** ✅ |
| APs missing from BASE_PRICES | **0** ✅ |
| Brace balance | **5682 / 5682** ✅ |

**Known flagged issue (code freeze — no action):**
- `beach_gilit` (Gili Trawangan/LOP) + `gili-trawangan` (Gili Trawangan/DPS) — same venue, two IDs. Fix post-launch: delete `gili-trawangan` (lower-quality entry).

**Data note (lateSeason format split — carries forward from 2026-10-11):**
`grep -c "lateSeason:true"` returns **10** — undercounts because 5 venues use quoted JSON format (`"lateSeason": true`). The eval-based count of **15** is authoritative. CLAUDE.md's `grep -c` guidance for this field is stale.

---

## 2. Gear Items Audit

**Status: N/A — GEAR_ITEMS intentionally absent for v1** (Amazon Associates cut, `grep -c GEAR_ITEMS app.jsx` → 0). Per CLAUDE.md revenue model: $7.58/1K MAU without Amazon. No action needed.

---

## 3. Seasonal Relevance — October 12

**Today is prime window for: Southern hemisphere beaches (spring ramp), all tropical beaches, and glacier/high-altitude ski venues. Standard N.hem ski is off-season but opens in ~5–6 weeks.**

| Segment | Count | Status |
|---------|-------|--------|
| N.hem ski (standard, lat ≥0, non-lateSeason) | 96 | ⛔ OFF-SEASON — scoring engine `inSeason` check caps these; first N.hem openings ~mid-Nov |
| N.hem ski (lateSeason glaciers) | 15 | ✅ OPEN — all 15 active: Hintertux (year-round), Saas-Fee, Tignes, Les Deux Alpes, Chamonix, Mammoth, A-Basin, Cervinia, Zermatt, St. Moritz, Verbier, Engelberg, Snowbird, Val Thorens (opens Oct 18 — launch day), Whistler |
| S.hem ski | 23 | ⚠️ CLOSING — S.hem ski season ends Oct–Nov; dormant or final days |
| Beach tropical (lat ±10°) | 55 | ✅ YEAR-ROUND |
| N.hem beach (lat >10°) | 177 | ✅ SHOULDER — Mediterranean/Canaries peak winding down, Caribbean/SE Asia in great shape |
| S.hem beach (lat <−10°) | 38 | ✅ SPRING RAMP — best window opening up (Brazil, Australia, South Africa) |

**Val Thorens opens October 18 — same day as launch.** The only lateSeason venue with a known fixed opening date that coincides with the launch. This is a marquee alignment story.

---

## 4. Content Quality

| Check | Result |
|-------|--------|
| Venues with exactly 2 tags | **225 (55.7%)** ⚠️ — affects vibe-match search recall |
| Venues with 3 tags | 14 |
| Venues with 4 tags | 164 |
| Venues with 5 tags | 1 |
| Duplicate photo URLs | 0 ✅ |
| Venues with (0,0) coordinates | 0 ✅ |

**Tags gap**: 225 venues have only 2 tags (minimum). `scoreVibeMatch` and keyword search both degrade at 2 tags. Post-launch sprint: bump weakest-performing venues to 4+ tags. Skiing venues tend to have 4 tags; beach venues disproportionately sit at 2. Not addressable under code freeze.

---

## 5. New Venue Objects — PAUSED (Code Freeze Day 28)

**No new venues added.** Code freeze is active; Oct 18 launch is 6 days away. Adding venues now would require app.jsx edits that:
- Reset the 28-day clean freeze streak
- Risk a Babel parse regression hours before launch
- Require a cache stamp bump + smoke test cycle with no buffer

**Post-launch target:** 20+ S.hem beach venues (Brazil coast, Chile, Peru, South Africa Western Cape) + 15+ N.hem ski venues for the Nov opening rush (Vail, Breckenridge, Lake Tahoe resorts). File under the same sprint as the 2-tag cleanup.

---

## One Observation for PM

**The VPS redeploy window (Oct 11–12) appears to have been missed again — now Day 64.** DevOps confirmed this in today's report. The scoring engine's `inSeason` and weather-cache logic both depend on the deployed proxy; without the redeploy, two-weekend scoring stays silently off, iOS native can't reach the proxy, and the Val Thorens launch-day story won't be backed by live weather data. With 6 days to launch, this is the single highest-risk open item. If the Oct 11–12 SSH window was truly missed, the next viable window is today or tomorrow — after that it's a launch-day config risk.
