# Peakly PM Report v142 — 2026-09-06

**Status: 🔴 RED — Nothing shipped to app.jsx in 48 hours. AGP/AKL/GRU distance filter broken for Day 3. VPS Day 44. Venue search deadline is Sep 14 — 8 days. The critical path is stalled.**

---

## Shipped Since Last Report (v141 → v142)

| Commit | What | Right call? |
|--------|------|-------------|
| `307b403` | Content report Sep 6 — 91/100, AGP/AKL/GRU Day 3, Famara ACE fresh pick, 4 re-proposals from Sep 5 | ✅ Audit is useful |
| `4d86549` | DevOps report Sep 6 — Open #19/#21/#23 Day 44, 18 zombie branches, Open-Meteo math unchanged | ✅ Nothing new to add |

**Zero app.jsx commits in 48 hours.** Last code change: `9c2c198` (Sep 4 — PM v140, 10 venues). No regressions, but no progress either. The Sep 5 Content batch (4 venues) was never pasted. The AGP/AKL/GRU fix (3 lines, Day 2 when flagged yesterday) is still open. Both would have taken under 5 minutes combined.

---

## Bug Triage

### AGP/AKL/GRU missing from AIRPORT_COORDS — P1 (Day 3, ESCALATING)

Distance filter silently fails for any venue with one of these airports. Users filtering to ≤4hr or ≤6hr see sierra-nevada-es, piha-beach-nz, and ilhabela-brazil regardless of physical reachability. This is a **silent lie in the core product promise** — "spontaneous, reachable weekend."

Three lines. Has been fixable since September 4. On Day 3 of the same report. This ships today.

Fix:
```javascript
AGP:{lat:36.6749,lon:-4.4991},
AKL:{lat:-37.0082,lon:174.7850},
GRU:{lat:-23.4356,lon:-46.4731},
```

### VPS Redeploy (Open #19/#21/#23) — P0 (Day 44)

