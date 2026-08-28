# Peakly PM Report v133 — 2026-08-28

**Status: 🟡 YELLOW — Post-launch day 6. Hintertux finally shipped. 4 beach carry-overs are now on their 5th day unpasted — and today is the last viable day for those venues' peak season. Reddit still hasn't fired. Plausible data: still dark.**

---

## Shipped Since Last Report (v132 → v133)

| Commit | What | Right call? |
|--------|------|-------------|
| `e50e017` | Hintertux Glacier + cache bump + CLAUDE.md venue count fix | ✅ Right call, 2 days late. In August, this is the only correct answer to "where can I ski in Europe this weekend." Worth the wait. |
| `d1ed2cd` | Content report Aug 28 — 97/100, 392 venues, 4 carry-overs Day 4 | ✅ Accurate verification. The "Day 4" callout in the report title is correct editorial pressure. |

No code shipped by Jack. No Reddit post. No Plausible numbers surfaced. Six days post-launch, the pattern is: agents ship what Jack doesn't, Jack ships nothing.

---

## Bug Triage

### Peakly Pro price ($9/mo vs $79/yr) — CLOSED
Pro is cut. Not in app.jsx. Final closure.

### Sentry DSN — CLOSED
Live, wired.

### Cache buster — CLOSED
`20260828a` in lockstep.

### Geo-silent-block — CLOSED
12s JS timeout fallback shipped Aug 26. Device test remains Jack's gate pre-post.

### VPS disk cache — Open #23 (P1 → P0 the moment Reddit fires)
Status unchanged since v129. In-memory only. At 6 days post-launch with sub-10 confirmed sessions, `pm2 restart` refills in minutes — tolerable at current MAU. The day a Reddit post drives 100+ concurrent users, a single VPS restart during that window 429s Open-Meteo and every new visitor sees "conditions unavailable." **This is Jack's only infrastructure task before the post and it takes one SSH session.** DevOps Aug 27 included the exact 30-line patch in `server/proxy.js`. The constraint is Jack's time, not the code.

### 4 Carry-Over Venues — Day 5 (DEADLINE: TODAY)
Praia do Camilo (FAO), Nusa Penida (DPS), Gili Trawangan (DPS), Arolla (GVA). All verified, all objects ready in `reports/content-report.md` (Aug 28 batch). Today is **Aug 28 — the last Friday of meteorological summer.** Praia do Camilo and Nusa Penida are peak-season venues. If they're not in the app by Sunday Aug 31, they won't be in their peak window again until summer 2027. This is the most expensive missed paste in the project's history, measured in seasonal relevance.

### Zombie Branches — P2 (Jack, 2 min)
Same 15+ `claude/*` branches on origin. Same risk of accidental stomp. Same one-liner in v132. Won't repeat it again after today — if it's not done by v134, it gets removed from the report permanently.

---

## Three Product Decisions — Aug 28

### Decision 1: 4 carry-over venues — SHIP TODAY or DEFER TO SUMMER 2027

This is not a drill. The calendar makes this decision, not me:

- **Praia do Camilo:** Peak season ends Aug 31. The Algarve sees 75% of its annual beach traffic June–August. A Friday-before-Labor-Day weekend is maximum booking intent. If this venue isn't in the app today, it sits dormant for 10 months.
- **Nusa Penida / Gili Trawangan:** Indonesia's dry season (May–Oct) continues, but the post-Labor-Day drop in US beach search intent is real. These venues still get traffic in September but the urgency case for pasting them drops significantly after this weekend.
- **Arolla:** Ski season doesn't start until December. This one can wait.

**Call: SHIP Praia do Camilo, Nusa Penida, and Gili Trawangan today. DEFER Arolla to next ski season paste batch.** Three venues, one paste, 10 minutes.

### Decision 2: Reddit post — fire today by 11am ET or commit to September

The window is not "closing." It is closed after this weekend for ski and beach simultaneously.

Current viable slots in order of preference:
1. **Today (Fri Aug 28), 9–11am ET, r/skiing + r/solotravel.** Best remaining slot. Ski crowd browses Friday afternoon planning the weekend.
2. **Tomorrow (Sat Aug 29), 8–10am ET, r/skiing only.** Acceptable. Ski crowd is actively planning. Do NOT do r/solotravel on Saturday — travel subreddits are destination research, not weekend planning.
3. **September.** Legitimate product decision — ski season kicks in mid-October in the Alps, beach season peaks again in Southern Hemisphere. A Sept 15 post on r/skiing with "ski season is coming, here's how to find a cheap opening weekend" is a stronger editorial hook than a late August post in August's end-of-season malaise.

