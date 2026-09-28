/**
 * PHOTOVAULT - QR Code Generation & Share Utility (QRCode.js CDN)
 * Generates instant client delivery QR codes before photos are uploaded.
 */

const QRUtil = {
  // Generate QR code on a target element
  render: function(elementId, url, size = 200) {
    const container = document.getElementById(elementId);
    if (!container) return;
    container.innerHTML = ''; // clear

    if (typeof QRCode !== 'undefined') {
      new QRCode(container, {
        text: url,
        width: size,
        height: size,
        colorDark: "#18181B",
        colorLight: "#FFFFFF",
        correctLevel: QRCode.CorrectLevel.H
      });
    } else {
      // Fallback SVG QR generator if CDN isn't loaded
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
      const img = document.createElement('img');
      img.src = qrApiUrl;
      img.alt = 'QR Code';
      img.className = 'qr-code-canvas';
      container.appendChild(img);
    }
  },

  // Download QR Code as PNG image
  downloadPNG: function(containerId, filename = 'photovault-qr.png') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const img = container.querySelector('img');
    const canvas = container.querySelector('canvas');

    if (canvas) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else if (img) {
      const link = document.createElement('a');
      link.href = img.src;
      link.download = filename;
      link.target = '_blank';
      link.click();
    }
  },

  // Share via WhatsApp
  shareWhatsApp: function(url, title = 'Wedding Photo Gallery') {
    const text = encodeURIComponent(`✨ View our wedding photo gallery on Photovault:\n${url}\n\n(Scan with phone or open link with your Gmail to access photos)`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  },

  // Copy URL to clipboard with UI toast feedback
  copyToClipboard: function(text, successMsg = 'Album link copied to clipboard!') {
    navigator.clipboard.writeText(text).then(() => {
      if (window.showToast) {
        window.showToast(successMsg);
      } else {
        alert(successMsg);
      }
    });
  }
};

window.QRUtil = QRUtil;
