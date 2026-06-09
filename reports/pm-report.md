# Peakly PM Report — 2026-06-09 (v53)

> Supersedes v52 (June 8). **Status: RED.** Three open P0/P1s: GEAR_ITEMS deleted (Amazon earns $0, no decision made), GitHub PAT expires June 15 (6 days), VPS unredeployed (Day 36). The product works. The revenue and the pipeline are bleeding.
>
> _Convention note: PM writes to this rolling `reports/pm-report.md` (the live pattern since v44)._

---

## Shipped Since v52 (2026-06-08 → 2026-06-09)

| What | Verdict |
|------|---------|
| **DevOps June 9** — cache stamp `20260608aaah` → `20260609a`, security clean, RED status confirmed | ✅ Cache aligned. |
| **Content June 9** — 5 venue candidates proposed (Verbier, Val Thorens, Yongpyong, Tenerife, Byron Bay) | ✅ Staged for June 10. |
| **~48 auto: commits June 4–9** — unreviewed pipeline activity | ⚠️ GEAR_ITEMS deletion came through here. |
| **GEAR_ITEMS** — still deleted (0 matches). v52 named this. Day 2 with no decision. | ❌ Revenue regression persists. |

**Code state June 9 (actual remote):**
- app.jsx: **10,009 lines** · PEAKLY_BUILD = `20260609a`
- 156 venues (67 ski / 89 beach)
- GEAR_ITEMS: **0 occurrences — Amazon earning $0**
- Capacitor.isNativePlatform() Alerts gate: live at app.jsx:9274
- Sentry DSN: active, non-empty
- Cache: `20260609a` — bumped by DevOps today

---

## Bug Triage — June 9

| Item | Severity | Days Open | Status |
|------|----------|-----------|--------|
| **GEAR_ITEMS deleted → Amazon earns $0** | **P1 (revenue)** | **Day 2** | RESTORE or CUT. No "we'll see." Decision 1. |
| **GitHub PAT expires 2026-06-15** | **P0 (pipeline hard deadline)** | **Day 2** | Jack: 3 min. github.com/settings/tokens → Regenerate. |
| **VPS proxy unredeployed** | **P0 (scale gate)** | **Day 36** | Jack: SSH. Same 3-min command. |
| CORS localhost origins in prod proxy.js | P1 | Day 6 | Bundle with VPS SSH — one session fixes both |
| Ski empty-state summer copy | P2 | Day 2 | June 10 sprint — named commitment from v52 |
| Outer Banks near-dup (beach_ob / outer-banks-nags-head-t7) | P3 | Day 7 | Post-launch merge or differentiate |
| Amazon ASIN dead links (B09Y4TF9KN, B07PXMZGS8) | P2 | Day 7 | Only matters if GEAR_ITEMS restored — spot-check then |
| SRI on 4 CDN scripts | P1 | Day 42+ | DEFER post-launch. Final. |
| CSP meta tag | P2 | Day 42+ | DEFER post-launch. Final. |

**Peakly Pro $9/mo vs $79/yr:** NOT an active bug. Pro UI removed April 16. Zero pricing renders in app.jsx. If Pro returns, canonical price = **$79/yr**. Close this loop.

---

## Known Blockers

| Blocker | What It Unlocks | ETA |
|---------|----------------|-----|
| **GitHub PAT renewal** | Auto-push pipeline past June 15 | **6 days — Jack today** |
| **GEAR_ITEMS decision** | Amazon revenue OR honest revenue model | **Jack today — pick one** |
| **VPS SSH + pm2 restart** | Weather cache (67 DAU ceiling), CORS fix, weekend pricing | Jack — 3 min |
| LLC approval | REI (+$6.16/1K MAU), Backcountry (+$0.64), GYG (+$1.20) | External |

---

## Explicit Product Decisions — June 9

**Decision 1: GEAR_ITEMS — RESTORE or CUT. Today. This is Day 2 of radio silence on a $4.48/1K MAU decision.**

