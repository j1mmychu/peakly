# Peakly DevOps Report — 2026-05-27

**Status: 🟡 YELLOW**

One P0 fixed this run (cache buster stale again — same pattern as last week). Two long-tail P1s remain open 23 days — VPS redeploy and SRI hashes. APNS decision is now 14 days past its own self-imposed deadline with no movement. Amazon Associates gear stream has been $0 for 23 days because the `GEAR_ITEMS` constant and rendering code are gone from `app.jsx` — flagged twice now; this is the final warning before it moves to `known-skipped.md`.

---

## Fixes Shipped This Run

| Fix | Files | Detail |
|-----|-------|--------|
| Cache buster `20260522a` → `20260527a` | app.jsx:17, sw.js:2, index.html | Buster set at 14:12 on 05-22; content commit at 15:18 same day modified app.jsx without bumping it. 5 days stale. |
| SW CACHE_NAME `peakly-20260522a` → `peakly-20260527a` | sw.js:2 | Evicts stale SW-cached app.jsx on next controlled visit. |

---

## 1. LIVE SITE HEALTH

| Check | Value | Status |
|-------|-------|--------|
| `app.jsx` lines | 8,837 | ✅ |
| `app.jsx` bytes | 523,480 (~511 KB raw, ~157 KB gzip est.) | ✅ |
| Cache buster | `20260527a` — **fixed this run** | ✅ |
| SW cache name | `peakly-20260527a` — **fixed this run** | ✅ |
| Plausible analytics | Present, active, `data-domain="j1mmychu.github.io"` | ✅ |
| All CDN deps HTTPS | Yes | ✅ |
| Proxy URL (`FLIGHT_PROXY`) | `https://peakly-api.duckdns.org` — HTTPS | ✅ |
| Sentry DSN | Configured, non-empty | ✅ |
| CORS allowlist (proxy) | `j1mmychu.github.io`, `peakly.app`, localhost — restrictive | ✅ |
| Rate limiter (proxy) | 60 req/min/IP, in-memory Map with GC | ✅ |
| Travelpayouts token | Server-side `process.env` only | ✅ |
| Image lazy loading | `loading="lazy"` on all `<img>` tags | ✅ |
| PRECACHE | `[]` — no regression | ✅ |

### Why the buster keeps going stale

The PostToolUse hook (`~/.claude/settings.json`) fires `auto-push.sh` on every Edit/Write. When the **devops agent** bumps the buster in one commit and the **content agent** then edits `app.jsx` in a later commit *without bumping*, the buster immediately falls behind. This has now happened twice in two weeks (05-13 → fixed 05-22, 05-22 → fixed today 05-27).

**Permanent fix (2 options):**

Option A — Hook: add buster auto-bump to `scripts/auto-push.sh`. When `app.jsx` changed, grep the current buster, increment suffix (a→b→…→z), write to all 3 files in the same commit.

```bash
# In auto-push.sh, after detecting app.jsx change:
OLD=$(grep -oP '(?<=PEAKLY_BUILD = ")[^"]+' app.jsx)
TODAY=$(date +%Y%m%d)
# bump suffix a→b→…
if [[ "$OLD" == "${TODAY}"* ]]; then
  SUFFIX=${OLD#$TODAY}
  NEXT=$(echo "$SUFFIX" | tr 'a-y' 'b-z')
  NEW="${TODAY}${NEXT}"
else
  NEW="${TODAY}a"
fi
sed -i "s/PEAKLY_BUILD = \"${OLD}\"/PEAKLY_BUILD = \"${NEW}\"/" app.jsx
sed -i "s/CACHE_NAME = \"peakly-${OLD}\"/CACHE_NAME = \"peakly-${NEW}\"/" sw.js
sed -i "s/app.jsx?v=${OLD}/app.jsx?v=${NEW}/" index.html
```

Option B — Agent discipline: any agent that edits `app.jsx` must bump the buster in the same commit. Add one line to every agent prompt: *"If you edit app.jsx, bump PEAKLY_BUILD / CACHE_NAME / ?v= to today's date + next suffix letter."*

---

## P0 — CRITICAL (fix today, launch blocker)

---

### P0-A: GEAR_ITEMS constant + rendering code absent — Amazon Associates earning $0

**This is the final warning. Next report this moves to `known-skipped.md`.**

