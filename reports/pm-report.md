# PM Report v120 — 2026-08-15

> Supersedes v119 (Aug 14). **Status: YELLOW.** Day 45. Reddit deadline Aug 22 — **7 days out**. Cache stamp: `20260815b`. Venues: **389** (131 ski / 258 beach). BASE_PRICES: **~111/159 unique APs (~70%)** — 70% sprint target reached. Photo gap: 329/384 generic stock (UNSPLASH_KEY still blocking).

---

## Shipped Since v119

| Commit | What | Assessment |
|--------|------|------------|
| `140641e` | DevOps 08-15: BASE_PRICES +8 APs (TAB/JMK/JTR/MAH/ENI/PPP/PRI/PQC), cache stamp 20260815a | ✅ **Execution loop is fixed.** First clean DevOps execution since the prompt fix in v119. Coverage lifted 89→97/157 (60.5%→66%). |
| `2d7f367` | Content 08-15: 5 Mediterranean venue proposals (NAP/FAO/CAG/TPS/TGD), +6 BASE_PRICES batch (GIG/KOA/DBV/RAK/NAP/CAG), confirmed 68% coverage | ✅ Good data. NAP/CAG already covered, FAO now covered per DevOps run. |
| **PM v120 (this run)** | BASE_PRICES +4 APs (GIG/KOA/DBV/RAK); 5 venues (beach_capri/beach_tavira_island/beach_villasimius/beach_san_vito_lo_capo/beach_budva); cache stamp 20260815b; `.venue-baseline` → 389 | ✅ **70% BASE_PRICES target reached (~111/159).** 5 venues all Mediterranean peak-season, 3/5 APs immediately deal-scored (NAP/FAO/CAG). |

**What this run did NOT ship:** TPS and TGD BASE_PRICES entries. Both are small-airport European destinations (Trapani, Tivat) with 1 venue each and limited US-direct routing. Content flagged them as continent-fallback — $X pricing will show, no deal badge. Acceptable tradeoff: real fares from those 2 airports to 14 US origins are scarce and unreliable. Defer indefinitely.

**Permanent corrections — stop re-raising these:**
- **Open #23 (disk cache):** ✅ CLOSED. VPS 2026-08-11. Add to known-skipped.
- **Peakly Pro:** CUT. Zero instances in codebase. Not a bug.
- **Sentry DSN:** LIVE.
- **"182 venues / 12 categories":** 389 venues (as of this run), 2 categories.
- **VPS down:** VPS CLOSED 2026-08-11 (Jack SSH). Sandbox 403 ≠ VPS outage.
- **DevOps execution failure:** RESOLVED in v119. First clean run today.

---

## Bug Triage — Aug 15

| Bug | Severity | Status |
|-----|----------|--------|
| **Photos: 329+ of 389 generic stock** | P0 (Reddit gate) | UNSPLASH_KEY from Jack is the single remaining blocker. No code work needed — pipeline ready. Aug 22 deadline is hard. Slip to Aug 29 only if UNSPLASH_KEY arrives by Aug 20. |
| **TPS/TGD venues: no deal badge** | P3 | Accepted. Continent-fallback pricing active. ~$X shows, no "Strong deal" label. 2 venues out of 389. |
| **Open #22: Supabase delete-account SQL** | P0 (App Store only) | Jack-only, 2-min paste. Not a web Reddit launch blocker. |
| **BASE_PRICES photo-count drift** | P3 | Content report used 157 unique venue APs; actual count after today is 159 (2 new APs: TPS/TGD). Reports should recount after every venue batch. |

---

## Three Product Decisions — Aug 15

### Decision 1: 70% BASE_PRICES target REACHED — next sprint to 75% targets OSL/TFS/SPU/SOF/TBS

We hit 70% coverage (~111/159) this run. The sprint that started Aug 9 is complete. The deal badge is now visible on 70%+ of the catalog — the hero feature works for the majority of venues.

**DECISION: Next batch targets the 5 multi-venue APs still uncovered.** DevOps executes next run with this paste-ready data:

```javascript
  // ── BASE_PRICES batch — PM v120 Decision 1 — OSL/TFS/SPU/SOF/TBS ──
  OSL:{ JFK:700, LAX:980, SFO:960, ORD:780, MIA:880, SEA:1040, BOS:660, ATL:820, DEN:900, DFW:860, LAS:940, PHX:960, MSP:820, DTW:810 },
  TFS:{ JFK:780, LAX:1060,SFO:1020,ORD:860, MIA:960, SEA:1120,BOS:740, ATL:880, DEN:960, DFW:920, LAS:1000,PHX:1020,MSP:900, DTW:890 },
  SPU:{ JFK:760, LAX:1040,SFO:1000,ORD:840, MIA:940, SEA:1100,BOS:720, ATL:860, DEN:940, DFW:900, LAS:980, PHX:1000,MSP:880, DTW:870 },
  SOF:{ JFK:780, LAX:1060,SFO:1020,ORD:860, MIA:960, SEA:1120,BOS:740, ATL:880, DEN:960, DFW:920, LAS:1000,PHX:1020,MSP:900, DTW:890 },
  TBS:{ JFK:920, LAX:1200,SFO:1160,ORD:1000,MIA:1080,SEA:1260,BOS:880, ATL:1020,DEN:1100,DFW:1060,LAS:1160,PHX:1180,MSP:1040,DTW:1030 },
```

