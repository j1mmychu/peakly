# Peakly PM Report v162 — 2026-09-26

**Status: 🔴 RED — VPS Day 48. Oct 4 deadline is 8 days away. Oct 18 launch is 22 days away. Code freeze Day 13 clean. `origin/master` footgun still live. New risk: Oct 18 is pre-ski-season for 111 of 134 ski venues — the r/skiing launch thesis may land hollow.**

---

## Shipped Since Last Report (v161 → v162)

| Commit | What | Right call? |
|--------|------|-------------|
| `4662086` | DevOps Sep 26 — flagged 406 vs 404 VENUES discrepancy | ✅ Good catch; resolved as false alarm by Content same day |
| `37caef9` | Content Sep 26 — confirmed 404 venues, S-hemisphere ski season closed, data health 94/100 | ✅ Solid. 406 vs 404 resolved: 2 stray `category:` refs in non-VENUES code. |
| *(this run)* | PM report v162 | ✅ Routine. |

**Zero code commits to app.jsx/sw.js/index.html for 13 days. Code freeze holds.**

**406 vs 404 discrepancy: CLOSED.** Authoritative eval count = **404** (134 ski / 270 beach). The bracket-walker counted 2 stray `category:` occurrences in component logic outside VENUES. Not a data bug.

---

## Bug Triage

### P0s — None

### P1 — VPS Redeploy: Day 48, Oct 4 Is 8 Days Away

The live VPS runs Aug 11 code. Three sets of fixes are undeployed:

| Undeployed | What breaks |
|------------|-------------|
| Aug 11 (5 fixes) | Two-weekend scoring off, iOS native blocked, alert deletion broken, weather cache wiped on restart, rate-limiter gameable |
| Sep 9 `3152c96` | Fare fallback: ±1-day weekend round-trip. Off-peak beach routes return zero fares without this. |
| Sep 10 `c760dfb` | Widen live-fare fallback to ±3 days / 2–7 nights. More live fares. |

