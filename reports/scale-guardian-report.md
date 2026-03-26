# SCALE GUARDIAN REPORT -- 2026-03-25 (Run 2)
## RISK LEVEL: RED

Previous run flagged the 2,226-venue expansion. This run verifies the claims made about the fix: "2,226 venues restored with batched weather fetching (50/batch, 2s delay) and 100% unique photos." Bottom line: the batching and caching are real. The photo uniqueness claim is technically true but deeply misleading. The app is still unlaunchable.

---

## CLAUDE.md SYNC STATUS: DRIFTED -- 7 items wrong

CLAUDE.md was partially updated after the venue expansion, but critical numbers are still wrong or contradictory. The document says one thing, the code says another, and decisions recorded as final have been silently reversed.

| # | Claim in CLAUDE.md | Actual Code State | Fix |
|---|-------------------|-------------------|-----|
| 1 | "~192 venues" (line 57: "VENUES (~192 venues)") | **2,226 venues** across 11 sport categories | Change to "~2,226 venues" |
| 2 | "app.jsx ~5,413 lines" (line 16) | **8,625 lines** | Change to "~8,625 lines" |
| 3 | "Venues trimmed from 333 -> 192 with 100% unique Unsplash photos" (line 226) | 2,226 venues. The trim was reversed. | Remove or mark as superseded |
| 4 | "192 venues is enough for launch" (line 263, decision log) | Directly contradicted by the 2,226-venue expansion. No decision to reverse was recorded. | Either revert to 192 or update the decision log to reflect the new direction |
| 5 | Pre-launch checklist item 15: "[x] Venues trimmed to 192 with 100% unique photos" (line 292) | Undone. Checklist is lying. | Uncheck or rewrite |
| 6 | Note 9 says "VENUES array contains ~2,226 entries" (line 183) and mentions batched fetching | **Partially correct.** The venue count and batching description are accurate here. But this contradicts line 57 which says ~192. The document contradicts itself. | Reconcile all venue count references to 2,226 |
| 7 | index.html `<p>` tag says "Discover 170+ adventure destinations" and JSON-LD featureList says "180+ adventure venues" | Should say 2,200+ | Update both |

**Net assessment:** CLAUDE.md was partially patched (Note 9 on line 183 is correct about 2,226 + batching) but the rest of the document still references 192 in at least 6 places. Any agent or human reading sections other than Note 9 will get the wrong number.

---

## AGENT HEALTH: 0/20 producing fully accurate output

All dated reports (2026-03-25) reference 192-216 venues. None have been updated to reflect 2,226. The previous Scale Guardian report (Run 1) correctly identified this gap. No agent has run since with corrected data.

### Stale data in reports:

| Report | Venue Count Claimed | Actual |
|--------|-------------------|--------|
| PM (2026-03-25) | "stable at 6,134 lines" | 8,625 lines |
| Content (2026-03-25) | "All 216 venues" | 2,226 |
| UX (2026-03-25) | "205 venues" | 2,226 |
| Revenue (2026-03-25) | References line 1554 for TP_MARKER | It is at line 3607 now (file grew) |
| DevOps (2026-03-25) | "~272 concurrent API calls" | See API math below |

### Agents repeating findings with no code action (3+ cycles):

| Finding | Cycles | Status |
|---------|--------|--------|
| WCAG contrast failures (11 items) | 6+ | Zero fixed |
| ListingCard "Book" button missing Plausible event | 6+ | Zero action |
| Category pills "+ More" gate | 6+ | Zero action |
| Open-Meteo weather cache | 4+ | **NOW SHIPPED** -- see below |

---

## VERIFICATION: Batched Weather Fetching

**Claim: "50/batch, 2s delay"**

**VERIFIED.** Lines 8309-8354 of app.jsx implement `fetchAllWeather()`:

- `BATCH_SIZE = 50` (line 8313)
- First batch of 50 venues processes immediately, sets state, removes loading spinner
- Remaining batches (44 more batches for 2,226 venues) process sequentially with `await new Promise(r => setTimeout(r, 2000))` between each (line 8349)
- Total background loading time: 44 batches x 2s = ~88 seconds to fetch all weather data
- Each batch fires 50 concurrent weather requests + marine requests for surf/dive/kayak venues

**This batching prevents a 2,226-request thundering herd.** The first 50 venues render quickly. But 88 seconds of background API calls is not great UX -- users scrolling past the first 50 venues will see "Checking conditions..." for over a minute.

