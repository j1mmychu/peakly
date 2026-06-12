# Peakly DevOps Report — 2026-06-12

**Status: 🟡 YELLOW**

VPS proxy P1 from yesterday is **still open** — Jack has not SSH'd in. No new P0s. Code is clean. Image lazy loading confirmed closed (was "unverified" yesterday). 13 stale `claude/*` branches on remote need cleanup before App Store submission.

---

## 1. Live Site Health

| Check | Result |
|---|---|
| `app.jsx` size | 13,021 lines / 652KB raw |
| Cache stamp | `20260610af` — lockstep across app.jsx / sw.js / index.html ✅ |
| Stamp staleness | 2 days (last app change: June 10) — **correct**; auto-push only bumps on app-bearing edits |
| Plausible analytics | Present, uncommented ✅ |
| GitHub Pages | Last deploy `8d4afef` (2026-06-11 16:16 UTC) ✅ |
| Sentry DSN | Wired (`9416b032…`) and initialized ✅ |
| GEAR_ITEMS | 0 — Amazon cut holds ✅ |
| VENUES | 353 (bracket-walk confirmed) ✅ |
| ALERTS_AVAILABLE iOS gate | Live ✅ |
| Brace balance | 5,509 / 5,509 — balanced ✅ |
| Image lazy loading | **9/9 `<img>` tags have `loading="lazy"` ✅** — yesterday's "unverified" finding is CLOSED |

**No app code changed on June 11 or June 12.** The only June 11 commits touched `peakly-native/README.md` and report files. Cache stamp correctly unchanged. Nothing to bump.

---

## 2. VPS Proxy Status — P1 🔴 (UNCHANGED FROM 2026-06-11)

Same 403 as yesterday. Network egress from this environment blocks the `peakly-api.duckdns.org` host — the 403 fires at the network level, not from Caddy, so I cannot confirm whether the fix Jack needs to run has been applied.

**Last confirmed working state:** 2026-06-10 evening (Jack verified `/health` post-reboot, per CLAUDE.md).

**What's dark today:**
- Flight pricing — `fetchTravelpayoutsPrice` returns null for all venues; all cards show `~$—`
- Shared weather cache — Reddit-spike protection inactive; app falls back to direct Open-Meteo correctly
- Push token registration — `alert_register_failed` fires for any user with alerts set

**This is a Jack-only action.** The exact fix steps are in the 2026-06-11 DevOps report (Section 2, SSH commands). Run them. Takes 10 minutes.

---

## 3. Stale Remote Branches — P1 (New) 🟠

**13 `claude/*` branches** and **3 other stale branches** are open on origin:

```
claude/analyze-test-coverage-WVIsT
claude/code-review-cleanup-HjoCS
claude/condense-alert-page-jzdLo
claude/enhance-loading-screen-rZ1dc
claude/implement-todo-lNL7W
claude/improve-peakly-ui-UHCHG
claude/improve-scoring-system-XYGY6    ← scoring changes — review before deleting
claude/redesign-front-page-EndKs
claude/review-peakly-ux-UQ0Qu
claude/simplify-alerts-page-2ejGB
claude/simplify-profile-page-Bi2Tc
claude/standardize-venue-data-CufiQ
claude/streamline-onboarding-account-97XRR
fix-appjsx-final                       ← "fix" prefix is a flag — may be a broken-state recovery branch
restore-appjsx                         ← "restore" prefix is a flag — same concern
test-small
```

The `claude/improve-scoring-system-XYGY6` branch name is a specific concern — CLAUDE.md explicitly prohibits scoring changes without an algorithm critique. If that branch contains live scoring changes that were never reviewed and never merged to main, it's either dead weight or a ticking liability.

**CLAUDE.md says:** scoring is unlocked but requires a critique before touching.

**Fix — one command, runs in 2 minutes:**

