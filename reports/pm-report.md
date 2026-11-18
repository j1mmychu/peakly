# Peakly PM Report v215 — 2026-11-18 (LAUNCH DAY +31)

**Status: 🔴 RED — App Review MISSED +5 days. Whistler opens in 3 days (Nov 21). VPS Day 102. 3 days left to matter this ski season.**

> **Stale prompt notice — Day 43 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice stays in every report until it's fixed.

---

## Shipped Since Last Report (v214 → v215)

| Commit | What | Right call? |
|--------|------|-------------|
| `e9e4022` | DevOps report Nov 18 — RED, VPS Day 102, eval counter discrepancy flagged, 19 stale branches | ✅ routine |
| `4fffda3` | Content report Nov 18 — 92/100 (+3 from 89), 5 new venue objects proposed (Val d'Isère, Alpe d'Huez, Navagio, Anse Source d'Argent, Grande Anse Deshaies) | ✅ routine |

**Zero app code commits for 18 consecutive days.** Code freeze holds. Correct call during active App Review.

**Branch count: 19 stale** (−1 from yesterday's 20). Still 15 `claude/*` branches + `cursor/*` + `fix-appjsx-final` + `restore-appjsx` + `test-small`. Branch freeze remains in effect.

---

## Overnight Activity

What changed since v214:

1. **App Review delay: +1 day** — now MISSED by 5 days. No auto-rejection yet. Window still open.
2. **VPS: Day 102** — unchanged. Same proxy.js inert.
3. **Content score: 92/100** — up from 89. Five new venue objects ready for hand-paste: Val d'Isère, Alpe d'Huez (skiing), Navagio Beach, Anse Source d'Argent, Grande Anse Deshaies (beach). These are genuinely good additions — iconic venues that belong in the catalog.
4. **Eval counter discrepancy flagged:** DevOps sees 378 (eval script) vs 404 (.venue-baseline). DevOps suspects a node eval script bug, not actual missing venues. CLAUDE.md confirms 404 is authoritative. No action until VPS/App Review resolves.
5. **Branch count down 1** (20→19). No new branches created overnight. Code freeze holding.

---

## Bug Triage

### 🚨 P0-A — App Review MISSED +5 days. Whistler opens Nov 21 (3 days).

**Submission ID:** `468d466e-ab22-4db5-bc51-d897a9bcfb8e`
**Reply:** `docs/APP_REVIEW_NOTES.md` — paste-ready, sitting there for 5 weeks.

**Window math as of today (Nov 18):**

| Reply date | Likely live | Days before Whistler (Nov 21) | Verdict |
|-----------|-------------|-------------------------------|---------|
| Today (Nov 18) | Nov 19–21 | 0–2 days | 🟡 Barely viable |
| Nov 19 | Nov 20–22 | -1–1 days | 🔴 Thanksgiving only |
| Nov 20+ | Nov 21–23 | Missed Whistler | ❌ All ski openers missed |

Thanksgiving (Nov 26) is 8 days out. That's the fallback window if Whistler slips. Reply TODAY or Whistler is gone.

### 🚨 P0-B — VPS Redeploy: Day 102. Hard deadline Nov 20 (2 days).

Same 4 live breakages: two-weekend scoring OFF, iOS CORS blocked, alert deletion broken, rate limiter forgeable. Whistler opening weekend users hit a broken product without this.

```bash
# Jack — 10 minutes, SSH only:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | jq .
# verify: forecast_days:14, uptime <60s
```

### P0-C — `fix-appjsx-final` + `restore-appjsx` rollback bombs: Day 19.

19 days. Each day this sits, a future session can accidentally merge it. Still two clicks in GitHub UI. Bundle with the VPS SSH session — open GitHub on the same afternoon.

### P2 — Cache stamp `20261031a`: 18 days stale.

DEFER. Auto-bumps on next app.jsx touch. After App Review resolves, the first cosmetic change handles it.

### P2 — Eval counter discrepancy (378 eval vs 404 baseline).

DEFER investigation. DevOps flagged a suspected node eval script bug, not an actual venue count issue. Braces are balanced (5684/5684), `.venue-baseline` reads 404, catalog passes all integrity checks. If the counter is broken, fix it after App Review — it's a diagnostic tool, not a launch gate.

---

## This Week's Top 3 Priorities

**#1 — App Review reply. OVERDUE 5 DAYS. 10 minutes. Jack only.**
Whistler is 3 days out. This is the last viable moment. `docs/APP_REVIEW_NOTES.md` has the reply — paste it, hit send. Everything else is blocked on this.

**#2 — VPS Redeploy. Due Nov 20 (2 days, non-negotiable).**
Two-weekend scoring is the product's core differentiator. It has been broken for 102 days. The Whistler opener is the highest-intent ski weekend of the year. These two Jack-only actions (App Review reply + VPS SSH) should happen in the same sitting.

**#3 — Delete rollback bomb branches (P0-C) and 2 worst `claude/*` branches.**
`fix-appjsx-final` and `restore-appjsx` are 19 days on the board. While at the GitHub UI for App Review work, delete these plus the most aggressive branches: `claude/redesign-front-page-EndKs` and `claude/improve-scoring-system-XYGY6` are the highest risk (scope matches core product areas). Don't attempt a merge — just delete.

---

## Explicit Product Decisions

**Decision 1: Val d'Isère + Alpe d'Huez venue additions — DEFER to after App Review resolves.**
Both are genuinely good additions. Val d'Isère is Espace Killy; Alpe d'Huez is 220km pistes. The content objects are ready in the content report. But adding venues is a code commit, which breaks the code freeze during active App Review. These 5 venue additions land as the FIRST thing after App Review closes — before any other feature work.

**Decision 2: Thin-tag enrichment (225 venues at 2 tags) — DEFER to post-launch.**
Content score is 92/100 without fixing this. The tags affect search/filter quality but do not block the core product. This is 10+ hours of work. It goes in the post-launch queue after Reddit launch, not before. Flag to revisit at 1K users.

**Decision 3: Eval counter fix — DEFER to post-App Review, bundle with venue additions.**
If the eval script counts 378 when CLAUDE.md says 404, the script is broken. But the script is diagnostic — it doesn't gate any user-facing behavior. Fix it in the same commit as the venue additions so both changes land together cleanly.

---

## Features REJECTED This Week

- **Scoring improvements** (`claude/improve-scoring-system-XYGY6`) — REJECTED. Scoring freeze is documented. No algorithm changes without an audit. App Review is not the time.
- **Loading screen enhancements** (`claude/enhance-loading-screen-rZ1dc`) — REJECTED. Code freeze. This is cosmetic polish that can wait.
- **Onboarding streamlining** (`claude/streamline-onboarding-account-97XRR`) — REJECTED. Onboarding was rebuilt 2026-08-11 (2→1 real slides, geolocation on mount, 10s timeout). Don't touch during App Review.
- **UI redesign** (`claude/redesign-front-page-EndKs`, `claude/improve-peakly-ui-UHCHG`) — REJECTED. The product is in Apple App Review. Frontend rewrites during review risk a rejection loop. Post-launch only.
- **Alert page condensing** (`claude/condense-alert-page-jzdLo`, `claude/simplify-alerts-page-2ejGB`) — REJECTED. Alerts tab is off iOS (`Capacitor.isNativePlatform()` gate). Rework serves zero iOS users until APNS is live. Deferred to post-launch.

---

## Success Criteria

**What defines success at 90 days (Feb 2027):**
- App Store live before Thanksgiving: captures holiday ski discovery
- VPS deployed: two-weekend scoring works as designed
- Reddit launch timed to Whistler opener: first organic spike
- 5K–8K DAU target: 8K requires all three; 5K requires just App Store + Reddit

**What gets us to 8K, not 5K:**

| Lever | Impact | Status |
|-------|--------|--------|
| App Store live by Thanksgiving | +1,500 holiday iOS installs | ❌ blocked — TODAY |
| VPS deployed → two-weekend scoring live | Core moat working | ❌ Day 102 |
| Whistler opener organic discovery | First ski-season spike, iOS capture | ❌ 3 days out |
| Reddit launch with working product | First impression = core promise met | ❌ blocked on both P0s |
| Val d'Isère + Alpe d'Huez in catalog | Two flagship Ikon resorts, high-search terms | ⏸️ DEFERRED to post-App Review |

**Current trajectory:** Still on the 5K path, trending toward 8K IF App Review closes this week. The 8K scenario requires both P0s resolved before Nov 21.

---

## One Product Risk Nobody Is Talking About

**The 19 `claude/*` branches are not just rollback risk — they're a drift signal.**

Each of those branches represents a session that opened the repo, identified a "problem," built a "fix," and pushed it to a branch — without any of it landing on main. That's 15+ AI sessions that disagreed with the current implementation enough to propose rewrites, but not enough to have Jack's buy-in.

The risk isn't just accidental merge. It's that future sessions — including this one — will read those branches as "open work" and re-attempt the same changes. The branch names are persuasive: "redesign front page," "streamline onboarding," "improve scoring system." Each one is a standing invitation to revisit a decision that was already made.

The fix isn't just deleting them. It's updating CLAUDE.md to explicitly say: **all `claude/*` branches older than 7 days without a merged PR are abandoned work. Do not re-attempt them. Delete on sight.**

---

*Report v215 — 2026-11-18 | Catalog: 404 venues | VPS: Day 102 | App Review: MISSED +5d | Whistler: 3 days*
