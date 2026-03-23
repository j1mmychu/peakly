# Peakly — Lessons Learned

> Updated after every correction. Review at session start.

## Patterns & Rules

1. **Single file architecture** — Never split `app.jsx` unless explicitly asked. All code goes in one file.
2. **No build step** — Code must work with Babel Standalone. No imports/exports, no ES modules.
3. **Check before adding** — Always verify data doesn't already exist before adding (e.g., BASE_PRICES airports were already present).
4. **Push before stopping** — The stop hook checks for unpushed commits. Always push at end of session.
5. **Branch naming** — Always use the assigned `claude/` branch. Never push to main.
