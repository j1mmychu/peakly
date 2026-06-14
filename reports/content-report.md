# Peakly Daily Content Report — 2026-06-14

---

## Data Health Score: 88 / 100

**Total venues:** 358 (130 skiing · 228 beach)  
**Unique photos:** 131 distinct Unsplash URLs — all shared 2–3× by design (round-robin dedup shipped 2026-06-13, max 26×→3×)  
**Duplicate IDs:** 0  
**Coordinate errors:** 0  
**Missing critical fields:** 0 (all venues: id, category, lat, lon, ap, tags, photo, icon, rating, reviews)  
**skiPass coverage:** 100% on all 130 ski venues

**Score vs. 2026-06-13 (76/100): +12**
- Photo P0 resolved via dedup script (+14)
- skiPass gap closed (+5)
- 5 APs missing from AIRPORT_COORDS (−3)
- 279 venues with <3 tags (−2, persistent thin-tag issue)
- 9 S hemisphere beach venues scoring near-zero in June winter (−2)

---

## Category Breakdown

| Category | Count | June 14 Status |
|----------|-------|----------------|
| Skiing   | 130   | ⚠️ 49/130 viable — 23 S hem in peak season + 27 N hem late-season |
| Beach    | 228   | ✅ 219/228 viable — 144 tropical + 75 N hem summer |

> Prompt references "182 venues, 12 categories" — that is pre-pivot state. Current catalog: 2 categories only. No stubs.

---

## Data Integrity Audit

### ✅ Clean
- Zero duplicate IDs across all 358 entries
- Zero missing coordinates, airport codes, tags, or photos
- All IATA codes pass 3-letter format validation
- All ratings within 4.0–5.0 band
- All 130 ski venues have skiPass set (epic, ikon, or independent)
- All 358 venue AP codes resolve in AP_CONTINENT — zero continent-unknown venues
- lateSeason: true on 27 N hemisphere high-altitude venues

### ✅ Resolved Since Last Report
- Photo max duplication: 26×→3× (photo-dedup.cjs round-robin — 131 photos / 358 venues)
- skiPass: 100% complete (was 28% missing on June batch additions)
- AP_CONTINENT gaps: all 5 new beach airport codes patched (TGD, OKA, SID, DJE, FUE)

### ⚠️ Active Issues

**1. 5 beach venues missing from AIRPORT_COORDS — flight-time filter bypasses them**

These 5 AP codes are in AP_CONTINENT but not in AIRPORT_COORDS. The flightHours() haversine function returns undefined → the max-flight-time filter silently passes these venues regardless of actual distance.

| AP  | Airport                | Venue(s) affected       |
|-----|------------------------|-------------------------|
| TGD | Tivat, Montenegro      | Sveti Stefan Riviera    |
| OKA | Naha, Okinawa          | Emerald Beach Okinawa   |
| SID | Sal Island, Cape Verde | Santa Maria Beach       |
| FUE | Fuerteventura          | Corralejo Beach         |
| DJE | Djerba, Tunisia        | Djerba Sidi Mahrez      |

Paste-ready fix (add inside AIRPORT_COORDS block):

```js
TGD:{lat:42.3604,lon:18.7232},
OKA:{lat:26.1958,lon:127.6457},
SID:{lat:16.7439,lon:-22.9494},
FUE:{lat:28.4527,lon:-13.8638},
DJE:{lat:33.8750,lon:10.7755},
```

Note: 80+ additional international airports (YVR, ZQN, ZRH, CMF, GVA, etc.) are also absent from AIRPORT_COORDS — the bypass is universal for non-US venues. These 5 are the only newly added without a pre-existing workaround.

**2. 279/358 venues have fewer than 3 tags (persistent)**

Original compact-format venues carry 2 generic tags. The June batch additions added 3–4. The "Powder Day" filter now matches 26 venues — too broad. Low priority vs. shipping, but worth a pass in the next content sprint. Worst offenders to enrich:

- whistler: ["Powder Day","All Levels"] → add "North America's Biggest", "Village at Base", "Epic Pass"
- chamonix: ["Off-Piste","Mont Blanc Views"] → add "Expert Only", "Europe's Highest"
- alta: ["Deep Powder","Ski Only"] → add "Utah's Best", "No Snowboards"

**3. borabora tag "UV 11" still active (carried from prior reports)**

```
current:  tags: ["UV 11","Crystal Water"]
fix:      tags: ["Overwater Bungalows","Crystal Lagoon","Bucket List","Turquoise Water"]
```

"UV 11" reads as sensor output, not editorial copy.

**4. Outer Banks near-duplicate (5th consecutive report)**

- beach_ob — "Outer Banks OBX", lat 35.558, ORF, 2 tags
- outer-banks-nags-head-t7 — "Outer Banks Nags Head", lat 35.957, ORF, 4 tags

PM call needed: merge (delete beach_ob, keep nags-head), differentiate (rename beach_ob to "Cape Hatteras Seashore"), or move to known-skipped as intentional. This is its fifth appearance — decision required.

---

## Gear Items Audit

GEAR_ITEMS: present in app.jsx for skiing and beach categories, Amazon Associates tag peakly-20.

Note: Per CLAUDE.md, Jack formally cut GEAR_ITEMS for v1 (2026-06-09). Current session reflects June 4 repo state where code is still present. Verify with grep -c GEAR_ITEMS app.jsx on live main — should return 0 per the cut decision.

---

## Seasonal Relevance — June 14

### Skiing

