# Peakly Content & Data Report — 2026-11-07

## Data Health Score: 88/100

**Deductions (unchanged — Day 8):**
- −7: **225 venues have ≤2 tags** (Day 8 of finding) — tag enrichment remains the highest-leverage content improvement within the venue freeze.
- −5: **Venue addition queue FROZEN** per PM v193+ directive, deferred post-Reddit gate. Scored for the backlog, not a data error.

> **⚠️ STALE TASK PROMPT NOTE:** This routine's stored prompt references "182 venues, 12 categories, hiking gear items." Actual state (verified continuously since 2026-11-01): **404 venues, 2 categories (skiing + beach), GEAR_ITEMS cut for v1.** All numbers below are from live app.jsx via `eval()`.

> **⚠️ DEVOPS LATESEASON CORRECTION:** Today's DevOps report flagged "lateSeason count dropped to 10 (was 15)." This is a **methodology artifact** — the same regex/bracket-walk issue that plagued counting before the eval counter was introduced. `eval(VENUES)` confirms **15 lateSeason:true venues, unchanged.** DevOps should use the eval method for all venue counts.

---

## 1. DATA INTEGRITY AUDIT

| Check | Result |
|-------|--------|
| Total venues | **404** ✅ (`.venue-baseline` confirmed) |
| Skiing | **134** |
| Beach | **270** |
| Categories | **2** (skiing, beach) — correct post-pivot |
| Duplicate IDs | **0** ✅ |
| Missing coordinates | **0** ✅ |
| Missing airport codes (ap) | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| Missing photos | **0** ✅ |
| Missing titles | **0** ✅ |
| `lateSeason: true` venues | **15** ✅ — UNCHANGED (DevOps count of 10 was a methodology error; eval is authoritative) |
| `poolPrimary: true` venues | 0 (scoring logic present; no venues set — intentional) |
| `scripts/.venue-baseline` | **404** ✅ — matches actual count |
| BASE_PRICES coverage | **181 airport codes, 100% venue AP coverage** ✅ — all 165 unique venue APs present (Open #22 fully resolved) |
| AP_CONTINENT / AIRPORT_COORDS | Verified CLEAN — no app.jsx changes in 20 days |
| Low ratings (<4.0) | **0** ✅ |
| Duplicate photos | **0** ✅ — 404 unique URLs |

**Integrity: CLEAN.** No changes to app.jsx since `6f0e744` 2026-10-18 (20 days). Last 7 days of commits are reports only.

**Cache stamp: `20261031a`** — 7 days stale (unchanged). Will auto-bump on next app.jsx change. Not a content error.

**⛔ ROLLBACK ALERT (not a content issue — flagging for visibility):** DevOps confirms `fix-appjsx-final` branch is a ~6-month rollback to May 2026 (smaller codebase, missing the full 404-venue catalog). DO NOT MERGE.

---

## 2. GEAR ITEMS AUDIT

Per CLAUDE.md: **GEAR_ITEMS cut for v1 (Jack's decision 2026-06-09, affirmed 2026-06-10).** `grep -c GEAR_ITEMS app.jsx` → 0. Intentional.

**No action required on gear items until Amazon is re-enabled post-launch.**

---

## 3. SEASONAL RELEVANCE (Nov 7, 2026)

| Segment | Count | Status |
|---------|-------|--------|
| N-hem ski `lateSeason:true` | 15 | ✅ **Active now** — glacier/high-altitude venues bypassing off-season binary cap at ≥0.5m snow depth |
| N-hem ski (regular) | 96 | Opening season — most NH resorts open late Nov/Dec; scoring off-season cap handles correctly |
| S-hem ski | 23 | End of season — scoring correctly deprioritizes |
| N-hem beach | 201 | Off-peak — UV/temp scoring handles naturally |
| S-hem beach | 69 | ✅ **PEAK SEASON** — Bora Bora, Zanzibar, Maldives, Mauritius, Brazil, Mozambique, Seychelles, Fiji surfacing correctly |

**Seasonal alignment is correct.** The 15 `lateSeason:true` glacier venues are the right early-November ski inventory: Whistler, Chamonix, Mammoth, A-Basin, Tignes, Hintertux Glacier, Cervinia, Snowbird, Zermatt, Engelberg, Verbier, Val Thorens, Les Deux Alpes, Saas-Fee, St. Moritz.

**⏰ WHISTLER OPENS NOV 21 — 14 DAYS.** Whistler is the #1 venue by rating (4.97, 2,840 reviews) and already has `lateSeason:true`. It will surface correctly as scoring conditions improve. No action needed.

---

## 4. CONTENT QUALITY

| Metric | Result |
|--------|--------|
| Venues with ≤2 tags | **225** (Day 8 — persistent finding) |
| Venues with ≥3 tags | **179** (44%) |
| Average tags per venue | **3.1** |
| Venues missing description field | 0 (field not used in this architecture — scoring uses tags) |
| All photos on-theme | Unknown — the 2026-07-24 audit found ~346/373 were generic stock; no bulk re-verification since |

**225 thin-tag venues remain the top content improvement.** These are primarily the 195 JSON-formatted batch venues (beach + ski) added 2026-06-09 that received only 2 tags at import. The 179 original compact-format venues average 4+ tags. No action this cycle (venue freeze active, PM directive to hold changes until post-Reddit gate).

---

## 5. VENUE ADDITIONS

**QUEUE FROZEN.** PM directive (v193+): no venue changes until post-Reddit gate. No additions this cycle.

> Task prompt requests 5 new venues targeting stub categories — **N/A for this architecture.** The app has 2 categories (skiing + beach), both healthy (134 and 270 venues). No "stub categories" exist. Venue additions are deferred per PM.

---

## ONE OBSERVATION FOR THE PM

**The DevOps "lateSeason dropped to 10" alarm is a false positive.** Eval confirms 15 unchanged — but it means DevOps is still using a counting method that undercounts JSON-format venues. If DevOps runs any automated check that acts on venue counts (e.g., a threshold alert), it could fire incorrectly. The eval method in `scripts/auto-push.sh` is the authoritative counter; all other scripts should use it. Worth a note in `tasks/agents/devops.md` to prevent recurring false alarms.
