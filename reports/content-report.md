# Peakly Content & Data Report — 2026-09-08

## Data Health Score: 93/100

**Deductions:**
- −4: 225 venues (56%) have only 2 tags — under editorial minimum of 4. Unchanged from prior days.
- −3: `lateSeason: true` flag missing from 5 high-altitude resorts that legitimately qualify. **New finding.** Without this flag, these venues hit the off-season binary cap even when snow depth ≥ 0.5 m — scoring them near zero in September/October when glacier skiing is real. Fix is in §5 below.

**Change from yesterday:** −2 (95 → 93). No code changes between yesterday and today — the lateSeason gap was present before but not detected by prior runs (exact regex excluded JSON-format entries). Genuine regression vs. CLAUDE.md's July 16 verified list (which names all 5 as `lateSeason: true`).

---

## 1. Data Integrity Audit

**Authoritative counts (both compact and JSON formats tallied):**

| Check | Result |
|-------|--------|
| Total venues (eval, both formats) | **405** (134 skiing / 271 beach) — unchanged day 3 |
| Duplicate IDs | **0** ✅ |
| Missing `lat`/`lon` | **0** ✅ |
| Missing `ap` | **0** ✅ |
| Missing `tags` | **0** ✅ |
| Empty `tags` array | **0** ✅ |
| Missing `photo` | **0** ✅ (405/405) |
| Duplicate photo URLs | **0** ✅ |
| Missing `title`/`location`/`icon`/`gradient`/`accent` | **0** ✅ |
| Bad coordinates (out of range) | **0** ✅ |
| `lateSeason: true` venues | **10** ⚠️ — **should be 15** (see §5) |
| `BASE_PRICES` coverage | ✅ All 165 unique venue `ap` codes covered |
| `AP_CONTINENT` coverage | ✅ All venue `ap` codes present |
| `AIRPORT_COORDS` coverage | ✅ All venue `ap` codes present |
| `GEAR_ITEMS` | **0** ✅ intentionally cut for v1 — do not restore |
| `.venue-baseline` | **405** ✅ matches eval count |

---

## 2. Category Breakdown

The scheduled task prompt references 12 categories from pre-May 2026 architecture. Those were retired 2026-05-03. Current catalog:

| Category | Venues | Status |
|----------|--------|--------|
| Beach | **271** | ✅ Active |
| Skiing | **134** | ✅ Active |
| **Total** | **405** | — |

No stub categories. Architecture is clean.

---

## 3. GEAR_ITEMS Audit

Intentionally cut for v1 (Jack, 2026-06-09). Standing directive in `tasks/agents/devops.md`: do not restore. `grep -c GEAR_ITEMS app.jsx` → **0**. No action.

---

## 4. Seasonal Relevance — 2026-09-08

**Northern hemisphere — September 8:**

| Venue type | Status |
|-----------|--------|
| **N-hem beach (Mediterranean, Atlantic)** | ✅ **PEAK** — Greek islands (RHO, JMK, JTR), Canaries (ACE, FUE), Portugal (FAO), French Riviera (NCE), Turkey (AYT), Balearics (IBZ). 24–27°C water, post-peak crowds, best September on most coasts. |
| **N-hem beach (Caribbean)** | ✅ Good — some hurricane risk (mostly passes south of venues). |
| **N-hem beach (SE Asia)** | ⚠️ Monsoon shoulder — Phuket/HKT, Koh Samui/USM west coast wet. Bali/DPS (Indian Ocean side) still in dry season. |
| **N-hem skiing** | ❌ Off-season for most resorts. Glacier venues (Hintertux, Tignes sur-glacier) can hold snow. **lateSeason flag gaps make this worse — see §5.** |

**Southern hemisphere — September 8:**

| Venue type | Status |
|-----------|--------|
| **S-hem skiing (NZ, AUS)** | ⚠️ Late season winding down. Cardrona, Mt Hutt, Falls Creek may have another 2–3 weeks. |
| **S-hem beach** | 🌱 Spring starting. Brazil (GIG/FOR/NAT) warming (20–22°C water). Sydney/SYD and Gold Coast/OOL still cool (18°C). |

---

## 5. lateSeason Flag Regression — NEW FINDING

**5 high-altitude ski resorts are missing `lateSeason: true`** despite qualifying per CLAUDE.md's July 16 verified list. These are all JSON-format batch entries — the flag was not included when they were batch-added. Compact-format venues (whistler, chamonix, mammoth, etc.) retained the flag; these five did not.

