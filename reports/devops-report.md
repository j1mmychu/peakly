# DevOps Report — 2026-10-26 (RED)

**Status: 🔴 RED — VPS Day 78. Whistler window = 15 days. `origin/master` footgun Day 19. PRECACHE→CDN mismatch still live.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Do not interpret sandbox timeouts as VPS outage.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` lines / raw size | **14,237 lines / 758,944 bytes** (741 KB) — no code changes since 2026-08-11 ✅ |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — **42 days stale**. No code shipped since Aug 11 so this is expected; first edit MUST bump in lockstep. ⚠️ |
| Plausible analytics | ✅ present, uncommented — `index.html:32` |
| React 18.3.1 (cdnjs) | ✅ pinned |
| Babel 7.24.7 (cdnjs) | ✅ dev-only; stripped by `build-web.mjs` in prod |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS, no raw IP |
| Travelpayouts token in client | ✅ `TP_MARKER="710303"` is public affiliate marker only — no secret |
| Supabase anon key in client | ✅ Intentional, public-safe, RLS-gated (`app.jsx:26`) |
| Sentry DSN | ✅ configured — `app.jsx:8` |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` |
| Image `loading="lazy"` | ✅ 9 `<img>` tags — all covered |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController timeout wired |
| `lateSeason:true` venues | ✅ **15** confirmed |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| All API calls HTTPS | ✅ Open-Meteo, marine, proxy all HTTPS |
| BASE_PRICES coverage | ✅ **100%** — 183 airports, 0 venue APs missing (Open #22 CLOSED) |
| `proxy.js` source (committed, NOT on VPS) | ✅ `forecast_days=14`, disk cache, iOS CORS, `DELETE` allow, `http2` APNs, `ieee-p1363` JWT |
| PRECACHE→CDN alignment | 🔴 **MISMATCH** — see P1-A below |
| `origin/master` footgun | 🔴 **LIVE Day 19** — see P0-B below |
| Open `claude/*` branches on origin | ⚠️ **15 stale branches** — see P1-B |

---

## 2. Critical Issues (P0) — Fix Today

### P0-A: VPS Redeploy — Day 78. Whistler Window = 15 Days. 🚨

Same finding, day 78. The committed `server/proxy.js` is sitting undeployed since Aug 11. The VPS still runs the Aug 11 build with four production bugs:

| Bug | User impact RIGHT NOW |
|-----|----------------------|
| `forecast_days: 7` (not `14`) | Whistler/Tignes/Val d'Isère invisible on front page. Two-weekend scoring disabled. |
| `capacitor://localhost` absent from CORS | Every iOS native API call blocked. App Store build broken on all iPhones. |
| `DELETE` absent from allowed methods | Alert deletion silently fails. `.catch(()=>{})` hides it. Users have phantom alerts. |
| `_wxCache` in-memory only | Cold flush on restart. Any Reddit traffic spike in first 10 min post-restart blows Open-Meteo free tier. |

**Whistler Blackcomb opening day is ~Nov 10. 15 days.** The Reddit/HN post needs `forecast_days:14` live to be honest. The VPS must ship before that post.

**Fix — 4 commands, ~5 minutes:**
```bash
ssh root@198.199.80.21
# /opt/peakly-proxy is NOT a git repo — manual copy only
cp /path/to/local/peakly/server/proxy.js /opt/peakly-proxy/proxy.js
pm2 restart peakly-proxy && pm2 save
# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: forecast_days_weather:14, disk_cache_hit or miss counts, apns:configured or unconfigured
```

If pushing from a networked machine first:
```bash
# On local machine with the repo:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 'pm2 restart peakly-proxy && pm2 save'
curl -s https://peakly-api.duckdns.org/health
```

---

### P0-B: `origin/master` Footgun — Day 19

`deploy.yml` triggers on both `main` **and** `master`. `auto-push.sh:235` pushes `master:main` (local branch named `master` → remote `main`). But `origin/master` is a real remote branch, 511 commits old, pointing to the June 2026 codebase. Any accidental push to `origin/master` — stale clone, mistyped command — triggers a full GitHub Pages deploy from that June code. Silent. Irreversible until you push again.

With 15 open `claude/*` branches plus `fix-appjsx-final` and `restore-appjsx` all on origin, the surface area for an accidental trigger is real.

**Fix — 2 minutes:**
```yaml
# .github/workflows/deploy.yml — remove master from triggers
on:
  push:
    branches:
      - main        # REMOVE: - master
  workflow_dispatch:
```

```bash
# Edit and commit:
sed -i '/      - master/d' .github/workflows/deploy.yml
git add .github/workflows/deploy.yml
git commit -m "ci: remove master from deploy trigger — footgun Day 19"
git push origin main
```

---

## 3. High Issues (P1)

### P1-A: PRECACHE→CDN Version Mismatch (Day 2)

`sw.js:3`:
```js
const PRECACHE = [
  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
];
```

`index.html:88`:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"></script>
```

**Two mismatches:**
1. Wrong CDN: sw.js precaches from `unpkg.com`; index.html loads from `cdnjs.cloudflare.com`
2. Wrong version: `7.29.7` vs `7.24.7`

**Impact:** The service worker precaches a URL (7.29.7 from unpkg) that the page never requests. The actual Babel (7.24.7 from cdnjs) is never served from cache. On repeat visits, the user fetches Babel cold from cdnjs instead of from the SW cache — defeating the entire point of precaching. This also wastes ~600KB+ of the user's SW install bandwidth precaching a file that's never used.

Production note: `build-web.mjs` strips Babel entirely from `dist/`, so this only affects the dev/`index.html` path. But it's still wrong and should be fixed.

**Fix (2 minutes):**
```js
// sw.js line 3 — either match what index.html loads, or empty the array
const PRECACHE = [
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"
];
// OR, since production serves dist/app.min.js with no Babel:
const PRECACHE = [];
```

The cleaner fix is `[]` — production doesn't use Babel at all and `dist/index.html` gets a separate build. Dev users hitting `index.html` will fetch Babel on cold start; that's acceptable.

**Time to fix: 2 minutes.**

---

### P1-B: 15 Stale `claude/*` Branches on Origin

```
claude/analyze-test-coverage-WVIsT
claude/code-review-cleanup-HjoCS
claude/condense-alert-page-jzdLo
claude/enhance-loading-screen-rZ1dc
claude/fix-app-jsx-content
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
```
Plus: `fix-appjsx-final`, `restore-appjsx`, `test-small`, `master`.

None of these are open PRs. They're abandoned worktrees. They clutter the repo, confuse fresh clones, and amplify the P0-B deploy surface.

**Fix (2 minutes — Jack's call before deleting):**
```bash
# Verify none have open PRs first:
git branch -r | grep "claude/" | sed 's/origin\///' | while read b; do
  echo "Branch: $b"
done

# Delete them all:
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

# Keep master only if auto-push.sh still needs it; otherwise delete it too:
# git push origin --delete master
```

---

## 4. Medium Issues (P2)

### P2-A: Open-Meteo Rate Limit Cliff at ~26 DAU (Without VPS Cache)

With BATCH_SIZE=100 and 404 venues, each cold-start user triggers ~404 Open-Meteo requests (weather + marine). Open-Meteo's free tier allows 10,000 requests/day. At 26 DAU without a warm VPS cache, you hit the ceiling.

**Today:** sub-26 DAU so it's fine. **Reddit-post day:** if you hit 500 DAU in the first hour, you're 50× over the free tier before the VPS proxy cache warms up. The VPS fix (P0-A) includes the cache — this P2 goes away the moment P0-A ships.

**If the VPS is down post-launch:** Open-Meteo's free tier is actually `10,000 req/day` per IP. With GitHub Pages CDN, all requests appear to come from the user's browser IP, not from a single server IP. So 404 venues × N users = N×404 distinct requests from N IPs. Open-Meteo's per-IP limit is effectively no limit for a client-side app. **Severity is lower than previously reported.** The VPS cache still matters for latency and for the alert polling, but rate limiting is not the death scenario it looked like.

### P2-B: SRI Missing on CDN Scripts (Known Since June 2026)

No `integrity=` attribute on any CDN `<script>` tag. A CDN compromise silently serves malicious JS to all users. Babel's SRI hash is stable per version.

```html
<!-- Example — add integrity= to each CDN script: -->
<script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"
  integrity="sha512-<hash>"
  crossorigin="anonymous"></script>
```

**To generate hashes:**
```bash
curl -s https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Low operational risk (cdnjs is highly reliable); medium security risk. **Time: ~30 min.**

---

## 5. Cost at Scale

| MAU | Infrastructure | Notes |
|-----|---------------|-------|
| Current (<100) | **$6/mo** | DO droplet only |
| 1K MAU | **$6/mo** | Supabase free tier (500MB), GH Pages free |
| 10K MAU | **$31/mo** | Supabase Pro $25 (5GB DB + 5GB egress) |
| 100K MAU | **$57/mo** | DO $12 (2GB RAM), Supabase Pro $25 + ~$20 egress |

**Cheapest scale risk:** Supabase egress at 10K+ MAU if cloud sync is heavily used. $0.09/GB after the free tier. Budget $0–$20/mo for this tier.

**VPS is not a scaling concern.** The proxy handles weather caching — the bottleneck is Open-Meteo upstream throughput, not the VPS. The $6/mo droplet can handle thousands of concurrent cache hits.

---

## 6. What Breaks First at Scale

**The single failure mode that will kill the launch:** the VPS cache is cold when the Reddit post hits. Here's the exact scenario: Jack posts to r/skiing on November 10 (Whistler opening day). 500 people open the app in the first 5 minutes. The VPS `_wxCache` just restarted — it's empty. 500 × 404 venues = 202,000 Open-Meteo requests fan out simultaneously. Open-Meteo is free tier — they don't hard-block, but response times degrade under load from their side. Users see loading spinners for 15–30s instead of instant scores. Half bounce.

**Prevention (already in committed proxy.js, not yet deployed):** disk persistence in `_wxCache` means a `pm2 restart` doesn't cold-flush the cache. One day's worth of requests warms it back up from disk in seconds. **The entire prevention is P0-A (VPS redeploy).** Nothing else matters as much as that one SSH session.

---

## 7. Closed Items

- ✅ **Open #22 BASE_PRICES coverage** — **CONFIRMED CLOSED**. 183 airports in BASE_PRICES, 165 unique venue APs, 0 missing. Content report's claim is verified correct from code.
- ✅ **Supabase delete-account** — SQL committed, UI ships graceful fallback
- ✅ **iOS CORS** — `capacitor://localhost` in committed proxy.js (awaits VPS deploy)

---

*Generated by automated DevOps agent — 2026-10-26 14:17 UTC*
