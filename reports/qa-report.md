# Peakly QA Report

**Date:** 2026-03-24
**Agent:** QA Agent (Claude Opus 4.6)
**File under test:** `app.jsx` (5,607 lines)
**Deployed URL:** https://j1mmychu.github.io/peakly/

---

## Check Results

### 1. Site Loads (HTTPS)
**PASS** -- `https://j1mmychu.github.io/peakly/` returns HTTP 200. HTML includes React 18, ReactDOM, Babel Standalone 7.24.7, and loads `app.jsx?v=20260323b` via `<script type="text/babel">`. A Babel parse-error fallback script is present in `index.html`.

### 2. Babel-Breaking Syntax Patterns
**PASS** -- No issues found.

| Check | Result |
|-------|--------|
| Brace balance `{}` | 3,877 open / 3,877 close -- balanced |
| Paren balance `()` | 2,126 open / 2,126 close -- balanced |
| Bracket balance `[]` | 541 open / 541 close -- balanced |
| Double commas `,,` | None found |
| Duplicate `photo:` on same line | None found |

### 3. Core Components Exist
**PASS** -- All five required components are defined:

| Component | Line |
|-----------|------|
| `function ExploreTab` | 2223 |
| `function AlertsTab` | 2685 |
| `function ProfileTab` | 3093 |
| `function BottomNav` | 5223 |
| `function VenueDetailSheet` | 4227 |

### 4. Category Pills
**PASS** -- `CATEGORIES` (line 141) includes all expected entries:

- `all`, `skiing`, `surfing`, `hiking`, `diving`, `climbing`, `tanning` (labeled "Beach & Tan")

Default visible pills (line 2278): `["all", "skiing", "surfing", "tanning"]`. Remaining categories revealed via "show all" toggle (line 2279). Tanning is confirmed present in both the constant and the default set.

### 5. Card Rendering & `listing.photo` Handling
**PASS** -- All three card components handle `listing.photo` correctly with a ternary fallback:

| Component | Line | Photo present | Fallback |
|-----------|------|---------------|----------|
| `ListingCard` | 1291 | `<img>` tag | Gradient + icon |
| `FeaturedCard` | 1405 | `<img>` tag | Gradient + icon |
| `CompactCard` | 1471 | `<img>` tag | Gradient + icon |

All use `listing.photo ? <img> : <gradient-div>`, so missing photos do not cause crashes.

### 6. Broken References in UI Strings
**PASS** -- No UI-facing `"undefined"`, `"NaN"`, or `"TODO"` string literals found.

- The only `TODO` is a code comment on line 6 (`// TODO: Add Sentry DSN after signup`) -- not user-visible.
- Two `isNaN()` calls (lines 2201, 2208) are guard checks in filter logic -- correct usage, not broken output.
- No `AFFILIATE_ID` placeholders remain (previously noted in CLAUDE.md but now clean).

---

## Console Error Risks

### HIGH: Mixed Content Block on Flight Prices
- **Line 1023:** `FLIGHT_PROXY = "http://104.131.82.242:3001"` -- this is plain HTTP.
- The deployed site is served over HTTPS (`j1mmychu.github.io`).
- **All modern browsers block mixed HTTP requests from HTTPS pages.** Flight price fetches will silently fail.
- The code handles this gracefully (5s timeout, catches abort, falls back to `BASE_PRICES`), so the app does not crash. But users never see real flight prices -- only hardcoded estimates.
- **Impact:** Moderate UX degradation. Price labels show "est." fallback values.

### LOW: Sentry DSN Not Configured
- **Line 6:** `SENTRY_DSN = ""` -- error reporting is effectively disabled.
- The code guards on `if (SENTRY_DSN)` before sending, so no runtime errors result.
- **Impact:** No crash telemetry in production. Bugs go undetected.

### LOW: Unsplash Images Without Rate Limit Awareness
- All venue photos are Unsplash hotlinks with `?w=800&h=600&fit=crop` parameters.
- Unsplash's free hotlinking is not guaranteed for production apps at scale.
- **Impact:** No immediate risk, but could become an issue at 100K+ users.

---

## Recommended Fixes

| Priority | Issue | Fix |
|----------|-------|-----|
| **P0** | Mixed content blocks flight API | Enable HTTPS on the VPS proxy (Let's Encrypt + Nginx) or use a Cloudflare tunnel. Update `FLIGHT_PROXY` to `https://`. |
| **P2** | No error telemetry | Sign up for Sentry, add DSN to line 6. |
| **P3** | Unsplash hotlinking at scale | Migrate venue photos to a CDN bucket or use Unsplash Source API with proper attribution. |

---

## Summary

**Overall: PASS (6/6 checks passed)**

The codebase is syntactically sound. All core components, category pills, and card renderers are present and correctly structured. No Babel-breaking patterns, no broken UI string references. The only operational concern is the HTTP flight proxy being blocked by mixed-content policy on the HTTPS deployment -- this is a known issue (documented in CLAUDE.md) that degrades pricing accuracy but does not break the app.
