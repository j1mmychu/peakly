# Peakly PM Report — 2026-06-03 (v47)

> Supersedes v46 (June 2). **Status: YELLOW — holding.** Code is clean. All pre-launch bugs closed. VPS is the single remaining binary gate (Day 30). Reddit is 4 days out. Jack has one job.

---

## Shipped Since v46 (2026-06-02 → 2026-06-03)

| What | Verdict |
|------|---------|
| **DevOps June 3 audit clean** — app.jsx 8,996 lines, cache 20260602a confirmed, no secrets in client, no new P0s introduced. SRI gap and CSP absence carried forward. | ✅ Hold is holding. |
| **No app.jsx changes today** — code freeze maintained. Cache buster correct at 20260602a. DevOps report initially flagged 20260528a (stale agent read), but actual deployed code and SW are confirmed at 20260602a. | ✅ No action needed. |

**Context on the DevOps cache reading:** The June 3 DevOps agent read cache as 20260528a. This was a data-quality error in the agent's read path — the actual app.jsx:17, sw.js:2, and index.html:400 all show 20260602a from the June 2 commit (8646b7b). Agent data issues happen; what matters is code reality, not report text.

---

## Pre-Launch Bug Status — June 3

**All code-fixable P0s and P1s are CLOSED.** The only open item is infrastructure.

| Bug | Severity | Days Open | Status |
|-----|----------|-----------|--------|
| **VPS proxy unredeployed** | **P0** | **Day 30** | Jack only. Confirmed unreachable by DevOps agent (sandbox network restriction — may be false positive, could also be genuinely down). Jack must verify by SSHing directly. See command below. |
| SRI on 4 CDN scripts | P1 | Day 35+ | DEFER post-launch. Decision reconfirmed. |
| 25 ski venues missing skiPass field | P2 | Day 6 | DEFER post-launch. Not visible in current UI. |
| CSP meta tag | P2 | Day 35+ | DEFER post-launch. |

---

## Permanent Bug Triage — All Closed

| Issue | Status | Fixed |
|-------|--------|-------|
| SafetyWing CTA absent | ✅ CLOSED | June 1 (a31ea8a) — app.jsx:7455 |
| val-d-isere-s16 dup | ✅ CLOSED | June 1 — 156 venues |
| outer-banks ap OAJ → ORF | ✅ CLOSED | June 1 — app.jsx:584 |
| BookingConfirmSheet on flights | ✅ CLOSED | June 1 — flights direct, hotels modal |
| Bora Bora PPT→BOB | ✅ CLOSED | June 1 — both venues BOB |
| Coral Reef copy-paste tags (3 venues) | ✅ CLOSED | June 2 (8646b7b) |
| Cache buster stale | ✅ CLOSED | 20260602a correct |
| GEAR_ITEMS absent | ✅ CLOSED | May 27 |
| Sentry DSN empty | ✅ CLOSED | Non-empty since May 22 |
| APNS Capacitor gate (Path B) | ✅ CLOSED | app.jsx:8317 |
| Peakly Pro $9/mo vs $79/yr | ✅ CLOSED | Pro UI removed April 16 |
| S. hemisphere ski scoring | ✅ CLOSED | Never a bug |
| Seasonal default June N-hem | ✅ CLOSED | Correctly returns "beach" |

---

## Explicit Product Decisions — June 3

**Decision 1: SRI on CDN scripts is DEFERRED to post-launch. Final call.**

DevOps has flagged this for 35+ days. It's the right thing to do. It is not the right week to do it. Babel Standalone's use of `eval` and `Function()` internally means any CSP tight enough to matter will break JSX transpilation — requires careful `unsafe-eval` carve-outs and browser testing. Four days before Reddit launch with no staging environment is the wrong time to find out we broke the app for 10% of browsers.

**VERDICT: SRI + CSP go into the first post-launch sprint. Ship week of June 10. Block the Content agent from editing index.html until SRI is wired.**

---

**Decision 2: VPS verify is today's P0. Not Jack's "when I get to it" item.**

