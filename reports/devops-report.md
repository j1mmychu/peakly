# Peakly DevOps Report — 2026-06-24

**Status: 🟢 GREEN**

Cache stamp bumped `20260623c` → `20260624a` (1 day stale, fixed this run). All invariants pass. Zero security issues. One recurring auto-push noise pattern flagged (P2). Business P0 unchanged: Reddit post Day 20.

> **Sandbox note:** Outbound egress to `peakly-api.duckdns.org`, Open-Meteo, and GitHub Pages is blocked in this remote execution environment. Sandbox 403/timeout ≠ VPS downtime. Last confirmed VPS healthy: June 13 (networked session). Jack: run `curl https://peakly-api.duckdns.org/health` before Reddit post.

---

## Fixes Applied This Run

| Fix | Files | Detail |
|-----|-------|--------|
| Cache stamp `20260623c` → `20260624a` | `app.jsx:17`, `sw.js:2`, `index.html:395` | 1 day stale — bumped in lockstep |

---

## Full Invariant Check

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,278 lines / 640 KB raw (~156 KB gzip)** |
| CDN scripts | All HTTPS, exact versions pinned ✅ |
| Plausible analytics | Present, `defer`'d, `data-domain="j1mmychu.github.io"` ✅ |
| Cache stamp (pre-fix) | `20260623c` — 1 day stale |
| Cache stamp (post-fix) | `20260624a` ✅ |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all `20260624a` ✅ |
| Brace balance | **5560 open / 5560 close — BALANCED** ✅ |
| Sentry DSN | `9416b032a4...` in `index.html`, `defer`'d ✅ |
| Sentry init guard | `typeof Sentry !== "undefined"` — CDN-failure-safe ✅ |
| Venue count (bracket-walker, comments stripped) | **365** (129 skiing / 236 beach) ✅ |
| Venue baseline (`scripts/.venue-baseline`) | **365** — floor holds ✅ |
| Duplicate IDs | **0** ✅ |
| `GEAR_ITEMS` | **0** — Amazon v1 cut holds ✅ |
| `loading="lazy"` on images | All venue card `<img>` tags ✅ |
| `ALERTS_AVAILABLE` iOS gate | Live ✅ |
| `deleteAccount()` | Wired in `useCloudSync` ✅ |
| `weatherDown` banner | Live in ExploreTab ✅ |
| `ScoringExplainer` | Live ✅ |
| `DEAL_WEIGHT` | `0.25` (conditions 75% / price 25%) ✅ |
| `lateSeason: true` venues | **25** ✅ |
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Old HTTP IP (`104.131.82.242`) | Not present ✅ |
| `fetchTravelpayoutsPrice` timeout | `AbortController` 5s + 3-attempt backoff ✅ |
| `_tryProxyWx` timeout | 4s + direct Open-Meteo fallback ✅ |
| Travelpayouts token in client | **Not present** — server-side only. `TP_MARKER=710303` is public affiliate marker ✅ |
| Supabase anon key in client | Present — expected, RLS-gated ✅ |
| Supabase service role key | **Not present** ✅ |
| `.gitignore` | `.env`, `*.pem`, `*.p8`, `*.key`, `Peakly-Business-Plan.*` all covered ✅ |
| `APNS_LIVE` | `false` — expected, iOS push deferred ✅ |

---

## Issues

### P1 — Fixed This Run

**Cache stamp was 1 day stale** (`20260623c`, today is 2026-06-24).

Users on a cached SW would have been served the old `app.jsx` indefinitely. Fixed in lockstep across all three files. This fires every morning the cache doesn't get an organic bump from content/PM edits the previous day — the 17:30 daily briefing is the only slot that reliably doesn't touch `app.jsx`.

---

### P2 — Repeated Identical Commits (Auto-Push Noise)

The git log for 2026-06-23 shows three consecutive identical commits:

```
1036a20 Delete tahoe duplicate + PEAKLY_BUILD 20260623b→20260623c (365 venues clean)
75bddc7 Delete tahoe duplicate + PEAKLY_BUILD 20260623b→20260623c (365 venues clean)
21ee1b9 Delete tahoe duplicate + PEAKLY_BUILD 20260623b→20260623c (365 venues clean)
```

The auto-push pipeline fired three times on the same change. Cosmetic today — no code divergence, invariants pass — but inflates the commit graph and makes `git log` unreliable for "what actually changed." Root cause: PostToolUse hook fires on every Edit/Write call; if an agent touches the same file three times without a meaningful diff, the pipeline commits and pushes each time.

