# Peakly PM Report v214 — 2026-11-17 (LAUNCH DAY +30)

**Status: 🔴 RED — App Review MISSED +4 days (Whistler opens in 4 days Nov 21). VPS Day 101. 30 days no code commits. This is the last viable window for Thanksgiving + Whistler opener.**

> **Stale prompt notice — Day 42 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice stays in every report until it's fixed.

---

## Shipped Since Last Report (v213 → v214)

| Commit | What | Right call? |
|--------|------|-------------|
| `5bc2b55` | Content report Nov 17 — 89/100, 2 more venues enriched (223→221 thin-tag), catalog clean 404 venues, Whistler in 5d | ✅ routine |
| `a48755b` | DevOps report Nov 17 — RED, VPS Day 101, App Review MISSED +3d, cache 17d stale, 20 stale branches (+1 new), drift false alarm cleared | ✅ routine |

**Zero app code commits for 30 consecutive days (since Oct 31).** Still the right call — no code churn during active App Review.

**Branch count hit 20 stale non-main branches.** One new `claude/*` branch appeared overnight. Per PM v213 risk flag: branch freeze recommended until App Review resolves.

---

## Overnight Activity

Three things changed, one got worse:

1. **App Review delay: +1 day** — now MISSED by 4 days. Apple has not auto-rejected yet. Window still open but closing.
2. **VPS: Day 101** — unchanged. Same proxy.js sitting undeployed for 101 days.
3. **Content: minor positive** — 2 more venues got a 3rd tag (223 → 221 thin-tag). Routine improvement, deferred track.

No regressions. No new code bugs. Product is stable.

---

## Bug Triage

### 🚨 P0-A — App Review MISSED +4 days. Whistler opens in 4 days (Nov 21).

**Submission ID:** `468d466e-ab22-4db5-bc51-d897a9bcfb8e`
**Reply:** `docs/APP_REVIEW_NOTES.md` — paste-ready, sitting there for weeks.

**Window math as of today (Nov 17):**

| Reply date | Likely live | Days before Whistler (Nov 21) | Verdict |
|-----------|-------------|-------------------------------|---------|
| Today (Nov 17) | Nov 18–20 | 1–3 days | 🟡 Slim but viable |
| Nov 18 | Nov 19–21 | 0–2 days | 🔴 Thanksgiving only |
| Nov 19+ | Nov 20–22 | 0–1 days | ❌ Whistler lost, Thanksgiving barely |

Thanksgiving (Nov 26) is 9 days out. That's the fallback if Whistler slips. But Thanksgiving without an App Review reply sent TODAY means the app still isn't in the App Store by then. These aren't separate events — both gates require the same 10-minute action from Jack.

### 🚨 P0-B — VPS Redeploy: Day 101. Hard deadline Nov 20.

Same 4 live breakages documented in v213. Whistler opening weekend traffic hits a broken scoring engine without this. 10-minute SSH, Jack only.

