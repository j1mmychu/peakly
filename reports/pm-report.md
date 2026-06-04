# Peakly PM Report — 2026-06-04 (v48)

> Supersedes v47 (June 3). **Status: YELLOW — T-3 days to Reddit launch. Code is clean. VPS is the only binary gate. Jack has 5 minutes of work standing between "launch" and "hope it doesn't melt."**

---

## Shipped Since v47 (2026-06-03 → 2026-06-04)

| What | Verdict |
|------|---------|
| **No app.jsx changes** — code freeze held overnight. | ✅ Correct. |
| **DevOps June 3 audit** — confirmed cache 20260602a, 9,006 lines, no new secrets. Clean hold. | ✅ Clean. |
| **PM v47 published** — summer beach-only product risk formally named. | ✅ Filed. |

**Code state June 4:** app.jsx 9,006 lines. Cache 20260602a aligned across sw.js + index.html. PEAKLY_BUILD = "20260602a". Sentry DSN non-empty. Plausible wired to `j1mmychu.github.io`. 157 venues (89 beach / 68 skiing). 6 lateSeason ski venues. JSON-LD structured data present. Static H1 fallback present.

Zero code regressions. Zero new bugs introduced.

---

## Bug Triage — June 4

| Bug | Severity | Days Open | Status |
|-----|----------|-----------|--------|
| **VPS proxy unredeployed** | **P0** | **Day 31** | Jack only. SSH → verify → restart. 5 minutes. |
| SRI on 4 CDN scripts | P1 | Day 36+ | DEFER post-launch. Final. |
| 16–25 ski venues missing skiPass field | P2 | Day 7 | DEFER post-launch. |
| CSP meta tag | P2 | Day 36+ | DEFER post-launch. Final. |
| South America beach underrepresented (2 venues) | P3 | Day 8 | DEFER post-launch. |
| Africa beach underrepresented (6 venues) | P3 | Day 8 | DEFER post-launch. |
| Eager Supabase `<script>` (80KB on every anon load) | P2 | Day 26 | DEFER post-launch. Diff exists at `reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff`. Apply week of June 10. |

**Peakly Pro $9/mo vs $79/yr:** Not a bug. Pro UI was removed April 16. No price appears in the live product.

**Sentry DSN empty:** Not a bug. DSN confirmed non-empty at `app.jsx:8`.

**Cache buster stale:** Not a bug. 20260602a is current and consistent.

---

## Known Blockers

| Blocker | What It Unlocks | ETA |
|---------|----------------|-----|
| VPS SSH + pm2 restart | Weather proxy cache, reddit spike survival, correct weekend pricing | Today (5 min) |
| LLC approval | REI ($6.16/1K MAU), Backcountry ($0.64), GetYourGuide ($1.20) = +$8/1K | External |
| Apple Developer enrollment ($99) | App Store submission | Post-launch |
| Venue deep links (individual venue pages) | SEO long-tail, direct bookmarking | Post-Reddit-launch, not before |

---

## Explicit Product Decisions — June 4

**Decision 1: skiPass field gap is P2. DEFER post-launch. No backfill before June 7.**

16–25 ski venues are missing the `skiPass` field. The skiPass filter in SearchSheet already handles this correctly — venues without the field simply don't appear when a specific pass is selected, and appear in "any" results. This is a content gap, not a broken filter. It doesn't affect launch-day experience. Backfill lands in the June 10 sprint alongside the summer beach audit.

**Action:** Content agent produces a ready-to-ship diff of skiPass additions for all 67+ ski venues by June 9. One commit, one review.

---

**Decision 2: June 7 Reddit launch is a Sunday. The app will show NEXT weekend (June 12–15) to all new users.**

On Sunday June 7, `upcomingFridayISO()` returns Friday June 12. That's day 8 from today. Open-Meteo 7-day window ends at day 6 roughly, meaning some venues will show `confidence: "low"` — which the front page filters out. The grid may be thinner than expected.

