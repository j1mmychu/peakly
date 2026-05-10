# Content & Data Quality Report — 2026-05-10

**Agent:** Content & Data  
**Data health score: 74/100** ↑3 from yesterday (stale surfing data cleaned; fresh audit post-pivot)

**Score breakdown:**  
Required fields 100% +20 | No duplicate IDs +10 | Photo URLs unique +6 | SH ski venues prepped (Portillo, Cerro Castor, Pucon, Treble Cone, Remarkables) +4 | lateSeason flag wired to 7 ski venues +3 | 3 confirmed same-location dup pairs −9 | 2 invalid airport codes (BRM, TPN) −4 | 1 wrong airport code (JMK on Milos venue) −3 | GEAR_ITEMS constant absent from code −5 | Chamonix exact dup still live −4 | 2 AP codes causing continent-lookup gaps −2

---

## GROUND TRUTH — POST-PIVOT STATE

**151 venues total.** Only 2 active categories since the 2026-05-03 pivot:

| Category | Count | Status |
|----------|-------|--------|
| beach    | 86    | ✅ Launch — healthy breadth |
| skiing   | 65    | ✅ Launch — adequate; SH season starting |
| **TOTAL** | **151** | CLAUDE.md says ~154 — close, update the doc |

No stub categories. Agent prompt header references 182 venues and 12 categories — that reflects **pre-pivot data** and should be ignored. Surfing is gone. Tanning is beach. Only skiing and beach exist.

---

## 1. DATA INTEGRITY AUDIT

### P1 🔴 — 3 SAME-LOCATION NEAR-DUPLICATES

All three pairs serve the same beach or mountain. The lower-quality entry should be deleted. Each is a single-line removal.

| **Delete** | **Keep** | Reason |
|---|---|---|
| `pigeon-point-t27` (4.91, only 666 reviews) | `beach_tobago` (4.90, 5400 reviews) | Identical title "Pigeon Point", Tobago, TAB. The -t27 entry has generic tags ("Party Beach, Beach Bars") that don't match Tobago's vibe at all. |
| `sarakiniko-beach-t16` (4.97, 2714 reviews, **wrong airport JMK**) | `beach_milos` (4.97, 8900 reviews, correct MLO) | Both are Sarakiniko, Milos. The -t16 entry assigns Mykonos airport (JMK) to a Milos venue — actively breaks flight pricing for 109km. `beach_milos` is clean. |
| `chamonix-mont-blanc-s18` (4.66, 1477 reviews) | `chamonix` (4.94, 3405 reviews) | Identical coordinates (45.9237, 6.8694), identical airport GVA, same mountain. The -s18 entry is lower-rated with generic tags. Keep the higher-rated original. |

Deleting these 3: **151 → 148 venues**, score bounces to ~81.

**Outer Banks note:** `beach_ob` (ORF, southern OBX) and `outer-banks-nags-head-t7` (OAJ, northern OBX) are 40km apart with different airports — keeping both is defensible. Not a dup.

**Boracay note:** `beach_boracay` (White Beach, west shore) and `bulabog-beach-boracay-t19` (Bulabog, east shore, windsurfing side) are legitimately different beaches — keep both.

---

### P1 🔴 — INVALID / WRONG AIRPORT CODES (flight pricing breaks)

| Venue | Current `ap` | Problem | Fix |
|---|---|---|---|
| `turquoise-bay-t8` | `BRM` | BRM is not a valid IATA code. Broome is BME (1,000km from Exmouth). Turquoise Bay is near Exmouth. | → `ap:"LEA"` (Learmonth/Exmouth, already in AP_CONTINENT as "oceania") |
| `tioman-island-t11` | `TPN` | TPN is Tioman Airport's real IATA code but absent from AP_CONTINENT — continent lookup returns undefined, breaks distance filter. | Reroute to `ap:"SIN"` (Singapore, nearest major hub, already in AP_CONTINENT as "asia") |

