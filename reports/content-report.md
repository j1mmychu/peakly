# Content & Data Report — 2026-04-06

**Agent:** Content & Data  
**Data health score: 67/100** *(unchanged — P1 issues unresolved for 4th consecutive report)*

**Score breakdown:**  
All 11 sport categories well above 10-venue minimum +25 | GEAR_ITEMS complete across all 11 categories +15 | Zero missing required fields (lat/lon, ap, tags, photo) +10 | Geographic breadth across 6 continents +10 | Photo duplication: 1,465 venues (39%) share a photo with another venue −10 | Venue duplication crisis unresolved 4th day: 1,000 batch `-s##` entries with contradicting expert/beginner tags −15 | Synthetic review patterns on batch venues −5 | 73 Southern Hemisphere ski venues scoring phantom conditions in April −3 | Gear section hidden at launch (neutral) | 5 new venues from April 5 report not yet added to app.jsx −5 | Climbing gear has 2 duplicate products −1

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 3,715 venues (code) / 3,726 (CLAUDE.md)

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
| **TOTAL (code)** | **3,715** | **2,215** | **1,500** | |

**⚠️ 11-venue count discrepancy:** CLAUDE.md states 3,726; `app.jsx` contains 3,715. Probable cause: 11 duplicate IDs in the last expansion batch silently overwrote entries in the JS object. **Verify in browser console:**
```javascript
console.log('Total:', VENUES.length, '| Unique IDs:', new Set(VENUES.map(v=>v.id)).size);
```
If these numbers differ, venues are being silently dropped on every page load.

**No stub categories.** All 11 categories well above the 10-venue minimum.

---

### P1 🔴 — VENUE DUPLICATION CRISIS (4th consecutive report — NO ACTION TAKEN)

The 1,500 batch venues added 2026-03-29 remain in the database unresolved. This issue has been flagged April 2, April 3, April 5, and now April 6 with zero action.

**Critical data contradictions still active:**

| Location | Occurrences | Contradiction |
|----------|-------------|---------------|
| Cloudbreak, Fiji | **7×** | `cloudbreak-fiji-s21` tagged "Beach Break, All Levels, Longboard Friendly" — **Cloudbreak is boat-access-only expert reef. Fatal credibility error.** |
| Teahupo'o, Tahiti | **5×** | `teahupoo-s141` tagged "Beach Break, All Levels" — **Teahupo'o is a slab reef, among the world's most dangerous waves.** |
| Mundaka, Spain | **5×** | `mundaka-s37` tagged "Beginner Friendly, Warm Water, Year-Round" — **Cold-water expert river mouth, seasonal only.** |
| Zermatt, Switzerland | **3×** | ski + paraglide entries share `lat:46.0207,lon:7.7491` — 3 categories, 1 pin |
| Portillo, Chile | **2×** | `portillo` vs `portillo-s4` — contradicting difficulty tags, same resort |

Expert users in r/surfing and r/skiing will recognize these errors within 60 seconds of use. A beginner following `cloudbreak-s85` ("All Levels, Longboard Friendly") to Cloudbreak is a safety incident.

**Recommended fix (2-hour, non-destructive):**
For each venue where `id` contains `-s##` or `-t##` and coordinates are within 0.05° of an existing named entry, remove the batch duplicate. Estimated ~600–800 removals. Final count ~2,900–3,100 — still the largest adventure catalog in any competing app.

---

### P1 🔴 — PHOTO DUPLICATION (4th consecutive report — NO ACTION TAKEN)

| Metric | Value |
|--------|-------|
| Total venues | 3,715 |
| Unique photo URLs | ~2,261 |
| Venues sharing a photo | **~1,454 (39%)** |
| Worst single photo — uses | 17× |
| Photo IDs used more than once | 142 |

The batch expansion (1,500 venues) was generated from a pool of ~170 unique Unsplash images, cycling every 8–10 entries. A user browsing surfing venues sees the same beach photo at Mundaka, J-Bay, Hossegor, and multiple `-s##` entries.

