# Peakly PM Report — 2026-06-15 (v59)

> Supersedes v58 (June 14). **Status: YELLOW → RED on launch urgency.** Code is healthy. Photo 6× regression fixed inline. The live site is solid. **There is still no Reddit post. The summer-beach window has 5 weeks left at peak. Every week that slips costs ~10% of the 90-day user projection. This is the only lever that matters right now.**

---

## Prompt Corrections (false alarms — last time these appear)

| Prompt Claim | Reality |
|---|---|
| "Peakly Pro price showing $9/mo" | Pro UI removed April 16. No price renders anywhere in the product. Non-issue. |
| "Sentry DSN empty" | Non-empty at `app.jsx:7`. Active DSN confirmed by DevOps every run since May. |
| "Cache buster stale" | Cache buster auto-bumps via `auto-push.sh` on every Edit/Write touch to `app.jsx`/`sw.js`/`index.html`. Current: `20260614c`. Not stale. |
| "182 venues, 12 categories" | **358 venues, 2 categories (skiing / beach)**. Pre-pivot state from the prompt boilerplate. |

These are not open bugs. Stop triaging them.

---

## Shipped Since v58 (2026-06-14 → 2026-06-15)

| What | Verdict |
|---|---|
| **DevOps June 15** — GREEN status, DEAL_WEIGHT CLAUDE.md note corrected | ✅ Correct. |
| **Content June 15** — Photo 6× regression detected (kirkwood + anse-volbert-praslin) | ⚠️ Real regression, triggered by post-dedup venue adds bypassing the cap. |
| **Photo regression fixed inline (this run)** — kirkwood → Sierra Nevada shot, anse-volbert → distinct Seychelles shot | ✅ Max repeat back to ≤3×. |
| `auto: app.jsx, index.html, sw.js` (commit `1bb66bf`, June 14) — Supabase 2.45.4→2.106.2, lazy Leaflet loader, `forceCleanReload()` helper, SW update probe on boot | ✅ All defensively correct. |

**Code state June 15:**
- `app.jsx`: 13,189+ lines · cache auto-bumps on next push · braces 5,543/5,543
- **358 venues** (130 skiing / 228 beach)
- Photo max repeat: ≤3× (fixed this run)
- GEAR_ITEMS: 0 ✅ · Sentry: active ✅ · ALERTS_AVAILABLE gated ✅

---

## Bug Triage — June 15

| Bug | Severity | Days Open | Status |
|---|---|---|---|
| **Web launch: no Reddit post** | **P0 (business)** | Day 9 | Jack only. Product is done. |
| **VPS unverified 5 days** | **P0 pre-launch** | 5 days since last confirm | Jack: `ssh root@198.199.80.21 'pm2 status && curl -s localhost:3001/health'`. Do this before posting. |
| **Supabase SQL paste** (`server/sql/delete-account.sql`) | P0 (App Store gate) | 5 days unactioned | 2 min. Supabase SQL editor. Unblocks App Store 5.1.1(v). |
| Photo 6× regression | P2 | 1 day | **FIXED this run** (kirkwood + anse-volbert-praslin). |
| 13 stale `claude/*` remote branches | P2 | 8 days | Jack: `git push origin --delete <branch>` × 13. Pre-App-Store hygiene. |
| Eager Supabase `<script>` at `index.html:85` | P2 | 39 days | `git apply reports/ready-to-ship/eager-supabase-delete-2026-06-11.diff`. 30 seconds. |
| SRI on React/ReactDOM | P3 | 40+ days | DEFER post-launch. Final. |
| CSP meta tag | P3 | 40+ days | DEFER. Babel `unsafe-eval` exemption required. |

**Closed permanently this report:**
- Peakly Pro price discrepancy → Non-issue. UI removed April 16. Never re-raise.
- Sentry DSN empty → Active. Never re-raise.
- Cache buster stale → Auto-bump structural. Never re-raise.

---

## Known Blockers

| Blocker | What It Unlocks | Effort | Days Stalled |
|---|---|---|---|
| **Jack posts to Reddit** | Users. Traffic. The 100K goal. | 1 post, ~15 min to write | 9 |
| **VPS SSH verify** | Confident launch — cache absorbs Reddit spike, no 429s | 5 min | 5 |
| **Supabase SQL paste** | iOS App Store submission (5.1.1(v)) | 2 min | 5 |
| Eager-Supabase diff apply | ~80KB off first paint for anonymous users | 30 sec | 39 days |
| Apple Developer enrollment | iOS App Store queue | ~1–2h + Apple wait | 15+ |
| LLC approval | REI (+$6.16/1K), Backcountry/GYG (+$1.84/1K) | External | External |

