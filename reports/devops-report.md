# Peakly DevOps Report — 2026-05-20

**Status: 🟡 YELLOW**

No P0s. Two P1s. One of them (VPS proxy still not deployed — day 16) will become a P0 the moment Peakly gets meaningful traffic. Fix it today or accept that the product silently breaks at 49 DAU.

---

## 1. LIVE SITE HEALTH

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 8,837 | ✅ |
| `app.jsx` bytes | 524,394 (~512KB raw, ~120KB gzip est.) | ✅ |
| Cache buster | `20260519a` across app.jsx, sw.js, index.html | ✅ consistent |
| Last code change | 2026-05-19 (CDN bumps: Supabase 2.45.4→2.106.0, Babel 7.24.7→7.29.4, cache buster bumped) | ✅ |
| Plausible analytics | Present, uncommented | ✅ |
| CDN deps all HTTPS | Yes | ✅ |
| Proxy URL (FLIGHT_PROXY) | `https://peakly-api.duckdns.org` | ✅ HTTPS |
| Sentry DSN | Configured (not empty) | ✅ |
| All images lazy-loaded | Yes (`loading="lazy"` on all `<img>` tags) | ✅ |

---

## P1 — HIGH (fix this week)

---

### P1-A: VPS weather proxy NOT deployed — rate limit wall at 49 DAU

**Status: CODE DONE 2026-05-04. Still sitting undeployed. Day 16. This is not a rehearsal.**

Open-Meteo free tier: **10,000 calls/day**.
Current Explore load: 154 venues × ~1.3 calls (weather + selective marine) = **~200 upstream calls per unique user**.
Break-even: **10,000 / 200 = 50 unique Explore loads/day before Open-Meteo 429s everything**.

Without the VPS proxy, Peakly is functionally broken above 50 DAU. Weather fetches return null, venues score 0, the grid goes empty. Users bounce. This isn't a future scaling problem — it's a launch-day problem.

The VPS proxy is already written (`server/proxy.js`). It caches weather by lat/lon with a 2hr TTL. With it deployed, 154 unique coords = ~200 upstream calls/day regardless of user count. Reddit spike of 10K users = same 200 upstream calls.

**Fix — SSH session, 5 minutes:**

```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
git pull origin main
pm2 restart peakly-proxy
pm2 save
# Verify:
curl https://peakly-api.duckdns.org/health
```

Expected `/health` response when healthy:
```json
{
  "status": "ok",
  "wxCacheSize": 0,
  "apns_configured": false,
  "pollStats": { "lastRun": null, "alertsFired": 0 }
}
```

**Same deploy also wires up weekend-specific Travelpayouts pricing** (pending since 2026-05-04 — exact Fri/Mon fares instead of cheapest-month estimates). Two fixes, one SSH session.

**Estimated fix time: 5 minutes.**

---

### P1-B: No SRI on React, Babel, and Supabase CDN scripts

Leaflet has SRI hashes. React, Babel Standalone, and Supabase JS do not. A compromised unpkg.com or jsdelivr.net CDN — or a BGP hijack — delivers malicious JS to every Peakly user and the browser executes it without complaint.

Current state in `index.html` (versions are current after 05-19 bumps — SRI is still absent):
```html
<!-- No integrity= attribute — vulnerable -->
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.0/dist/umd/supabase.min.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.4/babel.min.js"></script>
```

**Fix — compute SRI hashes and add `integrity=` attributes:**

```bash
# Run locally to get correct hashes:
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.0/dist/umd/supabase.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/@babel/standalone@7.29.4/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Then update `index.html`:
```html
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<HASH_FROM_ABOVE>"></script>
```

**Caveat:** Babel Standalone's SRI will conflict with a strict CSP `unsafe-eval` block (Babel needs eval to transpile JSX). Apply SRI to React + Supabase first. Babel SRI is lower priority until CSP is planned.

**Estimated fix time: 15 minutes.**

---

## P2 — MEDIUM (fix this sprint)

---

### P2-A: DELETE /api/alerts has no ownership verification

`DELETE /api/alerts/:alertId` deletes any alert by ID with no auth. AlertIDs come from the client's local counter (`String(alertData.id)` — likely sequential integers: `"1"`, `"2"`, `"3"`). An attacker can hit `DELETE https://peakly-api.duckdns.org/api/alerts/1` through `1000` and wipe every in-memory alert from every user.

**Fix in `server/proxy.js` at line 694:**

```javascript
app.delete('/api/alerts/:alertId', (req, res) => {
  const { alertId } = req.params;
  if (!_alerts.has(alertId)) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }
  // Verify pushToken matches the registering device
  const { pushToken } = req.body || {};
  const record = _alerts.get(alertId);
  if (record.pushToken && record.pushToken !== pushToken) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }
  _alerts.delete(alertId);
  return res.json({ success: true, message: 'Alert removed' });
});
```

Also update client `delAlert` in `app.jsx` to send pushToken in body:
```javascript
fetch(`${FLIGHT_PROXY}/api/alerts/${alertId}`, {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pushToken: localStorage.getItem('peakly_push_token') || '' })
});
```

**Estimated fix time: 20 minutes.**

---

### P2-B: localhost origins in production CORS config

`server/proxy.js` ALLOWED_ORIGINS includes `http://localhost:8000`, `http://localhost:3000`, `http://127.0.0.1:8000` on the production VPS. The proxy binds to `127.0.0.1` so these aren't externally reachable, but it's a DNS rebinding attack surface and sloppy for prod. Gate behind an env flag.

**Fix in `server/proxy.js` lines 48–55:**