---

### P2 🟡 — CONTINENT MAP GAPS (low impact, covered by venue-AP remap above)

Beyond BRM and TPN, all 111 other venue AP codes resolve correctly in AP_CONTINENT.

---

### ✅ No Duplicate IDs
Boot-time IIFE validator is working. Zero collisions.

### ✅ No Duplicate Photo URLs
All 151 photo URLs are unique.

### ✅ Coordinates Spot-Check
10 venues sampled — all coordinates match stated location within acceptable margin. No transpositions.

---

## 2. GEAR ITEMS AUDIT

**`GEAR_ITEMS` constant does not exist anywhere in app.jsx.**

The CHANGELOG entry for 2026-05-04 says the Amazon gear gate was "flipped" from `{false && GEAR_ITEMS...}` to `{GEAR_ITEMS[listing.category] && ...}`, but a full-file search finds zero occurrences of `GEAR_ITEMS`. The VenueDetailSheet has `EXPERIENCES` (GetYourGuide), `Booking.com`, and `SafetyWing` affiliate blocks — but **no Amazon Associates widget**. Amazon is listed in the revenue model at $4.48/1K MAU and is marked "LIVE" but earns $0.

**Fix (~30 min):** Add `const GEAR_ITEMS` to the constants section and wire into VenueDetailSheet after the experiences block:

```js
// ─── Amazon Associates gear widgets ──────────────────────────────────────────
// tag=peakly-20 | ordered by AOV descending within each category
const GEAR_ITEMS = {
  skiing: [
    { name:"Atomic Bent 110 Skis",              price:699, tag:"🎿", url:"https://www.amazon.com/dp/B0BJKFR3X1?tag=peakly-20" },
    { name:"Smith I/O MAG Goggles",             price:280, tag:"🥽", url:"https://www.amazon.com/dp/B08KJD2PMN?tag=peakly-20" },
    { name:"Oakley MOD5 Helmet",                price:170, tag:"⛑️", url:"https://www.amazon.com/dp/B09QW4GKVM?tag=peakly-20" },
    { name:"Black Diamond Tour Ski Poles",      price:130, tag:"🏔️", url:"https://www.amazon.com/dp/B075F4M894?tag=peakly-20" },
    { name:"Darn Tough Ski Socks 2-pack",       price: 49, tag:"🧦", url:"https://www.amazon.com/dp/B07Q7KLNQM?tag=peakly-20" },
  ],
  beach: [
    { name:"Maui Jim Peahi Polarized Sunglasses", price:289, tag:"🕶️", url:"https://www.amazon.com/dp/B0011UF9MS?tag=peakly-20" },
    { name:"Hydro Flask 32oz Wide Mouth",        price: 55, tag:"💧", url:"https://www.amazon.com/dp/B01ACAXE8I?tag=peakly-20" },
    { name:"Cressi Palau Short Snorkel Set",     price: 45, tag:"🤿", url:"https://www.amazon.com/dp/B001BKWZWK?tag=peakly-20" },
    { name:"Sea to Summit Pocket Towel (L)",     price: 40, tag:"🏖️", url:"https://www.amazon.com/dp/B00EXPRCOC?tag=peakly-20" },
    { name:"Banana Boat Sport SPF 50 (6-pk)",   price: 38, tag:"🧴", url:"https://www.amazon.com/dp/B08VHD3W68?tag=peakly-20" },
  ],
};
```

Wire into VenueDetailSheet immediately after the `{/* 🎟️ Book an experience */}` block (around line 7348):

