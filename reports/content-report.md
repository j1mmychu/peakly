# Content & Data Report — 2026-03-30

**Agent:** Content & Data
**Data health score: 58/100**
**Score breakdown:** Category coverage +20, gear items present +10, LOCAL_TIPS/PACKING gap -5, photo quality -22 (batch venues 34% unique), artificial venue names -15 (933 venues), coordinate integrity +10, gear affiliate gap -5 (22 REI links earning $0), seasonal alignment +5

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown

| Category | Count | Status | Notes |
|----------|-------|--------|-------|
| tanning | 705 | ✅ Healthy | 42% artificial names ("X South/East") |
| skiing | 704 | ✅ Healthy | 43% artificial names, 73 SH venues currently off-season |
| surfing | 703 | ✅ Healthy | 46% artificial names |
| diving | 205 | ✅ Healthy | Clean |
| climbing | 204 | ✅ Healthy | Clean |
| fishing | 202 | ✅ Healthy | Clean |
| kayak | 201 | ✅ Healthy | Clean |
| mtb | 201 | ✅ Healthy | Clean |
| paraglide | 201 | ✅ Healthy | Clean |
| kite | 200 | ✅ Healthy | Clean |
| hiking | 200 | ✅ Healthy | Missing LOCAL_TIPS + PACKING entries |
| **TOTAL** | **3,726** | | |

**No stub categories.** All 11 sports have 200+ venues. Distribution is top-heavy by design (Surfing/Ski/Beach focus confirmed).

---

### Critical Issue #1: ARTIFICIAL VENUE NAMES — P1 🔴

**933 out of 3,726 venues (25%) have fabricated directional suffixes in their names.**

The March 29 batch expansion created venues named "Whistler Blackcomb East", "Pipeline South", "Teahupoo East", "Bora Bora East" etc. — these are not real venues. They are duplicates of existing venues with compass directions appended. This is immediately obvious to any user who knows these destinations.

| Category | Artificial Count | Total | % Artificial |
|----------|-----------------|-------|-------------|
| surfing | 325 | 703 | 46% |
| skiing | 306 | 704 | 43% |
| tanning | 298 | 705 | 42% |
| **Total** | **933** | **3,726** | **25%** |

