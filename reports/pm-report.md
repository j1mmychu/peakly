# Peakly PM Report — 2026-06-08 (v52)

> Supersedes v51 (June 7). **Status: RED. Launch still gated on VPS (Day 35) — AND a revenue stream silently died overnight.**
>
> _Convention note: PM writes to this rolling `reports/pm-report.md` (the live pattern since v44). The canonical prompt's `reports/inputs/pm-YYYY-MM-DD.md` path has drifted — keeping the rolling file so the daily-briefing pipeline doesn't break._

---

## Headline — GEAR_ITEMS (Amazon) was removed last night. No one decided this.

`grep -i 'GEAR_ITEMS\|amazon\|peakly-20'` on `app.jsx` returns **zero hits.** It dropped 6 → 4 → 2 → 0 across three unlabeled commits on June 7, 18:40–18:42 PDT (`9656c6b` → `f8e9a51` → `12ebc13`) — ~9 hours **after** the v51 report green-lit "GEAR_ITEMS live" as checklist item #8.

What this means:
- The Amazon Associates stream (`peakly-20`, **$4.48/1K MAU** — the second-largest stream) now earns **$0**.
- Live RPM drops **$12.06 → $7.58/1K MAU (−37%)**. CLAUDE.md's Revenue Model table is now wrong.
- The removal is **clean** — braces balance 0/0/0, no dangling reference, no crash. So it's pure revenue loss, not a render bug. It would pass the smoke test.
- It arrived through `auto:` commits with no message, no report, no decision trail. Either an accidental deletion during another edit, or an intentional pre-launch simplification nobody wrote down. Both are bad on launch eve.

This was already restored once (removed pre-05-24, restored `450891b`/`932943c`). Restoring it a second time the night of launch should not be left to chance.

---

## Shipped Since v51 (2026-06-07 → 2026-06-08)