**Jack's three pre-post gates:**
1. Device-test geo-silent-block with iPhone Location Services OFF. If the airport picker surfaces within 12 seconds → cleared.
2. VPS disk cache deployed (Open #23). 30-line patch already written.
3. One good screenshot of a real weekend pick for the post body.

**If none of those three things happen today, explicitly decide: September post. Name the target date. "We'll see" is not a decision.**

### Decision 3: FREEZE all new venue research until Plausible data arrives

Six days post-launch, zero sessions confirmed in Plausible. The content agent is producing perfect 97/100 quality reports and has 4+ venues queued. None of it matters if we don't know:
- Are any humans hitting the site?
- What's the bounce rate?
- What categories are they filtering?
- Are they completing onboarding?

**Decision: No new venue research until Jack pulls Plausible numbers and reports them.** Content agent effort should pivot to photo backfill prep (UNSPLASH_KEY workflow is documented — this is the quality gap Jack himself flagged) until demand data validates where to focus venue expansion.

---

## This Week's Top 3 Priorities

**1. Jack: pull Plausible data from Aug 22–28. Report total sessions, bounce rate, airport set rate.**

This is the only input that gates every other product decision. Without it, we're adding venues, planning Reddit posts, and making roadmap calls in a complete information vacuum. It takes 3 minutes at plausible.io. If the number is zero, that tells us something critical: either the live site isn't indexed yet, the Plausible script isn't firing, or the post genuinely hasn't driven any traffic. Each of those has a different fix. "I haven't checked" is not an option on day 6.

**2. Jack: SSH + deploy VPS disk cache (Open #23) before firing the Reddit post.**

30-line patch already written in `server/proxy.js` (DevOps Aug 27). Blocks Reddit post from becoming an infrastructure incident instead of a growth event.

**3. Paste 3 venues (Praia do Camilo, Nusa Penida, Gili Trawangan) into `app.jsx` today.**

Last viable window for peak-season relevance. Objects are in `reports/content-report.md`, Aug 28 batch. Eval count goes to 395. Auto-push handles the rest.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Arolla Ski Area (paste now) | DEFER to October | Ski season doesn't start until December; pasting in August wastes prime position in the sorted venue grid for 3 months |
| New venue research (any category) | DEFER until Plausible data | Zero analytics data = zero signal on where demand actually exists |
| JSON-LD structured data | DEFER | SEO benefit is real but accrues over months; not a week-1 lever |
| Static h1 fallback | DEFER | Same reason as JSON-LD |
| Zombie branch cleanup | JACK-ONLY, 2 min | Not a feature, but it leaves origin in a state where one accidental merge stomps 4 months of work. After today it leaves the report — if it happens, it happens. |

---

## Success Criteria Check

**90-day projection: 5K–8K users. What has to be true for 8K, not 5K?**

For 8K (not 5K), three things must be true that aren't true today:

1. **Reddit post drives a real spike (500+ sessions in 48h) and bounce rate is <65%.** A high-bounce spike means the product doesn't land on first visit. If bounce > 65% from the first Reddit post, that's a product problem, not a traffic problem. No amount of additional posts fixes it.

2. **Plausible shows meaningful onboarding completion (>30% airport set rate).** The geo-silent-block fix should help. But if users aren't setting an airport, they're seeing global unsorted venues with no pricing — a meaningless list. Onboarding completion is the funnel's throat.

3. **At least one organic share/secondary post within 14 days of Reddit launch.** The 5K path assumes the Reddit post drives its own traffic and dies. 8K requires the product to be share-worthy — someone posts a screenshot, a comment thread links to Peakly, a ski forum picks it up. That only happens if the product delivers a genuinely surprising result to the first 100 users.

None of these can be validated until Plausible data exists. The 5K vs 8K question is currently unanswerable.

---

## One Product Risk Nobody Is Talking About

**The Weekend Score is the moat but users have no reason to trust it.**

The `<ScoringExplainer>` card shipped in June. It explains HOW the score works. It doesn't explain WHY users should trust it over just looking at a weather app.

First-time users from Reddit will arrive with zero context. They'll see "87 — GO" on Whistler for this weekend. They have no way to verify it. If they open a weather app and it says "light snow, 28°F" they might think: "cool, but is 87 actually good or is every result 87?" If they open a second result and it says "82 — GO" they have no reference point.

The risk: the score looks like a fake engagement mechanism (common in travel apps) and users discount it. The product's core differentiation becomes invisible.

The fix isn't more explanation — it's calibration anchors. One line under the score: "Today, only 12% of venues score above 80" or "This is the 3rd-best ski weekend in Europe this month." That turns an abstract number into a relative signal. It's a one-commit change and it's more powerful than any onboarding tooltip.

Not filing this as a priority today — no analytics data to validate whether score trust is actually the problem. Filing it as the hypothesis to test the moment Plausible data shows bounce rate.

---

*v133 — written 2026-08-28. Next report due 2026-08-29.*
