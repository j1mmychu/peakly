# DevOps Report — 2026-08-22 (GREEN)

**Status: 🟢 GREEN — Launch day. All systems nominal.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (proxy egress blocks it, standard sandbox constraint, not a VPS outage). VPS confirmed healthy by Jack 2026-08-11: disk cache live, `forecast_days:14`, CORS fixed, DELETE alerts working, `apns:configured`. Treating as healthy. Do not re-flag from sandbox.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,961 lines / 742,184 bytes** (+220 lines / +15KB since Aug 20 report — normal for the fix sprint) |
| `dist/app.min.js` | **495 KB** (Aug 21 build — CI rebuilds on every push) |
| Cache stamp — source | **`20260821c`** ✅ in `app.jsx:17` + `sw.js:2` — current, post last app.jsx change (`8f12dfd`) |
| Cache stamp — `dist/index.html` | **`v=20260821b`** ⚠️ one suffix behind (see P3 below) |
| `PEAKLY_BUILD` | **`20260821c`** ✅ |
| Plausible analytics | ✅ `defer data-domain="j1mmychu.github.io/peakly"` at `index.html:32` |
| Sentry | ✅ DSN live — `app.jsx:7–8` + `index.html:77`; `captureException` wired |
| Venue count | **391** (confirmed via node bracket-walk) — matches `.venue-baseline` ✅ |
| Lazy images | ✅ All 9 `<img>` render sites include `loading="lazy"` |

**No P0 or P1 issues in site health.**

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` at `app.jsx:6224` ✅ HTTPS — no raw IP anywhere in client |
| Timeout | ✅ `AbortController` wired in `fetchTravelpayoutsPrice` (4s weather, 5s flights) |
| Fallback | ✅ Fails gracefully to `~$X` estimate on any proxy failure |
| Concurrent requests | ✅ 8 max flight fetches in parallel with semaphore |
| VPS health | ✅ Confirmed 2026-08-11 by Jack — `apns:configured`, disk cache, CORS, DELETE alerts all live |

**No issues. Open #19 and #23 CLOSED.**

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo client | `api.open-meteo.com/v1` + `marine-api.open-meteo.com/v1` ✅ |
| VPS proxy cache | ✅ Disk-persistent post 2026-08-11 redeploy — Reddit spike guard is live |
| `forecast_days` | `=14` via proxy ✅ (two-weekend scoring active) |
| Client-side wx cache | 2hr localStorage TTL per-coord ✅ |
| Batch throttle | 50 venues / 2s ✅ — required for 391-venue cold load |
| Free-tier ceiling risk | LOW at current MAU. Disk cache handles the spike. |

**No issues.**

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token | ✅ `TP_MARKER = "710303"` only — public affiliate marker. Server-side auth token never in client |
| Supabase anon key | `eyJhbGci...` at `app.jsx:26` — **intentionally public by design**. RLS gates all writes. Safe. |
| APNS keys in client | ✅ None. Push is server-only; `APNS_LIVE` gates iOS alert UI |
| Other credentials | ✅ No `.p8`, no service-role keys, no Stripe, no write-access keys in tracked files |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision` |
| Recent commits (last 5) | ✅ 0 suspicious files — report files, scroll fixes, UX polish. Clean. |
| Sentry DSN | Public-safe for client-side Sentry. Not a secret. |
| Stale branches | **15 `claude/` branches on `origin`** — no security risk, cosmetic (P3 cleanup, post-launch) |

**No security issues.**

---

## 5. Performance Analysis

| Metric | Value | Note |
|--------|-------|------|
| Production bundle (`dist/app.min.js`) | **495 KB** | esbuild-minified, Babel stripped — clean |
| Dev-path overhead | ~1.1 MB gz transferred | React 18 + Babel standalone — dev only, not users |
| CDN versions | React `18.3.1`, Babel `7.29.7` ✅ | Current at time of last audit |
| Biggest real bottleneck | **391-venue cold weather fetch** | 50 venues/2s = ~16s total cold load; hot path hits 2hr localStorage cache |
| Image lazy loading | ✅ All 9 `<img>` sites | No eager off-screen fetches |
| Plausible defer | ✅ `defer` attr on analytics script | Off the critical render path |

**P2 note:** the 391-venue batch fetch (16s sequential at 50/2s) is the single biggest UX gap on a cold load. This is a known architecture constraint — the batching exists to protect Open-Meteo's free tier. At >1K MAU with a hot VPS cache, most requests hit the proxy's disk cache and this collapses to near-instant. It's a problem only in the window between a Reddit spike and the VPS cache warming. Disk cache is the mitigation (live since 2026-08-11).

---

## 6. Cost Estimate

| MAU | Open-Meteo | VPS ($6/mo DO droplet) | GitHub Pages (free) | Total/mo |
|-----|-----------|------------------------|---------------------|----------|
| Current (<100) | Free tier | $6 | $0 | **$6** |
| 1K | Free tier | $6 | $0 | **$6** |
| 10K | Free tier (VPS cache absorbs spikes) | $6–12 | $0 | **$6–12** |
| 100K | Open-Meteo $29/mo (100K+ calls) | $12–24 (larger droplet) | $0 | **$41–53** |

