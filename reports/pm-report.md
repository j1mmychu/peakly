# Peakly PM Report v161 — 2026-09-25

**Status: 🔴 RED — VPS Day 47. Oct 18 launch is 23 days away. Code freeze Day 12 clean. Reddit post committed. `origin/master` footgun still live. Oct 4 = last safe VPS window.**

---

## Shipped Since Last Report (v160 → v161)

| Commit | What | Right call? |
|--------|------|-------------|
| `d385dae` | DevOps report Sep 25 (RED) | ✅ No new regressions. VPS timeline unchanged. |
| `2ca270a` | Content report Sep 25 | ✅ Data health 94/100, Day 20 on tag density. New: S-Hemisphere beach is in prime spring window — strongest scoring segment right now. |
| *(this run)* | PM report v161 | ✅ Routine. |

**Zero code commits to app.jsx/sw.js/index.html for 12 days. Code freeze holds.**

---

## Bug Triage

### P0s — None (code side)

### P1 — VPS Redeploy: Day 47, Oct 4 Is The Hard Deadline

The live VPS runs Aug 11 code. Three sets of commits are undeployed:

| Undeployed | What breaks |
|------------|-------------|
| Aug 11 (5 fixes) | Two-weekend scoring off, iOS native blocked, alert deletion broken, weather cache wiped on restart, rate-limiter gameable |
| Sep 9 `3152c96` | Fare fallback: ±1-day weekend round-trip. Off-peak routes return zero fares without this. |
| Sep 10 `c760dfb` | Fare fallback: widen to ±3 days / 2–7 nights. More live fares surface. |

**Oct 4 is the hard deadline.** That's 9 days. The Oct 5 content run assumes a healthy VPS. If VPS isn't deployed by then, the content run holds and the launch post loses its strongest claim (`$X LIVE` badges).

```bash
# One SCP + restart:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && curl -s https://peakly-api.duckdns.org/health"
```

Time: 5 minutes.

### P1 — `origin/master` Footgun: Day 3 on PM Radar, Still Live

Decided in v159. `deploy.yml` pushes to both `main` and `master`. `origin/master` = June 2026 code (pre-404 venues, pre-two-weekend scoring). An accidental push there deploys a 4-month-old app to production.

One command: `git push origin --delete master`

This is not deferred. It was decided. It's not done.

### P1 — Tag Density: 225 Venues at ≤2 Tags, Day 20

Deferred to Oct 5 content run. Hold.

### P1 — Top 15 Venue Photo Go/No-Go

Jack must confirm before Oct 4. If no response by Oct 4, treating as NO-GO and noting it in the content run checklist. No more deferrals.

### P2 — S-Hemisphere Ski Season Closing

23 S-hemisphere ski venues are in the last 7 days of season. Scoring engine handles this correctly. No intervention needed.

**Decision: WORKING AS DESIGNED.**

### P3 — Stale Branches (18)

Orphaned agent experiments. Bundle cleanup with Oct 5 or do it via GitHub UI. Not worth a dedicated session.

---

## Three Product Decisions — Sep 25

### Decision 1: VPS deadline is Oct 4. Not Oct 5. Not "before launch."

"Before launch" isn't a date. Oct 4 is 9 days away. That's the last safe window before the Oct 5 content run. If VPS isn't deployed by Oct 4, two things happen: (1) the content run holds, and (2) the Reddit launch post has to be rewritten to say "price estimates" instead of "live prices." That's a materially weaker product pitch.

**Jack: SSH session by Oct 4. Not optional.**

### Decision 2: S-Hemisphere beach is the strongest scoring segment right now. Use it.

Content report surfaced this today: 69 S-hemisphere beach venues in spring prime window — the best scores in the catalog right now. The Reddit post drafts (r/skiing, r/solotravel, r/travel) don't mention this.

The r/solotravel post should lead with Southern Hemisphere spring. Warm beaches in October are counterintuitive from a US perspective — that's a hook. "While you're freezing in Chicago, Peakly is showing $380 round trips to Florianópolis with 82° surf." That's a r/solotravel thread that goes viral.

**Decision: Add one sentence to the r/solotravel draft referencing S-Hemisphere spring before Oct 11 review date.** This is not a content run change — it's one line in `reports/reddit-launch-post.md`.

### Decision 3: Peakly Pro price ($9/mo vs $79/yr) is NOT a bug. It's a dead UI element.