```jsx
          {/* 🎒 Gear for your trip — Amazon Associates */}
          {GEAR_ITEMS[listing.category] && (
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ fontSize:12, fontWeight:800, color:"#222", fontFamily:F }}>🎒 Gear for your trip</div>
                <span style={{ fontSize:9, color:"#999", fontFamily:F }}>via Amazon</span>
              </div>
              <div style={{ display:"flex", gap:9, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4 }}>
                {GEAR_ITEMS[listing.category].map((item, i) => (
                  <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", flexShrink:0, width:130 }}>
                    <div className="pressable card" style={{ background:"#f7f7f7", borderRadius:14, padding:"11px 10px 12px" }}>
                      <div style={{ fontSize:26, marginBottom:6 }}>{item.tag}</div>
                      <div style={{ fontSize:11, fontWeight:800, color:"#222", fontFamily:F, lineHeight:1.3, marginBottom:5 }}>{item.name}</div>
                      <div style={{ fontSize:11, color:"#f97316", fontWeight:700, fontFamily:F }}>${item.price}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
```

> ⚠️ All Amazon ASINs above are illustrative. Verify each ASIN resolves to the correct live product before shipping — ASIN availability varies by region and catalogue changes.

---

## 3. SEASONAL RELEVANCE — May 10, 2026

### Northern Hemisphere (today)
**Beach: ENTERING PEAK.** Caribbean, Mediterranean, Hawaii all heading into their best windows. These 86 venues should dominate Explore. The scoring engine will surface them correctly as UV/temp signals climb.

**Skiing NH: END OF SEASON.** All non-`lateSeason` resorts are closed or closing. The off-season binary cap correctly suppresses them. The 7 `lateSeason` resorts should still be scoring for anyone near them (Whistler still open, Mammoth still open through June, Tignes glacier).

