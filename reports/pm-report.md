# Peakly PM Report v153 — 2026-09-17

**Status: 🟡 YELLOW — VPS proxy.js Day 39 undeployed. Sep 20 hard deadline is 3 days away. Code freeze holding. Oct 11 Reddit launch intact.**

---

## Shipped Since Last Report (v152 → v153)

| Commit | What | Right call? |
|--------|------|-------------|
| `c2c8dd3` | Content report Sep 17 | ✅ Routine. |
| `199c603` | DevOps report Sep 17 | ✅ Routine. |
| `b124eb9` | PM report v152 + CLAUDE.md venue count fix | ✅ Closed the Day-5 P3. |

**Zero code commits since `bb3ebc8` (venue search, Sep 13).** Correct. Code freeze holds through Oct 11.

---

## Prompt Context Note

The scheduled prompt references "182 venues," "Sentry DSN empty," "cache buster stale," and "Peakly Pro $9/mo vs $79/yr." All four are stale artifacts in the prompt — state is:
- **Venues**: 404 (134 skiing / 270 beach). Authoritative.
- **Sentry DSN**: Wired in both `index.html:77` and `app.jsx:8`. Not empty.
- **Cache stamp**: `20260914a` — correct, no code has shipped since Sep 14.
- **Peakly Pro**: UI was formally CUT for v1. No active pricing UI in the codebase. Not a bug.
- **CLAUDE.md venue count (395)**: Fixed in v152 commit. Now reads `VENUES (404)`. Content report has a stale read on this — ignore the Day-5 flag, it's closed.

---

## Bug Triage

### P0s — None.

### P1 — VPS Redeploy (Day 39 — Jack-only, SEP 20 HARD DEADLINE IN 3 DAYS)

Same P1. Five consecutive PM reports. Same ask. Three days left.

What's broken while undeployed (unchanged from v152):
1. `forecast_days=7` → two-weekend scoring silently disabled
2. `capacitor://localhost` missing from CORS → iOS native blocked
3. `DELETE` not in `Access-Control-Allow-Methods` → alert deletion silently broken
4. Rate limiter reads forgeable `X-Forwarded-For[0]`
5. In-memory weather cache wiped on every `pm2 restart` (Open #23)

**One SSH session. Five minutes.**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && sleep 3 && curl -s localhost:3001/health"
```

Verify: `uptime` resets to seconds; `forecast_days` reads 14; `capacitor://localhost` in CORS list.

### P1 — Tag Density (Day 12 Unchanged)

225/404 venues (55.7%) have ≤2 tags. Beach is the acute failure: 190/270 beach venues at ≤2 tags. This is the most visible quality gap in the product — visible on every Explore scroll to every first-time user.

Oct 5 content run is the fix. Oct 5 is 18 days out. Defer and hold.

### P2 — Pending Venue Proposals (14 valid, unstaged)

Up from 9 (v152) to 14 unique valid proposals after today's content report surfaced Sep 16 additions (Alpe d'Huez/CMF, Obergurgl/INN, Livigno/INN valid; 2 dups removed).

