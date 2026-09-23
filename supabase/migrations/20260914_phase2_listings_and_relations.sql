-- AbujaHommes AI — Phase 2 Migration: Listings, Media, Favourites, Saved Searches & Enquiries
-- Description:
-- 1. Creates/Upgrades the core `listings` table:
--    - Strictly typed for Abuja/FCT property intelligence
--    - owner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE
--    - Currency: integer Nigerian Naira (BIGINT)
--    - land_size_sqm BIGINT NULL
--    - PropertyType & TitleType CHECK constraints matching src/types/property.ts exactly
--    - Lifecycle status CHECK (pending, active, paused, sold, rejected)
--    - Full AI valuation and fraud scoring intelligence columns
-- 2. Creates `listing_media` table (display_order, is_cover, url)
-- 3. Creates `favourites` table (user_id TEXT REFERENCES profiles(id), listing_id TEXT REFERENCES listings(id))
-- 4. Creates `saved_searches` table (user_id TEXT REFERENCES profiles(id), alert_enabled, filters JSONB)
-- 5. Creates `enquiries` table (listing_id, buyer_id, seller_id, message, status)
-- 6. Creates high-performance compound indexes for search, owner dashboards, and buyer bookmarks

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. CORE LISTINGS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY DEFAULT ('prop-' || floor(extract(epoch from now()) * 1000)::text),
  owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN (
    'detached',
    'semi-detached',
    'flat',
    'terrace',
    'bungalow',
    'duplex',
    'land',
    'commercial'
  )),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('rent', 'sale')),
  lga TEXT NOT NULL CHECK (lga IN ('AMAC', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Abaji')),
  location TEXT NOT NULL,
  address TEXT,
  market_tier TEXT CHECK (market_tier IN ('Premium', 'Prime', 'Mid', 'Emerging', 'Outer', 'Rural')),
  bedrooms INT NOT NULL DEFAULT 0 CHECK (bedrooms BETWEEN 0 AND 30),
  bathrooms INT NOT NULL DEFAULT 0 CHECK (bathrooms BETWEEN 0 AND 30),
  land_size_sqm BIGINT,
  asking_price BIGINT NOT NULL CHECK (asking_price > 0),
  ai_price_estimate BIGINT,
  ai_price_min BIGINT,
  ai_price_max BIGINT,
  price_confidence TEXT CHECK (price_confidence IN ('high', 'medium', 'low')),
  description TEXT NOT NULL DEFAULT '',
  title_type TEXT CHECK (title_type IN (
    'C of O',
    'Right of Occupancy',
    'Deed of Assignment',
    'Governors Consent',
    'FCDA Allocation',
    'FHA Allocation',
    'Survey',
    'Other'
  )),
  amenities TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'sold', 'rejected')),
  predicted_price_min BIGINT,
  predicted_price_max BIGINT,
  predicted_confidence TEXT CHECK (predicted_confidence IN ('high', 'medium', 'low')),
  fraud_score INT NOT NULL DEFAULT 0 CHECK (fraud_score BETWEEN 0 AND 100),
  fraud_risk_level TEXT NOT NULL DEFAULT 'low' CHECK (fraud_risk_level IN ('low', 'medium', 'high', 'critical')),
  fraud_flags JSONB DEFAULT '[]'::jsonb,
  fraud_red_flags TEXT[] DEFAULT '{}',
  fraud_recommendation TEXT,
  last_valued_at TIMESTAMPTZ,
  last_scored_at TIMESTAMPTZ,
  views INT NOT NULL DEFAULT 0,
  saves INT NOT NULL DEFAULT 0,
  enquiries INT NOT NULL DEFAULT 0,
  data_source TEXT DEFAULT 'seller_submitted',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Handle schema upgrades if `listings` existed previously from earlier prototype
