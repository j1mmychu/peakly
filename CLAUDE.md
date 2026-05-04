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
├── app.jsx                  # Entire application (~7K lines of JSX)
├── CLAUDE.md                # THIS FILE — shared brain
├── CHANGELOG.md             # Historical shipped log + decisions
├── README.md                # User-facing docs
├── manifest.json            # PWA manifest
├── sw.js                    # Service worker (peakly-20260414b, push + caching)
├── sitemap.xml / robots.txt # SEO
├── capacitor.config.json    # iOS/Android wrapper config
├── package.json             # Capacitor CLI deps only
├── .github/workflows/deploy.yml  # Pages auto-deploy on push to main+master
├── server/                  # Node.js VPS proxy source (Travelpayouts + alerts)
├── peakly-native/           # Capacitor native project files
├── tasks/agents/            # 5 input agents + daily-briefing (canonical prompts)
└── reports/
    ├── briefings/           # ONE file/day from daily-briefing agent — read this first
    ├── inputs/              # Raw daily reports from the 5 input agents (5 files/day)
    ├── ready-to-ship/       # Sub-15-min diffs the agents prepared for paste
    ├── known-skipped.md     # Findings the agents agreed to stop reporting
    └── archive/             # >7-day-old reports
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
3. Constants & data (~lines 138–950): `CATEGORIES`, `CONTINENTS`, `AP_CONTINENT`, `AIRPORTS`, `BASE_PRICES`, `VENUES` (231), `AVATAR_COLORS`, weather code maps
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
9. **Venue data is hardcoded** — `VENUES` array has **231 entries** (3 launch categories only: skiing, surfing, tanning). Weather fetching is batched (50/2s) to avoid Open-Meteo rate limits. Cached in localStorage with 2hr TTL.
10. **Error boundary** wraps the app root with a fallback UI.
11. **Prior conversation context** — at session start, check `context/*.md` for relevant past discussions, design calls, decision rationale that didn't make it into CLAUDE.md or CHANGELOG.md. Most recent first.

## Current State (2026-05-03)

### What's Broken / Open (Priority Order)

1. **Repo divergence — 18 days no commits** (last: a9a01e3, 2026-04-15). Working tree had real fixes (proxy.js dedupe + state notes) sitting unshipped. Cleared 2026-05-03.
2. **Amazon gear gate `{false && ...}` at app.jsx:5728** — leaks ~$11/mo/1K MAU. Open since 2026-04-10 (Day 23+).
3. **Marine batch loader at app.jsx:6748** — `needsMarine` only checks surfing; tanning venues score without water-temp data on Explore list. One-token fix. Open since 2026-04-10.
4. **No onboarding scoring explanation** — new users dumped into Explore without context for how conditions + "window" scoring works.
5. **Strike alerts server polling** — `/api/alerts` endpoint registers, but no background worker reads `_alerts` Map and fires push when venue hits target.
6. **No SRI on CDN scripts** + **no CSP meta** — security hardening; medium risk to apply (could break Babel inline eval). Flagged but not touched.

### Recently Fixed (2026-05-03 — repo cleanup)

- ✅ **18 days of working-tree drift cleared** — committed proxy.js dedupe (removed dead duplicate `/api/waitlist` handler at HEAD line 335; canonical handler is line ~312) + 5 untracked agent reports (devops/pm/revenue/ux 5/3, devops 5/1).
- ✅ **Reports archived** — 73 files older than 7 days moved to `reports/archive/` per the >7d rule. `reports/` now contains only the active recent files.

### Recently Fixed (2026-04-15 — proxy cleanup)

- ✅ **Duplicate `require()` in proxy.js** — `fs` and `path` were required twice (lines 5-6 and 232-233). Removed duplicates. No runtime impact.

### Recently Fixed (2026-04-14 — 18 algorithm holes)

