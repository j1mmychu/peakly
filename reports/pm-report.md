# Peakly PM Report v160 — 2026-09-24

**Status: 🔴 RED — VPS Day 46. Oct 18 launch is 24 days away. Code freeze Day 11 clean. NEW: Sep 9+10 proxy.js fare-fallback commits also undeployed — off-peak beach routes return zero fares on the live VPS. Reddit post draft committed. `origin/master` footgun still live.**

---

## Shipped Since Last Report (v159 → v160)

| Commit | What | Right call? |
|--------|------|-------------|
| `99b5a9b` | DevOps report Sep 24 (RED) | ✅ New finding: Sep 9+10 proxy.js commits undeployed. More impactful than previously understood. |
| `2e642d5` | Content report Sep 24 | ✅ Data health 94/100, tag density unchanged Day 19. |
| *(this run)* | `reports/reddit-launch-post.md` committed | ✅ Due Sep 27 per v159's decision. Written early — done. |

**Zero code commits to app.jsx/sw.js/index.html for 11 days. Code freeze holds.**

---

## Bug Triage

### P0s — None (code side)

### P1 — VPS Redeploy: Day 46, NOW WORSE THAN PREVIOUSLY REPORTED

Today's DevOps report surfaced a second set of undeployed proxy.js commits. This changes the severity calculation.

**What's dead on the live VPS (Aug 10 code):**

| Missing | What it breaks |
|---------|---------------|
| Sep 10 `c760dfb` | Fare fallback: widen to ±3 days / 2–7 nights. Without this, off-peak routes return ZERO fares. |
| Sep 9 `3152c96` | Fare fallback: nearest ±1-day weekend RT. Same — off-peak routes return nothing. |
| Aug 11 fixes | Two-weekend scoring, iOS native proxy, alert deletion, weather cache persistence, rate-limiter accuracy |

**Implication for launch screenshots:** The `$X LIVE` badge only appears when a live fare comes back. For off-peak routes (most beach venues outside US hubs), the live VPS currently returns nothing, so the card falls back to `~$X` estimate. The Reddit launch post's strongest signal — real prices — requires the VPS.

**Hard deadline: Oct 4. That's 10 days.** After that, the Oct 5 content run assumes a healthy VPS. If the SSH session hasn't happened, the content run holds.

```bash
# The full deploy — all three commits in one scp + restart:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && curl -s https://peakly-api.duckdns.org/health"
```

### P1 — `origin/master` Footgun: Day 2 on PM radar, Still Live

`deploy.yml` pushes to both `main` and `master`. `origin/master` points to June 2026 code (8,469-line app.jsx — pre-404 venues, pre-two-weekend scoring, pre-onboarding rewrite). An accidental push there redeploys a 4-month-old app to production.

**Still pending from v159's explicit decision to delete it.** This is not deferred — it was decided. Jack or any session with push access: `git push origin --delete master`. One command.

### P1 — Tag Density: 225 Venues at ≤2 Tags, Day 19

Deferred to Oct 5 content run. Hold.

### P1 — Top 15 Venue Photos: Oct 5 Go/No-Go

Decision from v159: Jack confirms go/no-go before Oct 5. The Unsplash pipeline exists, Jack has the key, 2 hours of work. Wrong photo on a marquee venue (Whistler, Bora Bora) gets called out in the first Reddit comment.

**Still needs Jack's explicit confirm.** Not deferring again — if no response by Oct 4, treat as NO-GO and note it in the content run checklist.

### P2 — S-Hemisphere Ski Season Closing

23 S-hemisphere ski venues (NZ, AUS, Chile, Argentina) are in the last 1-2 weeks of their season. The scoring engine handles this correctly — hemisphere-aware season gating, `isNorth = lat >= 0` — venues will naturally down-score and deprioritize. No intervention needed.

**Decision: WORKING AS DESIGNED. No action.**

### P3 — dist/ Build Collision

Non-blocking. CI handles it.

---

## Three Product Decisions — Sep 24

### Decision 1: Reddit post draft is committed. Stop deferring it.

`reports/reddit-launch-post.md` committed this run. Three drafts: r/skiing (primary), r/solotravel (secondary), r/travel (tertiary). Talking points for comments included.

**Jack: review by Oct 11. If unchanged by Oct 15, use the draft verbatim.**

