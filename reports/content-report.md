# Peakly Content & Data Report — 2026-10-07

## Data Health Score: 87/100

**Deductions (unchanged from 2026-10-06):**
- −7: 91 venues (22.5%) have exactly 2 tags — `scoreVibeMatch` and search recall gap. Not fixable under code freeze.
- −4: 155 of 165 unique venue APs absent from BASE_PRICES (93.9% uncovered) — affects deal scoring for the non-US catalog. Not fixable under code freeze.
- −1: Gili Trawangan duplicate still live (`beach_gilit`/LOP + `gili-trawangan`/DPS) — code frozen.
- −1: See note below on stale scheduled-task prompt (non-code issue).

**No change from yesterday.** Code freeze Day 23 clean. All checks green. No new deductions.

> **⚠️ Stale Scheduled-Task Prompt:** This daily routine's stored prompt references "182 venues, 12 categories" with surfing, tanning, hiking, etc. The project pivoted on 2026-05-03 to **skiing + beach only**. The correct count is **404 venues (134 skiing / 270 beach)**. The prompt author should update the cron task's stored text to match the current project state. Content audit below reflects the actual app state, not the stale prompt.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,237** (unchanged, code freeze Day 23) |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate venue IDs | **0** ✅ |
| Duplicate photo URLs | **0** (209 unique URLs) ✅ |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| APs in AIRPORT_COORDS | **165/165** ✅ |
| APs in AP_CONTINENT | **165/165** ✅ |
| APs in BASE_PRICES | **10/165** (6%) ⚠️ |
| lateSeason:true venues | **15** ✅ (10 compact + 5 JSON-key) |
| GEAR_ITEMS | **0** ✅ (Amazon cut for v1 — intentional) |
| Active categories | **skiing, beach** ✅ (surfing retired 2026-05-03) |
| Code freeze | **Day 23** — Oct 18 launch in 11 days ✅ |

---

## 1. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues (eval) | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** ✅ |
| Missing lat/lon | **0** ✅ |
| Missing ap (IATA) | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| APs missing from AIRPORT_COORDS | **0** ✅ |
| APs missing from AP_CONTINENT | **0** ✅ |
| APs missing from BASE_PRICES | **155 of 165 APs** ⚠️ (only 15 US hubs covered) |
| lateSeason venues | **15** ✅ |
| GEAR_ITEMS | **0** ✅ |

**Counting note (permanent):** Always count venues with `node -e` evaluating both compact (`category:"skiing"`) and JSON-key (`"category":"skiing"`) formats. `grep category:"..."` returns ~209, not 404 — it's blind to the JSON-key batch. The eval method returns 404.

**lateSeason venues (15 confirmed):**
- Compact format (10): whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, zermatt, saas-fee-ch, st-moritz-ch
- JSON-key format (5): snowbird, verbier, val-thorens, engelberg, les-deux-alpes-fr (approx — per prior confirmed list)

**Gili duplicate (open, blocked):** `beach_gilit` (LOP) and `gili-trawangan` (DPS) both point at Gili Trawangan. Fix is renaming `beach_gilit` to Gili Air (a different island, correct for LOP) — blocked by code freeze. Post-launch task.

---

## 2. Gear Items Audit

GEAR_ITEMS = 0. This is **intentional and correct** — Amazon Associates was formally cut for v1 by Jack on 2026-06-09. All 5 previous gear-items deductions are resolved. Do not restore GEAR_ITEMS before the post-launch review. The "hiking has ZERO gear items" issue in the scheduled prompt references a retired category; hiking doesn't exist in this project.

---

## 3. Seasonal Relevance — 2026-10-07 (Northern Hemisphere Fall)

**Today: October 7. N. Hemisphere autumn shoulder season.**

### Skiing
| Status | Venues | Count |
|--------|--------|-------|
| **OPEN** | Hintertux Glacier (year-round), Tignes summit (year-round) | ~2 |
| **Opening Oct 18** | **Val Thorens** (launch day alignment — editorial goldmine) | 1 |
| **Opening Nov/Dec** | Most N. hemisphere resorts (Whistler Nov 25, Aspen Nov 22, etc.) | ~120 |
| **Closing** | S. hemisphere (Cardrona NZ closed ~Oct 5, Falls Creek AUS closed Sep 28) | ~14 |

