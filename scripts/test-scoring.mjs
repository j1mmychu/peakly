// Scoring regression harness — pins the behavior of Peakly's scoring "moat"
// (scoreVenue / scoreWeekend) so a one-line change can't silently ship a
// regression. No build step, no deps: it reads app.jsx, extracts the pure
// scoring functions by source, evals them in an isolated scope, and asserts
// invariants against synthetic Open-Meteo-shaped weather fixtures.
//
// Why this exists: app.jsx is a single ~13.5K-line file with no unit tests.
// The smoke test only proves the app *boots*; it never exercises the scoring
// math (headless has no weather, so the score-bearing branches never render).
// A wrong sign or off-by-one in scoreVenue would pass smoke and reach prod.
//
// Usage:  node scripts/test-scoring.mjs
// Exit 0 = all invariants hold. Exit 1 = a regression (prints which).
//
// These are INVARIANTS, not golden numbers — they assert relationships that
// must hold regardless of exact tuning (more snow ⇒ higher ski score, a storm
// ⇒ lower beach score, scores stay in 5..100, the band widens with horizon).
// That way legitimate re-tuning of magic numbers doesn't churn the tests, but
// a broken *direction* or contract does.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Defaults to ../app.jsx; accepts an explicit path arg (used to self-test the
// harness against a mutated copy, and handy for CI matrices).
const APP = process.argv[2] || join(__dirname, '..', 'app.jsx');

// ─── Extract pure scoring functions from app.jsx ────────────────────────────
// All target functions are top-level `function NAME(...) {` declarations whose
// closing brace sits at column 0. Extract from the `function NAME` line through
// the next line that is exactly `}`. Robust for this file's formatting and
// avoids needing a JS parser.
const SRC = readFileSync(APP, 'utf8');
const LINES = SRC.split('\n');

function extract(name) {
  const startRe = new RegExp('^function ' + name + '\\s*\\(');
  const start = LINES.findIndex((l) => startRe.test(l));
  if (start === -1) throw new Error(`could not find function ${name}() in app.jsx — did it get renamed?`);
  for (let i = start + 1; i < LINES.length; i++) {
    if (LINES[i] === '}') return LINES.slice(start, i + 1).join('\n');
  }
  throw new Error(`could not find closing brace for ${name}()`);
}

const NEEDED = [
  'getBeachSeasonCap',
  'scoreVenue',
  'weekendDayIndices',
  'candidateWeekends',
  'scoreOneWeekend',
  'scoreWeekend',
];

let scoreVenue, scoreWeekend;
try {
  const bundle = NEEDED.map(extract).join('\n\n') +
    '\n\nreturn { scoreVenue, scoreWeekend, getBeachSeasonCap, weekendDayIndices };';
  // eslint-disable-next-line no-new-func
  const mod = new Function(bundle)();
  ({ scoreVenue, scoreWeekend } = mod);
} catch (e) {
  console.error('❌ FAILED to load scoring functions from app.jsx:\n   ' + e.message);
  process.exit(1);
}

// ─── Fixture builders (Open-Meteo daily shape) ──────────────────────────────
const DAYS = 7;
function isoDays(startIso) {
  const out = [];
  const d = new Date(startIso + 'T12:00:00Z');
  for (let i = 0; i < DAYS; i++) { out.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1); }
  return out;
}
const fill = (v) => Array(DAYS).fill(v);

// A neutral, mild day repeated across the window; override per-field per-test.
function wx(overrides = {}, startIso = '2026-07-24') {
  const daily = {
    time: isoDays(startIso),
    temperature_2m_max: fill(70),
    temperature_2m_min: fill(55),
    precipitation_sum: fill(0),
    rain_sum: fill(0),
    snowfall_sum: fill(0),
    snow_depth_max: fill(0),
    wind_speed_10m_max: fill(8),
    wind_gusts_10m_max: fill(12),
    wind_direction_10m_dominant: fill(270),
    uv_index_max: fill(5),
    weather_code: fill(0),
    cloud_cover_max: fill(10),
    precipitation_probability_max: fill(10),
    sunshine_duration: fill(39600), // 11h
    relative_humidity_2m_max: fill(50),
  };
  for (const [k, v] of Object.entries(overrides)) daily[k] = Array.isArray(v) ? v : fill(v);
  return { daily };
}
function marine(tempC, startIso = '2026-07-24') {
  return { daily: { time: isoDays(startIso), sea_surface_temperature_max: fill(tempC) } };
}

