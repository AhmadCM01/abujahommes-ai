# AbujaHommes AI — Production Auth, Identity, Backend & Email Spec

**Audience:** Founder + Google Antigravity agent  
**Goal:** Replace prototype auth/registration/backend/DB with a system that can serve thousands of users without a rewrite in 12 months.  
**Non-goals:** Building a custom identity protocol. Kubernetes on day one. Multi-region active-active.

---

## 1. Engineering posture

Prototype auth usually fails at scale for the same reasons:

- Users and sessions live in the same messy table as listings
- Passwords hashed inconsistently or stored in app memory
- Google login is a frontend popup with no account-linking
- Emails are sent synchronously inside the request
- Roles are a string on the user with no audit trail
- No email verification, no session revocation, no rate limits

A senior stack treats **identity**, **application data**, and **notifications** as three systems that share a user id.

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Web / App   │────▶│  API Gateway    │────▶│  Core API        │
│  Next.js     │     │  (auth middleware)    │  (listings, AI)  │
└──────────────┘     └────────┬────────┘     └────────┬─────────┘
                              │                       │
                              ▼                       ▼
                     ┌─────────────────┐     ┌──────────────────┐
                     │  Auth service   │     │  Postgres        │
                     │  Better Auth    │     │  + Redis cache   │
                     └────────┬────────┘     └────────┬─────────┘
                              │                       │
                              ▼                       ▼
                     ┌─────────────────┐     ┌──────────────────┐
                     │  Job queue      │────▶│  Email worker    │
                     │  Inngest/BullMQ │     │  Resend          │
                     └─────────────────┘     └──────────────────┘
```

---

## 2. Recommended stack (default)

Choose this unless the prototype is already locked into something else.

| Layer | Choice | Why |
|---|---|---|
| App | Next.js App Router + TypeScript | One deploy surface; agent-friendly; SSR for SEO on listings |
| Auth | **Better Auth** | Google + email/password, account linking, sessions in *your* DB, no per-MAU tax, plugin for 2FA later |
| Database | **PostgreSQL 16** on Neon or Supabase (or RDS when revenue exists) | Source of truth; RLS optional; cheap to thousands of users |
| Cache / sessions hot path | **Redis** (Upstash) | Rate limits, job locks, short-lived OTP |
| Jobs | **Inngest** or BullMQ | Email must never block HTTP |
| Transactional email | **Resend** + React Email | Best DX; templates as code; enough for thousands of users |
| Product updates | Same Resend, **different subdomain** | Protect transactional reputation |
| Object storage | Cloudflare R3 / S3 | Listing images, title docs (private) |
| Observability | Sentry + Axiom/Posthog | Auth failures and email bounces matter |
| Secrets | Doppler or platform env + Google Cloud Secret Manager | Never commit OAuth secrets |

**When to pick Clerk instead:** you want prebuilt UI, organizations, and to ship auth this weekend. Cost and lock-in grow later. Fine as a temporary bridge; still keep `users` in Postgres as the app identity.

**When to pick Supabase Auth:** you already use Supabase for everything and want RLS tied to `auth.uid()`. Still model app roles in your own tables.

Do **not** build Passport + JWT-from-scratch + nodemailer-on-Gmail. That is what you are dissatisfied with.

---

## 3. Identity model (this is the part prototypes get wrong)

Never treat “login method” as “user”.

```
User (app identity)
  id            uuid pk
  email         citext unique not null
  email_verified_at timestamptz
  name
  avatar_url
  phone         (nullable, later)
  role          enum: buyer | seller | agent | admin
  status        enum: pending | active | suspended
  locale        default 'en-NG'
  timezone      default 'Africa/Lagos'
  marketing_opt_in boolean default false
  created_at / updated_at / last_login_at
  deleted_at    (soft delete)

Account (auth provider link)
  id
  user_id       fk
  provider      enum: credential | google
  provider_account_id
  unique(provider, provider_account_id)

Session
  owned by Better Auth (token hashed, expires, ip, user_agent)

Credential
  password_hash  (argon2id only)
  only exists if provider = credential
