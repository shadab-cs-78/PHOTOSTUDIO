# 💍 PHOTOVAULT — Luxury Wedding Photo Delivery Portal (HOTC Aesthetic)
**Prepared for Wedding Photographers | Target Cost: ₹0/month (50GB Free Storage across 4 Providers)**

---

## 🌟 Overview & Features

PHOTOVAULT is a private, client-focused photo delivery portal designed with a high-end editorial aesthetic (*House on the Clouds / HOTC style*).

- 🎨 **Luxury Editorial UI**: Cormorant Garamond serif typography, warm ivory palette (`#FAF8F5`), minimalist cards, and live specs badges.
- ⚡ **Instant QR Code Generation**: 8-character unique QR passport generated *before* photos are uploaded — ready for physical wedding invite prints or WhatsApp broadcast.
- 🔐 **2-Step Client Verification**:
  1. Google OAuth / Gmail sign-in
  2. Live Face Recognition scan (128-d mathematical vector matching via `face-api.js`)
  3. **Privacy First**: Raw face photos are *never* stored on servers (DPDP/GDPR compliant).
  4. Fallback: Max 3 attempts triggers a 1-click **Guest Access Request** queue for wedding relatives.
- 📦 **In-Browser WebP Compression Engine**: HTML5 Canvas compresses large camera RAW/JPEG photos down ~80% in the browser before network upload.
- ☁️ **Smart Multi-Cloud Storage Router**:
  - **Cloudflare R2** (10 GB Primary — Zero Egress charges)
  - **Cloudinary** (25 GB Secondary — Auto transformations)
  - **Backblaze B2** (10 GB Reserve — Cold storage)
  - **Firebase Storage** (5 GB Overflow — Emergency tier)
- 📥 **Fast Client Delivery & Downloads**:
  - Masonry grid layout with full-screen lightbox
  - Single photo lossless download
  - Bulk ZIP download (in-browser packaging via `JSZip`)
  - Expiry countdown timer with automated storage recycling cron.

---

## 📁 Project Structure

```
PHOTO/
├── public/
│   ├── index.html              # HOTC Master Archival Index & Portfolio
│   ├── a/                      # Client Delivery Gallery (/a/[slug])
│   │   └── index.html          # 2-Step Auth + Face Scan + Masonry + ZIP
│   ├── admin/
│   │   ├── login.html          # Photographer Studio login
│   │   ├── dashboard.html      # 4-Provider storage meters, albums, logs
│   │   ├── album-new.html      # Create album + Instant QR + Face enroll
│   │   └── album-manage.html   # Canvas WebP upload manager + Audit trail
│   ├── css/
│   │   └── style.css           # Luxury Editorial Design System
│   └── js/
│       ├── qr.js               # QRCode.js helper, PNG export & WhatsApp share
│       ├── upload.js           # Browser Canvas WebP compression & smart router
│       ├── face.js             # Webcam face scan & 128-d vector similarity
│       ├── gallery.js          # Masonry layout, lightbox, JSZip download
│       ├── auth.js             # Supabase auth / session manager
│       └── admin.js            # Admin dashboard actions & toast alerts
├── api/
│   ├── albums.js               # Serverless CRUD for albums
│   ├── photos.js               # Serverless photos handler
│   ├── upload.js               # Multi-provider signed URL generator
│   ├── verify.js               # Biometric embedding verifier
│   ├── request-access.js       # Fallback guest access queue
│   ├── stats.js                # Access audit logs & storage metrics
│   └── cron/cleanup.js         # Daily automated storage recycling cron
├── supabase-schema.sql         # PostgreSQL schema with RLS & indexes
├── vercel.json                 # Vercel rewrites & daily cron configuration
├── local-server.js             # Zero-dependency local dev server
└── package.json
```

---

## 🚀 How to Run Locally

You can launch the portal immediately without any external npm packages:

```powershell
node local-server.js
```

Then open your browser at:
- **Public Index:** [http://localhost:3000](http://localhost:3000)
- **Client Delivery Gallery:** [http://localhost:3000/a/alia-ranbir](http://localhost:3000/a/alia-ranbir)
- **Admin Dashboard:** [http://localhost:3000/admin/dashboard.html](http://localhost:3000/admin/dashboard.html)
- **New Album Wizard:** [http://localhost:3000/admin/album-new.html](http://localhost:3000/admin/album-new.html)

---

## 🗄️ Database Setup (Supabase)

1. Open your [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor**.
3. Copy and run the contents of [`supabase-schema.sql`](file:///c:/Users/VICTUS/Downloads/PHOTO/supabase-schema.sql).
4. All tables (`albums`, `photos`, `face_profiles`, `access_grants`, `access_logs`, `access_requests`) and Row Level Security (RLS) policies will be configured automatically.

---

## ☁️ Deployment (Vercel)

1. Push this repository to GitHub.
2. Import the repo into [Vercel](https://vercel.com).
3. The included [`vercel.json`](file:///c:/Users/VICTUS/Downloads/PHOTO/vercel.json) will automatically configure URL rewrites (`/a/:slug` → client gallery) and the daily storage cleanup cron job at `00:00 UTC`.
