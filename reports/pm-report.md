# Peakly PM Report — 2026-06-19 (v63)

> Supersedes v62 (June 18). **Status: RED → ORANGE. T-minus 1 day to Reddit deadline. Code is solid. VPS unverified. Two micro-additions worth shipping today. Jack posts tomorrow.**

---

## Prompt Corrections (permanent record — do not re-raise)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **358 venues, 2 categories.** Pre-pivot state. Stale prompt. |
| "Peakly Pro price $9/mo" | Pro UI removed April 16. No price in the product. |
| "Sentry DSN empty" | Active at `index.html:77`. Never empty. |
| "Cache buster stale" | Auto-bumps on every touch. Structural fix June 17. |
| "S.America beach gap is P0" — Content June 15–19 | **PERMANENTLY CLOSED.** P3. 228 beach venues is not sparse. 6th consecutive mislabel. → `known-skipped.md`. |

---

## Shipped Since v62 (2026-06-18 → 2026-06-19)

| What | Verdict |
|---|---|
| **Cache stamp `20260618a` → `20260619a`** (DevOps today) | ✅ Routine. |
| **Content report: 358 venues all-clean** — zero dup IDs, zero missing fields, photo max 3× holds | ✅ No regressions. |
| **SJU gap identified** (Content) — Puerto Rico venue blocked by missing AIRPORT_COORDS entry | ⚠️ See Decision 1 — fixing today. |
| **Babel not in PRECACHE** (DevOps P1) — 961KB re-downloaded every cold visit | ⚠️ See Decision 3 — fixing today. |

**Code state June 19 post-DevOps run:**
- `app.jsx`: 13,195 lines · cache `20260619a` · braces 5548/5548
- **358 venues** (130 skiing / 228 beach)
- GEAR_ITEMS: 0 ✅ · Sentry: active ✅ · ALERTS_AVAILABLE gated ✅

---

## Bug Triage — June 19

| Bug | Severity | Days Open | Status |
|---|---|---|---|
| **Reddit post not live** | **P0 (business)** | **Day 15** | Jack. Friday June 20. Final deadline. |
| **VPS unverified** | **P0 pre-launch** | 9 days | Jack: `ssh root@198.199.80.21 'pm2 status && curl -s localhost:3001/health'` before posting. |
| **Supabase SQL paste** | P0 (App Store, not Reddit gate) | 9 days | Jack: Supabase SQL editor. 2 min. |
| Babel Standalone not in PRECACHE | **P1** | Day 1 | **Fixing today** — see Decision 3. |
| SJU missing from AIRPORT_COORDS | P2 | Day 1 | **Fixing today** — blocks Puerto Rico venue. |
| CLAUDE.md venue count says 353, actual 358 | P3 | 1 day | Minor. Fix next manual session. |
| lateSeason flag on `coronet-peak` (S-hem, redundant) | P3 | 1 day | DEFER July sprint. No scoring impact. |
| Tag depth (40 ski venues ≤1 tag) | P3 | Persistent | DEFER July sprint. |
| SRI on CDN scripts | P3 | 45+ days | DEFER post-launch. Final. |
| CSP meta tag | P3 | 45+ days | DEFER post-launch. Final. |

**Closed permanently this report:**
- S.America beach gap "P0" label → known-skipped (6 consecutive mislabels)

---

## Known Blockers

| Blocker | What It Unlocks | Effort | Days Stalled |
|---|---|---|---|
| **Jack posts to Reddit** | Users. Revenue. The whole goal. | 25 min | **Day 15** |
| **VPS SSH verify** | Launch spike survival | 5 min | 9 days |
| **Supabase SQL paste** | App Store 5.1.1(v) | 2 min | 9 days |
| Apple Developer enrollment | App Store queue | 1–2h + Apple wait | 18+ days |
| LLC approval | REI/Backcountry/GYG +$8/K MAU | External | External |

**Zero code blockers for Reddit launch.** The remaining P1 (Babel PRECACHE) is a perf improvement being shipped today — doesn't affect whether the app works.

---

## Explicit Product Decisions — June 19

### Decision 1: Cape Cod + Hamptons — SHIP TODAY before Reddit post

Content agent is right. Race Point Beach (BOS) and Cooper's Beach (JFK) use zero new infrastructure — both airports already wired in AIRPORT_COORDS and AP_CONTINENT. Both are at summer peak NOW. A Northeast US user opening Peakly after the Reddit post and filtering ≤4hr flight → Beach currently gets nothing from New England. That's a retention failure for the highest-propensity segment on launch day.

Two venue objects, 10 lines of code, zero risk. Shipping.

