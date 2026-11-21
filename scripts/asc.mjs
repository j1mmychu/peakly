// App Store Connect helper for the phone-only release.
//
//   node scripts/asc.mjs self-test
//   node scripts/asc.mjs check-notes
//   node scripts/asc.mjs install-key
//   node scripts/asc.mjs next-build [--require N]
//   node scripts/asc.mjs set-listing
//
// Secrets (env): ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8, APPLE_TEAM_ID.
// ASC_KEY_P8 is either the raw .p8 PEM (BEGIN/END lines kept) or the
// base64 of that whole file, one line. See docs/PHONE_ONLY_RELEASE.md.
//
// set-listing writes the support URL, privacy URL, and review notes.
// It does not submit for review and does not change the selected build.

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NOTES_PATH = path.join(ROOT, "docs/APP_REVIEW_NOTES_SHORT.txt");
const BUNDLE_ID = "com.stormpeak.peakly";
const VERSION = "1.0";
const SUPPORT_URL = "https://j1mmychu.github.io/peakly/support.html";
const PRIVACY_URL = "https://j1mmychu.github.io/peakly/privacy.html";
const API = "https://api.appstoreconnect.apple.com";

const REQUIRED_PHRASES = [
  "ski",
  "beach",
  "Friday",
  "Get Started",
  "magic link",
  "no password",
  "Delete account",
  "DELETE",
  "user-generated",
  "Open-Meteo",
  "Travelpayouts",
  "Supabase",
  "Booking.com",
  "SafetyWing",
  "Core Location",
  "OpenStreetMap",
  "Unsplash",
  "CC BY 4.0",
  "every App Store region",
  "no in-app purchase",
  "no AI",
];

// Version states where a PATCH would be a bad surprise. REJECTED and
// PREPARE_FOR_SUBMISSION are editable and are the states we expect.
const LOCKED_STATES = new Set([
  "WAITING_FOR_REVIEW",
  "IN_REVIEW",
  "PENDING_APPLE_RELEASE",
  "PENDING_DEVELOPER_RELEASE",
  "READY_FOR_SALE",
  "READY_FOR_REVIEW",
  "PROCESSING_FOR_DISTRIBUTION",
]);

export function decodeP8(raw) {
  if (!raw || !String(raw).trim()) {
    throw new Error("ASC_KEY_P8 is empty");
  }
  let text = String(raw).replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
  if (!text.includes("BEGIN")) {
    text = Buffer.from(text.replace(/\s+/g, ""), "base64").toString("utf8").trim();
  }
  if (!text.includes("BEGIN PRIVATE KEY") && !text.includes("BEGIN EC PRIVATE KEY")) {
    throw new Error(
      "ASC_KEY_P8 is not a PEM and not base64 of a PEM. Paste the .p8 file (BEGIN/END lines) or base64 of that whole file."
    );
  }
  return text.endsWith("\n") ? text : text + "\n";
}

export function assertPrivateKey(pem) {
  const key = crypto.createPrivateKey(pem);
  if (key.asymmetricKeyType !== "ec") {
    throw new Error("ASC_KEY_P8 is not an EC key. App Store Connect keys are ES256.");
  }
  return key;
}

export function signJwt(pem, keyId, issuerId, nowSec = Math.floor(Date.now() / 1000)) {
  const header = b64url(JSON.stringify({ alg: "ES256", kid: keyId, typ: "JWT" }));
  const payload = b64url(JSON.stringify({
    iss: issuerId,
    iat: nowSec,
    exp: nowSec + 15 * 60,
    aud: "appstoreconnect-v1",
  }));
  const data = `${header}.${payload}`;
  const sig = crypto.sign("SHA256", Buffer.from(data), {
    key: crypto.createPrivateKey(pem),
    dsaEncoding: "ieee-p1363",
  });
  return `${data}.${b64url(sig)}`;
}

function b64url(input) {
  return Buffer.from(input).toString("base64url");
}

export function loadNotes() {
  const notes = fs.readFileSync(NOTES_PATH, "utf8").trim();
  const missing = REQUIRED_PHRASES.filter((p) => !notes.includes(p));
  if (missing.length) {
    throw new Error(`Review notes are missing: ${missing.join(", ")}`);
  }
  if (notes.length > 4000) {
    throw new Error(`Review notes are ${notes.length} characters. Apple allows 4000.`);
  }
  if (Buffer.byteLength(notes, "utf8") > 4000) {
    throw new Error(`Review notes are ${Buffer.byteLength(notes, "utf8")} UTF-8 bytes. Keeping that under 4000 too.`);
  }
  return notes;
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) throw new Error(`Missing secret ${name}`);
  return String(v).trim();
}

