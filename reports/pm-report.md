# Peakly PM Report — 2026-06-07 (v51)

> Supersedes v50 (June 6). **Status: RED → GO pending VPS. Launch day. One binary gate remaining.**

---

## Shipped Since v50 (2026-06-06 → 2026-06-07)

| What | Verdict |
|------|---------|
| **DevOps June 7** — cache bumped 20260606a → 20260607a, CORS localhost origins flagged | ✅ Cache is current. CORS fix deferred — see below. |
| **Content June 7** — 156 venues healthy, ID typo flagged (`beach_gilit`), Bora Bora soft-dups re-evaluated as *defensible* | ✅ Filed. Triage below. |
| **Zero app.jsx logic changes** — code freeze held for 3 days | ✅ Exactly right. |

**Code state June 7:** app.jsx 9,006 lines. Cache 20260607a consistent. PEAKLY_BUILD = "20260607a". Sentry DSN active. Plausible wired. 156 venues (67 skiing + 89 beach). APNS Capacitor gate live at app.jsx:8327.

---

## Bug Triage — June 7

| Bug | Severity | Days Open | Status |
|-----|----------|-----------|--------|
| **VPS proxy unredeployed** | **P0** | **Day 34** | ❌ Jack. Today. Hard gate. |
| CORS localhost origins in production proxy.js | **P1** | Day 1 | Fix in June 10 sprint (same SSH session as VPS redeploy, trivial) |
| `beach_gilit` ID typo (should be `beach_gili`) | **P2** | Day 1 | Defer to June 10. Functionally harmless, needs localStorage migration guard. |
| OBX near-dup (`beach_ob` + `outer-banks-nags-head-t7`) | **P2** | Day 3 | Defer to June 10. Confirmed same destination, needs ID merge + localStorage guard. |
| Thredbo airport `SYD→CBR` | **P2** | Day 3 | Defer to June 10. Content has the diff. |
| Gudauri photo duplicate | **P2** | Day 3 | Defer to June 10. |
| 4 s-series ski venues wrong tags | **P2** | Day 3 | Defer to June 10. Off-season, not visible. |
| skiPass backfill (16–25 venues missing) | **P2** | Day 10 | Defer to June 10 batch. |
| Cache-buster auto-bump still manual | **P2** | Day 11 | June 10 — DevOps has the 5-line script fix. |
| Eager Supabase script (80KB anon load) | **P2** | Day 28 | June 10 — diff exists, `git apply`. |

**Resolved since v50:** Bora Bora dedup decision reversed — see Decision 2 below.

**Confirmed closed (permanently):**
- Sentry DSN empty: ✅ Active at app.jsx:8
- Peakly Pro $9/mo: ✅ UI removed. Not visible.
- APNS Capacitor gate: ✅ Live at app.jsx:8327. Tab hides on iOS native when `apnsConfigured = false`.

---

## Explicit Product Decisions — June 7

**Decision 1: Sunday launch timing — accept the "next weekend" frame, ship today anyway.**

`weekendDayIndices()` on June 7 (Sunday) returns [0, 1] (Sun+Mon). Confidence is `high`. But a user discovering Peakly at noon on Sunday can't book a flight for Sunday evening. The genuinely actionable window for launch-day users is June 12–15 (the NEXT weekend). This is not a bug — the front page shows what's firing *now*, which is correct product behavior. It's a distribution timing observation, not a code issue.

The fix is not code. The Reddit post should acknowledge this in the first paragraph: *"If you're seeing this Sunday, the next window to actually book is Friday June 12."* That's honest, creates urgency for next weekend, and signals the product is thinking about the user's real situation. Jack writes this into the post copy. No code change.

**Decision 2: Bora Bora soft-dup — REVERSAL. KEEP BOTH.**

v50 (June 6) decided to CUT `matira-beach-t6` in the June 10 sprint. June 7 content agent made the case that `borabora` (overwater bungalow framing) and `matira-beach-t6` (walkable public beach) are genuinely different use cases and will surface differently for different travelers. This is correct. They're not the same trip. The earlier decision was wrong — it treated proximity as identity. KEEP BOTH. `matira-beach-t6` stays. Remove from June 10 sprint task list.