```

Rules:

1. One `User` per email.
2. Google and password can attach to the same `User` (account linking).
3. First successful Google login on an existing verified email **links**, it does not create a second user.
4. Roles live on `User` (or a `memberships` table if you later add agencies). Dashboards read role from the session after a DB lookup, not from a client cookie the user can edit.
5. Diaspora vs local is a **profile flag**, not a separate auth system.

### Role matrix (v1)

| Role | Can do |
|---|---|
| buyer | search, save listings, request viewing, see price band + fraud score |
| seller | create/edit own listings, see interest |
| agent | manage listings for clients, bulk upload |
| admin | review fraud flags, suspend users, override listings |

Enforce on the server. UI hiding is not authorization.

---

## 4. Auth flows to implement

### 4.1 Email + password

1. Register: email, password, name, intended role (buyer default).
2. Password policy: min 10 chars, check against HaveIBeenPwned k-anonymity (Better Auth has this pattern). Hash with **argon2id**.
3. Send verification email (queued). Account `pending` until click.
4. Login: email + password → session cookie (httpOnly, Secure, SameSite=Lax, `__Host-` prefix in prod).
5. Forgot password: time-boxed token, single use, invalidate other sessions on reset.

### 4.2 Google OAuth

1. Google Cloud project → OAuth client (Web).
2. Authorized origins: `http://localhost:3000`, `https://abujahommes.com`, `https://www.abujahommes.com`.
3. Redirect URI: `https://abujahommes.com/api/auth/callback/google` (match Better Auth path exactly).
4. Scopes: `openid email profile`. Nothing else.
5. On callback:
   - If email exists and is verified → link Google account, create session.
   - If email exists and is **not** verified → require password verification or send confirm-link before linking (prevents account takeover).
   - If new email → create User, mark email verified (Google already verified it), session.

### 4.3 Session

- Server-side sessions in Postgres (Better Auth default), not fat JWTs in localStorage.
- Sliding expiration: 30 days idle, hard cap 90 days.
- “Log out all devices” deletes all sessions for `user_id`.
- Middleware protects `/dashboard/*`, `/api/*` except public search.

### 4.4 Rate limits (non-negotiable)

| Endpoint | Limit |
|---|---|
| POST /sign-in | 5 / 15 min / IP + email |
| POST /sign-up | 3 / hour / IP |
| POST /forgot-password | 3 / hour / email |
| Google callback | standard OAuth, still cap 20 / 10 min / IP |
| Search API | 60 / min / user, 20 / min / anon IP |

Use Redis. Return 429 with `Retry-After`.

---

## 5. Database principles

### 5.1 One Postgres, schemas

```
auth.*          — Better Auth tables (do not hand-edit)
app.users       — your profile + role
app.listings
app.listing_media
app.price_observations
app.fraud_scores
app.saved_searches
app.notifications
app.email_messages
app.audit_events
```

If using a single `public` schema, prefix tables clearly (`auth_*` vs `app_*`).

### 5.2 Indexes that matter at a few thousand users

You will not need sharding. You **will** need:

- `users(email)` unique
- `listings(status, neighborhood, listed_at desc)`
- `listings` GIN on `search_vector` or pgvector for embeddings later
- `fraud_scores(listing_id, computed_at desc)`
- `email_messages(user_id, created_at desc)`
- `sessions(user_id)`, `sessions(expires_at)` for cleanup

### 5.3 Migrations

Use Drizzle or Prisma. Antigravity must never “edit prod tables by hand”. Every change is a migration in git.

### 5.4 Soft deletes + audit

Listings and users are never hard-deleted in year one. `audit_events` records: actor, action, entity, before/after JSON, ip.

---

## 6. Email system

Two products, two reputations.

| Stream | From address | Purpose |
|---|---|---|
| Transactional | `noreply@mail.abujahommes.com` | verify, reset, security, viewing confirmed |
| Product updates | `updates@news.abujahommes.com` | weekly market brief, saved-search alerts, new listing matches |

DNS on **both** subdomains: SPF, DKIM, DMARC (`p=quarantine` then `p=reject`).

### 6.1 Never send email inside the request

```
API event → insert email_messages (status=queued)
         → enqueue job (Inngest/BullMQ)
         → worker renders React Email template
         → Resend API
         → webhook updates status (delivered / bounced / complained)
```

Idempotency key: `user_id + template + dedupe_key` so a double-click does not send two reset emails.

### 6.2 Templates to build first

1. `verify-email`
2. `password-reset`
3. `welcome` (after verify)
4. `security-new-login` (new device / new country)
5. `saved-search-match` (product)
6. `weekly-market-brief` (product, opt-in only)
7. `fraud-alert-on-saved-listing`

### 6.3 Preferences

```
email_preferences
  user_id
  product_alerts     default true   -- saved search, price change
  market_digest      default false  -- weekly updates; must opt in (NDPR)
  security           always true    -- cannot disable
```

Unsubscribe link on every product email. One-click List-Unsubscribe header.

### 6.4 Nigeria / diaspora deliverability

Most of your users will be on Gmail. Resend + proper DNS is enough at thousands of users. Watch bounce rate. Do not buy email lists. Do not send marketing from the transactional domain.

---

## 7. API & backend shape

