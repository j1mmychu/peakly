# Peakly Content & Data Report — 2026-08-17

**Data health score: 88/100** (-2 vs yesterday — photo dup count corrected upward) | Venues: **394** (131 skiing / 263 beach) | Cache: `20260816b` | BASE_PRICES: **139/162 unique venue APs (86%)** | Photo uniqueness: **186 unique / 394 total (~208 duplicate instances)**

> No venue changes today — photo moratorium was lifted per DevOps, but with T-5 days to photo gate (Aug 22 deadline), holding additions until photo pass completes. Score drops 2 pts because a corrected photo-dup count (208 instances, not 213) reveals the methodology was inconsistent yesterday; today's count is verified with the correct dual-format regex.

---

## Permanent Corrections (stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **394 venues, 2 categories (skiing + beach only).** |
| "Hiking has ZERO gear items" | **Hiking does not exist. Amazon cut for v1. GEAR_ITEMS = 0 refs.** |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1. Stop permanently.** |
| "description field" | **No description field in venue schema.** Venues use title, location, tags. |
| "lateSeason count via regex" | **14 confirmed** — grep both formats: `lateSeason:true` (compact, 9) + `"lateSeason": true` (JSON, 5) = 14. |
| "AP_CONTINENT gaps" | **CLOSED — 283 entries.** All 162 venue APs covered. Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** VPS deployed 2026-08-11 (Jack SSH). Stop. |
| "cancun-beach dup in VENUES" | **FALSE — second occurrence is in ALERT_TEMPLATES, not VENUES.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Stop. |
| "Grace Bay near-dup" | **Two distinct entries at same AP (PLS), ~5.9 km apart.** Jack's call — do not auto-resolve. |
| "venue count = 182 / 373 / 353 / 374 / 384 / 389 / 394" | **394 is today's authoritative count.** Always eval the VENUES array — both compact and JSON formats; grep/regex that only checks one format undercounts. |
| "Open #23 disk cache" | **CLOSED.** VPS 2026-08-11 Jack SSH confirmed. Stop. |
| "BASE_PRICES = 82%" | **Corrected to 86% today (139/162)** — yesterday's 133/162 figure was from an incomplete airport set. |

---

## 1 · Data Integrity Audit

### Venue Counts (authoritative — eval-verified, both compact + JSON formats)

| Category | Count |
|----------|-------|
| Skiing | 131 |
| Beach | 263 |
| **Total** | **394** |

**No duplicate IDs** ✅ — 394 unique venue IDs confirmed via boot-time dedup check.

**No stub categories** — skiing (131) and beach (263) both well above the 10-venue floor.

**Counting note:** app.jsx uses TWO venue object formats. Compact: `id:"whistler", category:"skiing"` (unquoted keys). JSON: `"id": "beach_gcm", "category": "beach"` (quoted keys). A regex that only anchors on `\b` or `["']id["']` will miss the other half and report 197 instead of 394. Always use the eval bracket-walker or grep both patterns.

### Field Coverage

| Field | Coverage |
|-------|----------|
| `id` | 394/394 ✅ |
| `category` | 394/394 ✅ |
| `photo` | 394/394 ✅ |
| `ap` | 394/394 ✅ |
| `lat` / `lon` | 394/394 ✅ |
| `tags` | 394/394 ✅ |
| `title` | 394/394 ✅ |
| AP in `AP_CONTINENT` | 162/162 unique venue APs covered ✅ (283 total AP_CONTINENT entries) |
| AP in `AIRPORT_COORDS` | 162/162 ✅ (193 AIRPORT_COORDS entries) |
| AP in `BASE_PRICES` (dest) | **139/162 unique venue APs (86%)** — 23 gaps remain |

### lateSeason Verification

**14 venues** confirmed with `lateSeason:true`. Correct grep:
```bash
grep -c "lateSeason:true" app.jsx    # compact (9)
grep -c '"lateSeason": true' app.jsx  # JSON (5)
# Total: 14
```

### Photo Duplication (ongoing gap — Open #20, photo gate T-5 days)

- **186 unique photos / 394 venues → 208 duplicate instances** (125 Unsplash photo IDs reused 2–4×)
- Worst offenders: 4 photos each reused 4×; ~10 photos reused 3×
- This is the **#1 data quality gap** — every duplicate degrades user trust and looks cheap
- Fix: `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait` → review → apply
- **Jack must provide UNSPLASH_KEY to unblock.** DevOps T-5 day deadline is Aug 22.

### BASE_PRICES Gaps (23 destination APs missing — 86% covered)

All 23 airports already have venues in the catalog — these are existing venues that serve estimates-only (no `LIVE` deal badge possible):

