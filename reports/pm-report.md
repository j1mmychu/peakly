# Peakly PM Report v193 — 2026-10-27 (LAUNCH DAY +9)

**Status: 🔴 RED — VPS Day 80. Whistler window = 14 days. Jack SSH deadline = TODAY/TOMORROW. Sprint queue Day 4. Nothing shipped since Aug 11.**

> **Stale prompt notice — Day 21 (unchanged):** The stored cron prompt still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404–406 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface.

---

## Shipped Since Last Report (v192 → v193)

| Commit | What | Right call? |
|--------|------|-------------|
| `3d8b6fc` | DevOps Oct 27 — RED, VPS Day 79, 14 days to Whistler, PRECACHE mismatch day 3, venue count drift (406 vs 404) | ✅ reporting |
| `a729e3f` | Content Oct 27 — 88/100, tag-depth gap persists (225 venues), venue suggestion queue now 10 deep | ✅ reporting |

**Four consecutive days post-code-freeze. Zero app.jsx / sw.js / index.html commits. Sprint queue untouched day 4.**

---

## Bug Triage

### P0-A — VPS Redeploy: Day 80. Jack SSH Required TODAY. 🚨

v192 said "Oct 30 at the latest, Oct 28 preferably." It's Oct 27. The "preferably" date is tomorrow.

**The math is simple:** Whistler opens Nov 10. Reddit post needs a Whistler screenshot. Screenshot needs `forecast_days:14` live. Today's 14-day window reaches Nov 10 exactly. Tomorrow still reaches Nov 9. Oct 29 reaches Nov 8 — the resort is technically open but not in the forecast window. **The screenshot window is open right now and closes in 48 hours.**

Four bugs blocked on this single SSH action:
1. `forecast_days: 7` → Two-weekend scoring broken, Whistler/Tignes invisible on front page
2. `capacitor://localhost` absent from CORS → Every iOS native API call blocked
3. `DELETE` absent from allowed methods → Alert deletion silently fails
4. `_wxCache` in-memory only → Cold cache on restart fans out ~406 Open-Meteo requests

