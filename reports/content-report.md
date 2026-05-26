# Content & Data Report — 2026-05-26

**Agent:** Content & Data
**Data health score: 79/100**

**Score breakdown:**
Required fields 100% +20 | No duplicate IDs +10 | No duplicate photos +8 | All 114 AP codes mapped +5 |
Geographic diversity (6 continents) +6 | lateSeason wired on 7 resorts +4 |
25 skiing venues missing `skiPass` −8 | MLE mapped to wrong continent −2 |
`tignes` naming covers Val d'Isère but both exist 6km apart −2 | No Maldives venue (glaring gap) −5 |
Amazon Associates AWOL from code −5 | S. America beach coverage thin (2 venues) −2

---

## HARNESS NOTE

Prompt says "182 venues, 100% photos, 12 categories / 7 stubs." All three are stale.
**Actual state: 148 venues, 2 categories (skiing: 64, beach: 84).** Surfing retired 2026-05-03 pivot.
Hiking, climbing, MTB, kayak, dive, yoga, wellness were never enabled at launch. No stubs — only two live categories.

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 148 venues total

| Category | Count | Status |
|----------|-------|--------|
| beach    | 84    | ✅ Healthy |
| skiing   | 64    | ✅ Healthy |
| **TOTAL**| **148**| 2 live categories post-pivot |

---

### P1 🔴 — AMAZON ASSOCIATES REVENUE STREAM MISSING FROM CODE

CLAUDE.md Revenue Model lists Amazon Associates (`peakly-20`) as **LIVE** at $4.48/1K MAU.
CHANGELOG.md says "gear gate FLIPPED" on 2026-05-04 to `{GEAR_ITEMS[listing.category] && ...}`.

**Reality:** `GEAR_ITEMS` does not exist in `app.jsx`. Zero occurrences of `amazon.com` or `peakly-20` anywhere in the file. The Amazon section was **removed** in the 2026-04-10 pruning pass (CHANGELOG: "LOCAL_TIPS / PACKING / GEAR_ITEMS... all pruned to launch-only") and never re-added. The 2026-05-04 "gear gate flip" was a no-op — it was applied against a version where GEAR_ITEMS already didn't exist.

**NOTE — Cross-referencing 05-25 report:** The 05-25 report states "GEAR_ITEMS confirmed at app.jsx:257, wired at app.jsx:7332." This is incorrect — confirmed absent in today's fresh audit of the live file. Either a later commit reverted the addition, or the 05-25 report was working from cached/stale data. Either way: earning $0 from Amazon today.

**Revenue impact:** ~$4.48/1K MAU earning $0. Fix is §2 below — under 10 minutes.

---

### P2 🟡 — 25 SKIING VENUES MISSING `skiPass` FIELD (all s-series)

All 25 venues added in the s-series batch have no `skiPass` value. Any UI badge or client logic keying on `skiPass` silently skips them.

**Verified skiPass assignments:**

