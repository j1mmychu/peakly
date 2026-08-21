import WidgetKit
import SwiftUI

// MARK: - Shared model
//
// Mirrors exactly what app.jsx writes via PeaklyWidgetBridge.save().
// Every field is optional-tolerant: the widget must never crash or blank out
// because a fare was missing or the app wrote an older schema.

struct WeekendPick: Codable {
    var venue: String?
    var location: String?
    var score: Int?
    var label: String?          // "GO" / "Worth it" / etc.
    var conditions: String?     // "8\" fresh · 31°F"
    var price: Int?             // round-trip, USD
    var isEstimate: Bool?       // true → render "~$312"
    var dates: String?          // "Fri 24 – Mon 27"
    var category: String?       // "skiing" | "beach"
    var updatedAt: Double?      // epoch ms, for the staleness note
    var venueId: String?        // deep link target
}

enum WidgetStore {
    static let appGroup = "group.com.stormpeak.peakly"
    static let payloadKey = "peakly_widget_payload"

    static func load() -> WeekendPick? {
        guard
            let defaults = UserDefaults(suiteName: appGroup),
            let json = defaults.string(forKey: payloadKey),
            let data = json.data(using: .utf8),
            let pick = try? JSONDecoder().decode(WeekendPick.self, from: data)
        else { return nil }
        return pick
    }
}

// MARK: - Timeline
//
// The app writes the payload; the widget only re-reads it. A 1-hour cadence is
// plenty (weather scores move slowly) and costs no network or battery, and the
// bridge calls reloadTimelines() for an immediate update whenever the app runs.

struct Entry: TimelineEntry {
    let date: Date
    let pick: WeekendPick?
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> Entry {
        Entry(date: Date(), pick: WeekendPick(
            venue: "Whistler Blackcomb", location: "BC, Canada",
            score: 92, label: "GO", conditions: "8\" fresh · 31°F",
            price: 312, isEstimate: false, dates: "Fri – Mon",
            category: "skiing", updatedAt: Date().timeIntervalSince1970 * 1000,
            venueId: "whistler"))
    }

