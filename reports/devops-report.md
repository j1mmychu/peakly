# Peakly DevOps Report — 2026-06-10

**Status: 🔴 RED**

Two P0s active. (1) **GitHub PAT expires 2026-06-15 — 5 days.** When it blows, `scripts/auto-push.sh` and all remote scheduled agents lose push access. GitHub Actions CI is safe (uses OIDC, not PAT), but the entire local/agent ship pipeline dies. (2) **GEAR_ITEMS was deleted again** (third time) — Amazon Associates has earned $0 since the June 7 auto-commits. **Restored this run.** Cache stamp was `20260609ab` on merge arrival — bumped to `20260610a` this run. VPS redeploy remains Day 37 and is the standing rate-limit cliff at any real traffic event.

---

## Fixes Shipped This Run

| Fix | File | Detail |
|-----|------|--------|
| **GEAR_ITEMS restored** | `app.jsx:279` (const) + `app.jsx:11320` (render) | P0 revenue fix — Amazon back live |
| Cache buster `20260609ab` → `20260610a` | `app.jsx:17` | Stale on merge arrival |
| SW CACHE_NAME `peakly-20260609ab` → `peakly-20260610a` | `sw.js:2` | Evicts stale cached assets on next visit |
| Query string `?v=20260609ab` → `?v=20260610a` | `index.html:400` | Forces browser reload of updated app.jsx |

---

## 1. P0-A — GitHub PAT Expires 2026-06-15 (5 Days)

**Deadline: This Friday. Miss it and `scripts/auto-push.sh` fails silently, remote scheduled agents can't push, every agent-generated fix stays undeployed.**

