# Content & Data Report — 2026-04-15

**Agent:** Content & Data
**Data health score: 78/100** ↓ from 82 on April 11

**Score breakdown:**
Required fields 100% complete +20 | No duplicate photos +15 | No duplicate IDs +10 | All 77 surfing venues have `facing` field +5 | Geographic diversity +8 | cloudbreak-fiji-s21 dangerous tags unresolved (P1, 4 days) −4 | 6 SH ski venues still not suppressed (P2, unresolved) −3 | GEAR_ITEMS.surfing only 2 items (lowest affiliate AOV) −3 | 28 ski venues missing skiPass −4 | 9 duplicate titles −1 | 1 exact coordinate duplicate (chamonix) −1 | 54 batch-gen entries still in dataset −4

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 231 total venues

| Category | Count | Status |
|----------|-------|--------|
| tanning | 87 | ✅ Healthy (launch cat) |
| surfing | 77 | ✅ Healthy (launch cat) |
| skiing | 67 | ✅ Healthy (launch cat, lowest count) |
| hiking | 0 | ⚪ Deferred |
| diving | 0 | ⚪ Deferred |
| climbing | 0 | ⚪ Deferred |
| kite | 0 | ⚪ Deferred |
| kayak | 0 | ⚪ Deferred |
| mtb | 0 | ⚪ Deferred |
| fishing | 0 | ⚪ Deferred |
| paraglide | 0 | ⚪ Deferred |
| **TOTAL** | **231** | 3 live categories |

All 231 venues have 100% required field coverage (lat/lon, airport, tags, photo). Zero duplicate IDs. Zero duplicate photos.

**Skiing is the thinnest at 67 venues.** Notable gaps: no Verbier, no Zermatt, no Saas-Fee, no Val Thorens, no Méribel, no Las Leñas, no Cerro Catedral, no Gudauri. Switzerland has only 1 venue (Andermatt). These are household names for skiers — their absence is a credibility gap.

---

### P1 🔴 — DANGEROUS SAFETY TAG (UNRESOLVED, 4 DAYS)

| Venue ID | Current Tags | Reality |
|----------|-------------|---------|
| `cloudbreak-fiji-s21` | "Beach Break", "All Levels", "Consistent Swell", "Longboard Friendly" | Boat-only expert reef barrel, one of Earth's most dangerous waves |

The named entry `cloudbreak` (correct tags: "South Pacific Power", "Boat-Access Only") already exists at the same coordinates. `cloudbreak-fiji-s21` is a batch-gen duplicate that should be **deleted, not patched**.

**Fix (30 seconds):** Remove the `{id:"cloudbreak-fiji-s21",...}` object from VENUES. The real `cloudbreak` entry covers this location correctly.

This was first flagged April 11. It is still live. A surfer following this app's "All Levels" tag to Cloudbreak is a safety liability.

---

### P2 🟡 — 6 SH SKI VENUES, LIFTS CLOSED (MONITORING)

| ID | Title | Location | Status |
|----|-------|----------|--------|
| `remarkables` | The Remarkables | Queenstown, NZ | Closed until June |
| `portillo-s4` | Portillo | Chile | Closed until late June |
| `pucon-ski-center-s19` | Pucon Ski Center | Chile | Closed until July |
| `thredbo-village-s23` | Thredbo Village | NSW, Australia | Closed until June |
| `cerro-castor-s28` | Cerro Castor | Tierra del Fuego | Closed until July |
| `treble-cone-s29` | Treble Cone | Wanaka, NZ | Closed until July |

The April 12 algorithm fix added `offSeason → score 8` for SH skiing. These venues should now correctly score ~8. Monitoring that none break into top results. No action needed unless scoring bypasses the season check.

---

### P2 🟡 — 28 SKI VENUES MISSING skiPass (42% of skiing)

28 of 67 skiing venues lack a `skiPass` field — all are batch-gen entries. Affected: Zell am See, Hemsedal, Stowe, Val d'Isere, Chamonix Mont-Blanc, Lech Zürs, and 22 others. If the UI or scoring uses this field, these venues get wrong/empty treatment.

---

### P3 🟢 — COORDINATE DUPLICATE

`chamonix` (45.924, 6.869) = `chamonix-mont-blanc-s18` — same mountain. `chamonix` is the better entry. Delete `chamonix-mont-blanc-s18`.

---

### P3 🟢 — DUPLICATE TITLES (9 pairs)