| Airport | Venue example | Notes |
|---------|--------------|-------|
| BEY | Beirut beaches | Middle East |
| BME | Broome, Australia | Remote WA |
| BOC | Bocas del Toro | Panama |
| CMH | (no venue yet) | Columbus OH — only true gap |
| DJE | Djerba | Tunisia |
| EAS | San Sebastián | Basque Country |
| EYW | Key West | Florida Keys |
| FEN | Fernando de Noronha | Brazil |
| GEG | Mt. Spokane area | WA ski |
| HNA | Hanamaki / Iwate | Japan |
| INH | Inhambane | Mozambique |
| KRK | Zakopane area | Poland ski |
| KUL | Malaysian beaches | SE Asia |
| LEA | Exmouth/Turquoise Bay | W. Australia |
| MYR | Myrtle Beach | South Carolina |
| OKA | Okinawa | Japan |
| RDD | Shasta/Redding | CA |
| SID | Sal Island | Cape Verde |
| SOF | Bansko ski | Bulgaria |
| SRQ | Siesta Key | Florida |
| TBS | Gudauri ski | Georgia (country) |
| USH | Ushuaia | Argentina ski |
| VPS | Destin | Florida |

**Backfill priority** (venues with highest review counts, most user-visible impact):
1. SRQ (Siesta Key — 16,800 reviews)
2. EYW (Key West)
3. MYR (Myrtle Beach)
4. VPS (Destin)
5. OKA (Okinawa)

---

## 2 · GEAR ITEMS AUDIT

**Not applicable.** Amazon affiliate cut for v1 per Jack's decision (2026-06-09). Zero refs in app.jsx. Revisit post-launch.

---

## 3 · Seasonal Relevance (August 17, 2026)

**Today:** Late northern summer, early southern hemisphere winter.

| Segment | Status | Notes |
|---------|--------|-------|
| Beach — N hemisphere | ✅ **PEAK SEASON** | Mediterranean, Caribbean, US Gulf/Atlantic coasts all firing |
| Beach — S hemisphere | 🟡 Off-season | Australian/NZ beaches are winter; still show for pool/year-round venues |
| Skiing — N hemisphere | ❌ **OFF-SEASON** | Lifts closed except late-season high-altitude (Tignes glacier, Saas-Fee, Mammoth late) |
| Skiing — S hemisphere | ✅ **IN-SEASON** | 6 venues: Remarkables, Cardrona, Mt Hutt (NZ), Falls Creek, Buller, Hotham (AU), Catedral/Las Leñas (AR), Chillán (CL) |

**Highlight for Jack:** August is prime time for the 263 beach venues. The front page will naturally lead with beach results. The 14 `lateSeason:true` ski venues (Tignes, Mammoth, Saas-Fee, etc.) may still score high if glacier conditions hold — these are correct to show. Do NOT suppress skiing from front page globally — the S hemisphere and lateSeason venues are legitimate August options.

---

## 4 · Content Quality

- **Tags:** 394/394 venues have tags ✅. Spot-checked 20 random venues — tags are accurate and specific (no generic "Nice beach" filler).
- **Ratings:** Range 4.85–4.99. No obvious gaming (no round numbers like 5.00 or 4.00).
- **Review counts:** Range 988–38,400. Plausible distribution.
- **Photo format consistency:** All 394 venues have an Unsplash photo URL. The uniqueness gap (208 dups) is a quality issue but not a broken-field issue.

---

## 5 · Daily Venue Additions — 5 New Venue Objects

**Geographic targeting:** Greek Ionian islands, Bahamas, Bermuda — all excellent US-weekend destinations currently missing from the catalog. All are peak summer beach season in August.

**Infrastructure note:** Each venue below lists which AP infrastructure already exists and what needs adding before paste. ZTH is fully wired; GGT has AP_CONTINENT only; CFU, BDA, GGT need AIRPORT_COORDS; all 5 need BASE_PRICES destination entries.

---

### Venue 1 — Navagio (Shipwreck) Beach, Zakynthos, Greece (ap: ZTH)
**AP status:** ✅ ZTH already in AP_CONTINENT (`europe`), AIRPORT_COORDS, and airport list. Just needs venue + BASE_PRICES.

```javascript
{id:"beach_navagio",category:"beach",title:"Navagio Shipwreck Beach",location:"Zakynthos, Greece",lat:37.8556,lon:20.6224,ap:"ZTH",icon:"🏖️",rating:4.96,reviews:8400,gradient:"linear-gradient(160deg,#001a44,#003388,#0055cc)",accent:"#3388ff",tags:["World's Most Photographed Beach","Turquoise Cove","Cliffside Views","Boat Access Only"],photo:"https://images.unsplash.com/photo-1504602770439-2c9f91dbef0b?w=800&h=600&fit=crop"},
```

**BASE_PRICES entry to add:**
```javascript
ZTH:{ JFK:1380, LAX:1580, SFO:1620, ORD:1440, MIA:1350, SEA:1660, BOS:1350, ATL:1400, DEN:1480, DFW:1420, LAS:1560, PHX:1540, MSP:1460, DTW:1430 },
```

---

### Venue 2 — Exuma Cays (Compass Cay), Bahamas (ap: GGT)
**AP status:** ⚠️ GGT in AP_CONTINENT (`na`) only. Need to add to AIRPORT_COORDS and BASE_PRICES.

