# Peakly PM Report — 2026-05-03 (v31)

**Filed by:** Product Manager agent
**Date:** 2026-05-03
**Status:** YELLOW → RED. The ski season scoring window closes in ~2.5 weeks. Weather proxy still unbuilt. Five duplicate venue pairs still live 12 days after first flag. Reddit launch date still unnamed. May is the only month where surf + ski audiences overlap — every day of delay costs more than the last.

---

## Shipped Since Last Report (2026-04-30 → 2026-05-03)

| Commit | What | Right call? |
|--------|------|-------------|
| `c9a384d` (May 1) | Delete aspen-snowmass-s7, fix lech-zurs tags, bump cache 20260501a | ✅ Correct. Three closes in one surgical commit. |
| `626f266` (May 1) | DevOps report — read-only | Neutral |
| `fde73a3` (May 1) | Content report — read-only | Neutral |
| `3139d77` (May 2) | Bump cache 20260502a, Sentry sampling 1.0→0.05, proxy response timeout | ✅ Correct. Cache/Sentry fixes were real. Two cache bumps in 2 days is fine — each addressed a real stale window. |
| `52e2236` (May 2) | Content report — read-only audit | Neutral. Flagged 5 dups still live + 3 photo dups + 6 "missing APs" — but the 6 APs are NOT missing (CMB, EXT, MCT, MGA, SBA, SNA all present in AP_CONTINENT). Content agent false positive. Do not action the AP fix. |

**Assessment:** Good hygiene commits May 1–2. But 5 duplicate pairs have now been flagged across 4 consecutive content reports without getting deleted. These are 10-minute deletions, not a research project. This is an execution gap.

---

## Permanent Bug Triage — Confirmed Closed (Do NOT Re-Open)

| Issue | Status | Evidence |
|-------|--------|----------|
| Peakly Pro showing $9/mo | **CLOSED** | No Pro UI in codebase. Email waitlist only. |
| Sentry DSN empty | **CLOSED** | `app.jsx:6-15` — real DSN initialized |
| Sentry tracesSampleRate burning quota | **CLOSED** | Fixed May 2 — 1.0 → 0.05 |
| TP_MARKER unset | **CLOSED** | `app.jsx:1593` = "710303" |
| JSON-LD missing | **CLOSED** | `index.html:34` — WebSite + WebApplication + Organization |
| fetchJson response body timeout | **CLOSED** | Fixed May 2 — `res.setTimeout(8000)` in proxy.js |
| aspen-snowmass-s7 duplicate | **CLOSED** | Deleted May 1 |
| lech-zurs-s27 wrong tags | **CLOSED** | Fixed May 1 |
| Cache buster stale | **CLOSED** | v=20260502a current as of May 2 |
| 6 APs missing from AP_CONTINENT | **CLOSED / FALSE POSITIVE** | CMB, EXT, MCT, MGA, SBA, SNA confirmed present in `app.jsx:184-310`. Content agent audited incorrectly. Do not re-flag. |

---

## Active Bug Triage — May 3

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **Open-Meteo rate limit — no server-side weather cache** | **P0 LAUNCH BLOCKER** | ❌ Still unbuilt. ~360 calls per cold session. 10K free tier = ~27 cold sessions before quota burns. | Day 15 |
| **5 same-location duplicate venue pairs** | **P1** | ❌ banzai_pipeline, fernando-de-noronha-s20, siargao, snappers-gold-coast-s26, aruba-eagle-beach-t1 | Day 12 |
| **3 duplicate photo URLs** | **P1** | ❌ angourie-point-s3/arugam_bay, portillo-s4/perisher, beach_praslin/beach_phuquoc | Day 4 |
| **Reddit launch date unnamed** | **P1** | ❌ Ski season window closes ~May 20–25 | Day 35+ |
| **Strike alerts: no background worker** | **P3** | Deferred. Build post-500 MAU. | — |

### P0 Detail: Open-Meteo Weather Proxy (Day 15)

The math has not changed:
- 240 venues × ~1.5 avg API calls = **360 calls per cold session**
- Free tier: 10,000/day → **~27 simultaneous cold sessions before quota burns**
- After quota: every score returns 50 "Swell data unavailable." Value prop gone.

One viral Reddit comment sending 30 users simultaneously exhausts the day's budget instantly. The fix is two Express routes on the VPS (~40 lines) + 2 line change in `app.jsx`. Spec ready for 15 days. The only input required from Jack is an SSH session.

**This is not a monitoring item. It is the single action standing between a soft launch and an embarrassing one.**

### P1 Detail: 5 Duplicate Venue Pairs (Delete These)

240 → 235 venues post-cleanup. All confirmed in current `app.jsx`.

| Delete | Keep | Why |
|--------|------|-----|
| `banzai_pipeline` | `pipeline` | `pipeline` is canonical ID; identical wave at 21.6622,-158.0543 |
| `fernando-de-noronha-s20` | `noronha_surf` | Wrong tags ("Barrel Waves" — incorrect), wrong rating (4.75 vs 4.96) |
| `siargao` | `cloud9` | `cloud9` better rating (4.95 vs 4.93); siargao was added without noticing cloud9 existed |
| `snappers-gold-coast-s26` | `snapper_rocks` | `snapper_rocks` is canonical; 0.003° apart, same break |
| `aruba-eagle-beach-t1` | `beach_eagle` | `beach_eagle` has 3.7x reviews (13,400 vs 3,660); t1 is batch stub |

