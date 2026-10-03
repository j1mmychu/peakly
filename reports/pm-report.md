# Peakly PM Report v169 — 2026-10-03

**Status: 🔴 RED → ⏰ ZERO HOUR — VPS Day 55. Oct 4 deadline = TOMORROW. Oct 18 beach launch = 15 days. Code freeze Day 20 clean. Jack's SSH session is the only remaining gate.**

---

## Shipped Since Last Report (v168 → v169)

| Commit | What | Right call? |
|--------|------|-------------|
| `368ef0b` | DevOps Oct 3 — YELLOW, VPS Day 55, TOMORROW deadline | ✅ Accurate escalation. |
| `88f2f32` | Content Oct 3 — 94/100, tag count corrected (225→91 venues under-enriched) | ✅ Important correction. The prior 27-day P2 was inflated. |

**Zero code commits to app.jsx/sw.js/index.html for 20 days. Code freeze holds.**

---

## Bug Triage

### P0 — None (app code clean)

---

### P1 — VPS Redeploy: Day 55, Oct 4 = **TOMORROW**

This report will not count days anymore. The deadline is Oct 4. It is either done or it isn't.

**What is broken for 55 days:** two-weekend scoring (week 2 null for all 404 venues), iOS CORS block, alert deletion silent failure, rate-limit spoofable, weather cache wiped on restart.

The 4 commands (10 minutes):
```bash
ssh root@198.199.80.21
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
# On VPS:
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health
```

Verify: `forecast_days:14` and `wx_disk_cache_loaded:true`.

**After deploy:** Visit the live app once from a laptop to seed the weather cache. Repeat on Oct 18 morning before posting to Reddit.

**If not done by EOD Oct 4:** Reddit post copy must change "live prices" to "estimated prices" before Oct 11. Non-negotiable per Decision 1, v168.

---

### P1 — `origin/master` Footgun: Day 11

`deploy.yml` deploys both `main` and `master`. Accidental push to `master` = silent production rollback to Sep 2026 code. 30 seconds:

```bash
git push origin --delete master
```

**Do this during the same SSH session as the VPS deploy. Not Oct 5. Now.**

---

### P2 — Tag Density: 91 venues at ≤2 tags (corrected from 225)

Content corrected the count today. 22.5% of venues under-enriched, not 55.7%. Still the #1 quality gap but less severe than 27 days of reports implied. Oct 5 session.

---

### P2 — Gili Trawangan Duplicate: Oct 5

`beach_gilit` → `beach_gili_air`. 2 days. On track.

---

### P3 — Peakly Pro Price, Sentry DSN, Cache Stamp

All confirmed non-issues. Stop surfacing them.

---

## Three Product Decisions — Oct 3

### Decision 1: VPS miss on Oct 4 is a launch quality downgrade. Not a blocker.

If Oct 4 passes without a deploy, we do not cancel or delay Oct 18. We launch with estimated prices and note the gap honestly. The app is real and useful without live fares. But the Reddit post copy must be updated (v168 Decision 1 still stands).

**DECISION: Oct 18 beach launch is unconditional. VPS miss changes copy, not date.**

### Decision 2: Oct 5 scope stays exactly as defined in v168. Nothing added.

Content corrected the tag count from 225 to 91 today. That's a meaningful change — 22.5% under-enriched is still worth fixing, but it halves the Oct 5 workload. The freed time goes to quality review, not feature scope expansion. Gili rename + tag enrichment (91 venues, not 225) + master delete + stale branch cleanup.

**DECISION: Oct 5 scope locked. Tag enrichment is lighter than projected. No new items added.**

### Decision 3: r/skiing Nov 1 post needs a draft by Oct 25. Starting the clock.

v167 set Nov 1 as the target. Two drafts are now needed: (1) Oct 18 beach post (draft committed Sep 24, Jack reviews Oct 11), (2) Nov 1 ski post (no draft exists). Nov 1 is 29 days away. Oct 25 deadline for the ski draft leaves 7 days for Jack review.

**DECISION: r/skiing draft due Oct 25. Assign to the PM agent to draft a first version, Jack refines. Not optional.**

---

## This Week's Top 3

1. **VPS deploy by Oct 4 EOD** — TOMORROW. 4 commands. 10 minutes. Delete `origin/master` in the same session. Do both or do neither.
2. **Oct 5 session: Gili rename + tag enrichment (91 venues) + stale branch cleanup** — lighter than planned thanks to the tag count correction. Still needs execution.
3. **r/skiing draft by Oct 25** — Jack reviews Oct 18 beach post on Oct 11. PM agent drafts ski post. Two posts, two audiences, two traffic waves = path to 8K.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| Any app.jsx changes before Oct 5 | Code freeze Day 20. 15 days from launch. |
| GNB/VCE/HND airport entries before launch | No current venues use these. Post-launch. |
| Automating Reddit post | Jack posts manually. First impression needs a human. |
| Tignes content hook in Oct 18 beach post | Wrong audience. r/skiing Nov 1. |
| Pro pricing fix ($9/mo → $79/yr) | Dead UI, zero users. |

---

## One Product Risk Nobody Is Talking About

**The two-launch sequence has a sequencing trap.**

Oct 18 is the beach launch. Nov 1 is r/skiing. They look independent. They're not. The Oct 18 Reddit post will be indexed by Google within hours. If it ranks for "ski weekend conditions" (it might — Peakly has both categories), the Nov 1 r/skiing post competes with the Oct 18 post in search. Two posts from the same product within 13 days can read as spam to subreddit mods who check post history.

More concretely: if Oct 18 gets 500 upvotes and Nov 1 r/skiing says "I built this app for ski weekends," someone in the comments will say "didn't you just post this?" That's a credibility hit at the moment that matters most — ski season opener.

**Mitigation:** The Nov 1 post should lead with ski season specifics (opening conditions, which resorts have early snow), not "here's my app again." The product is the same; the angle is entirely different. The ski post should feel like a ski enthusiast sharing intel, with the app as the tool — not a cross-post.

This is a tone and framing question for Jack to solve in the draft, not a technical fix. But it needs to be thought through before Oct 25.

---

## Success Criteria Check

| Metric | Status |
|--------|--------|
| 90-day projection (5K–8K) | Beach Oct 18 + ski Nov 1 = two-wave path. Sequencing trap (above) is manageable if Nov 1 post has distinct angle. |
| Live fares at beach launch | 🔴 At risk — VPS Oct 4 = TOMORROW. |
| Data quality score | 94/100. Tag enrichment reduced to 91 venues. Oct 5. |
| Code freeze | ✅ Day 20 clean. |
| Reddit beach post | Draft committed Sep 24. Jack review Oct 11. Screenshot Oct 18 morning. |
| `origin/master` footgun | 🔴 Day 11. Delete it when you SSH for the VPS deploy. |
| Reddit screenshot | ⚠️ Hard requirement. Oct 18 morning, live device. |
| r/skiing post | ⚠️ Nov 1 target, no draft yet. Oct 25 deadline set today. |
| Weather cache warm-up | ⚠️ After VPS deploy: visit live app once. Again Oct 18 morning before post. |
| Two-post sequencing risk | ⚠️ Newly flagged. Nov 1 ski post must have distinct angle, not a re-pitch. |

**For 8K not 5K:** VPS live (fares + fast scores). Screenshot in beach post. Cache warm-up Oct 18. Ski post Nov 1 with a different angle than the beach post. Jack present for 2h post-launch on Oct 18 for upvote momentum. That's still the path.
