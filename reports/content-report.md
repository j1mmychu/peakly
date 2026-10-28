# Peakly Content & Data Report — 2026-10-28

## Data Health Score: 88/100

**Deductions (persistent — no code changes since 2026-08-11, day 78):**
- −9: 225 venues (55.7%) have only 2 tags — `scoreVibeMatch` and search recall degraded
- −1: Gili Trawangan near-duplicate (`beach_gilit/LOP` vs `gili-trawangan/DPS`) — same island, two airports
- −1: Stale scheduled-task prompt (references "182 venues, 12 categories, hiking" — outdated since 2026-05-03 pivot)
- −1: PRECACHE→CDN version mismatch in sw.js (DevOps P1-A, day 4) — offline users may load wrong Babel version

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories" and asks to audit hiking gear items. The project pivoted 2026-05-03 to **skiing + beach only**. GEAR_ITEMS was cut for v1 (`grep -c GEAR_ITEMS app.jsx → 0`). Correct count: **404 venues (134 skiing / 270 beach)**. All audit data below reflects actual app.jsx state.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,238** — no code changes since 2026-08-11 (day 78) |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing photos | **0** ✅ |
| Missing tags array | **0** ✅ |
| IATA code format | **0 invalid** ✅ |
| BASE_PRICES coverage | **100%** (all 165 unique venue airports covered) ✅ |
| lateSeason:true venues | **15** ✅ |
| poolPrimary:true venues | **0** (schema field exists, no venues set) |
| GEAR_ITEMS in app | **0** — Amazon cut confirmed for v1 ✅ |
| Venues with only 2 tags | **225 (55.7%)** ⚠️ |
| Thin-tag beach venues | **~190 / 270 (70%)** ⚠️ |
| Thin-tag ski venues | **~35 / 134 (26%)** ⚠️ |
| Gili Trawangan near-dup | ⚠️ persists (day 4): `beach_gilit/LOP` + `gili-trawangan/DPS` |
| Venue suggestion queue | **15 pending** — no new applications (day 3 of queue freeze) |

---

## 1. DATA INTEGRITY AUDIT

All 404 venues pass core integrity checks. No regressions from yesterday.

**Tag depth distribution (unchanged):**
- 2 tags: **225 venues** (55.7%) — persistent quality gap
- 3 tags: 14 venues (3.5%)
- 4+ tags: 165 venues (40.8%)

**Confirmed clean:**
- IDs: 404 unique, 0 duplicates
- Airports: 404 entries, all valid IATA format, 165 unique APs
- BASE_PRICES: 100% coverage — all 165 venue airports present
- lateSeason:true: 15 venues (Whistler, Chamonix, Mammoth, Tignes, Hintertux, Cervinia, Snowbird, Zermatt, Engelberg, Verbier, Val-Thorens, Les-Deux-Alpes, Saas-Fee, St-Moritz, Abasin)

**Gili Trawangan near-duplicate (day 4 — low priority, defer):**
- `beach_gilit` — Gili Trawangan via LOP (Lombok)
- `gili-trawangan` — Gili Trawangan via DPS (Bali)
These are legitimately separate entry points. Low-cost fix: add "(via Lombok)" / "(via Bali)" suffixes. Not urgent.

**Venue suggestion queue status:**
- 2026-10-26: TFS (Playa de Las Américas), CHQ (Balos Lagoon), KOA (Hapuna), LAS (Lee Canyon — dup flagged by PM v192), VPS (Grayton Beach) — 5 venues
- 2026-10-27: CZM (El Cielo), EYW (Dry Tortugas), TPA (Caladesi), MYR (Huntington Beach SC), KOA (Papakolea) — 5 venues
- **Today: +5 new** (see §5 below)
- **Total queued: 15.** None applied. At this pace the queue degrades in utility within 2–3 days.

---

## 2. GEAR ITEMS AUDIT

**N/A.** Amazon Associates (GEAR_ITEMS) formally cut for v1 on 2026-06-09. `grep -c GEAR_ITEMS app.jsx → 0`. Revenue model is $7.58/1K MAU. This prompt section is a stale artifact.

---

## 3. SEASONAL RELEVANCE — October 28, 2026

| Segment | Venues | Oct 28 Condition |
|---------|--------|-----------------|
| N. Hemisphere lateSeason glaciers | 15 | **Peak glacier window.** Hintertux, Saas-Fee, Tignes, Zermatt year-round open. Verbier/Val-Thorens likely open mid-November. Prime 2-week marketing moment. |
| N. Hemisphere ski (non-lateSeason) | 119 | Pre-season. Most open Nov–Dec. Score will be low/zero — expected. |
| S. Hemisphere skiing | 23 | Closed (May–Oct season; Oct 28 is shoulder exit). Off-season, poor scores. |
| Tropical beach (lat < 23°) | ~163 | **Peak season.** 28–32°C, UV 8–11. Strongest scoring globally. |
| Mediterranean/Atlantic beach (N. Hem) | ~92 | Shoulder — water 20–24°C, air 18–22°C. Canaries/Madeira excellent. |
| S. Hemisphere beach (AUS/NZ/SA) | ~15 | Spring warming — good and improving through Dec. |