Critical constraint baked into the draft: the `$X LIVE` badge only appears if VPS is deployed. If VPS isn't live by Oct 18, the r/skiing draft needs to say "price estimates" not "live prices." This is a concrete consequence — not abstract technical debt.

### Decision 2: VPS deploy unblocks THREE sets of improvements, not one.

Previous reports framed this as "two-weekend scoring + iOS native." The actual scope is wider: Aug 11 fixes + Sep 9 fare-fallback + Sep 10 fare-fallback widening. The live VPS returns zero fares for off-peak routes. That's ~55% of the beach catalog showing `~$X` estimates on launch day when they could show `$X LIVE`.

**Raising severity: this is now the single highest-impact action before Oct 18. One SSH session. Oct 4 hard deadline.**

### Decision 3: Code freeze extends through Oct 5 content run.

11 days clean. 18 stale branches are orphaned agent experiments, not in-flight work. Nothing queued in `reports/ready-to-ship/` that isn't already known.

**Code freeze holds through Oct 5. The only exception is the auto-bump in `scripts/auto-push.sh` (the content run bumps the cache stamp automatically). No net-new code before Reddit launch.**

---

## This Week's Top 3

1. **VPS deploy by Oct 4** — SSH session, 5 minutes. Unblocks two-weekend scoring, iOS native, weather cache persistence, AND three months of fare-fallback improvements that make off-peak routes show live prices. Every other Oct 5 item depends on this.
2. **Delete `origin/master`** — decided last report, still pending. `git push origin --delete master`. One command. The dual deploy.yml trigger makes this a live production risk, not noise.
3. **Top 15 venue photo go/no-go** — Jack explicitly confirms before Oct 5 or it's a no-go. No more deferrals.

---

## Features REJECTED This Week

- **Any code change before Oct 5** — code freeze. No exceptions.
- **APNS** — post-launch v2. Not before Reddit.
- **Peakly Pro price fix ($9/mo → $79/yr)** — Peakly Pro UI is removed. Nobody reaches this text. Not worth touching.
- **JSON-LD / static h1 SEO** — 81% SEO score is good enough for week 1. Defer post-launch.
- **New venues before Oct 5** — 17 queued. Content run batch discipline holds.
- **Stale branch cleanup (18 branches)** — bundle with Oct 5 or do it now via GitHub UI; not worth a dedicated session.

---

## Success Criteria

### What defines success

- **Launch day (Oct 18):** 500+ unique visitors, <30% bounce, 50+ wishlists saved.
- **Week 1:** 1,000 registered users, 200+ alerts set.
- **90-day:** 5,000–8,000 MAU.

### What gets us to 8K, not 5K

1. **`$X LIVE` badges on launch day.** VPS deployed → real fares → screenshots people share. `~$350` stays invisible. Sept 9+10 commits widen the fallback — even off-peak routes get a live fare instead of nothing.
2. **Tags feel curated, not skeletal.** Oct 5 run fixes 225 beach venues from ≤2 tags to 4+. A card that reads "powder, groomed, treeline, après" is a recommendation. A card with "skiing" is a spreadsheet row.
3. **Traffic spike doesn't kill it.** Weather cache persistence (one of the Aug 11 commits) is the Open-Meteo rate-limit protection. Without it, a Reddit spike of 66+ simultaneous DAU on the same venue set trips the free-tier ceiling and the app 429s for everyone in the first 20 minutes.

All three trace back to one SSH session before Oct 4.

---

## One Product Risk Nobody Is Talking About

**The fare-return gap for beach venues at launch.**

Without the Sep 9+10 proxy.js commits deployed, ~270 beach venues on off-peak routes return zero fares from the live proxy and fall back to `~$X` BASE_PRICES estimates. This is the majority of the catalog.

The launch post is targeting r/skiing first (Oct 18 — ski season opening). That's the right call. Ski venues are N-hemisphere hubs with better Travelpayouts coverage. But if anyone clicks through to beach venues on launch day, they'll see estimates, not live prices.

The risk isn't a crash — it's a credibility gap. Peakly's pitch is "live conditions + live prices." On launch day, beach prices are stale estimates for most routes. A sharp-eyed commenter notices. The thread goes sideways.

The fix is the same SSH session. The question is whether Jack does it before Oct 4.

---

*Report generated 2026-09-24 by the daily PM agent. v160.*
