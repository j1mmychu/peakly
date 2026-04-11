# CLAUDE.md — Peakly

> Shared brain for all AI sessions. Keep this file under ~250 lines. Historical "what shipped" lives in `CHANGELOG.md`. Open bugs and current state live here.

## Project Overview

Peakly is a **single-file React SPA** for discovering surf, ski, and beach spots when conditions and cheap flights align. It runs entirely in the browser with no build step — React and Babel are loaded via CDN and JSX is transpiled client-side.

- **Live:** https://j1mmychu.github.io/peakly/
- **Goal:** 100K+ downloads. Steve Jobs-level quality.
- **Owner:** Jack (jjciluzzi@gmail.com)
- **Top 3 categories at launch:** Surfing, Ski/Board, Beach. Other categories (climbing, MTB, hiking, kayak, dive, yoga, wellness) still scored but deprioritized.

## Architecture

```
peakly/
├── index.html               # Entry point — React 18, ReactDOM, Babel via CDN
├── app.jsx                  # Entire application (~11K lines of JSX)
├── CLAUDE.md                # THIS FILE — shared brain
├── CHANGELOG.md             # Historical shipped log + decisions
├── README.md                # User-facing docs
├── manifest.json            # PWA manifest
├── sw.js                    # Service worker (peakly-v14, push + caching)
├── sitemap.xml / robots.txt # SEO
├── capacitor.config.json    # iOS/Android wrapper config
├── package.json             # Capacitor CLI deps only
├── .github/workflows/deploy.yml  # Pages auto-deploy on push to main+master
├── server/                  # Node.js VPS proxy source (Travelpayouts + alerts)
├── peakly-native/           # Capacitor native project files
├── tasks/agents/            # Agent prompts (4 active, 10 paused)
└── reports/                 # Daily agent reports (older >7d in reports/archive/)
```

**No build step.** Babel Standalone transpiles JSX in the browser at runtime. No webpack, no Vite, no bundler, no ES module imports.

### Key Tech

- React 18 (UMD via unpkg), Babel Standalone 7.24.7
- Vanilla CSS injected via `<style>` tags
- Plus Jakarta Sans (Google Fonts CDN)
- No TypeScript in app.jsx; `package.json` exists only for Capacitor CLI
- Capacitor for native iOS/Android wrapper

### Infrastructure

- **Frontend:** GitHub Pages (push to `main` to deploy; `.github/workflows/deploy.yml` handles main + master)
- **Flight proxy:** Node.js on DigitalOcean VPS (198.199.80.21), Ubuntu 24, 1GB RAM, HTTPS via Caddy + Let's Encrypt
- **Proxy URL:** `https://peakly-api.duckdns.org` → reverse proxies to `localhost:3001`
- **Push:** SSH-only (`git@github.com:j1mmychu/peakly.git`)

## File Structure Inside `app.jsx`

1. Error monitoring & crash detection (~lines 1–66)
2. CSS injection (~lines 68–136)
3. Constants & data (~lines 138–950): `CATEGORIES`, `CONTINENTS`, `AP_CONTINENT`, `AIRPORTS`, `BASE_PRICES`, `VENUES` (3,726), `LOCAL_TIPS`, `PACKING`, `GEAR_ITEMS`, `AVATAR_COLORS`, weather code maps
4. Utility functions (~lines 950–1100): `useLocalStorage`, `fetchWeather`, `fetchMarine`, `fetchTravelpayoutsPrice`, `scoreVenue`, `scoreVibeMatch`, `buildFlightUrl`, `getTypicalPrice`, `getDealScore`
5. UI components (~lines 1100–4900)
6. App root + `ErrorBoundary` (~lines 4900–end)

### Tabs (3 visible, 5 built)

| Tab | Status |
|-----|--------|
| Explore | VISIBLE |
| Alerts | VISIBLE |
| Profile | VISIBLE |
| Wishlists | BUILT, HIDDEN |
| Trips | BUILT, HIDDEN |

Trips and Wishlists deferred until 1K users — keep nav lean.

## External APIs

| API | Endpoint | Auth | Purpose |
|-----|----------|------|---------|
| Open-Meteo Weather | `api.open-meteo.com/v1/forecast` | None | 7-day forecasts |
| Open-Meteo Marine | `marine-api.open-meteo.com/v1/marine` | None | Wave height, swell |
| Travelpayouts (via VPS proxy) | `peakly-api.duckdns.org/api/flights` | Server-side token | "from $X" pricing |
| Aviasales | Deep links with exact dates | N/A | Flight booking |

**Travelpayouts token is server-side only.** Never put it in client code.

## Data Storage

