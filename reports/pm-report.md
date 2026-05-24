# Peakly PM Report — 2026-05-24 (Memorial Day Saturday)

> Latest report. Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: 🟡 ORANGE — GEAR_ITEMS shipped this morning. Two P0s remain (VPS + Reddit post). Window closes tonight.**

---

## Shipped Since Last Report (May 22–24)

| What | Commit | Right call? |
|------|--------|-------------|
| **GEAR_ITEMS restored + wired into VenueDetailSheet** | DevOps, 450891b | ✅ Critical. Amazon was earning $0 for 15 days. Now active. |
| Cache buster `20260522a` → `20260524a` | DevOps, 450891b | ✅ Synced across all 3 files. |
| Content report refresh | 1187720 | ✅ |
| PM report May 23 | 43f8c6b | ✅ |

**GEAR_ITEMS is live.** `const GEAR_ITEMS` defined at app.jsx:257. Gear row renders in VenueDetailSheet at app.jsx:7332. Amazon Associates `peakly-20` is now active. Revenue table entry `$4.48/1K MAU` is no longer a lie.

**Still unshipped (called "ships today" on May 22 — now Day 2 of slippage):**

| Item | Status | Days Open |
|------|--------|-----------|
| val-d-isere-s16 deletion | ❌ Still at app.jsx:564 | 12 days |
| val-d-isere-s16 in Quick Templates (app.jsx:5226) | ❌ Still references it | 12 days |
| outer-banks-nags-head-t7 ap:"OAJ" → "ORF" | ❌ Still wrong at app.jsx:582 | 3 days |
| Seasonal ski empty-state copy | ❌ Not confirmed | Unknown |
| VPS proxy redeploy | ❌ Jack-only | **Day 20** |

---

## Bug Triage

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **VPS proxy not deployed** — weekend pricing + weather cache dead | **P0** | ❌ | **20** |
| **val-d-isere-s16 duplicate** — approved delete May 13, still live | **P2** | ❌ | 12 |
| **outer-banks-nags-head-t7 ap:"OAJ"** — wrong IATA, broken flight pricing | **P2** | ❌ | 3 |
| **Plausible domain validation** — untested pre-Reddit | **P1** | ❌ | 3 |
| **Ski empty state** — no copy explaining off-season | **P2** | ❌ | New |
| GEAR_ITEMS missing | ~~P0~~ | ✅ **CLOSED** this morning (commit 450891b) | — |
| Cache buster stale | ~~P0~~ | ✅ CLOSED (`20260524a`) | — |
| Sentry DSN empty | ~~False alarm~~ | ✅ Configured at app.jsx:8 | — |
| Peakly Pro $9/mo discrepancy | ~~P1~~ | ✅ CLOSED — Pro UI removed April 2026. Not in code. | — |
| APNS gate on iOS | ~~P0~~ | ✅ CLOSED (`showAlertsTab` at app.jsx:8158) | — |

### VPS proxy — the single remaining P0
148 venues × ~1.5 Open-Meteo calls per user = ~222 calls per page load. Free tier: 10,000/day. Break-even: **45 concurrent users**. Reddit sends 200+ in hour 1. Past that threshold every venue scores 0 — users see blank cards. Silent catastrophic failure. Has been open 20 days. Jack-only. 3 commands.

---

## Blocked

| Item | Blocker | Owner |
|------|---------|-------|
| VPS redeploy | Jack SSH — 3 commands, 10 min | Jack only |
| Reddit post | VPS verified + Plausible validated | Jack |
| REI affiliate (18 links, +$6.16/1K MAU) | LLC approval | External |
| Backcountry, GetYourGuide | LLC approval | External |
| APNS / push delivery | Deferred to v1.1 | — |

---

## This Week's Top 3 Priorities Only

### 1. Jack: VPS SSH (10 min — P0 gate)
```bash
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && curl localhost:3001/health"
```
Must return JSON with `weather_cache` key. Without this: app breaks at 45 concurrent users. Reddit sends 200 in hour 1.

### 2. Reddit post — today or Sunday (VPS gate applies)
**Today is Memorial Day Saturday.** Optimal ski-tail × beach overlap window. After today: Sunday acceptable, next weekend loses the holiday hook, June 5 loses ski angle entirely.

r/skiing + r/solotravel + r/frugaltravel. Story-first, first-person, Jack's voice. Screenshot of firing venue with deal price. **Do not post without VPS verified.**

### 3. Code session: val-d-isere-s16 + OAJ→ORF + ski empty state (20 min)
Three surgical changes. One commit. Zero design decisions. Cache bump `20260524a` → `20260524b`.
- Delete val-d-isere-s16 from VENUES at app.jsx:564
- Update Quick Template at app.jsx:5226: `"val-d-isere-s16"` → `"tignes"`
- Fix outer-banks-nags-head-t7 `ap:"OAJ"` → `ap:"ORF"`
- Add ski empty-state copy: "Ski season is winding down in the N. Hemisphere — check back in November, or explore beach deals now."

