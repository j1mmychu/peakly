// Build the self-contained iOS web bundle in dist/.
// Pre-transpiles app.jsx, vendors all third-party JS/CSS locally, and rewrites
// index.html to reference only local files — no CDNs reachable from device,
// no Babel runtime, no Sentry/Plausible/Google Fonts. App Store guideline 2.5.2
// requires the app to function offline.
//
// Vendor downloads are cached at .vendor-cache/ so rebuilds are fast and
// reproducible offline once the cache exists.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const VENDOR = path.join(DIST, "vendor");
const CACHE = path.join(ROOT, ".vendor-cache");

const SUPABASE_VER = "2.106.2";
const REACT_VER = "18.3.1";
const LEAFLET_VER = "1.9.4";

const VENDOR_FILES = [
  { url: `https://unpkg.com/react@${REACT_VER}/umd/react.production.min.js`, name: "react.production.min.js" },
  { url: `https://unpkg.com/react-dom@${REACT_VER}/umd/react-dom.production.min.js`, name: "react-dom.production.min.js" },
  { url: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@${SUPABASE_VER}/dist/umd/supabase.min.js`, name: "supabase.min.js" },
  { url: `https://unpkg.com/leaflet@${LEAFLET_VER}/dist/leaflet.css`, name: "leaflet.css" },
  { url: `https://unpkg.com/leaflet@${LEAFLET_VER}/dist/leaflet.js`, name: "leaflet.js" },
];

// Leaflet's CSS resolves relative paths to images/ — vendor those too.
const LEAFLET_IMAGES = ["marker-icon.png", "marker-icon-2x.png", "marker-shadow.png", "layers.png", "layers-2x.png"];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) return resolve(dest);
    const file = fs.createWriteStream(dest);
    const req = https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`${url} → HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on("finish", () => file.close(() => resolve(dest)));
    });
    req.on("error", (err) => { try { fs.unlinkSync(dest); } catch {} reject(err); });
  });
}

async function main() {
  // Clean + scaffold
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(path.join(VENDOR, "images"), { recursive: true });
  fs.mkdirSync(CACHE, { recursive: true });

  // 1. Copy non-JSX static files. privacy.html / terms.html intentionally
  // omitted — App Store metadata references them via the public web URL, so
  // they don't need to live inside the iOS bundle (and they pull Google Fonts
  // from a CDN, which would fail offline).
  const staticFiles = ["sw.js", "manifest.json", "robots.txt", "sitemap.xml"];
  for (const f of staticFiles) {
    fs.copyFileSync(path.join(ROOT, f), path.join(DIST, f));
  }

  // 2. Pre-transpile app.jsx → dist/app.js (no Babel runtime on device).
  // Also redirect the runtime Supabase lazy-loader URL to the local vendored
  // copy — the vendored <script> preloads supabase so the lazy path is dead
  // code on iOS, but rewriting kills the CDN string from the bundle.
  const babel = (await import("@babel/standalone")).default;
  const src = fs.readFileSync(path.join(ROOT, "app.jsx"), "utf8");
  let transpiled = babel.transform(src, {
    presets: ["react"],
    filename: "app.jsx",
    compact: false,
  }).code;
  transpiled = transpiled.replace(
    /https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@[\d.]+\/dist\/umd\/supabase\.min\.js/g,
    "./vendor/supabase.min.js",
  );
  // Strip the Google Fonts @import line from the injected stylesheet — system
  // fonts (San Francisco on iOS) handle the fallback. Keeping it would leave
  // an offline fetch that delays initial paint by ~3s.
  transpiled = transpiled.replace(
    /\s*@import\s+url\(['"]https:\/\/fonts\.googleapis\.com\/[^'"]+['"]\)\s*;?/g,
    "",
  );
  fs.writeFileSync(path.join(DIST, "app.js"), transpiled);

  // 3. Vendor third-party files (curl-equivalent, cached)
  for (const v of VENDOR_FILES) {
    const cached = path.join(CACHE, v.name);
    await download(v.url, cached);
    fs.copyFileSync(cached, path.join(VENDOR, v.name));
  }
  for (const img of LEAFLET_IMAGES) {
    const url = `https://unpkg.com/leaflet@${LEAFLET_VER}/dist/images/${img}`;
    const cached = path.join(CACHE, img);
    await download(url, cached);
    fs.copyFileSync(cached, path.join(VENDOR, "images", img));
  }

  // 4. Generate dist/index.html — strip remote refs, rewrite to local paths.
  let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

  const dropLines = [
    // Google Fonts preconnects + stylesheet
    /^\s*<link rel="preconnect"[^>]*fonts\.(googleapis|gstatic)\.com[^>]*\/?>\s*\n/gm,
    /^\s*<link[^>]+fonts\.googleapis\.com[^>]*\/?>\s*\n/gm,
    // Plausible
    /^\s*<script[^>]+plausible\.io[^>]*><\/script>\s*\n/gm,
    // Sentry — fails to load offline; in-app try/typeof Sentry guards make it a no-op
    /^\s*<script[^>]+sentry-cdn[^>]*><\/script>\s*\n/gm,
    // Babel preload + script
    /^\s*<link[^>]+@babel\/standalone[^>]*\/?>\s*\n/gm,
    /^\s*<script[^>]+@babel\/standalone[^>]*><\/script>\s*\n/gm,
    // Stray HTML comments left dangling after removals (keeps the file tidy)
    /^\s*<!--\s*(Analytics: Plausible|Sentry Error Monitoring|Babel standalone[^>]*)-->\s*\n/gm,
    /^\s*<!--\s*Plus Jakarta Sans[^>]*-->\s*\n/gm,
  ];
  for (const re of dropLines) html = html.replace(re, "");

  // Inline rewrites — replace remote URLs with local vendor paths.
  html = html
    .replace(/<script\s+crossorigin\s+src="https:\/\/unpkg\.com\/react@[^"]+"\s*><\/script>/,
             '<script src="./vendor/react.production.min.js"></script>')
    .replace(/<script\s+crossorigin\s+src="https:\/\/unpkg\.com\/react-dom@[^"]+"\s*><\/script>/,
             '<script src="./vendor/react-dom.production.min.js"></script>')
    .replace(/<script\s+src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@[^"]+"\s*><\/script>/,
             '<script src="./vendor/supabase.min.js"></script>')
    .replace(/<link\s+rel="stylesheet"\s+href="https:\/\/unpkg\.com\/leaflet@[^"]+\.css"[^>]*\/?>/,
             '<link rel="stylesheet" href="./vendor/leaflet.css" />')
    .replace(/<script\s+src="https:\/\/unpkg\.com\/leaflet@[^"]+\.js"[^>]*><\/script>/,
             '<script src="./vendor/leaflet.js"></script>')
    .replace(/<script\s+type="text\/babel"\s+src="\.\/app\.jsx[^"]*"[^>]*><\/script>/,
             '<script src="./app.js"></script>');

  // Strip Open Graph / Twitter images that point at unsplash.com — they're meta
  // tags, never fetched by the device, but they trip the "no cdn" grep.
  html = html.replace(/https:\/\/images\.unsplash\.com\/[^"]+/g, "");

  fs.writeFileSync(path.join(DIST, "index.html"), html);

  // 5. Sanity grep — fail loud if any forbidden remote ref slipped through.
  const forbidden = /unpkg|jsdelivr|@babel\/standalone|sentry-cdn|cdn\.jsdelivr|plausible\.io|fonts\.googleapis|fonts\.gstatic|text\/babel/;
  const offenders = [];
  for (const f of fs.readdirSync(DIST)) {
    const p = path.join(DIST, f);
    if (fs.statSync(p).isFile()) {
      const text = fs.readFileSync(p, "utf8");
      if (forbidden.test(text)) offenders.push(`${f}: ${text.match(forbidden)?.[0]}`);
    }
  }
  if (offenders.length) {
    console.error("[build-ios] ❌ remote ref leaked into dist/:");
    for (const o of offenders) console.error("  - " + o);
    process.exit(1);
  }

  // Bundle-size report
  function sizeOf(p) {
    let total = 0;
    for (const f of fs.readdirSync(p, { withFileTypes: true })) {
      const fp = path.join(p, f.name);
      total += f.isDirectory() ? sizeOf(fp) : fs.statSync(fp).size;
    }
    return total;
  }
  const kb = (n) => (n / 1024).toFixed(1) + " KB";
  console.log(`[build-ios] ✅ self-contained bundle written to ${DIST}`);
  console.log(`[build-ios]    dist/        ${kb(sizeOf(DIST))} total`);
  console.log(`[build-ios]    dist/app.js  ${kb(fs.statSync(path.join(DIST, "app.js")).size)} (pre-transpiled)`);
  console.log(`[build-ios]    dist/vendor/ ${kb(sizeOf(VENDOR))} (React/ReactDOM/Supabase/Leaflet)`);
}

main().catch((err) => { console.error(err); process.exit(1); });
