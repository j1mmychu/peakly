# Peakly PM Report v216 — 2026-11-19 (LAUNCH DAY +32)

**Status: 🔴 RED — App Review MISSED +6 days. Whistler opens TOMORROW (Nov 21). VPS Day 103. The ski season window that justified the App Review push is here. Reply today or it's Thanksgiving-only.**

> **Stale prompt notice — Day 44 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice stays in every report until it's fixed.

---

## Shipped Since Last Report (v215 → v216)

| Commit | What | Right call? |
|--------|------|-------------|
| `657f471` | DevOps report Nov 19 — RED, VPS Day 103, App Review MISSED +6d, Whistler in 2 days | ✅ routine |
| `c418579` | Content report Nov 19 — 93/100, photo-source correction (339 Wikipedia/84%), 5 new venue objects (Avoriaz, Courmayeur, La Plagne, Davos-Klosters, Englishman's Bay) | ✅ routine |

**Zero app code commits for 19 consecutive days.** Code freeze holds. Correct call during active App Review.

**Branch count: 19 stale** — identical to yesterday. No new branches. Code freeze holding.

---

## Overnight Activity

What changed since v215:

1. **App Review delay: +1 day** — now MISSED by 6 days. Whistler is tomorrow. The window v215 called "barely viable" is now closed for Whistler. Thanksgiving (Nov 26) is 7 days out — that is the last ski-season window where App Store approval still matters this year.
2. **VPS: Day 103** — still undeployed. Two-weekend scoring still broken.
3. **Content score: 93/100** — up from 92. Five more venue objects ready: Avoriaz, Courmayeur, La Plagne, Davos-Klosters (skiing), Englishman's Bay (beach). Photo-source audit corrected: 339 of 404 venues (84%) use Wikipedia/Wikimedia photos. This is fine — these are legitimate, correctly attributed public-domain images, not "generic stock." Content agent's framing yesterday was misleading.
4. **New claude/* branches visible in git fetch** — DevOps confirmed these are old May–June 2026 worktrees, not new work. Count stays 19. Code freeze intact.
5. **Eval counter discrepancy (378 vs 404) persists** — DevOps confirms braces balanced 5684/5684 and venue count 404 via grep. Node eval script is broken, not the catalog. Still deferred.

---

## Bug Triage

### 🚨 P0-A — App Review MISSED +6 days. Whistler opens TOMORROW.

**Submission ID:** `468d466e-ab22-4db5-bc51-d897a9bcfb8e`
**Reply:** `docs/APP_REVIEW_NOTES.md` — paste-ready.

**Window math as of today (Nov 19):**

| Reply date | Likely live | Remaining ski window | Verdict |
|-----------|-------------|---------------------|---------|
| Today (Nov 19) | Nov 20–21 | Whistler opener day | 🟡 Last shot at Whistler |
| Nov 20 | Nov 21–22 | Day after Whistler | 🔴 Thanksgiving only |
| Nov 26+ | Dec | Full season | ✅ still a full ski season, just later |

Whistler is gone if you don't reply today. Thanksgiving (Nov 26) is the new primary window. App Store live before Thanksgiving still captures the holiday ski discovery surge — that's a viable path to 8K users even if Whistler slips.

### 🚨 P0-B — VPS Redeploy: Day 103. Last deadline was Nov 20 (tomorrow).

Same 4 live breakages: two-weekend scoring OFF, iOS CORS blocked, alert deletion broken, rate limiter forgeable. If App Store approves before VPS deploys, iOS users hit a broken product day one.

```bash
# Jack — 10 minutes, SSH only:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | jq .
# verify: forecast_days:14, uptime <60s
```

**Bundle this with the App Review reply — same session, same afternoon.**

### P0-C — `fix-appjsx-final` + `restore-appjsx` rollback bombs: Day 20.

`fix-appjsx-final` is 597 commits ahead of main. This is the highest-risk branch in the repo. While at GitHub for App Review, delete both. 30 seconds.

### P2 — Cache stamp `20261031a`: 19 days stale.

DEFER. Auto-bumps on next app.jsx touch. After App Review resolves.

### P2 — Eval counter discrepancy (378 eval vs 404 baseline).

DEFER. Diagnostic tool only. Fix in same commit as first post-App Review venue additions.

---

## This Week's Top 3 Priorities

**#1 — App Review reply. OVERDUE 6 DAYS. 10 minutes. Jack only.**
Whistler is tomorrow. Thanksgiving (Nov 26) is 7 days out. Reply today, capture the holiday window. `docs/APP_REVIEW_NOTES.md` has the full paste-ready reply. This is the highest-leverage 10 minutes in the entire roadmap right now.

**#2 — VPS Redeploy. Same afternoon as the App Review reply.**
Two-weekend scoring has been broken for 103 days. iOS users will hit a broken product if the app goes live without this. The SSH session is 10 minutes. Bundle it. Don't ship to the App Store with a broken proxy.

**#3 — Delete `fix-appjsx-final`, `restore-appjsx`, and the 2 highest-risk claude/* branches while at GitHub UI.**
`fix-appjsx-final` (597 commits ahead), `restore-appjsx`, `claude/redesign-front-page-EndKs`, `claude/improve-scoring-system-XYGY6`. These are the four branches most likely to cause a future session to either accidentally merge or re-attempt a blocked feature. 2 minutes. Do it.

---

## Explicit Product Decisions

**Decision 1: Avoriaz + Courmayeur + La Plagne + Davos-Klosters + Englishman's Bay — DEFER to post-App Review.**
All 5 are quality additions. Content objects are ready in `reports/content-report.md`. Code freeze until App Review closes. These land as the FIRST commit after the review resolves — same session that bumps the cache stamp.

**Decision 2: Wikipedia/Wikimedia photos (84% of catalog) — ACCEPT as-is, no action needed.**
Yesterday's content report framed this as a problem. It's not. These are legitimate public-domain images, properly attributed, correctly depicting the venues. The photo "gap" is actually a photo "win" — real venue imagery beats licensed stock. No action until Unsplash pipeline is ready with actual venue-specific photos.

**Decision 3: Thin-tag enrichment (223 venues at 2 tags, Day 19 unchanged) — DEFER to post-Reddit launch.**
Content score is 93/100 without it. Tags affect search/filter quality but zero core user flows. This is 10+ hours of work. Post-launch queue, revisit at 1K users.

---

## Features REJECTED This Week

- **Scoring improvements** (`claude/improve-scoring-system-XYGY6`) — REJECTED. Scoring freeze documented. No algorithm changes without an audit. App Review is not the time.
- **Loading screen enhancements** (`claude/enhance-loading-screen-rZ1dc`) — REJECTED. Code freeze. Cosmetic polish waits.
- **Onboarding streamlining** (`claude/streamline-onboarding-account-97XRR`) — REJECTED. Onboarding rebuilt 2026-08-11. Working. Don't touch during App Review.
- **UI redesigns** (`claude/redesign-front-page-EndKs`, `claude/improve-peakly-ui-UHCHG`) — REJECTED. Active App Review. Frontend rewrites during review risk a rejection loop.
- **Alert page changes** (`claude/condense-alert-page-jzdLo`, `claude/simplify-alerts-page-2ejGB`) — REJECTED. Alerts tab is off iOS until APNS is live. Zero iOS users benefit. Deferred to post-launch.
- **Test coverage analysis** (`claude/analyze-test-coverage-WVIsT`) — REJECTED. Single-file SPA with no test suite. Test infrastructure is not a pre-launch priority at this stage.

---

## Success Criteria

**What defines success at 90 days (Feb 2027):**
- App Store live before Thanksgiving: captures holiday ski discovery
- VPS deployed: two-weekend scoring works as designed
- Reddit launch timed to a major opener: first organic spike
- 5K–8K DAU target: 8K requires all three; 5K requires just App Store + Reddit

**What gets us to 8K, not 5K:**

| Lever | Impact | Status |
|-------|--------|--------|
| App Store live before Thanksgiving (Nov 26) | +1,500 holiday iOS installs | ❌ REPLY TODAY |
| VPS deployed → two-weekend scoring live | Core moat working | ❌ Day 103 |
| Whistler opener organic discovery | First ski-season spike | ❌ Tomorrow — last chance |
| Reddit launch with working product | First impression = core promise met | ❌ blocked on both P0s |
| Val d'Isère + Avoriaz + 8 other ski venues | Flagship resorts, high-search terms | ⏸️ DEFERRED to post-App Review |

**Current trajectory:** Still on the 5K path, with an 8K shot IF App Review reply goes out today and VPS deploys this week. Whistler is gone as a launch signal; Thanksgiving is the new primary target. That window is viable.

---

## One Product Risk Nobody Is Talking About

**The App Review delay is compounding into a credibility problem for the product's core promise.**

Peakly's tagline is "where to go this weekend." The app has been in App Review since October 13 — six weeks. The irony is that the product exists to help people make spontaneous decisions about *this weekend*, and the product itself has been unable to ship for 6 consecutive weekends.

This isn't a launch risk (the web app is live). It's a team morale / momentum risk. Every week without App Store creates drift — agents propose rewrites, branches accumulate, the CLAUDE.md prompt goes stale. The 19 `claude/*` branches are the symptom. The cause is a launch that keeps slipping its own deadline.

The fix is simple: reply to the App Review today. VPS deploy tomorrow. Reddit post the week of Thanksgiving. Ship the thing. The momentum problem resolves itself the moment the app is live and users are using it.

---

*Report v216 — 2026-11-19 | Catalog: 404 venues | VPS: Day 103 | App Review: MISSED +6d | Whistler: TOMORROW*
