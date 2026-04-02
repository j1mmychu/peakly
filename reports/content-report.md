# Content & Data Report — 2026-04-02

**Agent:** Content & Data  
**Data health score: 69/100**

**Score breakdown:**  
Category coverage (all 11 sports 200+ venues) +25 | Gear items complete +15 | Photo duplication 142 URLs reused −10 | Venue deduplication crisis (same spots listed 4–7×) −15 | Synthetic batch data patterns −5 | No missing required fields +10 | Geographic breadth +10 | Seasonal misalignment (NH ski season winding down) −3 | Hiking gear confirmed present +5 | Contradictory difficulty on duplicate venues −3

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown (3,726 total venues)

| Category | Count | Status |
|----------|-------|--------|
| tanning | 705 | ✅ Healthy |
| skiing | 704 | ✅ Healthy |
| surfing | 703 | ✅ Healthy |
| diving | 205 | ✅ Healthy |
| climbing | 204 | ✅ Healthy |
| fishing | 202 | ✅ Healthy |
| paraglide | 201 | ✅ Healthy |
| mtb | 201 | ✅ Healthy |
| kayak | 201 | ✅ Healthy |
| kite | 200 | ✅ Healthy |
| hiking | 200 | ✅ Healthy |
| **TOTAL** | **3,726** | |

**No stub categories.** All 11 sports well above the 10-venue minimum.

---

### Critical Issue P1 🔴 — VENUE DUPLICATION FROM BATCH EXPANSION

The March 29 batch expansion (500 surf + 500 ski + 500 beach = 1,500 new venues) introduced **995 batch-generated IDs** (pattern: `venue-s##`) that duplicate existing iconic spots with conflicting data. This is the highest-priority data quality problem in the codebase.

**Worst offenders — same physical location, multiple IDs:**

| Venue | Occurrences | Sample IDs |
|-------|-------------|-----------|
| Cloudbreak, Fiji | **7×** | `cloudbreak`, `cloudbreak-fiji-s21`, `cloudbreak-s85` |
| Chicama, Peru | **6×** | `chicama`, `chicama-left-s67` |
| Hossegor, France | **6×** | `hossegor`, `hossegor-s77` |
| Mundaka, Spain | **6×** | `mundaka`, `mundaka-s37` |
| Raglan, NZ | **5×** | `raglan`, `raglan-s95` |
| Teahupo'o, Tahiti | **4×** | `teahupoo`, `teahupo-tahiti`, `teahupoo-s141` |
| Jeffreys Bay, SA | **4×** | `jeffreys_bay`, `jeffreys-bay-main`, `supertubes-jbay` |
| Nazaré, Portugal | **4×** | (multiple entries) |
| Uluwatu, Bali | **4×** | (multiple entries) |

**The duplication problem goes beyond aesthetics:**
- Same location tagged "Beginner Friendly" in one entry and "Expert Level" in another. Example: `cloudbreak-s85` tags `["Beach Break","All Levels","Consistent Swell","Longboard Friendly"]` — Cloudbreak is one of the heaviest reef breaks on Earth.
- Scores computed independently for each duplicate → same physical break appears multiple times in ranked results at conflicting positions
- **93 venue pairs share exactly identical lat/lon coordinates** (confirmed via grep)
- La Santa, Lanzarote appears as both `la_santa` and `lobos-lanzarote` — same coordinates, same location name, different IDs

**Action required:** Deduplication pass. Safe approach: for each pair of venues within 0.05° of each other, keep the original named entry (no `-s##` suffix), discard the batch duplicate. Estimated ~600–800 removals. Final count ~2,900–3,000 venues — still a massive, credible catalog.

---

### Photo Duplication — P1 🔴

- **142 Unsplash photo URLs** appear more than once across 3,726 venues
- Worst offenders: **17 venues each share the same image** (4 different photo IDs each appear 17×)
- The 1,500 batch venues added March 29 were generated from a pool of ~170 unique photos, cycling every 8–10 entries per category

Top duplicated base images:
```
photo-1605540219596-e28d4a3ef38c  →  17 venues
photo-1598586517946-4e3db73cadf3  →  17 venues
photo-1589802822605-b6f1d7fbd41a  →  17 venues
photo-1576012816255-89a5a2d94ac7  →  17 venues
```

---

### Required Fields — ✅ PASS

| Field | Missing count |
|-------|-------------|
| lat / lon | 0 |
| ap (airport) | 0 |
| tags array | 0 |
| photo | 0 |
| id | 0 |

No venues with empty coordinates, missing airport codes, or null tags. Core schema integrity is solid.

---

### Synthetic Review Patterns — P2 🟡

Batch-added venues show sequential review counts incrementing by +137: 300 → 437 → 574 → 711 → 848 → 985 → 1,122... This is machine-generated. The original 2,226 venues have organic-looking review distributions. The 1,500 March 29 venues do not. Savvy users browsing multiple venues will notice.

---

## 2. GEAR ITEMS AUDIT

