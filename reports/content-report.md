# Peakly Content & Data Report — 2026-09-28

## Data Health Score: 91/100

**Deductions:**
- −5: 225 venues (55.7%) have exactly 2 tags — editorial minimum is 4. **Day 23 unchanged.** Blocking score from 96.
- −2: **NEW BUG — FOR (Fortaleza) and NAT (Natal) missing from AP_CONTINENT.** Two live beach venues affected: `beach_jericoacoara` (Jericoacoara Beach) and `beach_pipa_brazil` (Pipa Beach). Both are present in BASE_PRICES and AIRPORT_COORDS, so `getTypicalPrice` exact-match path works. But when falling back (home airport not in BASE_PRICES for that dest), `AP_CONTINENT[ap]` returns `undefined` → generic $800 fallback instead of correct `latam-na` $650. More critically: continent/region filters (`AP_CONTINENT[l.ap] === search.continent`) return false → these two venues are **invisible** to any region-filtered search. Fix: add `FOR:"latam", NAT:"latam"` to AP_CONTINENT. One-line paste, verified both airports are already in AIRPORT_COORDS.
- −1: Gili Trawangan duplicate (`beach_gilit` + `gili-trawangan`) — PM decision to rename Oct 5, tracked.

**Score change from yesterday:** 93 → 91 (new -2 for FOR/NAT AP_CONTINENT gap, GNB warning cleared since no live venue uses GNB)

**Status since yesterday:**
- ✅ app.jsx UNCHANGED since `96def81` (Sep 14) — **14 days no code changes**, no regressions
- ✅ All 404 venues pass brace balance, ID uniqueness, photo uniqueness checks
- ✅ VPS redeploy still pending (Day 50) — no content blockers added
- ✅ BASE_PRICES coverage: all 165 venue airports covered
- ✅ AIRPORT_COORDS: all 165 venue APs have coordinates  
- ❌ AP_CONTINENT: **2 venue APs missing** — FOR and NAT (new finding today)
- ✅ GEAR_ITEMS = 0 — Amazon CUT for v1 intact

---

## 1. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** ✅ |
| Duplicate titles | **1** ⚠️ (`beach_gilit` / `gili-trawangan`) |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| Venues with <2 tags | **0** ✅ |
| APs missing from AIRPORT_COORDS | **0** ✅ |
| APs missing from AP_CONTINENT | **2** ❌ — FOR, NAT |
| APs missing from BASE_PRICES | **0** ✅ |
| GEAR_ITEMS in source | **0** (Amazon cut for v1) ✅ |

**FOR / NAT AP_CONTINENT bug — paste-ready fix:**

```js
// In AP_CONTINENT object — add before the closing }
// Verified both are already in AIRPORT_COORDS (no haversine crash risk)
FOR:"latam",  // Pinto Martins International, Fortaleza, Ceará, Brazil
NAT:"latam",  // Governador Aluízio Alves International, Natal, Rio Grande do Norte, Brazil
```

Affected venues:
- `beach_jericoacoara` — Jericoacoara Beach, Ceará, Brazil, lat -2.7967, lon -40.5072
- `beach_pipa_brazil` — Pipa Beach, Rio Grande do Norte, Brazil, lat -6.2276, lon -35.0578

Both are S-hemisphere `beach` venues (lat < 0), so `getSeasonalMultiplier` uses the correct `venue.lat < 0` path and isSouthern is already true — no scoring bug there. The continent-filter invisibility is the primary issue.

**GNB / AIRPORT_COORDS warning (from yesterday):** No live venue uses GNB — issue is only a pre-paste risk for future Serre Chevalier proposals. Use `GVA` or `CMF` for any Briançon-area venue.

**Nusa Penida coverage note:** `beach_nusapenida` (Kelingking Secret Beach, lat -8.834/115.456) and `nusa-penida-bali` (lat -8.727/115.544) are both on Nusa Penida island, ~17km apart. These are two distinct beaches (Kelingking cliffs vs Crystal Bay / general island access). Not a duplicate — intentional multi-beach coverage, same as Boracay's 4 venues or Mykonos' 3. Not flagged.

---

## 2. Gear Items Audit

**GEAR_ITEMS is not present in app.jsx** — Amazon Associates cut for v1 per Jack's decision (2026-06-09). Correct and intentional. No action required.

---

## 3. Seasonal Relevance (Sep 28, 2026)

| Segment | Hemisphere | Status | Count |
|---------|-----------|--------|-------|
| Skiing | N-Hemisphere | **OFF SEASON** — opens Nov–Dec | 111 |
| Skiing | S-Hemisphere | **FULLY CLOSED** as of today | 23 |
| Skiing | lateSeason glaciers | **ACTIVE** (snow depth ≥ 0.5m check) | 15 |
| Beach - Tropical (±23°N) | Global | **IN SEASON** (year-round) | ~163 |
| Beach - Mediterranean/warm | N-Hemisphere | **SHOULDER PRIME** — warm water, low crowds, deal fares | ~81 |
| Beach - S-Hemisphere | S-Hemisphere | **SPRING PRIME** — peak scoring Sep–Feb, heating up now | ~69 |

