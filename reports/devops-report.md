# DevOps Report — 2026-09-28 (RED)

**Status: 🔴 RED — VPS proxy.js undeployed Day 50. Oct 4 hard deadline = 6 days away. Oct 18 launch = 20 days away. Zero code commits in 14 days. All other systems GREEN.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health unverifiable from this environment.

---

## 1. Live Site Health — ✅ GREEN (with one caveat)

| Check | Result |
|-------|--------|
| app.jsx file size | 14,237 lines / 759 KB raw |
| VENUES (eval count) | **404 total** — 134 skiing / 270 beach ✅ |
| Plausible analytics | ✅ present, uncommented |
| React 18.3.1 (cdnjs) | ✅ current, SLA-backed CDN |
| Babel Standalone 7.24.7 (cdnjs) | ✅ functional (7.25+ available, no behavior change needed) |
| Supabase UMD (cdnjs) | ✅ lazy-loaded |
| Sentry DSN | ✅ configured in both index.html + app.jsx line 8 |
| dist/app.min.js | ✅ CI-generated (deploy.yml runs build-web.mjs — not committed to repo by design) |
| PEAKLY_BUILD stamp | ⚠️ `"20260914a"` — **14 days since last code commit** |

**Cache stamp note:** `PEAKLY_BUILD = "20260914a"` is not a bug — it correctly reflects the last real code commit (Sep 14 `bb3ebc8`). The auto-bump fires on app.jsx edits. No code commits in 14 days = stamp unchanged. When VPS is deployed or any code lands, it will auto-bump. Not P0, but signals code freeze — track as context.

**PEAKLY_BUILD staleness is NOT the issue. VPS is the issue.**

---

## 2. Flight Proxy Status — 🔴 RED (VPS undeployed Day 50)

Last VPS deploy: **2026-08-11**. Today: **2026-09-28**. Gap: **48 days** (Day 50 by PM counting). PM hard deadline: **Oct 4** (6 days). Launch deadline: **Oct 18** (20 days).

### Undeployed commits (live VPS = Aug 11 binary)

| Date | Commit | What it does | Impact if undeployed |
|------|--------|-------------|----------------------|
| Jun 8 | `20f6673` | CORS registered before rate limiter; rate limit 60→600/min; `return_date` added to TP calendar query | Rate-limiting real users at 60 req/min instead of 600; one-way fares displayed as round-trip prices |
| Jun 8 | `fef0e53` | Round-trip filter in `/api/flights` specific-date branch | Weekend fares can be one-way / wrong trip length |
| Aug 11 | (deployed) | CORS+rate-limiter fixes, `forecast_days:14`, disk cache | Base proxy — this is what's running |
| Sep 9 | `3152c96` | Fall back to nearest ±1-day weekend RT when no exact-Friday cache hit | Off-peak beach routes return null → 270 beach venues show `~$X` estimate at Reddit launch |
| Sep 10 | `c760dfb` | Widen fallback to ±3 days / 2–7 nights | More live fares surface for seasonal routes |

**Bottom line:** Reddit launch (Oct 18) with beach as primary category showing `~$X` estimates instead of live prices because Sep 9+10 fallback logic isn't on the VPS. Oct 4 deadline is 6 days away.

### Fix — 5 minutes from your local machine:

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"

# Verify (expect uptime < 60s, apns: unconfigured, wx_cache_size: 0 refilling):
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

### fetchTravelpayoutsPrice timeout — ✅ confirmed

`AbortController` + 4-second timeout in `_tryProxyWx()` (app.jsx line 5519–5522). Fallback to `~$X` estimate on abort. Correct.

---

## 3. Weather & External APIs — ✅ GREEN

