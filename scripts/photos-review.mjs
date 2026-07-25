// Venue photo sourcing — step 2 of 3.
//
// Builds an offline review page from data/photo-candidates.json: every venue
// shows its CURRENT photo next to the PROPOSED one, plus up to 5 alternates you
// can swap in with a click. Approve/reject per venue, then hit "Export" — it
// downloads data/photo-decisions.json, which photos-apply.mjs reads.
//
// Run:  cd ~/peakly && node scripts/photos-review.mjs
// Then open the printed file path in your browser (or it opens automatically).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IN = path.join(ROOT, "data", "photo-candidates.json");
const OUT = path.join(ROOT, "data", "photo-review.html");

if (!fs.existsSync(IN)) {
  console.error("No data/photo-candidates.json yet — run scripts/photos-fetch.mjs first.");
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(IN, "utf8"));
const rows = Object.values(data).filter(r => r.pick);
const skipped = Object.values(data).filter(r => !r.pick);

const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Peakly — photo review (${rows.length})</title>
<style>
  :root { --blue:#0284c7; }
  * { box-sizing:border-box; }
  body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; margin:0; background:#f5f5f5; color:#222; }
  header { position:sticky; top:0; z-index:10; background:#fff; border-bottom:1px solid #e5e5e5;
           padding:14px 20px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
  h1 { font-size:17px; margin:0; font-weight:800; }
  .stat { font-size:13px; color:#666; }
  .stat b { color:#222; }
  button { font-family:inherit; font-size:13px; font-weight:700; border-radius:9px; padding:9px 14px;
           border:1px solid #ddd; background:#fff; cursor:pointer; }
  button.primary { background:var(--blue); color:#fff; border-color:var(--blue); }
  .filters { display:flex; gap:6px; margin-left:auto; }
  .filters button.on { background:#222; color:#fff; border-color:#222; }
  .grid { padding:16px; display:grid; gap:14px; grid-template-columns:repeat(auto-fill,minmax(430px,1fr)); }
  .card { background:#fff; border-radius:14px; padding:12px; border:2px solid transparent; }
  .card.approved { border-color:#16a34a; }
  .card.rejected { border-color:#ef4444; opacity:.5; }
  .card.hidden { display:none; }
  .head { display:flex; justify-content:space-between; align-items:baseline; gap:8px; margin-bottom:8px; }
  .title { font-weight:800; font-size:14px; }
  .loc { font-size:11px; color:#888; }
  .cat { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.04em;
         color:var(--blue); background:#e0f2fe; padding:2px 7px; border-radius:5px; }
  .pair { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .pane { position:relative; }
  .pane img { width:100%; aspect-ratio:4/3; object-fit:cover; border-radius:9px; display:block; background:#eee; }
  .lbl { position:absolute; top:6px; left:6px; font-size:9px; font-weight:800; text-transform:uppercase;
         background:rgba(0,0,0,.7); color:#fff; padding:3px 6px; border-radius:5px; letter-spacing:.04em; }
  .q { font-size:10px; color:#999; margin-top:6px; font-style:italic; min-height:13px; }
  .alts { display:flex; gap:5px; margin-top:7px; }
  .alts img { width:52px; height:40px; object-fit:cover; border-radius:6px; cursor:pointer;
              border:2px solid transparent; }
  .alts img:hover { border-color:var(--blue); }
  .acts { display:flex; gap:6px; margin-top:9px; }
  .acts button { flex:1; }
  .ok { color:#16a34a; border-color:#16a34a; }
  .no { color:#ef4444; border-color:#ef4444; }
  .card.approved .ok, .card.rejected .no { background:currentColor; }
  .card.approved .ok span, .card.rejected .no span { color:#fff; }
  .note { padding:12px 20px; font-size:12px; color:#666; background:#fffbeb; border-bottom:1px solid #fde68a; }
</style></head><body>
<header>
  <h1>Peakly photo review</h1>
  <div class="stat"><b id="a">0</b> approved · <b id="r">0</b> rejected · <b id="p">${rows.length}</b> pending</div>
  <div class="filters">
    <button data-f="all" class="on">All</button>
    <button data-f="skiing">Ski</button>
    <button data-f="beach">Beach</button>
    <button data-f="pending">Pending</button>
  </div>
  <button class="primary" onclick="approveAll()">Approve all visible</button>
  <button class="primary" onclick="exportJSON()">Export decisions ↓</button>
</header>
${skipped.length ? `<div class="note">${skipped.length} venue(s) had no Unsplash match and keep their current photo: ${skipped.map(s => s.title).join(", ")}</div>` : ""}
<div class="grid" id="g">
${rows.map(r => `
  <div class="card" data-id="${r.id}" data-cat="${r.category}">
    <div class="head">
      <div><div class="title">${esc(r.title)}</div><div class="loc">${esc(r.location || "")}</div></div>
      <span class="cat">${r.category === "skiing" ? "Ski" : "Beach"}</span>
    </div>
    <div class="pair">
      <div class="pane"><img src="${esc(r.current)}" loading="lazy"><span class="lbl">Current</span></div>
      <div class="pane"><img id="new-${r.id}" src="${esc(r.pick.thumb)}" data-full="${esc(r.pick.url)}" loading="lazy"><span class="lbl" style="background:var(--blue)">Proposed</span></div>
    </div>
    <div class="q" id="q-${r.id}">matched: "${esc(r.pick.matchedQuery)}"${r.pick.description ? " — " + esc(r.pick.description.slice(0, 70)) : ""}</div>
    ${r.alternates?.length ? `<div class="alts">${r.alternates.map(a => `<img src="${esc(a.thumb)}" data-full="${esc(a.url)}" data-desc="${esc(a.matchedQuery)}" onclick="swap('${r.id}',this)" loading="lazy" title="${esc(a.description || a.matchedQuery)}">`).join("")}</div>` : ""}
    <div class="acts">
      <button class="ok" onclick="mark('${r.id}',1)"><span>Approve</span></button>
      <button class="no" onclick="mark('${r.id}',0)"><span>Keep current</span></button>
    </div>
  </div>`).join("")}
</div>
<script>
const picks = ${JSON.stringify(Object.fromEntries(rows.map(r => [r.id, r.pick.url])))};
const state = {};
function esc(s){return s;}
function mark(id, ok) {
  state[id] = ok ? "approve" : "reject";
  const c = document.querySelector('[data-id="'+id+'"]');
  c.classList.toggle("approved", !!ok); c.classList.toggle("rejected", !ok);
  tally();
}
function swap(id, el) {
  const img = document.getElementById("new-"+id);
  img.src = el.src; img.dataset.full = el.dataset.full;
  picks[id] = el.dataset.full;
  document.getElementById("q-"+id).textContent = 'swapped to alternate — "' + el.dataset.desc + '"';
  mark(id, 1);
}
function tally() {
  const v = Object.values(state);
  a.textContent = v.filter(x=>x==="approve").length;
  r.textContent = v.filter(x=>x==="reject").length;
  p.textContent = ${rows.length} - v.length;
}
function approveAll() {
  document.querySelectorAll('.card:not(.hidden)').forEach(c => mark(c.dataset.id, 1));
}
document.querySelectorAll('.filters button').forEach(b => b.onclick = () => {
  document.querySelectorAll('.filters button').forEach(x=>x.classList.remove('on'));
  b.classList.add('on');
  const f = b.dataset.f;
  document.querySelectorAll('.card').forEach(c => {
    const show = f==="all" || (f==="pending" ? !state[c.dataset.id] : c.dataset.cat===f);
    c.classList.toggle('hidden', !show);
  });
});
function exportJSON() {
  const out = {};
  for (const [id, decision] of Object.entries(state)) {
    if (decision === "approve") out[id] = picks[id];
  }
  const n = Object.keys(out).length;
  if (!n) return alert("Nothing approved yet.");
  const blob = new Blob([JSON.stringify(out, null, 2)], {type:"application/json"});
  const a2 = document.createElement("a");
  a2.href = URL.createObjectURL(blob);
  a2.download = "photo-decisions.json";
  a2.click();
  alert(n + " approved photos exported.\\n\\nMove the downloaded photo-decisions.json into ~/peakly/data/ then run:\\n  node scripts/photos-apply.mjs");
}
</script></body></html>`;

function esc(s) { return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

fs.writeFileSync(OUT, html);
console.log(`Review page → ${OUT}`);
console.log(`${rows.length} venues with candidates${skipped.length ? `, ${skipped.length} without` : ""}.`);
try { execSync(`open "${OUT}"`); console.log("Opened in your browser."); } catch {}
