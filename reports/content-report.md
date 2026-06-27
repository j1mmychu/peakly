# Peakly Content & Data Quality Report — 2026-06-27

**Data health score: 96/100** ↔ unchanged | Build: `20260627a` | Venues: **370** (131 ski / 239 beach) | Max photo repeat: 3×

---

## Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **370 venues, 2 categories (skiing + beach).** Pivot happened May 2026. |
| "Hiking has ZERO gear items" | **Hiking category does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired May 2026. |
| "Add 5 new venue objects" | **VENUE FREEZE active (PM v68, June 24).** No additions until post-launch Plausible data confirms demand. |
| "197 venues have empty tag arrays" | **FALSE — all 370 venues have tags.** Prior reports miscounted multi-line JSON format as empty. See §4. |

---

## Fix Applied This Run

**None.** Previous run (June 26) applied tag enrichment to 40 single-tag ski venues → 4 tags each. All code/content gates closed. This run is a verification pass + photo-bug correction.

Tag enrichment confirmed held (0 single-tag venues). This run verified all structural integrity checks against `20260627a` build and corrected the photo-duplicate methodology in §2 below.

---

## 1. Data Integrity Audit

### Venue Counts

| Category | Count | In Season (Jun 26, N. Hemi Summer) |
|----------|-------|-------------------------------------|
| **beach** | 239 | ~181 N.hemi firing (PEAK) · ~58 S.hemi suppressed by <18°C cap |
| **skiing** | 131 | 23 S.hemi in-season (NZ/AUS/Chile/Argentina) · 108 N.hemi off-season · 6 `lateSeason:true` glaciers eligible |
| **TOTAL** | **370** | Venue freeze active. No additions this run. |

### Structural Integrity

| Check | Result |
|-------|--------|
| Duplicate IDs | ✅ 0 |
| Missing lat/lon | ✅ 0 (370 lat + 370 lon entries confirmed) |
| Missing airport codes | ✅ 0 (370 `ap` entries confirmed) |
| Missing tags | ✅ 0 (all 370 have ≥2 tags; enrichment held) |
| Missing photos | ✅ 0 (370 photo URLs) |
| AP_CONTINENT coverage | ✅ All venue AP codes resolve |
| Max photo repeat | ✅ 3× (methodology corrected this run — see §2) |
| `lateSeason:true` venues | ✅ 25 (previous reports cited 6 — grep missed quoted-key format) |
| GEAR_ITEMS refs | ✅ 0 — Amazon cut for v1, confirmed |
| Build stamp | ✅ `20260627a` (DevOps bumped today) |
| Tag enrichment | ✅ 0 single-tag venues (was 40 on June 25) |

---

## 2. Photo Audit — Methodology Correction

The June 4 report claimed "0 photo duplicates" and the June 26 report cited "Max repeat: 3×" from the June 13 photo-dedup script. Earlier agent passes were matching only the Unsplash ID prefix (`photo-1544550581`) rather than the full slug (`photo-1544550581-5f7ceaf7f992`), causing false positives.

**Correct count this run (full URL matching):**
- 370 photo entries, **135 unique photo IDs**
- Max repeat: **3×** — confirmed correct, no regression
- 107 photo IDs used by exactly 3 venues; 21 used by 2 venues; none used 4+
- Photo-dedup ceiling from June 13 (`scripts/photo-dedup.cjs`) is intact

No action needed. The 3× ceiling is the established acceptable threshold.

---

## 3. GEAR_ITEMS Audit

**`GEAR_ITEMS = 0` — correct.** Amazon cut for v1 (Jack's decision, June 9). Revenue model is $7.58/1K MAU. The stale harness prompt claiming "Hiking has ZERO gear items" references a category that does not exist.

---

## 4. Seasonal Relevance — June 27 (N. Hemisphere Peak Summer)

### Actively Scoring (High Confidence)

**Beach N. Hemisphere (~181 venues):** PEAK season. Mediterranean, Caribbean, US Atlantic/Gulf Coast, SE Asia, Hawaii all firing. UV indexes peak in this window. Hurricane season began June 1 — precip data from Open-Meteo dynamically suppresses Gulf/Atlantic venues during storm windows without manual intervention.

**Ski S. Hemisphere (23 venues):** NZ (Cardrona, Mt Hutt, Coronet Peak, Remarkables, Treble Cone) and Australian resorts (Falls Creek, Mt Buller, Hotham, Perisher, Charlotte Pass) are in peak winter ops. Chilean/Argentine Andes (Portillo, Valle Nevado, La Parva, El Colorado, Nevados de Chillán, Corralco, Cerro Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor) peak window. Hemisphere flag `isNorth = lat >= 0` gates all 23 correctly.

**Ski N. Hemisphere with `lateSeason:true` (25 venues):** Zermatt/Cervinia, Tignes, Val Thorens, Engelberg, Verbier, Mammoth, and 19 others eligible for glacier ops. Score bypass active when `snow_depth_max >= 0.5m`. Correct.

### Suppressed

**Ski N. Hemisphere (108 venues, no lateSeason):** Off-season cap applied. Correct behavior.

**Beach S. Hemisphere (~58 venues):** Below 18°C water temp hard cap. Correct.

**Highlight for PM:** The 23 S.Hem ski venues are the sole ski story until September. Reddit post (Day 22) timing now overlaps NZ/AUS peak opening weekend — strong angle for any ski-focused copy.

---

## 5. Content Quality — TAG VERIFICATION

Tag enrichment from June 26 held. Verification via multi-line regex (correctly handles both compact and JSON-format venue entries):

| Tag Count | Result |
|-----------|--------|
| 0 tags | ✅ 0 venues |
| 1 tag | ✅ 0 venues (was 40 on June 25) |
| 2 tags | 235 venues |
| 3 tags | 17 venues |
| 4 tags | 117 venues |
| 5+ tags | 1 venue |

**Note on tag methodology:** Prior scripts that reported "197 empty-tag venues" were matching single-line `tags:[...]` only and missed multi-line JSON-format arrays. The correct multi-line match confirms 0 empty and 0 single-tag venues. This finding was first documented June 25 and confirmed June 26; now re-verified June 27.

**Remaining thinness:** ~235 venues have exactly 2 tags — functional for filter pills, thin for discovery browsing. Post-launch sprint after Plausible data shows which filter tags users actually use.

---

## 6. New Venue Additions — NONE THIS RUN

**Venue freeze in effect (PM v68, June 24).** The stale harness prompt requests 5 new venues — this contradicts the active PM freeze. No venues added.

Post-launch deferred pipeline (needs Plausible demand data + AP_CONTINENT entries):
- Caribbean: Nassau (`NAS`)
- S. America beach: Cartagena (`CTG`)
- Japan beach: Okinawa (`OKA`)
- Florianópolis already mapped: `FLN` ✅

---

## One Observation for the PM

**The catalog is done; so is every content gate.** All 370 venues: ≥2 tags ✅, no duplicate IDs ✅, no missing fields ✅, photos max 3× ✅, 135 unique photo IDs. The `lateSeason` count correction (6→25, prior grep was missing quoted-key format venues) means more summer glacier venues are eligible for the scoring bypass than previously reported — no code change needed, the data was always correct.

The Reddit post lands on Day 22. The 23 S.Hem ski venues (NZ, AUS, Chile, Argentina) are at peak season right now. If the post targets r/skiing or r/snowboarding, the opening-weekend framing is live and fully backed by accurate scores.

---

*Content agent — 2026-06-27 UTC | Repo: 3a65e80*
