# DevOps Report — 2026-08-14 (YELLOW)

**Status: 🟡 YELLOW**

Today is 2026-08-14. Reddit launch locked for Aug 22 — **8 days out**. Running from a sandboxed remote environment; VPS (`peakly-api.duckdns.org`) is unreachable at the network level (egress proxy returns 403 — standard for this sandbox). Per CLAUDE.md current state (2026-08-11): VPS was redeployed by Jack that evening, `/health` confirmed `apns:configured`, Open #19 CLOSED, disk cache (Open #23) confirmed live. Treating VPS as healthy.

**Action taken this run:** Cache stamp was 3 days stale (`20260811v`). Two app.jsx commits since Aug 11 modified production code without bumping the cache key. **Fixed inline** — bumped `20260811v → 20260814a` across `app.jsx`, `sw.js`, `index.html`.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | 13,462 lines / 682 KB |
| `dist/app.min.js` | 449 KB minified (esbuild, Babel stripped) |
| Plausible analytics | ✅ present, uncommented |
| Cache stamp | ✅ Fixed this run: `20260814a` (was stale `20260811v`) |

**Cache stamp was stale — root cause:** Two commits modified `app.jsx` without going through `auto-push.sh`'s cache-bump logic:
- `bea6ed8` (2026-08-12): EU/Asia BASE_PRICES batch — direct `git commit` by remote agent, no hook
- `8c0f93e` (2026-08-13): PM v118 Caribbean/US BASE_PRICES batch — same

Consequence: users with the Aug 11 service worker cache were served stale `app.jsx` content on visits between Aug 12–14. SW stale-while-revalidate means second visit gets fresh code, but first visit hit old code (missing ~17 new BASE_PRICES entries). Fixed this run.

**Repeat prevention:** Remote agents committing directly to `app.jsx` must manually bump the cache stamp, OR their commits must be followed by a local `auto-push.sh` run. The hook only fires from Jack's local PostToolUse — it doesn't fire in remote sandboxes.

---

## 2. Flight Proxy Status

- **URL:** `https://peakly-api.duckdns.org` — HTTPS ✅ (no HTTP P0)
- **Timeout:** `fetchTravelpayoutsPrice` uses `AbortController` with 5000ms timeout ✅
- **Fallback:** Falls back to `BASE_PRICES` estimate on proxy timeout/error ✅
- **VPS health:** Unverifiable from sandbox. Last confirmed healthy: 2026-08-11 evening (Jack SSH, `/health` 200). Treating as live.
- **APNS:** `APNS_LIVE = false` in `app.jsx:12388`. Correct — `.p8` not configured. Alerts tab correctly gated off iOS native.

---

## 3. Weather & External APIs

