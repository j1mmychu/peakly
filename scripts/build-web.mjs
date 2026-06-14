// Build the optimized production web bundle in dist/ for GitHub Pages.
//
// The killer for cold-load perf is Babel Standalone transpiling all ~644KB of
// app.jsx in the browser on first paint (3-5s desktop, 8-12s mid-tier Android).
// This pre-transpiles + minifies app.jsx → dist/app.min.js with esbuild and
// rewrites index.html to drop Babel entirely. Unlike build-ios.mjs (which
// vendors everything for offline App Store compliance), the web build keeps the
// CDN deps (React/ReactDOM/Supabase/Leaflet) — the web is online and those are
// cached by the browser/SW. The single win here is killing the Babel transpile.
//
// Dev loop is unchanged: open index.html locally and Babel-in-browser still
// transpiles app.jsx. Only production (this build) is pre-compiled.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");

// Only these web-servable assets ship. Strict allowlist — NEVER copy-everything:
// the working tree carries gitignored business-plan PDFs/PPTX that must never
// reach a public CDN (the 2026-05-09 leak that forced a history scrub).
const STATIC_FILES = ["manifest.json", "robots.txt", "sitemap.xml", "terms.html", "privacy.html", ".nojekyll"];

async function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  // Cache-buster stamp — keep app.min.js?v= in lockstep with PEAKLY_BUILD.
  const appSrc = fs.readFileSync(path.join(ROOT, "app.jsx"), "utf8");
  const stamp = (appSrc.match(/const PEAKLY_BUILD = "([^"]+)"/) || [])[1] || "dev";

  // 1. Transpile + minify app.jsx → dist/app.min.js (esbuild, classic JSX → React.createElement).
  const out = await esbuild.transform(appSrc, {
    loader: "jsx",
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    minify: true,
    target: ["es2018"],
    legalComments: "none",
  });
  fs.writeFileSync(path.join(DIST, "app.min.js"), out.code);

  // 2. Copy static assets (allowlist).
  for (const f of STATIC_FILES) {
    const srcPath = path.join(ROOT, f);
    if (fs.existsSync(srcPath)) fs.copyFileSync(srcPath, path.join(DIST, f));
  }

  // 3. dist/index.html — drop Babel, load pre-built app.min.js.
  let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  html = html
    // Babel preload + script + its comment
    .replace(/^\s*<!--\s*Babel standalone[^>]*-->\s*\n/gm, "")
    .replace(/^\s*<link[^>]+@babel\/standalone[^>]*\/?>\s*\n/gm, "")
    .replace(/^\s*<script[^>]+@babel\/standalone[^>]*><\/script>\s*\n/gm, "")
    // app.jsx (text/babel) → app.min.js
    .replace(/<script\s+type="text\/babel"\s+src="\.\/app\.jsx[^"]*"[^>]*><\/script>/,
             `<script src="./app.min.js?v=${stamp}"></script>`);
  fs.writeFileSync(path.join(DIST, "index.html"), html);

  // 4. dist/sw.js — precache the shell (stamped URLs so cache.match hits).
  let sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
  const precache = JSON.stringify(["./", "./index.html", `./app.min.js?v=${stamp}`, "./manifest.json"]);
  sw = sw.replace(/const PRECACHE = \[[^\]]*\];/, `const PRECACHE = ${precache};`);
  fs.writeFileSync(path.join(DIST, "sw.js"), sw);

  // 5. Fail loud if Babel survived anywhere in dist/.
  const forbidden = /@babel\/standalone|text\/babel/;
  const offenders = [];
  for (const f of fs.readdirSync(DIST)) {
    const p = path.join(DIST, f);
    if (fs.statSync(p).isFile() && forbidden.test(fs.readFileSync(p, "utf8"))) {
      offenders.push(`${f}: ${fs.readFileSync(p, "utf8").match(forbidden)?.[0]}`);
    }
  }
  if (offenders.length) {
    console.error("[build-web] ❌ Babel ref leaked into dist/:");
    for (const o of offenders) console.error("  - " + o);
    process.exit(1);
  }

  const kb = (n) => (n / 1024).toFixed(1) + " KB";
  const rawKb = appSrc.length / 1024;
  const minKb = fs.statSync(path.join(DIST, "app.min.js")).size / 1024;
  console.log(`[build-web] ✅ built dist/ (stamp ${stamp})`);
  console.log(`[build-web]    app.jsx ${rawKb.toFixed(1)} KB → app.min.js ${minKb.toFixed(1)} KB (${(100 - minKb / rawKb * 100).toFixed(0)}% smaller, Babel dropped)`);
}

main().catch((err) => { console.error(err); process.exit(1); });