**Glacier status today:** Hintertux (3250m) and Saas-Fee (3500m) are the two most reliably open now. The other 13 lateSeason venues are in pre-season training mode — open to coaches/race camps but not reliably scoring high for public booking. The scoring engine handles this correctly via `snow_depth_max >= 0.5m`.

**S-Hemisphere ski season:** Mt Buller and Mt Hotham (Australia) both close officially Sep 28 (today). All 23 S-Hem ski venues now fully off-season. Expected — scoring system handles correctly.

**Beach front page today (20 days to launch):** Strong. S-Hem spring prime leads: Cape Town, Cape Winelands, Sydney, Fernando de Noronha, Florianópolis, Aitutaki, Bay of Islands NZ. Tropical year-round solid: Maldives, Bora Bora, Cancún corridor, Seychelles, Bali. Mediterranean shoulder excellent timing: Santorini, Mykonos, Formentera, Sardinia, Turkey coast. This is as strong a beach front page as the product will show all year.

**Seasonal alert:** `beach_jericoacoara` (Jericoacoara, Brazil) is currently **invisble** to any continent-filtered search due to the FOR/AP_CONTINENT bug. Sep-Nov is shoulder to peak season for this venue. Fix the AP_CONTINENT entry before launch — 1 line.

---

## 4. Content Quality

**Tag distribution (Day 23 — standing issue):**

| Tag count | Venues |
|-----------|--------|
| 0 | 0 |
| 1 | 0 |
| **2** | **225 (55.7%)** ← editorial gap, Day 23 |
| 3 | 14 |
| 4 | 164 |
| 5 | 1 |

239 venues have fewer than 4 tags. Tags power search corpus recall and filter pills (Powder Day, Crystal Water, etc.). 56% of venues under-tagged means search returns sparser results than the catalog warrants.

**Under-tagged examples:**
- `beach_jericoacoara` (2 tags): add `Lençóis Maranhenses Nearby, Kitesurf Capital, Remote Adventure, Fortaleza Day Trip`
- `perissa-beach-santorini` (2 tags): add `Black Sand Beach, Volcanic Coast, Santorini South, Blue Dome Churches`
- `bigsky` → wait it's `big-sky-montana` (2 tags): add `Biggest Mountain in USA, Lone Peak, Montana Wilds, Uncrowded Runs`
- `kitzbuehel` (2 tags): add `Hahnenkamm Downhill, Tyrol Austria, Après-Ski Capital, World Cup Circuit`

**Batching estimate:** ~450 tag additions across 225 venues. Single-commit mass-edit, no architecture change. Only remaining content quality gap before launch.

---

## 5. Daily Venue Additions

**Context note:** This scheduled prompt references "182 venues, 12 categories." Stale state. Peakly has **2 categories only (skiing and beach)**, **404 venues**, and GEAR_ITEMS is intentionally absent. All proposals use airports already present in both AP_CONTINENT and AIRPORT_COORDS.

**Strategy today:** 2 beach (S-Hem spring prime, strategic CPT/GIG expansion) + 2 ski (early-season European openers, INN and CMF) + 1 beach (Caribbean year-round gap). All using existing safe airports with verified BASE_PRICES coverage.

