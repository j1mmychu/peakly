// ─── Condition Scoring ──────────────────────────────────────────────────────
// Ported directly from app.jsx scoreVenue()

export function scoreVenue(venue, wx, marine) {
  if (!wx?.daily) return { score: 50, label: "Checking conditions…", period: "Loading live data" };

  const d = wx.daily;
  const tempMax = d.temperature_2m_max[0] ?? 65;
  const precip = d.precipitation_sum[0] ?? 0;
  const snow = d.snowfall_sum?.[0] ?? 0;
  const depth = d.snow_depth_max?.[0] ?? 0;
  const wind = d.wind_speed_10m_max[0] ?? 10;
  const uv = d.uv_index_max?.[0] ?? 5;
  const wCode = d.weather_code?.[0] ?? 0;
  const waveH = marine?.daily?.wave_height_max?.[0] ?? 0;
  const wavePer = marine?.daily?.wave_period_max?.[0] ?? 10;

  let bestDays = 1;
  for (let i = 1; i < (d.precipitation_sum?.length ?? 0); i++) {
    if ((d.precipitation_sum[i] ?? 99) < 3 && (d.wind_speed_10m_max[i] ?? 99) < 25) bestDays++;
    else break;
  }

  let score = 50, label = "", period = "";

  switch (venue.category) {
    case "skiing": {
      const sIn = Math.round(snow * 0.394);
      const dIn = Math.round(depth * 39.4);
      const baseDepthCm = depth * 100;
      if (snow > 30) score = 97;
      else if (snow > 20) score = 93 + (snow - 20) * 0.15;
      else if (snow > 10) score = 87 + (snow - 10) * 0.6;
      else if (snow > 5) score = 80 + (snow - 5) * 1.4;
      else if (snow > 0) score = 72 + snow * 1.6;
      else {
        if (baseDepthCm > 200) score = 74;
        else if (baseDepthCm > 150) score = 69;
        else if (baseDepthCm > 100) score = 62;
        else if (baseDepthCm > 50) score = 53;
        else score = 36;
      }
      if (tempMax < 30 && snow > 5) score += 3;
      if (tempMax > 36) score -= 18;
      if (wind > 45) score -= 12;
      else if (wind > 30) score -= 5;
      label = snow > 0 ? `❄️ ${sIn}" fresh · ${dIn}" base` : `🏔️ ${dIn}" base · ${tempMax}°F`;
      period = snow > 20 ? "🔥 Powder day — go now"
        : snow > 10 ? "Fresh snow overnight"
        : snow > 0 ? "New snow on trail"
        : baseDepthCm > 150 ? "Groomed packed powder"
        : "Limited coverage";
      break;
    }

    case "surfing": {
      const fFt = Math.round(waveH * 3.28 * 1.5);
      const glassy = wind < 8;
      const blown = wind > 22;
      if (waveH > 3 && wavePer > 14) score = 93 + Math.min(6, (wavePer - 14) * 0.5 + (waveH - 3) * 0.4);
      else if (waveH > 2 && wavePer > 12) score = 85 + (wavePer - 12) * 0.8 + (waveH - 2) * 2;
      else if (waveH > 1.5 && wavePer > 10) score = 76 + waveH * 3;
      else if (waveH > 1) score = 65 + waveH * 6;
      else if (waveH > 0.5) score = 50 + waveH * 14;
      else score = 30;
      if (glassy) score += 4;
      else if (blown) score -= 14;
      if (waveH > 6) score -= 8;
      const windLabel = glassy ? " · Glassy" : blown ? " · Choppy" : "";
      label = waveH > 0.5 ? `🌊 ${fFt}ft faces · ${wavePer.toFixed(0)}s${windLabel}` : `🌊 Small surf · building`;
      period = waveH > 3 ? `🔥 Firing — peak ${Math.min(bestDays, 3)}d`
        : waveH > 1.5 ? `Good swell · ${Math.min(bestDays, 3)}d window`
        : waveH > 0.5 ? "Fun conditions"
        : "Swell building";
      break;
    }

    case "tanning": {
      const sunny = wCode < 2;
      const clear = wCode < 3;
      if (sunny && uv >= 10 && tempMax >= 85) score = 94 + Math.min(5, uv - 10);
      else if (clear && uv >= 8 && tempMax >= 80) score = 87 + Math.min(6, uv - 8);
      else if (clear && uv >= 6 && tempMax >= 75) score = 76 + (uv - 6) * 1.5;
      else if (uv >= 4 && tempMax >= 68) score = 62 + uv * 1.2;
      else score = 40;
      if (precip > 5) score -= 20;
      if (tempMax > 100) score -= 5;
      label = sunny ? `☀️ UV ${uv} · ${tempMax}°F · Perfect`
        : clear ? `🌤️ UV ${uv} · ${tempMax}°F`
        : `⛅ Partly cloudy · UV ${uv}`;
      period = sunny && bestDays > 1 ? `${Math.min(bestDays, 7)}-day clear window`
        : clear ? "Clear day ahead"
        : "Clear stretches";
      break;
    }

    default:
      score = 70; label = `🌤️ ${tempMax}°F`; period = "Conditions good";
  }

  return { score: Math.round(Math.min(100, Math.max(20, score))), label, period };
}
