# Kalya Authentication System — Documentation

Documentation for Kalya's (कल्य) user authentication system, layouts, validation schemas, and client-side forms.

---

## 1. System Architecture

The authentication module is structured to enforce a strict separation of concerns, optimize page load speed, and conform to the SEO requirement of blocking authentication pages from search indexing.

```
src/
├── app/
│   └── (auth)/                       # Shared Layout & Routes Group
│       ├── layout.tsx                # Premium Split-Screen Layout
│       ├── login/
│       │   └── page.tsx              # /login - Server Component (Metadata)
│       ├── signup/
│       │   └── page.tsx              # /signup - Server Component (Metadata)
│       └── forgot-password/
│           └── page.tsx              # /forgot-password - Server Component (Metadata)
├── components/
│   └── forms/                        # Modular Client Forms
│       ├── login-form.tsx            # Login Form (React Hook Form + Zod)
│       ├── signup-form.tsx           # Signup Form (React Hook Form + Zod)
│       └── forgot-password-form.tsx  # Forgot Password Form (with Success/Cooldown)
└── lib/
    └── auth-client.ts                # BetterAuth Client Instance
```

### 1.1 Separation of Server and Client Concerns
* **Server Components (`page.tsx`)**: Responsible for defining page-level configurations such as Next.js Metadata, custom Title tag, and robots indexing behavior. They are kept clean, rendering the client form directly.
* **Client Components (`*-form.tsx`)**: Placed under `src/components/forms/` to encapsulate interactive states, user inputs, real-time Zod validations, loading indicators, and API event handlers.

---

## 2. SEO & Crawling Rules

All authentication pages have explicit metadata properties that block search engines and AI web scrapers. This complies with [SEO_METADATA.md](file:///D:/Projects/personal/kalya/docs/SEO_METADATA.md).

```typescript
export const metadata: Metadata = {
  title: "Sign In", // or "Get Started" / "Reset Password"
  description: "Secure gateway.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};
```

* **Robots Configuration**: Crawling behavior is also configured in the global [robots.ts](file:///D:/Projects/personal/kalya/src/app/robots.ts) to disallow `/auth/`, `/login/`, `/signup/`, and `/forgot-password/` directories.

---

## 3. UI & Visual Identity Guidelines

The authentication experience represents the first impression of Kalya. It is designed to look **Modern & Premium** and feel **Empowering & Calm**.

### 3.1 Split-Screen Grid Layout
On viewport widths of `lg` and above, the interface splits into a `42% : 58%` columns layout:
1. **Left Panel (Desktop Brand Panel)**: 
   - Colored in static **Deep Emerald (`#0D3E26`)** to maintain optimal AAA contrast and high-fidelity aesthetics under all user settings.
   - Includes custom visual cards showcasing a mockup dashboard, mini graph, and net worth overview.
   - Displays the Sanskrit meaning of Kalya: *"कल्य: ready for tomorrow; in sound condition."*
2. **Right Panel (Form Panel)**:
   - Sets background dynamically using the `--color-bg` Alabaster token.
   - Hosts the floating header with a theme selector (`ThemeToggle`) and form wrapper centered at `360px` max-width.

---

## 4. BetterAuth Client Setup

The client communication wrapper is initialized in [auth-client.ts](file:///D:/Projects/personal/kalya/src/lib/auth-client.ts) to abstract BetterAuth requests.

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});
```

---

## 5. Forms Specification

All forms are built using **React Hook Form** + **Zod** schema resolvers. Input components utilize built-in icons and automated helper styling.

### 5.1 Sign In Form (`LoginForm`)
* **Endpoint**: `authClient.signIn.email`
* **Validation Rules**:
  - `email`: Mandatory, must pass standardized email format check.
  - `password`: Mandatory, minimum length of `8` characters.
  - `rememberMe`: Optional boolean (determines whether `dontRememberSession` is sent to BetterAuth).
* **Interactivity**:
  - Displays password show/hide button automatically on the password input.
  - Social Sign-in widgets (Google & GitHub) with clean brand styling and icons.

### 5.2 Sign Up Form (`SignupForm`)
* **Endpoint**: `authClient.signUp.email`
* **Validation Rules**:
  - `name`: Mandatory, minimum length of `2` characters.
  - `username`: Mandatory, length between `3` and `30` characters, strict regex allowing only letters, numbers, underscores (`_`), and hyphens (`-`).
  - `email`: Mandatory, must pass email format check.
  - `password`: Mandatory, minimum length of `8` characters, requires at least one uppercase letter, one lowercase letter, and one number.
  - `terms`: Mandatory boolean (must check and agree to Terms of Service & Privacy Policy).

### 5.3 Forgot Password Form (`ForgotPasswordForm`)
* **Endpoint**: `authClient.forgetPassword`
* **Validation Rules**:
  - `email`: Mandatory, email format check.
* **Special Workflows**:
  - **Success Screen Transition**: If the request completes successfully, the form morphs into a success confirmation panel showing a mail-check indicator.
  - **Resend Cooldown Timer**: Integrates a `60-second` countdown utility to throttle resend requests and protect the mailing server.

---

## 6. Component References & Exports

* Reusable form code:
  - Sign-in: [login-form.tsx](file:///D:/Projects/personal/kalya/src/components/forms/login-form.tsx)
  - Sign-up: [signup-form.tsx](file:///D:/Projects/personal/kalya/src/components/forms/signup-form.tsx)
  - Recovery: [forgot-password-form.tsx](file:///D:/Projects/personal/kalya/src/components/forms/forgot-password-form.tsx)
* URL Routes:
  - `/login`: [login/page.tsx](file:///D:/Projects/personal/kalya/src/app/%28auth%29/login/page.tsx)
  - `/signup`: [signup/page.tsx](file:///D:/Projects/personal/kalya/src/app/%28auth%29/signup/page.tsx)
  - `/forgot-password`: [forgot-password/page.tsx](file:///D:/Projects/personal/kalya/src/app/%28auth%29/forgot-password/page.tsx)
