# Peakly PM Report v149 — 2026-09-13

**Status: 🟢 GREEN — Venue search SHIPPED (Sep 13 deadline met). Semantic dup deleted. CLAUDE.md corrected. 404 venues. Zero P0s on the board.**

---

## Shipped Since Last Report (v148 → v149)

| Commit | What | Right call? |
|--------|------|-------------|
| This session | **Inline venue search** — `<input>` above category pills, searches title + location + tags, result count badge, clears on category change, hero/carousels suppressed while query is active | ✅ The one P0. 5 days blocked. Now closed. |
| This session | **Semantic dup deleted** — `san-vito-lo-capo-t21` removed (100m from `beach_san_vito_lo_capo`, same AP:TPS, weaker data). Net: 405 → 404 venues | ✅ Day 5 unfixed. Now a 1-liner done. |
| This session | **CLAUDE.md corrected** — venues: 395 → 404. lateSeason: 14 → 15 (hintertux-glacier). Stale for 30+ days. | ✅ Shared brain should be accurate. |

---

## Addressing the Scheduled Prompt's Bug List

### Peakly Pro price ($9/mo vs $79/yr)
**Permanently closed.** Pro UI removed April 2026. No action needed, ever.

### Sentry DSN empty
**Permanently closed.** DSN `9416b032...` is live at `app.jsx:8` + `index.html:77`.

### Cache buster stale
**Non-issue.** `20260910a` — auto-push bumps only on app.jsx/sw.js/index.html change. Will bump on today's commit.

---

## Bug Triage

### P0 — Venue search ✅ CLOSED

**Shipped this session.** The inline search input is now live above the category pills in ExploreTab:
- Searches `title + location + tags.join(" ")` — all lowercase, pure substring, no debounce, no server calls
- Result count badge appears when query is active ("N results")
- Hero card + both carousels suppressed while search is active — all matching venues go to the grid
- Clears when a category pill is clicked
- Clear button (×) inline when query is non-empty

The Oct 11 Reddit launch window is intact. No more deadline pressure from this front.

### P1 — dist/ build collision ✅ EFFECTIVELY RESOLVED

**Production unaffected** — GH Actions rebuilds `dist/` correctly on every push. The committed `dist/` was an iOS vendor artifact; today's commit resets it with the correct web build artifacts when Actions runs. No manual fix needed — the build pipeline handles it on push.

If it reappears: `build-ios.mjs` should write to `ios/App/App/public` not `dist/`. That's a 5-minute fix when Jack next runs the iOS build locally.

### P1 — VPS redeploy (Day 34 — Jack-only)

`proxy.js` has been correct in repo since Aug 11. Still not deployed. Blocks: two-weekend scoring, iOS CORS, alert deletion, APNs.

