-- ==============================================================================
-- THE KATNI CREATION — PHOTOVAULT PRODUCTION DATABASE SCHEMA (SUPABASE SQL)
-- Run this entire script in your Supabase SQL Editor once to initialize.
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ALBUMS TABLE
CREATE TABLE IF NOT EXISTS public.albums (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  client_email TEXT NOT NULL,
  location TEXT DEFAULT 'Katni • M.P.',
  category TEXT DEFAULT 'wedding',
  guest_pin TEXT DEFAULT '2026',
  storage_strategy TEXT DEFAULT 'auto',
  status TEXT DEFAULT 'ready',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Indexing for fast search and cleanup queries
CREATE INDEX IF NOT EXISTS idx_albums_slug ON public.albums(slug);
CREATE INDEX IF NOT EXISTS idx_albums_created_at ON public.albums(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_albums_expires_at ON public.albums(expires_at) WHERE expires_at IS NOT NULL;

-- 3. PHOTOS TABLE
CREATE TABLE IF NOT EXISTS public.photos (
  id TEXT PRIMARY KEY,
  album_slug TEXT NOT NULL REFERENCES public.albums(slug) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  original_name TEXT DEFAULT 'photo.webp',
  provider TEXT DEFAULT 'cloudinary',
  size_bytes BIGINT DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast photo loading by album
CREATE INDEX IF NOT EXISTS idx_photos_album_slug ON public.photos(album_slug);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON public.photos(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_provider ON public.photos(provider);

-- 4. ACCESS SURVEILLANCE & DOWNLOAD AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.access_logs (
  id BIGSERIAL PRIMARY KEY,
  album_slug TEXT,
  email TEXT NOT NULL,
  event TEXT NOT NULL, -- e.g. 'DOWNLOAD_SINGLE', 'DOWNLOAD_ZIP', 'PORTAL_UNLOCK'
  photo_name TEXT,
  device TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_album ON public.access_logs(album_slug);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON public.access_logs(created_at DESC);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read & service role full access
CREATE POLICY "Allow public read on albums" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on albums" ON public.albums FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon delete on albums" ON public.albums FOR DELETE USING (true);
CREATE POLICY "Allow anon update on albums" ON public.albums FOR UPDATE USING (true);

CREATE POLICY "Allow public read on photos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on photos" ON public.photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon delete on photos" ON public.photos FOR DELETE USING (true);

CREATE POLICY "Allow public read on access_logs" ON public.access_logs FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on access_logs" ON public.access_logs FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- 6. SEED INITIAL DEMO RECORD (Safe upsert)
-- ==============================================================================
INSERT INTO public.albums (id, slug, title, client_email, location, category, guest_pin, storage_strategy, status, expires_at)
VALUES (
  'alb_demo_1',
  'alia-ranbir',
  'Alia & Ranbir',
  'alia.b@gmail.com',
  'Vastu • Mumbai',
  'wedding',
  '2026',
  'auto',
  'ready',
  NOW() + INTERVAL '30 days'
)
ON CONFLICT (slug) DO NOTHING;
