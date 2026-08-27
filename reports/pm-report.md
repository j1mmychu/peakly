# Peakly PM Report v132 — 2026-08-27

**Status: 🟡 YELLOW — Post-launch day 5. All infrastructure gates cleared. Reddit post window is closing and still hasn't fired. No Plausible data in sight. Hintertux still not pasted despite 2 days of "SHIP" calls.**

---

## Shipped Since Last Report (v131 → v132)

| Commit | What | Right call? |
|--------|------|-------------|
| `fe98eb5` | DevOps Aug 27 — GREEN, zombie branches P2, CLAUDE.md stale count P2 | ✅ Correct. No false alarms. |
| `42b9d10` | Content Aug 27 — 96/100, 391 venues confirmed, 5 carry-over venues still unpasted | ⚠️ Correct verification. Wrong that Hintertux was authored 2 days ago and still hasn't shipped. |

**No code shipped by Jack.** Two agent reports, zero product movement. This is the pattern that kills launch momentum.

---

## Bug Triage

### Peakly Pro price discrepancy ($9/mo vs $79/yr)
CLOSED. Pro is cut. Zero references in `app.jsx`. Will not appear again.

### Sentry DSN
CLOSED. Live and wired.

### Cache buster stale
CLOSED. `20260826a` in lockstep across all 3 files.

### Geo-silent-block
CLOSED. 12s JS timeout fallback shipped in `e29b453`. Device test is Jack's gate before the post.

### Zombie branches on origin (P2 — Jack, 2 min)
15 `claude/*` branches remain on origin. None are regressions. All are obsolete against current main. One contains a scoring rewrite; another a front-page redesign. If accidentally rebased onto main, they silently stomp 4 months of work.

```bash
git push origin --delete \
  claude/add-geolocation-WJSyB \
  claude/add-new-venues-lXrXW \
  claude/analyze-test-coverage-WVIsT \
  claude/autofix-formatting-7gxlZ \
  claude/code-review-cleanup-Vdkx9 \
  claude/codebase-review-NIWTj \
  claude/fix-bugs-FMIiU \
  claude/implement-todo-item-igUtK \
  claude/implement-todo-item-Zbyjf \
  claude/improve-scoring-system-FwSGI \
  claude/redesign-front-page-EndKs \
  claude/standardize-venue-data-CufiQ \
  claude/streamline-onboarding-account-97XRR \
  fix-appjsx-final \
  restore-appjsx \
  test-small
```

Two-minute fix. Don't let this sit into week 2.

### VPS disk cache — Open #23 (P1 IF REDDIT TODAY)
Still unshipped. In-memory only. At current MAU (<10 confirmed sessions), `pm2 restart` refills the cache in minutes — acceptable. The moment a Reddit post goes live and drives 500+ concurrent users, a single VPS restart during that window causes Open-Meteo to 429 and the app shows "conditions unavailable" to every new visitor. **This becomes P0 the moment Jack drafts the Reddit post.** Fix must ship before the post. DevOps Aug 27 included the exact 30-line patch in `server/proxy.js`. Jack: SSH in and deploy it.

---

## Three Product Decisions — Aug 27

### Decision 1: SHIP Hintertux Glacier today. Deadline: before the Reddit post.

This was SHIP'd by v131 on Aug 26. Today is Aug 27. It has not been pasted. The venue object is in `reports/content-report.md` (Aug 26 batch, item 5). It's the only 365-day ski area in the Alps. In late August, it's the *only* answer to "where can I ski this weekend in Europe." That is a real user question that shows up on r/skiing every August. Not having it is a gap the post will expose.

Paste takes 5 minutes. Bump `.venue-baseline` to 392 after. Cache auto-bumps on next auto-push. **SHIP.**

### Decision 2: Reddit/HN post — fire today (Friday) or Saturday morning. No later.

