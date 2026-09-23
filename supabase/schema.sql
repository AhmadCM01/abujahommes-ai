-- AbujaHommes AI - Complete Supabase Database Schema
-- Run in Supabase SQL Editor

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Better Auth Core Identity Tables
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

-- ============================================================
-- Canonical Profiles Table (Application Identity)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email CITEXT UNIQUE,
  email_verified_at TIMESTAMPTZ,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('buyer','seller','agent','admin')) DEFAULT 'buyer',
  status TEXT NOT NULL CHECK (status IN ('pending','active','suspended')) DEFAULT 'pending',
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
  preferred_transaction_type TEXT CHECK (preferred_transaction_type IN ('rent','sale','any')),
  search_count INT DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Listings
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('detached','semi-detached','flat','land','commercial')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('rent','sale')),
  lga TEXT NOT NULL CHECK (lga IN ('AMAC','Bwari','Gwagwalada','Kuje','Kwali','Abaji')),
  location TEXT NOT NULL,
  address TEXT,
  market_tier TEXT CHECK (market_tier IN ('Premium','Prime','Mid','Emerging','Outer','Rural')),
  bedrooms INT CHECK (bedrooms BETWEEN 0 AND 20),
  bathrooms INT CHECK (bathrooms BETWEEN 0 AND 20),
  asking_price BIGINT NOT NULL CHECK (asking_price > 0),
  ai_price_estimate BIGINT,
  ai_price_min BIGINT,
  ai_price_max BIGINT,
  price_confidence TEXT CHECK (price_confidence IN ('high','medium','low')),
  description TEXT,
  title_type TEXT CHECK (title_type IN ('C of O','Right of Occupancy','Deed of Assignment','Governors Consent','Survey','Other')),
  amenities TEXT[],
  images TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','rejected','paused','sold')),
  fraud_score INT DEFAULT 0 CHECK (fraud_score BETWEEN 0 AND 100),
  fraud_risk_level TEXT DEFAULT 'low' CHECK (fraud_risk_level IN ('low','medium','high','critical')),
  fraud_red_flags TEXT[],
  fraud_recommendation TEXT,
  views INT DEFAULT 0,
  saves INT DEFAULT 0,
  enquiries INT DEFAULT 0,
  data_source TEXT DEFAULT 'seller_submitted',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraped listings (training data source)
CREATE TABLE IF NOT EXISTS scraped_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('propertypro','jiji','nigerian_property_centre')),
  source_id TEXT,
  source_url TEXT,
  raw_data JSONB NOT NULL,
  lga TEXT,
  location TEXT,
  location_normalised TEXT,
  market_tier TEXT,
  property_type TEXT,
  transaction_type TEXT,
  bedrooms INT,
  bathrooms INT,
  price BIGINT,
  price_annual BIGINT,
  title_type TEXT,
  amenities TEXT[],
  is_price_outlier BOOLEAN DEFAULT false,
  is_cross_referenced BOOLEAN DEFAULT false,
  confidence_score FLOAT DEFAULT 0,
  included_in_training BOOLEAN DEFAULT false,
  processed BOOLEAN DEFAULT false,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, source_id)
);

-- ML model versions
CREATE TABLE IF NOT EXISTS ml_model_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  training_record_count INT,
  mae FLOAT,
  rmse FLOAT,
  r2_score FLOAT,
  mae_percentage FLOAT,
  lgas_covered TEXT[],
  property_types_covered TEXT[],
  is_active BOOLEAN DEFAULT false,
  training_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Saved searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query_text TEXT,
  filters JSONB,
  result_count INT DEFAULT 0,
  alert_enabled BOOLEAN DEFAULT false,
  last_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favourites
CREATE TABLE IF NOT EXISTS favourites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Search history
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  query_text TEXT,
  filters JSONB,
  detected_language TEXT,
  result_count INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price prediction history
CREATE TABLE IF NOT EXISTS price_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lga TEXT NOT NULL,
  location TEXT,
  property_type TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  bedrooms INT,
  title_type TEXT,
  amenities TEXT[],
  predicted_price BIGINT NOT NULL,
  predicted_min BIGINT NOT NULL,
  predicted_max BIGINT NOT NULL,
  confidence_level TEXT,
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'listing_approved','listing_rejected','new_listing_match',
    'price_drop','fraud_alert','enquiry_received',
    'saved_search_match','system_message'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listing enquiries
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  buyer_phone TEXT,
  buyer_email TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','read','replied','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id TEXT REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email messages (Queue, delivery state, idempotency)
CREATE TABLE IF NOT EXISTS email_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
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

-- Security Audit events
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  actor_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users read own profile" ON profiles;
  CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);

  DROP POLICY IF EXISTS "Users update own profile" ON profiles;
  CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

  DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
  CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

  DROP POLICY IF EXISTS "Admins read all profiles" ON profiles;
  CREATE POLICY "Admins read all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

  DROP POLICY IF EXISTS "Anyone reads active listings" ON listings;
  CREATE POLICY "Anyone reads active listings" ON listings FOR SELECT USING (status = 'active');

  DROP POLICY IF EXISTS "Sellers read own listings" ON listings;
  CREATE POLICY "Sellers read own listings" ON listings FOR SELECT USING (auth.uid() = seller_id);

  DROP POLICY IF EXISTS "Sellers insert own listings" ON listings;
  CREATE POLICY "Sellers insert own listings" ON listings FOR INSERT WITH CHECK (auth.uid() = seller_id);

  DROP POLICY IF EXISTS "Sellers update own listings" ON listings;
  CREATE POLICY "Sellers update own listings" ON listings FOR UPDATE USING (auth.uid() = seller_id);

  DROP POLICY IF EXISTS "Admins manage all listings" ON listings;
  CREATE POLICY "Admins manage all listings" ON listings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

  DROP POLICY IF EXISTS "Users manage own saved searches" ON saved_searches;
  CREATE POLICY "Users manage own saved searches" ON saved_searches FOR ALL USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users manage own favourites" ON favourites;
  CREATE POLICY "Users manage own favourites" ON favourites FOR ALL USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users manage own history" ON search_history;
  CREATE POLICY "Users manage own history" ON search_history FOR ALL USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users manage own predictions" ON price_predictions;
  CREATE POLICY "Users manage own predictions" ON price_predictions FOR ALL USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users read own notifications" ON notifications;
  CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
  CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Buyers read own enquiries" ON enquiries;
  CREATE POLICY "Buyers read own enquiries" ON enquiries FOR SELECT USING (auth.uid() = buyer_id);

  DROP POLICY IF EXISTS "Sellers read own enquiries" ON enquiries;
  CREATE POLICY "Sellers read own enquiries" ON enquiries FOR SELECT USING (auth.uid() = seller_id);

  DROP POLICY IF EXISTS "Buyers insert enquiries" ON enquiries;
  CREATE POLICY "Buyers insert enquiries" ON enquiries FOR INSERT WITH CHECK (auth.uid() = buyer_id);

  DROP POLICY IF EXISTS "Admins read all" ON audit_log;
  CREATE POLICY "Admins read all" ON audit_log FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

  DROP POLICY IF EXISTS "Anyone reads model versions" ON ml_model_versions;
  CREATE POLICY "Anyone reads model versions" ON ml_model_versions FOR SELECT USING (true);
END $$;

-- Auto create profile on signup
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS listings_updated_at ON listings;
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
