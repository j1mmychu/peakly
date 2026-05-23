# Content & Data Quality Report — 2026-05-23

**Agent:** Content & Data  
**Data health score: 69/100**

**Score delta vs yesterday:** +1 (6 inline fixes applied; recurring GEAR_ITEMS gap unchanged; no new P0s found)

**Score breakdown:**  
Zero duplicate IDs +10 | Zero duplicate photo base URLs +10 | All required fields on all 148 venues +10 | Good geographic diversity across 6 continents +8 | ✅ 3 Japan airport errors fixed (NGO→NRT ×2, AXT→NRT) +3 | ✅ 3 misleading/factually wrong tag sets fixed inline +3 | ❌ GEAR_ITEMS constant absent — Amazon Associates earning $0 −12 | ❌ 10 agent-batch venues carry recycled identical tag sets −8 | ❌ S-hemisphere ski venues score as off-season during actual peak (Jun–Sep) −5 | ❌ Boracay island has 2 venues (White Beach + Bulabog) — not a true dup but inflates same island −2 | ❌ OBX has 2 venues (beach_ob + outer-banks-nags-head-t7) — redundant destination −2 | ❌ No description field on any venue (schema gap by design) −3 | ❌ Agent prompt header references 182 venues / 12 categories — stale vs actual 148 / 2 categories −3

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 148 venues (2 active categories)

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 84    | ✅ Launch category |
| Skiing   | 64    | ✅ Launch category |
| **TOTAL**| **148** | — |

Both categories well above the 10-venue stub threshold. The agent prompt header says "12 categories / 182 venues" — that is stale and predates the 2026-05-03 surf-and-multisport retirement. Current state: 2 active categories (`skiing`, `beach`) + `all` filter pill only.

### Required Field Coverage — PASS ✅
All 148 venues carry: `id`, `category`, `lat`, `lon`, `ap`, `tags[]`, `photo`, `rating`, `reviews`, `gradient`, `accent`. `description` absent by schema design (no free-text in current UI). `difficulty` absent by schema design (tags handle this).

### Duplicate IDs — NONE ✅
Boot-time dup-id IIFE validator at app.jsx:571 is active. Zero collisions.

### Duplicate Photo URLs — NONE ✅
148 unique Unsplash base URLs. Zero collisions even when stripping `?w=` crop params.

### Airport Code Validity — PASS (with 3 fixes applied)

All 114 unique IATA codes are valid and mapped in `AP_CONTINENT`. Note: KUL, MCT, SNA appeared flagged in yesterday's report due to a regex bug that missed quoted-key entries (`"KUL":"asia"` vs `KUL:"asia"`) — they were already present and correctly mapped.

**Fixes applied this run (flagged yesterday):**

| Venue | Old `ap` | New `ap` | Reason |
|-------|----------|----------|--------|
| `appi-kogen-s2` (Appi Kogen, Iwate) | `AXT` (Akita) | `NRT` | Akita Airport has almost zero international service. NRT + Tohoku Shinkansen to Morioka + bus is the real international gateway. `AXT` was returning $0 Travelpayouts flight results. |
| `madarao-mountain-s22` (Madarao, Nagano) | `NGO` (Nagoya) | `NRT` | Nagoya is ~3h from Madarao with limited ski-season schedules. NRT is the standard international gateway for all Nagano-area resorts via Shinkansen. |
| `tsugaike-kogen-s25` (Tsugaike, Nagano) | `NGO` (Nagoya) | `NRT` | Same as Madarao — both Nagano-area resorts share NRT as their effective international air gateway. |

### Coordinate Anomalies — NONE ✅
No beach venues above 60° lat. No ski venues below 30° lat. All placements are geographically plausible.

---

## 2. GEAR ITEMS AUDIT

**GEAR_ITEMS constant: ABSENT from app.jsx** ❌

Amazon Associates (`peakly-20`) is wired into the detail sheet affiliate flow but no product catalog constant exists. Revenue stream earning $0 for both active categories.

