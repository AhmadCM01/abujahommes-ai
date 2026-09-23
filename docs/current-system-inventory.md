# AbujaHommes AI — Current System Inventory (Phase 0)

**Date:** September 12, 2026  
**Audience:** Founder & Engineering Team  
**Scope:** Phase 0 exploration & architectural inventory of existing authentication, identity, database, email, and security infrastructure against `ABUJAHOMES_AUTH_BACKEND_SPEC.md` and `ANTIGRAVITY_AGENT_PROMPT.md`.

---

## A. Runtime

- **App Framework & Language:**
  - **Core Application:** Next.js 15.5.23 (App Router, Turbopack enabled in development and build scripts) running on React 19.1.0 and TypeScript 5.
  - **Styling & UI:** Tailwind CSS v4 (`@tailwindcss/postcss` v4), Radix UI primitives, Phosphor Icons (`@phosphor-icons/react`), and Framer Motion (`framer-motion` v13.1.0).
  - **ML Microservice:** Standalone Python FastAPI service located in `ml-service/` (`ml-service/main.py`, `ml-service/train.py`, `ml-service/requirements.txt`, and `ml-service/Dockerfile`) providing property price prediction and fraud score evaluation.
- **Package Manager & Workspace Structure:**
  - **Package Manager:** `npm` (`package-lock.json` present at workspace root).
  - **Monorepo / Single Repo:** Single polyglot repository (Next.js frontend/BFF with embedded `ml-service/` directory; not configured as a Turborepo or pnpm workspace).
- **How It Is Run Locally:**
  - **Web Application:** `npm run dev` (executes `next dev --turbopack` on `http://localhost:3000`).
  - **ML Service:** Run locally via `uvicorn main:app --reload --port 8000` inside `ml-service/` (or via Docker container).
  - **Docker / Make:** No root `docker-compose.yml` or `Makefile` currently exists.

---

## B. Auth That Exists Today

- **Files and Libraries:**
  - **Libraries in `package.json`:**
    - `@supabase/ssr`: `^0.12.4`
    - `@supabase/supabase-js`: `^2.112.3`
    - `zustand`: `^5.0.14` (with `persist` middleware)
  - **Key Files:**
    - `src/store/auth.ts`: Zustand store using `persist` middleware (`name: 'abujahommes-auth'`). Stores session token, user profile, and a client-side dictionary of registered accounts with plaintext passwords in browser `localStorage`.
    - `src/lib/supabase/client.ts`: Browser Supabase client instantiated via `createBrowserClient` with fallback placeholder env variables.
    - `src/lib/supabase/server.ts`: Server Supabase client instantiated via `createServerClient` reading from Next.js `cookies()`.
    - `src/lib/supabase/admin.ts`: Supabase service role client instantiated via `createClient` using `SUPABASE_SERVICE_ROLE_KEY`.
    - `src/middleware.ts`: Next.js middleware stub with empty pass-through (`return response`). Performs no session validation or route protection.
    - `src/components/auth/LoginForm.tsx`: Attempts Supabase `signInWithPassword`; on failure/catch, falls back to Zustand client authentication; generates mock Google user if OAuth fails.
    - `src/components/auth/RegisterForm.tsx`: Two-step form; attempts Supabase `signUp`; on failure, registers user directly into Zustand `localStorage`.
    - `src/app/auth/callback/route.ts`: GET route calling `supabase.auth.exchangeCodeForSession(code)`. Unconditionally redirects to `/dashboard/${role}` even if code exchange fails.
    - `src/app/auth/reset-password/page.tsx`: Pure mock UI using client-side `setTimeout` steps without token generation, DB queries, or backend verification.
    - `src/app/auth/verify-email/page.tsx`: Pure mock UI with a bypass button ("I Have Verified — Proceed to Dashboard") directly pushing to `/dashboard/buyer`.
- **Providers Already Enabled:**
  - **Email / Password:** Partially hooked up to Supabase Auth client methods, but fully bypassed by client-side fallback store in `src/store/auth.ts`.
  - **Google OAuth:** Hooked to `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: ... } })`, but if unconfigured or encountering error, catches and injects a mock user (`Verified Google User`, `user@gmail.com`) into `localStorage`.
- **Session Mechanism:**
  - **Primary (in use by UI):** Browser `localStorage` via Zustand `persist` (`name: 'abujahommes-auth'`). Stores `token: 'demo-session-token'` / `session-<timestamp>` and the entire `user` object.
  - **Secondary (stubbed):** Cookie adapter exists in `src/lib/supabase/server.ts`, but is not enforced by middleware or route handlers.
- **Password Hashing Algorithm:**
  - **Existing in repo:** None. Passwords in `src/store/auth.ts` are stored in raw plaintext (`Password123!`, `AdminPassword123!`) in `DEFAULT_ACCOUNTS` and dynamically written to `localStorage`.
  - Supabase Auth uses bcrypt internally, but local development and fallback auth store completely circumvent it. Argon2id is not implemented.
