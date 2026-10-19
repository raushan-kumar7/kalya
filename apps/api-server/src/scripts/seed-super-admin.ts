import { createDbClient, eq, or, schema, type DatabaseClient } from '@kalya/db';
import { dbEnv, env } from '@kalya/env';
import { generateId } from '@kalya/utils';
import { hashPassword } from 'better-auth/crypto';
import { log } from '@/logger';

export interface SeedSuperAdminOptions {
  email?: string;
  password?: string;
  name?: string;
  username?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  db?: DatabaseClient;
}

/**
 * Seeds a default Super-Admin user and credential account into the database if none exists.
 * Idempotent: If a super-admin user already exists, it safely exits without duplicating.
 *
 * Uses:
 * - @kalya/env for validated configuration (`env.superAdmin`)
 * - @kalya/utils for ID generation (`generateId()`)
 * - better-auth/crypto (`hashPassword()`) matching auth.instance.ts credential authentication
 */
export async function seedSuperAdmin(options: SeedSuperAdminOptions = {}): Promise<void> {
  const firstName = options.firstName || env.superAdmin.firstName || 'Admin';
  const middleName = options.middleName ?? env.superAdmin.middleName ?? '';
  const lastName = options.lastName || env.superAdmin.lastName || 'User';
  const username = (options.username || env.superAdmin.username || 'admin').trim().toLowerCase();
  const email = (options.email || env.superAdmin.email || 'admin@example.com').trim().toLowerCase();
  const password = (options.password || env.superAdmin.password || '').trim();
  const name =
    options.name ||
    [firstName, middleName, lastName].filter((s) => Boolean(s && s.trim())).join(' ');

  const db = options.db || createDbClient(dbEnv.url);

  // 1. Check if any SUPER_ADMIN already exists in the system
  const [existingSuperAdmin] = await db
    .select({ id: schema.user.id, email: schema.user.email, role: schema.user.role })
    .from(schema.user)
    .where(eq(schema.user.role, 'SUPER_ADMIN'))
    .limit(1);

  if (existingSuperAdmin) {
    log.info('[Seed] Super-Admin user already exists. Skipping bootstrap.');
    return;
  }

  // 2. If password is not provided or shorter than 8 characters, skip automatic seeding
  if (!password || password.length < 8) {
    log.info(
      '[Seed] Super-Admin password not configured or shorter than 8 characters (KALYA_SUPER_ADMIN.PASSWORD). Skipping automatic bootstrap.'
    );
    return;
  }

  // 3. Check if a user with target email or username already exists (e.g. from previous run with USER role)
  const [existingUser] = await db
    .select()
    .from(schema.user)
    .where(or(eq(schema.user.email, email), eq(schema.user.username, username)))
    .limit(1);

  const hashedPassword = await hashPassword(password);
  const now = new Date();

  if (existingUser) {
    // Promote existing user to SUPER_ADMIN
    await db
      .update(schema.user)
      .set({
        name,
        first_name: firstName,
        middle_name: middleName || null,
        last_name: lastName,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        updatedAt: now,
      })
      .where(eq(schema.user.id, existingUser.id));

    // Ensure credential account exists with matching password
    const [existingAccount] = await db
      .select()
      .from(schema.account)
      .where(eq(schema.account.userId, existingUser.id))
      .limit(1);

    if (existingAccount) {
      await db
        .update(schema.account)
        .set({
          password: hashedPassword,
          updatedAt: now,
        })
        .where(eq(schema.account.id, existingAccount.id));
    } else {
      await db.insert(schema.account).values({
        id: generateId(),
        accountId: existingUser.id,
        providerId: 'credential',
        userId: existingUser.id,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      });
    }

    log.info('[Seed] Successfully promoted existing user to SUPER_ADMIN.');
    return;
  }

  // 3. Insert brand new SUPER_ADMIN user with @kalya/utils generateId()
  const userId = generateId();

  await db.insert(schema.user).values({
    id: userId,
    name,
    email,
    username,
    displayUsername: username,
    first_name: firstName,
    middle_name: middleName || null,
    last_name: lastName,
    emailVerified: true,
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    sync_status: 'SYNCED',
    createdAt: now,
    updatedAt: now,
  });

  // 4. Insert Better-Auth credential account with @kalya/utils generateId()
  await db.insert(schema.account).values({
    id: generateId(),
    accountId: userId,
    providerId: 'credential',
    userId,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  });

  // 5. Record initial bootstrap audit log
  try {
    await db.insert(schema.auditLogs).values({
      actorId: userId,
      actorEmail: email,
      actorRole: 'SUPER_ADMIN',
      action: 'SUPER_ADMIN_SEEDED',
      entityType: 'USER',
      entityId: userId,
      severity: 'WARN',
      description: 'Default Super-Admin account bootstrap completed',
      status: 'SUCCESS',
      metadata: {
        email,
        username,
        role: 'SUPER_ADMIN',
        source: 'DOCKER_BOOTSTRAP',
      },
    });
  } catch (err) {
    log.warn('[Seed] Warning: Could not write seed audit log:', { error: String(err) });
  }

  log.info('[Seed] ✅ Default Super-Admin user seeded successfully (Role: SUPER_ADMIN).');
}

// CLI entrypoint
if (process.argv[1] && process.argv[1].includes('seed-super-admin')) {
  seedSuperAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      log.error('[Seed] Fatal error seeding super-admin:', { error: String(err) });
      process.exit(1);
    });
}
