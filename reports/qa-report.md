# Peakly QA Report — 2026-04-10

**URL tested:** https://j1mmychu.github.io/peakly/
**Environment:** Chrome desktop (via MCP browser automation)
**Overall:** 8/8 PASS (browser smoke test)

## Browser Smoke Test Results

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1 | Site loads (HTTP 200, React mounts) | PASS | Title: "Peakly — Find Surf, Ski & Adventure Spots with Cheap Flights" |
| 2 | Onboarding sheet renders + dismisses | PASS | "Know when to go." sheet shows, "Skip for now" works |
| 3 | Explore tab renders | PASS | Hero "Your Best Window Right Now" = Mammoth Mountain, 66/100, $145 flight, 54% off. 2,043 spots shown in grid. |
| 4 | Venue cards render with photos + scores | PASS | Sölden, Kirkwood, Palisades Tahoe all show photos + MAYBE/WAIT badges. Hero card photo loads. |
| 5 | Alerts tab loads | PASS | Empty state + Vibe Search pill + "Create your first alert" CTA |
| 6 | Profile tab loads | PASS | Onboarding CTA + notification toggles + travel window picker |
| 7 | Venue detail sheet opens | PASS | Photo hero, Conditions 66, Flight from JFK $145, 7-day forecast, sticky Flights CTA |
| 8 | Swipe-down dismisses detail sheet | PASS | 300px touch drag on `.sheet` dispatched → sheet closed, URL reverted from `#venue-mammoth` to `/`. |

## Console Errors

**NONE.** Zero JavaScript errors, zero exceptions.

Only 2 non-fatal warnings from the Sentry CDN bundle:
- `browserTracingIntegration()` used but bundle does not include tracing
- `replayIntegration()` used but bundle does not include replay

**Fix (P3, optional):** upgrade Sentry bundle to tracing+replay variant, OR remove those integrations from `Sentry.init()`. They pass through without errors — non-blocking.

## Issues Observed (Known Bugs Still Live)

### P1 — Already flagged in CLAUDE.md, still live

**1. Score vote thumbs up/down still rendered in VenueDetailSheet** (bug #19)
- Visible in Mammoth Mountain detail view next to Conditions 66 block.
- Decision to CUT was made 2026-03-25. Still rendering 16 days later.
- Fix: remove the thumbs up/down JSX at `app.jsx:9305-9317` and `app.jsx:9510-9515`.

**2. Emoji still in UI chrome** (bug #20)
- Profile tab: 🔥 Peak conditions, ✈️ Flight deals, 📅 Weekly digest, 🚀 Create my adventure profile.
- VenueDetailSheet: 📍 location pin, 💡 "You'd also like", ⭐ rating, ✈️ Flights button, 🏛️ Hotels button.
- Explore: ✨ All, ❄️ Ski/Board, 🏄 Surf, 🏖️ Beach category pills.
- Decision to CUT was made 2026-03-25. Day 16, still live.
- Fix: replace emoji with clean text + inline SVG across `app.jsx`.

### P2 — Cache Buster Stale

- **Current:** `app.jsx?v=20260331a`
- **Today:** 2026-04-10 → **10 days stale**
- **Fix (one-line):**
  ```html
  <script type="text/babel" src="app.jsx?v=20260410a"></script>
  ```
  in `index.html`. Also bump `CACHE_NAME` in `sw.js` to `peakly-v15`.

### P0 Process — Code Freeze Continues

Last product commit was April 4 (`fd6e4e8`). Today is April 10 → **6 consecutive days** with no commits. All P1 bugs above were already open before this run. ProductHunt launch is April 15 (5 days out).

## Static Checks

| Check | Result | Notes |
|-------|--------|-------|
| `app.jsx` file present | PASS | 10,993 lines (above 5,631 baseline — expected since venues expanded to 3,726) |
| `index.html` cache buster present | PASS (value stale — see P2) | `v=20260331a` |
| Sentry initialized | PASS | Sentry CDN bundle loads (warnings originate from browser.sentry-cdn.com) |
| Site reachable over HTTPS | PASS | github.io HTTPS |
| Proxy API responding | PASS (implicit) | Flight price $145 rendered on hero card → `peakly-api.duckdns.org` responded |

## Regressions vs Last Run

**NONE.** All tabs still load, all cards still render, venue detail still opens and dismisses cleanly. Thumbs up/down, emoji chrome, and stale cache buster were all open prior to this run — this report confirms they remain live, not that they newly broke.

## The One Thing That Would Break Everything If Not Caught

**Cache buster + service worker staleness during ProductHunt week.**

If the first post-freeze fix ships without bumping both `app.jsx?v=` AND `sw.js` `CACHE_NAME`, returning users will be served the old cached bundle and any P1 fix silently won't take effect. Given 6 days of freeze + ProductHunt on April 15, the first post-freeze commit is the most important one — and `v=20260331a` is already 10 days stale.

**Mandatory on next commit:**
1. `index.html` → `app.jsx?v=20260410a`
2. `sw.js` → `CACHE_NAME = 'peakly-v15'`
3. After deploy, verify DevTools → Application → Service Workers shows the new version.

---

**Report generated:** 2026-04-10 (Peakly QA Agent, scheduled run)
