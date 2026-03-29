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