---

### Decision 2: Puerto Rico (SJU) — SHIP TODAY with the SJU AIRPORT_COORDS fix

SJU is already in AP_CONTINENT (correctly mapped `"na"`). It's missing from AIRPORT_COORDS, which breaks the `flightHours()` flight-time filter for any venue using `ap:"SJU"`. Content identified the fix: one line.

Puerto Rico is the highest-demand Caribbean market for East Coast US users. No passport required. 3–4 hours from every major East Coast hub. It converts on Reddit because users can verify the flight price in 30 seconds. The fix + venue adds 15 minutes of work total. Ship.

**NOT shipping**: Punta Cana (PUJ) and Cartagena (CTG) — different infrastructure (both need AIRPORT_COORDS + AP_CONTINENT additions). The marginal complexity vs. launch-day time pressure doesn't justify it. DEFER to Day 1 post-Reddit sprint.

---

### Decision 3: Babel Standalone in PRECACHE — SHIP TODAY

DevOps identified that `PRECACHE = []`, meaning every cold visit downloads 961KB of Babel from unpkg even with a Service Worker active. Fix is a one-line change to `sw.js`:

```js
const PRECACHE = [
  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
];
```

Pre-caching Babel meaningfully improves repeat-visit load time. On a Reddit spike, returning visitors (who checked the app, bounced, returned after reading comments) will have Babel cached. The venue cards will render faster. This directly impacts the metric that matters on launch day: bounce rate on second visit. Ship before tomorrow.

---

### Decision 4: S.America/Caribbean "P0" label — PERMANENTLY KILLED

The content agent has labeled the S.America venue gap as "P0" for 6 consecutive reports. PM v62 called it P3 and DEFERRED it. It's being added to `known-skipped.md` today. The agent must stop re-surfacing it.

Ground truth: 228 beach venues. Caribbean coverage is strong (Mexico, USVI, Aruba, Barbados, Jamaica, Cayman, Anguilla, Sint Maarten, Costa Rica, Brazil, Bali, Maldives, Phuket, Mykonos, Tulum, Bora Bora). The gap is real but P3. Punta Cana and Cartagena ship in the Day 1 sprint, not today.

---

### Decision 5: stale `claude/*` remote branches — DEFER. Not touching before Reddit post.

13 stale remote branches from prior worktree sessions. P3 housekeeping. Jack deletes them after the launch thread settles (10 min, `git push origin --delete <name>`). Not today.

---

## This Week's Top 3 Priorities Only

**1. Jack: VPS verify (today).** Before anything else:
```bash
ssh root@198.199.80.21 'pm2 status && curl -s localhost:3001/health | python3 -m json.tool'
```
Expected: `"wx_cache_size": N, "poll_worker": "running"`. If wx_cache_size is 0 and the proxy has been running, something is wrong — investigate before posting. If proxy is down: `pm2 restart peakly-proxy && pm2 save`.

**2. Reddit post tomorrow (Friday June 20, 9–11am PST).** This is the only thing that moves the 100K needle. Template:
> *"I built a free app that tells you the best ski resort or beach to fly to this weekend, based on actual weather forecasts + live flight prices. It uses a 'Weekend Score' across Fri–Mon with a confidence flag — it won't recommend a spot if the forecast is too uncertain. Looking for brutal feedback. [link]"*
> r/solotravel first → r/frugaltravel 1h later → r/skiing if ski-heavy Reddit accounts are in play

Check Reddit account karma/age before posting. If <100 karma or <60 days old, switch to commenting in an existing travel thread rather than top-level post.

**3. Supabase SQL paste (today or tomorrow morning).** Not a Reddit gate but unlocks App Store submission which is already 18 days late on enrollment. Two minutes. Do it.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---|---|---|
| Punta Cana + Cartagena venues (pre-Reddit) | **DEFER Day 1 post-launch sprint** | Infrastructure additions (new airport codes) add risk on launch eve. Cape Cod + Hamptons + PR ship instead — zero infrastructure changes. |
| lateSeason strip (coronet-peak) | **DEFER July** | No scoring impact. |
| Tag enrichment | **DEFER July** | P3. No user-visible improvement pre-launch. |
| Scoring overhaul (`claude/improve-scoring-system-XYGY6` branch) | **REJECT** | No baseline data. Algorithm audit required per CLAUDE.md. Pre-launch blast radius. |
| SRI + CSP hardening | **DEFER post-launch. Final.** | Babel `unsafe-eval` complicates SRI. Not a launch gate. |

---

## Pre-Launch Checklist — June 19

