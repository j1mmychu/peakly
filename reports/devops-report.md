# DevOps Report — 2026-09-05 (YELLOW)

**Status: 🟡 YELLOW — No new code P0s. VPS Open #19/#21/#23 now Day 43 — same infra debt carrying daily. Venue count discrepancy found (PM v140 claims 405, eval says 407). 18 zombie branches (3 new since yesterday). Open-Meteo rate limit exposure unchanged.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (documented sandbox egress block). Last confirmed healthy: 2026-08-11 post-redeploy. Treating as healthy per prior verification.

---

## What Changed Since Yesterday

- **No app.jsx logic changes.** Last commit touching app.jsx: `9c2c198` (PM v140, Sept 4 — 10 new venues, cache `20260904a`). Venue count now **407** by eval (134 ski / 271 beach). PM v140 claimed "395→405" — that's wrong by 2, see §3.
- **3 new zombie branches** appeared in `git fetch` output today: `claude/fix-app-jsx-content`, `master` (origin now exposes it), and the existing `fix-appjsx-final`/`restore-appjsx`/`test-small` remain. **18 total** stale remote branches.
- **BASE_PRICES now has 183 unique origin airports** — significant improvement from July's "100 of 146 missing" baseline. Backfill effort by agents is working.
- **Open #19/#21/#23 Day 43** — no movement. VPS proxy.js fixes are committed and inert. Every day of delay is another day two-weekend scoring is off, alert deletion is broken, and the Open-Meteo ceiling is unprotected.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx lines | **14,148** |
| app.jsx bytes | **757,075** (~740 KB unminified; 439 KB minified at deploy) |
| Cache buster | `20260904a` — **current** (last app.jsx change was Sept 4; no Sept 5 changes yet, not stale) |
| Plausible analytics | ✅ Present and uncommented (`j1mmychu.github.io/peakly`) |
| React CDN | ✅ 18.3.1 from `cdnjs.cloudflare.com` |
| Babel CDN | ✅ 7.24.7 from `cdnjs.cloudflare.com` (latest stable 7.25.x exists; no security advisory) |
| Sentry CDN | ✅ Project-keyed loader from `js.sentry-cdn.com` |
| Production build | ✅ `deploy.yml` runs `node scripts/build-web.mjs` → `dist/app.min.js` on every push |

**Cache buster auto-bump confirmed working**: `scripts/auto-push.sh` bumps `PEAKLY_BUILD`/`CACHE_NAME` in lockstep across app.jsx/sw.js/index.html on every edit. The `20260904a` stamp is correct for the Sept 4 venue batch — no stale cache today.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ (no HTTP proxy URL in client) |
| Old IP reference (104.131.82.242) | ✅ Not present |
| Timeout | ✅ 4s AbortController, 2 retry attempts with 250ms backoff |
| Fallback | ✅ Returns `null` → client falls back to `BASE_PRICES` estimate with `~$X` label |
| Concurrency semaphore | ✅ 8 concurrent max (raised 3→8 on 2026-08-21) |

Proxy code is healthy. The **deployed proxy** (VPS) is a different story — see §Open Items.

---

## 3. Venue Count Discrepancy — P2

**PM v140 commit message claims "395→405" but `eval` of the VENUES array returns 407 (134 ski / 271 beach).**

This is a 2-venue overcount in the commit message. The eval count is authoritative. PM and Content reports need to sync their count tracking — probably a stale off-by-two from how the batch was pasted. Not a code bug (no duplicate IDs — the boot-time IIFE would have caught those), just a bookkeeping error.

Fix: Update `scripts/.venue-baseline` to 407, and make sure agents use the eval output from `scripts/status.sh` rather than their own mental arithmetic.

```bash
echo "407" > scripts/.venue-baseline
```

---

## 4. Open-Meteo Rate Limit — P0 (Carry-Over, Day 43)

**Math hasn't changed. This is still the ceiling that kills Peakly on the day Reddit/HN lands.**

