# Peakly PM Report v199 — 2026-11-02 (LAUNCH DAY +15)

**Status: 🟡 YELLOW — Reports-only day. Zero app code changes. VPS Day 86, 5 days to Nov 7 deadline. App Review Guideline 2.1 reply still pending Jack. 20 unmerged branches unchanged. Clock is running.**

> **Stale prompt notice — Day 27 (unchanged):** Stored cron prompt still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface.

---

## Shipped Since Last Report (v198 → v199)

| Commit | What | Right call? |
|--------|------|-------------|
| `91a9b85` | Content report Nov 2 — 88/100, data CLEAN, 225 thin-tag venues flagged | ✅ routine reporting |
| `f57ee30` | DevOps report Nov 2 — RED, VPS Day 85, cache stamp flagged (correctly explained as non-issue) | ✅ routine reporting |

**Zero app code commits for the third consecutive day. Correct — there's nothing to ship until the two human gates (VPS + App Review reply) clear.**

---

## Overnight Activity: What Matters

### Nothing changed. That's the whole story.

Content and DevOps ran, filed reports, found no regressions. The code is in exactly the state PR #20 left it. Every item that was blocked yesterday is blocked today for the same reason: Jack hasn't done the two 30-minute manual tasks. No amount of agent activity changes that.

### Venue count discrepancy — DevOps says 406, Content says 404. Resolved.

DevOps's bracket-walker methodology returned 406. Content's bracket-walk + explicit count returned 404 (134 skiing + 270 beach). `.venue-baseline` says 404. Content is authoritative — the eval method is more reliable than bracket-walking for mixed-format JSON. This is a DevOps tooling bug, not a real drift. **Current authoritative count: 404.**

### Cache stamp "2d stale" is not a bug.

`20261031a` correctly reflects the Oct 31 PR #20 deploy. No app code shipped since. Users are not seeing stale JS. The auto-push hook will bump it automatically on the next app.jsx commit. Stop treating this as a finding.

---

## Bug Triage

### P0-A — VPS Redeploy: Day 86. Nov 7 = **5 days.** Whistler opens Nov 21 = **19 days.** 🚨

Nothing new to investigate. The runbook exists. The code is committed. This is purely a Jack execution gap.

**If this misses Nov 7: two-weekend scoring is broken for all users when Whistler opens. That's the ski flagship venue on the ski app, during peak pre-season, right before any Reddit push. The product story falls apart.**

Exact 3-step fix:
```bash
# From Jack's local machine:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health  # expect apns:configured, forecast_days:14
```

### P0-B — App Review Guideline 2.1 reply. Still pending. 30 minutes, Jack.

`docs/APP_REVIEW_NOTES.md` has the exact paste-ready reply text and a recording shot list. Build 3 (PR #20) is ready. Nothing is blocking this except time.

**Every day this waits is a day the App Store slot stays dark and organic discovery stays zero.**

### P1 — `fix-appjsx-final` branch — still open, still a footgun.

597 commits ahead of a May 13 base. An accidental merge wipes 5 months of work. This costs Jack 2 clicks to close. Still not closed. Elevating to P1.

### P2 — 20 unmerged origin branches (unchanged from v197, v198)

No urgency individually. Collectively noisy and slow to navigate. Recommend closing all `claude/*` branches with no commit in 30 days in a single GitHub UI sweep (~15 minutes).

---

## This Week's Top 3 Priorities Only

**1. Jack: VPS redeploy before Nov 7. (10 min, P0-A)**
5 days left. Whistler opens in 19. The scp + pm2 restart is the whole task. Verify with the health check.

**2. Jack: App Review Guideline 2.1 reply. (30 min, P0-B)**
`docs/APP_REVIEW_NOTES.md` has everything. Paste, attach recording, submit. The build is already staged and approved.

**3. Jack: Close `fix-appjsx-final`. (2 min, GitHub UI)**
Delete the branch on GitHub. It cannot be merged safely and it's a rollback risk sitting on origin.

Everything else is deferred until these three are done. No new features, no venue adds, no branch work.

---

## Explicit Product Decisions This Run

**DECISION 1: Venue queue stays FROZEN. DEFER.**
404 venues is sufficient for launch. The marginal value of venue 405 is near zero compared to VPS uptime and App Store availability. Whistler opening Nov 21 is the only content event worth tracking, and it requires no code change.

**DECISION 2: Tag enrichment (225 thin-tag venues) — DEFER post-Reddit.**
Content has correctly flagged this consistently. It's real. It's not urgent. Search and filter work without it. Post-Reddit, when there's actual user data on which filters get used, targeted enrichment will be 10x more valuable than a blind sweep today.

**DECISION 3: DevOps venue counting methodology — NOTE, no action.**
Three consecutive runs with wrong counts. The fix is one line in `tasks/agents/devops.md`: tell the agent to use the Content agent's eval method, not a bracket-walker. Worth noting but zero user impact and zero launch impact. Jack: update the prompt when you're in the codebase anyway.

---

## Success Criteria Check

**90-day projection: 5K–8K users. What does 8K require (not 5K)?**

The delta between 5K and 8K is:
1. **App Store distribution** — organic search and App Store SEO drives 30-40% of installs for discovery apps in this category. Every day the App Store slot is dark = lost compounding installs. App Review clear → App Store live → this unlocks.
2. **VPS stability through peak season** — a pm2 crash during a Reddit spike with broken weather proxy is a P0 bounce event. One bad weekend in December could kneecap the user base before it compounds.
3. **Reddit timing** — the post goes out right as ski season opens and weather data becomes compelling. That window is November. A November post with the App Store live and the VPS stable = 8K trajectory. A December post after Thanksgiving = 5K.

**The only thing separating 8K from 5K is two 30-minute tasks Jack hasn't done yet.**

---

## One Product Risk Nobody Is Talking About

**Open-Meteo rate ceiling during the Reddit spike — and there's no disk cache on the VPS.**

Open #23 (disk cache for `_wxCache`) has been in the open items for 85 days. The weather cache is in-memory only. A `pm2 restart` — which the VPS redeploy requires — wipes it cold. If 200 users hit the app within 10 minutes of each other after the Reddit post (a realistic scenario for a r/skiing or r/surftrip post), all 200 go direct to Open-Meteo simultaneously. Open-Meteo's free tier is ~50 req/min sustained. The app will show "conditions unavailable" for every user at the exact moment they need to be converted.

The fix is ~30 lines in `server/proxy.js`. It was scoped in August. It's still not shipped. It bundles naturally with the VPS redeploy (#19). The VPS SSH session is already being asked for — adding disk cache to that session costs 20 minutes.

**If the Reddit spike happens before disk cache ships, we're handing out broken first impressions to the exact users we need to convert.**

---

*Next report: PM v200 — 2026-11-03*
