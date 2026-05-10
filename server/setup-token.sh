#!/usr/bin/env bash
# One-shot token setup for the Peakly proxy.
# Prompts for TRAVELPAYOUTS_TOKEN on your SSH terminal, writes ecosystem,
# restarts pm2, prints health check. Token never leaves the VPS.

set -euo pipefail

PROXY_DIR="/opt/peakly-proxy"
ECO_FILE="$PROXY_DIR/ecosystem.config.js"

if [ ! -f "$PROXY_DIR/proxy.js" ]; then
  echo "ERROR: $PROXY_DIR/proxy.js not found. Did you scp it?"
  exit 1
fi

read -sp "Paste Travelpayouts API token (input hidden, then press Enter): " TP_TOKEN
echo
if [ -z "$TP_TOKEN" ] || [ ${#TP_TOKEN} -lt 10 ]; then
  echo "ERROR: token looks empty or too short. Aborting."
  exit 1
fi

cat > "$ECO_FILE" << EOF
module.exports = {
  apps: [{
    name: 'peakly-proxy',
    script: 'proxy.js',
    cwd: '$PROXY_DIR',
    env: {
      TRAVELPAYOUTS_TOKEN: '$TP_TOKEN',
      ALERT_POLL_MINUTES: 30,
      ALERTS_TEST_ENABLED: 'true'
    }
  }]
};
EOF
chmod 600 "$ECO_FILE"
unset TP_TOKEN

echo "Wrote $ECO_FILE (chmod 600)"

pm2 delete peakly-proxy 2>/dev/null || true
pm2 start "$ECO_FILE"
pm2 save

sleep 2
echo
echo "=== pm2 status ==="
pm2 list --no-color | tail -5
echo
echo "=== last 5 lines of fresh stderr ==="
pm2 flush peakly-proxy >/dev/null 2>&1
sleep 2
tail -5 /root/.pm2/logs/peakly-proxy-error.log 2>/dev/null | grep -v TRAVELPAYOUTS_TOKEN || echo "(no errors)"
echo
echo "=== /health (local) ==="
curl -s --max-time 5 http://localhost:3001/health || echo "(localhost:3001 not responding)"
echo
echo "Done. From your Mac: curl -s https://peakly-api.duckdns.org/health"
