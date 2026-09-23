-- ============================================================
-- AbujaHommes AI — Slice 3 Migration: Buyer-Seller Chat & Realtime Messaging
-- Description:
-- 1. Creates `conversations` table linking a buyer, a seller, and a property listing.
--    - Unique constraint on (listing_id, buyer_id) so each buyer has exactly one thread per property.
--    - Foreign keys to profiles(id) and listings(id) on delete cascade.
-- 2. Creates `messages` table storing message history.
--    - Indexed by (conversation_id, created_at ASC) for sub-second timeline retrieval.
-- 3. Safely and idempotently adds tables to supabase_realtime publication if active.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY DEFAULT ('conv-' || floor(extract(epoch from now()) * 1000)::text || '-' || substr(md5(random()::text), 1, 6)),
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_conversations_listing_buyer UNIQUE (listing_id, buyer_id)
);

-- 2. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT ('msg-' || floor(extract(epoch from now()) * 1000)::text || '-' || substr(md5(random()::text), 1, 6)),
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing ON conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- 4. REALTIME REPLICATION (SAFE & IDEMPOTENT)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
    EXCEPTION 
      WHEN duplicate_object THEN NULL;
      WHEN OTHERS THEN RAISE NOTICE 'Notice: Could not add conversations to supabase_realtime: %', SQLERRM;
    END;

    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    EXCEPTION 
      WHEN duplicate_object THEN NULL;
      WHEN OTHERS THEN RAISE NOTICE 'Notice: Could not add messages to supabase_realtime: %', SQLERRM;
    END;
  END IF;
END $$;
