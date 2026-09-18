# Peakly PM Report v154 — 2026-09-18

**Status: 🟡 YELLOW — VPS proxy.js Day 40 undeployed. Sep 20 hard deadline is NOW 2 DAYS AWAY. Code freeze holding. 17 venue proposals staged for Oct 5 batch. S-hemisphere ski season ending this weekend — scoring engine self-regulates.**

---

## Shipped Since Last Report (v153 → v154)

| Commit | What | Right call? |
|--------|------|-------------|
| `feb764d` | Content report Sep 18 | ✅ Routine. +1 new venue proposal (Lech am Arlberg); total staged = 17. |
| `8499b4f` | DevOps report Sep 18 | ✅ Routine. VPS Day 39 countdown noted; no regressions. |
| `0dd5e94` | PM report v153 Sep 17 | ✅ Documented consequences of VPS slip, confirmed Oct 11 launch. |

**Zero code commits since `bb3ebc8` (venue search, Sep 13). Five days.** Correct. Code freeze holds through Oct 11.

---

## Prompt Context Note

The scheduled prompt references "182 venues," "Sentry DSN empty," "cache buster stale," "Peakly Pro $9/mo vs $79/yr." All four are stale artifacts — current state:
- **Venues**: 404 (134 skiing / 270 beach). Authoritative.
- **Sentry DSN**: Wired — `9416b032...` at `index.html:77` and `app.jsx:8`. Not empty.
- **Cache stamp**: `20260914a` — correct. No code has shipped since Sep 14.
- **Peakly Pro**: UI formally CUT for v1. No pricing UI anywhere in codebase. Not a bug.

Stop re-flagging these. They were closed in v152/v153.

---

## Bug Triage

### P0s — None.

### P1 — VPS Redeploy (Day 40 — Jack-only, SEP 20 HARD DEADLINE IN 2 DAYS)

This is v154. Same P1. Sixth consecutive PM report. Two days remain.

**What breaks if Sep 20 slips:** Reddit moves to Oct 18. One ski opening weekend gone. The deal score — the product's only moat — doesn't function on launch day. First-user screenshots show `~$X` estimate tags, not `LIVE` badges.

**Jack's deploy:** one SSH session, five minutes.

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && sleep 3 && curl -s localhost:3001/health | python3 -m json.tool"
```

Verify: `uptime` resets to seconds; `forecast_days` reads 14; `capacitor://localhost` in CORS list.

**v155 will be the final pre-deadline report.** It either reads "VPS deployed, Oct 11 confirmed" or "VPS missed, Oct 18."

### P1 — Tag Density (Day 13 Unchanged)

225/404 venues (55.7%) have ≤2 tags. 190/270 beach venues are the acute failure — ~70% of the beach catalog at minimum-tag threshold. This is visible to every first-time Explore user.

Fix is the Oct 5 content run. 17 days out. Defer and hold.

### P2 — Pending Venue Proposals (17 valid, unstaged)

Up from 14 (v153) to 17. Content added Ruapehu/ZQN, Paros Golden Beach/JTR (Sep 17), and Lech am Arlberg/INN (today).

| Batch | Count | Status |
|-------|-------|--------|
| Sep 13 | Mancora/LIM | ⚠️ INVALID — LIM not in AIRPORT_COORDS. Do not add. |
| Sep 14 | Grindelwald, Sestriere, Koh Lanta, Amed Bali, Noosa | Valid, unadded |
| Sep 15 | Hakuba, Mayrhofen, Naxos (fix comma), Lamu, Ilha Grande | Valid, unadded |
| Sep 16 | Alpe d'Huez, Obergurgl, Livigno | Valid, unadded |
| Sep 17 | Ruapehu, Paros Golden Beach | Valid, unadded |
| Sep 18 | Lech am Arlberg | Valid, unadded |

Still deferring all 17 to Oct 5 batch. Do not add piecemeal.

### P3 — dist/ Build Collision (Day 10 — Non-blocking)

GH Actions rebuilds `dist/` correctly on every push. Committed artifact is cosmetically stale. Production unaffected. No action.

---

## Three Product Decisions — Sep 18

### Decision 1: S-hemisphere ski season ends this weekend — NO ACTION NEEDED

Content report correctly flags that Cardrona, Mt Hutt, Falls Creek, Cerro Catedral, Las Leñas typically close in the Sep 15–30 window. Sep 26–28 is likely the last viable S-hemisphere ski weekend.

**Decision: No manual intervention.** The `snow_depth_max >= 0.5m` lateSeason gate self-regulates. Venues with depleted snow will score low and naturally fall below the confidence threshold. The scoring engine already handles this. Touching any venue data or scoring before Oct 11 violates the code freeze and risks introducing regressions.

