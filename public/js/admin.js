/**
 * PHOTOVAULT - Admin Dashboard & Analytics Controller (MODULE B & H)
 */

const AdminController = {
  // Global Toast Alert
  showToast: function(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✨</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // Open instant QR Modal for any album
  openQRModal: function(slug, title) {
    const fullUrl = `${window.location.origin}/a/${slug}`;
    let modal = document.getElementById('admin-qr-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'admin-qr-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-dialog">
          <button class="modal-close-btn" onclick="AdminController.closeQRModal()">✕</button>
          <div class="modal-header">
            <div class="modal-tag">INSTANT DELIVERY PASSPORT</div>
            <h3 class="modal-title" id="admin-qr-modal-title">Wedding QR Code</h3>
            <p class="modal-subtitle">Ready for wedding invites, physical photo tables, or WhatsApp broadcast.</p>
          </div>
          <div class="qr-render-box">
            <div id="admin-modal-qrcode"></div>
            <div class="qr-url-pill" id="admin-modal-qrurl"></div>
          </div>
          <div class="qr-actions-row">
            <button class="btn-secondary" onclick="QRUtil.downloadPNG('admin-modal-qrcode', 'wedding_qr.png')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              PNG Card
            </button>
            <button class="btn-secondary" onclick="QRUtil.shareWhatsApp(document.getElementById('admin-modal-qrurl').innerText)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              WhatsApp
            </button>
            <button class="btn-primary" onclick="QRUtil.copyToClipboard(document.getElementById('admin-modal-qrurl').innerText)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy Link
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    document.getElementById('admin-qr-modal-title').innerText = title || 'Client Delivery QR';
    document.getElementById('admin-modal-qrurl').innerText = fullUrl;
    modal.classList.add('active');
    setTimeout(() => {
      QRUtil.render('admin-modal-qrcode', fullUrl, 200);
    }, 50);
  },

  closeQRModal: function() {
    const modal = document.getElementById('admin-qr-modal');
    if (modal) modal.classList.remove('active');
  }
};

window.AdminController = AdminController;
window.showToast = AdminController.showToast;