**7 holes (commit 4475f3a):**
- ✅ **Day-index fallback silently used today's data for future days** — `d.X?.[0]` fallback returned Tuesday's weather when asking about Saturday. Replaced with strict `at(arr)` helper returning null when out of range.
- ✅ **gustFactor false-triggered on calm days** — wind=2 + gusts=5 = ratio 2.5 triggered "erratic gusts" penalty. Now only computes gust factor when wind >= 8mph.
- ✅ **Windswell-dominant surf scored too high** — windWaveH > 1.5x swellH now hard-caps score at 38; > 0.9x caps at 55.
- ✅ **bigWaveBreak detection only checked tags** — Pipeline, Jaws, Mavericks missed. Now scans id + title + tags. Added more iconic breaks to regex.
- ✅ **Wet-snow false powder bonus** — snow > 0 + tempMax > 36°F was slush, not powder. Capped at 75, added "wet/heavy" label.
- ✅ **Trend awareness added** — fading swell (yesterday > today + tomorrow lower) → "Tail end — last shot" / "Firing but fading — go AM" labels. Ski storm fading also labeled.
- ✅ **Tanning cloud_cover_max added to fetchWeather** — was never requested. 80%+ cloud → -6, 60%+ → -3, ≤15% bluebird → +2. Fixes inflated scores on grey days with "mainly clear" wCode.
- ✅ Cache bump 20260412a → 20260414a.

**11 holes (commit 4cd0f6c):**
- ✅ **Freezing rain (wCode 66/67) treated as regular rain** — now -28 ski penalty + "FREEZING RAIN — DO NOT ski" label.
- ✅ **Thunderstorms ignored for skiing + surfing** — now: ski -22 (lifts evacuated), surf -30 ("Lightning — out of the water"). Hail gets additional -6 ski penalty.
- ✅ **Surfing wind direction defaulted to 0 (north) when missing** — computed phantom offshore/onshore against ghost data. Now falls back to speed-only scoring.
- ✅ **Bluebird powder bonus added** — snow >= 8cm + tempMax < 32°F + sunny (wCode ≤ 1) → +6 "Bluebird powder — perfect day." Was scoring same as overcast powder.
- ✅ **Fading swell now drops score 5pts** — yesterday 8ft + today 4ft + tomorrow 2ft was getting same score as steady 4ft.
- ✅ **Snowmaking floor differentiated by season** — peak → 35, shoulder → 25, off-season → 15. Was 35 flat.
- ✅ **NWS official wind chill formula** — replaces rough `tempMax - wind*0.7`. Old formula overestimated chill and triggered false penalties.
- ✅ **Tighter beach wind band** — 22mph "umbrella-flipping zone" added between 18 and 25mph thresholds.
- ✅ **likelyRain detection for beach** — precip < 1mm + precipPct > 70% now penalizes -16. Fixes 0mm/90%-probability scattered showers scored as clear.
- ✅ **Heavy snow labels visibility warning** — wCode 75/86 surfaces "heavy snow · flat light" label. Score stays high (powder!) but user warned.
- ✅ Cache bump 20260414a → 20260414b.

### Recently Fixed (2026-04-12 — 7 algorithm holes)

- ✅ **Marine data missing → surfing scored "flat" dishonestly** — was asserting score 22 when marine data simply wasn't available. Now returns score 50 "Swell data unavailable" instead of lying about conditions.
- ✅ **Beach marine data was NEVER FETCHED** — `needsMarine` only checked surfing category. Water temp scoring was dead code for beaches. Now fetches marine for both surfing and tanning.
- ✅ **Skiing had no season awareness** — a resort in July with residual snowpack scored 72. Now checks month vs hemisphere: off-season → score 8 "Off-season — resort closed." Shoulder months capped unless real snow.
- ✅ **Spring skiing penalty was wrong** — 42°F with 200cm base scored as "slush" when it's excellent corn skiing. Warm-temp penalty now gated on base depth.
- ✅ **bestDays counter treated snow as BAD for skiing** — precip > 3mm = "bad day" hit powder days. A 4-day storm showed bestDays = 1. Now category-aware: snow days count as good for skiing.
- ✅ **Heat index ignored for beach** — 90°F at 90% humidity vs 40% scored the same. Added humidity penalty (dangerous: -12, oppressive: -7, sticky: -3).
- ✅ **Snowmaking floor added** — during ski season, resorts with 0 natural snowpack get score 35 (not 20) since most resorts make snow.
- ✅ Cache bump 20260411a → 20260412a.