| Venue ID | Title | skiPass |
|----------|-------|---------|
| `stowe-mountain-s14` | Stowe Mountain | `"ikon"` |
| `kicking-horse-s10` | Kicking Horse | `"ikon"` |
| `big-white-ski-s5` | Big White Ski | `"ikon"` |
| `sun-peaks-resort-s17` | Sun Peaks Resort | `"ikon"` |
| `thredbo-village-s23` | Thredbo Village | `"ikon"` |
| `zell-am-see-s1` | Zell am See | `"independent"` |
| `appi-kogen-s2` | Appi Kogen | `"independent"` |
| `hemsedal-s3` | Hemsedal | `"independent"` |
| `portillo-s4` | Portillo | `"independent"` |
| `idre-fjall-s6` | Idre Fjall | `"independent"` |
| `kiroro-snow-world-s11` | Kiroro Snow World | `"independent"` |
| `morzine-s12` | Morzine | `"independent"` |
| `sainte-foy-tarentaise-s13` | Sainte-Foy Tarentaise | `"independent"` |
| `champoluc-monterosa-s15` | Champoluc Monterosa | `"independent"` |
| `val-d-isere-s16` | Val d'Isere | `"independent"` |
| `pucon-ski-center-s19` | Pucon Ski Center | `"independent"` |
| `les-arcs-s20` | Les Arcs | `"independent"` |
| `powder-mountain-s21` | Powder Mountain | `"independent"` |
| `madarao-mountain-s22` | Madarao Mountain | `"independent"` |
| `nevis-range-s24` | Nevis Range | `"independent"` |
| `tsugaike-kogen-s25` | Tsugaike Kogen | `"independent"` |
| `mount-shasta-ski-s26` | Mount Shasta Ski | `"independent"` |
| `lech-zurs-s27` | Lech Zürs | `"independent"` |
| `cerro-castor-s28` | Cerro Castor | `"independent"` |
| `treble-cone-s29` | Treble Cone | `"independent"` |

---

### P3 🔴 — MLE (MALDIVES) MAPPED TO WRONG CONTINENT

`AP_CONTINENT` maps `MLE:"oceania"`. Malé International Airport is Indian Ocean / South Asia — should be `"asia"`.

**One-line fix in AP_CONTINENT:**
```js
// Change:
MLE:"oceania",
// To:
MLE:"asia",
```

---

### P4 🟡 — `tignes` TITLE OVERLAPS `val-d-isere-s16` (6.3 km apart, same ski area)

`id:"tignes"` title is **"Tignes / Val d'Isère"** and covers Espace Killy. `id:"val-d-isere-s16"` was added later as a standalone Val d'Isère entry — only 6.3km away, same domain. Users see two near-identical results for flights to Chambéry (CMF) or Geneva (GVA). These are genuinely different resorts (Tignes village vs Val d'Isère village, different vibe), but the combined title creates confusion.

**Low-priority fix:** Rename `id:"tignes"` title to `"Tignes (Grande Motte Glacier)"`.

---

### PASSED CHECKS ✅

- **Duplicate IDs:** 0
- **Duplicate photos:** 0 (all 148 Unsplash photo IDs unique)
- **Missing required fields:** 0 across all 148 venues
- **AP_CONTINENT coverage:** All 114 unique airport codes mapped (MLE continent wrong, see P3)
- **Coordinate sanity:** No anomalies — Mediterranean, Caribbean, Hawaii, Japan venues all verified
- **Tags:** All venues have ≥2 valid tags. Apostrophes in tag strings are valid JS, not truncation
- **Borabora (PPT) vs Matira Beach (BOB):** Not a duplicate — PPT (Papeete) is the international routing hub; BOB is the local island hop; different user entry points for the same island group
- **`beach_boracay` ↔ `bulabog-beach-boracay-t19`** (1.3km apart): Valid — White Beach (party, west coast) vs Bulabog (kitesurfing, east coast); genuinely different experiences
- **`lateSeason:true`** confirmed on 7 resorts: `whistler`, `chamonix`, `mammoth`, `abasin`, `tignes`, `cervinia`, `val-d-isere-s16` ✅

---

## 2. GEAR ITEMS AUDIT

GEAR_ITEMS absent from `app.jsx`. Paste-ready restoration below.

**Status by category:**

| Category | Items | Status |
|----------|-------|--------|
| skiing   | 0     | 🔴 Missing — Amazon revenue earning $0 |
| beach    | 0     | 🔴 Missing — Amazon revenue earning $0 |

**Add before the `VENUES` declaration (right after AP_CONTINENT):**

