# Peakly PM Report v170 — 2026-10-04

**Status: 🔴 RED — VPS Day 56 DEADLINE WAS TODAY. Oct 18 beach launch = 14 days. Code freeze Day 21 clean. The only remaining gate is Jack's SSH session.**

---

## Shipped Since Last Report (v169 → v170)

| Commit | What | Right call? |
|--------|------|-------------|
| `875649f` | Content Oct 4 — score drops 94→88 on tag count reversal (225 is correct, Oct 3 "91" was itself a bad regex) | ✅ Catching the correction to the correction matters. Eval is always authoritative. |
| `9752f94` | DevOps Oct 4 — YELLOW, VPS Day 56 deadline TODAY, new SW PRECACHE P3 finding | ✅ Accurate. |

**Zero code commits to app.jsx/sw.js/index.html in 21 days. Code freeze holds.**

Notable: Content's Oct 3 "tag count correction" (225→91) was itself wrong. Eval confirms 225 venues (55.7%) have only 2 tags. The Oct 5 session tag enrichment workload just doubled back to the original estimate. Adjust plans accordingly.

---

## Bug Triage

### P0 — VPS Redeploy: Day 56. TODAY Was the Deadline.

The PM-set pre-traffic gate was Oct 4. It is Oct 4. This report is the written record that the deadline has now passed.

**What is broken:** two-weekend scoring null for all 404 venues, iOS CORS block, alert deletion silent failure, rate-limit spoofable, weather cache wiped on restart.

**State as of this report:** The 4 deploy commands have been documented in every report since Aug 11. The code in `server/proxy.js` is correct, committed, and ready. The VPS is not a git clone — there is no automated deploy path. Jack must SSH.