- 407 venues × ~1.65 avg API calls (weather always + marine for beach ~67%) = **~670 cold calls per user session**
- Free tier: **10,000 calls/day**
- Break-even DAU: **10,000 ÷ 670 = ~14.9 concurrent cold sessions**
- With 2hr localStorage cache, returning users are warm — but first-visit or cache-cleared users are cold
- A Reddit post with 500 first-time visitors in an hour = **335,000 upstream calls**. Peakly gets rate-limited inside 90 seconds.

**The VPS proxy with in-memory 2hr shared cache (Open #19) is the fix.** Until it's deployed, the client falls back to direct Open-Meteo on every cold load. The 4,000-entry LRU on the proxy means N simultaneous users hitting the same (lat, lon) = **1 upstream call**. Deployed, this reduces peak calls from 670/user to ~12/hour (cold) + 0 (warm). Not deployed = fully exposed.

**Jack: this is blocked on you SSHing to `198.199.80.21` and running the deploy. 30 minutes of work, 43 days overdue.**

```bash
# SSH to VPS and deploy (from a machine with SSH access):
ssh root@198.199.80.21
cd /opt/peakly-proxy
# Copy updated proxy.js from git (VPS is NOT a git clone — manual copy required):
# scp proxy.js root@198.199.80.21:/opt/peakly-proxy/server/proxy.js
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Verify: wx_cache_size starts at 0 and climbs, apns shows configured/unconfigured as expected
```

---

## 5. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts API token in client | ✅ Not present. Marker only (`TP_MARKER=710303` — affiliate ID, public-safe) |
| Supabase anon key in client | ✅ By design — documented "public-safe, RLS-gated". Row-Level Security enforces auth.uid() isolation |
| Sentry DSN in client | ✅ Normal — client DSN is always public; rate-limited on Sentry's end |
| `.env` files in repo | ✅ None present |
| `.gitignore` coverage | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision` |
| Hardcoded secrets scan | ✅ No tokens, passwords, or API keys found in app.jsx |
| Recent commit secret scan | ✅ Last 5 commits are report files and venue data — no credentials introduced |

**No new security findings.** APNS double-bug (Open #21) is still the outstanding security-adjacent issue — guessable alert IDs (fixed via `crypto.randomUUID()` in an uncommitted local change per July 25 CLAUDE.md note) and DER-vs-P1363 JWT encoding that would silently deliver zero push notifications. Neither blocks launch since APNS is gated off.

---

## 6. Performance Analysis

| Check | Result |
|-------|--------|
| Production bundle | 439 KB minified (esbuild, Babel stripped) — reasonable for a 407-venue app |
| Dev bundle | 757 KB + Babel parse overhead (~3-5s on mobile) |
| Images lazy loading | ✅ All `<img>` tags in ListingCard, FeaturedCard, CompactCard, and detail sheet have `loading="lazy"` |
| Biggest bottleneck | **Open-Meteo cold-start (~670 parallel fetch calls)** |
| First-paint tier | ✅ 12 venues fetched first, renders immediately; rest streams in 100/batch at 500ms throttle |
| CDN SRI hashes | ❌ No SRI on any CDN script (Open #10, medium risk) |

**Single largest bottleneck**: 407 venues × cold Open-Meteo fetch = first-load waterfall. The VPS proxy (Open #19) collapses this to 1 upstream call per unique (lat, lon) per 2 hours. Until deployed, every cold user loads the raw upstream.

**No new performance regressions introduced.** The `20260904a` build is the same code as yesterday's audit.

---

## 7. Cost Estimate

| Scale | Est. Monthly Cost |
|-------|------------------|
| Current (<100 MAU) | $6/mo DigitalOcean + $0 GitHub Pages + $0 Open-Meteo = **$6/mo** |
| 1K MAU | $6/mo (same droplet handles this easily) |
| 10K MAU | $12-18/mo (may need 2GB RAM droplet; Open-Meteo free tier exceeded — need $25/mo commercial plan or VPS cache live) |
| 100K MAU | $80-120/mo (load balancer + 2× droplets + CDN; Open-Meteo commercial ~$200/mo OR VPS proxy eliminates it) |

**Cost optimization lever**: The VPS proxy cache (Open #19) doesn't just fix rate limits — it eliminates Open-Meteo commercial tier at 10K+ MAU. That's the difference between ~$225/mo and ~$25/mo at 10K MAU. The proxy is already written and committed. It's not deployed.

---

## 8. Zombie Branches — P2

**18 stale remote branches** (was 17 yesterday, 3 new from today's fetch):

```
claude/analyze-test-coverage-WVIsT
claude/code-review-cleanup-HjoCS
claude/condense-alert-page-jzdLo
claude/enhance-loading-screen-rZ1dc
claude/fix-app-jsx-content          ← NEW today
claude/implement-todo-lNL7W
claude/improve-peakly-ui-UHCHG
claude/improve-scoring-system-XYGY6
claude/product-reliability-assessment-w0poL
claude/redesign-front-page-EndKs
claude/review-peakly-ux-UQ0Qu
claude/simplify-alerts-page-2ejGB
claude/simplify-profile-page-Bi2Tc
claude/standardize-venue-data-CufiQ
claude/streamline-onboarding-account-97XRR
fix-appjsx-final
restore-appjsx
test-small
```

These are unmerged cloud agent worktrees. They accumulate ~1/week. None pose a security or operational risk but they clutter `git branch -r` and confuse agent sessions that fetch before auditing.

**Delete them all** (Jack must authorize, agent cannot force-push/delete remotes):
```bash
# Delete all stale claude/* branches + utility branches
git push origin --delete \
  claude/analyze-test-coverage-WVIsT \
  claude/code-review-cleanup-HjoCS \
  claude/condense-alert-page-jzdLo \
  claude/enhance-loading-screen-rZ1dc \
  claude/fix-app-jsx-content \
  claude/implement-todo-lNL7W \
  claude/improve-peakly-ui-UHCHG \
  claude/improve-scoring-system-XYGY6 \
  claude/product-reliability-assessment-w0poL \
  claude/redesign-front-page-EndKs \
  claude/review-peakly-ux-UQ0Qu \
  claude/simplify-alerts-page-2ejGB \
  claude/simplify-profile-page-Bi2Tc \
  claude/standardize-venue-data-CufiQ \
  claude/streamline-onboarding-account-97XRR \
  fix-appjsx-final \
  restore-appjsx \
  test-small
```

---

## Open Items Summary

| # | Item | Priority | Days Open | Blocked On |
|---|------|----------|-----------|-----------|
| 19 | VPS redeploy (forecast_days:14 + CORS + rate limiter) | **P1 pre-Reddit gate** | **43** | Jack SSH |
| 21 | APNS HTTP/2 + JWT P1363 fix | P1 | **43** | Jack SSH + .p8 key |
| 22 | BASE_PRICES gap | P2 | 43 | Agents (improving: 183 airports now covered) |
| 23 | VPS weather disk cache (in-memory only, wipes on restart) | **P1 pre-Reddit gate** | **43** | Jack SSH (bundle with #19) |

---

## What Breaks First at Scale

**Open-Meteo hits the 10,000/day free-tier ceiling at ~15 simultaneous first-visit users.** A HN "Show HN" post historically generates 200-500 concurrent visitors in the first hour. At 407 venues × ~1.65 calls per user = 670 cold calls, you cross 10K in 14.9 users. The client has no rate-limit handling — it fires all 407 in parallel batches, and Open-Meteo's 429 response silently returns null data, which renders as "conditions unavailable." Every user who hits the site during the spike sees skeleton cards and a "pull to refresh" banner. Prevention is one SSH session: deploy `server/proxy.js` (Open #19 + #23), which reduces this to a shared in-memory 2hr LRU with coord-level dedup. The whole team has been talking about this since May 4. The code is done. It's sitting undeployed at Day 43.
