# Peakly PM Report — 2026-06-01 (v45)

> Latest report. Supersedes v44 (May 31). Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: ORANGE → YELLOW. 6 code bugs shipped this session. VPS is the last binary gate. 6 days to June 7.**

---

## Shipped Since v44 (2026-05-31 → 2026-06-01)

| What | Verdict |
|------|---------|
| **Cache bump 20260531a → 20260601a** — DevOps had bumped to 20260531a on May 31 (commit 59b281c). This session bumps again to 20260601a to clear code changes. | ✅ Required on every ship that touches app.jsx. |
| **val-d-isere-s16 deleted** (Day 19 overdue) — duplicate of Tignes / Val d'Isère already in VENUES. Alert preset updated: val-d-isere-s16 → les-arcs-s20. | ✅ Right. 156 venues, no dups. |
| **outer-banks OAJ → ORF** (Day 19 overdue) — OAJ = Jacksonville NC, 70mi from Outer Banks. ORF = Norfolk, correct origin airport. | ✅ Flight pricing now correct for Nags Head. |
| **BookingConfirmSheet removed from flight CTA** (Day 21 overdue) — flights now direct window.open. Hotels keep the confirmation modal. | ✅ Removes friction from highest-intent tap. |
| **SafetyWing anchor added to VenueDetailSheet** (Day 7 overdue) — `https://safetywing.com/?referenceID=peakly`. RPM corrected from phantom to live. | ✅ Revenue model now accurate. |
| **Bora Bora PPT → BOB** (Day 5 overdue) — both Bora Bora venues now use BOB (the closer island airport). | ✅ Consistent pricing reference. |

**Context:** v44 (May 31) correctly called all 4 P1 fixes as overdue with a "June 3 hard deadline." They shipped June 1 — 2 days before that deadline, 6 days before Reddit. Close call.

---

## Active Bug Triage — June 1

| Bug | Severity | Days Open | Fix |
|-----|----------|-----------|-----|
| **VPS proxy never redeployed** | **P0** | **Day 28** | Jack only. 3 min. `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull origin main && pm2 restart peakly-proxy && curl localhost:3001/health"`. Without this: Open-Meteo free tier rate-limits at 44 DAU, Reddit sends 200+/hr in hour 1 → empty grid → "it doesn't work" top comment → permanent reputational damage. |
| **25 ski venues missing skiPass field** | **P2** | Day 4 | Not a launch gate. Post-launch content sprint. |

---

## Permanent Bug Triage

| Issue | Status |
|-------|--------|
| Sentry DSN empty | ✅ CLOSED |
| Peakly Pro $9/mo | ✅ CLOSED — Pro UI removed |
| GEAR_ITEMS absent | ✅ CLOSED — shipped 2026-05-27 |
| Cache buster stale | ✅ CLOSED — 20260601a this session |
| SEO surf/adventure copy | ✅ CLOSED |
| APNS Capacitor gate (Path B) | ✅ CLOSED — app.jsx:8317 |
| val-d-isere-s16 dup | ✅ CLOSED this session |
| outer-banks OAJ→ORF | ✅ CLOSED this session |
| BookingConfirmSheet on flights | ✅ CLOSED this session |
| SafetyWing CTA absent | ✅ CLOSED this session |
| Bora Bora PPT→BOB | ✅ CLOSED this session |

---

## Explicit Product Decisions — June 1

**Decision 1: Reddit launch is June 7. Hard. No slip.**

Ski-beach overlap window closes mid-June. Bansko, Gudauri, Cerro Castor, Thredbo — all scoring. Next equivalent Reddit moment is October. Every day of slip costs ~150 users off the ceiling.

**VERDICT: June 7. Not June 8. Not "this week." June 7. Post goes up regardless of social proof status.**

---

**Decision 2: Soft launch on niche subs June 3–4 before June 7 main post.**

(Adopted from v44.) The June 7 r/solotravel post has zero social proof. "I built a thing" posts without any "I tried it and it worked" comments die below 50 upvotes. Post to r/skiing + r/traveldeals June 3–4 (lower stakes, smaller audience) to generate early user reactions before the high-stakes swing. Even 5 users saying "this surfaced a Mammoth flight I booked" changes June 7 conversion materially.

**VERDICT: Jack posts to 2 niche subs June 3–4. June 7 main post goes regardless of soft-launch result.**

