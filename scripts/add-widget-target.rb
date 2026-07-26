#!/usr/bin/env ruby
# Adds the PeaklyWidget WidgetKit extension target to ios/App/App.xcodeproj.
#
# Uses the `xcodeproj` gem — the same library CocoaPods uses to rewrite Xcode
# projects — instead of hand-editing project.pbxproj, which is how projects get
# corrupted. You already have the gem if you've ever run `pod install`; if not:
#   sudo gem install xcodeproj
#
# Run from the repo root:
#   ruby scripts/add-widget-target.rb
#
# Safe to re-run: it detects an existing PeaklyWidget target and exits rather
# than duplicating. Backs up project.pbxproj before touching anything.

require 'fileutils'

begin
  require 'xcodeproj'
rescue LoadError
  abort <<~MSG
    Missing the `xcodeproj` gem.

      sudo gem install xcodeproj

    (It ships with CocoaPods, so `sudo gem install cocoapods` also works.)
  MSG
end

ROOT        = File.expand_path('..', __dir__)
PROJECT     = File.join(ROOT, 'ios/App/App.xcodeproj')
APP_TARGET  = 'App'
WIDGET      = 'PeaklyWidget'
APP_BUNDLE  = 'com.stormpeak.peakly'
APP_GROUP   = 'group.com.stormpeak.peakly'
WIDGET_DIR  = File.join(ROOT, 'ios/App/PeaklyWidget')

abort "Xcode project not found at #{PROJECT}" unless Dir.exist?(PROJECT)
%w[PeaklyWidget.swift Info.plist PeaklyWidget.entitlements].each do |f|
  abort "Missing #{WIDGET_DIR}/#{f}" unless File.exist?(File.join(WIDGET_DIR, f))
end

pbx = File.join(PROJECT, 'project.pbxproj')
backup = "#{pbx}.backup-#{Time.now.strftime('%Y%m%d-%H%M%S')}"
FileUtils.cp(pbx, backup)
puts "backup → #{File.basename(backup)}"

project = Xcodeproj::Project.open(PROJECT)
app = project.targets.find { |t| t.name == APP_TARGET }
abort "No '#{APP_TARGET}' target in the project" unless app

if project.targets.any? { |t| t.name == WIDGET }
  puts "'#{WIDGET}' target already exists — nothing to do."
  exit 0
end

# ── 1. Create the extension target ───────────────────────────────────────────
widget = project.new_target(:app_extension, WIDGET, :ios, '17.0', nil, :swift)

widget.build_configurations.each do |config|
  s = config.build_settings
  s['PRODUCT_BUNDLE_IDENTIFIER']    = "#{APP_BUNDLE}.#{WIDGET}"
  s['PRODUCT_NAME']                 = '$(TARGET_NAME)'
  s['INFOPLIST_FILE']               = 'PeaklyWidget/Info.plist'
  s['CODE_SIGN_ENTITLEMENTS']       = 'PeaklyWidget/PeaklyWidget.entitlements'
  s['IPHONEOS_DEPLOYMENT_TARGET']   = '17.0'
  s['TARGETED_DEVICE_FAMILY']       = '1'          # iPhone only, matches the app
  s['SWIFT_VERSION']                = '5.0'
  s['SKIP_INSTALL']                 = 'YES'        # required for extensions
  s['CODE_SIGN_STYLE']              = 'Automatic'
  s['GENERATE_INFOPLIST_FILE']      = 'NO'         # we ship our own
  s['MARKETING_VERSION']            = '1.0'
  s['CURRENT_PROJECT_VERSION']      = '1'
  s['ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES'] = 'NO'
  s['LD_RUNPATH_SEARCH_PATHS']      = ['$(inherited)', '@executable_path/Frameworks',
                                       '@executable_path/../../Frameworks']
end

# ── 2. Register the source + resources ───────────────────────────────────────
group = project.main_group.find_subpath('PeaklyWidget', true)
group.set_source_tree('SOURCE_ROOT')
group.set_path('PeaklyWidget')

swift_ref = group.new_reference('PeaklyWidget.swift')
widget.add_file_references([swift_ref])

# Info.plist and .entitlements are referenced by build setting, not compiled —
# add them to the group for visibility only.
group.new_reference('Info.plist')
group.new_reference('PeaklyWidget.entitlements')

# ── 3. Embed the extension in the app and depend on it ───────────────────────
app.add_dependency(widget)

embed = app.build_phases.find { |p|
  p.is_a?(Xcodeproj::Project::Object::PBXCopyFilesBuildPhase) && p.name == 'Embed App Extensions'
}
unless embed
  embed = app.new_copy_files_build_phase('Embed App Extensions')
  embed.symbol_dst_subfolder_spec = :plug_ins
end
build_file = embed.add_file_reference(widget.product_reference)
build_file.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }

# ── 4. Point the APP target at its entitlements (App Group lives there) ──────
app.build_configurations.each do |config|
  config.build_settings['CODE_SIGN_ENTITLEMENTS'] = 'App/App.entitlements'
end

project.save
puts "✓ added '#{WIDGET}' target, embedded it in '#{APP_TARGET}'"

# ── 5. Verify what we just wrote ─────────────────────────────────────────────
check = Xcodeproj::Project.open(PROJECT)
w = check.targets.find { |t| t.name == WIDGET }
a = check.targets.find { |t| t.name == APP_TARGET }
ok = true
def line(label, good, detail = '')
  puts "  #{good ? '✓' : '✗'} #{label}#{detail.empty? ? '' : "  (#{detail})"}"
  good
end
puts "\nverification:"
ok &= line('widget target exists', !w.nil?)
ok &= line('is an app extension', w&.product_type == 'com.apple.product-type.app-extension', w&.product_type.to_s)
ok &= line('compiles PeaklyWidget.swift',
           w&.source_build_phase&.files&.any? { |f| f.display_name == 'PeaklyWidget.swift' })
ok &= line('deployment target 17.0',
           w&.build_configurations&.all? { |c| c.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] == '17.0' })
ok &= line('app embeds the extension',
           a&.build_phases&.any? { |p| p.respond_to?(:name) && p.name == 'Embed App Extensions' &&
                                       p.files.any? { |f| f.display_name.to_s.include?(WIDGET) } })
ok &= line('app depends on widget', a&.dependencies&.any? { |d| d.target&.name == WIDGET })
ok &= line('app entitlements set',
           a&.build_configurations&.all? { |c| c.build_settings['CODE_SIGN_ENTITLEMENTS'] == 'App/App.entitlements' })
ok &= line('widget entitlements set',
           w&.build_configurations&.all? { |c| c.build_settings['CODE_SIGN_ENTITLEMENTS'] == 'PeaklyWidget/PeaklyWidget.entitlements' })

if ok
  puts <<~NEXT

    Done. Remaining steps (Xcode GUI — signing can't be scripted):

      1. open ios/App/App.xcworkspace
      2. Select the App target → Signing & Capabilities → confirm your team,
         then + Capability → App Groups → tick #{APP_GROUP}
      3. Select the PeaklyWidget target → same: team + App Groups → #{APP_GROUP}
         (Xcode needs to register the group with your provisioning profile —
          the entitlement files are already correct, this just tells Apple.)
      4. Build to a device, then long-press the home screen → + → Peakly

    If anything looks wrong, restore with:
      cp "#{backup}" "#{pbx}"
  NEXT
else
  warn "\n✗ verification failed — restore with:\n    cp \"#{backup}\" \"#{pbx}\""
  exit 1
end