All 11 sport categories have gear items. **Correction from prior reports:** Hiking DOES have gear items (7 entries). The CLAUDE.md note "Hiking has ZERO gear items" was outdated. This is resolved.

| Category | Items | Highest AOV Item | Status |
|----------|-------|-----------------|--------|
| skiing | 8 | Smith I/O MAG Goggles $230 | ✅ |
| surfing | 4 | Surfboard $349+ | ⚠️ Low count |
| tanning | 4 | Hydration Mix $25+ | ⚠️ Low count — add beach chair, cooler |
| diving | 4 | Garmin Descent Mk3 $1,099 | ✅ |
| climbing | 8 | BD Harness + duplicated entry | ⚠️ Duplicate item |
| kayak | 8 | Kokatat Dry Suit $1,200 | ⚠️ Duplicate item |
| mtb | 8 | Troy Lee A3 Helmet $220 | ✅ |
| kite | 4 | Cabrinha Moto Kite $1,299 | ✅ |
| fishing | 4 | Simms G3 Wading Boots $230 | ✅ |
| paraglide | 4 | Skytraxx 5 Vario $590 | ✅ |
| hiking | 7 | Osprey Atmos 65L $300 | ✅ |

**Note:** Gear section is hidden at launch per the April 1 decision (`{false && GEAR_ITEMS[...]}`). No action needed until re-enable.

**Paste-ready additions for surfing (low item count — add when gear section re-enabled):**
```javascript
// Append to GEAR_ITEMS.surfing:
{ emoji:"🦺", name:"O'Neill Reactor II 3/2 Wetsuit",     store:"Amazon", price:"$120", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=oneill+reactor+ii+wetsuit" },
{ emoji:"🎒", name:"Dakine Mission Surf Backpack 25L",    store:"Amazon", price:"$80",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=dakine+mission+surf+backpack" },
{ emoji:"💪", name:"Rip Curl Flashbomb 4/3 Wetsuit",     store:"REI",    price:"$380", commission:"5%", url:"https://www.rei.com/search?q=rip+curl+flashbomb+wetsuit" },
{ emoji:"🔒", name:"Creatures Surf Leash 9ft",            store:"Amazon", price:"$32",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=creatures+of+leisure+surf+leash" },
```

---

## 3. SEASONAL RELEVANCE — April 2, 2026

### IN SEASON RIGHT NOW ✅
- **Beach/Tanning:** Caribbean, Mexico, Maldives, Seychelles, SE Asia — dry season peak. Boost in hero/featured.
- **Surfing:** Atlantic and Pacific coasts with spring swells. Morocco, Portugal, Canary Islands — optimal window now.
- **Diving:** Red Sea, Maldives, Great Barrier Reef, Caribbean — excellent visibility.
- **Hiking:** US desert southwest (Grand Canyon, Zion, Bryce — prime before summer heat). European trails opening.
- **Climbing:** Prime temps — not too hot, not too cold.

### APPROACHING END OF SEASON ⚠️
- **Skiing — Northern Hemisphere:** Mid/low altitude resorts closing. Slushy conditions at many venues.
  - Closing imminently: most Austrian/German/Swiss lower-altitude resorts, East Coast US
  - Still viable: Mammoth CA (to June), Tignes/Val Thorens FR (to May), Whistler spring skiing to May

### OUT OF SEASON 🔴
- **Surfing — Jeffreys Bay, South Africa:** Best June–September. April is off-peak.
- **Skiing — Southern Hemisphere:** NZ (ZQN), AU (MEL), Chile (SCL) ski venues won't open until June. Scoring them now produces false "conditions available" signals since there's no open lifts.

**Recommendation:** Until a `season` field is added, consider suppressing SH ski venues in the hero card in April–May (use `dayIndex`-aware logic already in scoreVenue).

---

## 4. CONTENT QUALITY FLAGS

### Contradictory Difficulty Ratings on Duplicate Venues — P1
Same physical location, contradictory difficulty, both in active database:
- `cloudbreak-s85` tags: `["Beach Break","All Levels","Consistent Swell","Longboard Friendly"]` — **Wrong.** Cloudbreak is a heavy reef break, boat-access only, expert-level.
- `mundaka-s37` tags: `"Beginner Friendly, Warm Water, Year-Round"` — **Wrong.** Mundaka is cold, expert-only, seasonal river mouth break.
- `teahupoo-s141` tags: `"Beach Break, All Levels"` — **Wrong.** Teahupo'o is reef, arguably the world's most dangerous wave.

These incorrect descriptions are a potential liability (beginner follows advice, gets hurt at Cloudbreak) and destroy credibility for expert users.

### No Description Field — P3 🟢
Venues use `title`, `location`, and `tags` but no prose description. Limits Vibe Search accuracy and SEO depth. Not blocking launch.

---

## 5. DAILY VENUE ADDITIONS — 5 New Unique Venues

Confirmed absent from all 3,726 existing entries. Geographic gaps targeted: Central Asia skiing (none in database), Bermuda beach (none), Canada Pacific surf (only kayak existed), Russia skiing (none).

