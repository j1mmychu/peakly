# Peakly PM Report — 2026-06-11 (v55)

> Supersedes v54 (June 10). **Status: RED.** Two new launch blockers surfaced today: VPS returning 403 (DuckDNS/Caddy issue post-reboot, flight pricing dark), and 208/353 venues (59%) displaying duplicate photos from the June 9 batch add. Reddit launch cannot happen with either of these unresolved.
>
> _Rolling file — v54 archived to context by reference._

---

## Shipped Since v54 (2026-06-10 → 2026-06-11)

| What | Verdict |
|------|---------|
| **App Store blockers commit `c70824f`** — GEAR_ITEMS re-cut (v54 conflict resolved ✅), iOS location string fixed, gated push `register()` on iOS, app-level Privacy Manifest | ✅ GEAR_ITEMS cut holds. Amazon out for v1. Revenue at $7.58/1K MAU. |
| **peakly-native/README.md update** (`dcc65f8`) | ✅ Housekeeping. No app-bearing file change — no cache bump needed. Correct. |
| **Daily DevOps + Content reports** | ✅ Both ran. Two new blockers surfaced (VPS 403, photo dedup). |

**Code state June 11 (verified):**
- `app.jsx`: 13,021 lines · `PEAKLY_BUILD = "20260610af"` · `CACHE_NAME = "peakly-20260610af"`
- **353 venues** (130 ski / 223 beach) — eval-counted, matches `.venue-baseline` ✅
- **GEAR_ITEMS: 0** — Amazon CUT confirmed ✅
- Sentry DSN: active ✅
- ALERTS_AVAILABLE iOS gate: live ✅
- **VPS proxy: 403 🔴** — flight pricing dark, weather cache offline
- **Photo duplication: 59% of venues 🔴** — 208/353 venues share duplicate Unsplash photos

---

## Bug Triage — June 11

| Item | Severity | Days Open | Status |
|------|----------|-----------|--------|
| **VPS 403 (DuckDNS/Caddy post-reboot)** | **P0** | **Day 1** | Jack: SSH to 198.199.80.21. DuckDNS TTL or Caddyfile broke during June 10 reboot. Runbook below. |
| **Photo duplication: 208/353 venues** | **P0** | **Day 1** | June 9 batch reused ~10 template photo IDs across 208 venues. Every user sees repeated photos scrolling Explore. Not shippable. |
| **GitHub PAT expires 2026-06-15** | **P0** | **Day 4** | 4 days. Jack: 3 minutes. If it expires, auto-push dies silently. |
| Auto-push venue guard still uses grep | P2 | Day 2 | Blind to JSON-format batch entries. Swap to eval counter from `status.sh`. |
| 5 venues with AP missing from AP_CONTINENT | P2 | Day 1 | Content agent flagged. One-line fix per code. |
| Outer Banks near-dup | P3 | Day 15 | DEFER post-launch. |
| SRI on CDN scripts | P3 | Day 43+ | DEFER post-launch. Final. |
| CSP meta | P3 | Day 43+ | DEFER post-launch. Final. |

**Peakly Pro pricing ($9/mo vs $79/yr):** NOT A BUG. Pro UI removed April 16. No price renders. Removing permanently from this prompt's task list.

---

## Known Blockers

| Blocker | What It Unlocks | Owner | ETA |
|---------|----------------|-------|-----|
| **VPS 403 fix** (DuckDNS TTL or Caddyfile) | Flight pricing online, weather cache, CORS fix | Jack, SSH | **Today** |
| **GitHub PAT renewal** | Auto-push pipeline past June 15 | Jack | **Today — 4 days left** |
| **Photo deduplication (208 venues)** | Grid looks like a product | Agent | **Before Reddit launch** |
| LLC approval | REI (+$6.16), Backcountry, GYG affiliates | External | Unknown |
| Reddit launch | 5K–8K user acquisition | Jack | **June 21 per Decision 3** |

---

## Explicit Product Decisions — June 11

### Decision 1: Photo duplication is a launch blocker. Ship the fix before Reddit.

The Explore grid shows the same beach photo repeated 17 times in a row for Caribbean venues. The same snow-day photo appears on Whistler, Zermatt, Val Thorens, and 23 other ski venues. A user's first impression of Peakly is a broken stock-photo carousel.

This is fixable without a manual sprint. Content agent generates a ready-to-ship patch of 208 unique Unsplash photo IDs. One commit. Auto-push ships it.

**Decision: SHIP photo dedup patch before launch. Venue additions are FROZEN until this lands** — adding more venues now increases the dedup problem. Content agent must make this its next output.

---

### Decision 2: VPS 403 escalation — Jack must SSH today.

The VPS issue changed character since v54. Before: proxy was running but needed pm2 restart. Now: Caddy returns 403 before requests reach Node.js. Flight pricing is dark. The June 10 `apt upgrade` + reboot likely dropped the DuckDNS site block from Caddyfile, or the DDNS TTL expired.

**Fix runbook (10 minutes):**
```bash
ssh root@198.199.80.21

# 1. Verify DuckDNS still points here
curl "https://www.duckdns.org/update?domains=peakly-api&token=<TOKEN>&ip="
# "OK" = fine. "KO" = DDNS token revoked.

# 2. Check Caddyfile has the site block
cat /etc/caddy/Caddyfile
# Should contain: peakly-api.duckdns.org { reverse_proxy localhost:3001 }
# If missing: add it, then systemctl reload caddy

# 3. Verify Node is alive
pm2 list && curl http://localhost:3001/health

# 4. Smoke from outside
curl https://peakly-api.duckdns.org/health
```

**Decision: VPS 403 is now P0, not P1.** Without flight pricing, the "cheap flight" half of the value prop is invisible to every new user. Launching with this dark is the single biggest conversion risk.