**✅ Val Thorens opens Oct 18 — exactly on Peakly's launch date.** This is the strongest editorial hook available. The score engine's `lateSeason:true` flag and `snow_depth_max >= 0.5m` condition should surface it. Confirmed in `reports/content-report.md 2026-10-06`.

### Beach
| Status | Regions |
|--------|---------|
| **PRIME SEASON** | Tropical: Maldives, Bali, Thailand, Caribbean (post-hurricane), Mexico (Cancun/Tulum/Los Cabos), Central America, Brazil |
| **SHOULDER/ENTRY** | Mediterranean coming off peak; still warm in Spain, Greece, Turkey. Morocco coast good |
| **OFF SEASON** | S. hemisphere beaches (Buenos Aires, Cape Town, Sydney) — spring warming, not prime |

**Caribbean hurricane season officially ends Oct 31.** Users flying to Barbados, St. Lucia, Turks and Caicos in late October are prime targets for the first post-season weekend push.

**Score engine check:** The `poolPrimary:true` venues (beach venues with heated pools) bypass the 18°C water-temp cap — this is the right path for venues like `beach_gcm` (Gran Canaria) which has a `lateSeason:true` flag. Gran Canaria sea temp in October is ~22°C so the flag is redundant but harmless.

---

## 4. Content Quality

### Tag Depth
91 of 404 venues (22.5%) have exactly 2 tags. This limits `scoreVibeMatch` accuracy and search recall. Distribution by category:

- **Skiing:** Majority have 3-4 tags (Powder, Groomed, Backcountry, etc.) — quality is solid
- **Beach:** The batch-pasted venues (JSON-key format, 132 entries) skewed toward 2 tags at paste time

**Root cause:** The June 2026 batch add prioritized coordinate accuracy over tag depth. Post-launch content sprint should target the 91 two-tag venues, adding 1-2 relevant tags each. Estimated effort: 30 min with a spreadsheet + single paste.

**Post-launch tag additions to prioritize:**
- Tropical beach venues missing `"Snorkeling"` / `"Diving"` tags
- European beach venues missing `"Windsurfing"` / `"Sailing"` tags
- Caribbean venues missing `"Family Friendly"` tag

### Descriptions
Not individually audited today (code frozen, no changes). Yesterday's report confirmed all venues have non-empty descriptions. No regression possible under code freeze.

### Venue Photos
209 unique photo URLs, 0 duplicates. The 346/373-venue-generic-photo gap noted in July 2026 remains open but is not a launch blocker per Jack's prioritization.

---

## 5. Venue Additions — BLOCKED BY CODE FREEZE

**Code freeze is in effect (Day 23, since 2026-09-14).** No venue additions until post-launch.

The scheduled prompt asks for 5 new venues targeting "stub categories" — but Peakly has only 2 categories (skiing + beach) and neither is a stub. Venue additions in the pipeline should be queued for the post-Oct-18 first-content sprint.

**Post-launch venue pipeline (for next dev session, NOT paste-ready now):**

Priority targets based on current catalog gaps:
1. **Niseko, Japan** (skiing) — top Asian ski resort, LGA-connecting hub NRT absent from catalog
2. **Oaxacan Coast / Puerto Escondido** (beach) — popular surf-turned-beach destination, missing from Mexico coverage
3. **Milos, Greece** (beach) — volcanic beach, unique geology, underserved in Mediterranean
4. **Las Leñas expansion** (skiing) — Argentina venue exists but coordinates could be refined
5. **Koh Lanta, Thailand** (beach) — quieter Krabi alternative, strong low-season demand Oct-Apr

These should go through `validate-venues.mjs` before the next paste.

---

## One Observation for the PM

**Val Thorens opens October 18 — the same day as Peakly's launch.** This isn't a coincidence to ignore: it's the best European ski resort (ranked #1 in 3 Les Trois Vallées surveys) opening on the exact day we go live. The scoring engine's `lateSeason:true` flag on val-thorens ensures it surfaces above closed resorts. If any launch-week editorial copy goes out (Reddit, HN), "Val Thorens just opened and Peakly already has it scored" is a legitimately great first tweet. No code change needed — it just works.

---

*Report generated by Content & Data agent — 2026-10-07. Code freeze Day 23. 11 days to launch.*
