# Peakly PM Report — 2026-04-14

**Filed by:** Product Manager agent  
**Status:** 5 days of silence after 6 days of silence. TP_MARKER Day 21. Email capture still `alert()`. VENUES bloat mystery.

---

## Overnight Activity — April 9 → April 14

**Commits since last PM report (April 8): 3 commits, all April 9**

| Hash | What | Assessment |
|------|------|-----------|
| `1db7079` | fix: push notification icons, SW cache bump, inter-batch delay, cache buster | ✅ Right call. Push icon was broken (pointed to manifest.json, not SVG). Inter-batch delay prevents Open-Meteo rate limits. Good. |
| `f79ff26` | Daily Content report | Neutral. Filed, no actions taken. |
| `3129564` | Daily Content report | Neutral. Filed, no actions taken. |

**Zero code commits since April 9.** Five more days of silence after the six-day gap flagged in the last report.

---

## Bug Triage — April 14

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **TP_MARKER = "YOUR_TP_MARKER"** (`app.jsx:5316`) | **P0** | ❌ STILL UNSET | **Day 21** |
| **app.jsx = 2.0 MB, 11,000 lines** | **P1** | ❌ Unfixed | Day 12+ |
| **fetchWeather() throws on 429** (`app.jsx:4541`) | **P1** | ❌ `if (!r.ok) throw` — no 429 guard, crashes Explore tab | Day 21 |
| **Email capture banner uses `alert()`** (`app.jsx:7214`) | **P1** | ❌ No backend POST. Emails lost to void. | Day 21 |
| **Cache buster stale** (`?v=20260409a`, 5 days old) | **P3** | ⚠️ Bumped April 9, now stale again | Day 5 |

**Resolved since April 8:**

| Bug | Status | Notes |
|-----|--------|-------|
| React CDN unpinned | ✅ FIXED | Pinned to 18.3.1 at `index.html:80-81` |
| Sentry DSN empty | ✅ NOT A BUG | DSN confirmed set at `app.jsx:8`. Concern was stale. Closed. |

---

## Specific Issue Audits (from brief)

**"Peakly Pro price showing $9/mo — should be $79/yr"**  
NOT FOUND anywhere in `app.jsx`. Searched for "$9/mo", "per month", "subscription", "upgrade", "Pro plan", and all pricing language. There is no Pro pricing displayed in the app. The Profile tab shows "Open Beta" at `app.jsx:8331`. The Pro product exists only as a CLAUDE.md concept ($79/yr target). No $9/mo string exists in the current codebase.  
**Ruling: Ghost issue. Does not exist. Close it.**

**"Sentry DSN empty — flying blind on production errors"**  
DSN is live at `app.jsx:8`: `https://9416b032a46681d74645b056fcb08eb7@o4511108649058304...`. Error monitoring is active.  
**Ruling: Closed. Not a current problem.**

**"Cache buster stale"**  
Bumped to `?v=20260409a` on April 9. Now 5 days stale. Low severity — only matters when new code ships and old browsers need to bypass their cache. Until next commit, this isn't blocking anyone.  
**Ruling: P3. Bundle bump with next code ship.**

---

## Known Blockers

| Blocker | Owner | Days Blocked |
|---------|-------|-------------|
| **TP_MARKER** | Jack (tp.media login — not a code problem) | 21 |
| **fetchWeather 429** | Dev (1 line at `app.jsx:4541`) | 21 |
| **Email capture POST** | Dev (1 form handler at `app.jsx:7214`) | 21 |
| **app.jsx VENUES bloat** | Dev (audit + purge, then extraction) | 12+ |
| **LLC** | External — unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide | Unknown |

---

## Silent Problem Nobody Is Talking About

**CLAUDE.md says VENUES was trimmed to 231 entries (skiing/surfing/tanning only) on April 10. The code disagrees.**

The April 10 cleanup log states: "VENUES scaled 3,726 → 257 → 231 (launch cats only: skiing/surfing/tanning)." Current `app.jsx` is 11,000 lines / 2.0 MB and contains venue entries for `kite`, `climbing`, `mtb`, `paraglide`, `diving`, `fishing`, and `hiking` — clearly well above 231. Their scoring cases were deleted from `scoreVenue()`. These venues either score incorrectly or return the "Checking conditions…" fallback.

This is a documentation drift problem: the agent team records what was claimed to ship, not what the code actually contains. The written state of CLAUDE.md and the actual state of `app.jsx` have diverged. Every venue outside the three launch categories is dead weight that Babel parses on mobile load, burning performance budget without contributing to the product.

**Action: VENUES audit before venues.json extraction. Purge non-launch categories. Confirm actual count.**

---

## This Week's Top 3 Priorities

### 1. JACK: TP_MARKER. Day 21. No more context needed.

`tp.media` → Markers → copy marker ID → replace `"YOUR_TP_MARKER"` at `app.jsx:5316` → push. Five minutes. This has appeared in 12 consecutive PM reports. The fix has not changed. The opportunity cost is now 21 days of untracked flight affiliate clicks.

**Decision: SHIP. Jack. Today. No further analysis required.**

### 2. DEV: 2 surgical fixes + cache bump, 30 minutes, zero design decisions

