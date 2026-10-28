# DevOps Report — 2026-10-28 (RED)

**Status: 🔴 RED — VPS Day 80. Whistler opens in 13 days. `origin/master` footgun Day 21. PRECACHE→CDN mismatch still live.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Do not interpret sandbox timeouts as VPS outage.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` lines / raw size | **14,237 lines / 758,944 bytes** (741 KB) — unchanged since 2026-10-10 ✅ |
| Total venues | **404** (eval-counted, bracket-walk) — **matches CLAUDE.md** ✅ (134 ski / 270 beach) |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — **44 days stale**. No code shipped since Aug 11, this is expected. First edit MUST bump in lockstep. ⚠️ |
| Plausible analytics | ✅ present, uncommented — `index.html:32` |
| React 18.3.1 (cdnjs) | ✅ pinned |
| Babel 7.24.7 (cdnjs) | ✅ dev-only; stripped by `build-web.mjs` in prod |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS, no raw IP |
| Travelpayouts token in client | ✅ `TP_MARKER="710303"` is public affiliate marker only — no secret |
| Supabase anon key in client | ✅ Intentional, public-safe, RLS-gated (`app.jsx:26`) |
| Sentry DSN | ✅ configured — `index.html:77` (DSN: `9416b032a46681d74645b056fcb08eb7`) |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` |
| Image `loading="lazy"` | ✅ all 9 `<img>` tags covered |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController timeout wired |
| `lateSeason:true` venues | ✅ **15** confirmed via grep |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| All API calls HTTPS | ✅ Open-Meteo, marine, proxy all HTTPS |
| BASE_PRICES coverage | ✅ **181 airports** — Open #22 CLOSED |
| `proxy.js` source (committed, NOT on VPS) | ✅ `forecast_days=14`, disk cache, iOS CORS, `DELETE` allow, `http2` APNs, `ieee-p1363` JWT |
| PRECACHE vs loaded Babel URL | ❌ **MISMATCH** — see P1-A below |

---

## 2. Critical Issues (P0)

### P0-A: VPS Redeploy — Day 80 (PM deadline: Oct 30 — 2 days)

**The single most important action in the repo. Nothing else matters more this week.**

The committed `server/proxy.js` includes: `forecast_days:14` (two-weekend scoring), disk-cached `_wxCache` (cold-start protection), `capacitor://localhost` CORS (iOS native), alert `DELETE` support, `http2` APNs, `ieee-p1363` JWT. None of it is running. The VPS is on the Aug 11 build — 80 days stale.

Whistler opens **Nov 10 (13 days)**. The Reddit post that drives the first traffic spike targets that day per PM reports. Without the disk-persisted cache, a `pm2 restart` immediately before the spike hits means every concurrent user fans out 404 Open-Meteo requests simultaneously — free tier ceiling exceeded in seconds.

**PM deadline is Oct 30. That is 2 days from now. This is not optional.**

**Exact SSH commands (Jack):**
```bash
ssh root@198.199.80.21
cd /tmp && git clone https://github.com/j1mmychu/peakly.git peakly-deploy 2>/dev/null || (cd /tmp/peakly-deploy && git pull)
cp /tmp/peakly-deploy/server/proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy
# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: apns:configured, wx_cache_size:0 (cold), forecast_days:14
```

**Verification checklist post-redeploy:**
```bash
curl -s https://peakly-api.duckdns.org/health | grep -E "uptime|apns|wx_cache|forecast"
curl -s "https://peakly-api.duckdns.org/api/weather?lat=50.1&lon=-122.9&days=14" | grep -c "hourly"
```

---

## 3. High Issues (P1)

### P1-A: PRECACHE→CDN Mismatch (breaks SW Babel pre-caching — every page load)

**sw.js line 4 pre-caches a URL that index.html never loads. The pre-cache is dead weight — it fetches a file nobody uses.**

```
sw.js PRECACHE:  https://unpkg.com/@babel/standalone@7.29.7/babel.min.js
index.html:88:   https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js
```

