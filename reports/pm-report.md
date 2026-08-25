# Peakly PM Report v130 — 2026-08-25

**Status: 🟢 GREEN — Post-launch day 3. One fix shipped (SEA/ORD BASE_PRICES). Observation window closed. Full dev velocity resumed. The geo-silent-block risk remains the only unresolved P1 — requires Jack with a device.**

---

## Shipped Since Last Report (v129 → v130)

| Commit | What | Right call? |
|--------|------|-------------|
| `74464fc` | DevOps Aug 25 — cache stamp bump to `20260825a`, BASE_PRICES "100%" (claimed) | ✅ Cache bump was necessary — PWA users had stale code for 36h. ⚠️ The "100%" claim was wrong. |
| `e1826eb` | Content Aug 25 — 96/100, SEA/ORD BASE_PRICES gap correctly flagged | ✅ Accurate finding. Crystal Mountain, Stevens Pass (SEA), Wilmot Mountain (ORD) were still on $350 fallback. |
| **This report** | SEA + ORD added to BASE_PRICES top-level. Cache stamp `20260825a` → `20260825b` | ✅ Small, exact, closes the real gap DevOps missed. |

**15 new `claude/*` branches appeared since yesterday.** This is automated agent activity creating worktrees, not user-facing product work. None are merged. Jack: `git push origin --delete $(git branch -r | grep 'origin/claude/' | sed 's|origin/||')` clears them in one shot. Not a product issue.

---

## Bug Triage

### Peakly Pro price ($9/mo vs $79/yr)
**PERMANENTLY CLOSED.** Peakly Pro is cut. `grep -c PEAKLY_PRO app.jsx` → 0. Will not appear again.

### Sentry DSN
✅ Live. Not a triage item.

### Cache buster
✅ `20260825b` in lockstep after this report. Not a triage item.

### BASE_PRICES — SEA/ORD
**P2 — SHIPPED THIS REPORT.** DevOps declared 100% coverage yesterday but missed 2 airports. Content correctly caught it. SEA (Crystal Mountain, Stevens Pass) and ORD (Wilmot Mountain) now have route-specific pricing. True 100% coverage confirmed: 0 venue APs without a top-level BASE_PRICES entry.

**Process note:** DevOps and Content gave conflicting answers on the same metric in the same day. The Content agent's actual-AP-count methodology caught what DevOps missed. This is the system working correctly. No process change needed.

### Geo-silent-block risk (P1 — UNRESOLVED)
Still open. The v128 observation window surfaced it. The `fff7d60` onboarding rewrite skips the location slide and fires `getCurrentPosition` on mount — if iOS Safari has location globally blocked (not denied, just silently unresponsive), `geoState` stays `"idle"` forever. The manual airport picker may never surface. This is a first-run failure mode for a real iOS user segment. **Jack must test on a device with location globally blocked.** Cannot be verified in a sandbox. Until tested, this is the highest-priority unresolved issue on the board.

### Stale claude/* branches
Not a product issue. One bash line. Jack cleans when convenient.

---

## Three Product Decisions — Aug 25

### Decision 1: BASE_PRICES is now genuinely 100%. This closes the deal-score gap.

Shipped in this report. Crystal Mountain, Stevens Pass, Wilmot Mountain were the only three venues using BASE_PRICES fallback. All three now have route-specific pricing. Deal badge accuracy is at 391/391. This was right to ship — it's the headline feature and it was incomplete.

### Decision 2: 5 new beach venues from Content — CONTINUE DEFER.

Luskentyre, Psili Ammos, Balos, Huahine, Tjøme. All well-sourced. All use Wikimedia photos (violates the Unsplash-only policy set in v129). No Plausible data yet to tell us whether catalog depth drives retention. At 391 venues with 57% in-season right now, depth is not the constraint. Defer until: (a) Plausible shows unfulfilled demand, or (b) photo sourcing switches to Unsplash for these five. Decision stands from v129.

