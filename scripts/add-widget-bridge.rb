#!/usr/bin/env ruby
# Adds PeaklyWidgetBridge.swift/.m to the App target.
#
# Dropping files into ios/App/App/ on disk does NOT add them to the Xcode
# project — they'd sit there uncompiled, the Capacitor plugin would never
# register, and the widget would show its empty state forever with no error
# anywhere to explain why. This wires them in properly.
#
#   ruby scripts/add-widget-bridge.rb
#
# Safe to re-run. Backs up project.pbxproj first.

require 'fileutils'
begin
  require 'xcodeproj'
rescue LoadError
  abort "Missing the `xcodeproj` gem — run: sudo gem install xcodeproj"
end

ROOT       = File.expand_path('..', __dir__)
PROJECT    = File.join(ROOT, 'ios/App/App.xcodeproj')
APP_TARGET = 'App'
FILES      = %w[PeaklyWidgetBridge.swift PeaklyWidgetBridge.m]

FILES.each do |f|
  path = File.join(ROOT, 'ios/App/App', f)
  abort "Missing #{path}" unless File.exist?(path)
end

pbx    = File.join(PROJECT, 'project.pbxproj')
backup = "#{pbx}.backup-#{Time.now.strftime('%Y%m%d-%H%M%S')}"
FileUtils.cp(pbx, backup)
puts "backup → #{File.basename(backup)}"

project = Xcodeproj::Project.open(PROJECT)
app = project.targets.find { |t| t.name == APP_TARGET }
abort "No '#{APP_TARGET}' target" unless app

# The App sources live in the group that already holds AppDelegate.swift —
# find it that way rather than guessing at the group's name.
app_group = project.main_group.recursive_children.find { |g|
  g.is_a?(Xcodeproj::Project::Object::PBXGroup) &&
    g.children.any? { |c| c.respond_to?(:path) && c.path == 'AppDelegate.swift' }
}
abort "Couldn't locate the App source group (no AppDelegate.swift found)" unless app_group

added = []
FILES.each do |name|
  already = app.source_build_phase.files.any? { |f| f.display_name == name }
  if already
    puts "  · #{name} already in target"
    next
  end
  ref = app_group.children.find { |c| c.respond_to?(:path) && c.path == name } ||
        app_group.new_reference(name)
  app.add_file_references([ref])
  added << name
end

if added.empty?
  puts "Nothing to do — both files already compiled by '#{APP_TARGET}'."
  exit 0
end

project.save
puts "✓ added to '#{APP_TARGET}': #{added.join(', ')}"

# ── verify ───────────────────────────────────────────────────────────────────
check = Xcodeproj::Project.open(PROJECT)
a = check.targets.find { |t| t.name == APP_TARGET }
ok = true
FILES.each do |name|
  present = a.source_build_phase.files.any? { |f| f.display_name == name }
  puts "  #{present ? '✓' : '✗'} #{name} compiled by #{APP_TARGET}"
  ok &&= present
end

unless ok
  warn "\n✗ verification failed — restore with:\n    cp \"#{backup}\" \"#{pbx}\""
  exit 1
end

puts <<~NEXT

  Done. Both bridge files now compile into the app.

  Quick sanity check once you're running on a device — in Safari
  (Develop → your iPhone → Peakly), run:

    Object.keys(window.Capacitor.Plugins)

  'PeaklyWidgetBridge' must appear in that list. If it doesn't, the .m
  file isn't registering — that's the file whose CAP_PLUGIN macro exposes
  the Swift class to JavaScript.
NEXT
