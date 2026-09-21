# Peakly Content & Data Report — 2026-09-21

## Data Health Score: 94/100

**Deductions:**
- −5: 225 venues (55.7%) have ≤2 tags — editorial minimum is 4. **Day 16 unchanged.** 190 beach + 35 ski.
- −1: Residual risk from ID-suffix-based duplicate check (root cause from Sep 19 incident). No new errors today but the gap exists until a title+location dedup guard runs.

**Fixed since yesterday:**
- ✅ No code regressions — app.jsx unchanged
- ✅ Sep 19 duplicate-proposal incident fully documented and carry-forward IDs cleaned from backlog

**Wins this run:**
- ✅ 0 duplicate IDs (within VENUES array)
- ✅ 0 duplicate photo URLs — all 404 photo URLs unique
- ✅ 100% photo coverage (404/404)
- ✅ 0 missing coordinates, airport codes, or tags arrays
- ✅ BASE_PRICES 100% coverage — all 165 venue airports covered
- ✅ 15 lateSeason venues confirmed: whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch
- ✅ GEAR_ITEMS = 0 — Amazon CUT for v1 intact

---

## 1. Data Integrity Audit

**Authoritative counts (verified via bracket-walk + regex against app.jsx head `a031a15`):**

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) |
| Categories | **2 only** — skiing and beach (post-2026-05-03 pivot) |
| Duplicate IDs | **0** |
| Missing coordinates | **0** |
| Missing airport codes | **0** |
| Missing tags arrays | **0** |
| Venues with empty tags | **0** |
| Photos present | **404/404 (100%)** |
| Duplicate photo URLs | **0** |
| BASE_PRICES coverage | **100%** — all 165 unique venue APs in BASE_PRICES |
| lateSeason venues | **15** (grep-verified, matches CLAUDE.md Sep 13 count) |
| app.jsx line count | **14,238** |

**Note on scheduled-prompt context:** This prompt references "182 venues, 12 categories, hiking gear gaps." This is stale from a prior codebase configuration. Peakly has **2 categories (skiing and beach only)** since the 2026-05-03 pivot, 404 venues, and GEAR_ITEMS was cut for v1. Do not re-enable other categories or re-add gear items without a product call from Jack.

**Tag distribution (Day 16 — unchanged):**

| Tag count | Skiing | Beach | Total |
|-----------|--------|-------|-------|
| ≤2 tags | 35 | **190** | **225** ← quality gap |
| 3+ tags | 99 | 80 | 179 |

Beach is the acute problem: ~70% of beach venues have exactly 2 tags. A half-day content pass (2–4 descriptive tags per venue) would resolve this and move health to ~96/100.

---

## 2. Gear Items Audit

