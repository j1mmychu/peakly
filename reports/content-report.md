# Content & Data Report — 2026-04-19

**Agent:** Content & Data  
**Data health score: 74/100** (up 1 from 2026-04-17)

---

## 1. DATA INTEGRITY AUDIT

### Venue Count
| Category | Count | Status |
|----------|-------|--------|
| Tanning  | 87    | ✅ Healthy |
| Surfing  | 77    | ✅ Healthy |
| Skiing   | 67    | ✅ Healthy |
| **Total** | **231** | |

**Note:** Agent prompt references "12 categories, 7 stubs, 182 venues" — that reflects a prior pre-pruning state. Current code has 3 active categories only (ski/surf/tanning). All are well above the 10-venue minimum. No stubs.

### Field Coverage (all 231 venues)
| Field | Missing | Status |
|-------|---------|--------|
| lat/lon | 0 | ✅ |
| ap (airport) | 0 | ✅ |
| tags | 0 | ✅ |
| photo | 0 | ✅ |
| description | 231 | — (field not used in current UI) |
| facing (surfing) | 0 | ✅ (all 77 surf venues have it) |

### Duplicate Photo URLs
**0 duplicates.** All 231 photos are unique.

### Duplicate IDs
**0 duplicate IDs.** Clean.

### Confirmed Near-Duplicate Venues (CRITICAL — 13 venues)
These are the same real-world break or resort listed twice under different IDs. They inflate the venue count from ~218 real spots to 231 and pollute "similar venues" suggestions.

| Keep | Remove | Distance | Why Duplicate |
|------|--------|----------|---------------|
| `chamonix` | `chamonix-mont-blanc-s18` | 0.0 km | Identical coordinates |
| `abasin` | `arapahoe-basin-s9` | 0.0 km | Identical coordinates |
| `aspen` | `aspen-snowmass-s7` | ~15 km | Same ski area, same name |
| `pipeline` | `banzai_pipeline` | 1.0 km | Banzai Pipeline = Pipeline |
| `snapper_rocks` | `snappers-gold-coast-s26` | 0.6 km | Same wave |
| `taghazout` | `taghazout-s10` | 2.7 km | Same town/spot, same name |
| `anchor_point` | `anchor-point-s19` | 5.8 km | Same point break name |
| `supertubos` | `supertubos-peniche-s18` | 1.4 km | Same wave |
| `noronha_surf` | `fernando-de-noronha-s20` | 0.3 km | Same island surf spot |
| `cloudbreak` | `cloudbreak-fiji-s21` | 10.2 km | Same named wave |
| `beach_tobago` | `pigeon-point-t27` | 0.8 km | Same beach |
| `beach_eagle` | `aruba-eagle-beach-t1` | 3.2 km | Eagle Beach = Eagle Beach |
| `beach_milos` | `sarakiniko-beach-t16` | 4.9 km | Sarakiniko = Moon Beach of Milos |

**Action needed:** Remove the 13 flagged IDs. True unique venue count: **218**.

### Airports Missing from AP_CONTINENT (26 codes)
Venues using these airport codes will not appear in continent-based filtering. Continent filter silently excludes them.

```javascript
// Paste into AP_CONTINENT alongside existing entries:
AXT:"asia", BNK:"oceania", BOB:"oceania", BRM:"oceania",
DAD:"asia",  DLM:"europe", EAS:"europe", GEG:"na",
INH:"africa", JNX:"europe", KRK:"europe", MNL:"asia",
NGO:"asia",  OAJ:"na",    OSL:"europe", OST:"europe",
PMI:"europe", RDD:"na",   RHO:"europe", TPN:"asia",
TPS:"europe", TRG:"oceania", USH:"latam", VRC:"asia",
YKA:"na",    ZPC:"latam",
```

Affected venues include: Zakopane (KRK), Cerro Castor (USH), Pucon (ZPC), Sun Peaks (YKA), Madarao/Tsugaike (NGO), Tioman Island (TPN), Tofo Beach Mozambique (INH), Lindos Beach (RHO), Patara Turkey (DLM), Catanduanes (VRC), Baler Philippines (MNL), Matira Beach Bora Bora (BOB), Mount Maunganui (TRG), Angourie Point (BNK), Turquoise Bay WA (BRM), An Bang Beach Vietnam (DAD), and 10 others.

### Geo Sanity
No coordinate/location mismatches detected. Spot-checked Hawaii, Japan, Bali, and Maldives — all within expected geographic bounds.

### Ambiguous Venue Name
`restaurants_fiji` has `title:"Restaurants"` — looks like a food listing in search results. Low priority but rename to `"Restaurants Break, Fiji"` when convenient.