Keep the AI features out of the auth process.

```
/api/auth/*          Better Auth handler
/api/v1/me
/api/v1/listings
/api/v1/search       → NL parser + retrieval
/api/v1/valuations
/api/v1/fraud/:id
/api/v1/saved-searches
/api/internal/jobs   — worker only, network-restricted
```

Auth middleware:

1. Resolve session
2. Load `User` (role, status)
3. If `status != active` → 403
4. Attach `{ userId, role }` to request context

AI search and fraud scoring:

- Sync path: cache hit on neighborhood comps → return immediately
- Async path: queue model inference, return `job_id`, notify by email + in-app when ready (diaspora users will leave the tab)

---

## 8. Security baseline

- HTTPS only, HSTS
- CSRF: Better Auth cookie + origin check
- Argon2id passwords
- No JWT in localStorage
- Google OAuth with exact redirect allowlist
- Account linking only on verified email
- Admin routes require `role=admin` **and** optional 2FA (add plugin in month 2)
- PII: emails, phones, title documents encrypted at rest (provider default + private buckets)
- NDPR: privacy policy, lawful basis, data retention (inactive accounts 24 months then anonymize), Nigeria Data Protection Act 2023
- Secrets rotation for Google client secret
- WAF / bot protection on `/api/auth` and `/api/v1/search` (Cloudflare)

---

## 9. Scale envelope (thousands of users)

You are not Netflix. This is enough:

- Neon/Supabase Postgres, compute autosuspend off in prod
- Connection pooler (PgBouncer / Neon pooler)
- Redis for rate limits and job locks
- Serverless or 2× small containers for API
- Separate worker process for email + ML
- CDN for the Next.js frontend and images
- Nightly session cleanup, weekly vacuum/analyze

When you hit ~50k MAU or heavy geospatial queries, then: read replica, listing search on Typesense/Meilisearch or pgvector + separate ML service.

---

## 10. Migration from the prototype

Do this in order. Do not “improve auth in place”.

1. Stand up new Postgres + Better Auth next to the old app.
2. Import users: email, name, role. **Do not import old password hashes unless you know the algorithm.** Force password reset or Google-only for imported users.
3. Dual-write sessions for a week if you must keep the old UI live.
4. Cut DNS / env `AUTH_URL` to the new handler.
5. Delete the old auth tables after two weeks of clean logs.

---

## 11. How to drive Antigravity (agent operating system)

Antigravity will over-build or invent auth if you give it the product pitch. Give it **this file** plus a task list.

### Standing rules for the agent

- Do not implement custom JWT auth.
- Do not use `localStorage` for tokens.
- Do not send email with nodemailer + a personal Gmail.
- Do not put `role` in a client-writable cookie.
- Every schema change is a migration.
- After each task: run types, unit tests for auth linking, and a written Artifact: “how to test Google login locally”.

### Task sequence to paste into Agent Manager

1. Add Better Auth with Postgres adapter. Email/password only. Verification email queued, not sent inline.
2. Add Google provider + account linking rules from section 4.2.
3. Create `app.users` profile table synced on `user.created` hook. Roles + status.
4. Middleware: protect dashboards by role.
5. Resend + React Email + Inngest: verify, reset, welcome.
6. Preference center + unsubscribe.
7. Rate limits on auth routes.
8. Audit log on login, role change, listing publish.
9. Seed script: 4 users (buyer, seller, agent, admin).
10. Write Playwright tests: register → verify (dev bypass) → login; Google mock; reset password.

Work in a dedicated workspace. Keep ML/search agents off this branch until auth is green.

---

## 12. Env vars (names only)

```
DATABASE_URL
DIRECT_DATABASE_URL          # migrations
REDIS_URL
BETTER_AUTH_SECRET           # 32+ bytes
BETTER_AUTH_URL              # https://abujahommes.com
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
RESEND_API_KEY
EMAIL_FROM_TRANSACTIONAL     # AbujaHommes <noreply@mail.abujahommes.com>
EMAIL_FROM_UPDATES           # AbujaHommes <updates@news.abujahommes.com>
INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY
```

---

## 13. Definition of done

- [ ] New user can register with email/password and must verify
- [ ] Same email can later “Continue with Google” and land on one account
- [ ] New Google user is created with verified email
- [ ] Unverified email cannot steal a pending account via Google
- [ ] Password reset works and kills other sessions
- [ ] Buyer/seller/agent/admin see different dashboards, enforced server-side
- [ ] Welcome + security emails arrive; product digest only if opted in
- [ ] Auth endpoints are rate limited
- [ ] Soft-deleted users cannot sign in
- [ ] Load test: 100 concurrent logins against staging without 5xx
---