Thursday evening passed (v131's recommendation). The window is still open but narrowing fast:

- **Best remaining slot:** Friday 9-11am ET on r/skiing + r/solotravel. Ski crowd browses Friday afternoon; a Friday morning post has a full cycle.
- **Acceptable fallback:** Saturday 8-10am ET on r/skiing specifically — ski crowd is actively planning the weekend. Do NOT post Saturday afternoon or Sunday.
- **Close the window:** Sunday post on r/skiing lands when people are driving home, not planning trips.

Jack's outstanding gate items before posting:
1. Device-test geo-silent-block fix with iPhone Location Services OFF. If the airport picker surfaces within 12 seconds, the gate is clear.
2. VPS disk cache (Open #23) deployed. 30-line fix. SSH + `pm2 restart`.
3. One good screenshot of a real weekend pick (hero card + score breakdown) for the post body.

Post strategy: lead with this weekend's best pick, not the app's feature list. "Best ski weekend flight right now is [VENUE] — here's why" outperforms "check out my app."

**If neither Friday nor Saturday fires, this is a product decision to post in September, not a technical problem. Name that decision explicitly.**

### Decision 3: DEFER the other 4 carry-over venues until after the Reddit data.

Praia do Camilo (FAO), Nusa Penida (DPS), Gili Trawangan (DPS), Arolla (GVA): all sourced, all Wikimedia photos, two cluster at DPS. Catalog is 57% in-season right now. More venues do not fix retention. **DEFER until Plausible shows either unfulfilled regional demand or solid engagement numbers that justify expansion velocity.**

---

## This Week's Top 3 Priorities Only

**1. Jack: Read Plausible data from Aug 22-27 (5 days of live traffic). Report the numbers.**

This is the most important task in the entire project right now. Specific asks:
- Total sessions (any humans hitting the site at all?)
- Bounce rate (are people loading and leaving?)
- Airport set rate (are users completing onboarding?)
- Any `alert_registered_server` fires (any engagement with core feature?)
- Sentry: any ErrorBoundary events in production?

If sessions = 0, the site isn't being discovered — the Reddit post is the fix. If sessions > 0 with high bounce, there's a cold-start UX problem that changes what we prioritize before scaling. Nothing else can be prioritized without this.

**2. Jack: Paste Hintertux + deploy VPS disk cache before the Reddit post.**

Hintertux object is in `reports/content-report.md` (Aug 26). VPS fix is in DevOps Aug 27. Both are <30 min combined. Both must ship before the post goes live.

**3. Jack: Fire the Reddit post (Friday morning ET) with a screenshot-first, link-second format.**

If the two items above are done by Friday 8am ET, post to r/skiing and r/solotravel staggered by 48 hours. If they're not done, pick a slot for Saturday and commit to it. No more sliding.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **Vitest test suite** (`claude/analyze-test-coverage` branch) | Single-file Babel SPA — a test suite adds build complexity the architecture explicitly forbids. CUT permanently. |
| **Front page redesign** (`claude/redesign-front-page` branch) | Never redesign a product in week 1 before reading user data. CUT until Plausible shows a specific bounce-driver. |
| **JSON-LD / static h1 SEO** | Reddit traffic doesn't route through Google. Revisit at 10K MAU. CUT. |
| **SRI on CDN scripts (Open #10)** | Zero user-facing impact. Medium implementation risk. Post-launch. |
| **Venue additions beyond Hintertux** | Catalog depth is not the retention variable. Plausible first. DEFER. |
| **iOS App Store submission** | Mac + Xcode + Jack. Post-Reddit. Not on the 1-week critical path. |
| **APNS push debugging** | Two open transport bugs. Web product has no push by design. Do not touch pre-1K MAU. |

---

## Success Criteria

**What defines 8K users (not 5K) at 90 days:**

| Driver | 5K | 8K |
|--------|----|----|
| Reddit post timing | Week 3+ | **Week 1 (this week)** |
| Day-7 retention | <15% | >20% — one return weekend use |
| Viral hook in post | Generic "check my app" | Specific weekend pick + score breakdown screenshot |
| VPS stability under spike | Cold cache = degraded first impression | Disk cache live = every visitor sees real scores |
| Alerts working for re-engagement | Web alerts untested | At least 1 confirmed alert fire by day 14 |

**90-day projection shift:** If the Reddit post fires Friday with real engagement, 8K is achievable. If it slides to week 3, the base drops to 3-5K regardless of product quality — early-mover community memory is short.

---

## One Product Risk Nobody Is Talking About

**We have zero post-launch telemetry informing any decision.**

Five days after launch, every product decision in this report — "SHIP Hintertux," "post on Friday," "defer 4 venues" — is based on seasonal logic, catalog reasoning, and launch-timing theory. None of it is based on what real users are doing.

If 12 people have hit the site in 5 days and all 12 bounced on the loading screen, the entire prioritization stack should be different: fix the first impression, not the venue catalog. If 50 users hit it and 30 completed onboarding, the geo-silent-block fix was the right call and we're healthy. We don't know which world we're in.

**Plausible is live. The data exists. The only thing missing is someone reading it.** This is not a tooling problem. Making "read Plausible" the #1 priority this report is the only structural mitigation.

If Plausible shows under 20 sessions total, the answer is not "build more features" — it's "post to Reddit today." The gap between a product nobody found and a product nobody used is everything.

---

## Blocked

| Blocker | Owner | Unblocks | Status |
|---------|-------|----------|--------|
| Plausible data read | Jack | All post-launch prioritization | Outstanding — day 5 |
| Hintertux paste | Jack (5 min) | Real answer to "ski Europe in August" | Outstanding — day 2 of SHIP call |
| VPS disk cache (Open #23) | Jack (SSH, 30 min) | Reddit spike protection | Outstanding — becomes P0 before post |
| Device test (geo fallback with GPS off) | Jack | Reddit post gate | Outstanding |
| Reddit post (Friday morning ET) | Jack | 5K-8K user trajectory | Deadline: this week |
| Zombie branch deletion | Jack (2 min) | Removes accidental-stomp risk | Outstanding |
| CLAUDE.md venue count (156 to 391) | Jack (3 min) | Stops future AI sessions from running stale audits | Outstanding — flagged 2 days running |
| LLC formation | Jack | REI / Backcountry / GetYourGuide approvals | Post-Reddit |
| Supabase delete-account SQL paste | Jack | App Store 5.1.1(v) compliance | Pre-App Store, post-Reddit |

---

*v132 — PM agent, 2026-08-27. All infrastructure is green. The only path to 8K is the Reddit post, and the only thing blocking the post is Jack. Five tasks, none over 30 minutes.*
