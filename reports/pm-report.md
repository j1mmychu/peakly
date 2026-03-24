# PM Report: 2026-03-24 (v6)

## Status: YELLOW

App is live, visually polished, and stable. Photos on all card types, scoring functional, flight prices falling back with "est." labels. Yellow because: (1) flight proxy is DOWN — ECONNREFUSED on VPS port 3001; (2) zero analytics — every distribution effort is flying blind; (3) 73 venues (42.7%) still render gradient-only cards; (4) two UX issues on money-critical touch targets unresolved.

---

## Shipped Since Last Report

No new features shipped in this cycle. v5 closed out with:
- Score-colored borders removed from badges and Best Right Now cards
- Cache-busting on app.jsx (`?v=20260323b`)
- 19 venue comma fixes resolving Babel crash
- `.nojekyll` pushed — GitHub Pages now serves static files directly

App is stable. v6 sprint is purely additive.

---

## Cross-Team Input (from peer reports)

| Team | Top Ask | Priority |
|------|---------|----------|
| **Growth** | Add Plausible analytics before any Reddit distribution push | P0 |
| **UX** | Fix heart + Book button touch targets (CompactCard ~18px, Book button ~30px) | P1 |
| **Content** | Add Unsplash photos for 73 missing venues (32 surfing, 41 tanning) | P1 |
| **Content** | Remove duplicate `pipeline` venue (keep `banzai_pipeline`) | P2 |
| **Content** | Add BASE_PRICES for 20 missing airports (CUN, HKT, KEF, IBZ, MBJ...) | P2 |
| **Revenue** | REI affiliate signup (18 gear links earn $0 until tagged) | Jack only |
| **DevOps** | VPS proxy restart (pm2 recommended); HTTPS via Cloudflare or Let's Encrypt | Jack only |

Key context: MagicSeaweed dead + Surfline at $100/yr = ready-made frustrated audience on r/surfing. Reddit launch greenlit the moment analytics are live. Current RPM: $9.33/1K MAU. With REI + GetYourGuide active: $14-16/1K MAU.

---

## Spec Progress

| Phase | Description | Status | % Done |
|-------|-------------|--------|--------|
| **Phase 1** | Critical Bugs & Polish | **Complete** | **100%** |
| **Phase 2** | UX Improvements | In progress | **40%** |
| **Phase 3** | Performance & Reliability | In progress | **25%** |
| **Phase 4** | Content & Engagement | Not started | **0%** |

### Phase 1 (100% -- DONE)
All 5 items complete: mixed content fallback, card data/badge display, venue count fix, default category pills, search bar city names.

### Phase 2 (40%)
- 2.1 Venue photos: **DONE** (109 venues; 73 still missing -- follow-on task)
- 2.2 Best Right Now carousel: **PARTIAL** (always shows, has photos; no "See all" link or key weather stat on cards)
- 2.3 Venue Detail Sheet polish: **NOT DONE** -- highest conversion leverage item
- 2.4 Alerts tab improvements: **NOT DONE** -- presets, firing alerts with venue cards
- 2.5 Profile tab improvements: **NOT DONE**
- 2.6 Haptic feedback everywhere: **NOT DONE**

### Phase 3 (25%)
- 3.1 Lazy load weather: **NOT DONE**
- 3.2 Image lazy loading: **DONE**
- 3.3 Error handling audit: **PARTIAL** -- flight fallback works, weather errors incomplete
- 3.4 Restore Trips tab: **CANCELED** -- Jack confirmed 3-tab nav is final

### Phase 4 (0%)
All 4 items pending.

---

## Top 3 Priorities

### 1. Add Plausible analytics to index.html (5 min, CRITICAL)
Every agent unanimously calls this the #1 unblocked task. No analytics = no ability to measure or learn. One script tag in index.html head:

  <script defer data-domain="j1mmychu.github.io/peakly" src="https://plausible.io/js/script.js"></script>

Jack needs to create account at plausible.io (free tier, ~2 min). Do NOT launch on Reddit before this is live.
Unblocks: every growth experiment, retention measurement, affiliate conversion tracking.

### 2. Fix touch targets on heart + Book buttons (1 hr, HIGH)
- CompactCard heart: ~18x18px -> needs width:32, height:32 flex wrapper + fontSize:15
- ListingCard Book button: ~28-30px tall -> needs padding:"8px 14px", minHeight:36

These are the two most-tapped elements. Fixing before Reddit launch reduces mis-taps and increases affiliate clicks. Surgical change -- no design impact.

### 3. Add photos to remaining 73 venues (3 hrs, HIGH)
57.3% photo coverage is not launch quality. 32 surfing + 41 tanning venues rendering gradient-only cards. Purely a data task -- add Unsplash URLs to venue entries. No API key needed.

On deck: Venue Detail Sheet polish (Phase 2.3), remove duplicate `pipeline` venue (1-line fix), add BASE_PRICES for 20 missing airports.

---

## Decisions Made

| Date | Decision |
|------|----------|
| 2026-03-24 | Plausible analytics is ship-now priority. Reddit launch greenlit but must not happen without measurement. |
| 2026-03-24 | Touch target fixes before Venue Detail Sheet -- usability before polish. |
| 2026-03-24 | Plausible over GA4 -- privacy-friendly, no cookie banner, free tier covers early traffic. |
| 2026-03-24 | Duplicate `pipeline` venue to be removed next batch -- keep `banzai_pipeline` (6,420 vs 1,203 reviews). |
| Ongoing | 3-tab nav is final -- Explore, Alerts, Profile. Spec 3.4 canceled. |
| Ongoing | Phase 2.3 (Venue Detail Sheet) is the next major feature after quick wins clear. |

---

## Blockers

| # | Blocker | Owner | Action Needed |
|---|---------|-------|--------------|
| 1 | **Plausible account** -- need account + site ID | Jack | 2-min signup at plausible.io |
| 2 | **VPS proxy DOWN** -- ECONNREFUSED on port 3001 | Jack/DevOps | SSH in, pm2 restart all |
| 3 | **HTTPS on VPS** -- mixed content blocks real flight prices | Jack/DevOps | Cloudflare tunnel or Let's Encrypt + nginx |
| 4 | **REI affiliate signup** -- 18 links earn $0 | Jack/Revenue | Apply at Avantlink |
| 5 | **Sentry DSN** -- SENTRY_DSN = "" on line 6 of app.jsx | Jack | Sign up at sentry.io, paste DSN |
| 6 | **LLC approval** -- blocks Stripe, Amazon Assoc., domain | External | Legal process |

---

*Next report: 2026-03-31*