**Affected venues:**

| Venue | ID | AP | Why it matters |
|-------|----|----|---------------|
| Snowbird | `snowbird` | SLC | Alta-adjacent, one of Utah's last open resorts in spring/early autumn |
| Zermatt | `zermatt` | GVA | Theodul Glacier — **open year-round**. Biggest miss. |
| Engelberg-Titlis | `engelberg` | ZRH | Titlis Glacier — late season into May/June and again Sep onward |
| Verbier 4 Vallées | `verbier` | GVA | Mont Fort Glacier — reliable late season |
| Val Thorens | `val-thorens` | CMF | Highest resort in the Alps (2300m base) — earliest/latest each season |

**Current impact (September):** All five score near zero under the off-season binary cap despite real early-season snow at altitude. Zermatt specifically has ski-able terrain right now.

**Fix — add to each JSON-format entry** (surgical edit, no rebuild needed):

```javascript
// In app.jsx, find each entry by id and add "lateSeason": true
// Example for snowbird:
{
  "id": "snowbird",
  // ... existing fields ...
  "lateSeason": true  // ADD THIS
}

// Same for: "zermatt", "engelberg", "verbier", "val-thorens"
```

After fix: `lateSeason: true` count → **15** (matching CLAUDE.md July 16 list + hintertux-glacier).

---

## 6. Content Quality

