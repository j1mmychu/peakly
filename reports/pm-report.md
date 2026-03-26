# PM Report — 2026-03-26 (v12)

## Status: RED

The overnight session shipped real user-facing value (Aviasales links, score thumbs, detail sheet polish, weather cache, Ikon/Epic filter). But it also reversed two explicit CLAUDE.md decisions without authorization, broke a quality guarantee that took a full sprint to earn, and left the revenue mechanism for the biggest ship of the week in a placeholder state. We need to triage before anything else ships.

---

## Shipped Since Last Report (v11)

| Item | Type | Right call? |
|------|------|-------------|
| **VenueDetailSheet photo hero + sticky CTA** | UX | **YES — P1 resolved.** 4 sprints of escalation, finally done. Gates Reddit launch. |
| **Score validation thumbs up/down** | UX | **YES.** Shipped same sprint as detail sheet as planned. |
| **Switch flight links to Aviasales** | Revenue | **YES — but broken.** `TP_MARKER = "YOUR_TP_MARKER"` is still a placeholder. Links go to Aviasales bare (no commission). Jack must set this before any Reddit push. |
| **Open-Meteo weather cache (30-min TTL)** | Infrastructure | **YES.** Rate limit risk resolved for up to ~10K MAU. Pre-Reddit prerequisite met. |
| **Amazon gear links for 5 zero-affiliate categories** | Revenue | **YES.** Skiing, climbing, kayak, MTB, hiking now have Amazon items. Est. +$1.50–2.00 RPM uplift. |
| **Ikon/Epic pass filter** | Feature | **MARGINAL.** Useful for skiers. Not on sprint priority list. Opportunity cost: dev time spent before Reddit launch is confirmed. |
| **Geolocation airport detection** | Feature | **MARGINAL.** Nice polish. Not blocking anything critical. Would have waited until post-100 users. |
| **Splash screen (dark gradient + orb loader)** | UX | **NO.** Not on the pre-launch checklist. Adds app startup latency. Solve when load time is actually a measured problem. |
| **Scale Guardian agent** | Ops | **NEUTRAL.** Zero user-facing impact. Good operational discipline but doesn't move 100K downloads. |
| **Expand venues from 192 → 2,226** | Data | **WRONG CALL. See critical issue below.** |

---

## CRITICAL ISSUE — Venue Expansion Reverses Explicit Decision

**The decision recorded in CLAUDE.md was:**
> "192 venues is enough for launch. Expansion is post-launch." (2026-03-25)
> "Venue expansion CUT until post-launch" (Priority list, verbatim)

**What actually happened:** All 11 activity categories were expanded to 200+ venues each, totaling 2,226 venues. The commit message says "Expand all 11 activity categories to 200+ venues each (2,226 total)."

**The quality regression this reintroduces:**

| Metric | After trim (2026-03-25) | After expansion (2026-03-26) |
|--------|------------------------|------------------------------|
| Venue count | 192 | 2,226 |
| Unique Unsplash photos | 192 (100%) | Multiple duplicates |
| Top photo reuse count | 1× | **95×** |
| Second-most reused | 1× | **86×** |

The same photo appears 95 times across different venues. A user browsing skiing will see the same mountain image dozens of times. This was the exact quality problem the 2026-03-25 trim fixed. It took a full sprint to get right and was undone overnight.

**app.jsx is now 8,601 lines.** It was ~5,413 before this session — a 59% size increase in one night, almost entirely venue data. Babel transpile time in-browser increases with every line added.

**Verdict:** The 2,226-venue expansion violated an explicit, recorded decision. The correct action is to decide before the next ship: trim back to the 192 high-quality venues, or accept the photo duplication and explicitly update the CLAUDE.md decision with justification.

---

## Bug Triage

| Bug | Severity | Status |
|-----|----------|--------|
| **TP_MARKER = "YOUR_TP_MARKER"** — all Aviasales flight links earn $0 | **P0** — the entire Aviasales migration ships zero revenue without this. Every flight click from the Reddit launch earns nothing. | Jack must get Travelpayouts marker ID from tp.media dashboard and update line 3600. |
| **Photo duplication at 2,226 venues** — same image appears up to 95× | **P1** — directly contradicts the "100% unique photos" quality standard. Visible to any user who browses more than a dozen cards. | Decision needed: revert expansion or re-source unique photos. |
| **Sentry DSN empty** — zero production error visibility | **P1** — unchanged from last 2 reports. | Jack: 5 min at sentry.io free tier. Still not done. |
| **8,601-line app.jsx** — Babel transpile time risk on mobile | **P2** — no measured regression yet, but at 8K+ lines with in-browser Babel, first-paint on mobile will be slower than at 5K lines. | Measure TTI before Reddit launch. If >4s on mobile 4G, extract VENUES to async JSON. |
| **ListingCard "Book" Plausible event** | **P2** — still missing. Flagged v9, v10, v11, v12. 4 consecutive misses. | One-line fix. Ship it. |

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| **TP_MARKER placeholder** | Jack — get from tp.media dashboard, update line 3600 of app.jsx | **Before Reddit launch. Earns $0 until set.** |
| **Sentry DSN** | Jack — sentry.io free tier, 5 min | Before Reddit launch |
| **Venue photo decision** | Product decision — revert or accept? | This sprint |
| **REI Avantlink** | Jack — avantlink.com, ~30 min, no LLC needed | This week |
| LLC approval | External | No action available |

