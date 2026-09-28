/**
 * PHOTOVAULT - Universal Safe Configuration Parser (100% Zero-Card Free Storages)
 */

export function getAppConfig() {
  let config = {};

  if (process.env.PHOTOVAULT_SECRETS) {
    try {
      config = typeof process.env.PHOTOVAULT_SECRETS === 'string' 
        ? JSON.parse(process.env.PHOTOVAULT_SECRETS) 
        : process.env.PHOTOVAULT_SECRETS;
    } catch (e) {
      console.error('[CONFIG ERROR] Failed to parse PHOTOVAULT_SECRETS JSON:', e);
    }
  }

  return {
    supabase: {
      url: config.supabase?.url || process.env.SUPABASE_URL || 'https://mock.supabase.co',
      anonKey: config.supabase?.anon || process.env.SUPABASE_ANON_KEY || 'mock-anon',
      serviceKey: config.supabase?.service || process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service',
      bucket: config.supabase?.bucket || process.env.SUPABASE_BUCKET || 'wedding-photos'
    },
    cloudinary: {
      cloudName: config.cloudinary?.cloudName || process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: config.cloudinary?.apiKey || process.env.CLOUDINARY_API_KEY || '',
      apiSecret: config.cloudinary?.apiSecret || process.env.CLOUDINARY_API_SECRET || ''
    },
    imagekit: {
      publicKey: config.imagekit?.publicKey || process.env.IMAGEKIT_PUBLIC_KEY || '',
      privateKey: config.imagekit?.privateKey || process.env.IMAGEKIT_PRIVATE_KEY || '',
      urlEndpoint: config.imagekit?.urlEndpoint || process.env.IMAGEKIT_URL_ENDPOINT || ''
    },
    b2: {
      keyId: config.b2?.keyId || process.env.BACKBLAZE_KEY_ID || '',
      appKey: config.b2?.appKey || process.env.BACKBLAZE_APPLICATION_KEY || '',
      bucket: config.b2?.bucket || process.env.BACKBLAZE_BUCKET_NAME || 'photovault-reserve',
      endpoint: config.b2?.endpoint || process.env.BACKBLAZE_ENDPOINT || 'https://s3.us-west-004.backblazeb2.com'
    },
    firebase: {
      bucket: config.firebase?.bucket || process.env.FIREBASE_STORAGE_BUCKET || '',
      privateKey: config.firebase?.privateKey || process.env.FIREBASE_PRIVATE_KEY || ''
    },
    resend: {
      apiKey: config.resend?.apiKey || config.resend || process.env.RESEND_API_KEY || ''
    }
  };
}
