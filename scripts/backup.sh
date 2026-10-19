#!/usr/bin/env bash
# ==============================================================================
# Kalya — Zero-Cloud Automated Local Backup Script
#
# Usage:
#   bash scripts/backup.sh [CONTAINER_NAME] [BACKUP_DIR] [DATA_DIR]
#
# Examples:
#   # Default (Production):
#   bash scripts/backup.sh kalya-api /opt/kalya/backups /opt/kalya
#
#   # Local development test:
#   bash scripts/backup.sh kalya-api ./backups ./apps/api-server
# ==============================================================================
set -euo pipefail

CONTAINER_NAME="${1:-kalya-api}"
BACKUP_DIR="${2:-/opt/kalya/backups}"
HOST_DATA_ROOT="${3:-/opt/kalya}"
TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
ARCHIVE_NAME="kalya_backup_${TIMESTAMP}.tar.gz"
TEMP_DUMP="/app/uploads/_temp_hot_backup.db"
HOST_TEMP_DUMP="${HOST_DATA_ROOT}/uploads/_temp_hot_backup.db"
RETENTION_DAYS=14

mkdir -p "${BACKUP_DIR}"

log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*"
}

log "Starting Kalya automated backup..."
log "Container: ${CONTAINER_NAME} | Destination: ${BACKUP_DIR}/${ARCHIVE_NAME}"

# 1. Verify container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}\$"; then
  log "ERROR: Container '${CONTAINER_NAME}' is not running! Aborting backup."
  exit 1
fi

# 2. Execute safe SQLite hot-backup inside the container
log "Executing SQLite online hot backup via internal vacuum API..."
docker exec "${CONTAINER_NAME}" sqlite3 /app/data/kalya.db ".backup '${TEMP_DUMP}'"

# 3. Create compressed archive containing hot DB dump + user uploads
log "Archiving database and uploads..."
if [ -d "${HOST_DATA_ROOT}/uploads" ]; then
  tar -czf "${BACKUP_DIR}/${ARCHIVE_NAME}" \
    -C "${HOST_DATA_ROOT}" \
    uploads/_temp_hot_backup.db uploads/
else
  # Fallback: copy directly from container if bind mount not present at host root
  mkdir -p "${BACKUP_DIR}/tmp_${TIMESTAMP}"
  docker cp "${CONTAINER_NAME}:${TEMP_DUMP}" "${BACKUP_DIR}/tmp_${TIMESTAMP}/kalya.db"
  docker cp "${CONTAINER_NAME}:/app/uploads" "${BACKUP_DIR}/tmp_${TIMESTAMP}/uploads"
  tar -czf "${BACKUP_DIR}/${ARCHIVE_NAME}" -C "${BACKUP_DIR}/tmp_${TIMESTAMP}" kalya.db uploads
  rm -rf "${BACKUP_DIR}/tmp_${TIMESTAMP}"
fi

# 4. Clean up temporary hot dump inside container & host
docker exec "${CONTAINER_NAME}" rm -f "${TEMP_DUMP}" || true
rm -f "${HOST_TEMP_DUMP}" || true

BACKUP_SIZE="$(du -sh "${BACKUP_DIR}/${ARCHIVE_NAME}" | cut -f1)"
log "Backup archive successfully created: ${BACKUP_DIR}/${ARCHIVE_NAME} (${BACKUP_SIZE})"

# 5. Apply retention policy (prune backups older than RETENTION_DAYS)
log "Pruning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "kalya_backup_*.tar.gz" -mtime +"${RETENTION_DAYS}" -delete

log "Automated backup completed successfully."
