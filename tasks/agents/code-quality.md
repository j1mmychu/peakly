# Code Quality & Ops Agent — Peakly Codebase Health

## Objective
Scan app.jsx for syntax issues, validate all venue data integrity, verify CLAUDE.md is in sync with actual code state, and generate a daily codebase health report.

## Steps

1. Read `/sessions/wonderful-friendly-edison/mnt/peakly-github/CLAUDE.md` for documented state.

2. **Syntax validation** — Scan `/sessions/wonderful-friendly-edison/mnt/peakly-github/app.jsx`:
   - Check for missing commas between object properties (the pattern `reviews:NNNNgradient:` has broken the app before)
   - Verify balanced braces, brackets, and parentheses
   - Check for unclosed template literals (odd backtick count)
   - Look for duplicate variable declarations in the same scope
   - Verify the file ends properly with ReactDOM.createRoot and render call
   - Count total lines and compare to documented count in CLAUDE.md

3. **Venue data validation** — Parse the VENUES array and check each entry:
   - All required fields present: id, title, location, category, lat, lng, ap, gradient, icon, rating, reviews, tags, best
   - Photo field present and is a valid Unsplash URL
   - Airport code exists in ALL_AIRPORTS array
   - Coordinates are valid (lat: -90 to 90, lng: -180 to 180)
   - No duplicate IDs
   - Category is one of the valid categories in CATEGORIES array
   - Rating is between 1.0 and 5.0
   - Reviews is a positive integer
   - Tags is a non-empty array

4. **CLAUDE.md sync check** — Compare documented state to actual code:
   - Does the documented venue count match actual count?
   - Are all "shipped" features actually present in the code?
   - Are all documented components (ListingCard, CompactCard, etc.) present?
   - Does the documented file structure match reality?
   - Are there features in the code not documented in CLAUDE.md?

5. **Git state check** — Run git status and git log:
   - Are there uncommitted changes?
   - What was the last commit and when?
   - Is the local branch ahead of remote?
   - Any merge conflicts?

6. **Dependency health** — Check CDN dependencies in index.html:
   - Are React/ReactDOM/Babel CDN URLs still valid?
   - Are there any deprecated CDN versions?
   - Is the cache-busting parameter on app.jsx up to date?

7. Write a report to `/sessions/wonderful-friendly-edison/mnt/peakly-github/reports/code-quality-report.md` with:
   - Date of audit
   - Overall health score (Critical/Warning/Healthy)
   - Syntax check results
   - Venue data validation results (issues by severity)
   - CLAUDE.md sync status
   - Git state summary
   - Dependency status
   - Action items (prioritized)

## Success Criteria
- Full syntax scan completed without false positives
- All venues validated against schema
- CLAUDE.md drift identified and documented
- Report generated with clear health score

## Constraints
- Do NOT modify app.jsx — this is a read-only audit
- Do NOT push any changes
- Do NOT modify CLAUDE.md — only report drift
- If critical syntax issues are found, flag them prominently in the report
- Keep the report concise — focus on issues, not passing checks
