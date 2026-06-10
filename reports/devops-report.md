# Peakly DevOps Report — 2026-06-09

**Status: 🔴 RED**

Two P0s today. (1) **GitHub PAT expires 2026-06-15 — 6 days.** When it blows, all pushes fail and GitHub Pages freezes. (2) **GEAR_ITEMS is confirmed deleted from app.jsx** — Amazon stream has been earning $0 since the June 7 auto: commits. That's −37% RPM ($12.06 → $7.58/1K MAU). Cache stamp was `20260608aaah` on arrival — bumped to `20260609a` this run. VPS redeploy remains the standing Day 36 P1 and is now the #1 risk at any real traffic event.

---

## Fixes Shipped This Run

| Fix | File | Detail |
|-----|------|--------|
| Cache stamp `20260608aaah` → `20260609a` | `app.jsx:17` | Daily bump |
| SW CACHE_NAME `peakly-20260608aaah` → `peakly-20260609a` | `sw.js:2` | Evicts stale SW on next visit |
| Query string `?v=20260608aaah` → `?v=20260609a` | `index.html:400` | Forces browser reload of updated app.jsx |

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **9,006 lines / 535 KB raw / ~149 KB gzip est.** |
| CDN scripts | All HTTPS, pinned to exact versions ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io"` ✅ |
| Cache stamp (PEAKLY_BUILD) | `20260609a` — **bumped this run** ✅ |
| SW CACHE_NAME | `peakly-20260609a` — **bumped this run** ✅ |
| Query string `?v=` | `20260609a` — **bumped this run** ✅ |
| Sentry DSN | Active: `9416b032a46681d74645b056fcb08eb7@o4511108649058304.ingest.us.sentry.io/...` ✅ |
| Sentry init guard | `typeof Sentry !== "undefined"` — safe on CDN failure ✅ |
| APNS `isNativePlatform()` gate | `showAlertsTab = !isNativePlatform() \|\| apnsConfigured` ✅ |
| GEAR_ITEMS | **❌ 0 matches — DELETED. Amazon earning $0.** |

### CDN Dependency Versions

| Library | Pinned | Status |
|---------|--------|--------|
| React + ReactDOM | 18.3.1 | ✅ Current |
| Babel Standalone | 7.29.7 | ✅ Current (confirmed npm) |
| Supabase JS | 2.106.2 | ✅ Recent |
| Leaflet | 1.9.4 | ✅ Stable + SRI |
| Sentry CDN | Loader SDK (project-keyed) | ✅ |

---

## 2. P0-A — GitHub PAT Expires 2026-06-15 (6 Days Out)

**Deadline: Friday. Miss it and every `git push` dies with 401. GitHub Pages freezes at last-pushed state.**

CLAUDE.md Open #15 has been tracking this since 06-08. The `peakly-token-renewal` weekly watcher should have fired — it either didn't, or nobody acted. Today is 2026-06-09. Six days left.

When it expires:
- `scripts/auto-push.sh` → `git push` → `403 Authentication failed` — silent, no deploy
- GitHub Actions workflow → `401 Unauthorized` — pages stop updating
- Cache bumps stop deploying. Bug fixes stop deploying. The site rots.

**Fix — 3 minutes:**
```
1. github.com/settings/tokens → find token with expiry 2026-06-15
2. Click "Regenerate" → set expiry 1 year (2027-06-09) → Copy new token
3. Update everywhere it's stored:
   a. GitHub Actions: repo Settings → Secrets and variables → Actions
      → find the PAT secret → Update value
   b. Local git credential store: run these two commands back-to-back:
      git credential reject <<EOF
      protocol=https
      host=github.com
      username=j1mmychu
      EOF
      (next `git push` will prompt for the new token and cache it)
```

If the Actions workflow uses `GITHUB_TOKEN` (the auto-provisioned one), it rotates automatically and needs no action — check `.github/workflows/deploy.yml` to confirm.

---

## 3. P0-B — GEAR_ITEMS Deleted: Amazon Stream Earning $0

**Revenue regression since June 7: −$4.48/1K MAU (−37%). This is the second deletion.**

```bash
grep -c "GEAR_ITEMS" app.jsx  # → 0 on current HEAD
```

Removed across 3 unlabeled `auto: app.jsx` commits on 2026-06-07. Clean removal — no crash, passes smoke, no visible UI error. Just $0 Amazon Associates (`peakly-20`) revenue. First deletion: ~pre-05-24, restored `932943c`/`450891b` on 2026-05-27. Second deletion: 2026-06-07. Now on current HEAD with 0 references.

**Restore — paste this constant after app.jsx ~line 253 (after the `CATEGORIES` / `CONTINENTS` blocks):**

