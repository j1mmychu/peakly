# DevOps Report — 2026-08-15 (YELLOW)

**Status: 🟡 YELLOW**

Today is 2026-08-15. Reddit launch deadline: Aug 22 — **7 days out**. Running from a remote sandbox; VPS (`peakly-api.duckdns.org`) is unreachable at the network layer (sandbox egress proxy returns 403 — standard). Per CLAUDE.md current state (confirmed 2026-08-11): VPS fully deployed by Jack, `/health` confirmed `apns:configured`, disk cache live, `forecast_days:14` live. Treating VPS as healthy — the sandbox 403 is not a VPS outage.

**Action taken this run — EXECUTED, not just reported:**
1. **BASE_PRICES batch (PM v119 Decision 3):** Pasted TAB/JMK/JTR/MAH/ENI/PPP/PRI/PQC (+8 APs) into `app.jsx`. Coverage lifts from 89/147 (60.5%) → **97/147 (66.0%)**.
2. **Cache stamp bumped:** `20260814b` → `20260815a` across `app.jsx`, `sw.js`, `index.html`. New-day stamp on first commit of Aug 15.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | 13,577 lines / 690 KB |
| `dist/app.min.js` | 449 KB minified (stale local artifact — CI rebuilds on push) |
| `dist/` cache stamp | `20260811r` (stale local artifact — CI regenerates on push, irrelevant) |
| Plausible analytics | ✅ present and uncommented in both `index.html` and `dist/index.html` |
| Cache stamp — `app.jsx` | ✅ `20260815a` (bumped this run) |
| Cache stamp — `sw.js` | ✅ `peakly-20260815a` (bumped this run) |
| Cache stamp — `index.html` | ✅ `?v=20260815a` (bumped this run) |
| Brace balance | ✅ 5481 open / 5481 close |

**CDN dependencies loaded in prod (`dist/index.html`):**
- Plausible: `plausible.io/js/script.hash.js` ✅
- Sentry: `js.sentry-cdn.com/9416b032a46681d74645b056fcb08eb7.min.js` ✅ (DSN wired at `app.jsx:8`)
- React: `unpkg.com/react@18.3.1/umd/react.production.min.js` ✅
- ReactDOM: `unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js` ✅
- **Babel Standalone is NOT loaded in prod** ✅ — `dist/index.html` loads `app.min.js` directly (esbuild pre-compiled). Babel only in dev `index.html`.

---

## 2. Flight Proxy Status

- **URL:** `https://peakly-api.duckdns.org` — HTTPS via Caddy ✅
- **Timeout:** `fetchTravelpayoutsPrice` uses `AbortController` with 5000ms timeout ✅
- **Weather proxy:** `_tryProxyWx` uses 4000ms timeout, falls back to direct Open-Meteo ✅
- **VPS health:** Unverifiable from sandbox. Last confirmed: 2026-08-11 (Jack SSH, `/health` 200, `apns:configured`). Treating as live.
- **APNS:** `APNS_LIVE = false` in `app.jsx`. Correct — `.p8` not configured. Alerts tab correctly hidden on iOS native.

---

## 3. Weather & External APIs

- Open-Meteo: `forecast_days=14` (weather), `forecast_days=10` (marine) ✅
- Proxy-first, direct-fallback pattern intact at all call sites ✅
- Client-side weather cache: 2hr TTL in localStorage (`WX_CACHE_TTL = 2 * 60 * 60 * 1000`) ✅
- Server-side disk cache confirmed live since 2026-08-11 (per CLAUDE.md) — cold restarts no longer wipe the cache. Open #23: CLOSED.
- Weather batch strategy: first-paint tier of 12 venues fires immediately, priority 200-venue batch runs in background, per-venue lazy-fetch on detail open. Correct.
- **Open-Meteo free tier:** ~10K calls/day. Cold-cache full load = ~748 calls (374 venues × 2). Server disk cache + 2hr TTL means real upstream traffic is very low. No rate limit risk at current scale.

---

## 4. Security Audit

**No exposed secrets. No new credentials committed.**

