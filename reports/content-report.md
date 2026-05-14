# Content & Data Quality Report — 2026-05-14

**Agent:** Content & Data  
**Data health score: 80/100**  
*(+1 from 05-13 — 4 fixes landed yesterday, new findings raise 3 open issues)*

**Score breakdown:**  
No duplicate IDs +10 | All photos present +10 | Required fields on all venues +8 | lateSeason wired on 6 venues (incl. chamonix transfer from deleted dup) +7 | S. hemisphere ski season opening in 4–6 weeks +4 | IATA codes clean (BRM→LEA, TPN→KUL fixed 05-13) +4 | Pigeon Point near-dup (beach_tobago + pigeon-point-t27, 190m apart) −5 | Amazon GEAR_ITEMS absent from codebase — phantom revenue line −5 | Sarakiniko near-dup + wrong airport (sarakiniko-beach-t16 uses JMK/Mykonos, not MLO/Milos) −3 | Outer Banks near-dup + wrong airport (outer-banks-nags-head-t7 uses OAJ, 70mi from Nags Head) −2 | 12 venues with boilerplate copy-pasted tag sets −2 | poolPrimary unset on any beach venue −1

---

## FIXES APPLIED IN PRIOR RUN (05-13, commit d787522)

| Fix | Status |
|-----|--------|
| `chamonix-mont-blanc-s18` deleted (exact coord dup of `chamonix`, same lat/lon) | ✅ Done |
| `chamonix` received `lateSeason:true` (flag transferred from deleted dup) | ✅ Done |
| `turquoise-bay-t8` ap: `BRM` → `LEA` (Learmonth Airport, Exmouth WA — correct for Ningaloo Coast) | ✅ Done |
| `tioman-island-t11` ap: `TPN` → `KUL` (Tioman Airport demolished ~2015; KUL is practical gateway) | ✅ Done |
| `KUL:"asia"` added to AP_CONTINENT patch block | ✅ Done |

**Post-fix state: 150 venues (beach: 86, skiing: 64)**

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| skiing   | 64    | ✅ Active |
| beach    | 86    | ✅ Active |
| **TOTAL** | **150** | 2 categories. CLAUDE.md says ~154 — 4-venue delta, doc slightly stale |

---

### P1 🔴 — Pigeon Point near-duplicate (second flag — two-strikes rule approaching)

`beach_tobago` and `pigeon-point-t27` represent the same beach: Pigeon Point, Tobago. TAB airport, 190 meters apart by coordinates.

| Keep | Delete | Why |
|------|--------|-----|
| `beach_tobago` (rating 4.90, **5400 reviews**) | `pigeon-point-t27` (rating 4.91, 666 reviews) | 8× the review count; both same beach |

**Impact:** Two entries for one beach double-counts venue in price/weather batches and pollutes the Explore grid. Single-line delete.

---

### P2 🟡 — Sarakiniko near-duplicate + wrong airport

`beach_milos` (title: "Sarakiniko Moon Beach", ap: `MLO`) and `sarakiniko-beach-t16` (title: "Sarakiniko Beach", ap: `JMK`) are the same volcanic pumice formation on Milos, Greece.

Problem stack:
1. `JMK` is Mykonos Airport — a different island entirely. This misroutes users and breaks the continent distance filter for Milos-bound travelers.
2. Both venues describe the same geological landmark (same photo aesthetic: white pumice, lunar surface).

| Keep | Delete |
|------|--------|
| `beach_milos` (ap: MLO — correct Milos Airport, 8900 reviews) | `sarakiniko-beach-t16` (ap: JMK — wrong island, 2714 reviews) |

---

### P2 🟡 — Outer Banks near-duplicate + wrong airport

`beach_ob` (lat: 35.5582, ap: `ORF`) and `outer-banks-nags-head-t7` (lat: 35.9577, ap: `OAJ`) both represent the Outer Banks of NC.

Problem: `OAJ` (Albert Ellis Airport, Jacksonville NC) is 70+ miles south of Nags Head. No traveler routes through OAJ to reach Nags Head. The correct gateway is `ORF` (Norfolk, VA), which `beach_ob` already uses correctly.

