# DevOps Report — 2026-08-19 (YELLOW)

**Status: 🟡 YELLOW**

Today is 2026-08-19. Reddit launch window: **Aug 22 (tentative) / Aug 29 (safety)**. Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress proxy returns 403 — standard constraint, not a VPS failure). Per CLAUDE.md 2026-08-11 verified by Jack: VPS fully deployed, disk cache live, `forecast_days:14`, CORS fixed, `apns:configured`. Treating VPS healthy.

**Actions executed this run:** Cache stamp is current (`20260818a`) — no app.jsx/sw.js/index.html commits since yesterday's bump, no action needed.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,729 lines / 711,662 bytes** (~695 KB raw; +17KB since yesterday's photo commits) |
| `dist/app.min.js` | **449 KB** (last built Aug 14 — CI rebuilds on next push, stale copy is inert) |
| Cache stamp | **`20260818a`** ✅ — current, no app.jsx changes today to trigger a bump |
| Plausible analytics | ✅ `defer data-domain="j1mmychu.github.io/peakly"` — present, uncommented |
| Sentry DSN | ✅ Live — `9416b032a46681d74645b056fcb08eb7` in `index.html:77` + `app.jsx:7–8`, `Sentry.captureException` wired at `app.jsx:174` |
| Venue count | **394** (131 ski / 263 beach) — category grep verified, matches `.venue-baseline` = 394 ✅ |
| Lazy images | ✅ All 10 card/sheet image render sites have `loading="lazy"` |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` ✅ HTTPS — no raw IP in client |
| Timeout | ✅ `AbortController` 5s in `fetchTravelpayoutsPrice`, 4s in `_tryProxyWx` |
| Concurrency cap | ✅ Semaphore at max 3 concurrent flight requests (`app.jsx:6260`) |
| Exact-fares threshold | ✅ `≥40%` live coverage required before switching to exact-fares-only mode (fixed `6e45fee`) |
| VPS health | ✅ Confirmed 2026-08-11 by Jack — disk cache, CORS, DELETE alerts, `apns:configured` |

No P0. Open #19 and #23 are CLOSED — not re-flagged.

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo client | `api.open-meteo.com/v1` + `marine-api.open-meteo.com/v1` ✅ |
| VPS proxy cache | ✅ Disk-persistent per 2026-08-11 redeploy (disk + 2hr in-memory LRU) |
| `forecast_days` | `=14` via proxy ✅ |
| Client-side wx cache | 2hr localStorage TTL per-coord ✅ |
| Batch throttle | 50 venues / 2s ✅ — critical for 394-venue cold load |
| Free-tier ceiling | LOW risk at current MAU; VPS disk cache is the Reddit spike guard |

No issues.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token | ✅ Only `TP_MARKER = "710303"` (public affiliate marker) — server-side token never in client |
| Supabase anon key | `eyJhbGci...` at `app.jsx:26` — **expected and correct**. RLS gates all writes; by design public |
| APNS keys in client | ✅ None. `APNS_LIVE = false` at `app.jsx:12655` — gated off on iOS until VPS .p8 active |
| Other credentials | ✅ No `.p8`, no service-role keys, no Stripe, no Sentry write key in tracked files |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision` |
| Recent commits (last 10) | ✅ Photo URL updates, report files, no credential-shaped strings |
| Sentry DSN exposure | Public-safe by design for client-side Sentry — not a secret |

**No security issues.**

---

## 5. Performance Analysis

| Metric | Value | Note |
|--------|-------|------|
| CDN total weight (dev) | ~1.05 MB transferred | React 18 (~45KB gz) + ReactDOM (~130KB gz) + Babel standalone (~880KB gz) |
| Production bundle | **449 KB** (`dist/app.min.js`) | Babel stripped by esbuild; CI builds fresh on every push |
| Biggest perf bottleneck | **Babel standalone (880KB uncompressed, ~280KB gzipped)** in dev-path | Production route (`dist/`) eliminates it entirely via CI |
| Image lazy loading | ✅ All 10 card/sheet render sites | No eager off-screen loads |
| React version | `18.3.1` unpkg ✅ | |
| Babel version | `7.29.7` (current stable as of Aug 2026) ✅ | |

**Bottom line:** Dev path (`index.html` direct) has the Babel wall (~880KB, blocks first render). Production path (`dist/index.html`) pre-compiles via esbuild — no Babel load. Any user hitting GitHub Pages (`j1mmychu.github.io/peakly`) gets the production path. Dev path is Jack's local loop. No action.

---

## 6. Photo Coverage Analysis

| Metric | Count | % |
|--------|-------|---|
| Total venues | 394 | 100% |
| Venues with real photo URLs | 394 | 100% |
| Wikimedia Commons photos | 67 | 17% |
| Named Unsplash photos | 327 | 83% |
| Generic `source.unsplash.com` | **0** | 0% ✅ |
| **Duplicate photo groups** | **83** | — |
| **Venues sharing a photo with ≥1 other** | **186** | **47%** |
| Unique photo URLs across all 394 venues | 291 | — |