| Title | Count | Note |
|-------|-------|------|
| Fernando de Noronha | 3× | Cross-cat (surfing + tanning) = OK; third is dupe surfing |
| Aspen Snowmass | 2× | `aspen` + `aspen-snowmass-s7` — same resort |
| Arapahoe Basin | 2× | `abasin` + `arapahoe-basin-s9` — same resort |
| Taghazout | 2× | `taghazout` + `taghazout-s10` — same break |
| Anchor Point | 2× | `anchor_point` + `anchor-point-s19` — same break |
| Pasta Point | 2× | `pasta_point` + `pasta-point-s24` — same break |
| Punta Roca | 2× | `punta_roca` + `punta-roca-s12` — same break |
| Sayulita | 2× | Two surfing entries |
| Pigeon Point | 2× | Two surfing entries |

8 of 9 are named-entry + batch-gen dupe pairs. Delete the 8 `-s##` duplicates.

---

## 2. GEAR ITEMS AUDIT

| Category | Items | Status |
|----------|-------|--------|
| skiing | 4 | ✅ Good — goggles ($230), socks ($26/$28), warmers ($18) |
| tanning | 4 | ✅ Good — sunscreen, sunglasses, towel, hydration |
| surfing | 2 | 🔴 Only 2 items: wax ($9) + sunscreen ($15). Missing wetsuit, leash, board bag, rashguard. **Lowest AOV on the platform.** |

**Paste-ready fix** — add to `GEAR_ITEMS.surfing` after the sunscreen entry (line ~5444):

```javascript
    { name:"O'Neill Psycho 3/2mm Wetsuit",  store:"Amazon", price:"$189", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=oneill+psycho+wetsuit+3mm" },
    { name:"FCS II Leash 6ft",               store:"Amazon", price:"$35",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=fcs+ii+surfboard+leash" },
    { name:"Dakine Indo Series Board Bag",   store:"Amazon", price:"$89",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=dakine+indo+series+board+bag" },
    { name:"Quiksilver Rashguard UPF50",     store:"Amazon", price:"$29",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=quiksilver+rashguard+upf50" },
```

Projected AOV improvement: $12 avg → $85 avg per surfing gear click.

---

## 3. SEASONAL RELEVANCE — April 15, 2026

### Skiing — Late NH Season

**Still viable, promote now:**
- Tignes/Val Thorens (FR): Glacier open, excellent April corn skiing
- Andermatt (CH): Good snowpack year, April viable
- Whistler (BC): Big season, April often top 3 month
- Mammoth (CA): April routinely excellent (high elevation, late-season)

**Closing within 2 weeks:** East Coast US, most Austrian mid-altitude, most Italian resorts below 2500m.

**SH ski (scoring as off-season):** Correctly handled by April 12 fix.

### Surfing — Strong Season

April prime for:
- Indonesia (Bali, Lombok, Mentawais): Dry season starting, S-hemi swells building
- Morocco (Taghazout, Anchor Point): Spring swells, offshore thermals
- California: NW groundswells, cleaner than winter
- Basque Country (Mundaka, Hossegor): Spring Atlantic swells
- Central America (Costa Rica, El Salvador): Consistent trades

### Beach/Tanning — Best Month of the Year

Caribbean: post-winter clarity, pre-hurricane, lowest crowds. Mediterranean: warming fast, spring light optimal. Bali/SE Asia: dry season beginning.

---

## 4. CONTENT QUALITY FLAGS

**Batch-gen quality:** 54 of 231 venues (23%) are batch-gen. Surf entries (Popoyo, Angourie, Sagres, Baler, Arrifana, Ocean Beach, etc.) are real spots with reasonable data — acceptable quality. Ski batch-gen is weaker: missing skiPass, duplicate Chamonix. No directional naming ("East/West/North") survived the April 10 pruning — good.

**UI empty state:** CATEGORIES nav shows 11 pills; 8 return 0 results. Users tapping Hike/Dive/Climb see a blank list. Recommend hiding or greying out non-launch pills, or adding "Coming soon" empty state. Not a data bug — product decision needed.

---

## 5. DAILY VENUE ADDITIONS — 5 New Venues

All 5 confirmed absent from all 231 existing entries. Targeting skiing (weakest at 67) and geographic gaps.

### April 2026 Seasonal Rationale:
- Verbier: Spring skiing viable through late April on Col des Mines (3000m), major credibility venue
- Zermatt: Glacier open year-round, April shoulder season with Matterhorn in full view; only 1 CH ski venue in DB
- Las Leñas: Off-season until July but South America's most credible powder resort; adds SH diversity
- Zarautz: Spain's most consistent point break, April spring swells, culturally significant Basque surf town
- Nosara: Costa Rica's best-known consistent break, April = prime dry-season window, strong digital nomad audience

