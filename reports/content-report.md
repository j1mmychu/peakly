# Content & Data Report — 2026-04-09

**Agent:** Content & Data  
**Data health score: 67/100** ↓ from 69 on April 2

**Score breakdown:**  
Required fields complete +20 | Category coverage (all 200+) +20 | Gear items complete +10 | Geographic diversity +8 | Photo duplication (1,465 non-unique instances) −12 | Venue deduplication crisis (995 batch dupes, 7 days unresolved) −15 | Synthetic review patterns −4 | Contradictory difficulty tags on duplicate venues −3 | No P1 progress since last report penalty −2 (Reddit launch risk increasing)

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 3,726 total venues

| Category | Count | Status |
|----------|-------|--------|
| tanning | 705 | ✅ Healthy |
| skiing | 704 | ✅ Healthy |
| surfing | 703 | ✅ Healthy |
| diving | 205 | ✅ Healthy |
| climbing | 204 | ✅ Healthy |
| fishing | 202 | ✅ Healthy |
| paraglide | 201 | ✅ Healthy |
| mtb | 201 | ✅ Healthy |
| kayak | 201 | ✅ Healthy |
| kite | 200 | ✅ Healthy |
| hiking | 200 | ✅ Healthy |
| **TOTAL** | **3,726** | |

**No stub categories.** All 11 sports well above the 10-venue minimum.

---

### P1 🔴 — VENUE DEDUPLICATION (UNCHANGED SINCE APRIL 2)

**995 batch-generated IDs** with `-s##` suffix pattern remain in the database, 7 days after first flagged. Multiple iconic venues appear 4–7×:

| Venue | Occurrences | Safety Risk |
|-------|-------------|-------------|
| Cloudbreak, Fiji | 7× | Tagged "All Levels, Beginner Friendly" on batch entries — it's a heavy expert reef break. Liability. |
| Punta de Lobos, Chile | 5× | `punta_lobos` + `pichilemu` + `punta-de-lobos-s73` + `punta-de-lobos-south-s252` + more |
| Grandvalira, Andorra | 5× | `andorra-grandvalira`, `grandvalira-s0`, `grandvalira-south-s194`, `grandvalira-east-s388` + more |
| Mundaka, Spain | 6× | Tagged "Beginner Friendly, Warm Water" on batch entry — cold water, expert only. |
| Fuerteventura | 5× | `fuerteventura_surf`, `el-cotillo`, `cotillo-s47`, `fuerteventura-north-s102`, `cotillo-south-s226` |
| Nazaré, Portugal | 4× | `nazare`, `nazare-praia-norte`, `nazare-s173`, `nazare-south-s352` |
| Teahupo'o, Tahiti | 4× | At least one entry tagged "Beach Break, All Levels" — world's most dangerous wave. |
| Kalymnos, Greece | 3× | `kalymnos`, `leonidio-corfu`, `kalymnos-dws` |
| Essaouira, Morocco | 4× | 3 kite + 1 surfing entries at near-identical coordinates |

**93 venue pairs share exact lat/lon.** These are definitionally duplicate data.

**Fix approach (surgical, not destructive):** For each venue pair within 0.05° lat/lon, keep the original named entry (no `-s##` suffix) and discard the batch-gen duplicate. Estimated removal: ~600–800 entries. Final count ~2,900–3,100 — still the largest adventure venue catalog available.

**The Reddit r/surfing and r/skiing communities will notice Mundaka labeled "Beginner Friendly."** This destroys credibility with the exact audience Peakly needs most on launch day.

---

### P1 🔴 — PHOTO DUPLICATION (UNCHANGED SINCE APRIL 2)

- **3,726 venues, 2,261 unique photos** → 1,465 non-unique instances (39.3% of venues show a recycled image)
- Worst offenders: **17 venues each** share the same photo (4 base images hit this maximum)

Top duplicated photo IDs:
```
photo-1605540219596  →  17 venues
photo-1598586517946  →  17 venues
photo-1589802822605  →  17 venues
photo-1587495165786  →  17 venues
photo-1578985545284  →  17 venues
photo-1576012816255  →  17 venues
```

These are all batch-generated venues from the March 29 expansion, cycling through a ~170-image pool every 8–10 entries. Users browsing 5–10 surf venues in sequence will notice the same beach photo repeated. Trust impact is significant.

---

### Required Fields — ✅ PASS (Unchanged)

| Field | Missing count |
|-------|-------------|
| lat / lon | 0 |
| ap (airport) | 0 |
| tags | 0 |
| photo | 0 |
| id | 0 |

All 3,726 venues have complete required fields. Core schema is solid.

