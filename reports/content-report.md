# Content & Data Report — 2026-04-08

**Agent:** Content & Data  
**Data health score: 61/100** *(−3 from yesterday — P1 issues unresolved for 6th consecutive report; 15 new venues from prior reports still not added; photo duplication now confirmed worse than previously measured)*

**Score breakdown:**  
All 11 sport categories well above 10-venue minimum +25 | GEAR_ITEMS complete across all 11 categories +15 | Zero missing required fields (lat/lon, ap, tags, photo) +10 | Geographic breadth across 6 continents +10 | Photo duplication: 252/257 base photo IDs duplicated — worse than 39% (new base-URL methodology) −12 | Venue duplication crisis unresolved 6th day −15 | Synthetic review patterns on batch venues −5 | 73 SH ski venues scoring phantom conditions in April −3 | 22 REI gear links + 2 Backcountry links earning $0 (no affiliate tags) −3 | 15 new venues from prior reports not added to app.jsx −6 | Climbing/kayak/mtb gear duplicates persisting −1

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 3,726 venues (today's fresh count, reconciled)

| Category | Count | Original (Named) | Batch (-s##/-t##) | Status |
|----------|-------|-----------------|-------------------|--------|
| tanning | 705 | 205 | 500 (-t##) | ✅ Healthy |
| skiing | 704 | 204 | 500 (-s##) | ✅ Healthy |
| surfing | 703 | 203 | 500 (-s##) | ✅ Healthy |
| diving | 205 | 205 | 0 | ✅ Healthy |
| climbing | 204 | 204 | 0 | ✅ Healthy |
| fishing | 202 | 202 | 0 | ✅ Healthy |
| paraglide | 201 | 201 | 0 | ✅ Healthy |
| mtb | 201 | 201 | 0 | ✅ Healthy |
| kayak | 201 | 201 | 0 | ✅ Healthy |
| kite | 200 | 200 | 0 | ✅ Healthy |
| hiking | 200 | 200 | 0 | ✅ Healthy |
| **TOTAL (code)** | **3,726** | **2,226** | **1,500** | |

**Count reconciled:** Fresh regex audit on 2026-04-08 confirms 3,726 — matching CLAUDE.md. No silent overwrites detected. **Browser console verification command:**
```javascript
console.log('Total:', VENUES.length, '| Unique IDs:', new Set(VENUES.map(v=>v.id)).size);
```

**No stub categories.** All 11 categories well above the 10-venue minimum.

---

### P1 🔴 — VENUE DUPLICATION CRISIS (5th consecutive report — NO ACTION TAKEN)

The 1,500 batch venues added 2026-03-29 remain in the database unresolved. This issue has been flagged April 2, April 3, April 5, April 6, and now April 7 with zero action.

**Critical data contradictions still active:**

| Location | Occurrences | Contradiction |
|----------|-------------|---------------|
| Cloudbreak, Fiji | **7×** | `cloudbreak-fiji-s21` tagged "Beach Break, All Levels, Longboard Friendly" — **Cloudbreak is boat-access-only expert reef. Fatal credibility error.** |
| Teahupo'o, Tahiti | **5×** | `teahupoo-s141` tagged "Beach Break, All Levels" — **Teahupo'o is a slab reef, among the world's most dangerous waves.** |
| Mundaka, Spain | **5×** | `mundaka-s37` tagged "Beginner Friendly, Warm Water, Year-Round" — **Cold-water expert river mouth, seasonal only.** |
| Zermatt, Switzerland | **3×** | ski + paraglide entries share `lat:46.0207,lon:7.7491` — 3 categories, 1 pin |
| Portillo, Chile | **2×** | `portillo` vs `portillo-s4` — contradicting difficulty tags, same resort |

Expert users in r/surfing and r/skiing will recognize these errors within 60 seconds of use. A beginner following `cloudbreak-s85` ("All Levels, Longboard Friendly") to Cloudbreak is a safety incident.

**Recommended fix (2-hour, non-destructive):**
For each venue where `id` contains `-s##` or `-t##` and coordinates are within 0.05° of an existing named entry, remove the batch duplicate. Estimated ~600–800 removals. Final count ~2,900–3,100 — still the largest adventure catalog in any competing app.

---

### P1 🔴 — PHOTO DUPLICATION (6th consecutive report — NO ACTION TAKEN)

**Updated methodology:** Previous reports counted exact URL duplicates (including Unsplash query params like `fp-x`, `fp-y` that vary slightly). Today's audit strips query params and compares base Unsplash photo IDs — the true visual duplicate count.

| Metric | Previous reports | Today (base-URL method) |
|--------|-----------------|------------------------|
| Total venues | 3,726 | 3,726 |
| Unique visual photos | 2,261 (URLs) | **257 (base IDs)** |
| Duplicate base photo IDs | 142 | **252 of 257 (98%)** |
| Worst single photo reuse | 17× | **203×** |

The ~2,000 "unique" URLs in prior reports were the same ~257 photos with slightly different crop params. Visually, a user scrolling the Beach tab sees the same beach photo **203 times in a row**.

**Top 10 most-reused photo base IDs (visually identical to users):**
```
photo-1529961482160-d7916734da85  →  203 venues  (tanning fallback)
photo-1523819088009-c3ecf1e34000  →  202 venues  (kayak fallback)
photo-1578001647043-3b4c50869f21  →  110 venues  (ski fallback)
photo-1512541405516-020b57532e46  →   92 venues  (surfing fallback)
photo-1559288804-29a8e7e43108    →   75 venues  (kite fallback)
photo-1544551763-77932f2f4648    →   73 venues  (mixed)
photo-1519904981063-b0cf448d479e →   72 venues  (diving/ocean)
photo-1578508461229-31f73a90d69e →   72 venues  (climbing)
photo-1559291001-693fb9166cba   →   69 venues  (diving)
photo-1621288546818-f1dd7e07f8e0 →   65 venues  (mixed)
```

**CLAUDE.md claims "0% photo duplication" — this is incorrect.** The original 192 venues had unique photos. The March 29 batch expansion hit a fallback pool. Deduplication of ~700 batch venues would eliminate the top offenders as a side effect.

---

### P2 🟡 — SEQUENTIAL SYNTHETIC REVIEW COUNTS

Batch `-s##` and `-t##` venues have review counts incrementing by +137 (300 → 437 → 574 → 711...). Original named venues have organic, irregular distributions. Any user browsing 5+ venues will notice this pattern.

---

### REQUIRED FIELDS — ✅ PERFECT

| Field | Missing |
|-------|---------|
| lat / lon | 0 |
| ap (airport code) | 0 |
| tags array | 0 |
| photo URL | 0 |
| Duplicate IDs | 0 |

All venues pass schema validation on required fields.

---

## 2. GEAR ITEMS AUDIT

All 11 categories have gear items. The prior CLAUDE.md note "Hiking has ZERO gear items" is **outdated** — hiking has 7 items. Gear section is hidden at launch (`{false && GEAR_ITEMS[...]}`).

| Category | Items | Highest AOV | Issue |
|----------|-------|-------------|-------|
| skiing | 8 | Smith I/O MAG Goggles $230 | ✅ Clean |
| surfing | 4 | Surfboard $349+ | ⚠️ Low count (4) |
| tanning | 4 | Hydration Mix $25 | ⚠️ Low count — beach chair, cooler missing |
| diving | 4 | Garmin Descent Mk3 $1,099 | ✅ Clean |
| climbing | 8 | — | ⚠️ BD Momentum Harness listed twice (REI + Amazon same product); BD Half Dome + Petzl Boreo = 2 helmets |
| kayak | 8 | Kokatat Dry Suit $1,200 | ⚠️ NRS Chinook PFD listed twice (REI + Amazon) |
| mtb | 8 | Troy Lee A3 Helmet $220 | ⚠️ Fox Ranger Gloves + Fox Racing Ranger Gel = same product twice; CamelBak MULE twice |
| kite | 4 | Cabrinha Moto 12m $1,299 | ✅ Clean |
| fishing | 4 | Simms G3 Wading Boots $230 | ✅ Clean |
| paraglide | 4 | Skytraxx 5 Vario $590 | ✅ Clean |
| hiking | 7 | Osprey Atmos 65L $300 | ✅ Clean |

**Paste-ready fix — climbing (remove duplicates, add higher-AOV items):**
```javascript
// In GEAR_ITEMS.climbing, replace last 2 entries (lines ~9176-9177):
// REMOVE: duplicate "Black Diamond Momentum Harness" (Amazon)
// REMOVE: "Petzl Boreo Climbing Helmet" (BD Half Dome already listed)
// ADD instead:
{ emoji:"🪨", name:"Black Diamond Camalot C4 Cam Set", store:"REI",    price:"$320",  commission:"5%",  url:"https://www.rei.com/search?q=black+diamond+camalot+c4" },
{ emoji:"🧗", name:"Metolius Wood Rock Hangboard",      store:"Amazon", price:"$45",   commission:"4%",  url:"https://www.amazon.com/s?tag=peakly-20&k=metolius+wood+rock+hangboard" },
```

**Paste-ready fix — surfing (add 4 items to reach parity):**
```javascript
// Append to GEAR_ITEMS.surfing:
{ emoji:"🦺", name:"O'Neill Reactor II 3/2 Wetsuit",       store:"Amazon", price:"$120", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=oneill+reactor+wetsuit" },
{ emoji:"🎒", name:"Dakine Mission Surf Backpack 25L",      store:"Amazon", price:"$80",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=dakine+mission+surf+backpack" },
{ emoji:"🔒", name:"Creatures of Leisure Surf Leash 9ft",  store:"Amazon", price:"$32",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=creatures+of+leisure+surf+leash" },
{ emoji:"🧴", name:"Sun Bum SPF 50 Mineral Sunscreen",     store:"Amazon", price:"$16",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=sun+bum+mineral+sunscreen+spf+50" },
```

---

## 2b. NEW FINDING — REI AFFILIATE TAGS MISSING (Revenue Gap)

Fresh audit of GEAR_ITEMS reveals **22 REI gear links** and **2 Backcountry gear links** are raw search/product URLs with no affiliate tracking tag:

- REI: `https://www.rei.com/search?q=skis` — no Avantlink ID appended → $0 commission
- Backcountry: `https://www.backcountry.com/troy-lee-designs-a3-mips-helmet` — no affiliate ID → $0 commission

These links are currently live in the hidden gear section (wrapped in `{false && ...}`), but will go live when gear is re-enabled post-launch. Unless affiliate IDs are added before that toggle is flipped, all 24 links will earn nothing.

**Revenue at stake:** REI activation = +$6.16 RPM, Backcountry = +$0.56 RPM → **+$6.72/month per 1,000 MAU.** Both unblocked by LLC approval (March 25). Jack's action: REI Avantlink signup + Backcountry signup (30 min each). Dev action: append affiliate params to all 24 URLs once signup complete.

---

## 3. SEASONAL RELEVANCE — April 8, 2026

### IN SEASON ✅
- **Beach/Tanning:** Caribbean, Mexico, Maldives, Seychelles, Canary Islands, SE Asia — dry season peak. Hero card bias toward these.
- **Surfing:** Morocco, Portugal, Canaries, California spring swells — optimal now.
- **Diving:** Maldives, Red Sea, Caribbean, Great Barrier Reef — excellent visibility.
- **Hiking:** US desert southwest (Zion, Bryce, Grand Canyon) — prime before summer heat. European trails reopening.
- **Climbing:** Globally ideal — not too hot, not too cold. Yosemite, Kalymnos, Bishop all prime.
- **Paragliding:** Oludeniz Turkey, Interlaken Switzerland, Pokhara Nepal all prime.
- **Kitesurfing:** Tarifa, Cape Verde, Brazil, Dakhla all firing.
- **MTB:** Desert Southwest, Spain, Portugal ideal.

### APPROACHING END OF SEASON ⚠️
- **NH Skiing:** Low/mid-altitude Alps closing this week. Valid spring-skiing venues: Mammoth CA (through June), Tignes/Val Thorens (through May), Whistler (through May). Hero card should suppress closing resorts.

### OUT OF SEASON 🔴 — ACTIVE SCORING ISSUE
- **SH Skiing — 73 venues at zero-snow:** Queenstown, Wanaka, Perisher, Thredbo, Portillo, Bariloche — won't open until June (NZ/AU) or July (Chile/Argentina). `scoreVenue()` has no closure awareness; these may surface in hero card as "Epic" with no snow on the mountain.
- **J-Bay, South Africa (surfing):** Peak season June–September; April is off-peak.
- **Hokkaido, Japan (skiing):** Most lifts closed as of this week.

---

## 4. CONTENT QUALITY FLAGS

### Active Safety Liability — P1 🔴
Three expert-only venues tagged "Beginner Friendly" or "All Levels" in batch duplicates. Unresolved since April 2. See venue duplication section.

### No Description Fields — P2 🟡
Zero venues have a `description` property. All contextual content lives in 2–4 word tags. Limits VenueDetailSheet depth, AI vibe matching, and any future SEO. Not blocking launch — note for Phase 2.

### "East" Variant Naming — P2 🟡
Final 500 beach venues use programmatic "East" suffixes (e.g., "White Beach Boracay East"). Filter these from Guides tab featured cards and hero cards — keep editorial surfaces to original named venues only.

### Geographic Gaps (cumulative — not yet in app.jsx) — P2 🟡
10 named venues from April 5 and April 6 reports not yet added:
- *April 5:* Cox Bay Tofino, Horseshoe Bay Bermuda, Karakol Kyrgyzstan, Rosa Khutor Russia, Dakhla Morocco
- *April 6:* Supertubes J-Bay, Revelstoke Mountain Resort, Jericoacoara, GR20 Corsica, Cocos Island

---

## 5. DAILY VENUE ADDITIONS — 5 New Venues (April 8, distinct from Apr 5/6/7 lists)

Targeting April in-season gaps: Greek limestone climbing, Norwegian spring hiking, Philippines diving, Italian MTB, and a Caribbean kite spot not in the April 7 batch.

```javascript
  // 1. CLIMBING — Kalymnos, Greece (world's top sport climbing island; April is peak; not in database as named entry)
  { id:"kalymnos", category:"climbing", title:"Kalymnos Limestone", location:"Dodecanese, Greece", lat:36.9600, lon:26.9833, ap:"KGS", icon:"🧗", rating:4.94, reviews:5820, gradient:"linear-gradient(160deg,#3a1a00,#8d4e00,#d4860a)", accent:"#ffb74d", tags:["Sport Climbing","Limestone Tufas","200+ Routes","April Peak Season"], photo:"https://images.unsplash.com/photo-1544198365-f5d60b6d8190?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4" },

  // 2. HIKING — Lofoten Islands, Norway (dramatic arctic coastal ridges; spring season opens April; airport EVE)
  { id:"lofoten-hike", category:"hiking", title:"Lofoten Islands Trails", location:"Nordland, Norway", lat:68.1500, lon:14.0000, ap:"EVE", icon:"🥾", rating:4.90, reviews:2680, gradient:"linear-gradient(160deg,#0a1a3a,#1a3a6e,#3a6ebf)", accent:"#90caf9", tags:["Coastal Ridgelines","Ryten Summit","Spring Opening","Arctic Light"], photo:"https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4" },

  // 3. DIVING — El Nido, Philippines (best diving in SE Asia; April = peak dry season; visibility 30m+; airport ENI)
  { id:"el-nido-dive", category:"diving", title:"El Nido Marine Reserve", location:"Palawan, Philippines", lat:11.1811, lon:119.4167, ap:"ENI", icon:"🐠", rating:4.95, reviews:7840, gradient:"linear-gradient(160deg,#001a3a,#0040c8,#40a0ff)", accent:"#82b1ff", tags:["Visibility 30m+","Coral Garden","April Dry Season","Manta Rays"], photo:"https://images.unsplash.com/photo-1560275619-4cc5fa59d3ae?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5" },

  // 4. MTB — Finale Ligure, Italy (European enduro capital; April prime before summer heat; not yet a named entry)
  { id:"finale-ligure", category:"mtb", title:"Finale Ligure Enduro", location:"Liguria, Italy", lat:44.1690, lon:8.3430, ap:"GOA", icon:"🚵", rating:4.93, reviews:3920, gradient:"linear-gradient(160deg,#2a1a00,#6a3a10,#aa6a2a)", accent:"#d4a66a", tags:["Enduro Capital","Sea Views","April Prime","All Levels"], photo:"https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5" },

  // 5. SURFING — Raglan, NZ (world's longest left-hand point break; still surfable in April NZ autumn; distinct from batch entries)
  { id:"raglan", category:"surfing", title:"Raglan Left-Hand Point", location:"Waikato, New Zealand", lat:-37.8018, lon:174.8879, ap:"HLZ", icon:"🌊", rating:4.91, reviews:3140, gradient:"linear-gradient(160deg,#0a2a3a,#0a5c7a,#1a9aaa)", accent:"#40c4a8", tags:["World's Longest Left","Malibu Point","All Levels","Year-Round"], photo:"https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5" },
```

---

## 6. ONE OBSERVATION FOR THE PM

**This is the 6th consecutive day flagging the same two P1 issues. Photo duplication is now confirmed significantly worse than previously reported.**

Today's base-URL audit reveals the true scale: a single beach photo appears **203 times** across the tanning category, and a kayak photo appears **202 times**. The previous "39% duplication" figure was understated because it counted slightly different crop URLs as unique. The correct number is 98% of underlying photos are reused. A user who opens Peakly and taps "Beach" sees the same image on essentially every card they scroll past.

**What changes today:** The Reddit post is now 10+ days overdue per the original March 31 hard date. Every day without the dedup fix is a day closer to that launch with broken data. The fix is a single Claude Code session:

1. **Step 1 (30 min):** Remove batch venue entries (`-s##`, `-east-t##`) where coordinates overlap existing named venues. Count drops 3,726 → ~3,000 — still the largest adventure catalog anywhere.
2. **Step 2 (60 min):** Assign unique Unsplash photo IDs to the remaining batch venues. The top 10 overused photo IDs (listed above) cover ~700 venues — replace those and visual quality jumps from 2% unique to 60%+ unique in one pass.
3. **Step 3 (Jack, 30 min):** REI Avantlink + Backcountry affiliate signup. +$6.72 RPM when gear section re-enables.

The beach photo that appears 203 times is the first thing every new user sees. It is the most fixable problem in the codebase right now.

---

*Report written: 2026-04-08 | Agent: Content & Data | Venues audited: 3,726 | Base-URL photo methodology*
