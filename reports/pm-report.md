# Peakly PM Report — 2026-04-05 (v22)

**Filed by:** Product Manager agent  
**Status:** 3-day dead zone. Zero commits since April 2. TP_MARKER still unset on Day 12.

---

<!-- Previous report: PM Report — 2026-03-31 (v20) — Reddit launch day. -->
<!-- Archived content follows new report below. -->

---

---

## Shipped Since Last Report (2026-03-29 – 2026-03-31)

| Commit | Verdict |
|--------|---------|
| `fix: repair broken flight booking button URL construction` | **Concerning pattern.** A regression from "flight pricing fixes" was immediately patched. Flight URL code is fragile. Fix is correct but this is a near-miss on launch day. |
| `perf: flight price caching, priority fetching, progressive loading` | Correct. Reduces VPS load, makes price display feel faster. Top-10 priority fetch is exactly right. |
| `feat: airport setup modal in onboarding flow` | Good UX. Separates airport setup from 3-step onboarding. Reduces abandonment for users who skip main flow. |
| `feat: add proxy server with /api/flights/latest and /api/alerts routes` | **Deployment dependency risk.** `server/proxy.js` was committed to git but may not be deployed to VPS. If `/api/flights/latest` returns 404, flight prices are broken for all Reddit visitors. Must confirm before posting. |
| `fix: flight pricing accuracy - from prices, latest endpoint, timestamps, exact date deep links` | Correct. "from $X" language + last-seen timestamps reduce user disappointment at booking. |
| `feat: expand venues from 2226 to 3726 (+1500 surf/ski/beach)` | Acceptable. 3,726 surf/ski/beach venues fits the Top 3 focus for Reddit. |
| `feat: add Capacitor + push notification infrastructure` | **Phase 2 work shipped on Phase 1 launch day.** Not wasted but added complexity at the worst moment. Server-side polling endpoint still unbuilt — infrastructure is half-done. |
| DevOps: cache buster v=20260331a + SW bump | Correct housekeeping. |

**Opportunity cost flag:** TP_MARKER (P0) and venue.facing (P1) were not touched across any of these commits. Phase 2 work (Capacitor, proxy alert routes) was prioritized over the two known pre-launch blockers. Wrong priority order.

---

## Bug Triage — Reddit Launch Day Status

| Bug | Severity | Status | Action |
|-----|----------|--------|--------|
| **TP_MARKER = "YOUR_TP_MARKER"** | **P0** | ❌ STILL UNSET — Day 9 | Jack: tp.media → Markers → copy ID → `app.jsx:5316` → push. 5 min. Reddit sends ~500 users today. 20% click a flight = 100 clicks × $0.00 = $0. With marker set: $15–40 launch day revenue. |
| **VPS proxy deployment not confirmed** | **P0** | ❓ UNKNOWN | Jack: `curl "https://peakly-api.duckdns.org/api/flights/latest?origin=JFK&destination=BCN"`. If 404: deploy server/proxy.js per server/README.md. Flight prices may have been 404ing since 2026-03-29 20:44 PM — 36+ hours. |
| **venue.facing ?? 270 swell direction bug** | **P1** | ❌ Still in code (`app.jsx:4683`) | Dev: Remove `spotFacing`/`swellAlignment` block (~lines 4683–4691). Revert to height + period scoring only. 30 min. East-facing breaks (J-Bay, Cabarete, Brazilian coast) scored against west-facing default. A r/surfing user will notice and call it out. |
| **React/ReactDOM unpinned** | **P2** | ❌ Still `@18` | Pin to `@18.3.1` in index.html. 2-min fix. Low probability but catastrophic if React ships a breaking change today. |
| **peakMonths dead code** | **P3** | ❌ `app.jsx:4987` | Remove 5-line block post-Reddit. Not urgent. |

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| TP_MARKER placeholder | **Jack** — 5 min at tp.media | **BEFORE REDDIT POST. RIGHT NOW.** |
| VPS proxy deployment | **Jack** — confirm with curl, deploy if 404 | **BEFORE REDDIT POST. RIGHT NOW.** |
| venue.facing swell revert | **Dev** — 30 min | **Before Reddit post goes live** |
| LLC approval | External | Unblocks REI, Backcountry, GetYourGuide, Stripe |

---

## This Week's Top 3 Priorities

### 1. SHIP NOW: TP_MARKER + VPS proxy confirmation — Jack, 15 min

**TP_MARKER (5 min):** Line 5316 of app.jsx. Replace `"YOUR_TP_MARKER"` with real ID from tp.media. Push. This has been flagged for 9 consecutive days. Reddit brings the highest-intent traffic this app has ever seen. Without the marker, every flight affiliate click is $0 revenue and $0 attribution data.

**VPS proxy confirmation (10 min):** Run `curl "https://peakly-api.duckdns.org/api/flights/latest?origin=JFK&destination=BCN"`. If JSON with a price returns, you're live. If 404: the `server/proxy.js` commit added the route to git but not to the running server. Deploy per `server/README.md` — scp the files, npm install, pm2 restart. This is the most likely cause of flight prices being blank or showing fallback estimates since 2026-03-29.

### 2. SHIP BEFORE POST: venue.facing swell fix — Dev, 30 min

Remove the `spotFacing`/`swellAlignment` scoring block at `app.jsx:4683–4691`. The `venue.facing ?? 270` default applies west-facing swell alignment to all surf venues without an explicit `facing` field — the majority. East-facing breaks (J-Bay, Brazilian northeast coast, Cabarete) are penalized. A power-user on r/surfing checking their home break will get a wrong score and post about it. This is 30 minutes of deletion, not addition.

