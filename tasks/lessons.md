# Peakly — Lessons Learned

> Updated after every correction. Review at session start.

## Patterns & Rules

1. **Single file architecture** — Never split `app.jsx` unless explicitly asked. All code goes in one file.
2. **No build step** — Code must work with Babel Standalone. No imports/exports, no ES modules.
3. **Check before adding** — Always verify data doesn't already exist before adding (e.g., BASE_PRICES airports were already present).
4. **Push before stopping** — The stop hook checks for unpushed commits. Always push at end of session.
5. **Branch naming** — Always use the assigned `claude/` branch. Never push to main.
6. **Hardcoded lists are duplicated everywhere** — Components often have their OWN local arrays of categories/activities that DON'T reference the central `CATEGORIES` constant. When hiding/changing categories, you MUST grep the entire file for every hardcoded list (e.g., GuidesTab has its own `guideCategories` array, TripBuilder has its own sport list). Changing just `CATEGORIES` is NOT enough. Always do `grep` for category IDs and labels across the whole file.
7. **Don't claim work is done without verifying** — Never say "all X are now hidden/updated" unless you've actually audited every reference. A central constant change doesn't guarantee all UI surfaces are updated. Run a full search before marking complete.
8. **US-only flights** — Flight pricing only supports US departure airports. Don't show "worldwide" airport search. Filter to US flag emoji.
9. **MANDATORY: grep before claiming completion** — Before stating any change is "done" or "complete", run a grep for every related term (IDs, labels, variable names) across the entire file. Read the results. If there are matches you haven't addressed, you're not done. No exceptions. This is not optional.
10. **Never infer coverage from a central change** — Updating a shared constant does NOT mean every component uses it. Components in this codebase have local hardcoded arrays, local switch statements, and local filter logic that duplicate or override central data. Treat every component as independently authored until proven otherwise.
11. **Open-Meteo already adjusts for elevation** — The API returns temperature adjusted for the elevation at the queried (lat,lon). Do NOT double-count by also subtracting a full valley-to-summit lapse rate. Only adjust from base (API reference point) to mid-mountain.
12. **Scoring algorithm must handle seasons** — Southern hemisphere ski resorts (lat < 0) have opposite seasons. Always check month and return a "closed/off-season" score when out of season. Don't score weather for a closed resort.
13. **Surf venues need `facing:` data** — Without the compass direction the break faces, the swell direction efficiency calculation defaults to 270° (west) for every spot. This makes the algorithm useless. Every surf venue MUST have a facing direction.
14. **Multi-day storms matter more than single-day snow** — A 3-day storm dumping 60"+ should score dramatically higher than 10" overnight. Always look at cumulative snowfall across the forecast window.
15. **Quality over quantity** — 30 curated resorts with real stats beats 200 with garbage data. When in doubt, cut venues rather than keep low-quality ones.
16. **Every scoring variable must be used** — If you compute a variable in the scoring function, it must affect the score or the label. Dead variables (computed but never referenced) are bugs.
