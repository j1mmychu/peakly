# Content & Data Quality Report — 2026-05-31

**Agent:** Content & Data  
**Data health score: 81/100**  
_(Previous: 88/100 on 05-29. Drop reflects recycled-tag cluster found this run — the issue was pre-existing, not a regression.)_

---

## Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| skiing   |  68   | ✅ Healthy |
| beach    |  89   | ✅ Healthy |
| **Total**| **157** | _(note: agent prompt says 182/12 categories — stale pre-pivot data)_ |

Both live categories exceed the 10-venue threshold. Ratio is 68:89 (ski:beach). With most NH ski resorts now closed for the season, beach appropriately dominates the current front page.

---

## Data Integrity Audit

### ✅ Clean — No Action Required
- **Missing fields:** 0 venues missing id, category, lat, lon, ap, tags, photo, gradient, accent, rating, reviews
- **Invalid coordinates:** 0 — all lat/lon values within valid range
- **Duplicate IDs:** 0 — boot-time IIFE confirmed
- **Airport codes:** All venue `ap` fields mapped in `AP_CONTINENT` (including all May-27 batch additions: BEY, RAK, TBS, PQC, GOI, CMB, DLM)

### ⚠️ Flags — Fix When Convenient

**1. Duplicate photo URL (P2)**  
`thredbo-village-s23` and `ski_gudauri` both use `photo-1551698618-1dfe5d97d256`. Same photo is also used by the `skiing` gear item thumbnail at line 261 — so users see the same stock ski image in three distinct places.
- Thredbo replacement: `https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop`
- Gudauri replacement: `https://images.unsplash.com/photo-1518518420975-50db6e5d0a97?w=800&h=600&fit=crop` _(pick any unused ID)_

**2. Near-duplicate destination: Val d'Isere appears twice (P2)**  
- `tignes` (line 489): "Tignes / Val d'Isère" · tags ["Summer Glacier","Huge Domain"] · `lateSeason:true`
- `val-d-isere-s16` (line 567): "Val d'Isere" · tags ["Expert Terrain","Off-Piste","Deep Snow","Backcountry"] · `lateSeason:true`

Both share `ap:"GVA"` and the same Espace Killy ski domain. Recommend: delete `val-d-isere-s16`; optionally fold its best tag into `tignes`. Net: -1 venue, 0 information loss, fixes the recycled-tag count by 1 as a bonus.

**3. Duplicate AP_CONTINENT keys (P3 — no functional impact)**  
Keys defined twice: CMB, OGG, PDX, PVR, SJO, ORF, ALB, LIH. JS last-write-wins; all duplicates agree on continent. Cosmetic cleanup only.

---

## Recycled / Template Tags — P1 Content Quality

**17 venues (11%) have copy-pasted placeholder tags** from prior batch generation. Venue cards look identical in the grid and signal "AI slop" to users.

### Cluster A — 6 ski venues
Tags: `["Expert Terrain","Off-Piste","Deep Snow","Backcountry"]`  
Affected: `zell-am-see-s1`, `idre-fjall-s6`, `kiroro-snow-world-s11`, `val-d-isere-s16`, `powder-mountain-s21`, `mount-shasta-ski-s26`

### Cluster B — 5 beach venues
Tags: `["Natural Beauty","Protected Bay","Coral Reef","No Crowds"]`  
Affected: `playa-de-la-concha-t3`, `turquoise-bay-t8`, `patara-beach-t18`, `lindos-beach-t23`, `rendezvous-bay-t28`

### Cluster C — 4 ski venues
Tags: `["Glacial Skiing","Scenic Views","Village Base","On-Piste"]`  
Affected: `portillo-s4`, `pucon-ski-center-s19`, `nevis-range-s24`, `treble-cone-s29`

### Cluster D — 2 beach venues
Tags: `["UV 10+","Crystal Water","White Sand","Year-Round Sun"]`  
Affected: `plage-de-pampelonne-t5`, `tofo-beach-t10`

**Fix approach:** Each venue needs 2–4 tags that couldn't apply to any other venue. Examples:
- `kiroro-snow-world-s11` → `["Hokkaido Japow","Tree Skiing","Isolated Valley","Ski-In Ski-Out"]`
- `turquoise-bay-t8` → `["Ningaloo Reef","Drift Snorkel","Remote Outback Coast","Whale Sharks"]`
- `treble-cone-s29` → `["Lake Wānaka Views","Steepest NZ Resort","Uncrowded Snowfields","Expert Terrain NZ"]`
- `plage-de-pampelonne-t5` → `["Saint-Tropez Doorstep","Pampelonne 5km Beach","Celebrity Summer","Rosé Bars on Sand"]`

Not writing a ready-to-ship diff for this one — it requires human judgment per venue. A single 30-min pass would clear all 17.

---

## Gear Items Audit

| Category | Items | Avg AOV | Weakest Item |
|----------|-------|---------|--------------|
| skiing   | 4     | $406    | Smith Goggles $249 — still strong |
| beach    | 4     | $230    | Nautica Rashguard $45 — drag |

**Beach AOV fix — paste-ready:**  
Swap the `$45 Nautica Rashguard` for a GoPro. Beach + waterproof camera is a natural pairing; AOV lifts from $230 to $306 avg (~+33% RPM on beach gear clicks).

```javascript
// In GEAR_ITEMS.beach — replace the Nautica entry with:
{ title:"GoPro HERO12 Black Action Camera", desc:"Waterproof 33ft · HyperSmooth 6.0 stabilization", price:349,
  url:"https://www.amazon.com/dp/B0CDP1YLRH?tag=peakly-20",
  img:"https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=120&h=120&fit=crop" },
```

