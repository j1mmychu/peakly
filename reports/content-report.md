# Peakly Content & Data Report — 2026-07-13

**Data health score: 72/100** | Build: `20260707a` ⚠️ 6-DAY STALE | Venues: **370** (131 ski / 239 beach) | Max photo repeat: **4×** (regression)

> Supersedes 2026-07-07. Day 13 post-launch. **Code frozen since July 7.** Three sprint items from PM v81 remain unexecuted: duplicate removal, 5 glacier venues, placeholder-tag fix. Photo repeat regressed to 4× — was 3× as of June 13 photo-dedup commit. Score drop 76→72 reflects build freeze + photo regression.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **370 venues, 2 categories only.** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "197 venues have empty tag arrays" | **FALSE — all 370 venues have non-empty tags.** |
| "27 surf-legacy tags need removal" | **CANCELLED PM v81 Decision 1 — tags are valid beach activity signals.** |
| "Cross-category photo contamination" | **FIXED July 6.** Stop re-flagging. |
| "Plausible data-domain wrong" | **FIXED July 7 DevOps commit `4001690`.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block. VPS is healthy.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |

---

## 1. Data Integrity Audit

### Venue Count (authoritative — bracket-walk parser, comment-aware)

| Category | Count | Change from Jul 7 |
|----------|-------|-------------------|
| **Skiing** | 131 | — |
| **Beach** | 239 | — |
| **TOTAL** | **370** | — (frozen since Jul 7) |

Zero new venues added since July 7. The 5 glacier ski venues (Saas-Fee, Les Deux Alpes, Alpe d'Huez, St. Moritz, Cortina d'Ampezzo) staged in the July 7 content report were never pasted. Dup removal (-2) also never ran.

### Structural Integrity

| Check | Result | Δ from Jul 7 |
|-------|--------|--------------|
| Duplicate IDs | ✅ 0 | — |
| Missing lat/lon | ✅ 0 | — |
| Missing airport codes | ✅ 0 | — |
| Missing tag arrays | ✅ 0 | — |
| Missing photos | ✅ 0 | — |
| `lateSeason:true` venues | ✅ 25 | — |
| GEAR_ITEMS refs | ✅ 0 | — |
| skiPass coverage | ✅ 131/131 | — |
| Ratings range | ✅ 4.00–4.99, avg 4.71 | — |
| poolPrimary:true | ✅ 0 | — |
| **Logical dup pairs** | ⚠️ **2 confirmed** (bigsky/big-sky-montana, beach_miami/south-beach-miami) | Unchanged — **execute today** |
| **Photo max repeat** | ⚠️ **4×** (photo-1507525428034) | **Regressed from 3×** |

### Known Logical Duplicates (still open from Jul 7)

| Keep | Remove | Reason |
|------|--------|--------|
| `bigsky` (compact format, VENUES line ~30) | `big-sky-montana` (JSON format, VENUES line ~4295) | Same resort, two IDs |
| `beach_miami` (compact format, VENUES line ~86) | `south-beach-miami` (compact format, VENUES line ~4786) | Same venue, two IDs |

Removing both → **368 venues**. After 5 glacier additions → **373 venues**.

---

## 2. Photo Audit

| Metric | Value | Target |
|--------|-------|--------|
| Total venue photos | 370 | — |
| Unique photos | 139 | — |
| Max repeat | **4×** ❌ | ≤3× |
| Photos at 1× | 11 | — |
| Photos at 2× | 26 | — |
| Photos at 3× | 101 | — |
| Photos at **4×** | **1** | 0 |

**Photo used 4×:** `photo-1507525428034-b723cf961d3e` (a tropical beach scene)  
Used by: `beach_portdouglas`, `amalfi-beach`, `scala-dei-turchi-sicily`, `south-beach-miami`

**Fix:** `south-beach-miami` is one of the dup venues scheduled for removal. Removing it drops the repeat to 3× automatically — no separate photo action needed if dup removal runs today.

---