### Recently Fixed (2026-04-11 accuracy + honesty pass)

- ✅ **Surfing wind direction was INVERTED** — was comparing wind to swell direction; offshore is relative to the break's FACING. Now uses `venue.facing + 180` for offshore bearing. Glassy / offshore / cross / onshore penalties calibrated. This was making clean offshore days score worse than blown-out onshore days.
- ✅ **Skiing penalized heavy snow as "low visibility"** — `wCode >= 65` hit snow codes 71-77. Now splits rain (penalty) from snow (no penalty). Added wind chill component and tuned snow-depth curve.
- ✅ **Tanning wind thresholds were too forgiving** — beach is uncomfortable at 13mph, miserable at 18mph. Tightened. Added water temperature bonus/penalty when marine data is fetched.
- ✅ **Flight pricing was fabricating deals** — `getFlightDeal` returned a pseudo-random 28–75% "discount" off BASE_PRICES when Travelpayouts hadn't responded yet. Users saw "$180 · 60% off" on venues where no real data existed. Now returns the honest typical price, `pct: 0`, `isEstimate: true`.
- ✅ **`getTypicalPrice` used euclidean degrees** from a hardcoded "central US" point, ignoring home airport entirely. Rewrote to look up `BASE_PRICES[venue.ap]?.[homeAirport]` with region-pair fallback. Single source of truth shared with `getFlightDeal`.
- ✅ **UI price badges now gated on `flight.live`** — "X% off" and the strikethrough typical only render when data is real AND pct >= 10. When estimate: shows "~$X typical" in muted color.
- ✅ **Best-right-now filter** now passes homeAirport to `getDealScore` and excludes estimates from the deal threshold.
- ✅ **Insider Tips section removed** from VenueDetailSheet (LOCAL_TIPS const + PACKING const deleted — both were orphaned after).
- ✅ **"You'd also like"** moved to bottom of VenueDetailSheet (after Save-to-list).

### Recently Fixed (2026-04-10 cleanup + launch-scope pass)

- ✅ `TP_MARKER = "710303"` set — flight commission earning
- ✅ `fetchWeather` now retries on 429/5xx with backoff, returns null instead of throw
- ✅ Proxy: deduped rate limiter, IATA regex validation, /api/alerts schema validation + cap
- ✅ Proxy: new **POST /api/waitlist** endpoint → appends to `server/data/waitlist.jsonl` (free, uses existing VPS disk)
- ✅ index.html: pinned react/react-dom 18.3.1 (was floating @18)
- ✅ REI section removed from GEAR_ITEMS (22 dead $0 links)
- ✅ VENUES scaled 3,726 → 257 (unique-photo dedupe) → **231** (launch cats only: skiing/surfing/tanning)
- ✅ CATEGORIES trimmed to 4 (all + ski/surf/beach); emoji field stripped
- ✅ LOCAL_TIPS, PACKING, GEAR_ITEMS, EXPERIENCES, guideCategories, blurbs, vibe-search intents, getVenuePhoto, needsMarine — all pruned to launch-only
- ✅ 8 dead `switch` cases removed from `scoreVenue` (diving/climbing/kite/kayak/mtb/fishing/paraglide/hiking)
- ✅ `venue.facing` compass bearing added to all 77 surfing venues — per-break data based on iconic knowledge, no more broken default
- ✅ Email capture: real POST to `/api/waitlist`, inline status feedback (no more `alert()`)
- ✅ Emoji stripped from CATEGORIES pills, LOCAL_TIPS/PACKING strings, guideCategories, GEAR_ITEMS items, EXPERIENCES items, and 5 JSX render sites
- ✅ Sitemap: dropped hash-fragment URLs (not indexable), homepage only
- ✅ `.archive/` deleted (64K of April 7-9 QA snapshots)
- ✅ `.gitignore`: added `*.orig`, `*.rej`

### Open Pre-Launch Items

