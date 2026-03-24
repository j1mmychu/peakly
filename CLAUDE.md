# CLAUDE.md — Peakly

## Project Overview

Peakly is a **single-file React SPA** for discovering surf, ski, and adventure spots when conditions and cheap flights align. It runs entirely in the browser with no build step — React and Babel are loaded via CDN and JSX is transpiled client-side.

**Live deployment:** GitHub Pages — https://j1mmychu.github.io/peakly/
**Goal:** 100K+ downloads. Steve Jobs-level quality. Every pixel matters.
**Owner:** Jack (jjciluzzi@gmail.com)

## Architecture

```
peakly/
├── index.html           # Entry point — React 18, ReactDOM, Babel via CDN
├── app.jsx              # Entire application (~5,413 lines of JSX)
├── app.jsx.bak          # Backup of previous version
├── CLAUDE.md            # THIS FILE — shared brain for all AI sessions
├── README.md            # User-facing documentation
├── tasks/
│   ├── agents/          # Agent prompts (run via Claude Code)
│   │   ├── product-manager.md
│   │   ├── growth-lead.md
│   │   ├── content-data.md
│   │   ├── devops.md
│   │   ├── ux-designer.md
│   │   ├── revenue.md
│   │   └── run-all.sh
│   ├── steve-jobs-spec.md
│   └── claude-code-spec.md
└── reports/             # Daily agent reports land here
```

**There is no build step.** No webpack, Vite, or bundler. Babel Standalone transpiles JSX in the browser at runtime.

### Key Technology Choices

- **React 18** (UMD via unpkg CDN) — hooks-based, no class components
- **Babel Standalone 7.24.7** — in-browser JSX transpilation
- **Vanilla CSS** — injected via `<style>` tags (in both `index.html` and top of `app.jsx`)
- **Plus Jakarta Sans** — primary font (Google Fonts CDN)
- **No TypeScript, no package.json, no node_modules**

### Infrastructure

- **Frontend:** GitHub Pages (static, push to `main` to deploy)
- **Flight proxy:** Node.js on DigitalOcean VPS (104.131.82.242:3001), Ubuntu 24, 1GB RAM
- **VPS runs HTTP** — HTTPS not yet configured. Mixed content blocks flight prices in browsers.
- **SSH-only git push** from Mac (`git@github.com:j1mmychu/peakly.git`)

## File Structure Inside app.jsx

The single file is organized in this order:

1. **Error monitoring & crash detection** (lines 1–66) — Sentry-lite logger, global error/rejection handlers, performance tracking
2. **CSS injection** (lines 68–136) — animations, tap states, input styles
3. **Constants & data** (~lines 138–950) — `CATEGORIES`, `CONTINENTS`, `AP_CONTINENT`, `AIRPORTS`, `BASE_PRICES`, `VENUES` (~170+ venues), `LOCAL_TIPS`, `PACKING`, `GEAR_ITEMS`, `AVATAR_COLORS`, weather code maps
4. **Utility functions** (~lines 950–1100) — `useLocalStorage()` hook, `fetchWeather()`, `fetchMarine()`, `fetchTravelpayoutsPrice()`, `scoreVenue()`, `scoreVibeMatch()`, `buildFlightUrl()`
5. **UI Components** (~lines 1100–4900) — all React components
6. **App root & ErrorBoundary** (~lines 4900–5413) — root component, ReactDOM render

### Main Tabs (currently 3 visible, 5 built)

| Tab | Component | Status | Purpose |
|-----|-----------|--------|---------|
| Explore | `ExploreTab` | VISIBLE | Browse/filter venues by category with live scoring |
| Wishlists | `WishlistsTab` | BUILT, HIDDEN | Saved venues and named collections |
| Alerts | `AlertsTab` | VISIBLE | Condition-based alerts for venues |
| Trips | `TripsTab` | BUILT, HIDDEN | AI trip builder, saved trips, vibe search |
| Profile | `ProfileTab` | VISIBLE | User settings, onboarding, home airport |

**ACTION NEEDED:** Trips and Wishlists tabs exist in the code but are not wired into BottomNav. Expose them.

### Key Components

