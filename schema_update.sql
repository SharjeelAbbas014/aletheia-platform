-- ============================================================
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- 1. Create api_keys table (skip if already done)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  key_value TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default Key',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own API keys."
  ON api_keys FOR SELECT USING ( auth.uid() = user_id );

CREATE POLICY IF NOT EXISTS "Users can create their own API keys."
  ON api_keys FOR INSERT WITH CHECK ( auth.uid() = user_id );

CREATE POLICY IF NOT EXISTS "Users can update their own API keys."
  ON api_keys FOR UPDATE USING ( auth.uid() = user_id );

CREATE POLICY IF NOT EXISTS "Users can delete their own API keys."
  ON api_keys FOR DELETE USING ( auth.uid() = user_id );

-- 2. Create cluster tier/status enums
DO $$ BEGIN
  CREATE TYPE cluster_tier AS ENUM ('fractional', 'dedicated_l4', 'dedicated_t4');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE cluster_status AS ENUM ('provisioning', 'active', 'suspended', 'deleted');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 3. Create clusters table
CREATE TABLE IF NOT EXISTS public.clusters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  tier cluster_tier DEFAULT 'fractional' NOT NULL,
  status cluster_status DEFAULT 'active' NOT NULL,
  endpoint_url TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'shared',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own clusters"
  ON public.clusters FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own clusters"
  ON public.clusters FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own clusters"
  ON public.clusters FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own clusters"
  ON public.clusters FOR DELETE USING (auth.uid() = user_id);

-- 4. Link api_keys to clusters (nullable)
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS cluster_id UUID REFERENCES public.clusters(id) ON DELETE SET NULL;
