# Peakly ⛰️

**Find ski & beach spots when this weekend's forecast and cheap flights align.**

A mobile-first weekend-spontaneity app for the Fri–Mon window. We score conditions across the next 7 days only — that's the forecast horizon we can honestly back — and cross-reference real-time flight deals so you know when conditions and price actually line up.

## Live Demo

Deployed via GitHub Pages: `https://YOUR_USERNAME.github.io/peakly`

## Features

- 🌍 **235+ venues** — skiing, surfing, hiking, kayaking, diving, beach
- 🌤️ **Live 7-day forecasts** — real weather via Open-Meteo API (free, no key needed)
- ✈️ **Flight deals** — estimated prices with Google Flights deep-links
- 🔔 **Smart alerts** — get notified when your spot fires
- 🗺️ **Interactive world map** — zoom, pan, filter by sport
- ✨ **AI Vibe Search** — describe your dream trip, get matched venues
- 📅 **Best months heatmap** — 12-month visual calendar per venue
- 💡 **Insider tips** — curated local knowledge per category
- 📱 **Mobile-first** — tap states, swipe gestures, bottom nav

## Tech

Single-file React app — no build step, no framework, no backend.
Runs in any browser via Babel CDN transform.

- React 18 (UMD)
- D3 v7 + TopoJSON (SVG world map)
- Open-Meteo API (weather + marine)

## Editing

The entire app lives in **`app.jsx`**. Edit it directly on GitHub or clone and open in any editor.

To suggest changes via Claude (iOS or web): paste the raw GitHub URL of `app.jsx` and describe what you want changed.

## Setup (push to GitHub in 60 seconds)

```bash
# 1. Clone / init
git init
git add .
git commit -m "Initial Peakly commit"

# 2. Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/peakly.git
git branch -M main
git push -u origin main

# 3. Enable GitHub Pages
# GitHub → repo Settings → Pages → Source: Deploy from branch → main → / (root) → Save
```

Your app will be live at `https://YOUR_USERNAME.github.io/peakly` in ~60 seconds.

## Roadmap

- [ ] Travelpayouts affiliate flight prices (real-time)
- [ ] Hotel affiliate links (Booking.com)
- [ ] Gear affiliate section per venue (REI, Patagonia)
- [ ] Trip insurance CTA (World Nomads)
- [ ] Peakly Pro subscription tier
- [ ] Push notifications for alerts