### 3. EXECUTE: Reddit post — 9–11am ET today, r/surfing first

Hard date holds. Post to r/surfing first (surf venue expansion just shipped). FOMO headline: specific venue, real window, real price. Author active in thread for 4 hours. Cross-post r/skiing + r/solotravel within 24 hours if ≥ 50 upvotes.

---

## Features REJECTED This Week

| Feature | Decision | Reasoning |
|---------|----------|-----------|
| **Trips + Wishlists tabs exposed** | **DEFER** | Core Explore → Detail → Book flow first. More tabs = confusion for first-time Reddit visitors. Post-1K users. |
| **Strike alerts server polling** | **DEFER** | Infrastructure half-built. Full push requires server polling + APNs + Expo Push. Phase 2 after demand validated. |
| **Amazon gear links (5 zero-revenue categories)** | **DEFER to week 2** | +$1.50–2.00 RPM, correct direction, irrelevant to Reddit conversion. Ship week 2. |
| **Google Play Store via PWABuilder** | **DEFER to week 3** | $25, zero code changes — focused execution on Reddit first. |
| **Dark mode** | **CUT** | Permanently. No signal this moves retention. Not in next 6 months. |
| **Thumbs up/down feedback** | **CUT** | Research-backed scoring is correct. Crowd validation introduces noise and requires backend. |

---

## Success Criteria

| Metric | 5K users (base case) | 8K users (upside case) |
|--------|---------------------|----------------------|
| Reddit launch | 200–300 upvotes, r/surfing | 500+ upvotes, cross-posted to r/travel + r/skiing |
| Email capture | 50+ emails from Reddit spike | 150+ emails → re-engagement email at day 7 → 20% return |
| TP_MARKER | Set before post | Set before post (identical requirement) |
| VPS proxy | Confirmed live before post | Confirmed live before post (identical requirement) |
| Retention | 10% of Reddit visitors return week 2 | 20% return via email re-engagement at day 7 |
| Affiliate clicks | 50+ Travelpayouts clicks week 1 | 150+ clicks + TP_MARKER set = first commission check |

**Verdict:** 8K vs 5K is not a features question. It's an execution question today. TP_MARKER set + VPS proxy live + venue.facing fixed + post quality + 4 hours of author presence = 8K path.

---

## One Product Risk Nobody Is Talking About

**The `server/proxy.js` commit may have introduced a silent endpoint failure running for 36+ hours.**

When `feat: add proxy server` was committed on 2026-03-29 at 20:44 PM, app.jsx was simultaneously updated to call `/api/flights/latest`. But the server code only exists in the git repo — not necessarily on the running VPS at 198.199.80.21.

UptimeRobot monitors `/health`. It does not monitor `/api/flights/latest`. A 404 on this route causes the flight pricing fetcher to fail silently, displaying the "Estimated prices" fallback banner — which looks like a data issue, not a broken endpoint. Invisible in monitoring.

If this is broken, every commit since 2026-03-29 that references "flight pricing fixed" has been shipped into a state where flight prices weren't actually loading. CLAUDE.md documents these as shipped and working.

**Action before Reddit post:** `curl "https://peakly-api.duckdns.org/api/flights/latest?origin=JFK&destination=BCN"`. 30 seconds.

---

## Decisions Made This Report

| Date | Decision |
|------|----------|
| 2026-03-31 | **TP_MARKER: P0. Jack must set before Reddit post. 9 days = $0 flight commissions.** |
| 2026-03-31 | **VPS proxy: P0. Confirm `/api/flights/latest` live before post. May be 404ing since 3/29.** |
| 2026-03-31 | **venue.facing: SHIP before Reddit post. 30 min. Credibility risk on r/surfing.** |
| 2026-03-31 | **Trips + Wishlists: DEFER. Post-launch. Core flow first.** |
| 2026-03-31 | **Strike alerts server: DEFER to Phase 2. Validate demand first.** |
| 2026-03-31 | **Reddit: 9–11am ET today. r/surfing first. Non-negotiable.** |

---

## Reddit Launch Day Checklist (Execute In Order)

**Before post goes live:**
- [ ] Jack: `curl "https://peakly-api.duckdns.org/api/flights/latest?origin=JFK&destination=BCN"` — confirm 200
- [ ] If 404: deploy server/proxy.js per server/README.md (10 min)
- [ ] Jack: set TP_MARKER in `app.jsx:5316` — 5 min
- [ ] Dev: remove venue.facing block (`app.jsx:4683–4691`) — 30 min
- [ ] Push all changes with cache buster bump

**Post live:**
- [ ] Author active in r/surfing thread for 4 hours
- [ ] Monitor Plausible real-time dashboard
- [ ] Monitor VPS: `peakly-api.duckdns.org/health`
- [ ] Cross-post to r/skiing + r/solotravel within 24 hours if ≥ 50 upvotes

**Within 48 hours:**
- [ ] Email re-engagement setup (Loops.so or Mailchimp) for new signups
- [ ] Jack: REI Avantlink signup (30 min — $6.16 RPM unlock)
- [ ] Add `/api/flights/latest` to UptimeRobot monitoring

---

*Next report: 2026-04-01 — post-Reddit launch retrospective | Filed by PM agent (v20)*
