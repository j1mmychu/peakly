# DevOps Report — 2026-08-17 (YELLOW)

**Status: 🟡 YELLOW**

Today is 2026-08-17. Reddit launch deadline: Aug 22 — **5 days out**. Running from a remote sandbox; VPS (`peakly-api.duckdns.org`) unreachable at the network layer (sandbox egress proxy returns 403 — standard, not a VPS issue). Per CLAUDE.md confirmed 2026-08-11 by Jack: VPS fully deployed, disk cache live, `forecast_days:14` live, `apns:configured`. Treating VPS healthy.

**Actions executed this run:** NONE. PM v121 Decision 1 closes the BASE_PRICES sprint at 82%. PM v121 Decision 2 re-affirms the venue moratorium at 394. No code changes authorized or executed — cache stamp `20260816b` carries forward correctly (last bumped by Content 08-16 commit `323f232`).

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | 13,718 lines / 699 KB (+70 lines from Content's 5 latam venues) |
| Cache stamp | `20260816b` ✅ — in lockstep across app.jsx / sw.js / index.html |
| Plausible analytics | ✅ present and uncommented (`defer data-domain="j1mmychu.github.io/peakly"`) |
| Sentry DSN | ✅ LIVE — `9416b032a46681d74645b056fcb08eb7` in both `index.html:77` and `app.jsx:7–8` |
| Venue count | **394** ✅ matches `.venue-baseline` — moratorium holds |
| Ski / Beach split | 131 ski / 263 beach |
| Venue baseline file | `scripts/.venue-baseline` = 394 ✅ |

No issues.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` ✅ HTTPS |
| Raw IP reference (198.199.80.21) | Not found ✅ |
| Timeout + fallback | ✅ `AbortController` + 5s timeout in `fetchTravelpayoutsPrice`, 4s in weather proxy |
| Concurrency cap | ✅ Semaphore at max 3 concurrent flight API requests (line 6260) |
| VPS health (last confirmed) | ✅ 2026-08-11 by Jack — disk cache live, `apns:configured`, CORS fixed |
| Open #19, #23 | CLOSED — do not re-flag |

No P0 here. Proxy is HTTPS-only, well-guarded, and confirmed healthy as of 2026-08-11.

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo client endpoints | `api.open-meteo.com/v1` + `marine-api.open-meteo.com/v1` ✅ |
| VPS proxy caching (Open #23) | ✅ CLOSED — disk cache live per 2026-08-11 VPS redeploy |
| `forecast_days` | `forecast_days=14` via proxy confirmed live |
| Client-side weather cache | 2hr localStorage TTL per-coord |
| Batch throttle | 50 venues / 2s |
| Free-tier risk at Reddit launch | Mitigated — VPS disk cache absorbs repeat lookups |

No issues.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ CLEAR — `TP_MARKER = "710303"` is the public affiliate marker, not a secret |
| Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` in `app.jsx:26` — **EXPECTED AND CORRECT**. Public-safe per Supabase architecture; RLS gates all writes. Not a leak. |
| APNS keys in client | ✅ None found |
| Other credentials | ✅ No `.p8`, no `APNS_KEY_ID`, no Stripe, no service-role keys in any tracked file |
| `.gitignore` | ✅ Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision` |
| Recent commits (7 days) | ✅ All clean — report files, auto-pushed photo candidates, no suspicious additions |
| Sentry DSN exposure | DSN is in `index.html:77` and `app.jsx:7` — standard for client-side Sentry, not a secret |

**No security issues.**

---

## 5. Performance Analysis

| Check | Result |
|-------|--------|
| Production JS bundle | CI builds `dist/app.min.js` from `app.jsx` on every push to main — local stale copy not authoritative |
| Dev path Babel | `@babel/standalone@7.29.7` parses 699KB JSX in-browser — dev-only path; production strips Babel via esbuild |
| React version | `18.3.1` via unpkg ✅ (React 19.x available but UMD pin intentional — low risk) |
| Supabase UMD | `@supabase/supabase-js@2.106.2` lazy-loaded (only on sign-in) ✅ |
| Image lazy loading | ✅ `loading="lazy"` on all 9 image render sites verified |
| **Biggest perf bottleneck** | **Photos** — ~213 of 394 venues serve duplicate/generic Unsplash URLs. Each card renders a 800×600 external image (~150–350KB). Lazy loading mitigates initial FCP but doesn't help the score-to-conversion window for r/skiing readers who scroll. This is the Open #20 gap, gated on UNSPLASH_KEY from Jack. |

---

## 6. BASE_PRICES Coverage

| Metric | Value |
|--------|-------|
| Unique venue APs | 162 |
| APs in BASE_PRICES | 139 tracked (160 entries including legacy/bonus APs) |
| Missing APs | **23** (all single-venue destinations) |
| Coverage | **~82%** — PM v121 Decision 1: **SPRINT CLOSED** |

**Missing 23 APs (single-venue only, ~$X estimate fallback active):**
`BEY, BME, BOC, CMH, DJE, EAS, EYW, FEN, GEG, HNA, INH, KRK, KUL, LEA, MYR, OKA, RDD, SID, SOF, SRQ, TBS, USH, VPS`

Per PM v121 Decision 1: no further BASE_PRICES work until post-Reddit. These 23 APs serve one venue each (Key West/EYW, Bocas del Toro/BOC, Kraków/KRK, etc.). The `~$X` estimate fallback is live and visible. **Not blocking Reddit launch.** Do not chase these.

---

## 7. Infrastructure Cost

| Scale | Monthly Est. | Notes |
|-------|-------------|-------|
| Current (<100 MAU) | **$6/mo** | $6 DO droplet (1GB RAM). GitHub Pages free. |
| 1K MAU | **$6–12/mo** | Same droplet handles it. Weather VPS cache absorbs spikes. |
| 10K MAU | **$24–48/mo** | Upgrade to 2GB RAM droplet ($12) + CDN for images ($12–24). pm2 cluster mode (2 workers). |
| 100K MAU | **$96–144/mo** | 2× $24 droplets behind a load balancer ($12) + Cloudflare free tier CDN. |

**Cost optimization wins available at scale:**
1. Cloudflare free tier in front of GitHub Pages — zero cost, absorbs CDN load and adds DDoS protection before Reddit launch
2. pm2 cluster mode on VPS — 2 workers on 1GB RAM, free, doubles weather proxy throughput
3. Unsplash photos should reference `?w=600&q=75` URL params — cuts per-image transfer by ~40%

---

## 8. P0 / P1 / P2 Summary

### P0 — Blocks Reddit launch (Aug 22)

**Photos: ~213 duplicate/generic across 394 venues**
- What's broken: r/skiing readers see the same powder shot on 10 different resorts. One-shot chance at 100K-member subreddit. A single "did anyone else notice all the photos are the same" comment kills conversion.
- Fix: Jack provides UNSPLASH_KEY → `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait` → `node scripts/photos-review.mjs` → `node scripts/photos-apply.mjs --write` → commit. Runtime: ~2 hours.
- Deadline: EOD Aug 18 or Reddit post slips to Aug 29 (PM v121 Decision 3, non-negotiable).
- **Jack owns this. One action: create free Unsplash developer account at unsplash.com/developers, share the Access Key.**

### P1 — Fix this week

None. VPS is healthy. BASE_PRICES sprint closed. Cache stamp current. Security clean.

### P2 — Fix this sprint (post-Reddit)

**16 stale `claude/*` remote branches + 3 other stale branches (P3)**
- Noise in the branch list; potential confusion during post-launch hotfixes.
- Fix (post-Reddit): `git push origin --delete claude/analyze-test-coverage-WVIsT claude/code-review-cleanup-HjoCS claude/condense-alert-page-jzdLo claude/enhance-loading-screen-rZ1dc claude/fix-app-jsx-content claude/implement-todo-lNL7W claude/improve-peakly-ui-UHCHG claude/improve-scoring-system-XYGY6 claude/product-reliability-assessment-w0poL claude/redesign-front-page-EndKs claude/review-peakly-ux-UQ0Qu claude/simplify-alerts-page-2ejGB claude/simplify-profile-page-Bi2Tc claude/standardize-venue-data-CufiQ claude/streamline-onboarding-account-97XRR fix-appjsx-final restore-appjsx test-small`
- Time to fix: 5 minutes.
- **Do not delete until after Reddit launch** (post-mortem reference).

**Supabase delete-account SQL (App Store only, not Reddit gate)**
- Paste `server/sql/delete-account.sql` into Supabase SQL editor.
- Time: 2 minutes.
- Client graceful fallback is live; web launch unaffected.

### Closed — Do Not Re-Flag

| Item | Status |
|------|--------|
| Open #19 (VPS redeploy) | ✅ CLOSED — Jack SSH 2026-08-11 |
| Open #23 (disk cache) | ✅ CLOSED — Jack SSH 2026-08-11 |
| GitHub PAT peakly-vps-deploy | ✅ CLOSED — no live consumer |
| Amazon/GEAR_ITEMS | ✅ CUT for v1 by Jack. `grep -c GEAR_ITEMS app.jsx` → 0. Correct. |
| Peakly Pro | ✅ CUT for v1 |
| BASE_PRICES sprint | ✅ CLOSED at 82% per PM v121 Decision 1 |
| Venue additions | ✅ MORATORIUM — 394 is the pre-Reddit number, no exceptions |

---

## 9. What Breaks First at Scale

The single most fragile point is **Open-Meteo free-tier rate limits under a Reddit spike**. Peakly has 394 venues fetching forecasts in a 50/2s batched loop. A single Reddit post to r/skiing (100K members) could trigger 500–2,000 concurrent users in 30 minutes — all hitting the same ~394 lat/lon pairs simultaneously. The VPS weather cache absorbs this if it's warm. Cold cache (fresh `pm2 restart`, or the VPS restarting under load) returns the problem: 394 uncached venues × N concurrent users = N×394 upstream Open-Meteo calls, easily blowing through the free-tier ceiling.

**Prevention already in place:** VPS disk cache (shipped 2026-08-11) survives `pm2 restart`. As long as the VPS isn't rebooted on launch day, the warm cache is the failsafe.

**What to do 24h before posting:** SSH in and verify `curl https://peakly-api.duckdns.org/health` shows `wx_cache_size` > 200. If it's near 0, hit the app once to warm it. Do not restart the VPS on launch day.

**Second failure mode:** GitHub Pages CDN cold-edge misses. The `dist/app.min.js` at 439KB minified hits GitHub's CDN on first load per edge location. Reddit traffic often hits 5–10 different CDN edges simultaneously. Preloading is not an option (no server-push on Pages). Cloudflare free proxy in front of Pages would add a second CDN layer and eliminate most edge-miss latency — 30-minute setup, zero cost, worth doing before Aug 22.

**Cloudflare setup (30 min, free):**
```
1. cloudflare.com → Add site → j1mmychu.github.io (or custom domain when registered)
2. DNS: CNAME peakly → j1mmychu.github.io, Proxy = orange cloud
3. SSL/TLS: Full (strict)
4. Caching: Cache Level = Standard, Browser TTL = 4h
5. Done — Cloudflare now sits in front of Pages
```
This also absorbs any DDoS/bot traffic from a viral Reddit post without touching the VPS.

---

*Report generated 2026-08-17. No code changes this run — PM v121 Decisions 1 and 2 close BASE_PRICES and venue work pre-Reddit. Single remaining P0: Jack's UNSPLASH_KEY by EOD Aug 18.*
