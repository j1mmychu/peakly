# Peakly DevOps Report — 2026-06-20

**Status: 🟢 GREEN**

Cache stamp was 1 day stale (`20260619a`) — bumped to `20260620a` in this run (app.jsx / sw.js / index.html in lockstep, braces balanced 5552/5552). All invariants pass. **Today is the Reddit launch deadline per PM v62/v63.** No P0 code issues blocking the post. Jack: verify VPS live from a networked terminal before posting.

> **Sandbox note:** Outbound egress to `peakly-api.duckdns.org`, Open-Meteo, and GitHub Pages is blocked from this remote execution environment. VPS health and live-site smoke cannot be verified here. A sandbox 403/timeout is NOT evidence the VPS is down. Last confirmed VPS healthy: June 13 (networked session, per CLAUDE.md). Jack: run `curl https://peakly-api.duckdns.org/health` before hitting Post.

---

## Fixes Applied This Run

| Fix | Files | Detail |
|-----|-------|--------|
| Cache stamp `20260619a` → `20260620a` | `app.jsx:17`, `sw.js:2`, `index.html:395` | 1 day stale — bumped |

---

## Full Invariant Check

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,220 lines / 664 KB raw (~175 KB gzip est.)** |
| CDN scripts | All HTTPS, exact versions pinned ✅ |
| Plausible analytics | Present, `defer`'d, `data-domain="j1mmychu.github.io"` ✅ |
| Cache stamp (pre-fix) | `20260619a` — 1 day stale |
| Cache stamp (post-fix) | `20260620a` ✅ |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all `20260620a` ✅ |
| Brace balance | **5552 open / 5552 close — BALANCED** ✅ |
| Sentry DSN | Configured at `index.html:77`, `defer`'d ✅ |
| Sentry init guard | `typeof Sentry !== "undefined"` — CDN-failure-safe ✅ |
| Venue count (eval) | **361** (130 skiing / 231 beach) ✅ |
| Venue baseline | `scripts/.venue-baseline` = 361 — no crater ✅ |
| Duplicate IDs | **0** ✅ |
| `GEAR_ITEMS` | **0** — Amazon v1 cut holds ✅ |
| `loading="lazy"` on images | All venue card `<img>` tags ✅ |
| `ALERTS_AVAILABLE` iOS gate | Live (line 8421) ✅ |
| `deleteAccount()` | Wired in `useCloudSync` (line 6699) ✅ |
| `weatherDown` banner | Live in ExploreTab (line 8759) ✅ |
| `ScoringExplainer` | Live ✅ |
| `DEAL_WEIGHT` | `0.25` (conditions 75% / price 25%) ✅ |
| `lateSeason: true` venues | **27** ✅ |
| Supabase eager script | Removed — lazy-loaded only ✅ |
| Leaflet eager script | Removed — lazy-loaded only ✅ |
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Old HTTP IP (`104.131.82.242`) | Not present in client code ✅ |
| `fetchTravelpayoutsPrice` timeout | `AbortController` 5s + estimate fallback ✅ |
| `_tryProxyWx` timeout | 4s + null-return → direct Open-Meteo fallback ✅ |
| Travelpayouts token in client | **Not present** — server-side only ✅ |
| Supabase anon key in client | Present — expected, RLS-gated, public by design ✅ |
| `.gitignore` secrets coverage | `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12` all covered ✅ |
| Babel in PRECACHE | `https://unpkg.com/@babel/standalone@7.29.7/babel.min.js` ✅ |

---

## Open Issues (Priority Order)

### P0 — Jack-Only Blockers (zero code blockers exist)

**1. Reddit post — today is the deadline**

PM v62 set Friday June 20 as the hard deadline. Code is clean, 361 venues, cache fresh `20260620a`. The only thing between here and launch is Jack opening reddit.com and posting.

Pre-post checklist (5 minutes from a networked terminal):
```bash
# VPS health
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Should show: wx_cache_size > 0, poll_worker: running, apns_configured: false (expected)

# Live site
curl -s https://j1mmychu.github.io/peakly/ | grep -c "Peakly"
# Should return 1+
```
If both pass → post.

**2. VPS health unverified from this sandbox**

Last confirmed live: June 13. SSH in before posting:
```bash
ssh root@198.199.80.21 'pm2 status && curl -s localhost:3001/health | python3 -m json.tool'
```
Expected: `peakly-proxy` online, `wx_cache_size` populated, `apns_configured: false`.

**3. Supabase delete-account SQL — App Store gate only, not Reddit gate**

