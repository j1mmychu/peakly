# Peakly PM Report v168 — 2026-10-02

**Status: 🔴 RED — VPS Day 54. Oct 4 deadline = 48 HOURS. Oct 18 beach launch = 16 days. Code freeze Day 19 clean. S-Hem spring Day 4 of 8-week prime window. One gate left: Jack's SSH session.**

---

## Shipped Since Last Report (v167 → v168)

| Commit | What | Right call? |
|--------|------|-------------|
| `e56d3e3` | DevOps Oct 2 — YELLOW, VPS Day 54, 2 days to Oct 4, 404 venues | ✅ Accurate state. |
| `d3c6fd0` | Content Oct 2 — 93/100 score, GNB/VCE/HND AIRPORT_COORDS correction, S-Hem spring Day 4 | ✅ The GNB/VCE/HND correction matters for venue proposals. See §Bug Triage. |

**Zero code commits to app.jsx/sw.js/index.html for 19 days. Code freeze holds.**

---

## Bug Triage

### P0 — None (app code clean)

---

### P1 — VPS Redeploy: Day 54, Oct 4 = **48 HOURS**

This is the last time this report calls it "days." We're in hours. Oct 4 means: if VPS isn't deployed by EOD Oct 4, the Oct 18 beach launch ships without live pricing and without two-weekend scoring. That's "good" not "great."

What's broken for 54 days: two-weekend scoring (week 2 null), iOS CORS block, alert deletion silently failing, rate-limit spoofing vector, fare-fallback not upgrading `~$X` to `$X LIVE` on some beach routes, weather cache wiped on restart.

The 4 commands (10 minutes):
```bash
ssh root@198.199.80.21
cp -r /opt/peakly-proxy /opt/peakly-proxy.bak.$(date +%Y%m%d)
curl -sL https://raw.githubusercontent.com/j1mmychu/peakly/main/server/proxy.js -o /opt/peakly-proxy/proxy.js
pm2 restart peakly-proxy && curl -s https://peakly-api.duckdns.org/health
```

Verify: `apns:configured` OR `apns:unconfigured` (either is fine), `uptime` resets to seconds, `forecast_days:14`.

**48 hours. That's it.**

---

### P1 — `origin/master` Footgun: Day 10 Decided, Still Undone

`deploy.yml` deploys both `main` and `master`. An accidental push to `master` ships Sep 2026 code to production silently. 30 seconds to fix:

```bash
git push origin --delete master
```

**Day 10. 10 seconds. Before Oct 4, not Oct 5.**

---

### P1 — GNB/VCE/HND Missing from AIRPORT_COORDS (Content correction, Oct 2)

Content report corrected yesterday's false positive: GNB (Grenoble), VCE (Venice), HND (Tokyo Haneda) are in `AP_CONTINENT` and `BASE_PRICES` but **NOT** in `AIRPORT_COORDS`. The venue-integrity guard in `auto-push.sh` requires both — any venue proposal using these airport codes will fail the guard.

**Decision:** DEFER. These three airports have no current venues using them. The gap only matters when the first venue for each airport is added. Add the `AIRPORT_COORDS` entries in the same Oct 5 commit that first uses each airport. No Oct 5 venue proposals require GNB/VCE/HND — no action needed before launch.

---

### P2 — Tag Density (225 venues at ≤2 tags): Oct 5

Day 27. 55.7% of venues under-enriched. Oct 5 session. Not touching before then.

---

### P2 — Gili Trawangan Duplicate: Oct 5

`beach_gilit` → `beach_gili_air` (Gili Air). Oct 5. 3 days.

---

### P3 — Stale Branches (15 claude/* + 3 others)

Oct 5. GitHub UI. 2 minutes.

### P3 — Peakly Pro Price ($9/mo vs $79/yr)

REJECTED. Dead UI. Zero users to mislead. Post-launch if Pro revives. Flagging this again adds no value.

### P3 — Sentry DSN

✅ CONFIRMED LIVE. Stop flagging.

### P3 — Cache stamp frozen at `20260914a`

Expected during code freeze. Auto-bumps on next app.jsx commit. Not a user-facing issue.

---

## Three Product Decisions — Oct 2

### Decision 1: VPS miss on Oct 4 triggers a Reddit post copy change. Non-negotiable.

If Jack does not deploy the VPS by EOD Oct 4 (48 hours from now), the Reddit post must change "live prices from your home airport" to "estimated prices from your home airport." We do not ship marketing copy that overpromises a feature that isn't live. Jack updates that one line before Oct 11 review.

**DECISION: Oct 4 = VPS deadline. If missed, copy change is mandatory before launch. No exceptions.**

### Decision 2: Screenshot in Reddit post is now required, not optional.

v167 flagged this as a risk. Promoting it to a decision: the Reddit post does not ship without at least one screenshot of the app showing a real beach venue with a weekend score and a fare on Oct 18 morning. This is 2 minutes of work — open the app, find the top beach pick, screenshot the card. The alternative is a wall of text describing a product Reddit has never seen. "I built this" posts without screenshots die.

