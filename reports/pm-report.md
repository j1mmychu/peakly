# Peakly PM Report v157 — 2026-09-21

**Status: 🔴 RED — VPS deadline passed. Oct 18 is now the launch date. Code freeze holds (Day 8). No regressions.**

---

## Shipped Since Last Report (v156 → v157)

| Commit | What | Right call? |
|--------|------|-------------|
| `16333e1` | Content report Sep 21 | ✅ Routine. Seasonal callout on S-hemisphere ski closure timely. |
| `a031a15` | DevOps report Sep 21 (RED) | ✅ Correctly marks deadline passed, runbook intact. |

**Zero code commits since `bb3ebc8` (venue search, Sep 13). Eight days. Correct. Code freeze holds.**

---

## Prompt Context Note (final time)

Scheduled prompt still references stale values. For the record:

- **Venues**: 404 (134 skiing / 270 beach). Not 182.
- **Sentry DSN**: Wired at `index.html:77` and `app.jsx:8`.
- **Cache stamp**: `20260914a` — 8 days old, CORRECT for code freeze.
- **Peakly Pro**: UI CUT for v1. No pricing anywhere. Not a bug.

This note will be dropped from v158 forward.

---

## Bug Triage

### P0s — None (code side).

### P1 — VPS Redeploy: DEADLINE PASSED, LAUNCH DATE SHIFTS TO OCT 18

v156 set the fork: deployed by Sep 20 → Oct 11; missed → Oct 18. Sep 20 passed undeployed. **Oct 18 is the launch date.**

This is not a catastrophe. Oct 18 is the weekend before the first major N-hemisphere resort snow at most Colorado and Alps venues. r/skiing on Oct 18 framing: "ski season is here — here's where to fly this weekend" lands better than an Oct 11 post when only glacier venues are firing.

**What remains broken:**

| Feature | Impact |
|---------|--------|
| Two-weekend scoring | Second weekend always "low confidence" — front page suppressed |
| iOS native proxy | CORS blocks every native proxy call |
| Alert deletion | Preflight blocked, silently fails |
| Weather cache persistence | In-memory; `pm2 restart` wipes cold |
| Rate limiter accuracy | XFF `[0]` instead of `.pop()` — forgeable |

