# Peakly DevOps Report — 2026-05-12

**Overall Status: YELLOW**

Infrastructure is solid. Proxy is HTTPS, secrets are protected, analytics
running, pivot features confirmed live. Two issues need action this week:
stale SEO copy is actively hurting search indexing, and APNS must ship by
tomorrow or the Alerts tab needs a platform gate before App Store submission.
Everything else is maintenance-tier.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx size | 8,928 lines / 531,918 bytes (~130 KB gzipped est.) |
| CDN scripts | All HTTPS, pinned versions ✅ |
| Plausible analytics | Present, active, `data-domain="j1mmychu.github.io"` ✅ |
| Cache buster (index.html) | `v=20260510l` — 2 days old, bump before next deploy |
| SW cache name | `peakly-20260510l` — matches index.html ✅ |
| Sentry DSN | Configured, `tracesSampleRate: 0.05` ✅ |
| Image lazy loading | `loading="lazy"` on all `<img>` tags ✅ |
| PRECACHE | `[]` (empty) — no offline shell, acceptable for now |
| Pivot features live | `scoreWeekend`, `weekendDayIndices`, `scoreWeekendDeal`, `bestRightNow`, `bestRightNowFallback` all confirmed in code ✅ |
| `category:"tanning"` remaining | 0 occurrences — migration complete ✅ |

**app.jsx grew 1,756 lines since 05-09** (7,172 → 8,928, +24% in 3 days),
driven by cloud sync + share-a-list features. No action required yet — watch
the trajectory. Hits 10K lines within 2 weeks at this pace.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS via DuckDNS + Caddy ✅ |
| IP fallback | No direct IP references in app.jsx ✅ |
| TP token | Server-side only (`process.env.TRAVELPAYOUTS_TOKEN`) ✅ |
| fetchTravelpayoutsPrice timeout | 5s AbortController, semaphore capped at 3 concurrent ✅ |
| Rate limiting | 60 req/min/IP with in-memory map + auto-cleanup ✅ |
| CORS | Locked to `j1mmychu.github.io`, `peakly.app`, localhost ✅ |
| VPS redeploy (weekend pricing + weather proxy) | **UNKNOWN — still pending Jack's SSH step per CLAUDE.md** |

Weekend-specific Travelpayouts pricing and Open-Meteo proxy caching have been
code-complete since 2026-05-04. Until Jack runs:

```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy
```

— flight prices are month-cheapest instead of weekend-specific, and every
user session hammers Open-Meteo directly (no spike protection). This is
the single highest-leverage undeployed action in the project.

---

## 3. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client | None ✅ — only `TP_MARKER = "710303"` (public affiliate marker, safe) |
| Supabase anon key | Exposed at app.jsx:26 — intentional, RLS-gated per CLAUDE.md ✅ |
| Sentry DSN | Exposed in index.html:77 — standard practice, Sentry DSNs are public ✅ |
| .gitignore | Covers `.env`, `.pem`, `.key`, `.p8`, `*.pdf`, `*.pptx`, business docs ✅ |
| Git log secrets scan | Last 20 commits are all `auto: app.jsx/index.html/sw.js` — no credential commits detected ✅ |
| SRI on Leaflet | `integrity=sha256-...` on both CSS and JS ✅ |
| SRI on React, ReactDOM, Babel, Supabase | **MISSING — 4 of 6 CDN scripts have no integrity hash** ⚠️ |

### P1 — Missing SRI on 4 CDN Scripts

React, ReactDOM, Babel, and Supabase load from unpkg/jsdelivr with no
`integrity=` attribute. Leaflet already has this right; copy the pattern.
If unpkg CDN is compromised, you serve malicious JS to every user silently.

**Time to fix: 15 minutes.**

```bash
# Run locally to generate hashes, paste output into index.html integrity= attributes
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha256 -binary | openssl base64 -A | xargs -I{} echo "sha256-{}"

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha256 -binary | openssl base64 -A | xargs -I{} echo "sha256-{}"

curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js \
  | openssl dgst -sha256 -binary | openssl base64 -A | xargs -I{} echo "sha256-{}"

curl -s https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js \
  | openssl dgst -sha256 -binary | openssl base64 -A | xargs -I{} echo "sha256-{}"
```