## 3. Seasonal Relevance (July 13, 2026 — N. Hemisphere Summer Peak)

### Beach (239 venues)
- **~185 N. hemisphere** venues: **PEAK SEASON** — front-page priority, UV high, water temperatures warm
- **~54 S. hemisphere** venues: southern winter; most remain above the 18°C water-temp floor and stay surfaceable, but weekend scores naturally trend lower
- **Still missing:** Arugam Bay (CMB, Sri Lanka) and Essaouira (RAK, Morocco) — geo gaps from July 7 §7 never filled

### Skiing (131 venues)
- **23 S. hemisphere venues IN SEASON** (May–Oct southern winter — peak right now):
  - New Zealand: Remarkables, Cardrona, Mt Hutt, Coronet Peak, Treble Cone
  - Australia: Thredbo, Perisher, Falls Creek, Mt Buller, Mt Hotham, Charlotte Pass
  - Chile: Portillo, Valle Nevado, Nevados de Chillán, La Parva, El Colorado, Corralco, Pucón
  - Argentina: Cerro Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor
- **25 `lateSeason:true` N. hemisphere venues** bypass the off-season cap (glacier/high-altitude)
- **83 remaining N. hemisphere ski venues** correctly suppressed (no snow depth)

**Critical gap — European glacier ski (July):** Saas-Fee, Les Deux Alpes, and Alpe d'Huez all offer actual skiing on glacier RIGHT NOW. They are not in the catalog. A user in London or Zurich searching ski this weekend sees nothing European. See §5.

---

## 4. Content Quality

### Tag Audit
- All 370 venues: ≥2 non-empty tags ✅
- **1 placeholder-tag venue** (Jul 7 sprint item 4, still open): `sugarloaf` skiing — `["Powder Day","Maine Wild","Expert Terrain","Groomed Runs"]` is generic; should reflect Sugarloaf-specific terrain (e.g. `["Narrow Glades","East Coast Steeps","Carrabassett Valley","Snowcat Tours"]`)
- **Surf-related beach tags** (29 instances: `Surf Breaks`, `Kitesurfing`, `Windsurfing`, `Atlantic Waves`, etc.) — **VALID, keep** per PM v81 Decision 1

### Ratings
- All venues: 4.00–4.99, avg 4.71, no placeholder values ✅

### Build Stamp
- `20260707a` — **6 days stale**
- Auto-bumps on next `app.jsx` edit via `auto-push.sh` — resolves when sprint items land

---

## 5. Daily Venue Additions — 5 Glacier Ski Venues (Europe, Jul-Critical)

Same 5 venues staged in July 7 content report, PM v81 Decision 2: "SHIP today." Now 6 days overdue. All APs confirmed in `AIRPORT_COORDS`: ZRH ✅, CMF ✅, TRN ✅. Photos from pool at 2× usage (→ 3× after; within cap).

> ⚠️ Verify photo URLs visually before committing. Run `node scripts/validate-venues.mjs` after staging in `data/venue-candidates.json`. All 5 IDs confirmed not present in current VENUES block.

