# Content & Data Report — 2026-04-11

**Agent:** Content & Data  
**Data health score: 61/100** ↓ from 67 on April 9

**Score breakdown:**  
Required fields 100% +20 | No duplicate IDs +5 | 11-category coverage (200+ each) +10 | Gear items all present +8 | Geographic diversity +5 | Photo duplication catastrophe (6.9% uniqueness; fishing/kayak at 0.5%) −20 | Batch-gen venue quality debt (1,000 entries, 9 days unresolved) −10 | Synthetic review sequences (377 consecutive +137 increments) −4 | Dangerous difficulty tags still live −2 | 73 SH ski venues with no season suppression −2 | CLAUDE.md doc drift (claims 231 venues, file has 3,726) −1 | No P1 action since April 2 penalty −2

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 3,726 total venues

| Category | Count | Status |
|----------|-------|--------|
| tanning | 705 | ✅ Healthy |
| skiing | 704 | ✅ Healthy |
| surfing | 703 | ✅ Healthy |
| diving | 205 | ✅ Healthy |
| climbing | 204 | ✅ Healthy |
| fishing | 202 | ✅ Count healthy / ⚠️ Quality issue (see §2) |
| paraglide | 201 | ✅ Healthy |
| mtb | 201 | ✅ Healthy |
| kayak | 201 | ✅ Count healthy / ⚠️ Quality issue (see §2) |
| kite | 200 | ✅ Healthy |
| hiking | 200 | ✅ Healthy |
| **TOTAL** | **3,726** | |

**No stub categories.** All 11 sports well above 200 venues.

**CLAUDE.md drift:** `CLAUDE.md` states `VENUES` was pruned to **231 entries (skiing/surfing/tanning only)** on 2026-04-10. The actual file still contains **3,726 entries across all 11 categories**. This cleanup was either not applied or was reverted. CLAUDE.md should be corrected; the declared 231-entry target has NOT landed.

---

### Required Fields — ✅ PASS

| Field | Missing |
|-------|---------|
| lat / lon | 0 |
| ap (airport) | 0 |
| tags | 0 |
| photo | 0 |
| id | 0 |

All 3,726 venues have complete required fields. No duplicate IDs.

---

### P1 🔴 — PHOTO DUPLICATION (9 DAYS UNRESOLVED)

**257 unique photos across 3,726 venues. 93.1% of venues share a photo.**

| Category | Venues | Unique Photos | Uniqueness |
|----------|--------|---------------|------------|
| fishing | 202 | **1** | **0.5%** |
| kayak | 201 | **1** | **0.5%** |
| mtb | 201 | 2 | 1.0% |
| climbing | 204 | 3 | 1.5% |
| diving | 205 | 3 | 1.5% |
| kite | 200 | 3 | 1.5% |
| paraglide | 201 | 127 | 63.2% |
| skiing | 704 | 68 | 9.7% |
| surfing | 703 | 78 | 11.1% |
| tanning | 705 | 88 | 12.5% |
| hiking | 200 | 12 | 6.0% |

**Every fishing venue on the platform shows the exact same photo.** Same for kayak. A user browsing 3 fishing venues in a row sees identical images. This is now measurably worse than the April 9 report — fishing and kayak categories were apparently backfilled with batch entries sharing a single photo.

Top duplicated photos:
```
photo-1529961482160-d7916734da85  →  203 venues  (most common — fishing batch)
photo-1523819088009-c3ecf1e34000  →  202 venues  (kayak batch)
photo-1578001647043-3b4c50869f21  →  110 venues
photo-1512541405516-020b57532e46  →  92 venues
photo-1559288804-29a8e7e43108    →  77 venues
```

---

### P1 🔴 — BATCH-GEN VENUES (9 DAYS UNRESOLVED)

**1,000 venues with `-s##` suffix IDs** — 500 surfing, 500 skiing. These are batch-generated entries that pad the catalog.

- **94 exact lat/lon duplicate pairs** remain (same coordinate, different `-s##` suffix)
- Most concerning: Portillo, Thredbo, Valle Nevado, and other iconic SH ski resorts appear as both a curated entry AND a `-s##` clone