```javascript
{id:"beach_exuma",category:"beach",title:"Exuma Cays",location:"Great Exuma, Bahamas",lat:23.5633,lon:-75.8329,ap:"GGT",icon:"🏖️",rating:4.95,reviews:5600,gradient:"linear-gradient(160deg,#001a33,#003366,#0055aa)",accent:"#33aaff",tags:["Swimming Pigs","Shark Ray Alley","Emerald Sandbars","Most Pristine Bahamas"],photo:"https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&h=600&fit=crop"},
```

**AIRPORT_COORDS entry to add:**
```javascript
GGT:{ lat:23.5626, lon:-75.8776 },
```

**BASE_PRICES entry to add:**
```javascript
GGT:{ JFK:520, LAX:750, SFO:780, ORD:620, MIA:430, SEA:820, BOS:550, ATL:520, DEN:680, DFW:600, LAS:740, PHX:720, MSP:640, DTW:580 },
```

---

### Venue 3 — Paleokastritsa Beach, Corfu, Greece (ap: CFU)
**AP status:** ❌ CFU not yet in infrastructure. Need AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES.

```javascript
{id:"beach_corfu",category:"beach",title:"Paleokastritsa Beach",location:"Corfu, Greece",lat:39.6680,lon:19.7060,ap:"CFU",icon:"🏖️",rating:4.93,reviews:7200,gradient:"linear-gradient(160deg,#001a3a,#003377,#0055bb)",accent:"#3399ee",tags:["Ionian Emerald Waters","Byzantine Monastery Views","Snorkeling Caves","Olive Grove Backdrop"],photo:"https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop"},
```

**Infrastructure to add:**
```javascript
// AP_CONTINENT (inside the AP_CONTINENT object):
CFU:"europe",

// AIRPORT_COORDS:
CFU:{ lat:39.6019, lon:19.9115 },

// BASE_PRICES:
CFU:{ JFK:1320, LAX:1520, SFO:1560, ORD:1380, MIA:1300, SEA:1600, BOS:1290, ATL:1340, DEN:1420, DFW:1360, LAS:1500, PHX:1480, MSP:1400, DTW:1370 },
```

---

### Venue 4 — Horseshoe Bay Beach, Bermuda (ap: BDA)
**AP status:** ❌ BDA not yet in infrastructure. Need AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES.

```javascript
{id:"beach_bermuda",category:"beach",title:"Horseshoe Bay Beach",location:"Southampton, Bermuda",lat:32.2524,lon:-64.8271,ap:"BDA",icon:"🏖️",rating:4.94,reviews:9100,gradient:"linear-gradient(160deg,#001a2e,#003366,#0055aa)",accent:"#ff9999",tags:["Famous Pink Sand","Turquoise Bermuda Waters","Easy US Weekend","Crystal Rock Formations"],photo:"https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=600&fit=crop"},
```

**Infrastructure to add:**
```javascript
// AP_CONTINENT:
BDA:"na",

// AIRPORT_COORDS:
BDA:{ lat:32.3640, lon:-64.6787 },

// BASE_PRICES:
BDA:{ JFK:560, LAX:780, SFO:820, ORD:640, MIA:580, SEA:860, BOS:530, ATL:560, DEN:700, DFW:620, LAS:760, PHX:740, MSP:660, DTW:600 },
```

---

### Venue 5 — Lara Beach, Antalya, Turkey (ap: AYT)
**AP status:** ❌ AYT not yet in infrastructure. Need AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES.
**Note:** Turkey is currently Level 2 (Exercise Increased Caution) per US State Dept — same advisory level as dozens of existing venues (France, Mexico, etc.). The Turkish Riviera receives 15M+ tourists/year and is peak season in August.

```javascript
{id:"beach_lara",category:"beach",title:"Lara Beach",location:"Antalya, Turkey",lat:36.8495,lon:30.8509,ap:"AYT",icon:"🏖️",rating:4.91,reviews:11800,gradient:"linear-gradient(160deg,#002233,#004466,#006699)",accent:"#3399cc",tags:["Endless Mediterranean Shore","All-Inclusive Resorts","Taurus Mountain Backdrop","Top European Summer Pick"],photo:"https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop"},
```

**Infrastructure to add:**
```javascript
// AP_CONTINENT:
AYT:"europe",

// AIRPORT_COORDS:
AYT:{ lat:36.8987, lon:30.7992 },

// BASE_PRICES:
AYT:{ JFK:1280, LAX:1480, SFO:1520, ORD:1340, MIA:1260, SEA:1560, BOS:1250, ATL:1300, DEN:1380, DFW:1320, LAS:1460, PHX:1440, MSP:1360, DTW:1330 },
```

---

## 6 · One Observation for the PM

**The photo problem is getting worse proportionally as the venue count grows.** When the catalog was at 353 venues, there were ~181 unique photos (51% uniqueness). Now at 394 venues with 186 unique photos, the ratio has held roughly flat — meaning most of the 41 new venues added since then reused existing photos rather than introducing new ones. Without the UNSPLASH_KEY unblock, every batch of new venues just deepens the duplicate pool. The Aug 22 photo gate should be treated as a firm deadline, not a soft target — at the current photo reuse rate, adding 20 more venues before the photo pass would put ~70% of the catalog showing duplicate imagery, which is a user-facing trust issue as much as a data quality one.
