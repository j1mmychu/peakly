# Peakly DevOps Report — 2026-05-15

**Status: 🟡 YELLOW**
No P0s. Three P1s — two are 5-minute code fixes, one is a 10-minute SSH session that has been pending 11 days. Fixing all three before any public launch push is mandatory.

---

## 1. LIVE SITE HEALTH

| Metric | Value |
|--------|-------|
| `app.jsx` lines | 8,928 |
| `app.jsx` bytes | 531,918 (~520KB raw, ~120KB gzip est.) |
| Cache buster | `20260510l` (synced across app.jsx, sw.js, index.html ✅) |
| Last commit | 2026-05-09 (6 days — no code changes since, cache buster is correct) |
| Plausible analytics | Present, uncommented ✅ |
| All CDN deps HTTPS | ✅ |
| Proxy URL (FLIGHT_PROXY) | HTTPS ✅ (`https://peakly-api.duckdns.org`) |
| Sentry DSN | Configured ✅ (not empty) |

---

## P1 — HIGH (fix this week)

---

### P1-A: Stale "surf" copy in 6 places in index.html — active SEO damage

Surfing was retired 2026-05-03. That's 12 days of Google crawling Peakly as a surf app. Social share previews say surf. The `<title>` tag says surf. You are training the algorithm wrong.

**All 6 broken locations:**

```diff
-  <meta name="description" content="Peakly — Find surf, ski &amp; adventure spots when conditions and cheap flights align." />
+  <meta name="description" content="Peakly — Find the best ski or beach weekend to fly to. Live weather scoring + cheap flights for 154 venues worldwide." />

-  <title>Peakly — Find Surf, Ski &amp; Adventure Spots with Cheap Flights</title>
+  <title>Peakly — Ski &amp; Beach Weekends with Live Weather + Cheap Flights</title>

-  <meta property="og:description" content="Find surf, ski &amp; beach spots with perfect conditions and cheap flights. Real-time weather scoring for 180+ venues worldwide." />
+  <meta property="og:description" content="Find the best ski or beach weekend to fly to. Live Fri–Mon weather scoring + cheap flights for 154 venues worldwide." />

-  <meta name="twitter:description" content="Find surf, ski &amp; beach spots with perfect conditions and cheap flights." />
+  <meta name="twitter:description" content="Ski &amp; beach weekends with live weather scoring and cheap flights." />
```

In the JSON-LD block (line ~44):
```diff
-        "description": "Find surf, ski and adventure spots when conditions and cheap flights align."
+        "description": "Find the best ski or beach weekend to fly to. Live weather scoring and cheap flights for 154 venues."
```

In the noscript fallback `<h1>` (line ~346):
```diff
-      Peakly — Surf, Ski &amp; Adventure Spots with Live Conditions &amp; Cheap Flights
+      Peakly — Ski &amp; Beach Weekends with Live Conditions &amp; Cheap Flights
```

**Secondary bug in same block:** `og:description` claims "180+ venues." Actual count is ~154. Fix that too.

**Time to fix:** 5 minutes.

---

### P1-B: 4 alert fetch() calls hardcode the proxy URL — bypassing FLIGHT_PROXY constant

`FLIGHT_PROXY = "https://peakly-api.duckdns.org"` exists at app.jsx:1581 for a reason. The weather and flight fetches use it correctly. Alerts don't — they hardcode the domain string at lines **5115, 5127, 8577, 8601**.

When the proxy URL changes (DuckDNS migration, domain move, anything), flights degrade gracefully via one constant update. Alerts break silently with no obvious cause.

**Exact fix — 4 substitutions in `app.jsx`:**

```js
// line 5115
- fetch("https://peakly-api.duckdns.org/api/alerts", {
+ fetch(`${FLIGHT_PROXY}/api/alerts`, {

// line 5127
- fetch(`https://peakly-api.duckdns.org/api/alerts/${encodeURIComponent(String(id))}`, { method: "DELETE" })
+ fetch(`${FLIGHT_PROXY}/api/alerts/${encodeURIComponent(String(id))}`, { method: "DELETE" })

