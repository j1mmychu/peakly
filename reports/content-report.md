# Peakly Content & Data Report — 2026-07-04

**Data health score: 74/100** (open issues carry over — freeze lifts July 7) | Build: `20260704a` ✅ (bumped by DevOps this run) | Venues: **370** (131 ski / 239 beach) | Max photo repeat: 3×

**⚠️ VENUE FREEZE through July 7** (PM v76, July 2 override). All queued fixes deferred. Reddit launched June 30; freeze runs until 72h Plausible data read is complete. July 4 is peak beach traffic day — freeze is correct, no content churn today.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **370 venues, 2 categories only.** Pivot happened May 2026. |
| "Hiking has ZERO gear items" | **Hiking category does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "197 venues have empty tag arrays" | **FALSE — all 370 venues have non-empty tags.** Multi-line JSON format was miscounted. |
| "Add 5 new venue objects" | **VENUE FREEZE active through July 7.** 5 venues staged in §7 for post-freeze paste. |

---

## Fix Applied This Run

**None.** Verification pass only. DevOps bumped cache stamp `20260703a→20260704a` this run; content confirms all open findings from July 3 are unchanged and adds one new code hygiene flag.

---

## 1. Data Integrity Audit

### Venue Counts

| Category | Venues | In Season — July 4 (US Independence Day) |
|----------|--------|-------------------------------------------|
| **Beach** | 239 | **~184 N. hemi at PEAK** — today is the highest-traffic US beach search day of the year · ~55 S. hemi suppressed by <18°C cap |
| **Skiing** | 131 | **23 S. hemi in peak southern winter** (NZ/AUS/Andes) · **25 `lateSeason:true`** eligible · **83 N. hemi off-season** scoring 0 |
| **TOTAL** | **370** | Verified via bracket-walk eval. Never use grep — undercounts to 156. |

### Structural Integrity

| Check | Result | Δ from Jul 3 |
|-------|--------|--------------|
| Valid venue objects | ✅ 370 | — |
| Duplicate IDs | ✅ 0 | — |
| Missing lat/lon | ✅ 0 | — |
| Missing airport codes (`ap`) | ✅ 0 | — |
| Missing tags | ✅ 0 | — |
| Missing photos | ✅ 0 | — |
| Zero/single-tag venues | ✅ 0 | — |
| Max photo repeat | ✅ 3× (104×3, 24×2, 10×1 = 138 unique) | — |
| `lateSeason:true` venues | ✅ 25 | — |
| GEAR_ITEMS refs | ✅ 0 | — |
| Build stamp | ✅ `20260704a` — bumped by DevOps | ↑ fixed |
| skiPass coverage | ✅ 131/131 (34 Epic / 51 Ikon / 46 independent) | — |
| Ratings | ✅ range 4.0–4.99, avg 4.71, zero outliers | — |
| Airport coverage | ✅ all `ap` values in AIRPORT_COORDS | — |
| Placeholder-tag venues | ⚠️ **5 open** (staged §2, execute July 7) | → Jul 7 |
| Logical duplicate venue pairs | ⚠️ 3 open (staged §3, execute July 7) | → Jul 7 |
| Surf-legacy tags | ⚠️ **27 venues** (staged Jul 2, execute July 7) | → Jul 7 |

### New: Minor Code Hygiene Flag (non-runtime — detected this run)

Two inline comments inside the VENUES array contain bare object syntax that confuses parsing tools:
```
// CPT:{lat:-33.9648,lon:18.6017} added to AIRPORT_COORDS.  (line 4736)
// GIG:{lat:-22.8100,lon:-43.2507} added to AIRPORT_COORDS. (line 4747)
```
JavaScript ignores these at runtime — no data corruption, no impact on scoring or UI. But any parsing-based audit (including this one) will count them as 2 orphaned venue objects, inflating the object count to 372 and falsely flagging "missing id/ap/photo." Suggest rewriting to plain prose on the July 7 sprint: `// Airport CPT (Cape Town) added to AIRPORT_COORDS and AP_CONTINENT.`

### Logical Duplicate Venues (open from Jun 30 — staged for July 7)

| Compact ID | Batch ID | Same coords? | Post-Freeze Fix |
|-----------|---------|--------------|-----------------|
| `bigsky` (45.2865, -111.4013) | `big-sky-montana` (45.2851, -111.4013) | Within 156m — same resort | Remove `bigsky` (fewer tags) |
| `beach_grace` (21.7918, -72.2598) | `grace-bay-turks` (21.8027, -72.2033) | ~1.1km apart | Keep both — different beach sections |
| `beach_miami` | `south-beach-miami` (exact coords) | ✅ Exact dup | Remove `beach_miami` (batch has better tags) |

---

## 2. Placeholder-Tag Ski Venues (staged for July 7)

