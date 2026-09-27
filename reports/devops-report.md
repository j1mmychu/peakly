# DevOps Report — 2026-09-27 (RED)

**Status: 🔴 RED — VPS proxy.js undeployed Day 49. Oct 18 launch is 21 days away. Two-weekend scoring dead, iOS native blocked, Sep 9+10 fare-fallback commits unreachable. Code freeze Day 14 — zero regressions. All other systems GREEN.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block, curl exit 56). Proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health unverifiable from this environment.

---

## What Changed Since Yesterday (Sep 26)

Zero code commits to `app.jsx`, `sw.js`, or `index.html`. Three daily report commits (PM v162, Content Sep 26, DevOps Sep 26) plus `reports/reddit-launch-post.md`. Structurally identical to yesterday. **One resolved finding:** yesterday's VENUES bracket-walker returning 406 was a false alarm — today's eval confirms **404** (134 ski + 270 beach), zero entries missing `category`. Stale branch count: 18. Code freeze Day 14 holding.

**No new P0s. Same single blocker: VPS proxy.js is not deployed.**

---

## 1. Live Site Health — ✅ GREEN

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 14,237 | ✅ |
| `app.jsx` size | 758,944 bytes (741 KB source) | ✅ |
| Built bundle (`dist/`) | ~439 KB minified (esbuild, Babel stripped) | ✅ |
| Cache stamp | `20260914a` — Day 14 of code freeze, index.html query param matches | ✅ |
| SW `CACHE_NAME` | `peakly-20260914a` — matches app.jsx | ✅ |
| VENUES (eval-count) | **404** — 134 skiing / 270 beach — yesterday's "406" false alarm resolved | ✅ |
| VENUES missing `category` | **0** — all 404 entries have valid category | ✅ |
| `lateSeason: true` | 15 venues (confirmed grep) | ✅ |
| BASE_PRICES coverage | 100% (152/152 airports) — Open #22 closed Sep 14 | ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io/peakly"` | ✅ |
| Sentry DSN | Live: `9416b032...` in `index.html:77` — error capture active | ✅ |
| React | 18.3.1 (cdnjs) | ✅ |
| Babel Standalone | 7.24.7 (cdnjs) | ✅ |
| Image lazy loading | 9 `<img>` tags — all 9 have `loading="lazy"` | ✅ |
| Proxy URL | `https://peakly-api.duckdns.org` (HTTPS, not raw IP) | ✅ |

### Yesterday's VENUES false alarm — closed

Prior bracket-walker counted 406 because it hit `[` chars inside object values. `eval()` is authoritative:

```bash
node -e "
const fs = require('fs');
const src = fs.readFileSync('app.jsx', 'utf8');
const m = src.match(/const VENUES\s*=\s*\[/);
const start = src.indexOf(m[0]) + m[0].length;
let depth = 1, i = start;
while (i < src.length && depth > 0) {
  if (src[i] === '[') depth++;
  else if (src[i] === ']') { depth--; }
  i++;
}
const venues = eval('([' + src.slice(start, i));
console.log(venues.length, 'venues — missing category:', venues.filter(v => !v.category).map(v => v.id));
"
# Returns: 404 venues — missing category: []
```

**Finding closed.** Do not re-flag this.

---

## 2. Flight Proxy Status — 🔴 RED (VPS undeployed Day 49)

### Undeployed commits (live VPS = Aug 11 binary)

| Date | Commit | What it does | Impact if undeployed |
|------|--------|-------------|----------------------|
| Jun 8 | `20f6673` | CORS registered before rate limiter; rate limit 60→600/min; `return_date` added to TP calendar query | Rate-limiting real users; one-way fares displayed as round-trip prices |
| Jun 8 | `fef0e53` | Round-trip filter in `/api/flights` specific-date branch | Weekend fares can be one-way / wrong trip length |
| Sep 9 | `3152c96` | Fall back to nearest ±1-day weekend RT when no exact-Friday cache hit | Off-peak beach routes return null → 270 beach venues show `~$X` estimate at Reddit launch |
| Sep 10 | `c760dfb` | Widen fallback to ±3 days / 2–7 nights | More live fares surface for seasonal routes |
| Aug 11 | (deployed) | CORS+rate-limiter fixes, `forecast_days:14`, disk cache | Base proxy in production |

The live VPS runs the Aug 11 binary. **Sep 9+10 fare-fallback commits are in `server/proxy.js` on `main` but not on the VPS.** Off-peak beach routes (September = off-peak Northern hemisphere beach) return no fares → demoted to `~$X` estimates → deal score signals suppressed across the 270 beach venues. Reddit launch on Oct 18 with beach as a primary category showing no live prices is a product failure.

### Fix — same SSH block as before, 5 minutes:

```bash
# From your local machine:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"

# Verify after restart:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: "apns": "unconfigured", "wx_cache_size": 0 (refills), uptime < 60s
```