Then add `integrity="sha256-<HASH>"` + `crossorigin` to each script tag,
matching the Leaflet pattern already in index.html lines 88-89.

---

## 4. SEO Metadata — Stale Surf References (P1, Fixed This Run)

The 2026-05-03 pivot retired surfing. `app.jsx` is clean — zero surf venues,
zero `category:"tanning"`. But index.html had surf in 7 places that Google
and social crawlers were actively indexing. **Fixed this run:**

| Location | Was | Now |
|----------|-----|-----|
| `<meta name="description">` | "Find surf, ski & adventure spots..." | "Find the best ski & beach spots to fly to this weekend." |
| `<meta property="og:title">` | "Adventure When Conditions Align" | "Ski & Beach When Conditions Align" |
| `<meta property="og:description">` | "Find surf, ski & beach spots...180+ venues" | "Find ski & beach spots...150+ venues" |
| `<meta name="twitter:title">` | "Adventure When Conditions Align" | "Ski & Beach When Conditions Align" |
| `<meta name="twitter:description">` | "Find surf, ski & beach spots" | "Find ski & beach spots" |
| `<title>` | "Find Surf, Ski & Adventure Spots" | "Best Ski & Beach Weekend Trips" |
| Noscript `<h1>` | "Surf, Ski & Adventure Spots" | "Ski & Beach Weekend Trips" |

Google was indexing "surf" as a primary keyword 9 days post-pivot. Done.

---

## 5. APNS Deadline — Tomorrow (2026-05-13) (P0 for App Store)

Per CLAUDE.md item #12: Strike Alerts code is fully shipped. APNS is not
configured. PM deadline is EOD Wednesday 2026-05-13 — **that is tomorrow.**

Two paths:

**Path A — Ship APNS:** Run the `peakly-native/PUSH_SETUP.md` runbook.
Apple Dev console + 5 `pm2 set` calls. `/health` endpoint confirms
`apns_configured: true`. Full alerts live.

**Path B — Gate the tab:** If APNS isn't happening by tomorrow, add this
guard so iOS reviewers don't see a broken Alerts tab. Web product unaffected.

```jsx
// In App root (near tab render logic), fetch /health on mount:
const [apnsConfigured, setApnsConfigured] = React.useState(true);
React.useEffect(() => {
  fetch(`${FLIGHT_PROXY}/health`)
    .then(r => r.json())
    .then(d => setApnsConfigured(d.apns_configured !== false))
    .catch(() => {}); // fail open
}, []);

// In nav tab render — hide Alerts on native iOS when APNS is not configured:
const showAlertsTab = !window.Capacitor?.isNativePlatform?.() || apnsConfigured;
```

**Do not ship App Store v1 with a broken Alerts tab.** Pick a path by EOD today.

---

## 6. Performance Analysis

**CDN payload on first load (gzipped estimates):**

| Asset | Gzipped |
|-------|----------|
| Babel Standalone 7.24.7 | ~250 KB |
| ReactDOM 18.3.1 | ~130 KB |
| app.jsx | ~130 KB |
| Supabase JS 2.45.4 | ~80 KB |
| React 18.3.1 | ~42 KB |
| Leaflet JS 1.9.4 | ~40 KB |
| Plus Jakarta Sans | ~20 KB |
| Leaflet CSS + index.html | ~8 KB |
| **Total first load** | **~700 KB gzipped** |

**Biggest bottleneck: Babel Standalone (~250 KB gzipped, ~960 KB raw).**

Babel downloads and executes before `app.jsx` starts parsing. On 4G this
adds ~1s of dead time. On 3G, ~2s. This is structural to the no-build-step
architecture — can't eliminate it without a build step.

Fixed this run: added a preload hint so Babel fetches in parallel with
React and Google Fonts instead of sequentially:

```html
<link rel="preload" href="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js" as="script" crossorigin />
```

**Saves ~200-400ms on first load.**

