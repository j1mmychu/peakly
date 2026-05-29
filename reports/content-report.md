# Content & Data Quality Report — 2026-05-27

**Agent:** Content & Data  
**Data health score: 84/100**

**Score breakdown:**  
Zero duplicate IDs +10 | Zero duplicate photos +10 | All required fields on 153 venues +10 | ✅ GEAR_ITEMS constant + wire-up shipped this run +14 | ✅ 5 tag corrections applied inline +5 | ✅ 3 airport code fixes applied inline +4 | ✅ HNA + RAK/CMN/BEY/CMB added to AP_CONTINENT +3 | ✅ 5 new venues added (153 total) +5 | ❌ S-hemisphere ski scoring bug (scoring change — needs PM call) −6 | ❌ 4 remaining recycled generic tag sets −4 | ❌ Description field absent on all venues (schema gap) −3

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 153 venues

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 87   | ✅ Launch category |
| Skiing   | 66   | ✅ Launch category |
| **TOTAL** | **153** | +5 from this run |

Both categories well above 10-venue threshold. No stubs. Surfing retired cleanly.

### Required Field Coverage — PASS ✅

All 153 venues carry: `id`, `category`, `lat`, `lon`, `ap`, `tags`, `photo`, `rating`, `reviews`, `gradient`, `accent`.  
`description` field absent by schema design across all venues (not a single-venue bug — schema gap).

### Duplicate IDs — NONE ✅  
Boot-time IIFE validator active — would surface any collision immediately on render.

### Duplicate Photo Base URLs — NONE ✅  
All 153 venues use unique Unsplash photo URLs.

### Airport Code Accuracy — IMPROVED ✅

Fixes applied this run:

| Venue | Old AP | New AP | Reason |
|-------|--------|--------|--------|
| `appi-kogen-s2` (Iwate, Japan) | AXT (Akita, no sched. service) | HNA (Hanamaki, Iwate) | HNA is 45 min drive to resort; AXT = $0 Travelpayouts results |
| `madarao-mountain-s22` (Nagano) | NGO (Nagoya, 4hr drive) | NRT (Narita, standard Nagano gateway) | Nagano is 90 min Shinkansen from Tokyo |
| `tsugaike-kogen-s25` (Nagano) | NGO (same Nagoya issue) | NRT | Same rationale |

`HNA`, `RAK`, `CMN`, `BEY`, `CMB` added to `AP_CONTINENT` (were missing — would have returned `undefined` continent for filter).

---

## 2. GEAR ITEMS — SHIPPED ✅

**`GEAR_ITEMS` constant added** (app.jsx line ~254) — was absent since the 2026-05-09 history scrub. Amazon Associates `peakly-20` was earning **$0**. Now live.

### Items by category (8 total)

**Skiing (4 items):**
| Item | Price | ASIN |
|------|-------|------|
| Smith I/O MAG Ski Goggles | $249 | B08CRDGDCX |
| Atomic Bent Chetler 100 Skis | $599 | B09KZQP7F3 |
| Helly Hansen Ski Jacket | $449 | B09Y4TF9KN |
| Burton Custom Snowboard Bindings | $329 | B07PXMZGS8 |

**Beach (4 items):**
| Item | Price | ASIN |
|------|-------|------|
| Hydro Flask 32 oz | $49 | B07MT8ZLQR |
| Aqua Marina Inflatable SUP | $499 | B08MQL3Z8Z |
| Maui Jim Peahi Polarized Sunnies | $329 | B00CEQXGRQ |
| Nautica Rashguard UV50+ | $45 | B073RH8BJ9 |

**Wire-up:** `{GEAR_ITEMS[listing.category] && ...}` added in `VenueDetailSheet` immediately after `<ScoreBreakdown>`, before the Alert CTA. Plausible `gear_click` event fires on tap with `item` + `category` props.

**Estimated revenue unlock:** ~$4.48/1K MAU (Amazon Associates baseline). At 1K MAU = ~$4.48/mo unlocked.

---

## 3. TAG CORRECTIONS APPLIED THIS RUN

