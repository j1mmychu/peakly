#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Capacitor 6 discovers plugins through the Objective-C runtime, so a Swift
// CAPPlugin still needs this macro block to expose its methods to JS.
// Without it the plugin compiles fine but never appears on Capacitor.Plugins.
CAP_PLUGIN(PeaklyWidgetBridge, "PeaklyWidgetBridge",
    CAP_PLUGIN_METHOD(save, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(isAvailable, CAPPluginReturnPromise);
)