**DECISION: Reddit post requires one in-app screenshot. Jack captures it on the morning of Oct 18 from a live device (or the live website on mobile). Not optional.**

### Decision 3: Oct 5 scope is locked. GNB/VCE/HND airport additions go to post-launch.

The GNB/VCE/HND AIRPORT_COORDS gap surfaces a class of venue proposals (Alpe d'Huez, Venice Lido, Shonan Coast) that require a small pre-commit fix. These are good venues. They are not needed for launch. Adding them to Oct 5 would extend a session that already has Gili rename + 225-venue tag enrichment + branch cleanup + master delete.

**DECISION: GNB/VCE/HND airport entries + associated venue proposals → Nov 1 ski-launch session or later. Not Oct 5.**

---

## This Week's Top 3

1. **VPS deploy before Oct 4** — 48 hours. 4 commands. 10 minutes. Turns good launch into great launch. Every hour of delay is an hour closer to shipping without live pricing.
2. **Delete `origin/master`** — 30 seconds. Day 10. Do it today when you SSH into the VPS. Don't make this a separate session.
3. **Jack reviews Reddit launch post by Oct 11** — Confirm the three venue callouts match what Explore actually shows for the Oct 18 weekend. Add the screenshot captured Oct 18 morning.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| GNB/VCE/HND airport + venue adds before Oct 5 | Scope creep on an already full Oct 5 session. No current venue uses these airports. Post-launch. |
| Any app.jsx changes before Oct 5 | 19-day code freeze, 16 days from launch. |
| Pro pricing UI fix ($9/mo → $79/yr) | Dead UI. Zero users to mislead. |
| Tignes content in Oct 18 beach post | Wrong audience. r/skiing Nov 1 is the right vehicle. |
| Automating Reddit post | Jack posts manually. First impression needs a human present. |

---

## One Product Risk Nobody Is Talking About

**The 18-second weather load on first visit.**

DevOps surfaced this in the technical notes but nobody's called it a product risk: cold visit = up to 9 batches × 2 seconds = 18 seconds before venue scores appear. During that window, users see cards with `~$X` estimates and no conditions score. On Reddit, people click a link, the app loads, and in 5 seconds they've already decided if it's real or vaporware.

The VPS weather cache fixes this: once the cache is warm, the first user's weather fetch is 1 call instead of 404. Every subsequent user on the same day pays ~0. But the cache is cold at pm2 restart — meaning the first ~50 Reddit visitors after the Oct 18 post hits will see the slow path. Those are your highest-value first impressions.

**Mitigation Jack can do in 5 minutes:** after the VPS is deployed on Oct 4, trigger a warm-up load by visiting the live app from a laptop. That single visit seeds the weather cache for all 404 venues. Every Reddit visitor from that point forward sees instant scores. Do this once after the pm2 restart, and again on the morning of Oct 18 before posting.

---

## S-Hemisphere Spring — Launch Context

Oct 2 = Day 4 of the 8-week prime window. Oct 18 = Day 20. On track.

- **Brazil (12 venues)**: FOR/NAT confirmed in AP_CONTINENT. Florianópolis, Jericoacoara, Pipa — spring prime.
- **South Africa (5 venues)**: Cape Town spring warming. Top-5 beach candidate for Oct 18.
- **Australia / NZ**: Shoulder fares, spring warming.

Hintertux glacier open (365-day). Saas-Fee final weeks. lateSeason flag working correctly. Ski scores are honest right now — only the two glaciers get GO.

---

## Success Criteria Check

| Metric | Status |
|--------|--------|
| 90-day projection (5K–8K) | Beach Oct 18 + ski Nov 1 + ski Dec = path to 8K. VPS = live fares = better retention. |
| Live fares at beach launch | 🔴 At risk — VPS Oct 4 = 48 hours. |
| Data quality score | 93/100. Tag enrichment Oct 5. |
| Code freeze | ✅ Day 19 clean. |
| Reddit post ready | Draft committed Sep 24. Jack review + venue callouts by Oct 11. Screenshot Oct 18 morning. |
| S-Hem spring hook | ✅ Day 4 of 8-week window. Timing genuinely good. |
| `origin/master` footgun | 🔴 Day 10, still live. 30 seconds. |
| Reddit screenshot | ⚠️ Now a hard requirement. Oct 18 morning. |
| r/skiing post | ✅ Targeted Nov 1. Draft needed by Oct 25. |
| Weather cache warm-up | ⚠️ New item: Jack manually visits app after VPS restart to seed cache before Reddit post. |

**For 8K not 5K:** VPS by Oct 4 (live fares + fast scores). Screenshot in the post (proves product is real). Cache warm-up on Oct 18 morning (first Reddit visitors see instant scores). Ski post Nov 1 (second traffic wave). Jack present for 2h post-launch (upvote momentum window). That's the path.
