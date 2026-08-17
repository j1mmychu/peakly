# PM Report v122 — 2026-08-17

> Supersedes v121 (Aug 16). **Status: YELLOW.** Day 47. Reddit target Aug 22 — **T-5 days**. Cache stamp: `20260816b` (no code changes since 08-16). Venues: **394** (131 ski / 263 beach). BASE_PRICES: **139/162 (86%)** — corrected from yesterday's 82% (denominator was wrong yesterday; today's Content run is authoritative).

---

## Shipped Since v121

| Commit | What | Assessment |
|--------|------|------------|
| `65ce187` | DevOps 08-17 YELLOW — no code changes; confirmed BP sprint closed + moratorium holding | ✅ Correct. Zero code changes was the right call. Discipline held. |
| `95ed5a7` | Content 08-17 — 5 venue proposals (ZTH/GGT/CFU/BDA/AYT) written to report; BASE_PRICES corrected to 86%; photo gap confirmed 208 dups | ⚠️ **Misleading commit title.** "5 new venue objects" implies additions to app.jsx. Zero venues were added. They're proposals in the report only — app.jsx last touched Aug 16. The moratorium was correctly respected. The title was wrong. |

**Permanent corrections — stop re-raising these:**
- **Open #23 (disk cache):** ✅ CLOSED. VPS 2026-08-11.
- **Peakly Pro price ($9/mo vs $79/yr):** ✅ CLOSED. Peakly Pro is CUT for v1. Zero instances in codebase. Not a bug.
- **Sentry DSN empty:** ✅ LIVE. DSN confirmed in app.jsx line 8.
- **"182 venues / 12 categories":** 394 venues, 2 categories.
- **VPS down:** ✅ CLOSED 2026-08-11 (Jack SSH). Sandbox 403 ≠ VPS outage.
- **BASE_PRICES 82%:** Corrected to **86%** (139/162). Yesterday's 133/162 used an incomplete airport denominator. Don't re-raise 82%.
- **Content commit title "5 new venue objects":** These are proposals in the report. app.jsx = 394 venues, unchanged from 08-16. Moratorium held.

---

## Bug Triage — Aug 17