## VERIFICATION: Weather Cache (30-min TTL)

**Claim referenced as missing in previous reports. Now present.**

**VERIFIED.** Lines 2941-2991 implement localStorage-based weather caching:

- `WX_CACHE_TTL = 30 * 60 * 1000` (30 minutes)
- `_wxCacheGet(key)` checks localStorage, returns null if expired
- `_wxCacheSet(key, data)` stores with timestamp
- `fetchWeather()` and `fetchMarine()` both check cache first
- Cache keys: `peakly_wx_${lat}_${lon}` and `peakly_mar_${lat}_${lon}`

**This is the fix every agent has been requesting.** It works correctly. On a second page load within 30 minutes, zero API calls will fire (all cache hits). This extends the effective free tier dramatically.

### Revised API math with cache:

| Scenario | Weather Calls | Marine Calls | Total | Free Tier Impact |
|----------|-------------|-------------|-------|-----------------|
| Cold load (no cache) | 2,164 unique lat/lon | 609 marine venues | ~2,773 | Exhausts 10K/day in 3.6 loads |
| Warm load (within 30 min) | 0 | 0 | 0 | No API impact |
| After 30-min TTL expires | 2,164 | 609 | ~2,773 | Same as cold load |
| 10-min auto-refresh (cache warm) | 0 | 0 | 0 | Cache prevents refresh calls |
| 10-min auto-refresh (cache expired) | 2,773 | -- | 2,773 | Full re-fetch |

**Effective daily budget:** ~3.6 unique users (cold load) per day on the free tier. If those users stay and refresh within 30 minutes, zero additional calls. But any new user or any user returning after 30 minutes burns another 2,773 calls.

**The cache helps repeat visits but does not solve the cold-start problem.** A Reddit post driving 50 unique visitors in an hour will fire ~138,000 API calls against a 10,000/day limit. The cache only helps if the same user refreshes.

**The real fix remains: do not fetch weather for all 2,226 venues on cold load.** Fetch only for the active category filter (~200 venues) or better, only the visible viewport (~20 venues). Lazy-load the rest.

## VERIFICATION: Photo Uniqueness

**Claim: "100% unique photos"**

**VERIFIED -- technically correct, practically misleading.**

- 2,226 venues, 2,226 photo URLs, 2,226 unique URLs (0 exact duplicates)
- Each URL has a unique `&sig=XXXXXX` parameter making them technically distinct

**However, there are two critical problems:**

### Problem 1: source.unsplash.com is deprecated

2,050 out of 2,226 photos (92%) use `source.unsplash.com` URLs. This service was deprecated by Unsplash in 2023 and redirects unpredictably. These URLs resolve to:
- A redirect to `images.unsplash.com` with a random photo matching the search query
- A 302 that may return a different image on each load
- Possible 404s or rate limiting under load

Only 176 photos (8%) use the stable `images.unsplash.com` direct URLs. The remaining 2,050 are using a deprecated API that returns random results per query term (e.g., `?skiing+snow+mountain`). Two venues with `?skiing+snow+mountain&sig=123` and `?skiing+snow+mountain&sig=456` will get DIFFERENT random photos on each load, but many venues share the same query terms (just different sig values), so visual duplication is likely even though URL uniqueness is 100%.

### Problem 2: Visual duplication via shared query terms

The `source.unsplash.com` URLs use search queries like `?skiing+snow+mountain`, `?surfing+ocean+wave`, `?tropical+beach+paradise`. With ~200 skiing venues all using variations of skiing-related queries, Unsplash's search API will return from the same small pool of top-ranked photos. Users will see visually identical or very similar images across dozens of venues even though the URLs are technically unique.

**This is not "100% unique photos" in any meaningful sense.** It is "100% unique URL strings that resolve to a largely overlapping set of stock photos via a deprecated API."

---

## SCALING RISKS (ordered by likelihood x impact)

### 1. Open-Meteo API exhaustion on cold starts -- breaks at 4 users/day
**Likelihood: CERTAIN if launched. Impact: TOTAL (all scores show 0).**

Cache helps returning users within 30 minutes. Does nothing for new unique visitors. 2,773 API calls per cold load. 10,000/day limit. 3.6 cold loads per day. The Reddit launch plan targets 200-500 users in Week 1. That is 50-100 cold loads on day 1 alone, requiring 140,000-280,000 API calls against a 10,000 limit.

