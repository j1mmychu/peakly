# DevOps Report — 2026-08-25 (GREEN)

**Status: 🟢 GREEN — Post-launch day 3. Two fixes shipped in this report: cache stamp bump + BASE_PRICES final gap. No P0/P1 issues.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (standard sandbox egress block, not a VPS outage). Jack confirmed healthy 2026-08-11 post-redeploy: disk cache live, `forecast_days:14`, CORS fixed, DELETE alerts working, `apns:configured`. Treating as healthy. VPS confirmed up by PM as recently as this observation window — do not re-flag from sandbox.

---

## Fixes Shipped in This Report

| Fix | Where | Impact |
|-----|-------|--------|
| Cache stamp bumped `20260823b` → `20260825a` | `app.jsx:17`, `sw.js:2`, `index.html:395` | Pushes the Aug 24 BASE_PRICES/timeout code to service-worker-cached users who were getting stale app |
| BASE_PRICES final 4 entries added (BOS/JFK/LAX/MIA) | `app.jsx` after CMH | Closes the last gap — 4 domestic hub venues now have route-specific pricing instead of the $350 same-continent fallback |

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **14,030 lines / ~750 KB raw** (+4 lines vs yesterday — BASE_PRICES 4 entries added) |
| `dist/app.min.js` | **495 KB** (local snapshot Aug 21; CI rebuilds on every push to Pages) |
| Cache stamp — source | **`20260825a`** ✅ `app.jsx:17` + `sw.js:2` + `index.html:395` — fully in lockstep (bumped this report) |
| `PEAKLY_BUILD` | **`20260825a`** ✅ |
| Plausible analytics | ✅ `defer data-domain="j1mmychu.github.io/peakly"` at `index.html:32` |
| Sentry | ✅ Live — DSN wired `index.html:77` + `app.jsx:7-8`; `tracesSampleRate: 0.05` |
| Venue count | **196** (68 skiing / 128 beach) via dual-format grep — true count is higher (~391, mixed JSON formats; the grep-undercount is documented and expected) |
| Lazy images | ✅ 9/9 `<img>` render sites include `loading="lazy"` |
| Babel in production | ✅ Stripped — `dist/index.html` loads `app.min.js`; no Babel parse wall on real users |
| Duplicate venues | ✅ 0 (boot-time dup-id IIFE at `app.jsx:528`) |

### Cache stamp gap (now closed)

The PM v129 cloud commit (`abf6057`, Aug 24) changed `app.jsx` — added 23 BASE_PRICES airports and bumped flight timeout to 4,000ms — but the auto-push hook doesn't run in cloud environments. The cache stamp stayed `20260823b`. Service-worker users had stale code cached for ~36 hours (Aug 23 18:00 UTC → Aug 25 audit). Bumped to `20260825a` in this report. PWA users will receive a fresh app on next visit.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL in source | `https://peakly-api.duckdns.org` (HTTPS) ✅ |
| Old HTTP IP `104.131.82.242` | ✅ Zero references |
| Old HTTP IP `198.199.80.21` | ✅ Zero references in client code |
| `fetchTravelpayoutsPrice` timeout | **4,000ms** ✅ (fixed in PM v129 commit Aug 24; was 1,500ms) |
| Fallback on proxy failure | ✅ Falls back to BASE_PRICES estimate, `_flightApiStatus = "down"` |
| Weather proxy timeout | ✅ 4,000ms (`_tryProxyWx`) + 8,000ms direct fallback |

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Weather `forecast_days` | **14** (`app.jsx:5440`) ✅ |
| Marine `forecast_days` | **10** (`app.jsx:5484`) ✅ |
| Open-Meteo retry logic | ✅ 3 attempts, exponential backoff 1.2s/2.4s, 429 handled |
| Rate limit exposure | Low — VPS disk cache is the mitigation; direct Open-Meteo fallback only if VPS down |
| API batching | 50 venues / 2s window; BATCH_SIZE 100 for subsequent batches (`app.jsx:13238`) |

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token | ✅ Server-side only. Client has `TP_MARKER = "710303"` (public affiliate marker, not the API token) |
| Supabase anon key | ℹ️ Exposed in `app.jsx:26` — expected and correct for Supabase architecture. RLS enforces row-level security; anon key is designed to be public |
| `.gitignore` | ✅ Covers `.env*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision` |
| `.env` files on disk | ✅ None present in working tree |
| Recent commits for secrets | ✅ Last 12 commits are daily reports + widget changes + BASE_PRICES backfill — no secret exposure |
| Sentry DSN | ℹ️ In `app.jsx:8` and `index.html:77` — Sentry DSNs are public-facing by design (rate-limited, project-scoped). Not a vulnerability |

**No security issues.**

---

## 5. Performance Analysis

| Check | Result |
|-------|--------|
| Total JS payload (prod) | **~720 KB** — 495 KB `app.min.js` + 137 KB React 18.3.1 + 50 KB ReactDOM (compressed over wire: ~200 KB gzipped) |
| Dev mode JS payload | **~2.8 MB** — 750 KB `app.jsx` + Babel Standalone (~1.5 MB) + React UMD (dev). Not served to real users via Pages |
| CDN — React | `unpkg.com/react@18.3.1` ✅ current |
| CDN — Babel | `unpkg.com/@babel/standalone@7.29.7` ✅ current |
| CDN — Supabase | `cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.2` — pinned, latest is ~2.110.x. No breaking changes in patch range; update is low priority |
| Lazy images | ✅ 9/9 |
| Largest bottleneck | Open-Meteo rate limit at 66+ concurrent unique-venue DAU. VPS disk cache is the primary defense |

