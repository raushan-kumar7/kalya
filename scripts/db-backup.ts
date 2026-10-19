import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Database } from '../packages/db/src';
import { dbEnv } from '../packages/env/src';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

async function runBackup() {
  const root = process.cwd();
  const resolvedDbPath = dbEnv.url;
  const backupsDir = process.env.BACKUP_DIR || path.join(root, 'backups');

  if (!fs.existsSync(resolvedDbPath)) {
    console.error(`\x1b[31m[Backup Error]\x1b[0m Database file not found at: ${resolvedDbPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/T/, '_').replace(/[:.]/g, '').slice(0, 15);
  const filename = `kalya_backup_${timestamp}.sqlite`;
  const destPath = path.join(backupsDir, filename);

  console.log('\n\x1b[32m🛡️  Kalya Database Disaster Recovery — Snapshot Creator\x1b[0m');
  console.log(`Source DB:    ${resolvedDbPath}`);
  console.log(`Target Dump:  ${destPath}`);

  const start = performance.now();
  const db = new Database(resolvedDbPath);

  try {
    // 1. Checkpoint SQLite WAL to flush dirty pages into main file
    try {
      db.pragma('wal_checkpoint(TRUNCATE)');
    } catch {
      // Non-fatal
    }

    // 2. Perform online non-blocking backup
    await db.backup(destPath);
    db.close();

    const elapsed = Math.round(performance.now() - start);
    const stats = fs.statSync(destPath);
    const fileBuffer = fs.readFileSync(destPath);
    const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    console.log(`\n\x1b[32m✔ Snapshot successfully created in ${elapsed}ms!\x1b[0m`);
    console.log(`  File:     ${filename}`);
    console.log(`  Size:     ${formatBytes(stats.size)} (${stats.size.toLocaleString()} bytes)`);
    console.log(`  SHA256:   ${sha256}`);
    console.log(`\n\x1b[33mTo restore this snapshot if deployment fails:\x1b[0m`);
    console.log(`  pnpm db:restore backups/${filename}\n`);
  } catch (err) {
    db.close();
    console.error('\x1b[31m[Backup Failed]\x1b[0m', err);
    process.exit(1);
  }
}

runBackup();
