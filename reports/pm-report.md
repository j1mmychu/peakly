# Peakly PM Report v163 — 2026-09-27

**Status: 🔴 RED — VPS Day 49. Oct 4 deadline is 7 days away. Oct 18 beach launch is 21 days away. Code freeze Day 14 clean. `origin/master` footgun now Day 5 decided-but-undone. Beach launch framing confirmed — r/skiing to December.**

---

## Shipped Since Last Report (v162 → v163)

| Commit | What | Right call? |
|--------|------|-------------|
| `33a0bc7` | DevOps Sep 27 — closed 406 vs 404 false alarm, confirmed stale branch count 18, flagged GNB/AIRPORT_COORDS gap | ✅ Solid catch on GNB. |
| `d367d72` | Content Sep 27 — 404 confirmed, GNB blocker surfaced (pre-paste catch, no live bug), Gili Trawangan duplicate flagged | ✅ Good. Pre-paste gap caught before damage. |
| *(this run)* | PM report v163 | ✅ Routine. |

**Zero code commits to app.jsx/sw.js/index.html for 14 days. Code freeze holds.**

---

## Bug Triage

### P0s — None

### P1 — VPS Redeploy: Day 49, Oct 4 Is 7 Days Away

Live VPS runs Aug 11 code. Three sets of fixes are committed on `main` but not on the VPS:

| Undeployed | What breaks |
|------------|-------------|
| Jun 8 | CORS order, rate limit 60→600/min, round-trip filter |
| Aug 11 (deployed) | Base fixes in production — this is the current VPS binary |
| Sep 9 `3152c96` | Fare fallback ±1-day weekend RT — off-peak beach routes return null fares |
| Sep 10 `c760dfb` | Widen fallback to ±3 days / 2–7 nights |

