# Report: 2026-03-23

**Status**: YELLOW

**Live Site Health**: working — site loads, HTML structure is correct, React SPA renders client-side via Babel. OG tags and Twitter Card tags present in source.

---

## Fixes Verified

All four fixes from the last push (commit `eaee1c7`) confirmed working:

1. **Tanning category in CATEGORIES** — CONFIRMED. Line 148: `{ id:"tanning", label:"Beach & Tan", emoji:"🏖️" }`. 20+ tanning venues present and now filterable.
2. **No AFFILIATE_ID placeholders** — CONFIRMED. Zero matches in app.jsx. All affiliate links have real IDs.
3. **No peakly.app URLs** — CONFIRMED. Zero matches in app.jsx. Share links correctly use `j1mmychu.github.io/peakly`.
4. **OG tags in index.html** — CONFIRMED. Full set: `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:site_name`, plus Twitter Card tags.

---

## Bugs Remaining

| # | Severity | Bug | Details |
|---|----------|-----|---------|
| 1 | **P1** | OG image file missing | `og-image.png` is referenced in meta tags but the file does not exist in the repo. Every social share (Twitter, Slack, iMessage) shows a broken/missing preview image. |
| 2 | **P1** | Trips tab missing from nav | BottomNav only has 3 tabs (Explore, Alerts, Profile). Spec 3.4 calls for 4-tab layout. TripsTab component exists and works but users cannot reach it. |
| 3 | **P2** | "windows available" wording | Grid count says e.g. "142 windows available" — confusing. Should say "spots" or "destinations". Count also shifts when venues are promoted to carousels above, which is misleading. |
| 4 | **P2** | Cards may still clip GO badges (Spec 1.2) | Card audit not yet done post-Phase 1. CompactCard badge clipping was flagged in spec but not explicitly fixed. |
| 5 | **P2** | No venue photos | All cards use gradient backgrounds only. Looks like a prototype, not a shipping product. Spec 2.1 not started. |
| 6 | **P2** | Diving & Climbing have ~1 venue each | These category pills lead to near-empty results. Erodes user trust. |
| 7 | **P3** | Sentry DSN empty | Error monitoring disabled. No visibility into production crashes. |
| 8 | **P3** | Favicon is plain "P" SVG text | No branded icon. |

---

## Spec Progress (claude-code-spec.md)

| Phase | Status | Notes |
|-------|--------|-------|
| **Phase 1: Critical Bugs** | ~80% done | 1.1 mixed content fallback done. 1.4 pills done. 1.5 city names done. 1.2 card audit still needed. 1.3 venue count wording still confusing. |
| **Phase 2: UX Improvements** | Not started | Unsplash photos, carousel, detail sheet, alerts, profile, haptics. |
| **Phase 3: Performance** | ~25% done | 3.3 error handling for flights done. 3.4 Trips tab NOT restored. |
| **Phase 4: Content** | Not started | Seasonal intelligence, trending, onboarding. |

---

## Top 3 Priorities This Week

### 1. Create og-image.png + restore Trips tab (P1 bug fixes)
**Why**: OG image is critical — every social share looks broken right now. Trips tab hides a major differentiating feature (AI trip builder, vibe search) that's already built. Both are small fixes with outsized impact.
**Effort**: Small. Generate a 1200x630 branded image, add to repo. Add Trips back to BottomNav tabs array.

### 2. Add Unsplash venue photos (Spec 2.1)
**Why**: Single biggest visual upgrade possible. Gradient-only cards look like a prototype. Real photos make every scroll feel like a real travel app. This is the gap between "side project" and "100K downloads."
**Effort**: Medium. Add photo URLs to top 30 venues, update card components with image backgrounds + gradient overlay fallback.

### 3. Venue Detail Sheet polish (Spec 2.3)
**Why**: The conversion point where users decide to book flights. Full-width photo, sticky "Book Flights" CTA, weather forecast breakdown, and similar venues section would significantly increase flight link clicks.
**Effort**: Medium-large. Touches VenueDetailSheet heavily.

---

## Decision Made

**Restore 4-tab navigation this week.** The Trips tab (AI trip builder, vibe search) is a differentiator that's currently hidden behind a missing nav item. The component is fully built. Ship it immediately alongside the OG image fix.

**Secondary decision:** Continue prioritizing Phase 2 (UX) over Phases 3-4. Photos and polish drive downloads; performance optimization doesn't matter if the app looks like a prototype.

---

## Blockers

1. **OG image asset** — Need a branded 1200x630 image. **Decision for Jack**: Auto-generate one now (fast, functional) or wait for a designed asset?
2. **Sentry DSN** — Need Jack to sign up at sentry.io and provide the DSN. Not urgent but needed before any growth push.
3. **Flight proxy HTTPS** — Travelpayouts proxy at `104.131.82.242:3001` is HTTP-only. Fallback with "est." labels works, but real pricing needs HTTPS (domain + Nginx + Let's Encrypt on VPS). Will need Jack's server access or action when we're ready.