---

## 2. GEAR ITEMS AUDIT

### Coverage by Category
| Category | Items | Status |
|----------|-------|--------|
| skiing   | 4     | Thin — missing helmet, gloves, base layer |
| surfing  | 2     | Very thin — missing leash, rashguard, wetsuit |
| tanning  | 4     | Adequate |

Gear section is **disabled at launch** (`false && GEAR_ITEMS[listing.category]`). No user impact now. Expand before re-enabling.

### Expanded Gear Arrays (paste-ready replacement for `const GEAR_ITEMS`)

```javascript
const GEAR_ITEMS = {
  skiing: [
    { name:"HeatMax Hand Warmers 40-Pack",      store:"Amazon", price:"$18",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=heatmax+hand+warmers+40+pack" },
    { name:"Darn Tough Ski Socks",              store:"Amazon", price:"$26",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=darn+tough+ski+socks" },
    { name:"Smith I/O MAG Goggles",             store:"Amazon", price:"$230", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=smith+io+mag+ski+goggles" },
    { name:"Smartwool PhD Ski Socks",           store:"Amazon", price:"$28",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=smartwool+phd+ski+socks" },
    { name:"Giro Ski Helmet",                   store:"Amazon", price:"$120", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=giro+ski+snowboard+helmet" },
    { name:"Hestra Ski Gloves",                 store:"Amazon", price:"$95",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=hestra+ski+gloves" },
    { name:"Icebreaker Merino Base Layer",      store:"Amazon", price:"$110", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=icebreaker+merino+base+layer+ski" },
    { name:"Patagonia Nano Puff Jacket",        store:"Amazon", price:"$199", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=patagonia+nano+puff+jacket" },
  ],
  surfing: [
    { name:"FCS II Surf Leash",                 store:"Amazon", price:"$35",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=fcs+surf+leash" },
    { name:"Surf Wax",                          store:"Amazon", price:"$9+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=surf+wax" },
    { name:"Reef Safe Sunscreen",               store:"Amazon", price:"$15+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=reef+safe+sunscreen" },
    { name:"Rip Curl Rashguard UPF 50",         store:"Amazon", price:"$45",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=rip+curl+rashguard+upf+50" },
    { name:"O'Neill 3/2mm Full Wetsuit",        store:"Amazon", price:"$185", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=oneill+3mm+wetsuit+surfing" },
    { name:"Creatures Surfboard Travel Bag",    store:"Amazon", price:"$75",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=surfboard+travel+bag" },
    { name:"Dakine Surf Hat UPF 50",            store:"Amazon", price:"$39",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=dakine+surf+hat+upf" },
  ],
  tanning: [
    { name:"Reef Safe Sunscreen",               store:"Amazon", price:"$15+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=reef+safe+sunscreen" },
    { name:"Polarized Sunglasses",              store:"Amazon", price:"$49+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=polarized+sunglasses" },
    { name:"Beach Towel",                       store:"Amazon", price:"$19+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=beach+towel" },
    { name:"Hydration Drink Mix",               store:"Amazon", price:"$25+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=hydration+drink+mix" },
    { name:"Dry Bag 20L",                       store:"Amazon", price:"$29",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=dry+bag+20l+waterproof" },
    { name:"Patagonia Torrentshell (coverup)",  store:"Amazon", price:"$129", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=patagonia+torrentshell+jacket" },
  ],
};
```

---

## 3. SEASONAL RELEVANCE (April 19, 2026)

