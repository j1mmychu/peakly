# Peakly PM Report — 2026-05-24 (Memorial Day Saturday)

> Latest report. Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: 🔴 RED — Reddit window is open RIGHT NOW. Two P0s unshipped. VPS status unknown.**

Today is the day. The May 22 report set a binary gate: VPS verified by Friday noon → post Saturday morning. Saturday morning is here. This report assesses where things actually stand.

---

## Shipped Since Last Report (May 22)

**Nothing shipped.** Zero code commits since `43f2466` (May 22 PM report). The following were explicitly called out as "ships today in code session" on May 22 — none landed:

| Item | Status | Days Open |
|------|--------|-----------|
| GEAR_ITEMS const + wire into VenueDetailSheet | ❌ Not in app.jsx at all | 11 days |
| val-d-isere-s16 deletion | ❌ Still live at app.jsx:530 | 12 days |
| outer-banks-nags-head-t7 ap: OAJ → ORF | ❌ Still OAJ at app.jsx:548 | Day 3 |
| Seasonal ski empty-state copy | ❌ Not confirmed | Unknown |
| VPS proxy redeploy | ❌ Jack-only — status unknown | 20 days |
| Reddit post | ❌ Status unknown | — |

---

## Blocked

| Blocker | What it stops | Owner |
|---------|---------------|-------|
| VPS SSH (3 commands, 10 min) | Weekend pricing + proxy cache + Reddit launch | **Jack** |
| GEAR_ITEMS code paste (~45 min) | Amazon Associates earning $0 | AI code session |
| val-d-isere-s16 one-line delete | Duplicate venue + stale alerts template | AI code session |
| outer-banks OAJ → ORF one-field fix | Broken flight pricing for OBX | AI code session |
| LLC approval | REI + Backcountry + GetYourGuide affiliate links | Jack |
| Apple Dev Console ($99 + APNS keys) | Strike alerts on iOS | Jack |

---

## Bug Triage

### Peakly Pro price discrepancy ($9/mo vs $79/yr)
**Severity: IRRELEVANT.** Pro UI was removed April 2026. `PEAKLY_PRO` is not referenced anywhere in app.jsx. If `$9/mo` is appearing, it's a CDN cache artifact from a stale service worker serving old code — a hard-refresh clears it. Not a P0. Not a P1. Not on the board.

### Sentry DSN empty
**False alarm.** DSN is present and non-empty at app.jsx:8. Error monitoring is live. ✅

### Cache buster stale
**False alarm.** `PEAKLY_BUILD = "20260522a"` synced across app.jsx, sw.js, index.html. Aligned. DevOps agent fixed May 22. ✅

### GEAR_ITEMS — Amazon earning $0
**Severity: P0.** `GEAR_ITEMS` constant doesn't exist in app.jsx. Not defined, not wired. Amazon Associates earns $0. Revenue model table claims `$4.48/1K MAU` — that's a lie until this lands. At 5K post-Reddit this is $22/month leaving on the table. Paste-ready code sitting in `reports/content-report.md §2` since May 15. Eleven days.

### VPS proxy — Open-Meteo rate limit at 43 DAU
**Severity: P0.** Weather cache proxy not running. 148 venues × ~1.5 Open-Meteo calls per user = ~222 calls/user. Free tier: 10,000/day. Break-even: **45 concurrent users**. Reddit sends 200+ in hour 1. Every venue scores 0 past that ceiling. Users see blank cards. The app looks broken. This has been open 20 days.

---

## Known Blockers

### LLC approval
Unblocks REI (18 links, +$6.16/1K MAU), Backcountry, GetYourGuide. Jack action. **Revenue ceiling is $11.98/1K MAU until resolved.** Not launch-blocking.

### Venue deep links
Deferred post-Reddit. Correct call. ✅

### JSON-LD structured data
**Already live.** `index.html:34–59` has valid JSON-LD schema (WebSite + WebApplication + Organization). SEO concern closed. ✅

### Static h1 fallback
**Already live.** `index.html:391`. SEO concern closed. ✅

---

## This Week's Top 3 Priorities Only

### 1. VPS proxy — Jack SSH today (10 min)
```bash
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && curl localhost:3001/health | head -3"
```
If this isn't done before posting to Reddit, the live site breaks at 45 concurrent users. First "app is broken" comment kills the thread. Jack only. No workaround.

### 2. GEAR_ITEMS + val-d-isere-s16 + OAJ→ORF — one code session (45 min)
Three items. One commit. Zero design decisions required. Paste-ready code in `reports/content-report.md §2`. Cache bump: `20260522a` → `20260524a`. Amazon earns $0 until this lands.

### 3. Reddit post — today or Sunday morning (VPS gate applies)
**Today is Memorial Day weekend Saturday.** This is the optimal ski-tail × beach overlap window for 2026.
- r/skiing (3.2M members)
- r/solotravel (3.4M members)
- r/frugaltravel (1.9M members)

Post format: story-first, first-person. "I got tired of opening OnTheSnow and Google Flights separately every Thursday wondering if it's worth booking..." → screenshot of a firing beach or ski venue with deal price → link. Jack writes this — it needs his voice.

**If VPS not done by 11am PST today → post moves to Sunday morning.** Still Memorial Day weekend. Acceptable. Does NOT move to June 5. Waiting 10 days loses the ski-tail angle entirely.

---

## Explicit Product Decisions — May 24

**Decision 1: GEAR_ITEMS does NOT graduate to known-skipped.md.**

