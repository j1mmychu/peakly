# Peakly DevOps Report — 2026-05-19

**Status: 🟡 YELLOW**
No P0s. One P1 applied in this commit (cache buster stale after 05-15 code changes). One P1 requires Jack's SSH session — VPS proxy redeploy, now 15 days overdue. CDN versions (Supabase, Babel) were bumped by the 05-18 run. Two remaining P2s: Open-Meteo rate limit exposure at scale, and VPS proxy still running April code.

---

## 1. LIVE SITE HEALTH

| Metric | Value |
|--------|-------|
| `app.jsx` lines | 8,837 |
| `app.jsx` bytes | 524,394 (~512KB raw, ~120KB gzip est.) |
| Cache buster | `20260519a` — **bumped in this commit** (was `20260513j`, stale since 05-15 code changes) |
| Last code commit | 2026-05-18 (CDN version bumps: Supabase 2.45.4→2.106.0, Babel 7.24.7→7.29.4) |
| Plausible analytics | Present, uncommented ✅ |
| All CDN deps HTTPS | ✅ |
| Proxy URL (`FLIGHT_PROXY`) | HTTPS ✅ (`https://peakly-api.duckdns.org`) |
| Alert URLs | All use `FLIGHT_PROXY` constant ✅ (fixed 05-15) |
| Sentry DSN | Configured ✅ — wired in both `index.html` and `app.jsx` |
| Images with `loading="lazy"` | 9/9 `<img>` tags ✅ |
| Hardcoded raw IP in client | None ✅ |

---

## P1 — HIGH (fix now)

---

### P1-A: Cache buster stale after 05-18 CDN version bumps — FIXED IN THIS COMMIT

Commit 4d16e3d (2026-05-15) and the 05-18 CDN bumps both modified `index.html` without bumping the cache key from `20260513j`. Result: `app.jsx?v=20260513j` pointed to stale bytes for anyone who cached the file on or after 05-13. The SW uses stale-while-revalidate — affected users would get the fresh version only on their *second* load after the change.

**Fix applied in this commit:** bumped all three files `20260513j` → `20260519a`.

```diff
# app.jsx line 17
-const PEAKLY_BUILD = "20260513j";
+const PEAKLY_BUILD = "20260519a";

# sw.js line 2
-const CACHE_NAME = "peakly-20260513j";
+const CACHE_NAME = "peakly-20260519a";

# index.html line ~400
-<script type="text/babel" src="./app.jsx?v=20260513j" data-presets="react"></script>
+<script type="text/babel" src="./app.jsx?v=20260519a" data-presets="react"></script>
```

**Rule:** every commit touching `app.jsx`, `sw.js`, or `index.html` must bump the buster in lockstep across all three files. The auto-push hook fires on those edits — the agent writing them must bump before committing.

---

### P1-B: VPS proxy redeploy is 15 days overdue — weekend pricing and weather cache are not live

`proxy.js` changes from 2026-05-04 have never been deployed to `198.199.80.21`. The live proxy is running April code. This means:

1. **Weekend pricing is broken.** Every venue shows month-cheapest fare, not this-weekend price. `scoreWeekendDeal` scores off stale data. Every "deal" label is fiction.
2. **No server-side weather cache.** The 4,000-entry LRU cache with in-flight dedupe is deployed nowhere. Every concurrent user hits Open-Meteo directly (see rate limit math in P2-A).

**Exact fix — one SSH session:**

```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
git pull origin main
pm2 restart peakly-proxy
pm2 logs peakly-proxy --lines 30   # verify no startup errors
curl https://peakly-api.duckdns.org/health | python3 -m json.tool
# expect: {"status":"ok","alerts":0,"apns_configured":false}
```

No new npm deps in the 05-04 proxy changes — `npm install` not required.

**Time to fix:** 10 minutes. Zero code changes.
**Blast radius if not done at launch:** deal scores are lying to every user.

---

## P2 — MEDIUM (fix this sprint)

---

### P2-A: Open-Meteo rate limit walls at ~830 DAU — no commercial plan in place

Free tier: **10,000 calls/day**. App cold-load triggers ~100 weather calls (50 venues × 2: weather + marine for beach). Each unique session averages ~12 calls with the 2hr localStorage cache on repeat visits.

| DAU | Est. daily calls | Free tier status |
|-----|-----------------|-----------------|
| 300 | 3,600 | ✅ Safe |
| 830 | 9,960 | ⚠️ At limit |
| 1,000 | 12,000 | ❌ Throttled |
| 10,000 | 120,000 | 💀 Bricked |

When Open-Meteo returns 429s, `fetchWeather` retries 3× then returns null. `scoreVenue` with null weather renders every venue as unscored. The grid goes blank — looks like a total app crash to users.

**Mitigation stack:**

**1. Ship VPS proxy redeploy (P1-B above).** Server-side 4,000-entry LRU cache collapses N concurrent users hitting the same venue to 1 upstream call. Highest-leverage fix.

**2. Register Open-Meteo Hobbyist plan before Reddit launch:** `https://open-meteo.com/en/pricing` — $10/mo, 1M calls/day, covers 10K DAU with headroom.

**3. Emergency: if proxy still not deployed on launch day, double the batch delay:**

```diff
# app.jsx ~line 8251
-        await new Promise(res => setTimeout(res, 1000));
+        await new Promise(res => setTimeout(res, 2000));
```

Halves the per-session call burst, buys ~600 additional concurrent users before hitting the wall.

**Time to fix:** Option 1 = P1-B SSH. Option 2 = credit card + 5 min. Option 3 = 30-sec diff.

