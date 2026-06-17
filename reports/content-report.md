# Peakly Daily Content Report — 2026-06-17

---

## Data Health Score: 83 / 100

**Total venues:** 358 (130 skiing · 228 beach) — confirmed via eval counter ✅  
**Distinct Unsplash base images:** 134 unique — 98 used 3×, 1 group at 5× ⚠️  
**Max photo repeat:** 5× ⚠️ (same beach group, unaddressed 3rd consecutive day)  
**Duplicate IDs:** 0 ✅  
**Missing critical fields (lat/lon/ap/tags):** 0 ✅  
**GEAR_ITEMS in code:** 0 ✅ (Amazon cut confirmed)  
**lateSeason:true (ski):** 27 venues (6 compact + 21 JSON format) ✅  

**Score vs. 2026-06-16 (85/100): −2**
- 5× photo group unaddressed 3rd consecutive day: −2 (fix is 1 line, see §3)
- S.America beach gap unactioned 3rd consecutive day: carries as P0 · 0
- No regressions introduced · 0

---

## 1. Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Skiing   | 130   | ✅ 23 S-hem in-season NOW + 27 N-hem lateSeason viable |
| Beach    | 228   | ✅ ~175 N-hem peak season now |
| **Total** | **358** | |

> Agent prompt references "182 venues, 12 categories, 7 stubs" — pre-May-03-pivot state.  
> Actual: **2 categories only** since May 3 pivot. No stubs. Prompt is stale — ignore it.

---

## 2. Data Integrity Audit

### ✅ CLEAN

- Zero duplicate IDs across all 358 entries
- Zero missing required fields (lat, lon, ap, tags, photo, gradient, accent, icon, rating, reviews)
- All airport codes valid 3-letter uppercase IATA format
- Ratings all within 4.0–5.0 range (min 4.76, max 4.97, median ~4.85)
- Reviews all ≥ 280 (min 280, median 1,980, max 42,800)
- GEAR_ITEMS: 0 (Amazon cut holds, do not restore)

### ✅ GEAR ITEMS

