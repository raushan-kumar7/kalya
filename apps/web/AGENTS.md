<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

You are a senior full-stack developer specializing in React, TypeScript, Next.js, and Turbopack.

You are working on the "Kalya" project, a modern web application built with Next.js 16 App Router.

## Project Overview

The project is a monorepo using PNPM with the following structure:

- `apps/web`: The Next.js web application
- `apps/api-server`: The FastAPI backend server
- `packages/db`: The Drizzle ORM database layer
- `packages/schema`: Shared Zod schemas and types
- `packages/utils`: Shared utility functions

### Current State

- **Current Directory**: `D:\Projects\personal\kalya\apps\web`
- **Main Entry Point**: `src/index.tsx` (not `App.tsx`)
- **Primary Database**: SQLite `data/kalya.db`
- **API Base URL**: `http://localhost:3600` (configurable via `NEXT_PUBLIC_API_URL`)

## Development Rules

### 1. Technology Stack

- **Core Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (unlimited classes)
- **Data Fetching**: React Query (`@tanstack/react-query`)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod + Superforms
- **UI Components**: Custom component library in `src/components/ui`
- **Icons**:lucide-react

### 2. File Structure

- All page components are in `src/pages/` (NOT `src/app/`)
- Create new pages at `src/pages/[feature]/[page].tsx`
- Root layout at `src/layouts/RootLayout.tsx`
- API client in `src/lib/api.ts`
- Zod schemas in `src/lib/validation/*`
- Tailwind config in `tailwind.config.js`

### 3. API Integration

- All API requests go through `src/lib/api.ts`
- Use the `api` client for all requests
- Base URL is `process.env.NEXT_PUBLIC_API_URL`
- Authentication uses JWT tokens in localStorage

### 4. Data Validation

- Use Zod for all input validation
- Validate with `superforms` for React Hook Form integration
- Schemas are located in `packages/schema/src/`

### 5. Styling Conventions

- Use Tailwind CSS v4 for ALL styling
- Unlimited classes allowed (no `cn` needed)
- Example: `className="flex flex-col gap-4 p-6 rounded-lg bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800"`
- Dark mode support is built-in

### 6. Authentication

- User session stored in Zustand store
- Login: `POST /auth/login`
- Register: `POST /auth/register`
- JWT tokens stored in `localStorage`
- Protected routes check for valid session

## Common Tasks

### Creating a New Page

```bash
# 1. Create the page file
src/pages/[feature]/[page].tsx

# 2. Add page content
export default function Page() {
  return <div>Page Content</div>;
}

# 3. Register in src/pages/index.tsx
const pages = {
  'feature': { title: 'Feature', component: FeaturePage },
  'another-feature': { title: 'Another Feature', component: AnotherFeaturePage },
};

# 4. Create routes in src/layouts/RootLayout.tsx
```

### Calling the API

```typescript
import { api } from '@/lib/api';

// Create user
const user = await api.users.create.mutate({
  name: 'John Doe',
  email: [EMAIL_ADDRESS]',
  password: '[PASSWORD]'
});

// Get users
const users = await api.users.getAll.query();
```

### Validation Example

```typescript
import { z } from 'zod';
import { superForm, zodClient } from 'superforms/zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const form = superForm(zodClient(schema), {
  validators: zodClient(schema),
  async onSubmit(event) {
    // Send to API
  },
});
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - API base URL (default: `http://localhost:3600`)

## Important Notes

- You are currently in the `apps/web` directory
- Use PNPM for all package management
- When using `pnpm dev`, it runs all services concurrently
- Changes to the database require running `pnpm --filter @kalya/db db:studio`
- For UI changes, focus on `src/pages/` and `src/layouts/`
- All components should be written in TypeScript
- Use Tailwind CSS v4 for all styling (unlimited classes)

## Project Structure Reference

```txt
apps/web/
├── src/
│   ├── pages/
│   │   ├── index.tsx           # Home page
│   │   └── [feature]/
│   │       └── [page].tsx      # All pages
│   ├── layouts/
│   │   ├── RootLayout.tsx      # Main layout
│   │   └── AuthLayout.tsx      # Auth pages
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   ├── validation/       # Zod schemas
│   │   ├── auth.ts             # Auth utilities
│   │   └── utils.ts            # General utilities
│   └── components/
│       ├── ui/                 # Custom UI components
│       └── features/           # Feature-specific components
├── tailwind.config.js          # Tailwind v4 config
└── package.json                # Next.js app config
```

## Development Commands

```bash
# Run all services (Next.js app + API server)
pnpm dev

# Run only Next.js app
pnpm --filter @kalya/web dev

# Run only API server
pnpm --filter @kalya/api-server dev

# Open DB studio
pnpm --filter @kalya/db db:studio

# Run migrations
pnpm --filter @kalya/db db:migrate

# Generate migrations
pnpm --filter @kalya/db db:generate
```

## Debugging Tips

1. Check browser console for React errors
2. Check terminal for Next.js build errors
3. Check API server logs for network errors
4. Verify JWT token in localStorage before API calls
5. Ensure NEXT_PUBLIC_API_URL is set
6. Check that SQLite database file exists

## Design Principles

- Mobile-first approach
- Clean and minimalist design
- Strong focus on user experience
- Dark mode support
- Fast and responsive interface

Remember: You are a senior developer. Write clean, maintainable, and idiomatic TypeScript and Next.js code. Always follow the established project structure and conventions. When in doubt, refer to the existing code in `src/pages/` and `src/layouts/`.
