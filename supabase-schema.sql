-- ==============================================================================
-- PHOTOVAULT - PostgreSQL Database Schema (Supabase)
-- Luxury Wedding Photo Delivery Portal with QR & Face Verification
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ALBUMS TABLE
CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(12) UNIQUE NOT NULL, -- 8-character unique alphanumeric slug
  title VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  location VARCHAR(255) DEFAULT 'Mumbai, India',
  category VARCHAR(100) DEFAULT 'ROYAL PALACES & FORTS',
  guest_count VARCHAR(50) DEFAULT '150 Guests',
  description TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'ready' CHECK (status IN ('draft', 'ready', 'expired', 'archived')),
  expires_at TIMESTAMP WITH TIME ZONE,
  no_expiry BOOLEAN DEFAULT FALSE,
  face_required BOOLEAN DEFAULT TRUE,
  strict_face BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. FACE PROFILES TABLE (Embeddings only - raw face photos NEVER stored)
CREATE TABLE IF NOT EXISTS face_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  embedding JSONB NOT NULL, -- 128-dimensional vector float array
  label VARCHAR(100) DEFAULT 'Couple / VIP Guest',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PHOTOS TABLE (Multi-cloud smart routing metadata)
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  provider VARCHAR(30) NOT NULL CHECK (provider IN ('cloudflare-r2', 'cloudinary', 'backblaze-b2', 'firebase')),
  storage_key TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  size_bytes BIGINT DEFAULT 0,
  original_name VARCHAR(255),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ACCESS GRANTS TABLE (Persistent permission per verified email/album)
CREATE TABLE IF NOT EXISTS access_grants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  face_verified_at TIMESTAMP WITH TIME ZONE,
  granted_via VARCHAR(50) DEFAULT 'face' CHECK (granted_via IN ('face', 'admin_approval', 'google_oauth')),
  access_count INTEGER DEFAULT 1,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_album_email UNIQUE (album_id, email)
);

-- 5. ACCESS LOGS TABLE (Audit trail for analytics)
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  email VARCHAR(255),
  event VARCHAR(50) NOT NULL CHECK (event IN ('login', 'face_scan', 'face_fail', 'view', 'download_single', 'download_zip', 'request_submitted')),
  photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
  device TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ACCESS REQUESTS TABLE (Fallback approval queue for family/friends)
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  reason TEXT,
  relation VARCHAR(100) DEFAULT 'Family / Guest',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES for fast lookup
CREATE INDEX IF NOT EXISTS idx_albums_slug ON albums(slug);
CREATE INDEX IF NOT EXISTS idx_photos_album ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_access_grants_lookup ON access_grants(album_id, email);
CREATE INDEX IF NOT EXISTS idx_access_logs_album ON access_logs(album_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_requests_pending ON access_requests(album_id, status);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Allow public reading of albums and photos (metadata verification)
CREATE POLICY "Public can view active albums" ON albums FOR SELECT USING (status != 'archived');
CREATE POLICY "Public can view album photos" ON photos FOR SELECT USING (true);
CREATE POLICY "Public can insert access logs" ON access_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can request access" ON access_requests FOR INSERT WITH CHECK (true);