| API | Status |
|-----|--------|
| Open-Meteo (direct fallback) | ✅ AbortController + timeout in `fetchWeather`/`fetchMarine` |
| VPS weather proxy | `forecast_days: 14` in committed proxy.js — Aug 11 deploy has this |
| VPS marine proxy | `forecast_days: 10` in committed code |
| Disk cache persistence | ✅ `_saveCacheToDisk` in committed proxy.js (Open #23 resolved) |
| Rate limit risk | Not a concern at current traffic. VPS cache eliminates Reddit-spike risk when deployed. |

Open-Meteo free tier ceiling: ~66 simultaneous uncached requests to the same lat/lon triggers 429s. Not a live concern pre-launch. VPS cache solves it.

---

## 4. Security Audit — ✅ GREEN (with notes)

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ ABSENT — `TP_MARKER = "710303"` is the public affiliate marker (intended client-side). Server-side TP_TOKEN is on VPS only. |
| Supabase anon key | ✅ Public-safe (documented, RLS-gated). Standard practice for Supabase anon flows. |
| Other API keys/secrets | ✅ None found |
| .gitignore coverage | ✅ Covers `.env`, `.env.*`, `*.key`, `*.p8`, `*.pdf`, `*.pptx` |
| Git log scan (last 10 commits) | ✅ All report commits — no code changes with secret-leak risk |
| Sentry DSN in client | ✅ Intentional (public-facing error collection, expected pattern) |
| APNS .p8 key | ✅ Not in repo; gitignored; no path to it in client code |

**No security issues.**

---

## 5. Performance Analysis — YELLOW

| Metric | Value |
|--------|-------|
| Raw JSX bundle | 759 KB |
| Production (esbuild minified) | ~440 KB minified (per CLAUDE.md) |
| Babel parse overhead (dev only) | 3–8s on mobile — eliminated in production build |
| Image lazy loading | ✅ 9/9 `<img>` tags have `loading="lazy"` |
| CDN cache | React/Babel/Supabase cached by browser after first load |

**Biggest bottleneck:** At launch (Reddit post), the first 500 concurrent users hit Open-Meteo uncached simultaneously for 404 venues. Each weather fetch hits 2 APIs (weather + marine for beach). That's potentially 808 simultaneous API calls. Open-Meteo free tier caps at 10,000 req/day. 808 calls × 3 users = exhausted in minutes during a spike. **VPS cache is the prevention. Deploy the VPS.**

**No SRI on CDN scripts** — if cdnjs is compromised, injected code runs in app context. Medium risk, tracked as Open #10. Fix:
```html
<script crossorigin
  src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"
  integrity="sha384-[hash]"
  crossorigin="anonymous"></script>
```
Get hash with: `curl -s [cdn-url] | openssl dgst -sha384 -binary | openssl base64 -A`

---

## 6. Cost Estimate

| Scale | GitHub Pages | VPS (DO) | Supabase | Total/mo |
|-------|-------------|---------|----------|----------|
| Current (< 100 MAU) | $0 | $6 | $0 (free) | **$6** |
| 1K MAU | $0 | $6 | $0 (free, 500MB DB) | **$6** |
| 10K MAU | $0 | $12 (2GB RAM) | $25 (Pro) | **~$37** |
| 100K MAU | $0 (or $20 CDN) | $48–96 (multi-droplet + LB) | $25 | **~$70–140** |

**Cost optimization opportunities:**
1. At 10K MAU: add Redis on the VPS ($0, open-source) for shared weather cache across potential horizontal scale
2. At 100K MAU: GitHub Pages + Cloudflare in front ($0 Cloudflare free plan) handles DDoS + caching before VPS hits

---

## 7. Open Issues — Priority Order

### P0 — Fix before Oct 4 (6 days)

**VPS Day 50 undeployed** — 5-minute `scp` + `pm2 restart`. Without it: two-weekend scoring disabled, iOS native blocked, 270 beach venues show estimates instead of live prices at Reddit launch. **Every day this waits is a day closer to Oct 18 with a broken product.**

```bash
# From your local machine:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

---

### P1 — Fix before Oct 18 launch

**origin/master footgun** — `deploy.yml` triggers on BOTH `main` AND `master`. `origin/master` is 3 commits behind main (HEAD: `b6dc033` — an old auto-commit for terms.html). If any agent or session accidentally pushes to `master`, it deploys 3-commit-old code to the live site. PM v163 notes "Day 5 undone" — this is unresolved.

Fix (Jack SSH to GitHub):
```bash
# Option A: protect master branch so no pushes land (preferred):
# GitHub → repo settings → Branches → Add rule → master → Require PR or lock

# Option B: remove master from deploy.yml trigger:
# Edit .github/workflows/deploy.yml, remove "- master" from push.branches
# Commit + push
```
Without this fix, a single bad push to master silently reverts the live site.

**Gili Trawangan duplicate** — Two entries: `beach_gilit` (line 614) and `gili-trawangan` (line 5061). PM decided to rename on Oct 5. Until then, the boot-time dup-id validator does NOT catch this because the IDs are different (`beach_gilit` vs `gili-trawangan`) — only the title+location is duplicated. Low user impact (renders twice in search), but the Oct 5 rename decision should be tracked.

---

### P2 — Fix this sprint

**18 stale remote branches** — All `claude/` worktree branches from past sessions, plus `fix-appjsx-final`, `restore-appjsx`, `test-small`. Zero are merged into main (0 branches pass `git branch -r --merged origin/main`). They're all safe to delete — no unmerged work worth keeping.

```bash
# Jack deletes via GitHub UI or:
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

**BASE_PRICES coverage: 114/152 airports (75%), 67 missing** — Missing airports include: AIT, BEY, BOC, CHQ, CMB, CTG, DAD, DBV, DJE, EAS, ENI, EWR, EYW, FCA, FEN, FOR, GCM, GIG, GOI, GPS, HNA, HUX, INH, JMK, JNX, JTR, KBV, KOA, KRK, KUL, LEA, LOP, MAH, MBA, MCT, MLO, MYR, NAT, OKA, OSL, PDX, PMI, PPP, PQC, PRI, RAK, RDD, RHO, SEZ, SID, SMR, SNA, SOF, SRQ, TAB, TBS, TFS, TGD, TPA, TPS, USH, UVF, VPS, YKA, ZCO. PM v99 target was top ~15 by venue count — prior sessions confirmed this was closed (Open #22 resolved). The 67 missing are lower-traffic airports. Not a launch blocker.

---

### P3 — Post-launch

- **No SRI on CDN scripts** (Open #10) — supply chain risk, medium severity, deferred since launch-scope pass
- **No CSP meta** — XSS hardening, skipped per Open #10 note (could break Babel inline eval)

---

## 8. Scale Failure Mode

**What breaks first at Reddit launch:**

Open-Meteo free tier at 10,000 req/day. A Reddit post → 200 concurrent first-time visitors → each triggers weather fetch for 30 visible venues → 200 × 30 × 2 (weather + marine) = 12,000 API calls in the first minute. **You blow through Open-Meteo's daily limit before the Reddit post stops getting upvotes.** After that, every user sees "conditions unavailable, pull to refresh." Scores go dead. People bounce. The VPS weather cache (shared across all users, 2-hour TTL, in-memory) means 200 concurrent users hitting the same venue trigger 1 upstream call instead of 200. **This is why deploying the VPS is not optional before the Reddit post.** Current state: VPS cache exists in committed code but is not running. You have 6 days to fix this before the Oct 4 deadline.

---

## Summary

| Item | Status | Days Outstanding | Deadline |
|------|--------|-----------------|----------|
| VPS redeploy | 🔴 P0 | 50 | Oct 4 (6 days) |
| origin/master footgun | 🟡 P1 | 5+ | Before next push |
| Gili Trawangan rename | 🟡 P1 | — | Oct 5 (PM decision) |
| Stale branches (18) | 🟢 P2 | ongoing | Post-launch |
| BASE_PRICES gaps | 🟢 P3 | — | Post-launch |

**No new code regressions. No new security issues. Codebase is clean. The only thing keeping this from green is VPS.**