**Implication for Oct 11 launch risk (carried from v153):** With S-hemisphere ski season ending, the ski filter on Reddit launch day (Oct 11) depends almost entirely on the 15 N-hemisphere glacier venues (Hintertux, Tignes, Saas-Fee, Val Thorens, Cervinia, Zermatt, etc.) plus early-opening N-hemisphere resorts. This is a real risk — if these ~15 venues don't produce viable scores in October, the skiing tab is effectively empty on launch day.

**Add to Oct 5 content run**: score the 134 ski venues against Oct 11 weekend dates. If fewer than 15 produce viable results, move the r/skiing post to December and lead Reddit with r/solotravel (beach) only. Do not post to r/skiing with an empty ski tab.

### Decision 2: 17 staged venue proposals — HOLD until Oct 5. No exceptions.

Adding even one venue before Oct 5 requires a code commit, a cache bump, a push, and CI. Each one is a window for a regression against a frozen codebase. The marginal value of one more venue (0.25% catalog growth) is not worth the regression risk three weeks before Reddit launch.

**Decision: Batch add all 17 on Oct 5 during the scheduled content run.** None before.

### Decision 3: Acknowledge the VPS deadline is Jack's, not the agent's — shift posture.

Five consecutive PM reports have listed VPS deploy as the #1 priority. The agent can't SSH. Jack can. The reports have delivered the information correctly and repeatedly. The consequence framework is documented (v153).

**Decision: PM reports from here on state the VPS status in one line, not one section.** Continuing to write a 10-line section on a task only Jack can do is wasted report space. If Jack deploys: it shows in the next `/health` check. If he doesn't: v155 notes the Reddit slip. The full runbook is in the DevOps report — refer there.

---

## This Week's Top 3

1. **VPS deploy by Sep 20** — Jack's only action. Two days.
2. **Hold the code freeze through Oct 11** — 17 pending proposals wait for Oct 5. No exceptions.
3. **Add ski-tab viability check to Oct 5 run** — Score 134 ski venues against Oct 11 dates before deciding whether to post to r/skiing.

---

## Features REJECTED This Week

- **Any code change before Oct 11** — Code freeze. First-impression fidelity. No.
- **Adding venues piecemeal** — 17 proposals queued. Batch add Oct 5. Individual commits carry regression risk and zero meaningful catalog improvement.
- **Tag enrichment before Oct 5** — Can't enrich tags without touching app.jsx. Code freeze. Wait.
- **APNS wiring** — Open #21 has an uncommitted local fix. Do not land it before the Reddit launch — it requires server changes, a new `pm2 restart`, and introduces risk. Defer to post-launch v2 scope.
- **Scoring model changes** — Algorithm freeze in effect. Do not touch.

---

## Success Criteria

### What defines success?
- **Day 1 (Oct 11 Reddit post):** 500+ unique visitors, <30% bounce on Explore, 50+ wishlists saved.
- **Week 1:** 1,000 registered users (magic-link), 200+ alerts set.
- **90-day:** 5,000–8,000 MAU.

### What gets us to 8K not 5K?

Same three variables as v153 — no new signal changes the equation:
1. **Flight pricing works on day 1.** VPS deployed before Sep 20.
2. **Tags feel rich on Explore.** Oct 5 run enriches ≥190 beach venues from 2 tags to 4+.
3. **Traffic spike survives.** VPS weather cache (bundled in the proxy deploy) is the only mitigation for an Open-Meteo rate-limit event.

---

## One Product Risk Nobody Is Talking About

**The Oct 5 content run is a single point of failure with no fallback.**

If the Oct 5 run doesn't fire — or fires and the agent introduces a syntax error, an invalid venue, or an unchecked VENUES-array mutation — there is no second shot before Oct 11. The auto-push guard and brace-balance check protect against obvious breaks, but a subtle error in 17 pasted venue objects could pass the guard and land in production.

This is one run carrying four things simultaneously: 17 venue additions, tag enrichment on 190 beach venues, ski-tab viability check, and cache stamp bump. That's more scope than any single automated run has handled cleanly in this project's history.

**Mitigation**: Before Oct 5, Jack should read `tasks/agents/content-data.md` and confirm the agent prompt explicitly covers all four tasks. On Oct 5, the agent should output a pre-paste validation summary (venue count delta, brace balance, cache stamp) before any commit. If the run produces more than a 25-venue-equivalent diff, stage it for manual review before pushing.

A bad Oct 5 run pushed directly to main the week before Reddit launch is worse than launching with 404 venues and 225 under-tagged venues. Scope the run accordingly.

---

*Report generated 2026-09-18 by the daily PM agent. v154.*