This is not new information — we've known the 7-day window is the product's honest constraint. But nobody has stress-tested "what does the app show on Sunday when the next weekend is day 8 out?" The front-page `scoreWeekend` already drops `confidence: "low"` results. That's correct behavior. But the beach-dominant summer grid + low-confidence filtering could produce a sparse carousel on June 7 specifically.

**Action before June 7 (Jack, 10 minutes):** Open the live app on incognito Sunday or set device clock to June 7. Count visible cards in the carousel. If <5, the fallback carousel (`bestRightNowFallback`, floor 65) should kick in. Confirm it does. This is part of the smoke test in item #16 of the pre-launch checklist. Not a code change. Just a verify.

---

**Decision 3: Summer beach audit is the first post-launch sprint. Commits no earlier than June 10.**

v47 named this risk. It's real. The June N-hemisphere ski grid empties out by late June. The beach-only summer experience hasn't been audited for carousel copy, filter defaults, or whether the empty state feels intentional vs. sparse.

**Scope for June 10 sprint:**
- Beach-only Explore audit (carousel header, filter defaults, empty state copy)
- skiPass field backfill (Content agent diff)
- Eager Supabase script deletion (diff exists, 30-sec apply)
- Unsplash photo optimization (sed block exists in devops-2026-05-06.md)
- SRI + CSP (week of June 10, not day one — needs browser testing)

**None of this ships before Reddit launch. Code freeze holds through June 7.**

---

## This Week's Top 3 Priorities Only

**1. Jack: VPS today (Day 31).** Same command as yesterday. Same 5 minutes. Same binary gate.
```bash
ssh root@198.199.80.21 "pm2 status && curl -s localhost:3001/health | head -30"
# If proxy stale or down:
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull origin main && pm2 restart peakly-proxy && pm2 save"
# Confirm:
curl -s https://peakly-api.duckdns.org/health
```
Expected: JSON with `"wx_cache_size"` key. Anything else = proxy not running new binary.

**2. Jack: Smoke test June 5–6.** Incognito, set home airport (pick SFO or JFK), open Explore. Confirm: (a) carousel shows ≥5 cards, (b) flight CTA goes direct to Aviasales — no modal, (c) Hotels CTA opens Booking.com modal, (d) ScoreBreakdown taps open, (e) Plausible realtime shows events. If any of (a)–(e) fail, tell me immediately — it's a code fix, not a content fix. Clock to Sunday June 7 if you can to pre-validate the day-8 grid.

**3. Jack: Reddit post written by June 6.** First person. Real airport. Real venue. Real number. "I built a thing" not "introducing Peakly." Post 9–11am PST June 7: r/solotravel first, then r/frugaltravel, then r/skiing. 1hr apart. Don't cross-post simultaneously.

**Zero new code between now and June 7.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| skiPass backfill (16–25 venues) | **DEFER to June 10** | Not visible blocker. Content agent produces diff post-launch. |
| New venue additions | **DEFER to June 8 batch** | Code freeze. No venue changes touch app.jsx before Reddit launch. |
| South America / Africa beach venues | **DEFER to June 10** | Geographic balance improves over time; doesn't affect launch quality. |
| Venue deep links / individual pages | **DEFER post-launch** | Already decided. Reddit traffic doesn't need SEO pages on day 1. |
| JSON-LD structured data improvements | **DEFER post-launch** | Existing schema is solid. SEO gains take weeks. Not a Day 1 lever. |
| SRI + CSP | **DEFER to June 10 sprint** | Requires regression testing Babel unsafe-eval. Not a launch week task. |
| Hotels in deal score | **CUT. Final.** | v2 if demand validates. |
| Peakly Pro | **CUT for v1. Final.** | Post-1K MAU. |
| Wishlists / Trips tab | **LOCKED at 1K MAU gate** | No change. |
| App Store submission | **DEFER** | Post-launch. Not on June 7 path. |

---