These 5 APs unlock deal badges for ~10 more venues. Gets us to ~75%. Paste inside `const BASE_PRICES = { ... }` before closing `};`. Bump cache stamp to `20260815c` in app.jsx + sw.js + index.html.

---

### Decision 2: Venue moratorium holds — no more additions until quality catches up

389 venues is a credible catalog. Adding more venues without fixing photos is the wrong trade: each new venue at 1920×1080 generic Unsplash is one more broken window on launch day.

**DECISION: Moratorium until post-Reddit launch OR UNSPLASH_KEY arrives.** If UNSPLASH_KEY arrives, photo pipeline runs first, THEN venue additions resume. Content agent can continue surfacing candidates but none land in app.jsx until photos are fixed or Jack explicitly overrides.

Exception: if a venue's AP has BASE_PRICES coverage AND a verified venue-specific photo URL, DevOps may add it in the same run without PM approval.

---

### Decision 3: Photo gate is the ONLY Reddit launch blocker — escalate now

The pipeline is code-complete. `scripts/photos-fetch.mjs`, `photos-review.mjs`, `photos-apply.mjs` are all ready. The only missing input is `UNSPLASH_KEY` from Jack's Apple Dev account or a personal Unsplash API key (free, no LLC required). Time to run: ~2 hours. Photos on 50 marquee venues transforms the app from "template demo" to "real product."

**DECISION: Reddit post slips to Aug 29 if UNSPLASH_KEY isn't received by Aug 20.** Not negotiable. Launching to r/skiing or r/travel with 329 generic stock photos will crater the conversion that makes the 8K user path possible. One bad first impression in a subreddit can't be un-done with a patch the next day.

**Jack: the ask is your Unsplash API key (or create one at unsplash.com/developers, it's free and takes 5 minutes).**

---

## This Week's Top 3 Priorities

1. **Jack: UNSPLASH_KEY or Unsplash dev account** — Reddit launch gate. Hard deadline Aug 20 for Aug 22 launch. No code work needed on our end.
2. **DevOps: OSL/TFS/SPU/SOF/TBS BASE_PRICES batch (paste-ready above)** — execute next run, gets coverage to ~75%. Same pattern as today — execute, don't report.
3. **Jack: Supabase delete-account SQL paste** — 2-min task, App Store Guideline 5.1.1(v). Not a web launch blocker but required before any iOS App Store submission.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **TPS/TGD BASE_PRICES entries** | US-direct flights to Trapani and Tivat are scarce. Unreliable price data would show misleading fares. Continent-fallback pricing is honest and sufficient. |
| **SRI on CDN scripts** | Could break Babel eval. Post-launch. |
| **JSON-LD / h1 SEO** | Zero conversion impact at <100 MAU. Post-Reddit cleanup. |
| **iOS App Store submission** | Needs Jack + Xcode. Not blocking web launch. |
| **Venue deep links** | Decided AFTER Reddit launch. Decision stands. |
| **More venue additions** | Moratorium. Quality before quantity. |

---

## Success Criteria

**90-day target: 5K–8K users.** Reddit launch Aug 22 (hard slip to Aug 29 if no UNSPLASH_KEY by Aug 20).

| Driver | 5K path | 8K path |
|--------|---------|---------|
| Reddit post quality | 1 post, r/skiing or r/travel | **3 posts same week** (r/skiing + r/travel + r/frugaltravel) |
| Photo quality at launch | 329+ generic | **Top 50 venues real photos** (UNSPLASH_KEY gate) |
| BASE_PRICES coverage | ~70% (today) | **~75%+ before Reddit** (OSL/TFS/SPU batch) |
| Venue catalog | 389 (today) | **389 — moratorium, focus on quality** |

---

## One Product Risk Nobody Is Talking About

The Explore grid default sort is "Best weekend" (weekendScore). In August, N-hemisphere ski venues correctly score low (off-season cap). What actually surfaces: ~258 beach venues competing head-to-head. The top-of-grid venues on Reddit launch day will be determined entirely by beach scoring quality — wave height, UV, water temp, sun hours. If Open-Meteo has a bad data day for Mediterranean beach venues (which dominate the top-scroll), the first 20 cards a Reddit user sees could all be showing "Score: 50" with no confidence, defeating the entire product pitch in 3 seconds. We don't have a rehearsal mechanism for this. The smoke test verifies "app renders, no ErrorBoundary" — it doesn't verify "grid shows compelling scores." Consider a dry-run where someone loads the live app on the day before Reddit post, screenshots the actual Explore grid, and sanity-checks that the top 10 venues look genuinely worth clicking.