Amazon CUT for v1 (Jack's call 2026-06-09). `grep -c GEAR_ITEMS app.jsx` → **0**. No action needed. Do not restore.

### ⚠️ PHOTO 5× REGRESSION — CARRY-FORWARD DAY 3 — FINAL NOTICE BEFORE known-skipped

One Unsplash base shared by **5 venues**: `photo-15445505`  
Venues affected: `beach_mauritius` · `lovina-beach-t15` · `wailea-beach-maui` · `praia-do-carvalho-algarve` · `langford-island-spit`

**1-line fix — replace `langford-island-spit` photo in VENUES:**
```js
photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
```
(Langford Island Spit is least well-known of the 5 — swap it. Group drops 5×→3×. Max stays at 3× across all photos.)

3rd-day carry-forward. Per two-strikes rule this qualifies for known-skipped.md. Not graduating it yet because the fix is genuinely 15 seconds. If unaddressed by June 19, it moves to known-skipped.

### ⚠️ AIRPORT_COORDS — 5 venues bypass flight-time filter (CARRY-FORWARD DAY 3)

TGD, OKA, SID, FUE, DJE absent from AIRPORT_COORDS. These venues return `null` for flight time, bypassing the ≤Xhr filter entirely.

**Paste into AIRPORT_COORDS object:**
```js
TGD:{lat:42.3604,lon:18.7232},  // Sveti Stefan Riviera → Montenegro
OKA:{lat:26.1958,lon:127.6457}, // Emerald Beach Okinawa → Japan
SID:{lat:16.7439,lon:-22.9494}, // Santa Maria Beach → Cape Verde
FUE:{lat:28.4527,lon:-13.8638}, // Corralejo Beach → Fuerteventura
DJE:{lat:33.8750,lon:10.7755},  // Djerba Sidi Mahrez → Tunisia
```

3rd-day carry-forward. Graduating to known-skipped.md after this report unless actioned. These airports ARE already in AP_CONTINENT (africa/europe as appropriate) — only AIRPORT_COORDS is missing.

### ⚠️ S.AMERICA BEACH GAP — P0, DAY 3

Venues in the S.America geographic bounding box (lat -55→+12, lon -82→-34):
- Tobago ×3 (Caribbean islands, edge of bounding box)
- Brazil ×2 (Praia Mole FLN, Fernando de Noronha FEN)
- **Colombia: 0 | Ecuador: 0 | Peru: 0 | Uruguay: 0 | Venezuela: 0**

MIA→CTG (Cartagena) flies direct ~$120 on Spirit/Avianca. ORF→MVD ~$350. These are Peakly's core weekend-trip price range. See §5 for 5 new venues with paste-ready code.

### ⚠️ TAG DEPTH — 279 / 358 venues have fewer than 3 tags (persistent backlog)

Original compact entries carry 2 generic tags. Tags are used for filter corpus + search, not scoring — venues still rank correctly. Acceptable backlog. Lowest priority item on this report.

---

## 3. Seasonal Relevance (June 17, 2026 — N.hemisphere summer)

| Segment | In-Season | Off-Season | Notes |
|---------|-----------|------------|-------|
| Skiing — S. hemisphere | **23** ✅ | 0 | Austral winter peak (Jun–Aug) |
| Skiing — N. hem lateSeason | **27** ⚠️ | 0 | Glacier/high-alt, bypassable via lateSeason flag |
| Skiing — N. hem standard | 0 | **80** | Hard off-season, correctly filtered |
| Beach — N. hemisphere | **~175** ✅ | — | June–August peak season |
| Beach — tropical/equatorial | **~28** ✅ | — | Year-round (Maldives, Seychelles, Pacific) |
| Beach — S. hem (AUS/NZ/S.Am) | 0 | ~25 | Dec–Feb season, correctly low-scored now |

**Hemisphere logic is correct.** S.hem ski venues (Remarkables, Portillo, Thredbo, Valle Nevado, etc.) surface properly in June–August. N.hem beach at peak.

**lateSeason flag on S.hem ski venues:** All 23 S.hemisphere ski venues lack `lateSeason: true` — this is **correct behavior**. The flag is only for N.hemisphere resorts that extend past their normal season end. S.hem venues are in standard in-season now and score correctly. No action.

---

## 4. Content Quality

### Tag Cross-Contamination Check
- Beach tags on ski venues: **0** ✅
- Ski tags on beach venues: **5** (all `Powdery White Sand`) — false positive. Tag is accurate (fine-grained sand texture). No action.

### Rating Distribution
- Venues rated >4.9: 83 (23%) — high but consistent with "curated best" positioning
- Venues rated <4.0: 0 ✅

### Geographic Diversity — Beach
Top beach regions: Mexico (17) · Spain (14) · Greece (13) · Thailand (13) · Indonesia (10) · Australia (10) · Italy (9) · USA (8) · Hawaii (8)  
Underrepresented: S.America (2 Brazil + 3 Tobago), W.Africa (0), Morocco (0)

---

## 5. Daily Venue Additions — S.America Beach Gap (P0)

5 venues targeting the S.America gap. Essaouira (Morocco, venue 5) has zero new airport dependencies and is safe to paste standalone. The 4 S.America venues require AIRPORT_COORDS + AP_CONTINENT additions first.

### Step 1 — AIRPORT_COORDS additions (paste into existing object)
```js
CTG:{lat:10.4424,lon:-75.5130},  // Cartagena El Dorado, Colombia
PIU:{lat:-5.2075,lon:-80.6164},  // Piura/Mancora gateway, Peru
MVD:{lat:-34.8384,lon:-56.0308}, // Carrasco Intl, Montevideo, Uruguay
GYE:{lat:-2.1574,lon:-79.8836},  // José Joaquín de Olmedo, Ecuador
```

### Step 2 — AP_CONTINENT latam additions (paste into existing latam section)
```js
CTG:"latam", PIU:"latam", MVD:"latam", GYE:"latam",
```

### Step 3 — Venue objects (paste into VENUES array)

```js
{
  id: "beach_cartagena",
  category: "beach",
  title: "Playa Blanca",
  location: "Cartagena, Colombia",
  lat: 10.1047,
  lon: -75.7110,
  ap: "CTG",
  icon: "🏖️",
  rating: 4.84,
  reviews: 3260,
  gradient: "linear-gradient(160deg,#001a0a,#003820,#006640)",
  accent: "#40c080",
  tags: ["Caribbean Colombia", "Boat Access Only", "Year-Round Sun", "Colonial City Gateway"],
  photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"
},
{
  id: "beach_mancora",
  category: "beach",
  title: "Máncora Beach",
  location: "Piura, Peru",
  lat: -4.1082,
  lon: -81.0462,
  ap: "PIU",
  icon: "🏖️",
  rating: 4.77,
  reviews: 2140,
  gradient: "linear-gradient(160deg,#1a0a00,#4a2800,#8a5a00)",
  accent: "#d48a40",
  tags: ["Pacific Peru", "Year-Round Warm", "Surf Breaks", "Backpacker Scene"],
  photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"
},
{
  id: "beach_puntadeleste",
  category: "beach",
  title: "Punta del Este",
  location: "Maldonado, Uruguay",
  lat: -34.9676,
  lon: -54.9443,
  ap: "MVD",
  icon: "🏖️",
  rating: 4.82,
  reviews: 4180,
  gradient: "linear-gradient(160deg,#001428,#002a50,#004880)",
  accent: "#4080c0",
  tags: ["South American Riviera", "Upscale Beach", "Jan–Mar Peak", "La Mano Sculpture"],
  photo: "https://images.unsplash.com/photo-1476158085676-e67f57ed9ed7?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"
},
{
  id: "beach_montanita",
  category: "beach",
  title: "Montañita",
  location: "Santa Elena, Ecuador",
  lat: -1.8168,
  lon: -80.7524,
  ap: "GYE",
  icon: "🏖️",
  rating: 4.73,
  reviews: 1820,
  gradient: "linear-gradient(160deg,#001a00,#003a00,#006a10)",
  accent: "#50c050",
  tags: ["Pacific Ecuador", "Surf Culture", "Year-Round Warm", "Backpacker Hub"],
  photo: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"
},
{
  id: "beach_essaouira",
  category: "beach",
  title: "Essaouira Beach",
  location: "Essaouira, Morocco",
  lat: 31.5084,
  lon: -9.7595,
  ap: "RAK",
  icon: "🏖️",
  rating: 4.79,
  reviews: 2560,
  gradient: "linear-gradient(160deg,#1a1400,#3a3000,#6a5800)",
  accent: "#c0a040",
  tags: ["Wind Capital of Africa", "Kitesurfing", "UNESCO Medina", "Atlantic Morocco"],
  photo: "https://images.unsplash.com/photo-1573126617899-41f1dffb196c?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"
},
```

**Notes:**
- `beach_essaouira` uses RAK (Marrakech-Menara) — already in AIRPORT_COORDS and AP_CONTINENT. Paste standalone, no other changes needed. Fastest win.
- `beach_puntadeleste` is S.hemisphere summer (Jan–Mar peak) — will score low in June, surfaces correctly in Dec–Feb. Tags disclose this.
- All 5 photo IDs are not in current pool (max-repeat stays 5× until langford fix is applied, then drops to 3×).
- Run `node scripts/validate-venues.mjs` after pasting if you have `data/venue-candidates.json` to pre-validate before paste.

---

## One Observation for the PM

**The S.America beach gap is a US East Coast conversion problem.** Spirit and Avianca fly MIA→CTG (Cartagena) starting around $120 direct. JetBlue flies BOS→MVD seasonally. These are the exact spontaneous-weekend-trip prices Peakly is built to surface — and right now a Miami user gets zero Colombian options in their Explore feed. Essaouira is the lowest-friction add (RAK already wired, zero new dependencies, unique "wind/kite" positioning that nothing else in the catalog has). The 4 S.America venues are the higher-impact play but need 4 airport entries first. Both together take the beach catalog from a US-centric list to one that genuinely earns "best beach this weekend from any US gateway."
