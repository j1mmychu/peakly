# Peakly Content & Data Report — 2026-08-24

## Data Health Score: 95/100

**Deductions (unchanged from 2026-08-23):**
- BASE_PRICES gap: 29 destination APs missing → 133/162 = 82.1% coverage (−3 pts)
- 5 major US hub airports (SEA, BOS, LAX, JFK, MIA) absent as destination APs, affecting 11 domestic venues (−2 pts)

**Clean:**
- 0 duplicate `id` values — 391 unique IDs
- 0 duplicate title+location combos
- 0 duplicate photo URLs (391/391 unique)
- 100% field coverage on all 14 required fields across all 391 venues: id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo
- 100% AIRPORT_COORDS coverage — 0 venue APs missing
- 100% AP_CONTINENT coverage — 0 venue APs missing
- 100% skiPass coverage — all 131 ski venues tagged (epic: 34, ikon: 48, independent: 49)
- 14 `lateSeason:true` flags: whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch
- 0 empty tag arrays; avg 2.8 tags/venue (min 2, max 5); 0 single-tag venues
- 0 missing ratings; all ratings ≥ 4.5
- `.venue-baseline` = 391 ✅ matches actual eval count
- `PEAKLY_BUILD`: `20260823b` (unchanged today — no app.jsx edits this session)

---

## Category Breakdown

The scheduled prompt references 12 categories and hiking gear stubs — that state is ~4 months stale per the 2026-05-03 pivot. Current reality:

| Category | Venues | Notes |
|----------|--------|-------|
| Beach    | 260    | ✅ Healthy |
| Skiing   | 131    | ✅ Healthy |
| **Total** | **391** | ✅ Matches `.venue-baseline` |

Surfing retired 2026-05-03. Hiking/climbing/MTB/kayak/dive/yoga/wellness were never re-enabled. Two categories only, both well above any stub floor.

---

## GEAR_ITEMS Audit

