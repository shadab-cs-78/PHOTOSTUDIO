/**
 * PHOTOVAULT - Browser-Side WebP Compression & 100% Zero-Card Free Storage Router
 * No Credit/Debit Card Required Anywhere!
 * 1. Cloudinary: 25GB Free (Primary - Zero Card)
 * 2. Supabase / ImageKit: 10GB Free (Secondary - Zero Card)
 * 3. Backblaze B2: 10GB Free (Reserve - Zero Card)
 * 4. Firebase Storage: 5GB Free (Overflow - Zero Card)
 */

const UploadManager = {
  storageState: {
    'cloudinary': { limitGB: 25.0, usedGB: 4.2, name: 'Cloudinary (Primary 25GB - Zero Card)' },
    'supabase-storage': { limitGB: 10.0, usedGB: 1.5, name: 'Supabase Storage (Secondary 10GB - Zero Card)' },
    'backblaze-b2': { limitGB: 10.0, usedGB: 0.8, name: 'Backblaze B2 (Reserve 10GB - Zero Card)' },
    'firebase': { limitGB: 5.0, usedGB: 0.2, name: 'Firebase Storage (Overflow 5GB - Zero Card)' }
  },

  // Smart Zero-Card Router Logic
  getOptimalProvider: function(batchSizeMB = 0) {
    const batchSizeGB = batchSizeMB / 1024;
    if (this.storageState['cloudinary'].usedGB + batchSizeGB <= 24.0) {
      return 'cloudinary';
    }
    if (this.storageState['supabase-storage'].usedGB + batchSizeGB <= 9.0) {
      return 'supabase-storage';
    }
    if (this.storageState['backblaze-b2'].usedGB + batchSizeGB <= 9.0) {
      return 'backblaze-b2';
    }
    return 'firebase';
  },

  // In-browser WebP compression using HTML5 Canvas API (~80% savings)
  compressToWebP: async function(file, quality = 0.82, maxDimension = 2800) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas WebP conversion failed'));
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: 'image/webp',
              lastModified: Date.now()
            });

            const thumbCanvas = document.createElement('canvas');
            const thumbMax = 500;
            let tw = width, th = height;
            if (tw > th) {
              th = Math.round((th * thumbMax) / tw);
              tw = thumbMax;
            } else {
              tw = Math.round((tw * thumbMax) / th);
              th = thumbMax;
            }
            thumbCanvas.width = tw;
            thumbCanvas.height = th;
            const tCtx = thumbCanvas.getContext('2d');
            tCtx.drawImage(img, 0, 0, tw, th);

            thumbCanvas.toBlob((thumbBlob) => {
              resolve({
                originalFile: file,
                compressedFile: compressedFile,
                originalSize: file.size,
                compressedSize: compressedFile.size,
                savingsPercent: Math.round((1 - (compressedFile.size / file.size)) * 100),
                thumbnailBlob: thumbBlob,
                previewUrl: URL.createObjectURL(blob)
              });
            }, 'image/webp', 0.7);
          },
          'image/webp',
          quality
        );
      };

      reader.readAsDataURL(file);
    });
  },

  calculateBatchMetrics: function(files) {
    let totalOriginalBytes = 0;
    Array.from(files).forEach(f => totalOriginalBytes += f.size);
    const estCompressedBytes = Math.round(totalOriginalBytes * 0.22);
    const estCompressedMB = (estCompressedBytes / (1024 * 1024)).toFixed(1);
    const originalMB = (totalOriginalBytes / (1024 * 1024)).toFixed(1);
    const provider = this.getOptimalProvider(estCompressedMB);

    return {
      fileCount: files.length,
      originalMB: originalMB,
      estCompressedMB: estCompressedMB,
      savingsPercent: 78,
      recommendedProvider: provider,
      providerName: this.storageState[provider].name
    };
  }
};

window.UploadManager = UploadManager;
