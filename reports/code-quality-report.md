# Peakly Code Quality & Ops Report — 2026-03-25

**Overall Health Score: 87/100**

---

## 1. Syntax Audit — app.jsx (6,134 lines)

| Check | Result |
|-------|--------|
| Braces `{}` | Balanced (4,035 open / 4,035 close) |
| Parentheses `()` | Balanced (2,296 / 2,296) |
| Brackets `[]` | Balanced (603 / 603) |
| Template literals (backticks) | Even count (87 pairs) |
| Double commas `,,` | None found |
| Console statements | 2 (minimal, acceptable) |
| File ending | Clean closure with `_root.render()` |

**Verdict: CLEAN.** No syntax issues detected. Babel transpilation should succeed.

---

## 2. Venue Data Validation (205 venues)

### Field Completeness: 100%
All 205 venues have all required fields: id, title, location, lat, lon, ap (airport), rating, photo, category.

### Data Integrity

| Check | Result |
|-------|--------|
| Coordinate validity (lat -90 to 90, lon -180 to 180) | PASS |
| Airport codes (3-letter IATA) | PASS |
| Photo URLs (Unsplash HTTPS) | PASS |
| Duplicate IDs | None |
| Duplicate titles | None |
| Empty fields | None |

### Category Distribution

| Category | Count | % |
|----------|-------|---|
| skiing | 74 | 36.1% |
| tanning | 60 | 29.3% |
| surfing | 53 | 25.9% |
| hiking | 12 | 5.9% |
| diving | 5 | 2.4% |
| kite | 4 | 2.0% |
| climbing | 4 | 2.0% |
| paraglide | 1 | 0.5% |
| mtb | 1 | 0.5% |
| kayak | 1 | 0.5% |
| fishing | 1 | 0.5% |

### Issue: 14 Duplicate Photos
14 Unsplash photo URLs are reused across 23 venue instances (93.2% unique vs. CLAUDE.md's claim of 100% unique). Worst offenders: Aspen/Stratton/Stowe/Okemo share one photo; Steamboat/Crystal Mtn/Stevens Pass/Mt Hood share another; Tahoe/Heavenly/Northstar/Kirkwood share a third.

**Impact:** Visual redundancy degrades perceived quality. Users browsing ski resorts see identical hero images.
**Fix:** Replace 14 duplicate photo URLs with unique Unsplash images (~30-45 min dev work).

---

## 3. CLAUDE.md vs. Actual Code

| Documented Claim | Actual State | Status |
|-----------------|-------------|--------|
| app.jsx ~5,413 lines | 6,134 lines (+721) | STALE |
| ~192 venues | 205 venues (+13) | STALE |
| 3 visible tabs (Explore, Alerts, Profile) | 3 tabs confirmed | ACCURATE |
| Wishlists + Trips tabs hidden | Both exist as dead code | ACCURATE |
| Peakly Pro $79/yr | Confirmed (line ~5078) | ACCURATE |
| Set Alert button on VenueDetailSheet | Confirmed (lines ~4897-4902) | ACCURATE |
| Swipe-down dismiss (120px threshold) | Confirmed (line ~4745) | ACCURATE |
| Date-aware scoring (dayIndex) | Confirmed (line ~948) | ACCURATE |
| GuidesTab wired into BottomNav (4th tab) | GuidesTab exists but is NOT rendered in BottomNav | WRONG |
| HTTPS proxy: peakly-api.duckdns.org | Confirmed (line ~1374) | ACCURATE |
| Plausible analytics with 5 custom events | Confirmed in index.html + app.jsx | ACCURATE |
| PWA manifest + service worker | Confirmed (manifest.json, sw.js linked) | ACCURATE |
| Cache buster v=20260325c | Confirmed (index.html line 95) | ACCURATE |

### Documentation Drift Summary

Three items need updating in CLAUDE.md:

1. Line count: 5,413 -> 6,134
2. Venue count: 192 -> 205
3. GuidesTab status: claimed "wired into BottomNav" but it's actually built-but-hidden (dead code, never rendered)

---

## 4. Git Status

**Branch:** main (up to date with origin/main)

### Uncommitted Changes

| File | Delta |
|------|-------|
| app.jsx | +321/-175 lines modified |
| reports/data-enrichment-report.md | +318 lines modified |

### Untracked Files

- reports/content-2026-03-25.md
- reports/devops-2026-03-25.md

**Risk:** Uncommitted app.jsx changes mean the live site (GitHub Pages) does not reflect the current working copy. These changes should be committed and pushed if intentional, or stashed if work-in-progress.

### Recent Commits

```
23527ea Chief of Staff briefing v13 -- RED status
687bb6f All 11 agent reports v13
83291dd Update roadmap -- 2026-03-25
a050ed6 Update roadmap -- 2026-03-25 shipped items, reprioritized checklist
693bf37 Chief of Staff daily briefing v12
```

---

## 5. CDN Dependencies (index.html)

| Dependency | URL | Status |
|-----------|-----|--------|
| React 18 (UMD) | unpkg.com/react@18/umd/react.production.min.js | OK |
| ReactDOM 18 (UMD) | unpkg.com/react-dom@18/umd/react-dom.production.min.js | OK |
| Babel Standalone 7.24.7 | unpkg.com/@babel/standalone@7.24.7/babel.min.js | OK (pinned) |
| Plausible Analytics | plausible.io/js/script.hash.js | OK |
| Plus Jakarta Sans | Google Fonts (loaded in app.jsx) | OK |

**Note:** All CDN deps load from unpkg.com. Single point of failure if unpkg goes down. Consider pinning React to specific minor version (e.g., react@18.2) for stability.

---

## 6. Scoring Summary

| Area | Score | Notes |
|------|-------|-------|
| Syntax health | 25/25 | Zero issues |
| Data integrity | 20/25 | -5 for 14 duplicate photos |
| Documentation accuracy | 17/20 | -3 for stale counts + GuidesTab claim |
| Git hygiene | 15/20 | -5 for uncommitted app.jsx changes |
| Infrastructure | 10/10 | CDN deps healthy, PWA configured |
| **TOTAL** | **87/100** | |

---

## Action Items (Priority Order)

1. **Commit or stash uncommitted app.jsx changes** — live site diverges from working copy (+321/-175 lines uncommitted)
2. **Fix 14 duplicate venue photos** — replace with unique Unsplash URLs (30-45 min)
3. **Update CLAUDE.md** — correct line count (6,134), venue count (205), GuidesTab status (hidden, not wired)
4. **Consider pinning React CDN** to specific minor version (e.g., react@18.2) for stability

---

*Generated 2026-03-25 by Code Quality & Ops Agent. Scanned: app.jsx (6,134 lines), index.html (119 lines), git status, CLAUDE.md.*
