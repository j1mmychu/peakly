# PM Report — 2026-03-25 (v10)

## Status: ORANGE

460+ venues now live, scoring overhauled, HTTPS proxy resolved. But we added 280 venues to a pre-launch app that hadn't nailed its core UX loop yet. The previous PM report explicitly said "Geographic expansion before nailing UX for existing 182 venues is wrong order." We did it anyway. The risk is real: quality dilution and a harder-to-maintain dataset. This report calls that out directly and sets a hard gate before anything else expands.

---

## Shipped Since Last Report (v9)

| Item | Type | Right call? |
|------|------|-------------|
| **280 new surf venues** — 333 total surf spots with break types | Expansion | **CONTESTED.** 462 total venues is a massive pre-launch jump. Photos present on all entries. But many new venues likely share duplicate Unsplash photos. Venue count is NOT a growth lever at this stage. |
| **Deep scoring overhaul** — all 12 sport algorithms rewritten with real conditions data | Core feature | **YES.** This is Peakly's moat. Better scoring = more trust. Right call. |
| **New VPS proxy** — HTTPS via Caddy + Let's Encrypt at peakly-api.duckdns.org | Infrastructure | **YES.** Resolves P0 blocker. Real flight prices available. No mixed-content warnings. |
| **PWA manifest + sw.js** | Infrastructure | **YES.** Low cost, adds installability. |
| **JSON-LD structured data** in index.html | SEO | **YES.** Removes documented SEO gap. |
| **Set Alert button** in venue detail | UX | **YES.** Directly improves alert adoption — our primary retention driver. |
| **Plausible custom events** — Tab Switch, alert set, booking click | Analytics | **YES.** Essential before launch. Now we can measure what matters. |
| **WCAG / accessibility fixes** | Polish | **YES.** Low-effort, right direction. |
| **GA4 added then reverted** | Internal | **YES on revert.** Plausible is sufficient. Two analytics = noise. |
| **10 new non-surf venues + hiking gear** | Expansion/Data | **OK.** Modest. Fine. |
| **$79/yr pricing fix** | Bug fix | Required — P1 pricing error resolved. |
| **Cache buster updated** | Maintenance | Required. |

**Opportunity cost flag on the 280-venue drop:** This went against PM recommendation. The right sequence: polish detail sheet → launch → then expand. We expanded before polishing. The Venue Detail Sheet is still the #1 unconverted surface and has not been touched.

---

## Bug Triage

| Bug | Severity | Status |
|-----|----------|--------|
| **Sentry DSN empty** — zero crash visibility | **P1** — flying blind pre-Reddit launch. 462 venues + scoring overhaul = large surface area for silent errors. | Jack: sentry.io free tier, 5 min |
| **Venue Detail Sheet** — no photo hero, no sticky CTA, no score breakdown | **P1** — primary conversion surface. Nothing converts until polished. | Dev work, 4-6 hrs |
| **280 new venues — photo quality unverified** | **P2** — many likely share identical Unsplash photos. Users notice. | Content audit needed |
| **REI affiliate IDs still placeholders** | **P2** — 18+ gear links earn $0 | Jack: Avantlink.com, 30 min, no LLC required |
| **Cache buster** | **RESOLVED** — updated in index.html | Done |
| **$79/yr pricing** | **RESOLVED** — correct in app.jsx | Done |
| **VPS proxy HTTPS** | **RESOLVED** — peakly-api.duckdns.org live with Caddy + LE | Done |

---

## Known Blockers

| Blocker | Owner | Status |
|---------|-------|--------|
| Sentry DSN empty | Jack | Unblocked — 5 min at sentry.io |
| REI affiliate signup | Jack | Unblocked — Avantlink.com, 30 min, no LLC needed |
| Venue Detail Sheet polish | Dev | This sprint |
| Photo quality audit (280 new venues) | Content agent | This week |
| LLC approval | External | No action available |
| Backcountry / GetYourGuide affiliate IDs | External (LLC) | Wait on LLC |

**HTTPS proxy: RESOLVED.** Remove from all future blockers lists.

---

## Priority Decisions — Top 3 This Week Only

**1. Venue Detail Sheet — polish to conversion-ready** (DEV, 4-6 hrs)
This is the only thing that moves the 100K needle right now. Every card tap lands here. Required: full-width photo hero, sticky "Book Flights" CTA (Travelpayouts deep link), 7-day mini forecast strip, tappable score badge showing 3-line breakdown ("Wave height: 8ft — ideal. Wind: offshore. Swell period: 14s"). This is where Booking.com and Travelpayouts revenue lives. Nothing else matters until done.

