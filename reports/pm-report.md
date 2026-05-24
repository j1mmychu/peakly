# Peakly PM Report — 2026-05-23 (v38)

> Latest report. Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: ORANGE → RED if VPS doesn't ship today.**
Reddit post is 24 hours out. The pre-launch code block from May 22 didn't ship. VPS is Day 19. If those two items don't close today, posting tomorrow means launching with broken deal scores, $0 Amazon revenue, and a stale venue duplicate. That's a one-shot subreddit post wasted.

---

## Shipped Since Last Report (2026-05-22 → 2026-05-23)

| What | Commit | Right call? |
|------|--------|-------------|
| Cache buster `20260513j` → `20260522a` | DevOps agent, 16fec21 | ✅ Critical — 9 days stale, users were seeing the old front-page and the profile crash bug |
| Content data fixes | 1aa1148 | ✅ Correct — data accuracy matters more pre-Reddit than post |
| PM report (May 22) | 43f2466 | ✅ |

**Zero Jack commits since May 22.** The code-agent task block from the May 22 PM report — GEAR_ITEMS, val-d-isere-s16 delete, outer-banks OAJ→ORF, seasonal ski copy — is unshipped. These were called "ships today." They didn't. Today is the last day before the Reddit post window.

---

## Bug Triage

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **VPS proxy not deployed** — weekend pricing + weather cache dead in prod | **P0** | ❌ | **19** |
| **GEAR_ITEMS missing** — Amazon Associates = $0 active earnings despite "LIVE" in revenue table | **P1** | ❌ | 19+ |
| **val-d-isere-s16 duplicate** — same location as tignes, approved delete May 13 | **P2** | ❌ | 10 |
| **outer-banks-nags-head-t7 ap:"OAJ"** — wrong IATA, flight pricing broken | **P2** | ❌ | 10 |
| **val-d-isere-s16 in Quick Templates** (line 5192) | **P2** | ❌ | 10 |
| **Plausible domain validation** — untested, unknown if events fire correctly pre-Reddit | **P1** | ❌ | First flagged May 22 |
| Cache buster stale | ~~P0~~ | ✅ CLOSED (May 22) | — |
| Sentry DSN empty | ~~P0~~ | ✅ CLOSED | — |
| Peakly Pro $9/mo | ~~P1~~ | ✅ CLOSED (Pro CUT) | — |
| APNS gate on iOS | ~~P0~~ | ✅ CLOSED (`showAlertsTab` at :8158) | — |
| pigeon-point-t27 duplicate | ~~P2~~ | ✅ CLOSED (deleted) | — |
| abasin lateSeason:true | ~~P1~~ | ✅ CLOSED | — |
| SEO meta surf/adventure strings | ~~P1~~ | ✅ CLOSED | — |

---

## Explicit Product Decisions — May 23

**Decision 1: GEAR_ITEMS — SHIP TODAY. This is not a decision, it's a bug.**

Amazon Associates is listed "LIVE at $4.48/1K MAU" in the revenue table. It is earning $0. The gear gate was flipped May 4 (a9aacf5) but the `GEAR_ITEMS` constant itself is absent from app.jsx (`grep GEAR_ITEMS app.jsx` returns nothing). Restore the object from git history around a9aacf5 and ship it in today's commit. No redesign, no new items — exact restore. If code agent can't close this today: strike Amazon Associates from "LIVE" in CLAUDE.md. The shared brain cannot lie.

**Decision 2: val-d-isere-s16 — DELETE TODAY. Decision is 10 days old.**

PM approved this delete on May 13. The venue is still in app.jsx (line 530) and referenced in Quick Templates (line 5192 → change to `"tignes"`). Tignes (id:"tignes") covers the same terrain, better ratings, more reviews. One line delete + one reference update. Goes in the same commit as GEAR_ITEMS. This is not open for re-debate.

**Decision 3: Reddit post May 24 — CONDITIONAL GO.**

The Memorial Day weekend ski-tail window is real. Miss it and the next natural hook is June 1 (beach season). But the GO requires all three of:
1. VPS health check shows `{"weather_cache":...}` 
2. GEAR_ITEMS in app.jsx
3. Plausible fires for incognito visit at `j1mmychu.github.io/peakly`

If any one of these fails by Friday evening: post June 1. No exceptions. A broken product launch on Reddit does more damage than a 1-week slip — the community memory is longer than the algorithm window.

---

## Blocked

| Item | Blocker | Who |
|------|---------|-----|
| VPS redeploy | Jack SSH — 90 seconds, 1 command | Jack only |
| Reddit post | VPS verified + GEAR_ITEMS shipped + Plausible validated | Jack + code agent |
| REI affiliate (18 links) | LLC approval | External |
| Backcountry, GetYourGuide | LLC approval | External |
| APNS / push delivery | Deferred to v1.1 | — |
| peakly.app domain | Registration pending | External |

---

