#!/usr/bin/env bash
# Nightly MongoDB backup with retention. Run from root's crontab, e.g.:
#   30 2 * * * /opt/mpod/deploy/dgx-spark/scripts/backup-mongo.sh >> /var/log/mpod-backup.log 2>&1
# Needs /etc/mpod/backup.env (chmod 600) containing:
#   MONGO_BACKUP_URI="mongodb://mpod_backup:<password>@127.0.0.1:27017/?authSource=admin&replicaSet=rs0"
# Copy the backup folder to another machine or cloud storage as well: a backup on the
# same disk does not survive a disk failure.
set -euo pipefail

# shellcheck disable=SC1091
source /etc/mpod/backup.env
BACKUP_DIR="${BACKUP_DIR:-/var/backups/mpod}"
KEEP_DAYS="${KEEP_DAYS:-14}"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
FILE="$BACKUP_DIR/mpod-$(date +%Y%m%d-%H%M%S).archive.gz"

mongodump --uri="$MONGO_BACKUP_URI" --oplog --gzip --archive="$FILE"
chmod 600 "$FILE"
echo "$(date -Is) backup written: $FILE ($(du -h "$FILE" | cut -f1))"

find "$BACKUP_DIR" -name 'mpod-*.archive.gz' -mtime +"$KEEP_DAYS" -delete
# Uploaded files (icons, profile pictures) are backed up alongside the database.
tar -czf "$BACKUP_DIR/uploads-$(date +%Y%m%d).tar.gz" -C /opt/mpod/backend uploads src/uploads 2>/dev/null || true
find "$BACKUP_DIR" -name 'uploads-*.tar.gz' -mtime +"$KEEP_DAYS" -delete
