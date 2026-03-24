# QA Agent — Peakly Daily Quality Assurance

## Objective
Open the live Peakly site, verify it loads without JS errors, test that each tab and core interaction works, and report any broken UI or functionality.

## Steps

1. Read `/sessions/wonderful-friendly-edison/mnt/peakly-github/CLAUDE.md` for current project state and known issues.

2. Open the live site at https://j1mmychu.github.io/peakly/ in the browser.

3. Check for JavaScript errors in the browser console. Record any Babel parse errors, React errors, or unhandled exceptions.

4. Verify core page load:
   - Logo and search bar render
   - Category pills (All, Skiing, Surfing, Beach & Tan) appear with venue counts
   - Hero card ("Your Best Window Right Now") renders with venue data
   - "Best Right Now" carousel loads with venue cards and photos
   - "All experiences" section loads with venue cards

5. Test each bottom nav tab:
   - Explore tab (default) — verify venues load
   - Alerts tab — verify alert list or empty state renders
   - Profile tab — verify profile form renders

6. Test interactions:
   - Tap a venue card — verify VenueDetailSheet opens
   - Swipe down on the detail sheet — verify it dismisses
   - Tap a category pill — verify filtering works
   - Tap Search button — verify SearchSheet opens

7. Check for visual issues:
   - Missing photos (broken image placeholders)
   - Overlapping text or misaligned elements
   - Cards with missing data (no score, no price, no label)

8. Screenshot any broken UI elements found.

9. Write a report to `/sessions/wonderful-friendly-edison/mnt/peakly-github/reports/qa-report.md` with:
   - Date and time of check
   - PASS/FAIL status for each check
   - Console errors (if any)
   - Screenshots of broken UI (if any)
   - Recommended fixes

## Success Criteria
- All tabs load without JS errors
- Hero card and venue cards render with photos and scores
- No broken UI elements
- Report generated with clear PASS/FAIL for each check

## Constraints
- Do NOT modify any code — this is a read-only audit
- Do NOT push any changes
- Report findings only