| Bug | Severity | Status |
|-----|----------|--------|
| **Photos: 208 duplicate instances / 394 total (208 dupes, 186 unique)** | P0 (Reddit gate) | **T-5 days. UNSPLASH_KEY still not received. New finding: photo-candidates.json covers only 135/394 venues — 259 venues have ZERO candidates queued. Pipeline math doesn't support Aug 22.** |
| **BASE_PRICES: 23 APs uncovered (14%)** | P2 | All single-venue destinations. Sprint closed per v121 D1. Not blocking. |
| **Supabase delete-account SQL** | P0 (App Store only) | Jack 2-min paste. Web Reddit launch unaffected. |
| **15 stale claude/* branches on origin** | P3 | Post-Reddit cleanup. Not blocking. |

---

## Three Product Decisions — Aug 17

### Decision 1: Aug 22 Reddit launch is now aspirational. Plan for Aug 29.

**The math:**
- photo-candidates.json covers **135 of 394 venues** (34%)
- 259 venues have zero candidates queued
- Unsplash demo cap: 50 requests/hour → full 394-venue fetch = **~8 hours of wall clock**
- Even if Jack provides the key by EOD Aug 18 (T-3 days), the pipeline would complete late Aug 19 at the earliest
- Photo review (approve/reject picks in the browser UI) is a human step — several more hours
- That leaves ~2 days for commit, smoke test, dry-run, and Reddit post

**The real constraint:** Unsplash demo access (50/hr) means a 394-venue full-catalog run is ~8 hours minimum. If Jack applies for production access (instant approval, 5,000/hr), that shrinks to <30 minutes. Production access changes the whole timeline.

**DECISION: Reddit launch planning moves to Aug 29 as the primary date. Aug 22 survives only if (a) UNSPLASH_KEY arrives by EOD Aug 18 AND (b) Jack upgrades to Unsplash production access (5,000/hr cap) at the same time. Without production access, the 8-hour fetch alone makes Aug 22 a photo-quality miss. Jack: when you create the Unsplash app, click "Apply for production access" on the same page — it's a one-paragraph form, usually approved same day.**

This is not a slip caused by anyone dragging their feet. It's a pipeline capacity discovery. Aug 29 is a better first impression than a rushed Aug 22.

---

### Decision 2: Commit titles must reflect code reality

Today's Content commit said "5 new venue objects (ZTH/GGT/CFU/BDA/AYT)" when zero venues were added to app.jsx. This is a naming discipline issue, not a product issue — the moratorium was correctly respected. But misleading commit titles create two problems: (1) future audits misread history as code changes that didn't happen, and (2) the PM report has to spend a paragraph debunking the title every time it happens.

**DECISION: Content agent commit messages must match what actually changed in the codebase, not what the report contains as proposals. Proposals staged in a report are not "new venue objects" — they are "5 venue proposals for post-Reddit review." Update the content agent prompt to require this distinction.**

Note to Jack: the devops.md prompt was fixed Aug 14 for similar reasons. Same fix needed in tasks/agents/content-data.md. Adding: "If venue data is staged in the report only and NOT added to app.jsx, the commit message MUST say 'X venue proposals staged for review' — NEVER 'X new venue objects'."

---

### Decision 3: SHIP the Cloudflare CDN proxy before Reddit launch

**What it is:** Put Cloudflare free tier in front of GitHub Pages. 30-minute setup, $0. Absorbs Reddit traffic spikes across 100+ CDN edge locations, eliminates cold-edge misses for `dist/app.min.js` (439KB), and provides DDoS protection.

**Why now:** The devops report correctly identified this as worth doing before Aug 22. It's been sitting in "P2 — post-launch" but the risk calculus changed: Reddit can send 500–2,000 concurrent users in 30 minutes. GitHub Pages CDN will cold-miss on every new edge location. A 439KB JS file at 50 concurrent users = 22MB/s burst to cold edges. Cloudflare makes this invisible.

**The ask for Jack:** 30 minutes, all via browser, no code changes. Instructions from DevOps report:
```
1. cloudflare.com → Add site → j1mmychu.github.io
2. DNS: CNAME peakly → j1mmychu.github.io, Proxy = orange cloud
3. SSL/TLS → Full (strict)
4. Caching → Cache Level = Standard, Browser TTL = 4h
5. Done
```

**DECISION: SHIP Cloudflare setup before Reddit launch. Moves from P2 to P1. Jack does this while waiting for Unsplash access approval — the two tasks are parallel, zero code involved.**

---

## This Week's Top 3 Priorities

1. **Jack: Unsplash developer account + production access by EOD Aug 18.** Two steps on the same page: create app (get Access Key) AND click "Apply for production access" (one-paragraph form). Production access (5,000/hr) shrinks the 8-hour pipeline to <30 min. Without production access, Aug 22 launch is off the table. With it, Aug 22 is alive.

2. **Jack: Cloudflare free CDN in front of GitHub Pages.** 30-minute browser task. Do this Aug 18–19 while Unsplash access is being approved. Zero code changes. D3 above.

3. **Launch-day grid dry-run (Aug 21 or Aug 22 morning).** Before posting to Reddit, load the live app on a fresh browser session, screenshot the Explore grid top 10 cards, confirm they show compelling scores (>75), real venue names, non-duplicate photos. If more than 3 cards show Score: 50 or duplicate photos, delay the post by 24 hours. This is a judgment call, not a smoke test.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **Any new venue additions** | Moratorium. 394 is the pre-Reddit number. No exceptions until after launch. |
| **Additional BASE_PRICES APs (23 remaining)** | Sprint closed at 86%. Diminishing returns — all remaining are single-venue. Move on. |
| **SRI on CDN scripts** | Post-launch hardening. |
| **JSON-LD / h1 static SEO** | Zero conversion impact at <100 MAU. Post-Reddit. |
| **iOS App Store submission** | Requires Jack + Mac + Xcode. Post-Reddit. |
| **Venue deep links** | Decision from v119 stands: build after Reddit launch. |
| **Stale branch cleanup (15 claude/* branches)** | Post-Reddit housekeeping. |
| **APNS / push alerts** | Requires APNS HTTP/2 + JWT P1363 fix, uncommitted. Post-Reddit. |

---

## Success Criteria

**90-day target: 5K–8K users.** Reddit launch primary date now **Aug 29**. Aug 22 is alive only with Unsplash production access by EOD Aug 18.

| Driver | 5K path | 8K path |
|--------|---------|---------|
| Reddit post quality | 1 post to r/skiing or r/travel | **3 posts staggered Day 1/3/5 across r/skiing + r/travel + r/frugaltravel** |
| Photo quality at launch | 208 duplicates (current) | **Full photo pass complete — 394 venues with unique photos** |
| Unsplash access tier | Demo (50/hr — 8hr pipeline) | **Production (5,000/hr — <30min pipeline)** |
| Cloudflare CDN | Not set up | **Live before Reddit post** |
| Launch-day grid dry-run | Skipped | **Done Aug 21** |
| VPS cache pre-warmed | Default | **SSH verify wx_cache_size >200 day before post** |

---

## One Product Risk Nobody Is Talking About

The photo-candidates.json pipeline file covers **135 of 394 venues**. Even after the UNSPLASH_KEY arrives and the full photo-fetch runs, the pipeline will generate candidates for all 394 venues — but "candidates" are not confirmed picks. The photos-review step (`scripts/photos-review.mjs` + the browser review page) requires a human to approve or reject each pick. At 394 venues, even at 30 seconds per review, that's **~3 hours of human review time**. The photo pipeline has three steps: fetch (automated), review (human), apply (automated). Nobody is planning for the 3-hour review block in the Aug 22 timeline — it's the invisible constraint between "key arrives" and "photos committed." If the review step is skipped and photos-apply runs on unreviewed picks, the Unsplash API will surface some clearly wrong or off-brand results (a search for "Whistler Blackcomb skiing" can return a random skier on a different mountain). The review step exists for a reason. Plan it into the calendar explicitly, or the photo pass trades 208 duplicates for 394 wrong photos.

---

*Report generated 2026-08-17. Code unchanged since 2026-08-16. One P0 (photos, blocked on Jack's UNSPLASH_KEY + production-access upgrade). One P1 (Cloudflare CDN setup, Jack browser task, 30 min). Reddit primary date now Aug 29 — Aug 22 lives only with production Unsplash access.*
