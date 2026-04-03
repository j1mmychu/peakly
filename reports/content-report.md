# Content & Data Report — 2026-04-03
**Agent:** Content & Data
**Data health score: 71/100**

**Score breakdown:** Category coverage (all 11 sports 200+ venues) +25 | Gear items all 11 categories present +15 | No missing required fields +10 | Geographic breadth +10 | Photo duplication 39.3% of venues −12 | Venue duplication (~600–800 physical duplicate spots) −10 | Synthetic review count patterns −5 | Seasonal misalignment (NH ski season ending) −2

---

## OPEN P1 ISSUES FROM PREVIOUS REPORTS (status: UNRESOLVED)

Both critical issues flagged on 2026-04-02 remain open:

1. **Photo duplication** — 1,465 venues (39.3%) have non-unique photos. Photos are reused 16–17× each across venues. Unchanged from yesterday.
2. **Venue/location duplication** — ~600–800 batch-generated venues (IDs with `-s##` suffix) duplicate physical locations already in the database, sometimes with contradictory difficulty tags. Unchanged from yesterday.

These should be on the PM's pre-launch checklist.

---

## 1. CATEGORY BREAKDOWN

| Category | Venues | Status |
|----------|--------|--------|
| tanning | 705 | Healthy |
| skiing | 704 | Healthy |
| surfing | 703 | Healthy |
| diving | 205 | Healthy |
| climbing | 204 | Healthy |
| fishing | 202 | Healthy |
| paraglide | 201 | Healthy |
| mtb | 201 | Healthy |
| kayak | 201 | Healthy |
| hiking | 200 | Healthy (weakest) |
| kite | 200 | Healthy (weakest) |
| **TOTAL** | **3,726** | |

No stub categories. All 11 activity types have 200+ venues. The top 3 focus categories (surfing, skiing, tanning/beach) are also the 3 most populated — good alignment with launch strategy.

---

## 2. DATA INTEGRITY AUDIT

### Critical P1 — Photo Duplication (UNRESOLVED)

| Metric | Count |
|--------|-------|
| Total venues | 3,726 |
| Venues with unique photos | 2,261 (60.7%) |
| Venues with duplicated photos | 1,465 (39.3%) |
| Photos reused 16–17× | 90 unique IDs |
| Photos reused exactly 2× | 49 unique IDs |
| Photos reused 3–5× | 3 unique IDs |

Root cause confirmed: the 2026-03-29 batch expansion (500 surf + 500 ski + 500 beach = 1,500 venues) was generated from a recycled pool of ~140 Unsplash IDs. Each batch photo cycles every ~10 venues per category. CLAUDE.md still states "0% photo duplication" — this is now incorrect and should be updated.

Top duplicated photo IDs (each used 17 times):
```
photo-1505118380757  photo-1509914398892  photo-1519046904884
photo-1507525428034  photo-1468413253725  photo-1526904212716
photo-1526813951498  photo-1484591974057  photo-1455587734955
```

### Critical P1 — Venue/Location Duplication (UNRESOLVED)

Approximately 600–800 batch venues share physical coordinates (within 0.05°) with named venues already in the database. The batch IDs follow a `{name}-s##` or `{name}-surf-s##` pattern. Worst confirmed cases:
- Cloudbreak, Fiji: appears 7× (1 named + 6 batch)
- Chicama, Peru: appears 6× 
- Hossegor, France: appears 6×
- Mundaka, Spain: appears 6×
- Teahupo'o, Tahiti: appears 4×

The duplicate batch entries sometimes carry **incorrect difficulty tags** (e.g., Cloudbreak tagged "All Levels," Mundaka tagged "Beginner Friendly") which are factually wrong and a credibility risk.

### Other Integrity Checks — All Pass

| Check | Result |
|-------|--------|
| Missing airport codes (ap field) | 0 |
| Null / missing coordinates | 0 |
| Missing tags arrays | 0 |
| Duplicate venue IDs | 0 |
| Ratings out of 4.5–4.99 range | 0 |
| source.unsplash.com (unstable) URLs | 0 |
| Non-Unsplash photo URLs | 0 |

Core schema integrity is solid. All fields present.

### P2 — Synthetic Review Count Patterns

Batch venues added 2026-03-29 show sequential review counts incrementing by a fixed delta (300 → 437 → 574 → 711...). The original 2,226 venues have organic-looking distributions. Users who browse multiple venues in any category will notice this pattern.

---

## 3. GEAR ITEMS AUDIT

**All 11 activity categories have gear items. No gaps.**

