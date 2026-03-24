# Report: 2026-03-23

**Peakly Growth Report | Head of Growth | Target: 100K Downloads**

---

## Growth Stage: Pre-launch (Week 2)

Peakly has a working product on GitHub Pages with foundational sharing infrastructure now in place. OG tags and share links are fixed. Still no PWA, no app store presence, no analytics, no real push notifications. We have a functional prototype with good UX but zero distribution engine. The gap between "works" and "grows" is still wide.

---

## Fixes Verified

| Item | Status | Notes |
|------|--------|-------|
| Dead share links (peakly.app) | FIXED | All share URLs now point to `j1mmychu.github.io/peakly`. Zero references to dead domain in codebase. |
| OG meta tags | LIVE | og:title, og:description, og:type, og:url, og:image, og:site_name all present in live HTML. Twitter Card tags (summary_large_image) also live. |
| OG image (og-image.png) | BROKEN (404) | The `og:image` tag references `/peakly/og-image.png` but the file does not exist. Social previews on Slack, iMessage, Twitter, LinkedIn will show NO image. This kills share conversion. **Must fix immediately.** |
| Share mechanism (app.jsx) | WORKING | Two share paths: (1) Profile tab "Share Peakly" button uses navigator.share with fallback to clipboard, (2) VenueDetailSheet has "Share & Invite" panel with copy-link and card-text sharing. Both use correct GitHub Pages URL. |
| PWA manifest | STILL MISSING | No manifest.json, no service worker, no apple-touch-icon. App cannot be installed to home screen. |
| Push notifications | UI ONLY | Three notification toggles in Profile (Peak conditions, Flight deals, Weekly digest) save to localStorage but do nothing. No service worker, no push subscription. Pure theater. |

**Net assessment:** Share infrastructure went from broken to 80% working. The missing OG image is the one remaining blocker for social sharing effectiveness.

---

## Top 3 Competitors

### 1. Surfline ($99.99/yr, 950+ live cams)
**What they do better:**
- 16-day surf forecasts from proprietary models. We use free Open-Meteo data with basic scoring.
- 950+ live surf cams worldwide. We have zero live visual content.
- Mobile-native app with push alerts that actually work. Our alerts are localStorage theater.
- **Threat level:** High for our surf vertical. They own the forecast game.

### 2. OpenSnow ($49.99-$99.99/yr, proprietary PEAKS model)
**What they do better:**
- Proprietary PEAKS forecasting model that's 50% more accurate in mountain terrain than standard weather models. We rely on generic Open-Meteo.
- Powder alerts that actually push to phone. Ours save to localStorage and do nothing.
- Deep resort partnerships and community trust built over years.
- **Threat level:** High for our ski vertical. They're the standard.

### 3. da Surf Engine (Free, 8,000+ surf breaks)
**What they do better:**
- Search across 8,000 surf breaks with granular criteria (wave type, water temp, difficulty, season). We have ~235 total venues across all categories.
- "Sand Bucket List" feature — a wishlist with gamification (check off as you go). Our wishlists exist but have no gamification.
- Community-driven discovery that creates content flywheel.
- **Threat level:** Medium. They're discovery-focused like us but surf-only. Our cross-sport positioning (surf + ski + beach + conditions + flights) is genuinely different.

### Our Competitive Advantage
None of these competitors combine conditions + flight pricing + multi-sport in one view. Surfline doesn't show flight deals. OpenSnow doesn't know about surf. da Surf Engine doesn't price flights. **Peakly's unique value is the intersection** — "conditions are perfect AND flights are cheap." That cross-category, travel-integrated angle is our moat. But we need to actually deliver on it (real alerts, real push, real flight price tracking) before it's defensible.

---

## This Week's Growth Experiment

**Experiment: OG Image + Reddit Soft Launch**

1. Create a 1200x630 OG image (Peakly logo + hero screenshot + tagline "Adventure When Conditions Align") and commit to repo. This unblocks social sharing — every link shared to Reddit, Slack, iMessage, Twitter will show a rich preview instead of nothing.

2. Write 3 Reddit posts for r/surfing, r/skiing, and r/digitalnomad. Format: "I built a free tool that shows you when conditions are perfect AND flights are cheap — here's [destination] this week." Include a real example with live scores from the app. Link to the GitHub Pages URL.

**Hypothesis:** Rich social previews + authentic Reddit posts to niche communities will generate 200-500 first visits and validate which sport vertical has the most pull.

