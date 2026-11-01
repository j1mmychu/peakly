# Peakly Content & Data Report — 2026-11-01

## Data Health Score: 88/100

**Deductions:**
- −7: **225 venues have <3 tags** (190 beach, 35 skiing) — thin tags hurt search/filter UX and the "Powder Day" / "Crystal Water" type feature labels on cards. Not a crash risk, but a quality gap.
- −5: **Venue addition queue FROZEN by PM** — 20+ proposals accumulated across Oct; PM v193–v197 explicitly halted new venues until the queue is reviewed post-App Store submission. Score deducted for the backlog, not for a data error.

> **⚠️ STALE TASK PROMPT NOTE:** This routine's stored prompt references "182 venues, 12 categories, hiking gear items." Actual state (verified by bracket-walk of VENUES array): **404 venues, 2 categories (skiing + beach), GEAR_ITEMS cut for v1**. All counts below are from actual code, not CLAUDE.md memory.

---

## 1. DATA INTEGRITY AUDIT

| Check | Result |
|-------|--------|
| Total venues | **404** |
| Skiing | 134 |
| Beach | 270 |
| Categories | 2 (skiing, beach) — correct post-pivot |
| Duplicate IDs | **0** ✅ |
| Missing coordinates | **0** ✅ |
| Missing airport codes (ap) | **0** ✅ |
| Missing tags | **0** ✅ |
| Missing photos | **0** ✅ (100% coverage) |
| Missing titles | **0** ✅ |
| Duplicate photo URLs | **0** ✅ |
| Bad category values | **0** ✅ |
| `scripts/.venue-baseline` | **404** — matches actual count ✅ |
| AP_CONTINENT coverage | All 165 venue APs present ✅ |
| AIRPORT_COORDS coverage | All 165 venue APs present ✅ |
| BASE_PRICES coverage | All 165 venue APs covered (181 entries) ✅ |

**Integrity: CLEAN.** Previous report's claim of 209 venues / missing APs / baseline mismatch was inaccurate — prior session was reading a stale app.jsx. Current HEAD (after PR #20 merged) is correct.

---

## 2. GEAR ITEMS AUDIT

Per CLAUDE.md: **GEAR_ITEMS cut for v1 (Jack's decision, 2026-06-09, affirmed 2026-06-10).** `grep -c GEAR_ITEMS app.jsx` → 0. This is intentional. Amazon Associates revenue is $0 for v1; revisit post-launch.

**No action required on gear items until Amazon is re-enabled.**

---

## 3. SEASONAL RELEVANCE (Nov 1)

**Northern hemisphere (ski):** Early season. 111 N-hem ski venues — most major resorts don't open until late Nov/Dec. The 15 `lateSeason: true` glacier/high-altitude venues (Hintertux, Tignes, Val Thorens, Zermatt, Saas-Fee, Les Deux Alpes, Engelberg, St. Moritz, Chamonix, Whistler, Mammoth, Verbier, Cervinia, A-Basin, Snowbird) are correctly flagged and will bypass off-season caps when snow depth ≥ 0.5m. These are the right venues to surface in Nov.

**Southern hemisphere (ski):** 23 S-hem ski venues (NZ, AU, Chile, Argentina) — late season, ending now. These should score poorly via normal season gating. ✅ No intervention needed.

**Northern hemisphere (beach):** 201 N-hem beach venues — declining conditions through Nov–Feb. Score engine handles this via UV/temp scoring. ✅

**Southern hemisphere (beach):** 69 S-hem beach venues — coming into season (Nov–Mar). This is the right inventory to surface now. Examples: Bora Bora, Zanzibar, Seychelles, Mauritius, Brazil, Mozambique, Maldives. ✅

**Seasonal alignment is correct.** No venues are misclassified or missing hemisphere-appropriate flags.

---

## 4. CONTENT QUALITY — TAG ENRICHMENT NEEDED

**225 venues (55.7%) have fewer than 3 tags.** This is the main quality gap.

| Category | Venues with <3 tags | Total | % thin |
|----------|---------------------|-------|--------|
| Beach | 190 | 270 | 70% |
| Skiing | 35 | 134 | 26% |

Average tags per venue: **2.9** (target: ≥4 per venue for good card UX)

### Top candidates for tag enrichment (beach, exactly 2 tags):
- `borabora` — "UV 11, Crystal Water" → add: Overwater Bungalows, Lagoon Snorkeling
- `beach_gcm` (Seven Mile Beach) → add: Long Flat Reef, Turtle Nesting
- `beach_tulum` → add: Jungle Backdrop, Eco Vibes
- `beach_holbox` — "No Cars, Whale Shark Season" → add: Bioluminescence, Kitesurfing
- `beach_negril` — "Legendary Sunsets, Cliff Diving" → add: 7-Mile Beach, Reggae Culture

### Top ski venues with thin tags:
- `chamonix` (2) — add: Mont Blanc Views, Vallée Blanche, Steep & Deep
- `aspen` (2) — add: Celebrity Scene, Maroon Bells, Blue Sky Basin
- `vail` (2) — add: Back Bowls, Après-Ski Culture, Blue Sky Basin
- `alta` (2) — add: Powder Stash, Snowbird Adjacent, Members Only Feel
- `jacksonhole` (2) — add: Corbet's Couloir, Tram Laps, Wolf Pack Powder

---

## 5. VENUE ADDITIONS

**⛔ QUEUE FROZEN per PM v193–v197.** 20+ venue proposals are queued from prior agent sessions. PM has explicitly halted new additions until post-App Store submission and queue review. **No new venue objects added this run.**

Once the freeze lifts, priority additions should target:
- Additional S. hemisphere beach (in-season Nov–Mar): South Africa (Cape Town/Wilderness), Western Australia (Broome), New Zealand (Abel Tasman)
- Glacier ski for early season: Stubai Glacier (Austria), Dachstein Glacier, Pitztal Glacier

---

## 6. PM-LEVEL OBSERVATION

**The tag-enrichment pass (225 venues) is a low-risk, high-signal quality lift that can happen without a venue freeze waiver.** It's an in-place edit of existing venue objects — no ID changes, no new entries, no baseline impact, no auto-push guard trip. If there's 1–2 hours of agent time available before the Nov 7 VPS deadline, enriching the ~190 beach venues from 2 tags → 4+ tags would meaningfully improve card readability and filter hit rates (the "Powder Day" / "Crystal Water" tag-filter feature depends on tag density). Propose this as a pre-launch polish task, not gated on the venue queue review.