`CLAUDE.md` lists Amazon Associates (`peakly-20`) as LIVE at $4.48 RPM. The code doesn't exist. The `GEAR_ITEMS` constant was lost in the 2026-05-09 `git-filter-repo` history scrub and was never restored. There is no gear section anywhere in `app.jsx` (zero matches for "gear", "GEAR", "amazon", "Associates"). The gate expression `{GEAR_ITEMS[listing.category] && ...}` that CLAUDE.md credits to commit `a9aacf5` no longer exists.

**Revenue impact:** $0 Amazon Associates from 2026-05-09 to today = 18 days × projected ~$0.004/day/MAU at current near-zero traffic = functionally $0 now, but this is an ~$4.48/1K MAU dead stream that will compound every day post-launch.

**Paste-ready fix from content report — add to Constants section after CATEGORIES (around line 252):**

```javascript
// ─── Amazon Associates gear items (tag=peakly-20) ────────────────────────────
const GEAR_ITEMS = {
  skiing: [
    { title:"Smith I/O MAG Ski Goggles",      desc:"ChromaPop lens · fog-resistant",         price:249,
      url:"https://www.amazon.com/dp/B08CRDGDCX?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=120&h=120&fit=crop" },
    { title:"Atomic Bent Chetler 100 Skis",   desc:"All-mountain freeride · 100mm underfoot", price:599,
      url:"https://www.amazon.com/dp/B09KZQP7F3?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1522163182402-834f871fd851?w=120&h=120&fit=crop" },
    { title:"Burton Custom Snowboard Bindings",desc:"Channel-compatible · all-mountain flex",  price:329,
      url:"https://www.amazon.com/dp/B07PXMZGS8?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1483721310020-03333e577078?w=120&h=120&fit=crop" },
    { title:"Helly Hansen Ski Jacket",         desc:"HELLY TECH waterproof · recco reflector", price:449,
      url:"https://www.amazon.com/dp/B09Y4TF9KN?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1553689651-b4ff74a56a0b?w=120&h=120&fit=crop" },
  ],
  beach: [
    { title:"Hydro Flask 32 oz Wide Mouth",        desc:"TempShield insulation · sand-proof lid",  price:49,
      url:"https://www.amazon.com/dp/B07MT8ZLQR?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=120&h=120&fit=crop" },
    { title:"Aqua Marina Inflatable SUP Board",    desc:"11' all-round · complete kit",             price:499,
      url:"https://www.amazon.com/dp/B08MQL3Z8Z?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1562774053-701939374585?w=120&h=120&fit=crop" },
    { title:"Maui Jim Peahi Polarized Sunglasses", desc:"PolarizedPlus2 lens · UV400",              price:329,
      url:"https://www.amazon.com/dp/B00CEQXGRQ?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=120&h=120&fit=crop" },
    { title:"Nautica Rashguard UV50+",             desc:"Quick-dry · UPF 50+ sun protection",       price:45,
      url:"https://www.amazon.com/dp/B073RH8BJ9?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1560343090-f0409e92791a?w=120&h=120&fit=crop" },
  ],
};
```

After adding the constant, find the venue detail sheet in `app.jsx` and add the gear rendering block. The original gate expression was `{GEAR_ITEMS[listing.category] && ...}`. Revenue agent's rendering code (pre-scrub) was at app.jsx:5704. Reconstruct with:

```jsx
{/* ── Gear picks (Amazon Associates peakly-20) ── */}
{GEAR_ITEMS[listing.category] && (
  <div style={{ margin:"0 0 24px 0" }}>
    <div style={{ fontSize:13, fontWeight:700, color:"#222", fontFamily:F, marginBottom:10 }}>
      {listing.category === "skiing" ? "⛷️ Pack the right gear" : "🏖️ Beach essentials"}
    </div>
    <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:4 }}>
      {GEAR_ITEMS[listing.category].map(item => (
        <a key={item.title} href={item.url} target="_blank" rel="noopener noreferrer sponsored"
          style={{ flexShrink:0, width:120, textDecoration:"none" }}
          onClick={() => window.plausible && window.plausible("gear_click", {props:{item:item.title, category:listing.category}})}>
          <img src={item.img} alt={item.title} loading="lazy"
            style={{ width:120, height:120, objectFit:"cover", borderRadius:10 }} />
          <div style={{ fontSize:11, fontWeight:700, color:"#222", fontFamily:F, marginTop:4, lineHeight:1.3 }}>
            {item.title}
          </div>
          <div style={{ fontSize:10, color:"#888", fontFamily:F }}>{item.desc}</div>
          <div style={{ fontSize:11, fontWeight:900, color:"#0284c7", fontFamily:F, marginTop:2 }}>
            ${item.price}
          </div>
        </a>
      ))}
    </div>
  </div>
)}
```