**Decision 3: CORS localhost fix — June 10, not today, same SSH session as VPS.**

DevOps flagged localhost origins (`http://localhost:8000`, `http://localhost:3000`, `http://127.0.0.1:8000`) allowed in production CORS. This is a real attack surface — any local dev server can call the production proxy and exhaust rate limits. The fix is 3 lines. It does NOT require a VPS redeploy to ship separately — bundle it with the VPS redeploy SSH session. Not launch-blocking because the Travelpayouts token stays server-side and the blast radius is rate-limit exhaustion, not credential exposure. Do it today when Jack does the VPS redeploy.

---

## Launch Go / No-Go — June 7

| Gate | Status |
|------|--------|
| Cache 20260607a aligned | ✅ |
| Sentry DSN active | ✅ |
| GEAR_ITEMS live | ✅ |
| APNS Capacitor gate (app.jsx:8327) | ✅ |
| SEO meta clean | ✅ |
| Flight CTA direct (no modal) | ✅ |
| JSON-LD + H1 fallback | ✅ |
| GEAR_ITEMS Amazon spot-check | ⚠️ 10 min, Jack |
| **VPS proxy verified live** | ❌ **BINARY BLOCKER** |
| Plausible domain validated | ❌ Jack (2 min) |
| Human smoke test incognito | ❌ Jack (5 min) |
| Reddit post written (Jack's voice) | ❌ Jack |

**If VPS `/health` returns `"wx_cache_size"` key before post time → GO.**
**If VPS is still unreachable → slip to June 14. No exception.**

At the Reddit spike rate (200–500 simultaneous cold-cache users, conservatively), the Open-Meteo ceiling of 10K/day blows at 67 concurrent sessions. Venues score null. Grid looks empty. First comments say "broken." Post dies. No retry on Reddit launch reputation.

```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && pm2 save
# Bundle CORS fix in same session:
# In proxy.js lines 52-54: gate localhost origins behind NODE_ENV !== 'production'
curl https://peakly-api.duckdns.org/health | jq .
```

Expected: `"wx_cache_size": 0, "poll_interval_min": 30`. If that returns → post the thread.

---

## This Week's Top 3 Priorities Only

**1. Jack: VPS SSH + CORS fix — today. Launch gate.**
Same session, <5 minutes total. Commands above. Everything else is conditional on this.

**2. Jack: Update Reddit post copy to acknowledge Sunday timing.**
Add one sentence: *"If you're reading this Sunday, the window to book is this Friday June 12."* Converts "I'm too late" readers into next-weekend bookings. Takes 30 seconds.

**3. June 10 sprint planning: OBX merge + beach_gilit rename + Thredbo fix + CORS confirmed + 5 new venues.**
Package the backlog into one clean commit. Each fix needs a localStorage migration guard. Content agent has all the diffs ready. This is the first real post-launch engineering session.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Bora Bora dedup (CUT matira-beach-t6) | **REVERSED — KEEP BOTH** | Different use cases: overwater bungalows vs public beach. Content agent call is correct. |
| 5 new venues (Verbier, Val Thorens, Yongpyong, Tenerife, Byron Bay, + 4 from June 7 content) | **DEFER June 10** | Code freeze. 156 is defensible. |
| Ski empty-state summer copy | **DEFER June 8** | Right fix, wrong day. First post-launch commit. |
| pool-Primary flag on any venue | **DEFER** | No launch impact. |
| SRI + CSP | **DEFER July** | Requires regression test with Babel unsafe-eval. |
| Hotels in deal score | **CUT** | v2 if demand validates. Final. |
| Peakly Pro | **CUT for v1** | Post-1K MAU. No action needed. |
| Wishlists / Trips tab | **LOCKED — 1K MAU gate** | Hard. |
| App Store submission | **DEFER post-launch** | Post-Reddit. |

---

## Success Criteria — June 7

**90-day projection:**

| Scenario | 90d Users | Critical Variable |
|----------|-----------|-------------------|
| VPS live + top-10 Reddit post + June 7 | **6K–8K** | Proxy absorbs spike; day-8 grid has ≥5 good cards for next weekend |
| VPS down at launch | **<500** | Grid empty in hour 1. Thread dies. |
| Launch slips to June 14 | **4K–6K** | Still peak summer. Next-weekend timing is actually better. |

**For 8K, not 5K:** VPS confirmed (today), post reaches top 10 within 6 hours, Reddit account has >100 karma. Two are done; the VPS is the one remaining variable.

**What to measure in 48 hours:**

| Metric | Target | Tool |
|--------|--------|------|
| Unique visitors (hour 1) | >200 | Plausible |
| `venue_detail_open` events | >15% of visitors | Plausible |
| `install_pwa` events | >5% of visitors | Plausible |
| Sentry new error classes | 0 in hour 1 | Sentry |
| Plausible mobile bounce rate | <70% | Plausible |

If Sentry shows a new crash class in hour 1, hotfix before the thread hits 50 comments.

---

## Pre-Launch Checklist — June 7 Final

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (app.jsx:8327) | ✅ Live — tab hides on iOS native when APNS unconfigured |
| 3 | 156 venues (67 ski / 89 beach) | ✅ |
| 4 | Outer Banks ap ORF | ✅ |
| 5 | BookingConfirmSheet off flights | ✅ |
| 6 | SafetyWing CTA live | ✅ |
| 7 | Bora Bora BOB standardized | ✅ |
| 8 | GEAR_ITEMS live (app.jsx:257) | ✅ |
| 9 | Sentry DSN non-empty | ✅ |
| 10 | Seasonal default beach N-hem June | ✅ |
| 11 | lateSeason flags (6 ski venues) | ✅ |
| 12 | Cache 20260607a aligned | ✅ |
| 13 | Supabase lazy-load 2.106.2 | ✅ |
| 14 | JSON-LD structured data | ✅ |
| 15 | Static H1 fallback | ✅ |
| 16 | **VPS proxy verified live** | ❌ Jack — hard gate |
| 17 | **Plausible domain validated** | ❌ Jack — 2 min |
| 18 | **Amazon ASIN spot-check** | ❌ Jack — 10 min |
| 19 | **Reddit post written (Sunday timing note added)** | ❌ Jack |
| 20 | **Human smoke test incognito** | ❌ Jack — 5 min |

**15 of 20 green. 5 remaining are Jack-only. Zero technical work left before launch.**

---

## Revenue Model — June 7

| Stream | Code Status | RPM/1K MAU |
|--------|-------------|------------|
| Booking.com (`aid=2311236`) | ✅ | $6.90 |
| Amazon Associates (`peakly-20`) | ✅ GEAR_ITEMS live | $4.48 |
| SafetyWing (`referenceID=peakly`) | ✅ | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ | $0.14 |
| REI (Avantlink) | LLC pending | +$6.16 |
| Backcountry / GetYourGuide | LLC pending | +$1.84 |

**Live RPM: $12.06/1K MAU.** Not the constraint. Users are the constraint. Ship.

---

## One Product Risk Nobody Is Talking About

**The skiing filter is useless in summer and there's no explanation.**

Through September, 61 of 67 ski venues score near-zero. `seasonalDefaultCat` correctly opens to Beach. But a skier who taps the Skiing filter — especially one who finds Peakly through the Reddit launch — sees a near-empty list with no context. Not "off-season" in the UI. Not "6 southern resorts still open." Just a sparse grid that reads as broken.

These are Peakly's highest-LTV users. Skiers book flights, spend on gear, return in December. Losing them silently in June because of missing copy is a preventable failure with a 30-minute fix.

The ski empty-state copy change is the first post-launch commit, June 8. It's already on the plan. The risk is it doesn't happen because launch adrenaline pivots to "what's next." Name it as a contract: v52 (June 8) ships the empty-state copy or it moves to June 10 sprint and gets done then. No longer deferrable past June 10.
