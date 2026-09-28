# Peakly PM Report v164 — 2026-09-28

**Status: 🔴 RED — VPS Day 50. Oct 4 deadline = 6 days. Oct 18 beach launch = 20 days. New P1 bug: FOR/NAT missing from AP_CONTINENT — 2 Brazilian beach venues invisible to region-filtered search. Code freeze Day 15 clean.**

---

## Shipped Since Last Report (v163 → v164)

| Commit | What | Right call? |
|--------|------|-------------|
| `db7366d` | DevOps Sep 28 — Day 50 VPS red, Sep 9+10 undeployed, 18 stale branches, no regressions | ✅ Routine red flag. |
| `12d1dde` | Content Sep 28 — **NEW BUG: FOR/NAT missing from AP_CONTINENT** (2 Brazilian venues invisible to region filter), score dropped 93→91, Jericoacoara + Pipa affected | 🔴 **Action required — fix before Oct 18.** |
| *(this run)* | PM report v164 | ✅ |

**Zero code commits to app.jsx/sw.js/index.html for 15 days. Code freeze holds.**

---

## Bug Triage

### P0s — None

---

### P1 — FOR/NAT Missing from AP_CONTINENT: New, Fix Today

Content surfaced a real data bug today. `FOR` (Fortaleza) and `NAT` (Natal) are absent from `AP_CONTINENT`. Two live Brazilian beach venues are affected:

- `beach_jericoacoara` — Jericoacoara Beach, Ceará (via FOR)
- `beach_pipa_brazil` — Pipa Beach, Rio Grande do Norte (via NAT)

**What breaks:** `AP_CONTINENT[l.ap]` returns `undefined` for both. Any region-filtered Explore search (`AP_CONTINENT[l.ap] === search.continent`) returns false → these venues don't appear. Users filtering by South America / Latin America will never see them.

Both are S-hemisphere tropical beach venues — exactly the inventory that anchors the S-hemisphere spring launch narrative.

**One-line fix. Paste into `AP_CONTINENT` object in app.jsx:**

```js
FOR:"latam",  // Pinto Martins International, Fortaleza, Brazil
NAT:"latam",  // Governador Aluízio Alves International, Natal, Brazil
```

Both airports already in `AIRPORT_COORDS` and `BASE_PRICES` — no crash risk, no migration needed. Content verified this. 5-minute fix.

**This should ship before Oct 18. Two beach venues invisible at launch is not acceptable.**

---

### P1 — VPS Redeploy: Day 50, Oct 4 = 6 Days