// Venues. Tropical beach (|lat|<30) ⇒ no off-season cap ⇒ month-independent.
const TROPICAL_BEACH = { id: 'v-beach', category: 'beach', lat: 18.2, lon: -66.5, ap: 'SJU' };
const MED_BEACH = { id: 'v-med', category: 'beach', lat: 43.5, lon: 16.4, ap: 'SPU' }; // |lat|>30 ⇒ seasonal cap

// ─── Test runner ────────────────────────────────────────────────────────────
let pass = 0, fail = 0;
const fails = [];
function check(desc, cond, detail) {
  if (cond) { pass++; }
  else { fail++; fails.push(desc + (detail ? `  → ${detail}` : '')); }
}

// ── Contract: no weather ⇒ neutral loading result, never a crash ───────────
{
  const r = scoreVenue(TROPICAL_BEACH, null, null, 0);
  check('no-weather returns neutral 50', r.score === 50, `got ${r.score}`);
  check('no-weather has a loading label', typeof r.label === 'string' && r.label.length > 0);
}

// ── Contract: day beyond forecast window ⇒ "unavailable", not a bogus score ─
{
  const r = scoreVenue(TROPICAL_BEACH, wx(), null, 99);
  check('beyond-forecast returns 50/unavailable', r.score === 50 && /unavailable|beyond forecast/i.test(`${r.label} ${r.period}`), `got ${r.score}/${r.label}/${r.period}`);
}

// ── Contract: score always clamped to 5..100 with a band ───────────────────
{
  const samples = [
    scoreVenue(TROPICAL_BEACH, wx({ uv_index_max: 11, temperature_2m_max: 86, weather_code: 0, sunshine_duration: 43200 }), marine(28), 0),
    scoreVenue(TROPICAL_BEACH, wx({ weather_code: 95, precipitation_sum: 40, wind_speed_10m_max: 40, temperature_2m_max: 55 }), marine(12), 0),
  ];
  for (const r of samples) {
    check('score within 5..100', r.score >= 5 && r.score <= 100, `got ${r.score}`);
    check('band lo<=score<=hi', r.lo <= r.score && r.score <= r.hi, `${r.lo}/${r.score}/${r.hi}`);
    check('halfWidth is a number', Number.isFinite(r.halfWidth));
  }
}

// ── Uncertainty: forecast band widens the further out the day ──────────────
{
  const w = wx();
  const day0 = scoreVenue(TROPICAL_BEACH, w, marine(26), 0);
  const day5 = scoreVenue(TROPICAL_BEACH, w, marine(26), 5);
  check('band widens with horizon (hw@5 > hw@0)', day5.halfWidth > day0.halfWidth, `${day0.halfWidth} vs ${day5.halfWidth}`);
}

