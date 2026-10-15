# Peakly PM Report v181 — 2026-10-15

**Status: 🔴 RED — VPS Day 67. Launch is Oct 18 (Saturday). 3 days. `origin/master` footgun Day 9. r/travel draft 3 days overdue. Code freeze Day 31 clean.**

> **Stale prompt notice (Day 9):** Scheduled routine still references "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: 404 venues, 2 categories, Peakly Pro cut, Sentry live. Jack: update the cron task. It takes 2 minutes and stops injecting false signal into launch-week reports. Nine consecutive reports generating noise we have to filter.

---

## Shipped Since Last Report (v180 → v181)

| Commit | What | Right call? |
|--------|------|-------------|
| `ec2c85b` | Content Oct 15 — 91/100, code freeze Day 31 clean | ✅ Accurate. |
| `cc70c54` | DevOps Oct 15 — RED, VPS Day 67, master footgun Day 9 | ✅ Correct severity. |

**Zero app.jsx/sw.js/index.html commits. Code freeze Day 31. Correct.**

**Yesterday's report called Oct 14 the "last viable window" for VPS. It wasn't done. Today is Oct 15 — launch eve territory. The window didn't close — it narrowed to a slot with no warm-up runway.**

---

## Bug Triage

### P0 — VPS Redeploy: Day 67. Oct 15 is now the hard line.

Yesterday I said Oct 14 was the last viable window. It wasn't done. The honest update:

- Oct 15 (today): last day with 3 days for cache warm-up before Oct 18 traffic
- Oct 16: 48h before launch — cold restart risk during warm-up
- Oct 17: 24h before launch — any restart wipes in-memory cache at worst possible time
- Oct 18 (launch day): cold cache + 7-day forecast + CORS failures + silent alert bugs, on the day that matters

**What breaks on Oct 18 without the VPS deploy:**
1. Val Thorens disappears from front page — 14-day forecast needed, VPS returns 7 days, `confidence: "low"` filtered. The r/travel hook evaporates.
2. iOS CORS fail — `capacitor://localhost` not in allowlist. Every iOS native API call returns an error. If App Store submission goes live, App Store users get a broken product.
3. Alert deletion silent-fails — `DELETE` missing from `Access-Control-Allow-Methods`.
4. Cold cache on launch traffic — in-memory only, any restart = Open-Meteo rate limit within minutes of Reddit spike.

**This is still a 10-minute fix:**
```bash
# From local machine, in peakly repo root:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: forecast_days:14, disk_cache:"enabled", capacitor://localhost in cors
```

**The decision point has arrived: deploy the VPS today, or announce Oct 25 launch and give the product the warm-up window it needs. Shipping Oct 18 without VPS is shipping a degraded product on purpose. That's a product call Jack has to make, and today is the last day to make it cleanly.**

### P0 — r/travel Draft: 3 Days Overdue

Was due Oct 12. It's Oct 15. If the draft doesn't exist today, writing it Oct 17 means zero review cycle before the one post that defines Peakly's first impression.

The structure is locked (confirmed v178): one hook sentence, Val Thorens opening weekend as the peg, one CTA, no secondary asks. This is a 30-minute write. If it doesn't exist by end of Oct 15, cut the Reddit launch from Oct 18 and keep it as an Oct 21+ post. The product launch happens either way — but the Reddit amplification is conditional on the draft existing.

**New flag:** if Val Thorens doesn't appear on the front page Oct 18 (VPS not deployed), the r/travel peg collapses anyway. The VPS and the Reddit post are coupled. You can't post the Val Thorens hook with a product that doesn't show Val Thorens.

### P1 — `origin/master` Footgun: Day 9

50 commits behind main. `deploy.yml` deploys both. An accidental push to master silently rolls the live site back to late May. On launch day, with potential multiple people watching and sharing, this is a live grenade.

**Fix in 30 seconds:**
```bash
git push origin --delete master
```

Bundle this with the VPS session. 10 minutes total for P0 + P1.

### P2 — Venue Count Discrepancy: Minor

DevOps reports 406 venues; Content reports 404. Both use bracket-counting. One is stale. Not a launch blocker — both methods confirm catalog is intact — but worth a single `node -e` eval to get the authoritative number before launch.

### P2 — SW PRECACHE Mismatch: Day 11

`sw.js` caches `app.jsx` directly; production serves `dist/app.min.js`. Post-launch sprint. Code freeze blocks.