Same as every report since August 11. The VPS runs Aug 11 binary. Sep 9+10 fare-fallback commits are not deployed. 270 beach venues will show `~$X` estimates instead of `$X LIVE` at Reddit launch.

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && curl -s https://peakly-api.duckdns.org/health"
```

Oct 4 is the deadline. 6 days. If it slips past Oct 4, beach launch proceeds with estimate pricing. That's the call.

---

### P1 — `origin/master` Footgun: Day 6 Decided, Still Undone

`origin/master` = June 2026 code. `deploy.yml` deploys on push to both `main` and `master`. One accidental push ships a 4-month regression.

```bash
git push origin --delete master
```

10 seconds. This has been decided for 6 days.

---

### P1 — Tag Density (225 Venues at ≤2 Tags): Day 23, Deferred to Oct 5

Hold. Bundle with Oct 5 session. Not touching individually before then.

---

### P2 — Gili Trawangan Duplicate Title: Decided, Oct 5

Rename `beach_gilit` to "Gili Trawangan (Lombok ferry)". Bundle with Oct 5.

---

### P3 — Stale Branches (18)

REJECTED — Oct 5 GitHub UI cleanup.

### P3 — Peakly Pro Price ($9/mo vs $79/yr)

REJECTED — dead UI. Post-launch if Pro revives.

### P3 — Sentry DSN

✅ CONFIRMED LIVE. Stop flagging.

---

## Three Product Decisions — Sep 28

### Decision 1: FOR/NAT AP_CONTINENT gap ships before Oct 18 — ideally this week.

This is the first code change warranted since the Sep 14 freeze. It's a 5-minute one-line paste to `AP_CONTINENT`, no logic change, no scoring impact. Two Brazilian beach venues invisible to region search at launch is the kind of bug you discover on launch day when someone posts "I searched South America and got nothing interesting." Fix it before that.

**DECISION: Apply the FOR/NAT fix in the next code touch. This is the unlock to end code freeze — nothing else should queue before this lands.**

### Decision 2: Oct 5 session scope is formally defined, starting now.

Every deferred item is piling into "Oct 5" with no owner, no time estimate, no definition of done. The VPS deadline is Oct 4 (same day). If Oct 5 gets skipped or runs long, the tag gap ships to launch.

**DECISION: Oct 5 scope is fixed as:**
1. FOR/NAT AP_CONTINENT fix (if not already shipped before then)
2. Gili Trawangan rename (`beach_gilit` → "Gili Trawangan (Lombok ferry)")
3. Tag enrichment: top 50 beach venues by region diversity (±2 tags each, targeting ≤2-tag venues first)
4. Branch cleanup: `git push origin --delete master` + the 18 stale `claude/` branches

Everything else is post-Oct-5. The session has one clear measure of success: data score back to 95+ before Oct 18.

### Decision 3: S-hemisphere spring framing for Oct 18 Reddit post — specific venues, not just a hook.

The r/solotravel post leads with "S-hemisphere spring window." Right call. But a narrative hook only lands if it's backed by specific named venues. "Jericoacoara is at peak right now, $X from Miami" beats "Brazil is spring." The Reddit post needs 2-3 specific venue callouts with current scores + fare estimates, not just regional language.

**DECISION: Jack pulls up the live Explore grid (filtered: Beach → South America) the week of Oct 14 and picks the top 3 highest-scoring S-hemisphere venues. Those 3 go into the Reddit post body by name. No data from me — live scoring is the point.**

---

## This Week's Top 3

1. **FOR/NAT AP_CONTINENT fix** — 5-minute code change, 2 Brazilian beach venues visible at launch. Apply before Oct 5.
2. **VPS deploy by Oct 4** — Jack SSH, 5 min. Unblocks live beach fares. 6 days.
3. **Delete `origin/master`** — 10 seconds, 6 days decided, still open. Do this today.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| Peakly Pro price fix | Dead UI. No users see it. |
| Add Serre Chevalier pre-launch | GNB not in AIRPORT_COORDS; use GVA or CMF; add post-launch. |
| GNB AIRPORT_COORDS addition | No live venue uses it. Dec scope. |
| r/skiing Oct 18 post | Pre-season. 111/134 N-hem ski venues score weak until December. |
| Any new venue adds before Oct 5 | Tag density is already 55.7% underfilled. Add venues after tags are fixed. |

---

## One Product Risk Nobody Is Talking About

**The S-hemisphere spring scoring has never been spot-checked with real weather.**

The scoring engine handles hemisphere-aware seasonality correctly — `venue.lat < 0` flips the multipliers, S-hem beach venues get a spring bump from Sep onward. But "the scoring is correct" and "the front page looks great for S-hem spring" are not the same thing.

Nobody has opened the Explore grid, filtered to Beach → South America, and actually looked at whether the top results are compelling venues with good story and realistic fares. Jericoacoara and Pipa are two of the top candidates for the Reddit callout — and they've been invisible to region-filtered search (the FOR/NAT bug) every time someone checked.

If the S-hemisphere spring narrative is the launch hook, someone needs to actually open the app the week of Oct 14, run the South America filter, screenshot what shows up, and validate that it tells the story we're about to post on Reddit. One 10-minute session. No code required. The risk is we post "Brazil is firing right now" and a skeptical Redditor opens the app and sees Iceland at the top.

---

## Success Criteria Check

| Metric | Status |
|--------|--------|
| 90-day projection (5K–8K users) | Beach-first = path to 5K. Ski in Dec = path to 8K. |
| Live fares on beach launch | 🔴 At risk — VPS by Oct 4. 6 days. |
| Data quality | 91/100 — FOR/NAT gap is P1 fix before launch. |
| Code freeze | Day 15 clean. FOR/NAT fix is the one warranted change. |
| Reddit post ready | Draft committed. Jack review + venue callouts by Oct 14. |
| S-hemisphere spring hook | 🟡 Draft in. Needs specific venue callouts + spot-check. |
| Oct 5 scope defined | ✅ Defined this report. |
| origin/master footgun | 🔴 Day 6 decided, undone. |

**For 8K not 5K:** VPS Oct 4, FOR/NAT fix before launch, beach launch Oct 18 with live fares + named S-hem venues in the post, ski post December when N-hemisphere opens. That is the path.