// ── Beach monotonicity + gates (tropical ⇒ month-independent) ──────────────
{
  const perfect = scoreVenue(TROPICAL_BEACH, wx({ uv_index_max: 9, temperature_2m_max: 84, weather_code: 0, sunshine_duration: 43200, cloud_cover_max: 5 }), marine(27), 0);
  const grey    = scoreVenue(TROPICAL_BEACH, wx({ uv_index_max: 2, temperature_2m_max: 66, weather_code: 3, sunshine_duration: 7200, cloud_cover_max: 95 }), marine(19), 0);
  const stormy  = scoreVenue(TROPICAL_BEACH, wx({ uv_index_max: 1, temperature_2m_max: 62, weather_code: 95, precipitation_sum: 30, wind_speed_10m_max: 35 }), marine(19), 0);

  check('perfect beach day scores high (>=88)', perfect.score >= 88, `got ${perfect.score}`);
  check('perfect > grey', perfect.score > grey.score, `${perfect.score} vs ${grey.score}`);
  check('grey > stormy', grey.score > stormy.score, `${grey.score} vs ${stormy.score}`);
  check('stormy beach day scores low (<45)', stormy.score < 45, `got ${stormy.score}`);

  // Rain isolation, mid-range (so the penalty isn't masked by the 5/100 clamp,
  // and both fixtures land in the SAME core scoring branch so the ONLY delta is
  // the rain penalty line). Hold weather_code constant; vary only precip. Guards
  // against a flipped-sign regression on `score -= 22` for rain — the kind an
  // extreme all-storm fixture hides behind the score floor / a different branch.
  const dryDay   = scoreVenue(TROPICAL_BEACH, wx({ uv_index_max: 7, temperature_2m_max: 82, weather_code: 2, precipitation_sum: 0 }), marine(26), 0);
  const wetDay   = scoreVenue(TROPICAL_BEACH, wx({ uv_index_max: 7, temperature_2m_max: 82, weather_code: 2, precipitation_sum: 5 }), marine(26), 0);
  check('dry beach day beats an otherwise-identical wet day', dryDay.score > wetDay.score, `${dryDay.score} vs ${wetDay.score}`);
  check('rain costs a real margin (dry - wet >= 8)', dryDay.score - wetDay.score >= 8, `Δ=${dryDay.score - wetDay.score}`);

  // UV monotonic, all else equal
  const uvLo = scoreVenue(TROPICAL_BEACH, wx({ uv_index_max: 4, temperature_2m_max: 84, weather_code: 0 }), marine(26), 0);
  const uvHi = scoreVenue(TROPICAL_BEACH, wx({ uv_index_max: 9, temperature_2m_max: 84, weather_code: 0 }), marine(26), 0);
  check('higher UV ⇒ higher (or equal) beach score', uvHi.score >= uvLo.score, `${uvLo.score} vs ${uvHi.score}`);

  // Cold water penalty on a non-poolPrimary beach
  const warmWater = scoreVenue(TROPICAL_BEACH, wx({ uv_index_max: 8, temperature_2m_max: 84, weather_code: 0 }), marine(27), 0);
  const coldWater = scoreVenue(TROPICAL_BEACH, wx({ uv_index_max: 8, temperature_2m_max: 84, weather_code: 0 }), marine(12), 0);
  check('warm water > cold water (same air)', warmWater.score > coldWater.score, `${warmWater.score} vs ${coldWater.score}`);
}

// ── Beach off-season cap (deterministic via fixture date, |lat|>30) ────────
{
  // Winter fixture for a Mediterranean beach ⇒ off-season cap must bite.
  const winter = scoreVenue(MED_BEACH, wx({ uv_index_max: 6, temperature_2m_max: 78, weather_code: 0, sunshine_duration: 39600 }, '2026-01-15'), marine(15, '2026-01-15'), 0);
  check('Med beach in January is capped (<=40)', winter.score <= 40, `got ${winter.score}`);
  check('Med off-season period is labeled', /off-season/i.test(winter.period), winter.period);
}

// ── Ski season gate + snow monotonicity (hemisphere auto-selected) ─────────
// scoreVenue reads the wall-clock month for the ski season gate, so pick the
// hemisphere that is currently CORE in-season / core off-season. Shoulder
// months (Apr/May/Oct/Nov edges) are skipped with a clear note.
{
  const mo = new Date().getMonth() + 1;
  const northCoreIn  = mo >= 12 || mo <= 3;  // Dec–Mar
  const southCoreIn  = mo >= 6 && mo <= 9;   // Jun–Sep
  const inSeasonLat  = northCoreIn ? 44 : southCoreIn ? -44 : null; // resort latitude
  const offSeasonLat = northCoreIn ? -44 : southCoreIn ? 44 : null;

  if (inSeasonLat === null) {
    console.log('   (ski season tests skipped — shoulder month ' + mo + '; gate is ambiguous by design)');
  } else {
    const skiIn  = { id: 'v-ski-in',  category: 'skiing', lat: inSeasonLat,  lon: 6.9, ap: 'GVA' };
    const skiOff = { id: 'v-ski-off', category: 'skiing', lat: offSeasonLat, lon: 6.9, ap: 'GVA' };

    // Off-season, no lateSeason flag, no base ⇒ hard closed gate (score 8).
    const closed = scoreVenue(skiOff, wx({ temperature_2m_max: 30, snow_depth_max: 0 }), null, 0);
    check('off-season resort is gated closed (score 8)', closed.score === 8, `got ${closed.score} / ${closed.label}`);
    check('off-season period says opens/closed', /closed|opens/i.test(closed.label + ' ' + closed.period), closed.label);

    // In-season: fresh snow beats a bare base, and a powder dump beats a dusting.
    const bare    = scoreVenue(skiIn, wx({ temperature_2m_max: 28, snowfall_sum: 0,  snow_depth_max: 0.3 }), null, 0);
    const dusting = scoreVenue(skiIn, wx({ temperature_2m_max: 28, snowfall_sum: 4,  snow_depth_max: 0.6 }), null, 0);
    const powder  = scoreVenue(skiIn, wx({ temperature_2m_max: 22, snowfall_sum: 45, snow_depth_max: 1.5, weather_code: 71 }), null, 0);
    check('in-season fresh snow > bare base', dusting.score > bare.score, `${bare.score} vs ${dusting.score}`);
    check('powder dump > dusting', powder.score > dusting.score, `${dusting.score} vs ${powder.score}`);
    check('powder day scores high (>=80)', powder.score >= 80, `got ${powder.score}`);

    // Freezing rain is trip-destroying: must score below the same day as snow.
    const snowDay    = scoreVenue(skiIn, wx({ temperature_2m_max: 28, snowfall_sum: 20, snow_depth_max: 1.0, weather_code: 73 }), null, 0);
    const freezeRain = scoreVenue(skiIn, wx({ temperature_2m_max: 34, snowfall_sum: 0,  snow_depth_max: 1.0, weather_code: 67 }), null, 0);
    check('freezing rain << snow day', freezeRain.score < snowDay.score, `${freezeRain.score} vs ${snowDay.score}`);
  }
}