**Note on prompt header:** "Hiking has ZERO gear items" — this references the pre-pivot 12-category schema. Hiking was never launched. Current scope is skiing and beach only.

**Revenue impact:**
- Estimated Amazon Associates RPM: ~$4.48 / 1K MAU (CLAUDE.md revenue table)  
- At 1K MAU launch target: ~$4.48/mo foregone
- At 10K MAU: ~$44.80/mo

**Two-strikes rule status:** GEAR_ITEMS has been flagged in **3+ consecutive** content reports with zero action. Moving to `known-skipped.md` after this run. Paste-ready code is in §6 — ASIN spot-check is the only remaining step before it ships.

---

## 3. SEASONAL RELEVANCE (May 23 — late Northern spring)

### Beach — PRIME SEASON ✅
| Region | Status | Notes |
|--------|--------|-------|
| Caribbean | ✅ Peak dry season | Pre-hurricane window; ideal visibility, warm water |
| Hawaii / Florida / Mexico | ✅ Peak | Full sun, water temps 80°F+ |
| Mediterranean | 🟡 Warming | Shoulder rates; peak starts mid-June |
| SE Asia (Thailand, Philippines, Indonesia) | ⚠️ Monsoon arrival | May–Oct is wet for Koh Samui, Phuket, El Nido. Score reflects this. |
| Indian Ocean (Maldives, Seychelles, Mauritius) | ⚠️ SW monsoon | June–Oct is rough. Open-Meteo precip data handles scoring. |
| S. America beaches (Florianopolis, Noronha) | 🔴 Winter | Not beach season in Brazil's south. Score will depress them. |

### Skiing — CRITICAL: SH SEASON STARTS IN 2 WEEKS ⚠️

**Northern hemisphere:** Most resorts closed. 7 venues with `lateSeason:true` remain valid through June:

| Venue | `lateSeason` | Note |
|-------|-------------|------|
| Whistler Blackcomb | ✅ line 404 | Peak Bowl opens May–June |
| Chamonix-Mont-Blanc | ✅ line 420 | Mer de Glace glacial runs |
| Mammoth Mountain | ✅ | Targets July 4 close |
| Arapahoe Basin | ✅ | Longest CO season |
| Tignes / Val d'Isère | ✅ | Grande Motte glacier |
| Cervinia | ✅ | High altitude, June viable |
| Val d'Isere (s16) | ✅ | Shared glacier with Tignes |

51 other NH ski venues correctly suppressed by off-season cap.

**Southern hemisphere — OPENS JUNE 1, SCORES AS OFF-SEASON (BUG)** ❌

These 6 resorts open in ~10 days. `scoreVenue` inSeason uses NH calendar (Nov–Apr) so they'll score ~0 all winter. Third consecutive report raising this.

| Venue | Opens | lat |
|-------|-------|-----|
| `remarkables` (NZ) | June 14 | -45.0 |
| `treble-cone-s29` (NZ) | June | -44.6 |
| `thredbo-village-s23` (AU) | June 7 | -36.5 |
| `portillo-s4` (Chile) | June 7 | -32.8 |
| `cerro-castor-s28` (Argentina) | June | -54.8 |
| `pucon-ski-center-s19` (Chile) | June | -39.3 |

**Proposed fix (algorithm critique required per CLAUDE.md):**
```javascript
// In scoreVenue, before the inSeason off-season binary cap:
const isSHemSki = venue.category === "skiing" && (venue.lat ?? 0) < -20;
const adjustedInSeason = isSHemSki
  ? (month >= 5 && month <= 8)   // Jun–Sep peak for S. hem ski (months 5–8, 0-indexed)
  : inSeason;
// Then use adjustedInSeason in the cap check instead of inSeason
```
Two-line change, but touches scoring — do not apply without PM critique.

---

## 4. CONTENT QUALITY