| Item | Status |
|------|--------|
| Travelpayouts token | ✅ Server-side only. Client holds `TP_MARKER = "710303"` (affiliate marker — not a credential, public-safe by design) |
| Supabase anon key | ⚠️ Visible in `app.jsx:26` — intentional, documented in CLAUDE.md as "public-safe, RLS-gated." RLS verification before Reddit (10 min, Jack SQL query) |
| Sentry DSN | ✅ Wired at `app.jsx:8` and `index.html:77`. Not empty. |
| `.gitignore` | ✅ Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision`, `*.pdf`, `*.pptx`, business docs |
| Recent commits for secrets | ✅ Audited — no credentials in any commit since last report |

**Supabase RLS verification — Jack's 10-min action before Reddit launch:**
```sql
-- Paste into Supabase SQL editor → confirm every table shows rowsecurity = true
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- Confirm no policy grants SELECT to anon on user_data
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

## 5. Performance Analysis

| Metric | Value |
|--------|-------|
| Prod JS payload | 449 KB (minified, esbuild) + React 18 UMD ~53 KB = ~502 KB total |
| Prod gzipped | `app.min.js` gzips to ~112 KB — acceptable |
| Dev load | 690 KB app.jsx + Babel Standalone ~900 KB = ~1.6 MB parse (dev only) |
| Images | `loading="lazy"` on all venue cards ✅ |
| CDN dep versions | React 18.3.1 ✅, Babel 7.29.7 (dev only) ✅ |
| Babel in prod | ✅ STRIPPED — `dist/index.html` has no Babel script tag |

**Biggest bottleneck:** Photo quality. 329+ of 384 venues show generic category stock unrelated to the actual venue. This reads as low-effort and erodes trust before users even tap a card. The Unsplash pipeline (`scripts/photos-fetch|review|apply.mjs`) is ready — only `UNSPLASH_KEY` from Jack unblocks it. This is the #1 remaining quality gap and the explicit Reddit launch gate per PM.

---

## 6. BASE_PRICES Coverage (EXECUTED this run — 66%)

**Before this run:** 89/147 unique venue APs priced (60.5%)
**This run executed:** +8 APs (TAB/JMK/JTR/MAH/ENI/PPP/PRI/PQC) per PM v119 Decision 3
**After this run:** 97/147 (66.0%)

All 8 APs verified present in `AP_CONTINENT` before paste — no conflicts found:
- TAB → `na`, JMK → `europe`, JTR → `europe`, MAH → `europe`
- ENI → `asia`, PPP → `oceania`, PRI → `africa`, PQC → `asia`

**Remaining: 50 APs still unpriced** (147 - 97 = 50). PM v119 target is 70% = 103 APs covered, which requires 6 more APs. The next batch candidates (per Content report): GIG/KOA/DBV/RAK/NAP/CAG — all high-traffic venue airports with zero BASE_PRICES coverage today.

**Coverage by impact:** TAB (Tobago) + JMK/JTR (Greek islands) + MAH (Menorca) hit high-traffic Mediterranean and Caribbean beach venues that dominate the top grid. ENI (Philippines) + PQC (Phú Quốc) + PPP (Whitsundays) + PRI (Praslin, Seychelles) cover marquee premium beach destinations. These 8 APs unlock deal badges for approximately 30–35 venues that were previously showing `~$X` only.

---

## 7. Cost Estimate

| MAU | Compute | Bandwidth | DB | Monthly |
|-----|---------|-----------|----|---------| 
| Current (<100) | $6 DO | ~0 | Supabase free | **$6** |
| 1K MAU | $6 DO | ~10 GB GitHub Pages | Supabase free | **$6** |
| 10K MAU | $6–12 DO | ~100 GB GitHub Pages | Supabase free | **$12–20** |
| 100K MAU | $12 DO | GitHub Pages limit ⚠️ | Supabase Pro $25 | **$45–100+** |

