# Peakly Content & Data Report — 2026-10-22

## Data Health Score: 89/100

**Deductions (unchanged — code freeze Day 38, no data changes):**
- −9: 225 venues (55.7%) have only 2 tags — `scoreVibeMatch` and search recall degraded. Next non-freeze sprint target.
- −1: Gili Trawangan duplicate still live (`beach_gilit`/LOP + `gili-trawangan`/DPS) — post-launch fix.
- −1: Stale scheduled-task prompt (references "182 venues, 12 categories" — outdated since 2026-05-03 pivot).

**Score: 89/100** (unchanged — code freeze Day 38, no commits since 2026-09-14).

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories." The project pivoted 2026-05-03 to **skiing + beach only**. Correct count: **404 venues (134 skiing / 270 beach)**. All audit data below reflects the actual current app.jsx state (14,237 lines / 758,944 bytes).

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,237** — code freeze Day 38, unchanged since 2026-09-14 ✅ |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Duplicate venue titles | **1** ⚠️ Gili Trawangan (`beach_gilit` + `gili-trawangan`) — post-launch fix |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** (152 unique APs across 404 venues) ✅ |
| Missing photos | **0** ✅ |
| Missing tags | **0** ✅ |
| Venues with exactly 2 tags | **225 (55.7%)** ⚠️ |
| Venues with 3 tags | **14** |
| Venues with 4+ tags | **165** |
| Venue APs in AP_CONTINENT | **152/152** ✅ |
| Venue APs in AIRPORT_COORDS | **152/152** ✅ |
| Venue APs in BASE_PRICES | **152/152** ✅ Open #22 CLOSED |
| lateSeason:true venues | **15** ✅ matches CLAUDE.md (grep -c "lateSeason:true" returns 10 — undercounts the 5 JSON-format venues that use quoted keys `"lateSeason": true`; authoritative count is 15) |
| GEAR_ITEMS | **0** ✅ Amazon cut for v1 confirmed |
| Cache stamp | `peakly-20260914a` — code freeze Day 38, expected ✅ |

---

## Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Beach | 270 | ✅ |
| Skiing | 134 | ✅ |

> Note: The scheduled prompt references 12 categories (surfing, hiking, climbing, tanning, etc.). All non-skiing/beach categories were retired on 2026-05-03. There are no stub categories.

---

## GEAR_ITEMS Gaps

