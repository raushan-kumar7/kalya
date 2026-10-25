import { openDatabaseSync } from 'expo-sqlite';
import * as serverSchema from '@kalya/db/schema';
import * as localschema from './schema/outbox';
import { APP_CONFIG } from '@/configs';
import { mobileDrizzle } from '@kalya/db';

export const schema = { ...serverSchema, ...localschema };

const expoDb = openDatabaseSync(APP_CONFIG.database.url, { enableChangeListener: true });

expoDb.execSync('PRAGMA journal_mode = WAL;');
expoDb.execSync('PRAGMA foreign_keys = ON;');

export const db = mobileDrizzle(expoDb, { schema });
export type MobileDatabase = typeof db;