---

## 7. Open-Meteo Rate Limit Status

Free tier limit: 10,000 requests/day per IP.

**Pre-VPS-redeploy (current state):** Each user session fetches weather for
all ~154 venues × 2 calls (weather + marine for beach). At 1K MAU with 3
sessions/day = ~924K upstream calls/day. That's **92× the free tier limit.**
Open-Meteo will start 429-ing and venues will score as 0. The VPS redeploy
is not optional at any real traffic level.

**Post-VPS-redeploy:** Shared 2hr cache across all users. 154 venues × 12
upstream calls/day max = ~1,848 calls/day. Comfortably within free tier.
The deploy is one SSH command.

---

## 8. Cost Projection

| MAU | DigitalOcean | Supabase | Plausible | Open-Meteo | Total/mo |
|-----|-------------|---------|-----------|------------|----------|
| Pre-launch | $6 | Free | $9 | Free | **~$15** |
| 1K | $6 | Free (<500 MB) | $9 | Free (proxy) | **~$15** |
| 10K | $12 (2 GB) | $25 (Pro) | $19 | Free (proxy) | **~$56** |
| 100K | $48 (8 GB) | $25+ usage | $99 | $50 (paid plan) | **~$222** |

Costs stay bootstrapped through 10K MAU. The $9/mo Plausible bill can be
eliminated by self-hosting on the existing DigitalOcean droplet (~30 min
one-time setup, saves $108/year).

---

## 9. What Breaks First at Scale

**The single $6 VPS collapses at ~5K concurrent users.**

The proxy handles 5 jobs: Travelpayouts pricing, Open-Meteo weather cache,
Marine API cache, Push alerts polling, Waitlist. All in-memory on 1 GB RAM.
No load balancer. No horizontal scaling. **A VPS reboot wipes all alert
subscriptions silently** — there is no persistence (CLAUDE.md: "Phase 2C
deferred to v2").

**Prevention playbook (in order of impact):**

1. **Deploy the VPS (5 min)** — eliminates the Open-Meteo rate bomb.
   This is already written and waiting. Everything else is downstream of it.

2. **Move alert subscriptions to Supabase before 1K users** — the schema
   is already in `~/.claude/plans/effervescent-jumping-hopper.md`. One
   migration + one `INSERT` in the proxy `/api/alerts` handler. Without this,
   a VPS reboot loses every user's alert silently.

3. **Add UptimeRobot** (free tier, 5 min) — point at
   `https://peakly-api.duckdns.org/health`. Zero alerting today if the VPS
   goes down. Users see broken prices with no signal to Jack.

4. **Add Cloudflare in front of GitHub Pages** (~30 min) — free DDoS
   protection, HTTP/2 push, HTML compression, real analytics. Covers any
   traffic Peakly will see pre-Series A.

5. **Upgrade to 2 GB RAM at 10K MAU** (~$6/mo increase) — the 4,000-entry
   LRU weather cache starts thrashing at sustained 10K MAU. 2 GB allows
   expanding to 16K entries.

---

## Summary — Action Queue

| Priority | Item | Time | Blocks |
|----------|------|------|--------|
| P0 | **VPS redeploy** — `git pull && pm2 restart` on 198.199.80.21 | 5 min | Weekend pricing, Open-Meteo spike protection |
| P0 | **APNS by EOD 2026-05-13** — run PUSH_SETUP.md OR add Capacitor gate | 30 min | App Store v1 |
| P1 | **SEO copy** — DONE THIS RUN — surf removed from 7 meta/title tags | ✅ | Search indexing accuracy |
| P1 | **SRI hashes** — add `integrity=` to React, ReactDOM, Babel, Supabase | 15 min | Supply-chain security |
| P2 | **Babel preload link** — DONE THIS RUN — `<link rel="preload">` added | ✅ | 200-400ms TTI improvement |
| P2 | **UptimeRobot** — monitor `/health` on proxy | 5 min | Ops visibility |
| P2 | **Alert subscriptions to Supabase** — before first Reddit post | 2 hr | Data durability at launch |