---

### Decision 3: Reddit launch moves to June 21. June 14 is off the table.

Two P0s surfaced today (VPS 403, photo duplication). Fixing both in 3 days is technically possible but the risk of launching with a partial fix is high. June 21 gives:
- VPS fix + verification: 2 days
- Photo dedup patch: 3-4 days (agent-generated)
- PAT renewal: today
- Pre-launch incognito audit: 1 hour

Summer beach window is open through September. One week doesn't change the 90-day trajectory. A launch with a broken grid does.

**Decision: June 21 (Saturday). Hard date. Pre-conditions: (1) VPS `/health` green, (2) grid has unique photos on first scroll, (3) PAT renewed. Miss any → June 28. These are binary gates, not suggestions.**

---

## This Week's Top 3 Priorities Only

1. **Jack: PAT renewal today.** 4 days. 3 minutes. Hard wall.
2. **Jack: VPS SSH + Caddy/DuckDNS fix.** 10 minutes. Binary launch gate.
3. **Content agent: photo dedup patch.** 208 venues, unique Unsplash IDs. Binary launch gate.

Everything else deferred until these three are green.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Peakly Pro price fix | **NOT A TASK. CLOSED.** | UI removed. No price renders. Off the list permanently. |
| App Store submission | **CUT to post-1K web users** | APNS unconfigured, account deletion SQL pending Jack, LLC not approved. |
| Additional venue adds | **HOLD** | Freeze until photo dedup ships. More venues = more dedup debt. |
| SRI + CSP hardening | **DEFER July** | Post-launch. |
| Hotels in deal score | **CUT. Final.** | v2 only. |
| Surfing category | **CUT. Final.** | Retired 2026-05-03. |
| OBX near-dup merge | **DEFER post-launch** | P3. No conversion impact. |

---

## Pre-Launch Checklist — June 11

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (3 sites) | ✅ |
| 3 | GEAR_ITEMS: 0 (Amazon CUT holds) | ✅ |
| 4 | Sentry DSN non-empty | ✅ |
| 5 | Seasonal default beach N-hem June | ✅ |
| 6 | lateSeason flags (27 ski venues) | ✅ |
| 7 | Cache stamp `20260610af` in lockstep | ✅ |
| 8 | JSON-LD structured data | ✅ |
| 9 | Static H1 fallback | ✅ |
| 10 | ScoringExplainer (one-time card) | ✅ |
| 11 | Grid sorts by Weekend Score | ✅ |
| 12 | **Photo deduplication (208 venues)** | ❌ **P0 — blocks launch** |
| 13 | **VPS proxy `/health` green** | ❌ **P0 — DuckDNS/Caddy 403** |
| 14 | **GitHub PAT renewed** | ❌ **P0 — 4 days — Jack today** |
| 15 | Plausible domain validated | ❓ Jack: confirm `j1mmychu.github.io` active in Plausible dashboard |
| 16 | Reddit launch date confirmed | ⚠️ **June 21 per Decision 3** |
| 17 | Account deletion SQL pasted in Supabase | ❌ Jack: paste `server/sql/delete-account.sql` |
| 18 | Pre-launch incognito mobile audit | ❌ Jack: ≥8 cards, unique photos, prices render |
| 19 | 5 venues with AP missing from AP_CONTINENT | ❌ P2 — one-line fix |

---

## Revenue Model — June 11

| Stream | Code Status | RPM/1K MAU |
|--------|-------------|------------|
| Amazon Associates | ❌ CUT (`grep -c GEAR_ITEMS app.jsx` → 0) | $0 |
| Booking.com (`aid=2311236`) | ✅ Live | $6.90 |
| SafetyWing (`referenceID=peakly`) | ✅ Live | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ Code live · ❌ VPS 403 (dark) | $0.14 when VPS fixed |
| REI (Avantlink) | LLC pending | +$6.16 post-LLC |
| Backcountry / GetYourGuide | LLC pending | +$1.84 post-LLC |

**Live RPM (VPS up):** $7.58/1K MAU. Dark today due to VPS 403.

---

## 90-Day Projection

| Scenario | Users (90d) | What Has to Be True |
|----------|-------------|---------------------|
| VPS fixed + unique photos + Reddit June 21 top-10 | **6K–8K** | All three P0s cleared, summer beach peak open |
| VPS fixed but duplicate photos at launch | **2K–3K** | Bounce rate spikes, screenshots don't spread |
| PAT expires June 15, no renewal | **<1.5K** | Every post-launch fix invisible, churn compounds |
| No Reddit launch before July 15 | **<2K** | Summer window half-consumed, 100K slips to 2027 |

---

## One Product Risk Nobody Is Talking About

**The 353-venue catalog + VPS 403 + summer = worst possible first session for a landlocked US user.**

A user from Denver (DEN) opens Peakly in June. The seasonal default correctly switches to Beach. They see 246 beach venues. Flight pricing is dark (VPS 403), so every card shows `~$—`. The `flightHours` filter defaults to 6hr, which from DEN reaches Cancun and Hawaii — good options. But with prices dark, they look identical to Maldives and Bora Bora (which are $800+ from DEN). The user sees 30 cards with no price signal. They leave.

This is the 100% reproducible failure mode for any inland US user today. The VPS fix is the only unlock. Price differentiation is the signal that makes the grid scannable. Without it, Peakly is a photo gallery of beaches, not a decision tool.

**Implication for launch sequencing: VPS fix must happen before the Reddit post. Not after.** If it goes down after launch, you have 2-4 hours to fix it before bounce data craters. If you launch with it already down, you get zero.

---

*Report written: 2026-06-11 | PM v55 | Build: 20260610af | Venues: 353 (130 ski / 223 beach, eval-counted)*
