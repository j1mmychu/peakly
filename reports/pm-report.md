# Peakly PM Report — 2026-05-25 (v38)

> Latest report. Supersedes v37 (May 22) and the unscheduled May 24 Memorial Day PM runs. Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: 🟡 ORANGE → closing on RED. Memorial Day window closing tonight. VPS still unverified Day 21. val-d-isere-s16 and outer-banks OAJ open 12 days. Reddit post status unknown.**

---

## Shipped Since Last Report (2026-05-22 → 2026-05-25)

| What | Commit | Right call? |
|------|--------|-------------|
| **GEAR_ITEMS restored** — `const GEAR_ITEMS` at app.jsx:257, wired at app.jsx:7332 | DevOps, 450891b (May 24) | ✅ Critical. Amazon was earning $0 for 15 days. Now active. |
| **Cache buster `20260525b`** — aligned across app.jsx, sw.js, index.html | Content, df499e7 (May 25) | ✅ Current. |
| **5 tag fixes** — nusa-dua-beach-t17, bulabog-beach-boracay-t19, an-bang-beach-t29, laguna-beach-t24, playa-de-la-concha-t3 | Content, df499e7 | ✅ Trust kills. Blue Flag doesn't exist in the Philippines or Vietnam. Fixed. |
| **Supabase 2.45.4 → 2.106.0 + Babel 7.24.7 → 7.29.4 re-applied** | DevOps, 59dd3be | ✅ These keep getting silently reverted by content-agent race condition. Third occurrence. |
| PM report May 23 + May 24 | Agent | ✅ Kept pressure on open P0s. |

**What didn't ship (called "ships today" on May 22 — now Day 3 of slippage):**

| Item | Status |
|------|--------|
| val-d-isere-s16 deletion | ❌ Still at app.jsx:564 |
| val-d-isere-s16 in Quick Templates | ❌ Still at app.jsx:5226 |
| outer-banks-nags-head-t7 ap OAJ → ORF | ❌ Still wrong at app.jsx:582 |
| Seasonal ski empty-state copy | ❌ Not confirmed in code |
| VPS proxy redeploy | ❌ Jack-only. Day 21. |
| Reddit post | ❌ Unknown from git. May 24 PM said "window closes tonight." |

**Was the Reddit post made?** Cannot verify from git. Memorial Day Saturday was May 24. Today is May 25. If it went out, it went out with: ✅ GEAR_ITEMS live, ✅ cache fresh, ❌ OBX flight pricing pointing at Jacksonville NC (70mi off), ❌ dup val-d-isere-s16.

---

## Active Bug Triage — May 25

| Bug | Severity | Days Open | Action |
|-----|----------|-----------|--------|
| **VPS proxy not deployed** | **P0** | **Day 21** | `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && curl localhost:3001/health"`. Open-Meteo free tier breaks at 43 DAU. Reddit sends 200+ in hour 1. App shows blank venue cards past this threshold. |
| **val-d-isere-s16 still in VENUES** | **P1** | **Day 12** | Dup of `tignes` (same Espace Killy massif). app.jsx:564. Also in Alerts Quick Template at app.jsx:5226. Approved delete May 13. |
| **outer-banks-nags-head-t7 ap:"OAJ"** | **P1** | **Day 12** | OAJ = Jacksonville NC, 70mi from OBX. Fix: `ap:"ORF"` (Norfolk). app.jsx:582. Breaks flight pricing on every user who loads this venue. |
| **Plausible data-domain unvalidated** | **P1** | **Day 3** | `index.html:32` fires `data-domain="j1mmychu.github.io"`. Fires for entire GitHub Pages domain. If events aren't appearing under the right property in Plausible realtime, every post-Reddit analytics decision is garbage. 5-min validate: incognito → browse → check realtime. |
| **Seasonal ski empty state** | **P1** | **Day 10** | June 1 in 7 days. N-hem ski grid goes thin, no copy explains why. Looks broken on Reddit screenshots. 10-min JSX fix. |
| **Agent sequencing race condition** | **P2** | **Day 3** | Content agent clobbers DevOps cache/dep bumps when they run same-day (happened 3x in 5 days). Supabase + Babel re-reverted twice. DevOps must run last in daily sequence. Fix: reorder cron — DevOps slot → 17:45, after all content runs. |
| **BookingConfirmSheet on flights** | **P2** | **Day 13** | Decision May 12: remove from flights, keep on hotels. Still on flights. Extra tap on highest-intent CTA. |
| **Leaflet loads unconditionally** | **P2** | **Day 13** | ~40KB JS loads on every page load regardless of map tab visit. Lazy-load or gate `MAPVIEW_ENABLED = false`. |

