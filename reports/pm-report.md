# Peakly PM Report v139 — 2026-09-03

**Status: 🔴 RED → Escalated from YELLOW. Seven consecutive days with zero code shipped. Carry-over venues hit Day 6. Open-Meteo free tier at 95% capacity with zero users — Reddit post kills the site within hours. VPS P1 items Day 41. September 14 venue search deadline in 11 days.**

---

## Shipped Since Last Report (v138 → v139)

| Commit | What | Right call? |
|--------|------|-------------|
| `931aec4` | Content report 2026-09-03 — FOR/NAT false alarm permanently closed, Base Prices Open #22 resolved | ✅ Two genuine open items closed. |
| `e964948` | DevOps report 2026-09-03 — BASE_PRICES Open #22 definitively resolved, cdnjs confirmed live | ✅ Clean audit. |

**Code shipped: nothing.** Seven consecutive days of reports with zero app.jsx commits. This is no longer a streak. This is a pattern.

The venue queue is paste-ready JSON sitting in a report. The venue search spec fits in an afternoon. The VPS fix requires one SSH session Jack has not taken. None of these are blocked on technical unknowns.

---

## Bug Triage

### Peakly Pro price ($9/mo vs $79/yr) — CLOSED

Pro was cut. `grep -c "Peakly Pro" app.jsx` returns references to a removed constant. Non-issue.

### Sentry DSN empty — CLOSED

DSN `9416b032a46681d74645b056fcb08eb7` wired at `index.html:77` and `app.jsx:7-9`. Confirmed live.

### Cache stamp stale — CLOSED

`PEAKLY_BUILD` = `20260902a` at `app.jsx:17`. `CACHE_NAME` = `peakly-20260902a` at `sw.js:2`. `index.html` = `?v=20260902a` at line 395. In lockstep. Stamp is correct: no code shipped today, no bump needed.

### BASE_PRICES coverage (Open #22) — CLOSED

DevOps Sep 3 ran the authoritative check: 123 unique venue airport codes, 181 BASE_PRICES destination keys. Every venue ap resolves. Open #22 is closed. Stop reporting it.

### FOR/NAT AP_CONTINENT — CLOSED PERMANENTLY

`FOR:"latam"` at `app.jsx:419`, `NAT:"latam"` at `app.jsx:439`. Confirmed present in both AP_CONTINENT and AIRPORT_COORDS and BASE_PRICES. This false alarm appeared in 3 consecutive Content reports. It is now closed as a finding class — the agent prompt needs a grep verification step before filing any "missing key" finding.

### Open-Meteo capacity — P0 ESCALATED

DevOps Sep 3 confirmed the math:
- 395 venues × ~2 API calls (weather + marine for beach) = ~790 requests per cold refresh
- 2hr TTL = 12 refreshes/day = **9,480 requests/day at zero users**
- Free tier limit: **10,000 requests/day**
- **Running at 95% of free tier with zero users**