## Pre-Launch Checklist — June 7 Gate

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (Path B) | ✅ app.jsx:8317 |
| 3 | val-d-isere-s16 deleted (157 venues) | ✅ June 1 |
| 4 | outer-banks ap ORF | ✅ app.jsx:584 |
| 5 | BookingConfirmSheet off flights | ✅ June 1 |
| 6 | SafetyWing CTA live | ✅ app.jsx:7455 |
| 7 | Bora Bora BOB standardized | ✅ June 1 |
| 8 | GEAR_ITEMS live | ✅ Amazon active |
| 9 | Sentry DSN non-empty | ✅ app.jsx:8 |
| 10 | Seasonal default beach N-hem June | ✅ |
| 11 | lateSeason flags (6 ski venues) | ✅ |
| 12 | Cache 20260602a | ✅ sw.js + app.jsx + index.html |
| 13 | Coral reef tag fixes (3 venues) | ✅ June 2 |
| 14 | JSON-LD structured data | ✅ index.html:35 |
| 15 | Static H1 fallback | ✅ index.html:391 |
| 16 | **VPS proxy verified live** | ❌ Jack, today June 4 |
| 17 | **Plausible domain validated** | ❌ Jack, by June 5 |
| 18 | **Human smoke test (incognito)** | ❌ Jack, by June 6 |
| 19 | **Reddit post written** | ❌ Jack's voice, by June 6 |
| 20 | **Agent crontab installed** | ❌ Jack, by June 5 |

**15 of 20 green. All 5 remaining items are Jack-only. No code work left for launch.**

---

## Revenue Model — June 4

| Stream | Code Status | RPM/1K MAU |
|--------|-------------|------------|
| Booking.com (`aid=2311236`) | ✅ app.jsx:7491 | $6.90 |
| Amazon Associates (`peakly-20`) | ✅ GEAR_ITEMS live | $4.48 |
| SafetyWing (`referenceID=peakly`) | ✅ app.jsx:7455 | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ app.jsx:1937 | $0.14 |
| REI (Avantlink) | LLC pending | +$6.16 unlocked |
| Backcountry / GetYourGuide | LLC pending | +$1.84 unlocked |

**Live RPM: $12.06/1K MAU.** LLC approval jumps this to ~$20/1K MAU. At 5K MAU post-launch (90-day conservative), that's $60/month vs. $100/month — real money only past 10K MAU. No action on revenue this sprint.

---

## 90-Day Projection

| Scenario | Users (90d) | What Has to Be True |
|----------|-------------|---------------------|
| VPS live + post in top 10 + June 7 | **6K–8K** | Proxy absorbs spike. Day-8 grid has ≥5 good cards. Post gets karma, not removed. |
| VPS down on launch day | **1K–2K** | Grid empties under 66-user load. "Broken" pins the thread. |
| Launch slips to June 14 | **4K–6K** | Still peak summer. Lose the "catching peak diversity" window. |
| No June launch | **<1K** | Organic SEO only. 100K goal slips to 2027. |

**For 8K not 5K:** VPS confirmed (Jack, today), post reaches top 10 in r/solotravel within 6 hours, flight CTA direct (confirmed). Two of three already done. One is still the same 5-minute SSH command on Day 31.

---

## One Product Risk Nobody Is Talking About

**The Reddit account posting this hasn't been established as a credible voice in these subreddits.**

Every Reddit launch strategy implicitly assumes the account won't be shadowbanned or removed for spam. r/solotravel, r/frugaltravel, and r/skiing all have mods who are aggressive about "I built a thing" posts from accounts with no karma or posting history in the sub.

If the account is new or has no activity in these communities, the post can be:
1. Removed by automod before humans see it (common for accounts <30 days old with <100 karma)
2. Shadowbanned silently (poster sees the post, nobody else does)
3. Downvoted immediately as spam even if the content is good

The technical product is launch-ready. The distribution channel has not been validated.

**What needs to happen before June 7:** Jack checks his Reddit account age and karma. If karma < 100 or account < 60 days old, the plan needs to be "post in comments of an existing thread" or "find a sub that allows new accounts" — not top-level post. r/travel tends to be more forgiving than r/skiing for first-time posters. r/Flights is moderated but allows flight deal posts. A failure here doesn't kill the product — it means week 1 is slower — but nobody has named this risk out loud.

This is fixable in 10 minutes of research and potentially changes which subreddit goes first.