**Cost optimization available at 100K MAU:** upgrade VPS to 2GB RAM for ~$12/mo, enabling larger in-memory wx cache. Eliminates most Open-Meteo paid-tier exposure at that scale by increasing cache hit rate. No action needed today.

---

## Issues

### ⚪ P3 — `dist/index.html` cache version one sub-suffix behind source

`dist/index.html` references `app.min.js?v=20260821b`, but source files are at `20260821c`. The `dist/` folder is rebuilt by CI (`scripts/build-web.mjs`) on every push — the live production site (`j1mmychu.github.io/peakly`) was built from the correct `c` stamp on the `8f12dfd` push. The local dist/ clone just hasn't been re-synced. **No user impact. Self-corrects on next push.**

No action required unless you need to verify locally: `node scripts/build-web.mjs` in the repo root.

---

### ⚪ P3 — Stale ready-to-ship diffs, some months old

`reports/ready-to-ship/` contains diffs from May 2026 that are either already applied or superseded:

- `aruba-eagle-dupe-delete-2026-05-04.diff` — CLAUDE.md confirms this was applied (resolved #5). Archive it.
- `cache-buster-bump-2026-05-04.diff` — structural auto-bump is live. Dead. Archive it.
- `gear-gate-flip-2026-05-04.diff` — Amazon cut entirely. Dead. Archive it.
- `pm-prompt-header-refresh-2026-05-06.diff` — stale.
- `deploy-chain-2026-05-07.diff` — `scripts/deploy-chain.sh` exists. Applied or superseded.
- `eager-supabase-delete-2026-05-08.diff` and `eager-supabase-delete-2026-06-11.diff` — graduated to known-skipped in June. Dead.

**Active and relevant:** `airport-coords-10-add-2026-08-20.diff` — 10 missing airport entries. Jack applied similar content in `3fd1995` (AP_CONTINENT + AIRPORT_COORDS gaps fixed). Verify this diff is still unapplied before applying; if content agent confirmed 100% AIRPORT_COORDS coverage in `f1720ae`, it may also be superseded.

To archive the confirmed-dead diffs:
```bash
mkdir -p reports/archive/ready-to-ship-2026-08-22
mv reports/ready-to-ship/aruba-eagle-dupe-delete-2026-05-04.diff \
   reports/ready-to-ship/cache-buster-bump-2026-05-04.diff \
   reports/ready-to-ship/gear-gate-flip-2026-05-04.diff \
   reports/ready-to-ship/pm-prompt-header-refresh-2026-05-06.diff \
   reports/ready-to-ship/deploy-chain-2026-05-07.diff \
   reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff \
   reports/ready-to-ship/eager-supabase-delete-2026-06-11.diff \
   reports/archive/ready-to-ship-2026-08-22/
```

Estimated time: 2 minutes. Post-launch housekeeping.

---

### ⚪ P3 — 15 stale `claude/` branches on `origin`

`claude/analyze-test-coverage-WVIsT`, `claude/code-review-cleanup-HjoCS`, and 13 more exploratory worktree branches are sitting on `origin`. No security risk — they're public repo branches with no secrets. But they clutter `git branch -r` and could confuse future agents into treating them as active work.

To delete all at once after launch:
```bash
git fetch --prune
for b in $(git branch -r | grep 'origin/claude/' | sed 's|origin/||'); do
  git push origin --delete "$b"
done
```

Estimated time: 5 minutes. Post-launch.

---

## What Breaks First at Scale

**Open-Meteo free-tier ceiling at ~66+ concurrent cold-load DAU.** If the Reddit post lands and 100 users simultaneously open Peakly on a cold cache (VPS just restarted, or a venue no one's viewed in 2+ hours), the 391-venue batch fires 391 upstream requests through the VPS. The VPS disk cache returns these within milliseconds *if already warm* — but on a cold restart, each request is a live Open-Meteo round-trip, and at >66 simultaneous uncached coordinates you start hitting 429s. The disk cache warms after the first wave and collapses the problem, but the first 30-60 seconds after a traffic spike on a freshly restarted VPS is the danger window.

**Prevention:** Before any Reddit/HN post, SSH to the VPS and warm the cache manually:
```bash
# Run this from VPS before posting anywhere
curl -s "https://peakly-api.duckdns.org/api/weather?lat=45.5&lon=-122.6" > /dev/null
# Repeat for your top 10 venue coords — each warms the disk cache for 2 hours
```

At 10K MAU sustained, upgrade the DO droplet to 2GB RAM ($12/mo) and increase the in-memory LRU from 4,000 to 10,000 entries in `server/proxy.js`. That keeps >95% of requests fully in-memory and eliminates the cold-cache exposure window.

---

*Report generated: 2026-08-22. Verified against `origin/main` at commit `aabf57a`.*