At 30 days open, the VPS redeploy has outlasted every other bug on this list. If the proxy is actually down (not just unreachable from the sandbox), then every user session for 30 days has been hitting Open-Meteo directly. The ceiling before rate limiting is ~66 concurrent users. The Reddit post sends 200+ in hour 1. Empty grid on launch = "broken" → permanent reputational damage.

Jack's 5-minute verification and restart:
```bash
# Step 1: Verify status
ssh root@198.199.80.21 "pm2 status && curl -s localhost:3001/health | head -30"

# Step 2: If proxy is not running or stale:
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull origin main && pm2 restart peakly-proxy && pm2 save"

# Step 3: Confirm via HTTPS
curl -s https://peakly-api.duckdns.org/health
```
Expected: JSON with `"wx_cache_size"` field. Anything else = proxy not running new binary.

**VERDICT: VPS status confirmed before any soft-launch posts go out. This is not optional. Soft launch posts on June 3–4 only if `/health` returns `wx_cache_size`.**

---

**Decision 3: No code changes between now and June 7 unless a P0 drops.**

Code is clean. Pre-launch checklist is 13 of 18 green. The 5 remaining items are all Jack actions (VPS, Plausible validate, smoke test, Reddit draft, agent crontab). There is no code work left for this launch.

**VERDICT: Code freeze holds. Any agent that edits app.jsx between now and June 7 without a P0 justification is overstepping. DevOps bumps the cache only if there's an app.jsx change. Content agent is in QA-only mode (tag verification, no new venues).**

---

## This Week's Top 3 Priorities Only

**1. Jack: VPS SSH today, June 3.** Verify and restart. Day 30. 5 minutes. Binary gate for soft launch and hard launch both.

**2. Jack: Soft launch posts June 3–4 (only after VPS confirmed).** r/skiing + r/traveldeals. Short, personal, first-person. "Found a Mammoth flight from SFO for $89 this weekend — built a tool that finds these." Real airport, real venue, real number. Link. Not a pitch.

**3. Jack: Human smoke test + Reddit draft by June 6.** Incognito → set home airport → Explore → venue → Flights button (confirm: goes directly to Aviasales, no modal) → Hotels button (confirm: modal + Booking.com) → ScoreBreakdown tap → Plausible realtime shows events. Write the June 7 post in your own voice. Post 9–11am PST: r/solotravel → r/frugaltravel → r/skiing (1hr apart).

**Zero new code between now and June 7.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| SRI on CDN scripts | **DEFER to June 10 sprint** | Breaks Babel `eval` unless tested carefully. Wrong week. |
| CSP meta tag | **DEFER to June 10 sprint** | Same. |
| Fernando de Noronha addition | **REJECTED (permanent)** | Duplicate of `beach_noronha` at app.jsx:512. Content agent error. |
| Las Leñas / Valle Nevado / Praia de Pipa / Sarakiniko | **DEFER to June 8 batch** | Good venues, code freeze. |
| skiPass backfill (25 venues) | **DEFER post-launch** | Not visible in current UI. Zero launch impact. |
| JSON-LD structured data | **DEFER post-launch** | Reddit traffic is referral. SEO gains accrue over months. |
| Home airport onboarding nudge | **DEFER to first patch** | High trust value. First week after launch. |
| APNS Path A | **DEFER to v1.1** | Path B live at app.jsx:8317. App Store not on June 7 path. |
| Wishlists / Trips tab | **LOCKED** | 1K MAU gate. |
| Hotels in deal score | **CUT** | Final. Three reports confirmed. |
| Peakly Pro | **CUT for v1** | Post-1K MAU. Off the table. |

---

## Revenue Model — June 3 Code-Verified

