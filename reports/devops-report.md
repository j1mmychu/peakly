# DevOps Report — 2026-08-18 (YELLOW)

**Status: 🟡 YELLOW**

Today is 2026-08-18. Reddit launch target: **Aug 29 — 11 days out.** Running from a remote sandbox; VPS (`peakly-api.duckdns.org`) unreachable at the network layer (sandbox egress proxy returns 403 — standard sandbox constraint, not a VPS failure). Per CLAUDE.md confirmed 2026-08-11 by Jack: VPS fully deployed, disk cache live, `forecast_days:14`, `apns:configured`. Treating VPS healthy.

**Actions executed this run:**
- **Cache stamp bumped: `20260816b` → `20260818a`** (app.jsx, sw.js, index.html in lockstep). Three app.jsx commits landed today (photo updates × 2 + the exact-fares grid fix) through the cloud pipeline, which bypasses the local `auto-push.sh` hook. Stamp was 2 days stale. Returning visitors with the SW-cached `peakly-20260816b` would have gotten old code for an indeterminate period without this bump.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,729 lines / 695 KB** (+11 lines vs yesterday — photo URL updates) |
| Cache stamp | **`20260818a`** ✅ — bumped this run (was stale at `20260816b` for 2 days of app.jsx changes) |
| Plausible analytics | ✅ present, uncommented (`defer data-domain="j1mmychu.github.io/peakly"`) |
| Sentry DSN | ✅ LIVE — `9416b032a46681d74645b056fcb08eb7` in both `index.html:77` and `app.jsx:7–8` |
| Venue count | **394 ✅** (131 ski / 263 beach) — verified via category-grep; `.venue-baseline` = 394 matches |
| Bracket-walker count | 396 (overcounts by 2 — noise from nested `{` in some venue entries; category grep is authoritative) |
| `.venue-baseline` | 394 ✅ — moratorium holds |

**Biggest fix today (not this report — landed at 02:41 UTC):** `6e45fee` fixed `applyFilters()` to require ≥40% live-fare coverage before switching to exact-fares-only mode. The old `> 0` threshold was hiding ~95% of venues (all but the ~20 with a live Travelpayouts fare) once any real price resolved. Verified live. This was a P0 production bug affecting every user on the front page.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` ✅ HTTPS |
| Raw IP in client | Not found ✅ |
| Timeout + fallback | ✅ `AbortController` 5s in `fetchTravelpayoutsPrice`, 4s in weather proxy `_tryProxyWx` |
| Concurrency cap | ✅ Semaphore at max 3 concurrent flight requests (line 6260) |
| Exact-fares threshold | ✅ Fixed to ≥40% live coverage (was `> 0`, hiding 95% of venues) |
| VPS health (last confirmed) | ✅ 2026-08-11 by Jack — disk cache, CORS, alert DELETE, `apns:configured` |

No P0. Do not re-flag Open #19/#23 — both closed.

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo client | `api.open-meteo.com/v1` + `marine-api.open-meteo.com/v1` ✅ |
| VPS proxy cache | ✅ Disk-persistent per 2026-08-11 redeploy |
| `forecast_days` | `=14` via proxy ✅ |
| Client-side wx cache | 2hr localStorage TTL per-coord ✅ |
| Batch throttle | 50 venues / 2s ✅ |
| Free-tier ceiling risk | LOW at current MAU; VPS disk cache is the guard for the Reddit spike |

No issues.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token | ✅ Only `TP_MARKER = "710303"` (public affiliate marker) in client — server-side token never appears |
| Supabase anon key | `eyJhbGci...` in `app.jsx:26` — **EXPECTED AND CORRECT**. RLS gates all writes; anon key is designed to be public |
| APNS keys in client | ✅ None found |
| Other credentials | ✅ No `.p8`, no service-role keys, no Stripe in any tracked file |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision` |
| Recent commits (today) | ✅ Clean — photo URL updates + applyFilters fix, no credential-shaped strings |
| Sentry DSN exposure | Standard for client-side Sentry — not a secret, by design |

**No security issues.**

---

## 5. Performance Analysis