Five JSON-format ski venues share identical placeholder tags `["Powder Day","All Levels"]` and the same gradient as Whistler. Confirmed again this run — **unchanged**.

| Venue ID | Title | lateSeason | Risk |
|----------|-------|-----------|------|
| `winter-park` | Winter Park, CO | ✅ | Can surface in July Ski grid |
| `copper-mountain` | Copper Mountain, CO | ✅ | Can surface in July Ski grid |
| `lake-louise` | Lake Louise, AB | ✅ | Can surface in July Ski grid |
| `palisades-tahoe` | Palisades Tahoe, CA | — | Ski season only |
| `brighton` | Brighton, UT | — | Ski season only |

**Fix-ready (paste July 7):**

```js
// winter-park
tags:["Parsenn Bowl","Beginner Terrain","Ikon Pass"],
gradient:"linear-gradient(160deg,#0f2a4a,#1d5291,#3a7fc1)",

// copper-mountain
tags:["Natural Terrain Separation","Front Range Access","Ikon Pass"],
gradient:"linear-gradient(160deg,#1a2e1a,#2d5a2d,#5a9e5a)",

// lake-louise
tags:["Glacial Views","Lake Louise Village","Ski Canada"],
gradient:"linear-gradient(160deg,#0a2a3a,#1a5a6a,#3a8a9a)",

// palisades-tahoe
tags:["KT-22 Expert Chutes","Lake Tahoe Views","Ikon Pass"],
gradient:"linear-gradient(160deg,#0d1e40,#1a4a8a,#3a7ac0)",

// brighton
tags:["Cottonwood Powder","Best Utah Night Skiing","Ikon Pass"],
gradient:"linear-gradient(160deg,#1a1a3a,#2d3a6a,#5a6aaa)",
```

---

## 3. Surf-Legacy Tags (27 venues — staged for July 7)

Priority retires (category-specific, not venue-descriptive):

| Current Tag | Affected Venues | Replace With |
|-------------|-----------------|-------------|
| `Kiteboarding Capital` | `bulabog-beach-boracay-t19`, `long-bay-providenciales` | `Water Sports` |
| `World Cup Kite Venue` | `bulabog-beach-boracay-t19` | `Competitions Held Here` |
| `Kitesurfing Mecca` | `beach_cape_verde` | `Wind Sports` |
| `Kitesurfing` | `zlatni-rat-t14`, `mikri-vigla-naxos`, `le-morne-mauritius`, `paje-zanzibar` | `Water Sports` |
| `Windsurfing` | `bulabog-beach-boracay-t19`, `beach_fuerteventura` | `Wind Sports` |
| `Atlantic Waves` | `asbury-park-beach-nj`, `south-beach-miami` | `Active Shores` |
| `Trade Winds` | `bulabog-beach-boracay-t19`, `beach_cape_verde` | `Cool Breezes` |

Lower priority — factually accurate wave descriptors, can stay: `Surf Breaks` (15 venues), `Surf Break` (`zuma-beach-malibu`).

---

## 4. Photo Audit

- 370 venues, **138 unique Unsplash photo IDs**
- Average reuse: **2.7×** — max 3× (stable since June 13 dedup)
- 104 photos at 3× · 24 photos at 2× · 10 venues with unique photos
- **Action still needed:** ~50 new Unsplash photos (35 beach + 15 ski) to reach ≤2× across 370 venues. Execute July 7.

---

## 5. GEAR_ITEMS Audit

`grep -c GEAR_ITEMS app.jsx → 0` — Amazon cut for v1. Confirmed. **Do not restore.**

---

## 6. Seasonal Relevance (July 4, 2026)

### Beach — Absolute Peak

**July 4 = highest US beach intent day of the year.** 184 N. hemisphere venues at maximum summer scoring. Reddit launched June 30 — if the post got traction, today is Day 4 of the initial traffic spike, which typically peaks on the holiday weekend. Florida, Caribbean, Mediterranean, SE Asia all firing hot.

US beach gap: ~17 continental US beach venues (lat 25–50°N, lon 67–125°W) vs 222 international. US Redditors expecting domestic options see a grid skewed toward Caribbean/Mediterranean. The 6hr flight-distance filter surfaces US venues correctly, but only for users who set a home airport. If Plausible shows US bounce on Beach filter >40%, add 5–8 US coastal venues (Virginia Beach VA, South Padre Island TX, Hilton Head SC, Cape Hatteras NC, Santa Cruz CA) in the July 7 sprint.

### Skiing — Southern Winter Peak

23 S. hemisphere venues at mid-peak (NZ, AUS, Andes). 25 lateSeason:true glacier venues eligible (N. hemi summer glacier sessions). 83 N. hemi off-season capped.