**270 beach venues, 21 days to Reddit launch, showing `~$X` estimates instead of `$X LIVE` because the Sep 9+10 proxy fixes aren't deployed.** The beach launch pitch is "best weekend spots + what flights actually cost." Without live fares, that's half a pitch.

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && curl -s https://peakly-api.duckdns.org/health"
```

5 minutes. Oct 4, not later.

### P1 — `origin/master` Footgun: Day 5 Decided, Still Undone

`origin/master` = June 2026 code. `deploy.yml` deploys on push to `main` **and** `master`. An accidental push there ships a 4-month regression to production.

One command: `git push origin --delete master`

This is decided. It's undone because nobody has run the command. It takes 10 seconds.

### P1 — Tag Density (225 Venues at ≤2 Tags): Day 22, Deferred to Oct 5

Content run Oct 5. Hold. Not touching individually.

### P1 — Gili Trawangan Duplicate Title: New Finding, Decide Today

Content surfaced two venues with identical titles:
- `beach_gilit` — "Gili Trawangan", via LOP (Lombok)
- `gili-trawangan` — "Gili Trawangan", via DPS (Bali)

Same island, different gateway airports, indistinguishable in search. Users browsing cards will see two "Gili Trawangan" entries and think it's a bug. It's not — but it looks like one.

**DECISION: Rename `beach_gilit` to "Gili Trawangan (Lombok ferry)" in the Oct 5 content session.** DPS via Bali is the dominant entry point; LOP is the direct/cheaper option worth preserving but needs differentiation. One title change. Bundle with Oct 5 venue work.

### P2 — GNB Missing from AIRPORT_COORDS: Pre-Paste Blocker, No Action Required

`GNB` (Grenoble) is in `AP_CONTINENT` but not `AIRPORT_COORDS`. Any venue added with `ap:"GNB"` would crash `flightHours()`. No current venue uses it — Content caught this before it landed. Future Serre Chevalier adds should use `GVA` or `CMF`.

**No launch action. Add GNB coords in `AIRPORT_COORDS` if we ever want direct Grenoble routing.** For now, closed.

### P2 — Sentry DSN

✅ CONFIRMED LIVE (`9416b032...` in `index.html:77`). Stop flagging.

### P3 — Peakly Pro Price ($9/mo vs $79/yr)

✅ REJECTED — dead UI, no users see it. Post-launch if Pro gets restored.

### P3 — Stale Branches (18)

✅ REJECTED — bundle with Oct 5 or GitHub UI. Not a dedicated session.

---

## Three Product Decisions — Sep 27

### Decision 1: Oct 4 VPS deadline stands. This is the last report before I say it failed.

7 days. The last daily report before Oct 4 is Oct 3. If the VPS is still undeployed on Oct 4, the Oct 18 launch proceeds with `~$X` estimates for the majority of beach venues. That's a materially weaker product. The decision is Jack's, the command is documented, the blocker is scheduling. No PM action left.

**Jack: SSH session by Oct 4. The command is in this report. 5 minutes.**

### Decision 2: Oct 18 is officially a beach launch. Retire the ski framing everywhere.

Confirmed v162 decision. The internal framing and Reddit drafts still partially lead with skiing. That needs to change actively:

- The `reports/reddit-launch-post.md` title and lead should not reference skiing on Oct 18
- Any internal references to "ski season launch" or "October = ski opening" are now wrong
- The Oct 18 pitch is: 270 beach venues + S-hemisphere spring window + live fares

**DECISION: Jack reviews `reports/reddit-launch-post.md` by Oct 11 and confirms beach-first framing is front and center. Any ski reference that appears before paragraph 4 should be moved or cut.**

### Decision 3: Add GNB to AIRPORT_COORDS is a post-launch add, not a launch blocker.

The gap exists but no venue uses it. Adding it now is pure scope creep — it enables future venue adds that aren't planned for launch. 

**DECISION: DEFER GNB AIRPORT_COORDS addition to post-launch (December ski venue expansion session). The pre-paste check in the Content workflow is sufficient protection.**

---

## This Week's Top 3

1. **VPS deploy by Oct 4** — Jack SSH, 5 min. Unblocks live fares for beach launch. 7 days left.
2. **Delete `origin/master`** — one command, 5 days since decided. This is the easiest P1 on the board and it's still open.
3. **Reddit post final framing** — Jack review by Oct 11. Beach-first, S-hemisphere spring hook, ski reference moved to footnote or cut.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| Peakly Pro price fix | Dead UI. No users see it. Post-launch only. |
| Add Serre Chevalier venue pre-launch | GNB not in AIRPORT_COORDS; GVA is 2h45 drive; add post-launch with proper gateway. |
| GNB AIRPORT_COORDS addition | Enables future venue adds that aren't scoped. Pre-paste check is sufficient. |
| r/skiing Oct 18 launch | Pre-season. 111/134 ski venues score weak. Defer to December. |

---

## One Product Risk Nobody Is Talking About

**The Oct 5 content run is load-bearing and has no documented scope.**

The tag density gap (225 venues at ≤2 tags) has been deferred to "Oct 5 content run" for 22 days. The Gili Trawangan rename is going to Oct 5. Future venue adds like Serre Chevalier are being bundled to Oct 5. Nobody has written down what the Oct 5 session actually is, who runs it, how long it takes, or what its success criteria are.

If Oct 5 gets bumped (and it's the same day as the VPS deadline), the tag gap ships to Reddit launch. A venue with tags `["beach", "warm"]` is not a meaningfully filtered search result. The Explore tag filtering is a feature that only works if venues have ≥3-4 meaningful tags. Half the beach catalog is borderline non-functional for tag-based discovery right now.

**The correct move: Jack commits to Oct 5 as a 2-3 hour working session, not a daily agent run. Define scope now: (1) tag density for ~50 highest-traffic beach venues, (2) Gili Trawangan rename, (3) branch cleanup. Everything else is deferred to post-launch.**

---

## Success Criteria Check

| Metric | Status |
|--------|--------|
| 90-day projection (5K–8K users) | Beach-first launch = path to 5K. Ski in December = path to 8K. |
| Live fares on beach launch | 🔴 At risk — VPS must deploy by Oct 4. 7 days. |
| Data quality | 93/100 — tag density deduction Day 22 holds. |
| Code freeze | Day 14 — clean. No regressions. |
| Reddit post ready | Draft committed. Oct 11 Jack review deadline. |
| S-hemisphere spring hook | ✅ In r/solotravel draft. |
| Beach launch framing | 🟡 In progress — internal framing still partially ski-forward. |
| Oct 5 scope defined | 🔴 Not documented. Risk item above. |

**For 8K not 5K:** VPS by Oct 4, beach launch Oct 18 with live fares + S-hemisphere hook, ski post December when N-hemisphere opens. That is the path.
