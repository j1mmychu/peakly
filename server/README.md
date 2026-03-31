# Peakly Proxy Server

Node.js/Express proxy that runs on the DigitalOcean VPS at `198.199.80.21`.
Caddy terminates TLS and reverse-proxies `peakly-api.duckdns.org` → `localhost:3001`.

## Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/flights` | Travelpayouts v2 month-matrix (cheapest price per month) |
| GET | `/api/flights/latest` | Travelpayouts v1 latest prices (most recently found fares) |
| POST | `/api/alerts` | Register a push notification alert |
| GET | `/api/alerts/:alertId` | Check alert registration status |
| DELETE | `/api/alerts/:alertId` | Remove an alert |
| GET | `/health` | Health check + uptime |

### GET /api/flights

Calls `v2/prices/month-matrix`. Good for "cheapest flight this month" display.

```
GET /api/flights?origin=JFK&destination=BCN
```

Response:
```json
{
  "success": true,
  "data": {
    "BCN": {
      "2026-04": { "price": 320, "depart_date": "2026-04-12" }
    }
  },
  "found_at": "2026-03-29T10:00:00.000Z"
}
```

### GET /api/flights/latest

Calls `v1/prices/latest`. Returns the most recently cached fares Travelpayouts has found.

```
GET /api/flights/latest?origin=JFK&destination=BCN&period_type=month&one_way=true
```

Parameters:
- `origin` — IATA origin airport code (required)
- `destination` — IATA destination airport code (required)
- `period_type` — `month` or `year` (default: `month`)
- `one_way` — `true` or `false` (default: `true`)

Response shape is identical to `/api/flights`.

### POST /api/alerts

Register a device for push notification polling.

```json
{
  "alertId": "alert_abc123",
  "userId": "optional-user-id",
  "venueId": "whistler",
  "sport": "ski",
  "region": "north_america",
  "targetScore": 75,
  "maxPrice": 400,
  "dateFrom": "2026-04-01",
  "dateTo": "2026-04-30",
  "pushToken": "ExponentPushToken[...]",
  "pushPlatform": "expo"
}
```

Response:
```json
{ "success": true, "id": "alert_abc123", "message": "Alert registered. Conditions checked every 30 minutes." }
```

---

## Deploy / Configure

### 1. Copy files to VPS

```bash
scp -r server/ root@198.199.80.21:/opt/peakly-proxy/
```

### 2. Install dependencies

```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
npm install
```

### 3. Set environment variable

```bash
# /etc/environment or systemd unit
TRAVELPAYOUTS_TOKEN=your_token_here
PORT=3001
```

### 4. Run with PM2 (recommended)

```bash
npm install -g pm2
pm2 start proxy.js --name peakly-proxy
pm2 save
pm2 startup
```

### 5. Caddy configuration (already live)

Caddy on the VPS already proxies `peakly-api.duckdns.org` → `localhost:3001`.
No Caddy changes needed when adding new routes — Caddy passes all paths through.

### 6. Verify

```bash
curl https://peakly-api.duckdns.org/health
curl "https://peakly-api.duckdns.org/api/flights/latest?origin=JFK&destination=BCN"
```

---

## Notes

- The `TRAVELPAYOUTS_TOKEN` is **never** in client code. It lives only in this server's environment.
- `/api/alerts` uses in-memory storage. For persistence across restarts, replace `_alerts` Map with a SQLite or Redis store.
- The proxy binds to `127.0.0.1` only — not exposed directly to the internet, always behind Caddy.