| Check | Result |
|-------|--------|
| Production JS bundle | `dist/app.min.js` = **449 KB** (Aug 14 local copy; CI rebuilds on every push — next push will reflect today's changes) |
| Babel in production | ❌ Dev path loads `@babel/standalone@7.29.7` (~880KB); CI esbuild strips it for `dist/` |
| React version | `18.3.1` unpkg ✅ |
| Supabase UMD | `@supabase/supabase-js@2.106.2` lazy-loaded (only on auth) ✅ |
| Image lazy loading | 10/9 `<img>` tags with `loading="lazy"` — most venue images are CSS `background-image`, no `<img>` needed |
| Biggest perf bottleneck | **Local dev only**: Babel parse wall (3–8s first paint). Production path uses pre-compiled `app.min.js` and is fine. |

**Note:** The local `dist/app.min.js` (449KB, Aug 14) is stale because the cloud agents push directly to `main` and CI rebuilds it automatically. The live GitHub Pages site will have a fresh build after this push. Local `dist/` copy is not authoritative.

---

## 6. Cost Estimate

| Scale | Infra | Notes |
|-------|-------|-------|
| Now (<100 MAU) | **~$6/mo** | DO 1GB droplet only |
| 1K MAU | **~$6/mo** | Open-Meteo free tier still holds; VPS handles wx cache |
| 10K MAU | **~$12–18/mo** | May need DO 2GB ($12) + possibly Cloudflare (PM v122 flagged as P1 pre-launch) |
| 100K MAU | **~$60–120/mo** | CDN required for static assets; DO can likely still handle proxy at 2–4GB; Open-Meteo pro tier needed (~$50/mo if self-serving doesn't work) |

**Optimization opportunities:**
1. **Cloudflare (free tier)** — PM v122 flagged as P1. Absorbs static asset traffic off GitHub Pages, DDoS protection, caches `/api/flights` responses at the edge. Zero cost at current scale. Install before Reddit post.
2. **Open-Meteo free tier ceiling** — 66+ concurrent DAU hitting the same uncached venue set. VPS disk cache is the guard, but Cloudflare edge caching of `/api/weather` responses would add a second layer.
3. **GitHub Pages bandwidth** — fine until ~50K pageviews/mo; Cloudflare CDN extends this.

---

## 7. Stale Branch Cleanup

**15 `claude/` branches** + 3 other stale branches (`fix-appjsx-final`, `restore-appjsx`, `test-small`) on origin. All are abandoned cloud-agent worktrees — none are open PRs, all are unmerged experiments. At 18 total stale remote refs, this is visual clutter and a minor CI noise risk.

**Fix — run this once from a networked session with push access:**
```bash
# Delete all abandoned claude/ branches
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

Estimated time: 2 minutes. No risk — these are all unmerged dead worktrees.

---

## P0 Issues (Fix today — blocks launch)

**None new.** The exact-fares grid P0 (`6e45fee`) was already fixed by the cloud agent at 02:41 UTC today. Cache stamp stale was fixed by this report run.

---

## P1 Issues (Fix this week — pre-launch gates)

### P1-A: Cache stamp auto-bump broken for cloud agent commits (structural)
**Impact:** Every cloud agent commit to app.jsx bypasses the local `auto-push.sh` PostToolUse hook. This run found the stamp was 2 days stale after 3 app.jsx commits through the cloud pipeline. Fixed manually this run, but this will recur on every cloud session.

**Permanent fix — add a pre-commit hook that auto-bumps regardless of who commits:**
```bash
# Create .git/hooks/pre-commit (or add to existing)
cat > /home/user/peakly/.git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Bump cache stamp if app.jsx is in the staged diff
if git diff --cached --name-only | grep -q "^app\.jsx$"; then
  TODAY=$(date +%Y%m%d)
  CURRENT=$(grep 'const PEAKLY_BUILD' app.jsx | grep -oP '"[^"]+"' | tr -d '"')
  if [[ "$CURRENT" != ${TODAY}* ]]; then
    NEW="${TODAY}a"
  else
    SUFFIX=${CURRENT#${TODAY}}
    NEXT=$(echo $SUFFIX | tr 'a-y' 'b-z')
    [ -z "$NEXT" ] && NEXT="aa"
    NEW="${TODAY}${NEXT}"
  fi
  perl -pi -e "s/const PEAKLY_BUILD = \"[^\"]+\"/const PEAKLY_BUILD = \"${NEW}\"/" app.jsx
  perl -pi -e "s/const CACHE_NAME = \"peakly-[^\"]+\"/const CACHE_NAME = \"peakly-${NEW}\"/" sw.js
  perl -pi -e "s/app\.jsx\?v=[^\s\"]+/app.jsx?v=${NEW}/g" index.html
  git add app.jsx sw.js index.html
fi
EOF
chmod +x /home/user/peakly/.git/hooks/pre-commit
```

**Estimated time:** 5 minutes. But note: `.git/hooks/` is not tracked by git, so this only helps local sessions, not GitHub Actions CI. For CI the right fix is to add the stamp-bump as a step in `deploy.yml`. See P2-A.

### P1-B: Cloudflare not yet deployed (PM v122 Priority 1)
**Impact:** No CDN protection before Reddit launch. GitHub Pages has no DDoS mitigation. A front-page Reddit post could generate 10K+ concurrent requests directly to Pages/VPS.

**Fix:**
1. Go to cloudflare.com → Add site → enter `j1mmychu.github.io` or the custom domain if registered
2. Update nameservers (or if using the GitHub Pages subdomain, configure as a proxy via Cloudflare's "flexible SSL" origin rule pointing at `j1mmychu.github.io`)
3. Add a Page Rule to cache static assets (`.js`, `.css`, `.html`) with 4hr TTL
4. Add a Rate Limiting rule: >100 req/10s per IP → challenge

**If using `peakly.app` domain (not yet registered per CLAUDE.md):** register it first, then point at Cloudflare. **Estimated time:** 30–60 minutes.

---

## P2 Issues (Fix this sprint)

### P2-A: CI doesn't auto-bump cache stamp on build
The `build-web.mjs` reads `PEAKLY_BUILD` from app.jsx and embeds it in `dist/index.html`. But it doesn't bump the stamp — it just copies whatever's in app.jsx. Cloud agent commits never bump the stamp. The permanent fix is a one-liner in `deploy.yml`:

```yaml
# Add BEFORE the "Build web bundle" step in deploy.yml:
- name: Bump cache stamp for today
  run: |
    TODAY=$(date +%Y%m%d)
    CURRENT=$(grep 'const PEAKLY_BUILD' app.jsx | grep -oP '"[^"]+"' | tr -d '"')
    if [[ "$CURRENT" != ${TODAY}* ]]; then
      NEW="${TODAY}a"
      sed -i "s/const PEAKLY_BUILD = \"[^\"]*\"/const PEAKLY_BUILD = \"${NEW}\"/" app.jsx
      sed -i "s/const CACHE_NAME = \"peakly-[^\"]*\"/const CACHE_NAME = \"peakly-${NEW}\"/" sw.js
      sed -i "s/app\.jsx?v=[^ ]*/app.jsx?v=${NEW}/g" index.html
    fi
```

**Estimated time:** 10 minutes. Low risk.

### P2-B: 15 stale `claude/` branches cluttering origin
See cleanup command in Section 7. **Estimated time:** 2 minutes.

### P2-C: BASE_PRICES covers ~86% of venue airports
Content report (2026-08-17) confirmed 86% coverage. Remaining ~14% of venue airports show `~$X` estimates with no seasonal adjustment. Not a blocker but degrades the deal-score accuracy for 45+ venues. Backfill the remaining top-traffic airports (ZTH, GGT, CFU, BDA, AYT) added by Content on 2026-08-17 — these 5 new airports are likely not in BASE_PRICES yet.

---

## What Breaks First at Scale

**The Open-Meteo free tier + VPS restart window.** When the Reddit post lands, hundreds of concurrent users will hit the explore page simultaneously. The VPS disk cache absorbs repeat (lat, lon) lookups, but cold-start after a `pm2 restart` (or VPS hiccup) means the first batch of uncached requests will hit Open-Meteo directly. Open-Meteo's free tier throttles at ~1 req/sec sustained; a 500-user spike means every distinct venue coordinate makes a direct upstream call simultaneously, and the rate limiter will start dropping responses. Users see "conditions unavailable" banners. The venue grid stays populated (BASE_PRICES estimates render immediately), but scores go to 50 for everyone. **Prevention:** (1) pre-warm the VPS cache by hitting `/api/weather` for each of the top-50 venues from a cron job 30 minutes before the Reddit post, (2) add Cloudflare edge caching for `/api/weather` responses at 2hr TTL, (3) do NOT restart the VPS within 24 hours of the Reddit launch. The $20/mo Open-Meteo API key (10 req/sec) is the backstop if all else fails.

---

## Photo Sprint Summary (as of end of 2026-08-18)

Three photo commits landed today: 22 + 34 + 56 = **112 venue photos updated**. Total real-photo coverage is climbing fast toward the Aug 29 launch goal. Content report (2026-08-17) showed 135/394 real photos as of yesterday; today's 112 updates bring estimated real coverage to ~247/394 (63%). Still ~150 venues left on the generic stock pile. The Wikimedia Commons pipeline is working; keep it running through the week.

---

*Report generated by DevOps agent — 2026-08-18*
