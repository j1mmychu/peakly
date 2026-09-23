# Peakly PM Report v159 — 2026-09-23

**Status: 🔴 RED — VPS Day 45. Oct 18 launch is 25 days away. Code freeze Day 10. `origin/master` AUDITED: old June 2026 state, safe to delete. No regressions.**

---

## Shipped Since Last Report (v158 → v159)

| Commit | What | Right call? |
|--------|------|-------------|
| `9a6e2ad` | DevOps report Sep 23 (RED) | ✅ Confirmed 100% BASE_PRICES, 18 stale branches. |
| `8263112` | Content report Sep 23 | ✅ Data health 94/100. Tag density still 225 venues at ≤2 tags. |

**Zero code commits since `96def81` (Sep 14). Ten days clean. Code freeze holds.**

---

## Bug Triage

### P0s — None (code side)

### P1 — VPS Redeploy: Day 45, 25 Days to Launch

Identical situation to yesterday. The fix exists. The code is committed. One 5-minute SSH session unblocks everything.

| Feature | User Impact |
|---------|-------------|
| Two-weekend scoring | Front page shows one weekend only |
| iOS native proxy | 403 on every native price/weather call |
| Alert deletion | Silently fails; alerts stack forever |
| Weather cache persistence | Cold start wipes cache — Open-Meteo rate limit risk |
| Rate limiter accuracy | Forgeable XFF — Open-Meteo ban risk at spike |

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && curl -s https://peakly-api.duckdns.org/health"
```

**Jack: 5 minutes. Hard deadline Oct 4 (day before content run). After that, content run holds until VPS is confirmed.**

### P1 — `origin/master` AUDITED — Safe to Delete

`origin/master` contains `app.jsx` at 8,469 lines vs main's 14,237. This is the June 2026 codebase — the same state that was on `master` before the history rewrite in May. Latest commit: `b6dc033 auto: terms.html` (early June 2026). Zero unmerged work. Zero risk.

**Decision: delete it. Two git commands. No escalation needed.**

```bash
git push origin --delete master
```

That drops the total to 17 stale branches. Bundle with the Oct 5 cleanup if preferred — it's not urgent, just noise.

### P1 — Tag Density: 225 Venues at ≤2 Tags, Day 19

Deferred to Oct 5 content run. Hold.

### P1 — Top 15 Venue Photos: Launch Screenshot Risk (Day 1 on PM radar)

346 of 404 venues still have generic stock photos. Last report raised this as "the one thing that should be added to Oct 5 scope." Repeating it because it's now 25 days to launch and Oct 5 is the last realistic window.

The target: 15 marquee venues that will appear in launch screenshots. Whistler, Chamonix, Zermatt, Bora Bora, Maldives, Santorini — venues where a wrong photo gets called out in the first Reddit comment.

**Jack has the Unsplash key. The pipeline exists (`scripts/photos-fetch.mjs`). 2 hours of work. Add this to Oct 5 scope or explicitly decide not to.**

### P2 — S-Hemisphere Ski Season Closing

`lateSeason` gate self-manages. No intervention needed. Venues will deprioritize naturally.

### P3 — dist/ Build Collision (Day 15)

CI rebuilds correctly. Non-blocking.

---

## Three Product Decisions — Sep 23

### Decision 1: `origin/master` is confirmed junk. Delete it.

Audited: 8,469-line app.jsx, latest commit June 2026, no unmerged work. This is a leftover from before the May history scrub — the `master` branch that was replaced by `main`. The deploy workflow runs on both `main` and `master` (deploy.yml line 4), which means GitHub Pages could theoretically redeploy from master if something pushes there. That's a live footgun.

**Decision: delete `origin/master` now. Don't wait for Oct 5. The deploy.yml dual-branch trigger makes this a silent regression risk, not just noise.**

### Decision 2: Top 15 venue photo audit is IN SCOPE for Oct 5. Make the call now.

The launch screenshot problem is real. The photo pipeline is built. Jack has the key. Two hours. The cost of a wrong photo on r/skiing on launch day is a dead thread and a credibility hole on day one.

**Decision: add "top 15 venue photo audit via Unsplash pipeline" to Oct 5 content run scope. Jack confirms go/no-go before Oct 5. If declined, that's fine — but the decision must be explicit, not deferred again.**

### Decision 3: Reddit r/solotravel draft exists or Oct 18 slips.

v158 decided to draft the post. v159 is asking: has the draft started? If not, it needs to exist by Sep 27 — four days. The draft forces the product pitch into one clear sentence before the content run, which shapes what the content run optimizes for. Writing it after the launch is too late to course-correct.

**Decision: Reddit post draft due Sep 27. It lives at `reports/reddit-launch-post.md`. If nothing is committed there by Sep 27, the PM agent writes a draft in the Sep 27 report. No more deferral.**

---

## This Week's Top 3

1. **VPS deploy by Oct 4** — Jack, 5 minutes. The only human-required action. Every other Oct 5 item depends on this.
2. **Delete `origin/master`** — deploy.yml runs on master. Leaving it up is a silent regression risk. One `git push --delete` command.
3. **Top 15 photo audit decision** — go or no-go, explicit, before Oct 5. Not deferring again.

---

## Features REJECTED This Week

- **Any code change before Oct 5** — code freeze, no exceptions.
- **APNS wiring** — post-launch v2. Not before Reddit launch.
- **Peakly Pro price fix ($9/mo → $79/yr)** — DEFER. Peakly Pro is removed from the UI entirely (cut 2026-04-16). The $9/mo display is dead UI nobody reaches. Not worth breaking code freeze to fix text nobody sees.
- **JSON-LD / static h1 SEO** — DEFER until post-launch. 81% SEO score is good enough for a Reddit launch; marginal SEO gains don't move the needle in week one.
- **Sentry DSN empty** — NOT A BUG. DevOps Sep 23 confirmed Sentry DSN is configured (`9416b032...`) in app.jsx and index.html. This was resolved. Stop triage-ing it.
- **New venues before Oct 5** — 17 queued. Batch discipline holds.

---

## Success Criteria

### What defines success

- **Launch day (Oct 18):** 500+ unique visitors, <30% bounce, 50+ wishlists saved.
- **Week 1:** 1,000 registered users, 200+ alerts set.
- **90-day:** 5,000–8,000 MAU.

### What gets us to 8K, not 5K

Three variables. All three trace back to one SSH session:

1. **LIVE badges on launch day.** VPS deployed → real prices → `$312 LIVE` in screenshots → people share it. `~$350` stays invisible.
2. **Tags feel curated on Explore.** Oct 5 run fixes 225 beach venues from ≤2 tags to 4+. A card that says "powder, groomed, treeline, après" feels like a recommendation. A card with "skiing" feels like a spreadsheet.
3. **Traffic spike doesn't kill it.** Weather cache persistence is the only Open-Meteo rate-limit protection. Without it, 66+ simultaneous DAU on the same venue set during a Reddit spike exceeds the free-tier ceiling and the app 429s for everyone who clicks. The launch post could generate exactly this spike in the first 20 minutes.

All three come down to one SSH session before Oct 4.

---

## One Product Risk Nobody Is Talking About

**The deploy.yml dual-branch trigger.**

`deploy.yml` runs on push to both `main` **and** `master`. With `origin/master` still live and pointing at June 2026 code (8,469-line app.jsx), a single accidental `git push origin master` from any session redeploys a 4-month-old version of the app to production — wiping 404 venues, all the scoring improvements, the two-weekend algorithm, everything shipped since June.

The auto-push hook in `scripts/auto-push.sh` pushes to `master:main` (line ~35). If the hook ever runs with a misconfigured remote or a branch checkout error, it could push to `master` directly. The history rewrite in May was supposed to retire `master` in favor of `main`, but `origin/master` was never deleted.

**This is a latent production-wipe risk, not a theoretical one.** The fix is deleting `origin/master` (one command, 2 minutes). The deploy.yml dual-branch trigger is still useful to keep — it lets `master` serve as a safety net for pushes that miss `main`. But only if `master` is kept in sync or deleted. Right now it's a 4-month-old footgun.

**Fix this before Oct 5. It's not noise. It's a production reliability risk for the content run.**

---

*Report generated 2026-09-23 by the daily PM agent. v159.*
