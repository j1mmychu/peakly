# CLAUDE.md — Peakly

> Shared brain for all AI sessions. Keep this file under ~250 lines. Historical "what shipped" lives in `CHANGELOG.md`. Open bugs and current state live here.

## Project Overview

Peakly is a **single-file React SPA** for finding the best ski or beach spot to fly to **this weekend**. Development: Babel Standalone transpiles JSX in-browser. Production: `scripts/build-web.mjs` pre-compiles `app.jsx → dist/app.min.js` via esbuild (Babel stripped) on every push via `deploy.yml`. See architecture note below.

- **Live:** https://j1mmychu.github.io/peakly/
- **Goal:** 100K+ downloads. Steve Jobs-level quality.
- **Owner:** Jack (jjciluzzi@gmail.com)
- **Categories at launch (post-2026-05-03 pivot):** Skiing and Beach only. Surfing was retired; other categories (climbing, MTB, hiking, kayak, dive, yoga, wellness) were never re-enabled.
- **Front page:** Locks to a Fri–Mon weekend window — `scoreWeekend` returns best-2-of-4 with confidence flag. Per-day `scoreVenue` powers the detail-sheet 7-day view.

## Architecture

```
peakly/
├── index.html               # Entry point — React 18, ReactDOM, Babel via CDN
├── app.jsx                  # Entire application (~12.5K lines of JSX as of 2026-06-09)
├── CLAUDE.md                # THIS FILE — shared brain
├── CHANGELOG.md             # Historical shipped log + decisions
├── README.md                # User-facing docs
├── manifest.json            # PWA manifest
├── sw.js                    # Service worker (peakly-20260610s as of 06-10 PM, push + caching — cache stamp now auto-bumped by auto-push.sh)
├── sitemap.xml / robots.txt # SEO
├── capacitor.config.json    # iOS/Android wrapper config
├── package.json             # Capacitor CLI deps only
├── .github/workflows/deploy.yml  # Pages auto-deploy on push to main+master
├── server/                  # Node.js VPS proxy source (Travelpayouts + alerts)
├── peakly-native/           # Capacitor native project files (PUSH_SETUP.md runbook)
├── ios/                     # NEW 2026-07-25 — PeaklyWidget (WidgetKit home-screen widget) + Capacitor bridge (App.entitlements, PeaklyWidgetBridge.swift/.m); see ios/WIDGET-SETUP.md
├── app-store/                # NEW 2026-07-25 — LISTING-COPY.md (paste-ready App Store name/subtitle/keywords/description)
├── scripts/                 # auto-push.sh + status.sh (ship pipeline) + validate-venues.mjs + build-ios.mjs/.sh
├── data/                    # venue-candidates.example.json (input for validate-venues.mjs)
├── tasks/agents/            # 5 input agents + daily-briefing (canonical prompts)
└── reports/
    ├── briefings/           # ONE file/day from daily-briefing agent — read this first
    ├── inputs/              # Raw daily reports from the 5 input agents (5 files/day)
    ├── ready-to-ship/       # Sub-15-min diffs the agents prepared for paste
    ├── known-skipped.md     # Findings the agents agreed to stop reporting
    └── archive/             # >7-day-old reports
```

**Production build (since 2026-06-20, commit `8ba0ca3`):** `deploy.yml` line 40 calls `node scripts/build-web.mjs` on every push. That script esbuild-compiles `app.jsx → dist/app.min.js` (439 KB minified, Babel stripped entirely) and rewrites `dist/index.html` to load it. Eliminates the 3–5s Babel parse wall on mobile. **Dev loop unchanged:** open `index.html` locally and Babel-in-browser still transpiles app.jsx. No webpack, no Vite, no ES module imports in source.

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
3. Constants & data (~lines 138–860): `CATEGORIES`, `CONTINENTS`, `AP_CONTINENT`, `AIRPORTS`, `BASE_PRICES`, `VENUES` (392), `AVATAR_COLORS`, weather code maps
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
| Supabase | `wsoqcfwkvvemtlddcgfc.supabase.co` | Anon key (public-safe, RLS-gated) | Cloud sync + magic-link auth + shared_lists |

**Travelpayouts token is server-side only.** Never put it in client code.

## Data Storage

Local-first via localStorage with optional cloud sync via Supabase Postgres (magic-link auth, anon-visitor flow unchanged). Prefix all keys with `peakly_`.

**Cloud sync (live 2026-05-04):** `SYNCED_KEYS` = wishlists / named_lists / alerts / trips / profile only. Caches, error logs, push tokens, install-dismissed flag stay local-only. Last-writer-wins conflict resolution by `server.updated_at`. Supabase project: `wsoqcfwkvvemtlddcgfc.supabase.co`; anon key wired; `CLOUD_SYNC_CONFIGURED = true`. Library lazy-loaded (~80KB gzipped) — only fetches when there's an existing session, magic-link callback, or user taps Sign in.

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
- Active state for selection UI (filter pills, tab nav, in-card CTAs like "View Details", install nudge): `#0284c7` (brand blue) — scoped 2026-05-13 after UI cohesion audit
- True outbound CTAs (external "Book", destructive actions): `#222` (dark — original 2026-03-23 decision retained for these only)
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
9. **Venue data is hardcoded** — `VENUES` array has **392 entries** (2 launch categories: skiing and beach — 132 skiing, 260 beach; surfing retired 2026-05-03). Weather fetching is batched (50/2s) to avoid Open-Meteo rate limits. Cached in localStorage with 2hr TTL. Marine API only fetched for beach venues (water temp only).
10. **Error boundary** wraps the app root with a fallback UI.
11. **Prior conversation context** — at session start, check `context/*.md` for relevant past discussions, design calls, decision rationale that didn't make it into CLAUDE.md or CHANGELOG.md. Most recent first.
12. **Pre-deploy smoke test** runs automatically via `scripts/auto-push.sh` → Playwright headless against the live URL after each push that touches app.jsx/sw.js/index.html. If you see `❌ DEPLOY SMOKE FAILED` in the auto-push output (or `/tmp/peakly-smoke.log`), the live site likely has a runtime error — diagnose before more pushes. Manual run: `npm run smoke` (live) or `npm run smoke:local` (dist/ on :8002). Catches "parses but throws on first render" bugs (TDZ, undefined refs).

## ⛔ BEFORE YOU READ ANYTHING BELOW — `git fetch` FIRST

**Run `git fetch && git log --oneline -3 origin/main && git status -sb` as your first action. Every session. No exceptions.**

`git status`, `git log`, and "HEAD == origin/main" only compare against the **last fetched** ref. A checkout can be weeks behind while every local signal says "current."

This is not hypothetical. On **2026-07-24** a session ran against a clone frozen at `1bb66bf` (June 14). Its `origin/main` ref matched HEAD, so the assistant reported the repo as current, repeated this file's "nothing shipped in 40 days" line, and did a full audit + venue cleanup against a **40-day-old snapshot with 358 venues when the real catalog had 374**. It was only caught at push time, by a rebase conflict. Cost: an hour, plus a full re-application of every fix. One `git fetch` would have prevented all of it.

**Corollary:** the Cowork sandbox has **no network egress for git**. If `git fetch` fails there, say so out loud and treat all repo state as unverified — do not fall back to the stale ref and call it current.

## Current State (2026-08-11 evening — local Claude Code session, networked, verified against origin)

