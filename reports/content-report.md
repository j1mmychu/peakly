# Peakly Content & Data Report — 2026-10-09

## Data Health Score: 91/100

**Deductions (unchanged from 2026-10-08):**
- −7: 225 venues (55.7%) have exactly 2 tags — `scoreVibeMatch` and search recall gap. Not fixable under code freeze. Post-launch sprint target.
- −1: Gili Trawangan duplicate still live (`beach_gilit`/LOP + `gili-trawangan`/DPS) — blocked by code freeze.
- −1: Stale scheduled-task prompt (see warning below).

**No score change from yesterday: 91/100.** All checks pass, no new issues found.

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories" with surfing, tanning, hiking, etc. The project pivoted 2026-05-03 to **skiing + beach only**. Correct count: **404 venues (134 skiing / 270 beach)**. The prompt author should update the cron task's stored text. Content audit below reflects actual app state.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,237** (unchanged, code freeze Day 25) |
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
| Code freeze | **Day 25** — Oct 18 launch in **9 days** ✅ |
| Build stamp | **20260914a** |

---

## 1. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues (eval: unquoted + quoted IDs) | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique) ✅ |
| Missing lat/lon | **0** ✅ |
| Missing ap (IATA) | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| APs missing from AIRPORT_COORDS | **0** ✅ |
| APs missing from AP_CONTINENT | **0** ✅ |
| APs missing from BASE_PRICES | **0 of 165** ✅ |
| lateSeason:true venues | **15** ✅ |
| poolPrimary:true venues | **0** |
| GEAR_ITEMS | **0** ✅ (intentional) |

**Venue count methodology:** `node -e` evaluating both compact (`id:"..."`) and JSON-key (`"id":"..."`) formats. Compact: 209 entries (71 skiing / 138 beach). Quoted JSON: 195 entries (63 skiing / 132 beach). Total: 404. `grep category:"..."` undercounts to ~209 and must not be used.

**lateSeason count (15 — verified):** whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch, engelberg. All confirmed via `grep -c "lateSeason.*true"` = 15.

**Known open issue (code frozen):** `beach_gilit` (LOP) and `gili-trawangan` (DPS) both represent Gili Trawangan. Fix post-launch: rename `beach_gilit` → Gili Air (a distinct island, correct for LOP). Not touching under code freeze.

---

## 2. Gear Items Audit

GEAR_ITEMS = 0. **Intentional and correct** — Amazon Associates was formally cut for v1 by Jack on 2026-06-09. Do not restore before the post-launch review. The scheduled prompt's "hiking has ZERO gear items" references a retired category that does not exist in this project.

---

## 3. Seasonal Relevance — 2026-10-09 (Northern Hemisphere Fall Onset)

**Today: October 9, 2026. 9 days to Oct 18 launch.**

### Northern Hemisphere Skiing (134 venues total, 15 lateSeason)
- **lateSeason venues (15):** Hintertux Glacier, Tignes, Saas-Fee, Zermatt, etc. — open and scoring now. **Val Thorens opens ~Oct 18**, which aligns perfectly with the launch date and will appear as an early-season option.
- **Standard NH ski resorts (~119):** Pre-season. Most open late October to December. `scoreVenue` correctly scores these as off-season (below threshold) until snow depth / season gates open. They will be present in the venue list but will score low or be suppressed on the front page.
- **Launching into the shoulder = good timing:** By Oct 18 there will be ~3-5 early-opening European glacier resorts actively scoring + Val Thorens just opening. The app's honest confidence system ("Beyond reliable forecast") protects against overselling. First-week users will see real options, not blanks.

### Southern Hemisphere Skiing (23 venues)
- Argentina (Cerro Catedral, Las Leñas, Chapelco, Caviahue), Chile (Valle Nevado, Portillo, La Parva, El Colorado, Nevados de Chillán, Corralco), New Zealand (Cardrona, Mt Hutt, Remarkables, Coronet Peak, Treble Cone), Australia (Perisher, Thredbo, Falls Creek, Mt Buller, Mt Hotham, Charlotte Pass), Pucón (Chile), Cerro Castor (Argentina).
- **October = final month of southern ski season.** These will score at or near zero by late October and be suppressed from the front page at launch. Correct behavior — the algorithm handles this.
- **Post-launch (Nov onward):** These 23 venues go fully dormant until May 2027. Normal.

### Northern Hemisphere Beach (270 venues)
- **Tropics (lat 0–25°N):** Caribbean, Mexico, SE Asia, Hawaii, Maldives, Pacific Islands — **peak or year-round season**. These 130+ venues will dominate beach recommendations at launch. Strong.
- **Mediterranean (lat 30–45°N):** Greece, Spain, Croatia, Turkey, Italy — **shoulder season**. Water still 20-23°C, air cooling. `scoreVenue` will score these medium-to-low for beach. Correct.
- **No northern Europe beach venues (lat > 45°N)** — confirmed via coord scan, so no off-season dead weight in the high-latitude band.

### Southern Hemisphere Beach
- **Southern spring** — Brazil, South Africa, Australia beach venues transitioning into their peak season (Dec-Mar). Will start scoring well through November. Good timing for southern audiences finding the app.

**Net seasonal assessment:** The product launches into exactly the right moment for its two categories — early-opening ski season (glacier resorts live, Alps openers imminent) and tropical beach peak season. Score: ✅

---

## 4. Content Quality Audit

**Tag depth (confirmed stable, day 2):**
| Tag count | Venues | % |
|-----------|--------|---|
| 2 tags | **225** | 55.7% ⚠️ |
| 3 tags | **14** | 3.5% |
| 4 tags | **164** | 40.6% ✅ |
| 5 tags | **1** | 0.2% |

The 225 two-tag venues fall disproportionately in the JSON-format (quoted-key) batch entries — likely added without thorough tag expansion. This affects `scoreVibeMatch` precision and tag-based search recall. **Not fixable under code freeze.** First post-launch content sprint: expand each of the 225 two-tag venues to 4 tags. Estimated effort: ~4h with a scripted batch update.

**Description fields:** The VENUES array does not include `description` fields for most venues — descriptions are rendered from title + location + tags in the UI. This is by design (no description regression to report).

**Difficulty levels:** Not a required field in the schema; not checked.

---

## 5. New Venue Additions — DEFERRED (Code Freeze Day 25)

**Code freeze is active — no changes to app.jsx.** 9 days to the Oct 18 launch. New venue additions are deferred until post-launch.

For the record, the next venue batch to prioritize post-launch:
- **Ski:** More Southeast Asian destinations with proximity snow (Japan — Niseko Annupuri, Rusutsu; South Korea — High1, Yongpyong)
- **Beach:** West Africa (Dakar/Saly), Indian Ocean (Reunion Island, Mayotte), more Central American Pacific coast venues

---

## PM Observation

**S. hemisphere ski season ends this month** — all 23 venues (Argentina, Chile, NZ, Australia) will exit scoring relevance from the front page by late October. This is *correct* behavior, but worth knowing for the launch: at Oct 18, a user in Santiago or Auckland will see beach results dominate since their local ski season is ending. If there's any plan to message "ski season is winding down in the south" or surface summer alternatives for those users, it should go into the post-launch sprint backlog. Not a bug, just a user experience nuance.

---

*Peakly Content Report · 2026-10-09 · Code freeze Day 25 · 9 days to Oct 18 launch*