Not a Reddit blocker. Blocks App Store 5.1.1(v). Paste once:
```
Supabase dashboard → SQL Editor → paste contents of server/sql/delete-account.sql → Run
```
2 minutes. Do before any App Store submission.

---

### P1 — Fix This Week

**SRI missing on React and ReactDOM CDN scripts**

Babel (`<link rel="preload">`) and Leaflet (`<script>`) already have SRI. React and ReactDOM on unpkg don't. A CDN compromise could serve malicious JS to every user session.

Generate the correct hashes (run from any networked terminal):
```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
# → paste as sha384-<hash>

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
# → paste as sha384-<hash>
```

Then update `index.html` lines 80–81:
```html
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<HASH_FROM_ABOVE>"
  crossorigin="anonymous"></script>
<script crossorigin
  src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"
  integrity="sha384-<HASH_FROM_ABOVE>"
  crossorigin="anonymous"></script>
```

Estimated time: 10 minutes. Cannot be done from this sandbox (egress blocked).

---

### P2 — Fix This Sprint

**CLAUDE.md venue count is stale (says 353, eval returns 361)**

Three venues shipped June 19 (Cape Cod/Hamptons/PR per PM v63), plus ongoing additions pushed the real count to 361. CLAUDE.md "Current State" header still reads 353/358. Minor doc rot.

Fix: update "353 venues" → "361 venues (130 ski / 231 beach)" in CLAUDE.md at next manual session.

---

### P3 — Deferred / Informational

| Item | Notes |
|------|-------|
| Tag depth (some ski venues ≤1 tag) | DEFER July sprint — no scoring impact |
| `lateSeason: true` on `coronet-peak` (S-hem, redundant) | DEFER July sprint |
| CSP meta tag | Conflicts with Babel runtime `eval()` for JSX — defer until build step |
| Open-Meteo rate ceiling | Trip wire at ~66 concurrent DAU on shared venues. VPS cache (live) prevents this. Real fix: `pm2 cluster` at 10K MAU. |

---

## Security Summary

No credentials in client code. Confirmed clean:

- **Travelpayouts API token:** server-side only (`server/proxy.js`) ✅
- **Supabase anon key:** present in client, expected — RLS ensures it only accesses the authenticated user's own rows. Not a secret under Supabase's security model. ✅
- **No `sk-`, `PRIVATE_KEY`, `SERVICE_ROLE`, or bearer tokens** anywhere in `app.jsx` ✅
- **`.gitignore`** covers `.env*`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.mobileprovision` ✅
- **Git log clean** — no commits with secret exposure in the recent 57-commit history ✅

TP_MARKER `710303` is a public affiliate marker (not an API key). Client-side exposure is intentional and industry-standard for affiliate deep links.

---

## Cost Projection

| Scale | Infra Cost/mo | Notes |
|-------|--------------|-------|
| <1K MAU | **$6** | Current: DigitalOcean 1GB droplet |
| 1K MAU | **$6** | VPS weather cache absorbs concurrency spike |
| 10K MAU | **~$18** | Upgrade to 2GB DO + Supabase free tier holds |
| 100K MAU | **~$100** | 4GB DO + Supabase Pro ($25) + CDN for app.jsx |

Revenue at 1K MAU: **$7.58** (Booking $6.90 + SafetyWing $0.54 + Travelpayouts $0.14). Infra is $6. Profitable from the first 1K users.

**What breaks first at scale:** Open-Meteo's free tier is 600 requests/minute per IP. At ~66 concurrent DAU all hitting the same uncached venue set, upstream calls would fan out and hit the ceiling. The VPS proxy's in-memory 2hr cache with in-flight dedupe (deployed, live) means 1000 simultaneous users calling the same (lat, lon) trigger exactly 1 upstream call. The real ceiling before needing a second droplet is ~5K concurrent. At 10K MAU, run `pm2 start proxy.js -i 2` (cluster mode, 2 workers) and add Redis for shared cache between workers. That's a $15 add-on, not an architectural rewrite.

---

## CDN Dependency Versions

| Library | Pinned Version | SRI | Status |
|---------|---------------|-----|--------|
| React | 18.3.1 | ❌ Missing (P1) | Current stable |
| ReactDOM | 18.3.1 | ❌ Missing (P1) | Current stable |
| Babel Standalone | 7.29.7 | ✅ on preload | Current |
| Sentry | Loader (auto-updating) | N/A | ✅ |
| Supabase JS | 2.106.2 (lazy) | N/A | ✅ |
| Leaflet | 1.9.4 (lazy) | ✅ | ✅ |
