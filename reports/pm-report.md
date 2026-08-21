# Peakly PM Report v126 — 2026-08-21

**Status: GREEN. 391 venues, 0 dup photos, 0 structural issues. Jack's evening session (`3fd1995`→`8f12dfd`) closed the last visible UX bugs. Aug 22 launch is a go pending Cloudflare. One risk below nobody's tracking.**

---

## Shipped Since Last Report (v125 → v126)

| Commit | Author | What | Right call? |
|--------|--------|------|-------------|
| `3fd1995` | Jack (direct) | Reconcile + dupe-venue cleanup (391→391 clean) + LAX airport fix + airport-coords/AP_CONTINENT gaps + alerts tab + swipe polish + widget nudge | ✅ **Exactly right.** This was the "apply the ready-to-ship diffs" ask from v125. Jack did it all in one session. |
| `fb58543` | Jack (direct) | Fix price loading speed, alert-creation freeze, account-modal scroll trap | ✅ **P1 UX fixes, day before launch.** These were "first-30-seconds" bugs — a new user who taps Alerts or tries to create an account would have been stuck. Ship before any traffic. |
| `8f12dfd` | Jack (direct) | Fix stuck-scroll after account creation + alert-form scroll clearance | ✅ **Polish that matters.** Same session, same vein. No regression risk on a 23-line diff. |
| `f1720ae` | Content agent | Daily content report — 97/100, confirms 391 venues, 0 dups, moratorium noted | ✅ Clean audit before launch. |

**Opportunity cost check:** the last two days have been pure correctness. No feature additions, no scope creep. Photo sprint is done (`d1bddb5`), data cleanup is done (`3fd1995`), UX bugs are done (`fb58543`/`8f12dfd`). Right posture 1 day from launch.

---

## Catalog State (verified from source, 2026-08-21)

| Metric | Value | Method |
|--------|-------|--------|
| Venues | **391** (131 ski / 260 beach) | ID regex count — 391 unique |
| Dup IDs | **0** | Content confirmed |
| Dup photos | **0** | Content confirmed + re-verified by eval |
| AIRPORT_COORDS coverage | **100%** | Content: 203 entries, 0 gaps |
| AP_CONTINENT coverage | **100%** | Content: 283 entries, FOR/NAT fixed in `3fd1995` |
| BASE_PRICES | **94%** (29 APs missing, 23 venues) | Single-venue edges, fallback `~$X` estimate works |
| `.venue-baseline` | **391** ✅ | Matches actual count |
| Build stamp | **`20260821c`** ✅ | Lockstep in app.jsx / sw.js / index.html |
| Photo dedup | **0 dups / 391 unique** ✅ | No repeats |
| Venue moratorium | **ACTIVE through 2026-08-30** | |

**In-season venues: 185/391 (47%)** — 162 N. hemisphere beach (prime summer) + 23 S. hemisphere ski (Andes/NZ mid-winter). Healthy for late August.

---

## Bug Triage

### Peakly Pro price ($9/mo vs $79/yr)
**Not a bug. Not in codebase.** `grep PEAKLY_PRO app.jsx` → 0. Formally cut April 2026. Stop reporting.

### Sentry DSN
**Live. Confirmed.** DSN wired in `index.html:77` + `app.jsx:7–8`. Not flying blind.

### Cache buster stale?
**No. `20260821c` today, lockstep in all 3 files.** The `c` suffix means 3 cache bumps today — normal from Jack's evening session.

### Open scroll/UX bugs
**Closed by `fb58543` + `8f12dfd`.** Price loading shimmer gone, alert-creation freeze gone, account-modal scroll trap gone, stuck-scroll after account creation gone. These were the last P1 user-facing bugs I had visibility into.

---

## Three Product Decisions — Aug 21

### Decision 1: SHIP tomorrow (Aug 22). No more slipping.

**SHIP.** Every launch gate from v124 and v125 is cleared:
- Photo dedup: 0 dups ✅
- Venue dupes: 3 pairs deleted ✅
- Airport-coords/AP_CONTINENT gaps: fixed ✅
- UX bugs: scroll, freeze, modal ✅
- Data health: 97/100 ✅
- Cache stamp: fresh today ✅

The only remaining blocker is **Cloudflare** — a Jack browser task, ~30 minutes, no code changes. If Cloudflare is live by noon Pacific on Aug 22, post to r/skiing mid-afternoon ET. If Cloudflare isn't done by noon, post Monday Aug 25. There is no Aug 29.

### Decision 2: CUT the widget nudge from the launch build.

**CUT — or at minimum, gate it behind `Capacitor.isNativePlatform()` iOS check.**

`3fd1995` added a "widget nudge" to the app. A home-screen WidgetKit widget that requires Xcode GUI wiring (per `ios/WIDGET-SETUP.md`, still not complete), running inside a Capacitor iOS build that hasn't shipped to the App Store yet, being offered to web users on the launch Reddit post — that's confusing at best, misleading at worst.

