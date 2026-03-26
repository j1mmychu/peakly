# SCALE GUARDIAN REPORT — 2026-03-25
## RISK LEVEL: RED

---

## CLAUDE.md SYNC STATUS: DRIFTED — 8 items wrong

CLAUDE.md is dangerously stale. Multiple agents are making decisions based on numbers that are off by an order of magnitude. Here is every drift item:

| # | Claim in CLAUDE.md | Actual Code State | Impact |
|---|-------------------|-------------------|--------|
| 1 | "~192 venues" (line 57, 183, repeated throughout) | **2,226 venues** across 11 categories (~200 per category) | Every agent report is wrong. Revenue models, API rate limit math, photo duplication stats — all based on 192. Real number is 11.6x higher. |
| 2 | "app.jsx ~5,413 lines" (line 16) | **8,601 lines** | Off by 3,188 lines. File is 1.2MB, not ~365KB. |
| 3 | "100% unique Unsplash photos" (line 202, 225, 287) | **308 unique photos across 2,226 venues (86% duplication)**. Top photo reused 83 times. | CLAUDE.md claims 100% unique. Actual uniqueness is 14%. Every visual quality claim in agent reports is wrong. |
| 4 | "GuidesTab wired into BottomNav (4th tab)" (line 205) | **GuidesTab is dead code.** BottomNav has 3 tabs: Explore, Alerts, Profile. | Minor — already noted by some agents but CLAUDE.md still claims it's wired. |
| 5 | "Venues trimmed from 333 -> 192 with 100% unique photos" (line 225, 247) | Commit `53d7824` expanded to 2,226 venues. The trim was reversed and then massively expanded. | The "192 venues is enough for launch" decision (line 269) was overridden without updating the decision log. |
| 6 | Revenue model says "20 Amazon links" (line 366) | Needs recount — with 2,226 venues the gear/affiliate sections may have changed. | Revenue RPM calculations based on 20 links may be stale. |
| 7 | "Set Alert button added to VenueDetailSheet" listed as shipped (line 229) | Confirmed present in code. | OK — accurate. |
| 8 | Pre-launch checklist says "Venues trimmed to 192 with 100% unique photos" checked off (line 287) | Undone by expansion commit. Checklist is lying. | Any agent reading the checklist thinks this is done. It is not. |

**The single most dangerous drift: venue count.** Every rate limit calculation, every performance budget, every "we're ready for Reddit" assessment is based on 192 venues. The real number is 2,226. This changes everything.

---

## AGENT HEALTH: 0/19 producing accurate output

**Every single report in /reports/ is operating on stale data.** The most recent reports (dated 2026-03-25) reference 205 or 216 venues. The actual count is 2,226. Not one report has caught the 10x expansion from commit `53d7824 Expand all 11 activity categories to 200+ venues each (2,226 total)`.

### Specific agent contradictions and drift:

| Agent | What They Claim | What's Actually True |
|-------|----------------|---------------------|
| PM (2026-03-25) | "205 venues, stable at 6,134 lines" | 2,226 venues, 8,601 lines |
| Code Quality | "205 venues, 14 duplicate photos" | 2,226 venues, ~1,918 duplicate photo uses |
| Content (2026-03-25) | "216 venues, 14 duplicate photos" | 2,226 venues, catastrophic duplication |
| Data Enrichment | "216 total, skiing 74, tanning 60" | All categories ~200 each |
| DevOps (2026-03-25) | "~272 concurrent API calls per page load" | **~2,226 weather + ~604 marine = ~2,830 API calls per page load** |
| Revenue (2026-03-25) | "TP_MARKER is placeholder" | Confirmed — still `YOUR_TP_MARKER` at line 3600 |
| UX (2026-03-25) | "205 venues across 12 categories" | 2,226 venues, 12 categories (11 sport + "all") |
| Growth (2026-03-25) | "Reddit launch GO" | Reddit launch is a catastrophe waiting to happen at this venue count |
| Community | "Reddit launch GO" | Same — cannot launch with 2,830 API calls per page load |
| QA | "192 venues, 1 duplicate photo" | Off by an order of magnitude on both counts |
| SEO/Analytics | "91% SEO score" | May be accurate but featureList claims "180+ venues" — it's 2,226 |

**Critical: The Community and Growth agents declared Reddit launch GO.** They are basing this on an app that makes ~272 API calls per page load. The actual app makes ~2,830. A single Reddit user loading the page will fire 2,830 API requests to Open-Meteo. **Open-Meteo's free tier of 10,000/day will be exhausted by 3.5 page loads.**

