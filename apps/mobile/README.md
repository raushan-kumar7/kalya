# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

import type { Config } from 'tailwindcss';

const config: Config = {
// Support both React Native (NativeWind v4) and Web
content: [
'./App.{js,jsx,ts,tsx}',
'./src/**/\*.{js,jsx,ts,tsx}',
'./apps/**/_.{js,jsx,ts,tsx}',
'./packages/\**/_.{js,jsx,ts,tsx}',
],
presets: [require('nativewind/preset')],
darkMode: 'class',
theme: {
extend: {
colors: {
kalya: {
/* Brand Primitives */
primary: {
DEFAULT: '#0d3e26', // Sovereign Emerald
dark: '#072617', // Vault Night
light: '#1b5e3a', // Forest Green
muted: '#257c4c',
},
gold: {
DEFAULT: '#d4af37', // Radiant Metallic Gold
warm: '#b8912e', // Burnished Deep Gold
soft: '#fdf3cd', // Champagne Gold Shimmer
dark: '#9a741c',
},
mint: {
DEFAULT: '#a3e6be', // Lucid Mint Sage
light: '#edfdf2', // Base Mint Canvas Wash
subtle: '#e1f7ea',
},
canvas: '#edfdf2',

          /* Standard / Solid UI Colors */
          surface: {
            DEFAULT: '#ffffff',
            subtle: '#f4fcf7',
            muted: '#e7f8ec',
            card: '#ffffff',
            raised: '#ffffff',
            dark: '#072617',
          },
          text: {
            primary: '#082919',
            secondary: '#2d5e46',
            tertiary: '#5d8a72',
            accent: '#9a741c',
            inverse: '#ffffff',
          },
          border: {
            subtle: '#cde8d7',
            DEFAULT: '#b2dbc0',
            strong: '#0d3e26',
            accent: '#d4af37',
          },

          /* Financial 50/30/20 & Flow Allocation */
          needs: '#0d3e26',
          wants: '#d4af37',
          savings: '#2d7a50',
          inflow: '#1b8a51',
          outflow: '#c83535',

          /* Liquid UI Refractive & Translucent Glass Tokens */
          glass: {
            'ultra-thin': 'rgba(255, 255, 255, 0.40)',
            base: 'rgba(255, 255, 255, 0.65)',
            thick: 'rgba(255, 255, 255, 0.82)',
            emerald: 'rgba(13, 62, 38, 0.88)',
            'emerald-dark': 'rgba(7, 38, 23, 0.95)',
            gold: 'rgba(212, 175, 55, 0.12)',
            'gold-strong': 'rgba(212, 175, 55, 0.25)',
            border: 'rgba(255, 255, 255, 0.65)',
            'border-emerald': 'rgba(255, 255, 255, 0.18)',
            'border-gold': 'rgba(212, 175, 55, 0.35)',
          },
        },
      },
      fontFamily: {
        outfit: ['Outfit-Regular', 'sans-serif'],
        'outfit-medium': ['Outfit-Medium', 'sans-serif'],
        'outfit-semibold': ['Outfit-SemiBold', 'sans-serif'],
        'outfit-bold': ['Outfit-Bold', 'sans-serif'],
      },
      borderRadius: {
        'kalya-xs': '6px',
        'kalya-sm': '10px',
        'kalya-md': '16px',
        'kalya-lg': '24px',
        'kalya-xl': '32px',
        'kalya-pill': '9999px',
      },
      boxShadow: {
        /* Standard Solid Elevation */
        'kalya-card': '0 2px 8px rgba(13, 62, 38, 0.05)',
        'kalya-elevated': '0 8px 24px rgba(13, 62, 38, 0.08)',
        'kalya-floating': '0 16px 40px rgba(13, 62, 38, 0.12)',

        /* Liquid UI Specular Depth & Glass Glows */
        'liquid-float': '0 14px 34px -8px rgba(13, 62, 38, 0.10), 0 4px 12px -2px rgba(13, 62, 38, 0.04)',
        'liquid-dock': '0 20px 48px -10px rgba(13, 62, 38, 0.18), 0 6px 16px -2px rgba(13, 62, 38, 0.06)',
        'liquid-emerald': '0 22px 50px -12px rgba(7, 38, 23, 0.45)',
        'liquid-inner-specular': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.75)',
        'liquid-inner-dual': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 1px 0 rgba(13, 62, 38, 0.05)',
      },
      backdropBlur: {
        subtle: '12px',
        standard: '20px',
        dense: '32px',
        deep: '48px',
      },
    },

},
plugins: [],
};

