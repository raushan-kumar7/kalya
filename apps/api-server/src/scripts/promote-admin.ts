import { createDbClient, eq, schema } from '@kalya/db';
import { dbEnv } from '@kalya/env';

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
    console.error('❌ Error: --email argument is required.');
    console.log('Usage: pnpm admin:promote --email <email> [--role SUPER_ADMIN|ADMIN|USER]');
    process.exit(1);
  }

  if (!['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
    console.error(`❌ Error: Invalid role "${role}". Must be USER, ADMIN, or SUPER_ADMIN.`);
    process.exit(1);
  }

  console.log(`Connecting to database at: ${dbEnv.url}`);
  const db = createDbClient(dbEnv.url);

  // Find user by email
  const existingUsers = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, email))
    .limit(1);

  if (existingUsers.length === 0) {
    console.error(`❌ Error: No user found with email "${email}".`);
    const allUsers = await db
      .select({ email: schema.user.email, name: schema.user.name, role: schema.user.role })
      .from(schema.user)
      .limit(10);
    if (allUsers.length > 0) {
      console.log('\nRegistered users found in database:');
      for (const u of allUsers) {
        console.log(` - ${u.email} (${u.name}) [Role: ${u.role}]`);
      }
    } else {
      console.log('Database currently has no registered users.');
    }
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
      description: `User ${targetUser.email} role updated from ${previousRole} to ${role} via CLI bootstrap script`,
      status: 'SUCCESS',
      metadata: {
        previousRole,
        newRole: role,
        source: 'CLI',
      },
    });
  } catch (err) {
    console.warn('⚠️ Warning: Could not write audit log entry:', err);
  }

  console.log(
    `\n🎉 Success! User ${targetUser.name} (${targetUser.email}) is now assigned role: [${role}] (Status: ACTIVE).`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