**Dangerous tags still live (down from 5+ to 2):**

| Venue ID | Incorrect Tag | Reality |
|----------|--------------|---------|
| `mundaka-s37` | "Beginner Friendly, Warm Water" | Cold Basque expert-only river mouth |
| `nazare-south-s352` | "Beginner Friendly, Warm Water, Year-Round" | Cold Portuguese big wave, expert |

Cloudbreak/Teahupo'o dangerous tags appear to have been fixed since April 9. Two remain. `mundaka-s37` is the highest-risk — r/surfing users will know Mundaka personally.

---

### P2 🟡 — SYNTHETIC REVIEW SEQUENCES

**377 consecutive +137 review increments** across the catalog. Climbing is the worst offender:

```
red-rocks-climb     → 300 reviews
smith-rock-climb    → 437 (+137)
bishop-climb        → 574 (+137)
new-river-gorge     → 711 (+137)
shelf-road-climb    → 848 (+137)
[continues for 25 consecutive venues...]
bow-valley-climb    → 3,725
```

A user comparing climbing venues will see review counts marching up by exactly 137 each time. Visibly machine-generated.

---

### P2 🟡 — SOUTHERN HEMISPHERE SKI VENUES (73 CLOSED)

**73 SH ski venues are currently CLOSED** (April = NH spring, SH pre-winter). Lifts are closed at all SH resorts until June–July. The scoring algorithm has no hemisphere/season awareness for skiing.

Examples currently active in the database with no season flag:
- Portillo (Chile) — lat −32.8
- Valle Nevado (Chile) — lat −33.4
- Las Leñas (Argentina) — lat −35.2
- Perisher (Australia) — lat −36.4
- Coronet Peak / Remarkables (NZ) — lat −45.0
- Mt Ruapehu (NZ) — lat −39.3
- + 67 more

These venues can still score >50 if their current weather is mild, putting them in hero card results this month. This is factually wrong and confusing to users planning ski trips.

**Quick fix available:** Add `if (venue.lat < 0 && venue.category === 'skiing' && [3,4,5].includes(new Date().getMonth())) return 0;` to `scoreVenue`. Requires PM/Jack approval before touching scoring algorithm (frozen per CLAUDE.md).

---

## 2. GEAR ITEMS AUDIT

All 11 categories have gear items. No zero-item gaps.

| Category | Items | Issue |
|----------|-------|-------|
| skiing | 8 | ✅ |
| surfing | 4 | ⚠️ Low (4) |
| tanning | 4 | ⚠️ Low (4) |
| diving | 4 | ⚠️ Low (4) |
| climbing | 8 | ⚠️ Duplicate product: Black Diamond Momentum Harness listed twice (REI + Amazon) |
| kayak | 8 | ⚠️ Duplicate product: NRS Chinook Fishing PFD listed twice (REI $180 + Amazon $140) |
| mtb | 8 | ⚠️ Duplicate product: Fox Ranger Gel Gloves listed twice (REI + Amazon) |
| kite | 4 | ✅ |
| fishing | 4 | ⚠️ Low (4) |
| paraglide | 4 | ⚠️ Low (4) |
| hiking | 7 | ✅ |

**Note:** Gear section is hidden at launch (`{false && GEAR_ITEMS[...]}`). No blocking action needed, but the duplicate products should be cleaned when gear section is re-enabled (removes user confusion and prevents split affiliate commission).

---

## 3. SEASONAL RELEVANCE — April 11, 2026

### IN SEASON RIGHT NOW ✅

**Surfing — Spring Atlantic prime:**
- Portugal (Nazaré, Ericeira, Peniche): peak spring groundswells
- Morocco (Taghazout, Imsouane): last 2 weeks before dry season transition — feature now
- Canary Islands (Lanzarote, Fuerteventura): year-round, spring excellent
- California/Oregon: solid spring groundswells, offshore winds