- `ListingCard`, `FeaturedCard`, `CompactCard` — venue display variants
- `SearchSheet` — filters & criteria overlay
- `VibeSearchSheet` — AI text-based venue matching
- `VenueDetailSheet` — detailed venue view with weather, flights, tips
- `TripBuilderSheet` — AI trip planner
- `BottomNav` — fixed bottom tab navigation (currently only 3 tabs)
- `OnboardingSheet` — first-time profile setup
- `ErrorBoundary` — catches render errors with fallback UI

## External APIs

| API | Endpoint | Auth | Purpose |
|-----|----------|------|---------|
| Open-Meteo Weather | `api.open-meteo.com/v1/forecast` | None (free) | 7-day weather forecasts |
| Open-Meteo Marine | `marine-api.open-meteo.com/v1/marine` | None (free) | Wave height, swell data |
| Travelpayouts (via proxy) | `104.131.82.242:3001/api/flights` | Server-side token | Flight pricing |
| Google Flights | Deep links only | N/A | Flight search URLs |

**Important:** The Travelpayouts API token is kept server-side on a VPS proxy — never expose it in client code.

## Data Storage

All persistence is **client-side localStorage only**. No backend database.

| Key | Contents |
|-----|----------|
| `peakly_wishlists` | Saved favorite venues |
| `peakly_named_lists` | Named custom collections |
| `peakly_alerts` | User alert configurations |
| `peakly_trips` | Saved trip plans |
| `peakly_profile` | User profile (name, email, airports, sports, skills) |
| `peakly_errors` | Error log (max 50 entries) |
| `peakly_perf` | Performance metrics |

## Development Workflow

### Running Locally

No install required. Just open `index.html` in a browser or use any static server:

```bash
python3 -m http.server 8000
```

### Making Changes

1. Edit `app.jsx` — all application code lives here
2. Refresh the browser — Babel re-transpiles automatically
3. Check the browser console for errors

### Deploying

Jack has a shell alias: `push "message"` — this stages, commits, and pushes to main in one command. GitHub Pages auto-deploys.

### No Linting, Testing, or CI

- No ESLint, Prettier, or formatter configured
- No test framework
- No CI/CD pipelines
- No `.gitignore` file

## Conventions & Patterns

### React Patterns

- **Hooks only** — `useState`, `useEffect`, `useRef`, `useCallback`
- **Custom hook:** `useLocalStorage(key, initialValue)` for persistent state
- **Inline styles** — components use `style={{...}}` objects, not CSS classes (except for animation classes)
- **Conditional rendering** — tab content rendered based on active tab state

### Styling

- Font constant: `const F = "'Plus Jakarta Sans', sans-serif"` — use `F` everywhere
- Primary color: `#0284c7` (sky-600)
- CTA buttons: `#222` (dark, not blue — design decision made 2026-03-23)
- Background: `#f5f5f5`
- Mobile-first with safe area insets for notch support
- Animation classes: `.bounce-in`, `.fade-in`, `.pulse`, `.shimmer`, `.sheet`, `.pill-selected`
- All interactive elements have `:active` scale transforms for tactile feedback

### Code Style

- No semicolons in some places, semicolons in others (inconsistent — match surrounding code)
- Template literals for string interpolation
- Arrow functions throughout
- Destructured props
- Comments use `// ─── section name ───` divider style for major sections

### Scoring System

`scoreVenue(venue, weather, marine)` computes a real-time condition score per category:
- **Skiing:** snow depth, temperature, wind, fresh snow
- **Surfing:** wave height, swell period, wind, water temperature
- **Tanning/Beach:** UV index, temperature, clear skies, wind

Scores drive venue ranking and badge display (e.g., "Epic", "Firing", "Perfect Tan").

## Important Notes for AI Assistants