### Tag Accuracy — Fixes Applied This Run

| Venue | Old Tags | New Tags | Issue |
|-------|----------|----------|-------|
| `agios-prokopios-t2` (Naxos, Greece) | "Party Beach","Beach Bars","Water Sports","Vibrant" | "Blue Flag Beach","Golden Sand","Shallow Water","Family Friendly" | Agios Prokopios is a calm family Blue Flag beach. Party scene is Mykonos, not Naxos. Tags were a recycled copy-paste from wrong venue group. |
| `mana-island-fiji-t12` (Fiji) | "Party Beach","Beach Bars","Water Sports","Vibrant" | "Private Island","Marine Reserve","Snorkeling","Untouched" | Mana Island is a small private resort island with a marine sanctuary — no beach bars, no party scene. |
| `natadola-beach-t9` (Fiji) | "Family Friendly","Clear Visibility","Blue Flag","Amenities" | "Family Friendly","Calm Lagoon","Horseback Riding","Fiji's Best Beach" | Blue Flag is a European/African program — does not operate in Fiji. Natadola's signature experience is horseback riding on the beach. |
| `madarao-mountain-s22` (Nagano) | "Beginner Slopes","Ski School","Family Friendly","Night Skiing" | "Beginner Slopes","Ski School","Family Friendly","Deep Powder" | Madarao has no night skiing infrastructure. Known for deep Japow powder. |

### Open Tag Issues (not fixed this run)

| Venue | Issue |
|-------|-------|
| `laguna-beach-t24` | "Blue Flag" — program doesn't operate in California |
| `an-bang-beach-t29` | "Blue Flag" — program doesn't operate in Vietnam |
| `bulabog-beach-boracay-t19` | "Blue Flag" — program doesn't operate in Philippines |
| 10 ski venues (5 groups) | Recycled identical tag sets — see list below |
| 5 beach venues (3 groups) | Recycled identical tag sets |

**Remaining recycled identical tag groups after today's fixes:**

*Skiing (5 groups):*
- `zell-am-see`, `idre-fjall`, `kiroro`, `val-d-isere-s16`, `powder-mountain`, `mount-shasta` → all `"Expert Terrain","Off-Piste","Deep Snow","Backcountry"`
- `appi-kogen`, `morzine`, `sun-peaks` → `"Beginner Slopes","Ski School","Family Friendly","Night Skiing"` (Night Skiing still wrong on appi-kogen + morzine — carry forward for next fix pass)
- `hemsedal`, `sainte-foy`, `thredbo`, `cerro-castor` → `"Black Diamonds","Steep Chutes","Variable Terrain","Long Season"`
- `portillo`, `pucon`, `nevis-range`, `treble-cone` → `"Glacial Skiing","Scenic Views","Village Base","On-Piste"`
- `big-white`, `champoluc`, `les-arcs`, `tsugaike` → `"Powder Day","All Levels","High Altitude","Groomed Runs"`

*Beach (3 groups):*
- `playa-de-la-concha`, `turquoise-bay`, `patara`, `lindos`, `rendezvous-bay` → `"Natural Beauty","Protected Bay","Coral Reef","No Crowds"`
- `huatulco`, `zlatni-rat`, `bulabog-boracay`, `laguna-beach`, `an-bang` → `"Family Friendly","Clear Visibility","Blue Flag","Amenities"`
- `matira`, `tioman`, `san-vito-lo-capo`, `muscat-beach` → `"Secluded Beach","Snorkeling","Calm Waters","Pristine"`

---

## 5. GEAR ITEMS PASTE BLOCK (skiing + beach)

Amazon Associates `peakly-20` is already wired. Add this constant in app.jsx near the CATEGORIES block, then enable the gate in VenueDetailSheet.

**⚠️ VERIFY EACH ASIN at `amazon.com/dp/<ASIN>` before shipping — catalog links can go stale.**

