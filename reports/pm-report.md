# PM Report — 2026-03-31 (v19)

*Product Manager agent — daily report*
*Today is Reddit launch day. Hard date holds.*

---

## Shipped Since Last Report (2026-03-29)

| Commit | Verdict |
|--------|---------|
| `fix: repair broken flight booking button URL construction` | **Concerning.** A regression was introduced by the "flight pricing fixes" commit and had to be immediately patched. Indicates the flight URL code is fragile and has no test coverage. The fix is correct but the pattern is worrying on launch day. |
| `perf: flight price caching, priority fetching, progressive loading` | Correct. Reduces VPS load and makes price display feel faster. Good call, well-timed. |
| `feat: airport setup modal in onboarding flow` | Good UX improvement. Separates airport setup from the main onboarding flow. Reduces abandonment for users who skip onboarding. |
| `feat: add proxy server with /api/flights/latest and /api/alerts routes` | **Critical deployment dependency.** This commit added `server/proxy.js` to the repo — but has it been deployed to the VPS? If not, `/api/flights/latest` returns 404 for all users. Flight pricing is broken until Jack SSHes into 198.199.80.21 and deploys this file. This is the biggest risk entering Reddit launch today. |
| `fix: flight pricing accuracy - from prices, latest endpoint, timestamps, exact date deep links` | Correct direction. "from $X" language with last-seen timestamps is accurate and reduces user disappointment at booking. |
| `feat: expand venues from 2226 to 3726 (+1500 surf/ski/beach)` | Acceptable. Timing is fine — 3,726 surf/ski/beach venues fits the Top 3 focus for Reddit launch. |
| `feat: add Capacitor + push notification infrastructure` | **DEFER signal.** This is Phase 2 infrastructure shipped on the day of Phase 1 launch. Not wasted but added complexity on the riskiest day. Server-side polling endpoint is still unbuilt — infrastructure is half-done. |

**Opportunity cost flag:** At least 3 of 7 commits on 2026-03-29 were Phase 2 work (Capacitor, proxy alert routes). The two P0/P1 bugs — TP_MARKER and venue.facing — were not touched. Wrong priority order the day before launch.

---

## Bug Triage — Reddit Launch Day Status

| Bug | Severity | Status | Action |
|-----|----------|--------|--------|
| **TP_MARKER = "YOUR_TP_MARKER"** | **P0** | ❌ STILL UNSET — Day 9 | Jack: tp.media → Dashboard → Markers → copy ID → `app.jsx:5316` → push. 5 minutes. Every flight click since day 1 has earned $0. Reddit sends potentially 500+ flight clicks today. All $0 without this fix. |
| **proxy server not confirmed deployed** | **P0** | ❓ UNKNOWN | Jack: `curl https://peakly-api.duckdns.org/api/flights/latest?origin=JFK&destination=BCN`. If 404: deploy server/proxy.js per README. Flight prices broken for all Reddit visitors until confirmed live. |
| **venue.facing ?? 270 swell direction bug** | **P1** | ❌ Still in code (`app.jsx:4683`) | Dev: Remove `spotFacing`/`swellAlignment` block. Revert to height + period scoring only. 30 min. East-facing breaks (J-Bay, Cabarete, Brazilian coast) scored incorrectly. A r/surfing user checking their home break will notice and call it out. |
| **peakMonths dead code** | **P3** | ❌ `app.jsx:4987` | Dev: Remove 5-line block after Reddit. Not urgent today. |
| **React/ReactDOM unpinned** | **P2** | ❌ Still `@18` | Pin to `@18.3.1` in index.html. 2-min fix. Low probability but catastrophic if React ships a breaking change on launch day. |

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| TP_MARKER placeholder | **Jack** — 5 min at tp.media dashboard | **RIGHT NOW. Before Reddit post goes up.** |
| VPS proxy deployment of server/proxy.js | **Jack** — SSH to VPS, scp + pm2 restart | **RIGHT NOW. Flight prices may be 404ing since 2026-03-29.** |
| venue.facing swell direction revert | **Dev** — 30 min | **Before Reddit post goes up** |
| LLC approval | External | Unblocks REI, Backcountry, GetYourGuide, Stripe |

---

## This Week's Top 3 Priorities

### 1. SHIP NOW: Confirm TP_MARKER + VPS proxy deployment — Jack, 15 min total

Two Jack actions that must happen before the Reddit post goes live:

**TP_MARKER (5 min):** Log into tp.media dashboard → Markers → copy marker ID → open `app.jsx` → line 5316 → replace `"YOUR_TP_MARKER"` with real ID → push. If Reddit sends 500 users today and 20% click a flight link, that's 100 flight clicks × $0.00 = $0. With marker set, that's $15–40 from launch day alone. It has been 9 days.

**VPS proxy (10 min):** `curl "https://peakly-api.duckdns.org/api/flights/latest?origin=JFK&destination=BCN"`. If 200, you're good. If 404: `scp -r server/ root@198.199.80.21:/opt/peakly-proxy/ && ssh root@198.199.80.21 "cd /opt/peakly-proxy && npm install && pm2 restart peakly-proxy"`. The `server/proxy.js` commit may have added `/api/flights/latest` to the app before deploying the route to the VPS. If so, flight prices have been 404ing since 2026-03-29 20:44 PM — 36+ hours.

### 2. SHIP NOW: Fix venue.facing swell direction bug — Dev, 30 min

Remove lines 4683–4691 in app.jsx (the `spotFacing`/`swellAlignment` block). Revert surf scoring to height + period + wind only. The `venue.facing ?? 270` default is incorrect for all surf breaks that don't face west — which is roughly half of all surf spots globally. On a r/surfing thread, one surfer noticing their local break has a wrong score derails the launch. 30-minute surgical fix, zero downside risk.