Amazon Associates has been earning $0 since June 7. The v52 report named it. No response. Two options:

**Option A — RESTORE** (recommended if launch hasn't happened yet)
Restore from the last-good tree before the June 7 auto: deletions. Add an invariant guard to `scripts/auto-push.sh`:
```bash
# Add before git add in auto-push.sh:
if ! grep -q "GEAR_ITEMS" app.jsx 2>/dev/null; then
  echo "[auto-push] INVARIANT FAILED: GEAR_ITEMS missing — aborting commit"
  exit 1
fi
```
After restoring: bump cache, commit with a real message, spot-check Amazon ASIN links.

**Option B — CUT for v1**
Update CLAUDE.md Revenue Model to $7.58/1K MAU, drop checklist #8, document the decision. This is a real call, not a default.

The current state — code says $0, CLAUDE.md Revenue Model claims $4.48 — is dishonest. **Pick one.**

---

**Decision 2: GitHub PAT renewal is P0 with a hard June 15 wall.**

When the PAT expires: `auto-push.sh` fails silently, GitHub Pages freezes, every fix after June 15 is invisible to users. The `peakly-token-renewal` weekly watcher was supposed to alert at T-14 days (June 1). Either it didn't fire or nobody acted. Regardless: 6 days, 3 minutes, Jack, today.

```
1. github.com/settings/tokens → find token expiring 2026-06-15
2. Regenerate → 1 year expiry → copy
3. Update ~/.netrc or git credential store on auto-push machine
```

---

**Decision 3: 5 new venue additions — June 10 sprint, batch commit, NOT before launch.**

Content's June 9 proposals are clean: Verbier, Val Thorens, Yongpyong, Playa Las Teresitas (Tenerife), Byron Bay. Geographic gaps, good data. Adding them post-launch in one labeled commit is the right sequence. No untested changes on launch day.

Jack: confirm whether June 7 Reddit launch happened so the sprint scope is correct. If launch is done, add all 5 Monday. If not done yet, freeze until after the post.

---

## This Week's Top 3 Priorities Only

**1. Jack: GEAR_ITEMS decision + PAT renewal (25 min combined, today).**
PAT first (3 min, hard deadline). Then GEAR_ITEMS restore or formal cut (10 min). Both have been open for 2 days with clear actions. The PAT has a wall. The revenue regression compounds daily.

**2. Jack: VPS (Day 36).**
```bash
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull origin main && pm2 restart peakly-proxy && pm2 save && curl -s localhost:3001/health | head -20"
```
Without this, the site degrades silently at 67 DAU. If launch happened June 7, this is urgent now, not "nice to have."

**3. June 10 sprint: ski empty-state copy + 5-venue batch.**
Named commitment from v52. 2 hours of work:
- "Off-season · 6 resorts open" label on Skiing filter pill in summer
- 20-word empty state for off-season ski grid
- Add all 5 Content venues in one labeled commit
- Apply eager Supabase diff (`reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff`)

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Peakly Pro price change ($9/mo → $79/yr) | **NOT A CURRENT TASK** | Pro UI removed. No price renders. Canonical future price = $79/yr. Stop listing this. |
| New venue additions pre-launch | **DEFER until launch confirmed** | Code freeze pre-launch. Post-launch: batch all 5. |
| OBX near-dup merge | **DEFER post-launch** | P3. Doesn't affect conversion. |
| poolPrimary: true warm-water venues | **DEFER** | No pressing candidate, no user demand signal. |
| SRI + CSP | **DEFER July** | Babel unsafe-eval regression risk. Needs browser testing. |
| Hotels in deal score | **CUT. Final.** | v2 if demand validates. |
| Peakly Pro UI | **CUT for v1. Final.** | Post-1K MAU. |
| Wishlists / Trips tab | **LOCKED at 1K MAU gate** | No change. |

---

## Pre-Launch Checklist — June 9

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (showAlertsTab, app.jsx:9274) | ✅ |
| 3 | val-d-isere-s16 deleted | ✅ |
| 4 | Outer Banks ap ORF | ✅ |
| 5 | BookingConfirmSheet off flights | ✅ |
| 6 | SafetyWing CTA live | ✅ |
| 7 | Bora Bora BOB standardized | ✅ |
| 8 | **GEAR_ITEMS live** | ❌ **Deleted. Decision 1 — restore or cut today.** |
| 9 | Sentry DSN non-empty | ✅ |
| 10 | Seasonal default beach N-hem June | ✅ |
| 11 | lateSeason flags (6 ski venues) | ✅ |
| 12 | Cache 20260609a | ✅ DevOps bumped today |
| 13 | JSON-LD structured data | ✅ |
| 14 | Static H1 fallback | ✅ |
| 15 | Plausible domain validated | ❓ Jack to confirm |
| 16 | **VPS proxy verified live** | ❌ Day 36 |
| 17 | **GitHub PAT renewed** | ❌ Expires June 15 — 6 days |
| 18 | **Reddit launch status** | ❓ Was June 7. Jack confirms. |

---

## Revenue Model — June 9 (Accurate)

| Stream | Code Status | RPM/1K MAU |
|--------|-------------|------------|
| Amazon Associates (`peakly-20`) | ❌ DELETED — earning **$0** | ~~$4.48~~ $0 |
| Booking.com (`aid=2311236`) | ✅ Live | $6.90 |
| SafetyWing (`referenceID=peakly`) | ✅ Live | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ Live | $0.14 |
| REI (Avantlink) | LLC pending | +$6.16 |
| Backcountry / GetYourGuide | LLC pending | +$1.84 |

**Live RPM: $7.58/1K MAU.** Restoring GEAR_ITEMS returns to $12.06. The CLAUDE.md table still shows $4.48 for Amazon — that's wrong until Decision 1 is made.

---

## 90-Day Projection

| Scenario | Users (90d) | What Has to Be True |
|----------|-------------|---------------------|
| PAT renewed + VPS live + GEAR restored + launch happened | **5K–8K** | Proxy absorbs spike. Amazon earning. Pipeline stable. |
| PAT expires June 15 | **<2K** | Site freezes at last push. Bug fixes invisible. Churn. |
| VPS down when Reddit spike hits | **1K–3K** | Grid empty at 67+ DAU. "App is broken" perception. Hard to recover. |
| No launch before July | **<1K** | Summer beach window half over. 100K slips to 2027. |

**For 8K not 5K:** GEAR_ITEMS live, PAT renewed (25 min), VPS confirmed (3 min), Reddit post in top 10. Three of four are Jack-only, 28 minutes of total work, all open for 2+ days.

---

## One Product Risk Nobody Is Talking About

**The auto-push pipeline is an unreviewed logic gate to production — and it's now proven it will delete revenue-critical code with no alert.**

GEAR_ITEMS has been deleted twice by `auto:` commits — once pre-May-24 (restored `450891b`), once June 7 (still deleted today, Day 2). Both times: clean deletion, no crash, no smoke failure, caught only by daily PM grep. The pipeline is correct for cache bumps and report writes. It's not safe for app.jsx logic changes because it can't distinguish "accidental deletion" from "deliberate removal" and has no paper trail.

The minimum viable guard is already described in both v52 and the DevOps report: a 20-line invariant check in `auto-push.sh` that aborts if any revenue-stream constant (GEAR_ITEMS, Booking.com affiliate ID, SafetyWing referenceID, TP_MARKER) disappears from app.jsx. This catch is not comprehensive — it won't flag a scoring regression or a broken CTA — but it would have caught both GEAR_ITEMS deletions before they reached prod. The cost is 20 lines of bash. The cost of not doing it is running this grep in PM v54, v55, v56.
