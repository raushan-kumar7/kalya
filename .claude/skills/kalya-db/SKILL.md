---
name: kalya-db
description: Manage database schemas, migrations, relations, and queries in packages/db for SQLite using Drizzle ORM. Use this skill whenever the task involves defining tables, adding columns, updating relations, writing Drizzle queries, running drizzle-kit migrations, or inspecting data in db:studio.
---

# Kalya Database Skill (`packages/db`)

Guidelines and best practices for the database package (`@kalya/db`), built with **Drizzle ORM** and **SQLite**.

---

## Directory Map (`packages/db/src`)

```txt
src/
├── index.ts                  # Database client export, operators (eq, and, or, sum), schema re-exports
└── schemas/
    ├── _columns.ts           # Reusable column definitions (idCol, uuidCol, money, isoDate, timestamps...)
    ├── relations.ts          # Centralized Drizzle table relations
    ├── auth/                 # User, session, account, verification tables
    └── finance/              # Assets, buckets, budgets, categories, expenses, splits, alerts
```

---

## Column Standards (`src/schemas/_columns.ts`)

Always reuse standard column helpers to maintain consistency across tables:

| Column Helper              | SQL Type                 | Description                                                                |
| -------------------------- | ------------------------ | -------------------------------------------------------------------------- |
| `idCol()`                  | `text`                   | Primary key with generated ULID/UUID                                       |
| `uuidCol('col_name')`      | `text`                   | Foreign key referencing UUID                                               |
| `money('col_name')`        | `real`                   | Stored as numeric floating point / double, manipulated with `roundMoney()` |
| `isoDate('col_name')`      | `text`                   | Standard ISO 8601 string (`YYYY-MM-DD` or timestamp)                       |
| `boolCol('col_name', def)` | `integer`                | Boolean stored as `0` or `1` (mode: `'boolean'`)                           |
| `timestamps()`             | `createdAt`, `updatedAt` | Auto-managed creation and update timestamps                                |

---

## Workflow: Modifying the Database Schema

1. **Edit or Add Schema File**:
   - Locate the target domain schema in `src/schemas/finance/` or `src/schemas/auth/`.
   - Define table columns using Drizzle's `sqliteTable`.
   - Export `$inferSelect` and `$inferInsert` types.
2. **Update Table Relations**:
   - Add foreign key relations in `src/schemas/relations.ts`.
3. **Re-Export Table**:
   - Ensure table is exported in `src/schemas/finance/index.ts` and `src/schemas/index.ts`.
4. **Generate & Apply Migration**:

   ```bash
   pnpm --filter @kalya/db db:generate
   pnpm --filter @kalya/db db:migrate
   ```

5. **Inspect & Verify**:
   - Run `pnpm --filter @kalya/db db:studio` to visually verify schema changes in Drizzle Studio.

---

## Best Practices & Safety Constraints

- **Foreign Keys**: Always specify an `onDelete` action (`'cascade'`, `'set null'`, or `'restrict'`).
- **Indexes**: Create indexes on all columns commonly used in `WHERE`, `ORDER BY`, or `JOIN` conditions (e.g. `userId`, `date`, `categoryId`).
- **Data Isolation**: Never omit `userIdCol()` on personal finance tables. Every user must have completely isolated records.
- **Migration Tracking**: Never delete or manually tamper with files inside `drizzle/` migrations directory. Always use `drizzle-kit generate`.
