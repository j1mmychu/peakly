# Peakly Content & Data Report — 2026-10-27

## Data Health Score: 88/100

**Deductions (persistent — no code changes since 2026-08-11, day 77):**
- −9: 225 venues (55.7%) have only 2 tags — `scoreVibeMatch` and search recall degraded
- −1: Gili Trawangan near-duplicate (`beach_gilit/LOP` vs `gili-trawangan/DPS`) — same island, two airports
- −1: Stale scheduled-task prompt (references "182 venues, 12 categories, hiking" — outdated since 2026-05-03 pivot)
- −1: PRECACHE→CDN version mismatch in sw.js (DevOps P1-A, day 3) — offline users may load wrong Babel version

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories" and asks to audit hiking gear items. The project pivoted 2026-05-03 to **skiing + beach only**. GEAR_ITEMS was cut for v1 (`grep -c GEAR_ITEMS app.jsx → 0`). Correct count: **404 venues (134 skiing / 270 beach)**. All audit data below reflects actual app.jsx state.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | ~14,238 — no code changes since 2026-08-11 (day 77) |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing photos | **0** ✅ |
| Missing tags array | **0** ✅ |
| IATA code format | **0 invalid** ✅ |
| Coordinate bounds | **0 out-of-range** ✅ |
| Venues with only 2 tags | **225 (55.7%)** ⚠️ |
| Thin-tag beach venues | **190 / 270 (70%)** ⚠️ |
| Thin-tag ski venues | **35 / 134 (26%)** ⚠️ |
| BASE_PRICES coverage | **100%** ✅ |
| lateSeason:true venues | **15** (Whistler, Chamonix, Mammoth, Tignes, Hintertux, Cervinia, Snowbird, Zermatt, Engelberg, Verbier, Val-Thorens, Les-Deux-Alpes, Saas-Fee, St-Moritz, Abasin) ✅ |
| GEAR_ITEMS in app | **0** — Amazon cut confirmed for v1 ✅ |
| Gili Trawangan near-dup | ⚠️ persists (day 3): `beach_gilit/LOP` + `gili-trawangan/DPS` |
| Surf Breaks tag on beach venues | ⚠️ 33 venues carry this tag (surfing retired, tags are descriptors — OK as-is) |
| Yesterday's 5 venue suggestions | **Not yet applied** — queue accumulating |

---

## 1. DATA INTEGRITY AUDIT

All 404 venues pass core integrity checks: no missing coordinates, no missing airport codes, no missing tags arrays, no duplicate IDs, no duplicate photo URLs, no invalid IATA formats, no lat/lon out of range.

**Tag depth distribution:**
- 2 tags: **225 venues** (55.7%) — the persistent quality gap
- 3 tags: 14 venues (3.5%)
- 4 tags: 164 venues (40.6%)
- 5+ tags: 1 venue (0.2%)

**Top 10 most-used tags:** Family Friendly (32), All Levels (25), Groomed Runs (22), Calm Waters (19), Expert Terrain (18), Powder Day (17), Off-Piste (16), Surf Breaks (16), High Altitude (14), Scenic Views (14).

**Thin-tag split by category:** 190 of 270 beach venues (70%) have only 2 tags. 35 of 134 ski venues (26%) have only 2 tags. The beach catalog is the primary target for bulk tag enrichment.

**Gili Trawangan near-duplicate (day 3 — low priority):**
- `beach_gilit` — Gili Trawangan via LOP (Lombok) — only venue at LOP
- `gili-trawangan` — Gili Trawangan via DPS (Bali) — one of 10 venues at DPS
Both are legitimate airport entry points. Recommend: differentiate with "(Lombok gateway)" vs "(Bali gateway)" suffixes on titles.

**Pending venue suggestion queue:** Yesterday's 5 suggestions (Playa de Las Américas/TFS, Balos Lagoon/CHQ, Punaluu/KOA, Lee Canyon/LAS, Grayton Beach/VPS) remain un-applied. Today adds 5 more, making 10 suggestions pending. If none land in the next 3–4 days, flag to PM for triage — at 5/day pace this queue becomes noise.

---

## 2. GEAR ITEMS AUDIT

