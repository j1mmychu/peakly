# Peakly Content & Data Report — 2026-11-08

## Data Health Score: 88/100

**Deductions (Day 9 — unchanged):**
- −7: **225 venues have ≤2 tags** (Day 9 of finding) — tag enrichment remains the highest-leverage content improvement within the venue freeze.
- −5: **Venue addition queue FROZEN** per PM v193+ directive, deferred post-Reddit gate. Scored for the backlog, not a data error.

> **⚠️ STALE TASK PROMPT NOTE:** This routine's stored prompt references "182 venues, 12 categories, hiking gear items." Actual state (verified continuously since 2026-11-01): **404 venues, 2 categories (skiing + beach), GEAR_ITEMS cut for v1.** All numbers below are from live app.jsx via `eval()`.

> **⚠️ DEVOPS LATESEASON NOTE (Day 2 of correction):** DevOps report yesterday flagged lateSeason count at 10 — this is a methodology artifact (regex/bracket-walk undercount). `eval(VENUES)` confirms **15 lateSeason:true venues, unchanged.** DevOps should adopt the eval method for all venue counts.

---

## 1. DATA INTEGRITY AUDIT

| Check | Result |
|-------|--------|
| Total venues | **404** ✅ (`.venue-baseline` confirmed) |
| Skiing | **134** |
| Beach | **270** |
| Categories < 10 (stubs) | **0** ✅ — only 2 categories, both well above threshold |
| Duplicate IDs | **0** ✅ |
| Duplicate photos | **0** ✅ |
| Missing photos | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing coordinates | **0** ✅ |
| Airport codes missing from AP_CONTINENT | **0** ✅ |
| Airport codes missing from AIRPORT_COORDS | **0** ✅ |
| Rating out of 1–5 range | **0** ✅ |
| BASE_PRICES coverage (165 unique venue APs) | **100%** ✅ — Open #22 CLOSED per DevOps 11-08 |
| lateSeason: true venues | **15** ✅ (confirmed by eval) |

**Integrity: CLEAN.** No structural data issues.

---

## 2. GEAR ITEMS AUDIT

**GEAR_ITEMS: NOT PRESENT in app.jsx** — formally cut for v1 by Jack (2026-06-09). Confirmed `grep -c GEAR_ITEMS app.jsx → 0`. Revenue impact acknowledged ($0 Amazon, v1 RPM = $7.58/1K MAU). No action needed; revisit post-launch if revenue gap warrants it.

---

## 3. SEASONAL RELEVANCE (2026-11-08)

| Segment | Count | Status |
|---------|-------|--------|
| Skiing — N. Hemisphere (lat ≥ 0) | 111 | **IN SEASON** — early-season opening weeks |
| Skiing — S. Hemisphere (lat < 0) | 23 | Off-season (spring/summer) |
| Beach — N. Hemisphere (lat ≥ 0) | 201 | **Off-season** (late fall) |
| Beach — S. Hemisphere (lat < 0) | 69 | **IN SEASON** — spring/summer peak |

**Active in-season inventory (scoring will fire):**
- **111 N. hemi ski venues** — peak timing. Whistler opens ~Nov 22. Early-season resorts like Hintertux Glacier, Val Thorens, Tignes, and Saas-Fee (all `lateSeason: true`) are already rideable. The 15 lateSeason venues are correctly flagged to bypass the off-season cap when snow depth ≥ 0.5m.
- **69 S. hemi beach venues** — Maldives, Fiji, Bali, Queensland, Cape Town window approaching peak.

**Potential scoring concern:** 201 N. hemi beach venues will score poorly in Nov (cold water, low UV). The scoring engine handles this correctly via water-temp hard cap and weather scoring, so users won't be sent to rainy Brighton in November. No action needed in data layer.

---

## 4. CONTENT QUALITY

### Description Fields
Venues do **not** have a `description` field — this is by design (schema: id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo + optional skiPass/lateSeason). The UI surfaces tags as the content layer. No issue.

### Tag Coverage — **PERSISTENT FINDING (Day 9)**
- **225 of 404 venues (55.7%) have ≤2 tags** — quality floor is 3+ tags.
- Affects primarily beach venues (Caribbean, Pacific islands) and some legacy ski entries.
- Sample thin-tag beach venues: `borabora` [UV 11, Crystal Water], `beach_gcm` [World's Best Beach, Crystal Caribbean], `beach_grace` [#1 Ranked Beach, Swim-Through Reef]
- **Impact:** Tags power the search corpus, Powder Day filter, and detail-sheet display. Thin tags reduce search recall and make venue cards feel sparse.
- **Recommendation:** Backlog item — enrich top 50 thin-tag venues (3–4 tags each) post-Reddit gate. Estimated effort: 2 hours. No venue freeze conflict (tag edits don't add venues).

### Venue Names / Locations
No typos detected in sampled fields. All 165 unique airport IATA codes resolve correctly in both AP_CONTINENT and AIRPORT_COORDS.

---

## 5. DAILY VENUE ADDITIONS

**FROZEN** per PM v193+ directive (post-Reddit gate). The venue-addition section of this prompt is not actionable until the freeze lifts.

When the freeze lifts, priority targets:
- Beach: S. hemisphere gaps (New Caledonia, Mozambique, Sri Lanka underrepresented)
- Skiing: Andean resorts (Portillo, Valle Nevado) for S. hemisphere winter (Jun–Aug)

---

## ONE OBSERVATION FOR THE PM

**Whistler opens in ~14 days (est. Nov 22).** It's the #1-rated ski venue (4.97 ★, 2840 reviews) and will anchor the top of the Explore grid the moment early-season snow depth clears the lateSeason scoring threshold. The `lateSeason: true` flag is correctly set. If the app is live and driving traffic by then, the first real-world scoring run on a Whistler opening weekend is the best possible product demo — conditions + live flight price converging on the flagship venue. Worth timing any Reddit/HN post to land 1–2 days before that window.