Two different CDNs, two different versions. The SW installs and fetches a 1.1MB file from unpkg that the page will never request. Meanwhile the actual Babel load (cdnjs) is served fresh every time, defeating the pre-cache intent.

**The correct fix is to clear PRECACHE entirely.** The production build (GitHub Pages) runs `scripts/build-web.mjs` which esbuild-strips Babel. Production never loads Babel at all. Caching a dev-only transpiler in the service worker is wrong by design.

**Fix — sw.js line 3–5 (`~30 second change`):**
```diff
-const PRECACHE = [
-  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
-];
+const PRECACHE = [];
```

**Time to fix: 1 minute.** Requires lockstep cache stamp bump across sw.js + app.jsx + index.html per the auto-push invariant.

---

### P1-B: `origin/master` footgun — Day 21 (50 commits stale, deploy.yml triggers on it)

`deploy.yml` triggers on both `main` AND `master`. `origin/master` is **50 commits behind** `origin/main` — it's frozen at `b6dc033` (May 2026: `auto: terms.html`). A push to master — by anyone with write access, an errant `git push`, or any automation targeting the wrong branch — deploys 5-month-stale code to the live site with zero warning.

This has been flagged for 21 days with no action.

**Option A — remove master from deploy.yml (recommended, 2-minute fix):**
```diff
# .github/workflows/deploy.yml lines 5-8
 on:
   push:
     branches:
       - main
-      - master
```

**Option B — delete origin/master:**
```bash
git push origin --delete master
```

Either way, master stops being a live footgun. Option A is safer if master is ever used as a backup name.

---

## 4. Medium Issues (P2)

### P2-A: Cache stamp `20260914a` is 44 days stale

No code has shipped since Aug 11, so this is technically correct — the stamp matches deployed code. But the first editor to touch `app.jsx` must bump it in lockstep across all three files or the auto-push guard will reject the commit. Leave a note somewhere visible.

The stamp IS stale relative to today's date but it IS accurate relative to the last deploy. Not a live bug, just a "next edit will require this" reminder.

### P2-B: Babel 7.24.7 is ~2.5 years behind current (7.29.7)

`index.html:88` loads Babel 7.24.7. The SW PRECACHE (before the fix above) was caching 7.29.7 from unpkg. In production, Babel is stripped entirely by esbuild, so this only affects local dev. Low risk, but worth a version bump in a future edit.

Fix in `index.html` (dev loop only, no prod impact):
```diff
-<link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js" as="script" crossorigin />
-<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"></script>
+<link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.29.7/babel.min.js" as="script" crossorigin />
+<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.29.7/babel.min.js"></script>
```

---

## 5. Security Audit

| Check | Status |
|-------|--------|
| Travelpayouts secret token in client | ✅ NOT present — `TP_MARKER="710303"` is public affiliate marker only |
| Supabase service_role key in client | ✅ NOT present — only anon key (public-safe, RLS-gated, expected) |
| Raw API keys / secrets in any client file | ✅ Clean — no credentials found |
| `.gitignore` covers `.env`, `.p8`, `.pem`, `.key` | ✅ |
| Recent commits (last 10) introduce secrets | ✅ Clean — only report files in recent history |
| `server/proxy.js` APNS `.p8` path | ✅ gitignored pattern `*.p8` — key never committed |
| Supabase anon key expiry | `exp: 2093505784` = year **2036** — not expiring soon ✅ |

**Summary: Security posture is clean.** Supabase anon key exposure is intentional, documented, and RLS-protected. No hidden secrets found.

---

## 6. Performance Analysis

**CDN load estimate (first visit, no cache):**
| Asset | Approx size |
|-------|-------------|
| React 18.3.1 (cdnjs) | ~42 KB gzipped |
| ReactDOM 18.3.1 (cdnjs) | ~130 KB gzipped |
| Babel standalone 7.24.7 (dev only, stripped in prod) | ~1,100 KB gzipped |
| Sentry SDK | ~40 KB gzipped |
| Plausible | ~1 KB gzipped |
| `app.jsx` (dev) or `dist/app.min.js` (prod) | 759 KB raw → ~439 KB minified → ~110 KB gzipped |