```javascript
// INVARIANT: grep -c "GEAR_ITEMS" app.jsx must be ≥ 4.
// If 0, Amazon Associates (tag=peakly-20) earns $0. Deleted twice by auto: commits.
const GEAR_ITEMS = {
  skiing: [
    { title:"Smith I/O MAG Ski Goggles", desc:"ChromaPop lens · fog-resistant", price:249,
      url:"https://www.amazon.com/dp/B08CRDGDCX?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=120&h=120&fit=crop" },
    { title:"Atomic Bent Chetler 100 Skis", desc:"All-mountain freeride · 100mm underfoot", price:599,
      url:"https://www.amazon.com/dp/B09B27HZBX?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=120&h=120&fit=crop" },
    { title:"Osprey Kamber 22 Pack", desc:"Helmet carry · back protector pocket", price:189,
      url:"https://www.amazon.com/dp/B08PPVMFJG?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=120&h=120&fit=crop" },
  ],
  beach: [
    { title:"Garmin Instinct 2 Solar", desc:"GPS watch · 30-day solar battery", price:299,
      url:"https://www.amazon.com/dp/B09BNHBFCK?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop" },
    { title:"Hydro Flask 32 oz Wide Mouth", desc:"Keeps cold 24h · BPA-free", price:49,
      url:"https://www.amazon.com/dp/B07D5P9YBQ?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=120&h=120&fit=crop" },
    { title:"Rash Guard Long Sleeve UPF 50+", desc:"Quick-dry · reef-safe", price:35,
      url:"https://www.amazon.com/dp/B07QJJBPGM?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&h=120&fit=crop" },
  ],
};
```

**Restore the render sites in VenueDetailSheet** (search for the two gear comment blocks that were removed). The full render markup is in `git show 932943c:app.jsx` — look for `GEAR_ITEMS[listing.category]` occurrences.

**Estimated fix: 20 min.** The cleanest path: `git show 932943c:app.jsx | grep -n "GEAR_ITEMS"` to find the line numbers, then extract those blocks.

---

## 4. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Travelpayouts token | Server-side env var only ✅ |
| TP_MARKER | `"710303"` — public affiliate marker ✅ |
| Flight request timeout | 5s AbortController ✅ |
| Concurrency cap | `_flightSem` max 3 concurrent ✅ |

### P1-A — VPS Redeploy: Day 36

Three features dead since 2026-05-04:
1. Shared Open-Meteo weather cache (2hr LRU + in-flight dedupe)
2. Marine proxy cache (same)
3. Weekend-specific flight pricing (Fri/Mon dates, currently falls back to month-cheapest)

Rate ceiling without proxy cache: **67 DAU**. At 68, free tier gone, grid goes blank, no error shown.

```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy && git pull origin main
pm2 restart peakly-proxy && pm2 save
curl https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Expected: `{ "status": "ok", "wx_cache_size": 0, "apns_configured": false }`

### P1-B — Localhost CORS Origins in Production (Day 2, Still Open)

`server/proxy.js:27–29` ships localhost origins to prod:
```javascript
'http://localhost:8000',
'http://localhost:3000',
'http://127.0.0.1:8000',
```

Any local dev server can make CORS-authorized requests to the production proxy and burn rate limit quota. Gate them behind `NODE_ENV`:

```javascript
// server/proxy.js — replace ALLOWED_ORIGINS block:
const DEV_ORIGINS = process.env.NODE_ENV !== 'production'
  ? ['http://localhost:8000', 'http://localhost:3000', 'http://127.0.0.1:8000']
  : [];
const ALLOWED_ORIGINS = [
  'https://j1mmychu.github.io',
  'https://peakly.app',
  'https://www.peakly.app',
  ...DEV_ORIGINS,
];
```

Bundle into the P1-A SSH session: after `git pull` on VPS, add:
```bash
pm2 set peakly-proxy:NODE_ENV production
pm2 restart peakly-proxy && pm2 save
```

---

## 5. Weather & External APIs

| API | Timeout | Status |
|-----|---------|--------|
| Open-Meteo Weather | 8s AbortController, 4s proxy-first | ⚠️ Proxy down — direct only |
| Open-Meteo Marine | 8s AbortController, 4s proxy-first | ⚠️ Proxy down — direct only |
| Venue batch | 50 venues / 2s throttle | ✅ |

### P1-C — Proxy-Down Cascade (Day 2, Still Open)

When proxy is down, all 156 venues probe Open-Meteo directly in parallel with no back-off. 67 simultaneous users cold-loading = 10,050 calls in the first minute = free tier gone in a single burst.

**Fix (~15 min) — module-level cooldown before the first `fetch` in `_tryProxyWx` around app.jsx line 1041:**

```javascript
let _proxyWxFailedAt = 0;
const PROXY_WX_COOLDOWN_MS = 5 * 60 * 1000;