export default config;

# @kalya/mobile: Offline Schema (Final)

Local SQLite schema for the offline-first mobile app. It reuses the column helpers from `packages/db` and mirrors the backend tables without any foreign keys to `user`.

## 1. Scope: 8 tables

| Table           | Source          | Purpose                      |
| --------------- | --------------- | ---------------------------- |
| `bucket`        | copy of backend | 50/30/20 buckets             |
| `category`      | copy of backend | expense categories           |
| `income`        | copy of backend | monthly income               |
| `budget`        | copy of backend | budget per bucket and income |
| `expense`       | copy of backend | main offline write path      |
| `goal`          | copy of backend | financial goals              |
| `sync_outbox`   | mobile only     | pending writes               |
| `sync_metadata` | mobile only     | sync cursor and state        |

Later, add `split_contact_member` and `split_expense` (10 tables), then `digital_asset` and `equity_asset` (12 tables). They follow the same pattern.

**Not stored locally:** `user`, `session`, `account`, `splitInvitation`, `alert`, `notificationPreference`, `pushSubscription`, `monthlySummary`, `jobQueue`, `auditLogs`, `contactInquiries`, `contactInquiryReplies`. These are server-driven, so fetch them online with React Query.

## 2. Reusing `packages/db` helpers

`_columns.ts` only imports `drizzle-orm` and `@kalya/utils`, so it is safe on the device. `_user-ref.ts` is **not** safe, because `userIdCol()` has `.references(() => user.id)` and the `user` table does not exist locally.

Add a subpath export in `packages/db/package.json` (adjust the path if `_columns.ts` lives in `src/schemas/`):

```json
"./columns": {
  "types": "./src/_columns.ts",
  "import": "./src/_columns.ts",
  "default": "./src/_columns.ts"
}
```

Add the matching path in `apps/mobile/tsconfig.json`:

```json
"paths": { "@kalya/db/columns": ["../../packages/db/src/_columns.ts"] }
```

## 3. Folder layout

```
apps/mobile/src/libs/db/
  client.ts
  sync-meta.ts
  schema/
    local-columns.ts
    finance.ts      # bucket, category, income, budget, expense, goal
    outbox.ts       # sync_outbox, sync_metadata
    index.ts
apps/mobile/drizzle.config.ts
```

## 4. `schema/local-columns.ts`

```typescript
import { text } from 'drizzle-orm/sqlite-core';
import { nullableTimestamp } from '@kalya/db/columns';

/** Owning user. Plain column: no FK, because there is no local user table. */
export const localUserIdCol = () => text('user_id').notNull();

/** Soft-delete marker. Required so delta sync can propagate deletes. */
export const deletedAtCol = () => nullableTimestamp('deleted_at');
```

## 5. `schema/finance.ts`

Same columns as the backend, with two differences: `userId` has no foreign key, and every table has `deletedAt`. All `*_id` columns are plain text with no `.references()`, because a pull can deliver a child row before its parent.

