# Peakly PM Report v127 — 2026-08-22

**Status: GREEN. Launch day. No P0/P1 bugs. Widget nudge confirmed gated iOS-only. Cloudflare remains the only Jack action outstanding.**

---

## Shipped Since Last Report (v126 → v127)

| Commit | What | Right call? |
|--------|------|-------------|
| `398129e` | DevOps report — GREEN, all systems nominal, 3 P3 housekeeping items only | ✅ Confirms nothing broke overnight. |
| `67e4c30` | Content report — 97/100, 391 venues, 0 dup photos, BASE_PRICES 94% | ✅ Closing audit before traffic lands. |

No code shipped today before this report. That is the right call. Don't touch the codebase on launch day unless there's a P0 crash.

---

## Bug Triage (verified from source today)

### Peakly Pro price ($9/mo vs $79/yr)
Not a bug. `grep -c PEAKLY_PRO app.jsx` → 0. Formally cut April 2026. Retired from this checklist permanently.

### Sentry DSN
Live. DSN wired at `index.html:77` and `app.jsx:7–8`. We are not flying blind.

### Cache buster stale?
No. `20260821c` in app.jsx / sw.js / PEAKLY_BUILD. One minor P3: `dist/index.html` reads `v=20260821b` (one suffix behind). Zero user impact — the production `dist/` is rebuilt by CI on each push; the version string is cosmetic. Not worth a commit on launch day.

### Widget nudge showing for web PWA users?
**Confirmed safe.** Checked `app.jsx:8826`:

```js
const show = window.Capacitor?.isNativePlatform?.() && window.Capacitor?.getPlatform?.() === "ios" && !dismissed && wishlistCount >= 2;
if (!show) return null;
```

PWA visitors on Reddit will never see this. Risk from v126 is closed.

### Open scroll/UX bugs
All closed. `fb58543` + `8f12dfd` covered price shimmer, alert-creation freeze, account-modal scroll trap, stuck-scroll. No regressions visible in DevOps report.

---

## Three Product Decisions — Aug 22

### Decision 1: SHIP today. Post r/skiing this afternoon.

**SHIP.** Every data and UX gate is cleared:
- 391 venues, 0 dup IDs, 0 dup photos ✅
- Cache stamp current (`20260821c`) ✅
- All P1 UX bugs closed ✅
- VPS healthy, disk cache live, CORS/DELETE fixed ✅
- Sentry live ✅
- Widget nudge iOS-only ✅

If Cloudflare is live by noon Pacific: post r/skiing mid-afternoon ET. Otherwise post Monday Aug 25. There is no further slip.

### Decision 2: DEFER all codebase changes until 48h post-launch observation window closes.

**DEFER.** Zero edits after the post goes up unless we see a P0 crash logged in Sentry or a total blank-grid failure. We need real user behavior data before building anything. The exceptions are explicit:
- P0: blank Explore grid or ErrorBoundary crash for >1% of sessions → fix immediately
- P1: booking links broken or flight pricing returning 0 across the board → fix same day
- P2+: everything else waits until Aug 24 observation data is in hand

### Decision 3: CUT JSON-LD and static h1 from Q3 roadmap entirely.

**CUT.** Three consecutive PM reports have deferred these as "post-launch SEO." Google won't index our pages meaningfully for 6–10 weeks post-Reddit regardless of structured data. The audience for the next 90 days is referral traffic from Reddit/HN — structured data has zero conversion impact on that channel. If we hit 8K users and organic starts mattering, revisit. Until then, this is dead work.

---

## This Week's Top 3 Priorities Only

**1. Jack: Cloudflare CDN — today, before posting.**
Browser task, ~30 minutes. Peakly → Cloudflare nameservers → proxy GitHub Pages. This is the only remaining pre-launch action and it's been on the list for 5 consecutive reports. Not negotiable.

**2. Pre-warm VPS morning of the post.**
`curl -s https://peakly-api.duckdns.org/health` → confirm `wx_cache_size > 200`. If cold, hit the top 20 venue lat/lon pairs manually via `/api/weather`. One Reddit spike on a cold cache = Open-Meteo rate ceiling, pricing shimmer on every card. 10 minutes, zero code.

**3. 48h observation window — write down what you're watching.**
Before posting: decide in advance what constitutes a P0/P1 that merits a same-day patch. Sentry should be open in a tab. The signals to monitor:
  - `peakly_errors` volume in Sentry (baseline: near-zero today)
  - Plausible: bounce rate on Explore load (>80% = something broken above the fold)
  - VPS `/health` `wx_cache_size` dropping to 0 mid-spike (would mean VPS restart happened)

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| JSON-LD / static h1 | CUT — not deferred, cut. Zero conversion impact for Reddit traffic. Revisit at 8K+ organic. |
| New venue adds | Moratorium active through Aug 30. Clean catalog on launch day; no new test surface. |
| Plausible custom events (book-click, detail-open, alert-set) | High signal, low risk — but zero code on launch day. Ship on Day 3. |
| SRI / CSP hardening | Medium risk of breaking Babel inline eval. Post-launch only. |
| APNS push alerts | HTTP/2 transport + JWT DER→P1363 still broken. Do not wire. |
| iOS App Store submission | Needs Jack + Mac + Xcode. Not this week. |
| Hotels in deal score | Deferred to v2 since May. |
| BASE_PRICES remaining 10 APs | 94% is ship-ready. Diminishing returns; fallback `~$X` works. |

---

## Success Criteria

**90-day target: 5K–8K users. What gets us to 8K, not 5K:**

| Driver | 5K path | 8K path |
|--------|---------|---------|
| Cloudflare | GitHub Pages throttles at spike | Live, no throttle |
| Post timing | Any time | 9–11am ET weekday, r/skiing + r/frugaltravel staggered 48h |
| Photo quality | Generic stock | Real venue photos ✅ (`d1bddb5`) |
| UX first 30s | Scroll freeze, alert creation borked | All closed ✅ |
| VPS pre-warmed | Cold cache = Open-Meteo timeout on card 1 | Warm, wx_cache > 200 |
| Observation discipline | Panic-patch bugs mid-spike, introduce P0 | Hold the line, 48h window |

At current state: everything except Cloudflare and VPS pre-warm is done. Both are Jack-executable in under an hour. The 8K path is live.

---

## One Risk Nobody Is Talking About

**The bounce rate on mobile Safari is structurally higher than our Playwright smoke catches.**

Playwright runs headless Chromium. Every UX fix this week (`fb58543`, `8f12dfd`) was caught in real sessions, not smoke. The Reddit audience is ~60% mobile, skewed toward iOS Safari. The scroll/freeze bugs we closed were invisible to automated testing.

We have no signal on what the first 30 seconds looks like for a new iOS Safari user on a cold cache with no localStorage. The smoke test doesn't simulate that path. Sentry will catch crashes but not friction — a user who closes the tab in disgust doesn't log an error.

**Mitigation:** Jack should manually load `https://j1mmychu.github.io/peakly/` in iOS Safari in a Private window (clears localStorage) and walk the full first-30-second flow: Explore loads → tap a card → tap Book → tap Alerts. If anything feels stuck or blank, that's the bug to fix before the post. 10 minutes, no code required, highest signal test we can run.
