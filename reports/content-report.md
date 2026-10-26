# Peakly Content & Data Report — 2026-10-26

## Data Health Score: 88/100

**Deductions (persistent from prior days — no code changes since 2026-08-11):**
- −9: 225 venues (55.7%) have only 2 tags — `scoreVibeMatch` and search recall degraded
- −1: Gili Trawangan near-duplicate (`beach_gilit/LOP` vs `gili-trawangan/DPS`) — same island, two airports
- −1: Stale scheduled-task prompt (references "182 venues, 12 categories, hiking" — outdated since 2026-05-03 pivot; see note below)
- −1: PRECACHE→CDN version mismatch in sw.js (DevOps P1-A, Day 2) — content impact: offline users on some browsers may cache wrong Babel version

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories" and asks to audit hiking gear items. The project pivoted 2026-05-03 to **skiing + beach only**. GEAR_ITEMS was cut for v1 (Amazon formally cut, `grep -c GEAR_ITEMS app.jsx → 0`). Correct count: **404 venues (134 skiing / 270 beach)**. All audit data below reflects actual app.jsx state. The prompt should be updated to match current reality.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | 14,238 — no code changes since 2026-08-11 (42 days) |
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
| BASE_PRICES coverage | **100%** — 181 airports, 0 gaps ✅ CLOSED |
| lateSeason:true venues | **15** (Whistler, Chamonix, Mammoth, Tignes, Hintertux, Cervinia, Snowbird, Zermatt, Engelberg, Verbier, Val-Thorens, Les-Deux-Alpes, Saas-Fee, St-Moritz, Abasin) ✅ |
| GEAR_ITEMS in app | **0** — Amazon cut confirmed for v1 ✅ |
| Gili Trawangan near-dup | ⚠️ persists: `beach_gilit/LOP` + `gili-trawangan/DPS` |
| Surf Breaks tag on beach venues | ⚠️ 33 venues carry this tag (surfing retired; tags are on beach venues — arguably OK as a descriptor, not a category) |
| PEAKLY_BUILD / CACHE_NAME | `20260914a` — 42 days stale (expected; no code since Aug 11 — first edit MUST bump in lockstep) |

---

## 1. DATA INTEGRITY AUDIT

All 404 venues pass core integrity checks: no missing coordinates, no missing airport codes, no missing tags arrays, no duplicate IDs, no duplicate photo URLs, no invalid IATA formats, no lat/lon out of range.

**Photo coverage:** 339 Wikimedia (84%) + 65 Unsplash (16%). 0 missing. No duplicates.

**Rating distribution:** 358 venues at 4.5+ (88.6%), 46 at 4.0–4.5 (11.4%), 0 below 4.0. Distribution looks synthetic — all pre-seeded, none user-generated yet.

**Gili Trawangan near-duplicate (Day 3):**
- `beach_gilit` — Gili Trawangan via LOP (Lombok International) — 1 venue total at LOP
- `gili-trawangan` — Gili Trawangan via DPS (Bali Ngurah Rai) — 18 venues total at DPS

Both are legitimately different traveler entry points. Recommend: differentiate in titles: "Gili Trawangan (Lombok gateway)" vs "Gili Trawangan (Bali gateway)". Low priority.

**"Surf Breaks" tag on 33 beach venues:** Surfing was retired as a category 2026-05-03, but the tag appears on 33 beach venues (Mirissa, Bathsheba, Waimea Bay, Zipolite, Santa Teresa, etc.). This is not a bug — the tag describes the beach feature, not a category. Search for "surf" will surface beach venues. Only an issue if the app ever filters by tag to show "surfing options." Keep as-is; no action needed.

---

## 2. GEAR ITEMS AUDIT