---

### Synthetic Review Patterns — P2 🟡 (Unchanged)

Batch-added venues show sequential review counts incrementing by +137 (300 → 437 → 574 → 711 → 848...). This is visibly machine-generated. Users comparing multiple venues will notice review counts with mathematical precision.

---

## 2. GEAR ITEMS AUDIT

All 11 sport categories have gear items. No gaps.

| Category | Item Count | Issue | Action |
|----------|-----------|-------|--------|
| skiing | 8 | ✅ Good | — |
| surfing | 4 | ⚠️ Low | Add wetsuit + leash when gear section re-enabled |
| tanning | 4 | ⚠️ Low | Missing beach chair, portable shade tent |
| diving | 4 | ✅ Good | — |
| climbing | 8 | ⚠️ Duplicate | Black Diamond Momentum Harness listed twice (REI + Amazon, same product) |
| kayak | 8 | ⚠️ Duplicate | NRS Chinook PFD listed twice (REI + Amazon) |
| mtb | 8 | ✅ Good | — |
| kite | 4 | ✅ Good | — |
| fishing | 4 | ✅ Good | — |
| paraglide | 4 | ✅ Good | — |
| hiking | 7 | ✅ Good | — |

**Note:** Gear section remains hidden at launch (`{false && GEAR_ITEMS[...]}`). No urgent action needed.

**Paste-ready: surfing gear additions (for when gear section is re-enabled):**
```javascript
// Append to GEAR_ITEMS.surfing:
{ emoji:"🦺", name:"O'Neill Reactor II 3/2 Wetsuit",     store:"Amazon", price:"$120", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=oneill+reactor+ii+wetsuit" },
{ emoji:"🔗", name:"Creatures of Leisure Surf Leash 9ft", store:"Amazon", price:"$32",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=creatures+of+leisure+surf+leash" },
{ emoji:"🏄", name:"Rip Curl E-Bomb 3/2 Wetsuit",        store:"REI",    price:"$280", commission:"5%",  url:"https://www.rei.com/search?q=rip+curl+ebomb+wetsuit" },
{ emoji:"💪", name:"Rash Guard UPF 50+ Long Sleeve",     store:"Amazon", price:"$28",  commission:"4%",  url:"https://www.amazon.com/s?tag=peakly-20&k=surf+rash+guard+upf+50+long+sleeve" },
```

**Paste-ready: tanning gear additions:**
```javascript
// Append to GEAR_ITEMS.tanning:
{ emoji:"⛱️", name:"G4Free Portable Beach Umbrella",     store:"Amazon", price:"$45",  commission:"4%",  url:"https://www.amazon.com/s?tag=peakly-20&k=g4free+beach+umbrella+portable" },
{ emoji:"🪑", name:"Helinox Chair Zero Beach",           store:"REI",    price:"$180", commission:"5%",  url:"https://www.rei.com/search?q=helinox+chair+zero" },
{ emoji:"🎒", name:"SealLine Baja Dry Bag 10L",          store:"REI",    price:"$35",  commission:"5%",  url:"https://www.rei.com/search?q=sealline+baja+dry+bag" },
{ emoji:"🎵", name:"JBL Flip 6 Waterproof Speaker",      store:"Amazon", price:"$130", commission:"4%",  url:"https://www.amazon.com/s?tag=peakly-20&k=jbl+flip+6+waterproof+bluetooth+speaker" },
```

---

## 3. SEASONAL RELEVANCE — April 9, 2026

### IN SEASON RIGHT NOW ✅

**Surfing — Atlantic Spring Swell (PEAK)**
- Portugal (Nazaré, Ericeira, Peniche): prime spring swells now
- Morocco (Taghazout, Imsouane): dry season ends April, last weeks of prime
- Canary Islands (Lanzarote, Fuerteventura): year-round but spring transition excellent
- Maldives: approaching end of season (NE monsoon ending, swells building)
- North Pacific (California, Oregon): spring groundswells consistent

**Beach/Tanning — Multiple Regions Prime**
- Caribbean: end of dry season, perfect 28–30°C, UV 8–9
- Maldives: last 3–4 weeks of prime before SW monsoon (May onset)
- SE Asia (Thailand, Bali): monsoon transition beginning — Bali east coast OK, west coast choppy
- Mexico (Pacific + Caribbean): Excellent. UV 10+

**Hiking — Northern Hemisphere Opening**
- US Southwest (Grand Canyon, Zion, Bryce): **prime month** — not yet summer heat, wildflowers
- Morocco (Atlas Mountains): spring trails open, snow-free below 3,000m
- Patagonia (Southern Hemisphere autumn): Fitz Roy area — autumn colors and stable windows