// line 8577
- fetch(`https://peakly-api.duckdns.org/api/alerts/${encodeURIComponent(String(existing.id))}`,
+ fetch(`${FLIGHT_PROXY}/api/alerts/${encodeURIComponent(String(existing.id))}`,

// line 8601
- fetch("https://peakly-api.duckdns.org/api/alerts", {
+ fetch(`${FLIGHT_PROXY}/api/alerts`, {
```

**Time to fix:** 3 minutes.

---

### P1-C: VPS proxy redeploy is 11 days overdue — weekend pricing and weather cache are dead letters

`proxy.js` changes from 2026-05-04 have been marked **AWAITING VPS REDEPLOY** in CLAUDE.md since May 4th. The live proxy at `198.199.80.21` is running stale code. This means:

1. **Weekend pricing is broken.** Every venue shows month-cheapest price, not this-weekend price. `scoreWeekendDeal` is scoring off stale fares. The deal sort is lying.
2. **The weather proxy cache is not running.** The in-memory 4000-entry LRU cache with in-flight dedupe — the Reddit-spike protection — is deployed nowhere. Every user falls back to direct Open-Meteo (see rate limit math in scaling section).

**Fix:**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
git pull origin main
pm2 restart peakly-proxy
pm2 logs peakly-proxy --lines 20
curl https://peakly-api.duckdns.org/health
```

Expected `/health` after redeploy includes `wxCache.size`, `pollStats`, and `apns_configured: false` (expected — see P2-C).

**Time to fix:** 10 minutes. This is a pure execution gap, not an engineering problem.

---

## P2 — MEDIUM (fix this sprint)

---

### P2-A: APNS deadline was 2026-05-13 — 2 days past, limbo state

CLAUDE.md's own decision: by 2026-05-13, either APNS is live or Alerts tab is gated with `Capacitor.isNativePlatform()`. Neither happened. iOS native users see an Alerts tab backed by push infrastructure that will never fire.

**Fix option A — gate the tab (30 min, no external dependencies):**
Locate the Alerts tab button in the bottom nav render and wrap it:
```jsx
{(!window.Capacitor?.isNativePlatform() || apnsConfigured) && (
  <TabButton id="alerts" ... />
)}
```
Where `apnsConfigured` comes from a `/health` poll result stored in state. Or just gate on `!Capacitor.isNativePlatform()` for now — hides the tab on iOS native, keeps it on web. Web push works independently.

**Fix option B — complete APNS setup (~2 hours, blocks App Store v1):**
See `peakly-native/PUSH_SETUP.md`.

Pick one. The current state is worse than either.

---

### P2-B: No SRI on 4 of 6 CDN script tags

| Script | SRI |
|--------|-----|
| `react@18.3.1` (unpkg) | ❌ |
| `react-dom@18.3.1` (unpkg) | ❌ |
| `@babel/standalone@7.24.7` (unpkg) | ❌ |
| `@supabase/supabase-js@2.45.4` (jsdelivr) | ❌ |
| `leaflet@1.9.4` JS + CSS | ✅ |
| Sentry (versioned CDN URL) | N/A |

Risk: compromised CDN = malicious JS with full localStorage access including Supabase auth tokens.

**Fix — generate hashes locally, add `integrity=` attributes:**
```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha256 -binary | openssl base64
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha256 -binary | openssl base64
curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js \
  | openssl dgst -sha256 -binary | openssl base64
curl -s https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js \
  | openssl dgst -sha256 -binary | openssl base64
```

Then add `integrity="sha256-<hash>" crossorigin="anonymous"` to each `<script>` tag.

⚠️ Note: adding SRI to Babel with a CSP that blocks `unsafe-eval` will break JSX transpilation. Add SRI first, test, then evaluate CSP separately.

**Time to fix:** 20 minutes.

---

### P2-C: Open-Meteo free tier math fails at ~50 unique daily cold-cache sessions

Free tier: **10,000 API calls/day**.
Weather calls per user (cold cache): ~154 venues = 154 calls.
Marine calls (beach, ~102 venues): included in batching.
**Break-even: ~65 unique users/day with cold caches.**

With the 2hr localStorage TTL, returning users cost 0 calls per 2hr window. But the VPS weather proxy cache (written, deployed nowhere — P1-C) would collapse this to **1 upstream call per lat/lon per 2hr window globally**, moving the break-even from 65 users/day to several thousand.

**Until P1-C is deployed:** One Reddit or HN post = 429s from Open-Meteo within an hour. All venues show `—` scores. Users see a broken app. They don't come back.

**Mitigation:** Deploy the VPS (P1-C). Nothing else.

---

### P2-D: Plausible `data-domain` will silently drop to zero on `peakly.app` migration

Current: `data-domain="j1mmychu.github.io"`. When you point `peakly.app` to GitHub Pages, Plausible stops counting events — the domain in the attribute must match the domain in the Plausible dashboard exactly.

**2-step pre-migration fix:**
1. Add `peakly.app` as a site in the Plausible dashboard (free).
2. Update `index.html` line 32:
   ```html
   <script defer data-domain="peakly.app" src="https://plausible.io/js/script.hash.js"></script>
   ```

Do this before the domain migration, not after. You'll lose launch-day analytics if you do it after.

**Time to fix:** 10 minutes.

---

## 3. SECURITY AUDIT

| Check | Status | Notes |
|-------|--------|-------|
| Travelpayouts API token in client | ✅ Clean | Server-only via `process.env.TRAVELPAYOUTS_TOKEN` |
| `TP_MARKER = "710303"` in client | ✅ Intentional | Public affiliate redirect marker, not an API token |
| Supabase anon key in client | ✅ By design | RLS-gated; standard Supabase pattern |
| Sentry DSN in client | ✅ By design | Public project DSN |
| `.gitignore` covers `.env`, `.p8`, creds | ✅ Comprehensive | Also blocks `.pdf`, `.pptx` post-2026-05-09 leak |
| Business plan leak | ✅ Scrubbed | History rewritten, 4-min exposure window, `.gitignore` updated |
| Last 15 commits for accidental secrets | ✅ Clean | All `auto: app.jsx/index.html/sw.js` commits |
| SRI on CDN scripts | ⚠️ Leaflet only | See P2-B |
| CSP header/meta | ⚠️ Not present | Medium risk, intentionally deferred — Babel eval blocks naive CSP |

No exposed secrets. TP_MARKER is public by design (affiliate redirect marker, not an auth token — it appears in outbound booking links visible to any user who inspects the network tab anyway).

---

## 4. PERFORMANCE ANALYSIS

| Asset | Gzip estimate |
|-------|---------------|
| `@babel/standalone@7.24.7` | ~850KB |
| `react-dom@18.3.1 prod` | ~130KB |
| `app.jsx` (raw, in-browser transpile) | ~120KB |
| `@supabase/supabase-js@2.45.4` | ~80KB |
| `react@18.3.1 prod` | ~42KB |
| `leaflet@1.9.4` | ~40KB |
| Google Fonts (Plus Jakarta Sans) | ~30KB |
| **First-load total estimate** | **~1.3MB gzip** |

**Single largest bottleneck: Babel Standalone at ~850KB gzip.** Every user downloads a full JavaScript compiler to render a read-mostly app. This is an architectural constraint (no build step). The splash screen buys perception time; LCP on a 4G connection is still ~4–6 seconds.

**Future migration path (post-1K MAU, ~2 hours of work):** Pre-transpile `app.jsx` → `app.js` in GitHub Actions. Ship compiled JS. Remove Babel from index.html. Saves ~850KB, ~1–2s LCP. Zero user-visible changes.

**Images:** All 9 `<img>` tags in app.jsx use `loading="lazy"` ✅. Venue photos use Unsplash CDN with explicit width/height params. No issue here.

**CDN versions:**
- React 18.3.1 — current stable ✅
- Leaflet 1.9.4 — current stable ✅
- Supabase 2.45.4 — current (2.x series); 2.49.x exists, no breaking changes needed
- Babel 7.24.7 — latest is 7.27.x; minor bug fixes, no urgency

---

## 5. COST ESTIMATE

| MAU | GitHub Pages | VPS (DigitalOcean) | Open-Meteo | Supabase | **Total/mo** |
|-----|-------------|-------------------|------------|----------|-------------|
| 1K | $0 | $6 (1GB) | Free | Free | **$6** |
| 10K | $0 | $12 (2GB) | Free* | $25 (Pro) | **$37** |
| 100K | $0 | $24 (4GB) | $49–199 | $25 | **$100–250** |

*Free at 10K MAU **only if the weather proxy cache is deployed**. Without it: 10K MAU × 154 calls = 1.54M daily Open-Meteo calls against a 10K/day free tier. That's not a scaling problem — that's a broken app problem at current traffic.

The Open-Meteo commercial tier at 100K MAU is the only unpredictable cost. The $49/month tier covers 1M calls/day; $199/month covers 10M. Factor that in before any growth push.

---

## 6. WHAT BREAKS FIRST AT SCALE

**Open-Meteo. Today. Possibly already.**

With the VPS proxy cache undeployed (P1-C), Peakly's weather API budget breaks at ~65 unique cold-cache sessions per day. That is not a load threshold — it is a **daily unique user** threshold. A single social media post sends the app dark for up to 12 hours until the Open-Meteo daily counter resets at midnight UTC. Users see dashes everywhere, assume the app is broken, and churn permanently.

The fix is already written and sitting in `server/proxy.js`. It requires one `git pull && pm2 restart` on the VPS. This is a 10-minute operation that has been pending for 11 days.

After that, the next inflection points are:
- **Supabase bandwidth at 10K MAU** (~$25/month Pro upgrade — affordable, predictable)
- **Open-Meteo commercial tier at 100K MAU** (~$50–200/month depending on usage)
- **VPS memory pressure at 10K concurrent sessions** — in-memory alert store needs Supabase migration (planned for v2, acceptable for now)

None of these are emergencies. The VPS redeploy is.

---

## PRIORITY QUEUE

| # | Issue | Priority | Est. Time |
|---|-------|----------|-----------|
| 1 | **VPS redeploy** — `git pull && pm2 restart` on 198.199.80.21 | **P1** | 10 min |
| 2 | **Stale surf meta copy** — 6 locations in index.html | **P1** | 5 min |
| 3 | **4 hardcoded alert URLs** — replace with `FLIGHT_PROXY` constant | **P1** | 3 min |
| 4 | **APNS gate** — `Capacitor.isNativePlatform()` on Alerts tab | **P2** | 30 min |
| 5 | **SRI on 4 CDN scripts** — React, ReactDOM, Babel, Supabase | **P2** | 20 min |
| 6 | **Plausible domain** — pre-register `peakly.app` before domain migration | **P2** | 10 min |
