# PM Report: 2026-03-24 (v6)

## Status: YELLOW

Site is live. Recent commits stabilized app (Babel crash fixed, photos added, .nojekyll pushed). Core issues holding YELLOW: (1) flight proxy is DOWN (ECONNREFUSED port 3001 — all prices are estimates), (2) 73 venues (42.7%) still have no photo, (3) VenueDetailSheet is unpolished — the highest-value conversion surface hasn't been touched, (4) zero analytics means we're flying completely blind.

---

## Shipped Recently (last 15 commits)

- **fb8970b** — Sync agent reports
- **da6ba3d** — Cache-bust app.jsx + always show Best Right Now section
- **089dfc6** — Fix missing commas in 19 venue entries (Babel crash, CRITICAL fix)
- **1dd1308 / 1f7cd7d** — .nojekyll added (GitHub Pages now deploys correctly)
- **6747c9b** — Remove score borders from GoVerdictBadge and Best Right Now cards
- **75c4bdf** — Photos in Best Right Now carousel and GuidesTab featured cards
- **aeba256** — Kill score borders, fix card padding, photos in similar venues
- **bad3ae8** — Fix duplicate photo fields causing Babel parse error
- **0567fcf** — Photos added to all venues (partial)
- **af6d5fa** — Add venue photos, fix duplicate Pipeline ID, add Amazon affiliate tags
- **1be1df3** — Unsplash photo URLs to top 30 venues
- **489fdd0** — Sync CLAUDE.md with full product vision + agent team

---

## Spec Progress

| Phase | Description | Status | % Done |
|-------|-------------|--------|--------|
| **Phase 1** | Critical Bugs & Polish | **Complete** | **100%** |
| **Phase 2** | UX Improvements | In progress | **40%** |
| **Phase 3** | Performance & Reliability | In progress | **25%** |
| **Phase 4** | Content & Engagement | Not started | **0%** |

### Phase 1 (100% — DONE)
All 5 items shipped and stable.

### Phase 2 (40%)
- 2.1 Venue photos: **DONE** — 109 of 182 venues (57%). Photo pipeline exists and working.
- 2.2 "Best Right Now" carousel: **PARTIAL** — photos on cards, always shows; still missing "See all" link and key weather stat
- 2.3 Venue Detail Sheet polish (Airbnb-style): **NOT DONE** — top priority for v6
- 2.4 Alerts tab improvements: **NOT DONE**
- 2.5 Profile tab improvements: **NOT DONE**
- 2.6 Haptic feedback everywhere: **NOT DONE**

### Phase 3 (25%)
- 3.1 Lazy load weather: NOT DONE
- 3.2 Image lazy loading: **DONE** (loading="lazy" on img tags)
- 3.3 Error handling audit: PARTIAL (flight fallback works, weather errors incomplete)
- 3.4 Restore Trips tab: **CANCELED** (Jack: 3-tab nav is final — Explore, Alerts, Profile)

### Phase 4 (0%)
No items started.

---

## Cross-Team Signals

**Content (v5 report):**
- 73 venues missing photos — surfing (32), tanning (41) are worst
- Duplicate `pipeline` + `banzai_pipeline` entries — same wave, same airport, banzai has richer data. Remove `pipeline`.
- 58 venue airports missing BASE_PRICES — falling back to $800 default, inaccurate
- 7 categories have only 1 venue (diving, climbing, kite, kayak, fishing, mtb, paraglide) — category pills lead to single-result dead ends

**DevOps (v5 report):**
- Flight proxy (104.131.82.242:3001) — **DOWN** (ECONNREFUSED). All users see "est." prices. VPS issue, needs Jack to investigate.
- Open-Meteo was rate-limited (429) — transient, not Peakly's fault
- Possible Babel error still detected in page content — needs verification on live site

**Revenue (v5 report):**
- Amazon Associates: WORKING (20 URLs tagged `peakly-20`)
- Booking.com: WORKING (aid=2311236 on hotel CTA)
- REI affiliate: NO TAG — 18 high-value product links generating $0 commission. Needs Avantlink signup.
- GetYourGuide: NO PARTNER ID — 2 experience links with no tracking
- SafetyWing: WORKING (referenceID=peakly)
- RPM with live streams: ~$9.33/1K MAU. With REI + GetYourGuide activated: ~$14-16/1K MAU.

---

## Top 3 Priorities for v6

### 1. Venue Detail Sheet polish — Phase 2.3 (HIGH, 2-3 hrs)
This is the conversion point. When a user taps a venue card, the detail sheet must sell the trip. Full-width photo hero, sticky "Book Flights" CTA, 7-day weather inline, condition score breakdown, similar venues. Photos are already in the data. The sheet just needs to use them properly and match card quality. This is the single highest-leverage impact item on affiliate revenue.

**Spec ref:** Phase 2.3
**Impact:** Directly increases Booking.com + Travelpayouts affiliate clicks

### 2. Add photos to 73 remaining venues — Content priority (HIGH, 1-2 hrs)
73 venues (42.7%) render with gradient-only cards — visually weaker than photo cards. Content report flags surfing (32 missing) and tanning (41 missing) as priorities. All skiing venues already have photos. This closes the biggest visual gap in the app.

**Spec ref:** Phase 2.1 extension
**Impact:** Every photo-less card becomes a visual upgrade on next deploy

### 3. Add Plausible analytics — unblocks all growth decisions (HIGH, 30 min)
One `<script>` tag in index.html. No cookie banner, no GDPR complexity. Without analytics every experiment, every UX decision, every growth tactic is a guess. This must ship before any marketing push. Jack needs to create account at plausible.io (free tier up to 10K pageviews/mo) and share the site ID.

**Spec ref:** Pre-launch checklist (unlocks growth measurement)
**Impact:** Enables all data-driven decisions going forward

---

## Decisions Made

- **3-tab nav is final.** Explore, Alerts, Profile. Spec item 3.4 canceled.
- **Detail sheet before analytics.** 2.3 is higher revenue leverage, but analytics must follow immediately after.
- **Photos before thin category expansion.** Fill 73 missing venue photos before adding new categories. Depth beats breadth.
- **Duplicate pipeline fix is a quick win.** Remove `id:"pipeline"` entry, keep `id:"banzai_pipeline"`. Same wave, banzai has 6,420 reviews vs 1,203 — simple 1-line deletion.

---

## Blockers

| # | Blocker | Owner | Impact |
|---|---------|-------|--------|
| 1 | **Flight proxy DOWN** — VPS port 3001 not responding. All prices are estimates. Jack needs to SSH in and restart the proxy process or investigate the service | Jack | All flight prices show "est." |
| 2 | **Plausible analytics** — need Jack to create account at plausible.io (free) and share script tag / site ID | Jack | Flying blind on all usage data |
| 3 | **REI Avantlink signup** — 18 gear product links exist, 0 revenue from them. 30-min signup unlocks ~$4-5/1K RPM | Jack | ~$4-5/1K MAU revenue foregone |
| 4 | **Sentry DSN** — line 6 of app.jsx: `SENTRY_DSN = ""`. Blind to production crashes. Needs Jack to sign up at sentry.io | Jack | No crash visibility |
| 5 | **VPS HTTPS** — mixed content will block real flight prices even when proxy is back up. Need Cloudflare tunnel or Let's Encrypt | Jack/DevOps | Structural, medium urgency |