**From a networked machine (not a sandbox):**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health
```

Verify: `forecast_days:14` + `wx_disk_cache_loaded:true`.

After restart: warm the weather cache manually before any traffic (curl loop in DevOps report §2). Repeat warm-up Oct 18 morning before posting.

**Launch consequence:** 14 days to Oct 18. If VPS remains undeployed at launch, Reddit post copy must describe prices as estimates. That's still a launchable product. But two-weekend scoring being dead at launch is a real quality gap — the Fri–Mon moat is the differentiation.

---

### P1 — `origin/master` Footgun: Day 12

`deploy.yml` deploys both `main` and `master`. A single accidental push to `origin/master` silently rolls production back to Sep 2026 code. 14 days from launch is not the time to carry this risk.

```bash
git push origin --delete master
```

30 seconds. Delete it in the same terminal session as the VPS deploy.

---

### P2 — Tag Density: 225 Venues (55.7%) at ≤2 Tags — Restored to Correct Count

Oct 3 report claimed this was 91 due to a "regex fix." Oct 4 Content report reversed the correction — the Oct 3 regex was still format-sensitive and undercounted. Eval of the VENUES array (the only authoritative method) confirms 225. Estimated editorial time: ~2 hours for targeted enrichment of the highest-visibility venues first.

Oct 5 scope is heavier than v169 projected. Re-prioritize: Gili rename + tag enrichment for the top 50 venues by weekendScore (not all 225 in one pass). The rest carry over.

---

### P2 — BASE_PRICES Gap: 67 of 165 APs Missing (127 Venues, 31.4%)

Deal scoring accuracy for nearly a third of the catalog relies on a generic fallback. Top missing APs by venue count documented in Content report. Backfill the top ~15 by venue count before launch — this is the stated v168 target and it hasn't moved.

---

### P3 — SW PRECACHE Babel URL Mismatch (New, DevOps Oct 4)

Service worker PRECACHE entry references a Babel CDN URL that doesn't match the version in index.html. Dev-only (production CI drops Babel). Low impact. Post-launch.

---

## Three Product Decisions — Oct 4

### Decision 1: VPS missed its Oct 4 deadline. Launch quality is degraded, not blocked.

Two-weekend scoring being null at launch is the most significant quality gap. It's the differentiator. But 404 venues with week-1 scoring still render, flight estimates still show, the core experience works.

**DECISION: Oct 18 launch is unconditional. Reddit post copy shifts to "estimated prices" language if VPS remains undeployed. No delay, no cancellation. The window is ski season opener — missing Nov 1 r/skiing costs more than launching with estimates.**

### Decision 2: Oct 5 tag enrichment scope is the top 50 high-score venues, not all 225.

The Oct 3 "correction" that halved the estimate was itself wrong. 225 venues need work. A 2-hour estimate for 225 venues in one pass is probably generous — 4 tags each, evaluating appropriateness. Do the top 50 by weekendScore (most visible in default sort). The rest carry to a post-launch pass. Gili rename stays Oct 5 as planned.

**DECISION: Oct 5 tag enrichment = top 50 venues by weekendScore only. 225 full pass is post-launch.**

### Decision 3: r/skiing draft by Oct 25. Content agent or PM agent drafts, Jack refines by Nov 1.

Oct 18 beach post is drafted and awaiting Jack review Oct 11. The ski post has no draft. 27 days to Nov 1. The sequencing trap (flagged v169: two posts in 13 days read as spam to subreddit mods) is real — the Nov 1 post must lead with ski-season-specific intel, not "my app." The draft needs to reflect that angle from the first sentence.

**DECISION: r/skiing draft due Oct 25. Must open with early-season snow conditions, not the product. The app is the tool, not the story.**

---

## This Week's Top 3

1. **VPS deploy + `origin/master` delete — Jack SSH, 15 minutes total.** Documented every day since Aug 11. Nothing more to say.
2. **Oct 5: Gili rename + top-50 tag enrichment + stale branch cleanup.** 14 claude/* branches on origin doing nothing. Clean them. Tag enrichment is heavier than projected — scope to top 50 only.
3. **Oct 11: Jack reviews beach Reddit post draft.** Screenshot on launch morning (Oct 18). Cache warm-up before posting. These three things determine the opening wave.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| Any app.jsx changes before Oct 5 | Code freeze Day 21. 14 days from launch. |
| Full 225-venue tag pass on Oct 5 | Too wide. Top 50 by weekendScore is the 80/20. |
| BASE_PRICES full backfill (67 APs) | Top 15 by venue count before launch. Not all 67. |
| SW PRECACHE Babel URL fix | Dev-only, P3. Post-launch. |
| Automating the Reddit post | Jack posts manually. Timing and presence matter at launch. |
| Peakly Pro price display fix | Dead UI. Zero users paying. Post-launch if Pro revives. |

---

## One Product Risk Nobody Is Talking About

**The weather cache cold-start is a launch-day failure mode that could make the Oct 18 post look broken to its first 500 readers.**

If VPS is deployed before Oct 18 (good) but Jack doesn't manually warm the cache in the ~30 minutes before the Reddit post goes live, the first wave of users hits a cold proxy. 500 concurrent requests for the same uncached coords → 500 upstream Open-Meteo calls in seconds → rate ceiling hit → "conditions unavailable" for everyone who clicks in the first hour → the exact users who matter most for upvote momentum see a broken product.

The DevOps warm-up script is documented. It needs to be in a runbook Jack runs on launch morning, not something that "should probably happen." Specifically: warm-up runs *after* the VPS deploy (whenever that happens) AND *again* Oct 18 morning before the post goes live. Two warm-ups, two different risks.

If the VPS hasn't been deployed at all by Oct 18, this risk is moot — the app falls back to direct Open-Meteo and 500 concurrent users hit the free-tier ceiling directly. Different failure, same symptom: "conditions unavailable" for the opening wave.

**The product risk at launch is not a missing feature — it's cache cold-start turning the opening hour into a bad demo.**

---

## Success Criteria Check

| Metric | Status |
|--------|--------|
| 90-day projection (5K–8K) | Two-wave path still intact. VPS slip is a quality gap, not a kill shot. |
| Live fares at beach launch | 🔴 VPS still undeployed. Deadline missed. |
| Data quality score | 88/100. Tag count restored to 225 (Oct 3 "correction" was wrong). Top-50 pass Oct 5. |
| Code freeze | ✅ Day 21 clean. |
| Reddit beach post | Draft committed Sep 24. Jack review Oct 11. Screenshot Oct 18 morning. |
| `origin/master` footgun | 🔴 Day 12. Delete in same SSH session as VPS deploy. |
| Cache warm-up | ⚠️ Must run after deploy AND again Oct 18 morning before posting. Two warm-ups. |
| r/skiing post | ⚠️ No draft. Oct 25 deadline. Must open with ski-season intel, not a product pitch. |
| Two-post sequencing risk | ⚠️ Ongoing. Nov 1 post angle must be distinct from Oct 18. |
| Oct 5 scope | ⚠️ Heavier than projected (225 real, not 91). Scoped to top-50 pass. |
| Stale claude/* branches | ⚠️ 14 branches on origin. Cleanup Oct 5. |

**For 8K not 5K:** VPS live before Oct 18 (even if just barely). Cache warm-up morning of launch. Screenshot in the post. Jack present for 2 hours post-launch for upvote momentum. r/skiing Nov 1 post with a different angle. That path still exists. The Oct 4 VPS deadline missing doesn't close it.