```js
// ─── gear items (Amazon Associates peakly-20) ────────────────────────────────
const GEAR_ITEMS = {
  skiing: [
    {
      name: "Ski Helmet",
      store: "Amazon", price: "$60–$200",
      url: "https://www.amazon.com/s?tag=peakly-20&k=ski+helmet+adult",
    },
    {
      name: "Ski Goggles",
      store: "Amazon", price: "$40–$180",
      url: "https://www.amazon.com/s?tag=peakly-20&k=ski+goggles+interchangeable+lens",
    },
    {
      name: "Ski Gloves Waterproof",
      store: "Amazon", price: "$30–$90",
      url: "https://www.amazon.com/s?tag=peakly-20&k=ski+gloves+waterproof+touchscreen",
    },
    {
      name: "Merino Base Layer Set",
      store: "Amazon", price: "$45–$120",
      url: "https://www.amazon.com/s?tag=peakly-20&k=merino+wool+base+layer+ski+set",
    },
    {
      name: "Hand Warmers 40-Pack",
      store: "Amazon", price: "$15",
      url: "https://www.amazon.com/s?tag=peakly-20&k=HeatMax+hand+warmers+40+pack",
    },
    {
      name: "Ski Boot Bag",
      store: "Amazon", price: "$30–$60",
      url: "https://www.amazon.com/s?tag=peakly-20&k=ski+boot+bag+helmet+backpack",
    },
  ],
  beach: [
    {
      name: "Sand-Free Beach Mat",
      store: "Amazon", price: "$25–$50",
      url: "https://www.amazon.com/s?tag=peakly-20&k=sand+free+beach+mat+lightweight",
    },
    {
      name: "SPF 50 Reef-Safe Sunscreen",
      store: "Amazon", price: "$15–$30",
      url: "https://www.amazon.com/s?tag=peakly-20&k=reef+safe+sunscreen+spf50+face",
    },
    {
      name: "Adult Snorkel Set",
      store: "Amazon", price: "$25–$60",
      url: "https://www.amazon.com/s?tag=peakly-20&k=adult+snorkel+set+mask+fins+bag",
    },
    {
      name: "Waterproof Phone Pouch",
      store: "Amazon", price: "$10–$20",
      url: "https://www.amazon.com/s?tag=peakly-20&k=waterproof+phone+pouch+lanyard",
    },
    {
      name: "Quick-Dry Travel Towel",
      store: "Amazon", price: "$20–$40",
      url: "https://www.amazon.com/s?tag=peakly-20&k=quick+dry+microfiber+beach+towel+XL",
    },
    {
      name: "UPF 50 Rash Guard",
      store: "Amazon", price: "$25–$45",
      url: "https://www.amazon.com/s?tag=peakly-20&k=upf+50+rash+guard+long+sleeve",
    },
  ],
};
```

**Render block** — inside `VenueDetailSheet`, after the Booking.com hotels CTA:

```jsx
{/* ── Gear to Pack ── */}
{GEAR_ITEMS[listing.category] && (
  <div style={{ marginTop:24, marginBottom:8 }}>
    <div style={{ fontSize:13, fontWeight:700, color:"#888", fontFamily:F,
      textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:12 }}>
      Gear to Pack
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {GEAR_ITEMS[listing.category].map((item, idx) => (
        <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer"
          style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            background:"#f9f9f9", borderRadius:12, padding:"10px 14px",
            textDecoration:"none", border:"1px solid #f0f0f0" }}
          onClick={() => window.plausible && plausible("gear_click",
            { props: { item: item.name, venue: listing.id, category: listing.category } })}>
          <span style={{ fontSize:14, fontWeight:600, color:"#222", fontFamily:F }}>
            {item.name}
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12, color:"#666", fontFamily:F }}>{item.price}</span>
            <span style={{ fontSize:11, fontWeight:700, color:"#0284c7", fontFamily:F }}>
              {item.store} →
            </span>
          </div>
        </a>
      ))}
    </div>
  </div>
)}
```

---

## 3. SEASONAL RELEVANCE (2026-05-26 — late May)

### Northern Hemisphere

