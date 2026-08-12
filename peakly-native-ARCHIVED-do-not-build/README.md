# peakly-native — ABANDONED (do not build)

This directory is an **abandoned React Native / Expo** attempt at the Peakly
native app. It is **not** the shipping iOS app and is **not** maintained.

**The real iOS app is the Capacitor project at [`../ios/App/`](../ios/App/)** —
that's what wraps the single-file web app (`app.jsx` → `dist/` → `ios/App/App/public/`)
and is what gets archived and submitted to the App Store.

## Why it's still here

The only thing worth keeping is **[`PUSH_SETUP.md`](./PUSH_SETUP.md)** — the
APNS `.p8` key + VPS env runbook for enabling Strike Alerts push delivery. That
runbook is provider-agnostic (Apple Developer console + `pm2 set` steps) and
still applies to the Capacitor app when APNS gets wired up (flip `APNS_LIVE` in
`app.jsx`).

## Do not

- Don't `npm install` / `expo` / build anything in here.
- Don't copy code from `src/` or `app/` into the live app.
- Don't let agents treat this as the iOS source of truth.

Kept for reference only; safe to delete once `PUSH_SETUP.md` is folded into
`../ios/` docs.
