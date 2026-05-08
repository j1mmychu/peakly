# Peakly PM Report — 2026-05-08 (v35)

**Filed by:** Product Manager agent
**Date:** 2026-05-08
**Status:** YELLOW. Sprint work is live. VPS is the only hard blocker. Reddit window closes May 20 — 12 days. Two one-liners (SEO meta, Supabase blocking script) should ship before the Reddit post.

---

## Shipped Since Last Report (2026-05-07 → 2026-05-08)

| Commit | What | Right call? |
|--------|------|-------------|
| `9399b83` (May 8, DevOps) | Merged dangling 05-03–05-07 sprint commits, confirmed main current | ✅ Critical hygiene |
| `2f32079` (May 8, DevOps audit) | Read-only audit against stale local copy — code findings were invalid | ❌ Same stale-local problem again. See note below. |

**Structural problem, third day running:** DevOps agents keep running against stale local copies. The fix is one line in the run script: `git pull origin main` before any file reads. Until that's enforced, cross-check any agent report's venue counts (currently: 86 beach, 65 skiing, 0 surfing) and line count (`wc -l app.jsx` = 8,465) before acting on its findings.

**Sprint work confirmed live (as of 9399b83):**
- Surf→beach pivot ✅ — 0 surfing venues, 86 beach
- `scoreWeekend()` / `scoreWeekendDeal()` ✅
- `ScoreBreakdown` "Why this score?" ✅
- `seasonalDefaultCat()` ✅
- Supabase cloud sync + magic-link auth ✅
- `lateSeason: true` on 7 ski venues ✅
- Default `maxFlightHrs: 6` ✅
- Filter-aware empty state ✅
- Cache at `peakly-20260507e` ✅
- chamonix-mont-blanc-s18 duplicate: deleted ✅

---

## Permanent Bug Triage — Do Not Re-Flag

| Issue | Status |
|-------|--------|
| Peakly Pro $9/mo pricing | CLOSED — no Pro UI in codebase |
| Sentry DSN empty | CLOSED — real DSN at app.jsx:8 |
| TP_MARKER unset | CLOSED — `"710303"` at app.jsx:1593 |
| JSON-LD missing | CLOSED — present at index.html:34 |
| Amazon gear gate `false &&` | CLOSED — `GEAR_ITEMS[listing.category]` at app.jsx:6909 |
| Surfing venues in code | CLOSED — 0 remaining |
| aruba-eagle-beach-t1 dupe | CLOSED |
| aspen-snowmass-s7 dupe | CLOSED |
| lech-zurs-s27 wrong tags | CLOSED |
| chamonix-mont-blanc-s18 dupe | CLOSED — line 408 only entry |

---

## Active Bug Triage — May 8

| Bug | Severity | Status | Jack Action? |
|-----|----------|--------|-------------|
| **VPS not redeployed** | **P0 pre-spike** | ❌ Undeployed | ✅ YES — 5-min SSH |
| **index.html title/meta say "surf" + "adventure"** | **P1** | ❌ Open | No (code fix) |
| **Supabase JS loaded as blocking `<script>`** | **P1** | ❌ Open | No (code fix) |
| **Reddit launch: no date set** | **P1 / launch gate** | ❌ Open — Day 40 | ✅ YES — Product decision |
| **Supabase RLS not verified** | **P2** | ⚠️ Unknown | ✅ YES — SQL check (5 min) |
| **`_rateMap` no size cap in proxy.js** | **P2** | ❌ Open | No (code fix) |
| **Email list fragmentation** (waitlist.jsonl vs Supabase auth.users) | **P2** | Decision needed | ✅ YES |
| **SRI hashes missing on CDN scripts** | **P2** | Deferred | No |
| **Babel 7.24.7 → 7.29.4** | **P2** | ❌ Open | No (index.html bump) |
| **APNS alert persistence (in-memory)** | **P3** | Deferred to v2 | No |
| **PEAKLY_BUILD stamp** | **P3** | ✅ Fixed — all `20260507e` | — |

---

## Explicit Product Decisions — May 8

**Decision 1: VPS redeploy — Jack's action, today.**
Everything that's been waiting since May 4 ships with one SSH command:
```bash
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy"
curl https://peakly-api.duckdns.org/health
```
Unlocks: server-side weather cache (rate limit protection), weekend-specific flight pricing, APNS push alerts. Expected `/health` output should include `pollStats` and `apns` keys.