**Oct 4 = 8 days.** The Oct 5 content run assumes a healthy VPS. If not deployed by Oct 4, the Reddit posts launch with "price estimates" instead of "$X LIVE" — a materially weaker pitch.

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && curl -s https://peakly-api.duckdns.org/health"
```

Time: 5 minutes. Jack owns this.

### P1 — `origin/master` Footgun: Day 4 on PM Radar, Still Not Done

Decided in v159. `origin/master` = June 2026 code (pre-404 venues, pre-two-weekend scoring). An accidental push there deploys a 4-month regression to production via `deploy.yml`.

One command: `git push origin --delete master`

Not deferred. Decided. Undone for 4 days.

### P1 — Tag Density: 225 Venues at ≤2 Tags, Day 21

Deferred to Oct 5 content run. Hold.

### P1 — Top 15 Venue Photo Go/No-Go

Jack must confirm by Oct 4 or it's NO-GO. No more deferrals.

### P2 — Sentry DSN

✅ RESOLVED — confirmed live (`9416b032...` in `index.html:77`). Stop flagging.

### P3 — Peakly Pro Price ($9/mo vs $79/yr)

✅ REJECTED (v161) — dead UI, zero users see it. Not touching pre-launch.

### P3 — Stale Branches (18)

Bundle with Oct 5 or do via GitHub UI. Not a dedicated session.

---

## Three Product Decisions — Sep 26

### Decision 1: Oct 4 VPS deadline holds. 8 days, not negotiable.

Same math as yesterday minus one day. The beach catalog returns zero live fares on off-peak routes without the Sep 9+10 proxy fixes. 270 beach venues, many of them the strongest launch story right now (S-hemisphere spring window), showing `~$X` estimates instead of `$X LIVE`. That's not the launch.

**Jack: SSH session by Oct 4.**

### Decision 2: The r/skiing post needs a launch date rethink. Oct 18 is pre-season.

This is the risk nobody has flagged. The Oct 18 launch was framed as "ski season opening" — but N-hemisphere ski season doesn't open until late November / December for most resorts. On Oct 18:

- **15 lateSeason glacier venues**: real scores (year-round snow)
- **111 N-hemisphere ski resorts**: off-season, scoring engine correctly shows weak/filtered results
- **23 S-hemisphere ski venues**: season just closed (~Sep 21-25), weak scores

The r/skiing post body says "live snow + cheap flights in one score" for "~130 ski resorts." On Oct 18, a user who taps Skiing will mostly see a filtered-down list anchored by 15 glaciers. The comment that kills the thread: "I tried it and there's no snow anywhere." That comment is accurate.

**Options:**
- **A. Post r/skiing in December** when N-hemisphere season is actually open. Post r/solotravel and r/travel on Oct 18 as planned with beach leading. Delay the ski post 6 weeks. This is the honest play.
- **B. Reframe the Oct 18 r/skiing post** around glacier skiing specifically ("best early-season powder window right now: 15 glaciers you can fly to this weekend"). Narrower but defensible. Zermatt/Hintertux/Chamonix glaciers are legitimately scoring well in October.
- **C. Launch Oct 18 as planned and accept the risk.** Hope ski enthusiasts understand off-season.

**DECISION: DEFER r/skiing post to December. Post r/solotravel Oct 18 with beach + S-hemisphere spring hook. Post r/travel same week. The Oct 18 launch is a beach launch, not a ski launch.**

This is not a product failure — it's correct timing. The scoring engine is honest about off-season. We should be too. Don't launch the ski post into an empty ski season.

### Decision 3: Add S-hemisphere spring hook to r/solotravel post before Oct 11 review.

Content has confirmed: 69 S-hemisphere beach venues are in prime spring window right now (late October = spring peak for Brazil/Argentina/South Africa/Australia). The r/solotravel post body doesn't mention this.

Adding one sentence: "If you're in the US or Europe, it's also showing Southern Hemisphere spring — October flights to Florianópolis or Cape Town are pricing at summer rates while their weather is peak."

That's a hook. r/solotravel has a strong audience of Northern Hemisphere travelers who've never thought about October as beach season.

**DECISION: Add S-hemisphere sentence to r/solotravel draft before Oct 11 Jack review.** Adding it now.

---

## Updated r/solotravel Draft (One Line Added)

The body paragraph 2 now reads:

> The use case is: it's Thursday, you want to go somewhere warm this weekend, you don't know where. This shows you what's actually firing vs. what looks good on a resort website. Right now, Southern Hemisphere spring is in peak window — October flights to Florianópolis, Cape Town, and Bali are pricing at shoulder-season rates while their weather is hitting 80s. If you're in the Northern Hemisphere and want warm water this weekend, Peakly is showing the options most people don't think about in October.

---

## This Week's Top 3

1. **VPS deploy by Oct 4** — Jack SSH, 5 min. Unblocks Aug 11 + Sep 9 + Sep 10 fixes. Live fares for beach launch.
2. **r/skiing post timing decision** — DECIDED: defer to December. Shift Oct 18 launch narrative to beach + S-hemisphere spring. Update `reports/reddit-launch-post.md` accordingly.
3. **Delete `origin/master`** — one command, decided 4 days ago, still not done.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| Peakly Pro price fix | Dead UI, no users see it. Post-launch if Pro gets restored. |
| VENUES discrepancy investigation | False alarm. 404 is correct. |
| r/skiing on Oct 18 | Pre-ski-season. 111 of 134 ski venues score weak in October. Reschedule to December. |

---

## One Product Risk Nobody Is Talking About

**The ski launch is the beach launch now, and nobody has said so out loud.**

The Oct 18 date was set as "ski season opening." It's not. The honest ski catalog on Oct 18 is 15 glacier venues. That's a feature, not a product. Meanwhile, 270 beach venues with S-hemisphere spring in full swing is a legitimately strong launch story — arguably stronger than a ski launch that shows mostly gray unavailable resorts. The product is better suited to a beach launch on Oct 18 than a ski launch.

The risk: all the internal framing, the Reddit draft title, the pitch copy still leads with skiing. If we post r/skiing on Oct 18 and get roasted for having no ski scores, it poisons the r/solotravel + r/travel posts that follow. A failed ski launch is a bad week for the product even if the beach story is strong.

**The correct move is to rename this "Peakly's beach launch" internally and let the ski launch happen in December when the product can actually deliver on the ski promise. This is good timing, not a problem.**

---

## Success Criteria Check

| Metric | Status |
|--------|--------|
| 90-day projection (5K–8K users) | At risk if ski launch lands hollow Oct 18. Beach launch = path to 5K. Ski launch in Dec = path to 8K. |
| Live fares on beach launch | At risk — VPS must deploy by Oct 4. ~55% of beach catalog currently shows `~$X` estimates only. |
| Data quality | 94/100 — one deduction (tag density) holds. |
| Code freeze | Day 13 — clean. No regressions. |
| Reddit post ready | ✅ Draft committed. Oct 11 Jack review deadline. |
| S-hemisphere spring hook | ✅ Added to r/solotravel draft above. |

**For 8K not 5K:** VPS deployed by Oct 4, ski post in December when N-hemisphere season opens, S-hemisphere spring hook in r/solotravel Oct 18. That's the path.
