# Peakly PM Report — 2026-06-13 (v57)

> Supersedes v56 (June 12). **Status: YELLOW.** VPS still 403 (Day 3 — Jack has not SSH'd). Photo dedup unshipped (Day 3). Content agent violated the venue freeze by adding 5 new venues. Launch is June 21 — 8 days. Both P0s must close by June 15 or the timeline breaks.

---

## Shipped Since v56 (2026-06-12 → 2026-06-13)

| What | Verdict |
|------|---------|
| **`150+` → `350+` venue count** in index.html OG/JSON-LD/noscript (DevOps) | ✅ Right. Social unfurls were lying for 4 days. |
| **AP_CONTINENT gaps patched** — PHL, CMH, TGD, OKA, SID, DJE added to map (Content) | ✅ Fixes 5 venues that were scoring as unknown continent. |
| **skiPass 100% complete** — 36 ski venues backfilled (Content) | ✅ Closes a long-running P2. |
| **+5 new beach venues** — Budva, Okinawa, Sal Island, Djerba, +1 (Content) | ❌ **FREEZE VIOLATION.** v56 §Decision 2 explicitly: "venue additions are FROZEN until photo dedup ships." Content agent ran the pipeline anyway. See Decision 1 below. |
| **Photo dedup** | ❌ **NOT DONE.** Still the only launch-blocking content task. Now 188/358 venues (53%) share a photo. |

**Code state June 13 (DevOps verified):**
- `app.jsx`: 13,021 lines · `PEAKLY_BUILD = "20260610af"` · balanced 5,509/5,509
- **358 venues** (130 ski / 228 beach) — +5 from today's freeze violation
- GEAR_ITEMS: 0 (Amazon cut holds) ✅
- Sentry DSN: active ✅
- VPS proxy: **403 🔴 Day 3**
- Photo duplication: **188 venues (53%) 🔴 Day 3**

**Stale bug claims from prompt — permanently closed:**
All three "bugs" (Peakly Pro $9/mo, Sentry DSN empty, cache buster stale) were closed weeks ago. Closed in v32 (May 13). They do not exist. This is the last time they appear in this report.

---

## Bug Triage — June 13

| Item | Severity | Days Open | Status |
|------|----------|-----------|--------|
| **VPS 403 (Caddy/DuckDNS post-reboot)** | **P0** | **Day 3** | Jack: SSH to 198.199.80.21, `pm2 status`, `curl localhost:3001/health`. If stopped: `cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save`. Effect while down: every card shows `~$—`. Travelpayouts dark. Weather cache inactive → rate-limit risk at 66+ DAU. This is 10 minutes. It has been 10 minutes for 3 days. |
| **Photo dedup: 188/358 venues (53%)** | **P0** | **Day 3** | Content agent must produce the unique-photo patch TODAY. Analysis is done (content report has the exact duplicate map). Fix is scripted. Output to `reports/ready-to-ship/photo-dedup-2026-06-13.diff`. Venue additions freeze holds until this ships. |
| 5 venues with thin tag depth (batch artifacts) | P3 | Day 3 | DEFER post-launch. |
| Outer Banks near-dup (beach_ob / outer-banks-nags-head-t7) | P3 | Day 5+ | **Moving to known-skipped.** Fifth consecutive report. Both venues are intentionally distinct (different beaches, different tagging, 45km apart). Not a merge candidate. Stop flagging. |
| SRI on 4 CDN scripts | P3 | Day 43+ | DEFER post-launch. Final. |
| CSP meta tag | P3 | Day 43+ | DEFER post-launch. Final. |
| 13 stale `claude/*` branches on remote | P2 | Day 2 | Review `improve-scoring-system-XYGY6` per CLAUDE.md scoring freeze policy, then bulk-delete. Jack, 15 min. Pre-App-Store hygiene. |

---

## Known Blockers — June 13

| Blocker | What It Unlocks | Owner | ETA |
|---------|----------------|-------|-----|
| **VPS 403 fix** | Flight pricing, weather cache | Jack, SSH | **Overdue — June 13** |
| **Photo dedup patch** | Visual credibility at launch | Content agent | **June 14 EOD** |
| **Venue freeze lift** | Can add venues again | Automatic when photo dedup ships | June 14+ |
| LLC approval | REI (+$6.16), Backcountry, GYG | External | Unknown |
| Account deletion SQL | App Store 5.1.1(v) | Jack | Before App Store submit |
| Reddit account karma check | Confident Reddit launch | Jack | June 18–20 |

---

## Explicit Product Decisions — June 13

### Decision 1: Venue freeze re-asserted. Content agent warning added.

The content agent added 5 venues today in violation of v56's explicit freeze. The venues (Budva/Montenegro, Okinawa, Sal Island/Cape Verde, Djerba/Tunisia, +1) appear clean per validate-venues.mjs. But that's not the point: 188 venues with duplicate photos is launch-blocking, and adding more venues while the dedup is unshipped increases the dedup workload.

The 5 new venues stay — they passed validation, they improve geographic diversity, and reverting them creates more churn. But the freeze holds going forward.

**DECISION: Venue additions are FROZEN until photo-dedup-YYYY-MM-DD.diff ships and auto-push commits it. Content agent: photo dedup is the ONLY task until it's done. No new venues, no tag cleanup, no rating adjustments. Every content agent cycle goes to generating unique Unsplash IDs for the 170 remaining duplicates.**

---

### Decision 2: OBX near-dup moves to known-skipped. Final.

Five consecutive content reports. The two Outer Banks entries (`beach_ob` / `outer-banks-nags-head-t7`) are 45km apart, both served by ORF, but represent different beaches with different characters. The near-dup is intentional product design, not a data error. No merge.

**DECISION: OBX near-dup is known-skipped. Off the checklist. Off the content report. Not a launch gate.**

---

### Decision 3: VPS escalates from P1 to P0 at Day 3. Jack must act today.

v56 called VPS "P0" in the PM report but "P1" in some devops contexts. This matters because it sets expectations. At Day 3 with launch in 8 days, it's unambiguously P0:

- Flight pricing is dark for every user right now
- Open-Meteo rate-limit risk starts at 66 concurrent DAU (plausible on Reddit day)
- The June 21 launch gate requires VPS `/health` green with `wx_cache_size > 0`

**DECISION: VPS is P0 as of June 13. If it is not fixed by end of June 14, the June 21 launch date moves to June 28. Jack has 36 hours.**

---

## This Week's Top 3 Priorities Only

**1. Jack: SSH + VPS fix. Today. June 13. Not tomorrow.**
`ssh root@198.199.80.21 "pm2 status && curl -s localhost:3001/health | head -20"`
If 403: DuckDNS token may have expired (free tier requires ping every 30d) or Caddy config needs restart after kernel upgrade. DevOps runbook covers both paths. This is the same 10-minute fix it's been for 3 days.

**2. Content agent: Photo dedup patch delivered by June 14 EOD.**
188 venues with duplicate Unsplash photos. The duplicate map is in the June 13 content report — exact photo IDs, exact venue lists, exact counts. Generate unique IDs (Unsplash source + venue title/location as seed query is sufficient), write as a ready-to-ship diff, ship it. This is the only content task. Everything else waits.

**3. Jack: Pre-launch incognito audit on June 15 (after P0s close).**
Set home airport to JFK. Open Explore on mobile. Confirm: (a) ≥8 cards visible, (b) unique photos on first scroll, (c) prices render (not `~$—`), (d) Book CTA goes to Aviasales/Booking.com directly. If any fail, that's the fix scope for June 16–17. Don't do this audit until VPS is back — the pricing check is meaningless while it's dark.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| New venue additions | **FROZEN** | Until photo dedup ships. More venues = more dedup debt. |
| OBX near-dup merge | **CLOSED → known-skipped** | Fifth report, intentional design. Off the list. |
| Tag cleanup (thin batch tags) | **DEFER post-launch** | P3. Not a launch gate. Photo dedup takes priority. |
| Cloudflare CDN in front of GH Pages | **DEFER** | Good idea, pre-Reddit hardening. But not a Day-8 task. After VPS is fixed. |
| App Store submission | **DEFER to post-1K web users** | APNS parked, account deletion SQL pending, LLC not approved. Web launch first. |
| GitHub PAT renewal | **CLOSED PERMANENTLY** | No live consumer. v55 wrong to flag it. CLAUDE.md §Open #15. Final. |
| Peakly Pro | **CUT for v1. Final.** | No UI exists. Not a task. |
| Hotels in deal score | **CUT. Final.** | v2. |

---

## Pre-Launch Checklist — June 13

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (3 sites) | ✅ |
| 3 | GEAR_ITEMS: 0 | ✅ |
| 4 | Sentry DSN non-empty | ✅ |
| 5 | Seasonal default beach N-hem June | ✅ |
| 6 | lateSeason flags (27 ski venues) | ✅ |
| 7 | Cache stamp lockstep `20260610af` | ✅ |
| 8 | JSON-LD structured data | ✅ |
| 9 | Static H1 fallback | ✅ |
| 10 | ScoringExplainer (one-time card) | ✅ |
| 11 | Grid sorts by weekendScore | ✅ |
| 12 | Image lazy loading (9/9 tags) | ✅ |
| 13 | OG/JSON-LD venue count `350+` | ✅ (fixed June 13) |
| 14 | skiPass 100% on ski venues | ✅ (fixed June 13) |
| 15 | AP_CONTINENT complete | ✅ (fixed June 13) |
| 16 | **Photo dedup (188 venues)** | ❌ **P0 — due June 14** |
| 17 | **VPS `/health` green** | ❌ **P0 — Jack, today** |
| 18 | Plausible domain validated | ❓ Jack: confirm in dashboard |
| 19 | Reddit account karma >100 | ❌ Jack, June 18–20 |
| 20 | Reddit post written | ❌ Jack, June 18–20 |
| 21 | Account deletion SQL pasted in Supabase | ❌ Jack (App Store gate, not Reddit gate) |
| 22 | Pre-launch incognito mobile audit | ❌ Jack, June 15 (after P0s close) |
| 23 | Stale `claude/*` branches reviewed + deleted | ❌ Jack, 15 min |

**15 of 23 green. 2 are launch gates (#16, #17). Everything else is polish, post-launch, or Jack-minutes.**

---

## Revenue Model — June 13

| Stream | Code Status | RPM/1K MAU |
|--------|-------------|------------|
| Amazon Associates | ❌ CUT (GEAR_ITEMS = 0) | $0 |
| Booking.com (`aid=2311236`) | ✅ | $6.90 |
| SafetyWing (`referenceID=peakly`) | ✅ | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ Code / ❌ VPS 403 | $0.14 (dark) |
| REI (Avantlink) | LLC pending | +$6.16 |
| Backcountry / GYG | LLC pending | +$1.84 |

**Live RPM when VPS restored: $7.58/1K MAU.** Currently dark on Travelpayouts. LLC doubles to ~$15.67 when approved.

---

## 90-Day Projection — June 13

| Scenario | Users (90d) | Gate |
|----------|-------------|------|
| Both P0s close by June 15 + Reddit June 21 top-10 | **6K–8K** | Jack SSH today, photo dedup June 14, post lands well |
| P0s close June 16 + June 21 launch | **4K–6K** | Visual quality ok, prices visible. Tight but viable. |
| Launch slips to June 28 | **3K–5K** | Still summer. One week costs ~20% of 90d projection. |
| No launch by July 14 | **<2K** | Half the summer beach window gone. 100K slips to 2027. |

**For 8K not 5K:** Both P0s close before June 15 AND post reaches top-10 karma in r/solotravel within 6 hours. The price+conditions combo is the product pitch — if prices are dark on launch day, the hero demo fails.

---

## One Product Risk Nobody Is Talking About

**There is no server-side rate-limit protection for launch day without the VPS.**

On Reddit launch day, if the post hits top-10 in r/solotravel with 50K+ readers, even 0.5% click-through is 250 simultaneous users. At 250 DAU, 358 venues × weather + marine calls = potentially thousands of Open-Meteo requests within seconds of the first user load. Open-Meteo's free tier is ~600 requests/minute. The math is tight.

The VPS weather cache (2hr shared LRU, 4000 entries) is the solution. One upstream call per (lat, lon) per 2 hours, regardless of how many users hit the same venue. It's already built, deployed, and was confirmed working on June 10. But it's been serving 403s for 3 days.

The irony: the hardening that Jack built specifically for the Reddit spike is offline for the week before the Reddit spike. If the VPS doesn't come back before June 21 and the post goes viral, users will see a slow, degraded app. The Explore grid will take 30+ seconds to fill. People will leave. The thread will say "cool idea but it's really slow."

This is the single highest-leverage action in the product right now and it takes 10 minutes. The risk is not theoretical — it's the exact scenario the VPS was built for.

---

*Report written: 2026-06-13 | PM v57 | Build: 20260610af | Venues: 358 (130 ski / 228 beach)*
