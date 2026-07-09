# Peakly DevOps Report — 2026-07-09

**Status: GREEN** — clean run. No P0 or P1 issues. Cache stamp `20260708a` is accurate (bumped July 8, no code changes since). Venue count updated to 373 (content agent added 3 venues July 8). One P2 dependency flag (Babel 8.x). Working tree clean.

---

## Prompt Corrections (permanent — stop re-raising these)

| Claim | Reality |
|---|---|
| "VPS down / Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Verify from networked terminal only. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "GEAR_ITEMS found" | **0 refs. Amazon cut for v1.** Stop. |
| "Cache buster stale / 20260708a" | **Accurate — last code change was July 8. Bumps automatically on next code edit.** |
| "Venue count 156 / 353 / 370 / 372" | **373 (133 ski / 240 beach) as of July 8. Eval only — grep undercounts to 156.** |
| "lateSeason: 6 venues" | **25 venues.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`).** Stop. |
| "Plausible data-domain wrong" | **FIXED July 7 → `j1mmychu.github.io/peakly`.** Stop. |
| "197 empty-tag venues" | **FALSE. All 373 have tags.** Stop. |

---

## Infrastructure Snapshot

| Check | Result |
|---|---|
| `app.jsx` size | 13,496 lines · ~659 KB |
| Brace balance | ✅ 5,568 / 5,568 BALANCED |
| Cache stamp (app.jsx / sw.js / index.html) | ✅ `20260708a` — accurate, last code change July 8 |
| Venue count (eval) | ✅ 373 (133 ski / 240 beach) — updated July 8 by content agent (+3 venues) |
| `.venue-baseline` | ✅ 370 — needs update to 373 (non-blocking, see P3) |
| GEAR_ITEMS refs | ✅ 0 |
| Plausible analytics | ✅ Present, uncommented, `defer`, correct domain `j1mmychu.github.io/peakly` |
| Sentry DSN | ✅ Active (`app.jsx:7`, `index.html:77`) |
| React version | ✅ 18.3.1 UMD — current stable |
| Babel Standalone | ⚠️ 7.29.7 — latest is 8.0.4 (major bump available, see P2) |
| Supabase JS | ✅ 2.106.2 (lazy-loaded, CDN) |
| Proxy URL | ✅ HTTPS `peakly-api.duckdns.org` — not raw IP, not HTTP |
| `fetchTravelpayoutsPrice` timeout | ✅ 5s AbortController + 3-attempt retry |
| `fetchWeather` timeout | ✅ 8s AbortController + 3-attempt retry, proxy-first with Open-Meteo fallback |
| Image lazy loading | ✅ 9 `<img>` tags use `loading="lazy"` |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, secrets |
| Travelpayouts token in client | ✅ NOT present — server-side only |
| Supabase anon key in client | ✅ Expected — RLS-gated, public-safe by design |
| TP_MARKER `710303` in client | ✅ Expected — public affiliate link marker, not a secret |
| Working tree | ✅ Clean |

---

## P0 — None

---

## P1 (Ongoing) — VPS Weather Cache: Jack-Verify Only

**Unverifiable from sandbox (egress block — NOT a VPS outage per CLAUDE.md).** Day 9 post-launch.

The in-memory LRU weather cache resets on any pm2 restart. Cold cache → 373 weather fetches hit Open-Meteo directly → free-tier quota exhausts at ~66 concurrent users → venues all score 50.

**Jack: 30-second check:**
```bash
curl https://peakly-api.duckdns.org/health
# Healthy: wx_cache_size > 0, uptime > 1d
# Cold (wx_cache_size = 0): self-heals in 2hrs as users load venues — only act if poll_errors > 50
```

---

## P2 — Babel Standalone: Major Version Available (7.29.7 → 8.0.4)

Confirmed via npm registry this run. Babel 8.x is a major release — breaking changes in JSX transform behavior are possible. A bad client-side Babel upgrade → blank screen, no React output.

**Risk:** LOW-MEDIUM. 7.29.7 is current in the 7.x series. No known CVEs affecting browser usage.

**When to upgrade:** Post-500 MAU. Test in a branch:
```html
<!-- index.html — branch test only, not prod -->
<link rel="preload" href="https://unpkg.com/@babel/standalone@8.0.4/babel.min.js" as="script" crossorigin />
<script src="https://unpkg.com/@babel/standalone@8.0.4/babel.min.js"></script>
```
Open app → check console for Babel parse errors → verify all 3 tabs render. Green → ship. Not green → stay on 7.x, add to `known-skipped.md`.

**Fix time:** 15 min. Do not do today.

---

## P3 — `.venue-baseline` Drift (Non-Blocking)

`.venue-baseline` still reads `370`. Content agent added 3 venues on July 8 bringing total to 373. The auto-push invariant guard checks `>= baseline`, so 373 > 370 passes fine — it only fails if venues drop. Update when convenient:

```bash
echo "373" > scripts/.venue-baseline
```

---

## P3 — SRI Hashes on CDN Scripts

Ongoing rejected item. Babel Standalone uses `eval()` for JSX transpilation, requiring `'unsafe-eval'` in any CSP — making strict SRI moot until a build step exists. Non-issue at current scale.

---

## Cost Projections

| Scale | DO VPS | GitHub Pages | Open-Meteo | Total/mo |
|---|---|---|---|---|
| Current (<100 MAU) | $6 | $0 | $0 (free) | **$6** |
| 1K MAU | $6 | $0 | $0 (free tier) | **$6** |
| 10K MAU | $12 (2GB RAM) | $0 | ~$29 | **$41** |
| 100K MAU | $48 (4 droplets + LB) | $0 | ~$290 | **$338** |

Revenue at 100K MAU: ~$758/mo ($7.58/1K). Costs $338/mo. **Margin: ~55%.**

---

## What Breaks First at Scale

**Open-Meteo free-tier exhaustion on cold cache.** At a Reddit spike (500 concurrent), the VPS proxy absorbs duplicates via in-flight dedup while cache is warm. A cold cache (pm2 restart during spike) fires 373 upstream calls simultaneously. Open-Meteo's free tier (~10K req/day) loses 3.7% of quota instantly. Sustained at 50 concurrent for 30 min → HTTP 429 → venues fallback to `score: 50` → grid looks broken → bounce.

**Prevention (30 min, do before next distribution push) — add disk persistence to `server/proxy.js`:**

```js
// Near top of server/proxy.js, after _wxCache definition
const WX_CACHE_FILE = '/tmp/peakly-wx-cache.json';