- **Email Verification / Password Reset / Logout All Devices:**
  - **Email Verification:** Stubbed. No verification tokens, no signed URLs, no database timestamp (`email_verified_at`). Anyone can click the bypass button to access dashboards.
  - **Password Reset:** Stubbed. No single-use token, no token expiration, no session revocation.
  - **Logout All Devices:** Absent. Zustand `logout()` simply resets `user: null` and `token: null` in the local browser tab.
- **User / Session / Account Table Models (from `supabase/schema.sql`):**
  ```sql
  -- Profiles table (tied to Supabase auth.users)
  CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('buyer','seller','admin')) DEFAULT 'buyer',
    is_verified BOOLEAN DEFAULT false,
    is_suspended BOOLEAN DEFAULT false,
    avatar_url TEXT,
    budget_min BIGINT,
    budget_max BIGINT,
    preferred_lgas TEXT[],
    preferred_property_types TEXT[],
    preferred_transaction_type TEXT CHECK (preferred_transaction_type IN ('rent','sale','any')),
    search_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Automatic profile creation on auth.users insert
  CREATE OR REPLACE FUNCTION handle_new_user()
  RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
  BEGIN
    INSERT INTO profiles (id, full_name, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
      COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
    );
    RETURN NEW;
  END;
  $$;
  ```
  *(Note: No custom `session`, `account`, or `credential` tables exist; sessions and credentials belong to Supabase internal `auth.*` schema).*
- **How Role is Stored and Enforced:**
  - **Storage:** Stored in `localStorage` inside the client Zustand state (`user.role`). Also defined as a column on `profiles.role` in SQL.
  - **Enforcement:** Client-side only. `src/components/layout/DashboardShell.tsx` runs a client `useEffect` that checks `if (user && user.role !== 'admin' && role !== user.role) router.replace(...)`. If `user` is unauthenticated (null), it does not redirect. Furthermore, `src/components/layout/TopBar.tsx` contains a role dropdown that allows any user to execute `setRole(newRole)` and instantly switch between `buyer`, `seller`, and `admin`. There is zero server-side middleware or route guard checking roles.
- **Google OAuth Status & Exact Callback Path:**
  - **Status:** Stubbed/partially wired via Supabase client SDK, but falls back to a simulated mock user when credentials are not present.
  - **Callback Path:** `/auth/callback` handled by `src/app/auth/callback/route.ts`.
  - **Account Linking:** Absent. No logic checks whether a Google email matches an existing verified email, and no protection exists against unverified email takeover.

---

## C. Database

- **Engine:**
  - PostgreSQL (targeted for Supabase or Neon).
- **ORM / Migration Tool:**
  - **None.** Neither Prisma, Drizzle, Kysely, nor standard migration tools are installed.
  - Schema exists solely as a standalone SQL file: `supabase/schema.sql`.
  - Several Next.js API routes (e.g. `src/app/api/listings/route.ts`) bypass the database entirely and query an in-memory variable (`let memoryListings = [...SEED_LISTINGS]`).
- **Database Connection Strings & Environment Variables:**
  - In `.env.example`:
    - `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key`
    - `SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key`
  - In `.env.local`:
    - Populated with placeholder values (`https://placeholder-project.supabase.co`).
    - `DATABASE_URL` and `DIRECT_DATABASE_URL` are not yet defined.

---

## D. Email

- **Provider, Templates, Queue, Cron:**
  - **Provider:** Resend (`resend: ^6.19.0` installed in `package.json`).
  - **Client & Sending Logic:** `src/lib/email/index.ts` creates a `Resend` instance with fallback simulation logging `[DEV MODE EMAIL]` to console.
  - **Templates:** Raw inline HTML string templates in `src/lib/email/index.ts`:
    - `welcome`
    - `listingApproved`
    - `listingRejected`
    - `newEnquiry`
    - *Missing required auth templates:* `verify-email`, `password-reset`, `security-new-login`, `saved-search-match`, `weekly-market-brief`. No React Email templates exist.
  - **Queue / Background Jobs:** None. Calls `resendClient.emails.send()` synchronously inline within the request path. No Inngest, BullMQ, or Redis queue is configured.
  - **Cron:** None.
- **From Addresses & Domains:**
  - Hardcoded to `'AbujaHommes AI <alerts@abujahommes.ai>'` for all emails.
  - No domain separation between transactional (`noreply@mail.<domain>`) and product updates (`updates@news.<domain>`).

---

## E. Users / Registration UX

- **Register and Login Routes / Pages:**
  - Login: `/auth/login` (`src/app/auth/login/page.tsx` rendering `LoginForm.tsx`)
  - Register: `/auth/register` (`src/app/auth/register/page.tsx` rendering `RegisterForm.tsx`)
  - Reset Password: `/auth/reset-password` (`src/app/auth/reset-password/page.tsx`)
  - Verify Email: `/auth/verify-email` (`src/app/auth/verify-email/page.tsx`)
  - OAuth Callback: `/auth/callback` (`src/app/auth/callback/route.ts`)