### Agents repeating findings with no action (3+ cycles):

| Finding | Cycles Flagged | Status |
|---------|---------------|--------|
| WCAG contrast failures (11 items) | **6 consecutive reports** | Zero fixed. All are single-value color swaps. |
| ListingCard "Book" button missing Plausible event | **6 consecutive reports** | Zero action. One-line fix. |
| Category pills "+ More" gate | **6 consecutive reports** | Zero action. |
| Sentry DSN empty | **5+ reports** | Jack action, never done. |
| Open-Meteo weather cache | **4+ reports** | Never built. Now 10x more critical. |

---

## SCALING RISKS (ordered by likelihood x impact)

### 1. Open-Meteo API exhaustion — breaks at **4 users** — CRITICAL

The app fires `Promise.allSettled(VENUES.map(...))` at line 8305, making one `fetchWeather()` call per venue. With 2,226 venues, that is:
- **2,226 weather API calls per page load**
- Plus ~604 marine API calls (surfing + diving + kayak categories = ~604 venues)
- **Total: ~2,830 API calls per single user page load**
- Open-Meteo free tier: 10,000 requests/day
- **Exhausted after 3.5 page loads per day**
- Auto-refresh every 10 minutes adds another 2,830 calls per cycle per active user

Previous agent reports estimated 272 calls and said "breaks at ~30 users." The actual break point is **fewer than 4 page loads per day**. If even one person visits the site and refreshes twice, the API budget is gone.

**Fix:** localStorage weather cache with 30-min TTL (already recommended by every agent, never built). But the real fix is also to NOT fetch weather for all 2,226 venues on page load. Only fetch for visible/filtered venues. Lazy-load weather data on demand.

### 2. Babel transpilation of 1.2MB JSX — breaks user experience at any scale

app.jsx is now 1.2MB / 8,601 lines. Babel Standalone must parse and transpile this entire file in the browser on every cold load. On a mid-range Android phone on 4G:
- Download: ~400KB gzip = 2-4 seconds
- Parse + transpile: 3-8 seconds
- **Total Time to Interactive: 5-12 seconds**

At 192 venues (365KB), this was marginal. At 2,226 venues (1.2MB), this is broken. Mobile users on anything slower than a flagship phone on WiFi will see a blank screen for 5+ seconds, then a loading state, then 2,830 API calls firing simultaneously.

### 3. Unsplash CDN abuse — breaks at ~100 concurrent users

2,226 venues with photos means the browser is making 2,226 image URL references. Even with `loading="lazy"`, the browser will preconnect and potentially prefetch many of these. Unsplash's demo API limit is 50 requests/hour for unauthenticated use. The direct CDN URLs (`images.unsplash.com`) have higher limits but are not unlimited. At 100 concurrent users scrolling through venue cards, the request volume to Unsplash CDN could trigger throttling.

### 4. TP_MARKER placeholder — every flight click earns $0

Confirmed at line 3600: `const TP_MARKER = "YOUR_TP_MARKER"`. The condition at line 3619 (`TP_MARKER !== "YOUR_TP_MARKER"`) evaluates to false, so all flight links go directly to `aviasales.com` with no affiliate tracking. This is a 5-minute fix that has been flagged by Revenue agents for multiple cycles.

---

## CONVERSION FUNNEL: BROKEN AT STEP 1 (page load)

| Step | Status | Detail |
|------|--------|--------|
| Landing -> First venue visible | **BROKEN** | 1.2MB JSX transpile + 2,830 API calls on load. On 4G mobile, expect 8-15 second blank screen. Most users will bounce. |
| Venue card -> Detail sheet | PASS (if page loads) | VenueDetailSheet has photo hero + sticky CTA. Confirmed in code. |
| Detail sheet -> Flight click | **LEAKING** | CTA is sticky and visible. But TP_MARKER is a placeholder so every click earns $0. |
| Flight click -> Booking | **EARNING $0** | Aviasales links work but have no affiliate tracking. |
| Set Alert -> Return visit | **THEATER** | Alert UI exists. No push notifications. No email. localStorage-only. User must manually reopen the app to see if alerts fired. No mechanism to bring them back. |

---

## DATA QUALITY: 3 CRITICAL ISSUES

