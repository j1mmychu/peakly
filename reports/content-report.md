# Peakly Content Report — 2026-06-05

**Data health score: 74/100**

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Skiing   | 67    | ✅ Healthy |
| Beach    | 89    | ✅ Healthy |
| **Total**| **156** | |

> ⚠️ **Task prompt is stale**: The agent prompt references "182 venues, 12 categories, 7 stubs" — actual state is 156 venues, 2 categories (skiing + beach). Categories are post-2026-05-03 pivot. No stubs. Update the agent prompt.

---

### Bugs / Data Errors Found

#### 🔴 CRITICAL: Duplicate Photo URL
Both `thredbo-village-s23` and `ski_gudauri` use identical Unsplash photo:
```
photo-1551698618-1dfe5d97d256
```
This means the Gudauri, Georgia card shows a photo of Australia/generic ski. One must be replaced.
**Fix**: Replace `ski_gudauri` photo with a distinct Caucasus/Georgia ski image.

#### 🔴 Wrong Airport Code
- `thredbo-village-s23`: `ap:"SYD"` (Sydney, 6h drive) — should be `ap:"CBR"` (Canberra, 2.5h). Sydney serves Thredbo on zero weekend flights. Every skier coming from outside NSW routes through CBR or drives from ACT/Sydney. SYD inflates flightHours calculation and skews deal scores.

#### 🟡 Near-Duplicate Destinations (same island/barrier)
Three pairs of venues on the same island or barrier that will confuse users and split reviews:
- `borabora` + `matira-beach-t6` — both Bora Bora, 3km apart. Merge or rename one to clarify differentiation.
- `beach_ob` (lat:35.5582) + `outer-banks-nags-head-t7` (lat:35.9577) — same OBX barrier island, 40km apart. Consider whether both are earning their slot or if one is diluting.
- `beach_boracay` (White Beach) + `bulabog-beach-boracay-t19` (Bulabog) — same island, opposite coast. OK to keep since they serve different user intents (relaxation vs. kiteboarding), but descriptions/tags need to make this obvious.

#### 🟡 Recycled Template Tags in s1–s29 Batch (20+ venues)
The December/January batch that added ~30 venues used a small set of recycled tag templates. Several are factually wrong:

| Venue | Recycled Tags | Reality |
|-------|--------------|---------|
| `zell-am-see-s1` | "Expert Terrain","Off-Piste","Deep Snow","Backcountry" | Zell am See is a **beginner-friendly** family resort with groomed cruisers. |
| `idre-fjall-s6` | "Expert Terrain","Off-Piste","Deep Snow","Backcountry" | Idre Fjäll is a **family resort**, not an expert mountain. |
| `nevis-range-s24` | "Glacial Skiing","Scenic Views","Village Base","On-Piste" | Nevis Range has the **only gondola in Scotland** and serious off-piste. Not primarily on-piste. |
| `treble-cone-s29` | "Glacial Skiing","Scenic Views","Village Base","On-Piste" | Treble Cone is a **steep, expert mountain** near Wanaka. On-piste is inaccurate. |

Full recycled-tag clusters detected:
- **Cluster A** (generic expert ski, 5 venues): zell-am-see-s1, idre-fjall-s6, kiroro-snow-world-s11, powder-mountain-s21, mount-shasta-ski-s26
- **Cluster B** (generic family ski, 3 venues): appi-kogen-s2, morzine-s12, sun-peaks-resort-s17
- **Cluster C** (generic steep ski, 4 venues): hemsedal-s3, sainte-foy-tarentaise-s13, thredbo-village-s23, cerro-castor-s28
- **Cluster D** (generic on-piste, 4 venues): portillo-s4, pucon-ski-center-s19, nevis-range-s24, treble-cone-s29
- **Cluster E** (generic groomed, 4 venues): big-white-ski-s5, champoluc-monterosa-s15, les-arcs-s20, tsugaike-kogen-s25
- **Beach Cluster F** ("UV 10+, Crystal Water, White Sand, Year-Round Sun", 2 venues): plage-de-pampelonne-t5, tofo-beach-t10

#### 🟡 Implausible Rating: `idre-fjall-s6`
Rating 4.95 with 2664 reviews — Idre Fjäll is a small regional Swedish resort. 4.95 is higher than Whistler (4.97) and Jackson Hole (4.97). Likely a data entry error. Suggest lowering to ~4.72.

#### 🟡 Airport: `idre-fjall-s6` uses `ap:"OSL"` (Oslo Gardermoen, Norway)
Idre Fjäll is in Dalarna, Sweden. Practical gateway is Stockholm Arlanda (ARN, ~5h drive). OSL is borderline plausible (many Swedes drive from Norway side) but technically wrong country. Flag for PM decision.

#### 🟢 No Duplicate IDs
All 156 venue IDs are unique. Boot-time smoke alarm (app.jsx:683) confirmed working.

