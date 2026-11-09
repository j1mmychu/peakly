# Peakly Content & Data Report — 2026-11-09

## Data Health Score: 88/100

**Deductions (Day 10 — unchanged):**
- −7: **225 venues have ≤2 tags** (Day 10 of finding) — tag enrichment remains the highest-leverage content improvement within the venue freeze.
- −5: **Venue addition queue FROZEN** per PM v193+ directive, deferred post-Reddit gate. Scored for the backlog, not a data error.

> **⚠️ STALE TASK PROMPT NOTE:** This routine's stored prompt references "182 venues, 12 categories, hiking gear items." Actual state (verified continuously): **404 venues, 2 categories (skiing + beach), GEAR_ITEMS cut for v1.** All numbers below are from live app.jsx via `eval()`.

> **⚠️ DEVOPS LATESEASON NOTE (Day 3 of correction):** DevOps report flagged lateSeason count at 10 — this is a regex/bracket-walk undercount artifact. `eval(VENUES)` confirms **15 lateSeason:true venues, unchanged.** DevOps should adopt eval method for all venue counts.

---

## 1. DATA INTEGRITY AUDIT

| Check | Result |
|-------|--------|
| Total venues | **404** ✅ |
| Skiing | **134** |
| Beach | **270** |
| Duplicate IDs | **0** ✅ |
| Duplicate photos | **0** ✅ |
| Missing coordinates | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags | **0** ✅ (all venues have tags array) |
| Empty descriptions | **N/A** — Peakly venues have no description field (not in schema) |
| APs missing from AP_CONTINENT | **0** ✅ |
| APs missing from BASE_PRICES | **0** ✅ (100% coverage — Open #22 CLOSED) |
| lateSeason:true venues | **15** ✅ (confirmed via eval) |

**No new integrity issues found. Catalog is clean.**

---

## 2. GEAR ITEMS AUDIT

**GEAR_ITEMS: CUT for v1 (Jack's decision, 2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0.**

This is not a gap — it was a deliberate revenue decision. Amazon Associates deferred post-launch. No action required. The task prompt's "hiking has ZERO gear items" note is obsolete (hiking was never a Peakly category; the prompt references a prior product concept).

**Revenue streams active:** Booking.com (aid=2311236), SafetyWing (referenceID=peakly), Travelpayouts (TP_MARKER=710303). Live RPM: ~$7.58/1K MAU.

---

## 3. SEASONAL RELEVANCE — November 9, 2026

**Current season: Early Northern Hemisphere ski season.**

| Segment | Count | Status |
|---------|-------|--------|
| N-hemi skiing (lat ≥ 0) | 111 | ✅ IN SEASON — Nov–Apr window opening |
| S-hemi skiing (lat < 0) | 23 | ⚠️ OUT OF SEASON — their window is May–Oct |
| N-hemi beach (lat ≥ 0) | 201 | Mostly off-peak; tropical venues (Caribbean, SE Asia) remain year-round |
| S-hemi beach (lat < 0) | 69 | ✅ IN SEASON — Southern summer (Nov–Feb) |

**lateSeason:true venues (15) — these N-hemi resorts bypass off-season cap when snow_depth ≥ 0.5m:**
whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch

November is exactly when these lateSeason flags earn their keep — glacier/high-altitude resorts opening before the standard Dec cutoff. No action needed; scoring handles this correctly.

**S-hemi ski venues to watch:** 23 venues (Remarkables, Portillo, Valle Nevado, Perisher, etc.) will score poorly until May 2027. Scoring's off-season cap prevents them from surfacing on the front page. Expected behavior.

**Tropical beach venues with no seasonal cap:** These continue to score well regardless of month (Bali, Maldives, Seychelles, Caribbean, etc.) — poolPrimary/tropical flags ensure beach venues with warm year-round water skip the 18°C hard cap where applicable.

---

## 4. CONTENT QUALITY

| Check | Result |
|-------|--------|
| Venues with ≤2 tags | **225** ⚠️ (Day 10 of finding) |
| Venues with ≥3 tags | **179** ✅ |
| Venue descriptions | Not in schema — N/A |
| Difficulty levels | Not in schema for beach; skiing venues use tags (e.g., "Expert Terrain") |

**Tag quality breakdown:**
- 225 venues have only 1–2 tags — these include some marquee venues (Bora Bora: "UV 11", "Crystal Water"; Chamonix: "Off-Piste", "Mont Blanc Views")
- 179 venues have 3–4 tags (Whistler: "Deep Powder", "Blackcomb Glacier", "Village Nightlife", "World Cup Racing")
- Tag enrichment to 3+ tags per venue is the highest-leverage remaining content task
- Estimated effort: ~2hr scripted pass, adding 1–2 contextually accurate tags per thin venue
- **Recommendation:** defer until post-Reddit gate per PM directive; flag for first post-launch content sprint

**Sample thin-tag venues needing enrichment:**
- `borabora` — ["UV 11", "Crystal Water"] → add "Overwater Bungalows", "Snorkeling"
- `chamonix` — ["Off-Piste", "Mont Blanc Views"] → add "Ski Touring", "World-Class Terrain"
- `aspen` — ["Expert Terrain", "Luxury Village"] → add "Four Mountains", "Celebrity Scene"
- `vail` — ["Back Bowls", "All Levels"] → add "Blue Sky Basin", "Après-Ski"
- `alta` — ["Ski Only", "Deep Powder"] → add "Snowbird Adjacent", "Utah Snow"

---

## 5. DAILY VENUE ADDITIONS

**FROZEN — per PM v193+ directive, venue additions deferred post-Reddit gate.**

The venue queue remains at 404 (134 skiing / 270 beach). No additions this run.

When the freeze lifts, priority targets for skiing (prime season now):
- Arapahoe Basin early-season opener coverage is good (lateSeason:true already)
- Consider: Breckenridge CO, Keystone CO (both Epic Pass, strong weekend traffic from DEN)
- Consider: Courchevel 1850 FR (missing; Meribel present, Three Valleys gap)
- Consider: Niseko Annupuri JP (Niseko United present but Annupuri separately notable)
- Consider: Revelstoke BC (heli-ski adjacent, fastest-growing N-America resort)

For beach (S-hemi summer in season now):
- Consider: Noosa Heads QLD AU (BNE airport, strong scores Nov-Feb)
- Consider: Abel Tasman NZ (CHC airport, golden sand, in-season)

---

## ONE OBSERVATION FOR THE PM

**The 23 Southern Hemisphere ski venues are dead weight on the front page until May 2027.** They won't surface (scoring correctly gates them off), but they consume ~17% of the skiing catalog. As the app approaches its Reddit post, this means the *effective* discoverable ski inventory is 111 N-hemi venues, not 134. No action needed from scoring — it's working as designed. Worth noting for the Reddit post timing: launching in November means the full ski catalog hits peak relevance immediately, which is favorable timing.

**Cache stamp status:** DevOps flagged cache stamp as 9 days stale. This is a DevOps/deploy concern, not a content issue. Content catalog itself is fully current.

---

*Report generated: 2026-11-09 15:15 UTC | Venues audited via node eval() | Methodology: eval(VENUES array) for authoritative counts*
