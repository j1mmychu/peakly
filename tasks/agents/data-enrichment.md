# Data Enrichment Agent — Peakly Venue Data Quality

## Objective
Scan all venue entries in app.jsx for missing or incomplete data fields. Identify gaps in photos, coordinates, tags, airport codes, and other required fields. Fix gaps automatically where possible.

## Steps

1. Read `/sessions/wonderful-friendly-edison/mnt/peakly-github/CLAUDE.md` for current project state.

2. Read `/sessions/wonderful-friendly-edison/mnt/peakly-github/app.jsx` and parse the VENUES array (starts around line 200-900).

3. For each venue, check these required fields exist and are valid:
   - `id` — non-empty string
   - `title` — non-empty string
   - `location` — non-empty string with country
   - `category` — one of: skiing, surfing, tanning, hiking, diving, climbing
   - `lat`, `lng` — valid coordinates (lat: -90 to 90, lng: -180 to 180)
   - `ap` — valid 3-letter airport code that exists in ALL_AIRPORTS
   - `photo` — valid Unsplash URL (starts with https://images.unsplash.com/)
   - `gradient` — CSS gradient string
   - `icon` — emoji string
   - `rating` — number between 1.0 and 5.0
   - `reviews` — positive integer
   - `tags` — non-empty array of strings
   - `best` — best season description string

4. Flag venues with:
   - Missing photo URLs
   - Invalid or missing coordinates
   - Airport codes not in ALL_AIRPORTS
   - Missing tags or empty tag arrays
   - Duplicate venue IDs
   - Venues with the same coordinates (copy-paste errors)

5. For fixable issues (missing photos, incomplete tags):
   - Add appropriate Unsplash photo URLs for venues missing photos
   - Add relevant tags based on venue category and location
   - Ensure all airport codes are valid

6. Write a report to `/sessions/wonderful-friendly-edison/mnt/peakly-github/reports/data-enrichment-report.md` with:
   - Date of scan
   - Total venues scanned
   - Issues found (categorized by severity: critical, warning, info)
   - Fixes applied (if any)
   - Remaining gaps that need manual attention

## Success Criteria
- All 171+ venues scanned
- Zero venues with missing critical fields (id, title, category, coordinates, airport)
- All photos are valid Unsplash URLs
- Report generated with clear issue counts

## Constraints
- Do NOT change venue IDs, titles, or scoring logic
- Do NOT remove any existing data — only add missing fields
- Do NOT change the structure of the VENUES array
- If making fixes, create a backup comment noting what was changed
- Update CLAUDE.md if venue count changes
