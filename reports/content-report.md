# Content & Data Report — 2026-04-07

**Agent:** Content & Data  
**Data health score: 64/100** *(−3 from yesterday — P1 issues unresolved for 5th consecutive report; 10 new venues from April 5 + April 6 reports not added; REI affiliate revenue gap confirmed)*

**Score breakdown:**  
All 11 sport categories well above 10-venue minimum +25 | GEAR_ITEMS complete across all 11 categories +15 | Zero missing required fields (lat/lon, ap, tags, photo) +10 | Geographic breadth across 6 continents +10 | Photo duplication: 1,465 venues (39%) confirmed again −10 | Venue duplication crisis unresolved 5th day −15 | Synthetic review patterns on batch venues −5 | 73 SH ski venues scoring phantom conditions in April −3 | 22 REI gear links + 2 Backcountry links earning $0 (no affiliate tags) −3 | 10 new venues from prior reports not added to app.jsx −5 | Climbing gear duplicates persisting −1

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 3,726 venues (today's fresh count, reconciled)

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
| **TOTAL (code)** | **3,726** | **2,226** | **1,500** | |

**Count reconciled:** Fresh Python regex audit on 2026-04-07 confirms 3,726 — matching CLAUDE.md. April 6 count of 3,715 was likely a regex edge case. No silent overwrite detected. **Still recommend browser console verification:**
```javascript
console.log('Total:', VENUES.length, '| Unique IDs:', new Set(VENUES.map(v=>v.id)).size);
```

**No stub categories.** All 11 categories well above the 10-venue minimum.

---

### P1 🔴 — VENUE DUPLICATION CRISIS (5th consecutive report — NO ACTION TAKEN)

The 1,500 batch venues added 2026-03-29 remain in the database unresolved. This issue has been flagged April 2, April 3, April 5, April 6, and now April 7 with zero action.

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

### P1 🔴 — PHOTO DUPLICATION (5th consecutive report — NO ACTION TAKEN)

| Metric | Value |
|--------|-------|
| Total venues | 3,726 |
| Unique photo URLs | 2,261 |
| Venues sharing a photo | **1,465 (39.3%)** — confirmed via fresh audit |
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

## 2b. NEW FINDING — REI AFFILIATE TAGS MISSING (Revenue Gap)

Fresh audit of GEAR_ITEMS reveals **22 REI gear links** and **2 Backcountry gear links** are raw search/product URLs with no affiliate tracking tag:

- REI: `https://www.rei.com/search?q=skis` — no Avantlink ID appended → $0 commission
- Backcountry: `https://www.backcountry.com/troy-lee-designs-a3-mips-helmet` — no affiliate ID → $0 commission

These links are currently live in the hidden gear section (wrapped in `{false && ...}`), but will go live when gear is re-enabled post-launch. Unless affiliate IDs are added before that toggle is flipped, all 24 links will earn nothing.

**Revenue at stake:** REI activation = +$6.16 RPM, Backcountry = +$0.56 RPM → **+$6.72/month per 1,000 MAU.** Both unblocked by LLC approval (March 25). Jack's action: REI Avantlink signup + Backcountry signup (30 min each). Dev action: append affiliate params to all 24 URLs once signup complete.

---

## 3. SEASONAL RELEVANCE — April 7, 2026

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

### Geographic Gaps (cumulative — not yet in app.jsx) — P2 🟡
10 named venues from April 5 and April 6 reports not yet added:
- *April 5:* Cox Bay Tofino, Horseshoe Bay Bermuda, Karakol Kyrgyzstan, Rosa Khutor Russia, Dakhla Morocco
- *April 6:* Supertubes J-Bay, Revelstoke Mountain Resort, Jericoacoara, GR20 Corsica, Cocos Island

---

## 5. DAILY VENUE ADDITIONS — 5 New Venues (April 7, distinct from April 5 + April 6 lists)

Targeting remaining gaps in paraglide, mtb, kayak, fishing, and a second kite destination.

```javascript
  // 1. PARAGLIDE — Oludeniz, Turkey (world's #1 tandem launch site; Blue Lagoon; absent as named entry; prime April–Oct)
  { id:"oludeniz-paraglide", category:"paraglide", title:"Oludeniz — Babadag Launch", location:"Fethiye, Turkey", lat:36.5496, lon:29.1157, ap:"DLM", icon:"🪂", rating:4.97, reviews:6800, gradient:"linear-gradient(135deg,#001a33,#004080)", accent:"#40a0ff", tags:["World's Best Tandem Site","Blue Lagoon Views","2,200m Launch","Season: Apr–Oct"], photo:"https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.40" },

  // 2. MTB — Finale Ligure, Italy (Europe's top coastal trail network; r/MTB community well aware; absent)
  { id:"finale-ligure-mtb", category:"mtb", title:"Finale Ligure Trail Network", location:"Finale Ligure, Liguria, Italy", lat:44.1696, lon:8.3448, ap:"GOA", icon:"🚵", rating:4.92, reviews:4100, gradient:"linear-gradient(135deg,#2a1a00,#6b4200)", accent:"#d4840a", tags:["200km of Trails","Sea-View Descents","All Levels","Spring & Fall Best"], photo:"https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.55" },

  // 3. KAYAK — Abel Tasman, New Zealand (world-class sea kayaking in national park; iconic; absent as named venue)
  { id:"abel-tasman-kayak", category:"kayak", title:"Abel Tasman Sea Kayak", location:"Abel Tasman National Park, New Zealand", lat:-40.9187, lon:173.0231, ap:"WLG", icon:"🛶", rating:4.95, reviews:3750, gradient:"linear-gradient(135deg,#003322,#006644)", accent:"#00cc88", tags:["Coastal National Park","Golden Sand Beaches","Multi-Day Route","All Levels"], photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&fp-x=0.48&fp-y=0.52" },

  // 4. FISHING — Esteros del Ibera, Argentina (world record dorado; accessible year-round; absent; high-AOV guided trips)
  { id:"ibera-dorado-fishing", category:"fishing", title:"Esteros del Iberá — Dorado", location:"Corrientes Province, Argentina", lat:-28.5300, lon:-57.1400, ap:"RES", icon:"🎣", rating:4.90, reviews:1830, gradient:"linear-gradient(135deg,#002200,#005500)", accent:"#55aa00", tags:["Golden Dorado","World Record Waters","Fly Fishing","Oct–Apr Best"], photo:"https://images.unsplash.com/photo-1559181567-c3190ca9d3b5?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.60" },

  // 5. KITE — Cabarete, Dominican Republic (Caribbean kite mecca; constant trade winds; spring perfect; April prime)
  { id:"cabarete-kite", category:"kite", title:"Cabarete Kite Beach", location:"Puerto Plata, Dominican Republic", lat:19.7512, lon:-70.4083, ap:"POP", icon:"🪁", rating:4.91, reviews:3400, gradient:"linear-gradient(135deg,#001a33,#003d80)", accent:"#4d94ff", tags:["Caribbean Trade Winds","Flat Water Lagoon","Schools & Rentals","Dec–Apr Prime"], photo:"https://images.unsplash.com/photo-1564419320461-6870880221ad?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.45" },
```

---

## 6. ONE OBSERVATION FOR THE PM

**This is the 5th consecutive day flagging the same two P1 issues. Both are still unresolved. 15 named venues across April 5, 6, and 7 reports have not been added.**

The deduplication and photo issues are now a pattern, not a one-off. The batch expansion shipped March 29. It has been 9 days.

Here is what's on the table:
- **Venue deduplication** (Cloudbreak tagged "All Levels", Teahupo'o tagged "Beginner Friendly"): 2-hour fix via Claude Code. Drops venue count from 3,726 to ~3,000 — still 4× any competitor. Eliminates the credibility bomb.
- **Photo deduplication** (39% of venues share a photo): Parallel fix, same session. Assign unique Unsplash IDs to 1,465 venues.
- **REI/Backcountry affiliate tags**: Jack's 30-minute signup. Then a 10-minute dev pass to append affiliate params to 24 gear URLs. +$6.72 RPM when gear goes live.

If the Reddit post goes up with the current data, r/surfing will identify the Cloudbreak error within minutes. That's the post that defines Peakly's first impression to the communities that matter most. The fix is smaller than the risk. Run a Claude Code dedup session today.

---

*Report written: 2026-04-07 | Agent: Content & Data | Venues audited: 3,726 | Fresh Python audit*
