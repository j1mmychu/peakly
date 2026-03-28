# Peakly Daily Briefing — 2026-03-27

**Overall Status:** YELLOW — App is 85% launch-ready. One 5-minute Jack action blocks all revenue. Three data gaps block Reddit launch.

## What Shipped (Yesterday, 20 commits)
- **9 scoring algorithm fixes** across all categories
- Heart favorites with localStorage persistence
- Top-10 airport search UX improvement
- Highest-scoring venues now sort first on Explore
- Peakly Pro UI removed (no dead CTA pre-Stripe)
- TWA manifest polished (Google Play path ready)
- Email capture added (replaces Pro upsell)
- Hero card hidden until weather loads
- Category pills: smaller, equal-width
- Scroll lock on sheets, geo prompt, image fallbacks
- Sentry DSN now live, book_click Plausible event shipped
- Cache buster bumped to v13

## Decisions Made Today
- **PM:** Onboarding promoted from P2 → P1 (Reddit users will bounce without it)
- **Growth:** Do NOT launch Reddit until TP_MARKER + BASE_PRICES + onboarding are fixed
- **DevOps:** Service worker architecture confirmed correct, no changes needed
- **UX:** Standardize BottomNav inactive color to #767676 (WCAG fix)
- **Revenue:** $79/yr Peakly Pro pricing confirmed correct vs competitors
- **Content:** BASE_PRICES + AP_CONTINENT expansion is now #1 data quality priority

## Top 3 Actions Needed
1. **[P0] Replace TP_MARKER** — Day 4 of this being flagged. Line 3760 of app.jsx. Every flight click earns $0. Jack action, 5 min. Worth ~$40-55/week at launch traffic.
2. **[P1] Expand BASE_PRICES (76 → 300+ airports) + AP_CONTINENT (160 → 776 airports)** — 70% of venues show $800 default price, 74% have broken region filters. Dev work, 3 hrs. Blocks Reddit launch.
3. **[P1] Build onboarding flow** — New users see Explore with zero context on what scores mean. Dev work, 3-4 hrs. Blocks Reddit launch.

## Numbers
- **Venues:** 2,226 (balanced ~200/category)
- **Site:** Assumed UP (UptimeRobot — can't verify from agent env)
- **HTTPS:** Done
- **App size:** 8,991 lines / 1.30 MB (stable, +40 lines)
- **Design Score:** 7.3/10 (down 0.2 — 12 WCAG contrast failures persist for 8th day)
- **Data Health:** 62/100 (down from 68 — lookup table gaps)
- **Code Quality:** 78/100 (syntax clean, docs drifted)
- **Revenue Readiness:** $11.92 RPM live → **$20.06 RPM** after fixing affiliates → **$217/mo at 1K MAU** after Pro
- **Launch Readiness:** 85% (up from 60% yesterday)
- **Infra Cost:** ~$15/month
- **SEO Score:** 91%

## Jack's To-Do

| # | Task | Time | Impact |
|---|------|------|--------|
| 1 | **Replace TP_MARKER** — tp.media → grab marker → paste in app.jsx line 3760 | 5 min | $0 → earning on every flight click |
| 2 | **REI Avantlink signup** | 30 min | +$6.16 RPM (22 links earning $0) |
| 3 | **Verify UptimeRobot** — confirm both site + proxy are monitored | 5 min | Peace of mind |
| 4 | **Pin React CDN** — change `@18` to `@18.2.0` in index.html (or tell an agent to do it) | 2 min | Prevents silent breakage |

**After dev ships onboarding + data fixes → green-light Reddit launch. Target: 48 hours.**

---

*Compiled from 8 agent reports (DevOps, Content, PM, Growth, UX, Revenue, QA, Code Quality) — 2026-03-27*