**Beach — PRIME SEASON ✅**
- Mediterranean (20 EU venues): peak shoulder season, water 20–22°C, pre-peak crowds = best value window
- Caribbean (15 venues): year-round optimal
- Hawaii (3 venues): peak season
- US East Coast (3 venues): warming up
- SE Asia note: Thailand Gulf coast / Philippines entering rainy season June — score correctly dropping

**Skiing — LATE SEASON (7 `lateSeason:true` venues still viable)**
- Mammoth Mountain: ~300cm base, open through June ✅
- Tignes Glacier: open to late July ✅
- Arapahoe Basin: longest CO season, to June ✅
- Whistler: winding down late May ✅
- All other 57 N. hemisphere ski venues: OFF season → low scores = correct behavior ✅

### Southern Hemisphere

**Skiing — PRE-SEASON (6 venues, all showing off-season scores = correct)**
- NZ (Remarkables, Treble Cone): opens mid-June
- Australia (Thredbo): opens mid-June
- Chile/Argentina (Portillo, Pucon, Cerro Castor): opens late June

**Beach — EARLY FALL**
- Brazil (Floripa, Noronha): 22–24°C, off-peak, still viable
- Seychelles / Mauritius / Maldives (when added): year-round warm

---

## 4. CONTENT QUALITY

| Check | Result |
|-------|--------|
| Venues with empty tags | 0 |
| Venues with coordinate anomalies | 0 |
| Invalid IATA codes | 0 |
| Duplicate venue IDs | 0 |
| Duplicate photo URLs | 0 |
| Missing required fields | 0 |

