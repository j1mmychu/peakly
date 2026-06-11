const { useState, useEffect, useRef, useCallback } = React;

// ─── error monitoring & crash detection ──────────────────────────────────────

// Initialize Sentry SDK (loaded via script tag in index.html)
if (typeof Sentry !== "undefined" && Sentry.init) {
  Sentry.init({
    dsn: "https://9416b032a46681d74645b056fcb08eb7@o4511108649058304.ingest.us.sentry.io/4511108673765376",
    tracesSampleRate: 0.05,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
  });
}

// Build stamp — bump in lockstep with sw.js CACHE_NAME on each ship.
// Rendered in Profile footer so "what version am I on?" takes 1 second.
const PEAKLY_BUILD = "20260610e";

// ─── Cloud sync (Supabase) — lazy-loaded ──────────────────────────────────────
// Sync is "configured" when both URL + anon key are set. The Supabase JS lib
// itself loads LAZILY (not at first paint) — only when a returning user has a
// saved session, a magic-link redirect needs handling, or the user taps "Sign
// in" in Profile. Saves anonymous-visitor first-paint payload (~80KB).
// Anon key is public-safe; Row-Level Security on user_data is the gate.
const SUPABASE_URL      = "https://wsoqcfwkvvemtlddcgfc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indzb3FjZndrdnZlbXRsZGRjZ2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5Mjk3ODQsImV4cCI6MjA5MzUwNTc4NH0.cgmOuuuYOTSmvHThPH3V6veSUn3u64kEFphgSrbYlVA";
const CLOUD_SYNC_CONFIGURED = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
// Share-a-list feature flag. Stays false until the `shared_lists` SQL migration
// is deployed to Supabase — without the table, every share attempt throws and
// the recipient `?l=<slug>` link 404s. Flip to true after the SQL runs and the
// Share button + recipient parser both reactivate. (See ~/.claude/plans/
// effervescent-jumping-hopper.md for the schema + hand-off.)
const CLOUD_SHARE_ENABLED = false;

// Project ref → Supabase's localStorage session key. Used to detect existing
// signed-in state without loading the full library.
const _SUPABASE_PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || "";
const _SUPABASE_SESSION_KEY = _SUPABASE_PROJECT_REF ? `sb-${_SUPABASE_PROJECT_REF}-auth-token` : "";
function _hasExistingSupabaseSession() {
  if (!_SUPABASE_SESSION_KEY) return false;
  try {
    const v = localStorage.getItem(_SUPABASE_SESSION_KEY);
    return !!v && v.includes("access_token");
  } catch { return false; }
}
function _hasMagicLinkCallbackInUrl() {
  return typeof window !== "undefined" && window.location.hash && window.location.hash.includes("access_token=");
}

// Lazy-load the Supabase JS UMD bundle. Returns a Promise that resolves to
// the configured client (or null if not configured).
let _supabase = null;
let _supabaseLoadPromise = null;
function ensureSupabase() {
  if (!CLOUD_SYNC_CONFIGURED) return Promise.resolve(null);
  if (_supabase) return Promise.resolve(_supabase);
  if (_supabaseLoadPromise) return _supabaseLoadPromise;
  _supabaseLoadPromise = new Promise((resolve, reject) => {
    if (typeof supabase !== "undefined" && supabase.createClient) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.2/dist/umd/supabase.min.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Supabase JS"));
    document.head.appendChild(s);
  }).then(() => {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        detectSessionInUrl: true,    // auto-parse access_token from magic-link fragment
        flowType: "implicit",         // simpler for no-build SPAs
        persistSession: true,         // keeps user signed in across visits
        autoRefreshToken: true,       // refresh JWT before expiry
      },
    });
    return _supabase;
  });
  return _supabaseLoadPromise;
}

// User-valuable localStorage keys that cloud-sync mirrors. Caches, error logs,
// device-specific UI flags stay local.
const SYNCED_KEYS = ["peakly_wishlists", "peakly_named_lists", "peakly_alerts", "peakly_trips", "peakly_profile"];

// Auto-reload once when a new service worker takes control. Without this, the
// first visit after a deploy serves OLD content from the OLD SW (classic SW
// gotcha — skipWaiting + clients.claim help, but the page is already committed
// before activation completes). One reload here = no manual hard-refresh.
if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  let _peaklyReloadGuard = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (_peaklyReloadGuard) return;
    _peaklyReloadGuard = true;
    window.location.reload();
  });
  // Proactive: poke the SW on boot so a stuck install/waiting state actually
  // checks for a new version. Without this, sw.js can sit in "waiting" for
  // days and the page keeps serving the old cached app.jsx.
  navigator.serviceWorker.getRegistration().then(reg => { reg && reg.update(); }).catch(() => {});
}

// Forces a clean reload — unregisters every SW + nukes every cache + reloads
// the page. Surfaced via the "Refresh" link in Profile so users can rescue
// themselves out of a stuck PWA cache without needing DevTools.
async function forceCleanReload() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  } catch (_) {}
  window.location.reload();
}

(() => {
  // localStorage fallback logger (kept alongside Sentry)
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

    // Send to Sentry
    if (typeof Sentry !== "undefined" && Sentry.captureException) {
      const err = (error instanceof Error) ? error : new Error(entry.msg);
      Sentry.captureException(err, { extra: context });
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
    .heart-pop { animation: heartPop 0.35s cubic-bezier(0.34,1.56,0.64,1); }
    @keyframes heartPop { 0%{transform:scale(1)} 40%{transform:scale(1.55)} 70%{transform:scale(0.9)} 100%{transform:scale(1)} }
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
    .score-count { animation: scoreCount 0.6s cubic-bezier(0.22,1,0.36,1); }
    @keyframes scoreCount { from{opacity:0;transform:scale(0.7) translateY(4px)} to{opacity:1;transform:scale(1) translateY(0)} }
    .tab-fade { animation: tabFade 0.18s ease-out; }
    @keyframes tabFade { from{opacity:0} to{opacity:1} }
    .sheet { animation: sheetUp 0.44s cubic-bezier(0.32,1.2,0.4,1); will-change: transform; }
    @keyframes sheetUp { from{transform:translateX(-50%) translateY(100%)} to{transform:translateX(-50%) translateY(0)} }
    .sheet-exit { animation: sheetDown 0.3s cubic-bezier(0.4,0,0.8,1) forwards; will-change: transform; }
    @keyframes sheetDown { from{transform:translateX(-50%) translateY(0)} to{transform:translateX(-50%) translateY(105%)} }
    .backdrop { animation: bdFade 0.22s ease; }
    @keyframes bdFade { from{opacity:0} to{opacity:1} }
    .backdrop-exit { animation: bdFadeOut 0.28s ease forwards; }
    @keyframes bdFadeOut { from{opacity:1} to{opacity:0} }
    /* ── pill selected pop ── */
    .pill-selected { animation: pillPop 0.22s cubic-bezier(0.34,1.56,0.64,1); }
    @keyframes pillPop { 0%{transform:scale(1)} 40%{transform:scale(1.14)} 100%{transform:scale(1)} }
    /* ── vibe search animations ── */
    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes dotBounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-10px);opacity:1} }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    .vibe-spin { animation: spin 1.8s linear infinite; display:inline-block; }
    /* ── inputs ── */
    input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; outline: none; background: #e8e8e8; }
    input[type=range]::-webkit-slider-runnable-track { height: 4px; border-radius: 2px; background: #e8e8e8; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #0284c7; cursor: pointer; box-shadow: 0 1px 4px rgba(2,132,199,0.35); margin-top: -7px; }
    input[type=range]::-webkit-slider-thumb:active { transform: scale(1.2); }
    input[type=range]::-moz-range-track { height: 4px; border-radius: 2px; background: #e8e8e8; border: none; }
    input[type=range]::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #0284c7; cursor: pointer; border: none; }
    input[type=range]::-moz-range-progress { height: 4px; border-radius: 2px; background: #0284c7; }
    input[type=text], input[type=email] { outline: none; }
    input[type=text]:focus, input[type=email]:focus { border-color: #0284c7 !important; box-shadow: 0 0 0 3px rgba(2,132,199,0.12) !important; }
    input[type=date] { color-scheme: light; outline: none; -webkit-appearance: none; appearance: none; }
    input[type=date]:focus { border-color: #0284c7 !important; box-shadow: 0 0 0 3px rgba(2,132,199,0.15) !important; }
    input[type=date]::-webkit-calendar-picker-indicator { opacity: 0.65; cursor: pointer; padding: 2px; border-radius: 3px; }
    input[type=date]::-webkit-calendar-picker-indicator:hover { opacity: 1; background: rgba(2,132,199,0.1); }
    input[type=date].date-filled { background: #0066FF; color: #fff; border-color: #0066FF !important; }
    input[type=date].date-filled::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.9; }
  `;
  document.head.appendChild(s);
})();

const F = "'Plus Jakarta Sans', sans-serif";

// ─── categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id:"all",     label:"All" },
  { id:"skiing",  label:"Skiing" },
  { id:"beach", label:"Beach" },
];

// ─── Amazon Associates gear items (tag=peakly-20) ────────────────────────────
// Gate: GEAR_ITEMS[listing.category] renders in VenueDetailSheet only when
// category has items. INVARIANT: grep -c "GEAR_ITEMS" app.jsx must be >= 4.
// Deleted by auto: commits twice (2026-05-09 scrub, 2026-06-07). Do not remove.
const GEAR_ITEMS = {
  skiing: [
    { title:"Smith I/O MAG Ski Goggles", desc:"ChromaPop lens · fog-resistant", price:249,
      url:"https://www.amazon.com/dp/B08CRDGDCX?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=120&h=120&fit=crop" },
    { title:"Atomic Bent Chetler 100 Skis", desc:"All-mountain freeride · 100mm underfoot", price:599,
      url:"https://www.amazon.com/dp/B09KZQP7F3?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1522163182402-834f871fd851?w=120&h=120&fit=crop" },
    { title:"Burton Custom Snowboard Bindings", desc:"Channel-compatible · all-mountain flex", price:329,
      url:"https://www.amazon.com/dp/B07PXMZGS8?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1483721310020-03333e577078?w=120&h=120&fit=crop" },
    { title:"Helly Hansen Ski Jacket", desc:"HELLY TECH waterproof · recco reflector", price:449,
      url:"https://www.amazon.com/dp/B09Y4TF9KN?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1553689651-b4ff74a56a0b?w=120&h=120&fit=crop" },
  ],
  beach: [
    { title:"Hydro Flask 32 oz Wide Mouth", desc:"TempShield insulation · sand-proof lid", price:49,
      url:"https://www.amazon.com/dp/B07MT8ZLQR?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=120&h=120&fit=crop" },
    { title:"Aqua Marina Inflatable SUP Board", desc:"11' all-round · complete kit", price:499,
      url:"https://www.amazon.com/dp/B08MQL3Z8Z?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1562774053-701939374585?w=120&h=120&fit=crop" },
    { title:"Maui Jim Peahi Polarized Sunglasses", desc:"PolarizedPlus2 lens · UV400", price:329,
      url:"https://www.amazon.com/dp/B00CEQXGRQ?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1508296695146-257a814070b4?w=120&h=120&fit=crop" },
    { title:"Rash Guard Long Sleeve UPF 50+", desc:"Quick-dry · reef-safe", price:35,
      url:"https://www.amazon.com/dp/B073RH8BJ9?tag=peakly-20",
      img:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&h=120&fit=crop" },
  ],
};

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
  KOA:"na", OGG:"na", LIH:"na", BTV:"na", TYS:"na",
  MHT:"na", CRW:"na", GUC:"na", GPI:"na", ALB:"na", PDX:"na",
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
  ZQN:"oceania", CNS:"oceania", CBR:"oceania", SYD:"oceania", CHC:"oceania", MEL:"oceania",
  MEL:"oceania", OOL:"oceania", PER:"oceania", AKL:"oceania",
  NAN:"oceania", MLE:"oceania", PPT:"oceania",
  LST:"oceania", AIT:"oceania", SON:"oceania", PPP:"oceania", BME:"oceania",
  // Latin America / S. America
  SCL:"latam", PUQ:"latam", CUZ:"latam", LIM:"latam", GRU:"latam", FLN:"latam", REC:"latam",
  // Africa
  CPT:"africa", PLZ:"africa", AGA:"africa", WDH:"africa",
  JRO:"africa", MBA:"africa", ZNZ:"africa", SEZ:"africa",
  PRI:"africa", MRU:"africa",

  "ABJ":"africa",
  "ACC":"africa",
  "ACV":"na",
  "AGD":"oceania",
  "APW":"oceania",
  "AQT":"latam",
  "BFS":"europe",
  "BHD":"europe",
  "BKK":"asia",
  "BRI":"europe",
  "BTJ":"asia",
  "BUR":"na",
  "CMB":"asia",
  "COK":"asia",
  "CRK":"asia",
  "DIL":"asia",
  "DSS":"africa",
  "DUB":"europe",
  "DUR":"africa",
  "EUG":"na",
  "EXT":"europe",
  "FOR":"latam",
  "FSZ":"asia",
  "GIG":"latam",
  "GIS":"oceania",
  "GTW":"europe",
  "HBA":"oceania",
  "ILH":"latam",
  "KHH":"asia",
  "KUL":"asia",
  "KMI":"asia",
  "LBJ":"asia",
  "LGW":"europe",
  "LPA":"europe",
  "MAO":"latam",
  "MCT":"asia",
  "MDN":"asia",
  "MEC":"latam",
  "MFR":"na",
  "MGA":"na",
  "MQT":"africa",
  "NAT":"latam",
  "NHA":"asia",
  "OAK":"na",
  "PDX":"na",
  "PEK":"asia",
  "RCN":"asia",
  "RUN":"africa",
  "SBA":"na",
  "SBY":"asia",
  "SJC":"na",
  "SNA":"na",
  "SPC":"europe",
  "SSC":"na",
  "SUB":"asia",
  "SUM":"asia",
  "TFS":"europe",
  "TKG":"asia",
  "TLV":"asia",
  "TNR":"africa",
  "TPE":"asia",
  "TPP":"latam",
  "TRU":"latam",
  "UIO":"latam",
  "VCT":"asia",
  "VDE":"europe",
  "VLI":"oceania",
  // ── patch: airports added after initial map build ──────────────────────────
  // North America
  OAJ:"na", RDD:"na", GEG:"na", YKA:"na", ALB:"na", FCA:"na",
  // Caribbean / Bahamas
  GGT:"na",
  // Europe
  EAS:"europe", JNX:"europe", PMI:"europe", RHO:"europe", TPS:"europe",
  DLM:"europe", OSL:"europe", MXX:"europe", KRK:"europe",
  TBS:"europe", SOF:"europe",
  // Asia-Pacific
  AXT:"asia", HNA:"asia", NGO:"asia", GMP:"asia", MNL:"asia", VRC:"asia",
  DAD:"asia", PQC:"asia", IAO:"asia", TOD:"asia", GOI:"asia",
  // Oceania
  BNK:"oceania", TRG:"oceania", LEA:"oceania", BOB:"oceania",
  // Africa
  INH:"africa", RAK:"africa", CMN:"africa",
  // Middle East / Asia
  BEY:"asia", CMB:"asia", AMM:"asia",
  // Latin America
  MDZ:"latam", ZCO:"latam", USH:"latam", BRC:"latam", CPC:"latam", NQN:"latam",
};

// ─── venues with real coordinates ────────────────────────────────────────────
const VENUES = [
  {
    id:"whistler",  category:"skiing",
    title:"Whistler Blackcomb", location:"British Columbia, Canada",
    lat:50.1163, lon:-122.9574, ap:"YVR",
    icon:"🏔️", rating:4.97, reviews:2840,
    gradient:"linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
    accent:"#6db3f2", tags:["Powder Day","All Levels"], photo:"https://images.unsplash.com/photo-1526904212716-2d2cb52a7258?w=800&h=600&fit=crop&fp-x=0.33&fp-y=0.65", skiPass:"epic", lateSeason:true,
  },
  {
    id:"borabora",  category:"beach",
    title:"Bora Bora Lagoon", location:"French Polynesia",
    lat:-16.5004, lon:-151.7415, ap:"BOB",
    icon:"🏝️", rating:4.96, reviews:988,
    gradient:"linear-gradient(160deg,#1a3a00,#2e7d32,#66bb6a)",
    accent:"#a5d6a7", tags:["UV 11","Crystal Water"], photo:"https://images.unsplash.com/photo-1508855173839-a6d69c12573a?w=800&h=600&fit=crop&fp-x=0.65&fp-y=0.57",
  },
  {
    id:"chamonix",  category:"skiing",
    title:"Chamonix-Mont-Blanc", location:"Haute-Savoie, France",
    lat:45.9237, lon:6.8694, ap:"GVA",
    icon:"🎿", rating:4.94, reviews:3405,
    gradient:"linear-gradient(160deg,#0a1a3a,#1a3a6e,#3a6ebf)",
    accent:"#90caf9", tags:["Off-Piste","Mont Blanc Views"], photo:"https://images.unsplash.com/photo-1552472200-78d2ad19d2ce?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.47", skiPass:"ikon", lateSeason:true,
  },
  {id:"aspen",       category:"skiing",title:"Aspen Snowmass",          location:"Colorado, USA",            lat:39.1911,lon:-106.8175,ap:"ASE",icon:"⛷️",rating:4.97,reviews:3210,gradient:"linear-gradient(160deg,#0d1b35,#1a3a7a,#3a6ac4)",accent:"#7eb3e8",tags:["Expert Terrain","Luxury Village"], photo:"https://images.unsplash.com/photo-1508437226781-7cdb8043d2a8?w=800&h=600&fit=crop&fp-x=0.48&fp-y=0.61", skiPass:"ikon"},
  {id:"vail",        category:"skiing",title:"Vail Mountain",           location:"Colorado, USA",            lat:39.6433,lon:-106.3722,ap:"EGE",icon:"⛷️",rating:4.96,reviews:4120,gradient:"linear-gradient(160deg,#0d1b35,#1a3c7c,#2e68c2)",accent:"#82b4e8",tags:["Back Bowls","All Levels"], photo:"https://images.unsplash.com/photo-1576397702991-9d7587623713?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.39", skiPass:"epic"},
  {id:"alta",        category:"skiing",title:"Alta / Snowbird",         location:"Utah, USA",                lat:40.5883,lon:-111.6358,ap:"SLC",icon:"⛷️",rating:4.96,reviews:2960,gradient:"linear-gradient(160deg,#0a1828,#1a3870,#2e66be)",accent:"#78ace4",tags:["Ski Only","Deep Powder"], photo:"https://images.unsplash.com/photo-1592428067555-fbaaa69df4b2?w=800&h=600&fit=crop", skiPass:"ikon"},
  {id:"jacksonhole", category:"skiing",title:"Jackson Hole Mountain",   location:"Wyoming, USA",             lat:43.5875,lon:-110.8279,ap:"JAC",icon:"⛷️",rating:4.97,reviews:3440,gradient:"linear-gradient(160deg,#0d1c36,#1a3c7a,#3068c4)",accent:"#76aedf",tags:["Teton Views","Expert+"], photo:"https://images.unsplash.com/photo-1695331942059-6bf9226ccb2b?w=800&h=600&fit=crop", skiPass:"ikon"},
  {id:"bigsky",      category:"skiing",title:"Big Sky Resort",          location:"Montana, USA",             lat:45.2865,lon:-111.4013,ap:"BZN",icon:"⛷️",rating:4.93,reviews:2240,gradient:"linear-gradient(160deg,#0a1a30,#1a3870,#2e66c0)",accent:"#74aadc",tags:["Lone Peak","5,800 Acres"], photo:"https://images.unsplash.com/photo-1481285184914-8a731806bbf8?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.46", skiPass:"ikon"},
  {id:"telluride",   category:"skiing",title:"Telluride Ski Resort",    location:"Colorado, USA",            lat:37.9364,lon:-107.8123,ap:"MTJ",icon:"⛷️",rating:4.96,reviews:2100,gradient:"linear-gradient(160deg,#0c1a34,#1a3878,#2e64c0)",accent:"#72a8dc",tags:["Box Canyon","Ski-In/Out Town"], photo:"https://images.unsplash.com/photo-1613111985602-c8c9873b9780?w=800&h=600&fit=crop&fp-x=0.54&fp-y=0.67", skiPass:"epic"},
  {id:"banff",       category:"skiing",title:"Banff / Lake Louise",     location:"Alberta, Canada",          lat:51.4254,lon:-116.1773,ap:"YYC",icon:"⛷️",rating:4.95,reviews:3560,gradient:"linear-gradient(160deg,#0d1c38,#1a3e7c,#2a6abf)",accent:"#7aacdc",tags:["Rocky Mtn Views","3 Resorts"], photo:"https://images.unsplash.com/photo-1532478421036-1e0aa1afacea?w=800&h=600&fit=crop", skiPass:"ikon"},
  {id:"breckenridge",category:"skiing",title:"Breckenridge",           location:"Colorado, USA",            lat:39.4817,lon:-106.0384,ap:"DEN",icon:"⛷️",rating:4.93,reviews:4820,gradient:"linear-gradient(160deg,#0e1c38,#1a3e7e,#2e6cbe)",accent:"#78aada",tags:["Historic Town","Epic Pass"], photo:"https://images.unsplash.com/photo-1738489886397-f1101f1637f8?w=800&h=600&fit=crop&fp-x=0.69&fp-y=0.49", skiPass:"epic"},
  {id:"tahoe",       category:"skiing",title:"Palisades Tahoe",         location:"California, USA",          lat:39.1959,lon:-120.2357,ap:"RNO",icon:"⛷️",rating:4.92,reviews:3240,gradient:"linear-gradient(160deg,#0a1c38,#1a407e,#306ec0)",accent:"#76a8db",tags:["Lake Views","Consistent Snow"], photo:"https://images.unsplash.com/photo-1490640956035-66426af34621?w=800&h=600&fit=crop&fp-x=0.38&fp-y=0.63", skiPass:"ikon"},
  {id:"mammoth",     category:"skiing",title:"Mammoth Mountain",        location:"California, USA",          lat:37.6308,lon:-119.0326,ap:"RNO",icon:"⛷️",rating:4.94,reviews:3780,gradient:"linear-gradient(160deg,#0c1e38,#1a4280,#3270c0)",accent:"#74a6da",tags:["Sierra Nevada","Late Season"], photo:"https://images.unsplash.com/photo-1664352669091-e7b2f5cfb1d0?w=800&h=600&fit=crop", skiPass:"ikon", lateSeason:true},
  {id:"steamboat",   category:"skiing",title:"Steamboat Springs",       location:"Colorado, USA",            lat:40.4572,lon:-106.8045,ap:"HDN",icon:"⛷️",rating:4.91,reviews:2860,gradient:"linear-gradient(160deg,#0d1e38,#1a4280,#3270be)",accent:"#72a4d8",tags:["Champagne Powder","Cowboy Style"], photo:"https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop&fp-x=0.41&fp-y=0.33", skiPass:"ikon"},
  {id:"sunvalley",   category:"skiing",title:"Sun Valley",              location:"Idaho, USA",               lat:43.6936,lon:-114.3536,ap:"SUN",icon:"⛷️",rating:4.94,reviews:2420,gradient:"linear-gradient(160deg,#0c1c38,#1a4080,#3472c0)",accent:"#74a8da",tags:["Bald Mountain","Original Resort"], photo:"https://images.unsplash.com/photo-1735767976699-6096acda642d?w=800&h=600&fit=crop&fp-x=0.48&fp-y=0.30", skiPass:"ikon"},
  {id:"snowbasin",   category:"skiing",title:"Snowbasin",               location:"Utah, USA",                lat:41.2161,lon:-111.8548,ap:"SLC",icon:"⛷️",rating:4.91,reviews:1980,gradient:"linear-gradient(160deg,#0e1e38,#1a4280,#3272be)",accent:"#72a4d8",tags:["Olympic Venue","Uncrowded"], photo:"https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&h=600&fit=crop&fp-x=0.57&fp-y=0.52", skiPass:"ikon"},
  {id:"taos",        category:"skiing",title:"Taos Ski Valley",         location:"New Mexico, USA",          lat:36.5953,lon:-105.4475,ap:"SAF",icon:"⛷️",rating:4.92,reviews:1640,gradient:"linear-gradient(160deg,#0d1c38,#1a3a78,#2e68b8)",accent:"#72a4d8",tags:["High Altitude","Southwest Vibes"], photo:"https://images.unsplash.com/photo-1482784160316-6eb046863ece?w=800&h=600&fit=crop", skiPass:"ikon"},
  {id:"grandtarghee",category:"skiing",title:"Grand Targhee Resort",   location:"Wyoming, USA",             lat:43.7883,lon:-110.9426,ap:"JAC",icon:"⛷️",rating:4.90,reviews:1340,gradient:"linear-gradient(160deg,#0c1c36,#1a3876,#2e66b6)",accent:"#74a4d8",tags:["Teton Views","Powder Stash"], photo:"https://images.unsplash.com/photo-1643529740561-c87a7d3ad61d?w=800&h=600&fit=crop&fp-x=0.49&fp-y=0.57", skiPass:"ikon"},
  {id:"abasin",      category:"skiing",title:"Arapahoe Basin",          location:"Colorado, USA",            lat:39.6426,lon:-105.8718,ap:"DEN",icon:"⛷️",rating:4.89,reviews:2180,gradient:"linear-gradient(160deg,#0a1a34,#1a3876,#2e66ba)",accent:"#72a6d8",tags:["Longest Season CO","The Legend"], photo:"https://images.unsplash.com/photo-1740597191367-640c3f0d176b?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.46", skiPass:"ikon", lateSeason:true},
  {id:"sugarbush",   category:"skiing",title:"Sugarbush Resort",        location:"Vermont, USA",             lat:44.1356,lon:-72.9014,ap:"BTV",icon:"⛷️",rating:4.90,reviews:1940,gradient:"linear-gradient(160deg,#0d1c38,#1a3e7c,#2e6abc)",accent:"#76a8da",tags:["Mad River Valley","East Coast Best"], photo:"https://images.unsplash.com/photo-1492370361787-0cc769f11ebb?w=800&h=600&fit=crop&fp-x=0.66&fp-y=0.52", skiPass:"ikon"},
  {id:"stratton",    category:"skiing",title:"Stratton Mountain",       location:"Vermont, USA",             lat:43.1134,lon:-72.9076,ap:"ALB",icon:"⛷️",rating:4.89,reviews:2060,gradient:"linear-gradient(160deg,#0c1a36,#1a3a78,#2e66b8)",accent:"#72a6d8",tags:["Southern VT","Snowboard Birthplace"], photo:"https://images.unsplash.com/photo-1707128083278-73fd0a037bfe?w=800&h=600&fit=crop&fp-x=0.32&fp-y=0.55", skiPass:"ikon"},
  {id:"keystone",    category:"skiing",title:"Keystone Resort",         location:"Colorado, USA",            lat:39.6045,lon:-105.9516,ap:"DEN",icon:"⛷️",rating:4.92,reviews:3480,gradient:"linear-gradient(160deg,#0d1c38,#1a3e7e,#2e6cc0)",accent:"#76aada",tags:["Night Skiing","3 Peaks"], photo:"https://images.unsplash.com/photo-1516551060028-cdb0d3323879?w=800&h=600&fit=crop&fp-x=0.47&fp-y=0.33", skiPass:"epic"},
  {id:"crestedbutte",category:"skiing",title:"Crested Butte Mountain",  location:"Colorado, USA",            lat:38.8992,lon:-106.9655,ap:"GUC",icon:"⛷️",rating:4.94,reviews:2060,gradient:"linear-gradient(160deg,#0c1a36,#1a3a7a,#2e68be)",accent:"#74a8dc",tags:["Extreme Terrain","Last Great Ski Town"], photo:"https://images.unsplash.com/photo-1574087686739-f877bdcc35dc?w=800&h=600&fit=crop&fp-x=0.33&fp-y=0.52", skiPass:"epic"},
  {id:"heavenly",    category:"skiing",title:"Heavenly Mountain",       location:"California, USA",          lat:38.9332,lon:-119.9400,ap:"RNO",icon:"⛷️",rating:4.93,reviews:3580,gradient:"linear-gradient(160deg,#0c1c38,#1a4080,#3270c2)",accent:"#74a8dc",tags:["Lake Tahoe Views","Gondola Ride"], photo:"https://images.unsplash.com/photo-1555104876-061df4ef2c45?w=800&h=600&fit=crop&fp-x=0.41&fp-y=0.55", skiPass:"epic"},
  {id:"okemo",       category:"skiing",title:"Okemo Mountain Resort",   location:"Vermont, USA",             lat:43.4017,lon:-72.7174,ap:"ALB",icon:"⛷️",rating:4.89,reviews:2180,gradient:"linear-gradient(160deg,#0c1a36,#1a3a78,#2e66b8)",accent:"#72a6d8",tags:["Immaculate Grooming","Family Resort"], photo:"https://images.unsplash.com/photo-1504446533425-7ce4af7bee53?w=800&h=600&fit=crop&fp-x=0.41&fp-y=0.63", skiPass:"epic"},
  {id:"whitefish",   category:"skiing",title:"Whitefish Mountain",      location:"Montana, USA",             lat:48.4825,lon:-114.3487,ap:"FCA",icon:"⛷️",rating:4.92,reviews:1840,gradient:"linear-gradient(160deg,#0c1a36,#1a3878,#2e66b8)",accent:"#72a6d8",tags:["Glacier NP Gateway","3,000 Acres"], photo:"https://images.unsplash.com/photo-1631779202803-42c151ef761a?w=800&h=600&fit=crop&fp-x=0.33&fp-y=0.41", skiPass:"independent"},
  {id:"mthood",      category:"skiing",title:"Mt Hood Meadows",         location:"Oregon, USA",              lat:45.3311,lon:-121.6648,ap:"PDX",icon:"⛷️",rating:4.90,reviews:2060,gradient:"linear-gradient(160deg,#0c1c38,#1a3c7a,#2e68bc)",accent:"#74a8da",tags:["Pacific NW","2,150 Acres"], photo:"https://images.unsplash.com/photo-1521325213791-4d8df00eee81?w=800&h=600&fit=crop&fp-x=0.52&fp-y=0.32", skiPass:"independent"},
  {id:"alyeska",     category:"skiing",title:"Alyeska Resort",          location:"Alaska, USA",              lat:60.9697,lon:-149.0989,ap:"ANC",icon:"⛷️",rating:4.93,reviews:1320,gradient:"linear-gradient(160deg,#0a1a30,#1a3870,#2e66c0)",accent:"#74aadc",tags:["Alaska's Largest","Glacier Views"], photo:"https://images.unsplash.com/photo-1528913010160-240d3500c209?w=800&h=600&fit=crop&fp-x=0.53&fp-y=0.59", skiPass:"independent"},
  {id:"niseko",      category:"skiing",title:"Niseko United",           location:"Hokkaido, Japan",          lat:42.8048,lon:140.6879,ap:"CTS",icon:"⛷️",rating:4.97,reviews:3180,gradient:"linear-gradient(160deg,#0d1c40,#1a3e88,#3a78d4)",accent:"#7ab4ec",tags:["Japow","200+ Snow Days"], photo:"https://images.unsplash.com/photo-1582013216055-477035bf7186?w=800&h=600&fit=crop", skiPass:"ikon"},
  {id:"rusutsu",     category:"skiing",title:"Rusutsu Resort",          location:"Hokkaido, Japan",          lat:42.7517,lon:140.8956,ap:"CTS",icon:"⛷️",rating:4.92,reviews:1580,gradient:"linear-gradient(160deg,#0c1c40,#1a3e88,#3876d0)",accent:"#76b0ea",tags:["Uncrowded Japow","Tree Runs"], photo:"https://images.unsplash.com/photo-1576829021150-ebc8b46b9fb9?w=800&h=600&fit=crop", skiPass:"ikon"},
  {id:"nozawa",      category:"skiing",title:"Nozawa Onsen",            location:"Nagano, Japan",            lat:36.9221,lon:138.4434,ap:"NRT",icon:"⛷️",rating:4.91,reviews:1260,gradient:"linear-gradient(160deg,#0e2040,#1a4088,#3878d2)",accent:"#78b2ea",tags:["Onsen Après","Authentic Village"], photo:"https://images.unsplash.com/photo-1512926121941-82b4da1b0abf?w=800&h=600&fit=crop", skiPass:"independent"},
  {id:"remarkables", category:"skiing",title:"The Remarkables",         location:"Queenstown, New Zealand",  lat:-45.0400,lon:168.7862,ap:"ZQN",icon:"⛷️",rating:4.92,reviews:1880,gradient:"linear-gradient(160deg,#0a1c2e,#1a4070,#2e74b8)",accent:"#68aadc",tags:["Queenstown Base","Scenic Views"], photo:"https://images.unsplash.com/photo-1543796766-8098f2f29f66?w=800&h=600&fit=crop", skiPass:"ikon"},
  {id:"courchevel",  category:"skiing",title:"Courchevel",              location:"Les 3 Vallées, France",    lat:45.4146,lon:6.6337,ap:"CMF",icon:"⛷️",rating:4.96,reviews:3240,gradient:"linear-gradient(160deg,#0c1432,#1e2e72,#3048c2)",accent:"#6e8ae4",tags:["Luxury Chalet","Linked Ski Area"], photo:"https://images.unsplash.com/photo-1516384819783-928bb6d6ebea?w=800&h=600&fit=crop", skiPass:"independent"},
  {id:"tignes",      category:"skiing",title:"Tignes / Val d'Isère",   location:"Espace Killy, France",     lat:45.4708,lon:6.9057,ap:"CMF",icon:"⛷️",rating:4.94,reviews:2960,gradient:"linear-gradient(160deg,#0c1430,#1e2c72,#3046c0)",accent:"#6c88e2",tags:["Summer Glacier","Huge Domain"], photo:"https://images.unsplash.com/photo-1453745558060-956d4c4deff8?w=800&h=600&fit=crop", skiPass:"independent", lateSeason:true},
  {id:"andermatt",   category:"skiing",title:"Andermatt",               location:"Uri, Switzerland",         lat:46.6363,lon:8.5942,ap:"ZRH",icon:"⛷️",rating:4.92,reviews:1820,gradient:"linear-gradient(160deg,#0d1832,#1a3a72,#2e62b8)",accent:"#70a8da",tags:["New World-Class","High Alpine"], photo:"https://images.unsplash.com/photo-1570877316396-0477e81e9d8d?w=800&h=600&fit=crop", skiPass:"epic"},
  {id:"ischgl",      category:"skiing",title:"Ischgl",                  location:"Silvretta Arena, Austria", lat:47.0127,lon:10.2928,ap:"INN",icon:"⛷️",rating:4.94,reviews:3120,gradient:"linear-gradient(160deg,#0d1630,#1e3070,#2c5ab2)",accent:"#6c9ed2",tags:["Nightlife","Tax-Free Shopping"], photo:"https://images.unsplash.com/photo-1663321060226-65c5c8c48636?w=800&h=600&fit=crop", skiPass:"ikon"},
  {id:"kitzbuehel",  category:"skiing",title:"Kitzbühel",               location:"Tyrol, Austria",           lat:47.4467,lon:12.3922,ap:"SZG",icon:"⛷️",rating:4.94,reviews:3840,gradient:"linear-gradient(160deg,#0e1630,#1e3272,#2e5eb4)",accent:"#6ea0d4",tags:["Hahnenkamm Races","Historic Town"], photo:"https://images.unsplash.com/photo-1524742065576-48c9a51bd901?w=800&h=600&fit=crop", skiPass:"ikon"},
  {id:"cervinia",    category:"skiing",title:"Cervinia",                location:"Aosta Valley, Italy",      lat:45.9373,lon:7.6271,ap:"TRN",icon:"⛷️",rating:4.91,reviews:2120,gradient:"linear-gradient(160deg,#101832,#203872,#3462b2)",accent:"#6ea0d4",tags:["Matterhorn Italy","High Altitude"], photo:"https://images.unsplash.com/photo-1531743672295-bbd901790069?w=800&h=600&fit=crop", skiPass:"independent", lateSeason:true},
  {id:"beach_gcm",      category:"beach",title:"Seven Mile Beach",       location:"Grand Cayman, Cayman Islands",  lat:19.3180,lon:-81.3902,ap:"GCM",icon:"🏖️",rating:4.97,reviews:14200,gradient:"linear-gradient(160deg,#003344,#006688,#00aabb)",accent:"#00ddee",tags:["World's Best Beach","Crystal Caribbean"], photo:"https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&h=600&fit=crop"},
  {id:"beach_grace",    category:"beach",title:"Grace Bay",              location:"Providenciales, Turks & Caicos",lat:21.7918,lon:-72.2598,ap:"PLS",icon:"🏖️",rating:4.98,reviews:11900,gradient:"linear-gradient(160deg,#002233,#004466,#0077aa)",accent:"#00bbee",tags:["#1 Ranked Beach","Swim-Through Reef"], photo:"https://images.unsplash.com/photo-1536276214783-1ae17228588a?w=800&h=600&fit=crop"},
  {id:"beach_shoal",    category:"beach",title:"Shoal Bay East",         location:"Anguilla",                      lat:18.2130,lon:-63.0420,ap:"AXA",icon:"🏖️",rating:4.96,reviews:4800,gradient:"linear-gradient(160deg,#003355,#0055aa,#0088dd)",accent:"#33bbff",tags:["Powdery White Sand","Quiet & Exclusive"], photo:"https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=600&fit=crop"},
  {id:"beach_eagle",    category:"beach",title:"Eagle Beach",            location:"Aruba",                         lat:12.5600,lon:-70.0850,ap:"AUA",icon:"🏖️",rating:4.95,reviews:13400,gradient:"linear-gradient(160deg,#003355,#00558a,#0088bb)",accent:"#22aadd",tags:["Iconic Divi Tree","Year-Round Sun"], photo:"https://images.unsplash.com/photo-1593007466861-7707b21b81c0?w=800&h=600&fit=crop"},
  {id:"beach_magens",   category:"beach",title:"Magens Bay",             location:"St. Thomas, USVI",              lat:18.3700,lon:-64.9330,ap:"STT",icon:"🏖️",rating:4.93,reviews:9200,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#33aaff",tags:["Protected Horseshoe","Palm-Lined Shore"], photo:"https://images.unsplash.com/photo-1716997338016-93b456b3ea8f?w=800&h=600&fit=crop"},
  {id:"beach_stlucia",  category:"beach",title:"Anse Chastanet",         location:"St. Lucia",                     lat:13.8630,lon:-61.0750,ap:"UVF",icon:"🏖️",rating:4.96,reviews:6200,gradient:"linear-gradient(160deg,#001a22,#003844,#006677)",accent:"#00aabb",tags:["Piton Views","Volcano Backdrop"], photo:"https://images.unsplash.com/photo-1499922817053-40fe6b02b3d1?w=800&h=600&fit=crop"},
  {id:"beach_barbados", category:"beach",title:"Bottom Bay",             location:"Barbados",                      lat:13.0700,lon:-59.4450,ap:"BGI",icon:"🏖️",rating:4.94,reviews:7800,gradient:"linear-gradient(160deg,#003344,#006688,#0099aa)",accent:"#00ccdd",tags:["Atlantic Wonder","Coral Cliffs"], photo:"https://images.unsplash.com/photo-1580541631950-7282082b03fe?w=800&h=600&fit=crop"},
  {id:"beach_orient",   category:"beach",title:"Orient Bay",             location:"Saint-Martin, French Antilles",  lat:18.1000,lon:-63.0300,ap:"SXM",icon:"🏖️",rating:4.91,reviews:8600,gradient:"linear-gradient(160deg,#003355,#0055aa,#0088cc)",accent:"#33aadd",tags:["St-Barths Vibes","Water Sports Hub"], photo:"https://images.unsplash.com/photo-1517957096316-710192f26730?w=800&h=600&fit=crop"},
  {id:"beach_tobago",   category:"beach",title:"Pigeon Point",           location:"Tobago",                        lat:11.1650,lon:-60.8400,ap:"TAB",icon:"🏖️",rating:4.90,reviews:5400,gradient:"linear-gradient(160deg,#002233,#004466,#0077aa)",accent:"#00bbdd",tags:["Caribbean Soul","Offshore Coral"], photo:"https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&h=600&fit=crop"},
  {id:"beach_negril",   category:"beach",title:"Seven Mile Beach Negril", location:"Jamaica",                      lat:18.3630,lon:-78.3440,ap:"MBJ",icon:"🏖️",rating:4.92,reviews:16800,gradient:"linear-gradient(160deg,#002200,#004400,#007700)",accent:"#44cc44",tags:["Legendary Sunsets","Cliff Diving"], photo:"https://images.unsplash.com/photo-1584100936595-c0c5b900dc73?w=800&h=600&fit=crop"},
  {id:"beach_holbox",   category:"beach",title:"Holbox Island",          location:"Quintana Roo, Mexico",          lat:21.5245,lon:-87.3690,ap:"CUN",icon:"🏖️",rating:4.96,reviews:9300,gradient:"linear-gradient(160deg,#002233,#005566,#0088aa)",accent:"#33bbcc",tags:["No Cars","Whale Shark Season"], photo:"https://images.unsplash.com/photo-1615390395406-444bf2fb297f?w=800&h=600&fit=crop"},
  {id:"beach_tulum",    category:"beach",title:"Tulum Beach",            location:"Tulum, Mexico",                 lat:20.1500,lon:-87.4630,ap:"CUN",icon:"🏖️",rating:4.93,reviews:21400,gradient:"linear-gradient(160deg,#003322,#006644,#009966)",accent:"#22ccaa",tags:["Mayan Ruins Backdrop","Crystal Cenotes"], photo:"https://images.unsplash.com/photo-1513178062314-949b0c622fed?w=800&h=600&fit=crop"},
  {id:"beach_cozumel",  category:"beach",title:"Playa Palancar",         location:"Cozumel, Mexico",               lat:20.3500,lon:-87.0250,ap:"CZM",icon:"🏖️",rating:4.94,reviews:8900,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#33aaff",tags:["2nd Largest Reef","Crystal Visibility"], photo:"https://images.unsplash.com/photo-1543192262-a55cf7c7068c?w=800&h=600&fit=crop"},
  {id:"beach_rivmaya",  category:"beach",title:"Riviera Maya",           location:"Quintana Roo, Mexico",          lat:20.6300,lon:-87.0790,ap:"CUN",icon:"🏖️",rating:4.88,reviews:38400,gradient:"linear-gradient(160deg,#002233,#004466,#0077aa)",accent:"#22aacc",tags:["Resorts + Cenotes","Mesoamerican Reef"], photo:"https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&h=600&fit=crop"},
  {id:"beach_sayulita",category:"beach",title:"Sayulita",                location:"Nayarit, Mexico",               lat:20.8689,lon:-105.3977,ap:"PVR",icon:"🏖️",rating:4.91,reviews:11200,gradient:"linear-gradient(160deg,#332200,#665500,#998800)",accent:"#ddbb22",tags:["Bohemian Beach Town","Taco Heaven"], photo:"https://images.unsplash.com/photo-1552751753-0fc84ae0b223?w=800&h=600&fit=crop"},
  {id:"beach_loscabos",category:"beach",title:"Playa del Amor",          location:"Los Cabos, Mexico",             lat:22.9325,lon:-109.9100,ap:"SJD",icon:"🏖️",rating:4.94,reviews:14600,gradient:"linear-gradient(160deg,#1a0d00,#4d2600,#804000)",accent:"#cc8833",tags:["El Arco Rock Arch","Sea of Cortez"], photo:"https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"},
  {id:"beach_manuelant",category:"beach",title:"Manuel Antonio",         location:"Puntarenas, Costa Rica",        lat:9.3850,lon:-84.1420,ap:"SJO",icon:"🏖️",rating:4.93,reviews:12400,gradient:"linear-gradient(160deg,#001e00,#003d00,#006600)",accent:"#44cc44",tags:["Wildlife Everywhere","Rainforest Meets Sand"], photo:"https://images.unsplash.com/photo-1518790111753-7c60ffbd1450?w=800&h=600&fit=crop"},
  {id:"beach_bocas",    category:"beach",title:"Bocas del Toro",         location:"Panama",                        lat:9.3500,lon:-82.2420,ap:"BOC",icon:"🏖️",rating:4.90,reviews:7800,gradient:"linear-gradient(160deg,#002233,#004466,#007799)",accent:"#33bbcc",tags:["Caribbean Jungle","Bioluminescent Bay"], photo:"https://images.unsplash.com/photo-1548041347-390744c58da3?w=800&h=600&fit=crop"},
  {id:"beach_noronha",  category:"beach",title:"Fernando de Noronha",    location:"Pernambuco, Brazil",            lat:-3.8550,lon:-32.4270,ap:"FEN",icon:"🏖️",rating:4.99,reviews:5600,gradient:"linear-gradient(160deg,#001428,#002855,#004491)",accent:"#3366dd",tags:["Most Pristine Atlantic","Limited Visitors"], photo:"https://images.unsplash.com/photo-1562708851-9c2c2768e277?w=800&h=600&fit=crop"},
  {id:"beach_floripa",  category:"beach",title:"Praia Mole",             location:"Florianópolis, Brazil",         lat:-27.6050,lon:-48.4420,ap:"FLN",icon:"🏖️",rating:4.88,reviews:9200,gradient:"linear-gradient(160deg,#002244,#004488,#0066cc)",accent:"#3388ee",tags:["Brazil's Most Beautiful","Beach + Lagoon"], photo:"https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop"},
  {id:"beach_ob",       category:"beach",title:"Outer Banks OBX",        location:"North Carolina, USA",           lat:35.5582,lon:-75.4665,ap:"ORF",icon:"🏖️",rating:4.89,reviews:18600,gradient:"linear-gradient(160deg,#001a28,#003350,#005580)",accent:"#3388bb",tags:["Wild Horses","Barrier Island Drive"], photo:"https://images.unsplash.com/photo-1559827291-bce015748c52?w=800&h=600&fit=crop"},
  {id:"beach_siestakey",category:"beach",title:"Siesta Key Beach",       location:"Sarasota, Florida",             lat:27.2671,lon:-82.5471,ap:"SRQ",icon:"🏖️",rating:4.94,reviews:16800,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#33aaff",tags:["World's Finest Sand","Gulf Sunset Views"], photo:"https://images.unsplash.com/photo-1528913775512-624d24b27b96?w=800&h=600&fit=crop"},
  {id:"beach_clearwater",category:"beach",title:"Clearwater Beach",      location:"Florida, USA",                  lat:27.9783,lon:-82.8279,ap:"TPA",icon:"🏖️",rating:4.91,reviews:22400,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#22aaff",tags:["Voted #1 USA Beach","Pier 60 Sunsets"], photo:"https://images.unsplash.com/photo-1583321500900-82807e458f3c?w=800&h=600&fit=crop"},
  {id:"beach_keywest",  category:"beach",title:"Key West Beaches",       location:"Florida Keys, USA",             lat:24.5551,lon:-81.7800,ap:"EYW",icon:"🏖️",rating:4.87,reviews:14200,gradient:"linear-gradient(160deg,#001a22,#003344,#005566)",accent:"#22aacc",tags:["Southernmost Point","Duval Street"], photo:"https://images.unsplash.com/photo-1562095241-8c6714fd4178?w=800&h=600&fit=crop"},
  {id:"beach_destin",   category:"beach",title:"Emerald Coast Destin",   location:"Florida, USA",                  lat:30.3935,lon:-86.4958,ap:"VPS",icon:"🏖️",rating:4.92,reviews:19800,gradient:"linear-gradient(160deg,#003344,#005577,#007faa)",accent:"#33bbcc",tags:["Emerald Water","Sugar-White Sand"], photo:"https://images.unsplash.com/photo-1568781269258-758a4e7c0b3f?w=800&h=600&fit=crop"},
  {id:"beach_myrtle",   category:"beach",title:"Myrtle Beach",           location:"South Carolina, USA",           lat:33.6891,lon:-78.8867,ap:"MYR",icon:"🏖️",rating:4.82,reviews:28600,gradient:"linear-gradient(160deg,#002244,#004477,#0066aa)",accent:"#2288cc",tags:["60 Miles of Coast","Golf & Boardwalk"], photo:"https://images.unsplash.com/photo-1565623006013-1285e4d04497?w=800&h=600&fit=crop"},
  {id:"beach_miami",    category:"beach",title:"South Beach Miami",      location:"Miami Beach, Florida",          lat:25.7907,lon:-80.1300,ap:"MIA",icon:"🏖️",rating:4.88,reviews:42800,gradient:"linear-gradient(160deg,#001a28,#003355,#005588)",accent:"#3399dd",tags:["Art Deco","See & Be Seen"], photo:"https://images.unsplash.com/photo-1593810659067-3abb9b4dfa4c?w=800&h=600&fit=crop"},
  {id:"beach_lanikai",  category:"beach",title:"Lanikai Beach",          location:"Oahu, Hawaii",                  lat:21.3900,lon:-157.7200,ap:"HNL",icon:"🏖️",rating:4.98,reviews:12400,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#33aaff",tags:["Mokulua Islands View","Powdery White Sand"], photo:"https://images.unsplash.com/photo-1576122800181-bc3194265f27?w=800&h=600&fit=crop"},
  {id:"beach_hapuna",   category:"beach",title:"Hapuna Beach",           location:"Big Island, Hawaii",            lat:20.0040,lon:-155.8270,ap:"KOA",icon:"🏖️",rating:4.96,reviews:8600,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#33bbff",tags:["Hawaii's Best Beach","Snorkeling Coves"], photo:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop"},
  {id:"beach_kapalua",  category:"beach",title:"Kapalua Bay",            location:"Maui, Hawaii",                  lat:20.9990,lon:-156.6750,ap:"OGG",icon:"🏖️",rating:4.95,reviews:7800,gradient:"linear-gradient(160deg,#003344,#006688,#0099bb)",accent:"#22bbdd",tags:["Crescent Bay","Spinner Dolphins"], photo:"https://images.unsplash.com/photo-1541480551145-2370a440d585?w=800&h=600&fit=crop"},
  {id:"beach_positano", category:"beach",title:"Positano Beach",         location:"Amalfi Coast, Italy",           lat:40.6280,lon:14.4850,ap:"NAP",icon:"🏖️",rating:4.92,reviews:22800,gradient:"linear-gradient(160deg,#001a33,#003366,#004d99)",accent:"#3377dd",tags:["Cliffside Pastel Town","Amalfi Drive"], photo:"https://images.unsplash.com/photo-1568282167464-cb0d811b05c2?w=800&h=600&fit=crop"},
  {id:"beach_sardinia", category:"beach",title:"Cala Mariolu",           location:"Sardinia, Italy",               lat:40.0980,lon:9.5600,ap:"CAG",icon:"🏖️",rating:4.98,reviews:8400,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#33aaff",tags:["Caribbean-Clear Water","Boulders + Coves"], photo:"https://images.unsplash.com/photo-1591103000599-50f5b4ec7d3d?w=800&h=600&fit=crop"},
  {id:"beach_algarve",  category:"beach",title:"Praia da Marinha",       location:"Algarve, Portugal",             lat:37.0870,lon:-8.4110,ap:"FAO",icon:"🏖️",rating:4.96,reviews:14600,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#3399ff",tags:["Rock Arch + Sea Caves","Top10 Europe"], photo:"https://images.unsplash.com/photo-1608649944716-228404a0a8bb?w=800&h=600&fit=crop"},
  {id:"beach_santorini",category:"beach",title:"Santorini Red Beach",    location:"Santorini, Greece",             lat:36.3470,lon:25.3960,ap:"JTR",icon:"🏖️",rating:4.91,reviews:19400,gradient:"linear-gradient(160deg,#330000,#660000,#990000)",accent:"#dd4444",tags:["Volcanic Red Cliffs","Caldera Views"], photo:"https://images.unsplash.com/photo-1560703649-e3055f28bcf8?w=800&h=600&fit=crop"},
  {id:"beach_mykonos",  category:"beach",title:"Paradise Beach Mykonos", location:"Mykonos, Greece",               lat:37.4218,lon:25.3472,ap:"JMK",icon:"🏖️",rating:4.89,reviews:21600,gradient:"linear-gradient(160deg,#003355,#0055aa,#0088dd)",accent:"#33bbff",tags:["Non-Stop Party Beach","Crystal Aegean"], photo:"https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&h=600&fit=crop"},
  {id:"beach_hvar",     category:"beach",title:"Hvar Hula Hula Beach",   location:"Hvar Island, Croatia",          lat:43.1730,lon:16.4410,ap:"SPU",icon:"🏖️",rating:4.90,reviews:12200,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#3399ff",tags:["Lavender Island","Adriatic Glamour"], photo:"https://images.unsplash.com/photo-1523906834658-6e5e0be5e0fb?w=800&h=600&fit=crop"},
  {id:"beach_dubrovnik",category:"beach",title:"Banje Beach Dubrovnik",  location:"Dubrovnik, Croatia",            lat:42.6340,lon:18.1250,ap:"DBV",icon:"🏖️",rating:4.88,reviews:14600,gradient:"linear-gradient(160deg,#001a33,#003366,#0055aa)",accent:"#3377cc",tags:["Old City Backdrop","Adriatic Clear"], photo:"https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&h=600&fit=crop"},
  {id:"beach_milos",    category:"beach",title:"Sarakiniko Moon Beach",  location:"Milos Island, Greece",          lat:36.7570,lon:24.3900,ap:"MLO",icon:"🏖️",rating:4.97,reviews:8900,gradient:"linear-gradient(160deg,#e8e8e8,#cccccc,#aaaaaa)",accent:"#888888",tags:["White Volcanic Pumice","Lunar Landscape"], photo:"https://images.unsplash.com/photo-1570303345338-e1f0eddf4946?w=800&h=600&fit=crop"},
  {id:"beach_ibiza",    category:"beach",title:"Ses Salines Ibiza",      location:"Ibiza, Spain",                  lat:38.8720,lon:1.3960,ap:"IBZ",icon:"🏖️",rating:4.92,reviews:18400,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#3399ff",tags:["Natural Park Beach","White Island Vibes"], photo:"https://images.unsplash.com/photo-1564415637254-92c66292cd64?w=800&h=600&fit=crop"},
  {id:"beach_formentera",category:"beach",title:"Formentera Illetes",    location:"Formentera, Spain",             lat:38.7310,lon:1.3820,ap:"IBZ",icon:"🏖️",rating:4.97,reviews:11800,gradient:"linear-gradient(160deg,#003355,#005588,#0088bb)",accent:"#33aadd",tags:["Caribbean of Europe","Car-Free Island"], photo:"https://images.unsplash.com/photo-1530878955558-a6c31b9c97db?w=800&h=600&fit=crop"},
  {id:"beach_menorca",  category:"beach",title:"Cala Macarella",         location:"Menorca, Spain",                lat:39.9010,lon:3.8080,ap:"MAH",icon:"🏖️",rating:4.96,reviews:9400,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#3399ff",tags:["Emerald Cove","Untouched Pine Forest"], photo:"https://images.unsplash.com/photo-1561030093-83e7e8f7f2c7?w=800&h=600&fit=crop"},
  {id:"beach_cotedazur",category:"beach",title:"Côte d'Azur Antibes",   location:"French Riviera, France",        lat:43.5806,lon:7.1287,ap:"NCE",icon:"🏖️",rating:4.88,reviews:22800,gradient:"linear-gradient(160deg,#00133d,#00266e,#0044b3)",accent:"#3366ee",tags:["French Riviera","Billionaire Yachts"], photo:"https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=800&h=600&fit=crop"},
  {id:"beach_diani",    category:"beach",title:"Diani Beach",            location:"Mombasa, Kenya",                lat:-4.2720,lon:39.5930,ap:"MBA",icon:"🏖️",rating:4.93,reviews:8800,gradient:"linear-gradient(160deg,#003322,#006644,#009966)",accent:"#22cc88",tags:["White Coral Sand","Colobus Monkeys"], photo:"https://images.unsplash.com/photo-1553913861-c69a032e7069?w=800&h=600&fit=crop"},
  {id:"beach_zanzibar", category:"beach",title:"Nungwi Beach",           location:"Zanzibar, Tanzania",            lat:-5.7215,lon:39.2978,ap:"ZNZ",icon:"🏖️",rating:4.95,reviews:12400,gradient:"linear-gradient(160deg,#003344,#006688,#0099bb)",accent:"#22bbdd",tags:["Spice Island","Dhow Sunset Cruises"], photo:"https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&h=600&fit=crop"},
  {id:"beach_seychelles",category:"beach",title:"Anse Source d'Argent",  location:"La Digue, Seychelles",          lat:-4.3636,lon:55.8381,ap:"SEZ",icon:"🏖️",rating:4.99,reviews:10200,gradient:"linear-gradient(160deg,#003344,#006688,#0099bb)",accent:"#33ccdd",tags:["Most Photographed Beach","Granite Boulders"], photo:"https://images.unsplash.com/photo-1618822461310-da1be362e30c?w=800&h=600&fit=crop"},
  {id:"beach_praslin",  category:"beach",title:"Anse Lazio",             location:"Praslin, Seychelles",           lat:-4.2836,lon:55.7133,ap:"PRI",icon:"🏖️",rating:4.98,reviews:8600,gradient:"linear-gradient(160deg,#003344,#006688,#0099cc)",accent:"#22bbee",tags:["Verdure d'Eau Clear","World Top10"], photo:"https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800&h=600&fit=crop"},
  {id:"beach_mauritius",category:"beach",title:"Belle Mare Plage",       location:"Mauritius",                     lat:-20.2700,lon:57.7700,ap:"MRU",icon:"🏖️",rating:4.95,reviews:11200,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#3399ff",tags:["Turquoise Lagoon","Indian Ocean Luxury"], photo:"https://images.unsplash.com/photo-1590080876351-941da357b7ae?w=800&h=600&fit=crop"},
  {id:"beach_railay",   category:"beach",title:"Railay Beach",           location:"Krabi, Thailand",               lat:8.0107,lon:98.8382,ap:"KBV",icon:"🏖️",rating:4.97,reviews:18400,gradient:"linear-gradient(160deg,#002233,#005566,#009999)",accent:"#22ddcc",tags:["Limestone Cliffs","Accessible by Boat Only"], photo:"https://images.unsplash.com/photo-1589384241900-0aa66639ff8e?w=800&h=600&fit=crop"},
  {id:"beach_kohsamui", category:"beach",title:"Chaweng Beach",          location:"Koh Samui, Thailand",           lat:9.5317,lon:100.0672,ap:"USM",icon:"🏖️",rating:4.88,reviews:24600,gradient:"linear-gradient(160deg,#002233,#004466,#0077aa)",accent:"#22aacc",tags:["Gulf of Thailand","Full Moon Parties"], photo:"https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=800&h=600&fit=crop"},
  {id:"beach_phiphi",   category:"beach",title:"Maya Bay Phi Phi",       location:"Krabi, Thailand",               lat:7.6775,lon:98.7669,ap:"HKT",icon:"🏖️",rating:4.94,reviews:22800,gradient:"linear-gradient(160deg,#002233,#005566,#008888)",accent:"#22cccc",tags:["The Beach Film Location","Emerald Lagoon"], photo:"https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800&h=600&fit=crop"},
  {id:"beach_elnido",   category:"beach",title:"El Nido Bacuit Bay",     location:"Palawan, Philippines",          lat:11.1784,lon:119.3944,ap:"ENI",icon:"🏖️",rating:4.98,reviews:16200,gradient:"linear-gradient(160deg,#003344,#006677,#0099aa)",accent:"#22bbcc",tags:["UNESCO Biosphere","Kayak the Lagoons"], photo:"https://images.unsplash.com/photo-1695051702427-1c24ce3682e7?w=800&h=600&fit=crop"},
  {id:"beach_boracay",  category:"beach",title:"White Beach Boracay",    location:"Aklan, Philippines",            lat:11.9674,lon:121.9248,ap:"MPH",icon:"🏖️",rating:4.92,reviews:28800,gradient:"linear-gradient(160deg,#003355,#005588,#0088bb)",accent:"#33aadd",tags:["World Famous White Beach","4km of Sand"], photo:"https://images.unsplash.com/photo-1556741533-411cf82e4e2d?w=800&h=600&fit=crop"},
  {id:"beach_nusapenida",category:"beach",title:"Kelingking Secret Beach",location:"Nusa Penida, Indonesia",        lat:-8.8340,lon:115.4560,ap:"DPS",icon:"🏖️",rating:4.97,reviews:19400,gradient:"linear-gradient(160deg,#002233,#004466,#007799)",accent:"#33aacc",tags:["T-Rex Cliff","Instagram Iconic"], photo:"https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&h=600&fit=crop"},
  {id:"beach_gilit",    category:"beach",title:"Gili Trawangan",         location:"Lombok, Indonesia",             lat:-8.3520,lon:116.0500,ap:"LOP",icon:"🏖️",rating:4.90,reviews:14600,gradient:"linear-gradient(160deg,#003344,#006688,#0099bb)",accent:"#22ccdd",tags:["No Cars No Motorized Vehicles","Turtle Sanctuary"], photo:"https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&h=600&fit=crop"},
  {id:"beach_aitutaki", category:"beach",title:"Aitutaki Lagoon",        location:"Aitutaki, Cook Islands",        lat:-18.8588,lon:-159.7893,ap:"AIT",icon:"🏖️",rating:4.99,reviews:4600,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#33bbff",tags:["World's Most Beautiful Lagoon","Remote Paradise"], photo:"https://images.unsplash.com/photo-1604988162322-d5d678a1d993?w=800&h=600&fit=crop"},
  {id:"beach_whitehaven",category:"beach",title:"Whitehaven Beach",      location:"Whitsundays, Queensland",       lat:-20.2788,lon:149.0416,ap:"PPP",icon:"🏖️",rating:4.98,reviews:12800,gradient:"linear-gradient(160deg,#003344,#006688,#0099bb)",accent:"#33ccee",tags:["Hill Inlet Swirl","99% Silica Sand"], photo:"https://images.unsplash.com/photo-1561027104-aa69b72a7174?w=800&h=600&fit=crop"},
  {id:"beach_cable",    category:"beach",title:"Cable Beach",            location:"Broome, Western Australia",     lat:-17.9500,lon:122.1800,ap:"BME",icon:"🏖️",rating:4.92,reviews:8600,gradient:"linear-gradient(160deg,#1a0d00,#4d2a00,#8c4a00)",accent:"#dd8833",tags:["Camel Sunset Ride","22km Red Pindan"], photo:"https://images.unsplash.com/photo-1549877452-9c387954fbc2?w=800&h=600&fit=crop"},
  {id:"beach_portdouglas",category:"beach",title:"Four Mile Beach",      location:"Port Douglas, Queensland",      lat:-16.4840,lon:145.4640,ap:"CNS",icon:"🏖️",rating:4.91,reviews:9200,gradient:"linear-gradient(160deg,#003344,#006688,#0099bb)",accent:"#22bbdd",tags:["Great Barrier Reef Gateway","Rainforest Meets Sea"], photo:"https://images.unsplash.com/photo-1523592121529-f6dde35f079e?w=800&h=600&fit=crop"},
  {id:"zakopane",category:"skiing",title:"Zakopane",location:"Tatra Mountains, Poland",lat:49.2992,lon:19.9497,ap:"KRK",icon:"🎿",rating:4.82,reviews:1789,gradient:"linear-gradient(160deg,#0e3660,#1b63a9,#83b7e5)",accent:"#1b63a9",tags:["Tatras","Polish Alps","Cultural Hub","Ski Jumping"],photo:"https://images.unsplash.com/photo-1557692493-0a42e50efc26?w=800&h=600&fit=crop&fp-x=0.49&fp-y=0.52",skiPass:"independent"},
  {id:"schweitzer-mtn",category:"skiing",title:"Schweitzer Mountain",location:"Idaho, USA",lat:48.3583,lon:-116.6272,ap:"GEG",icon:"🎿",rating:4.87,reviews:1567,gradient:"linear-gradient(160deg,#0e3b68,#1b68b5,#87bbea)",accent:"#1b68b5",tags:["Lake Pend Oreille Views","Expert","Uncrowded","Idaho Gem"],photo:"https://images.unsplash.com/photo-1486582396475-fe5c7f2c1526?w=800&h=600&fit=crop&fp-x=0.56&fp-y=0.62",skiPass:"ikon"},
  {id:"beach_spain_mallorca_es",category:"beach",title:"Es Trenc Beach, Mallorca",location:"Mallorca, Spain",lat:39.3426,lon:2.9877,ap:"PMI",icon:"🏖️",rating:4.90,reviews:2987,gradient:"linear-gradient(160deg,#0284c7,#0ea5e9,#e0f2fe)",accent:"#0ea5e9",tags:["UV 9","Naturist Area","White Sand","Crystal Sea","Undeveloped"],photo:"https://images.unsplash.com/photo-1627990493469-95d51823a423?w=800&h=600&fit=crop&fp-x=0.69&fp-y=0.67"},
  {id:"zell-am-see-s1",category:"skiing",title:"Zell am See",location:"Salzburg, Austria",lat:47.3333,lon:12.8,ap:"SZG",icon:"🏔️",rating:4.59,reviews:3214,gradient:"linear-gradient(160deg,#0d1b2a,#1565c0,#64b5f6)",accent:"#b3e5fc",tags:["Expert Terrain","Off-Piste","Deep Snow","Backcountry"],photo:"https://images.unsplash.com/photo-1548777113-e0b0d7e72e6c?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"appi-kogen-s2",category:"skiing",title:"Appi Kogen",location:"Iwate, Japan",lat:39.9711,lon:140.9317,ap:"HNA",icon:"🏔️",rating:4.76,reviews:1985,gradient:"linear-gradient(160deg,#1a0533,#4a0e8f,#7c43bd)",accent:"#ce93d8",tags:["Beginner Slopes","Ski School","Family Friendly","Tohoku Powder"],photo:"https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"hemsedal-s3",category:"skiing",title:"Hemsedal",location:"Viken, Norway",lat:60.8631,lon:8.5647,ap:"OSL",icon:"🏔️",rating:4.75,reviews:3001,gradient:"linear-gradient(160deg,#002233,#004466,#006699)",accent:"#80ccff",tags:["Black Diamonds","Steep Chutes","Variable Terrain","Long Season"],photo:"https://images.unsplash.com/photo-1543896868-2f7d98bd3dd6?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"portillo-s4",category:"skiing",title:"Portillo",location:"Valparaiso, Chile",lat:-32.8333,lon:-70.1333,ap:"SCL",icon:"🏔️",rating:4.54,reviews:446,gradient:"linear-gradient(160deg,#001a00,#1b5e20,#4caf50)",accent:"#a5d6a7",tags:["Glacial Skiing","Scenic Views","Village Base","On-Piste"],photo:"https://images.unsplash.com/photo-1520175462-89499834c4c1?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"big-white-ski-s5",category:"skiing",title:"Big White Ski",location:"British Columbia, Canada",lat:49.7167,lon:-118.9333,ap:"YLW",icon:"🏔️",rating:4.71,reviews:3866,gradient:"linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",accent:"#6db3f2",tags:["Powder Day","All Levels","High Altitude","Groomed Runs"],photo:"https://images.unsplash.com/photo-1578985545284-db7b72abc2cd?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"idre-fjall-s6",category:"skiing",title:"Idre Fjall",location:"Dalarna, Sweden",lat:61.8833,lon:12.6667,ap:"OSL",icon:"🏔️",rating:4.95,reviews:2664,gradient:"linear-gradient(160deg,#0d1b2a,#1565c0,#64b5f6)",accent:"#b3e5fc",tags:["Expert Terrain","Off-Piste","Deep Snow","Backcountry"],photo:"https://images.unsplash.com/photo-1516117172878-026ddba3c36a?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"kicking-horse-s10",category:"skiing",title:"Kicking Horse",location:"British Columbia, Canada",lat:51.2979,lon:-117.0447,ap:"YYC",icon:"🏔️",rating:4.51,reviews:2760,gradient:"linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",accent:"#6db3f2",tags:["Powder Day","Expert Terrain","High Altitude","Steep Chutes"],photo:"https://images.unsplash.com/photo-1589802822605-b6f1d7fbd41a?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5", skiPass:"epic"},
  {id:"kiroro-snow-world-s11",category:"skiing",title:"Kiroro Snow World",location:"Hokkaido, Japan",lat:43.0558,lon:140.9656,ap:"CTS",icon:"🏔️",rating:4.58,reviews:3869,gradient:"linear-gradient(160deg,#0d1b2a,#1565c0,#64b5f6)",accent:"#b3e5fc",tags:["Expert Terrain","Off-Piste","Deep Snow","Backcountry"],photo:"https://images.unsplash.com/photo-1484527689-1ac2a30bfbd4?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"morzine-s12",category:"skiing",title:"Morzine",location:"Haute-Savoie, France",lat:46.1786,lon:6.7069,ap:"GVA",icon:"🏔️",rating:4.91,reviews:3064,gradient:"linear-gradient(160deg,#1a0533,#4a0e8f,#7c43bd)",accent:"#ce93d8",tags:["Beginner Slopes","Ski School","Family Friendly","Night Skiing"],photo:"https://images.unsplash.com/photo-1561843702-1ab41bebe7f9?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"sainte-foy-tarentaise-s13",category:"skiing",title:"Sainte-Foy Tarentaise",location:"Savoie, France",lat:45.55,lon:6.8833,ap:"GVA",icon:"🏔️",rating:4.54,reviews:967,gradient:"linear-gradient(160deg,#002233,#004466,#006699)",accent:"#80ccff",tags:["Black Diamonds","Steep Chutes","Variable Terrain","Long Season"],photo:"https://images.unsplash.com/photo-1569038786784-aee5b10e3511?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"stowe-mountain-s14",category:"skiing",title:"Stowe Mountain",location:"Lamoille County, Vermont",lat:44.5267,lon:-72.7817,ap:"BTV",icon:"🏔️",rating:4.62,reviews:4924,gradient:"linear-gradient(160deg,#001a00,#1b5e20,#4caf50)",accent:"#a5d6a7",tags:["Vermont Classic","Mt Mansfield","Resort Village","New England Icon"],photo:"https://images.unsplash.com/photo-1522163723043-5c42c1de3742?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5", skiPass:"epic"},
  {id:"champoluc-monterosa-s15",category:"skiing",title:"Champoluc Monterosa",location:"Aosta Valley, Italy",lat:45.8167,lon:7.7,ap:"TRN",icon:"🏔️",rating:4.7,reviews:744,gradient:"linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",accent:"#6db3f2",tags:["Powder Day","All Levels","High Altitude","Groomed Runs"],photo:"https://images.unsplash.com/photo-1576012816255-89a5a2d94ac7?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"sun-peaks-resort-s17",category:"skiing",title:"Sun Peaks Resort",location:"British Columbia, Canada",lat:50.8833,lon:-119.8833,ap:"YKA",icon:"🏔️",rating:4.87,reviews:1915,gradient:"linear-gradient(160deg,#1a0533,#4a0e8f,#7c43bd)",accent:"#ce93d8",tags:["Beginner Slopes","Ski School","Family Friendly","Night Skiing"],photo:"https://images.unsplash.com/photo-1543268524-cda03c9861c3?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"pucon-ski-center-s19",category:"skiing",title:"Pucon Ski Center",location:"Araucania, Chile",lat:-39.2667,lon:-71.95,ap:"ZCO",icon:"🏔️",rating:4.54,reviews:1034,gradient:"linear-gradient(160deg,#001a00,#1b5e20,#4caf50)",accent:"#a5d6a7",tags:["Glacial Skiing","Scenic Views","Village Base","On-Piste"],photo:"https://images.unsplash.com/photo-1598586517946-4e3db73cadf3?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"les-arcs-s20",category:"skiing",title:"Les Arcs",location:"Savoie, France",lat:45.5,lon:6.8333,ap:"GVA",icon:"🏔️",rating:4.76,reviews:1688,gradient:"linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",accent:"#6db3f2",tags:["Powder Day","All Levels","High Altitude","Groomed Runs"],photo:"https://images.unsplash.com/photo-1533234499399-4cc0a54684f9?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"powder-mountain-s21",category:"skiing",title:"Powder Mountain",location:"Weber County, Utah",lat:41.3833,lon:-111.7833,ap:"SLC",icon:"🏔️",rating:4.94,reviews:2962,gradient:"linear-gradient(160deg,#0d1b2a,#1565c0,#64b5f6)",accent:"#b3e5fc",tags:["Expert Terrain","Off-Piste","Deep Snow","Backcountry"],photo:"https://images.unsplash.com/photo-1529408686637-c33ca8e4f9b7?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"madarao-mountain-s22",category:"skiing",title:"Madarao Mountain",location:"Nagano, Japan",lat:36.9847,lon:138.3381,ap:"NRT",icon:"🏔️",rating:4.67,reviews:1309,gradient:"linear-gradient(160deg,#1a0533,#4a0e8f,#7c43bd)",accent:"#ce93d8",tags:["Deep Powder","Tree Skiing","Uncrowded Runs","Nagano Backcountry"],photo:"https://images.unsplash.com/photo-1544982503-9f984c14501a?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"thredbo-village-s23",category:"skiing",title:"Thredbo Village",location:"New South Wales, Australia",lat:-36.5,lon:148.3,ap:"SYD",icon:"🏔️",rating:4.62,reviews:1299,gradient:"linear-gradient(160deg,#002233,#004466,#006699)",accent:"#80ccff",tags:["Black Diamonds","Steep Chutes","Variable Terrain","Long Season"],photo:"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"nevis-range-s24",category:"skiing",title:"Nevis Range",location:"Highlands, Scotland",lat:56.8333,lon:-5.0,ap:"INV",icon:"🏔️",rating:4.63,reviews:1521,gradient:"linear-gradient(160deg,#001a00,#1b5e20,#4caf50)",accent:"#a5d6a7",tags:["Glacial Skiing","Scenic Views","Village Base","On-Piste"],photo:"https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"tsugaike-kogen-s25",category:"skiing",title:"Tsugaike Kogen",location:"Nagano, Japan",lat:36.7697,lon:137.8158,ap:"NRT",icon:"🏔️",rating:4.8,reviews:717,gradient:"linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",accent:"#6db3f2",tags:["Powder Day","All Levels","High Altitude","Groomed Runs"],photo:"https://images.unsplash.com/photo-1580058572462-98e0c62ed3d8?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"mount-shasta-ski-s26",category:"skiing",title:"Mount Shasta Ski",location:"Siskiyou County, California",lat:41.35,lon:-122.1833,ap:"RDD",icon:"🏔️",rating:4.59,reviews:4147,gradient:"linear-gradient(160deg,#0d1b2a,#1565c0,#64b5f6)",accent:"#b3e5fc",tags:["Expert Terrain","Off-Piste","Deep Snow","Backcountry"],photo:"https://images.unsplash.com/photo-1524673450801-b5aa9b621b76?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"lech-zurs-s27",category:"skiing",title:"Lech Zürs",location:"Vorarlberg, Austria",lat:47.2083,lon:10.1444,ap:"INN",icon:"🏔️",rating:4.73,reviews:4718,gradient:"linear-gradient(160deg,#1a0533,#4a0e8f,#7c43bd)",accent:"#ce93d8",tags:["Expert Terrain","Off-Piste Powder","Arlberg Region","Luxury"],photo:"https://images.unsplash.com/photo-1516259762965-f47aced4a7f7?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"cerro-castor-s28",category:"skiing",title:"Cerro Castor",location:"Tierra del Fuego, Argentina",lat:-54.7833,lon:-68.1167,ap:"USH",icon:"🏔️",rating:4.87,reviews:3777,gradient:"linear-gradient(160deg,#002233,#004466,#006699)",accent:"#80ccff",tags:["Black Diamonds","Steep Chutes","Variable Terrain","Long Season"],photo:"https://images.unsplash.com/photo-1547036967-3f4fc0adbf6a?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"treble-cone-s29",category:"skiing",title:"Treble Cone",location:"Wanaka, New Zealand",lat:-44.6167,lon:168.95,ap:"ZQN",icon:"🏔️",rating:4.83,reviews:4724,gradient:"linear-gradient(160deg,#001a00,#1b5e20,#4caf50)",accent:"#a5d6a7",tags:["Glacial Skiing","Scenic Views","Village Base","On-Piste"],photo:"https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"agios-prokopios-t2",category:"beach",title:"Agios Prokopios",location:"Naxos, Greece",lat:37.0667,lon:25.4167,ap:"JNX",icon:"🏝️",rating:4.64,reviews:2555,gradient:"linear-gradient(160deg,#003322,#006644,#00a86b)",accent:"#80d4b0",tags:["Quiet & Pristine","Family Friendly","Shallow Clear Water","Naxos Old Town"],photo:"https://images.unsplash.com/photo-1507991237285-6d74e0adc0fa?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"playa-de-la-concha-t3",category:"beach",title:"Playa de la Concha",location:"San Sebastian, Spain",lat:43.3208,lon:-1.9928,ap:"EAS",icon:"🏝️",rating:4.74,reviews:730,gradient:"linear-gradient(160deg,#1a1a3a,#2828a0,#5050e0)",accent:"#a0a0ff",tags:["Curved Urban Bay","Belle Époque Promenade","Basque Pintxos Scene","Safe Swimming"],photo:"https://images.unsplash.com/photo-1519820056430-f656be5a1e7b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"huatulco-santa-cruz-t4",category:"beach",title:"Huatulco Santa Cruz",location:"Oaxaca, Mexico",lat:15.7583,lon:-96.1417,ap:"HUX",icon:"🏝️",rating:4.68,reviews:2120,gradient:"linear-gradient(160deg,#3a1a00,#7f3300,#d4600a)",accent:"#ffaa74",tags:["National Park Bay","Snorkeling Reefs","Blue Flag","Calm Pacific"],photo:"https://images.unsplash.com/photo-1439405326-9f4ee48e0e73?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"plage-de-pampelonne-t5",category:"beach",title:"Plage de Pampelonne",location:"Saint-Tropez, France",lat:43.25,lon:6.65,ap:"NCE",icon:"🏝️",rating:4.85,reviews:4161,gradient:"linear-gradient(160deg,#1a3a00,#2e7d32,#66bb6a)",accent:"#a5d6a7",tags:["UV 10+","Crystal Water","White Sand","Year-Round Sun"],photo:"https://images.unsplash.com/photo-1477120128765-a0528148fed2?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"matira-beach-t6",category:"beach",title:"Matira Beach",location:"Bora Bora, French Polynesia",lat:-16.5333,lon:-151.7333,ap:"BOB",icon:"🏝️",rating:4.79,reviews:1701,gradient:"linear-gradient(160deg,#3a2800,#8d5700,#d4860a)",accent:"#ffb74d",tags:["Secluded Beach","Snorkeling","Calm Waters","Pristine"],photo:"https://images.unsplash.com/photo-1494548162494-384bba4ab999?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"outer-banks-nags-head-t7",category:"beach",title:"Outer Banks Nags Head",location:"North Carolina, USA",lat:35.9577,lon:-75.6244,ap:"ORF",icon:"🏝️",rating:4.72,reviews:1209,gradient:"linear-gradient(160deg,#003322,#006644,#00a86b)",accent:"#80d4b0",tags:["Jockey's Ridge Dunes","Hang Gliding","Family Friendly","Historic Lighthouse"],photo:"https://images.unsplash.com/photo-1510227272981-87123e259b17?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"turquoise-bay-t8",category:"beach",title:"Turquoise Bay",location:"Western Australia, Australia",lat:-21.9167,lon:114.1167,ap:"LEA",icon:"🏝️",rating:4.65,reviews:3341,gradient:"linear-gradient(160deg,#1a1a3a,#2828a0,#5050e0)",accent:"#a0a0ff",tags:["Natural Beauty","Protected Bay","Coral Reef","No Crowds"],photo:"https://images.unsplash.com/photo-1520454379017-1a16d7f1a1d7?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"natadola-beach-t9",category:"beach",title:"Natadola Beach",location:"Fiji",lat:-18.1167,lon:177.5167,ap:"NAN",icon:"🏝️",rating:4.66,reviews:3212,gradient:"linear-gradient(160deg,#3a1a00,#7f3300,#d4600a)",accent:"#ffaa74",tags:["Family Friendly","Swimming Lagoon","White Sand","Fiji's Best Beach"],photo:"https://images.unsplash.com/photo-1533104190960-c7e28b5f6b52?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"tofo-beach-t10",category:"beach",title:"Tofo Beach",location:"Inhambane, Mozambique",lat:-23.8667,lon:35.5333,ap:"INH",icon:"🏝️",rating:4.89,reviews:2799,gradient:"linear-gradient(160deg,#1a3a00,#2e7d32,#66bb6a)",accent:"#a5d6a7",tags:["UV 10+","Crystal Water","White Sand","Year-Round Sun"],photo:"https://images.unsplash.com/photo-1519996409144-01b7bb003574?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"tioman-island-t11",category:"beach",title:"Tioman Island",location:"Pahang, Malaysia",lat:2.8,lon:104.1667,ap:"KUL",icon:"🏝️",rating:4.72,reviews:3627,gradient:"linear-gradient(160deg,#3a2800,#8d5700,#d4860a)",accent:"#ffb74d",tags:["Secluded Beach","Snorkeling","Calm Waters","Pristine"],photo:"https://images.unsplash.com/photo-1530053235038-30613cf5eb3b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"mana-island-fiji-t12",category:"beach",title:"Mana Island Fiji",location:"Fiji",lat:-17.6667,lon:177.0833,ap:"NAN",icon:"🏝️",rating:4.9,reviews:4969,gradient:"linear-gradient(160deg,#003322,#006644,#00a86b)",accent:"#80d4b0",tags:["Private Resort Island","Snorkeling Reef","Palm-Fringed Lagoon","Remote Getaway"],photo:"https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"zlatni-rat-t14",category:"beach",title:"Zlatni Rat",location:"Brac, Croatia",lat:43.3167,lon:16.6333,ap:"SPU",icon:"🏝️",rating:4.8,reviews:1745,gradient:"linear-gradient(160deg,#3a1a00,#7f3300,#d4600a)",accent:"#ffaa74",tags:["Shifting Pebble Cape","Kitesurfing","Blue Flag","Adriatic Icon"],photo:"https://images.unsplash.com/photo-1559825481-12a05cc00344?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"lovina-beach-t15",category:"beach",title:"Lovina Beach",location:"Bali, Indonesia",lat:-8.1556,lon:115.0244,ap:"DPS",icon:"🏝️",rating:4.73,reviews:1555,gradient:"linear-gradient(160deg,#1a3a00,#2e7d32,#66bb6a)",accent:"#a5d6a7",tags:["Black Volcanic Sand","Dolphin Watching","Calm North Coast","Snorkeling"],photo:"https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

  {id:"nusa-dua-beach-t17",category:"beach",title:"Nusa Dua Beach",location:"Bali, Indonesia",lat:-8.8059,lon:115.2325,ap:"DPS",icon:"🏝️",rating:4.64,reviews:4122,gradient:"linear-gradient(160deg,#003322,#006644,#00a86b)",accent:"#80d4b0",tags:["5-Star Resorts","Calm Bay","Family Friendly","Reef Snorkeling"],photo:"https://images.unsplash.com/photo-1495908040769-ab5c3b1d4e6e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"patara-beach-t18",category:"beach",title:"Patara Beach",location:"Antalya, Turkey",lat:36.2667,lon:29.3167,ap:"DLM",icon:"🏝️",rating:4.97,reviews:2085,gradient:"linear-gradient(160deg,#1a1a3a,#2828a0,#5050e0)",accent:"#a0a0ff",tags:["Ancient Lycian Ruins","Sea Turtle Nesting","6km Pristine Beach","UNESCO Protected"],photo:"https://images.unsplash.com/photo-1528543010-26b51d08a7e2?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"bulabog-beach-boracay-t19",category:"beach",title:"Bulabog Beach Boracay",location:"Aklan, Philippines",lat:11.96,lon:121.9342,ap:"MPH",icon:"🏝️",rating:4.66,reviews:2396,gradient:"linear-gradient(160deg,#3a1a00,#7f3300,#d4600a)",accent:"#ffaa74",tags:["Kiteboarding Capital","Trade Winds","Windsurfing","World Cup Kite Venue"],photo:"https://images.unsplash.com/photo-1436262117760-66d59c6f25cc?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"san-vito-lo-capo-t21",category:"beach",title:"San Vito lo Capo",location:"Sicily, Italy",lat:38.175,lon:12.7333,ap:"TPS",icon:"🏝️",rating:4.68,reviews:4719,gradient:"linear-gradient(160deg,#3a2800,#8d5700,#d4860a)",accent:"#ffb74d",tags:["Secluded Beach","Snorkeling","Calm Waters","Pristine"],photo:"https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"hyams-beach-t22",category:"beach",title:"Hyams Beach",location:"New South Wales, Australia",lat:-35.1167,lon:150.6833,ap:"CBR",icon:"🏝️",rating:4.6,reviews:4569,gradient:"linear-gradient(160deg,#003322,#006644,#00a86b)",accent:"#80d4b0",tags:["Whitest Sand in the World","Jervis Bay","Quiet & Pristine","Kangaroo Sightings"],photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"lindos-beach-t23",category:"beach",title:"Lindos Beach",location:"Rhodes, Greece",lat:36.0917,lon:28.0883,ap:"RHO",icon:"🏝️",rating:4.59,reviews:4606,gradient:"linear-gradient(160deg,#1a1a3a,#2828a0,#5050e0)",accent:"#a0a0ff",tags:["Acropolis Backdrop","Pebble & Sand Mix","Turquoise Cove","Hilltop Village Walk"],photo:"https://images.unsplash.com/photo-1507041957456-9c397ce39c97?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"laguna-beach-t24",category:"beach",title:"Laguna Beach",location:"California, USA",lat:33.5427,lon:-117.7854,ap:"SNA",icon:"🏝️",rating:4.51,reviews:3881,gradient:"linear-gradient(160deg,#3a1a00,#7f3300,#d4600a)",accent:"#ffaa74",tags:["Tide Pool Coves","Artist Village","Snorkeling","Pacific Bluffs"],photo:"https://images.unsplash.com/photo-1467631332947-8506a3b38a56?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"koh-tao-sairee-t25",category:"beach",title:"Koh Tao Sairee",location:"Surat Thani, Thailand",lat:10.0833,lon:99.8333,ap:"USM",icon:"🏝️",rating:4.96,reviews:1817,gradient:"linear-gradient(160deg,#1a3a00,#2e7d32,#66bb6a)",accent:"#a5d6a7",tags:["Scuba Diving Mecca","Crystal Coral","Open Water Certs","Turtle Bay"],photo:"https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"muscat-beach-t26",category:"beach",title:"Muscat Beach",location:"Oman",lat:23.588,lon:58.3972,ap:"MCT",icon:"🏝️",rating:4.71,reviews:2486,gradient:"linear-gradient(160deg,#3a2800,#8d5700,#d4860a)",accent:"#ffb74d",tags:["Turquoise Gulf Water","Turtle Nesting","Desert Meets Sea","Quiet Escape"],photo:"https://images.unsplash.com/photo-1512100011019-1f6c8ecd1b06?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

  {id:"rendezvous-bay-t28",category:"beach",title:"Rendezvous Bay",location:"Anguilla",lat:18.2,lon:-63.1167,ap:"AXA",icon:"🏝️",rating:4.9,reviews:3451,gradient:"linear-gradient(160deg,#1a1a3a,#2828a0,#5050e0)",accent:"#a0a0ff",tags:["Natural Beauty","Protected Bay","Coral Reef","No Crowds"],photo:"https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
  {id:"an-bang-beach-t29",category:"beach",title:"An Bang Beach",location:"Quang Nam, Vietnam",lat:15.9206,lon:108.3369,ap:"DAD",icon:"🏝️",rating:4.83,reviews:1240,gradient:"linear-gradient(160deg,#3a1a00,#7f3300,#d4600a)",accent:"#ffaa74",tags:["Hoi An Doorstep","Fishing Village Vibe","Uncrowded","Beach Bars"],photo:"https://images.unsplash.com/photo-1562619425-01c1b0c33793?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

  // ── batch 2026-05-27: Maldives, Sri Lanka, Turkey, Lebanon ski, Morocco ski ─
  {id:"beach_maldives",category:"beach",
    title:"Maldives North Malé Atoll",location:"North Malé Atoll, Maldives",
    lat:4.1755,lon:73.5093,ap:"MLE",icon:"🏝️",rating:4.98,reviews:6800,
    gradient:"linear-gradient(160deg,#001a33,#003d7a,#0077cc)",accent:"#66ccff",
    tags:["Overwater Bungalows","Bioluminescent Lagoon","Reef Snorkeling","Clearest Water on Earth"],
    photo:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"},

  {id:"beach_mirissa",category:"beach",
    title:"Mirissa Beach",location:"Matara District, Sri Lanka",
    lat:5.9469,lon:80.4584,ap:"CMB",icon:"🏝️",rating:4.87,reviews:4200,
    gradient:"linear-gradient(160deg,#001e14,#003d28,#00703f)",accent:"#44cc88",
    tags:["Blue Whale Watching","Coconut Hill Sunrise","Surf Breaks","Party Sunset"],
    photo:"https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55"},

  {id:"beach_oludeniz",category:"beach",
    title:"Ölüdeniz Blue Lagoon",location:"Fethiye, Turkey",
    lat:36.5514,lon:29.1139,ap:"DLM",icon:"🏖️",rating:4.94,reviews:18600,
    gradient:"linear-gradient(160deg,#00132b,#002e6e,#0055bb)",accent:"#3388ee",
    tags:["Paragliding From Babadağ","Protected Blue Lagoon","Turquoise Water","Butterfly Valley"],
    photo:"https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

  {id:"ski_mzaar",category:"skiing",
    title:"Mzaar Kfardebian",location:"Mount Lebanon, Lebanon",
    lat:34.0703,lon:35.9742,ap:"BEY",icon:"⛷️",rating:4.78,reviews:2640,
    gradient:"linear-gradient(160deg,#1a0d2e,#3d2080,#6040c0)",accent:"#9980e0",
    tags:["Middle East's Largest Resort","Cedar Mountains","Day Trip From Beirut","All Levels"],
    photo:"https://images.unsplash.com/photo-1518281420975-50db6e5d0a97?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
    skiPass:"independent"},

  {id:"ski_oukaimeden",category:"skiing",
    title:"Oukaimeden Ski Resort",location:"High Atlas Mountains, Morocco",
    lat:31.2082,lon:-7.8600,ap:"RAK",icon:"⛷️",rating:4.61,reviews:1180,
    gradient:"linear-gradient(160deg,#1a0a00,#4d2a00,#8c5000)",accent:"#cc8844",
    tags:["Africa's Highest Ski Resort","Atlas Mountain Views","Berber Villages","Rope Tow Adventure"],
    photo:"https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass:"independent"},

  {id:"beach_phuquoc",category:"beach",
    title:"Long Beach Phú Quốc",location:"Kiên Giang, Vietnam",
    lat:10.2273,lon:103.9673,ap:"PQC",
    icon:"🏝️",rating:4.81,reviews:3140,
    gradient:"linear-gradient(160deg,#001e14,#003d28,#006644)",accent:"#44cc88",
    tags:["Sunset West-Facing","Calm Gulf Waters","Island Town","Budget Friendly"],
    photo:"https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

  {id:"beach_goa",category:"beach",
    title:"Palolem Beach",location:"Goa, India",
    lat:15.0098,lon:74.0233,ap:"GOI",
    icon:"🏝️",rating:4.79,reviews:4620,
    gradient:"linear-gradient(160deg,#1a0a00,#4d2200,#8c5000)",accent:"#ffaa44",
    tags:["Crescent Bay","Hippie Heritage","Yoga on the Sand","Warm Arabian Sea"],
    photo:"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

  {id:"ski_gudauri",category:"skiing",
    title:"Gudauri Ski Resort",location:"Kazbegi Region, Georgia",
    lat:42.4833,lon:44.4833,ap:"TBS",
    icon:"🏔️",rating:4.73,reviews:2210,
    gradient:"linear-gradient(160deg,#1a0d2e,#3d2080,#6040c0)",accent:"#9980e0",
    tags:["Caucasus Powder","Off-Piste Backcountry","High Altitude","Value Pick"],
    photo:"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass:"independent"},

  {id:"ski_bansko",category:"skiing",
    title:"Bansko Ski Resort",location:"Blagoevgrad, Bulgaria",
    lat:41.8376,lon:23.4886,ap:"SOF",
    icon:"⛷️",rating:4.68,reviews:3780,
    gradient:"linear-gradient(160deg,#0e1e38,#1a4280,#3272be)",accent:"#72a4d8",
    tags:["Budget Ski Europe","Après-Ski Village","Beginner Friendly","Long Season"],
    photo:"https://images.unsplash.com/photo-1516592673884-4a382d1124c2?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
    skiPass:"independent"},
  // ── Ikon Pass batch (added 2026-06-08) ──
    {
      "id": "winter-park",
      "category": "skiing",
      "title": "Winter Park",
      "location": "Colorado, USA",
      "lat": 39.8918,
      "lon": -105.7625,
      "ap": "DEN",
      "icon": "🏔️",
      "rating": 4.7,
      "reviews": 1820,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Powder Day",
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "ikon",
      "lateSeason": true
    },
    {
      "id": "copper-mountain",
      "category": "skiing",
      "title": "Copper Mountain",
      "location": "Colorado, USA",
      "lat": 39.5022,
      "lon": -106.1497,
      "ap": "EGE",
      "icon": "🏔️",
      "rating": 4.6,
      "reviews": 1410,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Powder Day",
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "ikon",
      "lateSeason": true
    },
    {
      "id": "palisades-tahoe",
      "category": "skiing",
      "title": "Palisades Tahoe",
      "location": "California, USA",
      "lat": 39.1969,
      "lon": -120.2356,
      "ap": "RNO",
      "icon": "🏔️",
      "rating": 4.7,
      "reviews": 2240,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Powder Day",
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "ikon"
    },
    {
      "id": "snowbird",
      "category": "skiing",
      "title": "Snowbird",
      "location": "Utah, USA",
      "lat": 40.5829,
      "lon": -111.6553,
      "ap": "SLC",
      "icon": "🏔️",
      "rating": 4.8,
      "reviews": 1980,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Powder Day"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "ikon",
      "lateSeason": true
    },
    {
      "id": "brighton",
      "category": "skiing",
      "title": "Brighton",
      "location": "Utah, USA",
      "lat": 40.6017,
      "lon": -111.5836,
      "ap": "SLC",
      "icon": "🏔️",
      "rating": 4.6,
      "reviews": 920,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Powder Day",
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "ikon"
    },
    {
      "id": "solitude",
      "category": "skiing",
      "title": "Solitude",
      "location": "Utah, USA",
      "lat": 40.6212,
      "lon": -111.5919,
      "ap": "SLC",
      "icon": "🏔️",
      "rating": 4.5,
      "reviews": 740,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "ikon"
    },
    {
      "id": "deer-valley",
      "category": "skiing",
      "title": "Deer Valley",
      "location": "Park City, Utah, USA",
      "lat": 40.6303,
      "lon": -111.4781,
      "ap": "SLC",
      "icon": "🏔️",
      "rating": 4.9,
      "reviews": 2630,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "ikon"
    },
    {
      "id": "crystal-mountain-wa",
      "category": "skiing",
      "title": "Crystal Mountain",
      "location": "Washington, USA",
      "lat": 46.9285,
      "lon": -121.5039,
      "ap": "SEA",
      "icon": "🏔️",
      "rating": 4.7,
      "reviews": 980,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Powder Day"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "ikon"
    },
    {
      "id": "mt-bachelor",
      "category": "skiing",
      "title": "Mt. Bachelor",
      "location": "Oregon, USA",
      "lat": 43.9786,
      "lon": -121.6884,
      "ap": "PDX",
      "icon": "🏔️",
      "rating": 4.6,
      "reviews": 1120,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "ikon",
      "lateSeason": true
    },
    {
      "id": "sugar-bowl",
      "category": "skiing",
      "title": "Sugar Bowl",
      "location": "California, USA",
      "lat": 39.3082,
      "lon": -120.3322,
      "ap": "RNO",
      "icon": "🏔️",
      "rating": 4.5,
      "reviews": 580,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Powder Day"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "ikon"
    },
    {
      "id": "killington",
      "category": "skiing",
      "title": "Killington",
      "location": "Vermont, USA",
      "lat": 43.6045,
      "lon": -72.821,
      "ap": "BTV",
      "icon": "🏔️",
      "rating": 4.5,
      "reviews": 1640,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "ikon",
      "lateSeason": true
    },
    {
      "id": "loon-mountain",
      "category": "skiing",
      "title": "Loon Mountain",
      "location": "New Hampshire, USA",
      "lat": 44.0517,
      "lon": -71.6231,
      "ap": "BTV",
      "icon": "🏔️",
      "rating": 4.5,
      "reviews": 720,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "ikon"
    },
    {
      "id": "sunday-river",
      "category": "skiing",
      "title": "Sunday River",
      "location": "Maine, USA",
      "lat": 44.4717,
      "lon": -70.8569,
      "ap": "BOS",
      "icon": "🏔️",
      "rating": 4.5,
      "reviews": 880,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "ikon"
    },
    {
      "id": "sugarloaf",
      "category": "skiing",
      "title": "Sugarloaf",
      "location": "Maine, USA",
      "lat": 45.0317,
      "lon": -70.3133,
      "ap": "BOS",
      "icon": "🏔️",
      "rating": 4.6,
      "reviews": 690,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Powder Day"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "ikon",
      "lateSeason": true
    },
    {
      "id": "revelstoke",
      "category": "skiing",
      "title": "Revelstoke Mountain",
      "location": "British Columbia, Canada",
      "lat": 51.0021,
      "lon": -118.1958,
      "ap": "YKA",
      "icon": "🏔️",
      "rating": 4.8,
      "reviews": 940,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Powder Day"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "ikon",
      "lateSeason": true
    },
    {
      "id": "lake-louise",
      "category": "skiing",
      "title": "Lake Louise",
      "location": "Alberta, Canada",
      "lat": 51.4419,
      "lon": -116.1656,
      "ap": "YYC",
      "icon": "🏔️",
      "rating": 4.8,
      "reviews": 1880,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Powder Day",
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "ikon",
      "lateSeason": true
    },
    {
      "id": "cypress-mountain",
      "category": "skiing",
      "title": "Cypress Mountain",
      "location": "British Columbia, Canada",
      "lat": 49.3953,
      "lon": -123.2058,
      "ap": "YVR",
      "icon": "🏔️",
      "rating": 4.3,
      "reviews": 510,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "ikon"
    },
    {
      "id": "zermatt",
      "category": "skiing",
      "title": "Zermatt",
      "location": "Valais, Switzerland",
      "lat": 46.0207,
      "lon": 7.7491,
      "ap": "GVA",
      "icon": "🏔️",
      "rating": 4.9,
      "reviews": 3120,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Iconic",
        "Late Season"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "ikon",
      "lateSeason": true
    },
    {
      "id": "engelberg",
      "category": "skiing",
      "title": "Engelberg-Titlis",
      "location": "Central Switzerland",
      "lat": 46.8189,
      "lon": 8.4006,
      "ap": "ZRH",
      "icon": "🏔️",
      "rating": 4.6,
      "reviews": 1240,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Powder Day"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "ikon",
      "lateSeason": true
    },
    {
      "id": "crans-montana",
      "category": "skiing",
      "title": "Crans-Montana",
      "location": "Valais, Switzerland",
      "lat": 46.3167,
      "lon": 7.4833,
      "ap": "GVA",
      "icon": "🏔️",
      "rating": 4.5,
      "reviews": 690,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "ikon",
      "lateSeason": true
    },
    {
      "id": "st-anton-am-arlberg",
      "category": "skiing",
      "title": "St. Anton am Arlberg",
      "location": "Tyrol, Austria",
      "lat": 47.1306,
      "lon": 10.2658,
      "ap": "INN",
      "icon": "🏔️",
      "rating": 4.8,
      "reviews": 1980,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Powder Day"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "ikon"
    },
    {
      "id": "saalbach-hinterglemm",
      "category": "skiing",
      "title": "Saalbach Hinterglemm",
      "location": "Salzburg, Austria",
      "lat": 47.3953,
      "lon": 12.6347,
      "ap": "SZG",
      "icon": "🏔️",
      "rating": 4.6,
      "reviews": 1120,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "ikon"
    },
    {
      "id": "hakuba-happo-one",
      "category": "skiing",
      "title": "Hakuba Happo-One",
      "location": "Nagano, Japan",
      "lat": 36.7,
      "lon": 137.8333,
      "ap": "NRT",
      "icon": "🏔️",
      "rating": 4.7,
      "reviews": 1340,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Powder Day"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "ikon"
    },
    {
      "id": "furano",
      "category": "skiing",
      "title": "Furano",
      "location": "Hokkaido, Japan",
      "lat": 43.35,
      "lon": 142.3833,
      "ap": "CTS",
      "icon": "🏔️",
      "rating": 4.6,
      "reviews": 820,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Powder Day"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "ikon"
    },
    {
      "id": "coronet-peak",
      "category": "skiing",
      "title": "Coronet Peak",
      "location": "Queenstown, New Zealand",
      "lat": -44.9333,
      "lon": 168.7333,
      "ap": "ZQN",
      "icon": "🏔️",
      "rating": 4.5,
      "reviews": 620,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "ikon",
      "lateSeason": true
    },
    {
      "id": "valle-nevado",
      "category": "skiing",
      "title": "Valle Nevado",
      "location": "Andes, Chile",
      "lat": -33.3525,
      "lon": -70.2517,
      "ap": "SCL",
      "icon": "🏔️",
      "rating": 4.5,
      "reviews": 540,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Powder Day"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "ikon"
    },
  // ── Epic Pass batch (added 2026-06-08) ──
    {
      "id": "beaver-creek",
      "category": "skiing",
      "title": "Beaver Creek",
      "location": "Colorado, USA",
      "lat": 39.6042,
      "lon": -106.5167,
      "ap": "EGE",
      "icon": "🏔️",
      "rating": 4.8,
      "reviews": 2160,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Family Friendly",
        "Powder Day"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "epic",
      "lateSeason": true
    },
    {
      "id": "park-city-mountain",
      "category": "skiing",
      "title": "Park City Mountain",
      "location": "Park City, Utah, USA",
      "lat": 40.6514,
      "lon": -111.5083,
      "ap": "SLC",
      "icon": "🏔️",
      "rating": 4.7,
      "reviews": 3120,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "All Levels",
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "epic",
      "lateSeason": true
    },
    {
      "id": "northstar-california",
      "category": "skiing",
      "title": "Northstar California",
      "location": "Truckee, California, USA",
      "lat": 39.2747,
      "lon": -120.1211,
      "ap": "RNO",
      "icon": "🏔️",
      "rating": 4.6,
      "reviews": 1840,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "epic"
    },
    {
      "id": "kirkwood",
      "category": "skiing",
      "title": "Kirkwood",
      "location": "California, USA",
      "lat": 38.685,
      "lon": -120.0656,
      "ap": "RNO",
      "icon": "🏔️",
      "rating": 4.7,
      "reviews": 980,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Powder Day"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "epic"
    },
    {
      "id": "stevens-pass",
      "category": "skiing",
      "title": "Stevens Pass",
      "location": "Washington, USA",
      "lat": 47.7461,
      "lon": -121.0867,
      "ap": "SEA",
      "icon": "🏔️",
      "rating": 4.5,
      "reviews": 840,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "epic"
    },
    {
      "id": "mount-snow",
      "category": "skiing",
      "title": "Mount Snow",
      "location": "Vermont, USA",
      "lat": 42.9628,
      "lon": -72.9211,
      "ap": "ALB",
      "icon": "🏔️",
      "rating": 4.4,
      "reviews": 1240,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "epic"
    },
    {
      "id": "hunter-mountain",
      "category": "skiing",
      "title": "Hunter Mountain",
      "location": "New York, USA",
      "lat": 42.1947,
      "lon": -74.2233,
      "ap": "ALB",
      "icon": "🏔️",
      "rating": 4.3,
      "reviews": 1640,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "epic"
    },
    {
      "id": "mt-sunapee",
      "category": "skiing",
      "title": "Mt. Sunapee",
      "location": "New Hampshire, USA",
      "lat": 43.3261,
      "lon": -72.0786,
      "ap": "BTV",
      "icon": "🏔️",
      "rating": 4.5,
      "reviews": 640,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "epic"
    },
    {
      "id": "wilmot-mountain",
      "category": "skiing",
      "title": "Wilmot Mountain",
      "location": "Wisconsin, USA",
      "lat": 42.4992,
      "lon": -88.1839,
      "ap": "ORD",
      "icon": "🏔️",
      "rating": 4.1,
      "reviews": 540,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "epic"
    },
    {
      "id": "afton-alps",
      "category": "skiing",
      "title": "Afton Alps",
      "location": "Minnesota, USA",
      "lat": 44.8453,
      "lon": -92.7842,
      "ap": "MSP",
      "icon": "🏔️",
      "rating": 4.2,
      "reviews": 720,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "epic"
    },
    {
      "id": "mad-river-mountain-oh",
      "category": "skiing",
      "title": "Mad River Mountain",
      "location": "Ohio, USA",
      "lat": 40.4514,
      "lon": -83.6722,
      "ap": "CMH",
      "icon": "🏔️",
      "rating": 4,
      "reviews": 380,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "epic"
    },
    {
      "id": "liberty-mountain",
      "category": "skiing",
      "title": "Liberty Mountain",
      "location": "Pennsylvania, USA",
      "lat": 39.7392,
      "lon": -77.3672,
      "ap": "PHL",
      "icon": "🏔️",
      "rating": 4.2,
      "reviews": 560,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "epic"
    },
    {
      "id": "roundtop-mountain",
      "category": "skiing",
      "title": "Roundtop Mountain",
      "location": "Pennsylvania, USA",
      "lat": 40.1306,
      "lon": -76.9333,
      "ap": "PHL",
      "icon": "🏔️",
      "rating": 4,
      "reviews": 410,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "epic"
    },
    {
      "id": "whitetail-resort",
      "category": "skiing",
      "title": "Whitetail Resort",
      "location": "Pennsylvania, USA",
      "lat": 39.7547,
      "lon": -77.9072,
      "ap": "PHL",
      "icon": "🏔️",
      "rating": 4.2,
      "reviews": 480,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "epic"
    },
    {
      "id": "jack-frost",
      "category": "skiing",
      "title": "Jack Frost Big Boulder",
      "location": "Pennsylvania, USA",
      "lat": 41.1311,
      "lon": -75.5336,
      "ap": "PHL",
      "icon": "🏔️",
      "rating": 4.1,
      "reviews": 520,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "epic"
    },
    {
      "id": "fernie",
      "category": "skiing",
      "title": "Fernie Alpine Resort",
      "location": "British Columbia, Canada",
      "lat": 49.4642,
      "lon": -115.0867,
      "ap": "YYC",
      "icon": "🏔️",
      "rating": 4.7,
      "reviews": 1180,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Powder Day"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "epic",
      "lateSeason": true
    },
    {
      "id": "kimberley",
      "category": "skiing",
      "title": "Kimberley Alpine Resort",
      "location": "British Columbia, Canada",
      "lat": 49.675,
      "lon": -116.0306,
      "ap": "YYC",
      "icon": "🏔️",
      "rating": 4.5,
      "reviews": 540,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "epic",
      "lateSeason": true
    },
    {
      "id": "nakiska",
      "category": "skiing",
      "title": "Nakiska",
      "location": "Kananaskis, Alberta, Canada",
      "lat": 50.9286,
      "lon": -115.1456,
      "ap": "YYC",
      "icon": "🏔️",
      "rating": 4.3,
      "reviews": 420,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "epic",
      "lateSeason": true
    },
    {
      "id": "verbier",
      "category": "skiing",
      "title": "Verbier 4 Vallées",
      "location": "Valais, Switzerland",
      "lat": 46.0972,
      "lon": 7.2289,
      "ap": "GVA",
      "icon": "🏔️",
      "rating": 4.8,
      "reviews": 2340,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Off-Piste",
        "Late Season"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "epic",
      "lateSeason": true
    },
    {
      "id": "val-thorens",
      "category": "skiing",
      "title": "Val Thorens",
      "location": "Les 3 Vallées, France",
      "lat": 45.2986,
      "lon": 6.5803,
      "ap": "CMF",
      "icon": "🏔️",
      "rating": 4.7,
      "reviews": 2840,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "Late Season"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "epic",
      "lateSeason": true
    },
    {
      "id": "meribel",
      "category": "skiing",
      "title": "Méribel",
      "location": "Les 3 Vallées, France",
      "lat": 45.3953,
      "lon": 6.5678,
      "ap": "CMF",
      "icon": "🏔️",
      "rating": 4.7,
      "reviews": 1860,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "epic",
      "lateSeason": true
    },
    {
      "id": "les-menuires",
      "category": "skiing",
      "title": "Les Menuires",
      "location": "Les 3 Vallées, France",
      "lat": 45.3239,
      "lon": 6.5331,
      "ap": "CMF",
      "icon": "🏔️",
      "rating": 4.5,
      "reviews": 1240,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
      "skiPass": "epic",
      "lateSeason": true
    },
    {
      "id": "perisher",
      "category": "skiing",
      "title": "Perisher",
      "location": "New South Wales, Australia",
      "lat": -36.4042,
      "lon": 148.4111,
      "ap": "SYD",
      "icon": "🏔️",
      "rating": 4.4,
      "reviews": 780,
      "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
      "accent": "#6db3f2",
      "tags": [
        "All Levels"
      ],
      "photo": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "skiPass": "epic"
    },
  // ── Global beach batch (added 2026-06-08) ──
    {
      "id": "meads-bay-anguilla",
      "category": "beach",
      "title": "Meads Bay",
      "location": "Anguilla",
      "lat": 18.1853,
      "lon": -63.1031,
      "ap": "AXA",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 400,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Powdery White Sand",
        "Calm Waters"
      ],
      "photo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    },
    {
      "id": "maundays-bay-anguilla",
      "category": "beach",
      "title": "Maundays Bay",
      "location": "Anguilla",
      "lat": 18.1719,
      "lon": -63.1483,
      "ap": "AXA",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 437,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Crystal Water",
        "St-Barths Vibes"
      ],
      "photo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
      "id": "crane-beach-barbados",
      "category": "beach",
      "title": "Crane Beach",
      "location": "Barbados",
      "lat": 13.1058,
      "lon": -59.4528,
      "ap": "BGI",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 474,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Pink Sand",
        "Coral Cliffs"
      ],
      "photo": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop"
    },
    {
      "id": "mullins-beach-barbados",
      "category": "beach",
      "title": "Mullins Beach",
      "location": "Barbados",
      "lat": 13.2386,
      "lon": -59.6442,
      "ap": "BGI",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 511,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Calm North Coast",
        "Beach Bars"
      ],
      "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
    },
    {
      "id": "bathsheba-barbados",
      "category": "beach",
      "title": "Bathsheba",
      "location": "Barbados",
      "lat": 13.2122,
      "lon": -59.5219,
      "ap": "BGI",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 548,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Surf Breaks",
        "Sea Cave Coves"
      ],
      "photo": "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop"
    },
    {
      "id": "smith-cove-grand-cayman",
      "category": "beach",
      "title": "Smith Cove",
      "location": "Grand Cayman, Cayman Islands",
      "lat": 19.2658,
      "lon": -81.395,
      "ap": "GCM",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 585,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Snorkeling",
        "Calm Bay"
      ],
      "photo": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      "id": "stingray-sandbar-cayman",
      "category": "beach",
      "title": "Stingray City Sandbar",
      "location": "Grand Cayman",
      "lat": 19.3736,
      "lon": -81.325,
      "ap": "GCM",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 622,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Wildlife Everywhere",
        "Shallow Clear Water"
      ],
      "photo": "https://images.unsplash.com/photo-1502117859338-fd9daa518a9a?w=800&h=600&fit=crop"
    },
    {
      "id": "bambarra-beach-tci",
      "category": "beach",
      "title": "Bambarra Beach",
      "location": "Middle Caicos, Turks & Caicos",
      "lat": 21.77,
      "lon": -71.79,
      "ap": "PLS",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 659,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Uncrowded",
        "Turquoise Water"
      ],
      "photo": "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&h=600&fit=crop"
    },
    {
      "id": "long-bay-providenciales",
      "category": "beach",
      "title": "Long Bay Beach",
      "location": "Providenciales, Turks & Caicos",
      "lat": 21.7556,
      "lon": -72.1986,
      "ap": "PLS",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 696,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Kiteboarding Capital",
        "Shallow Clear Water"
      ],
      "photo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    },
    {
      "id": "trunk-bay-st-john",
      "category": "beach",
      "title": "Trunk Bay",
      "location": "St. John, USVI",
      "lat": 18.3528,
      "lon": -64.7592,
      "ap": "STT",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 733,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Snorkeling Reef",
        "Voted #1 USA Beach"
      ],
      "photo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
      "id": "honeymoon-beach-stj",
      "category": "beach",
      "title": "Honeymoon Beach",
      "location": "St. John, USVI",
      "lat": 18.3358,
      "lon": -64.7836,
      "ap": "STT",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 770,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Calm Waters",
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop"
    },
    {
      "id": "boston-bay-jamaica",
      "category": "beach",
      "title": "Boston Bay",
      "location": "Port Antonio, Jamaica",
      "lat": 18.1717,
      "lon": -76.3358,
      "ap": "MBJ",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 807,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Surf Breaks",
        "Caribbean Soul"
      ],
      "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
    },
    {
      "id": "treasure-beach-jamaica",
      "category": "beach",
      "title": "Treasure Beach",
      "location": "St. Elizabeth, Jamaica",
      "lat": 17.8867,
      "lon": -77.7847,
      "ap": "MBJ",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 844,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Fishing Village Vibe",
        "Uncrowded"
      ],
      "photo": "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop"
    },
    {
      "id": "baby-beach-aruba",
      "category": "beach",
      "title": "Baby Beach",
      "location": "Aruba",
      "lat": 12.4275,
      "lon": -69.8794,
      "ap": "AUA",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 881,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Calm Bay",
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      "id": "arashi-beach-aruba",
      "category": "beach",
      "title": "Arashi Beach",
      "location": "Aruba",
      "lat": 12.58,
      "lon": -70.0533,
      "ap": "AUA",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 918,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Calm Waters",
        "Snorkeling"
      ],
      "photo": "https://images.unsplash.com/photo-1502117859338-fd9daa518a9a?w=800&h=600&fit=crop"
    },
    {
      "id": "sugar-beach-st-lucia",
      "category": "beach",
      "title": "Sugar Beach",
      "location": "St. Lucia",
      "lat": 13.8439,
      "lon": -61.0653,
      "ap": "UVF",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 955,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Piton Views",
        "Luxury"
      ],
      "photo": "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&h=600&fit=crop"
    },
    {
      "id": "reduit-beach-st-lucia",
      "category": "beach",
      "title": "Reduit Beach",
      "location": "Rodney Bay, St. Lucia",
      "lat": 14.0697,
      "lon": -60.955,
      "ap": "UVF",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 992,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Beach Bars",
        "Calm Waters"
      ],
      "photo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    },
    {
      "id": "mullet-bay-sxm",
      "category": "beach",
      "title": "Mullet Bay",
      "location": "Sint Maarten",
      "lat": 18.0489,
      "lon": -63.1281,
      "ap": "SXM",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 1029,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Calm Waters",
        "White Sand"
      ],
      "photo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
      "id": "maho-beach-sxm",
      "category": "beach",
      "title": "Maho Beach",
      "location": "Sint Maarten",
      "lat": 18.0392,
      "lon": -63.1136,
      "ap": "SXM",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 1066,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Iconic",
        "Plane Spotting"
      ],
      "photo": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop"
    },
    {
      "id": "simpson-bay-sxm",
      "category": "beach",
      "title": "Simpson Bay",
      "location": "Sint Maarten",
      "lat": 18.0344,
      "lon": -63.1058,
      "ap": "SXM",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 1103,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Beach Bars",
        "Calm Waters"
      ],
      "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
    },
    {
      "id": "pirates-bay-tobago",
      "category": "beach",
      "title": "Pirate's Bay",
      "location": "Charlotteville, Tobago",
      "lat": 11.3194,
      "lon": -60.5536,
      "ap": "TAB",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 1140,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Secluded Beach",
        "Snorkeling Reef"
      ],
      "photo": "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop"
    },
    {
      "id": "englishmans-bay-tobago",
      "category": "beach",
      "title": "Englishman's Bay",
      "location": "Tobago",
      "lat": 11.3,
      "lon": -60.6614,
      "ap": "TAB",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 1177,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Crescent Bay",
        "Uncrowded"
      ],
      "photo": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      "id": "playa-maroma-mexico",
      "category": "beach",
      "title": "Playa Maroma",
      "location": "Riviera Maya, Mexico",
      "lat": 20.7244,
      "lon": -86.9764,
      "ap": "CUN",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 1214,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Crystal Caribbean",
        "White Sand"
      ],
      "photo": "https://images.unsplash.com/photo-1502117859338-fd9daa518a9a?w=800&h=600&fit=crop"
    },
    {
      "id": "akumal-bay-mexico",
      "category": "beach",
      "title": "Akumal Bay",
      "location": "Quintana Roo, Mexico",
      "lat": 20.3962,
      "lon": -87.3178,
      "ap": "CUN",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 1251,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Sea Turtle Nesting",
        "Snorkeling Reef"
      ],
      "photo": "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&h=600&fit=crop"
    },
    {
      "id": "isla-mujeres-norte",
      "category": "beach",
      "title": "Playa Norte Isla Mujeres",
      "location": "Quintana Roo, Mexico",
      "lat": 21.2483,
      "lon": -86.7406,
      "ap": "CUN",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 1288,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Calm Waters",
        "Crystal Caribbean"
      ],
      "photo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    },
    {
      "id": "playa-paraiso-tulum",
      "category": "beach",
      "title": "Playa Paraiso Tulum",
      "location": "Tulum, Mexico",
      "lat": 20.2147,
      "lon": -87.4253,
      "ap": "CUN",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 1325,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Mayan Ruins Backdrop",
        "White Sand"
      ],
      "photo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
      "id": "xpu-ha-beach",
      "category": "beach",
      "title": "Xpu-Ha Beach",
      "location": "Quintana Roo, Mexico",
      "lat": 20.4972,
      "lon": -87.2378,
      "ap": "CUN",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 1362,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Crystal Caribbean",
        "Calm Bay"
      ],
      "photo": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop"
    },
    {
      "id": "punta-mita-mexico",
      "category": "beach",
      "title": "Punta Mita Beach",
      "location": "Nayarit, Mexico",
      "lat": 20.7706,
      "lon": -105.55,
      "ap": "PVR",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 1399,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Surf Breaks",
        "Luxury"
      ],
      "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
    },
    {
      "id": "san-pancho-mexico",
      "category": "beach",
      "title": "San Pancho",
      "location": "Nayarit, Mexico",
      "lat": 20.9039,
      "lon": -105.4664,
      "ap": "PVR",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 1436,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Bohemian Beach Town",
        "Sunset West-Facing"
      ],
      "photo": "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop"
    },
    {
      "id": "mazunte-mexico",
      "category": "beach",
      "title": "Mazunte",
      "location": "Oaxaca, Mexico",
      "lat": 15.6678,
      "lon": -96.55,
      "ap": "HUX",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 1473,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Sea Turtle Nesting",
        "Bohemian Beach Town"
      ],
      "photo": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      "id": "zipolite-mexico",
      "category": "beach",
      "title": "Zipolite",
      "location": "Oaxaca, Mexico",
      "lat": 15.6647,
      "lon": -96.5147,
      "ap": "HUX",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 1510,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Naturist Area",
        "Surf Breaks"
      ],
      "photo": "https://images.unsplash.com/photo-1502117859338-fd9daa518a9a?w=800&h=600&fit=crop"
    },
    {
      "id": "cabo-pulmo",
      "category": "beach",
      "title": "Cabo Pulmo",
      "location": "Baja California Sur, Mexico",
      "lat": 23.4283,
      "lon": -109.4244,
      "ap": "SJD",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 1547,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Coral Reef",
        "Snorkeling Reef"
      ],
      "photo": "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&h=600&fit=crop"
    },
    {
      "id": "tamarindo-cr",
      "category": "beach",
      "title": "Tamarindo Beach",
      "location": "Guanacaste, Costa Rica",
      "lat": 10.3022,
      "lon": -85.8408,
      "ap": "SJO",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 1584,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Surf Breaks",
        "Beach Bars"
      ],
      "photo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    },
    {
      "id": "santa-teresa-cr",
      "category": "beach",
      "title": "Santa Teresa",
      "location": "Puntarenas, Costa Rica",
      "lat": 9.6431,
      "lon": -85.1614,
      "ap": "SJO",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 1621,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Surf Breaks",
        "Yoga on the Sand"
      ],
      "photo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
      "id": "hanauma-bay-oahu",
      "category": "beach",
      "title": "Hanauma Bay",
      "location": "Oahu, Hawaii",
      "lat": 21.2693,
      "lon": -157.6938,
      "ap": "HNL",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 1658,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Snorkeling Reef",
        "Marine Preserve"
      ],
      "photo": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop"
    },
    {
      "id": "waimea-bay-oahu",
      "category": "beach",
      "title": "Waimea Bay",
      "location": "North Shore Oahu, Hawaii",
      "lat": 21.6411,
      "lon": -158.0656,
      "ap": "HNL",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 1695,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Surf Breaks",
        "Iconic"
      ],
      "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
    },
    {
      "id": "makena-big-beach",
      "category": "beach",
      "title": "Makena Big Beach",
      "location": "Maui, Hawaii",
      "lat": 20.6353,
      "lon": -156.4453,
      "ap": "OGG",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 1732,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Golden Sand",
        "Pacific Bluffs"
      ],
      "photo": "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop"
    },
    {
      "id": "wailea-beach-maui",
      "category": "beach",
      "title": "Wailea Beach",
      "location": "Maui, Hawaii",
      "lat": 20.6892,
      "lon": -156.4439,
      "ap": "OGG",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 1769,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Luxury",
        "Calm Pacific"
      ],
      "photo": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      "id": "kaanapali-beach-maui",
      "category": "beach",
      "title": "Ka'anapali Beach",
      "location": "Maui, Hawaii",
      "lat": 20.9244,
      "lon": -156.6936,
      "ap": "OGG",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 1806,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Cliff Dive",
        "Sunset West-Facing"
      ],
      "photo": "https://images.unsplash.com/photo-1502117859338-fd9daa518a9a?w=800&h=600&fit=crop"
    },
    {
      "id": "coronado-beach-sd",
      "category": "beach",
      "title": "Coronado Beach",
      "location": "San Diego, California",
      "lat": 32.685,
      "lon": -117.1839,
      "ap": "SAN",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 1843,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Pacific Bluffs",
        "Hotel del Coronado"
      ],
      "photo": "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&h=600&fit=crop"
    },
    {
      "id": "la-jolla-cove",
      "category": "beach",
      "title": "La Jolla Cove",
      "location": "San Diego, California",
      "lat": 32.8508,
      "lon": -117.2719,
      "ap": "SAN",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 1880,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Snorkeling Coves",
        "Sea Lions"
      ],
      "photo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    },
    {
      "id": "manhattan-beach-ca",
      "category": "beach",
      "title": "Manhattan Beach",
      "location": "Los Angeles, California",
      "lat": 33.8847,
      "lon": -118.4109,
      "ap": "LAX",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 1917,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Pier 60 Sunsets",
        "Beach Volleyball"
      ],
      "photo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
      "id": "big-sur-pfeiffer",
      "category": "beach",
      "title": "Pfeiffer Beach Big Sur",
      "location": "California, USA",
      "lat": 36.2378,
      "lon": -121.8175,
      "ap": "SFO",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 1954,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Purple Sand",
        "Sea Cave Coves"
      ],
      "photo": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop"
    },
    {
      "id": "cala-goloritze-sardinia",
      "category": "beach",
      "title": "Cala Goloritzé",
      "location": "Sardinia, Italy",
      "lat": 40.1119,
      "lon": 9.67,
      "ap": "CAG",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 1991,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Limestone Cliffs",
        "Crystal Sea"
      ],
      "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
    },
    {
      "id": "spiaggia-rosa-budelli",
      "category": "beach",
      "title": "Spiaggia Rosa Budelli",
      "location": "Sardinia, Italy",
      "lat": 41.2944,
      "lon": 9.3458,
      "ap": "CAG",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 2028,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Pink Sand",
        "UNESCO Protected"
      ],
      "photo": "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop"
    },
    {
      "id": "costa-smeralda-sardinia",
      "category": "beach",
      "title": "Costa Smeralda",
      "location": "Sardinia, Italy",
      "lat": 41.1056,
      "lon": 9.535,
      "ap": "CAG",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 2065,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Billionaire Yachts",
        "Crystal Sea"
      ],
      "photo": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      "id": "capri-marina-piccola",
      "category": "beach",
      "title": "Capri Marina Piccola",
      "location": "Capri, Italy",
      "lat": 40.5447,
      "lon": 14.2342,
      "ap": "NAP",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 2102,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Faraglioni Rocks",
        "Iconic"
      ],
      "photo": "https://images.unsplash.com/photo-1502117859338-fd9daa518a9a?w=800&h=600&fit=crop"
    },
    {
      "id": "procida-italy",
      "category": "beach",
      "title": "Procida Pozzo Vecchio",
      "location": "Procida, Italy",
      "lat": 40.7556,
      "lon": 14.0306,
      "ap": "NAP",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 2139,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Pastel Houses",
        "Crystal Sea"
      ],
      "photo": "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&h=600&fit=crop"
    },
    {
      "id": "amalfi-beach",
      "category": "beach",
      "title": "Amalfi Town Beach",
      "location": "Amalfi Coast, Italy",
      "lat": 40.6342,
      "lon": 14.6022,
      "ap": "NAP",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 2176,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Amalfi Drive",
        "Pastel Cliff Town"
      ],
      "photo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    },
    {
      "id": "scala-dei-turchi-sicily",
      "category": "beach",
      "title": "Scala dei Turchi",
      "location": "Agrigento, Sicily",
      "lat": 37.2914,
      "lon": 13.4683,
      "ap": "TPS",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 2213,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "White Marl Cliffs",
        "Iconic"
      ],
      "photo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
      "id": "plage-mala-cap-dail",
      "category": "beach",
      "title": "Plage Mala Cap d'Ail",
      "location": "French Riviera, France",
      "lat": 43.7275,
      "lon": 7.4067,
      "ap": "NCE",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 2250,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Hidden Cove",
        "Crystal Sea"
      ],
      "photo": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop"
    },
    {
      "id": "eze-beach-france",
      "category": "beach",
      "title": "Eze Beach",
      "location": "French Riviera, France",
      "lat": 43.7281,
      "lon": 7.3622,
      "ap": "NCE",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 2287,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Belle Époque",
        "Calm Waters"
      ],
      "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
    },
    {
      "id": "pointe-st-hospice",
      "category": "beach",
      "title": "Pointe Saint-Hospice",
      "location": "Saint-Jean-Cap-Ferrat",
      "lat": 43.68,
      "lon": 7.3408,
      "ap": "NCE",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 2324,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Pine Forest Path",
        "Calm Waters"
      ],
      "photo": "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop"
    },
    {
      "id": "cala-salada-ibiza",
      "category": "beach",
      "title": "Cala Salada Ibiza",
      "location": "Ibiza, Spain",
      "lat": 38.9783,
      "lon": 1.2375,
      "ap": "IBZ",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 2361,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Pine-Lined Cove",
        "Crystal Sea"
      ],
      "photo": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      "id": "cala-comte-ibiza",
      "category": "beach",
      "title": "Cala Comte Ibiza",
      "location": "Ibiza, Spain",
      "lat": 38.9614,
      "lon": 1.2161,
      "ap": "IBZ",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 2398,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Legendary Sunsets",
        "Crystal Sea"
      ],
      "photo": "https://images.unsplash.com/photo-1502117859338-fd9daa518a9a?w=800&h=600&fit=crop"
    },
    {
      "id": "cala-bassa-ibiza",
      "category": "beach",
      "title": "Cala Bassa Ibiza",
      "location": "Ibiza, Spain",
      "lat": 38.9569,
      "lon": 1.2547,
      "ap": "IBZ",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 2435,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Pine-Lined Cove",
        "Calm Waters"
      ],
      "photo": "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&h=600&fit=crop"
    },
    {
      "id": "cala-pregonda-menorca",
      "category": "beach",
      "title": "Cala Pregonda",
      "location": "Menorca, Spain",
      "lat": 40.0517,
      "lon": 4.0911,
      "ap": "MAH",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 2472,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Red Volcanic Sand",
        "Uncrowded"
      ],
      "photo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    },
    {
      "id": "cala-mitjana-menorca",
      "category": "beach",
      "title": "Cala Mitjana",
      "location": "Menorca, Spain",
      "lat": 39.9275,
      "lon": 4.0078,
      "ap": "MAH",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 2509,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Limestone Cliffs",
        "Turquoise Water"
      ],
      "photo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
      "id": "cala-saona-formentera",
      "category": "beach",
      "title": "Cala Saona Formentera",
      "location": "Formentera, Spain",
      "lat": 38.7022,
      "lon": 1.4011,
      "ap": "IBZ",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 2546,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Sunset West-Facing",
        "Calm Waters"
      ],
      "photo": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop"
    },
    {
      "id": "ses-illetes-formentera",
      "category": "beach",
      "title": "Ses Illetes Formentera",
      "location": "Formentera, Spain",
      "lat": 38.7517,
      "lon": 1.4233,
      "ap": "IBZ",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 2583,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "World's Finest Sand",
        "Crystal Sea"
      ],
      "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
    },
    {
      "id": "cala-mondrago-mallorca",
      "category": "beach",
      "title": "Cala Mondragó",
      "location": "Mallorca, Spain",
      "lat": 39.35,
      "lon": 3.19,
      "ap": "PMI",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 2620,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Natural Park Beach",
        "Pine Forest"
      ],
      "photo": "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop"
    },
    {
      "id": "cala-tuent-mallorca",
      "category": "beach",
      "title": "Cala Tuent Mallorca",
      "location": "Mallorca, Spain",
      "lat": 39.8472,
      "lon": 2.7853,
      "ap": "PMI",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 2657,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Tramuntana Cliffs",
        "Uncrowded"
      ],
      "photo": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      "id": "praia-do-carvalho-algarve",
      "category": "beach",
      "title": "Praia do Carvalho",
      "location": "Algarve, Portugal",
      "lat": 37.0902,
      "lon": -8.5256,
      "ap": "FAO",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 2694,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Sea Cave Access",
        "Limestone Cliffs"
      ],
      "photo": "https://images.unsplash.com/photo-1502117859338-fd9daa518a9a?w=800&h=600&fit=crop"
    },
    {
      "id": "praia-da-falesia-algarve",
      "category": "beach",
      "title": "Praia da Falésia",
      "location": "Algarve, Portugal",
      "lat": 37.0822,
      "lon": -8.17,
      "ap": "FAO",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 2731,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Red Cliffs",
        "6km Pristine Beach"
      ],
      "photo": "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&h=600&fit=crop"
    },
    {
      "id": "praia-da-rocha-algarve",
      "category": "beach",
      "title": "Praia da Rocha",
      "location": "Algarve, Portugal",
      "lat": 37.1167,
      "lon": -8.5375,
      "ap": "FAO",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 2768,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Limestone Cliffs",
        "Beach Bars"
      ],
      "photo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    },
    {
      "id": "stiniva-beach-vis",
      "category": "beach",
      "title": "Stiniva Beach",
      "location": "Vis Island, Croatia",
      "lat": 43.0367,
      "lon": 16.1322,
      "ap": "SPU",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 405,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Cliff-Locked Cove",
        "Iconic"
      ],
      "photo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
      "id": "punta-rata-brela",
      "category": "beach",
      "title": "Punta Rata Brela",
      "location": "Makarska, Croatia",
      "lat": 43.3656,
      "lon": 16.9189,
      "ap": "SPU",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 442,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Pine-Lined Cove",
        "Crystal Sea"
      ],
      "photo": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop"
    },
    {
      "id": "pasjaca-beach-croatia",
      "category": "beach",
      "title": "Pasjača Beach",
      "location": "Konavle, Croatia",
      "lat": 42.5275,
      "lon": 18.4528,
      "ap": "DBV",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 479,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Cliffside Stairs",
        "Hidden Cove"
      ],
      "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
    },
    {
      "id": "plaka-beach-naxos",
      "category": "beach",
      "title": "Plaka Beach Naxos",
      "location": "Naxos, Greece",
      "lat": 37.0364,
      "lon": 25.3725,
      "ap": "JNX",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 516,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "4km of Sand",
        "Dune-Backed"
      ],
      "photo": "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop"
    },
    {
      "id": "mikri-vigla-naxos",
      "category": "beach",
      "title": "Mikri Vigla Naxos",
      "location": "Naxos, Greece",
      "lat": 37.0072,
      "lon": 25.4131,
      "ap": "JNX",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 553,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Kitesurfing",
        "White Sand"
      ],
      "photo": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      "id": "tsambika-beach-rhodes",
      "category": "beach",
      "title": "Tsambika Beach",
      "location": "Rhodes, Greece",
      "lat": 36.2306,
      "lon": 28.1825,
      "ap": "RHO",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 590,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Monastery Backdrop",
        "Golden Sand"
      ],
      "photo": "https://images.unsplash.com/photo-1502117859338-fd9daa518a9a?w=800&h=600&fit=crop"
    },
    {
      "id": "firiplaka-milos",
      "category": "beach",
      "title": "Firiplaka Beach",
      "location": "Milos, Greece",
      "lat": 36.68,
      "lon": 24.4536,
      "ap": "MLO",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 627,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Volcanic Pumice",
        "Crystal Aegean"
      ],
      "photo": "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&h=600&fit=crop"
    },
    {
      "id": "amoudi-bay-santorini",
      "category": "beach",
      "title": "Amoudi Bay",
      "location": "Santorini, Greece",
      "lat": 36.4664,
      "lon": 25.3658,
      "ap": "JTR",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 664,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Caldera Views",
        "Cliffside Tavernas"
      ],
      "photo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    },
    {
      "id": "perissa-beach-santorini",
      "category": "beach",
      "title": "Perissa Beach",
      "location": "Santorini, Greece",
      "lat": 36.3539,
      "lon": 25.475,
      "ap": "JTR",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 701,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Black Volcanic Sand",
        "Beach Bars"
      ],
      "photo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
      "id": "super-paradise-mykonos",
      "category": "beach",
      "title": "Super Paradise Mykonos",
      "location": "Mykonos, Greece",
      "lat": 37.4047,
      "lon": 25.3372,
      "ap": "JMK",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 738,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Party Sunset",
        "See & Be Seen"
      ],
      "photo": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop"
    },
    {
      "id": "elia-beach-mykonos",
      "category": "beach",
      "title": "Elia Beach Mykonos",
      "location": "Mykonos, Greece",
      "lat": 37.44,
      "lon": 25.3997,
      "ap": "JMK",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 775,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Longest Beach",
        "Calm Waters"
      ],
      "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
    },
    {
      "id": "kaputas-beach-turkey",
      "category": "beach",
      "title": "Kaputaş Beach",
      "location": "Antalya, Turkey",
      "lat": 36.1944,
      "lon": 29.3536,
      "ap": "DLM",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 812,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Turquoise Cove",
        "Limestone Cliffs"
      ],
      "photo": "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop"
    },
    {
      "id": "iztuzu-beach-turkey",
      "category": "beach",
      "title": "İztuzu Beach",
      "location": "Dalyan, Turkey",
      "lat": 36.7869,
      "lon": 28.6175,
      "ap": "DLM",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 849,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Turtle Nesting",
        "4km of Sand"
      ],
      "photo": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      "id": "patong-beach-phuket",
      "category": "beach",
      "title": "Patong Beach",
      "location": "Phuket, Thailand",
      "lat": 7.9028,
      "lon": 98.2972,
      "ap": "HKT",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 886,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Non-Stop Party Beach",
        "Nightlife"
      ],
      "photo": "https://images.unsplash.com/photo-1502117859338-fd9daa518a9a?w=800&h=600&fit=crop"
    },
    {
      "id": "karon-beach-phuket",
      "category": "beach",
      "title": "Karon Beach",
      "location": "Phuket, Thailand",
      "lat": 7.8467,
      "lon": 98.295,
      "ap": "HKT",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 923,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Squeaky Sand",
        "Calm Waters"
      ],
      "photo": "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&h=600&fit=crop"
    },
    {
      "id": "kata-beach-phuket",
      "category": "beach",
      "title": "Kata Beach",
      "location": "Phuket, Thailand",
      "lat": 7.82,
      "lon": 98.2967,
      "ap": "HKT",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 960,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Family Friendly",
        "Surf Breaks"
      ],
      "photo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    },
    {
      "id": "freedom-beach-phuket",
      "category": "beach",
      "title": "Freedom Beach",
      "location": "Phuket, Thailand",
      "lat": 7.8531,
      "lon": 98.2625,
      "ap": "HKT",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 997,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Hidden Cove",
        "Crystal Water"
      ],
      "photo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
      "id": "nai-harn-phuket",
      "category": "beach",
      "title": "Nai Harn Beach",
      "location": "Phuket, Thailand",
      "lat": 7.7747,
      "lon": 98.3056,
      "ap": "HKT",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 1034,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Calm Bay",
        "Sunset West-Facing"
      ],
      "photo": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop"
    },
    {
      "id": "ao-nang-beach-krabi",
      "category": "beach",
      "title": "Ao Nang Beach",
      "location": "Krabi, Thailand",
      "lat": 8.0322,
      "lon": 98.8255,
      "ap": "KBV",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 1071,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Limestone Cliffs",
        "Long-Tail Boat Hub"
      ],
      "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
    },
    {
      "id": "phra-nang-beach-krabi",
      "category": "beach",
      "title": "Phra Nang Beach",
      "location": "Krabi, Thailand",
      "lat": 8,
      "lon": 98.8378,
      "ap": "KBV",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 1108,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Limestone Cliffs",
        "Crystal Water"
      ],
      "photo": "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop"
    },
    {
      "id": "lamai-beach-koh-samui",
      "category": "beach",
      "title": "Lamai Beach",
      "location": "Koh Samui, Thailand",
      "lat": 9.4744,
      "lon": 100.0517,
      "ap": "USM",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 1145,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Calmer Than Chaweng",
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      "id": "haad-rin-koh-phangan",
      "category": "beach",
      "title": "Haad Rin Beach",
      "location": "Koh Phangan, Thailand",
      "lat": 9.6722,
      "lon": 100.0644,
      "ap": "USM",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 1182,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Full Moon Parties",
        "Nightlife"
      ],
      "photo": "https://images.unsplash.com/photo-1502117859338-fd9daa518a9a?w=800&h=600&fit=crop"
    },
    {
      "id": "sao-beach-phu-quoc",
      "category": "beach",
      "title": "Sao Beach",
      "location": "Phu Quoc, Vietnam",
      "lat": 10.0322,
      "lon": 104.0436,
      "ap": "PQC",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 1219,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Powdery White Sand",
        "Calm Waters"
      ],
      "photo": "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&h=600&fit=crop"
    },
    {
      "id": "bai-khem-phu-quoc",
      "category": "beach",
      "title": "Bai Khem (Kem) Beach",
      "location": "Phu Quoc, Vietnam",
      "lat": 10.0383,
      "lon": 104.0289,
      "ap": "PQC",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 1256,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Powdery White Sand",
        "Crystal Water"
      ],
      "photo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    },
    {
      "id": "my-khe-beach-danang",
      "category": "beach",
      "title": "My Khe Beach",
      "location": "Da Nang, Vietnam",
      "lat": 16.0667,
      "lon": 108.2456,
      "ap": "DAD",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 1293,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "20km Coastline",
        "Surf Breaks"
      ],
      "photo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
      "id": "cua-dai-hoi-an",
      "category": "beach",
      "title": "Cua Dai Beach",
      "location": "Hoi An, Vietnam",
      "lat": 15.9067,
      "lon": 108.3878,
      "ap": "DAD",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 1330,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Hoi An Doorstep",
        "Calm Waters"
      ],
      "photo": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop"
    },
    {
      "id": "padang-padang-bali",
      "category": "beach",
      "title": "Padang Padang Beach",
      "location": "Bali, Indonesia",
      "lat": -8.8108,
      "lon": 115.1057,
      "ap": "DPS",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 1367,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Sea Cave Coves",
        "Surf Breaks"
      ],
      "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
    },
    {
      "id": "kuta-beach-bali",
      "category": "beach",
      "title": "Kuta Beach",
      "location": "Bali, Indonesia",
      "lat": -8.7194,
      "lon": 115.17,
      "ap": "DPS",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 1404,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Sunset West-Facing",
        "Surf Breaks"
      ],
      "photo": "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop"
    },
    {
      "id": "bingin-beach-bali",
      "category": "beach",
      "title": "Bingin Beach",
      "location": "Bali, Indonesia",
      "lat": -8.8053,
      "lon": 115.1322,
      "ap": "DPS",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 1441,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Reef Break",
        "Cliffside Cafes"
      ],
      "photo": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      "id": "dreamland-beach-bali",
      "category": "beach",
      "title": "Dreamland Beach",
      "location": "Bali, Indonesia",
      "lat": -8.7917,
      "lon": 115.1244,
      "ap": "DPS",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 1478,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Limestone Cliffs",
        "Surf Breaks"
      ],
      "photo": "https://images.unsplash.com/photo-1502117859338-fd9daa518a9a?w=800&h=600&fit=crop"
    },
    {
      "id": "tanjung-aan-lombok",
      "category": "beach",
      "title": "Tanjung Aan",
      "location": "Lombok, Indonesia",
      "lat": -8.8961,
      "lon": 116.3122,
      "ap": "LOP",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 1515,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Pepper Sand",
        "Twin Bays"
      ],
      "photo": "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&h=600&fit=crop"
    },
    {
      "id": "pink-beach-lombok",
      "category": "beach",
      "title": "Pink Beach Lombok",
      "location": "Lombok, Indonesia",
      "lat": -8.8919,
      "lon": 116.6042,
      "ap": "LOP",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 1552,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Pink Sand",
        "Snorkeling Reef"
      ],
      "photo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    },
    {
      "id": "nacpan-beach-palawan",
      "category": "beach",
      "title": "Nacpan Beach",
      "location": "El Nido, Palawan",
      "lat": 11.2917,
      "lon": 119.4042,
      "ap": "ENI",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 1589,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "4km of Sand",
        "Uncrowded"
      ],
      "photo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
      "id": "las-cabanas-elnido",
      "category": "beach",
      "title": "Las Cabanas Beach",
      "location": "El Nido, Palawan",
      "lat": 11.175,
      "lon": 119.3997,
      "ap": "ENI",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 1626,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Island-Hopping Hub",
        "Sunset West-Facing"
      ],
      "photo": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop"
    },
    {
      "id": "puka-shell-boracay",
      "category": "beach",
      "title": "Puka Shell Beach",
      "location": "Boracay, Philippines",
      "lat": 11.9839,
      "lon": 121.9203,
      "ap": "MPH",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 1663,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Puka Shells",
        "Uncrowded"
      ],
      "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
    },
    {
      "id": "diniwid-boracay",
      "category": "beach",
      "title": "Diniwid Beach",
      "location": "Boracay, Philippines",
      "lat": 11.9711,
      "lon": 121.9117,
      "ap": "MPH",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 1700,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Quiet Side",
        "Sunset West-Facing"
      ],
      "photo": "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop"
    },
    {
      "id": "unawatuna-sri-lanka",
      "category": "beach",
      "title": "Unawatuna Beach",
      "location": "Galle, Sri Lanka",
      "lat": 6.0103,
      "lon": 80.2497,
      "ap": "CMB",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 1737,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Crescent Bay",
        "Calm Waters"
      ],
      "photo": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      "id": "hikkaduwa-sri-lanka",
      "category": "beach",
      "title": "Hikkaduwa Beach",
      "location": "Sri Lanka",
      "lat": 6.1392,
      "lon": 80.1014,
      "ap": "CMB",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 1774,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Surf Breaks",
        "Coral Reef"
      ],
      "photo": "https://images.unsplash.com/photo-1502117859338-fd9daa518a9a?w=800&h=600&fit=crop"
    },
    {
      "id": "anjuna-beach-goa",
      "category": "beach",
      "title": "Anjuna Beach",
      "location": "Goa, India",
      "lat": 15.5736,
      "lon": 73.74,
      "ap": "GOI",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 1811,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Hippie Heritage",
        "Beach Bars"
      ],
      "photo": "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&h=600&fit=crop"
    },
    {
      "id": "calangute-beach-goa",
      "category": "beach",
      "title": "Calangute Beach",
      "location": "Goa, India",
      "lat": 15.5444,
      "lon": 73.7553,
      "ap": "GOI",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 1848,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Family Friendly",
        "Beach Shacks"
      ],
      "photo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    },
    {
      "id": "vagator-beach-goa",
      "category": "beach",
      "title": "Vagator Beach",
      "location": "Goa, India",
      "lat": 15.5972,
      "lon": 73.74,
      "ap": "GOI",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 1885,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Cliffside Views",
        "Bohemian Beach Town"
      ],
      "photo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
      "id": "veligandu-maldives",
      "category": "beach",
      "title": "Veligandu Island Beach",
      "location": "Maldives",
      "lat": 4.35,
      "lon": 72.795,
      "ap": "MLE",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 1922,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Overwater Bungalows",
        "Crystal Caribbean"
      ],
      "photo": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop"
    },
    {
      "id": "baros-island-maldives",
      "category": "beach",
      "title": "Baros Island Beach",
      "location": "Maldives",
      "lat": 4.2842,
      "lon": 73.4264,
      "ap": "MLE",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 1959,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Resort Island",
        "House Reef"
      ],
      "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
    },
    {
      "id": "qantab-beach-oman",
      "category": "beach",
      "title": "Qantab Beach",
      "location": "Muscat, Oman",
      "lat": 23.5642,
      "lon": 58.6311,
      "ap": "MCT",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 1996,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Calm Bay",
        "Desert Meets Sea"
      ],
      "photo": "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop"
    },
    {
      "id": "bondi-beach-sydney",
      "category": "beach",
      "title": "Bondi Beach",
      "location": "Sydney, Australia",
      "lat": -33.8908,
      "lon": 151.2742,
      "ap": "SYD",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 2033,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Iconic",
        "Coastal Walk"
      ],
      "photo": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      "id": "manly-beach-sydney",
      "category": "beach",
      "title": "Manly Beach",
      "location": "Sydney, Australia",
      "lat": -33.7969,
      "lon": 151.2856,
      "ap": "SYD",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 2070,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Ferry From CBD",
        "Surf Breaks"
      ],
      "photo": "https://images.unsplash.com/photo-1502117859338-fd9daa518a9a?w=800&h=600&fit=crop"
    },
    {
      "id": "bronte-beach-sydney",
      "category": "beach",
      "title": "Bronte Beach",
      "location": "Sydney, Australia",
      "lat": -33.9036,
      "lon": 151.2664,
      "ap": "SYD",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 2107,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Ocean Pool",
        "Local Vibe"
      ],
      "photo": "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&h=600&fit=crop"
    },
    {
      "id": "tamarama-sydney",
      "category": "beach",
      "title": "Tamarama Beach",
      "location": "Sydney, Australia",
      "lat": -33.8997,
      "lon": 151.2697,
      "ap": "SYD",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 2144,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Compact Cove",
        "Bronte Walk"
      ],
      "photo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    },
    {
      "id": "palm-beach-sydney",
      "category": "beach",
      "title": "Palm Beach",
      "location": "Sydney, Australia",
      "lat": -33.5961,
      "lon": 151.3253,
      "ap": "SYD",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 2181,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Headland Drives",
        "Lighthouse Walk"
      ],
      "photo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
      "id": "coogee-beach-sydney",
      "category": "beach",
      "title": "Coogee Beach",
      "location": "Sydney, Australia",
      "lat": -33.9203,
      "lon": 151.2581,
      "ap": "SYD",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 2218,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Family Friendly",
        "Ocean Pools"
      ],
      "photo": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop"
    },
    {
      "id": "hill-inlet-lookout",
      "category": "beach",
      "title": "Hill Inlet Lookout",
      "location": "Whitsundays, Australia",
      "lat": -20.2625,
      "lon": 149.0533,
      "ap": "PPP",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 2255,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Hill Inlet Swirl",
        "Iconic"
      ],
      "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
    },
    {
      "id": "langford-island-spit",
      "category": "beach",
      "title": "Langford Island Spit",
      "location": "Whitsundays, Australia",
      "lat": -20.1158,
      "lon": 148.8689,
      "ap": "PPP",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 2292,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Sandspit",
        "Snorkeling Reef"
      ],
      "photo": "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop"
    },
    {
      "id": "yasawa-fiji",
      "category": "beach",
      "title": "Yasawa Islands",
      "location": "Fiji",
      "lat": -16.8,
      "lon": 177.3667,
      "ap": "NAN",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 2329,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Castaway Vibe",
        "Crystal Water"
      ],
      "photo": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      "id": "mamanucas-fiji",
      "category": "beach",
      "title": "Mamanuca Islands",
      "location": "Fiji",
      "lat": -17.6667,
      "lon": 177.1167,
      "ap": "NAN",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 2366,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Reef Snorkeling",
        "Surf Breaks"
      ],
      "photo": "https://images.unsplash.com/photo-1502117859338-fd9daa518a9a?w=800&h=600&fit=crop"
    },
    {
      "id": "coral-coast-fiji",
      "category": "beach",
      "title": "Coral Coast",
      "location": "Fiji",
      "lat": -18.1722,
      "lon": 177.5667,
      "ap": "NAN",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 2403,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Coral Reef",
        "Family Resorts"
      ],
      "photo": "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&h=600&fit=crop"
    },
    {
      "id": "muri-beach-rarotonga",
      "category": "beach",
      "title": "Muri Beach",
      "location": "Rarotonga, Cook Islands",
      "lat": -21.2583,
      "lon": -159.7392,
      "ap": "AIT",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 2440,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Turquoise Lagoon",
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    },
    {
      "id": "trou-aux-biches-mauritius",
      "category": "beach",
      "title": "Trou aux Biches",
      "location": "Mauritius",
      "lat": -20.0344,
      "lon": 57.5478,
      "ap": "MRU",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 2477,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Turquoise Lagoon",
        "Family Friendly"
      ],
      "photo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
      "id": "le-morne-mauritius",
      "category": "beach",
      "title": "Le Morne Beach",
      "location": "Mauritius",
      "lat": -20.46,
      "lon": 57.3128,
      "ap": "MRU",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 2514,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "UNESCO Protected",
        "Kitesurfing"
      ],
      "photo": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop"
    },
    {
      "id": "flic-en-flac-mauritius",
      "category": "beach",
      "title": "Flic en Flac",
      "location": "Mauritius",
      "lat": -20.2839,
      "lon": 57.3631,
      "ap": "MRU",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 2551,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Sunset West-Facing",
        "Calm Lagoon"
      ],
      "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
    },
    {
      "id": "ile-aux-cerfs-mauritius",
      "category": "beach",
      "title": "Île aux Cerfs",
      "location": "Mauritius",
      "lat": -20.27,
      "lon": 57.7783,
      "ap": "MRU",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 2588,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Day Trip Island",
        "Crystal Lagoon"
      ],
      "photo": "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop"
    },
    {
      "id": "anse-georgette-praslin",
      "category": "beach",
      "title": "Anse Georgette",
      "location": "Praslin, Seychelles",
      "lat": -4.3167,
      "lon": 55.7,
      "ap": "PRI",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 2625,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Granite Boulders",
        "Quiet & Pristine"
      ],
      "photo": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      "id": "anse-volbert-praslin",
      "category": "beach",
      "title": "Anse Volbert",
      "location": "Praslin, Seychelles",
      "lat": -4.3147,
      "lon": 55.7392,
      "ap": "PRI",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 2662,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Long Curve",
        "Calm Waters"
      ],
      "photo": "https://images.unsplash.com/photo-1502117859338-fd9daa518a9a?w=800&h=600&fit=crop"
    },
    {
      "id": "beau-vallon-mahe",
      "category": "beach",
      "title": "Beau Vallon Beach",
      "location": "Mahé, Seychelles",
      "lat": -4.62,
      "lon": 55.4297,
      "ap": "SEZ",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 2699,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Sunset West-Facing",
        "Beach Bars"
      ],
      "photo": "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&h=600&fit=crop"
    },
    {
      "id": "anse-severe-la-digue",
      "category": "beach",
      "title": "Anse Severe",
      "location": "La Digue, Seychelles",
      "lat": -4.3492,
      "lon": 55.8294,
      "ap": "SEZ",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 2736,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Calm Reef",
        "Bicycle Access"
      ],
      "photo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    },
    {
      "id": "kendwa-zanzibar",
      "category": "beach",
      "title": "Kendwa Beach",
      "location": "Zanzibar, Tanzania",
      "lat": -5.7228,
      "lon": 39.2942,
      "ap": "ZNZ",
      "icon": "🏖️",
      "rating": 4.8,
      "reviews": 2773,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Sunset West-Facing",
        "Calm Tides"
      ],
      "photo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
      "id": "matemwe-zanzibar",
      "category": "beach",
      "title": "Matemwe Beach",
      "location": "Zanzibar, Tanzania",
      "lat": -5.8333,
      "lon": 39.3667,
      "ap": "ZNZ",
      "icon": "🏖️",
      "rating": 4.4,
      "reviews": 410,
      "gradient": "linear-gradient(160deg,#003a64,#0078a8,#56b7d8)",
      "accent": "#7fd4e5",
      "tags": [
        "Pristine",
        "Mnemba Atoll Dives"
      ],
      "photo": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop"
    },
    {
      "id": "paje-zanzibar",
      "category": "beach",
      "title": "Paje Beach",
      "location": "Zanzibar, Tanzania",
      "lat": -6.2625,
      "lon": 39.5333,
      "ap": "ZNZ",
      "icon": "🏖️",
      "rating": 4.5,
      "reviews": 447,
      "gradient": "linear-gradient(160deg,#0a4566,#1b85b0,#6dc7e3)",
      "accent": "#7fd4e5",
      "tags": [
        "Kitesurfing",
        "Powdery White Sand"
      ],
      "photo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
    },
    {
      "id": "jambiani-zanzibar",
      "category": "beach",
      "title": "Jambiani Beach",
      "location": "Zanzibar, Tanzania",
      "lat": -6.3033,
      "lon": 39.5478,
      "ap": "ZNZ",
      "icon": "🏖️",
      "rating": 4.6,
      "reviews": 484,
      "gradient": "linear-gradient(160deg,#0066a0,#00a2c5,#7bd5e8)",
      "accent": "#7fd4e5",
      "tags": [
        "Village Vibe",
        "Low Tide Walks"
      ],
      "photo": "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop"
    },
    {
      "id": "watamu-kenya",
      "category": "beach",
      "title": "Watamu Beach",
      "location": "Kenya",
      "lat": -3.3567,
      "lon": 40.0197,
      "ap": "MBA",
      "icon": "🏖️",
      "rating": 4.7,
      "reviews": 521,
      "gradient": "linear-gradient(160deg,#005c8a,#1e96bf,#7fd4e5)",
      "accent": "#7fd4e5",
      "tags": [
        "Marine Park",
        "Tide Pool Coves"
      ],
      "photo": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
  {
    "id": "cardrona-nz",
    "category": "skiing",
    "title": "Cardrona Alpine Resort",
    "location": "Otago, New Zealand",
    "lat": -44.87,
    "lon": 168.95,
    "ap": "ZQN",
    "icon": "🏔️",
    "rating": 4.6,
    "reviews": 1180,
    "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
    "accent": "#6db3f2",
    "tags": [
      "All Levels",
      "Family Friendly",
      "Scenic Views"
    ],
    "photo": "https://images.unsplash.com/photo-1526904212716-2d2cb52a7258?w=800&h=600&fit=crop&fp-x=0.33&fp-y=0.65"
  },
  {
    "id": "mt-hutt-nz",
    "category": "skiing",
    "title": "Mt Hutt",
    "location": "Canterbury, New Zealand",
    "lat": -43.47,
    "lon": 171.53,
    "ap": "CHC",
    "icon": "🎿",
    "rating": 4.5,
    "reviews": 940,
    "gradient": "linear-gradient(160deg,#0a1a3a,#1a3a6e,#3a6ebf)",
    "accent": "#90caf9",
    "tags": [
      "High Altitude",
      "Off-Piste",
      "Long Season"
    ],
    "photo": "https://images.unsplash.com/photo-1552472200-78d2ad19d2ce?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.47"
  },
  {
    "id": "falls-creek-au",
    "category": "skiing",
    "title": "Falls Creek",
    "location": "Victoria, Australia",
    "lat": -36.87,
    "lon": 147.28,
    "ap": "MEL",
    "icon": "⛷️",
    "rating": 4.4,
    "reviews": 1320,
    "gradient": "linear-gradient(160deg,#0d1b35,#1a3a7a,#3a6ac4)",
    "accent": "#7eb3e8",
    "tags": [
      "All Levels",
      "Village Base",
      "Groomed Runs"
    ],
    "photo": "https://images.unsplash.com/photo-1508437226781-7cdb8043d2a8?w=800&h=600&fit=crop&fp-x=0.48&fp-y=0.61"
  },
  {
    "id": "mt-buller-au",
    "category": "skiing",
    "title": "Mt Buller",
    "location": "Victoria, Australia",
    "lat": -37.14,
    "lon": 146.44,
    "ap": "MEL",
    "icon": "⛷️",
    "rating": 4.3,
    "reviews": 1510,
    "gradient": "linear-gradient(160deg,#0d1b35,#1a3c7c,#2e68c2)",
    "accent": "#82b4e8",
    "tags": [
      "Family Friendly",
      "Groomed Runs",
      "Village Base"
    ],
    "photo": "https://images.unsplash.com/photo-1576397702991-9d7587623713?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.39"
  },
  {
    "id": "mt-hotham-au",
    "category": "skiing",
    "title": "Mt Hotham",
    "location": "Victoria, Australia",
    "lat": -36.98,
    "lon": 147.13,
    "ap": "MEL",
    "icon": "⛷️",
    "rating": 4.4,
    "reviews": 870,
    "gradient": "linear-gradient(160deg,#0a1828,#1a3870,#2e66be)",
    "accent": "#78ace4",
    "tags": [
      "Off-Piste",
      "Expert Terrain",
      "Scenic Views"
    ],
    "photo": "https://images.unsplash.com/photo-1592428067555-fbaaa69df4b2?w=800&h=600&fit=crop"
  },
  {
    "id": "charlotte-pass-au",
    "category": "skiing",
    "title": "Charlotte Pass",
    "location": "New South Wales, Australia",
    "lat": -36.43,
    "lon": 148.33,
    "ap": "CBR",
    "icon": "🏔️",
    "rating": 4.2,
    "reviews": 410,
    "gradient": "linear-gradient(160deg,#0d1c36,#1a3c7a,#3068c4)",
    "accent": "#76aedf",
    "tags": [
      "High Altitude",
      "Family Friendly",
      "Scenic Views"
    ],
    "photo": "https://images.unsplash.com/photo-1695331942059-6bf9226ccb2b?w=800&h=600&fit=crop"
  },
  {
    "id": "nevados-de-chillan-cl",
    "category": "skiing",
    "title": "Nevados de Chillán",
    "location": "Ñuble, Chile",
    "lat": -36.91,
    "lon": -71.4,
    "ap": "SCL",
    "icon": "⛷️",
    "rating": 4.6,
    "reviews": 760,
    "gradient": "linear-gradient(160deg,#0a1a30,#1a3870,#2e66c0)",
    "accent": "#74aadc",
    "tags": [
      "Off-Piste",
      "Backcountry",
      "Long Season"
    ],
    "photo": "https://images.unsplash.com/photo-1481285184914-8a731806bbf8?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.46"
  },
  {
    "id": "la-parva-cl",
    "category": "skiing",
    "title": "La Parva",
    "location": "Santiago, Chile",
    "lat": -33.33,
    "lon": -70.28,
    "ap": "SCL",
    "icon": "🏔️",
    "rating": 4.5,
    "reviews": 690,
    "gradient": "linear-gradient(160deg,#0c1a34,#1a3878,#2e64c0)",
    "accent": "#72a8dc",
    "tags": [
      "High Altitude",
      "Expert Terrain",
      "Scenic Views"
    ],
    "photo": "https://images.unsplash.com/photo-1613111985602-c8c9873b9780?w=800&h=600&fit=crop&fp-x=0.54&fp-y=0.67"
  },
  {
    "id": "el-colorado-cl",
    "category": "skiing",
    "title": "El Colorado",
    "location": "Santiago, Chile",
    "lat": -33.35,
    "lon": -70.3,
    "ap": "SCL",
    "icon": "⛷️",
    "rating": 4.3,
    "reviews": 880,
    "gradient": "linear-gradient(160deg,#0d1c38,#1a3e7c,#2a6abf)",
    "accent": "#7aacdc",
    "tags": [
      "All Levels",
      "High Altitude",
      "Groomed Runs"
    ],
    "photo": "https://images.unsplash.com/photo-1532478421036-1e0aa1afacea?w=800&h=600&fit=crop"
  },
  {
    "id": "corralco-cl",
    "category": "skiing",
    "title": "Corralco",
    "location": "Araucanía, Chile",
    "lat": -38.3,
    "lon": -71.58,
    "ap": "ZCO",
    "icon": "🏔️",
    "rating": 4.7,
    "reviews": 350,
    "gradient": "linear-gradient(160deg,#0e1c38,#1a3e7e,#2e6cbe)",
    "accent": "#78aada",
    "tags": [
      "Backcountry",
      "Scenic Views",
      "Off-Piste"
    ],
    "photo": "https://images.unsplash.com/photo-1738489886397-f1101f1637f8?w=800&h=600&fit=crop&fp-x=0.69&fp-y=0.49"
  },
  {
    "id": "cerro-catedral-ar",
    "category": "skiing",
    "title": "Cerro Catedral",
    "location": "Bariloche, Argentina",
    "lat": -41.17,
    "lon": -71.44,
    "ap": "BRC",
    "icon": "⛷️",
    "rating": 4.6,
    "reviews": 1420,
    "gradient": "linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)",
    "accent": "#6db3f2",
    "tags": [
      "Expert Terrain",
      "Village Base",
      "Scenic Views"
    ],
    "photo": "https://images.unsplash.com/photo-1552472200-78d2ad19d2ce?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.47"
  },
  {
    "id": "las-lenas-ar",
    "category": "skiing",
    "title": "Las Leñas",
    "location": "Mendoza, Argentina",
    "lat": -35.15,
    "lon": -70.08,
    "ap": "MDZ",
    "icon": "🏔️",
    "rating": 4.7,
    "reviews": 980,
    "gradient": "linear-gradient(160deg,#0a1a3a,#1a3a6e,#3a6ebf)",
    "accent": "#90caf9",
    "tags": [
      "Steep Chutes",
      "Off-Piste",
      "Expert Terrain"
    ],
    "photo": "https://images.unsplash.com/photo-1508437226781-7cdb8043d2a8?w=800&h=600&fit=crop&fp-x=0.48&fp-y=0.61"
  },
  {
    "id": "chapelco-ar",
    "category": "skiing",
    "title": "Chapelco",
    "location": "Neuquén, Argentina",
    "lat": -40.2,
    "lon": -71.3,
    "ap": "CPC",
    "icon": "⛷️",
    "rating": 4.4,
    "reviews": 520,
    "gradient": "linear-gradient(160deg,#0d1b35,#1a3a7a,#3a6ac4)",
    "accent": "#7eb3e8",
    "tags": [
      "All Levels",
      "Family Friendly",
      "Scenic Views"
    ],
    "photo": "https://images.unsplash.com/photo-1576397702991-9d7587623713?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.39"
  },
  {
    "id": "caviahue-ar",
    "category": "skiing",
    "title": "Caviahue",
    "location": "Neuquén, Argentina",
    "lat": -37.85,
    "lon": -71.05,
    "ap": "NQN",
    "icon": "🏔️",
    "rating": 4.2,
    "reviews": 280,
    "gradient": "linear-gradient(160deg,#0d1b35,#1a3c7c,#2e68c2)",
    "accent": "#82b4e8",
    "tags": [
      "Backcountry",
      "Off-Piste",
      "Scenic Views"
    ],
    "photo": "https://images.unsplash.com/photo-1592428067555-fbaaa69df4b2?w=800&h=600&fit=crop"
  },
];

// Boot-time duplicate-id smoke alarm. Dup ids silently clobber wishlist saves
// (id collisions in localStorage), break React keys in the grid, and double-
// count in price/weather batches. Fail loudly so any agent or human editing
// VENUES sees it immediately in the console — not days later via a P1 report.
(() => {
  const seen = new Set();
  const dups = [];
  for (const v of VENUES) {
    if (!v?.id) { dups.push("(missing id)"); continue; }
    if (seen.has(v.id)) dups.push(v.id);
    else seen.add(v.id);
  }
  if (dups.length) {
    console.warn(
      `[Peakly] VENUES has ${dups.length} duplicate id${dups.length > 1 ? "s" : ""} — fix before shipping:`,
      dups
    );
  }
})();

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
  { code:"IAH", label:"Houston",       flag:"🚀" },
  { code:"PHL", label:"Philadelphia",  flag:"🔔" },
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
  { code:"CLT", city:"Charlotte NC",            flag:"🇺🇸" },
  { code:"IND", city:"Indianapolis",            flag:"🇺🇸" },
  { code:"CVG", city:"Cincinnati",              flag:"🇺🇸" },
  { code:"TUS", city:"Tucson AZ",               flag:"🇺🇸" },
  { code:"OKC", city:"Oklahoma City",           flag:"🇺🇸" },
  { code:"MEM", city:"Memphis TN",              flag:"🇺🇸" },
  { code:"SDF", city:"Louisville KY",           flag:"🇺🇸" },
  { code:"PBI", city:"West Palm Beach FL",      flag:"🇺🇸" },
  { code:"SYR", city:"Syracuse NY",             flag:"🇺🇸" },
  { code:"PWM", city:"Portland ME",             flag:"🇺🇸" },
  { code:"GRR", city:"Grand Rapids MI",         flag:"🇺🇸" },
  { code:"DSM", city:"Des Moines IA",           flag:"🇺🇸" },
  { code:"ICT", city:"Wichita KS",             flag:"🇺🇸" },
  { code:"LIT", city:"Little Rock AR",          flag:"🇺🇸" },
  { code:"TUL", city:"Tulsa OK",               flag:"🇺🇸" },
  { code:"BOI", city:"Boise ID",               flag:"🇺🇸" },
  { code:"GEG", city:"Spokane WA",             flag:"🇺🇸" },
  { code:"BHM", city:"Birmingham AL",          flag:"🇺🇸" },
  { code:"RIC", city:"Richmond VA",            flag:"🇺🇸" },
  { code:"ORF", city:"Norfolk VA",             flag:"🇺🇸" },
  { code:"GSP", city:"Greenville SC",          flag:"🇺🇸" },
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
  { code:"MHT", city:"Manchester NH",           flag:"🇺🇸" },
  { code:"CRW", city:"Charleston WV",           flag:"🇺🇸" },
  { code:"GUC", city:"Gunnison CO",             flag:"🇺🇸" },
  { code:"GPI", city:"Kalispell MT",            flag:"🇺🇸" },
];

// ─── weather api (Open-Meteo — no key required) ───────────────────────────────
const METEO  = "https://api.open-meteo.com/v1";
const MARINE = "https://marine-api.open-meteo.com/v1";
const WX_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours — re-fetch threshold
const WX_CACHE_MAX_AGE = 6 * 60 * 60 * 1000; // 6 hours — hard eviction (catches abandoned tabs)

function _wxCacheKey(prefix, lat, lon) {
  return `peakly_${prefix}_${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

function _wxCacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > WX_CACHE_TTL) { localStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
}

function _wxCacheSet(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {} // ignore QuotaExceededError
}

// Clean up stale weather/marine cache entries older than 2 hours — runs once on app load
function _wxCacheCleanup() {
  try {
    const now = Date.now();
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || (!key.startsWith("peakly_weather_") && !key.startsWith("peakly_marine_"))) continue;
      try {
        const { ts } = JSON.parse(localStorage.getItem(key));
        if (now - ts > WX_CACHE_MAX_AGE) keysToRemove.push(key);
      } catch { keysToRemove.push(key); }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch {}
}
_wxCacheCleanup();

// ─── flight price cache (localStorage, 15-min TTL) ────────────────────────────
const FLIGHT_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const FLIGHT_CACHE_MAX_AGE = 2 * 60 * 60 * 1000; // 2 hours — cleanup threshold

function _flightCacheKey(origin, dest, departDate) {
  return departDate
    ? `peakly_flights_${origin}_${dest}_${departDate}`
    : `peakly_flights_${origin}_${dest}`;
}

function _flightCacheGet(origin, dest, departDate) {
  try {
    const k = _flightCacheKey(origin, dest, departDate);
    const raw = localStorage.getItem(k);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > FLIGHT_CACHE_TTL) { localStorage.removeItem(k); return null; }
    return data;
  } catch { return null; }
}

function _flightCacheSet(origin, dest, data, departDate) {
  try {
    localStorage.setItem(_flightCacheKey(origin, dest, departDate), JSON.stringify({ data, ts: Date.now() }));
  } catch {} // ignore QuotaExceededError
}

function _flightCacheCleanup() {
  try {
    const now = Date.now();
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("peakly_flights_")) continue;
      try {
        const { ts } = JSON.parse(localStorage.getItem(key));
        if (now - ts > FLIGHT_CACHE_MAX_AGE) keysToRemove.push(key);
      } catch { keysToRemove.push(key); }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch {}
}
_flightCacheCleanup();

// ─── Open-Meteo proxy with shared cache (Reddit-spike protection) ─────────────
// Try VPS proxy first — shared in-memory cache means N simultaneous users
// hitting the same (lat,lon) trigger 1 upstream Open-Meteo call instead of N.
// Falls back to direct Open-Meteo if proxy is down or returns non-success.
// 4s timeout — proxy should respond <100ms on cache hit, ~2s on miss.
async function _tryProxyWx(kind, lat, lon) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const url = `${FLIGHT_PROXY}/api/${kind}?lat=${lat}&lon=${lon}`;
    const r = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!r.ok) return null;
    const json = await r.json();
    return (json && json.success && json.data) ? json.data : null;
  } catch { return null; }
}

async function fetchWeather(lat, lon) {
  const cacheKey = _wxCacheKey("weather", lat, lon);
  const cached = _wxCacheGet(cacheKey);
  if (cached) return cached;
  const fromProxy = await _tryProxyWx("weather", lat, lon);
  if (fromProxy) { _wxCacheSet(cacheKey, fromProxy); return fromProxy; }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  const url =
    `${METEO}/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,` +
    `snow_depth_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,` +
    `uv_index_max,weather_code,precipitation_probability_max,sunshine_duration,` +
    `rain_sum,showers_sum,relative_humidity_2m_max,cloud_cover_max` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=7&timezone=auto`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { signal: controller.signal });
      if (r.status === 429 || r.status >= 500) {
        if (attempt < 2) { await new Promise(res => setTimeout(res, (attempt + 1) * 1200)); continue; }
        clearTimeout(timer); return null;
      }
      if (!r.ok) { clearTimeout(timer); return null; }
      const data = await r.json();
      clearTimeout(timer);
      _wxCacheSet(cacheKey, data);
      return data;
    } catch (err) {
      if (err.name === "AbortError") { return null; }
      if (attempt < 2) { await new Promise(res => setTimeout(res, (attempt + 1) * 1200)); continue; }
      clearTimeout(timer);
      console.warn("[Peakly] Weather API error:", err.name, err.message);
      return null;
    }
  }
  clearTimeout(timer); return null;
}

async function fetchMarine(lat, lon) {
  const cacheKey = _wxCacheKey("marine", lat, lon);
  const cached = _wxCacheGet(cacheKey);
  if (cached) return cached;
  const fromProxy = await _tryProxyWx("marine", lat, lon);
  if (fromProxy) { _wxCacheSet(cacheKey, fromProxy); return fromProxy; }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  // Beach-only after 2026-05-03 surf retirement — only sea_surface_temperature_max
  // is consumed by scoreVenue (water-temp gate). Wave/swell fields removed
  // to trim Open-Meteo payload. Field was 'ocean_temperature_max' until
  // 2026-06-07 — Open-Meteo never had that name; marine fetch had been failing
  // silently and beach venues were scoring without water-temp data.
  const url =
    `${MARINE}/marine?latitude=${lat}&longitude=${lon}` +
    `&daily=sea_surface_temperature_max` +
    `&forecast_days=7&timezone=auto`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { signal: controller.signal });
      if (r.status === 429 || r.status >= 500) {
        if (attempt < 2) { await new Promise(res => setTimeout(res, (attempt + 1) * 1200)); continue; }
        clearTimeout(timer); return null;
      }
      if (!r.ok) { clearTimeout(timer); return null; }
      const data = await r.json();
      clearTimeout(timer);
      _wxCacheSet(cacheKey, data);
      return data;
    } catch (err) {
      if (err.name === "AbortError") { return null; }
      if (attempt < 2) { await new Promise(res => setTimeout(res, (attempt + 1) * 1200)); continue; }
      clearTimeout(timer);
      console.warn("[Peakly] Marine API error:", err.name, err.message);
      return null;
    }
  }
  clearTimeout(timer); return null;
}

// Returns a hard score cap for off-season beach venues, or null if in-season.
// Mirrors skiing's off-season cap=8 logic — a sunny February day in Hvar isn't
// a beach trip, every restaurant and rental is shut. Default by latitude band;
// venues can override with venue.beachSeason = { offStart:"MM-DD", offEnd:"MM-DD" }
// for hand-tuning (e.g. southern-Med outliers that stay open later).
function getBeachSeasonCap(venue, date) {
  if (venue.category !== "beach") return null;
  const absLat = Math.abs(venue.lat);
  if (absLat < 30) return null; // tropical: no cap, year-round beach

  const mmdd = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const inRange = (off, start, end) =>
    start <= end ? (off >= start && off <= end) : (off >= start || off <= end);

  // Off-season cap raised 25→40 / 20→35: the previous binary ceiling silenced
  // every other signal — a sunny 75°F February day in Hvar scored identical to
  // a rainy one. New caps still lose to the 44 "warm but grey" peak-season floor
  // (so off-season beaches never headline) but let the algorithm rank within
  // the off-season pool, which is what users searching for shoulder-season
  // deals actually need.
  if (venue.beachSeason?.offStart && venue.beachSeason?.offEnd) {
    return inRange(mmdd, venue.beachSeason.offStart, venue.beachSeason.offEnd) ? 40 : null;
  }

  const northern = venue.lat > 0;
  if (absLat >= 46) {
    // Northern Europe / N Atlantic / NZ South Is — long off-season
    const off = northern
      ? inRange(mmdd, "10-01", "05-31")
      : inRange(mmdd, "04-01", "11-15");
    return off ? 35 : null;
  }
  // 30 <= |lat| < 46 — Med, Carolinas, N Africa, S Australia
  const off = northern
    ? inRange(mmdd, "11-01", "04-14")
    : inRange(mmdd, "05-15", "09-30");
  return off ? 40 : null;
}

// ─── condition scoring ────────────────────────────────────────────────────────
// dayIndex: 0=today (default), 1=tomorrow, etc. Supports date-aware scoring.
function scoreVenue(venue, wx, marine, dayIndex) {
  if (!wx?.daily) return { score:50, label:"Checking conditions…", period:"Loading live data" };
  const di = dayIndex || 0;
  // If the requested day is beyond the forecast window, return unavailable
  const forecastLen = wx.daily.temperature_2m_max?.length ?? 7;
  if (di >= forecastLen) return { score:50, label:"Forecast unavailable", period:"Beyond 7-day forecast window" };
  const d = wx.daily;
  const md = marine?.daily;

  // ─── Extract all available weather data ───
  // Strict day-index lookup: NO fallback to day 0. If a field is missing for the
  // requested day, return null and let scoring skip that signal — never silently
  // substitute today's data when the user asked about day 5.
  const at = (arr) => (Array.isArray(arr) && di < arr.length) ? arr[di] : null;
  const tempMax   = at(d.temperature_2m_max)  ?? 65;
  const tempMin   = at(d.temperature_2m_min)  ?? 45;
  const precip    = at(d.precipitation_sum)   ?? 0;
  const rain      = at(d.rain_sum)            ?? precip;
  const snow      = at(d.snowfall_sum)        ?? 0;
  const depth     = at(d.snow_depth_max)      ?? 0;
  const wind      = at(d.wind_speed_10m_max)  ?? 10;
  const gusts     = at(d.wind_gusts_10m_max)  ?? wind * 1.4;
  const windDirRaw= at(d.wind_direction_10m_dominant); // null if missing — DO NOT default to 0 (would falsely imply north wind)
  const windDir   = windDirRaw ?? 0;          // numeric default for math; consumers must check windDirRaw for validity
  const uv        = at(d.uv_index_max)        ?? 5;
  const wCode     = at(d.weather_code)        ?? 0;
  const cloudPct  = at(d.cloud_cover_max);    // null if not provided
  const precipPct = at(d.precipitation_probability_max) ?? 50;
  const sunHrs    = (at(d.sunshine_duration) ?? 28800) / 3600;
  const humidity  = at(d.relative_humidity_2m_max);

  // ─── Precip confidence: high probability + 0mm accumulation = scattered showers ─
  // Open-Meteo can report 0mm daily total with 90% probability when the model
  // expects showers but can't pin them spatially. Treat as "likely some rain".
  const likelyRain = precip < 1 && precipPct > 70;

  // ─── Severe weather codes ───────────────────────────────────────────────────
  // 51-65=rain/drizzle, 66-67=FREEZING rain (catastrophic), 71-77=snow,
  // 80-82=rain showers, 85-86=snow showers, 95=thunderstorm,
  // 96/99=thunderstorm with hail. NWS-aligned definitions.
  const isFreezingRain = wCode === 66 || wCode === 67;
  const isThunder      = wCode >= 95 && wCode <= 99;
  const isHail         = wCode === 96 || wCode === 99;

  // ─── Marine data (beach only — water temp) ──────────────────────────────
  const atM = (arr) => (Array.isArray(arr) && di < arr.length) ? arr[di] : null;
  const waterTemp = atM(md?.sea_surface_temperature_max); // null if no marine
  const ySnow     = (di > 0 && Array.isArray(d?.snowfall_sum)  && d.snowfall_sum[di-1] != null)
                    ? d.snowfall_sum[di-1] : 0;

  // ─── Derived metrics ───
  // Gust factor only meaningful when there's actual wind. Below 8mph, the
  // "factor" is noise — calm air with 5mph gusts isn't gusty conditions.
  const gustFactor = wind >= 8 ? gusts / wind : 1.0;

  // Consecutive good-weather days from selected day (category-aware)
  let bestDays = 1;
  for (let i = di + 1; i < (d.precipitation_sum?.length ?? 0); i++) {
    const dayPrecip = d.precipitation_sum[i] ?? 99;
    const dayWind = d.wind_speed_10m_max[i] ?? 99;
    const daySnow = d.snowfall_sum?.[i] ?? 0;
    if (venue.category === "skiing") {
      if ((daySnow > 0 || dayPrecip < 3) && dayWind < 35) bestDays++;
      else break;
    } else {
      if (dayPrecip < 3 && dayWind < 25) bestDays++;
      else break;
    }
  }

  // Trend: is tomorrow better or worse? (for "building" / "fading" labels)
  const tmrwPrecip = d.precipitation_sum?.[di+1] ?? precip;
  const tmrwWind   = d.wind_speed_10m_max?.[di+1] ?? wind;

  let score = 50, label = "", period = "";

  switch (venue.category) {

    case "skiing": {
      const sIn = Math.round(snow * 0.394);       // cm fresh → inches
      const dIn = Math.round(depth * 39.4);        // m base → inches
      const baseCm = depth * 100;

      // ─── Season check: is this resort even open? ────────────────────────
      // Northern hemisphere ski season: Nov–Apr. Southern: May–Oct.
      const mo = new Date().getMonth() + 1;       // 1-12
      const isNorth = (venue.lat || 0) >= 0;
      const inSeason = isNorth ? (mo >= 11 || mo <= 4) : (mo >= 5 && mo <= 10);
      // Shoulder months (Oct/May for N, Apr/Nov for S): open but marginal
      const isShoulder = isNorth ? (mo === 10 || mo === 5) : (mo === 4 || mo === 11);

      // Late-season exception: high-altitude resorts (venue.lateSeason) stay
      // open into May/early June with real snow. Skip the hard off-season cut
      // so spring corn weekends don't get hidden.
      const inLateSeason = !inSeason && !isShoulder && venue.lateSeason && depth >= 0.5;
      if (!inSeason && !isShoulder && !inLateSeason) {
        score = 8; label = "Off-season — resort closed"; period = "Opens " + (isNorth ? "November" : "May");
        break;
      }

      // ─── Fresh snow is king (but only if it's actually SNOW, not sleet) ─
      // If accumulation comes with tempMax > 36°F, it's wet/heavy snow or sleet
      // hitting warm ground — not the powder a user expects from "30cm fresh".
      // Cap the bonus so we don't promise a powder day that's actually slop.
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
        else if (inSeason && !isShoulder) score = 35;  // snowmaking floor — peak season
        else if (isShoulder)              score = 25;  // less terrain open in shoulder
        else                              score = 15;  // off-season
      }

      // Shoulder months: cap scores lower unless there's real snow
      if (isShoulder && snow < 5 && baseCm < 50) score = Math.min(score, 32);

      // ─── Temperature: powder preservation vs spring corn vs rain ────────
      if (tempMax < 25 && snow > 5)   score += 5;
      else if (tempMax < 32 && snow > 0) score += 2;
      // Warm-temp penalty: only when base is thin. Deep base + warm = corn skiing (great)
      if (tempMax > 38 && baseCm < 100) {
        if (tempMax <= 42) score -= 6;
        else if (tempMax <= 48) score -= 12;
        else score -= 20;                          // rain-on-snow
      } else if (tempMax > 48 && baseCm >= 100) {
        score -= 4;                                 // spring slush but deep base = still skiable
      } else if (tempMax > 48) {
        score -= 20;
      }
      if (tempMin > 32 && snow === 0 && baseCm < 100) score -= 5;

      // ─── Wind: lifts close when it gets bad ──────────────────────────────
      // Most resorts: upper lifts hold at 40mph sustained/55mph gusts.
      if (gusts > 55) score -= 20;          // upper mountain closed
      else if (gusts > 45) score -= 12;     // ridges closed, holds start
      else if (wind > 30) score -= 6;       // cold + uncomfortable
      if (gustFactor > 1.8) score -= 3;     // erratic gusts

      // ─── Wind chill (°F) — NWS formula. Only valid for V>=3, T<=50 ──────
      const chill = (wind >= 3 && tempMax <= 50)
        ? 35.74 + 0.6215 * tempMax - 35.75 * Math.pow(wind, 0.16) + 0.4275 * tempMax * Math.pow(wind, 0.16)
        : tempMax;
      if (chill < -20) score -= 12;          // dangerous frostbite zone
      else if (chill < -10) score -= 8;
      else if (chill < 0) score -= 4;
      else if (chill < 10) score -= 2;

      // ─── Weather codes: rain vs snow vs freezing rain vs lightning ──────
      // 51-65=rain, 66-67=FREEZING rain (worst), 71-77=snow, 80-82=rain showers,
      // 85-86=snow showers, 95-99=thunderstorm, 45-48=fog.
      const isRain = ((wCode >= 51 && wCode <= 65) || (wCode >= 80 && wCode <= 82)) && !isFreezingRain;
      const isSnow = (wCode >= 71 && wCode <= 77) || (wCode >= 85 && wCode <= 86);
      const isHeavySnow = wCode === 75 || wCode === 86;  // dumping = flat light, low vis
      const isFog  = wCode === 45 || wCode === 48;

      if (isFreezingRain) score -= 28;       // ice rink everywhere — trip-destroying
      else if (isRain)    score -= 14;       // rain-on-snow ruins everything
      // isSnow: do NOT penalize — that's literally what we want
      if (isFog) score -= 5;
      if (isThunder) score -= 22;            // lifts evacuated, lightning at altitude is fatal
      if (isHail)    score -= 6;             // additional hail penalty (rare but ugly)

      // ─── Bluebird powder bonus — sunny + fresh + cold = the dream ─────
      if (snow >= 8 && tempMax < 32 && wCode <= 1 && !isThunder) score += 6;
      else if (snow >= 5 && wCode <= 2 && tempMax < 36) score += 3;

      // Bad forecast confidence: high rain probability with no fresh snow
      if ((likelyRain || precipPct > 75) && snow < 3 && !isSnow) score -= 5;

      const conditionTag = (isFreezingRain ? " · FREEZING RAIN"
                         : isThunder ? " · ⚡ thunder"
                         : wetSnow ? " · wet/heavy"
                         : isHeavySnow ? " · heavy snow · flat light"
                         : isRain ? " · RAIN"
                         : isSnow ? " · snowing"
                         : "")
                         + (inLateSeason ? " · late season" : "");
      label = snow > 0
        ? `${sIn}" fresh · ${dIn}" base · ${tempMax}°F${conditionTag}`
        : `${dIn}" base · ${tempMax}°F${gusts > 45 ? " · high wind" : conditionTag}`;
      const stormFading = ySnow > snow + 8 && snow < 10;
      const bluebird = snow >= 10 && tempMax < 30 && wCode <= 1 && wind < 25;
      // Bluebird = post-storm clear cold day. +5 nudge (was +10 — too large
      // a magic-number jump on top of the snow tier; bluebird should sweeten
      // an already-iconic day, not promote a marginal one to the top tier).
      if (bluebird) score += 5;
      period = isFreezingRain ? "Freezing rain — DO NOT ski"
             : isThunder ? "Thunderstorm — lifts will close"
             : wetSnow && snow >= 10 ? "Wet snow — heavy & sticky"
             : bluebird ? "Bluebird powder — perfect day"
             : snow >= 25 ? "Powder day — go now"
             : snow >= 12 ? "Fresh overnight — first tracks"
             : snow >=  5 ? "New snow on groomed"
             : snow >   0 ? "Dusting — mostly groomed"
             : stormFading ? `Storm fading · ${Math.round(ySnow * 0.394)}" fell yesterday`
             : isRain      ? "Rain — wait it out"
             : baseCm >= 150 ? `Packed powder${tempMin < 28 ? " · firm AM" : ""}`
             : baseCm >=  50 ? "Thin cover · stick to groomers"
             : "Limited terrain";
      break;
    }

    case "beach": {
      // Weather code bands: 0=clear, 1=mainly clear, 2=partly cloudy, 3=overcast,
      // 45/48=fog, 51-67=rain/drizzle, 71-77=snow, 80+=showers/storms
      const sunny     = wCode <= 1;
      const clear     = wCode <= 2;
      const partCloud = wCode === 3;
      const foggy     = wCode === 45 || wCode === 48;
      const rainy     = (wCode >= 51 && wCode <= 67) || (wCode >= 80 && wCode <= 82);
      const stormy    = wCode >= 95;

      // Sunshine hours: real-world beach-day quality indicator
      const sunPct       = Math.min(1, sunHrs / 11);       // 0-1 of useful sun hours
      const comfortTemp  = tempMax >= 75 && tempMax <= 92;
      const warmEnough   = tempMax >= 68 && tempMax < 75;
      const hotButOk     = tempMax > 92 && tempMax <= 102;

      // ─── Core: UV + sun + comfortable air temperature ──────────────────
      if (sunny && sunHrs >= 10 && uv >= 8 && comfortTemp) {
        score = 94 + Math.min(4, (uv - 8) * 0.8 + (sunHrs - 10) * 0.5);  // peak beach day
      } else if (clear && sunHrs >= 8 && uv >= 6 && (comfortTemp || hotButOk)) {
        score = 84 + Math.min(8, (uv - 6) * 1.3 + sunPct * 4);
      } else if (partCloud && uv >= 5 && (comfortTemp || warmEnough)) {
        score = 68 + uv * 1.5 + sunPct * 5;
      } else if (uv >= 3 && warmEnough) {
        score = 52 + uv * 2;
      } else if (warmEnough) {
        score = 44;                                // warm but grey
      } else {
        score = 28;                                // not a beach day
      }

      // ─── Wind: kills beach comfort faster than most score models assume ──
      if (wind > 25)       score -= 16;             // sand-blast
      else if (wind > 22)  score -= 12;             // umbrella-flipping zone
      else if (wind > 18)  score -= 9;
      else if (wind > 13)  score -= 4;              // noticeable
      else if (wind > 9)   score -= 1;
      if (gusts > 28) score -= 3;

      // ─── Rain: even small amounts end a beach day ──────────────────────
      if (rainy || precip > 2) score -= 22;
      else if (likelyRain) score -= 16;             // model says showers but couldn't pin them
      else if (precipPct > 75) score -= 14;
      else if (precipPct > 55) score -= 7;
      else if (precipPct > 35) score -= 3;
      if (stormy) score -= 25;
      if (foggy && sunHrs < 4) score -= 10;

      // ─── Temperature edges ──────────────────────────────────────────────
      if (tempMax < 65) score -= 12;
      if (tempMax > 100) score -= 6;
      if (tempMax > 105) score -= 14;

      // ─── Heat index: humidity + heat = misery ─────────────────────────
      if (humidity !== null && tempMax >= 85) {
        if (humidity > 85 && tempMax >= 95) score -= 12;
        else if (humidity > 75 && tempMax >= 90) score -= 7;
        else if (humidity > 65 && tempMax >= 88) score -= 3;
      }

      // ─── Cloud cover: finer-grained than weather code categories ──────
      // Open-Meteo gives 0-100% max cloud cover. Pulls down inflated scores
      // when wCode says "mainly clear" but it's actually 60% cloudy all day.
      if (cloudPct !== null) {
        if (cloudPct >= 80) score -= 6;       // mostly grey, weak tan
        else if (cloudPct >= 60) score -= 3;
        else if (cloudPct <= 15 && uv >= 6) score += 2;  // bluebird bonus
      }

      // ─── Water temperature (if marine data available) ──────────────────
      // Graduated penalty (was hard cap at 18°C — too blunt; a 17°C Med day
      // with 90°F air + UV 9 was capping at 55, underselling legitimate trips).
      // poolPrimary venues skip the penalty — guests don't depend on ocean.
      let chillyWater = false;
      if (waterTemp !== null) {
        if (waterTemp >= 22) score += 4;                      // tropical swim
        else if (waterTemp >= 18) score += (waterTemp - 18);  // 18→0, 22→+4 linear
        else if (!venue.poolPrimary) {
          if (waterTemp >= 14) score -= 10 + (18 - waterTemp) * 3.75;  // 18→-10, 14→-25
          else score -= 30;                                   // genuinely cold
          chillyWater = waterTemp < 16;
        }
      }

      const sunLabel = sunHrs >= 10 ? "Full sun" : sunHrs >= 7 ? "Mostly sunny" : sunHrs >= 4 ? "Partly cloudy" : "Overcast";
      const weatherTag = stormy ? " · storms" : rainy ? " · rain" : foggy ? " · fog" : "";
      const chillyTag = chillyWater ? " · chilly water" : "";
      label = `UV ${uv} · ${tempMax}°F · ${sunLabel}${weatherTag}${chillyTag}`;
      period = (sunny || clear) && bestDays > 2 ? `${Math.min(bestDays, 7)}-day clear stretch`
             : (sunny || clear) ? "Clear today"
             : rainy            ? "Wet day — wait it out"
             : precipPct < 30   ? "Mostly dry"
             : "Scattered clouds";
      break;
    }
    default:
      score = 65; label = `${tempMax}°F · ${sunHrs.toFixed(0)}h sun`; period = "Conditions fair";
  }

  // Beach off-season cap (mirrors skiing's binary cap). Med/N-Europe/etc.
  // beaches in their dead months can't outscore the cap regardless of weather —
  // a sunny February day in Hvar still has no boats, no bars, no point.
  const dayDate = d.time?.[di] ? new Date(d.time[di]) : new Date();
  const beachCap = getBeachSeasonCap(venue, dayDate);
  if (beachCap != null) score = Math.min(score, beachCap);
  if (beachCap != null) period = `Off-season — ${period.toLowerCase()}`;

  // Banded score: be honest about forecast horizon + model self-uncertainty.
  // Day-0 forecasts are tight (±2); day-7 is barely better than climatology
  // (±15+). When the model itself hedges (high precipPct + ~0mm forecast),
  // widen the band further.
  const baseHalfWidth = 2;
  const horizonWidth = Math.max(0, di - 1) * 2.5;
  const hedgeWidth = (precipPct >= 50 && precip < 1) ? 4 : 0;
  const halfWidth = Math.round(baseHalfWidth + horizonWidth + hedgeWidth);
  const finalScore = Math.round(Math.min(100, Math.max(5, score)));
  return {
    score: finalScore,
    lo: Math.max(5, finalScore - halfWidth),
    hi: Math.min(100, finalScore + halfWidth),
    halfWidth,
    label, period,
  };
}

// ─── Weekend window scoring (front page) ──────────────────────────────────────
// Front page locks to "this weekend" (Fri–Mon, flex return). Per-day scoreVenue
// stays for the detail sheet's 7-day view; scoreWeekend wraps it for the
// front-page "Firing this weekend" carousel.

// Upcoming Friday's YYYY-MM-DD. If today is Fri, returns today. If mid-weekend
// (Sat/Sun), skips to NEXT Fri — same-day fares aren't a useful pricing
// signal. Used for weekend-specific Travelpayouts queries.
function upcomingFridayISO(today) {
  const d = today.getDay(); // 0=Sun ... 6=Sat
  const daysToFri = d === 5 ? 0 : (5 - d + 7) % 7;
  const fri = new Date(today);
  fri.setDate(fri.getDate() + daysToFri);
  return fri.toISOString().slice(0, 10);
}

// "2026-06-19" → "Fri Jun 19". Renders the actual TP-returned round-trip
// dates under live prices so users see the exact window they're booking.
const _SD_DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const _SD_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function shortDate(iso) {
  if (!iso || typeof iso !== "string") return "";
  const d = new Date(iso + "T12:00:00Z");
  if (Number.isNaN(d.getTime())) return "";
  return `${_SD_DAYS[d.getUTCDay()]} ${_SD_MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

function weekendDayIndices(today) {
  // Returns dayIndices [Fri, Sat, Sun, Mon] within 0..6 forecast window.
  // If today is Sat/Sun/Mon, the in-progress weekend is partially in the past
  // (forecast endpoint can't return historical days) so we clamp to remaining.
  // If <2 days remain in current weekend, jump to next weekend.
  const d = today.getDay(); // 0=Sun ... 6=Sat
  let daysToFri;
  if (d === 5)      daysToFri = 0;   // Friday
  else if (d === 6) daysToFri = -1;  // Sat — Fri was yesterday
  else if (d === 0) daysToFri = -2;  // Sun
  else if (d === 1) daysToFri = -3;  // Mon
  else              daysToFri = (5 - d + 7) % 7; // Tue=3, Wed=2, Thu=1
  let indices = [daysToFri, daysToFri+1, daysToFri+2, daysToFri+3].filter(i => i >= 0 && i <= 6);
  if (indices.length < 2) {
    const nextFri = daysToFri + 7;
    indices = [nextFri, nextFri+1, nextFri+2, nextFri+3].filter(i => i >= 0 && i <= 6);
  }
  return indices;
}

function scoreWeekend(venue, wx, marine, todayDate) {
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const indices = weekendDayIndices(todayDate);
  if (!wx?.daily || indices.length === 0) {
    return { score:50, label:"Loading…", period:"", days:"", confidence:"low" };
  }

  // Score each weekend day in window
  const days = indices.map(di => {
    const dt = new Date(todayDate);
    dt.setDate(dt.getDate() + di);
    const r = scoreVenue(venue, wx, marine, di);
    return { ...r, di, dayName: dayNames[dt.getDay()] };
  });

  // Find best 2 days within window — score = avg of best pair.
  // Prefer consecutive (real weekend feel), but allow a non-consecutive split
  // (e.g. Fri+Sun, skip Sat storm) when the gap day drags consecutive avg
  // down materially. Front-page used to lie about Fri=92/Sat=40/Sun=92 venues
  // by averaging the worst pair; honest call is "fly Fri, leave Sun".
  let bestPair = null, bestPairAvg = -1, splitWeekend = false;
  for (let i = 0; i < days.length; i++) {
    for (let j = i + 1; j < days.length; j++) {
      const avg = (days[i].score + days[j].score) / 2;
      if (avg > bestPairAvg) {
        bestPairAvg = avg;
        bestPair = [days[i], days[j]];
        splitWeekend = (days[j].di - days[i].di) > 1;
      }
    }
  }
  // Only call it a split if the gap day is meaningfully worse than the pair
  // (>15 below). Otherwise it's noise — fall back to consecutive logic.
  if (splitWeekend && bestPair) {
    const gapDays = days.filter(d => d.di > bestPair[0].di && d.di < bestPair[1].di);
    const minGap = Math.min(...gapDays.map(d => d.score));
    if (minGap >= bestPairAvg - 15) {
      // Gap not bad enough — re-pick best consecutive pair instead
      let consecAvg = -1, consecPair = null;
      for (let i = 0; i < days.length - 1; i++) {
        if (days[i+1].di === days[i].di + 1) {
          const avg = (days[i].score + days[i+1].score) / 2;
          if (avg > consecAvg) { consecAvg = avg; consecPair = [days[i], days[i+1]]; }
        }
      }
      if (consecPair) { bestPair = consecPair; bestPairAvg = consecAvg; splitWeekend = false; }
    }
  }
  // Fall back to single best day if forecast window only allowed 1 day
  if (!bestPair) {
    const top = days.reduce((a,b) => b.score > a.score ? b : a);
    bestPair = [top];
    bestPairAvg = top.score;
  }

  // Confidence: based on the latest day in the weekend window.
  // Day 0–4 = high (forecast solid), day 5 = medium, day 6+ = low.
  const maxDi = Math.max(...indices);
  const confidence = maxDi <= 4 ? "high" : maxDi === 5 ? "medium" : "low";

  // Label = best day's per-day label, prefixed with day name.
  const top = bestPair.reduce((a,b) => b.score > a.score ? b : a);
  const label = `${top.dayName}: ${top.label}`;
  const sep = bestPair.length === 2 ? (splitWeekend ? ' & ' : '–') : '';
  const days_str = bestPair.length === 2 ? `${bestPair[0].dayName}${sep}${bestPair[1].dayName}` : bestPair[0].dayName;

  // Period — name the window, flag bad non-best days so user isn't surprised.
  const otherDays = days.filter(d => !bestPair.includes(d));
  const badOther = otherDays.find(d => d.score < bestPairAvg - 20);
  const period = splitWeekend && badOther
    ? `${days_str} firing · skip ${badOther.dayName}`
    : badOther
    ? `${days_str} firing · ${badOther.dayName} ${badOther.score < 40 ? 'storms' : 'weak'}`
    : `${days_str} window`;

  // Honesty penalty: a Fri=92/Sat=20/Sun=92 split weekend isn't actually a 92
  // — Saturday's bust costs you a day of plans, lift tickets, hotel night.
  // Demote split-weekend headlines by 0.3× the gap-day shortfall (cap −15) so
  // the front page doesn't sell the average without admitting the bust. For
  // consecutive pairs, also demote on wide spread (0.2× spread, cap −8) so
  // Fri=95/Sat=70 reads honestly as "good but uneven" rather than a flat 82.
  let honestyPenalty = 0;
  if (splitWeekend && bestPair.length === 2) {
    const gapDays = days.filter(d => d.di > bestPair[0].di && d.di < bestPair[1].di);
    if (gapDays.length > 0) {
      const minGap = Math.min(...gapDays.map(d => d.score));
      honestyPenalty = Math.min(15, 0.3 * Math.max(0, bestPairAvg - minGap));
    }
  } else if (bestPair.length === 2) {
    const spread = Math.abs(bestPair[0].score - bestPair[1].score);
    honestyPenalty = Math.min(8, 0.2 * spread);
  }

  // Band: avg the lo/hi of the chosen pair so the propagated uncertainty is
  // actually the uncertainty of the days we're recommending, not all days.
  // Shift the band by the same honesty penalty so lo/hi tracks the headline.
  const finalScore = Math.round(Math.max(0, bestPairAvg - honestyPenalty));
  const rawLo = bestPair.reduce((s, d) => s + (d.lo ?? d.score), 0) / bestPair.length;
  const rawHi = bestPair.reduce((s, d) => s + (d.hi ?? d.score), 0) / bestPair.length;
  const lo = Math.round(Math.max(0, rawLo - honestyPenalty));
  const hi = Math.round(Math.max(0, rawHi - honestyPenalty));
  const halfWidth = Math.max(hi - finalScore, finalScore - lo);

  // Headline day: the iconic single day inside the window. Surfaced separately
  // because best-2 averaging buries days that should drive the booking.
  const headline = days.reduce((a, b) => b.score > a.score ? b : a);
  const headlineDay = { name: headline.dayName, score: headline.score, label: headline.label, di: headline.di };

  // Consistency: 100 = identical scores across window, 0 = wildly variable.
  const dayScores = days.map(d => d.score);
  const variance = Math.max(...dayScores) - Math.min(...dayScores);
  const consistency = Math.max(0, 100 - variance);

  return {
    score: finalScore, label, period, days: days_str, confidence, splitWeekend,
    lo, hi, halfWidth, headlineDay, consistency,
  };
}

// Fuse weekend conditions + flight pricing into one 0–100 deal score. Live
// prices only — estimates surface an "estimate" badge instead of a deal claim,
// and "low" forecast confidence never produces a unified score (don't sell
// certainty we don't have). Returns {score, conditions, priceRatio, isEstimate, label}.
function scoreWeekendDeal(venue, wx, marine, today, homeAirport, flight) {
  const conditions = scoreWeekend(venue, wx, marine, today);
  // Staleness gate: a "live" fare last seen >14 days ago is a different
  // animal than one scraped this morning. Demote to estimate so we don't
  // claim a deal off month-old data the carrier has since repriced.
  const ageMs = flight?.foundAt ? Date.now() - new Date(flight.foundAt).getTime() : 0;
  const isStale = flight?.foundAt && ageMs > 14 * 24 * 3600 * 1000;
  const isEstimate = !flight || flight.live !== true || isStale;
  if (isEstimate || !flight?.price) {
    return { score: null, conditions, priceRatio: null, isEstimate: true, label: null };
  }
  const typicalPrice = getTypicalPrice(venue, homeAirport || "JFK", today);
  const priceRatio = typicalPrice > 0 ? flight.price / typicalPrice : null;
  if (conditions.confidence === "low" || priceRatio == null) {
    // 7-day forecast horizon is the product, not a limit. Don't fabricate a
    // score for a weekend the forecast can't honestly back. ScoreBreakdown
    // surfaces this label so the user understands why the venue has no deal score.
    return { score: null, conditions, priceRatio, isEstimate: false, label: conditions.confidence === "low" ? "Beyond 7-day window" : null };
  }
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  // 50/50 weight: conditions and price each contribute equally to final score.
  // Both signals normalized 0–100. priceNorm: ratio 1.0 = 50 (par baseline),
  // 0.5 = 100 (50% off = max), 1.5 = 0 (50% above = min). Linear, clamped.
  // Future: let users pick the degree (DEAL_WEIGHT slider in profile).
  const DEAL_WEIGHT = 0.5;
  const conditionsNorm = conditions.score;
  const priceNorm = clamp(100 * (1.5 - priceRatio), 0, 100);
  // Medium-confidence (day-5 horizon) discount: 0.92× = ~8% haircut on the
  // final deal score. Conservative — enough to demote a borderline 80 below
  // a high-confidence 75, but small enough that a strong medium-confidence
  // weekend still surfaces. Low confidence is filtered above (returns null).
  const confMult = conditions.confidence === "medium" ? 0.92 : 1;
  const fuse = (cond) => Math.round(clamp(cond * (1 - DEAL_WEIGHT) + priceNorm * DEAL_WEIGHT, 0, 100) * confMult);
  let final = fuse(conditionsNorm);
  // Propagate the conditions band through the same fusion math so the deal
  // score's uncertainty is honest: a wide-band weekend produces a wide-band deal.
  const dealLo = fuse(conditions.lo ?? conditionsNorm);
  const dealHi = fuse(conditions.hi ?? conditionsNorm);
  // Volatile routes (wide per-origin price spread on this destination) need a
  // deeper discount before "Strong deal" is honest — otherwise a normal cheap-
  // origin fare gets dressed up as a deal. Stable routes keep the 0.85 floor.
  const strongDealRatio = getPriceVolatility(venue, homeAirport) === "volatile" ? 0.65 : 0.85;
  // Absolute-savings floor: 30% off an $80 fare is $24 — not a "deal" in any
  // meaningful sense. Require ≥$60 absolute savings before claiming Strong
  // deal or Rare alignment, scaled by typical price (cheap routes need less).
  const absSavings = typicalPrice - flight.price;
  const minSavings = Math.max(60, typicalPrice * 0.08);
  // "Solid weekend" also gates on a softer absolute-savings floor (50% of the
  // Strong deal floor). Without this, a strong conditions score + par price
  // earns the same "deal" label as a real discount, which makes the label a
  // mood ring rather than a signal.
  const solidMinSavings = Math.max(30, typicalPrice * 0.04);
  let label = null;
  if      (final >= 88 && priceRatio <= 0.7  && absSavings >= minSavings) label = "Rare alignment";
  else if (final >= 78 && priceRatio <= strongDealRatio && absSavings >= minSavings) label = "Strong deal";
  else if (final >= 70 && absSavings >= solidMinSavings)                  label = "Solid weekend";
  else if (final >= 60)                                                   label = "Worth a look";
  return {
    score: final, conditions, priceRatio, isEstimate: false, label,
    lo: dealLo, hi: dealHi, halfWidth: Math.max(dealHi - final, final - dealLo),
  };
}

// ─── Flight pricing via VPS proxy ────────────────────────────────────────────
// API token lives server-side on the VPS — never exposed in client code
const FLIGHT_PROXY = "https://peakly-api.duckdns.org";
let _flightApiStatus = "unknown"; // "live", "down", "unknown"
function getFlightApiStatus() { return _flightApiStatus; }

// Semaphore: max 3 concurrent flight API requests
const _flightSem = { count: 0, max: 3, queue: [] };
function _flightAcquire() {
  return new Promise(resolve => {
    if (_flightSem.count < _flightSem.max) { _flightSem.count++; resolve(); }
    else { _flightSem.queue.push(resolve); }
  });
}
function _flightRelease() {
  if (_flightSem.queue.length > 0) { _flightSem.queue.shift()(); }
  else { _flightSem.count = Math.max(0, _flightSem.count - 1); }
}

// Returns price number or null — caller falls back to BASE_PRICES estimate
// Includes retry with exponential backoff (up to 2 retries)
// Checks localStorage cache (15-min TTL) before hitting the API
//
// When departDate is provided (YYYY-MM-DD), the proxy filters month-matrix to
// entries on that exact depart and returns a single weekend-specific price —
// answers "what does THIS Fri-Mon cost" instead of "cheapest fare anyone
// found in the month." returnDate further constrains the round-trip.
// Cache key includes departDate so different weekends don't share entries.
async function fetchTravelpayoutsPrice(origin, destination, departDate, returnDate) {
  const cached = _flightCacheGet(origin, destination, departDate);
  if (cached !== null) return cached;

  await _flightAcquire();
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        let url = `${FLIGHT_PROXY}/api/flights`
          + `?origin=${encodeURIComponent(origin)}`
          + `&destination=${encodeURIComponent(destination)}`;
        if (departDate) url += `&depart_date=${encodeURIComponent(departDate)}`;
        if (returnDate) url += `&return_date=${encodeURIComponent(returnDate)}`;

        const r = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (r.status === 429 || r.status >= 500) {
          // Rate limited or server error — back off and retry
          if (attempt < 2) {
            await new Promise(res => setTimeout(res, (attempt + 1) * 1200));
            continue;
          }
          _flightApiStatus = "down"; return null;
        }
        if (!r.ok) { _flightApiStatus = "down"; return null; }

        const json = await r.json();
        if (!json.success) { _flightApiStatus = "down"; return null; }

        _flightApiStatus = "live";
        const destData = json.data?.[destination];
        if (!destData) return null;

        const entries = Object.values(destData)
          .filter(d => typeof d.price === "number" && d.price > 0);

        if (entries.length === 0) return null;
        const cheapest = entries.reduce((a, b) => a.price <= b.price ? a : b);
        const result = {
          price: Math.round(cheapest.price),
          foundAt: cheapest.found_at || new Date().toISOString(),
          departDate: cheapest.depart_date || departDate || null,
          returnDate: cheapest.return_date || returnDate || null,
        };
        _flightCacheSet(origin, destination, result, departDate);
        return result;
      } catch (err) {
        if (attempt < 2 && err.name !== "AbortError") {
          await new Promise(res => setTimeout(res, (attempt + 1) * 1200));
          continue;
        }
        _flightApiStatus = "down";
        console.warn("[Peakly] Flight API error:", err.name, err.message);
        return null;
      }
    }
    return null;
  } finally {
    _flightRelease();
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
  // Mexico beach
  OAX:{ JFK:480, LAX:360, SFO:400, ORD:460, MIA:380, SEA:500, BOS:520, ATL:440, DEN:420, DFW:380, LAS:380, PHX:340, MSP:500, DTW:490 },
  PVR:{ JFK:440, LAX:300, SFO:340, ORD:420, MIA:360, SEA:460, BOS:480, ATL:400, DEN:360, DFW:320, LAS:320, PHX:280, MSP:460, DTW:450 },
  // Hawaii beach
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

// Converts a WHEN_OPTIONS id to a departure date string (YYYY-MM-DD).
// 7-day forecast horizon is the product, not a limit — we removed >7-day
// options (twoweeks, month, nextmonth, 60days, 90days, seasons) because we
// can't honestly score conditions for them. Default = upcoming Friday.
function getFlightDate(whenId = "anytime") {
  const now = new Date();
  const add = (n) => { const d = new Date(now); d.setDate(d.getDate() + n); return d; };
  const fmt = d => d.toISOString().slice(0, 10);
  const upcomingFri = () => {
    const ds = now.getDay();
    const days = ds === 5 ? 0 : (5 - ds + 7) % 7;
    return fmt(add(days));
  };
  switch (whenId) {
    case "weekend":  return upcomingFri();
    case "nextweek": return upcomingFri();   // alias — both mean "this/next Fri"
    case "anytime":  return upcomingFri();
    default:         return upcomingFri();   // unknown ids fall back to upcoming Fri
  }
}
// Travelpayouts affiliate marker — replace with your marker from tp.media dashboard
const TP_MARKER = "710303";

// Build an Aviasales/Travelpayouts deep-link URL with pre-filled origin, destination, and dates
// Earns commission on flight bookings via Travelpayouts (Google Flights earns $0)
// BULLETPROOF: handles all edge cases — empty/null origin defaults to JFK, bad dates fall back gracefully
// URL format: https://www.aviasales.com/search/{ORIGIN}{DDMM_DEP}{DESTINATION}{DDMM_RET}1
// Example: JFK0804SFO15041 = JFK→SFO, depart Apr 8, return Apr 15, 1 passenger
// Seasonal multiplier on the annual-mean BASE_PRICES matrix. Without this,
// "deal" compares a live October LAX→PVR fare against a peak-season-blended
// baseline — off-season normal pricing reads as a deal, real off-season deals
// look like nothing. Bands are conservative; when in doubt, closer to 1.0 so
// we don't fabricate "deals" out of seasonal headwinds we can't measure.
// Real fix is Travelpayouts month-trend data, but this closes the worst hole
// today. Hemisphere derived from AP_CONTINENT (rough — Caribbean is N hemi
// but treated as latam-N here since latam includes Mexican beaches; the
// Caribbean curve is flatter anyway so the noise is small).
const getSeasonalMultiplier = (venue, today = new Date()) => {
  if (!venue?.category) return 1.0;
  const m = today.getMonth(); // 0=Jan
  // Prefer venue.lat (Brazil beaches are latam/N by continent but S by lat).
  // Fall back to continent guess when lat isn't available.
  const cont = AP_CONTINENT[venue.ap];
  const isSouthern = (typeof venue.lat === "number")
    ? venue.lat < 0
    : (cont === "oceania" || cont === "africa");
  if (venue.category === "skiing") {
    if (isSouthern) {
      if ([6, 7, 8].includes(m)) return 1.18;       // Jul–Sep peak (Aus/NZ)
      if ([5, 9].includes(m))    return 1.00;       // Jun, Oct shoulder
      return 0.78;
    }
    if ([11, 0, 1, 2].includes(m)) return 1.18;    // Dec–Mar peak (N hemi)
    if ([3, 10].includes(m))       return 1.00;    // Apr, Nov shoulder
    return 0.78;                                    // May–Oct off
  }
  if (venue.category === "beach") {
    if (isSouthern) {
      if ([11, 0, 1].includes(m)) return 1.16;     // Dec–Feb peak (Aus/NZ)
      if ([10, 2].includes(m))    return 1.00;
      return 0.86;
    }
    if ([5, 6, 7].includes(m)) return 1.16;        // Jun–Aug peak (N hemi)
    if ([4, 8].includes(m))    return 1.00;
    return 0.86;
  }
  return 1.0;
};

// Typical round-trip price for a venue from a given home airport, adjusted
// for time-of-year. Without seasonal awareness, "deal" comparisons are
// against an annual-mean baseline — which means off-season normal pricing
// reads as a deal and real off-season deals are masked.
// Same source of truth as getFlightDeal so "typical" and "estimate" agree.
const getTypicalPrice = (venue, homeAirport = "JFK", today = new Date()) => {
  const ap = venue?.ap;
  if (!ap) return 800;
  let base;
  const exact = BASE_PRICES[ap]?.[homeAirport];
  if (exact) base = exact;
  else {
    const destCont = AP_CONTINENT[ap] || null;
    const homeCont = AP_CONTINENT[homeAirport] || "na";
    if (!destCont) base = 800;
    else if (destCont === homeCont) base = homeCont === "na" ? 350 : 450;
    else {
      const routes = {
        "na-europe":750, "na-asia":1100, "na-oceania":1500, "na-latam":650, "na-africa":1200,
        "europe-na":750, "europe-asia":900, "europe-oceania":1600, "europe-latam":1000, "europe-africa":700,
        "asia-na":1100, "asia-europe":900, "asia-oceania":800, "asia-latam":1400, "asia-africa":1100,
        "oceania-na":1500, "oceania-europe":1600, "oceania-asia":800, "oceania-latam":1800, "oceania-africa":1700,
        "latam-na":650, "latam-europe":1000, "latam-asia":1400, "latam-oceania":1800, "latam-africa":1400,
        "africa-na":1200, "africa-europe":700, "africa-asia":1100, "africa-oceania":1700, "africa-latam":1400,
      };
      base = routes[`${homeCont}-${destCont}`] || 800;
    }
  }
  return Math.round(base * getSeasonalMultiplier(venue, today));
};

// Deal fraction: positive = below typical, negative = above. Only meaningful
// for LIVE prices (estimates always return 0 since price == typical by construction).
const getDealScore = (currentPrice, venue, homeAirport = "JFK", today = new Date()) => {
  if (!currentPrice || currentPrice <= 0) return 0;
  const typical = getTypicalPrice(venue, homeAirport, today);
  if (typical <= 0) return 0;
  return (typical - currentPrice) / typical;
};

// NB: name is historical — measures CROSS-ORIGIN price spread within
// BASE_PRICES, not temporal price volatility on the route. Real-world
// volatility would need Travelpayouts trend data we don't have.
//
// What it does: "Volatile" routes have a wide BASE_PRICES spread across home
// airports for the same destination — e.g. LAS ranges $80–$340 by origin
// (CV ~0.35). A price below the per-pair "typical" on those routes is often
// just the normal floor for some origins, not a real deal. "Stable" long-haul
// routes (narrow spread) make `typical` a reliable anchor. scoreWeekendDeal
// uses this to require a deeper discount on volatile routes before "Strong
// deal." Threshold: coefficient of variation > 0.30. Conservative default
// "stable" when data is missing — don't tighten ratio if we can't measure.
function getPriceVolatility(venue, homeAirport) {
  const ap = venue?.ap;
  const row = ap && BASE_PRICES[ap];
  if (!row) return "stable";
  const prices = Object.values(row).filter(p => typeof p === "number" && p > 0);
  if (prices.length < 5) return "stable";
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  if (mean <= 0) return "stable";
  const stddev = Math.sqrt(prices.reduce((a, p) => a + (p - mean) ** 2, 0) / prices.length);
  return (stddev / mean) > 0.30 ? "volatile" : "stable";
}

function buildFlightUrl(from, to, opts) {
  // BULLETPROOF: handles all edge cases for flight URL construction
  const safeFrom = (from && from.trim()) || "JFK";
  if (!safeFrom || safeFrom === "JFK" && !from) console.warn("[buildFlightUrl] no origin, using JFK fallback", { from, to });
  const safeTo = to && to.trim();
  // Return "#" (not aviasales home) so broken links are obvious and non-navigating
  if (!safeTo) { console.warn("[buildFlightUrl] no destination, returning #", { from, to }); return "#"; }
  const whenId = opts?.whenId || "anytime";
  const depISO = (opts?.startDate && String(opts.startDate).length >= 10) ? opts.startDate : getFlightDate(whenId);
  const retISO = (() => {
    if (opts?.endDate && String(opts.endDate).length >= 10) return opts.endDate;
    try { const d = new Date(depISO); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); }
    catch(e) { return getFlightDate("anytime"); }
  })();
  // Aviasales date format is DDMM (4 chars), NOT YYMMDD
  const toDDMM = iso => (iso && iso.length >= 10) ? iso.slice(8, 10) + iso.slice(5, 7) : null;
  const depDDMM = toDDMM(depISO);
  const retDDMM = toDDMM(retISO);
  try {
    const datePart = (depDDMM && retDDMM) ? `${depDDMM}${safeTo}${retDDMM}` : safeTo;
    const aviasalesSearch = `https://www.aviasales.com/search/${safeFrom}${datePart}1`;
    if (TP_MARKER && TP_MARKER !== "YOUR_TP_MARKER") {
      return `https://tp.media/r?marker=${TP_MARKER}&p=4114&u=${encodeURIComponent(aviasalesSearch)}`;
    }
    return aviasalesSearch;
  } catch(e) {
    console.warn("buildFlightUrl error:", e);
    return `https://www.aviasales.com/search/${safeFrom}${safeTo}1`;
  }
}

// Returns human-readable relative time string for a UTC ISO timestamp (e.g. "2h ago", "Mar 29")
function relTime(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return null;
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.round(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month:"short", day:"numeric" });
}

// ─── Share venue ──────────────────────────────────────────────────────────────
// Uses Web Share API if available, falls back to clipboard copy
function shareVenue(listing, onCopied) {
  const url = `https://j1mmychu.github.io/peakly/#venue-${listing.id}`;
  const text = `Check out ${listing.title} on Peakly — conditions are ${listing.conditionLabel}! ${listing.conditionScore}/100`;
  logEvent('share_click', { venue: listing.title, score: listing.conditionScore });
  if (navigator.share) {
    navigator.share({ title: listing.title, text, url }).catch(() => {});
  } else {
    try {
      navigator.clipboard?.writeText(`${text}\n${url}`)
        .then(() => onCopied && onCopied())
        .catch(() => onCopied && onCopied());
    } catch { onCopied && onCopied(); }
  }
}

// ─── Share a named list (viral loop) ──────────────────────────────────────────
// Snapshots the list to Supabase shared_lists, returns a shareable URL with
// referrer attribution (?l=<slug>&r=<owner_id>). Falls through to native
// share / clipboard copy. Requires sign-in (sharer must be a real user_id).
const _SLUG_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // omit 0/o/1/l/i for readability
function _generateSlug(len = 8) {
  const buf = new Uint8Array(len);
  (window.crypto || window.msCrypto).getRandomValues(buf);
  let out = "";
  for (let i = 0; i < len; i++) out += _SLUG_ALPHABET[buf[i] % _SLUG_ALPHABET.length];
  return out;
}
async function shareList(list, cloudSync, onResult) {
  // onResult({status: "needs_signin" | "shared" | "copied" | "error", url?, error?})
  if (!list || !list.venueIds || list.venueIds.length === 0) {
    onResult && onResult({ status: "error", error: "Add some venues first" });
    return;
  }
  if (!cloudSync?.user) {
    onResult && onResult({ status: "needs_signin" });
    return;
  }
  try {
    const client = await ensureSupabase();
    if (!client) throw new Error("Cloud sync unavailable");
    const slug = _generateSlug(8);
    const { error } = await client.from("shared_lists").insert({
      slug,
      owner_id: list.id === "favorites" ? cloudSync.user.id : cloudSync.user.id,
      source_list_id: list.id,
      name: list.name,
      emoji: list.emoji || "🗺️",
      venue_ids: list.venueIds,
    });
    if (error) throw error;
    const url = `https://j1mmychu.github.io/peakly/?l=${slug}&r=${cloudSync.user.id}`;
    const text = `${list.emoji || "🗺️"} ${list.name} on Peakly — ${list.venueIds.length} weekend spots`;
    logEvent("list_share", { slug, list_id: list.id, venue_count: list.venueIds.length });
    if (navigator.share) {
      try {
        await navigator.share({ title: `${list.name} on Peakly`, text, url });
        onResult && onResult({ status: "shared", url });
        return;
      } catch { /* user cancelled — fall through to clipboard */ }
    }
    try {
      await navigator.clipboard?.writeText(url);
      onResult && onResult({ status: "copied", url });
    } catch {
      onResult && onResult({ status: "shared", url });
    }
  } catch (e) {
    logEvent("list_share_error", { message: String(e?.message || e) });
    onResult && onResult({ status: "error", error: String(e?.message || e) });
  }
}

// ─── Fetch a shared list snapshot by slug (public read) ───────────────────────
async function fetchSharedList(slug) {
  try {
    const client = await ensureSupabase();
    if (!client) return null;
    const { data, error } = await client
      .from("shared_lists")
      .select("slug, owner_id, name, emoji, venue_ids, view_count")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    // Fire-and-forget view increment (RPC, anon-callable)
    client.rpc("bump_share_view", { p_slug: slug }).catch(() => {});
    return data;
  } catch { return null; }
}

// ─── Travelpayouts real pricing (LIVE) ────────────────────────────────────────
// Real prices fetched via fetchTravelpayoutsPrice() in the App useEffect.
// getFlightDeal() is the instant fallback when API hasn't responded yet.
// ─────────────────────────────────────────────────────────────────────────────
// Instant price estimate shown BEFORE Travelpayouts responds.
// Returns the TYPICAL price, not a fake "X% off" number. Users see honest
// baseline data that the live fetch can then undercut if there's a real deal.
// No more fabricated 28-75% discounts passed off as real prices.
function getFlightDeal(ap, homeAirport = "JFK") {
  if (!homeAirport || typeof homeAirport !== "string" || homeAirport.trim().length < 3) homeAirport = "JFK";
  const base = getTypicalPrice({ ap }, homeAirport);
  return {
    price: base,        // honest: the typical price
    normal: base,       // typical == price when no live data
    pct: 0,             // no claimed discount
    from: homeAirport,
    isEstimate: true,
  };
}

// ─── Geolocation: nearest airport detection ──────────────────────────────────
const AIRPORT_COORDS = {
  JFK:{lat:40.6413,lon:-73.7781},  LAX:{lat:33.9425,lon:-118.4081}, SFO:{lat:37.6213,lon:-122.3790},
  ORD:{lat:41.9742,lon:-87.9073},  MIA:{lat:25.7959,lon:-80.2870},  SEA:{lat:47.4502,lon:-122.3088},
  BOS:{lat:42.3656,lon:-71.0096},  ATL:{lat:33.6407,lon:-84.4277},  DEN:{lat:39.8561,lon:-104.6737},
  DFW:{lat:32.8998,lon:-97.0403},  LAS:{lat:36.0840,lon:-115.1537}, PHX:{lat:33.4373,lon:-112.0078},
  PDX:{lat:45.5898,lon:-122.5951}, SLC:{lat:40.7899,lon:-111.9791}, HNL:{lat:21.3245,lon:-157.9251},
  ANC:{lat:61.1743,lon:-149.9963}, IAD:{lat:38.9531,lon:-77.4565},  DCA:{lat:38.8512,lon:-77.0402},
  EWR:{lat:40.6895,lon:-74.1745},  PHL:{lat:39.8744,lon:-75.2424},  IAH:{lat:29.9844,lon:-95.3414},
  DTW:{lat:42.2124,lon:-83.3534},  MSP:{lat:44.8848,lon:-93.2223},  MCO:{lat:28.4312,lon:-81.3081},
  TPA:{lat:27.9755,lon:-82.5332},  FLL:{lat:26.0726,lon:-80.1527},  SAN:{lat:32.7341,lon:-117.1897},
  BNA:{lat:36.1263,lon:-86.6774},  RDU:{lat:35.8801,lon:-78.7880},  AUS:{lat:30.1975,lon:-97.6664},
  SAT:{lat:29.5337,lon:-98.4698},  MSY:{lat:29.9934,lon:-90.2580},  STL:{lat:38.7487,lon:-90.3700},
  CLE:{lat:41.4058,lon:-81.8498},  SJC:{lat:37.3626,lon:-121.9290}, SMF:{lat:38.6954,lon:-121.5908},
  RNO:{lat:39.4991,lon:-119.7681}, MDW:{lat:41.7868,lon:-87.7522},  MKE:{lat:42.9472,lon:-87.8966},
  BUF:{lat:42.9405,lon:-78.7322},  PIT:{lat:40.4915,lon:-80.2329},  CMH:{lat:39.9980,lon:-82.8919},
  IND:{lat:39.7173,lon:-86.2944},  DSM:{lat:41.5330,lon:-93.6631},  OMA:{lat:41.3032,lon:-95.8942},
  ICT:{lat:37.6499,lon:-97.4331},  LIT:{lat:34.7294,lon:-92.2243},  MEM:{lat:35.0421,lon:-89.9767},
  BHM:{lat:33.5629,lon:-86.7535},  RIC:{lat:37.5052,lon:-77.3197},  ORF:{lat:36.8976,lon:-76.0132},
  GSP:{lat:34.8957,lon:-82.2189},  CHS:{lat:32.8986,lon:-80.0405},  JAX:{lat:30.4941,lon:-81.6879},
  BOI:{lat:43.5644,lon:-116.2228}, GEG:{lat:47.6199,lon:-117.5338}, ABQ:{lat:35.0402,lon:-106.6090},
  OKC:{lat:35.3931,lon:-97.6007},  TUL:{lat:36.1984,lon:-95.8881},  MHT:{lat:42.9326,lon:-71.4357},
  ALB:{lat:42.7483,lon:-73.8019},  SYR:{lat:43.1112,lon:-76.1063},  BDL:{lat:41.9389,lon:-72.6832},
  // US ski/beach gateways referenced by VENUES
  ASE:{lat:39.2232,lon:-106.8687}, BTV:{lat:44.4719,lon:-73.1533},  BZN:{lat:45.7775,lon:-111.1530},
  EGE:{lat:39.6426,lon:-106.9177}, EYW:{lat:24.5561,lon:-81.7595},  FCA:{lat:48.3105,lon:-114.2560},
  GUC:{lat:38.5340,lon:-106.9332}, HDN:{lat:40.4811,lon:-107.2178}, JAC:{lat:43.6073,lon:-110.7377},
  KOA:{lat:19.7388,lon:-156.0457}, MTJ:{lat:38.5098,lon:-107.8941}, MYR:{lat:33.6797,lon:-78.9283},
  OGG:{lat:20.8987,lon:-156.4305}, RDD:{lat:40.5090,lon:-122.2934}, SAF:{lat:35.6171,lon:-106.0883},
  SNA:{lat:33.6757,lon:-117.8682}, SRQ:{lat:27.3954,lon:-82.5544},  SUN:{lat:43.5044,lon:-114.2965},
  VPS:{lat:30.4832,lon:-86.5254},
  // Canada
  YKA:{lat:50.7022,lon:-120.4441}, YLW:{lat:49.9561,lon:-119.3779}, YVR:{lat:49.1939,lon:-123.1844},
  YYC:{lat:51.1138,lon:-114.0203},
  // Caribbean / Mexico / Central America
  AUA:{lat:12.5014,lon:-70.0152},  AXA:{lat:18.2048,lon:-63.0551},  BGI:{lat:13.0746,lon:-59.4925},
  BOC:{lat:9.3408,lon:-82.2508},   CUN:{lat:21.0365,lon:-86.8771},  CZM:{lat:20.5224,lon:-86.9285},
  GCM:{lat:19.2929,lon:-81.3577},  HUX:{lat:15.7754,lon:-96.2625},  MBJ:{lat:18.5037,lon:-77.9133},
  PLS:{lat:21.7736,lon:-72.2659},  PVR:{lat:20.6801,lon:-105.2543}, SJD:{lat:23.1518,lon:-109.7211},
  SJO:{lat:9.9939,lon:-84.2088},   STT:{lat:18.3373,lon:-64.9734},  SXM:{lat:18.0410,lon:-63.1099},
  TAB:{lat:11.1497,lon:-60.8322},  UVF:{lat:13.7332,lon:-60.9526},
  // South America
  FEN:{lat:-3.8541,lon:-32.4233},  FLN:{lat:-27.6703,lon:-48.5527}, SCL:{lat:-33.3930,lon:-70.7858},
  USH:{lat:-54.8433,lon:-68.2958}, ZCO:{lat:-38.9263,lon:-72.6517},
  BRC:{lat:-41.1512,lon:-71.1575}, MDZ:{lat:-32.8317,lon:-68.7928}, CPC:{lat:-40.0754,lon:-71.1373},
  NQN:{lat:-38.9490,lon:-68.1557},
  // Europe — ski gateways
  CMF:{lat:45.6381,lon:5.8800},    GVA:{lat:46.2381,lon:6.1090},    INN:{lat:47.2603,lon:11.3438},
  INV:{lat:57.5425,lon:-4.0475},   KRK:{lat:50.0777,lon:19.7848},   OSL:{lat:60.1939,lon:11.1004},
  SOF:{lat:42.6967,lon:23.4114},   SZG:{lat:47.7933,lon:13.0043},   TBS:{lat:41.6694,lon:44.9547},
  TRN:{lat:45.2008,lon:7.6496},    ZRH:{lat:47.4647,lon:8.5492},
  // Europe — beach gateways
  CAG:{lat:39.2515,lon:9.0543},    DBV:{lat:42.5614,lon:18.2683},   DLM:{lat:36.7131,lon:28.7925},
  EAS:{lat:43.3565,lon:-1.7906},   FAO:{lat:37.0144,lon:-7.9659},   IBZ:{lat:38.8729,lon:1.3731},
  JMK:{lat:37.4351,lon:25.3481},   JNX:{lat:37.0811,lon:25.3683},   JTR:{lat:36.3992,lon:25.4793},
  MAH:{lat:39.8626,lon:4.2186},    MLO:{lat:36.6967,lon:24.4769},   NAP:{lat:40.8860,lon:14.2908},
  NCE:{lat:43.6584,lon:7.2159},    PMI:{lat:39.5517,lon:2.7388},    RHO:{lat:36.4054,lon:28.0862},
  SPU:{lat:43.5389,lon:16.2980},   TPS:{lat:37.9114,lon:12.4881},
  // Asia
  BEY:{lat:33.8208,lon:35.4884},   CMB:{lat:7.1808,lon:79.8841},    CTS:{lat:42.7752,lon:141.6923},
  DAD:{lat:16.0439,lon:108.1992},  DPS:{lat:-8.7482,lon:115.1672},  ENI:{lat:11.2024,lon:119.4154},
  GOI:{lat:15.3808,lon:73.8314},   HKT:{lat:8.1132,lon:98.3169},    HNA:{lat:39.4286,lon:141.1351},
  KBV:{lat:8.0991,lon:98.9862},    KUL:{lat:2.7456,lon:101.7099},   LOP:{lat:-8.7572,lon:116.2769},
  MCT:{lat:23.5933,lon:58.2844},   MLE:{lat:4.1918,lon:73.5290},    MPH:{lat:11.9244,lon:121.9534},
  NRT:{lat:35.7720,lon:140.3929},  PQC:{lat:10.2270,lon:103.9670},  USM:{lat:9.5479,lon:100.0617},
  // Middle East / North Africa
  RAK:{lat:31.6068,lon:-8.0363},
  // Oceania
  AIT:{lat:-18.8309,lon:-159.7641}, BME:{lat:-17.9447,lon:122.2317}, BOB:{lat:-16.4444,lon:-151.7510},
  CBR:{lat:-35.3069,lon:149.1947},  CNS:{lat:-16.8858,lon:145.7553}, LEA:{lat:-22.2356,lon:114.0889},
  NAN:{lat:-17.7553,lon:177.4413},  PPP:{lat:-20.4950,lon:148.5524}, SYD:{lat:-33.9461,lon:151.1772},
  ZQN:{lat:-45.0211,lon:168.7392},  CHC:{lat:-43.4894,lon:172.5320}, MEL:{lat:-37.6690,lon:144.8410},
  // Sub-Saharan Africa + Indian Ocean
  INH:{lat:-23.8764,lon:35.4085},  MBA:{lat:-4.0348,lon:39.5942},   MRU:{lat:-20.4302,lon:57.6836},
  PRI:{lat:-4.3193,lon:55.6914},   SEZ:{lat:-4.6743,lon:55.5217},   ZNZ:{lat:-6.2222,lon:39.2249},
};

// ─── Great-circle flight time estimate ────────────────────────────────────────
// Used by the "Within Xhr flight" Explore filter. Avg cruise = 500 mph,
// add 0.5h for taxi+climb+descend buffer. Returns null if either airport
// has no coords on file (e.g. tiny regional in our coord table — let it
// pass the filter rather than hide it). Same-airport returns 0.
function flightHours(originAp, destAp) {
  if (!originAp || !destAp) return null;
  if (originAp === destAp) return 0;
  const a = AIRPORT_COORDS[originAp];
  const b = AIRPORT_COORDS[destAp];
  if (!a || !b) return null;
  const toRad = d => d * Math.PI / 180;
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const sa = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon/2)**2;
  const dist = 2 * R * Math.asin(Math.sqrt(sa));
  return (dist / 500) + 0.5;
}

// ─── Seasonal default category ────────────────────────────────────────────────
// Open the app on the right pill for the right season, based on the user's
// hemisphere (derived from their home airport's lat). N. summer May-Aug → beach,
// N. winter Nov-Apr → skiing, shoulder months → all. S. hemisphere = inverse.
// User can still tap any pill — this only affects the initial render of
// each fresh session (not persisted).
function seasonalDefaultCat(homeAirport) {
  const ap = AIRPORT_COORDS[homeAirport];
  const isNorth = ap ? ap.lat >= 0 : true;
  const m = new Date().getMonth() + 1; // 1-12
  if (isNorth) {
    if (m >= 5 && m <= 8)  return "beach";
    if (m >= 11 || m <= 4) return "skiing";
    return "all";
  } else {
    if (m >= 11 || m <= 2) return "beach";
    if (m >= 5 && m <= 8)  return "skiing";
    return "all";
  }
}

function findNearestAirport(userLat, userLon) {
  let nearest = "JFK", minDist = Infinity;
  const toRad = d => d * Math.PI / 180;
  Object.entries(AIRPORT_COORDS).forEach(([code, c]) => {
    const dlat = toRad(userLat - c.lat), dlon = toRad(userLon - c.lon);
    const a = Math.sin(dlat/2)**2 + Math.cos(toRad(userLat)) * Math.cos(toRad(c.lat)) * Math.sin(dlon/2)**2;
    const dist = 2 * Math.asin(Math.sqrt(a));
    if (dist < minDist) { minDist = dist; nearest = code; }
  });
  return nearest;
}

// Airport code → city name for user-friendly display
const AIRPORT_CITY = {
  JFK:"New York",LAX:"Los Angeles",SFO:"San Francisco",ORD:"Chicago",MIA:"Miami",
  SEA:"Seattle",BOS:"Boston",ATL:"Atlanta",DFW:"Dallas",DEN:"Denver",LAS:"Las Vegas",
  PHX:"Phoenix",MSP:"Minneapolis",DTW:"Detroit",SLC:"Salt Lake City",ANC:"Anchorage",
  HNL:"Honolulu",SAN:"San Diego",OGG:"Maui",YVR:"Vancouver",YYC:"Calgary",
  RNO:"Reno",BZN:"Bozeman",ASE:"Aspen",JAC:"Jackson Hole",
  EWR:"Newark",PHL:"Philadelphia",IAH:"Houston",MCO:"Orlando",TPA:"Tampa",
  FLL:"Fort Lauderdale",BNA:"Nashville",RDU:"Raleigh",AUS:"Austin",SAT:"San Antonio",
  STL:"St. Louis",CLE:"Cleveland",MKE:"Milwaukee",BUF:"Buffalo",SJC:"San Jose",
  OAK:"Oakland",SMF:"Sacramento",ABQ:"Albuquerque",MCI:"Kansas City",PIT:"Pittsburgh",
  CMH:"Columbus",RSW:"Fort Myers",CHS:"Charleston",SAV:"Savannah",JAX:"Jacksonville",
  BUR:"Burbank",CLT:"Charlotte",IND:"Indianapolis",CVG:"Cincinnati",TUS:"Tucson",
  OKC:"Oklahoma City",MEM:"Memphis",SDF:"Louisville",PBI:"West Palm Beach",
  BOI:"Boise",GEG:"Spokane",BHM:"Birmingham",RIC:"Richmond",PDX:"Portland",
  YYZ:"Toronto",YUL:"Montreal",YEG:"Edmonton",YOW:"Ottawa",
  MHT:"Manchester",CRW:"Charleston",GUC:"Gunnison",GPI:"Kalispell",BTV:"Burlington",ALB:"Albany",

  ABJ:"Abidjan",
  ACC:"Accra",
  ACE:"Lanzarote",
  ACV:"Arcata",
  AGA:"Agadir",
  AGD:"Anglia",
  AKL:"Auckland",
  APW:"Apia",
  AQT:"Quito",
  BFS:"Belfast",
  BGI:"Bridgetown",
  BHD:"Belfast",
  BIO:"Bilbao",
  BIQ:"Biarritz",
  BKK:"Bangkok",
  BOC:"Bocas del Toro",
  BOD:"Bordeaux",
  BRI:"Bari",
  BTJ:"Banda Aceh",
  CEB:"Cebu",
  CMB:"Colombo",
  COK:"Kochi",
  CPT:"Cape Town",
  CRK:"Clark",
  CWL:"Cardiff",
  DIL:"Dili",
  DPS:"Denpasar",
  DSS:"Dakar",
  DUB:"Dublin",
  DUR:"Durban",
  EUG:"Eugene",
  EXT:"Exeter",
  FAO:"Faro",
  FLN:"Florianópolis",
  FOR:"Fortaleza",
  FSZ:"Shizuoka",
  FUE:"Fuerteventura",
  GIG:"Rio de Janeiro",
  GIS:"Gisborne",
  GTW:"London Gatwick",
  HBA:"Hobart",
  ILH:"Ilhéus",
  INV:"Inverness",
  KEF:"Reykjavik",
  KHH:"Kaohsiung",
  KMI:"Miyazaki",
  LBJ:"Labuan Bajo",
  LGW:"London Gatwick",
  LIH:"Lihue",
  LIM:"Lima",
  LIR:"Liberia",
  LIS:"Lisbon",
  LOP:"Lombok",
  LPA:"Las Palmas",
  MAN:"Manchester",
  MAO:"Manaus",
  MCT:"Muscat",
  MDN:"Medan",
  MEC:"Manta",
  MEL:"Melbourne",
  MFR:"Medford",
  MGA:"Managua",
  MLE:"Malé",
  MQT:"Mossel Bay",
  MRU:"Mauritius",
  NAN:"Nadi",
  NAT:"Natal",
  NHA:"Nha Trang",
  NQY:"Newquay",
  NRT:"Tokyo Narita",
  OAX:"Oaxaca",
  OOL:"Gold Coast",
  ORF:"Norfolk",
  PDG:"Padang",
  PEK:"Beijing",
  PER:"Perth",
  PLZ:"Port Elizabeth",
  PPT:"Papeete",
  PVR:"Puerto Vallarta",
  RCN:"Rincón",
  REC:"Recife",
  RUN:"Réunion",
  SAL:"San Salvador",
  SBA:"Santa Barbara",
  SBY:"Surabaya",
  SCL:"Santiago",
  SJO:"San José",
  SJU:"San Juan",
  SNA:"Santa Ana",
  SNN:"Shannon",
  SPC:"La Palma",
  SSC:"Sumter",
  SUB:"Surabaya",
  SUM:"Palembang",
  TFS:"Tenerife",
  TKG:"Bandar Lampung",
  TLV:"Tel Aviv",
  TNR:"Antananarivo",
  TPE:"Taipei",
  TPP:"Tarapoto",
  TRU:"Trujillo",
  UIO:"Quito",
  VCT:"Victoria",
  VDE:"Valverde",
  VLI:"Port Vila",
};

// ─── activity-specific fallback photos ────────────────────────────────────────
// Accepts (name, category) — name is unused but reserved for future personalized queries.
// Uses stable Unsplash photo IDs (never source.unsplash.com which is rate-limited).
function getVenuePhoto(name, category) {
  // Support legacy single-arg call: getVenuePhoto(category)
  const cat = (category || name || "").toLowerCase();
  const photos = {
    skiing: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&h=600&fit=crop",
    beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
    beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
  };
  return photos[cat] || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop";
}

// ─── localStorage hook ────────────────────────────────────────────────────────
function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      let s = localStorage.getItem(key);
      if (s) {
        let mutated = false;
        // 2026-05-03 pivot: tanning → beach
        if (s.includes('"tanning"')) {
          s = s.replace(/"tanning"/g, '"beach"');
          mutated = true;
        }
        // 2026-05-03 pivot: surfing retired. Strip from any stored state so
        // ghost badges / orphan alerts don't render. Drop from arrays first
        // (profile.sports), then rewrite remaining property values
        // (alert.sport, etc) to "skiing" so they stay editable.
        if (s.includes('"surfing"')) {
          s = s.replace(/"surfing"\s*,\s*/g, '');
          s = s.replace(/,\s*"surfing"/g, '');
          s = s.replace(/"surfing"/g, '"skiing"');
          mutated = true;
        }
        if (mutated) localStorage.setItem(key, s);
      }
      return s ? JSON.parse(s) : initial;
    }
    catch { return initial; }
  });
  const save = useCallback(v => {
    setVal(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      // Notify cloud-sync hook (if any) that a synced key changed. Caches +
      // device-specific keys are not in SYNCED_KEYS so they don't trigger.
      if (SYNCED_KEYS.includes(key)) {
        try { window.dispatchEvent(new CustomEvent("peakly-sync-dirty", { detail: { key } })); } catch {}
      }
      return next;
    });
  }, [key]);
  return [val, save];
}

// ─── useCloudSync — magic-link auth + debounced background sync ───────────────
// Returns: { enabled, status, user, signIn(email), signOut(), syncNow() }
//   status: "disabled" | "offline" | "signed_out" | "checking_email"
//         | "syncing" | "synced" | "error"
// When enabled and signed-in: pushes the SYNCED_KEYS subset of localStorage
// to user_data.data on any write (500ms debounce). On sign-in / app open,
// pulls server state if newer than local lastSync. Last-writer-wins.
function useCloudSync() {
  const [user, setUser]         = useState(null);
  const [status, setStatus]     = useState(CLOUD_SYNC_CONFIGURED ? "signed_out" : "disabled");
  const dirtyRef                = useRef(false);
  const debounceRef             = useRef(null);
  const inFlightRef             = useRef(false);

  const readLocal = useCallback(() => {
    const out = {};
    for (const k of SYNCED_KEYS) {
      try { const raw = localStorage.getItem(k); if (raw) out[k] = JSON.parse(raw); } catch {}
    }
    return out;
  }, []);

  const writeLocal = useCallback((blob) => {
    if (!blob || typeof blob !== "object") return;
    for (const k of SYNCED_KEYS) {
      if (blob[k] !== undefined) {
        try { localStorage.setItem(k, JSON.stringify(blob[k])); } catch {}
      }
    }
    try { localStorage.setItem("peakly_last_sync", String(Date.now())); } catch {}
    try { window.dispatchEvent(new Event("peakly-sync-pulled")); } catch {}
  }, []);

  const pushNow = useCallback(async () => {
    if (!CLOUD_SYNC_CONFIGURED || !user || inFlightRef.current) return;
    inFlightRef.current = true;
    setStatus("syncing");
    const data = readLocal();
    try {
      const client = await ensureSupabase();
      if (!client) throw new Error("Supabase not configured");
      const { error } = await client
        .from("user_data")
        .upsert({ user_id: user.id, email: user.email, data, updated_at: new Date().toISOString() });
      if (error) throw error;
      try { localStorage.setItem("peakly_last_sync", String(Date.now())); } catch {}
      dirtyRef.current = false;
      setStatus("synced");
    } catch (e) {
      logEvent("cloud_sync_error", { stage: "push", message: String(e?.message || e) });
      setStatus("error");
    } finally {
      inFlightRef.current = false;
    }
  }, [user, readLocal]);

  const pullNow = useCallback(async () => {
    if (!CLOUD_SYNC_CONFIGURED || !user) return;
    setStatus("syncing");
    try {
      const client = await ensureSupabase();
      if (!client) throw new Error("Supabase not configured");
      const { data: row, error } = await client
        .from("user_data")
        .select("data, updated_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (row && row.data) {
        const lastSync = parseInt(localStorage.getItem("peakly_last_sync") || "0", 10);
        const serverTs = new Date(row.updated_at).getTime();
        if (serverTs > lastSync) writeLocal(row.data);
      } else {
        await pushNow();
        return;
      }
      setStatus("synced");
    } catch (e) {
      logEvent("cloud_sync_error", { stage: "pull", message: String(e?.message || e) });
      setStatus("error");
    }
  }, [user, writeLocal, pushNow]);

  // Listen for synced-key writes; debounce push by 500ms (only meaningful
  // once user is signed in; before that we just mark dirty for later push).
  useEffect(() => {
    if (!CLOUD_SYNC_CONFIGURED) return;
    const onDirty = () => {
      dirtyRef.current = true;
      if (!user) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => { pushNow(); }, 500);
    };
    window.addEventListener("peakly-sync-dirty", onDirty);
    return () => {
      window.removeEventListener("peakly-sync-dirty", onDirty);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [user, pushNow]);

  // On mount: ONLY load Supabase if there's an existing session in localStorage
  // OR a magic-link callback in the URL. Anonymous first-time visitors don't
  // pay the bundle cost. ProfileSyncSection triggers ensureSupabase() on first
  // user interaction (sign-in tap) for everyone else.
  useEffect(() => {
    if (!CLOUD_SYNC_CONFIGURED) return;
    if (!_hasExistingSupabaseSession() && !_hasMagicLinkCallbackInUrl()) return;
    let unsub = null;
    (async () => {
      try {
        const client = await ensureSupabase();
        if (!client) return;
        const { data } = await client.auth.getSession();
        if (data?.session?.user) setUser(data.session.user);
        const { data: sub } = client.auth.onAuthStateChange((_evt, session) => {
          setUser(session?.user || null);
          if (!session) setStatus("signed_out");
        });
        unsub = sub?.subscription?.unsubscribe;
      } catch (e) {
        logEvent("cloud_sync_error", { stage: "init", message: String(e?.message || e) });
      }
    })();
    return () => { try { unsub && unsub(); } catch {} };
  }, []);

  useEffect(() => {
    if (!CLOUD_SYNC_CONFIGURED) return;
    if (!user) return;
    pullNow();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!CLOUD_SYNC_CONFIGURED) return;
    const onOff = () => setStatus("offline");
    const onOn  = () => { if (user) pushNow(); };
    window.addEventListener("offline", onOff);
    window.addEventListener("online", onOn);
    return () => {
      window.removeEventListener("offline", onOff);
      window.removeEventListener("online", onOn);
    };
  }, [user, pushNow]);

  const signIn = useCallback(async (email, profileMeta) => {
    if (!CLOUD_SYNC_CONFIGURED) return { ok: false, error: "Cloud sync disabled" };
    if (!email || !email.includes("@")) return { ok: false, error: "Enter a valid email" };
    setStatus("syncing");
    try {
      // First sign-in attempt triggers the Supabase library load. After that
      // the auth listener stays mounted for the rest of the session.
      const client = await ensureSupabase();
      if (!client) throw new Error("Supabase failed to load");
      // If we hadn't attached onAuthStateChange yet (cold-start), do it now
      // so the magic-link callback flips the user state.
      if (!useCloudSync._authListenerAttached) {
        client.auth.onAuthStateChange((_evt, session) => {
          setUser(session?.user || null);
          if (!session) setStatus("signed_out");
        });
        useCloudSync._authListenerAttached = true;
      }
      // Optional name + phone get attached to auth.users.user_metadata so the
      // info is recoverable from Supabase even if the user_data jsonb gets
      // wiped. They also live in localStorage peakly_profile and sync that way.
      const data = {};
      if (profileMeta?.name)  data.full_name = profileMeta.name;
      if (profileMeta?.phone) data.phone     = profileMeta.phone;
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + "/peakly/",
          ...(Object.keys(data).length ? { data } : {}),
        },
      });
      if (error) throw error;
      setStatus("checking_email");
      logEvent("cloud_sync", { stage: "magic_link_sent" });
      return { ok: true };
    } catch (e) {
      setStatus("error");
      logEvent("cloud_sync_error", { stage: "sign_in", message: String(e?.message || e) });
      return { ok: false, error: String(e?.message || e) };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!CLOUD_SYNC_CONFIGURED) return;
    try {
      const client = await ensureSupabase();
      if (client) await client.auth.signOut();
    } catch {}
    setUser(null);
    setStatus("signed_out");
  }, []);

  // Account deletion — App Store Guideline 5.1.1(v). Calls the server-side
  // delete_user() RPC (server/sql/delete-account.sql) which wipes the user's
  // user_data + shared_lists rows AND their auth.users identity, then clears
  // the cloud-synced keys from THIS device and signs out. Local-only data
  // (caches, event log, install flags) is left alone — it's not "the account".
  const deleteAccount = useCallback(async () => {
    if (!CLOUD_SYNC_CONFIGURED) return { ok: false, error: "Cloud sync disabled" };
    try {
      const client = await ensureSupabase();
      if (!client) throw new Error("Supabase failed to load");
      const { error } = await client.rpc("delete_user");
      if (error) {
        const msg = String(error.message || error);
        // RPC not deployed yet → Postgres/PostgREST "function does not exist".
        const notDeployed = /PGRST202|does not exist|could not find|not found|schema cache/i.test(msg);
        logEvent("account_delete_error", { message: msg });
        return { ok: false, error: notDeployed
          ? "Account deletion isn't switched on yet. Email jjciluzzi@gmail.com and we'll remove your data within 48h."
          : "Couldn't delete your account just now. Please try again." };
      }
      // Server data gone — clear the synced subset locally + drop the session.
      try {
        for (const k of SYNCED_KEYS) localStorage.removeItem(k);
        localStorage.removeItem("peakly_last_sync");
      } catch {}
      try { await client.auth.signOut(); } catch {}
      setUser(null);
      setStatus("signed_out");
      logEvent("account_deleted");
      return { ok: true };
    } catch (e) {
      logEvent("account_delete_error", { message: String(e?.message || e) });
      return { ok: false, error: "Couldn't delete your account just now. Please try again." };
    }
  }, []);

  return { enabled: CLOUD_SYNC_CONFIGURED, status, user, signIn, signOut, deleteAccount, syncNow: pushNow };
}

// ─── Analytics helper ─────────────────────────────────────────────────────────
// Calls Plausible if loaded; always appends to localStorage event log (max 200)
function logEvent(name, props) {
  try {
    if (window.plausible) window.plausible(name, props ? { props } : undefined);
    const log = (() => { try { return JSON.parse(localStorage.getItem("peakly_events") || "[]"); } catch { return []; } })();
    log.push({ event: name, props: props || {}, ts: Date.now() });
    if (log.length > 200) log.splice(0, log.length - 200);
    try { localStorage.setItem("peakly_events", JSON.stringify(log)); } catch {}
  } catch {}
}

// Install PWA prompt — capture the deferred event so React can trigger it
// later (after positive engagement) instead of relying on the browser's
// silent default banner that most users miss.
let _peaklyInstallPrompt = null;
(function() {
  try {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();                                // suppress browser's auto-banner
      _peaklyInstallPrompt = e;                          // stash for our nudge
      window.dispatchEvent(new Event("peakly-install-ready"));
      logEvent("install_pwa", { stage: "captured" });
    });
    window.addEventListener("appinstalled", () => {
      _peaklyInstallPrompt = null;
      try { localStorage.setItem("peakly_pwa_installed", "1"); } catch {}
      logEvent("install_pwa", { stage: "installed" });
    });
  } catch {}
})();

// iOS Safari doesn't fire `beforeinstallprompt` — there's no programmatic install
// path on iOS, only the Share → "Add to Home Screen" gesture. Detect real iOS
// Safari (not Chrome iOS / Firefox iOS / Gmail in-app browser / already-installed
// standalone mode) so we can show a one-time tip in lieu of a real prompt.
function isIOSSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|GSA/.test(ua);
  const standalone = window.navigator.standalone === true;
  return iOS && safari && !standalone;
}

// React hook: returns whether install can be triggered + a callback to do it
function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(!!_peaklyInstallPrompt);
  useEffect(() => {
    const onReady = () => setCanInstall(true);
    window.addEventListener("peakly-install-ready", onReady);
    return () => window.removeEventListener("peakly-install-ready", onReady);
  }, []);
  const trigger = useCallback(async () => {
    if (!_peaklyInstallPrompt) return false;
    try {
      _peaklyInstallPrompt.prompt();
      const choice = await _peaklyInstallPrompt.userChoice;
      logEvent("install_pwa", { stage: "user_choice", outcome: choice.outcome });
      _peaklyInstallPrompt = null;
      setCanInstall(false);
      return choice.outcome === "accepted";
    } catch {
      return false;
    }
  }, []);
  return { canInstall, trigger };
}

// ─── go/no-go verdict ────────────────────────────────────────────────────────
function getGoVerdict(score) {
  if (score >= 80) return { label:"GO", color:"#22c55e", bg:"#dcfce7" };
  if (score >= 55) return { label:"MAYBE", color:"#eab308", bg:"#fef9c3" };
  return { label:"WAIT", color:"#ef4444", bg:"#fee2e2" };
}

// Small UV index pill (☀️ UV N) — tinted by intensity. Renders next to the
// verdict pill on every card so users can see at a glance how sunny it is.
function UVBadge({ uv, size = "sm" }) {
  if (uv == null || !Number.isFinite(uv)) return null;
  const u = Math.round(uv);
  const tint = u >= 8 ? { bg:"#fee2e2", fg:"#b91c1c" }   // very high — red
             : u >= 6 ? { bg:"#ffedd5", fg:"#c2410c" }   // high — orange
             : u >= 3 ? { bg:"#fef3c7", fg:"#a16207" }   // moderate — amber
             :          { bg:"#f1f5f9", fg:"#475569" };  // low — gray
  const isSm = size === "sm";
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", gap:3,
      background: tint.bg, borderRadius: isSm ? 6 : 8,
      padding: isSm ? "2px 6px" : "3px 10px",
    }}>
      <span style={{ fontSize: isSm ? 10 : 12 }}>☀️</span>
      <span style={{ fontSize: isSm ? 9 : 11, fontWeight:800, color: tint.fg, fontFamily:F }}>UV {u}</span>
    </div>
  );
}

function GoVerdictBadge({ score, size = "sm" }) {
  const v = getGoVerdict(score);
  const isSm = size === "sm";
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", gap: isSm ? 3 : 5,
      background: v.bg, borderRadius: isSm ? 6 : 8,
      padding: isSm ? "2px 6px" : "3px 10px",
      border:"none",
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
function ListingCardImpl({ listing, wishlists, onToggle, onOpen, alertedIds, onAlertToggle }) {
  const saved = wishlists.includes(listing.id);
  const alerted = !!(alertedIds && alertedIds.has(listing.id));
  const [savedAnim, setSavedAnim] = useState(false);
  const [shareCopied, setShareCopied] = React.useState(false);
  return (
    <div className="card" onClick={() => onOpen && onOpen(listing)} style={{ borderRadius:16, overflow:"hidden", background:"#fff", boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
      <div style={{ position:"relative", height:120, overflow:"hidden", borderRadius:16 }}>
        {listing.photo ? (
          <img src={listing.photo} alt={listing.title} loading="lazy"
            ref={img => { if (img && img.complete) img.style.opacity = 1; }}
            onLoad={e => { e.target.style.opacity = 1; }}
            onError={e => { e.target.onerror = null; e.target.src = getVenuePhoto(listing.title, listing.category); e.target.style.opacity = 1; }}
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:0, transition:"opacity 0.35s ease" }} />
        ) : (
          <div className="card-img" style={{
            position:"absolute", inset:0, background:listing.gradient,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <span style={{ fontSize:72, opacity:0.22, filter:"blur(1px)" }}>{listing.icon}</span>
          </div>
        )}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 52%)" }} />

        {/* Share + Alert + Heart */}
        <div style={{ position:"absolute", top:8, right:8, display:"flex", gap:4 }}>
          <button className="heart pressable" onClick={e => { e.stopPropagation(); shareVenue(listing, () => { setShareCopied(true); setTimeout(() => setShareCopied(false), 1800); }); }} style={{
            background: shareCopied ? "rgba(34,197,94,0.85)" : "rgba(0,0,0,0.35)", border:"none", borderRadius:"50%", fontSize:13,
            width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
            color:"white", fontWeight:700, fontFamily:F,
          }}>
            {shareCopied ? "✓" : "↑"}
          </button>
          {onAlertToggle && (
            <button
              className="heart pressable"
              onClick={e => { e.stopPropagation(); onAlertToggle(listing); }}
              aria-label={alerted ? "Alerts on — tap to remove" : "Alert me when this fires"}
              title={alerted ? "Alerts on — we'll push you when it peaks" : "Tap to get alerted when this venue fires"}
              style={{
                background: alerted ? "rgba(2,132,199,0.92)" : "rgba(0,0,0,0.35)",
                border:"none", borderRadius:"50%", fontSize:14,
                width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", color:"white", fontFamily:F,
                boxShadow: alerted ? "0 1px 4px rgba(2,132,199,0.4)" : "none",
              }}>
              🔔
            </button>
          )}
          <button
            className={"heart" + (savedAnim ? " heart-pop" : "")}
            onClick={e => {
              e.stopPropagation();
              onToggle(listing.id);
              if (!saved) { setSavedAnim(true); setTimeout(() => setSavedAnim(false), 400); }
              haptic("medium");
            }}
            aria-label={saved ? "Remove from saved" : "Save venue"}
            style={{
              background:"none", border:"none", fontSize:20,
              width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center",
              filter: saved ? "none" : "drop-shadow(0 1px 3px rgba(0,0,0,0.45))",
            }}>
            {saved ? "❤️" : "🤍"}
          </button>
        </div>

        {/* Single-row chip overlay: verdict + flight price + condition.
            All three pills share height 22px and gap 6px so the row reads as
            one symmetrical bar across the top of the photo. TRENDING is no
            longer a separate chip — when conditionScore >= 85 the verdict
            pill itself goes warm-yellow with a 🔥 prefix. */}
        {(() => {
          const ready = listing.conditionLabel !== "Checking conditions…";
          const v = ready ? getGoVerdict(listing.conditionScore) : null;
          const hot = ready && listing.conditionScore >= 85;
          const verdictBg = hot ? "rgba(234,179,8,0.92)" : (v ? v.bg : "rgba(255,255,255,0.18)");
          const verdictColor = hot ? "#fff" : (v ? v.color : "#fff");
          const verdictDot = hot ? "#fff" : (v ? v.color : "rgba(255,255,255,0.6)");
          const verdictLabel = hot ? `🔥 ${v.label}` : (v ? v.label : "");
          const PILL = {
            height: 22, display: "inline-flex", alignItems: "center",
            padding: "0 8px", borderRadius: 11, fontSize: 11, fontWeight: 700,
            fontFamily: F, lineHeight: 1, gap: 5,
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
          };
          return (
            <div style={{
              position: "absolute", top: 12, left: 12, right: 12,
              display: "flex", gap: 6, alignItems: "center", flexWrap: "nowrap",
            }}>
              {ready ? (
                <div style={{ ...PILL, background: verdictBg, color: verdictColor, flexShrink: 0 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: verdictDot }} />
                  <span>{verdictLabel}</span>
                </div>
              ) : (
                <div style={{ ...PILL, background: "rgba(0,0,0,0.35)", flexShrink: 0 }}>
                  <span className="shimmer" style={{ width: 28, height: 9, borderRadius: 4, display: "inline-block" }} />
                </div>
              )}
              <div style={{
                ...PILL, background: "rgba(0,0,0,0.55)", color: "#fff",
                backdropFilter: "blur(6px)", minWidth: 0, flex: "1 1 auto",
                height: "auto", minHeight: 22, padding: "3px 10px",
                lineHeight: 1.25,
              }}>
                <span style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  wordBreak: "break-word",
                }}>
                  {listing.conditionLabel}
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Body */}
      <div style={{ padding:"10px 12px 10px" }}>
        <div style={{ fontWeight:700, fontSize:14, color:"#222", fontFamily:F, lineHeight:1.2 }}>
          {listing.title}
        </div>
        {/* Location — own row so long names like "Kelingking Secret Beach"
            wrap cleanly without truncation */}
        <div style={{ color:"#717171", fontSize:12, fontFamily:F, marginTop:3, lineHeight:1.35, wordBreak:"break-word" }}>
          {listing.location}
          {listing.breakType && <span style={{ marginLeft:6, fontSize:10, fontWeight:700, color:"#0284c7", background:"#e0f2fe", borderRadius:4, padding:"1px 5px", textTransform:"capitalize", letterSpacing:0.3 }}>{listing.breakType} break</span>}
        </div>
        {listing.bestWindow && (
          <div style={{ marginTop:5 }}>
            <span style={{ fontSize:10, color:"#0284c7", fontWeight:700, fontFamily:F, background:"#e0f2fe", borderRadius:6, padding:"2px 6px", display:"inline-block" }}>
              Best: {listing.bestWindow.day} · {listing.bestWindow.score}/100
            </span>
          </div>
        )}
        {listing.weekendConfidence === "medium" && (
          <div style={{ fontSize:10, color:"#a16207", fontFamily:F, fontWeight:700, marginTop:4 }}>
            5-day forecast — may shift
          </div>
        )}
        <div style={{ marginTop:8, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:5 }}>
              {listing.flightsLoading && !listing.flight.live ? (
                <span className="shimmer" style={{ width:80, height:14, borderRadius:6, display:"inline-block" }} />
              ) : listing.flight.live ? (
                <>
                  <span style={{ fontSize:14, fontWeight:800, color:"#222", fontFamily:F }}>from ${listing.flight.price}</span>
                  {listing.flight.pct >= 10 && (
                    <span style={{ fontSize:12, color:"#b0b0b0", textDecoration:"line-through", fontFamily:F }}>${listing.flight.normal}</span>
                  )}
                </>
              ) : (
                <span style={{ fontSize:14, fontWeight:700, color:"#717171", fontFamily:F }}>~${listing.flight.price} typical</span>
              )}
            </div>
            {listing.flight.live && listing.flight.depDate && listing.flight.retDate && (
              <div style={{ fontSize:10, fontWeight:600, color:"#888", fontFamily:F, lineHeight:1.35 }}>
                {shortDate(listing.flight.depDate)} → {shortDate(listing.flight.retDate)}
              </div>
            )}
          </div>
          <a href={buildFlightUrl(listing.flight.from || "JFK", listing.ap, { startDate: listing.flight.depDate, endDate: listing.flight.retDate })} target="_blank" rel="noopener noreferrer"
            onClick={e => { e.stopPropagation(); haptic("heavy"); if (window.plausible) plausible('book_click', {props: {venue: listing.title, category: listing.category}}); }}
            style={{ textDecoration:"none", flexShrink:0 }}>
            <div className="pressable" style={{
              background:"linear-gradient(135deg,#1a56db,#0ea5e9)", borderRadius:20,
              padding:"7px 12px", minHeight:32, display:"flex", alignItems:"center", gap:4,
              whiteSpace:"nowrap",
            }}>
              <span style={{ fontSize:11 }}>✈️</span>
              <span style={{ fontSize:11, fontWeight:800, color:"white", fontFamily:F }}>Book</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
// React.memo so a parent re-render (search keystroke, modal open) doesn't
// re-render 400+ cards. Stable listing refs come from the useMemo on the
// listings array in App.
const ListingCard = React.memo(ListingCardImpl);

// ─── featured card (horizontal scroll) ───────────────────────────────────────
function FeaturedCardImpl({ listing, wishlists, onToggle, onOpen }) {
  const saved = wishlists.includes(listing.id);
  return (
    <div className="card" onClick={() => onOpen && onOpen(listing)} style={{ minWidth:300, borderRadius:20, overflow:"hidden", flexShrink:0, background:"#fff", boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
      <div style={{
        height:180, background:listing.gradient, position:"relative",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        {listing.photo ? (
          <img src={listing.photo} alt={listing.title} loading="lazy"
            ref={img => { if (img && img.complete) img.style.opacity = 1; }}
            onLoad={e => { e.target.style.opacity = 1; }}
            onError={e => { e.target.onerror = null; e.target.src = getVenuePhoto(listing.title, listing.category); e.target.style.opacity = 1; }}
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:0, transition:"opacity 0.35s ease" }} />
        ) : (
          <span style={{ fontSize:60, opacity:0.28 }}>{listing.icon}</span>
        )}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 55%)" }} />
        <button className="heart" onClick={e => { e.stopPropagation(); onToggle(listing.id); }} aria-label={saved ? "Remove from saved" : "Save venue"} style={{
          position:"absolute", top:6, right:6, background:"none", border:"none", fontSize:18,
          width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center",
        }}>{saved ? "❤️" : "🤍"}</button>
        <div style={{
          position:"absolute", top:10, left:10,
          background:"#0284c7", borderRadius:20, padding:"3px 10px",
          display:"flex", alignItems:"center", gap:5,
        }}>
          {listing.flightsLoading && !listing.flight.live ? (
            <span className="shimmer" style={{ width:60, height:10, borderRadius:5, display:"inline-block" }} />
          ) : listing.flight.live && listing.flight.pct >= 10 ? (
            <span style={{ color:"white", fontSize:11, fontWeight:800, fontFamily:F }}>✈️ {listing.flight.pct}% off</span>
          ) : listing.flight.live ? (
            <span style={{ color:"white", fontSize:11, fontWeight:800, fontFamily:F }}>✈️ ${listing.flight.price}</span>
          ) : (
            <span style={{ color:"rgba(255,255,255,0.85)", fontSize:11, fontWeight:700, fontFamily:F }}>✈️ ~${listing.flight.price}</span>
          )}
          {listing.flight.live && (
            <span style={{
              fontSize:10, fontWeight:800, color:"#16a34a", fontFamily:F,
              background:"#dcfce7", borderRadius:6, padding:"1px 5px",
            }}>LIVE</span>
          )}
        </div>
        <div style={{
          position:"absolute", bottom:10, left:12, right:12,
          display:"flex", alignItems:"center", gap:5, flexWrap:"wrap",
        }}>
          <span style={{
            background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)",
            borderRadius:8, padding:"3px 8px", color:"white", fontSize:11, fontWeight:600, fontFamily:F,
            border:"1px solid rgba(255,255,255,0.2)", display:"inline-block",
          }}>{listing.conditionLabel}</span>
        </div>
      </div>
      <div style={{ padding:"12px 14px 14px" }}>
        <div style={{ fontWeight:700, fontSize:14, color:"#222", fontFamily:F }}>{listing.title}</div>
        <div style={{ color:"#717171", fontSize:12, fontFamily:F, marginTop:2 }}>
          {listing.location} · {listing.period}
        </div>
        <div style={{ marginTop:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:1, minWidth:0 }}>
            {listing.flightsLoading && !listing.flight.live ? (
              <span className="shimmer" style={{ width:90, height:14, borderRadius:6, display:"inline-block" }} />
            ) : (
              <div>
                <span style={{ fontWeight:800, fontSize:15, color:"#222", fontFamily:F }}>from {listing.flight.live ? '$' : '~$'}{listing.flight.price}</span>
                <span style={{ color:"#717171", fontSize:12, fontFamily:F }}> · {listing.flight.from}</span>
              </div>
            )}
            {listing.flight.live && listing.flight.depDate && listing.flight.retDate && (
              <div style={{ fontSize:10, fontWeight:600, color:"#888", fontFamily:F, whiteSpace:"nowrap" }}>
                {shortDate(listing.flight.depDate)} → {shortDate(listing.flight.retDate)}
              </div>
            )}
          </div>
          <a href={buildFlightUrl(listing.flight.from || "JFK", listing.ap, { startDate: listing.flight.depDate, endDate: listing.flight.retDate })} target="_blank" rel="noopener noreferrer"
            onClick={e => { e.stopPropagation(); haptic("heavy"); if (window.plausible) plausible('book_click', {props: {venue: listing.title, category: listing.category}}); }} style={{ textDecoration:"none" }}>
            <div className="pressable" style={{ background:"linear-gradient(135deg,#1a56db,#0ea5e9)", borderRadius:20, padding:"8px 14px", minHeight:36, display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ fontSize:11 }}>✈️</span>
              <span style={{ fontSize:11, fontWeight:800, color:"white", fontFamily:F }}>Book</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
const FeaturedCard = React.memo(FeaturedCardImpl);

// ─── compact card (3-column grid) ────────────────────────────────────────────
function CompactCardImpl({ listing, wishlists, onToggle, onOpen }) {
  const saved = wishlists.includes(listing.id);
  const shortTitle = listing.title.split(",")[0];
  const shortLoc   = listing.location.split(",").slice(-1)[0]?.trim() || listing.location.split(",")[0];
  return (
    <div className="card" onClick={() => onOpen && onOpen(listing)} style={{ borderRadius:12, overflow:"hidden", background:"#fff", boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
      <div style={{ position:"relative", height:128, overflow:"hidden" }}>
        {listing.photo ? (
          <img src={listing.photo} alt={listing.title} loading="lazy"
            ref={img => { if (img && img.complete) img.style.opacity = 1; }}
            onLoad={e => { e.target.style.opacity = 1; }}
            onError={e => { e.target.onerror = null; e.target.src = getVenuePhoto(listing.title, listing.category); e.target.style.opacity = 1; }}
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:0, transition:"opacity 0.35s ease" }} />
        ) : (
          <div style={{
            position:"absolute", inset:0, background:listing.gradient,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <span style={{ fontSize:38, opacity:0.22 }}>{listing.icon}</span>
          </div>
        )}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.58) 0%,transparent 50%)" }} />

        {/* Heart */}
        <button className="heart" onClick={e => { e.stopPropagation(); onToggle(listing.id); haptic("medium"); }} aria-label={saved ? "Remove from saved" : "Save venue"} style={{
          position:"absolute", top:2, right:2,
          background:"none", border:"none", fontSize:15,
          width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center",
          filter: saved ? "none" : "drop-shadow(0 1px 3px rgba(0,0,0,0.5))",
        }}>{saved ? "❤️" : "🤍"}</button>

        {/* Go/No-Go verdict */}
        {listing.conditionLabel !== "Checking conditions…" && (
          <div style={{ position:"absolute", top:5, left:5 }}>
            <GoVerdictBadge score={listing.conditionScore} />
          </div>
        )}

        {/* Condition label */}
        <div style={{
          position:"absolute", bottom:5, left:5, right:5,
        }}>
          <span style={{
            color:"#fff", fontSize:10, fontWeight:600, fontFamily:F, lineHeight:1.25,
            textShadow:"0 1px 3px rgba(0,0,0,0.8)",
            display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical",
            overflow:"hidden", wordBreak:"break-word",
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
          {shortLoc}{listing.breakType && <span style={{ marginLeft:4, fontSize:8, fontWeight:700, color:"#0284c7" }}>{listing.breakType}</span>}
        </div>
        {listing.bestWindow && (
          <div style={{ fontSize:10, color:"#0284c7", fontWeight:700, fontFamily:F, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            Peak: {listing.bestWindow.day}
          </div>
        )}
        <div style={{ marginTop:5, display:"flex", alignItems:"center", gap:3 }}>
          {listing.flightsLoading && !listing.flight.live ? (
            <span className="shimmer" style={{ width:60, height:12, borderRadius:5, display:"inline-block" }} />
          ) : (
            <>
              <span style={{ fontSize:12, fontWeight:800, color:"#222", fontFamily:F }}>
                from {listing.flight.live ? '$' : '~$'}{listing.flight.price}
              </span>
              {listing.flight.live ? (
                <span style={{
                  fontSize:10, fontWeight:800, color:"#16a34a", background:"#dcfce7",
                  borderRadius:5, padding:"1px 4px", fontFamily:F,
                }}>LIVE</span>
              ) : (
                <span style={{ fontSize:10, color:"#888", fontFamily:F }}>est.</span>
              )}
            </>
          )}
        </div>
        {listing.flight.live && listing.flight.depDate && listing.flight.retDate && (
          <div style={{ fontSize:9, fontWeight:600, color:"#888", fontFamily:F, whiteSpace:"nowrap", marginTop:2 }}>
            {shortDate(listing.flight.depDate)} → {shortDate(listing.flight.retDate)}
          </div>
        )}
        {listing.weekendConfidence === "medium" && (
          <div style={{ fontSize:9, color:"#a16207", fontFamily:F, fontWeight:700, marginTop:3 }}>
            5-day fcst
          </div>
        )}
      </div>
    </div>
  );
}
const CompactCard = React.memo(CompactCardImpl);

// ─── search sheet ─────────────────────────────────────────────────────────────
// 7-day forecast is the product, not a limit. We removed the "When" chip row
// 2026-05-13: three options all computed the same upcoming-Friday date, which
// was a UI lie. The Dates section below the chips still works for custom date
// ranges (and they actually filter listings via applyFilters). search.when
// stays in state as "anytime" for back-compat with hasSearch / chip-summary
// reads but no longer drives behavior.

function SearchSheet({ search, setSearch, onApply, onClose, listings, filters, setFilters, wishlists, onToggle, onOpenDetail }) {
  const [searchTab, setSearchTab] = useState("filters"); // "filters" | "vibe"
  const [local, setLocal] = useState({
    activities: search.activities || [],
    destination: search.destination || "",
    when: search.when || "anytime",
    continent: search.continent || "",
    fromAirport: search.fromAirport || "",
    fromAirport2: search.fromAirport2 || "",
    skiPass: search.skiPass || "",
    sort: filters?.sort || "score",
    maxPrice: filters?.maxPrice ?? 1000,
    maxFlightHrs: filters?.maxFlightHrs ?? null,
  });
  const [apQuery, setApQuery] = useState("");
  const [apFocus, setApFocus] = useState(false);
  const [apQuery2, setApQuery2] = useState("");
  const [apFocus2, setApFocus2] = useState(false);

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

  const apResults2 = apQuery2.length >= 2
    ? ALL_AIRPORTS.filter(a =>
        a.city.toLowerCase().includes(apQuery2.toLowerCase()) ||
        a.code.toLowerCase().includes(apQuery2.toLowerCase())
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
    const next = { activities: local.activities, destination: local.destination, when: local.when, continent: local.continent, fromAirport: local.fromAirport, fromAirport2: local.fromAirport2, skiPass: local.skiPass };
    setSearch(next);
    if (setFilters) setFilters({ sort: local.sort, maxPrice: local.maxPrice, maxFlightHrs: local.maxFlightHrs });
    onApply(next);
    onClose();
  };

  const SectionLabel = ({ children }) => (
    <div style={{ fontSize:11, fontWeight:800, color:"#999", fontFamily:F, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>
      {children}
    </div>
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
          borderBottom:"1px solid #f0f0f0", paddingBottom:10,
        }}>
          <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 6px" }}>
            <div style={{ width:36, height:4, borderRadius:2, background:"#ddd" }} />
          </div>
          <div style={{ padding:"0 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:18, fontWeight:900, color:"#222", fontFamily:F }}>Plan a trip</span>
            <button onClick={() => setLocal({ activities:[], destination:"", when:"anytime", continent:"", fromAirport: local.fromAirport, fromAirport2: local.fromAirport2, sort:"score", maxPrice:2000, maxFlightHrs:null })}
              style={{ background:"none", border:"none", fontSize:12, fontWeight:700, color:"#0284c7", fontFamily:F, cursor:"pointer" }}>
              Reset
            </button>
          </div>
        </div>

        {/* ── Flying from (at top) ── */}
        <div style={{ padding:"12px 20px 0" }}>
          <SectionLabel>Flying from</SectionLabel>
          <div style={{ position:"relative", marginBottom:8 }}>
            <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" placeholder="Search airports…"
              value={apQuery}
              onChange={e => setApQuery(e.target.value)}
              onFocus={() => setApFocus(true)}
              onBlur={() => setTimeout(() => setApFocus(false), 180)}
              style={{
                width:"100%", padding:"9px 12px 9px 32px", borderRadius:8,
                border:"1.5px solid #e8e8e8", fontSize:12, fontFamily:F, color:"#222",
                background:"#fafafa",
              }}
            />
          </div>
          {apFocus && apResults.length > 0 && (
            <div className="bounce-in" style={{
              background:"#fff", border:"1.5px solid #e8e8e8", borderRadius:10,
              marginTop:4, overflow:"hidden", boxShadow:"0 4px 16px rgba(0,0,0,0.1)",
            }}>
              {apResults.map((ap, i) => (
                <button key={ap.code} onMouseDown={() => {
                  setLocal(l => ({...l, fromAirport: ap.code}));
                  setApQuery(""); setApFocus(false);
                }} style={{
                  width:"100%", padding:"10px 14px",
                  background: local.fromAirport === ap.code ? "#f0f9ff" : "#fff",
                  border:"none", borderBottom: i < apResults.length-1 ? "1px solid #f5f5f5" : "none",
                  textAlign:"left", cursor:"pointer", fontFamily:F,
                  display:"flex", alignItems:"center", gap:10,
                }}>
                  <div style={{ flex:1 }}>
                    <span style={{ fontSize:13, fontWeight:800, color:"#222" }}>{ap.code}</span>
                    <span style={{ fontSize:11, color:"#717171" }}> {ap.city}</span>
                  </div>
                  {local.fromAirport === ap.code && <span style={{ color:"#0284c7", fontSize:14, fontWeight:800 }}>✓</span>}
                </button>
              ))}
            </div>
          )}
          {/* Popular airports — full even grid (16 = 4×4, no ragged row) */}
          {!apFocus && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:6, marginBottom:6 }}>
              {US_AIRPORTS.map(ap => {
                const sel1 = local.fromAirport === ap.code;
                return (
                  <button key={ap.code} onClick={() => { setLocal(l => ({...l, fromAirport:ap.code})); setApQuery(""); }} style={{
                      padding:"8px 6px", borderRadius:12, cursor:"pointer", textAlign:"center",
                      background: sel1 ? "#222" : "#f5f5f5",
                      color:      sel1 ? "#fff" : "#555",
                      border:"none",
                      fontSize:12, fontWeight:700, fontFamily:F,
                  }}>{ap.code}</button>
                );
              })}
            </div>
          )}
          {local.fromAirport && (
            <div style={{ marginTop:6, fontSize:11, color:"#717171", fontFamily:F }}>
              <strong style={{ color:"#222" }}>{local.fromAirport}</strong>
              {ALL_AIRPORTS.find(a => a.code === local.fromAirport)?.city &&
                <span> · {ALL_AIRPORTS.find(a => a.code === local.fromAirport).city}</span>}
            </div>
          )}

          {/* Second airport */}
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:11, fontWeight:800, color:"#bbb", fontFamily:F, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>Or also from</div>
            <div style={{ position:"relative" }}>
              <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Add second airport…"
                value={apQuery2}
                onChange={e => setApQuery2(e.target.value)}
                onFocus={() => setApFocus2(true)}
                onBlur={() => setTimeout(() => setApFocus2(false), 180)}
                style={{
                  width:"100%", padding:"9px 12px 9px 32px", borderRadius:8,
                  border:"1.5px solid #e8e8e8", fontSize:12, fontFamily:F, color:"#222",
                  background:"#fafafa",
                }}
              />
              {local.fromAirport2 && (
                <button onMouseDown={() => setLocal(l => ({...l, fromAirport2:""}))} style={{
                  position:"absolute", right:8, top:"50%", transform:"translateY(-50%)",
                  background:"#ddd", border:"none", width:18, height:18, borderRadius:"50%",
                  fontSize:11, color:"#666", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                }}>×</button>
              )}
            </div>
            {apFocus2 && apResults2.length > 0 && (
              <div className="bounce-in" style={{
                background:"#fff", border:"1.5px solid #e8e8e8", borderRadius:10,
                marginTop:4, overflow:"hidden", boxShadow:"0 4px 16px rgba(0,0,0,0.1)",
              }}>
                {apResults2.map((ap, i) => (
                  <button key={ap.code} onMouseDown={() => {
                    setLocal(l => ({...l, fromAirport2: ap.code}));
                    setApQuery2(""); setApFocus2(false);
                  }} style={{
                    width:"100%", padding:"10px 14px",
                    background: local.fromAirport2 === ap.code ? "#f0f9ff" : "#fff",
                    border:"none", borderBottom: i < apResults2.length-1 ? "1px solid #f5f5f5" : "none",
                    textAlign:"left", cursor:"pointer", fontFamily:F,
                    display:"flex", alignItems:"center", gap:10,
                  }}>
                    <div style={{ flex:1 }}>
                      <span style={{ fontSize:13, fontWeight:800, color:"#222" }}>{ap.code}</span>
                      <span style={{ fontSize:11, color:"#717171" }}> {ap.city}</span>
                    </div>
                    {local.fromAirport2 === ap.code && <span style={{ color:"#0284c7", fontSize:14, fontWeight:800 }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
            {local.fromAirport2 && (
              <div style={{ marginTop:6, fontSize:11, color:"#717171", fontFamily:F }}>
                <strong style={{ color:"#222" }}>{local.fromAirport2}</strong>
                {ALL_AIRPORTS.find(a => a.code === local.fromAirport2)?.city &&
                  <span> · {ALL_AIRPORTS.find(a => a.code === local.fromAirport2).city}</span>}
                <span style={{ marginLeft:6, color:"#0284c7", fontWeight:700 }}>· cheapest of both shown</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Activity ── */}
        <div style={{ padding:"16px 20px 0" }}>
          <SectionLabel>Activity</SectionLabel>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {(() => {
              const selAll = local.activities.length === 0;
              return (
                <button className={"pill" + (selAll ? " pill-selected" : "")}
                  onClick={() => setLocal(l => ({...l, activities:[]}))} style={{
                    padding:"7px 14px", borderRadius:20, cursor:"pointer",
                    background: selAll ? "#222" : "#f5f5f5",
                    color:      selAll ? "#fff" : "#555",
                    border:"none",
                    fontSize:12, fontWeight:700, fontFamily:F,
                }}>
                  All
                </button>
              );
            })()}
            {CATEGORIES.filter(c => ["skiing", "beach"].includes(c.id)).map(cat => {
              const sel = local.activities.includes(cat.id);
              return (
                <button key={cat.id} className={"pill" + (sel ? " pill-selected" : "")}
                  onClick={() => toggleActivity(cat.id)} style={{
                    padding:"7px 14px", borderRadius:20, cursor:"pointer",
                    background: sel ? "#222" : "#f5f5f5",
                    color:      sel ? "#fff" : "#555",
                    border:"none",
                    fontSize:12, fontWeight:700, fontFamily:F,
                }}>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Where ── */}
        <div style={{ padding:"14px 20px 0" }}>
          <SectionLabel>Destination</SectionLabel>
          <div style={{ position:"relative" }}>
            <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" placeholder="Search destinations…"
              value={local.destination}
              onChange={e => setLocal(l => ({...l, destination:e.target.value}))}
              style={{
                width:"100%", padding:"10px 32px 10px 36px", borderRadius:10,
                border:"1.5px solid #e8e8e8", fontSize:13, fontFamily:F, color:"#222",
                background:"#fafafa",
              }}
            />
            {local.destination && (
              <button onClick={() => setLocal(l => ({...l, destination:""}))} style={{
                position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                background:"#ddd", border:"none", width:20, height:20, borderRadius:"50%",
                fontSize:12, color:"#666", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1,
              }}>×</button>
            )}
          </div>
          {local.destination && (
            <div style={{ fontSize:11, color:"#0284c7", fontFamily:F, marginTop:4, fontWeight:700 }}>
              {matchCount} match{matchCount !== 1 ? "es" : ""}
            </div>
          )}
        </div>

        {/* ── Budget (date picker removed — pricing always for upcoming Friday) ── */}
        <div style={{ padding:"14px 20px 0" }}>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}>
              <SectionLabel>Budget</SectionLabel>
              <div style={{ background:"#fafafa", border:"1.5px solid #e8e8e8", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
                <span style={{ fontSize:13, fontWeight:800, color: local.maxPrice >= 2000 ? "#999" : "#0284c7", fontFamily:F }}>
                  {local.maxPrice >= 2000 ? "Any" : `$${local.maxPrice}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Max flight price slider ── */}
        <div style={{ padding:"4px 20px 0" }}>
          <input type="range" min={100} max={2000} step={50} value={local.maxPrice}
            onChange={e => setLocal(l => ({...l, maxPrice:+e.target.value}))}
            style={{ width:"100%", accentColor:"#0284c7" }} />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
            <span style={{ fontSize:9, color:"#bbb", fontFamily:F }}>$100</span>
            <span style={{ fontSize:9, color:"#bbb", fontFamily:F }}>Any</span>
          </div>
        </div>

        {/* ── Region ── */}
        <div style={{ padding:"12px 20px 0" }}>
          <SectionLabel>Region</SectionLabel>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {CONTINENTS.map(cont => {
              const sel = local.continent === cont.id;
              return (
                <button key={cont.id} onClick={() => toggleContinent(cont.id)} style={{
                    padding:"10px 16px", borderRadius:20, cursor:"pointer",
                    background: sel ? "#0284c7" : "#f5f5f5",
                    color:      sel ? "#fff" : "#555",
                    border:"none",
                    fontSize:13, fontWeight:800, fontFamily:F,
                    boxShadow: sel ? "0 3px 10px rgba(2,132,199,0.28)" : "none",
                    transition:"transform 0.12s ease, box-shadow 0.12s ease",
                }}>
                  {cont.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Max flight time (spontaneous-trip filter) ── */}
        <div style={{ padding:"12px 20px 0" }}>
          <SectionLabel>Max flight time</SectionLabel>
          <div style={{ display:"flex", gap:6 }}>
            {[
              { id:null, label:"Any" },
              { id:4,    label:"≤ 4hr" },
              { id:6,    label:"≤ 6hr" },
              { id:8,    label:"≤ 8hr" },
            ].map(opt => {
              const sel = local.maxFlightHrs === opt.id;
              return (
                <button key={String(opt.id)} onClick={() => setLocal(l => ({...l, maxFlightHrs: opt.id}))} style={{
                  flex:1, padding:"8px 4px", borderRadius:10, cursor:"pointer",
                  background: sel ? "#222" : "#f5f5f5",
                  color: sel ? "#fff" : "#555",
                  border:"none",
                  fontSize:11, fontWeight:700, fontFamily:F, textAlign:"center",
                }}>{opt.label}</button>
              );
            })}
          </div>
          <div style={{ fontSize:10, color:"#999", fontFamily:F, marginTop:6, lineHeight:1.4 }}>
            For spontaneous weekend trips. Exceptional venues (weekend score ≥ 95) override and still show.
          </div>
        </div>

        {/* ── Sort ── */}
        <div style={{ padding:"12px 20px 0" }}>
          <SectionLabel>Sort by</SectionLabel>
          <div style={{ display:"flex", gap:6 }}>
            {SORT_OPTIONS.map(opt => {
              const sel = local.sort === opt.id;
              return (
                <button key={opt.id} onClick={() => setLocal(l => ({...l, sort:opt.id}))} style={{
                  flex:1, padding:"8px 4px", borderRadius:10, cursor:"pointer",
                  background: sel ? "#222" : "#f5f5f5",
                  color: sel ? "#fff" : "#555",
                  border:"none",
                  fontSize:11, fontWeight:700, fontFamily:F, textAlign:"center",
                }}>{opt.label}</button>
              );
            })}
          </div>
        </div>

        {/* ── Apply ── */}
        <div style={{ padding:"20px 20px 8px" }}>
          <button onClick={apply} className="pressable" style={{
            width:"100%", background:"#222",
            border:"none", borderRadius:14, padding:"14px 0", cursor:"pointer",
            color:"white", fontSize:14, fontWeight:800, fontFamily:F,
          }}>
            {matchCount > 0 ? `Show ${matchCount} spot${matchCount !== 1 ? "s" : ""}` : "Search all"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── search bar ───────────────────────────────────────────────────────────────
function SearchBar({ search, onOpen, compact = false }) {
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
  const whenLabel = "This weekend";
  const contLabel = search.continent ? " · " + (CONTINENTS.find(c => c.id === search.continent)?.label ?? "") : "";

  // Compact mode renders inline next to the wordmark — single line, no
  // subtitle, lighter shadow. Used in the Explore header to free up vertical
  // space for the first carousel.
  if (compact) {
    return (
      <div onClick={onOpen} className="pressable" role="button" aria-label="Search venues" style={{
        display:"flex", alignItems:"center",
        background:"#f5f5f5", borderRadius:24,
        border:"1.5px solid #ebebeb",
        padding:"8px 6px 8px 14px", gap:8, cursor:"pointer",
      }}>
        <div style={{ flex:1, minWidth:0, fontSize:13, fontWeight:700, color: hasSearch ? "#222" : "#888", fontFamily:F, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {hasSearch ? topLine : "Search venues"}
        </div>
        <div style={{
          background: hasSearch ? "#222" : "#0284c7",
          borderRadius:18, width:30, height:30, flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <span style={{ fontSize:13 }}>🔍</span>
        </div>
      </div>
    );
  }
  return (
    <div onClick={onOpen} className="pressable" role="button" aria-label="Search venues" style={{
      display:"flex", alignItems:"center",
      background:"#fff", borderRadius:40,
      boxShadow:"0 3px 22px rgba(0,0,0,0.11)", border:"1.5px solid #ebebeb",
      padding:"15px 14px 15px 22px", gap:10, cursor:"pointer",
    }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:800, color:"#222", fontFamily:F, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {topLine}
        </div>
        <div style={{ fontSize:11, color:"#717171", fontFamily:F, marginTop:2 }}>
          {actLabel}{whenLabel}{search.fromAirport ? ` · ${AIRPORT_CITY[search.fromAirport] || search.fromAirport}` : ""}{contLabel}
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
  { id:"score",  label:"Best weekend" },
  { id:"price",  label:"Cheapest flights" },
  { id:"value",  label:"Best value" },
  { id:"deal",   label:"Best Deal" },
];

// ─── vibe search engine ────────────────────────────────────────────────────────
const VIBE_PROMPTS = [
  "Powder day with epic views and cozy lodge vibes after",
  "Remote tropical beach, no crowds, crystal water",
  "Bluebird ski day, fresh tracks, cold smoke",
  "Luxury beach resort, turquoise sea, total relaxation",
  "Steep off-piste skiing, deep powder, real adventure",
  "Budget island escape, good food, cheap flights",
  "Warm Mediterranean vibes, history, seafood, wine",
  "Spring corn skiing, sunshine, après on the deck",
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
    beach:     /\b(beach|sand|tan|lounge|shore|coast|turquoise|crystal|clear water|sunbathe)\b/.test(t),
    // regions
    asia:      /\b(japan|bali|indonesia|asia|pacific|zen|exotic|east|southeast.asia|thai|balinese)\b/.test(t),
    europe:    /\b(europe|mediterranean|italy|greece|spain|france|alps|romantic|old world|cobblestone|european|adriatic)\b/.test(t),
    caribbean: /\b(caribbean|island|rum|reggae|white sand|coral|cayman|aruba|jamaica|barbados)\b/.test(t),
    hawaii:    /\b(hawaii|aloha|maui|oahu|kauai|big island|polynesian)\b/.test(t),
    americas:  /\b(colorado|california|rockies|usa|canada|appalachian|west coast|pacific northwest)\b/.test(t),
    nature:    /\b(nature|wilderness|wild|pristine|untouched|forest|jungle|raw|remote|off.the.beaten)\b/.test(t),
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
    if (f.beach && l.category === "beach") s += 44;

    // ── temperature/climate match ───────────────────────────────────────────
    const isCold = l.category === "skiing";
    const isWarm = l.category === "beach";
    if (f.cold && isCold)  s += 28;
    if (f.hot  && isWarm)  s += 28;
    if (f.cold && isWarm)  s -= 14;
    if (f.hot  && isCold)  s -= 14;

    // ── intensity / vibe ────────────────────────────────────────────────────
    const isAdrenalineCat = l.category === "skiing";
    if (f.adrenaline && isAdrenalineCat) s += 16;
    if (f.relax && l.category === "beach") s += 18;
    if (f.adrenaline && l.category === "beach") s -= 8;

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
    // Halved from ×30 to ×15: a 0.15-star delta was swinging vibe by ±5 points,
    // too noisy when ratings cluster between 4.6 and 4.9. Still a tiebreaker.
    s += (l.rating - 4.85) * 15;

    return { ...l, vibeScore: Math.round(Math.max(0, s)) };
  });

  const venues = scored.sort((a, b) => b.vibeScore - a.vibeScore).slice(0, 6);

  // ── generate natural-language summary ──────────────────────────────────────
  const themes = [
    f.ski         && "powder days on the mountain",
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
    <div style={{ display:"flex", alignItems:"center", gap:4, background:"#f0f9ff", border:"1.5px solid #bae6fd", borderRadius:20, padding:"3px 10px", flexShrink:0, cursor:"default" }}>
      <span style={{ fontSize:11, fontWeight:700, color:"#0284c7", fontFamily:F, whiteSpace:"nowrap" }}>{label}</span>
      <button onClick={onRemove} style={{ background:"none", border:"none", cursor:"pointer", padding:0, lineHeight:1, fontSize:11, color:"#0284c7", fontWeight:900, display:"flex", alignItems:"center" }}>✕</button>
    </div>
  );
}

// ─── explore tab ──────────────────────────────────────────────────────────────
function applyFilters(listings, activeCat, filters, search = {}, homeAirport = null) {
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
  // Ski pass filter
  if (search.skiPass) {
    out = out.filter(l => l.skiPass === search.skiPass);
  }
  if (filters.maxPrice  < 2000) out = out.filter(l => l.flight.price   <= filters.maxPrice);
  // Within-N-hours flight filter (spontaneous weekend mode). Exceptional
  // venues (weekendScore >= 95) override the cutoff so a perfect powder
  // day a continent away can still surface. Venues with no coord lookup
  // pass through (flightHours returns null) — better to show than hide.
  if (filters.maxFlightHrs && homeAirport) {
    out = out.filter(l => {
      const hrs = flightHours(homeAirport, l.ap);
      if (hrs == null) return true;
      return hrs <= filters.maxFlightHrs || (l.weekendScore || 0) >= 95;
    });
  }
  // Stable tiebreak by id so equal-score venues never jitter between renders.
  const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  // Default "score" = Best weekend: rank by the Fri–Mon Weekend Score (the
  // product/moat the hero + "Firing this weekend" carousel also use), tie-broken
  // by live deal score → cheaper fare → id. Keeps the grid consistent with the
  // front page instead of ranking by today-only conditions.
  if (filters.sort === "score") out = [...out].sort((a, b) =>
    (b.weekendScore || 0) - (a.weekendScore || 0)
    || (b.dealScore || 0) - (a.dealScore || 0)
    || (a.flight.price || 0) - (b.flight.price || 0)
    || byId(a, b)
  );
  if (filters.sort === "price") out = [...out].sort((a,b) => (a.flight.price - b.flight.price) || byId(a, b));
  if (filters.sort === "value") out = [...out].sort((a,b) => {
    const valA = a.conditionScore / (a.flight.price || 1);
    const valB = b.conditionScore / (b.flight.price || 1);
    return (valB - valA) || byId(a, b);
  });
  // "Best Deal" — gated on flight.live (estimates / no-deal-score venues sink
  // to the bottom rather than disappearing, so the list still feels populated
  // when only some prices are live).
  if (filters.sort === "deal") out = [...out].sort((a, b) => {
    const aLive = a.flight?.live === true && a.dealScore != null;
    const bLive = b.flight?.live === true && b.dealScore != null;
    if (aLive !== bLive) return aLive ? -1 : 1;
    return ((b.dealScore || 0) - (a.dealScore || 0)) || byId(a, b);
  });
  // Exact-fare-only mode: 7-day spontaneous-trip product can't show venues
  // without a confirmed same-day price. Filter to live fares once they've
  // loaded; degrade gracefully if Travelpayouts returns nothing for ANY
  // venue (proxy/upstream down) by showing the full list with estimates.
  const anyFlightLoading = out.some(l => l.flightsLoading);
  if (!anyFlightLoading) {
    const liveOnly = out.filter(l => l.flight?.live === true);
    if (liveOnly.length > 0) out = liveOnly;
  }
  return out;
}

// One-time install nudge above the Explore carousel. Two variants:
//   - Standard: browser fired beforeinstallprompt (Chrome/Edge/Samsung Internet) → one-tap install
//   - iOS tip:  iOS Safari (no programmatic install) → "Add to Home Screen" instructions
// Both share the same dismissal flag so users see at most one nudge.
// One-line account nudge above Explore once the user shows intent (3+ saves
// and no account yet). Reuses the 14-day time-decay dismissal pattern from
// InstallNudge — a stale "not now" tap shouldn't silence the nudge forever.
function AccountNudgeBanner({ wishlistCount, cloudSync, onGoToProfile }) {
  const DISMISS_TTL_MS = 14 * 24 * 3600 * 1000;
  const isDismissedNow = () => {
    try {
      const raw = localStorage.getItem("peakly_account_nudge_dismissed");
      if (!raw) return false;
      const ts = parseInt(raw, 10);
      return Number.isFinite(ts) && (Date.now() - ts) < DISMISS_TTL_MS;
    } catch { return false; }
  };
  const [dismissed, setDismissed] = useState(isDismissedNow);
  if (!cloudSync?.enabled || cloudSync.user) return null;
  if (wishlistCount < 3 || dismissed) return null;
  const recordDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem("peakly_account_nudge_dismissed", String(Date.now())); } catch {}
  };
  return (
    <div style={{ padding:"0 20px 14px" }}>
      <div style={{
        background:"#fff", border:"1.5px solid #e0f2fe", borderRadius:14,
        padding:"12px 14px", display:"flex", alignItems:"center", gap:12,
        boxShadow:"0 2px 12px rgba(2,132,199,0.10)",
      }}>
        <button onClick={() => onGoToProfile && onGoToProfile()} className="pressable" style={{
          flex:1, background:"none", border:"none", textAlign:"left", padding:0, cursor:"pointer", fontFamily:F,
          display:"flex", alignItems:"center", gap:10,
        }}>
          <span style={{ fontSize:22 }}>🔔</span>
          <div>
            <div style={{ fontSize:13, fontWeight:800, color:"#222" }}>Save these for next time</div>
            <div style={{ fontSize:11, color:"#717171", marginTop:1 }}>Get pushed the moment conditions are firing.</div>
          </div>
        </button>
        <button onClick={recordDismiss} aria-label="Dismiss" style={{
          background:"none", border:"none", color:"#bbb", fontSize:18, fontWeight:700,
          cursor:"pointer", padding:"4px 6px", lineHeight:1,
        }}>×</button>
      </div>
    </div>
  );
}

function InstallNudge({ wishlistCount }) {
  const { canInstall, trigger } = useInstallPrompt();
  // Time-decay dismissal: a "not now" tap re-prompts after 14 days. Permanent
  // dismissal was hostile — a user who tapped × on day 1 never saw the nudge
  // again even after months of engagement. 14d feels like a respectful cycle
  // (mirrors the Travelpayouts price-staleness threshold elsewhere in the app).
  const DISMISS_TTL_MS = 14 * 24 * 3600 * 1000;
  const isDismissedNow = () => {
    try {
      const raw = localStorage.getItem("peakly_install_dismissed");
      if (!raw) return false;
      // Legacy value "1" = pre-time-decay dismissal — treat as expired so old
      // dismissers see the nudge once on next eligible mount.
      if (raw === "1") return false;
      const ts = parseInt(raw, 10);
      return Number.isFinite(ts) && (Date.now() - ts) < DISMISS_TTL_MS;
    } catch { return false; }
  };
  const [dismissed, setDismissed] = useState(isDismissedNow);
  const [iosDetected, setIosDetected] = useState(false);
  useEffect(() => { setIosDetected(isIOSSafari()); }, []);

  const showStandard = canInstall && !dismissed && wishlistCount >= 1;
  const showIOSTip   = !canInstall && !dismissed && wishlistCount >= 1 && iosDetected;
  useEffect(() => {
    if (showIOSTip) logEvent("install_pwa", { stage: "ios_tip_shown" });
  }, [showIOSTip]);
  if (!showStandard && !showIOSTip) return null;

  const recordDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem("peakly_install_dismissed", String(Date.now())); } catch {}
  };
  const dismissStandard = () => {
    recordDismiss();
    logEvent("install_pwa", { stage: "nudge_dismissed" });
  };
  const dismissIOS = () => {
    recordDismiss();
    logEvent("install_pwa", { stage: "ios_tip_dismissed" });
  };
  const install = async () => {
    const ok = await trigger();
    if (!ok) dismissStandard();
  };

  if (showIOSTip) {
    return (
      <div style={{
        margin:"12px 14px 0", padding:"12px 14px", borderRadius:14,
        background:"linear-gradient(135deg,#0284c7,#38bdf8)", color:"#fff",
        display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 12px rgba(2,132,199,0.25)",
      }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:800, fontFamily:F }}>Add Peakly to Home Screen</div>
          <div style={{ fontSize:11, fontWeight:600, opacity:0.9, fontFamily:F, marginTop:2 }}>
            Tap the Share button below, then "Add to Home Screen".
          </div>
        </div>
        <button onClick={dismissIOS} aria-label="Dismiss" style={{
          background:"none", border:"none", color:"rgba(255,255,255,0.85)",
          fontSize:18, fontWeight:600, padding:"0 4px", cursor:"pointer", lineHeight:1,
        }}>×</button>
      </div>
    );
  }

  return (
    <div style={{
      margin:"12px 14px 0", padding:"12px 14px", borderRadius:14,
      background:"linear-gradient(135deg,#0284c7,#38bdf8)", color:"#fff",
      display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 12px rgba(2,132,199,0.25)",
    }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:800, fontFamily:F }}>Install Peakly</div>
        <div style={{ fontSize:11, fontWeight:600, opacity:0.9, fontFamily:F, marginTop:2 }}>One tap to add to your home screen — no app store.</div>
      </div>
      <button onClick={install} className="pressable" style={{
        background:"#fff", color:"#0284c7", border:"none", borderRadius:10,
        padding:"7px 14px", fontSize:12, fontWeight:800, fontFamily:F, cursor:"pointer",
      }}>Install</button>
      <button onClick={dismissStandard} aria-label="Dismiss" style={{
        background:"none", border:"none", color:"rgba(255,255,255,0.85)",
        fontSize:18, fontWeight:600, padding:"0 4px", cursor:"pointer", lineHeight:1,
      }}>×</button>
    </div>
  );
}

// Tiny pill showing cloud-sync status. Hidden when sync is disabled
// (placeholder constants) so existing users see no change.
// Diagnostic pill — surfaces VPS proxy + flight + APNS state at a glance.
// Polls /health on mount + every 60s. Renders three dots; tap to expand.
function ServiceStatusPill() {
  const [health, setHealth] = useState(null);
  const [flightStatus, setFlightStatus] = useState("unknown");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 5000);
        const r = await fetch("https://peakly-api.duckdns.org/health", { signal: ctrl.signal });
        clearTimeout(t);
        if (!alive) return;
        if (r.ok) setHealth(await r.json());
        else setHealth({ status: "down" });
      } catch { if (alive) setHealth({ status: "down" }); }
      if (alive) setFlightStatus(getFlightApiStatus());
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  const wx = !health ? "unknown" : health.status === "ok" ? "live" : "down";
  const fl = flightStatus;
  const ap = !health ? "unknown" : (health.apns === "configured" || health.apns_configured === true ? "live" : "off");
  const dot = s => s === "live" ? "#16a34a" : s === "down" ? "#ef4444" : s === "off" ? "#f59e0b" : "#bbb";
  const Dot = ({ icon, state }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      <span style={{ fontSize: 12 }}>{icon}</span>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot(state) }} />
    </span>
  );
  return (
    <div style={{ marginTop: 12, marginBottom: 12 }}>
      <button onClick={() => setOpen(o => !o)} className="pressable" style={{
        width: "100%", background: "#f9f9f9", border: "1px solid #ececec", borderRadius: 12,
        padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between",
        cursor: "pointer", fontFamily: F,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#555" }}>Service status</span>
        <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Dot icon="🌤" state={wx} />
          <Dot icon="✈️" state={fl} />
          <Dot icon="🔔" state={ap} />
        </span>
      </button>
      {open && (
        <div style={{ marginTop: 6, padding: "10px 14px", background: "#fff", border: "1px solid #ececec", borderRadius: 12, fontFamily: F, fontSize: 11, color: "#555", lineHeight: 1.7 }}>
          <div>🌤 Weather proxy: {wx === "live" ? "live ✓" : "down — direct Open-Meteo fallback"}</div>
          <div>✈️ Flight pricing: {fl === "live" ? "live ✓" : fl === "down" ? "down — showing estimates" : "no calls yet"}</div>
          <div>🔔 iOS push (APNS): {ap === "live" ? "configured ✓" : "not configured"}</div>
          {health && health.wx_cache_size != null && (
            <div style={{ marginTop: 4, color: "#888" }}>
              Weather cache: {health.wx_cache_size} · alerts: {health.alerts || 0} · poll errors: {health.poll?.errors ?? "n/a"}
            </div>
          )}
          <div style={{ marginTop: 4, color: "#888", fontSize: 10 }}>Build {PEAKLY_BUILD}</div>
        </div>
      )}
    </div>
  );
}

function SyncStatusPill({ cloudSync }) {
  if (!cloudSync || !cloudSync.enabled) return null;
  const map = {
    signed_out:     { color:"#888",     bg:"#f5f5f5", label:"Not signed in" },
    checking_email: { color:"#a16207",  bg:"#fef3c7", label:"Check email" },
    syncing:        { color:"#0284c7",  bg:"#e0f2fe", label:"Syncing…" },
    synced:         { color:"#16a34a",  bg:"#dcfce7", label:"Signed in ✓" },
    offline:        { color:"#888",     bg:"#f5f5f5", label:"Offline" },
    error:          { color:"#ef4444",  bg:"#fee2e2", label:"Sign-in error" },
  };
  const m = map[cloudSync.status] || map.signed_out;
  return (
    <span style={{ fontSize:9, color:m.color, fontFamily:F, background:m.bg, padding:"2px 6px", borderRadius:4, fontWeight:700 }}>
      {m.label}
    </span>
  );
}

// Single account-conversion modal surfaced from every save/alert tap when the
// user isn't signed in yet. Bottom-sheet pattern (same look as OnboardingSheet
// / SearchSheet) but compact — sized to its own content, never full-height.
// Reuses cloudSync.signIn (magic link) so the auth path is identical to the
// Profile flow; just shown contextually at the moment the user shows intent.
function AccountModal({ open, intent, onClose, cloudSync, profile, setProfile }) {
  const [name, setName]   = useState(profile?.name  || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [busy, setBusy]   = useState(false);
  const [lastSentAt, setLastSentAt] = useState(0);
  const [now, setNow]     = useState(Date.now());
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  useEffect(() => {
    if (!lastSentAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [lastSentAt]);
  if (!open) return null;
  const cooldownMs = lastSentAt ? Math.max(0, 30000 - (now - lastSentAt)) : 0;
  const trimmedName  = name.trim();
  const trimmedEmail = email.trim();
  const trimmedPhone = phone.trim();
  const validEmail = trimmedEmail.includes("@") && trimmedEmail.length >= 5;
  const validName  = trimmedName.length >= 2;
  const canSend = !busy && validName && validEmail && cooldownMs === 0 && cloudSync?.enabled;
  const send = async () => {
    if (!canSend) return;
    setBusy(true); setFeedback("");
    // Save locally first so it survives the magic-link round-trip even before
    // sign-in finishes. Cloud sync will mirror this to user_data.data once
    // the user comes back signed in.
    if (setProfile) {
      setProfile(p => ({ ...p, name: trimmedName, email: trimmedEmail, phone: trimmedPhone || (p.phone || "") }));
    }
    const r = await cloudSync.signIn(trimmedEmail, { name: trimmedName, phone: trimmedPhone });
    setBusy(false);
    if (!r?.ok) setFeedback(r?.error || "Couldn't send. Try again.");
    else { setLastSentAt(Date.now()); setFeedback("Check your email for a one-tap link. (Spam folder too — Supabase mail loves it.)"); }
  };
  const headline = intent === "save"  ? "Save it."
                 : intent === "alert" ? "Get the alert."
                 :                      "Save it. Get the alert.";
  const sub      = intent === "save"  ? "We'll keep your favorite spots saved across every device — just your email, no password."
                 : intent === "alert" ? "We'll shoot an email your way every time your favorite spots are firing..."
                 :                      "We'll save your spots and shoot you an email every time they're firing.";
  const inputStyle = {
    width:"100%", padding:"13px 14px", borderRadius:14,
    border:"1.5px solid #e8e8e8", fontSize:14, fontFamily:F, color:"#222", background:"#fafafa", boxSizing:"border-box",
  };
  return (
    <>
      <div onClick={onClose} className="backdrop" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:200 }} />
      <div className="sheet" style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"min(430px,100vw)", background:"#fff", borderRadius:"28px 28px 0 0",
        zIndex:201, maxHeight:"82vh", overflowY:"auto",
        paddingBottom:"max(env(safe-area-inset-bottom,0px),24px)",
      }}>
        {/* Handle */}
        <div style={{ display:"flex", justifyContent:"center", padding:"14px 0 4px" }}>
          <div style={{ width:40, height:4, borderRadius:2, background:"#ddd" }} />
        </div>
        <div style={{ padding:"14px 24px 12px" }}>
          <div style={{ fontSize:24, fontWeight:900, color:"#222", fontFamily:F, lineHeight:1.1, letterSpacing:"-0.4px" }}>
            {headline}
          </div>
          <div style={{ fontSize:13, color:"#555", fontFamily:F, marginTop:8, lineHeight:1.5 }}>
            {sub}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:18 }}>
            <input type="text" autoComplete="name" placeholder="Full name"
              value={name} onChange={e => setName(e.target.value)} disabled={busy}
              autoFocus
              style={inputStyle}
            />
            <input type="email" inputMode="email" autoComplete="email" placeholder="you@email.com"
              value={email} onChange={e => setEmail(e.target.value)} disabled={busy}
              style={inputStyle}
            />
            <div>
              <input type="tel" inputMode="tel" autoComplete="tel" placeholder="Phone (optional)"
                value={phone} onChange={e => setPhone(e.target.value)} disabled={busy}
                onKeyDown={e => { if (e.key === "Enter") send(); }}
                style={inputStyle}
              />
            </div>
          </div>

          <button onClick={send} disabled={!canSend} className="pressable" style={{
            width:"100%", marginTop:16,
            background: canSend ? "#0284c7" : "#cfcfcf", color:"#fff", border:"none",
            borderRadius:14, padding:"14px 18px", fontSize:14, fontWeight:800, fontFamily:F,
            cursor: canSend ? "pointer" : "default",
          }}>
            {busy ? "Sending…" : cooldownMs > 0 ? `Resend in ${Math.ceil(cooldownMs/1000)}s` : lastSentAt ? "Resend link" : "Create account"}
          </button>

          {feedback && (
            <div style={{ fontSize:12, color: feedback.startsWith("Check") ? "#0284c7" : "#ef4444", fontFamily:F, marginTop:10, lineHeight:1.5 }}>
              {feedback}
            </div>
          )}

          <button onClick={onClose} className="pressable" style={{
            marginTop:14, background:"none", border:"none", padding:0,
            fontSize:12, fontWeight:600, color:"#888", fontFamily:F, cursor:"pointer",
            textDecoration:"underline", textUnderlineOffset:"3px",
          }}>
            Maybe later
          </button>
        </div>
      </div>
    </>
  );
}

// "Sync your data" section in Profile — sign-in (magic link) + sign-out + status.
// Auto-hides when cloud sync is disabled at config time.
function ProfileSyncSection({ cloudSync, profile }) {
  if (!cloudSync || !cloudSync.enabled) return null;
  const [email, setEmail]       = useState(profile?.email || "");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy]         = useState(false);
  // Resend cooldown: after a successful send, the Send button becomes "Resend"
  // and disables for 30s to prevent rapid-fire taps when the email is slow to
  // arrive. Without this the user could only hit a disabled button and felt
  // stranded with no path forward.
  const [lastSentAt, setLastSentAt] = useState(0);
  const [now, setNow]               = useState(Date.now());
  useEffect(() => {
    if (!lastSentAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [lastSentAt]);
  const cooldownMs = lastSentAt ? Math.max(0, 30000 - (now - lastSentAt)) : 0;
  const canSend = !busy && email.includes("@") && cooldownMs === 0;
  useEffect(() => {
    if (cloudSync.status === "checking_email") setFeedback("Check your email — we sent a magic link. It can take a minute; check spam if it's not there.");
    else if (cloudSync.status === "synced")    setFeedback("");
    else if (cloudSync.status === "error")     setFeedback("Something went wrong. Try again or check your email.");
  }, [cloudSync.status]);
  const send = async () => {
    setBusy(true); setFeedback("");
    const r = await cloudSync.signIn(email.trim());
    setBusy(false);
    if (!r.ok) setFeedback(r.error || "Sign-in failed.");
    else       setLastSentAt(Date.now());
  };
  const out = async () => { await cloudSync.signOut(); setFeedback(""); setLastSentAt(0); };

  // Account deletion (App Store 5.1.1(v)). Two-step: tap reveals a confirm
  // panel that spells out exactly what's deleted and requires typing DELETE.
  const [delPhase, setDelPhase] = useState("idle"); // idle | confirm | deleting
  const [delText, setDelText]   = useState("");
  const [delErr, setDelErr]     = useState("");
  const doDelete = async () => {
    if (delText.trim().toUpperCase() !== "DELETE") return;
    setDelPhase("deleting"); setDelErr("");
    const r = await cloudSync.deleteAccount();
    if (r.ok) {
      try { haptic("heavy"); } catch {}
      setDelPhase("idle"); setDelText("");
      setFeedback("Your account and all cloud-synced data have been deleted.");
    } else {
      setDelErr(r.error || "Couldn't delete your account just now. Please try again.");
      setDelPhase("confirm");
    }
  };

  return (
    <div style={{ marginBottom:16, padding:"14px 14px 12px", background:"#fff", border:"1.5px solid #ebebeb", borderRadius:14 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <div style={{ fontSize:12, fontWeight:800, color:"#222", fontFamily:F, letterSpacing:"0.04em", textTransform:"uppercase" }}>
          Get notified when conditions are firing
        </div>
        <SyncStatusPill cloudSync={cloudSync} />
      </div>
      {cloudSync.user ? (
        <>
          <div style={{ fontSize:12, color:"#555", fontFamily:F, marginBottom:10 }}>
            Signed in as <strong style={{ color:"#222" }}>{cloudSync.user.email}</strong>. Your alerts, wishlists and profile sync across every device.
          </div>
          <button className="pressable" onClick={out} style={{
            background:"#f7f7f7", border:"1.5px solid #e8e8e8", borderRadius:10,
            padding:"9px 14px", fontSize:12, fontWeight:700, color:"#555", fontFamily:F, cursor:"pointer",
          }}>Sign out (data stays on this device)</button>

          {/* Delete account — App Store 5.1.1(v). Always reachable, not buried. */}
          {delPhase === "idle" ? (
            <button className="pressable" onClick={() => { setDelPhase("confirm"); setDelErr(""); }} style={{
              display:"block", marginTop:14, background:"none", border:"none", padding:0,
              fontSize:12, fontWeight:700, color:"#ef4444", fontFamily:F, cursor:"pointer",
              textDecoration:"underline", textUnderlineOffset:"3px",
            }}>Delete account</button>
          ) : (
            <div style={{ marginTop:14, padding:"12px 14px", background:"#fff5f5", border:"1.5px solid #fecaca", borderRadius:12 }}>
              <div style={{ fontSize:13, fontWeight:800, color:"#b91c1c", fontFamily:F, marginBottom:6 }}>Delete account?</div>
              <div style={{ fontSize:12, color:"#555", fontFamily:F, lineHeight:1.5, marginBottom:10 }}>
                This permanently deletes your account and all cloud-synced data — wishlists, lists, alerts, trips, and profile — from our servers. It can't be undone. Anything saved on <strong>this device</strong> stays until you clear it.
              </div>
              <input
                type="text" value={delText} placeholder="Type DELETE to confirm"
                onChange={e => setDelText(e.target.value)} disabled={delPhase === "deleting"}
                autoCapitalize="characters" autoCorrect="off" spellCheck={false}
                style={{
                  width:"100%", boxSizing:"border-box", padding:"10px 12px", borderRadius:10,
                  border:"1.5px solid #fecaca", fontSize:13, fontFamily:F, color:"#222", marginBottom:10,
                }}
              />
              {delErr && (
                <div style={{ fontSize:11, color:"#ef4444", fontFamily:F, marginBottom:10 }}>{delErr}</div>
              )}
              <div style={{ display:"flex", gap:8 }}>
                <button className="pressable" onClick={() => { setDelPhase("idle"); setDelText(""); setDelErr(""); }} disabled={delPhase === "deleting"} style={{
                  flex:1, background:"#f7f7f7", border:"1.5px solid #e8e8e8", borderRadius:10,
                  padding:"10px", fontSize:12, fontWeight:700, color:"#555", fontFamily:F, cursor:"pointer",
                }}>Cancel</button>
                <button className="pressable" onClick={doDelete}
                  disabled={delText.trim().toUpperCase() !== "DELETE" || delPhase === "deleting"} style={{
                  flex:1, background:"#ef4444", border:"none", borderRadius:10,
                  padding:"10px", fontSize:12, fontWeight:800, color:"#fff", fontFamily:F,
                  cursor: (delText.trim().toUpperCase() === "DELETE" && delPhase !== "deleting") ? "pointer" : "default",
                  opacity: (delText.trim().toUpperCase() === "DELETE" && delPhase !== "deleting") ? 1 : 0.5,
                }}>{delPhase === "deleting" ? "Deleting…" : "Permanently delete"}</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ fontSize:12, color:"#555", fontFamily:F, marginBottom:10, lineHeight:1.45 }}>
            Create an account to set Strike Alerts. We'll push you the moment your spots are firing — no password, just a one-tap email link.
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input
              type="email" value={email} placeholder="you@email.com"
              onChange={e => setEmail(e.target.value)} disabled={busy}
              style={{
                flex:1, padding:"10px 12px", borderRadius:10,
                border:"1.5px solid #e8e8e8", fontSize:13, fontFamily:F, color:"#222",
              }}
            />
            <button className="pressable" onClick={send} disabled={!canSend} style={{
              background:"#222", color:"#fff", border:"none", borderRadius:10,
              padding:"10px 14px", fontSize:12, fontWeight:800, fontFamily:F, cursor: canSend ? "pointer" : "default",
              opacity: canSend ? 1 : 0.5,
            }}>
              {busy ? "Sending…"
                : cooldownMs > 0 ? `Resend in ${Math.ceil(cooldownMs / 1000)}s`
                : lastSentAt    ? "Resend link"
                : "Create account"}
            </button>
          </div>
        </>
      )}
      {feedback && (
        <div style={{ marginTop:10, fontSize:11, color: cloudSync.status === "error" ? "#ef4444" : "#0284c7", fontFamily:F }}>
          {feedback}
        </div>
      )}
    </div>
  );
}

// "My Lists" — share + manage named lists from Profile. Cloud-sync-gated:
// the Share action requires the sharer to be signed in (so the snapshot row
// has a real owner_id for referral attribution). The component is rendered
// conditionally on CLOUD_SHARE_ENABLED at its call site — without the
// shared_lists table the whole thing 500s, so hiding it is cleaner than
// surfacing a button that always errors.
function MyListsSection({ namedLists, cloudSync }) {
  const [statusByList, setStatusByList] = useState({}); // {listId: "sharing" | "copied" | "shared" | "error" | "needs_signin"}
  const setListStatus = (id, status) => {
    setStatusByList(s => ({ ...s, [id]: status }));
    if (status && status !== "sharing") {
      setTimeout(() => setStatusByList(s => { const n = { ...s }; delete n[id]; return n; }), 2200);
    }
  };
  const onShare = async (list) => {
    if (!list.venueIds || list.venueIds.length === 0) { setListStatus(list.id, "empty"); return; }
    setListStatus(list.id, "sharing");
    await shareList(list, cloudSync, (r) => setListStatus(list.id, r.status));
  };

  // Hide empty Favorites — clutter, no value to share an empty list
  const visible = namedLists.filter(l => (l.venueIds || []).length > 0);
  if (visible.length === 0) return null;

  return (
    <div style={{ marginBottom:16, padding:"14px 14px 10px", background:"#fff", border:"1.5px solid #ebebeb", borderRadius:14 }}>
      <div style={{ fontSize:12, fontWeight:800, color:"#222", fontFamily:F, letterSpacing:"0.04em", textTransform:"uppercase", marginBottom:10 }}>
        My Lists
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {visible.map(l => {
          const status = statusByList[l.id];
          const shareLabel = status === "sharing" ? "…"
            : status === "copied" ? "Copied ✓"
            : status === "shared" ? "Shared ✓"
            : status === "needs_signin" ? "Sign in"
            : status === "error" ? "Error"
            : status === "empty" ? "Add spots"
            : "Share";
          const shareColor = status === "copied" || status === "shared" ? "#16a34a"
            : status === "error" || status === "needs_signin" || status === "empty" ? "#dc2626"
            : "#0284c7";
          return (
            <div key={l.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 4px" }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#0284c722,#0ea5e922)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{l.emoji || "🗺️"}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{l.name}</div>
                <div style={{ fontSize:11, color:"#aaa", fontFamily:F, marginTop:1 }}>{l.venueIds.length} spot{l.venueIds.length !== 1 ? "s" : ""}</div>
              </div>
              <button onClick={() => onShare(l)} disabled={status === "sharing"} className="pressable" style={{
                background: "#fff", border:"1.5px solid", borderColor: shareColor + "55",
                color: shareColor, borderRadius:10, padding:"7px 12px",
                fontSize:11, fontWeight:800, fontFamily:F, cursor: status === "sharing" ? "default" : "pointer",
                display:"flex", alignItems:"center", gap:5, flexShrink:0,
              }}>
                <span>↗</span> {shareLabel}
              </button>
            </div>
          );
        })}
      </div>
      {!cloudSync?.user && (
        <div style={{ marginTop:8, fontSize:10, color:"#aaa", fontFamily:F, lineHeight:1.4 }}>
          Sign in above to share lists with friends.
        </div>
      )}
    </div>
  );
}

// ─── map view ─────────────────────────────────────────────────────────────────
// Leaflet map with venue markers colored by verdict. Tap → detail sheet.
// Initial center keys off home airport coords; falls back to world view.
function MapView({ listings, profile, onOpenDetail }) {
  const containerRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const layerRef = React.useRef(null);

  const initialCenter = (() => {
    const ap = profile?.homeAirport;
    if (ap && typeof AIRPORT_COORDS !== "undefined" && AIRPORT_COORDS[ap]) {
      return { lat: AIRPORT_COORDS[ap].lat, lon: AIRPORT_COORDS[ap].lon, zoom: 4 };
    }
    return { lat: 30, lon: 0, zoom: 2 };
  })();

  useEffect(() => {
    if (!window.L || !containerRef.current || mapRef.current) return;
    const L = window.L;
    const map = L.map(containerRef.current, {
      center: [initialCenter.lat, initialCenter.lon],
      zoom: initialCenter.zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors © <a href="https://carto.com">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 18,
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    return () => { try { map.remove(); } catch (_) {} mapRef.current = null; layerRef.current = null; };
  }, []);

  useEffect(() => {
    if (!layerRef.current || !window.L) return;
    const L = window.L;
    layerRef.current.clearLayers();
    listings.forEach(v => {
      if (typeof v.lat !== "number" || typeof v.lon !== "number") return;
      const verdict = getGoVerdict(v.conditionScore);
      const marker = L.circleMarker([v.lat, v.lon], {
        radius: v.conditionScore >= 85 ? 11 : 8,
        fillColor: verdict.color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.92,
      });
      marker.bindTooltip(
        `<div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:11px"><strong>${v.title}</strong><br/>${verdict.label} · ${v.conditionScore} · $${v.flight?.price ?? "—"}</div>`,
        { direction: "top", offset: [0, -6] }
      );
      marker.on("click", () => { try { onOpenDetail && onOpenDetail(v); } catch (_) {} });
      layerRef.current.addLayer(marker);
    });
  }, [listings]);

  return (
    <div style={{ flex:1, position:"relative", minHeight:0 }}>
      <div ref={containerRef} style={{ position:"absolute", inset:0 }} />
      {!window.L && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"#f5f5f5", color:"#888", fontFamily:F, fontSize:13 }}>
          Loading map…
        </div>
      )}
    </div>
  );
}

// ─── scoring explainer — one-time education card (CLAUDE.md Open #8) ─────────
// New users were dumped into Explore with zero context for what the scores
// mean. One dismissible card, shows until "Got it", then never again.
// Onboarding itself stays friction-free per the 2026-05 contract — this lives
// in the feed where the scores actually are.
function ScoringExplainer() {
  const isDismissed = () => {
    try { return !!localStorage.getItem("peakly_scoring_explainer_dismissed"); } catch { return true; }
  };
  const [dismissed, setDismissed] = useState(isDismissed);
  if (dismissed) return null;
  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem("peakly_scoring_explainer_dismissed", String(Date.now())); } catch {}
    logEvent("scoring_explainer", { stage: "dismissed" });
  };
  return (
    <div style={{ padding:"12px 14px 0" }}>
      <div style={{
        background:"#fff", border:"1.5px solid #e0f2fe", borderRadius:14,
        padding:"14px 16px", boxShadow:"0 2px 12px rgba(2,132,199,0.10)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <span style={{ fontSize:18 }}>🎯</span>
          <span style={{ fontSize:13.5, fontWeight:800, color:"#222", fontFamily:F, flex:1 }}>How Peakly scores your weekend</span>
        </div>
        <div style={{ fontSize:12.5, color:"#555", fontFamily:F, lineHeight:1.55, marginBottom:10 }}>
          Every spot gets a 0–100 score for the <b>Fri–Mon window</b> — live weather
          for the best 2 days, weighted with real flight prices from your airport.
          If the 7-day forecast can't back a weekend, we say so instead of guessing.
        </div>
        <button onClick={dismiss} className="pressable" style={{
          background:"#0284c7", border:"none", borderRadius:10, padding:"9px 18px",
          color:"#fff", fontSize:12.5, fontWeight:800, fontFamily:F, cursor:"pointer",
        }}>Got it</button>
      </div>
    </div>
  );
}

function ExploreTab({ listings, loading, wishlists, onToggle, alertedIds, onAlertToggle, onViewAlerts, onViewProfile, activeCat, setActiveCat, filters, setFilters, search, setSearch, onOpenDetail, namedLists, setNamedLists, wxLastUpdated, profile, onRefresh, cloudSync }) {
  const [viewMode, setViewMode] = useState("list"); // "list" | "map" — toggled in the weekend strip header
  const [showAllCats, setShowAllCats] = useState(false);
  const [pullDist, setPullDist] = useState(0);
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(30);
  const scrollRef = useRef(null);
  const touchStartY = useRef(0);
  const pullDistRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const THRESHOLD = 80;
    const onTouchStart = e => {
      touchStartY.current = el.scrollTop === 0 ? e.touches[0].clientY : 0;
    };
    const onTouchMove = e => {
      if (!touchStartY.current) return;
      const dist = Math.max(0, e.touches[0].clientY - touchStartY.current);
      if (dist > 5) {
        e.preventDefault();
        const capped = Math.min(dist, THRESHOLD + 30);
        pullDistRef.current = capped;
        setPullDist(capped);
      }
    };
    const onTouchEnd = () => {
      if (pullDistRef.current >= THRESHOLD && onRefreshRef.current) {
        setPullRefreshing(true);
        onRefreshRef.current();
        setTimeout(() => setPullRefreshing(false), 1500);
      }
      pullDistRef.current = 0;
      setPullDist(0);
      touchStartY.current = 0;
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Hero card: highest-scoring venue that has REAL weather data loaded
  const userSports = profile?.sports?.length > 0 ? profile.sports : [];
  const ACTIVE_CATS = new Set(["skiing", "beach"]);
  const activeListings = listings.filter(l => ACTIVE_CATS.has(l.category));
  const bestPool = activeCat === "all" ? activeListings : activeListings.filter(l => l.category === activeCat);
  // Exact-fares-only mode: prefer live-priced venues for the hero; fall back
  // to estimate-priced venues only when no live ones are available (cold load
  // / proxy down / TP coverage gap) so the front page never goes blank.
  const heroPickFiltered = [...bestPool]
    .filter(l => l.conditionLabel !== "Checking conditions…")
    .sort((a, b) => b.conditionScore - a.conditionScore);
  const heroLive = heroPickFiltered.filter(l => l.flight?.live === true);
  const heroPick = (heroLive.length > 0 ? heroLive[0] : heroPickFiltered[0]) || null;

  // "Firing this weekend" carousel — Fri–Mon best-2-of-4 score >= 75 with
  // medium-or-better forecast confidence. Excludes "low" confidence (next
  // weekend viewed early in the week) so the front page stays honest.
  const bestRightNow = (() => {
    const allScored = [...bestPool].filter(l => l.weekendLabel && l.weekendLabel !== "Loading…");
    const sortByVal = (a, b) => {
      const aVal = a.weekendScore - Math.round(a.flight.price / 20);
      const bVal = b.weekendScore - Math.round(b.flight.price / 20);
      return bVal - aVal;
    };
    return allScored
      .filter(l => {
        if (l.weekendScore < 75) return false;
        if (l.weekendConfidence === "low") return false;
        if (l.flight?.live !== true) return false; // exact-fares-only mode
        return getDealScore(l.flight.price, l, l.flight.from || "JFK") > -0.2;
      })
      .sort(sortByVal).slice(0, 10);
  })();

  // Fallback carousel — same shape but softer floor (weekendScore >= 65,
  // allow low-confidence). Used when the primary "Firing this weekend" set
  // doesn't meet the >=3 threshold, so the front page never goes blank.
  // Late-week views (Fri/Sat afternoon) — when this-weekend is half-over and
  // next-weekend is too far for high confidence — would otherwise show no
  // carousel at all.
  const bestRightNowFallback = (() => {
    const allScored = [...bestPool].filter(l => l.weekendLabel && l.weekendLabel !== "Loading…");
    const sortByVal = (a, b) => {
      const aVal = a.weekendScore - Math.round(a.flight.price / 20);
      const bVal = b.weekendScore - Math.round(b.flight.price / 20);
      return bVal - aVal;
    };
    return allScored
      .filter(l => l.weekendScore >= 65 && l.flight?.live === true)
      .sort(sortByVal).slice(0, 8);
  })();
  // Which carousel + header to render
  const carouselUseFallback = bestRightNow.length < 3 && bestRightNowFallback.length >= 3;
  const carouselVenues = carouselUseFallback ? bestRightNowFallback : bestRightNow;
  const carouselReady = carouselVenues.length >= 3;

  // "Cheap flight + firing weather" — the unified-deal carousel. Strict gates:
  // dealScore >= 78, priceRatio <= 0.85, confidence === "high", live flights
  // only (scoreWeekendDeal already returns null score for estimate / low conf).
  const dealCarousel = (() => {
    return [...bestPool]
      .filter(l =>
        l.dealScore != null &&
        l.dealScore >= 78 &&
        l.dealPriceRatio != null &&
        l.dealPriceRatio <= 0.85 &&
        l.weekendConfidence === "high" &&
        l.flight?.live === true
      )
      .sort((a, b) => b.dealScore - a.dealScore)
      .slice(0, 10);
  })();
  const dealCarouselReady = dealCarousel.length >= 3;

  const filtered = React.useMemo(
    () => applyFilters(activeListings, activeCat, filters, search, profile?.homeAirport),
    [activeListings, activeCat, filters, search, profile?.homeAirport]
  );
  // Exclude hero + carousel venues from the grid to avoid duplicates
  const heroAndBestIds = new Set([
    heroPick?.id,
    ...carouselVenues.map(l => l.id),
    ...dealCarousel.map(l => l.id),
  ].filter(Boolean));
  const gridListings = filtered.filter(l => !heroAndBestIds.has(l.id));

  const isAll = activeCat === "all";
  const catLabel = CATEGORIES.find(c => c.id === activeCat)?.label || "";

  const hasActiveFilters = filters.maxPrice < 2000 || filters.sort !== "score" || filters.maxFlightHrs || search.skiPass;

  // Last checked timestamp
  const timeAgo = wxLastUpdated ? (() => {
    const mins = Math.round((Date.now() - wxLastUpdated.getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.round(mins / 60)}h ago`;
  })() : null;

  // Weekend window label — anchors the time-sensitivity at the top of Explore
  // so users see "this weekend" framed every scroll session.
  const weekendLabel = (() => {
    const today = new Date();
    const indices = weekendDayIndices(today);
    if (!indices.length) return null;
    const fri = new Date(today); fri.setDate(today.getDate() + indices[0]);
    const last = new Date(today); last.setDate(today.getDate() + indices[indices.length - 1]);
    const fmt = d => d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    return `${fmt(fri)} → ${fmt(last)}`;
  })();

  // Only expose 2 active categories: Skiing, Beach (surfing retired 2026-05-03)
  const VISIBLE_CAT_IDS = ["all", "skiing", "beach"];
  const visibleCats = CATEGORIES.filter(c => VISIBLE_CAT_IDS.includes(c.id))
    .sort((a, b) => VISIBLE_CAT_IDS.indexOf(a.id) - VISIBLE_CAT_IDS.indexOf(b.id));

  return (
    <div style={{ display:"flex", flexDirection:"column", flex:1, overflow:"hidden", position:"relative" }}>
      {/* Unified toolbar — weekend window on the left, category pills on the
          right. The List/Map toggle moved to a floating FAB further down so
          this strip can shrink to a single tighter row. */}
      {weekendLabel && (
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          background:"#fff", borderBottom:"1px solid #f0f0f0",
          padding:"6px 12px", flexShrink:0, fontFamily:F, minWidth:0,
        }}>
          <button
            onClick={() => { if (!loading && onRefresh) { onRefresh(); haptic(); } }}
            disabled={loading}
            aria-label="Refresh weekend conditions"
            style={{
              display:"flex", alignItems:"center", gap:6, flexShrink:0,
              background:"#f0f9ff", border:"1px solid #e0f2fe",
              borderRadius:14, padding:"4px 10px",
              cursor: loading ? "default" : "pointer",
              fontFamily:F,
            }}
          >
            <span style={{ fontSize:11, fontWeight:800, color:"#0c4a6e", whiteSpace:"nowrap" }}>{weekendLabel}</span>
            <span style={{
              fontSize:12, color:"#0284c7", fontWeight:800,
              transform: pullRefreshing ? "rotate(360deg)" : "none",
              transition:"transform 0.6s ease",
            }}>⟲</span>
          </button>
          <div style={{ display:"flex", gap:8, flex:1, minWidth:0 }}>
            {visibleCats.map(c => (
              <button key={c.id} className={"pill" + (activeCat === c.id ? " pill-selected" : "")}
                onClick={() => { setActiveCat(c.id); setVisibleCount(30); if (c.id !== "skiing") setSearch(s => ({...s, skiPass:""})); haptic(); }}
                aria-label={`Filter by ${c.label}`}
                aria-pressed={activeCat === c.id}
                style={{
                  flex: 1, minWidth:0,
                  padding:"9px 8px", borderRadius:14, cursor:"pointer",
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", textAlign:"center",
                  background: activeCat === c.id ? "#0284c7" : "#f5f5f5",
                  color: activeCat === c.id ? "#fff" : "#555",
                  border:"1.5px solid", borderColor: activeCat === c.id ? "#0284c7" : "transparent",
                  fontSize:13, fontWeight:800, fontFamily:F,
              }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ski pass filter pills — show when skiing is selected */}
      {activeCat === "skiing" && (
        <div style={{ display:"flex", gap:6, padding:"6px 14px", overflowX:"auto", scrollbarWidth:"none", WebkitOverflowScrolling:"touch", background:"#fff", borderBottom:"1px solid #f0f0f0", flexShrink:0, alignItems:"center", touchAction:"pan-x", overscrollBehavior:"contain" }}>
          <span style={{ fontSize:10, fontWeight:700, color:"#999", fontFamily:F, whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:0.5 }}>Pass</span>
          {[{id:"",label:"All"},{id:"ikon",label:"Ikon"},{id:"epic",label:"Epic"},{id:"independent",label:"Independent"}].map(p => (
            <button key={p.id}
              onClick={() => { setSearch(s => ({...s, skiPass: s.skiPass === p.id ? "" : p.id})); haptic(); }}
              style={{
                padding:"5px 12px", borderRadius:16, cursor:"pointer", whiteSpace:"nowrap",
                background: (search.skiPass || "") === p.id ? "#222" : "#f5f5f5",
                color: (search.skiPass || "") === p.id ? "#fff" : "#555",
                border:"1.5px solid", borderColor: (search.skiPass || "") === p.id ? "#222" : "transparent",
                fontSize:11, fontWeight:700, fontFamily:F,
              }}>
              {p.label}
              {p.id && !loading && (() => { const c = listings.filter(l => l.category === "skiing" && l.skiPass === p.id).length; return c > 0 ? <span style={{ fontSize:9, fontWeight:600, opacity:0.8, marginLeft:3 }}>{c}</span> : null; })()}
            </button>
          ))}
        </div>
      )}

      {/* Active filter strip */}
      {hasActiveFilters && (
        <div style={{ display:"flex", gap:6, padding:"4px 14px 6px", overflowX:"auto", scrollbarWidth:"none", background:"#fff", borderBottom:"1px solid #f0f0f0", flexShrink:0, alignItems:"center", touchAction:"pan-x", overscrollBehavior:"contain" }}>
          {filters.sort !== "score" && (
            <FilterChip label={`${SORT_OPTIONS.find(s => s.id === filters.sort)?.label ?? filters.sort}`} onRemove={() => setFilters(f => ({...f, sort:"score"}))} />
          )}
          {filters.maxPrice < 2000 && (
            <FilterChip label={`Max $${filters.maxPrice}`} onRemove={() => setFilters(f => ({...f, maxPrice:2000}))} />
          )}
          {filters.maxFlightHrs && (
            <FilterChip label={`≤ ${filters.maxFlightHrs}hr flight`} onRemove={() => setFilters(f => ({...f, maxFlightHrs:null}))} />
          )}
          {search.skiPass && (
            <FilterChip label={search.skiPass.charAt(0).toUpperCase() + search.skiPass.slice(1) + " Pass"} onRemove={() => setSearch(s => ({...s, skiPass:""}))} />
          )}
          <button onClick={() => { setFilters({ sort:"score", maxPrice:2000, maxFlightHrs:null }); setSearch(s => ({...s, skiPass:""})); }} style={{ flexShrink:0, background:"none", border:"none", fontSize:11, color:"#aaa", fontWeight:700, fontFamily:F, cursor:"pointer", padding:"3px 4px", whiteSpace:"nowrap" }}>Clear all</button>
        </div>
      )}

      {viewMode === "map" && (
        <MapView listings={listings} profile={profile} onOpenDetail={onOpenDetail} />
      )}
      <div ref={scrollRef} style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", touchAction:"pan-y", display: viewMode === "map" ? "none" : "block" }}>

        {/* Pull-to-refresh indicator */}
        {(pullDist > 0 || pullRefreshing) && (
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"center",
            height: pullRefreshing ? 44 : Math.min(pullDist, 80) * 0.55,
            overflow:"hidden",
            transition: pullDist === 0 ? "height 0.25s ease" : "none",
          }}>
            <div style={{
              width:20, height:20, borderRadius:"50%",
              border:"2.5px solid #e5e7eb",
              borderTop:"2.5px solid #0284c7",
              animation: pullRefreshing ? "spin 0.7s linear infinite" : "none",
              opacity: pullRefreshing ? 1 : Math.min(pullDist / 80, 1),
              transform: `rotate(${pullDist * 3}deg)`,
            }} />
          </div>
        )}

        {/* Saved venues relocated to the Profile tab (2026-06-09) — keeps the
            Explore top a clean category-selection surface. */}

        {/* ── Home-airport setup banner ──
            Auto-detect (~app.jsx:8488) tries geolocation but fails silently
            on permission-denied. Every flight query falls back to JFK via
            `homeAirport || "JFK"`. Without this banner the user sees JFK
            prices without realizing it. Suppress when an airport IS set
            (covers users who deliberately picked JFK). */}
        {!loading && !profile?.homeAirport && onViewProfile && (
          <div onClick={onViewProfile} className="pressable" style={{
            margin:"12px 14px 0", padding:"10px 14px", background:"#fef3c7",
            border:"1.5px solid #fde68a", borderRadius:12, cursor:"pointer",
            display:"flex", alignItems:"center", gap:10,
          }}>
            <span style={{ fontSize:16, flexShrink:0 }}>📍</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:800, color:"#92400e", fontFamily:F, lineHeight:1.2 }}>
                Showing flights from JFK
              </div>
              <div style={{ fontSize:11, color:"#a16207", fontFamily:F, marginTop:1 }}>
                Tap to set your home airport for accurate prices
              </div>
            </div>
            <span style={{ fontSize:14, color:"#92400e", fontWeight:900, flexShrink:0 }}>›</span>
          </div>
        )}

        {/* ── Hero moment: Best opportunity right now ── */}
        {!loading && !heroPick && (
          /* Skeleton while weather is still fetching for first venues */
          <div style={{ margin:"10px 12px 0", borderRadius:16, overflow:"hidden", background:"#fff", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="shimmer" style={{ height:170 }} />
            <div style={{ padding:14 }}>
              <div className="shimmer" style={{ height:12, borderRadius:6, width:"45%", marginBottom:10 }} />
              <div className="shimmer" style={{ height:20, borderRadius:6, width:"70%", marginBottom:8 }} />
              <div className="shimmer" style={{ height:12, borderRadius:6, width:"50%" }} />
            </div>
          </div>
        )}
        {!loading && heroPick && (() => {
          const hero = heroPick;
          const weatherLoaded = hero.conditionLabel !== "Checking conditions…";
          const verdict = getGoVerdict(hero.conditionScore);
          const heroCity = AIRPORT_CITY[profile?.homeAirport] || profile?.homeAirport || "New York";
          return (
            <div style={{ margin:"10px 12px 0", borderRadius:16, overflow:"hidden",
              background:"#fff",
              border: weatherLoaded ? `2px solid ${verdict.color}33` : "2px solid #f0f0f0",
              boxShadow:"0 2px 12px rgba(0,0,0,0.08)",
            }} onClick={() => onOpenDetail(hero)} className="card">
              {/* Hero photo */}
              {hero.photo && (
                <div style={{ position:"relative", height:170, overflow:"hidden" }}>
                  <img src={hero.photo} alt={hero.title} loading="lazy"
                    onError={e => { e.target.onerror = null; e.target.src = getVenuePhoto(hero.title, hero.category); }}
                    style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />
                  <div style={{ position:"absolute", bottom:10, left:14 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#fff", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.06em", textShadow:"0 1px 4px rgba(0,0,0,0.5)" }}>
                      Your best window right now
                    </div>
                  </div>
                  {weatherLoaded && (
                    <div style={{ position:"absolute", top:10, right:10 }}>
                      <GoVerdictBadge score={hero.conditionScore} size="lg" />
                    </div>
                  )}
                </div>
              )}
              <div style={{ padding:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div style={{ minWidth:0, flex:1 }}>
                    {!hero.photo && (
                      <div style={{ fontSize:11, fontWeight:700, color: weatherLoaded ? verdict.color : "#aaa", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                        Your best window right now
                      </div>
                    )}
                    <div style={{ fontSize:20, fontWeight:900, color:"#222", fontFamily:F, marginTop:hero.photo ? 0 : 4, lineHeight:1.2 }}>
                      {hero.title}
                    </div>
                    <div style={{ fontSize:12, color:"#717171", fontFamily:F, marginTop:2 }}>{hero.location}</div>
                    {hero.weekendConfidence === "medium" && (
                      <div style={{ fontSize:10, color:"#a16207", fontFamily:F, fontWeight:700, marginTop:4, background:"#fef3c7", display:"inline-block", padding:"2px 7px", borderRadius:6 }}>
                        5-day forecast — may shift
                      </div>
                    )}
                  </div>
                  {!hero.photo && weatherLoaded && <GoVerdictBadge score={hero.conditionScore} size="lg" />}
                </div>
                {/* Inline stat strip — conditions left, flight price right, thin
                    vertical divider between them. Replaces the two boxed stat
                    cards so the hero card stays slim. */}
                <div style={{ display:"flex", alignItems:"stretch", gap:14, padding:"6px 0" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    {weatherLoaded ? (
                      <>
                        <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                          <span style={{ fontSize:22, fontWeight:900, color:"#222", fontFamily:F, lineHeight:1 }}>{hero.conditionScore}</span>
                          <span style={{ fontSize:11, color:"#bbb", fontFamily:F }}>/100</span>
                        </div>
                        <div style={{ fontSize:10, color:"#717171", fontFamily:F, fontWeight:600, marginTop:3, lineHeight:1.3, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", wordBreak:"break-word" }}>{hero.conditionLabel}</div>
                      </>
                    ) : (
                      <div className="shimmer" style={{ height:14, borderRadius:6, width:"60%" }} />
                    )}
                  </div>
                  <div style={{ width:1, background:"#eee", flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0, textAlign:"right" }}>
                    <div style={{ display:"flex", alignItems:"baseline", gap:4, justifyContent:"flex-end" }}>
                      <span style={{ fontSize:22, fontWeight:900, color:"#0284c7", fontFamily:F, lineHeight:1 }}>
                        {hero.flight.live ? `$${hero.flight.price}` : `~$${hero.flight.price}`}
                      </span>
                      {!hero.flight.live && <span style={{ fontSize:10, color:"#888", fontWeight:700, fontFamily:F }}>typical</span>}
                      {getFlightApiStatus() === "down" && (
                        <span
                          title="Live pricing offline — showing estimates"
                          aria-label="Live pricing offline — showing estimates"
                          style={{ fontSize:9, fontWeight:900, color:"#f59e0b", background:"#fef3c7", borderRadius:8, padding:"1px 5px", lineHeight:1 }}
                        >!</span>
                      )}
                    </div>
                    <div style={{ fontSize:10, color:"#717171", fontFamily:F, fontWeight:600, marginTop:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {hero.flight.live && hero.flight.pct >= 10
                        ? `${hero.flight.pct}% below typical · from ${heroCity}`
                        : `from ${heroCity}`}
                    </div>
                    {hero.flight.live && hero.flight.depDate && hero.flight.retDate && (
                      <div style={{ fontSize:10, fontWeight:700, color:"#0284c7", fontFamily:F, marginTop:2, whiteSpace:"nowrap" }}>
                        {shortDate(hero.flight.depDate)} → {shortDate(hero.flight.retDate)}
                      </div>
                    )}
                  </div>
                </div>
                {/* CTA row */}
                <div style={{ marginTop:12, display:"flex", gap:8 }}>
                  <button className="pressable" onClick={(e) => { e.stopPropagation(); onOpenDetail(hero); }} style={{
                    flex:1, background:"#0284c7", border:"none", borderRadius:14, padding:"12px 0",
                    color:"#fff", fontSize:13, fontWeight:800, fontFamily:F, cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    View Details
                  </button>
                  <button className="pressable" onClick={(e) => { e.stopPropagation(); onToggle(hero.id); haptic("medium"); }} style={{
                    width:46, background: wishlists.includes(hero.id) ? "#fee2e2" : "#f5f5f5",
                    border: wishlists.includes(hero.id) ? "1.5px solid #fca5a5" : "1.5px solid #e8e8e8",
                    borderRadius:14, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center",
                  }}>{wishlists.includes(hero.id) ? "❤️" : "🤍"}</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Cloud-sync status (the "Updated Xm ago" moved to the sticky weekend
              strip at top; the "Estimated prices" chip moved to a "!" badge
              inside the hero card's Flights box). ── */}
        {timeAgo && !loading && cloudSync?.enabled && (
          <div style={{ padding:"8px 14px 0", display:"flex", justifyContent:"flex-end", gap:8, alignItems:"center" }}>
            <SyncStatusPill cloudSync={cloudSync} />
          </div>
        )}

        {/* ── Scoring explainer — one-time education for new users (Open #8) ── */}
        {!loading && <ScoringExplainer />}

        {/* ── Install nudge — appears once after engagement, not on iOS Safari ── */}
        <InstallNudge wishlistCount={wishlists.length} />

        {/* ── Account nudge — surfaces after 3+ wishlists when not signed in ── */}
        <AccountNudgeBanner wishlistCount={wishlists.length} cloudSync={cloudSync} onGoToProfile={onViewProfile} />

        {/* ── Front-page carousel — primary or fallback, never blank ── */}
        {!loading && carouselReady && (
          <div style={{ marginTop:8, marginBottom:14 }}>
            <div style={{ padding:"0 14px 6px", display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:"#222", fontFamily:F }}>
                  {carouselUseFallback ? "Looking ahead" : "Firing this weekend"}
                </div>
                <div style={{ fontSize:11, color:"#717171", fontFamily:F, marginTop:1 }}>
                  {carouselUseFallback
                    ? "Forecast still firming up — early picks for the next weekend"
                    : "Best Fri–Mon windows · spontaneous trips, bookable now"}
                </div>
              </div>
              {activeListings.some(l => l.flightsLoading) && (
                <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#888", fontFamily:F, fontWeight:600 }}>
                  <span className="pulse" style={{ width:6, height:6, borderRadius:"50%", background:"#0284c7", display:"inline-block" }} />
                  Loading live prices…
                </div>
              )}
            </div>
            <div style={{
              display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none",
              WebkitOverflowScrolling:"touch", padding:"0 14px", scrollSnapType:"x mandatory",
              touchAction:"pan-x", overscrollBehavior:"contain",
            }}>
              {carouselVenues.map(l => {
                const v = getGoVerdict(l.conditionScore);
                return (
                  <div key={l.id} className="card" onClick={() => onOpenDetail(l)}
                    style={{
                      minWidth:170, maxWidth:170, scrollSnapAlign:"start",
                      background:"#fff", borderRadius:14, overflow:"hidden",
                      border:"1.5px solid #f0f0f0",
                      boxShadow:"0 1px 8px rgba(0,0,0,0.05)",
                    }}>
                    <div style={{ height:90, background:l.gradient, position:"relative", display:"flex", alignItems:"flex-end", padding:8, overflow:"hidden" }}>
                      {l.photo && <img src={l.photo} alt={l.title} loading="lazy" onError={e => { e.target.onerror = null; e.target.src = getVenuePhoto(l.title, l.category); }} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />}
                      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.3) 0%,transparent 60%)" }} />
                      <GoVerdictBadge score={l.conditionScore} />
                      <button className="heart" onClick={e => { e.stopPropagation(); onToggle(l.id); haptic("medium"); }} style={{
                        position:"absolute", top:2, right:2, background:"none", border:"none", fontSize:14,
                        width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center",
                        filter: wishlists.includes(l.id) ? "none" : "drop-shadow(0 1px 3px rgba(0,0,0,0.5))",
                      }}>{wishlists.includes(l.id) ? "❤️" : "🤍"}</button>
                    </div>
                    <div style={{ padding:"8px 10px" }}>
                      <div style={{ fontSize:12, fontWeight:800, color:"#222", fontFamily:F, lineHeight:1.2 }}>{l.title}</div>
                      <div style={{ fontSize:10, color:"#717171", fontFamily:F, marginTop:2 }}>{l.location}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:5 }}>
                        <span style={{ display:"flex", alignItems:"baseline", gap:2 }}>
                          <span style={{ fontSize:12, fontWeight:900, color:"#222", fontFamily:F }}>{l.flight.live ? '$' : '~$'}{l.flight.price}</span>
                          <span style={{ fontSize:9, color:"#aaa", fontFamily:F }}>{l.flight.live ? 'rt' : 'est'}</span>
                        </span>
                        <span style={{ fontSize:10, color:"#666", fontFamily:F, fontWeight:700 }}>{l.weekendDays || ""}</span>
                      </div>
                      {(() => {
                        // Confidence pill — make uncertainty visible. medium = 5-day
                        // horizon. wide halfWidth on high-confidence = model itself
                        // hedging (high precip-prob with ~0mm forecast).
                        if (l.weekendConfidence === "medium") {
                          return <div style={{ fontSize:9, color:"#a16207", fontFamily:F, marginTop:3 }}>· 5-day forecast — may shift</div>;
                        }
                        if (l.weekendHalfWidth >= 8) {
                          return <div style={{ fontSize:9, color:"#a16207", fontFamily:F, marginTop:3 }}>· forecast wobble (±{l.weekendHalfWidth})</div>;
                        }
                        if (l.weekendHeadline && l.weekendConsistency != null && l.weekendConsistency < 70 && l.weekendHeadline.score >= l.weekendScore + 6) {
                          return <div style={{ fontSize:9, color:"#0f766e", fontFamily:F, marginTop:3 }}>· {l.weekendHeadline.name} is the day ({l.weekendHeadline.score})</div>;
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── "Cheap flight + firing weather" — unified deal carousel ── */}
        {!loading && dealCarouselReady && (
          <div style={{ marginTop:4, marginBottom:14 }}>
            <div style={{ padding:"0 14px 6px", display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:"#222", fontFamily:F }}>
                  Cheap flight + firing weather
                </div>
                <div style={{ fontSize:11, color:"#717171", fontFamily:F, marginTop:1 }}>
                  Live prices below typical · forecast locked in
                </div>
              </div>
            </div>
            <div style={{
              display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none",
              WebkitOverflowScrolling:"touch", padding:"0 14px", scrollSnapType:"x mandatory",
              touchAction:"pan-x", overscrollBehavior:"contain",
            }}>
              {dealCarousel.map(l => {
                const pctOff = Math.max(0, Math.round((1 - l.dealPriceRatio) * 100));
                return (
                  <div key={l.id} className="card" onClick={() => onOpenDetail(l)}
                    style={{
                      minWidth:180, maxWidth:180, scrollSnapAlign:"start",
                      background:"#fff", borderRadius:14, overflow:"hidden",
                      border:"1.5px solid #bbf7d0",
                      boxShadow:"0 1px 8px rgba(0,0,0,0.05)",
                    }}>
                    <div style={{ height:90, background:l.gradient, position:"relative", display:"flex", alignItems:"flex-end", padding:8, overflow:"hidden" }}>
                      {l.photo && <img src={l.photo} alt={l.title} loading="lazy" onError={e => { e.target.onerror = null; e.target.src = getVenuePhoto(l.title, l.category); }} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />}
                      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.3) 0%,transparent 60%)" }} />
                      <div style={{ position:"absolute", top:6, left:6, background:"#16a34a", color:"#fff", borderRadius:8, padding:"3px 7px", fontSize:10, fontWeight:800, fontFamily:F, letterSpacing:0.2 }}>
                        {l.dealLabel || `Deal ${l.dealScore}`}
                      </div>
                      <button className="heart" onClick={e => { e.stopPropagation(); onToggle(l.id); haptic("medium"); }} style={{
                        position:"absolute", top:2, right:2, background:"none", border:"none", fontSize:14,
                        width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center",
                        filter: wishlists.includes(l.id) ? "none" : "drop-shadow(0 1px 3px rgba(0,0,0,0.5))",
                      }}>{wishlists.includes(l.id) ? "❤️" : "🤍"}</button>
                    </div>
                    <div style={{ padding:"8px 10px" }}>
                      <div style={{ fontSize:12, fontWeight:800, color:"#222", fontFamily:F, lineHeight:1.2 }}>{l.title}</div>
                      <div style={{ fontSize:10, color:"#717171", fontFamily:F, marginTop:2 }}>{l.location}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:5 }}>
                        <span style={{ display:"flex", alignItems:"baseline", gap:3 }}>
                          <span style={{ fontSize:12, fontWeight:900, color:"#222", fontFamily:F }}>${l.flight.price}</span>
                          <span style={{ fontSize:9, color:"#16a34a", fontFamily:F, fontWeight:800 }}>{pctOff > 0 ? `−${pctOff}%` : "rt"}</span>
                        </span>
                        <span style={{ fontSize:10, color:"#666", fontFamily:F, fontWeight:700 }}>{l.weekendDays || ""}</span>
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
              ? gridListings.slice(0, visibleCount).map(l =>
                  isAll
                    ? <CompactCard key={l.id} listing={l} wishlists={wishlists} onToggle={onToggle} onOpen={onOpenDetail} />
                    : <ListingCard key={l.id} listing={l} wishlists={wishlists} onToggle={onToggle} onOpen={onOpenDetail} alertedIds={alertedIds} onAlertToggle={onAlertToggle} />
                )
              : (() => {
                  // Filter-aware empty state: tell the user WHY they're seeing
                  // nothing, then ALSO surface the closest-matching firing
                  // venues that fell outside their filters. "No results" was a
                  // dead-end; "here's what came close" converts the same query
                  // into a recovery flow.
                  const hasFlightCap = !!filters.maxFlightHrs;
                  const hasPriceCap = filters.maxPrice < 2000;
                  const onSpecificCat = activeCat !== "all";
                  const heading = (hasFlightCap || hasPriceCap || onSpecificCat || search.skiPass)
                    ? "No matches with these filters"
                    : "Nothing great this weekend";
                  const sub = hasFlightCap
                    ? `Nothing within ${filters.maxFlightHrs} hours from ${profile?.homeAirport || "your airport"}. Try expanding your range.`
                    : onSpecificCat
                      ? `Quiet for ${catLabel.toLowerCase()} this weekend. Other categories may be firing.`
                      : heroPick
                        ? `But ${heroPick.title} looks promising in the coming weeks and flights are still $${heroPick.flight.price}.`
                        : "Conditions are quiet across the 7-day forecast window. We won't promise scores beyond what the forecast can back.";

                  // Closest-3 venues that DON'T match the active filters but
                  // are firing this weekend. We only show this when the user
                  // actually has filters set — without filters there's nothing
                  // for them to be "outside" of.
                  const fallback = hasActiveFilters
                    ? [...listings]
                        .filter(l => l.conditionScore >= 70)
                        .sort((a, b) => b.conditionScore - a.conditionScore)
                        .slice(0, 3)
                    : [];

                  return (
                    <div style={{ gridColumn:"1/-1" }}>
                      <div style={{ padding:"40px 20px 24px", textAlign:"center" }}>
                        <div style={{ fontSize:40, marginBottom:12 }}>🌤️</div>
                        <div style={{ fontSize:16, fontWeight:700, color:"#222", fontFamily:F, marginBottom:6 }}>{heading}</div>
                        <div style={{ fontSize:13, color:"#717171", fontFamily:F, marginBottom:16, lineHeight:1.5 }}>{sub}</div>
                        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                          {hasFlightCap && (
                            <button onClick={() => setFilters(f => ({...f, maxFlightHrs: f.maxFlightHrs >= 8 ? null : 8}))} className="pressable" style={{
                              background:"#0284c7", border:"none", borderRadius:12, padding:"12px 20px",
                              color:"white", fontSize:13, fontWeight:700, fontFamily:F, cursor:"pointer",
                            }}>{filters.maxFlightHrs >= 8 ? "Show all flight times" : "Try ≤ 8hr flights"}</button>
                          )}
                          {!hasFlightCap && onSpecificCat && (
                            <button onClick={() => setActiveCat("all")} className="pressable" style={{
                              background:"#0284c7", border:"none", borderRadius:12, padding:"12px 20px",
                              color:"white", fontSize:13, fontWeight:700, fontFamily:F, cursor:"pointer",
                            }}>Show all categories</button>
                          )}
                          {!hasFlightCap && !onSpecificCat && onViewAlerts && (
                            <button onClick={onViewAlerts} className="pressable" style={{
                              background:"#0284c7", border:"none", borderRadius:12, padding:"12px 20px",
                              color:"white", fontSize:13, fontWeight:700, fontFamily:F, cursor:"pointer",
                            }}>Set an alert</button>
                          )}
                          {hasActiveFilters && (
                            <button onClick={() => { setFilters({ sort:"score", maxPrice:2000, maxFlightHrs:null }); setSearch(s => ({...s, skiPass:""})); }} className="pressable" style={{
                              background:"#f5f5f5", border:"1.5px solid #e8e8e8", borderRadius:12, padding:"12px 20px",
                              color:"#555", fontSize:13, fontWeight:700, fontFamily:F, cursor:"pointer",
                            }}>Clear all filters</button>
                          )}
                        </div>
                      </div>
                      {fallback.length > 0 && (
                        <div style={{ padding:"8px 14px 4px" }}>
                          <div style={{ fontSize:11, fontWeight:800, color:"#0284c7", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10, paddingLeft:2 }}>
                            Outside your filters, but firing this weekend
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                            {fallback.map(l => (
                              <ListingCard key={l.id} listing={l} wishlists={wishlists} onToggle={onToggle} onOpen={onOpenDetail} alertedIds={alertedIds} onAlertToggle={onAlertToggle} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
          }
        </div>
        {/* Show more button */}
        {!loading && gridListings.length > visibleCount && (
          <div style={{ padding:"8px 14px 16px", textAlign:"center" }}>
            <button onClick={() => setVisibleCount(v => v + 30)} className="pressable" style={{
              background:"#fff", border:"1.5px solid #e0e0e0", borderRadius:12,
              padding:"12px 24px", fontSize:13, fontWeight:700, color:"#222",
              fontFamily:F, cursor:"pointer", width:"100%",
            }}>
              Show more ({gridListings.length - visibleCount} remaining)
            </button>
          </div>
        )}
        {/* Email capture */}
        <div style={{ margin:"8px 14px 0", padding:"16px", background:"linear-gradient(135deg,#f0f9ff,#e0f2fe)", borderRadius:16, border:"1px solid #bae6fd" }}>
          <div style={{ fontSize:13, fontWeight:800, color:"#0c4a6e", fontFamily:F, marginBottom:10 }}>Get notified when conditions are firing</div>
          <form onSubmit={async e => {
            e.preventDefault();
            const form = e.target;
            const email = form.email.value.trim();
            const btn = form.querySelector('button[type="submit"]');
            const status = form.parentElement.querySelector('.waitlist-status');
            if (!email || !email.includes("@")) { if (status) { status.textContent = "Enter a valid email"; status.style.color = "#b91c1c"; } return; }
            btn.disabled = true; btn.textContent = "…";
            try {
              const r = await fetch(`${FLIGHT_PROXY}/api/waitlist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, source: "explore_banner" })
              });
              if (r.ok) {
                window.plausible && window.plausible("email_capture", { props: { source: "explore_banner" } });
                form.email.value = "";
                btn.textContent = "On the list";
                if (status) { status.textContent = "You're in. We'll ping when conditions pop."; status.style.color = "#0c4a6e"; }
              } else {
                btn.disabled = false; btn.textContent = "Try again";
                if (status) { status.textContent = "Save failed — retry in a sec"; status.style.color = "#b91c1c"; }
              }
            } catch {
              btn.disabled = false; btn.textContent = "Try again";
              if (status) { status.textContent = "Network hiccup — retry"; status.style.color = "#b91c1c"; }
            }
          }} style={{ display:"flex", gap:8 }}>
            <input name="email" type="email" placeholder="your@email.com" aria-label="Email address for condition alerts" style={{ flex:1, padding:"9px 12px", borderRadius:10, border:"1.5px solid #bae6fd", fontSize:12, fontFamily:F, background:"white", outline:"none", color:"#222" }} />
            <button type="submit" className="pressable" style={{ padding:"9px 14px", background:"#0284c7", border:"none", borderRadius:10, fontSize:12, fontWeight:800, color:"white", fontFamily:F, cursor:"pointer", whiteSpace:"nowrap" }}>Notify me</button>
          </form>
          <div className="waitlist-status" style={{ fontSize:11, marginTop:8, fontFamily:F, minHeight:14 }}></div>
        </div>
        <div style={{ height:24 }} />
      </div>
      {/* Floating List/Map view toggle — hovers above the bottom tab nav so it
          stays reachable from either view without consuming a toolbar slot. */}
      <button
        onClick={() => { const next = viewMode === "map" ? "list" : "map"; setViewMode(next); haptic(); window.plausible && window.plausible('View Mode', { props: { mode: next } }); }}
        aria-label={viewMode === "map" ? "Switch to list view" : "Switch to map view"}
        style={{
          position:"absolute", bottom:18, right:14, zIndex:6,
          display:"flex", alignItems:"center", gap:6,
          background:"#222", color:"#fff",
          border:"none", borderRadius:24, padding:"10px 16px",
          boxShadow:"0 4px 16px rgba(0,0,0,0.25)",
          fontSize:13, fontWeight:800, fontFamily:F, cursor:"pointer",
        }}
      >
        <span style={{ fontSize:14, lineHeight:1 }}>{viewMode === "map" ? "≡" : "🗺"}</span>
        <span>{viewMode === "map" ? "List" : "Map"}</span>
      </button>
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
  const EMOJIS    = ["🗺️","🎿","☀️","🏝️","⛷️","🛫","🎒","🏔️","🏖️"];

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
            {listListings.map(l => <ListingCard key={l.id} listing={l} wishlists={wishlists} onToggle={onToggle} onOpen={onOpenDetail} alertedIds={alertedIds} onAlertToggle={onAlertToggle} />)}
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
          <div style={{ fontSize:24, fontWeight:900, color:"#222", fontFamily:F }}>Wishlists</div>
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
                      {previewListings.map(v => <span key={v.id} style={{ fontSize:11, fontWeight:700, color:"#888", fontFamily:F, textTransform:"uppercase" }}>{(CATEGORIES.find(c=>c.id===v.category)?.label || "").slice(0,3)}</span>)}
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
            {savedAll.map(l => <ListingCard key={l.id} listing={l} wishlists={wishlists} onToggle={onToggle} onOpen={onOpenDetail} alertedIds={alertedIds} onAlertToggle={onAlertToggle} />)}
          </div>
        )}
      </div>
      <div style={{ height:32 }} />
    </div>
  );
}

// ─── Shared list view (recipient lands here from a ?l=<slug> URL) ─────────────
// Renders a frozen snapshot of someone's named list with a "Save these to your
// Peakly" CTA. Recipient signs in (or is already signed in) → import as new
// namedList, log referred_by attribution, navigate to Explore.
function SharedListView({ snapshot, listings, cloudSync, onImported, onClose }) {
  const [email, setEmail]               = useState("");
  const [showSignIn, setShowSignIn]     = useState(false);
  const [signInBusy, setSignInBusy]     = useState(false);
  const [signInMessage, setSignInMsg]   = useState("");
  const [importing, setImporting]       = useState(false);

  const venueIds = snapshot.venue_ids || [];
  const listListings = listings.filter(l => venueIds.includes(l.id));
  const missingCount = venueIds.length - listListings.length;

  const doImport = async () => {
    setImporting(true);
    try { onImported(snapshot); } finally { setImporting(false); }
  };

  const handleSaveCta = () => {
    if (cloudSync?.user) { doImport(); return; }
    try {
      localStorage.setItem("peakly_pending_share_import", JSON.stringify({
        slug: snapshot.slug,
        name: snapshot.name,
        emoji: snapshot.emoji,
        venueIds: venueIds,
        referredBy: snapshot.owner_id,
        ts: Date.now(),
      }));
    } catch {}
    setShowSignIn(true);
  };

  const sendMagicLink = async () => {
    if (!email.trim() || !email.includes("@")) { setSignInMsg("Enter a valid email"); return; }
    setSignInBusy(true);
    setSignInMsg("");
    const r = await cloudSync.signIn(email.trim());
    setSignInBusy(false);
    if (r.ok) setSignInMsg("Check your email — magic link sent. Tap it to save these spots.");
    else setSignInMsg(r.error || "Couldn't send magic link. Try again.");
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:"#fff", position:"relative" }}>
      <div style={{ padding:"52px 24px 14px", background:"linear-gradient(160deg,#0d0d0d,#1a1a1a)", color:"#fff", flexShrink:0, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-30, right:-30, width:140, height:140, borderRadius:"50%", background:"#0284c7", opacity:0.15, filter:"blur(40px)", pointerEvents:"none" }} />
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, position:"relative" }}>
          <span style={{ fontSize:22, fontWeight:900, color:"#0284c7", letterSpacing:"-0.5px", fontFamily:F }}>peakly</span>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)", fontFamily:F, marginLeft:"auto" }}>Shared with you</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14, position:"relative" }}>
          <div style={{ width:56, height:56, borderRadius:14, background:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0, border:"1px solid rgba(255,255,255,0.12)" }}>{snapshot.emoji || "🗺️"}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:20, fontWeight:900, color:"#fff", fontFamily:F, lineHeight:1.15 }}>{snapshot.name}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontFamily:F, marginTop:4 }}>
              {venueIds.length} weekend spot{venueIds.length !== 1 ? "s" : ""} · curated by a friend
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px 20px 200px" }}>
        {listListings.length === 0 ? (
          <div style={{ padding:"48px 0", textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🌫️</div>
            <div style={{ fontSize:15, fontWeight:700, color:"#222", fontFamily:F, marginBottom:6 }}>Loading spots…</div>
            <div style={{ fontSize:13, color:"#aaa", fontFamily:F }}>If this stays blank, the list may have unknown venues.</div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {listListings.map(l => <ListingCard key={l.id} listing={l} wishlists={[]} onToggle={() => {}} onOpen={() => {}} />)}
          </div>
        )}
        {missingCount > 0 && (
          <div style={{ marginTop:14, fontSize:11, color:"#aaa", fontFamily:F, textAlign:"center" }}>
            {missingCount} spot{missingCount !== 1 ? "s" : ""} couldn't load — your friend may have a newer version
          </div>
        )}
      </div>

      <div style={{
        position:"absolute", left:0, right:0, bottom:0, background:"#fff",
        borderTop:"1.5px solid #f0f0f0",
        padding:"14px 16px",
        paddingBottom:"max(env(safe-area-inset-bottom,0px),16px)",
      }}>
        {!showSignIn ? (
          <>
            <button onClick={handleSaveCta} disabled={importing} className="pressable" style={{
              width:"100%", background: importing ? "#888" : "linear-gradient(135deg,#0284c7,#38bdf8)",
              border:"none", borderRadius:14, padding:"15px 0",
              color:"white", fontSize:15, fontWeight:900, fontFamily:F,
              cursor: importing ? "default" : "pointer",
              boxShadow:"0 4px 18px rgba(2,132,199,0.35)",
            }}>{importing ? "Saving…" : "💾 Save these to your Peakly"}</button>
            <button onClick={onClose} style={{ width:"100%", background:"none", border:"none", padding:"10px 0 0", fontSize:12, color:"#aaa", cursor:"pointer", fontFamily:F }}>Or just browse Peakly →</button>
          </>
        ) : (
          <div className="bounce-in">
            <div style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F, marginBottom:8 }}>📬 Sign in to save</div>
            <div style={{ fontSize:11, color:"#888", fontFamily:F, marginBottom:10, lineHeight:1.4 }}>We'll email you a magic link. No password. Tap the link → your spots are saved.</div>
            <div style={{ display:"flex", gap:8 }}>
              <input type="email" inputMode="email" autoComplete="email" placeholder="you@email.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMagicLink()}
                style={{ flex:1, padding:"11px 12px", borderRadius:12, border:"1.5px solid #e0e0e0", fontSize:13, fontFamily:F, color:"#222", background:"#fff" }}
              />
              <button onClick={sendMagicLink} disabled={signInBusy} style={{
                background: signInBusy ? "#888" : "#0284c7", border:"none", borderRadius:12,
                padding:"11px 16px", color:"white", fontSize:13, fontWeight:800, fontFamily:F,
                cursor: signInBusy ? "default" : "pointer",
              }}>{signInBusy ? "…" : "Send link"}</button>
            </div>
            {signInMessage && (
              <div style={{ marginTop:9, fontSize:11, color: signInMessage.startsWith("Check") ? "#16a34a" : "#dc2626", fontFamily:F }}>{signInMessage}</div>
            )}
            <button onClick={() => setShowSignIn(false)} style={{ marginTop:7, background:"none", border:"none", fontSize:11, color:"#bbb", cursor:"pointer", fontFamily:F, padding:0 }}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── alerts tab ───────────────────────────────────────────────────────────────
// Quick Templates for the empty-state "Guided Setup" carousel. Each entry
// pre-fills the alert form (sport / condition / locations / region / priceMax)
// — user reviews + taps "Create Alert" to commit. Venue IDs validated against
// VENUES at write time; if a venue is renamed, update here.
const ALERT_TEMPLATES = [
  { id:"powder-mammoth",        title:"Powder Day",     subtitle:"Mammoth",         bg:"#dbeafe", accent:"#0284c7", glyph:"mountain",
    draft:{ sport:"skiing", condition:"powder", locations:["mammoth"],         priceMax:600 } },
  { id:"pow-day-tahoe",         title:"Pow Day",        subtitle:"Tahoe",           bg:"#e0f2fe", accent:"#0369a1", glyph:"mountain",
    draft:{ sport:"skiing", condition:"powder", locations:["tahoe","heavenly"], priceMax:700 } },
  { id:"japan-first-tracks",    title:"First Tracks",   subtitle:"Japan pow",       bg:"#fee2e2", accent:"#ef4444", glyph:"plane",
    draft:{ sport:"skiing", condition:"powder", locations:["niseko","nozawa","rusutsu"], region:"AS", priceMax:1100 } },
  { id:"alps-bluebird",         title:"Bluebird",       subtitle:"Alps",            bg:"#dbeafe", accent:"#1e40af", glyph:"mountain",
    draft:{ sport:"skiing", condition:"great",  locations:["chamonix","tignes"], priceMax:800 } },
  { id:"spring-skiing",         title:"Spring Skiing",  subtitle:"Late Season",     bg:"#ede9fe", accent:"#6d28d9", glyph:"snow",
    draft:{ sport:"skiing", condition:"good",   locations:["tignes","cervinia","les-arcs-s20"], priceMax:800 } },
  { id:"whistler-fresh-snow",   title:"Fresh Snow",     subtitle:"Whistler",        bg:"#dcfce7", accent:"#16a34a", glyph:"snow",
    draft:{ sport:"skiing", condition:"insane", locations:["whistler"],        priceMax:800 } },
  { id:"cancun-beach",          title:"Beach Weekend",  subtitle:"Cancun",          bg:"#fef3c7", accent:"#f59e0b", glyph:"palm",
    draft:{ sport:"beach",  condition:"great",  locations:["beach_rivmaya"],   priceMax:500 } },
  { id:"tulum-heat",            title:"Tulum Heat",     subtitle:"Riviera Maya",    bg:"#fed7aa", accent:"#c2410c", glyph:"palm",
    draft:{ sport:"beach",  condition:"great",  locations:["beach_tulum","beach_rivmaya","beach_holbox"], priceMax:600 } },
  { id:"caribbean-escape",      title:"Caribbean",      subtitle:"Escape",          bg:"#cffafe", accent:"#0891b2", glyph:"palm",
    draft:{ sport:"beach",  condition:"great",  locations:["beach_grace","beach_eagle","beach_shoal"], priceMax:700 } },
  { id:"calm-seas",             title:"Calm Seas",      subtitle:"Sayulita + Bocas",bg:"#d1fae5", accent:"#047857", glyph:"palm",
    draft:{ sport:"beach",  condition:"great",  locations:["beach_sayulita","beach_bocas"], priceMax:600 } },
  { id:"med-beach",             title:"Med Beach",      subtitle:"Greece + Italy",  bg:"#fce7f3", accent:"#be185d", glyph:"palm",
    draft:{ sport:"beach",  condition:"great",  locations:["beach_sardinia","beach_mykonos","beach_santorini"], priceMax:900 } },
  { id:"hawaii-deal",           title:"Hawaii Deal",    subtitle:"under $700",      bg:"#fef3c7", accent:"#b45309", glyph:"palm",
    draft:{ sport:"beach",  condition:"great",  locations:["beach_hapuna","beach_kapalua"], priceMax:700 } },
  { id:"sub-300-rt",            title:"Sub-$300 RT",    subtitle:"any spot",        bg:"#dcfce7", accent:"#15803d", glyph:"plane",
    draft:{ sport:"all",    condition:"good",   locations:[],                  priceMax:300 } },
  { id:"anywhere-firing",       title:"Anywhere Firing",subtitle:"conditions 90+",  bg:"#ffe4e6", accent:"#9f1239", glyph:"plane",
    draft:{ sport:"all",    condition:"insane", locations:[],                  priceMax:1000 } },
];

function TemplateGlyph({ kind, color }) {
  const common = { width:36, height:36, viewBox:"0 0 36 36", fill:"none", stroke:color, strokeWidth:1.8, strokeLinecap:"round", strokeLinejoin:"round" };
  if (kind === "mountain") return (
    <svg {...common}><path d="M3 28l9-13 5 7 4-5 12 11z"/><path d="M10 21l2 2 2-3"/><path d="M21 18l1.5 2 1.5-2.5"/></svg>
  );
  if (kind === "plane") return (
    <svg {...common}><path d="M5 20l26-10-7 22-5-9z"/><path d="M19 23l-7 6"/></svg>
  );
  if (kind === "palm") return (
    <svg {...common}><path d="M18 30V14"/><path d="M18 14c-3-5-9-4-12-2"/><path d="M18 14c3-5 9-4 12-2"/><path d="M18 14c-4-3-7-9-6-12"/><path d="M18 14c4-3 7-9 6-12"/></svg>
  );
  if (kind === "snow") return (
    <svg {...common}><path d="M18 6v24M8 12l20 12M28 12L8 24"/><path d="M15 7l3 3 3-3M15 29l3-3 3 3"/></svg>
  );
  return null;
}

function AlertsTab({ listings, userAlerts, setUserAlerts, profile, onShowOnboarding, cloudSync, requireAccount }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft]   = useState({ sport:"", condition:"great", locations:[], priceMax:500 });
  // Wrap any action that creates/edits an alert. Signed-in users get the
  // action immediately; everyone else gets the central AccountModal — no
  // second prompt, no tab bounce.
  const gate = (action) => () => {
    if (!cloudSync?.user) { requireAccount && requireAccount(); return; }
    action();
  };
  const [showMore, setShowMore] = useState(false);

  // Helper to get condition score threshold
  const getScoreThreshold = (condition) => {
    switch(condition) {
      case "insane": return 95;
      case "great": return 85;
      case "good": return 70;
      case "custom": return draft.customScore || 85;
      case "powder": return 93;
      default: return 85;
    }
  };

  // Helper to check if a listing matches a powder condition
  const matchesSpecialCondition = (listing, condition) => {
    if (condition === "powder" && listing.category === "skiing") {
      return listing.tags?.includes("Powder Day") || listing.conditionScore >= 93;
    }
    return false;
  };

  const firing = listings.filter(l =>
    userAlerts.some(a => {
      const sportMatch = a.sport === "all" || a.sport === l.category;
      const locationMatch = a.locations.length === 0 || a.locations.includes(l.id);
      const priceMatch = l.flight.price <= a.priceMax;
      const regionMatch = !a.region || AP_CONTINENT[l.ap] === a.region;

      // Date range: only fire if today falls within the alert's travel date window
      let dateMatch = true;
      if (a.dateFrom || a.dateTo) {
        const today = new Date(new Date().toDateString()).getTime();
        if (a.dateFrom && today < new Date(a.dateFrom).getTime()) dateMatch = false;
        if (a.dateTo && today > new Date(a.dateTo).getTime()) dateMatch = false;
      }

      let scoreMatch = false;
      if (a.condition === "powder") {
        scoreMatch = matchesSpecialCondition(l, a.condition);
      } else {
        const threshold = getScoreThreshold(a.condition);
        scoreMatch = l.conditionScore >= threshold;
      }

      return sportMatch && locationMatch && priceMatch && scoreMatch && regionMatch && dateMatch;
    })
  );

  const addAlert  = () => {
    if (!draft.sport) return;
    const alertData = { ...draft, id: Date.now() };
    if (draft.condition === "custom") {
      alertData.customScore = draft.customScore || 85;
    }
    // Consumed by the polling worker in server/proxy.js, which scores each
    // alert's venue every 30 min and dispatches push when the weekend score
    // meets targetScore (24h fire cooldown). Platform delivery (APNs / FCM /
    // web push) is wired in dispatchPush() server-side.
    alertData.venueId = draft.venueId || (draft.locations && draft.locations[0]) || null;
    alertData.targetScore = getScoreThreshold(draft.condition);
    alertData.maxPrice = draft.priceMax || 500;
    alertData.enabled = true;
    setUserAlerts(p => [...p, alertData]);
    setDraft({ sport:"", condition:"great", locations:[], priceMax:500 });
    setAdding(false);

    // Register on server so the polling worker can fire push when conditions
    // hit. Fire-and-forget — local alert is saved regardless. Server needs
    // venue lat/lon/category/ap to fetch upstream weather without a duplicate
    // venue table; we send those fields when a specific venue is chosen.
    // Generic ("any location") alerts skip server fire — push only happens for
    // venue-specific alerts in v1. In-app filter still surfaces them.
    let pushToken = null;
    let pushPlatform = null;
    try { pushToken = localStorage.getItem("peakly_push_token") || null; } catch {}
    if (pushToken && pushToken !== "web-sw-registered") {
      pushPlatform = window.Capacitor?.platform === "ios" ? "ios"
                   : window.Capacitor?.isNativePlatform?.() ? "capacitor"
                   : "web";
    }
    const venueListing = alertData.venueId ? listings.find(l => l.id === alertData.venueId) : null;
    const body = {
      alertId: String(alertData.id),
      venueId: alertData.venueId,
      venueLat: venueListing?.lat ?? null,
      venueLon: venueListing?.lon ?? null,
      venueAp:  venueListing?.ap  ?? null,
      venueCategory: venueListing?.category ?? alertData.sport ?? null,
      sport: alertData.sport,
      targetScore: alertData.targetScore,
      maxPrice: alertData.maxPrice,
      pushToken,
      pushPlatform,
      homeAirport: profile?.homeAirport || null,
    };
    // Plausible event tag: include pushPlatform so the dashboard can
    // distinguish web users (no actual push delivery, pushPlatform = null)
    // from native users (ios/capacitor). Without this tag, the event count
    // overstates how many alerts will actually fire a notification.
    const platformTag = pushPlatform || "web_no_push";
    fetch(`${FLIGHT_PROXY}/api/alerts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => r.json()).then(j => {
      if (j?.success) logEvent("alert_registered_server", { alertId: alertData.id, hasToken: !!pushToken, platform: platformTag });
      else logEvent("alert_register_failed", { alertId: alertData.id, error: j?.error || "unknown", platform: platformTag });
    }).catch(e => logEvent("alert_register_error", { message: String(e?.message || e), platform: platformTag }));
  };
  const delAlert  = id => {
    setUserAlerts(p => p.filter(a => a.id !== id));
    // Mirror deletion on server (fire-and-forget) so polling stops + push won't fire stale
    fetch(`${FLIGHT_PROXY}/api/alerts/${encodeURIComponent(String(id))}`, { method: "DELETE" })
      .catch(() => {});
  };

  // ── add alert sheet ────────────────────────────────────────────────────────
  // Condensed to fit a single screen: Sport / Trigger / Max price + CTA above
  // the fold; Region, Locations, Travel dates folded behind "More options".
  if (adding) {
    const pillBase = (active) => ({
      padding:"7px 12px", borderRadius:20, cursor:"pointer", fontFamily:F,
      background: active ? "#222" : "#f7f7f7",
      color:      active ? "#fff" : "#222",
      border:"1.5px solid", borderColor: active ? "#222" : "#e8e8e8",
      fontSize:13, fontWeight:600,
    });
    const sectionLabel = { fontSize:11, fontWeight:700, color:"#888", fontFamily:F, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" };

    return (
      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ padding:"14px 18px 0" }}>
          <button onClick={() => setAdding(false)} style={{
            background:"none", border:"none", fontSize:13, color:"#717171", cursor:"pointer", fontFamily:F,
            display:"flex", alignItems:"center", gap:4, padding:0,
          }}>← Back</button>
          <div style={{ fontSize:20, fontWeight:900, color:"#222", fontFamily:F, marginTop:8, letterSpacing:"-0.01em" }}>Create Alert</div>
          <div style={{ fontSize:12, color:"#717171", marginTop:2, fontFamily:F, lineHeight:1.4 }}>
            We'll notify you when conditions peak AND flights are cheap.
          </div>
        </div>

        <div style={{ padding:"14px 18px 24px" }}>
          <div style={sectionLabel}>Sport</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {[{ id:"all", label:"Any" }, ...CATEGORIES.filter(c => ["skiing", "beach"].includes(c.id))].map(cat => (
              <button key={cat.id} onClick={() => setDraft(d => ({...d, sport:cat.id}))} style={pillBase(draft.sport === cat.id)}>
                {cat.label}
              </button>
            ))}
          </div>

          {draft.sport && (
            <div className="fade-in">
              <div style={{ ...sectionLabel, marginTop:16 }}>Trigger</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {draft.sport === "skiing" && (
                  <button onClick={() => setDraft(d => ({...d, condition:"powder"}))} style={pillBase(draft.condition === "powder")}>Powder 93+</button>
                )}
                <button onClick={() => setDraft(d => ({...d, condition:"insane"}))} style={pillBase(draft.condition === "insane")}>Insane 95+</button>
                <button onClick={() => setDraft(d => ({...d, condition:"great"}))}  style={pillBase(draft.condition === "great")}>Great 85+</button>
                <button onClick={() => setDraft(d => ({...d, condition:"good"}))}   style={pillBase(draft.condition === "good")}>Good 70+</button>
                <button onClick={() => setDraft(d => ({...d, condition:"custom", customScore: 85}))} style={pillBase(draft.condition === "custom")}>Custom</button>
              </div>

              {draft.condition === "custom" && (
                <div style={{ marginTop:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:"#666", fontFamily:F }}>Min score</span>
                    <span style={{ fontSize:13, fontWeight:800, color:"#0284c7", fontFamily:F }}>{draft.customScore}</span>
                  </div>
                  <input type="range" min={60} max={98} value={draft.customScore}
                    onChange={e => setDraft(d => ({...d, customScore:+e.target.value}))}
                    style={{ width:"100%", accentColor:"#0284c7", background:"#e8e8e8" }}
                  />
                </div>
              )}

              <div style={{ marginTop:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
                  <span style={sectionLabel}>
                    Max flight{profile.homeAirport ? ` · from ${profile.homeAirport}` : ""}
                  </span>
                  <span style={{ fontSize:13, fontWeight:800, color:"#0284c7", fontFamily:F }}>
                    {draft.priceMax >= 2100 ? "Any" : `$${draft.priceMax}`}
                  </span>
                </div>
                <input type="range" min={100} max={2200} step={50} value={draft.priceMax}
                  onChange={e => setDraft(d => ({...d, priceMax:+e.target.value}))}
                  style={{ width:"100%", accentColor:"#0284c7", background:"#e8e8e8" }}
                />
              </div>

              <button onClick={() => setShowMore(s => !s)} style={{
                background:"none", border:"none", color:"#0284c7", fontSize:12, fontWeight:700,
                fontFamily:F, cursor:"pointer", padding:"10px 0 0",
              }}>
                {showMore ? "Hide options ▴" : "More options ▾"}
              </button>

              {showMore && (
                <div className="fade-in">
                  <div style={{ ...sectionLabel, marginTop:10 }}>Region</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {[{id:"",label:"Anywhere"},{id:"NA",label:"N. America"},{id:"SA",label:"S. America"},{id:"EU",label:"Europe"},{id:"AS",label:"Asia"},{id:"OC",label:"Oceania"},{id:"AF",label:"Africa"}].map(r => (
                      <button key={r.id} onClick={() => setDraft(d => ({...d, region:r.id}))} style={{
                        ...pillBase((draft.region||"") === r.id), fontSize:12, padding:"6px 11px",
                      }}>{r.label}</button>
                    ))}
                  </div>

                  <div style={{ ...sectionLabel, marginTop:14 }}>Specific venues</div>
                  <button onClick={() => setDraft(d => ({...d, locations:[]}))} style={{
                    ...pillBase(draft.locations.length === 0), fontSize:12, padding:"6px 11px", marginBottom:6,
                  }}>Any</button>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
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
                          padding:"5px 10px", borderRadius:14, border:"1.5px solid", cursor:"pointer", fontFamily:F,
                          background: draft.locations.includes(venue.id) ? "#0284c7" : "#f7f7f7",
                          color: draft.locations.includes(venue.id) ? "#fff" : "#222",
                          borderColor: draft.locations.includes(venue.id) ? "#0284c7" : "#e8e8e8",
                          fontSize:12, fontWeight:600,
                        }}>{venue.title.split(",")[0]}</button>
                      ))}
                  </div>

                  <div style={{ ...sectionLabel, marginTop:14 }}>Travel window (optional)</div>
                  <div style={{ display:"flex", gap:8 }}>
                    <input type="date" value={draft.dateFrom || ""}
                      onChange={e => setDraft(d => ({...d, dateFrom:e.target.value}))}
                      className={draft.dateFrom ? "date-filled" : ""}
                      style={{ flex:1, padding:"8px 10px", borderRadius:10, border:`1.5px solid ${draft.dateFrom ? "#0284c7" : "#e8e8e8"}`, fontFamily:F, fontSize:13, background: draft.dateFrom ? "#eff6ff" : "#fff", color: draft.dateFrom ? "#0284c7" : "#222", fontWeight: draft.dateFrom ? 700 : 400 }}
                    />
                    <input type="date" value={draft.dateTo || ""}
                      onChange={e => setDraft(d => ({...d, dateTo:e.target.value}))}
                      className={draft.dateTo ? "date-filled" : ""}
                      style={{ flex:1, padding:"8px 10px", borderRadius:10, border:`1.5px solid ${draft.dateTo ? "#0284c7" : "#e8e8e8"}`, fontFamily:F, fontSize:13, background: draft.dateTo ? "#eff6ff" : "#fff", color: draft.dateTo ? "#0284c7" : "#222", fontWeight: draft.dateTo ? 700 : 400 }}
                    />
                  </div>
                </div>
              )}

              <button onClick={addAlert} style={{
                width:"100%", background:"#0284c7", border:"none",
                borderRadius:14, padding:14, marginTop:18,
                color:"white", fontSize:15, fontWeight:800, fontFamily:F, cursor:"pointer",
              }}>
                Create Alert
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── alerts list ─────────────────────────────────────────────────────────────
  return (
    <div style={{ flex:1, overflowY:"auto" }}>
      <div style={{ padding:"20px 24px 12px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:24, fontWeight:900, color:"#222", fontFamily:F, letterSpacing:"-0.02em" }}>Alerts</div>
          <div style={{ fontSize:14, color:"#717171", marginTop:6, fontFamily:F }}>Know the moment conditions are firing</div>
        </div>
        <button onClick={gate(() => setAdding(true))} className="pressable" style={{
          background:"#f5f5f5", border:"1.5px solid #e8e8e8", borderRadius:20,
          padding:"8px 16px", color:"#222", fontSize:13, fontWeight:700,
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
                <span style={{ color:"white", fontSize:13, fontWeight:800, fontFamily:F }}>{l.flight.live ? '$' : '~$'}{l.flight.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Templates — 2-column grid that scrolls with the page so all
          14 templates are visible (the old horizontal carousel clipped the
          third tile at the right edge and felt sloppy). */}
      <div style={{ padding:"4px 0 20px" }}>
        <div style={{ padding:"0 20px 10px" }}>
          <div style={{ fontSize:16, fontWeight:800, color:"#222", fontFamily:F }}>
            {userAlerts.length === 0 ? "Start with a template" : "Add another in one tap"}
          </div>
          <div style={{ fontSize:13, color:"#717171", fontFamily:F, marginTop:2 }}>
            Tap one — we'll set it up
          </div>
        </div>
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1fr", gap:10,
          padding:"4px 16px 8px",
        }}>
          {ALERT_TEMPLATES.map(t => (
            <button key={t.id} onClick={gate(() => {
              setDraft({ sport:"", condition:"great", locations:[], priceMax:500, ...t.draft });
              setAdding(true);
              haptic();
              logEvent("alert_template_applied", { id: t.id });
            })} className="pressable" style={{
              background:t.bg, border:"none", borderRadius:14,
              padding:"12px 12px 10px", textAlign:"left", cursor:"pointer",
              position:"relative", overflow:"hidden", minHeight:96,
              display:"flex", flexDirection:"column", justifyContent:"space-between",
            }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:900, color:"#222", fontFamily:F, lineHeight:1.2, wordBreak:"break-word" }}>{t.title}</div>
                <div style={{ fontSize:11, fontWeight:700, color:"#444", fontFamily:F, lineHeight:1.3, marginTop:2, wordBreak:"break-word" }}>{t.subtitle}</div>
              </div>
              <div style={{ alignSelf:"flex-end", marginTop:6 }}>
                <TemplateGlyph kind={t.glyph} color={t.accent} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Saved alerts — slim one-line rows; firing rows get the blue accent */}
      {userAlerts.length > 0 && (
        <div style={{ padding:"0 24px" }}>
          {userAlerts.filter(a => a.sport === "all" || CATEGORIES.find(c => c.id === a.sport)).map(a => {
            const cat    = CATEGORIES.find(c => c.id === a.sport);
            const active = firing.some(l => {
              const sportMatch = a.sport === "all" || a.sport === l.category;
              const locationMatch = a.locations.length === 0 || a.locations.includes(l.id);
              const priceMatch = l.flight.price <= a.priceMax;
              let scoreMatch = false;
              if (a.condition === "powder") {
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
              "custom": `Custom (≥${a.customScore})`
            };
            const priceLabel = a.priceMax >= 2100 ? "Any price" : `≤$${a.priceMax}`;

            return (
              <div key={a.id} style={{
                background: active ? "#f0f9ff" : "#f9f9f9",
                borderLeft: active ? "4px solid #0284c7" : "4px solid #e8e8e8",
                padding:"12px 14px", marginBottom:8,
                display:"flex", justifyContent:"space-between", alignItems:"center",
              }}>
                <div style={{ flex:1, fontSize:13, color:"#222", fontFamily:F, lineHeight:1.3 }}>
                  <span style={{ fontWeight:700 }}>{cat?.label || "Any sport"}</span>
                  <span style={{ color:"#717171" }}> · {conditionLabels[a.condition] || a.condition} · {priceLabel}</span>
                </div>
                <button onClick={() => delAlert(a.id)} style={{
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
function ProfileTab({ profile, setProfile, onShowOnboarding, cloudSync, openAccountModal, listings, wishlists, onToggle, onOpenDetail }) {
  const [signOutConfirm, setSignOutConfirm] = useState(false);
  const signedIn = !!cloudSync?.user;
  const savedListings = (listings || []).filter(l => (wishlists || []).includes(l.id));

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"40px 24px 32px", display:"flex", flexDirection:"column" }}>
      {signedIn ? (
        <>
          <div style={{ fontSize:28, fontWeight:900, color:"#222", fontFamily:F, lineHeight:1.1, letterSpacing:"-0.4px" }}>
            ✨ You're set.
          </div>
          <div style={{ fontSize:15, color:"#555", fontFamily:F, marginTop:10, lineHeight:1.5 }}>
            We'll push you the moment conditions are firing at your spots.
          </div>
          <div style={{ fontSize:12, color:"#888", fontFamily:F, marginTop:18 }}>
            Signed in as <strong style={{ color:"#222" }}>{cloudSync.user.email}</strong>
          </div>
          {!signOutConfirm ? (
            <button onClick={() => setSignOutConfirm(true)} className="pressable" style={{
              alignSelf:"flex-start", marginTop:24, background:"none", border:"none",
              fontSize:12, fontWeight:700, color:"#888", fontFamily:F, cursor:"pointer",
              textDecoration:"underline", textUnderlineOffset:"3px", padding:0,
            }}>Sign out</button>
          ) : (
            <div style={{ marginTop:20, padding:"14px 16px", background:"#fff5f5", border:"1.5px solid #ffcdd2", borderRadius:14 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#222", fontFamily:F, marginBottom:10 }}>Sign out?</div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => setSignOutConfirm(false)} style={{
                  flex:1, background:"#f7f7f7", border:"1.5px solid #e8e8e8", borderRadius:10,
                  padding:"10px", color:"#555", fontSize:12, fontWeight:700, fontFamily:F, cursor:"pointer",
                }}>Cancel</button>
                <button onClick={() => {
                  cloudSync.signOut && cloudSync.signOut();
                  setProfile(p => ({ ...p, hasAccount:false }));
                  setSignOutConfirm(false);
                }} style={{
                  flex:1, background:"#0284c7", border:"none", borderRadius:10,
                  padding:"10px", color:"white", fontSize:12, fontWeight:700, fontFamily:F, cursor:"pointer",
                }}>Sign out</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ fontSize:28, fontWeight:900, color:"#222", fontFamily:F, lineHeight:1.1, letterSpacing:"-0.4px" }}>
            Be first when<br/>conditions are firing.
          </div>
          <div style={{ fontSize:15, color:"#555", fontFamily:F, marginTop:12, lineHeight:1.5 }}>
            Push alerts the moment your spots peak. Wishlists synced across devices. No password.
          </div>
          <button onClick={() => openAccountModal && openAccountModal({ intent: "alert" })} className="pressable" style={{
            width:"100%", marginTop:22,
            background:"#0284c7", color:"#fff", border:"none", borderRadius:14,
            padding:"15px 18px", fontSize:15, fontWeight:800, fontFamily:F, cursor:"pointer",
            boxShadow:"0 4px 18px rgba(2,132,199,0.30)",
          }}>
            Create account
          </button>
        </>
      )}

      {/* ── Saved venues (relocated here from the Explore top 2026-06-09) ── */}
      {savedListings.length > 0 && (
        <div style={{ marginTop:28 }}>
          <div style={{ fontSize:15, fontWeight:800, color:"#222", fontFamily:F, marginBottom:12 }}>
            Saved venues
          </div>
          <div style={{ display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4, touchAction:"pan-x", overscrollBehavior:"contain" }}>
            {savedListings.map(l => (
              <div key={l.id} className="card" onClick={() => onOpenDetail && onOpenDetail(l)} style={{
                minWidth:140, maxWidth:140, background:"#fff", borderRadius:12, overflow:"hidden",
                border:"1.5px solid #eee", flexShrink:0, cursor:"pointer",
              }}>
                <div style={{ height:70, background:l.gradient, position:"relative" }}>
                  <button className="heart" onClick={e => { e.stopPropagation(); onToggle && onToggle(l.id); haptic("medium"); }} style={{
                    position:"absolute", top:2, right:2, background:"none", border:"none", fontSize:12,
                    width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
                  }}>❤️</button>
                </div>
                <div style={{ padding:"6px 8px" }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"#222", fontFamily:F, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.title}</div>
                  <div style={{ fontSize:10, color:"#666", fontFamily:F }}>{l.flight.live ? '$' : '~$'}{l.flight.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tiny footer links — sit at the very bottom */}
      <div style={{ flex:1 }} />
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:8, marginTop:32 }}>
        <button onClick={onShowOnboarding} className="pressable" style={{
          background:"none", border:"none",
          fontSize:12, fontWeight:600, color:"#888", fontFamily:F, cursor:"pointer",
          textDecoration:"underline", textUnderlineOffset:"3px", padding:0,
        }}>
          {profile.homeAirport ? `Home: ${profile.homeAirport} · ${(profile.sports || []).join(" & ") || "no sport set"}` : "Set home airport & sport"}
        </button>
        <button onClick={forceCleanReload} className="pressable" style={{
          background:"none", border:"none",
          fontSize:11, fontWeight:600, color:"#bbb", fontFamily:F, cursor:"pointer",
          textDecoration:"underline", textUnderlineOffset:"3px", padding:0,
        }}>
          App v{PEAKLY_BUILD} · Refresh
        </button>
        {/* Legal links — App Store review requires reachable ToS + Privacy pages */}
        <div style={{ display:"flex", gap:14 }}>
          <a href="terms.html" target="_blank" rel="noopener" style={{
            fontSize:11, fontWeight:600, color:"#bbb", fontFamily:F,
            textDecoration:"underline", textUnderlineOffset:"3px",
          }}>Terms of Service</a>
          <a href="privacy.html" target="_blank" rel="noopener" style={{
            fontSize:11, fontWeight:600, color:"#bbb", fontFamily:F,
            textDecoration:"underline", textUnderlineOffset:"3px",
          }}>Privacy Policy</a>
        </div>
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
                            {l.flight.live ? '$' : '~$'}{l.flight.price}
                          </span>
                          <span style={{ background:"#f7f7f7", borderRadius:9, padding:"3px 9px", fontSize:11, fontWeight:700, color:"#555", fontFamily:F }}>
                            {cat?.label}
                          </span>
                          {l.flight.live && l.flight.pct >= 10 && (
                            <span style={{ background:"#ecfdf5", borderRadius:9, padding:"3px 9px", fontSize:11, fontWeight:700, color:"#059669", fontFamily:F }}>
                              -{l.flight.pct}% below typical
                            </span>
                          )}
                        </div>

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

// ─── airport setup modal ──────────────────────────────────────────────────────
function AccountSetupModal({ profile, setProfile, onClose, fetchInitialWeather }) {
  const [apQuery, setApQuery] = useState("");
  const [apFocus, setApFocus] = useState(false);
  const [selected, setSelected] = useState(profile.homeAirport || "");

  const TOP_AIRPORTS = [
    { code:"LAX", city:"Los Angeles" },
    { code:"JFK", city:"New York (JFK)" },
    { code:"SFO", city:"San Francisco" },
    { code:"ORD", city:"Chicago O'Hare" },
    { code:"ATL", city:"Atlanta" },
    { code:"DFW", city:"Dallas Fort Worth" },
    { code:"MIA", city:"Miami" },
    { code:"SEA", city:"Seattle" },
    { code:"BOS", city:"Boston" },
    { code:"DEN", city:"Denver" },
    { code:"PHX", city:"Phoenix" },
    { code:"LAS", city:"Las Vegas" },
  ];

  const apResults = apQuery.length >= 2
    ? ALL_AIRPORTS.filter(a =>
        a.flag === "🇺🇸" && (
          a.city.toLowerCase().includes(apQuery.toLowerCase()) ||
          a.code.toLowerCase().includes(apQuery.toLowerCase())
        )
      ).slice(0, 6)
    : [];

  const handleContinue = () => {
    if (selected) {
      setProfile(p => ({
        ...p,
        homeAirport: selected,
        homeAirports: [...new Set([selected, ...(p.homeAirports || [])])],
      }));
      window.plausible && window.plausible('Airport Set', { props: { airport: selected, source: 'setup_modal' } });
    }
    try { localStorage.setItem("peakly_airport_setup_done", "1"); } catch {}
    // Pre-fetch weather during onboarding transition
    setTimeout(() => { if (typeof fetchInitialWeather === 'function') fetchInitialWeather(false); }, 100);
    onClose();
  };

  const handleSkip = () => {
    try { localStorage.setItem("peakly_airport_setup_done", "1"); } catch {}
    onClose();
  };

  return (
    <>
      <div style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:210,
        backdropFilter:"blur(4px)", WebkitBackdropFilter:"blur(4px)",
      }} onClick={handleSkip} />
      <div className="sheet" style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"min(430px,100vw)", background:"#fff", borderRadius:"28px 28px 0 0",
        zIndex:211, maxHeight:"88vh", overflowY:"auto",
        paddingBottom:"max(env(safe-area-inset-bottom,0px),28px)",
        boxShadow:"0 -8px 40px rgba(0,0,0,0.18)",
      }}>
        {/* Handle */}
        <div style={{ display:"flex", justifyContent:"center", padding:"14px 0 6px" }}>
          <div style={{ width:40, height:4, borderRadius:2, background:"#e0e0e0" }} />
        </div>

        <div style={{ padding:"10px 24px 0" }}>
          {/* Icon */}
          <div style={{
            width:52, height:52, borderRadius:16,
            background:"linear-gradient(135deg,#0284c7,#38bdf8)",
            display:"flex", alignItems:"center", justifyContent:"center",
            marginBottom:18,
            boxShadow:"0 6px 20px rgba(2,132,199,0.32)",
          }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.19 6.19l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div style={{ fontSize:26, fontWeight:900, color:"#111", fontFamily:F, lineHeight:1.15, marginBottom:8 }}>
            Where are you<br/>flying from?
          </div>
          <div style={{ fontSize:14, color:"#717171", fontFamily:F, lineHeight:1.55, marginBottom:22 }}>
            We'll find cheap flights from your home airport to the best conditions worldwide.
          </div>

          {/* Search input */}
          <div style={{ position:"relative", marginBottom:16 }}>
            <svg style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width={17} height={17} viewBox="0 0 24 24" fill="none">
              <circle cx={11} cy={11} r={8} stroke="#aaa" strokeWidth={2}/>
              <path d="M21 21l-4.35-4.35" stroke="#aaa" strokeWidth={2} strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search city or airport code…"
              value={apQuery}
              onChange={e => setApQuery(e.target.value)}
              onFocus={() => setApFocus(true)}
              onBlur={() => setTimeout(() => setApFocus(false), 180)}
              autoComplete="off"
              style={{
                width:"100%", padding:"13px 14px 13px 42px",
                borderRadius:14, border:"1.5px solid #e8e8e8",
                fontSize:15, fontFamily:F, color:"#222", background:"#fafafa",
                outline:"none", boxSizing:"border-box",
              }}
            />
          </div>

          {/* Autocomplete dropdown */}
          {apFocus && apResults.length > 0 && (
            <div style={{
              background:"#fff", border:"1.5px solid #e8e8e8", borderRadius:14,
              marginBottom:12, overflow:"hidden",
              boxShadow:"0 8px 28px rgba(0,0,0,0.12)",
            }}>
              {apResults.map((ap, i) => (
                <button key={ap.code} onMouseDown={() => { setSelected(ap.code); setApQuery(""); setApFocus(false); }} style={{
                  width:"100%", padding:"12px 16px", background: selected===ap.code ? "#f0f9ff" : "#fff",
                  border:"none", borderBottom: i < apResults.length-1 ? "1px solid #f5f5f5" : "none",
                  textAlign:"left", cursor:"pointer", fontFamily:F, display:"flex", alignItems:"center", gap:12, minHeight:48,
                }}>
                  <div style={{ flex:1 }}>
                    <span style={{ fontSize:14, fontWeight:800, color:"#222" }}>{ap.code}</span>
                    <span style={{ fontSize:13, color:"#717171" }}> · {ap.city}</span>
                  </div>
                  {selected===ap.code && (
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="#0284c7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Quick-pick top airports */}
          {!apQuery && (
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#aaa", fontFamily:F, letterSpacing:"0.08em", marginBottom:10, textTransform:"uppercase" }}>
                Popular airports
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {TOP_AIRPORTS.map(ap => {
                  const sel = selected === ap.code;
                  return (
                    <button key={ap.code} onClick={() => setSelected(ap.code)} style={{
                      padding:"9px 13px", borderRadius:20, cursor:"pointer",
                      background: sel ? "#0284c7" : "#f5f5f5",
                      color: sel ? "#fff" : "#444",
                      border:"none",
                      fontSize:13, fontWeight:700, fontFamily:F,
                      boxShadow: sel ? "0 2px 10px rgba(2,132,199,0.3)" : "none",
                      transition:"all 0.18s cubic-bezier(0.34,1.56,0.64,1)",
                    }}>
                      {ap.code}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected airport confirmation */}
          {selected && (
            <div style={{
              marginTop:14, padding:"12px 16px", borderRadius:14,
              background:"#f0f9ff", border:"1.5px solid #bae6fd",
              display:"flex", alignItems:"center", gap:10,
            }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#0284c7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <span style={{ fontSize:13, fontWeight:800, color:"#0284c7", fontFamily:F }}>{selected}</span>
                <span style={{ fontSize:13, color:"#0369a1", fontFamily:F }}>
                  {" "}· {ALL_AIRPORTS.find(a => a.code === selected)?.city || TOP_AIRPORTS.find(a => a.code === selected)?.city || selected}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ padding:"20px 24px 4px" }}>
          <button onClick={handleContinue} className="pressable" style={{
            width:"100%", background: selected ? "#222" : "#ccc",
            border:"none", borderRadius:16, padding:"17px 0",
            color:"white", fontSize:16, fontWeight:900, fontFamily:F, cursor:"pointer",
            transition:"background 0.2s",
          }}>
            {selected ? "Find my flights" : "Continue"}
          </button>
          <div style={{ textAlign:"center", marginTop:12 }}>
            <button onClick={handleSkip} style={{
              background:"none", border:"none", fontSize:13, color:"#aaa",
              fontFamily:F, cursor:"pointer", padding:"4px 12px",
            }}>
              Skip for now
            </button>
          </div>
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

function OnboardingSheet({ profile, setProfile, cloudSync, setImportToast, onClose }) {
  const [step,        setStep]       = useState(0);
  const [sports,      setSports]     = useState(profile.sports || []);
  const [airport,     setAirport]    = useState(profile.homeAirport || "");
  const [apQuery,     setApQuery]    = useState("");
  const [apFocus,     setApFocus]    = useState(false);
  const [detecting,   setDetecting]  = useState(false);
  const detectAirport = () => {
    if (!navigator.geolocation || detecting) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const code = findNearestAirport(pos.coords.latitude, pos.coords.longitude);
        if (code) setAirport(code);
        setDetecting(false);
      },
      () => setDetecting(false),
      { timeout: 4000, maximumAge: 300000 }
    );
  };

  // Sync airport when geolocation resolves after onboarding opened
  useEffect(() => {
    if (profile.homeAirport && !airport) setAirport(profile.homeAirport);
  }, [profile.homeAirport]);

  const toggleSport = id => {
    setSports(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const complete = () => {
    // Email is collected in the account-creation flow (Alerts tab / nudge banner),
    // not in onboarding. Onboarding stays friction-free: airport + sports + done.
    // onboarded_at lets the account-nudge banner know when to first prompt.
    setProfile(p => ({ ...p, sports, homeAirport: airport, hasAccount:true, onboarded_at: Date.now() }));
    window.plausible && window.plausible('Onboarding Complete', {props: {airport: airport || 'none'}});
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

        {/* Progress dots — only show on setup steps */}
        {step > 0 && (
          <div style={{ display:"flex", justifyContent:"center", gap:6, paddingBottom:4 }}>
            {[1,2].map(i => (
              <div key={i} style={{
                width: step === i ? 20 : 6, height:6, borderRadius:3,
                background: step >= i ? "#0284c7" : "#e8e8e8",
                transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              }} />
            ))}
          </div>
        )}

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div style={{ padding:"32px 28px 8px" }}>
            {/* Brand mark */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:40 }}>
              <div style={{
                width:42, height:42, borderRadius:12,
                background:"linear-gradient(135deg,#0284c7,#38bdf8)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 4px 16px rgba(2,132,199,0.32)",
              }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L9 9H3L8 13.5L6 21L12 17L18 21L16 13.5L21 9H15L12 3Z" fill="white"/>
                </svg>
              </div>
              <span style={{ fontSize:26, fontWeight:900, color:"#222", fontFamily:F, letterSpacing:"-0.5px" }}>peakly</span>
            </div>

            <div style={{ fontSize:40, fontWeight:900, color:"#222", fontFamily:F, lineHeight:1.02, letterSpacing:"-1.6px", marginBottom:14 }}>
              Know when<br/>to go.
            </div>
            <div style={{ fontSize:15, color:"#555", fontFamily:F, lineHeight:1.55, marginBottom:36 }}>
              Live conditions and cheap flights, aligned. The perfect ski or beach weekend, in one tap.
            </div>

            {/* 3 inline bullets — clean, scannable */}
            <div style={{ display:"flex", flexDirection:"column", gap:18, marginBottom:8 }}>
              {[
                { dot:"#0284c7", text:"Live ski & beach scores for this weekend" },
                { dot:"#16a34a", text: profile?.homeAirport
                    ? `Cheap flights from ${AIRPORT_CITY[profile.homeAirport] || profile.homeAirport}`
                    : "Cheap flights from your home airport" },
                { dot:"#d97706", text:"Strike alerts the moment your spots peak" },
              ].map(({ dot, text }, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:dot, flexShrink:0 }} />
                  <span style={{ fontSize:14.5, color:"#222", fontFamily:F, fontWeight:600, lineHeight:1.35 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Airport ── */}
        {step === 1 && (
          <div style={{ padding:"16px 24px 0" }}>
            <div style={{ fontSize:28, fontWeight:900, color:"#222", fontFamily:F, marginBottom:8, lineHeight:1.15, letterSpacing:"-0.6px" }}>
              Where do you fly from?
            </div>
            <div style={{ fontSize:14, color:"#717171", fontFamily:F, marginBottom:22, lineHeight:1.5 }}>
              We'll show real flight prices from your airport to every spot.
            </div>

            {navigator.geolocation && (
              <button onClick={detectAirport} disabled={detecting} className="pressable" style={{
                width:"100%", padding:"16px 14px", marginBottom:14, borderRadius:14,
                border:"none", background:"linear-gradient(135deg,#0284c7,#38bdf8)", color:"#fff",
                fontSize:15, fontWeight:900, fontFamily:F, cursor: detecting ? "default" : "pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                opacity: detecting ? 0.7 : 1,
                boxShadow:"0 4px 18px rgba(2,132,199,0.30)",
              }}>
                <span style={{ fontSize:18 }}>📍</span>
                <span>{detecting ? "Detecting your nearest airport…" : "Use my current location"}</span>
              </button>
            )}
            {navigator.geolocation && (
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, color:"#bbb" }}>
                <div style={{ flex:1, height:1, background:"#ececec" }} />
                <span style={{ fontSize:11, fontWeight:700, fontFamily:F, letterSpacing:"0.08em" }}>OR</span>
                <div style={{ flex:1, height:1, background:"#ececec" }} />
              </div>
            )}
            <div style={{ position:"relative", marginBottom:14 }}>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16, pointerEvents:"none" }}>🔍</span>
              <input type="text" placeholder="Search any airport worldwide…"
                value={apQuery} onChange={e => setApQuery(e.target.value)}
                onFocus={() => setApFocus(true)} onBlur={() => setTimeout(() => setApFocus(false), 180)}
                style={{ width:"100%", padding:"13px 14px 13px 40px", borderRadius:14, border:"1.5px solid #e8e8e8", fontSize:14, fontFamily:F, color:"#222", background:"#fafafa" }}
              />
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:8 }}>
              {US_AIRPORTS.slice(0, 10).map(ap => {
                const sel = airport === ap.code;
                return (
                  <button key={ap.code} className={"pill" + (sel ? " pill-selected" : "")}
                    onClick={() => { setAirport(ap.code); setApQuery(""); }} style={{
                      padding:"10px 14px", borderRadius:20, cursor:"pointer", minHeight:42,
                      background: sel ? "#0284c7" : "#f5f5f5", color: sel ? "#fff" : "#444",
                      border:"2px solid", borderColor: sel ? "#0284c7" : "transparent",
                      fontSize:13, fontWeight:700, fontFamily:F,
                      boxShadow: sel ? "0 2px 10px rgba(2,132,199,0.32)" : "none",
                  }}>{ap.flag} {ap.code} <span style={{ fontSize:10, opacity:0.7 }}>{ap.label}</span></button>
                );
              })}
            </div>
            {apFocus && apResults.length > 0 && (
              <div style={{ background:"#fff", border:"1.5px solid #e8e8e8", borderRadius:14, marginTop:6, overflow:"hidden", boxShadow:"0 8px 28px rgba(0,0,0,0.14)" }}>
                {apResults.map((ap,i) => (
                  <button key={ap.code} onMouseDown={() => { setAirport(ap.code); setApQuery(""); setApFocus(false); }} style={{
                    width:"100%", padding:"12px 16px", background: airport===ap.code?"#f0f9ff":"#fff",
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
          </div>
        )}

        {/* ── Step 2: Sports + Email ── */}
        {step === 2 && (
          <div style={{ padding:"16px 24px 0" }}>
            <div style={{ fontSize:28, fontWeight:900, color:"#222", fontFamily:F, marginBottom:8, lineHeight:1.15, letterSpacing:"-0.6px" }}>
              What's your move?
            </div>
            <div style={{ fontSize:14, color:"#717171", fontFamily:F, marginBottom:22, lineHeight:1.5 }}>
              Pick what you want to chase — we'll personalize your feed.
            </div>
            <div style={{ display:"flex", gap:12, marginBottom:24 }}>
              {CATEGORIES.filter(c => ["skiing", "beach"].includes(c.id)).map(cat => {
                const sel = sports.includes(cat.id);
                const grad = cat.id === "skiing"
                  ? "linear-gradient(135deg,#0284c7,#7dd3fc)"
                  : "linear-gradient(135deg,#06b6d4,#fbbf24)";
                return (
                  <button key={cat.id} onClick={() => toggleSport(cat.id)} style={{
                    flex:1, padding:"24px 12px 22px", borderRadius:18, cursor:"pointer",
                    background: sel ? grad : "#f5f5f5",
                    color: sel ? "#fff" : "#444",
                    border:"2px solid", borderColor: sel ? "transparent" : "#ebebeb",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:10,
                    boxShadow: sel ? "0 8px 22px rgba(2,132,199,0.30)" : "none",
                    transition:"transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease",
                    transform: sel ? "translateY(-1px)" : "none",
                    position:"relative", minHeight:130,
                  }}>
                    <span style={{ fontSize:42, lineHeight:1, filter: sel ? "none" : "grayscale(0.25)" }}>
                      {cat.id === "skiing" ? "🏔️" : "🏖️"}
                    </span>
                    <span style={{ fontSize:16, fontWeight:800, fontFamily:F }}>{cat.label}</span>
                    {sel && (
                      <span style={{
                        position:"absolute", top:10, right:10,
                        width:22, height:22, borderRadius:"50%",
                        background:"rgba(255,255,255,0.28)", color:"#fff",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:12, fontWeight:900,
                      }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        )}

        {/* Nav buttons */}
        {step === 0 ? (
          <div style={{ padding:"28px 24px 8px" }}>
            <button onClick={() => setStep(1)} className="pressable" style={{
              width:"100%", background:"#0284c7", border:"none", borderRadius:16, padding:"18px 0",
              color:"white", fontSize:16, fontWeight:900, fontFamily:F, cursor:"pointer",
              boxShadow:"0 4px 18px rgba(2,132,199,0.30)",
            }}>
              Get Started
            </button>
            <div style={{ textAlign:"center", paddingTop:10 }}>
              <button onClick={onClose} style={{ background:"none", border:"none", fontSize:12, color:"#bbb", fontFamily:F, cursor:"pointer" }}>
                Skip for now
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding:"24px 24px 8px", display:"flex", gap:10 }}>
            <button onClick={() => setStep(s => s-1)} className="pressable" style={{
              flex:"0 0 52px", background:"#f5f5f5", border:"none", borderRadius:16,
              fontSize:20, cursor:"pointer",
            }}>←</button>
            {step < 2 ? (
              <button onClick={() => setStep(2)} className="pressable" style={{
                flex:1, background:"#0284c7", border:"none", borderRadius:16, padding:"17px 0",
                color:"white", fontSize:15, fontWeight:900, fontFamily:F, cursor:"pointer",
                boxShadow:"0 4px 18px rgba(2,132,199,0.30)",
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
        )}
        {step > 0 && (
          <div style={{ textAlign:"center", padding:"6px 0 4px" }}>
            <button onClick={onClose} style={{ background:"none", border:"none", fontSize:12, color:"#bbb", fontFamily:F, cursor:"pointer" }}>
              Skip for now
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── weather code → emoji ─────────────────────────────────────────────────────
const WX_CODE_MAP = [[99,"⛈️"],[95,"⛈️"],[86,"❄️"],[85,"🌨️"],[82,"⛈️"],[81,"🌧️"],[80,"🌦️"],[77,"❄️"],[75,"❄️"],[73,"🌨️"],[71,"🌨️"],[67,"🌧️"],[65,"🌧️"],[63,"🌧️"],[61,"🌧️"],[57,"🌦️"],[55,"🌧️"],[53,"🌦️"],[51,"🌦️"],[48,"🌫️"],[45,"🌫️"],[3,"🌥️"],[2,"⛅"],[1,"🌤️"],[0,"☀️"]];
function wxEmoji(code) { for (const [k,v] of WX_CODE_MAP) { if ((code??0) >= k) return v; } return "🌤️"; }

// ─── (Removed: guided-experiences carousel — $0 revenue, no real images.
//      Restore from git history once GetYourGuide partner_id is approved.) ─────

// ─── Score breakdown — opens the black box ───────────────────────────────────
// Users see "94 · Strong deal" but no breakdown. Without transparency, trust
// erodes. This expander mirrors the scoreWeekendDeal math: conditionsNorm × 0.5
// + priceNorm × 0.5 (when both signals live). Three states:
//   1. Live deal — show Conditions / Price / Confidence rows + Verdict
//   2. Estimate price (no live flight) — "Conditions only · flight pricing isn't live"
//   3. Low confidence (>5-day forecast) — "Beyond reliable forecast"
function ScoreBreakdown({ listing }) {
  // First-time score education: auto-expand on the first detail-sheet open
  // ever, then flip the localStorage flag so subsequent opens stay collapsed.
  // New users get the math up-front; returning users get the cleaner default.
  const seenInitial = (() => { try { return !!localStorage.getItem("peakly_score_seen"); } catch { return true; } })();
  const [open, setOpen] = useState(!seenInitial);
  useEffect(() => {
    if (!seenInitial) {
      try { localStorage.setItem("peakly_score_seen", "1"); } catch {}
    }
  }, []);

  const wkConf = listing.weekendConfidence;
  const isLow = wkConf === "low";
  const isEstimate = listing.dealIsEstimate || listing.flight?.live !== true;
  const conditionsNorm = listing.weekendScore ?? listing.conditionScore;
  const ratio = listing.dealPriceRatio;
  // Mirror scoreWeekendDeal: priceNorm = clamp(100*(1.5-ratio), 0, 100)
  const priceNorm = ratio != null ? Math.max(0, Math.min(100, Math.round(100 * (1.5 - ratio)))) : null;
  const finalScore = listing.dealScore;
  const verdict = listing.dealLabel;

  const confExplain = wkConf === "high"
    ? "Forecast solid for the whole weekend window"
    : wkConf === "medium"
      ? "Last day at the 6-day forecast edge — slight uncertainty"
      : "Outside the 7-day forecast horizon";

  const conditionsExplain = listing.weekendLabel || listing.conditionLabel || "Conditions checked";

  const priceExplain = (() => {
    if (ratio == null) return "Flight pricing not live yet";
    const pct = Math.round((1 - ratio) * 100);
    const cur = listing.flight?.price;
    const typ = listing.flight?.normal;
    if (pct >= 1)  return `$${cur} vs $${typ} typical · ${pct}% below`;
    if (pct <= -1) return `$${cur} vs $${typ} typical · ${-pct}% above`;
    return `$${cur} matches typical pricing`;
  })();

  // Container styling (collapsed view is a one-line link/toggle)
  const wrap = {
    background:"#fff", border:"1.5px solid #ebebeb", borderRadius:14,
    marginBottom:14, overflow:"hidden",
  };
  const headerBtn = {
    display:"flex", alignItems:"center", justifyContent:"space-between",
    width:"100%", padding:"12px 14px", border:"none", background:"transparent",
    cursor:"pointer", fontFamily:F,
  };

  // Don't render at all if there's literally nothing to show
  if (conditionsNorm == null && finalScore == null) return null;

  return (
    <div style={wrap}>
      <button onClick={() => setOpen(o => !o)} style={headerBtn} aria-expanded={open}>
        <span style={{ fontSize:12, fontWeight:800, color:"#222", letterSpacing:"0.02em" }}>
          {open ? "Hide score breakdown" : "Why this score?"}
        </span>
        <span style={{ fontSize:13, color:"#888", fontWeight:700 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ padding:"4px 14px 14px", borderTop:"1px solid #f3f3f3" }}>
          {isLow ? (
            <div style={{ fontSize:12, color:"#717171", fontFamily:F, padding:"10px 0", lineHeight:1.5 }}>
              Beyond the 7-day forecast — confidence too low to call this weekend. We only score what the forecast can back.
            </div>
          ) : (
            <>
              <ScoreRow label="Conditions" weight="50 pts" value={conditionsNorm} explain={conditionsExplain} />
              {listing.weekendHeadline && listing.weekendHeadline.score >= conditionsNorm + 4 && (
                <ScoreRow
                  label="Headline day"
                  weight={listing.weekendHeadline.name}
                  value={listing.weekendHeadline.score}
                  explain={listing.weekendHeadline.label || "The single best day in the window"}
                />
              )}
              {listing.weekendHalfWidth >= 4 && listing.weekendLo != null && (
                <ScoreRow
                  label="Score range"
                  weight={`±${listing.weekendHalfWidth}`}
                  value={null}
                  explain={`${listing.weekendLo}–${listing.weekendHi} given current forecast horizon`}
                />
              )}
              {isEstimate ? (
                <div style={{ fontSize:11, color:"#888", fontFamily:F, padding:"8px 0 4px", fontStyle:"italic", lineHeight:1.5 }}>
                  Flight pricing isn't live yet — score reflects conditions only.
                </div>
              ) : (
                <ScoreRow label="Price" weight="50 pts" value={priceNorm} explain={priceExplain} />
              )}
              <ScoreRow label="Confidence" weight={wkConf} value={null} explain={confExplain} />
              {finalScore != null && verdict && (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:10, marginTop:8, borderTop:"1px dashed #ebebeb" }}>
                  <span style={{ fontSize:11, fontWeight:700, color:"#888", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.06em" }}>Verdict</span>
                  <span style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F }}>{verdict} · {finalScore}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreRow({ label, weight, value, explain }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, padding:"8px 0", borderBottom:"1px solid #f7f7f7" }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:11, fontWeight:800, color:"#222", fontFamily:F }}>
          {label} <span style={{ fontWeight:600, color:"#aaa" }}>· {weight}</span>
        </div>
        <div style={{ fontSize:11, color:"#717171", fontFamily:F, marginTop:2, lineHeight:1.4 }}>{explain}</div>
      </div>
      {value != null && (
        <div style={{ fontSize:18, fontWeight:900, color:"#222", fontFamily:F, flexShrink:0, minWidth:46, textAlign:"right" }}>
          {value}
        </div>
      )}
    </div>
  );
}

// ─── booking handoff confirm sheet ────────────────────────────────────────────
// Shown before any outbound affiliate redirect (Aviasales, Booking.com). Tells
// the user they're leaving Peakly, names the partner, discloses the affiliate
// relationship (App Store + FTC requirement), and flags estimate prices so
// nobody arrives at checkout assuming the in-app price is final.
function BookingConfirmSheet({ partner, url, label, kind, isEstimate, onConfirm, onCancel }) {
  return (
    <>
      <div onClick={onCancel} style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:300,
      }} />
      <div className="sheet" style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"min(430px,100vw)", background:"#fff", borderRadius:"24px 24px 0 0",
        zIndex:301, padding:"20px 22px max(env(safe-area-inset-bottom,0px),24px)",
        boxShadow:"0 -8px 40px rgba(0,0,0,0.18)",
      }}>
        <div style={{ width:36, height:4, background:"#e8e8e8", borderRadius:2, margin:"0 auto 18px" }} />
        <div style={{ fontSize:18, fontWeight:900, color:"#222", fontFamily:F, marginBottom:6 }}>
          Continue to {partner}?
        </div>
        <div style={{ fontSize:13, color:"#555", fontFamily:F, lineHeight:1.5, marginBottom:14 }}>
          {label}. You'll leave Peakly to complete booking on {partner}.
        </div>

        {isEstimate && (
          <div style={{ background:"#fef3c7", border:"1px solid #fde68a", borderRadius:10, padding:"10px 12px", marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:800, color:"#92400e", fontFamily:F, marginBottom:2 }}>Heads up — estimated price</div>
            <div style={{ fontSize:11, color:"#78350f", fontFamily:F, lineHeight:1.45 }}>
              The price shown in Peakly is an estimate. Final fare on {partner} may differ — search before booking.
            </div>
          </div>
        )}

        <div style={{ background:"#f7f9fb", borderRadius:10, padding:"10px 12px", marginBottom:18, fontSize:11, color:"#64748b", fontFamily:F, lineHeight:1.45 }}>
          Peakly earns a small commission if you book through this link, at no extra cost to you. It does not affect search results or rankings.
        </div>

        <button onClick={onConfirm} className="pressable" style={{
          width:"100%", background:"#222", border:"none", borderRadius:14,
          padding:"15px 0", color:"white", fontSize:14, fontWeight:900,
          fontFamily:F, cursor:"pointer", marginBottom:8,
        }}>
          Continue to {partner} ↗
        </button>
        <button onClick={onCancel} style={{
          width:"100%", background:"none", border:"none",
          padding:"10px 0", color:"#888", fontSize:13, fontWeight:700,
          fontFamily:F, cursor:"pointer",
        }}>
          Stay in Peakly
        </button>
      </div>
    </>
  );
}

// ─── venue detail sheet ────────────────────────────────────────────────────────
function VenueDetailSheet({ listing, rawWx, rawMar, wishlists, onToggle, onClose, namedLists, setNamedLists, listings, onAlert, onOpenDetail, filters, search }) {
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [shareVenueCopied, setShareVenueCopied] = useState(false);
  const [closing, setClosing] = useState(false);
  // Confirmation sheet for outbound booking handoff. Holds the partner name +
  // target URL until the user confirms or cancels.
  const [bookConfirm, setBookConfirm] = useState(null); // { partner, url, label }
  const saved = wishlists.includes(listing.id);

  const triggerClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 270);
  }, [onClose]);

  // ─── Swipe-down-to-dismiss ──────────────────────────────────────────────────
  const sheetRef = useRef(null);
  const scrollRef = useRef(null);
  const dragRef  = useRef({ startY:0, currentY:0, dragging:false });

  // Scroll back to top whenever the user navigates to a different venue
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [listing.id]);

  const onTouchStart = useCallback((e) => {
    const el = scrollRef.current;
    if (!el || el.scrollTop > 5) return; // only swipe when at top
    dragRef.current = { startY: e.touches[0].clientY, currentY: e.touches[0].clientY, dragging:true };
  }, []);
  const onTouchMove = useCallback((e) => {
    const d = dragRef.current;
    if (!d.dragging) return;
    d.currentY = e.touches[0].clientY;
    const dy = d.currentY - d.startY;
    if (dy > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateX(-50%) translateY(${dy}px)`;
      sheetRef.current.style.transition = "none";
    }
  }, []);
  const onTouchEnd = useCallback(() => {
    const d = dragRef.current;
    if (!d.dragging) return;
    d.dragging = false;
    const dy = d.currentY - d.startY;
    if (dy > 120) {
      if (sheetRef.current) {
        sheetRef.current.style.transform = "translateX(-50%) translateY(105%)";
        sheetRef.current.style.transition = "transform 0.3s cubic-bezier(0.4,0,0.8,1)";
      }
      setTimeout(onClose, 280);
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = "translateX(-50%) translateY(0)";
      sheetRef.current.style.transition = "transform 0.42s cubic-bezier(0.32,1.2,0.4,1)";
    }
  }, [onClose]);
  const d  = rawWx?.daily;
  const md = rawMar?.daily;

  const forecast = d ? (d.time || []).slice(0, 7).map((date, i) => ({
    date,
    hi:    d.temperature_2m_max?.[i]  ?? "--",
    lo:    d.temperature_2m_min?.[i]  ?? "--",
    precip:d.precipitation_sum?.[i]   ?? 0,
    wind:  d.wind_speed_10m_max?.[i]  ?? 0,
    code:  d.weather_code?.[i]        ?? 0,
    uv:    d.uv_index_max?.[i]        ?? null,
  })) : [];

  const flightUrl  = buildFlightUrl(listing.flight.from || "JFK", listing.ap, {
    startDate: listing.flight.depDate, endDate: listing.flight.retDate, whenId: search?.when,
  });

  // Similar venues: same category, excluding current, sorted by score
  const similarVenues = listings
    ? [...listings.filter(l => l.category === listing.category && l.id !== listing.id)]
        .sort((a, b) => b.conditionScore - a.conditionScore)
        .slice(0, 5)
    : [];

  const copyShareLink = (textOverride) => {
    const url = `https://j1mmychu.github.io/peakly/#venue-${listing.id}`;
    const text = textOverride || `Check out ${listing.title} on Peakly — conditions are ${listing.conditionLabel}! ${listing.conditionScore}/100\n${url}`;
    logEvent('share_click', { venue: listing.title, score: listing.conditionScore });
    const finish = () => { setShareVenueCopied(true); setTimeout(() => setShareVenueCopied(false), 2200); };
    // Use Web Share API if available (shows native share sheet on mobile)
    if (!textOverride && navigator.share) {
      navigator.share({ title: listing.title, text: `Check out ${listing.title} on Peakly — conditions are ${listing.conditionLabel}! ${listing.conditionScore}/100`, url }).catch(() => {});
      finish();
      return;
    }
    try {
      navigator.clipboard?.writeText(text).then(finish).catch(finish);
    } catch (_) { finish(); }
  };
  const fmtDate = (dateStr, i) => {
    if (i === 0) return "Today";
    if (i === 1) return "Tmrw";
    try { return new Date(dateStr + "T12:00:00Z").toLocaleDateString("en-US", { weekday:"short", day:"numeric" }); }
    catch { return dateStr?.slice(5) || ""; }
  };

  return (
    <>
      <div className={"backdrop" + (closing ? " backdrop-exit" : "")} onClick={triggerClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:300 }} />
      <div ref={sheetRef} className={"sheet" + (closing ? " sheet-exit" : "")} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"min(430px,100vw)", background:"#fff", borderRadius:"28px 28px 0 0",
        zIndex:301, maxHeight:"94vh", overflow:"hidden",
        display:"flex", flexDirection:"column",
      }}>
        <div ref={scrollRef} data-venue-detail-scroll style={{ flex:1, overflowY:"auto" }}>
        {/* Hero — full bleed */}
        <div style={{ position:"relative", height:240, overflow:"hidden", borderRadius:"28px 28px 0 0" }}>
          {listing.photo ? (
            <img src={listing.photo} alt={listing.title} loading="lazy"
              onLoad={e => { e.target.style.opacity = 1; }}
              onError={e => { e.target.onerror = null; e.target.src = getVenuePhoto(listing.title, listing.category); e.target.style.opacity = 1; }}
              style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:0, transition:"opacity 0.4s ease" }} />
          ) : (
            <div style={{ position:"absolute", inset:0, background:listing.gradient, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:88, opacity:0.22, filter:"blur(2px)" }}>{listing.icon}</span>
            </div>
          )}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 50%)" }} />
          {/* Drag handle overlaid on hero */}
          <div style={{ position:"absolute", top:10, left:0, right:0, display:"flex", justifyContent:"center", cursor:"grab" }}>
            <div style={{ width:36, height:4, borderRadius:2, background:"rgba(255,255,255,0.45)" }} />
          </div>
          <div style={{ position:"absolute", top:24, left:12, right:12, display:"flex", justifyContent:"space-between" }}>
            <button onClick={triggerClose} style={{ background:"rgba(0,0,0,0.45)", border:"none", borderRadius:"50%", width:34, height:34, fontSize:16, color:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            <div style={{ display:"flex", gap:7 }}>
              <button onClick={() => setShowSharePanel(v => !v)} className="pressable" style={{ background: showSharePanel ? "#22c55e" : "rgba(0,0,0,0.45)", border:"none", borderRadius:20, padding:"6px 13px", color:"white", fontSize:12, fontWeight:700, fontFamily:F, cursor:"pointer" }}>📤 Share & Invite</button>
              <button onClick={() => onToggle(listing.id)} className="pressable" style={{ background: saved ? "#0284c7" : "rgba(0,0,0,0.45)", border:"none", borderRadius:20, padding:"6px 13px", color:"white", fontSize:12, fontWeight:700, fontFamily:F, cursor:"pointer" }}>{saved ? "❤️ Saved" : "🤍 Save"}</button>
            </div>
          </div>
          <div style={{ position:"absolute", bottom:14, left:14, right:14 }}>
            <div style={{ fontSize:20, fontWeight:900, color:"white", fontFamily:F, lineHeight:1.15 }}>{listing.title}</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", fontFamily:F, marginTop:3 }}>
              📍 {listing.location}
              {listing.breakType && <span style={{ marginLeft:8, fontSize:10, fontWeight:700, color:"#7dd3fc", background:"rgba(255,255,255,0.15)", borderRadius:4, padding:"2px 6px", textTransform:"capitalize" }}>{listing.breakType} break</span>}
            </div>
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
                const flightLine = listing.flight.live
                  ? (listing.flight.pct >= 10
                      ? `Flights from $${listing.flight.price} (${listing.flight.pct}% below typical)`
                      : `Flights from $${listing.flight.price}`)
                  : `Flights typical ~$${listing.flight.price}`;
                const card = `${listing.title}\n${listing.location}\nConditions: ${listing.conditionScore} — ${listing.conditionLabel}\n${flightLine}\n\nFind your next adventure → j1mmychu.github.io/peakly`;
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
                <span style={{ color:"rgba(255,255,255,0.45)" }}>Find your next adventure → j1mmychu.github.io/peakly</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ padding:"16px 16px 24px" }}>
          {/* Score + flight */}
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            <div style={{ flex:1, background: listing.conditionScore >= 85 ? "#f0f9ff" : listing.conditionScore >= 70 ? "#fff7ed" : "#f7f7f7", borderRadius:14, padding:"12px 14px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#aaa", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>Conditions now</div>
              <div>
                <div style={{ fontSize:22, fontWeight:900, color: listing.conditionScore >= 85 ? "#ff385c" : listing.conditionScore >= 70 ? "#ea580c" : "#555", fontFamily:F }}>{listing.conditionScore}</div>
                <div style={{ fontSize:11, color:"#888", fontFamily:F, marginTop:2, lineHeight:1.4 }}>{listing.conditionLabel}</div>
              </div>
            </div>
            <div style={{ flex:1, background:"#f0fff4", borderRadius:14, padding:"12px 14px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#aaa", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>Flight from {listing.flight.from}</div>
              <div style={{ fontSize:22, fontWeight:900, color:"#16a34a", fontFamily:F }}>
                {listing.flight.live ? `from $${listing.flight.price}` : `~$${listing.flight.price}`}
              </div>
              {listing.flight.live && listing.flight.depDate && listing.flight.retDate && (
                <div style={{ fontSize:11, fontWeight:700, color:"#16a34a", fontFamily:F, marginTop:2, whiteSpace:"nowrap" }}>
                  {shortDate(listing.flight.depDate)} → {shortDate(listing.flight.retDate)}
                </div>
              )}
              <div style={{ fontSize:11, color:"#888", fontFamily:F, marginTop:2 }}>
                {listing.flight.live
                  ? (listing.flight.pct >= 10 ? `typical $${listing.flight.normal} · ${listing.flight.pct}% below` : "current price")
                  : "typical — live price loading"}
              </div>
              {listing.flight.foundAt && <div style={{ fontSize:10, color:"#aaa", fontFamily:F, marginTop:1 }}>seen {relTime(listing.flight.foundAt)}</div>}
            </div>
          </div>

          {/* 7-day forecast — promoted above the expander so conditions read at a glance */}
          {forecast.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F, marginBottom:10 }}>7-Day Forecast</div>
              <div style={{ display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4 }}>
                {forecast.map((f, i) => (
                  <div key={i} style={{ flexShrink:0, background:"#f7f7f7", borderRadius:12, padding:"9px 8px", minWidth:62, textAlign:"center", border: i===0 ? "2px solid #0284c7" : "2px solid transparent" }}>
                    <div style={{ fontSize:9, fontWeight:700, color: i===0?"#0284c7":"#aaa", fontFamily:F, marginBottom:3, textTransform:"uppercase" }}>{fmtDate(f.date, i)}</div>
                    <div style={{ fontSize:21 }}>{wxEmoji(f.code)}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#222", fontFamily:F, marginTop:3 }}>{Math.round(f.hi)}°</div>
                    <div style={{ fontSize:10, color:"#bbb", fontFamily:F }}>{Math.round(f.lo)}°</div>
                    {f.uv != null && (
                      <div style={{ fontSize:9, fontWeight:700, color: f.uv>=8?"#b91c1c":f.uv>=6?"#c2410c":f.uv>=3?"#a16207":"#888", fontFamily:F, marginTop:1 }}>
                        ☀️{Math.round(f.uv)}
                      </div>
                    )}
                    {f.precip > 1 && <div style={{ fontSize:9, color:"#3b82f6", fontWeight:600, fontFamily:F, marginTop:1 }}>💧{Math.round(f.precip)}"</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Why this score? — opens the black box */}
          <ScoreBreakdown listing={listing} />

          {/* Set Alert CTA */}
          {onAlert && (
            <button onClick={() => onAlert(listing)} className="pressable" style={{
              background:"#f5f5f5", border:"1.5px solid #e8e8e8", borderRadius:14,
              padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"center",
              gap:8, width:"100%", cursor:"pointer", marginBottom:14,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F }}>Alert me when conditions peak</span>
            </button>
          )}

          {/* Tags — polished to match Explore-card tag style */}
          {listing.tags?.length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14, alignItems:"center" }}>
              {listing.tags.slice(0, 4).map(t => (
                <span key={t} style={{
                  background:"#f5f5f5", border:"1px solid #ebebeb", borderRadius:10,
                  padding:"3px 9px", fontSize:11, fontWeight:700, color:"#555", fontFamily:F,
                  whiteSpace:"nowrap", flexShrink:0,
                }}>{t}</span>
              ))}
            </div>
          )}

          {/* You'd also like — similar venues (bottom of sheet) */}
          {similarVenues.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:800, color:"#222", fontFamily:F, marginBottom:10 }}>You'd also like</div>
              <div style={{ display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4, touchAction:"pan-x", overscrollBehavior:"contain" }}>
                {similarVenues.map(sv => (
                  <button key={sv.id} className="pressable" onClick={() => { scrollRef.current?.scrollTo({top:0,behavior:"auto"}); if (onOpenDetail) onOpenDetail(sv); else onClose(); }} style={{ flexShrink:0, width:130, background:"#f7f7f7", borderRadius:14, border:"none", cursor:"pointer", overflow:"hidden", textAlign:"left" }}>
                    <div style={{ height:62, background:sv.gradient, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"14px 14px 0 0", position:"relative", overflow:"hidden" }}>
                      {sv.photo ? (
                        <img src={sv.photo} alt={sv.title} loading="lazy" onError={e => { e.target.onerror = null; e.target.src = getVenuePhoto(sv.title, sv.category); }} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
                      ) : (
                        <span style={{ fontSize:28, opacity:0.55 }}>{sv.icon}</span>
                      )}
                      <div style={{ position:"absolute", top:5, right:7, background: sv.conditionScore>=85?"#ff385c":sv.conditionScore>=70?"#ea580c":"#666", borderRadius:10, padding:"2px 7px" }}>
                        <span style={{ fontSize:10, fontWeight:800, color:"white", fontFamily:F }}>{sv.conditionScore}</span>
                      </div>
                    </div>
                    <div style={{ padding:"7px 9px 9px" }}>
                      <div style={{ fontSize:11, fontWeight:800, color:"#222", fontFamily:F, lineHeight:1.3, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{sv.title}</div>
                      <div style={{ fontSize:10, color:"#aaa", fontFamily:F, marginTop:2, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{sv.location}</div>
                      <div style={{ fontSize:10, color:"#16a34a", fontWeight:700, fontFamily:F, marginTop:3 }}>
                        {sv.flight.live ? `from $${sv.flight.price}` : `~$${sv.flight.price}`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        {/* ─── Gear picks (Amazon Associates, tag=peakly-20) ─────────── */}
        {GEAR_ITEMS[listing.category] && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:800, color:"#222", fontFamily:F, marginBottom:10 }}>
              {listing.category === "skiing" ? "⛷️ Ski gear" : "🏖️ Beach essentials"}
            </div>
            <div style={{ display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4, touchAction:"pan-x" }}>
              {GEAR_ITEMS[listing.category].map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer sponsored"
                  onClick={() => { if (window.plausible) plausible('gear_click', { props: { venue: listing.title, category: listing.category, item: item.title } }); }}
                  style={{ flexShrink:0, width:130, background:"#f7f7f7", borderRadius:14, textDecoration:"none", overflow:"hidden", display:"block" }}>
                  <div style={{ height:80, overflow:"hidden", borderRadius:"14px 14px 0 0", background:"#eee" }}>
                    <img src={item.img} alt={item.title} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  </div>
                  <div style={{ padding:"7px 9px 9px" }}>
                    <div style={{ fontSize:11, fontWeight:800, color:"#222", fontFamily:F, lineHeight:1.3, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{item.title}</div>
                    <div style={{ fontSize:9, color:"#888", fontFamily:F, marginTop:2, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{item.desc}</div>
                    <div style={{ fontSize:11, fontWeight:800, color:"#0284c7", fontFamily:F, marginTop:4 }}>${item.price}</div>
                  </div>
                </a>
              ))}
            </div>
            <div style={{ fontSize:9, color:"#bbb", fontFamily:F, marginTop:6 }}>Affiliate links — we earn a small commission</div>
          </div>
        )}
        {/* Travel insurance — SafetyWing (referenceID=peakly) */}
        <a href="https://safetywing.com/?referenceID=peakly" target="_blank" rel="noopener noreferrer sponsored"
           onClick={() => { if (window.plausible) plausible('insurance_click', { props: { venue: listing.title, category: listing.category } }); }}
           style={{ display:"flex", alignItems:"center", gap:10, background:"#f7f7f7", borderRadius:14, padding:"12px 14px", marginBottom:16, textDecoration:"none" }}>
          <span style={{ fontSize:20 }}>🛡️</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F }}>Travel insurance</div>
            <div style={{ fontSize:11, color:"#888", fontFamily:F }}>SafetyWing — from $1.50/day</div>
          </div>
          <span style={{ fontSize:12, color:"#0284c7", fontWeight:700, fontFamily:F }}>Get covered →</span>
        </a>
        </div>
        </div>{/* end scrollRef */}
        {/* ─── Sticky CTA bar ─────────────────────────────────────── */}
        <div style={{
          padding:"12px 16px",
          paddingBottom:"max(env(safe-area-inset-bottom,0px),16px)",
          background:"#fff",
          borderTop:"1.5px solid #f0f0f0",
          display:"flex",
          gap:10,
          flexShrink:0,
        }}>
          <button onClick={() => {
            logEvent('flight_click', {venue: listing.title, origin: listing.flight.from});
            try { window.open(flightUrl, "_blank", "noopener,noreferrer"); } catch (_) {}
          }} className="pressable" style={{
            flex:2, background:"#222", borderRadius:14, padding:"15px 0", border:"none",
            display:"flex", alignItems:"center", justifyContent:"center", gap:7, cursor:"pointer",
          }}>
            <span style={{ fontSize:16 }}>✈️</span>
            <span style={{ fontSize:14, fontWeight:900, color:"white", fontFamily:F }}>Flights · from ${listing.flight.price}</span>
            {listing.flight.foundAt && <span style={{ fontSize:10, color:"rgba(255,255,255,0.65)", fontFamily:F }}> · {relTime(listing.flight.foundAt)}</span>}
          </button>
          <button onClick={() => {
            logEvent('hotel_click', {venue: listing.title});
            setBookConfirm({ partner: "Booking.com", url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(listing.location)}&aid=2311236`, label: "Hotels in " + listing.location, kind: "hotel" });
          }} className="pressable" style={{
            flex:1, background:"#f0f0f0", borderRadius:14, padding:"15px 0", border:"none",
            display:"flex", alignItems:"center", justifyContent:"center", gap:7, cursor:"pointer",
          }}>
            <span style={{ fontSize:16 }}>🏨</span>
            <span style={{ fontSize:14, fontWeight:800, color:"#222", fontFamily:F }}>Hotels</span>
          </button>
        </div>
        {bookConfirm && (
          <BookingConfirmSheet
            partner={bookConfirm.partner}
            url={bookConfirm.url}
            label={bookConfirm.label}
            kind={bookConfirm.kind}
            isEstimate={bookConfirm.kind === "flight" && listing.flight?.live !== true}
            onCancel={() => setBookConfirm(null)}
            onConfirm={() => {
              logEvent('booking_confirm', { partner: bookConfirm.partner, kind: bookConfirm.kind, venue: listing.title });
              try { window.open(bookConfirm.url, "_blank", "noopener,noreferrer"); } catch (_) {}
              setBookConfirm(null);
            }}
          />
        )}
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
    const hotelNightly = { skiing: 180, beach: 140 }[sport] || 150;
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
      hotel: { name: { skiing: "Mountain Lodge", beach: "Tropical Paradise" }[sport] || "Resort", nightly: hotelNightly, total: totalHotel },
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
            background: trip.venue.gradient, borderRadius:16, height:180, marginBottom:20,
            backgroundSize:"cover", backgroundPosition:"center", position:"relative",
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
                { id:"beach", label:"Beach" }
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
              width:"100%", padding:12, borderRadius:12, border:`1.5px solid ${startDate ? "#0284c7" : "#e8e8e8"}`, fontSize:13, fontFamily:F, marginBottom:10, color: startDate ? "#0c4a6e" : "#aaa", background: startDate ? "#f0f9ff" : "#fafafa", fontWeight: startDate ? 700 : 400,
            }} />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{
              width:"100%", padding:12, borderRadius:12, border:`1.5px solid ${endDate ? "#0284c7" : "#e8e8e8"}`, fontSize:13, fontFamily:F, marginBottom:14, color: endDate ? "#0c4a6e" : "#aaa", background: endDate ? "#f0f9ff" : "#fafafa", fontWeight: endDate ? 700 : 400,
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
                    height:120, background:trip.venue.gradient, backgroundSize:"cover",
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
    { id: "skiing",  title: "Ski & Snow Guides" },
    { id: "beach", title: "Beach Guides" },
  ];

  const featured = [...listings].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);

  const blurbs = {
    skiing: "Snow conditions, resort breakdowns & budget tips",
    beach: "UV index intel, hidden beaches & sun safety",
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
                height: 130, background: venue.gradient || "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)",
                display: "flex", alignItems: "flex-end", padding: 14, position: "relative", overflow: "hidden",
              }}>
                {venue.photo && <img src={venue.photo} alt={venue.title} loading="lazy" onError={e => { e.target.onerror = null; e.target.src = getVenuePhoto(venue.title, venue.category); }} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />}
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.4) 0%,transparent 60%)" }} />
                <div style={{
                  position: "absolute", top: 10, right: 10,
                  background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
                  borderRadius: 8, padding: "4px 8px",
                  fontSize: 10, fontWeight: 700, color: "#fff", fontFamily: F,
                }}>
                  Guide
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: F }}>{venue.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontFamily: F, marginTop: 2 }}>
                    {venue.location}
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
                    {venue.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#717171", fontFamily: F, marginBottom: 10 }}>
                    {venue.location}
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
// v1: false until VPS has the APNS .p8 — flip to true after setup-apns.sh runs.
// Hides the Alerts tab on native iOS (web/PWA Alerts unaffected). Blocks the
// App Store regression where users see Alerts but push never delivers.
const APNS_LIVE = false;
function BottomNav({ active, setActive, alertCount, showAlerts = true }) {
  const tabs = [
    { id:"explore",   label:"Explore",  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg> },
    ...(showAlerts ? [{ id:"alerts", label:"Alerts", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> }] : []),
    { id:"profile",   label:"Profile",  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];
  return (
    <div style={{
      display:"flex", justifyContent:"space-around", alignItems:"center",
      padding:"4px 8px 18px", background:"#fff",
      borderTop:"1px solid #e8e8e8", flexShrink:0,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)} className="tab-btn" aria-label={t.label} aria-current={active === t.id ? "page" : undefined} style={{
          background: active === t.id ? "#e0f2fe" : "none",
          border:"none",
          display:"flex", flexDirection:"column", alignItems:"center", gap:2,
          color: active === t.id ? "#0284c7" : "#b0b0b0", position:"relative",
          padding:"6px 18px", borderRadius:14, margin:"2px 0",
          transition:"background 0.18s ease",
        }}>
          {t.id === "alerts" && alertCount > 0 && (
            <div style={{
              position:"absolute", top:2, right:6,
              width:8, height:8, background:"#0284c7", borderRadius:"50%",
              border:"1.5px solid white",
            }} />
          )}
          <span style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>{t.icon}</span>
          <span style={{ fontSize:10, fontWeight: active === t.id ? 700 : 600, fontFamily:F }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── error boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, component: null, ts: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error, ts: Date.now() }; }
  componentDidCatch(error, info) {
    const component = info.componentStack?.split("\n")[1]?.trim() || null;
    this.setState({ component });
    if (window.__peaklyReport) window.__peaklyReport(error, { type: "react_crash", component });
  }
  render() {
    if (this.state.hasError) {
      // Surface enough detail that the user can give Jack a useful bug report:
      // timestamp + component + truncated message. Was: blank "something went
      // wrong" with no context, which made bug triage impossible.
      const msg = String(this.state.error?.message || this.state.error || "").slice(0, 240);
      const tsLabel = this.state.ts ? new Date(this.state.ts).toISOString().replace("T", " ").slice(0, 19) + " UTC" : "";
      const copyDetails = () => {
        const payload = `Peakly crash\nTime: ${tsLabel}\nComponent: ${this.state.component || "unknown"}\nMessage: ${msg}\nBuild: ${typeof PEAKLY_BUILD !== "undefined" ? PEAKLY_BUILD : "n/a"}`;
        try { navigator.clipboard?.writeText(payload); } catch {}
      };
      return React.createElement("div", {
        style: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                 minHeight:"100vh", fontFamily:F, padding:32, textAlign:"center", background:"#f5f5f5" }
      },
        React.createElement("div", { style:{ fontSize:28, fontWeight:900, color:"#222", marginBottom:12 } }, "Something went wrong"),
        React.createElement("div", { style:{ fontSize:14, color:"#717171", marginBottom:16, maxWidth:360, lineHeight:1.5 } },
          "Peakly hit an unexpected error. Logged automatically — copy the details below if you want to send Jack a report."),
        React.createElement("div", {
          style:{ background:"#fff", border:"1.5px solid #e8e8e8", borderRadius:12,
                  padding:"12px 14px", marginBottom:18, fontSize:11, color:"#555",
                  fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace",
                  textAlign:"left", maxWidth:360, width:"100%",
                  whiteSpace:"pre-wrap", wordBreak:"break-word", lineHeight:1.5 }
        }, `Time: ${tsLabel}\nComponent: ${this.state.component || "unknown"}\nError: ${msg || "(no message)"}`),
        React.createElement("div", { style:{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" } },
          React.createElement("button", {
            onClick: () => { this.setState({ hasError:false, error:null, component:null, ts:null }); window.location.reload(); },
            style: { background:"#0284c7", color:"white", border:"none", borderRadius:14,
                     padding:"12px 22px", fontSize:13, fontWeight:800, fontFamily:F, cursor:"pointer" }
          }, "Reload App"),
          React.createElement("button", {
            onClick: copyDetails,
            style: { background:"#fff", color:"#0284c7", border:"1.5px solid #0284c7", borderRadius:14,
                     padding:"12px 22px", fontSize:13, fontWeight:800, fontFamily:F, cursor:"pointer" }
          }, "Copy details")
        )
      );
    }
    return this.props.children;
  }
}

// ─── app ──────────────────────────────────────────────────────────────────────
function App() {
  // Cloud sync — single instance lifted to App so Profile + Explore share state
  const cloudSync = useCloudSync();

  // Dismiss the splash screen — minimum 1.5s visible, then 0.9s fade
  useEffect(() => {
    const splash = document.getElementById('splash');
    if (!splash) return;
    // Record when the page started loading (approximated by performance.timing or Date.now)
    const pageStart = window.performance?.timing?.navigationStart || Date.now();
    const elapsed = Date.now() - pageStart;
    const MIN_VISIBLE = 1500; // ms — long enough for the first rotating teaser line to land before the UI replaces the splash
    const remaining = Math.max(0, MIN_VISIBLE - elapsed);
    const t1 = setTimeout(() => {
      splash.classList.add('fade-out');
      const t2 = setTimeout(() => { if (splash.parentNode) splash.parentNode.removeChild(splash); }, 800);
      return () => clearTimeout(t2);
    }, remaining);
    return () => clearTimeout(t1);
  }, []);

  const [activeTab,    setActiveTab]    = useState("explore");
  const [activeCat,    setActiveCat]    = useState(() => {
    let homeAirport = "";
    try { homeAirport = JSON.parse(localStorage.getItem("peakly_profile") || "{}").homeAirport || ""; } catch {}
    return seasonalDefaultCat(homeAirport);
  });
  const [wxData,       setWxData]       = useState({});
  const [marData,      setMarData]      = useState({});
  const [loading,      setLoading]      = useState(true);
  const [duffelPrices, setDuffelPrices] = useState({});
  const [flightsLoading, setFlightsLoading] = useState(true);
  // Default ≤6hr flight: aligns "spontaneous weekend" with realistic flight
  // times. Globe-spanning results from a "this weekend" app defeat the brand
  // promise. Power users override via the chip's × button or Clear all.
  // Default to no filters applied (matches "Clear all" baseline). Users
  // explicitly opt into a max-price / max-flight-hours cap via the search sheet
  // instead of seeing a silently filtered grid on cold load.
  const [filters,      setFilters]      = useState({ sort:"score", maxPrice:2000, maxFlightHrs:null });
  const [showSearch,     setShowSearch]     = useState(false);
  const [showVibeSearch, setShowVibeSearch] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAirportSetup, setShowAirportSetup] = useState(false);
  const [detailVenue,    setDetailVenue]    = useState(null);
  const [wxLastUpdated,  setWxLastUpdated]  = useState(null);
  const [sharedListView, setSharedListView] = useState(null); // snapshot from ?l=<slug>
  const [importToast,    setImportToast]    = useState("");
  // Single conversion modal surfaced from every save/alert action when the user
  // isn't signed in. `null` = closed; `{intent: "save"|"alert"}` = open.
  const [accountModal,   setAccountModal]   = useState(null);

  const [wishlists,    setWishlists]    = useLocalStorage("peakly_wishlists", []);
  // Derived flat array of saved venue IDs — handles both legacy flat array and new [{name,venues}] format
  const wishlistIds = React.useMemo(() => {
    if (!wishlists.length) return [];
    if (typeof wishlists[0] === 'string') return wishlists; // legacy migration
    return wishlists.find(l => l.name === 'Favorites')?.venues || [];
  }, [wishlists]);
  const [namedLists,   setNamedLists]   = useLocalStorage("peakly_named_lists", []);
  const [userAlerts, setUserAlerts] = useLocalStorage("peakly_alerts", []);
  const [savedTrips, setSavedTrips] = useLocalStorage("peakly_trips", []);
  const [profile,    setProfile]    = useLocalStorage("peakly_profile", {
    name:"", email:"", homeAirport:"", homeAirport2:"", homeAirports:[], sports:[], skillLevels:{},
    skill:"Intermediate", hasAccount:false,
    notifyPeak:true, notifyDeal:true, notifyWeekly:false,
  });

  // Auto-show onboarding for first-time visitors (slight delay so Explore tab renders first)
  useEffect(() => {
    if (!profile.hasAccount) {
      const t = setTimeout(() => setShowOnboarding(true), 900);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Push notification registration (Capacitor native + web SW fallback) ─────
  useEffect(() => {
    if (window.Capacitor?.isNativePlatform()) {
      // Native (iOS/Android via Capacitor) — request permission and register for push
      (async () => {
        try {
          const { PushNotifications } = await window.Capacitor.Plugins;
          const permResult = await PushNotifications.requestPermissions();
          if (permResult.receive !== "granted") return;

          await PushNotifications.register();

          PushNotifications.addListener("registration", (token) => {
            try { localStorage.setItem("peakly_push_token", token.value); } catch {}
          });

          PushNotifications.addListener("pushNotificationReceived", (notification) => {
            // Foreground notification — surface an in-app banner (optional future enhancement)
            console.log("[Peakly] Push received (foreground):", notification.title);
          });

          PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
            // User tapped a notification — deep-link to venue if provided
            const venueId = action.notification.data?.venueId;
            if (venueId) {
              // Navigate to the venue detail via URL so the app can pick it up on render
              try { history.replaceState(null, "", `${window.location.pathname}?venue=${venueId}`); } catch {}
            }
          });
        } catch (err) {
          console.warn("[Peakly] Capacitor push registration failed:", err);
        }
      })();
    } else if ("serviceWorker" in navigator && "PushManager" in window) {
      // Web — register service worker for web push (VAPID keys needed server-side to actually send)
      navigator.serviceWorker.register("/peakly/sw.js").then((reg) => {
        // Token will be obtained when backend calls pushManager.subscribe() with VAPID public key
        try { localStorage.setItem("peakly_push_token", "web-sw-registered"); } catch {}
      }).catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Hide the Alerts tab on native iOS until APNS is live (see APNS_LIVE
  // constant above BottomNav). Web — including iOS Safari PWA — stays visible.
  // Android Capacitor builds aren't gated; FCM ships separately.
  const showAlertsTab = window.Capacitor?.getPlatform?.() !== "ios" || APNS_LIVE;
  // Snap stranded users back to Explore if the tab they're on disappears.
  useEffect(() => {
    if (!showAlertsTab && activeTab === "alerts") setActiveTab("explore");
  }, [showAlertsTab, activeTab]);

  // Auto-detect nearest airport for new users who haven't set one yet
  useEffect(() => {
    if (profile.homeAirport) return; // already set by user
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        const code = findNearestAirport(pos.coords.latitude, pos.coords.longitude);
        if (code) {
          setProfile(p => ({ ...p, homeAirport: code, homeAirports: [...new Set([code, ...(p.homeAirports || [])])] }));
        }
      },
      () => {}, // silent fail — user denied or unavailable
      { timeout: 2000, maximumAge: 300000 }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Init search with user's saved home airport (reads localStorage directly before profile state is set)
  const [search, setSearch] = useState(() => ({
    activities: [], destination: "", when: "anytime", continent: "", skiPass: "",
    fromAirport: (() => {
      try {
        const p = JSON.parse(localStorage.getItem("peakly_profile") || "{}");
        const airports = p.homeAirports?.length ? p.homeAirports : (p.homeAirport ? [p.homeAirport] : []);
        return airports[0] || "";
      } catch { return "JFK"; }
    })(),
    fromAirport2: (() => {
      try {
        const p = JSON.parse(localStorage.getItem("peakly_profile") || "{}");
        return p.homeAirport2 || "";
      } catch { return ""; }
    })(),
  }));

  // Fetch weather in batches to avoid API rate limits
  // First batch (50) loads immediately for visible venues, rest load in background
  // Smart weather fetching: only fetch for top 100 venues on load,
  // lazy-fetch individual venues when detail sheet opens.
  // This keeps API calls ~150/load (not 2,800) and fits in localStorage.
  const wxRef = useRef({});
  const marRef = useRef({});

  const fetchVenueWeather = useCallback(async (venue) => {
    if (wxRef.current[venue.id]) return; // already fetched
    const needsMarine = venue.category === "beach";
    const [wxR, marR] = await Promise.allSettled([
      fetchWeather(venue.lat, venue.lon),
      needsMarine ? fetchMarine(venue.lat, venue.lon) : Promise.resolve(null),
    ]);
    const wxVal = wxR.status === "fulfilled" ? wxR.value : null;
    const marVal = marR.status === "fulfilled" ? marR.value : null;
    wxRef.current[venue.id] = wxVal;
    marRef.current[venue.id] = marVal;
    setWxData(prev => ({...prev, [venue.id]: wxVal}));
    setMarData(prev => ({...prev, [venue.id]: marVal}));
  }, []);

  const fetchInitialWeather = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    // Priority tier — top 200 venues cover hero + carousel + first-grid view.
    // VPS /api/weather has a shared 2hr cache so simultaneous coord dedup
    // absorbs the larger batch. Open-Meteo free tier is 10K calls/day; even
    // at 1000 venues every 10 minutes that's 144K/day theoretical, but the
    // 2hr proxy cache means real upstream traffic is ~12 cold + 0 warm per
    // hour. Plenty of headroom.
    const BATCH_SIZE = 100;
    const THROTTLE_MS = 500;
    const PRIORITY_COUNT = Math.min(200, VENUES.length);
    const priority  = VENUES.slice(0, PRIORITY_COUNT);
    const remaining = VENUES.slice(PRIORITY_COUNT);

    const runBatch = async (batchSlice) => {
      const results = await Promise.allSettled(
        batchSlice.map(async v => {
          const needsMarine = v.category === "beach";
          const [wxR, marR] = await Promise.allSettled([
            fetchWeather(v.lat, v.lon),
            needsMarine ? fetchMarine(v.lat, v.lon) : Promise.resolve(null),
          ]);
          return { id: v.id, wx: wxR.status === "fulfilled" ? wxR.value : null, marine: marR.status === "fulfilled" ? marR.value : null };
        })
      );
      results.forEach(r => {
        if (r.status === "fulfilled") {
          wxRef.current[r.value.id] = r.value.wx;
          marRef.current[r.value.id] = r.value.marine;
        }
      });
    };

    // ── Priority tier (blocks loading state) ──
    for (let i = 0; i < priority.length; i += BATCH_SIZE) {
      await runBatch(priority.slice(i, i + BATCH_SIZE));
      if (i === 0) {
        setWxData({...wxRef.current});
        setMarData({...marRef.current});
        setLoading(false);
        setWxLastUpdated(new Date());
      }
      if (i + BATCH_SIZE < priority.length) {
        await new Promise(res => setTimeout(res, THROTTLE_MS));
      }
    }
    setWxData({...wxRef.current});
    setMarData({...marRef.current});
    setWxLastUpdated(new Date());

    // ── Background tail (non-blocking) ──
    // Fire-and-forget; user already sees Explore. State setter hydrates the
    // remaining cards as their data arrives — they re-render from `~$X` to `$X`
    // and shimmer-to-real-score in place. Throttled identically to priority.
    if (remaining.length > 0) {
      (async () => {
        for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
          await runBatch(remaining.slice(i, i + BATCH_SIZE));
          setWxData({...wxRef.current});
          setMarData({...marRef.current});
          if (i + BATCH_SIZE < remaining.length) {
            await new Promise(res => setTimeout(res, THROTTLE_MS));
          }
        }
        setWxLastUpdated(new Date());
      })();
    }
  }, []);

  useEffect(() => {
    fetchInitialWeather(false);
    const interval = setInterval(() => fetchInitialWeather(true), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchInitialWeather]);

  // Fetch real Travelpayouts prices after weather loads (re-fetches when home airport changes)
  // Optimized: deduplicate airport codes → only ~15 API calls instead of 250+
  // Priority: top 10 airports by weather score fetched first for fast hero/carousel load
  useEffect(() => {
    if (loading) return;
    let alive = true;
    setFlightsLoading(true);
    (async () => {
      // 1. Build a map of unique airport codes → venue IDs that use them
      const apToVenues = {};
      VENUES.forEach(v => {
        if (!apToVenues[v.ap]) apToVenues[v.ap] = [];
        apToVenues[v.ap].push(v.id);
      });
      const uniqueAirports = Object.keys(apToVenues);

      // 2. Rank airports by best venue weather score so most visible cards load first
      const scoredAirports = uniqueAirports.map(ap => {
        const venueIds = apToVenues[ap];
        const maxScore = Math.max(...venueIds.map(vid => {
          const v = VENUES.find(x => x.id === vid);
          return v ? scoreVenue(v, wxData[v.id], marData[v.id], 0).score : 0;
        }));
        return { ap, score: maxScore };
      }).sort((a, b) => b.score - a.score);

      const priorityAps = scoredAirports.slice(0, 10).map(x => x.ap);
      const remainingAps = scoredAirports.slice(10).map(x => x.ap);

      // 3. Fetch prices only for unique airports, batched in groups of 3
      // (semaphore in fetchTravelpayoutsPrice caps concurrent requests at 3)
      // If two home airports are set, fetch both and use the cheaper price.
      // Pass upcoming Fri's date so proxy filters month-matrix to that exact
      // depart instead of returning whatever month-cheapest fare it happens
      // to have (which could be a random Tuesday red-eye 3 weeks out).
      const apPrices = {}; // airport code → { price, foundAt, departDate, returnDate }
      const origins = [profile.homeAirport || "JFK"];
      if (profile.homeAirport2) origins.push(profile.homeAirport2);
      const departDate = upcomingFridayISO(new Date());

      const fetchBatch = async (airports) => {
        for (let i = 0; i < airports.length; i += 3) {
          if (!alive) return;
          const batch = airports.slice(i, i + 3);
          const results = await Promise.allSettled(
            batch.flatMap(ap =>
              origins.map(async origin => {
                const result = await fetchTravelpayoutsPrice(origin, ap, departDate);
                return { ap, result };
              })
            )
          );
          if (!alive) return;
          results.forEach(r => {
            if (r.status === "fulfilled" && r.value.result !== null) {
              const { ap, result } = r.value;
              if (apPrices[ap] == null || result.price < apPrices[ap].price) apPrices[ap] = result;
            }
          });
          if (i + 3 < airports.length) await new Promise(r => setTimeout(r, 400));
        }
      };

      // 4. Fetch priority airports first — hero + carousel populate fast
      await fetchBatch(priorityAps);
      if (!alive) return;

      // Publish priority prices immediately so visible cards snap in
      const priorityPrices = {};
      Object.entries(apPrices).forEach(([ap, data]) => {
        apToVenues[ap].forEach(venueId => { priorityPrices[venueId] = data; });
      });
      if (Object.keys(priorityPrices).length > 0) setDuffelPrices({ ...priorityPrices });
      setFlightsLoading(false);

      // 5. Fetch remaining airports in background
      await fetchBatch(remainingAps);
      if (!alive) return;

      // 6. Publish full price set
      const prices = {};
      Object.entries(apPrices).forEach(([ap, data]) => {
        apToVenues[ap].forEach(venueId => { prices[venueId] = data; });
      });
      if (alive && Object.keys(prices).length > 0) setDuffelPrices(prices);
    })();
    return () => { alive = false; };
  }, [loading, profile.homeAirport, profile.homeAirport2]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute day offset from selected start date (0=today, 1=tomorrow, etc.)
  const scoreDayIndex = 0;

  // Enrich venues with live scores + flight prices. Memoized so that random
  // App-level state changes (search input keystrokes, modal open/close) don't
  // recompute scoreVenue O(n) times. Recomputes only when an actual input
  // changes — weather lands, prices land, home airport changes.
  const listings = React.useMemo(() => VENUES.map(v => {
    const { score, label, period } = scoreVenue(v, wxData[v.id], marData[v.id], scoreDayIndex);
    const estimate1  = getFlightDeal(v.ap, profile.homeAirport || "JFK");
    const estimate2  = profile.homeAirport2 ? getFlightDeal(v.ap, profile.homeAirport2 || "JFK") : null;
    const estimate   = estimate2 && estimate2.price < estimate1.price ? estimate2 : estimate1;
    const duffelData = duffelPrices[v.id];
    // A "live" fare we last saw >14 days ago is no longer a real-time signal —
    // the carrier has almost certainly repriced. scoreWeekendDeal already nulls
    // the deal score for these (~app.jsx:1531); demote the flight object too so
    // every card surface (hero, ListingCard, CompactCard, FeaturedCard, deal
    // carousel filter) treats it as an estimate and renders ~$X / no LIVE pill.
    const duffelStale = duffelData?.foundAt
      && (Date.now() - new Date(duffelData.foundAt).getTime()) > 14 * 24 * 3600 * 1000;
    const flight     = duffelData != null && !duffelStale
      ? {
          price:   duffelData.price,
          normal:  estimate.normal,
          pct:     Math.max(0, Math.round((1 - duffelData.price / estimate.normal) * 100)),
          from:    profile.homeAirport || "JFK",
          live:    true,
          foundAt: duffelData.foundAt || null,
          depDate: duffelData.departDate || null,
          retDate: duffelData.returnDate || null,
        }
      : { ...estimate, from: estimate.from || profile.homeAirport || "JFK", live: false, foundAt: null, depDate: null, retDate: null };
    // Find best window in the 7-day forecast
    let bestDay = 0, bestScore = score;
    const vWx = wxData[v.id], vMar = marData[v.id];
    if (vWx?.daily) {
      for (let di = 0; di < 7; di++) {
        const ds = scoreVenue(v, vWx, vMar, di).score;
        if (ds > bestScore) { bestScore = ds; bestDay = di; }
      }
    }
    const dayNames = ["Today","Tomorrow"];
    for (let i = 2; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      dayNames.push(d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}));
    }
    const bestWindow = bestDay === 0 && bestScore === score ? null : { day: dayNames[bestDay] || ("Day " + bestDay), score: bestScore };

    // Front-page weekend window score (Fri–Mon, best 2 consecutive days).
    // conditionScore stays for the detail-sheet 7-day view.
    // scoreWeekendDeal fuses weekend conditions + flight pricing into one
    // 0–100 deal score (live flights only; null when estimate or low confidence).
    const deal = scoreWeekendDeal(v, vWx, vMar, new Date(), profile.homeAirport || "JFK", flight);
    const wknd = deal.conditions;

    const uv = wxData[v.id]?.daily?.uv_index_max?.[scoreDayIndex] ?? null;
    return {
      ...v,
      conditionScore: score, conditionLabel: label, period, flight, bestWindow, flightsLoading, uv,
      weekendScore: wknd.score,
      weekendLabel: wknd.label,
      weekendPeriod: wknd.period,
      weekendDays: wknd.days,
      weekendConfidence: wknd.confidence,
      weekendLo: wknd.lo,
      weekendHi: wknd.hi,
      weekendHalfWidth: wknd.halfWidth,
      weekendHeadline: wknd.headlineDay,
      weekendConsistency: wknd.consistency,
      dealScore:      deal.score,
      dealLabel:      deal.label,
      dealPriceRatio: deal.priceRatio,
      dealIsEstimate: deal.isEstimate,
    };
  }), [wxData, marData, duffelPrices, profile.homeAirport, profile.homeAirport2, scoreDayIndex, flightsLoading]);

  const firingCount = React.useMemo(() => listings.filter(l => l.conditionScore >= 90).length, [listings]);

  const toggleWishlist = useCallback(id => {
    // Saves require a signed-in account. Unsigned users get the central
    // AccountModal — no tab bounce, no secondary prompts.
    if (!cloudSync?.user) {
      setAccountModal({ intent: "save" });
      return;
    }
    const isCurrentlySaved = wishlistIds.includes(id);
    if (!isCurrentlySaved) {
      const venue = VENUES.find(v => v.id === id);
      window.plausible && window.plausible('Wishlist Add', {props: {venue: venue?.title || id}});
    }
    // Store as [{name:"Favorites", venues:[...]}]; migrate legacy flat array on first write
    setWishlists(lists => {
      if (lists.length > 0 && typeof lists[0] === 'string') {
        // Migrate legacy flat array
        const migrated = isCurrentlySaved ? lists.filter(x => x !== id) : [...lists, id];
        return [{ name: 'Favorites', venues: migrated }];
      }
      const favIdx = lists.findIndex(l => l.name === 'Favorites');
      if (!isCurrentlySaved) {
        if (favIdx === -1) return [{ name: 'Favorites', venues: [id] }];
        return lists.map((l, i) => i === favIdx ? { ...l, venues: [...(l.venues || []), id] } : l);
      } else {
        if (favIdx === -1) return lists;
        return lists.map((l, i) => i === favIdx ? { ...l, venues: (l.venues || []).filter(x => x !== id) } : l);
      }
    });
    // Keep namedLists in sync for WishlistsTab — find or create "Favorites" specifically
    setNamedLists(lists => {
      if (!isCurrentlySaved) {
        // Adding — find or create the "Favorites" list specifically (prepend so it appears first)
        const favIdx = lists.findIndex(l => l.id === "favorites" || l.name === "Favorites");
        if (favIdx === -1) {
          return [{ id:"favorites", name:"Favorites", emoji:"❤️", venueIds:[id] }, ...lists];
        }
        const fav = lists[favIdx];
        if ((fav.venueIds||[]).includes(id)) return lists;
        return lists.map((l, i) => i === favIdx ? { ...l, venueIds: [...(l.venueIds||[]), id] } : l);
      } else {
        return lists.map(l => ({ ...l, venueIds: (l.venueIds||[]).filter(x => x !== id) }));
      }
    });
  }, [wishlistIds, setWishlists, setNamedLists, cloudSync]);

  // Set of venueIds that have an active alert — drives the 🔔 badge on cards
  const alertedVenueIds = React.useMemo(
    () => new Set(userAlerts.filter(a => a.venueId).map(a => a.venueId)),
    [userAlerts]
  );

  // One-tap alert toggle from a venue card. Defaults: targetScore 90 (great
  // conditions) + maxPrice 500 (lenient). Users who want finer control still
  // have the full Alerts tab. Mirrors to the server polling worker so push
  // can fire when conditions hit.
  const quickToggleAlert = useCallback(listing => {
    // Alerts require an account — push delivery is impossible without one.
    // Show the central modal instead of silently saving to localStorage.
    if (!cloudSync?.user) {
      setAccountModal({ intent: "alert" });
      return;
    }
    const existing = userAlerts.find(a => a.venueId === listing.id);
    if (existing) {
      setUserAlerts(p => p.filter(a => a.id !== existing.id));
      fetch(`${FLIGHT_PROXY}/api/alerts/${encodeURIComponent(String(existing.id))}`,
        { method: "DELETE" }).catch(() => {});
      logEvent("alert_quick_remove", { venue: listing.title });
      return;
    }
    const id = Date.now();
    const data = {
      id, venueId: listing.id,
      sport: listing.category,
      condition: "great",
      locations: [listing.id],
      targetScore: 90,
      priceMax: 500,
      maxPrice: 500,
      enabled: true,
    };
    setUserAlerts(p => [...p, data]);
    let pushToken = null, pushPlatform = null;
    try { pushToken = localStorage.getItem("peakly_push_token") || null; } catch {}
    if (pushToken && pushToken !== "web-sw-registered") {
      pushPlatform = window.Capacitor?.platform === "ios" ? "ios"
                   : window.Capacitor?.isNativePlatform?.() ? "capacitor"
                   : "web";
    }
    fetch(`${FLIGHT_PROXY}/api/alerts`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alertId: String(id),
        venueId: listing.id,
        venueLat: listing.lat ?? null,
        venueLon: listing.lon ?? null,
        venueAp: listing.ap ?? null,
        venueCategory: listing.category,
        sport: listing.category,
        targetScore: 90,
        maxPrice: 500,
        pushToken, pushPlatform,
        homeAirport: profile?.homeAirport || null,
      }),
    }).catch(() => {});
    haptic("medium");
    window.plausible && window.plausible('Alert Quick Add', { props: { venue: listing.title } });
    logEvent("alert_quick_add", { venue: listing.title, score: listing.conditionScore });
  }, [userAlerts, setUserAlerts, profile?.homeAirport]);

  const openDetail = useCallback(listing => {
    setDetailVenue(listing);
    // Lazy-fetch weather for this venue if not already loaded
    const v = VENUES.find(ven => ven.id === listing.id);
    if (v) fetchVenueWeather(v);
    // Update URL hash for deep linking / sharing
    try { history.replaceState(null, "", `${window.location.pathname}${window.location.search}#venue-${listing.id}`); } catch {}
    logEvent('venue_open', { venue: listing.title, category: listing.category });
  }, [fetchVenueWeather]);

  // Handle URL hash venue deep links (e.g. #venue-whistler-blackcomb)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#venue-")) {
        const id = hash.replace("#venue-", "");
        const found = VENUES.find(v => v.id === id);
        if (found) {
          const enriched = listings.find(l => l.id === id) || found;
          setDetailVenue(enriched);
          // Keep hash in URL — openDetail / onClose manage it
        }
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle shared-list deep link (?l=<slug>&r=<owner_id>)
  // Runs ONCE on mount: fetches snapshot, opens SharedListView, suppresses
  // onboarding so the recipient lands directly on the curated list.
  // Gated on CLOUD_SHARE_ENABLED — without the shared_lists table the fetch
  // 404s and the recipient sees a blank app load. Strip the params either way.
  useEffect(() => {
    if (!CLOUD_SHARE_ENABLED) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get("l");
      const ref  = params.get("r");
      if (slug) {
        // Suppress the auto-onboarding so recipient sees the list, not the welcome flow
        setShowOnboarding(false);
        fetchSharedList(slug).then(snap => {
          if (snap) {
            setSharedListView(snap);
            logEvent("shared_list_open", { slug, has_referrer: !!ref });
          } else {
            // Bad/expired slug — strip the params so user gets normal app
            try { history.replaceState(null, "", window.location.pathname); } catch {}
          }
        });
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Import a shared snapshot into the user's namedLists. Called from
  // SharedListView's CTA when already signed in, or from the post-magic-link
  // effect below when the recipient signs in for the first time.
  const importSharedSnapshot = useCallback((snap) => {
    if (!snap || !snap.venueIds && !snap.venue_ids) return;
    const venueIds = snap.venueIds || snap.venue_ids || [];
    const importedName = `From a friend: ${snap.name}`;
    setNamedLists(ls => {
      // Idempotent — don't double-import the same slug
      const slugMatch = snap.slug && ls.find(l => l._sharedFromSlug === snap.slug);
      if (slugMatch) return ls;
      return [
        ...ls,
        {
          id: Date.now().toString(),
          name: importedName,
          emoji: snap.emoji || "🗺️",
          venueIds: [...venueIds],
          _sharedFromSlug: snap.slug || null,
          _sharedFromOwner: snap.owner_id || null,
        },
      ];
    });
    // Referral attribution — write to profile, only if not already attributed
    const referredBy = snap.referredBy || snap.owner_id;
    if (referredBy) {
      setProfile(p => p?.referred_by ? p : { ...p, referred_by: referredBy });
    }
    // Clear pending + URL params; close shared view; show toast
    try { localStorage.removeItem("peakly_pending_share_import"); } catch {}
    try { history.replaceState(null, "", window.location.pathname); } catch {}
    setSharedListView(null);
    setImportToast(`Saved "${snap.name}" to your lists ✓`);
    setTimeout(() => setImportToast(""), 3500);
    logEvent("shared_list_imported", { slug: snap.slug, venue_count: venueIds.length });
  }, [setNamedLists, setProfile]);

  // After magic-link auth completes, finish a pending share import.
  // Triggers when cloudSync.user flips from null to a real user object.
  useEffect(() => {
    if (!cloudSync?.user) return;
    let pending = null;
    try {
      const raw = localStorage.getItem("peakly_pending_share_import");
      if (raw) pending = JSON.parse(raw);
    } catch {}
    if (!pending) return;
    // Apply only if recently stashed (24h max — defensive against stale entries)
    if (pending.ts && Date.now() - pending.ts > 24 * 60 * 60 * 1000) {
      try { localStorage.removeItem("peakly_pending_share_import"); } catch {}
      return;
    }
    importSharedSnapshot(pending);
  }, [cloudSync?.user, importSharedSnapshot]);

  // Shared-list takeover: recipient lands here from a ?l=<slug> link.
  // Suppresses the normal app shell so the recipient sees ONLY the curated
  // list and the "Save to your Peakly" CTA — no nav, no tabs, no onboarding.
  if (sharedListView) {
    return (
      <div style={{
        width:"100%", minHeight:"100vh", background:"#f5f5f5",
        display:"flex", justifyContent:"center", fontFamily:F,
      }}>
        <div style={{
          width:430, height:"100vh", maxHeight:"100vh", background:"#fff",
          display:"flex", flexDirection:"column", position:"relative", overflow:"hidden",
        }}>
          <SharedListView
            snapshot={sharedListView}
            listings={listings}
            cloudSync={cloudSync}
            onImported={importSharedSnapshot}
            onClose={() => {
              try { history.replaceState(null, "", window.location.pathname); } catch {}
              setSharedListView(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width:"100%", minHeight:"100vh", background:"#f5f5f5",
      display:"flex", justifyContent:"center", fontFamily:F,
    }}>
      <div style={{
        width:430, height:"100vh", maxHeight:"100vh", background:"#fff",
        display:"flex", flexDirection:"column", position:"relative", overflow:"hidden",
      }}>
        {/* Toast — appears after a friend's list is imported via magic link */}
        {importToast && (
          <div className="bounce-in" style={{
            position:"absolute", top:14, left:"50%", transform:"translateX(-50%)",
            background:"#222", color:"#fff", padding:"10px 16px", borderRadius:14,
            fontSize:13, fontWeight:800, fontFamily:F, zIndex:99,
            boxShadow:"0 4px 22px rgba(0,0,0,0.25)", maxWidth:"calc(100% - 28px)",
          }}>{importToast}</div>
        )}
        {/* Top header — hidden on map tab so map fills screen edge-to-edge.
            Explore: wordmark + search bar on a SINGLE row so the first
            carousel sits right under the spotlight instead of below the fold. */}
        {activeTab !== "map" && (
          activeTab === "explore" ? (
            <div style={{ background:"#fff", flexShrink:0 }}>
              <div style={{ padding:"48px 16px 12px", display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:22, fontWeight:900, color:"#0284c7", letterSpacing:"-0.6px", fontFamily:F, lineHeight:1, flexShrink:0 }}>
                  peakly
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <SearchBar search={search} onOpen={() => setShowSearch(true)} compact />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding:"52px 20px 14px", background:"#fff", display:"flex", alignItems:"center", flexShrink:0 }}>
              <span style={{ fontSize:22, fontWeight:900, color:"#0284c7", letterSpacing:"-0.6px", fontFamily:F, lineHeight:1 }}>
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
              wishlists={wishlistIds} onToggle={toggleWishlist}
              alertedIds={alertedVenueIds} onAlertToggle={quickToggleAlert}
              onViewAlerts={showAlertsTab ? () => setActiveTab("alerts") : undefined}
              onViewProfile={() => setActiveTab("profile")}
              activeCat={activeCat} setActiveCat={setActiveCat}
              filters={filters} setFilters={setFilters} search={search} setSearch={setSearch}
              onOpenDetail={openDetail}
              namedLists={namedLists} setNamedLists={setNamedLists}
              wxLastUpdated={wxLastUpdated} profile={profile}
              onRefresh={() => fetchAllWeather(false)}
              cloudSync={cloudSync}
            />
          )}
          {activeTab === "alerts" && (
            <AlertsTab
              listings={listings} userAlerts={userAlerts}
              setUserAlerts={setUserAlerts} profile={profile}
              onShowOnboarding={() => setShowOnboarding(true)}
              cloudSync={cloudSync}
              requireAccount={() => { setAccountModal({ intent: "alert" }); }}
            />
          )}
          {activeTab === "profile" && (
            <ProfileTab
              profile={profile} setProfile={setProfile}
              onShowOnboarding={() => setShowOnboarding(true)}
              cloudSync={cloudSync}
              openAccountModal={(opts) => setAccountModal(opts || { intent: "alert" })}
              listings={listings} wishlists={wishlistIds}
              onToggle={toggleWishlist} onOpenDetail={openDetail}
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
              setProfile(p => ({ ...p, homeAirport: s.fromAirport, homeAirport2: s.fromAirport2 || "" }));
            }}
            onClose={() => setShowSearch(false)}
            listings={listings}
            wishlists={wishlistIds}
            onToggle={toggleWishlist}
            onOpenDetail={(l) => { setShowSearch(false); openDetail(l); }}
          />
        )}

        {showVibeSearch && (
          <VibeSearchSheet
            listings={listings}
            wishlists={wishlistIds}
            onToggle={toggleWishlist}
            onOpenDetail={(v) => { setShowVibeSearch(false); openDetail(v); }}
            onClose={() => setShowVibeSearch(false)}
          />
        )}

        {/* Central account-conversion modal — every save/alert tap from an
            unsigned user routes here. Sized to its own content, not full-height. */}
        <AccountModal
          open={!!accountModal}
          intent={accountModal?.intent}
          cloudSync={cloudSync}
          profile={profile}
          setProfile={setProfile}
          onClose={() => setAccountModal(null)}
        />

        {showOnboarding && (
          <OnboardingSheet
            profile={profile}
            setProfile={setProfile}
            cloudSync={cloudSync}
            setImportToast={setImportToast}
            onClose={() => {
              setShowOnboarding(false);
              // Show airport setup modal after onboarding if not already done
              try {
                if (!localStorage.getItem("peakly_airport_setup_done")) {
                  setTimeout(() => setShowAirportSetup(true), 350);
                }
              } catch {}
            }}
          />
        )}

        {showAirportSetup && (
          <AccountSetupModal
            profile={profile}
            setProfile={setProfile}
            onClose={() => setShowAirportSetup(false)}
            fetchInitialWeather={fetchInitialWeather}
          />
        )}

        {detailVenue && (
          <VenueDetailSheet
            listing={detailVenue}
            rawWx={wxData[detailVenue.id]}
            rawMar={marData[detailVenue.id]}
            wishlists={wishlistIds}
            onToggle={toggleWishlist}
            onClose={() => { setDetailVenue(null); try { history.replaceState(null, "", window.location.pathname + window.location.search); } catch {} }}
            namedLists={namedLists}
            setNamedLists={setNamedLists}
            listings={listings}
            onOpenDetail={openDetail}
            filters={filters}
            search={search}
            onAlert={showAlertsTab ? (venue) => {
              setDetailVenue(null);
              try { history.replaceState(null, "", window.location.pathname + window.location.search); } catch {}
              // Account-gated: route through the modal first, otherwise into Alerts tab
              if (!cloudSync?.user) setAccountModal({ intent: "alert" });
              else setActiveTab("alerts");
            } : undefined}
          />
        )}

        <BottomNav active={activeTab} setActive={(tab) => { setActiveTab(tab); window.plausible && window.plausible('Tab Switch', {props: {tab}}); }} alertCount={firingCount} showAlerts={showAlertsTab} />
      </div>
    </div>
  );
}


// Mount the app with error boundary
const _root = ReactDOM.createRoot(document.getElementById("root"));
_root.render(React.createElement(ErrorBoundary, null, React.createElement(App)));