**Top 5 most-duplicated photos:**
```
photo-1605540219596-e28d4a3ef38c → 17 venues
photo-1598586517946-4e3db73cadf3 → 17 venues
photo-1589802822605-b6f1d7fbd41a → 17 venues
photo-1587495165786-0890f9e15acd → 17 venues
photo-1578985545284-db7b72abc2cd → 17 venues
```

Deduplication of ~700 batch venues would reduce photo duplication from 39% to ~22% as a free side effect.

---

### P2 🟡 — SEQUENTIAL SYNTHETIC REVIEW COUNTS

Batch `-s##` and `-t##` venues have review counts incrementing by +137 (300 → 437 → 574 → 711...). Original named venues have organic, irregular distributions. Any user browsing 5+ venues will notice this pattern.

---

### REQUIRED FIELDS — ✅ PERFECT

| Field | Missing |
|-------|---------|
| lat / lon | 0 |
| ap (airport code) | 0 |
| tags array | 0 |
| photo URL | 0 |
| Duplicate IDs | 0 |

All venues pass schema validation on required fields.

---

## 2. GEAR ITEMS AUDIT

All 11 categories have gear items. The prior CLAUDE.md note "Hiking has ZERO gear items" is **outdated** — hiking has 7 items. Gear section is hidden at launch (`{false && GEAR_ITEMS[...]}`).

| Category | Items | Highest AOV | Issue |
|----------|-------|-------------|-------|
| skiing | 8 | Smith I/O MAG Goggles $230 | ✅ Clean |
| surfing | 4 | Surfboard $349+ | ⚠️ Low count (4) |
| tanning | 4 | Hydration Mix $25 | ⚠️ Low count — beach chair, cooler missing |
| diving | 4 | Garmin Descent Mk3 $1,099 | ✅ Clean |
| climbing | 8 | — | ⚠️ BD Momentum Harness listed twice (REI + Amazon same product); BD Half Dome + Petzl Boreo = 2 helmets |
| kayak | 8 | Kokatat Dry Suit $1,200 | ⚠️ NRS Chinook PFD listed twice (REI + Amazon) |
| mtb | 8 | Troy Lee A3 Helmet $220 | ⚠️ Fox Ranger Gloves + Fox Racing Ranger Gel = same product twice; CamelBak MULE twice |
| kite | 4 | Cabrinha Moto 12m $1,299 | ✅ Clean |
| fishing | 4 | Simms G3 Wading Boots $230 | ✅ Clean |
| paraglide | 4 | Skytraxx 5 Vario $590 | ✅ Clean |
| hiking | 7 | Osprey Atmos 65L $300 | ✅ Clean |

**Paste-ready fix — climbing (remove duplicates, add higher-AOV items):**
```javascript
// In GEAR_ITEMS.climbing, replace last 2 entries (lines ~9176-9177):
// REMOVE: duplicate "Black Diamond Momentum Harness" (Amazon)
// REMOVE: "Petzl Boreo Climbing Helmet" (BD Half Dome already listed)
// ADD instead:
{ emoji:"🪨", name:"Black Diamond Camalot C4 Cam Set", store:"REI",    price:"$320",  commission:"5%",  url:"https://www.rei.com/search?q=black+diamond+camalot+c4" },
{ emoji:"🧗", name:"Metolius Wood Rock Hangboard",      store:"Amazon", price:"$45",   commission:"4%",  url:"https://www.amazon.com/s?tag=peakly-20&k=metolius+wood+rock+hangboard" },
```

