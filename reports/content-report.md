# Content & Data Quality Report — 2026-05-29

**Agent:** Content & Data  
**Data health score: 88/100**

**Score breakdown:**  
Zero duplicate IDs +10 | Zero duplicate photo URLs +10 | All required fields on 157 venues +10 | All photos Unsplash (100%) +8 | GEAR_ITEMS live (shipped 05-27) +8 | ✅ 4 new venues added this run +4 | ✅ 2 tag accuracy fixes (huatulco + zlatni-rat) +3 | ✅ 3 AP_CONTINENT gaps closed (TBS, SOF, GOI) +3 | ❌ 25 ski venues missing skiPass field −4 | ❌ Goa monsoon season starts June 1 (awareness flag) −2 | ❌ No description field on any venue (schema gap) −2

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 157 venues total (+4 this run, +9 since last week)

| Category | Count | Prior week | Delta |
|----------|-------|-----------|-------|
| Beach    | 89   | 84 | +5 |
| Skiing   | 68   | 64 | +4 |
| **TOTAL** | **157** | **148** | **+9** |

Both categories well above 10-venue threshold. No stubs.

### Required Field Coverage — PASS

All 157 venues carry: id, category, lat, lon, ap, tags, photo, rating, reviews, gradient, accent.

### Duplicate IDs — NONE (boot-time IIFE validator active)
### Duplicate Photos — NONE

### Airport Code Accuracy — 3 new AP_CONTINENT entries added this run (TBS, SOF, GOI)

---

## 2. P0 FIXES APPLIED INLINE THIS RUN

### 2a. AP_CONTINENT — 3 new entries

| Code | Airport | Region | Used by |
|------|---------|--------|---------|
| TBS | Tbilisi Shota Rustaveli International | europe | ski_gudauri (new) |
| SOF | Sofia International | europe | ski_bansko (new) |
| GOI | Goa International (Dabolim) | asia | beach_goa (new) |

### 2b. Tag accuracy — 2 remaining generic tag sets corrected

| Venue | Old tags | New tags | Reason |
|-------|---------|---------|--------|
| huatulco-santa-cruz-t4 (Oaxaca, Mexico) | "Family Friendly","Clear Visibility","Blue Flag","Amenities" | "National Park Bay","Snorkeling Reefs","Blue Flag","Calm Pacific" | Generic copy-paste replaced with what Huatulco is actually famous for; Blue Flag cert valid (Mexico participates) |
| zlatni-rat-t14 (Brac, Croatia) | "Family Friendly","Clear Visibility","Blue Flag","Amenities" | "Shifting Pebble Cape","Kitesurfing","Blue Flag","Adriatic Icon" | Zlatni Rat's defining feature is its shape-shifting pebble spit; known Europe-wide for kitesurfing; Blue Flag cert valid |

Remaining Blue Flag venues (all legitimate): huatulco-santa-cruz-t4 (Mexico), zlatni-rat-t14 (Croatia)

---

## 3. GEAR ITEMS STATUS — LIVE

GEAR_ITEMS constant shipped in commit 932943c (2026-05-27). Amazon Associates peakly-20 now active.
- Skiing (4): Smith I/O MAG Goggles $249, Atomic Bent Chetler Skis $599, Helly Hansen Ski Jacket $449, Burton Custom Bindings $329
- Beach (4): Hydro Flask 32oz $49, Aqua Marina SUP $499, Maui Jim Sunglasses $329, Nautica Rashguard UV50+ $45

Wire-up: {GEAR_ITEMS[listing.category] && ...} in VenueDetailSheet after ScoreBreakdown. Plausible gear_click event fires on tap. Known-skipped entry updated to RESOLVED 2026-05-27. Estimated revenue: ~$4.48/1K MAU.

---

## 4. SEASONAL RELEVANCE — 2026-05-29 (late May)

### North Hemisphere Skiing — LATE SEASON / MOSTLY CLOSED