**Estimated fix time: 15 min.**

---

## P1 — HIGH (fix this week)

---

### P1-A: VPS NOT REDEPLOYED — Weather proxy + weekend pricing dead code (Day 23)

Code has been sitting complete since 2026-05-04. The VPS at `198.199.80.21` has not been restarted with the new `proxy.js`. Until it is:

- Every user's weather fetches hit Open-Meteo **client-side** (shared GitHub Pages IP pool → shared rate limit)
- Travelpayouts returns **month-cheapest fare** instead of the upcoming Friday's price
- Reddit-spike protection (N concurrent users → 1 upstream call) is **not active**

**Rate limit math:**
- 148 venues × ~1.8 calls avg = ~266 Open-Meteo calls per cold-cache user
- Open-Meteo free tier: 10,000 calls/day per IP
- GitHub Pages edge IPs are shared across thousands of sites
- Break-even at ~37 unique daily cold-cache users before shared IPs get 429'd

**Fix — 90 seconds, 0 dollars:**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
git pull origin main
pm2 restart peakly-proxy
# Verify:
curl https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: weather_cache, poll_stats, apns_configured fields
```

---

### P1-B: SRI hashes missing on React, ReactDOM, Babel, Supabase (Day 23)

Leaflet is the only CDN script with `integrity=`. The four most security-critical scripts — which together execute before Sentry even fires — have no hash check.

| Script | Size (gzip est.) | SRI |
|--------|-----------------|-----|
| Babel Standalone 7.24.7 | ~350 KB | ❌ |
| ReactDOM 18.3.1 | ~130 KB | ❌ |
| Supabase 2.45.4 | ~80 KB | ❌ |
| React 18.3.1 | ~11 KB | ❌ |
| Leaflet 1.9.4 | ~40 KB | ✅ |

A compromised CDN edge node serves arbitrary JS into every session before any app code runs. Babel specifically has `eval()`-level access to the entire JSX source.

**Generate hashes — run once:**
```bash
REACT_HASH=$(curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A)
DOM_HASH=$(curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A)
BABEL_HASH=$(curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A)
SUPA_HASH=$(curl -s https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A)

echo "React:    integrity=\"sha384-${REACT_HASH}\""
echo "ReactDOM: integrity=\"sha384-${DOM_HASH}\""
echo "Babel:    integrity=\"sha384-${BABEL_HASH}\""
echo "Supabase: integrity=\"sha384-${SUPA_HASH}\""
```

Then add `integrity="sha384-<HASH>" crossorigin="anonymous"` to each `<script>` tag in `index.html`. Test immediately in Chrome and Safari — SRI blocks load silently if the CDN compresses differently on the CDN edge vs your curl. **Time: 20 min.**

---

### P1-C: APNS 14 days past deadline — make the call NOW

Deadline was 2026-05-13. Today is 2026-05-27. Per CLAUDE.md's own contingency, the choice was binary by May 13. 14 days of paralysis later, the Alerts tab is visible to all iOS users, pointing at a push system that cannot deliver a single notification.

**Path A — Wire APNS (30–60 min, requires Apple Dev account):**
1. Apple Dev console → Certificates → Keys → Create `.p8` key
2. SSH to VPS, run 5 `pm2 set` commands (full runbook: `peakly-native/PUSH_SETUP.md`)
3. `curl https://peakly-api.duckdns.org/health | grep apns_configured` → must return `true`

**Path B — Gate Alerts tab on native platform (5 min, unblocks App Store today):**

In `app.jsx`, find `showAlertsTab` logic (used at line ~8828 in BottomNav). Change:
```jsx
// Current:
const showAlertsTab = true;

// Change to:
const showAlertsTab = !(typeof Capacitor !== "undefined" && Capacitor.isNativePlatform());
```

Web users keep Alerts. iOS App Store reviewers never see the tab. Unblocks submission today. Re-enable post-APNS-config by reverting to `true`.

Pick a path. Any path. Both are better than the current state.