> **VPS redeployed 2026-08-11 evening (Jack, SSH)** — Open #19 CLOSED. `forecast_days:14` + disk cache + CORS/rate-limiter fixes are live. `/health` confirms `apns:configured`, uptime resets to seconds (fresh restart). Two-weekend scoring, iOS native proxy access, and alert deletion are all unblocked. Reddit gate cleared.
>
> **Found and fixed a real infra bug: `scripts/auto-push.sh`'s venue-integrity check had a broken, double-escaped regex** (`new RegExp("const\\\\s+"+name+...+"\\\\\\\\"+open)`) that threw a `SyntaxError` inside the guard's `INTEG=$(node -e '...')` capture. Under `set -euo pipefail`, that silently killed the *entire* auto-push script before it ever reached the commit step — no error surfaced anywhere except a blank/absent log line, and it affected every single app.jsx-touching commit from this hook. Only invisible until now because scheduled cloud agents push through a different path that bypasses this local hook. Fixed with a proper `esc()` helper (app.jsx-independent, in `scripts/auto-push.sh`) — verify by extracting the `INTEG=` block and running it standalone if this class of bug resurfaces. **If local pushes ever go quiet again with no error, check `/tmp/peakly-auto-push.log` for a guard refusal first, then verify the guard script itself actually runs to completion (`bash -x scripts/auto-push.sh`) rather than assuming the guard logic is sound.**
>
> **Shipped this session** (commits `059de43`, `0cdb711`):
> - **Explore-grid price shimmer removed** (`ListingCard`/`FeaturedCard`/`CompactCard`, 4 sites) — the `~$X` estimate from `BASE_PRICES` was already computed instantly with zero network cost and already rendered immediately on the hero card, carousel, and detail sheet; only these 3 grid components hid it behind a loading shimmer gated on the batched live-fetch effect. Now consistent everywhere: estimate shows instantly, upgrades to `$X LIVE` in place when the fetch resolves.
> - **Price accuracy fix — the real "stale prices" bug.** Verified live against `peakly-api.duckdns.org/api/flights`: when no genuine 2-4 day (Fri-Mon) round-trip fare is cached for a route/date, the proxy's documented fallback returns *any* cached return date — confirmed a JFK→LAX query return a 14-day trip (Aug 14→Aug 28) labeled as "the weekend price." The client blindly trusted `duffelData.returnDate` with no sanity check. Added a `duffelTripDays`/`duffelWrongLength` check in the `listings` memo — any live fare outside 2-4 days now demotes to the honest `~$X` estimate instead of badging as LIVE with a misleading date range. Also fixed `buildFlightUrl`'s no-live-data fallback from `+7 days` to `+3 days` (matches the actual Fri→Mon promise instead of quietly booking a week-long trip).
> - **Onboarding collapsed from an effective 4 screens to a true 2 slides.** Was: Welcome → Airport → Sports, *then* an always-forced 4th screen (`AccountSetupModal`) that re-asked for an airport regardless of step 1 — confirmed via grep it was unreachable from anywhere else, pure redundant friction, now deleted along with `showAirportSetup` state. New flow: **slide 1** (welcome, unchanged copy) → **slide 2** ("Where do you fly from?" — geolocation auto-fires the moment this slide mounts, 10000ms timeout instead of the old 2000ms/4000ms that were dropping most real-world fixes before they could resolve; full 16-airport 4×4 grid + worldwide search always visible as the fallback/override, satisfying "or allow the option in the second slide"). Also deleted the old duplicate silent root-level `getCurrentPosition` call — one call site now, tied visibly to the airport slide, matching the Info.plist `NSLocationWhenInUseUsageDescription` promise. Sports selection dropped entirely (was already functionally dead — `profile.sports` drove no filtering logic, only cosmetic Profile-tab text).
> - **iOS widget: found and fixed the exact documented failure mode.** The Xcode widget target + bridge compilation were already done (prior session), but `ios/App/App/capacitor.config.json`'s `packageClassList` was missing `PeaklyWidgetBridge` (a gitignored, `cap sync`-regenerated file) — the #1 cause in `ios/WIDGET-SETUP.md`'s own troubleshooting section ("plugin invisible to JS, no error anywhere"). Ran `node scripts/register-widget-plugin.mjs` to fix locally; `npm run cap:sync` already chains this correctly for future syncs, a bare `npx cap sync ios` will still drop it. App Group identifiers and widget `kind` strings verified matching on both targets.
> - **Archived `peakly-native/`** → `peakly-native-ARCHIVED-do-not-build/` per `APP-STORE-CHECKLIST.md` Phase 1 #3 (duplicate abandoned Expo project sitting next to the real Capacitor `ios/` project — App Store submission risk if someone builds the wrong one).
> - Both local + live Playwright smoke tests green after all of the above.
>
> **Not done this session, still open:** BASE_PRICES coverage (43%), Supabase delete-account SQL paste, App Store Connect account/listing work, Xcode signing + device build + TestFlight. See `APP-STORE-CHECKLIST.md`.

<details>
<summary>Previous state (2026-07-25 — CLAUDE.md sync agent run, `git fetch` BLOCKED) — historical</summary>

