# Venue expansion workflow

VENUES is hardcoded in `app.jsx` (no build step). This script vets new venues against 10 consistency rules so what ships is always accurate and complete.

## One-time setup

Nothing — uses Node's built-in `fetch`, no npm deps.

## Adding venues

1. Drop new venues into `data/venue-candidates.json` as a JSON array. Schema matches the VENUES entry shape — see `data/venue-candidates.example.json`.

   Required fields per venue: `id, title, location, category, ap, lat, lon, gradient, icon, tags`.
   Optional: `rating, reviews, accent, photo, lateSeason, poolPrimary, beachSeason, skiPass`.

2. Run the validator:

   ```
   node scripts/validate-venues.mjs
   ```

   Or run in watch mode so it auto-re-runs as you fix things:

   ```
   node scripts/validate-venues.mjs --watch
   ```

3. Read `data/venue-rejected.md` for any rejected candidates + warnings. Rejections are grouped by rule so you can fix all R4s (missing airports) in one pass before re-running.

4. Open `data/venue-accepted.json` — that's the cleaned set. Copy the array contents (without the outer brackets) and paste into the VENUES array in `app.jsx`.

5. Commit + push. Auto-push hook will ship it.

## Validation rules

| Rule | What it checks |
|---|---|
| R1 | All required fields present (id, title, location, category, ap, lat, lon, gradient, icon, tags) |
| R2 | `id` is kebab-case and not already in VENUES |
| R3 | lat ∈ [-90, 90], lon ∈ [-180, 180] |
| R4 | `ap` is a 3-letter IATA AND exists in `AIRPORT_COORDS` (line ~2169 of app.jsx) |
| R5 | Distance from venue lat/lon to airport lat/lon < 300 mi (catches mismatched venue-airport pairs) |
| R6 | category ∈ {skiing, beach}; `skiPass` field only on skiing |
| R7 | `photo` URL returns HTTP 200 on HEAD request (catches dead Unsplash links) |
| R8 | `tags` is an array, each ≤ 20 chars; new tags get flagged for review (not rejected) |
| R9 | `lateSeason: true` requires `|lat| ≥ 35` AND `category === "skiing"` |
| R10 | `poolPrimary: true` requires `category === "beach"` |

## Adding new IATA codes

If R4 fails because `ap` is a new airport: add it to `AIRPORT_COORDS` in `app.jsx` first (with accurate lat/lon — pull from any IATA reference), commit, then re-run the validator. This is the only path — there is no auto-coord lookup; the catalog is intentionally inspected.

## Mass expansion in batches

Recommended cadence: 50–100 venues per batch. Larger batches trip rate limits on the photo URL HEAD checks (Unsplash will throttle after a few hundred reqs/min). For 500+ at once, break into batches of 100 and run sequentially.

## Common rejection fixes

| Rule | Symptom | One-line fix |
|---|---|---|
| **R1** | `missing photo` (or any required field) | Add the field. Photos: pull a clean Unsplash URL — `https://images.unsplash.com/photo-<id>?w=800&h=600&fit=crop`. |
| **R2** | `id "X" already in VENUES` | The slug clashes with an existing entry. Rename to `<location>-<descriptor>` (e.g. `tahoe-heavenly-east`) or remove if it's a true duplicate. |
| **R3** | `lat … out of range` | Almost always a swapped lat/lon. Lat first, lon second. Caribbean lats are positive, Australia/NZ lats are negative. |
| **R4** | `ap "XXX" missing from AIRPORT_COORDS` | The rejection message includes a 💡 suggestion: add `XXX: { lat: <N>, lon: <N> }` to the AIRPORT_COORDS block (around line 2169 of app.jsx) and re-run. Find coords by Googling the airport name + "iata coordinates" or via openflights.org. |
| **R5** | `venue is 1240 mi from XXX (>300mi limit)` | Most likely wrong `ap`. Pick a closer airport. Acceptable if the venue is in a remote spot where the named airport really is the only sensible gateway (relax to a different airport if so). |
| **R6** | `skiPass only valid on skiing category` | You set `skiPass: "ikon"` on a beach venue. Remove the field. |
| **R7** | `photo URL not reachable` | Unsplash purged the photo. Find a new one. |
| **R8** | `new tag "X" (review + approve)` | Warning, not a rejection. Either rename to an existing tag (the list lives in current VENUES) or accept the new tag — it gets pasted into VENUES regardless. |
| **R9** | `lateSeason needs |lat|>=35` | The venue is too far south for the late-season rule. Drop the `lateSeason: true` flag. |
| **R10** | `poolPrimary only valid on beach` | You set `poolPrimary: true` on a ski venue. Remove the field. |

## Editing existing venues

The script only accepts NEW venues (R2 rejects duplicates). To edit an existing entry, hand-edit `app.jsx` directly — the validator doesn't roundtrip changes.