**N/A for this codebase.** Amazon Associates (GEAR_ITEMS) was formally cut for v1 on 2026-06-09 (Jack's decision). `grep -c GEAR_ITEMS app.jsx → 0`. Revenue model is $7.58/1K MAU (Booking.com + SafetyWing + Travelpayouts). This section of the scheduled prompt is an artifact of the original 12-category version and should be removed on prompt update.

---

## 3. SEASONAL RELEVANCE — October 26, 2026

| Segment | Venues | Oct Condition |
|---------|--------|--------------|
| N. Hemisphere skiing | 111 | Pre-season (opens Nov–Dec). **lateSeason (15)** already rideable at altitude. |
| S. Hemisphere skiing | 23 | Off-season (season closed Sep–Oct). Score will be poor — expected. |
| Tropical beach (lat < 23°) | 163 | **In-season, peak.** 28–32°C, excellent scoring. |
| N. Hemisphere beach | 92 | Shoulder/ending (Mediterranean ~21°C, still scoreable) |
| S. Hemisphere beach | 15 | Spring warmup — S. Pacific, Australia. Good and improving. |

**Seasonal highlight for this week:** The 15 `lateSeason:true` ski venues (Hintertux, Saas-Fee, Zermatt, Tignes, Les-Deux-Alpes, Val-Thorens, Engelberg) are October's star content. They should be appearing on the front page for users flying from European hubs (GVA, ZRH, CMF, INN all well-covered). Worth a social media post if the front page is functioning.

**Upcoming trigger (15 days):** Whistler Blackcomb opens ~Nov 10. The VPS redeploy blocking `forecast_days:14` must land before then or the front page will show Whistler as unscorable even after opening. This is a Jack-only action — not a content fix.

---

## 4. CONTENT QUALITY

**Tag depth gap (persistent P1):** 225 venues have exactly 2 tags. The `scoreVibeMatch` function weights tags for personalization; 2-tag venues get worse match coverage. A venue with only "Family Friendly" and "All Levels" will never surface for "powder day" seekers even if it has deep snow. This is the single biggest content quality gap.

**Most common tags (top 5):**
1. Family Friendly: 32 venues
2. All Levels: 25 venues
3. Groomed Runs: 22 venues
4. Calm Waters: 19 venues
5. Expert Terrain: 18 venues

**Recommendation:** Bulk-add 2 additional tags to the 225 thin-tag venues. This is a 2–3 hour task for a focused session. Priority: beach venues (270 total, most of the thin-tag mass).

**Difficulty levels:** No `difficulty` field exists in the venue schema. Not a gap — the app uses tags for difficulty signaling (e.g., "Expert Terrain", "All Levels"). Consistent with the schema.

**Description field:** Empty on all 404 venues by design — the app does not render a description field in any component. Not a gap.

---

## 5. DAILY VENUE ADDITIONS — October 26, 2026

**Focus:** Airports with exactly 1 existing venue (low coverage) and full infrastructure support (AP_CONTINENT ✅ + AIRPORT_COORDS ✅ + BASE_PRICES ✅). All 5 are verified against app.jsx — no ID conflicts, no airport conflicts.

**Seasonal context for these additions:** TFS/CHQ are October shoulder perfection. KOA is year-round Hawaii excellent. LAS adds ski depth for Vegas flyers (opens Dec). VPS adds a wild, undeveloped counterpart to the resort-heavy Destin.

---

### Venue 1 — Playa de Las Américas (TFS, Tenerife) `beach`

Airport TFS currently: 1 venue (Las Teresitas, north Tenerife). Las Américas is the opposite end of the island — package-holiday resort strip with 25°C year-round, nightlife, consistent watersports. October is peak.

```js
{id: "beach_las_americas", category: "beach", title: "Playa de Las Américas", location: "Tenerife South, Canary Islands, Spain", lat: 28.058, lon: -16.718, ap: "TFS", icon: "🏖", rating: 4.5, reviews: "38K", gradient: "from-amber-500 to-orange-400", accent: "#f59e0b", tags: ["Year-Round Sun", "Resort Strip", "Watersports Hub", "Nightlife Beach"], photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Playa_de_las_Americas_Tenerife.jpg/1280px-Playa_de_las_Americas_Tenerife.jpg"},
```

> ⚠️ Photo URL: verify this Wikimedia file exists before pasting. Search `commons.wikimedia.org` for "Playa de Las Américas Tenerife" if not found.

---

### Venue 2 — Balos Lagoon, Crete (CHQ) `beach`

Airport CHQ currently: 1 venue (Elafonissi, southwest Crete). Balos is the northwest peninsula — iconic lagoon with pink-tinged sand, flamingos, UNESCO-adjacent. Boat-access only (or 1hr hike). October: 22°C, fewer crowds, stunning.

```js
{id: "beach_balos_lagoon", category: "beach", title: "Balos Lagoon", location: "Gramvousa Peninsula, Crete, Greece", lat: 35.608, lon: 23.779, ap: "CHQ", icon: "🏖", rating: 4.8, reviews: "22K", gradient: "from-cyan-400 to-teal-500", accent: "#06b6d4", tags: ["Pink Sand Lagoon", "Boat Access", "Protected Peninsula", "Flamingo Sightings"], photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Balos_lagoon%2C_Crete.jpg/1280px-Balos_lagoon%2C_Crete.jpg"},
```

> ⚠️ Photo URL: verify Wikimedia file. Search "Balos lagoon Crete" on commons.

---

### Venue 3 — Punaluu Black Sand Beach (KOA, Big Island) `beach`

Airport KOA currently: 1 venue (Hapuna Beach, white sand). Punaluu is the iconic volcanic black sand beach in the island's south, famous for nesting green sea turtles (Hawaiian Green Sea Turtle, federally protected). Year-round excellent. October is post-peak-season price dip.

```js
{id: "beach_punaluu", category: "beach", title: "Punaluu Black Sand Beach", location: "Ka'ū District, Big Island, Hawaii", lat: 19.127, lon: -155.502, ap: "KOA", icon: "🏖", rating: 4.7, reviews: "19K", gradient: "from-gray-900 to-stone-700", accent: "#78716c", tags: ["Volcanic Black Sand", "Sea Turtle Nesting", "Lava Coastline", "Year-Round Sun"], photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Punaluu_Black_Sand_Beach_Big_Island_Hawaii.jpg/1280px-Punaluu_Black_Sand_Beach_Big_Island_Hawaii.jpg"},
```

> ⚠️ Photo URL: verify Wikimedia file. Search "Punaluu Black Sand Beach" on commons.

---

### Venue 4 — Lee Canyon, Nevada (LAS) `skiing`

Airport LAS currently: 0 ski venues (and 0 any venues). Las Vegas is the #1 fly-in city in the US — but it has no ski venue in the catalog. Lee Canyon is 45 min drive from the Strip, 3050m top elevation, legitimate skiing in a desert context. Opens ~December. Adds huge inventory for the world's busiest single-market airport.

```js
{id: "lee-canyon-nv", category: "skiing", title: "Lee Canyon", location: "Spring Mountains, Nevada, USA", lat: 36.598, lon: -115.668, ap: "LAS", icon: "⛷", rating: 4.2, reviews: "8K", gradient: "from-purple-900 to-indigo-800", accent: "#7c3aed", tags: ["Desert Ski", "Spring Mountains", "Vegas Getaway", "Night Skiing"], photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Lee_Canyon_ski_resort_Nevada.jpg/1280px-Lee_Canyon_ski_resort_Nevada.jpg"},
```

> ⚠️ Photo URL: verify Wikimedia file. Search "Lee Canyon ski resort" on commons. Note: Lee Canyon is a smaller/regional resort — rating 4.2 (lower than Whistler-tier) is intentional.

---

### Venue 5 — Grayton Beach State Park (VPS, Florida) `beach`

Airport VPS currently: 1 venue (Emerald Coast Destin — resort/touristy). Grayton Beach State Park on 30A is 30 miles east — pristine dunes, no hotels on the beach, consistently rated one of America's best beaches. October: water still 76°F, uncrowded, mild. Offers a wild/natural counterpart to Destin's resort atmosphere.

```js
{id: "beach_grayton", category: "beach", title: "Grayton Beach State Park", location: "30A, Florida Panhandle, USA", lat: 30.328, lon: -86.136, ap: "VPS", icon: "🏖", rating: 4.8, reviews: "14K", gradient: "from-emerald-400 to-teal-600", accent: "#059669", tags: ["America's Best Beach", "Pristine Dunes", "State Park", "Gulf Emerald Water"], photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Grayton_Beach_State_Park_Florida.jpg/1280px-Grayton_Beach_State_Park_Florida.jpg"},
```

> ⚠️ Photo URL: verify Wikimedia file. Search "Grayton Beach State Park" on commons.

---

## One Observation for the PM

**The tag-depth gap (225 venues, 2 tags) is now the #1 content quality lever with a clear fix path.** BASE_PRICES is 100%, photos are 100%, coordinates are clean — the remaining score gap is almost entirely from thin tagging. A focused 2-hour session bulking 3–4 tags per thin-tagged beach venue would push the health score to 97/100 and materially improve `scoreVibeMatch` personalization quality. The PM should decide whether to schedule this as a dedicated sprint item or bundle it with the next app.jsx touch (which needs to bump the cache stamp anyway).

**Secondary note:** The VPS redeploy window is now 15 days to Whistler opening. The content agent cannot fix this — it requires Jack's SSH session. But the Whistler/high-altitude content is only valuable when `forecast_days:14` is live and the iOS CORS fix lands. The content work above (new venues, tag depth) is ready to ship the moment the next app.jsx edit session opens.

---

*Report generated: 2026-10-26 by Peakly Content & Data Agent*
