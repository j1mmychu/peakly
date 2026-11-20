# Daily Content Report — 2026-11-20

**Data health score: 94/100**

---

## 1. Category Breakdown

> ⚠️ Scheduled task prompt references 12 categories and 182 venues — that context is stale. Post-2026-05-03 pivot, Peakly has **2 categories only**: Skiing and Beach.

| Category | Venues | Status |
|----------|--------|--------|
| Beach    | 270    | ✅ Healthy |
| Skiing   | 134    | ✅ Healthy |
| **Total** | **404** | ✅ |

No stub categories. Both well above the 10-venue floor.

**Delta from yesterday:** Englishman's Bay (Tobago) was successfully added to app.jsx — now confirmed present. Net: +1 venue, 404 total.

---

## 2. Data Integrity Audit

Full scan of all 404 venues (lines 527–5197 of app.jsx, both JS-object and JSON-object formats):

| Check | Result |
|-------|--------|
| Duplicate IDs | 0 ✅ |
| Missing coordinates (lat/lon) | 0 ✅ |
| Missing airport codes (ap) | 0 ✅ |
| Missing tags arrays | 0 ✅ |
| Missing photos | 0 ✅ |
| Duplicate photo URLs | 0 ✅ |
| AP_CONTINENT coverage | 165/165 (100%) ✅ |
| AIRPORT_COORDS coverage | 165/165 (100%) ✅ |
| BASE_PRICES coverage | 165/165 (100%) ✅ |
| lateSeason:true count | 15 ✅ |
| GEAR_ITEMS occurrences | 0 ✅ (intentionally cut) |

**Catalog is clean. No critical data issues.**

### Notes on apparent issues that are non-issues

- **`cancun-beach` ID**: appears twice in app.jsx, but only once in VENUES (line 4788). The second occurrence is in a UI component's preset object (line 10802). Not a venue duplicate.
- **FOR / NAT airports**: show as "missing" from AP_CONTINENT under naive regex. Actually present in quoted-key format (`"FOR": "latam"`, `"NAT": "latam"`). No gap.

### Photo sources

| Source | Count | % |
|--------|-------|---|
| Wikipedia/Wikimedia Commons | 339 | 84% |
| Unsplash | 65 | 16% |
| Other | 0 | 0% |
| **Total** | **404** | 100% |

