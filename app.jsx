const { useState, useEffect, useRef, useCallback } = React;

// ─── error monitoring & crash detection ──────────────────────────────────────
(() => {
  // Sentry-lite: lightweight error reporter (free tier compatible)
  const SENTRY_DSN = ""; // TODO: Add Sentry DSN after signup
  const errorLog = [];
  const MAX_ERRORS = 50;

  const reportError = (error, context = {}) => {
    const entry = {
      msg: error?.message || String(error),
      stack: error?.stack?.split("\n").slice(0, 5).join("\n"),
      url: window.location.href,
      ts: new Date().toISOString(),
      ua: navigator.userAgent,
      ...context,
    };
    errorLog.push(entry);
    if (errorLog.length > MAX_ERRORS) errorLog.shift();

    // Store locally for debugging
    try { localStorage.setItem("peakly_errors", JSON.stringify(errorLog)); } catch(e) {}

    // Send to Sentry if configured
    if (SENTRY_DSN) {
      fetch(SENTRY_DSN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exception: { values: [{ type: "Error", value: entry.msg, stacktrace: entry.stack }] }, tags: context }),
      }).catch(() => {});
    }

    console.error("[Peakly Error Monitor]", entry.msg, context);
  };

  // Global error handler — catches unhandled exceptions
  window.addEventListener("error", (e) => {
    reportError(e.error || e.message, { type: "uncaught", filename: e.filename, line: e.lineno, col: e.colno });
  });

  // Promise rejection handler — catches async errors
  window.addEventListener("unhandledrejection", (e) => {
    reportError(e.reason, { type: "unhandled_promise" });
  });

  // Performance monitoring
  window.addEventListener("load", () => {
    setTimeout(() => {
      const perf = performance.getEntriesByType("navigation")[0];
      if (perf) {
        const metrics = {
          dns: Math.round(perf.domainLookupEnd - perf.domainLookupStart),
          ttfb: Math.round(perf.responseStart - perf.requestStart),
          domReady: Math.round(perf.domContentLoadedEventEnd - perf.startTime),
          fullLoad: Math.round(perf.loadEventEnd - perf.startTime),
        };
        try { localStorage.setItem("peakly_perf", JSON.stringify(metrics)); } catch(e) {}
      }
    }, 1000);
  });

  // Expose for debugging from console or scheduled tasks
  window.__peaklyErrors = errorLog;
  window.__peaklyReport = reportError;
})();

// ─── inject styles ────────────────────────────────────────────────────────────
(() => {
  const s = document.createElement("style");
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body { background: #f5f5f5; }
    ::-webkit-scrollbar { display: none; }
    button, a, [role=button] { touch-action: manipulation; }
    /* ── tap states (mobile-first) ── */
    .card {
      transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s;
      cursor: pointer; user-select: none;
    }
    .card:active { transform: scale(0.95); box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
    .card-img { transition: transform 0.4s ease; }
    .pill {
      cursor: pointer;
      transition: transform 0.16s cubic-bezier(0.34,1.56,0.64,1), background 0.15s, color 0.15s;
    }
    .pill:active { transform: scale(0.88); }
    .tab-btn { transition: transform 0.14s cubic-bezier(0.34,1.56,0.64,1), opacity 0.1s; cursor: pointer; }
    .tab-btn:active { transform: scale(0.88); opacity: 0.6; }
    .heart {
      transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
      cursor: pointer;
    }
    .heart:active { transform: scale(1.35); }
    .pressable {
      transition: transform 0.16s cubic-bezier(0.34,1.56,0.64,1), opacity 0.12s;
      cursor: pointer;
    }
    .pressable:active { transform: scale(0.93); opacity: 0.78; }
    .bounce-in { animation: bounceIn 0.22s ease-out; }
    @keyframes bounceIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
    /* ── animations (reduced — reserved for meaningful state changes) ── */
    .pulse { animation: pulse 2.5s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    .shimmer {
      background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.8s infinite;
    }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    .fade-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes imgFadeIn { from{opacity:0} to{opacity:1} }
    .tab-fade { animation: tabFade 0.18s ease-out; }
    @keyframes tabFade { from{opacity:0} to{opacity:1} }
    .sheet { animation: sheetUp 0.42s cubic-bezier(0.34,1.56,0.64,1); }
    @keyframes sheetUp { from{transform:translateX(-50%) translateY(100%)} to{transform:translateX(-50%) translateY(0)} }
    .backdrop { animation: bdFade 0.22s ease; }
    @keyframes bdFade { from{opacity:0} to{opacity:1} }
    /* ── pill selected pop ── */
    .pill-selected { animation: pillPop 0.22s cubic-bezier(0.34,1.56,0.64,1); }
    @keyframes pillPop { 0%{transform:scale(1)} 40%{transform:scale(1.14)} 100%{transform:scale(1)} }
    /* ── vibe search animations ── */
    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes dotBounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-10px);opacity:1} }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    .vibe-spin { animation: spin 1.8s linear infinite; display:inline-block; }
    /* ── inputs ── */
    input[type=range] { -webkit-appearance: none; appearance: none; height: 5px; border-radius: 3px; outline: none; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 26px; height: 26px; border-radius: 50%; background: #0284c7; cursor: pointer; box-shadow: 0 2px 8px rgba(2,132,199,0.45); transition: transform 0.16s cubic-bezier(0.34,1.56,0.64,1); }
    input[type=range]::-webkit-slider-thumb:active { transform: scale(1.3); }
    input[type=text], input[type=email] { outline: none; }
    input[type=text]:focus, input[type=email]:focus { border-color: #0284c7 !important; box-shadow: 0 0 0 3px rgba(2,132,199,0.12) !important; }
  `;
  document.head.appendChild(s);
})();

const F = "'Plus Jakarta Sans', sans-serif";

// ─── categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id:"all",      label:"All" },
  { id:"skiing",   label:"Skiing" },
  { id:"surfing",  label:"Surfing" },
  { id:"hiking",   label:"Hiking" },
  { id:"diving",   label:"Diving" },
  { id:"climbing", label:"Climbing" },
  { id:"tanning",  label:"Beach" },
  { id:"kite",     label:"Kite" },
  { id:"kayak",    label:"Kayak" },
  { id:"mtb",      label:"MTB" },
  { id:"fishing",  label:"Fishing" },
  { id:"paraglide",label:"Paraglide" },
];

// ─── continents for filtering ─────────────────────────────────────────────────
const CONTINENTS = [
  { id:"na",      label:"N. America" },
  { id:"europe",  label:"Europe" },
  { id:"asia",    label:"Asia" },
  { id:"oceania", label:"Oceania" },
  { id:"latam",   label:"S. America" },
  { id:"africa",  label:"Africa" },
];

// Map airport code → continent (used for venue continent lookup)
const AP_CONTINENT = {
  // North America
  YVR:"na", SLC:"na", ANC:"na", JFK:"na", LAX:"na", SFO:"na", ORD:"na",
  MIA:"na", SEA:"na", BOS:"na", ATL:"na", DFW:"na", ASE:"na", EGE:"na",
  JAC:"na", BZN:"na", MTJ:"na", YYC:"na", DEN:"na", RNO:"na", HDN:"na",
  SUN:"na", YLW:"na", SAF:"na", HNL:"na", OGG:"na", LIH:"na", SAN:"na",
  OAX:"na", PVR:"na", SJO:"na", LIR:"na", SAL:"na",
  LAS:"na", PHX:"na", MSP:"na", DTW:"na", ORF:"na",
  // Caribbean / Mex / Central Am
  SJU:"na", BGI:"na", GCM:"na", PLS:"na", AXA:"na", AUA:"na", SXM:"na", STT:"na",
  UVF:"na", TAB:"na", MBJ:"na", HAV:"na", CUN:"na", CZM:"na", PVR:"na", SJD:"na",
  ZIH:"na", HUX:"na", MZT:"na", SJO:"na", BOC:"na", ORF:"na", MYR:"na", SRQ:"na",
  TPA:"na", EYW:"na", VPS:"na",
  // USA additional
  KOA:"na", OGG:"na", LIH:"na", BTV:"na", TYS:"na", CWL:"na",
  // S. America
  FEN:"latam", AQP:"latam", BOG:"latam",
  // Europe
  GVA:"europe", ZRH:"europe", AGP:"europe", INN:"europe", CMF:"europe",
  GNB:"europe", SZG:"europe", VCE:"europe", TRN:"europe",
  BIQ:"europe", BIO:"europe", LIS:"europe", NQY:"europe",
  INV:"europe", SNN:"europe", ACE:"europe", FUE:"europe",
  SCQ:"europe", FAE:"europe", FNC:"europe", PDL:"europe",
  AJA:"europe", BOD:"europe", PSA:"europe", NAP:"europe",
  CAG:"europe", FAO:"europe", JTR:"europe", JMK:"europe",
  ZTH:"europe", SPU:"europe", DBV:"europe", MLO:"europe",
  IBZ:"europe", MAH:"europe", NCE:"europe", KEF:"europe",
  MAN:"europe", CWL:"europe",
  // Asia
  NRT:"asia", CTS:"asia", HND:"asia", DPS:"asia", PDG:"asia", CEB:"asia",
  KTM:"asia", KBV:"asia", HKT:"asia", USM:"asia", ENI:"asia", MPH:"asia",
  LOP:"asia", PBH:"asia", AMM:"asia", PKR:"asia", LUA:"asia",
  // Oceania / Pacific
  ZQN:"oceania", CNS:"oceania", CBR:"oceania", SYD:"oceania",
  MEL:"oceania", OOL:"oceania", PER:"oceania", AKL:"oceania",
  NAN:"oceania", MLE:"oceania", PPT:"oceania",
  LST:"oceania", AIT:"oceania", SON:"oceania", PPP:"oceania", BME:"oceania",
  // Latin America / S. America
  SCL:"latam", PUQ:"latam", CUZ:"latam", LIM:"latam", GRU:"latam", FLN:"latam", REC:"latam",
  // Africa
  CPT:"africa", PLZ:"africa", AGA:"africa", WDH:"africa",
  JRO:"africa", MBA:"africa", ZNZ:"africa", SEZ:"africa",
  PRI:"africa", MRU:"africa",
};

// ─── venues with real coordinates ────────────────────────────────────────────
const VENUES = [
  {
    id:"whistler",  category:"skiing",
    title:"Whistler Blackcomb", location:"British Columbia, Canada",
    lat:50.1163, lon:-122.9574, ap:"YVR",
    icon:"🏔️", rating:4.97, reviews:2840,
    gradient:"linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
    accent:"#6db3f2", tags:["Powder Day","All Levels"],
    photo:"https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop&q=80",
  },
  {
    id:"pipeline",  category:"surfing",
    title:"Pipeline, North Shore", location:"Oahu, Hawaii",
    lat:21.6645, lon:-158.0453, ap:"HNL",
    icon:"🌊", rating:4.99, reviews:1203,
    gradient:"linear-gradient(160deg,#0a3d3d,#0f7c6e,#40c4a8)",
    accent:"#40c4a8", tags:["Expert","Offshore Winds"],
    photo:"https://images.unsplash.com/photo-1502680390548-bdbac40529ce?w=800&h=600&fit=crop&q=80",
  },
  {
    id:"borabora",  category:"tanning",
    title:"Bora Bora Lagoon", location:"French Polynesia",
    lat:-16.5004, lon:-151.7415, ap:"PPT",
    icon:"🏝️", rating:4.96, reviews:988,
    gradient:"linear-gradient(160deg,#1a3a00,#2e7d32,#66bb6a)",
    accent:"#a5d6a7", tags:["UV 11","Crystal Water"],
    photo:"https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=800&h=600&fit=crop&q=80",
  },
  {
    id:"gbr",       category:"diving",
    title:"Great Barrier Reef", location:"Queensland, Australia",
    lat:-18.2871, lon:147.6992, ap:"CNS",
    icon:"🐠", rating:4.93, reviews:1756,
    gradient:"linear-gradient(160deg,#001a3a,#0040c8,#40a0ff)",
    accent:"#82b1ff", tags:["Visibility 30m","Marine Life"],
    photo:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&q=80",
  },
  {
    id:"yosemite",  category:"climbing",
    title:"Yosemite Valley", location:"California, USA",
    lat:37.7459, lon:-119.5332, ap:"SFO",
    icon:"🧗", rating:4.95, reviews:4201,
    gradient:"linear-gradient(160deg,#3a1a00,#8d4e00,#d4860a)",
    accent:"#ffb74d", tags:["El Capitan","All Grades"],
    photo:"https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop&q=80",
  },
  {
    id:"tarifa",    category:"kite",
    title:"Tarifa Wind Coast", location:"Andalusia, Spain",
    lat:36.0144, lon:-5.6044, ap:"AGP",
    icon:"🪁", rating:4.91, reviews:892,
    gradient:"linear-gradient(160deg,#1a0030,#5c0080,#b040f0)",
    accent:"#ce93d8", tags:["Expert Wind","Warm Water"],
    photo:"https://images.unsplash.com/photo-1559310589-2673bfe16970?w=800&h=600&fit=crop&q=80",
  },
  {
    id:"chamonix",  category:"skiing",
    title:"Chamonix-Mont-Blanc", location:"Haute-Savoie, France",
    lat:45.9237, lon:6.8694, ap:"GVA",
    icon:"🎿", rating:4.94, reviews:3405,
    gradient:"linear-gradient(160deg,#0a1a3a,#1a3a6e,#3a6ebf)",
    accent:"#90caf9", tags:["Off-Piste","Mont Blanc Views"],
    photo:"https://images.unsplash.com/photo-1520923642038-b4259acecbd7?w=800&h=600&fit=crop&q=80",
  },
  {
    id:"milford",   category:"kayak",
    title:"Milford Sound", location:"Fiordland, New Zealand",
    lat:-44.6413, lon:167.8974, ap:"ZQN",
    icon:"🛶", rating:4.96, reviews:1102,
    gradient:"linear-gradient(160deg,#001a10,#006040,#00c07a)",
    accent:"#69f0ae", tags:["Mirror Water","Dolphins"],
    photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80",
  },
  {
    id:"moab",      category:"mtb",
    title:"Moab Slickrock Trail", location:"Utah, USA",
    lat:38.5733, lon:-109.5498, ap:"SLC",
    icon:"🚵", rating:4.88, reviews:2208,
    gradient:"linear-gradient(160deg,#3a0a00,#b03000,#ff6030)",
    accent:"#ff8a65", tags:["Intermediate+","Desert Vibes"],
    photo:"https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&h=600&fit=crop&q=80",
  },
  {
    id:"kenai",     category:"fishing",
    title:"Kenai River", location:"Alaska, USA",
    lat:60.5544, lon:-150.7848, ap:"ANC",
    icon:"🎣", rating:4.92, reviews:744,
    gradient:"linear-gradient(160deg,#0a1a2a,#1a4060,#2e7aba)",
    accent:"#81d4fa", tags:["King Salmon","World Record Waters"],
    photo:"https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&h=600&fit=crop&q=80",
  },
  {
    id:"interlaken",category:"paraglide",
    title:"Interlaken", location:"Bernese Oberland, Switzerland",
    lat:46.6863, lon:7.8632, ap:"ZRH",
    icon:"🪂", rating:4.97, reviews:1890,
    gradient:"linear-gradient(160deg,#1a1a3a,#3a3a8e,#6868d4)",
    accent:"#b39ddb", tags:["Tandem OK","Alps Views"],
    photo:"https://images.unsplash.com/photo-1501262170142-192e2641e3f3?w=800&h=600&fit=crop&q=80",
  },
  // ─── North America ski resorts ─────────────────────────────────────────────
  {id:"aspen",       category:"skiing",title:"Aspen Snowmass",          location:"Colorado, USA",            lat:39.1911,lon:-106.8175,ap:"ASE",icon:"⛷️",rating:4.97,reviews:3210,gradient:"linear-gradient(160deg,#0d1b35,#1a3a7a,#3a6ac4)",accent:"#7eb3e8",tags:["Expert Terrain","Luxury Village"],photo:"https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=600&fit=crop&q=80"},
  {id:"vail",        category:"skiing",title:"Vail Mountain",           location:"Colorado, USA",            lat:39.6433,lon:-106.3722,ap:"EGE",icon:"⛷️",rating:4.96,reviews:4120,gradient:"linear-gradient(160deg,#0d1b35,#1a3c7c,#2e68c2)",accent:"#82b4e8",tags:["Back Bowls","All Levels"],photo:"https://images.unsplash.com/photo-1565992441121-4367c2967103?w=800&h=600&fit=crop&q=80"},
  {id:"parkcity",    category:"skiing",title:"Park City / Deer Valley", location:"Utah, USA",                lat:40.6461,lon:-111.4980,ap:"SLC",icon:"⛷️",rating:4.95,reviews:3880,gradient:"linear-gradient(160deg,#0d1b38,#1a3c7c,#3570c8)",accent:"#7ab0e4",tags:["Deer Valley Grooming","Best Après"]},
  {id:"alta",        category:"skiing",title:"Alta / Snowbird",         location:"Utah, USA",                lat:40.5883,lon:-111.6358,ap:"SLC",icon:"⛷️",rating:4.96,reviews:2960,gradient:"linear-gradient(160deg,#0a1828,#1a3870,#2e66be)",accent:"#78ace4",tags:["Ski Only","Deep Powder"]},
  {id:"jacksonhole", category:"skiing",title:"Jackson Hole Mountain",   location:"Wyoming, USA",             lat:43.5875,lon:-110.8279,ap:"JAC",icon:"⛷️",rating:4.97,reviews:3440,gradient:"linear-gradient(160deg,#0d1c36,#1a3c7a,#3068c4)",accent:"#76aedf",tags:["Teton Views","Expert+"],photo:"https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=800&h=600&fit=crop&q=80"},
  {id:"bigsky",      category:"skiing",title:"Big Sky Resort",          location:"Montana, USA",             lat:45.2865,lon:-111.4013,ap:"BZN",icon:"⛷️",rating:4.93,reviews:2240,gradient:"linear-gradient(160deg,#0a1a30,#1a3870,#2e66c0)",accent:"#74aadc",tags:["Lone Peak","5,800 Acres"]},
  {id:"telluride",   category:"skiing",title:"Telluride Ski Resort",    location:"Colorado, USA",            lat:37.9364,lon:-107.8123,ap:"MTJ",icon:"⛷️",rating:4.96,reviews:2100,gradient:"linear-gradient(160deg,#0c1a34,#1a3878,#2e64c0)",accent:"#72a8dc",tags:["Box Canyon","Ski-In/Out Town"]},
  {id:"banff",       category:"skiing",title:"Banff / Lake Louise",     location:"Alberta, Canada",          lat:51.4254,lon:-116.1773,ap:"YYC",icon:"⛷️",rating:4.95,reviews:3560,gradient:"linear-gradient(160deg,#0d1c38,#1a3e7c,#2a6abf)",accent:"#7aacdc",tags:["Rocky Mtn Views","3 Resorts"]},
  {id:"breckenridge",category:"skiing",title:"Breckenridge",           location:"Colorado, USA",            lat:39.4817,lon:-106.0384,ap:"DEN",icon:"⛷️",rating:4.93,reviews:4820,gradient:"linear-gradient(160deg,#0e1c38,#1a3e7e,#2e6cbe)",accent:"#78aada",tags:["Historic Town","Epic Pass"]},
  {id:"tahoe",       category:"skiing",title:"Palisades Tahoe",         location:"California, USA",          lat:39.1959,lon:-120.2357,ap:"RNO",icon:"⛷️",rating:4.92,reviews:3240,gradient:"linear-gradient(160deg,#0a1c38,#1a407e,#306ec0)",accent:"#76a8db",tags:["Lake Views","Consistent Snow"]},
  {id:"mammoth",     category:"skiing",title:"Mammoth Mountain",        location:"California, USA",          lat:37.6308,lon:-119.0326,ap:"RNO",icon:"⛷️",rating:4.94,reviews:3780,gradient:"linear-gradient(160deg,#0c1e38,#1a4280,#3270c0)",accent:"#74a6da",tags:["Sierra Nevada","Late Season"]},
  {id:"steamboat",   category:"skiing",title:"Steamboat Springs",       location:"Colorado, USA",            lat:40.4572,lon:-106.8045,ap:"HDN",icon:"⛷️",rating:4.91,reviews:2860,gradient:"linear-gradient(160deg,#0d1e38,#1a4280,#3270be)",accent:"#72a4d8",tags:["Champagne Powder","Cowboy Style"]},
  {id:"sunvalley",   category:"skiing",title:"Sun Valley",              location:"Idaho, USA",               lat:43.6936,lon:-114.3536,ap:"SUN",icon:"⛷️",rating:4.94,reviews:2420,gradient:"linear-gradient(160deg,#0c1c38,#1a4080,#3472c0)",accent:"#74a8da",tags:["Bald Mountain","Original Resort"]},
  {id:"revelstoke",  category:"skiing",title:"Revelstoke Mountain",     location:"British Columbia, Canada", lat:51.0568,lon:-118.1881,ap:"YLW",icon:"⛷️",rating:4.96,reviews:1820,gradient:"linear-gradient(160deg,#0a1c38,#1a3e78,#2e6cbc)",accent:"#76aadb",tags:["5,620ft Vertical","Heli Access"]},
  {id:"kickinghorse",category:"skiing",title:"Kicking Horse",          location:"British Columbia, Canada", lat:51.2981,lon:-117.0374,ap:"YYC",icon:"⛷️",rating:4.93,reviews:1540,gradient:"linear-gradient(160deg,#0c1c38,#1a3e7a,#2e68bc)",accent:"#74a8db",tags:["4,133ft Vert","Extreme Terrain"]},
  {id:"snowbasin",   category:"skiing",title:"Snowbasin",               location:"Utah, USA",                lat:41.2161,lon:-111.8548,ap:"SLC",icon:"⛷️",rating:4.91,reviews:1980,gradient:"linear-gradient(160deg,#0e1e38,#1a4280,#3272be)",accent:"#72a4d8",tags:["Olympic Venue","Uncrowded"]},
  {id:"beavercreek", category:"skiing",title:"Beaver Creek",            location:"Colorado, USA",            lat:39.5985,lon:-106.5155,ap:"EGE",icon:"⛷️",rating:4.94,reviews:2580,gradient:"linear-gradient(160deg,#0c1c38,#1a3c7a,#2e6aba)",accent:"#74a8da",tags:["Birds of Prey DH","Luxury Ski"]},
  {id:"taos",        category:"skiing",title:"Taos Ski Valley",         location:"New Mexico, USA",          lat:36.5953,lon:-105.4475,ap:"SAF",icon:"⛷️",rating:4.92,reviews:1640,gradient:"linear-gradient(160deg,#0d1c38,#1a3a78,#2e68b8)",accent:"#72a4d8",tags:["High Altitude","Southwest Vibes"]},
  {id:"grandtarghee",category:"skiing",title:"Grand Targhee Resort",   location:"Wyoming, USA",             lat:43.7883,lon:-110.9426,ap:"JAC",icon:"⛷️",rating:4.90,reviews:1340,gradient:"linear-gradient(160deg,#0c1c36,#1a3876,#2e66b6)",accent:"#74a4d8",tags:["Teton Views","Powder Stash"]},
  // ─── Japan ───────────────────────────────────────────────────────────────
  {id:"niseko",      category:"skiing",title:"Niseko United",           location:"Hokkaido, Japan",          lat:42.8048,lon:140.6879,ap:"CTS",icon:"⛷️",rating:4.97,reviews:3180,gradient:"linear-gradient(160deg,#0d1c40,#1a3e88,#3a78d4)",accent:"#7ab4ec",tags:["Japow","200+ Snow Days"],photo:"https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&h=600&fit=crop&q=80"},
  {id:"hakuba",      category:"skiing",title:"Hakuba Valley",           location:"Nagano, Japan",            lat:36.6989,lon:137.8632,ap:"NRT",icon:"⛷️",rating:4.93,reviews:2240,gradient:"linear-gradient(160deg,#0e1e40,#1a4088,#3a7ad2)",accent:"#78b2ec",tags:["10 Resorts","Olympic History"]},
  {id:"rusutsu",     category:"skiing",title:"Rusutsu Resort",          location:"Hokkaido, Japan",          lat:42.7517,lon:140.8956,ap:"CTS",icon:"⛷️",rating:4.92,reviews:1580,gradient:"linear-gradient(160deg,#0c1c40,#1a3e88,#3876d0)",accent:"#76b0ea",tags:["Uncrowded Japow","Tree Runs"]},
  {id:"nozawa",      category:"skiing",title:"Nozawa Onsen",            location:"Nagano, Japan",            lat:36.9221,lon:138.4434,ap:"NRT",icon:"⛷️",rating:4.91,reviews:1260,gradient:"linear-gradient(160deg,#0e2040,#1a4088,#3878d2)",accent:"#78b2ea",tags:["Onsen Après","Authentic Village"]},
  {id:"furano",      category:"skiing",title:"Furano Ski Resort",       location:"Hokkaido, Japan",          lat:43.3539,lon:142.2824,ap:"CTS",icon:"⛷️",rating:4.90,reviews:1480,gradient:"linear-gradient(160deg,#0d1e40,#1a4090,#3a7ad4)",accent:"#76b0ec",tags:["Dry Powder","Scenic Views"]},
  // ─── South America & Oceania ──────────────────────────────────────────────
  {id:"corralco",    category:"skiing",title:"Corralco Ski Resort",     location:"Malalcahuello, Chile",     lat:-38.5983,lon:-71.5742,ap:"SCL",icon:"⛷️",rating:4.88,reviews:820, gradient:"linear-gradient(160deg,#0a1e1c,#0f4040,#1a7a60)",accent:"#50b898",tags:["Jun-Oct Season","Southern Andes"]},
  {id:"portillo",    category:"skiing",title:"Portillo",                location:"Andes, Chile",             lat:-32.8356,lon:-70.1286,ap:"SCL",icon:"⛷️",rating:4.93,reviews:1420,gradient:"linear-gradient(160deg,#0a1e1e,#0f3e3c,#1a7060)",accent:"#4cb898",tags:["High Altitude","Classic Resort"]},
  {id:"perisher",    category:"skiing",title:"Perisher Ski Resort",     location:"New South Wales, Australia",lat:-36.4009,lon:148.3753,ap:"CBR",icon:"⛷️",rating:4.87,reviews:2840,gradient:"linear-gradient(160deg,#0a1e20,#0f4042,#1a7268)",accent:"#50b6a0",tags:["Largest Oz Resort","Winter Escape"]},
  {id:"remarkables", category:"skiing",title:"The Remarkables",         location:"Queenstown, New Zealand",  lat:-45.0400,lon:168.7862,ap:"ZQN",icon:"⛷️",rating:4.92,reviews:1880,gradient:"linear-gradient(160deg,#0a1c2e,#1a4070,#2e74b8)",accent:"#68aadc",tags:["Queenstown Base","Scenic Views"]},
  {id:"treblecone",  category:"skiing",title:"Treble Cone",             location:"Wanaka, New Zealand",      lat:-44.6372,lon:169.0584,ap:"ZQN",icon:"⛷️",rating:4.91,reviews:1240,gradient:"linear-gradient(160deg,#0c1e30,#1a4272,#3076ba)",accent:"#6aaade",tags:["Lake Wanaka Views","Expert Runs"]},
  // ─── Europe — France ─────────────────────────────────────────────────────
  {id:"valthorens",  category:"skiing",title:"Val Thorens",             location:"Les 3 Vallées, France",    lat:45.2978,lon:6.5824,ap:"CMF",icon:"⛷️",rating:4.96,reviews:3680,gradient:"linear-gradient(160deg,#0a1230,#1a2870,#2840c0)",accent:"#6c88e4",tags:["Highest Resort EU","600km Pistes"]},
  {id:"courchevel",  category:"skiing",title:"Courchevel",              location:"Les 3 Vallées, France",    lat:45.4146,lon:6.6337,ap:"CMF",icon:"⛷️",rating:4.96,reviews:3240,gradient:"linear-gradient(160deg,#0c1432,#1e2e72,#3048c2)",accent:"#6e8ae4",tags:["Luxury Chalet","Linked Ski Area"]},
  {id:"tignes",      category:"skiing",title:"Tignes / Val d'Isère",   location:"Espace Killy, France",     lat:45.4708,lon:6.9057,ap:"CMF",icon:"⛷️",rating:4.94,reviews:2960,gradient:"linear-gradient(160deg,#0c1430,#1e2c72,#3046c0)",accent:"#6c88e2",tags:["Summer Glacier","Huge Domain"]},
  {id:"alpehuez",    category:"skiing",title:"Alpe d'Huez",            location:"French Alps, France",      lat:45.0897,lon:6.0690,ap:"GNB",icon:"⛷️",rating:4.91,reviews:2480,gradient:"linear-gradient(160deg,#0d1432,#1e2e72,#3048c0)",accent:"#6c88e2",tags:["Sun Bowl","21 Pistes"]},
  {id:"avoriaz",     category:"skiing",title:"Avoriaz",                 location:"Portes du Soleil, France", lat:46.1917,lon:6.7795,ap:"GVA",icon:"⛷️",rating:4.90,reviews:2160,gradient:"linear-gradient(160deg,#0c1432,#1e2c70,#2e46be)",accent:"#6a86e0",tags:["Car-Free Village","Linked to Morzine"]},
  // ─── Europe — Switzerland ─────────────────────────────────────────────────
  {id:"zermatt",     category:"skiing",title:"Zermatt",                 location:"Valais, Switzerland",      lat:46.0207,lon:7.7491,ap:"GVA",icon:"⛷️",rating:4.98,reviews:4280,gradient:"linear-gradient(160deg,#0c1830,#1a3870,#2e60b8)",accent:"#70a8dc",tags:["Matterhorn Views","Year-Round"],photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80"},
  {id:"verbier",     category:"skiing",title:"Verbier",                 location:"4 Vallées, Switzerland",   lat:46.0964,lon:7.2283,ap:"GVA",icon:"⛷️",rating:4.95,reviews:3040,gradient:"linear-gradient(160deg,#0d1832,#1a3a72,#2e62ba)",accent:"#72a8dc",tags:["Freeride Mecca","Expert Terrain"]},
  {id:"saasfee",     category:"skiing",title:"Saas-Fee",                location:"Valais, Switzerland",      lat:46.1085,lon:7.9287,ap:"GVA",icon:"⛷️",rating:4.93,reviews:2240,gradient:"linear-gradient(160deg,#0c1830,#1a3870,#2c60b6)",accent:"#70a6da",tags:["Glacier Skiing","Car-Free Village"]},
  {id:"andermatt",   category:"skiing",title:"Andermatt",               location:"Uri, Switzerland",         lat:46.6363,lon:8.5942,ap:"ZRH",icon:"⛷️",rating:4.92,reviews:1820,gradient:"linear-gradient(160deg,#0d1832,#1a3a72,#2e62b8)",accent:"#70a8da",tags:["New World-Class","High Alpine"]},
  {id:"laax",        category:"skiing",title:"Laax",                    location:"Graubünden, Switzerland",  lat:46.8174,lon:9.2548,ap:"ZRH",icon:"⛷️",rating:4.90,reviews:1960,gradient:"linear-gradient(160deg,#0e1a32,#1a3c74,#3064b8)",accent:"#72a8da",tags:["Freestyle Hub","Big Air"]},
  {id:"engelberg",   category:"skiing",title:"Engelberg",               location:"Obwalden, Switzerland",    lat:46.8215,lon:8.4084,ap:"ZRH",icon:"⛷️",rating:4.91,reviews:2180,gradient:"linear-gradient(160deg,#0c1a32,#1a3a72,#2e62b8)",accent:"#70a6d8",tags:["Titlis Glacier","Easy Access"]},
  // ─── Europe — Austria ─────────────────────────────────────────────────────
  {id:"stanton",     category:"skiing",title:"St. Anton am Arlberg",   location:"Ski Arlberg, Austria",     lat:47.1294,lon:10.2685,ap:"INN",icon:"⛷️",rating:4.95,reviews:3680,gradient:"linear-gradient(160deg,#0e1632,#1e3272,#2e5cb4)",accent:"#6ea0d4",tags:["Legendary Slopes","Après Capital"]},
  {id:"ischgl",      category:"skiing",title:"Ischgl",                  location:"Silvretta Arena, Austria", lat:47.0127,lon:10.2928,ap:"INN",icon:"⛷️",rating:4.94,reviews:3120,gradient:"linear-gradient(160deg,#0d1630,#1e3070,#2c5ab2)",accent:"#6c9ed2",tags:["Nightlife","Tax-Free Shopping"]},
  {id:"kitzbuehel",  category:"skiing",title:"Kitzbühel",               location:"Tyrol, Austria",           lat:47.4467,lon:12.3922,ap:"SZG",icon:"⛷️",rating:4.94,reviews:3840,gradient:"linear-gradient(160deg,#0e1630,#1e3272,#2e5eb4)",accent:"#6ea0d4",tags:["Hahnenkamm Races","Historic Town"]},
  {id:"soelden",     category:"skiing",title:"Sölden",                  location:"Ötztal, Austria",          lat:46.9783,lon:10.9386,ap:"INN",icon:"⛷️",rating:4.92,reviews:2640,gradient:"linear-gradient(160deg,#0e1830,#1e3472,#2e5eb4)",accent:"#6ea0d4",tags:["007 Elements","Ötzi Glacier"]},
  {id:"lech",        category:"skiing",title:"Lech-Zürs",               location:"Ski Arlberg, Austria",     lat:47.2086,lon:10.1415,ap:"INN",icon:"⛷️",rating:4.95,reviews:2880,gradient:"linear-gradient(160deg,#0e1632,#1e3272,#2c5cb4)",accent:"#6ea0d4",tags:["Royal Retreat","Off-Piste Paradise"]},
  // ─── Europe — Italy ───────────────────────────────────────────────────────
  {id:"valgardena",  category:"skiing",title:"Val Gardena",             location:"Dolomites, Italy",         lat:46.5569,lon:11.7758,ap:"INN",icon:"⛷️",rating:4.93,reviews:2840,gradient:"linear-gradient(160deg,#101830,#203870,#3462b0)",accent:"#6ea0d2",tags:["Sella Ronda","UNESCO Dolomites"]},
  {id:"cortina",     category:"skiing",title:"Cortina d'Ampezzo",       location:"Dolomites, Italy",         lat:46.5362,lon:12.1360,ap:"VCE",icon:"⛷️",rating:4.94,reviews:2560,gradient:"linear-gradient(160deg,#111830,#213870,#3462b0)",accent:"#6e9ed2",tags:["2026 Olympics Host","Pink Mountain"]},
  {id:"cervinia",    category:"skiing",title:"Cervinia",                location:"Aosta Valley, Italy",      lat:45.9373,lon:7.6271,ap:"TRN",icon:"⛷️",rating:4.91,reviews:2120,gradient:"linear-gradient(160deg,#101832,#203872,#3462b2)",accent:"#6ea0d4",tags:["Matterhorn Italy","High Altitude"]},

  // ════════════════════ SURFING — WORLD TOP SPOTS ════════════════════

  // ─── Hawaii ───────────────────────────────────────────────────────
  {id:"pipeline",    category:"surfing",title:"Banzai Pipeline",          location:"Oahu, Hawaii",             lat:21.6622,lon:-158.0543,ap:"HNL",icon:"🏄",rating:4.99,reviews:6420,gradient:"linear-gradient(160deg,#003366,#0055a5,#00bcd4)",accent:"#00bcd4",tags:["Most Photographed Wave","Pro Tour Stop"],photo:"https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=800&h=600&fit=crop&q=80"},
  {id:"jaws",        category:"surfing",title:"Pe'ahi (Jaws)",            location:"Maui, Hawaii",             lat:20.9320,lon:-156.2520,ap:"OGG",icon:"🌊",rating:4.97,reviews:3240,gradient:"linear-gradient(160deg,#001a40,#003580,#0055cc)",accent:"#2288ff",tags:["Big Wave Capital","60ft+ Faces"],photo:"https://images.unsplash.com/photo-1455729552457-5c322b5db8c5?w=800&h=600&fit=crop&q=80"},
  {id:"honolua_bay", category:"surfing",title:"Honolua Bay",              location:"Maui, Hawaii",             lat:21.0204,lon:-156.6450,ap:"OGG",icon:"🏄",rating:4.95,reviews:2870,gradient:"linear-gradient(160deg,#003355,#005588,#0077cc)",accent:"#44aaff",tags:["World-Class Right","Pro Tour Finale"]},
  {id:"hanalei",     category:"surfing",title:"Hanalei Bay",             location:"Kauai, Hawaii",            lat:22.2152,lon:-159.4986,ap:"LIH",icon:"🏄",rating:4.93,reviews:2140,gradient:"linear-gradient(160deg,#00334d,#005580,#0077b3)",accent:"#33aadd",tags:["Gorgeous Bay","Long Rides"]},

  // ─── California ───────────────────────────────────────────────────
  {id:"trestles",    category:"surfing",title:"Trestles",                 location:"San Clemente, California", lat:33.3778,lon:-117.5792,ap:"SAN",icon:"🏄",rating:4.91,reviews:4100,gradient:"linear-gradient(160deg,#003344,#005577,#0077aa)",accent:"#3399cc",tags:["Pro Tour Classic","Performance Waves"],photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&q=80"},
  {id:"mavericks",   category:"surfing",title:"Mavericks",               location:"Half Moon Bay, California", lat:37.4952,lon:-122.4994,ap:"SFO",icon:"🌊",rating:4.90,reviews:2980,gradient:"linear-gradient(160deg,#001530,#003060,#004590)",accent:"#1166aa",tags:["Big Wave Icon","Invite-Only Contest"],photo:"https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=800&h=600&fit=crop&q=80"},
  {id:"blacks",      category:"surfing",title:"Black's Beach",           location:"San Diego, California",    lat:32.8828,lon:-117.2524,ap:"SAN",icon:"🏄",rating:4.88,reviews:3220,gradient:"linear-gradient(160deg,#002244,#004488,#0066cc)",accent:"#2288dd",tags:["Powerful Beach Break","La Jolla Gem"]},
  {id:"rincon_ca",   category:"surfing",title:"Rincon Point",            location:"Santa Barbara, California", lat:34.3726,lon:-119.4745,ap:"LAX",icon:"🏄",rating:4.92,reviews:3640,gradient:"linear-gradient(160deg,#003355,#005580,#007ab3)",accent:"#3399cc",tags:["Queen of the Coast","Long Point Break"]},

  // ─── East Coast USA ───────────────────────────────────────────────
  {id:"montauk",     category:"surfing",title:"Montauk",                  location:"New York",                 lat:41.0340,lon:-71.9570,ap:"JFK",icon:"🏄",rating:4.75,reviews:1840,gradient:"linear-gradient(160deg,#002244,#004488,#1166bb)",accent:"#3388cc",tags:["East Coast Classic","Hurricane Swells"]},
  {id:"cape_hatteras",category:"surfing",title:"Cape Hatteras",          location:"North Carolina",           lat:35.2332,lon:-75.5280,ap:"ORF",icon:"🏄",rating:4.82,reviews:2100,gradient:"linear-gradient(160deg,#002040,#004080,#1160a0)",accent:"#2288bb",tags:["Graveyard of the Atlantic","Swell Magnet"]},

  // ─── Mexico ───────────────────────────────────────────────────────
  {id:"puerto_escondido",category:"surfing",title:"Puerto Escondido",   location:"Oaxaca, Mexico",           lat:15.8700,lon:-97.0553,ap:"OAX",icon:"🌊",rating:4.96,reviews:4880,gradient:"linear-gradient(160deg,#003355,#005588,#006fcc)",accent:"#1188ee",tags:["Mexican Pipeline","Heaviest Shore Break"]},
  {id:"sayulita",    category:"surfing",title:"Sayulita",                location:"Nayarit, Mexico",          lat:20.8700,lon:-105.4400,ap:"PVR",icon:"🏄",rating:4.85,reviews:3280,gradient:"linear-gradient(160deg,#003344,#005577,#007799)",accent:"#22aacc",tags:["Beginner Friendly","Pueblo Mágico"]},

  // ─── Central America ──────────────────────────────────────────────
  {id:"pavones",     category:"surfing",title:"Pavones",                  location:"Costa Rica",               lat:8.3900,lon:-83.1700,ap:"SJO",icon:"🏄",rating:4.88,reviews:1980,gradient:"linear-gradient(160deg,#003344,#005566,#007788)",accent:"#22aacc",tags:["2nd Longest Left","Jungle Setting"]},
  {id:"witch_rock",  category:"surfing",title:"Witch's Rock",             location:"Guanacaste, Costa Rica",   lat:10.7800,lon:-85.8700,ap:"LIR",icon:"🏄",rating:4.86,reviews:1740,gradient:"linear-gradient(160deg,#002840,#004870,#0068a0)",accent:"#2288bb",tags:["Boat-Access Only","Volcanic Rock Break"]},
  {id:"punta_roca",  category:"surfing",title:"Punta Roca",               location:"El Salvador",              lat:13.4900,lon:-89.2000,ap:"SAL",icon:"🏄",rating:4.89,reviews:2100,gradient:"linear-gradient(160deg,#002244,#004488,#0055aa)",accent:"#1177cc",tags:["Central American Jewel","Long Right Point"]},

  // ─── Caribbean ────────────────────────────────────────────────────
  {id:"rincon_pr",   category:"surfing",title:"Rincón",                   location:"Puerto Rico",              lat:18.3400,lon:-67.2500,ap:"SJU",icon:"🏄",rating:4.87,reviews:2640,gradient:"linear-gradient(160deg,#003355,#005588,#0077bb)",accent:"#2299ee",tags:["Caribbean Surf Capital","Sunny Year-Round"]},
  {id:"bathsheba",   category:"surfing",title:"Bathsheba",                location:"Barbados",                 lat:13.1900,lon:-59.5300,ap:"BGI",icon:"🌊",rating:4.86,reviews:1640,gradient:"linear-gradient(160deg,#002244,#004480,#0066aa)",accent:"linear-gradient(#1188cc,#00aadd)",tags:["Soup Bowl Left","Atlantic Power"]},

  // ─── South America ────────────────────────────────────────────────
  {id:"chicama",     category:"surfing",title:"Chicama",                  location:"La Libertad, Peru",        lat:-7.8400,lon:-79.4500,ap:"LIM",icon:"🏄",rating:4.94,reviews:2960,gradient:"linear-gradient(160deg,#003355,#005588,#0066aa)",accent:"#1188cc",tags:["World's Longest Left","2.4km Ride"]},
  {id:"punta_hermosa",category:"surfing",title:"Punta Hermosa",          location:"Lima, Peru",               lat:-12.3300,lon:-76.8200,ap:"LIM",icon:"🏄",rating:4.85,reviews:2440,gradient:"linear-gradient(160deg,#002244,#003f7f,#0060b3)",accent:"#1188cc",tags:["Peru Pro Stop","Consistent Beach Break"]},
  {id:"punta_lobos", category:"surfing",title:"Punta de Lobos",          location:"Pichilemu, Chile",         lat:-34.4400,lon:-72.0800,ap:"SCL",icon:"🌊",rating:4.91,reviews:2120,gradient:"linear-gradient(160deg,#002040,#003878,#0050a8)",accent:"#0f7bcc",tags:["South American Big Wave","ISA World Site"]},
  {id:"florianopolis",category:"surfing",title:"Florianópolis",          location:"Santa Catarina, Brazil",   lat:-27.5954,lon:-48.5480,ap:"FLN",icon:"🏄",rating:4.84,reviews:3120,gradient:"linear-gradient(160deg,#003355,#00507f,#0070b3)",accent:"#1199dd",tags:["Magic Island","Brazil's Surf City"]},
  {id:"noronha_surf",category:"surfing",title:"Fernando de Noronha",     location:"Pernambuco, Brazil",       lat:-3.8542,lon:-32.4250,ap:"REC",icon:"🏄",rating:4.96,reviews:1980,gradient:"linear-gradient(160deg,#003344,#005577,#00789f)",accent:"#0099cc",tags:["UNESCO World Heritage","Crystal Waters"]},

  // ─── Europe — France ──────────────────────────────────────────────
  {id:"hossegor",    category:"surfing",title:"Hossegor",                 location:"Landes, France",           lat:43.6700,lon:-1.4300,ap:"BIQ",icon:"🏄",rating:4.93,reviews:5200,gradient:"linear-gradient(160deg,#003344,#005577,#007799)",accent:"#0099bb",tags:["Quiksilver Pro","Hollow Sand Barrels"],photo:"https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&h=600&fit=crop&q=80"},

  // ─── Europe — Spain ───────────────────────────────────────────────
  {id:"mundaka",     category:"surfing",title:"Mundaka",                  location:"Basque Country, Spain",   lat:43.4100,lon:-2.7000,ap:"BIO",icon:"🌊",rating:4.95,reviews:3840,gradient:"linear-gradient(160deg,#002244,#003f7f,#0055b3)",accent:"#0077cc",tags:["Best Left in Europe","River Mouth Barrel"]},

  // ─── Europe — Portugal ────────────────────────────────────────────
  {id:"supertubos",  category:"surfing",title:"Supertubos",               location:"Peniche, Portugal",        lat:39.3600,lon:-9.3700,ap:"LIS",icon:"🌊",rating:4.94,reviews:4100,gradient:"linear-gradient(160deg,#002244,#004480,#0066bb)",accent:"#1188ee",tags:["Portuguese Pipeline","WSL Stop"]},
  {id:"ericeira",    category:"surfing",title:"Ericeira",                 location:"Lisbon Coast, Portugal",   lat:38.9600,lon:-9.4200,ap:"LIS",icon:"🏄",rating:4.91,reviews:3600,gradient:"linear-gradient(160deg,#003355,#005588,#0077bb)",accent:"#2299ee",tags:["World Surf Reserve","Village Vibes"]},
  {id:"nazare",      category:"surfing",title:"Nazaré",                   location:"Silver Coast, Portugal",   lat:39.6000,lon:-9.0700,ap:"LIS",icon:"🌊",rating:4.98,reviews:4800,gradient:"linear-gradient(160deg,#001a40,#003380,#0055cc)",accent:"#2277ff",tags:["World Record Waves","100ft Monsters"]},

  // ─── Europe — UK / Ireland ────────────────────────────────────────
  {id:"newquay",     category:"surfing",title:"Newquay",                  location:"Cornwall, England",        lat:50.3700,lon:-5.1000,ap:"NQY",icon:"🏄",rating:4.78,reviews:3200,gradient:"linear-gradient(160deg,#003344,#005566,#007788)",accent:"#0099bb",tags:["UK Surf Capital","Fistral Beach"]},
  {id:"thurso_east", category:"surfing",title:"Thurso East",              location:"Caithness, Scotland",      lat:58.5900,lon:-3.5200,ap:"INV",icon:"🌊",rating:4.89,reviews:1640,gradient:"linear-gradient(160deg,#002040,#003878,#0050a0)",accent:"#0f7bcc",tags:["Scotland's Best Right","Arctic Swells"]},
  {id:"lahinch",     category:"surfing",title:"Lahinch",                  location:"County Clare, Ireland",    lat:52.9300,lon:-9.3400,ap:"SNN",icon:"🏄",rating:4.82,reviews:1820,gradient:"linear-gradient(160deg,#003344,#005566,#007788)",accent:"#0099bb",tags:["Irish Surf Town","Cliffs of Moher Backdrop"]},

  // ─── Europe — Canary Islands ──────────────────────────────────────
  {id:"la_santa",    category:"surfing",title:"La Santa",                 location:"Lanzarote, Canary Islands",lat:29.0600,lon:-13.6600,ap:"ACE",icon:"🌊",rating:4.90,reviews:2760,gradient:"linear-gradient(160deg,#002244,#004488,#0066cc)",accent:"#2288dd",tags:["Year-Round Swell","Lava Rock Reef"]},
  {id:"fuerteventura_surf",category:"surfing",title:"Fuerteventura",     location:"Canary Islands, Spain",    lat:28.3587,lon:-14.0537,ap:"FUE",icon:"🏄",rating:4.88,reviews:3100,gradient:"linear-gradient(160deg,#003355,#005588,#0077bb)",accent:"#2299ee",tags:["Windsurf & Surf Mecca","Consistent Atlantic"]},

  // ─── Africa — Morocco ─────────────────────────────────────────────
  {id:"anchor_point",category:"surfing",title:"Anchor Point",            location:"Agadir, Morocco",          lat:30.5300,lon:-9.7700,ap:"AGA",icon:"🌊",rating:4.92,reviews:3480,gradient:"linear-gradient(160deg,#002244,#003f7f,#0055b3)",accent:"#1177cc",tags:["Morocco's Best Right","Desert Point Break"]},
  {id:"taghazout",   category:"surfing",title:"Taghazout",               location:"Agadir, Morocco",          lat:30.5600,lon:-9.7100,ap:"AGA",icon:"🏄",rating:4.88,reviews:4200,gradient:"linear-gradient(160deg,#003344,#005577,#0077aa)",accent:"#2299cc",tags:["Surf Village","Hash Point & Killers"]},

  // ─── Africa — South Africa ────────────────────────────────────────
  {id:"jeffreys_bay",category:"surfing",title:"Jeffreys Bay",            location:"Eastern Cape, South Africa",lat:-34.0500,lon:24.9200,ap:"PLZ",icon:"🌊",rating:4.97,reviews:4640,gradient:"linear-gradient(160deg,#001a40,#003380,#0055cc)",accent:"#2277ff",tags:["J-Bay","WSL Championship Stop"]},
  {id:"cape_town_surf",category:"surfing",title:"Cape Town",             location:"Western Cape, South Africa",lat:-33.8900,lon:18.4200,ap:"CPT",icon:"🏄",rating:4.86,reviews:2880,gradient:"linear-gradient(160deg,#002244,#004488,#0066cc)",accent:"#2288dd",tags:["Table Mountain Backdrop","Cold Water Barrels"]},

  // ─── Bali / Indonesia ─────────────────────────────────────────────
  {id:"uluwatu",     category:"surfing",title:"Uluwatu",                  location:"Bali, Indonesia",          lat:-8.8291,lon:115.0850,ap:"DPS",icon:"🌊",rating:4.96,reviews:6800,gradient:"linear-gradient(160deg,#002244,#003f7f,#0055b3)",accent:"#1188ee",tags:["Cliff Temple","WSL Events"]},
  {id:"padang_padang",category:"surfing",title:"Padang Padang",          location:"Bali, Indonesia",          lat:-8.8105,lon:115.0938,ap:"DPS",icon:"🌊",rating:4.93,reviews:4320,gradient:"linear-gradient(160deg,#001f40,#003880,#0055bb)",accent:"#2288ff",tags:["Eat Pray Love Beach","Barreling Left"]},
  {id:"keramas",     category:"surfing",title:"Keramas",                  location:"Bali, Indonesia",          lat:-8.5764,lon:115.3190,ap:"DPS",icon:"🏄",rating:4.85,reviews:2640,gradient:"linear-gradient(160deg,#003355,#005588,#0077bb)",accent:"#2299ee",tags:["Night Surfing","OC Pro Contest"]},
  {id:"mentawais",   category:"surfing",title:"Mentawai Islands",        location:"West Sumatra, Indonesia",  lat:-2.3500,lon:99.8500,ap:"PDG",icon:"🌊",rating:4.98,reviews:3200,gradient:"linear-gradient(160deg,#001a40,#003080,#0050cc)",accent:"#2277ff",tags:["Perfect Waves","HT's & Lance's Right"]},

  // ─── Philippines ──────────────────────────────────────────────────
  {id:"cloud9",      category:"surfing",title:"Cloud 9",                  location:"Siargao, Philippines",     lat:9.8600,lon:126.0600,ap:"CEB",icon:"🌊",rating:4.95,reviews:3640,gradient:"linear-gradient(160deg,#002244,#004488,#0066cc)",accent:"#2288dd",tags:["Asia's Best Wave","Hollow Reef Right"]},

  // ─── Fiji ─────────────────────────────────────────────────────────
  {id:"cloudbreak",  category:"surfing",title:"Cloudbreak",              location:"Tavarua, Fiji",            lat:-17.7748,lon:177.2362,ap:"NAN",icon:"🌊",rating:4.97,reviews:2980,gradient:"linear-gradient(160deg,#001a40,#003380,#0055cc)",accent:"#2277ff",tags:["South Pacific Power","Boat-Access Only"]},
  {id:"restaurants_fiji",category:"surfing",title:"Restaurants",        location:"Tavarua, Fiji",            lat:-17.7800,lon:177.2400,ap:"NAN",icon:"🏄",rating:4.89,reviews:1840,gradient:"linear-gradient(160deg,#003355,#005588,#007fbb)",accent:"#33aadd",tags:["Tavarua Left","Super Consistent"]},

  // ─── Tahiti ───────────────────────────────────────────────────────
  {id:"teahupoo",    category:"surfing",title:"Teahupo'o",               location:"Tahiti, French Polynesia", lat:-17.8672,lon:-149.2594,ap:"PPT",icon:"🌊",rating:4.99,reviews:3840,gradient:"linear-gradient(160deg,#001530,#003070,#0050bb)",accent:"#1166ee",tags:["Scariest Wave on Earth","2024 Olympics"]},

  // ─── Maldives ─────────────────────────────────────────────────────
  {id:"pasta_point", category:"surfing",title:"Pasta Point",             location:"Maldives",                 lat:4.7500,lon:72.9700,ap:"MLE",icon:"🏄",rating:4.94,reviews:2120,gradient:"linear-gradient(160deg,#003344,#005577,#007fa0)",accent:"#00bbdd",tags:["Indian Ocean Luxury","Resort Access"]},
  {id:"jailbreaks",  category:"surfing",title:"Jailbreaks",              location:"South Malé Atoll, Maldives",lat:3.5000,lon:73.0000,ap:"MLE",icon:"🌊",rating:4.88,reviews:1640,gradient:"linear-gradient(160deg,#002244,#004488,#006faa)",accent:"#1199cc",tags:["Dhow Boat Sessions","Crystal Water"]},

  // ─── Australia ────────────────────────────────────────────────────
  {id:"snapper_rocks",category:"surfing",title:"Snapper Rocks",         location:"Gold Coast, Queensland",   lat:-28.1640,lon:153.5546,ap:"OOL",icon:"🌊",rating:4.94,reviews:5400,gradient:"linear-gradient(160deg,#002244,#003f7f,#0055b3)",accent:"#1177cc",tags:["Superbank","WSL Opener"]},
  {id:"bells_beach",  category:"surfing",title:"Bells Beach",           location:"Torquay, Victoria",        lat:-38.3700,lon:144.2800,ap:"MEL",icon:"🌊",rating:4.91,reviews:3680,gradient:"linear-gradient(160deg,#003355,#005588,#0077bb)",accent:"#2299ee",tags:["Rip Curl Pro","Australia's Most Famous"]},
  {id:"margaret_river_surf",category:"surfing",title:"Margaret River",  location:"Western Australia",        lat:-34.0500,lon:115.0900,ap:"PER",icon:"🌊",rating:4.89,reviews:2840,gradient:"linear-gradient(160deg,#002244,#004488,#0066cc)",accent:"#2288dd",tags:["Wine & Waves","Championship Reef"]},
  {id:"the_pass",    category:"surfing",title:"The Pass",               location:"Byron Bay, NSW",           lat:-28.6500,lon:153.5800,ap:"OOL",icon:"🏄",rating:4.87,reviews:4100,gradient:"linear-gradient(160deg,#003355,#005580,#007faa)",accent:"#2299cc",tags:["Byron Bay Icon","Long Mellow Rights"]},

  // ─── New Zealand ──────────────────────────────────────────────────
  {id:"raglan",      category:"surfing",title:"Raglan",                  location:"Waikato, New Zealand",     lat:-37.8000,lon:174.8700,ap:"AKL",icon:"🌊",rating:4.88,reviews:2420,gradient:"linear-gradient(160deg,#002244,#004488,#0066bb)",accent:"#1188dd",tags:["Southern Hemisphere Left","Endless Rides"]},

  // ─── Japan ────────────────────────────────────────────────────────
  {id:"chiba_surf",  category:"surfing",title:"Chiba Coast",             location:"Chiba Prefecture, Japan",  lat:35.3200,lon:140.3800,ap:"NRT",icon:"🏄",rating:4.78,reviews:2100,gradient:"linear-gradient(160deg,#003344,#005566,#007799)",accent:"#0099bb",tags:["Tokyo's Backyard","Beach Break Frenzy"]},

  // ═══════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════
  // ─── BEACH & TAN (TOP BEACHES WORLDWIDE) ────────────────────────
  // ═══════════════════════════════════════════════════════════════════

  // ── Caribbean ─────────────────────────────────────────────────────
  {id:"beach_gcm",      category:"tanning",title:"Seven Mile Beach",       location:"Grand Cayman, Cayman Islands",  lat:19.3180,lon:-81.3902,ap:"GCM",icon:"🏖️",rating:4.97,reviews:14200,gradient:"linear-gradient(160deg,#003344,#006688,#00aabb)",accent:"#00ddee",tags:["World's Best Beach","Crystal Caribbean"]},
  {id:"beach_grace",    category:"tanning",title:"Grace Bay",              location:"Providenciales, Turks & Caicos",lat:21.7918,lon:-72.2598,ap:"PLS",icon:"🏖️",rating:4.98,reviews:11900,gradient:"linear-gradient(160deg,#002233,#004466,#0077aa)",accent:"#00bbee",tags:["#1 Ranked Beach","Swim-Through Reef"]},
  {id:"beach_shoal",    category:"tanning",title:"Shoal Bay East",         location:"Anguilla",                      lat:18.2130,lon:-63.0420,ap:"AXA",icon:"🏖️",rating:4.96,reviews:4800,gradient:"linear-gradient(160deg,#003355,#0055aa,#0088dd)",accent:"#33bbff",tags:["Powdery White Sand","Quiet & Exclusive"]},
  {id:"beach_eagle",    category:"tanning",title:"Eagle Beach",            location:"Aruba",                         lat:12.5600,lon:-70.0850,ap:"AUA",icon:"🏖️",rating:4.95,reviews:13400,gradient:"linear-gradient(160deg,#003355,#00558a,#0088bb)",accent:"#22aadd",tags:["Iconic Divi Tree","Year-Round Sun"]},
  {id:"beach_magens",   category:"tanning",title:"Magens Bay",             location:"St. Thomas, USVI",              lat:18.3700,lon:-64.9330,ap:"STT",icon:"🏖️",rating:4.93,reviews:9200,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#33aaff",tags:["Protected Horseshoe","Palm-Lined Shore"]},
  {id:"beach_stlucia",  category:"tanning",title:"Anse Chastanet",         location:"St. Lucia",                     lat:13.8630,lon:-61.0750,ap:"UVF",icon:"🏖️",rating:4.96,reviews:6200,gradient:"linear-gradient(160deg,#001a22,#003844,#006677)",accent:"#00aabb",tags:["Piton Views","Volcano Backdrop"]},
  {id:"beach_barbados", category:"tanning",title:"Bottom Bay",             location:"Barbados",                      lat:13.0700,lon:-59.4450,ap:"BGI",icon:"🏖️",rating:4.94,reviews:7800,gradient:"linear-gradient(160deg,#003344,#006688,#0099aa)",accent:"#00ccdd",tags:["Atlantic Wonder","Coral Cliffs"]},
  {id:"beach_orient",   category:"tanning",title:"Orient Bay",             location:"Saint-Martin, French Antilles",  lat:18.1000,lon:-63.0300,ap:"SXM",icon:"🏖️",rating:4.91,reviews:8600,gradient:"linear-gradient(160deg,#003355,#0055aa,#0088cc)",accent:"#33aadd",tags:["St-Barths Vibes","Water Sports Hub"]},
  {id:"beach_tobago",   category:"tanning",title:"Pigeon Point",           location:"Tobago",                        lat:11.1650,lon:-60.8400,ap:"TAB",icon:"🏖️",rating:4.90,reviews:5400,gradient:"linear-gradient(160deg,#002233,#004466,#0077aa)",accent:"#00bbdd",tags:["Caribbean Soul","Offshore Coral"]},
  {id:"beach_negril",   category:"tanning",title:"Seven Mile Beach Negril", location:"Jamaica",                      lat:18.3630,lon:-78.3440,ap:"MBJ",icon:"🏖️",rating:4.92,reviews:16800,gradient:"linear-gradient(160deg,#002200,#004400,#007700)",accent:"#44cc44",tags:["Legendary Sunsets","Cliff Diving"]},
  {id:"beach_holbox",   category:"tanning",title:"Holbox Island",          location:"Quintana Roo, Mexico",          lat:21.5245,lon:-87.3690,ap:"CUN",icon:"🏖️",rating:4.96,reviews:9300,gradient:"linear-gradient(160deg,#002233,#005566,#0088aa)",accent:"#33bbcc",tags:["No Cars","Whale Shark Season"]},
  {id:"beach_tulum",    category:"tanning",title:"Tulum Beach",            location:"Tulum, Mexico",                 lat:20.1500,lon:-87.4630,ap:"CUN",icon:"🏖️",rating:4.93,reviews:21400,gradient:"linear-gradient(160deg,#003322,#006644,#009966)",accent:"#22ccaa",tags:["Mayan Ruins Backdrop","Crystal Cenotes"]},
  {id:"beach_cozumel",  category:"tanning",title:"Playa Palancar",         location:"Cozumel, Mexico",               lat:20.3500,lon:-87.0250,ap:"CZM",icon:"🏖️",rating:4.94,reviews:8900,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#33aaff",tags:["2nd Largest Reef","Crystal Visibility"]},
  {id:"beach_rivmaya",  category:"tanning",title:"Riviera Maya",           location:"Quintana Roo, Mexico",          lat:20.6300,lon:-87.0790,ap:"CUN",icon:"🏖️",rating:4.88,reviews:38400,gradient:"linear-gradient(160deg,#002233,#004466,#0077aa)",accent:"#22aacc",tags:["Resorts + Cenotes","Mesoamerican Reef"]},

  // ── Mexico Pacific ─────────────────────────────────────────────────
  {id:"beach_sayulita",category:"tanning",title:"Sayulita",                location:"Nayarit, Mexico",               lat:20.8689,lon:-105.3977,ap:"PVR",icon:"🏖️",rating:4.91,reviews:11200,gradient:"linear-gradient(160deg,#332200,#665500,#998800)",accent:"#ddbb22",tags:["Bohemian Surf Town","Taco Heaven"]},
  {id:"beach_loscabos",category:"tanning",title:"Playa del Amor",          location:"Los Cabos, Mexico",             lat:22.9325,lon:-109.9100,ap:"SJD",icon:"🏖️",rating:4.94,reviews:14600,gradient:"linear-gradient(160deg,#1a0d00,#4d2600,#804000)",accent:"#cc8833",tags:["El Arco Rock Arch","Sea of Cortez"]},

  // ── Central / South America ───────────────────────────────────────
  {id:"beach_manuelant",category:"tanning",title:"Manuel Antonio",         location:"Puntarenas, Costa Rica",        lat:9.3850,lon:-84.1420,ap:"SJO",icon:"🏖️",rating:4.93,reviews:12400,gradient:"linear-gradient(160deg,#001e00,#003d00,#006600)",accent:"#44cc44",tags:["Wildlife Everywhere","Rainforest Meets Sand"]},
  {id:"beach_bocas",    category:"tanning",title:"Bocas del Toro",         location:"Panama",                        lat:9.3500,lon:-82.2420,ap:"BOC",icon:"🏖️",rating:4.90,reviews:7800,gradient:"linear-gradient(160deg,#002233,#004466,#007799)",accent:"#33bbcc",tags:["Caribbean Jungle","Bioluminescent Bay"]},
  {id:"beach_noronha",  category:"tanning",title:"Fernando de Noronha",    location:"Pernambuco, Brazil",            lat:-3.8550,lon:-32.4270,ap:"FEN",icon:"🏖️",rating:4.99,reviews:5600,gradient:"linear-gradient(160deg,#001428,#002855,#004491)",accent:"#3366dd",tags:["Most Pristine Atlantic","Limited Visitors"]},
  {id:"beach_floripa",  category:"tanning",title:"Praia Mole",             location:"Florianópolis, Brazil",         lat:-27.6050,lon:-48.4420,ap:"FLN",icon:"🏖️",rating:4.88,reviews:9200,gradient:"linear-gradient(160deg,#002244,#004488,#0066cc)",accent:"#3388ee",tags:["Brazil's Most Beautiful","Surf + Lagoon"]},

  // ── USA ───────────────────────────────────────────────────────────
  {id:"beach_ob",       category:"tanning",title:"Outer Banks OBX",        location:"North Carolina, USA",           lat:35.5582,lon:-75.4665,ap:"ORF",icon:"🏖️",rating:4.89,reviews:18600,gradient:"linear-gradient(160deg,#001a28,#003350,#005580)",accent:"#3388bb",tags:["Wild Horses","Barrier Island Drive"]},
  {id:"beach_siestakey",category:"tanning",title:"Siesta Key Beach",       location:"Sarasota, Florida",             lat:27.2671,lon:-82.5471,ap:"SRQ",icon:"🏖️",rating:4.94,reviews:16800,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#33aaff",tags:["World's Finest Sand","Gulf Sunset Views"]},
  {id:"beach_clearwater",category:"tanning",title:"Clearwater Beach",      location:"Florida, USA",                  lat:27.9783,lon:-82.8279,ap:"TPA",icon:"🏖️",rating:4.91,reviews:22400,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#22aaff",tags:["Voted #1 USA Beach","Pier 60 Sunsets"]},
  {id:"beach_keywest",  category:"tanning",title:"Key West Beaches",       location:"Florida Keys, USA",             lat:24.5551,lon:-81.7800,ap:"EYW",icon:"🏖️",rating:4.87,reviews:14200,gradient:"linear-gradient(160deg,#001a22,#003344,#005566)",accent:"#22aacc",tags:["Southernmost Point","Duval Street"]},
  {id:"beach_destin",   category:"tanning",title:"Emerald Coast Destin",   location:"Florida, USA",                  lat:30.3935,lon:-86.4958,ap:"VPS",icon:"🏖️",rating:4.92,reviews:19800,gradient:"linear-gradient(160deg,#003344,#005577,#007faa)",accent:"#33bbcc",tags:["Emerald Water","Sugar-White Sand"]},
  {id:"beach_myrtle",   category:"tanning",title:"Myrtle Beach",           location:"South Carolina, USA",           lat:33.6891,lon:-78.8867,ap:"MYR",icon:"🏖️",rating:4.82,reviews:28600,gradient:"linear-gradient(160deg,#002244,#004477,#0066aa)",accent:"#2288cc",tags:["60 Miles of Coast","Golf & Boardwalk"]},
  {id:"beach_miami",    category:"tanning",title:"South Beach Miami",      location:"Miami Beach, Florida",          lat:25.7907,lon:-80.1300,ap:"MIA",icon:"🏖️",rating:4.88,reviews:42800,gradient:"linear-gradient(160deg,#001a28,#003355,#005588)",accent:"#3399dd",tags:["Art Deco","See & Be Seen"]},

  // ── Hawaii ─────────────────────────────────────────────────────────
  {id:"beach_lanikai",  category:"tanning",title:"Lanikai Beach",          location:"Oahu, Hawaii",                  lat:21.3900,lon:-157.7200,ap:"HNL",icon:"🏖️",rating:4.98,reviews:12400,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#33aaff",tags:["Mokulua Islands View","Powdery White Sand"]},
  {id:"beach_hapuna",   category:"tanning",title:"Hapuna Beach",           location:"Big Island, Hawaii",            lat:20.0040,lon:-155.8270,ap:"KOA",icon:"🏖️",rating:4.96,reviews:8600,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#33bbff",tags:["Hawaii's Best Beach","Snorkeling Coves"]},
  {id:"beach_kapalua",  category:"tanning",title:"Kapalua Bay",            location:"Maui, Hawaii",                  lat:20.9990,lon:-156.6750,ap:"OGG",icon:"🏖️",rating:4.95,reviews:7800,gradient:"linear-gradient(160deg,#003344,#006688,#0099bb)",accent:"#22bbdd",tags:["Crescent Bay","Spinner Dolphins"]},

  // ── Europe / Mediterranean ─────────────────────────────────────────
  {id:"beach_positano", category:"tanning",title:"Positano Beach",         location:"Amalfi Coast, Italy",           lat:40.6280,lon:14.4850,ap:"NAP",icon:"🏖️",rating:4.92,reviews:22800,gradient:"linear-gradient(160deg,#001a33,#003366,#004d99)",accent:"#3377dd",tags:["Cliffside Pastel Town","Amalfi Drive"]},
  {id:"beach_sardinia", category:"tanning",title:"Cala Mariolu",           location:"Sardinia, Italy",               lat:40.0980,lon:9.5600,ap:"CAG",icon:"🏖️",rating:4.98,reviews:8400,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#33aaff",tags:["Caribbean-Clear Water","Boulders + Coves"]},
  {id:"beach_algarve",  category:"tanning",title:"Praia da Marinha",       location:"Algarve, Portugal",             lat:37.0870,lon:-8.4110,ap:"FAO",icon:"🏖️",rating:4.96,reviews:14600,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#3399ff",tags:["Rock Arch + Sea Caves","Top10 Europe"]},
  {id:"beach_santorini",category:"tanning",title:"Santorini Red Beach",    location:"Santorini, Greece",             lat:36.3470,lon:25.3960,ap:"JTR",icon:"🏖️",rating:4.91,reviews:19400,gradient:"linear-gradient(160deg,#330000,#660000,#990000)",accent:"#dd4444",tags:["Volcanic Red Cliffs","Caldera Views"]},
  {id:"beach_mykonos",  category:"tanning",title:"Paradise Beach Mykonos", location:"Mykonos, Greece",               lat:37.4218,lon:25.3472,ap:"JMK",icon:"🏖️",rating:4.89,reviews:21600,gradient:"linear-gradient(160deg,#003355,#0055aa,#0088dd)",accent:"#33bbff",tags:["Non-Stop Party Beach","Crystal Aegean"]},
  {id:"beach_zakynthos",category:"tanning",title:"Navagio Shipwreck Beach", location:"Zakynthos, Greece",            lat:37.8590,lon:20.6240,ap:"ZTH",icon:"🏖️",rating:4.97,reviews:16800,gradient:"linear-gradient(160deg,#001433,#003377,#005ac0)",accent:"#3377ee",tags:["Most Photographed Beach","Accessible by Boat Only"]},
  {id:"beach_hvar",     category:"tanning",title:"Hvar Hula Hula Beach",   location:"Hvar Island, Croatia",          lat:43.1730,lon:16.4410,ap:"SPU",icon:"🏖️",rating:4.90,reviews:12200,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#3399ff",tags:["Lavender Island","Adriatic Glamour"]},
  {id:"beach_dubrovnik",category:"tanning",title:"Banje Beach Dubrovnik",  location:"Dubrovnik, Croatia",            lat:42.6340,lon:18.1250,ap:"DBV",icon:"🏖️",rating:4.88,reviews:14600,gradient:"linear-gradient(160deg,#001a33,#003366,#0055aa)",accent:"#3377cc",tags:["Old City Backdrop","Adriatic Clear"]},
  {id:"beach_milos",    category:"tanning",title:"Sarakiniko Moon Beach",  location:"Milos Island, Greece",          lat:36.7570,lon:24.3900,ap:"MLO",icon:"🏖️",rating:4.97,reviews:8900,gradient:"linear-gradient(160deg,#e8e8e8,#cccccc,#aaaaaa)",accent:"#888888",tags:["White Volcanic Pumice","Lunar Landscape"]},
  {id:"beach_ibiza",    category:"tanning",title:"Ses Salines Ibiza",      location:"Ibiza, Spain",                  lat:38.8720,lon:1.3960,ap:"IBZ",icon:"🏖️",rating:4.92,reviews:18400,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#3399ff",tags:["Natural Park Beach","White Island Vibes"]},
  {id:"beach_formentera",category:"tanning",title:"Formentera Illetes",    location:"Formentera, Spain",             lat:38.7310,lon:1.3820,ap:"IBZ",icon:"🏖️",rating:4.97,reviews:11800,gradient:"linear-gradient(160deg,#003355,#005588,#0088bb)",accent:"#33aadd",tags:["Caribbean of Europe","Car-Free Island"]},
  {id:"beach_menorca",  category:"tanning",title:"Cala Macarella",         location:"Menorca, Spain",                lat:39.9010,lon:3.8080,ap:"MAH",icon:"🏖️",rating:4.96,reviews:9400,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#3399ff",tags:["Emerald Cove","Untouched Pine Forest"]},
  {id:"beach_cotedazur",category:"tanning",title:"Côte d'Azur Antibes",   location:"French Riviera, France",        lat:43.5806,lon:7.1287,ap:"NCE",icon:"🏖️",rating:4.88,reviews:22800,gradient:"linear-gradient(160deg,#00133d,#00266e,#0044b3)",accent:"#3366ee",tags:["French Riviera","Billionaire Yachts"]},

  // ── Africa / Indian Ocean ──────────────────────────────────────────
  {id:"beach_diani",    category:"tanning",title:"Diani Beach",            location:"Mombasa, Kenya",                lat:-4.2720,lon:39.5930,ap:"MBA",icon:"🏖️",rating:4.93,reviews:8800,gradient:"linear-gradient(160deg,#003322,#006644,#009966)",accent:"#22cc88",tags:["White Coral Sand","Colobus Monkeys"]},
  {id:"beach_zanzibar", category:"tanning",title:"Nungwi Beach",           location:"Zanzibar, Tanzania",            lat:-5.7215,lon:39.2978,ap:"ZNZ",icon:"🏖️",rating:4.95,reviews:12400,gradient:"linear-gradient(160deg,#003344,#006688,#0099bb)",accent:"#22bbdd",tags:["Spice Island","Dhow Sunset Cruises"]},
  {id:"beach_seychelles",category:"tanning",title:"Anse Source d'Argent",  location:"La Digue, Seychelles",          lat:-4.3636,lon:55.8381,ap:"SEZ",icon:"🏖️",rating:4.99,reviews:10200,gradient:"linear-gradient(160deg,#003344,#006688,#0099bb)",accent:"#33ccdd",tags:["Most Photographed Beach","Granite Boulders"]},
  {id:"beach_praslin",  category:"tanning",title:"Anse Lazio",             location:"Praslin, Seychelles",           lat:-4.2836,lon:55.7133,ap:"PRI",icon:"🏖️",rating:4.98,reviews:8600,gradient:"linear-gradient(160deg,#003344,#006688,#0099cc)",accent:"#22bbee",tags:["Verdure d'Eau Clear","World Top10"]},
  {id:"beach_mauritius",category:"tanning",title:"Belle Mare Plage",       location:"Mauritius",                     lat:-20.2700,lon:57.7700,ap:"MRU",icon:"🏖️",rating:4.95,reviews:11200,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#3399ff",tags:["Turquoise Lagoon","Indian Ocean Luxury"]},

  // ── Southeast Asia ─────────────────────────────────────────────────
  {id:"beach_railay",   category:"tanning",title:"Railay Beach",           location:"Krabi, Thailand",               lat:8.0107,lon:98.8382,ap:"KBV",icon:"🏖️",rating:4.97,reviews:18400,gradient:"linear-gradient(160deg,#002233,#005566,#009999)",accent:"#22ddcc",tags:["Limestone Cliffs","Accessible by Boat Only"]},
  {id:"beach_kohsamui", category:"tanning",title:"Chaweng Beach",          location:"Koh Samui, Thailand",           lat:9.5317,lon:100.0672,ap:"USM",icon:"🏖️",rating:4.88,reviews:24600,gradient:"linear-gradient(160deg,#002233,#004466,#0077aa)",accent:"#22aacc",tags:["Gulf of Thailand","Full Moon Parties"]},
  {id:"beach_phiphi",   category:"tanning",title:"Maya Bay Phi Phi",       location:"Krabi, Thailand",               lat:7.6775,lon:98.7669,ap:"HKT",icon:"🏖️",rating:4.94,reviews:22800,gradient:"linear-gradient(160deg,#002233,#005566,#008888)",accent:"#22cccc",tags:["The Beach Film Location","Emerald Lagoon"]},
  {id:"beach_elnido",   category:"tanning",title:"El Nido Bacuit Bay",     location:"Palawan, Philippines",          lat:11.1784,lon:119.3944,ap:"ENI",icon:"🏖️",rating:4.98,reviews:16200,gradient:"linear-gradient(160deg,#003344,#006677,#0099aa)",accent:"#22bbcc",tags:["UNESCO Biosphere","Kayak the Lagoons"]},
  {id:"beach_boracay",  category:"tanning",title:"White Beach Boracay",    location:"Aklan, Philippines",            lat:11.9674,lon:121.9248,ap:"MPH",icon:"🏖️",rating:4.92,reviews:28800,gradient:"linear-gradient(160deg,#003355,#005588,#0088bb)",accent:"#33aadd",tags:["World Famous White Beach","4km of Sand"]},
  {id:"beach_nusapenida",category:"tanning",title:"Kelingking Secret Beach",location:"Nusa Penida, Indonesia",        lat:-8.8340,lon:115.4560,ap:"DPS",icon:"🏖️",rating:4.97,reviews:19400,gradient:"linear-gradient(160deg,#002233,#004466,#007799)",accent:"#33aacc",tags:["T-Rex Cliff","Instagram Iconic"]},
  {id:"beach_gilit",    category:"tanning",title:"Gili Trawangan",         location:"Lombok, Indonesia",             lat:-8.3520,lon:116.0500,ap:"LOP",icon:"🏖️",rating:4.90,reviews:14600,gradient:"linear-gradient(160deg,#003344,#006688,#0099bb)",accent:"#22ccdd",tags:["No Cars No Motorized Vehicles","Turtle Sanctuary"]},
  {id:"beach_aitutaki", category:"tanning",title:"Aitutaki Lagoon",        location:"Aitutaki, Cook Islands",        lat:-18.8588,lon:-159.7893,ap:"AIT",icon:"🏖️",rating:4.99,reviews:4600,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#33bbff",tags:["World's Most Beautiful Lagoon","Remote Paradise"]},

  // ── Australia / Pacific ────────────────────────────────────────────
  {id:"beach_whitehaven",category:"tanning",title:"Whitehaven Beach",      location:"Whitsundays, Queensland",       lat:-20.2788,lon:149.0416,ap:"PPP",icon:"🏖️",rating:4.98,reviews:12800,gradient:"linear-gradient(160deg,#003344,#006688,#0099bb)",accent:"#33ccee",tags:["Hill Inlet Swirl","99% Silica Sand"]},
  {id:"beach_cable",    category:"tanning",title:"Cable Beach",            location:"Broome, Western Australia",     lat:-17.9500,lon:122.1800,ap:"BME",icon:"🏖️",rating:4.92,reviews:8600,gradient:"linear-gradient(160deg,#1a0d00,#4d2a00,#8c4a00)",accent:"#dd8833",tags:["Camel Sunset Ride","22km Red Pindan"]},
  {id:"beach_portdouglas",category:"tanning",title:"Four Mile Beach",      location:"Port Douglas, Queensland",      lat:-16.4840,lon:145.4640,ap:"CNS",icon:"🏖️",rating:4.91,reviews:9200,gradient:"linear-gradient(160deg,#003344,#006688,#0099bb)",accent:"#22bbdd",tags:["Great Barrier Reef Gateway","Rainforest Meets Sea"]},

  // ── Hiking ─────────────────────────────────────────────────────────
  {id:"torres",       category:"hiking",title:"Torres del Paine W Trek",location:"Patagonia, Chile",lat:-51.0000,lon:-73.0000,ap:"PUQ",icon:"🥾",rating:4.98,reviews:8900,gradient:"linear-gradient(160deg,#1a2a3a,#2a5a7a,#4a9aba)",accent:"#6abada",tags:["5-Day W Trek","Glaciers & Granite"],photo:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop&q=80"},
  {id:"inca_trail",   category:"hiking",title:"Inca Trail to Machu Picchu",location:"Cusco, Peru",lat:-13.1631,lon:-72.5450,ap:"CUZ",icon:"🥾",rating:4.97,reviews:12400,gradient:"linear-gradient(160deg,#2a1a00,#6a4a1a,#aa8a3a)",accent:"#ccaa55",tags:["4-Day Classic","Sun Gate Finish"],photo:"https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop&q=80"},
  {id:"kilimanjaro",  category:"hiking",title:"Mount Kilimanjaro",location:"Kilimanjaro, Tanzania",lat:-3.0674,lon:37.3556,ap:"JRO",icon:"🥾",rating:4.96,reviews:7600,gradient:"linear-gradient(160deg,#1a3a1a,#2a6a2a,#5aaa5a)",accent:"#7aca7a",tags:["Roof of Africa","7 Routes"],photo:"https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&h=600&fit=crop&q=80"},
  {id:"gr20",         category:"hiking",title:"GR20 Corsica",location:"Corsica, France",lat:42.1750,lon:9.0833,ap:"AJA",icon:"🥾",rating:4.94,reviews:4200,gradient:"linear-gradient(160deg,#2a1a2a,#5a3a5a,#8a6a8a)",accent:"#aa8aaa",tags:["Europe's Toughest","16 Stages"]},
  {id:"appalachian",  category:"hiking",title:"Appalachian Trail (Smokies)",location:"North Carolina, USA",lat:35.5634,lon:-83.4984,ap:"TYS",icon:"🥾",rating:4.93,reviews:15200,gradient:"linear-gradient(160deg,#1a2a1a,#3a5a3a,#6a8a6a)",accent:"#8aaa8a",tags:["Thru-Hike Section","Great Smoky Mtns"]},
  {id:"annapurna",    category:"hiking",title:"Annapurna Circuit",location:"Gandaki, Nepal",lat:28.5960,lon:83.8200,ap:"PKR",icon:"🥾",rating:4.97,reviews:6800,gradient:"linear-gradient(160deg,#0a1a3a,#1a4a7a,#3a8aba)",accent:"#5aaada",tags:["Thorong La Pass","Tea Houses"]},
  {id:"milford_track",category:"hiking",title:"Milford Track",location:"Fiordland, New Zealand",lat:-44.8937,lon:167.9188,ap:"ZQN",icon:"🥾",rating:4.96,reviews:5400,gradient:"linear-gradient(160deg,#0a2a1a,#1a5a3a,#3a8a6a)",accent:"#5aaa8a",tags:["Finest Walk","Sutherland Falls"]},
  {id:"camino",       category:"hiking",title:"Camino de Santiago",location:"Galicia, Spain",lat:42.8782,lon:-8.5448,ap:"SCQ",icon:"🥾",rating:4.95,reviews:18600,gradient:"linear-gradient(160deg,#3a2a0a,#7a5a1a,#baa03a)",accent:"#ddc055",tags:["French Way","800km Pilgrimage"]},
  {id:"everest_bc",   category:"hiking",title:"Everest Base Camp Trek",location:"Khumbu, Nepal",lat:28.0025,lon:86.8528,ap:"LUA",icon:"🥾",rating:4.98,reviews:9200,gradient:"linear-gradient(160deg,#0a0a2a,#1a2a5a,#3a5a9a)",accent:"#5a7aba",tags:["5,364m Base Camp","Sherpa Culture"],photo:"https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&h=600&fit=crop&q=80"},
  {id:"haute_route",  category:"hiking",title:"Haute Route",location:"Valais, Switzerland",lat:46.0207,lon:7.7491,ap:"GVA",icon:"🥾",rating:4.95,reviews:3800,gradient:"linear-gradient(160deg,#1a1a3a,#3a3a6a,#6a6a9a)",accent:"#8a8aba",tags:["Chamonix to Zermatt","Alpine Classic"]},
  {id:"overland",     category:"hiking",title:"Overland Track",location:"Tasmania, Australia",lat:-41.6395,lon:145.9606,ap:"LST",icon:"🥾",rating:4.93,reviews:4100,gradient:"linear-gradient(160deg,#1a3a2a,#2a6a4a,#4a9a7a)",accent:"#6aba9a",tags:["Cradle Mountain","6-Day Traverse"]},
  {id:"laugavegur",   category:"hiking",title:"Laugavegur Trail",location:"Highlands, Iceland",lat:63.8600,lon:-19.1800,ap:"KEF",icon:"🥾",rating:4.94,reviews:3600,gradient:"linear-gradient(160deg,#0a1a2a,#1a3a5a,#3a6a9a)",accent:"#5a8aba",tags:["Rainbow Mountains","Hot Springs"]},
];

const US_AIRPORTS = [
  { code:"JFK", label:"New York",      flag:"🗽" },
  { code:"LAX", label:"Los Angeles",   flag:"🎬" },
  { code:"SFO", label:"San Francisco", flag:"🌉" },
  { code:"ORD", label:"Chicago",       flag:"🏙️" },
  { code:"MIA", label:"Miami",         flag:"🌴" },
  { code:"SEA", label:"Seattle",       flag:"☕" },
  { code:"BOS", label:"Boston",        flag:"🦞" },
  { code:"ATL", label:"Atlanta",       flag:"🍑" },
  { code:"DEN", label:"Denver",        flag:"🏔️" },
  { code:"DFW", label:"Dallas",        flag:"⭐" },
  { code:"LAS", label:"Las Vegas",     flag:"🎰" },
  { code:"PHX", label:"Phoenix",       flag:"🌵" },
  { code:"MSP", label:"Minneapolis",   flag:"❄️" },
  { code:"DTW", label:"Detroit",       flag:"🚗" },
];

// ─── full searchable airport list ─────────────────────────────────────────────
const ALL_AIRPORTS = [
  { code:"JFK", city:"New York (JFK)",         flag:"🇺🇸" },
  { code:"LAX", city:"Los Angeles",             flag:"🇺🇸" },
  { code:"SFO", city:"San Francisco",           flag:"🇺🇸" },
  { code:"ORD", city:"Chicago O'Hare",          flag:"🇺🇸" },
  { code:"MIA", city:"Miami",                   flag:"🇺🇸" },
  { code:"SEA", city:"Seattle",                 flag:"🇺🇸" },
  { code:"BOS", city:"Boston",                  flag:"🇺🇸" },
  { code:"ATL", city:"Atlanta",                 flag:"🇺🇸" },
  { code:"DEN", city:"Denver",                  flag:"🇺🇸" },
  { code:"DFW", city:"Dallas Fort Worth",       flag:"🇺🇸" },
  { code:"LAS", city:"Las Vegas",               flag:"🇺🇸" },
  { code:"PHX", city:"Phoenix",                 flag:"🇺🇸" },
  { code:"PDX", city:"Portland OR",             flag:"🇺🇸" },
  { code:"SLC", city:"Salt Lake City",          flag:"🇺🇸" },
  { code:"HNL", city:"Honolulu",                flag:"🇺🇸" },
  { code:"ANC", city:"Anchorage",               flag:"🇺🇸" },
  { code:"IAD", city:"Washington DC Dulles",    flag:"🇺🇸" },
  { code:"DCA", city:"Washington DC Reagan",    flag:"🇺🇸" },
  { code:"EWR", city:"Newark",                  flag:"🇺🇸" },
  { code:"PHL", city:"Philadelphia",            flag:"🇺🇸" },
  { code:"IAH", city:"Houston Intercontinental",flag:"🇺🇸" },
  { code:"DTW", city:"Detroit",                 flag:"🇺🇸" },
  { code:"MSP", city:"Minneapolis",             flag:"🇺🇸" },
  { code:"MCO", city:"Orlando",                 flag:"🇺🇸" },
  { code:"TPA", city:"Tampa",                   flag:"🇺🇸" },
  { code:"FLL", city:"Fort Lauderdale",         flag:"🇺🇸" },
  { code:"SAN", city:"San Diego",               flag:"🇺🇸" },
  { code:"BNA", city:"Nashville",               flag:"🇺🇸" },
  { code:"RDU", city:"Raleigh",                 flag:"🇺🇸" },
  { code:"AUS", city:"Austin",                  flag:"🇺🇸" },
  { code:"SAT", city:"San Antonio",             flag:"🇺🇸" },
  { code:"MSY", city:"New Orleans",             flag:"🇺🇸" },
  { code:"STL", city:"St. Louis",               flag:"🇺🇸" },
  { code:"CLE", city:"Cleveland",               flag:"🇺🇸" },
  { code:"MDW", city:"Chicago Midway",          flag:"🇺🇸" },
  { code:"MKE", city:"Milwaukee",               flag:"🇺🇸" },
  { code:"BUF", city:"Buffalo",                 flag:"🇺🇸" },
  { code:"SJC", city:"San Jose CA",             flag:"🇺🇸" },
  { code:"OAK", city:"Oakland",                 flag:"🇺🇸" },
  { code:"SMF", city:"Sacramento",              flag:"🇺🇸" },
  { code:"RNO", city:"Reno",                    flag:"🇺🇸" },
  { code:"BZN", city:"Bozeman MT",              flag:"🇺🇸" },
  { code:"ASE", city:"Aspen CO",                flag:"🇺🇸" },
  { code:"EGE", city:"Vail Eagle CO",           flag:"🇺🇸" },
  { code:"GEG", city:"Spokane",                 flag:"🇺🇸" },
  { code:"ABQ", city:"Albuquerque",             flag:"🇺🇸" },
  { code:"MCI", city:"Kansas City",             flag:"🇺🇸" },
  { code:"PIT", city:"Pittsburgh",              flag:"🇺🇸" },
  { code:"CMH", city:"Columbus OH",             flag:"🇺🇸" },
  { code:"RSW", city:"Fort Myers FL",           flag:"🇺🇸" },
  { code:"CHS", city:"Charleston SC",           flag:"🇺🇸" },
  { code:"SAV", city:"Savannah GA",             flag:"🇺🇸" },
  { code:"JAX", city:"Jacksonville FL",         flag:"🇺🇸" },
  { code:"BUR", city:"Burbank CA",              flag:"🇺🇸" },
  { code:"YVR", city:"Vancouver",               flag:"🇨🇦" },
  { code:"YYZ", city:"Toronto",                 flag:"🇨🇦" },
  { code:"YUL", city:"Montreal",                flag:"🇨🇦" },
  { code:"YYC", city:"Calgary",                 flag:"🇨🇦" },
  { code:"YEG", city:"Edmonton",                flag:"🇨🇦" },
  { code:"YOW", city:"Ottawa",                  flag:"🇨🇦" },
  { code:"LHR", city:"London Heathrow",         flag:"🇬🇧" },
  { code:"LGW", city:"London Gatwick",          flag:"🇬🇧" },
  { code:"MAN", city:"Manchester",              flag:"🇬🇧" },
  { code:"EDI", city:"Edinburgh",               flag:"🇬🇧" },
  { code:"DUB", city:"Dublin",                  flag:"🇮🇪" },
  { code:"AMS", city:"Amsterdam",               flag:"🇳🇱" },
  { code:"CDG", city:"Paris CDG",               flag:"🇫🇷" },
  { code:"NCE", city:"Nice",                    flag:"🇫🇷" },
  { code:"FRA", city:"Frankfurt",               flag:"🇩🇪" },
  { code:"MUC", city:"Munich",                  flag:"🇩🇪" },
  { code:"BER", city:"Berlin",                  flag:"🇩🇪" },
  { code:"FCO", city:"Rome Fiumicino",          flag:"🇮🇹" },
  { code:"MXP", city:"Milan Malpensa",          flag:"🇮🇹" },
  { code:"VCE", city:"Venice",                  flag:"🇮🇹" },
  { code:"MAD", city:"Madrid",                  flag:"🇪🇸" },
  { code:"BCN", city:"Barcelona",               flag:"🇪🇸" },
  { code:"AGP", city:"Malaga",                  flag:"🇪🇸" },
  { code:"LIS", city:"Lisbon",                  flag:"🇵🇹" },
  { code:"OPO", city:"Porto",                   flag:"🇵🇹" },
  { code:"ZRH", city:"Zurich",                  flag:"🇨🇭" },
  { code:"GVA", city:"Geneva",                  flag:"🇨🇭" },
  { code:"INN", city:"Innsbruck",               flag:"🇦🇹" },
  { code:"VIE", city:"Vienna",                  flag:"🇦🇹" },
  { code:"PRG", city:"Prague",                  flag:"🇨🇿" },
  { code:"BUD", city:"Budapest",                flag:"🇭🇺" },
  { code:"WAW", city:"Warsaw",                  flag:"🇵🇱" },
  { code:"CPH", city:"Copenhagen",              flag:"🇩🇰" },
  { code:"ARN", city:"Stockholm",               flag:"🇸🇪" },
  { code:"OSL", city:"Oslo",                    flag:"🇳🇴" },
  { code:"HEL", city:"Helsinki",                flag:"🇫🇮" },
  { code:"KEF", city:"Reykjavik",               flag:"🇮🇸" },
  { code:"ATH", city:"Athens",                  flag:"🇬🇷" },
  { code:"IST", city:"Istanbul",                flag:"🇹🇷" },
  { code:"NRT", city:"Tokyo Narita",            flag:"🇯🇵" },
  { code:"HND", city:"Tokyo Haneda",            flag:"🇯🇵" },
  { code:"KIX", city:"Osaka",                   flag:"🇯🇵" },
  { code:"CTS", city:"Sapporo",                 flag:"🇯🇵" },
  { code:"ICN", city:"Seoul Incheon",           flag:"🇰🇷" },
  { code:"HKG", city:"Hong Kong",               flag:"🇭🇰" },
  { code:"SIN", city:"Singapore",               flag:"🇸🇬" },
  { code:"BKK", city:"Bangkok",                 flag:"🇹🇭" },
  { code:"HKT", city:"Phuket",                  flag:"🇹🇭" },
  { code:"DPS", city:"Bali",                    flag:"🇮🇩" },
  { code:"KTM", city:"Kathmandu",               flag:"🇳🇵" },
  { code:"DEL", city:"Delhi",                   flag:"🇮🇳" },
  { code:"BOM", city:"Mumbai",                  flag:"🇮🇳" },
  { code:"SYD", city:"Sydney",                  flag:"🇦🇺" },
  { code:"MEL", city:"Melbourne",               flag:"🇦🇺" },
  { code:"BNE", city:"Brisbane",                flag:"🇦🇺" },
  { code:"PER", city:"Perth",                   flag:"🇦🇺" },
  { code:"CNS", city:"Cairns",                  flag:"🇦🇺" },
  { code:"AKL", city:"Auckland",                flag:"🇳🇿" },
  { code:"CHC", city:"Christchurch",            flag:"🇳🇿" },
  { code:"ZQN", city:"Queenstown",              flag:"🇳🇿" },
  { code:"DXB", city:"Dubai",                   flag:"🇦🇪" },
  { code:"AUH", city:"Abu Dhabi",               flag:"🇦🇪" },
  { code:"DOH", city:"Doha",                    flag:"🇶🇦" },
  { code:"TLV", city:"Tel Aviv",                flag:"🇮🇱" },
  { code:"JNB", city:"Johannesburg",            flag:"🇿🇦" },
  { code:"CPT", city:"Cape Town",               flag:"🇿🇦" },
  { code:"NBO", city:"Nairobi",                 flag:"🇰🇪" },
  { code:"CMN", city:"Casablanca",              flag:"🇲🇦" },
  { code:"RAK", city:"Marrakech",               flag:"🇲🇦" },
  { code:"GRU", city:"Sao Paulo",               flag:"🇧🇷" },
  { code:"GIG", city:"Rio de Janeiro",          flag:"🇧🇷" },
  { code:"EZE", city:"Buenos Aires",            flag:"🇦🇷" },
  { code:"SCL", city:"Santiago",                flag:"🇨🇱" },
  { code:"PUQ", city:"Punta Arenas",            flag:"🇨🇱" },
  { code:"LIM", city:"Lima",                    flag:"🇵🇪" },
  { code:"CUZ", city:"Cusco",                   flag:"🇵🇪" },
  { code:"BOG", city:"Bogota",                  flag:"🇨🇴" },
  { code:"MEX", city:"Mexico City",             flag:"🇲🇽" },
  { code:"CUN", city:"Cancun",                  flag:"🇲🇽" },
  { code:"SJD", city:"Los Cabos",               flag:"🇲🇽" },
  { code:"SJO", city:"San Jose Costa Rica",     flag:"🇨🇷" },
  { code:"PTY", city:"Panama City",             flag:"🇵🇦" },
  { code:"PPT", city:"Papeete Tahiti",          flag:"🇵🇫" },
  // ── Additional airports for new venues ──
  { code:"GCM", city:"Grand Cayman",            flag:"🇰🇾" },
  { code:"PLS", city:"Providenciales (Turks & Caicos)",flag:"🇹🇨" },
  { code:"AXA", city:"Anguilla",                flag:"🇦🇮" },
  { code:"AUA", city:"Aruba",                   flag:"🇦🇼" },
  { code:"SXM", city:"Sint Maarten",            flag:"🇸🇽" },
  { code:"STT", city:"St. Thomas USVI",         flag:"🇻🇮" },
  { code:"UVF", city:"St. Lucia (Hewanorra)",   flag:"🇱🇨" },
  { code:"TAB", city:"Tobago",                  flag:"🇹🇹" },
  { code:"MBJ", city:"Montego Bay Jamaica",     flag:"🇯🇲" },
  { code:"HAV", city:"Havana",                  flag:"🇨🇺" },
  { code:"CZM", city:"Cozumel",                 flag:"🇲🇽" },
  { code:"ZIH", city:"Zihuatanejo",             flag:"🇲🇽" },
  { code:"HUX", city:"Huatulco",                flag:"🇲🇽" },
  { code:"MZT", city:"Mazatlan",                flag:"🇲🇽" },
  { code:"BOC", city:"Bocas del Toro",          flag:"🇵🇦" },
  { code:"FEN", city:"Fernando de Noronha",     flag:"🇧🇷" },
  { code:"AQP", city:"Arequipa",                flag:"🇵🇪" },
  { code:"ORF", city:"Norfolk / Outer Banks VA",flag:"🇺🇸" },
  { code:"MYR", city:"Myrtle Beach SC",         flag:"🇺🇸" },
  { code:"SRQ", city:"Sarasota FL",             flag:"🇺🇸" },
  { code:"EYW", city:"Key West FL",             flag:"🇺🇸" },
  { code:"VPS", city:"Destin / Fort Walton FL", flag:"🇺🇸" },
  { code:"KOA", city:"Kona Big Island HI",      flag:"🇺🇸" },
  { code:"OGG", city:"Maui HI",                 flag:"🇺🇸" },
  { code:"BTV", city:"Burlington VT",           flag:"🇺🇸" },
  { code:"TYS", city:"Knoxville TN",            flag:"🇺🇸" },
  { code:"CWL", city:"Cardiff Wales",           flag:"🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  { code:"FAE", city:"Faroe Islands",           flag:"🇩🇰" },
  { code:"FNC", city:"Funchal Madeira",         flag:"🇵🇹" },
  { code:"PDL", city:"Ponta Delgada Azores",    flag:"🇵🇹" },
  { code:"AJA", city:"Ajaccio Corsica",         flag:"🇫🇷" },
  { code:"BOD", city:"Bordeaux",                flag:"🇫🇷" },
  { code:"NCE", city:"Nice / Côte d'Azur",      flag:"🇫🇷" },
  { code:"PSA", city:"Pisa",                    flag:"🇮🇹" },
  { code:"NAP", city:"Naples",                  flag:"🇮🇹" },
  { code:"CAG", city:"Cagliari Sardinia",       flag:"🇮🇹" },
  { code:"FAO", city:"Faro Algarve",            flag:"🇵🇹" },
  { code:"JTR", city:"Santorini",               flag:"🇬🇷" },
  { code:"JMK", city:"Mykonos",                 flag:"🇬🇷" },
  { code:"ZTH", city:"Zakynthos",               flag:"🇬🇷" },
  { code:"MLO", city:"Milos Island",            flag:"🇬🇷" },
  { code:"SPU", city:"Split Croatia",           flag:"🇭🇷" },
  { code:"DBV", city:"Dubrovnik Croatia",       flag:"🇭🇷" },
  { code:"IBZ", city:"Ibiza",                   flag:"🇪🇸" },
  { code:"MAH", city:"Menorca",                 flag:"🇪🇸" },
  { code:"SCQ", city:"Santiago de Compostela",  flag:"🇪🇸" },
  { code:"JRO", city:"Kilimanjaro",             flag:"🇹🇿" },
  { code:"MBA", city:"Mombasa",                 flag:"🇰🇪" },
  { code:"ZNZ", city:"Zanzibar",                flag:"🇹🇿" },
  { code:"SEZ", city:"Seychelles Mahé",         flag:"🇸🇨" },
  { code:"PRI", city:"Praslin Seychelles",      flag:"🇸🇨" },
  { code:"MRU", city:"Mauritius",               flag:"🇲🇺" },
  { code:"FTE", city:"El Calafate Patagonia",   flag:"🇦🇷" },
  { code:"KBV", city:"Krabi Thailand",          flag:"🇹🇭" },
  { code:"USM", city:"Koh Samui",               flag:"🇹🇭" },
  { code:"ENI", city:"El Nido Palawan",         flag:"🇵🇭" },
  { code:"MPH", city:"Caticlan / Boracay",      flag:"🇵🇭" },
  { code:"LOP", city:"Lombok",                  flag:"🇮🇩" },
  { code:"LST", city:"Launceston Tasmania",     flag:"🇦🇺" },
  { code:"PPP", city:"Whitsunday Coast",        flag:"🇦🇺" },
  { code:"BME", city:"Broome WA",               flag:"🇦🇺" },
  { code:"AIT", city:"Aitutaki Cook Islands",   flag:"🇨🇰" },
  { code:"PBH", city:"Paro Bhutan",             flag:"🇧🇹" },
  { code:"AMM", city:"Amman Jordan",            flag:"🇯🇴" },
  { code:"YEG", city:"Edmonton Alberta",        flag:"🇨🇦" },
];

// ─── weather api (Open-Meteo — no key required) ───────────────────────────────
const METEO  = "https://api.open-meteo.com/v1";
const MARINE = "https://marine-api.open-meteo.com/v1";

async function fetchWeather(lat, lon) {
  const url =
    `${METEO}/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,` +
    `snow_depth_max,wind_speed_10m_max,uv_index_max,weather_code` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=7&timezone=auto`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("weather fetch failed");
  return r.json();
}

async function fetchMarine(lat, lon) {
  const url =
    `${MARINE}/marine?latitude=${lat}&longitude=${lon}` +
    `&daily=wave_height_max,wave_period_max&forecast_days=7&timezone=auto`;
  const r = await fetch(url);
  if (!r.ok) return null;
  return r.json();
}

// ─── condition scoring ────────────────────────────────────────────────────────
function scoreVenue(venue, wx, marine) {
  if (!wx?.daily) return { score:50, label:"Checking conditions…", period:"Loading live data" };

  const d       = wx.daily;
  const tempMax = d.temperature_2m_max[0]  ?? 65;
  const precip  = d.precipitation_sum[0]   ?? 0;
  const snow    = d.snowfall_sum?.[0]       ?? 0;   // cm
  const depth   = d.snow_depth_max?.[0]    ?? 0;   // meters
  const wind    = d.wind_speed_10m_max[0]  ?? 10;  // mph
  const uv      = d.uv_index_max?.[0]      ?? 5;
  const wCode   = d.weather_code?.[0]      ?? 0;
  const waveH   = marine?.daily?.wave_height_max?.[0]  ?? 0;  // meters
  const wavePer = marine?.daily?.wave_period_max?.[0]  ?? 10; // seconds

  // consecutive clear days ahead
  let bestDays = 1;
  for (let i = 1; i < (d.precipitation_sum?.length ?? 0); i++) {
    if ((d.precipitation_sum[i] ?? 99) < 3 && (d.wind_speed_10m_max[i] ?? 99) < 25) bestDays++;
    else break;
  }

  let score = 50, label = "", period = "";

  switch (venue.category) {

    case "skiing": {
      const sIn  = Math.round(snow * 0.394);   // cm → inches fresh
      const dIn  = Math.round(depth * 39.4);   // m  → inches base
      const baseDepthCm = depth * 100;
      // Score from fresh snow
      if      (snow > 30) score = 97;
      else if (snow > 20) score = 93 + (snow - 20) * 0.15;
      else if (snow > 10) score = 87 + (snow - 10) * 0.6;
      else if (snow > 5)  score = 80 + (snow - 5) * 1.4;
      else if (snow > 0)  score = 72 + snow * 1.6;
      else {
        // No fresh snow — base-dependent
        if      (baseDepthCm > 200) score = 74;
        else if (baseDepthCm > 150) score = 69;
        else if (baseDepthCm > 100) score = 62;
        else if (baseDepthCm > 50)  score = 53;
        else                        score = 36;
      }
      // Modifiers
      if (tempMax < 30 && snow > 5) score += 3;  // cold = dry powder
      if (tempMax > 36) score -= 18;              // spring slush
      if (wind > 45)    score -= 12;              // lift-closing winds
      else if (wind > 30) score -= 5;
      label  = snow > 0 ? `❄️ ${sIn}" fresh · ${dIn}" base` : `🏔️ ${dIn}" base · ${tempMax}°F`;
      period = snow > 20 ? "🔥 Powder day — go now"
             : snow > 10 ? "Fresh snow overnight"
             : snow > 0  ? "New snow on trail"
             : baseDepthCm > 150 ? "Groomed packed powder"
             : "Limited coverage";
      break;
    }

    case "surfing": {
      const fFt  = Math.round(waveH * 3.28 * 1.5); // face height in feet
      const glassy = wind < 8;
      const blown  = wind > 22;
      // Base score from wave height + period quality
      if      (waveH > 3   && wavePer > 14) score = 93 + Math.min(6, (wavePer - 14) * 0.5 + (waveH - 3) * 0.4);
      else if (waveH > 2   && wavePer > 12) score = 85 + (wavePer - 12) * 0.8 + (waveH - 2) * 2;
      else if (waveH > 1.5 && wavePer > 10) score = 76 + waveH * 3;
      else if (waveH > 1)                   score = 65 + waveH * 6;
      else if (waveH > 0.5)                 score = 50 + waveH * 14;
      else                                   score = 30;
      // Wind modifier
      if (glassy) score += 4;
      else if (blown) score -= 14;
      if (waveH > 6) score -= 8; // storm surf danger
      const windLabel = glassy ? " · Glassy" : blown ? " · Choppy" : "";
      label  = waveH > 0.5 ? `🌊 ${fFt}ft faces · ${wavePer.toFixed(0)}s${windLabel}` : `🌊 Small surf · building`;
      period = waveH > 3   ? `🔥 Firing — peak ${Math.min(bestDays, 3)}d`
             : waveH > 1.5 ? `Good swell · ${Math.min(bestDays, 3)}d window`
             : waveH > 0.5 ? "Fun conditions"
             : "Swell building";
      break;
    }

    case "tanning": {
      const sunny = wCode < 2;
      const clear = wCode < 3;
      if      (sunny && uv >= 10 && tempMax >= 85) score = 94 + Math.min(5, uv - 10);
      else if (clear && uv >= 8  && tempMax >= 80) score = 87 + Math.min(6, uv - 8);
      else if (clear && uv >= 6  && tempMax >= 75) score = 76 + (uv - 6) * 1.5;
      else if (uv >= 4           && tempMax >= 68) score = 62 + uv * 1.2;
      else                                          score = 40;
      if (precip > 5)  score -= 20;
      if (tempMax > 100) score -= 5; // extreme heat penalty
      label  = sunny ? `☀️ UV ${uv} · ${tempMax}°F · Perfect`
             : clear ? `🌤️ UV ${uv} · ${tempMax}°F`
             : `⛅ Partly cloudy · UV ${uv}`;
      period = sunny && bestDays > 1 ? `${Math.min(bestDays, 7)}-day clear window`
             : clear ? "Clear day ahead"
             : "Clear stretches";
      break;
    }

    case "diving": {
      const calm = waveH < 0.6;
      score = calm && precip < 3 && tempMax > 74 ? 90 + Math.min(8, (0.6 - waveH) * 20)
            : calm && precip < 3 ? 78
            : calm               ? 68
            : 48;
      const vis = calm ? "30m+" : waveH < 1 ? "15m" : "5m";
      label  = `🤿 Visibility ${vis} · ${calm ? "Calm" : "Choppy"} seas`;
      period = calm && bestDays > 2 ? "Best conditions this week" : "Good visibility today";
      break;
    }

    case "climbing": {
      const dry = precip < 1;
      score = dry && tempMax > 45 && tempMax < 86 && wind < 15 ? 84 + Math.min(12, bestDays * 2)
            : dry && tempMax > 45                              ? 72
            : !dry                                             ? 38
            : 60;
      label  = dry ? `☀️ Dry rock · ${tempMax}°F · ${wind.toFixed(0)}mph` : `🌧️ Wet rock · not ideal`;
      period = dry && bestDays > 2 ? `${bestDays}-day dry window` : dry ? "Dry today" : "Wait for dry conditions";
      break;
    }

    case "kite": {
      const inRange = wind >= 18 && wind <= 35;
      score = wind >= 22 && wind <= 30 ? 93 + Math.min(6, 5 - Math.abs(wind - 26))
            : inRange                  ? 78 + (wind - 18)
            : wind >= 12               ? 60
            : 32;
      const wStr = wind < 15 ? "Too light" : wind > 35 ? "Storm-force" : `${wind.toFixed(0)}kts`;
      label  = `💨 ${wStr} · ${tempMax}°F`;
      period = inRange ? `Prime window: ${Math.min(bestDays, 3)}d` : wind < 18 ? "Light period" : "Experts only";
      break;
    }

    case "kayak": {
      const calm2 = waveH < 0.8;
      const lightW = wind < 15;
      // Milford Sound: post-rain waterfalls = great
      if (venue.id === "milford" && precip > 8) { score = 87; label = "🌦️ Post-rain clarity · Waterfalls"; period = "Ideal after recent rain"; break; }
      score = calm2 && lightW && precip < 5 ? 80 + bestDays * 2
            : calm2 && lightW               ? 72
            : calm2                         ? 62
            : 50;
      label  = `🛶 ${wind.toFixed(0)}mph wind · ${tempMax}°F`;
      period = calm2 ? `Ideal ${Math.min(bestDays, 5)} days ahead` : "Calm window opening";
      break;
    }

    case "mtb": {
      const dry2 = precip < 2;
      score = dry2 && tempMax > 50 && tempMax < 92 && wind < 20 ? 85 + Math.min(11, bestDays)
            : dry2 && tempMax > 50 ? 74
            : !dry2                ? 46
            : 60;
      label  = dry2 ? `☀️ Dry trail · ${tempMax}°F` : `🌧️ Wet trail · wait 24h`;
      period = dry2 && bestDays > 3 ? `${bestDays} ideal riding days` : dry2 ? "Good today" : "Trails drying out";
      break;
    }

    case "fishing": {
      const calmF = wind < 15 && precip < 5;
      const mo = new Date().getMonth() + 1;
      const peak = venue.id === "kenai" && (mo === 6 || mo === 7);
      score = peak && calmF ? 96 : peak ? 87 : calmF ? 72 + bestDays : 58;
      label  = peak ? `🎣 King Salmon run · Peak` : `🎣 ${tempMax}°F · ${calmF ? "Calm" : "Choppy"}`;
      period = peak ? "Run peaks this week" : calmF ? `${Math.min(bestDays, 5)} good days` : "Calmer days ahead";
      break;
    }

    case "paraglide": {
      const thermalW = wind >= 8 && wind <= 20;
      const clearSky = wCode < 3;
      score = thermalW && clearSky && tempMax > 65 ? 90 + Math.min(8, bestDays)
            : thermalW && clearSky                 ? 80
            : thermalW                             ? 68
            : wind > 25 ? 32 : 55;
      label  = thermalW && clearSky ? `🪂 Thermals ideal · ${tempMax}°F` : `⛅ ${wind.toFixed(0)}mph · ${tempMax}°F`;
      period = thermalW && clearSky && bestDays > 1 ? `High pressure · ${Math.min(bestDays, 5)} days` : "Good thermals today";
      break;
    }

    case "hiking": {
      const dry3 = precip < 3;
      const idealTemp = tempMax > 45 && tempMax < 88;
      score = dry3 && idealTemp && wind < 18 ? 85 + Math.min(12, bestDays * 2)
            : dry3 && idealTemp               ? 76
            : dry3                            ? 62
            : 42;
      label  = dry3 ? `🥾 Clear trail · ${tempMax}°F · ${wind.toFixed(0)}mph` : `🌧️ Wet · wait for clear`;
      period = dry3 && bestDays > 2 ? `${bestDays}-day hiking window` : dry3 ? "Good today" : "Rain expected";
      break;
    }

    default:
      score = 70; label = `🌤️ ${tempMax}°F`; period = "Conditions good";
  }

  return { score: Math.round(Math.min(100, Math.max(20, score))), label, period };
}

// ─── Flight pricing via VPS proxy ────────────────────────────────────────────
// API token lives server-side on the VPS — never exposed in client code
const FLIGHT_PROXY = "https://104.131.82.242:3001";

// Returns the cheapest one-way economy price found, or null on failure.
// Falls back to estimate prices when API is unavailable.
async function fetchTravelpayoutsPrice(origin, destination) {
  try {
    // Calls our VPS proxy which injects the Travelpayouts token server-side
    const url = `${FLIGHT_PROXY}/api/flights`
      + `?origin=${encodeURIComponent(origin)}`
      + `&destination=${encodeURIComponent(destination)}`;

    const r = await fetch(url);
    if (!r.ok) return null;
    const json = await r.json();
    if (!json.success) return null;

    // Response: { data: { "NRT": { "0": { price: 450 }, "1": { price: 520 } } } }
    // Keys are number of stops: "0" = direct, "1" = 1 stop, etc.
    const destData = json.data?.[destination];
    if (!destData) return null;

    // Get cheapest price across all stop counts
    const prices = Object.values(destData)
      .map(d => d.price)
      .filter(p => typeof p === "number" && p > 0);

    if (prices.length === 0) return null;
    return Math.round(Math.min(...prices));
  } catch {
    return null; // Silent fallback to estimate
  }
}
const BASE_PRICES = {
  // existing
  YVR:{ JFK:560, LAX:380, SFO:320, ORD:490, MIA:680, SEA:260, BOS:620, ATL:590, DEN:420, DFW:510, LAS:440, PHX:460, MSP:530, DTW:520 },
  HNL:{ JFK:840, LAX:380, SFO:420, ORD:740, MIA:780, SEA:560, BOS:900, ATL:800, DEN:640, DFW:700, LAS:420, PHX:440, MSP:780, DTW:770 },
  PPT:{ JFK:1800,LAX:1200,SFO:1350,ORD:1700,MIA:1600,SEA:1500,BOS:1900,ATL:1700,DEN:1500,DFW:1600, LAS:1400,PHX:1380,MSP:1740,DTW:1730 },
  PUQ:{ JFK:1100,LAX:980, SFO:1050,ORD:1200,MIA:900, SEA:1200,BOS:1150,ATL:1050,DEN:1100,DFW:1100, LAS:1060,PHX:1080,MSP:1240,DTW:1230 },
  CNS:{ JFK:2100,LAX:1600,SFO:1700,ORD:2000,MIA:1900,SEA:1800,BOS:2200,ATL:2000,DEN:1800,DFW:1900, LAS:1780,PHX:1760,MSP:2040,DTW:2030 },
  SFO:{ JFK:380, LAX:160, SFO:80,  ORD:320, MIA:420, SEA:220, BOS:420, ATL:410, DEN:280, DFW:300, LAS:160, PHX:180, MSP:360, DTW:350 },
  AGP:{ JFK:780, LAX:1100,SFO:1050,ORD:860, MIA:900, SEA:1150,BOS:740, ATL:850, DEN:950, DFW:920, LAS:980, PHX:1000,MSP:900, DTW:890 },
  GVA:{ JFK:740, LAX:1000,SFO:980, ORD:820, MIA:880, SEA:1050,BOS:700, ATL:810, DEN:900, DFW:870, LAS:940, PHX:960, MSP:860, DTW:850 },
  ZQN:{ JFK:1800,LAX:1400,SFO:1450,ORD:1750,MIA:1700,SEA:1600,BOS:1900,ATL:1750,DEN:1600,DFW:1700, LAS:1580,PHX:1560,MSP:1790,DTW:1780 },
  SLC:{ JFK:380, LAX:240, SFO:220, ORD:300, MIA:420, SEA:260, BOS:420, ATL:390, DEN:180, DFW:300, LAS:180, PHX:200, MSP:340, DTW:330 },
  ANC:{ JFK:820, LAX:560, SFO:580, ORD:740, MIA:880, SEA:380, BOS:880, ATL:840, DEN:660, DFW:760, LAS:620, PHX:640, MSP:780, DTW:770 },
  ZRH:{ JFK:720, LAX:980, SFO:950, ORD:800, MIA:860, SEA:1020,BOS:680, ATL:790, DEN:880, DFW:850, LAS:920, PHX:940, MSP:840, DTW:830 },
  // Extra US hubs
  LAS:{ JFK:320, LAX:120, SFO:160, ORD:280, MIA:320, SEA:300, BOS:340, ATL:300, DEN:200, DFW:220, LAS:80,  PHX:120, MSP:320, DTW:310 },
  PHX:{ JFK:340, LAX:140, SFO:160, ORD:300, MIA:360, SEA:280, BOS:360, ATL:320, DEN:200, DFW:200, LAS:120, PHX:80,  MSP:340, DTW:330 },
  MSP:{ JFK:240, LAX:320, SFO:300, ORD:140, MIA:280, SEA:280, BOS:260, ATL:240, DEN:220, DFW:200, LAS:320, PHX:340, MSP:80,  DTW:160 },
  DTW:{ JFK:180, LAX:340, SFO:320, ORD:120, MIA:240, SEA:340, BOS:180, ATL:200, DEN:260, DFW:240, LAS:310, PHX:330, MSP:160, DTW:80 },
  ORF:{ JFK:200, LAX:400, SFO:380, ORD:280, MIA:220, SEA:420, BOS:220, ATL:180, DEN:360, DFW:320, LAS:380, PHX:360, MSP:320, DTW:300 },
  // North America ski airports
  ASE:{ JFK:550, LAX:420, SFO:390, ORD:480, MIA:620, SEA:560, BOS:600, ATL:590, DEN:160, DFW:480, LAS:340, PHX:360, MSP:520, DTW:510 },
  EGE:{ JFK:520, LAX:400, SFO:370, ORD:460, MIA:590, SEA:540, BOS:570, ATL:560, DEN:130, DFW:460, LAS:320, PHX:340, MSP:500, DTW:490 },
  JAC:{ JFK:500, LAX:380, SFO:360, ORD:440, MIA:580, SEA:340, BOS:560, ATL:550, DEN:240, DFW:440, LAS:340, PHX:360, MSP:480, DTW:470 },
  BZN:{ JFK:420, LAX:320, SFO:300, ORD:380, MIA:520, SEA:280, BOS:480, ATL:500, DEN:200, DFW:380, LAS:280, PHX:300, MSP:420, DTW:410 },
  MTJ:{ JFK:500, LAX:400, SFO:370, ORD:460, MIA:590, SEA:540, BOS:560, ATL:550, DEN:140, DFW:450, LAS:320, PHX:340, MSP:500, DTW:490 },
  YYC:{ JFK:520, LAX:400, SFO:380, ORD:460, MIA:580, SEA:360, BOS:560, ATL:560, DEN:240, DFW:460, LAS:380, PHX:400, MSP:500, DTW:490 },
  DEN:{ JFK:220, LAX:160, SFO:140, ORD:160, MIA:240, SEA:180, BOS:240, ATL:220, DEN:80,  DFW:140, LAS:200, PHX:200, MSP:200, DTW:190 },
  RNO:{ JFK:320, LAX:120, SFO:100, ORD:300, MIA:380, SEA:200, BOS:340, ATL:360, DEN:200, DFW:280, LAS:140, PHX:180, MSP:340, DTW:330 },
  HDN:{ JFK:540, LAX:420, SFO:380, ORD:500, MIA:620, SEA:560, BOS:600, ATL:580, DEN:140, DFW:480, LAS:340, PHX:360, MSP:540, DTW:530 },
  SUN:{ JFK:580, LAX:480, SFO:440, ORD:560, MIA:660, SEA:400, BOS:640, ATL:620, DEN:280, DFW:540, LAS:400, PHX:420, MSP:600, DTW:590 },
  YLW:{ JFK:620, LAX:480, SFO:460, ORD:580, MIA:700, SEA:400, BOS:680, ATL:680, DEN:380, DFW:580, LAS:460, PHX:480, MSP:620, DTW:610 },
  SAF:{ JFK:440, LAX:340, SFO:320, ORD:420, MIA:500, SEA:480, BOS:480, ATL:480, DEN:220, DFW:320, LAS:280, PHX:260, MSP:460, DTW:450 },
  // Japan
  NRT:{ JFK:820, LAX:680, SFO:640, ORD:780, MIA:960, SEA:680, BOS:880, ATL:900, DEN:800, DFW:840, LAS:740, PHX:760, MSP:820, DTW:810 },
  CTS:{ JFK:960, LAX:780, SFO:740, ORD:900, MIA:1100,SEA:760, BOS:1020,ATL:1040,DEN:940, DFW:960, LAS:840, PHX:860, MSP:940, DTW:930 },
  HND:{ JFK:800, LAX:660, SFO:620, ORD:760, MIA:940, SEA:660, BOS:860, ATL:880, DEN:780, DFW:820, LAS:720, PHX:740, MSP:800, DTW:790 },
  // South America
  SCL:{ JFK:1040,LAX:940, SFO:1000,ORD:1120,MIA:860, SEA:1180,BOS:1080,ATL:980, DEN:1040,DFW:1000, LAS:1020,PHX:1040,MSP:1160,DTW:1150 },
  CBR:{ JFK:2000,LAX:1560,SFO:1600,ORD:1900,MIA:1980,SEA:1700,BOS:2100,ATL:1980,DEN:1820,DFW:1900, LAS:1740,PHX:1720,MSP:1940,DTW:1930 },
  LIM:{ JFK:660, LAX:580, SFO:640, ORD:740, MIA:480, SEA:780, BOS:700, ATL:600, DEN:660, DFW:620, LAS:640, PHX:620, MSP:780, DTW:770 },
  GRU:{ JFK:780, LAX:860, SFO:920, ORD:860, MIA:560, SEA:1000,BOS:820, ATL:740, DEN:800, DFW:760, LAS:840, PHX:820, MSP:900, DTW:890 },
  FLN:{ JFK:820, LAX:900, SFO:960, ORD:900, MIA:580, SEA:1040,BOS:860, ATL:780, DEN:840, DFW:800, LAS:880, PHX:860, MSP:940, DTW:930 },
  REC:{ JFK:760, LAX:1020,SFO:1080,ORD:860, MIA:520, SEA:1120,BOS:800, ATL:720, DEN:860, DFW:820, LAS:900, PHX:880, MSP:900, DTW:890 },
  // Europe
  INN:{ JFK:740, LAX:1020,SFO:980, ORD:820, MIA:900, SEA:1080,BOS:700, ATL:840, DEN:920, DFW:880, LAS:960, PHX:980, MSP:860, DTW:850 },
  CMF:{ JFK:780, LAX:1060,SFO:1020,ORD:860, MIA:940, SEA:1120,BOS:740, ATL:880, DEN:960, DFW:920, LAS:1000,PHX:1020,MSP:900, DTW:890 },
  GNB:{ JFK:760, LAX:1040,SFO:1000,ORD:840, MIA:920, SEA:1100,BOS:720, ATL:860, DEN:940, DFW:900, LAS:980, PHX:1000,MSP:880, DTW:870 },
  SZG:{ JFK:760, LAX:1040,SFO:1000,ORD:840, MIA:920, SEA:1100,BOS:720, ATL:860, DEN:940, DFW:900, LAS:980, PHX:1000,MSP:880, DTW:870 },
  VCE:{ JFK:720, LAX:1000,SFO:960, ORD:800, MIA:880, SEA:1060,BOS:680, ATL:820, DEN:900, DFW:860, LAS:940, PHX:960, MSP:840, DTW:830 },
  TRN:{ JFK:740, LAX:1020,SFO:980, ORD:820, MIA:900, SEA:1080,BOS:700, ATL:840, DEN:920, DFW:880, LAS:960, PHX:980, MSP:860, DTW:850 },
  BIQ:{ JFK:760, LAX:1060,SFO:1020,ORD:840, MIA:900, SEA:1100,BOS:720, ATL:860, DEN:940, DFW:900, LAS:980, PHX:1000,MSP:880, DTW:870 },
  BIO:{ JFK:740, LAX:1040,SFO:1000,ORD:820, MIA:880, SEA:1080,BOS:700, ATL:840, DEN:920, DFW:880, LAS:960, PHX:980, MSP:860, DTW:850 },
  LIS:{ JFK:680, LAX:980, SFO:960, ORD:760, MIA:840, SEA:1020,BOS:640, ATL:780, DEN:860, DFW:820, LAS:920, PHX:940, MSP:800, DTW:790 },
  NQY:{ JFK:680, LAX:960, SFO:940, ORD:760, MIA:840, SEA:1000,BOS:640, ATL:780, DEN:860, DFW:820, LAS:900, PHX:920, MSP:800, DTW:790 },
  INV:{ JFK:700, LAX:980, SFO:960, ORD:780, MIA:860, SEA:1020,BOS:660, ATL:800, DEN:880, DFW:840, LAS:920, PHX:940, MSP:820, DTW:810 },
  SNN:{ JFK:620, LAX:940, SFO:920, ORD:700, MIA:800, SEA:980, BOS:580, ATL:740, DEN:820, DFW:780, LAS:880, PHX:900, MSP:740, DTW:730 },
  ACE:{ JFK:720, LAX:1020,SFO:1000,ORD:800, MIA:860, SEA:1060,BOS:680, ATL:820, DEN:900, DFW:860, LAS:960, PHX:980, MSP:840, DTW:830 },
  FUE:{ JFK:740, LAX:1040,SFO:1020,ORD:820, MIA:880, SEA:1080,BOS:700, ATL:840, DEN:920, DFW:880, LAS:980, PHX:1000,MSP:860, DTW:850 },
  // Africa
  CPT:{ JFK:1200,LAX:1400,SFO:1380,ORD:1280,MIA:1160,SEA:1480,BOS:1240,ATL:1200,DEN:1360,DFW:1280, LAS:1380,PHX:1360,MSP:1320,DTW:1310 },
  PLZ:{ JFK:1220,LAX:1420,SFO:1400,ORD:1300,MIA:1180,SEA:1500,BOS:1260,ATL:1220,DEN:1380,DFW:1300, LAS:1400,PHX:1380,MSP:1340,DTW:1330 },
  AGA:{ JFK:820, LAX:1120,SFO:1100,ORD:900, MIA:960, SEA:1160,BOS:780, ATL:920, DEN:1000,DFW:960, LAS:1060,PHX:1080,MSP:940, DTW:930 },
  WDH:{ JFK:1300,LAX:1500,SFO:1480,ORD:1380,MIA:1260,SEA:1580,BOS:1340,ATL:1300,DEN:1460,DFW:1380, LAS:1480,PHX:1460,MSP:1420,DTW:1410 },
  // Caribbean / Atlantic
  SJU:{ JFK:260, LAX:480, SFO:520, ORD:380, MIA:180, SEA:580, BOS:300, ATL:260, DEN:420, DFW:360, LAS:440, PHX:400, MSP:420, DTW:400 },
  BGI:{ JFK:480, LAX:700, SFO:740, ORD:600, MIA:340, SEA:800, BOS:520, ATL:480, DEN:640, DFW:580, LAS:660, PHX:640, MSP:640, DTW:630 },
  // Central America
  SJO:{ JFK:380, LAX:460, SFO:500, ORD:480, MIA:240, SEA:580, BOS:420, ATL:360, DEN:460, DFW:380, LAS:440, PHX:420, MSP:520, DTW:510 },
  LIR:{ JFK:400, LAX:480, SFO:520, ORD:500, MIA:260, SEA:600, BOS:440, ATL:380, DEN:480, DFW:400, LAS:460, PHX:440, MSP:540, DTW:530 },
  SAL:{ JFK:360, LAX:440, SFO:480, ORD:460, MIA:220, SEA:560, BOS:400, ATL:340, DEN:440, DFW:360, LAS:420, PHX:400, MSP:500, DTW:490 },
  // Mexico surf
  OAX:{ JFK:480, LAX:360, SFO:400, ORD:460, MIA:380, SEA:500, BOS:520, ATL:440, DEN:420, DFW:380, LAS:380, PHX:340, MSP:500, DTW:490 },
  PVR:{ JFK:440, LAX:300, SFO:340, ORD:420, MIA:360, SEA:460, BOS:480, ATL:400, DEN:360, DFW:320, LAS:320, PHX:280, MSP:460, DTW:450 },
  // US West/Hawaii surf
  OGG:{ JFK:860, LAX:400, SFO:420, ORD:760, MIA:800, SEA:580, BOS:920, ATL:820, DEN:660, DFW:720, LAS:440, PHX:460, MSP:800, DTW:790 },
  LIH:{ JFK:880, LAX:420, SFO:440, ORD:780, MIA:820, SEA:600, BOS:940, ATL:840, DEN:680, DFW:740, LAS:460, PHX:480, MSP:820, DTW:810 },
  SAN:{ JFK:340, LAX:120, SFO:140, ORD:320, MIA:380, SEA:280, BOS:360, ATL:340, DEN:220, DFW:260, LAS:140, PHX:160, MSP:360, DTW:350 },
  // Southeast Asia / Pacific
  DPS:{ JFK:1400,LAX:1100,SFO:1080,ORD:1350,MIA:1480,SEA:1200,BOS:1460,ATL:1500,DEN:1320,DFW:1380, LAS:1280,PHX:1260,MSP:1390,DTW:1380 },
  PDG:{ JFK:1500,LAX:1200,SFO:1180,ORD:1450,MIA:1580,SEA:1300,BOS:1560,ATL:1600,DEN:1420,DFW:1480, LAS:1380,PHX:1360,MSP:1490,DTW:1480 },
  CEB:{ JFK:1300,LAX:1000,SFO:980, ORD:1250,MIA:1380,SEA:1100,BOS:1360,ATL:1400,DEN:1220,DFW:1280, LAS:1180,PHX:1160,MSP:1290,DTW:1280 },
  NAN:{ JFK:1650,LAX:1200,SFO:1250,ORD:1600,MIA:1550,SEA:1380,BOS:1750,ATL:1620,DEN:1480,DFW:1560, LAS:1380,PHX:1360,MSP:1640,DTW:1630 },
  MLE:{ JFK:1350,LAX:1200,SFO:1180,ORD:1300,MIA:1380,SEA:1280,BOS:1400,ATL:1380,DEN:1300,DFW:1320, LAS:1280,PHX:1260,MSP:1340,DTW:1330 },
  // Australia & NZ
  SYD:{ JFK:2000,LAX:1500,SFO:1550,ORD:1950,MIA:1900,SEA:1700,BOS:2100,ATL:1950,DEN:1800,DFW:1880, LAS:1680,PHX:1660,MSP:1990,DTW:1980 },
  MEL:{ JFK:2050,LAX:1540,SFO:1590,ORD:2000,MIA:1950,SEA:1740,BOS:2150,ATL:2000,DEN:1840,DFW:1920, LAS:1720,PHX:1700,MSP:2040,DTW:2030 },
  OOL:{ JFK:2020,LAX:1520,SFO:1570,ORD:1970,MIA:1920,SEA:1720,BOS:2120,ATL:1970,DEN:1820,DFW:1900, LAS:1700,PHX:1680,MSP:2010,DTW:2000 },
  PER:{ JFK:2200,LAX:1700,SFO:1750,ORD:2150,MIA:2100,SEA:1900,BOS:2300,ATL:2150,DEN:2000,DFW:2080, LAS:1880,PHX:1860,MSP:2190,DTW:2180 },
  AKL:{ JFK:2100,LAX:1580,SFO:1620,ORD:2050,MIA:2000,SEA:1780,BOS:2200,ATL:2050,DEN:1880,DFW:1960, LAS:1760,PHX:1740,MSP:2090,DTW:2080 },
};

// Converts a WHEN_OPTIONS id to a departure date string (YYYY-MM-DD)
function getFlightDate(whenId = "anytime") {
  const now = new Date();
  const add = (n) => { const d = new Date(now); d.setDate(d.getDate() + n); return d; };
  const fmt = d => d.toISOString().slice(0, 10);
  switch (whenId) {
    case "weekend":  { const ds = now.getDay(); return fmt(add(ds === 6 ? 7 : 6 - ds)); }
    case "nextweek":  return fmt(add(7));
    case "twoweeks":  return fmt(add(14));
    case "month":     return fmt(add(21));
    case "nextmonth": return fmt(add(35));
    case "60days":    return fmt(add(50));
    case "90days":    return fmt(add(75));
    case "winter":    return fmt(new Date(now.getFullYear() + (now.getMonth() >= 11 ? 1 : 0), 11, 20));
    case "spring":    return fmt(new Date(now.getFullYear() + (now.getMonth() >= 3 ? 1 : 0), 3, 1));
    case "summer":    return fmt(new Date(now.getFullYear() + (now.getMonth() >= 7 ? 1 : 0), 6, 1));
    case "fall":      return fmt(new Date(now.getFullYear() + (now.getMonth() >= 9 ? 1 : 0), 9, 1));
    default:          return fmt(add(14)); // "anytime" → default 2 weeks
  }
}
// Build a Google Flights deep-link URL with pre-filled origin, destination, and dates
function buildFlightUrl(from, to, whenId = "anytime") {
  const dep = getFlightDate(whenId);
  const retD = new Date(dep); retD.setDate(retD.getDate() + 7);
  const ret = retD.toISOString().slice(0, 10);
  return `https://www.google.com/flights?hl=en#flt=${from}.${to}.${dep}*${to}.${from}.${ret};c:USD;e:1;sd:1;t:f`;
}

// ─── Travelpayouts real pricing (LIVE) ────────────────────────────────────────
// Real prices fetched via fetchTravelpayoutsPrice() in the App useEffect.
// getFlightDeal() is the instant fallback when API hasn't responded yet.
// ─────────────────────────────────────────────────────────────────────────────
function getFlightDeal(ap, homeAirport = "JFK") {
  const base = BASE_PRICES[ap]?.[homeAirport] ?? 800;
  // Instant estimate shown while Travelpayouts API loads real prices
  const seed = (ap + homeAirport).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const pct  = 28 + (seed % 48); // 28–75% off
  const price = Math.max(49, Math.round(base * (1 - pct / 100) / 5) * 5);
  return { price, normal: base, pct, from: homeAirport };
}

// ─── localStorage hook ────────────────────────────────────────────────────────
function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; }
    catch { return initial; }
  });
  const save = useCallback(v => {
    setVal(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [val, save];
}

// ─── go/no-go verdict ────────────────────────────────────────────────────────
function getGoVerdict(score) {
  if (score >= 80) return { label:"GO", color:"#22c55e", bg:"#dcfce7" };
  if (score >= 55) return { label:"MAYBE", color:"#eab308", bg:"#fef9c3" };
  return { label:"WAIT", color:"#ef4444", bg:"#fee2e2" };
}

function GoVerdictBadge({ score, size = "sm" }) {
  const v = getGoVerdict(score);
  const isSm = size === "sm";
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", gap: isSm ? 3 : 5,
      background: v.bg, borderRadius: isSm ? 6 : 8,
      padding: isSm ? "2px 6px" : "3px 10px",
      border:`1.5px solid ${v.color}`,
    }}>
      <div style={{ width: isSm ? 6 : 8, height: isSm ? 6 : 8, borderRadius:"50%", background: v.color }} />
      <span style={{ fontSize: isSm ? 9 : 11, fontWeight:800, color: v.color, fontFamily:F }}>{v.label}</span>
    </div>
  );
}

// ─── haptic feedback helper ──────────────────────────────────────────────────
function haptic(style = "light") {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(style === "heavy" ? 25 : style === "medium" ? 15 : 8);
    }
  } catch(_) {}
}

// ─── score dot ────────────────────────────────────────────────────────────────
function ScoreDot({ score }) {
  const color = score >= 90 ? "#22c55e" : score >= 75 ? "#84cc16" : score >= 60 ? "#eab308" : score >= 45 ? "#f97316" : "#ef4444";
  return (
    <div style={{ display:"flex", alignItems:"center" }}>
      <div style={{
        width:8, height:8, borderRadius:"50%", background:color,
        boxShadow:`0 0 6px ${color}`,
      }} />
    </div>
  );
}

// ─── venue photos (curated Unsplash, category-based with per-venue overrides) ─
const VENUE_PHOTOS = {
  skiing: [
    "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565992441121-4367c2967103?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1486673748761-a8d18475c757?w=800&h=600&fit=crop&q=80",
  ],
  surfing: [
    "https://images.unsplash.com/photo-1502680390548-bdbac40529ce?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1455729552457-5c322b5db8c5?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=800&h=600&fit=crop&q=80",
  ],
  tanning: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1476673160081-cf065607f449?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1468413253725-0d5181091126?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=800&h=600&fit=crop&q=80",
  ],
  hiking: [
    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1445363692815-ebcd599f7621?w=800&h=600&fit=crop&q=80",
  ],
  diving: [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1682687221038-404670f01d03?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=800&h=600&fit=crop&q=80",
  ],
  climbing: [
    "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1516911995233-80d8ef21017a?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1452573992436-6d508f200b30?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&h=600&fit=crop&q=80",
  ],
};
// Fallback for categories not in the map (kite, kayak, mtb, fishing, paraglide, etc.)
VENUE_PHOTOS.kite = [
  "https://images.unsplash.com/photo-1559310589-2673bfe16970?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1496200186026-4c2a2e27d064?w=800&h=600&fit=crop&q=80",
];
VENUE_PHOTOS.kayak = [
  "https://images.unsplash.com/photo-1472745433479-4556f22e32c2?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544009400-2f2bdffe3291?w=800&h=600&fit=crop&q=80",
];
VENUE_PHOTOS.mtb = [
  "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1605235186583-a8272b7f9c9e?w=800&h=600&fit=crop&q=80",
];
VENUE_PHOTOS.fishing = [
  "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1440557653082-e40aea5ed5ca?w=800&h=600&fit=crop&q=80",
];
VENUE_PHOTOS.paraglide = [
  "https://images.unsplash.com/photo-1501262170142-192e2641e3f3?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1536500152956-8e1c8a0ad388?w=800&h=600&fit=crop&q=80",
];

// Deterministic photo picker based on venue ID hash
function getVenuePhoto(venue) {
  if (venue.photo) return venue.photo;
  const photos = VENUE_PHOTOS[venue.category] || VENUE_PHOTOS.hiking;
  let hash = 0;
  for (let i = 0; i < venue.id.length; i++) hash = ((hash << 5) - hash + venue.id.charCodeAt(i)) | 0;
  return photos[Math.abs(hash) % photos.length];
}

// ─── lazy background image (loads only when in viewport) ─────────────────────
function LazyBg({ src, gradient, style, children, ...rest }) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !src) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const img = new Image();
        img.onload = () => setLoaded(true);
        img.src = src;
        obs.disconnect();
      }
    }, { rootMargin:"200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [src]);
  return (
    <div ref={ref} style={{ ...style, background: gradient, position:"relative", overflow:"hidden" }} {...rest}>
      {loaded && <div style={{
        position:"absolute", inset:0,
        backgroundImage:`url(${src})`, backgroundSize:"cover", backgroundPosition:"center",
        animation:"imgFadeIn 0.4s ease-out forwards",
      }} />}
      <div style={{ position:"relative", zIndex:1, width:"100%", height:"100%" }}>{children}</div>
    </div>
  );
}

// ─── skeleton loader ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ borderRadius:16, overflow:"hidden" }}>
      <div className="shimmer" style={{ height:220, borderRadius:16, marginBottom:1 }} />
      <div style={{ padding:"12px 4px" }}>
        <div className="shimmer" style={{ height:14, borderRadius:6, marginBottom:8 }} />
        <div className="shimmer" style={{ height:12, borderRadius:6, width:"70%", marginBottom:8 }} />
        <div className="shimmer" style={{ height:12, borderRadius:6, width:"50%" }} />
      </div>
    </div>
  );
}

// ─── listing card ─────────────────────────────────────────────────────────────
function ListingCard({ listing, wishlists, onToggle, onOpen }) {
  const saved = wishlists.includes(listing.id);

  return (
    <div className="card" onClick={() => { onOpen && onOpen(listing); haptic(); }} style={{ borderRadius:16, overflow:"hidden", background:"#fff", boxShadow:"0 1px 8px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.08)" }}>
      <div style={{ position:"relative", height:220, overflow:"hidden" }}>
        <LazyBg className="card-img" src={getVenuePhoto(listing)} gradient={listing.gradient}
          style={{ position:"absolute", inset:0 }}>
        </LazyBg>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 52%)" }} />

        {/* Heart */}
        <button className="heart" onClick={e => { e.stopPropagation(); onToggle(listing.id); haptic("medium"); }} style={{
          position:"absolute", top:4, right:4,
          background:"none", border:"none", fontSize:20,
          minWidth:44, minHeight:44,
          display:"flex", alignItems:"center", justifyContent:"center",
          filter: saved ? "none" : "drop-shadow(0 1px 3px rgba(0,0,0,0.45))",
        }}>
          {saved ? "❤️" : "🤍"}
        </button>

        {/* Go/No-Go verdict + flight deal */}
        <div style={{ position:"absolute", top:12, left:12, display:"flex", gap:5, alignItems:"center" }}>
          <GoVerdictBadge score={listing.conditionScore} />
          <div style={{
            background:"#fff", borderRadius:20, padding:"3px 8px",
            display:"flex", alignItems:"center", gap:3,
            boxShadow:"0 2px 8px rgba(0,0,0,0.2)",
          }}>
            <span style={{ fontSize:10 }}>✈️</span>
            <span style={{ fontSize:10, fontWeight:800, color:"#0284c7", fontFamily:F }}>
              ${listing.flight.price}
            </span>
          </div>
        </div>

        {/* Condition label */}
        <div style={{
          position:"absolute", bottom:12, left:12, right:12,
        }}>
          <div style={{
            background:"rgba(255,255,255,0.18)", backdropFilter:"blur(8px)",
            borderRadius:8, padding:"4px 10px",
            color:"white", fontSize:12, fontWeight:600, fontFamily:F,
            border:"1px solid rgba(255,255,255,0.25)", maxWidth:"100%", display:"inline-block",
          }}>
            {listing.conditionLabel}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:"12px 4px 8px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ fontWeight:700, fontSize:14, color:"#222", fontFamily:F, lineHeight:1.3 }}>
            {listing.title}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:3, flexShrink:0, marginLeft:8 }}>
            <span style={{ fontSize:12 }}>⭐</span>
            <span style={{ fontSize:12, fontWeight:600, color:"#222", fontFamily:F }}>{listing.rating}</span>
            <span style={{ fontSize:10, color:"#aaa", fontFamily:F }}>({listing.reviews})</span>
          </div>
        </div>
        <div style={{ color:"#717171", fontSize:13, marginTop:2, fontFamily:F }}>{listing.location}</div>
        <div style={{ color:"#717171", fontSize:13, fontFamily:F }}>{listing.period}</div>
        <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
          {(() => {
            const si = getSeasonInfo(listing);
            return si.inSeason && si.label ? (
              <span style={{ background:"#dcfce7", border:"1px solid #bbf7d0", borderRadius:20, padding:"3px 8px", fontSize:11, color:"#16a34a", fontWeight:600, fontFamily:F }}>🟢 {si.label}</span>
            ) : null;
          })()}
          {(listing.tags || []).map(t => (
            <span key={t} style={{
              background:"#f7f7f7", border:"1px solid #e8e8e8", borderRadius:20,
              padding:"3px 8px", fontSize:11, color:"#444", fontWeight:600, fontFamily:F,
            }}>{t}</span>
          ))}
        </div>
        <div style={{ marginTop:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:5 }}>
            <span style={{ fontSize:14, fontWeight:800, color:"#222", fontFamily:F }}>${listing.flight.price}</span>
            <span style={{ fontSize:12, color:"#b0b0b0", textDecoration:"line-through", fontFamily:F }}>${listing.flight.normal}</span>
          </div>
          <a href={buildFlightUrl(listing.flight.from, listing.ap)} target="_blank" rel="noopener noreferrer"
            onClick={e => { e.stopPropagation(); haptic("heavy"); }}
            style={{ textDecoration:"none" }}>
            <div className="pressable" style={{
              background:"linear-gradient(135deg,#1a56db,#0ea5e9)", borderRadius:20,
              padding:"5px 10px", display:"flex", alignItems:"center", gap:4,
            }}>
              <span style={{ fontSize:10 }}>✈️</span>
              <span style={{ fontSize:10, fontWeight:800, color:"white", fontFamily:F }}>Book</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── featured card (horizontal scroll) ───────────────────────────────────────
function FeaturedCard({ listing, wishlists, onToggle, onOpen }) {
  const saved = wishlists.includes(listing.id);

  return (
    <div className="card" onClick={() => { onOpen && onOpen(listing); haptic(); }} style={{ minWidth:300, borderRadius:20, overflow:"hidden", flexShrink:0, background:"#fff", boxShadow:"0 1px 8px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.08)" }}>
      <LazyBg src={getVenuePhoto(listing)} gradient={listing.gradient}
        style={{ height:180, position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 55%)" }} />
        <button className="heart" onClick={e => { e.stopPropagation(); onToggle(listing.id); haptic("medium"); }} style={{
          position:"absolute", top:2, right:2, background:"none", border:"none", fontSize:18,
          minWidth:44, minHeight:44, display:"flex", alignItems:"center", justifyContent:"center",
        }}>{saved ? "❤️" : "🤍"}</button>
        <div style={{
          position:"absolute", top:10, left:10,
          background:"#0284c7", borderRadius:20, padding:"3px 10px",
          display:"flex", alignItems:"center", gap:5,
        }}>
          <span style={{ color:"white", fontSize:11, fontWeight:800, fontFamily:F }}>✈️ {listing.flight.pct}% off</span>
          {listing.flight.live && (
            <span style={{
              fontSize:9, fontWeight:800, color:"#16a34a", fontFamily:F,
              background:"#dcfce7", borderRadius:6, padding:"1px 5px",
            }}>LIVE</span>
          )}
        </div>
        <div style={{
          position:"absolute", bottom:10, left:12,
        }}>
          <span style={{
            background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)",
            borderRadius:8, padding:"3px 8px", color:"white", fontSize:11, fontWeight:600, fontFamily:F,
            border:"1px solid rgba(255,255,255,0.2)", display:"inline-block",
          }}>{listing.conditionLabel}</span>
        </div>
      </LazyBg>
      <div style={{ padding:"12px 14px 14px" }}>
        <div style={{ fontWeight:700, fontSize:14, color:"#222", fontFamily:F }}>{listing.title}</div>
        <div style={{ color:"#717171", fontSize:12, fontFamily:F, marginTop:2 }}>
          {listing.location} · {listing.period}
        </div>
        <div style={{ marginTop:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <span style={{ fontWeight:800, fontSize:15, color:"#222", fontFamily:F }}>${listing.flight.price}</span>
            <span style={{ color:"#717171", fontSize:12, fontFamily:F }}> from {listing.flight.from}</span>
          </div>
          <a href={buildFlightUrl(listing.flight.from, listing.ap)} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()} style={{ textDecoration:"none" }}>
            <div className="pressable" style={{ background:"linear-gradient(135deg,#1a56db,#0ea5e9)", borderRadius:20, padding:"5px 12px", display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ fontSize:11 }}>✈️</span>
              <span style={{ fontSize:11, fontWeight:800, color:"white", fontFamily:F }}>Book</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── compact card (3-column grid) ────────────────────────────────────────────
function CompactCard({ listing, wishlists, onToggle, onOpen }) {
  const saved = wishlists.includes(listing.id);
  const shortTitle = listing.title.split(",")[0];
  const shortLoc   = listing.location.split(",").slice(-1)[0]?.trim() || listing.location.split(",")[0];

  return (
    <div className="card" onClick={() => { onOpen && onOpen(listing); haptic(); }} style={{ borderRadius:12, overflow:"hidden", background:"#fff", boxShadow:"0 1px 6px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.08)" }}>
      <div style={{ position:"relative", height:128, overflow:"hidden" }}>
        <LazyBg src={getVenuePhoto(listing)} gradient={listing.gradient}
          style={{ position:"absolute", inset:0 }}>
        </LazyBg>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.58) 0%,transparent 50%)" }} />

        {/* Heart */}
        <button className="heart" onClick={e => { e.stopPropagation(); onToggle(listing.id); haptic("medium"); }} style={{
          position:"absolute", top:0, right:0,
          background:"none", border:"none", fontSize:13,
          minWidth:44, minHeight:44,
          display:"flex", alignItems:"center", justifyContent:"center",
          filter: saved ? "none" : "drop-shadow(0 1px 3px rgba(0,0,0,0.5))",
        }}>{saved ? "❤️" : "🤍"}</button>

        {/* Go/No-Go verdict */}
        <div style={{ position:"absolute", top:5, left:5 }}>
          <GoVerdictBadge score={listing.conditionScore} />
        </div>

        {/* Condition label */}
        <div style={{
          position:"absolute", bottom:5, left:5,
        }}>
          <span style={{
            color:"#fff", fontSize:9, fontWeight:600, fontFamily:F,
            textShadow:"0 1px 3px rgba(0,0,0,0.8)",
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"100%",
          }}>{listing.conditionLabel}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:"7px 6px 7px" }}>
        <div style={{ fontWeight:700, fontSize:11, color:"#222", fontFamily:F, lineHeight:1.25,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {shortTitle}
        </div>
        <div style={{ color:"#717171", fontSize:10, fontFamily:F, marginTop:1,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {shortLoc}
        </div>
        <div style={{ marginTop:5, display:"flex", alignItems:"center", gap:3 }}>
          <span style={{ fontSize:12, fontWeight:800, color:"#222", fontFamily:F }}>
            ${listing.flight.price}
          </span>
          {listing.flight.live && (
            <span style={{
              fontSize:8, fontWeight:800, color:"#16a34a", background:"#dcfce7",
              borderRadius:5, padding:"1px 4px", fontFamily:F,
            }}>LIVE</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── search sheet ─────────────────────────────────────────────────────────────
const WHEN_OPTIONS = [
  { id:"anytime",    label:"Any time" },
  { id:"weekend",    label:"This weekend" },
  { id:"nextweek",   label:"Next week" },
  { id:"twoweeks",   label:"In 2 weeks" },
  { id:"month",      label:"This month" },
  { id:"nextmonth",  label:"Next month" },
  { id:"60days",     label:"Next 60 days" },
  { id:"90days",     label:"Next 90 days" },
  { id:"winter",     label:"Winter" },
  { id:"spring",     label:"Spring" },
  { id:"summer",     label:"Summer" },
  { id:"fall",       label:"Fall" },
];

function SearchSheet({ search, setSearch, onApply, onClose, listings, filters, setFilters }) {
  const [local, setLocal] = useState({
    activities: search.activities || [],
    destination: search.destination || "",
    when: search.when || "anytime",
    continent: search.continent || "",
    fromAirport: search.fromAirport || "JFK",
    sort: filters?.sort || "score",
    maxPrice: filters?.maxPrice ?? 2000,
    startDate: filters?.startDate || "",
    endDate: filters?.endDate || "",
  });
  const [apQuery, setApQuery] = useState("");
  const [apFocus, setApFocus] = useState(false);

  // Toggle an activity in/out of the multi-select array
  const toggleActivity = (id) => {
    setLocal(l => {
      if (id === "all") return { ...l, activities: [] };
      const has = l.activities.includes(id);
      const next = has ? l.activities.filter(a => a !== id) : [...l.activities, id];
      return { ...l, activities: next };
    });
  };

  const toggleContinent = (id) => {
    setLocal(l => ({ ...l, continent: l.continent === id ? "" : id }));
  };

  const apResults = apQuery.length >= 2
    ? ALL_AIRPORTS.filter(a =>
        a.city.toLowerCase().includes(apQuery.toLowerCase()) ||
        a.code.toLowerCase().includes(apQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const matchCount = (() => {
    let out = local.activities.length > 0
      ? listings.filter(l => local.activities.includes(l.category))
      : listings;
    if (local.destination) {
      const q = local.destination.toLowerCase();
      out = out.filter(l =>
        l.title.toLowerCase().includes(q) || l.location.toLowerCase().includes(q)
      );
    }
    if (local.continent) {
      out = out.filter(l => AP_CONTINENT[l.ap] === local.continent);
    }
    return out.length;
  })();

  const apply = () => {
    const next = { activities: local.activities, destination: local.destination, when: local.when, continent: local.continent, fromAirport: local.fromAirport };
    setSearch(next);
    if (setFilters) setFilters({ sort: local.sort, maxPrice: local.maxPrice, startDate: local.startDate, endDate: local.endDate });
    onApply(next);
    onClose();
  };

  const SectionLabel = ({ children }) => (
    <div style={{ fontSize:12, fontWeight:800, color:"#888", fontFamily:F, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12 }}>
      {children}
    </div>
  );

  const Divider = () => (
    <div style={{ height:1, background:"#f0f0f0", margin:"4px 0" }} />
  );

  return (
    <>
      <div className="backdrop" onClick={onClose} style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100,
      }} />
      <div className="sheet" style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"min(430px,100vw)", background:"#fff",
        borderRadius:"28px 28px 0 0", zIndex:101, maxHeight:"92vh", overflowY:"auto",
        paddingBottom:"max(env(safe-area-inset-bottom,0px), 24px)",
      }}>
        {/* Handle + header */}
        <div style={{
          position:"sticky", top:0, background:"#fff", zIndex:2,
          borderBottom:"1px solid #f5f5f5", paddingBottom:12,
        }}>
          <div style={{ display:"flex", justifyContent:"center", padding:"14px 0 8px" }}>
            <div style={{ width:40, height:4, borderRadius:2, background:"#ddd" }} />
          </div>
          <div style={{ padding:"0 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:20, fontWeight:900, color:"#222", fontFamily:F }}>Plan a trip</span>
            <button onClick={() => setLocal({ activities:[], destination:"", when:"anytime", continent:"", fromAirport: local.fromAirport, sort:"score", maxPrice:2000, startDate:"", endDate:"" })}
              style={{ background:"#f5f5f5", border:"none", borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight:700, color:"#555", fontFamily:F, cursor:"pointer" }}>
              Reset
            </button>
          </div>
        </div>

        {/* ── Activity (multi-select) ── */}
        <div style={{ padding:"20px 24px 0" }}>
          <SectionLabel>Activity — pick any</SectionLabel>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {/* All option */}
            {(() => {
              const selAll = local.activities.length === 0;
              return (
                <button className={"pill" + (selAll ? " pill-selected" : "")}
                  onClick={() => setLocal(l => ({...l, activities:[]}))} style={{
                    padding:"10px 16px", borderRadius:24, cursor:"pointer", minHeight:44,
                    background: selAll ? "#0284c7" : "#f5f5f5",
                    color:      selAll ? "#fff" : "#444",
                    border:"2px solid", borderColor: selAll ? "#0284c7" : "transparent",
                    fontSize:13, fontWeight:700, fontFamily:F,
                    display:"inline-flex", alignItems:"center", gap:6,
                    boxShadow: selAll ? "0 2px 12px rgba(2,132,199,0.28)" : "none",
                }}>
                  ✨ All
                </button>
              );
            })()}
            {CATEGORIES.filter(c => c.id !== "all").map(cat => {
              const sel = local.activities.includes(cat.id);
              return (
                <button key={cat.id} className={"pill" + (sel ? " pill-selected" : "")}
                  onClick={() => toggleActivity(cat.id)} style={{
                    padding:"10px 16px", borderRadius:24, cursor:"pointer", minHeight:44,
                    background: sel ? "#222" : "#f5f5f5",
                    color:      sel ? "#fff" : "#444",
                    border:"2px solid", borderColor: sel ? "#222" : "transparent",
                    fontSize:13, fontWeight:700, fontFamily:F,
                    display:"inline-flex", alignItems:"center", gap:6,
                    boxShadow: sel ? "0 2px 12px rgba(0,0,0,0.18)" : "none",
                }}>
                  {cat.label}
                  {sel && <span style={{ fontSize:11, marginLeft:2, opacity:0.7 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* ── Where ── */}
        <div style={{ padding:"16px 24px 0" }}>
          <SectionLabel>Where?</SectionLabel>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16, pointerEvents:"none" }}>🔍</span>
            <input type="text" placeholder="Resort, mountain, beach, country…"
              value={local.destination}
              onChange={e => setLocal(l => ({...l, destination:e.target.value}))}
              style={{
                width:"100%", padding:"13px 36px 13px 40px", borderRadius:14,
                border:"1.5px solid #e8e8e8", fontSize:14, fontFamily:F, color:"#222",
                background:"#fafafa",
              }}
            />
            {local.destination && (
              <button onClick={() => setLocal(l => ({...l, destination:""}))} style={{
                position:"absolute", right:6, top:"50%", transform:"translateY(-50%)",
                background:"#ddd", border:"none", width:36, height:36, borderRadius:"50%",
                fontSize:14, color:"#666", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1,
              }}>×</button>
            )}
          </div>
          {local.destination && (
            <div className="bounce-in" style={{ fontSize:12, color:"#0284c7", fontFamily:F, marginTop:6, fontWeight:700 }}>
              {matchCount} match{matchCount !== 1 ? "es" : ""}
            </div>
          )}
        </div>

        <Divider />

        {/* ── When ── */}
        <div style={{ padding:"16px 24px 0" }}>
          <SectionLabel>When?</SectionLabel>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {WHEN_OPTIONS.map(opt => {
              const sel = local.when === opt.id;
              return (
                <button key={opt.id} className={"pill" + (sel ? " pill-selected" : "")}
                  onClick={() => setLocal(l => ({...l, when: opt.id}))} style={{
                    padding:"10px 14px", borderRadius:24, cursor:"pointer", minHeight:44,
                    background: sel ? "#222" : "#f5f5f5",
                    color:      sel ? "#fff" : "#444",
                    border:"2px solid", borderColor: sel ? "#222" : "transparent",
                    fontSize:12, fontWeight:700, fontFamily:F,
                    display:"inline-flex", alignItems:"center", gap:5,
                    boxShadow: sel ? "0 2px 10px rgba(0,0,0,0.14)" : "none",
                }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* ── Continent ── */}
        <div style={{ padding:"16px 24px 0" }}>
          <SectionLabel>Which part of the world?</SectionLabel>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {CONTINENTS.map(cont => {
              const sel = local.continent === cont.id;
              return (
                <button key={cont.id} className={"pill" + (sel ? " pill-selected" : "")}
                  onClick={() => toggleContinent(cont.id)} style={{
                    padding:"10px 14px", borderRadius:24, cursor:"pointer", minHeight:44,
                    background: sel ? "#0284c7" : "#f5f5f5",
                    color:      sel ? "#fff" : "#444",
                    border:"2px solid", borderColor: sel ? "#0284c7" : "transparent",
                    fontSize:12, fontWeight:700, fontFamily:F,
                    display:"inline-flex", alignItems:"center", gap:5,
                    boxShadow: sel ? "0 2px 10px rgba(2,132,199,0.28)" : "none",
                }}>
                  {cont.label}
                </button>
              );
            })}
          </div>
          {local.continent && (
            <div style={{ fontSize:11, color:"#aaa", fontFamily:F, marginTop:8 }}>
              Tap again to deselect
            </div>
          )}
        </div>

        <Divider />

        {/* ── Flying from ── */}
        <div style={{ padding:"16px 24px 0" }}>
          <SectionLabel>Flying from?</SectionLabel>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:12 }}>
            {US_AIRPORTS.map(ap => {
              const sel = local.fromAirport === ap.code;
              return (
                <button key={ap.code} className={"pill" + (sel ? " pill-selected" : "")}
                  onClick={() => { setLocal(l => ({...l, fromAirport:ap.code})); setApQuery(""); }} style={{
                    padding:"9px 13px", borderRadius:20, cursor:"pointer", minHeight:40,
                    background: sel ? "#222" : "#f5f5f5",
                    color:      sel ? "#fff" : "#555",
                    border:"2px solid", borderColor: sel ? "#222" : "transparent",
                    fontSize:12, fontWeight:700, fontFamily:F,
                    boxShadow: sel ? "0 2px 8px rgba(0,0,0,0.14)" : "none",
                }}>{ap.flag} {ap.code}</button>
              );
            })}
          </div>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:15, pointerEvents:"none" }}>✈️</span>
            <input type="text" placeholder="Search any airport…"
              value={apQuery}
              onChange={e => setApQuery(e.target.value)}
              onFocus={() => setApFocus(true)}
              onBlur={() => setTimeout(() => setApFocus(false), 180)}
              style={{
                width:"100%", padding:"12px 14px 12px 40px", borderRadius:14,
                border:"1.5px solid #e8e8e8", fontSize:13, fontFamily:F, color:"#222",
                background:"#fafafa",
              }}
            />
          </div>
          {apFocus && apResults.length > 0 && (
            <div className="bounce-in" style={{
              background:"#fff", border:"1.5px solid #e8e8e8", borderRadius:14,
              marginTop:6, overflow:"hidden", boxShadow:"0 8px 28px rgba(0,0,0,0.14)",
            }}>
              {apResults.map((ap, i) => (
                <button key={ap.code} onMouseDown={() => {
                  setLocal(l => ({...l, fromAirport: ap.code}));
                  setApQuery(""); setApFocus(false);
                }} style={{
                  width:"100%", padding:"12px 16px",
                  background: local.fromAirport === ap.code ? "#fff5f5" : "#fff",
                  border:"none", borderBottom: i < apResults.length-1 ? "1px solid #f5f5f5" : "none",
                  textAlign:"left", cursor:"pointer", fontFamily:F,
                  display:"flex", alignItems:"center", gap:12, minHeight:48,
                }}>
                  <span style={{ fontSize:20 }}>{ap.flag}</span>
                  <div style={{ flex:1 }}>
                    <span style={{ fontSize:14, fontWeight:800, color:"#222" }}>{ap.code}</span>
                    <span style={{ fontSize:12, color:"#717171" }}> · {ap.city}</span>
                  </div>
                  {local.fromAirport === ap.code && <span style={{ color:"#0284c7", fontSize:16, fontWeight:800 }}>✓</span>}
                </button>
              ))}
            </div>
          )}
          {local.fromAirport && (
            <div style={{ marginTop:8, fontSize:12, color:"#717171", fontFamily:F }}>
              ✈️ <strong style={{ color:"#222" }}>{local.fromAirport}</strong>
              {ALL_AIRPORTS.find(a => a.code === local.fromAirport)?.city &&
                <span> · {ALL_AIRPORTS.find(a => a.code === local.fromAirport).city}</span>}
            </div>
          )}
        </div>

        <Divider />

        {/* ── Sort by ── */}
        <div style={{ padding:"16px 24px 0" }}>
          <SectionLabel>Sort by</SectionLabel>
          <div style={{ display:"flex", gap:8 }}>
            {SORT_OPTIONS.map(opt => {
              const sel = local.sort === opt.id;
              return (
                <button key={opt.id} className="pressable" onClick={() => setLocal(l => ({...l, sort:opt.id}))} style={{
                  flex:1, padding:"11px 6px", borderRadius:14, cursor:"pointer",
                  background: sel ? "#222" : "#f5f5f5",
                  color: sel ? "#fff" : "#444",
                  border:"2px solid", borderColor: sel ? "#222" : "transparent",
                  fontSize:12, fontWeight:700, fontFamily:F, textAlign:"center",
                }}>{opt.label}</button>
              );
            })}
          </div>
        </div>

        {/* ── Max price ── */}
        <div style={{ padding:"16px 24px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <SectionLabel style={{ marginBottom:0 }}>Max flight price</SectionLabel>
            <span style={{ fontSize:13, fontWeight:800, color:"#0284c7", fontFamily:F }}>{local.maxPrice >= 2000 ? "Any" : `$${local.maxPrice}`}</span>
          </div>
          <input type="range" min={100} max={2000} step={50} value={local.maxPrice}
            onChange={e => setLocal(l => ({...l, maxPrice:+e.target.value}))}
            style={{ width:"100%", accentColor:"#0284c7" }} />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
            <span style={{ fontSize:10, color:"#aaa", fontFamily:F }}>$100</span>
            <span style={{ fontSize:10, color:"#aaa", fontFamily:F }}>Any price</span>
          </div>
        </div>

        {/* ── Travel dates ── */}
        <div style={{ padding:"16px 24px 0" }}>
          <SectionLabel>Travel dates</SectionLabel>
          <div style={{ display:"flex", gap:8 }}>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:9, fontWeight:700, color:"#aaa", fontFamily:F, marginBottom:3, display:"block" }}>From</label>
              <input type="date" value={local.startDate || ""}
                onChange={e => setLocal(l => ({...l, startDate:e.target.value}))}
                style={{ width:"100%", padding:"10px 10px", borderRadius:12, border:"1.5px solid #e8e8e8", fontSize:13, fontFamily:F, color:"#222", background:"#fafafa" }} />
            </div>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:9, fontWeight:700, color:"#aaa", fontFamily:F, marginBottom:3, display:"block" }}>To</label>
              <input type="date" value={local.endDate || ""}
                onChange={e => setLocal(l => ({...l, endDate:e.target.value}))}
                style={{ width:"100%", padding:"10px 10px", borderRadius:12, border:"1.5px solid #e8e8e8", fontSize:13, fontFamily:F, color:"#222", background:"#fafafa" }} />
            </div>
          </div>
        </div>

        {/* ── Apply button ── */}
        <div style={{ padding:"24px 24px 8px" }}>
          <button onClick={apply} className="pressable" style={{
            width:"100%", background:"linear-gradient(135deg,#0284c7,#38bdf8)",
            border:"none", borderRadius:18, padding:"18px 0", cursor:"pointer",
            color:"white", fontSize:16, fontWeight:900, fontFamily:F,
            boxShadow:"0 4px 20px rgba(2,132,199,0.38)",
            letterSpacing:"-0.2px",
          }}>
            {matchCount > 0 ? `Show ${matchCount} result${matchCount !== 1 ? "s" : ""}` : "Search all"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── search bar ───────────────────────────────────────────────────────────────
function SearchBar({ search, onOpen }) {
  const acts = search.activities || [];
  const hasSearch = search.destination || acts.length > 0 || search.when !== "anytime" || search.continent;

  // Top line: destination if typed, else activity name(s) if selected, else "Anywhere"
  const topLine = search.destination
    ? search.destination
    : acts.length === 1
      ? CATEGORIES.find(c => c.id === acts[0])?.label ?? "Anywhere"
      : acts.length > 1
        ? `${acts.length} sports`
        : "Anywhere";

  // Subtitle: activity label(s) only when destination is shown | timing | continent
  const actLabel = acts.length > 0
    ? acts.map(a => CATEGORIES.find(c => c.id === a)?.label).join(", ") + " "
    : "";
  const whenLabel = WHEN_OPTIONS.find(w => w.id === search.when)?.label ?? "Any time";
  const contLabel = search.continent ? " · " + (CONTINENTS.find(c => c.id === search.continent)?.label ?? "") : "";

  return (
    <div onClick={onOpen} className="pressable" style={{
      display:"flex", alignItems:"center",
      background:"#fff", borderRadius:40,
      boxShadow:"0 3px 22px rgba(0,0,0,0.11)", border:"1.5px solid #ebebeb",
      padding:"13px 12px 13px 20px", gap:10, cursor:"pointer",
    }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:800, color:"#222", fontFamily:F, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {topLine}
        </div>
        <div style={{ fontSize:11, color:"#999", fontFamily:F, marginTop:2 }}>
          {actLabel}{whenLabel} · {search.fromAirport}{contLabel}
        </div>
      </div>
      <div style={{
        background: hasSearch ? "#222" : "#0284c7",
        borderRadius:30, padding:"9px 18px", flexShrink:0,
        display:"flex", alignItems:"center", gap:6,
      }}>
        <span style={{ fontSize:13 }}>🔍</span>
        <span style={{ color:"white", fontSize:12, fontWeight:800, fontFamily:F }}>
          {hasSearch ? "Filtered" : "Search"}
        </span>
      </div>
    </div>
  );
}

// ─── alert banner ─────────────────────────────────────────────────────────────
function AlertBanner({ count, onView }) {
  if (count === 0) return null;
  return (
    <div style={{
      background:"linear-gradient(90deg,#0284c7,#38bdf8)",
      borderRadius:16, padding:"14px 20px",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      margin:"0 24px 20px",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ fontSize:24 }}>📍</div>
        <div>
          <div style={{ color:"white", fontWeight:800, fontSize:14, fontFamily:F }}>
            {count} top pick{count !== 1 ? "s" : ""}
          </div>
          <div style={{ color:"rgba(255,255,255,0.82)", fontSize:12, fontFamily:F }}>
            Best conditions available
          </div>
        </div>
      </div>
      <div onClick={onView} style={{
        background:"rgba(255,255,255,0.22)", borderRadius:20,
        padding:"6px 14px", color:"white", fontSize:12, fontWeight:700,
        fontFamily:F, cursor:"pointer",
      }}>View all</div>
    </div>
  );
}

// ─── filter sheet ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { id:"score",  label:"Best conditions" },
  { id:"price",  label:"Cheapest flights" },
  { id:"value",  label:"Best value" },
];

// ─── vibe search engine ────────────────────────────────────────────────────────
const VIBE_PROMPTS = [
  "Powder day with epic views and cozy lodge vibes after",
  "Remote tropical beach, no crowds, crystal water",
  "Big wave surf, warm water, laid-back beach culture",
  "Luxury beach resort, turquoise sea, total relaxation",
  "Underwater paradise — coral reefs, visibility 30m+",
  "Steep off-piste skiing, deep powder, real adventure",
  "Budget island escape, good food, cheap flights",
  "Warm Mediterranean vibes, history, seafood, wine",
  "Surf town with nightlife, meet people, good energy",
];

function scoreVibeMatch(listings, text) {
  const t = text.toLowerCase();
  // ── intent detection ────────────────────────────────────────────────────────
  const f = {
    cold:      /\b(cold|snow|powder|alpine|mountain|winter|freeze|ski|snowboard|frost|crisp|cozy|lodge|après|apres|blizzard)\b/.test(t),
    hot:       /\b(warm|hot|tropical|beach|sun|summer|heat|humid|tan|swim|paradise|island|sunshine|scorching)\b/.test(t),
    adrenaline:/\b(adventure|extreme|adrenaline|thrill|epic|intense|challenge|hard|steep|massive|gnarly|big|wild)\b/.test(t),
    relax:     /\b(relax|chill|peaceful|calm|easy|lazy|zen|serene|quiet|mellow|unwind|lounge|sip|vibe|slow)\b/.test(t),
    solo:      /\b(solo|alone|remote|hidden|secluded|escape|off.grid|undiscovered|no crowd|no one|just me)\b/.test(t),
    social:    /\b(party|people|scene|vibrant|lively|crowd|friends|meet|energy|nightlife|social)\b/.test(t),
    luxury:    /\b(luxury|fancy|resort|five.star|premium|splurge|high.end|upscale|pamper|indulge)\b/.test(t),
    budget:    /\b(budget|cheap|affordable|value|deal|backpack|frugal|save money|inexpensive)\b/.test(t),
    // activities
    ski:       /\b(ski|snowboard|powder|piste|mogul|lodge|après|apres|backcountry|off.piste|gondola)\b/.test(t),
    surf:      /\b(surf|wave|barrel|swell|board|break|set|reef|point.break|hang.ten)\b/.test(t),
    dive:      /\b(dive|diving|snorkel|underwater|reef|coral|fish|visibility|marine|scuba)\b/.test(t),
    kayak:     /\b(kayak|paddle|sea kayak|coastal|flat.water)\b/.test(t),
    beach:     /\b(beach|sand|tan|lounge|shore|coast|turquoise|crystal|clear water|sunbathe)\b/.test(t),
    // regions
    asia:      /\b(japan|bali|indonesia|asia|pacific|zen|exotic|east|southeast.asia|thai|balinese)\b/.test(t),
    europe:    /\b(europe|mediterranean|italy|greece|spain|france|alps|romantic|old world|cobblestone|european|adriatic)\b/.test(t),
    caribbean: /\b(caribbean|island|rum|reggae|white sand|coral|cayman|aruba|jamaica|barbados)\b/.test(t),
    hawaii:    /\b(hawaii|aloha|maui|oahu|kauai|big island|polynesian)\b/.test(t),
    americas:  /\b(colorado|california|rockies|usa|canada|appalachian|west coast|pacific northwest)\b/.test(t),
    nature:    /\b(nature|wilderness|wild|pristine|untouched|forest|jungle|raw|remote|off.the.beaten)\b/.test(t),
    underwater:/\b(underwater|ocean|sea|marine|reef|fish|blue water|visibility)\b/.test(t),
  };

  // ── region airport lists ────────────────────────────────────────────────────
  const ASIA_APS    = new Set(["NRT","KIX","HND","DPS","BKK","ICN","HKG","SGN","CTS"]);
  const EUROPE_APS  = new Set(["CDG","LHR","FCO","MAD","BCN","ZRH","GVA","VIE","MUC","AMS","NCE","NAP","FAO","IBZ","SPU","DBV","JTR","JMK","ZTH","MLO","CAG","LIS","ATH","OLB","NQY"]);
  const CARIB_APS   = new Set(["MBJ","SJU","STT","GCM","PLS","AXA","AUA","UVF","BGI","SXM","TAB","BOC","FEN","FLN"]);
  const HAWAII_APS  = new Set(["HNL","KOA","OGG","LIH"]);
  const AMER_APS    = new Set(["SEA","PDX","SFO","LAX","DEN","YVR","YWG","BZE","SJO"]);

  const scored = listings.map(l => {
    let s = l.conditionScore * 0.22; // base: live conditions anchor

    // ── category match (strongest signal) ──────────────────────────────────
    if (f.ski   && l.category === "skiing")  s += 44;
    if (f.surf  && l.category === "surfing") s += 44;
    if (f.dive  && l.category === "diving")  s += 44;
    if (f.kayak && l.category === "kayak")   s += 44;
    if (f.beach && l.category === "tanning") s += 44;
    if (f.underwater && ["diving","kayak","surfing"].includes(l.category)) s += 20;

    // ── temperature/climate match ───────────────────────────────────────────
    const isCold = l.category === "skiing";
    const isWarm = ["tanning","surfing","diving","kayak"].includes(l.category);
    if (f.cold && isCold)  s += 28;
    if (f.hot  && isWarm)  s += 28;
    if (f.cold && isWarm)  s -= 14;
    if (f.hot  && isCold)  s -= 14;

    // ── intensity / vibe ────────────────────────────────────────────────────
    const isAdrenalineCat = ["skiing","surfing","kayak"].includes(l.category);
    if (f.adrenaline && isAdrenalineCat) s += 16;
    if (f.relax && l.category === "tanning") s += 18;
    if (f.relax && l.category === "diving")  s += 10;
    if (f.adrenaline && l.category === "tanning") s -= 8;

    // ── social / crowd preference ───────────────────────────────────────────
    if (f.solo   && l.reviews < 7000)  s += 14;
    if (f.solo   && l.reviews > 20000) s -= 10;
    if (f.social && l.reviews > 15000) s += 14;
    if (f.nature && l.reviews < 8000)  s += 10;

    // ── budget / luxury ─────────────────────────────────────────────────────
    if (f.budget  && l.flight.price <= 450)  s += 22;
    if (f.budget  && l.flight.price >= 1100) s -= 16;
    if (f.luxury  && l.flight.price >= 700)  s += 12;
    if (f.luxury  && l.reviews > 10000)      s += 6;

    // ── region match ────────────────────────────────────────────────────────
    if (f.asia      && ASIA_APS.has(l.ap))   s += 26;
    if (f.europe    && EUROPE_APS.has(l.ap)) s += 26;
    if (f.caribbean && CARIB_APS.has(l.ap))  s += 26;
    if (f.hawaii    && HAWAII_APS.has(l.ap)) s += 26;
    if (f.americas  && AMER_APS.has(l.ap))   s += 20;

    // ── freetext word match on title + location + tags ──────────────────────
    const corpus = `${l.title} ${l.location} ${(l.tags||[]).join(" ")}`.toLowerCase();
    const words = t.replace(/[^a-z\s]/g, " ").split(/\s+/).filter(w => w.length > 3);
    words.forEach(w => { if (corpus.includes(w)) s += 7; });

    // ── rating quality signal ───────────────────────────────────────────────
    s += (l.rating - 4.85) * 30;

    return { ...l, vibeScore: Math.round(Math.max(0, s)) };
  });

  const venues = scored.sort((a, b) => b.vibeScore - a.vibeScore).slice(0, 6);

  // ── generate natural-language summary ──────────────────────────────────────
  const themes = [
    f.ski         && "powder days on the mountain",
    f.surf        && "firing surf sessions",
    f.hike        && "epic trail adventures",
    f.dive        && "underwater exploration",
    f.beach       && "beachside bliss",
    f.cold        && "cold-weather thrills",
    f.hot         && "warm-weather vibes",
    f.relax       && "a slower, chilled pace",
    f.adrenaline  && "high-intensity moments",
    f.luxury      && "upscale indulgence",
    f.budget      && "smart, budget-friendly travel",
    f.solo        && "solitude and escape",
    f.social      && "great social energy",
    f.nature      && "raw, unspoilt nature",
    f.asia        && "Asian adventure",
    f.europe      && "Mediterranean/European flair",
    f.caribbean   && "Caribbean island magic",
    f.hawaii      && "Hawaiian paradise",
  ].filter(Boolean);

  const top = venues[0];
  const themeStr = themes.length > 0
    ? themes.slice(0, 3).join(", ")
    : "adventure and discovery";

  const conditionNote = top
    ? top.conditionScore >= 82
      ? "conditions are firing right now"
      : top.conditionScore >= 68
        ? "solid conditions and good timing"
        : "good flight deals available"
    : "";

  const summary = top
    ? `Picked up on: ${themeStr}. Top match is ${top.title} in ${top.location.split(",").slice(-1)[0].trim()} — ${conditionNote}. Here are ${venues.length} destinations that fit your vibe, ranked by how well they match.`
    : `Here are your best-matching destinations based on your vibe.`;

  return { venues, summary, themes };
}

// ─── filter chip (active filter badge with ×) ─────────────────────────────────
function FilterChip({ label, onRemove }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:4, background:"#f0f9ff", border:"1.5px solid #bae6fd", borderRadius:20, padding:"4px 10px", flexShrink:0, cursor:"default" }}>
      <span style={{ fontSize:11, fontWeight:700, color:"#0284c7", fontFamily:F, whiteSpace:"nowrap" }}>{label}</span>
      <button onClick={onRemove} style={{ background:"none", border:"none", cursor:"pointer", padding:"8px", marginRight:-8, lineHeight:1, fontSize:11, color:"#0284c7", fontWeight:900, display:"flex", alignItems:"center", minWidth:34, minHeight:34, justifyContent:"center" }}>✕</button>
    </div>
  );
}

// ─── explore tab ──────────────────────────────────────────────────────────────
function applyFilters(listings, activeCat, filters, search = {}) {
  // Category: activeCat pill OR multi-select activities from search
  const acts = search.activities || [];
  let out;
  if (acts.length > 0) {
    // Multi-select from SearchSheet overrides the activeCat pill
    out = listings.filter(l => acts.includes(l.category));
  } else {
    out = activeCat === "all" ? listings : listings.filter(l => l.category === activeCat);
  }
  // Destination text filter
  if (search.destination) {
    const q = search.destination.toLowerCase();
    out = out.filter(l =>
      l.title.toLowerCase().includes(q) || l.location.toLowerCase().includes(q)
    );
  }
  // Continent filter
  if (search.continent && search.continent !== "all") {
    out = out.filter(l => AP_CONTINENT[l.ap] === search.continent);
  }
  if (filters.maxPrice  < 2000) out = out.filter(l => l.flight.price   <= filters.maxPrice);
  // Date range filter
  if (filters.startDate) {
    const start = new Date(filters.startDate);
    if (!isNaN(start)) out = out.filter(l => {
      const dep = l.flight?.departure ? new Date(l.flight.departure) : null;
      return !dep || dep >= start;
    });
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate);
    if (!isNaN(end)) out = out.filter(l => {
      const dep = l.flight?.departure ? new Date(l.flight.departure) : null;
      return !dep || dep <= end;
    });
  }
  if (filters.sort === "score") out = [...out].sort((a,b) => b.conditionScore - a.conditionScore);
  if (filters.sort === "price") out = [...out].sort((a,b) => a.flight.price   - b.flight.price);
  if (filters.sort === "value") out = [...out].sort((a,b) => {
    const valA = a.conditionScore / (a.flight.price || 1);
    const valB = b.conditionScore / (b.flight.price || 1);
    return valB - valA;
  });
  return out;
}

function ExploreTab({ listings, loading, wishlists, onToggle, onViewAlerts, activeCat, setActiveCat, filters, setFilters, search, onOpenDetail, namedLists, setNamedLists, wxLastUpdated, profile }) {
  const [showSaved, setShowSaved] = useState(false);
  const [showAllCats, setShowAllCats] = useState(false);

  // "Best Right Now" — top venues where conditions AND price converge
  const bestRightNow = [...listings]
    .filter(l => l.conditionScore >= 60 && l.flight.price < 800)
    .sort((a, b) => {
      const aVal = a.conditionScore - Math.round(a.flight.price / 20);
      const bVal = b.conditionScore - Math.round(b.flight.price / 20);
      return bVal - aVal;
    })
    .slice(0, 5);

  // Both "All" and sport tabs: always show top 5 picks.
  const allTopPicks = [...listings].sort((a, b) => b.conditionScore - a.conditionScore).slice(0, 5);
  const sportTopPicks = activeCat !== "all"
    ? [...listings.filter(l => l.category === activeCat)].sort((a, b) => b.conditionScore - a.conditionScore).slice(0, 5)
    : [];
  const firingTab = activeCat === "all" ? allTopPicks : sportTopPicks;

  const filtered = applyFilters(listings, activeCat, filters, search);
  const firingIds = new Set(firingTab.map(l => l.id));
  const bestNowIds = new Set(bestRightNow.map(l => l.id));
  const gridListings = activeCat === "all"
    ? filtered.filter(l => !firingIds.has(l.id) && !bestNowIds.has(l.id))
    : filtered;

  const isAll = activeCat === "all";
  const catLabel = CATEGORIES.find(c => c.id === activeCat)?.label || "";

  const hasActiveFilters = filters.maxPrice < 2000 || filters.sort !== "score" || filters.startDate || filters.endDate;

  // Last checked timestamp
  const timeAgo = wxLastUpdated ? (() => {
    const mins = Math.round((Date.now() - wxLastUpdated.getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.round(mins / 60)}h ago`;
  })() : null;

  // Saved count for quick-access
  const savedCount = wishlists.length;

  // Default categories: skiing + surfing + beach, rest behind "+" button
  const defaultCatIds = ["all", "skiing", "surfing", "tanning"];
  const visibleCats = showAllCats ? CATEGORIES : CATEGORIES.filter(c => defaultCatIds.includes(c.id));

  return (
    <div style={{ display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>
      {/* Category pills — 2 default + "+" */}
      <div style={{ display:"flex", gap:6, padding:"8px 14px", overflowX:"auto", scrollbarWidth:"none", WebkitOverflowScrolling:"touch", background:"#fff", borderBottom:"1px solid #f0f0f0", flexShrink:0, alignItems:"center" }}>
        {visibleCats.map(c => (
          <button key={c.id} className={"pill" + (activeCat === c.id ? " pill-selected" : "")}
            onClick={() => { setActiveCat(c.id); haptic(); }}
            style={{
              padding:"7px 14px", borderRadius:20, cursor:"pointer", whiteSpace:"nowrap", minHeight:44,
              background: activeCat === c.id ? "#222" : "#f5f5f5",
              color: activeCat === c.id ? "#fff" : "#555",
              border:"1.5px solid", borderColor: activeCat === c.id ? "#222" : "transparent",
              fontSize:12, fontWeight:700, fontFamily:F, display:"inline-flex", alignItems:"center",
          }}>
            {c.label}
          </button>
        ))}
        {!showAllCats && (
          <button onClick={() => setShowAllCats(true)} className="pill" style={{
            padding:"7px 12px", borderRadius:20, cursor:"pointer", background:"#f0f0f0", minHeight:44, minWidth:44,
            border:"1.5px solid transparent", fontSize:13, fontWeight:700, color:"#888", fontFamily:F, display:"inline-flex", alignItems:"center", justifyContent:"center",
          }}>+</button>
        )}
        {/* Saved quick-access */}
        {savedCount > 0 && (
          <button onClick={() => setShowSaved(!showSaved)} className="pill" style={{
            padding:"7px 12px", borderRadius:20, cursor:"pointer", marginLeft:"auto",
            background: showSaved ? "#fee2e2" : "#f5f5f5",
            border:"1.5px solid", borderColor: showSaved ? "#f87171" : "transparent",
            fontSize:12, fontWeight:700, color: showSaved ? "#ef4444" : "#888", fontFamily:F,
          }}>
            ❤️ {savedCount}
          </button>
        )}
      </div>

      {/* Active filter strip */}
      {hasActiveFilters && (
        <div style={{ display:"flex", gap:6, padding:"6px 14px", overflowX:"auto", scrollbarWidth:"none", background:"#fff", borderBottom:"1px solid #f0f0f0", flexShrink:0, alignItems:"center" }}>
          {filters.sort !== "score" && (
            <FilterChip label={`${SORT_OPTIONS.find(s => s.id === filters.sort)?.label ?? filters.sort}`} onRemove={() => setFilters(f => ({...f, sort:"score"}))} />
          )}
          {filters.maxPrice < 2000 && (
            <FilterChip label={`Max $${filters.maxPrice}`} onRemove={() => setFilters(f => ({...f, maxPrice:2000}))} />
          )}
          {(filters.startDate || filters.endDate) && (
            <FilterChip label={`${filters.startDate || "?"} - ${filters.endDate || "?"}`} onRemove={() => setFilters(f => ({...f, startDate:"", endDate:""}))} />
          )}
          <button onClick={() => setFilters({ sort:"score", maxPrice:2000, startDate:"", endDate:"" })} style={{ flexShrink:0, background:"none", border:"none", fontSize:11, color:"#717171", fontWeight:700, fontFamily:F, cursor:"pointer", padding:"10px 12px", whiteSpace:"nowrap" }}>Clear all</button>
        </div>
      )}

      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch" }}>

        {/* ── Saved venues inline (replaces wishlists tab) ── */}
        {showSaved && (
          <div style={{ padding:"16px 14px", background:"#fef2f2", borderBottom:"1px solid #fecaca" }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#222", fontFamily:F, marginBottom:10 }}>Saved venues</div>
            <div style={{ display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4 }}>
              {listings.filter(l => wishlists.includes(l.id)).map(l => (
                <div key={l.id} className="card" onClick={() => onOpenDetail(l)} style={{
                  minWidth:140, maxWidth:140, background:"#fff", borderRadius:12, overflow:"hidden",
                  border:"1.5px solid #fecaca",
                }}>
                  <div style={{ height:70, background:l.gradient, backgroundImage:`url(${getVenuePhoto(l)})`, backgroundSize:"cover", backgroundPosition:"center", position:"relative" }}>
                    <button className="heart" onClick={e => { e.stopPropagation(); onToggle(l.id); haptic("medium"); }} style={{
                      position:"absolute", top:0, right:0, background:"none", border:"none", fontSize:12,
                      minWidth:44, minHeight:44, display:"flex", alignItems:"center", justifyContent:"center",
                    }}>❤️</button>
                  </div>
                  <div style={{ padding:"6px 8px" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#222", fontFamily:F, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.title}</div>
                    <div style={{ fontSize:9, color:"#717171", fontFamily:F }}>${l.flight.price}</div>
                  </div>
                </div>
              ))}
              {wishlists.length === 0 && (
                <div style={{ fontSize:12, color:"#999", fontFamily:F, padding:"10px 0" }}>Tap the heart on any venue to save it</div>
              )}
            </div>
          </div>
        )}

        {/* ── Hero moment: Best opportunity right now ── */}
        {!loading && bestRightNow.length > 0 && !showSaved && (() => {
          const hero = bestRightNow[0];
          const verdict = getGoVerdict(hero.conditionScore);
          return (
            <div style={{ margin:"12px 14px 0", borderRadius:20, overflow:"hidden", position:"relative" }}
              onClick={() => { onOpenDetail(hero); haptic(); }} className="card">
              <LazyBg src={getVenuePhoto(hero)} gradient={hero.gradient}
                style={{ height:210, position:"relative" }}>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.25) 100%)" }} />
                <div style={{ position:"absolute", top:14, left:14 }}>
                  <div style={{ background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)", borderRadius:20, padding:"4px 10px", border:"1px solid rgba(255,255,255,0.2)", display:"inline-block" }}>
                    <span style={{ fontSize:10, fontWeight:800, color:"white", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.06em" }}>Best right now</span>
                  </div>
                </div>
                <div style={{ position:"absolute", top:14, right:14 }}>
                  <GoVerdictBadge score={hero.conditionScore} size="lg" />
                </div>
                <div style={{ position:"absolute", bottom:14, left:14, right:14 }}>
                  <div style={{ fontSize:22, fontWeight:900, color:"white", fontFamily:F, lineHeight:1.15, textShadow:"0 1px 4px rgba(0,0,0,0.4)" }}>
                    {hero.title}
                  </div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", fontFamily:F, marginTop:3 }}>{hero.location}</div>
                  <div style={{ display:"flex", gap:8, marginTop:10 }}>
                    <div style={{ background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)", borderRadius:10, padding:"7px 12px", flex:1, textAlign:"center", border:"1px solid rgba(255,255,255,0.12)" }}>
                      <div style={{ fontSize:15, fontWeight:900, color:"white", fontFamily:F }}>{hero.conditionScore}<span style={{ fontSize:9, color:"rgba(255,255,255,0.5)" }}>/100</span></div>
                      <div style={{ fontSize:9, color:"rgba(255,255,255,0.65)", fontFamily:F, marginTop:1 }}>{hero.conditionLabel}</div>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)", borderRadius:10, padding:"7px 12px", flex:1, textAlign:"center", border:"1px solid rgba(255,255,255,0.12)" }}>
                      <div style={{ fontSize:15, fontWeight:900, color:"white", fontFamily:F }}>${hero.flight.price}</div>
                      <div style={{ fontSize:9, color:"rgba(255,255,255,0.65)", fontFamily:F, marginTop:1 }}>from {profile?.homeAirport || "JFK"}</div>
                    </div>
                  </div>
                </div>
              </LazyBg>
            </div>
          );
        })()}

        {/* ── Last updated + data freshness ── */}
        {timeAgo && !loading && (
          <div style={{ padding:"8px 14px 0", display:"flex", justifyContent:"flex-end" }}>
            <span style={{ fontSize:10, color:"#bbb", fontFamily:F }}>Updated {timeAgo}</span>
          </div>
        )}

        {/* ── Best Right Now carousel ── */}
        {!loading && bestRightNow.length > 1 && (
          <div style={{ marginTop:12, marginBottom:16 }}>
            <div style={{ padding:"0 24px 8px", display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
              <div>
                <div style={{ fontSize:16, fontWeight:900, color:"#222", fontFamily:F }}>
                  Best Right Now
                </div>
                <div style={{ fontSize:11, color:"#717171", fontFamily:F, marginTop:1 }}>Conditions + prices converging this week</div>
              </div>
            </div>
            <div style={{
              display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none",
              WebkitOverflowScrolling:"touch", padding:"0 24px", scrollSnapType:"x mandatory",
            }}>
              {bestRightNow.slice(1).map(l => {
                const v = getGoVerdict(l.conditionScore);
                return (
                  <div key={l.id} className="card" onClick={() => onOpenDetail(l)}
                    style={{
                      minWidth:170, maxWidth:170, scrollSnapAlign:"start",
                      background:"#fff", borderRadius:14, overflow:"hidden",
                      border:`1.5px solid ${v.color}33`,
                      boxShadow:"0 1px 8px rgba(0,0,0,0.05)",
                    }}>
                    <div style={{ height:90, background:l.gradient, backgroundImage:`url(${getVenuePhoto(l)})`, backgroundSize:"cover", backgroundPosition:"center", position:"relative", display:"flex", alignItems:"flex-end", padding:8 }}>
                      <GoVerdictBadge score={l.conditionScore} />
                      <button className="heart" onClick={e => { e.stopPropagation(); onToggle(l.id); haptic("medium"); }} style={{
                        position:"absolute", top:0, right:0, background:"none", border:"none", fontSize:14,
                        minWidth:44, minHeight:44, display:"flex", alignItems:"center", justifyContent:"center",
                        filter: wishlists.includes(l.id) ? "none" : "drop-shadow(0 1px 3px rgba(0,0,0,0.5))",
                      }}>{wishlists.includes(l.id) ? "❤️" : "🤍"}</button>
                    </div>
                    <div style={{ padding:"8px 10px" }}>
                      <div style={{ fontSize:12, fontWeight:800, color:"#222", fontFamily:F, lineHeight:1.2 }}>{l.title}</div>
                      <div style={{ fontSize:10, color:"#717171", fontFamily:F, marginTop:2 }}>{l.location}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:5 }}>
                        <span style={{ fontSize:12, fontWeight:900, color:"#0284c7", fontFamily:F }}>${l.flight.price}</span>
                        <span style={{ fontSize:9, color:"#717171", fontFamily:F }}>{l.conditionScore}/100</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Grid header */}
        <div style={{ padding:"4px 24px 14px" }}>
          <div style={{ fontSize:18, fontWeight:800, color:"#222", fontFamily:F }}>
            {isAll ? "All experiences" : catLabel}
          </div>
          <div style={{ fontSize:13, color:"#717171", marginTop:2, fontFamily:F }}>
            {loading ? "Fetching live conditions…" : `${gridListings.length} spots`}
          </div>
        </div>

        {/* Grid — 3-column compact for "All", 2-column full for sport tabs */}
        <div style={{
          display:"grid",
          gridTemplateColumns: isAll ? "1fr 1fr 1fr" : "1fr 1fr",
          gap: isAll ? 10 : 16,
          padding: isAll ? "0 14px 24px" : "0 24px 24px",
        }}>
          {loading
            ? Array(isAll ? 9 : 4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : gridListings.length > 0
              ? gridListings.map(l =>
                  isAll
                    ? <CompactCard key={l.id} listing={l} wishlists={wishlists} onToggle={onToggle} onOpen={onOpenDetail} />
                    : <ListingCard key={l.id} listing={l} wishlists={wishlists} onToggle={onToggle} onOpen={onOpenDetail} />
                )
              : (
                <div style={{ gridColumn:"1/-1", padding:"40px 20px", textAlign:"center" }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>🌤️</div>
                  <div style={{ fontSize:16, fontWeight:700, color:"#222", fontFamily:F, marginBottom:6 }}>Nothing great this weekend</div>
                  <div style={{ fontSize:13, color:"#717171", fontFamily:F, marginBottom:6, lineHeight:1.5 }}>
                    {bestRightNow.length > 0
                      ? `But ${bestRightNow[0].title} looks promising in the coming weeks and flights are still $${bestRightNow[0].flight.price}.`
                      : "Conditions are quiet across the board right now."}
                  </div>
                  <div style={{ fontSize:13, color:"#0284c7", fontFamily:F, fontWeight:700, marginBottom:16 }}>
                    Set an alert and we'll text you when it's time.
                  </div>
                  <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
                    <button onClick={onViewAlerts} className="pressable" style={{
                      background:"#0284c7", border:"none", borderRadius:12, padding:"12px 20px",
                      color:"white", fontSize:13, fontWeight:700, fontFamily:F, cursor:"pointer",
                    }}>Set an alert</button>
                    <button onClick={() => setActiveCat("all")} className="pressable" style={{
                      background:"#f5f5f5", border:"1.5px solid #e8e8e8", borderRadius:12, padding:"12px 20px",
                      color:"#555", fontSize:13, fontWeight:700, fontFamily:F, cursor:"pointer",
                    }}>Show all</button>
                  </div>
                </div>
              )
          }
        </div>
        <div style={{ height:24 }} />
      </div>
    </div>
  );
}

// ─── wishlists tab ────────────────────────────────────────────────────────────
function WishlistsTab({ listings, wishlists, onToggle, namedLists, setNamedLists, onOpenDetail }) {
  const [view,         setView]         = useState("home"); // "home" | listId
  const [creatingList, setCreatingList] = useState(false);
  const [newListName,  setNewListName]  = useState("");
  const [newListEmoji, setNewListEmoji] = useState("🗺️");

  const savedAll  = listings.filter(l => wishlists.includes(l.id));
  const EMOJIS    = ["🗺️","🎿","🏄","☀️","🌊","🏝️","⛷️","🛫","🎒"];

  const createList = () => {
    if (!newListName.trim()) return;
    setNamedLists(ls => [...ls, { id: Date.now().toString(), name: newListName.trim(), emoji: newListEmoji, venueIds:[] }]);
    setNewListName(""); setNewListEmoji("🗺️"); setCreatingList(false);
  };
  const deleteList = (id) => setNamedLists(ls => ls.filter(l => l.id !== id));

  // ── Inner list view ──
  if (view !== "home") {
    const list = namedLists.find(l => l.id === view);
    if (!list) { setView("home"); return null; }
    const listListings = listings.filter(l => list.venueIds.includes(l.id));
    return (
      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ padding:"20px 20px 14px", display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => setView("home")} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", padding:0 }}>←</button>
          <span style={{ fontSize:22 }}>{list.emoji}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:900, color:"#222", fontFamily:F }}>{list.name}</div>
            <div style={{ fontSize:12, color:"#aaa", fontFamily:F }}>{list.venueIds.length} spots saved</div>
          </div>
          <button onClick={() => deleteList(list.id)} style={{ background:"#f0f9ff", border:"none", borderRadius:10, padding:"6px 10px", cursor:"pointer", fontSize:11, fontWeight:700, color:"#0284c7", fontFamily:F }}>Delete</button>
        </div>
        {listListings.length === 0 ? (
          <div style={{ padding:"48px 24px", textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>{list.emoji}</div>
            <div style={{ fontSize:15, fontWeight:700, color:"#222", fontFamily:F, marginBottom:6 }}>Empty list</div>
            <div style={{ fontSize:13, color:"#aaa", fontFamily:F }}>Open any venue and tap "Save to list" to add spots here</div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, padding:"0 20px 24px" }}>
            {listListings.map(l => <ListingCard key={l.id} listing={l} wishlists={wishlists} onToggle={onToggle} onOpen={onOpenDetail} />)}
          </div>
        )}
        <div style={{ height:32 }} />
      </div>
    );
  }

  // ── Home view ──
  return (
    <div style={{ flex:1, overflowY:"auto" }}>
      <div style={{ padding:"22px 20px 16px", display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontSize:22, fontWeight:900, color:"#222", fontFamily:F }}>Wishlists</div>
          <div style={{ fontSize:13, color:"#aaa", marginTop:3, fontFamily:F }}>Your saved adventures</div>
        </div>
        <button onClick={() => setCreatingList(true)} className="pressable" style={{
          background:"#0284c7", border:"none", borderRadius:20, padding:"8px 16px",
          color:"white", fontSize:12, fontWeight:800, fontFamily:F, cursor:"pointer",
          display:"flex", alignItems:"center", gap:5,
        }}>＋ New list</button>
      </div>

      {/* Create list form */}
      {creatingList && (
        <div className="bounce-in" style={{ margin:"0 20px 16px", background:"#f7f7f7", borderRadius:16, padding:"14px" }}>
          <div style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F, marginBottom:10 }}>New list</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10 }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setNewListEmoji(e)} style={{
                width:34, height:34, borderRadius:"50%", background: newListEmoji===e ? "#0284c7" : "#fff",
                border:"1.5px solid", borderColor: newListEmoji===e ? "#0284c7" : "#e0e0e0",
                fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
              }}>{e}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input type="text" placeholder='"Japan Winter 🎿" or "Caribbean 🏝️"'
              value={newListName} onChange={e => setNewListName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createList()}
              style={{ flex:1, padding:"10px 12px", borderRadius:12, border:"1.5px solid #e0e0e0", fontSize:13, fontFamily:F, color:"#222", background:"#fff" }}
            />
            <button onClick={createList} style={{ background:"#0284c7", border:"none", borderRadius:12, padding:"10px 14px", color:"white", fontSize:13, fontWeight:800, fontFamily:F, cursor:"pointer" }}>Create</button>
          </div>
          <button onClick={() => setCreatingList(false)} style={{ marginTop:8, background:"none", border:"none", fontSize:12, color:"#bbb", cursor:"pointer", fontFamily:F }}>Cancel</button>
        </div>
      )}

      {/* Named lists */}
      {namedLists.length > 0 && (
        <div style={{ padding:"0 20px 16px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#aaa", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Your lists</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {namedLists.map(l => {
              const previewListings = listings.filter(v => l.venueIds.slice(0,3).includes(v.id));
              return (
                <button key={l.id} onClick={() => setView(l.id)} className="pressable" style={{
                  background:"#fff", border:"1.5px solid #e8e8e8", borderRadius:16, padding:"14px 16px",
                  display:"flex", alignItems:"center", gap:12, cursor:"pointer", textAlign:"left",
                  boxShadow:"0 1px 6px rgba(0,0,0,0.05)",
                }}>
                  <div style={{ width:48, height:48, borderRadius:12, background:`linear-gradient(135deg,#0284c722,#0ea5e922)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{l.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:800, color:"#222", fontFamily:F }}>{l.name}</div>
                    <div style={{ fontSize:12, color:"#aaa", fontFamily:F, marginTop:2 }}>{l.venueIds.length} spot{l.venueIds.length !== 1 ? "s" : ""}</div>
                  </div>
                  {previewListings.length > 0 && (
                    <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                      {previewListings.map(v => <span key={v.id} style={{ fontSize:11, fontWeight:700, color:"#0284c7", fontFamily:F }}>{CATEGORIES.find(c=>c.id===v.category)?.label||"Spot"}</span>)}
                    </div>
                  )}
                  <span style={{ color:"#ccc", fontSize:16 }}>›</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* All saved */}
      <div style={{ padding:"0 20px 14px" }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#aaa", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>
          All saves · {savedAll.length}
        </div>
        {savedAll.length === 0 ? (
          <div style={{ padding:"40px 0", textAlign:"center" }}>
            <div style={{ fontSize:52, marginBottom:12 }}>🤍</div>
            <div style={{ fontSize:16, fontWeight:700, color:"#222", fontFamily:F, marginBottom:6 }}>Nothing saved yet</div>
            <div style={{ fontSize:13, color:"#aaa", fontFamily:F }}>Tap the heart on any spot to save it here</div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {savedAll.map(l => <ListingCard key={l.id} listing={l} wishlists={wishlists} onToggle={onToggle} onOpen={onOpenDetail} />)}
          </div>
        )}
      </div>
      <div style={{ height:32 }} />
    </div>
  );
}

// ─── alerts tab ───────────────────────────────────────────────────────────────
function AlertsTab({ listings, userAlerts, setUserAlerts, profile }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft]   = useState({ sport:"", condition:"great", locations:[], priceMax:500 });

  // Helper to get condition score threshold
  const getScoreThreshold = (condition) => {
    switch(condition) {
      case "insane": return 95;
      case "great": return 85;
      case "good": return 70;
      case "custom": return draft.customScore || 85;
      case "powder": return 93;
      case "swell": return 92;
      default: return 85;
    }
  };

  // Helper to check if a listing matches a powder/swell condition
  const matchesSpecialCondition = (listing, condition) => {
    if (condition === "powder" && listing.category === "skiing") {
      return listing.tags?.includes("Powder Day") || listing.conditionScore >= 93;
    }
    if (condition === "swell" && listing.category === "surfing") {
      return listing.tags?.includes("Offshore Winds") || listing.conditionScore >= 92;
    }
    return false;
  };

  const firing = listings.filter(l =>
    userAlerts.some(a => {
      const sportMatch = a.sport === "all" || a.sport === l.category;
      const locationMatch = a.locations.length === 0 || a.locations.includes(l.id);
      const priceMatch = l.flight.price <= a.priceMax;

      let scoreMatch = false;
      if (a.condition === "powder" || a.condition === "swell") {
        scoreMatch = matchesSpecialCondition(l, a.condition);
      } else {
        const threshold = getScoreThreshold(a.condition);
        scoreMatch = l.conditionScore >= threshold;
      }

      return sportMatch && locationMatch && priceMatch && scoreMatch;
    })
  );

  const addAlert  = () => {
    if (!draft.sport) return;
    const alertData = { ...draft, id: Date.now() };
    if (draft.condition === "custom") {
      alertData.customScore = draft.customScore || 85;
    }
    setUserAlerts(p => [...p, alertData]);
    setDraft({ sport:"", condition:"great", locations:[], priceMax:500 });
    setAdding(false);
  };
  const delAlert  = id => setUserAlerts(p => p.filter(a => a.id !== id));

  // ── add alert sheet ────────────────────────────────────────────────────────
  if (adding) return (
    <div style={{ flex:1, overflowY:"auto" }}>
      <div style={{ padding:"24px 24px 0" }}>
        <button onClick={() => setAdding(false)} style={{
          background:"none", border:"none", fontSize:14, color:"#717171", cursor:"pointer", fontFamily:F,
          display:"flex", alignItems:"center", gap:4,
        }}>← Back</button>
        <div style={{ fontSize:22, fontWeight:900, color:"#222", fontFamily:F, marginTop:14 }}>Create Alert</div>
        <div style={{ fontSize:14, color:"#717171", marginTop:4, fontFamily:F, lineHeight:1.4 }}>
          We'll text you when conditions peak AND flights are cheap — so you never miss your window.
        </div>
      </div>

      <div style={{ padding:24 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#222", fontFamily:F, marginBottom:12 }}>Pick a sport</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {[{ id:"all", label:"Any sport", emoji:"✨" }, ...CATEGORIES.filter(c => c.id !== "all")].map(cat => (
            <button key={cat.id} onClick={() => { setDraft(d => ({...d, sport:cat.id})); haptic(); }} style={{
              padding:"8px 14px", borderRadius:20, cursor:"pointer", fontFamily:F,
              background: draft.sport === cat.id ? "#222" : "#f7f7f7",
              color:      draft.sport === cat.id ? "#fff" : "#222",
              border:"1.5px solid", borderColor: draft.sport === cat.id ? "#222" : "#e8e8e8",
              fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:5,
            }}>
              {cat.label}
            </button>
          ))}
        </div>

        {draft.sport && (
          <div className="fade-in">
            {/* Condition presets */}
            <div style={{ marginTop:28 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#222", fontFamily:F, marginBottom:12 }}>Trigger condition</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {draft.sport === "skiing" && (
                  <button onClick={() => { setDraft(d => ({...d, condition:"powder"})); haptic(); }} style={{
                    padding:"12px 14px", borderRadius:12, border:"1.5px solid", cursor:"pointer", fontFamily:F,
                    background: draft.condition === "powder" ? "#222" : "#f7f7f7",
                    color: draft.condition === "powder" ? "#fff" : "#222",
                    borderColor: draft.condition === "powder" ? "#222" : "#e8e8e8",
                    fontSize:13, fontWeight:600, textAlign:"left",
                  }}>
                    Powder Day (score ≥ 93)
                  </button>
                )}
                {draft.sport === "surfing" && (
                  <button onClick={() => { setDraft(d => ({...d, condition:"swell"})); haptic(); }} style={{
                    padding:"12px 14px", borderRadius:12, border:"1.5px solid", cursor:"pointer", fontFamily:F,
                    background: draft.condition === "swell" ? "#222" : "#f7f7f7",
                    color: draft.condition === "swell" ? "#fff" : "#222",
                    borderColor: draft.condition === "swell" ? "#222" : "#e8e8e8",
                    fontSize:13, fontWeight:600, textAlign:"left",
                  }}>
                    Perfect Swell (score ≥ 92)
                  </button>
                )}
                <button onClick={() => { setDraft(d => ({...d, condition:"insane"})); haptic(); }} style={{
                  padding:"12px 14px", borderRadius:12, border:"1.5px solid", cursor:"pointer", fontFamily:F,
                  background: draft.condition === "insane" ? "#222" : "#f7f7f7",
                  color: draft.condition === "insane" ? "#fff" : "#222",
                  borderColor: draft.condition === "insane" ? "#222" : "#e8e8e8",
                  fontSize:13, fontWeight:600, textAlign:"left",
                }}>
                  Insane conditions (score ≥ 95)
                </button>
                <button onClick={() => { setDraft(d => ({...d, condition:"great"})); haptic(); }} style={{
                  padding:"12px 14px", borderRadius:12, border:"1.5px solid", cursor:"pointer", fontFamily:F,
                  background: draft.condition === "great" ? "#222" : "#f7f7f7",
                  color: draft.condition === "great" ? "#fff" : "#222",
                  borderColor: draft.condition === "great" ? "#222" : "#e8e8e8",
                  fontSize:13, fontWeight:600, textAlign:"left",
                }}>
                  Great conditions (score ≥ 85)
                </button>
                <button onClick={() => { setDraft(d => ({...d, condition:"good"})); haptic(); }} style={{
                  padding:"12px 14px", borderRadius:12, border:"1.5px solid", cursor:"pointer", fontFamily:F,
                  background: draft.condition === "good" ? "#222" : "#f7f7f7",
                  color: draft.condition === "good" ? "#fff" : "#222",
                  borderColor: draft.condition === "good" ? "#222" : "#e8e8e8",
                  fontSize:13, fontWeight:600, textAlign:"left",
                }}>
                  Good conditions (score ≥ 70)
                </button>
                <button onClick={() => { setDraft(d => ({...d, condition:"custom", customScore: 85})); haptic(); }} style={{
                  padding:"12px 14px", borderRadius:12, border:"1.5px solid", cursor:"pointer", fontFamily:F,
                  background: draft.condition === "custom" ? "#222" : "#f7f7f7",
                  color: draft.condition === "custom" ? "#fff" : "#222",
                  borderColor: draft.condition === "custom" ? "#222" : "#e8e8e8",
                  fontSize:13, fontWeight:600, textAlign:"left",
                }}>
                  Custom score
                </button>
              </div>
            </div>

            {draft.condition === "custom" && (
              <div style={{ marginTop:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:"#222", fontFamily:F }}>Min score</span>
                  <span style={{ fontSize:15, fontWeight:800, color:"#0284c7", fontFamily:F }}>{draft.customScore}</span>
                </div>
                <input type="range" min={60} max={98} value={draft.customScore}
                  onChange={e => setDraft(d => ({...d, customScore:+e.target.value}))}
                  style={{ width:"100%", accentColor:"#0284c7", background:"#e8e8e8" }}
                />
              </div>
            )}

            {/* Location selection */}
            <div style={{ marginTop:28 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#222", fontFamily:F, marginBottom:12 }}>Locations</div>
              <button onClick={() => setDraft(d => ({...d, locations:[]}))} style={{
                padding:"8px 12px", borderRadius:10, border:"1.5px solid", cursor:"pointer", fontFamily:F,
                background: draft.locations.length === 0 ? "#222" : "#f7f7f7",
                color: draft.locations.length === 0 ? "#fff" : "#222",
                borderColor: draft.locations.length === 0 ? "#222" : "#e8e8e8",
                fontSize:13, fontWeight:600, width:"100%", textAlign:"center", marginBottom:8,
              }}>
                Any location
              </button>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {listings
                  .filter(l => draft.sport === "all" || l.category === draft.sport)
                  .map(venue => (
                    <button key={venue.id} onClick={() => {
                      setDraft(d => {
                        const locs = [...d.locations];
                        const idx = locs.indexOf(venue.id);
                        if (idx >= 0) locs.splice(idx, 1);
                        else locs.push(venue.id);
                        return {...d, locations: locs};
                      });
                    }} style={{
                      padding:"6px 11px", borderRadius:8, border:"1.5px solid", cursor:"pointer", fontFamily:F,
                      background: draft.locations.includes(venue.id) ? "#0284c7" : "#f7f7f7",
                      color: draft.locations.includes(venue.id) ? "#fff" : "#222",
                      borderColor: draft.locations.includes(venue.id) ? "#0284c7" : "#e8e8e8",
                      fontSize:12, fontWeight:600,
                    }}>
                      {venue.title.split(",")[0]}
                    </button>
                  ))}
              </div>
            </div>

            {/* Price ceiling */}
            <div style={{ marginTop:28 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:14, fontWeight:700, color:"#222", fontFamily:F }}>
                  Max flight price · from {profile.homeAirport || "JFK"}
                </span>
                <span style={{ fontSize:15, fontWeight:800, color:"#0284c7", fontFamily:F }}>
                  {draft.priceMax >= 2100 ? "Any" : `$${draft.priceMax}`}
                </span>
              </div>
              <input type="range" min={100} max={2200} step={50} value={draft.priceMax}
                onChange={e => setDraft(d => ({...d, priceMax:+e.target.value}))}
                style={{ width:"100%", accentColor:"#0284c7", background:"#e8e8e8" }}
              />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
                <span style={{ fontSize:11, color:"#aaa", fontFamily:F }}>$100</span>
                <span style={{ fontSize:11, color:"#aaa", fontFamily:F }}>Any price</span>
              </div>
            </div>

            <button onClick={() => { addAlert(); haptic("heavy"); }} style={{
              width:"100%", background:"#0284c7", border:"none",
              borderRadius:14, padding:16, marginTop:32,
              color:"white", fontSize:15, fontWeight:800, fontFamily:F, cursor:"pointer",
            }}>
              Create Alert
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ── alerts list ─────────────────────────────────────────────────────────────
  return (
    <div style={{ flex:1, overflowY:"auto" }}>
      <div style={{ padding:"24px 24px 16px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:24, fontWeight:900, color:"#222", fontFamily:F }}>Alerts</div>
          <div style={{ fontSize:14, color:"#717171", marginTop:4, fontFamily:F }}>Know the moment conditions fire</div>
        </div>
        <button onClick={() => setAdding(true)} style={{
          background:"#222", border:"none", borderRadius:20,
          padding:"10px 18px", color:"white", fontSize:13, fontWeight:700,
          fontFamily:F, cursor:"pointer",
        }}>+ New</button>
      </div>

      {/* Firing banner */}
      {firing.length > 0 && (
        <div style={{ margin:"0 24px 20px" }}>
          <div style={{
            background:"linear-gradient(90deg,#0284c7,#38bdf8)",
            borderRadius:16, padding:"14px 18px", borderLeft:"4px solid #0284c7",
          }}>
            <div className="pulse" style={{ fontSize:14, fontWeight:800, color:"white", fontFamily:F, marginBottom:6 }}>
              {firing.length} alert{firing.length > 1 ? "s" : ""} firing now
            </div>
            {firing.slice(0, 3).map(l => (
              <div key={l.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6 }}>
                <div>
                  <span style={{ color:"white", fontSize:13, fontWeight:700, fontFamily:F }}>{l.title}</span>
                  <span style={{ color:"rgba(255,255,255,0.75)", fontSize:12, fontFamily:F }}> · Score {l.conditionScore}</span>
                </div>
                <span style={{ color:"white", fontSize:13, fontWeight:800, fontFamily:F }}>${l.flight.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {userAlerts.length === 0 ? (
        <div style={{ padding:"40px 24px", textAlign:"center" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#222", fontFamily:F, marginBottom:8 }}>No alerts yet</div>
          <div style={{ fontSize:13, color:"#717171", fontFamily:F, marginBottom:24 }}>
            Create an alert and we'll tell you when conditions + cheap flights align
          </div>
          <button onClick={() => setAdding(true)} style={{
            background:"#0284c7", border:"none", borderRadius:14,
            padding:"12px 24px", color:"white", fontSize:13, fontWeight:800,
            fontFamily:F, cursor:"pointer",
          }}>Create your first alert</button>
        </div>
      ) : (
        <div style={{ padding:"0 24px" }}>
          {userAlerts.map(a => {
            const cat    = CATEGORIES.find(c => c.id === a.sport);
            const active = firing.some(l => {
              const sportMatch = a.sport === "all" || a.sport === l.category;
              const locationMatch = a.locations.length === 0 || a.locations.includes(l.id);
              const priceMatch = l.flight.price <= a.priceMax;
              let scoreMatch = false;
              if (a.condition === "powder" || a.condition === "swell") {
                scoreMatch = matchesSpecialCondition(l, a.condition);
              } else {
                const threshold = getScoreThreshold(a.condition);
                scoreMatch = l.conditionScore >= threshold;
              }
              return sportMatch && locationMatch && priceMatch && scoreMatch;
            });

            const conditionLabels = {
              "insane": "Insane (≥95)",
              "great": "Great (≥85)",
              "good": "Good (≥70)",
              "powder": "Powder Day",
              "swell": "Perfect Swell",
              "custom": `Custom (≥${a.customScore})`
            };

            return (
              <div key={a.id} style={{
                background: active ? "#f0f9ff" : "#f9f9f9",
                borderLeft: active ? "4px solid #0284c7" : "4px solid #e8e8e8",
                borderRadius:0, padding:16, marginBottom:12,
                display:"flex", justifyContent:"space-between", alignItems:"flex-start",
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <span style={{ fontWeight:700, fontSize:13, color:"#222", fontFamily:F }}>
                      {cat?.label || "Any sport"}
                    </span>
                    <span style={{
                      fontSize:10, fontWeight:700, background:"#e8e8e8", color:"#222",
                      padding:"4px 8px", borderRadius:4, fontFamily:F, textTransform:"uppercase",
                      letterSpacing:"0.05em"
                    }}>
                      {conditionLabels[a.condition] || a.condition}
                    </span>
                  </div>
                  {a.locations.length > 0 && (
                    <div style={{ fontSize:11, color:"#717171", fontFamily:F, marginBottom:6 }}>
                      {a.locations.length} location{a.locations.length > 1 ? "s" : ""} selected
                    </div>
                  )}
                  <div style={{ fontSize:11, color:"#aaa", fontFamily:F }}>
                    Flights ≤ {a.priceMax >= 2100 ? "any price" : `$${a.priceMax}`}
                  </div>
                </div>
                <button onClick={() => { delAlert(a.id); haptic(); }} style={{
                  background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#bbb", padding:0, marginLeft:12,
                }}>×</button>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ height:32 }} />
    </div>
  );
}

// ─── profile tab ──────────────────────────────────────────────────────────────
function ProfileTab({ profile, setProfile, filters, setFilters, wishlists = [], onShowOnboarding, savedTrips = [], setSavedTrips, listings = [], onOpenDetail, namedLists = [], setNamedLists, onToggle }) {
  const [airportQuery,   setAirportQuery]   = useState("");
  const [airportFocused, setAirportFocused] = useState(false);
  const [editMode,       setEditMode]       = useState(false);
  const [signOutConfirm, setSignOutConfirm] = useState(false);
  const [shareCopied,    setShareCopied]    = useState(false);

  const toggle = field => setProfile(p => ({...p, [field]: !p[field]}));
  const toggleSport = id => setProfile(p => ({
    ...p,
    sports: (p.sports || []).includes(id)
      ? p.sports.filter(s => s !== id)
      : [...(p.sports || []), id],
  }));

  const hasAccount  = !!profile.hasAccount;
  const sports      = profile.sports || [];
  const skillLevels = profile.skillLevels || {};
  const initials    = profile.name ? profile.name.trim()[0].toUpperCase() : "?";
  const avatarGrad  = AVATAR_COLORS.find(c => c.id === profile.avatarColor)?.grad || AVATAR_COLORS[0].grad;
  const avatarHex   = AVATAR_COLORS.find(c => c.id === profile.avatarColor)?.hex  || AVATAR_COLORS[0].hex;

  return (
    <div style={{ flex:1, overflowY:"auto" }}>

      {/* ── Social header (logged in) ── */}
      {hasAccount ? (
        <div style={{ background:"linear-gradient(160deg,#0d0d0d 0%,#1a1a1a 100%)", padding:"40px 24px 24px", position:"relative", overflow:"hidden" }}>
          {/* Decorative glow blobs */}
          <div style={{ position:"absolute", top:-50, right:-40, width:200, height:200, borderRadius:"50%", background:avatarHex, opacity:0.14, filter:"blur(50px)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-30, left:-30, width:150, height:150, borderRadius:"50%", background:avatarHex, opacity:0.09, filter:"blur(35px)", pointerEvents:"none" }} />
          {/* Subtle grid texture */}
          <div style={{ position:"absolute", inset:0, opacity:0.04, backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize:"24px 24px", pointerEvents:"none" }} />
          <div style={{ display:"flex", alignItems:"flex-end", gap:16, marginBottom:16, position:"relative" }}>
            <div style={{ position:"relative", flexShrink:0 }}>
              <div style={{
                width:80, height:80, borderRadius:"50%",
                background: avatarGrad,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:34, fontWeight:900, color:"white", fontFamily:F,
                border:"3px solid rgba(255,255,255,0.18)",
                boxShadow:`0 0 0 5px ${avatarHex}28, 0 6px 24px ${avatarHex}50`,
              }}>{initials}</div>
              {/* Online dot */}
              <div style={{ position:"absolute", bottom:4, right:4, width:14, height:14, borderRadius:"50%", background:"#22c55e", border:"2.5px solid #111" }} />
            </div>
            <div style={{ flex:1, minWidth:0, paddingBottom:4 }}>
              <div style={{ fontSize:22, fontWeight:900, color:"#fff", fontFamily:F, lineHeight:1.1, marginBottom:4 }}>
                {profile.name || "Adventure Seeker"}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontFamily:F }}>
                  ✈️ {profile.homeAirport || "No airport set"}
                </div>
                <div style={{ width:3, height:3, borderRadius:"50%", background:"rgba(255,255,255,0.25)" }} />
                <div style={{ fontSize:11, color:avatarHex, fontWeight:700, fontFamily:F }}>● Active</div>
              </div>
            </div>
          </div>

          {/* Sport skill badges */}
          {sports.length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
              {sports.map(s => {
                const cat = CATEGORIES.find(c => c.id === s);
                return (
                  <div key={s} style={{
                    background:"rgba(255,255,255,0.1)", borderRadius:20,
                    padding:"5px 12px", display:"inline-flex", alignItems:"center", gap:5,
                    border:"1px solid rgba(255,255,255,0.12)",
                  }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"white", fontFamily:F }}>{cat?.label}</span>
                    <span style={{ fontSize:11, color:"white", fontWeight:700, fontFamily:F }}>
                      {skillLevels[s] || "Intermediate"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats row */}
          <div style={{ display:"flex", gap:10, position:"relative" }}>
            <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:14, padding:"12px 0", flex:1, textAlign:"center", border:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize:20, fontWeight:900, color:"#fff", fontFamily:F }}>{wishlists.length}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.38)", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.08em", marginTop:2 }}>Saved</div>
            </div>
            <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:14, padding:"12px 0", flex:1, textAlign:"center", border:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize:20, fontWeight:900, color:"#fff", fontFamily:F }}>{sports.length}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.38)", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.08em", marginTop:2 }}>Sports</div>
            </div>
            <button className="pressable" onClick={() => setEditMode(e => !e)} style={{
              flex:1, background: editMode ? avatarHex : "rgba(255,255,255,0.09)",
              border: editMode ? "none" : "1px solid rgba(255,255,255,0.13)",
              borderRadius:14, cursor:"pointer", color:"white",
              fontSize:12, fontWeight:700, fontFamily:F,
              boxShadow: editMode ? `0 4px 14px ${avatarHex}55` : "none",
              transition:"background 0.2s",
            }}>
              {editMode ? "✓ Done" : "✏️ Edit"}
            </button>
          </div>
        </div>
      ) : (
        /* ── Join CTA (no account) ── */
        <div style={{ background:"linear-gradient(160deg,#0d0d0d,#1a1a1a)", padding:"36px 24px 28px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-40, right:-30, width:160, height:160, borderRadius:"50%", background:"#0284c7", opacity:0.1, filter:"blur(40px)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", inset:0, opacity:0.04, backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize:"24px 24px", pointerEvents:"none" }} />
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18, position:"relative" }}>
            <div style={{
              width:64, height:64, borderRadius:"50%",
              background:"linear-gradient(135deg,rgba(2,132,199,0.2),rgba(2,132,199,0.08))",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:28,
              border:"2px solid rgba(2,132,199,0.32)",
              boxShadow:"0 0 30px rgba(2,132,199,0.18)",
              flexShrink:0,
            }}>P</div>
            <div>
              <div style={{ fontSize:20, fontWeight:900, color:"#fff", fontFamily:F }}>Never miss your window</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.45)", fontFamily:F, marginTop:3, lineHeight:1.4 }}>
                We'll tell you when conditions peak and flights drop
              </div>
            </div>
          </div>
          <button className="pressable" onClick={onShowOnboarding} style={{
            width:"100%", background:"linear-gradient(135deg,#0284c7,#38bdf8)",
            border:"none", borderRadius:16, padding:"15px 0",
            color:"white", fontSize:15, fontWeight:900, fontFamily:F, cursor:"pointer",
            boxShadow:"0 4px 20px rgba(2,132,199,0.4)",
          }}>
            🚀 Create my adventure profile
          </button>
        </div>
      )}

      <div style={{ padding:"0 24px" }}>

        {/* ── Edit panel (only when hasAccount + editMode) ── */}
        {hasAccount && editMode && (
          <div style={{ marginTop:20, marginBottom:4 }}>
            {/* Avatar color */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#666", fontFamily:F, marginBottom:10, textTransform:"uppercase", letterSpacing:"0.06em" }}>Profile color</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {AVATAR_COLORS.map(col => (
                  <button key={col.id} onClick={() => setProfile(p => ({...p, avatarColor:col.id}))} style={{
                    width:34, height:34, borderRadius:"50%", background:col.grad, border:"none", cursor:"pointer",
                    boxShadow: profile.avatarColor === col.id ? `0 0 0 3px white, 0 0 0 5px ${col.hex}` : "none",
                    transition:"box-shadow 0.2s",
                  }} />
                ))}
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#666", fontFamily:F, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Name</div>
              <input type="text" value={profile.name || ""} placeholder="First name"
                onChange={e => setProfile(p => ({...p, name:e.target.value}))}
                style={{ width:"100%", padding:"13px 16px", borderRadius:12, border:"1.5px solid #e8e8e8", fontSize:15, fontFamily:F, color:"#222", background:"#fafafa", fontWeight:600 }}
              />
            </div>

            {/* Home airports (up to 3) */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#666", fontFamily:F, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>Home airports (up to 3)</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
                {(profile.homeAirports || []).map((code, idx) => {
                  const airport = ALL_AIRPORTS.find(a => a.code === code);
                  return (
                    <div key={idx} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 10px", borderRadius:20, background:"#222", color:"#fff" }}>
                      <span style={{ fontSize:11, fontWeight:600, fontFamily:F }}>{code}</span>
                      <button onClick={() => setProfile(p => ({ ...p, homeAirports: (p.homeAirports || []).filter((_, i) => i !== idx) }))} style={{ background:"none", border:"none", color:"#fff", cursor:"pointer", fontSize:14, padding:"0", marginLeft:4 }}>×</button>
                    </div>
                  );
                })}
              </div>
              {(!profile.homeAirports || profile.homeAirports.length < 3) && (
                <div style={{ position:"relative" }}>
                  <input type="text" placeholder="Add airport…" value={airportQuery}
                    onChange={e => setAirportQuery(e.target.value)}
                    onFocus={() => setAirportFocused(true)}
                    onBlur={() => setTimeout(() => setAirportFocused(false), 150)}
                    style={{ width:"100%", padding:"10px 14px", borderRadius:12, border:"1.5px solid #e8e8e8", fontSize:13, fontFamily:F, color:"#222" }}
                  />
                  {airportFocused && airportQuery.length >= 2 && (() => {
                    const q = airportQuery.toLowerCase();
                    const results = ALL_AIRPORTS.filter(a => a.city.toLowerCase().includes(q) || a.code.toLowerCase().includes(q)).slice(0, 6);
                    return results.length > 0 ? (
                      <div style={{ background:"#fff", border:"1.5px solid #e8e8e8", borderRadius:12, marginTop:4, overflow:"hidden", boxShadow:"0 6px 20px rgba(0,0,0,0.12)", zIndex:10 }}>
                        {results.map((ap, i) => {
                          const alreadyAdded = (profile.homeAirports || []).includes(ap.code);
                          return (
                            <button key={ap.code} onMouseDown={() => {
                              if (!alreadyAdded && (profile.homeAirports || []).length < 3) {
                                setProfile(p => ({ ...p, homeAirports: [...(p.homeAirports || []), ap.code] }));
                                setAirportQuery("");
                                setAirportFocused(false);
                              }
                            }} style={{
                              width:"100%", padding:"10px 14px",
                              background: alreadyAdded ? "#f0f0f0" : "#fff",
                              border:"none", borderBottom: i < results.length - 1 ? "1px solid #f0f0f0" : "none",
                              textAlign:"left", cursor: alreadyAdded ? "default" : "pointer", fontFamily:F, display:"flex", alignItems:"center", gap:10,
                              opacity: alreadyAdded ? 0.6 : 1,
                            }}>
                              <span style={{ fontSize:15 }}>{ap.flag}</span>
                              <div style={{ flex:1 }}>
                                <span style={{ fontSize:13, fontWeight:700, color:"#222" }}>{ap.code}</span>
                                <span style={{ fontSize:12, color:"#717171" }}> · {ap.city}</span>
                              </div>
                              {alreadyAdded && <span style={{ color:"#999", fontSize:14 }}>✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    ) : <div style={{ background:"#f9f9f9", border:"1.5px solid #e8e8e8", borderRadius:12, padding:"10px 14px", marginTop:4, fontSize:12, color:"#aaa", fontFamily:F }}>No airports found</div>;
                  })()}
                </div>
              )}
            </div>

            {/* Sports + skill levels */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#666", fontFamily:F, marginBottom:10, textTransform:"uppercase", letterSpacing:"0.06em" }}>Your sports</div>
              {CATEGORIES.filter(c => c.id !== "all").map(cat => {
                const sel = sports.includes(cat.id);
                return (
                  <div key={cat.id} style={{ marginBottom:8 }}>
                    <button onClick={() => toggleSport(cat.id)} style={{
                      width:"100%", padding:"11px 14px", borderRadius:12,
                      background: sel ? "#222" : "#f7f7f7", border:"1.5px solid",
                      borderColor: sel ? "#222" : "#e8e8e8",
                      display:"flex", alignItems:"center", gap:10, cursor:"pointer",
                    }}>
                      <span style={{ fontSize:13, fontWeight:700, color:"#0284c7", fontFamily:F }}>{cat.label}</span>
                      <span style={{ flex:1, textAlign:"left", fontSize:13, fontWeight:700, color: sel ? "#fff" : "#222", fontFamily:F }}>{cat.label}</span>
                      {sel && <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontFamily:F }}>{skillLevels[cat.id] || "Intermediate"}</span>}
                      <span style={{ color: sel ? "#0284c7" : "#ccc", fontWeight:900, fontSize:16 }}>{sel ? "✓" : "+"}</span>
                    </button>
                    {sel && (
                      <div style={{ display:"flex", gap:5, padding:"7px 4px 2px", flexWrap:"wrap" }}>
                        {SKILL_LEVELS.map(lv => {
                          const selLv = skillLevels[cat.id] === lv;
                          return (
                            <button key={lv} onClick={() => setProfile(p => ({ ...p, skillLevels: {...(p.skillLevels||{}), [cat.id]:lv} }))} style={{
                              padding:"5px 11px", borderRadius:16, border:"1.5px solid",
                              borderColor: selLv ? "#0284c7" : "#e0e0e0",
                              background: selLv ? "#fff0f2" : "#fff",
                              color: selLv ? "#0284c7" : "#666",
                              fontSize:11, fontWeight:700, fontFamily:F, cursor:"pointer",
                            }}>{lv}</button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Notifications ── */}
        <div style={{ marginTop:22, marginBottom:22 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#aaa", fontFamily:F, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12, paddingTop:8, borderTop:"1px solid #f0f0f0" }}>
            Notifications
          </div>
          {[
            { key:"notifyPeak",   label:"🔥 Peak conditions", desc:"Conditions 90+ AND cheap flights from your airport" },
            { key:"notifyDeal",   label:"✈️ Flight deals",    desc:"Price drops on venues you've saved or alerted" },
            { key:"notifyWeekly", label:"📅 Weekly digest",   desc:"Best windows this week — conditions + flights combined" },
          ].map(({ key, label, desc }) => (
            <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #f7f7f7" }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:"#222", fontFamily:F }}>{label}</div>
                <div style={{ fontSize:12, color:"#bbb", fontFamily:F }}>{desc}</div>
              </div>
              <div onClick={() => toggle(key)} style={{
                width:44, height:26, borderRadius:13, cursor:"pointer",
                background: profile[key] ? "#0284c7" : "#e0e0e0",
                position:"relative", transition:"background 0.2s", flexShrink:0,
              }}>
                <div style={{ position:"absolute", top:3, width:20, height:20, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.22)", transition:"left 0.2s", left: profile[key] ? 21 : 3 }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Travel Window ── */}
        <div style={{ marginBottom:22 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#aaa", fontFamily:F, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12, paddingTop:8, borderTop:"1px solid #f0f0f0" }}>
            Travel Window
          </div>
          <div style={{ fontSize:12, color:"#717171", fontFamily:F, marginBottom:10 }}>When can you travel? We'll prioritize venues that match.</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {[
              { id:"anytime", label:"Anytime" },
              { id:"30days",  label:"Next 30 days" },
              { id:"jan",     label:"January" },
              { id:"feb",     label:"February" },
              { id:"mar",     label:"March" },
              { id:"apr",     label:"April" },
              { id:"may",     label:"May" },
              { id:"jun",     label:"June" },
              { id:"jul",     label:"July" },
              { id:"aug",     label:"August" },
              { id:"sep",     label:"September" },
              { id:"oct",     label:"October" },
              { id:"nov",     label:"November" },
              { id:"dec",     label:"December" },
            ].map(opt => {
              const sel = (profile.travelWindow || "anytime") === opt.id;
              return (
                <button key={opt.id} className="pressable" onClick={() => setProfile(p => ({...p, travelWindow: opt.id}))} style={{
                  padding:"7px 12px", borderRadius:14, cursor:"pointer",
                  background: sel ? "#222" : "#f7f7f7",
                  color: sel ? "#fff" : "#555",
                  border:"1.5px solid", borderColor: sel ? "#222" : "#e8e8e8",
                  fontSize:11, fontWeight:700, fontFamily:F,
                }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Default filters ── */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#aaa", fontFamily:F, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12 }}>Default filters</div>
          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            {[
              { id:"score", label:"Best conditions" },
              { id:"price", label:"Cheapest flights" },
              { id:"value", label:"Best value" },
            ].map(opt => (
              <button key={opt.id} className="pressable" onClick={() => setFilters(f => ({...f, sort:opt.id}))} style={{
                flex:1, padding:"10px 4px", borderRadius:12, cursor:"pointer",
                background: filters.sort === opt.id ? "#222" : "#f7f7f7",
                color:      filters.sort === opt.id ? "#fff" : "#222",
                border:"1.5px solid", borderColor: filters.sort === opt.id ? "#222" : "#e8e8e8",
                display:"flex", flexDirection:"column", alignItems:"center", gap:3,
              }}>
                <span style={{ fontSize:10, fontWeight:700, fontFamily:F, textAlign:"center", lineHeight:1.2 }}>{opt.label}</span>
              </button>
            ))}
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
              <span style={{ fontSize:12, fontWeight:600, color:"#555", fontFamily:F }}>Max flight price</span>
              <span style={{ fontSize:13, fontWeight:800, color:"#0284c7", fontFamily:F }}>{filters.maxPrice >= 2000 ? "Any" : `$${filters.maxPrice}`}</span>
            </div>
            <input type="range" min={100} max={2000} step={50} value={filters.maxPrice}
              onChange={e => setFilters(f => ({...f, maxPrice:+e.target.value}))}
              style={{
                width:"100%", accentColor:"#0284c7",
                background:`linear-gradient(to right, #22c55e 0%, #f59e0b ${Math.round(((filters.maxPrice-100)/1900)*100)}%, #0284c7 ${Math.round(((filters.maxPrice-100)/1900)*100)}%, #e5e7eb 100%)`,
              }}
            />
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
              <span style={{ fontSize:10, color:"#22c55e", fontWeight:700, fontFamily:F }}>$100 Budget</span>
              <span style={{ fontSize:10, color:"#0284c7", fontWeight:700, fontFamily:F }}>Any price</span>
            </div>
          </div>
        </div>

        {/* ── Saved Trips ── */}
        {savedTrips.length > 0 && (
          <div style={{ marginBottom:22 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#aaa", fontFamily:F, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12, paddingTop:8, borderTop:"1px solid #f0f0f0" }}>
              Saved Trips
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {savedTrips.map(trip => (
                <div key={trip.id} className="card" style={{
                  background:"#fff", border:"1.5px solid #e8e8e8", borderRadius:14, overflow:"hidden",
                  boxShadow:"0 1px 6px rgba(0,0,0,0.05)",
                }}>
                  <div style={{ height:80, background:trip.venue?.gradient || "linear-gradient(135deg,#0284c7,#38bdf8)", backgroundImage:trip.venue ? `url(${getVenuePhoto(trip.venue)})` : "none", backgroundSize:"cover", backgroundPosition:"center" }} />
                  <div style={{ padding:12 }}>
                    <div style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F }}>{trip.destination}</div>
                    <div style={{ fontSize:11, color:"#717171", fontFamily:F, marginTop:3 }}>
                      {trip.days} days · ${trip.totalCost} total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Wishlists ── */}
        {wishlists.length > 0 && (
          <div style={{ marginBottom:22 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#aaa", fontFamily:F, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12, paddingTop:8, borderTop:"1px solid #f0f0f0" }}>
              Saved Venues
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {listings.filter(l => wishlists.includes(l.id)).slice(0, 6).map(l => (
                <div key={l.id} className="card" onClick={() => onOpenDetail && onOpenDetail(l)} style={{ borderRadius:12, overflow:"hidden", background:"#fff", border:"1.5px solid #e8e8e8" }}>
                  <div style={{ height:80, background:l.gradient, backgroundImage:`url(${getVenuePhoto(l)})`, backgroundSize:"cover", backgroundPosition:"center", position:"relative" }}>
                    <button className="heart" onClick={e => { e.stopPropagation(); onToggle && onToggle(l.id); }} style={{
                      position:"absolute", top:5, right:5, background:"none", border:"none", fontSize:13,
                    }}>❤️</button>
                  </div>
                  <div style={{ padding:"7px 8px" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#222", fontFamily:F, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.title}</div>
                    <div style={{ fontSize:10, color:"#717171", fontFamily:F }}>${l.flight.price} · {l.conditionLabel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Powered by ── */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#bbb", fontFamily:F, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>Powered by</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {[
              { icon:"🌤️", name:"Open-Meteo" },
              { icon:"🌊", name:"Marine API" },
              { icon:"✈️", name:"Duffel" },
              { icon:"🛰️", name:"NOAA" },
              { icon:"🏔️", name:"OpenSnow" },
              { icon:"🌍", name:"OpenStreetMap" },
            ].map(s => (
              <div key={s.name} style={{ background:"#f8f8f8", border:"1px solid #ebebeb", borderRadius:20, padding:"5px 10px", display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ fontSize:12 }}>{s.icon}</span>
                <span style={{ fontSize:11, fontWeight:700, color:"#555", fontFamily:F }}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Share & Refer (combined) ── */}
        <div style={{ marginBottom:20 }}>
          <button className="pressable" onClick={() => {
            const msg = "Check out Peakly — find surf, ski & beach spots when conditions + cheap flights align. https://peakly.app";
            const doCopy = () => {
              try {
                if (navigator.clipboard?.writeText) {
                  navigator.clipboard.writeText(msg).then(() => {
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 3000);
                  }).catch(() => { setShareCopied(true); setTimeout(() => setShareCopied(false), 3000); });
                } else {
                  setShareCopied(true);
                  setTimeout(() => setShareCopied(false), 3000);
                }
              } catch (_) {}
            };
            if (navigator.share) {
              navigator.share({ title:"Peakly", text:msg, url:"https://peakly.app" }).catch(doCopy);
            } else { doCopy(); }
          }} style={{
            width:"100%",
            background: shareCopied ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#0284c7,#38bdf8)",
            border:"none", borderRadius:14,
            padding:"15px 12px", cursor:"pointer", color:"white", fontSize:14, fontWeight:800, fontFamily:F,
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            boxShadow: shareCopied ? "0 4px 18px rgba(34,197,94,0.35)" : "0 4px 18px rgba(2,132,199,0.32)",
            transition:"background 0.35s, box-shadow 0.35s",
          }}>
            <span style={{ fontSize:18 }}>{shareCopied ? "✓" : "📤"}</span>
            {shareCopied ? "Link copied! Send to a friend 🎁" : "Share Peakly · Invite Friends 🎁"}
          </button>
          {shareCopied && (
            <div style={{ textAlign:"center", fontSize:12, color:"#22c55e", fontWeight:600, fontFamily:F, marginTop:6 }}>
              Paste it anywhere to invite a friend!
            </div>
          )}
        </div>

        {/* ── About ── */}
        <div style={{ background:"#f7f7f7", borderRadius:14, padding:"14px 16px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#222", fontFamily:F }}>Peakly</div>
            <div style={{ fontSize:12, color:"#aaa", fontFamily:F, marginTop:2 }}>Version 1.0 · Built for adventure</div>
          </div>
          <div style={{ fontSize:11, color:"#ccc", fontFamily:F }}>Open Beta</div>
        </div>

        {/* ── Sign Out ── */}
        {hasAccount && !signOutConfirm && (
          <button className="pressable" onClick={() => setSignOutConfirm(true)} style={{
            width:"100%", background:"#fff", border:"1.5px solid #ebebeb", borderRadius:14,
            padding:"14px 12px", cursor:"pointer", color:"#0284c7",
            fontSize:13, fontWeight:700, fontFamily:F, marginBottom:32,
            display:"flex", alignItems:"center", justifyContent:"center", gap:7,
          }}>
            🚪 Sign Out
          </button>
        )}
        {hasAccount && signOutConfirm && (
          <div style={{ background:"#fff5f5", border:"1.5px solid #ffcdd2", borderRadius:16, padding:"18px 16px", marginBottom:32 }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#222", fontFamily:F, marginBottom:4, textAlign:"center" }}>
              Sign out of Peakly?
            </div>
            <div style={{ fontSize:12, color:"#717171", fontFamily:F, marginBottom:16, textAlign:"center" }}>
              Your wishlists and alerts stay saved locally.
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setSignOutConfirm(false)} style={{
                flex:1, background:"#f7f7f7", border:"1.5px solid #e8e8e8", borderRadius:12,
                padding:"12px", cursor:"pointer", color:"#555",
                fontSize:13, fontWeight:700, fontFamily:F,
              }}>Cancel</button>
              <button onClick={() => {
                setProfile(p => ({ ...p, name:"", email:"", hasAccount:false, sports:[], skillLevels:{}, avatarColor:"sunset" }));
                setSignOutConfirm(false);
              }} style={{
                flex:1, background:"#0284c7", border:"none", borderRadius:12,
                padding:"12px", cursor:"pointer", color:"white",
                fontSize:13, fontWeight:700, fontFamily:F,
              }}>Sign Out</button>
            </div>
          </div>
        )}
        {!hasAccount && <div style={{ height:32 }} />}
      </div>
    </div>
  );
}

// ─── vibe search sheet ────────────────────────────────────────────────────────
function VibeSearchSheet({ listings, wishlists, onToggle, onClose, onOpenDetail }) {
  const [query,  setQuery]  = useState("");
  const [phase,  setPhase]  = useState("input"); // "input" | "thinking" | "results"
  const [result, setResult] = useState(null);
  const [typed,  setTyped]  = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (phase === "input") setTimeout(() => inputRef.current?.focus(), 180);
  }, [phase]);

  // Typewriter effect for summary text
  useEffect(() => {
    if (!result?.summary || phase !== "results") return;
    setTyped("");
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTyped(result.summary.slice(0, i));
      if (i >= result.summary.length) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [result, phase]);

  const run = async () => {
    if (!query.trim()) return;
    setPhase("thinking");
    // Brief pause so the "thinking" state is visible and feels deliberate
    await new Promise(r => setTimeout(r, 1300));
    const res = scoreVibeMatch(listings, query);
    setResult(res);
    setPhase("results");
  };

  const runPrompt = (p) => { setQuery(p); setTimeout(() => run(), 10); };
  const reset     = () => { setQuery(""); setResult(null); setPhase("input"); };

  const summaryDone = typed.length >= (result?.summary?.length ?? 0);

  return (
    <>
      <div className="backdrop" onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.58)", zIndex:200 }} />
      <div className="sheet" style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"min(430px,100vw)", background:"#fff", borderRadius:"28px 28px 0 0",
        zIndex:201, maxHeight:"93vh", display:"flex", flexDirection:"column",
        overflow:"hidden",
      }}>

        {/* ── Header ── */}
        <div style={{ background:"linear-gradient(145deg,#0f0c29,#302b63,#24243e)", padding:"20px 20px 18px", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span className="vibe-spin" style={{ fontSize:20, display:"inline-block" }}>✨</span>
              <span style={{ fontSize:17, fontWeight:900, color:"white", fontFamily:F, letterSpacing:"-0.3px" }}>Vibe Search</span>
              <span style={{ background:"linear-gradient(135deg,#0284c7,#7c3aed)", borderRadius:8, padding:"2px 8px", fontSize:10, color:"white", fontWeight:800, fontFamily:F, letterSpacing:"0.04em" }}>AI</span>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.1)", border:"none", borderRadius:"50%", width:32, height:32, color:"white", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>

          {/* Input box — shown in input + thinking phases */}
          {phase !== "results" && (
            <div style={{ position:"relative" }}>
              <textarea
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); run(); } }}
                placeholder={"Describe your ideal trip vibe...\ne.g. \"powder day, epic views, cozy lodge après\""}
                rows={3}
                style={{
                  width:"100%", padding:"14px 56px 14px 16px", borderRadius:16, boxSizing:"border-box",
                  border:"1.5px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.09)",
                  color:"white", fontSize:13, fontFamily:F, lineHeight:1.55,
                  resize:"none", outline:"none",
                }}
              />
              {query.trim() && phase === "input" && (
                <button onClick={run} style={{
                  position:"absolute", bottom:12, right:12,
                  background:"linear-gradient(135deg,#0284c7,#7c3aed)", border:"none", borderRadius:14,
                  width:38, height:38, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
                }}>→</button>
              )}
            </div>
          )}

          {/* Results header: show query + redo */}
          {phase === "results" && (
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ flex:1, fontSize:12, color:"rgba(255,255,255,0.55)", fontFamily:F, fontStyle:"italic", lineHeight:1.45 }}>
                "{query.length > 64 ? query.slice(0, 64) + "…" : query}"
              </div>
              <button onClick={reset} style={{
                background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.18)",
                borderRadius:12, padding:"7px 13px", color:"white",
                fontSize:11, fontWeight:700, fontFamily:F, cursor:"pointer", flexShrink:0,
              }}>↩ New search</button>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch" }}>

          {/* ── Input phase: suggestion chips ── */}
          {phase === "input" && (
            <div style={{ padding:"20px 16px 32px" }}>
              <div style={{ fontSize:10, fontWeight:800, color:"#bbb", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Try a vibe →</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20 }}>
                {VIBE_PROMPTS.map(p => (
                  <button key={p} onClick={() => runPrompt(p)} style={{
                    padding:"9px 13px", borderRadius:20, border:"1.5px solid #ebebeb",
                    background:"#f8f8f8", cursor:"pointer",
                    fontSize:12, fontWeight:600, color:"#444", fontFamily:F,
                    textAlign:"left", lineHeight:1.3, transition:"background 0.15s",
                  }}>{p}</button>
                ))}
              </div>
              <div style={{ background:"linear-gradient(135deg,#fafafe,#fff8ff)", borderRadius:16, padding:"14px 16px", border:"1.5px solid #ece8ff" }}>
                <div style={{ fontSize:12, color:"#555", fontFamily:F, lineHeight:1.65 }}>
                  <span style={{ fontWeight:800, color:"#6366f1" }}>✨ Tip:</span> Describe the feeling, not just the activity — mention weather, pace, people, budget, scenery. The more detail, the better the match.
                </div>
              </div>
            </div>
          )}

          {/* ── Thinking phase ── */}
          {phase === "thinking" && (
            <div style={{ padding:"52px 24px", textAlign:"center" }}>
              <span className="vibe-spin" style={{ fontSize:52, display:"inline-block", marginBottom:20 }}>✨</span>
              <div style={{ fontSize:16, fontWeight:800, color:"#222", fontFamily:F, marginBottom:8 }}>Reading your vibe…</div>
              <div style={{ fontSize:13, color:"#aaa", fontFamily:F, marginBottom:24 }}>
                Scanning {listings.length} destinations
              </div>
              <div style={{ display:"flex", gap:7, justifyContent:"center" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width:9, height:9, borderRadius:"50%", background:"#0284c7",
                    animation:`dotBounce 1.3s ${i * 0.2}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* ── Results phase ── */}
          {phase === "results" && result && (
            <div style={{ padding:"16px 16px 32px" }}>

              {/* AI summary card */}
              <div style={{
                background:"linear-gradient(135deg,#f5f3ff,#fff0f8)",
                borderRadius:18, padding:"16px", marginBottom:18,
                border:"1.5px solid #ede8ff",
                boxShadow:"0 2px 16px rgba(99,102,241,0.08)",
              }}>
                <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <span style={{ fontSize:20, flexShrink:0, marginTop:1 }}>✨</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:10, fontWeight:800, color:"#6366f1", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>
                      AI Analysis · {result.venues.length} matches
                    </div>
                    <div style={{ fontSize:13, color:"#333", fontFamily:F, lineHeight:1.7 }}>
                      {typed}
                      {!summaryDone && (
                        <span style={{ display:"inline-block", width:2, height:13, background:"#6366f1", marginLeft:1, verticalAlign:"text-bottom", animation:"blink 0.75s step-start infinite" }} />
                      )}
                    </div>

                    {/* Detected theme chips */}
                    {summaryDone && result.themes.length > 0 && (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:10 }}>
                        {result.themes.slice(0, 5).map(th => (
                          <span key={th} style={{
                            background:"rgba(99,102,241,0.1)", borderRadius:20,
                            padding:"3px 10px", fontSize:10, fontWeight:700,
                            color:"#6366f1", fontFamily:F,
                          }}>{th}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Venue result cards */}
              {result.venues.map((l, idx) => {
                const cat   = CATEGORIES.find(c => c.id === l.category);
                const saved = wishlists.includes(l.id);
                const rankColors = ["linear-gradient(135deg,#0284c7,#38bdf8)","linear-gradient(135deg,#f97316,#fb923c)","linear-gradient(135deg,#eab308,#fde047)"];
                const rankBg = rankColors[idx] ?? "linear-gradient(135deg,#e5e7eb,#d1d5db)";
                const rankText = idx < 3 ? "white" : "#888";
                return (
                  <div key={l.id} className="pressable" onClick={() => { onOpenDetail(l); onClose(); }} style={{
                    background:"#fff", borderRadius:18, padding:"14px 14px 12px", marginBottom:10,
                    border:"1.5px solid #f0f0f0", boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
                    cursor:"pointer",
                  }}>
                    <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                      {/* Rank badge */}
                      <div style={{
                        width:34, height:34, borderRadius:11, background:rankBg,
                        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                      }}>
                        <span style={{ fontSize:12, fontWeight:900, color:rankText, fontFamily:F }}>#{idx+1}</span>
                      </div>

                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6, marginBottom:6 }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:14, fontWeight:800, color:"#222", fontFamily:F, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                              {l.title}
                            </div>
                            <div style={{ fontSize:11, color:"#999", fontFamily:F, marginTop:1 }}>📍 {l.location}</div>
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); onToggle(l.id); }}
                            style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", flexShrink:0, padding:"2px 0" }}
                          >{saved ? "❤️" : "🤍"}</button>
                        </div>

                        {/* Stats row */}
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          <span style={{
                            background: l.conditionScore >= 82 ? "#f0f9ff" : l.conditionScore >= 68 ? "#fff7ed" : "#f7f7f7",
                            borderRadius:9, padding:"3px 9px", fontSize:11, fontWeight:800,
                            color: l.conditionScore >= 82 ? "#ff385c" : l.conditionScore >= 68 ? "#ea580c" : "#666",
                            fontFamily:F,
                          }}>{l.conditionScore}</span>
                          <span style={{ background:"#f0fff4", borderRadius:9, padding:"3px 9px", fontSize:11, fontWeight:800, color:"#16a34a", fontFamily:F }}>
                            ${l.flight.price}
                          </span>
                          <span style={{ background:"#f7f7f7", borderRadius:9, padding:"3px 9px", fontSize:11, fontWeight:700, color:"#555", fontFamily:F }}>
                            {cat?.label}
                          </span>
                          {l.flight.pct > 10 && (
                            <span style={{ background:"#ecfdf5", borderRadius:9, padding:"3px 9px", fontSize:11, fontWeight:700, color:"#059669", fontFamily:F }}>
                              -{l.flight.pct}% off
                            </span>
                          )}
                        </div>

                        {/* First tag */}
                        {l.tags?.[0] && (
                          <div style={{ fontSize:11, color:"#999", fontFamily:F, marginTop:6, fontStyle:"italic" }}>
                            "{l.tags[0]}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div style={{ height:16 }} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── onboarding sheet ─────────────────────────────────────────────────────────
const SKILL_LEVELS = ["Beginner","Intermediate","Advanced","Expert"];
const AVATAR_COLORS = [
  { id:"sunset",  grad:"linear-gradient(135deg,#ff385c,#ff8c00)", hex:"#ff385c" },
  { id:"ocean",   grad:"linear-gradient(135deg,#0ea5e9,#0d6efd)", hex:"#0ea5e9" },
  { id:"forest",  grad:"linear-gradient(135deg,#22c55e,#16a34a)", hex:"#22c55e" },
  { id:"violet",  grad:"linear-gradient(135deg,#8b5cf6,#6d28d9)", hex:"#8b5cf6" },
  { id:"pink",    grad:"linear-gradient(135deg,#ec4899,#be185d)", hex:"#ec4899" },
  { id:"amber",   grad:"linear-gradient(135deg,#f59e0b,#b45309)", hex:"#f59e0b" },
  { id:"teal",    grad:"linear-gradient(135deg,#14b8a6,#0d9488)", hex:"#14b8a6" },
  { id:"night",   grad:"linear-gradient(135deg,#334155,#0f172a)", hex:"#334155" },
];

function OnboardingSheet({ profile, setProfile, onClose }) {
  const [step,        setStep]       = useState(1);
  const [name,        setName]       = useState(profile.name  || "");
  const [email,       setEmail]      = useState(profile.email || "");
  const [sports,      setSports]     = useState(profile.sports || []);
  const [airport,     setAirport]    = useState(profile.homeAirport || "JFK");
  const [apQuery,     setApQuery]    = useState("");
  const [apFocus,     setApFocus]    = useState(false);

  const toggleSport = id => {
    setSports(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const complete = () => {
    setProfile(p => ({ ...p, name, email, sports, homeAirport: airport, hasAccount:true }));
    onClose();
  };

  const apResults = apQuery.length >= 2
    ? ALL_AIRPORTS.filter(a => a.city.toLowerCase().includes(apQuery.toLowerCase()) || a.code.toLowerCase().includes(apQuery.toLowerCase())).slice(0,5)
    : [];

  return (
    <>
      <div className="backdrop" onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:200 }} />
      <div className="sheet" style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"min(430px,100vw)", background:"#fff", borderRadius:"28px 28px 0 0",
        zIndex:201, maxHeight:"92vh", overflowY:"auto",
        paddingBottom:"max(env(safe-area-inset-bottom,0px),28px)",
      }}>
        {/* Handle */}
        <div style={{ display:"flex", justifyContent:"center", padding:"14px 0 6px" }}>
          <div style={{ width:40, height:4, borderRadius:2, background:"#ddd" }} />
        </div>

        {/* Progress dots */}
        <div style={{ display:"flex", justifyContent:"center", gap:6, paddingBottom:4 }}>
          {[1,2].map(i => (
            <div key={i} style={{
              width: step === i ? 20 : 6, height:6, borderRadius:3,
              background: step >= i ? "#0284c7" : "#e8e8e8",
              transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }} />
          ))}
        </div>

        {/* ── Step 1: Value prop + Airport ── */}
        {step === 1 && (
          <div style={{ padding:"16px 24px 0" }}>
            <div style={{ fontSize:24, fontWeight:900, color:"#222", fontFamily:F, marginBottom:8, lineHeight:1.2 }}>
              Never miss your window
            </div>
            <div style={{ fontSize:14, color:"#717171", fontFamily:F, marginBottom:24, lineHeight:1.5 }}>
              We'll tell you when conditions peak and flights drop — for every adventure on your list.
            </div>

            <div style={{ fontSize:16, fontWeight:800, color:"#222", fontFamily:F, marginBottom:12 }}>Where do you fly from? ✈️</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
              {US_AIRPORTS.map(ap => {
                const sel = airport === ap.code;
                return (
                  <button key={ap.code} className={"pill" + (sel ? " pill-selected" : "")}
                    onClick={() => { setAirport(ap.code); setApQuery(""); }} style={{
                      padding:"10px 14px", borderRadius:20, cursor:"pointer", minHeight:42,
                      background: sel ? "#222" : "#f5f5f5", color: sel ? "#fff" : "#444",
                      border:"2px solid", borderColor: sel ? "#222" : "transparent",
                      fontSize:13, fontWeight:700, fontFamily:F,
                      boxShadow: sel ? "0 2px 8px rgba(0,0,0,0.14)" : "none",
                  }}>{ap.flag} {ap.code} <span style={{ fontSize:10, opacity:0.7 }}>{ap.label}</span></button>
                );
              })}
            </div>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16, pointerEvents:"none" }}>🔍</span>
              <input type="text" placeholder="Search any airport worldwide…"
                value={apQuery} onChange={e => setApQuery(e.target.value)}
                onFocus={() => setApFocus(true)} onBlur={() => setTimeout(() => setApFocus(false), 180)}
                style={{ width:"100%", padding:"13px 14px 13px 40px", borderRadius:14, border:"1.5px solid #e8e8e8", fontSize:14, fontFamily:F, color:"#222", background:"#fafafa" }}
              />
            </div>
            {apFocus && apResults.length > 0 && (
              <div style={{ background:"#fff", border:"1.5px solid #e8e8e8", borderRadius:14, marginTop:6, overflow:"hidden", boxShadow:"0 8px 28px rgba(0,0,0,0.14)" }}>
                {apResults.map((ap,i) => (
                  <button key={ap.code} onMouseDown={() => { setAirport(ap.code); setApQuery(""); setApFocus(false); }} style={{
                    width:"100%", padding:"12px 16px", background: airport===ap.code?"#fff5f5":"#fff",
                    border:"none", borderBottom: i<apResults.length-1?"1px solid #f5f5f5":"none",
                    textAlign:"left", cursor:"pointer", fontFamily:F, display:"flex", alignItems:"center", gap:12, minHeight:48,
                  }}>
                    <span style={{ fontSize:20 }}>{ap.flag}</span>
                    <div style={{ flex:1 }}>
                      <span style={{ fontSize:14, fontWeight:800, color:"#222" }}>{ap.code}</span>
                      <span style={{ fontSize:12, color:"#717171" }}> · {ap.city}</span>
                    </div>
                    {airport===ap.code && <span style={{ color:"#0284c7", fontSize:16, fontWeight:800 }}>✓</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Name + Email inline */}
            <div style={{ marginTop:18 }}>
              <input type="text" placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)}
                style={{ width:"100%", padding:"13px 16px", borderRadius:14, border:"1.5px solid #e8e8e8", fontSize:15, fontFamily:F, color:"#222", background:"#fafafa", fontWeight:600, marginBottom:10 }}
              />
              <input type="email" placeholder="Email (optional, for alerts)" value={email} onChange={e => setEmail(e.target.value)}
                style={{ width:"100%", padding:"13px 16px", borderRadius:14, border:"1.5px solid #e8e8e8", fontSize:15, fontFamily:F, color:"#222", background:"#fafafa" }}
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Sports (simple toggle, no skill levels) ── */}
        {step === 2 && (
          <div style={{ padding:"16px 24px 0" }}>
            <div style={{ fontSize:24, fontWeight:900, color:"#222", fontFamily:F, marginBottom:4 }}>What are you into? 🏄</div>
            <div style={{ fontSize:14, color:"#717171", fontFamily:F, marginBottom:20 }}>Pick activities you want to track</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
              {CATEGORIES.filter(c => c.id !== "all" && c.id !== "tanning").map(cat => {
                const sel = sports.includes(cat.id);
                return (
                  <button key={cat.id} onClick={() => toggleSport(cat.id)} style={{
                    padding:"12px 18px", borderRadius:16, cursor:"pointer",
                    background: sel ? "#222" : "#f5f5f5",
                    color: sel ? "#fff" : "#444",
                    border:"2px solid", borderColor: sel ? "#222" : "transparent",
                    fontSize:14, fontWeight:700, fontFamily:F,
                    display:"flex", alignItems:"center", gap:8,
                    boxShadow: sel ? "0 2px 10px rgba(0,0,0,0.15)" : "none",
                  }}>
                    <span style={{ fontSize:14, fontWeight:700, fontFamily:F }}>{cat.label}</span>
                    {cat.label}
                    {sel && <span style={{ fontSize:13 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ padding:"24px 24px 8px", display:"flex", gap:10 }}>
          {step > 1 && (
            <button onClick={() => setStep(s => s-1)} className="pressable" style={{
              flex:"0 0 52px", background:"#f5f5f5", border:"none", borderRadius:16,
              fontSize:20, cursor:"pointer",
            }}>←</button>
          )}
          {step < 2 ? (
            <button onClick={() => setStep(2)} className="pressable" style={{
              flex:1, background:"#222", border:"none", borderRadius:16, padding:"17px 0",
              color:"white", fontSize:15, fontWeight:900, fontFamily:F, cursor:"pointer",
            }}>
              Continue →
            </button>
          ) : (
            <button onClick={complete} className="pressable" style={{
              flex:1, background:"linear-gradient(135deg,#0284c7,#38bdf8)", border:"none",
              borderRadius:16, padding:"17px 0", color:"white",
              fontSize:15, fontWeight:900, fontFamily:F, cursor:"pointer",
              boxShadow:"0 4px 20px rgba(2,132,199,0.4)",
            }}>
              Show me what's firing
            </button>
          )}
        </div>
        <div style={{ textAlign:"center", padding:"6px 0 4px" }}>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:12, color:"#bbb", fontFamily:F, cursor:"pointer" }}>
            Skip for now
          </button>
        </div>
      </div>
    </>
  );
}

// ─── weather code → emoji ─────────────────────────────────────────────────────
const WX_CODE_MAP = [[99,"⛈️"],[95,"⛈️"],[86,"❄️"],[85,"🌨️"],[82,"⛈️"],[81,"🌧️"],[80,"🌦️"],[77,"❄️"],[75,"❄️"],[73,"🌨️"],[71,"🌨️"],[67,"🌧️"],[65,"🌧️"],[63,"🌧️"],[61,"🌧️"],[57,"🌦️"],[55,"🌧️"],[53,"🌦️"],[51,"🌦️"],[48,"🌫️"],[45,"🌫️"],[3,"🌥️"],[2,"⛅"],[1,"🌤️"],[0,"☀️"]];
function wxEmoji(code) { for (const [k,v] of WX_CODE_MAP) { if ((code??0) >= k) return v; } return "🌤️"; }

// ─── per-category insider tips ─────────────────────────────────────────────────
const LOCAL_TIPS = {
  skiing:   ["🎿 Book ski rentals online 2+ days ahead — 30% cheaper than on-mountain","⏰ Hit the slopes at 8am — first 2 hours have the freshest groomed corduroy","🌤️ Overcast days = no wind & flat light is actually great for carving","🧴 Reapply SPF every 2h — UV reflects off snow and burns fast at altitude"],
  surfing:  ["🌅 Dawn patrol has the glassiest water and thinnest crowds of the day","🏄 Paddle out via the channel, not through the break — saves 80% of your energy","📱 Check swell reports the night before, not morning — you need lead time","🦈 Avoid surfing at dawn/dusk near river mouths — peak shark feeding windows"],
  tanning:  ["🌅 Arrive at the beach before 10am to claim the best real estate","🧴 Apply SPF 50+ 20 min before sun exposure — it needs time to bind to skin","🌊 Stake out near the shoreline for natural cooling sea breezes","🕐 The 10am–2pm window has the strongest UV — find shade between those hours"],
  diving:   ["🐠 Early morning dives have the clearest visibility before particles stir","🌡️ Bring a wetsuit even in warm water — decompression chills are real","📸 Shoot with the sun behind you and fish in frame — colors pop instantly","🎓 Book a local guide — they know the secret macro critters and wall overhangs"],
  climbing: ["🕐 Arrive at the crag early — popular routes have queues on weekends","🤲 Tape fingers before the first route, not after pain starts","🌡️ Rock temps below 15°C (59°F) give noticeably better friction","☁️ Cloudy days are often better — direct sun makes granite and sandstone slick"],
  kayak:    ["🌊 Always paddle with the tide — tidal flow can run 4+ knots against you","🌬️ Wind builds by noon — plan the return leg for the morning calm window","🦦 Wildlife is most active in the first 2 hours after sunrise","📱 File a float plan with someone onshore before any open-water crossing"],
  mtb:      ["⛽ Check tire pressure the evening before — saves time on the trail","🌧️ Wait 24h after rain — wet trail riding causes deep rut damage","👀 Look 3 bike-lengths ahead, not at the ground right in front of you","🔒 Lock out suspension climbing fire roads, open it up for technical descents"],
  kite:     ["🌬️ Never kite in offshore wind — if you crash you'll drift straight out to sea","📊 18–25 knots is the sweet spot for dynamic, playful sessions","🕐 Sea breeze builds around 11am and dies around 5pm on most coasts","🔪 Your hook knife lives on the harness, not in the bag — not optional"],
  fishing:  ["🌅 Fish feed most aggressively at dawn and in the hour before dusk","🌡️ Water temp 60–70°F (15–21°C) is the sweet spot for most sport species","🪱 Match the hatch — use lures that mimic what fish are already eating today","🤫 Move slow, stay low, and keep shadows off the water — fish spook easily"],
  paraglide:["🌅 Thermal windows open 2–3 hours after sunrise once the ground heats","⛅ Cumulus clouds mark active thermals — fly toward their bases","🌬️ Never launch in gusty conditions — steady laminar flow is everything","📟 Check your reserve handle position on every single pre-flight inspection"],
};

// ─── seasonal intelligence (month 0 = Jan, 11 = Dec) ────────────────────────
// Each category → hemisphere-aware best months + label
const SEASONS = {
  skiing:    { north:[11,0,1,2,3], south:[5,6,7,8,9], label:"ski season" },
  surfing:   { north:[9,10,11,0,1,2], south:[3,4,5,6,7,8], label:"swell season" },
  tanning:   { north:[5,6,7,8], south:[11,0,1,2], label:"beach season" },
  diving:    { north:[4,5,6,7,8,9], south:[10,11,0,1,2,3], label:"dive season" },
  climbing:  { north:[3,4,5,8,9,10], south:[9,10,11,2,3,4], label:"climbing season" },
  hiking:    { north:[4,5,6,7,8,9], south:[10,11,0,1,2,3], label:"hiking season" },
  kayak:     { north:[5,6,7,8], south:[11,0,1,2], label:"paddling season" },
  kite:      { north:[5,6,7,8], south:[11,0,1,2], label:"wind season" },
  mtb:       { north:[4,5,6,7,8,9], south:[10,11,0,1,2,3], label:"riding season" },
  fishing:   { north:[4,5,6,7,8,9], south:[10,11,0,1,2,3], label:"fishing season" },
  paraglide: { north:[5,6,7,8,9], south:[11,0,1,2,3], label:"thermal season" },
};

function getSeasonInfo(venue) {
  const s = SEASONS[venue.category];
  if (!s) return { inSeason:true, label:"" };
  const month = new Date().getMonth();
  const hemi = venue.lat >= 0 ? "north" : "south";
  const months = s[hemi];
  const inSeason = months.includes(month);
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const bestRange = `${MONTH_NAMES[months[0]]}–${MONTH_NAMES[months[months.length-1]]}`;
  return { inSeason, label: s.label, bestRange };
}

const PACKING = {
  skiing:   ["🧥 Base + mid + shell layers","🥽 Goggles (anti-fog)","⛷️ Ski/snowboard boots","🧤 Waterproof gloves","🪖 Helmet","🧴 SPF 50+ (UV reflects off snow)","💊 Altitude meds if needed"],
  surfing:  ["🏄 Surfboard (check bag fees)","🤿 Wetsuit (right thickness)","🧴 Board wax","👟 Reef booties","🌞 SPF 50+ water-resistant","🔌 Earplugs","🧴 After-surf skin care"],
  tanning:  ["🧴 SPF 50+ sunscreen (re-apply!)","🕶️ UV400 sunglasses","👒 Wide-brim sun hat","🏖️ Beach towel","💆 After-sun / aloe vera","👟 Flip flops","💊 Electrolyte tablets"],
  diving:   ["🤿 Mask, fins & snorkel","🧥 Wetsuit (correct temp rating)","🦺 BCD + regulator","⌚ Dive computer","📜 Certification card","💊 Seasickness meds","🩹 First aid kit"],
  climbing: ["🪢 Harness + belay device","👟 Rock shoes","🤲 Chalk bag","🪖 Climbing helmet","🪢 60m dynamic rope","⚡ 12× quickdraws","🩹 Finger tape"],
  kayak:    ["🦺 PFD life jacket","🛶 Paddle leash","🎒 Dry bag (30L+)","🧥 Wetsuit or dry suit","🗺️ Waterproof navigation","🩹 First aid kit","☀️ SPF 50+ lip balm"],
  mtb:      ["🪖 Full-face or trail helmet","🧤 Gloves","🦵 Knee + elbow pads","⛽ Pump + CO₂ cartridge","🔧 Multi-tool","💧 Hydration pack (2L+)","🩹 Wound closure strips"],
  kite:     ["🪁 Kite + bar","🏄 Twin-tip or directional","👊 Spreader bar harness","🧥 Wetsuit","🔗 Safety leash","🔪 Hook knife (mandatory)","☀️ Waterproof SPF 50+"],
  fishing:  ["🎣 Rod, reel + spare line","📦 Tackle box / lures","🧲 Polarized sunglasses","📜 Fishing license","🥾 Neoprene waders","🧤 Landing gloves","🌡️ Insulated cooler"],
  paraglide:["🪂 Wing + speed bar","👊 Paragliding harness","⚡ Reserve parachute","🪖 Open-face helmet","📟 Variometer / GPS","🌡️ Anemometer","💊 Anti-nausea tabs"],
};

// ─── affiliate gear items per category ────────────────────────────────────────
// TODO: Replace AFFILIATE_ID placeholders with your real REI/Backcountry IDs
const GEAR_ITEMS = {
  skiing:   [
    { emoji:"🎿", name:"Skis",                          store:"REI",         price:"$599+",  commission:"5%",  url:"https://www.rei.com/search?q=skis" },
    { emoji:"🥽", name:"Ski Goggles",                   store:"REI",         price:"$129+",  commission:"5%",  url:"https://www.rei.com/search?q=ski+goggles" },
    { emoji:"🧥", name:"Ski Jacket",                    store:"REI",         price:"$299+",  commission:"5%",  url:"https://www.rei.com/search?q=ski+jacket" },
    { emoji:"🧤", name:"Ski Gloves",                    store:"REI",         price:"$49+",   commission:"5%",  url:"https://www.rei.com/search?q=ski+gloves" },
  ],
  surfing:  [
    { emoji:"🏄", name:"Surfboard",                     store:"REI",         price:"$349+",  commission:"5%",  url:"https://www.rei.com/search?q=surfboard" },
    { emoji:"🤿", name:"Wetsuit",                       store:"REI",         price:"$129+",  commission:"5%",  url:"https://www.rei.com/search?q=wetsuit" },
    { emoji:"🧴", name:"Surf Wax",                      store:"Amazon",      price:"$9+",    commission:"4%",  url:"https://www.amazon.com/s?k=surf+wax" },
    { emoji:"🌞", name:"Reef Safe Sunscreen",           store:"Amazon",      price:"$15+",   commission:"4%",  url:"https://www.amazon.com/s?k=reef+safe+sunscreen" },
  ],
  tanning:  [
    { emoji:"🧴", name:"Reef Safe Sunscreen",           store:"Amazon",      price:"$15+",   commission:"4%",  url:"https://www.amazon.com/s?k=reef+safe+sunscreen" },
    { emoji:"🕶️", name:"Polarized Sunglasses",          store:"Amazon",      price:"$49+",   commission:"4%",  url:"https://www.amazon.com/s?k=polarized+sunglasses" },
    { emoji:"🏖️", name:"Beach Towel",                   store:"Amazon",      price:"$19+",   commission:"4%",  url:"https://www.amazon.com/s?k=beach+towel" },
    { emoji:"💊", name:"Hydration Drink Mix",           store:"Amazon",      price:"$25+",   commission:"4%",  url:"https://www.amazon.com/s?k=hydration+drink+mix" },
  ],
  diving:   [
    { emoji:"🤿", name:"Cressi Big Eyes Evo Mask",       store:"Amazon",      price:"$65",   commission:"4%",  url:"https://amzn.to/AFFILIATE_ID" },
    { emoji:"🧥", name:"Scubapro Everflex 5/4 Wetsuit",  store:"Divers Direct",price:"$299", commission:"6%",  url:"https://www.diversdirect.com/scubapro-everflex?ref=AFFILIATE_ID" },
    { emoji:"⌚", name:"Garmin Descent Mk3 Dive Watch",  store:"REI",         price:"$1,099",commission:"5%",  url:"https://www.rei.com/product/garmin-descent?cm_mmc=aff_AL-AFFILIATE_ID" },
    { emoji:"📸", name:"GoPro HERO 13 + Dive Housing",   store:"Amazon",      price:"$399",  commission:"4%",  url:"https://amzn.to/AFFILIATE_ID" },
  ],
  climbing: [
    { emoji:"🪢", name:"Black Diamond Momentum Harness", store:"REI",         price:"$65",   commission:"5%",  url:"https://www.rei.com/product/bd-momentum?cm_mmc=aff_AL-AFFILIATE_ID" },
    { emoji:"👟", name:"La Sportiva Tarantulace Shoes",  store:"REI",         price:"$80",   commission:"5%",  url:"https://www.rei.com/product/la-sportiva-tarantulace?cm_mmc=aff_AL-AFFILIATE_ID" },
    { emoji:"🪖", name:"Black Diamond Half Dome Helmet", store:"REI",         price:"$65",   commission:"5%",  url:"https://www.rei.com/product/bd-half-dome?cm_mmc=aff_AL-AFFILIATE_ID" },
    { emoji:"🤲", name:"Black Diamond Loose Chalk 100g", store:"REI",         price:"$12",   commission:"5%",  url:"https://www.rei.com/product/bd-loose-chalk?cm_mmc=aff_AL-AFFILIATE_ID" },
  ],
  kayak:    [
    { emoji:"🦺", name:"NRS Chinook Fishing PFD",        store:"REI",         price:"$180",  commission:"5%",  url:"https://www.rei.com/product/nrs-chinook?cm_mmc=aff_AL-AFFILIATE_ID" },
    { emoji:"🎒", name:"Ortlieb Dry Bag 22L",            store:"REI",         price:"$45",   commission:"5%",  url:"https://www.rei.com/product/ortlieb-dry-bag?cm_mmc=aff_AL-AFFILIATE_ID" },
    { emoji:"🧥", name:"Kokatat Meridian Dry Suit",      store:"REI",         price:"$1,200",commission:"5%",  url:"https://www.rei.com/product/kokatat-meridian?cm_mmc=aff_AL-AFFILIATE_ID" },
    { emoji:"🗺️", name:"Garmin inReach Mini 2 GPS",      store:"REI",         price:"$350",  commission:"5%",  url:"https://www.rei.com/product/garmin-inreach-mini?cm_mmc=aff_AL-AFFILIATE_ID" },
  ],
  mtb:      [
    { emoji:"🪖", name:"Troy Lee A3 MIPS Helmet",        store:"Backcountry", price:"$220",  commission:"8%",  url:"https://www.backcountry.com/troy-lee-a3?sc=AFFILIATE_ID" },
    { emoji:"🧤", name:"Fox Ranger Gel MTB Gloves",      store:"REI",         price:"$40",   commission:"5%",  url:"https://www.rei.com/product/fox-ranger-gloves?cm_mmc=aff_AL-AFFILIATE_ID" },
    { emoji:"🦵", name:"Fox Launch Pro D3OR Knee Pads",  store:"Backcountry", price:"$130",  commission:"8%",  url:"https://www.backcountry.com/fox-launch-pro?sc=AFFILIATE_ID" },
    { emoji:"💧", name:"CamelBak M.U.L.E. Hydration Pack",store:"REI",        price:"$120",  commission:"5%",  url:"https://www.rei.com/product/camelbak-mule?cm_mmc=aff_AL-AFFILIATE_ID" },
  ],
  kite:     [
    { emoji:"🪁", name:"Cabrinha Moto 12m Kite",         store:"Real Watersports",price:"$1,299",commission:"6%",url:"https://realwatersports.com/cabrinha-moto?ref=AFFILIATE_ID" },
    { emoji:"🧥", name:"Ion Element 4/3 Wetsuit",        store:"Real Watersports",price:"$280",commission:"6%",url:"https://realwatersports.com/ion-element?ref=AFFILIATE_ID" },
    { emoji:"🔪", name:"Dakine Kite Line Cutter",        store:"Amazon",      price:"$22",   commission:"4%",  url:"https://amzn.to/AFFILIATE_ID" },
    { emoji:"🌞", name:"Thinksport SPF 50+ Sunscreen",   store:"Amazon",      price:"$18",   commission:"4%",  url:"https://amzn.to/AFFILIATE_ID" },
  ],
  fishing:  [
    { emoji:"🎣", name:"Ugly Stik GX2 Spinning Combo",   store:"Bass Pro",    price:"$45",   commission:"5%",  url:"https://www.basspro.com/ugly-stik-gx2?source=AFFILIATE_ID" },
    { emoji:"🧲", name:"Costa Del Mar Permit Polarized", store:"Amazon",      price:"$189",  commission:"4%",  url:"https://amzn.to/AFFILIATE_ID" },
    { emoji:"🥾", name:"Simms G3 Guide Wading Boots",    store:"Backcountry", price:"$230",  commission:"8%",  url:"https://www.backcountry.com/simms-g3-guide?sc=AFFILIATE_ID" },
    { emoji:"🌡️", name:"Coleman 54qt Steel-Belted Cooler",store:"REI",        price:"$115",  commission:"5%",  url:"https://www.rei.com/product/coleman-steel-belted?cm_mmc=aff_AL-AFFILIATE_ID" },
  ],
  paraglide:[
    { emoji:"🪖", name:"Sup'Air Pilot Helmet",           store:"Paragliding Earth",price:"$180",commission:"6%",url:"https://paraglidingearth.com/supair-pilot?ref=AFFILIATE_ID" },
    { emoji:"📟", name:"Skytraxx 5 Vario GPS",           store:"Paragliding Earth",price:"$590",commission:"6%",url:"https://paraglidingearth.com/skytraxx-5?ref=AFFILIATE_ID" },
    { emoji:"💊", name:"Bonine Motion Sickness Tabs",    store:"Amazon",      price:"$9",    commission:"4%",  url:"https://amzn.to/AFFILIATE_ID" },
    { emoji:"📸", name:"GoPro HERO 13 Chest Mount Kit",  store:"Amazon",      price:"$449",  commission:"4%",  url:"https://amzn.to/AFFILIATE_ID" },
  ],
};

// ─── guided experiences per category ──────────────────────────────────────────
// Links are generated dynamically based on venue location
const EXPERIENCES = {
  skiing:   [
    { emoji:"🎿", name:"Private ski lesson (beginner)",  price:120, duration:"2 hrs" },
    { emoji:"🏔️", name:"Off-piste powder guide",         price:280, duration:"Full day" },
    { emoji:"🌅", name:"Sunrise first tracks tour",      price:160, duration:"3 hrs" },
  ],
  surfing:  [
    { emoji:"🏄", name:"Beginner surf lesson",           price:65,  duration:"2 hrs" },
    { emoji:"📸", name:"In-water surf photography",      price:120, duration:"2 hrs" },
    { emoji:"🚤", name:"Dawn patrol boat surf charter",  price:200, duration:"4 hrs" },
  ],
  tanning:  [
    { emoji:"🚤", name:"Snorkel & beach hopping boat",   price:75,  duration:"4 hrs" },
    { emoji:"🧘", name:"Beachfront yoga at sunrise",     price:35,  duration:"1 hr" },
    { emoji:"🪂", name:"Parasailing over the water",     price:89,  duration:"30 min" },
  ],
  diving:   [
    { emoji:"🤿", name:"Discover scuba intro dive",      price:110, duration:"Half day" },
    { emoji:"🐠", name:"Night dive with marine biologist",price:145,duration:"2 hrs" },
    { emoji:"🐋", name:"Whale shark snorkel (seasonal)", price:175, duration:"4 hrs" },
  ],
  climbing: [
    { emoji:"🪢", name:"Rock climbing intro lesson",     price:95,  duration:"Half day" },
    { emoji:"🏔️", name:"Multi-pitch guided climb",       price:340, duration:"Full day" },
    { emoji:"🧗", name:"Via ferrata (iron road) tour",   price:110, duration:"4 hrs" },
  ],
  kayak:    [
    { emoji:"🛶", name:"Sea kayak guided day tour",      price:85,  duration:"Full day" },
    { emoji:"🌙", name:"Bioluminescent night kayak",     price:65,  duration:"2 hrs" },
    { emoji:"🦦", name:"Wildlife wildlife kayak tour",   price:90,  duration:"3 hrs" },
  ],
  mtb:      [
    { emoji:"🚵", name:"Guided enduro trail descent",    price:120, duration:"4 hrs" },
    { emoji:"🚐", name:"Uplift shuttle + guided flow",   price:85,  duration:"3 hrs" },
    { emoji:"🔧", name:"Trail skills clinic",            price:75,  duration:"Half day" },
  ],
  kite:     [
    { emoji:"🪁", name:"IKO kitesurf beginner course",   price:220, duration:"3 days" },
    { emoji:"🏄", name:"Foil kiteboard intro lesson",    price:140, duration:"2 hrs" },
    { emoji:"🤿", name:"Downwinder + snorkel combo",     price:95,  duration:"4 hrs" },
  ],
  fishing:  [
    { emoji:"🎣", name:"Full-day offshore charter",      price:220, duration:"Full day" },
    { emoji:"🪄", name:"Fly fishing guided wade trip",   price:180, duration:"Full day" },
    { emoji:"🌅", name:"Sunrise kayak fishing tour",     price:95,  duration:"4 hrs" },
  ],
  paraglide:[
    { emoji:"🪂", name:"Tandem paraglide flight",        price:175, duration:"30 min" },
    { emoji:"🎓", name:"P2 paragliding course (5 days)", price:950, duration:"5 days", url:"https://www.getyourguide.com/activity/p2-course?ref=PEAKLY_AFFILIATE" },
    { emoji:"📸", name:"Aerial photography flight",      price:220, duration:"1 hr",   url:"https://www.getyourguide.com/activity/aerial-photo?ref=PEAKLY_AFFILIATE" },
  ],
};

// ─── venue detail sheet ────────────────────────────────────────────────────────
function VenueDetailSheet({ listing, rawWx, rawMar, wishlists, onToggle, onClose, namedLists, setNamedLists, listings, onAlert, onOpenDetail }) {
  const [showListPicker, setShowListPicker] = useState(false);
  const [newListName,    setNewListName]    = useState("");
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [shareVenueCopied, setShareVenueCopied] = useState(false);
  const saved = wishlists.includes(listing.id);
  const d  = rawWx?.daily;
  const md = rawMar?.daily;

  const forecast = d ? (d.time || []).slice(0, 7).map((date, i) => ({
    date,
    hi:    d.temperature_2m_max?.[i]  ?? "--",
    lo:    d.temperature_2m_min?.[i]  ?? "--",
    precip:d.precipitation_sum?.[i]   ?? 0,
    wind:  d.wind_speed_10m_max?.[i]  ?? 0,
    code:  d.weather_code?.[i]        ?? 0,
    wave:  md?.wave_height_max?.[i]   ?? null,
  })) : [];

  const packing    = PACKING[listing.category]      || PACKING.surfing;
  const localTips  = LOCAL_TIPS[listing.category]   || LOCAL_TIPS.surfing;
  const flightUrl  = buildFlightUrl(listing.flight.from, listing.ap);

  // Similar venues: same category, excluding current, sorted by score
  const similarVenues = listings
    ? [...listings.filter(l => l.category === listing.category && l.id !== listing.id)]
        .sort((a, b) => b.conditionScore - a.conditionScore)
        .slice(0, 5)
    : [];

  const inAnyList = namedLists.some(l => l.venueIds.includes(listing.id));
  const listName  = namedLists.find(l => l.venueIds.includes(listing.id))?.name;

  const addToList = (listId) => {
    setNamedLists(ls => ls.map(l => l.id === listId ? { ...l, venueIds: l.venueIds.includes(listing.id) ? l.venueIds : [...l.venueIds, listing.id] } : l));
    setShowListPicker(false);
  };
  const removeFromList = (listId) => {
    setNamedLists(ls => ls.map(l => l.id === listId ? { ...l, venueIds: l.venueIds.filter(id => id !== listing.id) } : l));
  };
  const createAndAdd = () => {
    if (!newListName.trim()) return;
    setNamedLists(ls => [...ls, { id: Date.now().toString(), name: newListName.trim(), emoji:"🗺️", venueIds:[listing.id] }]);
    setNewListName(""); setShowListPicker(false);
  };
  const copyShareLink = (textOverride) => {
    const text = textOverride || `Check out ${listing.title} on Peakly!\nConditions: ${listing.conditionScore} · Flight from $${listing.flight.price}\n\nFind your next adventure at peakly.app`;
    const finish = () => { setShareVenueCopied(true); setTimeout(() => setShareVenueCopied(false), 2200); };
    try {
      navigator.clipboard?.writeText(text).then(finish).catch(finish);
    } catch (_) { finish(); } // always show feedback even if clipboard blocked in iframe
  };
  const fmtDate = (dateStr, i) => {
    if (i === 0) return "Today";
    if (i === 1) return "Tmrw";
    try { return new Date(dateStr + "T12:00:00Z").toLocaleDateString("en-US", { weekday:"short", day:"numeric" }); }
    catch { return dateStr?.slice(5) || ""; }
  };

  return (
    <>
      <div className="backdrop" onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:300 }} />
      <div className="sheet" style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"min(430px,100vw)", background:"#fff", borderRadius:"28px 28px 0 0",
        zIndex:301, maxHeight:"94vh", display:"flex", flexDirection:"column",
      }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 0", flexShrink:0 }}>
          <div style={{ width:36, height:4, borderRadius:2, background:"#ddd" }} />
        </div>
        <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>
        {/* Hero */}
        <div style={{ position:"relative", height:190, margin:"12px 16px 0", borderRadius:20, overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:listing.gradient, backgroundImage:`url(${getVenuePhoto(listing)})`, backgroundSize:"cover", backgroundPosition:"center" }}>
          </div>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.72) 0%,transparent 55%)" }} />
          <div style={{ position:"absolute", top:12, left:12, right:12, display:"flex", justifyContent:"space-between" }}>
            <button onClick={onClose} style={{ background:"rgba(0,0,0,0.45)", border:"none", borderRadius:"50%", width:44, height:44, fontSize:16, color:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            <div style={{ display:"flex", gap:7 }}>
              <button onClick={() => { setShowSharePanel(v => !v); haptic(); }} className="pressable" style={{ background: showSharePanel ? "#22c55e" : "rgba(0,0,0,0.45)", border:"none", borderRadius:20, padding:"6px 13px", color:"white", fontSize:12, fontWeight:700, fontFamily:F, cursor:"pointer" }}>📤 Share & Invite</button>
              <button onClick={() => { onToggle(listing.id); haptic("medium"); }} className="pressable" style={{ background: saved ? "#0284c7" : "rgba(0,0,0,0.45)", border:"none", borderRadius:20, padding:"6px 13px", color:"white", fontSize:12, fontWeight:700, fontFamily:F, cursor:"pointer" }}>{saved ? "❤️ Saved" : "🤍 Save"}</button>
            </div>
          </div>
          <div style={{ position:"absolute", bottom:14, left:14, right:14 }}>
            <div style={{ fontSize:20, fontWeight:900, color:"white", fontFamily:F, lineHeight:1.15 }}>{listing.title}</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", fontFamily:F, marginTop:3 }}>{listing.location}</div>
            {(() => {
              const si = getSeasonInfo(listing);
              return si.label ? (
                <div style={{ marginTop:6, display:"inline-flex", alignItems:"center", gap:5, background: si.inSeason ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.12)", borderRadius:20, padding:"3px 10px", border: si.inSeason ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.15)" }}>
                  <span style={{ fontSize:10 }}>{si.inSeason ? "🟢" : "📅"}</span>
                  <span style={{ fontSize:10, fontWeight:700, color:"white", fontFamily:F }}>{si.inSeason ? `In ${si.label}` : `Best: ${si.bestRange}`}</span>
                </div>
              ) : null;
            })()}
          </div>
        </div>

        {/* Share & Invite panel — slides in under hero */}
        {showSharePanel && (
          <div className="bounce-in" style={{ margin:"10px 16px 0", background:"linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius:16, padding:"14px 16px" }}>
            <div style={{ fontSize:12, fontWeight:800, color:"white", fontFamily:F, marginBottom:10 }}>📤 Share this trip</div>
            <div style={{ display:"flex", gap:8, marginBottom:10 }}>
              <button onClick={copyShareLink} className="pressable" style={{ flex:1, background: shareVenueCopied ? "#22c55e" : "rgba(255,255,255,0.15)", border:"1.5px solid", borderColor: shareVenueCopied ? "#22c55e" : "rgba(255,255,255,0.2)", borderRadius:12, padding:"10px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <span style={{ fontSize:14 }}>{shareVenueCopied ? "✅" : "🔗"}</span>
                <span style={{ fontSize:11, fontWeight:800, color:"white", fontFamily:F }}>{shareVenueCopied ? "Copied!" : "Copy link"}</span>
              </button>
              <button onClick={() => {
                const card = `${listing.title}\n${listing.location}\nConditions: ${listing.conditionScore} — ${listing.conditionLabel}\nFlights from $${listing.flight.price} (${listing.flight.pct}% off)\n\nFind your next adventure → peakly.app`;
                copyShareLink(card);
              }} className="pressable" style={{ flex:1, background:"rgba(255,255,255,0.15)", border:"1.5px solid rgba(255,255,255,0.2)", borderRadius:12, padding:"10px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <span style={{ fontSize:14 }}>📋</span>
                <span style={{ fontSize:11, fontWeight:800, color:"white", fontFamily:F }}>Copy card</span>
              </button>
            </div>
            <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:12, padding:"10px 12px" }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.55)", fontFamily:F, lineHeight:1.6 }}>
                <strong style={{ color:"white" }}>{listing.title}</strong><br />
                Conditions: {listing.conditionScore} · From ${listing.flight.price}<br />
                <span style={{ color:"rgba(255,255,255,0.45)" }}>Find your next adventure → peakly.app</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ padding:"16px 16px 0" }}>
          {/* Score + flight */}
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            <div style={{ flex:1, background: listing.conditionScore >= 85 ? "#f0f9ff" : listing.conditionScore >= 70 ? "#fff7ed" : "#f7f7f7", borderRadius:14, padding:"12px 14px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#aaa", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>Conditions now</div>
              <div style={{ fontSize:22, fontWeight:900, color: listing.conditionScore >= 85 ? "#ff385c" : listing.conditionScore >= 70 ? "#ea580c" : "#555", fontFamily:F }}>{listing.conditionScore}</div>
              <div style={{ fontSize:11, color:"#888", fontFamily:F, marginTop:2, lineHeight:1.4 }}>{listing.conditionLabel}</div>
            </div>
            <div style={{ flex:1, background:"#f0fff4", borderRadius:14, padding:"12px 14px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#aaa", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>Flight from {listing.flight.from}</div>
              <div style={{ fontSize:22, fontWeight:900, color:"#16a34a", fontFamily:F }}>${listing.flight.price}</div>
              <div style={{ fontSize:11, color:"#888", fontFamily:F, marginTop:2 }}>Was ${listing.flight.normal} · {listing.flight.pct}% off</div>
            </div>
          </div>

          {/* Book flight CTA */}
          <a href={flightUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"block", marginBottom:14 }}>
            <div className="pressable" style={{ background:"linear-gradient(135deg,#1a56db,#0ea5e9)", borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 18px rgba(14,165,233,0.38)" }}>
              <span style={{ fontSize:20 }}>✈️</span>
              <span style={{ fontSize:14, fontWeight:900, color:"white", fontFamily:F }}>Book on Google Flights · ${listing.flight.price}</span>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)" }}>↗</span>
            </div>
          </a>

          {/* 7-day forecast */}
          {forecast.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F, marginBottom:10 }}>7-Day Forecast</div>
              <div style={{ display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4 }}>
                {forecast.map((f, i) => (
                  <div key={i} style={{ flexShrink:0, background:"#f7f7f7", borderRadius:12, padding:"9px 8px", minWidth:62, textAlign:"center", border: i===0 ? "2px solid #0284c7" : "2px solid transparent" }}>
                    <div style={{ fontSize:9, fontWeight:700, color: i===0?"#0284c7":"#aaa", fontFamily:F, marginBottom:3, textTransform:"uppercase" }}>{fmtDate(f.date, i)}</div>
                    <div style={{ fontSize:21 }}>{wxEmoji(f.code)}</div>
                    {f.wave != null && <div style={{ fontSize:9, color:"#0ea5e9", fontWeight:700, fontFamily:F, marginTop:1 }}>{(f.wave*3.28).toFixed(1)}ft</div>}
                    <div style={{ fontSize:12, fontWeight:700, color:"#222", fontFamily:F, marginTop:3 }}>{Math.round(f.hi)}°</div>
                    <div style={{ fontSize:10, color:"#bbb", fontFamily:F }}>{Math.round(f.lo)}°</div>
                    {f.precip > 1 && <div style={{ fontSize:9, color:"#3b82f6", fontWeight:600, fontFamily:F, marginTop:1 }}>💧{Math.round(f.precip)}"</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rating + tags */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:14, alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:4, background:"#f7f7f7", borderRadius:10, padding:"6px 12px" }}>
              <span style={{ fontSize:12 }}>⭐</span>
              <span style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F }}>{listing.rating}</span>
              <span style={{ fontSize:11, color:"#aaa", fontFamily:F }}>({(listing.reviews||0).toLocaleString()})</span>
            </div>
            {(listing.tags || []).map(t => (
              <span key={t} style={{ background:"#f0f0f0", borderRadius:20, padding:"4px 10px", fontSize:11, fontWeight:600, color:"#555", fontFamily:F }}>{t}</span>
            ))}
          </div>

          {/* You'd also like — similar venues */}
          {similarVenues.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:800, color:"#222", fontFamily:F, marginBottom:10 }}>You'd also like</div>
              <div style={{ display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4 }}>
                {similarVenues.map(sv => (
                  <button key={sv.id} className="pressable" onClick={() => { if (onOpenDetail) onOpenDetail(sv); else onClose(); }} style={{ flexShrink:0, width:130, background:"#f7f7f7", borderRadius:14, border:"none", cursor:"pointer", overflow:"hidden", textAlign:"left" }}>
                    <div style={{ height:62, background:sv.gradient, backgroundImage:`url(${getVenuePhoto(sv)})`, backgroundSize:"cover", backgroundPosition:"center", borderRadius:"14px 14px 0 0", position:"relative" }}>
                      <div style={{ position:"absolute", top:5, right:7, background: sv.conditionScore>=85?"#ff385c":sv.conditionScore>=70?"#ea580c":"#666", borderRadius:10, padding:"2px 7px" }}>
                        <span style={{ fontSize:9, fontWeight:800, color:"white", fontFamily:F }}>{sv.conditionScore}</span>
                      </div>
                    </div>
                    <div style={{ padding:"7px 9px 9px" }}>
                      <div style={{ fontSize:11, fontWeight:800, color:"#222", fontFamily:F, lineHeight:1.3, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{sv.title}</div>
                      <div style={{ fontSize:10, color:"#aaa", fontFamily:F, marginTop:2, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>📍 {sv.location}</div>
                      <div style={{ fontSize:10, color:"#16a34a", fontWeight:700, fontFamily:F, marginTop:3 }}>${sv.flight.price} flight</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Local insider tips */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:800, color:"#222", fontFamily:F, marginBottom:10 }}>Insider Tips</div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {localTips.map((tip, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", background:"#f7f7f7", borderRadius:12 }}>
                  <span style={{ fontSize:18, flexShrink:0, lineHeight:1 }}>{tip.split(" ")[0]}</span>
                  <span style={{ fontSize:12, color:"#444", fontFamily:F, lineHeight:1.55 }}>{tip.slice(tip.indexOf(" ")+1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gear — affiliate */}
          {GEAR_ITEMS[listing.category] && (
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ fontSize:12, fontWeight:800, color:"#222", fontFamily:F }}>Gear for this trip</div>
                <span style={{ fontSize:9, color:"#bbb", fontFamily:F }}>Affiliate links · no extra cost</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {GEAR_ITEMS[listing.category].map((item, i) => (
                  <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                    <div className="pressable" style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"#f7f7f7", borderRadius:12, border:"1.5px solid #e8e8e8" }}>
                      <span style={{ fontSize:22, flexShrink:0 }}>{item.emoji}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:"#222", fontFamily:F, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{item.name}</div>
                        <div style={{ fontSize:10, color:"#888", fontFamily:F, marginTop:1 }}>{item.store} · {item.price}</div>
                      </div>
                      <span style={{ fontSize:11, color:"#0284c7", fontWeight:800, fontFamily:F, flexShrink:0 }}>Shop ↗</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 🎟️ Book an experience */}
          {EXPERIENCES[listing.category] && (
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ fontSize:12, fontWeight:800, color:"#222", fontFamily:F }}>🎟️ Book an experience</div>
                <span style={{ fontSize:9, color:"#bbb", fontFamily:F }}>via GetYourGuide</span>
              </div>
              <div style={{ display:"flex", gap:9, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4 }}>
                {EXPERIENCES[listing.category].map((exp, i) => {
                  const expUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(exp.name + ' ' + listing.location)}&partner_id=PEAKLY`;
                  return (
                    <a key={i} href={expUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", flexShrink:0, width:148 }}>
                      <div className="pressable card" style={{ background:"#f7f7f7", borderRadius:14, overflow:"hidden" }}>
                        <div style={{ height:68, background:listing.gradient, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
                          <span style={{ fontSize:32, opacity:0.65 }}>{exp.emoji}</span>
                          <div style={{ position:"absolute", bottom:5, right:7, background:"rgba(0,0,0,0.45)", borderRadius:8, padding:"2px 6px" }}>
                            <span style={{ fontSize:9, color:"white", fontWeight:700, fontFamily:F }}>{exp.duration}</span>
                          </div>
                        </div>
                        <div style={{ padding:"8px 9px 10px" }}>
                          <div style={{ fontSize:11, fontWeight:800, color:"#222", fontFamily:F, lineHeight:1.3 }}>{exp.name}</div>
                          <div style={{ fontSize:11, color:"#16a34a", fontWeight:700, fontFamily:F, marginTop:4 }}>from ${exp.price}</div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* 🏨 Stay nearby — Booking.com affiliate */}
          {/* TODO: Replace aid=2311236 with your real Booking.com affiliate ID */}
          <a href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(listing.location)}&aid=2311236`} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"block", marginBottom:14 }}>
            <div className="pressable" style={{ background:"linear-gradient(135deg,#003580,#0057b8)", borderRadius:14, padding:"13px 15px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 4px 14px rgba(0,53,128,0.28)" }}>
              <span style={{ fontSize:26 }}>🏨</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:900, color:"white", fontFamily:F }}>Find hotels near {listing.title.split(" ").slice(0,3).join(" ")}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.6)", fontFamily:F, marginTop:2 }}>Booking.com · Best price guarantee</div>
              </div>
              <span style={{ fontSize:15, color:"rgba(255,255,255,0.55)" }}>↗</span>
            </div>
          </a>

          {/* 🛡️ Trip insurance — SafetyWing affiliate */}
          <a href="https://safetywing.com/nomad-insurance/?referenceID=peakly&utm_source=peakly&utm_medium=affiliate" target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"block", marginBottom:14 }}>
            <div className="pressable" style={{ background:"#f0fdf4", border:"1.5px solid #bbf7d0", borderRadius:14, padding:"12px 14px", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:26 }}>🛡️</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:800, color:"#166534", fontFamily:F }}>Adventure travel insurance</div>
                <div style={{ fontSize:10, color:"#4ade80", fontFamily:F, marginTop:2 }}>SafetyWing · from $45/month · cancel anytime</div>
              </div>
              <span style={{ fontSize:14, color:"#16a34a" }}>↗</span>
            </div>
          </a>

          {/* ⚡ Peakly Pro upsell */}
          <div style={{ marginBottom:16, background:"linear-gradient(135deg,#0f172a,#1e3a5f)", borderRadius:16, padding:"16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:900, color:"white", fontFamily:F }}>⚡ Peakly Pro</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", fontFamily:F, marginTop:2 }}>Unlock the full experience</div>
              </div>
              <div style={{ background:"#0284c7", borderRadius:10, padding:"4px 11px", flexShrink:0 }}>
                <span style={{ fontSize:11, fontWeight:900, color:"white", fontFamily:F }}>$9/mo</span>
              </div>
            </div>
            {[
              "🔔 Instant condition alerts — beat the crowds",
              "📊 Full 90-day historical condition graphs",
              "📅 Crowd calendar — know before you go",
              "✈️ Price drop alerts for your saved venues",
            ].map((feat, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.82)", fontFamily:F, lineHeight:1.5 }}>{feat}</span>
              </div>
            ))}
            <button className="pressable" onClick={() => alert("Peakly Pro coming soon! 🚀")} style={{ width:"100%", marginTop:8, background:"#0284c7", border:"none", borderRadius:12, padding:"13px", cursor:"pointer", fontSize:13, fontWeight:900, color:"white", fontFamily:F, boxShadow:"0 4px 14px rgba(2,132,199,0.45)" }}>
              Start free 7-day trial
            </button>
          </div>

          {/* Save to named list */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F, marginBottom:10 }}>Save to list</div>
            {!showListPicker ? (
              <button onClick={() => setShowListPicker(true)} className="pressable" style={{
                width:"100%", background:"#f7f7f7", border:"2px dashed #d0d0d0", borderRadius:14,
                padding:"13px", cursor:"pointer", color:"#555", fontSize:13, fontWeight:700, fontFamily:F,
                display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              }}>
                {inAnyList ? `✅ In "${listName}" · Manage lists` : "＋ Add to a list"}
              </button>
            ) : (
              <div className="bounce-in">
                {namedLists.length > 0 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
                    {namedLists.map(l => {
                      const inThis = l.venueIds.includes(listing.id);
                      return (
                        <button key={l.id} onClick={() => inThis ? removeFromList(l.id) : addToList(l.id)} style={{
                          width:"100%", background: inThis ? "#e8fdf0" : "#f7f7f7",
                          border:"1.5px solid", borderColor: inThis ? "#22c55e" : "#e8e8e8",
                          borderRadius:12, padding:"11px 14px", cursor:"pointer",
                          display:"flex", alignItems:"center", gap:8, fontFamily:F,
                        }}>
                          <span style={{ fontSize:18 }}>{l.emoji}</span>
                          <span style={{ flex:1, textAlign:"left", fontSize:13, fontWeight:700, color:"#222" }}>{l.name}</span>
                          <span style={{ fontSize:11, color:"#aaa" }}>{l.venueIds.length} spots</span>
                          {inThis && <span style={{ color:"#22c55e", fontWeight:900, fontSize:14 }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div style={{ display:"flex", gap:8 }}>
                  <input type="text" placeholder='"Japan Winter 🎿" or "Caribbean Summer 🏖️"'
                    value={newListName} onChange={e => setNewListName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && createAndAdd()}
                    style={{ flex:1, padding:"10px 12px", borderRadius:12, border:"1.5px solid #e8e8e8", fontSize:13, fontFamily:F, color:"#222", background:"#fafafa" }}
                  />
                  <button onClick={createAndAdd} style={{ background:"#0284c7", border:"none", borderRadius:12, padding:"10px 14px", color:"white", fontSize:13, fontWeight:800, fontFamily:F, cursor:"pointer" }}>Create</button>
                </div>
                <button onClick={() => setShowListPicker(false)} style={{ marginTop:7, background:"none", border:"none", fontSize:12, color:"#bbb", cursor:"pointer", fontFamily:F }}>Cancel</button>
              </div>
            )}
          </div>
        </div>
        </div>{/* end scroll wrapper */}
        {/* Sticky bottom CTA */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0,
          padding:"12px 16px", paddingBottom:"max(env(safe-area-inset-bottom,12px),12px)",
          background:"linear-gradient(to top, #fff 80%, transparent)",
          display:"flex", gap:10,
        }}>
          <a href={buildFlightUrl(listing.flight?.from || profile?.homeAirport || "JFK", listing.ap)}
            target="_blank" rel="noopener noreferrer"
            onClick={() => haptic("heavy")}
            style={{ flex:1, textDecoration:"none" }}>
            <div className="pressable" style={{
              background:"linear-gradient(135deg,#1a56db,#0ea5e9)", borderRadius:14,
              padding:"14px 16px", textAlign:"center",
              boxShadow:"0 4px 14px rgba(2,132,199,0.35)",
            }}>
              <span style={{ fontSize:14, fontWeight:800, color:"white", fontFamily:F }}>Flights from ${listing.flight?.price || "—"}</span>
            </div>
          </a>
          <button onClick={() => { onToggle(listing.id); haptic("medium"); }}
            className="pressable" style={{
              background: saved ? "#0284c7" : "#f5f5f5",
              border:"none", borderRadius:14, padding:"14px 16px", cursor:"pointer",
              minWidth:52, display:"flex", alignItems:"center", justifyContent:"center",
            }}>
            <span style={{ fontSize:18 }}>{saved ? "❤️" : "🤍"}</span>
          </button>
        </div>
      </div>
    </>
  );
}

// ─── trip builder sheet ───────────────────────────────────────────────────────
function TripBuilderSheet({ listings, duffelPrices, onClose, onSaveTrip, profile }) {
  const [step, setStep] = useState(0);
  const [sport, setSport] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState(5000);
  const [days, setDays] = useState(5);
  const [departureAirport, setDepartureAirport] = useState(profile.homeAirport || "JFK");
  const [generating, setGenerating] = useState(false);
  const [trip, setTrip] = useState(null);

  const steps = [
    { label: "Adventure?", field: "sport" },
    { label: "When?", field: "dates" },
    { label: "Budget?", field: "budget" },
    { label: "Days?", field: "days" },
    { label: "From where?", field: "airport" }
  ];

  const buildTrip = async () => {
    if (!sport || !startDate || !endDate || !budget || !days || !departureAirport) return;
    setGenerating(true);

    // Mock trip generation
    const sportVenues = listings.filter(l => l.category === sport);
    const bestVenue = sportVenues.reduce((a, b) => (b.conditionScore || 0) - (a.conditionScore || 0))[0] || sportVenues[0];

    if (!bestVenue) {
      setGenerating(false);
      return;
    }

    const flightPrice = duffelPrices[`${departureAirport}-${bestVenue.ap}`] || Math.floor(Math.random() * 800) + 200;
    const hotelNightly = { skiing: 180, surfing: 150, tanning: 140 }[sport] || 150;
    const totalHotel = hotelNightly * days;
    const activitiesPerDay = 2;
    const activitiesCost = days * activitiesPerDay * 75;
    const totalCost = flightPrice + totalHotel + activitiesCost;

    const generatedTrip = {
      id: Date.now().toString(),
      destination: bestVenue.title,
      venue: bestVenue,
      startDate,
      endDate,
      days,
      sport,
      flight: { from: departureAirport, to: bestVenue.ap, price: flightPrice },
      hotel: { name: { skiing: "Mountain Lodge", surfing: "Beachfront Resort", tanning: "Tropical Paradise" }[sport] || "Resort", nightly: hotelNightly, total: totalHotel },
      itinerary: Array.from({length: days}, (_, i) => ({
        day: i+1,
        activity: [
          "Lesson & practice",
          "Explore local spots",
          "Free time / relax",
          "Advanced session",
          "Scenic adventure"
        ][i % 5],
        meals: "Breakfast & lunch included"
      })),
      totalCost,
      budget
    };

    // Simulate loading
    await new Promise(r => setTimeout(r, 1200));
    setTrip(generatedTrip);
    setGenerating(false);
  };

  if (generating) {
    return (
      <div style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <div style={{
          background:"white", borderRadius:20, padding:40, textAlign:"center", maxWidth:300,
        }}>
          <div className="vibe-spin" style={{ fontSize:32, marginBottom:20, display:"inline-block" }}>↻</div>
          <div style={{ fontSize:14, fontWeight:700, color:"#222", fontFamily:F, marginBottom:8 }}>Building your trip</div>
          <div style={{ fontSize:12, color:"#aaa", fontFamily:F }}>Finding the perfect match...</div>
        </div>
      </div>
    );
  }

  if (trip) {
    return (
      <div style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end",
      }} onClick={onClose}>
        <div className="sheet" onClick={e => e.stopPropagation()} style={{
          background:"white", borderRadius:"24px 24px 0 0", width:"100%", maxHeight:"90vh", overflowY:"auto",
          padding:"28px 24px 40px",
        }}>
          <button onClick={onClose} style={{
            position:"absolute", top:16, right:16, background:"none", border:"none", fontSize:24, cursor:"pointer", color:"#bbb",
          }}>×</button>

          {/* Trip header */}
          <div style={{
            background: trip.venue?.gradient || "linear-gradient(135deg,#0284c7,#38bdf8)",
            backgroundImage: trip.venue ? `url(${getVenuePhoto(trip.venue)})` : "none",
            backgroundSize:"cover", backgroundPosition:"center", borderRadius:16, height:180, marginBottom:20,
            position:"relative",
          }}>
            <div style={{
              position:"absolute", inset:0, background:"rgba(0,0,0,0.2)", borderRadius:16,
              display:"flex", alignItems:"flex-end", padding:16,
            }}>
              <div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)", fontFamily:F }}>Discover</div>
                <div style={{ fontSize:22, fontWeight:900, color:"white", fontFamily:F, marginTop:4 }}>{trip.destination}</div>
              </div>
            </div>
          </div>

          {/* Trip details */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              <div style={{ background:"#f7f7f7", borderRadius:12, padding:14 }}>
                <div style={{ fontSize:10, color:"#aaa", fontFamily:F, fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Flight</div>
                <div style={{ fontSize:13, fontWeight:700, color:"#222", fontFamily:F }}>
                  {trip.flight.from} → {trip.flight.to}
                </div>
                <div style={{ fontSize:14, fontWeight:800, color:"#0284c7", fontFamily:F, marginTop:4 }}>
                  ${trip.flight.price}
                </div>
              </div>
              <div style={{ background:"#f7f7f7", borderRadius:12, padding:14 }}>
                <div style={{ fontSize:10, color:"#aaa", fontFamily:F, fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Hotel</div>
                <div style={{ fontSize:13, fontWeight:700, color:"#222", fontFamily:F }}>
                  {trip.hotel.name}
                </div>
                <div style={{ fontSize:11, color:"#717171", fontFamily:F, marginTop:4 }}>
                  ${trip.hotel.nightly}/night · {trip.days} nights
                </div>
              </div>
            </div>

            {/* Itinerary */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F, marginBottom:10 }}>Itinerary</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {trip.itinerary.map((day, i) => (
                  <div key={i} style={{ background:"#f9f9f9", borderLeft:"3px solid #0284c7", padding:12, borderRadius:8 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#222", fontFamily:F }}>Day {day.day}</div>
                    <div style={{ fontSize:12, color:"#717171", fontFamily:F, marginTop:2 }}>{day.activity}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost breakdown */}
            <div style={{ background:"#f7f7f7", borderRadius:12, padding:14, marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F, marginBottom:10 }}>Cost breakdown</div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:12, fontFamily:F }}>
                <span style={{ color:"#717171" }}>Flight</span>
                <span style={{ color:"#222", fontWeight:700 }}>${trip.flight.price}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:12, fontFamily:F }}>
                <span style={{ color:"#717171" }}>Hotel ({trip.days}n)</span>
                <span style={{ color:"#222", fontWeight:700 }}>${trip.hotel.total}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12, fontSize:12, fontFamily:F }}>
                <span style={{ color:"#717171" }}>Activities</span>
                <span style={{ color:"#222", fontWeight:700 }}>${trip.totalCost - trip.flight.price - trip.hotel.total}</span>
              </div>
              <div style={{ borderTop:"1px solid #e8e8e8", paddingTop:12, display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:800, fontFamily:F }}>
                <span>Total</span>
                <span style={{ color:"#0284c7" }}>${trip.totalCost}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => onSaveTrip(trip)} style={{
              flex:1, background:"#0284c7", border:"none", borderRadius:12, padding:14,
              color:"white", fontSize:14, fontWeight:800, fontFamily:F, cursor:"pointer",
            }}>
              Save Trip
            </button>
            <button onClick={() => setTrip(null)} style={{
              flex:1, background:"#f7f7f7", border:"none", borderRadius:12, padding:14,
              color:"#222", fontSize:14, fontWeight:800, fontFamily:F, cursor:"pointer",
            }}>
              Build Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end",
    }} onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()} style={{
        background:"white", borderRadius:"24px 24px 0 0", width:"100%", maxHeight:"90vh", overflowY:"auto",
        padding:"28px 24px 40px",
      }}>
        <button onClick={onClose} style={{
          position:"absolute", top:16, right:16, background:"none", border:"none", fontSize:24, cursor:"pointer", color:"#bbb",
        }}>×</button>

        <div style={{ fontSize:22, fontWeight:900, color:"#222", fontFamily:F, marginBottom:6 }}>Build a Trip with AI</div>
        <div style={{ fontSize:13, color:"#717171", fontFamily:F, marginBottom:28 }}>
          Step {step + 1} of {steps.length}
        </div>

        {/* Step 0: Sport */}
        {step === 0 && (
          <div className="fade-in">
            <div style={{ fontSize:14, fontWeight:700, color:"#222", fontFamily:F, marginBottom:12 }}>What kind of adventure?</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { id:"skiing", label:"Skiing" },
                { id:"surfing", label:"Surfing" },
                { id:"tanning", label:"Beach & Tan" }
              ].map(s => (
                <button key={s.id} onClick={() => {setSport(s.id); setStep(1);}} style={{
                  padding:14, borderRadius:12, border:"1.5px solid #e8e8e8", cursor:"pointer", fontFamily:F,
                  background:"#fff", color:"#222", fontSize:13, fontWeight:700, textAlign:"left",
                }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Dates */}
        {step === 1 && (
          <div className="fade-in">
            <div style={{ fontSize:14, fontWeight:700, color:"#222", fontFamily:F, marginBottom:12 }}>When are you going?</div>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{
              width:"100%", padding:12, borderRadius:12, border:"1.5px solid #e8e8e8", fontSize:13, fontFamily:F, marginBottom:10,
            }} />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{
              width:"100%", padding:12, borderRadius:12, border:"1.5px solid #e8e8e8", fontSize:13, fontFamily:F, marginBottom:14,
            }} />
            <button onClick={() => setStep(2)} disabled={!startDate || !endDate} style={{
              width:"100%", background: startDate && endDate ? "#222" : "#ddd", border:"none", borderRadius:12, padding:12,
              color:"white", fontSize:13, fontWeight:700, fontFamily:F, cursor:"pointer",
            }}>
              Next
            </button>
          </div>
        )}

        {/* Step 2: Budget */}
        {step === 2 && (
          <div className="fade-in">
            <div style={{ fontSize:14, fontWeight:700, color:"#222", fontFamily:F, marginBottom:12 }}>Budget per person?</div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:13, color:"#717171", fontFamily:F }}>$500</span>
              <span style={{ fontSize:15, fontWeight:800, color:"#0284c7", fontFamily:F }}>${budget}</span>
              <span style={{ fontSize:13, color:"#717171", fontFamily:F }}>$10,000</span>
            </div>
            <input type="range" min={500} max={10000} step={100} value={budget} onChange={e => setBudget(+e.target.value)} style={{
              width:"100%", marginBottom:20, accentColor:"#0284c7", background:"#e8e8e8",
            }} />
            <button onClick={() => setStep(3)} style={{
              width:"100%", background:"#222", border:"none", borderRadius:12, padding:12,
              color:"white", fontSize:13, fontWeight:700, fontFamily:F, cursor:"pointer",
            }}>
              Next
            </button>
          </div>
        )}

        {/* Step 3: Days */}
        {step === 3 && (
          <div className="fade-in">
            <div style={{ fontSize:14, fontWeight:700, color:"#222", fontFamily:F, marginBottom:12 }}>How many days?</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
              {[3, 5, 7, 10, 14].map(d => (
                <button key={d} onClick={() => setDays(d)} style={{
                  flex:"1 1 calc(50% - 4px)", padding:12, borderRadius:10, border:"1.5px solid", cursor:"pointer", fontFamily:F,
                  background: days === d ? "#222" : "#f7f7f7",
                  color: days === d ? "#fff" : "#222",
                  borderColor: days === d ? "#222" : "#e8e8e8",
                  fontSize:13, fontWeight:700,
                }}>
                  {d} days
                </button>
              ))}
            </div>
            <button onClick={() => setStep(4)} style={{
              width:"100%", background:"#222", border:"none", borderRadius:12, padding:12,
              color:"white", fontSize:13, fontWeight:700, fontFamily:F, cursor:"pointer",
            }}>
              Next
            </button>
          </div>
        )}

        {/* Step 4: Airport */}
        {step === 4 && (
          <div className="fade-in">
            <div style={{ fontSize:14, fontWeight:700, color:"#222", fontFamily:F, marginBottom:12 }}>Departure airport?</div>
            <input type="text" placeholder="E.g. JFK, LAX, LHR" value={departureAirport} onChange={e => setDepartureAirport(e.target.value.toUpperCase())} style={{
              width:"100%", padding:12, borderRadius:12, border:"1.5px solid #e8e8e8", fontSize:13, fontFamily:F, marginBottom:14,
            }} />
            <button onClick={buildTrip} disabled={!departureAirport} style={{
              width:"100%", background: departureAirport ? "#0284c7" : "#ddd", border:"none", borderRadius:12, padding:12,
              color:"white", fontSize:13, fontWeight:700, fontFamily:F, cursor:"pointer",
            }}>
              Build My Trip
            </button>
          </div>
        )}

        {/* Step indicators */}
        <div style={{ display:"flex", gap:4, marginTop:24, justifyContent:"center" }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              width:6, height:6, borderRadius:"50%", background: i <= step ? "#0284c7" : "#e8e8e8",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── trips tab ────────────────────────────────────────────────────────────────
function TripsTab({ listings, wishlists, onToggle, namedLists, setNamedLists, onOpenDetail, duffelPrices, profile, savedTrips, setSavedTrips }) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [showVibeSearch, setShowVibeSearch] = useState(false);

  const onSaveTrip = (trip) => {
    setSavedTrips(t => [...t, trip]);
    setShowBuilder(false);
  };

  return (
    <>
      <div style={{ flex:1, overflowY:"auto" }}>
        {/* Trip builder card */}
        <div style={{ padding:"24px 24px 0" }}>
          <button onClick={() => setShowBuilder(true)} className="card" style={{
            width:"100%", background:"linear-gradient(135deg,#0284c7,#0ea5e9)", borderRadius:16, padding:20,
            border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:14, color:"white",
          }}>
            <div style={{ flex:1, textAlign:"left" }}>
              <div style={{ fontSize:15, fontWeight:800, fontFamily:F }}>Build a Trip with AI</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)", fontFamily:F, marginTop:2 }}>
                Get a personalized itinerary
              </div>
            </div>
            <span style={{ fontSize:18 }}>→</span>
          </button>
        </div>

        {/* Vibe Search card */}
        <div style={{ padding:"16px 24px 0" }}>
          <button onClick={() => setShowVibeSearch(true)} className="card" style={{
            width:"100%", background:"linear-gradient(135deg,#1a1a2e,#302b63)", borderRadius:16, padding:20,
            border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:14, color:"white",
          }}>
            <div style={{ flex:1, textAlign:"left" }}>
              <div style={{ fontSize:15, fontWeight:800, fontFamily:F }}>Find your vibe</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)", fontFamily:F, marginTop:2 }}>
                AI-powered adventure search
              </div>
            </div>
            <span style={{ fontSize:18 }}>✨</span>
          </button>
        </div>

        {/* Saved trips section */}
        {savedTrips.length > 0 && (
          <div style={{ padding:"20px 24px 0" }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#aaa", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>
              Saved trips
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
              {savedTrips.map(trip => (
                <div key={trip.id} className="card" style={{
                  background:"#fff", border:"1.5px solid #e8e8e8", borderRadius:16, overflow:"hidden",
                  boxShadow:"0 1px 6px rgba(0,0,0,0.05)",
                }}>
                  <div style={{
                    height:120, background:trip.venue?.gradient || "linear-gradient(135deg,#0284c7,#38bdf8)",
                    backgroundImage: trip.venue ? `url(${getVenuePhoto(trip.venue)})` : "none",
                    backgroundSize:"cover", backgroundPosition:"center",
                  }} />
                  <div style={{ padding:14 }}>
                    <div style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F }}>{trip.destination}</div>
                    <div style={{ fontSize:11, color:"#717171", fontFamily:F, marginTop:4 }}>
                      {trip.days} days · ${trip.totalCost} total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wishlists section */}
        <WishlistsTab listings={listings} wishlists={wishlists} onToggle={onToggle} namedLists={namedLists} setNamedLists={setNamedLists} onOpenDetail={onOpenDetail} />
      </div>

      {showBuilder && (
        <TripBuilderSheet
          listings={listings}
          duffelPrices={duffelPrices}
          profile={profile}
          onClose={() => setShowBuilder(false)}
          onSaveTrip={onSaveTrip}
        />
      )}

      {showVibeSearch && (
        <VibeSearchSheet
          listings={listings}
          wishlists={wishlists}
          onToggle={onToggle}
          onOpenDetail={onOpenDetail}
          onClose={() => setShowVibeSearch(false)}
        />
      )}
    </>
  );
}

// ─── guides tab ──────────────────────────────────────────────────────────────
function GuidesTab({ listings, onOpenDetail, wishlists, onToggle }) {
  const guideCategories = [
    { id: "skiing",   title: "Ski & Snow Guides",   emoji: "\u26F7\uFE0F" },
    { id: "surfing",  title: "Surf Guides",          emoji: "\uD83C\uDFC4" },
    { id: "hiking",   title: "Hiking Guides",         emoji: "\uD83E\uDD7E" },
    { id: "diving",   title: "Diving Guides",         emoji: "\uD83E\uDD3F" },
    { id: "climbing", title: "Climbing Guides",        emoji: "\uD83E\uDDD7" },
  ];

  const featured = [...listings].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);

  const blurbs = {
    skiing: "Snow conditions, resort breakdowns & budget tips",
    surfing: "Swell forecasts, board recs & local secrets",
    tanning: "UV index intel, hidden beaches & sun safety",
    hiking: "Trail conditions, gear lists & elevation guides",
    diving: "Visibility reports, marine life & cert advice",
    climbing: "Route betas, crag access & seasonal windows",
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      {/* Hero section */}
      <div style={{
        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)",
        padding: "32px 24px 28px", marginBottom: 8,
      }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: F, letterSpacing: "-0.5px", marginBottom: 6 }}>
          Travel Guides
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontFamily: F, lineHeight: 1.5, maxWidth: 320 }}>
          Original destination guides, insider tips & seasonal travel advice
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", fontFamily: F }}>
            {listings.length}+ destinations
          </span>
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.3)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", fontFamily: F }}>
            {guideCategories.length} categories
          </span>
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.3)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", fontFamily: F }}>
            45 countries
          </span>
        </div>
      </div>

      {/* Featured Guides carousel */}
      <div style={{ padding: "16px 0 8px" }}>
        <div style={{ padding: "0 24px 10px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#222", fontFamily: F }}>Featured Guides</div>
            <div style={{ fontSize: 12, color: "#717171", marginTop: 2, fontFamily: F }}>Editor's picks for this season</div>
          </div>
        </div>
        <div style={{
          display: "flex", gap: 12, overflowX: "auto", scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch", padding: "0 24px", scrollSnapType: "x mandatory",
        }}>
          {featured.map((venue) => (
            <div
              key={venue.id}
              className="card"
              onClick={() => onOpenDetail(venue)}
              style={{
                minWidth: 220, maxWidth: 220, scrollSnapAlign: "start",
                background: "#fff", borderRadius: 16, overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{
                height: 130, background: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)",
                display: "flex", alignItems: "flex-end", padding: 14, position: "relative",
              }}>
                <div style={{
                  position: "absolute", top: 10, right: 10,
                  background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
                  borderRadius: 8, padding: "4px 8px",
                  fontSize: 10, fontWeight: 700, color: "#fff", fontFamily: F,
                }}>
                  Guide
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: F }}>{venue.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontFamily: F, marginTop: 2 }}>
                    {venue.location || venue.country}
                  </div>
                </div>
              </div>
              <div style={{ padding: "12px 14px 14px" }}>
                <div style={{ fontSize: 11, color: "#717171", fontFamily: F, lineHeight: 1.4, marginBottom: 10 }}>
                  {blurbs[venue.category] || "Insider tips, conditions & travel advice"}
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: "#0284c7", fontFamily: F,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  Read Guide
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category guide sections */}
      {guideCategories.map((cat) => {
        const venues = listings.filter(l => l.category === cat.id);
        if (venues.length === 0) return null;
        return (
          <div key={cat.id} style={{ padding: "20px 0 4px" }}>
            <div style={{ padding: "0 24px 12px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#222", fontFamily: F }}>
                {cat.title}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#717171", fontFamily: F }}>{venues.length} guides</span>
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 24px",
            }}>
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  className="card"
                  onClick={() => onOpenDetail(venue)}
                  style={{
                    background: "#fff", borderRadius: 14, padding: "14px 14px 12px",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.05)", cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#222", fontFamily: F, marginBottom: 3 }}>
                    {venue.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#717171", fontFamily: F, marginBottom: 10 }}>
                    {venue.location || venue.country}
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: "#0284c7", fontFamily: F,
                    display: "flex", alignItems: "center", gap: 3,
                  }}>
                    Read Guide
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div style={{ height: 32 }} />
    </div>
  );
}

// ─── bottom nav ───────────────────────────────────────────────────────────────
function BottomNav({ active, setActive, alertCount }) {
  const tabs = [
    { id:"explore",   label:"Explore",  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg> },
    { id:"trips",     label:"Trips",    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> },
    { id:"alerts",    label:"Alerts",   icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
    { id:"profile",   label:"Profile",  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];
  return (
    <div style={{
      display:"flex", justifyContent:"space-around",
      padding:"4px 0 max(env(safe-area-inset-bottom, 0px), 12px)", background:"#fff",
      borderTop:"1px solid #e8e8e8", flexShrink:0,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => { setActive(t.id); haptic(); }} className="tab-btn" style={{
          background:"none", border:"none",
          display:"flex", flexDirection:"column", alignItems:"center", gap:2,
          color: active === t.id ? "#0284c7" : "#b0b0b0", position:"relative",
          padding:"8px 12px", minWidth:56, minHeight:48,
        }}>
          {t.id === "alerts" && alertCount > 0 && (
            <div style={{
              position:"absolute", top:2, right:4,
              width:8, height:8, background:"#0284c7", borderRadius:"50%",
              border:"1.5px solid white",
            }} />
          )}
          <span style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>{t.icon}</span>
          <span style={{ fontSize:10, fontWeight:600, fontFamily:F }}>{t.label}</span>
          {active === t.id && (
            <div style={{ width:4, height:4, background:"#0284c7", borderRadius:"50%", marginTop:0 }} />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── error boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) {
    if (window.__peaklyReport) window.__peaklyReport(error, { type: "react_crash", component: info.componentStack?.split("\n")[1]?.trim() });
  }
  render() {
    if (this.state.hasError) {
      return React.createElement("div", {
        style: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                 height:"100vh", fontFamily:F, padding:32, textAlign:"center", background:"#f5f5f5" }
      },
        React.createElement("div", { style:{ fontSize:28, fontWeight:900, color:"#222", marginBottom:12 } }, "Something went wrong"),
        React.createElement("div", { style:{ fontSize:14, color:"#717171", marginBottom:24, maxWidth:320 } },
          "Peakly hit an unexpected error. This has been logged automatically."),
        React.createElement("button", {
          onClick: () => { this.setState({ hasError:false, error:null }); window.location.reload(); },
          style: { background:"#0284c7", color:"white", border:"none", borderRadius:14,
                   padding:"14px 28px", fontSize:14, fontWeight:800, fontFamily:F, cursor:"pointer" }
        }, "Reload App")
      );
    }
    return this.props.children;
  }
}

// ─── app ──────────────────────────────────────────────────────────────────────
function App() {
  const [activeTab,    setActiveTab]    = useState("explore");
  const [activeCat,    setActiveCat]    = useState("all");
  const [wxData,       setWxData]       = useState({});
  const [marData,      setMarData]      = useState({});
  const [loading,      setLoading]      = useState(true);
  const [duffelPrices, setDuffelPrices] = useState({});
  const [filters,      setFilters]      = useState({ sort:"score", maxPrice:2000, startDate:"", endDate:"" });
  const [showSearch,     setShowSearch]     = useState(false);
  const [showVibeSearch, setShowVibeSearch] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { const p = JSON.parse(localStorage.getItem("peakly_profile")); return !p || !p.hasAccount; }
    catch { return true; }
  });
  const [detailVenue,    setDetailVenue]    = useState(null);
  const [wxLastUpdated,  setWxLastUpdated]  = useState(null);

  const [wishlists,    setWishlists]    = useLocalStorage("peakly_wishlists", []);
  const [namedLists,   setNamedLists]   = useLocalStorage("peakly_named_lists", []);
  const [userAlerts, setUserAlerts] = useLocalStorage("peakly_alerts", []);
  const [savedTrips, setSavedTrips] = useLocalStorage("peakly_trips", []);
  const [profile,    setProfile]    = useLocalStorage("peakly_profile", {
    name:"", email:"", homeAirport:"JFK", homeAirports:["JFK"], sports:[], skillLevels:{},
    skill:"Intermediate", hasAccount:false,
    notifyPeak:true, notifyDeal:true, notifyWeekly:false,
  });

  // Init search with user's saved home airport (reads localStorage directly before profile state is set)
  const [search, setSearch] = useState(() => ({
    activities: [], destination: "", when: "anytime", continent: "",
    fromAirport: (() => {
      try {
        const p = JSON.parse(localStorage.getItem("peakly_profile") || "{}");
        const airports = p.homeAirports || [p.homeAirport] || ["JFK"];
        return airports[0] || "JFK";
      } catch { return "JFK"; }
    })(),
  }));

  // Fetch live weather in batches of 15 to avoid hammering the API
  useEffect(() => {
    let alive = true;
    (async () => {
      const wx = {}, mar = {};
      const BATCH = 15;
      for (let i = 0; i < VENUES.length; i += BATCH) {
        const batch = VENUES.slice(i, i + BATCH);
        const results = await Promise.allSettled(
          batch.map(async v => {
            const needsMarine = ["surfing","diving","kayak"].includes(v.category);
            const [wxr, marr] = await Promise.allSettled([
              fetchWeather(v.lat, v.lon),
              needsMarine ? fetchMarine(v.lat, v.lon) : Promise.resolve(null),
            ]);
            return {
              id:     v.id,
              wx:     wxr.status  === "fulfilled" ? wxr.value  : null,
              marine: marr.status === "fulfilled" ? marr.value : null,
            };
          })
        );
        if (!alive) return;
        results.forEach(r => {
          if (r.status === "fulfilled") {
            wx[r.value.id]  = r.value.wx;
            mar[r.value.id] = r.value.marine;
          }
        });
        // Update after first batch so UI loads fast
        if (i === 0) {
          setWxData({...wx});
          setMarData({...mar});
          setLoading(false);
        }
      }
      setWxData({...wx});
      setMarData({...mar});
      setWxLastUpdated(new Date());
    })();
    return () => { alive = false; };
  }, []);

  // Fetch real Travelpayouts prices after weather loads (re-fetches when home airport changes)
  // Optimized: deduplicate airport codes → only ~15 API calls instead of 250+
  useEffect(() => {
    if (loading) return;
    let alive = true;
    (async () => {
      // 1. Build a map of unique airport codes → venue IDs that use them
      const apToVenues = {};
      VENUES.forEach(v => {
        if (!apToVenues[v.ap]) apToVenues[v.ap] = [];
        apToVenues[v.ap].push(v.id);
      });
      const uniqueAirports = Object.keys(apToVenues);

      // 2. Fetch prices only for unique airports, batched in groups of 5
      const apPrices = {}; // airport code → cheapest price
      const origin = profile.homeAirport || "JFK";
      for (let i = 0; i < uniqueAirports.length; i += 5) {
        const batch = uniqueAirports.slice(i, i + 5);
        const results = await Promise.allSettled(
          batch.map(async ap => {
            const price = await fetchTravelpayoutsPrice(origin, ap);
            return { ap, price };
          })
        );
        if (!alive) return;
        results.forEach(r => {
          if (r.status === "fulfilled" && r.value.price !== null) {
            apPrices[r.value.ap] = r.value.price;
          }
        });
        if (i + 5 < uniqueAirports.length) await new Promise(r => setTimeout(r, 300));
      }

      // 3. Map airport prices back to venue IDs
      const prices = {};
      Object.entries(apPrices).forEach(([ap, price]) => {
        apToVenues[ap].forEach(venueId => {
          prices[venueId] = price;
        });
      });

      if (alive && Object.keys(prices).length > 0) setDuffelPrices(prices);
    })();
    return () => { alive = false; };
  }, [loading, profile.homeAirport]);

  // Enrich venues with live scores + flight prices (real Duffel when available, estimate fallback)
  const listings = VENUES.map(v => {
    const { score, label, period } = scoreVenue(v, wxData[v.id], marData[v.id]);
    const estimate   = getFlightDeal(v.ap, profile.homeAirport);
    const realPrice  = duffelPrices[v.id];
    const flight     = realPrice != null
      ? {
          price:  realPrice,
          normal: estimate.normal,
          pct:    Math.max(0, Math.round((1 - realPrice / estimate.normal) * 100)),
          from:   profile.homeAirport || "JFK",
          live:   true,
        }
      : { ...estimate, live: false };
    return { ...v, conditionScore: score, conditionLabel: label, period, flight };
  });

  const firingCount = listings.filter(l => l.conditionScore >= 90).length;

  const toggleWishlist = useCallback(id => {
    setWishlists(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }, [setWishlists]);

  const openDetail = useCallback(listing => setDetailVenue(listing), []);

  // Handle URL hash venue links (e.g. #venue-whistler)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#venue-")) {
        const id = hash.replace("#venue-", "");
        const found = VENUES.find(v => v.id === id);
        if (found) {
          const enriched = listings.find(l => l.id === id) || found;
          setDetailVenue(enriched);
          window.location.hash = "";
        }
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      width:"100%", minHeight:"100vh", background:"#f5f5f5",
      display:"flex", justifyContent:"center", fontFamily:F,
    }}>
      <div style={{
        width:430, height:"100vh", maxHeight:"100vh", background:"#fff",
        display:"flex", flexDirection:"column", position:"relative", overflow:"hidden",
      }}>
        {/* Top header — hidden on map tab so map fills screen edge-to-edge */}
        {activeTab !== "map" && (
          activeTab === "explore" ? (
            <div style={{ padding:"52px 24px 14px", background:"#fff", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:22, fontWeight:900, color:"#0284c7", letterSpacing:"-0.5px", fontFamily:F }}>
                  peakly
                </span>
                <button onClick={() => setShowVibeSearch(true)} className="pressable" style={{
                  background:"linear-gradient(135deg,#1a1a2e,#302b63)", border:"none",
                  borderRadius:20, padding:"6px 12px", cursor:"pointer",
                  display:"flex", alignItems:"center", gap:5,
                }}>
                  <span style={{ fontSize:12 }}>✨</span>
                  <span style={{ fontSize:11, fontWeight:700, color:"white", fontFamily:F }}>Vibe</span>
                </button>
              </div>
              <SearchBar search={search} onOpen={() => setShowSearch(true)} />
            </div>
          ) : (
            <div style={{ padding:"52px 24px 16px", background:"#fff", display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              <span style={{ fontSize:20, fontWeight:900, color:"#0284c7", letterSpacing:"-0.5px", fontFamily:F }}>
                peakly
              </span>
            </div>
          )
        )}

        {/* Tab content */}
        <div key={activeTab} className="tab-fade" style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {activeTab === "explore" && (
            <ExploreTab
              listings={listings} loading={loading}
              wishlists={wishlists} onToggle={toggleWishlist}
              onViewAlerts={() => setActiveTab("alerts")}
              activeCat={activeCat} setActiveCat={setActiveCat}
              filters={filters} setFilters={setFilters} search={search}
              onOpenDetail={openDetail}
              namedLists={namedLists} setNamedLists={setNamedLists}
              wxLastUpdated={wxLastUpdated} profile={profile}
            />
          )}
          {activeTab === "trips" && (
            <TripsTab
              listings={listings} wishlists={wishlists}
              onToggle={toggleWishlist} namedLists={namedLists}
              setNamedLists={setNamedLists} onOpenDetail={openDetail}
              profile={profile} savedTrips={savedTrips} setSavedTrips={setSavedTrips}
            />
          )}
          {activeTab === "alerts" && (
            <AlertsTab
              listings={listings} userAlerts={userAlerts}
              setUserAlerts={setUserAlerts} profile={profile}
              onShowOnboarding={() => setShowOnboarding(true)}
            />
          )}
          {activeTab === "profile" && (
            <ProfileTab
              profile={profile} setProfile={setProfile}
              filters={filters} setFilters={setFilters}
              wishlists={wishlists}
              onShowOnboarding={() => setShowOnboarding(true)}
              savedTrips={savedTrips} setSavedTrips={setSavedTrips}
              listings={listings} onOpenDetail={openDetail}
              namedLists={namedLists} setNamedLists={setNamedLists}
              onToggle={toggleWishlist}
            />
          )}
        </div>

        {showSearch && (
          <SearchSheet
            search={search}
            setSearch={setSearch}
            filters={filters}
            setFilters={setFilters}
            onApply={(s) => {
              // If exactly one activity selected, switch the tab pill to it; otherwise stay on "all"
              if (s.activities?.length === 1) setActiveCat(s.activities[0]);
              else setActiveCat("all");
              setProfile(p => ({ ...p, homeAirport: s.fromAirport }));
            }}
            onClose={() => setShowSearch(false)}
            listings={listings}
          />
        )}

        {showVibeSearch && (
          <VibeSearchSheet
            listings={listings}
            wishlists={wishlists}
            onToggle={toggleWishlist}
            onOpenDetail={openDetail}
            onClose={() => setShowVibeSearch(false)}
          />
        )}

        {showOnboarding && (
          <OnboardingSheet
            profile={profile}
            setProfile={setProfile}
            onClose={() => setShowOnboarding(false)}
          />
        )}

        {detailVenue && (
          <VenueDetailSheet
            listing={detailVenue}
            rawWx={wxData[detailVenue.id]}
            rawMar={marData[detailVenue.id]}
            wishlists={wishlists}
            onToggle={toggleWishlist}
            onClose={() => setDetailVenue(null)}
            namedLists={namedLists}
            setNamedLists={setNamedLists}
            listings={listings}
            onOpenDetail={openDetail}
            onAlert={(venue) => {
              setDetailVenue(null);
              setActiveTab("alerts");
            }}
          />
        )}

        <BottomNav active={activeTab} setActive={setActiveTab} alertCount={firingCount} />
      </div>
    </div>
  );
}


// Mount the app with error boundary
const _root = ReactDOM.createRoot(document.getElementById("root"));
_root.render(React.createElement(ErrorBoundary, null, React.createElement(App)));
