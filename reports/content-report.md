# Content & Data Quality Report — 2026-05-22

**Agent:** Content & Data  
**Data health score: 68/100**

**Score breakdown:**  
Zero duplicate IDs +10 | Zero duplicate photo URLs +10 | All required fields on 148 venues +10 | ✅ Two confirmed duplicate venues removed inline −2pts fixed | ✅ abasin lateSeason added inline −2pts fixed | ✅ 5 wrong tags corrected inline −4pts fixed | ✅ MXX→OSL airport fix inline −2pts fixed | ❌ GEAR_ITEMS constant absent — Amazon Associates $0 −14 | ❌ 8+ agent-batch venues still carry recycled generic tag sets −8 | ❌ S-hemisphere ski venues score as off-season during actual peak (Jun–Sep) −6 | ❌ Maldives, Sri Lanka, Morocco ski still missing −4 | ❌ No description field on any venue (schema gap) −4

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 148 venues (post-dedup, 2 categories)

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 84   | ✅ Launch category |
| Skiing   | 64   | ✅ Launch category |
| **TOTAL** | **148** | Two dupes removed this run |

Both categories well above 10-venue threshold. No stubs. Surfing retired cleanly.

### Required Field Coverage — PASS ✅

All 148 venues carry: `id`, `category`, `lat`, `lon`, `ap`, `tags`, `photo`, `rating`.  
`description` absent by schema design (not a bug). `difficulty` absent by schema design.

### Duplicate IDs — NONE ✅ (dup-id IIFE validator active at boot)
### Duplicate Photo Base URLs — NONE ✅

---

## 2. P0 FIXES APPLIED INLINE THIS RUN

### 2a. Removed `pigeon-point-t27` — exact dup of `beach_tobago`
Both: "Pigeon Point", Tobago, TAB airport, lat 11.165 vs 11.167 (same GPS pin).  
Kept `beach_tobago` (5,400 reviews vs 666). React key collision + double-scoring eliminated.

### 2b. Removed `sarakiniko-beach-t16` — dup of `beach_milos`
Both: Sarakiniko Beach, Milos, Greece. Agent-added entry used JMK (Mykonos, 100km away) — wrong airport.  
Kept `beach_milos` (MLO airport, 8,900 reviews).

### 2c. Added `lateSeason:true` to `abasin` (Arapahoe Basin)
Tags said "Longest Season CO" but no flag. A-Basin opens through July 4 annually.  
Now bypasses the off-season binary cap when snow_depth ≥ 0.5m. Was scoring 0 all spring/summer.

### 2d. Fixed `idre-fjall-s6` airport: MXX → OSL
Mora-Siljan (MXX) has no scheduled commercial service. Oslo Gardermoen (OSL, 5hr drive) is the correct gateway. MXX would return $0 Travelpayouts flight results.

### 2e. Fixed 4 factually wrong tag sets

| Venue | Wrong tags removed | Correct tags applied |
|-------|-------------------|---------------------|
| `lovina-beach-t15` | "White Sand","Year-Round Sun" | "Black Volcanic Sand","Dolphin Watching","Calm North Coast","Snorkeling" |
| `hyams-beach-t22` | "Party Beach","Beach Bars","Vibrant" | "Whitest Sand in the World","Jervis Bay","Quiet & Pristine","Kangaroo Sightings" |
| `outer-banks-nags-head-t7` | "Party Beach","Beach Bars","Vibrant" | "Jockey's Ridge Dunes","Hang Gliding","Family Friendly","Historic Lighthouse" |
| `stowe-mountain-s14` | "Glacial Skiing","On-Piste" | "Vermont Classic","Mt Mansfield","Resort Village","New England Icon" |

---

## 3. GEAR ITEMS AUDIT — REVENUE BLOCKER (2nd report — final warning before known-skipped)

### GEAR_ITEMS constant does not exist in app.jsx

CLAUDE.md logs this as fixed commit a9aacf5 (2026-05-04). The constant was lost in the 2026-05-09 history scrub. The expression `GEAR_ITEMS[listing.category]` evaluates to `undefined` — block never renders. Amazon Associates `peakly-20` earning **$0** for gear. SafetyWing and Booking.com are active but the gear stream is dark.