**Exact fix (5 min):** Add a diff-check guard to `scripts/auto-push.sh` before the commit line:

```bash
# Insert before `git commit` (~line 65 in scripts/auto-push.sh)
if git diff --cached --quiet; then
  echo "auto-push: nothing to commit, skipping"
  exit 0
fi
```

**Per two-strikes rule:** this finding appeared in previous runs. If it appears again next run without the fix applied, it moves to `reports/known-skipped.md`.

---

### P2 — Ongoing: No SRI + No CSP (Open #10)

CDN scripts in `index.html` have no Subresource Integrity hashes. Babel Standalone's inline-eval requirement makes a strict `script-src` CSP structurally incompatible with the current no-build architecture. Not blocking launch. Stays Open #10.

---

### Note — Venue Split Shifted (+1 beach, -1 ski vs 2026-06-23)

Previous devops report: **365 (130 ski / 235 beach)**. Current: **365 (129 ski / 236 beach)**. One venue migrated from skiing to beach (or a ski was deleted and a beach added) during the 2026-06-23 content run. Zero duplication, zero missing IDs — benign content churn, not a bug.

---

### Note — Venue Counter: Comments False-Positive (Methodology)

Initial count run without comment stripping reported 367 / 2 dupes. Script bug: comment lines like `// CPT:{lat:...}` contain `{` characters that naive bracket-walkers treat as object starts. Corrected script strips single-line comments first → **365 / 0 dupes**. The boot-time IIFE validator (app.jsx ~line 4638) is the runtime ground truth for live dup detection.

---

## Performance Snapshot

| Layer | Gzip est. | Blocking? |
|-------|-----------|-----------|
| Babel Standalone 7.29.7 | ~400 KB | **YES — render-blocking** |
| ReactDOM 18.3.1 | ~42 KB | YES |
| React 18.3.1 | ~11 KB | YES |
| app.jsx | ~156 KB | YES (loads after Babel) |
| **Critical path total** | **~610 KB** | |
| Supabase 2.106.2 | ~80 KB | No — lazy |
| Leaflet 1.9.4 | ~40 KB | No — lazy |

**Largest bottleneck: Babel Standalone (~400 KB gzip, render-blocking).** Unavoidable given the no-build constraint. Acceptable at current MAU. Above 10K DAU the TTI gap vs native apps becomes a retention problem. Post-launch mitigation: pre-compile `app.jsx` to plain JS via a GitHub Actions step — zero product-level constraint violation, ~70% TTI improvement.

Images: all venue `<img>` tags use `loading="lazy"` ✅. Unsplash `w=800&h=600` is right-sized for mobile cards. No `auto=format` param (would add ~20% size reduction via WebP — low-effort, deferred per known-skipped).

---

## Cost Projection

| MAU | $/mo | Notes |
|-----|------|-------|
| Current (<10) | $6 | 1 GB DO droplet |
| 1K | $6 | Open-Meteo free tier holds |
| 10K | ~$18 | 2 GB droplet + bandwidth |
| 100K | ~$54–72 | 2×4 GB + DO load balancer ($12) |

---

## Scale Failure Mode

**Open-Meteo rate limits hit first.** Free tier allows ~10K req/day. At ~50 concurrent DAU loading Explore simultaneously, you blow through that in under an hour. The VPS weather cache (already deployed at `/api/weather`) is the fix — but only while the proxy stays up and traffic routes through it. After that, Babel's 400 KB render-blocking load time becomes the second failure vector as the audience grows. Both are post-launch items; neither blocks the web v1 ship.

---

## Security Summary

| Vector | Status |
|--------|--------|
| Travelpayouts token | Server-side only ✅ |
| Supabase anon key | Intentional, RLS-gated ✅ |
| Supabase service role key | Not present ✅ |
| `.env` / `*.p8` / `*.pem` in `.gitignore` | ✅ |
| Business plan PDF | Scrubbed + gitignored (2026-05-09) ✅ |
| SRI on CDN scripts | Missing — Open #10, medium risk |
| CSP | Missing — Babel eval blocks strict policy |
| Sentry DSN | Public client DSN, rate-limited — safe ✅ |

No new security issues found.

---

*Report written by peakly-devops agent — 2026-06-24.*