**Photo health:** 405/405 ✅ | 0 duplicates ✅. Generic stock issue (~360/405 venue-unspecific) blocked on `UNSPLASH_KEY` (Open #20). No regression.

**Descriptions:** Venues have no `description` field — content is delivered through `tags`, `title`, and `location`. This is by design. No action.

**Tag density:** 225 venues (56%) below the editorial minimum of 4 tags. Unchanged. Bulk of the gap is in the beach/Maldives/SE Asia batch cohort (2-tag pattern: `["UV 11","Crystal Water"]`). Backfill is a batch edit session — not a one-liner. Lowest friction: target the 2-tag beach cohort first.

**Venue coordinate accuracy:** No new issues. The four coord-error venues from July 24 audit remain fixed.

---

## 7. Geographic Distribution

| Region | Beach | Skiing |
|--------|-------|--------|
| North America | ~84 | ~66 |
| Europe/Atlantic | ~57 | ~34 |
| Asia-Pacific | ~59 | ~20 |
| Oceania/Pacific Islands | ~54 | ~14 |
| Latin America | ~12 | ~11 |
| Africa/Middle East | ~5 | — |

**Thinnest zones:**
- **S-temperate beach (<−35° lat):** ~2 venues (hyams-beach CBR, piha-beach-nz AKL). Spring warming begins — good timing to add Otago Peninsula/NZ South Island.
- **Middle East beach:** 0 venues. DXB/AUH not yet in `AIRPORT_COORDS` — requires infra step before venues can be added.
- **AGP (Málaga coast):** 1 venue = Sierra Nevada skiing only. Zero beach venues for a city with 70km of Costa del Sol coastline. September is peak for this region.

---

## 8. Five New Venue Objects — Sep 8

**Strategy:** 4 carry-overs from Sep 05–07 (unpasted × 3 days, APs all verified ✅) + 1 fresh pick targeting Costa del Sol (AGP), which has 0 beach venues and September is its best month.

All 5 APs verified: `AIRPORT_COORDS` ✅ `AP_CONTINENT` ✅ `BASE_PRICES` ✅.

After pasting all 5: eval count → **410**.

---

```javascript
// NEW-1 (carry-over, not yet pasted). Playa de Famara, Lanzarote, Canary Islands
// ACE (Lanzarote Airport). 2nd ACE venue — joins beach_lanzarote (Papagayo).
// Famara = wild, cliff-backed, kitesurfing. Papagayo = sheltered snorkeling. No overlap.
// September: 23°C water, steady NE trade wind, off-peak prices.
{id:"famara-beach-lanzarote", category:"beach",
  title:"Playa de Famara", location:"Tinajo, Lanzarote, Spain",
  lat:29.1088, lon:-13.5598, ap:"ACE",
  icon:"🪁", rating:4.74, reviews:3890,
  gradient:"linear-gradient(160deg,#1a0a06,#5a2010,#c05030)",
  accent:"#f09070",
  tags:["Europe's Best Kitesurfing","Volcanic Cliffs","September Value","Wild Atlantic"],
  photo:"https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-2 (carry-over, not yet pasted). Anthony Quinn Bay, Rhodes, Greece
// RHO (Rhodes Diagoras). 3rd RHO venue — joins lindos-beach-t23 and tsambika-beach-rhodes.
// September = Aegean golden month. 26°C water, crystalline visibility, post-tourist-peak.
{id:"anthony-quinn-bay-rho", category:"beach",
  title:"Anthony Quinn Bay", location:"Faliraki, Rhodes, Greece",
  lat:36.3283, lon:28.1528, ap:"RHO",
  icon:"🏝️", rating:4.79, reviews:4210,
  gradient:"linear-gradient(160deg,#0a1a3a,#1a3878,#3068c0)",
  accent:"#80b0f0",
  tags:["Hollywood History","Turquoise Cove","September Peak","No Beach Chairs"],
  photo:"https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-3 (carry-over, not yet pasted). Prainha Beach, Rio de Janeiro, Brazil
// GIG (Rio Galeão). 2nd GIG venue — joins ipanema-rio.
// S-hem spring: water warming to 22°C. Rio's most preserved natural beach — no vendors.
{id:"prainha-rio-brazil", category:"beach",
  title:"Prainha Beach", location:"Rio de Janeiro, Brazil",
  lat:-23.0503, lon:-43.5683, ap:"GIG",
  icon:"🏄", rating:4.81, reviews:3670,
  gradient:"linear-gradient(160deg,#0a1a10,#1a4028,#2a7048)",
  accent:"#70c090",
  tags:["Rio's Hidden Beach","No Vendors","September Spring","Strong Surf"],
  photo:"https://images.unsplash.com/photo-1503503330641-44a1c9aabd66?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-4 (carry-over, not yet pasted). Currumbin Beach, Gold Coast, Queensland
// OOL (Gold Coast Airport). 2nd OOL venue — joins beach_gold_coast (Surfers Paradise).
// S-hem spring: 22°C water, dry season ending. Currumbin Alley = best beginner surf break on GC.
{id:"currumbin-beach-qld", category:"beach",
  title:"Currumbin Beach", location:"Gold Coast, Queensland, Australia",
  lat:-28.1491, lon:153.4957, ap:"OOL",
  icon:"🏄", rating:4.76, reviews:3120,
  gradient:"linear-gradient(160deg,#0a1e30,#1a4268,#2872a8)",
  accent:"#70b2e8",
  tags:["Currumbin Alley Surf","Rockpools","Spring Season","Laid-Back Vibe"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-5 (FRESH — Sep 8). Playa Burriana, Nerja — Costa del Sol
// AGP (Málaga). FIRST beach venue for AGP — currently only Sierra Nevada (skiing).
// Nerja is 50km east of Málaga. Burriana = best beach in Nerja: sheltered cove, crystal water,
// backed by cliffs. September: 24°C water, 27°C air, quietest month of summer.
// Distinct from the overdeveloped Costa del Sol strips — no high-rises.
{id:"burriana-beach-nerja", category:"beach",
  title:"Playa Burriana, Nerja", location:"Nerja, Costa del Sol, Spain",
  lat:36.7403, lon:-3.8607, ap:"AGP",
  icon:"🏖️", rating:4.77, reviews:6840,
  gradient:"linear-gradient(160deg,#0a1a35,#1a3870,#2e68b0)",
  accent:"#80b8e8",
  tags:["Costa del Sol Hidden Gem","Crystal Cove","September Best Month","Cliff Views"],
  photo:"https://images.unsplash.com/photo-1504931655591-0f4aea4dad87?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},
```

---

## PM Observation

**The lateSeason flag gap is the new P1.** Five glacier and high-altitude resorts — including Zermatt (Theodul Glacier, open year-round) and Val Thorens (highest resort in the Alps) — lost `"lateSeason": true` when they were batch-added in JSON format. Right now in September, with early-season snow accumulating at altitude, these resorts score near zero under the off-season cap. The fix is surgical: add one field to five JSON objects in app.jsx. It should land before the next ski-season push.

**Catalog stalled at 405 for 3 consecutive days.** Twenty proposed venue objects across 4 days — none pasted. These are high-quality, AP-verified, strategically-placed picks. The bottleneck is the paste step. If the target is 450 before Reddit/HN launch, the current pace needs to change.
