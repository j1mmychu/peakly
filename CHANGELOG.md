# Peakly Changelog

Historical "what was shipped" and "decisions made" log. Moved out of CLAUDE.md on 2026-04-10 to keep the shared brain lean. Read this when you need historical context — otherwise stay focused on CLAUDE.md.

## 2026-04-15
- Removed duplicate `require()` of `fs` and `path` in proxy.js (lines 5-6 and 232-233 were dupes). No runtime impact.

## 2026-04-14 — 18 algorithm holes
**7 holes (commit 4475f3a):** strict day-index `at(arr)` helper, gustFactor only when wind ≥ 8mph, windswell-dominant surf hard-capped, bigWaveBreak detection scans id/title/tags, wet-snow false powder bonus capped at 75, swell trend awareness ("tail end" / "fading" labels), tanning cloud_cover_max wired into fetchWeather. Cache 20260412a → 20260414a.
**11 holes (commit 4cd0f6c):** freezing rain (wCode 66/67) ski penalty -28, thunderstorms penalize ski -22 / surf -30, surfing wind direction defaults to speed-only when missing, bluebird powder bonus +6, fading swell -5pts, snowmaking floor by season (peak 35 / shoulder 25 / off 15), NWS official wind chill formula, beach 22mph "umbrella-flipping" band, likelyRain detection -16 for beach, heavy snow visibility warning. Cache 20260414a → 20260414b.

## 2026-04-12 — 7 algorithm holes
- Marine data missing → score 50 "Swell data unavailable" instead of dishonest 22.
- Beach marine data NOW FETCHED (`needsMarine` was surfing-only before).
- Skiing season awareness: off-season → score 8, shoulder months capped unless real snow.
- Spring skiing penalty gated on base depth (42°F + 200cm = corn, not slush).
- bestDays counter category-aware (snow days = good for skiing).
- Heat index humidity penalty for beach (dangerous -12 / oppressive -7 / sticky -3).
- Snowmaking floor 35 (was 20) during ski season.
- Cache 20260411a → 20260412a.

## 2026-04-11 — accuracy + honesty pass
- Surfing wind direction was INVERTED — fixed to use `venue.facing + 180` for offshore bearing. Glassy/offshore/cross/onshore penalties recalibrated.
- Skiing wCode ≥ 65 split rain (penalty) from snow (no penalty); wind chill component added.
- Tanning wind thresholds tightened (uncomfortable 13mph, miserable 18mph). Water-temp bonus/penalty added when marine data fetched.
- Flight pricing stopped fabricating deals — `getFlightDeal` returns honest typical price, `pct: 0`, `isEstimate: true`.
- `getTypicalPrice` rewritten: `BASE_PRICES[venue.ap]?.[homeAirport]` with region-pair fallback. Single source of truth with `getFlightDeal`.
- UI price badges gated on `flight.live` (only render "X% off" when real AND pct ≥ 10).
- `best-right-now` filter passes homeAirport to `getDealScore`; excludes estimates.
- Insider Tips removed (LOCAL_TIPS + PACKING orphans deleted).
- "You'd also like" moved to bottom of VenueDetailSheet.

## 2026-04-10 — cleanup + launch-scope pass
- `TP_MARKER = "710303"` (flight commission earning).
- `fetchWeather` retries 429/5xx with backoff; returns null instead of throw.
- Proxy: deduped rate limiter, IATA regex validation, /api/alerts schema validation + cap.
- Proxy: new POST /api/waitlist → appends to `server/data/waitlist.jsonl`.
- index.html: pinned react/react-dom @18.3.1.
- REI section removed (22 dead $0 links).
- VENUES scaled 3,726 → 257 (unique-photo dedupe) → 231 (launch cats only: ski/surf/tan).
- CATEGORIES trimmed to 4; emoji field stripped.
- LOCAL_TIPS / PACKING / GEAR_ITEMS / EXPERIENCES / guideCategories / blurbs / vibe-search intents / getVenuePhoto / needsMarine all pruned to launch-only.
- 8 dead `switch` cases removed from `scoreVenue` (diving/climbing/kite/kayak/mtb/fishing/paraglide/hiking).
- `venue.facing` compass bearing on all 77 surfing venues.
- Email capture: real POST to `/api/waitlist` with inline status (no more `alert()`).
- Sitemap: dropped hash-fragment URLs.
- `.archive/` deleted (64K April 7-9 QA snapshots).
- `.gitignore`: added `*.orig`, `*.rej`.

## 2026-04-05 → 2026-04-10
- Pre-fetch weather during onboarding (commit `ce730cf`, on `main`, not yet merged to `master` as of 2026-04-10).
- Code freeze: only one product commit in this window. P1 bug list unchanged. ProductHunt 5 days out.

## 2026-04-01 → 2026-04-04
- Removed +15 preference boost from sort comparators (consistent scores across users; personalization only affects hero card).
- Weather cache TTL: 30min → 2hr.
- Deal-based flight scoring: `getTypicalPrice` + `getDealScore`, distance-aware filtering replaces $800 absolute cap.
- Onboarding UX fixes: hero cards GO-only, US airports only in onboarding picker.
- Bulletproof flight URLs: JFK fallback for empty origin, `#` for missing dest, try/catch on date formatting, all call sites guarded.
- Flight price caching: localStorage TTL cache, priority fetching for visible venues, progressive loading.
- Onboarding airport picker modal (dedicated step in flow, not buried in profile).
- Proxy server source committed to repo at `server/`.
- GitHub Actions deploy workflow at `.github/workflows/deploy.yml` (main + master).
- Premium splash screen v2: aurora sweep, depth gradient, floating mountain icon, gradient wordmark, dot-trio loader.

