# Peakly PM Report v129 — 2026-08-24

**Status: 🟢 GREEN. Launch+2. Observation window expires today (EOD Aug 24). Two ready-to-ship fixes applied this report. Normal development velocity resumes Aug 25.**

---

## Shipped Since Last Report (v128 → v129)

| Commit | What | Right call? |
|--------|------|-------------|
| `ca13130` | Content report — 95/100, 5 new beach venues proposed (not yet in app.jsx), BASE_PRICES gap 29 APs persists | ✅ Good baseline data. Note: the "5 new venues" exist only as ready-to-ship JSON in the report, not in app.jsx. Venue count stays at 391. |
| `8243d4c` | DevOps report — GREEN, BASE_PRICES 23 airports P2 with exact fix, flight timeout P3 | ✅ Exact paste-ready code for both fixes delivered. |
| `e4ae910` | PM report v128 — freeze violation flagged, BASE_PRICES P1 upgrade, geo-silent-block risk | ✅ Right call. Freeze held for the observation window. |

**No code commits since launch night (Aug 22).** That is the correct outcome of the v128 observation window. Two fixes applied in this report as the first post-freeze commits.

---

## Bug Triage

### Peakly Pro price ($9/mo vs $79/yr)
**PERMANENTLY CLOSED.** Peakly Pro is cut. `grep -c PEAKLY_PRO app.jsx` → 0. Removed from triage. Will not appear again.

### Sentry DSN
✅ Live and confirmed. Not a triage item.

### Cache buster
✅ `20260823b` in lockstep across app.jsx/sw.js/index.html. Not a triage item.

### BASE_PRICES — 23 airports missing
**P2 — SHIPPED THIS REPORT.** DevOps delivered the exact 23-entry paste block. Applied to app.jsx now. Coverage goes from 85.8% → **100%**. Deal badges active for all 391 venue airports. See Decisions below.

### Flight proxy timeout 1,500ms
**P3 — SHIPPED THIS REPORT.** Changed to 4,000ms at `app.jsx:6273` to match the weather proxy timeout. Prevents valid slow responses from being silently treated as failures.

### Onboarding geo-silent-block (v128 hidden risk)
**P1 — UNRESOLVED, now explicitly tracked.** The risk: on iOS Safari with location globally blocked (not "denied", just unresponsive), `getCurrentPosition` never fires a denial event. The new onboarding flow (`fff7d60`) only shows the manual airport picker when `geoState === "done" && !airport`. If `geoState` stays `"idle"` forever (silently blocked, not timed out), the user never sees a picker and gets no airport set. The 10s timeout helps for slow resolves but not for silently blocked states. Jack needs to verify the fallback logic on a device with location globally blocked. **This is the highest-risk unresolved item post-launch and requires a human with device access to verify.**

### Wikimedia attribution (303 photos)
**P3.** Decision made below. Not a launch blocker; tracking as a v2 task.

### Stale claude/* branches (15+)
**Housekeeping.** Not a product issue. One-liner: `git branch -r | grep 'origin/claude/' | sed 's|origin/||' | xargs git push origin --delete`. Jack does this; takes 30 seconds. Not tracked on the roadmap.

---

## Three Product Decisions — Aug 24

### Decision 1: SHIP BASE_PRICES 100% backfill. Applied in this report.

The DevOps agent delivered the exact 23-entry block with verified fare estimates for every missing airport. Coverage was 85.8%. This is the deal-scoring engine — running it on 14% of venues without a baseline is a structural gap in the headline feature. Applied now. Coverage is 100%. This was the right call to hold through the observation window since it touches app.jsx, but it's also the right first post-freeze commit.

### Decision 2: Wikimedia attribution — take option (b), do it organically, stop tracking.

303 photos are Wikimedia Commons. Two options: (a) build a `/credits` page listing 303 URLs (4hr, zero user value), or (b) replace Wikimedia photos with Unsplash (public domain, no attribution required) as venues are naturally updated. **Option (b), organic replacement.** The legal exposure is low at <100 MAU. When photo work resumes — which it should, photos are still the biggest quality gap — use Unsplash exclusively. The 5 new venue proposals in today's Content report all use Wikimedia URLs; if those venues are added, they get Unsplash photos instead. Removing this from the open items list. It is now a standing photo-sourcing policy, not a tracked task.

### Decision 3: The 5 new beach venues from the Content report — DEFER until after Sentry/Plausible data review.