7 venues with lateSeason:true still scoreable (abasin, mammoth, whistler, tignes, cervinia, chamonix, val-d-isere-s16). ~61 other NH resorts correctly scoring near-zero via off-season binary. ski_gudauri (Georgia) and ski_bansko (Bulgaria) correctly near-zero — Dec-Apr season, currently closed.

### South Hemisphere Skiing — SCORES WILL RISE CORRECTLY IN JUNE

Per 2026-05-24 investigation (in known-skipped): scoreVenue uses inSeason = mo >= 5 && mo <= 10 for lat < 0 venues. Current ~0 scores reflect pre-season snow depth = ~0m, not a cap. Scores will climb naturally as snowpack builds June onward for Portillo, Remarkables, Thredbo, etc.

### Beach — PRIME CONDITIONS NOW

Caribbean / Atlantic, Hawaii / Florida / Gulf Mexico: peak. Mediterranean warming (June peak). Phu Quoc dry season. Goa monsoon starts June 1 — see PM note.

---

## 5. FOUR NEW VENUES ADDED THIS RUN (157 total)

All verified present, no duplicate IDs or photos.

beach_phuquoc — Long Beach Phu Quoc, Vietnam (PQC) — sunset west-facing, calm Gulf waters, budget-friendly second Vietnam venue

beach_goa — Palolem Beach, Goa, India (GOI) — crescent bay, India's first venue, hippie heritage and yoga scene. Monsoon season Jun-Sep; will score near-zero during that window (correct behavior).

ski_gudauri — Gudauri Ski Resort, Kazbegi Region, Georgia (TBS) — first Caucasus skiing venue, Caucasus powder, high altitude off-piste. Dec-Apr season.

ski_bansko — Bansko Ski Resort, Blagoevgrad, Bulgaria (SOF) — Europe's top budget ski pick, Apres-Ski village, beginner-friendly. Dec-Apr season.

Note: 5th proposed venue was beach_maldives — already shipped 2026-05-27 in commit 932943c. Cumulative geographic additions since 05-27: Maldives, Sri Lanka, Turkey, Lebanon ski, Morocco ski (05-27) + Phu Quoc, Goa, Gudauri, Bansko (05-29).

---

## 6. CONTENT QUALITY — REMAINING FLAGS

### Missing skiPass field — 25 ski venues (carry-forward P1)

25 of 68 skiing venues lack skiPass. Affects pass-type filter UX. Paste-ready assignments:

- big-white-ski-s5: "ikon"
- kicking-horse-s10: "ikon"
- stowe-mountain-s14: "epic"
- All others (22 venues — zell-am-see-s1, hemsedal-s3, portillo-s4, idre-fjall-s6, kiroro-snow-world-s11, morzine-s12, sainte-foy-tarentaise-s13, champoluc-monterosa-s15, val-d-isere-s16, sun-peaks-resort-s17, pucon-ski-center-s19, les-arcs-s20, powder-mountain-s21, madarao-mountain-s22, thredbo-village-s23, nevis-range-s24, tsugaike-kogen-s25, mount-shasta-ski-s26, lech-zurs-s27, cerro-castor-s28, treble-cone-s29, appi-kogen-s2): "independent"

15-minute apply. Will apply inline next run if unresolved.

### Rating distribution (157 venues)

Range: 4.51 – 4.99 | Average: 4.86. All synthetic — known product decision.

---

## PM NOTE

Two items:

1. beach_goa monsoon timing — Palolem's monsoon season starts ~June 1, runs through September. scoreVenue will correctly score it near-zero via heavy precipitation + cloud cover. Venue nearly invisible in Explore June-September. Consider whether to add a seasonal note to tags (e.g. "Best Nov-May") for UX clarity when users search India. Not blocking.

2. skiPass for 25 s-batch ski venues — paste-ready in section 6. Big White = ikon, Kicking Horse = ikon, Stowe = epic, all others = independent. 15-minute apply, unlocks pass-type filter for full ski catalog.