---

## P2 — MEDIUM (fix this sprint)

---

### P2-A: No Content Security Policy (Day 23)

GitHub Pages cannot set HTTP headers. A CSP meta tag is the only option. Babel requires `'unsafe-eval'` which limits protection but blocking unknown origins still raises the bar.

**Add to `<head>` before the Sentry script in `index.html`:**

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval'
    https://unpkg.com
    https://cdn.jsdelivr.net
    https://js.sentry-cdn.com
    https://plausible.io;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' https://images.unsplash.com data: blob:;
  connect-src 'self'
    https://peakly-api.duckdns.org
    https://api.open-meteo.com
    https://marine-api.open-meteo.com
    https://marine.open-meteo.com
    https://plausible.io
    https://wsoqcfwkvvemtlddcgfc.supabase.co
    https://o4511108649058304.ingest.us.sentry.io;
  frame-ancestors 'none';
">
```

Test: Babel inline eval still works, Supabase magic-link redirect functions, Plausible fires. **Time: 25 min.**

---

### P2-B: S-hemisphere ski venue scoring — verify coverage

Content report deducted 6 points for "S-hemisphere ski venues score as off-season during actual peak (Jun–Sep)." Code inspection shows the scoring logic is correct:

```javascript
const isNorth = (venue.lat || 0) >= 0;
const inSeason = isNorth ? (mo >= 11 || mo <= 4) : (mo >= 5 && mo <= 10);
```

S-hem June (mo=6): `inSeason = (6 >= 5 && 6 <= 10) = true` ✅

However: **no S-hemisphere ski venues exist in VENUES.** Grepping for `category.*skiing` + negative `lat` returns zero results. There are 64 skiing venues, all northern hemisphere. The scoring logic is correct but untested because the data doesn't exercise it.

If S-hem ski venues are in scope (Portillo, Las Leñas, Cardrona, Whakapapa, Falls Creek), add them to the VENUES array — the scoring will handle them correctly. If they're not in launch scope, the deduction is a data gap, not a code bug.

**Decision needed (content scope, not DevOps):** Are southern-hemisphere ski venues in launch scope? If yes, content agent adds them; scoring just works.

---

### P2-C: Eager Supabase script blocks React mount for all anon users

`index.html` loads `@supabase/supabase-js@2.45.4` (~80 KB gzip) unconditionally before React. The `_getSupabase()` lazy loader in `app.jsx` already exists. The eager script is dead weight for the ~90%+ of sessions that never sign in.

Ready-to-apply diff: `reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff` (in repo, `git apply`-clean).

This is in `reports/known-skipped.md` (3-strikes rule). Surfacing one final time: apply before any public traffic push (Product Hunt, Reddit) where cold-load TTI is on the line.

---

## 2. SECURITY SUMMARY

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ Server-side `process.env` only |
| Supabase anon key in client | ✅ Intentional — RLS-gated, public-safe |
| Sentry DSN in client | ✅ Public-safe by design |
| TP_MARKER `710303` in client | ✅ Public affiliate marker — correct |
| `.gitignore` covers secrets | ✅ `.env`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision`, `*.pdf` |
| Recent commits (last 15) | ✅ No secrets |
| CORS allowlist on proxy | ✅ Restrictive — 4 prod origins, 3 localhost |
| Rate limiter on proxy | ✅ 60 req/min/IP, GC every 5 min |
| SRI on CDN scripts | ⚠️ Leaflet only — React/Babel/Supabase/ReactDOM missing (Day 23) |
| CSP header/meta | ❌ None |
| Amazon gear affiliate link `rel` | Note: ensure `rel="noopener noreferrer sponsored"` when restoring gear block |

---

## 3. CDN BUNDLE BREAKDOWN

| Asset | Gzip est. | Notes |
|-------|-----------|-------|
| Babel Standalone 7.24.7 | ~350 KB | Structural constraint — no-build arch |
| ReactDOM 18.3.1 | ~130 KB | |
| Supabase 2.45.4 | ~80 KB | Eager-loaded — known-skipped |
| app.jsx (transpiled at runtime) | ~157 KB | 511 KB raw |
| Leaflet 1.9.4 | ~40 KB | |
| Plus Jakarta Sans | ~20 KB | |
| React 18.3.1 | ~11 KB | |
| **Total first load** | **~788 KB gzip** | |