**2. Sentry DSN + REI affiliate signup** (Jack, 35 min total — unblocked today)
- Sentry DSN: 5 min at sentry.io free tier. Crash visibility before Reddit launch. With 462 venues and a scoring overhaul just shipped, surface area for silent errors is large.
- REI via Avantlink: 30 min signup. 18+ live gear links earn $0. ~$4-5/1K RPM uplift. Does NOT require LLC.

**3. Photo quality audit on 280 new venues** (Content agent, 2-3 hrs)
Many new surf venues likely reuse the same Unsplash photos. Users who scroll past 5 cards with the same hero image will distrust the app instantly. Audit for: (a) identical photo URLs across multiple venues, (b) mismatched photos (wrong sport/geography). Fix before any Reddit launch screenshot goes out.

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| Expose Trips + Wishlists tabs | **DEFER** | Core loop (Explore → Detail → Book) must convert first. Revisit at 1K users. |
| Add 50+ more venues (South America, Africa, SE Asia) | **CUT for now** | 462 venues is enough for pre-launch. Stop expanding data, start converting users. |
| Hotel affiliate deep links per venue | **DEFER** | Generic Booking.com links are fine. Per-venue deep links require per-venue hotel research. Not pre-launch work. |
| Tide data for surf spots | **DEFER** | Scoring overhaul just shipped. Let it prove itself first. Phase 3. |
| Avalanche risk for ski venues | **DEFER** | Same. Phase 3 enhancement. |
| Fuzzy search / search history | **DEFER** | 462 venues makes search more important, but polish the detail sheet first. Next sprint. |
| Dark mode | **CUT** | No evidence it moves retention. Not in next 6 months. |
| Offline support / service worker | **CUT** | Stale conditions data = wrong impressions. Incompatible with Peakly's value prop. |

---

## Success Criteria

**90-day target:** 5K–8K users. What separates 8K from 5K:

| Lever | 5K scenario | 8K scenario |
|-------|------------|------------|
| Reddit launch quality | Post with text + link | Viral screenshot — real condition alert firing ("Mavericks at 18ft, flights $190") |
| Detail sheet conversion | Users tap, bounce back | Photo hero + sticky CTA + score breakdown drives Booking.com + flight clicks |
| Photo quality | Duplicate photos in new venues | Every listing has unique, accurate photo |
| Alert adoption | <5% set an alert | Set Alert button in detail drives 10%+ adoption |
| Score transparency | Black box — users distrust it | Tappable badge shows breakdown, builds trust, drives shares |

**Current trajectory:** Still 5K if we launch today. Detail sheet polish and photo audit get us to 8K.

---

## One Product Risk Nobody Is Talking About

**462 venues is a maintenance liability, not just an asset.** We added 280 venues in one session. Each has: coordinates, airport code, photo URL, break type, tags, gradient, rating. At that scale, data rot is guaranteed — airports will be wrong, photos will break, break types will be misclassified, duplicate venues will appear (we already have "Hossegor" and "Hossegor Alternative" as separate entries). No one will audit 462 venues manually. Before the next content expansion, add a lightweight data integrity check — flag duplicate photo URLs and airports with no BASE_PRICES entry. One hour of work prevents the dataset from becoming a credibility liability at scale.

---

## Decisions Made

| Date | Decision |
|------|----------|
| 2026-03-25 | **280-venue expansion CONTESTED** — right data, wrong timing. Freeze further expansion until detail sheet converts. |
| 2026-03-25 | **HTTPS proxy RESOLVED** — remove from all blockers lists permanently. |
| 2026-03-25 | **Venue expansion FROZEN** — 462 is enough. Next expansion only after detail sheet polished and Reddit launched. |
| 2026-03-25 | **GA4 CUT** — Plausible is sufficient. |
| 2026-03-25 | **Offline/service worker CUT** — incompatible with live-data use case. |
| 2026-03-25 | **Dark mode CUT** — no signal it moves the needle. |
| 2026-03-25 | **Trips + Wishlists DEFERRED** — revisit at 1K users. |
| Ongoing | **Reddit launch gated on:** photo audit complete + detail sheet polished + Sentry DSN live. |

---

## Blockers Summary

| # | Blocker | Owner | Urgency |
|---|---------|-------|---------|
| 1 | Venue Detail Sheet unpolished (P1) | Dev agent | This sprint |
| 2 | Photo quality audit on 280 new venues (P2) | Content agent | Before Reddit launch |
| 3 | Sentry DSN empty (P1) | Jack | Do today — 5 min |
| 4 | REI affiliate signup (P2) | Jack | This week — 30 min, unblocked |
| 5 | LLC approval | External | No action |

---

*Next report: 2026-03-26*