function credentials() {
  const keyId = requireEnv("ASC_KEY_ID");
  const issuerId = requireEnv("ASC_ISSUER_ID");
  const teamId = requireEnv("APPLE_TEAM_ID");
  if (!/^[A-Z0-9]{10}$/.test(keyId)) throw new Error("ASC_KEY_ID should be 10 letters or digits");
  if (!/^[0-9a-fA-F-]{36}$/.test(issuerId)) throw new Error("ASC_ISSUER_ID should be a UUID");
  if (!/^[A-Z0-9]{10}$/.test(teamId)) throw new Error("APPLE_TEAM_ID should be 10 letters or digits");
  const pem = decodeP8(requireEnv("ASC_KEY_P8"));
  assertPrivateKey(pem);
  return { keyId, issuerId, teamId, pem, token: signJwt(pem, keyId, issuerId) };
}

async function api(token, urlPath, { method = "GET", body } = {}) {
  const res = await fetch(API + urlPath, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text.slice(0, 500) }; }
  if (!res.ok) {
    const detail = json?.errors?.map((e) => `${e.status || res.status} ${e.code || ""} ${e.title || ""} ${e.detail || ""}`.trim()).join("\n")
      || text.slice(0, 500);
    const err = new Error(`${method} ${urlPath} failed (${res.status})\n${detail}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

async function getAll(token, urlPath) {
  const out = [];
  let next = urlPath;
  for (let i = 0; i < 20 && next; i++) {
    const page = await api(token, next);
    out.push(...(page.data || []));
    const n = page.links?.next;
    if (!n) break;
    next = n.startsWith(API) ? n.slice(API.length) : n;
  }
  return out;
}

async function findApp(token) {
  const json = await api(token, `/v1/apps?filter[bundleId]=${encodeURIComponent(BUNDLE_ID)}&limit=5`);
  const app = (json.data || [])[0];
  if (!app) throw new Error(`No App Store Connect app with bundle id ${BUNDLE_ID}`);
  return app;
}

async function listBuildNumbers(token, appId) {
  const builds = await getAll(token, `/v1/builds?filter[app]=${appId}&limit=200&fields[builds]=version`);
  const nums = [];
  for (const b of builds) {
    const n = Number.parseInt(b.attributes?.version, 10);
    if (Number.isFinite(n)) nums.push(n);
  }
  return nums;
}

export function chooseBuildNumber(existing, requested) {
  const used = new Set(existing);
  if (requested != null && requested !== "") {
    const n = Number(requested);
    if (!Number.isInteger(n) || n < 1) throw new Error(`Build number must be a positive integer, got ${requested}`);
    if (used.has(n)) throw new Error(`Build ${n} is already on App Store Connect. Leave the input empty to pick the next free number.`);
    return n;
  }
  if (!used.has(3)) return 3;
  const max = existing.reduce((m, n) => Math.max(m, n), 0);
  return max + 1;
}

async function cmdNextBuild() {
  const req = process.argv.includes("--require")
    ? process.argv[process.argv.indexOf("--require") + 1]
    : String(process.env.BUILD_NUMBER || "").trim();
  const { token } = credentials();
  const app = await findApp(token);
  const existing = await listBuildNumbers(token, app.id);
  const n = chooseBuildNumber(existing, req);
  console.error(`App ${app.id}. Existing build numbers: ${existing.sort((a, b) => a - b).join(", ") || "(none)"}. Using ${n}.`);
  process.stdout.write(String(n));
}

function installKeyFiles(pem, keyId) {
  const name = `AuthKey_${keyId}.p8`;
  const dirs = [
    path.join(process.env.RUNNER_TEMP || os.tmpdir(), "private_keys"),
    path.join(os.homedir(), ".appstoreconnect/private_keys"),
    path.join(os.homedir(), "private_keys"),
    path.join(os.homedir(), ".private_keys"),
  ];
  let primary = "";
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    const dest = path.join(dir, name);
    fs.writeFileSync(dest, pem, { mode: 0o600 });
    if (!primary) primary = dest;
  }
  return primary;
}

async function cmdInstallKey() {
  const { pem, keyId } = credentials();
  const dest = installKeyFiles(pem, keyId);
  process.stdout.write(dest);
}

async function cmdSetListing() {
  const notes = loadNotes();
  const { token } = credentials();
  const app = await findApp(token);
  console.error(`App ${BUNDLE_ID} id ${app.id}`);

  const versions = await getAll(token, `/v1/apps/${app.id}/appStoreVersions?limit=20`);
  const matches = versions.filter((v) => v.attributes?.versionString === VERSION && v.attributes?.platform === "IOS");
  if (!matches.length) {
    const seen = versions.map((v) => `${v.attributes?.versionString}/${v.attributes?.platform}/${v.attributes?.appStoreState}`).join(", ");
    throw new Error(`No iOS ${VERSION} version. Found: ${seen || "(none)"}. This script will not create one.`);
  }
  const editable = matches.find((v) => !LOCKED_STATES.has(v.attributes?.appStoreState)) || null;
  if (!editable) {
    const states = matches.map((v) => v.attributes?.appStoreState).join(", ");
    throw new Error(`iOS ${VERSION} is ${states}. Notes and URLs are locked. This script will not submit and will not change the selected build.`);
  }
  console.error(`Updating iOS ${VERSION} (${editable.id}) state ${editable.attributes.appStoreState}`);

  const locs = await getAll(token, `/v1/appStoreVersions/${editable.id}/appStoreVersionLocalizations?limit=20`);
  if (!locs.length) throw new Error("Version has no localization to attach a support URL to.");
  for (const loc of locs) {
    await api(token, `/v1/appStoreVersionLocalizations/${loc.id}`, {
      method: "PATCH",
      body: { data: { type: "appStoreVersionLocalizations", id: loc.id, attributes: { supportUrl: SUPPORT_URL } } },
    });
    console.error(`supportUrl set on ${loc.attributes?.locale || loc.id}`);
  }

  const infos = await getAll(token, `/v1/apps/${app.id}/appInfos?limit=5`);
  let privacyCount = 0;
  for (const info of infos) {
    const infoLocs = await getAll(token, `/v1/appInfos/${info.id}/appInfoLocalizations?limit=20`);
    for (const loc of infoLocs) {
      await api(token, `/v1/appInfoLocalizations/${loc.id}`, {
        method: "PATCH",
        body: { data: { type: "appInfoLocalizations", id: loc.id, attributes: { privacyPolicyUrl: PRIVACY_URL } } },
      });
      privacyCount++;
      console.error(`privacyPolicyUrl set on ${loc.attributes?.locale || loc.id}`);
    }
  }
  if (!privacyCount) throw new Error("No app info localization found for the privacy policy URL.");

  let review = null;
  try {
    const rel = await api(token, `/v1/appStoreVersions/${editable.id}/appStoreReviewDetail`);
    review = rel.data || null;
  } catch (err) {
    if (err.status !== 404) throw err;
  }
  if (review?.id) {
    await api(token, `/v1/appStoreReviewDetails/${review.id}`, {
      method: "PATCH",
      body: { data: { type: "appStoreReviewDetails", id: review.id, attributes: { notes } } },
    });
    console.error(`Review notes updated (${notes.length} characters).`);
  } else {
    await api(token, "/v1/appStoreReviewDetails", {
      method: "POST",
      body: {
        data: {
          type: "appStoreReviewDetails",
          attributes: { notes },
          relationships: { appStoreVersion: { data: { type: "appStoreVersions", id: editable.id } } },
        },
      },
    });
    console.error(`Review notes created (${notes.length} characters).`);
  }
  console.error("Done. Did not submit for review. Did not change the selected build.");
}

function selfTest() {
  loadNotes();
  const { privateKey } = crypto.generateKeyPairSync("ec", { namedCurve: "P-256" });
  const pem = privateKey.export({ type: "pkcs8", format: "pem" });
  const token = signJwt(pem, "KEYID123456".slice(0, 10), "00000000-0000-4000-8000-000000000000", 1_700_000_000);
  const [h, p, s] = token.split(".");
  if (!h || !p || !s) throw new Error("jwt shape");
  const ok = crypto.verify(
    "SHA256",
    Buffer.from(`${h}.${p}`),
    { key: crypto.createPublicKey(privateKey), dsaEncoding: "ieee-p1363" },
    Buffer.from(s, "base64url"),
  );
  if (!ok) throw new Error("jwt signature did not verify as raw R||S");
  const round = decodeP8(Buffer.from(pem).toString("base64"));
  assertPrivateKey(round);
  if (chooseBuildNumber([], "") !== 3) throw new Error("empty history should use 3");
  if (chooseBuildNumber([1, 2], "") !== 3) throw new Error("3 is free");
  if (chooseBuildNumber([1, 2, 3], "") !== 4) throw new Error("3 taken should increment");
  if (chooseBuildNumber([1, 2, 3, 9], "") !== 10) throw new Error("should use max+1");
  let threw = false;
  try { chooseBuildNumber([3], "3"); } catch { threw = true; }
  if (!threw) throw new Error("requesting a used build should fail");
  const src = fs.readFileSync(fileURLToPath(import.meta.url), "utf8");
  const banned = ["review" + "Submissions", "submit" + "ForReview"];
  if (banned.some((w) => src.includes(w))) {
    throw new Error("this script must not call the review-submission endpoint");
  }
  console.log(`self-test ok. notes ${loadNotes().length} characters.`);
}

const cmd = process.argv[2];
const table = {
  "self-test": () => selfTest(),
  "check-notes": () => console.log(`notes ok, ${loadNotes().length} characters`),
  "install-key": cmdInstallKey,
  "next-build": cmdNextBuild,
  "set-listing": cmdSetListing,
};

if (!table[cmd]) {
  console.error("usage: node scripts/asc.mjs self-test|check-notes|install-key|next-build|set-listing");
  process.exit(2);
}
Promise.resolve(table[cmd]()).catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