---

**Decision 3: Code freeze June 1–June 7.**

156 venues. 9K lines. Zero real user sessions. Every new venue is a potential data bug discovered in hour 1 of Reddit traffic.

**VERDICT: No new features, no new venues June 1–June 7. Only exceptions: VPS redeploy (Jack), smoke test failures, Babel parse errors. Content agent runs QA-only. DevOps bumps deps only if security-critical.**

---

## This Week's Top 3 Priorities Only

**1. Jack: VPS SSH today.** Day 28. One command:

```bash
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull origin main && pm2 restart peakly-proxy && curl localhost:3001/health"
```

Weekend-specific flight pricing, Open-Meteo cache, alerts polling — all dead in production until this runs. This is the highest-leverage action available to anyone on this project.

**2. Jack: Niche sub posts June 3–4.** r/skiing + r/traveldeals. Short posts, not essays. "Built a thing that tells you the best ski/beach spot to fly to this weekend — feedback welcome." Real airport. Real venue that's actually firing. Link. That's it.

**3. Jack: Human click-through before June 7 post.** Incognito. Set home airport. Open a venue. Hit "Book Flights" — confirm Aviasales opens directly (no modal). Hit Hotels — confirm BookingConfirmSheet + Booking.com. Check ScoreBreakdown opens. Confirm Plausible realtime shows events. 15 minutes. The only QA gate Playwright can't cover.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| New venue additions | **DEFER post-June 7** | Code freeze. 156 is clean. |
| MapView improvements | **DEFER post-launch** | Zero user validation. |
| Wishlists / Trips tab | **DEFER** | 1K MAU hard gate. |
| APNS Path A (configure push) | **DEFER to v1.1** | Path B shipped. App Store not on June 7 critical path. |
| Hotels in deal score | **CUT to v2** | Final. Third time confirmed. |
| Home airport onboarding nudge | **DEFER to first post-launch patch** | Right idea. Wrong week. |
| S. hemisphere ski carousel | **DEFER post-launch** | Good idea. Wrong week. |

---

## Success Criteria — June 1

Pre-launch readiness checklist:

1. ✅ SEO meta clean — zero surf/adventure strings.
2. ✅ APNS Capacitor gate — Alerts hidden on native iOS. Path B.
3. ✅ val-d-isere-s16 deleted — 156 venues, no dup.
4. ✅ OAJ → ORF — Outer Banks routes to Norfolk.
5. ✅ BookingConfirmSheet off flights — direct open.
6. ✅ SafetyWing CTA live — VenueDetailSheet.
7. ✅ Bora Bora PPT → BOB.
8. ✅ Cache 20260601a — aligned across all 3 files.
9. ❌ **VPS redeployed** — Jack only. Must show `pollStats` + weekend pricing.
10. ❌ **Niche sub soft launch June 3–4** — Jack only.
11. ❌ **Human click-through** — Jack only. 15 min.
12. ❌ **Reddit post drafted + reviewed** — Jack only. June 5 deadline.

Code side is done. Items 9–12 are Jack.

**90-day projection:**
- **5K floor**: holds if June 7 lands, VPS live, first impression clean.
- **8K path**: VPS live (weekend pricing real), niche sub soft launch generates ≥1 positive comment, June 7 post hits 9–11am EST slot. VPS is the difference between 5K and 8K.
- **Ceiling risk**: June 7 ski-beach overlap closes mid-June. Slip = October. October = 5K–8K users lost permanently.

---

## One Product Risk Nobody Is Talking About

**The default 6-hour flight filter runs against a potentially wrong home airport, and the user never knows.**

New user from Reddit opens Peakly. No saved home airport. Geolocation resolves to nearest major airport — which may not be their actual origin. The ≤6hr filter runs against that. If wrong, venues look irrelevant or the grid empties. The "Try ≤8hr" CTA on the empty state helps. But the root problem — wrong airport silently corrupting the filter — is unfixed.

First Reddit comments often read: "none of these make sense for me" or "it's showing me ski resorts 15 hours away." That's this bug.

Mitigation: one-time "Set your home airport" banner on first Explore load when `profile.airports` is empty. Low scope (3–4 hours), high trust impact on first impression.

**Not a June 7 blocker. First patch after launch.**
