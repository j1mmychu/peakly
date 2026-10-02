# DevOps Report — 2026-10-02 (YELLOW)

**Status: 🟡 YELLOW — VPS proxy.js undeployed Day 54. Oct 4 hard deadline = 2 DAYS. Oct 18 launch = 16 days. Zero code commits to app.jsx/sw.js/index.html (code freeze Day 18 = GOOD). `origin/master` footgun Day 10 still live. All code GREEN.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 759 KB raw** |
| VENUES (authoritative category-grep) | **404 total — 134 skiing / 270 beach** ✅ |
| lateSeason:true venues | **15 confirmed** ✅ |
| Plausible analytics | ✅ present, uncommented (index.html:32) |
| React 18.3.1 (cdnjs) | ✅ current |
| Babel Standalone 7.24.7 (cdnjs) | ✅ dev-only; production CI build drops it |
| Sentry DSN | ✅ configured (index.html:77, app.jsx:7-8) |
| PEAKLY_BUILD / CACHE_NAME stamp | ⚠️ `"20260914a"` — Day 18 frozen (auto-bumps on next app.jsx commit; expected during code freeze) |
| All API calls HTTPS | ✅ no bare HTTP or hardcoded IPs in client |
| Secrets in client | ✅ no critical secrets (see §4) |
| Image lazy loading | ✅ 9/9 `<img>` tags carry `loading="lazy"` |
| Fetch timeouts | ✅ AbortController + 4s timeout on all proxy/Open-Meteo calls |

**No changes to tracked files in 18 days.** Code freeze holding. Last ship was 2026-09-14.

**Authoritative venue count method:**
```bash
node -e "const s=require('fs').readFileSync('app.jsx','utf8'); \
  const ski=(s.match(/category[\"']?\s*:\s*[\"']skiing[\"']/g)||[]).length; \
  const beach=(s.match(/category[\"']?\s*:\s*[\"']beach[\"']/g)||[]).length; \
  console.log(ski+beach)"
# Returns 404 — correct
```
Note: bracket-walk returns 406 (over-counts by 2 due to nested `{}` inside entries). Category regex is authoritative.

---

## 2. Flight Proxy Status — 🔴 RED (VPS undeployed Day 54, 2 days to Oct 4 deadline)

**Day 54. Oct 4 "pre-traffic gate" deadline is in 48 hours. This is not an enhancement — the committed `server/proxy.js` fixes are blocking features that are broken today.**

`server/proxy.js` committed and ready since 2026-08-11. NOT deployed. `/opt/peakly-proxy` is a hand-copied directory — `git pull` will fail there.

### What is broken until VPS is updated

| Feature | Days Broken | User Impact |
|---------|-------------|-------------|
| Two-weekend scoring (weekend 2) | **54** | Scores beyond day 7 return null; second weekend silently absent |
| iOS native flight/weather calls | **54** | `capacitor://localhost` missing from CORS — App Store build broken |
| Alert deletion | **54** | DELETE preflight blocked; `.catch(()=>{})` hides it from the user silently |
| Rate limit spoofing | **54** | `X-Forwarded-For[0]` lets anyone forge IP and inflate `_rateMap` |
| Sep 9+10 fare-fallback fix | **22** | Live fares on some beach routes not upgrading from `~$X` to `$X LIVE` |
| Weather cache disk persistence | **54** | pm2 restart wipes in-memory cache; cold-start spike = Open-Meteo rate limit risk |

### The 4 commands Jack needs to run

```bash
# SSH to VPS
ssh root@198.199.80.21

# On the VPS:
cp -r /opt/peakly-proxy /opt/peakly-proxy.bak.$(date +%Y%m%d)   # backup first
cd ~  # or wherever you have the repo clone, or scp the file
scp path/to/server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# Then on VPS:
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: apns field, uptime reset to seconds, forecast_days:14
```

**Or via scp from local machine:**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js && \
  ssh root@198.199.80.21 'pm2 restart peakly-proxy && curl -s localhost:3001/health'
```

**Time to fix: 10 minutes.** This is the only P0 item. Everything else is noise.

---

## 3. Weather & External APIs — ✅ GREEN (with known scale caveat)

| Check | Result |
|-------|--------|
| Open-Meteo endpoint | `https://api.open-meteo.com/v1/forecast` — HTTPS ✅ |
| Marine API endpoint | `https://marine-api.open-meteo.com/v1/marine` — HTTPS ✅ |
| Proxy fallback | ✅ `_tryProxyWx()` tries VPS first, falls back to direct Open-Meteo on timeout/error |
| 4s proxy timeout | ✅ AbortController at app.jsx:5518 |
| Weather batch rate limiting | ✅ 50 requests / 2s batching to stay under free tier |
| Free tier headroom (<10 MAU) | ✅ well under 10K/day ceiling |

**Scale caveat (carry-forward):** At 100K concurrent users all requesting weather simultaneously, direct Open-Meteo calls will exceed the 10K/day free tier in under 2 minutes. VPS disk cache (committed, undeployed) is the mitigation. Deploy it before the Reddit post.

---