---

## Three Product Decisions — Oct 15

### Decision 1: VPS or launch date slip — call it today.

Not "do the VPS today." The call is: **ship Oct 18 with VPS done, or slip to Oct 25 and ship right.** Oct 15 is the last day where a restart has meaningful warm-up time. After today, Oct 18 launch ships with a cold cache, CORS failures for iOS, and a broken Val Thorens front-page hook.

**DECISION: Jack — this is binary. Either the `scp + pm2 restart` happens today, or the Oct 18 date moves to Oct 25. "Launch Oct 18 and see what happens" is a choice to launch a degraded product. I'm not making that call — Jack is. But the call has to happen today.**

### Decision 2: r/travel post is now conditional on VPS being done.

The Val Thorens opening weekend hook (the only peg for the r/travel post) requires the 14-day forecast window. If VPS isn't deployed, Val Thorens won't surface on the front page on Oct 18, and the post's claim falls apart in the first reply.

**DECISION: r/travel post is gated on VPS. If VPS ships today → write the draft today. If VPS slips to Oct 25 → the Reddit post moves to Oct 21–22 (gives product 3 days of warm-up before the spike). These two are now a single decision.**

### Decision 3: lateSeason spot-check is now mandatory, not optional.

3 days to launch. If a lateSeason venue scores > 80 on thin Oct 18 opening conditions, we get burned in the first launch thread reply. This is a 10-minute check: open the live app, look at Val Thorens, Whistler, Chamonix, Tignes, Mammoth. If any shows > 80 with clearly thin conditions, flag it here today — we have 2 days to investigate.

**DECISION: Jack opens the live app today (Oct 15) and spot-checks those 5 venues. Not a code task. This is the last viable window for a manual launch-day quality check.**

---

## This Week's Top 3

1. **Jack: VPS deploy OR announce Oct 25 slip — today, Oct 15. This decision can't wait. 10 minutes for the VPS, 30 seconds to delete origin/master.**
2. **Jack: r/travel draft — only if VPS is done. 30 minutes. Otherwise schedule for Oct 21.**
3. **Jack: lateSeason spot-check — today, 10 minutes. Open live app, check top 5 venues.**

---

## Features REJECTED This Week

| Feature | Reason |
|---------|---------|
| Any code change before Oct 18 | Code freeze. Day 31. |
| Merging any `claude/` branch | 16+ unvetted branches. Post-launch. |
| SW PRECACHE fix | Code freeze. Post-launch. |
| New venue additions | Post-launch sprint (tags → PRECACHE → dedup → photos → venues). |
| JSON-LD / structured data | SEO gap, not a launch blocker. Post-launch. |
| Gili Trawangan dedup | Code freeze. Post-launch. |
| Tag depth improvement (225 venues at 2 tags) | Code freeze. #1 on post-launch sprint list. |

---

## Post-Launch Sprint Order (confirmed, not changed)

1. Tags — fix 225 thin-tag venues (unblocks `scoreVibeMatch`, boosts search recall)
2. SW PRECACHE — point at `dist/app.min.js` instead of `app.jsx`
3. Gili Trawangan dedup — delete `beach_gilit`, keep `gili-trawangan`
4. Photos — 346 venues still on generic stock
5. New venues — 5 post-launch queue items (Content report)
6. BASE_PRICES audit — Content confirmed 165/165 APs covered now ✅ (was 68% gap per v99 — resolved)

---

## Success Criteria

**5K vs 8K at 90 days — what's the swing factor:**

The 5K path: organic SEO + App Store discovery, no Reddit amplification, generic stock photos, thin tag search.
The 8K path: Val Thorens front page on launch day (VPS), r/travel post lands cleanly, lateSeason spot-check catches no bad data, App Store launch alongside Reddit.

The gap is entirely in the launch execution, not the product. The product is ready. The infrastructure isn't.

**One product risk nobody is talking about:**

The `origin/master` footgun isn't just a ops risk — it's a silent rollback risk in the most visible 72 hours Peakly will ever have. We talk about it as a Day-N counter. The actual risk is: one confused contributor or old machine pushes to master during the Reddit spike, the site rolls back to May, and the first 500 people who clicked the link see a broken product with different venue counts, broken scoring, and missing features. There's no alerting on this. Nobody would know until users started reporting it. 30-second fix. Zero days to make it.

---

**v181 close: 3 days, one VPS. The product is done. Launch it right.**
