# Peakly PM Report — 2026-06-14 (v58)

> Supersedes v57 (June 13). **Status: YELLOW → RED on launch urgency.** Code is healthy. The two v57 P0s (photo dedup, VPS) have both resolved: photo dedup shipped June 13 (max repeat 26×→3×), VPS was a sandbox false alarm — confirmed healthy June 10, 4 days ago. The live site is solid. **But there is no Reddit post. The summer-beach window is now 6 weeks from peak. Every week that slips costs ~10% of the 90-day user projection.** The only variable left is whether Jack pulls the trigger.

---

## v57 Corrections (log for the record — don't re-raise these)

| v57 Claim | Reality |
|-----------|---------|
| "VPS 403 — Day 3, P0" | **Sandbox false alarm.** v57 was written from a network-blocked Cowork sandbox; DuckDNS was unreachable from that environment. VPS confirmed healthy June 10 evening (Jack SSH'd — kernel patched, pm2 up). 4 days unverified, not 3 days down. |
| "Photo dedup NOT DONE — Day 3, P0" | **Shipped June 13 (commit `a143e4c`).** `scripts/photo-dedup.cjs` round-robin redistribution. Max repeat 26×→3×. 131 distinct photos across 358 venues. Live. |
| Checklist items #16/#17 ❌ | Both flip to ✅. Checklist is now 17/23 green (see below). |

---

## Shipped Since v57 (2026-06-13 → 2026-06-14)

| What | Verdict |
|------|---------|
| **Photo dedup** — max repeat 26×→3×, `scripts/photo-dedup.cjs` | ✅ Right call. Real visual quality issue, now solved. |
| **skiPass 100% complete** — all 130 ski venues backfilled | ✅ Closes the long-running P2. |
| **5 AIRPORT_COORDS patched** — TGD, OKA, SID, DJE, FUE | ✅ Real bug (flight-time filter bypass for 5 venues). Fixed. |
| **OG/JSON-LD count** updated `150+`→`350+` | ✅ Social unfurls were lying. Fixed. |
| **Leaflet lazy-loaded** off critical path | ✅ ~45KB off first parse. Meaningful. |
| **DEAL_WEIGHT comment updated** — ScoreBreakdown now shows 75/25 | ✅ Documentation honesty. |
| **+5 beach venues** (Budva, Okinawa, Sal Island, Djerba, Fuerteventura) | ⚠️ Freeze violation (v56 §D2). Venues stayed per v57. But freeze re-asserts now. |
| DevOps + Content reports filed today | ✅ Pipeline running. |

**Code state June 14 (DevOps verified):**
- `app.jsx`: 13,129 lines · cache `20260613n` · braces 5,531/5,531
- **358 venues** (130 skiing / 228 beach)
- GEAR_ITEMS: 0 ✅ · Sentry DSN: active ✅ · ALERTS_AVAILABLE: gated ✅
- `deleteAccount()`: wired ✅ · `weatherDown` banner: live ✅
- Image lazy loading: all `<img>` tags ✅

**DEAL_WEIGHT — permanently closed finding:** The 0.5→0.25 change was a deliberate commit `18606a7` (May 13, "Scoring honesty pass"). Code and `ScoreBreakdown` UI now agree (75/25). CLAUDE.md scoring section needs a one-line update to match. That's the entire delta. Not a revert candidate — 75/25 is the better product decision (conditions dominate, price is a secondary nudge).

---

## Bug Triage — June 14

| Bug | Severity | Days Open | Status |
|-----|----------|-----------|--------|
| **Web launch: no Reddit post** | **P0 (business)** | Day 7 post-code-freeze | Jack only. Product is done. |
| **VPS unverified 4 days** | **P1 → P0 pre-launch** | 4 days since last confirm | Jack: `ssh root@198.199.80.21 'pm2 status && curl -s http://localhost:3001/health'`. Verify before the post goes live. If pm2 is down during a spike, the grid degrades exactly when it matters. |
| **Supabase SQL paste** (`server/sql/delete-account.sql`) | P0 for App Store (not web) | 4 days unactioned | 2 min. Paste into Supabase SQL editor. Unblocks 5.1.1(v). |
| Eager Supabase `<script>` at `index.html:85` | P2 | 38 days | Diff at `reports/ready-to-ship/eager-supabase-delete-2026-06-11.diff`. `git apply`. 30 sec. Has been 30 sec for 38 days. |
| DEAL_WEIGHT CLAUDE.md out of date | P3 | 5 weeks | One-line edit. Next agent run. |
| 13 stale `claude/*` remote branches | P2 | 1 week | Jack, 15 min, pre-App-Store hygiene. |
| SRI on React/ReactDOM/Supabase | P3 | 40+ days | DEFER post-launch. Final. |
| CSP | P3 | 40+ days | DEFER post-launch. Babel unsafe-eval makes strict CSP impossible. |

**Closed permanently (last time these appear):**
- OBX near-dup → known-skipped (v57 D2). Not a merge candidate.
- Peakly Pro price discrepancy → Pro UI removed April 16. No price in product.
- Sentry DSN empty → active at `app.jsx:7`. Not empty.
- Cache buster stale → `20260613n`, lockstep. Auto-bump structural since June 8.

---

## Known Blockers

| Blocker | What It Unlocks | Effort | Days Stalled |
|---------|----------------|--------|-------------|
| **Jack posts to Reddit** | Users. Traffic. The 100K goal. | 1 post, ~15 min to write | 7 |
| **VPS SSH verify** | Confident launch — cache absorbs spike, no 429s | 5 min | 4 |
| **Supabase SQL paste** | iOS submission 5.1.1(v) | 2 min | 4 |
| **Eager-Supabase diff apply** | ~80KB off anonymous first paint | 30 sec | 38 days |
| Apple Developer enrollment ($99) | iOS App Store queue | ~1–2h + Apple wait | 14+ |
| LLC approval | REI +$6.16, Backcountry/GYG +$1.84 per 1K MAU | External | External |

---

## Explicit Product Decisions — June 14

### Decision 1: Web launch this weekend. Hard date. No more drift.

The code has been launch-ready since June 10. Photo dedup shipped. VPS confirmed healthy June 10. Pre-launch checklist is 17/23 green; the remaining 6 are Jack-manual or post-launch polish. **There is no technical reason to wait.** The business reason to move immediately is clear: the summer-beach window (the product's strongest seasonal demand driver) has 6 weeks left at peak. Slipping to July costs ~20% of the 90-day user projection. Slipping to August costs the entire window.

**DECISION:** Jack posts to r/solotravel this weekend (June 14–15). First-person, real airport, real venue, real number. r/solotravel first, r/frugaltravel 1 hour later. No simultaneous cross-posts. Before posting: SSH and verify VPS (5 min). That's the full pre-launch checklist from today's perspective.

### Decision 2: iOS launch is permanently decoupled from web launch.

Apple enrollment hasn't started in 14+ days. iOS live date at current pace = mid-July at best (enrollment → Xcode build → review queue → approval). That's half the summer window gone. **DECISION:** Web PWA launches this weekend with zero iOS dependency. App Store follows whenever it follows — the summer-beach metric runs on web traffic, not App Store ranking. Stop treating them as coupled. They are not.

### Decision 3: DEAL_WEIGHT 75/25 is the documented decision. Accept it. Close the finding.

The May 13 scoring honesty pass (`18606a7`) changed the weight from 50/50 to 75/25 conditions/price with a clear commit message and rationale (conditions dominate; a cheap flight to a rainy weekend shouldn't outrank an expensive flight to a perfect powder day). This is a better product decision than the original 50/50. **DECISION:** 75/25 stays. CLAUDE.md scoring section gets a one-line update in the next agent run. The DevOps finding is closed. Do not revert.

---

## This Week's Top 3 Priorities Only

**1. Jack: VPS verify + Reddit post this weekend.**

In order:
```bash
# Step 1: verify VPS (5 min)
ssh root@198.199.80.21 'pm2 status && curl -s http://localhost:3001/health | python3 -m json.tool'
# Expected: pm2 online, wx_cache_size > 0
# If stopped: pm2 restart peakly-proxy && pm2 save

# Step 2: post to r/solotravel (Saturday morning PST)
# First person. Real airport. "I built a thing that finds the best beach weekend
# to fly to — here's what it showed me from SFO this week."
```

**2. Jack: Supabase SQL paste (2 min).**
Open `server/sql/delete-account.sql` → paste into Supabase SQL editor → run. Unblocks App Store 5.1.1(v). Every day it sits unpasted delays the iOS path. This is genuinely 2 minutes.

**3. Agent: Apply eager-Supabase diff (30 sec).**
```bash
cd ~/peakly && git apply reports/ready-to-ship/eager-supabase-delete-2026-06-11.diff
```
Has been ready since June 11. ~80KB off every anonymous first paint. Fast-boot matters when a Reddit post sends 500 first-time visitors in an hour.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| New venue additions | **REJECTED — freeze holds** | Catalog at 358. Open-Meteo free-tier headroom is the constraint. Don't add until post-launch data says which venues users actually want. |
| Tag enrichment (279 thin venues) | **DEFER July** | P3. Affects Powder Day filter breadth only. Post-launch sprint. |
| Cloudflare CDN in front of GH Pages | **DEFER** | Good pre-spike idea. Do it after the post lands and traffic is real. Week 2. |
| App Store submission | **DEFER — after web launch data in** | APNS parked, Supabase SQL pending, LLC pending. Web-first. |
| SRI + CSP | **DEFER July** | Babel unsafe-eval makes strict CSP impossible. Not a launch gate. |
| Hotels in deal score | **CUT. Final.** | v2. |
| Peakly Pro UI | **CUT for v1. Final.** | Post-1K MAU. |
| Wishlists / Trips tab | **LOCKED at 1K MAU gate** | No change. |

---

## Pre-Launch Checklist — June 14

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (3 sites) | ✅ |
| 3 | GEAR_ITEMS: 0 | ✅ |
| 4 | Sentry DSN non-empty | ✅ |
| 5 | Seasonal default beach N-hem June | ✅ |
| 6 | lateSeason flags (27 ski venues) | ✅ |
| 7 | Cache stamp lockstep `20260613n` | ✅ |
| 8 | JSON-LD structured data | ✅ |
| 9 | Static H1 fallback | ✅ |
| 10 | ScoringExplainer (one-time card) | ✅ |
| 11 | Grid sorts by weekendScore | ✅ |
| 12 | Image lazy loading (all tags) | ✅ |
| 13 | OG/JSON-LD venue count `350+` | ✅ (fixed June 13) |
| 14 | skiPass 100% on ski venues | ✅ (fixed June 13) |
| 15 | AP_CONTINENT complete | ✅ (fixed June 13) |
| 16 | Photo dedup (max repeat ≤3×) | ✅ (shipped June 13) |
| 17 | `book_click` + ToS/Privacy links | ✅ (committed June 10) |
| 18 | **VPS `/health` green** | ❓ Jack: verify before posting (5 min) |
| 19 | **Plausible domain validated** | ❓ Jack: confirm in Plausible dashboard |
| 20 | **Reddit account karma check** | ❌ Jack: verify account age + karma before posting |
| 21 | **Reddit post written + posted** | ❌ Jack, this weekend |
| 22 | **Pre-launch incognito mobile audit** | ❌ Jack: incognito, set SFO, confirm ≥8 cards + prices + CTAs |
| 23 | Account deletion SQL pasted in Supabase | ❌ Jack (App Store gate, not Reddit gate) |

**17 of 23 green. 6 remaining: 2 are "verify" checks (5 min each), 4 are launch-day execution tasks. No more code to write.**

---

## Revenue Model — June 14

| Stream | Status | RPM/1K MAU |
|--------|--------|------------|
| Booking.com (`aid=2311236`) | ✅ Live | $6.90 |
| SafetyWing (`referenceID=peakly`) | ✅ Live | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ Live (pending VPS verify) | $0.14 |
| Amazon Associates | ❌ CUT for v1 (Jack, June 9) | $0 |
| REI (Avantlink) | LLC pending | +$6.16 unlocked |
| Backcountry / GetYourGuide | LLC pending | +$1.84 unlocked |

**Live RPM: $7.58/1K MAU.** LLC approval → ~$15.58. At 5K MAU (90d conservative): $38/mo. At 10K: $76/mo. Revenue doesn't get interesting until 25K+ MAU. Launch is the only lever right now.

---

## 90-Day Projection — June 14

| Scenario | Users (90d) | What Has to Be True |
|----------|-------------|---------------------|
| Post this weekend + VPS live + top-10 karma | **7K–9K** | Post lands in r/solotravel top-10 within 6h. Grid shows ≥8 strong beach cards. Prices render (not `~$—`). Jack replies to every comment in the first 3h. |
| Post this weekend + VPS down | **1K–2K** | Grid degrades under spike. "Broken/slow" becomes the comment thread narrative. Sticky. |
| Launch slips to July 1 | **4K–6K** | Still summer. But peak FOMO window (late June) is gone. |
| No launch until August | **<1K** | Beach window over. Ski season ~November. 100K goal slips to 2027. |

**For 9K not 7K:** VPS confirmed before posting, post goes up Saturday 9–11am PST (peak r/solotravel engagement), Jack's Reddit account has enough karma to escape automod, first 10 comments turn into conversation not "how is this different from KAYAK."

---

## One Product Risk Nobody Is Talking About

**The product assumes users know which weekend they're planning for. Many don't.**

The hero copy and scoring are built around "this weekend" — Fri–Mon, upcoming. That's the product's honesty anchor and it's correct. But the onboarding card (`ScoringExplainer`) explains *how* scoring works, not *when* it applies. A new user who opens Peakly on a Tuesday sees scores for the upcoming weekend 4 days out — which is actually the best forecast window. A user who opens on Sunday sees scores for *next* weekend (8 days out), where some venues will be filtered out for low confidence — and the grid will silently be thinner.

This isn't a bug. The behavior is correct. But it's invisible to the user. They don't know why Chamonix disappeared from the grid on Sunday when it was there on Friday. The `confidence: "low"` filter is doing its job honestly, but the empty space where Chamonix was reads as "broken," not "honest."

**What to monitor post-launch:** Look for comments in the Reddit thread saying "where's X?" or "I don't see many ski options." If that pattern emerges, the fix is a one-line explainer in the empty state: "Some spots don't appear until the forecast is reliable — check back Thursday–Saturday for next weekend's picks." 20 minutes. Worth tracking before building.

---

*Written 2026-06-14 | PM v58 | Build: 20260613n | Venues: 358 (130 ski / 228 beach)*
