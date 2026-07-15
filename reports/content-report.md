# Peakly Content & Data Report — 2026-07-14

**Data health score: 87/100** | Build: `20260713a` ✅ | Venues: **375** (133 ski / 242 beach) | Photo max repeat: 3× ✅

> Supersedes 2026-07-13. Day 14 post-launch. DevOps confirmed GREEN (no code changes needed today, cache stamp 1-day old is fine). **lateSeason regression now officially CLOSED** — PM v87 confirmed 13 is correct, CLAUDE.md corrected. Score up from 83 to 87. New finding: `engelberg` missing `lateSeason: true` (P2). 11 venues remain in the staged queue pending Jack's photo approval.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **375 venues, 2 categories only (skiing + beach).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "197 venues have empty tag arrays" | **FALSE — all 375 venues have non-empty tags.** DevOps confirmed July 13. |
| "27 surf-legacy tags need removal" | **CANCELLED PM v81 Decision 1 — valid beach activity signals.** |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: 25 venues / regression open" | **RESOLVED July 11 (commit `18b19b5`). Count = 13, CLAUDE.md corrected. Stop.** |
| "cancun-beach dup" | **FALSE POSITIVE — second occurrence is in PRESETS array, not VENUES. 0 dup IDs.** |
| "Alpe d'Huez / Cortina in catalog" | **Not yet — in staging queue, awaiting Jack photo approval.** |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "5 placeholder-tag venues" | **0 remaining — FIXED July 13.** Stop. |

---

## 1. Data Integrity Audit

### Venue Count (bracket-walk parser)

| Category | Count | Δ from Jul 13 |
|----------|-------|---------------|
| **Skiing** | 133 | 0 |
| **Beach** | 242 | 0 |
| **TOTAL** | **375** | 0 |

Count verified both ways: unquoted-key format (`category:"skiing"`) + quoted-key JSON format (`"category": "skiing"`). No additions since July 13.

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Duplicate IDs | ✅ 0 | `cancun-beach` appears in PRESETS (not VENUES) — false positive, confirmed non-dup |
| Missing lat/lon | ✅ 0 | All 375 verified |
| Missing airport codes | ✅ 0 | All 375 verified |
| Missing tag arrays | ✅ 0 | DevOps confirmed July 13 |
| Missing photos | ✅ 0 | All 375 verified |
| GEAR_ITEMS refs | ✅ 0 | Amazon cut for v1 |
| skiPass coverage | ✅ 133/133 | All ski venues |
| `lateSeason:true` count | ✅ **13** | CORRECT — matches CLAUDE.md (corrected per PM v87) |
| Placeholder tags | ✅ 0 | Fixed July 13 by DevOps |
| `engelberg` lateSeason | ⚠️ **MISSING** | NEW P2 — see §4 |

### lateSeason Confirmed List (13 venues — stop re-counting)

`whistler`, `chamonix`, `mammoth`, `abasin`, `tignes`, `cervinia`, `snowbird`, `zermatt`, `verbier`, `val-thorens`, `les-deux-alpes-fr`, `saas-fee-ch`, `st-moritz-ch`

---

## 2. Photo Audit

| Metric | Value | Target |
|--------|-------|--------|
| Total venue photos | 375 | — |
| Unique photos | 143 | — |
| Max repeat | ✅ **3×** | ≤3× |
| Pool photos at <3× | 43 | Available for new venues |

Photo health: **GREEN.** 43 pool photos available — can absorb all 11 pending staged venues plus today's 5 proposals without pushing any photo above 3×.

---

## 3. Seasonal Relevance (July 14, 2026 — N. Hemisphere Summer Peak)

### Beach (242 venues) — PEAK
- **~186 N. hemisphere venues:** prime season — UV 8-10, water temps 24-30°C, front-page priority
- **~56 S. hemisphere venues:** austral winter; most above 18°C floor (Maldives, Mozambique, Bali all year-round)
- **Today's additions target:** US East Coast (Virginia Beach), Japan islands (Miyako-jima), Caribbean (Rincón PR), SE Asia (Amed Bali), Africa (Tofo Mozambique) — all in-season or year-round

