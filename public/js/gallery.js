/**
 * PHOTOVAULT - Clean Client Photo Delivery & Silent Admin Audit Trail
 * Photos are 100% CLEAN (No visible watermarks).
 * Every download is silently logged in the Admin Dashboard with User Gmail, Photo Name, and Timestamp.
 * Includes precise live client expiry countdown and automated expired state protection.
 */

const GalleryManager = {
  currentPhotos: [],
  activeLightboxIndex: 0,

  // Render Masonry Grid
  renderMasonry: function(containerId, photos = []) {
    this.currentPhotos = photos;
    const container = document.getElementById(containerId);
    if (!container) return;

    if (container.dataset.expiredSet === 'true') return;

    if (photos.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <p style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary);">Photos Coming Soon</p>
          <p style="font-size: 0.85rem;">The photographer is curating and uploading the master archival monograph. Check back shortly!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = photos.map((photo, index) => `
      <div class="masonry-item" data-index="${index}">
        <img class="masonry-img" src="${photo.thumbnail_url || photo.url}" alt="${photo.original_name || 'Wedding Photo'}" loading="lazy" onclick="GalleryManager.openLightbox(${index})">
        <div class="masonry-hover-overlay">
          <div class="photo-meta-info">
            <p style="font-weight: 600; font-size: 0.78rem;">#${index + 1} • ${photo.provider || 'Cloud'}</p>
            <p style="font-size: 0.68rem; opacity: 0.85;">${photo.size_bytes ? (photo.size_bytes / (1024*1024)).toFixed(1) + ' MB' : '4K Lossless'}</p>
          </div>
          <button class="photo-dl-btn" title="Download Clean Original Photo" onclick="event.stopPropagation(); GalleryManager.downloadSingleClean('${photo.url}', '${photo.original_name || 'photo_' + (index+1) + '.webp'}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  },

  // Open Lightbox Modal
  openLightbox: function(index) {
    this.activeLightboxIndex = index;
    const photo = this.currentPhotos[index];
    if (!photo) return;

    let lightbox = document.getElementById('lightbox-modal');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.id = 'lightbox-modal';
      lightbox.className = 'modal-overlay active';
      lightbox.innerHTML = `
        <div style="position: relative; max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; align-items: center;">
          <button onclick="GalleryManager.closeLightbox()" style="position: absolute; top: -40px; right: 0; color: #FFFFFF; font-size: 1.5rem; background: transparent; border: none; cursor: pointer;">✕</button>
          <img id="lightbox-main-img" style="max-height: 80vh; max-width: 85vw; object-fit: contain; border-radius: 4px; box-shadow: var(--shadow-xl);" src="" alt="Enlarged Photo">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-top: 1rem; color: #FFFFFF; gap: 1rem;">
            <button onclick="GalleryManager.prevLightbox()" style="color: #FFF; font-size: 0.95rem; padding: 6px 14px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 4px; cursor: pointer;">❮ Previous</button>
            <span id="lightbox-counter" style="font-size: 0.85rem; font-family: var(--font-mono);"></span>
            <button onclick="GalleryManager.nextLightbox()" style="color: #FFF; font-size: 0.95rem; padding: 6px 14px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 4px; cursor: pointer;">Next ❯</button>
          </div>
        </div>
      `;
      document.body.appendChild(lightbox);
    } else {
      lightbox.classList.add('active');
    }

    document.getElementById('lightbox-main-img').src = photo.url;
    document.getElementById('lightbox-counter').innerText = `${index + 1} of ${this.currentPhotos.length}`;
  },

  closeLightbox: function() {
    const lightbox = document.getElementById('lightbox-modal');
    if (lightbox) lightbox.classList.remove('active');
  },

  prevLightbox: function() {
    if (this.currentPhotos.length === 0) return;
    this.activeLightboxIndex = (this.activeLightboxIndex - 1 + this.currentPhotos.length) % this.currentPhotos.length;
    this.openLightbox(this.activeLightboxIndex);
  },

  nextLightbox: function() {
    if (this.currentPhotos.length === 0) return;
    this.activeLightboxIndex = (this.activeLightboxIndex + 1) % this.currentPhotos.length;
    this.openLightbox(this.activeLightboxIndex);
  },

  // 📝 SILENT AUDIT LOGGER (Records directly to Admin Dashboard)
  recordDownloadLog: function(eventName, photoName) {
    const userEmail = localStorage.getItem('photovault_client_email') || 'client.guest@katnicreation.com';
    const albumSlug = (typeof currentSlug !== 'undefined') ? currentSlug : 'wedding-album';
    
    // Detect simple device
    const ua = navigator.userAgent;
    let device = 'Desktop (Chrome/Browser)';
    if (/android/i.test(ua)) device = 'Android Phone';
    else if (/iphone|ipad|ipod/i.test(ua)) device = 'iPhone / iOS';

    const logEntry = {
      id: 'log_' + Date.now(),
      email: userEmail,
      albumSlug: albumSlug,
      event: eventName,
      photoName: photoName || 'Wedding Photo',
      device: device,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      timestamp: Date.now()
    };

    const logs = JSON.parse(localStorage.getItem('photovault_access_logs') || '[]');
    logs.unshift(logEntry);
    localStorage.setItem('photovault_access_logs', JSON.stringify(logs.slice(0, 100)));

    fetch('/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    }).catch(() => {});
  },

  // 1. Single Photo Clean Download (Zero Watermark on Photo + Logged in Admin)
  downloadSingleClean: async function(url, filename) {
    const cleanFilename = filename || 'wedding_photo.webp';
    this.recordDownloadLog('DOWNLOAD_SINGLE', cleanFilename);

    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = cleanFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      if (window.showToast) window.showToast(`✓ Downloaded: ${cleanFilename}`);
    } catch (err) {
      window.open(url, '_blank');
    }
  },

  // Expiry Countdown Timer & Client Access Controller
  startExpiryCountdown: function(elementId, expiresAtIso, createdAtIso) {
    const el = document.getElementById(elementId);
    if (!el) return;

    // Fallback if expires_at is not explicitly provided: compute 7 days from created_at or now
    let targetIso = expiresAtIso;
    if (!targetIso || targetIso === 'never' || targetIso === '0') {
      const baseTime = createdAtIso ? new Date(createdAtIso).getTime() : Date.now();
      targetIso = new Date(baseTime + 7 * 86400000).toISOString();
    }

    const expiryDateObj = new Date(targetIso);
    const dateFormatted = expiryDateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatted = expiryDateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    function update() {
      const now = Date.now();
      const diff = expiryDateObj.getTime() - now;

      if (diff <= 0) {
        el.className = 'countdown-timer-box expired';
        el.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; color: #E11D48; font-weight: 700;">
              <span>⚠️ ACCESS EXPIRED</span>
              <span style="font-size: 0.72rem; opacity: 0.9;">(Cycle ended on ${dateFormatted})</span>
            </div>
            <span style="font-size: 0.68rem; color: #E11D48; font-weight: 600;">Photos Archived</span>
          </div>
        `;

        // If gallery is active, show expired notice
        const galleryGrid = document.getElementById('masonry-gallery-container');
        if (galleryGrid && (!galleryGrid.dataset.expiredSet)) {
          galleryGrid.dataset.expiredSet = "true";
          galleryGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem; background: var(--bg-card); border: 1.5px solid rgba(225,29,72,0.3); border-radius: var(--radius-xs); margin: 2rem 0;">
              <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">⏳</div>
              <h2 style="font-family: var(--font-serif); font-size: 1.6rem; color: #E11D48; margin-bottom: 0.5rem;">This Album Delivery Cycle Has Expired</h2>
              <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 500px; margin: 0 auto 1.5rem;">
                As per studio archival policy, this private wedding gallery was scheduled for automatic storage cleanup on <strong>${dateFormatted}</strong>.
              </p>
              <a href="https://wa.me/916264220191?text=Hello%20The%20Katni%20Creation,%20my%20wedding%20album%20access%20expired%20and%20I%20need%20a%20re-upload." target="_blank" class="btn-primary" style="display: inline-flex; justify-content: center; padding: 10px 20px;">
                💬 Contact Studio for Re-Activation (+91 6264220191)
              </a>
            </div>
          `;
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      let countdownBadge = '';
      if (days > 0) countdownBadge += `<strong style="color: #E11D48; font-family: var(--font-mono);">${days}d</strong> `;
      countdownBadge += `<strong style="color: #E11D48; font-family: var(--font-mono);">${hours}h ${mins}m ${secs}s</strong>`;

      const isUrgent = diff < 24 * 60 * 60 * 1000;

      el.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; width: 100%;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.95rem;">⏳</span>
            <span>ACCESS VALIDITY: ${countdownBadge}</span>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500;">
            Auto-Purges on <strong style="color: var(--text-primary); font-family: var(--font-mono);">${dateFormatted} (${timeFormatted})</strong>
          </div>
        </div>
      `;

      if (isUrgent) {
        el.style.border = '1px solid rgba(225, 29, 72, 0.4)';
        el.style.background = 'rgba(225, 29, 72, 0.08)';
      }
    }

    update();
    setInterval(update, 1000);
  }
};

window.GalleryManager = GalleryManager;
