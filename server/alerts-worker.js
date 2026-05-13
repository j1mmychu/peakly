'use strict';

// ─── Strike-alerts polling worker ─────────────────────────────────────────────
// Every POLL_INTERVAL_MS, walks the alerts store and:
//   1. Fetches Open-Meteo weather + (beach) marine for the venue
//   2. Computes weekend score using the SAME algorithm as the client
//   3. If score >= alert.targetScore AND we haven't fired in DEDUPE_MS, sends a
//      web push (and logs an APNs intent for native iOS — requires Apple cert
//      to actually deliver, intentionally stubbed)
//
// Weather responses are cached for 30 min to avoid hammering Open-Meteo when
// many users alert on the same venue.

const fs = require('fs');
const path = require('path');
const { scoreWeekend } = require('./scoring');

const METEO  = 'https://api.open-meteo.com/v1';
const MARINE = 'https://marine-api.open-meteo.com/v1';

const POLL_INTERVAL_MS  = 30 * 60 * 1000;   // 30 min between sweeps
const WX_CACHE_TTL_MS   = 30 * 60 * 1000;   // 30 min — match poll interval
const DEDUPE_MS         = 24 * 60 * 60 * 1000; // 24h between firings of same alert

const _wxCache = new Map(); // key -> { data, ts }

function _cacheKey(kind, lat, lon) {
  // Round to 0.1° (~11km) so nearby venues share fetches.
  return `${kind}:${Number(lat).toFixed(1)}:${Number(lon).toFixed(1)}`;
}

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) return null;
    return await r.json();
  } catch (err) {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function fetchWeather(lat, lon) {
  const key = _cacheKey('wx', lat, lon);
  const hit = _wxCache.get(key);
  if (hit && Date.now() - hit.ts < WX_CACHE_TTL_MS) return hit.data;
  const url = `${METEO}/forecast?latitude=${lat}&longitude=${lon}`
    + `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,`
    + `snow_depth_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,`
    + `uv_index_max,weather_code,precipitation_probability_max,sunshine_duration,`
    + `rain_sum,showers_sum,relative_humidity_2m_max,cloud_cover_max`
    + `&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=7&timezone=auto`;
  const data = await fetchWithTimeout(url);
  if (data) _wxCache.set(key, { data, ts: Date.now() });
  return data;
}

async function fetchMarine(lat, lon) {
  const key = _cacheKey('mar', lat, lon);
  const hit = _wxCache.get(key);
  if (hit && Date.now() - hit.ts < WX_CACHE_TTL_MS) return hit.data;
  const url = `${MARINE}/marine?latitude=${lat}&longitude=${lon}`
    + `&daily=ocean_temperature_max&forecast_days=7&timezone=auto`;
  const data = await fetchWithTimeout(url);
  if (data) _wxCache.set(key, { data, ts: Date.now() });
  return data;
}

function _cacheCleanup() {
  const cutoff = Date.now() - WX_CACHE_TTL_MS;
  for (const [k, v] of _wxCache) if (v.ts < cutoff) _wxCache.delete(k);
}

// ─── Persistence ─────────────────────────────────────────────────────────────
function makeStore(filePath) {
  let alerts = new Map();
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    if (fs.existsSync(filePath)) {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(raw)) alerts = new Map(raw.map(a => [a.alertId, a]));
    }
  } catch (err) {
    console.warn('[alerts] failed to load store:', err.message);
  }

  let writeTimer = null;
  function flush() {
    try {
      const arr = Array.from(alerts.values());
      fs.writeFileSync(filePath, JSON.stringify(arr, null, 2));
    } catch (err) {
      console.warn('[alerts] failed to persist store:', err.message);
    }
  }
  function scheduleFlush() {
    if (writeTimer) return;
    writeTimer = setTimeout(() => { writeTimer = null; flush(); }, 1000);
  }

  return {
    get: (id) => alerts.get(id),
    set: (id, val) => { alerts.set(id, val); scheduleFlush(); },
    delete: (id) => { const ok = alerts.delete(id); if (ok) scheduleFlush(); return ok; },
    has: (id) => alerts.has(id),
    values: () => alerts.values(),
    size: () => alerts.size,
    flush,
  };
}