## 2026-03-29
- Venues expanded to **3,726** (added 500 surf + 500 ski + 500 beach).
- Top 3 focus established: Surfing, Ski/Board, Beach. Other categories deprioritized for launch.
- Capacitor + push notification infrastructure: `capacitor.config.json`, `package.json`, native APNs + web SW fallback.
- Alert configs now store `venueId`, `targetScore`, `maxPrice` for backend polling.
- SW push handler with venue deep-link, cache bumped to `peakly-v14`.
- Flight pricing language: "from $X" + last-seen timestamps, `/api/flights/latest` endpoint, exact-date Aviasales deep links.
- Gear section hidden behind `{false && ...}` for launch simplicity.
- Audit fixes: Beach rename (was "Beach & Tan"), Best Right Now expanded to 10 spots, JFK fallback removed, heart favorites list sync, scroll-to-top on similar venue tap, date picker contrast.

## 2026-03-26 → 2026-03-28
- Venues expanded 192 → **2,226** with batched weather fetching (50/batch, 2s delay).
- Open-Meteo weather cache: localStorage with TTL.
- Premium splash screen v1.
- Pull-to-refresh on Explore tab.
- Sport-ordered category tabs (user's preferred sports first).
- Scale Guardian agent added (8th agent).
- Major scoring algorithm fixes (9 across all activities).
- Peakly Pro UI removed → email capture waitlist.
- Heart favorites with sync + pop animation.
- Geolocation prompt on first visit.
- Logo + larger wordmark in header. Vibe Search pill in header.
- Pagination on Explore (30/page + Show more) — DOM perf fix for 2,226 venues.
- BASE_PRICES region-based fallback covering all 776 airports.
- SEO 91% → 95%: preconnect, JSON-LD SearchAction + ItemList, sitemap.xml, viewport accessibility fix.
- Cache buster v=20260328a, SW peakly-v12.

## 2026-03-25
- VenueDetailSheet shipped: photo hero + sticky CTA + swipe-down dismiss.
- Flight links switched from Google Flights to Aviasales/Travelpayouts deep links.
- Sentry live (Loader Script + `Sentry.init()`, dashboard at peakly.sentry.io).
- Ski pass filter (Ikon/Epic/Independent pills, 204 ski venues).
- LLC approved — unblocks Stripe, GetYourGuide, Backcountry, peakly.app domain.
- UptimeRobot monitoring for site + API.
- Service worker + CDN cache recovery (cache buster bump).
- Syntax error fix (double comma at line 300 of app.jsx).
- Venues trimmed 333 → 192 with 100% unique Unsplash photos.
- Travelpayouts token migrated to VPS proxy (no secrets in client code).
- Flight price fallback with "est." labels.
- City name display (AIRPORT_CITY lookup) in search bar and hero.
- Auto-refresh weather every 10 min.
- HTTPS proxy live (Caddy + Let's Encrypt on peakly-api.duckdns.org).
- PWA manifest + service worker, installable on mobile.
- Plausible analytics with 5 custom events (flight_click, venue_detail, set_alert, search, share).
- JSON-LD structured data added to index.html.

## Major decisions log (still load-bearing)

- **Photos before features.** Polished + fewer beats feature-rich + unfinished.
- **PWA + SEO first, native apps later.** Validate with 1K web users before React Native.
- **No paid/Pro tier at launch.** Email waitlist only. Stripe deferred until demand validated.
- **Top 3 focus:** Surfing, Ski/Board, Beach. Other categories ride along but don't drive marketing.
- **Algorithm freeze** (per PM v16, 2026-03-27) — no scoring changes until post-Reddit launch.
- **Reddit soft launch:** March 31, 2026. **ProductHunt:** April 15, 2026.
- **Google Play YES, Apple NO** — PWA via TWA/PWABuilder is fine ($25). Apple rejects PWA wrappers under Guideline 4.2; revisit when native features justify it.
- **CTA buttons #222 dark**, not blue. Feels premium.
- **No emoji in UI chrome.** Decided 2026-03-25. (Not yet executed — see CLAUDE.md P1 list.)
- **Cut from scope:** thumbs up/down voting, dark mode, offline support, Trips tab, Wishlists tab, dual home airports promo.
- **Aviasales deep links over Google Flights** — Google Flights earned $0; Aviasales earns commission.
- **Trim before expand.** 192 quality venues was right. Then 2,226 with infrastructure (caching, pagination, batched fetching). Then 3,726 only after that infrastructure proved stable.

## Competitive intel

- **OpenSnow** (2026-04-08): banner 2025-2026 season, PEAKS AI model, custom powder alerts, $49.99–99.99/yr. Ski-only. Peakly's multi-sport + flights advantage holds.
- **Stormrider Surf Guide** (2026-04-08): 5,000 surf spots, offline mapping, skill-level matching, ~$1.25/mo. No real-time scoring, no flights, no multi-sport. 30-year content library is deeper than Peakly's spot descriptions.
- **ProductHunt algorithm** (2026-04-08): favors comments over upvotes. 50 upvotes + 30 comments > 200 upvotes + 5 comments. Target: top 5 of day, 100+ upvotes, 40+ comments.