**GitHub Pages 100GB bandwidth cliff** is still the #1 scale risk. At 100K MAU × 1MB avg = 100GB/month, hitting the Pages free-tier ceiling. Mitigation: Cloudflare in front of Pages (free tier, 30-min DNS setup) absorbs CDN traffic before it reaches Pages. No code changes, no repo changes. This needs to happen before any viral post.

---

## 8. Stale Remote Branches

**Per PM v118: moved to known-skipped — Jack-only 2-min task.** Not re-raising as a finding. Branches still exist (`claude/*`, `fix-appjsx-final`, `restore-appjsx`, `test-small`, `master`). Jack's command when ready:

```bash
git push origin --delete \
  claude/analyze-test-coverage-WVIsT claude/code-review-cleanup-HjoCS \
  claude/condense-alert-page-jzdLo claude/enhance-loading-screen-rZ1dc \
  claude/fix-app-jsx-content claude/implement-todo-lNL7W \
  claude/improve-peakly-ui-UHCHG claude/improve-scoring-system-XYGY6 \
  claude/product-reliability-assessment-w0poL claude/redesign-front-page-EndKs \
  claude/review-peakly-ux-UQ0Qu claude/simplify-alerts-page-2ejGB \
  claude/simplify-profile-page-Bi2Tc claude/standardize-venue-data-CufiQ \
  claude/streamline-onboarding-account-97XRR \
  fix-appjsx-final restore-appjsx test-small master
```

---

## Summary Table

| Priority | Item | Status | Action |
|----------|------|--------|--------|
| ✅ EXECUTED | BASE_PRICES batch (+8 APs: TAB/JMK/JTR/MAH/ENI/PPP/PRI/PQC) | Done this run | Committed |
| ✅ EXECUTED | Cache stamp `20260814b` → `20260815a` | Done this run | Committed |
| P1 (Reddit gate) | Photos — 329+ of 384 generic stock | Blocked on UNSPLASH_KEY from Jack | Jack action |
| P1 | BASE_PRICES to 70% — needs 6 more APs (GIG/KOA/DBV/RAK/NAP/CAG candidates) | 66% now | Next DevOps run |
| P2 | Supabase anon key — verify RLS before Reddit | Open | Jack 10-min SQL |
| P2 | Cloudflare in front of Pages — pre-Reddit scale prep | Open | Jack 30-min DNS |
| ✅ CLOSED | Open #19 VPS redeploy | Done 2026-08-11 | — |
| ✅ CLOSED | Open #23 disk cache persistence | Done 2026-08-11 | — |
| ✅ GREEN | Proxy HTTPS, timeouts, fallbacks | — | — |
| ✅ GREEN | Plausible + Sentry wired | — | — |
| ✅ GREEN | Brace balance 5481/5481 | — | — |
| ✅ GREEN | .gitignore covers all secrets | — | — |
| ✅ GREEN | Babel stripped from prod bundle | — | — |

---

## What Breaks First at Scale

**GitHub Pages bandwidth, not Open-Meteo.** Open-Meteo rate limits were the previous top risk — neutralized by the disk-persisted VPS cache (confirmed live 2026-08-11). The new ceiling is GitHub Pages' 100GB/month bandwidth cap. A single viral Reddit post that drives 50K unique visitors in 48 hours would burn 50GB — half the monthly budget in two days. At 100K MAU that math runs out before the month does.

**Prevention is a DNS change, not a deploy.** Add Cloudflare in front of `j1mmychu.github.io` (free tier, full proxy mode). Cloudflare caches `app.min.js`, `sw.js`, React UMD bundles at edge — Pages sees almost zero egress. Setup: register a domain (peakly.app or similar), point DNS to Cloudflare, CNAME to `j1mmychu.github.io`. 30 minutes, zero code changes, $0/month additional. This is the single highest-leverage infrastructure action before Reddit.

**Second concern:** the deal badge is the hero differentiator but requires BASE_PRICES coverage. At 66% today, 34% of venue cards show `~$X` with no deal badge — those venues are effectively demoted in a value comparison even if they have great flight prices. The 70% threshold before Reddit (6 more APs) closes the most embarrassing visible gaps.
