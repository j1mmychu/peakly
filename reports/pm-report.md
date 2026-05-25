# Peakly PM Report — 2026-05-25 (v38)

> Latest report. Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: RED. Zero commits in 3 days. It's Memorial Day. Reddit window is today or never until June 5. Three P0/P1 bugs flagged May 22 are still open.**

---

## Shipped Since Last Report (2026-05-22 → 2026-05-25)

**Nothing.** Zero commits since `43f2466` (Daily PM report — May 22).

The May 22 report said GEAR_ITEMS ships "today." val-d-isere-s16 and outer-banks OAJ→ORF close "with GEAR_ITEMS in one commit." Cache bumps to `20260522b`. None of it shipped. Three days of silence on launch-critical code.

**Was the Reddit post made?**
Cannot verify from git. Memorial Day weekend is May 23–26. If the post went up Saturday May 24 without these fixes, ~200 first-hour users landed on:
- Amazon gear section that earns $0 (GEAR_ITEMS missing entirely from app.jsx)
- Outer Banks flights priced from Jacksonville NC, 70 miles from the actual beach
- A duplicate Val d'Isere entry diluting Tignes scoring

If the post didn't go up: today (May 25, Memorial Day itself) is the last viable window. After 3pm PST the holiday scroll rate drops. After today it's June 5 beach launch.

---

## Active Bug Triage — May 25

| Bug | Severity | Days Open | Action |
|-----|----------|-----------|--------|
| **GEAR_ITEMS completely absent from app.jsx** | **P0** | **Day 12** | Not gated with `{false}` — the entire const doesn't exist in app.jsx. Amazon earns literal $0. Last flag before Amazon gets struck from Revenue Model as fiction. |
| **VPS proxy redeploy — UNVERIFIED** | **P0** | **Day 21** | `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && curl localhost:3001/health"`. Open-Meteo free tier rate-limits at 43 DAU. Reddit sends 200+ in hour 1. |
| **outer-banks-nags-head-t7 ap:"OAJ"** | **P1** | **Day 12** | OAJ=Jacksonville NC, 70mi from OBX. Fix: `ap:"ORF"` (Norfolk). app.jsx:548. Breaks flight pricing on live traffic. |
| **val-d-isere-s16 still in VENUES** | **P1** | **Day 12** | Dup of `tignes` (same Espace Killy massif). app.jsx:530. Also referenced in Alerts Quick Template at app.jsx:5192 — change to `"tignes"`. Approved for delete May 13. |
| **Seasonal ski empty state missing** | **P1** | **Day 10** | June 1 is 7 days away. N-hem ski grid thins to <6 venues. "Nothing great this weekend" doesn't explain why. Looks broken. 10-min JSX fix. |
| **Plausible data-domain misconfigured** | **P1** | **Day 3** | `index.html:32` fires `data-domain="j1mmychu.github.io"` — covers entire GitHub Pages domain, not `/peakly` specifically. Validate: incognito → browse → check Plausible realtime. If events don't register, fix to `"j1mmychu.github.io/peakly"`. **Do this before the Reddit post goes up.** |
| **BookingConfirmSheet on flights** | **P2** | **Day 13** | Decision May 12: remove from flights, keep on hotels. Still on flights. Extra tap on highest-intent CTA. |
| **Leaflet loads unconditionally** | **P2** | **Day 13** | index.html:87–89 loads Leaflet CSS+JS on every page load even if user never hits map tab. ~40KB JS. Lazy-load or gate `MAPVIEW_ENABLED = false`. |

---

## Permanent Bug Triage

| Issue | Status |
|-------|--------|
| Sentry DSN empty | ✅ CLOSED — real DSN at app.jsx:7–8, script tag at index.html:77 |
| Peakly Pro $9/mo vs $79/yr | ✅ CLOSED — Pro UI fully removed; no pricing in app.jsx |
| Cache buster stale | ✅ CURRENT — `20260522a` aligned; no new code since May 22. **Bump to `20260525a` on next commit.** |
| JSON-LD structured data | ✅ LIVE — WebSite + WebApplication + Organization at index.html:35–64 |
| Static h1 fallback | ✅ LIVE — index.html:391 |
| SEO surf copy | ✅ CLOSED |
| APNS Capacitor gate | ✅ LIVE — showAlertsTab at app.jsx:8158 |

---

## Explicit Product Decisions — May 25

**Decision 1: Reddit posts today before 3pm PST or we wait for June 5. No third option.**

Today is Memorial Day. Last day of the holiday weekend scroll window. Verify VPS health now: `curl https://peakly-api.duckdns.org/health`. Green + Plausible validated = post today. Anything else = June 5 beach-season angle.

**VERDICT: 30-minute decision window. After 3pm PST Memorial Day the window is closed. June 5 is the fallback.**

---

**Decision 2: GEAR_ITEMS. Day 12. Final flag.**

Amazon Associates earns $0. At 5K users that's $22/mo left on the table. At 10K it's $45/mo. The revenue model table says "LIVE ($4.48/1K MAU)." That is currently false.