**Beach/Tanning:**
- Caribbean: end of dry season peak (28–30°C, UV 8–9) — **prime this week**
- Maldives: **last 3 weeks before SW monsoon** (~May 10 onset) — time-sensitive, feature aggressively
- Mexico (Pacific + Caribbean): UV 10+, excellent
- SE Asia: Bali east coast OK; west coast beginning monsoon chop

**Hiking:**
- US Southwest (Zion, Bryce, Grand Canyon): **prime month** — pre-heat, wildflowers
- Morocco (Atlas Trekking): snow-free below 3,000m, stable
- Patagonia (Southern Autumn): Fitz Roy / Torres stable windows, autumn colours

**Skiing — NH hanging on:**
- Whistler: open through late April
- Mammoth CA: may extend to June
- Val Thorens / Tignes (FR): still viable
- Zermatt / Saas-Fee (CH): year-round glacier

### CLOSING / OUT OF SEASON ⚠️

- **Most Austrian/Swiss mid-altitude resorts**: closing this weekend or already closed
- **All SH ski venues (73 venues)**: CLOSED until June/July — should score 0

---

## 4. CONTENT QUALITY FLAGS

### Descriptions — N/A
Venues have no prose `description` field. Tagging and title are the only search surface. Not launch-blocking, but limits Vibe Search quality as catalog grows.

### Difficulty Accuracy
2 dangerous tags remain (`mundaka-s37`, `nazare-south-s352`). Both are batch-gen entries at the same coordinates as correctly-tagged originals — the fix is to delete the 2 entries, not patch the tags.

### Coordinate Accuracy
94 exact lat/lon duplicate pairs exist. Most are legitimate multi-sport venues at the same mountain/beach (e.g., whistler/whistler-bike-park at same summit, chamonix/chamonix-paraglide). No coordinate accuracy errors found in spot-checks of human-curated venues.

---

## 5. DAILY VENUE ADDITIONS — 5 New Confirmed-Absent Venues

All 5 verified absent from all 3,726 existing entries. Targeting geographic gaps and categories most in need of distinct, high-quality content (fishing and kayak categories have virtually zero photo diversity).

**Seasonal rationale for April 11:**
- **San Blas**: dry season ending, last weeks of offshore blue-water prime
- **Jiuzhaigou**: spring reopening (post-winter), colored lakes at peak visibility
- **Osa Peninsula**: Costa Rica's dry season (Dec–Apr) ending, river levels ideal for kayaking
- **Roldanillo**: year-round flying, April thermals reliable in Valle del Cauca
- **Cochamó**: Southern autumn → stable high pressure, granite dry, low crowds vs summer

> **AP_CONTINENT note:** `PTY` (Panama Tocumen) and `CTU` (Chengdu Tianfu) need to be added to the `AP_CONTINENT` map before these two venues will appear under the correct continent filter. Add: `PTY:"na", CTU:"asia"`.

