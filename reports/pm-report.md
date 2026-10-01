# Peakly PM Report v167 — 2026-10-01

**Status: 🔴 RED — VPS Day 53. Oct 4 deadline = 3 days. Oct 18 beach launch = 17 days. Code freeze Day 18 clean. S-Hem spring Day 3 of 8-week prime window. Single gate left: Jack's SSH session.**

---

## Shipped Since Last Report (v166 → v167)

| Commit | What | Right call? |
|--------|------|-------------|
| `2332bab` | DevOps Oct 1 — YELLOW, VPS Day 53, 3 days to Oct 4, origin/master footgun Day 9 confirmed undone | ✅ Accurate state. |
| `30af139` | Content Oct 1 — data score 93/100 unchanged, S-Hem spring Day 3, Tignes 24 days out | ✅ Seasonal tracking is launch-relevant. |
| *(this run)* | PM report v167 | ✅ |

**Zero code commits to app.jsx/sw.js/index.html for 18 days. Code freeze holds. Oct 5 session (Gili rename, tag enrichment, branch cleanup, master delete) is the last planned touch before launch.**

---

## Bug Triage

### P0s — None

---

### P1 — VPS Redeploy: Day 53, Oct 4 = **3 Days**

3 days. Not 4. The window is closing.

DevOps confirmed what's broken for 53 days: two-weekend scoring (week 2 silent null), iOS native proxy calls blocked by CORS, alert deletion silently failing, rate-limit spoofing vector open, Sep 9+10 fare-fallback not upgrading `~$X` to `$X LIVE` on some beach routes.

The fix is 4 commands and ~10 minutes:
```bash
ssh root@198.199.80.21
cd /tmp && git clone https://github.com/j1mmychu/peakly.git peakly-tmp 2>/dev/null || (cd /tmp/peakly-tmp && git pull)
cp /tmp/peakly-tmp/server/proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy && curl -s https://peakly-api.duckdns.org/health
```

If git isn't on the VPS:
```bash
curl -sL https://raw.githubusercontent.com/j1mmychu/peakly/main/server/proxy.js -o /opt/peakly-proxy/proxy.js
```

**This is still the only Jack-action that determines whether launch is "great" or "good." 3 days left.**

---

### P1 — `origin/master` Footgun: Day 9 Decided, Still Undone

`deploy.yml` deploys both `main` and `master`. One accidental push to `master` ships June 2026 code to production. This is 10 seconds to fix:

```bash
git push origin --delete master
```

**Day 9. Before Oct 5. This is not a codebase question — it's a git command.**

---

### P1 — Tag Density (225 venues at ≤2 tags): Oct 5 Locked

Oct 5 session. Not touching before then. Day 26 of 55.7% under-enriched.

---

### P2 — Gili Trawangan Duplicate: Oct 5, 4 Days

`beach_gilit` → `beach_gili_air` (Gili Air). Oct 5.

---

### P3 — Stale Branches (18)

Oct 5 GitHub UI.

### P3 — Peakly Pro Price ($9/mo vs $79/yr)

REJECTED. Dead UI. Zero users to mislead. Post-launch if Pro revives.

### P3 — Sentry DSN

✅ CONFIRMED LIVE. Stop flagging.

### P3 — Cache stamp stale at `20260914a`

Expected. Auto-bumps on next code commit. Not a user-facing issue.

---

## Three Product Decisions — Oct 1

### Decision 1: Oct 5 scope is locked. No additions.

Oct 5 session is Gili rename + tag enrichment (225 venues, ≤2 tags → target ≥3) + stale branch cleanup + `origin/master` delete. That's a full session. The temptation will be "while I'm in there..." — don't. Every unplanned touch resets the smoke-test clock and risks a code push 13 days before launch.

**DECISION: Oct 5 scope is exactly those four items. Nothing added, nothing substituted. Code freeze resumes Oct 6.**

### Decision 2: r/skiing post moves to Nov 1, not December.

Confirmed from v166. Tignes opens Oct 25. The week of Nov 1 is the natural hook — "Alpine season just opened, here's where to go this weekend." This is more timely than a generic December post and catches the early-bird booking window before school holidays inflate fares.

**DECISION: r/skiing post targets Nov 1 week. Opening line references Tignes/Val d'Isère opening week. Draft needed by Oct 25.**

### Decision 3: VPS miss on Oct 4 does not move Oct 18. But it does change the Reddit post copy.