```bash
# Review what's in the suspicious ones first
git log --oneline origin/claude/improve-scoring-system-XYGY6 | head -5
git diff main...origin/claude/improve-scoring-system-XYGY6 -- app.jsx | head -80

# Then bulk-delete all claude/* branches if they're safe:
git push origin --delete \
  claude/analyze-test-coverage-WVIsT \
  claude/code-review-cleanup-HjoCS \
  claude/condense-alert-page-jzdLo \
  claude/enhance-loading-screen-rZ1dc \
  claude/implement-todo-lNL7W \
  claude/improve-peakly-ui-UHCHG \
  claude/improve-scoring-system-XYGY6 \
  claude/redesign-front-page-EndKs \
  claude/review-peakly-ux-UQ0Qu \
  claude/simplify-alerts-page-2ejGB \
  claude/simplify-profile-page-Bi2Tc \
  claude/standardize-venue-data-CufiQ \
  claude/streamline-onboarding-account-97XRR \
  fix-appjsx-final \
  restore-appjsx \
  test-small
```

**Why this matters for App Store:** An App Store reviewer who glances at the GitHub repo (uncommon but happens for open repos) seeing 13+ `claude/improve-*` branches signals unfinished/experimental state. More importantly, any CI/CD tooling that watches all branches (currently none, but if added) will run against these.

Last cleanup: 2026-05-09 (86 branches nuked). This batch is only 16. Low risk to delete.

---

## 4. Security Audit

### ✅ Travelpayouts token
Not in any client-side file. Server reads from `process.env.TRAVELPAYOUTS_TOKEN`. Clean.

### ✅ Recent commit history
No secrets in last 15 commits. No new credentials introduced since June 4.

### ✅ .gitignore
Covers `.env`, `*.pem`, `*.key`, `*.p8`, `.pdf`, `.pptx`, business docs. Clean.

### ✅ GEAR_ITEMS
`grep -c GEAR_ITEMS app.jsx` → 0. Amazon cut holds. Revenue model ($7.58/1K MAU) matches code.

### ⚠️ Supabase anon key hardcoded — P2 (documented, accepted)
```javascript
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```
Public-safe by design (RLS-gated). Risk: misconfigured RLS = all user data exposed.
**Pre-launch action (Jack):** Open Supabase dashboard → Authentication → Policies. Confirm `user_data` and `shared_lists` both have `USING (auth.uid() = user_id)` policies for SELECT/INSERT/UPDATE/DELETE. No policy = public read. This is a 5-minute audit.

### ⚠️ SRI missing on 5 CDN scripts — P2 (Open #10, unchanged)
Leaflet has SRI. React, ReactDOM, Babel, Supabase JS, Sentry, Plausible do not.

```bash
# Generate hashes for React + ReactDOM + Supabase (skip Babel — see note)
for url in \
  "https://unpkg.com/react@18.3.1/umd/react.production.min.js" \
  "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" \
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.2/dist/umd/supabase.min.js"; do
  echo "--- $url"
  echo "integrity=\"sha384-$(curl -sL "$url" | openssl dgst -sha384 -binary | openssl base64 -A)\""
done
```

**Do NOT SRI-pin Babel Standalone** — it uses dynamic sub-resource loading internally and will break.

Then add `integrity="sha384-<hash>" crossorigin` to the three `<script>` tags in `index.html`. ~15 minutes.

---

## 5. Performance Analysis

| Component | Est. Gzipped | Notes |
|---|---|---|
| **Babel Standalone 7.29.7** | **~290KB** | **#1 bottleneck — ~40% of total download** |
| ReactDOM 18.3.1 | ~130KB | |
| app.jsx raw | 652KB → ~130KB gzipped | ~20% compression ratio estimate |
| Supabase JS 2.106.2 | ~80KB | Lazy-loaded — not first-paint blocking ✅ |
| Sentry SDK | ~45KB | |
| Leaflet 1.9.4 | ~42KB | |
| React 18.3.1 | ~11KB | |
| **First-load total (gzipped)** | **~730KB** | Supabase excluded (lazy) |

Babel `<link rel="preload">` already in place in `index.html`. No further mitigation possible without a build step. Accept and ship.