```typescript
import { index, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { boolCol, idCol, isoDate, money, timestamps, uuidCol } from '@kalya/db/columns';
import { deletedAtCol, localUserIdCol } from './local-columns';

export const bucket = sqliteTable(
  'bucket',
  {
    id: idCol(),
    userId: localUserIdCol(),
    key: text('key').notNull(),
    label: text('label').notNull(),
    origin: text('origin', { enum: ['built-in', 'custom'] }).notNull(),
    targetPercent: real('target_percent'),
    color: text('color'),
    icon: text('icon'),
    ...timestamps(),
    deletedAt: deletedAtCol(),
  },
  (t) => [
    index('bucket_user_idx').on(t.userId),
    index('bucket_user_updated_idx').on(t.userId, t.updatedAt),
  ]
);

export const category = sqliteTable(
  'category',
  {
    id: idCol(),
    userId: localUserIdCol(),
    bucketId: uuidCol('bucket_id').notNull(),
    key: text('key').notNull(),
    label: text('label').notNull(),
    origin: text('origin', { enum: ['built-in', 'custom'] }).notNull(),
    color: text('color').notNull(),
    icon: text('icon').notNull(),
    ...timestamps(),
    deletedAt: deletedAtCol(),
  },
  (t) => [
    index('category_user_bucket_idx').on(t.userId, t.bucketId),
    index('category_user_updated_idx').on(t.userId, t.updatedAt),
  ]
);

export const income = sqliteTable(
  'income',
  {
    id: idCol(),
    userId: localUserIdCol(),
    creditDate: text('credit_date').notNull(),
    month: text('month').notNull(), // "YYYY-MM"
    salary: money('salary', { notNull: true, default: 0 }),
    other: money('other', { notNull: true, default: 0 }),
    previousMonthLeft: money('previous_month_left', { notNull: true, default: 0 }),
    totalIncome: money('total_income', { notNull: true }),
    ...timestamps(),
    deletedAt: deletedAtCol(),
  },
  (t) => [
    index('income_user_month_idx').on(t.userId, t.month),
    index('income_user_updated_idx').on(t.userId, t.updatedAt),
  ]
);

export const budget = sqliteTable(
  'budget',
  {
    id: idCol(),
    userId: localUserIdCol(),
    bucketId: uuidCol('bucket_id').notNull(),
    incomeId: uuidCol('income_id').notNull(),
    period: text('period', {
      enum: ['monthly', 'quarterly', 'annual', 'financial_year'],
    })
      .notNull()
      .default('monthly'),
    amount: money('amount', { notNull: true }),
    alertThresholdAmber: real('alert_threshold_amber').notNull().default(80),
    alertThresholdRed: real('alert_threshold_red').notNull().default(100),
    rollover: boolCol('rollover', false),
    status: text('status', { enum: ['under', 'warning', 'over'] })
      .notNull()
      .default('under'),
    ...timestamps(),
    deletedAt: deletedAtCol(),
  },
  (t) => [
    index('budget_user_bucket_income_idx').on(t.userId, t.bucketId, t.incomeId),
    index('budget_user_updated_idx').on(t.userId, t.updatedAt),
  ]
);

export const expense = sqliteTable(
  'expense',
  {
    id: idCol(),
    userId: localUserIdCol(),
    date: isoDate('date').notNull(),
    categoryId: uuidCol('category_id').notNull(),
    description: text('description').notNull(),
    amount: money('amount', { notNull: true }),
    paymentMethod: text('payment_method', {
      enum: ['upi', 'phonepe', 'paytm', 'gpay', 'debit_card', 'credit_card'],
    }).default('upi'),
    isSplit: boolCol('is_split', false),
    paidBy: uuidCol('paid_by'), // split_contact_member.id (table not local in the core scope)
    yourShare: money('your_share', { notNull: true }),
    splitType: text('split_type', {
      enum: ['equal', 'exact', 'percentage', 'shares'],
    })
      .notNull()
      .default('equal'),
    ...timestamps(),
    deletedAt: deletedAtCol(),
  },
  (t) => [
    index('expense_user_category_split_idx').on(t.userId, t.categoryId, t.isSplit),
    index('expense_user_date_idx').on(t.userId, t.date),
    index('expense_user_updated_idx').on(t.userId, t.updatedAt),
  ]
);

export const goal = sqliteTable(
  'goal',
  {
    id: idCol(),
    userId: localUserIdCol(),
    bucketId: uuidCol('bucket_id').notNull(),
    name: text('name').notNull(),
    targetAmount: money('target_amount', { notNull: true }),
    targetDate: isoDate('target_date').notNull(),
    currentProgress: money('current_progress', { notNull: true, default: 0 }),
    monthlyContributionPlan: money('monthly_contribution_plan', { notNull: true, default: 0 }),
    status: text('status', {
      enum: ['not_started', 'in_progress', 'on_track', 'behind', 'completed', 'paused'],
    })
      .notNull()
      .default('not_started'),
    ...timestamps(),
    deletedAt: deletedAtCol(),
  },
  (t) => [
    index('goal_user_status_bucket_idx').on(t.userId, t.status, t.bucketId),
    index('goal_user_updated_idx').on(t.userId, t.updatedAt),
  ]
);

export type BucketRow = typeof bucket.$inferSelect;
export type CategoryRow = typeof category.$inferSelect;
export type IncomeRow = typeof income.$inferSelect;
export type BudgetRow = typeof budget.$inferSelect;
export type ExpenseRow = typeof expense.$inferSelect;
export type GoalRow = typeof goal.$inferSelect;
```

