# Context folder

Drop prior chat exports, design discussions, decision logs, and any other "what we already talked about" material here as `.md` files.

## Naming convention
`YYYY-MM-DD-topic.md` — most recent first when sorted.

Examples:
- `2026-04-09-design-call-cta-colors.md`
- `2026-04-08-pricing-discussion.md`
- `2026-03-25-llc-strategy-chat.md`

## How Claude uses this folder
CLAUDE.md instructs every new Claude session to check `context/*.md` for relevant past discussions. So anything you drop here will be picked up automatically — you don't have to remind future sessions.

## What to drop here
- ✅ Chat exports from claude.ai web
- ✅ Notes from voice/video calls
- ✅ Decision rationale that's too long for CLAUDE.md
- ✅ Screenshots transcribed to text
- ❌ Don't drop the entire CHANGELOG (already in CHANGELOG.md)
- ❌ Don't drop daily agent reports (already in reports/)