Open-Meteo rate limit kills the app 90 seconds into a Reddit spike. The math: 405 venues × 1.65 calls × 500 simultaneous users = 334,000 calls against a 10K/day free tier. Proxy cache (Open #19) turns that into 1 call per venue. It's written. It's not deployed.

Day 44 of a 30-minute SSH task. This is the only item on the critical path that requires Jack's hands. **Must happen before Oct 11.**

### Venue text search — P1 (8 days to Sep 14)

Not started. Sep 14 is the deadline before Reddit moves from Oct 11 to Oct 18. Minimum spec: `toLowerCase()` filter on title+location+tags, input above category pills, count shown when active, clears on pill change. This is a 1–2hr build.

**If this slips past Sep 14, Reddit moves a week and we lose the first weekend of October — peak ski pre-booking intent in North America. That's the most valuable organic moment of the year for this product.**

### S-Hemisphere ski closing window — time-sensitive (new)

Content flags this correctly: most Andes resorts close last week of September. This is Peakly's **one chance to drive word-of-mouth from southern-hemisphere ski users before the entire category goes off-season**. Valle Nevado, Portillo, The Remarkables — these are peak-score venues right now. Scoring engine handles it correctly. No code change needed. This is a marketing flag: Reddit timing matters for this audience specifically.

### Zombie branches — P3 (Day 12+, unchanged)

18 stale branches. No production risk. Still do not touch before Oct 11. Post-Reddit one-liner to clean.

---

## Three Product Decisions — Sep 6

### Decision 1: AGP/AKL/GRU AIRPORT_COORDS — SHIP IT NOW

This has been in every report since Sep 4. It's 3 coordinate pairs. It breaks a stated product promise (reachable weekend). It will be fixed in this report run.

### Decision 2: Content's 5 venue proposals — DEFER

4 carry-overs from Sep 5 (Anthony Quinn Bay RHO, Prainha GIG, Currumbin OOL, Temae PPT) + 1 fresh Famara ACE are all clean — APs verified, no coord gaps. But the standing Sep v141 call holds: **stop adding venues until venue search is built.** 405 venues that users can't search is worse than 395 venues users can find. Every venue added before search widens the discoverability gap.

Exception: if Famara ACE ships with the AGP/AKL/GRU fix in the same commit, it's zero additional effort. But it's not the priority. Search first.

### Decision 3: Venue search minimum spec — LOCKED, build this week

No changes to the spec from v140/v141. Build it. The deadline is Sep 14. This is:

```
- Text input above category pills
- toLowerCase() filter on venue.title + venue.location + venue.tags.join(' ')
- Count shown when filter is active ("12 results")
- Clears automatically when category pill changes
- No server calls, no debounce complexity — pure client-side
```

This is not a complex feature. It's a `filter()` on an array with an `<input>` bound to state. The only risk is getting clever with it and taking 3 days instead of 2 hours.

---

## This Week's Top 3 Priorities Only

1. **Fix AGP/AKL/GRU AIRPORT_COORDS** — 3 lines, P1, Day 3. Ships in this run.
2. **Build venue text search** — 8 days to Sep 14 deadline. 1–2hr build. Blocks Reddit Oct 11 date.
3. **VPS SSH session (Jack)** — Open #19/#21/#23. Day 44. Pre-Reddit gate. No one else can do this.

---

## Features REJECTED This Week

- **5 new venue additions (Sep 6 Content batch)** — DEFER. Build search before expanding the unsearchable catalog.
- **Tag enrichment (225 venues with 2 tags)** — DEFER. Tags serve search corpus but 2 is enough for MVP. Post-Reddit sprint.
- **JSON-LD structured data** — DEFER. SEO compounds over months, not relevant to Oct 11 Reddit launch.
- **S-hemisphere venue expansion** — DEFER. 2 venues in S-temperate beach zone is thin but not a launch blocker. Add after Reddit.
- **Photo accuracy (Open #20)** — DEFER. Needs Unsplash API key + editorial review. Not agent-executable.
- **APNS/push (Open #21)** — DEFER. Gate is live. Fix the HTTP/2 + JWT P1363 issues on the VPS before wiring the .p8.

---

## One Product Risk Nobody Is Talking About

**The Oct 11 Reddit window requires a coherent story in the post, and nobody has written that story.** The technical work (VPS, search, AGP fix) is necessary but not sufficient. A Reddit post on r/skiing or r/travel that doesn't nail the hook gets ignored or downvoted. The product has a genuinely strong angle: "only app that combines Fri–Mon weather + cheap flights + a confidence badge that admits when the forecast is too uncertain to recommend." That's differentiated from OpenSnow, KAYAK, and Hopper all at once. But that sentence isn't in the README, it's not on the landing page, and nobody has drafted the Reddit post. The technical gates are 44 days overdue. The marketing gate hasn't started. Both need to be true on Oct 11.

---

## Success Criteria

**What defines 8K users at 90 days vs. 5K:**

| Factor | 5K path | 8K path |
|--------|---------|---------|
| Reddit post | Good traction, second page, r/skiing only | Front page, r/skiing + r/travel crosspost, strong comments from Jack |
| App quality on spike day | VPS works, search works | VPS works, search works, distance filter honest, no rate-limit banner |
| S-hem timing | Post after Andes season ends (October) | Post while Andes are still peak (September, 3 weeks left) |
| Word of mouth | Low share rate | Share-a-list drives organic loops |
| Error rate | Some users see rate limits | Proxy cache absorbs the spike |

**The S-hemisphere ski timing risk is real.** If VPS ships in the next week and search ships by Sep 14, there's an argument for posting on Reddit in the **last week of September** targeting the Andes closing weekend — capturing both hemispheres simultaneously. That post writes itself: "Best ski weekend left in the Southern Hemisphere + First powder days forming in Colorado." That's the 8K path. Waiting until October 11 is the 5K path.

---

*Report generated 2026-09-06. Venue count: 405 (bracket-walker eval, authoritative). Cache: 20260904a (stale until next app.jsx commit). Venue search deadline: Sep 14. Reddit gate: Oct 11 (earlier if VPS ships soon + S-hem timing aligns).*
