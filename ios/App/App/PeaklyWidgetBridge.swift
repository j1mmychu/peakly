import Foundation
import Capacitor
import WidgetKit

/// Bridge between the web app and the home-screen widget.
///
/// The widget cannot read the WKWebView's localStorage — extensions run in a
/// separate process with their own container. The only shared surface is an
/// App Group, so the web app hands its top weekend pick to this plugin and we
/// write it into the shared UserDefaults suite that the widget reads.
///
/// Deliberately written as a local plugin (no npm package) to respect the
/// project's "no new dependencies" rule. Capacitor auto-registers any
/// CAPPlugin subclass compiled into the app target.
@objc(PeaklyWidgetBridge)
public class PeaklyWidgetBridge: CAPPlugin {

    /// Must match the App Group added to BOTH the app and widget targets.
    static let appGroup = "group.com.stormpeak.peakly"
    static let payloadKey = "peakly_widget_payload"

    /// JS: Capacitor.Plugins.PeaklyWidgetBridge.save({ payload: "<json string>" })
    ///
    /// Takes a pre-serialized JSON string rather than a dictionary so the web
    /// side owns the schema and we never have to keep two models in sync.
    @objc func save(_ call: CAPPluginCall) {
        guard let payload = call.getString("payload") else {
            call.reject("payload (JSON string) is required")
            return
        }
        guard let defaults = UserDefaults(suiteName: Self.appGroup) else {
            // Almost always means the App Group capability is missing from the
            // app target, or the identifier doesn't match the widget's.
            call.reject("App Group \(Self.appGroup) unavailable — check Signing & Capabilities on the App target")
            return
        }

        defaults.set(payload, forKey: Self.payloadKey)

        // Ask WidgetKit to rebuild the timeline so the change shows up now
        // instead of at the next scheduled refresh.
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadTimelines(ofKind: "PeaklyWeekendWidget")
        }

        call.resolve(["saved": true])
    }

    /// Lets the web app show "Add to Home Screen" guidance only where it applies.
    @objc func isAvailable(_ call: CAPPluginCall) {
        if #available(iOS 14.0, *) {
            call.resolve(["available": true])
        } else {
            call.resolve(["available": false])
        }
    }
}