**Babel Standalone is 44% of the total payload.** Known and accepted. No action without a build step.

**Babel version:** 7.24.7 — 7.27.x is current. No security advisories. No action required; upgrade is nice-to-have.

---

## 4. COST PROJECTION

| Scale | Cost/mo | Notes |
|-------|---------|-------|
| Today (~0 MAU) | **$6** | DO 1GB + GitHub Pages free + Supabase free |
| 1K MAU | **$6** | Same stack, within all free tiers (with proxy cache deployed) |
| 10K MAU | **$18–37** | DO 2GB ($12) + Supabase Pro ($25) |
| 100K MAU | **$49–650** | DO 4GB+ ($24+) + Supabase Team ($599) + possibly Open-Meteo commercial |

**Live revenue:** 3 of 4 "live" streams actually earning. Amazon Associates is $0 because code doesn't exist. At 1K MAU: ~$7.50 RPM × 1K = $7.50/mo vs $6 infra. Barely positive until gear stream is restored ($4.48 RPM → total $11.98 RPM at 1K = ~$12/mo).

---

## 5. WHAT BREAKS FIRST AT SCALE

The single failure mode that will kill the product publicly is **Open-Meteo client-side rate limiting during a traffic spike.**

The sequence is silent and fast:
1. Reddit/Product Hunt post → 200 concurrent cold-cache users in 10 minutes
2. 200 users × 266 Open-Meteo calls = 53,200 calls in ~5 minutes from shared GitHub Pages IPs
3. Open-Meteo returns HTTP 429; `fetchWeather` null-returns; `scoreVenue` floors to 0
4. Every venue in Explore shows score 0 or "N/A". Looks like an app bug.
5. Users comment "it's broken" on the post. Traffic spike becomes a reputation event.
6. You discover it 2 hours later through a Plausible cliff, not Sentry (no exception thrown)

**Prevention: one SSH command, 90 seconds, $0.** The server-side weather proxy with 2hr in-memory cache and in-flight deduplication is deployed and waiting in `proxy.js`. Once live, the same 148 venues = 148 upstream calls per 2hr cycle regardless of concurrent users. That's ~1,776 calls/day — 5.6× under the 10,000/day free tier at any MAU. Do the redeploy (P1-A) before any promotional push.

Second failure mode: in-memory rate limiter `_rateMap` in `proxy.js` grows unbounded between its 5-minute cleanup intervals. On a 1GB droplet at sustained 10K MAU, this Map can hold 10K+ entries and contribute to OOM. Mitigation: add `pm2 --max-memory-restart 768M` to the pm2 process so it self-heals before the OS kills it silently:

```bash
ssh root@198.199.80.21
pm2 delete peakly-proxy
pm2 start /opt/peakly-proxy/proxy.js --name peakly-proxy --max-memory-restart 768M
pm2 save
```

---

## 6. ACTION SUMMARY

| Priority | Action | Owner | Time | Status |
|----------|--------|-------|------|--------|
| **DONE** | Cache buster `20260522a` → `20260527a` | DevOps agent | 2 min | ✅ Shipped |
| **P0** | Restore `GEAR_ITEMS` constant + gear rendering block | AI session | 15 min | ❌ $0 revenue stream — final warning |
| **P1-A** | SSH: `git pull && pm2 restart peakly-proxy` | Jack | 90 sec | ❌ Day 23 |
| **P1-B** | Add SRI hashes to React/ReactDOM/Babel/Supabase | AI session | 20 min | ❌ Day 23 |
| **P1-C** | APNS: wire it OR gate Alerts tab | Jack | 5–60 min | ❌ 14 days past deadline |
| **P2-A** | CSP meta tag in `index.html` | AI session | 25 min | ❌ Day 23 |
| **P2-B** | Decide S-hem ski scope; add venues if yes | Content agent | — | 🔲 Decision needed |
| **P2-C** | Apply eager-supabase-delete diff before traffic push | AI session | 20 min | 🔲 Known-skipped |
| **Pre-launch** | Add `pm2 --max-memory-restart 768M` to proxy process | Jack | 5 min | 🔲 |
| **On domain** | Update Plausible `data-domain` to `peakly.app` | AI session | 2 min | 🔲 |
| **On domain** | Add `peakly.app` to CORS allowlist in `proxy.js` | AI session | 2 min | ✅ Already present |
