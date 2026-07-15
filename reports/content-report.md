# Peakly Content & Data Report — 2026-07-15

**Data health score: 88/100** | Build: `20260714a` ✅ | Venues: **375** (133 ski / 242 beach) | Photo max repeat: 3× ✅

> Supersedes 2026-07-14. Day 15 post-launch. Engelberg `lateSeason: true` fix confirmed shipped (commit `747c35a`). **New finding: DevOps "venue-baseline drift P2" is a false positive** — the 2 extra objects bracket-walkers count are comment artifacts (`// CPT:{...}` / `// GIG:{...}`), not real venues. Baseline of 375 is correct; DevOps should NOT update to 377. Also: DevOps `poolPrimary: true = 25` is a hallucination — actual count is **0**. Queue capped at 14 per PM Decision 3; no new venues staged today.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **375 venues, 2 categories only (skiing + beach).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "197 venues have empty tag arrays" | **FALSE — all 375 venues have non-empty tags.** Confirmed July 13. |
| "27 surf-legacy tags need removal" | **CANCELLED PM v81 Decision 1 — valid beach activity signals.** |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: 13 venues" | **14 — Engelberg added July 14 (commit `747c35a`). CLAUDE.md needs 1-line update.** |
| "cancun-beach dup" | **FALSE POSITIVE — second occurrence is in PRESETS array, not VENUES. 0 dup IDs.** |
| "Alpe d'Huez / Cortina in catalog" | **Not yet — in staged queue, awaiting Jack photo approval.** |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "5 placeholder-tag venues" | **0 remaining — FIXED July 13.** Stop. |
| "engelberg missing lateSeason" | **FIXED July 14 (PM v88 Decision 2, commit `747c35a`).** Stop. |
| "poolPrimary: true = 25" | **FALSE — actual count is 0. No venue currently sets this flag. DevOps hallucinated.** |

---

## 1. Data Integrity Audit

### Venue Count (bracket-walk parser)

| Category | Count | Δ from Jul 14 |
|----------|-------|---------------|
| **Skiing** | 133 | 0 |
| **Beach** | 242 | 0 |
| **TOTAL** | **375** | 0 |

**⚠️ DevOps bracket-walker overcounts to 377 — this is a false positive.** Root cause: two JavaScript comment lines inside the VENUES array embed `{lat:...,lon:...}` syntax that naïve bracket-walkers miscount as venue objects:

```
// CPT:{lat:-33.9648,lon:18.6017} added to AIRPORT_COORDS.  ← char 202720
// GIG:{lat:-22.8100,lon:-43.2507} added to AIRPORT_COORDS. ← char 203372
```

These are comment annotations documenting when CPT/GIG were added to `AIRPORT_COORDS`. They are NOT venue records. The `.venue-baseline` file holding `375` is **correct**. DevOps should **not** update it to 377. The fix is to rewrite the two comment lines to remove the JSON-style brace syntax (e.g., `// CPT added to AIRPORT_COORDS [lat:-33.96, lon:18.60]`), which would align the bracket-walker count with reality.

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Duplicate IDs | ✅ 0 | Confirmed via exact-string ID extraction |
| Missing lat/lon | ✅ 0 | All 375 verified |
| Missing airport codes | ✅ 0 | All 375 verified |
| APs in AIRPORT_COORDS | ✅ 146/146 | Every unique venue airport code covered |
| Missing tag arrays | ✅ 0 | All 375 verified |
| Missing photos | ✅ 0 | All 375 verified |
| GEAR_ITEMS refs | ✅ 0 | Amazon cut for v1 |
| `lateSeason:true` count | ✅ **14** | Engelberg added July 14 (fixed) |
| `poolPrimary:true` count | ✅ **0** | Optional field — no venues use it yet; DevOps count of 25 was hallucinated |
| Coordinate sanity | ✅ Clean | No out-of-bounds lats/lons; no equatorial ski venues |
| Phantom comment objects | ⚠️ **2** | Comment-embedded `{lat:...}` lines cause overcount in naive parsers (not a data bug, a comment-style issue) |

### lateSeason Confirmed List (14 venues — CLAUDE.md needs +1 update)