## This Week's Top 3 Priorities Only

**1. Code agent: commit block today (~45 min)**
- Restore GEAR_ITEMS constant to app.jsx (from git a9aacf5 area)
- Delete val-d-isere-s16 from VENUES array (line 530)
- Update Quick Templates ref line 5192: `"val-d-isere-s16"` → `"tignes"`
- Fix outer-banks-nags-head-t7 `ap:"OAJ"` → `ap:"ORF"`
- Cache bump `20260522a` → `20260523a` across app.jsx, sw.js, index.html

**2. Jack: Plausible validation (5 min — do this before anything else)**
Open `https://j1mmychu.github.io/peakly/` incognito → click 3–4 venues → check Plausible realtime dashboard. If events register: ✅ proceed. If nothing shows: `data-domain` in index.html needs to match the exact string in Plausible site config. Fix before the Reddit post or day-1 traffic data is worthless. 5 minutes. No excuse not to.

**3. Jack: VPS SSH (90 seconds — binary gate for the Reddit post)**
```bash
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy"
curl https://peakly-api.duckdns.org/health
```
Must return a JSON object with `weather_cache` key. Day 19. No new features touch this — it's 1 command. If this slips again, we post June 1.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Any new app.jsx feature | **HARD BLOCK** | Feature freeze until 100 Plausible users analyzed post-Reddit |
| Venue count expansion | **DEFER post-Reddit** | 148 clean venues > 160 with data bugs |
| S. hemisphere ski venues | **DEFER post-Reddit** | June timing is correct — not before the post |
| Maldives beach venue | **DEFER** | Right idea, wrong week |
| MapView improvements | **DEFER post-launch** | Gate first, validate later |
| SRI hashes on CDN scripts | **DEFER 2 weeks** | Not user-facing. Do after launch stabilizes |
| CSP meta tag | **DEFER 2 weeks** | Same reason |
| Alert persistence (Supabase) | **DEFER v2** | In-memory is fine at current scale |
| Wishlists / Trips tab reveal | **DEFER** | Hard lock at 1K MAU |
| Venue descriptions | **DEFER** | Content sprint post-Reddit when feedback tells you what to say |
| Hotels in deal score | **CUT v2** | Dead five times. Gone from future reports |

---

## Pre-Launch Checklist — May 23

1. ✅ SEO meta — zero "surf"/"adventure" strings
2. ✅ APNS gate — `showAlertsTab` at app.jsx:8158
3. ✅ Cache buster — `20260522a` aligned across 3 files
4. ✅ pigeon-point-t27 + sarakiniko-beach-t16 deleted
5. ✅ abasin lateSeason:true
6. ❌ **GEAR_ITEMS** — code agent ships today → `20260523a`
7. ❌ **val-d-isere-s16 deleted** — code agent ships today
8. ❌ **outer-banks ap OAJ → ORF** — code agent ships today
9. ❌ **VPS proxy verified** — Jack SSH. Binary gate.
10. ❌ **Plausible validation** — Jack incognito test. 5 minutes.
11. ❌ **Reddit post written** — Jack's voice. Saturday 9–11am PST. Story-first. Screenshot of real firing venue.

Items 6–8: one code commit, ~45 min. Items 9–11: Jack only.

---

## Success Criteria

**Metrics that define success:**
- Week 1: ≥500 Plausible unique visitors, median ≥1 pageview/session
- Week 2: ≥2% wishlist save rate (signals intent to return)
- Month 1: ≥50 returning visitors (second visit within 30 days)
- 90 days: 5K–8K unique visitors

**What has to be true for 8K, not 5K:**
- Reddit post goes up this Saturday (May 24) — Memorial Day ski tail + early beach-season overlap
- Post has a real screenshot of a "Firing this weekend" venue with a live flight price (not an estimate `~$X`)
- VPS is live so deal scores are backed by actual weekend fares
- Cross-post r/skiing + r/solotravel same day (not sequential — same-day engagement drives the algo)
- Plausible data is correct from minute one

**What narrows to 4K:** posting June 1+, posting with estimate prices, posting without a ski hook, sequential cross-posting.

---

## One Product Risk Nobody Is Talking About

**The 6hr default flight filter will show new users with no home airport a near-empty Explore grid.**

On first load with no stored airport and failed geolocation, `maxFlightHrs: 6` is active. From a data center IP (which Reddit users frequently hit via VPN or mobile carrier), this could produce 2–4 visible venues instead of 8+. A Reddit commenter clicks the link, sees "Not much firing this weekend" — and that becomes the comment thread. "Tried it, only showed me 2 places." Brutal first impression on launch day.

**The fix (20 minutes, ships in today's commit block):** If `homeAirport` is null AND geolocation hasn't returned yet, set `maxFlightHrs: null` (show all venues). The 6hr default only kicks in once a home airport is confirmed. This is one conditional check — worth doing before 500 people see the app for the first time.