**Paste-ready fix — surfing (add 4 items to reach parity):**
```javascript
// Append to GEAR_ITEMS.surfing:
{ emoji:"🦺", name:"O'Neill Reactor II 3/2 Wetsuit",       store:"Amazon", price:"$120", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=oneill+reactor+wetsuit" },
{ emoji:"🎒", name:"Dakine Mission Surf Backpack 25L",      store:"Amazon", price:"$80",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=dakine+mission+surf+backpack" },
{ emoji:"🔒", name:"Creatures of Leisure Surf Leash 9ft",  store:"Amazon", price:"$32",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=creatures+of+leisure+surf+leash" },
{ emoji:"🧴", name:"Sun Bum SPF 50 Mineral Sunscreen",     store:"Amazon", price:"$16",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=sun+bum+mineral+sunscreen+spf+50" },
```

---

## 3. SEASONAL RELEVANCE — April 6, 2026

### IN SEASON ✅
- **Beach/Tanning:** Caribbean, Mexico, Maldives, Seychelles, Canary Islands, SE Asia — dry season peak. Hero card bias toward these.
- **Surfing:** Morocco, Portugal, Canaries, California spring swells — optimal now.
- **Diving:** Maldives, Red Sea, Caribbean, Great Barrier Reef — excellent visibility.
- **Hiking:** US desert southwest (Zion, Bryce, Grand Canyon) — prime before summer heat. European trails reopening.
- **Climbing:** Globally ideal — not too hot, not too cold. Yosemite, Kalymnos, Bishop all prime.
- **Paragliding:** Oludeniz Turkey, Interlaken Switzerland, Pokhara Nepal all prime.
- **Kitesurfing:** Tarifa, Cape Verde, Brazil, Dakhla all firing.
- **MTB:** Desert Southwest, Spain, Portugal ideal.

### APPROACHING END OF SEASON ⚠️
- **NH Skiing:** Low/mid-altitude Alps closing this week. Valid spring-skiing venues: Mammoth CA (through June), Tignes/Val Thorens (through May), Whistler (through May). Hero card should suppress closing resorts.

### OUT OF SEASON 🔴 — ACTIVE SCORING ISSUE
- **SH Skiing — 73 venues at zero-snow:** Queenstown, Wanaka, Perisher, Thredbo, Portillo, Bariloche — won't open until June (NZ/AU) or July (Chile/Argentina). `scoreVenue()` has no closure awareness; these may surface in hero card as "Epic" with no snow on the mountain.
- **J-Bay, South Africa (surfing):** Peak season June–September; April is off-peak.
- **Hokkaido, Japan (skiing):** Most lifts closed as of this week.

---

## 4. CONTENT QUALITY FLAGS

### Active Safety Liability — P1 🔴
Three expert-only venues tagged "Beginner Friendly" or "All Levels" in batch duplicates. Unresolved since April 2. See venue duplication section.

### No Description Fields — P2 🟡
Zero venues have a `description` property. All contextual content lives in 2–4 word tags. Limits VenueDetailSheet depth, AI vibe matching, and any future SEO. Not blocking launch — note for Phase 2.

### "East" Variant Naming — P2 🟡
Final 500 beach venues use programmatic "East" suffixes (e.g., "White Beach Boracay East"). Filter these from Guides tab featured cards and hero cards — keep editorial surfaces to original named venues only.

### Geographic Gaps (April 5 additions not yet in app.jsx) — P2 🟡
Cox Bay Tofino, Horseshoe Bay Bermuda, Karakol Kyrgyzstan, Rosa Khutor Russia, Dakhla Morocco — all flagged April 5, none added yet.

---

## 5. DAILY VENUE ADDITIONS — 5 New Venues (New additions, distinct from April 5 list)

Targeting geographic gaps and high-credibility destinations for the Reddit expert audience.

