# Peakly DevOps Report — 2026-07-19

**Status: GREEN** — No P0 or P1 issues. Code freeze day 5 (no commits since July 14 Engelberg). Cache `20260714a` accurate — no code shipped, correct behaviour from `auto-push.sh`. Venue count 375 confirmed (133 ski / 242 beach); baseline file 375 matches. lateSeason count 14 confirmed with correct multi-format grep. AP_CONTINENT gap finding **permanently closed as false positive** (all 146 venue `ap` codes present across 280 total entries; lazy-regex scripts only read 68 entries and gave a spurious gap count). SRI/CSP remains the only open P2.

---

## Permanent Stop-Reporting Table

| Claim | Reality |
|---|---|
| "VPS down / Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage. Never flag from sandbox.** |
| "Sentry DSN empty" | **Active at `app.jsx:8` and `index.html:77`. Stop.** |
| "GEAR_ITEMS found" | **0 refs. Amazon CUT for v1. Stop.** |
| "Travelpayouts token in client" | **Server-side only. `TP_MARKER=710303` is public affiliate suffix, not a secret. Stop.** |
| "Supabase anon key exposed" | **Expected. RLS-gated. Public-safe by design. Stop.** |
| "Cache buster stale" | **`20260714a` is accurate to last code change (July 14). Age alone ≠ stale. Auto-bumps on next code change. Stop.** |
| "Venue count 156 / 353 / 370 / 372 / 375 / 377" | **375 via category grep (133 ski / 242 beach). July 15–16 "377" was a bracket-walker false positive. Baseline matches. Stop.** |
| "lateSeason: 6 / 9 / 13 venues" | **14. Use `grep -c "lateSeason.*true" app.jsx` — covers both compact and batch-JSON formats. Stop.** |
| "AP_CONTINENT gap — KUL/SNA/MCT/GIG/TFS/CHQ missing" | **FALSE POSITIVE (July 17 + July 19 repeat). AP_CONTINENT has 280 entries. All 146 venue `ap` codes present. Lazy-regex scripts terminate at first `}` in the object body and only see 68 entries. Stop permanently.** |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`). Stop.** |
| "Plausible domain wrong" | **FIXED July 7 → `j1mmychu.github.io/peakly`. Stop.** |
| "Babel 8.x upgrade available" | **Babel 8 is ESM-only — incompatible with no-bundler arch. Stay on 7.29.7. Stop.** |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary in code. Appears in a comment only. Stop.** |
| "venue-baseline drift / 377 venues" | **FALSE POSITIVE. Real count = 375. Baseline = 375. Both match. Stop.** |

---

## Infrastructure Snapshot

| Check | Result |
|---|---|
| `app.jsx` lines | 13,507 |
| `app.jsx` raw size | 676,312 bytes (~180 KB gzipped est.) |
| Brace balance | 5,572 / 5,572 ✅ |
| `PEAKLY_BUILD` | `20260714a` |
| `sw.js` CACHE_NAME | `peakly-20260714a` |
| `index.html` `?v=` param | `20260714a` |
| All 3 stamps in lockstep | ✅ |
| Code freeze | Day 5 (no code commits since July 14 — report-only runs) |
| Venue count (category grep) | **375** (133 ski / 242 beach) |
| Venue baseline | `375` ✅ matches |
| lateSeason venues (`lateSeason.*true`) | **14** ✅ |
| AP_CONTINENT coverage | ✅ 280 entries; all 146 venue `ap` codes present |
| Plausible analytics | ✅ Present, uncommented, domain `j1mmychu.github.io/peakly` |
| Sentry DSN | ✅ Active (`app.jsx:8`, `index.html:77`) |
| Proxy URL | ✅ HTTPS `peakly-api.duckdns.org` |
| Travelpayouts token in client | ✅ None — `process.env.TRAVELPAYOUTS_TOKEN` in proxy.js only |
| GEAR_ITEMS refs | ✅ 0 |
| Images lazy | ✅ All 9 `<img>` sites use `loading="lazy"` |
| `.gitignore` covers secrets | ✅ `.env`, `*.pem`, `*.p8`, `*.key`, `*.p12`, `*.pdf`, `*.pptx` all covered |
| React CDN | 18.3.1 (current 18.x) ✅ |
| Babel CDN | 7.29.7 ✅ (8.x ESM-only; incompatible — don't upgrade) |
| Flight proxy timeout | 5,000 ms + AbortController ✅ |
| Weather proxy timeout | 4,000 ms + AbortController ✅ |
| SRI hashes on CDN scripts | ❌ 0 of 4 — persistent P2 |
| CSP meta tag | ❌ None — persistent P2 |

---

## lateSeason Authoritative Count — 14 Venues

**Correct grep (catches both compact `lateSeason:true` and batch-JSON `"lateSeason": true`):**

```bash
grep -c "lateSeason.*true" app.jsx
# → 14
```

**Why the wrong pattern matters:** `grep -c "lateSeason:true"` returns only 9 — misses 5 batch-JSON venues where the key is quoted with a space. Always use `lateSeason.*true`.

Full list verified today:

| # | ID | Line | Format |
|---|---|---|---|
| 1 | whistler | 484 | compact |
| 2 | chamonix | 500 | compact |
| 3 | mammoth | 509 | compact |
| 4 | abasin | 515 | compact |
| 5 | tignes | 530 | compact |
| 6 | cervinia | 534 | compact |
| 7 | snowbird | 805 | batch JSON |
| 8 | zermatt | 1112 | batch JSON |
| 9 | engelberg | 1135 | batch JSON |
| 10 | verbier | 1707 | batch JSON |
| 11 | val-thorens | 1730 | batch JSON |
| 12 | les-deux-alpes-fr | 4826 | compact |
| 13 | saas-fee-ch | 4835 | compact |
| 14 | st-moritz-ch | 4844 | compact |

---

## AP_CONTINENT — Definitively Closed

**280 entries. All 146 unique venue `ap` codes present. Zero gaps.**

The July-17 finding (6 codes allegedly missing) and this agent's initial check (78 missing) were the same bug: a lazy-regex node script using `\{([\s\S]*?)\}` that terminated at the first `}` inside the object body, capturing only 68 of 280 entries. Proper bracket-depth tracking confirms 0 missing.

Do not re-investigate. Verified command:
```bash
node -e "
const fs = require('fs');
const code = fs.readFileSync('app.jsx', 'utf8');
const start = code.indexOf('const AP_CONTINENT = {');
let depth=0, i=start+'const AP_CONTINENT = '.length;
while(i<code.length){if(code[i]==='{')depth++;else if(code[i]==='}'){depth--;if(!depth)break;}i++;}
const body = code.slice(start, i+1);
const codes = new Set((body.match(/(?:[\"']([A-Z]{3})[\"']|\\b([A-Z]{3}))\s*:/gm)||[]).map(m=>m.replace(/[\"':\\s]/g,'')).filter(s=>s.length===3));
const aps = new Set((code.match(/[\"']?ap[\"']?\s*:\s*[\"']([A-Z]{3})[\"']/g)||[]).map(s=>{const m=s.match(/[\"']([A-Z]{3})[\"']/);return m?m[1]:null;}).filter(Boolean));
const missing=[...aps].filter(a=>!codes.has(a));
console.log('AP_CONTINENT entries:',codes.size,'/ venue aps:',aps.size,'/ missing:',missing.length||'NONE');
"
# → AP_CONTINENT entries: 280 / venue aps: 146 / missing: NONE
```

---

## P0 — Critical

**None.**

---

## P1 — High

**None.**

---

## P2 — Medium

### P2-A: SRI hashes missing on CDN scripts (persistent — Day 12+)

`index.html` loads 4 external scripts with no `integrity=` SRI attributes. A compromised unpkg CDN could inject arbitrary JavaScript into every Peakly session.

**Fix — compute hashes and add `integrity=` to first 3 scripts (not Sentry — it lazy-loads a secondary bundle which can't be SRI-pinned):**

```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js" \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Then in `index.html`:
```html
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<REACT_HASH>"></script>
<script crossorigin
  src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"
  integrity="sha384-<REACTDOM_HASH>"></script>
<script
  src="https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
  integrity="sha384-<BABEL_HASH>"></script>
```

**Caveat:** A strict CSP blocking SRI bypass vectors requires `unsafe-eval` for Babel Standalone — partially defeating the purpose. Full fix requires the pre-compile CI approach below.

**Estimated fix time:** 15 minutes. Not a launch blocker.

---

## Scaling Bottleneck — What Breaks First

**Babel Standalone client-side parse is the wall.** Every cold page load downloads `babel.min.js` (~400 KB gzip) then runtime-parses 676 KB of JSX. On 2023 mid-range Android: 3–5 second blank white screen. On M2 MacBook: ~200 ms. The day there's a Reddit/HN post, mobile users — highest bounce propensity — leave before the first card renders.

**Fix without breaking the no-bundler dev workflow:**

```yaml
# .github/workflows/compile.yml
name: Pre-compile JSX
on:
  push:
    paths: ['app.jsx']
jobs:
  compile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g @babel/core @babel/preset-react @babel/cli
      - run: babel app.jsx --presets @babel/preset-react -o app.compiled.js
      - run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions@github.com"
          git add app.compiled.js
          git commit -m "ci: pre-compile app.jsx" || exit 0
          git push
```

Then `index.html`:
```html
<!-- Before: -->
<script type="text/babel" src="./app.jsx?v=20260714a" data-presets="react"></script>
<!-- After: -->
<script src="./app.compiled.js?v=20260714a"></script>
```

Dev still edits `app.jsx`; CI produces the production artifact. Mobile parse time: 3–5 s → ~300 ms. Also resolves the SRI/CSP tension (pre-compiled JS doesn't need `unsafe-eval`).

**Second failure at ~66 concurrent DAU:** Open-Meteo direct rate limit. VPS weather cache prevents this — verify `_tryProxyWx()` (`app.jsx:5228`) is the primary path, with direct Open-Meteo as fallback only.

**Cost projection:**

| MAU | DO (VPS) | Supabase | Open-Meteo | Total/mo | Revenue |
|---|---|---|---|---|---|
| <10 (now) | $6 | $0 | $0 | **$6** | ~$0 |
| 1K | $6 | $0 | $0 | **$6** | ~$7.58 |
| 10K | $12 | $0–$25 | $0 | **$12–$37** | ~$75.80 |
| 100K | $24 | $25 | $0 | **$49** | ~$758 |

Infrastructure stays under 10% of revenue at every tier.

---

## Security Audit

| Check | Result |
|---|---|
| Travelpayouts token in client | ✅ CLEAN |
| Supabase anon key | ✅ Expected (RLS-gated) |
| Sentry DSN | ✅ Public project DSN (design intent) |
| `TP_MARKER` in client | ✅ Not a secret |
| `.env` files in repo | ✅ None |
| Recent commits for accidental secrets | ✅ Last 5 commits report-only, no code |
| `GEAR_ITEMS` | ✅ 0 refs |

---

## Action Items

**Jack (manual):**
- [ ] Paste `server/sql/delete-account.sql` into Supabase SQL editor (App Store 5.1.1(v))

**No automated agent actions required this run.**

**Parked / Known-Skipped (do not re-flag):**
- SRI hashes (P2-A) — partially incompatible with Babel Standalone until pre-compile CI lands
- APNS — `reports/known-skipped.md`; re-flags only on App Store submission
- VPS redeploy for weekend-specific pricing — `reports/known-skipped.md`; re-flags at 100+ MAU

---

*DevOps agent — 2026-07-19. No code changes this run.*