**Deadline: Oct 4 (8 days from yesterday's PM report). 21 days to Oct 18 launch.**

### fetchTravelpayoutsPrice timeout — ✅ confirmed

`AbortController` + 4-second timeout at call sites (app.jsx:6380–6390). Fallback to `~$X` estimate on abort. Correct.

---

## 3. Weather & External APIs — ✅ GREEN

| API | Status |
|-----|--------|
| Open-Meteo (direct fallback) | `AbortController` + timeout present in `fetchWeather`/`fetchMarine` |
| VPS weather proxy cache | Disk persistence added (`_saveCacheToDisk` every 5 min) — Open #23 resolved |
| VPS marine proxy | `forecast_days: 10` in committed code (deployed Aug 11) |
| Rate limit exposure | VPS in-memory cache prevents multi-user upstream floods when deployed |

Open-Meteo free tier: ~66+ simultaneous uncached requests to the same lat/lon triggers throttling. Not a live concern at current traffic. VPS cache eliminates this risk once deployed.

---

## 4. Security Audit — ✅ GREEN

| Check | Finding | Risk |
|-------|---------|------|
| Travelpayouts token in client | Not present — `TP_MARKER = "710303"` is a public affiliate marker, not the API token | ✅ None |
| Supabase anon key in client | Present (app.jsx:26) — intentional, documented in CLAUDE.md, RLS-gated | ✅ Acceptable |
| Sentry DSN in index.html | Present — DSNs are designed to be public-facing | ✅ Acceptable |
| `.gitignore` | Covers `.env`, `.env.*`, `*.p8`, `*.pem`, `*.key`, `*.p12`, `*.mobileprovision` | ✅ |
| Recent commits | No secrets, tokens, or credentials in recent git log | ✅ |
| APNS keys | `.p8` extension gitignored; keys not in repo | ✅ |

No security issues. Clean.

---

## 5. Performance Analysis — ✅ GREEN

| Metric | Value |
|--------|-------|
| Production bundle | ~439 KB minified (esbuild via `deploy.yml`; Babel stripped) |
| Dev bundle (Babel in-browser) | 741 KB source + Babel 7.24.7 (~300 KB gzip) = ~3–5s parse on mobile |
| CDN latency | cdnjs.cloudflare.com — global CDN, <50ms typical |
| Image lazy loading | All 9 `<img>` tags have `loading="lazy"` |
| React | 18.3.1 — current stable |
| Babel Standalone | 7.24.7 — current, but stripped in production |

**Largest single bottleneck:** The production path (esbuild bundle via `deploy.yml`) is clean at 439 KB. The dev path (Babel in-browser) is irrelevant to real users. No performance regressions since Sep 14.

---

## 6. Infrastructure Cost Estimate

| Scale | VPS | CDN/Storage | Total/mo | Notes |
|-------|-----|-------------|----------|-------|
| Current (<100 MAU) | $6 (DO Basic 1GB) | $0 | **$6** | GitHub Pages free tier |
| 1K MAU | $6 | $0 | **$6** | Open-Meteo free tier holds, VPS cache absorbs spikes |
| 10K MAU | $12 (DO 2GB) | $0 | **$12** | VPS RAM pressure from wx cache (~4000 entries × route) |
| 100K MAU | $48 (DO 8GB) | $5–15 (CDN for assets) | **$53–63** | Need Redis or disk cache; pm2 cluster mode |

Current revenue model: $7.58/1K MAU. At 1K MAU: ~$7.58/mo revenue vs $6/mo infra = positive at launch. At 10K MAU: ~$75.80/mo revenue vs $12/mo infra = solid.

---

## 7. Stale Branches — 🟡 YELLOW

18 stale remote branches still alive (15 `claude/*` + `fix-appjsx-final` + `restore-appjsx` + `test-small`). **`origin/master` remains the active footgun** — `deploy.yml` deploys on push to both `main` AND `master`. A stale or accidental push to `master` would deploy whatever's there.

Current state of `origin/master`: last audited Sep 23 as "June 2026 state, safe to delete." It's not safe to leave it. A CI deploy from an outdated master would silently revert weeks of work.

**Fix (30 seconds):**
```bash
# Delete master remote (requires repo owner access — Jack only)
git push origin --delete master

# Then delete the 15 stale claude/* branches:
git branch -r | grep 'origin/claude/' | sed 's|origin/||' | xargs -I{} git push origin --delete {}
git push origin --delete fix-appjsx-final restore-appjsx test-small
```

**This is Jack's action only** — requires push access to the repo.

---

## Scale Bottleneck Analysis

**What breaks first at scale:** The VPS. It's a 1GB DigitalOcean droplet running Node.js with an in-memory weather cache (~4000 entries). A Reddit/HN front-page spike hitting 500 concurrent users in the first minute will saturate that 1GB RAM before Open-Meteo rate-limits kick in, because each new user's cold cache miss triggers parallel weather + marine fetches for all visible venues. The VPS cache deduplication prevents 500 users from firing 500×404 upstream calls, but it doesn't prevent the 1GB process from OOMing under a JavaScript heap explosion from uncapped concurrent venue-data assembly. **Prevention:** (1) Deploy the VPS now so the disk-persistence cache survives the `pm2 restart` before the launch push. (2) Add a `--max-old-space-size=768` flag to the pm2 start command. (3) Have the `pm2 restart` command ready to copy-paste in a second tab during the Reddit post. The rest of the stack (GitHub Pages + cdnjs CDN) is effectively infinite at these scales.

---

## Open Items Summary (unchanged from yesterday)

| # | Item | Priority | Deadline | Owner |
|---|------|----------|----------|-------|
| P0 | VPS redeploy (`server/proxy.js` → `/opt/peakly-proxy`) | P0 | **Oct 4** | Jack (SSH) |
| P1 | Delete `origin/master` + 18 stale branches | P1 | Before any branch activity | Jack (repo owner) |
| — | APNS `.p8` setup | Parked | Post-launch | Jack |
| — | Supabase delete-account SQL paste | Pre-App Store | App Store submission | Jack |
| — | Photo quality (~346 venues generic) | P2 | Post-launch | Jack |
