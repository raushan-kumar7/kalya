---
name: kalya-web
description: Build and modify the Kalya Next.js 16 web app in apps/web. Use this skill whenever the task involves pages, routes, layouts, React components, forms, Tailwind styling, TanStack Query hooks, Zustand stores, auth flows, or calling the API from the frontend — even if the user only says "add a screen", "make a form", "fix this UI", or "hook this up to the backend".
---

# Kalya Web Skill (`apps/web`)

Workflows and architectural standards for `apps/web` (Next.js 16 App Router, Turbopack, Tailwind CSS v4, TanStack Query, Zustand, React Hook Form + Zod).

---

## Monorepo Context

| Path                   | Purpose                                                     |
| ---------------------- | ----------------------------------------------------------- |
| `apps/web`             | Next.js 16 web frontend                                     |
| `apps/api-server`      | Fastify backend API (port 3600)                             |
| `packages/db`          | Drizzle ORM SQLite database schema + migrations             |
| `packages/validations` | Shared Zod validation schemas                               |
| `packages/types`       | Shared TypeScript interfaces and DTOs                       |
| `packages/env`         | Validated environment variables                             |
| `packages/utils`       | Shared utility functions (`roundMoney`, `formatDate`, etc.) |

> **Critical Rule**: Always import shared code via workspace packages (`@kalya/validations`, `@kalya/types`, `@kalya/utils`, `@kalya/env`). **Never** deep-import from another package's `src/` directory.

---

## Directory Conventions (`apps/web/src`)

```txt
src/
├── app/                  # Next.js App Router (layout.tsx, page.tsx, loading.tsx, error.tsx)
│   ├── (auth)/           # Unauthenticated flows (login, register, forgot-password)
│   └── (dashboard)/      # Authenticated user dashboard
├── components/
│   ├── ui/               # Core design system primitives (Button, Input, Combobox, Modal, Avatar...)
│   ├── shared/           # Cross-feature compounds (EntityCard, KpiGrid, FooterRow...)
│   └── forms/            # Domain-specific interactive forms (finances, settings, profile...)
├── hooks/                # TanStack Query & domain custom hooks (users, finances, auth...)
├── libs/
│   ├── api/              # HTTP client with interceptors (the ONLY place network calls originate)
│   ├── run-actions.ts    # Toast-integrated async action executor
│   └── utils.ts          # UI utility helpers (cn, clsx, tailwind-merge)
└── stores/               # Lightweight client/session Zustand stores (auth, users, theme)
```

> **Warning**: Do NOT create `src/pages/`. Next.js 16 uses the App Router (`src/app/`). Creating `src/pages/` breaks routing.

---

## Core Development Rules

1. **Server Components by Default**:
   - Keep page scaffolds (`page.tsx`) and layout wrappers as React Server Components.
   - Add `"use client"` only when components need browser APIs, React state (`useState`, `useEffect`), event handlers, or TanStack Query hooks.
   - Push `"use client"` as deep into the component tree as possible.

2. **All Network Requests via `src/libs/api`**:
   - Never use raw `fetch` or `axios` inside UI components.
   - Always use the centralized HTTP client in `src/libs/api` (`http.get`, `http.post`, `http.patch`, `http.delete`).
   - Base API URL is configured via `process.env.NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3600`).

3. **Server State = TanStack Query**:
   - Wrap all API queries and mutations in typed hooks located in `src/hooks/`.
   - Never copy server data into Zustand stores.
   - Use deterministic query key factories (`queryKeys.all`, `queryKeys.detail(id)`).
   - Invalidate dependent query keys in `onSuccess` handlers of mutations.

4. **Forms via React Hook Form + Zod**:
   - Always validate forms using `zodResolver(Schema)`.
   - Reuse shared schemas from `@kalya/validations` whenever possible.
   - Infer form value types using `z.infer<typeof Schema>`.
   - Handle loading states with `form.formState.isSubmitting`.

5. **Tailwind CSS v4 Styling Standards**:
   - Mobile-first responsive design (`base` → `sm:` → `md:` → `lg:`).
   - Every background, border, and text token must support dark mode (`dark:bg-...`, `dark:border-...`, `dark:text-...`).
   - Use predefined semantic color tokens (`primary`, `accent`, `surface-raised`, `text-primary`, `text-muted`, `border`).
   - Use `lucide-react` for icons and standard sizing classes (e.g. `size-4`, `h-5 w-5`).

6. **TypeScript Strictness**:
   - Zero `any` types.
   - Avoid non-null assertions (`!`) unless explicitly documented with a narrowing rationale.
   - Explicit return types on all exported functions, hooks, and services.

---

## Workflow: Building a Feature Page

1. Create `src/app/(dashboard)/<feature>/page.tsx` as a Server Component.
2. Provide companion `loading.tsx` and `error.tsx` files for streaming and fallback boundaries.
3. Build interactive components under `src/components/dashboard/<feature>/` marked with `"use client"`.
4. Wrap API data fetching with TanStack Query hooks in `src/hooks/<feature>/`.
5. Verify mobile layout (375px), light mode, and dark mode.

---

## Workflow: Building a Form Modal

```tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateSplitContactMemberSchema,
  type CreateSplitContactMemberInput,
} from '@kalya/validations';
import { FinanceFormModal } from '../modal';
import { Input } from '@/components/ui';

export function ContactForm({ open, onOpenChange, onSave }) {
  const form = useForm<CreateSplitContactMemberInput>({
    resolver: zodResolver(CreateSplitContactMemberSchema as any),
    defaultValues: { name: '', email: '', phone: '', is_linked: false },
  });

  const handleSubmit = async (values: CreateSplitContactMemberInput) => {
    await onSave(values);
    onOpenChange(false);
  };

  return (
    <FinanceFormModal
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      title="Add Contact"
      onSubmit={handleSubmit}
      isSubmitting={form.formState.isSubmitting}
    >
      <Input label="Name" required {...form.register('name')} />
      <Input label="Email" type="email" {...form.register('email')} />
      <Input label="Phone" {...form.register('phone')} />
    </FinanceFormModal>
  );
}
```

---

## Verification & Commands

Run from repository root:

```bash
# Typecheck web app
pnpm --filter @kalya/web exec tsc --noEmit

# Lint web app
pnpm --filter @kalya/web lint

# Run development server
pnpm --filter @kalya/web dev
```
