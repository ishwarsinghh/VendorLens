-- Run this entire script in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run

-- ─────────────────────────────────────────────
-- TABLE 1: Vendors
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  website      TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- TABLE 2: Proposals
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proposals (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id                 UUID REFERENCES vendors(id) ON DELETE CASCADE,
  total_cost                NUMERIC(15,2),
  implementation_time_weeks INTEGER,
  sla_uptime                NUMERIC(6,3),
  payment_terms             TEXT,
  warranty_months           INTEGER,
  support_level             TEXT,
  contract_length_months    INTEGER,
  penalties_clause          BOOLEAN DEFAULT FALSE,
  raw_text                  TEXT,
  extraction_confidence     NUMERIC(4,3),
  created_at                TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- TABLE 3: Feature Sets
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feature_sets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id  UUID REFERENCES proposals(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  is_included  BOOLEAN DEFAULT FALSE,
  notes        TEXT
);

-- ─────────────────────────────────────────────
-- TABLE 4: Requirements
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS requirements (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id                TEXT NOT NULL DEFAULT 'default',
  feature_name              TEXT NOT NULL,
  is_mandatory              BOOLEAN DEFAULT TRUE,
  max_budget                NUMERIC(15,2),
  min_sla_uptime            NUMERIC(6,3),
  max_implementation_weeks  INTEGER
);

-- ─────────────────────────────────────────────
-- Enable Row Level Security (optional for hackathon)
-- Uncomment if you add Supabase Auth later
-- ─────────────────────────────────────────────
-- ALTER TABLE vendors   ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE feature_sets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
