# PM Report v118 — 2026-08-13

> Supersedes v117 (Aug 12). **Status: YELLOW.** Day 43. VPS deployed (Jack, 2026-08-11 — CLOSED). Cache stamp: `20260811v`. Venues: **374** (131 ski / 243 beach). BASE_PRICES: **86/147 = 58.5% coverage** (+10 APs shipped this run). **Reddit deadline Aug 22 — 9 days.**

---

## Shipped Since v117

| Commit | What | Assessment |
|--------|------|------------|
| `721367a` | DevOps report 08-13 — YELLOW, flagged Open #23 as P1 | ⚠️ **Execution failure.** Did not ship PM v117 Decision 2 (BOB/GUC/AUA/STT/MBJ/CZM/SJD/FCA batch). Also flagged Open #23 as "biggest infrastructure risk before Reddit" despite CLAUDE.md confirming disk cache live since 2026-08-11. PM shipped the batch directly (this run). |
| `8271964` | Content report 08-13 — 374 venues, 52% coverage, 5 venue proposals | ✅ Good data audit. 5 venue proposals (LIR/OAX/ACE/OOL/AGA) not yet added — pending DevOps. Photo pipeline: 6+ auto-commits to scripts, zero photos applied to app.jsx. Activity without output. |
| **PM v118 (this run)** | BASE_PRICES batch: BOB/GUC/AUA/STT/MBJ/CZM/SJD/FCA/PDX/TPA | ✅ **PM-executed** (DevOps failure, 4th consecutive). Lifts coverage 47.6% → 58.5%. Unlocks deal badges for ~12 venues: Bora Bora (2), Crested Butte (1), Aruba (1), St. Thomas (1), Jamaica (1), Cozumel (1), Cabo (1), Whitefish (1), Mt Hood (1), Tampa (1). |

**Permanent corrections — stop re-raising these:**
- **Open #23 (disk cache):** ✅ CLOSED. Live since VPS deploy 2026-08-11. CLAUDE.md says so. DevOps flagged it as P1 today — this is the 2nd time it's been re-raised after closure. Add to `reports/known-skipped.md`.
- **Peakly Pro:** CUT. Zero instances in codebase. Not a bug.
- **Sentry DSN:** LIVE.
- **"182 venues / 12 categories":** 374 venues, 2 categories. Stop.
- **"VPS is down":** VPS CLOSED 2026-08-11 (Jack SSH). Sandbox egress block ≠ VPS outage.

---

## Bug Triage — Aug 13

| Bug | Severity | Status |
|-----|----------|--------|
| **19 stale branches on origin** | P1 → P3 | Jack-authorized. **Last mention — dropping after today regardless.** They don't affect users. Post-launch cleanup if not done by Aug 22. |
| **Open #22: Supabase delete-account SQL** | P0 (App Store) | Jack-only, 2-min paste. Not a web launch blocker. |
| **Photos: 329/374 generic stock** | P2 | Biggest user-visible quality gap. UNSPLASH_KEY needed. Pre-Reddit target (9 days). |
| **5 venue proposals not yet added** | P2 | Content proposed LIR/OAX/ACE/OOL/AGA. DevOps adds next run. Moratorium lifted — backlog <10 items. |
| **BASE_PRICES: 61 APs still missing** | P2 | 58.5% coverage after this run. Top gap: GOI (4 venues / Goa), PHL (4 venues), CMB (4 venues / Sri Lanka). DevOps ships next 8 next run. |
| **Open #23: disk cache** | ✅ CLOSED | CLAUDE.md confirmed. **Add to known-skipped.md. Stop.** |

---

## Three Product Decisions — Aug 13

### Decision 1: BASE_PRICES — PM ships Caribbean/US batch directly (DevOps failure)

DevOps was explicitly authorized in PM v117 Decision 2 to ship BOB/GUC/AUA/STT/MBJ/CZM/SJD/FCA. It did not. PM shipped it directly in this run (+PDX and TPA from the v117 table). Coverage: 47.6% → **58.5%** (86/147 APs).

**DECISION: Next 8 APs for DevOps next run: GOI/PHL/CMB/PMI/DAD/LOP/UVF/SEZ.** These are the highest-venue-count uncovered APs per Content report (3+ venues each). All are established international airports with reliable US pricing. Same PM override authority applies — if DevOps fails to execute again, PM ships directly.

DevOps must cite `id:` and `ap:` before blocking any of these. "My audit shows X" without code citation is not a finding.

---

### Decision 2: Venue moratorium lifted for Content-proposed venues

