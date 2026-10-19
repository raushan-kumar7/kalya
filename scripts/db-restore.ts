import fs from 'node:fs';
import path from 'node:path';
import { Database } from '../packages/db/src';
import { dbEnv } from '../packages/env/src';

async function runRestore() {
  const args = process.argv.slice(2);
  const targetFile = args[0];

  if (!targetFile) {
    console.error('\n\x1b[31m[Restore Error]\x1b[0m Please specify the backup file to restore.');
    console.error('Usage: pnpm db:restore <path-to-backup.sqlite>\n');
    console.error('Example: pnpm db:restore backups/kalya_backup_20261019_193000.sqlite\n');
    process.exit(1);
  }

  const root = process.cwd();
  const resolvedBackupPath = path.isAbsolute(targetFile)
    ? targetFile
    : path.resolve(root, targetFile);

  if (!fs.existsSync(resolvedBackupPath)) {
    console.error(
      `\x1b[31m[Restore Error]\x1b[0m Backup file does not exist at: ${resolvedBackupPath}`
    );
    process.exit(1);
  }

  const resolvedDbPath = dbEnv.url;
  const backupsDir = process.env.BACKUP_DIR || path.join(root, 'backups');

  console.log('\n\x1b[31m⚠️  Kalya Database Disaster Recovery — Snapshot Restoration\x1b[0m');
  console.log(`Source Backup: ${resolvedBackupPath}`);
  console.log(`Target Live DB: ${resolvedDbPath}`);

  // 1. Verify source backup is a valid SQLite file
  try {
    const testDb = new Database(resolvedBackupPath, { readonly: true });
    testDb.prepare('SELECT 1').get();
    testDb.close();
  } catch (err) {
    console.error(
      '\x1b[31m[Invalid Backup File]\x1b[0m The specified file is not a valid SQLite database:',
      err
    );
    process.exit(1);
  }

  // 2. Take automatic pre-restore safety snapshot of the live DB
  if (fs.existsSync(resolvedDbPath)) {
    const safetyFilename = `pre_restore_safety_${Date.now()}.sqlite`;
    const safetyPath = path.join(backupsDir, safetyFilename);
    console.log(`Creating emergency pre-restore snapshot: ${safetyFilename}...`);
    try {
      const liveDb = new Database(resolvedDbPath);
      try {
        liveDb.pragma('wal_checkpoint(TRUNCATE)');
      } catch {
        // Non-fatal
      }
      await liveDb.backup(safetyPath);
      liveDb.close();
      console.log(`✔ Safety snapshot saved to ${safetyPath}`);
    } catch {
      // If live DB was corrupt, copy file directly as emergency
      fs.copyFileSync(resolvedDbPath, safetyPath);
    }
  }

  // 3. Overwrite live DB with backup
  try {
    fs.copyFileSync(resolvedBackupPath, resolvedDbPath);

    // Remove any leftover -wal or -shm files from prior session to prevent stale page corruption
    const walFile = `${resolvedDbPath}-wal`;
    const shmFile = `${resolvedDbPath}-shm`;
    if (fs.existsSync(walFile)) fs.unlinkSync(walFile);
    if (fs.existsSync(shmFile)) fs.unlinkSync(shmFile);

    // Verify restored DB connects cleanly and re-enable WAL
    const restoredDb = new Database(resolvedDbPath);
    restoredDb.pragma('journal_mode = WAL');
    restoredDb.pragma('foreign_keys = ON');
    const tableCount = restoredDb
      .prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table'")
      .get() as { count: number };
    restoredDb.close();

    console.log('\n\x1b[32m✔ Database successfully restored!\x1b[0m');
    console.log(`  Active tables restored: ${tableCount?.count ?? 0}`);
    console.log(`  Live DB path: ${resolvedDbPath}\n`);
  } catch (err) {
    console.error('\x1b[31m[Restoration Failed]\x1b[0m', err);
    process.exit(1);
  }
}

runRestore();