Carrying forward v166's decision with one addition: the specific copy change if VPS misses. Current draft says "live prices from your home airport." If VPS isn't deployed by Oct 4, that line becomes "estimated prices from your home airport, updated weekly." Not "live." That's the honest fallback.

**DECISION: If VPS misses Oct 4, change "live prices" to "estimated prices, updated weekly" in `reports/reddit-launch-post.md` before posting. Jack updates that line when he reviews the draft by Oct 11.**

---

## This Week's Top 3

1. **VPS deploy before Oct 4** — 3 days left. One SSH session. Turns estimate pricing into live pricing at launch. Every day this slips is a day closer to shipping a "good" launch instead of a "great" one.
2. **Delete `origin/master`** — 10 seconds. Day 9. Do it today, not Oct 5.
3. **Jack reviews Reddit launch post by Oct 11** — Replace the three venue callouts with whatever Explore is actually showing as top 3 beach that weekend. Verify the voice reads human.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| Adding scope to Oct 5 session | Session is already full. Code freeze resumes Oct 6; no additions. |
| New venue adds before Oct 5 | 55.7% of existing venues are tag-underfilled. Add venues after enrichment. |
| Tignes/ski content in Oct 18 beach post | Wrong audience (r/solotravel doesn't care about Alpine). Ski post is Nov 1. |
| Any "while I'm in there" app.jsx changes | 18-day code freeze, 17 days from launch. Surgical Oct 5 session only. |
| Reddit post auto-publishing | Not automating this. Jack posts manually. First impression of the product needs a human present. |

---

## One Product Risk Nobody Is Talking About

**The app doesn't have a single user testimonial, screenshot, or proof point in the Reddit post.**

The launch post draft describes the product accurately. It doesn't show what the product actually does with a live venue. Reddit's "I built this" posts that get traction almost always include a screenshot: "Here's what the app shows for Cape Town this weekend." That screenshot does two things the copy can't: it proves the product is real and functional, and it shows the specific value (a real score, a real price, a real recommendation) before anyone clicks.

The post currently asks readers to take it on faith that the scoring is good, the prices are live, and the venues are worth visiting. One screenshot of a high-scoring beach venue with a real weekend score and a real fare eliminates all three objections in a single image.

This is not a code task. It's Jack opening the app on launch weekend, finding the top-scoring venue, and screenshotting the card. 2 minutes of work, potentially the difference between 50 upvotes and 500.

**Add one screenshot to the Reddit post before Oct 18. Specifically: the top-scoring beach venue on the morning of Oct 18.**

---

## S-Hemisphere Spring — Launch Context

Oct 1 = Day 3 of the 8-week prime window. Oct 18 = Day 20. Content confirmed the right venues are in the catalog:

- **Brazil (12 venues)**: FOR/NAT confirmed working. Florianópolis, Jericoacoara, Pipa — spring prime.
- **South Africa (5 venues)**: Cape Town spring warming. Should be top 5 beach on Oct 18.
- **New Zealand (8 venues)**: Whitehaven Beach-equivalent venues. Early spring, shoulder fares.
- **Australia (beach)**: Warming. Shoulder fares. Whitsunday Islands positioning.

Hintertux glacier is open now (365-day). Saas-Fee closing late October. These two are the only ski venues with honest GO scores right now — the lateSeason flag is doing its job.

---

## Success Criteria Check

| Metric | Status |
|--------|--------|
| 90-day projection (5K–8K users) | Beach Oct 18 + ski Nov 1 + ski Dec = path to 8K. VPS = live fares = better retention. |
| Live fares at beach launch | 🔴 At risk — VPS by Oct 4. **3 days**. |
| Data quality score | 93/100. Tag enrichment is Oct 5. |
| Code freeze | ✅ Day 18 clean. |
| Reddit post ready | Draft committed Sep 24. Jack review + venue callouts by Oct 11. Add screenshot Oct 18 morning. |
| S-Hem spring hook | ✅ Day 3 of 8-week window. Timing is genuinely good. |
| `origin/master` footgun | 🔴 Day 9 decided, undone. 10 seconds. |
| Reddit social proof | ⚠️ No testimonials. Add one live screenshot before posting. |
| r/skiing post | ✅ Targeted for Nov 1. Draft needed by Oct 25. |

**For 8K not 5K:** VPS by Oct 4 (live fares). Screenshot in the Reddit post (proves the product is real). Jack present for the first 2 hours post-launch (threads die fast). Ski post Nov 1 when Tignes opens (second wave of traffic). That's the path.