---

### P2-B: `_alerts` Map in proxy.js is in-memory only — PM2 restart wipes all alert subscriptions

Every registered alert subscription lives in `_alerts = new Map()` in `proxy.js`. A PM2 restart (deploy, crash, OOM) silently drops every user's alert. They'll never know their alert is gone until they check back and conditions fired without a push.

**Fix — add file-backed persistence (code block already written in `reports/inputs/devops-2026-05-01.md`):**

```js
// server/proxy.js — add after the Map declaration
const ALERTS_FILE = path.join(__dirname, 'data', 'alerts.json');
function _loadAlerts() {
  try {
    const raw = fs.readFileSync(ALERTS_FILE, 'utf8');
    const arr = JSON.parse(raw);
    arr.forEach(a => _alerts.set(a.id, a));
    console.log(`[alerts] loaded ${_alerts.size} from disk`);
  } catch {}
}
function _saveAlerts() {
  try {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    fs.writeFileSync(ALERTS_FILE, JSON.stringify([..._alerts.values()]), 'utf8');
  } catch (e) { console.error('[alerts] save failed', e.message); }
}
_loadAlerts(); // call at startup
// call _saveAlerts() after every _alerts.set() and _alerts.delete()
```

**Time to fix:** 30-min proxy.js edit + VPS redeploy. Block on P1-B being done first (same SSH session).

---

## 3. SECURITY AUDIT

| Check | Status |
|-------|--------|
| Travelpayouts token in client | ✅ None — server-side only via `process.env.TRAVELPAYOUTS_TOKEN` |
| Supabase anon key in client | ✅ Expected — public-safe, RLS-gated |
| Sentry DSN in client | ✅ Expected — DSNs are public by design |
| `.gitignore` covers `.env`, `*.p8`, `*.pem`, `*.key` | ✅ |
| SRI on React/ReactDOM/Babel | ❌ Known-skipped (hash generation + unpkg normalization risk) |
| Content-Security-Policy | ❌ Known-skipped (Babel `unsafe-eval` regression risk) |
| Recent commits contain secrets | ✅ None — last 20 commits checked |
| Business plan PDFs in history | ✅ Scrubbed 2026-05-09 via `git-filter-repo` |
| APNS `.p8` key ever committed | ✅ `*.p8` in `.gitignore` — clean |

No new security findings this run.

---

## 4. PERFORMANCE ANALYSIS

**Blocking JS on cold load (gzip estimates):**

| Asset | Gzip est. |
|-------|----------|
| Sentry CDN | ~50KB |
| React 18.3.1 | ~6KB |
| ReactDOM 18.3.1 | ~130KB |
| Supabase 2.106.0 (eager) | ~80KB |
| Leaflet 1.9.4 | ~40KB |
| Babel Standalone 7.29.4 | ~210KB |
| `app.jsx` (512KB raw) | ~120KB |
| **Total** | **~636KB** |

**Biggest bottleneck: Babel Standalone (~210KB gzip + 880KB parse).** On a mid-tier Android, Babel's JIT compile of 512KB JSX takes 800–1,200ms before React mounts. Structural constraint of the no-build-step architecture. At 1K MAU, watch Sentry p75 LCP. If > 3.5s, the fix is to pre-compile `app.jsx` to vanilla JS in CI — removes Babel from the critical path while keeping the no-build development workflow.

**Secondary: Supabase eager load (80KB blocking).** The `ensureSupabase()` lazy pattern is implemented in `app.jsx`, but the `<script>` tag in `index.html` still blocks every anonymous page load. Fix diff at `reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff` — known-skipped, re-flag if Sentry shows LCP regression.

All 9 `<img>` tags use `loading="lazy"` ✅.

---

## 5. COST ESTIMATE

| MAU | Monthly infra cost | Notes |
|-----|--------------------|-------|
| <100 (current) | **$6/mo** | DO $6 droplet; Open-Meteo free; Supabase free; GH Pages free |
| 1K | **~$16/mo** | + Open-Meteo Hobbyist $10 |
| 10K | **~$28/mo** | + DO upgrade to $12/mo (2GB RAM) |
| 100K | **~$110/mo** | Open-Meteo Business $40 + DO cluster $40 + egress $30 |

**What breaks first:** Open-Meteo free tier at ~830 DAU. When it walls, the venue grid goes blank — no graceful degradation. Deploy proxy (P1-B) + buy commercial plan (P2-A) before launch.

---

## 6. CDN DEPENDENCY VERSIONS

| Library | Pinned | Current | Gap |
|---------|--------|---------|-----|
| React | 18.3.1 | 18.3.1 | ✅ Current |
| ReactDOM | 18.3.1 | 18.3.1 | ✅ Current |
| Supabase JS | 2.106.0 | 2.106.0 | ✅ Bumped 05-18 |
| Babel Standalone | 7.29.4 | 7.29.4 | ✅ Bumped 05-18 |
| Leaflet | 1.9.4 | 1.9.4 | ✅ Current |

---

## ACTION SUMMARY

| Priority | Item | Owner | Est. time |
|----------|------|-------|-----------|
| P1-A | Cache buster 20260513j → 20260519a | ✅ Done (this commit) | — |
| P1-B | SSH VPS: `git pull && pm2 restart peakly-proxy` | Jack | 10 min |
| P2-A | Register Open-Meteo Hobbyist plan ($10/mo) before launch | Jack | 5 min |
| P2-B | Add file-backed persistence to `_alerts` Map in proxy.js | Agent (after P1-B) | 30 min |
