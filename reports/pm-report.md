# Peakly PM Report — 2026-06-10 (v54)

> Supersedes v53 (June 9). **Status: AMBER.** Code healthy. Two Jack-only P0s with hard walls. New conflict: DevOps restored GEAR_ITEMS this morning against Jack's June 9 CUT decision — needs explicit resolution today, not left dangling.
>
> _Rolling file — v53 archived to context by reference._

---

## Shipped Since v53 (2026-06-09 → 2026-06-10)

| What | Verdict |
|------|---------|
| **UX sweep** — Explore decluttered (saved-venues pill removed), category pills enlarged, saved venues relocated to Profile tab | ✅ Right call. Cleaner top-of-funnel. |
| **+14 S. hemisphere ski venues** — Cardrona, Mt Hutt, Falls Creek, Mt Buller, Mt Hotham, Charlotte Pass, Nevados-de-Chillán, La Parva, El Colorado, Corralco, Cerro Catedral, Las Leñas, Chapelco, Caviahue | ✅ Critical for summer ski inventory. These are the right 14. |
| **ScoringExplainer** — one-time dismissible "How Peakly scores your weekend" card in Explore | ✅ Trust-builder. Shipped cleanly. |
| **Auto-push invariant guard** — brace balance + cache-stamp lockstep + venue-count floor in `scripts/auto-push.sh` | ✅ Structural improvement. Residual gap: venue guard still uses grep (blind to JSON-format batch entries). Fix when VPS SSH happens. |
| **Grid sorts by Weekend Score** — `applyFilters` default keys on `weekendScore`; "Best conditions" → "Best weekend" | ✅ Correct — moat score should lead. |
| **DevOps restored GEAR_ITEMS** (commit `c112b51`, this morning) | ⚠️ **CONFLICTS with Jack's June 9 CUT decision.** Decision 1 below. |
| **Cache stamp** → `20260610a` | ✅ |

**Code state June 10 (actual):**
- app.jsx: ~12,500+ lines · PEAKLY_BUILD = `20260610a`
- **353 venues** (116 ski / 223 beach + 14 southern-hemi ski) — eval-counted. Content agent counted 156 due to grep limitation; disregard that number.
- GEAR_ITEMS: **5 references — PRESENT and rendering** (DevOps restored this morning)
- Sentry DSN: active ✅
- SW: `peakly-20260610a` ✅

---

## Bug Triage — June 10

| Item | Severity | Days Open | Status |
|------|----------|-----------|--------|
| **GitHub PAT expires 2026-06-15** | **P0 (pipeline hard wall)** | **Day 3** | **Jack: 3 minutes. Today or tomorrow at latest.** |
| **VPS proxy unredeployed** | **P1 (67-DAU rate-limit cliff)** | **Day 37** | Jack: 3 min SSH. Structural blocker at any real traffic event. |
| **GEAR_ITEMS/Amazon conflict** | **P1 (product consistency)** | **Day 1** | DevOps restored against Jack's June 9 CUT. Needs explicit resolution — Decision 1. |
| CORS localhost origins in prod `proxy.js` | P2 | Day 7 | Bundle with VPS SSH — one session fixes both. |
| Auto-push venue guard uses grep (blind to JSON-format entries) | P2 | Day 1 | 5-min fix: swap grep for eval one-liner from `status.sh`. |
| June 4 venue recommendations unadded (6 days) | P2 | Day 6 | Verbier, Val Thorens, Yongpyong, Tenerife, Byron Bay — all unblocked. |
| S. hemisphere ski inventory: only 6 firing venues June–September | P2 | Ongoing | +14 venues shipped today helps; June 10 content recs add 3 more. |
| Outer Banks near-dup (`beach_ob` / `outer-banks-nags-head-t7`) | P3 | Day 14 | Differentiate or merge post-launch. |
| SRI on CDN scripts | P3 | Day 42+ | DEFER post-launch. Final. |
| CSP meta | P3 | Day 42+ | DEFER post-launch. Final. |

**Peakly Pro pricing ($9/mo vs $79/yr):** NOT a current bug. Pro UI is removed. No pricing renders. If Pro returns post-1K MAU, canonical price = $79/yr. Closing this loop permanently.

---

## Known Blockers

| Blocker | What It Unlocks | ETA |
|---------|----------------|-----|
| **GitHub PAT renewal** | Pipeline past June 15 | **5 days — Jack today** |
| **Amazon/GEAR_ITEMS decision** | Honest codebase + revenue model | **Jack today** |
| **VPS SSH + pm2 restart** | Weather cache (67-DAU cliff), CORS fix, weekend pricing | Jack — 3 min |
| LLC approval | REI (+$6.16/1K MAU), Backcountry, GYG | External — unblocked post-LLC |

---

## Explicit Product Decisions — June 10

### Decision 1: Amazon/GEAR_ITEMS — WHICH IS IT?

