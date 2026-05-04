# Peakly Code Quality & Ops Report — 2026-04-10

**Overall Health Score: 72 / 100** (YELLOW)

Bones are solid — app.jsx parses clean, venue data integrity is strong, CDN deps all live.
Score gets docked hard for drift: 10-day stale cache buster, SW name mismatch with docs,
two real syntax fixes sitting uncommitted on disk, 6-day shipping freeze, TP_MARKER still
a placeholder on day 17. The code is fine. The operations are not.

---

## 1. Syntax Scan — app.jsx (10,993 lines)

**Babel parse: CLEAN.** Parsed with `@babel/parser` + `jsx` plugin. Zero errors.

**BUT — two real syntax bugs are already fixed and staged uncommitted** (`git diff app.jsx`):

| Line | Bug | Status |
|------|-----|--------|
| 2399 | Guam Offshore: `gradient:"linear-gradient(160deg,#007aac,#00aacc,#00daec"` — missing closing paren on the CSS value, truncating the gradient | Fixed locally, NOT committed |
| 2693 | Glacier National Park paraglide: trailing `},,` — double comma in VENUES array | Fixed locally, NOT committed |

Both would break JSX in older Babel versions or once anything picks up the string. They were patched but never committed. They are sitting in your working tree right now.

**Recommendation:** Commit and push these before ProductHunt. `push "fix: 2 venue syntax bugs"`.

**Other notes:**
- Brace/paren/template-literal balance: balanced.
- No unclosed template literals detected.
- Standard React destructure at line 1: `const { useState, useEffect, useRef, useCallback } = React;` — matches CLAUDE.md pattern.
- ReactDOM.createRoot on line 10992 — proper React 18.

---

## 2. Venue Data Validation — VENUES array (3,726 entries)

**Schema consistency: 100%.** Every venue has: `id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo`. The 204 ski venues correctly carry the optional `skiPass` field.

**Field validation:**
- Required fields missing: 0
- Invalid lat/lon (out of -90..90 / -180..180): 0
- Duplicate ids: 0
- Invalid numeric types: 0

**One stray field found:**
- `id:"beach_japan_ishigaki"` ("Kabira Bay, Ishigaki Island"), **line 1077** — has `revision:null` key that doesn't belong. Harmless at runtime, but it means some enrichment script left a marker behind. Worth cleaning up.

**Category distribution:**

```
skiing      704    Top 3 focus
surfing     703    Top 3 focus
tanning     705    Top 3 focus (Beach)
diving      205
climbing    204
kite        200
kayak       201
mtb         201
fishing     202
paraglide   201
hiking      200
```

Top 3 launch focus (surf / ski / beach) is evenly loaded at ~700 each. Balanced.

