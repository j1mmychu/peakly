# Peakly PM Report — 2026-06-12 (v56)

> Supersedes v55 (June 11). **Status: YELLOW.** VPS still 403 (Day 2 — Jack has not SSH'd). Photo duplication worsened to 211 venues (60%). PAT expiry flagged by v55 as P0 is **wrong** — traced to no live consumer on June 10 and already closed in CLAUDE.md. Launch date June 21 holds. Nine days. Both P0s are fixable in the next 48 hours if Jack acts on VPS today.
>
> _Rolling file — v55 archived to context by reference._

---

## Shipped Since v55 (2026-06-11 → 2026-06-12)

| What | Verdict |
|------|---------|
| **Image lazy loading confirmed** — DevOps verified 9/9 `<img>` tags have `loading="lazy"` | ✅ Closes the "unverified" finding from v55. |
| **Daily DevOps + Content reports** (June 12) | ✅ Both ran. VPS still down, photo dedup worsened, 5 AP_CONTINENT gaps confirmed. |
| **No app.jsx changes** | ✅ Correct. Cache stamp `20260610af` is unchanged — nothing new to bump on. |

**Code state June 12 (verified by DevOps report):**
- `app.jsx`: 13,021 lines · `PEAKLY_BUILD = "20260610af"` · balanced 5,509/5,509 braces
- **353 venues** (130 ski / 223 beach) — eval-counted ✅
- **GEAR_ITEMS: 0** — Amazon CUT confirmed ✅
- Sentry DSN: active (`9416b032…`) ✅
- Cache stamp lockstep: `20260610af` in app.jsx / sw.js / index.html ✅
- **VPS proxy: 403 🔴** (Day 2)
- **Photo duplication: 211 venues (60%) 🔴** (Day 2 — worsened from 208)

---

## Bug Triage — June 12

| Item | Severity | Days Open | Status |
|------|----------|-----------|--------|
| **VPS 403 (DuckDNS/Caddy post-reboot)** | **P0** | **Day 2** | Jack: SSH to 198.199.80.21. Runbook in v55 §Decision 2. 10 minutes. Every day without this is a day flight prices are invisible to all users. |
| **Photo duplication: 211 venues (60%)** | **P0** | **Day 2** | Agent generates unique-photo patch. 2–3 hours scripted. Launch cannot happen with 18 identical beach photos on the grid. See below for fix plan. |
| ~~GitHub PAT expires June 15~~ | ~~P0~~ | **CLOSED** | **v55 wrong to re-flag this.** CLAUDE.md traced June 10: PAT has no live consumer. Auto-push uses SSH (`git@github.com:`). Expiry is a non-event. Removing from checklist. Final. |
| 5 venues with AP missing from AP_CONTINENT | P2 | Day 2 | One-liner fix. Batch: content agent next run. |
| 13 stale `claude/*` branches on remote | P2 | Day 1 | Review `claude/improve-scoring-system-XYGY6` before bulk-deleting — CLAUDE.md explicitly prohibits scoring changes without critique. Jack or agent: `git diff main...origin/claude/improve-scoring-system-XYGY6 -- app.jsx`. If it's dead weight, bulk-delete the whole set. |
| Outer Banks near-dup | P3 | Day 15+ | DEFER post-launch. Final. |
| SRI on CDN scripts | P3 | Day 43+ | DEFER post-launch. Final. |
| CSP meta | P3 | Day 43+ | DEFER post-launch. Final. |

**P0 count: 2 (unchanged from yesterday). No regression. No escalation. Same two fires that need the same two actions.**

---

## Known Blockers

| Blocker | What It Unlocks | Owner | ETA |
|---------|----------------|-------|-----|
| **VPS 403 fix** | Flight pricing, weather cache, CORS | Jack, SSH | **Today — overdue** |
| **Photo deduplication (211 venues)** | Explore grid looks like a product | Agent | **June 14** |
| LLC approval | REI (+$6.16), Backcountry (+$0.64), GYG (+$1.20) | External | Unknown |
| Account deletion SQL | App Store Guideline 5.1.1(v) | Jack | Before App Store submit |
| Reddit launch | 5K–8K user acquisition | Jack | **June 21 — hard date** |

---

## Explicit Product Decisions — June 12

### Decision 1: PAT expiry is CLOSED. Remove from all checklists. Final.

v55 listed "GitHub PAT expires 2026-06-15" as P0. This is incorrect and was already resolved in CLAUDE.md on June 10:

> "GitHub PAT #15 RESOLVED 2026-06-10 — traced: the PAT has NO live consumer. The token (peakly-vps-deploy) was created for VPS git-pull deploys that were never wired up. Repo is public (no auth needed for raw.githubusercontent fetches). Local pushes are SSH (git@github.com:). VPS has no git repo (/opt/peakly-proxy is hand-copied). Expiry on 06-15 breaks nothing."

The auto-push pipeline uses `git push origin main` via SSH, not the PAT. The PAT was created for a git-deploy workflow that was never implemented. v55 re-flagged a resolved item, likely because that run didn't have access to the updated CLAUDE.md. This decision is final — removing PAT from checklist items 14 and forward.

**DECISION: PAT #15 is CLOSED. Off the list. If the agent re-flags it, point to this decision and CLAUDE.md §Open #15.**

---

### Decision 2: Photo dedup is an agent task, not a Jack task. Scope it now.

The Content report has already done the hard analysis — we know exactly which 211 venues are affected and which 20 Unsplash photo IDs are overused (down to the count: 28 venues share one ski photo, 23 share another, etc.). This is a scripted content operation, not product design.

**Scope for Content agent:**
- Skip original compact-format venues (Whistler, Aspen, Vail, etc.) — they have curated photos
- Generate unique Unsplash IDs for all 211 batch venues (photo IDs in the `w=800&h=600&fit=crop` format already used)
- Output as a ready-to-ship diff to `reports/ready-to-ship/photo-dedup-YYYY-MM-DD.diff`
- One commit, auto-push ships it

**Time estimate:** 2–3 hours for the agent run. Auto-push handles the rest. Target: DONE by June 14 EOD.

**DECISION: Content agent runs photo dedup as its top priority on the next scheduled or on-demand run. Until this ships, venue additions are FROZEN.**

---

### Decision 3: June 21 launch date is locked. No further extensions.

Two P0s, 9 days out. Timeline:
- June 12 (today): Jack VPS fix + PAT false alarm closed
- June 13–14: Photo dedup patch shipped
- June 15–17: End-to-end smoke test on live site (VPS green, unique photos, ≥8 cards, prices render)
- June 18–20: Reddit post written + account karma verified
- June 21: Post to r/solotravel + r/frugaltravel

If the VPS fix doesn't happen by June 14, launch slips to June 28. Summer beach window is open through September — one more week doesn't crater the 90-day projection — but two weeks of drift becomes a pattern. **June 21 is the last date that doesn't require explaining a "why did it take so long" to yourself.**

**DECISION: June 21. Hard gate: (1) VPS `/health` returns `200` with `wx_cache_size > 0`, (2) Explore grid shows unique photos on first scroll, (3) ≥8 cards visible from a US beach filter. Any gate fails → June 28. No further dates discussed until one of those two passes.**

---

## This Week's Top 3 Priorities Only

1. **Jack: SSH + VPS Caddy/DuckDNS fix. Today. Not tomorrow.** Flight pricing has been dark for 2 days. Every user who opens the app sees `~$—` on every card. The product's core value prop — "cheap flight + good conditions" — is invisible. This is 10 minutes of work that's been sitting for 48 hours. Runbook: v55 §Decision 2.

2. **Content agent: Photo dedup patch, delivered by June 14.** 211 venues with duplicate photos is the other launch-blocking embarrassment. The analysis is done; the implementation is a scripted loop. Generate unique Unsplash IDs for the 211 affected batch venues, output as a diff, ship it.

3. **Jack: Review + bulk-delete stale `claude/*` branches.** 13 stale branches including one named `improve-scoring-system` — which per CLAUDE.md requires an algorithm critique before touching. Diff it, confirm it's dead weight, delete everything. Pre-App-Store hygiene. 15 minutes.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| GitHub PAT renewal | **CLOSED PERMANENTLY** | No live consumer. v55 was wrong. CLAUDE.md §Open #15. Final. |
| Peakly Pro price fix | **NOT A TASK** | UI removed April 16. No price renders. Off the list. |
| App Store submission | **DEFER to post-1K web users** | APNS parked, account deletion SQL pending, LLC not approved. |
| Additional venue adds | **FROZEN** | Until photo dedup ships. More venues = more dedup debt. |
| Surfing / climbing / MTB / hiking categories | **CUT permanently** | Skiing + beach only until 100K validates the brand. |
| OBX near-dup merge | **DEFER post-launch** | P3. No conversion impact. |

---

## Pre-Launch Checklist — June 12

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (3 sites in app.jsx) | ✅ |
| 3 | GEAR_ITEMS: 0 (Amazon CUT holds) | ✅ |
| 4 | Sentry DSN non-empty (`9416b032…`) | ✅ |
| 5 | Seasonal default beach N-hem June | ✅ |
| 6 | lateSeason flags (27 ski venues) | ✅ |
| 7 | Cache stamp `20260610af` lockstep | ✅ |
| 8 | JSON-LD structured data | ✅ |
| 9 | Static H1 fallback | ✅ |
| 10 | ScoringExplainer (one-time card) | ✅ |
| 11 | Grid sorts by Weekend Score | ✅ |
| 12 | Image lazy loading (9/9 `<img>`) | ✅ |
| 13 | **Photo deduplication (211 venues)** | ❌ **P0 — agent task, due June 14** |
| 14 | **VPS proxy `/health` green** | ❌ **P0 — Jack SSH, overdue** |
| 15 | ~~GitHub PAT renewed~~ | **N/A — CLOSED** (no live consumer) |
| 16 | Plausible domain validated | ❓ Jack: confirm `j1mmychu.github.io` active in dashboard |
| 17 | Reddit account karma verified (>100 in target sub) | ❌ Jack, June 18–20 |
| 18 | Reddit post written | ❌ Jack, June 18–20 |
| 19 | Account deletion SQL pasted in Supabase | ❌ Jack (App Store, not launch gate) |
| 20 | 5 venues with AP missing from AP_CONTINENT | ❌ P2, agent batch fix |
| 21 | Pre-launch incognito mobile audit | ❌ Jack: ≥8 cards, unique photos, prices render |

**13 of 21 green. 2 are launch gates (13, 14). Everything else is polish or post-launch.**

---

## Revenue Model — June 12

| Stream | Code Status | RPM/1K MAU |
|--------|-------------|------------|
| Amazon Associates | ❌ CUT (`grep -c GEAR_ITEMS app.jsx` → 0) | $0 — revisit post-launch |
| Booking.com (`aid=2311236`) | ✅ app.jsx live | $6.90 |
| SafetyWing (`referenceID=peakly`) | ✅ app.jsx live | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ Code · ❌ VPS 403 | $0.14 (dark until VPS fixed) |
| REI (Avantlink) | LLC pending | +$6.16 |
| Backcountry / GetYourGuide | LLC pending | +$1.84 |

**Live RPM (VPS up): $7.58/1K MAU.** Dark today — Travelpayouts calls returning null. VPS fix restores full revenue stack.

---

## 90-Day Projection

| Scenario | Users (90d) | What Has to Be True |
|----------|-------------|---------------------|
| Both P0s fixed + Reddit June 21 top-10 | **6K–8K** | Jack SSH today, photo dedup by June 14, post lands well |
| VPS fixed but photo dedup slips to launch day | **3K–5K** | First impressions hurt. Bounce rate elevated. Screenshots don't spread. |
| Launch slips to June 28 | **4K–6K** | Still viable. One week doesn't crater summer. Two weeks starts to. |
| No launch by July 15 | **<2K** | Summer half-consumed, organic SEO only, 100K slips to 2027 |

**For 8K not 5K:** Both P0s are fixed *before* launch (not same day). Post hits top-10 karma in r/solotravel within 6 hours. Second post in r/frugaltravel within 72h. None of this requires new engineering — it requires Jack to act on two already-diagnosed issues.

---

## One Product Risk Nobody Is Talking About

**The beach sort algorithm surfaces tropical venue clusters, not the best beach in the world.**

With 223 beach venues sorted by `weekendScore`, the June grid from any US home airport (JFK, LAX, ORD, DFW) will show Caribbean and Mexican Pacific venues dominating the top 10 — not because they're uniquely good, but because Open-Meteo gives every Caribbean island near-identical forecast data in June (30°C, UV 10–11, <20% precip). Cancún, Tulum, and Playa del Carmen will score within 1–2 points of each other.

A user who knows the Caribbean will see this as arbitrary ranking. "Why is Playa del Carmen above Tulum? They're 60km apart and the weather is identical." They'll assume the algorithm is broken.

**What breaks the tie correctly:** Travelpayouts price. A $180 Cancún fare vs. a $340 Cozumel fare is the actual differentiator. But until the VPS is fixed, price signals are dark — so the tie-breaking signal the algorithm needs most is exactly the one that's currently offline.

**Two fixes, one is urgent:** (1) Fix the VPS so price actually differentiates the Caribbean cluster. (2) After the VPS is fixed, audit the top 10 beach results from JFK, LAX, ORD, DFW — if the top 10 is still >5 Caribbean venues with scores within 2pts, add a "one per region" dedup to the carousel header only (not the full grid). The full grid can show duplicates; the hero carousel is what users screenshot and share.

The carousel dedup is a 30-minute fix. But it's premature until the VPS is live and price signal is back. Don't build it yet — validate first.

---

*Report written: 2026-06-12 | PM v56 | Build: 20260610af | Venues: 353 (130 ski / 223 beach)*