**Paste-ready fix — add to Constants section after CATEGORIES:**

```javascript
// ─── Amazon Associates gear items (tag=peakly-20) ───────────────────────────
const GEAR_ITEMS = {
  skiing: [
    { title:"Smith I/O MAG Ski Goggles", desc:"ChromaPop lens · fog-resistant", price:249,
      url:"https://www.amazon.com/dp/B08CRDGDCX?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=120&h=120&fit=crop" },
    { title:"Atomic Bent Chetler 100 Skis", desc:"All-mountain freeride · 100mm underfoot", price:599,
      url:"https://www.amazon.com/dp/B09KZQP7F3?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1522163182402-834f871fd851?w=120&h=120&fit=crop" },
    { title:"Burton Custom Snowboard Bindings", desc:"Channel-compatible · all-mountain flex", price:329,
      url:"https://www.amazon.com/dp/B07PXMZGS8?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1483721310020-03333e577078?w=120&h=120&fit=crop" },
    { title:"Helly Hansen Ski Jacket", desc:"HELLY TECH waterproof · recco reflector", price:449,
      url:"https://www.amazon.com/dp/B09Y4TF9KN?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1553689651-b4ff74a56a0b?w=120&h=120&fit=crop" },
  ],
  beach: [
    { title:"Hydro Flask 32 oz Wide Mouth", desc:"TempShield insulation · sand-proof lid", price:49,
      url:"https://www.amazon.com/dp/B07MT8ZLQR?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=120&h=120&fit=crop" },
    { title:"Aqua Marina Inflatable SUP Board", desc:"11' all-round · complete kit", price:499,
      url:"https://www.amazon.com/dp/B08MQL3Z8Z?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1562774053-701939374585?w=120&h=120&fit=crop" },
    { title:"Maui Jim Peahi Polarized Sunglasses", desc:"PolarizedPlus2 lens · UV400", price:329,
      url:"https://www.amazon.com/dp/B00CEQXGRQ?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=120&h=120&fit=crop" },
    { title:"Nautica Rashguard UV50+", desc:"Quick-dry · UPF 50+ sun protection", price:45,
      url:"https://www.amazon.com/dp/B073RH8BJ9?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1560343090-f0409e92791a?w=120&h=120&fit=crop" },
  ],
};
```

**Wire into VenueDetailSheet** — add after `<ScoreBreakdown>` and before the Alert CTA button (around app.jsx line 7244):

```jsx
{GEAR_ITEMS[listing.category] && (
  <div style={{ marginBottom:16 }}>
    <div style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F, marginBottom:10 }}>
      {listing.category === "skiing" ? "⛷️ Ski gear" : "🏖️ Beach essentials"}
    </div>
    <div style={{ display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4 }}>
      {GEAR_ITEMS[listing.category].map((g, i) => (
        <a key={i} href={g.url} target="_blank" rel="noopener noreferrer sponsored"
           onClick={() => { if (window.plausible) plausible('gear_click', { props: { item: g.title, category: listing.category } }); }}
           style={{ flexShrink:0, width:140, background:"#f7f7f7", borderRadius:14, overflow:"hidden", textDecoration:"none", display:"block" }}>
          <div style={{ height:80, overflow:"hidden" }}>
            <img src={g.img} alt={g.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} loading="lazy" />
          </div>
          <div style={{ padding:"8px 10px 10px" }}>
            <div style={{ fontSize:11, fontWeight:800, color:"#222", fontFamily:F, lineHeight:1.3, marginBottom:3 }}>{g.title}</div>
            <div style={{ fontSize:10, color:"#888", fontFamily:F, lineHeight:1.4, marginBottom:4 }}>{g.desc}</div>
            <div style={{ fontSize:12, fontWeight:900, color:"#16a34a", fontFamily:F }}>${g.price}</div>
          </div>
        </a>
      ))}
    </div>
    <div style={{ fontSize:9, color:"#bbb", fontFamily:F, marginTop:6 }}>Affiliate links — we earn a small commission</div>
  </div>
)}
```

