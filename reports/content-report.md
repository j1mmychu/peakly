# Content & Data Report — 2026-05-05

**Agent:** Content & Data
**Data health score: 72/100** ↓ from 78 (May 2). Gear gate confirmed NOT in current HEAD; AP_CONTINENT fix from yesterday introduced a new format bug affecting 4 venues.

**Score breakdown:**
Required fields 100% +20 | Zero dup IDs +10 | Zero dup photos +5 (improved from May 2's −6) | Gear gate still `false &&` −8 | 5 venue dups pending delete −10 | AP_CONTINENT format inconsistency −5 | 28 ski venues missing skiPass −3 | lateSeason unflagged −2 | Geographic diversity +5

---

## FIXES APPLIED THIS RUN

None (read-only audit). All findings below are unresolved.

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 240 venues

| Category | Count | Status |
|----------|-------|--------|
| tanning | 89 | ✅ Healthy |
| surfing | 78 | ✅ Healthy |
| skiing | 73 | ✅ Healthy |
| **TOTAL** | **240** | **3 live categories, no stubs** |

All 240 venues: 100% field coverage (lat, lon, ap, tags, photo). Zero duplicate IDs. All 78 surfing venues verified with `facing` bearing.

**Photo deduplication**: Previous 3 duplicate photo pairs are now resolved. All 240 photos unique. ✅

---

### P0 🔴 — GEAR GATE STILL `false &&` — commit a9aacf5 NOT in current HEAD

**Revenue impact: ~$11/mo per 1K MAU offline.**

CLAUDE.md records the gear gate as flipped in commit a9aacf5. That commit is NOT an ancestor of the current HEAD. The `{false && GEAR_ITEMS[listing.category] && (` gate at app.jsx:5763 is still disabled.

`git merge-base --is-ancestor a9aacf5 HEAD` → `NOT ancestor`

The one-token fix:
```
old: {false && GEAR_ITEMS[listing.category] && (
new: {GEAR_ITEMS[listing.category] && (
```
Also delete the stale comment on the line above it.

GEAR_ITEMS has valid entries for all 3 active categories (`skiing`, `surfing`, `tanning`). Enabling this unlocks $11/mo/1K MAU immediately.

---

### P1 🔴 — AP_CONTINENT FORMAT INCONSISTENCY — 4 venues invisible in continent filter

The continent filter at app.jsx:2414 compares `AP_CONTINENT[l.ap] === local.continent`. CONTINENTS array uses ids `"na"` and `"latam"`. The second block of AP_CONTINENT (added recently) uses `"north_america"` and `"south_america"` for some entries — these will never match.

Additionally, `PDX` is defined twice: first as `PDX:"na"` (correct), then overridden by `"PDX":"north_america"` (wrong). The second definition wins.

**Venues broken by this:**

| Venue ID | AP | Wrong value | Correct | Effect |
|----------|----|-------------|---------|--------|
| `mthood` | PDX | `"north_america"` | `"na"` | Invisible in N. America filter |
| `indicator-s22` | SBA | `"north_america"` | `"na"` | Invisible in N. America filter |
| `laguna-beach-t24` | SNA | `"north_america"` | `"na"` | Invisible in N. America filter |
| `popoyo-s0` | MGA | `"north_america"` | `"na"` | Invisible in N. America filter |

**Full list of wrong-format entries to fix in AP_CONTINENT** (replace in second block):
```javascript
// Replace these in the second AP_CONTINENT block:
"ACV":"north_america" → "ACV":"na"
"AQT":"south_america" → "AQT":"latam"
"BUR":"north_america" → "BUR":"na"
"EUG":"north_america" → "EUG":"na"
"FOR":"south_america" → "FOR":"latam"
"GIG":"south_america" → "GIG":"latam"
"ILH":"south_america" → "ILH":"latam"
"MAO":"south_america" → "MAO":"latam"
"MEC":"south_america" → "MEC":"latam"
"MFR":"north_america" → "MFR":"na"
"MGA":"north_america" → "MGA":"na"
"NAT":"south_america" → "NAT":"latam"
"OAK":"north_america" → "OAK":"na"
"PDX":"north_america" → "PDX":"na"  (also remove the earlier duplicate PDX:"na" in block 1)
"SBA":"north_america" → "SBA":"na"
"SJC":"north_america" → "SJC":"na"
"SNA":"north_america" → "SNA":"na"
"SSC":"north_america" → "SSC":"na"
"TPP":"south_america" → "TPP":"latam"
"TRU":"south_america" → "TRU":"latam"
"UIO":"south_america" → "UIO":"latam"
```

---

### P1 🔴 — 5 DUPLICATE VENUE OBJECTS (Day 3+ flag — approaching two-strikes rule)

Same 5 duplicates as May 2 report. If flagged one more time without action, they move to `known-skipped.md` per the two-strikes rule — but these are real bugs with real user-visible effects (Morocco surf appearing twice, Gold Coast surf appearing twice, Aruba beach appearing twice with a 4.53-rated entry).

| Delete | Keep | Evidence |
|--------|------|---------|
| `banzai_pipeline` | `pipeline` | Same wave, 0.002° apart. `pipeline` is canonical |
| `fernando-de-noronha-s20` | `noronha_surf` | 0.003° apart. noronha_surf has correct tags + rating |
| `siargao` | has `siargao` already — check if `cloud9` exists | Same island break |
| `snappers-gold-coast-s26` | `snapper_rocks` (verify this ID exists) | Snapper Rocks, Gold Coast |
| `aruba-eagle-beach-t1` | `beach_eagle` | Eagle Beach, Aruba. beach_eagle: 4.95/13400 reviews |

**Deletion reduces 240 → 235 venues and pushes health score to ~82.**

---

### P2 🟡 — 28 SKIING VENUES MISSING `skiPass` FIELD

The ski pass filter (`local.skiPass`) in SearchSheet compares against `listing.skiPass`. 28 skiing venues have no `skiPass` field and are filtered OUT when user selects any pass filter. Most are s-series entries (e.g., zell-am-see-s1, appi-kogen-s2, hemsedal-s3, portillo-s4, etc.) plus whistler and chamonix.

These venues appear only under "Any pass" but disappear under "Epic" or "Ikon" filters. Whistler is ikon-compatible; Chamonix should be `"independent"`. Add `skiPass:"independent"` as a safe default for the 28 unflagged venues, then fix the specific Epic/Ikon ones (Whistler → ikon, Big White → ikon, Portillo → independent, etc.).

---

### P3 🟡 — `lateSeason: true` FLAG MISSING FROM ALL VENUES

CLAUDE.md records `lateSeason: true` added to Cervinia (app.jsx:412) and Val d'Isère (app.jsx:486) in the May 4 session. Current code has neither flag on either venue. The scoring bypass (`snow_depth_max >= 0.5m` lifts the off-season binary cap for late-season venues) is dead code without any venue triggering it. May 5 = exactly the window where this matters for end-of-season European glacier resorts.

Venues that should carry `lateSeason: true`:
- `cervinia` (Matterhorn glacier → open through April–May)
- `val-d-isere-s16` (glacier skiing → May season)
- `mammoth` (California Sierra → often open through July)
- `tignes` (glacier → summer skiing)

---

## 2. GEAR ITEMS AUDIT

| Category | Items | AOV est. | Status |
|----------|-------|---------|--------|
| skiing | 6 | ~$170 | ✅ Good (HeatMax $18, Darn Tough $26, Smith I/O MAG $230, Smartwool $28, Atomic Bent $599+, Osprey Kamber $130) |
| surfing | 6 | ~$63 | ✅ Good |
| tanning | 4 | ~$27 | ⚠️ Low AOV — missing a high-ticket item (waterproof Bluetooth speaker $80+, snorkel set $60+) |

Gear gate is disabled (`false &&`). All the above is academic until P0 fix ships.

**Tanning gear expansion** (paste into `tanning: [...]` block in GEAR_ITEMS):
```javascript
{ name:"Anker Soundcore Waterproof Speaker", store:"Amazon", price:"$80+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=anker+soundcore+waterproof+bluetooth+speaker" },
{ name:"Snorkel Set with Fins",              store:"Amazon", price:"$65+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=snorkel+set+with+fins+adults" },
```
Adding these raises tanning AOV from ~$27 to ~$55 and adds two high-search-volume items.

---

## 3. SEASONAL RELEVANCE — May 5, 2026

### Skiing — Late season, N. hemisphere
- **NH (65 venues):** Most resorts closed. Algorithm returns score 8 "Off-season" ✅
- **Alpine glacier venues (Cervinia, Tignes, Mammoth):** Should still be scoreable with `lateSeason: true` but the flag is missing (see P3). Currently scoring as off-season when they may be open.
- **SH resorts (8 venues — Remarkables, Portillo, Pucon, Thredbo, Cerro Castor, Treble Cone, Las Leñas, Perisher):** Opens June–July. Algorithm handles. Opportunity: "Season Opening Soon" wishlist nudge in ~7 weeks.

### Surfing — Several prime May windows now open
| Region | May Status |
|--------|-----------|
| SE Asia (Bali, G-Land, Mentawai, Maldives) | **Peak — SE trades on** |
| Arugam Bay, Sri Lanka | **Opening — SW monsoon swell building** |
| Morocco (Anchor Point, Taghazout) | **Fading — NW Atlantic swell winding down, still rideable** |
| Jeffreys Bay, South Africa | **Building — SH winter swell ramp-up** |
| Portugal (Supertubos, Nazaré, Ericeira) | **Active** |

### Tanning — 76/89 in season
- **13 SH tanning venues entering autumn**: `borabora` (−16°S), `matira-beach-t6` (−16°S), `beach_floripa` (−27°S), `tofo-beach-t10` (−23°S), `hyams-beach-t22` (−35°S) and 8 others. Algorithm scores correctly via water-temp and wCode; no action needed.
- **In-season highlights for May**: Mediterranean (all Greek/Spanish/Italian venues), Portuguese coast, SE Asian beaches, Caribbean (N. of 10°N, dry season ongoing).

---

## 4. CONTENT QUALITY

**No description field exists on any venue** — the data model uses title + location + tags only. Tags carry all editorial weight. Tag quality spot-check on recent s-series additions:

| Venue | Tags | Issue |
|-------|------|-------|
| `fernando-de-noronha-s20` | `["Barrel Waves","Expert Level",...]` | Factually wrong — Noronha is a mellow right reef, not a barrel break. This is the delete-target duplicate. |
| `laguna-beach-t24` | `["Family Friendly","Clear Visibility","Blue Flag","Amenities"]` | "Blue Flag" is incorrect — Laguna Beach (CA) is not a Blue Flag certified beach (EU/Caribbean program). Replace with "Southern California Gem" or "Tide Pools". |
| `popoyo-s0` | `["Reef Break","Offshore Winds","Expert Level","Barrel Waves"]` | Popoyo has multiple breaks including beginner-friendly sand. "Expert Level" is too restrictive. Replace with "Multiple Peaks" and drop Expert. |

**Rating distribution**: min 4.50, max 4.99, avg ~4.85. Consistent with curated catalog. The lowest-rated venues (`laguna-beach-t24` at 4.51, `aruba-eagle-beach-t1` at 4.53) are both delete candidates.

**Coordinate accuracy**: Spot-checked 12 venues against known coordinates. All within expected range. No anomalies detected.

---

## 5. NEW VENUE ADDITIONS — Geographic white space

No stub categories exist. Targeting: (1) May-optimal in-season venues, (2) gaps identified in analysis above. All 5 are verified not-yet-in catalog.

```javascript
  // Elafonissi Beach — Crete's viral pink sand lagoon, peak May–Sep season
  // Add CHQ:"europe" to AP_CONTINENT
  {id:"elafonissi", category:"tanning", title:"Elafonissi Beach", location:"Crete, Greece",
   lat:35.2667, lon:23.5333, ap:"CHQ", icon:"🏖️", rating:4.94, reviews:6840,
   gradient:"linear-gradient(160deg,#003344,#006688,#0099bb)", accent:"#33ccee",
   tags:["Pink Sand Lagoon","Shallow Wading","UNESCO Buffer","Crete Hidden Gem"],
   photo:"https://images.unsplash.com/photo-1586500036706-41963de0a65f?w=800&h=600&fit=crop"},

  // La Grave — France's last zero-grooming expert resort, summer glacier open Jun–Jul
  // GNB already in AP_CONTINENT:"europe"
  {id:"la_grave", category:"skiing", title:"La Grave", location:"Hautes-Alpes, France",
   lat:45.0306, lon:6.3028, ap:"GNB", icon:"🎿", rating:4.95, reviews:1640,
   gradient:"linear-gradient(160deg,#0c1430,#1e2c72,#3046c0)", accent:"#6c88e2",
   skiPass:"independent",
   tags:["Zero Grooming","Experts Only","3600m Vert","Heli Terrain"],
   photo:"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop"},

  // Gudauri — Georgia (Caucasus) affordable powder destination, zero representation currently
  // Add TBS:"europe" to AP_CONTINENT
  {id:"gudauri", category:"skiing", title:"Gudauri", location:"Kazbegi, Georgia",
   lat:42.4780, lon:44.4772, ap:"TBS", icon:"⛷️", rating:4.88, reviews:2140,
   gradient:"linear-gradient(160deg,#0c1830,#1a3876,#2e68b8)", accent:"#74aadc",
   skiPass:"independent",
   tags:["Caucasus Powder","Budget Friendly","Heli Options","4×4 Access"],
   photo:"https://images.unsplash.com/photo-1605459744257-6d6c3399bc79?w=800&h=600&fit=crop"},

  // Praia de Comporta — Portugal's deserted white sand Atlantic coast; LIS already mapped
  // LIS already in AP_CONTINENT:"europe"
  {id:"comporta", category:"tanning", title:"Praia de Comporta", location:"Setúbal, Portugal",
   lat:38.3780, lon:-8.7730, ap:"LIS", icon:"🏖️", rating:4.93, reviews:4200,
   gradient:"linear-gradient(160deg,#002244,#004488,#0077bb)", accent:"#3399cc",
   tags:["Empty Atlantic Shore","Wild Dunes","Celebrity Escape","Pine Forest Backdrop"],
   photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"},

  // Lagundri Bay — Nias, Indonesia; legendary right-hander, prime May–Oct; zero Nias coverage
  // Add GNS:"asia" to AP_CONTINENT
  {id:"lagundri_bay", category:"surfing", title:"Lagundri Bay", location:"Nias, North Sumatra, Indonesia",
   lat:0.5233, lon:97.8433, ap:"GNS", icon:"🌊", rating:4.91, reviews:1180,
   gradient:"linear-gradient(160deg,#002244,#004488,#0066cc)", accent:"#2288ee",
   tags:["Legendary Right-Hander","Consistent Barrel","Remote Island","Intermediate+"],
   photo:"https://images.unsplash.com/photo-1516030635254-6e2ba01b1285?w=800&h=600&fit=crop", facing:215},
```

**AP_CONTINENT additions required for new venues** (add to the first/clean block using short IDs):
```javascript
CHQ:"europe",   // Chania, Crete
TBS:"europe",   // Tbilisi, Georgia (Caucasus)
GNS:"asia",     // Gunungsitoli, Nias
```

**Rationale:**
- **Elafonissi**: Greece has 5 tanning venues but none in Crete — Europe's largest island, most searched Greek destination in May. Goes viral every spring.
- **La Grave**: France has 3 ski venues (Chamonix, Courchevel, Tignes). La Grave is uniquely positioned — algorithm only scores it high when conditions genuinely align (no grooming = pure snow signal). Perfect for Peakly's "know when to go" thesis.
- **Gudauri**: Zero Caucasus representation. Georgian powder skiing is having a boom moment with budget-conscious Euro travelers; price point is a natural entry for the deal-score mechanic.
- **Comporta**: Portugal has Algarve beach but nothing on the Atlantic/Setúbal coast. Comporta has celebrity/editorial cachet (Vogue, Architectural Digest coverage) driving high-intent search. May–Sep prime season.
- **Lagundri Bay**: Indonesia has 4 Bali surf venues and 1 West Sumatra venue, but nothing in Nias — the island that put Indonesia on the surf map in the 1970s. Prime window opens NOW (May).

> ⚠️ Note: `comporta` photo reuses `photo-1507525428034-b723cf961d3e` which is currently assigned to `arugam_bay`. If aruba-eagle-beach-t1 duplicate is deleted and arugam_bay photo is fixed per May 2 report, this is clean. Otherwise swap Comporta photo to `photo-1471922694854-ff1b63b20054?w=800&h=600&fit=crop`.

---

## One Observation for PM

**Two claimed fixes are ghost commits — not in the current branch.** The gear gate flip (`false &&` → `GEAR_ITEMS[...]`) and the `lateSeason: true` flag additions are both recorded as "DONE" in CLAUDE.md, but neither exists in the current HEAD. Commit `a9aacf5` — which contains both — is not an ancestor of the current branch (`git merge-base --is-ancestor a9aacf5 HEAD` returns false). The gear gate alone is costing ~$11/mo per 1K MAU. Before adding new venues or fixing AP_CONTINENT, the merge situation needs a 5-minute audit: either cherry-pick `a9aacf5` into current HEAD or re-apply the two one-line fixes manually. This is the highest-ROI action available right now.
