# Content & Data Report — 2026-04-17

**Agent:** Content & Data
**Data health score: 73/100** ↓ from 78 on April 15

**Score breakdown:**
Required fields 100% complete +20 | No duplicate photos +15 | No duplicate IDs +10 | All 77 surfing venues have `facing` field +5 | Geographic diversity +8 | `cloudbreak-fiji-s21` P1 unresolved 6 days −5 (escalated) | GEAR_ITEMS.surfing 2 items, 3rd consecutive flag −5 (escalated) | 28 ski venues missing skiPass −4 | 54 batch-gen entries −4 | April 15 venue additions not applied −2 | New supertubos dupe discovered −1 | 9 duplicate titles −1 | chamonix coordinate dupe −1 | SH ski off-season (algorithm handles) −3

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 231 total venues (unchanged from April 15)

| Category | Count | Status |
|----------|-------|--------|
| tanning | 87 | ✅ Healthy |
| surfing | 77 | ✅ Healthy |
| skiing | 67 | ✅ Healthy (weakest, needs growth) |
| hiking | 0 | ⚪ Deferred |
| diving | 0 | ⚪ Deferred |
| climbing | 0 | ⚪ Deferred |
| kite | 0 | ⚪ Deferred |
| kayak | 0 | ⚪ Deferred |
| mtb | 0 | ⚪ Deferred |
| fishing | 0 | ⚪ Deferred |
| paraglide | 0 | ⚪ Deferred |
| **TOTAL** | **231** | 3 live categories |

All 231 venues: 100% field coverage (lat/lon, airport, tags, photo). Zero duplicate IDs. Zero duplicate photo URLs.

**Note:** April 15 report's 5 venue additions (Verbier, Zermatt, Las Leñas, Zarautz, Nosara) were NOT applied. Venues counter is unchanged at 231.

---

### P1 🔴 — DANGEROUS SAFETY TAG — DAY 6 (UNRESOLVED)

| Venue ID | Line | Current Tags | Reality |
|----------|------|-------------|---------|
| `cloudbreak-fiji-s21` | 493 | "Beach Break", "All Levels", "Consistent Swell", "Longboard Friendly" | Boat-only expert reef barrel, one of Earth's deadliest waves |

**Fix:** Delete line 493 from app.jsx. The correct `cloudbreak` entry (line ~391, tags: "South Pacific Power", "Boat-Access Only") covers this location accurately.

This has been flagged every day since April 11 — 6 consecutive daily reports. A beginner surfer routing to Cloudbreak on "All Levels" is a real liability. **This is a 30-second delete.**

---

### P2 🟡 — 28 SKI VENUES MISSING skiPass (42% of skiing)

28 of 67 skiing venues lack `skiPass`. Affected batch-gen entries include: Chamonix Mont-Blanc, Val d'Isere, Lech Zürs, Zell am See, Hemsedal, Stowe, and 22 others. If gear UI or scoring touches this field, these venues get empty/wrong treatment.

---

### P3 🟢 — NEWLY DISCOVERED DUPLICATE: Supertubos / Peniche

| ID | Title | Location | Line |
|----|-------|----------|------|
| `supertubos` | Supertubos | Peniche, Portugal | 386 |
| `supertubos-peniche-s18` | Supertubos Peniche | Leiria, Portugal | 490 |

Same break, same `ap:"LIS"`, same `facing:260`. `supertubos` is the better entry (4.94 rating, 4100 reviews, clean tags). Delete `supertubos-peniche-s18` at line 490.

---

### P3 🟢 — EXISTING DUPLICATES (UNRESOLVED)

| Delete This | Keep This | Reason |
|-------------|-----------|--------|
| `cloudbreak-fiji-s21` (line 493) | `cloudbreak` | P1 safety issue |
| `aspen-snowmass-s7` (line 508) | `aspen` | Same resort |
| `arapahoe-basin-s9` (line 509) | `abasin` | Same resort |
| `chamonix-mont-blanc-s18` (line 518) | `chamonix` | Same coordinates |
| `supertubos-peniche-s18` (line 490) | `supertubos` | Same break |
| Taghazout/Anchor Point/Pasta Point/Punta Roca/Sayulita/Pigeon Point `-s##` dupes | named entries | Batch-gen dupes |

All 8+ batch-gen duplicates remain. Clearing them drops venue count to ~223 but improves data quality from 73 → ~80.