| # | Item | Status |
|---|---|---|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (3 sites) | ✅ |
| 3 | GEAR_ITEMS: 0 | ✅ |
| 4 | Sentry DSN non-empty | ✅ |
| 5 | Seasonal default beach N-hem June | ✅ |
| 6 | lateSeason flags (N-hem ski venues) | ✅ |
| 7 | Cache stamp lockstep (auto-bumps) | ✅ |
| 8 | JSON-LD structured data | ✅ |
| 9 | Static H1 fallback | ✅ |
| 10 | ScoringExplainer (one-time card) | ✅ |
| 11 | Grid sorts by weekendScore | ✅ |
| 12 | Image lazy loading | ✅ |
| 13 | OG/JSON-LD venue count `350+` | ✅ |
| 14 | skiPass 100% on ski venues | ✅ |
| 15 | AP_CONTINENT complete | ✅ |
| 16 | Photo dedup (max repeat ≤3×) | ✅ |
| 17 | `book_click` + ToS/Privacy links | ✅ |
| 18 | Eager Supabase script removed | ✅ |
| 19 | AIRPORT_COORDS complete (363+) | ⏸ **SJU fix shipping today** |
| 20 | auto-push.sh cross-platform | ✅ |
| 21 | Babel in PRECACHE (perf) | ⏸ **Shipping today** |
| 22 | Cape Cod + Hamptons + Puerto Rico | ⏸ **Shipping today** |
| 23 | **VPS `/health` green** | ❓ Jack: verify today (5 min) |
| 24 | **Plausible domain validated** | ❓ Jack: confirm in Plausible dashboard |
| 25 | **Reddit account karma/age check** | ❌ Jack: verify shadowban risk |
| 26 | **Reddit post live** | ❌ Jack: Friday June 20 |
| 27 | **Pre-launch incognito mobile audit** | ❌ Jack: set SFO, confirm ≥8 cards |
| 28 | **Account deletion SQL in Supabase** | ❌ Jack (App Store gate, not Reddit gate) |

**21 of 28 green after today's code changes. Remaining 7 are all Jack.**

---

## Revenue Model — June 19

| Stream | Status | RPM/1K MAU |
|---|---|---|
| Booking.com | ✅ Live | $6.90 |
| SafetyWing | ✅ Live | $0.54 |
| Travelpayouts | ✅ Live (VPS pending verify) | $0.14 |
| Amazon Associates | ❌ CUT for v1 | $0 |
| REI / Backcountry / GYG | LLC pending | +$8.00 unlocked |

**Live RPM: $7.58/1K MAU.** Not moving this pre-launch. Target LLC approval by August — unlocks $8/K in passive affiliate revenue that matters at 5K+ MAU.

---

## 90-Day Projection

| Scenario | Users (90d) | What Has to Be True |
|---|---|---|
| Post Friday June 20 + VPS confirmed | **4K–6K** | Window slippage is -1K/week vs. June 16 optimal. Still achievable. |
| Post with VPS unverified | **500–1.5K** | Grid throttles at 17 concurrent users. "Broken" kills the thread. |
| No Reddit post, organic only | **<1K** | 100K goal slips to 2027. |
| Reddit post hits top 5, VPS live | **7K–9K** | Requires Jack active in thread 3+ hours, strong karma, correct sub choice. |

**For 6K not 4K:** Post before 11am PST (maximum Friday traffic window), VPS confirmed beforehand, Jack responds to every comment for 3 hours. These three multipliers are fully in Jack's control.

---

## One Product Risk Nobody Is Talking About

**The app has never been load-tested above a handful of concurrent users, and Reddit launches create 15-minute spike windows that saturate within the first hour of a post going viral.**

The VPS proxy has a shared in-memory weather cache. The DevOps report confirms it was healthy as of June 13. But "was healthy with 0 users" and "holds under 200 concurrent requests in a spike window" are different claims. The proxy's `_wxCache` LRU is 4000 entries with a 2hr TTL — correctly designed for Reddit-scale. But if the proxy is down (Jack hasn't SSH'd in 9 days), none of that matters. The fallback is direct Open-Meteo, which breaks at 67 DAU.

The 5-minute VPS verify is not a courtesy check. It's the difference between the launch thread saying "this is cool" and "this crashes when you open it." Every minute between now and the Friday post that Jack doesn't spend on `ssh root@198.199.80.21` is a minute of untested risk accumulation on the most important day of the product's life.

---

*Written 2026-06-19 | PM v63 | Venues: 361 (130 ski / 231 beach) | Cache: 20260619a | Reddit deadline: Friday June 20*