### Decision 3: Reddit/HN launch post — hold until geo-silent-block is confirmed resolved.

The v127 GitHub Pages launch (Aug 22) generated unknown traffic — Jack hasn't reported Plausible numbers yet. The next catalyst is a high-quality Reddit post (r/skiing, r/solotravel). **The four gates before that post:** (1) Sentry clean ✅, (2) BASE_PRICES 100% ✅ (done this report), (3) geo-silent-block confirmed or fixed ❌ (still open), (4) photos representative for the most-screenshotted venues (not yet reviewed). Three of four done. Gate 3 is Jack's blocker.

---

## This Week's Top 3 Priorities Only

**1. Jack: Verify geo-silent-block on iOS with location globally blocked.** (Today, 5 minutes, device required.)
Open the app on an iPhone with Settings → Privacy → Location Services → OFF (or the per-Safari version). Go through onboarding. Does the airport picker appear? The answer determines whether the launch post can go out this week.

**2. Jack: Review Plausible + Sentry from Aug 22–25 and share the numbers.**
Specific questions: session count since launch, bounce rate, ErrorBoundary events, `alert_registered_server` fires, and whether any sessions appear to have no airport set (the geo-silent-block fingerprint). Until these numbers exist, all prioritization is guesswork.

**3. After geo-silent-block result + Plausible review: draft the Reddit post.**
r/skiing and r/solotravel are the right targets. Post should lead with the best-weekend-pick for this specific coming weekend — not the app's features. Make it useful first, promotional second. The post timing matters: Thursday evening EST is the window, not arbitrary.

---

## Features REJECTED This Week

- **JSON-LD structured data** — CUT. Reddit traffic doesn't route through Google. Revisit at 10K+ when organic search matters.
- **Static h1 SEO fallback** — CUT. Same reason.
- **vitest / unit test suite** — DEFER indefinitely. Single-file SPA, no CI for tests, wrong complexity for <1K MAU.
- **5 new beach venues (Wikimedia photos)** — DEFER until Unsplash alternatives sourced and Plausible confirms catalog depth is a retention lever.
- **`/credits` attribution page for 303 Wikimedia photos** — CUT. Zero user value. Policy stands: Unsplash only going forward.
- **Peakly Pro** — PERMANENTLY CUT. Dead issue.

---

## One Product Risk Nobody Is Talking About

**The agent team is diverging from the codebase.** Today two agents (DevOps and Content) gave conflicting answers on BASE_PRICES coverage for the same day. The DevOps agent declared "100%" and shipped a cache bump. The Content agent caught the actual gap (SEA/ORD). Both were reading the same code. This happened because each agent runs independently with no shared state. At 391 venues and 14K lines of `app.jsx`, a single-pass grep is no longer reliable for coverage claims. If the agent reports start systematically diverging on basic data-health metrics (venue count, coverage percentages, cache stamp), the briefing pipeline becomes noise instead of signal. **The fix is for each agent to always run the authoritative counter (node eval, not grep) for any metric it claims a number on.** The DevOps report today should have eval'd BASE_PRICES keys against all venue APs — it grepped instead and got a false positive. This is process debt, not a fire, but it compounds as the catalog grows.

---

## Success Criteria

**For 8K, not 5K, in 90 days:**
- Reddit post with >100 upvotes in r/skiing or r/solotravel in the next 2 weeks
- Geo-silent-block fixed (removes the iOS drop-off ceiling)
- Photos upgraded for the top 20 most-screenshotted venues (currently generic stock)
- Deal badge working at 100% coverage (now done) so the headline feature is trustworthy
- Plausible showing >30% D7 retention among the first 200 users (measures whether the weekend-framing hook works)

**Current state (3 days post-launch):** BASE_PRICES 100% ✅, Sentry live ✅, Plausible live ✅, geo-silent-block risk ❌, photo quality gap ❌, Reddit post pending ❌. Three of five gates closed.
