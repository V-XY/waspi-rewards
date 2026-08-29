export const publicConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
  tenantSlug: process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG || 'ebu-flow',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

export const serverConfig = {
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
  demoEnabled: process.env.DEMO_ENABLED === 'true',
  momo: {
    targetEnvironment: process.env.MTN_MOMO_TARGET_ENVIRONMENT || 'sandbox',
    baseUrl: process.env.MTN_MOMO_COLLECTION_BASE_URL || 'https://sandbox.momodeveloper.mtn.com',
    subscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY,
    apiUser: process.env.MTN_MOMO_API_USER,
    apiKey: process.env.MTN_MOMO_API_KEY,
    callbackHost: process.env.MTN_MOMO_CALLBACK_HOST,
  },
};