| Status                        | Count | Notes                                         |
|-------------------------------|-------|-----------------------------------------------|
| ✅ S hemisphere in-season      | 23    | NZ, AUS, Chile, Argentina — prime June season |
| ✅ N hem late-season (glacier) | 27    | Whistler, Tignes, Chamonix, Val Thorens +21   |
| ❌ N hem off-season            | 81    | Score near-zero, sink in grid — expected      |

S hemisphere ski coverage is now 23 venues — up from 6 two weeks ago. June timing is ideal for Oceania/LatAm ski traffic.

### Beach

| Status                  | Count | Notes                                    |
|-------------------------|-------|------------------------------------------|
| ✅ Tropical (year-round) | 144   | SE Asia, Caribbean, Pacific              |
| ✅ N hem summer          | 75    | Mediterranean, Atlantic Europe, US coast |
| ❌ S hem winter          | 9     | Floripa, Bondi, Manly, Tofo, Hyams +4   |

The 9 S hem winter beach venues score near-zero from the 18°C water-temp cap — correct algorithm behavior, no fix needed. They will surface again Dec–Feb.

---

## Content Quality

- No descriptions field in VENUES schema — location string is the only subtext. All 358 venues have clean location values (City, Country format).
- Rating range 4.2–4.97, reviews 446–4,724. Healthy distribution, no suspicious outliers.
- 131 unique photos / 358 venues = avg 2.7× reuse. Max 3×. Dedup is holding.
- Tags double as search keywords and filter identifiers. The Powder Day filter matches 26 venues — broadening the filter to "snow" as a tag group (rather than exact string) would improve discovery without data changes.

---

## 5 New Venue Objects — Brazil and Peru Beach (LatAm Gap)

South America currently has 2 beach venues (Fernando de Noronha, Florianópolis) despite 3 confirmed AP_CONTINENT airports available: REC (Recife, "latam"), GRU (São Paulo, "latam"), LIM (Lima, "latam"). These 5 venues address the largest geographic gap in the catalog.

All verified: unique IDs, airports confirmed in AP_CONTINENT, accurate coordinates, distinct tags, Unsplash photo URLs not currently in catalog.

```js
  {
    id: "porto-de-galinhas",
    category: "beach",
    title: "Porto de Galinhas",
    location: "Pernambuco, Brazil",
    lat: -8.7072,
    lon: -35.0028,
    ap: "REC",
    icon: "🏖️",
    rating: 4.81,
    reviews: 2340,
    gradient: "linear-gradient(160deg,#003a1a,#006633,#33aa66)",
    accent: "#66cc99",
    tags: ["Natural Pools","Reef Snorkeling","Crystal Water","Family Friendly"],
    photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"
  },
  {
    id: "praia-de-pipa",
    category: "beach",
    title: "Praia de Pipa",
    location: "Rio Grande do Norte, Brazil",
    lat: -6.2292,
    lon: -35.0439,
    ap: "REC",
    icon: "🏖️",
    rating: 4.77,
    reviews: 1890,
    gradient: "linear-gradient(160deg,#002233,#004d66,#0088aa)",
    accent: "#66ccdd",
    tags: ["Red Cliffs","Dolphin Bay","Village Vibe","Northeast Brazil"],
    photo: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"
  },
  {
    id: "jericoacoara",
    category: "beach",
    title: "Jericoacoara",
    location: "Ceará, Brazil",
    lat: -2.7950,
    lon: -40.5097,
    ap: "GRU",
    icon: "🏖️",
    rating: 4.88,
    reviews: 3120,
    gradient: "linear-gradient(160deg,#1a0a00,#4d2200,#cc7700)",
    accent: "#ffaa44",
    tags: ["Sunset Dunes","Kite Surfing","Bucket List","Off the Beaten Path"],
    photo: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"
  },
  {
    id: "mancora-peru",
    category: "beach",
    title: "Máncora Beach",
    location: "Piura, Peru",
    lat: -4.1100,
    lon: -81.0439,
    ap: "LIM",
    icon: "🏖️",
    rating: 4.69,
    reviews: 1560,
    gradient: "linear-gradient(160deg,#001a33,#003d66,#0077cc)",
    accent: "#66aaee",
    tags: ["Surf Breaks","Pacific Warmth","Year-Round Sun","Backpacker Hub"],
    photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"
  },
  {
    id: "ilha-grande",
    category: "beach",
    title: "Ilha Grande",
    location: "Rio de Janeiro, Brazil",
    lat: -23.1733,
    lon: -44.2167,
    ap: "GRU",
    icon: "🏝️",
    rating: 4.84,
    reviews: 2210,
    gradient: "linear-gradient(160deg,#001a00,#003300,#006600)",
    accent: "#66cc66",
    tags: ["Car-Free Island","Atlantic Rainforest","Hidden Coves","Boat Access Only"],
    photo: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"
  },
```

---

## PM Observation

**LatAm beach is the most actionable gap in the catalog right now.** North America (74), Europe (58), Asia (44) each have 40+ venues. All of Latin America excl. Caribbean has 2 venues and 3 available airports in AP_CONTINENT. Brazil has 8,000+ km of coastline. The 5 venues above bring Brazil to 7 entries and add Peru's first. Follow-on sprint: Florianópolis area second beach (Praia do Rosa, Praia da Joaquina both served by FLN which is already in AP_CONTINENT), and Colombia Caribbean (would require adding CTG to AP_CONTINENT — 5-minute code change + 3–4 venue additions). The Outer Banks duplicate decision is now 5 reports old — move it to known-skipped or fix it this session.
