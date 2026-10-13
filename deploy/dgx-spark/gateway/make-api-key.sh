#!/usr/bin/env bash
# Creates, lists or revokes API keys for the mPod AI gateway on the DGX Spark.
#   sudo ./make-api-key.sh create aws-prod      # prints the new key ONCE; put it in AWS backend/.env (DGX_API_KEY)
#   sudo ./make-api-key.sh list                 # client names only
#   sudo ./make-api-key.sh revoke aws-prod      # the key stops working immediately
# Keys live in /etc/nginx/mpod-ai-keys.conf (root:www-data, 640).
set -euo pipefail

KEYS=/etc/nginx/mpod-ai-keys.conf
CMD="${1:-}"
NAME="${2:-}"

[ "$(id -u)" = "0" ] || { echo "Run with sudo." >&2; exit 1; }
touch "$KEYS" && chown root:www-data "$KEYS" && chmod 640 "$KEYS"

valid_name() { [[ "$NAME" =~ ^[a-zA-Z0-9_-]{2,40}$ ]] || { echo "Client name: 2-40 letters, digits, - or _." >&2; exit 1; }; }
reload() { nginx -t -q && systemctl reload nginx; }

case "$CMD" in
  create)
    valid_name
    if grep -q "\"$NAME\";\$" "$KEYS"; then echo "Client \"$NAME\" already has a key; revoke it first." >&2; exit 1; fi
    KEY="mpod_$(openssl rand -hex 32)"
    echo "\"Bearer $KEY\" \"$NAME\";" >> "$KEYS"
    reload
    echo "API key for \"$NAME\" (shown once, store it safely):"
    echo "$KEY"
    ;;
  list)
    sed -n 's/^"Bearer [^"]*" "\(.*\)";$/\1/p' "$KEYS"
    ;;
  revoke)
    valid_name
    if ! grep -q "\"$NAME\";\$" "$KEYS"; then echo "No key for \"$NAME\"." >&2; exit 1; fi
    sed -i "/\"$NAME\";\$/d" "$KEYS"
    reload
    echo "Revoked \"$NAME\"."
    ;;
  *)
    echo "Usage: sudo $0 create|list|revoke [client-name]" >&2
    exit 1
    ;;
esac
