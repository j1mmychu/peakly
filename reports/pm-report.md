# PM Report: 2026-03-25 (v13)

**Status: YELLOW — Technically stable. Conversion surface still broken. Reddit launch still blocked.**

---

## Overnight Activity Review

### Commits since last report (v5, 2026-03-23)

Significant sprint across two days. Key commits in rough order:

| Commit | Verdict | Serves 100K? |
|--------|---------|-------------|
| Fix syntax error (double comma, Babel crash) | ✅ Correct. P0 fix. | Yes |
| Trim 333 → 192 venues with unique photos | ✅ Right call. Quality > count. | Yes |
| PWA manifest + service worker | ✅ Needed for mobile install. | Yes |
| Plausible analytics (5 events) | ✅ Was blocking all measurement. | Yes |
| HTTPS proxy (Caddy + Let's Encrypt) | ✅ Unblocked real flight prices. | Yes |
| JSON-LD structured data (SEO 91%) | ✅ Long-term SEO compound. | Yes |
| Alert region + date filters | ⚠️ Moderate value. Alerts tab has zero real users. | Maybe |
| Date-aware scoring + Best Window on cards | ✅ Core UX — differentiated. | Yes |
| Profile-based hero personalization | ✅ Makes explore feel custom. | Yes |
| 22 new domestic US airports | ⚠️ Good, but not the constraint. | Maybe |
| Swipe-down dismiss on detail sheet | ✅ Expected mobile UX. | Yes |
| Peakly Pro pricing fixed ($79/yr) | ✅ Credibility fix. Was embarrassing. | Yes |
| Cache buster bumped | ✅ Ops hygiene. | Yes |
| **VenueDetailSheet photo hero + sticky CTA** | ❌ **Still not done. 4th consecutive cycle.** | Gates launch |

**Assessment:** Good sprint. Infrastructure is now solid — HTTPS, analytics, PWA, SEO, 192 clean venues. But the #1 priority — the detail sheet — has been flagged P1 for 4 cycles and still ships zero. Everything else built was correct; this one omission is the pattern failure.

---

## Bug Triage

### P0 — Launch Blocker
- **VenueDetailSheet: no photo hero, no sticky CTA, no score breakdown** — Every tap from Explore lands here. This is the conversion surface. Zero Booking.com or flight affiliate revenue flows until this is fixed. It has been P1 for 4 consecutive cycles. **Nothing else ships until this is done.** Estimated effort: 4–6 hours.

### P1 — Core Flow Broken
- **Flight links earn $0** — `buildFlightUrl()` still points to `google.com/flights`. Google has no affiliate program. Aviasales/Travelpayouts deep links with our marker tag earn actual commission. Every flight click right now is wasted money. Effort: 2–3 hours.
- **Sentry DSN empty** — `SENTRY_DSN = ""` line 6 of app.jsx. We are completely blind to production JavaScript errors. One bad push and we won't know for days. Jack: 5 minutes at sentry.io, free tier.

### P2 — Friction
- **Open-Meteo rate limit risk** — Free tier is 10K/day. ~30 concurrent users exhausts it. No weather cache implemented yet. This blocks any marketing push — if a Reddit post drives 200 users, weather breaks for everyone. Effort: 2 hours.
- **Score validation** — No thumbs up/down on score badge. We're scoring venues with zero feedback loop. Users can't tell us when the score is wrong.

### P3 — Cosmetic / Accepted Risk
- **AFFILIATE_ID placeholders** — REI and Backcountry links still use placeholder tags (earn $0). Blocked by LLC — accept this for now.
- **Service worker stale cache risk** — Previous SW incident caused extended outage. CACHE_NAME version bump discipline is critical on every deploy.

---

## Known Blockers

| Blocker | Owner | Unblocks |
|---------|-------|---------|
| LLC approval | Jack (external) | REI, Backcountry, GetYourGuide affiliates, Stripe, Peakly Pro (+$21.17 RPM) |
| Sentry DSN | Jack (5 min at sentry.io) | Production error visibility |
| REI Avantlink signup | Jack (30 min, no LLC needed) | +$6.16 RPM on 22 existing links |
| VenueDetailSheet redesign | Dev (4–6 hrs) | Reddit launch, Booking.com revenue, affiliate CTR |

---

## Top 3 Priorities This Week

### 1. VenueDetailSheet photo hero + sticky CTA + score breakdown
Full-width photo hero at top. Sticky "Book Flights" button anchored to bottom. 7-day forecast inline. Score breakdown (what's good, what's borderline). Thumbs up/down on score badge. Similar venues at bottom. This is the entire conversion funnel. Reddit traffic, Booking.com, Travelpayouts — all depend on this one component. **4 cycles of deferral ends now. This ships before anything else.**

**Definition of done:** User taps a venue card, sees a hero photo, sees conditions clearly explained, can tap one button to book flights with a Travelpayouts/Aviasales deep link.

### 2. Switch flight links to Aviasales/Travelpayouts deep links
`buildFlightUrl()` generates URLs to `google.com/flights`. Google earns the click. We earn $0. Aviasales deep links with Travelpayouts marker earn commission on actual bookings. This is a 2–3 hour change that turns every flight click into real revenue. Ship this in the same sprint as the detail sheet.

### 3. Open-Meteo weather cache (localStorage, 30-min TTL)
~30 concurrent users exhaust the free tier. One Reddit post driving 200 visits breaks weather for everyone. Cache the weather response in localStorage keyed by `{lat}_{lon}_{date}` with 30-minute TTL. 2 hours of work. This is the prerequisite for any distribution push.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|---------|--------|
| Dark mode | **CUT** | Zero signal it moves retention or acquisition. Not in next 6 months. |
| Offline support | **CUT** | Stale conditions data defeats the value prop entirely. Incompatible with the product. |
| Trips + Wishlists tabs | **DEFER** | Revisit at 1K users. Core Explore → Detail → Book flow converts first. |
| Venue expansion (400+) | **DEFER** | 192 quality venues > 400 mediocre ones. Post-launch. |
| Hotel affiliate deep links per venue | **DEFER to detail sheet sprint** | Right idea, wrong timing. Build inside VenueDetailSheet redesign, not standalone. |
| 50+ new venues (South America, Africa, SE Asia) | **DEFER** | Distraction. Breadth does not convert at this stage. |
| Fuzzy search / search history | **DEFER** | Doesn't move acquisition or revenue. Post-launch. |
| Alert system UX improvements | **DEFER** | Alerts tab has zero confirmed users. Don't polish what nobody uses yet. |
| Add 4 airports (LAS, PHX, MSP, DTW) | **SKIP** | BASE_PRICES already has these per CLAUDE.md. Check before adding. |
| Trip insurance CTA (World Nomads) | **DEFER** | Not in top 10 revenue drivers. Add after LLC unblocks main affiliates. |

---

## Explicit Product Decisions This Session

1. **SHIP: VenueDetailSheet redesign.** It has been P0 for 4 consecutive cycles. It ships before the next commit on any other feature. Period.

2. **SHIP: Aviasales flight links in same sprint.** `buildFlightUrl()` change is 2–3 hours of surgical code. Every flight click currently earns $0. This is a revenue switch, not a feature.

3. **CUT: Score validation as a standalone task.** Thumbs up/down ships inside VenueDetailSheet redesign, not as a separate item. It has no UX home until the detail sheet is rebuilt. Combining these is correct — do not split.

---

## Success Criteria

### What defines success?

| Metric | Threshold | How We Measure |
|--------|-----------|-------------|
| 90-day users | 5K–8K | Plausible unique visitors |
| D7 retention | >15% | Plausible return visits within 7 days |
| Affiliate RPM (live now) | >$15/1K MAU | Booking.com + Amazon + Travelpayouts clicks |
| Flight affiliate CTR | >3% on detail view | Plausible `flight_click` events |
| Reddit launch | Zero mod removals, 200+ visits per post | Plausible referral source |

### Path to 8K, not 5K

The delta between 5K and 8K at 90 days is three things:

1. **VenueDetailSheet converts.** If users tap a venue and bounce — no photo, no clear CTA — Reddit traffic is entirely wasted. A working detail sheet with a sticky Book button is the #1 lever. This alone could double 90-day users.

2. **Per-venue share URLs work.** Every share right now points to the generic homepage. Per-venue deep links let one Reddit comment on r/surfing showing Pipeline conditions drive return traffic from that exact comment for weeks. Without this, social sharing is a dead end.

3. **D7 retention above 15%.** We have no return mechanism — no push notifications, no email digest. The Alerts tab exists but fires nothing real. Weather cache enables a daily condition-checking habit. These compound: a user who checks Peakly 4 days/week becomes an evangelist.

---

## Product Risk Nobody Is Talking About

**The scoring algorithm has zero feedback signal, and it might be systematically wrong.**

We built a proprietary scoring system that tells users conditions are "Epic" or "Firing." We have never validated these scores against actual user experience. If a surfer taps Pipeline, sees 82/100 ("Firing"), flies there, and finds 2-foot slop — they never open the app again and they tell their friends it's broken. The scoring model makes assumptions (wave height thresholds, wind cutoffs, temperature weightings) that have not been tested against ground truth.

We are about to drive Reddit traffic to an unvalidated algorithm. If it's wrong in a detectable way, the Reddit community will identify it within 24 hours and it will define the brand negatively before we have 100 users.

**Mitigation:** Ship thumbs up/down on VenueDetailSheet score badge as part of the detail sheet sprint. Even 20 early user signals will reveal systematic bias before it becomes a reputation problem. This is not a nice-to-have — it's risk management.

---

*Report written: 2026-03-25*
*Next report: 2026-03-26*
*Author: PM Agent v13*
