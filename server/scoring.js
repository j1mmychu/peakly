'use strict';

// ─── Server-side condition scoring ────────────────────────────────────────────
// VERBATIM PORT of scoreVenue / scoreWeekend / weekendDayIndices from app.jsx
// (lines 980–1367 as of 2026-05-04). Kept identical so server-fired strike
// alerts use the same algorithm the user sees in the UI. When the client
// algorithm changes, update this file in lockstep — drift here means alerts
// fire for venues the UI says are mediocre, or vice versa.

function scoreVenue(venue, wx, marine, dayIndex) {
  if (!wx?.daily) return { score: 50, label: 'Checking conditions…', period: 'Loading live data' };
  const di = dayIndex || 0;
  const forecastLen = wx.daily.temperature_2m_max?.length ?? 7;
  if (di >= forecastLen) return { score: 50, label: 'Forecast unavailable', period: 'Beyond 7-day forecast window' };
  const d = wx.daily;
  const md = marine?.daily;

  const at = (arr) => (Array.isArray(arr) && di < arr.length) ? arr[di] : null;
  const tempMax    = at(d.temperature_2m_max)  ?? 65;
  const tempMin    = at(d.temperature_2m_min)  ?? 45;
  const precip     = at(d.precipitation_sum)   ?? 0;
  const rain       = at(d.rain_sum)            ?? precip;
  const snow       = at(d.snowfall_sum)        ?? 0;
  const depth      = at(d.snow_depth_max)      ?? 0;
  const wind       = at(d.wind_speed_10m_max)  ?? 10;
  const gusts      = at(d.wind_gusts_10m_max)  ?? wind * 1.4;
  const windDirRaw = at(d.wind_direction_10m_dominant);
  const windDir    = windDirRaw ?? 0;
  const uv         = at(d.uv_index_max)        ?? 5;
  const wCode      = at(d.weather_code)        ?? 0;
  const cloudPct   = at(d.cloud_cover_max);
  const precipPct  = at(d.precipitation_probability_max) ?? 50;
  const sunHrs     = (at(d.sunshine_duration) ?? 28800) / 3600;
  const humidity   = at(d.relative_humidity_2m_max);

  const likelyRain = precip < 1 && precipPct > 70;

  const isFreezingRain = wCode === 66 || wCode === 67;
  const isThunder      = wCode >= 95 && wCode <= 99;
  const isHail         = wCode === 96 || wCode === 99;

  const atM = (arr) => (Array.isArray(arr) && di < arr.length) ? arr[di] : null;
  const waterTemp = atM(md?.ocean_temperature_max);
  const ySnow = (di > 0 && Array.isArray(d?.snowfall_sum) && d.snowfall_sum[di - 1] != null)
    ? d.snowfall_sum[di - 1] : 0;

  const gustFactor = wind >= 8 ? gusts / wind : 1.0;

  let bestDays = 1;
  for (let i = di + 1; i < (d.precipitation_sum?.length ?? 0); i++) {
    const dayPrecip = d.precipitation_sum[i] ?? 99;
    const dayWind = d.wind_speed_10m_max[i] ?? 99;
    const daySnow = d.snowfall_sum?.[i] ?? 0;
    if (venue.category === 'skiing') {
      if ((daySnow > 0 || dayPrecip < 3) && dayWind < 35) bestDays++;
      else break;
    } else {
      if (dayPrecip < 3 && dayWind < 25) bestDays++;
      else break;
    }
  }

  const tmrwPrecip = d.precipitation_sum?.[di + 1] ?? precip;
  const tmrwWind   = d.wind_speed_10m_max?.[di + 1] ?? wind;

  let score = 50, label = '', period = '';

  switch (venue.category) {
    case 'skiing': {
      const sIn = Math.round(snow * 0.394);
      const dIn = Math.round(depth * 39.4);
      const baseCm = depth * 100;

      const mo = new Date().getMonth() + 1;
      const isNorth = (venue.lat || 0) >= 0;
      const inSeason = isNorth ? (mo >= 11 || mo <= 4) : (mo >= 5 && mo <= 10);
      const isShoulder = isNorth ? (mo === 10 || mo === 5) : (mo === 4 || mo === 11);

      const inLateSeason = !inSeason && !isShoulder && venue.lateSeason && depth >= 0.5;
      if (!inSeason && !isShoulder && !inLateSeason) {
        score = 8; label = 'Off-season — resort closed'; period = 'Opens ' + (isNorth ? 'November' : 'May');
        break;
      }

      const wetSnow = snow > 0 && tempMax > 36;
      const wetCap = wetSnow ? 75 : 100;
      if      (snow >= 50) score = Math.min(wetCap, 95 + Math.min(5, (snow - 50) * 0.1));
      else if (snow >= 30) score = Math.min(wetCap, 89 + (snow - 30) * 0.3);
      else if (snow >= 20) score = Math.min(wetCap, 83 + (snow - 20) * 0.6);
      else if (snow >= 10) score = Math.min(wetCap, 75 + (snow - 10) * 0.8);
      else if (snow >= 5)  score = Math.min(wetCap, 68 + (snow - 5) * 1.4);
      else if (snow > 0)   score = Math.min(wetCap, 60 + snow * 1.6);
      else {
        if      (baseCm >= 200) score = 72;
        else if (baseCm >= 150) score = 66;
        else if (baseCm >= 100) score = 58;
        else if (baseCm >=  50) score = 45;
        else if (baseCm >=  25) score = 32;
        else if (inSeason && !isShoulder) score = 35;
        else if (isShoulder)              score = 25;
        else                              score = 15;
      }

      if (isShoulder && snow < 5 && baseCm < 50) score = Math.min(score, 32);

      if (tempMax < 25 && snow > 5)   score += 5;
      else if (tempMax < 32 && snow > 0) score += 2;
      if (tempMax > 38 && baseCm < 100) {
        if (tempMax <= 42) score -= 6;
        else if (tempMax <= 48) score -= 12;
        else score -= 20;
      } else if (tempMax > 48 && baseCm >= 100) {
        score -= 4;
      } else if (tempMax > 48) {
        score -= 20;
      }
      if (tempMin > 32 && snow === 0 && baseCm < 100) score -= 5;

      if (gusts > 55) score -= 20;
      else if (gusts > 45) score -= 12;
      else if (wind > 30) score -= 6;
      if (gustFactor > 1.8) score -= 3;

      const chill = (wind >= 3 && tempMax <= 50)
        ? 35.74 + 0.6215 * tempMax - 35.75 * Math.pow(wind, 0.16) + 0.4275 * tempMax * Math.pow(wind, 0.16)
        : tempMax;
      if (chill < -20) score -= 12;
      else if (chill < -10) score -= 8;
      else if (chill < 0) score -= 4;
      else if (chill < 10) score -= 2;

      const isRain = ((wCode >= 51 && wCode <= 65) || (wCode >= 80 && wCode <= 82)) && !isFreezingRain;
      const isSnow = (wCode >= 71 && wCode <= 77) || (wCode >= 85 && wCode <= 86);
      const isHeavySnow = wCode === 75 || wCode === 86;
      const isFog  = wCode === 45 || wCode === 48;

      if (isFreezingRain) score -= 28;
      else if (isRain)    score -= 14;
      if (isFog) score -= 5;
      if (isThunder) score -= 22;
      if (isHail)    score -= 6;

      if (snow >= 8 && tempMax < 32 && wCode <= 1 && !isThunder) score += 6;
      else if (snow >= 5 && wCode <= 2 && tempMax < 36) score += 3;

      if ((likelyRain || precipPct > 75) && snow < 3 && !isSnow) score -= 5;

      const conditionTag = (isFreezingRain ? ' · FREEZING RAIN'
                         : isThunder ? ' · ⚡ thunder'
                         : wetSnow ? ' · wet/heavy'
                         : isHeavySnow ? ' · heavy snow · flat light'
                         : isRain ? ' · RAIN'
                         : isSnow ? ' · snowing'
                         : '')
                         + (inLateSeason ? ' · late season' : '');
      label = snow > 0
        ? `${sIn}" fresh · ${dIn}" base · ${tempMax}°F${conditionTag}`
        : `${dIn}" base · ${tempMax}°F${gusts > 45 ? ' · high wind' : conditionTag}`;
      const stormFading = ySnow > snow + 8 && snow < 10;
      const bluebird = snow >= 8 && tempMax < 32 && wCode <= 1;
      period = isFreezingRain ? 'Freezing rain — DO NOT ski'
             : isThunder ? 'Thunderstorm — lifts will close'
             : wetSnow && snow >= 10 ? 'Wet snow — heavy & sticky'
             : bluebird ? 'Bluebird powder — perfect day'
             : snow >= 25 ? 'Powder day — go now'
             : snow >= 12 ? 'Fresh overnight — first tracks'
             : snow >=  5 ? 'New snow on groomed'
             : snow >   0 ? 'Dusting — mostly groomed'
             : stormFading ? `Storm fading · ${Math.round(ySnow * 0.394)}" fell yesterday`
             : isRain      ? 'Rain — wait it out'
             : baseCm >= 150 ? `Packed powder${tempMin < 28 ? ' · firm AM' : ''}`
             : baseCm >=  50 ? 'Thin cover · stick to groomers'
             : 'Limited terrain';
      break;
    }

    case 'beach': {
      const sunny     = wCode <= 1;
      const clear     = wCode <= 2;
      const partCloud = wCode === 3;
      const foggy     = wCode === 45 || wCode === 48;
      const rainy     = (wCode >= 51 && wCode <= 67) || (wCode >= 80 && wCode <= 82);
      const stormy    = wCode >= 95;

      const sunPct      = Math.min(1, sunHrs / 11);
      const comfortTemp = tempMax >= 75 && tempMax <= 92;
      const warmEnough  = tempMax >= 68 && tempMax < 75;
      const hotButOk    = tempMax > 92 && tempMax <= 102;

      if (sunny && sunHrs >= 10 && uv >= 8 && comfortTemp) {
        score = 94 + Math.min(4, (uv - 8) * 0.8 + (sunHrs - 10) * 0.5);
      } else if (clear && sunHrs >= 8 && uv >= 6 && (comfortTemp || hotButOk)) {
        score = 84 + Math.min(8, (uv - 6) * 1.3 + sunPct * 4);
      } else if (partCloud && uv >= 5 && (comfortTemp || warmEnough)) {
        score = 68 + uv * 1.5 + sunPct * 5;
      } else if (uv >= 3 && warmEnough) {
        score = 52 + uv * 2;
      } else if (warmEnough) {
        score = 44;
      } else {
        score = 28;
      }

      if (wind > 25)       score -= 16;
      else if (wind > 22)  score -= 12;
      else if (wind > 18)  score -= 9;
      else if (wind > 13)  score -= 4;
      else if (wind > 9)   score -= 1;
      if (gusts > 28) score -= 3;

      if (rainy || precip > 2) score -= 22;
      else if (likelyRain) score -= 16;
      else if (precipPct > 75) score -= 14;
      else if (precipPct > 55) score -= 7;
      else if (precipPct > 35) score -= 3;
      if (stormy) score -= 25;
      if (foggy && sunHrs < 4) score -= 10;

      if (tempMax < 65) score -= 12;
      if (tempMax > 100) score -= 6;
      if (tempMax > 105) score -= 14;

      if (humidity !== null && tempMax >= 85) {
        if (humidity > 85 && tempMax >= 95) score -= 12;
        else if (humidity > 75 && tempMax >= 90) score -= 7;
        else if (humidity > 65 && tempMax >= 88) score -= 3;
      }

      if (cloudPct !== null) {
        if (cloudPct >= 80) score -= 6;
        else if (cloudPct >= 60) score -= 3;
        else if (cloudPct <= 15 && uv >= 6) score += 2;
      }

      let chillyWater = false;
      if (waterTemp !== null) {
        if (waterTemp >= 24) score += 4;
        else if (waterTemp >= 21) score += 2;
        else if (waterTemp >= 18) score += 0;
        else if (waterTemp >= 15) score -= 3;
        else score -= 8;
        if (waterTemp < 18 && !venue.poolPrimary) {
          score = Math.min(score, 55);
          chillyWater = true;
        }
      }

      const sunLabel = sunHrs >= 10 ? 'Full sun' : sunHrs >= 7 ? 'Mostly sunny' : sunHrs >= 4 ? 'Partly cloudy' : 'Overcast';
      const weatherTag = stormy ? ' · storms' : rainy ? ' · rain' : foggy ? ' · fog' : '';
      const chillyTag = chillyWater ? ' · chilly water' : '';
      label = `UV ${uv} · ${tempMax}°F · ${sunLabel}${weatherTag}${chillyTag}`;
      period = (sunny || clear) && bestDays > 2 ? `${Math.min(bestDays, 7)}-day clear stretch`
             : (sunny || clear) ? 'Clear today'
             : rainy            ? 'Wet day — wait it out'
             : precipPct < 30   ? 'Mostly dry'
             : 'Scattered clouds';
      break;
    }
    default:
      score = 65; label = `${tempMax}°F · ${sunHrs.toFixed(0)}h sun`; period = 'Conditions fair';
  }

  return { score: Math.round(Math.min(100, Math.max(5, score))), label, period };
}

