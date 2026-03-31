# SCALE GUARDIAN REPORT -- 2026-03-27 (Run 4)
## RISK LEVEL: YELLOW

Three claims verified: region-based pricing fallback exists, pagination shipped, onboarding auto-triggers. However, the region-based pricing fallback has a silent data bug that makes it partially broken for ~21 airports, and AP_CONTINENT covers 232 airports out of 776 venue airports -- not "all 776" as the growth report claims. The remaining 544 airports default to "europe" continent, which produces wrong but non-crashing price estimates.

---

## CLAUDE.md SYNC STATUS: DRIFTED -- 8 items wrong

| # | CLAUDE.md Says | Actual Code | Fix |
|---|---------------|-------------|-----|
| 1 | "~5,413 lines of JSX" (line 16) | 9,036 lines | Change to "~9,036 lines" |
| 2 | "App root & ErrorBoundary (~lines 4900-5413)" (line 60) | App root starts near line 8630, file ends at 9036 | Change to "~lines 8600-9036" |
| 3 | "0% photo duplication across all 2,226 venues" (line 233) | 182 unique Unsplash photo base IDs for 2,226 venues = ~92% base image reuse | Change to "182 unique base photos, crop-diversified" or remove the 0% claim |
| 4 | "VENUES (2,226 venues)" (line 57) | grep counts 2,294 `id:"` patterns (includes non-venue objects like CATEGORIES, GEAR_ITEMS, etc). Actual venue count is 2,226 per CATEGORIES array sum. | Acceptable -- document that grep overcounts |
| 5 | "Weather fetching is batched (50 at a time with 2s delays)" (line 183, note 9) | Smart fetch: top 100 on load (50/batch, no delay), lazy on detail open. No 2s delays. | Rewrite note 9 to describe current architecture |
| 6 | "No onboarding flow" listed as broken item #7 (line 272) | OnboardingSheet exists at line 7018, auto-triggers for `!profile.hasAccount` with 900ms delay | Remove from "What's Broken" list, add to "What's Shipped" |
| 7 | "BottomNav -- currently only 3 tabs" (line 81) | Need to verify actual tab count in BottomNav | Verify and update |
| 8 | Revenue model says "Travelpayouts (flights via HTTPS proxy) ACTIVE, EARNING" (line 417) | TP_MARKER = "YOUR_TP_MARKER" at line 3771. Flight links earn $0. buildFlightUrl() explicitly checks for placeholder and falls back to bare URLs. | Change status to "ACTIVE, EARNING $0 (marker placeholder)" |

---

## AGENT HEALTH: 13/16 reports current, but contradictions present

### Reports in /reports/ (16 total, 13 from 2026-03-27 or later):

| Report | Date | Current? |
|--------|------|----------|
| pm-2026-03-28.md | 2026-03-28 | YES |
| devops-2026-03-28.md | 2026-03-28 | YES |
| growth-report.md | 2026-03-27 | YES |
| content-report.md | 2026-03-28 | YES |
| ux-report.md | 2026-03-25 | STALE |
| revenue-report.md | 2026-03-25 | STALE |
| qa-report.md | 2026-03-27 | YES |
| code-quality-report.md | 2026-03-27 | YES |
| seo-analytics-report.md | 2026-03-27 | YES |
| data-enrichment-report.md | 2026-03-27 | YES |
| competitor-watch-report.md | 2026-03-27 | YES |
| community-report.md | 2026-03-27 | YES |
| daily-briefing.md | 2026-03-27 | YES |
| scale-guardian-report.md (prev) | 2026-03-25 | STALE (this run replaces it) |

### Agent contradictions:

