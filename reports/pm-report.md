# Peakly PM Report v124 — 2026-08-19

**Status: YELLOW. Photo dedup is the only launch gate. Aug 22 is still possible. Cloudflare remains the only Jack-owned blocker.**

---

## Shipped Since Last Report (since Aug 18 PM)

| Commit | What | Right call? |
|--------|------|-------------|
| `6073bb1` | DevOps report 2026-08-19 — no code changes, YELLOW status | YES — accurate state capture |
| `05f59b9` | Content report 2026-08-19 — 394 venues, 81/100 health, photo dedup 47%, BASE_PRICES 99% | YES |

**No code commits overnight.** Agents ran, confirmed state, no regressions. That's exactly right behavior with 3 days to launch.

---

## Bug Triage

### Peakly Pro price discrepancy ($9/mo vs $79/yr) — Not a real bug.

Peakly Pro UI was **removed on 2026-04-16** and formally CUT for v1 in PM decision (CLAUDE.md open item, Revenue Model table). `grep "PEAKLY_PRO\|isPro\|pro.*UI" app.jsx` returns zero code-level Pro references. There is no $9/mo or $79/yr showing anywhere. This was stale context in the scheduled prompt — **not actionable, severity: none.**

### Sentry DSN — confirmed live.

DevOps 2026-08-19 verified: `9416b032a46681d74645b056fcb08eb7` in `index.html:77` + `app.jsx:7–8`, `Sentry.captureException` wired at `app.jsx:174`. **We are not flying blind.**

### Cache buster stale — not stale.

Cache stamp is `20260818a`. No app.jsx/sw.js/index.html commits landed Aug 19 that would need a bump. DevOps confirmed no action required. **Not a bug.**

---

## Current Launch State (2026-08-19)

| Metric | Status | Note |
|--------|--------|------|
| Venues | **394** (131 ski / 263 beach) | Moratorium active — no changes until Aug 30 |
| Photo coverage | **394/394 have a URL (100%)** | But 186/394 (47%) share a URL with ≥1 other venue |
| Photo dedup | **47% sharing / 83 duplicate groups** | Critical UX gap — scrolling Explore shows same shot 2-4× |
| BASE_PRICES | **160/162 APs covered (99%)** | 23 single-venue airports still missing, low impact |
| Exact-fares filter | **Fixed (6e45fee)** | ≥40% live coverage required before grid goes exact-fares-only |
| Sentry | ✅ Live | Error monitoring confirmed |
| Plausible | ✅ Live | Events: book_click, cloud_sync, install_pwa, scoring_explainer |
| Cloudflare | ❌ Outstanding | Jack's 30-min browser task. Needed before Reddit post. |
| VPS | ✅ Verified healthy 2026-08-11 | disk cache, CORS, DELETE alerts, apns:configured |
| Peakly Pro | ✅ CUT for v1, no code remaining | Nothing to fix |

---

## Three Product Decisions — Aug 19

### Decision 1: Photo dedup must drop below 25% before the Reddit post. Pipeline runs today.

The current state — 186/394 venues (47%) sharing a photo with at least one other venue — is unacceptable for a first impression on Reddit. Users landing from r/skiing or r/frugaltravel will scroll the Explore grid and hit the same beach shot 3 times in a row. That's a trust signal failure before they ever tap a venue.

The Content agent's report identifies the fix path: run `scripts/photos-fetch.mjs` (Wikimedia Commons, no API key) against the 83 dup groups, then `scripts/photos-apply.mjs --write`. Yesterday's three-commit Wikimedia sprint replaced 112 venues — a single run today should clear the majority of the 83 remaining dup groups.

**DECISION: Run the Wikimedia photo pipeline today (Aug 19), targeting the 83 dup groups specifically. If dedup coverage drops below 25% (≤100 venues sharing), Aug 22 is approved. If it stalls above 30% (>120 still sharing), push to Aug 29 and plan a focused Unsplash-key run on branded resort venues Wikimedia doesn't cover well.**

Success metric for today's run: 83 dup groups → <25 remaining. This is achievable based on yesterday's rate.

---

### Decision 2: Aug 22 vs Aug 29 — the gate is now dedup, not raw photo coverage.

The PM v123 framing was "≥330/394 venues with real photos." That metric was measuring unique-URL coverage. But DevOps 2026-08-19 clarifies: **all 394 venues already have a URL (100%)** — the issue is 186 sharing URLs, not 186 having no photo. The v123 goal was based on a misread of the metric.

Revised gate for Aug 22:
- **Photo dedup drops to <25% sharing after today's pipeline run** (≤100 venues with duplicate photos)
- **Cloudflare DNS configured** (Jack, 30-min browser task, confirmed by DNS lookup)
- **No P0 bugs introduced by today's pipeline commit** (auto-push smoke test passes)

If all three hold by Aug 20 EOD, post to r/skiing + r/frugaltravel on Aug 22, weekday morning 9–11am ET, staggered 48h.

**DECISION: Aug 22 is the target. Aug 29 is the fallback. The gate is photo dedup + Cloudflare. Not venue count. Not Unsplash key. Not BASE_PRICES (99% done — close enough).**

---

### Decision 3: The 23 remaining BASE_PRICES airports — stage for first post-Reddit cycle, not pre-launch.

The Content sprint went from 9% to 99% airport coverage in 5 days. The remaining 23 airports are all single-venue codes (BEY, BME, BOC, EYW, FEN, INH, etc.) in niche or emerging markets. These are legitimate destinations but their absence from BASE_PRICES means the deal score for those venues shows estimates instead of calibrated typical prices.