**The situation:** On 2026-06-09, Jack explicitly CUT Amazon for v1. CLAUDE.md was updated: "Amazon formally CUT for v1 — GEAR_ITEMS stays removed; revisit post-launch." Revenue model corrected to $7.58/1K MAU. This morning, DevOps restored GEAR_ITEMS without reading that decision. Amazon gear is now live-rendering in VenueDetailSheet.

**This is the third deletion + restoration cycle. The loop ends today.**

**Option A — Honor the CUT (recommended)**
- Revert DevOps's GEAR_ITEMS restoration (`git revert c112b51 --no-edit` or manual removal)
- Revenue model stays at $7.58/1K MAU — honest pre-launch number
- Add a guard to `scripts/auto-push.sh`: if GEAR_ITEMS is *absent* from app.jsx, it's expected; if DevOps restores it again, the PM grep flags it. Flip the invariant.
- Revisit Amazon post-launch when ASINs are verified live and LLC is approved

**Option B — Override the CUT, keep restoration**
- GEAR_ITEMS stays in, Amazon renders from today
- Update CLAUDE.md Revenue Model back to $12.06/1K MAU
- Add GEAR_ITEMS guard to auto-push (bash snippet from DevOps report §2) to prevent a fourth deletion
- Spot-check ASINs B09Y4TF9KN and B07PXMZGS8 for dead links before Reddit launch

**There is no Option C ("we'll see").** Whichever path: update CLAUDE.md, update the guard, stop re-opening this every 48 hours.

---

### Decision 2: PAT renewal — do it today, not Friday.

The window is 5 days. The action is 3 minutes. If it slips past June 14:
- `scripts/auto-push.sh` fails silently (no error, no alert, just no push)
- Every agent fix stays undeployed
- GitHub Pages freezes at last-shipped build
- Users see bugs that were fixed but never shipped

```
1. github.com/settings/tokens → token expiring 2026-06-15
2. Regenerate → 1 year → copy
3. Update credential store on auto-push machine
4. Update pm2 env on remote agents: pm2 set peakly-devops:GH_PAT "ghp_new"
```

**Decision: SHIP the renewal today. Not a choice.**

---

### Decision 3: June 10 venue sprint — SHIP the 3 no-patch venues today.

Content has 10 venues ready (June 4's 5 + June 10's 5). Of these, 3 require zero AP_CONTINENT patches and directly fill the peak-season S. hemisphere ski gap:
- **Cardrona Alpine Resort** (ZQN, already in `AP_CONTINENT`) — NZ's most-searched family resort; doubles firing ski inventory for the summer window
- **Las Leñas** (MDZ, already in `AP_CONTINENT`) — Argentina's premier powder, zero Argentina ski coverage today
- **Dunas de Maspalomas** (LPA, already in `AP_CONTINENT`) — year-round Canary Islands beach, first Gran Canaria venue

Two venues need AP_CONTINENT patches first (CTG for Cartagena, BRC for Bariloche). Add those patches, then ship all 5 of June 10's batch together. The June 4 backlog (Verbier, Val Thorens, Yongpyong, Tenerife, Byron Bay) is also unblocked — all APs present.

**Decision: SHIP up to 8 venues in one labeled commit this sprint. AP patches take 2 lines. Add in sequence: June 10's 5 first (S. hemisphere priority), then June 4's remaining 5 if capacity allows.**

---

## This Week's Top 3 Priorities Only

**1. Jack: PAT renewal (3 min, today).**
Five days to a hard wall. Everything else on this list is secondary if the pipeline dies June 15.

**2. Jack: Amazon/GEAR_ITEMS decision (10 min, today).**
Choose Option A or B. Update CLAUDE.md. Add the guard. The cycle ends with one explicit commit message: either "cut: remove GEAR_ITEMS per June 9 decision" or "keep: Amazon live for v1, guard added."

**3. Venue sprint + VPS (30 min total, this week).**
Add 8 venues in one labeled commit (fills S. hemisphere ski gap before the window closes September). Then SSH to 198.199.80.21 for the 3-minute VPS restart — required before any Reddit/HN traffic event.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Peakly Pro ($9/mo vs $79/yr pricing fix) | **NOT A TASK** | Pro UI removed. No price renders. Canonical future price = $79/yr. Stop listing this. |
| SRI + CSP hardening | **DEFER July** | Babel unsafe-eval regression risk. Needs browser testing. Post-launch. |
| Hotels in deal score | **CUT. Final.** | v2 if demand validates. No debate. |
| Peakly Pro UI | **CUT for v1. Final.** | Post-1K MAU. |
| Wishlists / Trips tabs | **LOCKED at 1K MAU gate** | Nav is lean by design. |
| OBX near-dup merge | **DEFER post-launch** | P3. No conversion impact. |
| poolPrimary: true venue additions | **DEFER** | Zero user demand signal. |
| Surfing category reinstatement | **CUT. Final.** | Retired 2026-05-03 with deliberation. Reopening needs a real product call, not a content suggestion. |

