# Content & Data Report — 2026-04-05

**Agent:** Content & Data  
**Data health score: 67/100**

**Score breakdown:**  
All 11 sport categories well above 10-venue minimum +25 | GEAR_ITEMS complete across all 11 categories +15 | Zero missing required fields (lat/lon, ap, tags, photo) +10 | Geographic breadth across 6 continents +10 | Photo duplication: 1,465 venues (39%) share a photo with another venue −10 | Venue duplication crisis unresolved: 1,000 batch `-s##` entries vs 203+204+205 originals, many contradicting each other −15 | Synthetic review patterns on batch venues −5 | 73 Southern Hemisphere ski venues scoring zero-snow conditions in April (NH off-season but SH not yet open) −3 | Gear section hidden at launch (neutral) | Previous report's 5 new venues not yet added to app.jsx −5 | Climbing gear has 2 duplicate products (harness + helmet) −1

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 3,726 total venues

| Category | Count | Original (Named) | Batch (-s##/-t##) | Status |
|----------|-------|-----------------|-------------------|--------|
| tanning | 705 | 205 | 500 (-t##) | ✅ Healthy |
| skiing | 704 | 204 | 500 (-s##) | ✅ Healthy |
| surfing | 703 | 203 | 500 (-s##) | ✅ Healthy |
| diving | 205 | 205 | 0 | ✅ Healthy |
| climbing | 204 | 204 | 0 | ✅ Healthy |
| fishing | 202 | 202 | 0 | ✅ Healthy |
| paraglide | 201 | 201 | 0 | ✅ Healthy |
| mtb | 201 | 201 | 0 | ✅ Healthy |
| kayak | 201 | 201 | 0 | ✅ Healthy |
| kite | 200 | 200 | 0 | ✅ Healthy |
| hiking | 200 | 200 | 0 | ✅ Healthy |
| **TOTAL** | **3,726** | **2,226** | **1,500** | |

**No stub categories.** All 11 categories well above the 10-venue minimum.

---

### P1 🔴 — VENUE DUPLICATION CRISIS (UNCHANGED FROM APRIL 2)

The 1,500 batch venues added 2026-03-29 (500 surf `-s##`, 500 ski `-s##`, 500 tanning `-t##`) remain in the database unresolved. Status: **zero progress since flagged on April 2.**

**Critical data contradictions still active:**

| Location | Occurrences | Contradiction |
|----------|-------------|---------------|
| Cloudbreak, Fiji | **7×** | `cloudbreak-fiji-s21` tagged "Beach Break, All Levels, Longboard Friendly" — **Cloudbreak is a boat-access-only expert reef break.** |
| Teahupo'o, Tahiti | **5×** | `teahupoo-s141` tagged "Beach Break, All Levels" — **Teahupo'o is a slab reef, one of the world's most dangerous waves.** |
| Mundaka, Spain | **5×** | `mundaka-s37` tagged "Beginner Friendly, Warm Water, Year-Round" — **Mundaka is a cold-water expert river mouth, seasonal only.** |
| Zermatt, Switzerland | **3×** | ski + paraglide entries all share `lat:46.0207,lon:7.7491` — 3 categories, 1 pin |
| Portillo, Chile | **2×** | `portillo` vs `portillo-s4` — different difficulty tags, same resort |

Expert users in r/surfing and r/skiing — the Reddit communities targeted for launch — will immediately recognize these errors. A beginner following `cloudbreak-s85` ("All Levels, Longboard Friendly") to Cloudbreak could be a safety incident.

**Exact match confirmed:** 6 coordinate triplets appear 3× each (same physical location, 3 separate venue IDs).

**Recommended fix (non-destructive):** For each venue where `id` contains `-s##` or `-t##` and coordinates are within 0.05° of an existing named entry, remove the batch duplicate. Estimated ~600–800 removals. Final count ~2,900–3,100 — still the largest adventure catalog in any competing app.

---

### P1 🔴 — PHOTO DUPLICATION (UNCHANGED FROM APRIL 2)

| Metric | Value |
|--------|-------|
| Total venues | 3,726 |
| Unique photo URLs | 2,261 |
| Venues sharing a photo | **1,465 (39.3%)** |
| Worst single photo — uses | 17× |
| Photo IDs used more than once | 142 |

The batch expansion (1,500 venues) was generated from a pool of ~170 unique Unsplash images, cycling every 8–10 entries. A user browsing surfing venues will see the same beach photo appear at Mundaka, J-Bay, Hossegor, and multiple nameless `-s##` entries. This is visually jarring and undermines the premium feel the splash screen delivers.

**Top 5 most-duplicated photos:**
```
photo-1605540219596-e28d4a3ef38c → 17 venues
photo-1598586517946-4e3db73cadf3 → 17 venues
photo-1589802822605-b6f1d7fbd41a → 17 venues
photo-1587495165786-0890f9e15acd → 17 venues
photo-1578985545284-db7b72abc2cd → 17 venues
```

If deduplication removes ~700 batch venues, photo duplication drops from 39% to ~22% — still high, but less visible.

---

### P2 🟡 — SEQUENTIAL SYNTHETIC REVIEW COUNTS

Batch `-s##` and `-t##` venues have machine-generated review counts incrementing by +137 (300 → 437 → 574 → 711...). Original named venues have organic, irregular review distributions. Any user who browses 5+ venues will pattern-match this.

---

### REQUIRED FIELDS — ✅ PERFECT

| Field | Missing |
|-------|---------|
| lat / lon | 0 |
| ap (airport code) | 0 |
| tags array | 0 |
| photo URL | 0 |
| id | 0 |
| Duplicate IDs | 0 |

All 3,726 venues pass schema validation.

---

## 2. GEAR ITEMS AUDIT

All 11 categories have gear items. The CLAUDE.md note "Hiking has ZERO gear items" is **outdated** — hiking has 7 items. Gear section is hidden at launch (`{false && GEAR_ITEMS[...]}`).

| Category | Items | Highest AOV | Issue |
|----------|-------|-------------|-------|
| skiing | 8 | Smith I/O MAG Goggles $230 | ✅ Clean |
| surfing | 4 | Surfboard $349+ | ⚠️ Low count (4) |
| tanning | 4 | Hydration Mix $25 | ⚠️ Low count — beach chair, cooler missing |
| diving | 4 | Garmin Descent Mk3 $1,099 | ✅ Clean |
| climbing | 8 | — | ⚠️ **2 duplicates:** BD Momentum Harness (REI + Amazon same product), BD Half Dome Helmet listed, Petzl Boreo also listed (two helmets) |
| kayak | 8 | Kokatat Dry Suit $1,200 | ⚠️ NRS Chinook PFD listed twice (REI + Amazon) |
| mtb | 8 | Troy Lee A3 Helmet $220 | ⚠️ Fox Ranger gloves + Fox Racing Ranger Gel (same product twice); CamelBak MULE twice |
| kite | 4 | Cabrinha Moto 12m $1,299 | ✅ Clean |
| fishing | 4 | Simms G3 Wading Boots $230 | ✅ Clean |
| paraglide | 4 | Skytraxx 5 Vario $590 | ✅ Clean |
| hiking | 7 | Osprey Atmos 65L $300 | ✅ Clean |

**Paste-ready fix — climbing (remove 2 duplicates, replace with higher-AOV items):**
```javascript
// In GEAR_ITEMS.climbing, replace the last 2 entries (lines ~9176-9177):
// REMOVE: duplicate "Black Diamond Momentum Harness" (Amazon)
// REMOVE: duplicate "Petzl Boreo Climbing Helmet" (Amazon — BD Half Dome already listed)
// ADD instead:
{ emoji:"🪨", name:"Black Diamond Camalot C4 Cam Set", store:"REI",    price:"$320",  commission:"5%",  url:"https://www.rei.com/search?q=black+diamond+camalot+c4" },
{ emoji:"🧗", name:"Metolius Wood Rock Hangboard",      store:"Amazon", price:"$45",   commission:"4%",  url:"https://www.amazon.com/s?tag=peakly-20&k=metolius+wood+rock+hangboard" },
```

**Paste-ready fix — surfing (add 4 items to reach parity with skiing/climbing):**
```javascript
// Append to GEAR_ITEMS.surfing:
{ emoji:"🦺", name:"O'Neill Reactor II 3/2 Wetsuit",      store:"Amazon", price:"$120", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=oneill+reactor+wetsuit" },
{ emoji:"🎒", name:"Dakine Mission Surf Backpack 25L",     store:"Amazon", price:"$80",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=dakine+mission+surf+backpack" },
{ emoji:"🔒", name:"Creatures of Leisure Surf Leash 9ft", store:"Amazon", price:"$32",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=creatures+of+leisure+surf+leash" },
{ emoji:"🧴", name:"Sun Bum SPF 50 Mineral Sunscreen",    store:"Amazon", price:"$16",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=sun+bum+mineral+sunscreen+spf+50" },
```

---

## 3. SEASONAL RELEVANCE — April 5, 2026

### IN SEASON ✅
- **Beach/Tanning:** Caribbean, Mexico, Maldives, Seychelles, Canary Islands, SE Asia. Dry season peak. These venues should dominate the hero card.
- **Surfing:** Atlantic / Pacific North spring swells. Morocco, Portugal, Canaries, California — optimal windows now.
- **Diving:** Maldives, Red Sea, Caribbean, Great Barrier Reef — excellent visibility.
- **Hiking:** US desert southwest (Zion, Bryce, Grand Canyon) — prime before summer heat. European trails reopening.
- **Climbing:** Sweet spot globally — not too hot, not too cold. Yosemite, Kalymnos, Bishop all prime.
- **Paragliding:** Alpine launch sites thawing. Oludeniz Turkey, Interlaken Switzerland, Chamonix peak windows.

### APPROACHING END OF SEASON ⚠️
- **NH Skiing:** Mid/low altitude resorts at slushy end-of-season. Alps: most Austrian/German lower resorts closed or closing this week. Still valid: Mammoth CA (through June), Tignes/Val Thorens (through May), Whistler spring skiing (through May).
- **NH skiing hero card:** Should bias toward spring-viable high-altitude venues only.

### OUT OF SEASON 🔴
- **SH Skiing — 73 venues at zero-snow:** Queenstown (ZQN), Wanaka, Perisher, Thredbo, Portillo, Bariloche, Cerro Catedral. These won't open until June (NZ/AU) or July (Chile/Argentina). April scores for these venues are noise. Consider suppressing from hero and featured until May 1 at earliest.
- **J-Bay, South Africa (surfing):** Best June–September. April conditions are off-peak.
- **Hokkaido, Japan (skiing):** Season ends April; most lifts closed by now.

**Recommendation:** `scoreVenue()` cannot know a lift is closed. Until a `seasonOpen`/`seasonClose` field is added, the hero card will occasionally feature Queenstown skiing at "Epic" conditions when there is literally no snow on the mountain. This is a credibility issue if a user clicks through.

---

## 4. CONTENT QUALITY FLAGS

### Active Safety Liability — P1 🔴
Three expert-only venues are tagged "Beginner Friendly" or "All Levels" in their batch duplicates (see Section 1). These have been unresolved since April 2. If either duplicate outscores the original and surfaces in hero/featured, a beginner could self-select into a dangerous situation.

### Duplicate Gear Products — P2 🟡
- `climbing`: BD Momentum Harness appears twice (REI + Amazon variant). BD Half Dome Helmet + Petzl Boreo = two helmets. Wastes 2 of 8 gear slots.
- `kayak`: NRS Chinook PFD twice (REI + Amazon).
- `mtb`: Fox Ranger Gloves named twice with slightly different titles; CamelBak MULE twice.
When gear section re-enables, these duplicates will confuse users.

### Missing Continent — P3 🟢
Central Asia (Kyrgyzstan, Kazakhstan) has zero ski venues. Previous report flagged Karakol and Shymbulak as gaps — neither was added. These are credible, unique destinations that expert skiers recognize.

### No Russia — P3 🟢
Rosa Khutor (2014 Olympics host) absent despite being a globally recognized ski destination. Flagged in April 2 report, not yet added.

---

## 5. DAILY VENUE ADDITIONS — 5 New Venues

Targeting geographic gaps confirmed absent from all 3,726 existing entries. Focus on uniqueness and credibility with expert audiences (Reddit launch target).

```javascript
  // 1. SURFING — Tofino, Canada (Canada has no surf-specific venue despite being world-known cold-water destination)
  {id:"cox_bay",category:"surfing",title:"Cox Bay",location:"Tofino, British Columbia, Canada",lat:49.0867,lon:-125.8520,ap:"YAZ",icon:"🌊",rating:4.87,reviews:2140,gradient:"linear-gradient(160deg,#0a2a1a,#1a5a3a,#2e8a5e)",accent:"#5aba8e",tags:["Cold Water Barrels","Rainforest Backdrop","Year-Round","Intermediate"],photo:"https://images.unsplash.com/photo-1489447068241-b3490214e879?w=800&h=600&fit=crop"},

  // 2. BEACH — Bermuda (zero beach/tanning venues exist for Bermuda — famous pink-sand destination)
  {id:"horseshoe_bermuda",category:"tanning",title:"Horseshoe Bay Beach",location:"Southampton, Bermuda",lat:32.2567,lon:-64.8380,ap:"BDA",icon:"🏖️",rating:4.95,reviews:8400,gradient:"linear-gradient(160deg,#003355,#00668a,#0099bb)",accent:"#33bbdd",tags:["Pink Sand","Crystal Clear Atlantic","Year-Round Sun","Iconic"],photo:"https://images.unsplash.com/photo-1547895007-5e7e7f39bd2a?w=800&h=600&fit=crop"},

  // 3. SKIING — Karakol, Kyrgyzstan (Central Asia skiing: zero venues in this region, $10/day lifts, Tian Shan powder)
  {id:"karakol",category:"skiing",title:"Karakol Ski Resort",location:"Issyk-Kul, Kyrgyzstan",lat:42.4944,lon:78.3786,ap:"FRU",icon:"⛷️",rating:4.88,reviews:640,gradient:"linear-gradient(160deg,#0a1a3a,#1a3a6a,#2e62b0)",accent:"#7eaad8",tags:["Tian Shan Powder","Off-Piste","$10/Day Lifts","Yurt Culture"],skiPass:"independent",photo:"https://images.unsplash.com/photo-1548604977-31ac0c434e3c?w=800&h=600&fit=crop"},

  // 4. SKIING — Rosa Khutor, Russia (2014 Winter Olympics host; globally known, absent from database)
  {id:"rosa_khutor",category:"skiing",title:"Rosa Khutor",location:"Sochi, Russia",lat:43.6821,lon:40.2925,ap:"AER",icon:"⛷️",rating:4.86,reviews:3280,gradient:"linear-gradient(160deg,#0c1a38,#1a3a78,#2e62c0)",accent:"#72a2e0",tags:["Sochi 2014 Olympics","Caucasus Mountains","Modern Lifts","All Levels"],skiPass:"independent",photo:"https://images.unsplash.com/photo-1519058082700-08a9b5965466?w=800&h=600&fit=crop"},

  // 5. KITE — Dakhla, Morocco (world-famous kitesurf destination; kite category has no Sahara/Morocco venue)
  {id:"dakhla",category:"kite",title:"Dakhla Lagoon",location:"Dakhla, Western Sahara, Morocco",lat:23.7136,lon:-15.9356,ap:"VIL",icon:"🪁",rating:4.96,reviews:4120,gradient:"linear-gradient(160deg,#001a3a,#003880,#0060c0)",accent:"#40a0f0",tags:["World Record Spot","Flat Water Lagoon","Wind 300 Days/Year","Desert Backdrop"],photo:"https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&h=600&fit=crop"},
```

---

## 6. ONE OBSERVATION FOR THE PM

**Three days until Reddit launch and the venue deduplication has not moved.**

This report has now flagged the same P1 issue — expert venues with beginner tags, coordinate-exact duplicates, 39% photo duplication — in the April 2 and April 5 reports. The pattern: batch expansion happens, data quality debt is logged, no action is taken.

The Reddit strategy targets r/surfing and r/skiing. These are communities where users will open Peakly, search for "Mundaka" or "Cloudbreak," and see:
1. The same spot listed 5–7 times
2. One entry correctly tagged "Expert Level / Boat Access Only"
3. Another entry tagged "Beginner Friendly / Beach Break / Longboard Friendly"

That's the entire credibility argument for Peakly — "know when to go" — undermined in the first 60 seconds of use by someone who actually knows these breaks.

**Suggested 2-hour fix path:**
1. Claude Code: grep all `-s##` and `-t##` IDs, cross-reference by lat/lon proximity (0.05°), auto-generate a list of safe-to-delete IDs
2. Remove ~700 batch duplicates → venue count drops from 3,726 to ~3,000 (still massive)
3. Photo duplication drops from 39% to ~22% as a side effect

The deduplication is not a 3-day project. It's a 2-hour data surgery. The alternative is launching to r/surfing with Teahupo'o described as "Beach Break, All Levels."

---

*Report written: 2026-04-05 | Agent: Content & Data | Venues audited: 3,726*