```bash
ssh root@198.199.80.21
curl -sSL https://raw.githubusercontent.com/j1mmychu/peakly/main/server/proxy.js -o /opt/peakly-proxy/proxy.js
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Verify `forecast_days:14` in the response.

### P0-C — `fix-appjsx-final` + `restore-appjsx` rollback bombs: Day 18.

Delete in GitHub UI → Branches. Two clicks each. 18 days on the board.

### P2 — Cache stamp `20261031a`: Day 17 stale.

DEFER. Auto-bumps on next app.jsx commit (VPS redeploy won't do it — that's server-side only). After App Review resolves, any cosmetic app.jsx change will clear this.

### P2 — 20 stale non-main/master branches.

DEFER to post-Reddit except P0-C rollback bombs above.

---

## This Week's Top 3 Priorities

**#1 — App Review reply. OVERDUE 4 DAYS. 10 minutes. Jack only.**
Every hour of further delay closes the Whistler and Thanksgiving windows simultaneously. `docs/APP_REVIEW_NOTES.md` has the reply. This is not a product decision — it's execution.

**#2 — VPS Redeploy. Due: Nov 20 (3 days, hard).**
Two-weekend scoring is the product's core differentiator. It has been broken in production for 101 days. Whistler opens Nov 21. The two actions (App Review + VPS) need to happen within 24 hours of each other to have any chance at a coherent product for Thanksgiving.

**#3 — Delete rollback bomb branches (P0-C).**
`fix-appjsx-final` and `restore-appjsx` have been on the board for 18 days. With 20+ AI-driven branches active, the chance of an accidental merge that overwrites app.jsx is nonzero and rising. Two clicks. Do it in the same session as the VPS redeploy SSH.

---

## Explicit Product Decisions

**Decision 1: App Review reply — SHIP NOW. No further deferral.**
This isn't a prioritization question anymore. The Thanksgiving and Whistler launch windows are both contingent on a 10-minute action that has been deferred for 4 days. If this misses Thanksgiving (Nov 26), the next comparable organic discovery event is Christmas (Dec 25). That's 5+ more weeks of zero App Store installs.

**Decision 2: VPS redeploy — SHIP before Nov 20 (non-negotiable, deadline unchanged).**
Two-weekend scoring is the core moat. Without it, any Whistler user who discovers the app sees broken scoring. That's the product's main differentiator failing on its highest-intent weekend of the year.

**Decision 3: Branch freeze — HOLD until App Review resolves.**
20 stale branches with names like `redesign-front-page`, `streamline-onboarding`, `improve-scoring-system`. Zero of them have been merged to main. Each new session that creates a branch without merging adds rollback risk during App Review. The freeze is 4–7 days. No new features. No experiments. Wait for Apple.

---

## Success Criteria

**90-day projection: 5K–8K users. What gets us to 8K, not 5K:**

| Lever | Impact | Status |
|-------|--------|--------|
| App Store live by Thanksgiving (Nov 26) | +1,500 potential installs from holiday discovery | ❌ blocked — reply TODAY |
| VPS deployed → two-weekend scoring live | Differentiating feature working as designed | ❌ Day 101 |
| Whistler opener organic discovery | First ski-season traffic spike, iOS capture | ❌ window closing fast |
| Reddit launch with working product | First impression = core promise met | ❌ blocked on both P0s |

**The 8K scenario:** App Store live by Nov 20 + VPS deployed + Reddit post timed to Whistler opener (Nov 21). That's still achievable if both P0s resolve in the next 72 hours.

**The 5K scenario:** App Store live by Thanksgiving, VPS deployed before Christmas. Users find the app via web only through ski season. No iOS organic discovery during the highest-traffic weeks.

**The floor scenario:** App Review auto-rejects before Thanksgiving. Full re-submission. iOS misses all of ski season 2026–27. That's not 5K — that's restart from web only.

---

## Features REJECTED This Week

- **Venue deep links** — DEFER post-Reddit. Building during App Review is scope creep and App Review risk (changing functionality mid-review).
- **JSON-LD structured data** — DEFER. SEO gap, yes, but won't move the needle in the 4-day window that matters.
- **Static h1 fallback** — DEFER. Same reasoning.
- **225 thin-tag venue enrichment** — DEFER post-Reddit. 2 venues enriched overnight is routine; don't turn it into a sprint.
- **Any new venues** — FROZEN per PM v193+ directive. Queue exists; fill post-Reddit.
- **Cache stamp manual bump** — DEFER. Auto-bumps on next legit app.jsx commit. No standalone commit for a stamp.

---

## One Product Risk Nobody Is Talking About

**The 30-day code freeze is both right and risky.**

Holding app.jsx steady during App Review is correct — it removes the "we submitted X but are shipping Y" Guideline 2.3.1 risk. But 30 days of zero code commits means 30 days of accumulated context rot. The 20 open branches represent hypotheses that felt urgent enough to start and never got merged. When App Review resolves, there will be pressure to merge everything at once — "we've been waiting a month!" That's how you get a catastrophic regression during the first week of Whistler traffic.

**Recommendation:** When App Review clears, do a one-at-a-time branch review. Each branch gets merged, closed, or permanently deleted — not "we'll review it later." No batch merges. The month of patience gets wasted if the week after App Review turns into a code sprint with no QA.

---

## Stale Prompt Fix (Day 42)

The stored cron prompt still says: "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." All four are wrong. Fix: Claude.ai → Scheduled Tasks → Peakly Product Manager Agent → edit prompt. Update venue count to 404, categories to 2 (skiing + beach), remove Pro reference, remove Sentry DSN note. This notice has appeared in every report for 42 days.

---

*Report generated: 2026-11-17 16:15 UTC by peakly-product-manager routine.*
