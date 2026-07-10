# Peakly DevOps Report — 2026-07-10

**Status: GREEN** — clean run. No new P0 or P1 issues vs July 9. Venue count 375 after July 9 Content run (+2 beach venues). `lateSeason` corrected to 9 venues (down from 28 false positives fixed July 9). **Week-2 email is P0 today — Jack must send before July 11.**

---

## Prompt Corrections (permanent — stop re-raising these)

| Claim | Reality |
|---|---|
| "VPS down / Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Verify from networked terminal only. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "GEAR_ITEMS found" | **0 refs. Amazon cut for v1.** Stop. |
| "Cache buster stale / 20260708a" | **Accurate — last code change was July 8. Bumps automatically on next code edit.** |
| "Venue count 156 / 353 / 370 / 373" | **375 (133 ski / 242 beach) as of July 9. Eval only — grep undercounts to 156.** |
| "lateSeason: 6 / 25 / 28 venues" | **9 venues — corrected July 9 Content run.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`).** Stop. |
| "Plausible data-domain wrong" | **FIXED July 7 → `j1mmychu.github.io/peakly`.** Stop. |
| "197 empty-tag venues" | **FALSE. All 375 have tags.** Stop. |
| "2 dup venues pending removal" | **FIXED July 8.** Stop. |

---

## Infrastructure Snapshot

| Check | Result |
|---|---|
| `app.jsx` size | 13,502 lines · 676 KB |
| Brace balance | ✅ 5,572 / 5,572 BALANCED |
| Cache stamp (app.jsx / sw.js / index.html) | ✅ `20260708a` — accurate, last code change July 8 |
| Venue count (eval) | ✅ **375** (133 ski / 242 beach) — +2 beach venues added July 9 (Tenerife, Crete) |
| `.venue-baseline` | ✅ 375 (updated by Content July 9) |
| Duplicate IDs (structural) | ✅ 0 — confirmed via eval() |
| GEAR_ITEMS refs | ✅ 0 |
| `lateSeason` venues | ✅ 9 (trimmed July 9 from 28 false positives) |
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

**Unverifiable from sandbox (egress block — NOT a VPS outage per CLAUDE.md).** Day 10 post-launch. Return visitor window opens July 11–13 — cold cache is now a real risk.

The in-memory LRU weather cache resets on any pm2 restart. Cold cache → 375 weather fetches hit Open-Meteo directly → free-tier quota exhausts at ~66 concurrent users → venues all score 50.

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

## P2 — 5 Placeholder-Tag Ski Venues (Content Agent Task, Day 4)

PM v83 confirms these 5 venues still carry placeholder tags: **winter-park, copper-mountain, lake-louise, palisades-tahoe, brighton**. Tag copy is ready in Content report July 9. Not a DevOps fix — flagging here to ensure the next Content run ships it.

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

## Jack: TODAY (July 10)

| Item | Urgency | What |
|------|---------|------|
| **Send Week-1 retention email** | 🔴 **P0** | Last call. Return window opens July 11. 3 sentences, personal, ask what they searched for. |
| **VPS health check** | 🟡 **P1** | `curl https://peakly-api.duckdns.org/health` — confirm `wx_cache_size > 0` before return visitors arrive July 11. Use `pm2 reload` not `pm2 restart` if you need to restart. |
| **Read Plausible** | 🟡 **P1** | 9 days of real user data. Zero product decisions have been data-driven. plausible.io → `j1mmychu.github.io/peakly`. |
| **Supabase SQL paste** | 🟠 this week | `server/sql/delete-account.sql` → SQL editor. Day 30. iOS App Store 5.1.1(v). |

---

*DevOps agent — 2026-07-10. Next report: 2026-07-11.*
