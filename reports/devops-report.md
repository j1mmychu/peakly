# DevOps & Reliability Report: 2026-03-24

## System Status: DEGRADED (unchanged from yesterday)

No code changes landed overnight. File size is identical to yesterday. The flight proxy remains the primary reliability risk.

## Uptime

| Service | Status | Detail |
|---------|--------|--------|
| GitHub Pages frontend | LIKELY OK | .nojekyll is in repo; Babel error from yesterday was likely the error-handler HTML, not a real crash |
| Flight proxy (104.131.82.242:3001) | UNKNOWN (was DOWN) | ECONNREFUSED reported yesterday; no live checks possible today — still flagged |
| Open-Meteo Weather API | OK (assumed) | Free, no key, rate-limit from yesterday was transient |

## Performance

| Metric | Value | Delta vs Yesterday |
|--------|-------|--------------------|
| app.jsx lines | 5,446 | 0 (unchanged) |
| app.jsx size | 364,885 bytes (~356 KB) | 0 (unchanged) |
| Cache-bust version | `?v=20260323b` | Not updated — still shows yesterday's date |

**Note:** The cache-bust query string in `index.html` is `?v=20260323b`. It was not updated today. This is fine since there were no app.jsx changes — browsers will serve the cached file correctly. If a code change ships today, update this version string.

## Security

| Check | Result |
|-------|--------|
| API tokens in client code | CLEAN — none found |
| Secrets / passwords | CLEAN — none found |
| AFFILIATE_ID placeholders | CLEAN — 0 occurrences in app.jsx (previously resolved) |
| Sentry DSN | EMPTY — `SENTRY_DSN = ""` on line 6; error monitoring is inactive |
| Proxy token handling | OK — confirmed server-side only; not in client code |

The one outstanding security-adjacent item is the empty `SENTRY_DSN`. This doesn't expose anything, but means zero visibility into production crashes. If the app throws an uncaught error for a user, it's invisible. Sentry has a free tier — this should be filled in once the project has a Sentry account.

## Recent Changes (last 10 commits)

```
fb8970b Sync agent reports          ← newest (reports only, no code)
da6ba3d Cache-bust app.jsx + always show Best Right Now section
089dfc6 Fix missing commas in 19 venue entries causing Babel crash
1dd1308 Add .nojekyll to fix GitHub Pages deployment
1f7cd7d Add .nojekyll to fix GitHub Pages deployment
6747c9b Remove score borders from GoVerdictBadge and Best Right Now cards
75c4bdf Add photos to Best Right Now carousel and GuidesTab featured cards
0027511 Sync agent reports
aeba256 UX: kill score borders, fix card padding, photos in similar venues
bad3ae8 Fix duplicate photo fields causing Babel parse error
```

No code changes since `da6ba3d`. Stable baseline — good time for feature work.

## index.html Audit

- Structure: clean, no issues
- React 18 UMD + Babel Standalone 7.24.7 loaded via unpkg CDN — both pinned to exact versions (good)
- OG/Twitter meta tags: present and correct
- Babel parse error fallback handler: present on lines 48–60
- Favicon: inline SVG "P" character — functional but basic
- Missing: `<link rel="manifest">` for PWA — noted in backlog, not a DevOps blocker

## Decisions Made

**No action taken on flight proxy.** Proxy has been ECONNREFUSED for multiple days. This is the top reliability issue for the app. Flight pricing falls back to estimated values, so the app is functional but degraded. Recommended fix: SSH to VPS, check `pm2 list` or `ps aux | grep node`, restart the process, and install pm2 with `pm2 startup` to auto-restart on reboot.

**Cache-bust version not updated.** Since no app.jsx changes landed today, leaving `?v=20260323b` is correct — don't bump it unnecessarily.

**AFFILIATE_ID placeholders confirmed cleared.** Previously flagged in the backlog as present on line ~3786; confirmed today that 0 occurrences exist in app.jsx. Backlog item can be closed.

## Open Risk Items

| Risk | Severity | Action |
|------|----------|--------|
| Flight proxy DOWN | High | Restart Node process on VPS; add pm2 + UptimeRobot |
| HTTPS on VPS | Medium | Cloudflare tunnel or Let's Encrypt + nginx reverse proxy |
| SENTRY_DSN empty | Medium | Sign up for Sentry free tier, paste DSN |
| Cache-bust not automated | Low | Consider using git SHA or timestamp at deploy time |
| PWA manifest missing | Low | Add `manifest.json` + `<link rel="manifest">` |

## Cost

| Item | Monthly Cost |
|------|-------------|
| GitHub Pages | Free |
| DigitalOcean VPS (flight proxy) | ~$6/mo |
| Open-Meteo API | Free |
| Google Fonts CDN | Free |
| unpkg CDN (React, Babel) | Free |
| **Total** | **~$6/mo** |
