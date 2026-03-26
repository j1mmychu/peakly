# Peakly Daily Briefing — 2026-03-25

**Overall Status:** YELLOW

## What Shipped
- **VenueDetailSheet photo hero** — 240px full-bleed Unsplash hero with gradient overlay, drag handle, close/share/save buttons
- **Sticky CTA bar** — Flights + Hotels always visible at bottom of detail sheet, Plausible tracking on flight clicks
- **Score validation thumbs up/down** — localStorage persistence + Plausible event on vote
- HTTPS proxy fully live (Caddy + Let's Encrypt)
- Plausible analytics with 5 custom events
- PWA manifest + service worker
- JSON-LD structured data (SEO 91%)

## Decisions Made Today
- **PM:** GuidesTab cut from next sprint (stays as dead code); Open-Meteo cache upgraded from P2 → P1
- **Growth:** Reddit launch target set for **April 1** — gives 7 days to finish detail sheet polish + Aviasales links
- **DevOps:** Weather caching is now #1 infra priority — 272 API calls/page load will blow 10K/day limit at ~30 users
- **UX:** Remove all emoji from VenueDetailSheet section headers (15+ instances violate "clean text + SVG only" decision)
- **Revenue:** Add Plausible tracking to ALL affiliate links (only flights tracked today, blind on gear/hotels/insurance)
- **Content:** Pause new tanning venues; prioritize filling climbing, kayak, diving, MTB gaps in Africa/South America

## Top 3 Actions Needed
1. **Open-Meteo weather cache (Dev, 2 hrs)** — localStorage with 30-min TTL. Without this, any Reddit traffic kills all scores. **Gates launch.**
2. **Replace `TP_MARKER` placeholder (Jack, 5 min)** — Line 1554 of app.jsx still says `"YOUR_TP_MARKER"`. Every flight click earns $0. Log into tp.media, grab marker, paste it in.
3. **11 WCAG contrast fixes (Dev, 10 min)** — Flagged for 6 consecutive reports, zero fixed. All single-value color swaps. Ship as one batch commit.

## Numbers
- **Venues:** 205 total (CLAUDE.md says 192 — stale by +13)
- **Site:** UNVERIFIED (no monitoring — UptimeRobot still not set up)
- **HTTPS:** Done
- **Design Score:** 7.8/10 (down from 9.4 after honest recalibration)
- **Revenue Readiness:** $11.92 RPM live, **$8.14 RPM leaking** from missing affiliate tags
- **Launch Readiness:** 1 dev sprint away (weather cache + contrast fixes + emoji cleanup)

## Jack's To-Do
- **Replace TP_MARKER** — tp.media → copy marker → paste at line 1554 of app.jsx. 5 min. Worth $0.14+ RPM from day one.
- **REI Avantlink signup** — avantlink.com, 30 min, no LLC needed. Unlocks $6.16 RPM on 22 existing links.
- **Sentry DSN** — sentry.io → create project → paste DSN at line 27. 5 min. Flagged for 3+ days.
- **UptimeRobot** — free tier, 5 min. Zero monitoring = blind to outages.
- **LLC status?** — Blocking Stripe, GetYourGuide, Backcountry, domain. +$21.17 RPM waiting.

---
*Compiled from 6 agent reports by Chief of Staff · 2026-03-25*
