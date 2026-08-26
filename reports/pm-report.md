# Peakly PM Report v131 — 2026-08-26

**Status: 🟢 GREEN — Post-launch day 4. Geo-silent-block P1 fixed overnight. Reddit/HN gate is now clear. Waiting on Jack's Plausible numbers to make the go/no-go call on the post.**

---

## Shipped Since Last Report (v130 → v131)

| Commit | What | Right call? |
|--------|------|-------------|
| `e29b453` | DevOps Aug 26 — geo-silent-block P1 fixed (12s JS timeout fallback in `detectAirport()`), cache `20260826a` | ✅ This was the last product blocker before Reddit. Correct priority. |
| `39b0f44` | Content Aug 26 — 97/100, BASE_PRICES 100% reconfirmed, 5 venue objects prepared (4 carryovers + Hintertux) | ✅ Verification pass correct. Venue objects are authored but not pasted — right call to wait for PM review. |

**No product regressions introduced.** Both commits are infrastructure/verification only.

---

## Overnight Activity Assessment

Three days since launch (Aug 22), no commits from Jack visible in the log. All commits are agent-authored reports. This is expected — Jack hasn't shared Plausible data yet, which is the primary missing input for all prioritization decisions. Without session counts, bounce rate, and airport-set rate, the team is flying on assumptions.

**15 stale `claude/*` branches remain on origin** — some are from May–July and contain significant unreviewed code (scoring changes, UI rewrites, a vitest test suite). None are merged. This is a latent risk, not an active regression. See "One product risk nobody is talking about" below.

---

## Bug Triage

### Peakly Pro price ($9/mo vs $79/yr)
**CLOSED.** Peakly Pro is cut. Zero references in `app.jsx`. Will not appear again.

### Sentry DSN
**CLOSED.** DSN `9416b032a46681d74645b056fcb08eb7` live in both `index.html:77` and `app.jsx:7-8`.

### Cache buster
**CLOSED.** `20260826a` in lockstep across `app.jsx:17`, `sw.js:2`, `index.html:395`.

### Geo-silent-block (P1 — FIXED this report cycle)
DevOps shipped the 12s JS-level `setTimeout` fallback in `detectAirport()`. If `geoState` is still `"detecting"` after 10s API timeout + 2s buffer, it forces `"done"` and surfaces the manual airport picker. `clearTimeout` called in both success/error paths — inert in the normal case. This was the last gate before the Reddit post.

**Cannot be device-verified from sandbox.** Jack: test on an iPhone with Location Services OFF before posting to Reddit.

### BASE_PRICES coverage
**CLOSED.** 162/162 unique venue APs have BASE_PRICES entries. Content confirmed. Zero fallback-to-$350 routes.

### VPS disk cache (Open #23)
**Open — deprioritized.** At <1K MAU, the VPS in-memory cache refills within minutes of `pm2 restart`. Becomes P1 the moment a Reddit post goes live. Bundle with any VPS maintenance. Jack: don't restart the VPS without shipping the disk cache first.

---

## Three Product Decisions — Aug 26

### Decision 1: Add Hintertux Glacier — SHIP NOW.

Content's 5th venue recommendation fills a genuine dead zone. On August 26, a European user who filters for skiing sees 14 `lateSeason:true` resorts — but none that are *guaranteed open today*. Hintertux is the only 365-day ski area in the Alps. 3,250m glacier; it has snow right now. INN (Innsbruck) is confirmed in BASE_PRICES, AP_CONTINENT, AIRPORT_COORDS.

The venue object is authored in `reports/content-report.md` (Aug 26 batch, item 5). Paste it. Bump `.venue-baseline` to 392. This is the one venue that directly answers "where can I ski this weekend in late August in Europe" — which is an unanswered product question today.

### Decision 2: Defer the other 4 venue carryovers — DEFER.

Praia do Camilo (FAO), Nusa Penida (DPS), Gili Trawangan (DPS), Arolla (GVA): all well-sourced, all use Wikimedia photos (violates Unsplash-only policy), two share the DPS airport (cluster risk). The catalog is 391 venues with 57% in-season now. Depth is not the constraint. Defer until: (a) Plausible shows unfulfilled search demand in those regions, or (b) Unsplash alternatives are sourced. Not before.

### Decision 3: Reddit/HN post gate — geo-silent-block is cleared. Jack owns the go/no-go now.

