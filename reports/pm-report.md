# Peakly PM Report — 2026-06-05 (v49)

> Supersedes v48 (June 4). **Status: YELLOW — T-2 to Reddit launch. Code is frozen and clean. 5 Jack-only items remain on the pre-launch checklist. None require code. VPS is the only binary gate for launch quality.**

---

## Shipped Since v48 (2026-06-04 → 2026-06-05)

| What | Verdict |
|------|---------|
| **No app.jsx changes** — code freeze held overnight. | ✅ Correct. |
| **DevOps June 4 audit** — cache bumped 20260602a → 20260604a. 9,006 lines. No new bugs. | ✅ Clean. |
| **Content June 4 audit** — 156 venues confirmed (67 ski / 89 beach). Outer Banks duplicate flagged. | ✅ Filed. |

**Code state June 5:** app.jsx 9,006 lines. Cache 20260604a (DevOps will bump to 20260605a in its run today). Sentry DSN non-empty. Plausible wired to `j1mmychu.github.io`. 156 venues (67 skiing / 89 beach). 6 lateSeason ski venues. JSON-LD present. Static H1 present. Zero code regressions.

---

## Bug Triage — June 5

| Bug | Severity | Days Open | Status |
|-----|----------|-----------|--------|
| **VPS proxy unredeployed** | **P0** | **Day 32** | Jack only. Same SSH command. Same 5 minutes. |
| SRI on 4 CDN scripts | P1 | Day 37 | DEFER post-launch. Final. |
| Outer Banks duplicate (2 venues, same ORF airport) | P2 | Day 1 | DEFER post-launch. Non-blocking. |
| 16–25 ski venues missing skiPass field | P2 | Day 8 | DEFER post-launch. Filter works correctly without field. |
| CSP meta tag | P2 | Day 37 | DEFER post-launch. Final. |
| South America beach underrepresented (2 venues) | P3 | Day 9 | DEFER post-launch. |
| Africa beach underrepresented (6 venues) | P3 | Day 9 | DEFER post-launch. |
| Eager Supabase `<script>` (80KB on every anon load) | P2 | Day 27 | DEFER post-launch. Diff ready at `reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff`. |

**Peakly Pro $9/mo vs $79/yr:** Not a bug. Pro UI was removed April 16. No price appears in the live product.

**Sentry DSN empty:** Not a bug. Confirmed active at `app.jsx:8`.

**Cache buster stale:** Not a bug. DevOps bumped yesterday (20260604a). Today's DevOps run will bump again.

---

## Known Blockers

| Blocker | What It Unlocks | ETA |
|---------|----------------|-----|
| **VPS SSH + pm2 restart** | Weather proxy cache, Reddit spike survival, weekend-specific pricing | Jack, today |
| LLC approval | REI (+$6.16/1K MAU), Backcountry (+$0.64), GetYourGuide (+$1.20) | External |
| Apple Developer enrollment ($99) | App Store submission | Post-launch |
| Venue deep links | SEO long-tail, direct bookmarking | Post-Reddit-launch |

---

## Explicit Product Decisions — June 5

**Decision 1: Outer Banks duplicate — DEFER post-launch. Final.**

Content flagged two OBX beach venues (`beach_ob` + `outer-banks-nags-head-t7`), both served by ORF, 45km apart. A user from the northeast sees two cards for the same region. This is P2, not P0. Both venues have distinct coordinates, distinct tags, distinct IDs — the filter logic treats them correctly. Merging or deleting requires touching VENUES array 48 hours before launch. Not happening. Post-launch content sprint, week of June 10.

**Decision 2: CLAUDE.md venue count and lateSeason count — correct in place now, before stale docs cause further agent confusion.**

CLAUDE.md says "~154 entries" and "7 lateSeason venues." Code has 156 venues and 6 lateSeason flags. Content confirmed both. Every agent run cites stale numbers and wastes a finding slot. Correcting docs is 5 minutes and doesn't touch app.jsx. Doing it in this commit.

**Decision 3: If VPS is not confirmed live by June 6 EOD, launch anyway on June 7 — but change the launch framing.**

This decision needed to be explicit. Day 32 of a 5-minute task. The product works without VPS (direct Open-Meteo fallback, estimates instead of weekend-specific pricing). It degrades at >67 DAU. If the Reddit post hits top 10 in r/solotravel, we'll blow past 67 DAU within the first hour. Without the proxy cache, Open-Meteo will 429, venue scores will go null, and users will see empty grids.