`whistler`, `chamonix`, `mammoth`, `abasin`, `tignes`, `cervinia`, `snowbird`, `zermatt`, **`engelberg`** *(added July 14)*, `verbier`, `val-thorens`, `les-deux-alpes-fr`, `saas-fee-ch`, `st-moritz-ch`

**CLAUDE.md update needed:** The CLAUDE.md lateSeason list and count still say 13 / no mention of engelberg. One-line add. DevOps can ship this in the next cache-stamp commit.

---

## 2. Photo Audit

| Metric | Value | Target |
|--------|-------|--------|
| Total venue photos | 375 | — |
| Unique ski photos | 54 | — |
| Unique beach photos | 89 | — |
| Total unique photos | 143 | — |
| Max repeat (ski) | ✅ **3×** | ≤3× |
| Max repeat (beach) | ✅ **3×** | ≤3× |
| Photos used only once | 11 available | Headroom for new venues |

Photo health: **GREEN.** Pool is thin (2.47 venues/ski-photo, 2.72 venues/beach-photo) but repeat ceiling holds. Any new venue addition must pick from the pool of 11 singleton photos first to avoid pushing count to 4×.

---

## 3. Seasonal Relevance — July 15, 2026 (N. Hemisphere Peak Summer)

### Beach (242 venues) — PEAK SEASON

| Sub-group | Count | Status |
|-----------|-------|--------|
| N. hemisphere | 187 | 🟢 PRIME — UV 8–11, water 24–31°C, front-page priority |
| S. hemisphere | 55 | 🟡 Austral winter — most tropical venues (Maldives, Bali, Mozambique, Caribbean) are effectively year-round above 25°C; cold-water spots (Patagonia, SE Australia) correctly score low |

Beach is producing the bulk of high-scoring Explore results this weekend. No action needed.

### Skiing (133 venues) — MIXED SEASON

| Sub-group | Count | Status |
|-----------|-------|--------|
| S. hemisphere (lat < 0) | 23 | 🟢 IN SEASON — Southern Hemisphere peak winter (NZ, AUS, Chile, Argentina) |
| N. hemisphere `lateSeason:true` | 14 | 🟡 ACTIVE — glacier bypass; Saas-Fee + Zermatt + Engelberg + Val Thorens confirmed summer operations |
| N. hemisphere without `lateSeason` | 96 | 🔴 OFF-SEASON — correctly suppressed (snow_depth_max < 0.5m in July) |

**Engelberg scoring behavior restored July 14** — was previously suppressed all summer despite Titlis glacier running to 3028m year-round. Now correctly bypasses the off-season cap alongside Saas-Fee, Zermatt, and Les Deux Alpes.

**Note:** `abasin` (Colorado, 4313m) has `lateSeason:true` but typically closes by early June. It will return score 0 or low (no snow depth) naturally — no harm in the flag persisting. Not a bug.

---

## 4. New Findings

### F1 — DevOps poolPrimary Hallucination (P2 — documentation)

DevOps report (July 15) states `poolPrimary: true | ✅ 25`. Actual grep and code inspection: `poolPrimary` appears **twice** in app.jsx, both in the scoring logic at lines 5657 and 5662. **Zero venues set this flag.**

The field is defined in CLAUDE.md as optional for beach venues that skip the water-temp <18°C hard cap (e.g., resort pool venues). It was never populated in any venue object.

Impact: none on the live product — the feature works correctly when the field is absent (venues without it receive the water-temp penalty). The DevOps `25` figure is hallucinated and should be permanently added to their stop-reporting table.

### F2 — CLAUDE.md lateSeason Count / List Stale

CLAUDE.md still reads: `"Current count: 13 ... stop re-counting"` and the list omits `engelberg`. The July 14 PM v88 ship (commit `747c35a`) makes the count 14. Takes 30 seconds to fix:
- Change `13` → `14` in the count line
- Add `, engelberg` to the venue list

**DevOps: ship this in the next cache-stamp commit alongside any other pending CLAUDE.md edits.**

### F3 — Comment-Brace Syntax in VENUES Array (cosmetic, P3)

Two inline comments near chars 202720 and 203372 embed `{lat:...,lon:...}` notation that bracket-walking parsers (used by DevOps, status.sh, and Content) miscount as venue objects, inflating the count from 375 to 377. This causes the DevOps "venue-baseline drift P2" false alarm.