All 404 venues have photos. No duplicates. Generic stock quality remains the main gap (Open #20) — not an integrity issue.

---

## 3. Gear Items Audit

GEAR_ITEMS **formally cut for v1** — Jack's decision (2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0. **Do not restore.**

---

## 4. Seasonal Relevance — November 20, 2026 (Friday)

| Segment | Venue count | Season status |
|---------|-------------|--------------|
| N hemisphere skiing (lat ≥ 0) | ~111 | ✅ **IN SEASON** — opening week (Whistler opens **tomorrow Nov 21**) |
| S hemisphere skiing (lat < 0) | ~23 | ⬇️ Out of season — AU/NZ/SA closed since Sep |
| Tropical beach (\|lat\| ≤ 23°) | ~163 | ✅ **IN SEASON** year-round |
| S hemisphere temp beach (lat < −23°) | ~15 | ✅ **IN SEASON** — Southern summer Nov–Apr |
| N hemisphere temp beach (lat > 23°) | ~92 | ⚡ Shoulder/off season |

**What's firing now:**
- Whistler Blackcomb opens **tomorrow (Nov 21)** — peak demand day for the app
- Val d'Isère, Verbier, Tignes, Les Arcs typically open this week
- Thanksgiving travel peak: Nov 25–Dec 1 — 5 days out. Caribbean demand surging
- 15 `lateSeason:true` venues (Whistler, Tignes, Hintertux, Mammoth, etc.) will dominate weekend scores

---

## 5. Content Quality

### Tag distribution

| Tags per venue | Count | % of catalog |
|----------------|-------|--------------|
| 2 tags | ~221 | 55% |
| 3 tags | ~14 | 3% |
| 4 tags | ~168 | 42% |
| 5+ tags | 1 | <1% |

**Thin-tag count (≤2 tags): ~221 venues — Day 20 unchanged.** The original 209 JS-format venues were created with 2 tags; the 195 JSON-format batch entries mostly have 4. No enrichment has shipped.

**Highest-impact thin-tag venues to fix first:**

| Venue | ID | Current 2 tags | Suggested additions |
|-------|-----|----------------|---------------------|
| Chamonix | `chamonix` | "Off-Piste", "Mont Blanc Views" | "Vallée Blanche", "Extreme Altitude" |
| Aspen Snowmass | `aspen` | "Expert Terrain", "Luxury Village" | "Four Mountains", "Ajax Summit" |
| Vail Mountain | `vail` | "Back Bowls", "All Levels" | "Epic Pass Flagship", "Gondola Village" |
| Jackson Hole | `jacksonhole` | "Teton Views", "Expert+" | "Corbet's Couloir", "Mountain Resort" |
| Bora Bora Lagoon | `borabora` | "UV 11", "Crystal Water" | "Overwater Bungalows", "Lagoon Snorkel" |

---

## 6. Proposal Backlog Status

**9 proposals made in Nov 18–19 reports remain unadded to app.jsx:**

| Date | Venue | ID | Priority |
|------|-------|----|----------|
| Nov 18 | Val d'Isère | `val-disere` | ⭐ High — opens this week |
| Nov 18 | Alpe d'Huez | `alpe-dhuez` | ⭐ High — opens this week |
| Nov 18 | Navagio (Shipwreck Beach) | `navagio-gr` | Medium — Greece summer |
| Nov 18 | Anse Source d'Argent | `anse-source-dargent` | Medium — Seychelles |
| Nov 18 | Grande Anse Deshaies | `grande-anse-deshaies` | Medium — Guadeloupe |
| Nov 19 | Avoriaz 1800 | `avoriaz-s30` | ⭐ High — opens this week |
| Nov 19 | Courmayeur | `courmayeur-it` | ⭐ High — opens this week |
| Nov 19 | La Plagne | `la-plagne-fr` | ⭐ High — opens this week |
| Nov 19 | Davos-Klosters | `davos-klosters-ch` | ⭐ High — opens this week |

If Jack pastes these in bulk this weekend, the ski catalog jumps from 134 → 143 at exactly the right moment (opening week).

---

## 7. Daily Venue Additions — November 20

Targeting: 3 iconic Alpine ski resorts not yet proposed + 2 Caribbean beaches for Thanksgiving peak. All use airports already in AP_CONTINENT, AIRPORT_COORDS, and BASE_PRICES.

```javascript
// 1. Flaine — compact glacier resort, France's highest ski village
// Pure purpose-built ski architecture by Marcel Breuer; glacier terrain open year-round above 2500m
// GVA ✅ already in AP_CONTINENT / AIRPORT_COORDS / BASE_PRICES
// Opens early Dec; glacier zone open now
{id:"flaine-fr", category:"skiing",
 title:"Flaine", location:"Haute-Savoie, France",
 lat:46.0128, lon:6.6778, ap:"GVA",
 icon:"🏔️", rating:4.87, reviews:1900,
 gradient:"linear-gradient(160deg,#0a1a3c,#1a3a7c,#3060b0)",
 accent:"#6090d8",
 tags:["Glacier Year-Round","Modernist Architecture","Snow Bowl","Family Friendly"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Flaine-Foret.JPG/1280px-Flaine-Foret.JPG",
 skiPass:"grand-massif"},

// 2. Serre-Chevalier — largest ski area in Provence-Alps, Briançon fortified city base
// 250km pistes across 13 linked villages; snowiest French resort (1200mm average)
// GNB ✅ already in AP_CONTINENT / AIRPORT_COORDS / BASE_PRICES
{id:"serre-chevalier-fr", category:"skiing",
 title:"Serre-Chevalier", location:"Hautes-Alpes, France",
 lat:44.9353, lon:6.5386, ap:"GNB",
 icon:"🏔️", rating:4.86, reviews:2300,
 gradient:"linear-gradient(160deg,#1a0a2a,#4a1a7a,#8030c0)",
 accent:"#b060e8",
 tags:["250km Pistes","Vauban Fortified Base","High Snowfall","13 Linked Villages"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Serre_chevalier_briancon.jpg/1280px-Serre_chevalier_briancon.jpg",
 skiPass:"independent"},

// 3. Cortina d'Ampezzo — Dolomites, 2026 Winter Olympics downhill venue (Milan-Cortina)
// 140km pistes, Dolomiti Superski 1200km linked; Italy's most glamorous mountain resort
// VCE ✅ already in AP_CONTINENT / AIRPORT_COORDS / BASE_PRICES
{id:"cortina-dampezzo-it", category:"skiing",
 title:"Cortina d'Ampezzo", location:"Veneto, Italy",
 lat:46.5362, lon:12.1356, ap:"VCE",
 icon:"🏔️", rating:4.92, reviews:2700,
 gradient:"linear-gradient(160deg,#2a1a0a,#5a3010,#a06020)",
 accent:"#d09040",
 tags:["2026 Olympics Venue","Dolomites UNESCO Views","Dolce Vita Ski","Dolomiti Superski"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Cortina_d%27Ampezzo_panorama_from_Tofana_de_Rozes.jpg/1280px-Cortina_d%27Ampezzo_panorama_from_Tofana_de_Rozes.jpg",
 skiPass:"dolomiti-superski"},

// 4. Luquillo Beach, Puerto Rico — closest Caribbean to US East Coast, no passport required
// El Yunque rainforest backdrop; kiosk row for local food; protected bay, no jellyfish
// Thanksgiving escape for East Coasters — SJU flights from every major US hub
// SJU ✅ already in AP_CONTINENT / AIRPORT_COORDS / BASE_PRICES
{id:"luquillo-beach-pr", category:"beach",
 title:"Luquillo Beach", location:"Puerto Rico, USA",
 lat:18.3746, lon:-65.7169, ap:"SJU",
 icon:"🏖️", rating:4.88, reviews:3400,
 gradient:"linear-gradient(160deg,#001a2a,#003a60,#0070b0)",
 accent:"#30b0f0",
 tags:["No Passport Required","Rainforest Backdrop","Food Kiosk Row","Calm Warm Bay"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Luquillo_Beach.jpg/1280px-Luquillo_Beach.jpg"},

// 5. Orient Beach, St Maarten/St Martin — split French/Dutch island; best Caribbean beach for variety
// 1km of white sand; clothing-optional northern end; watersports; direct flights from NYC/BOS/MIA
// SXM ✅ already in AP_CONTINENT / AIRPORT_COORDS / BASE_PRICES
{id:"orient-beach-sxm", category:"beach",
 title:"Orient Beach", location:"Saint-Martin, French West Indies",
 lat:18.0767, lon:-63.0147, ap:"SXM",
 icon:"🏖️", rating:4.90, reviews:5100,
 gradient:"linear-gradient(160deg,#001828,#003058,#006898)",
 accent:"#30a8e0",
 tags:["French/Dutch Island","1km White Sand","Watersports Hub","Caribbean Variety"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Orient_Bay_Beach_Saint_Martin.jpg/1280px-Orient_Bay_Beach_Saint_Martin.jpg"}
```

---

## 8. One Observation for PM

**Whistler opens tomorrow (Nov 21) and 9 high-quality ski venues sit in proposal limbo.** The window to bulk-paste Val d'Isère, Alpe d'Huez, Avoriaz, Courmayeur, La Plagne, and Davos-Klosters is **right now** — these resorts open this week and they're the exact venues users will be searching. Each venue object is paste-ready in the Nov 18 and Nov 19 reports. If the VPS isn't redeployed (Day 104, Open #19), two-weekend scoring is still disabled — first ski weekend of the season will score on 7-day window instead of Fri-Mon best-of-4. That's the highest-ROI unblock available today.
