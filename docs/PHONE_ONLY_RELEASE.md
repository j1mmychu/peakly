# Phone-only TestFlight

No Mac. Safari and the GitHub app are enough. Nothing here submits the app for review.

## 1. Create the API key

You have to be the Account Holder or an Admin to create a key. An App Manager cannot.

1. Safari → [App Store Connect API keys](https://appstoreconnect.apple.com/access/integrations/api). If the page is a phone layout, tap the **aA** menu and request the Desktop Website.
2. Generate a key. Name it `Peakly CI`. Access: **Admin**.
3. Copy the **Issuer ID** at the top of that page and the new **Key ID**.
4. Download `AuthKey_XXXXXXXXXX.p8`. Apple allows that download once. Leave the file in Files.

Admin is required. The first cloud build creates the distribution certificate and the widget’s provisioning profile. An App Manager key can edit the listing later, but it will not get through signing.

## 2. Add four GitHub secrets

GitHub app or Safari → `j1mmychu/peakly` → Settings → Secrets and variables → Actions → New repository secret.

| Name | What to paste |
|---|---|
| `ASC_KEY_ID` | The Key ID. 10 letters or digits. |
| `ASC_ISSUER_ID` | The Issuer ID. It looks like a UUID. |
| `APPLE_TEAM_ID` | `D56F6F959R` |
| `ASC_KEY_P8` | The `.p8` file |

`ASC_KEY_P8` may be either form:

- The file as text, including the `BEGIN PRIVATE KEY` and `END PRIVATE KEY` lines. Open the file from Files and copy it.
- Or one line of base64 of that whole file. Shortcuts → Base64 Encode the file → copy. Use this if the phone will not copy the line breaks.

Do not wrap the value in quotes.

## 3. Run the workflows

After this pull request is merged, GitHub app → Peakly → Actions. Branch: **main**.

1. Run **TestFlight**. Leave the build number empty. It uses 3, or the next free number if 3 is already uploaded. A Mac in GitHub’s cloud does the archive. Your phone only watches the run. The first one can take about 40 minutes.
2. When that run is green, run **App Store listing (no submit)**. It sets the support URL, the privacy URL, and the review notes. It does not submit, does not reply to Apple, and does not change which build is selected.

## 4. Install, record, resubmit

1. Wait until TestFlight on the phone shows the build. “Processing” is normal. If it asks about encryption, answer that the app only uses standard HTTPS.
2. Install it. Record the shot list in `docs/APP_REVIEW_NOTES.md` on this phone, from a fresh install. Before you show deletion, run `server/sql/delete-account.sql` in the Supabase SQL editor, or Delete account will tell the reviewer to email you.
3. In App Store Connect, reply on the open rejection, attach that video, and resubmit version 1.0 yourself. The notes field is already filled.

## If TestFlight fails

- **Missing secret or 401:** the Key ID, Issuer ID, and `.p8` do not match, or the key was revoked.
- **Certificate or profile, App Group, or PeaklyWidget:** the key is not Admin, or the widget’s App Group is not registered yet. On the desktop site of [Identifiers](https://developer.apple.com/account/resources/identifiers/list), add the App Group `group.com.stormpeak.peakly`, turn it on for `com.stormpeak.peakly` and `com.stormpeak.peakly.PeaklyWidget`, and turn on Push Notifications for `com.stormpeak.peakly`. Rerun **TestFlight**. Leave the widget in the app.
- **Agreement:** App Store Connect → Business, accept the free apps agreement.
- The paid apps agreement, a new Apple ID password, and the Supabase SQL are still yours. This repo cannot do those from GitHub.