As of this report, three of the four gates are done: Sentry ✅, BASE_PRICES 100% ✅, geo-silent-block fixed ✅. The fourth gate (Plausible review + representative photos for most-screenshotted venues) is Jack-blocked — only he can read the Plausible dashboard and only he can decide whether the current photo quality is embarrassing on a viral screenshare.

**Recommendation:** Post to r/skiing and r/solotravel on Thursday evening EST (Aug 27). Lead with the best pick for *this specific weekend*, not the app's feature list. The post works if it's genuinely useful first. If Plausible shows zero sessions from the GitHub Pages launch, the post becomes more important, not less.

---

## This Week's Top 3 Priorities Only

**1. Jack: Read Plausible + Sentry from Aug 22–26 and report the numbers.**
Specific asks: total sessions, bounce rate, ErrorBoundary events, `alert_registered_server` fires, and how many sessions appear to have no departure airport set. This unlocks every other product decision. Nothing else matters until this exists.

**2. Jack: Paste Hintertux Glacier into VENUES.**
One venue, 12 lines, 5-minute task. It's the only product answer to "ski in Europe in late August" and it's not in the catalog. The object is ready in `reports/content-report.md` (Aug 26, item 5). Bump `.venue-baseline` to 392 after.

**3. Jack: Device-test geo-silent-block fix, then post to Reddit (Thursday evening EST).**
Set iPhone location OFF, open app, confirm airport picker surfaces within 12s. If it works, the post goes out. If it doesn't, file what happened back here and DevOps will patch. Don't post without the device test.

---

## Features REJECTED This Week

- **Nusa Penida + Gili Trawangan** — DEFER. Same DPS airport creates a cluster; Wikimedia photos; no Plausible signal on SE Asia demand.
- **Praia do Camilo + Arolla** — DEFER. Wikimedia photos; catalog depth not confirmed as retention lever.
- **JSON-LD structured data** — CUT (third time). Reddit traffic doesn't route through Google. Revisit at 10K.
- **Static h1 SEO fallback** — CUT. Same reason.
- **vitest / unit test suite** (seen in `claude/analyze-test-coverage-WVIsT`) — CUT. Single-file SPA with no CI for tests. Wrong complexity at <1K MAU and wrong architecture for this codebase.
- **Front page redesign** (seen in `claude/redesign-front-page-EndKs`) — CUT. Do not redesign a product that launched 4 days ago before seeing any user data. The redesign branch has never been merged for a reason.
- **VPS disk cache (Open #23)** — DEFER until Reddit post is imminent. Then it becomes P0-pre-post.

---

## Success Criteria

**What defines 8K users (not 5K) by 90 days:**
1. One successful Reddit/HN post landing in the first two weeks. The difference between 5K and 8K is one good post in week 1 vs. week 3.
2. Retention > 20% on Day 7. At 5K MAU with 20% retention, you have 1,000 weekly active users — enough for word-of-mouth. Below 20%, every user you acquire evaporates.
3. At least one real user signing up for email alerts and receiving a push notification that brings them back. Alerts are the only re-engagement mechanism before a native app is in app stores.

**Current trajectory gap:** No Plausible data from the first 4 days means we don't know if Day-7 retention is 0% or 40%. This is the most important unknown right now.

---

## One Product Risk Nobody Is Talking About

**15 unmerged `claude/*` branches on origin contain significant unreviewed code changes that have never been applied to main.**

This includes: a scoring honesty pass with variance penalty and softer caps (`claude/improve-scoring-system`), a vitest test suite (`claude/analyze-test-coverage`), a front page redesign (`claude/redesign-front-page`), ~870 lines of dead-code deletion (`claude/code-review-cleanup`), and UI rewrites for the Alerts and Profile tabs. None of these are regressions today — main is clean. But these branches represent forks of older app.jsx state, and if any of them get accidentally rebased or cherry-picked onto current main, they will silently stomp 4 months of work.

**Jack: run `git push origin --delete $(git branch -r | grep 'origin/claude/' | sed 's|origin/||' | tr '\n' ' ')` to delete all 15 at once.** If any branch contains work worth keeping, read its diff first — but none of them are on the critical path and they are all obsolete against the Aug 26 codebase. The branch graveyard is the risk, not any individual change.

---

*v131 — PM agent, 2026-08-26. Next report: 2026-08-27.*