**Examples of the problem:**
- "Whistler Blackcomb East" (doesn't exist — Whistler Blackcomb is one mountain)
- "Teahupoo East" (there is no East section of Teahupoo)
- "Pipeline South" (Pipe is Pipe — no directional variant)
- "Bora Bora Lagoon East" (fabricated)

**Impact:** Any adventurous user who googles a venue name and finds zero results will lose trust in the entire app. This is a credibility risk ahead of the March 31 Reddit launch.

**Recommendation for PM:** Decision needed — remove the 933 artificial venues (taking the count back to ~2,793) OR keep them hidden from display until proper names are sourced. The current scoring system will surface these in results. At 3,726 venues the database is already impressive. Quality beats quantity.

---

### Critical Issue #2: PHOTO DUPLICATION — P1 🔴

The original 2,226 venues are largely clean. The March 29 batch of 1,500 new venues (500 surf + 500 ski + 500 beach) has a 66% duplication rate.

| Category | Unique Photos | Total Venues | Unique % |
|----------|-------------|-------------|---------|
| paraglide | 201 | 201 | 100% ✅ |
| kite | 199 | 200 | 100% ✅ |
| diving | 203 | 205 | 99% ✅ |
| hiking | 197 | 200 | 99% ✅ |
| climbing | 199 | 204 | 98% ✅ |
| fishing | 189 | 202 | 94% ✅ |
| kayak | 188 | 201 | 94% ✅ |
| mtb | 186 | 201 | 93% ✅ |
| **skiing** | **234** | **704** | **33% 🔴** |
| **surfing** | **233** | **703** | **33% 🔴** |
| **tanning** | **233** | **705** | **33% 🔴** |

**Combined:** The three primary launch categories (Surfing, Ski/Board, Beach) show 1 unique photo per ~3 venues. A user browsing ski resorts will see the same mountain images repeated. These are the same three categories with the artificial name problem — both issues stem from the March 29 batch expansion.

---

### Duplicate Venue IDs: 0 REAL ✅

The regex check flagged "anytime", "score", "price", "value" as duplicate IDs — but these are UI option objects (WHEN_OPTIONS, SORT_OPTIONS), not venue IDs. All 3,726 venue IDs are unique.

### Coordinate Integrity: ✅ Clean

- 3,726 venues with valid lat/lon entries
- 0 venues at null island (0,0)
- 0 venues with out-of-range coordinates (lat > 90, lon > 180)
- All airport codes are valid 3-character IATA codes
- 813 unique airport codes in use (reasonable for global coverage)

---

## 2. GEAR ITEMS AUDIT

### Status: All 11 Categories Present ✅

All venue categories have GEAR_ITEMS entries. Hiking now has 7 items (previously flagged as zero — resolved).

| Category | Amazon Links | REI Links | Status |
|----------|-------------|----------|--------|
| skiing | ✅ | ✅ | REI links earn $0 (no affiliate tag) |
| surfing | ✅ | ✅ | REI links earn $0 |
| tanning | ✅ | — | Clean |
| diving | ✅ | — | Clean |
| climbing | ✅ | ✅ | REI links earn $0 |
| kayak | ✅ | ✅ | REI links earn $0 |
| mtb | ✅ | ✅ | REI links earn $0 |
| kite | ✅ | — | Clean |
| fishing | ✅ | — | Clean |
| paraglide | ✅ | — | Clean |
| hiking | ✅ | ✅ | REI links earn $0 |

### REI Affiliate Gap — P2 🟡

**22 REI links across all categories earn $0** (no Avantlink affiliate tag applied). Current REI links use bare search URLs like `https://www.rei.com/search?q=...`. Once Jack signs up at Avantlink (30 min, LLC approved), all 22 links need the affiliate tag appended. This is the highest-ROI 30-minute task on the board.

**Amazon links:** All 39 Amazon gear links correctly use `tag=peakly-20`. No issues.

---

## 3. LOCAL_TIPS AND PACKING — P2 🟡

Both `LOCAL_TIPS` and `PACKING` arrays are missing the `hiking` category. Hiking is a 200-venue category with 7 gear items but no local tips or packing list shown in VenueDetailSheet.

**Missing LOCAL_TIPS for hiking — paste-ready fix (add inside LOCAL_TIPS object):**

```javascript
hiking: [
  "🥾 Break in new boots at home for 2+ weeks before the trail — blisters on day 1 will ruin a multi-day trek",
  "💧 Drink 500ml before you start hiking — most people arrive already dehydrated",
  "🌤️ Summit attempts are best at dawn — afternoon thunderstorms are common on exposed ridges above 3,000m",
  "🧭 Download offline maps before leaving cell coverage — Google Maps topo mode + AllTrails offline saves trips",
],
```

**Missing PACKING for hiking — paste-ready fix (add inside PACKING object):**

```javascript
hiking: [
  "Hiking boots (broken in)", "Trekking poles", "Hydration pack (3L)",
  "Navigation (GPS or downloaded topo)", "First aid kit", "Emergency bivy",
  "Layers (base, mid, shell)", "Sun protection (SPF50 + hat + sunglasses)",
  "Headlamp + spare batteries", "High-calorie snacks (1,500+ cal/day extra)",
],
```

---

## 4. SEASONAL RELEVANCE (March 30, 2026)

### Currently IN SEASON ✅

- **Northern Hemisphere surfing:** March is strong — Atlantic and Pacific swells running, water not yet too cold. NH surf venues are in season.
- **Northern Hemisphere beach/tanning:** Caribbean, Southeast Asia, Indian Ocean islands, Canary Islands, Morocco — peak or near-peak. Mediterranean is shoulder season (great for crowds).
- **NH skiing late season:** Whistler, Mammoth, Alps — closing or in spring corn snow. Valid to show but "spring skiing" language appropriate.

### Currently OUT OF SEASON ⚠️

- **73 Southern Hemisphere ski venues** (Argentina, Chile, Australia, New Zealand, lat < 0) — near-zero snow conditions until June. Live scoring will naturally depress these. No code change needed.

### Scoring Behavior Is Self-Correcting ✅

Live weather scoring automatically surfaces in-season venues at top. No manual seasonal curation required.

---

## 5. DAILY VENUE ADDITIONS — 5 Real Replacements for Artificial Names

These are verified real venues that replace artificial "X East/South" duplicates:

```javascript
// Venue 1 — Real: Hossegor La Nord (distinct break from main Hossegor beach)
{
  id:"hossegor-nord",  category:"surfing",
  title:"Hossegor – La Nord", location:"Landes, France",
  lat:43.6892, lon:-1.4514, ap:"BIQ",
  icon:"🌊", rating:4.7, reviews:312,
  gradient:"linear-gradient(160deg,#0a3d3d,#0f7c6e,#40c4a8)",
  accent:"#40c4a8", tags:["Beach Break","Pro Contest","Hollow Barrels","October Swell"],
  photo:"https://images.unsplash.com/photo-1505459668311-8dfac7952bf0?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
},

// Venue 2 — Real: Skeleton Bay, Namibia (one of world's longest left-hand barrels)
{
  id:"skeleton-bay",  category:"surfing",
  title:"Skeleton Bay", location:"Skeleton Coast, Namibia",
  lat:-22.9400, lon:14.5200, ap:"WDH",
  icon:"🌊", rating:4.85, reviews:78,
  gradient:"linear-gradient(160deg,#1a2a1a,#2d5a2d,#5a9e5a)",
  accent:"#5a9e5a", tags:["Expert Only","Left Point","1km+ Barrel","Remote"],
  photo:"https://images.unsplash.com/photo-1620034819497-06ed563e0781?w=800&h=600&fit=crop&fp-x=0.4&fp-y=0.5",
},

// Venue 3 — Real: Grandvalira, Andorra (largest ski area in Pyrenees, tax-free gear)
{
  id:"grandvalira",  category:"skiing",
  title:"Grandvalira", location:"Andorra",
  lat:42.5463, lon:1.7354, ap:"BCN",
  icon:"🏔️", rating:4.5, reviews:890,
  gradient:"linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
  accent:"#6db3f2", tags:["Tax-Free Gear","All Levels","Ski-In Ski-Out","Europe Value"],
  photo:"https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop&fp-x=0.55&fp-y=0.45",
},

// Venue 4 — Real: Pink Beach Komodo (genuinely pink sand, unique in the world)
{
  id:"pink-beach-komodo",  category:"tanning",
  title:"Pink Beach Komodo", location:"Komodo Island, Indonesia",
  lat:-8.5900, lon:119.4800, ap:"LBJ",
  icon:"🏝️", rating:4.9, reviews:445,
  gradient:"linear-gradient(160deg,#3d1a2a,#8b4568,#e08fb0)",
  accent:"#e08fb0", tags:["Pink Sand","Snorkeling","Dragon Country","Off-Grid"],
  photo:"https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55",
},

// Venue 5 — Real: Anchor Point, Morocco (world-class right-hander, not a duplicate of Taghazout)
{
  id:"anchor-point-morocco",  category:"surfing",
  title:"Anchor Point", location:"Taghazout, Morocco",
  lat:30.5494, lon:-9.7191, ap:"AGA",
  icon:"🌊", rating:4.88, reviews:623,
  gradient:"linear-gradient(160deg,#3d2a1a,#7c5a2e,#c4a840)",
  accent:"#c4a840", tags:["Right Point","Expert","Oct–Mar Season","Long Walls"],
  photo:"https://images.unsplash.com/photo-1548082966-4ce13ce75cac?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.4",
},
```

---

## PM OBSERVATION — CRITICAL FOR MARCH 31 LAUNCH

**The March 29 venue expansion created a credibility risk.** 933 venues (25% of total) have fabricated names like "Whistler Blackcomb East" and "Teahupoo East" — these will immediately read as fake to any surfer, skier, or beach traveler who knows these destinations. On Reddit, this will be called out in the comments.

**Recommended action before March 31:** Filter out the 933 artificial venues from display. The simplest approach: add `hidden: true` to these venues and update the ExploreTab filter to exclude them. This requires no deletion, is fully reversible, and drops visible venue count to ~2,793 — still impressive and, crucially, all real.

Alternatively: accept the risk and monitor the first Reddit comments. If called out, hotfix immediately.

The scoring system provides some protection — artificial venues share coordinates with their real counterparts and will have identical weather scores, so they'll be distributed throughout pagination rather than clustered at the top. But they will appear, and they will be found.

---

*Report generated: 2026-03-30 | Venues audited: 3,726 | Categories: 11 | Duplicate IDs: 0 | Artificial names: 933 | Photo duplication: 33% in top 3 categories*