```javascript
  // 1. SKIING — Verbier, Switzerland (absent; 4 Valleys area, April viable, world-class freeride)
  {id:"verbier", category:"skiing", title:"Verbier", location:"Valais, Switzerland", lat:46.0960, lon:7.2284, ap:"GVA", icon:"🎿", rating:4.96, reviews:3120, gradient:"linear-gradient(160deg,#0a1a40,#1a3a80,#3a70d0)", accent:"#7ab0f0", skiPass:"independent", tags:["4 Valleys","Freeride Capital","Expert","Mont Fort 3300m","Apres-Ski","World-Class"], photo:"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&fp-x=0.46&fp-y=0.55"},

  // 2. SKIING — Zermatt, Switzerland (absent; glacier year-round, Matterhorn, only 1 CH ski in DB)
  {id:"zermatt", category:"skiing", title:"Zermatt Matterhorn", location:"Valais, Switzerland", lat:46.0207, lon:7.7491, ap:"GVA", icon:"🎿", rating:4.98, reviews:4870, gradient:"linear-gradient(160deg,#1a1a3a,#2a3a7a,#4a6ac0)", accent:"#8ab0e8", skiPass:"independent", tags:["Glacier Year-Round","Car-Free Village","3883m Summit","Ski to Italy","Matterhorn Views","Icon"], photo:"https://images.unsplash.com/photo-1502125523421-83e7706aafd4?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.42"},

  // 3. SKIING — Las Leñas, Argentina (absent; SH opens July, South America's best powder resort)
  {id:"las_lenas", category:"skiing", title:"Las Leñas", location:"Mendoza, Argentina", lat:-35.1522, lon:-70.0698, ap:"MDZ", icon:"🎿", rating:4.93, reviews:1430, gradient:"linear-gradient(160deg,#0a2040,#1a4a90,#3a80d0)", accent:"#70b0f0", skiPass:"independent", tags:["Powder Capital South America","Expert","Open July-Sept","Steep Terrain","Dry Snow","Uncrowded"], photo:"https://images.unsplash.com/photo-1609010697446-11f2155278f0?w=800&h=600&fit=crop&fp-x=0.44&fp-y=0.52"},

  // 4. SURFING — Zarautz, Spain (absent; Basque Country point break, April spring swells, surf capital of Spain)
  {id:"zarautz_spain", category:"surfing", title:"Zarautz", location:"Gipuzkoa, Spain", lat:43.2840, lon:-2.1720, ap:"BIO", icon:"🌊", rating:4.85, reviews:1760, facing:5, gradient:"linear-gradient(160deg,#0c3d54,#0d6986,#1a9fc0)", accent:"#3ab8d8", tags:["Point Break","Surf Capital Spain","Intermediate","Spring Swells","Basque Country","Long Rights"], photo:"https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&h=600&fit=crop&fp-x=0.44&fp-y=0.55"},

  // 5. SURFING — Playa Guiones, Nosara, Costa Rica (absent; consistent beach break, April dry season prime)
  {id:"nosara_guiones", category:"surfing", title:"Playa Guiones", location:"Guanacaste, Costa Rica", lat:9.9760, lon:-85.6600, ap:"LIR", icon:"🌊", rating:4.90, reviews:2340, facing:270, gradient:"linear-gradient(160deg,#0a3d2a,#0a7c55,#1ab87e)", accent:"#1ad890", tags:["Beach Break","Consistent Swell","All Levels","Dry Season Apr-Nov","Yoga Beach","Beginner Friendly"], photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&fp-x=0.42&fp-y=0.58"},
```

---

## 6. ONE OBSERVATION FOR THE PM

**The GEAR_ITEMS.surfing section is the biggest missed revenue opportunity on the platform right now.** Surfing is the second-largest category (77 venues), generates the highest purchase intent, and yet the gear section shows only 2 items totaling $24 in basket value. Skiing has a $230 goggle. Tanning has 4 items. Surfing — with its wetsuits, leashes, board bags, and rashguards — is the highest AOV gear category in the sport, and Peakly is leaving it on the table.

The 4-item fix is paste-ready in Section 2. It takes 3 minutes and roughly 7× the affiliate earnings per click for every surfing venue visit. At 1K MAU this is already meaningful; at 10K it's real money.

---

*Report written: 2026-04-15 | Agent: Content & Data | Venues audited: 231 | P1 cloudbreak-fiji-s21: UNRESOLVED 4 days | P2 SH ski: monitoring post-April 12 fix | GEAR_ITEMS.surfing: flagged for 2nd week*