> ⚠️ **This sync ran in a Cowork sandbox with no network egress for git — `git fetch` failed with "Host key verification failed."** Per the rule above, this local state is **unverified against origin** and should not be treated as confirmed-current. Everything below is read from the local checkout only (local HEAD `060ad85`, 2026-07-25 17:56 PDT).
>
> **Local HEAD `060ad85`** — 6 commits ahead of the last CLAUDE.md sync point (`fc1c194`): two daily reports + PM v99 (routine), then two feature commits: `ffacbd7` **iOS home-screen widget** (WidgetKit + Capacitor bridge + `peakly://` deep links — code complete, needs ~15 min of one-time Xcode GUI wiring per `ios/WIDGET-SETUP.md`; framed as the strongest available answer to App Store Guideline 4.2 minimum-functionality risk for a Capacitor app), and `060ad85` **App Store listing copy** (`app-store/LISTING-COPY.md` — paste-ready name/subtitle/keywords/description, character-count verified).
>
> **Working tree is dirty (2 uncommitted files) as of this sync** — appears to be in-progress work on Open #21 (APNS/alerts security), not yet committed:
> - `server/proxy.js`: rewrites `firePush` to use Node's built-in `http2` module instead of global `fetch` (APNs is HTTP/2-only; `fetch`/undici is HTTP/1.1 and could never have connected), and switches the JWT signature to `dsaEncoding: 'ieee-p1363'` (Apple requires raw R‖S; Node's EC default is DER, which APNs rejects). This is exactly the two-bug fix Open #21 calls for.
> - `app.jsx`: replaces `Date.now()` alert IDs with a `crypto.randomUUID()` (with `getRandomValues`/`Math.random` fallback) `newAlertId()` helper — closes the "guessable id = capability token" hole also named in Open #21.
> - **Neither change is committed, tested, or deployed.** Do not mark Open #21 resolved. If you're continuing this work: finish, verify (`node -e` syntax check + a real APNs sandbox send), then commit with a message that references Open #21.
>
> **PM v99 / DevOps / Content reports (2026-07-25, all GREEN, no new P0s):** reconfirmed 373 venues (131 ski / 242 beach), cache `20260724a`, all four `0c02590` P0 fixes verified live. Two reprioritizations worth carrying forward: (1) **VPS redeploy (Open #19) moved from P2 to P1 "pre-traffic gate"** — PM v99 groups it with weather-cache disk persistence as work that must land *before* any Reddit/HN post, not just "eventually." (2) **BASE_PRICES gap (Open #22) quantified**: Content confirms **100 of 146 venue airports (≈68%) are absent from `BASE_PRICES`**, including CUN/BOB/AUA/STT/SXM — not just the coarse "CUN/MIA/LAX" example previously listed. Backfill target unchanged: top ~15 by venue count, ~2hr task.
> - **New item surfaced by PM v99, not previously tracked**: weather cache (`_wxCache`) is in-memory only — a `pm2 restart` (which redeploying the VPS requires) wipes it, so a cold cache hit by a traffic spike could still blow through Open-Meteo's free-tier ceiling before this refills. ~30-line fix, bundle with the VPS redeploy since both are server-side and need the same SSH session. Added as Open #23 below.

<details>
<summary>Current State (2026-07-24 — networked session, verified against a fresh fetch) — most recent verified-against-origin snapshot</summary>

> **373 venues** (131 ski / 242 beach), cache `20260724a`, HEAD `fc1c194`. Counted by eval, not grep.
>
> **Shipped tonight** (commits `0c02590` + `fc1c194`) after a full line-by-line audit of app.jsx, proxy.js, index.html, sw.js and both SQL files:
> - **4 P0s, all confirmed live on origin before fixing.** (1) `upcomingFridayISO` formatted with `toISOString()` (UTC) so **every US-evening browse priced SATURDAY fares as Friday**, including Aviasales deep links — fixed with a `localISODate()` helper at all 3 call sites. (2) `onRefresh` called `fetchAllWeather`, which **does not exist** — every pull-to-refresh and header refresh threw a ReferenceError, killing the exact recovery path the "conditions unavailable" banner instructs. (3) Cloud-sync `pullNow` wrote to localStorage and dispatched `peakly-sync-pulled` that **nothing listened for**, so React state stayed stale and the next write uploaded it over fresh cloud data — second-device sign-in destroyed saved venues. (4) `WishlistsTab` referenced out-of-scope `alertedIds`/`onAlertToggle` (the `flightsLoading` bug class) — a guaranteed ErrorBoundary crash the day Wishlists/Trips un-hides.
> - **4 real coordinate errors**, each replaced with OSM's own coords for the actual named feature: `pasjaca-beach-croatia` was **in Montenegro**; `beach_okinawa` 41 km off (now Ocean Expo Park, Motobu); `beach_cape_verde` at the wrong end of Sal; `turquoise-bay-t8` at Exmouth town not the bay. All 373 venues were geo-verified in two passes (forward + reverse geocode) — see `VENUE-INTEGRITY-2026-07-24.md`. **Forward-geocoding alone produces ~37 false alarms** (Brighton UT vs Brighton CO, Coogee Sydney vs Coogee Perth); reverse-geocoding is the authoritative test.
> - `banff` ("Banff / Lake Louise") deleted — it sat 2 km from `lake-louise`, double-listing it. 374 → 373.
> - **`auto-push.sh` guard was itself broken and refusing commits.** Its venue counter used a quote-aware bracket walker that dies on an apostrophe inside a comment (`// don't`) → eval threw → fell back to a grep counting 176 against a baseline of 374 → `guard_fail`. Only invisible because Jack's `push` alias bypasses the hook. Walker is now plain bracket-counting; counter failure now **skips** the count check instead of comparing a known-wrong number. **Never reintroduce quote-skipping in these walkers.**
> - New venue-integrity guard: every `app.jsx` commit verifies each `ap` resolves in **both** `AP_CONTINENT` and `AIRPORT_COORDS`, no dup ids, no dup title+location. Tested against the pre-fix tree — correctly catches Open #18's 5 missing airports.
> - 27 marquee venues now carry **real photos of the actual place** (Whistler, Chamonix, Zermatt, Bora Bora, Santorini…). The catalog's photos are otherwise generic stock — **zero were of their venue**; the June photo-dedup script optimized for "no repeats," not accuracy. Pipeline: `scripts/photos-fetch|review|apply.mjs` (needs `UNSPLASH_KEY`). ~346 venues still generic.
> - iOS: `viewport-fit=cover` added — **every `env(safe-area-inset-*)` in the app was resolving to 0** on iPhone. Bundle ID changed to **`com.stormpeak.peakly`** (`com.peakly.app` is taken globally). Device family set to iPhone-only.
>
> **⚠️ NOT YET DEPLOYED — `server/proxy.js` changes are inert until the VPS is redeployed** (`/opt/peakly-proxy` is a hand-copied dir, not a git clone): weather `forecast_days` 7→14 at **both** call sites (the client endpoint and the alert poller share `_wxCache`, so a 7-day payload from either **silently disabled two-weekend scoring whenever the VPS was healthy**); marine → 10; `capacitor://localhost` added to CORS (**iOS native calls would have been blocked outright**); `DELETE` added to `Access-Control-Allow-Methods` (**alert deletion has never worked** — preflight blocked it and the client's `.catch(()=>{})` hid it); rate limiter now reads the **last** X-Forwarded-For entry (taking `[0]` let anyone forge it and balloon `_rateMap`).
>
> **VPS verified healthy over the network 2026-07-24**: `/health` 200, uptime 44 d, `wx_cache_size` 595, `apns: unconfigured`. Stop re-flagging it as down.
>
> **APNS is doubly broken — do NOT wire push until fixed**: the ES256 JWT signs with DER encoding (Apple needs raw R‖S — `dsaEncoding: 'ieee-p1363'`) and `firePush` uses global `fetch`, which is HTTP/1.1-only while APNs requires HTTP/2. Also: the alerts API is unauthenticated with `Date.now()` ids — anyone can delete or hijack another user's alert. Full detail in `AUDIT-2026-07-24.md`. **(2026-07-25 note: an uncommitted working-tree fix for exactly this exists locally — see the 2026-07-25 block above. Not yet shipped.)**

</details>

<details>
<summary>Previous state (2026-06-10) — historical</summary>

> Launch status (2026-06-09): code healthy. **353 venues** (130 ski / 223 beach — authoritative count via `eval` of the VENUES array; all 353 IDs unique, zero dups, zero missing render-critical fields). **+14 Southern-hemisphere ski venues added 2026-06-09 PM** (NZ Cardrona/Mt Hutt, AUS Falls Creek/Buller/Hotham/Charlotte Pass, Chile Nevados-de-Chillán/La Parva/El Colorado/Corralco, Argentina Cerro Catedral/Las Leñas/Chapelco/Caviahue) via `validate-venues.mjs` (14/14 accepted) so N-hemisphere summer has real ski options — season gating is hemisphere-correct (`isNorth=lat>=0`; southern in-season May–Oct). 6 new airports added to `AIRPORT_COORDS`+`AP_CONTINENT` (CHC/MEL oceania; BRC/MDZ/CPC/NQN latam). ⚠️ **STOP COUNTING VENUES WITH `grep category:"..."` — it undercounts to 156.** The catalog is a MIX of two formats: ~156 original compact entries (`id:"whistler", category:"skiing",`) and ~183 batch entries pasted as pretty-printed JSON with quoted keys (`"id": "...", "category": "beach",`). A double-quoted-value grep only sees the compact 156; the daily agent reports (PM/DevOps) and an earlier pass of this file all undercounted for the same reason. The real number is 339. To count correctly, eval the array (see the node one-liner pattern) — never grep. The 134-beach batch (commit `7561a18`) DID land (89→223 beach). Cache aligned (`20260609d`), braces balanced (5425/5425), live site 200, smoke green, security clean. Open #14 (unreviewed auto-push) is now MITIGATED — invariant guard live in `scripts/auto-push.sh` (commit `948680b`); Open #8 (scoring explanation) SHIPPED same commit. **App Store readiness (2026-06-10):** account deletion shipped (Guideline 5.1.1(v) — `delete_user()` SQL + Profile → Delete account UI; SQL needs one-time paste into Supabase, see below). Cold-start verified reviewer-proof (total weather failure → "conditions unavailable, pull to refresh" banner + venues still render, no blank/ErrorBoundary; confirmed via fetch-reject stub + Playwright). iOS alert-copy honesty done (`ALERTS_AVAILABLE` gates onboarding/Profile/email-capture push promises off iOS). `book_click` + ToS/Privacy footer links confirmed committed (the old "uncommitted" note was stale). **VPS is NOT a blocker — verified live 2026-06-09** (`/health` shows `wx_cache_size` populated + poll worker running; `/api/weather` returns `success:true`). Weather cache (#7), weekend pricing (#6), alerts polling (#9) are all deployed and serving. Only APNS remains unconfigured (#9, iOS push only — the `isNativePlatform()` gate already lets iOS ship without it). **Amazon CUT for v1** (#13), so revenue is honest at $7.58/1K MAU. Remaining real items are Jack-only manual actions + post-launch enhancements (PAT #15 resolved 06-10 — token has no live consumer, expiry is a non-event). The old "VPS Day 35/36 binary blocker" framing in prior PM reports is STALE — stop re-flagging it; the endpoints are live.

> **2026-06-10 PM addendum (sync agent):** Cache stamp now `20260610s` (app.jsx/sw.js/index.html in lockstep — the 06-10 App Store readiness work shipped across ~20 `auto:` commits, `4e0e163`→`eb4bf7d`). Venue count re-verified at **353** (130 ski / 223 beach) via `status.sh` eval counter. The GEAR_ITEMS restore (commit `c112b51`) has since been REVERTED — Amazon stays cut for v1, code matches the $7.58 Revenue Model again (see Open #16, resolved). Also shipped 06-10: copy reframe of save + combined account sheets to email-first voice (commit `350addc`); auto-push.sh eval-counter guard + `.venue-baseline` 353 landed in `9808971`; App Store blocker fixes (Info.plist location string, gated push `register()` on iOS, app-level Privacy Manifest, iOS bundle resync).

> **2026-06-13 addendum (networked local session) — TWO launch P0s closed, both turned out partly bogus:**
> 1. **Photo dedup SHIPPED** (commit `a143e4c`, cache `20260613a`). Redistributed each category's *existing verified on-theme* photo palette evenly via `scripts/photo-dedup.cjs` (round-robin, no new/unseen photos). **Max photo repeat 26×→3×** (ski ≤2×, beach ≤3× — optimal for the 69-ski / 101-beach palette). 358 venues, 170 distinct photos, 0 dup IDs, braces balanced, local + live smoke green, verified on live app.jsx. The photos are generic category scenery (a powder shot was on 26 resorts), so redistribution within-category is fully legitimate. To go beach→≤2× later needs ~14 more verified-themed photos (deferred — needs visual confirmation, no Unsplash API key in repo, `source.unsplash.com` dead/503).
> 2. **"VPS 403 P0" was a SANDBOX FALSE ALARM.** v56/v57 PM+DevOps reports declared VPS down "Day 3" — but those runs were in network-blocked Cowork sandboxes (the reports even note `raw.githubusercontent` 403 = egress allowlist, then wrongly concluded the *VPS* was down). Checked live from a networked host: `https://peakly-api.duckdns.org/health` → **200, `wx_cache_size:538`, poll worker running, uptime 3.2d**; `/api/weather` → 200. **VPS is healthy.** ⚠️ **Sandbox agents: a 403/timeout to duckdns or githubusercontent is your egress block, NOT a server outage — do not flag VPS down from a sandbox.** Only `apns:unconfigured` remains (known iOS-push-only, already gated).
> 3. **Root cause of "no commits in 3.4 days" (Open #11) found + fixed:** a stale `.git/index.lock` from June 11 09:10 was failing every auto-push with `could not write index`. Removed it; hook + `git add -A`/commit/push verified working again (commits `1449776`, `a143e4c` pushed clean). The 5 backlogged June-11/13 agent input reports + the regenerated eager-Supabase diff committed in `1449776` (a couple are stale sandbox-content artifacts — harmless dated inputs, superseded by pm-report v57). Net: the launch picture is GREEN for web — remaining items are Jack-manual (Supabase delete-account SQL paste for App Store, Reddit prep, LLC).

</details>

</details>

### What's Broken / Open (Priority Order)

**Top of the list as of 2026-07-25 (19/20/22 carried from 07-24, reprioritized/quantified per PM v99; 21 has an uncommitted local fix in progress; 23 is new):**

19. **VPS redeploy required — reclassified P1 "pre-traffic gate" by PM v99 (2026-07-25), was P2.** `server/proxy.js` fixes are committed but inert. Copy to `/opt/peakly-proxy` (NOT a git clone — `git pull` fails there) and `pm2 restart peakly-proxy`. Until then: two-weekend scoring stays off, iOS native can't reach the proxy, and alert deletion still silently fails. Verify after with `curl -s https://peakly-api.duckdns.org/health`. Bundle with #23 below (same SSH session).
20. **Photos: ~346 of 373 venues show generic stock unrelated to the venue.** Run `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait` → `photos-review.mjs` → `photos-apply.mjs --write`. This is the biggest remaining *quality* gap and Jack has flagged it directly.
21. **APNS will deliver zero pushes if wired today** — DER-vs-P1363 JWT signature + HTTP/1.1 `fetch` against an HTTP/2-only API. Fix both before touching the .p8. Alerts API also has no auth and guessable `Date.now()` ids. **2026-07-25: an uncommitted working-tree change exists locally that appears to fix both the HTTP/2 transport and the JWT encoding (`server/proxy.js`, `http2.connect` + `dsaEncoding: 'ieee-p1363'`), plus a separate uncommitted `app.jsx` change replacing `Date.now()` alert ids with `crypto.randomUUID()`. Neither is committed or verified working — do not mark this resolved until both are committed, syntax-checked, and a real APNs sandbox send is confirmed.**
22. **BASE_PRICES covers a minority of airports — quantified by Content 2026-07-25: 100 of 146 venue airports (≈68%) missing**, including CUN/BOB/AUA/STT/SXM (not just CUN/MIA/LAX). Backfill the top ~15 by venue count before launch; the deal score is a headline feature.
23. **Weather cache (`_wxCache`) is in-memory only — new finding, PM v99 (2026-07-25), P1 pre-traffic gate.** A `pm2 restart` (required by the #19 redeploy) wipes it, so a cold cache hit by a traffic spike right after redeploy could still exceed Open-Meteo's free-tier ceiling before it refills. ~30-line fix (disk persistence) in `server/proxy.js`. Bundle with #19 — same SSH session, same restart.

16. ~~**GEAR_ITEMS restored by DevOps agent against the documented v1 cut**~~ **RESOLVED 2026-06-10 via option (a) — re-affirmed the cut.** Commit `c112b51` had restored the Amazon gear const (treating absence as the old "revenue leak"); now reverted — const + VenueDetailSheet render gate removed, `grep -c GEAR_ITEMS app.jsx` → **0**, braces balanced, transpile clean. Root cause fixed: `tasks/agents/devops.md` carries a standing "AMAZON / gear modules — DO NOT TOUCH" directive so the findings-loop stops re-restoring it. Revenue Model stays $7.58/1K MAU; code and docs agree again.

13. ~~**GEAR_ITEMS (Amazon) silently removed overnight 2026-06-07 — Amazon stream now earns $0.**~~ **RESOLVED 2026-06-09 — Amazon formally CUT for v1 (Jack's call). GEAR_ITEMS stays removed; Revenue Model table corrected to $7.58. Revisit post-launch.** _(2026-06-10: DevOps re-restored it, promptly reverted again — Open #16 resolved, cut holds.)_ _(Original finding below for history.)_ `grep -c GEAR_ITEMS app.jsx` → **0**. Dropped 6→4→2→0 across three unlabeled `auto:` commits (`9656c6b`→`f8e9a51`→`12ebc13`) on June 7, ~9h after PM v51 green-lit it. Clean removal (braces balance, no crash, passes smoke) so it's pure revenue loss, not a render bug. **This is the second time it's vanished** (removed pre-05-24, restored `932943c`/`450891b` on 05-27 — now gone again). Live RPM drops **$12.06 → $7.58/1K MAU (−37%)**; the Revenue Model table below is now wrong. PM Decision (v52): RESTORE before launch (clean git restore from `9656c6b~1` tree) OR formally cut Amazon for v1 and fix the Revenue Model — "we'll see" not allowed. Root cause: the auto-push pipeline ships unreviewed logic changes with no diff review or paper trail (see Open #14).
14. ~~**Auto-push pipeline ships unreviewed logic changes to prod**~~ **FULLY RESOLVED 2026-06-10.** Invariant guard live in `scripts/auto-push.sh` (brace balance, cache-stamp lockstep, venue-count floor, diffstat commit bodies). **The residual grep-undercount gap is now CLOSED** — the venue-count check uses the same eval-based bracket-walker as `status.sh` (counts all 353, not the 156 the old `grep category:` saw), with a grep fallback if node errors so the guard never blocks on counter failure. `scripts/.venue-baseline` corrected 156→**353**. _(History: MITIGATED 2026-06-09 commit `948680b`; grep residual closed 2026-06-10. GEAR_ITEMS check intentionally omitted — Amazon cut for v1.)_
15. ~~**GitHub PAT expires 2026-06-15**~~ **RESOLVED 2026-06-10 — traced: the PAT has NO live consumer.** The token (`peakly-vps-deploy`) was created for VPS git-pull deploys that were never wired up. Verified: repo is **public** (raw.githubusercontent fetches need no auth — agent shims unaffected), local pushes are **SSH** (`git@github.com:`), and the VPS has **no git repo** (`/opt/peakly-proxy` is hand-copied code). Expiry on 06-15 breaks nothing. Jack regenerated a fresh token and holds it offline for future use (e.g. if the repo goes private or VPS git-deploy gets wired). The old "renew or SSH/HTTPS push breaks" claim was wrong — SSH never used the PAT. `peakly-token-renewal` weekly watch can be retired; `tasks/agents/devops.md` updated 2026-06-10 to stop flagging it.

1. ~~**Repo divergence — 18 days no commits** (last: a9a01e3, 2026-04-15). Working tree had real fixes (proxy.js dedupe + state notes) sitting unshipped.~~ **DONE 2026-05-03** (commits 6e964e9 + 35e60c2 shipped).
2. ~~**Amazon gear gate `{false && ...}` at app.jsx:5728** — leaks ~$11/mo/1K MAU. Open since 2026-04-10 (Day 23+).~~ **DONE 2026-05-04** — Revenue agent flipped to `{GEAR_ITEMS[listing.category] && ...}` at app.jsx:5704; merged via a9aacf5. Day-25 finding finally closed.
3. ~~**Marine batch loader at app.jsx:6748** — `needsMarine` only checks surfing; tanning venues score without water-temp data on Explore list. One-token fix. Open since 2026-04-10.~~ **DONE 2026-05-03** — closed alongside surf removal in pivot commit bb56aaf (`needsMarine` now checks `category === "beach"`).
4. ~~**`lateSeason: true` flag never wired up on any ski venue**~~ **DONE 2026-05-04 (expanded through 2026-05-05)** — **Current count: 14** (confirmed via code grep July 16, 2026): whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch, engelberg. Engelberg added July 14 (commit `747c35a`). Previous CLAUDE.md counts (6, 7, 13, 25) are stale — the count grew as venues were added. Always grep `lateSeason: true` in app.jsx for the authoritative count.
5. ~~**Active venue duplicates**~~ **DONE 2026-05-04** — only aruba-eagle-beach-t1 was a live dup (the other 4 cleared in 2026-05-03 surf retirement); deleted + boot-time dup-id validator IIFE added (app.jsx:528). PM report finding was stale.
6. ~~**Travelpayouts weekend-specific dates not wired**~~ **CODE DONE 2026-05-04, AWAITING VPS REDEPLOY** — `proxy.js` now accepts `depart_date`/`return_date`; client `fetchTravelpayoutsPrice` passes upcoming Fri date via `upcomingFridayISO()`. Backward-compatible (no-args → legacy month-cheapest). Jack must SSH to 198.199.80.21, `cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy` (or `npm install` if deps changed — they didn't this round). **PARKED 2026-06-08 (Day 35) — graduated to `reports/known-skipped.md` per two-strikes rule.** Site runs fine on direct Open-Meteo + legacy month-cheapest pricing; redeploy is an enhancement at <10 MAU. Re-flags the moment MAU crosses 100 (weather cache becomes Reddit-spike protection — see #7) or a user reports wrong/stale weekend fares. Still the stated **launch gate** for any Reddit/HN post (PM v52 Decision 3).
7. ~~**Open-Meteo weather cache still unbuilt**~~ **CODE DONE 2026-05-04, AWAITING VPS REDEPLOY** — proxy now exposes `/api/weather` + `/api/marine` with shared in-memory 2hr cache + in-flight dedupe. Client `fetchWeather`/`fetchMarine` try proxy first, fall back to direct Open-Meteo. Reddit-spike protection: N simultaneous users hitting the same (lat,lon) trigger 1 upstream call. Same redeploy path as #6. **PARKED 2026-06-08 alongside #6 (known-skipped).** Per DevOps 06-08: "what breaks first at scale" is still Open-Meteo's free-tier rate ceiling (~66+ concurrent DAU on the same venue set throttles) — this cache is the prevention, and the instant a Reddit/HN post lands it jumps from enhancement back to P0.
8. ~~**No onboarding scoring explanation** — new users dumped into Explore without context for how conditions + "window" scoring works.~~ **DONE 2026-06-09 (commit `948680b`)** — `<ScoringExplainer>` component (app.jsx ~8071): one-time dismissible "How Peakly scores your weekend" card in the Explore feed (renders when `!loading`, above InstallNudge). Explains Fri–Mon window + best-2-days + price weighting + honesty-when-uncertain. Dismissal persisted in `peakly_scoring_explainer_dismissed`; Plausible event `scoring_explainer`. Onboarding flow itself untouched (friction-free contract preserved).
9. ~~**Strike alerts server polling**~~ **CODE DONE 2026-05-07, AWAITING APNS .p8 + VPS REDEPLOY** — proxy.js now has 30-min polling worker, conservative heuristic matcher, native APNS sender (HTTP/2 + JWT via crypto, no deps). Client posts pushToken + venue lat/lon to `/api/alerts`. Test-fire endpoint guarded by `ALERTS_TEST_ENABLED=true` for App Store review. Setup runbook: `peakly-native/PUSH_SETUP.md`. Persistence still in-memory (Phase 2C deferred to v2 — see plan). Required env: `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_BUNDLE_ID`, `APNS_KEY_PATH`, `APNS_PROD=true`. **PARKED 2026-06-08 (~23d past the 05-13 deadline) — graduated to `reports/known-skipped.md`.** `apns_configured: false` until Jack runs the 5 `pm2 set` calls. The #12 fallback is now SHIPPED: `Capacitor.isNativePlatform()` gate is live in app.jsx (3 sites), so iOS v1 can ship without push. Web product unaffected. Re-flags only if an App Store submission is actually queued.
10. **No SRI on CDN scripts** + **no CSP meta** — security hardening; medium risk to apply (could break Babel inline eval). Flagged but not touched.
11. **Auto-push pipeline orphans scheduled-task agent writes** — `scripts/auto-push.sh` fires from Claude Code's PostToolUse hook on Edit/Write inside `~/peakly` (hook now live in `~/.claude/settings.json` as of 2026-05-09 late evening). Catches Jack's local Claude sessions only — scheduled-task agents (devops/pm/content/revenue/ux daily runs) execute outside the hook's catchment, so their writes silently never commit until the next manual edit. Recommended supplement: add `45 17 * * * cd ~/peakly && bash scripts/auto-push.sh` to local crontab after the 17:30 daily-briefing slot. Two-minute install. Without it, every report after today reads stale state and re-surfaces findings the previous run already closed.
12. **APNS configuration deadline 2026-05-13** (PM call 2026-05-09) — Strike Alerts code is shipped but `apns_configured: false` until Jack runs the Apple Dev console + 5 `pm2 set` calls (runbook: `peakly-native/PUSH_SETUP.md`). 72h on the critical path with no movement. PM forcing function: by end-of-day Wednesday 2026-05-13, either APNS is live (`/health` shows `apns_configured: true`) OR add `Capacitor.isNativePlatform()` gate to hide the Alerts tab on iOS specifically and ship App Store v1 without push. Web product preserved either way; polling worker preserved for future native re-enable. **RESOLVED via fallback 2026-06-08** — the `Capacitor.isNativePlatform()` gate shipped (3 sites in app.jsx); iOS v1 can launch without APNS. APNS itself remains parked in known-skipped (see #9). The deadline is moot; the fallback path is the decision.

### Recently Fixed (2026-07-25 — iOS widget + App Store listing copy; sync agent note)

- ✅ **iOS home-screen widget shipped in-repo** (commit `ffacbd7`) — WidgetKit small/medium widget showing the current best-weekend pick (venue, score, conditions, round-trip fare), deep-links to the venue detail sheet via `peakly://`. New `ios/` directory: `PeaklyWidgetBridge.swift`/`.m` (Capacitor plugin, writes the pick to a shared App Group + triggers a WidgetKit reload), `PeaklyWidget.swift` (timeline provider + SwiftUI layouts), entitlements + Info.plist for both the main app and the widget extension. `app.jsx` writes the top pick after every scoring pass and handles the `peakly://` tap. **Code-complete but not yet wired into Xcode** — needs a one-time ~15 min GUI step (new Widget Extension target, drag in the real files, App Group capability, deployment target iOS 17.0) documented step-by-step in `ios/WIDGET-SETUP.md`. Framed there as the strongest available mitigation for App Store Guideline 4.2 (minimum functionality) risk on a Capacitor-wrapped web app.
- ✅ **App Store listing copy drafted** (commit `060ad85`) — `app-store/LISTING-COPY.md`: paste-ready name ("Peakly: Ski & Beach Weekends", 28/30 chars), subtitle + alternates, keywords (95/100 chars), all character-count verified against Apple's limits. Explicitly avoids claiming features that are gated off (push alerts) or venues that don't exist.
- ⚠️ **Working tree left dirty at end of session** — `server/proxy.js` (APNs HTTP/2 + JWT P1363 fix) and `app.jsx` (alert-id `crypto.randomUUID()` fix) both have uncommitted changes that address Open #21. Not committed, not tested, not deployed — see Open #21 and the 2026-07-25 Current State block above for detail. Whoever picks this up next should finish and commit it rather than starting over.
- **Sync-agent note:** this file was updated by an automated CLAUDE.md sync run. `git fetch` failed in the sandbox (no network egress — "Host key verification failed"), so per this file's own git-fetch-first rule, the state above is sourced from the **local checkout only** and is unverified against `origin/main`. Re-verify from a networked session before treating it as ground truth.

### Recently Fixed (2026-06-10 evening — VPS maintenance + PAT closed out, Jack hands-on)

- ✅ **VPS fully patched + rebooted** — Jack SSH'd in: `apt upgrade` (56 packages incl. caddy 2.11.2→2.11.4, node 20.20.1→20.20.2, snapd, cloud-init) + reboot onto new kernel **6.8.0-124** (was -71; restart had been pending). pm2 resurrected `peakly-proxy` automatically post-reboot — `/health` verified ok within a minute (wx cache reset to 0, refills on traffic). Zero updates now pending.
- ✅ **GitHub PAT #15 closed** — traced to no live consumer (public repo / SSH pushes / no git on VPS); new token regenerated, held offline; devops.md prompt updated so the agent stops flagging it. Note for future deploys: `/opt/peakly-proxy` is NOT a git clone — `git pull` there fails ("not a git repository"); VPS deploys are manual copy until git-deploy gets wired (the PAT's original purpose).

### Recently Fixed (2026-06-10 — App Store submission readiness)

- ✅ **Account deletion (Guideline 5.1.1(v), mandatory)** — `server/sql/delete-account.sql`: `delete_user()` SECURITY DEFINER fn deletes the caller's `user_data` + `shared_lists` rows + their `auth.users` identity (only ever `auth.uid()`), execute granted to `authenticated` only. Client: `deleteAccount()` added to `useCloudSync` (rpc → clear SYNCED_KEYS locally → signOut → `account_deleted` event; graceful "not switched on yet, email us" message if the RPC isn't deployed). UI: red **Delete account** row in `ProfileSyncSection` signed-in state, below Sign out — two-step confirm requiring typed `DELETE`, spells out exactly what's deleted (cloud data) vs. kept (this device). **⚠️ Jack: paste `server/sql/delete-account.sql` into the Supabase SQL editor once to activate** (until then the client shows the graceful fallback).
- ✅ **Cold-start reviewer-proofed** — audited the no-localStorage / no-geo / weather-failing path: skeletons while loading, venues survive total weather failure (score 50 + estimate fares, never a blank grid), carousel header gated on ≥3 cards, empty state filter-aware, no ErrorBoundary risk. Added a **`weatherDown` "conditions unavailable — pull to refresh" banner** (ExploreTab) for the all-fetches-failed state. Verified by stubbing `fetchWeather`→null + Playwright: banner renders, 30 cards render, no ErrorBoundary, zero pageerrors.
- ✅ **iOS alert-copy honesty** — new module const `ALERTS_AVAILABLE` (`= iOS ? APNS_LIVE : true`); `showAlertsTab` now derives from it. Gates the push-promise copy off iOS native at onboarding bullet, ProfileSyncSection heading + CTA, ProfileTab signed-in line, and hides the "Notify me" email-capture waitlist. All alert *buttons* (card bell, detail-sheet, empty-state CTA) were already gated — this closes the misleading-*copy* gap so a reviewer never reads a notification promise the device can't keep.
- ✅ **Auto-push guard residual closed** (Open #14) — venue-count check swapped grep→eval counter; `.venue-baseline` 156→353. Working tree confirmed clean (book_click + ToS/Privacy links were already committed; the stale "uncommitted" flag is cleared). Landed in commit `9808971` alongside the day's input reports + `server/sql/delete-account.sql` + `reports/ready-to-ship/alert-copy-email-honesty-2026-06-10.diff`.
- ✅ **Save/account-sheet copy reframed to email-first voice** (commit `350addc`) — onboarding "save" sub-copy → "We'll keep your favorite spots saved across every device — just your email, no password"; combined-intent copy → "shoot you an email every time they're firing" (matches the alert-honesty voice; no push promise). Cache `20260610a`→`20260610b`.
- ✅ **GEAR_ITEMS re-cut (Open #16 resolved)** — the DevOps daily run restored the Amazon gear const on 06-10 (commit `c112b51`) against Jack's cut; reverted (`grep -c GEAR_ITEMS app.jsx` → 0) and `tasks/agents/devops.md` given a standing "do not touch" directive so it stops recurring.
- ✅ **Cache stamp at `20260610s` end of day** — ~20 `auto:` commits through 17:36 PDT shipped the account-deletion UI + ALERTS_AVAILABLE copy gating documented above; smoke pipeline intact.

### Recently Fixed (2026-06-09)

- ✅ **UX sweep (evening, Jack's 4 asks):**
  1. **Explore top decluttered** — removed the ❤️ saved-venues pill + collapsible "Saved venues" strip from the toolbar; **category pills enlarged** (font 11→13, weight 700→800, padding 4px→9px, gap 4→8) so Skiing/Beach are easier to see + tap. Saved venues **relocated to the Profile tab** (new "Saved venues" carousel — `ProfileTab` now takes `listings`/`wishlists`/`onToggle`/`onOpenDetail`); hearts still work, nothing lost. `showSaved` state removed.
  2. **+14 Southern-hemisphere ski venues** (see Current State) — summer ski inventory.
  3. **Grid ranks by Weekend Score** — `applyFilters` default "score" sort now keys on `weekendScore` (the Fri–Mon moat the hero + carousel already use) with a stable `dealScore→price→id` tiebreak (kills order jitter on ties); the other sorts got the `id` tiebreak too. `SORT_OPTIONS` "Best conditions" → **"Best weekend"**.
  4. **Plan-a-Trip (`SearchSheet`) polish** — airports row now shows **all 16** `US_AIRPORTS` (added IAH+PHL) in an even 4×4 grid (was 10-of-14, ragged); **Region bubbles** enlarged/rounded (padding 6→10px, radius 16→20, font 11→13, selected lift-shadow). **"Sort by" verified already functional** — no change needed.
- ✅ **Auto-push invariant guard live** (commit `948680b`) — closes Open #14. Brace-balance + cache-stamp-lockstep + venue-count-floor checks before any app.jsx commit; diffstat commit bodies for app.jsx. See Open #14 for the residual gap (venue check still greps → blind to JSON-format batch entries; baseline 156 vs real 339 — swap in the eval counter).
- ✅ **`<ScoringExplainer>` shipped** (commit `948680b`) — closes Open #8. One-time dismissible scoring-education card in Explore. Cache stamp → `20260609d`.
- ✅ **`status.sh` venue count now eval-based** (commit `b2520ae`) — embeds the node bracket-walker one-liner, prints `339 (116 skiing / 223 beach)`. The grep-undercount class is dead in status output; auto-push guard still needs the same fix.
- ⚠️ **Uncommitted working-tree change (as of 2026-06-09 sync agent run)** — app.jsx has two unshipped edits: (1) FeaturedCard Book button now fires haptic + Plausible `book_click` event (pre-launch checklist item), (2) ToS/Privacy links added to Profile footer pointing at `terms.html`/`privacy.html` (both files committed since 2026-05-09, commits `152b529`/`58ef15a`). The per-Edit hook normally commits everything — this sitting dirty is unusual; commit it (will close two pre-launch items) or check `/tmp/peakly-auto-push.log` for a guard refusal.
- ✅ **+134 beach venues DID land (commit `7561a18`)** — confirmed 2026-06-09 by `eval`-counting the array: beach 89→223, total catalog now **339** (116 ski / 223 beach), all IDs unique, all render-critical fields present. The 2564 lines `7561a18` added were the batch (pasted as pretty-printed JSON) + tag-chip removal. The reason this looked like "never landed / still 156" in reports is a counting bug: the batch venues use quoted JSON keys (`"category": "beach"`) so a `grep category:"..."` misses them. `data/venue-candidates.json` re-runs through `validate-venues.mjs` as **134/134 rejected (R2 — already in VENUES)**, which is the proof they're all already in. Nothing to add. **Count via eval, not grep.**
- ✅ **Fixed ExploreTab crash `flightsLoading is not defined`** (commit `dfee1ba`) — the "Firing this weekend" carousel header (app.jsx ~8576) referenced bare `flightsLoading`, a `useState` that lives in App root, NOT in ExploreTab scope → ReferenceError → ErrorBoundary "Something went wrong" whenever the carousel rendered (`carouselReady`, ≥3 venues). Latent bug surfaced by the venue batch populating the carousel. Replaced with in-scope `activeListings.some(l => l.flightsLoading)`. **Smoke did NOT catch it** — headless has no weather, so `carouselReady` stays false and that branch never renders. Audited the rest of ExploreTab's single-word JSX refs; no other out-of-scope bombs.
- ✅ **Tag chips removed from cards** (commit `7561a18`) — per Jack ("too crowded"): stripped the 3-chip row on the Explore grid card + the italic first-tag on the carousel card. `tags` DATA retained (search corpus + Powder Day filter + detail-sheet display still use it). Detail-sheet tag chips kept (not crowded, info-dense view).
- ✅ **Amazon CUT for v1** (Jack, see Open #13) — GEAR_ITEMS stays removed; Revenue Model corrected to $7.58/1K MAU honest number.
- ✅ **VPS verified ALREADY LIVE** — `/health` + `/api/weather` prove weather cache (#7), weekend pricing (#6), and alerts polling (#9) are deployed and serving. The "VPS Day 35/36 binary blocker" in PM v52/v53 was stale. Only APNS (#9) remains unconfigured. Open #6/#7 are effectively DONE; #9 is APNS-only.

### Recently Fixed (2026-06-05 → 2026-06-08)

- ✅ **Cache-buster auto-bump is now STRUCTURAL** (`scripts/auto-push.sh` lines ~40–86) — the hook self-bumps `PEAKLY_BUILD` whenever any of `app.jsx`/`sw.js`/`index.html` change: resets to `${TODAY}a` if the stamp is from a prior day, else increments the suffix (`a→…→z→aa`), rewriting all three files in lockstep via `perl -pi`. DevOps recommended this for three runs (05-26/05-31/06-04); now live. **The recurring "stale cache buster" P0 class is structurally dead — stop reporting it.** Current stamp: `20260608z`. (The high suffix letters reflect ~30 auto-pushes/day from the per-Edit hook — expected noise, not a bug.)
- ✅ **APNS `Capacitor.isNativePlatform()` gate live** (app.jsx, 3 sites) — the CLAUDE.md #12 fallback shipped; iOS v1 can launch without push. Alerts tab gated on native iOS where APNS isn't configured. Web product unaffected.
- ✅ **Venue-expansion validation pipeline added** (`scripts/validate-venues.mjs` + `scripts/README-venues.md` + `data/venue-candidates.example.json`) — vets new venues against 10 consistency rules (required fields, dup IDs, coord bounds, AP-in-`AP_CONTINENT`, etc.) before they're hand-pasted into the hardcoded VENUES array. Drop candidates in `data/venue-candidates.json`, run `node scripts/validate-venues.mjs`, read `data/venue-rejected.md`, paste `data/venue-accepted.json`. No npm deps (built-in `fetch`). Keeps the no-build single-file constraint while making venue adds accurate.
- ✅ **iOS build tooling** (`scripts/build-ios.mjs` + `scripts/build-ios.sh`, June 7) — Capacitor iOS build/vendor-cache scaffolding. `.vendor-cache/` gitignored as build artifact (commit `a7f10c1`).
- ✅ **5 venues added 2026-05-27** (commit `932943c`): `beach_maldives`, `beach_mirissa`, `beach_oludeniz`, `ski_mzaar`, `ski_oukaimeden`. Net VENUES count holds at **156** (67 ski + 89 beach) after offsetting deletions/dedup. GEAR_ITEMS was also restored in this commit (since regressed — see Open #13).
- ✅ **Supabase lazy-load fix** (commit `961a246`, 2026-06-06) — re-aligned eager-`<script>` lazy-load behavior per the documented contract.
- ✅ **Two-strikes graduations 2026-06-08** — VPS proxy redeploy (Day 35) + APNS keys both moved to `reports/known-skipped.md` after appearing unchanged in 05-31 + 06-04. Both are Jack-only manual actions; neither blocks the live web product. See Open #6/#7/#9.

### Recently Fixed (2026-05-09 late evening — branch hygiene + history scrub + hook live)

- ✅ **86 stale `claude/*` worktrees + 86 local branches + 19 stale remote branches deleted** — was carrying 30+ days of abandoned exploratory cloud-agent attempts. 20 unmerged patches archived to `/tmp/peakly-claude-worktrees-archive-2026-05-07.tgz` (63 MB, restorable via `git am`) before nuking.
- ✅ **3 active remote branches merged + deleted** — `claude/codebase-review-NIWTj` (parallel Travelpayouts attempt), `claude/implement-todo-item-igUtK` (alerts polling), `claude/implement-todo-item-Zbyjf` (alert client registration). All three were duplicates of work already on main; merges took HEAD's deployed version. Net code change: 0. Branches deleted post-merge.
- ✅ **PostToolUse hook authorized + live in `~/.claude/settings.json`** — fires `scripts/auto-push.sh` after every Edit/Write/MultiEdit tool call. Bumps cache key in lockstep, commits, rebases, pushes `master:main`. Verified working with test edits to `scripts/status.sh`.
- ✅ **Business plan PDF/PPTX leak detected + scrubbed** — auto-push false-positive picked up `Peakly-Business-Plan.pdf` + `.pptx` + LibreOffice lock file at 21:11 PDT, force-pushed to main. Detected at 21:13 via status check. Stage 1: untracked + .gitignore updated (`*.pdf`, `*.pptx`, `Peakly-Business-Plan.*`, `.~lock.*`) (commit `887a2c3`, live `404` within 60 sec). Stage 2: full history scrub via `git-filter-repo --invert-paths` + `--force` push to origin/main. Live exposure window: ~4 minutes. Pre-scrub state tagged `pre-scrub-2026-05-09` locally. **Anyone with a stale clone of main must `git fetch && git reset --hard origin/main` — all commit hashes were rewritten.** GitHub blob cache will gc orphan SHAs over a few weeks.

### Recently Resolved by Documentation (2026-05-09)

- **Pro UI revival** — was "decision pending (kill or ship)" in the Revenue Model table. Formally **CUT** for v1 per PM 2026-05-08 + 2026-05-09 reports. Off the table; revisit post-1K MAU if a real revenue gap emerges.
- **Eager Supabase `<script>` in `index.html:85`** — graduated to `reports/known-skipped.md` per two-strikes rule (3 reports unchanged: 05-06 + 05-08 + 05-09). Diff stays at `reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff` (1478 bytes, `git apply`-clean, 30-sec apply). Re-flag if cold-load TTI becomes a measurable bounce driver post-Reddit-launch.
- **Unsplash `auto=format&q=75`** — graduated to `reports/known-skipped.md` (3 reports unchanged). ~7 MB savings on a full Explore scroll. Sed block in `devops-2026-05-06.md` §P1-images. Re-flag once MAU > 100 OR Sentry shows LCP regression.
- **`scripts/deploy-chain.sh`** — written by PM 2026-05-09 as a one-paste deploy chain (commit dirty files → push → SSH VPS → `pm2 restart` → smoke-test). Idempotent, supports `--dry-run`. Closes the "stuck behind one of five steps" pattern that ate 37 hours between 05-07 and 05-09.

### Recently Fixed (2026-05-07 evening — ship-pipeline scripts)

- ✅ **`scripts/auto-push.sh`** (commit 76ad31c) — fires from Claude Code PostToolUse hook on Edit/Write inside `~/peakly`. Bumps cache key in lockstep, commits, rebases, pushes `master:main`. Silent no-op outside peakly or when nothing changed. Visible in git log as the wave of `auto: <file>` commits 2026-05-07 19:48–20:04.
- ✅ **`scripts/status.sh`** — "all the work on one page" view: branch state, ahead/behind, build, dirty files, last 8 ships, ready-to-ship diffs, today's briefing, agent inputs, worktree count, auto-push log tail.
- ✅ Same commit also tracked orphan agent artifacts that were sitting untracked in the working tree (cloud agent reports, ready-to-ship diffs, `server/sql/share-lists.sql`).

### Recently Fixed (2026-05-07 evening — Phase 2: Strike alerts production-ready)

- ✅ **Polling worker + APNS push delivery** (server/proxy.js) — `setInterval(checkAlerts, 30min)`, configurable via `ALERT_POLL_MINUTES` env (min 5min). Groups alerts by venue lat/lon to dedupe upstream weather fetches (reuses `_wxCache`). 6h refire cooldown per alert. Native APNS sender via HTTP/2 fetch + JWT-signed-with-`crypto` (no `node-apn` dep). `/health` exposes poll stats + APNS status.
- ✅ **alertMatches heuristic** (proxy.js ~388) — conservative server-side condition match. Ski: snow depth + temp; Beach: UV + sun + temp + precip. Errs toward false negatives over false positives — push only when conditions clearly hit. Canonical client engine (`scoreVenue`) stays untouched; drift accepted as scope cost (revisit if alerts feel too quiet post-launch).
- ✅ **pushToken → server linkage** (app.jsx `addAlert`) — fire-and-forget POST to `/api/alerts` with venueLat/Lon/ap/category + Capacitor pushToken from localStorage. `delAlert` mirrors DELETE. Web users (no native push) skip server registration cleanly. Plausible events: `alert_registered_server`, `alert_register_failed`, `alert_register_error`.
- ✅ **Test-fire endpoint** (`POST /api/alerts/:id/test`, guarded by `ALERTS_TEST_ENABLED=true`) — App Store reviewers + dev can verify push delivery without waiting for natural poll cycle.
- ✅ **PUSH_SETUP.md runbook** (peakly-native/) — full Apple Dev console + .p8 key + VPS env steps + reviewer notes for App Store submission. Persistence (Supabase migration) deferred to v2; runbook calls out the limitation.
- ✅ Cache key 20260507d → 20260507e.

### Recently Fixed (2026-05-07 PM — Phase 1: 7-day commitment + Why-this-score expander)

- ✅ **`<ScoreBreakdown>` component** (app.jsx ~6508, before VenueDetailSheet) — collapsible "Why this score?" panel inside the detail sheet. Renders Conditions / Price / Confidence rows + Verdict, mirroring `scoreWeekendDeal`'s 50/50 weighted math. Three states: live deal (full breakdown), estimate price ("flight pricing isn't live yet"), low confidence ("Beyond reliable forecast"). Score was a black box → trust erodes; now it's auditable per-row. ScoreRow helper kept inline.
- ✅ **7-day window commitment** (app.jsx `getFlightDate` ~1652 + `WHEN_OPTIONS` ~2828) — stripped `twoweeks/month/nextmonth/60days/90days/winter/spring/summer/fall`. Default = upcoming Friday. WHEN_OPTIONS now: "This weekend / Next 7 days / Anytime" — all collapse to upcoming Fri because that's the only horizon Open-Meteo can honestly back. `scoreWeekendDeal` low-confidence return now sets `label: "Beyond 7-day window"` so the UI explains the absence rather than silently dropping the venue.
- ✅ **Vision + copy alignment** (CLAUDE.md, README.md, manifest.json) — vision now reads "7-day window is the product, not a limit." Hotels formally deferred to v2 in the principles list. README + manifest description tightened to call out the 7-day horizon.

### Recently Fixed (2026-05-07 — UX course-correct: spontaneous flight default + filter-aware empty state)

- ✅ **Default `maxFlightHrs` to 6** (app.jsx:7616 + SearchSheet reset) — was `null` = global results from a "spontaneous weekend" app, defeating the brand promise. Power users override via the chip's × or "Clear all." Auto-detect home airport already covers the no-airport case (geolocation fallback → silent bypass at applyFilters). Exceptional venues (`weekendScore >= 95`) still override the cap so a perfect powder day a continent away can surface.
- ✅ **Filter-aware empty state** (app.jsx ~4327) — heading + sub-copy + CTAs now reflect WHY the grid is empty. `≤Nhr flight` set → "Try ≤8hr" or "Show all flight times" CTA. Specific category → "Show all categories." Any active filter → "Clear all filters" fallback. Old state was a single generic "Nothing great this weekend" + "Set an alert" — silent void on filter-driven empties was a bounce-magnet.

### Recently Fixed (2026-05-04 late evening / 2026-05-05 — Supabase cloud sync LIVE + share-a-list viral loop)

- ✅ **B.4 Supabase cloud sync — magic-link auth, user-valuable subset** (commits ab692d3 + b92f653 + 011b8dc + 028162a) — implements the data-loss problem fix from the audit. `SYNCED_KEYS` = wishlists / named_lists / alerts / trips / profile sync to Supabase Postgres via magic-link auth; caches/error logs/push token/install-dismissed flag stay local-only. Anon-visitor flow unchanged (no nag, no banner). Lazy-loaded Supabase JS UMD (~80KB gzipped) — only loads when there's an existing session, magic-link callback, or user taps "Sign in." `useCloudSync` hook in App root returns `{enabled, status, user, signIn(email), signOut(), syncNow}`. 500ms debounced upsert to `user_data.data` jsonb on every SYNCED_KEY write. Conflict resolution: last-writer-wins by server.updated_at. ProfileSyncSection (email + Send link / Sign out) + SyncStatusPill in Explore header. SUPABASE_URL = `https://wsoqcfwkvvemtlddcgfc.supabase.co` + anon key wired → `CLOUD_SYNC_CONFIGURED = true`. **Live as of 2026-05-04 evening — sync UI now visible to all users.** Plausible logging: `cloud_sync` events.
- ✅ **B.8 Share-a-list viral loop** (commit d8560a1) — `shareList()` snapshots a named list to Supabase `shared_lists` with 8-char URL-safe slug; `fetchSharedList()` is public-read with view-count RPC bump. `<SharedListView>` is a full-screen recipient view with sign-in CTA + no nav distractions. `MyListsSection` in Profile gets per-list Share button (sharer must be signed in). `?l=<slug>&r=<owner_id>` URL parser on App mount → `importSharedSnapshot` appends "From a friend: <name>" namedList, writes `profile.referred_by`, strips URL, shows toast. Pending-import in localStorage survives the magic-link tab switch. **REQUIRES SQL DEPLOY before share button works** — see `~/.claude/plans/effervescent-jumping-hopper.md` for the schema + hand-off.
- ✅ Cache key bumped 20260504j → final state across sw.js / app.jsx / index.html. Brace balance: 4936/4936.
- ✅ Working tree improvements absorbed: `scoreWeekendDeal()` unified deal score, "Cheap flight + firing weather" carousel, `lateSeason` flags now on Cervinia + Val d'Isère + Chamonix Mont-Blanc.

### Recently Fixed (2026-05-04 evening — weekend-pricing wire-up + weather proxy + 50/50 deal weight)

- ✅ **Travelpayouts weekend-specific dates** (proxy.js + client) — `proxy.js` `/api/flights` accepts optional `depart_date`/`return_date` (YYYY-MM-DD), filters month-matrix to exact-date matches, returns single weekend-specific price. Client `fetchTravelpayoutsPrice(origin, dest, departDate, returnDate?)` + new `upcomingFridayISO(today)` helper threads upcoming Fri through the App-level price-fetch effect. Cache key includes departDate so different weekends don't collide. Backward-compatible: omitted args → legacy month-cheapest. **Awaiting VPS redeploy on 198.199.80.21.**
- ✅ **Open-Meteo proxy with shared cache** (proxy.js + client) — new `/api/weather` and `/api/marine` endpoints proxy Open-Meteo with shared in-memory 2hr cache (4000-entry LRU) + in-flight dedupe (1000 simultaneous users hitting the same uncached coord = 1 upstream call). Coords rounded to 2 decimals (~1.1km grid) so neighbouring venues share entries. Client `fetchWeather`/`fetchMarine` try proxy first via `_tryProxyWx()` (4s timeout), fall back to direct Open-Meteo if proxy is down or returns non-success. P0 Reddit-spike protection.  **Awaiting VPS redeploy.**
- ✅ **scoreWeekendDeal weight rebalanced** — was conditions × 0.65 + clamp(priceBonus, -15..35) × 0.35. Now both signals normalized 0-100; split started at 50/50 (2026-05-04), then revised 75/25 conditions/price in commit `18606a7` (2026-05-13, "Scoring honesty pass"). **Current: `DEAL_WEIGHT = 0.25`** (conditions 75%, price 25%). Rationale: a cheap fare to a rainy weekend shouldn't outrank an expensive flight to a powder day. Future profile slider can wire to `DEAL_WEIGHT`.
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

### Older fixes

For 2026-04-15 and earlier (proxy cleanup, 18 algorithm holes 04-14, 7 algorithm holes 04-12, accuracy + honesty pass 04-11, launch-scope pass 04-10), see **CHANGELOG.md**.

### Open Pre-Launch Items

- iOS App Store: Apple Developer enrollment ($99/yr) + `npx cap add ios` + Xcode build
- Replace placeholder affiliate IDs (GetYourGuide, Backcountry — LLC approved)
- Register `peakly.app` domain
- Terms of Service / Privacy Policy — pages SHIPPED (`terms.html` + `privacy.html`); Profile footer links COMMITTED 2026-06-10
- **Account deletion SQL — Jack: paste `server/sql/delete-account.sql` into the Supabase SQL editor once** (App Store 5.1.1(v); client ships the graceful fallback until then)
- Google Play Store via PWABuilder/TWA ($25)
- ListingCard "Book" button Plausible event — `book_click` COMMITTED 2026-06-10

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

`peakly-token-renewal` weekly watch: **RETIRE** — PAT traced 2026-06-10 to
no live consumer (see resolved #15); its expiry is a non-event.

### Source of truth

The local `tasks/agents/<role>.md` file is canonical. Each remote routine's
`SKILL.md` is a thin shim that `curl`s the canonical prompt from
`raw.githubusercontent.com/j1mmychu/peakly` so edits to the local prompt
flow to the next remote run automatically. Don't edit remote SKILL.md
directly — edit the repo file.

### Output flow

- Input agents write to `reports/inputs/<role>-YYYY-MM-DD.md` — **NOTE (2026-06-08): paths have drifted.** PM, DevOps, and Content now write rolling single files (`reports/pm-report.md`, `reports/devops-report.md`, `reports/content-report.md`) rather than dated `inputs/` files (PM's been doing this since v44 to keep the briefing pipeline stable). Dated `inputs/` files still appear sporadically (e.g. `reports/inputs/devops-2026-06-08.md`). Read the rolling files first for current state.
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
| Amazon Associates (`peakly-20`) | ❌ CUT for v1 (2026-06-09, Jack) — GEAR_ITEMS stays removed; revisit post-launch | $0 (not in v1) |
| Booking.com (`aid=2311236`) | LIVE | $6.90 |
| SafetyWing (`referenceID=peakly`) | LIVE | $0.54 |
| Travelpayouts (HTTPS proxy, TP_MARKER=710303) | LIVE | $0.14 |
| REI (Avantlink signup pending) | $0 | +$6.16 |
| Backcountry / GetYourGuide | $0 | +$1.84 |
| Peakly Pro | UI REMOVED 2026-04-16 — decision pending (kill or ship) | TBD |

**Live RPM:** **~$7.58/1K MAU** (3 streams: Booking $6.90 + SafetyWing $0.54 + Travelpayouts $0.14). **Amazon formally CUT for v1 on 2026-06-09** (Jack) — GEAR_ITEMS stays out, this is the real v1 number, no phantom $4.48. **With GYG partner_id added:** +~$1.68. Revisit Amazon post-launch if a real revenue gap appears.

> **2026-06-10: table matches code.** A DevOps daily run briefly restored the Amazon gear modules (commit `c112b51`); it was reverted same day (Open #16). `grep -c GEAR_ITEMS app.jsx` → 0. This table ($7.58, Amazon cut) is accurate.

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
3. Distance-aware filter — `Within Nhr flight` toggle so spontaneous trips stay actually spontaneous (DONE 2026-05-03 — Block C, commit dc92123; ≥95 weekendScore overrides the cap; 6hr default 2026-05-07)
4. Live weekend pricing — query Travelpayouts with actual Fri–Mon dates (DONE 2026-05-04, awaiting VPS redeploy)
5. Strike Alerts — server-side polling worker fires push when conditions hit user's target. Required for App Store review (in progress 2026-05-07)
6. Group coordination
7. Crowd intelligence

**Strategic principles:**
- **Niche down before expanding.** Skiing + beach only — surfing retired 2026-05-03 to focus the algorithm and brand.
- **7-day window is the product, not a limit.** Open-Meteo forecasts 7 days reliably; we don't sell certainty beyond what it can back. WHEN_OPTIONS reduced to "This weekend / Next 7 days / Anytime" 2026-05-07. No 30/60/90-day or seasonal options — they were dead UI promising scores we couldn't honestly produce.
- **Don't sell certainty you don't have.** Forecast confidence is a first-class signal — `low` confidence weekends never reach the front page; ScoreBreakdown surfaces the reason.
- **Lean before launch.** Hotels in deal score deferred 2026-05-07 — too much scope; ship flights+conditions first, fold hotels in v2 if user demand validates.
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
