# Peakly Content & Data Report — 2026-09-19

## Data Health Score: 95/100

**Deductions:**
- −5: 225 venues (55.7%) have ≤2 tags — editorial minimum is 4. **Day 14 unchanged.** 190 beach + 35 ski. Largest content quality gap.

**Fixed since yesterday:**
- ✅ No new additions needed — all integrity checks clean

**Wins this run:**
- ✅ 0 duplicate IDs
- ✅ 0 duplicate photos — all 404 unique photo URLs
- ✅ 100% photo coverage (404/404 have `photo` field)
- ✅ 0 missing coordinates, airport codes, or tags arrays
- ✅ BASE_PRICES 100% coverage — all 165 unique venue airports covered
- ✅ 15 lateSeason venues confirmed
- ✅ GEAR_ITEMS = 0 — Amazon CUT for v1 intact
- ✅ CLAUDE.md and codebase aligned (404 venues, 2 categories)

---

## 1. Data Integrity Audit

**Authoritative counts (node eval method):**

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) |
| Categories | **2 only** — skiing and beach |
| Duplicate IDs | **0** |
| Missing coordinates | **0** |
| Missing airport codes | **0** |
| Missing tags arrays | **0** |
| Photos present | **404/404 (100%)** — 65 Unsplash, 339 Wikimedia |
| BASE_PRICES coverage | **100%** — all 165 unique venue APs covered |
| lateSeason venues | **15** |
| Rating range | 4.00–4.99, avg 4.72 |

**Note on scheduled-prompt context:** The prompt references "182 venues, 12 categories, hiking gear gaps." This is stale — the codebase has **2 categories (skiing and beach only)** since the 2026-05-03 pivot, and 404 venues since Aug 11. GEAR_ITEMS was cut for v1. Do not re-enable any other category or re-add gear items without a product call.

**Tag distribution:**

| Tag count | Skiing | Beach | Total |
|-----------|--------|-------|-------|
| ≤2 tags | 35 | **190** | **225** ← quality gap, Day 14 |
| 3 tags | 14 | 0 | 14 |
| 4 tags | 85 | 78 | 163 |
| 5+ tags | 0 | 1 | 1 |

Beach venues are the acute problem: ~70% have exactly 2 tags. A half-day content pass (2–4 descriptive tags per venue) moves health to ~96/100.

**Pending proposals inventory (cumulative, unadded as of today):**

From Sep 14:
- Sestriere / TRN (ski)
- Amed Bali / DPS (beach)
- Noosa Heads / OOL (beach)

From Sep 15:
- Hakuba / NRT (ski)
- Mayrhofen / INN (ski)
- Naxos Agios Prokopios / JNX — ⚠️ fix comma after `tags` array before pasting
- Lamu / MBA (beach)

From Sep 16:
- Alpe d'Huez / CMF (ski)
- Livigno / INN (ski)

From Sep 17:
- Ruapehu / ZQN (ski)
- Paros Golden Beach / JTR (beach)

From Sep 18 (none added yet — confirmed via eval):
- Grindelwald / ZRH (ski)
- Lech am Arlberg / INN (ski)
- Obergurgl / INN (ski)
- Koh Lanta / KBV (beach)
- Ilha Grande / GIG (beach)

**From today (new, see Section 5):**
- Kitzbühel / INN (ski)
- Les Arcs / CMF (ski)
- Bansko / SOF (ski)
- Schladming / SZG (ski)
- Arugam Bay / CMB (beach)

**Total unique valid unadded proposals: 21** (16 from Sep 14–18 + 5 new today)

---

## 2. Gear Items Audit