function weekendDayIndices(today) {
  const d = today.getDay();
  let daysToFri;
  if (d === 5)      daysToFri = 0;
  else if (d === 6) daysToFri = -1;
  else if (d === 0) daysToFri = -2;
  else if (d === 1) daysToFri = -3;
  else              daysToFri = (5 - d + 7) % 7;
  let indices = [daysToFri, daysToFri + 1, daysToFri + 2, daysToFri + 3].filter(i => i >= 0 && i <= 6);
  if (indices.length < 2) {
    const nextFri = daysToFri + 7;
    indices = [nextFri, nextFri + 1, nextFri + 2, nextFri + 3].filter(i => i >= 0 && i <= 6);
  }
  return indices;
}

function scoreWeekend(venue, wx, marine, todayDate) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const indices = weekendDayIndices(todayDate);
  if (!wx?.daily || indices.length === 0) {
    return { score: 50, label: 'Loading…', period: '', days: '', confidence: 'low' };
  }

  const days = indices.map(di => {
    const dt = new Date(todayDate);
    dt.setDate(dt.getDate() + di);
    const r = scoreVenue(venue, wx, marine, di);
    return { ...r, di, dayName: dayNames[dt.getDay()] };
  });

  let bestPair = null, bestPairAvg = -1;
  for (let i = 0; i < days.length - 1; i++) {
    if (days[i + 1].di === days[i].di + 1) {
      const avg = (days[i].score + days[i + 1].score) / 2;
      if (avg > bestPairAvg) { bestPairAvg = avg; bestPair = [days[i], days[i + 1]]; }
    }
  }
  if (!bestPair) {
    const top = days.reduce((a, b) => b.score > a.score ? b : a);
    bestPair = [top];
    bestPairAvg = top.score;
  }

  const maxDi = Math.max(...indices);
  const confidence = maxDi <= 4 ? 'high' : maxDi === 5 ? 'medium' : 'low';

  const top = bestPair.reduce((a, b) => b.score > a.score ? b : a);
  const label = `${top.dayName}: ${top.label}`;
  const days_str = bestPair.length === 2 ? `${bestPair[0].dayName}–${bestPair[1].dayName}` : bestPair[0].dayName;

  const otherDays = days.filter(d => !bestPair.includes(d));
  const badOther = otherDays.find(d => d.score < bestPairAvg - 20);
  const period = badOther
    ? `${days_str} firing · ${badOther.dayName} ${badOther.score < 40 ? 'storms' : 'weak'}`
    : `${days_str} window`;

  return { score: Math.round(bestPairAvg), label, period, days: days_str, confidence };
}

module.exports = { scoreVenue, scoreWeekend, weekendDayIndices };