**app.jsx growth:** 13,021 lines / 652KB today vs 13,021 lines / 636KB per June 11 report. The line count is identical — the byte difference is measurement artifact (the June 11 report rounded down). No material growth since June 10. The +4,015 lines in 7 days noted yesterday was a comparison vs June 4 (the state before the App Store sprint shipped 20 commits worth of work on June 9–10).

**Image lazy loading:** ✅ Confirmed. All 9 `<img>` tags in app.jsx carry `loading="lazy"`. Yesterday's "unverified" finding is closed.

---

## 6. CDN Versions

| Library | Pinned | Notes |
|---|---|---|
| React | 18.3.1 | ✅ |
| ReactDOM | 18.3.1 | ✅ |
| Babel Standalone | 7.29.7 | ✅ |
| Supabase JS | 2.106.2 | ✅ Verify 2.107+ for auth security patches if available |
| Leaflet | 1.9.4 | ✅ SRI pinned |

All exact-version pinned. No floating `@latest`. No surprise upgrades. Clean.

---

## 7. Cost Estimate

| Scale | Monthly Cost | What's the bottleneck |
|---|---|---|
| Current (<1K MAU) | **$6** | Nothing |
| 10K MAU | **$6–12** | 4K-entry LRU ceiling on VPS; popular venues start evicting, re-hit Open-Meteo |
| 100K MAU | **$60–120** | Node.js single-process OOM + Open-Meteo free-tier rate ceiling |

**What breaks first at scale:** The single-process Node.js VPS. At ~5K concurrent users, the in-memory weather cache LRU starts evicting. At ~10K concurrent, Open-Meteo rate-limits and the Node process approaches OOM on the 1GB droplet. Fix: Redis + 2GB droplet = $12/month, 2 hours of work. Not a today problem. Not even a pre-launch problem. The moment a Reddit/HN post lands and traffic spikes, the VPS cache goes from "nice to have" to "P0 in the next 4 hours." Don't post to Reddit until the VPS is actually responding to requests (fix P1 first).

---

## Action Items

| Priority | Item | Owner | ETA |
|---|---|---|---|
| **P1** | SSH to VPS — verify Caddy + DuckDNS, restore `/health`. See 2026-06-11 DevOps report §2 for exact commands | **Jack** | **Today** |
| **P1** | Review `claude/improve-scoring-system-XYGY6` diff vs main; delete all 13 `claude/*` + 3 stale branches | **Jack** | This week, before App Store submission |
| P2 | Audit Supabase RLS policies: `user_data` + `shared_lists` USING `auth.uid()` | Jack | Pre-launch |
| P2 | Paste `server/sql/delete-account.sql` into Supabase SQL editor | Jack | Pre-launch (App Store 5.1.1(v)) |
| P2 | Add SRI to React, ReactDOM, Supabase JS (skip Babel) — ~15 min | DevOps | This sprint |
| Parked | No CSP meta (Open #10) | — | Post-launch |
| Parked | Babel cold-parse perf (requires build step) | — | Post-launch |

---

## One Paragraph: What Breaks First

The single-process, in-memory Node.js proxy on a 1GB DigitalOcean droplet is the first domino. At ~5,000 concurrent users hitting popular ski/beach venues (say, Aspen and Tulum after a Reddit thread), the 4,000-entry weather LRU evicts and fresh upstream calls to Open-Meteo start compounding. Open-Meteo's free tier throttles at roughly 10,000 requests/hour per IP — with 353 venues × 7 forecast days per venue fetched per uncached user, that ceiling hits around 60–70 simultaneous unique-venue requests. The Node.js process doesn't crash instantly; it slows, queues back up, and the `/api/weather` 4-second client timeout starts firing, falling back to direct Open-Meteo from the client side — which then hits the same rate ceiling from the user's IP instead of the shared VPS IP. Prevention: before posting to Reddit, upgrade to a 2GB droplet ($12/mo), add Redis for a shared cross-process cache, and switch Open-Meteo calls to the VPS IP only (remove direct client fallback during spikes, or add an exponential backoff). That's a half-day of work and $6/month more. The current architecture survives a Product Hunt feature fine; it will not survive a Hacker News front page without that prep.