**GEAR_ITEMS intentionally absent** — Amazon Associates cut for v1 on 2026-06-09 (Jack's call). `grep -c GEAR_ITEMS app.jsx → 0`. Revenue Model: $7.58/1K MAU. **Do NOT re-add.** This scheduled prompt's gear-items instruction is overridden by the documented product decision in CLAUDE.md.

---

## 3. Seasonal Relevance (September 19, N Hemisphere)

| Category | Hemisphere | Status | Notes |
|----------|-----------|--------|-------|
| Beach | N hemisphere | **Peak waning** — Mediterranean peak; Caribbean shoulder | ~201 venues |
| Beach | S hemisphere | Shoulder — spring begins Oct for AU/NZ/SA | ~69 venues |
| Beach | Tropical | Year-round viable | ~163 venues |
| Skiing | S hemisphere | **⚠️ Season closing** — final weekend for most S-hemisphere resorts | 23 venues |
| Skiing | N hemisphere lateSeason | In-season (glacier) | 15 venues |
| Skiing | N hemisphere standard | Off-season — first snowfall ~5 weeks away | 96 venues |

**Sep 19 callouts:**
- **VPS deadline is TOMORROW (Sep 20).** `forecast_days:14` unlocks two-weekend scoring — the single biggest pending change to how the catalog surfaces to users. This is not a content issue but it dominates seasonal readiness.
- **S-hemisphere ski season is effectively over this weekend.** Cardrona, Mt Hutt, Cerro Catedral, Las Leñas close within days. The `snow_depth_max >= 0.5m` lateSeason gate self-regulates; scores will drop automatically. No manual intervention needed.
- **Mediterranean beaches peak through September.** Greece, Turkey, Croatia, Canary Islands, and Ibiza remain optimal. ~75% of beach inventory correctly promoted for this window.
- **N-hemisphere ski season prep starts now.** First high-altitude snowfall at Alpine resorts (Zermatt, Tignes, Val Thorens, Hintertux) is ~5 weeks out (late October). Building ski inventory now (134 venues vs. 270 beach) is the right strategic move. Today's 5 new proposals are all ski-first to close this gap before first-snow coverage matters.
- 15 lateSeason glacier venues correctly gated (Hintertux year-round; Tignes/Saas-Fee/Les Deux Alpes glacier through October).

---

## 4. Content Quality

**Tag quality** remains the dominant gap (225 venues, Day 14). No new typos or coordinate mismatches identified in today's spot-check. Rating spread remains healthy (4.00–4.99, avg 4.72) with no suspicious clustering.

**Photo source split:** 65 Unsplash (16%), 339 Wikimedia Commons (84%). Wikimedia photos remain generic stock in most cases. The `scripts/photos-fetch.mjs` pipeline (UNSPLASH_KEY required) is the fix; ~346 venues still show generic category scenery per Open #20. No change since Jul 24.

**Description quality:** All venues have non-empty `location` and `title` fields. No truncated or placeholder descriptions found in today's spot-check of 20 random venues.

---

## 5. New Venue Proposals — 5 Venues (4 Ski / 1 Beach)

Today's focus: ski inventory ahead of N-hemisphere season (134 ski vs. 270 beach). All APs verified in AIRPORT_COORDS (confirmed via direct file read, lines 6987–7038) and AP_CONTINENT. All IDs verified unique.

```javascript
// 1. Kitzbühel — Austria's most iconic racing resort
// Home of the Hahnenkamm downhill, the scariest race on the World Cup circuit.
// Charming medieval town, top-tier après, linked lift system with Kirchberg.
{id:"kitzbuehel-at", category:"skiing",
  title:"Kitzbühel",
  location:"Tyrol, Austria",
  lat:47.4461, lon:12.3925, ap:"INN",
  icon:"🏔️", rating:4.93, reviews:9800,
  gradient:"linear-gradient(160deg,#0a1c3a,#1a3470,#2c5ab0)",
  accent:"#80b8f0",
  tags:["Hahnenkamm Downhill","Medieval Ski Town","Streif Piste","Kitzbüheler Horn Views"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Kitzbuehel-pano.jpg/1280px-Kitzbuehel-pano.jpg",
  skiPass:"independent"},

// 2. Les Arcs — France's high-altitude arc system, Paradiski mega-area
// Arc 1600/1800/1950/2000; linked with La Plagne via Vanoise Express to form
// the world's largest skiable area by some counts. Excellent tree skiing.
{id:"les-arcs-fr", category:"skiing",
  title:"Les Arcs",
  location:"Savoie, France",
  lat:45.5667, lon:6.8333, ap:"CMF",
  icon:"⛷️", rating:4.87, reviews:7100,
  gradient:"linear-gradient(160deg,#0c1830,#1a3268,#2c5ab0)",
  accent:"#78b0e8",
  tags:["Paradiski Mega-Area","Vanoise Express Cable Car","Arc 1950 Snow-Sure","High-Altitude Powder"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Les_Arcs_1600.jpg/1280px-Les_Arcs_1600.jpg",
  skiPass:"independent"},

// 3. Bansko — Bulgaria's premier mountain resort, best value ski in Europe
// Pirin National Park UNESCO backdrop; modern gondola; genuine €20/day ski passes;
// lively après in cobbled old town; 70km of runs from 2560m.
{id:"bansko-bg", category:"skiing",
  title:"Bansko",
  location:"Pirin Mountains, Bulgaria",
  lat:41.8358, lon:23.4882, ap:"SOF",
  icon:"🏔️", rating:4.79, reviews:5200,
  gradient:"linear-gradient(160deg,#0d1e34,#1c3660,#2e52a0)",
  accent:"#72a8e0",
  tags:["Best Value Ski Europe","Pirin UNESCO Backdrop","Lively Old Town Après","€20/Day Ski Pass"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Bansko_ski_resort.jpg/1280px-Bansko_ski_resort.jpg",
  skiPass:"independent"},

// 4. Schladming — Austria's Planai mountain, 4-mountain World Cup venue, Dachstein views
// Hosted 2013 Alpine Ski World Championships. Linked with Hauser Kaibling,
// Reiteralm, Galsterberg. Night skiing on Planai; buzzy student-friendly town.
{id:"schladming-at", category:"skiing",
  title:"Schladming-Dachstein",
  location:"Styria, Austria",
  lat:47.3906, lon:13.6872, ap:"SZG",
  icon:"⛷️", rating:4.84, reviews:6300,
  gradient:"linear-gradient(160deg,#0b1c3c,#1a3270,#2a52aa)",
  accent:"#7aaeea",
  tags:["4-Mountain World Cup Venue","Dachstein Glacier Views","Night Skiing Planai","2013 World Championships"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Schladming_Ski_Resort_Planai.jpg/1280px-Schladming_Ski_Resort_Planai.jpg",
  skiPass:"independent"},

// 5. Arugam Bay — Sri Lanka's east-coast beach town, Indian Ocean turquoise water
// Year-round warm water (27–29°C); world-famous beach culture; laid-back village vibe;
// best Apr–Oct for calm eastern seas; cheap and authentic.
{id:"arugam-bay-lk", category:"beach",
  title:"Arugam Bay",
  location:"Eastern Province, Sri Lanka",
  lat:6.8412, lon:81.8354, ap:"CMB",
  icon:"🏝️", rating:4.81, reviews:8700,
  gradient:"linear-gradient(160deg,#001a22,#003344,#005566)",
  accent:"#44bbdd",
  tags:["27°C Year-Round Water","Remote East Coast Gem","Elephant Rock Viewpoint","Budget Backpacker Haven"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Arugam_Bay_Beach.jpg/1280px-Arugam_Bay_Beach.jpg"},
```

**Validation checklist:**
- APs: INN ✅ CMF ✅ SOF ✅ SZG ✅ CMB ✅ — all confirmed in AIRPORT_COORDS (lines 6987–7038) and AP_CONTINENT
- IDs: kitzbuehel-at ✅ les-arcs-fr ✅ bansko-bg ✅ schladming-at ✅ arugam-bay-lk ✅ — all unique, none in current 404-venue VENUES
- Tags: all exactly 4 ✅
- Coordinates: verified against OSM for each named feature ✅
- ⚠️ **Photo URLs are Wikipedia Commons links** — verify each renders before pasting. Broken Wiki thumbs are the main failure mode.
- Ski AP note: INN (Innsbruck, ~75km from Kitzbühel, ~90km from Les Arcs via CMF) is standard for Tyrol/Austrian Alps in the catalog, consistent with existing Mayrhofen/Obergurgl/Lech proposals. SZG (Salzburg) is the closest major airport to Schladming.
- Bansko note: SOF (Sofia, ~160km) is the standard Bulgarian ski gateway; no closer international airport.

---

## One Observation for PM

**The VPS redeploy (deadline TOMORROW, Sep 20) is the single highest-leverage move remaining before the Reddit/HN post.** Two-weekend scoring (`forecast_days:14` unlocking Fri–Mon windows for weeks 1 and 2) changes what 96 N-hemisphere off-season ski venues look like to users — right now they score low (short forecast window), post-deploy they may surface Oct/Nov windows at reasonable confidence levels. The Sep 14–19 venue backlog (21 unadded, AP-verified, paste-ready) is a 30-minute task once the catalog strategy is confirmed. Recommend: VPS today → venue paste next session → tag quality pass before Reddit.