**Duplicate titles (P1 bug #12 confirmed):**
- 242 unique titles are reused across 265 duplicate entries.
- Top offenders: Diani Beach (5x), Clearwater Beach (4x), Raja Ampat (4x), Mui Ne (4x), Jericoacoara (4x), Arapahoe Basin (3x), Alpe d'Huez (3x), Sayulita (3x), Punta de Lobos (3x), Fernando de Noronha (3x).
- Still unresolved. Ship a dedupe before PH launch (April 15).

**Photo reuse (P1 bug #13 — CLAUDE.md numbers are STALE):**
- Unique photo URLs: **2,261** out of 3,726 venues (61% unique)
- Max reuse of any single photo: **17x**
- Photos reused 5+ times: 90
- CLAUDE.md says "only 257 unique images, top photo 203x" — that figure is **not accurate as of today**. The real state is much better. Update CLAUDE.md.
- Still a real issue (39% of venues share a photo with another venue), but severity is lower than documented.

**Airport coverage (P1 bug #14 confirmed):**
- Unique airport codes referenced by VENUES: **813**
- `AIRPORT_CITY` lookup entries: **179**
- `BASE_PRICES` lookup entries: **76**
- `AP_CONTINENT` lookup entries: **234**
- **634 of 813 venue airport codes are missing from `AIRPORT_CITY`** (78% gap — matches the "80-90%" claim). Flight city names and price fallbacks broken for most expansion venues.

---

## 3. CLAUDE.md vs Code Drift

| Claim in CLAUDE.md | Actual code state | Drift? |
|---|---|---|
| Service worker at `peakly-v14` | `sw.js` line 2: `CACHE_NAME = "peakly-20260330"` | YES — naming convention changed, not documented |
| Cache buster `v=20260329v1` / `v=20260331a` | `index.html` line 346: `v=20260331a` | STALE — 10 days old as of today (2026-04-10) |
| `TP_MARKER` is placeholder — P0 bug | `app.jsx` line 5316: `const TP_MARKER = "YOUR_TP_MARKER";` | CONFIRMED — Day 17. Still earning $0 per flight click. |
| 3,726 venues | Confirmed: 3,726 | OK |
| VENUES schema | Confirmed | OK |
| Gear section hidden with `{false && ...}` | Confirmed in VenueDetailSheet | OK |
| Photo duplication: "93% reuse, 257 unique" | Actual: **61% unique, 2,261 unique photos** | CLAUDE.md is wrong — update it |
| Score vote buttons still rendered (P1) | Confirmed present | OK (still broken) |
| Email capture fires `alert()` only (P1) | Confirmed | OK (still broken) |
| Emoji in UI chrome still present (P1) | Confirmed (venue icons) | OK (still broken) |
| CDN deps (React 18, Babel 7.24.7) | Confirmed in index.html | OK |
| Sentry loader script | Confirmed (line 77) | OK |
| Plausible analytics | Confirmed (line 32) | OK |

---

## 4. Git Status

**Working tree is dirty.** 9 modified files + 40+ untracked report files.

**Modified & uncommitted:**
- `CLAUDE.md` (+46 / -3 lines)
- `app.jsx` (+2 / -2 — the two syntax fixes above)
- `reports/code-quality-report.md`, `community-report.md`, `competitor-watch-report.md`, `daily-briefing.md`, `data-enrichment-report.md`, `qa-report.md`, `seo-analytics-report.md`

**Last product commit:** `fd6e4e8` — "feat: consistent scores, 2hr weather cache, deal-based flight scoring" — **April 4**.
**Days since last feature/fix ship: 6.**
**ProductHunt launch: April 15.**

Every commit since April 4 has been agent report chore commits. **Zero product code has reached main in 144+ hours.** CLAUDE.md already flags this as P0 process bug #21. This report confirms it is still unresolved.

Untracked files include `AUDIT_REPORT_2026-04-07.md`, `QA_REPORT_2026-04-09.md`, `SYNTAX_AUDIT_2026-04-09.txt`, and several `.js` probe scripts (`check_syntax.js`, `detailed_check.js`, `final_check.js`, `final_validation.js`, `spot_check.js`) left in the repo root. Clean these up or move to `reports/`.

---

## 5. CDN Dependencies — index.html

All CDN script/link tags present and pinned:

| Dep | URL | Pinned? |
|---|---|---|
| React 18 | `unpkg.com/react@18/umd/react.production.min.js` | Major only |
| ReactDOM 18 | `unpkg.com/react-dom@18/umd/react-dom.production.min.js` | Major only |
| Babel Standalone | `unpkg.com/@babel/standalone@7.24.7/babel.min.js` | Fully pinned |
| Sentry Loader | `js.sentry-cdn.com/9416...eb7.min.js` | Loader script (auto-updates) |
| Plausible | `plausible.io/js/script.hash.js` | Auto-updates |
| Google Fonts | `fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:...` | OK |

**Risk:** React/ReactDOM are loosely pinned to major version only. Unpkg can serve a different patch without warning. Low-prob but worth knowing for launch week.

**No local `node_modules` needed** — single-file / no-build architecture is intact.

---

## 6. Prioritized Action List

**P0 — Before ProductHunt (April 15, 5 days out):**
1. **Commit and push the two uncommitted app.jsx syntax fixes.** Already in working tree — `push "fix: 2 venue syntax bugs"`. Zero risk.
2. **Replace `TP_MARKER = "YOUR_TP_MARKER"`** at `app.jsx:5316`. Every flight click earns $0 until this is done. Jack action, 5 minutes.
3. **Bump cache buster** from `v=20260331a` to `v=20260410a` in `index.html:346`.
4. **Bump SW `CACHE_NAME`** in `sw.js:2` from `peakly-20260330` to `peakly-20260410`. Forces update on return visitors.

**P1 — Before launch push:**
5. **Dedupe 265 duplicate venue entries.** One-pass script that keeps the best entry per name.
6. **Backfill `AIRPORT_CITY` and `BASE_PRICES`** for the 634 missing airport codes — or hide flight pricing UI for venues whose airport isn't resolved.
7. **Remove stray `revision:null`** at line 1077.
8. **Commit or discard** the 9 modified files so the tree isn't dirty during launch week.
9. **Update CLAUDE.md photo stats** — the 257/93% figure is wrong; real is 2,261/39%.
10. **Clean up untracked `.js` probe files** in repo root.

**P2 — Ongoing:**
11. Update CLAUDE.md "Service worker at peakly-v14" — naming convention changed.
12. Pin React/ReactDOM to exact versions on unpkg (e.g., `react@18.3.1`) for launch week stability.

---

## Health Score Breakdown

| Dimension | Score | Notes |
|---|---|---|
| Parse / syntax | 92 / 100 | Babel clean, but 2 fixes uncommitted |
| Venue data integrity | 85 / 100 | Schema perfect, 265 dupes + 1 stray field |
| Asset integrity (photos) | 70 / 100 | 61% unique, top reuse 17x |
| Airport/data coverage | 55 / 100 | 78% of airport codes missing from lookup |
| CDN / dependencies | 90 / 100 | All present, minor version-pin risk |
| Documentation accuracy | 65 / 100 | CLAUDE.md stale on photos + SW name |
| Git hygiene / ship cadence | 45 / 100 | 6 days no ship, dirty tree, uncommitted fixes |
| **Overall (weighted)** | **72 / 100** | **YELLOW** |

---

## Bottom Line

The codebase is not the problem. Execution is. Babel parses clean. Data schema is airtight. The Unsplash CDN is fine. The two syntax bugs that would break everything are *already fixed* — they just need to be committed.

Ship the pending fixes. Replace `TP_MARKER`. Bump the cache buster. That's 15 minutes of Jack's time and unblocks launch. Everything else on the list is polish that can happen in parallel.