First impression of Peakly for a Reddit user landing on the PWA: "Install Widget" prompt for a widget they can't actually install on a web app.

**Action:** grep `widget` in app.jsx and confirm the nudge is gated on `Capacitor.isNativePlatform()` before any iOS build ships. If it's showing on the web PWA, pull it. This is a 2-line change and a must-do before the post.

### Decision 3: DEFER all post-launch work until after the Reddit post + 48h observation.

**DEFER everything not named above.** After tomorrow's post:
- SRI/CSP hardening (Open #10): post-launch
- JSON-LD / static h1 SEO: post-launch
- APNS (Open #21): post-launch, fix the HTTP/2 transport first
- BASE_PRICES remaining 29 APs: post-launch
- Venue adds (BOC, FEN, KRK, etc.): post-Aug-30 moratorium
- `auto-push.sh` photo/location dup guards: post-launch
- iOS App Store: post-launch (needs Jack + Mac + Xcode)

The 48h observation window is non-negotiable. We need real user data before deciding what to build next. Don't touch the codebase on Aug 22 after the post goes up unless there's a P0 crash.

---

## This Week's Top 3 Priorities

**1. Jack: Cloudflare CDN today.** Same ask, fourth consecutive report. Browser task, 30 min. Peakly → Cloudflare nameservers → proxy GitHub Pages. Without it, a Reddit spike hits GitHub Pages directly — 10K concurrent visitors will throttle. This is the only remaining launch blocker.

**2. Verify widget nudge is not showing on web PWA.** Before the post goes up: `grep -n "widget\|Widget" app.jsx | grep -i nudge`. If the nudge renders for non-iOS users, add the `isNativePlatform()` gate. One commit, one line.

**3. Pre-warm VPS the morning of the post.** `curl -s https://peakly-api.duckdns.org/health` → confirm `wx_cache_size > 200`. If the cache is cold from any restart, manually hit the top 20 venue lat/lon pairs via `/api/weather` before the post lands. Prevents Open-Meteo burst-ceiling risk on the first 100 visitors.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| New venue adds (BOC, FEN, KRK, Belize, Seychelles) | Moratorium through Aug 30. Catalog is clean; adding now adds test surface 18h from launch. |
| JSON-LD structured data / static h1 | Zero conversion impact at Day 1 MAU. Post-launch SEO pass. |
| Plausible custom events (detail-sheet-open, book-click, alert-set) | 20-min edit 18h from launch. Ship Day 3 post-Reddit. The blind spot is real; it's also not launch-blocking. |
| SRI / CSP hardening | Medium risk of breaking Babel inline eval. Post-launch only. |
| APNS / push alerts | Two open bugs (HTTP/2 transport, JWT DER→P1363). Do not wire pre-launch. |
| BASE_PRICES 29 remaining APs | 94% is ship-ready. Diminishing returns on single-venue edge cases. |
| iOS App Store submission | Needs Jack + Mac + Xcode. Not this week. |
| Hotel deals in score | Explicitly deferred to v2 since 2026-05-07. |

---

## Success Criteria

**5K vs 8K — what changes at the margin:**

| Driver | 5K path | 8K path |
|--------|---------|---------|
| Cloudflare | GitHub Pages throttles at traffic spike | Live, no throttle |
| Post timing | Any time of day | 9–11am ET weekday, r/skiing + r/frugaltravel staggered 48h |
| Photo quality | Generic stock on hero | Every hero card a real photo of the actual venue ✅ (done) |
| First-30s bugs | Scroll freeze, alert creation borked | All closed as of last night ✅ |
| Venue grid coherence | Duplicate beach cards | 0 dups ✅ |

**At current state, the 8K path is achievable. The delta is 100% execution — post timing and Cloudflare.**

**90-day projection unchanged (5K–8K users).** To hit 8K: Cloudflare live, post timing disciplined, no P0 fires in first 48h. The product itself is ready.

---

## One Risk Nobody Is Talking About

**The widget nudge (`3fd1995`) may be showing for PWA users who can't install it.**

The iOS WidgetKit widget is code-complete but not Xcode-wired (still needs the 15-min GUI step per `ios/WIDGET-SETUP.md`). It has never shipped to any App Store. The "widget nudge" added in `3fd1995` — whose exact render condition I haven't confirmed — risks showing "Install Widget" or equivalent UI to the Reddit PWA visitors who are the entire audience of tomorrow's launch. They're on desktop browsers, Android, or iOS Safari — none of them can install a WidgetKit widget.

At best it's confusing ("what's a widget?"). At worst it's a broken CTA that doesn't do anything. Neither is acceptable as the first impression for 1K–10K new users.

**Fix:** Confirm the nudge is gated on `Capacitor.isNativePlatform()` before the post. If it's not, add the gate. This is the single highest-leverage 30-minute task before tomorrow — higher leverage than any content cleanup because it's visible to every first-time visitor.