The GitHub Actions deploy workflow (`deploy.yml`) is safe — it uses OIDC (`id-token: write`) with auto-provisioned `GITHUB_TOKEN`, no PAT required there. The PAT is used by:
- `scripts/auto-push.sh` (git push via credential store on Jack's machine)
- Remote scheduled agents (`peakly-devops`, `peakly-content-data`, `peakly-product-manager`)

**Fix — 3 minutes:**
```
1. github.com/settings/tokens/legacy → find token expiring 2026-06-15
2. Click "Regenerate" → set expiry 1 year → copy new token
3. Update everywhere:
   a. Local credential store:
      git credential reject <<EOF
      protocol=https
      host=github.com
      username=j1mmychu
      EOF
      (next `git push` prompts — enter new token, it caches automatically)
   b. Remote agents: find and update GH_PAT env var wherever it lives
      pm2 set <agent-name>:GH_PAT "ghp_newTokenHere"
```

---

## 2. P0-B — GEAR_ITEMS Deleted: Amazon at $0 (FIXED THIS RUN)

Third deletion since launch. Timeline:
- First deleted: 2026-05-09 history scrub
- Restored: 2026-05-24 (commits 932943c / 450891b)
- Deleted again: 2026-06-07 via 3 unlabeled `auto: app.jsx` commits
- **Restored this run** — `app.jsx:279` const + `app.jsx:11320` render in VenueDetailSheet

Revenue impact June 7–10: ~3 days × $4.48/1K MAU lost. At current DAU: ~$0.

An INVARIANT comment is now on the constant. Still not a guardrail — add the pre-commit grep check below to make it structural:

**Add to `scripts/auto-push.sh` before the `git commit` line:**
```bash
GEAR_COUNT=$(grep -c "GEAR_ITEMS" app.jsx 2>/dev/null || echo 0)
if [ "$GEAR_COUNT" -lt 4 ]; then
  echo "[auto-push] ABORT: GEAR_ITEMS invariant violated ($GEAR_COUNT refs < 4)"
  git restore app.jsx  # roll back the offending edit
  exit 1
fi
```

---

## 3. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **~9,100+ lines / ~540+ KB raw / ~154 KB gzip est.** |
| CDN scripts | All HTTPS, pinned to exact versions ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io"` ✅ |
| Cache buster | `v=20260610a` — bumped this run ✅ |
| SW CACHE_NAME | `peakly-20260610a` — bumped this run ✅ |
| PEAKLY_BUILD | `20260610a` — bumped this run ✅ |
| PRECACHE | `[]` — correct ✅ |
| Sentry DSN | Active: `9416b032a46681d74645b056fcb08eb7@...sentry.io` ✅ |
| `forceCleanReload()` | Present — users can rescue stuck PWA ✅ |
| SW update probe on boot | Present — `reg.update()` on load ✅ |
| GEAR_ITEMS | ✅ Restored this run (was 0 refs, now 5) |

### CDN Dependency Versions

| Library | Pinned Version | SRI | Notes |
|---------|---------------|-----|-------|
| React + ReactDOM | 18.3.1 (unpkg) | ❌ | Current |
| Babel Standalone | 7.29.7 (unpkg) | ❌ | Current |
| Supabase JS | 2.45.4 (lazy-loaded) | ❌ | Downgraded + made lazy — good change |
| Leaflet | 1.9.4 (unpkg) | ✅ | Stable |
| Sentry Loader | Project key–pinned | N/A | Managed by Sentry |

Supabase JS is now lazy-loaded via `ensureSupabase()` — the eager `<script>` in `index.html` was removed in the June 9 commits. The known-skipped diff is superseded.

---

## 4. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Travelpayouts token | Server-side env var only ✅ |
| TP_MARKER | `"710303"` — public affiliate marker ✅ |
| Flight request timeout | 5s AbortController ✅ |
| Concurrency cap | `_flightSem` max 3 concurrent ✅ |
| VPS redeploy | ❌ **Day 37** |

### P1-A — VPS Redeploy: Day 37

```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && pm2 save
curl https://peakly-api.duckdns.org/health | jq .
```

Expected after deploy:
```json
{ "status": "ok", "wx_cache_size": 0, "apns_configured": false, "poll_worker": "running" }
```

Without proxy weather cache: **67 DAU = 10,050 Open-Meteo calls/day = free tier blown**. Grid goes blank. No error shown to user.

---

## 5. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts API token in client | Not present ✅ |
| Supabase anon key | `app.jsx:26` — by design, RLS-gated ✅ |
| `.gitignore` | Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.pdf`, `*.pptx` ✅ |
| APNS keys | All via `process.env` in proxy.js ✅ |
| Secrets in last 5 commits | None detected ✅ |
| CSP meta tag | ❌ Not present (P2) |

SRI missing on React, ReactDOM, Babel, Supabase — known-skipped. Re-elevate on any CDN compromise news.

---

## 6. Performance

| Metric | Value |
|--------|-------|
| `app.jsx` raw | ~540 KB |
| Babel Standalone | ~900 KB minified — runtime JSX transform |
| React + ReactDOM | ~141 KB minified |
| Supabase JS (lazy, gzip) | ~80 KB — only loads on auth event ✅ |
| Leaflet JS (gzip) | ~40 KB |
| **Total cold load** | ~1.2 MB raw / ~390 KB gzip est. |

Images: `loading="lazy"` on all venue `<img>` tags ✅. Babel Standalone remains the bottleneck — no fix without a build step.

---

## 7. APNS / Strike Alerts

| Check | Result |
|-------|--------|
| Polling worker | Written, undeployed (Day 37) |
| APNS JWT generator | Written, undeployed |
| Hard deadline | **2026-05-13 — 28 days overdue** |

### P1-B — APNS: 28 Days Past Deadline

**Option B — iOS gate (5 min, unblocks App Store):**

Add near the top of `App` component:
```jsx
const isNativeIOS = typeof window !== "undefined" &&
  typeof window.Capacitor !== "undefined" &&
  window.Capacitor.getPlatform?.() === "ios";
```

Then gate Alerts tab render and nav button on `!isNativeIOS`. App Store submission unblocked today.

---

## 8. Cost Estimate

| Tier | MAU | DAU est. | Open-Meteo/day | DigitalOcean | Supabase | Total/mo |
|------|-----|----------|----------------|--------------|----------|----------|
| Now | <20 | ~7 | ~1,050 direct | $6 | Free | **$6** |
| 1K MAU | ~33 avg DAU | ~33 | ~4,950 — under limit | $6 | Free | **$6** |
| 10K MAU (no proxy) | ~333 DAU | ~333 | **49,950 — BLOWN** | $12 | $25 | **$37** |
| 10K MAU + proxy | ~333 DAU | ~333 | ~400 (cached) ✅ | $12 | $25 | **$37** |
| 100K MAU + proxy | ~3,300 DAU | ~3,300 | ~400 (LRU sat.) | $24–$48 | $25 | **$50–$73** |

---

## 9. What Breaks First at Scale

**Open-Meteo at 67 DAU.** Hard binary cutoff. 10,000 calls/day free tier. Venues return null, score as zero, grid goes empty. No user-visible error. The proxy cache has been ready to deploy for 37 days.

**GEAR_ITEMS auto-deletion** is the recurring revenue leak. Three deletions in 37 days. The pre-commit guard above is a 5-minute fix that ends this class of incident permanently.

**Supabase bandwidth at ~8K MAU.** 2GB/month free. Monitor via Supabase dashboard → Settings → Billing past 1K MAU.

---

## Action Items

| Priority | Action | Time | Owner | Days Blocked |
|----------|--------|------|-------|-------------|
| **P0** | Regenerate GitHub PAT before 2026-06-15 (instructions in §1) | 3 min | Jack | **5 days to expiry** |
| ~~P0~~ | ~~Restore GEAR_ITEMS~~ | — | ✅ Fixed this run | — |
| **P1** | `ssh root@198.199.80.21 && cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy` | 3 min | Jack | **37 days** |
| **P1** | Wire APNS OR add iOS Alerts gate (`Capacitor.getPlatform() === "ios"`) | 5–30 min | Jack | **28 days past deadline** |
| **P2** | Add GEAR_ITEMS pre-commit guard to `scripts/auto-push.sh` (bash snippet in §2) | 5 min | DevOps | New |
| **P2** | Add cache-buster auto-bump to `scripts/auto-push.sh` | 10 min | Jack | 16 days flagged |
| **P3** | Add permissive CSP meta tag to `index.html` | 20 min | DevOps | Ongoing |