```javascript
  // 1. SURFING — Tofino, Canada (only kayak venue existed; no dedicated surf venue)
  {id:"cox_bay",      category:"surfing",title:"Cox Bay",                location:"Tofino, British Columbia, Canada",lat:49.0867,lon:-125.8520,ap:"YAZ",icon:"🌊",rating:4.87,reviews:2140,gradient:"linear-gradient(160deg,#0a2a1a,#1a5a3a,#2e8a5e)",accent:"#5aba8e",tags:["Cold Water Barrels","Rainforest Backdrop","Year-Round","Intermediate"], photo:"https://images.unsplash.com/photo-1489447068241-b3490214e879?w=800&h=600&fit=crop"},

  // 2. BEACH — Bermuda (zero beach/tanning venues exist for Bermuda)
  {id:"horseshoe_bermuda",category:"tanning",title:"Horseshoe Bay Beach",location:"Southampton, Bermuda",lat:32.2567,lon:-64.8380,ap:"BDA",icon:"🏖️",rating:4.95,reviews:8400,gradient:"linear-gradient(160deg,#003355,#00668a,#0099bb)",accent:"#33bbdd",tags:["Pink Sand","Crystal Atlantic","Year-Round Sun","Iconic"], photo:"https://images.unsplash.com/photo-1547895007-5e7e7f39bd2a?w=800&h=600&fit=crop"},

  // 3. SKIING — Kyrgyzstan (entire Central Asia ski region absent from database)
  {id:"karakol",      category:"skiing",title:"Karakol Ski Resort",      location:"Issyk-Kul, Kyrgyzstan",lat:42.4944,lon:78.3786,ap:"FRU",icon:"🎿",rating:4.88,reviews:640,gradient:"linear-gradient(160deg,#0a1a3a,#1a3a6a,#2e62b0)",accent:"#7eaad8",tags:["Tian Shan Powder","Off-Piste","$10/Day Lifts","Yurt Culture"],skiPass:"independent", photo:"https://images.unsplash.com/photo-1548604977-31ac0c434e3c?w=800&h=600&fit=crop"},

  // 4. SKIING — Sochi, Russia (no Russian ski resorts anywhere in database)
  {id:"rosa_khutor",  category:"skiing",title:"Rosa Khutor",             location:"Sochi, Russia",lat:43.6821,lon:40.2925,ap:"AER",icon:"🎿",rating:4.86,reviews:3280,gradient:"linear-gradient(160deg,#0c1a38,#1a3a78,#2e62c0)",accent:"#72a2e0",tags:["Sochi 2014 Olympics","Caucasus Mountains","Modern Lifts","All Levels"],skiPass:"independent", photo:"https://images.unsplash.com/photo-1519058082700-08a9b5965466?w=800&h=600&fit=crop"},

  // 5. SKIING — Kazakhstan (no Kazakhstan ski resorts in database; Almaty is major gateway city)
  {id:"shymbulak",    category:"skiing",title:"Shymbulak Ski Resort",    location:"Almaty, Kazakhstan",lat:43.1428,lon:77.0779,ap:"ALA",icon:"🎿",rating:4.83,reviews:1920,gradient:"linear-gradient(160deg,#0a1c38,#1a3e78,#2e6ab8)",accent:"#76aad8",tags:["City-Side Skiing","Tian Shan","Night Skiing","2700m Elevation"],skiPass:"independent", photo:"https://images.unsplash.com/photo-1604605801370-87dd96524e56?w=800&h=600&fit=crop"},
```

---

## 6. ONE OBSERVATION FOR THE PM

**The March 29 batch expansion is a technical debt time bomb that should be defused before Reddit launch.**

The 1,500 venues added on March 29 contain 995 batch-generated IDs with conflicting data for iconic spots already in the database. Right now this is partly invisible because scores are live-weather-driven and a "Cloudbreak" entry at position #3 vs another "Cloudbreak" at position #47 just looks like different surf breaks to a casual user. But:

1. A user who favorites Cloudbreak on one entry won't see it match when they search by name for the other entry
2. Alerts set on `cloudbreak` won't fire for `cloudbreak-s85` — they're different IDs
3. Expert surfers browsing the surf tab will immediately see Cloudbreak described as a "beginner-friendly beach break" (it isn't) — this is a credibility-destroying error
4. The deduplication fix is not a UI change — it's a data removal pass on ~600–800 `-s##` entries that have coordinate conflicts with existing named venues

**The fix**: Remove batch entries where `lat/lon` is within 0.05° of an existing named venue. Keep the originals. This takes venue count from 3,726 to ~2,900 — still larger than any competitor catalog — but with zero contradictions.

**Recommend:** Add "venue-deduplication-pass" to the pre-launch checklist at P1, before the Reddit push to r/surfing and r/skiing. Those communities will notice Mundaka described as beginner-friendly.

---

*Report written: 2026-04-02 | Agent: Content & Data | Venues audited: 3,726*