| Batch | Count | Status |
|-------|-------|--------|
| Sep 14 | 5 (Grindelwald, Sestriere, Koh Lanta, Amed Bali, Noosa) | Valid, unadded |
| Sep 15 | 5 (Hakuba, Mayrhofen, Naxos Agios Prokopios, Lamu, Ilha Grande) | Valid, unadded |
| Sep 16 | 3 unique (Alpe d'Huez, Obergurgl, Livigno — 2 were dups) | Valid, unadded |
| Sep 13 | 1 (Mancora/LIM) | ⚠️ INVALID — LIM not in AIRPORT_COORDS |

Still deferring to Oct 5 batch. Do not add piecemeal.

### P3 — dist/ Build Collision (Day 9 — Non-blocking)

GH Actions rebuilds `dist/` correctly on every push. Committed artifact is cosmetically wrong. Production unaffected. No action.

---

## Three Product Decisions — Sep 17

### Decision 1: VPS Sep 20 deadline — FINAL. WHAT HAPPENS IF IT SLIPS.

This is no longer a decision — it's a consequence statement. Per v151 + v152, Sep 20 is the hard gate. What changes if it slips:

- **Reddit launch moves Oct 11 → Oct 18.** One week of ski season opening weekend lost.
- **"LIVE" flight badges stay absent on launch day.** Reddit's r/solotravel community will screenshot the `~$X` estimate-only UI and correctly identify it as a feature that doesn't work.
- **The deal score is the product's only moat.** If it doesn't work on launch day, the first impression is "just another venue list."

No new decision here. The deadline stands. The consequences are now documented. v154 will be the last report before Sep 20 EOD — it either announces "VPS deployed, Reddit launch Oct 11 confirmed" or "VPS missed, Reddit slides to Oct 18."

### Decision 2: Oct 5 content run — FORMALLY SCHEDULED (not just "planned")

The Oct 5 tag-enrichment + venue-addition run has been called out since v151 as "planned." Planned is not scheduled. Scheduled means it's on the calendar and someone owns it.

**DECISION: Oct 5 content agent run is the single most important content action before launch. It covers two items at once — tag enrichment (225 under-tagged venues) and 14 staged venue additions. If this doesn't fire on Oct 5, the Explore grid goes to Reddit with ~70% of beach venues at ≤2 tags.**

The content agent prompt is `tasks/agents/content-data.md`. It runs remotely as `peakly-content-data`. On Oct 5, run it with explicit instructions to:
1. Add the 14 staged proposals (excluding Mancora/LIM — invalid airport)
2. Bulk-enrich tags on all beach venues at ≤2 tags to minimum 4 tags

This is the only content run between now and Reddit launch.

### Decision 3: Oct 11 Reddit launch — CONFIRMED UNLESS VPS SLIPS

With zero code commits since Sep 13, no regressions reported, VPS as the only open gate, and the Oct 5 content run as the only planned change: the Oct 11 launch target is intact.

**DECISION: Oct 11 is confirmed for r/skiing and r/solotravel posts.** Preconditions:
1. VPS deployed by Sep 20 ✓ (Jack's action)
2. Oct 5 content run ships ✓ (agent action)
3. No regressions introduced between now and Oct 11 ✓ (code freeze holds)

If VPS slips: Oct 18. If VPS + content run both slip: Oct 25. There is no launch without working flight pricing.

---

## This Week's Top 3

1. **VPS deploy by Sep 20** — 3 days. One SSH session. Jack's only action. Everything else is noise.
2. **Hold the code freeze** — zero temptation. Oct 5 content run is 18 days away; nothing ships before then.
3. **Calendar Oct 5 content run explicitly** — "planned" isn't scheduled. This needs to actually fire.

---

## Features REJECTED This Week

- **Any UI change before Oct 11** — Code freeze. Reddit first impressions. No.
- **Adding venues before Oct 5** — 14 pending proposals wait for the batch. Individual commits between now and Oct 5 create noise with no meaningful catalog improvement.
- **Investigating the claude/* branch graveyard as a task** — Not a PM action. Jack: one command on GitHub. `git push origin --delete <branch>` repeated 15 times or via the UI. Stop spending agent cycles flagging it.
- **Any scoring model changes** — Algorithm freeze alongside code freeze. The six-hole audit (effervescent-jumping-hopper) was done. Do not touch.

---

## Success Criteria

### What defines success?
- **Day 1 (Oct 11 Reddit post):** 500+ unique visitors, <30% bounce on Explore, 50+ wishlists saved.
- **Week 1:** 1,000 registered users (magic-link), 200+ alerts set.
- **90-day:** 5,000–8,000 MAU.

### What gets us to 8K not 5K?

Three things simultaneously:
1. **Flight pricing works on day 1.** VPS deployed before Sep 20. Non-negotiable.
2. **Tags feel rich on Explore.** Oct 5 run ships. 190 beach venues going from 2 tags to 4 moves the quality bar from "beta" to "polished."
3. **The product survives the first-hour traffic spike.** Open-Meteo rate limiting is still the unvalidated unknown. VPS weather cache (bundled with #19 deploy) is the only mitigation. If the cache doesn't deploy with the rest of the proxy fix, a 500-user traffic spike from Reddit could throttle every venue card empty within minutes.

---

## One Product Risk Nobody Is Talking About

**October 11 is not ski season.**

The Reddit launch is targeting r/skiing and r/solotravel. The post date is Oct 11. In the Northern Hemisphere, almost no ski resorts open before November. Whistler opens Nov 21. Chamonix opens mid-December. Val-d'Isère opens late November.

On Oct 11, the skiing tab on Peakly will show 134 ski venues — most of them scoring low because there's no snow, it's out of season, and the `isNorth` hemisphere season gate is correctly suppressing them. The Explore grid, sorted by weekend score, will surface almost exclusively beach venues. The product will look like a beach app with a broken ski tab to anyone who clicks "Skiing."

**Why this matters:** r/skiing is one of the two target communities. If the ski tab is nearly empty on launch day, the comments will say "this is only for beach" and the ski-specific virality dies immediately.

**What to check before Oct 11:** Verify the skiing filter shows a non-embarrassing result set on Oct 11 dates. Southern hemisphere ski venues (New Zealand, Australia, Chile, Argentina) are in-season through October — Cardrona, Mount Hutt, Las Leñas, Cerro Catedral. The product should have ≥15 scoring ski venues in October from the southern hemisphere. If it doesn't, the r/skiing post should move to December.

This is a free check to run. Add it to the Oct 5 content run: score the 134 ski venues against Oct 11 weekend dates and confirm ≥15 viable results.

---

*Report generated 2026-09-17 by the daily PM agent. v153.*