**Fix:** Rewrite both comment lines to remove brace syntax. Proposed rewrites:
```
// CPT added to AIRPORT_COORDS and AP_CONTINENT[africa].
// GIG added to AIRPORT_COORDS and AP_CONTINENT[latam].
```

This is cosmetic — 0 user impact, 0 scoring impact. Flagging so the DevOps false-positive loop doesn't recur. **Do not update `.venue-baseline` to 377.**

---

## 5. Daily Venue Proposals — PIPELINE ONLY (Queue Capped at 14)

**Per PM Decision 3 (July 14): no new venues staged until Jack clears the approval queue.** The 14 staged venues remain on HOLD. The proposals below are pipeline documentation only — do NOT add to `data/venue-candidates.json` until the queue drops below 5.

**Geographic gaps identified for next batch (when queue clears):**

```js
// ─── PIPELINE — do NOT paste until staged queue < 5 ─────────────────────────

  {id:"dakhla-morocco-beach", category:"beach",
    title:"Dakhla",
    location:"Dakhla, Morocco",
    lat:23.7131, lon:-15.9355, ap:"VIL",
    icon:"🏖️", rating:4.88, reviews:4100,
    gradient:"linear-gradient(160deg,#1a0a00,#3a1800,#6a3800)",
    accent:"#e8902a",
    tags:["Kitesurfing Capital","Sahara Meets Ocean","Year-Round","Uncrowded"],
    photo:"https://images.unsplash.com/photo-1518544866330-4e716499f800?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  },
  {id:"perhentian-islands-my", category:"beach",
    title:"Perhentian Islands",
    location:"Terengganu, Malaysia",
    lat:5.9069, lon:102.7461, ap:"KUL",
    icon:"🏝️", rating:4.87, reviews:8700,
    gradient:"linear-gradient(160deg,#001a10,#003a28,#006a50)",
    accent:"#20e8a0",
    tags:["Budget Paradise","Turtle Nesting","Coral Gardens","Backpacker Favourite"],
    photo:"https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.5",
  },
  {id:"alghero-sardinia-it", category:"beach",
    title:"Alghero",
    location:"Sardinia, Italy",
    lat:40.5591, lon:8.3189, ap:"AHO",
    icon:"🏖️", rating:4.82, reviews:11200,
    gradient:"linear-gradient(160deg,#001020,#002a50,#005090)",
    accent:"#50b8e8",
    tags:["Catalan Heritage","Coral Reefs","Crystal Water","Med Summer"],
    photo:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  },
  {id:"nacpan-beach-palawan", category:"beach",
    title:"Nacpan Beach",
    location:"El Nido, Palawan, Philippines",
    lat:11.2784, lon:119.4016, ap:"ENI",
    icon:"🏝️", rating:4.93, reviews:6300,
    gradient:"linear-gradient(160deg,#001818,#003838,#006860)",
    accent:"#28d8c0",
    tags:["Twin Beach","No Development","Raw Philippines","Island Hopping Base"],
    photo:"https://images.unsplash.com/photo-1518544866330-4e716499f800?w=800&h=600&fit=crop&fp-x=0.6&fp-y=0.35",
  },
  {id:"essaouira-beach-ma", category:"beach",
    title:"Essaouira",
    location:"Essaouira, Morocco",
    lat:31.5085, lon:-9.7595, ap:"ESU",
    icon:"🌊", rating:4.75, reviews:9800,
    gradient:"linear-gradient(160deg,#0a0a1a,#202050,#4040a0)",
    accent:"#8080e8",
    tags:["Windsurfing Capital","Medina Blue Walls","Cool Summers","Jimi Hendrix History"],
    photo:"https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.5",
  },

// ─── END PIPELINE ────────────────────────────────────────────────────────────
```

