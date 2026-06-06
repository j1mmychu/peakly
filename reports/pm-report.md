# Peakly PM Report — 2026-06-06 (v50)

> Supersedes v49 (June 5). **Status: RED. Launch is tomorrow (Sunday June 7). Two unresolved gates are still Jack-only tasks. Code is clean. The product ships if VPS is confirmed live by 8am PST June 7. Otherwise we slip to June 14.**

---

## Shipped Since v49 (2026-06-05 → 2026-06-06)

| What | Verdict |
|------|---------|
| **DevOps June 6** — cache bumped 20260605a → 20260606a, Supabase lazy-load fixed (2.45.4 → 2.106.2). | ✅ Good ship. P2 fixed. |
| **Content June 6** — 80/100 data health. New bugs: Thredbo airport (SYD→CBR), Bora Bora near-dup, Gudauri photo dup, coordinate precision. | ✅ Filed. Triage below. |
| **Zero app.jsx logic changes** — code freeze held. | ✅ Correct. |

**Code state June 6:** app.jsx 9,006 lines. Cache 20260606a consistent across sw.js + app.jsx + index.html. PEAKLY_BUILD = "20260606a". Sentry DSN active. Plausible wired. 156 venues (67 skiing + 89 beach). 6 lateSeason ski venues. Supabase lazy-load aligned at 2.106.2.

---

## Bug Triage — June 6

| Bug | Severity | Days Open | Status |
|-----|----------|-----------|--------|
| **VPS proxy unredeployed** | **P0** | **Day 33** | Jack only. One SSH command. Launch gate. |
| **APNS unconfigured** | **P1** | **Day 25 past deadline** | Choose Option A or Option B before launch. |
| SRI on 4 CDN scripts | P1 | Day 37 | DEFER post-launch. Final. |
| Thredbo `ap:"SYD"` — should be `"CBR"` | P2 | Day 2 | Fix in June 10 sprint. Content agent has the diff. |
| Bora Bora near-duplicate (borabora + matira-beach-t6, 3.7km) | P2 | Day 1 | CUT matira-beach-t6 in June 10 sprint. Decision below. |
| Gudauri photo duplicate (shared with thredbo-village-s23) | P2 | Day 2 (two-strikes) | Fix in June 10 sprint. |
| Thredbo coordinate precision (1 decimal vs 4-decimal standard) | P2 | Day 1 | Fix in June 10 sprint. |
| 4 s-series ski venues with factually wrong tags | P2 | Day 2 | Fix in June 10 sprint. |
| 16–25 ski venues missing skiPass field | P2 | Day 8 | DEFER to June 10. |
| CSP meta tag | P2 | Day 37 | DEFER post-launch. |
| Eager Supabase `<script>` (80KB anon load) | P2 | Day 27 | DEFER to June 10. Diff exists. |
| South America / Africa beach underrepresented | P3 | Day 9 | DEFER to June 10. |

**Peakly Pro $9/mo vs $79/yr:** Not a bug. Pro UI removed April 16. No price visible in the live product.

**Sentry DSN empty:** Not a bug. Confirmed active at `app.jsx:8`.

**Cache buster stale:** Not a bug. DevOps bumped to 20260606a today.

---

## Known Blockers

| Blocker | What It Unlocks | ETA |
|---------|----------------|-----|
| **VPS SSH + pm2 restart** | Weather proxy cache (spike survival), weekend-specific pricing | **Today. 3 minutes.** |
| **APNS: Option A or B** | App Store submission unblocked, Alerts tab honest | **Today. 5–30 minutes.** |
| LLC approval | REI (+$6.16/1K MAU), Backcountry (+$0.64), GetYourGuide (+$1.20) | External |
| Apple Developer enrollment ($99) | App Store submission | Post-launch |
| Venue deep links | SEO long-tail | Post-Reddit-launch |

---

## Explicit Product Decisions — June 6

**Decision 1: VPS gate is binary. Launch slips to June 14 if not confirmed by 8am PST June 7.**

At the projected Reddit spike rate (200–500 DAU within the first hour of a top-10 post), 40 DAU is all Open-Meteo will absorb before silent degradation. Per the June 6 DevOps math: 40 simultaneous users × 150 calls = 6,000 upstream calls. Free tier ceiling is 10,000/day. 67 simultaneous users blows it. Venues score null. Cards show no conditions. "Broken" pins the thread and that's game over for Reddit reputation.