Summer glacier gap still open: Hintertux (year-round), Saas-Fee, Les Deux Alpes, Mölltal — none in catalog. Wait for Plausible to confirm July ski demand before adding.

---

## 7. Five Venues Staged for July 7 (Freeze → Paste)

**All five airports confirmed in AIRPORT_COORDS.** Photo IDs are not in the current 138-photo pool — each adds a net-new unique.

```js
  // ── NEW: Alpe d'Huez, France ──────────────────────────────────────────────
  {
    id:"alpe-d-huez",  category:"skiing",
    title:"Alpe d'Huez", location:"Isère, France",
    lat:45.0900, lon:6.0700, ap:"CMF",
    icon:"🏔️", rating:4.89, reviews:3210,
    gradient:"linear-gradient(160deg,#0d1f3c,#1a4a8a,#4a90d9)",
    accent:"#90caf9",
    tags:["Expert Terrain","Groomed Runs","High Altitude","Long Runs","Sunny Slopes","Family Friendly"],
    photo:"https://images.unsplash.com/photo-1540477960727-8f7e5ad69e7b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass:"independent",
  },

  // ── NEW: St. Moritz, Switzerland ──────────────────────────────────────────
  {
    id:"st-moritz",  category:"skiing",
    title:"St. Moritz", location:"Graubünden, Switzerland",
    lat:46.4975, lon:9.8373, ap:"ZRH",
    icon:"🏔️", rating:4.91, reviews:2876,
    gradient:"linear-gradient(160deg,#1a1a3a,#2e3a8a,#5a7abf)",
    accent:"#b0bec5",
    tags:["Expert Terrain","Off-Piste","High Altitude","Glacier Access","Luxury Resort","Uncrowded"],
    photo:"https://images.unsplash.com/photo-1606787364406-a3cdf06c6d0c?w=800&h=600&fit=crop&fp-x=0.55&fp-y=0.45",
    skiPass:"independent",
  },

  // ── NEW: Trysil, Norway ───────────────────────────────────────────────────
  {
    id:"trysil",  category:"skiing",
    title:"Trysil", location:"Innlandet, Norway",
    lat:61.3142, lon:12.2622, ap:"OSL",
    icon:"🎿", rating:4.73, reviews:1654,
    gradient:"linear-gradient(160deg,#0a2a0a,#1a5c2e,#4a9c6a)",
    accent:"#a5d6b0",
    tags:["All Levels","Family Friendly","Groomed Runs","Night Skiing","Beginner Slopes","Uncrowded"],
    photo:"https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
    skiPass:"independent",
  },

  // ── NEW: Boulders Beach, South Africa ────────────────────────────────────
  {
    id:"boulders-beach-cpt",  category:"beach",
    title:"Boulders Beach", location:"Western Cape, South Africa",
    lat:-34.1973, lon:18.4519, ap:"CPT",
    icon:"🏖️", rating:4.68, reviews:2103,
    gradient:"linear-gradient(160deg,#003a2a,#006644,#00aa77)",
    accent:"#80cba8",
    tags:["Calm Waters","Scenic Views","Snorkeling Reef","Unique Wildlife","White Sand","Family Friendly"],
    photo:"https://images.unsplash.com/photo-1583416750470-965b2707b355?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55",
  },

  // ── NEW: Cortina d'Ampezzo, Italy ─────────────────────────────────────────
  {
    id:"cortina-d-ampezzo",  category:"skiing",
    title:"Cortina d'Ampezzo", location:"Dolomites, Italy",
    lat:46.5404, lon:12.1357, ap:"TRN",
    icon:"🏔️", rating:4.87, reviews:2445,
    gradient:"linear-gradient(160deg,#1a0d00,#5c2a00,#c05a00)",
    accent:"#ffcc80",
    tags:["Expert Terrain","Scenic Views","Off-Piste","Groomed Runs","Luxury Resort","High Altitude"],
    photo:"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass:"independent",
  },
```

---

## 8. One Observation for the PM

**July 4 is the peak beach demand day and the app is live. Check Plausible now, not tomorrow.** If the Reddit post is still recirculating (holiday weekends extend viral content by 48–72h), today's Plausible data is the most valuable signal of the launch: which venues are getting detail views, whether the US vs. International beach split is causing bounce, whether skiing has any traction at all. Reading Plausible today — Day 4 post-launch — gives you 3 full days of signal to calibrate the July 7 sprint. Without it, the July 7 backlog (placeholder tags, surf-legacy, duplicates, 5 venue pastes, photo dedup) gets executed in the wrong order. One 10-minute Plausible read changes the sprint sequencing meaningfully.

---

*Content agent — 2026-07-04 UTC | Repo: 613832b | Venues: 370 (131 ski / 239 beach) | Build: 20260704a ✅ | Prior report: 2026-07-03*
