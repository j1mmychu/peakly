# Peakly — App Store Readiness Checklist (2026-07-24)

## 📍 Progress log
- **2026-07-24 (audit + photos):** Full line-by-line codebase audit → `AUDIT-2026-07-24.md`. **15 fixes applied in-tree** (4 P0s incl. wrong-day flight pricing, cloud-sync data loss, dead refresh button, latent WishlistsTab crash). **VPS confirmed HEALTHY over the network** — 44d uptime, wx_cache 595 (the "stale since 06-15" worry is dead). **Photo pipeline built** (`scripts/photos-fetch|review|apply.mjs`): catalog had 128 stock images across 358 venues with *zero* actually of the venue; first 28 marquee venues now carry real Unsplash photos of the real place (distinct 128→154, transpile clean). ⏳ Remaining ~330 venues need the fetch rerun — blocked on Unsplash production access (50/hr demo cap).
- **2026-07-24 (later):** App record CREATED — listing name "Peakly: Ski & Beach Weekends" ("Peakly" alone was taken; icon still says Peakly), bundle `com.stormpeak.peakly`, LLC live. **Screenshot generator shipped: `scripts/screenshots.mjs`** — serves dist/ locally, stubs weather/marine/flights with realistic July conditions (southern-hemisphere powder + sunny beaches), captures six 1320×2868 (6.9") PNGs into `app-store/screenshots/`. Jack runs: `cd ~/peakly && node scripts/screenshots.mjs`. Previews (videos) skipped for v1 — optional.
- **2026-07-24:** Apple Developer account LIVE — enrolled as **Storm Peak Capital, LLC** (Team ID `D56F6F959R`). "Peakly" name confirmed available in App Store Connect. `com.peakly.app` bundle ID found TAKEN globally → switched to **`com.stormpeak.peakly`**, updated across capacitor.config.json (root + ios copy), Xcode project.pbxproj (both configs), PUSH_SETUP.md, server/README.md. ⚠️ These code edits are uncommitted — need a push from the Mac. **Next up:** register `com.stormpeak.peakly` in the portal → create the app record → accept Free Apps agreement → then Phase 1 (airport-coords diff) + Phase 3 (Supabase SQL, VPS check).

Every item verified against the live repo today, not old agent reports. Ordered as the actual path to submission. **Bottom line: the code is ~95% ready. What's left is one 20-second code fix, a pile of Jack-only account/console work, and the review-risk prep.**

Legend: ✅ done/verified · 🔧 code work · 🧑 Jack-only manual · ⚠️ review risk to prep for

---

## Phase 1 — Code (the only real code work left)

- [ ] 🔧 **1. Apply the airport-coords fix (Open #18 — Day 38).** TGD/OKA/SID/DJE/FUE are still 0/5 present in `AIRPORT_COORDS` (re-verified today); 5 beach venues bypass the flight-time filter. The staged diff `reports/ready-to-ship/airport-coords-5-missing-2026-06-16.diff` still applies clean. Apply + push. 20 seconds. This ships before anything else.
- [ ] 🔧 **2. Rebuild the iOS web bundle.** `dist/` was last built Jun 14 — before the #18 fix. Run `node scripts/build-ios.mjs` after step 1 so the bundle matches. (The build script already handles App Store 2.5.2: pre-transpiled JSX, all vendors local, no CDN/Babel at runtime. ✅)
- [ ] 🔧 **3. Pick ONE native project and archive the other.** Verified: there are TWO native apps in the repo — the Capacitor project at `ios/` (complete: Xcode project, Info.plist, PrivacyInfo.xcprivacy, 1024 icon, splash) and `peakly-native/`, a separate Expo/React-Native app (own package.json, expo-router, RN 0.83). They are different codebases. Ship the Capacitor one (it wraps the real app); move `peakly-native/` aside so nobody builds the wrong thing. Note: `peakly-native/PUSH_SETUP.md` (the APNS runbook) should be kept.

✅ Already done in code (verified today): account-deletion UI + `deleteAccount()` flow · `ALERTS_AVAILABLE` iOS copy gating (8 refs) · `Capacitor.isNativePlatform()` push gates (3 sites) · cold-start/offline reviewer-proofing · location usage string in Info.plist · PrivacyInfo.xcprivacy · terms.html + privacy.html live · book_click analytics · version 1.0 (build 1) set.

## Phase 2 — Apple account ✅ DONE (2026-07-24: Peakly LLC enrolled, dev account live)

- [x] ✅ **4. Apple Developer Program enrollment — COMPLETE.** Enrolled as the LLC — seller will show as "Peakly LLC." The former long pole is gone; the critical path is now Phase 1 + Phases 3–5.
- [ ] 🧑 **5a. First login to App Store Connect.** [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → sign in with the enrolled Apple ID → accept the terms popup if it appears. Confirm your role shows as Account Holder.
- [ ] 🧑 **5b. Accept agreements.** Business (or "Agreements, Tax, and Banking") → **Free Apps agreement → Accept**. App is free, so skip the Paid Apps agreement and all banking/tax forms entirely.
- [ ] 🧑 **5c. Register the bundle ID: `com.stormpeak.peakly`.** ⚠️ 2026-07-24: `com.peakly.app` is TAKEN globally by another Apple account — new ID chosen and already updated throughout the code (capacitor configs + Xcode project + APNS docs). Portal: Identifiers → + → App IDs → App → Description "Peakly", Explicit `com.stormpeak.peakly` → Register (skip capabilities; addable later).
- [ ] 🧑 **5d. Create the app record.** App Store Connect → **My Apps → "+" → New App**: Platform **iOS** · Name **Peakly** (confirmed available 2026-07-24) · Primary language **English (U.S.)** · Bundle ID **com.stormpeak.peakly** · SKU **peakly-ios-001** · Full Access → Create. This claims the name.
- [ ] 🧑 **5e. Set pricing.** App record → Pricing and Availability → **Free** (price tier $0) → all territories → Save.

## Phase 3 — Backend one-timers (each is minutes)

- [ ] 🧑 **6. Paste `server/sql/delete-account.sql` into the Supabase SQL editor.** File verified present. Until this runs, "Delete account" shows the graceful fallback — a reviewer testing Guideline 5.1.1(v) could reject on it. One paste.
- [ ] 🧑 **7. SSH-verify the VPS** before submission: `ssh root@198.199.80.21 'pm2 status && curl -s http://localhost:3001/health'`. Last networked confirm was Jun 15 (~5 weeks ago). Sandbox can't reach it; has to be you.
- [ ] 🧑 **8. APNS — optional, explicitly NOT a blocker.** The `isNativePlatform` gate means iOS v1 ships without push (alerts copy is honesty-gated on iOS). If you want push in v1: create the .p8 key in the Apple Dev console + run the 5 `pm2 set` env calls per `peakly-native/PUSH_SETUP.md`. Otherwise skip and wire it in 1.1.

## Phase 4 — Build & device test (needs a Mac with Xcode)

- [ ] 🧑 **9. `npx cap sync ios`**, open `ios/App/App.xcworkspace` in Xcode, set your signing team (appears after Phase 2), build to a real iPhone.
- [ ] 🧑 **10. On-device test pass:**
  - Cold start with network OFF → venues render + "conditions unavailable" banner, no blank screen
  - Location prompt shows the right copy; decline path still works
  - Magic-link sign-in: tap the email link on-device and confirm it returns to the app and signs in (this flow has never been tested on a physical iPhone — the link opens the GitHub Pages URL, so confirm the session lands where the reviewer will look)
  - Delete account end-to-end (after step 6)
  - Book buttons open externally and come back cleanly
  - Safe-area insets on a notched phone

## Phase 5 — App Store Connect listing (app record already created in 5d)

- [ ] 🧑 **11. App Information:** in the app record → App Information → primary category **Travel**, secondary **Weather** → content rights: "does not contain third-party content" (venue photos are licensed/Unsplash — if any doubt, answer "contains" and affirm you have rights).
- [ ] 🧑 **12. Age rating questionnaire** (App Information → Age Rating → all "None" → lands 4+).
- [ ] 🧑 **13. Screenshots** — the biggest asset lift: 6.9" iPhone set required (6.5" auto-scales from it), 3–10 shots. **Decision:** the Xcode project supports iPad → iPad screenshots + iPad QA also required. Recommend setting the target to *iPhone-only* in Xcode to skip iPad entirely for v1.
- [ ] 🧑 **14. Copy:** app name (30 chars), subtitle (30 — e.g. "Ski & beach weekends, scored"), description, keywords (100 chars), promotional text, support URL (use the GitHub Pages site until peakly.app is registered), privacy policy URL (`https://j1mmychu.github.io/peakly/privacy.html`).
- [ ] 🧑 **15. App Privacy "nutrition label" questionnaire.** Declare: Email address (account creation, linked to user) · Coarse location (app functionality, not linked) · Product interaction (analytics — Plausible, not linked, no tracking). Answer **"No" to tracking** — nothing here meets Apple's ATT definition (affiliate outbound links don't count). Note: the *Expo* app.json has an ATT tracking-permission string, but that's the archived project — the Capacitor build has no ATT and needs none.
- [ ] 🧑 **16. Export compliance:** "uses encryption → standard HTTPS only → exempt." One dropdown.

## Phase 6 — Review-risk prep (where v1 submissions actually die)

- [ ] ⚠️ **17. Guideline 4.2 "minimum functionality" — the #1 rejection risk for a Capacitor/web-wrapper app.** Apple rejects apps that feel like a website in a shell. Your counters, put them in the Review Notes: works fully offline (native bundle, no CDN), native geolocation for home airport, native haptics, push architecture (even if gated), safe-area native UI. If rejected on 4.2, the standard recovery is adding one visibly native feature (widgets, live activities showing weekend score) and resubmitting — plan B, not plan A.
- [ ] ⚠️ **18. Reviewer sign-in credentials — magic-link-only auth is a known review pain.** Apple requires working demo credentials for any login. A magic link to *your* inbox doesn't work for a reviewer. Options: (a) state in Review Notes that sign-in is optional and every feature works anonymously (true — and the strongest play: tell them "no account needed, browse everything"), or (b) build a hidden reviewer bypass. Go with (a); make sure it's accurate on-device.
- [ ] ⚠️ **19. Sign in with Apple — verified NOT required.** Guideline 4.8 only triggers on third-party/social login; email magic link is exempt. No work needed. ✅
- [ ] ⚠️ **20. 5.1.1(v) account deletion — covered once step 6 is done.** Deletion is in-app, not a web redirect. ✅ code-side.
- [ ] ⚠️ **21. Review Notes to write:** what the app does in 2 sentences · sign-in is optional per #18 · location is one-time for airport detection · alerts/push gated off on iOS pending APNS (so they don't hunt for a broken feature) · test-fire endpoint info if APNS is wired (`ALERTS_TEST_ENABLED`).

## Phase 7 — Submit & after

- [ ] 🧑 **22. Upload build via Xcode → TestFlight** first. Install via TestFlight yourself, run the Phase 4 checklist once more on the exact binary you'll submit.
- [ ] 🧑 **23. Submit for review.** Typical wait: 24–48h. First submissions get more scrutiny — expect one rejection round; answer fast, resubmissions go quicker.
- [ ] 🧑 **24. Post-approval housekeeping (not blockers):** register `peakly.app` · replace GetYourGuide/Backcountry placeholder affiliate IDs · Google Play via TWA ($25) · wire APNS for 1.1 · and the standing open business call — **summer Reddit launch vs PM's winter-pivot plan (decision date 7/13 came and went; App Store timing is actually an argument FOR the winter pivot: review + iteration time lands you live before ski season).**

---

**Critical path (updated 2026-07-24 — Apple account DONE):** Steps 5a–5e claim the name + accept agreements (15 min, do today) → Step 1 airport-coords diff (20 sec) → Steps 6–7 Supabase SQL + VPS check (10 min) → Steps 2, 9–10 build + device test (an afternoon) → Steps 11–16 + screenshots (an evening) → TestFlight → submit. **Nothing is waiting on Apple anymore — this is now ~2 focused days of work + review time (24–48h). Realistic: live within a week.**