June 14 is still peak summer. Still beach-dominant. The 7-day slip costs momentum, not the launch window.

```bash
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull origin main && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | grep wx_cache_size
```

**Decision 2: APNS gets Option B today. Alerts tab hidden on iOS native. Final.**

25 days past the May 13 hard deadline. Wiring .p8 keys on the morning of Reddit launch introduces a 30-min to 3-hour detour that could miss the posting window. Option B is 5 minutes and eliminates App Store rejection risk entirely.

After this report is committed, if Jack says "do it," the patch ships in the next commit:
```jsx
const isNativeIOS = typeof window !== "undefined" &&
  window.Capacitor?.isNativePlatform?.() &&
  window.Capacitor?.getPlatform?.() === "ios";
// Gate tab button + AlertsTab route behind: {!isNativeIOS && ...}
```
Web push alerts remain fully functional. iOS native hides the tab until APNS is wired.

**Decision 3: Bora Bora dedup — CUT matira-beach-t6 in June 10 sprint.**

`borabora` (4.96★) and `matira-beach-t6` (4.79★) are 3.7km apart, same island, same airport (BOB). Not distinct trips. Delete `matira-beach-t6`. Keep `borabora` as canonical. 156 → 155 venues post-June-10.

---

## This Week's Top 3 Priorities Only

**1. Jack: VPS today (Day 33). Launch gate. Non-negotiable.** Command above.

**2. Jack: APNS Option B — say "do it" and I'll write the patch.** 5-line change. Ships before midnight June 6.

**3. Jack: Confirm Reddit account karma/age.** r/solotravel and r/frugaltravel automod requirements. If account < 30 days old or < 100 karma, the top-level post gets shadowbanned. 5-minute check that changes the entire launch distribution plan if the answer is bad. Do not skip this.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Thredbo airport fix (SYD→CBR) before launch | **DEFER to June 10** | P2. One Australian venue with wrong regional airport doesn't break launch. |
| Gudauri photo fix | **DEFER to June 10** | P2. Two-strikes threshold reached but not launch-blocking. |
| Bora Bora dedup | **DEFER to June 10** | P2. No code freeze breaks for cosmetic near-dups. |
| Tag accuracy (4 ski venues) | **DEFER to June 10** | Factually wrong but not visible to users in June (ski venues largely off-season). |
| skiPass backfill | **DEFER to June 10** | Content agent batch diff post-launch. |
| New venues | **DEFER to June 10** | Code freeze. Period. |
| Summer beach carousel copy | **DEFER to June 10** | No logic changes before launch. |
| Hotels in deal score | **CUT. Final.** | v2 if demand validates. |
| Peakly Pro | **CUT for v1. Final.** | Post-1K MAU. |
| Wishlists / Trips tab | **LOCKED at 1K MAU gate** | No change. |
| App Store submission | **DEFER** | Post-launch. |

---

## Pre-Launch Checklist — June 7 Gate

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (hide on iOS until keys wired) | ❌ **Option B patch — Jack confirm, I write today** |
| 3 | 156 venues confirmed (67 ski / 89 beach) | ✅ June 6 Content |
| 4 | outer-banks ap ORF | ✅ app.jsx:584 |
| 5 | BookingConfirmSheet off flights | ✅ June 1 |
| 6 | SafetyWing CTA live | ✅ app.jsx:7455 |
| 7 | Bora Bora BOB standardized | ✅ June 1 |
| 8 | GEAR_ITEMS live | ✅ Amazon active |
| 9 | Sentry DSN non-empty | ✅ app.jsx:8 |
| 10 | Seasonal default beach N-hem June | ✅ |
| 11 | lateSeason flags (6 ski venues) | ✅ |
| 12 | Cache 20260606a consistent | ✅ DevOps June 6 |
| 13 | Supabase lazy-load aligned (2.106.2) | ✅ DevOps June 6 |
| 14 | JSON-LD structured data | ✅ index.html:35 |
| 15 | Static H1 fallback | ✅ index.html:391 |
| 16 | **VPS proxy verified live** | ❌ **Jack. Today. Launch gate.** |
| 17 | **Plausible domain validated** | ❌ Jack, by June 6 EOD |
| 18 | **Human smoke test (incognito)** | ❌ Jack, by June 6 EOD |
| 19 | **Reddit post written** | ❌ Jack's voice, by June 7 AM |
| 20 | **Agent crontab installed** | ❌ Post-launch. Not blocking. |