| Stream | Code Status | RPM/1K MAU |
|--------|-------------|------------|
| Booking.com (`aid=2311236`) | ✅ app.jsx:7491 | $6.90 |
| Amazon Associates (`peakly-20`) | ✅ GEAR_ITEMS live | $4.48 |
| SafetyWing (`referenceID=peakly`) | ✅ app.jsx:7455 | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ app.jsx:1937 | $0.14 |
| REI (Avantlink) | LLC pending | $0 |
| Backcountry / GetYourGuide | LLC pending | $0 |

**Current live RPM: $12.06/1K MAU.** All four active streams wired and code-verified. SafetyWing is now live (was $0 in every report before June 1). LLC approval unlocks +$8/1K MAU.

---

## Pre-Launch Checklist — June 7 Gate

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (Path B) | ✅ app.jsx:8317 |
| 3 | val-d-isere-s16 deleted (156 venues) | ✅ June 1 |
| 4 | outer-banks ap ORF | ✅ app.jsx:584 |
| 5 | BookingConfirmSheet off flights | ✅ June 1 |
| 6 | SafetyWing CTA live | ✅ app.jsx:7455 |
| 7 | Bora Bora BOB standardized | ✅ June 1 |
| 8 | GEAR_ITEMS live | ✅ Amazon active |
| 9 | Sentry DSN non-empty | ✅ |
| 10 | Seasonal default beach N-hem June | ✅ |
| 11 | lateSeason flags (7 ski venues) | ✅ |
| 12 | Cache 20260602a | ✅ |
| 13 | Coral reef tag fixes (3 venues) | ✅ June 2 |
| 14 | **VPS proxy verified live** | ❌ Jack, today June 3 |
| 15 | **Plausible domain validated** | ❌ Jack, by June 5 |
| 16 | **Human smoke test (incognito)** | ❌ Jack, by June 6 |
| 17 | **Reddit post written** | ❌ Jack's voice, by June 6 |
| 18 | **Agent crontab installed** | ❌ Jack, by June 4 |

**13 of 18 green. 5 remaining items are all Jack-only. No code work left.**

---

## 90-Day Projection

| Scenario | Users (90d) | What Has to Be True |
|----------|-------------|---------------------|
| June 7 + VPS live + post in top 10 | **6K–8K** | Proxy absorbs spike. Flight CTA direct. Organic tail from indexed content. |
| June 7 + VPS down | **1K–2K** | Grid empties under load. "Broken" pins the thread. Bounce rate kills organic tail. |
| June 14 (VPS confirmed late) | **4K–6K** | Still peak summer. Lose one prime Fri-Mon window. N-hem ski cards thinning by then. |
| No launch in June | **<1K** | Organic SEO. 100K goal slips to 2027. |

**For 8K not 5K:** VPS live (proxy absorbs spike), post in r/solotravel top 10 within 6 hours, flight CTA direct (now confirmed). Two of three are done. One is a 5-minute SSH command that has been sitting idle for 30 days.

---

## One Product Risk Nobody Is Talking About

**The ski window on the front page is closing and nobody has stress-tested the summer beach-only product experience.**

Right now the Explore grid shows a compelling mix: powder days in Patagonia and New Zealand (S. hemisphere winter), late-season Mammoth and Tignes, and a full beach row. That mix is what makes the app interesting in early June — it answers "where should I go this weekend" with genuine optionality.

By late June, the N. hemisphere ski venues all score near-zero. The grid becomes beaches-only. That's a fine product — but it's a different product. A user who opens the app for the first time on July 15 from Minneapolis doesn't get the same "wow" moment that a user on June 7 gets. The June 7 Reddit launch is catching the product at peak diversity.

The beach-only summer experience hasn't been audited. Nobody has looked at whether the filter defaults, the empty-state copy, and the venue quality hold up when the skiing row disappears. If the August version of the product feels thin, organic retention drops and the 90-day projection misses.

**The fix isn't urgent this week.** But the first post-launch sprint (week of June 10) should include: a beach-only Explore audit, scoring recalibration for summer peak conditions, and possibly a "Best Beaches This Summer" editorial framing in the carousel header. The product doesn't need a new feature — it needs copy and filter defaults that make the summer-only state feel intentional, not sparse.