1. **Single file architecture** — all changes go in `app.jsx`. Do not split into multiple files unless explicitly asked.
2. **No build step** — code must be valid JSX that Babel Standalone can transpile. No imports/exports, no ES modules, no `require()`.
3. **CDN dependencies only** — React, ReactDOM, and Babel are loaded via `<script>` tags in `index.html`. To add a library, add a CDN `<script>` tag.
4. **All React APIs are global** — destructure from `React` directly at the top of `app.jsx` (e.g., `const { useState } = React`). Do not use `import`.
5. **localStorage is the only persistence** — prefix all keys with `peakly_`.
6. **Keep the Travelpayouts API token off the client** — always use the VPS proxy.
7. **Mobile-first design** — all UI should work well on phone screens. Use safe area insets.
8. **Test in browser** — after changes, verify by opening in a browser. Check console for Babel parse errors.
9. **Venue data is hardcoded** — the `VENUES` array contains ~170+ entries with coordinates, airport codes, categories, ratings, etc.
10. **Error boundary exists** — `ErrorBoundary` wraps the app root and provides a fallback UI.

---

## Current State (Updated 2026-03-24)

### What's Been Shipped

- Travelpayouts token migrated to VPS proxy (no secrets in client code)
- Flight price fallback with "est." labels when proxy fails
- City name display (AIRPORT_CITY lookup) in search bar and hero
- Category pills with venue counts
- Hero card with "Your Best Window Right Now" + View Details CTA
- Auto-refresh weather every 10 minutes
- OG meta tags added to index.html
- Tanning category fixed in CATEGORIES array
- Affiliate links updated for Booking.com, SafetyWing
- Share URLs updated to use peakly.app domain
- All 171 venue photos added (Unsplash URLs) to VENUES array
- Card components (CompactCard, ListingCard, FeaturedCard) updated with conditional photo rendering
- GuidesTab added with featured cards and photo support
- Guides tab wired into BottomNav (4th tab)
- UX polish: score badge borders removed, card padding fixed, similar venues photos
- 7-agent automated team created (daily Cowork scheduled tasks)
- Agent prompts written and stored in tasks/agents/
- CLAUDE.md established as shared brain across all sessions
- .nojekyll file added and pushed to fix GitHub Pages deployment
- Cache-busting query param on app.jsx script tag
- Swipe-down-to-dismiss gesture on VenueDetailSheet (touch drag > 120px closes)
- Date-aware condition scoring (scoreVenue accepts dayIndex, scores use selected day's forecast)
- Best Window indicator on ListingCard and CompactCard (shows peak day from 7-day forecast)
- Profile-based hero card personalization (boosts user's preferred sports by 15 points)
- Alert region/continent filter (UI + matching logic using AP_CONTINENT)
- Alert date range filter (UI + matching logic, fires only when today is within travel window)
- Flight API error handling improved (5s timeout, status tracking, "Estimated prices" banner)
- 22 new US domestic airports added (CLT, IND, CVG, TUS, OKC, MEM, SDF, PBI, SYR, PWM, GRR, DSM, ICT, LIT, TUL, BOI, GEG, BHM, RIC, ORF, GSP)
- AIRPORT_CITY lookup expanded with ~40 new entries

### What's Broken / Missing (Priority Order)

1. **LLC approval pending** — Blocking Stripe integration (Peakly Pro), affiliate program signups (Amazon Associates, GetYourGuide, REI), and domain registration (peakly.app).
2. **HTTPS not configured on VPS** — Mixed content blocks live flight prices. Need Cloudflare or Let's Encrypt + nginx.
3. **Placeholder affiliate IDs** — REI, Amazon, GetYourGuide links use "AFFILIATE_ID" placeholder. Blocked by LLC approval.
4. **No analytics** — No GA4 or Plausible. Can't measure anything. Not blocked — can add now.
5. **No PWA manifest** — Can't install to home screen on mobile. Not blocked — can add now.
6. **No onboarding flow** — New users get dumped into Explore with no explanation of scoring. Not blocked — can build now.
7. **Peakly Pro is a UI mockup** — $79/year button does nothing. Blocked by LLC + Stripe setup.
8. **Trips + Wishlists tabs** — Built but still hidden in BottomNav. Guides tab was added instead. Need to decide: add all 5 tabs or keep it lean.

### Decisions Made (2026-03-23 / 2026-03-24)

- **Photos before features.** A polished app with fewer features beats a feature-rich app that looks unfinished.
- **PWA + SEO first, native apps later.** Validate with 1K web users before investing in React Native.
- **Peakly Pro pricing: $79/year** (not $9/month). Matches AllTrails Peak, converts better.
- **CTA buttons use #222 (dark)** not blue. Feels more premium.
- **Remove emoji from UI chrome.** Emoji in category pills, section headers, and badges look amateur. Clean text + SVG only.
- **"windows available" to "spots"** — nobody understands "windows."
- **Jekyll was breaking deploys.** Added .nojekyll to bypass Jekyll on GitHub Pages. All future deploys will serve static files directly.
- **Critical UX fixes first, expansion later.** Ship swipe gestures, date-aware scoring, airport coverage, alert filters, best window display before expanding to 400 ski towns or Epic/Ikon integration.
- **Cowork for vision/design/strategy, Claude Code for large codebase overhauls.** Use Cowork scheduled agents for daily monitoring and mobile-friendly check-ins. Use Claude Code for multi-hundred-line refactors.

### Pre-Launch Checklist (Ordered)

1. [x] Add venue photos (Unsplash URLs) — all 171 venues done
2. [x] Update card components to render photos — CompactCard, ListingCard, FeaturedCard, GuidesTab done
3. [x] Create agent team + scheduled tasks — 7 agents + Chief of Staff briefing running daily
4. [x] Push .nojekyll file + cache-busting fix — deployed, GitHub Pages working
5. [x] Swipe-down dismissal on venue detail sheet
6. [x] Date-aware condition scoring + best window display on cards
7. [x] Profile-based hero personalization
8. [x] Alert region + date filters (UI + matching logic)
9. [x] All domestic US airports added (22 new)
10. [x] Flight API error handling + status indicator
11. [ ] Add PWA manifest + service worker basics
12. [ ] Add GA4 analytics
13. [ ] Build onboarding flow for new users
14. [ ] Configure HTTPS on VPS (Cloudflare or Let's Encrypt)
15. [ ] **LLC approval** — unblocks: Stripe, affiliate signups, domain
16. [ ] Replace placeholder affiliate IDs with real ones (needs LLC)
17. [ ] Launch Peakly Pro with Stripe ($79/year) (needs LLC)
18. [ ] Reddit + TikTok launch campaign

### Phase 2 — Expansion (After Launch)

- Expand venue list to 400 ski towns worldwide
- Epic/Ikon/Independent pass integration + filter
- Enhanced search with autocomplete, recent searches, trending destinations
- Peakly Pro features: extended forecasts, strike missions, historical data
- Group trip coordination
- Crowd intelligence estimates

### Blocked by LLC

These items cannot proceed until the LLC is approved:
- Stripe/Paddle integration for Peakly Pro subscriptions
- Amazon Associates signup (requires business entity)
- GetYourGuide affiliate signup
- REI affiliate signup
- peakly.app domain registration (if doing it under business name)
- Terms of Service / Privacy Policy (need legal entity)

### Not Blocked — Can Ship Now

These items can be worked on immediately:
- PWA manifest + service worker
- GA4 / Plausible analytics
- Onboarding flow for new users
- HTTPS on VPS (Let's Encrypt)
- UI polish (emoji removal, "spots" label, etc.)
- Expose Trips + Wishlists tabs

---

## Agent Team

Peakly has 7 automated agents that run daily via Cowork scheduled tasks and can be run on-demand via Claude Code. Prompts are in `tasks/agents/`.

| Agent | File | Schedule | Purpose |
|-------|------|----------|---------|
| DevOps | devops.md | 7am | Uptime, health checks, security, HTTPS |
| Content & Data | content-data.md | 8am | Venue quality, gaps, seasonal picks |
| Product Manager | product-manager.md | 9am | Bugs, priorities, ship decisions |
| Growth Lead | growth-lead.md | 10am | Competitors, distribution, retention |
| UX Designer | ux-designer.md | 11am | Visual audit, polish, code fixes |
| Revenue | revenue.md | 12pm | Affiliates, Pro pricing, monetization |
| Chief of Staff | (Cowork only) | 2pm | Executive briefing combining all reports |

**Run any agent from Claude Code:**
```bash
cd ~/peakly && claude "$(cat tasks/agents/product-manager.md)"
```

**Reports go to:** `reports/` folder

---

## Revenue Model

| Stream | Status | Est. Revenue per 1K Users/Month |
|--------|--------|-------------------------------|
| Travelpayouts (flights) | ACTIVE (via proxy) | $15–25 |
| Booking.com (hotels) | ACTIVE (links exist) | $20–40 |
| SafetyWing (insurance) | ACTIVE (links exist) | $8–15 |
| Amazon Associates (gear) | PLACEHOLDER IDs | $10–20 |
| GetYourGuide (experiences) | PLACEHOLDER IDs | $5–15 |
| Peakly Pro ($79/year) | UI MOCKUP ONLY | $13/mo at 2% adoption |

**Total estimated RPM:** $71–128/month per 1,000 users
**At 100K users:** $300K–$400K/year

---

## Competitive Landscape

| Competitor | Focus | Users | Peakly's Advantage |
|-----------|-------|-------|-------------------|
| Surfline | Surf forecasts + HD cams | 500K+ | Multi-sport + flights |
| OnTheSnow | Ski conditions + reports | 200K+ | Multi-sport + flights |
| AllTrails | Hiking trails + maps | 5M+ downloads | Live conditions + flights |
| FATMAP | 3D topo + backcountry | 100K+ | Flight deals + conditions |
| KAYAK | Flight search | 50M+ | Adventure-specific + conditions |

**Peakly's unique angle:** First app combining live conditions + real-time flights + AI vibe search across ALL adventure sports.

---

## Growth Strategy

**Phase 1 (Weeks 1–2): Foundation**
- Fix PWA + meta tags + analytics
- Tell 10 friends, collect feedback

**Phase 2 (Weeks 2–4): Soft Launch**
- Reddit (r/solotravel, r/skiing, r/surfing)
- Expected: 200–500 users

**Phase 3 (Weeks 4–6): Influencer**
- DM 15 micro-influencers on TikTok
- Expected: 300–600 users

**Phase 4 (Weeks 6–8): Content**
- Blog post + travel community outreach
- Expected: 500–2,000 users

**90-Day Target:** 2,500–3,500 users

---

## Interaction Rules (IMPORTANT)

- **Just do it.** If you can do the work yourself, do it. Don't explain what needs to happen — make it happen.
- **Never ask "should I...?" if the answer is obvious.** Just do it and show the result.
- **Only ask Y/N questions** when you genuinely need a decision from Jack (e.g., design direction, spending money, destructive actions).
- **Don't teach git.** Jack doesn't want to learn git commands. Handle all git operations yourself. If you can't push, give Jack ONE copy-paste command: `push "description"` — nothing else.
- **Ship > discuss.** Bias toward action. Write the code, make the edit, fix the bug. Summarize what you did after, not before.
- **Read reports/ and tasks/ at session start.** Other agents may have left findings or decisions. Respect them.
- **Update this CLAUDE.md** when you make important decisions or discover new patterns. This file is the shared brain.
- **Keep Claude Code on a leash.** When giving specs to Claude Code, always include a "Do NOT Do" section.

## Do NOT Do

- Do NOT split app.jsx into multiple files
- Do NOT add a build step or bundler
- Do NOT use ES module imports
- Do NOT change localStorage key names
- Do NOT remove any existing functionality
- Do NOT change the scoring algorithm
- Do NOT modify the weather/flight API call structure
- Do NOT add npm dependencies
- Do NOT over-engineer — each fix should be surgical
- Do NOT commit secrets, tokens, or API keys

---

## Vision — Where Peakly Is Going

**Read this section before making any product decisions. Every feature, every design choice, every growth tactic should serve this vision.**

### What Peakly Actually Is

Peakly is not a travel app. It is a **decision intelligence platform for people who organize their lives around outdoor conditions.** Adventure travelers spend more per trip than any other travel category, have higher brand loyalty, and are dramatically underserved by the current combination of generic OTAs and single-sport conditions apps.

The company that builds the conditions-aware travel intelligence layer — combining real-time data, forecast modeling, flight pricing, and social coordination into a single trusted platform for adventure travelers — does not yet exist at scale.

### Core Positioning

**"Know when to go."**

Surfline tells you what the conditions are. Peakly tells you **when the timing is right.** That's the distinction. Not "know before you go" — "know WHEN to go."

### Product Roadmap (Phased)

**Phase 1 — Ship Quality (NOW)**
Photos, polish, PWA, analytics. Make the existing app Steve Jobs good. Launch to first 1K users.

**Phase 2 — The Window Score**
Combine conditions + flight price + weather trend + crowd estimate into one proprietary number. A Window Score of 92 means everything is aligned. A Window Score of 34 means wait. This becomes Peakly's signature metric — the thing users quote to friends.

**Phase 3 — Forecast Horizon**
Show the best 3-day window across the next 60 days for any venue. "Whistler's peak window this season: Feb 14–16. Snowfall forecast: 38 inches. Flights: $210–240." This is the feature that makes Peakly irreplaceable for people who plan ahead. It's defensible — requires real data science.

**Phase 4 — Strike Missions**
Highest-urgency notification tier. Fires only for truly exceptional, rare alignments. "STRIKE MISSION: Mavericks is breaking at 25+ feet for the first time in 3 years. Flights from SFO: $89. Window: This Saturday only." Opt-in, rare (2–3 per year per activity), feels like being part of an insider network.

**Phase 5 — Multi-Sport Trip Optimization**
Given your home airport, available weeks, and activity preferences — what is your optimal adventure calendar? "Your best 4 trips this year: Whistler Feb, Pipeline April, Yosemite June, Baja October." No app does this.

**Phase 6 — Peakly for Groups**
Group coordination layer. Shareable trip windows where multiple users see the same conditions + prices, vote on destinations, coordinate overlapping availability. Every shared link is an acquisition moment.

**Phase 7 — Crowd Intelligence**
Surface crowd level estimates alongside conditions. A 95/100 score at a world-famous break with 200 other surfers is worse than 80/100 at a quieter spot. Estimate from social media activity, search trends, holiday patterns.

### Business Model Expansion

**Near-term:**
- Peakly Pro ($79/year) — extended forecasts, strike missions, historical data
- Affiliate expansion — contextual gear recs (REI, Backcountry, Evo), experiences (GetYourGuide), hotels (Booking.com), insurance (SafetyWing)

**Medium-term:**
- Peakly for Operators ($99/month) — sell conditions + booking intelligence to ski resorts, surf camps, dive operators
- Peakly Professional ($199/year) — for adventure travel guides and instructors who plan trips for clients

**Long-term:**
- Data licensing — aggregated behavioral data (watched destinations, price thresholds, alert triggers) valuable to airlines, OTAs, outdoor brands
- White-label partnerships — conditions widget for REI, airlines, credit card travel portals. The Hopper Technology Solutions playbook.

### Strategic Principles

1. **Niche down before expanding.** Win skiers and surfers completely before adding climbing, diving, kayaking. These are the two largest, most travel-oriented, most gear-obsessed adventure communities.
2. **FOMO-first content strategy.** Document windows that opened and closed while people were deciding. "Whistler had its best powder week in 7 years last February. Flights from LAX were $189. It lasted 4 days. Most people didn't know."
3. **Photos before features.** A polished app with fewer features beats a feature-rich app that looks unfinished.
4. **PWA + SEO first, native apps later.** Validate with 1K web users before React Native.
5. **The Window Score is the moat.** No competitor has a single combined metric for conditions + flights + crowd + timing. Build this and own it.

### The Competition Gap

| App | What They Do | What They Miss |
|-----|-------------|---------------|
| Surfline | Surf forecasts + HD cams | Single sport. No flights. No trip planning. |
| OnTheSnow | Ski conditions + reports | Single sport. No flights. No booking. |
| AllTrails | Hiking trails + maps | Domestic focus. No conditions. No flights. |
| FATMAP | 3D topo + backcountry | Niche. No conditions intelligence. No flights. |
| KAYAK | Flight search | Sport-agnostic. Conditions-blind. |
| Hopper | Flight prediction | No conditions awareness. No adventure focus. |

**Peakly's window is open. The conditions are right.**
