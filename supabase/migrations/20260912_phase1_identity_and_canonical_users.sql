-- AbujaHommes AI — Phase 1 Migration: Canonical App Users & Better Auth Identity
-- Description: 
-- 1. Creates Better Auth core tables ("user", "session", "account", "verification").
-- 2. Migrates/Upgrades profiles table:
--    - Drops foreign key constraint referencing auth.users (decoupling from Supabase internal auth)
--    - Adds agent to role CHECK constraint (buyer, seller, agent, admin)
--    - Adds email (CITEXT UNIQUE), email_verified_at, status (pending, active, suspended)
--    - Adds locale (en-NG), timezone (Africa/Lagos), marketing_opt_in
--    - Adds last_login_at, deleted_at (soft delete)
-- 3. Creates email_messages table (queue, status, dedupe_key for idempotency)
-- 4. Creates audit_events table
-- 5. Drops old Supabase trigger on auth.users

CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. BETTER AUTH IDENTITY TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email CITEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  image TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  "scope" TEXT,
  password TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("providerId", "accountId")
);

CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure defaults on existing tables
ALTER TABLE "user" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "session" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "account" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "verification" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Better Auth Indexes
CREATE INDEX IF NOT EXISTS idx_better_auth_session_userId ON "session"("userId");
CREATE INDEX IF NOT EXISTS idx_better_auth_session_token ON "session"(token);
CREATE INDEX IF NOT EXISTS idx_better_auth_account_userId ON "account"("userId");
CREATE INDEX IF NOT EXISTS idx_better_auth_verification_identifier ON "verification"(identifier);

-- ============================================================
-- 2. CANONICAL APP IDENTITY (profiles / app_users)
-- ============================================================

-- If table does not exist at all, create it fresh
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email CITEXT UNIQUE,
  email_verified_at TIMESTAMPTZ,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'agent', 'admin')) DEFAULT 'buyer',
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'suspended')) DEFAULT 'pending',
  is_verified BOOLEAN DEFAULT false,
  is_suspended BOOLEAN DEFAULT false,
  avatar_url TEXT,
  locale TEXT NOT NULL DEFAULT 'en-NG',
  timezone TEXT NOT NULL DEFAULT 'Africa/Lagos',
  marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
  budget_min BIGINT,
  budget_max BIGINT,
  preferred_lgas TEXT[],
  preferred_property_types TEXT[],
  preferred_transaction_type TEXT CHECK (preferred_transaction_type IN ('rent', 'sale', 'any')),
  search_count INT DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- If profiles table already existed from earlier prototypes, ALTER it in place:
DO $$
DECLARE
  r RECORD;
BEGIN
  -- A. Stop referencing auth.users: drop any foreign key referencing auth.users
  FOR r IN (
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'profiles'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_schema = 'auth'
      AND ccu.table_name = 'users'
  ) LOOP
    EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
  END LOOP;

  -- Fallback explicit drop if default name was used
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

  -- B. Alter id column to TEXT to accept Better Auth IDs (UUID strings)
  BEGIN
    ALTER TABLE profiles ALTER COLUMN id TYPE TEXT USING id::TEXT;
  EXCEPTION
    WHEN OTHERS THEN
      -- If foreign keys from child tables prevent altering type directly, keep existing UUID type
      NULL;
  END;

  -- C. Upgrade role constraint to include 'agent'
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('buyer', 'seller', 'agent', 'admin'));

  -- D. Add canonical status enum column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'status') THEN
    ALTER TABLE profiles ADD COLUMN status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'suspended')) DEFAULT 'pending';
  END IF;

  -- E. Add canonical unique case-insensitive email
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE profiles ADD COLUMN email CITEXT;
  END IF;

  -- F. Add email_verified_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_verified_at') THEN
    ALTER TABLE profiles ADD COLUMN email_verified_at TIMESTAMPTZ;
  END IF;

  -- G. Add locale, timezone, marketing_opt_in
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'locale') THEN
    ALTER TABLE profiles ADD COLUMN locale TEXT NOT NULL DEFAULT 'en-NG';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'timezone') THEN
    ALTER TABLE profiles ADD COLUMN timezone TEXT NOT NULL DEFAULT 'Africa/Lagos';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'marketing_opt_in') THEN
    ALTER TABLE profiles ADD COLUMN marketing_opt_in BOOLEAN NOT NULL DEFAULT false;
  END IF;

  -- H. Add last_login_at & deleted_at (soft delete)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_login_at') THEN
    ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'deleted_at') THEN
    ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;

  -- I. Backfill status for existing rows
  UPDATE profiles
  SET status = CASE
    WHEN is_suspended THEN 'suspended'
    WHEN is_verified THEN 'active'
    ELSE 'pending'
  END
  WHERE status IS NULL;
END $$;

-- Ensure unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique ON profiles(email);

-- Canonical View: app_users aliases profiles
CREATE OR REPLACE VIEW app_users AS
  SELECT id, email, email_verified_at, full_name, phone, role, status,
         avatar_url, locale, timezone, marketing_opt_in,
         last_login_at, created_at, updated_at, deleted_at
  FROM profiles;

-- ============================================================
-- 3. QUEUED EMAIL & AUDIT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS email_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  recipient TEXT NOT NULL,
  template TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'bounced')) DEFAULT 'queued',
  provider_id TEXT,
  dedupe_key TEXT UNIQUE,
  payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  event_type TEXT NOT NULL,
  actor_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_email_messages_status ON email_messages(status, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_events_user_id ON audit_events(user_id, created_at DESC);

-- ============================================================
-- 4. CLEANUP OLD SUPABASE AUTH TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