    func getSnapshot(in context: Context, completion: @escaping (Entry) -> Void) {
        completion(Entry(date: Date(), pick: WidgetStore.load() ?? placeholder(in: context).pick))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
        let entry = Entry(date: Date(), pick: WidgetStore.load())
        let next = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date().addingTimeInterval(3600)
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

// MARK: - Design tokens (match the web app)

private enum Brand {
    static let blue = Color(red: 0.008, green: 0.518, blue: 0.780)   // #0284c7
    static let go = Color(red: 0.086, green: 0.639, blue: 0.290)     // #16a34a
    static let ink = Color(red: 0.133, green: 0.133, blue: 0.133)    // #222
    static let sub = Color(red: 0.443, green: 0.443, blue: 0.443)    // #717171
}

private func scoreColor(_ s: Int) -> Color {
    s >= 85 ? Brand.go : s >= 70 ? Brand.blue : Brand.sub
}

// MARK: - Views

struct EmptyStateView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Peakly").font(.system(size: 13, weight: .heavy)).foregroundColor(Brand.blue)
            Spacer(minLength: 0)
            Text("Open Peakly to find your weekend")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(Brand.sub)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

struct SmallView: View {
    let pick: WeekendPick

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 4) {
                Text(pick.category == "beach" ? "🏖" : "🎿").font(.system(size: 11))
                Text("THIS WEEKEND")
                    .font(.system(size: 9, weight: .heavy))
                    .foregroundColor(Brand.sub)
                    .tracking(0.4)
            }

            Spacer(minLength: 4)

            HStack(alignment: .firstTextBaseline, spacing: 3) {
                Text("\(pick.score ?? 0)")
                    .font(.system(size: 40, weight: .heavy, design: .rounded))
                    .foregroundColor(scoreColor(pick.score ?? 0))
                Text("/100").font(.system(size: 11, weight: .bold)).foregroundColor(Brand.sub)
            }

            Text(pick.venue ?? "—")
                .font(.system(size: 14, weight: .heavy))
                .foregroundColor(Brand.ink)
                .lineLimit(1)
                .minimumScaleFactor(0.8)

            if let loc = pick.location {
                Text(loc).font(.system(size: 10)).foregroundColor(Brand.sub).lineLimit(1)
            }

            if let cond = pick.conditions {
                Text(cond).font(.system(size: 10, weight: .semibold)).foregroundColor(Brand.ink).lineLimit(1)
            }

            Spacer(minLength: 4)

            if let price = pick.price {
                Text("\(pick.isEstimate == true ? "~" : "")$\(price)")
                    .font(.system(size: 13, weight: .heavy))
                    .foregroundColor(Brand.blue)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

struct MediumView: View {
    let pick: WeekendPick

    var body: some View {
        HStack(spacing: 14) {
            // Score block
            VStack(spacing: 2) {
                Text("\(pick.score ?? 0)")
                    .font(.system(size: 44, weight: .heavy, design: .rounded))
                    .foregroundColor(scoreColor(pick.score ?? 0))
                if let label = pick.label {
                    Text(label.uppercased())
                        .font(.system(size: 9, weight: .heavy))
                        .foregroundColor(.white)
                        .padding(.horizontal, 7).padding(.vertical, 3)
                        .background(Capsule().fill(scoreColor(pick.score ?? 0)))
                }
            }
            .frame(width: 78)

            // Detail block
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 4) {
                    Text(pick.category == "beach" ? "🏖" : "🎿").font(.system(size: 10))
                    Text("YOUR BEST WEEKEND")
                        .font(.system(size: 9, weight: .heavy))
                        .foregroundColor(Brand.sub).tracking(0.4)
                }

                Text(pick.venue ?? "—")
                    .font(.system(size: 17, weight: .heavy))
                    .foregroundColor(Brand.ink)
                    .lineLimit(1).minimumScaleFactor(0.75)

                if let loc = pick.location {
                    Text(loc).font(.system(size: 11)).foregroundColor(Brand.sub).lineLimit(1)
                }

                if let cond = pick.conditions {
                    Text(cond).font(.system(size: 11, weight: .semibold))
                        .foregroundColor(Brand.ink).lineLimit(1)
                }

                Spacer(minLength: 2)

                HStack(spacing: 6) {
                    if let price = pick.price {
                        Text("\(pick.isEstimate == true ? "~" : "")$\(price)")
                            .font(.system(size: 15, weight: .heavy))
                            .foregroundColor(Brand.blue)
                    }
                    if let dates = pick.dates {
                        Text(dates).font(.system(size: 11)).foregroundColor(Brand.sub).lineLimit(1)
                    }
                }
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

struct PeaklyWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    var entry: Entry

    var body: some View {
        Group {
            if let pick = entry.pick, pick.venue != nil {
                switch family {
                case .systemSmall: SmallView(pick: pick)
                default:           MediumView(pick: pick)
                }
            } else {
                EmptyStateView()
            }
        }
        // Deep-links straight to the venue sheet; app.jsx already parses #venue-<id>.
        .widgetURL(URL(string: "peakly://open?venue=\(entry.pick?.venueId ?? "")"))
        .widgetBackgroundCompat()
    }
}

// iOS 17 requires containerBackground for the widget to render its background
// at all; on 14–16 the modifier doesn't exist. This keeps one codebase valid
// for both without #available scattered through the view body.
private extension View {
    @ViewBuilder func widgetBackgroundCompat() -> some View {
        if #available(iOS 17.0, *) {
            self.containerBackground(.fill.tertiary, for: .widget)
        } else {
            self.padding(14)
        }
    }
}

// MARK: - Widget

@main
struct PeaklyWidget: Widget {
    let kind = "PeaklyWeekendWidget"   // must match the bridge's reloadTimelines(ofKind:)

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            PeaklyWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Best Weekend")
        .description("The top-scoring ski or beach weekend you can actually fly to.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