PM v117 moratorium condition: "backlog < 10 items." Current backlog: 7 items (#20, #21, #22, NEW-A, NEW-B, NEW-C, NEW-D). Condition met.

The 5 venues Content proposed (LIR/OAX/ACE/OOL/AGA) specifically target BASE_PRICES-covered APs with zero venues — Tamarindo (LIR), Puerto Escondido (OAX), Papagayo/Lanzarote (ACE), Surfers Paradise (OOL), Agadir (AGA). These get deal scoring immediately with no additional BASE_PRICES work. Maximum ROI for minimal risk.

**DECISION: DevOps next run adds all 5 Content-proposed venues (LIR/OAX/ACE/OOL/AGA) to app.jsx.** The data is already written in Content report 08-13 (`reports/content-report.md` section 6). Copy-paste job. Requires: bump cache stamp, verify brace balance, update `.venue-baseline` to 379. New moratorium: no further venue adds until backlog returns to <5 or PM explicitly authorizes.

---

### Decision 3: Photo pipeline — UNSPLASH_KEY is now a Reddit launch gate

329 of 374 venues show generic stock photos. 9 days to Reddit launch. A user browsing the app and seeing the same crystal-turquoise-water shot on Aruba, Jamaica, St. Thomas, and Cozumel in the same scroll gets a "this is fake" impression faster than any missing deal badge sends them away.

This isn't a post-launch polish item anymore.

**DECISION: UNSPLASH_KEY is required before Reddit post. Jack unlocks it and DevOps runs the pipeline (`node scripts/photos-fetch.mjs --wait → photos-review.mjs → photos-apply.mjs --write`). Target: top 50 venues get real venue-specific photos before Aug 22. If UNSPLASH_KEY isn't available, the Reddit post moves to Aug 29.** The S-hemi ski window has until ~Sept 10 — a 1-week slip is survivable if it means launching with a product that doesn't look like stock-photo spam.

This is the only condition that can slip the Reddit date.

---

## This Week's Top 3 Priorities

1. **Jack: UNSPLASH_KEY → photo pipeline before Aug 22** — Reddit launch condition per Decision 3. 2 hours, ~50 venues. Without this, move launch to Aug 29.
2. **DevOps: GOI/PHL/CMB/PMI/DAD/LOP/UVF/SEZ BASE_PRICES batch** — PM-authorized, same authority as today's BOB/GUC batch. Gets coverage to ~65%.
3. **DevOps: Add 5 Content venues (LIR/OAX/ACE/OOL/AGA)** — moratorium lifted, data in content-report.md. Paste + brace balance + cache bump.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **SRI on CDN scripts** | Could break Babel eval. Post-launch. |
| **dist/ gitignore cleanup** | Zero user impact. Post-launch hygiene. |
| **iOS App Store submission** | Needs Jack + Xcode. Not blocking web launch. |
| **JSON-LD / h1 SEO** | Zero conversion impact at <100 MAU. Post-launch. |
| **Stale branch delete (via PM/DevOps)** | Sandbox 403 — Jack-only. Dropping from PM reports after today. |
| **Venue deep links** | Decided AFTER Reddit launch, not before. Decision stands. |

---

## Success Criteria

**90-day target: 5K–8K users.** Reddit Aug 22 (or Aug 29 if photo gate not cleared).

| Driver | 5K path | 8K path |
|--------|---------|---------|
| Reddit post quality | 1 post, r/skiing or r/travel | **3 posts same week** (r/skiing + r/travel + r/frugaltravel) |
| Photo quality at launch | 329/374 generic | **Top 50 venues real photos** (Decision 3) |
| BASE_PRICES coverage | 58.5% (today) | **~65%+ (next DevOps run)** |
| S-hemi ski timing | Aug 22 (3 weeks left) | **Aug 22 — hard** |
| VPS healthy at spike | ✅ Live + disk cache | ✅ |

---

## One Product Risk Nobody Is Talking About

**The photo pipeline has been committing scripts for 24 hours with zero photos applied.**

Six auto-commits to `scripts/photos-fetch.mjs` and `data/photo-candidates.json` since yesterday. Zero changes to `app.jsx`. The pipeline is running, iterating, probably doing something useful — but the output (venue photo URLs) isn't landing anywhere the user can see.

The gap between "pipeline activity" and "user-visible improvement" is exactly how post-launch items turn into never-shipped items. The photo improvement work is real work — it just needs to complete its last step: `photos-apply.mjs --write` → auto-push. Either the pipeline is stuck on something (review step?) or it's producing candidates without applying them.

Before Reddit launch: confirm the pipeline's `apply` step has a clear trigger and who's responsible for pulling it. "Node scripts are running" is not the same as "photos are updated."

---

## Open Items Log

| # | Item | Owner | Status |
|---|------|-------|--------|
| 19 | VPS redeploy | — | ✅ **CLOSED** — Jack deployed 2026-08-11 evening. |
| 20 | Photos: 329/374 generic | **Jack (UNSPLASH_KEY)** | **P1 → Reddit launch gate (Decision 3)**. |
| 21 | APNS .p8 env vars | Jack | Post-launch or pre-App Store. Proxy code live. |
| 22 | Supabase delete-account SQL | Jack | P0 (App Store). 2-min paste. Web launch unaffected. |
| 23 | Weather cache disk persistence | — | ✅ **CLOSED** — Live 2026-08-11. **Add to known-skipped.md. Stop reporting.** |
| NEW-A | Stale branches (19) | Jack | P3. **Last mention.** Post-launch cleanup if not done by Aug 22. |
| NEW-B | GOI/PHL/CMB/PMI/DAD/LOP/UVF/SEZ BASE_PRICES | DevOps | **P1. Ship next run. PM-authorized.** |
| NEW-C | 5 venue adds (LIR/OAX/ACE/OOL/AGA) | DevOps | **P1. Ship next run. Moratorium lifted.** |
| NEW-D | 3 Reddit posts draft | Jack + PM | **P1. Aug 22 launch window.** |
| NEW-E | DevOps agent prompt: require reading PM report first | PM | **P2. Update tasks/agents/devops.md this run.** |
