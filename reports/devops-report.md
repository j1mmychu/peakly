# DevOps & Reliability Report — 2026-03-23

## System Status: DEGRADED

Two issues persist from last report: flight proxy is DOWN, and HTTPS mixed content is NOT resolved. The live site loaded but WebFetch reported a possible JSX parse error in the error fallback handler — needs manual browser verification.

---

## Uptime & Health Checks

| Service | Status | Response Time | Notes |
|---------|--------|---------------|-------|
| GitHub Pages (frontend) | UP (with caveat) | ~1s | Page loaded but error fallback handler may have fired — verify in browser |
| Flight Proxy (104.131.82.242:3001) | **DOWN** | N/A | ECONNREFUSED — same as last report. Server is not accepting connections. |
| Open-Meteo Weather API | UP | ~1s | Returned valid JSON (9.4C max for Innsbruck area, 2026-03-24) |

**Flight proxy has been down for at least 2 consecutive reports.** This means all flight pricing in the app is broken — users see no prices or fallback estimates only.

---

## HTTPS Status: NOT DONE (CRITICAL)

The flight proxy URL in `app.jsx` line 1000 is still:
```
const FLIGHT_PROXY = "http://104.131.82.242:3001";
```

Since the frontend is served over HTTPS (GitHub Pages), all fetch requests to this HTTP endpoint are **blocked by the browser as mixed content**. Even if the proxy comes back online, flight data will not load for users.

**Required actions (unchanged from last report):**
1. Get the proxy server running again (SSH into VPS, check if Node process crashed)
2. Install Let's Encrypt / Certbot on the VPS or put it behind Cloudflare
3. Update `FLIGHT_PROXY` to use `https://`
4. Consider using a domain name instead of bare IP

---

## Recent Changes (since last report)

From `git log --oneline -5`:
```
eaee1c7 Fix tanning category, affiliate links, share URLs, OG tags
8748abb Add agent team prompts and reports folder
2c148c5 Phase 1: fix mixed content timeout, est. price labels, city names, category pills, CLAUDE.md interaction rules
6c6015d Add Claude Code improvement spec
bbca78f Fix GuidesTab names, restore all category pills, add hero CTA, auto-refresh weather
```

**Key changes verified:**
- OG tags: ADDED to `index.html` (og:title, og:description, og:type, og:url, og:image, og:site_name + Twitter Card tags). All point to `j1mmychu.github.io/peakly/`. Note: `og:image` references `og-image.png` — verify this file actually exists in the repo.
- Share URLs: `peakly.app` references REMOVED from `app.jsx`. Only remain in `app.jsx.bak` (backup file), `peakly-native/` (separate native app), and old reports. Current app.jsx is clean.
- AFFILIATE_ID placeholders: REMOVED from app.jsx (no matches found). Previously flagged as a TODO — appears resolved.

---

## Performance

| Metric | Value |
|--------|-------|
| app.jsx lines | 5,413 |
| app.jsx size | 353 KB (345 KB uncompressed) |
| Estimated load time | ~2-4s on 4G (Babel transpile + 353KB parse) |
| Files in project | Single-file SPA, no build step |

The file has grown from ~5,057 lines (per CLAUDE.md) to 5,413 lines — a 7% increase. At 353KB of JSX being transpiled client-side by Babel, initial load performance is a growing concern. Not urgent yet, but worth monitoring.

---

## Security

| Check | Status |
|-------|--------|
| API tokens in app.jsx | CLEAN — no tokens, keys, or secrets found |
| Travelpayouts token in codebase | CLEAN — not present in app.jsx |
| Travelpayouts token in git history | **STILL EXPOSED** (commit f25c801) — Jack was told to rotate. Verify rotation happened. |
| AFFILIATE_ID placeholders | CLEAN — removed |
| SENTRY_DSN | Empty string (placeholder, not a security issue) |
| Proxy IP hardcoded | YES — `104.131.82.242` in app.jsx line 1000. Not a secret per se, but exposes infra. |

**Reminder:** The Travelpayouts API token was found in git history (commit f25c801) in the previous report. Even though it's not in the current codebase, git history is permanent. The token MUST be rotated on the Travelpayouts dashboard. If Jack hasn't done this yet, escalate.

---

## Decision Made

**Decision: Prioritize getting the flight proxy back online before any new feature work.** The proxy has been down for multiple report cycles. Flight pricing is a core feature — without it, the "cheap flights align" value prop is completely broken. Next steps: SSH into VPS, diagnose the crash, restart the Node process, and set up a process manager (pm2) to prevent future crashes.

---

## Cost

| Item | Monthly Cost |
|------|-------------|
| DigitalOcean VPS (1GB RAM) | ~$6/mo |
| GitHub Pages | Free |
| Open-Meteo API | Free |
| Travelpayouts API | Free (affiliate) |
| Domain (peakly.app, if owned) | ~$12/yr (~$1/mo) |
| **Total** | **~$7/mo** |

---

## Action Items (Priority Order)

1. **P0 — Fix flight proxy.** SSH into 104.131.82.242, check why Node is down, restart with pm2 for auto-restart.
2. **P0 — Rotate Travelpayouts API token.** If not already done, do it NOW. Old token is in git history.
3. **P1 — HTTPS for proxy.** Install Certbot or put behind Cloudflare. Mixed content blocks all flight requests.
4. **P1 — Verify og-image.png exists.** OG tags reference it but I didn't confirm the file is in the repo.
5. **P2 — Verify live site loads cleanly.** WebFetch flagged a possible parse error — open in a real browser to confirm.
6. **P2 — Monitor app.jsx growth.** 5,413 lines / 353KB. Consider code-splitting strategy if it reaches 7K+ lines.