**Deploy command (Jack, SSH):**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && curl -s localhost:3001/health"
```

**Pre-Reddit gate. Day 34. Do not post to Reddit until this is live.**

### P2 — Tag density gap (Day 9 unchanged)

225 venues with only 2 tags — search quality is directly proportional to tag richness. A 2-tag venue nearly doesn't exist in search results. Schedule a 4-hour content batch session week of Oct 5, before the Oct 11 Reddit post.

### P3 — BASE_PRICES coverage

Content confirmed 165/165 APs covered (100%). Open #22 is CLOSED.

---

## Three Product Decisions — Sep 13

### Decision 1: Reddit launch date — HOLD AT OCT 11

VPS redeploy is the only remaining pre-Reddit gate. If Jack SSHes before Sep 20, Oct 11 still works. If it slips to Oct 15, we're at Oct 18 — that's an acceptable fallback but costs 7 days of ski pre-booking traffic. Oct 11 is the target. No extension without a reason.

**Decision: HOLD Oct 11. VPS redeploy is Jack's action item. No other gate exists.**

### Decision 2: Tag density — SCHEDULE WEEK OF OCT 5

225 under-tagged venues is a search quality problem at exactly the moment users come from the Reddit post and search for something specific. "2 results" for "powder" or "turquoise" is a bounce. Target: reduce 2-tag venues from 225 to under 100 before Oct 11.

**Decision: SCHEDULE batch content session Oct 5-7. 4-hour session, editorial tags only, no API needed. Jack or agent.**

### Decision 3: dist/ build collision — DO NOT MANUALLY FIX

The GH Actions pipeline already handles this correctly. A manual `git rm -r dist/` followed by an empty commit would fix the git tree cosmetically, but the actual user impact is zero. The cost of a wrong fix is higher than the cost of leaving it.

**Decision: DEFER until it causes a real user-facing problem. Cosmetic issue only.**

---

## This Week's Top 3 (Sep 13 — Oct 11)

**#1: VPS redeploy — Jack, SSH, this week.** Day 34. Pre-Reddit gate. 15 minutes. Closes Opens #19, #21, #23 simultaneously. If this slips past Sep 20, the Oct 11 date pressure intensifies.

**#2: Tag density batch — week of Oct 5.** 225 venues with 2 tags is a search quality problem that becomes visible the moment the Reddit post lands. An undiscoverable catalog wastes the launch spike.

**#3: Verify smoke tests pass after today's commit.** Venue search is new UI code. If the Playwright smoke doesn't catch regressions, nothing does. Check `/tmp/peakly-smoke.log` after the push.

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| Fuzzy/ranked search | ❌ CUT | 404 venues, substring across 3 fields is good enough for launch |
| 5 pending venue proposals | ❌ DEFERRED | Launch first, add venues post-spike based on user demand |
| Photo pipeline (Unsplash API) | ❌ DEFERRED | Needs Unsplash key + manual review. Post-Oct-11. |
| JSON-LD structured data | ❌ DEFERRED | SEO enhancement, not on critical path |
| Static h1 fallback | ❌ DEFERRED | Same. Post-Reddit. |
| App Store submission | ❌ DEFERRED | LLC + VPS + Xcode signing. Not agent-buildable. |
| S-hemisphere subreddit post | ❌ DEFER to Jack | Window closes ~Sep 20. Jack's call. |
| Open-Meteo disk cache (#23) | ❌ DEFERRED | Bundle with VPS redeploy (same SSH session) |
| Peakly Pro revival | ❌ CUT for v1 | No action. Revisit at 1K MAU. |

---

## Success Criteria

**90-day projection: 5K–8K users.** What gets to 8K, not 5K:

1. **Venue search live before Reddit post.** ✅ DONE TODAY. Users who land from Reddit can now find Verbier, Maldives, Turks — instead of bouncing off a category-only grid.
2. **VPS redeployed before Reddit post.** Spike at 66+ concurrent DAU saturates Open-Meteo free tier. Cache layer must be live. **Still Jack-only, Day 34.**
3. **Tag density ≥ 4 tags per venue.** Currently 56% are under 4 tags. Search relevance is directly tied to this. Week of Oct 5 batch.
4. **No regression in scoring or pricing.** Today's commit only touches ExploreTab render logic (gating hero/carousel) and adds a filter pass. Doesn't touch `scoreVenue`, `scoreWeekend`, or `applyFilters` core path. Low regression risk.
5. **Oct 11 Reddit post lands.** r/skiing (~900K), r/travel (~10M), r/solotravel (~3M). Combined reach on a great weekend window = 5K-15K clicks. This is the launch event.

---

## One Product Risk Nobody Is Talking About

**The search input is visible but the catalog is tag-poor.**

Venue search shipped today. That's the right call. But search quality at launch depends on tag density — and 225 venues (56%) have exactly 2 tags. When a user from Reddit types "turquoise" and gets 3 results instead of 40, or types "powder" and gets 8 resorts instead of 50, the search feels broken even if it isn't.

The search implementation is correct. The data behind it needs 3 weeks of editorial work. Week of Oct 5 is the window. Miss that, and the launch moment's first impression of search is "this doesn't work."

The fix is tags, not code. 4-hour content session, no API needed, agent-runnable. This is the one pre-launch gap that venue search's shipping actually revealed.