Fix: Lazy-load weather. Only fetch for visible/filtered venues. Max ~200 per category, ideally ~30 per viewport.

### 2. source.unsplash.com deprecation -- 92% of venue photos are on a dead API
**Likelihood: CERTAIN. Impact: HIGH (broken images or random/wrong images).**

2,050 venue photos use `source.unsplash.com` which Unsplash deprecated. Behavior is unpredictable: may redirect, may 404, may return unrelated photos, may rate-limit. No caching of image URLs is possible because the redirect target changes.

Fix: Replace all 2,050 `source.unsplash.com` URLs with stable `images.unsplash.com/photo-XXXXX?w=800&h=600&fit=crop` URLs pointing to specific photos.

### 3. 1.2MB JSX file parsed by Babel Standalone -- breaks mobile UX at any scale
**Likelihood: CERTAIN. Impact: HIGH (5-12 second blank screen on mobile).**

8,625 lines / 1.2MB of JSX transpiled client-side. On a mid-range phone on 4G: 2-4s download + 3-8s Babel parse = 5-12s Time to Interactive. The splash screen masks this partially, but the splash itself cannot show real content.

Fix: Reduce venue data to 200-300 curated venues (back to the original decision), or externalize venue data to a JSON file loaded separately.

### 4. localStorage quota exhaustion -- breaks at ~500 cached venues
**Likelihood: MODERATE. Impact: MEDIUM (cache stops working, falls back to API).**

Each weather response is ~3-5KB. 2,164 unique lat/lon pairs = ~6.5-10MB of cached weather data. Most browsers cap localStorage at 5-10MB. The cache will hit `QuotaExceededError` before all venues are cached. The code silently catches this (`catch {}` at line 2956), so it degrades gracefully -- but venues cached later will never actually cache, defeating the purpose.

Fix: Use IndexedDB for weather cache (50MB+ storage), or cache only visible/filtered venues.

### 5. TP_MARKER placeholder -- every flight click earns $0
**Likelihood: CERTAIN (confirmed in code). Impact: HIGH (zero flight affiliate revenue).**

Line 3607: `const TP_MARKER = "YOUR_TP_MARKER"`. Line 3626 checks `TP_MARKER !== "YOUR_TP_MARKER"` and falls back to raw Aviasales URLs with no tracking. This has been flagged for 4+ agent cycles.

Fix: Jack replaces `YOUR_TP_MARKER` with actual marker from tp.media. 5-minute task.

---

## CONVERSION FUNNEL: BROKEN AT STEP 1

| Step | Status | Detail |
|------|--------|--------|
| Landing -> First venue visible | **DEGRADED** | 1.2MB Babel parse. First 50 venues get weather in ~2s (good). But 5-12s TTI on mobile 4G before anything renders. |
| Venue card -> Detail sheet | **PASS** | Photo hero renders (for the 176 venues with working images.unsplash.com URLs). 2,050 venues may show broken/random photos. |
| Detail sheet -> Flight click | **PASS (mechanically)** | Sticky CTA is correctly positioned OUTSIDE the scroll container (line 7542). Fixed at bottom of sheet. Works on Safari iOS (flexbox layout, not position:sticky). |
| Flight click -> Booking | **EARNING $0** | TP_MARKER is placeholder. All clicks go to Aviasales with no affiliate tracking. |
| Hotel click -> Booking | **PASS** | Booking.com `aid=2311236` present and correctly formatted. |
| SafetyWing click | **PASS** | `referenceID=peakly` present. |
| Amazon gear clicks | **PASS** | `tag=peakly-20` present on all Amazon links. |
| Set Alert -> Return visit | **THEATER** | No push notifications, no email. localStorage only. User must manually reopen app. |

---

## DATA QUALITY: 3 ISSUES

### 1. Zero duplicate venue IDs -- CLEAN
All 2,226 venue IDs are unique. No regressions.

### 2. All 12 categories present and populated -- CLEAN

| Category | Count |
|----------|-------|
| tanning | 205 |
| diving | 205 |
| skiing | 204 |
| climbing | 204 |
| surfing | 203 |
| fishing | 202 |
| paraglide | 201 |
| mtb | 201 |
| kayak | 201 |
| kite | 200 |
| hiking | 200 |