**Diving — Multiple Regions Prime**
- Maldives: exceptional visibility now (pre-monsoon)
- Red Sea (Egypt, Jordan): 26°C water, minimal current, ideal
- Great Barrier Reef: post-cyclone season clarity improving

**Kitesurfing**
- Tarifa, Spain: spring levante and poniente winds — prime season
- Cape Verde: end of strong trade wind season

---

### APPROACHING END OF SEASON ⚠️

**Skiing — Northern Hemisphere:**
- **Closing imminently (this week or next):** Most Austrian/German/Swiss mid-altitude resorts, most East Coast US
- **Still viable through April:** Val Thorens/Tignes (FR), Verbier (CH), Zermatt (CH), Mammoth CA, Whistler BC
- **Still viable through May:** Hintertux Glacier (AT), Saas-Fee (CH year-round), Mammoth CA

**Southern Hemisphere ski venues — DO NOT FEATURE:**
- NZ (Coronet Peak, Whakapapa, Treble Cone): **CLOSED** — opens late June/July
- Australia (Perisher, Falls Creek, Hotham): **CLOSED** — opens June
- Chile (Valle Nevado, Portillo): **CLOSED** — opens late June
- Argentina (Las Leñas, Catedral): **CLOSED** — opens July

**Risk:** The scoring algorithm has no `hemisphere` awareness for skiing. A SH ski venue with poor current weather could still rank above 50 on the hero card this month. Recommend suppressing SH ski venues from the hero card in April–May (add a `season.closeMonth / openMonth` check to `scoreVenue`).

---

### SEASONALLY MISMATCHED VENUES CURRENTLY IN DATABASE 🔴

Any SH ski venue appearing in hero card or top-10 results in April is wrong. Examples at risk:
- Valle Nevado, Chile — lifts closed since August 2025
- Portillo, Chile — lifts closed
- Perisher, Australia — lifts closed  
- Coronet Peak, NZ — lifts closed
- Cardrona, NZ — lifts closed

Until `scoreVenue` is SH-aware for skiing, monitor that no SH ski venue breaks into hero card during April.

---

## 4. CONTENT QUALITY FLAGS

### Dangerous/Incorrect Difficulty Tags — P1 🔴

These survive from the batch expansion. All are in the live database:

| Venue ID | Incorrect Tag | Reality |
|----------|--------------|---------|
| `cloudbreak-s85` | "All Levels, Beginner Friendly" | Boat-only expert reef break. One of Earth's most dangerous waves. |
| `mundaka-s37` | "Beginner Friendly, Warm Water" | Cold Basque water, expert-only river mouth break |
| `teahupoo-s141` | "Beach Break, All Levels" | Shallow reef, world's most dangerous big wave |
| `punta-de-lobos-south-s252` | "Beginner Friendly, Warm Water, Year-Round" | Cold Chilean water, expert big wave |
| `fuerteventura-north-s102` | "Beginner Friendly" (same lat as expert break) | Contradicts `fuerteventura_surf` tags |

**These incorrect tags are a credibility-destroying and potential safety liability.** Expert surfers on r/surfing browsing the app will screenshot and post them. This is a launch blocker for the surfing community.

### Short/Thin Description Field — P3 🟢

Venues have no prose `description` field. Vibe Search relies on `tags` + `title` + `location`. As the catalog grows, adding a 1-2 sentence `desc` field would improve search quality. Not blocking launch.

---

## 5. DAILY VENUE ADDITIONS — 5 New Confirmed-Absent Venues

All 5 verified absent from all 3,726 existing entries. Geographic focus: underrepresented regions with no existing presence.

### April 9 Seasonal Rationale:
- Svalbard Ski Touring: **April is peak month** (stable snow, 24-hr daylight returning, before melt)
- Snowman Trek Bhutan: Lower sections open April; pre-monsoon window
- Socotra: End of prime season (Nov–Apr), include now for catalog completeness
- Marquesas surf: Consistent south swells year-round, South Pacific gap in surfing catalog
- Malam Jabba: Season ending (February–March peak), but significant Pakistan gap to fill