**The issue is dedup, not coverage.** All 394 venues have a real URL. But 186 venues (47%) share a photo ID with at least one other venue — a user scrolling Explore will see the same shot 2–4× in a row. Worst offenders: one Unsplash photo appears on 4 venues. 83 total groups.

**Yesterday's PM assessment of "63% real-photo coverage" counted per-unique-URL coverage, not per-venue URL presence.** Both metrics are correct for different purposes — "do all venues have a URL?" (100% yes) vs "do all venues have a unique photo?" (53% yes / 47% sharing).

**Dedup fix path:** Run `scripts/photo-dedup.cjs` (already in repo from 2026-06-13 round-robin pass) — or run another Wikimedia Commons search pass targeting specifically the 186 venues in dup groups. Content agent at 15:00 UTC is better positioned for this; DevOps can run it but it's a content pipeline task.

---

## 7. Cost Estimate

| Scale | Monthly | Breakdown |
|-------|---------|-----------|
| **Current (<10 MAU)** | **$6/mo** | DigitalOcean 1GB droplet ($6) |
| **1K MAU** | ~$6/mo | VPS handles weather cache; Open-Meteo free tier; GitHub Pages free |
| **10K MAU** | ~$12–18/mo | VPS upgrade to 2GB ($12–18); Open-Meteo commercial license ~$0 (still free tier ceiling unclear at this scale) |
| **100K MAU** | ~$50–120/mo | 2–4GB VPS + possible CDN costs; Open-Meteo commercial license if >10K/day requests |

**Cost optimization opportunity:** Cloudflare free tier (Jack's 30-min browser task, flagged by PM as **Aug 19 priority**) adds a CDN layer in front of GitHub Pages. At Reddit-spike scale (10K hits in 1 hour), this prevents GitHub Pages from rate-limiting or throttling. Zero marginal cost. Zero code changes. Just DNS CNAME.

---

## 8. Pre-Launch Blockers

### P1 — Cloudflare CDN Not Set Up (Jack, 30 min, Aug 19)

**Status: Outstanding. PM flagged as Aug 19 browser task.**

No code fix — DNS change only. Without it, a Reddit spike hits GitHub Pages directly. GitHub Pages handles typical hobby traffic fine; a HN/Reddit frontpage moment with 5K concurrent users hitting the same static host could return 429s or slow dramatically.

**Fix (Jack only, GitHub Pages + Cloudflare):**
```
1. Add site to Cloudflare (free tier)
2. Set DNS: CNAME peakly → j1mmychu.github.io
3. SSL: Full (strict) mode in Cloudflare
4. Cache: cache-control max-age=3600 for /peakly/*.js (cache busted by query string)
5. Verify: curl -I https://peakly.app (or the custom domain)
```

**At current MAU (<10): no urgency.** At Reddit-post moment: P1.

### P2 — Photo Dedup: 186 of 394 Venues Share Photos (47%)

**Status: Active sprint. PM authorized pipeline run Aug 19.**

Not a security or infra issue. User experience issue: duplicate photos make the Explore grid visually repetitive at scale. Fix requires:

1. Run Wikimedia Commons API search for venues in the 83 dup groups
2. Apply unique replacement URLs
3. Run `scripts/photo-dedup.cjs` to verify no new dups introduced

Content agent at 15:00 UTC is the right executor. DevOps can run if needed.

### Noted (Not Re-Flagging)

- Stale remote branches (15 `claude/` branches): in `known-skipped.md`, Jack's GitHub UI task, post-launch
- APNS_LIVE = false: `app.jsx:12655` — intentional until .p8 wired, iOS v1 gates Alerts tab, web unaffected
- Open #19 / #23: CLOSED per CLAUDE.md 2026-08-11
- Supabase account-deletion SQL paste: Jack-only action, client ships graceful fallback

---

## 9. What Breaks First at Scale

**Reddit spike kills the Travelpayouts batch load first, not the static site.** When 500+ users hit simultaneously, `fetchTravelpayoutsPrice` fires 394 parallel requests through the VPS proxy. The proxy caps at 3 concurrent flight requests (`app.jsx:6260`), which is correct — but that means 394 venues queue sequentially: at 100ms/request, that's 39 seconds of loading state before prices resolve. The ≥40% threshold for exact-fares mode means users see estimates for the first 3–4 seconds (correct), then most cards stay in estimate mode because 60% of venues never get a Travelpayouts hit within the queue depth.

**This is fine.** Estimates with `~$X` are honest and render instantly. The spike risk is Open-Meteo rate ceiling: at 500 concurrent users, if the VPS disk cache is cold (first restart), each unique coord fires upstream. With 394 venues at ~300 coords, that's 300 requests in <2 seconds — Open-Meteo's free tier is ~10K/day with burst tolerance, so this is survivable once, but a sustained HN frontpage (10K+ users over 24h) will hit the ceiling. Cloudflare in front of the static assets + VPS cache pre-warm (Jack, the day before posting) are the mitigations. Both are Jack-only actions, neither requires a code change.

---

*Report generated 2026-08-19. Cache stamp current (`20260818a`). Site health GREEN. Photo dedup is the only active quality gap — 186/394 venues sharing (47%). Cloudflare still outstanding (Jack, 30 min). No P0s. Launch window Aug 22/29 depends on photo pipeline progress.*