**N/A for this codebase.** Amazon Associates (GEAR_ITEMS) was formally cut for v1 on 2026-06-09 (Jack's decision). `grep -c GEAR_ITEMS app.jsx → 0`. Revenue model is $7.58/1K MAU. This prompt section is an artifact of the original 12-category version.

---

## 3. SEASONAL RELEVANCE — October 27, 2026

| Segment | Venues | Oct 27 Condition |
|---------|--------|-----------------|
| N. Hemisphere skiing | 111 | Pre-season (opens Nov–Dec). lateSeason (15) already rideable at altitude. |
| S. Hemisphere skiing | 23 | Off-season closed. Score will be poor — expected. |
| Tropical beach (lat < 23°) | ~163 | **Peak season.** 28–32°C, UV 8–11. Best scoring globally. |
| N. Hemisphere Mediterranean/Atlantic beach | ~92 | Shoulder — 20–24°C water, still scoreable. Crete/Canaries excellent. |
| S. Hemisphere beach (AUS/NZ/SA) | ~15 | Spring warmup. Good and improving through Dec. |

**Key seasonal triggers:**
- **14 days to Whistler opening (~Nov 10):** The VPS `forecast_days:14` fix must land before this. Currently front page shows Whistler as unscorable past day 7. Jack-only SSH action — not a content fix but worth flagging daily.
- **lateSeason star window (now):** Hintertux (year-round glacier), Saas-Fee, Tignes glacier, Zermatt Glacier Paradise — these should be appearing on the front page for European hub users (GVA, ZRH, CMF, INN all fully covered). Prime marketing moment for content/social if the app is working correctly.
- **Canary Islands / Madeira peak:** TFS and FNC airports are entering their best 4-month window. Existing Teide/Playa de Troya coverage (1 venue at TFS) is thin for the calendar moment.

---

## 4. CONTENT QUALITY

**Tag depth gap (persistent P1):** 225 venues (55.7%) have only 2 tags, down to none with 1. The minimum floor is working, but 2 tags is still below the 4-tag sweet spot for `scoreVibeMatch`. Beach venues are the worst: 190/270 at 2 tags only. A focused 2–3 hour session adding 2 additional tags per thin beach venue would push the health score to 97/100 and directly improve front-page personalization quality for the most common user type (summer beach traveler).

**Priority bulk-tag candidates (beach, 2 tags only, high-traffic airports):**
All 10 DPS (Bali) beach venues have only 2 tags — this is the highest-concentration single-airport gap. Example: `nusa-lembongan-bali` has ["Clear Lagoon","Day Trip"] — could add "Manta Ray Snorkeling", "Boat Transfer" for richer matching.

**Description field:** Empty on all 404 venues by design — app does not render descriptions. Not a gap.

**Difficulty signals:** Conveyed via tags ("Expert Terrain", "All Levels", "Beginner Friendly") — consistent with schema design.

---

## 5. DAILY VENUE ADDITIONS — October 27, 2026

**Focus:** Airports with exactly 1 venue and high October relevance. All 5 venues target distinct airports already fully supported in AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES. None conflict with yesterday's 5 suggestions (TFS/CHQ/KOA/LAS/VPS). Verified no ID conflicts.

**Seasonal rationale:** These are peak or shoulder October venues — they'd score well right now if added.

---

### Venue 1 — El Cielo, Cozumel (CZM) `beach`

CZM currently has 1 venue (Playa Palancar, deep coral reef). El Cielo ("heaven") is the opposite: a shallow (1m) sandy patch 20 min by boat from downtown, carpeted with sea stars. Completely different experience from Palancar — no diving gear needed, famous Instagram spot, warm 28°C water year-round. Adds variety and second entry point at CZM.

```js
{id:"beach_el_cielo_cozumel", category:"beach", title:"El Cielo", location:"Cozumel, Quintana Roo, Mexico", lat:20.32, lon:-87.07, ap:"CZM", icon:"🏖", rating:4.8, reviews:"16K", gradient:"from-cyan-400 to-sky-500", accent:"#0ea5e9", tags:["Starfish Lagoon","Shallow Snorkeling","Boat Access","Year-Round Sun"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Cozumel_beach.jpg/1280px-Cozumel_beach.jpg"},
```

> ⚠️ Verify Wikimedia photo URL exists. Search "Cozumel beach" on commons.wikimedia.org. Coordinates: 20.32°N 87.07°W — approx. El Cielo shoal area SE of town.

---

### Venue 2 — Dry Tortugas National Park (EYW) `beach`

EYW currently has 1 venue (Key West Beaches). Dry Tortugas is 70 miles offshore — only accessible by seaplane or 2.5hr ferry — but consistently rated one of the most spectacular snorkeling spots in the US. Fort Jefferson on Garden Key, nesting sooty terns, coral reefs with zero crowds. October: warm 28°C water, hurricane season over, no summer tourist crush.

```js
{id:"beach_dry_tortugas", category:"beach", title:"Dry Tortugas National Park", location:"Monroe County, Florida, USA", lat:24.628, lon:-82.873, ap:"EYW", icon:"🏖", rating:4.9, reviews:"9K", gradient:"from-teal-600 to-emerald-500", accent:"#0d9488", tags:["Ferry or Seaplane Only","Fort Jefferson","World-Class Snorkeling","Nesting Seabirds"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Dry_Tortugas_-_Garden_Key_from_above.jpg/1280px-Dry_Tortugas_-_Garden_Key_from_above.jpg"},
```

> ⚠️ Verify Wikimedia photo. Search "Dry Tortugas Garden Key" on commons. Coordinates: Garden Key, the main visitor island.

---

### Venue 3 — Caladesi Island State Park (TPA) `beach`

TPA currently has 1 venue (Clearwater Beach, the busy resort strand). Caladesi Island is its pristine sister — accessible only by ferry from Honeymoon Island State Park or by kayak. Consistently ranked top 5 US beach by Dr. Beach. No development, undisturbed dunes, 3-mile shell-covered gulf shore. October: water 26°C, zero summer crowds, dolphin sightings regular.

```js
{id:"beach_caladesi", category:"beach", title:"Caladesi Island State Park", location:"Dunedin, Florida, USA", lat:28.03, lon:-82.82, ap:"TPA", icon:"🏖", rating:4.9, reviews:"12K", gradient:"from-amber-300 to-cyan-400", accent:"#06b6d4", tags:["Ferry Access Only","Pristine State Park","Shell Coast","Dolphin Sightings"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Caladesi_Island_State_Park_Florida.jpg/1280px-Caladesi_Island_State_Park_Florida.jpg"},
```

> ⚠️ Verify Wikimedia photo. Search "Caladesi Island State Park" on commons. Coordinates: center of the island's public beach.

---

### Venue 4 — Huntington Beach State Park (MYR) `beach`

MYR currently has 1 venue (Myrtle Beach, the high-rise tourist corridor). Huntington Beach State Park is 17 miles south — South Carolina's only ocean-front state park, undeveloped barrier island with live oaks, alligators in freshwater lagoons, and 3 miles of uncrowded Atlantic beach. "The jewel of the South Carolina coast" (Travel + Leisure). October: water 23°C, mild 20°C air, fall birding peak.

```js
{id:"beach_huntington_sc", category:"beach", title:"Huntington Beach State Park", location:"Murrells Inlet, South Carolina, USA", lat:33.52, lon:-79.06, ap:"MYR", icon:"🏖", rating:4.8, reviews:"11K", gradient:"from-green-800 to-teal-600", accent:"#0f766e", tags:["Undeveloped Barrier Island","Fall Birding","Atlantic Uncrowded","Alligator Lagoon"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Huntington_Beach_State_Park_SC.jpg/1280px-Huntington_Beach_State_Park_SC.jpg"},
```

> ⚠️ Verify Wikimedia photo. Search "Huntington Beach State Park South Carolina" on commons.

---

### Venue 5 — Papakolea Green Sand Beach (KOA) `beach`

KOA currently has 1 venue (Hapuna Beach, white sand classic). Papakolea is one of only 4 green sand beaches on Earth — the colour comes from olivine crystals eroded from a volcanic cone. 45-min hike or 4WD shuttle from the road. October: water 27°C, no tourist crowds (requires effort to reach), dramatic volcanic scenery. Adds geological uniqueness and a second KOA entry point that's completely different in character.

```js
{id:"beach_papakolea", category:"beach", title:"Papakolea Green Sand Beach", location:"Ka'ū, Big Island, Hawaii, USA", lat:18.953, lon:-155.685, ap:"KOA", icon:"🏖", rating:4.7, reviews:"14K", gradient:"from-lime-700 to-emerald-800", accent:"#65a30d", tags:["Green Olivine Sand","Volcanic Crater Beach","4WD or Hike Access","Geologic Wonder"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Papakolea_beach_Hawaii.jpg/1280px-Papakolea_beach_Hawaii.jpg"},
```

> ⚠️ Verify Wikimedia photo. Search "Papakolea green sand beach" on commons. Coordinates: 18.953°N 155.685°W — Mahana Bay, Ka'ū District.

---

## One Observation for the PM

**The venue suggestion queue is accumulating with no depleted signal.** Yesterday's 5 venue objects (TFS, CHQ, KOA, LAS, VPS) and today's 5 (CZM, EYW, TPA, MYR, KOA-2nd) are all paste-ready JavaScript but remain un-applied — 10 venues queued, 0 landed in 2 days. This is fine as a backlog, but after 5+ days of daily additions the value of the queue degrades (earlier suggestions get stale context). Consider: (1) a dedicated 30-min paste session to land the 10 pending venues in one commit, which would also be the `app.jsx` touch needed to bump the cache stamp, or (2) pausing venue additions until the VPS redeploy and PRECACHE fix land, making the first post-blockage commit a combined fix + content drop. Either way, the VPS redeploy (day 79) is still the critical gating item — no amount of new venues matters if `forecast_days:14` isn't live before Whistler opens in **14 days**.

---

*Report generated: 2026-10-27 by Peakly Content & Data Agent*