Content agent policy says "third flag → known-skipped." That policy exists to stop debated features from clogging the queue. It doesn't apply to "here is the exact code, paste it in." GEAR_ITEMS is a revenue item with paste-ready code that unlocks ~$22/mo at 5K MAU. Graduating it to known-skipped because a human didn't run a code session is a process failure masquerading as a product decision.

**VERDICT: GEAR_ITEMS stays P0 until it ships. No graduation. Apply in the next code session.**

**Decision 2: val-d-isere-s16 deletion ships in the next code session. Also replace `"val-d-isere-s16"` in the Alerts Quick Template draft (app.jsx:5192) with `"tignes"`. Twelve days. Done.**

**Decision 3: S-hemisphere ski scoring fix — DEFER to June 3.**

Six S-hem venues (Remarkables, Portillo, Thredbo, Cerro Castor, etc.) open in June but score ~0 due to N-hem calendar logic. The fix is right, the timing is right (opens June 1–15), but per CLAUDE.md, scoring changes require an algorithm critique. **Scheduled for June 3 code session** — 2 weeks before peak S-hem season. If not done by June 3, escalate to P0.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| New venues (Maldives, Mirissa, Ölüdeniz, Mzaar, Oukaimeden) | **DEFER post-Reddit** | 148 venues sufficient for launch. Adding pre-Reddit risks new data bugs mid-smoke. |
| SRI hashes on CDN scripts | **DEFER** | Zero user-facing value. Post-launch hardening. |
| CSP meta tag | **DEFER** | Same. |
| Eager Supabase deletion | **DEFER** | TTI matters at 100K users. Not at 148 DAU. |
| Tag accuracy fixes (agios-prokopios, mana-island, madarao, etc.) | **DEFER to June** | Not launch-blocking. Not why anyone bounces. |
| APNS .p8 key setup | **DEFER** | Capacitor gate hides Alerts tab on iOS. Not web-launch-blocking. |
| Wishlists/Trips tab reveal | **CUT to 1K MAU** | Hard lock. |
| Peakly Pro | **CUT for v1** | Confirmed dead five times. Not on the board until 1K MAU. |
| Hotels in deal score | **CUT to v2** | Sixth rejection. Removing from future decision tables permanently. |
| Airport IATA fixes (AXT→HNA, NGO→NRT for JP resorts) | **DEFER to June** | Not launch-blocking. |

---

## Success Criteria

**Today's binary:**

| Scenario | 90-day projection |
|----------|------------------|
| VPS verified + Reddit today | **8K ceiling** |
| VPS verified + Reddit Sunday | **7K ceiling** |
| Reddit without VPS | **Catastrophic. Don't.** |
| No Reddit this weekend | **6K ceiling** (June beach-only, ski angle gone) |

**What has to be true for 8K, not 5K:**

| Metric | 5K path | 8K path |
|--------|---------|---------|
| Reddit upvotes day 1 | 100–200 | 400+ |
| Plausible DAU week 2 | 40–60 | 120+ |
| Bounce rate on Explore scroll | <65% | <50% |
| Alert set rate | >3% of visitors | >5% |
| Return visit rate (week 2) | >12% | >20% |

The 8K path requires the Reddit post to hit r/skiing AND r/frugaltravel in the same weekend. One subreddit without the other is the 5K path.

**Plausible validation — do before posting:** Open `https://j1mmychu.github.io/peakly/` incognito, click around, check Plausible realtime. If nothing registers, the `data-domain` attribute (index.html:32) needs to match your Plausible dashboard config exactly. 5 minutes. Non-negotiable before going live.

---

## One Product Risk Nobody Is Talking About

**The ski category looks broken on Memorial Day weekend — and no copy explains why.**

148 venues are live. ~11 N-hem ski venues score ~0 correctly (off-season binary). 6 S-hem ski venues score ~0 incorrectly (hemisphere bug, deferred to June 3). On a Saturday in late May from a New York IP, a user opens the app, filters to Skiing, and sees almost nothing. No explanation. The app looks broken — not seasonal.

The copy fix is one sentence in the skiing empty state: **"Ski season is winding down in the Northern Hemisphere — check back in November, or explore beach deals now."** This is the difference between a Reddit comment that says "app is broken" and a comment that says "ah, makes sense."

The ski angle is the Memorial Day hook in the copy ("final powder days vs. first beach days"). If users can't find ski results, that hook dies on impact. Either fix the empty-state copy before the post, or strip ski from the Reddit narrative and go pure beach. Don't do both — pick one.

---

## Pre-Reddit Checklist (Current State)

1. ✅ SEO meta — no surf/adventure strings
2. ✅ APNS Capacitor gate — `showAlertsTab` wired
3. ✅ Cache buster — `20260522a` across all 3 files
4. ✅ Sentry DSN — configured
5. ✅ JSON-LD structured data — live in index.html
6. ✅ h1 fallback — live in index.html
7. ❌ **GEAR_ITEMS** — not in app.jsx (AI code session)
8. ❌ **val-d-isere-s16 deleted** — still at app.jsx:530 (AI code session)
9. ❌ **outer-banks ap OAJ → ORF** — still wrong at app.jsx:548 (AI code session)
10. ❌ **Ski empty-state copy** — "Season winding down" explanation (AI code session)
11. ❌ **VPS proxy redeployed** — Jack SSH (status unknown)
12. ❌ **Plausible realtime validated** — Jack incognito test
13. ❌ **Reddit post** — Jack's voice, 9–11am PST today or Sunday

Items 7–10 = one code session, ~50 min. Items 11–13 = Jack only.