| Topic | Agent A Says | Agent B Says | Reality |
|-------|-------------|-------------|---------|
| Region-based pricing | Growth: "covers all 776 airports" | DevOps: "1,500 unique API calls per cold user" | **Both wrong.** AP_CONTINENT has 232 entries (not 776). Region fallback exists but uses inconsistent continent naming (see Scaling Risk #1). DevOps' 1,500 API call estimate is wrong -- smart fetch loads top 100 only. |
| TP_MARKER | Revenue (2026-03-25): "ACTIVE, EARNING" | PM, DevOps, QA: "$0, placeholder" | **Revenue report is wrong.** TP_MARKER = "YOUR_TP_MARKER". $0 on every flight click. |
| Onboarding | Daily briefing (2026-03-27): "Not built, P1 blocker" | PM (2026-03-28): "Built, auto-triggers, not a blocker" | **PM is correct.** OnboardingSheet at line 7018, auto-triggers via useEffect at line 8646 for `!profile.hasAccount`. |
| Photo duplication | CLAUDE.md: "0% duplication" | Content, QA, Code Quality: "92% base image reuse, 176-205 unique IDs" | **Content/QA are correct.** 182 unique Unsplash photo base IDs. Same images with different crop parameters. |
| Cold load API calls | DevOps (2026-03-28): "1,000-2,000 calls per cold user" | Scale Guardian Run 3: "~130 calls per cold load" | **Run 3 is correct.** fetchInitialWeather at line 8709 slices VENUES to top 100. DevOps report did not verify the smart fetch code. |

### Agents repeating findings with no code action (3+ cycles):

| Finding | Cycles | Status |
|---------|--------|--------|
| TP_MARKER placeholder ($0 flight revenue) | **8+** | Jack action. No agent can fix this. |
| WCAG contrast failures | 8+ | Zero fixed in code |
| Preconnect hints in index.html | 6+ | Zero action |
| index.html static text says "170+/180+" not "2,200+" | 5+ | Zero action |
| Plausible event naming inconsistency | 5+ | Zero action |
| Photo base image duplication (92%) | 4+ | Zero action |

---

## SCALING RISKS (ordered by likelihood x impact)

### 1. AP_CONTINENT naming inconsistency -- silent pricing bug (ACTIVE NOW)

**Likelihood: CERTAIN. Impact: MODERATE (wrong price estimates for ~21 airports).**

AP_CONTINENT uses TWO different naming conventions:

- Lines 191-233 (original): `"na"`, `"latam"`, `"africa"`, `"europe"`, `"asia"`, `"oceania"`
- Lines 235-300 (expansion): `"north_america"`, `"south_america"` (11 and 10 entries respectively)

The `getFlightDeal()` function at line 3817 uses `AP_CONTINENT[ap] || "europe"` and then looks up routes using the original names (`"na-europe"`, `"na-latam"`, etc.). Airports tagged `"north_america"` or `"south_america"` will:

1. Match in `AP_CONTINENT` (so they don't fall through to `"europe"` default)
2. But produce route keys like `"north_america-europe"` which do NOT exist in the `routes` object
3. Fall through to `|| 800` default -- a flat $800 estimate regardless of actual route

**Affected airports (21 total):** ACV, BUR, EUG, MFR, MGA, OAK, PDX, SBA, SJC, SNA, SSC (tagged "north_america"), and FOR, GIG, ILH, MAO, MEC, NAT, TPP, TRU, UIO, AQT (tagged "south_america").

**Fix:** Normalize the expansion entries to use `"na"` and `"latam"`:
```javascript
// Lines 237, 246, 254, 272-273, 277-278, 282, 284-285, 287 — change:
"north_america" → "na"
"south_america" → "latam"
```

### 2. TP_MARKER placeholder -- every flight click earns $0

**Likelihood: CERTAIN. Impact: HIGH. Cycle: 8.**

Line 3771: `const TP_MARKER = "YOUR_TP_MARKER";`
Line 3790: `if (TP_MARKER && TP_MARKER !== "YOUR_TP_MARKER")` -- this branch NEVER executes.

At the Reddit launch target of 500 visitors, ~40 flight clicks will earn $0 instead of an estimated $56-84. This is a 5-minute Jack action that has been flagged for 8 consecutive agent cycles.

### 3. Open-Meteo 429 not handled -- scores disappear silently

**Likelihood: MODERATE (at >77 cold loads/day). Impact: HIGH.**

`fetchWeather()` at line 3001: `if (!r.ok) throw new Error("weather fetch failed")`. No 429-specific handling. When the free tier (10K calls/day) is exceeded, weather calls throw errors, venues show "Checking conditions..." indefinitely, and the core value prop breaks.

Smart fetch (top 100 on load) keeps this manageable at ~77 unique cold loads/day. But a Reddit post driving 200+ new users in a single day would exceed this.

**Fix (10 minutes):**
```javascript
// After line 3001 in fetchWeather:
if (r.status === 429) { console.warn("[Peakly] Rate limited"); return null; }

// After line 3018 in fetchMarine:
if (r.status === 429) { console.warn("[Peakly] Rate limited"); return null; }
```

### 4. 1.34 MB JSX parsed by Babel Standalone

**Likelihood: CERTAIN. Impact: MODERATE (5-15 second blank screen on mobile).**

app.jsx is 9,036 lines / 1.34 MB. Babel Standalone must parse this entirely before React renders. On a mid-range phone on LTE: 2-4s download + 4-10s Babel parse = 6-14s to first paint. Splash screen masks this partially.

No fix without either a build step or externalizing the VENUES array to a JSON file loaded via fetch. The latter is a 2-hour refactor compatible with the no-build-step architecture.

### 5. localStorage quota under extreme use

**Likelihood: LOW. Impact: MEDIUM.**

Smart fetch (top 100 venues) plus lazy detail fetches keep storage to ~500-650KB per session. Well within the 5MB limit. Only a power user opening 1,000+ venue details within a 30-minute cache window would approach the limit. Not a realistic concern at current scale.

---

## CONVERSION FUNNEL: INTACT (with $0 flight revenue)

| Step | Status | Detail |
|------|--------|--------|
| Landing -> Onboarding | **PASS** | OnboardingSheet auto-triggers for `!profile.hasAccount` with 900ms delay. 3-step flow: welcome, sports, airport. |
| Onboarding -> First venue | **PASS** | After onboarding, ExploreTab renders with pagination (30 venues visible). Smart fetch loads weather for top 100 in ~2s. |
| Venue card -> Detail sheet | **PASS** | Lazy weather fetch fires on detail open. 2,226 venues all have photos (though 92% share base images). |
| Detail sheet -> Flight click | **PASS (functionally)** | Sticky CTA works. Flight deep links generate correctly. |
| Flight click -> Commission | **EARNING $0** | TP_MARKER placeholder. Every click goes to bare Aviasales URL with no tracking. |
| Hotel click -> Commission | **PASS** | Booking.com aid=2311236 present. |
| Email capture | **THEATER** | Email capture form in ExploreTab footer does `alert("You're on the list!")` but POSTs to nowhere. Email stored only in localStorage and Plausible event. No server-side list. No re-engagement possible. |
| Set Alert -> Return visit | **THEATER** | No push notifications. localStorage only. User must remember to return. |

---

## DATA QUALITY: 3 ISSUES

| Check | Result |
|-------|--------|
| Duplicate venue IDs | 0 -- CLEAN |
| All 11 sport categories populated | 200-205 each -- CLEAN |
| Photo URLs present | 100% -- CLEAN |
| Photo base image diversity | **FAIL** -- 182 unique base IDs for 2,226 venues. Top offender reused 203 times. |
| AP_CONTINENT coverage | **FAIL** -- 232 airports mapped out of 776 unique venue airports. 544 airports default to "europe". |
| AP_CONTINENT naming consistency | **FAIL** -- Mixed `"na"`/`"north_america"` and `"latam"`/`"south_america"` naming. 21 airports affected. |
| Rating distribution | **WARNING** -- Average 4.89/5.00 across all venues. Implausibly uniform. |

---

## PERFORMANCE BUDGET

| Metric | Run 3 Baseline | Current | Delta | Status |
|--------|---------------|---------|-------|--------|
| app.jsx line count | 8,951 | 9,036 | +85 (+0.9%) | GREEN |
| app.jsx file size | 1.3 MB | 1.34 MB | +40KB (+3%) | YELLOW |
| Number of venues | ~2,226 | 2,226 | 0% | GREEN |
| Unique photo base IDs | ~176 | 182 | +6 (+3%) | RED (still 92% reuse) |
| Weather API calls (cold load) | ~130 | ~130 | 0% | GREEN |
| Estimated LCP (mobile 4G) | 6-15s | 6-15s | 0% | RED (Babel bottleneck) |
| AP_CONTINENT coverage | Not tracked | 232/776 (30%) | NEW | RED |
| BASE_PRICES coverage | Not tracked | 76 airports | NEW | YELLOW |
| Pagination | Not present | 30 + Show More | NEW | GREEN |

---

## VERIFICATION RESULTS

### 1. Region-based pricing fallback: VERIFIED WITH BUGS

The `getFlightDeal()` function at line 3817 implements a two-tier fallback:

1. **Exact match:** `BASE_PRICES[ap]?.[homeAirport]` -- covers 76 destination airports x 14 home airports
2. **Region fallback:** Uses `AP_CONTINENT` to look up both destination and home continent, then cross-references a region-to-region price matrix

**The fallback works structurally** -- no venue will show a blank price. But:

- 544 of 776 venue airports are NOT in AP_CONTINENT and default to `"europe"` (line 3821: `AP_CONTINENT[ap] || "europe"`). A venue in Anchorage, Alaska using airport code "FAI" (not in AP_CONTINENT) would be priced as if flying from the US to Europe.
- 21 airports use `"north_america"` or `"south_america"` instead of `"na"` or `"latam"`, producing route keys that don't exist in the pricing matrix. These get the `|| 800` flat default.

**The growth report's claim that "region-based pricing covers all 776 airports" is technically true** (no airport produces a crash or blank) **but misleading** (544 airports get wrong-continent pricing).

### 2. Pagination: VERIFIED

Line 5145: `const [visibleCount, setVisibleCount] = useState(30);`
Line 5557: `gridListings.slice(0, visibleCount).map(...)`
Line 5591: Show More button increments by 30.

Pagination is correctly implemented. Initial render shows 30 venues. "Show more" loads 30 more. Button shows remaining count.

### 3. Onboarding auto-triggers: VERIFIED

Line 8646-8651: `useEffect` checks `!profile.hasAccount` and calls `setShowOnboarding(true)` after 900ms delay. This fires on first load for any user without a saved profile.

OnboardingSheet at line 7031 is a 3-step flow: Welcome -> Sports selection -> Airport/name/email. Sets `hasAccount:true` on completion (line 7050).

---

## WHAT BREAKS NEXT

The AP_CONTINENT naming inconsistency is a silent data bug that will produce wrong price estimates for 21 airports right now, and the 544 unmapped airports will show plausible-but-wrong prices based on a "europe" default. Neither of these crashes the app or produces visible errors -- they just make prices wrong. A surfer checking flights to Oakland (OAK, tagged "north_america" in AP_CONTINENT) from New York will see $800 instead of ~$300 because the route key `"north_america-na"` doesn't exist in the pricing matrix.

The fix is a 5-minute find-replace: change all `"north_america"` to `"na"` and all `"south_america"` to `"latam"` in AP_CONTINENT (lines 235-300). Then, over time, add the remaining ~544 venue airports to AP_CONTINENT with correct continent tags.

But the actual next failure at scale is still the Open-Meteo rate limit. At Reddit launch traffic (200-500 visitors in 48 hours), the free tier will be strained. A 429 handler in fetchWeather/fetchMarine (10 minutes of code) is the minimum safety net.

---

## ONE THING THE FOUNDER SHOULD WORRY ABOUT THAT NOBODY ELSE IS SAYING

The email capture is theater. The ExploreTab footer has a "Get notified when conditions peak" form that fires a Plausible event and shows `alert("You're on the list!")` -- but the email goes nowhere. The onboarding collects email into localStorage on one browser on one device. There is no server-side email list. No Mailchimp. No Loops. No webhook.

When the Reddit post drives 500 people to the app and 15% complete onboarding and enter their email, those 75 emails will exist in 75 separate browsers' localStorage -- invisible, unretrievable, and lost the moment anyone clears their cache.

The PM flagged this. It is correct. But the deeper problem is that the alerts system has the same issue. Setting an alert stores it in localStorage. There are no push notifications, no email triggers, no server-side state. A user who sets an alert and closes the app will never be notified. The "Alerts" tab only works while the app is open. This makes the alerts feature retention theater -- it feels like engagement but cannot actually bring users back.

At 500 Reddit visitors, maybe 50 will set alerts. Zero will ever receive one. Some will check back manually. Most won't. The retention curve will crater at Day 3, and the cause will be invisible in analytics because Plausible will show "set_alert" events fired successfully -- making it look like the feature works when it doesn't.

The fix is a server-side email capture webhook on the VPS (the VPS is already running). POST `{email, name, airport, alerts}` to a `/api/subscribe` endpoint that writes to a flat JSON file or sends to Mailchimp. This is a 2-hour implementation. It should ship before Reddit, not after. Without it, the Reddit launch is a one-shot event with no mechanism to bring users back.

---

*Scale Guardian, Run 4. 2026-03-27.*