---

## Pre-Launch Checklist — June 10

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate live (3 sites in app.jsx) | ✅ |
| 3 | val-d-isere-s16 deleted | ✅ |
| 4 | Outer Banks ap ORF | ✅ |
| 5 | BookingConfirmSheet off flights | ✅ |
| 6 | SafetyWing CTA live | ✅ |
| 7 | Bora Bora BOB standardized | ✅ |
| 8 | **Amazon/GEAR_ITEMS** | ⚠️ **Conflicted — Decision 1 resolves today** |
| 9 | Sentry DSN non-empty | ✅ |
| 10 | Seasonal default beach N-hem June | ✅ |
| 11 | lateSeason flags (6 ski venues) | ✅ |
| 12 | Cache 20260610a | ✅ |
| 13 | JSON-LD structured data | ✅ |
| 14 | Static H1 fallback | ✅ |
| 15 | Plausible domain validated | ❓ Jack to confirm (`j1mmychu.github.io` or custom domain?) |
| 16 | **VPS proxy verified live** | ❌ Day 37 |
| 17 | **GitHub PAT renewed** | ❌ **5 days — Jack today** |
| 18 | **Reddit launch confirmed** | ❓ Jack: did June 7 happen? If not, when? |
| 19 | FeaturedCard Book button `book_click` Plausible event | ⚠️ Written June 9, uncommitted (working tree) |
| 20 | ToS/Privacy links in Profile footer | ⚠️ Written June 9, uncommitted (working tree) |

**Items 19 and 20** — the per-Edit hook normally auto-commits. These sitting dirty suggests a guard refusal. Check `/tmp/peakly-auto-push.log` and ship in the next commit.

---

## Revenue Model — June 10 (Conflicted Until Decision 1)

| Stream | Code Status | RPM/1K MAU |
|--------|-------------|------------|
| Amazon Associates (`peakly-20`) | ⚠️ GEAR_ITEMS present (DevOps restored today) — **conflicts with June 9 CUT decision** | $4.48 (if kept) / $0 (if CUT honored) |
| Booking.com (`aid=2311236`) | ✅ Live | $6.90 |
| SafetyWing (`referenceID=peakly`) | ✅ Live | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ Live | $0.14 |
| REI (Avantlink) | LLC pending | +$6.16 |
| Backcountry / GetYourGuide | LLC pending | +$1.84 |

**Live RPM pending Decision 1:** $7.58 (Amazon CUT) or $12.06 (Amazon live). Update CLAUDE.md the moment the call is made.

---

## 90-Day Projection

| Scenario | Users (90d) | What Has to Be True |
|----------|-------------|---------------------|
| PAT renewed + VPS live + Reddit top-10 + launch June 10–12 | **6K–8K** | Pipeline stable, proxy absorbs spike, summer beach peak window open |
| PAT renewed + Reddit launch, VPS still down | **3K–5K** | Direct Open-Meteo degrades at 67 DAU; spike risks grid-blank state |
| PAT expires June 15, no renewal | **<1.5K** | Every fix invisible post-expiry; churn compounds |
| No Reddit launch before July 15 | **<2K** | Summer beach window half over; 100K slips to 2027 |

**For 8K not 5K:**
1. Reddit post in top 10 of r/solotravel or r/skiing — timing and title matter as much as product quality
2. VPS live before the post goes up — grid-blank at 67+ DAU is the hardest perception hole to dig out of
3. PAT renewed — ensures every polish fix ships in the days after launch
4. S. hemisphere ski inventory expanded (done with today's +14) — retains skiing users through September

Three of these four are Jack actions totaling under 30 minutes.

---

## One Product Risk Nobody Is Talking About

**The content agents are counting venues wrong and it's poisoning their own recommendations.**

The June 10 content report says "156 venues (67 ski / 89 beach)" and recommends adding Cardrona and Cerro Catedral as gaps — but Cardrona and Cerro Catedral were already added in today's +14 S. hemisphere ski commit. The agent recommended venues that shipped hours earlier in the same session.

The root cause: content agents use `grep category:"..."` which only sees the 156 original-format compact entries. The 197 JSON-format batch entries (added since May) are invisible to the grep. So every content run treats ~60% of the catalog as nonexistent, generates "missing" venue recommendations that already exist, and burns credibility with Jack when he sees duplicate suggestions.

This has been flagged in CLAUDE.md for weeks ("STOP COUNTING VENUES WITH grep"). The fix is one line in the content agent prompt: replace the counting instruction with the eval one-liner from `status.sh`. Until it's fixed, every content recommendation needs to be cross-checked against the actual VENUES array before adding — otherwise we'll start adding genuine duplicates.

**Proposed fix:** Update `tasks/agents/content-data.md` to include the eval-based count check. 5-minute edit, prevents the class permanently.

---

*Report written: 2026-06-10 | PM v54 | Build: 20260610a | Venues: 353 (116 ski / 223 beach, eval-counted)*