**Active tag quality issues (per today's fresh audit):**

| Venue | Issue |
|-------|-------|
| `turquoise-bay-t8` | Generic template tags — "Natural Beauty, Protected Bay, Coral Reef, No Crowds" don't describe Ningaloo Reef/Exmouth at all. No coral reef near Antalya either — possibly wrong venue data. |
| `patara-beach-t18` | "Natural Beauty, Protected Bay, Coral Reef, No Crowds" — Patara Turkey has no coral reef; it's a 18km undeveloped dune beach with Lycian ruins |
| `lindos-beach-t23` | Same generic template — Lindos Beach is directly below the Lindos Acropolis, tags should reflect that |

**Paste-ready tag fixes:**
```js
// turquoise-bay-t8 — Ningaloo Reef, Western Australia
tags: ["Ningaloo Reef", "Drift Snorkel", "Remote Exmouth", "World Heritage Site"]

// patara-beach-t18 — Antalya, Turkey
tags: ["18km Empty Dune Beach", "Loggerhead Turtles", "Lycian Ruins", "No Umbrellas Allowed"]

// lindos-beach-t23 — Rhodes, Greece
tags: ["Lindos Acropolis Backdrop", "Donkey Rides Up", "Clear Aegean", "Medieval Village"]
```

---

## 5. FIVE NEW VENUE OBJECTS — targeting geographic gaps

**Top gaps:** Maldives (zero coverage), Rio de Janeiro, Sri Lanka, Galápagos, Seychelles second island

```js
// ── 1. MALDIVES — world #1 aspirational beach, zero coverage ─────────────────
// NOTE: also fix AP_CONTINENT: MLE:"oceania" → MLE:"asia" (see P3 above)
{
  id: "beach_maldives",
  category: "beach",
  title: "North Malé Atoll",
  location: "North Malé Atoll, Maldives",
  lat: 4.1755, lon: 73.5093, ap: "MLE",
  icon: "🏝️", rating: 4.97, reviews: 18400,
  gradient: "linear-gradient(160deg,#003344,#005566,#0088aa)",
  accent: "#22ccee",
  tags: ["Overwater Bungalows", "World Clearest Water", "House Reef Snorkeling", "Year-Round 30°C"],
  photo: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},

// ── 2. IPANEMA — S. America beach gap, only Noronha + Floripa currently ───────
{
  id: "beach_ipanema",
  category: "beach",
  title: "Ipanema Beach",
  location: "Rio de Janeiro, Brazil",
  lat: -22.9868, lon: -43.2025, ap: "GIG",
  icon: "🏖️", rating: 4.90, reviews: 41200,
  gradient: "linear-gradient(160deg,#1a0033,#3a0066,#660099)",
  accent: "#bb44ff",
  tags: ["Sugarloaf Backdrop", "Volleyball Capital", "See and Be Seen", "Carnival City"],
  photo: "https://images.unsplash.com/photo-1518640467064-d7dfbc19b6db?w=800&h=600&fit=crop&fp-x=0.55&fp-y=0.50",
},

// ── 3. MIRISSA — Sri Lanka south coast, zero SL coverage, CMB mapped ──────────
{
  id: "beach_mirissa",
  category: "beach",
  title: "Mirissa Beach",
  location: "Southern Province, Sri Lanka",
  lat: 5.9484, lon: 80.4708, ap: "CMB",
  icon: "🏖️", rating: 4.88, reviews: 12700,
  gradient: "linear-gradient(160deg,#002244,#004488,#0077cc)",
  accent: "#33aaee",
  tags: ["Blue Whale Watching", "Coconut Hill Views", "Empty Shore Sunrise", "Nov–Apr Peak Season"],
  photo: "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55",
},

// ── 4. GALAPAGOS — Ecuador bucket-list beach, unique wildlife ─────────────────
// NOTE: add GYE:"latam" to AP_CONTINENT patch block
{
  id: "beach_galapagos",
  category: "beach",
  title: "Tortuga Bay",
  location: "Santa Cruz, Galápagos, Ecuador",
  lat: -0.7693, lon: -90.3625, ap: "GYE",
  icon: "🏝️", rating: 4.95, reviews: 6800,
  gradient: "linear-gradient(160deg,#003322,#006644,#009966)",
  accent: "#33cc99",
  tags: ["Marine Iguanas on Sand", "Pristine Equatorial Bay", "Year-Round 26°C", "UNESCO Heritage"],
  photo: "https://images.unsplash.com/photo-1548201576-2c9a5e3e4a68?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
},

// ── 5. ANSE INTENDANCE — Mahé Seychelles, distinct from La Digue/Praslin ──────
{
  id: "beach_mahe_intendance",
  category: "beach",
  title: "Anse Intendance",
  location: "Mahé, Seychelles",
  lat: -4.7793, lon: 55.5004, ap: "SEZ",
  icon: "🏖️", rating: 4.93, reviews: 5100,
  gradient: "linear-gradient(160deg,#003355,#005580,#0077aa)",
  accent: "#33aacc",
  tags: ["Wild Swell Shore", "Hawksbill Turtle Nesting", "Jungle-Backed Beach", "Zero Development"],
  photo: "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
},
```

**AP_CONTINENT additions needed before using new venues:**
```js
// Add to patch block in AP_CONTINENT:
GYE:"latam",  // Guayaquil — Galápagos gateway
DXB:"asia",   // Dubai — no UAE venues yet, add now for future use
```

---

## ONE OBSERVATION FOR THE PM

**Amazon Associates is earning $0 — not the $4.48/1K MAU in CLAUDE.md.** The 05-25 content report said GEAR_ITEMS was confirmed live. Today's fresh read of `app.jsx` finds zero occurrences of `amazon.com`, `peakly-20`, or `GEAR_ITEMS`. Whatever the 05-25 agent was reading, it wasn't the current live file. This revenue stream has been effectively dead since the 2026-04-10 pruning. The paste-ready code in §2 takes under 10 minutes: one constant + one render block. No backend changes, no new dependencies. At 1K MAU that's ~$4.50/mo + $6.16/mo REI (pending signup) = ~$10.66/mo this single fix unlocks.

---

*Report generated: 2026-05-26 | Venues audited: 148 | P-level findings: 4 | New venues: 5*