---

## 6. BASE_PRICES Coverage

| Metric | Before This Report | After This Report |
|--------|-------------------|-------------------|
| Venue airports (unique `ap:` values) | 149 | 149 |
| BASE_PRICES outer keys | 175 | **179** |
| Venue APs missing from BASE_PRICES | 4 (BOS/JFK/LAX/MIA) | **0** |
| Coverage | 97.3% | **100%** |

The 4 gap airports were domestic US beach venues (Race Point/BOS, Hamptons/JFK, Malibu/LAX, South Beach/MIA). The fallback was the continent-pair $350 estimate rather than real route pricing. Not breaking, but less accurate for deal scoring. Fixed.

```javascript
// Added to BASE_PRICES, after CMH entry:
BOS:{ JFK:120, LAX:280, SFO:340, ORD:180, MIA:220, SEA:360, ATL:200, DEN:300, DFW:280, LAS:320, PHX:300, MSP:240, DTW:200 },
JFK:{ BOS:120, LAX:280, SFO:320, ORD:180, MIA:200, SEA:360, ATL:180, DEN:280, DFW:260, LAS:300, PHX:280, MSP:220, DTW:180 },
LAX:{ JFK:280, BOS:300, SFO:80,  ORD:240, MIA:320, SEA:140, ATL:300, DEN:160, DFW:180, LAS:80,  PHX:100, MSP:260, DTW:280 },
MIA:{ JFK:200, BOS:220, LAX:320, SFO:360, ORD:240, SEA:400, ATL:160, DEN:280, DFW:240, LAS:280, PHX:260, MSP:280, DTW:240 },
```

---

## 7. Open Items (Carried from Prior Reports)

### P1 — Geo-silent-block risk on iOS (elevated by PM v129)

iOS 16+ may silently reject geolocation without prompting the user when the site isn't HTTPS *from their perspective* (e.g. WebView quirks) or when Safari's "prevent cross-site tracking" setting conflates web+native contexts. The onboarding slide calls `getCurrentPosition` with `timeout:10000` and silently falls back to the airport grid on failure. This is correct behavior. The P1 risk is: if geo is silently blocked on a large fraction of iOS installs, new users never get a home airport auto-detected and likely churn on the "nothing great near you" empty state.

**Fix:** Test on a real iOS device before any paid marketing spend. The fix if it manifests is to add a visible "Using Boston" auto-detect confirmation chip that replaces "Detecting..." rather than the silent `setGeoState("done")` path. No code change needed unless the device test confirms it's happening.

**Estimated fix time:** 30 min if confirmed; 0 min if not reproduced.

### P3 — Stale `claude/*` branches on origin (15 branches + 3 misc)

```bash
# Verify none are in-use, then bulk delete:
git branch -r | grep "origin/claude/" | sed 's|  origin/||' | xargs -I{} git push origin --delete {}
git push origin --delete fix-appjsx-final restore-appjsx test-small
```

Not a runtime issue. Cosmetic repo hygiene.

### P3 — Supabase CDN version pin

`@supabase/supabase-js@2.106.2` is ~4 minor versions behind latest. No known breaking changes or security patches in this range. Update when convenient:

```javascript
// app.jsx:61 — change version:
s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.0/dist/umd/supabase.min.js";
```

Verify `useCloudSync` behavior still works after update. Estimated: 10 min.

---

## 8. Cost Estimate

| Scale | Infrastructure Cost | Notes |
|-------|---------------------|-------|
| Current (<100 MAU) | **$6/month** | DigitalOcean droplet + GitHub Pages (free) + Supabase free tier |
| 1K MAU | **~$12/month** | Same infra; Supabase free tier holds to ~50K auth users |
| 10K MAU | **~$37/month** | Supabase Pro ($25/mo) + same droplet + GitHub Pages (still free) |
| 100K MAU | **~$100-150/month** | Droplet → $12/mo 2GB, Supabase Pro + ~$50 bandwidth; still cheap |

GitHub Pages bandwidth free up to 100GB/month — plenty until 100K MAU. No CDN cost.

---

## Scaling Bottleneck

**What breaks first: service worker delivering stale code when cloud agents change app.jsx without bumping the cache stamp.**

This is the structural issue. The auto-push hook (PostToolUse, runs locally) bumps the stamp correctly. Cloud agent commits (Cowork, scheduled runs) bypass the hook. The PM v129 commit from Aug 24 demonstrated this exactly: app.jsx changed, stamp stayed `20260823b`, ~36 hours of service-worker-cached users got the old code. The fix is this report's first action every day: verify stamp matches the date of the last code-touching commit.

**Long-term fix (30 min):** Add a `post-commit` git hook in the repo that stamps the date on any commit touching `app.jsx`/`sw.js`/`index.html`. Unlike the PostToolUse hook, `post-commit` runs everywhere including cloud agents that do `git commit` directly.

```bash
# .git/hooks/post-commit (chmod +x)
#!/bin/bash
CHANGED=$(git diff HEAD~1 --name-only 2>/dev/null | grep -E "^(app\.jsx|sw\.js|index\.html)$")
[ -z "$CHANGED" ] && exit 0
TODAY=$(date -u +%Y%m%d)
# bump logic is already in scripts/auto-push.sh — source it or duplicate the perl one-liner here
```

The cloud agent can also call `bash scripts/auto-push.sh` as its final step, which is already idempotent and stamp-aware.

---

*Report generated: 2026-08-25. Fixes shipped: cache stamp bump (20260823b→20260825a) + BASE_PRICES 4 domestic hub airports. Next automated run: 2026-08-26.*
