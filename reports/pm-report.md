# Peakly PM Report v192 — 2026-10-26 (LAUNCH DAY +8)

**Status: 🔴 RED — VPS Day 79. Whistler window = 15 days. Effective VPS deadline = Oct 30 (revised down from Nov 2). Sprint queue 3 days overdue. Nothing shipped since Aug 11.**

> **Stale prompt notice — Day 20 (unchanged):** The stored cron prompt still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100% coverage.** Jack: 2-minute fix in the Claude.ai interface — this prompt fires every day and opens with wrong numbers.

---

## Shipped Since Last Report (v191 → v192)

| Commit | What | Right call? |
|--------|------|-------------|
| `507e7fe` | DevOps Oct 26 — RED, VPS Day 78, 15 days to Whistler, PRECACHE mismatch confirmed Day 2 | ✅ reporting |
| `6d98da3` | Content Oct 26 — 88/100 (−1 from yesterday), tag-depth gap, 5 new venues queued (TFS/CHQ/KOA/LAS/VPS), seasonal analysis | ✅ reporting |

**Three full days post-code-freeze. Zero app.jsx / sw.js / index.html / deploy.yml commits. Sprint queue still untouched.**

The content score slipped from 89 → 88 today — not because anything regressed in the codebase, but because the accumulating stale-prompt deduction is being counted separately. The real quality number is unchanged. Everything else is exactly where v191 left it.

---

## Bug Triage

### P0-A — VPS Redeploy: Day 79. Effective Deadline = Oct 30. 🚨

Revising the deadline down from Nov 2 to **Oct 30**.

The logic: Whistler Blackcomb opens ~Nov 10. The Reddit post needs a screenshot of Whistler on the front page with a real weekend score. That screenshot requires `forecast_days:14` live on the VPS. Open-Meteo's 14-day window on Oct 30 reaches Nov 13 — just past opening day. On Oct 29, it reaches Nov 12. On Oct 28, Nov 11. The first day the forecast window *reliably* reaches Whistler's opening is Oct 27.

We're past that. The screenshot window opens now.

Add 2–3 days for Reddit post prep (copy, subreddit selection, timing) after the VPS confirms Whistler is showing. That puts the hard commit date at **Oct 30 at the latest, Oct 28 preferably**.

The report has been saying Nov 2 for a week. It should have been saying Oct 28. That was wrong.

**Four production bugs currently broken:**
1. `forecast_days: 7` → Whistler/Tignes/Val d'Isère invisible on front page
2. `capacitor://localhost` absent from CORS → Every iOS native API call blocked
3. `DELETE` absent from allowed methods → Alert deletion silently fails
4. `_wxCache` in-memory only → Cold flush on restart wipes cache

