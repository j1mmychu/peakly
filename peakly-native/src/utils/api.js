// ─── API Functions ──────────────────────────────────────────────────────────
// Ported from app.jsx

import { METEO, MARINE_URL, FLIGHT_PROXY, BASE_PRICES } from '../constants/data';

export async function fetchWeather(lat, lon) {
  const url =
    `${METEO}/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,` +
    `snow_depth_max,wind_speed_10m_max,uv_index_max,weather_code` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=7&timezone=auto`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("weather fetch failed");
  return r.json();
}

export async function fetchMarine(lat, lon) {
  const url =
    `${MARINE_URL}/marine?latitude=${lat}&longitude=${lon}` +
    `&daily=wave_height_max,wave_period_max&forecast_days=7&timezone=auto`;
  const r = await fetch(url);
  if (!r.ok) return null;
  return r.json();
}

export async function fetchTravelpayoutsPrice(origin, destination) {
  try {
    const url = `${FLIGHT_PROXY}/api/flights`
      + `?origin=${encodeURIComponent(origin)}`
      + `&destination=${encodeURIComponent(destination)}`;

    const r = await fetch(url);
    if (!r.ok) return null;
    const json = await r.json();
    if (!json.success) return null;

    const destData = json.data?.[destination];
    if (!destData) return null;

    const prices = Object.values(destData)
      .map(d => d.price)
      .filter(p => typeof p === "number" && p > 0);

    if (prices.length === 0) return null;
    return Math.round(Math.min(...prices));
  } catch {
    return null;
  }
}

export function getFlightDeal(ap, homeAirport = "JFK") {
  const base = BASE_PRICES[ap]?.[homeAirport] ?? 800;
  const seed = (ap + homeAirport).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const pct = 28 + (seed % 48);
  const price = Math.max(49, Math.round(base * (1 - pct / 100) / 5) * 5);
  return { price, normal: base, pct, from: homeAirport };
}

export function getFlightDate(whenId = "anytime") {
  const now = new Date();
  const add = (n) => { const d = new Date(now); d.setDate(d.getDate() + n); return d; };
  const fmt = d => d.toISOString().slice(0, 10);
  switch (whenId) {
    case "weekend": { const ds = now.getDay(); return fmt(add(ds === 6 ? 7 : 6 - ds)); }
    case "nextweek": return fmt(add(7));
    case "twoweeks": return fmt(add(14));
    case "month": return fmt(add(21));
    case "nextmonth": return fmt(add(35));
    case "60days": return fmt(add(50));
    case "90days": return fmt(add(75));
    default: return fmt(add(14));
  }
}

export function buildFlightUrl(from, to, whenId = "anytime") {
  const dep = getFlightDate(whenId);
  const retD = new Date(dep); retD.setDate(retD.getDate() + 7);
  const ret = retD.toISOString().slice(0, 10);
  return `https://www.google.com/flights?hl=en#flt=${from}.${to}.${dep}*${to}.${from}.${ret};c:USD;e:1;sd:1;t:f`;
}
