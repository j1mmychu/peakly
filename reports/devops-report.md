# DevOps & Reliability Report: 2026-03-24

## System Status: STABLE (code-level)

No new Babel parse errors detected. No secrets exposed in client code. File size unchanged from yesterday. Flight proxy status unknown (no live HTTP checks possible from this environment — VPS at 104.131.82.242:3001 remains an open concern from prior reports).

---

## File Size

| Metric | Value | Delta vs Yesterday |
|--------|-------|--------------------|
| app.jsx lines | 5,446 | No change |
| app.jsx size | 364,885 bytes (~356 KB) | No change |
| Cache-bust version | `?v=20260323b` | No change — consider bumping if new deploy happens |

File is stable. No bloat introduced today. Single-file architecture intact.

---

## Security Audit

| Check | Result |
|-------|--------|
| API tokens / secrets in client code | CLEAN |
| Passwords or credentials | CLEAN |
| `AFFILIATE_ID` placeholders | CLEAN — none found |
| Sentry DSN | EMPTY — `""` on line 6, still TODO |
| Travelpayouts token | CLEAN — server-side on VPS proxy only |
| `secret` keyword matches | Benign — "Kelingking Secret Beach" (venue name) and "local secrets" (copy), not credentials |

No security regressions. The one persistent gap: **Sentry DSN is still unconfigured** (`SENTRY_DSN = ""`). Error logging to localStorage works, but no remote alerting. This is a pre-launch blocker for observability.

---

## index.html Audit

| Check | Result |
|-------|--------|
| OG / Twitter meta tags | PRESENT — title, description, image all set |
| Viewport / mobile meta | PRESENT — `user-scalable=no` |
| Theme color | PRESENT — `#0284c7` |
| React 18 CDN | OK — unpkg, production build |
| Babel Standalone 7.24.7 | OK — pinned version |
| Cache-bust on app.jsx | PRESENT — `?v=20260323b` |
| Babel error fallback script | PRESENT — shows friendly error UI on SyntaxError |
| PWA manifest | MISSING — no `<link rel="manifest">` |
| Canonical URL tag | MISSING — could help SEO |
| Plausible / GA4 analytics | MISSING — no analytics script |

Three gaps persist: **no PWA manifest**, **no analytics**, **no canonical URL**. All are on the pre-launch checklist and unblocked — can ship any time.

---

## Analytics Status

Neither Plausible nor GA4 is present in `index.html` or `app.jsx`. This means:
- Zero visibility into actual users, sessions, or conversions
- Cannot measure the impact of any launch campaign
- On the pre-launch checklist as unblocked — this should ship before any Reddit/TikTok push

**Recommendation:** Add Plausible script to `index.html` in the next session. Takes ~5 minutes, unblocked, high value.

---

## Recent Commits (last 10)

```
fb8970b Sync agent reports
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

Recent history shows a Babel crash fix cycle that is now resolved. No new high-risk commits. Agent report syncs are the only activity in the last cycle.

---

## Branch Status

- Active branch: `master` (GitHub Pages deploys from this)
- No `main` branch exists on remote — all pushes go to `master`
- 22 commits exist on a detached HEAD (likely from a prior claude/ session) — not connected to any branch. Not a problem unless work needs to be recovered.

---

## VPS / Flight Proxy

Cannot verify live status from this environment. Based on previous reports, the proxy at `104.131.82.242:3001` has been in an inconsistent state (ECONNREFUSED reported on 2026-03-23). The app has a 5-second timeout + "Estimated prices" fallback banner when the proxy is unreachable — users are not blocked, but live flight prices are unavailable.

**Persistent recommendation:** SSH into VPS, ensure Node process is running under `pm2`, add UptimeRobot monitoring. HTTPS (Cloudflare or Let's Encrypt + nginx) is still missing — mixed content blocks flight prices in browsers when served over HTTPS.

---

## Decisions Made

- **No code changes this session.** All findings are observational. No new bugs or regressions detected.
- **Analytics is the highest-value unblocked item.** Before any launch campaign, Plausible must be added so traffic can be measured. Flagging for next coding session.
- **Cache-bust version `?v=20260323b` not bumped today** — no new app.jsx deploy, so no change needed. If a deploy happens without a version bump, browsers may serve stale Babel-transpiled cache.

---

## Cost Estimate

| Item | Monthly Cost |
|------|-------------|
| GitHub Pages | Free |
| DigitalOcean VPS (flight proxy) | ~$6/mo |
| Open-Meteo API | Free |
| Google Fonts CDN | Free |
| Plausible analytics (when added) | $9/mo (or free self-hosted) |
| **Total (current)** | **~$6/mo** |
| **Total (with Plausible cloud)** | **~$15/mo** |