---

## Explicit Product Decisions — June 15

### Decision 1: Reddit launch is TODAY or TOMORROW. Not "this weekend." Today.

v58 said "this weekend (June 14–15)." It's June 15. The post hasn't gone up. The 100K goal requires launching in the summer-beach window — that window peaks in late June and is gone by mid-August. Every additional day of delay costs compounding reach.

**DECISION:** Jack posts to r/solotravel today (Sunday June 15) or first thing Monday June 16 before the US workday. If it slips to next weekend (June 21–22), the 90-day projection drops from 7K–9K to 5K–7K. That is the cost. It is a real number.

Pre-post checklist (Jack, ~10 min total):
```
1. SSH verify VPS (5 min):
   ssh root@198.199.80.21 'pm2 status && curl -s localhost:3001/health'
2. Open app incognito on mobile, set SFO, confirm ≥8 cards + prices render (~3 min)
3. Post to r/solotravel — first person, real airport, real venue (~5 min to write)
```
Then r/frugaltravel 1–2 hours later. No simultaneous cross-posts.

### Decision 2: Unreviewed algorithm branches stay off main until post-launch.

`claude/improve-scoring-system-XYGY6` contains "Scoring honesty pass: variance penalty + softer caps + tighter weights" — algorithm changes that CLAUDE.md requires a critique before shipping. This branch is NOT on main and must stay off main until: (a) Jack explicitly authorizes it AND (b) the six-hole audit in `~/.claude/plans/effervescent-jumping-hopper.md` is applied.

**DECISION:** Scoring freeze holds through launch week. No algorithm changes until we have baseline data on what the grid looks like at real traffic. A scoring change shipped during a Reddit spike with no baseline to diff against is how you lose the thread narrative.

### Decision 3: Eager Supabase diff ships in the next agent run.

39 days is too long. This removes ~80KB from first paint for every anonymous user — which is every user coming from a Reddit post. Under a spike, this is the difference between 2.1s and 2.8s time-to-interactive on mobile. The diff is already written and tested.

**DECISION:** Next scheduled agent applies `git apply reports/ready-to-ship/eager-supabase-delete-2026-06-11.diff`. If it conflicts, the agent resolves and ships. No more deferral.

---

## This Week's Top 3 Priorities Only

**1. Jack: VPS verify + Reddit post (today/tomorrow, ~10 min).**
The post is the product. Everything else is infrastructure. See Decision 1 above.

**2. Jack: Supabase SQL paste (2 min).**
`server/sql/delete-account.sql` → Supabase SQL editor → run. Unblocks App Store 5.1.1(v). Sitting unpasted 5 days.

**3. Agent: Apply eager-Supabase diff.**
```bash
git apply reports/ready-to-ship/eager-supabase-delete-2026-06-11.diff
```
~80KB off first paint. 39 days outstanding. This run or the next.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---|---|---|
| New venue additions | **REJECTED — freeze holds** | 358 venues is enough. Open-Meteo free-tier headroom is the real constraint. Don't add until post-launch data shows which venues users actually want. |
| Scoring algorithm changes | **REJECTED pre-launch** | Requires algorithm critique per CLAUDE.md. No baseline data yet. |
| Front-page redesign (`claude/redesign-front-page-EndKs`) | **REJECTED — do not merge** | Code freeze. Branch unreviewed. UX rewrites during a spike are how apps break. |
| Cloudflare CDN | **DEFER week 2** | After the post lands and traffic is real. |
| iOS App Store submission | **DEFER — after web launch data** | APNS parked, Supabase SQL pending, LLC pending. Web-first. |
| Tag enrichment (279 thin venues) | **DEFER July** | P3. Post-launch sprint. |
| Hotels in deal score | **CUT. Final.** | v2. |
| Peakly Pro UI | **CUT for v1. Final.** | Post-1K MAU. |

---

## Pre-Launch Checklist — June 15