```javascript
const _devOrigins = ['http://localhost:8000', 'http://localhost:3000', 'http://127.0.0.1:8000'];
const ALLOWED_ORIGINS = [
  'https://j1mmychu.github.io',
  'https://peakly.app',
  'https://www.peakly.app',
  ...(process.env.NODE_ENV !== 'production' ? _devOrigins : []),
];
```

On the VPS, `pm2 set peakly-proxy NODE_ENV production` (or add to ecosystem.config.js).

**Estimated fix time: 5 minutes + VPS redeploy.**

---

### P2-C: Supabase JS eagerly loaded — ~80KB gzip on every cold start

`index.html:85` loads Supabase unconditionally. CLAUDE.md says "lazy-loaded (~80KB gzipped)" — that refers to `createClient()`, not the script download. The ~80KB parses on every page load for every user including anonymous visitors who will never sign in. Already in `known-skipped.md` per two-strikes rule. Noting again: at Reddit scale this is the #1 cold-load TTI hit after Babel. Re-flag when LCP becomes measurable.

**Diff when ready (30-second apply):**
```html
<!-- Remove this line from index.html: -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.0/dist/umd/supabase.min.js"></script>

<!-- Add dynamic loader before app.jsx script tag: -->
<script>
  window._loadSupabase = () => {
    if (window._supabaseLoaded) return Promise.resolve();
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.0/dist/umd/supabase.min.js';
      s.onload = () => { window._supabaseLoaded = true; res(); };
      s.onerror = rej;
      document.head.appendChild(s);
    });
  };
</script>
```

---

### P2-D: CDN versions — current after 05-19 bumps ✅

| Library | Current | Status |
|---------|---------|--------|
| React | 18.3.1 | ✅ current |
| Leaflet | 1.9.4 | ✅ current |
| Babel Standalone | 7.29.4 | ✅ bumped 05-19 |
| Supabase JS | 2.106.0 | ✅ bumped 05-19 |

No action needed on versions. Verify Supabase 2.106.0 didn't break magic-link auth or cloud sync by testing on the live site — the `createClient` API surface is stable across 2.x but worth a quick smoke test after a major minor bump.

---

## 4. SECURITY SUMMARY

| Item | Risk | Status |
|------|------|--------|
| Travelpayouts token | Server-side only via `process.env` | ✅ Clean |
| Supabase anon key in client | Intentional — public-safe when RLS is ON | ✅ Acceptable |
| Supabase service_role key | Not found in any client file | ✅ Clean |
| Git history (recent commits) | No secrets detected | ✅ Clean |
| `.gitignore` | Covers `.env`, `.pem`, `.p8`, `.pdf`, `.pptx` | ✅ Solid |
| SRI on Leaflet | Present | ✅ |
| SRI on React / Babel / Supabase | Missing | ❌ P1-B |
| CSP headers | None | ⚠️ Deferred — Babel eval blocks strict CSP |
| CORS localhost in prod | Present | ⚠️ P2-B |
| Alert DELETE auth | None | ❌ P2-A |

**Supabase RLS verification required:** The anon key is client-visible by design. If RLS is disabled on `user_data` or `shared_lists`, the anon key becomes a full-read/write credential for all user data. Verify in Supabase dashboard → Table Editor → check RLS toggle on both tables. This check takes 30 seconds.

---

## 5. PERFORMANCE ANALYSIS

**Estimated first-load payload (gzipped):**

| Asset | Gzip est. |
|-------|-----------|
| Babel Standalone 7.24.7 | ~350KB |
| ReactDOM 18.3.1 prod | ~130KB |
| Supabase JS 2.45.4 | ~80KB |
| React 18.3.1 prod | ~50KB |
| Leaflet 1.9.4 | ~40KB |
| app.jsx (512KB raw) | ~120KB |
| **Total** | **~770KB gzipped** |

**Biggest bottleneck:** Babel Standalone — 350KB download + main-thread JSX transpilation of 512KB app.jsx before first render. 2–4s TTI penalty on mid-tier mobile. This is an architectural constraint of the no-build-step rule. Accepted.

**What's working well:** lazy image loading everywhere, fetch timeouts on all external calls (8s weather, 5s flights), weather batch throttling (50 venues/2s), retry with exponential backoff on 429/5xx, proxy fallback to direct Open-Meteo if VPS is down.

---

## 6. COST PROJECTIONS

| Scale | Monthly Cost | Notes |
|-------|-------------|-------|
| Today | $6/mo | DO 1GB droplet only |
| 1K MAU (proxy deployed) | ~$6/mo | VPS weather cache absorbs all load; Supabase stays free |
| 1K MAU (proxy NOT deployed) | ~$30/mo | Open-Meteo paid tier required at >50 DAU |
| 10K MAU | ~$37/mo | VPS 2GB ($12) + Supabase Pro ($25) |
| 100K MAU | ~$660/mo | 4GB VPS ($24) + LB ($12) + Supabase Team ($599) |

**Single highest-leverage action:** Deploy the VPS proxy. It converts Open-Meteo cost from O(users) to O(1). 154 cached coords = ~200 upstream calls/day regardless of traffic volume.

---

## 7. WHAT BREAKS FIRST AT SCALE

Open-Meteo rate limits blow at ~50 DAU. Without the VPS proxy cache deployed, a single HackerNews submission pushes Peakly into 429-hell within minutes: venues return null weather, `scoreVenue` returns 0, the Explore grid empties, users see "Nothing great this weekend" and leave. The proxy is built and on the VPS — it needs one `git pull && pm2 restart`. After that's done, the next wall is Supabase bandwidth at ~2K MAU (free tier is 2GB/mo; cloud sync writes burn through it fast with active users). Watch Supabase dashboard post-launch and upgrade to Pro ($25/mo) when bandwidth hits 80% — do not wait for the free tier to cut off auth.
