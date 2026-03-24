# Code Quality Report — Peakly

**Date:** 2026-03-24
**Agent:** Code Quality Agent (Claude Opus 4.6)
**Health Score:** Warning

---

## 1. Syntax Validation

### File Stats
- **Lines:** 5,607
- **Bytes:** 381,566
- **File ends correctly:** Yes — `ReactDOM.createRoot(document.getElementById("root")).render(...)` on final lines

### Bracket Balance
| Symbol | Open | Close | Balanced |
|--------|------|-------|----------|
| `{ }` | 3,877 | 3,877 | Yes |
| `( )` | 2,126 | 2,126 | Yes |
| `[ ]` | 541 | 541 | Yes |

### Missing Comma / Duplicate Field Checks
- **Missing commas** (pattern `reviews:NNNNgradient:`): None found
- **Duplicate `photo:` on same line**: None found
- **Missing commas** (pattern `property:valueproperty:`): None found

**Syntax verdict: Clean.** No structural issues detected.

---

## 2. Venue Data Validation

### Venue Count
- **Total venues in VENUES array:** 182
- **CLAUDE.md states:** "~170+ venues" / "All 171 venue photos added"
- **Drift:** +11 venues undocumented (182 actual vs 171 documented)

### Venues Per Category
| Category | Count |
|----------|-------|
| tanning | 60 |
| surfing | 53 |
| skiing | 50 |
| hiking | 12 |
| paraglide | 1 |
| mtb | 1 |
| kite | 1 |
| kayak | 1 |
| fishing | 1 |
| diving | 1 |
| climbing | 1 |

### Duplicate IDs
None found. All 182 venue IDs are unique.

### Photo Coverage
- **With photo field:** 182 / 182 (100%)
- **Without photo field:** 0

### Category Mismatch (WARNING)
**CATEGORIES array defines:** all, skiing, surfing, hiking, diving, climbing, tanning (6 real categories + "all")

**Venue categories NOT in CATEGORIES array:**
- `fishing` (1 venue: kenai)
- `kayak` (1 venue: milford)
- `kite` (1 venue: tarifa)
- `mtb` (1 venue: moab)
- `paraglide` (1 venue: interlaken)

These 5 venues use categories that have no matching pill in the CATEGORIES filter. Users cannot filter to these categories via the UI. They may still appear under "All" but are unfilterable individually.

---

## 3. CLAUDE.md Drift

| Item | CLAUDE.md Says | Actual | Status |
|------|---------------|--------|--------|
| Line count | ~5,413 lines | 5,607 lines | DRIFT (+194 lines) |
| Venue count | ~170+ / 171 | 182 | DRIFT (+11 venues) |
| Photo coverage | "all 171 venue photos added" | 182/182 with photos | DRIFT (should say 182) |
| CATEGORIES | 6 categories listed | 6 defined, but 11 used in data | DRIFT (5 orphaned) |
| BottomNav tabs | "currently only 3 tabs" / "4th tab" (Guides) | Code has BottomNav present | Unverified from doc |
| App root lines | "~lines 4900-5413" | File is 5,607 lines | DRIFT |

**CLAUDE.md needs update** to reflect current line count (5,607), venue count (182), and the 5 uncategorized adventure venues.

---

## 4. Git State

**Branch:** main (up to date with origin/main)
**Working tree:** Clean (no staged/unstaged changes)

**Untracked files (6):**
- `tasks/agents/code-quality.md`
- `tasks/agents/community-agent.md`
- `tasks/agents/competitor-watch.md`
- `tasks/agents/data-enrichment.md`
- `tasks/agents/qa-agent.md`
- `tasks/agents/seo-analytics.md`

**Recent commits (last 10):**
```
f379443 UX: fix saved heart target, CompactCard text floor, hero contrast
fd1ac99 UX overhaul: swipe dismiss, best window dates, date-aware scoring, alert filters, 22 airports, hero personalization, flight API fix
7f03512 All 6 agent reports v7
2158d7c UX: fix touch targets, Book CTA size, typography scale
c7a62c8 Merge remote-tracking branch 'origin/master'
41f296e Daily Growth, UX, Revenue reports
69aa6f5 Daily PM report
9b3c726 Merge branch 'master' of http://127.0.0.1:41307/git/j1mmychu/peakly
ea719b2 Daily Content report
d72ce18 Merge remote reports and update PM report
```

---

## 5. CDN Dependencies

| Dependency | URL | Version | Status |
|-----------|-----|---------|--------|
| React | `unpkg.com/react@18/umd/react.production.min.js` | 18.x (latest) | OK |
| ReactDOM | `unpkg.com/react-dom@18/umd/react-dom.production.min.js` | 18.x (latest) | OK |
| Babel Standalone | `unpkg.com/@babel/standalone@7.24.7/babel.min.js` | 7.24.7 (pinned) | OK |

**Cache-busting:** `app.jsx?v=20260323b` — note the cache-bust param is dated 2026-03-23, one day stale if code changed today.

**Note:** React uses `@18` (floating major), which will auto-upgrade to latest 18.x. Babel is pinned to `@7.24.7` which is stable. No issues detected.

---

## 6. Action Items

### Critical
None.

### Warning
1. **5 orphaned venue categories** — fishing, kayak, kite, mtb, paraglide are used in VENUES but have no entry in the CATEGORIES array. Either add these to CATEGORIES (to make them filterable) or document them as "showcase-only" venues.
2. **CLAUDE.md is stale** — Line count (5,413 vs 5,607), venue count (171 vs 182), and category coverage are out of date. Update to prevent confusion for other agents.
3. **6 untracked agent files** in `tasks/agents/` — decide whether to commit or gitignore.

### Informational
4. **Cache-bust param** `?v=20260323b` should be bumped after any deploy to ensure browsers pick up new code.
5. **Babel 7.24.7** is 2+ years old (released ~2024). Consider updating to latest 7.x for bug fixes, though no known issues.
6. **React @18 floating version** will stop getting updates when React 19 is the latest 18.x. Not urgent but worth noting for future-proofing.

---

*Report generated 2026-03-24 by Code Quality Agent.*