### P1 Detail: 3 Duplicate Photo URLs (Swap These)

| Venue to Fix | Replacement Unsplash URL |
|--------------|--------------------------|
| `angourie-point-s3` | `photo-1559156452-cba0d6c0c397?w=800&h=600&fit=crop` |
| `portillo-s4` | `photo-1491555103944-7c647fd857e6?w=800&h=600&fit=crop` |
| `beach_phuquoc` | `photo-1528127269322-539801943592?w=800&h=600&fit=crop` |

Note: portillo-s4 is a legitimate venue (Portillo, Andes) — swap the photo, do not delete the venue.

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| **Open-Meteo weather proxy** | Jack (VPS SSH session) | **GATES Reddit launch. Day 15.** |
| **Reddit launch date** | Jack | Ski season window: ~2.5 weeks remaining |
| **LLC approval** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide |
| **Apple Developer enrollment** | Jack — $99/yr | Defer to post-1K |

---

## This Week's Top 3 Priorities Only

**1. Jack: Deploy the weather proxy. This week. Non-negotiable.**
Day 15. Two Express routes, VPS SSH session, `pm2 restart proxy`, smoke test. Without it, the Reddit post is a time bomb. With it, the app handles a front-page spike and retains the users who arrive from it.

**2. Delete 5 duplicate venues + fix 3 duplicate photos.**
Five deletions, three photo swaps. All IDs and replacement URLs are in this report. ~30 minutes. Bundle with a cache bump to 20260503a. 240 → 235 venues. This closes the "fake data" attack surface before Reddit.

**3. Jack: Set the Reddit launch date today.**
The ski season scoring window closes around May 20–25 for Northern Hemisphere resorts. A May 10 launch is a tri-sport app. A June launch is a beach-only app with orphaned ski venue cards. Name the date today. Everything downstream — the proxy deploy, the duplicate cleanup, the post draft — has a forcing function once there's a date.

---

## Explicit Product Decisions — May 3

**1. Open-Meteo proxy: SHIP before any Reddit post. Decision 16. Locked.**

**2. 5 duplicate venues: DELETE THIS WEEK. Not next week.**
Twelve days of consecutive flags. All specs written. All IDs confirmed in current code. If these aren't deleted by May 5, escalate to Jack — this is not a hard decision, it's an execution gap.

**3. Reddit launch: Must happen before May 20. SHIP.**
Every week of delay in May costs disproportionately more than any other month. Pick a date before May 10.

**4. portillo-s4: SWAP PHOTO, NOT DELETE.**
Prior PM v30 suggested deleting portillo-s4 to close a photo dupe. Reversing that call. Portillo is an iconic venue (Andes, Chile). The issue is the photo, not the venue. Swap the URL per the table above.

**5. Content agent AP audit flag: IGNORE. Mark closed.**
Six APs flagged as missing are confirmed present in source. Agent audited incorrectly. Added to Permanent Closed above. Do not re-action.

**6. Wishlists / Trips tabs: DEFER until 1K MAU. Locked.**
Standing decision. No revisit before 1K MAU.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Window Score v1 | **DEFER** | Post-Reddit. Need user signal before touching frozen scoring display. |
| Forecast Horizon | **DEFER** | Requires Window Score as prerequisite. Phase 2. |
| Strike alerts background worker | **CUT to post-500 MAU** | Zero users with active alerts. No ROI. |
| Onboarding scoring explainer | **DEFER** | Build after Reddit surfaces actual confusion, not before. |
| SRI + CSP hardening | **DEFER** | Babel requires `unsafe-eval` — CSP is partial at best. Post-launch. |
| iOS App Store | **DEFER** | PWA first. $99 enrollment post-1K. |
| Wishlists / Trips reveal | **DEFER** | 1K users. Locked. |
| Social sharing / OG images | **DEFER** | Nice-to-have. Not launch-blocking. |
| Ski gear high-AOV items | **DEFER** | Post-LLC (need affiliate IDs). Post-Reddit. |
| Group coordination | **CUT** | Phase 6. Pre-PMF. |

---

## Success Criteria

**Targets:** 500 MAU at 30 days post-launch | 5K–8K MAU at 90 days

**For 8K, not 5K, three things must be true:**

1. **Infrastructure holds**: Weather proxy live before launch. One viral comment without it = daily quota gone = scores all 50 = broken app = users don't return. Proxy live = app survives the spike = first-day retention is possible.

2. **Timing is right**: May launch reaches r/surfing + r/skiing simultaneously (~2x audience vs June). The 8K number requires the double audience. June is a beach-only story.

3. **Data is clean**: Five duplicates live on Reddit day = "lol fake data" screenshots in comments = thread poisoned. Clean data is table stakes for a credible launch post.

---

## One Product Risk Nobody Is Talking About

**The agent fleet is generating false positives that erode trust in real alerts.**

Today's content report flagged 6 APs as missing from AP_CONTINENT. They're not missing — all 6 are confirmed present in source code. This is the second or third time agents have re-flagged closed issues (Peakly Pro, Sentry DSN, TP_MARKER were all re-flagged multiple times). The risk: (a) Jack actions wrong things and introduces bugs while "fixing" non-issues, (b) Jack loses trust in reports and misses real P1s, (c) triage overhead from agent noise crowds out actual shipping work. The agent prompts need a "Permanent Closed" section — a list agents are explicitly told not to re-investigate. Until that's added, treat any agent flag that contradicts a Permanent Closed item above as a false positive.
