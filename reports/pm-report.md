# PM Report: 2026-03-24 (v6)

## Status: YELLOW

App is live, visually polished, and earning-ready. Yellow because: (1) flight proxy is DOWN — ECONNREFUSED on VPS port 3001, all prices showing "est." fallback, needs manual SSH restart; (2) zero analytics — every distribution effort this week is flying blind; (3) 73 venues (42.7%) still missing photos, degrading card quality for nearly half the catalog.

---

## Shipped Since Last Report

Nothing code-shipped since v5. Remote had additional agent report commits (content, devops) from other sessions that are now merged in. No product code was lost.

---

## Spec Progress

| Phase | Description | Status | % Done |
|-------|-------------|--------|--------|
| **Phase 1** | Critical Bugs & Polish | **COMPLETE** | **100%** |
| **Phase 2** | UX Improvements | In progress | **35%** |
| **Phase 3** | Performance & Reliability | In progress | **25%** |
| **Phase 4** | Content & Engagement | Not started | **0%** |

### Phase 1 (100% — DONE)
All 5 items complete: mixed content fallback, card data/badge display, venue count fix, default category pills, search bar city names.

### Phase 2 (35%)
- 2.1 Venue photos: **DONE** — 98/171 venues have photos (57.3% coverage). 73 remaining.
- 2.2 Best Right Now carousel: **PARTIAL** — section always shows, photos added. No "See all" filter link, no key weather stat on cards.
- 2.3 Venue Detail Sheet polish: **NOT DONE** — highest conversion leverage item still unshipped.
- 2.4 Alerts tab improvements: **NOT DONE**
- 2.5 Profile tab improvements: **NOT DONE**
- 2.6 Haptic feedback everywhere: **NOT DONE**

### Phase 3 (25%)
- 3.2 Image lazy loading: **DONE**
- 3.3 Error handling: **PARTIAL** — flight fallback works, weather errors incomplete
- 3.1 Lazy load weather: **NOT DONE**
- 3.4 Trips tab restore: **CANCELED** — Jack confirmed 3-tab nav is final

### Phase 4 (0%)
All items pending.

---

## Cross-Team Findings (2026-03-24)

### DevOps (RED FLAG)
- **Flight proxy DOWN** — 104.131.82.242:3001 returning ECONNREFUSED. VPS Node process has crashed. Needs SSH restart — not a code issue.
- **Possible Babel error in production** — WebFetch detected error handler HTML on live site. Likely a false positive from index.html fallback content. Commit 089dfc6 fixed 19 missing commas — should be clean. Verify in browser.
- app.jsx is 5,446 lines / 356KB — healthy, no action needed.

### Content (HIGH PRIORITY)
- **73 venues missing photos** — 32 surfing, 41 tanning/beach. Gradient-only fallback is noticeably weaker.
- **Duplicate Pipeline venue** — id:"pipeline" (line ~218) and id:"banzai_pipeline" (line ~356). Same wave. Remove pipeline, keep banzai_pipeline (6,420 reviews vs 1,203).
- **7 thin categories** with 1 venue each (Diving, Climbing, Kite, Kayak, Fishing, MTB, Paraglide) — defer expansion to v7.
- **58 venue airports** missing BASE_PRICES — fall back to $800 default (inaccurate).

### Growth (URGENT)
- **Plausible analytics still not added.** Every distribution experiment is blind without it. Growth, Revenue, and PM unanimously call this the #1 unblocked task.
- Reddit soft launch is greenlit — app is visually polished, OG tags live, conditions data useful. Only blocker is analytics.
- 90-day projection: 4,000–6,000 users with zero ad spend.
- MagicSeaweed death + Surfline $100/yr paywall = ready-made audience on r/surfing.

### Revenue
- Amazon (20 links, tag=peakly-20): LIVE
- Booking.com (aid=2311236): LIVE
- SafetyWing (referenceID=peakly): LIVE
- REI (18 links): NO AFFILIATE TAG — waiting on Avantlink approval. ~$4-5 RPM left on the table.
- GetYourGuide (2 links): NO PARTNER ID
- Backcountry (2 links): NO AFFILIATE TAG
- Current RPM: $9.33/1K MAU. With REI + GYG active: $14-16/1K MAU.

### UX
- **CompactCard heart button: 18x18px touch target** — Apple minimum is 44x44pt. Fix: add width:32, height:32 flex wrapper, bump fontSize to 15.
- **ListingCard "Book" button: ~28-30px tall** — primary revenue CTA too small. Fix: padding:"8px 14px", minHeight:36.
- **Section header type scale inconsistent** — "Best Right Now" at fontSize:16 vs page titles at 22-24. Medium priority.
- Design score: 8.1/10 (up from 7.2 in v4).

---

## Top 3 Priorities

### 1. Add Plausible analytics to index.html (5 min, CRITICAL)
Every agent agrees: no analytics = no data = no ability to learn. One script tag in index.html:
  <script defer data-domain="j1mmychu.github.io/peakly" src="https://plausible.io/js/script.js"></script>
Requires Jack to create account at plausible.io (free tier, ~2 min). Do not launch on Reddit before this is live.

### 2. Fix touch targets on heart + Book buttons (1 hr, HIGH)
- CompactCard heart: 18x18px → needs 32x32px wrapper + fontSize:15
- ListingCard Book button: 28-30px → needs padding:"8px 14px", minHeight:36
These are the two most-tapped elements in the app. Fixing before Reddit launch reduces mis-taps and increases affiliate clicks.

### 3. Add photos to remaining 73 venues (3 hrs, HIGH)
57.3% photo coverage is not launch quality. 32 surfing + 41 tanning venues rendering gradient-only cards. Purely a data task — add Unsplash URLs to 73 venue entries.

**On deck:** Venue Detail Sheet polish (Phase 2.3), remove duplicate pipeline venue (1-line fix).

---

## Decisions Made

| Date | Decision |
|------|----------|
| 2026-03-24 | Plausible analytics is ship-now priority. Reddit launch greenlit but must not happen without measurement. Jack needs plausible.io account (2 min). |
| 2026-03-24 | Touch target fixes before Venue Detail Sheet — usability before polish. |
| 2026-03-24 | No distribution push before analytics — any Reddit traffic without Plausible is wasted signal. |
| 2026-03-24 | Duplicate pipeline venue to be removed — keep banzai_pipeline (richer data). 1-line delete, ships with next batch. |
| Ongoing | 3-tab nav is final — Explore, Alerts, Profile. Spec 3.4 canceled. |

---

## Blockers

| # | Blocker | Owner | Unblocked by |
|---|---------|-------|--------------|
| 1 | Flight proxy DOWN — VPS port 3001 not responding | Jack | SSH to VPS, pm2 restart all |
| 2 | Plausible account needed | Jack | 2-minute signup at plausible.io |
| 3 | LLC approval pending — blocks Stripe, REI/GYG signups, domain | Jack/Legal | Legal process |
| 4 | Sentry DSN empty — line 6 of app.jsx | Jack | Sign up at sentry.io |
| 5 | VPS HTTPS — mixed content blocks real flight prices | Jack/DevOps | Cloudflare tunnel or Let's Encrypt + nginx |