---

## Permanent Bug Triage

| Issue | Status |
|-------|--------|
| GEAR_ITEMS missing (Amazon $0) | ✅ CLOSED — shipped 450891b (May 24). Amazon Associates active. |
| Cache buster stale | ✅ CLOSED — `20260525b` aligned all 3 files. |
| Sentry DSN empty | ✅ CLOSED — real DSN at app.jsx:7–8, index.html:77. |
| Peakly Pro $9/mo vs $79/yr | ✅ CLOSED — Pro UI fully removed. |
| JSON-LD structured data | ✅ LIVE — WebSite + WebApplication + Organization at index.html:34. |
| Static h1 fallback | ✅ LIVE — index.html:391. |
| APNS Capacitor gate | ✅ LIVE — `showAlertsTab` at app.jsx:8158. |

---

## Explicit Product Decisions — May 25

**Decision 1: Reddit posts today before 3pm PST or waits for June 5. No middle ground.**

Memorial Day window is closing. If the post went up yesterday (May 24): good. If not: post now before holiday scroll drops off. The VPS must be verified before posting — at 43 DAU concurrent, blank venue cards appear. A "it's broken" comment at minute 5 is permanent.

**VERDICT: Verify VPS health right now (`curl https://peakly-api.duckdns.org/health`). Green = post if not already up. Anything else = June 5 beach angle.**

---

**Decision 2: val-d-isere-s16 + outer-banks OAJ delete in next code session. No more agent flags.**

Both approved. Both 1-line changes. Both 12 days overdue. val-d-isere-s16 is a dup of tignes and is feeding wrong venues into the Alerts Quick Template. outer-banks OAJ is actively sending users to book flights to Jacksonville NC. These are data accuracy failures on live traffic.

**VERDICT: Both ship in the next code session. If they're not in the next commit this PM stops tracking them and marks them P3 (cosmetic). At some point slippage means de-prioritization — but these break real user flows so they ship first.**

---

**Decision 3: Seasonal ski handoff banner ships before June 1. Hard date.**

June 1 is 7 days away. N-hem ski season ends hard. 64 ski venues score ~8. Users who found Peakly this weekend and return June 7 see a thinned grid with no explanation and assume the app is broken. A 15-line JSX block converts the cliff into a hand-off: detect month >= June AND skiing category AND firing venues < 6 → render "Ski season is winding down — beach season is peaking. Switch? →"

**VERDICT: Seasonal handoff banner ships by May 31. This is a retention gate, not a feature. Miss this date = Day-30 churn spike that looks like a product quality problem.**

---

## This Week's Top 3 Priorities Only

**1. Jack: VPS verify + Plausible validate.** Both 5–10 minutes. Both Jack-only. Both binary gates. Do now.

**2. Code session: val-d-isere-s16 delete + outer-banks OAJ→ORF.** One commit, two surgical changes, ~15 minutes. These were supposed to be May 22. They're now Day 12.

**3. Seasonal ski handoff banner.** 15 lines of JSX. Hard date May 31. Prevents the June 1 retention cliff from hitting Day-30 metrics.