Options:
- **Option A (preferred):** Jack does the VPS today. Launch June 7. Full product.
- **Option B (acceptable):** Jack doesn't do VPS. Launch June 14 instead. One week delay. Still peak summer. Avoids a broken-looking grid on launch day.
- **Option C (not acceptable):** Launch June 7 without VPS. Grid empties at 67 concurrent DAU. "Broken" becomes the thread narrative. Hard to undo first impressions on Reddit.

**Call:** Option A or B. Option C is off the table. Jack decides which by EOD June 5 — not June 6.

---

## This Week's Top 3 Priorities Only

**1. Jack: VPS or slip decision — today, not tomorrow.**

Option A (ship today, launch June 7):
```bash
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull origin main && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | jq .
```
Expected JSON includes `"wx_cache_size"` key. Any 5xx or timeout = proxy not running new binary.

Option B (slip to June 14): Tell me now so I can update the checklist and the Reddit timing.

**2. Jack: Smoke test today (June 5) and again June 6.**

Open incognito. Home airport = SFO. Confirm:
- (a) Carousel shows ≥5 cards
- (b) Click any flight CTA → goes direct to Aviasales, no modal
- (c) Hotels CTA → opens Booking.com modal
- (d) ScoreBreakdown taps open
- (e) Plausible realtime shows events in dashboard

**Also set device clock to June 7 and reopen.** Count visible cards again. Confirm fallback "Looking ahead" carousel shows if primary is sparse. This is the day-8 confidence validation from v48 Decision 2. If <3 cards visible without fallback, that's a code fix — tell me today, not June 6.

**3. Jack: Reddit post written and account validated by June 6.**

Check Reddit account age + karma before writing the post. If account is <60 days old or <100 karma, the June 7 plan changes (see v48: post in existing thread vs. top-level). First-person, real airport, real venue, real number. One subreddit per hour, not simultaneous. No cross-posting.

**Zero new code between now and June 7 unless smoke test reveals a blocker.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Outer Banks venue merge | **DEFER to June 10** | P2, code freeze, 48 hours to launch |
| skiPass field backfill | **DEFER to June 10** | Content agent diff, not a launch blocker |
| New venue additions | **DEFER to June 8 batch** | Code freeze holds through June 7 |
| Val Thorens + Verbier as new lateSeason venues | **DEFER to June 10** | Content flagged, not in VENUES yet, not a launch blocker |
| South America / Africa beach venues | **DEFER to June 10** | Geographic balance improves post-launch |
| Venue deep links / individual pages | **DEFER post-launch** | Already decided. Final. |
| SRI + CSP | **DEFER to June 10 sprint** | Regression risk with Babel unsafe-eval |
| Hotels in deal score | **CUT. Final.** | v2 if demand validates |
| Peakly Pro | **CUT for v1. Final.** | Post-1K MAU |
| Wishlists / Trips tab | **LOCKED at 1K MAU gate** | No change |
| App Store submission | **DEFER** | Post-launch |
| Auto-bump cache buster in auto-push.sh | **SHIP in June 10 sprint** | DevOps flagged 10x. 10-min fix. Not touching deploy scripts 48h before launch. |

---

## Pre-Launch Checklist — June 7 Gate

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (Path B) | ✅ app.jsx:8317 |
| 3 | val-d-isere-s16 deleted (156 venues) | ✅ June 1 |
| 4 | Outer Banks ap ORF | ✅ app.jsx:584 |
| 5 | BookingConfirmSheet off flights | ✅ June 1 |
| 6 | SafetyWing CTA live | ✅ app.jsx:7455 |
| 7 | Bora Bora BOB standardized | ✅ June 1 |
| 8 | GEAR_ITEMS live | ✅ Amazon active |
| 9 | Sentry DSN non-empty | ✅ app.jsx:8 |
| 10 | Seasonal default beach N-hem June | ✅ |
| 11 | lateSeason flags (6 ski venues) | ✅ |
| 12 | Cache 20260604a | ✅ sw.js + app.jsx + index.html |
| 13 | Coral reef tag fixes (3 venues) | ✅ June 2 |
| 14 | JSON-LD structured data | ✅ index.html:35 |
| 15 | Static H1 fallback | ✅ index.html:391 |
| 16 | **VPS proxy verified live** | ❌ Jack, today June 5 |
| 17 | **Plausible domain validated** | ❌ Jack, by June 5 |
| 18 | **Human smoke test (incognito, including June 7 clock)** | ❌ Jack, by June 6 |
| 19 | **Reddit post written + account karma validated** | ❌ Jack's voice, by June 6 |
| 20 | **Agent crontab installed** | ❌ Jack, by June 5 |