**15 of 20 green.** Items 16 and 2 are binary quality gates. Items 17–19 are distribution. Item 20 is ops hygiene.

---

## Launch Day Behavior — June 7 (Sunday)

**On Sunday June 7:** `weekendDayIndices()` returns `[0, 1]` (Sun + Mon). `confidence = "high"` (maxDi = 1). Front page shows "Firing this weekend" with the Sun–Mon window. Correct behavior. ✅

**BUT** the actionability is nearly closed for most users arriving Sunday afternoon. They can't book a flight for Sunday evening. The frame is "I'm too late" not "I should go." The first genuinely actionable weekend for new launch-day users is June 12–15.

**Monday June 8 through Wednesday June 10 (the Reddit tail):** `weekendDayIndices()` jumps to next Fri at day 4+. `maxDi = 6` → `confidence = "low"`. Primary carousel filters these out. Falls to `bestRightNowFallback`. Header reads "Looking ahead." **Degraded experience for 72 hours of Reddit tail traffic.** Retention from shared links on Tuesday–Wednesday is at risk.

**High-confidence experience returns Thursday June 12** (next Fri = day 4, medium confidence) and fully locks Friday June 13 (day 0, high confidence).

**No code change before launch.** June 10 sprint item: rename fallback carousel header "Best next weekend" > "Looking ahead." One string. 2 minutes.

---

## Revenue Model — June 6

| Stream | Code Status | RPM/1K MAU |
|--------|-------------|------------|
| Booking.com (`aid=2311236`) | ✅ | $6.90 |
| Amazon Associates (`peakly-20`) | ✅ GEAR_ITEMS live | $4.48 |
| SafetyWing (`referenceID=peakly`) | ✅ | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ (proxy needs redeploy for weekend pricing) | $0.14 |
| REI (Avantlink) | LLC pending | +$6.16 unlocked |
| Backcountry / GetYourGuide | LLC pending | +$1.84 unlocked |

**Live RPM: $12.06/1K MAU.** LLC approval → ~$20/1K MAU.

---

## 90-Day Projection

| Scenario | Users (90d) | What Has to Be True |
|----------|-------------|---------------------|
| VPS live + post top 10 + June 7 | **6K–8K** | Proxy absorbs spike. Reddit account established. Post hits top 10 within 3hr. |
| VPS down on launch | **<500** | App looks broken at 40 DAU. "Broken" thread kills Reddit reputation. |
| Launch slips to June 14 | **4K–6K** | Reddit tail still active. Peak summer window intact. |
| No June launch | **<1K** | SEO only. 100K goal moves to 2027. |

**For 8K not 5K:** VPS confirmed today + post in top 10 within 3 hours + Reddit account established. Two are within our control. One isn't — which means subreddit choice matters. r/solotravel (1.4M members) first. See risk below.

---

## One Product Risk Nobody Is Talking About

**The skiing grid is 6 venues in June. 43% of the catalog is invisible all summer.**

67 of 156 venues are ski resorts. Only 6 carry `lateSeason: true`. The other 61 fail the off-season binary cap in `scoreVenue` and return scores near zero — they never reach the front page or pass the weekendScore >= 75 filter.

If any user from r/skiing or a skiing-focused visitor taps the "Skiing" filter pill in summer, they see 6 venues. Not 67. Not "coming back in November." Just 6 cards. This will read as a broken product to a skiing audience.

**Two implications:**

**1. Don't post in r/skiing on June 7.** Route all June launch posts through r/solotravel and r/frugaltravel. Beach-dominant summer product, beach-dominant audience. r/skiing launch waits until October when the N-hemisphere grid fills.

**2. Add 4–6 glacier/year-round ski destinations before the next ski-audience push.** Les Deux Alpes (FR), Hintertux Glacier (AT), Saas-Fee (CH), Zermatt (CH) all ski year-round. Content agent produces `lateSeason: true` diff for these in the June 10 sprint. Changes the summer skiing grid from 6 → 10 venues. Not a fix before launch — a fix before any ski-audience distribution.