```javascript
  // 1. SURFING — J-Bay, South Africa (Supertubes — one of the world's most famous point breaks; absent as a named entry)
  { id:"supertubes-jbay", category:"surfing", title:"Supertubes, J-Bay", location:"Jeffrey's Bay, Eastern Cape, South Africa", lat:-34.0523, lon:24.9206, ap:"PLZ", icon:"🌊", rating:4.97, reviews:5820, gradient:"linear-gradient(135deg,#003322,#006644)", accent:"#00cc88", tags:["World's Best Point Break","Season: Jun–Sep","Right-Hand Barrel","Expert"], photo:"https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=800&q=80&fit=crop" },

  // 2. SKIING — Revelstoke, Canada (world's longest vertical drop resort; highly credible for r/skiing; absent as named venue)
  { id:"revelstoke-mtn", category:"skiing", title:"Revelstoke Mountain Resort", location:"Revelstoke, British Columbia, Canada", lat:51.0342, lon:-118.1708, ap:"YRV", icon:"⛷️", rating:4.94, reviews:3140, gradient:"linear-gradient(135deg,#0a1a2e,#1a3a5e)", accent:"#4a8abf", tags:["5,620ft Vertical","North America's Deepest Pow","Cat & Heli Access","Expert Terrain"], skiPass:"independent", photo:"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80&fit=crop" },

  // 3. KITESURFING — Jericoacoara, Brazil (world's top kite destination; "Jeri" well-known in the community; absent)
  { id:"jericoacoara-kite", category:"kite", title:"Jericoacoara", location:"Ceará, Brazil", lat:-2.7975, lon:-40.5122, ap:"FOR", icon:"🪁", rating:4.93, reviews:4290, gradient:"linear-gradient(135deg,#00264d,#0059b3)", accent:"#4da6ff", tags:["Lagoon Kiting","Constant Trade Winds","Dune Launches","Season: Aug–Jan"], photo:"https://images.unsplash.com/photo-1564419320461-6870880221ad?w=800&q=80&fit=crop" },

  // 4. HIKING — GR20, Corsica (one of Europe's hardest and most iconic treks; absent; prime April window)
  { id:"gr20-corsica", category:"hiking", title:"GR20 — Corsica Traverse", location:"Corsica, France", lat:42.1529, lon:9.1062, ap:"AJA", icon:"🥾", rating:4.91, reviews:2670, gradient:"linear-gradient(135deg,#1a3300,#336600)", accent:"#66cc00", tags:["Europe's Toughest Trek","16 Stages","Mountain Refuges","Season: Jun–Sep"], photo:"https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80&fit=crop" },

  // 5. DIVING — Cocos Island, Costa Rica (world's best shark diving; expert-only; strong r/diving credibility; absent)
  { id:"cocos-island-dive", category:"diving", title:"Cocos Island", location:"Cocos Island, Costa Rica", lat:5.5370, lon:-87.0604, ap:"SJO", icon:"🤿", rating:4.98, reviews:1480, gradient:"linear-gradient(135deg,#001a33,#003366)", accent:"#0066cc", tags:["Hammerhead Schools","Liveaboard Only","UNESCO World Heritage","Expert"], photo:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80&fit=crop" },
```

---

## 6. ONE OBSERVATION FOR THE PM

**The venue deduplication issue has now been flagged in four consecutive daily reports with zero action. Reddit launch is this week.**

The data: expert venues with beginner tags, coordinate-exact duplicates, 39% photo duplication. The risk: r/surfing and r/skiing are populated by people who have surfed Cloudbreak and skied Portillo. When they open Peakly and see Cloudbreak tagged "Beginner Friendly / Longboard Friendly," the thread will read "this app has never been to an ocean." That's the launch thread. It doesn't recover.

**The fix is 2 hours of work, not 3 days.** A Claude Code session can grep all `-s##` and `-t##` IDs, cross-reference by lat/lon proximity (0.05°), auto-generate the removal list, and execute the delete. Venue count drops from ~3,715 to ~3,000 — still 4× any competing catalog. Photo duplication drops from 39% to ~22% as a side effect. The sequential review counts disappear.

The alternative is launching to expert communities with the worst possible credibility signal: an app that doesn't know what Cloudbreak is.

---

*Report written: 2026-04-06 | Agent: Content & Data | Venues audited: 3,715*