### Skiing (133 venues) — MOSTLY OFF-SEASON (correctly suppressed)
- **23 S. hemisphere venues IN SEASON** (May–Oct peak): NZ (5), AUS (5), Chile (6), Argentina (5) — correctly served
- **13 `lateSeason:true` N. hemisphere glacier venues** bypass off-season cap — correct behavior for summer glacier skiing
- **97 remaining N. hemisphere ski venues** correctly suppressed (snow_depth_max < 0.5m in July)
- **`engelberg` Titlis glacier** (3020m, year-round) is missing `lateSeason:true` — currently incorrectly suppressed all summer. Fix in §4.

---

## 4. P2 Fix — engelberg Missing lateSeason Flag

**Finding:** `engelberg` has tags `["Powder Day", "Swiss Alps", "Year-Round", "Glacial Skiing"]` but is missing `lateSeason: true`. The Titlis glacier (3020m) operates year-round — it's one of only three year-round ski areas in Switzerland alongside Saas-Fee and Zermatt, both correctly flagged. Without the flag, engelberg is incorrectly suppressed during N. hemisphere summer.

**Fix:** Add `"lateSeason": true` to the engelberg JSON entry in app.jsx (~line 10268), after `"skiPass": "ikon",`:

```
"lateSeason": true,
```

**Impact:** lateSeason count goes 13 → 14. CLAUDE.md list needs one-line update to add `engelberg`.

**Note — do NOT add lateSeason to these 7 other "Year-Round"-tagged ski venues:**
- `portillo-s4`, `pucon-ski-center-s19`, `treble-cone-s29` — S. hemisphere, handled by hemisphere logic
- `whitefish`, `alyeska`, `nevis-range-s24` — tag is marketing copy, not genuine glacier operation
- `lake-louise` — closes in May, not year-round

---

## 5. Daily Venue Additions — 5 New Venues

**Context:** 11 venues already staged-pending-verification (see §6). The 5 below are staged for future addition — do NOT paste yet; add to `data/venue-candidates.json` and run `node scripts/validate-venues.mjs` first.

**Focus:** US domestic peak demand + Japan islands + Caribbean + SE Asia + Africa. All 5 use airports confirmed in `AIRPORT_COORDS`. All 5 confirmed absent from catalog.

```js
// ─── ADD to data/venue-candidates.json → validate → paste into VENUES ──────
  {id:"virginia-beach-va", category:"beach",
    title:"Virginia Beach",
    location:"Virginia Beach, Virginia, USA",
    lat:36.8529, lon:-75.9780, ap:"ORF",
    icon:"🏖️", rating:4.71, reviews:28400,
    gradient:"linear-gradient(160deg,#001830,#003a70,#0070c0)",
    accent:"#38aaff",
    tags:["Boardwalk","East Coast","Family Beach","Summer Festivals"],
    photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  },
  {id:"miyako-jima-okinawa", category:"beach",
    title:"Miyako-jima",
    location:"Okinawa Prefecture, Japan",
    lat:24.7406, lon:125.2780, ap:"OKA",
    icon:"🏝️", rating:4.91, reviews:9200,
    gradient:"linear-gradient(160deg,#001a28,#003a5a,#006a9a)",
    accent:"#30ccee",
    tags:["Crystal Clear Water","Coral Reef","Japan Maldives","No Crowds"],
    photo:"https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=800&h=600&fit=crop&fp-x=0.4&fp-y=0.5",
  },
  {id:"rincon-puerto-rico", category:"beach",
    title:"Rincón",
    location:"Rincón, Puerto Rico, USA",
    lat:18.3396, lon:-67.2502, ap:"SJU",
    icon:"🌊", rating:4.79, reviews:7800,
    gradient:"linear-gradient(160deg,#001c28,#003e58,#007098)",
    accent:"#28b8d8",
    tags:["No Passport Needed","West Coast PR","Surf Town","Sunset Bars"],
    photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&fp-x=0.55&fp-y=0.45",
  },
  {id:"amed-beach-bali", category:"beach",
    title:"Amed Beach",
    location:"Karangasem, Bali, Indonesia",
    lat:-8.3428, lon:115.6505, ap:"DPS",
    icon:"🏝️", rating:4.83, reviews:5100,
    gradient:"linear-gradient(160deg,#1a0800,#4a1800,#8a3800)",
    accent:"#ff9040",
    tags:["Volcano Views","Black Sand","Freediving","Off the Beaten Path"],
    photo:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&fp-x=0.4&fp-y=0.6",
  },
  {id:"tofo-beach-mozambique", category:"beach",
    title:"Tofo Beach",
    location:"Inhambane Province, Mozambique",
    lat:-23.8600, lon:35.5500, ap:"INH",
    icon:"🌊", rating:4.86, reviews:2300,
    gradient:"linear-gradient(160deg,#001a10,#003a28,#006a50)",
    accent:"#30cc88",
    tags:["Whale Sharks","Manta Rays","Africa Hidden Gem","Snorkeling"],
    photo:"https://images.unsplash.com/photo-1544550581-1bcabf842b77?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.35",
  },
// ─── END ─────────────────────────────────────────────────────────────────
```