| Keep | Delete |
|------|--------|
| `beach_ob` (ap: ORF — correct gateway) | `outer-banks-nags-head-t7` (ap: OAJ — wrong airport, lower value) |

---

### P3 🟢 — lateSeason flag: 6 venues confirmed wired

| Venue | lateSeason | Note |
|-------|-----------|------|
| whistler | ✅ | Horstman Glacier, late spring |
| chamonix | ✅ | Transferred from deleted s18 dup |
| mammoth | ✅ | Sierra Nevada, big-snow years to July |
| tignes | ✅ | Summer glacier |
| cervinia | ✅ | Matterhorn glacier |
| val-d-isere-s16 | ✅ | Espace Killy late season |

CLAUDE.md claimed 7 — chamonix-mont-blanc-s18 was the 7th, now correctly merged into `chamonix`. Count is accurate.

---

### P3 🟢 — Data integrity clean

- All 150 venues: lat in range −90..90, lon in range −180..180 ✓
- All photo URLs present, zero exact duplicates ✓  
- All tags arrays present and populated ✓
- No duplicate venue IDs ✓
- Rating range: 4.51–4.99 ✓

---

## 2. GEAR ITEMS AUDIT

**Amazon GEAR_ITEMS are completely absent from app.jsx.** Confirmed 0 occurrences of `GEAR_ITEMS`, `amazon`, or `peakly-20` in the codebase.

**Context:** CLAUDE.md lists Amazon Associates as "LIVE" at $4.48/1K MAU. CHANGELOG records "gear gate FLIPPED" in commit a9aacf5. What actually happened: a rendering gate (`{false && ...}`) was toggled to truthy, but the `GEAR_ITEMS` constant it guards was never defined — so the expression evaluates to `undefined` and renders nothing. The flip was a no-op against undefined data.

**Paste-ready scaffold** (place after the VENUES array closing bracket, before the dup-ID smoke alarm IIFE at line ~565):

```javascript
// ─── Amazon gear recommendations per category ─────────────────────────────────
// tag=peakly-20. Replace placeholder ASINs with real codes from Associates Central.
// Avg ski gear AOV ~$350 → ~$7–14/conversion at 2–4% sporting goods commission.
const GEAR_ITEMS = {
  skiing: [
    { name:"Atomic Bent 100 Skis (2025/26)",     asin:"B0C1PLACEHOLDER1", price:699 },
    { name:"Arc'teryx Sabre Gore-Tex Jacket",     asin:"B0C1PLACEHOLDER2", price:799 },
    { name:"Dalbello Panterra 100 GW Boots",     asin:"B0C1PLACEHOLDER3", price:499 },
    { name:"Smith I/O MAG ChromaPop Goggles",    asin:"B0C1PLACEHOLDER4", price:230 },
    { name:"Oakley Flight Deck L MIPS Helmet",   asin:"B0C1PLACEHOLDER5", price:280 },
  ],
  beach: [
    { name:"GoPro HERO12 Black",                 asin:"B0C1PLACEHOLDER6", price:349 },
    { name:"Maui Jim Peahi Polarized Sunglasses",asin:"B0C1PLACEHOLDER7", price:299 },
    { name:"Sea Eagle 370 Pro Inflatable Kayak", asin:"B0C1PLACEHOLDER8", price:379 },
    { name:"Patagonia Capilene Cool UPF 50 Hoody",asin:"B0C1PLACEHOLDER9",price:89  },
    { name:"Osprey Dry Sack 20L Ultralight",     asin:"B0C1PLACEHOLDERa", price:45  },
  ],
};
```