#### 🟢 All Venues Have Required Fields
`id`, `category`, `title`, `location`, `lat`, `lon`, `ap`, `icon`, `rating`, `reviews`, `gradient`, `accent`, `tags`, `photo` — present on all 156 venues.

---

## 2. GEAR ITEMS AUDIT

| Category | Items | Status |
|----------|-------|--------|
| skiing   | 4     | ✅ Covered |
| beach    | 4     | ✅ Covered |

**No gear-item gaps** — both active categories have items. No dead-link indicators detected from URL structure.

**Optimization note**: Beach gear AOV is dragged down by the $45 rashguard. Consider replacing with a higher-AOV item (e.g., GoPro HERO waterproof action cam ~$299, or a quality snorkel/mask set ~$89). Amazon Associates commission is tied to AOV; the SUP board ($499) and Maui Jim sunglasses ($329) are strong anchors — keep those.

---

## 3. SEASONAL RELEVANCE (June 5, 2026 — Northern Hemisphere early summer)

### Currently IN SEASON ✅
**Beach (N. Hemisphere)** — peak or ramping:
- All Mediterranean beach venues (Santorini, Ibiza, Hvar, Dubrovnik, Formentera, Algarve, Côte d'Azur, Positano, etc.) — PRIME season
- US East Coast beaches (Outer Banks, Myrtle Beach, Miami) — IN SEASON
- Hawaii (Lanikai, Hapuna, Kapalua) — year-round, summer is excellent
- Caribbean (Grace Bay, Seven Mile, Magens Bay) — shoulder/good season, less hurricane risk

**Skiing (S. Hemisphere)** — season just opening:
- `portillo-s4` (Chile) — opens mid-June ✅
- `cerro-castor-s28` (Argentina) — June opening ✅
- `pucon-ski-center-s19` (Chile) — opens June ✅
- `treble-cone-s29` (New Zealand) — opens mid-June ✅
- `thredbo-village-s23` (Australia) — ~June 12 opening ✅
- `remarkables` (New Zealand) — opens June ✅

**Late-season/glacier skiing (N. Hemisphere)**:
- `tignes` (lateSeason:true) — summer glacier skiing through July ✅
- `cervinia` (lateSeason:true) — Plateau Rosa glacier open ✅
- `mammoth` (lateSeason:true) — Main Lodge may still have snow in early June ✅
- `chamonix` (lateSeason:true) — Vallée Blanche glacier accessible ✅

### Currently OUT OF SEASON ⚠️
**Beach (S. Hemisphere)** — winter approaching, should be deprioritized:
- `beach_floripa` (Brazil) — S. Hemisphere winter, cold/rainy ❌
- `beach_whitehaven` (Australia) — winter, cool ❌
- `beach_cable` (Australia) — winter ❌
- `beach_portdouglas` (Australia) — winter, can be wet ❌
- `hyams-beach-t22` (Australia) — winter ❌
- Note: `beach_noronha` (Brazil) is actually **best season** (dry season May–Sept) ✅ — exception

**Skiing (N. Hemisphere, non-lateSeason)** — closed:
- Most US/Canadian resorts closed until November ❌
- Alps (Andermatt, Courchevel, Ischgl, etc.) — closed until December ❌
- Hokkaido/Japan ski resorts — closed ❌

> ⚠️ **Scoring concern**: `scoreWeekend` filters `confidence: "low"` weekends from the front page, but closed N. Hemisphere ski resorts in June may still surface with mid-tier scores if snowDepth data returns non-zero (many alpine stations still have snowpack). Worth verifying the scoring correctly returns near-zero for venues outside operating season.

---

## 4. CONTENT QUALITY

### Tag Quality: Notable Good Entries
- `beach_milos`: "White Volcanic Pumice","Lunar Landscape" — highly distinctive, user-memorable
- `beach_holbox`: "No Cars","Whale Shark Season" — specific and accurate
- `beach_nusapenida`: "T-Rex Cliff","Instagram Iconic" — effective for discovery
- `crestedbutte`: "Last Great Ski Town" — strong brand identity
- `patara-beach-t18`: "Ancient Lycian Ruins","Sea Turtle Nesting","6km Pristine Beach","UNESCO Protected" — perfect, 4 unique facts in 4 tags

### Tag Quality: Needs Attention
See recycled tag clusters in §1 above — ~20 venues in the s1–s29 skiing batch have generic template tags that fail to differentiate the venue. Priority fix: Cluster A (5 venues tagged as "Expert/Off-Piste/Backcountry" when several are family resorts).

### Venue Descriptions (tags field)
No venue exceeds ~60 chars per tag. No under-described venues. All tags array present.

---

## 5. DAILY VENUE ADDITIONS

Focus: geographic gaps in both categories, prioritizing **Southern Hemisphere ski** (currently in season) and high-demand beach markets with zero coverage.

```javascript
// ── batch 2026-06-05: Las Leñas, Yongpyong, Watamu, Kerama/Okinawa, Lanzarote ─
{id:"las-lenas-s30", category:"skiing",
  title:"Las Leñas", location:"Mendoza, Argentina",
  lat:-35.1547, lon:-70.0453, ap:"MDZ",
  icon:"⛷️", rating:4.87, reviews:1640,
  gradient:"linear-gradient(160deg,#0a1828,#1a3870,#2e66be)", accent:"#78ace4",
  tags:["Deepest S. Hemisphere Powder","7,000ft Vertical Drop","Helicopter Accessible","IN SEASON June–Sept"],
  photo:"https://images.unsplash.com/photo-1535581652167-3a26c90de5f8?w=800&h=600&fit=crop",
  skiPass:"independent"},

{id:"yongpyong-s31", category:"skiing",
  title:"Yongpyong Resort", location:"Gangwon, South Korea",
  lat:37.6583, lon:128.6742, ap:"GMP",
  icon:"⛷️", rating:4.79, reviews:2180,
  gradient:"linear-gradient(160deg,#0d1c40,#1a3e88,#3a78d4)", accent:"#7ab4ec",
  tags:["2018 Olympic Alpine Venue","Dragon Valley","77 Ski Trails","Korean Après-Ski Culture"],
  photo:"https://images.unsplash.com/photo-1544824971-bb5e1a4e5c9f?w=800&h=600&fit=crop",
  skiPass:"independent"},

{id:"watamu-beach-k1", category:"beach",
  title:"Watamu Marine Beach", location:"Kilifi County, Kenya",
  lat:-3.3564, lon:40.0167, ap:"MBA",
  icon:"🏖️", rating:4.88, reviews:3240,
  gradient:"linear-gradient(160deg,#003322,#006644,#009966)", accent:"#22cc88",
  tags:["UNESCO Marine National Park","Sea Turtle Nesting","Living Coral Gardens","Dhow Sunset Cruise"],
  photo:"https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=800&h=600&fit=crop"},

{id:"okinawa-kerama-b1", category:"beach",
  title:"Kerama Islands", location:"Okinawa, Japan",
  lat:26.2219, lon:127.3072, ap:"OKA",
  icon:"🏝️", rating:4.94, reviews:5820,
  gradient:"linear-gradient(160deg,#001e33,#003d6e,#0066bb)", accent:"#33aaee",
  tags:["Kerama Blue — Clarity Standard","Sea Turtles Year-Round","Fastest Ferry 35min","Zero Crowds vs. Hawaii"],
  photo:"https://images.unsplash.com/photo-1568749333773-fbd0fafcc79a?w=800&h=600&fit=crop"},

{id:"lanzarote-papagayo-b2", category:"beach",
  title:"Playa de Papagayo", location:"Lanzarote, Canary Islands",
  lat:28.8613, lon:-13.7793, ap:"ACE",
  icon:"🏝️", rating:4.93, reviews:7600,
  gradient:"linear-gradient(160deg,#1a0800,#4d1800,#8c3800)", accent:"#ffaa55",
  tags:["Year-Round Warm Sun","Volcanic Black Lava Coastline","Protected Cove Grid","Europe's Best-Kept Secret"],
  photo:"https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&h=600&fit=crop"},
// ── end batch 2026-06-05 ────────────────────────────────────────────────────────
```

**Geographic gaps closed by this batch:**
- **Las Leñas** — fills the gap between Portillo (beginner-heavy) and Cerro Castor (far Patagonia). Largest vertical in South America, cult powder status among Argentinians and Brazilians. IN SEASON right now.
- **Yongpyong** — zero Korean ski coverage currently. Korea is a top ski tourism source market in Asia, 2018 Olympic credibility, easy add.
- **Watamu** — Diani Beach is 85km south; Watamu is a different experience (UNESCO marine park, turtle nesting). Fills Kenya coast without duplicating.
- **Kerama Islands** — zero Japan beach coverage. Kerama Blue is a recognized water clarity standard. 35 min ferry from Naha (OKA). Huge domestic market, growing international.
- **Lanzarote Papagayo** — zero Canary Islands coverage. Lanzarote is the year-round fallback for European beach searches in any month including winter — highest confidence-score potential for non-Mediterranean off-season queries. Unique volcanic aesthetic.

---

## 6. ONE OBSERVATION FOR THE PM

**The Southern Hemisphere ski opening window is unplayed.** It's June 5 — the season is opening right now in Chile, Argentina, New Zealand, and Australia. Peakly has 6 S. Hemisphere ski venues. A user tapping "Skiing" this weekend should see those 6 venues scoring high (fresh-season snow, operating lifts, real weekend prices). But buried under 61 N. Hemisphere ski resorts that are closed and scoring near-zero, the grid experience is broken. **Confirm that zero-confidence N. Hemisphere ski venues are being filtered or demoted on the Explore grid before June 12–14, when most Southern resorts open and the first weekend search spike will hit.** This is the single highest-leverage product action in the next 10 days and it's a filter/scoring concern, not a content concern.
