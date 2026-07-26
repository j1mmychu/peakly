# Peakly home-screen widget — setup

All the code is written. Two scripts do the project wiring; one Xcode step remains for signing, which can't be automated. **~5 minutes.**

## What you're building

A native WidgetKit widget showing your best weekend pick — venue, score, conditions, round-trip fare. Small and Medium sizes. Tapping it deep-links straight into that venue's detail sheet.

**Why it matters beyond the feature itself:** it's the strongest available answer to App Store Guideline 4.2 ("minimum functionality"), the top rejection risk for a Capacitor app. A widget is unambiguously native and cannot be replicated by a website — worth calling out explicitly in your Review Notes.

## Files already in the repo

| File | Purpose |
|---|---|
| `ios/App/App/PeaklyWidgetBridge.swift` | Capacitor plugin — receives the pick from JS, writes it to the shared App Group, tells WidgetKit to reload |
| `ios/App/App/PeaklyWidgetBridge.m` | Registers the Swift plugin with Capacitor's ObjC runtime (without this the plugin silently never appears in JS) |
| `ios/App/App/App.entitlements` | App Group for the main app |
| `ios/App/PeaklyWidget/PeaklyWidget.swift` | The widget: model, timeline provider, SwiftUI small + medium layouts |
| `ios/App/PeaklyWidget/PeaklyWidget.entitlements` | App Group for the widget |
| `ios/App/PeaklyWidget/Info.plist` | Widget extension manifest |
| `app.jsx` | Writes the top pick after every scoring pass; handles `peakly://` taps |
| `ios/App/App/Info.plist` | `peakly://` URL scheme registered |

---

## Step 1 — Add the target (scripted)

Run from the repo root:

```
ruby scripts/add-widget-target.rb    # creates + embeds the widget extension
ruby scripts/add-widget-bridge.rb    # compiles the Capacitor bridge into the app
```

Both are needed. The first creates the widget; the second makes sure `PeaklyWidgetBridge.swift/.m` are actually compiled — dropping files into `ios/App/App/` on disk does **not** add them to the Xcode project, and without them the widget would show its empty state forever with no error to explain why.

This uses `xcodeproj` — the same library CocoaPods uses to rewrite Xcode projects — to create the extension target, set its build settings, wire the source file, embed it in the app, and point both targets at their entitlements. It backs up `project.pbxproj` first, is safe to re-run, and verifies its own work before exiting.

If the gem is missing: `sudo gem install xcodeproj` (or `sudo gem install cocoapods`).

If anything goes wrong it prints the exact `cp` command to restore the backup — and `git checkout ios/App/App.xcodeproj/project.pbxproj` also works.

## Step 2 — Signing + App Group (Xcode GUI — can't be scripted)

The entitlement *files* are already correct; this step tells Apple's provisioning system about them, which only Xcode can do.

Open `ios/App/App.xcworkspace`, then for **both** the `App` and `PeaklyWidget` targets:

1. Select the target → **Signing & Capabilities**
2. Confirm **Team** is Storm Peak Capital and **Automatically manage signing** is ticked
3. **+ Capability → App Groups** → tick `group.com.stormpeak.peakly`
   (If it's not listed, click **+** under App Groups and type it exactly.)

> This is the step that silently breaks the widget if skipped or mistyped. The app writes to that group and the widget reads from it — a mismatch means the widget just shows its empty state forever, with no error anywhere.

## Step 3 — Build and test

```
cd ~/peakly
node scripts/build-ios.mjs     # refresh the offline web bundle
npx cap sync ios
```

Then in Xcode: select the **App** scheme → run on a real device (widgets work in the simulator, but fares and location behave better on hardware).

1. Launch Peakly, let venues score (~10 seconds).
2. Background the app.
3. Long-press the home screen → **+** → search **Peakly** → add the **Best Weekend** widget.
4. It should show your top pick within a few seconds.
5. Tap it → the app opens directly to that venue's detail sheet.

---

## If the widget shows "Open Peakly to find your weekend"

That's the empty state — no payload was found in the App Group. In order of likelihood:

1. **`PeaklyWidgetBridge` missing from `packageClassList`.** ← this was the real bug, and it costs hours because there is no error anywhere.

   Verified against `@capacitor/ios` 6.2.1 source (`CapacitorBridge.swift:287`): Capacitor does **not** scan the Objective-C runtime for `CAPPlugin` subclasses. It reads `capacitor.config.json` from the app bundle and instantiates **only** the class names in `packageClassList` — a list `npx cap sync` generates from Capacitor packages in `node_modules`.

   Our bridge lives in the app target, not an npm package, so sync never lists it. The plugin then simply doesn't exist at runtime: correct `@objc` name, `CAPBridgedPlugin` conformance, compiled into the target, entitlements all fine — and `window.Capacitor.Plugins` still won't contain it, with no error logged.

   Fix (idempotent, already wired into `npm run cap:sync`):
   ```
   node scripts/register-widget-plugin.mjs
   ```
   Then verify `ios/App/App/capacitor.config.json` lists `PeaklyWidgetBridge`, and rebuild.

   **Any bare `npx cap sync ios` regenerates that file and drops the registration.** Use `npm run cap:sync`, or rerun the script after.

2. **App Group mismatch.** The identifier must be byte-identical on both targets, `group.` prefix included.

3. **App hasn't scored yet.** The bridge only writes a venue with a real score, a non-"Loading…" label, and confidence above `low` — the same bar the front page holds itself to. Open the app, wait for cards, then background it.

4. **Wrong kind string.** `PeaklyWidget.swift`'s `let kind` and the bridge's `reloadTimelines(ofKind:)` must both read `PeaklyWeekendWidget`.

### Diagnosing quickly

With the app running, in Safari (Develop → iPhone → Peakly) console:

```js
Object.keys(window.Capacitor.Plugins)          // PeaklyWidgetBridge must appear
```

Note that a **native-only plugin is not auto-exposed on `Capacitor.Plugins`** either — the JS proxy is created with `Capacitor.registerPlugin("PeaklyWidgetBridge")`, which is what `app.jsx` does. Both conditions must hold: registered natively (packageClassList) *and* proxied in JS (registerPlugin).

## Notes

- **Data freshness:** the widget reflects the last time the app ran. It refreshes its timeline hourly from stored data (no network, no battery cost), and updates immediately whenever you open the app. If you later want it fresh without the app being opened, that needs a small JSON endpoint on the VPS and a `URLSession` fetch in the timeline provider.
- **App Store:** the widget ships inside the app binary — no separate submission. Add one widget screenshot to the listing; Apple likes seeing it.
- **The `updatedAt` field** is written but not yet displayed. If picks ever feel stale, surfacing "as of Fri 6pm" in the medium layout is a two-line change.
