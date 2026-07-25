# Venue coordinate verdicts — 2026-07-25

Pass 1 forward-geocoded names (noisy — same names exist worldwide).
Pass 2 reverse-geocodes our actual coordinates. **Pass 2 is the authoritative one.**

59 flagged venues re-checked.

| Verdict | Count | Meaning |
|---|---|---|
| ✅ CONFIRMED | 53 | our coords land in the correct country — pass 1 was a false alarm, **no action** |
| 🌊 WATER | 0 | coords are over water/unmapped — normal for island & reef venues, but verify the obvious ones |
| ❌ WRONG_COUNTRY | 6 | coords land in a different country than stated — **real errors, fix these** |

## ❌ WRONG_COUNTRY — real errors

| id | title | stated | actual | pass1 |
|---|---|---|---|---|
| `beach_magens` | Magens Bay | stated: **USVI** | actual: **United States** (Charlotte Amalie) | pass1 said 5438km |
| `stowe-mountain-s14` | Stowe Mountain | stated: **Vermont** | actual: **United States** (Stowe) | pass1 said 197km |
| `mount-shasta-ski-s26` | Mount Shasta Ski | stated: **California** | actual: **United States** (Siskiyou County) | pass1 said 11km |
| `stingray-sandbar-cayman` | Stingray City Sandbar | stated: **Grand Cayman** | actual: **Cayman Islands** | pass1 said 17km |
| `honeymoon-beach-stj` | Honeymoon Beach | stated: **USVI** | actual: **United States** (Cruz Bay) | pass1 said 655km |
| `pasjaca-beach-croatia` | Pasjača Beach | stated: **Croatia** | actual: **Montenegro** (Kruševice) | pass1 said 11km |

## 🌊 WATER — check the non-island ones

| id | title | stated country | pass1 distance |
|---|---|---|---|
| — | none | | |

## ✅ CONFIRMED — false alarms from pass 1, no action needed