**Production (GitHub Pages, post-build):** React (~172 KB) + Sentry (~40 KB) + app.min.js (~110 KB gzipped) ≈ **~322 KB total.** Babel is stripped. This is acceptable for mobile.

**Biggest performance bottleneck:** The 404-venue weather batch fires on mount — up to 8 concurrent Open-Meteo requests per the 50/2s batching logic. Without the VPS proxy cache (see P0-A), every cold-start user triggers a fanout to Open-Meteo directly. With 50+ concurrent users hitting the same venues, the free tier ceiling is breached. **This is the P0-A problem manifesting as a perf/reliability issue.**

**Image loading:** ✅ All 9 `<img>` tags use `loading="lazy"`. Fine.

---

## 7. Cost Estimate

| Scale | Infrastructure | Notes |
|-------|---------------|-------|
| Current (<100 MAU) | $6/mo (DO droplet) + $0 Supabase free | Comfortable |
| 1K MAU | ~$6/mo + $0 Supabase | Open-Meteo free tier holds (66 concurrent DAU limit before throttle) |
| 10K MAU | ~$18/mo (droplet upgrade) + ~$25/mo Supabase Pro | Weather cache becomes mandatory, not optional |
| 100K MAU | ~$60-100/mo DO + ~$25 Supabase + CDN | Need to evaluate Open-Meteo commercial or cache aggressively |

**Optimization opportunities:**
1. The disk-persistent `_wxCache` in the committed `proxy.js` (not yet deployed) handles the 10K+ case. Get it deployed.
2. At 10K MAU, Supabase free tier (500MB DB, 2GB bandwidth) will hit bandwidth limits. Budget $25/mo Pro tier.
3. At 100K MAU, weather proxy becomes a bottleneck — consider adding `p2-4gb` DO droplet (~$24/mo) with pm2 cluster mode before that.

---

## 8. What Breaks First at Scale

**The weather fanout.** Without the VPS disk cache deployed, the current architecture has a cliff at ~66 concurrent users hitting uncached venue coordinates simultaneously. Open-Meteo's free tier throttles at that point. The client has a direct fallback to Open-Meteo, which means a traffic spike (Reddit post on Whistler opening day = likely 500-1000 concurrent) sends ALL 404×N weather requests directly to Open-Meteo with no shared deduplication. Result: either mass throttling (stale/empty weather = 50/50 score fallback = bad product experience) or IP ban. The `server/proxy.js` committed code solves this with a shared in-memory + disk LRU cache and in-flight deduplication (1000 concurrent users hitting the same coord = 1 upstream call). **Deploy it. Now. It's been committed for 80 days.**

---

## 9. Summary — Open Items

| Item | Priority | Age | Status |
|------|----------|-----|--------|
| VPS redeploy (`proxy.js` w/ disk cache + 14-day wx + iOS CORS + DELETE + APNs) | **P0** | Day 80 | ❌ Not deployed — **2 days to PM deadline Oct 30** |
| `origin/master` footgun (50 commits stale, deploy.yml triggers on it) | **P1** | Day 21 | ❌ Not fixed |
| PRECACHE→CDN version/URL mismatch in sw.js | **P1** | Day 21+ | ❌ Not fixed (1-min fix) |
| APNS DER→P1363 + HTTP/2 fix (`proxy.js` — committed, not deployed) | **P1** | Committed Aug 11 | ✅ In committed proxy.js — blocked on P0-A deploy |
| Photos: ~360+ venues with generic stock images | P2 | Ongoing | ❌ Needs Unsplash key |
| BASE_PRICES coverage | ✅ CLOSED | — | 181 airports |

---

*Report generated: 2026-10-28 by peakly-devops scheduled agent.*