// ─── Push dispatch ───────────────────────────────────────────────────────────
function makeDispatcher({ webpush, vapidPublicKey, vapidPrivateKey, vapidSubject }) {
  if (webpush && vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  }

  async function send(alert, scoreResult) {
    const venueLabel = alert.venueName || alert.venueId || 'a venue you watch';
    const payload = JSON.stringify({
      title: 'Peakly — conditions firing',
      body: `${venueLabel}: ${scoreResult.label} (${scoreResult.score}/100, ${scoreResult.days})`,
      venueId: alert.venueId,
      score: scoreResult.score,
    });

    if (alert.pushSubscription && webpush) {
      try {
        await webpush.sendNotification(alert.pushSubscription, payload);
        return { delivered: true, channel: 'web' };
      } catch (err) {
        // 404/410 = subscription expired/revoked. Caller should drop the alert.
        const gone = err && (err.statusCode === 404 || err.statusCode === 410);
        return { delivered: false, channel: 'web', error: err.message, expired: gone };
      }
    }

    if (alert.pushPlatform === 'ios' && alert.pushToken) {
      // APNs requires Apple Developer cert + auth key (.p8) + team/key IDs.
      // Setup is operational, not architectural — log the intent so it's
      // visible on the VPS, and treat as a no-op until APNs is wired.
      console.log(`[alerts] APNs intent (not yet wired): token=${alert.pushToken.slice(0, 12)}… payload=${payload}`);
      return { delivered: false, channel: 'apns', error: 'APNs not configured' };
    }

    return { delivered: false, channel: 'none', error: 'no push subscription on alert' };
  }

  return { send };
}

// ─── Polling loop ────────────────────────────────────────────────────────────
function startWorker({ store, dispatcher, intervalMs = POLL_INTERVAL_MS, logger = console }) {
  let running = false;

  async function tick() {
    if (running) return;
    running = true;
    const startedAt = Date.now();
    let checked = 0, fired = 0, dropped = 0;

    try {
      const today = new Date();
      for (const alert of Array.from(store.values())) {
        if (alert.enabled === false) continue;
        if (typeof alert.lat !== 'number' || typeof alert.lon !== 'number') continue;
        if (typeof alert.targetScore !== 'number') continue;

        // Date-window gate (alert only fires while user's travel window is current/future)
        if (alert.dateTo) {
          const tooLate = Date.now() > new Date(alert.dateTo).getTime() + 24 * 60 * 60 * 1000;
          if (tooLate) continue;
        }

        try {
          const wx = await fetchWeather(alert.lat, alert.lon);
          if (!wx) { checked++; continue; }
          const marine = alert.category === 'beach' ? await fetchMarine(alert.lat, alert.lon) : null;

          const venue = {
            id: alert.venueId,
            category: alert.category,
            lat: alert.lat,
            lon: alert.lon,
            lateSeason: !!alert.lateSeason,
            poolPrimary: !!alert.poolPrimary,
          };
          const result = scoreWeekend(venue, wx, marine, today);
          checked++;

          alert.lastChecked = new Date().toISOString();
          alert.lastScore = result.score;
          alert.lastConfidence = result.confidence;

          // Don't fire on low confidence — same rule as the client front page.
          if (result.confidence === 'low') { store.set(alert.alertId, alert); continue; }
          if (result.score < alert.targetScore) { store.set(alert.alertId, alert); continue; }

          const lastFiredAt = alert.lastFiredAt ? new Date(alert.lastFiredAt).getTime() : 0;
          if (Date.now() - lastFiredAt < DEDUPE_MS) { store.set(alert.alertId, alert); continue; }

          const dispatch = await dispatcher.send(alert, result);
          if (dispatch.delivered) {
            alert.lastFiredAt = new Date().toISOString();
            alert.lastFireScore = result.score;
            fired++;
            store.set(alert.alertId, alert);
          } else if (dispatch.expired) {
            store.delete(alert.alertId);
            dropped++;
            logger.log(`[alerts] dropped expired subscription for ${alert.alertId}`);
          } else {
            store.set(alert.alertId, alert);
          }
        } catch (err) {
          logger.warn(`[alerts] tick error for ${alert.alertId}:`, err.message);
        }
      }
      _cacheCleanup();
    } finally {
      running = false;
      const ms = Date.now() - startedAt;
      logger.log(`[alerts] swept ${checked} alerts in ${ms}ms — ${fired} fired, ${dropped} dropped`);
    }
  }

  // Kick off after a short delay so we don't hammer Open-Meteo at startup.
  const initialDelay = 30 * 1000;
  setTimeout(() => { tick(); setInterval(tick, intervalMs); }, initialDelay);

  return { tick };
}

module.exports = { makeStore, makeDispatcher, startWorker, fetchWeather, fetchMarine };