```javascript
const GEAR_ITEMS = {
  skiing: [
    {
      title: "Oakley Flight Tracker Goggles",
      asin: "B08KVHM69C",
      price: 159,
      img: "https://m.media-amazon.com/images/I/71Q2hxQ5MhL._AC_SL1500_.jpg",
      tag: "Best Seller",
    },
    {
      title: "Salomon S/Lab Shift MNC 13 Bindings",
      asin: "B07YD9SDWZ",
      price: 399,
      img: "https://m.media-amazon.com/images/I/61YBsUxkFDL._AC_SL1500_.jpg",
      tag: "High AOV",
    },
    {
      title: "Burton Custom Snowboard",
      asin: "B09PY8K8MG",
      price: 549,
      img: "https://m.media-amazon.com/images/I/81J5ZZpCOAL._AC_SL1500_.jpg",
      tag: "High AOV",
    },
    {
      title: "Smartwool PhD Ski Light Elite Socks",
      asin: "B071LGMQ9B",
      price: 28,
      img: "https://m.media-amazon.com/images/I/71SXb1DQAZL._AC_SL1500_.jpg",
      tag: "Consumable",
    },
    {
      title: "Black Diamond Trail Pro Shock Poles",
      asin: "B07K5X7TMD",
      price: 99,
      img: "https://m.media-amazon.com/images/I/71MKjXD6nAL._AC_SL1500_.jpg",
      tag: "Accessory",
    },
  ],
  beach: [
    {
      title: "Hydro Flask 32oz Wide Mouth Water Bottle",
      asin: "B07TKH8LS8",
      price: 45,
      img: "https://m.media-amazon.com/images/I/71Bk3XA8yGL._AC_SL1500_.jpg",
      tag: "Best Seller",
    },
    {
      title: "Maui Jim Peahi Polarized Sunglasses",
      asin: "B00CPDEWH4",
      price: 189,
      img: "https://m.media-amazon.com/images/I/71fQ3pnK5rL._AC_SL1500_.jpg",
      tag: "High AOV",
    },
    {
      title: "Patagonia Torrentshell 3L Rain Jacket",
      asin: "B098RDMF27",
      price: 149,
      img: "https://m.media-amazon.com/images/I/71kBrM0WoLL._AC_SL1500_.jpg",
      tag: "High AOV",
    },
    {
      title: "Sun Bum SPF 50 Sunscreen Lotion 8oz",
      asin: "B003IUH2L4",
      price: 14,
      img: "https://m.media-amazon.com/images/I/71C3QVKxpDL._AC_SL1500_.jpg",
      tag: "Consumable",
    },
    {
      title: "DJI Mini 4 Pro Drone",
      asin: "B0CGR4BKGT",
      price: 759,
      img: "https://m.media-amazon.com/images/I/71ZklnP9MtL._AC_SL1500_.jpg",
      tag: "High AOV",
    },
  ],
};
```

---

## 6. FIVE NEW VENUES — PASTE-READY JAVASCRIPT

Carried forward from yesterday (none were applied). Same venues, still valid gaps.