**After these three: feature freeze until 100 Plausible users verified with correct attribution.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Any net-new feature | **HARD BLOCK** | P1 data bugs open, VPS unverified. No new code until these close. |
| Venue additions (Maldives, Mirissa, Ölüdeniz) | **DEFER post-Reddit** | 148 clean venues. More pre-launch = more data bugs under fire. |
| MapView improvements | **DEFER** | Gate Leaflet first. Validate map demand before improving it. |
| Onboarding flow | **DEFER** | ScoreBreakdown handles tap-in trust. Full onboarding = 1K MAU decision. |
| Airport IATA fixes (Japan: AXT/NGO) | **DEFER to June** | Not launch-blocking — no OAJ-scale proximity error. |
| S-hemisphere ski scoring fix | **June 3 hard date** | 6 S-hem venues incorrectly score ~0. Peak S-hem season opens mid-June. Miss June 3 = P0. |
| SRI hashes, CSP meta | **DEFER post-launch** | Zero user-facing value now. |
| Wishlists / Trips tab | **LOCKED — 1K MAU** | Hard lock. |
| Peakly Pro | **CUT for v1** | Off the board until 1K MAU. |
| Hotels in deal score | **CUT — removed from future reports** | Dead seven times. Gone permanently. |

---

## Success Criteria — May 25

**Pre-launch checklist (current state):**

1. ✅ SEO meta — no surf/adventure strings
2. ✅ APNS Capacitor gate
3. ✅ Cache buster — `20260525b` aligned
4. ✅ Sentry DSN wired
5. ✅ JSON-LD structured data live
6. ✅ Static h1 fallback
7. ✅ **GEAR_ITEMS** — shipped May 24 (450891b)
8. ❌ **val-d-isere-s16 deleted** — Day 12. Next code session.
9. ❌ **outer-banks OAJ → ORF** — Day 12. Same commit.
10. ❌ **Seasonal ski empty state** — Day 10. Ships before June 1.
11. ❌ **VPS proxy verified** — Jack SSH. Day 21. Binary gate.
12. ❌ **Plausible realtime validated** — Jack 5-min incognito check.
13. ❓ **Reddit post** — status unknown from git. If not yet posted: today before 3pm PST.

**90-day projection:**

| Scenario | Projection |
|----------|-----------|
| Reddit today (Memorial Day), VPS green | **8K** |
| Reddit yesterday (May 24), VPS green | **7.5K** |
| Reddit June 5 (beach angle) | **6K** |
| Reddit June 15+ | **4K** |

**What makes 8K not 5K:**
- r/skiing AND r/frugaltravel same weekend (not just one subreddit)
- VPS proxy live so scores don't blank out under load
- Plausible realtime validates → decisions based on real data
- Week-2 return rate >20% (requires seasonal handoff to keep June users engaged)

---

## One Product Risk Nobody Is Talking About

**The agent sequencing race condition is silently reverting shipped work.**

DevOps bumped Supabase to 2.106.0 on May 18 (commit 2386124). Content agent reverted it on May 20 (commit d5c43f2). DevOps re-applied it on May 25 (commit 59dd3be). Same for Babel 7.29.4. This is the third occurrence in 5 days per the DevOps report.

The current daily cron runs DevOps at 14:00 UTC, Content at 15:00 UTC. Content writes to index.html AFTER DevOps, overwriting the dependency bumps. This is a process failure masquerading as a stability story.

There are two security/compat upgrades that were shipped and unshipped twice. If Supabase 2.45.4 has a known CVE that 2.106.0 patched — which it very likely does given an 80-version gap — we are shipping known-vulnerable code right now.

**The fix is reordering cron: DevOps slot → 17:45 UTC (after Content + PM). One calendar change, zero code.** Without it, every dependency bump is unverifiable as a durable state — it may or may not be in the next commit depending on agent run order.

This is not cosmetic. It's a process hole that could send vulnerable Supabase code to a post-Reddit user base.
