# PM Report: 2026-03-24 (v7)

## Status: YELLOW → improving

22 commits that had been built but never merged to master were fast-forwarded today. The live site is now significantly ahead of what master showed yesterday. App is stable, Plausible analytics is live, SEO foundations are in place, and all Phase 1 bugs remain fixed. Yellow because: (1) VPS proxy still DOWN — all flight prices are estimates; (2) 72 venues (42%) render without photos; (3) Venue Detail Sheet is still the basic version — the main conversion surface hasn't been polished yet.

---

## Shipped Since Last Report

**Fast-forwarded 22 commits to master today (previously unmerged):**

| Feature | Commit | Status |
|---------|--------|--------|
| Plausible analytics added to index.html | ab16300 | LIVE |
| Title tag expanded to 55 chars | ed2178c | LIVE |
| Canonical URL `<link rel="canonical">` | ed2178c | LIVE |
| robots.txt created | ed2178c | LIVE |
| sitemap.xml created | ed2178c | LIVE |
| 5 new category options in CATEGORIES | ed2178c | LIVE |
| Hero card photo (full-width Unsplash) | 85146a6 | LIVE |
| Category-filtered Best Right Now carousel | 85146a6 | LIVE |
| 6 new agent prompts (QA, SEO, data enrichment, competitor, community, code quality) | 1522b64 | LIVE |
| Swipe-down-to-dismiss on VenueDetailSheet | fd1ac99 | LIVE |
| Date-aware condition scoring (dayIndex) | fd1ac99 | LIVE |
| Best Window indicator on ListingCard + CompactCard | fd1ac99 | LIVE |
| Profile-based hero personalization (+15pts for user sports) | fd1ac99 | LIVE |
| Alert region/continent filter (UI + matching logic) | fd1ac99 | LIVE |
| Alert date range filter (UI + matching logic) | fd1ac99 | LIVE |
| 22 new US domestic airports (CLT, IND, CVG, BOI, GEG, etc.) | fd1ac99 | LIVE |
| Flight API timeout to 5s + status indicator | fd1ac99 | LIVE |
| Touch targets fixed (heart buttons: width:32, height:32) | 2158d7c | LIVE |
| Book CTA height fixed (minHeight:36, padding:8px 14px) | 2158d7c | LIVE |
| Typography scale normalized (page/section/subsection) | 2158d7c | LIVE |
| CompactCard text floor + hero contrast fix + saved heart target | f379443 | LIVE |
| .gitignore added | e41821d | LIVE |

---

## Cross-Team Input

| Team | Top Ask | Priority |
|------|---------|----------|
| **QA** | All 6 checks PASS. Mixed content on flight proxy is only known risk. | P0 (Jack/DevOps) |
| **SEO** | Analytics now live. Still missing: JSON-LD structured data, apple-touch-icon. | P2 |
| **Content** | 72 venues missing photos. Duplicate `pipeline` not yet removed. 20 airports missing BASE_PRICES. | P1 |
| **Growth** | Reddit launch greenlit. Plausible is live. Post first condition card within 48 hrs. | P0 action |
| **UX** | Touch targets fixed. Next: Venue Detail Sheet (Phase 2.3) — the conversion surface. | P1 |
| **Revenue** | $9.33 RPM live. REI signup (18 links, 0 tracking) is highest-leverage unblocked revenue task. | Jack only |
| **DevOps** | VPS proxy still ECONNREFUSED. pm2 restart needed. HTTPS not configured. | Jack only |

---

## Spec Progress

| Phase | Description | Status | % Done |
|-------|-------------|--------|--------|
| **Phase 1** | Critical Bugs & Polish | **Complete** | **100%** |
| **Phase 2** | UX Improvements | In progress | **55%** |
| **Phase 3** | Performance & Reliability | In progress | **40%** |
| **Phase 4** | Content & Engagement | Not started | **0%** |

### Phase 1 (100% — DONE)
All 5 items complete: mixed content fallback, card data/badge display, venue count fix, default category pills, search bar city names.