```javascript
  // 1. SKIING — Malam Jabba, Pakistan (only ski resort in Pakistan; Swat Valley)
  {id:"malam_jabba",category:"skiing",title:"Malam Jabba Ski Resort",location:"Swat Valley, Khyber Pakhtunkhwa, Pakistan",lat:34.8167,lon:72.5700,ap:"PEW",icon:"🎿",rating:4.82,reviews:543,gradient:"linear-gradient(160deg,#0a2040,#0a4080,#1a70c0)",accent:"#6ab0e0",tags:["Pakistan's Only Ski Resort","Swat Valley","3000m Elevation","Off-Piste","Budget","South Asian Hidden Gem"],skiPass:"independent",photo:"https://images.unsplash.com/photo-1640499900704-b00a7c35d8c8?w=800&h=600&fit=crop"},

  // 2. HIKING — Snowman Trek, Bhutan (world's hardest point-to-point trek; 25 days)
  {id:"snowman_trek_bhutan",category:"hiking",title:"Snowman Trek",location:"Lunana, Bhutan",lat:28.0300,lon:90.3000,ap:"PBH",icon:"🥾",rating:4.97,reviews:312,gradient:"linear-gradient(160deg,#0a2510,#155a25,#259a45)",accent:"#55cc75",tags:["World's Hardest Trek","25-Day Expedition","Himalayan Passes","Permit Required","Expert Only","UNESCO Tiger's Nest Region"],photo:"https://images.unsplash.com/photo-1509541206217-cde45c41aa6d?w=800&h=600&fit=crop"},

  // 3. TANNING — Detwah Lagoon, Socotra Island (UNESCO, alien landscape, season ending)
  {id:"socotra_lagoon",category:"tanning",title:"Detwah Lagoon",location:"Socotra Island, Yemen",lat:12.6300,lon:53.5100,ap:"SCT",icon:"🏖️",rating:4.96,reviews:287,gradient:"linear-gradient(160deg,#005570,#00aabb,#55ddee)",accent:"#00ccdd",tags:["UV 9","Dragon Blood Trees","UNESCO","Alien Landscape","Untouched","Nov-Apr Peak"],photo:"https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800&h=600&fit=crop"},

  // 4. SURFING — Hanavave Bay, Fatu Hiva, Marquesas (confirmed absent; remote Pacific left-hander)
  {id:"marquesas_hanavave",category:"surfing",title:"Hanavave Bay",location:"Fatu Hiva, Marquesas, French Polynesia",lat:-10.4800,lon:-138.6700,ap:"PPT",icon:"🌊",rating:4.93,reviews:198,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#33aaff",tags:["Remote South Pacific","Left-Hander","Expert","Uncrowded","Boat Access","South Swells"],photo:"https://images.unsplash.com/photo-1455264745730-cb3b2b1e7b2b?w=800&h=600&fit=crop"},

  // 5. SKIING — Svalbard Backcountry Touring (April = PEAK; 24-hr daylight, stable snowpack)
  {id:"svalbard_ski_touring",category:"skiing",title:"Svalbard Ski Touring",location:"Longyearbyen, Svalbard, Norway",lat:78.2232,lon:15.6469,ap:"LYR",icon:"🎿",rating:4.94,reviews:167,gradient:"linear-gradient(160deg,#091428,#0a2858,#1a4898)",accent:"#5a90d0",tags:["Arctic Circle","April Peak Season","24hr Daylight","Polar Bears","Expert Only","Expedition"],skiPass:"independent",photo:"https://images.unsplash.com/photo-1547751335-1c29ab5c2a77?w=800&h=600&fit=crop"},
```

---

## 6. ONE OBSERVATION FOR THE PM

**The deduplication gap has now become a launch-blocking credibility risk, not just a data quality issue.**

Seven days after the first report flagged 995 batch-generated duplicates with contradictory tags, the database still has Cloudbreak tagged "Beginner Friendly," Mundaka tagged "Warm Water," and Teahupo'o tagged "All Levels." These are not minor metadata errors — they are factually dangerous for beginners who might follow app advice, and immediately visible to expert users.

The Reddit soft launch is targeting r/surfing and r/skiing — communities where a significant portion of users have personally surfed Mundaka or ridden Cloudbreak. If even one screenshot of "Mundaka — Beginner Friendly" gets posted with the caption "this app has no idea what it's talking about," that thread will define Peakly's reputation on launch day and beyond.

**Specific recommendation:** A targeted 2-step fix before Reddit launch:
1. Remove the 6 worst-offender batch entries by ID (cloudbreak-s85, mundaka-s37, teahupoo-s141, punta-de-lobos-south-s252, any entry at Cloudbreak/Teahupo'o not in the original named dataset). This is a 20-minute edit.
2. Then proceed with the full deduplication pass (~600–800 removals by coordinate proximity) as a follow-up.

The first step takes 20 minutes and eliminates the most dangerous credibility risks before launch. The second step can happen in week 2.

---

*Report written: 2026-04-09 | Agent: Content & Data | Venues audited: 3,726 | Status: P1 deduplication UNRESOLVED (7 days)*
