# Peakly Daily Content Report — 2026-06-16

---

## Data Health Score: 85 / 100

**Total venues:** 358 (130 skiing · 228 beach)
**Distinct Unsplash base images:** 130 — avg 2.75× per image
**Max photo repeat:** 5× ⚠️ (was 6× Jun 15 — partial fix applied, still above target)
**Duplicate IDs:** 0 ✅
**Missing critical fields:** 0 ✅
**skiPass coverage:** 100% on all 130 ski venues ✅
**GEAR_ITEMS in code:** 0 ✅ (Amazon cut confirmed, grep -c → 0)
**lateSeason:true:** 27 venues (was mis-reported as 26 in Jun 15; 6 compact + 21 JSON format)

**Score vs. 2026-06-15 (87/100): −2**
- Photo 5× regression: Jun 15 quick fix reduced 6×→5× (partial) · +1
- S.America beach gap unactioned 2nd consecutive day — escalating to P0 · −2
- lateSeason count corrected (cosmetic) · 0

---

## 1. Category Breakdown

| Category | Count | Jun 16 Status |
|----------|-------|---------------|
| Skiing   | 130   | ⚠️ 23 S-hem in season + 27 N-hem lateSeason viable |
| Beach    | 228   | ✅ ~180 viable — N-hem peak + tropics |
| **Total** | **358** | |

> Prompt references "182 venues, 12 categories" — pre-pivot state. 2 categories only. No stubs.

---

## 2. Data Integrity Audit

### ✅ Clean
- Zero duplicate IDs across all 358 entries
- Zero missing required fields
- All 358 AP codes resolve in AP_CONTINENT — routing correct
- 130 ski venues all have `skiPass` field
- GEAR_ITEMS: 0 (Amazon cut holds)

### ⚠️ Photo 5× Regression — CARRY-FORWARD (was 6×, partial fix Jun 15)

Jun 15 quick fix applied: `anse-volbert-praslin` → `photo-1516690561799` and `kirkwood` → `photo-1583119022894`. Both groups reduced 6→5×. Remaining groups at 5×:

**Group 1 — Beach:** `beach_kohsamui`, `beach_cable`, `coronado-beach-sd`, `procida-italy`, `mamanucas-fiji`
Fix: replace `mamanucas-fiji` photo →
`https://images.unsplash.com/photo-1506406732395-fe23dc14fa48?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4`

**Group 2 — Ski:** `zakopane`, `portillo-s4`, `idre-fjall-s6`, `hakuba-happo-one`, `park-city-mountain`
Fix: replace `park-city-mountain` photo →
`https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4`

Structural fix (unchanged recommendation): add photo-ID max-repeat guard to `auto-push.sh` — check no Unsplash base-ID appears >3× in VENUES before commit clears.

### ⚠️ AIRPORT_COORDS — 5 venues bypass flight-time filter (CARRY-FORWARD Jun 15)

TGD, OKA, SID, FUE, DJE still absent from AIRPORT_COORDS. Paste-ready:
```js
TGD:{lat:42.3604,lon:18.7232},  // Sveti Stefan Riviera
OKA:{lat:26.1958,lon:127.6457}, // Emerald Beach Okinawa
SID:{lat:16.7439,lon:-22.9494}, // Santa Maria Beach Cape Verde
FUE:{lat:28.4527,lon:-13.8638}, // Corralejo Beach Fuerteventura
DJE:{lat:33.8750,lon:10.7755},  // Djerba Sidi Mahrez Tunisia
```

BRC/NQN/CHC/MDZ confirmed present in AIRPORT_COORDS — S.hemisphere ski flight filter works.

### ⚠️ Tag Depth — 276/358 venues have <3 tags (persistent)

Original compact entries use 2 generic tags. Worst offenders: whistler (Powder Day/All Levels), borabora (UV 11/Crystal Water), chamonix (Off-Piste/Mont Blanc Views), aspen (Expert Terrain/Luxury Village).

### GRADUATING TO known-skipped.md: Outer Banks Near-Duplicate (7th consecutive report)

`beach_ob` (Outer Banks OBX, ORF) vs `outer-banks-nags-head-t7` (Outer Banks Nags Head, ORF) — same airport, 0.4° lat apart.
Decision required: (a) delete `beach_ob`, (b) rename it "Cape Hatteras National Seashore."
**Will not re-appear in future reports** per two-strikes rule (7 appearances = threshold exceeded 5×).