async function _tryProxyWx(kind, lat, lon) {
  if (Date.now() - _proxyWxFailedAt < PROXY_WX_COOLDOWN_MS) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const r = await fetch(`${FLIGHT_PROXY}/api/${kind}?lat=${lat}&lon=${lon}`,
      { signal: controller.signal });
    clearTimeout(timer);
    if (!r.ok) { _proxyWxFailedAt = Date.now(); return null; }
    const json = await r.json();
    if (json?.success && json?.data) { _proxyWxFailedAt = 0; return json.data; }
    _proxyWxFailedAt = Date.now(); return null;
  } catch { _proxyWxFailedAt = Date.now(); return null; }
}
```

156 probes → 1 probe per 5-minute window once the proxy is confirmed down.

---

## 6. Security Audit

| Item | Status |
|------|--------|
| Travelpayouts token in client | ✅ Not present |
| Supabase anon key at `app.jsx:26` | ✅ Intentionally public — RLS-gated |
| `.gitignore` | ✅ Covers `.env`, `*.p8`, `*.pem`, `*.key`, `*.pdf`, `*.pptx` |
| Sentry DSN | ✅ Expected public exposure (Loader SDK) |
| APNS keys | ✅ `process.env` only — never hardcoded |
| Last 30 commits scanned | ✅ No credentials found |

**SRI gap (P2, known-skipped):** React, ReactDOM, Babel Standalone, Supabase all lack `integrity=` hashes. Babel without SRI is the highest-severity gap — a compromised unpkg payload has eval-level access to the full app and all localStorage. Re-flag immediately if unpkg/jsdelivr reports a supply-chain incident.

**Supabase RLS (P2):** Verify at `wsoqcfwkvvemtlddcgfc.supabase.co` → Table Editor that RLS is ON for both `user_data` and `shared_lists`. Unprotected tables = full data exposure via the public anon key.

---

## 7. Performance

| Asset | Gzip est. |
|-------|-----------|
| Babel Standalone 7.29.7 | ~760 KB |
| ReactDOM 18.3.1 | ~130 KB |
| app.jsx (535 KB raw) | ~149 KB |
| Supabase JS 2.106.2 (eager) | ~80 KB |
| Leaflet 1.9.4 | ~40 KB |
| React 18.3.1 | ~42 KB |
| **Total cold load** | **~1.20 MB** |

Babel Standalone is the permanent bottleneck: ~760 KB download + CPU-bound JSX transpile before React mounts. Mid-range Android: 2–5s blank screen. Architectural constraint — not fixable without a build step.

**Images:** All `<img>` tags have `loading="lazy"` ✅

---

## 8. Cost Estimate

| Scale | DAU | Open-Meteo calls/day (no cache) | With proxy cache | Total/mo |
|-------|-----|----------------------------------|------------------|----------|
| Now | <10 | ~1,500 | ~60 | **$6** |
| 1K MAU | ~33 | ~5,000 | ~60 | **$6** |
| 10K MAU | ~334 | **~50,000 (ceiling ×5)** | ~120 | **$31** |
| 100K MAU | ~3,334 | impossible on free tier | ~240 | **$49** |

Proxy cache (written, undeployed 36 days) flattens the Open-Meteo curve through 100K MAU. One SSH session.

---

## 9. What Breaks First at Scale

**Open-Meteo at 67 DAU.** Not a warning — a hard ceiling with no user-visible error. 67 users × 150 calls = free tier gone. Scores return null. Grid shows "Nothing great this weekend." Users churn thinking the app is broken. The proxy weather cache reduces this to ~120 calls/day regardless of user count. It has been written and undeployed for **36 days**.

**Second: Supabase at ~8K MAU.** 2GB/month free bandwidth. Every wishlist/alert sync hits the REST API. Watch Supabase dashboard → Usage once past 1K MAU; upgrade to Pro ($25/mo) before the database auto-pauses at the free tier ceiling.

**Third: GitHub Pages 100GB bandwidth at ~28K MAU.** At 1.2 MB/load × 3 cold loads/month. Mitigate by lazy-loading Supabase (diff at `reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff`) before any viral post.

---

## Action Table

| Priority | Action | Time | Owner |
|----------|--------|------|-------|
| **P0** | Renew GitHub PAT — expires 2026-06-15 (6 days out) | 3 min | Jack |
| **P0** | Restore GEAR_ITEMS in app.jsx — Amazon earning $0 since June 7 | 20 min | Agent/Jack |
| **P1** | SSH VPS: `git pull && pm2 restart peakly-proxy` (Day 36) | 3 min | Jack |
| **P1** | Bundle: gate localhost CORS origins behind `NODE_ENV !== 'production'` | +2 min | Jack |
| **P1** | `_tryProxyWx` 5-min cooldown in app.jsx ~line 1041 | 15 min | Agent |
| **P2** | Verify Supabase RLS ON for `user_data` + `shared_lists` | 5 min | Jack |
| **P2** | Add SRI to React/ReactDOM/Babel/Supabase in index.html | 20 min | Jack |
| **P2** | `git apply reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff` | 1 min | Agent |
| **Info** | Cache stamp `20260608aaah` → `20260609a` | ✅ Done | DevOps |