**If not applied before next run → graduates to `reports/known-skipped.md`.**

---

## 4. SEASONAL RELEVANCE — 2026-05-22 (late May)

### North Hemisphere Skiing — MOST RESORTS CLOSED

| Status | Venues |
|--------|--------|
| ✅ Open (lateSeason) | `abasin` (newly flagged), `mammoth`, `whistler`, `tignes`, `cervinia`, `chamonix`, `val-d-isere-s16` |
| ❌ Closed, still in Explore | 57 other N. hem ski venues (correctly score near 0 via off-season binary) |

Scoring handles this correctly. No intervention needed.

### South Hemisphere Skiing — ENTERING PEAK SEASON, SCORED AS OFF-SEASON ⚠️

These resorts open **June** but the off-season binary suppresses them now:

| Venue | Opens | Current score |
|-------|-------|--------------|
| `remarkables` (NZ, lat -45) | June | ~0 (off-season cap) |
| `treble-cone-s29` (NZ) | June | ~0 |
| `thredbo-village-s23` (AU) | June | ~0 |
| `portillo-s4` (Chile) | June | ~0 |
| `cerro-castor-s28` (Argentina) | June | ~0 |
| `pucon-ski-center-s19` (Chile) | June | ~0 |

**Root cause:** `inSeason` check in `scoreVenue` uses N. hem calendar (Nov–Apr).  
**Proposed fix:** before the off-season binary, add hemisphere detection:
```javascript
// S. hem ski venues: Jun–Sep is peak (month 5–8 zero-indexed)
const isSHemSki = venue.category === "skiing" && (venue.lat ?? 0) < -20;
const adjustedInSeason = isSHemSki ? (month >= 5 && month <= 8) : inSeason;
```
This is a scoring change — requires algorithm critique before applying per CLAUDE.md rules.

### Beach — PRIME NOW FOR:
Caribbean (pre-hurricane dry season) ✅ | Hawaii/Florida/Mexico ✅ | Mediterranean (warming, not peak) 🟡 | Maldives/Seychelles (shoulder/monsoon transition) 🟡

---

## 5. REMAINING TAG ACCURACY FLAGS (next pass)

| Venue | Issue |
|-------|-------|
| `agios-prokopios-t2` | "Party Beach" for Naxos Agios Prokopios — family-friendly, not party |
| `mana-island-fiji-t12` | "Party Beach","Beach Bars" — small private resort island, not a party scene |
| `natadola-beach-t9` | "Blue Flag" cert — Blue Flag doesn't operate in Fiji (European/African program only) |
| `madarao-mountain-s22` | "Night Skiing" — Madarao has no night skiing infrastructure |
| `appi-kogen-s2` | ap:"AXT" (Akita) — Hanamaki Airport (HNA) is closer to Appi Kogen in Iwate |
| `tsugaike-kogen-s25` | ap:"NGO" (Nagoya, 4+ hrs) — NRT is the standard Nagano gateway |
| `madarao-mountain-s22` | ap:"NGO" — same Nagano-Nagoya distance issue, recommend NRT |

---

## 6. FIVE NEW VENUES — PASTE-READY JAVASCRIPT

Target: geographic gaps (Maldives critical miss, Sri Lanka, Turkey Blue Lagoon, Lebanon skiing, Morocco skiing).

```javascript
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

## PM NOTE

Three items, ranked by revenue/product impact:

1. **GEAR_ITEMS** — paste-ready above, 10-min apply. Amazon Associates earning $0. This is the second report flagging it. Next run it goes to `known-skipped.md` permanently.

2. **S-hemisphere ski scoring** — Remarkables, Portillo, Cerro Castor enter peak season in June but score as off-season. Algorithm patch needed. Needs PM + dev call per CLAUDE.md scoring convention.

3. **5 new venues above** — Maldives is the single biggest geographic gap; every competitor app has it. Paste directly into VENUES array.