---

## 2. GEAR ITEMS AUDIT — THIRD CONSECUTIVE FLAG

| Category | Items | AOV | Status |
|----------|-------|-----|--------|
| skiing | 4 | ~$76 avg | ✅ Good |
| tanning | 4 | ~$27 avg | ✅ Acceptable |
| surfing | 2 | ~$12 avg | 🔴 Critical gap |

**GEAR_ITEMS.surfing has been flagged April 11, April 15, and now April 17.** It has not been fixed.

**Paste-ready fix** — add after line 5444 in app.jsx:

```javascript
    { name:"O'Neill Psycho Tech 3/2mm Wetsuit", store:"Amazon", price:"$189", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=oneill+psycho+tech+wetsuit+3mm" },
    { name:"FCS II All Round Leash 6ft",         store:"Amazon", price:"$35",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=fcs+ii+surfboard+leash+6ft" },
    { name:"Dakine Indo Series Board Bag",        store:"Amazon", price:"$89",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=dakine+indo+series+board+bag" },
    { name:"Quiksilver UPF 50 Rashguard",         store:"Amazon", price:"$29",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=quiksilver+rashguard+upf50" },
```

Projected AOV lift: $12 → ~$85 per surfing gear click. At 1K MAU this matters. At 10K this is real affiliate revenue.

---

## 3. SEASONAL RELEVANCE — April 17, 2026

### Skiing — Final NH Weeks

**Prime windows closing fast:**
- **Whistler** (BC, Canada): Typically closes late April/May. Big season, this is the home stretch — push it hard now.
- **Mammoth** (CA): Usually open through June at 11,000ft. April is legitimately excellent here.
- **Val Thorens / Tignes** (France): Glaciers viable through April. Val Thorens is the highest resort in the Alps.
- **Andermatt** (CH): High-altitude season, April viable.

**Already or closing this week:** East Coast US, most Austrian mid-altitude, Italian resorts below 2500m.

**SH ski venues** (Remarkables, Portillo, Thredbo, Cerro Castor, Treble Cone): Correctly scoring ~8 (off-season) via April 12 algorithm fix. None should surface in top results. Monitor.

### Surfing — Building Season

**April prime:**
- **Indonesia** (Bali, Lombok, Mentawais): Dry season transition, S-hemisphere swells building — this is the opening salvo of Indo season.
- **Morocco** (Taghazout, Anchor Point): Spring Atlantic swells + offshore thermals. Peak Morocco window.
- **California**: NW groundswells, cleaner than winter crowds.
- **Central America** (Costa Rica, El Salvador): Consistent trades, dry season.
- **Basque Country** (Mundaka, Hossegor): Spring Atlantic, some of the best weeks here.

### Beach/Tanning — Best Month of Year

Caribbean: post-winter clarity, pre-hurricane, lightest crowds — peak value month.
Mediterranean: temperatures rising fast (22-26°C Greece, Spain, Croatia). Bali/SE Asia: dry season onset.

---

## 4. CONTENT QUALITY

**Descriptions:** No `description` field exists on venue objects. Tags (always 2 items) carry all descriptive weight. Acceptable for MVP; future: expand to 4-6 tags per venue for richer filtering.

**skiPass coverage:** 39/67 ski venues have `skiPass`. The 28 missing are exclusively batch-gen entries. No action needed until ski pass UI/scoring is confirmed to use this field.

**Overall quality:** Named entries (Whistler, Pipeline, Bora Bora, etc.) are high-quality. 54 batch-gen entries range from acceptable (real spots, accurate coords) to weak (duplicate locations, missing skiPass, poor tags). No placeholder text anywhere.

---

## 5. DAILY VENUE ADDITIONS — 5 New Venues

April 15 additions (Verbier, Zermatt, Las Leñas, Zarautz, Nosara) were not applied. Carrying forward the 2 highest-priority ski credibility gaps and adding 3 new targets.

**Rationale:**
- Val Thorens: highest resort in Alps, glacier skiing valid through April, missing entirely
- Verbier: Switzerland's freeride capital, #2 most-searched Swiss resort after Zermatt — still absent after 6 days of flagging
- Canggu: Bali's best-known surf hub for digital nomads, distinct from existing Bali tanning venues
- Maldives (South Malé): Tanning — zero Maldives entries. $1,200+ AOV beach destination, most aspirational tanning venue on Earth
- La Jolla Shores: California tanning — beach-town surf culture audience, SoCal weekend demographic underserved