DO $$
BEGIN
  -- 1. Ensure id column is TEXT
  BEGIN
    ALTER TABLE listings ALTER COLUMN id TYPE TEXT USING id::TEXT;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- 2. Ensure owner_id column exists and references profiles(id)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'owner_id') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'seller_id') THEN
      ALTER TABLE listings RENAME COLUMN seller_id TO owner_id;
      BEGIN
        ALTER TABLE listings ALTER COLUMN owner_id TYPE TEXT USING owner_id::TEXT;
      EXCEPTION WHEN OTHERS THEN NULL;
      END;
    ELSE
      ALTER TABLE listings ADD COLUMN owner_id TEXT;
    END IF;
  END IF;

  -- 3. Ensure foreign key on owner_id -> profiles(id)
  BEGIN
    ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_seller_id_fkey;
    ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_owner_id_fkey;
    ALTER TABLE listings ADD CONSTRAINT listings_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- 4. Ensure land_size_sqm exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'land_size_sqm') THEN
    ALTER TABLE listings ADD COLUMN land_size_sqm BIGINT;
  END IF;

  -- 5. Ensure intelligence columns exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'predicted_price_min') THEN
    ALTER TABLE listings ADD COLUMN predicted_price_min BIGINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'predicted_price_max') THEN
    ALTER TABLE listings ADD COLUMN predicted_price_max BIGINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'predicted_confidence') THEN
    ALTER TABLE listings ADD COLUMN predicted_confidence TEXT CHECK (predicted_confidence IN ('high', 'medium', 'low'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'fraud_flags') THEN
    ALTER TABLE listings ADD COLUMN fraud_flags JSONB DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'last_valued_at') THEN
    ALTER TABLE listings ADD COLUMN last_valued_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'last_scored_at') THEN
    ALTER TABLE listings ADD COLUMN last_scored_at TIMESTAMPTZ;
  END IF;

  -- 6. Refresh CHECK constraints to exact product enums
  ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_property_type_check;
  ALTER TABLE listings ADD CONSTRAINT listings_property_type_check CHECK (property_type IN (
    'detached',
    'semi-detached',
    'flat',
    'terrace',
    'bungalow',
    'duplex',
    'land',
    'commercial'
  ));

  ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_title_type_check;
  ALTER TABLE listings ADD CONSTRAINT listings_title_type_check CHECK (title_type IN (
    'C of O',
    'Right of Occupancy',
    'Deed of Assignment',
    'Governors Consent',
    'FCDA Allocation',
    'FHA Allocation',
    'Survey',
    'Other'
  ));

  ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
  ALTER TABLE listings ADD CONSTRAINT listings_status_check CHECK (status IN (
    'pending',
    'active',
    'paused',
    'sold',
    'rejected'
  ));
END $$;

-- ============================================================
-- 2. LISTING MEDIA (Photos & Ordering)
-- ============================================================

CREATE TABLE IF NOT EXISTS listing_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. FAVOURITES (Saved Listings)
-- ============================================================

CREATE TABLE IF NOT EXISTS favourites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, listing_id)
);

-- Handle type upgrades if favourites already existed with UUID
DO $$
BEGIN
  BEGIN
    ALTER TABLE favourites DROP CONSTRAINT IF EXISTS favourites_user_id_fkey;
    ALTER TABLE favourites DROP CONSTRAINT IF EXISTS favourites_listing_id_fkey;
    ALTER TABLE favourites ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    ALTER TABLE favourites ALTER COLUMN listing_id TYPE TEXT USING listing_id::TEXT;
    ALTER TABLE favourites ADD CONSTRAINT favourites_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    ALTER TABLE favourites ADD CONSTRAINT favourites_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- ============================================================
-- 4. SAVED SEARCHES & ALERTS
-- ============================================================

CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query_text TEXT,
  filters JSONB DEFAULT '{}'::jsonb,
  result_count INT NOT NULL DEFAULT 0,
  alert_enabled BOOLEAN NOT NULL DEFAULT false,
  last_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Handle type upgrades if saved_searches already existed with UUID user_id
DO $$
BEGIN
  BEGIN
    ALTER TABLE saved_searches DROP CONSTRAINT IF EXISTS saved_searches_user_id_fkey;
    ALTER TABLE saved_searches ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    ALTER TABLE saved_searches ADD CONSTRAINT saved_searches_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- ============================================================
-- 5. LISTING ENQUIRIES
-- ============================================================

CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  buyer_phone TEXT,
  buyer_email TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Handle type upgrades if enquiries already existed with UUID foreign keys
DO $$
BEGIN
  BEGIN
    ALTER TABLE enquiries DROP CONSTRAINT IF EXISTS enquiries_listing_id_fkey;
    ALTER TABLE enquiries DROP CONSTRAINT IF EXISTS enquiries_buyer_id_fkey;
    ALTER TABLE enquiries DROP CONSTRAINT IF EXISTS enquiries_seller_id_fkey;
    ALTER TABLE enquiries ALTER COLUMN listing_id TYPE TEXT USING listing_id::TEXT;
    ALTER TABLE enquiries ALTER COLUMN buyer_id TYPE TEXT USING buyer_id::TEXT;
    ALTER TABLE enquiries ALTER COLUMN seller_id TYPE TEXT USING seller_id::TEXT;
    ALTER TABLE enquiries ADD CONSTRAINT enquiries_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
    ALTER TABLE enquiries ADD CONSTRAINT enquiries_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES profiles(id) ON DELETE CASCADE;
    ALTER TABLE enquiries ADD CONSTRAINT enquiries_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- ============================================================
-- 6. PERFORMANCE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_lga ON listings(lga);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_property_type ON listings(property_type);
CREATE INDEX IF NOT EXISTS idx_listings_transaction_type ON listings(transaction_type);
CREATE INDEX IF NOT EXISTS idx_listings_asking_price ON listings(asking_price);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_media_listing_id ON listing_media(listing_id, display_order);
CREATE INDEX IF NOT EXISTS idx_favourites_user_id ON favourites(user_id);
CREATE INDEX IF NOT EXISTS idx_favourites_listing_id ON favourites(listing_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_seller_id ON enquiries(seller_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_buyer_id ON enquiries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_listing_id ON enquiries(listing_id);
