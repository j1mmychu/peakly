# Peakly home-screen widget — setup

All the code is written. What's left is Xcode wiring, which has to be done through the GUI: adding a target rewrites `project.pbxproj`, and hand-editing that file is the classic way to corrupt an Xcode project. **~15 minutes, once.**

## What you're building

A native WidgetKit widget showing your best weekend pick — venue, score, conditions, round-trip fare. Small and Medium sizes. Tapping it deep-links straight into that venue's detail sheet.

**Why it matters beyond the feature itself:** it's the strongest available answer to App Store Guideline 4.2 ("minimum functionality"), the top rejection risk for a Capacitor app. A widget is unambiguously native and cannot be replicated by a website — worth calling out explicitly in your Review Notes.

## Files already in the repo

| File | Purpose |
|---|---|
| `ios/App/App/PeaklyWidgetBridge.swift` | Capacitor plugin — receives the pick from JS, writes it to the shared App Group, tells WidgetKit to reload |
| `ios/App/App/PeaklyWidgetBridge.m` | Registers the Swift plugin with Capacitor's ObjC runtime (without this the plugin silently never appears in JS) |
| `ios/App/App/App.entitlements` | App Group for the main app |
| `ios/PeaklyWidget/PeaklyWidget.swift` | The widget: model, timeline provider, SwiftUI small + medium layouts |
| `ios/PeaklyWidget/PeaklyWidget.entitlements` | App Group for the widget |
| `ios/PeaklyWidget/Info.plist` | Widget extension manifest |
| `app.jsx` | Writes the top pick after every scoring pass; handles `peakly://` taps |
| `ios/App/App/Info.plist` | `peakly://` URL scheme registered |

---

## Step 1 — Create the widget target

1. Open `ios/App/App.xcworkspace` (the **workspace**, not the project).
2. **File → New → Target… → iOS → Widget Extension** → Next.
3. Product Name: **`PeaklyWidget`** (exactly — it must match the folder).
4. **Uncheck** "Include Configuration App Intent" (we use a static widget) and **uncheck** "Include Live Activity".
5. Finish. When Xcode offers to **activate the new scheme**, click **Activate**.

Xcode generates placeholder files. Delete them (`PeaklyWidget.swift`, `PeaklyWidgetBundle.swift`, and its `Info.plist` if created) — **Move to Trash** — then in Finder drag the repo's real `ios/PeaklyWidget/PeaklyWidget.swift` and `Info.plist` into the target, checking **"Copy items if needed"** is *off* and that **Target Membership = PeaklyWidget only**.

> Tip: click each file and confirm the right-hand **Target Membership** checkbox. Widget files must belong to `PeaklyWidget` only; the bridge files to `App` only. Mixed membership causes "duplicate symbol" or "cannot find type" errors.

## Step 2 — Set the widget's deployment target

Select the **PeaklyWidget** target → **General** → **Minimum Deployments → iOS 17.0**.
(The main app stays at 13.0. The widget code compiles for 14+, but 17 gets `containerBackground` and StandBy support.)

## Step 3 — Add the App Group to BOTH targets

This is the part that silently breaks everything if missed — it's how the app and widget share data.

For the **App** target *and* the **PeaklyWidget** target:

1. Select the target → **Signing & Capabilities** → **+ Capability** → **App Groups**.
2. Click **+** under App Groups and enter: **`group.com.stormpeak.peakly`**
3. Make sure the checkbox next to it is **ticked** on both targets.

Xcode will generate/overwrite `.entitlements` files. The repo versions already contain the right value — if Xcode made new ones, just confirm the group string matches exactly.

## Step 4 — Add the bridge to the App target

If `PeaklyWidgetBridge.swift` and `.m` aren't already in the **App** target (check Target Membership), drag them into `ios/App/App/` in Xcode with membership = **App**.

When Xcode asks about creating a **bridging header**, choose **Create** — Capacitor's ObjC macros need it. If a bridging header already exists, ensure it contains:
```objc
#import <Capacitor/Capacitor.h>
```

## Step 5 — Build and test

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

That's the empty state — it means no payload was found. In order of likelihood:

1. **App Group mismatch.** Most common by far. Verify the identifier is byte-identical on both targets, including `group.` prefix.
2. **App hasn't scored yet.** The bridge only writes venues with a real score, a non-"Loading…" label, and confidence above `low` — same standard the front page holds. Open the app, wait for cards to populate, then background it.
3. **Plugin not registered.** In Safari Web Inspector on the device, run `Object.keys(window.Capacitor.Plugins)` — `PeaklyWidgetBridge` must be listed. If missing, the `.m` file isn't in the App target.
4. **Wrong kind string.** `PeaklyWidget.swift`'s `let kind` and the bridge's `reloadTimelines(ofKind:)` must both read `PeaklyWeekendWidget`.

## Notes

- **Data freshness:** the widget reflects the last time the app ran. It refreshes its timeline hourly from stored data (no network, no battery cost), and updates immediately whenever you open the app. If you later want it fresh without the app being opened, that needs a small JSON endpoint on the VPS and a `URLSession` fetch in the timeline provider.
- **App Store:** the widget ships inside the app binary — no separate submission. Add one widget screenshot to the listing; Apple likes seeing it.
- **The `updatedAt` field** is written but not yet displayed. If picks ever feel stale, surfacing "as of Fri 6pm" in the medium layout is a two-line change.