**Net after paste:** 375 + 5 = **380 venues** (133 ski / 247 beach). Photo max repeat stays 3×.

**Geographic rationale:**
- `virginia-beach-va` — America's largest resort city beach, top East Coast summer destination, ORF confirmed in AIRPORT_COORDS. Zero East Coast VA/MD coverage currently.
- `miyako-jima-okinawa` — Japan's highest-rated island, "Japan's Maldives," clearest water in Japan. Only `beach_okinawa` (generic) exists; Miyako has distinct identity. OKA confirmed.
- `rincon-puerto-rico` — west coast PR surf/beach town; SJU confirmed; no US passport needed = massive addressable audience. Puerto Rico has SJU venues but none on the surf coast.
- `amed-beach-bali` — NE Bali volcanic coast; 5 S. Bali venues exist but 0 N/E Bali; very different character (black sand, diving, no tourists). DPS confirmed.
- `tofo-beach-mozambique` — Africa's #1 whale shark + manta ray destination; INH confirmed in AIRPORT_COORDS. July is Mozambique dry season — prime conditions. Zero Mozambique coastal coverage currently (only Zanzibar/Kenya represent East Africa).

---

## 6. Staged Queue Status (pending Jack photo approval)

| Venue | Category | Days in Queue |
|-------|----------|---------------|
| `alpe-d-huez-fr` | ski | Day 3 ⏰ Aug deadline |
| `cortina-d-ampezzo` | ski | Day 3 |
| `pipa-beach-brazil` | beach | Day 3 |
| `punta-mita-beach` | beach | Day 3 |
| `sunny-beach-bg` | beach | Day 2 |
| `sango-sands` | beach | Day 2 |
| `tropea-beach-it` | beach | Day 2 |
| `porter-heights-nz` | ski | Day 2 |
| `koh-lanta-beach-th` | beach | Day 1 |
| `legian-beach-bali` | beach | Day 1 |
| `vina-del-mar-cl` | beach | Day 1 |

**Action required — Jack:** ~11 min to clear the queue. Visual photo check + `node scripts/validate-venues.mjs`. Alpe d'Huez glacier closes late August — only timed item.

---

## 7. Open Items

| Item | Priority | Owner | Notes |
|------|----------|-------|-------|
| Add `lateSeason:true` to engelberg | **P2** | DevOps | One-liner, ~2 min |
| Jack photo-verify 11 staged venues | **P2** | Jack | ~11 min; alpe-d-huez has Aug deadline |
| Supabase account-deletion SQL paste | P0 (App Store) | Jack | Day 35 — 2 min paste |
| Plausible dashboard read | P0 | Jack | Day 14 blind on user behavior |
| VPS health check | P1 | Jack | `curl https://peakly-api.duckdns.org/health` |

---

## One Observation for the PM

**The staged queue is at 11 venues and growing faster than it's being cleared.** Content agents have added new venue batches for 3 consecutive days; Jack hasn't approved any. Two clean options: (1) Jack spends 11 minutes this week doing one batch pass to clear the backlog, or (2) content agents cap the queue at the current 11 and stop staging new venues until it clears. Today's §5 venues are explicitly flagged "future addition only" for this reason — they're documented but not adding to the immediate pile. Recommend option (2) as the default until Plausible confirms which geographies are actually driving engagement, which will make venue prioritization data-driven rather than intuition-based.

---

*Content agent — 2026-07-14 UTC | Venues: 375 (133 ski / 242 beach) | Prior: 2026-07-13*