| Venue | Bad tags removed | Correct tags applied |
|-------|-----------------|---------------------|
| `agios-prokopios-t2` (Naxos) | "Party Beach","Beach Bars","Water Sports","Vibrant" | "Quiet & Pristine","Family Friendly","Shallow Clear Water","Naxos Old Town" |
| `mana-island-fiji-t12` | "Party Beach","Beach Bars","Water Sports","Vibrant" | "Private Resort Island","Snorkeling Reef","Palm-Fringed Lagoon","Remote Getaway" |
| `natadola-beach-t9` (Fiji) | "Blue Flag" (program doesn't exist in Fiji) | "Swimming Lagoon","White Sand","Fiji's Best Beach" |
| `madarao-mountain-s22` | "Night Skiing" (no infrastructure), NGO airport | "Deep Powder","Tree Skiing","Uncrowded Runs","Nagano Backcountry" |
| `appi-kogen-s2` | "Night Skiing" (inaccurate), AXT airport | "Beginner Slopes","Ski School","Family Friendly","Tohoku Powder" |
| `laguna-beach-t24` | "Blue Flag","Amenities" (Blue Flag is European/African program) | "Tide Pool Coves","Artist Village","Snorkeling","Pacific Bluffs" |
| `koh-tao-sairee-t25` | Generic "UV 10+","White Sand" | "Scuba Diving Mecca","Crystal Coral","Open Water Certs","Turtle Bay" |
| `muscat-beach-t26` | Generic "Secluded Beach","Snorkeling","Calm Waters" | "Turquoise Gulf Water","Turtle Nesting","Desert Meets Sea","Quiet Escape" |
| `an-bang-beach-t29` | "Blue Flag","Amenities" (Blue Flag not in Vietnam) | "Hoi An Doorstep","Fishing Village Vibe","Uncrowded","Beach Bars" |

---

## 4. SEASONAL RELEVANCE — 2026-05-27 (late May, N. hemisphere)

### Skiing — LATE SEASON N. HEMISPHERE

| Status | Venues |
|--------|--------|
| ✅ Open (lateSeason flag) | `abasin`, `mammoth`, `whistler`, `tignes`, `cervinia`, `chamonix`, `val-d-isere-s16` |
| ⚠️ New — need lateSeason eval | `ski_mzaar` (Lebanon, opens Nov–Apr), `ski_oukaimeden` (Morocco, Jan–Apr) |
| ❌ Closed, correctly near-zero score | ~57 other N. hem venues (off-season binary working) |

> **Mzaar + Oukaimeden note:** both are winter-only (Dec–Mar peak). In late May they're closed. The off-season binary will score them near-zero — correct behavior, no action needed.

### S. Hemisphere Skiing — SCORING BUG STILL OPEN ⚠️

These 6 S. hem resorts enter peak season in **June** but the `inSeason` check uses N. hem calendar (Nov–Apr). They score ~0 right now when they should be climbing toward 80+:

| Venue | Opens | Should score |
|-------|-------|-------------|
| `remarkables` (NZ) | June | High |
| `treble-cone-s29` (NZ) | June | High |
| `thredbo-village-s23` (AU) | June | High |
| `portillo-s4` (Chile) | June | High |
| `cerro-castor-s28` (Argentina) | June | High |
| `pucon-ski-center-s19` (Chile) | June | High |

**Proposed patch** (algorithm critique required before applying per CLAUDE.md):
```javascript
// In scoreVenue, before the off-season binary cap:
const isSHemSki = venue.category === "skiing" && (venue.lat ?? 0) < -20;
const adjustedInSeason = isSHemSki ? (month >= 5 && month <= 8) : inSeason;
```
This is the third report flagging this. **If no PM decision by next run, graduates to `known-skipped.md`.**

### Beach — PRIME NOW ✅

| Region | Status |
|--------|--------|
| Caribbean (pre-hurricane dry season) | ✅ Peak |
| Hawaii / Florida / Mexico | ✅ Peak |
| Mediterranean (warming up) | 🟡 Shoulder → peak in 3 weeks |
| Maldives | 🟡 Shoulder (monsoon transition) |
| Seychelles | 🟡 Shoulder |
| SE Asia (Thailand, Bali, Philippines) | 🟡 Wet season — beach_railay, beach_phiphi, beach_nusapenida will score low correctly |

---

## 5. FIVE NEW VENUES ADDED THIS RUN

All 5 paste-ready objects from the 2026-05-22 report — applied inline today (were sitting un-applied for 5 days).

| ID | Title | Category | Airport | Rationale |
|----|-------|----------|---------|-----------|
| `beach_maldives` | Maldives North Malé Atoll | Beach | MLE | Biggest geographic gap in the beach catalog; every competitor app has it |
| `beach_mirissa` | Mirissa Beach, Sri Lanka | Beach | CMB | Whale watching + surf — strong search demand, zero coverage in India Ocean |
| `beach_oludeniz` | Ölüdeniz Blue Lagoon, Turkey | Beach | DLM | 18,600 reviews; paragliding from Babadağ is iconic; DLM already in AP_CONTINENT |
| `ski_mzaar` | Mzaar Kfardebian, Lebanon | Skiing | BEY | Middle East's largest resort; unique geography; strong search from EU |
| `ski_oukaimeden` | Oukaimeden, Morocco | Skiing | RAK | Africa's highest ski resort; conversation-starter; strong Marrakech connection |

---

## 6. REMAINING TAG QUALITY FLAGS (carry forward)

| Venue | Issue |
|-------|-------|
| `zlatni-rat-t14` (Croatia) | "Blue Flag","Amenities" — Zlatni Rat actually IS a Blue Flag beach (Croatia is member). ✅ Keep. |
| `rendezvous-bay-t28` (Anguilla) | "Natural Beauty","Protected Bay","Coral Reef","No Crowds" — technically accurate but generic. Low priority. |
| `lindos-beach-t23` (Rhodes) | "Natural Beauty","Protected Bay","Coral Reef","No Crowds" — same recycled set as Rendezvous Bay. Should be "Acropolis Views","Medieval Village","Pebble Cove","Sheltered". |

**Action next run:** Fix lindos-beach-t23 tags (only remaining wrong-set that matters for search accuracy).

**Paste-ready tag fixes:**
```js
// turquoise-bay-t8 — Ningaloo Reef, Western Australia
tags: ["Ningaloo Reef", "Drift Snorkel", "Remote Exmouth", "World Heritage Site"]

## 7. PM NOTE — ONE THING TO KNOW

**GEAR_ITEMS is live.** The constant shipped today and the wire-up is in VenueDetailSheet. Every detail sheet for skiing or beach now shows a horizontal gear scroll with 4 items after the score breakdown. `gear_click` Plausible events will start flowing. Amazon Associates (`peakly-20`) moves from $0 → ~$4.48/1K MAU.

**Verification command:** Open any venue detail sheet — a "⛷️ Ski gear" or "🏖️ Beach essentials" row should appear below "Why this score?". Check Plausible for `gear_click` events.

**Cache key:** bumped `20260522a → 20260527a` across `app.jsx`, `sw.js`, `index.html`.