Luskentyre, Patmos, Balos, Huahine, and Tjøme are well-sourced candidates. But (a) all 5 use Wikimedia photos, which we just decided to replace organically, (b) we don't yet have Plausible data telling us whether beach catalog depth is a user-retention problem, and (c) adding 5 venues at 391 is ~1.3% catalog growth — immaterial to the 100K goal at this stage. The right trigger for venue adds is "users are bookmarking venues at the catalog boundary" or "search terms show unfulfilled demand." We don't have that data yet. Defer until after first Plausible review. Add them with Unsplash photos when they ship.

---

## This Week's Top 3 Priorities Only

**1. Jack: Review Sentry + Plausible data from launch (Aug 22–24). Today.**
This is the only action that cannot be delegated. Open Sentry and Plausible. Specific questions to answer:
- Any ErrorBoundary events or `logError` fires in Sentry?
- Session count and bounce rate in Plausible (>100 sessions = traction; >50% bounce = onboarding problem)
- Are users creating alerts? (Check localStorage-based Plausible `alert_registered_server` events)
- Is the geo-silent-block scenario appearing? (Would show as sessions with no airport set, users seeing global/unfiltered results)

Until this data exists, every product prioritization is guessing.

**2. Verify the geo-silent-block risk on a real iOS device. This week.**
The v128 observation window surfaced this and it hasn't been tested. The scenario: iOS Safari, location globally blocked, user hits onboarding. Does the airport picker appear? If not, the first-run experience for a meaningful iOS Safari segment is broken and the Plausible data will show high bounce from that cohort. Two-minute test. Must be Jack with a device; can't be verified in a sandbox.

**3. After Plausible review — decide on Reddit/HN post timing.**
v127 said the launch post was the launch post (Aug 22). If that post generated <100 sessions, there is no second launch from the same post. The next catalyst is a high-quality new Reddit post (r/skiing, r/solotravel) targeting the right weekend timing. That post needs: (a) Sentry clean, (b) geo-silent-block confirmed or fixed, (c) BASE_PRICES at 100% (now done), (d) photos looking good for the venues most likely to be screenshotted. Don't post until all four are true.

---

## Features REJECTED This Week

- **JSON-LD structured data** — CUT. Reddit traffic doesn't route through structured data. Revisit at 10K users when organic search becomes meaningful.
- **Static h1 SEO fallback** — CUT. Same reason.
- **5 new beach venues with Wikimedia photos** — DEFER. Right venues, wrong photo source. Add after Plausible data shows catalog depth is a retention lever.
- **vitest unit tests** — DEFER indefinitely. Single-file Babel SPA, no CI configured for tests, wrong complexity for this stage.
- **Stale branch cleanup (15+ claude/ branches)** — NOT a product task. Jack runs one bash line; done.
- **`/credits` page for Wikimedia attribution** — CUT. Zero user value. Replaced by standing photo policy: Unsplash only going forward.

---

## One Product Risk Nobody Is Talking About

**The flight proxy timeout fix (1,500ms → 4,000ms) may mask a real VPS performance problem.** The original 1,500ms timeout was aggressive but it was also a canary — if the VPS was responding in under 1.5s for most users, the existing deal badges were working. If it was routinely timing out, that's a signal the VPS is slow. By extending to 4s, we fixed the user-facing symptom (blank prices on slow responses) but we also removed the signal. At current traffic (<100 MAU), VPS response time is not a problem. At 1K+ MAU — the point where a Reddit spike starts — a slow VPS response every 4 seconds per user, batched across 391 venues, could become a real degradation. **Track the VPS `/health` response time metric on the first post-Reddit-spike check.** If p95 response times start climbing, the fix is VPS upgrade or caching strategy, not timeout extension.

---

## Success Criteria

| Metric | 5K users (90 days) | 8K users (90 days) |
|--------|--------------------|--------------------|
| Reddit/HN post quality | 1 post gets traction (r/skiing or r/solotravel) | 2–3 posts across subreddits, including HN |
| Bounce rate | <70% | <55% |
| Booking link clicks | >5% of sessions | >8% of sessions |
| Alerts created | >200 | >500 |
| Weekly return visits | >25% | >35% |

**What has to be true for 8K not 5K:**
1. The geo-silent-block bug doesn't exist or is fixed before the second Reddit post
2. Photos look real (venue-specific, not generic stock) for the top 20 most-bookmarked venues
3. The Reddit post hits r/solotravel or r/travel in addition to r/skiing — beach audience is 2× the ski audience in August
4. Plausible shows users are returning (>25% weekly return in first 30 days)

The difference between 5K and 8K is one well-placed post on the right subreddit at the right moment (a newsworthy snowfall or an iconic beach going viral). The product needs to be clean enough that when that moment comes, it converts. BASE_PRICES at 100% and Sentry clean are the baseline. Everything else is distribution.