## 6. `schema/outbox.ts`

```typescript
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { idCol, nullableTimestamp, timestamps, updatedAt } from '@kalya/db/columns';

export const OUTBOX_ENTITY_TYPES = [
  'bucket',
  'category',
  'income',
  'budget',
  'expense',
  'goal',
  'split_contact_member',
  'split_expense',
  'digital_asset',
  'equity_asset',
] as const;
export const OUTBOX_OPERATIONS = ['create', 'update', 'delete'] as const;
export const OUTBOX_STATUSES = ['pending', 'processing', 'failed'] as const;

export type OutboxEntityType = (typeof OUTBOX_ENTITY_TYPES)[number];
export type OutboxOperation = (typeof OUTBOX_OPERATIONS)[number];
export type OutboxStatus = (typeof OUTBOX_STATUSES)[number];

export const syncOutbox = sqliteTable(
  'sync_outbox',
  {
    id: idCol(), // also sent as the Idempotency-Key header
    entityType: text('entity_type', { enum: OUTBOX_ENTITY_TYPES }).notNull(),
    entityId: text('entity_id').notNull(),
    operation: text('operation', { enum: OUTBOX_OPERATIONS }).notNull(),
    payload: text('payload').notNull(), // JSON string shaped for the API
    status: text('status', { enum: OUTBOX_STATUSES }).notNull().default('pending'),
    attempts: integer('attempts').notNull().default(0),
    lastError: text('last_error'),
    nextRetryAt: nullableTimestamp('next_retry_at'),
    ...timestamps(),
  },
  (t) => [
    index('sync_outbox_status_created_idx').on(t.status, t.createdAt),
    index('sync_outbox_entity_idx').on(t.entityType, t.entityId),
  ]
);

export const syncMetadata = sqliteTable('sync_metadata', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: updatedAt(),
});

export const SYNC_META_KEYS = {
  LAST_SYNC_CURSOR: 'last_sync_cursor', // server `serverTime` from last pull (ISO)
  LAST_SYNC_AT: 'last_sync_at', // device time, UI only
  USER_ID: 'user_id', // owner of local data
  SYNC_VERSION: 'sync_version', // forces resync after breaking changes
} as const;

export type SyncMetaKey = (typeof SYNC_META_KEYS)[keyof typeof SYNC_META_KEYS];
export type SyncOutboxRow = typeof syncOutbox.$inferSelect;
export type SyncMetadataRow = typeof syncMetadata.$inferSelect;
```

## 7. `schema/index.ts`, `client.ts`, `drizzle.config.ts`

```typescript
// schema/index.ts
export * from './finance';
export * from './outbox';
```

```typescript
// client.ts
import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const expoDb = openDatabaseSync('kalya_local.db', { enableChangeListener: true });
expoDb.execSync('PRAGMA journal_mode = WAL;');

export { schema };
export const db = drizzle(expoDb, { schema });
export type MobileDatabase = typeof db;
```

```typescript
// drizzle.config.ts (apps/mobile)
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/libs/db/schema/index.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;
```

Run `drizzle-kit generate`, then apply the migrations at startup with `useMigrations(db, migrations)` from `drizzle-orm/expo-sqlite/migrator`. This needs `.sql` support in `metro.config.js` and `babel-plugin-inline-import` in `babel.config.js`.

```typescript
// sync-meta.ts
import { eq } from 'drizzle-orm';
import { db } from './client';
import { syncMetadata, type SyncMetaKey } from './schema/outbox';

export async function getMeta(key: SyncMetaKey) {
  const row = await db.select().from(syncMetadata).where(eq(syncMetadata.key, key)).get();
  return row?.value ?? null;
}

export async function setMeta(key: SyncMetaKey, value: string) {
  const now = new Date();
  await db
    .insert(syncMetadata)
    .values({ key, value, updatedAt: now })
    .onConflictDoUpdate({ target: syncMetadata.key, set: { value, updatedAt: now } });
}
```

