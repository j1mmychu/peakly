# Peakly PM Report v197 — 2026-10-31 (LAUNCH DAY +13)

**Status: 🔴 RED — VPS Day 84. Nov 7 hard deadline in 7 days. 19 days since last app.jsx commit. Content agent introduced a new P0 this run (.venue-baseline set to 209 instead of 404 — FIXED this run). Whistler opens Nov 21.**

> **Stale prompt notice — Day 25 (unchanged):** The stored cron prompt still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface before this rots further.

---

## Shipped Since Last Report (v196 → v197)

| Commit | What | Right call? |
|--------|------|-------------|
| `a680c65` | DevOps Oct 31 — RED, VPS Day 83, .venue-baseline MISSING P0, PRECACHE Day 24, 18 unmerged branches | ✅ reporting |
| `3e444aa` | Content Oct 31 — venue count "corrected" to 209 (WRONG — actual is 404 verified by eval), .venue-baseline set to 209 (BROKE the guard), AIRPORT_COORDS gaps flagged | ❌ introduced a P0 regression: .venue-baseline now blocks next app.jsx commit |

**PM correction this run:** `.venue-baseline` fixed 209 → **404** (the content agent's bracket-walker returned 209 — unclear why, but eval confirms 404, matching CLAUDE.md and grep counts). Committed with this report.

**Zero app.jsx / sw.js / index.html commits. 19 days.**

---

## Overnight Activity: What Matters

Two report commits landed. One introduced a real regression: the content agent's counter returned 209 (methodology unknown — eval gives 404) and then wrote that wrong number to `.venue-baseline`. This would have broken `scripts/auto-push.sh`'s venue guard on the NEXT app.jsx commit, causing a false P0 refusal. Fixed.

The 18 unmerged `claude/*` branches remain on origin, unchanged. Most concerning:
- `fix-appjsx-final` — 597 commits ahead of main
- `restore-appjsx` — name implies overwrite of current app.jsx
- `improve-scoring-system-XYGY6` — scoring changes without algorithm critique violate CLAUDE.md

**Jack's single most important action before any Reddit/HN post:** review these branches. Several could be gold; at least one (`fix-appjsx-final` with 597 commits) suggests sustained parallel work that hasn't been reconciled. Don't merge blind.

---

## Bug Triage

### P0-A — VPS Redeploy: Day 84. Nov 7 = 7 days. 🚨

Four bugs live in production, fixed in repo since July 24 (99 days):

| Bug | User impact | Hard deadline |
|-----|-------------|---------------|
| `forecast_days:7` on VPS | Whistler invisible Nov 21 (ski season open) | Nov 7 |
| `_wxCache` in-memory only | Reddit spike → Open-Meteo rate ceiling → weather down for everyone | Nov 7 |
| `capacitor://localhost` missing CORS | iOS native app: zero weather, zero pricing | Nov 7 |
| `DELETE` not in CORS methods | Alert deletion silently fails for all users | Nov 7 |

```bash
# Jack: 10 minutes. One SSH session.
ssh root@198.199.80.21
git clone https://github.com/j1mmychu/peakly.git /tmp/peakly-tmp
cp /tmp/peakly-tmp/server/proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | grep -E "forecast_days|cors|apns"
rm -rf /tmp/peakly-tmp
```

**If this doesn't happen by Nov 7, Whistler opens with broken two-weekend scoring. That's the ski destination most likely to surface on Reddit in November.**

### P0-B — .venue-baseline: FIXED THIS RUN

Content agent set it to 209 (wrong). Fixed to 404. If you're reading this after another content run, verify: `cat scripts/.venue-baseline` should say `404`.

### P1 — PRECACHE version mismatch (Day 25)

`sw.js` PRECACHE includes `babel.min.js@7.29.7` but `index.html` loads `@7.24.7`. SW caches a version it will never serve. Fix: clear PRECACHE array to `[]`. Auto-push will bump cache stamp. Two-minute fix.

### P2 — AIRPORT_COORDS / AP_CONTINENT gaps

82 of 152 venue airports missing from AIRPORT_COORDS → distance filter broken for those venues. 117 of 152 missing from AP_CONTINENT → continent filter broken. Not a launch blocker, but degrades the core filter promise.

---

## This Week's Top 3 Priorities Only

**1. Jack: SSH to VPS before Nov 7. (P0-A above.)**
Nothing else matters until this happens. Two-weekend scoring is broken. iOS native is broken. Nov 21 Whistler → ski season → Reddit → crash is the failure mode.

**2. Jack: Review the 18 unmerged branches.**
Do this before ANY code lands in main. Decide: merge, close, or cherrypick. `fix-appjsx-final` (597 commits ahead) is the biggest unknown in the codebase right now.

**3. Fix PRECACHE (P1). Two minutes, zero risk.**
The auto-push pipeline handles cache stamp. Just clear the array. Then any edge user who caught the wrong SW version gets the correct file on next load.

---

## Explicit Product Decisions This Run

**DECISION 1: .venue-baseline = 404. SHIP.**
The content agent's "correction" to 209 was an error. Bracket-walker eval gives 404, grep gives 404, CLAUDE.md says 404. Fixed this run.

**DECISION 2: AIRPORT_COORDS/AP_CONTINENT backfill. DEFER to post-VPS.**
Real gap, but the distance filter failing silently (returns "no data") is less bad than broken weather scoring. Fix order: VPS first, then data gaps.

**DECISION 3: Unmerged claude/* branches. NO MERGE until Jack reviews.**
18 branches including what looks like a full app rewrite (`fix-appjsx-final`) cannot land in main from a scheduled agent run. This is a human decision. PM is formally flagging this as requiring Jack's eyes before any merge action.

---

## Features REJECTED This Week

- **JSON-LD structured data:** Already cut from launch gate (v195). Still deferred — SEO gain doesn't justify pre-launch complexity with VPS undeployed.
- **Venue addition queue (20+ proposals):** Frozen per PM v196. The catalog is already 404 venues. More venues don't move the 100K downloads needle. REJECT until post-Reddit.
- **Tag depth improvement (225 venues with ≤2 tags):** Cosmetic data improvement. Does not affect scoring, filtering, or conversion. REJECT until post-launch.
- **APNS push alerts:** Still blocked by Open #21 (DER vs P1363 + HTTP/1.1 vs HTTP/2). REJECT — do not wire until the transport is fixed.

---

## Success Criteria

**What defines success:**
- 1,000 DAU within 30 days of Reddit/HN post
- <5% ErrorBoundary rate (Sentry)
- Weather loads for ≥95% of Explore sessions
- VPS `/health` shows `forecast_days:14` + `wx_cache_size` > 0 after the spike

**90-day projection: 5K vs 8K users — what makes it 8K:**
- VPS deployed BEFORE the Reddit post (weather cache survives a spike)
- At least 2 of the 18 unmerged branches contain genuine UX improvements that make the front page feel polished
- Whistler + ski season content performs on social Nov–Dec (skiing audience is real, beach audience has seasonal overlap)
- The score explanation UI (already shipped) gives users the "aha" moment on first visit

**What makes it 5K:**
- VPS still down at Reddit post time → weather fails under load → users bounce → no second chance
- The 18 unmerged branches contain a redesign that ships half-finished

---

## One Product Risk Nobody Is Talking About

**The 18 unmerged branches represent a parallel product that may be significantly better — or significantly broken — than what's live.**

`fix-appjsx-final` is 597 commits ahead of main. That's not a bug fix. That's a sustained, parallel development effort. If it contains genuine improvements that haven't shipped, the live product is behind its own potential for 19+ days. If it's broken, someone has been iterating on broken code for weeks.

This is not a reporting failure. It's a process failure: parallel AI agent workstreams with no coordination, no merge discipline, no review gate. The auto-push pipeline was built to solve this for main. It doesn't help when work is happening on 18 branches simultaneously.

**Jack's call:** Before Nov 7, spend 30 minutes on GitHub reviewing what's actually in those branches. The upside is finding work worth shipping. The downside of not looking is launching with an outdated product when the better version already exists in your own repo.

---

## Blocked

| Blocker | What it unlocks |
|---------|-----------------|
| LLC approval | REI (18 links, ~$6.16/1K MAU), Backcountry (2 links), GetYourGuide affiliate |
| Jack SSH to VPS | Two-weekend scoring, iOS native, alert deletion, cache spike protection |
| Jack review of 18 branches | Any code merging / safe launch |
| Jack update of cron prompt | Accurate daily reporting (stale for 25 days) |