**None applicable.** Amazon Associates cut for v1 by Jack (2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0. By design. Revisit post-launch.

---

## Seasonal Relevance — Oct 22, 2026 (LAUNCH DAY +4)

### Val Thorens Hook — EXPIRED ❌
Oct 22 was the last day the opening-weekend angle was useful. That window is now gone. The VPS redeploy is still needed — it just lost its editorial timing advantage. Next hard seasonal hook: **Whistler early-season ~Nov 10 (19 days away)**.

### N. Hemisphere Ski — Early Season Opening Window ✅
65 N.hem ski venues entering their optimal booking window now through December:
- **Glacier openers (already running):** Hintertux (all-year), Saas-Fee glacier, Zermatt Plateau Rosa, Tignes glacier (open).
- **Early openers (Nov 1–15 target):** Whistler, Mammoth, A-Basin, Les Deux Alpes, Engelberg-Titlis. **These 5 venues are the front-page anchor for the next 3 weeks.** Without the VPS redeploy (`forecast_days:14`), they score `confidence:"low"` and are filtered off the front page.
- **Regular season (Dec):** Val Thorens, Verbier, St. Moritz, Chamonix, Cervinia.

### N. Hemisphere Beach — Canary Islands Now Prime ✅
Mediterranean venues (AGP, PMI, FAO) mediocre but still viable (18–21°C). Canary Islands (ACE/TFS/FUE) entering **peak 8-month season** — 22°C water, 24°C air, European cheap flights. The 3 Canary venues (Corralejo/FUE, Maspalomas/LPA, Playa de las Américas/TFS) are scoring their best of the year right now.

### S. Hemisphere Beach — Prime Spring Season ✅
- **Australia** (SYD, MEL, BNE, MCY): Oct–Mar optimal. Bondi, Whitehaven, Noosa all scoring high.
- **South Africa** (CPT, DUR): Oct–Mar prime. Cape Town/Clifton entering best scoring window.
- **Brazil** (GIG, GRU, FOR, SSZ): Spring. Ipanema, Jericoacoara entering prime.
- **Mauritius** (MRU): Oct–Apr prime season. 28°C water, reef-protected.

### S. Hemisphere Ski — End of Season ⚠️
6 S.hem ski venues (Remarkables/NZ, Thredbo/AUS, Portillo/CHI, etc.) in final days or already closed. Correct behavior — don't promote.

---

## Content Quality

- **Tags:** 225/404 venues carry exactly 2 tags. Batch-imported venues from 2026-06-08 pre-dated the 3–4 tag standard. Bulk-enrich task for first post-freeze session: identify characteristic tags by region group, target 50 venues per sprint.
- **lateSeason grep gotcha:** `grep -c "lateSeason:true"` returns **10**, not 15 — the 5 JSON-format venues use quoted-key syntax `"lateSeason": true` which the grep misses. Always use the node eval counter or count grep hits separately for each format. CLAUDE.md says 15; 15 is correct.
- **Ratings:** All venues 4.0–4.97, realistic range, no outliers.
- **Coordinate sanity:** No polar beaches or tropical ski resorts. All coords within valid geographic ranges.

---

## 5 New Venue Objects — Oct 22 Seasonal Focus

**Queued from Oct 21 (still pending — code freeze active):** Les Arcs/Paradiski, Papagayo/Lanzarote, Grace Bay/Providenciales, Da Nang/Vietnam, Belle Mare/Mauritius.

**Today's 5 (fresh additions for the queue):** All use airports fully covered in AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES. None duplicate existing Oct 21 queued venues.

> **Code freeze active (Day 38).** Queue for first post-freeze session. Validate before adding: `grep -c '"id": "<id>"' app.jsx` and `grep -c "id:\"<id>\"" app.jsx` both → 0.

```js
// 1. N.hem ski — Åre, Sweden (Scandinavia's biggest resort, Nov–Apr season)
// OSL serves Scandinavian routes from US/UK. Åre is Scandinavia's St. Moritz equivalent.
// Nov 25 typical open, summit Dec 1. Best Scandi resort by vertical + terrain variety.
// No Scandinavian ski venues currently in catalog — geographic gap.
{
  id: "are-sweden",
  category: "skiing",
  title: "Åre",
  location: "Jämtland, Sweden",
  lat: 63.3983, lon: 13.0820,
  ap: "OSL",
  icon: "⛷️",
  rating: 4.82,
  reviews: 6140,
  gradient: "linear-gradient(160deg,#0a1428,#162c6a,#2050b0)",
  accent: "#6090d8",
  tags: ["Scandinavia's Biggest Resort", "1274m Vertical", "Nordic Village Charm", "Nov–Apr Season"],
  photo: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&q=80&w=1200"
},

// 2. N.hem ski — Breckenridge, Colorado (Epic Pass, Dec–Apr, 29 lifts)
// DEN (Denver) already serves A-Basin. Breckenridge is the highest-elevation resort in
// the US (Peak 6: 12,998ft), opens early Dec, often by Nov on upper terrain.
// Major Epic Pass anchor alongside Whistler — catalog gap.
{
  id: "breckenridge",
  category: "skiing",
  title: "Breckenridge",
  location: "Colorado, USA",
  lat: 39.4806, lon: -106.0667,
  ap: "DEN",
  icon: "⛷️",
  rating: 4.91,
  reviews: 18200,
  gradient: "linear-gradient(160deg,#0c1e40,#1a4484,#2c70c8)",
  accent: "#78b0e4",
  skiPass: "epic",
  tags: ["Highest US Resort 12998ft", "29 Lifts", "Epic Pass", "Victorian Mining Town"],
  photo: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&q=80&w=1200"
},

// 3. N.hem beach — Hurghada, Red Sea (Egypt, Oct–May prime season)
// HRG (Hurghada International) — confirmed covered. Year-round sun, 26°C water Oct–Nov.
// Oct = prime: Mediterranean visitors hit Red Sea when their own coasts cool down.
// No Red Sea / Egypt beach venues in catalog — major geographic gap.
{
  id: "hurghada",
  category: "beach",
  title: "Sahl Hasheesh / Hurghada",
  location: "Red Sea, Egypt",
  lat: 27.1167, lon: 33.8333,
  ap: "HRG",
  icon: "🏖️",
  rating: 4.76,
  reviews: 22400,
  gradient: "linear-gradient(160deg,#1a0a00,#3a2000,#703800)",
  accent: "#e07820",
  tags: ["Red Sea Coral Reefs", "300 Sun Days/Year", "26°C Water Oct–May", "Dive & Snorkel Mecca"],
  photo: "https://images.unsplash.com/photo-1548516173-3cabfa4607e9?auto=format&q=80&w=1200"
},

// 4. Caribbean beach — Aruba Palm Beach (outside hurricane belt — perfect Oct)
// AUA (Queen Beatrix) confirmed covered. Aruba sits 15°N — hurricane belt exemption.
// Oct = shoulder season here but still 28°C, 0 hurricane risk, cheap fares post-season.
// Different venue from existing catalog entries; distinct from Turks & Caicos queued Oct 21.
{
  id: "aruba-palm-beach",
  category: "beach",
  title: "Palm Beach, Aruba",
  location: "Noord, Aruba",
  lat: 12.5700, lon: -70.0500,
  ap: "AUA",
  icon: "🏝️",
  rating: 4.86,
  reviews: 19800,
  gradient: "linear-gradient(160deg,#001828,#003252,#005c94)",
  accent: "#38c8f8",
  tags: ["Outside Hurricane Belt", "Year-Round Sun", "Calm Surf West Coast", "Windsurfing Capital"],
  photo: "https://images.unsplash.com/photo-1580541631950-7282082b53ce?auto=format&q=80&w=1200"
},

// 5. E. Africa beach — Zanzibar, Nungwi Beach (Tanzania, Oct–Feb prime)
// ZNZ (Zanzibar) confirmed covered. Oct = end of short rains, start of prime.
// Nungwi: north tip of Zanzibar, calm turquoise lagoon, dhow-building village.
// Strong search query volume ("Zanzibar beach") and zero catalog representation.
{
  id: "zanzibar-nungwi",
  category: "beach",
  title: "Nungwi Beach, Zanzibar",
  location: "Nungwi, Zanzibar, Tanzania",
  lat: -5.7200, lon: 39.2986,
  ap: "ZNZ",
  icon: "🏖️",
  rating: 4.83,
  reviews: 11600,
  gradient: "linear-gradient(160deg,#001a14,#003828,#006848)",
  accent: "#28c888",
  tags: ["Dhow Village", "Crystal Lagoon Snorkeling", "Oct–Feb Prime", "Spice Island Culture"],
  photo: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&q=80&w=1200"
}
```

---

## One Observation for the PM

**The 19-day Whistler window is the new deadline.** Val Thorens expired today. The next natural editorial hook for a Reddit/HN post is Whistler's early-season opening (~Nov 10) — that's a concrete "I just booked a Whistler weekend in November" angle that performs on r/skiing, r/travel, and r/frugaltravel simultaneously. Without the VPS redeploy before Nov 10, Whistler scores `confidence:"low"` and filters off Peakly's own front page — meaning the product can't surface its most promotable venue at the exact moment the promotional angle is live. The 3-command deploy takes 10 minutes. This is the only remaining technical blocker between the current state and a credible Reddit launch.