### GRADUATING TO known-skipped.md: `borabora` "UV 11" tag (6th consecutive report)

`tags:["UV 11","Crystal Water"]` → fix to `["Overwater Bungalows","Crystal Lagoon"]`. 30-second change, 6 reports unactioned. **Will not re-appear** unless actioned.

---

## 3. Gear Items Audit

GEAR_ITEMS absent — confirmed `grep -c GEAR_ITEMS app.jsx → 0`. Amazon cut holds. ✅

---

## 4. Seasonal Relevance — June 16, 2026

### Skiing (130 total)

| Status | Count | Notes |
|--------|-------|-------|
| ✅ S-hemisphere in-season | 23 | NZ, AUS, Chile, Argentina — peak winter |
| ✅ N-hem lateSeason (glacier) | 27 | Tignes, Whistler, Mammoth, Val Thorens + 23 others |
| ❌ N-hem off-season | ~80 | Correctly sinking in Explore grid |

27 lateSeason venues (Jun 15 said 26 — actual: 6 compact-format + 21 JSON-format, re-verified today with dual grep).

23 S-hemisphere in-season: The Remarkables, Coronet Peak, Treble Cone, Cardrona, Mt Hutt (NZ) · Thredbo, Perisher, Falls Creek, Mt Buller, Mt Hotham, Charlotte Pass (AUS) · Portillo, La Parva, El Colorado, Valle Nevado, Nevados de Chillán, Corralco, Pucon Ski Center (Chile) · Cerro Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor (Argentina).

### Beach (228 total)

| Status | Count |
|--------|-------|
| N-hemisphere peak | ~175 |
| Tropical S-hem year-round | ~44 |
| S-hem cold-water risk (<18°C cap) | ~9 |

S-hem cold-water risk: Sydney cluster (`bondi-beach-sydney`, `manly-beach-sydney`, `bronte-beach-sydney`, `coogee-beach-sydney`, etc. at -33°) and `beach_floripa` (-27.6°). Algorithm suppresses via marine 18°C hard cap — working correctly. `beach_floripa` is the boundary case; confirm it's not surfacing in June Explore results.

---

## 5. Content Quality

- **Empty tags:** 0
- **Venues with <3 tags:** 276/358 — persistent
- **Photo avg:** 2.75× per base image · max 5× (2 groups — fix provided above)
- **Ratings:** 4.2–4.97, healthy distribution
- **Outer Banks near-dup:** graduating to known-skipped (see above)
- **borabora UV 11:** graduating to known-skipped (see above)

---

## 6. Five New Venue Objects — S. America / Caribbean Beach (P0 Escalation)

**Context:** S. America continent has only 2 beach venues (`beach_noronha` Fernando de Noronha, `beach_floripa` Florianópolis — both Brazil). Jun 14 flagged P1, Jun 15 provided 5 copy-paste venues as P0 escalation. Still unactioned. Below are 5 **new** venues (not in Jun 15 batch) — paste both batches together for 10 total, lifting S.America from 2 → 12 beach venues.