## 8. Required backend changes (`packages/db` and `apps/api-server`)

The mobile schema depends on these. Without them delta sync and idempotency cannot work.

1. **Add `deleted_at`** (nullable `timestamp_ms`) to `bucket`, `category`, `income`, `budget`, `expense`, `goal`. Make the DELETE endpoints set it instead of removing the row. Every list query on the server must filter out soft-deleted rows.
2. **Add a changes endpoint**, e.g. `GET /api/v1/sync/changes?since=<iso>`. It returns every row for the user with `updated_at > since`, including soft-deleted ones, plus `serverTime`. Index `(user_id, updated_at)` on each table.
3. **Idempotent creates.** Accept the client-supplied `id` in the body. Insert with `onConflictDoNothing` on `id`. If the row already exists for the same user, return `200` with the existing row. If it belongs to another user, return a conflict.
4. **`Idempotency-Key` handling** for non-create side-effect endpoints, via a stored key table with a `(userId, key)` primary key and cached response.
5. **`generateId` format** must be accepted by the server validators (UUID v4, UUID v7, or whatever `@kalya/utils` produces).

## 9. Rules to keep

- **Money** is integer minor units (paise), as on the backend. Convert only at the UI edge.
- **Dates** like `expense.date` are ISO strings. Only `createdAt`, `updatedAt` and `deletedAt` are `timestamp_ms`. The API sends ISO strings for those, so convert in the entity mappers.
- **Set `createdAt` and `updatedAt` explicitly** in repository functions. The SQL default `unixepoch('subsecond')` needs SQLite 3.42 or newer, and `$onUpdate` only runs through Drizzle.
- **Pull upserts** take the server's `updatedAt` in the `set`, and skip rows that still have a pending outbox entry.
- **Every list query** filters `isNull(deletedAt)`. Use a shared `activeOnly(table)` helper.
- **Writes** go through repository functions that insert the local row and the outbox row in one transaction. Never write to a data table directly from a screen.
- **Outbox success** deletes the row. There is no `synced` status. `failed` rows stay for inspection or a manual retry.
- **Backoff:** on a retryable failure set `nextRetryAt = now + min(2^attempts * 1000, 300000)` ms plus jitter. The worker skips rows whose `nextRetryAt` is in the future.
- **Logout or user switch:** compare `SYNC_META_KEYS.USER_ID` with the signed-in user. If different, wipe all local data tables, `sync_outbox` and `sync_metadata` before syncing, so one user's pending writes are never pushed under another user's token.
- **Crash recovery:** reset rows stuck in `processing` back to `pending` once at app start, not on every sync run.
- **`generateId` in React Native:** if `@kalya/utils` uses Node's `crypto`, Metro will fail. Make it platform-neutral or use `expo-crypto`.
- **Keep schemas aligned:** add a type-level check that each mobile row type matches the backend row type, minus the new `deletedAt`.

## 10. Duplicate-write protection summary

| Duplicate source                             | Prevented by                                           |
| -------------------------------------------- | ------------------------------------------------------ |
| Double tap on Save                           | Disabled button, ID generated once per form            |
| Crash between local insert and outbox insert | Single transaction                                     |
| Overlapping sync runs                        | `running` guard and `processing` status                |
| Response lost, client retries                | Server `onConflictDoNothing` on client ID, returns 200 |
| Side-effect endpoints                        | `Idempotency-Key` table                                |
| Pull returns your own write                  | Upsert by primary key                                  |

## 11. Final checklist

- [ ] `./columns` subpath export and tsconfig path added
- [ ] `deleted_at` added to the 6 backend tables and DELETE endpoints soft-delete
- [ ] `GET /sync/changes` endpoint implemented and indexed
- [ ] Create endpoints idempotent on client `id`
- [ ] `generateId` verified in React Native
- [ ] Mobile schema files created and `drizzle-kit generate` run
- [ ] Migrations applied at app startup
- [ ] Repository layer writes data row and outbox row in one transaction
- [ ] Logout wipes local data and sync state