| What | Verdict |
|------|---------|
| **GEAR_ITEMS deleted** (`9656c6b`→`12ebc13`, auto-commits) | ❌ **Regression.** Reverses v51 checklist #8. See Decision 1. |
| DevOps June 8 — 🟢 GREEN, cache `20260607ae` aligned, security clean, cache-buster auto-bump now structural | ✅ Good. Stale-buster P0 class is dead. |
| Zero labeled logic commits; nothing shipped June 8 yet | ⚠️ Ski empty-state copy (v51's named June-8 commit) not done. See Decision 2. |

**Code state June 8:** app.jsx 9,002 lines. Cache `20260607ae` consistent across all 3 files. 156 venues (67 ski + 89 beach). APNS Capacitor gate live. **GEAR_ITEMS gone.**

---

## Bug Triage — June 8

| Item | Severity | Status |
|------|----------|--------|
| **GEAR_ITEMS removed → Amazon stream dead** | **P1 (revenue)** | ❌ NEW overnight. Restore before launch. Decision 1. |
| **VPS proxy unredeployed** | **P0 (launch gate)** | ❌ Day 35. Binary blocker. Known-skipped as infra, but it IS the launch gate. |
| Ski empty-state summer copy | **P2** | ❌ Was named "June 8 commit" in v51. Not shipped. Decision 2. |
| CORS localhost origins in prod proxy.js | P1 | Bundle with VPS SSH session (per v51 Decision 3). Unchanged. |
| beach_gilit typo / OBX dup / Thredbo ap / Gudauri photo / s-series tags / skiPass backfill | P2 ×6 | June 10 sprint. Unchanged from v51. Not re-litigated. |

**Two-strikes / not re-filed:** VPS redeploy + APNS (graduated to `known-skipped.md` by DevOps this run), Sunday-timing frame, Bora Bora keep-both, CORS-June-10 — all decided in v51. No new nagging.

---

## Explicit Product Decisions — June 8

**Decision 1: RESTORE GEAR_ITEMS before launch.**
A 37% revenue cut on the second-biggest stream, shipped with no decision the night before launch, is not a launch state we accept. It's a clean git restore — the constant + its render usage existed intact at `932943c` and through `9656c6b`'s parent. Restore it, re-verify checklist #8, bump cache.

> For Jack (one paste — inspect, then restore just the gear block):
> ```bash
> cd ~/peakly
> # see exactly what the three auto-commits removed:
> git diff 9656c6b~1 12ebc13 -- app.jsx | grep -iA2 -B2 gear | head -80
> # if it's revenue-only (no logic entanglement), restore the GEAR_ITEMS hunk from the last-good tree,
> # re-verify `grep -c GEAR_ITEMS app.jsx`, bump cache, commit with a REAL message.
> ```
> If the removal was intentional (Jack chose to cut gear for v1), then instead: update CLAUDE.md Revenue Model to **$7.58/1K MAU** and drop the Amazon row + checklist #8. Either way — the shared brain cannot keep claiming $4.48 from code that doesn't exist. **Pick one. "We'll see" is not allowed on a revenue stream.**

**Decision 2: Ski empty-state copy moves to the June 10 sprint. Final.**
v51 set the contract: "v52 ships it or it moves to June 10." It's v52, code freeze holds until VPS is verified, and adding pre-launch UI now is the exact build-before-verify pattern that's bitten us. So it moves — but it's now a **named line item in the June 10 sprint, not deferrable past it.** 61 of 67 ski venues score near-zero through September; a Reddit skier tapping the Ski filter sees a sparse grid that reads as broken. 30-minute fix, highest-LTV users, June 10 hard.

**Decision 3: Launch stays gated on VPS. If `/health` isn't verified by EOD June 8, slip to June 14 — no exception.**
This is Day 35. Re-affirming v51: at Reddit spike (~67 concurrent cold-cache users) the direct Open-Meteo path throttles, venues score null, grid looks empty, thread dies. The proxy weather cache is the fix and it's written — it just needs `git pull && pm2 restart` on 198.199.80.21. I'm not re-nagging the redeploy as a finding (it's Jack-only, known-skipped). I'm stating the gate: **no VPS verification = no Reddit post.** And honestly — 35 days of "launch when VPS is ready" is starting to look like an implicit decision not to launch. If June 14 also slips, that's the real conversation to have, not the proxy.

---

## Launch Go / No-Go — June 8

| Gate | Status |
|------|--------|
| Cache `20260607ae` aligned | ✅ |
| Sentry DSN active / Plausible wired | ✅ |
| APNS Capacitor gate live | ✅ |
| SEO meta clean / JSON-LD / H1 fallback | ✅ |
| Flight CTA direct (no modal) | ✅ |
| 156 venues healthy | ✅ |
| **GEAR_ITEMS live (Amazon)** | ❌ **REGRESSED overnight — Decision 1** |
| **VPS proxy verified live** | ❌ **Day 35 — binary blocker** |
| Plausible domain validated | ❌ Jack (2 min) |
| Human smoke test incognito | ❌ Jack (5 min) |
| Reddit post written (Sunday-timing note) | ❌ Jack |

**Net change from v51: one gate went green→red (GEAR_ITEMS). We are further from launch-ready than yesterday, not closer.**

**Rule: VPS `/health` returns `wx_cache_size` AND GEAR_ITEMS restored → GO. Otherwise → June 14, no exception.**

---

## This Week's Top 3 Priorities Only

1. **Restore GEAR_ITEMS (or formally cut + fix the Revenue Model).** Decision 1. ~10 min. A revenue stream cannot silently disappear into an `auto:` commit on launch eve.
2. **Jack: VPS SSH + CORS fix — the launch gate.** Same 5-minute session. Everything is conditional on this.
3. **Lock the June 10 sprint:** ski empty-state copy + OBX merge + beach_gilit rename + Thredbo ap + CORS confirm + 5 new venues, each with a localStorage migration guard, one clean labeled commit.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Shipping ski empty-state copy pre-launch (June 8) | **DEFER → June 10 (named, hard)** | Code freeze holds until VPS verified. |
| 5 new venues (Verbier, Val Thorens, Yongpyong, Tenerife, Byron Bay…) | **DEFER → June 10** | 156 is defensible. Freeze. |
| Any new app.jsx feature pre-launch | **BLOCKED** | The auto-commit that killed GEAR_ITEMS is exactly why nothing new enters the file until VPS is verified and the tree is reviewed. |
| Hotels in deal score / Peakly Pro / Wishlists-Trips reveal | **CUT or 1K-MAU-LOCKED** | Unchanged. Final. |
| SRI + CSP | **DEFER July** | Babel unsafe-eval regression risk. |

---

## Success Criteria — June 8

**90-day projection (unchanged shape from v51, one new downside):**

| Scenario | 90d Users | Critical Variable |
|----------|-----------|-------------------|
| VPS live + GEAR restored + top-10 post | **6K–8K** | Proxy absorbs spike; day-8 grid has ≥5 good next-weekend cards |
| VPS down at launch | **<500** | Empty grid hour 1. Thread dies. |
| Slip to June 14 | **4K–6K** | Still peak summer; next-weekend timing is arguably better |
| **Launch with GEAR still missing** | 6K–8K users but **−37% RPM** | Every user worth $7.58 not $12.06 — a self-inflicted monetization cut |

**48-hour metrics to watch (unchanged):** unique visitors hour-1 >200; `venue_detail_open` >15%; `install_pwa` >5%; Sentry new error classes = 0; mobile bounce <70%.

---

## One Product Risk Nobody Is Talking About

**The auto-push pipeline ships unreviewed logic changes to production, and it just silently killed a revenue stream.**

Every Edit commits as `auto: app.jsx` — no description, no diff review, no report. GEAR_ITEMS going 6→2→0 across three of those commits is the proof of concept: a monetization stream died the night before launch and the *only* reason it's caught is a PM grep nine hours later. The smoke test wouldn't have flagged it — the page renders fine without gear. The shared brain (CLAUDE.md, v51 checklist, Revenue Model) all still confidently claim it's live.

This time it was lost revenue. Next time — at Reddit launch traffic — an auto-committed change could be a render crash, a broken affiliate link, or a scoring regression that ships to 200 concurrent users with zero human in the loop. The pipeline optimizes for "never lose a keystroke" at the cost of "never review what ships." Before launch, the minimum mitigation is a one-line guard: **the auto-push hook should refuse to commit `app.jsx` if `grep -c GEAR_ITEMS` / cache-stamp / brace-balance invariants regress** — or at least label logic-bearing commits so a regression has a paper trail. Right now the safety net is a daily PM grep, and that's not a net.
