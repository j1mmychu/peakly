#!/usr/bin/env bash
# Archive ios/App/App.xcworkspace with automatic signing and upload the IPA
# to TestFlight. Run on a macOS GitHub runner after:
#   node scripts/build-ios.mjs
#   npx cap sync ios
#   node scripts/register-widget-plugin.mjs
#   (cd ios/App && pod install)
# and after scripts/asc.mjs has written the .p8 and chosen the build number.
#
# Does not submit for App Review.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

: "${ASC_KEY_ID:?ASC_KEY_ID}"
: "${ASC_ISSUER_ID:?ASC_ISSUER_ID}"
: "${APPLE_TEAM_ID:?APPLE_TEAM_ID}"
: "${KEY_PATH:?KEY_PATH}"
: "${BUILD_NUMBER:?BUILD_NUMBER}"

if ! [[ "$BUILD_NUMBER" =~ ^[0-9]+$ ]]; then
  echo "BUILD_NUMBER must be digits, got: $BUILD_NUMBER" >&2
  exit 1
fi
if ! [[ "$APPLE_TEAM_ID" =~ ^[A-Z0-9]{10}$ ]]; then
  echo "APPLE_TEAM_ID must be 10 letters or digits" >&2
  exit 1
fi

perl -pi -e "s/CURRENT_PROJECT_VERSION = \\d+;/CURRENT_PROJECT_VERSION = ${BUILD_NUMBER};/g" \
  ios/App/App.xcodeproj/project.pbxproj
perl -pi -e "s/DEVELOPMENT_TEAM = [A-Z0-9]+;/DEVELOPMENT_TEAM = ${APPLE_TEAM_ID};/g" \
  ios/App/App.xcodeproj/project.pbxproj

COUNT="$(grep -c "CURRENT_PROJECT_VERSION = ${BUILD_NUMBER};" ios/App/App.xcodeproj/project.pbxproj || true)"
if [[ "$COUNT" -lt 4 ]]; then
  echo "Expected the build number on the app and widget (debug and release). Found $COUNT." >&2
  exit 1
fi

if ! grep -q "IPHONEOS_DEPLOYMENT_TARGET = 15.0;" ios/App/App.xcodeproj/project.pbxproj; then
  echo "App deployment target is no longer 15.0. Refusing to archive." >&2
  exit 1
fi

EXPORT_DIR="$ROOT/build/export"
ARCHIVE="$ROOT/build/Peakly.xcarchive"
PLIST="$ROOT/build/ExportOptions.plist"
LOG="$ROOT/build/xcodebuild.log"
mkdir -p "$ROOT/build"
rm -rf "$ARCHIVE" "$EXPORT_DIR"
: > "$LOG"

KEYCHAIN="$ROOT/build/build.keychain-db"
KEYCHAIN_PW="$(openssl rand -hex 16)"
rm -f "$KEYCHAIN"
security create-keychain -p "$KEYCHAIN_PW" "$KEYCHAIN"
security set-keychain-settings -lut 21600 "$KEYCHAIN"
security unlock-keychain -p "$KEYCHAIN_PW" "$KEYCHAIN"
security list-keychains -d user -s "$KEYCHAIN"
security default-keychain -s "$KEYCHAIN"

cleanup() {
  security delete-keychain "$KEYCHAIN" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Xcode: $(xcodebuild -version | tr '\n' ' ')"
xcodebuild -workspace ios/App/App.xcworkspace -list | tee -a "$LOG"

signing_hint() {
  cat <<'EOF'

Signing failed. Automatic signing creates the distribution certificate and
profiles, including the widget. The API key has to be Admin for that.

If the log mentions an App Group, a profile, or PeaklyWidget, do this once
in Safari (request Desktop Website) and rerun this workflow:

  https://developer.apple.com/account/resources/identifiers/list

  1. Identifiers → App Groups → add group.com.stormpeak.peakly if it is missing.
  2. App ID com.stormpeak.peakly → enable App Groups (that group) and Push Notifications.
  3. App ID com.stormpeak.peakly.PeaklyWidget → enable App Groups (the same group).

Do not delete the widget to force a build. The review notes say it is in the app.
An App Manager key can edit the listing but cannot create the certificate.
EOF
}

archive() {
  xcodebuild archive \
    -workspace ios/App/App.xcworkspace \
    -scheme App \
    -configuration Release \
    -destination "generic/platform=iOS" \
    -archivePath "$ARCHIVE" \
    -allowProvisioningUpdates \
    -authenticationKeyPath "$KEY_PATH" \
    -authenticationKeyID "$ASC_KEY_ID" \
    -authenticationKeyIssuerID "$ASC_ISSUER_ID" \
    DEVELOPMENT_TEAM="$APPLE_TEAM_ID" \
    CODE_SIGN_STYLE=Automatic \
    CURRENT_PROJECT_VERSION="$BUILD_NUMBER" \
    MARKETING_VERSION=1.0
}

echo "Archiving Peakly 1.0 ($BUILD_NUMBER)"
if ! archive 2>&1 | tee -a "$LOG"; then
  signing_hint
  exit 1
fi

write_plist() {
  local method="$1"
  cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>${method}</string>
  <key>teamID</key>
  <string>${APPLE_TEAM_ID}</string>
  <key>signingStyle</key>
  <string>automatic</string>
  <key>uploadSymbols</key>
  <true/>
  <key>manageAppVersionAndBuildNumber</key>
  <false/>
</dict>
</plist>
EOF
}

export_ipa() {
  local method="$1"
  write_plist "$method"
  rm -rf "$EXPORT_DIR"
  mkdir -p "$EXPORT_DIR"
  xcodebuild -exportArchive \
    -archivePath "$ARCHIVE" \
    -exportPath "$EXPORT_DIR" \
    -exportOptionsPlist "$PLIST" \
    -allowProvisioningUpdates \
    -authenticationKeyPath "$KEY_PATH" \
    -authenticationKeyID "$ASC_KEY_ID" \
    -authenticationKeyIssuerID "$ASC_ISSUER_ID"
}

echo "Exporting IPA"
if ! export_ipa app-store-connect 2>&1 | tee -a "$LOG"; then
  echo "app-store-connect export failed. Retrying with method app-store."
  if ! export_ipa app-store 2>&1 | tee -a "$LOG"; then
    signing_hint
    exit 1
  fi
fi

IPA=""
while IFS= read -r f; do
  IPA="$f"
  break
done < <(find "$EXPORT_DIR" -name '*.ipa' -type f)
if [[ -z "${IPA}" || ! -f "$IPA" ]]; then
  echo "Export finished but no IPA was produced." >&2
  signing_hint
  exit 1
fi
echo "IPA: $IPA"

echo "Uploading to TestFlight (this does not submit for review)"
if xcrun --find altool >/dev/null 2>&1; then
  xcrun altool --upload-app -f "$IPA" -t ios \
    --apiKey "$ASC_KEY_ID" \
    --apiIssuer "$ASC_ISSUER_ID"
else
  xcrun iTMSTransporter -m upload \
    -assetFile "$IPA" \
    -apiKey "$ASC_KEY_ID" \
    -apiIssuer "$ASC_ISSUER_ID"
fi

echo "Upload accepted. TestFlight will process it before the build can be installed."
echo "Processing is not a review submission. The selected App Store build was not changed."