**Jack's 5-minute fix:**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 'pm2 restart peakly-proxy && pm2 save'
curl -s https://peakly-api.duckdns.org/health
# Look for: forecast_days_weather:14
```

### P0-B — Sprint Queue: Day 4 Overdue, Requires Local Session 🚨

The sprint queue has been "ships next session" for 4 consecutive PM reports. Nothing ships without a Jack-initiated local Claude Code session. The auto-push hook fires only from local Claude Code.

**Items — all <10 min, no design decisions:**
1. Cache stamp bump (`20260914a` → `20261027a`) + PRECACHE → `[]`
2. `origin/master` delete + `deploy.yml` master trigger removal
3. Gili Trawangan dedup (remove `gili-trawangan/DPS`, keep `beach_gilit/LOP`)
4. JSON-LD structured data (~30 min) — SEO 3-week lag starts on ship day

**JSON-LD urgency update:** If JSON-LD ships today, Google may index ski pages before the Reddit post. If it ships Nov 1, Google indexes after. The SEO amplification of the Reddit launch is determined by when JSON-LD lands, not when the post goes up. The window is closing daily.

### P1-A — PRECACHE→CDN Mismatch (Day 3)

`sw.js` precaches `unpkg@7.29.7/babel.min.js`. Production strips Babel entirely. This wastes ~800 KB of SW cache on a file production never serves. Fix: `PRECACHE = []`. Blocked on sprint item 1.

### P1-B — Venue Count Discrepancy: 404 vs 406

DevOps (eval) reports 406. Content (eval) reports 404. Two venues added by Content 2026-10-10 may not have triggered a CLAUDE.md update. Before the next venue batch ships, get a definitive count. One source is wrong. Run `node -e "const src = require('fs').readFileSync('app.jsx','utf8'); const m = [...src.matchAll(/\bid:\s*[\"']([\w-]+)[\"']/g)]; console.log(m.length)"` from the repo root and reconcile with CLAUDE.md.

### P2 — Venue Suggestion Queue: 10 Deep, No Merge Path

Content is generating 5 new venues/day into a queue with no execution path to ship. At this rate:
- Day 5 (tomorrow): 15 queued
- Day 10: 40 queued
- Day 15 (Whistler opening): 65 queued

The LAS duplicate (Lee Canyon queued twice: Oct 25 + Oct 26) will fail the dup-id guard and block any attempt to batch-ship the entire queue. This is a P2 now; it becomes a P1 the moment Jack tries to ship the queue.

---

## Three Product Decisions — Oct 27

### Decision 1: VPS SSH is TODAY, not Oct 30.

v192 said "Oct 30 at the latest, Oct 28 preferably." I'm moving the preferred date forward. It's Oct 27. The Whistler screenshot window opened yesterday. Waiting until Oct 30 is gambling on Open-Meteo's 14-day window — that window reaches Nov 10 only if the VPS is deployed by Oct 27.

**DECISION: Jack, SSH today or tomorrow (Oct 27–28). Every day you wait, the forecast window for the Whistler opening-day screenshot shrinks. This is not a planning item anymore — it's a NOW item.**

If this slips past Oct 29, the Reddit post either launches without a Whistler screenshot (weakest possible ski launch post) or waits until Whistler's full December opening. Either outcome costs weeks. The SSH takes 5 minutes.

### Decision 2: Venue suggestion queue — CAP at 10, HALT new suggestions.

Content has been suggesting 5 new venues/day for 2+ days with zero merge rate. The queue is growing faster than it can ship. Continuing to add to it degrades the signal — good suggestions get buried under noise.

**DECISION: Content agent should HALT new venue suggestions until the queue drops below 3. No new venue suggestions in the next 5 Content reports. If a venue is obviously exceptional (new ski resort opening, major travel milestone), flag it as a one-off exception to PM — don't add it to the queue silently.**

The queue currently has a known LAS duplicate blocker. Resolve that first. Then ship the remaining 9 (or 8) in a single batch, not piecemeal.

### Decision 3: Mark sprint items as BLOCKED-HUMAN-ACTION, not DEFERRED.

Four consecutive reports have listed sprint items as "ships next session." They haven't shipped. Calling them "deferred" implies low priority. They are HIGH priority, blocked on a human action (Jack opening a local session).

**DECISION: Sprint items 1–4 are reclassified as BLOCKED-HUMAN-ACTION. They are not lower priority than the VPS SSH — they are equally urgent and equally blocked on Jack. The daily reports should stop listing them as a "sprint queue" (implies future planning) and start listing them as an active blocker requiring a specific human action today.**

---

## Priority List — This Week Only

| # | Item | Status | Owner |
|---|------|--------|-------|
| 1 | VPS SSH (proxy.js deploy) | 🚨 BLOCKED-HUMAN-ACTION | Jack today/tomorrow |
| 2 | Sprint items 1–4 (cache stamp, PRECACHE, master delete, JSON-LD) | 🚨 BLOCKED-HUMAN-ACTION | Jack local session |
| 3 | LAS dup resolution in venue queue | ⚠️ BLOCKED-HUMAN-ACTION | Jack + Content |

Everything else: **DEFER until VPS is live and sprint 1–4 are shipped.**

---

## Features REJECTED This Week

- **New venue suggestions (10+ queue)** — REJECTED until queue ships. 5/day pace with 0 merge rate creates noise, not progress.
- **Tag enrichment batch** — REJECTED until sprint items ship. No point enriching tags if the cache stamp stays stale.
- **Any new UI features** — REJECTED. The product is code-frozen post-Aug 11. Nothing should ship until sprint 1–4 land and the VPS is verified.
- **App Store submission work** — REJECTED. Pre-traffic. VPS must be live and verified before any App Store work resumes.

---

## Success Metrics

**For the 90-day projection of 5K–8K users:**

What has to be true for 8K (not 5K):
1. Reddit post lands Nov 10–14 during Whistler opening week with a Whistler screenshot showing a real weekend score (requires VPS by Oct 29)
2. JSON-LD indexed by Google before the post goes up (requires sprint item 4 to ship by ~Oct 28 — Google needs 2–3 weeks)
3. No cold-cache crash on the traffic spike (requires VPS disk cache live before the post)
4. Venue catalog at 414+ by launch day (current 404–406 + queued 9 = 413–415)

What 5K looks like: VPS late, no JSON-LD index, post goes up with generic screenshot, no skiing context. Still gets traffic but organic SEO doesn't compound.

**The 8K scenario requires every item above to ship in the next 2 days.**

---

## One Product Risk Nobody Is Talking About

**The auto-push pipeline has a 77-day silence gap, and nobody has noticed.**

The last app.jsx commit was Aug 11. The auto-push hook fires from Jack's local Claude Code sessions only. If Jack hasn't been running local sessions since Aug 11, the hook hasn't fired in 77 days. The daily cloud agents report correctly — they don't modify code. But the reports are accumulating sprint items, venue suggestions, and SEO gaps with zero execution path.

The risk: this isn't a temporary pause before a burst of activity. It's a pattern. If the execution model requires Jack to initiate local sessions, and local sessions aren't happening, the roadmap is effectively frozen regardless of what the daily reports say. The reports are doing their job. The implementation loop is broken.

**Fix this before the Reddit post.** Not because the backlog is large — it isn't, sprint 1–4 is ~45 minutes total. But because if the execution model is broken before the traffic spike, it'll be more broken under the pressure of responding to user feedback after it.