**a) fetchWeather 429 (`app.jsx:4541`)** — Change 1 line:
```js
// Before: if (!r.ok) throw new Error("weather fetch failed");
// After:  if (r.status === 429 || !r.ok) return null;
```
`fetchMarine()` already returns null on failure (`app.jsx:4558`). Weather should match. A thrown error propagates through the batch loader and can silently break the Explore tab for all users when Open-Meteo rate limits.

**b) Email capture POST (`app.jsx:7214`)** — Replace `alert("You're on the list! 🎉")` with a real POST to `https://peakly-api.duckdns.org/api/waitlist`. CLAUDE.md claims this was fixed in the April 10 cleanup pass. The code says `alert()` is still live. Every email submitted via the Explore banner was discarded.

**c) Cache buster** — Bump `?v=20260409a` → `?v=20260414a` in `index.html:346`.

**Decision: SHIP all 3 as a single commit. Bundle with TP_MARKER push.**

### 3. DEV: VENUES audit + non-launch category purge

Before touching the venues.json extraction (the 3-4 hr engineering task), confirm what's actually in the VENUES array. Count entries by category. Delete all venues where `category` is not `"skiing"`, `"surfing"`, or `"tanning"`. CLAUDE.md target is 231. If the code is at 800+, the purge could cut `app.jsx` by 25-35% without any infra work.

This is a prerequisite to accurate reporting, accurate file sizing, and valid CLAUDE.md.

**Decision: SHIP this week as standalone commit. Prior to any venues.json work.**

---

## Explicit Product Decisions

**DECISION 1: VENUES purge before venues.json extraction.**  
The April 8 PM report recommended venues.json extraction (3-4 hrs). That's premature if the file still has 600+ dead-category venues in it. Purge first (30 min). Reassess size. Then decide if async loading is still necessary.

**DECISION 2: JSON-LD structured data — SHIP this week.**  
SEO score is 81%. `schema.org/SportsActivityLocation` JSON-LD on the Explore page is a direct path to rich results for "surf conditions [city]" and "ski conditions forecast" queries. Static markup, no API dependencies, no design decisions. Estimated effort: 2-3 hours. Estimated SEO gain: +5-10% organic reach. This is a SHIP.

**DECISION 3: Static h1 fallback — SHIP alongside JSON-LD.**  
Googlebot sees a blank h1 on first crawl because Babel parses after the DOM. A static `<h1 id="seo-h1">Find surf, ski & beach spots when conditions and flights align</h1>` in `index.html`, hidden visually but indexable, costs 10 minutes. Bundle with JSON-LD commit.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| **venues.json extraction (before VENUES audit)** | **DEFER** | Premature. Audit dead categories first — purge may make it unnecessary. |
| **Trips + Wishlists tabs exposed** | **DEFER to 1K users** | Standing decision. 3-tab nav for launch. |
| **iOS App Store** | **DEFER to 500 validated users** | $99 + 4-week review cycle. Validate PMF first. |
| **Google Play via PWABuilder** | **DEFER to 500 users** | $25 and no code, but amplify proven demand — not speculative. |
| **Strike alerts server polling** | **DEFER to 100 subscribers** | Build audience before the push worker. |
| **Pro subscription UI** | **DEFER indefinitely** | Not in code. No user demand. No LLC. Not in 6 months. |
| **Dark mode** | **CUT** | Repeated decision. Won't revisit. |

---

## Success Criteria

| Metric | 5K users (base) | 8K users (upside) |
|--------|-----------------|-------------------|
| TP_MARKER set | No (Day 21) | Yes — set before next traffic spike |
| Email capture working | No (`alert()` live) | Yes — POST to `/api/waitlist` |
| Mobile load time | 5-10s Babel parse | <3s (post VENUES purge) |
| SEO score | 81% | 88%+ (post JSON-LD) |
| Flight pricing | Estimates only (TP unattributed) | Live on top venues + commission tracking |

**What has to be true for 8K, not 5K:**  
TP_MARKER set. Email capture working. VENUES purged. JSON-LD live. Every item is identified, scoped, and small. The gap between 5K and 8K is an execution gap, not a product gap.

---

## One Product Risk Nobody Is Talking About

**CLAUDE.md is the product's shared brain. It is currently wrong about venue count, email capture status, and the surfing scoring fix.**

The April 11 entry says email capture is fixed ("real POST to /api/waitlist, no more alert()"). The code says `alert()` is live. The April 10 entry says VENUES trimmed to 231. The code disagrees. The April 11 entry says surfing wind direction was fixed to use `venue.facing + 180`. The code at lines 4721-4734 still compares `windDir - swellDir`, not `windDir - (venue.facing + 180)`.

When CLAUDE.md drifts from code reality, every new session starts with a false picture of the world. Agents document claims, not state. The fix: before closing any bug in CLAUDE.md, verify the relevant lines in `app.jsx`. Three of the "✅ Recently Fixed" items on the April 11 list are not fixed in the current code.

---

*PM agent — 2026-04-14*  
*Milestone: TP_MARKER + 2 surgical fixes in git by April 15. VENUES audit by April 16. No more loops.*