**Fix — Jack's SSH, ~5 minutes:**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 'pm2 restart peakly-proxy && pm2 save'
curl -s https://peakly-api.duckdns.org/health
# Expect: forecast_days_weather:14
```

### P0-B — Sprint Queue: 3 Days Overdue, Requires Local Session 🚨

The sprint queue has been "ships next session" for 3 consecutive PM reports. It hasn't shipped because scheduled cloud agents report — they don't ship code. The auto-push hook fires from a local Claude Code session only. If Jack isn't running local sessions, nothing ships.

This is the single-threaded bottleneck nobody has named explicitly: the reports correctly identify what needs to ship, but the execution path requires a human-initiated local session, and that session hasn't happened.

**Items 1–4 are <10 minutes each and have no design decisions:**
1. Cache stamp bump (`20260914a` → `20261026a`) + PRECACHE fix (unpkg → cdnjs, version 7.24.7)
2. `origin/master` delete: `git push origin --delete master` + remove `master` trigger from `deploy.yml`
3. Gili Trawangan dedup: remove `gili-trawangan/DPS`, keep `beach_gilit/LOP`
4. JSON-LD structured data: ~30-min implementation — SEO 3-week lag starts when this ships

**JSON-LD urgency:** Whistler is 15 days away. If JSON-LD ships today, Google may index the ski pages before the Reddit post. If it ships Nov 1, Google indexes them after. The SEO value of the Reddit post is determined by when JSON-LD lands, not when the post goes up.

### P1-A — PRECACHE→CDN Mismatch

`sw.js` precaches `unpkg@7.29.7/babel.min.js`. `index.html` loads `cdnjs@7.24.7/babel.min.js`. These are different files, different CDNs, different versions. The service worker is caching a file that's never served — wasted bandwidth, cache miss on every offline load. Fixed with sprint item 1.

### P1-B — LAS Dup in Venue Queue

Content Oct 25 queued `LAS` as a ski venue (Lee Canyon). Content Oct 26 also queued `LAS`. Before tag batch 1 ships with these venues, verify whether these are the same venue or different (Lee Canyon ski vs Vegas beach stretch). If the same venue is in the queue twice, it will fail the dup-id guard and block the whole batch.

### P2 — Tag Quality: 55.7% Thin-Tag Rate (Day 3 Unchanged)

225 of 404 venues have exactly 2 tags. `scoreVibeMatch` precision is degraded. Content queue is now 9 venues deep (5 Oct 25 + 5 Oct 26 — minus potential LAS dup). All 9 are blocked until tag batch 1 ships.

---

## Three Product Decisions — Oct 26

### Decision 1: VPS deadline is Oct 30. Jack needs to SSH this week.

Not Nov 2. Not "before the Reddit post." Oct 30. The Whistler screenshot window is open right now. Every day the VPS runs undeployed is a day we can't verify Whistler is showing, can't take the screenshot, can't prep the post.

**DECISION: Jack SSH session required before Oct 30. If it slips to Oct 31, the Reddit post timing has to shift right — either we post without a Whistler screenshot (worse post) or we push to Whistler's Dec full-season opening (6-week delay). Neither is acceptable.**

The VPS fix is already written. `server/proxy.js` has been committed since Aug 11. This is a copy-paste and a `pm2 restart`.

### Decision 2: Sprint items 1–4 require a Jack-initiated local session this week.

Three consecutive reports have called for these items to ship "next session." They haven't shipped because the daily cloud reporting agents can't push code changes unilaterally — the auto-push hook only fires from Jack's local Claude Code sessions.

**DECISION: Jack needs to open a local Claude Code session and explicitly instruct it to execute sprint items 1–4. The decision is already made (v191, Decision 1). The execution just requires a live session. This is not a "maybe this week" — it's a blocker for the JSON-LD SEO window.**

### Decision 3: Content venue queue — verify LAS dup before tag batch 1.

Content queued `LAS` on both Oct 25 (as ski: Lee Canyon) and Oct 26. Before tag batch 1 attempts to ship 9 venues at once, manually verify whether these are the same venue ID. A dup-id collision will fail the auto-push guard and block the entire batch.

**DECISION: The venue queue is 9 deep (or 8 if LAS is a dup). All 9 are DEFERRED until (a) tag batch 1 ships, and (b) the LAS dup is clarified. Do not merge the queue in two pieces — ship tag batch + venues together in one commit so the guard validates everything at once.**

---

## This Week's Top 3 Priorities

1. **VPS redeploy (Jack SSH, Oct 28–30)** — 4 commands, 5 minutes, unblocks two-weekend scoring + iOS native + alert deletion + cache stability. Oct 30 is the hard deadline for the Whistler screenshot window.
2. **Sprint items 1–4 (local Jack session)** — cache stamp + PRECACHE fix + `origin/master` delete + Gili dedup. Should have shipped Oct 23. JSON-LD SEO lag starts when item 4 ships. Every day it slips is a lost indexing day before the Reddit post.
3. **JSON-LD structured data (sprint item 4)** — 30-min implementation. SEO 3-week lag on Whistler-related pages starts today if it ships today.

---

## Features REJECTED This Week

- **`claude/*` branch merges (15 stale branches)** — CLOSED. None represent deliberate product decisions. These are abandoned exploratory attempts. They can be deleted in bulk; none should be merged.
- **Gili Trawangan title differentiation** — DEFERRED. "Lombok gateway vs Bali gateway" is scope creep on a dedup task. Remove the DPS duplicate, keep LOP. Simple.
- **Surf Breaks tag cleanup on 33 beach venues** — CUT. The tag describes a beach feature, not a retired category. Search for "surf" correctly surfaces beach venues. Not a bug. No action needed, ever.
- **S. Hemisphere ski venue additions** — DEFERRED until after Whistler launch cycle. Oct is the end of the S. Hemisphere ski season. Adding ski venues that score poorly right now creates catalog noise on the front page. Ship them in Feb.

---

## Success Criteria & 90-Day Projection

**5K users (base case):** Whistler post lands after Nov 10, JSON-LD indexes eventually, organic traffic builds slowly.

**8K users (upside case):** Requires:
- VPS ships by Oct 30 → Whistler screenshot exists → Reddit post goes up Nov 10–12 with real data
- JSON-LD ships this week → Google indexes ski pages before Reddit post → SEO traffic at launch
- Tag batch 1 ships → `scoreVibeMatch` precision improves → retention edge for returning users

The gap between 5K and 8K is ~7 days of delay on two tasks Jack can complete in an afternoon.

---

## One Product Risk Nobody Is Talking About

**The daily reporting agents have become a substitute for shipping.**

Every day for 3 days since the code freeze lifted, there's been a well-written PM report saying "sprint items 1–4 should have shipped yesterday." And every day, nothing ships, and the next report says the same thing with one more day added to the overdue count.

The reporting loop is working correctly — finding the right things, making the right calls. But it has created a false sense of progress. The reports look like action. They're not. The sprint queue hasn't moved because the execution path requires a local session that hasn't happened.

The risk: by the time Jack opens a local session, the Whistler window may have closed. The JSON-LD indexing lag that started three days ago when the freeze lifted is three days shorter than it could have been. The `origin/master` footgun has been live for 19 days.

The fix is not a better report. It's a local session.

---

## Open Items Tracker

| # | Item | Status | Deadline |
|---|------|--------|----------|
| 19 | VPS redeploy | 🔴 Day 79, Jack SSH | **Oct 30 (revised)** |
| 20 | Photos (~346 venues generic stock) | P2 — post-Whistler | — |
| 21 | APNS: HTTP/2 + P1363 JWT fix | P2 — parked | — |
| 22 | BASE_PRICES coverage | ✅ **CLOSED Oct 25** — 100% | — |
| 23 | Weather cache disk persistence | P1 — bundle with #19 | Oct 30 |
| Sprint-1 | Cache stamp + PRECACHE fix | 🔴 **3 days overdue** | Jack local session |
| Sprint-2 | `origin/master` footgun delete | 🔴 **3 days overdue** | Jack local session |
| Sprint-3 | Gili Trawangan dedup | 🔴 **3 days overdue** | Jack local session |
| Sprint-4 | JSON-LD structured data | 🔴 **Not started, every day costs SEO** | Jack local session |
| Sprint-5 | Tag batch 1 (50 venues) | Not started | After sprint 1–4 |
| Sprint-6 | 9 venues queued (GIG×2/TRN/SOF/INV/TFS/CHQ/KOA/LAS/VPS) | Blocked by Sprint-5 + LAS dup check | After sprint-5 |
