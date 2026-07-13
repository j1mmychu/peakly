# Peakly Content & Data Report — 2026-07-13

**Data health score: 83/100** | Build: `20260713a` ✅ | Venues: **375** (133 ski / 242 beach) | Photo max repeat: 3× ✅

> Supersedes 2026-07-12. Day 13 post-launch. DevOps bumped cache to `20260713a` and fixed 3 placeholder tags today. Venue count stable at 375 after July 7–12 net: +7 new (Saas-Fee, Les Deux Alpes, St. Moritz, Arugam Bay, Essaouira, Las Teresitas, Elafonissi) −2 dups (bigsky→big-sky-montana, beach_miami→south-beach-miami). Score at 83 (down from 90) due to lateSeason regression still unresolved at 13/25.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **375 venues, 2 categories only.** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "197 venues have empty tag arrays" | **FALSE — all 375 venues have non-empty tags.** |
| "27 surf-legacy tags need removal" | **CANCELLED PM v81 Decision 1 — tags are valid beach activity signals.** |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block. VPS is healthy.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason fixed" | **PARTIAL — still 13/25, see §4.** |
| "Alpe d'Huez in catalog" | **Not yet — still pending, see §5.** |
| "Cortina in catalog" | **Not yet — still pending, see §5.** |

---

## 1. Data Integrity Audit

### Venue Count (bracket-walk parser, comment-aware)

| Category | Count | Δ from Jul 7 |
|----------|-------|--------------|
| **Skiing** | 133 | +2 (net: +3 added, −1 dup) |
| **Beach** | 242 | +3 (net: +4 added, −1 dup) |
| **TOTAL** | **375** | +5 |

Added since Jul 7: `saas-fee-ch`, `les-deux-alpes-fr`, `st-moritz-ch`, `arugam-bay-sl`, `essaouira-beach`, `las-teresitas-tfe`, `elafonissi-beach-chq` (+7). Removed dups: `bigsky` (→ `big-sky-montana` kept) and `beach_miami` (→ `south-beach-miami` kept) (−2). Net: +5.

### Structural Integrity

| Check | Result | Δ from Jul 12 |
|-------|--------|--------------|
| Duplicate IDs | ✅ 0 | — |
| Missing lat/lon | ✅ 0 | — |
| Missing airport codes | ✅ 0 | — |
| Missing tag arrays | ✅ 0 | — |
| Missing photos | ✅ 0 | — |
| GEAR_ITEMS refs | ✅ 0 | — |
| skiPass coverage | ✅ 133/133 | — |
| Ratings range | ✅ 4.00–4.99, avg 4.71 | — |
| Photo max repeat | ✅ **3×** | ✅ Held |
| `lateSeason:true` | ⚠️ **13** (was 25 per CLAUDE.md) | Ongoing regression |
| Placeholder tags | ✅ **3 fixed today** by DevOps | ✅ Down from 3+ open |

---

## 2. Photo Audit

| Metric | Value | Target |
|--------|-------|--------|
| Total venue photos | 375 | — |
| Unique photos | 143 | — |
| Max repeat | ✅ **3×** | ≤3× |
| Photos at 1× | 11 | — |
| Photos at 2× | 32 | — |
| Photos at 3× | 100 | — |
| Pool photos at ≤2× | 6 beach / 5 ski | Available for new venues |

Photo health: **GREEN.** The July 6 DevOps fix + July 12 additions held the 3× cap. All 6 available beach pool photos + 5 ski pool photos can absorb new venue additions without pushing repeat above 3×.

---

## 3. Seasonal Relevance (July 13, 2026 — N. Hemisphere Summer Peak)

### Beach (242 venues)
- **~186 N. hemisphere** venues: **PEAK SEASON** — UV high, water temps warm, front-page priority
- **~56 S. hemisphere** venues: southern winter; most above 18°C floor and surfaceable
- **New since Jul 7:** Arugam Bay Sri Lanka (CMB), Essaouira Morocco (RAK), Las Teresitas Tenerife (TFS), Elafonissi Crete (CHQ) — all good seasonal fits

### Skiing (133 venues)
- **23 S. hemisphere venues IN SEASON** (May–Oct, peak now):
  - New Zealand: Remarkables, Cardrona, Mt Hutt, Coronet Peak, Treble Cone
  - Australia: Thredbo, Perisher, Falls Creek, Mt Buller, Mt Hotham, Charlotte Pass
  - Chile: Portillo, Valle Nevado, La Parva, El Colorado, Nevados de Chillán, Corralco, Pucón
  - Argentina: Cerro Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor
- **13 `lateSeason:true` N. hemisphere glacier venues** bypass off-season cap (Whistler, Chamonix, Mammoth, Arapahoe Basin, Tignes, Cervinia, Snowbird, Brighton, Engelberg, Val Thorens, Saas-Fee, Les Deux Alpes, St. Moritz)
- **97 remaining N. hemisphere ski venues** correctly suppressed (no snow depth)

### Geographic Gap — South America Beach
3 venues total for all of South America (Fernando de Noronha, Florianópolis, Ipanema Rio). This is the weakest sub-region in the entire catalog. All 3 use AIRPORT_COORDS-covered APs (FEN, FLN, GIG). See §5 for 3 new S.Am beach venues.

---

## 4. lateSeason Regression — P2 Open

**Current: 13 venues. CLAUDE.md baseline: 25. Delta: 12 missing.**

