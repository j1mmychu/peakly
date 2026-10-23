# DevOps Report — 2026-10-23 (RED → CODE FREEZE LIFTS TODAY)

**Status: 🔴 RED — VPS Day 75. `origin/master` footgun still live. Code freeze lifts Oct 23 (today) — first edits resume, stamp bump required.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health checks from sandbox always time out — not a VPS outage signal.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 758,944 bytes** — code freeze Day 39, unchanged since 2026-09-14 ✅ |
| VENUES (CLAUDE.md authoritative) | **404** (134 skiing / 270 beach) ✅ |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — freeze Day 39; must bump on first post-freeze edit ⚠️ |
| Plausible analytics (source index.html) | ✅ present, uncommented — line 32 |
| Plausible analytics (dist/index.html committed) | ⚠️ Stale committed file — comment only, no script tag. Not a prod bug: CI does `fs.rmSync(DIST,...)` + full rebuild on every push, so live site is correct. Committed dist/ is a misleading artifact. |
| React 18.3.1 (cdnjs) | ✅ pinned |
| Babel 7.24.7 (cdnjs) | ✅ dev-only, stripped by build-web.mjs in CI |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS, no raw IP |
| Travelpayouts token in client | ✅ NOT present. `TP_MARKER="710303"` is public affiliate marker only |
| Supabase anon key | ✅ Intentional, public-safe, RLS-gated (line 26) |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` |
| Image `loading="lazy"` | ✅ 9 img sites across card components |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController (line 5518) |
| Sentry DSN | ✅ configured — `app.jsx:8`, `index.html:77` |
| `lateSeason:true` venues | ✅ 15 — matches CLAUDE.md; Val Thorens confirmed included (line ~1733) |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| All API calls HTTPS | ✅ Open-Meteo, marine, proxy all HTTPS |
| proxy.js (committed) | ✅ `forecast_days=14`, disk cache, iOS CORS, `DELETE` Allow-Methods, `http2` APNs, `ieee-p1363` JWT. **NOT on VPS.** |

---

## 2. Critical Issues (P0) — Fix Today

### P0-A: VPS Redeploy — Day 75. Whistler Window in 18 Days 🚨

The fixed `server/proxy.js` has been sitting undeployed for 75 days. This is not a "VPS is down" problem — it's a "VPS is running 2026-08-11 code with four known bugs." The live VPS continues to serve:

| # | Broken feature | User impact |
|---|---------------|-------------|
| 1 | `forecast_days: 7` not `14` | Two-weekend scoring disabled. High-altitude venues score `confidence:"low"` — filtered off front page. Whistler, Tignes, Val Thorens may be invisible during their early-season windows. |
| 2 | `capacitor://localhost` absent from CORS | Every iOS native API call blocked. App Store build = broken on every iPhone. |
| 3 | `DELETE` absent from `Access-Control-Allow-Methods` | Alert deletion silently fails. `.catch(()=>{})` hides it. Day-1 retention hit. |
| 4 | `_wxCache` in-memory only | Cold restart after a traffic spike = Open-Meteo rate-limited = "conditions unavailable" for all new users. |

**Whistler early-season is ~Nov 10 — 18 days.** That's the next high-value seasonal window. The VPS must deploy before then or the product looks broken on its marquee venue at peak interest time.

**The fix is 3 commands:**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Post-deploy: `/health` must show `"forecast_days": 14` and `"disk_cache": true`. Budget 5 minutes.

---

### P0-B: `origin/master` Footgun — Day 16 🚨

`origin/master` is a live deployable branch pointing at a May 2026 commit (`b6dc033 — auto: terms.html`). `deploy.yml` fires on **both** `main` and `master`:

```yaml
on:
  push:
    branches:
      - main
      - master
```

One accidental `git push origin master` rolls the live site back 5 months. The last `master` commit predates the 404-venue catalog, the 4 P0 bug fixes from July, the onboarding rewrite, and the price-accuracy fix. This is a silent rollback bomb.

**Fix — 30 seconds:**
```bash
# Option A: delete master from origin (if nothing depends on it)
git push origin --delete master

# Option B: keep the branch but protect it — edit deploy.yml:
# Remove "- master" from the on.push.branches list, commit, push
```

Option A is cleaner. `master` has no open PRs and is 150+ commits behind `main`.

---

## 3. High Issues (P1) — Fix This Week

### P1-A: Code Freeze Lifts Today — Stamp Bump Protocol

PM v188 says code freeze lifts Oct 23 (today). The first `app.jsx` edit in 39 days must follow this protocol or the service worker will serve stale code to every existing user:

1. **Bump `PEAKLY_BUILD`** in app.jsx: `"20260914a"` → `"20261023a"`
2. **Bump `CACHE_NAME`** in sw.js in lockstep: `peakly-20260914a` → `peakly-20261023a`
3. `auto-push.sh` enforces lockstep — if they drift, the invariant guard blocks the commit.

`auto-push.sh` handles this automatically via its cache-buster logic (resets to `${TODAY}a` when the stamp is from a prior day). This is noted as a reminder since 39 days of freeze makes it easy to forget.

### P1-B: Stale Remote Branches — 20 Orphaned `claude/*` Branches

20 `claude/*` branches + 4 others (`fix-appjsx-final`, `restore-appjsx`, `test-small`, `master`) are stale on origin. Each is a CI trigger surface and repo noise.