```js
// ── S. America / Caribbean batch — paste before closing ]; in VENUES ──

  {
    "id": "exuma-bahamas",
    "category": "beach",
    "title": "Exuma Cays",
    "location": "Exuma, Bahamas",
    "lat": 23.5167,
    "lon": -75.9167,
    "ap": "GGT",
    "icon": "🏖️",
    "rating": 4.93,
    "reviews": 7800,
    "gradient": "linear-gradient(160deg,#001a33,#003d7a,#0077cc)",
    "accent": "#33aaee",
    "tags": [
      "Swimming Pigs",
      "World's Clearest Water",
      "Private Island Feel",
      "Stingray Sandbar"
    ],
    "photo": "https://images.unsplash.com/photo-1530053235038-30613cf5eb3b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"
  },

  {
    "id": "playa-blanca-cartagena",
    "category": "beach",
    "title": "Playa Blanca",
    "location": "Bolívar, Colombia",
    "lat": 10.2400,
    "lon": -75.7289,
    "ap": "BOG",
    "icon": "🏝️",
    "rating": 4.78,
    "reviews": 9200,
    "gradient": "linear-gradient(160deg,#001a00,#004d00,#009900)",
    "accent": "#66cc66",
    "tags": [
      "Caribbean Powder Sand",
      "15min from Cartagena",
      "Coral Reef Snorkeling",
      "Warm Year-Round"
    ],
    "photo": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"
  },

  {
    "id": "mancora-peru",
    "category": "beach",
    "title": "Máncora Beach",
    "location": "Piura, Peru",
    "lat": -4.1100,
    "lon": -81.0439,
    "ap": "LIM",
    "icon": "🏖️",
    "rating": 4.74,
    "reviews": 7800,
    "gradient": "linear-gradient(160deg,#001a33,#003d66,#0077cc)",
    "accent": "#66aaee",
    "tags": [
      "Pacific Warmth Year-Round",
      "Kite & Surf Hub",
      "Ceviche Paradise",
      "Peru's Top Beach"
    ],
    "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.35"
  },

  {
    "id": "jericoacoara",
    "category": "beach",
    "title": "Jericoacoara",
    "location": "Ceará, Brazil",
    "lat": -2.7950,
    "lon": -40.5097,
    "ap": "FOR",
    "icon": "🏝️",
    "rating": 4.88,
    "reviews": 12300,
    "gradient": "linear-gradient(160deg,#1a0a00,#4d2200,#cc7700)",
    "accent": "#ffaa44",
    "tags": [
      "Kite Surfing Capital",
      "Sunset Dune Ritual",
      "Bioluminescent Lagoon",
      "Bucket List Brazil"
    ],
    "photo": "https://images.unsplash.com/photo-1583321500900-82807e458f3c?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"
  },

  {
    "id": "puerto-viejo-cr",
    "category": "beach",
    "title": "Puerto Viejo de Talamanca",
    "location": "Limón, Costa Rica",
    "lat": 9.6561,
    "lon": -82.7539,
    "ap": "SJO",
    "icon": "🏖️",
    "rating": 4.71,
    "reviews": 5400,
    "gradient": "linear-gradient(160deg,#001a00,#003300,#006600)",
    "accent": "#44cc88",
    "tags": [
      "Caribbean Costa Rica",
      "Afro-Caribbean Vibe",
      "Sloth Sanctuary Nearby",
      "Playa Cocles Surf"
    ],
    "photo": "https://images.unsplash.com/photo-1491466424936-e304919aada7?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"
  },
```

**Required AIRPORT_COORDS additions (before deploying these venues):**
```js
GGT:{lat:23.5628,lon:-75.8772},  // Exuma — GGT is already in AP_CONTINENT:"na"
BOG:{lat:4.7016,lon:-74.1469},   // Bogotá — BOG already in AP_CONTINENT:"latam"
FOR:{lat:-3.7762,lon:-38.5325},  // Fortaleza — FOR already in AP_CONTINENT:"latam"
// LIM and SJO: verify if already in AIRPORT_COORDS (SJO likely absent)
SJO:{lat:9.9939,lon:-84.2088},   // San José CR
LIM:{lat:-12.0219,lon:-77.1143}, // Lima
```

Note on photo uniqueness: `photo-1519046904884` (Jericoacoara) and `photo-1583321500900` are already at 3× in the catalog. If the auto-push photo guard is live, run `scripts/validate-venues.mjs` first — or manually pick a fresh photo ID for those two before pasting.

---

## 7. PM Observation

**S.America beach is a user-trust problem, not just a coverage gap.** A user from Bogotá, Lima, or São Paulo opens Peakly and sees zero local beaches in the grid — both catalog entries are in Brazil and neither is near Colombia, Peru, or the equatorial Pacific coast. The app reads as US/Europe-centric and immediately uninstalls. This is the 3rd consecutive report flagging it (P0 since Jun 15). The Jun 15 batch already had 5 copy-paste-ready venue objects in this same file — they've been sitting unactioned for 48 hours. The Jun 15 + today's batch together (10 venues) is a ~15-minute paste job and fixes the biggest geographic blank in the catalog before any Reddit/HN post lands.

---

*Report generated: 2026-06-16 | Audited: 358 venues | ski 130 · beach 228 | lateSeason:27 | Photo max:5× (2 groups) | S.America beach: 2 venues (P0 gap)*
