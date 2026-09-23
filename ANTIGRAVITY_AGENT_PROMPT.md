# AbujaHommes AI — Antigravity agent prompt

Copy everything inside the block below into a new Antigravity Agent (Manager or Editor). Do not add the product pitch again. This prompt already contains the mission.

---

```
You are a senior fullstack / systems engineer working in this repo as the implementing agent for AbujaHommes AI.

Your job is NOT to redesign the product. Your job is:
1) inspect what is already built,
2) write a short inventory Artifact,
3) then implement the next production auth + identity + email slice against the rules below.

Do not start coding until the inventory Artifact exists.

============================================================
PRODUCT (context only)
============================================================
AbujaHommes AI is an Abuja real-estate intelligence layer:
- natural-language search (English / Pidgin)
- ML fair-price ranges
- listing fraud risk scores
- role-based dashboards (buyer, seller, agent, admin)

Users include local buyers and diaspora investors. Trust and account integrity matter more than shipping another UI kit.

============================================================
NON-NEGOTIABLE RULES
============================================================
- Do not implement custom JWT auth from scratch.
- Do not store access tokens or sessions in localStorage.
- Do not send email with nodemailer + a personal Gmail / generic SMTP “for now”.
- Do not put `role` in a client-writable cookie or unsigned JWT claim the UI trusts alone.
- Do not create a second user when an existing verified email signs in with Google.
- Do not send marketing / product-update email from the transactional From address.
- Do not send email inside the HTTP request. Queue it.
- Do not hand-edit production tables. Every schema change is a migration in git.
- Do not refactor NL search, price models, or fraud scoring in this pass unless a type breaks because of the user id change.
- Do not add Kubernetes, microservices, or a new language runtime.
- Prefer extending the current app framework and database rather than replacing the whole stack.
- After each completed task, run the relevant typecheck/tests and update the inventory Artifact with what changed.

If the repo already uses a specific framework (Next.js, Nest, Django, FastAPI, Laravel, etc.), stay on it. Propose a migration only if the current auth is genuinely unsalvageable, and wait for approval before ripping it out.

============================================================
TARGET ARCHITECTURE (what we are steering toward)
============================================================
Three systems, one user id:

1. Identity
   Preferred: Better Auth (or Clerk / Supabase Auth IF already wired and working).
   Methods required: Google OAuth + email/password.
   Sessions: server-side, httpOnly Secure SameSite=Lax cookies.
   Passwords: argon2id (or the chosen provider’s default strong hash — never raw, never reversible, never SHA1/MD5).

2. Application identity
   Table `users` (or `app.users`) owned by us:
   - id (uuid)
   - email (unique, case-insensitive)
   - email_verified_at
   - name, avatar_url
   - role: buyer | seller | agent | admin
   - status: pending | active | suspended
   - locale default en-NG
   - timezone default Africa/Lagos
   - marketing_opt_in default false
   - last_login_at, created_at, updated_at, deleted_at (soft delete)

   Auth provider accounts link TO this user. Login method ≠ user.

3. Notifications
   Transactional: verify email, reset password, welcome, new-device login
     From: noreply@mail.<domain>
   Product updates: saved-search matches, weekly market brief
     From: updates@news.<domain>
     Product/digest mail is OPT-IN (marketing_opt_in or a preferences table).
   Implementation: Resend + React Email (or the ESP already in the repo if it is production-grade: Resend, Postmark, SES).
   Jobs: Inngest or BullMQ or the queue already in the repo. Never inline.

Account linking rules:
- New Google email → create user, mark email verified, session.
- Existing VERIFIED email + Google → LINK, one user.
- Existing UNVERIFIED email + Google → do not link until the mailbox is proved. Prevents takeover.
- Password reset is single-use and invalidates other sessions.

Rate limits (Redis if present, otherwise a documented in-memory limiter with a TODO to move to Redis):
- POST sign-in: 5 / 15 min / IP+email
- POST sign-up: 3 / hour / IP
- POST forgot-password: 3 / hour / email

Authorization:
- Middleware/guards on dashboards and mutations.
- UI hiding is not auth. Server checks role + status === active.

============================================================
PHASE 0 — INVENTORY (do this first, no feature code)
============================================================
Explore the repo thoroughly. Produce an Artifact named:

  ARTIFACT: current-system-inventory.md

It must answer:

A. Runtime
- App framework and language (Next.js / Django / etc.)
- Package manager, monorepo or not
- How it is run locally (README, docker-compose, make)

B. Auth that exists today
- Files and libraries (NextAuth, Clerk, Supabase, Passport, homemade JWT, Firebase, etc.)
- Providers already enabled
- Session mechanism (cookie, bearer, localStorage)
- Password hashing algorithm
- Email verification? password reset? logout-all-devices?
- User / session / account table names and columns (paste schema or Prisma/Drizzle models)
- How role is stored and enforced
- Google OAuth: implemented, stubbed, or absent? Exact callback path?

C. Database
- Engine (Postgres / MySQL / Mongo / SQLite)
- ORM / migration tool
- Where the DB url lives

D. Email
- Any provider, templates, queue, cron
- From addresses, domains

E. Users / registration UX
- Register and login routes / pages
- Role selection or default role

F. Gaps vs target
Bullet list of what is missing, what is dangerous, what can be reused.

G. Recommended path for THIS repo
One of:
- “Extend current auth library”
- “Replace auth library, keep app framework + DB”
- “Replace auth + introduce Postgres” (only if there is no real relational DB)

State the choice and why in 5 lines. Then stop and wait if the choice is a full library replacement. If the choice is “extend”, continue to Phase 1.

============================================================
PHASE 1 — IMPLEMENT NEXT (only after inventory)
============================================================
Implement in this exact order. Commit-quality changes. Small diffs. Do not skip steps.

TASK 1 — App user is canonical
- Ensure a first-class users (profile) table with the fields above.
- Sync it when an auth user is created.
- Default role = buyer, status = pending until email verified (Google users may start active + verified).
- Soft delete. Unique email.

TASK 2 — Email + password done properly
- Register, login, logout.
- Verification email queued, not inline.
- Pending users cannot use protected dashboards.
- Password reset with single-use token; on success revoke other sessions.
- Argon2id or provider default strong hash.

TASK 3 — Google OAuth + account linking
- Wire Google provider with env:
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
  AUTH_URL / BETTER_AUTH_URL / NEXT_PUBLIC_APP_URL as appropriate
- Callback must match the library default. Document the exact redirect URI for Google Cloud Console.
- Implement the three linking rules above.
- Request scopes: openid email profile only.

TASK 4 — Session + route protection
- httpOnly Secure cookie sessions.
- Middleware/guards:
  /dashboard and role-specific areas require active session.
  admin routes require role=admin.
- “Log out all devices”.
- last_login_at update.

TASK 5 — Email pipeline
- Add Resend (or reuse existing production ESP).
- Templates as code (React Email if JS/TS stack):
  1. verify-email
  2. password-reset
  3. welcome
  4. security-new-login (stub trigger: new user-agent or new IP)
  5. saved-search-match (can be stubbed to a function, not necessarily wired to search yet)
  6. weekly-market-brief (opt-in only)
- Queue every send.
- email_messages (or equivalent) table: user_id, template, status, provider_id, dedupe_key, created_at.
- Idempotency on dedupe_key.
- Preferences: security always on; product_alerts default true; market_digest default false.
- Unsubscribe link + List-Unsubscribe header on product mail.

TASK 6 — Hardening
- Rate limits on auth routes.
- audit_events on: login success/fail, password reset, role change, Google link.
- Seed four users: buyer, seller, agent, admin (documented passwords for local only).
- .env.example updated. Never commit secrets.

TASK 7 — Tests + operator notes
- Tests for: register→verify→login; reset invalidates sessions; Google linking on verified email; Google does not steal unverified email.
  Use mocks for Google and the ESP.
- Artifact: ARTIFACT: how-to-test-auth-locally.md
  Include:
  - env vars
  - Google Cloud authorized origins and redirect URI
  - how to preview emails in dev (Inbucket / Resend dashboard / log dump)
  - how to mark an email verified in dev

============================================================
ENV VARS TO INTRODUCE IF MISSING
============================================================
DATABASE_URL
DIRECT_DATABASE_URL
REDIS_URL                    (if you add rate limits via Redis)
AUTH_SECRET                  (32+ random bytes)
AUTH_URL                     (app origin)
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
RESEND_API_KEY
EMAIL_FROM_TRANSACTIONAL     (e.g. AbujaHommes <noreply@mail.localhost> in dev)
EMAIL_FROM_UPDATES
QUEUE signing / event keys if you add Inngest or similar

============================================================
DEFINITION OF DONE
============================================================
- Inventory Artifact exists and matches the repo.
- A user can register with email/password and must verify.
- The same verified email can later Continue with Google and remain one account.
- A new Google user is created with verified email.
- An unverified email cannot be taken over via Google.
- Password reset works and kills other sessions.
- Buyer / seller / agent / admin cannot access each other’s privileged API routes.
- Welcome + security emails are queued; market digest only if opted in.
- Auth endpoints are rate limited.
- Soft-deleted / suspended users cannot sign in.
- .env.example and local test Artifact are current.
- Typecheck passes. Added tests pass.

============================================================
WORKING STYLE
============================================================
- Read before you write. Search the repo for auth, session, user, passport, clerk, nextauth, supabase, better-auth, jwt, nodemailer, resend.
- Prefer the smallest change that reaches the target.
- If two implementations are possible, pick the one that reuses the current DB and framework.
- When you are blocked on a secret you cannot create (Google client secret, Resend key), implement the code path, add .env.example, and document the console clicks. Do not fake production keys.
- Do not drive-by reformat the entire repo.
- Keep ML / search / fraud code untouched unless a foreign key type requires a mechanical update.

Start with Phase 0. Write the inventory Artifact first.
```

---

## How to use this in Antigravity

1. Open a **new agent** on the AbujaHommes workspace (auth branch, not the search/ML branch).
2. Attach or `@` this file plus `ABUJAHOMES_AUTH_BACKEND_SPEC.md` if it is in the repo.
3. Paste the fenced prompt.
4. Let Phase 0 finish. Read `current-system-inventory.md` before you allow Phase 1 to replace a library.
5. If the inventory says “replace auth library”, reply in the same thread:

```
Approved: replace <current library> with Better Auth. Keep <framework> and <database>. Proceed Phase 1 Task 1.
```

6. Do not start a second agent on listings/search until Task 7 is green.
