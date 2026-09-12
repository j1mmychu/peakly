# Peakly PM Report v148 — 2026-09-12

**Status: 🔴 RED — Venue search unbuilt. 2 days to Sep 14 hard deadline. Third consecutive day without an app.jsx commit. lateSeason false alarm CLOSED (all 15 correct). Critical path unchanged.**

---

## Shipped Since Last Report (v147 → v148)

| Commit | What | Right call? |
|--------|------|-------------|
| *(none)* | No code commits — 3 report commits only | — |

**Zero code shipped for the third day running.** Three report commits (DevOps, Content, this PM). The venue search P0 is exactly where it was Monday morning. The Oct 11 Reddit launch window closes if this slips past Sep 14.

---

## Addressing the Scheduled Prompt's Bug List

### Peakly Pro price ($9/mo vs $79/yr)
**Closed — permanently stale.** Pro UI removed April 2026. No action needed, ever.

### Sentry DSN empty
**Closed — false alarm.** DSN `9416b032a46681d74645b056fcb08eb7` wired at `app.jsx:8` + `index.html:77`. Live.

### Cache buster stale
**Non-issue.** Stamp `20260910a` is 2 days old. Auto-push bumps only when `app.jsx`/`sw.js`/`index.html` change. No changes = no bump. Expected.

---

## Bug Triage

### P0 — Venue search (2 days to Sep 14 deadline)

**Day 3 of zero progress. 2 days remain.**

Spec is locked and unchanged:
```
<input> above category pills — "Search venues…"
Filter: toLowerCase() on venue.title + venue.location + venue.tags.join(' ')
Result count shown when active ("12 results")
Clear on category pill change
No server calls, no debounce — pure client-side
```

`applyFilters` at `~line 8732` already has the filter logic. This is adding a `useState`, a `<input onChange>`, and threading the value in. Estimated build: **2 hours**.

**Sep 14 is not a soft deadline.** Miss it → Reddit launch shifts to Oct 18, entering ski pre-booking traffic peak late.

### P1 — lateSeason "regression" — CLOSED, FALSE ALARM ✅

PM v147 called this a P1. DevOps and Content both independently confirmed today: **all 15 venues correctly flagged.** The PM script was reading stale data. Count is 15 (whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch). This P1 is closed, do not re-flag.

### P1 — dist/ build collision (Day 3)

`dist/` committed to git is the iOS artifact from `build-ios.mjs`. Live site unaffected (GH Actions rebuilds correctly). But:
- `dist/index.html` references `./vendor/react.production.min.js` which doesn't exist
- No `app.min.js`, no Plausible analytics in committed dist/

**Fix:** Change `build-ios.mjs` line 5 from `const DIST = path.join(ROOT, "dist")` to `const DIST = path.join(ROOT, "ios", "App", "App", "public")`. Then `node scripts/build-web.mjs` + commit. 10 minutes.

**Bundle with venue search commit.**

### P1 — Semantic duplicate (Day 4)

`san-vito-lo-capo-t21` and `beach_san_vito_lo_capo` — same beach (38.175/12.733), same airport (TPS), 11m apart.

Content now recommends keeping `san-vito-lo-capo-t21` (4 tags) and deleting `beach_san_vito_lo_capo` (2 tags). This is a 1-line deletion. Day 4 with no excuse.

**Bundle with venue search commit. Net venues after fix: 404.**

### P2 — CLAUDE.md VENUES count stale

CLAUDE.md says 395 venues. Eval count is 405. Stale for 30+ days. Update on next app.jsx commit — add one line. Not blocking anything but the shared brain is wrong and future agents will keep reporting it.

### P3 — VPS redeploy (Day 32 — Jack-only)

`server/proxy.js` has been correct in repo since Aug 11. The live VPS is still running the pre-Aug-11 build. Blocks: two-weekend scoring, iOS CORS, alert deletion, APNs. **This is Jack's SSH session to execute.** Not agent-buildable.

