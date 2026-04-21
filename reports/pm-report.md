# Peakly PM Report — 2026-04-21

**Filed by:** Product Manager agent  
**Date:** 2026-04-21  
**Status:** All P1 venue bugs cleared (Apr 19). needsMarine fixed (Apr 20). Cache current. Two P2s remain before Reddit: delete duplicate venues + remove fabricated review counts. No remaining technical gate on launch.

Full report: [pm-2026-04-21.md](./pm-2026-04-21.md)

---

## Shipped Since Last Report (2026-04-17 → 2026-04-21)

| Commit | What |
|--------|------|
| `390918c` (Apr 19) | 9 venue tag credibility fixes |
| `387f0be` (Apr 20) | needsMarine batch regression fix (tanning venues) |
| `5decd31` (Apr 21) | Cache bust v=20260421a + SW peakly-20260421 |

---

## Top 3 This Week

1. **Delete `cloudbreak-fiji-s21` + `punta-roca-s12` duplicates** — 15 min. Last pre-launch venue cleanup.
2. **Remove fabricated review counts from VenueCard display** — 30 min. Conditions score is real; review counts are theater.
3. **Jack: Name the Reddit launch date.** No tech excuse remains.

---

## Decisions Made

| Item | Decision |
|------|----------|
| Delete duplicate venue entries | **SHIP. TODAY.** |
| Remove review count display from VenueCards | **SHIP. TODAY.** |
| Strike alerts background worker | **DEFER** — 0 users, build on demand |
| Onboarding / scoring explainer | **DEFER** — Reddit surfaces real confusion |
| Window Score / Forecast Horizon | **DEFER** — build post-traction |
| iOS App Store | **DEFER** — no retention data |
| JSON-LD / SRI / CSP | **DEFER** — 81% SEO is fine for launch |
| Additional venue tag audits | **CUT** — 9 fixes shipped, diminishing returns |

---

## All Confirmed Closed

- TP_MARKER = "710303" ✅
- Sentry DSN configured ✅
- Email capture → real fetch() to /api/waitlist ✅
- Pro pricing $9/mo discrepancy ✅ (false alarm, no such UI)
- Cache buster stale ✅ (v=20260421a current)
- 9 venue credibility bugs ✅ (fixed Apr 19)
- needsMarine beach regression ✅ (fixed Apr 20)