// Boot: seed from disk
try {
  const saved = JSON.parse(require('fs').readFileSync(WX_CACHE_FILE, 'utf8'));
  Object.entries(saved).forEach(([k, v]) => _wxCache.set(k, v));
  console.log(`[proxy] seeded ${_wxCache.size} wx entries from disk`);
} catch (_) {}

// Flush every 30 minutes
setInterval(() => {
  try {
    require('fs').writeFileSync(WX_CACHE_FILE, JSON.stringify(Object.fromEntries(_wxCache.entries())));
  } catch (_) {}
}, 30 * 60 * 1000);
```

Survives pm2 restarts. No new deps. File is ~100KB at steady state. Do this before the Week-2 Plausible-driven distribution push.

---

## Jack: Week-2 Actions

1. **Send retention email July 10** — 3 sentences, personal, ask what they searched for. First-week replies are user research you can't buy.
2. **Read Plausible before writing sprint code** — 9 days of real user data in the dashboard. Agents can't reach it from sandbox.
3. **VPS health check** — `curl https://peakly-api.duckdns.org/health`. 30 seconds.
4. **Glacier venues (PM v81)** — 5 prepped for `validate-venues.mjs`. ~30 min to ship; prioritize if Plausible shows ski filter engagement.

---

*DevOps agent — 2026-07-09. Next report: 2026-07-10.*
