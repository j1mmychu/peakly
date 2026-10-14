# Peakly Content & Data Report — 2026-10-14

## Data Health Score: 91/100

**Deductions (unchanged since 2026-10-08):**
- −7: 225 venues (55.7%) have exactly 2 tags — `scoreVibeMatch` and search recall degraded. Code freeze Day 30 blocks fix. Post-launch sprint target.
- −1: Gili Trawangan duplicate still live (`beach_gilit`/LOP + `gili-trawangan`/DPS) — same venue, two IDs, blocked by code freeze.
- −1: Stale scheduled-task prompt (see warning below).

**No score change from yesterday: 91/100.** All checks pass. Code freeze Day 30 holds clean. **4 days to Oct 18 launch.**

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories" with surfing, tanning, hiking, etc. The project pivoted 2026-05-03 to **skiing + beach only**. Correct count: **404 venues (134 skiing / 270 beach)**. The prompt author should update the cron task's stored text. All audit data below reflects the actual current app state.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,238** (unchanged, code freeze Day 30) |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate venue IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Duplicate venue titles | **1** ⚠️ Gili Trawangan — code freeze, fix post-launch |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| Venue APs in AP_CONTINENT | **165/165** ✅ |
| Venue APs in AIRPORT_COORDS | **165/165** ✅ |
| Venue APs in BASE_PRICES | **165/165** ✅ (181 destination keys) |
| Venues with exactly 2 tags | **225 (55.7%)** ⚠️ post-launch sprint |
| lateSeason:true venues | **15** ✅ (10 unquoted + 5 quoted-key format) |
| GEAR_ITEMS | **0** ✅ (Amazon cut for v1 — intentional) |
| Active categories | **skiing, beach** ✅ |
| Brace balance | **0 net** ✅ (balanced) |
| Code freeze | **Day 30** — Oct 18 launch in **4 days** |
| Build stamp | **20260914a** (sw.js / app.jsx / index.html lockstep ✅) |

---

## 1. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues (category pattern count) | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique) ✅ |
| Duplicate titles | **1** — Gili Trawangan (`beach_gilit` + `gili-trawangan`) ⚠️ |
| Missing lat/lon | **0** ✅ |
| Missing ap (IATA) | **0** ✅ |
| Missing tags arrays | **0** ✅ (404 total: 209 unquoted + 195 quoted-key) |
| APs missing from AP_CONTINENT | **0** ✅ |
| APs missing from AIRPORT_COORDS | **0** ✅ |
| APs missing from BASE_PRICES | **0** ✅ |
| Brace balance (net) | **0** ✅ |
| Venues at (0,0) coordinates | **0** ✅ |

**Known flagged issue (code freeze — no action):**
- `beach_gilit` (Gili Trawangan/LOP) + `gili-trawangan` (Gili Trawangan/DPS) — same venue name, two IDs, different airports. Fix post-launch: delete `beach_gilit` (LOP is smaller/more distant gateway; DPS is the correct Bali hub). Not a runtime crash — IDs are distinct, no dup-ID validator fires.

**Data note (lateSeason format split — carries forward):**
`grep -c "lateSeason:true"` returns **10** — undercounts because 5 venues use quoted JSON format (`"lateSeason": true`). The eval-based count of **15** is authoritative. CLAUDE.md's `grep -c` guidance for this field is stale.

---

## 2. Gear Items Audit

**Status: N/A — GEAR_ITEMS intentionally absent for v1** (Amazon Associates cut, `grep -c GEAR_ITEMS app.jsx` → 0). Per CLAUDE.md revenue model: $7.58/1K MAU without Amazon. No action needed pre-launch. Revisit post-launch.

---

## 3. Seasonal Relevance — 2026-10-14

**Today's window:**

| Category | Hemisphere | Count | Status |
|----------|-----------|-------|--------|
| Skiing | S hemisphere | 23 | ✅ **IN SEASON** — closing window, late Oct / early Nov |
| Skiing | N hemisphere (non-lateSeason) | 96 | ⚠️ Pre-season (opens Nov/Dec) |
| Skiing | N hemisphere (lateSeason) | 15 | ✅ Glacier/high-altitude active — best 4 days for launch |
| Beach | N hemisphere | 201 | ≈ Shoulder/cooling — Mediterranean closed, Caribbean/tropics warm |
| Beach | S hemisphere | 69 | ✅ **Spring surge** — S.hem beach best condition window opening now |

**Oct 14 is T-4 to launch. Scoring engine handles this correctly:** `scoreWeekend` naturally caps N.hem non-lateSeason ski venues (closed, no snow), surfacing S.hem ski + glacier venues + tropical beaches. The 15 `lateSeason` venues are the key N.hem ski content on launch day.

**Launch-week seasonal highlight (Oct 14–18):**
- **Val Thorens opens Oct 18** (launch day) — flagship Alpine lateSeason venue, the most high-profile European resort opening on the exact day we go live. Top of the ski results for N.hem users on day 1.
- **Hintertux Glacier** — year-round, fully in season, top-scoring N.hem ski on every weekend
- **Southern hemisphere ski closing window** — The Remarkables, Cardrona, Coronet Peak valid for this weekend, gone in 2–3 weeks. Final push for S.hem ski content.
- **Caribbean beach prime** — Barbados, Turks & Caicos, St. Lucia scoring well as N.hem beach users seek alternatives to closed Mediterranean

---

## 4. Content Quality

**Tag depth distribution:**

| Tag count | Venues |
|-----------|--------|
| 2 tags | **225** (55.7%) ⚠️ |
| 3 tags | **14** (3.5%) |
| 4+ tags | **165** (40.8%) ✅ |