**15 of 20 green. All 5 remaining items are Jack-only. No code work left for launch.**

---

## Revenue Model — June 5

| Stream | Code Status | RPM/1K MAU |
|--------|-------------|------------|
| Booking.com (`aid=2311236`) | ✅ app.jsx:7491 | $6.90 |
| Amazon Associates (`peakly-20`) | ✅ GEAR_ITEMS live | $4.48 |
| SafetyWing (`referenceID=peakly`) | ✅ app.jsx:7455 | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ app.jsx:1937 | $0.14 |
| REI (Avantlink) | LLC pending | +$6.16 unlocked |
| Backcountry / GetYourGuide | LLC pending | +$1.84 unlocked |

**Live RPM: $12.06/1K MAU.** LLC approval jumps to ~$20/1K MAU. No action on revenue before launch.

---

## 90-Day Projection

| Scenario | Users (90d) | What Has to Be True |
|----------|-------------|---------------------|
| VPS live + post in top 10 + June 7 | **6K–8K** | Proxy absorbs spike. Day-8 grid has ≥5 good cards. Post gets karma, not removed. |
| VPS live + slip to June 14 | **4K–6K** | Still peak summer. Lose the early-June diversity window. |
| VPS down on launch day | **1K–2K** | Grid empties under 67-DAU load. "Broken" pins the thread. |
| No June launch | **<1K** | Organic SEO only. 100K goal slips to 2027. |

**For 8K not 5K:** VPS confirmed today, smoke test passes, Reddit account karma is real, post reaches top 10 in first 6 hours. Three of four still unconfirmed.

---

## One Product Risk Nobody Is Talking About

**Zero web re-engagement mechanism. Reddit traffic decays in 48 hours. We have no way to pull users back next week.**

The app's core value proposition is weekly — this weekend's conditions. A user who discovers Peakly on Reddit, thinks it's cool, does NOT install the PWA and does NOT sign in, has zero mechanism to see it again in 7 days. No push notification (APNS gated on Apple enrollment). No email (Supabase magic-link exists but there's no trigger to get a first-time visitor to sign in). No RSS. No "check back next Friday" nudge anywhere in the UI.

Reddit launch drives a spike on June 7. Natural decay brings it to near-zero by June 9. Without re-engagement, the 90-day projection assumes organic SEO growth fills the gap — and SEO takes weeks to months for a new domain.

The one lever we have that requires no new code: **an "Email me next Friday's best spots" input field** on the Explore page, above the carousel. Collect an email, store in Supabase, send a weekly magic-link email with the top 3 venues. This is:
- No native push required
- Supabase already wired for email
- Captures the intent of "I liked this, remind me" from first-time visitors who won't install a PWA

This is post-launch scope (week of June 10), not before. But it needs to be on the roadmap or the 90-day projection above 5K relies entirely on SEO + word of mouth, not product retention.

**Decision needed (not today, but before June 14):** Does the June 10 sprint include the email nudge, or do we bet on PWA install rate?

---

## Post-Launch Sprint Scope (Week of June 10)

Locked. Nothing before June 7.

| Item | Who | Effort |
|------|-----|--------|
| Beach-only Explore audit (carousel header, filter defaults, empty state) | Claude | 1h |
| Outer Banks venue merge or differentiate | Claude | 30min |
| skiPass field backfill (67 ski venues) | Claude/Content | 2h |
| Eager Supabase script deletion | Claude | 30-sec apply |
| Auto-bump cache buster in auto-push.sh | Claude | 10min |
| Email nudge / weekly digest input | Decision needed first | TBD |
| Val Thorens + Verbier venue additions | Claude | 30min |
| CLAUDE.md venue count cleanup (156, 6 lateSeason) | ✅ Doing in this commit | Done |