```js
// PASTE INTO VENUES array — run node scripts/validate-venues.mjs first
// All 5 airports confirmed in AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES

// 1. Boulders Beach, Simon's Town — Cape Town's penguin beach; CPT is only 2 venues
// S-Hem spring prime, opens to swimming year-round, iconic African penguins
{id:"boulders-beach-cpt", category:"beach", title:"Boulders Beach", location:"Simon's Town, Cape Town, South Africa", lat:-34.1978, lon:18.4513, ap:"CPT", icon:"🏖️", rating:4.7, reviews:6800, gradient:"linear-gradient(160deg,#0c2030,#1c4870,#3878b8)", accent:"#78b8e0", tags:["African Penguin Colony","Granite Boulders","Cape Peninsula","Simon's Town"], photo:"https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// 2. Copacabana Beach — Rio's iconic 4km arc; GIG only has Ipanema so far
// S-Hem spring ramping (Oct peak), world-famous venue, major user intent
{id:"copacabana-beach-rio", category:"beach", title:"Copacabana Beach", location:"Rio de Janeiro, Brazil", lat:-22.9709, lon:-43.1823, ap:"GIG", icon:"🏖️", rating:4.8, reviews:29400, gradient:"linear-gradient(160deg,#0a1c38,#1a3a78,#2a6aaa)", accent:"#7ab0e8", tags:["Iconic 4km Arc","Copacabana Palace","Volleyball Capital","New Year Fireworks"], photo:"https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// 3. Obergurgl-Hochgurgl — Austria's highest ski village, opens Nov 23 (25 days after launch)
// INN is safe (4 existing venues). Most snow-sure early-season resort in Europe.
{id:"obergurgl-hochgurgl-at", category:"skiing", title:"Obergurgl-Hochgurgl", location:"Ötztal Alps, Tyrol, Austria", lat:46.8699, lon:11.0246, ap:"INN", icon:"⛷️", rating:4.8, reviews:8100, gradient:"linear-gradient(160deg,#0c1c36,#1a3c78,#2c6ab8)", accent:"#82b4e8", tags:["Highest Village Austria 1930m","Snow-Sure Early Opener","Top Mountain Linked","Family Friendly Glacier"], photo:"https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// 4. La Plagne / Paradiski — France's massive 225km domain, linked to Les Arcs (already in VENUES)
// CMF is safe (6 existing venues). Opens Dec 2. Paradiski second-largest linked domain.
{id:"la-plagne-paradiski-fr", category:"skiing", title:"La Plagne / Paradiski", location:"Tarentaise, Savoie, France", lat:45.5081, lon:6.6783, ap:"CMF", icon:"⛷️", rating:4.7, reviews:11200, gradient:"linear-gradient(160deg,#0e1c3c,#1c3a7e,#2c6ab8)", accent:"#7ab2e6", tags:["Paradiski 225km","Linked to Les Arcs","Belle Plagne Village","Olympic History 1992"], photo:"https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// 5. Búzios / Armação dos Búzios — Brazil's beach peninsula, 23 beaches, 2.5h from Rio
// GIG gateway. S-Hem spring ramping. Upscale Brazil beach town with international recognition.
{id:"buzios-brazil-gig", category:"beach", title:"Búzios Peninsula", location:"Rio de Janeiro State, Brazil", lat:-22.7489, lon:-41.8817, ap:"GIG", icon:"🏖️", rating:4.7, reviews:14600, gradient:"linear-gradient(160deg,#0a1e3c,#1a3c7e,#2a6aac)", accent:"#7ab2e6", tags:["23 Beaches Peninsula","Brigitte Bardot Discovery","Rua das Pedras Nightlife","S-Hem Spring Prime"], photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},
```

**Pre-paste checklist:**
1. Run `node scripts/validate-venues.mjs` with these in `data/venue-candidates.json`
2. `CPT` (Cape Town) — confirmed in AP_CONTINENT (`africa`) + AIRPORT_COORDS ✅
3. `GIG` (Rio de Janeiro) — confirmed in AP_CONTINENT (`latam`) + AIRPORT_COORDS ✅
4. `INN` (Innsbruck) — confirmed in AP_CONTINENT (`europe`) + AIRPORT_COORDS ✅
5. `CMF` (Chambéry) — confirmed in AP_CONTINENT (`europe`) + AIRPORT_COORDS ✅
6. **Do NOT use GNB (Grenoble)** — in AP_CONTINENT but MISSING from AIRPORT_COORDS. Use GVA or CMF for Serre Chevalier / Briançon-area venues.
7. **Do NOT use FOR or NAT** for new venues until AP_CONTINENT fix is applied (adding `FOR:"latam", NAT:"latam"` per §1 above).
8. **Do NOT use PDL (Azores), MXP (Milan), OSD (Åre-Östersund), PPS (Puerto Princesa)** — in AP_CONTINENT but NOT in AIRPORT_COORDS (same class of bug as GNB).

**Note on Obergurgl timing:** Opens Nov 23 (25 days post-launch). Adding it now means it's in the database when it opens. The off-season binary cap suppresses its score until Nov 23; `lateSeason:true` is NOT added since Obergurgl is a standard-altitude resort that just opens early, not a summer glacier. The scoring engine will correctly begin scoring it once snow_depth data confirms opening.

---

## 6. One Observation for PM

**The FOR/NAT AP_CONTINENT gap is a silent filter bug that actively harms two Brazilian beach venues at launch.** Jericoacoara and Pipa Beach — both genuinely world-class beaches in one of the top-traffic Brazilian coastal regions — are invisible to any user who applies a region filter (`latam`/South America) or whose home airport isn't in BASE_PRICES[FOR/NAT] (gets $800 fallback instead of the correct $650 range). The fix is one line in AP_CONTINENT: `FOR:"latam", NAT:"latam"`. It's in the same commit as the next app.jsx change, zero risk. Given that Oct is prime season for Northeast Brazil (Jericoacoara is globally famous for kitesurfing and sunset dunes), fixing this before the Oct 18 Reddit launch would recover two high-quality S-Hem shoulder venues from effective invisibility. Flag for whoever makes the next app.jsx commit.