The prompt flags this as a discrepancy. Per CLAUDE.md and v160's rejection log: Peakly Pro UI is removed. The `$9/mo` text is unreachable in the current app. Zero users see it. Zero revenue impact.

**REJECTED. Do not touch. If/when Pro UI is restored post-launch, price it then.**

---

## This Week's Top 3

1. **VPS deploy by Oct 4** — Jack SSH session, 5 minutes. Unblocks Aug 11 + Sep 9 + Sep 10 fixes. Makes ~55% of beach catalog show live fares instead of estimates on launch day.
2. **Delete `origin/master`** — `git push origin --delete master`. One command. Decided in v159. Still pending. Risk: accidental production rollback to June 2026 code.
3. **Top 15 venue photo go/no-go** — Jack confirms by Oct 4 or it's NO-GO. Not deferring again.

---

## Features REJECTED This Week

- **Peakly Pro price fix ($9/mo → $79/yr)** — UI is removed. Nobody reaches this. Non-issue.
- **Any code change before Oct 5** — code freeze, no exceptions.
- **APNS / push alerts** — post-launch v2.
- **JSON-LD / static h1 SEO** — 81% score is adequate for week 1. Defer post-launch.
- **Stale branch cleanup** — bundle with Oct 5 or GitHub UI; not worth a dedicated session.
- **New venues before Oct 5** — 17 queued. Content run discipline holds.
- **Sentry DSN empty** — FALSE. DevOps confirmed `9416b032...` is in index.html:77. Not a bug.
- **Cache buster stale** — FALSE. `20260914a` is correct for a 12-day code freeze. Not stale.

---

## Success Criteria

### What defines success

- **Launch day (Oct 18):** 500+ unique visitors, <30% bounce, 50+ wishlists saved.
- **Week 1:** 1,000 registered users, 200+ alerts set.
- **90-day:** 5,000–8,000 MAU.

### What gets us to 8K, not 5K

1. **`$X LIVE` badges on launch day.** Requires VPS by Oct 4. ~55% of beach catalog and two-weekend scoring depend on it.
2. **Tags feel editorial, not skeletal.** Oct 5 content run fixes 225 venues from ≤2 tags to 4+. This is the difference between a card that reads "powder, groomed, treeline, après" and one that reads "skiing."
3. **The S-Hemisphere hook in the r/solotravel post.** Spring beach season in South America + SE Asia in October is a legitimately surprising angle. If one post goes viral, it's probably this one, not r/skiing.
4. **Traffic spike doesn't 429.** Weather cache persistence (Aug 11 fix, undeployed) is the Open-Meteo rate-limit protection. Without it, a Reddit spike of 66+ simultaneous DAU trips the free-tier ceiling in the first 20 minutes.

All four trace back to one SSH session before Oct 4.

---

## One Product Risk Nobody Is Talking About

**The r/skiing launch timing is correct but the window is narrow.**

Oct 18 = North American ski season opening. Mammoth opens Nov 1. Whistler Nov 27. Most resorts aren't open yet — the scores will reflect that. A user tapping "Skiing" on Oct 18 sees venues graded on forecast conditions, not open slopes. Most ski venues will show low scores because there's no snowpack yet.

The `lateSeason: true` bypass and hemisphere-aware season gating handle this correctly — the app won't show false positives. But the honest answer for a first-time user on Oct 18 might be "no great ski weekends right now" — which is true and honest, but not the impression you want from a launch-day Reddit post.

**The mitigations that exist:** (1) The scoring engine will correctly surface the 15 late-season/glacier venues (Hintertux, Tignes, Zermatt glacier, Mammoth on early snow) if conditions exist. (2) r/skiing readers understand "early season" and won't punish an honest app for showing it. (3) The `low confidence` filter keeps borderline forecasts off the front page.

**The actual risk:** if Oct 18 is a low-snow, warm early-season week across the Alps and Rockies, the ski category looks like a ghost town. The beach category (S-Hemisphere spring prime) will look great by comparison.

**What to do:** make sure the r/skiing post doesn't promise Peakly is "great for this exact weekend" — it promises Peakly is honest about what the weekend actually looks like. The copy already handles this ("it tells you when it doesn't know"). But Jack should sanity-check actual scores the morning of Oct 18 before posting. If ski looks weak, lead with r/solotravel instead.

---

*Report generated 2026-09-25 by the daily PM agent. v161.*