**Success metric:** 3-day unique visitors > 300 (measured via adding a simple analytics pixel or Plausible/Umami).

**Prerequisite:** We need analytics. Zero visibility into traffic right now. Add Plausible (free for <10K/mo) or a simple hit counter before running any experiment.

---

## Distribution Recommendation

**Focus: PWA + Niche Community Seeding**

Priority order:
1. **This week:** Fix OG image (30 min), add Plausible analytics (30 min), Reddit soft launch (2 hrs)
2. **Next week:** PWA manifest + service worker + install prompt (2-3 days). This unlocks home screen install, offline mode, and push notification infrastructure.
3. **Week 3-4:** Real push notifications for condition alerts. Convert the existing alert UI from theater to functional. This is the retention unlock.

**Do NOT pursue** App Store or ProductHunt yet. We have no analytics, no retention data, and no viral loop. Launching on PH without those is wasting a one-shot opportunity.

**Do NOT pursue** paid ads. CAC would be infinite with current retention.

---

## Retention Score: 3.5/10

| Factor | Score | Reason |
|--------|-------|--------|
| Core value loop | 5/10 | Browsing venues with live scores is genuinely interesting. But scores are identical every visit unless weather changes. |
| Reason to return daily | 2/10 | No push notifications, no daily digest, no "conditions changed" trigger. User must remember to open app. |
| Notification system | 1/10 | Three toggle switches that save to localStorage and do nothing. Zero re-engagement capability. |
| Personalization | 4/10 | Onboarding captures sports, skill level, home airport. Profile persists. But doesn't visibly change the experience enough. |
| Data lock-in | 3/10 | Wishlists, named lists, alerts, trips all saved locally. Some switching cost, but localStorage is fragile (one browser clear = gone). |
| Social/community | 1/10 | No comments, no reviews, no social features, no friend activity. Solo experience only. |
| Content freshness | 5/10 | Weather scores update via API on each visit. Flight prices update. This is the one thing that's genuinely dynamic. |

**Up from 3/10 last report** — small bump because share links now work and OG tags are live, which enables the possibility of re-engagement via shared links from friends. But the fundamental problem remains: there is no automated reason for a user to come back. Until push notifications work, retention is manual.

---

## Decision Made

**Create the OG image and add analytics this week. No other growth work until we can measure.**

We cannot run experiments, validate channels, or calculate retention without analytics. Flying blind. Adding Plausible (privacy-friendly, no cookie banner needed, free tier) takes 30 minutes and gives us: visitor count, referral sources, top pages, device breakdown. This is decision #1 because everything else depends on it.

The OG image is decision #1b because it's the single highest-ROI fix remaining — every social share is currently generating a blank preview card, which tanks click-through rate by 50-80% vs. a rich preview.

---

## 90-Day Projection

**If we execute:**

| Week | Milestone | Cumulative Users |
|------|-----------|-----------------|
| 1-2 | OG image + analytics + Reddit soft launch | 300-500 |
| 3-4 | PWA shipped, install prompt, real push notifications | 800-1,500 |
| 5-6 | Push notifications live, condition alerts actually fire | 2,000-3,000 |
| 7-8 | Second Reddit/community push with "PWA install" CTA, TikTok test (screen recording of app finding cheap flights to epic conditions) | 5,000-8,000 |
| 9-12 | ProductHunt launch (timed with a feature drop), email capture, weekly digest emails | 10,000-20,000 |

**Realistic 90-day number: 8,000-15,000 users.**

We will NOT hit 100K in 90 days. That target requires either (a) a viral moment (TikTok, HackerNews front page), (b) app store presence with ASO, or (c) paid acquisition with proven retention. We have none of those yet.

**Path to 100K (6-9 months):**
The 100K target requires PWA-to-app-store pipeline (TWA for Android, Safari PWA for iOS), a working viral loop (share a venue card that looks amazing in social previews + deep links back to the venue), and retention above 20% D7. Current estimated D7 retention: ~5%. The push notification infrastructure is the single biggest lever for retention, which is the single biggest lever for growth.

---

## Critical Blockers (Action Items for Jack)

1. **OG image:** Need a 1200x630px image committed as `og-image.png` at repo root. Can be a screenshot of the app with logo overlay. Without this, every social share is a blank card.
2. **Analytics:** Add Plausible or Umami script tag to index.html. One line of code. Without this, we're guessing.
3. **PWA:** manifest.json + service worker. This is the foundation for push notifications, home screen install, and offline. 2-3 day effort.

---

*Next report: 2026-03-30*