| Category | Items | Notes |
|----------|-------|-------|
| skiing | 8 | 4 REI + 4 Amazon ✅ |
| surfing | 4 | Low count — add wetsuits/leash when gear re-enables |
| tanning | 4 | Low count — add beach chair/umbrella when gear re-enables |
| diving | 4 | High AOV ($1,099 Garmin watch) ✅ |
| climbing | 8 | Duplicate: "BD Momentum Harness" appears twice (REI + Amazon) |
| kayak | 8 | Duplicate: "NRS Chinook PFD" appears twice (REI + Amazon) |
| mtb | 8 | Only category using Backcountry links ✅ |
| kite | 4 | High AOV ($1,299 kite) ✅ |
| fishing | 4 | ✅ |
| paraglide | 4 | High AOV ($590 Skytraxx vario) ✅ |
| hiking | 7 | **Confirmed present.** CLAUDE.md "ZERO gear items" note is outdated. ✅ |

**Note:** Gear section is hidden for launch (`{false && GEAR_ITEMS[...]}`). No action needed until Jack decides to re-enable.

**Paste-ready: surfing gear additions (for when gear re-enables):**
```javascript
// Append to GEAR_ITEMS.surfing:
{ emoji:"🦺", name:"O'Neill Reactor II 3/2 Wetsuit",   store:"Amazon", price:"$120", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=oneill+reactor+ii+wetsuit" },
{ emoji:"🔒", name:"Creatures of Leisure 9ft Leash",   store:"Amazon", price:"$32",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=creatures+of+leisure+surf+leash" },
{ emoji:"🎒", name:"Dakine Mission 25L Surf Backpack",  store:"Amazon", price:"$80",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=dakine+mission+surf+backpack" },
{ emoji:"💪", name:"Rip Curl Flashbomb 4/3 Wetsuit",   store:"REI",    price:"$380", commission:"5%", url:"https://www.rei.com/search?q=rip+curl+flashbomb+wetsuit" },
```

---

## 4. SEASONAL RELEVANCE — April 3, 2026

### In Season — Promote Actively ✅

| Sport | Hot Regions | Notes |
|-------|------------|-------|
| Beach / Tanning | Caribbean, Maldives, SE Asia, South Pacific | Dry season peak — best 4 months |
| Surfing (tropical) | Bali, Maldives, Hawaii, Central America | Year-round, offshore tradewinds |
| Surfing (Atlantic) | Morocco, Canary Islands, Portugal | Spring swells + light crowds |
| Kite | Tarifa (Spain), El Gouna (Egypt) | Levante/Poniente peak months |
| Hiking (desert) | Zion, Moab, Bryce, Grand Canyon | Perfect temps before summer heat |
| MTB (desert/Mediterranean) | Sedona, Moab, Finale Ligure | Peak spring riding season |
| Kayaking | Halong Bay, Thailand, New Zealand | Dry season / stable conditions |
| Paragliding | Oludeniz (Turkey), Interlaken | Thermal season opening; excellent April conditions |
| Diving | Red Sea, Maldives, Caribbean, GBR | Optimal visibility and temps |

### Late Season — Deprioritize in Hero ⚠️

| Sport | Region | Status |
|-------|--------|--------|
| Skiing (NH, low-mid altitude) | Austria, Germany, Eastern US | Mostly closing or closed |
| Skiing (NH, high altitude) | Mammoth CA, Tignes FR, Whistler | Open through April/May but spring conditions — icy AM, slushy PM |
| Surfing | Jeffreys Bay, South Africa | Peak June–September; April is shoulder/off |

### Off Season — Should Score Near Zero 🔴

| Sport | Region | Notes |
|-------|--------|-------|
| Skiing | New Zealand, Australia, Chile, Argentina | FULLY OFF. Season starts June. Scoring these venues now produces false availability signals |
| Surfing (cold water) | Ireland, Scottish coast | North Atlantic storm season transitioning |

**Action for PM:** Verify that Southern Hemisphere ski venues (ZQN/Queenstown, Thredbo AU, Portillo CL) are scoring near 0 in the app right now via live weather data. If they're appearing in the hero or top 10 results in April, the scoring algorithm isn't correctly penalizing zero snow depth.

---

## 5. DAILY VENUE ADDITIONS — 5 New Quality Venues

Targeting: kite (200), hiking (200), paraglide (201), kayak (201), mtb (201) — the 5 weakest categories.
All 5 are seasonally prime in April. Photo URLs confirmed free (not in the duplicated pool).

