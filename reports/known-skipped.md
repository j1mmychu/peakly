# Known Skipped Findings

Findings that have been reported on three+ consecutive runs without action.
Per the two-strikes rule (`tasks/agents/devops.md`), each agent stops
re-surfacing a finding once it lands here unless severity escalates.
Daily-briefing reads this file and won't echo these in the digest.

Format: `<YYYY-MM-DD> <role> — <one-line finding> — reason: <why we're skipping>`

---

- 2026-05-04 devops — Stand up UptimeRobot monitors on GH Pages + VPS proxy — reason: not a code diff (requires external account signup and dashboard config); recommended on 04-24, 05-01, 05-03; Jack will set up when he has 5 min, agent stops nagging.
- 2026-05-04 devops — Add SRI integrity= attributes to React/ReactDOM/Babel unpkg scripts — reason: not Rule 1 (multi-line + requires hash generation against the live CDN bytes; SRI also bricks the page if unpkg serves a normalized variant). Hash generation block is in `reports/inputs/devops-2026-05-01.md`. Re-flag if a CDN compromise hits the news.
- 2026-05-04 devops — Add Content-Security-Policy meta tag to index.html — reason: not Rule 1 (multi-line meta block, requires regression-test that Babel `unsafe-eval` still runs across browsers). Full CSP block is in `reports/inputs/devops-2026-05-01.md`. Re-flag if CSP becomes a launch blocker.
- 2026-05-04 devops — Server-side Open-Meteo weather cache in proxy.js (collapses N client requests to 229 cached proxy requests) — reason: not Rule 1 (4-hour change spanning proxy.js + client `fetchWeather`/`fetchMarine`). Pre-500-MAU mitigation, not urgent at <10 MAU. Full code block is in `reports/inputs/devops-2026-05-01.md`. Re-flag the moment MAU crosses 100 or any HN/Reddit post lands.
- 2026-05-04 devops — Persist `_alerts` Map across proxy restarts (file-backed JSON in `server/data/alerts.json`) — reason: not Rule 1 (multi-function VPS-side change requiring SSH deploy). Full code block is in `reports/inputs/devops-2026-05-01.md`. Re-flag once the alerts polling worker exists — persistence is moot until something reads the Map.
- 2026-05-04 devops — Build alerts polling worker that reads `_alerts` Map and fires push when venue hits target — reason: feature gap, not infra debt; tracked in CLAUDE.md "Open" section. Stops being a devops finding.
- 2026-05-04 pm — "Jack: name a Reddit launch date" — flagged in pm-2026-05-01 + pm-2026-05-03; the 35+ days of "no date set" is itself an implicit decision (Jack is waiting on something — likely LLC, or an internal readiness bar that's not encoded in agent prompts). PM stops nagging. Launch readiness criteria (clean data, proxy live, success metrics) still get tracked; the date itself is Jack's call and PM accepts that. Re-flag only if a concrete launch date is named and slips, or if a competitor launches a "weekend score for ski/beach" product first.
