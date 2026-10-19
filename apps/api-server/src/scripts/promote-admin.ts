import { createDbClient, eq, schema } from '@kalya/db';
import { dbEnv } from '@kalya/env';
import { log } from '@/logger';

/**
 * CLI Utility to promote or assign administrative roles to a user account.
 *
 * Usage:
 *   pnpm --filter @kalya/api-server admin:promote --email admin@example.com --role SUPER_ADMIN
 */
type AdminTargetRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

async function main() {
  const args = process.argv.slice(2);
  let email = '';
  let role: AdminTargetRole = 'SUPER_ADMIN';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
      email = args[i + 1].trim();
      i++;
    } else if (args[i] === '--role' && args[i + 1]) {
      role = args[i + 1].trim().toUpperCase() as AdminTargetRole;
      i++;
    }
  }

  if (!email) {
    log.error('Error: --email argument is required.');
    log.info('Usage: pnpm admin:promote --email <email> [--role SUPER_ADMIN|ADMIN|USER]');
    process.exit(1);
  }

  if (!['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
    log.error(`Error: Invalid role "${role}". Must be USER, ADMIN, or SUPER_ADMIN.`);
    process.exit(1);
  }

  log.info(`Connecting to database at: ${dbEnv.url}`);
  const db = createDbClient(dbEnv.url);

  // Find user by email
  const existingUsers = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, email))
    .limit(1);

  if (existingUsers.length === 0) {
    log.error('Error: No user found matching the provided email.');
    process.exit(1);
  }

  const targetUser = existingUsers[0];
  const previousRole = targetUser.role;

  // Update user role and status
  await db
    .update(schema.user)
    .set({
      role,
      status: 'ACTIVE',
      bannedAt: null,
      banReason: null,
    })
    .where(eq(schema.user.id, targetUser.id));

  // Record audit log entry
  try {
    await db.insert(schema.auditLogs).values({
      actorId: targetUser.id,
      actorEmail: targetUser.email,
      actorRole: role,
      action: 'USER_ROLE_PROMOTED_CLI',
      entityType: 'USER',
      entityId: targetUser.id,
      severity: 'WARN',
      description: `User role updated from ${previousRole} to ${role} via CLI bootstrap script`,
      status: 'SUCCESS',
      metadata: {
        previousRole,
        newRole: role,
        source: 'CLI',
      },
    });
  } catch (err) {
    log.warn('Warning: Could not write audit log entry', { error: String(err) });
  }

  log.info(`🎉 Success! User role successfully updated to: [${role}] (Status: ACTIVE).`);
  process.exit(0);
}

main().catch((err) => {
  log.error('Fatal execution error:', { error: String(err) });
  process.exit(1);
});