**Runbook (unchanged, 5 minutes):**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && sleep 3 && curl -s https://peakly-api.duckdns.org/health"
```

VPS status becomes a one-liner in v158. The decision tree is closed. This is Jack's action.

### P1 — 18 Stale Remote Branches

Sep 20 cleanup deadline also passed. Still 18 branches, none merged, none with unmerged work that matters. Recommend deleting all 18 before Oct 5 content run to reduce confusion.

Bundle with any other Oct 5 housekeeping.

### P1 — Tag Density (Day 16 Unchanged)

225/404 venues (55.7%) have ≤2 tags; 190 are beach venues. Deferred to Oct 5 content run. Hold.

### P2 — S-Hemisphere Ski Season Closing This Week

Cardrona, Mt Hutt, Las Leñas, Cerro Catedral winding down. The `lateSeason` gate self-manages — no app.jsx intervention needed. The 23 S-hemisphere ski venues will naturally deprioritize. Not a bug, a season.

### P3 — dist/ Build Collision (Day 13 — Non-blocking)

CI rebuilds correctly on push. No action.

---

## Three Product Decisions — Sep 21

### Decision 1: Oct 18 is the launch date. This is final.

v156's fork was explicit. No deployed VPS by Sep 20 = Oct 18. We are now in the Oct 18 track. The product does not change; only the Reddit post date changes.

**Oct 18 framing is arguably better:** it's the first weekend after most N-hemisphere standard ski resorts open (Breckenridge/Keystone/Arapahoe Basin typically open mid-Oct to early Nov). The story is "ski season is starting — here's where to fly." That's a better hook than an Oct 11 post where only glacier venues are live.

**Decision: Oct 18 Reddit launch. Lock it. No further debate.**

### Decision 2: Oct 5 content run scope is confirmed, no additions.

Scope:
- 17 queued venue proposals (must pass `validate-venues.mjs` + duplicate-coordinate check ≤50 km radius)
- Tag density pass (beach venues from ≤2 to ≥4 tags)
- Branch cleanup (delete all 18 stale remote branches)
- Ski-tab viability check for Oct 18 dates (not Oct 11)

No new items. No scope expansion. Jack reviews the diff before auto-push.

**Decision: Oct 5 run scope locked. Human review required before commit.**

### Decision 3: r/skiing post timing based on Oct 18 ski-tab viability, not Oct 11.

The Oct 5 viability check now targets Oct 18. Threshold unchanged: ≥15 ski venues scoring above confidence threshold for the Oct 18–21 weekend. If ≥15, r/skiing post confirmed Oct 18. If <15, r/skiing defers to mid-November (first major opening weekend), and r/solotravel (beach) launches Oct 18 solo.

r/solotravel launches Oct 18 regardless. Tropical beach is entering prime season. The beach story is solid.

**Decision: r/solotravel Oct 18 is unconditional. r/skiing Oct 18 is conditional on Oct 5 viability check.**

---

## This Week's Top 3

1. **VPS deploy** — Jack, 5 minutes, any time before Oct 5. The longer it waits, the fewer days two-weekend scoring is proven stable before launch.
2. **Oct 5 content run prep** — confirm 17-venue batch is dupe-free, reframe ski viability check to Oct 18 dates.
3. **Hold code freeze through Oct 5** — eight days clean. Zero exceptions.

---

## Features REJECTED This Week

- **Any code change before Oct 5** — code freeze. No exceptions.
- **APNS wiring** — post-launch v2. Uncommitted local fix can wait.
- **r/skiing post if ski tab is thin on Oct 18** — Nov fallback confirmed. Score first.
- **Branch cleanup before Oct 5** — bundle it with the content run; standalone branch-delete commit before then is noise.
- **Any new venue proposals** — 17 already queued. Batch discipline. No individual adds.

---

## Success Criteria

### What defines success

- **Launch day (Oct 18):** 500+ unique visitors, <30% bounce, 50+ wishlists saved.
- **Week 1:** 1,000 registered users, 200+ alerts set.
- **90-day:** 5,000–8,000 MAU.

### What gets us to 8K, not 5K

Three variables unchanged, one now tighter:

1. **Live flight pricing on launch day.** VPS deployed before Oct 18. LIVE badges in first Reddit screenshots. This is the highest-leverage remaining action.
2. **Tags feel rich on Explore.** Oct 5 run fixes 190 beach venues. Thin cards bounce.
3. **Traffic spike survives.** VPS weather cache is the only Open-Meteo rate-limit protection. 66+ concurrent DAU without it hits the free tier ceiling.

All three still come down to one SSH session. The window is Oct 1–5 before the content run.

---

## One Product Risk Nobody Is Talking About

**Oct 18 launch targets a weekend that's either the first powder day or the last warm beach weekend of the year — not both simultaneously for most users.**

The seasonal split matters: a US East Coast user in Boston in late October is checking beach venues in Caribbean or Canary Islands, not ski resorts. A Denver user is checking Breckenridge or Arapahoe Basin, not beach. Both audiences are real. But a Reddit post that tries to appeal to both simultaneously reads as unfocused.

**The risk:** the app opens to "Skiing" or "Beach" based on `seasonalDefaultCat()` — correct behavior. But the Reddit post title has to pick one. If we lead with ski framing for the Oct 18 launch and the viability check shows only 12 ski venues are actually scoring above threshold that weekend, the lead story is "Peakly's best ski pick is… Tignes, which everyone already knows."

The beach story is stronger right now. Tropical beach entering prime season, 270 venues, no "but is there snow yet?" uncertainty. If the ski viability check fails, the beach post alone can carry Oct 18. The PM risk is defaulting to a ski-first post because it feels like fall without checking the score data first.

**Mitigation:** Oct 5 viability check outputs a clear number — venues scoring above threshold, top 5 picks, confidence levels. PM reviews that output before writing the Reddit headline, not after.

---

*Report generated 2026-09-21 by the daily PM agent. v157.*