- iOS App Store: Apple Developer enrollment ($99/yr) + `npx cap add ios` + Xcode build
- Replace placeholder affiliate IDs (GetYourGuide, Backcountry — LLC approved)
- Register `peakly.app` domain
- Terms of Service / Privacy Policy
- Google Play Store via PWABuilder/TWA ($25)
- ListingCard "Book" button Plausible event

## Agent Team (5 + briefing + token watch)

Streamlined 2026-05-03: 14 local prompts → 5 input agents + 1 briefing.
24 remote scheduled stubs → 5 live routines (4 daily + briefing + weekly token check).

### Daily roster (UTC)

| Slot | Agent | Local prompt | Remote routine |
|------|-------|--------------|----------------|
| 14:00 | DevOps | `tasks/agents/devops.md` | `peakly-devops` ✅ live |
| 15:00 | Content & Data | `tasks/agents/content-data.md` | `peakly-content-data` ✅ live |
| 16:00 | Product Manager | `tasks/agents/product-manager.md` | `peakly-product-manager` ✅ live |
| 16:30 | Revenue | `tasks/agents/revenue.md` | (local-only — schedule on demand) |
| 17:00 | UX Designer | `tasks/agents/ux-designer.md` | (local-only — schedule on demand) |
| 17:30 | Daily Briefing | `tasks/agents/daily-briefing.md` | `peakly-daily-briefing` ⏳ needs scheduling |

Plus `peakly-token-renewal` weekly (Mondays) — watches the GitHub PAT
expiring 2026-06-15 and alerts when <14 days remain.

### Source of truth

The local `tasks/agents/<role>.md` file is canonical. Each remote routine's
`SKILL.md` is a thin shim that `curl`s the canonical prompt from
`raw.githubusercontent.com/j1mmychu/peakly` so edits to the local prompt
flow to the next remote run automatically. Don't edit remote SKILL.md
directly — edit the repo file.

### Output flow

- Input agents write to `reports/inputs/<role>-YYYY-MM-DD.md`
- Daily briefing reads all of today's inputs + yesterday's briefing,
  emits one ~50-line digest to `reports/briefings/YYYY-MM-DD.md`
- Sub-15-min one-line fixes (gear-gate flips, color swaps, etc.) get
  written as unified diffs to `reports/ready-to-ship/<name>-YYYY-MM-DD.diff`
  for Jack to `git apply` and commit
- Findings flagged 3 days running with no action move to
  `reports/known-skipped.md` and stop being reported (two-strikes rule)

### Run any agent on demand

```bash
cd ~/peakly && claude "$(cat tasks/agents/product-manager.md)"
```

Or run the whole daily team locally:

```bash
bash tasks/agents/run-all.sh
```

Files older than 7 days in `reports/` → archived to `reports/archive/`.

### What got cut on 2026-05-03

Remote stubs archived to `~/Documents/Claude/Scheduled/_archive_2026-05-03/`
(19 dirs, none had fired since March): app-health, backup, ci-deploy,
code-quality, community-agent, competitor-watch, data-enrichment,
executive-briefing, firewall-vpn, growth-lead, qa-agent, revenue,
security-audit, seo-analytics, site-uptime, ux-designer, vps-health,
vps-selfheal, vuln-scan.

Local prompts deleted (8): code-quality, community-agent, competitor-watch,
data-enrichment, growth-lead, qa-agent, scale-guardian, seo-analytics.

## Revenue Model

| Stream | Status | RPM (per 1K MAU) |
|--------|--------|------------------|
| Amazon Associates (`peakly-20`) | LIVE | $4.48 |
| Booking.com (`aid=2311236`) | LIVE | $6.90 |
| SafetyWing (`referenceID=peakly`) | LIVE | $0.54 |
| Travelpayouts (HTTPS proxy, TP_MARKER=710303) | LIVE | $0.14 |
| REI (Avantlink signup pending) | $0 | +$6.16 |
| Backcountry / GetYourGuide | $0 | +$1.84 |
| Peakly Pro | UI REMOVED 2026-04-16 — decision pending (kill or ship) | TBD |

**Live RPM:** ~$7.50/1K MAU (3 of 6 streams earning). **With gear gate flipped + GYG partner_id:** ~$13.66 (+82%).

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