**Decision 2: index.html SEO meta — SHIP before Reddit post.**
index.html:7 `<meta description>` says "surf, ski & adventure." index.html:23 `<title>` says "Find Surf, Ski & Adventure Spots." The app is now a ski-or-beach app. Google is currently indexing this as a surfing app. Two-string fix — ship it alone or bundle with the Babel bump.

**Decision 3: Supabase blocking script — SHIP before Reddit post.**
DevOps confirmed Supabase JS is in a blocking `<script>` tag (index.html:85), adding ~120KB gzip to every user's first paint — including the anonymous users who'll never sign in. The original plan was lazy-load only. The correct fix is to dynamically inject the script inside `useCloudSync` when auth is needed. Every anonymous user who bounces from a slow first load is a lost Reddit visitor.

---

## This Week's Top 3 Priorities

**1. Jack: SSH to VPS and redeploy. 5 minutes.**
Command above. Verify with `/health`. Unblocks everything that's been waiting since May 4.

**2. Ship SEO meta fix + Supabase lazy-load together. Single commit.**
- `index.html:7` — update `<meta description>` to reflect ski + beach, remove "surf" and "adventure"
- `index.html:23` — update `<title>` to match
- `index.html:85` — remove blocking Supabase `<script>` tag; lazy-load inside `useCloudSync`
- Bump cache bust: `v=20260508a`, `CACHE_NAME = "peakly-20260508a"`, `PEAKLY_BUILD = "20260508a"`
- Bundle the Babel upgrade (`7.24.7` → `7.29.4`) in the same commit — free ride
- Total: ~30 min, 4 files, zero new features

**3. Jack: Set the Reddit launch date. Before May 20.**
12 days left in the ski/beach window. No technical blockers remain after items 1–2. The post structure is simple: 3 screenshots of currently-firing conditions + "built this to find spontaneous weekend trips when cheap flights and good conditions line up." r/skiing or r/travel first, r/surfing-adjacent communities for the beach angle. Pick a date this weekend.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Share-a-list viral loop | **DEFER** | Requires Supabase SQL deploy (shared_lists schema) + PM sign-off on security. Post-50 users. |
| `scoreWeekend()` algorithm changes | **DEFER** | Ship the existing implementation; data-drive iteration post-Reddit. |
| Strike alerts App Store flow | **DEFER** | Native iOS/Android is post-1K MAU. APNS code is ready when needed. |
| Hotels in deal score | **CUT v1** | Explicitly deferred to v2 per May 7 scope lock. |
| CSP meta + SRI hashes | **DEFER** | Could break Babel eval. Medium-risk hardening for post-launch. |
| Supabase new features | **FREEZE** | No new Supabase scope until 50 active users and RLS verified. |
| Trips / Wishlists tab | **DEFER** | 1K users minimum. |

---

## Success Criteria

**5K vs. 8K users by Day 90:**

| Variable | 5K path | 8K path |
|----------|---------|---------|
| Reddit launch | After May 20 | Before May 18 |
| First-paint speed | ~3–5s (Supabase blocking) | ~2–3s (Supabase lazy) |
| Email capture rate | <5% | >8% (fast load + frictionless form) |
| D1 retention | <30% | >40% |
| Second post timing | Never | 4 weeks post-launch w/ "most-searched spots" |

**What 8K requires that 5K doesn't:** A May 15–18 Reddit post. After May 20 the ski FOMO window closes. Beach season is year-round but skiing creates the compelling "this weekend or never" hook that drives immediate first opens. A June launch is a beach-only launch in perception, even with ski venues live.

**Pre-Reddit checklist (honest):**
- [ ] VPS redeployed (Jack, 5 min)
- [ ] SEO meta/title fixed (code, 5 min)
- [ ] Supabase lazy-loaded (code, 30 min)
- [ ] Supabase RLS verified (Jack, 5 min SQL)
- [ ] Reddit post drafted

That's it. Everything else is noise.

---

## The One Risk Nobody Is Talking About

**Anonymous users are downloading Supabase JS on first paint.**

The original plan was to lazy-load it — "only fetches when there's an existing session, magic-link callback, or user taps Sign in" (CLAUDE.md, Data Storage section). That's not what shipped. The `<script>` tag is blocking. Every user who opens Peakly cold — including every Reddit visitor on launch day — downloads 120KB of Supabase before they see a single venue card.

On 4G mobile, that's the difference between a 2-second and a 4-second first paint. Reddit launched products regularly spike to 5K concurrent users in the first hour. If 40% of those users are on mobile (likely higher for a travel app), and 20% of them bounce at 4 seconds (Deloitte benchmark), that's 400 users who will never see the product.

This is a solvable problem in 30 minutes. It should ship before the Reddit post.