A single Reddit post with 50 simultaneous cold visitors hits Open-Meteo rate limits within the first hour. The VPS proxy cache (Open #23) is the fix. It's code-complete but not deployed — needs the same SSH session as Open #19. This is now the **highest-severity technical item for the Reddit launch**, above venue search.

### VPS Redeploy (Open #19) — P0 (re-rated from P1)

Day 41. `server/proxy.js` has committed fixes: `forecast_days:14`, iOS CORS (`capacitor://localhost`), alert deletion (`DELETE` method). Not deployed. Two-weekend scoring is off. iOS native API calls blocked. But the real escalation is the coupling to Open #23: the disk cache fix needed to survive the Reddit spike lives in the same file, needs the same `pm2 restart`. You cannot ship one without the other. The VPS SSH session is now a pre-Reddit-gate hard blocker.

Jack: `ssh root@198.199.80.21`, `cd /opt/peakly-proxy`, copy updated `proxy.js` (or `git clone` and wire it properly this time), `pm2 restart peakly-proxy`. One session. Both Open #19 and #23 closed.

### Carry-over venues — P1

Five paste-ready JSON objects. Day 6 (Trysil, Camps Bay, Perhentian Islands, Nusa Lembongan) and Day 4 (Portofino). All APs confirmed in AIRPORT_COORDS, AP_CONTINENT, BASE_PRICES. No technical barriers.

Trysil urgency: Norwegian ski pre-booking window opened Sep 1. Norwegian families locking Christmas packages act now, not in October. Every day without Trysil is lost search intent in the specific time window that justified adding it.

### Venue text search — P1

Not started. Deadline: September 14 (11 days). Minimum viable spec is 1–2 hours of work. A Reddit post where someone searches for their favorite resort and gets nothing is a thread killer.

Spec (no new deps, no backend):
- `toLowerCase()` client filter on `venue.title + venue.location + venue.tags.join(' ')`
- Text input above category pills in ExploreTab
- Shows count when active ("Showing 3 of 395")
- Clears on category pill change

---

## Three Product Decisions — Sep 3

### Decision 1: VPS SSH session — SHIP TODAY (Jack-only action)

The VPS item has been P1 for 41 days. Today it escalates to pre-launch blocker because it couples directly to the Reddit spike survival plan.

**Decision: the VPS SSH session must happen before the Reddit post. Not "eventually." Not next sprint. Before October 11.** The consequence of skipping it: the Reddit post rate-limits Open-Meteo within the first hour, the weather data goes blank for all users, and the app shows "conditions unavailable" to the exact audience we're trying to convert. That is a catastrophic first impression with no recovery.

Jack action: SSH session to complete Open #19 + Open #23 together. Single `pm2 restart`. Verify with `curl -s https://peakly-api.duckdns.org/health`.

### Decision 2: Carry-over venues — HARD CUT if not shipped by Sep 7

Five venues have been paste-ready for 6 days. The September 7 deadline set in v138 holds.

**Decision: if Trysil/Camps Bay/Perhentian/Nusa Lembongan are not pasted by September 7, they are formally DEFERRED to October batch and removed from carry-over tracking.** The ski pre-booking urgency argument weakens materially after that date. Portofino gets until September 10.

If Jack wants a faster path: authorize the content agent to commit venue additions directly (bypasses the paste bottleneck entirely). The validate-venues pipeline already exists. The only missing piece is commit permission.

**Jack action: either paste the 5 JSON objects (15 minutes, `reports/content-report.md` has them ready), or explicitly authorize the content agent to commit.**

### Decision 3: Venue text search — SHIP or PUSH REDDIT TO OCTOBER 18

The September 14 deadline means venue search is built and live 4 weeks before the Reddit post.

**Decision: if venue search is not live by September 14, the Reddit date moves from October 11 to October 18. That is the stated consequence.** The minimum spec is small enough that missing the deadline is a scheduling failure, not a technical one.

A clear decision: either this gets built by September 14, or we accept the timeline slip and tell the team now so expectations are set.

---

## 90-Day Success Criteria

**5K path (baseline):** Reddit post + organic growth, current catalog, venue search live, clean first impression.

**8K path (stretch):** Requires all of the above PLUS:
1. VPS deployed before the post (Open #23 disk cache = capacity to survive the spike)
2. Analytics confirmed in Plausible before the post (Jack: 60 seconds to verify site registration)
3. Venue search live by September 14 (thread survival depends on specific resort search working)
4. 400+ venues in catalog (carry-overs shipped)

The delta between 5K and 8K is not a feature. It's operational execution: the SSH session, the paste, the analytics verification. These are all Jack-only actions that have been open for 6–41 days.

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| Photo venue-specificity sprint (Open #20) | **DEFER** | Requires UNSPLASH_KEY Jack doesn't have wired. Not a launch blocker — generic stock doesn't kill conversions; wrong weather data does. |
| APNS push alerts wiring (Open #21) | **DEFER** | Uncommitted local fix exists. iOS v1 gate already in place. Don't wire push until after Reddit launch proves demand. |
| Structured data / JSON-LD (SEO) | **DEFER** | SEO is a 30-day lag signal. Reddit launch is 38 days out. Ship search first, structured data second. |
| Static h1 fallback | **DEFER** | Same as above. SEO improvements compound post-launch; pre-launch SEO work at current zero-traffic state has zero marginal impact. |
| Zombie branch cleanup (18 branches) | **CUT** | Cosmetic. Zero user-facing impact. DevOps can stop reporting it. |

---

## One Product Risk Nobody Is Talking About

**The Reddit post is 38 days away and the analytics setup isn't confirmed.**

Plausible script is live in `index.html:32`. The script variant is correct. But Jack has not confirmed the site is registered in Plausible as `j1mmychu.github.io/peakly`. If the site slug is wrong in the dashboard (a trailing slash, a different subdomain, a typo), every pageview for the last 11 days is dropping into a bucket nobody can see.

The Reddit post is how we get the first 1,000 users. If analytics aren't confirmed before that post, we fly blind through the only high-signal event we'll have for weeks. We cannot A/B test, can't see which venues get clicked, can't see bounce rate, can't tell if the app is actually converting.

Sixty seconds. Log into plausible.io. Verify the site slug is exactly `j1mmychu.github.io/peakly`. That's it.

---

## Running Open Items (Priority Order)

| # | Item | Status | Days Open |
|---|------|--------|-----------|
| #19 | VPS redeploy (`forecast_days:14`, iOS CORS, alert deletion) | ⚠️ Committed, not deployed | Day 41 |
| #23 | VPS disk cache (Open-Meteo in-memory wipe on restart) | ⚠️ Unbuilt | Day 41 |
| — | Carry-over venues (5, paste-ready) | ⚠️ Day 6 | Day 6 |
| — | Venue text search | ⚠️ Not started | Sep 14 deadline |
| — | Plausible site slug confirmation | ⚠️ Unverified | Jack action |
| #21 | APNS fix (uncommitted local change) | ⏸ Deferred | Day 40 |
| #20 | Photos (venue-specific) | ⏸ Deferred | Needs UNSPLASH_KEY |

Items #9, #10, #11, #12, #22 are closed. Do not report them again.