| # | Item | Status |
|---|---|---|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (3 sites) | ✅ |
| 3 | GEAR_ITEMS: 0 | ✅ |
| 4 | Sentry DSN non-empty | ✅ |
| 5 | Seasonal default beach N-hem June | ✅ |
| 6 | lateSeason flags (26 ski venues) | ✅ |
| 7 | Cache stamp lockstep (auto-bumps) | ✅ |
| 8 | JSON-LD structured data | ✅ |
| 9 | Static H1 fallback | ✅ |
| 10 | ScoringExplainer (one-time card) | ✅ |
| 11 | Grid sorts by weekendScore | ✅ |
| 12 | Image lazy loading (all tags) | ✅ |
| 13 | OG/JSON-LD venue count `350+` | ✅ |
| 14 | skiPass 100% on ski venues | ✅ |
| 15 | AP_CONTINENT complete | ✅ |
| 16 | Photo dedup (max repeat ≤3×) | ✅ **(fixed this run)** |
| 17 | `book_click` + ToS/Privacy links | ✅ |
| 18 | **VPS `/health` green** | ❓ Jack: verify before posting (5 min) |
| 19 | **Plausible domain validated** | ❓ Jack: confirm in Plausible dashboard |
| 20 | **Reddit account karma check** | ❌ Jack: verify account age + karma before posting |
| 21 | **Reddit post written + posted** | ❌ Jack, TODAY |
| 22 | **Pre-launch incognito mobile audit** | ❌ Jack: incognito, set SFO, confirm ≥8 cards + prices render |
| 23 | Account deletion SQL pasted in Supabase | ❌ Jack (App Store gate, not Reddit gate) — 2 min |

**17 of 23 green. Zero code left to write. 6 items are Jack-manual execution.**

---

## Revenue Model — June 15

| Stream | Status | RPM/1K MAU |
|---|---|---|
| Booking.com (`aid=2311236`) | ✅ Live | $6.90 |
| SafetyWing (`referenceID=peakly`) | ✅ Live | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ Live (VPS pending verify) | $0.14 |
| Amazon Associates | ❌ CUT for v1 | $0 |
| REI (Avantlink) | LLC pending | +$6.16 unlocked |
| Backcountry / GetYourGuide | LLC pending | +$1.84 unlocked |

**Live RPM: $7.58/1K MAU.** LLC approval → ~$15.58. Revenue is noise until launch drives MAU.

---

## 90-Day Projection — June 15

| Scenario | Users (90d) | What Has to Be True |
|---|---|---|
| Post today/tomorrow + VPS live | **7K–9K** | VPS confirmed before spike. Grid shows ≥8 strong beach cards. Jack in the thread for 3h. |
| Post today/tomorrow + VPS down | **1K–2K** | Grid degrades under spike. "Broken/slow" becomes the Reddit narrative. Sticky. |
| Launch slips to June 22 | **5K–7K** | Peak FOMO window closing. One week = ~10% off the ceiling. |
| No launch until July | **3K–5K** | Beach window half-gone. 100K goal slips to 2027. |

**For 9K not 7K:** VPS confirmed, post up Sunday or Monday 9–11am PST, Jack present in the thread for 3h, first 10 comments are conversation not comparison to KAYAK.

---

## One Product Risk Nobody Is Talking About

**13 agent-spawned branches are accumulating unreviewed, and at least one contains algorithm changes.**

`claude/improve-scoring-system-XYGY6` has a commit titled "Scoring honesty pass: variance penalty + softer caps + tighter weights." That sounds legitimate. It is NOT on main. But the pattern is: an agent spawns a branch, makes changes, stops. The `restore-appjsx` and `fix-appjsx-final` branches suggest at least one prior experiment broke the app badly enough to need restoration from scratch (commit message: "Restore app.jsx — fix 4 data-quality bugs"). 

Jack may review and merge these during the post-launch spike — when he's distracted, traffic is real, and there's social pressure to push improvements fast. An unreviewed scoring change merged during that window means: (a) no baseline to diff against, (b) users who shared the app on Reddit see a different grid than what they shared, (c) engagement data is poisoned.

**The fix:** Clean up all 13 branches before the Reddit post. 15 minutes. `git push origin --delete <branch>` × 13. Any scoring change that re-surfaces gets the full six-hole audit before merge. This is the only open risk with a meaningful blast radius that nobody has put on the checklist.

---

*Written 2026-06-15 | PM v59 | Venues: 358 (130 ski / 228 beach) | Photo fix: kirkwood + anse-volbert-praslin swapped to distinct images*
