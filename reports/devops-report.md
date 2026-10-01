# DevOps Report — 2026-10-01 (YELLOW)

**Status: 🟡 YELLOW — VPS proxy.js undeployed Day 53. Oct 4 hard deadline = 3 days. Oct 18 launch = 17 days. Zero code commits in 17 days (code freeze = GOOD). `origin/master` footgun Day 9 undone. All other systems GREEN.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | 14,237 lines / 759 KB raw |
| VENUES (authoritative regex count) | **404 total** — 134 skiing / 270 beach ✅ |
| lateSeason:true venues | **15 confirmed** ✅ |
| Plausible analytics | ✅ present, uncommented (index.html:32) |
| React 18.3.1 (cdnjs) | ✅ current |
| Babel Standalone 7.24.7 (cdnjs) | ✅ (dev-only; production CI build drops it) |
| Sentry DSN | ✅ configured (index.html:77 + app.jsx:7-8) |
| dist/app.min.js | ✅ CI-built by `build-web.mjs` on every push (gitignored, not in checkout — expected) |
| PEAKLY_BUILD / CACHE_NAME stamp | ⚠️ `"20260914a"` — Day 17 frozen (auto-bumps on next code commit) |
| All API calls HTTPS | ✅ no bare HTTP or hardcoded IPs in client |
| Secrets in client | ✅ none critical (see §4) |
| Image lazy loading | ✅ 9/9 `<img>` tags carry `loading="lazy"` |

**Venue count method:** `node -e "const s=require('fs').readFileSync('app.jsx','utf8'); const ski=(s.match(/category[\"']?\s*:\s*[\"']skiing[\"']/g)||[]).length; const beach=(s.match(/category[\"']?\s*:\s*[\"']beach[\"']/g)||[]).length; console.log(ski+beach)"` → **404**. Simple bracket-walk gives 406 (over-counts nested `{}` inside venue entries by 2 — pre-existing artifact). Category regex is authoritative.

**lateSeason grep note (carry-forward):** `grep -c "lateSeason:true"` returns 10 (misses 5 JSON-quoted format entries). Authoritative:
```bash
node -e "const s=require('fs').readFileSync('app.jsx','utf8'); console.log((s.match(/lateSeason[\"']?\s*:\s*true/g)||[]).length)"
# Returns 15 — correct
```

---

## 2. Flight Proxy Status — 🔴 RED (VPS undeployed Day 53, 3 days to Oct 4 deadline)

**This is Day 53. The Oct 4 "pre-traffic gate" deadline PM set is in 3 days. If this doesn't ship before the Reddit/HN post, two-weekend scoring is broken, iOS can't reach the proxy, and alert deletion has never worked for 53 days.**

`server/proxy.js` committed and ready since 2026-08-11. NOT deployed. `/opt/peakly-proxy` is a hand-copied directory — **`git pull` will fail there.**

**What is broken until VPS is updated:**