All client-side localStorage. No backend DB. Prefix all keys with `peakly_`.

| Key | Contents |
|-----|----------|
| `peakly_wishlists` | Saved favorite venues |
| `peakly_named_lists` | Named custom collections |
| `peakly_alerts` | Alert configs (`venueId`, `targetScore`, `maxPrice`) |
| `peakly_trips` | Saved trip plans |
| `peakly_profile` | Name, email, airports, sports, skills |
| `peakly_errors` / `peakly_perf` | Error log / perf metrics |

## Conventions

- Hooks only (`useState`, `useEffect`, `useRef`, `useCallback`)
- Custom hook: `useLocalStorage(key, initialValue)`
- Inline styles via `style={{...}}` objects (except animation classes)
- Font constant: `const F = "'Plus Jakarta Sans', sans-serif"` — use `F` everywhere
- Primary color: `#0284c7` (sky-600)
- CTA buttons: `#222` (dark, NOT blue — design decision 2026-03-23)
- Background: `#f5f5f5`
- Mobile-first with safe area insets
- Animation classes: `.bounce-in`, `.fade-in`, `.pulse`, `.shimmer`, `.sheet`, `.pill-selected`
- Section dividers: `// ─── section name ───`

### Scoring

`scoreVenue(venue, weather, marine, dayIndex)` returns a real-time score per category. Frozen until post-Reddit launch (PM v16, 2026-03-27). Do not modify the scoring algorithm without explicit approval.

## Important Notes for AI Assistants

1. **Single-file architecture** — all changes go in `app.jsx`. Do not split.
2. **No build step** — JSX must be valid for Babel Standalone. No `import`/`export`, no `require()`.
3. **CDN deps only** — add libraries via `<script>` in `index.html`.
4. **React APIs are global** — destructure from `React` at top of `app.jsx`.
5. **localStorage only** — prefix keys with `peakly_`.
6. **Travelpayouts token off the client** — always via VPS proxy.
7. **Mobile-first** — safe area insets matter.
8. **Test in browser** after changes — check console for Babel parse errors.
9. **Venue data is hardcoded** — `VENUES` array has **257 entries** (deduped to unique photos on 2026-04-10). Weather fetching is batched (50/2s) to avoid Open-Meteo rate limits. Cached in localStorage with 2hr TTL.
10. **Error boundary** wraps the app root with a fallback UI.
11. **Prior conversation context** — at session start, check `context/*.md` for relevant past discussions, design calls, decision rationale that didn't make it into CLAUDE.md or CHANGELOG.md. Most recent first.

## Current State (2026-04-10)

### What's Broken / Open (Priority Order)

1. **TP_MARKER still placeholder** — `app.jsx:5294` has `"YOUR_TP_MARKER"`. Soft-falls back to non-marker aviasales links (no crash), but every flight click earns $0 commission. 5-min Jack action: grab marker from Travelpayouts dashboard.
2. **`venue.facing ?? 270` swell bug (P1)** — defaults swell direction to 270 when missing; wrong for many venues. Needs data decision on correct default per region.
3. **Email capture has no backend (P1)** — fires `alert()` only, signups are lost. Needs Formspree/ConvertKit endpoint choice.
4. **Score vote buttons still rendered (P1)** — thumbs up/down still in JSX despite decision to CUT (2026-03-25). Needs search + remove pass.
5. **Emoji still in UI chrome (P1)** — decided CUT March 25. CATEGORIES pill emojis, LOCAL_TIPS leading emoji, Profile CTA still emoji. UX decision confirmed but not executed.
6. **Single-venue categories are UX-bad** — after scale-down, kayak/fishing/paraglide = 1 venue each; mtb = 2; diving/climbing/kite = 3 each. Users who pick these in onboarding get empty/broken feel. Decision: drop from CATEGORIES or keep.
7. **No onboarding scoring explanation** — new users dumped into Explore without context.
8. **Strike alerts server polling** — needs background worker that reads `_alerts` Map and fires push when a venue hits target.
9. **Sitemap hash fragments** — URLs use `#skiing` etc which search engines ignore. SEO routing decision.
10. **No SRI on CDN scripts** + **no CSP meta** — security hardening; medium risk to apply (could break inline styles or script eval).

### Recently Fixed (2026-04-10 cleanup pass)