- **Role Selection & Default Role:**
  - `RegisterForm.tsx` has a Step 0 role selector (`RoleSelector.tsx`) offering `buyer` or `seller`. Default is `buyer`.
  - `LoginForm.tsx` dynamically assigns roles based on email substrings (e.g. email containing `admin` becomes `admin`).
  - `TopBar.tsx` enables interactive client-side switching to any role (`buyer`, `seller`, `admin`).
  - The `agent` role defined in the target architecture is absent from `RoleSelector.tsx`, `UserRole` type (`buyer | seller | admin`), and dashboard layouts.

---

## F. Gaps vs Target Architecture

### What Is Missing:
1. **Production Auth Engine:** Better Auth is not installed. Current auth relies on a client-side Zustand store with mock fallbacks.
2. **Canonical Application `users` Table:** Target architecture requires a first-class `users` table with:
   - `id` (uuid pk)
   - `email` (citext/text unique not null, case-insensitive)
   - `email_verified_at` (timestamptz)
   - `role` (`buyer | seller | agent | admin`)
   - `status` (`pending | active | suspended`)
   - `locale` (default `'en-NG'`)
   - `timezone` (default `'Africa/Lagos'`)
   - `marketing_opt_in` (boolean default `false`)
   - `last_login_at`, `created_at`, `updated_at`, `deleted_at` (soft delete)
   Existing `profiles` table lacks `email`, `email_verified_at`, `status`, `locale`, `timezone`, `marketing_opt_in`, `deleted_at`, `last_login_at`, and omits `'agent'` from role check.
3. **Database ORM / Migrations:** No Prisma or Drizzle migration workflow. Production schema cannot be evolved reliably.
4. **Secure Password Hashing:** Argon2id is not used.
5. **Real Email Verification & Password Reset:** Tokenized flows with cryptographic tokens, single-use invalidation, and session revocation are missing.
6. **Account Linking Protocol:** Logic for linking Google OAuth with existing verified accounts and blocking takeovers of unverified accounts does not exist.
7. **Server-Side Session & Route Protection:** `middleware.ts` is empty. Sessions are not validated via httpOnly cookies on dashboard visits or API routes.
8. **Asynchronous Email Queue:** No Inngest/BullMQ queue. No `email_messages` table with deduplication keys (`dedupe_key`) or idempotency.
9. **Dual Email Reputations & React Email:** No separate `noreply@mail.` and `updates@news.` senders; no React Email templates.
10. **Auth Route Rate Limiting:** Upstash rate limiters exist in `src/lib/rate-limit/` but are never applied to login, registration, password reset, or OAuth callback endpoints.
11. **Audit Logging on Auth Events:** No audit log entries for login success/failure, password resets, role changes, or OAuth linking.

### What Is Dangerous:
1. **Plaintext Passwords in LocalStorage:** `src/store/auth.ts` writes plaintext passwords directly to browser `localStorage`.
2. **Client-Writable Roles:** Users can self-elevate to `admin` in `TopBar.tsx` without server-side verification.
3. **Unprotected Dashboard Routes:** Any unauthenticated user can directly access `/dashboard/admin`, `/dashboard/seller`, or `/dashboard/buyer`.
4. **Bypassed Email Verification:** The verify-email screen includes a button that permits any user to skip activation immediately.
5. **In-Memory Server State:** Server API routes store data in temporary memory arrays (`memoryListings`), which reset on redeploy.

### What Can Be Reused:
1. **Frontend Design & Components:** High-quality Tailwind CSS v4 and Radix UI components (`AuthCard`, `Input`, `Button`, `GoogleButton`, `RoleSelector`, `ToastProvider`, `Badge`, `Modal`).
2. **Route Skeleton:** Established App Router folder structure (`/auth/login`, `/auth/register`, `/auth/callback`, `/auth/verify-email`, `/auth/reset-password`, `/dashboard/*`).
3. **Upstash Redis Rate Limiting Setup:** `@upstash/ratelimit` and `@upstash/redis` packages and utility wrappers in `src/lib/rate-limit/index.ts`.
4. **Resend SDK:** Existing `resend` package integration in `package.json`.
5. **Postgres Database Schema Base:** Domain tables for listings, predictions, enquiries, and favourites in `supabase/schema.sql`.

---

## G. Recommended Path for THIS Repo

**Recommendation:**  
**“Replace auth library, keep app framework + DB”**

**Rationale (5 lines):**
1. The current auth is an insecure prototype hybrid storing plaintext passwords and client-writable roles in Zustand `localStorage` with half-wired Supabase stubs.
2. The Next.js 15 App Router codebase and underlying PostgreSQL schema are solid and should be preserved.
3. Better Auth directly satisfies the spec: server-side Postgres sessions, Google OAuth account linking, Argon2id passwords, and httpOnly cookies.
4. Replacing prototype auth with Better Auth + Drizzle ORM provides a clean migration trail without altering search, fraud scoring, or ML pipelines.
5. This fulfills all Phase 1 requirements cleanly while reusing existing UI cards, forms, and Redis/Resend dependencies.

---

**Current Status:** Phase 0 complete. Code changes paused awaiting user review and approval of the recommended path.