### 1. Photo duplication is catastrophic
- 2,226 venues share only 308 unique Unsplash photos
- Top photo reused 83 times
- A user browsing skiing venues will see the same mountain image on dozens of different resorts
- This destroys credibility instantly — looks auto-generated

### 2. The 10x venue expansion was never quality-checked
- Commit `53d7824` added ~2,000 venues in a single commit
- No agent caught it. CLAUDE.md was not updated.
- The expansion directly contradicts the explicit decision: "192 venues is enough for launch. Trimmed from 333. Quality > count." (CLAUDE.md line 261)
- Unknown how many venues have valid coordinates, real airports, or correct categories

### 3. CATEGORIES array is fine (12 entries, all intact)
No regression here. All 12 categories present with correct IDs.

---

## PERFORMANCE BUDGET

| Metric | CLAUDE.md Baseline | Actual Current | Delta | Status |
|--------|-------------------|----------------|-------|--------|
| app.jsx line count | ~5,413 | 8,601 | +59% | **RED** — exceeds 10% threshold |
| app.jsx file size | ~365KB | 1.2MB | +229% | **RED** — 3.3x larger |
| Number of venues | ~192 | 2,226 | +1,059% | **RED** — order of magnitude increase |
| API calls per page load | ~272 (est.) | ~2,830 | +940% | **RED** — exhausts free tier in 3.5 loads |
| Unique photos | 192 (claimed) | 308 | +60% (but across 11x more venues) | **RED** — 86% duplication |
| Estimated LCP (mobile 4G) | 3-5s | 8-15s | +200-300% | **RED** |

---

## WHAT BREAKS NEXT

**The app is already broken.** It just hasn't been noticed because nobody has loaded it since the 2,226-venue expansion.

The moment any real user loads https://j1mmychu.github.io/peakly/, the app will fire 2,830 API calls to Open-Meteo, exhaust the free tier budget for the entire day, and then return null weather data for all subsequent visitors. Every venue score will show 0. The hero card will display garbage. The user will close the tab. If this happens during the Reddit launch, the app's reputation is dead on arrival in front of 785K surfers.

**The preventive fix has three parts:**

1. **Immediately: Do not fetch weather for all 2,226 venues on page load.** Only fetch for the currently visible category (max ~200 venues) or even better, only the top 20-30 visible in the viewport. Lazy-fetch the rest on scroll or filter change. This alone drops API calls from 2,830 to ~60 per page load.

2. **Same sprint: localStorage weather cache with 30-min TTL.** Key: `wx_${lat}_${lon}_${date}`. Check cache before every fetch. This extends the free tier from 3.5 page loads/day to ~170 page loads/day.

3. **Before Reddit: Decide whether 2,226 venues is intentional.** If yes, CLAUDE.md must be updated, photo duplication must be fixed (need ~1,900 new unique photos), and the architecture must support lazy data loading. If no, revert to 192-250 curated venues with unique photos. The "quality over count" decision was correct.

---

## ONE THING THE FOUNDER SHOULD WORRY ABOUT THAT NOBODY ELSE IS SAYING

**The agent system has become a self-referencing echo chamber that cannot detect ground truth.**

Nineteen reports exist in /reports/. Not one of them caught a 10x venue expansion that happened in the commit history. Every agent reads CLAUDE.md, trusts the numbers in CLAUDE.md, and writes reports based on those numbers. When a Claude Code session expanded venues from ~200 to 2,226, it updated the code but not CLAUDE.md. Every subsequent agent cycle propagated the stale data. Reports cite each other's numbers. The PM report says "205 venues" because the Code Quality report said "205 venues" because CLAUDE.md said "~192 venues."

This is not a documentation problem. It is a systemic failure in the agent architecture. The agents are optimizing for a version of the app that no longer exists. The Reddit launch was declared GO based on an app that fires 272 API calls. The real app fires 2,830. The growth projection assumes 192 venues with unique photos. The real app has 2,226 venues with 86% photo duplication.

**The fix is not "update CLAUDE.md."** The fix is: every agent's first step must be `wc -l app.jsx` and `grep -c 'category:"' app.jsx` to establish ground truth from code, not from documentation. Documentation lies. Code doesn't.

Until the agents can independently verify the state of the codebase rather than trusting each other's reports, this failure mode will repeat. The next rogue Claude Code session that makes a major change without updating CLAUDE.md will create the same blind spot. And next time, it might be a security issue, not just a venue count.

---

*Scale Guardian, first run. 2026-03-25.*