---

## Explicit Product Decisions — May 24

**Decision 1: GEAR_ITEMS is shipped. Amazon Associates is live. Finding closed everywhere.**
DevOps agent restored the constant this morning (commit 450891b). The 15-day gap is documented. If gear click rate is <0.5% at 1K MAU, revisit placement. Wire-up is done. Close it.

**Decision 2: val-d-isere-s16 ships as a delete in the next code session.**
Approved May 13. Still open May 24. No open decisions — it's a duplicate. Delete it, update the Quick Template. Day 12. Done.

**Decision 3: S-hemisphere ski scoring fix — DEFER to June 3. Hard date.**
Six S-hem venues (Remarkables, Portillo, Thredbo, etc.) open in June but score ~0 due to N-hem calendar logic. Fix is known. Requires algorithm critique per CLAUDE.md. **June 3 hard date** — 2 weeks before peak S-hem season opens. Miss June 3 = P0 escalation.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| New venues (Maldives, Mirissa, Ölüdeniz, Mzaar, Oukaimeden) | **DEFER post-Reddit** | 148 venues sufficient. Pre-Reddit adds risk. |
| SRI hashes on CDN scripts | **DEFER** | Zero user-facing value. Post-launch hardening. |
| CSP meta tag | **DEFER** | Same. |
| Eager Supabase deletion | **DEFER** | 780KB first load matters at 100K, not now. |
| Airport IATA fixes (Japan resorts AXT/NGO) | **DEFER to June** | Not launch-blocking. |
| APNS .p8 key setup | **DEFER** | Capacitor gate hides Alerts on iOS. Not web-blocking. |
| Wishlists/Trips tab reveal | **CUT to 1K MAU** | Hard lock. |
| Peakly Pro | **CUT for v1** | Sixth rejection. Off the board until 1K MAU. |
| Hotels in deal score | **CUT to v2** | Seventh rejection. Removed from future tables permanently. |

---

## Pre-Reddit Checklist — May 24 (Current State)

1. ✅ SEO meta — no surf/adventure strings
2. ✅ APNS Capacitor gate — `showAlertsTab` at app.jsx:8158
3. ✅ Cache buster — `20260524a` across app.jsx, sw.js, index.html
4. ✅ Sentry DSN — configured at app.jsx:8
5. ✅ JSON-LD structured data — live at index.html:34
6. ✅ h1 fallback — live at index.html:391
7. ✅ **GEAR_ITEMS** — shipped 450891b (Amazon Associates active)
8. ❌ **val-d-isere-s16 deleted** — app.jsx:564 (AI code session)
9. ❌ **outer-banks OAJ → ORF** — app.jsx:582 (AI code session)
10. ❌ **Ski empty-state copy** — (AI code session)
11. ❌ **VPS proxy redeployed** — Jack SSH (**P0**)
12. ❌ **Plausible realtime validated** — Jack incognito test
13. ❌ **Reddit post** — Jack's voice, today or Sunday

Items 8–10 = one code session, 20 min. Items 11–13 = Jack only.

---

## Success Criteria

| Scenario | 90-day projection |
|----------|------------------|
| VPS + Reddit today | **8K ceiling** |
| VPS + Reddit Sunday | **7K ceiling** |
| Reddit without VPS | **Catastrophic. Don't.** |
| No Reddit this weekend | **6K ceiling** (ski hook gone) |

**For 8K, not 5K:**

| Metric | 5K | 8K |
|--------|----|----|
| Reddit upvotes day 1 | 100–200 | 400+ |
| Plausible DAU week 2 | 40–60 | 120+ |
| Explore bounce rate | <65% | <50% |
| Alert set rate | >3% of visitors | >5% |
| Return visit rate (week 2) | >12% | >20% |

8K requires r/skiing AND r/frugaltravel hits the same weekend. One subreddit is the 5K path.

---

## One Product Risk Nobody Is Talking About

**The ski category looks broken on Memorial Day weekend — and there's no copy explaining why.**

In late May: ~11 N-hem ski venues correctly score ~0 (off-season binary). 6 S-hem venues incorrectly score ~0 (hemisphere bug). From New York on a Saturday, filter to Skiing → near-empty grid → no explanation. First Reddit reply: "I don't see any ski spots." That comment pins to the top.

The copy fix is one sentence: "Ski season is winding down in the Northern Hemisphere — check back in November, or explore beach deals now." It converts "app is broken" into "app knows what it is." This is in the code session block above. If the ski-tail is in the Reddit copy, this copy fix is not optional.
