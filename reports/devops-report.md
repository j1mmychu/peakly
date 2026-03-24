# DevOps & Reliability Report: 2026-03-23 (v5)

## System Status: DEGRADED

Two of three services have issues. The GitHub Pages frontend serves HTML but app.jsx may have a Babel parse error (error handler detected in page content). The flight proxy is completely down. Open-Meteo returned a 429 (rate-limited), which is transient and not a Peakly-side issue.

## Uptime

| Service | Status | Detail |
|---------|--------|--------|
| GitHub Pages frontend | PARTIAL | Page loads, but Babel error handler text detected — app may not render |
| Flight proxy (104.131.82.242:3001) | DOWN | ECONNREFUSED — VPS not responding on port 3001 |
| Open-Meteo Weather API | RATE-LIMITED | HTTP 429 — transient, not a Peakly issue |

## HTTPS Status

- **Frontend:** HTTPS active via GitHub Pages (j1mmychu.github.io/peakly)
- **Flight proxy:** HTTP only (port 3001, no TLS). Still a tech-debt item — should be behind HTTPS reverse proxy or Cloudflare tunnel.

## Recent Changes (last 10 commits)

```
da6ba3d Cache-bust app.jsx + always show Best Right Now section
089dfc6 Fix missing commas in 19 venue entries causing Babel crash
1dd1308 Add .nojekyll to fix GitHub Pages deployment
1f7cd7d Add .nojekyll to fix GitHub Pages deployment
6747c9b Remove score borders from GoVerdictBadge and Best Right Now cards
75c4bdf Add photos to Best Right Now carousel and GuidesTab featured cards
0027511 Sync agent reports
aeba256 UX: kill score borders, fix card padding, photos in similar venues
bad3ae8 Fix duplicate photo fields causing Babel parse error
0567fcf add photos to all venues and cleanup
```

Key: Commit `089dfc6` fixed missing commas in 19 venue entries that caused a Babel crash. Commit `da6ba3d` added cache-busting (`?v=20260323b`) to app.jsx in index.html. Multiple commits dealt with Babel parse errors from venue data issues.

## Performance

| Metric | Value |
|--------|-------|
| app.jsx lines | 5,446 |
| app.jsx size | 364,885 bytes (~356 KB) |
| Cache-bust version | `?v=20260323b` |

The file has grown from the original ~5,057 lines noted in CLAUDE.md to 5,446 lines (+389 lines). Still a single-file SPA — no build step, client-side Babel transpilation. At 356 KB this remains manageable for CDN delivery but is trending upward.

## Security

| Check | Result |
|-------|--------|
| API tokens in client code | CLEAN — none found |
| Secrets / passwords | CLEAN — none found |
| AFFILIATE_ID placeholders | CLEAN — no placeholder strings detected (previously noted as TODO) |
| Proxy token handling | OK — comment on line 999 confirms token is server-side only |

One venue is named "Kelingking Secret Beach" (contains "secret" in its title, not a credential). No actual secrets, tokens, or API keys are exposed in app.jsx.

## Decision Made

**No action taken on flight proxy.** The VPS at 104.131.82.242:3001 is returning ECONNREFUSED, meaning the proxy process is not running or the server is down. This has persisted across multiple report cycles. Recommendation: SSH into the VPS, check if the Node process crashed, and restart it. Consider adding a process manager (pm2) and uptime monitoring (UptimeRobot).

**No action on frontend Babel error.** The WebFetch tool picked up the error handler HTML, but this may be the fallback `<noscript>`-style content that always exists in index.html. The recent commit `089dfc6` specifically fixed missing commas causing a Babel crash. Need browser verification to confirm the app actually renders.

## Cost

| Item | Monthly Cost |
|------|-------------|
| GitHub Pages | Free |
| DigitalOcean VPS (flight proxy) | ~$6/mo (basic droplet) |
| Open-Meteo API | Free tier |
| Google Fonts CDN | Free |
| Domain (if any) | N/A — using github.io subdomain |
| **Total** | **~$6/mo** |