### Phase 2 (55%)
- 2.1 Venue photos: **DONE** (99 venues; 72 still missing — follow-on data task)
- 2.2 Best Right Now carousel: **DONE** (photos, category filter, always shows; no "See all" link or key weather stat on cards)
- 2.3 Venue Detail Sheet polish: **NOT DONE** — highest conversion leverage item
- 2.4 Alerts tab improvements: **NOT DONE** — presets, firing alerts with venue cards
- 2.5 Profile tab improvements: **NOT DONE**
- 2.6 Haptic feedback everywhere: **NOT DONE**

### Phase 3 (40%)
- 3.1 Lazy load weather: **NOT DONE**
- 3.2 Image lazy loading: **DONE**
- 3.3 Error handling audit: **DONE** — flight fallback + 5s timeout + status indicator all live
- 3.4 Restore Trips tab: **CANCELED** — 3-tab nav is final

### Phase 4 (0%)
All 4 items pending: venue data quality pass, seasonal intelligence, Trending section, onboarding improvements.

---

## Top 3 Priorities

### 1. Add photos to 72 remaining venues — Content (3-4 hrs)
57.9% photo coverage is not launch quality. 33 surfing + 39 tanning venues rendering gradient-only cards degrade the visual experience. Purely a data task — add Unsplash source URLs to venue entries. No API key, no code change to components. Do before Reddit launch.

### 2. Venue Detail Sheet polish — Phase 2.3 (3-4 hrs)
This is the conversion point. When a user taps a card, the detail sheet must sell the trip. Full-width photo hero, sticky "Book Flights" CTA at bottom, 7-day mini forecast, condition score breakdown, similar venues section. Photos are in the data and components are working — the detail view needs to match card quality. Highest impact on affiliate clicks and Booking.com conversions.

### 3. Remove duplicate `pipeline` venue + add BASE_PRICES for 20 airports (1 hr)
- Remove `id:"pipeline"` entry, keep `id:"banzai_pipeline"` (6,420 vs 1,203 reviews, richer data)
- Add BASE_PRICES for: CUN, HKT, KEF, IBZ, MBJ, SXM, PLS, DBV, FAO, NCE, KOA, EYW, MYR, TPA, SRQ, VPS, STT, AUA, NAP, JMK — fixes inaccurate $800 fallback for Caribbean/European destinations

On deck after: Alerts tab preset templates (Phase 2.4), JSON-LD structured data, apple-touch-icon for PWA home screen.

---

## Decisions Made

| Date | Decision |
|------|----------|
| 2026-03-24 | Fast-forwarded 22 unmerged commits to master — all improvements now on main branch |
| 2026-03-24 | Plausible analytics is live. Reddit soft launch is greenlit. |
| 2026-03-24 | data-domain="j1mmychu.github.io" (not the /peakly subpath) — matches Plausible site setup |
| 2026-03-24 | Phase 2.3 (Venue Detail Sheet) is next major feature after data cleanup |
| Ongoing | 3-tab nav is final — Explore, Alerts, Profile. Spec 3.4 canceled. |
| Ongoing | Duplicate `pipeline` venue to be removed next batch (keep `banzai_pipeline`) |

---

## Blockers

| # | Blocker | Owner | Action Needed |
|---|---------|-------|--------------|
| 1 | **VPS proxy DOWN** — ECONNREFUSED on port 3001; all flight prices are estimates | Jack/DevOps | SSH in: `pm2 restart all` or `node server.js &` |
| 2 | **HTTPS on VPS** — mixed content blocks real flight prices | Jack/DevOps | Cloudflare tunnel (easiest) or Let's Encrypt + nginx |
| 3 | **REI affiliate signup** — 18 high-value links earn $0 | Jack | Apply at Avantlink (30 min, unblocks ~$4-5/1K RPM) |
| 4 | **Sentry DSN** — `SENTRY_DSN = ""` on line 6 of app.jsx | Jack | Sign up at sentry.io, paste DSN |
| 5 | **LLC approval** — blocks Stripe, full affiliate enrollment, domain | External | Legal process, no action |
| 6 | **Plausible account verification** — need to confirm site ID in Plausible dashboard | Jack | Log in at plausible.io, verify j1mmychu.github.io is receiving data |

---

*Next report: 2026-03-31*