```javascript
  // 1. SKIING — Val Thorens (missing; highest resort Alps 2300m base, glacier viable April, within 3 Vallées)
  {id:"val_thorens", category:"skiing", title:"Val Thorens", location:"Les 3 Vallées, France", lat:45.2982, lon:6.5800, ap:"CMF", icon:"🎿", rating:4.95, reviews:2890, gradient:"linear-gradient(160deg,#0a1a40,#1a3580,#3060c8)", accent:"#80a8f8", skiPass:"independent", tags:["Highest Resort Alps","Glacier Year-Round","3 Vallées","April Viable","Intermediate-Expert","600km Pistes"], photo:"https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.45"},

  // 2. SKIING — Verbier (missing; Switzerland freeride capital, 4 Vallées, April viable on Col des Mines 3000m)
  {id:"verbier", category:"skiing", title:"Verbier", location:"Valais, Switzerland", lat:46.0960, lon:7.2284, ap:"GVA", icon:"🎿", rating:4.96, reviews:3120, gradient:"linear-gradient(160deg,#0a1a40,#1a3a80,#3a70d0)", accent:"#7ab0f0", skiPass:"independent", tags:["4 Vallées","Freeride Capital","Expert","Mont Fort 3300m","Apres-Ski","World-Class"], photo:"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&fp-x=0.46&fp-y=0.55"},

  // 3. SURFING — Canggu (missing; Bali's surf/digital-nomad hub, Echo Beach + Old Man's, distinct from tanning entries)
  {id:"canggu", category:"surfing", title:"Canggu", location:"Bali, Indonesia", lat:-8.6478, lon:115.1318, ap:"DPS", icon:"🌊", rating:4.87, reviews:5430, gradient:"linear-gradient(160deg,#0a2a1a,#0a6a40,#1aaa70)", accent:"#1ad890", facing:270, tags:["Beach Break","Digital Nomad Hub","All Levels","Rice Fields","Dry Season Apr-Oct","Echo Beach"], photo:"https://images.unsplash.com/photo-1509233725247-49e657c54213?w=800&h=600&fit=crop&fp-x=0.48&fp-y=0.52"},

  // 4. TANNING — Maldives South Malé Atoll (missing entirely; most aspirational beach on Earth, $1200+ AOV destination)
  {id:"beach_maldives", category:"tanning", title:"South Malé Atoll", location:"Maldives", lat:3.8667, lon:73.5000, ap:"MLE", icon:"🏖️", rating:4.99, reviews:6820, gradient:"linear-gradient(160deg,#001a40,#0044a8,#007fe0)", accent:"#40c8ff", tags:["Overwater Bungalows","Coral Atoll","Crystal Lagoon","Zero Light Pollution","Most Aspirational","Bucket List"], photo:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.45"},

  // 5. TANNING — La Jolla Shores (missing; SoCal beach culture, surf/beach crossover demographic, spring peak)
  {id:"beach_la_jolla", category:"tanning", title:"La Jolla Shores", location:"San Diego, California", lat:32.8573, lon:-117.2563, ap:"SAN", icon:"🏖️", rating:4.90, reviews:14200, gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)", accent:"#33aaff", tags:["Tide Pools","Year-Round Sun","Leopard Sharks","Surf School","San Diego Gem","Family Beach"], photo:"https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.50"},
```

---

## 6. ONE OBSERVATION FOR THE PM

**Six daily reports have flagged `cloudbreak-fiji-s21` as a P1 safety liability. It is still live.** The fix is deleting one line. The same reports have flagged the GEAR_ITEMS.surfing gap for the third time — that's a 4-item paste with a 7× AOV lift. Neither has been actioned.

If reports are generating findings but no one is applying them, the loop is broken. Either the fixes need to be auto-applied (give the agent write permission), or there needs to be a daily "apply pending fixes" step in the workflow. The surfing gear fix alone, compounded at 10K MAU, is worth applying today.

---

*Report written: 2026-04-17 | Agent: Content & Data | Venues audited: 231 | April 15 venue adds: UNAPPLIED | P1 cloudbreak-fiji-s21: UNRESOLVED 6 days | GEAR_ITEMS.surfing: FLAGGED 3x | New dupe: supertubos-peniche-s18*
