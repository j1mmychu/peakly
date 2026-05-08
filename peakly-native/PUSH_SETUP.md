# Strike Alerts — iOS Push Setup Runbook

Production push delivery for Peakly's strike alerts. Required for App Store review (alerts must actually fire).

## Architecture

```
[Capacitor app] → register() → APNs token → POST /api/alerts on VPS
                                                ↓
                                            store in _alerts Map
                                                ↓
                                       (every 30 min) checkAlerts()
                                                ↓
                                         match → firePush()
                                                ↓
                                      JWT-signed POST to api.push.apple.com
                                                ↓
                                        notification on device
```

## Prerequisites

- Apple Developer Program membership ($99/yr, paid)
- iOS native project initialized (`npx cap add ios` or Expo prebuild) — current `peakly-native/` is Expo without prebuild artifacts
- VPS access (198.199.80.21) with `pm2` + `peakly-proxy` running

## Step 1 — Apple Developer Console: Enable Push for App ID

1. Apple Developer → **Certificates, Identifiers & Profiles** → Identifiers
2. Find or create App ID for `com.peakly.app`
3. Edit → enable **Push Notifications** capability → Save

## Step 2 — Generate APNs Authentication Key (.p8)

Token-based auth (preferred over per-app certificates):

1. Apple Developer → **Keys** → "+" (new key)
2. Name: "Peakly APNs Production"
3. Enable **Apple Push Notifications service (APNs)** → Continue → Register
4. **Download the `.p8` file once — Apple won't show it again.** Save with a meaningful name like `AuthKey_ABC123XYZ.p8`.
5. Note the **Key ID** (10 chars, shown after download) and your **Team ID** (Apple Dev → Membership → Team ID)

## Step 3 — Push the .p8 Key to VPS

```bash
# From your laptop:
scp AuthKey_ABC123XYZ.p8 root@198.199.80.21:/etc/peakly/AuthKey_ABC123XYZ.p8
ssh root@198.199.80.21
chmod 600 /etc/peakly/AuthKey_ABC123XYZ.p8
chown root:root /etc/peakly/AuthKey_ABC123XYZ.p8
```

Never commit the .p8 to git. It belongs only on the VPS.

## Step 4 — Set VPS Environment Variables

Edit `/etc/environment` (or the systemd unit / pm2 ecosystem.config.js):

```bash
APNS_KEY_ID=ABC123XYZ
APNS_TEAM_ID=DEF456GHI
APNS_BUNDLE_ID=com.peakly.app
APNS_KEY_PATH=/etc/peakly/AuthKey_ABC123XYZ.p8
APNS_PROD=true
ALERT_POLL_MINUTES=30
ALERTS_TEST_ENABLED=true   # leave 'true' until App Store review passes; set 'false' after launch
```

Restart proxy:

```bash
pm2 restart peakly-proxy --update-env
```

Verify:

```bash
curl https://peakly-api.duckdns.org/health
# should show "apns": "configured"
```

## Step 5 — Capacitor iOS Native Project

The current `peakly-native/` is Expo. To use Capacitor's PushNotifications plugin you'll need either:

- **A. Capacitor**: `npm install @capacitor/core @capacitor/push-notifications && npx cap add ios && npx cap sync`
- **B. Expo**: `npx expo install expo-notifications`. Different API but same APNs token flow.

Either way, in Xcode (after `npx cap open ios` or Expo's prebuild):

1. Select the App target → **Signing & Capabilities** tab
2. Click "+ Capability" → add **Push Notifications**
3. Verify `App.entitlements` now contains:
   ```xml
   <key>aps-environment</key>
   <string>production</string>
   ```
4. Set Team to the same Team ID used for the APNs key

## Step 6 — Test the Pipeline

### Test on a real device (simulator can't receive push)

1. Build and install the app on a physical iOS device:
   ```bash
   npx cap run ios --target=<device-uuid>
   ```
2. Launch app, grant notification permission when prompted
3. Open browser console (Safari devtools while connected to device) → verify `localStorage.peakly_push_token` is a 64-char hex string (NOT `"web-sw-registered"`)
4. Create a test strike alert in the Alerts tab (any sport, low target score like 50)
5. Verify the server received it:
   ```bash
   curl https://peakly-api.duckdns.org/api/alerts/<alert_id>
   # should show registeredAt, pushPlatform: "ios"
   ```

### Test the firing pipeline (test endpoint)

While `ALERTS_TEST_ENABLED=true`:

```bash
curl -X POST https://peakly-api.duckdns.org/api/alerts/<alert_id>/test
# response: { success: true, delivered: true, status: 200 }
```

Notification should arrive on the device within 1-2 seconds. If it doesn't:

- `delivered: false` → check `reason` field. Common: `apns_not_configured` (env vars missing), `BadDeviceToken` (token came from sandbox env, but `APNS_PROD=true`), `BadCertificate` (key wrong)
- Push delivered but no notification visible → check device's Notification Center, app's notification settings, and that token wasn't expired

### Test the real polling cycle

Set `ALERT_POLL_MINUTES=5` for testing:

```bash
ALERT_POLL_MINUTES=5 pm2 restart peakly-proxy --update-env
```

Register an alert with `targetScore: 50` (very easy to hit) for a real venue. Within 5 min, the polling worker fetches weather + checks the heuristic. If conditions clear the bar AND it's been >6h since last fire (or never fired), push goes out.

After verification, restore `ALERT_POLL_MINUTES=30`.

## Step 7 — App Store Review Submission Notes

In your App Store Connect submission "Review notes" field, paste:

```
Strike alerts are server-driven push notifications. To verify:

1. In the app, go to Alerts tab → Create alert
2. Pick any sport (Skiing or Beach), target score 60, max price $1000
3. Save the alert
4. Server registers token via POST /api/alerts on peakly-api.duckdns.org
5. Server runs a background polling worker (every 30 min) that checks
   weather conditions for each registered alert. When conditions hit the
   user's threshold, it sends APNS push.

For accelerated testing, the test endpoint POST /api/alerts/{id}/test
fires a push immediately (only enabled in pre-launch builds via
ALERTS_TEST_ENABLED env var). Reviewer can verify push delivery
within seconds without waiting for the natural poll cycle.

Notification permission UX: We request permission on first alert
creation, with copy explaining "Strike alerts only fire when conditions
hit your target — typically once a month."
```

After review passes, set `ALERTS_TEST_ENABLED=false` on the VPS and restart.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `apns_not_configured` | Env vars missing | Verify `/health` shows `"apns": "configured"`. If not, check pm2 logs for which env var is missing. |
| `delivered: true` but no notification | Sandbox/prod mismatch | Token is from sandbox (TestFlight) but server is prod. Either set `APNS_PROD=false` for TestFlight, or distribute via App Store proper. |
| `BadDeviceToken` | Token format wrong | Capacitor returns hex strings; ensure 64-char hex (no quotes, no whitespace). |
| Push delivered to one device, not another | Different bundle IDs | Confirm both devices installed builds signed with the same `APNS_BUNDLE_ID`. |
| Polling worker never runs | Proxy crashed at boot | `pm2 logs peakly-proxy` — look for "[poll] strike-alert worker starting". |

## Persistence — Known Limitation

`_alerts` is currently in-memory only. Server restart wipes registered alerts. Users will need to re-register in the app on next session.

This is acceptable for v1 launch (App Store review tests creation+firing, not restart survival). v2 will migrate to Supabase. See plan: `~/.claude/plans/jiggly-swinging-floyd.md`.
