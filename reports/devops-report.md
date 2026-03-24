# DevOps & Reliability Report: 2026-03-23 (v3)

## System Status: DEGRADED

Two critical issues: site has a JSX syntax error (app won't render), flight proxy remains down.

---

## Uptime & Health Checks

| Service | Status | Details |
|---------|--------|---------|
| GitHub Pages (frontend) | **DOWN (syntax error)** | HTTP 200 but app fails to render — Babel can't parse `app.jsx`. Users see "Peakly failed to load" fallback. |
| Flight Proxy (104.131.82.242:3001) | **DOWN** | `ECONNREFUSED` — 3rd consecutive report with proxy down. Server not accepting connections. |
| Open-Meteo Weather API | **UP** | Returned valid JSON: 9.4C max for Innsbruck area (2026-03-24), ~0.03ms generation time. |

### Site is broken for all users
The error fallback fires on page load: "A syntax error was detected in app.jsx." Most likely introduced in commit `af6d5fa` (venue photos + Amazon affiliate tags) — the most recent deploy.

### Flight proxy down for 3+ report cycles
All flight pricing is non-functional. Even when the site is fixed, no prices will load.

---

## HTTPS Status: NOT RESOLVED

The flight proxy is still plain HTTP (`http://104.131.82.242:3001`). Since GitHub Pages serves over HTTPS, browsers block these requests as mixed content. Even if the proxy comes back online, flight fetches will fail silently.

**Recommendation:** Install Caddy as a reverse proxy on the VPS with automatic TLS. Takes ~10 minutes. Alternatively, Cloudflare Tunnel. This must happen before flight pricing can work for any user.

---

## Recent Changes (last 8 commits)

| Commit | Description |
|--------|-------------|
| `af6d5fa` | **Add venue photos, fix duplicate pipeline ID, add Amazon affiliate tags** (likely broke site) |
| `1be1df3` | Add Unsplash photo URLs to top 30 venues |
| `489fdd0` | Sync CLAUDE.md with full product vision and agent team |
| `eaee1c7` | Fix tanning category, affiliate links, share URLs, OG tags |
| `8748abb` | Add agent team prompts and reports folder |
| `2c148c5` | Phase 1: fix mixed content timeout, est. price labels, city names, category pills |
| `6c6015d` | Add Claude Code improvement spec |
| `bbca78f` | Fix GuidesTab names, restore all category pills, add hero CTA, auto-refresh weather |

**What shipped since last report:** 109 venues now have Unsplash photo URLs, duplicate pipeline venue ID fixed, Amazon affiliate tags added (`tag=peakly-20`), OG image updated to Unsplash URL, CLAUDE.md synced with full product vision.

---

## Performance

| Metric | Value | Change |
|--------|-------|--------|
| `app.jsx` lines | 5,437 | +24 from last report (5,413) |
| `app.jsx` size | 365,811 bytes (357 KB) | +12 KB from last report (345 KB) |
| Unsplash image URLs | 109 | New |
| Image loading strategy | `loading="lazy"` | Correct |

### Image Loading Assessment
109 Unsplash images with `loading="lazy"` is well-implemented:
- **Zero impact on initial page load** — lazy loading defers all image fetches until near-viewport.
- **Unsplash CDN** is fast and globally distributed. No bandwidth cost to Peakly.
- **No concern at this scale.** Even 500+ images would be fine with lazy loading.
- **Improvements available:** (1) Add `width`/`height` attributes to prevent Cumulative Layout Shift. (2) Use Unsplash URL params (`?w=400&q=80`) to serve optimized sizes instead of full resolution.

### File Size Note
357 KB of raw JSX transpiled in-browser by Babel takes ~1-2s on mobile. Acceptable for now but monitor — if file passes 500 KB, consider a build step.

---

## Security

| Check | Status |
|-------|--------|
| API tokens in client code | **Clean** — no tokens, keys, or secrets in `app.jsx` |
| Travelpayouts token | Server-side only (comment at line 999 confirms) |
| Travelpayouts token in git history | **STILL EXPOSED** (commit f25c801 from prior report) — rotation status unknown |
| AFFILIATE_ID placeholders | **Clean** — none remain |
| Amazon affiliate tag | `tag=peakly-20` present (not a secret, legitimate affiliate tag) |
| Sensitive keyword matches | Only benign: "Secret Beach" (venue name), "secrets" (UI copy) |

**Action needed:** Verify the Travelpayouts token was rotated. It was flagged in the previous report as exposed in git history.

---

## Decision Made

**Decision: All work stops until the site syntax error is fixed and deployed.**

The site is down for 100% of users. Nothing else matters until it renders again. Sequence:
1. Find and fix the syntax error in `app.jsx` (likely in venue data from `af6d5fa`)
2. Push to `main` to restore the site
3. Then fix the flight proxy (SSH into VPS, restart Node with pm2)
4. Then add HTTPS to the proxy

---

## Cost Estimate (Monthly)

| Item | Monthly Cost |
|------|-------------|
| DigitalOcean VPS (1GB RAM) | ~$6/mo |
| GitHub Pages | Free |
| Open-Meteo API | Free |
| Travelpayouts API | Free (affiliate) |
| Unsplash images | Free (hotlinked CDN) |
| Domain (if added) | ~$1/mo |
| **Total** | **~$7/mo** |

---

## Action Items (Priority Order)

1. **P0 — Fix `app.jsx` syntax error and redeploy.** Site is down for all users. Likely in commit `af6d5fa`.
2. **P0 — Get flight proxy back online.** SSH into VPS, diagnose crash, restart with pm2 for auto-recovery.
3. **P0 — Rotate Travelpayouts API token** if not already done. Token is in git history (commit f25c801).
4. **P1 — HTTPS for flight proxy.** Install Caddy with auto-TLS. Mixed content blocks all flight requests even when proxy is up.
5. **P2 — Optimize Unsplash images.** Add width/height attributes and use URL params for sized images.
6. **P2 — Monitor app.jsx size.** At 357 KB and growing. Plan for build step if it crosses 500 KB.