- Open-Meteo: `forecast_days=14` (weather), `forecast_days=10` (marine) ✅
- Both primary calls go through VPS proxy first (4s timeout), fall back to direct Open-Meteo ✅
- Disk cache (Open #23) confirmed live in `server/proxy.js:383` — `WX_CACHE_FILE`, `writeFileSync`, `readFileSync` all present. Loaded from disk on VPS restart. **Open #23: CLOSED.**
- Open-Meteo free tier: ~10K calls/day. A cold-cache full-venue load is ~748 calls (374 venues × 2 API types). With disk persistence, a `pm2 restart` no longer means a cold cache unless the file is deleted. Reddit-spike risk is now mitigated.

---

## 4. Security Audit

**No secrets exposed. No new credentials committed.**

| Item | Status |
|------|--------|
| Travelpayouts token | ✅ Server-side only. Client only has `TP_MARKER = "710303"` (affiliate marker — not a credential) |
| Supabase anon key | ⚠️ Visible in `app.jsx:26` — intentional, documented in CLAUDE.md as "public-safe, RLS-gated." Verify RLS policies are strict before Reddit launch. |
| Sentry DSN | ✅ Wired at `app.jsx:8`. No empty string. |
| `.gitignore` | ✅ Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision` |
| Recent commits for secrets | ✅ Audited `bea6ed8` and `8c0f93e` — BASE_PRICES data only, no credentials |

**Supabase RLS verification before Reddit (10 min, Jack manual):**
```sql
-- Run in Supabase SQL editor to confirm RLS is enabled and blocking:
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- Every table should show rowsecurity = true
SELECT * FROM pg_policies WHERE schemaname = 'public';
-- Confirm no policy grants SELECT to anon on user_data
```

---

## 5. Performance Analysis

| Metric | Value |
|--------|-------|
| Cold load JS | ~449 KB (dist/app.min.js) + React 18 UMD (~42KB) + Babel stripped ✅ |
| Dev load JS | 682 KB app.jsx + Babel Standalone ~900KB = ~1.6MB parse on mobile |
| Images | `loading="lazy"` on all venue images ✅ (10 confirmed call sites) |
| CDN deps | React 18.3.1 ✅, Babel 7.29.7 ✅, Plus Jakarta Sans ✅ |

**Biggest bottleneck:** Venue photo quality is the perceived performance issue — generic stock photos unrelated to venues create cognitive dissonance that reads as "broken." 374 venues, ~346 still generic. This is Jack's flagged top remaining quality gap. Not an infra issue but it dominates user experience at launch.

**No SRI on CDN scripts (Open #10)** — still open, medium risk. Fix before Reddit if there's time:
```html
<!-- Generate SRI hashes: -->
<!-- curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A -->
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<hash-here>"></script>
```

---

## 6. BASE_PRICES Coverage (41% gap — deal scoring disabled for ~60 venues)

**Current coverage: 80/147 unique venue APs priced (54%)**

This figure reflects venues that have a top-level entry in `BASE_PRICES` for deal scoring. The PM's "58.5%" counts differently (includes partial inner-key coverage). Either way, ~60–67 venue APs are completely unpriced.

**67 unpriced destination APs** (venues at these airports show `~$X` estimate only, no deal badge):
```
AIT, BEY, BME, BOC, BOS, CHQ, CMB, CMH, DAD, DBV, DJE, EAS, ENI, EWR, EYW, FEN,
GCM, GEG, GIG, GOI, HNA, HUX, INH, JFK, JMK, JNX, JTR, KBV, KOA, KRK, KUL, LAX,
LEA, LOP, MAH, MBA, MCT, MIA, MLO, MYR, OKA, ORD, OSL, PHL, PMI, PPP, PQC, PRI,
RAK, RDD, RHO, SEA, SEZ, SID, SNA, SOF, SRQ, TAB, TBS, TFS, TGD, TPS, USH, UVF,
VPS, YKA, ZCO
```

**Note:** JFK, LAX, BOS, MIA, SEA, ORD are in the missing list because they're **venue destination airports** (venues near NYC, LA, Boston, Miami, Seattle, Chicago) with no outbound pricing FROM those cities TO themselves. These would be zero-distance trips — likely correct to leave unpriced or skip.

**High-priority batch** (populate the top 8 by venue count, ~1hr):
```javascript
// Add to BASE_PRICES in app.jsx (~line 6144):
  EWR:{ JFK:0, LAX:350, ORD:220, MIA:320, BOS:80, ATL:280, DFW:300, DEN:340 },  // Newark/NYC
  SNA:{ JFK:340, LAX:0, ORD:290, MIA:380, BOS:360, ATL:350, DFW:310, DEN:280 },  // Orange County/LA
  MYR:{ JFK:380, LAX:480, ORD:340, MIA:280, BOS:400, ATL:220, DFW:360, DEN:420 }, // Myrtle Beach
  GIG:{ JFK:780, LAX:980, ORD:850, MIA:640, BOS:820, ATL:700, DFW:760, DEN:880 }, // Rio de Janeiro
  KOA:{ JFK:820, LAX:380, ORD:680, MIA:760, BOS:860, ATL:740, DFW:620, DEN:540 }, // Kona/Hawaii
  CMH:{ JFK:280, LAX:480, ORD:200, MIA:340, BOS:300, ATL:240, DFW:300, DEN:360 }, // Columbus
  DBV:{ JFK:920, LAX:1100, ORD:980, MIA:1040, BOS:960, ATL:1000, DFW:1020, DEN:1060 }, // Dubrovnik
  RAK:{ JFK:840, LAX:1020, ORD:900, MIA:900, BOS:880, ATL:920, DFW:960, DEN:1000 }, // Marrakech
```

Estimated time: 30 min per 10 APs. 67 remaining ÷ 10 = ~3.5 hrs total to achieve 100% coverage.

---

## 7. Cost Estimate

| MAU | Compute | Bandwidth | DB | Estimated/mo |
|-----|---------|-----------|-----|--------------|
| Current (<100) | $6 DO droplet | ~0 | Supabase free | **$6** |
| 1K MAU | $6 DO droplet | ~10GB GitHub Pages | Supabase free (50K MAU limit) | **$6** |
| 10K MAU | $6–12 DO (if cache warms hot) | ~100GB GitHub Pages | Supabase free | **$12–20** |
| 100K MAU | $12 DO | GitHub Pages limit (100GB/mo) ⚠️ | Supabase Pro ~$25 | **$45–100+** |

**GitHub Pages 100GB bandwidth cliff:** At ~100K MAU × 1MB avg transfer = 100GB/month — exactly at the free tier limit. GitHub will throttle or take the site down. Mitigation: add Cloudflare in front of Pages (free CDN tier) to absorb bandwidth before hitting the Pages limit. Zero config change on the repo, 30-min DNS setup.

**DigitalOcean is fine through 10K MAU.** The 1GB RAM VPS running pm2 handles the weather cache and APNS work comfortably.

---

## 8. dist/ Tracked in git (P2 — binary bloat)

`.gitignore` lists `dist/` but files are force-tracked. Every app.jsx change commits a 449KB binary diff. Not blocking, but adds ~900KB to the repo on every full build cycle. The deploy.yml builds dist/ in CI, so tracking it is actually correct for the GitHub Pages→dist deploy flow — the `.gitignore` entry is misleading.

**Options:**
- Keep as-is (working, just bloated history)
- Switch to CI-only build: remove dist/ from git, let deploy.yml build + push to `gh-pages` branch

Post-launch cleanup. Not touching before Reddit.

---

## 9. Stale Remote Branches

**19 stale remote branches** exist (per `git fetch` output this run). Per PM v118, this has been moved to `known-skipped.md`. Flagging once more for Jack to run manually — takes 2 minutes, cleans up the fork:

```bash
git push origin --delete \
  claude/analyze-test-coverage-WVIsT \
  claude/code-review-cleanup-HjoCS \
  claude/condense-alert-page-jzdLo \
  claude/enhance-loading-screen-rZ1dc \
  claude/fix-app-jsx-content \
  claude/implement-todo-lNL7W \
  claude/improve-peakly-ui-UHCHG \
  claude/improve-scoring-system-XYGY6 \
  claude/product-reliability-assessment-w0poL \
  claude/redesign-front-page-EndKs \
  claude/review-peakly-ux-UQ0Qu \
  claude/simplify-alerts-page-2ejGB \
  claude/simplify-profile-page-Bi2Tc \
  claude/standardize-venue-data-CufiQ \
  claude/streamline-onboarding-account-97XRR \
  fix-appjsx-final \
  restore-appjsx \
  test-small \
  master
```

---

## What Breaks First at Scale

**GitHub Pages bandwidth at 100K MAU.** Open-Meteo rate limits were the previous #1 risk — that's now mitigated by the disk-persisted VPS cache (Open #23 closed). The new ceiling is GitHub Pages' 100GB/month bandwidth limit. At 100K DAU visiting once/day, downloading 1MB of assets each, that's 100GB/month exactly at the limit.

**Prevention:** Drop Cloudflare in front of GitHub Pages before any HN/Reddit post goes viral. It's a DNS change — CNAME the domain to Cloudflare, enable full proxy. Cloudflare's free tier absorbs unlimited bandwidth from GitHub Pages (it caches the static assets at edge). No code changes, no cost. This is a 30-minute setup that prevents a site outage if Peakly goes viral.

If that's too soon for a domain purchase: GitHub Pages can also absorb a smaller burst (Reddit launch ≈ 10K–50K visitors in 48h = ~10–50GB). That's survivable on Pages free tier.

**Second concern:** Supabase free tier caps at 50K MAU for auth. At 10K logged-in users doing cloud sync, that's fine. At 50K, upgrade to Supabase Pro ($25/mo) before the MAU count hits the wall or syncing breaks silently.

---

## Summary Table

| Priority | Item | Status | Fix Time |
|----------|------|--------|----------|
| ✅ FIXED | Cache stamp `20260811v` → `20260814a` | Done this run | 0 min |
| P1 | BASE_PRICES 54% coverage — 67 APs unpriced | Open | 3–4 hrs total |
| P2 | Supabase anon key visible — verify RLS before Reddit | Open | 10 min |
| P2 | No SRI on CDN scripts (Open #10) | Open | 30 min |
| P2 | Cloudflare in front of Pages — pre-Reddit scale prep | Recommended | 30 min |
| P2 | 19 stale remote branches | Open (known-skipped) | 2 min |
| P2 | dist/ tracked in git — binary bloat | Post-launch | Post-launch |
| ✅ CLOSED | Open #19 VPS redeploy | Done 2026-08-11 | — |
| ✅ CLOSED | Open #23 disk cache persistence | Done 2026-08-11 | — |
| ✅ CLOSED | APNS HTTP/2 + P1363 fix in proxy.js | Deployed, awaits .p8 config | — |
| ✅ GREEN | Proxy HTTPS, 5s timeout, fallback | — | — |
| ✅ GREEN | Plausible analytics | — | — |
| ✅ GREEN | Sentry DSN wired | — | — |
| ✅ GREEN | All images `loading="lazy"` | — | — |
| ✅ GREEN | .gitignore covers secrets | — | — |