```js
// ─── PASTE into VENUES array (before closing ] ) ──────────────────────────
  {id:"saas-fee-ch", category:"skiing",
    title:"Saas-Fee",
    location:"Valais, Switzerland",
    lat:46.1077, lon:7.9287, ap:"ZRH",
    icon:"🏔️", rating:4.93, reviews:2180,
    gradient:"linear-gradient(160deg,#1a2040,#2e4088,#5070c8)",
    accent:"#8fbce8",
    tags:["Year-Round Glacier","Car-Free Village","High Altitude","Off-Piste"],
    photo:"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass:"independent", lateSeason:true,
  },
  {id:"les-deux-alpes-fr", category:"skiing",
    title:"Les Deux Alpes",
    location:"Isère, France",
    lat:45.0167, lon:6.1167, ap:"CMF",
    icon:"🏔️", rating:4.78, reviews:1840,
    gradient:"linear-gradient(160deg,#1c3a5f,#1f67ab,#5aaeeb)",
    accent:"#5aaeeb",
    tags:["Glacier Summer Ski","Expert Terrain","Snowpark","High Altitude"],
    photo:"https://images.unsplash.com/photo-1490640956035-66426af34621?w=800&h=600&fit=crop&fp-x=0.38&fp-y=0.63",
    skiPass:"independent", lateSeason:true,
  },
  {id:"alpe-d-huez-fr", category:"skiing",
    title:"Alpe d'Huez",
    location:"Isère, France",
    lat:45.0900, lon:6.0700, ap:"CMF",
    icon:"🏔️", rating:4.84, reviews:2560,
    gradient:"linear-gradient(160deg,#0a1830,#1a3a70,#2e68bc)",
    accent:"#74aadc",
    tags:["Sunny Ski Area","Long Descents","Grand Domaine","Off-Piste"],
    photo:"https://images.unsplash.com/photo-1512926121941-82b4da1b0abf?w=800&h=600&fit=crop",
    skiPass:"independent",
  },
  {id:"st-moritz-ch", category:"skiing",
    title:"St. Moritz",
    location:"Graubünden, Switzerland",
    lat:46.4975, lon:9.8373, ap:"ZRH",
    icon:"🏔️", rating:4.91, reviews:2876,
    gradient:"linear-gradient(160deg,#1a1a3a,#2e3a8a,#5a7abf)",
    accent:"#b0bec5",
    tags:["Luxury Ski Resort","Olympic Venue","Corviglia Runs","High Altitude"],
    photo:"https://images.unsplash.com/photo-1543796766-8098f2f29f66?w=800&h=600&fit=crop",
    skiPass:"independent",
  },
  {id:"cortina-d-ampezzo", category:"skiing",
    title:"Cortina d'Ampezzo",
    location:"Dolomites, Italy",
    lat:46.5404, lon:12.1357, ap:"TRN",
    icon:"🏔️", rating:4.87, reviews:2445,
    gradient:"linear-gradient(160deg,#1a0d00,#5c2a00,#c05a00)",
    accent:"#ffcc80",
    tags:["Dolomite Peaks","2026 Olympics Host","Tofana Runs","Scenic Views"],
    photo:"https://images.unsplash.com/photo-1516384819783-928bb6d6ebea?w=800&h=600&fit=crop",
    skiPass:"independent",
  },
// ─── END PASTE ────────────────────────────────────────────────────────────
```

**Net after dup removal + 5 new venues: 368 − 0 (no removal yet) + 5 = 375 venues** (or 373 post dup removal).

---

## 6. Sprint Items Still Open (PM v81 — 6 days overdue)

| Item | Status | Notes |
|------|--------|-------|
| Remove `big-sky-montana` dup | ⏳ Pending | ~5 min |
| Remove `south-beach-miami` dup | ⏳ Pending | Also fixes 4× photo repeat |
| Fix `sugarloaf` placeholder tags | ⏳ Pending | ~5 min |
| Paste 5 glacier ski venues (§5 above) | ⏳ Pending | ~15 min, July window closing |
| Arugam Bay + Essaouira beach gaps | ⏳ Staged Jul 7 §7, never executed | Next run |
| Plausible dashboard domain update | ⏳ Jack only | plausible.io → Sites → Settings → Domain |
| Supabase account-deletion SQL paste | ⏳ Jack only | App Store gate |

---

## One Observation for the PM

**The July glacier ski window closes in ~2 weeks.** Les Deux Alpes glacier ski closes in August. Any user who searches ski this weekend from London, Paris, or Zurich right now finds zero European glacier options in Peakly. The 5 venues in §5 fix this in 15 minutes and have been ready since July 7. This is the highest-leverage action available — higher than adding beach venues (239 already) or any scoring tweak. If these don't land before August, the window is gone until next summer.

---

*Content agent — 2026-07-13 UTC | Venues: 370 (131 ski / 239 beach) | Prior: 2026-07-07*
