# Peakly PM Report v166 — 2026-09-30

**Status: 🔴 RED — VPS Day 52. Oct 4 deadline = 4 days. Oct 18 beach launch = 18 days. Code freeze Day 17 clean. S-Hem spring Day 2 of 8-week prime window — launch timing is perfect. Single gate left: Jack's SSH session.**

---

## Shipped Since Last Report (v165 → v166)

| Commit | What | Right call? |
|--------|------|-------------|
| `0cf7112` | DevOps Sep 30 — YELLOW, VPS Day 52, 4 days to Oct 4, origin/master footgun Day 8 confirmed undone, 404 venues confirmed, 15 lateSeason confirmed | ✅ Accurate state. |
| `a07fb2d` | Content Sep 30 — data score 93/100 unchanged, S-Hem spring Day 2 of 8-week prime window documented, Tignes opens Oct 25 (7 days post-launch) | ✅ Seasonal context is launch-relevant. |
| *(this run)* | PM report v166 | ✅ |

**Zero code commits to app.jsx/sw.js/index.html for 17 days. Code freeze holds. One warranted change (Gili rename) is in Oct 5 scope — not touching before then.**

---

## Bug Triage

### P0s — None

---

### P1 — VPS Redeploy: Day 52, Oct 4 = 4 Days

The number that matters: **4 days**. If Oct 4 passes undeployed, beach launch Oct 18 ships with `~$X` estimate pricing instead of `$X LIVE` on all 270 beach venues. The Reddit post currently says "live prices" — that copy needs to change if VPS misses.

```bash
ssh root@198.199.80.21
cd /tmp && git clone https://github.com/j1mmychu/peakly.git peakly-tmp 2>/dev/null || (cd /tmp/peakly-tmp && git pull)
cp /tmp/peakly-tmp/server/proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy && curl -s https://peakly-api.duckdns.org/health
```

**This is the only Jack-action that determines whether launch is "great" or "good."**

---

### P1 — `origin/master` Footgun: Day 8 Decided, Still Undone

One accidental push to `master` ships June 2026 code to production. `deploy.yml` deploys both `main` and `master`. This has been decided for 8 days. It is a 10-second command.

```bash
git push origin --delete master
```

**Do this before Oct 5. Before anything else.**

---

### P1 — Tag Density (225 Venues at ≤2 Tags): Day 25, Oct 5 Locked

Hold. Oct 5 session. Not touching individually before then.

---

### P2 — Gili Trawangan Duplicate: Oct 5 Locked

`beach_gilit` → `beach_gili_air` (Gili Air). Oct 5. Already decided.

---

### P3 — Stale Branches (18)

Oct 5 GitHub UI cleanup.

### P3 — Peakly Pro Price ($9/mo vs $79/yr)

REJECTED — dead UI. Post-launch if Pro revives.

### P3 — Sentry DSN

✅ CONFIRMED LIVE. Stop flagging.

---

## Three Product Decisions — Sep 30

### Decision 1: VPS miss on Oct 4 → beach launch still ships Oct 18 with estimate pricing.

The fallback has been stated but never made crisp. Here it is: **if VPS isn't deployed by Oct 4, the Reddit post changes one phrase.** "Cheapest round-trip fare from your airport" stays. "Live prices" becomes "price estimates." That is the only consequence. Beach launch date does not move. The scoring, the S-Hem spring hook, the venue catalog — none of that changes. A miss on VPS is a quality downgrade, not a launch blocker.

**DECISION: Oct 18 is firm regardless of VPS. Reddit post copy adjusts if VPS misses. Jack: the SSH session is still worth doing — it turns a "good" launch into a "great" one — but Oct 18 does not depend on it.**

### Decision 2: Tignes opening Oct 25 is NOT a launch hook for Oct 18 — it's a follow-up post.

Content flagged that Tignes opens Oct 25, 7 days after launch. Tempting to weave into the Oct 18 post ("Tignes opens in 7 days — score your opening weekend"). Don't. The Oct 18 post is beach-first, S-hemisphere spring. Injecting ski preamble dilutes the hook and confuses the audience (r/solotravel doesn't care about Tignes). Tignes is the natural trigger for the r/skiing December post — "the Alpine season just opened, here's where to go."

**DECISION: Tignes opening Oct 25 is a CUE to start the r/skiing post — publish that post the week of Nov 1, not December. Re-read the r/skiing draft and adjust the opening line to reference Tignes/Val d'Isère opening week.**