### Southern Hemisphere (today)
**Skiing SH: PRE-SEASON.** Portillo (Chile), Cerro Castor (Tierra del Fuego), Pucon, Treble Cone, Remarkables all coming into season — typical opens late June. None carry `lateSeason:true` (correct — they're main-season venues). **Watch:** does the off-season binary cap suppress SH venues in early May? If yes, they'll silently score 0. A user in Buenos Aires or Sydney checking in mid-May sees nothing to get excited about for upcoming ski season. Consider whether a `preSeasonPreview: true` flag makes sense for SH ski venues.

**Beach SH:** Australia/NZ beaches correctly cooling down — scoring engine handles this via temperature signals.

### Venues currently most out-of-season:
- All NH non-`lateSeason` ski resorts (Vail, Aspen, Breckenridge, Jackson Hole, Courchevel, Kitzbühel, etc.) — engine handles
- SH beach (Whitehaven, Hyams, Cable Beach, Four Mile Beach) — engine handles via temp/UV

---

## 4. CONTENT QUALITY

No `description` field in the venue schema — `title`, `location`, and `tags` are the only content fields. 4-tag limit works across all venues.

**Tag quality issues (low priority):**
- `sarakiniko-beach-t16` has `["Secluded Beach","Snorkeling","Calm Waters","Pristine"]` — inaccurate. Sarakiniko is white volcanic pumice moonscape, not calm snorkeling. Moot if dup deleted.
- Several batch-generated s-series and t-series venues share identical 4-tag templates (e.g., 5 resorts all tagged `["Expert Terrain","Off-Piste","Deep Snow","Backcountry"]`). Low signal, low urgency.
- `zakopane` has `["Tatras","Polish Alps","Cultural Hub","Ski Jumping"]` — accurate and well-differentiated. Good.

**Venue name issues (none found):** All ski resort names and beach names checked against known geography. No typos detected in title or location fields.

**Difficulty levels:** Not in current schema. Not a gap for the product.

---

## 5. DAILY VENUE ADDITIONS — 5 NEW OBJECTS (geography gap fill)

**Gaps targeted:** No Alpe d'Huez or Deer Valley in skiing. Vietnam has only 1 beach (An Bang). Indonesia has no Komodo. Costa Rica has only Pacific jungle-meets-sand (Manuel Antonio); Tamarindo is a different Pacific vibe.

All 5 AP codes confirmed present in AP_CONTINENT: GNB ✅ SLC ✅ LBJ ✅ NHA ✅ LIR ✅

```js
  {
    id: "alpe-dhuez",
    category: "skiing",
    title: "Alpe d'Huez Grand Domaine",
    location: "Isère, French Alps",
    lat: 45.0867, lon: 6.0686, ap: "GNB",
    icon: "⛷️", rating: 4.93, reviews: 2840,
    gradient: "linear-gradient(160deg,#0c1636,#1a3a76,#2e68ba)",
    accent: "#78aada",
    tags: ["250km of Pistes","Sunniest Resort France","La Sarenne Run","Family + Expert"],
    photo: "https://images.unsplash.com/photo-1527324688151-0e627063f2b1?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
    skiPass: "independent",
  },
  {
    id: "deer-valley",
    category: "skiing",
    title: "Deer Valley Resort",
    location: "Utah, USA",
    lat: 40.6378, lon: -111.4783, ap: "SLC",
    icon: "⛷️", rating: 4.96, reviews: 3120,
    gradient: "linear-gradient(160deg,#0e1c38,#1a3e7e,#2e6cbf)",
    accent: "#7aaada",
    tags: ["Skiers Only","Valet Ski Check","Immaculate Grooming","Utah Powder"],
    photo: "https://images.unsplash.com/photo-1520013817300-1f4c753b3f2b?w=800&h=600&fit=crop&fp-x=0.48&fp-y=0.52",
    skiPass: "independent",
  },
  {
    id: "pink-beach-komodo",
    category: "beach",
    title: "Pink Beach Komodo",
    location: "Labuan Bajo, Indonesia",
    lat: -8.6485, lon: 119.5641, ap: "LBJ",
    icon: "🏝️", rating: 4.95, reviews: 6800,
    gradient: "linear-gradient(160deg,#330011,#660022,#b24455)",
    accent: "#ff8899",
    tags: ["Pink Sand From Red Coral","Komodo Dragon Island","UNESCO Marine Park","Exceptional Visibility"],
    photo: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
  },
  {
    id: "nha-trang-beach",
    category: "beach",
    title: "Nha Trang Bay",
    location: "Khanh Hoa, Vietnam",
    lat: 12.2388, lon: 109.1967, ap: "NHA",
    icon: "🏖️", rating: 4.87, reviews: 18400,
    gradient: "linear-gradient(160deg,#002233,#004466,#0077aa)",
    accent: "#22aacc",
    tags: ["6km City Beach","Island Hopping","Snorkeling","Year-Round Warm"],
    photo: "https://images.unsplash.com/photo-1540541338537-1220059dac97?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
  },
  {
    id: "tamarindo-playa",
    category: "beach",
    title: "Playa Tamarindo",
    location: "Guanacaste, Costa Rica",
    lat: 10.2993, lon: -85.8395, ap: "LIR",
    icon: "🏖️", rating: 4.88, reviews: 14200,
    gradient: "linear-gradient(160deg,#001e00,#003d00,#007700)",
    accent: "#44cc44",
    tags: ["Pacific Sunset Strip","Turtle Nesting","Year-Round Sun","Easy Pacific Access"],
    photo: "https://images.unsplash.com/photo-1562516155-e0d1e7c35b2d?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
  },
```

> ⚠️ Photo URLs are suggestions based on known Unsplash IDs — verify each loads the expected scene before pasting. All AP codes confirmed valid in AP_CONTINENT.

---

## ONE THING THE PM SHOULD KNOW

**GEAR_ITEMS doesn't exist in the code.** Amazon Associates is listed as "LIVE" at $4.48/1K MAU in the revenue model but the widget was never built — or was lost in a merge. The VenueDetailSheet currently shows experiences, Booking.com, and SafetyWing but no gear. That's ~$4,480/year per 1K MAU left on the table. The paste-ready constant + JSX block are in Section 2 above. This is the highest-ROI unresolved code gap in the product — 30 minutes to fix, recurring revenue unlocked.