// ── scoreWeekend: contract + best-2-of-window + split-weekend honesty ───────
{
  // Use a tropical beach so weekend scoring is month-independent. Build a window
  // where Fri & Sun are firing but Sat storms — the honest call is "fly Fri,
  // leave Sun" (~high), NOT the average of the worst pair.
  // Index the fixture from a known Friday so the weekend window lands cleanly.
  // 2026-07-24 is a Friday.
  const good = { uv_index_max: 9, temperature_2m_max: 84, weather_code: 0, sunshine_duration: 43200 };
  const bad  = { uv_index_max: 1, temperature_2m_max: 60, weather_code: 95, precipitation_sum: 30, wind_speed_10m_max: 35 };
  const perDay = (arr, field) => arr.map((day) => day[field]);
  // days: Fri good, Sat bad, Sun good, Mon good, + neutral tail
  const window = [good, bad, good, good, {}, {}, {}];
  const w = wx({
    uv_index_max: perDay(window, 'uv_index_max').map((v) => v ?? 5),
    temperature_2m_max: perDay(window, 'temperature_2m_max').map((v) => v ?? 70),
    weather_code: perDay(window, 'weather_code').map((v) => v ?? 0),
    sunshine_duration: perDay(window, 'sunshine_duration').map((v) => v ?? 39600),
    precipitation_sum: perDay(window, 'precipitation_sum').map((v) => v ?? 0),
    wind_speed_10m_max: perDay(window, 'wind_speed_10m_max').map((v) => v ?? 8),
  }, '2026-07-24');
  const friday = new Date('2026-07-24T12:00:00Z');

  const r = scoreWeekend(TROPICAL_BEACH, w, marine(27, '2026-07-24'), friday);
  check('scoreWeekend returns a confidence field', ['high', 'medium', 'low'].includes(r.confidence), `got ${r.confidence}`);
  check('scoreWeekend score within 5..100', r.score >= 5 && r.score <= 100, `got ${r.score}`);
  // Best pair (Fri+Sun, both firing) should beat the storm-dragged average.
  check('split weekend picks the firing pair, not the worst avg (>=75)', r.score >= 75, `got ${r.score} — Sat storm dragged the pair?`);

  // A far-horizon-only weekend must be honestly hedged, never sold as GO.
  // Give a 7-day fixture (no 2nd weekend in-forecast) and confirm THIS weekend
  // is high-confidence when the window is fully inside the forecast.
  check('this-weekend is high confidence when fully in-forecast', r.confidence === 'high', `got ${r.confidence}`);
}

// ─── Report ─────────────────────────────────────────────────────────────────
console.log(`\nScoring harness: ${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.error('\n❌ SCORING REGRESSION(S):');
  for (const f of fails) console.error('   • ' + f);
  console.error('\nA scoring invariant broke. If this was an intentional re-tune,');
  console.error('update the assertion; otherwise you just caught a regression.');
  process.exit(1);
}
console.log('✅ all scoring invariants hold');
process.exit(0);