### 3. SHIP: Reddit post — 9–11am ET today, r/surfing first

Hard date holds. The app is ready for its first 500 users. Post to r/surfing first (highest relevance for surf venue expansion), then r/skiing and r/solotravel over the following 48 hours. FOMO headline: specific venue, real window, real price. Author must be active in thread for the first 4 hours.

---

## Features REJECTED This Week

| Feature | Decision | Reasoning |
|---------|----------|-----------|
| **Trips + Wishlists tabs exposed** | **DEFER** | Built but hidden. Post-launch when core Explore → Detail → Book flow is validated. Adding tabs increases cognitive load for first-time Reddit visitors. |
| **Strike alerts server polling** | **DEFER** | Infrastructure half-built. Full push requires server polling + APNs + Expo Push. Phase 2 after 1K users validate via email waitlist. |
| **Amazon gear links for 5 zero-revenue categories** | **DEFER to week 2** | +$1.50–2.00 RPM but irrelevant to Reddit conversion. Ship after launch without disrupting momentum. |
| **Google Play Store via PWABuilder** | **DEFER to week 3** | $25, zero code changes — but focus on Reddit execution first. |
| **Dark mode** | **CUT** | Permanently. No signal this moves retention. Not in the next 6 months. |
| **Thumbs up/down feedback** | **CUT** | Research-backed scoring is the right path. Crowd validation introduces noise and requires backend. |

---

## Success Criteria

| Metric | 5K users (base case) | 8K users (upside case) |
|--------|---------------------|----------------------|
| Reddit launch | 200–300 upvotes | 500+ upvotes, cross-posted to r/travel |
| Email capture | 50+ emails from Reddit spike | 150+ emails → re-engagement at day 7 → 20% return rate |
| TP_MARKER | Set before launch | Set before launch (identical requirement) |
| VPS proxy | Confirmed live before post | Confirmed live before post (identical requirement) |
| Retention | 10% of Reddit visitors return week 2 | 20% return via email re-engagement |
| Affiliate clicks | 50+ Travelpayouts clicks week 1 | 150+ clicks + TP_MARKER set = first commission check |

**Verdict:** 8K vs 5K is a Reddit execution + email re-engagement question, not a features question. The app is sufficient. TP_MARKER and VPS proxy confirmation decide the revenue outcome. venue.facing decides the credibility outcome. Everything else is noise today.

---

## One Product Risk Nobody Is Talking About

**The proxy server commit introduced a deployment dependency that may have broken flight pricing for all users since 2026-03-29.**

`feat: add proxy server with /api/flights/latest and /api/alerts routes` committed `server/proxy.js` on 2026-03-29 at 20:44 PM. The app.jsx was simultaneously updated to call `/api/flights/latest`. If the existing VPS proxy didn't have this route — and there's no git history or deployment log showing it did — then flight prices have been 404ing for 36+ hours before Reddit launch.

UptimeRobot monitors the `/health` endpoint. It does not monitor `/api/flights/latest`. This failure would be invisible to monitoring. Users would see the "Estimated prices" fallback banner — which looks like a data problem, not a broken endpoint.

**Corrective action before Reddit post:**
1. Jack: `curl "https://peakly-api.duckdns.org/api/flights/latest?origin=JFK&destination=BCN"` — right now
2. If 404: deploy server/proxy.js per README (10 min)
3. After launch: add `/api/flights/latest` route check to UptimeRobot

---

## Decisions Made This Report

| Date | Decision |
|------|----------|
| 2026-03-31 | **TP_MARKER: P0. Jack must set before Reddit post. 9 days = $0 flight commissions.** |
| 2026-03-31 | **VPS proxy deployment: P0. Confirm `/api/flights/latest` live before post goes up.** |
| 2026-03-31 | **venue.facing swell fix: SHIP before Reddit post. 30 min. Credibility risk on r/surfing.** |
| 2026-03-31 | **Trips + Wishlists tabs: DEFER. Post-launch. Core flow first.** |
| 2026-03-31 | **Strike alerts server: DEFER to Phase 2. Finish after user validation.** |
| 2026-03-31 | **Reddit post: 9–11am ET today. r/surfing first. Non-negotiable.** |

---

## Reddit Launch Day Checklist (Do In Order)

**Before post goes live:**
- [ ] Jack: set TP_MARKER (`app.jsx:5316`) — 5 min
- [ ] Jack: `curl https://peakly-api.duckdns.org/api/flights/latest?origin=JFK&destination=BCN` — confirm 200
- [ ] If 404: deploy server/proxy.js to VPS — 10 min (see server/README.md)
- [ ] Dev: remove venue.facing block (`app.jsx:4683–4691`) + push — 30 min
- [ ] Bump cache buster in index.html after venue.facing fix

**Post live:**
- [ ] Author active in thread for 4 hours
- [ ] Monitor Plausible real-time dashboard
- [ ] Monitor VPS health: `peakly-api.duckdns.org/health`
- [ ] Cross-post to r/skiing + r/solotravel within 24 hours if ≥ 50 upvotes

**Within 48 hours:**
- [ ] Email re-engagement setup (Loops.so or Mailchimp) for new signups
- [ ] Jack: REI Avantlink signup (30 min — unlocks $6.16 RPM)
- [ ] Add `/api/flights/latest` route to UptimeRobot monitoring

---

*Next report: 2026-04-01 — post-Reddit launch retrospective | Filed by PM agent (v19)*