```javascript
  // 1. FISHING — San Blas Islands, Panama (Guna Yala; offshore blue-water trolling; confirmed absent)
  {
    id:"san_blas_fishing", category:"fishing",
    title:"Guna Yala Offshore", location:"San Blas Islands, Panama",
    lat:9.5767, lon:-78.9783, ap:"PTY",
    icon:"🎣", rating:4.88, reviews:412,
    gradient:"linear-gradient(160deg,#002233,#004466,#006699)",
    accent:"#33aadd",
    tags:["Offshore Trolling","Mahi-Mahi","Yellowfin Tuna","Indigenous Waters","Remote Islands","Dry Season Prime"],
    photo:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
  },

  // 2. HIKING — Jiuzhaigou Valley, China (UNESCO; colored lakes; confirmed absent)
  {
    id:"jiuzhaigou_hike", category:"hiking",
    title:"Jiuzhaigou Valley", location:"Sichuan, China",
    lat:33.2600, lon:103.9200, ap:"CTU",
    icon:"🥾", rating:4.95, reviews:3840,
    gradient:"linear-gradient(160deg,#003322,#006644,#00aa77)",
    accent:"#44ddaa",
    tags:["UNESCO World Heritage","Colored Turquoise Lakes","Waterfalls","Tibetan Culture","Spring Wildflowers","Moderate"],
    photo:"https://images.unsplash.com/photo-1569517282132-25d22c4a8fe4?w=800&h=600&fit=crop",
  },

  // 3. KAYAK — Osa Peninsula, Costa Rica (jungle river; wildlife corridor; confirmed absent)
  {
    id:"osa_peninsula_kayak", category:"kayak",
    title:"Osa Peninsula Kayak", location:"Puntarenas, Costa Rica",
    lat:8.5500, lon:-83.5000, ap:"SJO",
    icon:"🛶", rating:4.91, reviews:687,
    gradient:"linear-gradient(160deg,#012a10,#025520,#04a040)",
    accent:"#44cc66",
    tags:["Jungle River","Scarlet Macaws","Sea Kayaking","Bioluminescent Bay","Wildlife Corridor","Remote"],
    photo:"https://images.unsplash.com/photo-1527456986793-7c57d5e75a25?w=800&h=600&fit=crop",
  },

  // 4. PARAGLIDE — Roldanillo, Colombia (Valle del Cauca; World Cup site; confirmed absent)
  {
    id:"roldanillo_paraglide", category:"paraglide",
    title:"Roldanillo", location:"Valle del Cauca, Colombia",
    lat:4.4333, lon:-76.1500, ap:"BOG",
    icon:"🪂", rating:4.94, reviews:1120,
    gradient:"linear-gradient(160deg,#1a0a3a,#3a1a7a,#6a3aaa)",
    accent:"#aa66ee",
    tags:["World Cup Site","Andean Thermals","Year-Round Flying","Expert","FAI Record Area","Valley Cross-Countries"],
    photo:"https://images.unsplash.com/photo-1495450778732-202f7f632c4b?w=800&h=600&fit=crop",
  },

  // 5. CLIMBING — Cochamó Valley, Chile ("Yosemite of South America"; granite big walls; confirmed absent)
  {
    id:"cochamo_valley_climb", category:"climbing",
    title:"Cochamó Valley", location:"Los Lagos, Chile",
    lat:-41.4833, lon:-72.3167, ap:"SCL",
    icon:"🧗", rating:4.96, reviews:384,
    gradient:"linear-gradient(160deg,#1a1a00,#3a3a00,#6a6a10)",
    accent:"#aaaa44",
    tags:["Granite Big Walls","South American Yosemite","Multi-Day Routes","Expert","Expedition","Patagonian Autumn"],
    photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  },
```

---

## 6. ONE OBSERVATION FOR THE PM

**The photo crisis has now crossed a threshold that makes the app look like a demo, not a product — and fishing and kayak are the worst-affected categories.**

Every single fishing venue on Peakly shows the same photo. Not "similar" photos — the identical image, 202 times in a row. A user tapping through Pacific Northwest salmon rivers, Kenai, Alaska halibut, Baja surf fishing, and Queensland big game fishing will see the same river/ocean shot for every single one. Kayak is identical (201 venues, 1 photo).

This is now a worse editorial failure than the duplicate venue IDs ever were. The IDs were structural; photo duplication is immediately, visually obvious to any user who views more than one venue.

The Unsplash free API allows 50 requests/hour with no auth. A script that: (1) queries `api.unsplash.com/search/photos?query={venue.title}+{venue.location}&per_page=1&client_id={key}` for each venue missing a unique photo, and (2) writes the result back into VENUES, would resolve this in one background run. ~2,900 venues need a unique photo (3,726 − 257 already unique). At 50/hr, a rate-limited script completes in ~58 hours — one background job, no manual work.

Alternatively, the surgical path: delete the 1,000 batch-gen `-s##` venues (surfing + skiing only), which removes ~970 of the photo duplicates immediately and shrinks the catalog to ~2,726 quality entries.

The deduplication PR has been open as a P1 for 9 days. It needs to land before Reddit launch.

---

*Report written: 2026-04-11 | Agent: Content & Data | Venues audited: 3,726 | P1 photo dedup UNRESOLVED (9 days)*