**Venue logic:**
- `dakhla-morocco-beach` — top kitesurfing destination, year-round wind, strong travel content; no Morocco coast coverage beyond Marrakech ski area. VIL (Dakhla) airport is valid; verify against AIRPORT_COORDS before pasting.
- `perhentian-islands-my` — budget tropical paradise with sea turtle nesting; KUL confirmed; Malaysia underrepresented vs. Bali's 5 venues.
- `alghero-sardinia-it` — NW Sardinia's underrated gem vs. overrated Sardinia town names; AHO (Alghero) airport — verify against AIRPORT_COORDS.
- `nacpan-beach-palawan` — El Nido's undeveloped twin beach; ENI confirmed in AIRPORT_COORDS; Philippines has 0 coverage currently.
- `essaouira-beach-ma` — windiest Atlantic shore, Jimi Hendrix trail; great July pick since heat drives users away from Marrakech; ESU — verify.

⚠️ **Airport check before paste:** Verify `VIL`, `AHO`, `ESU` are in `AIRPORT_COORDS` before staging. If not, add them first (lat/lon + AP_CONTINENT entry).

---

## 6. Staged Queue Status (14 venues — HOLD until Jack approves)

| Venue | Category | Queue Days | Notes |
|-------|----------|-----------|-------|
| `alpe-d-huez-fr` | ski | Day 4 | ⏰ Glacier closes late August — time-sensitive |
| `cortina-d-ampezzo` | ski | Day 4 | |
| `porter-heights-nz` | ski | Day 3 | Southern winter — in-season now |
| `pipa-beach-brazil` | beach | Day 4 | |
| `punta-mita-beach` | beach | Day 4 | |
| `sunny-beach-bg` | beach | Day 3 | |
| `sango-sands` | beach | Day 3 | |
| `tropea-beach-it` | beach | Day 3 | July = peak Calabria season |
| `koh-lanta-beach-th` | beach | Day 2 | |
| `legian-beach-bali` | beach | Day 2 | |
| `vina-del-mar-cl` | beach | Day 2 | Southern winter — check water temp |
| `virginia-beach-va` | beach | Day 1 | 4th of July window passed; still summer |
| `miyako-jima-okinawa` | beach | Day 1 | Peak Japan beach season |
| `rincon-puerto-rico` | beach | Day 1 | |

*(Amed Bali + Tofo Mozambique proposed July 14 but not yet staged — would bring queue to 16, exceeding PM cap. Holding.)*

**Jack action: ~14 minutes to clear.** Priority order: `alpe-d-huez-fr` (Aug deadline), `tropea-beach-it` (peak season now), `porter-heights-nz` (Southern winter peak).

---

## 7. Open Items

| Item | Priority | Owner | Notes |
|------|----------|-------|-------|
| CLAUDE.md lateSeason 13→14 + add engelberg to list | **P2** | DevOps | 2 lines, next cache-stamp commit |
| Rewrite comment-brace lines (phantom object fix) | **P3** | DevOps | Stops false "venue-baseline drift" alarm |
| Stop DevOps `poolPrimary:25` from recurring | **P2** | DevOps | Add to stop-reporting table — count is 0 |
| Jack photo-verify 14 staged venues | **P2** | Jack | ~14 min; alpe-d-huez has Aug deadline |
| Supabase account-deletion SQL paste | P0 (App Store) | Jack | Day 36 — 2 min paste |
| Plausible dashboard read | **P0** | Jack | Day 15 blind — needed before any next sprint |
| VPS health verify | P1 | Jack | `curl https://peakly-api.duckdns.org/health` — 5 days since Jack last checked |

---

## One Observation for the PM

**The DevOps agent has a hallucination problem with numeric field counts.** Today it reported `poolPrimary: true = 25` (actual: 0) and declared the `.venue-baseline` 2 behind (actual: correct at 375, the 2 "extras" are comment artifacts). Yesterday's lateSeason count has had persistent drift across multiple runs. These false positives consume PM triage bandwidth — the PM v88 bug table is half occupied by content or DevOps false alarms. The fix is to make the DevOps prompt *grep-and-verify* numeric counts rather than recall them; a simple `grep -c '"poolPrimary".*true'` before reporting `poolPrimary = X` would eliminate this class of error. Add it to `tasks/agents/devops.md` as a standing check.

---

*Content agent — 2026-07-15 UTC | Venues: 375 (133 ski / 242 beach) | Prior: 2026-07-14 | Score: 88/100 (+1 engelberg fix)*