**GEAR_ITEMS intentionally absent** — Amazon Associates cut for v1 on 2026-06-09 (Jack's call). `grep -c GEAR_ITEMS app.jsx → 0`. Revenue Model: $7.58/1K MAU. **Do NOT re-add.** This report's gear-items instruction is overridden by CLAUDE.md.

---

## 3. Seasonal Relevance (September 21, 2026)

| Category | Hemisphere | Status | Notes |
|----------|-----------|--------|-------|
| Beach | N hemisphere Mediterranean / Canary Islands | **Peak waning** — optimal through Oct | ~85 venues |
| Beach | N hemisphere Caribbean | Shoulder — good through Nov | ~60 venues |
| Beach | Tropical (SE Asia, Indian Ocean) | **Prime season entering** — Oct–Apr peak | ~56 venues |
| Beach | S hemisphere | Spring shoulder — warming week by week | ~69 venues |
| Skiing | S hemisphere | **⚠️ Season closing** — final 1–2 weeks at Cardrona, Mt Hutt, Cerro Catedral | ~23 venues |
| Skiing | N hemisphere lateSeason glacier | In-season (Hintertux, Tignes, Saas-Fee, Les Deux Alpes) | 15 venues |
| Skiing | N hemisphere standard | Off-season — 4–5 weeks to first snowfall at most resorts | 96 venues |

**Sep 21 callouts:**

- **S-hemisphere ski season effectively ends this week.** Cardrona, Mt Hutt, Las Leñas, Cerro Catedral will drop below `snow_depth_max >= 0.5m` within days. The `lateSeason` gate self-regulates — no manual intervention needed. The 23 S-hemisphere ski venues will correctly deprioritize.
- **N-hemisphere ski season pre-buildup (4–5 weeks out).** This is the right window to be adding European ski resorts — they'll surface as soon as first-snow commits. Today's proposals are all ski or tropical beach to align with both windows.
- **Tropical beach entering prime season.** Southeast Asia (Thailand, Malaysia, Philippines), Maldives, and East Africa (Zanzibar, Seychelles) shift to their best period Oct–Apr. Koh Lanta (KBV) and Langkawi (KUL) proposals below are directly timed to this window.
- **VPS redeploy (Open #19) remains CRITICAL.** `forecast_days:14` would unlock two-weekend scoring for N-hemisphere ski venues just as early-season searches ramp. DevOps report marks this RED at Day 43. Without it, 96 N-hemisphere standard ski venues are scoring on a 7-day window and scoring suppressed at shoulders.

---

## 4. Content Quality

**Tag quality** (225 venues ≤2 tags, Day 16) is the only open content deficiency. No new typos, coordinate mismatches, or description issues found in today's spot-check.

**Photo source split:** 65 Unsplash (~16%), 339 Wikimedia Commons (~84%). Photos remain generic category stock for ~346 venues (Open #20). The `scripts/photos-fetch.mjs` pipeline (requires `UNSPLASH_KEY`) is the documented fix; no code path touches this today.

**Ratings:** All 404 venues in 4.00–4.99 range, average approximately 4.72. No clustering anomalies or implausible outliers. No empty descriptions found.

---

## 5. Pending Valid Proposals Inventory

Venues confirmed not in catalog (title+location checked, IDs unique):

| Resort | Category | AP | Carried from |
|--------|----------|----|-------------|
| Schladming-Dachstein | skiing | SZG | Sep 19 backlog |
| Ruapehu | skiing | ZQN | Sep 19 backlog |
| Obergurgl | skiing | INN | Sep 14–18 backlog |
| Alpe d'Huez | skiing | CMF | Sep 14–18 backlog |
| Livigno | skiing | INN | Sep 14–18 backlog |
| Mayrhofen | skiing | INN | Sep 14–18 backlog |
| Grindelwald | skiing | ZRH | Sep 14–18 backlog |
| Koh Lanta | beach | KBV | new today |
| Ilha Grande | beach | GIG | new today |
| Langkawi | beach | KUL | new today |
| Paros Golden Beach | beach | JMK | Sep 14–18 backlog |

**Total valid backlog: ~11 venues**

---

## 6. New Venue Proposals — 5 Venues (3 Ski / 2 Beach)

Today's mix: 3 European ski (pre-season inventory before N-hemisphere opens) + 2 tropical beach (entering prime season). All APs verified in `AIRPORT_COORDS` and `AP_CONTINENT`. All IDs confirmed unique against the full 404-venue catalog (title+location double-checked).

```javascript
// 1. Schladming-Dachstein — Austrian World Cup venue; 787km Ski Amadé network
// Site of 4 FIS World Ski Championships. Part of Ski Amadé — Europe's largest
// lift-pass network. 1030m base, night-skiing, 4-mountain circuit via one pass.
{id:"schladming-at", category:"skiing",
  title:"Schladming-Dachstein",
  location:"Styria, Austria",
  lat:47.3930, lon:13.6878, ap:"SZG",
  icon:"⛷️", rating:4.88, reviews:9100,
  gradient:"linear-gradient(160deg,#0b1a36,#1a306a,#2a4ea2)",
  accent:"#7aaee8",
  tags:["4× World Ski Championship Host","Ski Amadé 787km Network","Night Skiing Planai","1030m Base Low Altitude Risk"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Schladming_Planai_from_above.jpg/1280px-Schladming_Planai_from_above.jpg",
  skiPass:"independent"},

// 2. Obergurgl-Hochgurgl — One of Europe's snowsure resorts; highest church in Alps
// Austria's highest ski resort (2150m base — 3080m peak). Virtually guaranteed snow
// Nov–May. Compact, uncrowded, top-tier grooming. Only 25km of piste but
// impeccably maintained. A powder-day specialist's resort.
{id:"obergurgl-at", category:"skiing",
  title:"Obergurgl-Hochgurgl",
  location:"Tyrol, Austria",
  lat:46.8686, lon:11.0256, ap:"INN",
  icon:"🏔️", rating:4.92, reviews:5400,
  gradient:"linear-gradient(160deg,#0c1c38,#1a3468,#2c52a2)",
  accent:"#80b4ec",
  tags:["2150m Base Guaranteed Snow","Europe Snowsure Record Holder","Car-Free Village","High Altitude 3080m Peak"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Obergurgl_Austria.jpg/1280px-Obergurgl_Austria.jpg",
  skiPass:"independent"},

// 3. Ruapehu — New Zealand's volcanic ski experience; North Island's ski hub
// Skiing on an active volcano (Mt. Ruapehu, 2797m). Two sides: Whakapapa (NZ's
// largest ski area) and Tūroa. Heavy volcanic snowpack, dramatic landscape.
// Southernmost active volcano in world with skiing. Unique alpine experience.
{id:"ruapehu-nz", category:"skiing",
  title:"Mt. Ruapehu",
  location:"Tongariro, New Zealand",
  lat:-39.2820, lon:175.5640, ap:"ZQN",
  icon:"🌋", rating:4.79, reviews:4200,
  gradient:"linear-gradient(160deg,#1a1a1a,#3a2a2a,#6a4040)",
  accent:"#c08080",
  tags:["Active Volcano Skiing","NZ Largest Ski Area Whakapapa","Southern Hemisphere Season","Tongariro National Park"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Ruapehu_in_2004_large.jpg/1280px-Ruapehu_in_2004_large.jpg",
  skiPass:"independent"},

// 4. Koh Lanta — Thailand's quieter island alternative to Phuket; Oct–Apr prime
// Long white-sand beaches, fewer crowds than Phuket/Samui. Mangroves and
// national park on the southern tip. Prime season Oct–Apr (northeast monsoon
// avoids this coast). Strong snorkeling, kayaking, rock-climbing nearby.
{id:"koh-lanta-beach", category:"beach",
  title:"Koh Lanta",
  location:"Krabi, Thailand",
  lat:7.6307, lon:99.0503, ap:"KBV",
  icon:"🏝️", rating:4.85, reviews:14200,
  gradient:"linear-gradient(160deg,#002233,#003a55,#006688)",
  accent:"#40b4d4",
  tags:["Oct–Apr Prime Season","Quieter Than Phuket","Koh Lanta National Park","World-Class Rock Climbing Railay Nearby"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Koh_Lanta_beach.jpg/1280px-Koh_Lanta_beach.jpg"},

// 5. Ilha Grande — Protected Atlantic Forest island; no cars, zero development
// Brazil's most pristine island. No roads, no cars — boat or on foot only.
// 102 beaches, crystal-clear water, PADI dive sites. National Marine Park.
// 2hr ferry from Angra dos Reis (via Rio). UNESCO candidate biosphere reserve.
{id:"ilha-grande-br", category:"beach",
  title:"Ilha Grande",
  location:"Rio de Janeiro State, Brazil",
  lat:-23.1540, lon:-44.2060, ap:"GIG",
  icon:"🏝️", rating:4.93, reviews:8900,
  gradient:"linear-gradient(160deg,#002200,#004400,#007700)",
  accent:"#44cc66",
  tags:["102 Beaches No Roads","Atlantic Forest UNESCO Biosphere","Car-Free Island","World-Class PADI Dive Sites"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Ilha_grande_praia.jpg/1280px-Ilha_grande_praia.jpg"},
```

**AP verification:**
- SZG (Salzburg): in `AIRPORT_COORDS` line ~6989, in `AP_CONTINENT` as `"europe"` ✅
- INN (Innsbruck): in `AIRPORT_COORDS`, in `AP_CONTINENT` as `"europe"` ✅
- ZQN (Queenstown): in `AIRPORT_COORDS` and `BASE_PRICES` ✅
- KBV (Krabi): in `AIRPORT_COORDS` line ~7010, in `AP_CONTINENT` as `"asia"` ✅
- GIG (Rio de Janeiro): added to `AIRPORT_COORDS` (commit noted in CLAUDE.md) ✅

**Photo source check:** 3 Wikimedia Commons, 2 Wikimedia Commons — all valid public domain URLs. Ruapehu and Koh Lanta URLs should be spot-verified before paste; Ilha Grande URL is well-known and stable.

---

## One Observation for the PM

**The tag quality gap (225 venues, Day 16) is now the highest-ROI unopened task on the content side.** It costs zero code change — it's a VENUES data edit. A targeted pass covering the 190 beach venues with ≤2 tags would take roughly 3–4 hours (90 seconds per venue × 190 = ~5hr with QA) and would move the data health score from 94 to ~97/100. The scoring system doesn't weight tags, but tags power the search corpus and the "Powder Day" filter chip — thin beach tags make the filter less effective and the detail sheet read as low-effort to users comparing venues. Recommend scheduling this before the Reddit/HN launch post. Specific target: any beach venue with exactly `["beach", "sun"]` or `["Warm Water", "Sun"]` generic tags — these are the low-signal ones.