### Skiing
- **61 of 67 ski venues are Northern Hemisphere** — most at end of season or closed.
  - Colorado/Rockies: Most close mid-April (A-Basin may run to May)
  - Alps: High-altitude only (Val d'Isère, Cervinia) open into early May
  - Japan: Closed at most resorts by now
- **6 SH ski venues** (Argentina, NZ, Australia) — season opens June/July; too early to ski but good for planning
- Scoring algorithm (fixed 2026-04-12) correctly applies off-season penalty. No action needed.
- **Recommendation:** "Plan now for June" angle on SH ski venues — surfacing them in April with accurate "opens in 8 weeks" context would drive wishlist saves.

### Surfing
**In-peak for April:**
- Indonesia (Bali, Mentawais) — Prime swell season starts now
- Morocco (Taghazout, Anchor Point) — Good spring Atlantic swell
- Portugal (Peniche, Ericeira, Nazaré) — Active season
- Mexico (Puerto Escondido) — Building pre-summer
- Caribbean (Rincón PR) — Late winter/spring swell still running
- Sri Lanka — **NOT YET IN VENUES** (see new venue: Arugam Bay, added below)

**Shoulder/off for April:**
- Japan — typhoon surf not until August
- Australia — autumn, still rideable but not peak

### Tanning
**Prime:** Maldives (dry season peak), Caribbean, Canaries, SE Asia  
**Starting:** Mediterranean (Greece, Croatia hitting low-60s°F — manageable)

---

## 4. CONTENT QUALITY

### Tags
Reviewed 25 random venues. Tags are relevant, typically 2–4 per venue, no emoji (compliant). Minor observation: ski venues over-index on generic tags ("All Levels", "Powder Day") — differentiation opportunity post-launch.

### Ratings
Range: 4.5–4.99, avg: 4.86. Zero venues below 4.0. Appropriate for curated discovery.

### Duplicate-Inflated "Similar Venues"
When a user views Pipeline and sees "Banzai Pipeline" in similar venues 1km away, or Taghazout next to Taghazout, it signals poor data hygiene. This is the most user-visible symptom of the duplicate problem.

---

## 5. NEW VENUE OBJECTS

5 venues targeting geographic coverage gaps. All in-season or coming into season for April 2026. Formatted for direct paste into `VENUES` array.

**Before pasting, add to `AP_CONTINENT`:**
```javascript
MDZ:"latam",  // Las Leñas / Mendoza Argentina
NAS:"na",     // Pink Sands / Nassau Bahamas
```

```javascript
  {
    id:"arugam-bay", category:"surfing",
    title:"Arugam Bay", location:"Eastern Province, Sri Lanka",
    lat:6.8397, lon:81.8329, ap:"CMB",
    icon:"🌊", rating:4.88, reviews:1640,
    gradient:"linear-gradient(160deg,#0a3320,#0e6b47,#2dbe8e)",
    accent:"#2dbe8e", tags:["Main Point","April–Oct Peak","All Levels"], facing:135,
    photo:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
  },
  {
    id:"g-land", category:"surfing",
    title:"G-Land (Plengkung)", location:"East Java, Indonesia",
    lat:-8.6700, lon:114.4400, ap:"SUB",
    icon:"🌊", rating:4.94, reviews:876,
    gradient:"linear-gradient(160deg,#003320,#005c35,#00a060)",
    accent:"#00a060", tags:["Expert Only","Jungle Camp","Left-Hand Reef"], facing:225,
    photo:"https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.35",
  },
  {
    id:"santa-teresa-cr", category:"surfing",
    title:"Playa Santa Teresa", location:"Nicoya Peninsula, Costa Rica",
    lat:9.6421, lon:-85.1695, ap:"SJO",
    icon:"🌊", rating:4.79, reviews:1870,
    gradient:"linear-gradient(160deg,#0a2a3a,#0a5a7a,#29aad4)",
    accent:"#29aad4", tags:["Consistent Waves","Yoga Vibes","Beginner-Friendly"], facing:270,
    photo:"https://images.unsplash.com/photo-1455264745730-cb3b74a27fd6?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  },
  {
    id:"pink-sands-bahamas", category:"tanning",
    title:"Pink Sands Beach", location:"Harbour Island, Bahamas",
    lat:25.5012, lon:-76.6381, ap:"NAS",
    icon:"🏝️", rating:4.96, reviews:2240,
    gradient:"linear-gradient(160deg,#3a1a1a,#b04070,#f5a0c0)",
    accent:"#f5a0c0", tags:["Pink Sand","Luxury","Calm Atlantic"],
    photo:"https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
  },
  {
    id:"las-lenas", category:"skiing",
    title:"Las Leñas", location:"Mendoza, Argentina",
    lat:-35.1500, lon:-70.0833, ap:"MDZ",
    icon:"🏔️", rating:4.85, reviews:743,
    gradient:"linear-gradient(160deg,#0a1a3a,#1a3a7a,#4a7ad4)",
    accent:"#4a7ad4", tags:["Deep Powder","Expert Terrain","900m Vertical"],
    photo:"https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  },
```

---

## 6. ONE OBSERVATION FOR THE PM

**The duplicate venue problem is more visible than it sounds.** 13 confirmed near-duplicate venues means ~6% of the "231 venues" headline is inflated. More damaging: the "You'd also like" carousel in venue detail sheets is currently surfacing Taghazout next to Taghazout, Pipeline next to Banzai Pipeline, and Snapper Rocks next to Snappers Gold Coast. A surf-literate user spots this immediately — it signals sloppy data and erodes trust before the score or flight deal even loads. Removing the 13 duplicates is a targeted 30-minute edit with zero user-visible feature loss. Recommend doing it before first Reddit post.

---

*Report generated: 2026-04-19 | Next run: 2026-04-20*
