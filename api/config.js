/**
 * PHOTOVAULT - Universal Safe Configuration Parser (100% Zero-Card Free Storages)
 * Clean 3-Tier Storage: Cloudinary (25GB) + ImageKit (20GB) + Supabase (1GB)
 * NO Firebase, NO Cloudflare R2, NO Debit/Credit Card Required!
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
      anonKey: config.supabase?.anon || process.env.SUPABASE_ANON_KEY || '',
      serviceKey: config.supabase?.service || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      bucket: config.supabase?.bucket || process.env.SUPABASE_BUCKET || 'photos'
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
    }
  };
}