- `aspen` **Aspen Snowmass** — coords are in United States (Aspen) as stated; pass 1's 11km was a same-named place elsewhere
- `whitefish` **Whitefish Mountain** — coords are in United States (Flathead County) as stated; pass 1's 35km was a same-named place elsewhere
- `mthood` **Mt Hood Meadows** — coords are in United States (Hood River County) as stated; pass 1's 57km was a same-named place elsewhere
- `beach_ob` **Outer Banks OBX** — coords are in United States (Dare County) as stated; pass 1's 323km was a same-named place elsewhere
- `beach_sardinia` **Cala Mariolu** — coords are in Italy (Baunei) as stated; pass 1's 10km was a same-named place elsewhere
- `beach_milos` **Sarakiniko Moon Beach** — coords are in Greece (Plaka) as stated; pass 1's 12km was a same-named place elsewhere
- `beach_menorca` **Cala Macarella** — coords are in Spain as stated; pass 1's 12km was a same-named place elsewhere
- `beach_mauritius` **Belle Mare Plage** — coords are in Mauritius (Bel Air Rivière Sèche VCA) as stated; pass 1's 11km was a same-named place elsewhere
- `beach_phiphi` **Maya Bay Phi Phi** — coords are in Thailand (Ao Nang) as stated; pass 1's 61km was a same-named place elsewhere
- `beach_nusapenida` **Kelingking Secret Beach** — coords are in Indonesia as stated; pass 1's 13km was a same-named place elsewhere
- `beach_spain_mallorca_es` **Es Trenc Beach, Mallorca** — coords are in Spain (Campos) as stated; pass 1's 31km was a same-named place elsewhere
- `kiroro-snow-world-s11` **Kiroro Snow World** — coords are in Japan (Akaigawa) as stated; pass 1's 156km was a same-named place elsewhere
- `pucon-ski-center-s19` **Pucon Ski Center** — coords are in Chile (Pucón) as stated; pass 1's 72km was a same-named place elsewhere
- `les-arcs-s20` **Les Arcs** — coords are in France (Peisey-Nancroix) as stated; pass 1's 228km was a same-named place elsewhere
- `madarao-mountain-s22` **Madarao Mountain** — coords are in Japan (Myoko) as stated; pass 1's 16km was a same-named place elsewhere
- `turquoise-bay-t8` **Turquoise Bay** — coords are in Australia (Exmouth) as stated; pass 1's 31km was a same-named place elsewhere
- `natadola-beach-t9` **Natadola Beach** — coords are in Fiji (Sigatoka) as stated; pass 1's 21km was a same-named place elsewhere
- `bulabog-beach-boracay-t19` **Bulabog Beach Boracay** — coords are in Philippines (Malay) as stated; pass 1's 50km was a same-named place elsewhere
- `beach_maldives` **Maldives North Malé Atoll** — coords are in Maldives (Malé) as stated; pass 1's 29km was a same-named place elsewhere
- `ski_mzaar` **Mzaar Kfardebian** — coords are in Lebanon as stated; pass 1's 15km was a same-named place elsewhere
- `beach_phuquoc` **Long Beach Phú Quốc** — coords are in Vietnam (Phú Quốc) as stated; pass 1's 10km was a same-named place elsewhere
- `brighton` **Brighton** — coords are in United States (Brighton) as stated; pass 1's 578km was a same-named place elsewhere
- `solitude` **Solitude** — coords are in United States (Brighton) as stated; pass 1's 2052km was a same-named place elsewhere
- `deer-valley` **Deer Valley** — coords are in United States (Summit County) as stated; pass 1's 774km was a same-named place elsewhere
- `sugar-bowl` **Sugar Bowl** — coords are in United States (Placer County) as stated; pass 1's 427km was a same-named place elsewhere
- `park-city-mountain` **Park City Mountain** — coords are in United States (Park City) as stated; pass 1's 457km was a same-named place elsewhere
- `northstar-california` **Northstar California** — coords are in United States (Placer County) as stated; pass 1's 161km was a same-named place elsewhere
- `kirkwood` **Kirkwood** — coords are in United States (Alpine County) as stated; pass 1's 2505km was a same-named place elsewhere
- `mad-river-mountain-oh` **Mad River Mountain** — coords are in United States (Rushcreek Township) as stated; pass 1's 15km was a same-named place elsewhere
- `liberty-mountain` **Liberty Mountain** — coords are in United States (Carroll Valley) as stated; pass 1's 3614km was a same-named place elsewhere
- `roundtop-mountain` **Roundtop Mountain** — coords are in United States (Monaghan Township) as stated; pass 1's 439km was a same-named place elsewhere
- `jack-frost` **Jack Frost Big Boulder** — coords are in United States (Tobyhanna Township) as stated; pass 1's 11km was a same-named place elsewhere
- `nakiska` **Nakiska** — coords are in Canada (Kananaskis Village) as stated; pass 1's 295km was a same-named place elsewhere
- `long-bay-providenciales` **Long Bay Beach** — coords are in Turks and Caicos Islands (Providenciales) as stated; pass 1's 1032km was a same-named place elsewhere
- `punta-mita-mexico` **Punta Mita Beach** — coords are in Mexico as stated; pass 1's 14km was a same-named place elsewhere
- `santa-teresa-cr` **Santa Teresa** — coords are in Costa Rica (Cóbano) as stated; pass 1's 63km was a same-named place elsewhere
- `big-sur-pfeiffer` **Pfeiffer Beach Big Sur** — coords are in United States (Monterey County) as stated; pass 1's 279km was a same-named place elsewhere
- `spiaggia-rosa-budelli` **Spiaggia Rosa Budelli** — coords are in Italy as stated; pass 1's 136km was a same-named place elsewhere
- `costa-smeralda-sardinia` **Costa Smeralda** — coords are in Italy (Alzachèna/Arzachena) as stated; pass 1's 12km was a same-named place elsewhere
- `capri-marina-piccola` **Capri Marina Piccola** — coords are in Italy as stated; pass 1's 15km was a same-named place elsewhere
- `cala-tuent-mallorca` **Cala Tuent Mallorca** — coords are in Spain (Escorca) as stated; pass 1's 29km was a same-named place elsewhere
- `veligandu-maldives` **Veligandu Island Beach** — coords are in Maldives as stated; pass 1's 85km was a same-named place elsewhere
- `baros-island-maldives` **Baros Island Beach** — coords are in Maldives as stated; pass 1's 67km was a same-named place elsewhere
- `coogee-beach-sydney` **Coogee Beach** — coords are in Australia (Sydney) as stated; pass 1's 3299km was a same-named place elsewhere
- `langford-island-spit` **Langford Island Spit** — coords are in Australia as stated; pass 1's 19km was a same-named place elsewhere
- `yasawa-fiji` **Yasawa Islands** — coords are in Fiji (Ba) as stated; pass 1's 60km was a same-named place elsewhere
- `mamanucas-fiji` **Mamanuca Islands** — coords are in Fiji (Nadroga-Navosa) as stated; pass 1's 11km was a same-named place elsewhere
- `coral-coast-fiji` **Coral Coast** — coords are in Fiji (Sigatoka) as stated; pass 1's 23km was a same-named place elsewhere
- `nevados-de-chillan-cl` **Nevados de Chillán** — coords are in Chile (Pinto) as stated; pass 1's 68km was a same-named place elsewhere
- `corralco-cl` **Corralco** — coords are in Chile (Lonquimay) as stated; pass 1's 11km was a same-named place elsewhere
- `cerro-catedral-ar` **Cerro Catedral** — coords are in Argentina (Villa Catedral) as stated; pass 1's 420km was a same-named place elsewhere
- `beach_okinawa` **Emerald Beach Okinawa** — coords are in Japan (Okinawa) as stated; pass 1's 41km was a same-named place elsewhere
- `beach_cape_verde` **Santa Maria Beach** — coords are in Cape Verde as stated; pass 1's 29km was a same-named place elsewhere