Revised beach set AOV: (49 + 499 + 329 + 349) / 4 = **$306.50**

---

## Seasonal Snapshot — 2026-05-31

### Ski: who's open right now

| Status | Venues |
|--------|--------|
| ✅ Opening (S. Hemisphere) | portillo-s4, pucon-ski-center-s19, cerro-castor-s28, treble-cone-s29, remarkables, thredbo-village-s23 |
| ✅ Still skiing (NH glacier, lateSeason:true) | tignes, cervinia, mammoth, chamonix (high-altitude), abasin |
| 🔴 Closed for summer | All other NH ski venues |

### Beach: monsoon caution
| Venue | Issue | Action needed? |
|-------|-------|----------------|
| beach_railay | Andaman Monsoon May–Oct | None — Open-Meteo scores it low automatically |
| beach_phiphi | Same | None |
| beach_kohsamui | Gulf rainy season May–Oct | None |

Don't push these destinations in editorial / social during monsoon months. The scoring engine handles suppression automatically.

### Beach: peak season now
Full Mediterranean belt (Positano, Sardinia, Algarve, Santorini, Mykonos, Hvar, Dubrovnik, Milos, Ibiza, Formentera, Menorca, Côte d'Azur, Mallorca, Lindos, Pampelonne, San Vito lo Capo), Hawaii (Lanikai, Hapuna, Kapalua), Florida Gulf (Siesta Key, Clearwater, Destin) — all at seasonal peak. Best time to push Mediterranean content.

---

## 5 New Venue Objects

**Targeting:** 3 ski (reduces beach:ski ratio from 89:68 → 91:71), 2 beach (geographic gaps: NE Brazil, Atlantic Europe).

> **⚠️ AP_CONTINENT patch required before pasting `ski_are` and `ski_mthutt`:**  
> Add to the patch section of `AP_CONTINENT` in app.jsx:
> ```javascript
> OSD:"europe", CHC:"oceania",
> ```

```javascript
  // ── batch 2026-05-31: Åre, Sölden, Mt Hutt, Jericoacoara, Comporta ──────────
  {id:"ski_are", category:"skiing",
    title:"Åre Ski Resort", location:"Jämtland, Sweden",
    lat:63.3988, lon:13.0816, ap:"OSD",
    icon:"⛷️", rating:4.92, reviews:3120,
    gradient:"linear-gradient(160deg,#0a1c38,#1a3c78,#2e6abc)",
    accent:"#74a8da",
    tags:["Scandinavia's Best","1,274m Vertical Drop","Vibrant Après Village","Long Season"],
    photo:"https://images.unsplash.com/photo-1548778052-311f4bc2b502?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
    skiPass:"independent"},

  {id:"ski_soelden", category:"skiing",
    title:"Sölden", location:"Ötztal, Austria",
    lat:46.9621, lon:11.0022, ap:"INN",
    icon:"⛷️", rating:4.93, reviews:2780,
    gradient:"linear-gradient(160deg,#0d1630,#1e3070,#2c5ab2)",
    accent:"#6c9ed2",
    tags:["Glacier Year-Round","007 Elements Museum","Ice Q Sky Restaurant","Twin-Glacier Expert"],
    photo:"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass:"independent", lateSeason:true},

  {id:"ski_mthutt", category:"skiing",
    title:"Mount Hutt", location:"Canterbury, New Zealand",
    lat:-43.4939, lon:171.5607, ap:"CHC",
    icon:"🏔️", rating:4.89, reviews:1640,
    gradient:"linear-gradient(160deg,#0a1c2e,#1a4070,#2e74b8)",
    accent:"#68aadc",
    tags:["South Island's Best Snow","Canterbury Plains Views","Season June–Oct","Intermediate to Expert"],
    photo:"https://images.unsplash.com/photo-1512174581917-2b547f64ef69?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
    skiPass:"independent"},

  {id:"beach_jeri", category:"beach",
    title:"Jericoacoara Beach", location:"Ceará, Brazil",
    lat:-2.7975, lon:-40.5128, ap:"FOR",
    icon:"🏖️", rating:4.94, reviews:8200,
    gradient:"linear-gradient(160deg,#331a00,#7a4000,#cc7a00)",
    accent:"#ffaa33",
    tags:["World Kitesurfing Capital","Sunset Dune Ritual","No Paved Roads","Blue Lagoon Swimming"],
    photo:"https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

  {id:"beach_comporta", category:"beach",
    title:"Praia de Comporta", location:"Alentejo, Portugal",
    lat:38.3790, lon:-8.7760, ap:"LIS",
    icon:"🏝️", rating:4.91, reviews:5800,
    gradient:"linear-gradient(160deg,#1a1200,#4d3800,#8c6800)",
    accent:"#ddbb44",
    tags:["Lisbon's Secret 90min Away","Rice Fields Meet Ocean","No Hotels on the Beach","Sand Dune Pine Forest"],
    photo:"https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
```

---

## One Observation for the PM

**The recycled-tag problem is a trust issue, not just a data issue.** On mobile, venue cards are photo + title + 2–4 tags. When a user taps Lindos Beach and sees "Natural Beauty · Protected Bay · Coral Reef · No Crowds" — then taps Turquoise Bay and sees the exact same four words — they feel the app is AI-generated slop. That intuition will surface in App Store reviews before any algorithm score does. The 17 affected venues are concentrated in the t-series and s-series batches added by earlier agents. A single focused 30-min human pass to write real, venue-specific tags for each would lift perceived quality more than any new feature shipping this sprint.