```bash
# Preview what would be deleted
git branch -r | grep "claude/" | sed 's|origin/||'

# Delete all claude/* remote branches
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

# master handled separately per P0-B above
```

Estimated time: 2 minutes.

---

## 4. Medium Issues (P2) — Fix This Sprint

### P2-A: Stale Committed `dist/index.html`

`dist/index.html` committed in the repo is missing the Plausible analytics script tag (comment present, `<script>` absent). **This does NOT affect production** — `deploy.yml` runs `build-web.mjs` which does `fs.rmSync(DIST, ...)` first and rebuilds `dist/index.html` from source `index.html` (which has the correct Plausible tag). The committed `dist/index.html` is never served.

However, it's a misleading artifact that causes every DevOps audit to flag it. Fix: either rebuild and commit dist/ after each manual edit, or add `dist/index.html` to `.gitignore` (clean approach, since CI always regenerates it).

```bash
# One-time cleanup: add to .gitignore and untrack
echo "dist/index.html" >> .gitignore
git rm --cached dist/index.html
git commit -m "chore: untrack auto-generated dist/index.html"
```

Estimated time: 5 minutes.

### P2-B: BASE_PRICES Coverage ~43%

100 of 146 venue airports (~68%) are absent from `BASE_PRICES`, including CUN/BOB/AUA/STT/SXM. The deal score is a headline feature — venues without a BASE_PRICES entry get no deal signal. Backfill the top ~15 airports by venue count. This has been in the backlog since 2026-07-25.

---

## 5. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ CLEAN — server-side only |
| Supabase anon key | ✅ Intentional, public-safe, RLS-gated — not a leak |
| `.env` files | ✅ gitignored; no `.env` files in working tree |
| `*.p8` / `*.pem` / `*.key` | ✅ gitignored |
| Recent commits (last 8) | ✅ Daily agent reports only — no code changes, no secret risk |
| Sentry DSN | ✅ Configured and loaded (public DSN — intentional, standard practice) |
| `origin/master` | 🔴 **Security-adjacent** — stale branch deployable by accident; see P0-B |

---

## 6. Performance Analysis

| Metric | Value |
|--------|-------|
| app.jsx raw size | 758,944 bytes (741 KB) |
| Production bundle (dist/app.min.js) | Not built locally; CI esbuild minifies to ~439 KB per CLAUDE.md |
| CDN libs loaded (production) | React 18.3.1 (~130 KB gz), ReactDOM (~30 KB gz), Sentry (~60 KB gz), Supabase lazy (~80 KB gz) |
| Total cold-load JS (est.) | ~750 KB transferred, ~2.5 MB parsed — acceptable for mobile |
| `loading="lazy"` img count | 9 sites — all card components covered ✅ |
| Babel load on dev | ✅ dev only — stripped in CI |

**Biggest performance bottleneck:** Open-Meteo batching fetches 404 venues at 50/2s = ~16s to fill all weather. This is by design (rate-limit compliance). The VPS proxy cache (not yet deployed) is the fix — once live, repeat visitors get cached results in <100ms.

---

## 7. Cost Estimate

| Scale | DigitalOcean | Open-Meteo | Supabase | Total/mo |
|-------|-------------|------------|----------|----------|
| Current (LAUNCH DAY +5) | $6 | $0 (free) | $0 (free) | **$6** |
| 1K MAU | $6 | $0 | $0 | **$6** |
| 10K MAU | $12 (upgrade to 2GB) | $0 | $25 (Pro) | **$37** |
| 100K MAU | $48 (4 vCPU/8GB) | $20 (Commercial) | $25 | **$93** |

Infrastructure cost at 100K MAU is $93/mo against $758 RPM revenue — 87% margin. 

**Primary cost optimization available:** The committed proxy.js has disk-based weather cache. Once deployed, it halves upstream Open-Meteo calls at scale, protecting the free tier longer and deferring the $20/mo commercial tier.

---

## 8. What Breaks First at Scale

**Open-Meteo rate limits.** The live VPS runs the Aug-11 proxy with in-memory-only `_wxCache`. A Reddit/HN post drives N concurrent users all requesting the same venue weather — each gets a direct Open-Meteo call since the cache is cold (or was wiped by a restart). Open-Meteo's free tier caps at ~10K calls/day (~7 calls/minute). At 100 concurrent users hitting 10 uncached venues each, that's 1000 calls in seconds — throttled to 429 within minutes, "conditions unavailable" for everyone arriving at peak interest time.

**Prevention:** Deploy `server/proxy.js` (P0-A above). The disk cache + in-flight dedupe means N simultaneous users hitting the same coord = 1 upstream call. This is already written and tested — it's blocked only by the manual SSH deploy step.

---

## Summary

| Priority | Issue | Time to Fix | Owner |
|----------|-------|-------------|-------|
| 🔴 P0-A | VPS Redeploy — Day 75, Whistler 18 days | 5 min | Jack (SSH) |
| 🔴 P0-B | `origin/master` footgun | 30 sec | Jack |
| 🟡 P1-A | Code freeze lifts today — stamp bump protocol | Auto via auto-push.sh | |
| 🟡 P1-B | 20 stale remote branches | 2 min | Jack |
| 🟢 P2-A | Stale committed dist/index.html | 5 min | |
| 🟢 P2-B | BASE_PRICES coverage ~43% | 2 hrs | |
