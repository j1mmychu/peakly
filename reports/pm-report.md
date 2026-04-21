# Peakly PM Report — 2026-04-21

**Filed by:** Product Manager agent  
**Date:** 2026-04-21  
**Status:** 6 days since last product code. 5 confirmed P1 surfing venue tags live on production. Pro pricing / Sentry / TP_MARKER briefing items all confirmed CLOSED (false alarms).

Full report: [pm-2026-04-21.md](./pm-2026-04-21.md)

---

## Shipped Since Last Report (2026-04-17 → 2026-04-21)

Zero product code. One report commit only.

---

## Top 3 This Week

1. **Fix 5 surfing venue tags** — cloudbreak-fiji-s21, punta-roca-s12 (delete duplicate), snappers-gold-coast-s26, matanzas-s17, capbreton-s27. 1 hour. Must ship before Reddit.
2. **Fix 3 ski batch venue tags** — lech-zurs-s27, aspen-snowmass-s7, kicking-horse-s10. 1 hour. Same deadline.
3. **Jack: LLC status check** — REI approval is +$6.16 RPM. What's blocking and when does it close?

---

## Decisions Made

| Item | Decision |
|------|----------|
| Fix surfing credibility tags | **SHIP. TODAY.** |
| Delete punta-roca-s12 duplicate | **SHIP. TODAY.** |
| Strike alerts background worker | **DEFER** — 0 users, 2-3 days VPS work |
| Onboarding/scoring explainer | **DEFER** — Reddit reveals real confusions |
| JSON-LD / SEO hardening | **DEFER** — 81% is launch-acceptable |
| iOS App Store | **DEFER** — no retention data yet |

---

## Open P1 Bugs

- `cloudbreak-fiji-s21` — "Beach Break, All Levels" on a wave that kills professional surfers
- `punta-roca-s12` — "Beginner Friendly" on El Salvador's heaviest break + duplicate card in Explore
- `snappers-gold-coast-s26` — "Beach Break, All Levels" on the Superbank (WSL CT stop)
- `matanzas-s17` — "Beginner Friendly, Warm Water" — cold Chilean left (~14°C)
- `capbreton-s27` — "Beginner Friendly, Warm Water" — cold Atlantic France

All other previously flagged issues (TP_MARKER, Sentry DSN, email capture, Pro pricing) confirmed CLOSED.
