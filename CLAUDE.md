# CLAUDE.md — Peakly

## Project Overview

Peakly is a **single-file React SPA** for discovering surf, ski, and adventure spots when conditions and cheap flights align. It runs entirely in the browser with no build step — React and Babel are loaded via CDN and JSX is transpiled client-side.

**Live deployment:** GitHub Pages (static hosting, push to `main` to deploy)

## Architecture

```
peakly/
├── index.html      # Entry point — loads React 18, ReactDOM, Babel via CDN
├── app.jsx         # Entire application (~5,057 lines of JSX)
├── app.jsx.bak     # Backup of previous version
├── README.md       # User-facing documentation
└── CLAUDE.md       # This file
```

**There is no build step.** No webpack, Vite, or bundler. Babel Standalone transpiles JSX in the browser at runtime.

### Key Technology Choices

- **React 18** (UMD via unpkg CDN) — hooks-based, no class components
- **Babel Standalone 7.24.7** — in-browser JSX transpilation
- **Vanilla CSS** — injected via `<style>` tags (in both `index.html` and top of `app.jsx`)
- **Plus Jakarta Sans** — primary font (Google Fonts CDN)
- **No TypeScript, no package.json, no node_modules**

## File Structure Inside app.jsx

The single file is organized in this order:

1. **Error monitoring & crash detection** (lines 1–66) — Sentry-lite logger, global error/rejection handlers, performance tracking
2. **CSS injection** (lines 68–136) — animations, tap states, input styles
3. **Constants & data** (~lines 138–950) — `CATEGORIES`, `CONTINENTS`, `AP_CONTINENT`, `AIRPORTS`, `BASE_PRICES`, `VENUES` (235+ venues), `LOCAL_TIPS`, `PACKING`, `GEAR_ITEMS`, `AVATAR_COLORS`, weather code maps
4. **Utility functions** (~lines 950–1100) — `useLocalStorage()` hook, `fetchWeather()`, `fetchMarine()`, `fetchTravelpayoutsPrice()`, `scoreVenue()`, `scoreVibeMatch()`, `buildFlightUrl()`
5. **UI Components** (~lines 1100–4900) — all React components
6. **App root & ErrorBoundary** (~lines 4900–5057) — root component, ReactDOM render

### Main Tabs (5)

| Tab | Component | Purpose |
|-----|-----------|---------|
| Explore | `ExploreTab` | Browse/filter venues by category with live scoring |
| Wishlists | `WishlistsTab` | Saved venues and named collections |
| Alerts | `AlertsTab` | Condition-based alerts for venues |
| Trips | `TripsTab` | AI trip builder, saved trips, vibe search |
| Profile | `ProfileTab` | User settings, onboarding, home airport |

### Key Components

- `ListingCard`, `FeaturedCard`, `CompactCard` — venue display variants
- `SearchSheet` — filters & criteria overlay
- `VibeSearchSheet` — AI text-based venue matching
- `VenueDetailSheet` — detailed venue view with weather, flights, tips
- `TripBuilderSheet` — AI trip planner
- `BottomNav` — fixed bottom tab navigation
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
# Python
python3 -m http.server 8000

# Node
npx serve .
```

### Making Changes

1. Edit `app.jsx` — all application code lives here
2. Refresh the browser — Babel re-transpiles automatically
3. Check the browser console for errors

### Deploying

Push to `main` branch → GitHub Pages automatically serves the updated files.

### No Linting, Testing, or CI

- No ESLint, Prettier, or formatter configured
- No test framework (Jest, Vitest, Playwright, etc.)
- No CI/CD pipelines (GitHub Actions, etc.)
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
9. **Venue data is hardcoded** — the `VENUES` array contains 235+ entries with coordinates, airport codes, categories, ratings, etc.
10. **Error boundary exists** — `ErrorBoundary` wraps the app root and provides a fallback UI.

## TODOs in Codebase

- Line 6: `SENTRY_DSN = ""` — add Sentry DSN after signup
- Line ~3786: Replace `AFFILIATE_ID` placeholders with real affiliate IDs (REI, Backcountry)

## Planned Features (from README roadmap)

- Hotel affiliate links (Booking.com)
- Trip insurance CTA (World Nomads)
- Peakly Pro subscription tier
- Push notifications for alerts
