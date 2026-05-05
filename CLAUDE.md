# CLAUDE.md — Peakly

> Shared brain for all AI sessions. Keep this file under ~250 lines. Historical "what shipped" lives in `CHANGELOG.md`. Open bugs and current state live here.

## Project Overview

Peakly is a **single-file React SPA** for finding the best ski or beach spot to fly to **this weekend**. It runs entirely in the browser with no build step — React and Babel are loaded via CDN and JSX is transpiled client-side.

- **Live:** https://j1mmychu.github.io/peakly/
- **Goal:** 100K+ downloads. Steve Jobs-level quality.
- **Owner:** Jack (jjciluzzi@gmail.com)
- **Categories at launch (post-2026-05-03 pivot):** Skiing and Beach only. Surfing was retired; other categories (climbing, MTB, hiking, kayak, dive, yoga, wellness) were never re-enabled.
- **Front page:** Locks to a Fri–Mon weekend window — `scoreWeekend` returns best-2-of-4 with confidence flag. Per-day `scoreVenue` powers the detail-sheet 7-day view.

## Architecture

```
peakly/
├── index.html               # Entry point — React 18, ReactDOM, Babel via CDN
├── app.jsx                  # Entire application (~7K lines of JSX)
├── CLAUDE.md                # THIS FILE — shared brain
├── CHANGELOG.md             # Historical shipped log + decisions
├── README.md                # User-facing docs
├── manifest.json            # PWA manifest
├── sw.js                    # Service worker (peakly-20260504j, push + caching)
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
3. Constants & data (~lines 138–860): `CATEGORIES`, `CONTINENTS`, `AP_CONTINENT`, `AIRPORTS`, `BASE_PRICES`, `VENUES` (~154), `AVATAR_COLORS`, weather code maps
4. Utility functions (~lines 860–1260): `useLocalStorage` (with tanning→beach migration), `fetchWeather`, `fetchMarine` (beach water-temp only), `fetchTravelpayoutsPrice`, `scoreVenue` (per-day), `scoreWeekend` (Fri–Mon window — front page), `weekendDayIndices`, `scoreVibeMatch`, `buildFlightUrl`, `getTypicalPrice`, `getDealScore`
5. UI components (~lines 1260–4900)
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

Two entry points:

- **`scoreWeekend(venue, wx, marine, todayDate)`** — front-page entry. Computes best 2 consecutive days within the Fri–Mon weekend window. Returns `{score, label, period, days, confidence}`. `confidence` is `high` (window all within day 0–4 forecast), `medium` (max day 5), or `low` (max day 6+ — front page filters this out so the product doesn't sell uncertain weekends as GO).
- **`scoreVenue(venue, weather, marine, dayIndex)`** — per-day engine, used by the detail sheet's 7-day view and called internally by `scoreWeekend`.

Scoring is no longer frozen — the 2026-05-03 pivot unlocked it. Do not modify scoring without an algorithm critique (see `~/.claude/plans/effervescent-jumping-hopper.md` for the most recent six-hole audit).

Late-season skiing exception: high-altitude resorts marked `lateSeason: true` in VENUES (Whistler, Tignes, Mammoth, Chamonix, etc.) bypass the off-season binary cap when `snow_depth_max >= 0.5m`. Beach venues marked `poolPrimary: true` skip the water-temp <18°C hard cap.

## Important Notes for AI Assistants

1. **Single-file architecture** — all changes go in `app.jsx`. Do not split.
2. **No build step** — JSX must be valid for Babel Standalone. No `import`/`export`, no `require()`.
3. **CDN deps only** — add libraries via `<script>` in `index.html`.
4. **React APIs are global** — destructure from `React` at top of `app.jsx`.
5. **localStorage only** — prefix keys with `peakly_`.
6. **Travelpayouts token off the client** — always via VPS proxy.
7. **Mobile-first** — safe area insets matter.
8. **Test in browser** after changes — check console for Babel parse errors.
9. **Venue data is hardcoded** — `VENUES` array has **~154 entries** (2 launch categories: skiing and beach; surfing retired 2026-05-03). Weather fetching is batched (50/2s) to avoid Open-Meteo rate limits. Cached in localStorage with 2hr TTL. Marine API only fetched for beach venues (water temp only).
10. **Error boundary** wraps the app root with a fallback UI.
11. **Prior conversation context** — at session start, check `context/*.md` for relevant past discussions, design calls, decision rationale that didn't make it into CLAUDE.md or CHANGELOG.md. Most recent first.

## Current State (2026-05-04)

### What's Broken / Open (Priority Order)

1. ~~**Repo divergence — 18 days no commits** (last: a9a01e3, 2026-04-15). Working tree had real fixes (proxy.js dedupe + state notes) sitting unshipped.~~ **DONE 2026-05-03** (commits 6e964e9 + 35e60c2 shipped).
2. ~~**Amazon gear gate `{false && ...}` at app.jsx:5728** — leaks ~$11/mo/1K MAU. Open since 2026-04-10 (Day 23+).~~ **DONE 2026-05-04** — Revenue agent flipped to `{GEAR_ITEMS[listing.category] && ...}` at app.jsx:5704; merged via a9aacf5. Day-25 finding finally closed.
3. ~~**Marine batch loader at app.jsx:6748** — `needsMarine` only checks surfing; tanning venues score without water-temp data on Explore list. One-token fix. Open since 2026-04-10.~~ **DONE 2026-05-03** — closed alongside surf removal in pivot commit bb56aaf (`needsMarine` now checks `category === "beach"`).
4. ~~**`lateSeason: true` flag never wired up on any ski venue**~~ **DONE 2026-05-04** — Cervinia + Val d'Isere s16 carry the flag (app.jsx:412, :486). Note: 7 of the venues called out in PM report (Zermatt, Saas-Fee, Hintertux, Val Thorens, Verbier, Stelvio, Les Deux Alpes) don't exist in VENUES — were a planned batch that never landed. Decide if they're in launch scope before re-flagging.
5. ~~**Active venue duplicates**~~ **DONE 2026-05-04** — only aruba-eagle-beach-t1 was a live dup (the other 4 cleared in 2026-05-03 surf retirement); deleted + boot-time dup-id validator IIFE added (app.jsx:528). PM report finding was stale.
6. ~~**Travelpayouts weekend-specific dates not wired**~~ **CODE DONE 2026-05-04, AWAITING VPS REDEPLOY** — `proxy.js` now accepts `depart_date`/`return_date`; client `fetchTravelpayoutsPrice` passes upcoming Fri date via `upcomingFridayISO()`. Backward-compatible (no-args → legacy month-cheapest). Jack must SSH to 198.199.80.21, `cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy` (or `npm install` if deps changed — they didn't this round).
7. ~~**Open-Meteo weather cache still unbuilt**~~ **CODE DONE 2026-05-04, AWAITING VPS REDEPLOY** — proxy now exposes `/api/weather` + `/api/marine` with shared in-memory 2hr cache + in-flight dedupe. Client `fetchWeather`/`fetchMarine` try proxy first, fall back to direct Open-Meteo. Reddit-spike protection: N simultaneous users hitting the same (lat,lon) trigger 1 upstream call. Same redeploy path as #6.
8. **No onboarding scoring explanation** — new users dumped into Explore without context for how conditions + "window" scoring works.
9. **Strike alerts server polling** — `/api/alerts` endpoint registers, but no background worker reads `_alerts` Map and fires push when venue hits target.
10. **No SRI on CDN scripts** + **no CSP meta** — security hardening; medium risk to apply (could break Babel inline eval). Flagged but not touched.

### Recently Fixed (2026-05-04 evening — weekend-pricing wire-up + weather proxy + 50/50 deal weight)

- ✅ **Travelpayouts weekend-specific dates** (proxy.js + client) — `proxy.js` `/api/flights` accepts optional `depart_date`/`return_date` (YYYY-MM-DD), filters month-matrix to exact-date matches, returns single weekend-specific price. Client `fetchTravelpayoutsPrice(origin, dest, departDate, returnDate?)` + new `upcomingFridayISO(today)` helper threads upcoming Fri through the App-level price-fetch effect. Cache key includes departDate so different weekends don't collide. Backward-compatible: omitted args → legacy month-cheapest. **Awaiting VPS redeploy on 198.199.80.21.**
- ✅ **Open-Meteo proxy with shared cache** (proxy.js + client) — new `/api/weather` and `/api/marine` endpoints proxy Open-Meteo with shared in-memory 2hr cache (4000-entry LRU) + in-flight dedupe (1000 simultaneous users hitting the same uncached coord = 1 upstream call). Coords rounded to 2 decimals (~1.1km grid) so neighbouring venues share entries. Client `fetchWeather`/`fetchMarine` try proxy first via `_tryProxyWx()` (4s timeout), fall back to direct Open-Meteo if proxy is down or returns non-success. P0 Reddit-spike protection.  **Awaiting VPS redeploy.**
- ✅ **scoreWeekendDeal weight rebalanced 50/50** — was conditions × 0.65 + clamp(priceBonus, -15..35) × 0.35 → max price impact ~12pts. Now both signals normalized 0-100 (priceNorm linear: ratio 1.0 = 50, 0.5 = 100, 1.5 = 0), `final = conditionsNorm × 0.5 + priceNorm × 0.5`. Price now actually moves the needle. `DEAL_WEIGHT = 0.5` constant — future profile slider can wire to it.
- ✅ Cache key 20260504h → 20260504j across sw.js + app.jsx + index.html (i was a partial bump). PRECACHE remains [].

### Recently Fixed (2026-05-04 PM — deal-algorithm honesty pass)

- ✅ **Seasonal-aware typical price** (app.jsx:1602 `getSeasonalMultiplier`, :1640 `getTypicalPrice`) — BASE_PRICES is an annual mean. Without seasonality, off-season normal pricing reads as a deal and real off-season deals are masked. Added per-category month bands (skiing N: Dec–Mar peak 1.18×, May–Oct off 0.78×; beach N: Jun–Aug peak 1.16×, Oct–Apr off 0.86×; hemispheres flipped for S). Threaded `today` through `getTypicalPrice` + `getDealScore`. Conservative bands — when in doubt, closer to 1.0.
- ✅ **Stale flight.foundAt → estimate** (scoreWeekendDeal) — a "live" fare last seen >14 days ago is no longer treated as a real-time deal signal. Demoted to estimate so we don't claim a deal off month-old data the carrier has since repriced.
- ✅ **Absolute-savings floor on "Strong deal"** (scoreWeekendDeal) — 30% off an $80 LAS fare is $24, not a deal worth the label. Now requires ≥$60 absolute savings (or 8% of typical, whichever higher) before "Strong deal" or "Rare alignment" labels render. Stops cheap-route micro-discounts from gaming the deal sort.
- ✅ **getPriceVolatility comment fix** — function name is historical and misleading; it measures cross-origin price spread in the static matrix, not temporal volatility. Comment updated to be honest about that.
- ✅ Cache key + build stamp 20260504g → 20260504h (sw.js, app.jsx, index.html). PRECACHE = [] (regression cleared again).

### Recently Fixed (2026-05-04 — top-3 audit fixes + gear gate + seasonal default)

- ✅ **B.1 Estimate prices labeled with `~`** (commit 3bbe88e) — 8 card-render sites updated. When `flight.live === false`, price renders as `~$X` instead of `$X`. Trust signal so users don't think estimates are real fares.
- ✅ **B.2 Front-page carousel never goes blank** (commit 3bbe88e) — `bestRightNowFallback` softer floor (weekendScore >= 65, allows low confidence). When primary set has <3 venues, falls back automatically with "Looking ahead" header.
- ✅ **B.3 PWA install nudge after positive engagement** (commit 3bbe88e) — captured `beforeinstallprompt`, exposed via `useInstallPrompt()` hook. `<InstallNudge>` banner on Explore (shows when ≥2 wishlists saved) + "📲 Install Peakly" button on Profile. iOS Safari auto-hides. Plausible logging: `install_pwa` event.
- ✅ **Amazon gear gate FLIPPED** (commit a9aacf5) — `{false && GEAR_ITEMS...}` → `{GEAR_ITEMS[listing.category] && ...}` at app.jsx:5704 (was 5682 in flat code). Day-25 finding from Revenue agent. ~$11/mo/1K MAU unlocked (Amazon Associates `peakly-20`). The findings-to-fix loop officially worked.
- ✅ **Seasonal-default category** (commit 84f5e30) — new `seasonalDefaultCat(homeAirport)` helper at app.jsx:1652. N. hemisphere: May–Aug → Beach, Nov–Apr → Skiing, Sep–Oct → All. S. hemisphere inverse. App opens to the right pill instead of "All" in peak beach season. Not persisted (always re-applies).
- ✅ **DevOps 5/4 cache busts + cleanup** (commit 47f12e1) — cache-buster bumped 20260502a → 20260504a (index.html). SW CACHE_NAME bumped peakly-20260503c → peakly-20260504. PRECACHE regression cleared `["/peakly/app.jsx"]` → `[]` (sw.js). PEAKLY_BUILD bumped to 20260504a. 8 stale reports archived.
- ✅ Cache key + build stamp now at peakly-20260504b / 20260504b after 3bbe88e.

### Recently Fixed (2026-05-03 — pivot + distance filter + surf-leak defense)

- ✅ **Pivot to weekend-spontaneity** (commit bb56aaf) — killed all 77 surfing venues, renamed tanning → beach (102+ sites + 8 unquoted keys), one-shot useLocalStorage migration for existing users with `category: "tanning"`. Marked 5 known late-season ski venues with `lateSeason: true`. Added optional `poolPrimary: true` field. Deleted 136-line surfing case + all surf-specific marine extraction. Beach water-temp HARD CAP at 18°C. Off-season ski binary RELAXED for `lateSeason` venues. NEW `scoreWeekend(venue, wx, marine, today)` front-page entry + `weekendDayIndices(today)` Fri–Mon window helper. Carousel title "Best Right Now" → "Firing this weekend"; floor weekendScore >= 75 AND confidence !== "low". `app.jsx` 7137 → 6984 lines.
- ✅ **Block C — Within-Nhr-flight distance filter** (commit dc92123) — new `flightHours(originAp, destAp)` helper (haversine + 500mph cruise + 0.5h buffer) using AIRPORT_COORDS. SearchSheet UI adds "Max flight time" chips (Any / ≤4hr / ≤6hr / ≤8hr). Conditions score stays pure 0-100, distance is a filter — exception: `weekendScore >= 95` overrides the cap (perfect powder a continent away still surfaces). Active-filter chip + Clear All updated.
- ✅ **Surf-leak defense in depth** (commit ce8e1db) — (A) SW auto-reload via `controllerchange` listener so users get fresh code without manual hard-refresh after deploys. (B) `useLocalStorage` migration extended: strips legacy `"surfing"` from arrays + rewrites standalone surfing values to `"skiing"`. (C) "Ski/Board" → "Skiing" in CATEGORIES + onboarding (the "Board" was reading as surfboard). (D) build stamp + cache key bump. Belt + suspenders: Profile sport-badge map + Alert row map both `.filter()` against CATEGORIES.
- ✅ **Surf-removal stragglers** (commit 9d26e84) — onboarding copy, EMOJIS, swell condition labels, wave fields, marine API checks all cleaned up post-pivot.
- ✅ **18 days of working-tree drift cleared** (commit 6e964e9) — committed proxy.js dedupe (removed dead duplicate `/api/waitlist` handler) + 5 untracked agent reports.
- ✅ **Reports archived** (commit 6e964e9) — 73 files older than 7 days moved to `reports/archive/` per the >7d rule.
- ✅ **Agent channels streamlined** (commit 35e60c2) — 24 remote stubs → 5 live; 14 local prompts → 6. New daily-briefing pipeline. Findings-to-fix loop appended to all 5 input prompts (sub-15-min fixes go to `reports/ready-to-ship/`; two-strikes rule → `reports/known-skipped.md`).

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

**Live RPM:** ~$11.98/1K MAU (4 of 6 streams earning — gear gate flipped 2026-05-04, Amazon now active). **With GYG partner_id added:** ~$13.66 (+14%).

## Competitive Edge

| Competitor | Gap |
|-----------|-----|
| OnTheSnow / OpenSnow | Single sport, no flights, no weekend framing |
| AllTrails | No conditions, no flights |
| KAYAK | Conditions-blind |
| Hopper | Flights only, no conditions, no spontaneity framing |
| Skyscanner | Flights only, no conditions |

**Peakly's angle (post-2026-05-03):** The go-to app for a spontaneous **ski or beach weekend** — only product combining live Fri–Mon weather + cheap flights + a confidence flag that admits when the forecast is too uncertain to recommend.

See `CHANGELOG.md` for full competitive intel.

## Vision (Short)

**"Where to go this weekend."** OpenSnow tells you the snow. KAYAK tells you the flights. Peakly tells you which weekend window is actually worth booking — and is honest when the forecast can't promise.

**Phased roadmap:**
1. Ship quality (NOW) — photos, polish, PWA, analytics, 1K users
2. The Weekend Score — proprietary best-2-of-4 score across Fri–Mon with confidence badge (DONE 2026-05-03)
3. Distance-aware filter — `Within Nhr flight` toggle so spontaneous trips stay actually spontaneous (DONE 2026-05-03 — Block C, commit dc92123; ≥95 weekendScore overrides the cap)
4. Live weekend pricing — query Travelpayouts with actual Fri–Mon dates instead of "from $X" historical avg
5. Strike Missions — rare, opt-in, exceptional alignments push notifications
6. Group coordination
7. Crowd intelligence

**Strategic principles:**
- **Niche down before expanding.** Skiing + beach only — surfing retired 2026-05-03 to focus the algorithm and brand.
- **Don't sell certainty you don't have.** Forecast confidence is a first-class signal — `low` confidence weekends never reach the front page.
- FOMO-first content ("the window most people missed")
- Photos before features
- PWA + SEO first, native later
- The Weekend Score is the moat

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
- Do NOT change localStorage key names (the `tanning → beach` rename includes a one-shot useLocalStorage migration; don't add more renames without a migration)
- Do NOT remove existing functionality
- Do NOT modify scoring without an algorithm critique (the freeze was lifted 2026-05-03 — but lifting it doesn't mean "wing it")
- Do NOT add a category back without explicit launch-scope decision (surfing was retired with deliberation; resurrecting needs a real product call)
- Do NOT modify weather/flight API call structure
- Do NOT add npm dependencies
- Do NOT over-engineer — every fix is surgical
- Do NOT commit secrets, tokens, or API keys