```javascript
// ── Paste anywhere inside the VENUES array, before the closing ]; ──
// After pasting, also add to AP_CONTINENT patch section:
//   BEY:"asia",  (Beirut — for ski_mzaar)
//   RAK:"africa", (Marrakech — for ski_oukaimeden)
// CMB (Colombo) and MLE (Malé) are already in AP_CONTINENT.

{id:"beach_maldives", category:"beach",
  title:"Maldives Atolls", location:"North Malé Atoll, Maldives",
  lat:4.1755, lon:73.5093, ap:"MLE",
  icon:"🏝️", rating:4.98, reviews:6800,
  gradient:"linear-gradient(160deg,#001a33,#003d7a,#0077cc)", accent:"#66ccff",
  tags:["Overwater Bungalows","Bioluminescent Lagoon"],
  photo:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"},

{id:"beach_mirissa", category:"beach",
  title:"Mirissa Beach", location:"Matara District, Sri Lanka",
  lat:5.9469, lon:80.4584, ap:"CMB",
  icon:"🏝️", rating:4.87, reviews:4200,
  gradient:"linear-gradient(160deg,#001e14,#003d28,#00703f)", accent:"#44cc88",
  tags:["Blue Whale Watching","Coconut Hill Sunrise"],
  photo:"https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55"},

{id:"beach_oludeniz", category:"beach",
  title:"Ölüdeniz Blue Lagoon", location:"Fethiye, Turkey",
  lat:36.5514, lon:29.1139, ap:"DLM",
  icon:"🏖️", rating:4.94, reviews:18600,
  gradient:"linear-gradient(160deg,#00132b,#002e6e,#0055bb)", accent:"#3388ee",
  tags:["Paragliding From Babadağ","Protected Blue Lagoon"],
  photo:"https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

{id:"ski_mzaar", category:"skiing",
  title:"Mzaar Kfardebian", location:"Mount Lebanon, Lebanon",
  lat:34.0703, lon:35.9742, ap:"BEY",
  icon:"⛷️", rating:4.78, reviews:2640,
  gradient:"linear-gradient(160deg,#1a0d2e,#3d2080,#6040c0)", accent:"#9980e0",
  tags:["Middle East's Largest Resort","Cedar Mountains"],
  photo:"https://images.unsplash.com/photo-1518281420975-50db6e5d0a97?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  skiPass:"independent"},

{id:"ski_oukaimeden", category:"skiing",
  title:"Oukaimeden Ski Resort", location:"High Atlas Mountains, Morocco",
  lat:31.2082, lon:-7.8600, ap:"RAK",
  icon:"⛷️", rating:4.61, reviews:1180,
  gradient:"linear-gradient(160deg,#1a0a00,#4d2a00,#8c5000)", accent:"#cc8844",
  tags:["Africa's Highest Ski Resort","Atlas Views","Berber Villages"],
  photo:"https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass:"independent"},
```

---

## 7. INLINE FIXES APPLIED THIS RUN

| # | Type | Venue | Change |
|---|------|-------|--------|
| 1 | Airport | `appi-kogen-s2` | `ap:"AXT"` → `ap:"NRT"` |
| 2 | Airport | `madarao-mountain-s22` | `ap:"NGO"` → `ap:"NRT"` |
| 3 | Airport | `tsugaike-kogen-s25` | `ap:"NGO"` → `ap:"NRT"` |
| 4 | Tags | `agios-prokopios-t2` | "Party Beach/Beach Bars/Vibrant" → "Blue Flag Beach/Golden Sand/Shallow Water/Family Friendly" |
| 5 | Tags | `mana-island-fiji-t12` | "Party Beach/Beach Bars/Vibrant" → "Private Island/Marine Reserve/Snorkeling/Untouched" |
| 6 | Tags | `natadola-beach-t9` | "Blue Flag" → "Calm Lagoon/Horseback Riding/Fiji's Best Beach" |
| 7 | Tags | `madarao-mountain-s22` | "Night Skiing" → "Deep Powder" (no night skiing at Madarao) |

---

## PM NOTE

Three items:

1. **SH ski scoring: clock is ticking.** Remarkables and Thredbo open June 7–14 — within 3 weeks. 6 venues will score 0 through their entire peak season. Algorithm fix is 2 lines, but needs PM critique. Put it on the agenda for May 25 or explicitly defer.

2. **GEAR_ITEMS moving to known-skipped.** Fourth consecutive flag. Moving it to `known-skipped.md` this run. Paste block is in §5 above — verify ASINs and it ships in 15 minutes. At 10K MAU this is ~$45/mo.

3. **Maldives is still missing.** Third consecutive flag. It's the highest-prestige beach destination on earth and a trust-eroding gap for any serious travel app. 3-minute paste, venue is in §6 above.