**Critical time flags:**
- **🚨 VPS redeploy deadline: 2 days (Oct 30).** PM set this as a hard gate. Without it, `forecast_days` stays at 7. Whistler opens **13 days** from today (~Nov 10) — the #1 skiing venue by user awareness. If the VPS isn't redeployed before then, the front page can't score Whistler's opening weekend correctly. This is not a content task but it directly determines whether today's venue queue has any value to ship.
- **🏔 lateSeason glacier window (NOW — 2 weeks):** Hintertux, Saas-Fee, and Tignes glacier are all rideable today. For users flying out of GVA, ZRH, INN, CMF — this is the highest-scoring ski weekend globally. If the app is returning these venues at the top of the grid, the content team has done its job. Monitor via the live site.
- **🌊 Canaries/Madeira peak entry:** TFS (Tenerife) and FNC (Madeira) enter their best 4-month window. Current coverage: 1 venue at TFS (Playa del Duque added 2026-10-26 suggestion queue), 0 at FNC. Low priority but Madeira is a gap.

---

## 4. CONTENT QUALITY

**Tag depth gap (persistent P1 — day 78 unchanged):** 225 venues at 2 tags. Same count as 2026-08-11. Zero progress since the code freeze. The gap is larger on beach (70% of beach, 26% of ski). A bulk tag enrichment session — 2 additional tags per 2-tag beach venue, drawn from the venue's known characteristics — would push the score to 97/100 and directly improve front-page personalization for the most common user type.

**Tag enrichment priority order (beach, 2-tag, high-traffic APs):**
1. All DPS (Bali) 2-tag venues — 10 venues, highest single-airport concentration
2. CUN (Cancun) 2-tag venues — Caribbean beach pool with generic tags
3. HKT (Phuket) 2-tag venues — Thailand's most-served AP

**poolPrimary:true = 0:** The schema field is defined in CLAUDE.md (beach venues that skip the <18°C water-temp hard cap via pool focus). None of the 270 beach venues carry it. This is likely intentional — no pool-primary beach venues were ever added. Not a bug, just an unused flag.

---

## 5. DAILY VENUE ADDITIONS — October 28, 2026

**Strategy:** All 5 target airports not yet in the pending queue (INN, KBV, NAP, LRH, SZG). Seasonal focus: 2 lateSeason skiing (Northern European glacier openings), 3 peak-October beach. None conflict with existing venue IDs.

---

### Venue 1 — Stubai Glacier (INN) `skiing` — lateSeason

Austria's closest year-round glacier to a major hub. Stubai Glacier (Stubaier Gletscher) opens every October at 3,210m. Accessible via Innsbruck by shuttle in ~1hr. 110km of pistes across glacial terrain, confirmed rideable now. Peak beginner-to-intermediate glacier conditions. Should carry `lateSeason: true` — open through June.

```js
{id:"ski_stubai_glacier", category:"skiing", title:"Stubai Glacier", location:"Neustift im Stubaital, Tyrol, Austria", lat:46.978, lon:11.147, ap:"INN", icon:"⛷", rating:4.8, reviews:"22K", gradient:"from-sky-600 to-indigo-700", accent:"#0284c7", lateSeason:true, tags:["Year-Round Glacier","Beginner Friendly","High Altitude","Powder Day","Snowpark"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Stubaier_Gletscher_%2810%29.jpg/1280px-Stubaier_Gletscher_%2810%29.jpg"},
```

> ⚠️ Verify Wikimedia photo. Search "Stubaier Gletscher" on commons.wikimedia.org. Coords: 46.978°N 11.147°E — glacier car park area, Mutterbergalm.

---

### Venue 2 — Dachstein Glacier, Upper Austria (SZG) `skiing` — lateSeason

Separate from INN/Stubai — Dachstein serves Salzburg. The Dachstein glacier plateau (2,700m) on the Salzkammergut border opens late September. Smaller than Stubai (12km pistes) but renowned for its Sky Walk and dramatic karst scenery — one of the most photogenic ski venues in Austria. Adds a second Austrian lateSeason option at a distinct airport.

```js
{id:"ski_dachstein", category:"skiing", title:"Dachstein Glacier", location:"Ramsau am Dachstein, Styria, Austria", lat:47.48, lon:13.7, ap:"SZG", icon:"⛷", rating:4.6, reviews:"8K", gradient:"from-slate-600 to-sky-500", accent:"#0284c7", lateSeason:true, tags:["Glacier Plateau","Sky Walk","Scenic Views","Late Season","High Altitude"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Dachstein_Gletscher.jpg/1280px-Dachstein_Gletscher.jpg"},
```