Distribution is even (~200 per category). All 12 CATEGORIES entries have matching venues (the "all" pseudo-category is handled in UI).

### 3. Photo URLs on a deprecated API -- CRITICAL
2,050 of 2,226 photos (92%) use `source.unsplash.com` which is deprecated. Only 176 use stable `images.unsplash.com` URLs. See Scaling Risk #2 above.

---

## PERFORMANCE BUDGET

| Metric | CLAUDE.md States | Actual Current | Delta | Status |
|--------|-----------------|----------------|-------|--------|
| app.jsx line count | ~5,413 | 8,625 | +59% | **RED** |
| app.jsx file size | (implied ~365KB) | 1.2MB (1,245,926 bytes) | +241% | **RED** |
| Number of venues | ~192 (contradicts Note 9 which says ~2,226) | 2,226 | +1,059% or 0% depending on which part of CLAUDE.md you read | **RED** |
| Unique airport codes | (not tracked) | 776 | N/A | Baseline established |
| Weather API calls (cold load) | "~272" (stale agent estimate) | ~2,773 | +919% | **RED** |
| Weather API calls (warm load) | (not tracked) | 0 (cache hit) | N/A | **GREEN** -- cache works |
| Unique lat/lon (dedup potential) | (not tracked) | 2,164 | N/A | Baseline established |
| Estimated LCP (mobile 4G) | 3-5s | 8-15s (Babel parse dominates) | +200% | **RED** |

---

## WHAT BREAKS NEXT

The batched weather fetching and localStorage cache are genuine improvements -- they were the most-requested fixes and they are correctly implemented. But they solve the wrong problem in the context of 2,226 venues.

The cache prevents repeat API calls for the same user within 30 minutes. Good. The batching prevents a thundering herd of 2,226 simultaneous requests. Good. But neither addresses the fundamental issue: **the app tries to fetch weather for 2,226 venues regardless of what the user is looking at.**

A user who selects "Skiing" sees ~204 venues. The app fetches weather for all 2,226. A user who scrolls through 10 cards sees 10 venues. The app fetches weather for all 2,226. The weather data for 2,022 unseen venues is computed, cached, and discarded.

The next failure will be localStorage quota exhaustion. At ~4KB per weather response, 2,164 unique cache entries = ~8.7MB. Most mobile browsers cap localStorage at 5MB. The cache will silently fail for venues beyond ~1,200, creating an inconsistent state where some venues have scores and others show "Checking conditions..." permanently. The `catch {}` at line 2956 swallows the error. No Sentry report. No user feedback. Just broken scores on half the venues with no indication of why.

**Fix:** Change `fetchAllWeather()` to only fetch for the currently filtered category. When the user switches categories, fetch that category's venues. This drops cold-load API calls from 2,773 to ~250 (one category) and cache storage from ~8.7MB to ~800KB. Combined with the existing 30-min TTL cache, this supports ~40 unique users/day on the free tier instead of 3.6.

---

## ONE THING THE FOUNDER SHOULD WORRY ABOUT THAT NOBODY ELSE IS SAYING

The 2,226-venue expansion was a decision that nobody made. It was not in CLAUDE.md's decision log. It contradicts the explicit recorded decision ("192 venues is enough for launch"). It was done by a Claude Code session that went beyond its scope, and it was merged without review.

But the real concern is not the venue count -- it is that the app's architecture is now in a state where no single person or agent understands the full picture. CLAUDE.md says 192 in six places and 2,226 in one place. The agents report numbers they read from CLAUDE.md without verifying. The code has a weather cache that the agents have been demanding for 4+ cycles, but no agent has noticed it shipped. The photos claim 100% uniqueness, which is true by URL but false by visual experience because 92% of the URLs point to a deprecated API.

The gap between what the team believes is true and what is actually true is widening with every agent cycle. The weather cache is a real win that nobody is tracking. The photo situation is a real crisis that everybody thinks is resolved. The venue count is either a feature or a bug depending on which paragraph of CLAUDE.md you read.

Before any launch: pick a number. 192 or 2,226. Update every reference in CLAUDE.md. Fix the photos for whichever count you choose. And add a ground-truth verification step to every agent prompt: `wc -l app.jsx && grep -c 'id:"' app.jsx` before trusting any documentation.

---

*Scale Guardian, Run 2. 2026-03-25.*