225 venues sitting at the minimum 2-tag floor hurts `scoreVibeMatch` accuracy and keyword search recall. Skiing venues tend to have 4 tags; beach venues disproportionately sit at 2. **Post-launch sprint target: lift all 225 to 4+ tags.** Blocked by code freeze until Oct 19+.

**Thin content venues (<500 reviews — 17 total, unchanged):**

| Venue | Category | Reviews | Note |
|-------|----------|---------|------|
| caviahue-ar | skiing | 280 | Patagonia — valid niche |
| corralco-cl | skiing | 350 | Chile — real resort, legit |
| mad-river-mountain-oh | skiing | 380 | Ohio — low-altitude risk |
| meads-bay-anguilla | beach | 400 | Luxury, low traffic expected |
| stiniva-beach-vis | beach | 405 | Croatian island — niche correct |
| roundtop-mountain | skiing | 410 | PA — mid-Atlantic, marginal |
| matemwe-zanzibar | beach | 410 | Zanzibar north — ok |
| charlotte-pass-au | skiing | 410 | Deepest Aus ski — legit |
| nakiska | skiing | 420 | Calgary-adjacent, legit |
| maundays-bay-anguilla | beach | 437 | Second Anguilla, borderline redundant |

**No venues have (0,0) coordinates, empty descriptions, or malformed tags.**

**Rating range:** 4.00–4.99 (avg 4.72) — tight and realistic. No suspicious 5.0 clusters.

---

## 5. Daily Venue Additions

**Context: Code freeze is active (Day 30 of 30). Oct 18 launch is 4 days out.**

No new venues should be added to `app.jsx` during code freeze. The following 5 objects are **queued for the post-launch sprint** (target: first week of November, after confirming launch stability). Do NOT paste before Oct 19.

These target N.hem ski season opening (Nov 2026) and S.hem beach spring warmup — maximum relevance for the first month post-launch:

```javascript
// Post-launch addition 1 — N.hem ski, opens Nov 2026
{
  id: "sierra-at-tahoe",
  category: "skiing",
  title: "Sierra-at-Tahoe",
  location: "El Dorado County, California",
  lat: 38.7987, lon: -120.0800,
  ap: "SMF",
  icon: "🏔️",
  rating: 4.68,
  reviews: 1840,
  gradient: "linear-gradient(160deg,#1e3a5f,#3b7dd8,#7ec8e3)",
  accent: "#7ec8e3",
  tags: ["Tree Skiing", "Lake Tahoe Views", "Beginner Friendly", "Snowboarding"],
  photo: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&q=80&w=800"
},

// Post-launch addition 2 — N.hem ski, opens mid-Nov 2026
{
  id: "mt-bachelor",
  category: "skiing",
  title: "Mt. Bachelor",
  location: "Oregon, USA",
  lat: 43.9791, lon: -121.6886,
  ap: "RDM",
  icon: "🏔️",
  rating: 4.72,
  reviews: 2340,
  gradient: "linear-gradient(160deg,#1a3a4a,#2d6a8f,#5ba8c4)",
  accent: "#5ba8c4",
  tags: ["Volcano Terrain", "Cascade Range", "Summit Chair", "Tree Runs"],
  photo: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&q=80&w=800"
},

// Post-launch addition 3 — S.hem beach, spring prime window
{
  id: "beach_trancoso",
  category: "beach",
  title: "Trancoso Beach",
  location: "Bahia, Brazil",
  lat: -16.5913, lon: -39.0848,
  ap: "BPS",
  icon: "🏖️",
  rating: 4.74,
  reviews: 2820,
  gradient: "linear-gradient(160deg,#1a4a3a,#2a8a60,#7ecb9f)",
  accent: "#7ecb9f",
  tags: ["White Sand", "Village Charm", "Quadrado Square", "Colorful Fishing Boats"],
  photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&q=80&w=800"
},

// Post-launch addition 4 — S.hem beach, spring surge
{
  id: "beach_camps_bay",
  category: "beach",
  title: "Camps Bay Beach",
  location: "Cape Town, South Africa",
  lat: -33.9508, lon: 18.3770,
  ap: "CPT",
  icon: "🏖️",
  rating: 4.76,
  reviews: 6840,
  gradient: "linear-gradient(160deg,#1a3a5a,#2a6aa0,#7ec0e8)",
  accent: "#7ec0e8",
  tags: ["Mountain Backdrop", "Trendy Cafes", "Atlantic Swim", "Sunset Views"],
  photo: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&q=80&w=800"
},

// Post-launch addition 5 — N.hem ski opening rush, PNW
{
  id: "crystal-mountain-wa",
  category: "skiing",
  title: "Crystal Mountain",
  location: "Washington State, USA",
  lat: 46.9284, lon: -121.4749,
  ap: "SEA",
  icon: "🏔️",
  rating: 4.80,
  reviews: 3120,
  gradient: "linear-gradient(160deg,#1a2a4a,#2a4a8a,#6a9ac8)",
  accent: "#6a9ac8",
  tags: ["Mt. Rainier Views", "Advanced Terrain", "Summit House Dining", "Powder Days"],
  photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&q=80&w=800"
}
```

---

## One Observation for PM

**Val Thorens opening on launch day (Oct 18) is a free earned-media hook.** The resort itself will be posting across all channels about opening day — Peakly should be the tool that answers "is this weekend actually worth booking?" with live conditions and a flight price. Consider a ready-to-paste Reddit comment for r/skiing on Oct 18: "Val Thorens just opened — Peakly shows it scoring X/100 this weekend, flights from JFK from $Y." Requires zero prep, costs nothing, and lands on the exact day the audience is searching.