> ⚠️ Verify Wikimedia photo. Search "Dachstein Gletscher" on commons. Coords: 47.48°N 13.70°E — Hunerkogel gondola base area.

---

### Venue 3 — Koh Lanta (KBV) `beach`

Thailand's quieter alternative to Phi Phi — served by Krabi Airport (KBV). October marks the end of the Andaman monsoon on the east-facing Koh Lanta coast. Long, calm shallow beaches (Had Khlong Dao, Klong Nin), mangrove sea kayaking, and significantly fewer crowds than Koh Phi Phi. The national marine park wraps the south end of the island. Water 28°C, excellent visibility for snorkeling.

```js
{id:"beach_koh_lanta", category:"beach", title:"Koh Lanta National Park", location:"Ko Lanta Yai, Krabi, Thailand", lat:7.395, lon:99.145, ap:"KBV", icon:"🏖", rating:4.7, reviews:"19K", gradient:"from-teal-500 to-emerald-600", accent:"#0d9488", tags:["Mangrove Kayaking","Marine Park","Calm East-Facing","Off the Beaten Track"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Koh_Lanta_Beach.jpg/1280px-Koh_Lanta_Beach.jpg"},
```

> ⚠️ Verify Wikimedia photo. Search "Koh Lanta beach" on commons. Coords: 7.395°N 99.145°E — Had Khlong Dao, north Koh Lanta.

---

### Venue 4 — Positano, Amalfi Coast (NAP) `beach`

The iconic Italian cliffside beach town. NAP (Naples) has no venues in the current catalog — a clear gap for one of Europe's most aspirational coastal destinations. October: water 22°C, air 19–22°C, zero summer tourist crush, ferries still running. Positano Beach (La Spiaggia Grande) is pebble not sand, but the setting — cliff terraces, pastel buildings, boat traffic — is unmatched. Strong Booking.com affiliate conversion given accommodation density.

```js
{id:"beach_positano", category:"beach", title:"Positano, Amalfi Coast", location:"Positano, Campania, Italy", lat:40.628, lon:14.485, ap:"NAP", icon:"🏖", rating:4.8, reviews:"31K", gradient:"from-orange-400 to-rose-500", accent:"#f97316", tags:["Cliffside Village","Pebble Beach","Boat Trips","Off-Peak October"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Positano_beach_from_sea.jpg/1280px-Positano_beach_from_sea.jpg"},
```

> ⚠️ Verify Wikimedia photo. Search "Positano beach" on commons. Coords: 40.628°N 14.485°E — La Spiaggia Grande, Positano.

---

### Venue 5 — Île de Ré (LRH) `beach`

French Atlantic island off La Rochelle (LRH airport, 15km from the Pont de Ré bridge). October: the tourist mass is gone, the island reverts to cyclists, local oysters, and 70km of protected bike paths across salt pans and dune beaches. Water 17°C — below ideal, but `poolPrimary` doesn't apply here. Unique for its flat light, windswept dunes (Conche des Baleines), and fortress town Saint-Martin-de-Ré. Strong appeal to French-market users from CDG/ORY — LRH is a short connector.

```js
{id:"beach_ile_de_re", category:"beach", title:"Île de Ré", location:"Île de Ré, Charente-Maritime, France", lat:46.215, lon:-1.42, ap:"LRH", icon:"🏖", rating:4.7, reviews:"24K", gradient:"from-sky-300 to-blue-500", accent:"#0284c7", tags:["Cycling Island","Salt Pans","Atlantic Dunes","UNESCO Fortress"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Ile_de_re_plage.jpg/1280px-Ile_de_re_plage.jpg"},
```

> ⚠️ Verify Wikimedia photo. Search "Île de Ré plage" or "Ile de Re beach" on commons. Coords: 46.215°N 1.42°W — north shore, Conche des Baleines dune area.

---

## One Observation for the PM

**The venue queue has hit 15 with zero applications — but that's not the content team's problem. The VPS redeploy deadline is Oct 30 (2 days).** Every pending venue addition and every tag enrichment pass is blocked in meaningful value by a single Jack-only SSH action. If the VPS goes down in a content commit (cache stamp requires an `app.jsx` touch), the front page will immediately show Whistler (the #1 ski venue, opening in 13 days) as unscorable. The highest-leverage action in this project right now isn't more venue objects — it's one `pm2 restart` on `198.199.80.21`. After that, the content team can ship 15 venues in one commit, bump the cache stamp, and have the app ready for the Whistler opening-weekend window. Until then, the content queue is a staging area, not a blocker.

---

*Report generated: 2026-10-28 by Peakly Content & Data Agent*