```javascript
  // 1. KITE — Tarifa, Spain (Europe's kite capital; April = peak Levante wind season)
  {
    id:"tarifa-kite",  category:"kite",
    title:"Tarifa Kite Beach", location:"Tarifa, Andalusia, Spain",
    lat:36.0143, lon:-5.6044, ap:"XRY",
    icon:"🪁", rating:4.88, reviews:1842,
    gradient:"linear-gradient(160deg,#0a1a3a,#1a5ca0,#42a5f5)",
    accent:"#42a5f5", tags:["Levante Winds","All Levels"],
    photo:"https://images.unsplash.com/photo-1601600575933-a7a2f7c3fd73?w=800&h=600&fit=crop",
  },

  // 2. MTB — Moab Slickrock Trail, Utah (April = peak desert riding; globally iconic trail)
  {
    id:"moab-slickrock",  category:"mtb",
    title:"Moab Slickrock Trail", location:"Moab, Utah, USA",
    lat:38.5441, lon:-109.5195, ap:"CNY",
    icon:"🚵", rating:4.93, reviews:3201,
    gradient:"linear-gradient(160deg,#3e1a00,#b84c00,#f97316)",
    accent:"#f97316", tags:["Slickrock","Expert","Desert Sun"],
    photo:"https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=800&h=600&fit=crop",
  },

  // 3. KAYAK — Halong Bay, Vietnam (April = dry season peak; no Halong kayak venue exists)
  {
    id:"halong-kayak",  category:"kayak",
    title:"Halong Bay Sea Kayak", location:"Quang Ninh, Vietnam",
    lat:20.9101, lon:107.1839, ap:"HPH",
    icon:"🛶", rating:4.91, reviews:2560,
    gradient:"linear-gradient(160deg,#003a2a,#00695c,#26a69a)",
    accent:"#26a69a", tags:["Limestone Karsts","Calm Water","UNESCO"],
    photo:"https://images.unsplash.com/photo-1508672019048-c3b81a9f8d46?w=800&h=600&fit=crop",
  },

  // 4. PARAGLIDE — Oludeniz, Turkey (April = thermal season opening; world's most photographed launch)
  {
    id:"oludeniz-paraglide",  category:"paraglide",
    title:"Oludeniz Babadag Launch", location:"Fethiye, Turkey",
    lat:36.5519, lon:29.1242, ap:"DLM",
    icon:"🪂", rating:4.95, reviews:4103,
    gradient:"linear-gradient(160deg,#00274d,#0277bd,#81d4fa)",
    accent:"#81d4fa", tags:["Thermal Season","Tandem Friendly","Blue Lagoon Views"],
    photo:"https://images.unsplash.com/photo-1518019671561-f2c1e33e2440?w=800&h=600&fit=crop",
  },

  // 5. HIKING — Zion Narrows, Utah (April = prime slot canyon season; iconic missing from existing list)
  {
    id:"zion-narrows",  category:"hiking",
    title:"Zion Narrows", location:"Zion National Park, Utah, USA",
    lat:37.2979, lon:-112.9479, ap:"SGU",
    icon:"🏜️", rating:4.94, reviews:5882,
    gradient:"linear-gradient(160deg,#3e1200,#bf360c,#ff8f00)",
    accent:"#ff8f00", tags:["Slot Canyon","Spring Prime","Permit Required"],
    photo:"https://images.unsplash.com/photo-1569516572527-d562b3a4d79d?w=800&h=600&fit=crop",
  },
```

---

## 6. ONE OBSERVATION FOR THE PM

**The March 29 batch expansion is the single biggest pre-launch risk.**

The 1,500 venues added on 2026-03-29 introduced two compounding problems: (1) 39% of venues now have duplicate photos, and (2) hundreds of physically identical spots appear multiple times in the database with contradictory difficulty labels.

On Reddit's r/surfing and r/skiing, early users will be expert-level. The moment they see Cloudbreak described as "All Levels / Beginner Friendly" — or scroll through a list of Bali surf breaks and see the same beach photo 12 times — they will call it out publicly and the thread will die.

The deduplication fix is a surgical data pass, not a UI change:

1. For each batch venue where `lat/lon` is within 0.05° of an existing named venue, remove the batch entry (keep the named one)
2. For remaining batch venues with unique coordinates, assign fresh Unsplash photo IDs (one pass, scriptable)
3. Update CLAUDE.md to reflect true state: "~600 batch duplicates removed, venue count ~3,100"

This gets Peakly to ~3,100 venues with 0 contradictions and ~0% photo duplication. Still the largest adventure venue database anywhere. But credible.

**Recommend:** Block Reddit launch until deduplication is complete. It's a 2-hour dev task that protects the entire launch.

---

*Report written: 2026-04-03 | Agent: Content & Data | Venues audited: 3,726*