The 13 currently flagged: `whistler`, `chamonix`, `mammoth`, `abasin`, `tignes`, `cervinia`, `snowbird`, `brighton`, `engelberg`, `val-thorens`, `saas-fee-ch`, `les-deux-alpes-fr`, `st-moritz-ch`.

Venues that SHOULD be `lateSeason:true` but are NOT flagged:
- `zermatt` — 3,883m Matterhorn base, verified year-round glacier skiing
- `verbier` — 4,314m accessible, Verbier 4 Vallées peak season extends to May+
- Likely 10 more in the JSON batch entries (added July 7–12) that weren't flagged

**Fix:** Add `"lateSeason": true` to `zermatt` and `verbier` JSON entries. To find the other 10, compare against CLAUDE.md's reference list of high-altitude resorts. The July 10 DevOps P1 was partially fixed but only got from 9→13, not 9→25. This is the correct scope for the next DevOps run.

---

## 5. Daily Venue Additions — 5 New Venues

**2 ski completions (Alpe d'Huez + Cortina — the last two from the July 7 glacier batch) + 3 South America beach fills.**

All APs confirmed in `AIRPORT_COORDS`. Photos from pool at ≤2× usage (→ 3× max after addition). IDs confirmed absent from current 375-venue catalog.

> ⚠️ Verify photo URLs before committing. Run `node scripts/validate-venues.mjs` after staging in `data/venue-candidates.json`.

```js
// ─── PASTE into VENUES array (before closing ] ) ──────────────────────────
  {id:"alpe-d-huez-fr", category:"skiing",
    title:"Alpe d'Huez",
    location:"Isère, France",
    lat:45.0900, lon:6.0700, ap:"CMF",
    icon:"🏔️", rating:4.84, reviews:2560,
    gradient:"linear-gradient(160deg,#0a1830,#1a3a70,#2e68bc)",
    accent:"#74aadc",
    tags:["Sunny Ski Area","Long Descents","Grand Domaine","Off-Piste"],
    photo:"https://images.unsplash.com/photo-1490640956035-66426af34621?w=800&h=600&fit=crop&fp-x=0.38&fp-y=0.63",
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
    photo:"https://images.unsplash.com/photo-1512926121941-82b4da1b0abf?w=800&h=600&fit=crop",
    skiPass:"independent",
  },
  {id:"koh-lanta-beach-th", category:"beach",
    title:"Koh Lanta Long Beach",
    location:"Koh Lanta, Thailand",
    lat:7.5833, lon:99.0667, ap:"KBV",
    icon:"🏝️", rating:4.82, reviews:6400,
    gradient:"linear-gradient(160deg,#002a1a,#005a38,#00996a)",
    accent:"#33ddaa",
    tags:["Laid-Back Island","Mangrove Sunsets","Diving","No Full Moon Party"],
    photo:"https://images.unsplash.com/photo-1544550581-1bcabf842b77?w=800&h=600&fit=crop",
  },
  {id:"legian-beach-bali", category:"beach",
    title:"Legian Beach",
    location:"Legian, Bali, Indonesia",
    lat:-8.7222, lon:115.1630, ap:"DPS",
    icon:"🏝️", rating:4.76, reviews:14800,
    gradient:"linear-gradient(160deg,#001a2e,#003860,#006898)",
    accent:"#40a8e0",
    tags:["Surf Breaks","Sunset Strip","Bali Gateway","Less Crowded Than Kuta"],
    photo:"https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=800&h=600&fit=crop",
  },
  {id:"vina-del-mar-cl", category:"beach",
    title:"Viña del Mar",
    location:"Valparaíso Region, Chile",
    lat:-33.0153, lon:-71.5500, ap:"SCL",
    icon:"🏖️", rating:4.68, reviews:3200,
    gradient:"linear-gradient(160deg,#001828,#003860,#006090)",
    accent:"#60b8e0",
    tags:["Pacific Coast","Garden City","Summer Festivals","South American Riviera"],
    photo:"https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=600&fit=crop",
  },
// ─── END PASTE ────────────────────────────────────────────────────────────
```

**Net after paste:** 375 + 5 = **380 venues** (135 ski / 245 beach). Max photo repeat stays 3×.

---

## 6. Open Items (Sprint Backlog)

| Item | Priority | Owner | Notes |
|------|----------|-------|-------|
| lateSeason regression (13→25) — add flag to `zermatt`, `verbier` + ~10 more | **P2** | Next DevOps | 2-line fix for zermatt/verbier; remaining 10 need list from CLAUDE.md |
| Paste 5 venues from §5 | P2 | Content/DevOps | 15 min |
| South America beach gap (only 3) | P3 | Content | Partially fixed with Viña del Mar (§5) |
| Supabase account-deletion SQL paste | P0 (App Store gate) | Jack only | Day 28 open |
| Plausible dashboard domain | P2 | Jack only | plausible.io → Settings → Domain |
| VPS weather cache warmth | P1 | Jack | `curl peakly-api.duckdns.org/health` — wx_cache_size should be >0 |

---

## One Observation for the PM

**Alpe d'Huez closes glacier ski in late August.** It was staged for the July 7 sprint and is now 6 days overdue. Cortina is off-season until November but adds Dolomites catalog depth. The glacier urgency is Alpe d'Huez only — paste it before the end of July or the seasonal window closes until next summer. The Koh Lanta + Legian additions address the most under-served Asia region (only Krabi/KBV area had no southern Thai island), and Viña del Mar opens Chile's coastline, which had zero beach representation despite 3 ski venues nearby.

---

*Content agent — 2026-07-13 UTC | Venues: 375 (133 ski / 242 beach) | Prior: 2026-07-12*