**Deploy command:**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health
```

Still a pre-Reddit gate. Still on Jack.

---

## Three Product Decisions — Sep 12

### Decision 1: Venue search — SHIP BEFORE EOD SEP 13

2 days left. 3 days of no movement. The only acceptable outcome now is venue search live on main before the Sep 14 deadline. This is a 2-hour task. It is the only P0 on the board. Everything else is noise until it ships.

**Decision: SHIP. Deadline is Sep 13 EOD, not Sep 14 (buffer for any smoke test failures).**

### Decision 2: lateSeason P1 — CLOSED, PERMANENTLY

The 5 "missing" venues were never missing. This will not be reported again.

**Decision: CLOSE. Zero action required. Any future report flagging this is wrong.**

### Decision 3: Gili Trawangan soft dup — KEEP BOTH

Content flagged `beach_gilit` (LOP) and `gili-trawangan` (DPS) as a soft dup — same destination, different airports. DPS (Bali/Denpasar) has 10× more flight options. LOP is technically closer. **The booking paths are genuinely different.** Keeping both serves users flying from different origin airports.

**Decision: KEEP BOTH. No deletion. Not a true dup.**

---

## This Week's Top 3 (Sep 12–14)

**#1: Venue search — ship in the next 24 hours.** 2-hour build. Spec pinned above. Bundle with: semantic dup deletion (`beach_san_vito_lo_capo`), dist/ build path fix, CLAUDE.md venue count update (395 → 405).

**#2: VPS redeploy — Jack, SSH.** Day 32. Pre-Reddit gate. The agent can't do this. One 15-minute SSH session closes Opens #19, #21, #23 simultaneously. The Oct 11 Reddit post must not happen while two-weekend scoring is silently off.

**#3: Tag density backfill (week of Oct 5).** 225 venues with only 2 tags. Search quality problem — a 2-tag venue is nearly unsearchable. Schedule a 4-hour batch content session the week before launch.

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| Fuzzy / ranked search | ❌ CUT | 405 venues, substring match is fine at this scale |
| 5 pending venue proposals | ❌ DEFERRED | Unsearchable catalog first. Search ships first. |
| Photo pipeline (Unsplash API) | ❌ DEFERRED | Needs Unsplash key + manual review. Post-Reddit. |
| JSON-LD structured data | ❌ DEFERRED | SEO enhancement, not on Oct 11 critical path |
| Static h1 fallback | ❌ DEFERRED | Same. Post-Reddit. |
| App Store submission | ❌ DEFERRED | LLC + VPS + Xcode signing — none agent-buildable this sprint |
| iOS widget Xcode wiring | ❌ DEFERRED | Code-complete, not blocking Reddit |
| S-hem ski subreddit post | ❌ DEFERRED to Jack | Not a code task. Window closes ~Sep 20. Jack's call. |
| Open-Meteo disk cache (#23) | ❌ DEFERRED | Add to VPS redeploy bundle when Jack SSHes for #19 |

---

## Success Criteria

**90-day projection: 5K–8K users.** What separates 8K from 5K:

1. **Venue search ships by Sep 14.** Oct 11 Reddit launch requires it. This is the single most leveraged task on the board.
2. **VPS redeployed before Reddit post.** Spike at 66+ concurrent DAU saturates Open-Meteo free tier. Cache layer must be live. Pre-Reddit gate.
3. **Marquee venues score correctly.** 15 lateSeason venues confirmed correct. ✅ Non-issue.
4. **Photo quality at marquee venues.** 31 real photos live. Target 40 before Oct 11. One async session.
5. **Tag density.** 225 venues with 2 tags — search quality degrades at launch. Week of Oct 5 batch.

---

## One Product Risk Nobody Is Talking About

**Sep 14 is in 2 days and there's no code session in progress.**

Three report-only days in a row is a pattern, not a one-off. The daily agent pipeline is generating 3 reports/day. Each report correctly calls out the same P0 (venue search). None of those reports fixes it.

Reports are not shipping. Code is.

The product is one 2-hour code session away from clearing the last build-it gate before the Oct 11 launch. If that session doesn't happen by Sep 13 EOD, the Reddit window shifts to Oct 18. October 18 is after peak ski pre-booking interest starts. That's not a project management risk — that's a revenue and growth risk at the moment when the product is most search-relevant.

**The report is not the work. The code is the work.**