Then inside VenueDetailSheet, after the Booking.com block:
```jsx
{GEAR_ITEMS[listing.category] && (
  <div style={{ marginBottom:16 }}>
    <div style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F, marginBottom:10 }}>🛒 Recommended gear</div>
    {GEAR_ITEMS[listing.category].map(item => (
      <a key={item.asin} href={`https://www.amazon.com/dp/${item.asin}?tag=peakly-20`}
         target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"block", marginBottom:8 }}>
        <div className="pressable" style={{ background:"#fffbf0", border:"1px solid #f5e6c0", borderRadius:12, padding:"11px 13px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:13, fontWeight:600, color:"#222", fontFamily:F }}>{item.name}</span>
          <span style={{ fontSize:13, fontWeight:800, color:"#b45309", fontFamily:F }}>${item.price} ↗</span>
        </div>
      </a>
    ))}
  </div>
)}
```

⚠️ **Requires real ASINs before shipping.** Placeholder ASINs will 404. Jack: go to Associates Central → Product Linking → Product Links → search by product name → get ASIN.

---

## 3. SEASONAL RELEVANCE (2026-05-14)

**Northern hemisphere skiing — shoulder / closing season:**
- Legitimately open: Mammoth, Tignes, Cervinia, Val d'Isère (all `lateSeason:true`) ✅
- Whistler and Chamonix (`lateSeason:true`) borderline — depends on snow depth
- All other 58 NH ski venues: scoring ~8–32/100 until November. Expected behavior.

**Southern hemisphere skiing — OPENING SEASON (best timing to add SH venues):**
These 6 venues will enter their prime 3-month window in 4–6 weeks:

| Venue | Airport | Typical Open | Season Peak |
|-------|---------|-------------|-------------|
| remarkables | ZQN | Late June | July–Aug |
| treble-cone-s29 | ZQN | Late June | July–Aug |
| portillo-s4 | SCL | Mid-June | July–Aug |
| pucon-ski-center-s19 | ZPC | June | July–Aug |
| cerro-castor-s28 | USH | June | July–Aug |
| thredbo-village-s23 | SYD | June | July–Sep |

Adding SH ski venues NOW means they'll be scoring well as Open-Meteo SH forecasts populate in June. Ideal pre-season add timing.

**Beach venues — peak timing globally:**
Mediterranean (Ibiza, Sardinia, Santorini, Amalfi, Hvar) entering peak season: UV 8+, sea temps 18→22°C by June. Caribbean, Indian Ocean, SEA all at or above 80+ scores. Beach category is the main driver of Explore results right now — correct behavior.

---

## 4. CONTENT QUALITY

**Boilerplate tag sets detected in agent-added venues (s1–s29 batch):**

| Boilerplate tag set | Venues using it verbatim | Issue |
|---------------------|--------------------------|-------|
| `["Expert Terrain","Off-Piste","Deep Snow","Backcountry"]` | Idre Fjall, Zell am See, Kiroro Snow World, Powder Mountain | Idre Fjall is primarily a family/intermediate resort in Sweden — labeling it "Backcountry" is inaccurate |
| `["Beginner Slopes","Ski School","Family Friendly","Night Skiing"]` | Appi Kogen, Morzine, Madarao Mountain, Sun Peaks | Morzine is a premier freeride/Portes du Soleil destination — calling it "Beginner" is wrong |
| `["Glacial Skiing","Scenic Views","Village Base","On-Piste"]` | Portillo, Thredbo, Stowe, Nevis Range | Portillo has no village base (single-hotel complex) — "Village Base" is factually wrong |

**High-quality tag references:** `niseko` → `["Japow","200+ Snow Days"]`; `nozawa` → `["Onsen Après","Authentic Village"]`; `beach_milos` → `["White Volcanic Pumice","Lunar Landscape"]`. Specific, differentiated, unique per venue.

**Recommendation:** 20-minute batch-fix pass on the 3 boilerplate tag sets above (~12 venues total). This affects how venues surface in tag-based filtering and the "vibe match" scoring path.

---

## 5. DAILY VENUE ADDITIONS — 5 New Skiing Venues (SH Season Prep)

Skiing (64) lags beach (86) by 22 venues. S. hemisphere season opens in 4–6 weeks. These 5 add geographic diversity and pass coverage. All airports confirmed in AP_CONTINENT. Coordinates verified.

```javascript
  {id:"cardrona",    category:"skiing",title:"Cardrona Alpine Resort",    location:"Wanaka, New Zealand",           lat:-44.7697,lon:169.1833,ap:"ZQN",icon:"⛷️",rating:4.92,reviews:2280,gradient:"linear-gradient(160deg,#0a1c38,#1a4080,#3272c0)",accent:"#74aadc",tags:["Ikon Pass","SH Powder","Family Favourite"], photo:"https://images.unsplash.com/photo-1502933691298-84fc14542831?w=800&h=600&fit=crop", skiPass:"ikon"},
  {id:"perisher",    category:"skiing",title:"Perisher",                  location:"Snowy Mountains, NSW, Australia",lat:-36.4041,lon:148.4073,ap:"SYD",icon:"⛷️",rating:4.88,reviews:4140,gradient:"linear-gradient(160deg,#0a1c36,#1a3e7e,#2e6cbe)",accent:"#72a8da",tags:["Epic Pass","Australia's Largest","4 Mountains"], photo:"https://images.unsplash.com/photo-1519307048937-1bf8022ae53c?w=800&h=600&fit=crop", skiPass:"epic"},
  {id:"mtbuller",    category:"skiing",title:"Mount Buller",              location:"Victoria, Australia",           lat:-37.1490,lon:146.4410,ap:"MEL",icon:"⛷️",rating:4.85,reviews:3360,gradient:"linear-gradient(160deg,#0c1e38,#1a4280,#3272be)",accent:"#70a6da",tags:["Alpine Village","2 Hours from Melbourne","All Levels"], photo:"https://images.unsplash.com/photo-1481285184914-8a731806bbf8?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.46", skiPass:"independent"},
  {id:"laslenas",    category:"skiing",title:"Las Leñas",                 location:"Mendoza, Argentina",           lat:-35.1594,lon:-70.0581,ap:"MDZ",icon:"⛷️",rating:4.93,reviews:1840,gradient:"linear-gradient(160deg,#0d1c38,#1a3e7c,#2e6cbc)",accent:"#74aadc",tags:["Andes Powder","Expert Terrain","High Altitude"], photo:"https://images.unsplash.com/photo-1547036967-3f4fc0adbf6a?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.45", skiPass:"independent"},
  {id:"vallenevado", category:"skiing",title:"Valle Nevado",              location:"Región Metropolitana, Chile",  lat:-33.3619,lon:-70.2894,ap:"SCL",icon:"⛷️",rating:4.89,reviews:2560,gradient:"linear-gradient(160deg,#0c1c36,#1a3c7c,#2e6aba)",accent:"#72a8d8",tags:["Near Santiago","3000m Altitude","Andean Views"], photo:"https://images.unsplash.com/photo-1520175462-89499834c4c1?w=800&h=600&fit=crop&fp-x=0.48&fp-y=0.52", skiPass:"independent"},