- ✅ `fetchWeather` now retries on 429/5xx with backoff, returns null instead of throw
- ✅ Proxy: deduped rate limiter, added IATA regex validation, POST /api/alerts schema validation + cap
- ✅ Proxy: removed unused express-rate-limit dep
- ✅ index.html: pinned react/react-dom 18.3.1 (was floating @18)
- ✅ REI section removed from GEAR_ITEMS (22 dead $0 links)
- ✅ VENUES scaled 3,726 → 257 (unique-photo dedupe; app.jsx 1.97MB → 0.49MB)
- ✅ `.archive/` deleted (64K of April 7-9 QA snapshots)
- ✅ `.gitignore`: added `*.orig`, `*.rej`

### Open Pre-Launch Items

- iOS App Store: Apple Developer enrollment ($99/yr) + `npx cap add ios` + Xcode build
- Replace placeholder affiliate IDs (GetYourGuide, Backcountry — LLC approved)
- Register `peakly.app` domain
- Terms of Service / Privacy Policy
- Google Play Store via PWABuilder/TWA ($25)
- ListingCard "Book" button Plausible event

## Agent Team (Slim Roster)

Reduced from 14 → 4 active agents on 2026-04-10. Reports were filing into the void.

| Agent | File | Schedule |
|-------|------|----------|
| Product Manager | `tasks/agents/product-manager.md` | 9am daily |
| DevOps | `tasks/agents/devops.md` | 7am daily |
| UX Designer | `tasks/agents/ux-designer.md` | 11am daily |
| Revenue | `tasks/agents/revenue.md` | 12pm daily |

Paused: growth-lead, content-data, executive-briefing, qa-agent, data-enrichment, seo-analytics, competitor-watch, community-agent, code-quality. Re-enable post-launch when there's bandwidth to act on findings.

**Run any agent on demand:**
```bash
cd ~/peakly && claude "$(cat tasks/agents/product-manager.md)"
```

Reports → `reports/`. Anything older than 7 days → `reports/archive/`.

## Revenue Model

| Stream | Status | RPM (per 1K MAU) |
|--------|--------|------------------|
| Amazon Associates (`peakly-20`) | LIVE | $4.48 |
| Booking.com (`aid=2311236`) | LIVE | $6.90 |
| SafetyWing (`referenceID=peakly`) | LIVE | $0.54 |
| Travelpayouts (HTTPS proxy) | LIVE — needs TP_MARKER | $0.14 |
| REI (Avantlink signup pending) | $0 | +$6.16 |
| Backcountry / GetYourGuide | $0 | +$1.84 |
| Peakly Pro $79/yr | EMAIL WAITLIST | +$13.17 |

**Live RPM:** ~$12/month per 1K MAU. **Post-LLC RPM:** ~$33.

## Competitive Edge

| Competitor | Gap |
|-----------|-----|
| Surfline | Single sport, no flights |
| OnTheSnow / OpenSnow | Single sport, no flights |
| AllTrails | No conditions, no flights |
| KAYAK | Conditions-blind |
| Stormrider Surf | No real-time scoring, no flights, offline-static |

**Peakly's angle:** First app combining live conditions + real-time flights + AI vibe search across all adventure sports.

See `CHANGELOG.md` for full competitive intel.

## Vision (Short)

**"Know when to go."** Surfline tells you the conditions. Peakly tells you when the timing is right.

**Phased roadmap:**
1. Ship quality (NOW) — photos, polish, PWA, analytics, 1K users
2. The Window Score — proprietary single number combining conditions + flights + crowd + trend
3. Forecast Horizon — best 3-day window across next 60 days for any venue
4. Strike Missions — rare, opt-in, exceptional alignments
5. Multi-sport trip optimization
6. Group coordination
7. Crowd intelligence

**Strategic principles:**
- Niche down before expanding (win surf + ski before broadening)
- FOMO-first content ("the window most people missed")
- Photos before features
- PWA + SEO first, native later
- The Window Score is the moat

## Interaction Rules

- **Just do it.** Don't explain, ship.
- **Don't ask "should I...?" if obvious.** Just do it.
- **Only ask Y/N when you need a real decision** (design direction, $$$, destructive actions).
- **Don't teach git.** Handle git ops yourself. Give Jack one copy-paste: `push "description"`.
- **Read `reports/` and `tasks/` at session start.**
- **Update this file** when you make important decisions. Move historical noise to `CHANGELOG.md`.
- **Be concise. Action Bronson voice when chatting with Jack.**

## Do NOT Do

- Do NOT split `app.jsx` into multiple files
- Do NOT add a build step or bundler
- Do NOT use ES module imports
- Do NOT change localStorage key names
- Do NOT remove existing functionality
- Do NOT change the scoring algorithm (frozen until post-Reddit)
- Do NOT modify weather/flight API call structure
- Do NOT add npm dependencies
- Do NOT over-engineer — every fix is surgical
- Do NOT commit secrets, tokens, or API keys