### Decision 3: Reddit launch post needs Jack's eyes before Oct 11.

The draft was committed Sep 24 and the agent note says "if unchanged by Oct 15, use this draft verbatim." That's too late. Two things need Jack's review: (1) the S-hem venue callouts — "Florianópolis, Cape Town, and Bali" are placeholders, the post needs venues that are actually scoring high on Oct 18 (check the Explore grid that week); (2) the post voice — this is the first external impression of the product and it needs to sound like a person, not a PM report.

**DECISION: Jack reviews `reports/reddit-launch-post.md` by Oct 11. Specifically: replace the three venue name-drops with whatever Explore is actually showing as top 3 beach that weekend. Everything else can stay as written.**

---

## This Week's Top 3

1. **VPS deploy before Oct 4** — 4 days left, one SSH session, turns estimate pricing into live pricing at launch.
2. **Delete `origin/master`** — 10 seconds, prevents a catastrophic regression push. Day 8 decided. Do this today.
3. **Review Reddit launch post before Oct 11** — replace venue callouts with whatever Explore is actually showing, verify the voice reads human.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| Add Tignes to Oct 18 launch post | Ski hook belongs in the Dec post, not the beach-first Oct 18 post |
| Any new venue adds pre-Oct 5 | Tag density already 55.7% underfilled; add venues after tags are enriched |
| Early Nov r/skiing soft post | Wait for the Dec format with actual N-hem season open; Tignes alone isn't enough |
| Origin/master footgun "post-mortem" | Just delete it. No retrospective needed on a 10-second fix. |
| Anything new for Oct 5 scope | Oct 5 scope is locked: Gili rename, tags, branch cleanup, master delete. No additions. |

---

## One Product Risk Nobody Is Talking About

**The launch post goes to Reddit cold, with zero social proof.**

The r/solotravel post is well-written. The product is real. But Reddit's "I built this" posts land very differently with a 6-month-old account vs. a 6-year-old account with 50K karma. When a low-karma account drops a product link, Reddit's default assumption is spam, regardless of the content quality.

Three things that would help — all free, all doable before Oct 18:
1. **Post in r/solotravel comments a few times before launch.** Just regular participation. Build the history of being a real person who travels, not a bot that showed up to self-promote.
2. **Screenshot 3-4 actual venue scores from the live app.** Include them in the post body. "Here's what Peakly shows for Cape Town this weekend: [screenshot]" is the difference between "check out my app" and "here's the specific value you get."
3. **Have a quick-response plan.** Reddit threads die in 2-4 hours. If 10 comments land and there are no replies from the OP for 3 hours, the post is dead. Jack needs to be present for the first 2 hours after posting.

None of this is code. All of it is higher-leverage than any remaining feature work.

---

## S-Hemisphere Spring — Launch Context

Sep 30 = Day 2 of the 8-week prime window for S-Hem beaches. Oct 18 = Day 20. The launch timing is genuinely good — not "good enough," actually good.

- Brazil (12 venues including Florianópolis, Jericoacoara, Pipa): spring prime, FOR/NAT airports confirmed working
- South Africa (5 venues including Cape Town): spring warming, should be scoring well
- New Zealand (8 venues): early spring, shoulder pricing
- Australia (beach venues): warming, shoulder fares

**If the app is good, the timing is right, and the post is human-sounding, Oct 18 can work.**

---

## Success Criteria Check

| Metric | Status |
|--------|--------|
| 90-day projection (5K–8K) | Beach Oct 18 + ski Dec = path to 8K. VPS = live fares = better retention. |
| Live fares on beach launch | 🔴 At risk — VPS by Oct 4. 4 days. |
| Data quality | 93/100 — tag enrichment is the Oct 5 job. |
| Code freeze | Day 17 clean. Oct 5 session is last planned touch before launch. |
| Reddit post ready | Draft committed. Jack review + venue callouts by Oct 11. |
| S-Hem spring hook | ✅ Timing is genuinely good. Day 2 of 8-week window at launch = Day 20. |
| `origin/master` footgun | 🔴 Day 8 decided, undone. 10 seconds. |
| Reddit social proof | 🔴 Not addressed. See risk section. |

**For 8K not 5K:** VPS by Oct 4. Reddit post with live venue screenshots and Jack present for first 2 hours. Ski post week of Nov 1 when Tignes opens. That is the path.