## 4. Security Audit — ✅ GREEN (one known P2)

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ **NOT PRESENT** — server-side only via VPS proxy |
| Supabase anon key | ⚠️ Present in app.jsx:26 — **expected and intentional** (public-safe, RLS-gated per CLAUDE.md) |
| .gitignore coverage | ✅ covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision` |
| Sentry DSN | ✅ configured (app.jsx:8 + index.html:77) |
| Recent commits for secrets | ✅ Clean — last 20 commits are reports only, no code diffs |
| Git log for added key files | ✅ No `.env` or key files in recent git log |
| Hardcoded IPs in client | ✅ None — only `peakly-api.duckdns.org` (HTTPS) |

**Supabase anon key is public-intentional.** It's the Supabase pattern for client-side apps: anon key + Row Level Security enforces per-user data access. Not a secret, not a leak. Previously flagged; now documented here to stop re-flagging it.

**APNS .p8 key:** Not in the repo (covered by `.gitignore` `*.p8`). ✅

---

## 5. Performance Analysis

### JavaScript bundle at load time

| Resource | Dev path (Babel) | Production path (CI dist/) |
|----------|-----------------|---------------------------|
| React 18.3.1 (prod min, cdnjs) | ~130 KB gz | ~130 KB gz |
| ReactDOM 18.3.1 (prod min, cdnjs) | ~43 KB gz | ~43 KB gz |
| Babel Standalone 7.24.7 | ~342 KB gz | **stripped** |
| app.jsx / app.min.js | ~180 KB gz | ~439 KB minified |
| Sentry SDK | ~50 KB gz | ~50 KB gz |
| Supabase SDK (lazy, auth only) | ~80 KB gz | ~80 KB gz |
| **Total initial** | **~745 KB gz** | **~662 KB (no Babel)** |

Live site users get the production build (esbuild CI, Babel stripped). The 3-5s Babel parse wall on mobile is eliminated. ✅

### Single largest performance bottleneck

**The 404-venue weather batch.** Cold visit = up to ~9 batches of 50 requests at 2s intervals = **~18 seconds to full-score visibility**. Venues render immediately with estimate prices; weather scores fill in async. For first-time users this looks like a loading spinner for 18 seconds on the score values. VPS weather cache (undeployed) reduces this to 1 upstream call per lat/lon pair across all concurrent users — critical pre-Reddit.

### CDN dependency versions
- React 18.3.1 ✅ current
- Babel 7.24.7 ✅ current (dev-only)
- No outdated pinned CDN dependencies

---

## 6. Cost Estimate

| Scale | Monthly infra cost | Notes |
|-------|--------------------|-------|
| Current (<10 MAU) | **$6/mo** | DigitalOcean 1GB droplet + GitHub Pages (free) |
| 1K MAU | **$6/mo** | Pages handles static; VPS handles proxy — no upgrade needed |
| 10K MAU | **$12/mo** | Upgrade VPS to 2GB ($12); Pages free; Supabase free tier holds |
| 100K MAU | **$48-60/mo** | 4-8GB VPS ($24-48) + possible Open-Meteo commercial ($20/mo if cache miss rate >25%) |

**Cost optimization opportunities:**
1. **Open-Meteo at scale:** VPS disk cache (undeployed) prevents rate-ceiling blowout. No cost until it's actually needed.
2. **Supabase free tier:** 500MB DB, 2GB bandwidth/mo. At 10K MAU with sync = ~50K upserts/day. Free tier row limit 500K. Safe through 10K MAU.
3. **GitHub Pages:** Free, global edge caching, handles 1GB repo / 100GB/mo bandwidth. Not a concern at any projected scale.

---

## 7. Stale Branch Cleanup — 🟡 P1 (footgun still live Day 10)

| Issue | Count | Status |
|-------|-------|--------|
| `origin/master` footgun | 1 | **Day 10 unresolved — LIVE FOOTGUN** |
| `origin/claude/*` stale branches | **15** | Unchanged from yesterday |
| `origin/fix-appjsx-final` | 1 | Stale, abandoned |
| `origin/restore-appjsx` | 1 | Stale, abandoned |
| `origin/test-small` | 1 | Stale, abandoned |

**`origin/master` is the live footgun.** It's a branch (`b6dc033 auto: terms.html`) that's diverged from `origin/main`. `deploy.yml` triggers on both `main` and `master`. A `git push origin master` or a clone that checks out master will silently deploy stale code. Day 10 with no action.

```bash
# Delete the footgun (30 seconds):
git push origin --delete master

# Clean stale claude branches (2 minutes):
git push origin --delete $(git branch -r | grep 'origin/claude/' | sed 's|  origin/||' | tr '\n' ' ')

# Clean other stale branches:
git push origin --delete fix-appjsx-final restore-appjsx test-small
```

---

## 8. What Breaks First at Scale

**The VPS weather cache is the single failure mode at scale.** When the Reddit/r/skiing (Nov 1) or r/solotravel post lands, the first 60 seconds will send hundreds of new visitors into the 404-venue weather batch simultaneously. Without VPS cache (1 upstream call per lat/lon pair across all users), a 200-person spike = 80,800 Open-Meteo requests in ~2 minutes — 8× the daily free-tier ceiling in one burst. The app degrades gracefully (venues render with `~$X` estimates, weather fills in slowly), but **scores will be wrong for the first wave of users** — the exact people whose first impression determines the upvote. Prevention: deploy the committed `server/proxy.js` before any public post. **That's the only action needed.**

---

## Summary

| Priority | Item | Days Open | Fix Time |
|----------|------|-----------|----------|
| 🔴 P0 | VPS redeploy — `server/proxy.js` undeployed | **54** | **10 min SSH** |
| 🟡 P1 | Delete `origin/master` footgun | **10** | 30 sec |
| 🟡 P2 | Delete 15 `origin/claude/*` + 3 stale branches | — | 2 min |
| ✅ — | Code freeze (Day 18) — zero code regressions | — | — |
| ✅ — | 404 venues, 15 lateSeason, all code checks clean | — | — |
| ✅ — | Sentry configured, Plausible live, HTTPS everywhere | — | — |

**Oct 4 is in 2 days. One SSH session unblocks everything. Nothing else matters until that's done.**