The impact: 23 venues out of 394 show slightly less calibrated deal scores. Users looking at Bocas del Toro or Fernando de Noronha will see `~$X` estimates instead of `DEAL` or `STRONG DEAL` badges. Not a launch blocker.

**DECISION: DEFER the remaining 23 to the first post-Reddit week. One agent run after Aug 22 can close these. Ship with 99% coverage — that's more than good enough.**

---

## This Week's Top 3 Priorities

**1. Photo dedup pipeline — run today against the 83 dup groups.**
Target: ≤100 venues still sharing after today's run (<25%). Content agent at 15:00 UTC is positioned to execute. This is the critical path to Aug 22.

**2. Jack: Cloudflare CDN — 30 minutes, Aug 19 or Aug 20 at the latest.**
CNAME peakly → j1mmychu.github.io through Cloudflare free tier. SSL: Full strict. Cache: max-age=3600 for static assets. Without this, a Reddit spike (even 2K concurrent) hits GitHub Pages directly. GitHub Pages is generous but not guaranteed at spike scale.

**3. Jack: Plausible audit + VPS pre-warm before posting.**
Log into Plausible: check bounce rate and avg session length for the last 14 days. If bounce > 70% or avg session < 30s, the exact-fares P0 (fixed Aug 18) was likely the driver — baseline will improve. SSH to VPS the morning of the post: `curl -s https://peakly-api.duckdns.org/health` — verify `wx_cache_size > 200`. If cold, hit the top 50 venue coords manually to warm the cache before traffic hits.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **Venue additions (ZTH/GGT/CFU/BDA/AYT + staged others)** | Moratorium holds. QA baseline is 394. Earliest add: Aug 30. |
| **JSON-LD structured data / static h1** | Zero conversion impact at <100 MAU. Post-launch SEO pass. |
| **Plausible custom events (detail-sheet tap, flight-link click)** | App.jsx edits 3 days before launch. Post-Reddit. |
| **SRI / CSP hardening** | Medium risk to apply, zero launch-day user impact. Post-launch. |
| **iOS App Store submission** | Requires Jack + Mac + Xcode. Post-Reddit. |
| **APNS / push alerts** | Two open bugs (HTTP/2 transport, JWT DER vs P1363). Do not touch pre-launch. |
| **Peakly Pro / subscription UI** | CUT for v1 since April. Not in product. Not re-evaluating pre-launch. |
| **BASE_PRICES for remaining 23 airports** | 99% coverage is ship-ready. Post-Reddit cycle. |

---

## Success Criteria

**What does 8K users look like vs 5K?**

| Driver | 5K path | 8K path |
|--------|---------|---------|
| Photo dedup | 30–40% sharing at launch | **<25% sharing — users scroll grid without repetition** |
| Post timing | Any afternoon | **Weekday 9–11am ET, r/skiing + r/frugaltravel staggered 48h** |
| Cloudflare | Not configured | **Live before post — no 429s during spike** |
| Viral hook | Standard Reddit post | **Post body includes 2-3 real screenshots of good venue cards** |
| Retention signal | Single-session | **Users check back next weekend — alerts tab as the retention mechanism** |
| VPS warm | Cold cache | **wx_cache_size >200 morning of post** |

The 5K→8K delta is almost entirely post quality and timing, not product features. A great post with good screenshots on a Wednesday morning beats a mediocre post on a Sunday. Jack owns the post; PM owns making sure the product looks good in those screenshots.

---

## Blocked

| Blocker | Owner | Unblocks |
|---------|-------|---------|
| Cloudflare DNS config | Jack (30 min, browser) | Reddit spike protection |
| Photo pipeline run for 83 dup groups | Content agent / this session | Aug 22 photo gate |
| Unsplash key + production access | Jack | ~50 branded resort venues Wikimedia can't cover (post-Reddit) |
| VPS pre-warm (morning of post) | Jack (SSH) | Cold cache on day-one traffic |
| LLC formation | Jack | REI / Backcountry / GetYourGuide affiliate approvals |

---

## One Product Risk Nobody Is Talking About

**We have no idea what users actually do in the app.**

We have Plausible pageviews and four events (book_click, cloud_sync, install_pwa, scoring_explainer). We don't know:
- Whether users open venue detail sheets (is the card clickable CTA discoverable?)
- Whether users tap through to Aviasales (is the Book button visible?)
- Whether any user has ever set an alert (the core retention mechanism)
- Whether the carousel loads before users bounce (carouselReady timing)

The exact-fares P0 was live for weeks and we had no signal it was happening from Plausible. We fixed it from code review, not data. If there's a similar silent failure in the venue detail flow or the alert flow, we'll find out from Reddit comments ("why can't I click through?") rather than from data.

The fix is a 20-minute app.jsx edit to add 4 Plausible events (detail-sheet-open, book-click-sheet, alert-set, carousel-rendered). That's post-Reddit by PM decision — but Jack should know going in that the first 48h of Reddit traffic will be the first time we actually know what users do. Watch the Plausible dashboard live when the post goes up.

---

*Report generated 2026-08-19 (v124). No code commits overnight — agents ran, state confirmed. Photo dedup (47% sharing / 83 groups) is the one quality gate between here and Aug 22. Pipeline run today should clear the bar. Cloudflare remains the only Jack-owned P1 before the post.*