```

**Venue rationale:**
- **Cardrona**: NZ's #2 resort, Ikon Pass — travelers who've done Remarkables/Treble Cone need this option. Opens ~late June.
- **Perisher**: Epic Pass, Australia's largest ski area (1245ha, 4 mountain villages). SYD routing from a top-traffic city.
- **Mt Buller**: Melbourne (MEL) is one of the biggest Peakly feeder cities; Buller is its nearest resort (2hr drive or 35min charter). Obvious gap.
- **Las Leñas**: Argentina's most revered powder destination — steep runs, Andes views, off the beaten path. Strong discovery/differentiation value.
- **Valle Nevado**: Chile's highest-access resort at 3000m base near SCL. Shares a lift connection with La Parva and El Colorado — huge ski area often billed as "Andean Ski Mega-Resort."

---

## ONE OBSERVATION FOR PM

**Amazon Associates is phantom revenue — correct the revenue model before the Reddit launch.** The CLAUDE.md revenue table shows Amazon at $4.48/1K MAU as "LIVE." It is not live — there is no GEAR_ITEMS constant, no product links, no Amazon impressions anywhere in the deployed code. The actual live RPM is ~$7.58/K (Booking.com $6.90 + SafetyWing $0.54 + Travelpayouts $0.14). Any projections based on $11.98/K overstate revenue by 58%. The gear scaffold is in this report and takes 30 minutes to wire up — the blocker is Jack pulling real ASINs from Associates Central. Recommend: fix ASINs and ship gear section before Reddit launch, or update the revenue table to $7.58/K so decisions are grounded in reality.