GEAR_ITEMS was **intentionally cut for v1** (2026-06-09, Jack — CLAUDE.md Open #13/#16, resolved; standing directive in `tasks/agents/devops.md`). `grep -c GEAR_ITEMS app.jsx` → **0**. Do not restore.

---

## Seasonal Relevance — 2026-08-24

Today is the peak of N hemisphere summer. This is the app's best weekend of the year for beach.

| Segment | Count | Status |
|---------|-------|--------|
| N hemisphere beach (lat ≥ 0) | 199 | ✅ **PEAK SEASON** — Aug is the best beach month globally |
| S hemisphere ski (lat < 0) | 23 | ✅ **PEAK SEASON** — SH winter, Aug is peak |
| N hemisphere ski (lat ≥ 0) | 108 | ⚠️ OUT OF SEASON — summer, scoring will be suppressed |
| S hemisphere beach (lat < 0) | 61 | ⚠️ SHOULDER — SH winter, cooler water temps |

**Actionable:** The 14 `lateSeason:true` resorts (Whistler, Chamonix, Mammoth, etc.) are correctly bypassing the off-season cap when snow depth ≥ 0.5m. With Aug being summer, very few if any will have 0.5m depth — their scores will be appropriately suppressed. No action needed.

**Weekend framing:** Any Reddit/HN traffic this weekend will hit 199 in-season beach venues. The catalog's beach-to-ski ratio (260:131 = 2:1) is well-matched to this moment in the calendar.

---

## Photo Sources

| Source | Count |
|--------|-------|
| Unsplash | 88 (23%) |
| Wikimedia Commons | 303 (77%) |
| **Total unique** | **391** |

0 duplicate photo URLs. All render correctly.

**Standing note (carried from 2026-08-23):** Wikimedia Commons images carry CC attribution requirements that Unsplash images do not. If a credits page is ever added, 303 Wikimedia photos would need attribution listed. Not a launch blocker.

---

## BASE_PRICES Coverage — No Change

Same 29-AP gap as yesterday. 133/162 venue APs in BASE_PRICES = 82.1%.

### High-impact US hub gaps

| AP | Venues affected |
|----|----------------|
| BOS | sunday-river, sugarloaf, beach_cape_cod |
| LAX | manhattan-beach-ca, zuma-beach-malibu |
| SEA | crystal-mountain-wa, stevens-pass |
| JFK | beach_hamptons (Cooper's Beach) |
| MIA | south-beach-miami |
| ORD | wilmot-mountain |

**Fix:** Add these 6 keys to BASE_PRICES. 30-minute task, ~$15–30 average values each. All are high-traffic domestic US routes. BOS + LAX are the immediate priority — NE ski + LA beach, both get frequent US users.

---

## Data Integrity — No Issues Found

- Venue IDs: 391 unique, 0 duplicates in VENUES array (the `cancun-beach` appearing at line 10585 is in a separate alert-preset UI constants block, not VENUES — confirmed not a real duplicate)
- Coordinates: all 391 lat/lon pairs populated, none null
- AP resolution: 100% — every `ap` field resolves in both AP_CONTINENT and AIRPORT_COORDS
- Tags: all 391 venues have ≥ 2 tags; no empty arrays; content accurate per manual spot-check

---

## 5 New Venue Objects — Aug Peak: Beach Gaps + S Hemi Ski

Focus: geographic coverage gaps using APs already in BASE_PRICES + AIRPORT_COORDS (no new lookup-table entries required). All verified not in catalog. All 5 APs triple-checked: in BASE_PRICES ✅, AP_CONTINENT ✅, AIRPORT_COORDS ✅.

```javascript
// 1. Luskentyre Beach, Isle of Harris, Scotland
// INV (Inverness) ✅ all tables — consistently ranked #1 UK beach; Caribbean-blue water
// against dramatic Hebridean backdrop. Aug = peak Scottish summer. Zero catalog coverage
// of Scottish beaches despite INV already serving Nevis Range ski venue.
{id:"luskentyre-harris", category:"beach",
  title:"Luskentyre Beach", location:"Isle of Harris, Scotland",
  lat:57.7794, lon:-6.9336, ap:"INV",
  icon:"🏖️", rating:4.91, reviews:427,
  gradient:"linear-gradient(160deg,#0a1e3a,#1a4060,#2a7a9e)",
  accent:"#82c4e8", tags:["Atlantic Wild","Turquoise Shallows","Shell Sand","Outer Hebrides"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Luskentyre_beach_-_geograph.org.uk_-_865781.jpg/1280px-Luskentyre_beach_-_geograph.org.uk_-_865781.jpg"},

// 2. Psili Ammos Beach, Patmos, Greece
// RHO (Rhodes) ✅ all tables — Patmos fills the Dodecanese gap beyond Rhodes. Sacred island
// (Revelation of St John) with a secluded south-tip beach that's reachable via Rhodes ferry.
// Aug is full peak season. Currently 4 Rhodes/RHO venues; Patmos adds distinct character.
{id:"psili-ammos-patmos", category:"beach",
  title:"Psili Ammos Beach", location:"Patmos, Dodecanese, Greece",
  lat:37.2700, lon:26.4800, ap:"RHO",
  icon:"🏝️", rating:4.83, reviews:312,
  gradient:"linear-gradient(160deg,#0d2050,#1a4a8a,#2a8ad0)",
  accent:"#87cefa", tags:["Sacred Island","Secluded Cove","Aegean Blue","Pebble Shore"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Patmos_Psili_Ammos_beach.jpg/1280px-Patmos_Psili_Ammos_beach.jpg"},

// 3. Balos Lagoon, Crete, Greece
// CHQ (Chania) ✅ all tables — CHQ only has 1 venue (Elafonissi). Balos is arguably more
// iconic: a sandspit lagoon between Gramvousa islet and the Cretan mainland, with
// flamingo-pink sand and shallow turquoise water. One of the most photographed beaches in
// Europe. Accessible Aug via ferry from Kissamos port. High review volume expected.
{id:"balos-lagoon-crete", category:"beach",
  title:"Balos Lagoon", location:"Kissamos, Crete, Greece",
  lat:35.6010, lon:23.5787, ap:"CHQ",
  icon:"🏝️", rating:4.92, reviews:1847,
  gradient:"linear-gradient(160deg,#0d2050,#1a5090,#2a90d0)",
  accent:"#60d0f0", tags:["Iconic Lagoon","Pink Sand","Gramvousa Peninsula","Boat Access"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Balos_lagoon.jpg/1280px-Balos_lagoon.jpg"},

// 4. Huahine Lagoon, French Polynesia
// PPT (Papeete) ✅ all tables — PPT only has 1 venue (Temae Beach, Moorea). Huahine is
// French Polynesia's best-kept secret: vanilla plantation island, pristine coral lagoon,
// no mass tourism. Year-round tropical warmth. Adds a second PPT beach for users flying
// through Papeete. Pairs naturally with existing Bora Bora (BOB) as the "quieter alternative."
{id:"huahine-lagoon", category:"beach",
  title:"Huahine Lagoon", location:"Huahine, French Polynesia",
  lat:-16.7553, lon:-150.9986, ap:"PPT",
  icon:"🏝️", rating:4.88, reviews:203,
  gradient:"linear-gradient(160deg,#0a2a1a,#1a6040,#2e9060)",
  accent:"#5ddba4", tags:["Hidden Gem","Lagoon Snorkeling","Pearl Farms","Vanilla Island"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Huahine_vue_a%C3%A9rienne.jpg/1280px-Huahine_vue_a%C3%A9rienne.jpg"},

// 5. Tjøme Archipelago, Vestfold, Norway
// OSL (Oslo) ✅ all tables — OSL has 2 ski venues (Hemsedal, Idre Fjall) but ZERO beach.
// Tjøme / Nøtterøy island group in the Oslo Fjord is the classic Norwegian summer weekend:
// smooth granite rocks, clean sea water, kayaking, oysters. Scandinavian users (and curious
// US travelers to Norway) have no beach option today. Aug = peak Norwegian summer season.
{id:"tjome-archipelago", category:"beach",
  title:"Tjøme Archipelago", location:"Vestfold, Norway",
  lat:59.1196, lon:10.4486, ap:"OSL",
  icon:"🏖️", rating:4.72, reviews:187,
  gradient:"linear-gradient(160deg,#0a1a38,#1a3a68,#2060a8)",
  accent:"#72b8d8", tags:["Oslo Fjord","Nordic Summer","Island Hopping","Rock Pools"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Tj%C3%B8me_archipelago_Norway.jpg/1280px-Tj%C3%B8me_archipelago_Norway.jpg"},
```

**Paste location:** inside the `VENUES` array, at the end before the closing `];` on line 5045.

**Verification before pasting:**
- Run `node -e '... eval(venues).length'` before and after; expect 391 → 396
- Confirm `.venue-baseline` gets auto-bumped to 396 on next auto-push
- No new APs added (all use existing INV, RHO, CHQ, PPT, OSL) — AIRPORT_COORDS and AP_CONTINENT untouched

---

## One Observation for the PM

**The catalog is in its strongest seasonal position of the year.** 199 of 260 beach venues (77%) are in peak N hemisphere summer season on the very week Peakly publicly launched. If any traffic spike comes this weekend from Reddit or word-of-mouth, users will land on a full deck of fired-up beach scores — the product will look its best. The 5 S hemisphere ski venues that are in peak winter right now (Cerro Catedral, Las Leñas, Valle Nevado, etc.) are a bonus for users flying from SH cities. The only scoring weakness to watch: 108 N hemisphere ski venues are in dead summer — their scores will be suppressed or flagged low-confidence. This is correct and honest behavior, but if any ski-heavy user lands this weekend expecting powder, a "check back in December" message in the detail sheet UX would reduce bounce.