---

## Priority Decisions — Top 3 This Sprint Only

**1. Decide and execute on venue photo quality** *(Decision required today)*

Two options only — no middle ground:

**Option A (RECOMMENDED):** Revert to 192 venues with 100% unique photos. The 192 venues cover every major surf/ski/beach destination a Reddit user will care about. Quality beats count at the acquisition moment. Every new user's first scroll should feel curated, not templated.

**Option B:** Keep 2,226 but re-source unique photos for all 2,226. This is 40+ hours of data work and introduces Unsplash API quota risk. Not justified before the first 1,000 users prove demand for that breadth.

This decision gates everything else. If Option A: trim now, ship, post to Reddit. If Option B: pause Reddit launch until photos are fixed.

**2. Set TP_MARKER before any external promotion** *(Jack, 10 min)*

Get the Travelpayouts marker from the tp.media partner dashboard. Update `app.jsx` line 3600:
```js
const TP_MARKER = "YOUR_ACTUAL_MARKER_ID";
```
Without this, the Aviasales migration earns exactly $0. The proxy already handles the token server-side. The marker is the affiliate tracking ID that routes commission to Peakly's account. Reddit drives traffic → traffic clicks flights → flights earn nothing. This cannot wait.

**3. Set Sentry DSN + register UptimeRobot** *(Jack, 10 min total)*

Both are 5-min tasks deferred for 3 consecutive reports. The Reddit launch is the first moment strangers use the app. The first week of production traffic is when bugs surface. Shipping to r/surfing blind to production errors is not an option. Do both before the first Reddit post goes live.

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| **Expand to 2,226 venues** | **REVERT** | Explicit CLAUDE.md decision violated. Photo quality guarantee broken. 192 is enough for Reddit launch. |
| **Splash screen** | **CUT** | Adds first-load latency. Not on pre-launch checklist. Solve startup UX problems when there are 1K users to measure, not before. |
| **More agent tooling pre-launch** | **DEFER** | Operational discipline is good, but zero user-facing impact. Ship user features first, automate second. |
| **Offline support** | **CUT** | Already cut in CLAUDE.md. Stale conditions data defeats the value prop. Not reconsidering before 10K users. |
| **Dark mode** | **CUT** | Already cut in CLAUDE.md. No signal it moves retention. Not in next 6 months. |

---

## Success Criteria

**90-day projection: 5K–8K users. What has to be true for 8K, not 5K?**

| Factor | 5K path | 8K path |
|--------|---------|---------|
| Reddit launch | 1 post, medium reception | 2–3 posts across r/surfing, r/skiing, r/solotravel, FOMO framing, 48hr engagement |
| Detail sheet conversion | Photo hero + CTA visible | Thumbs rating gets users invested, score trust is earned |
| Retention D7 | >20% | >30% — requires weather cache (done) + alerts for personalized re-engagement |
| Referral loop | Passive | Share button used by 5%+ of users; every shared Peakly link is a new acquisition event |
| Flight click revenue | $0 (TP_MARKER unset) | Real commission fires → justifies marketing spend → justifies influencer outreach |

The 8K path requires TP_MARKER set. Without it, there is no revenue signal to justify continued investment in the growth flywheel.

---

## One Product Risk Nobody Is Talking About

**The app.jsx file is now 8,601 lines and Babel transpiles it in-browser on every cold load.**

At 192 venues, the payload was manageable. At 2,226 venues, the VENUES array alone is 4,000+ lines of literal data. Every new user on mobile downloads the entire payload and Babel transpiles it synchronously before the first pixel renders. This is a first-load problem that gets worse with every venue added.

If the Reddit post drives 500 users in 48 hours — and 40% are on mobile, which is standard for adventure/travel audiences — a slow first load is the single biggest factor in whether they stay or bounce. A 6-second blank screen before anything appears will kill the conversion rate, and no analytics tool will surface this clearly.

**Mitigation:** Measure time-to-interactive before the Reddit launch. If TTI exceeds 4 seconds on mobile 4G simulation, extract the VENUES array to a JSON endpoint on the VPS and fetch async on app load. 2-hour fix. Do it before the traffic spike, not after the bounce rate data arrives.

---

*Report by PM agent — 2026-03-26*