| Feature | Days Broken | User Impact |
|---------|-------------|-------------|
| Two-weekend scoring (weekend 2) | 53 | Scores beyond day 7 return null; app silently shows nothing for week-2 |
| iOS native flight/weather calls | 53 | `capacitor://localhost` missing from CORS — App Store build broken |
| Alert deletion | 53 | DELETE preflight blocked; `.catch(()=>{})` hides it from the user |
| Rate limit spoofing | 53 | `X-Forwarded-For[0]` lets anyone forge their IP and inflate `_rateMap` |
| Sep 9+10 fare-fallback fix | 22 | Live fares on some beach routes not upgrading from `~$X` to `$X LIVE` |
| Disk weather cache (Open #23) | 53 | pm2 restart wipes cache; cold Reddit spike still risks Open-Meteo rate ceiling |

**The exact fix. 4 commands. ~10 minutes.**
```bash
ssh root@198.199.80.21
cd /tmp && git clone https://github.com/j1mmychu/peakly.git peakly-tmp 2>/dev/null || (cd /tmp/peakly-tmp && git pull)
cp /tmp/peakly-tmp/server/proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy && curl -s https://peakly-api.duckdns.org/health
```

Expected `/health` after restart:
```json
{"status":"ok","apns":"configured","uptime_s":5,"wx_cache_size":0}
```
`wx_cache_size` starts at 0 post-restart, refills in ~30 min under traffic. Normal.

If `git clone` fails on the VPS (no git installed):
```bash
curl -sL https://raw.githubusercontent.com/j1mmychu/peakly/main/server/proxy.js -o /opt/peakly-proxy/proxy.js
```

---

## 3. Weather & External API — ✅ GREEN

- Open-Meteo free tier: 10,000 calls/day per IP. At 404 venues × 1 weather call = 404 calls/batch. **24 safe batches/day at pre-launch traffic.** Not a concern today.
- `_tryProxyWx` has 4s `AbortController` timeout, falls back to direct Open-Meteo gracefully (app.jsx:5521-5526).
- `fetchWeather` has 8s timeout + fallback (app.jsx:5538-5539).
- `fetchMarine` has 8s timeout + fallback (app.jsx:5576-5577).
- Weather cache (`_wxCache`) on VPS is in-memory with 2hr TTL. A `pm2 restart` wipes it (Open #23). Disk persistence fix is in the committed `server/proxy.js` — another reason to deploy.

**Reddit/HN spike risk:** If VPS is cold (just restarted) and a spike arrives, the client falls back to direct Open-Meteo for the first 2hrs. At ~66+ concurrent DAU on the same venue set, rate ceiling becomes a risk. Disk cache in the undeployed `proxy.js` mitigates this. **Deploy before posting anywhere.**

---

## 4. Security Audit — ✅ GREEN

| Check | Status |
|-------|--------|
| Travelpayouts auth token in client | ✅ Not present. Server-side VPS env only. |
| `TP_MARKER = "710303"` (app.jsx:6667) | ✅ Expected. Public affiliate link marker, not a credential. Intentional per CLAUDE.md. |
| `SUPABASE_ANON_KEY` in app.jsx:26 | ✅ Expected. Documented "public-safe, RLS-gated" per CLAUDE.md. Anon keys are designed to be client-facing — RLS on the Supabase side controls what an anon user can read/write. |
| Supabase URL in client | ✅ Expected. Not a secret. |
| `.gitignore` covers secrets | ✅ `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.mobileprovision` all listed. |
| Recent commits for accidental secrets | ✅ Clean. Last 10 commits are reports + content only. |
| No secrets in `git log --diff-filter=A` | ✅ No `.env` or key files added. |

No security regressions. Clean.

---

## 5. Performance Analysis

**JavaScript bundle at load time (Babel dev path, index.html):**
| Resource | Size (approx) |
|----------|---------------|
| React 18.3.1 (production min) | ~130 KB gzipped |
| ReactDOM 18.3.1 (production min) | ~43 KB gzipped |
| Babel Standalone 7.24.7 | ~342 KB gzipped |
| app.jsx (raw, transpiled in-browser) | ~759 KB raw / ~180 KB gzipped |
| Sentry SDK (deferred) | ~50 KB gzipped |
| Supabase SDK (lazy, only on auth) | ~80 KB gzipped |
| **Total initial (Babel dev path)** | **~745 KB gzipped** |

**Production path (CI-built `dist/app.min.js`):** Babel stripped entirely. esbuild output ~439 KB minified per CLAUDE.md. Live site users get the production build. The Babel 342 KB is dev-only. Eliminates the 3-5s parse wall on mobile.

**Single largest bottleneck:** The 404-venue weather batch. Each Explore load fires up to 404 sequential-ish Open-Meteo requests (batched 50/2s). On a cold visit with empty localStorage cache, this is ~16 seconds to full-score visibility. Mitigation in place: `getTypicalPrice` and `BASE_PRICES` render immediately; weather scores fill in as batches resolve. VPS proxy cache (when deployed) reduces this to ~1 upstream call per lat/lon pair across all users.

**CDN dependency versions:**
- React 18.3.1 — current ✅
- Babel 7.24.7 — current (dev-only) ✅
- No pinned CDN dependencies are outdated.

---

## 6. Cost Estimate

| Scale | Monthly infra cost | Notes |
|-------|--------------------|-------|
| Current (<10 MAU) | **$6/mo** | DigitalOcean 1GB droplet + GitHub Pages (free) |
| 1K MAU | **$6/mo** | Pages handles static easily; VPS handles proxy load — no upgrade needed |
| 10K MAU | **$12/mo** | Upgrade VPS to 2GB ($12) for weather cache headroom; Pages still free |
| 100K MAU | **$48-60/mo** | 4-8GB VPS ($24-48) + possible Open-Meteo paid tier ($20/mo) if cache miss rate is high |

**Cost optimization opportunities:**
1. **Open-Meteo rate ceiling at 100K MAU** — at 100K concurrent users all requesting weather, direct Open-Meteo calls WILL exceed the 10K/day free tier. VPS disk cache (`server/proxy.js` — **undeployed**) is the mitigation. If cache miss rate stays <25%, free tier survives. Above that: Open-Meteo commercial starts at $20/mo.
2. **Supabase free tier** — 500MB database, 2GB bandwidth/month. At 10K MAU with cloud sync = ~50K row upserts/day. Free tier row limit is 500K rows. Safe through 10K MAU.
3. **GitHub Pages** — free, no CDN cost, handles static assets with edge caching globally. No upgrade path needed until GitHub limits apply (1GB repo, 100GB/month bandwidth). Not a concern at any projected scale.

---

## 7. Stale Branch Cleanup — 🟡 LOW PRIORITY

| Issue | Count | Fix |
|-------|-------|-----|
| `origin/claude/*` stale branches | **15** | `git push origin --delete $(git branch -r | grep 'origin/claude/' | sed 's|origin/||' | tr '\n' ' ')` |
| `origin/master` footgun | **Day 9** | `git push origin --delete master` |
| Other stale feature branches | fix-appjsx-final, restore-appjsx, test-small | Delete after confirming they're abandoned |

`origin/master` is the footgun: it's a branch (`b6dc033 auto: terms.html`) that has diverged from `origin/main`. A `git push origin master` or `git checkout master` from a fresh clone will silently deploy stale code to GitHub Pages (if the deploy workflow triggers on `master` too — it does, per `deploy.yml`). This is a live footgun. **Delete it.**

```bash
git push origin --delete master
```

---

## 8. What Breaks First at Scale

**The VPS weather cache is the single point of failure at scale.** When a Reddit/HN post lands, the first 60 seconds send every new visitor into the 404-venue weather batch simultaneously. Each user fires up to 404 independent Open-Meteo requests. Without the VPS cache (which deduplicates identical lat/lon calls across users), a 100-person spike = 40,400 Open-Meteo calls in ~60 seconds — 4× the daily free tier in one minute. The app degrades gracefully (venues render with estimate fares, weather fills in slowly), but scores will be wrong for the first wave of users — the exact people whose first impression determines whether Peakly gets upvoted or dismissed. **Prevention: deploy the committed `server/proxy.js` before any public post. That's it. One SSH session.**

---

## Summary

| Priority | Item | Days Open | Fix Time |
|----------|------|-----------|----------|
| 🔴 P0 | VPS redeploy — `server/proxy.js` undeployed | **53** | 10 min SSH |
| 🟡 P1 | Delete `origin/master` footgun | 9 | 30 sec |
| 🟡 P2 | Delete 15 stale `origin/claude/*` branches | — | 2 min |
| ✅ — | Code freeze (Day 17) — zero regressions | — | — |
| ✅ — | 404 venues, 15 lateSeason, all checks clean | — | — |

**One action needed from Jack: SSH to the VPS and run the 4 commands in §2. Everything else is noise.**