**VERDICT: GEAR_ITEMS ships in the next code commit or Amazon gets permanently struck from the Revenue Model table. No more PM flags after today. The report either shows a merge commit or it shows Amazon deleted from the table.**

---

**Decision 3: Plausible validation before the Reddit post. Non-negotiable.**

If `data-domain` is misconfigured, every post-Reddit decision — what converts, which venues get clicked, what bounces — is based on wrong data. 5 minutes. Incognito tab. Check realtime dashboard.

**VERDICT: Validate before posting. If wrong, fix `data-domain` in index.html and bump cache to `20260525a`. This gate does not move.**

---

## This Week's Top 3 Priorities Only

**1. Code commit block: GEAR_ITEMS + val-d-isere-s16 delete + outer-banks OAJ→ORF + cache bump `20260525a`.** Four fixes, one commit, ~45 min. Was supposed to ship May 22. Ship it now.

**2. Jack: VPS verify + Plausible validate.** Both 5–10 minutes. Both Jack-only. Both are binary gates for the Reddit post. Do them now, before the Memorial Day window closes.

**3. Seasonal ski handoff banner.** June 1 is 7 days out. Detect skiing category with <6 venues scoring ≥70 in June, inject a 15-line JSX banner: "Ski season is winding down — beach season is just starting." Two CTAs: "Switch to Beach" + "Southern Hemisphere Skiing." Converts a silent bounce into a category switch. Ship before June 1.

**After these three: zero new features until 100 Plausible users verified with correct attribution.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Any net-new feature | **HARD BLOCK** | 3 open P1s + GEAR_ITEMS + VPS unverified. New code on unfixed infrastructure is how launches crater. |
| Venue additions | **DEFER post-Reddit** | 148 is clean. More pre-launch = more data bugs to debug under fire. |
| MapView improvements | **DEFER** | Validate demand first. Unconditional Leaflet load is the P2 — fix load order before improving the feature. |
| Onboarding flow | **DEFER** | ScoreBreakdown handles tap-in trust. Full onboarding is a 1K MAU decision. |
| Wishlists / Trips tab reveal | **LOCKED** | 1K MAU gate. |
| Hotels in deal score | **CUT — removed from future reports** | Dead four times. Gone. |
| Peakly Pro | **CUT for v1** | Post-1K MAU only. |
| Southern Hemisphere ski expansion | **DEFER post-Reddit** | June timing is right for content but wrong for launch risk. |

---

## Success Criteria — May 25

**Pre-launch checklist:**

1. ✅ SEO meta clean
2. ✅ APNS Capacitor gate
3. ✅ Cache buster current (bump `20260525a` on next commit)
4. ✅ Sentry DSN wired
5. ✅ JSON-LD structured data live
6. ✅ Static h1 fallback
7. ❌ **GEAR_ITEMS** — Day 12. Ships today or Amazon struck from revenue table.
8. ❌ **val-d-isere-s16 deleted** — Day 12. One line.
9. ❌ **outer-banks ap OAJ→ORF** — Day 12. One field.
10. ❌ **Seasonal ski empty state** — Day 10. 10-min JSX.
11. ❌ **VPS proxy verified** — Jack SSH. Day 21. Binary gate.
12. ❌ **Plausible domain validated** — 5 min incognito check. Before post.
13. ❌ **Reddit post** — Jack's voice. Today before 3pm PST or June 5.

**90-day projection:**

- **8K** (Reddit today, May 25): Memorial Day last window. Ski tail + pre-beach overlap. Items 7–12 must be closed first.
- **6K** (Reddit June 5): Beach-only angle, peak season, no ski tail. ~2K users left on the table vs today.
- **4K** (Reddit June 15+): Summer beach competition peaks. No differentiated angle. Harder crowd.

The gap between 8K and 6K is today. The gap between 6K and 4K is two weeks.

---

## One Product Risk Nobody Is Talking About

**The seasonal cliff hits 7 days after launch and turns first-week users into churners.**

June 1 is 7 days away. On June 1, N hemisphere ski season ends. 64 of 148 venues are skiing. Those 64 go from scoring 70–95 to scoring ~8 ("Off-season — resort closed"). A user who finds Peakly from the Reddit post today, loves it, and opens the app on June 7 sees a grid that's 30% thinner with skiing venues all marked "closed" — and zero copy explaining why. They assume the app broke. They don't come back.

The empty state copy (app.jsx:4766) says: "Quiet for skiing this weekend. Other categories may be firing." That's fine for filter-driven empties. It's not fine when the entire category is seasonally dead and you have no seasonal handoff message.

The fix is 15 lines of JSX: detect month >= June AND skiing category AND firing venues < 6, render "Ski season is winding down in the Northern Hemisphere. Southern Alps fire up in July — or beach season is peaking right now." Two CTAs. Ships in 20 minutes.

Without it, we'll see a Day-30 retention drop in Plausible that looks like a product quality problem. By the time the data shows it, those users are gone.

**Ship the seasonal handoff banner before June 1. It is not optional if we post this weekend.**
